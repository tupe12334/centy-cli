import { execSync } from 'node:child_process'
import { Command, Flags } from '@oclif/core'
import { getInstallScriptUrl } from '../../lib/install-script-url.js'

// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class InstallTui extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override description = 'Download and install the centy TUI binary'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> install tui',
    '<%= config.bin %> install tui --version 0.1.0',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    version: Flags.string({
      char: 'v',
      description: 'Specific version to install (default: latest)',
    }),
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(InstallTui)

    const env = {
      ...process.env,
      BINARIES: 'centy-tui',
      ...(flags.version ? { VERSION: flags.version } : {}),
    }

    this.log('Installing centy-tui...')

    try {
      execSync(`curl -fsSL ${getInstallScriptUrl()} | sh`, {
        stdio: 'inherit',
        env,
      })
      this.log('centy-tui installed successfully')
    } catch {
      this.error('Failed to install centy-tui')
    }
  }
}
