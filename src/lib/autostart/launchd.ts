import {
  existsSync,
  mkdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'
import { execSync } from 'node:child_process'

const LAUNCHD_LABEL = 'io.centy.daemon'
const PLIST_FILENAME = `${LAUNCHD_LABEL}.plist`

function getLaunchAgentsDir(): string {
  return join(homedir(), 'Library', 'LaunchAgents')
}

function getPlistPath(): string {
  return join(getLaunchAgentsDir(), PLIST_FILENAME)
}

function generatePlist(daemonPath: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>${LAUNCHD_LABEL}</string>
    <key>ProgramArguments</key>
    <array>
        <string>${daemonPath}</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <false/>
    <key>StandardOutPath</key>
    <string>${join(homedir(), '.centy', 'logs', 'daemon.stdout.log')}</string>
    <key>StandardErrorPath</key>
    <string>${join(homedir(), '.centy', 'logs', 'daemon.stderr.log')}</string>
</dict>
</plist>
`
}

function enableAutostart(daemonPath: string): void {
  const plistPath = getPlistPath()
  const launchAgentsDir = getLaunchAgentsDir()

  if (!existsSync(launchAgentsDir)) {
    mkdirSync(launchAgentsDir, { recursive: true })
  }

  const logsDir = join(homedir(), '.centy', 'logs')
  if (!existsSync(logsDir)) {
    mkdirSync(logsDir, { recursive: true })
  }

  if (existsSync(plistPath)) {
    try {
      execSync(`launchctl unload "${plistPath}"`, { stdio: 'ignore' })
    } catch {
      // Ignore errors if service wasn't loaded
    }
  }

  const plistContent = generatePlist(daemonPath)
  writeFileSync(plistPath, plistContent, 'utf-8')
  execSync(`launchctl load "${plistPath}"`)
}

function disableAutostart(): void {
  const plistPath = getPlistPath()

  if (!existsSync(plistPath)) {
    return
  }

  try {
    execSync(`launchctl unload "${plistPath}"`, { stdio: 'ignore' })
  } catch {
    // Ignore errors if service wasn't loaded
  }

  unlinkSync(plistPath)
}

function getAutostartStatus(): { enabled: boolean; daemonPath?: string } {
  const plistPath = getPlistPath()

  if (!existsSync(plistPath)) {
    return { enabled: false }
  }

  try {
    const content = readFileSync(plistPath, 'utf-8')
    const match = content.match(
      /<array>\s*<string>([^<]+)<\/string>\s*<\/array>/
    )
    const daemonPath = match ? match[1] : undefined
    return { enabled: true, daemonPath }
  } catch {
    return { enabled: true }
  }
}

export const launchdService = {
  enableAutostart,
  disableAutostart,
  getAutostartStatus,
}
