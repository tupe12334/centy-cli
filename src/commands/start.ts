import { spawn } from 'node:child_process'

import { Command, Flags } from '@oclif/core'

import { checkDaemonConnection } from '../daemon/check-daemon-connection.js'
import { daemonBinaryExists } from '../lib/start/daemon-binary-exists.js'
import { findDaemonBinary } from '../lib/start/find-daemon-binary.js'
import { waitForDaemon } from '../lib/start/wait-for-daemon.js'

export default class Start extends Command {
  static override description = 'Start the centy daemon'

  static override examples = [
    '<%= config.bin %> start',
    '<%= config.bin %> start --foreground',
    '<%= config.bin %> start -f',
  ]

  static override flags = {
    foreground: Flags.boolean({
      char: 'f',
      description: 'Run daemon in foreground (blocks terminal)',
      default: false,
    }),
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(Start)

    const status = await checkDaemonConnection()
    if (status.connected) {
      this.log('Daemon is already running')
      return
    }

    const daemonPath = findDaemonBinary()
    if (!daemonBinaryExists(daemonPath)) {
      this.error(`Daemon binary not found at: ${daemonPath}`)
    }

    if (flags.foreground) {
      await this.startForeground(daemonPath)
    } else {
      await this.startBackground(daemonPath)
    }
  }

  private async startForeground(daemonPath: string): Promise<void> {
    this.log('Starting daemon in foreground mode...')

    const child = spawn(daemonPath, [], { stdio: 'inherit' })

    child.on('error', error => {
      this.handleSpawnError(error, daemonPath)
    })

    await new Promise<void>((resolve, reject) => {
      child.on('exit', code => {
        if (code === 0) {
          resolve()
        } else {
          reject(new Error(`Daemon exited with code ${code}`))
        }
      })
    })
  }

  private async startBackground(daemonPath: string): Promise<void> {
    this.log('Starting daemon in background...')

    const child = spawn(daemonPath, [], { detached: true, stdio: 'ignore' })

    child.on('error', error => {
      this.handleSpawnError(error, daemonPath)
    })

    child.unref()

    const started = await waitForDaemon()
    if (started) {
      this.log('Daemon started successfully')
    } else {
      this.error(
        'Daemon process started but is not responding. Check daemon logs for errors.'
      )
    }
  }

  private handleSpawnError(error: Error, daemonPath: string): void {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      this.error(
        `Could not find centy-daemon binary at: ${daemonPath}. ` +
          'Make sure the daemon is built and accessible.'
      )
    }
    this.error(`Failed to start daemon: ${error.message}`)
  }
}
