import { Command, Flags } from '@oclif/core'

import { checkDaemonConnection } from '../daemon/check-daemon-connection.js'
import { init } from '../lib/init/index.js'

/**
 * Initialize a .centy folder in the current project
 */
export default class Init extends Command {
  static override description =
    'Initialize a .centy folder in the current project'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --force',
  ]

  static override flags = {
    force: Flags.boolean({
      char: 'f',
      description: 'Skip interactive prompts and use defaults',
      default: false,
    }),
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(Init)

    // Check daemon connection first
    const connectionStatus = await checkDaemonConnection()
    if (!connectionStatus.connected) {
      this.error(
        connectionStatus.error ??
          'Centy daemon is not running. Please start the daemon first.'
      )
    }

    // Allow CENTY_CWD env var to override working directory (for testing)
    const cwd = process.env['CENTY_CWD']

    const result = await init({ force: flags.force, cwd })

    if (!result.success) {
      this.exit(1)
    }
  }
}
