/* eslint-disable ddd/require-spec-file */
import { Args, Command, Flags } from '@oclif/core'

import { daemonDeletePr } from '../../daemon/daemon-delete-pr.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../../utils/ensure-initialized.js'

/**
 * Delete a pull request
 */
export default class DeletePr extends Command {
  static override args = {
    id: Args.string({
      description: 'PR ID (UUID) or display number',
      required: true,
    }),
  }

  static override description = 'Delete a pull request'

  static override examples = [
    '<%= config.bin %> delete pr 1',
    '<%= config.bin %> delete pr abc123-uuid',
    '<%= config.bin %> delete pr 1 --force',
  ]

  static override flags = {
    force: Flags.boolean({
      char: 'f',
      description: 'Skip confirmation prompt',
      default: false,
    }),
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(DeletePr)
    const cwd = process.env['CENTY_CWD'] ?? process.cwd()

    try {
      await ensureInitialized(cwd)
    } catch (error) {
      if (error instanceof NotInitializedError) {
        this.error(error.message)
      }
      throw error instanceof Error ? error : new Error(String(error))
    }

    if (!flags.force) {
      const readline = await import('node:readline')
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      })
      const answer = await new Promise<string>(resolve => {
        rl.question(
          `Are you sure you want to delete PR ${args.id}? (y/N) `,
          resolve
        )
      })
      rl.close()
      if (answer.toLowerCase() !== 'y') {
        this.log('Cancelled.')
        return
      }
    }

    const response = await daemonDeletePr({
      projectPath: cwd,
      prId: args.id,
    })

    if (!response.success) {
      this.error(response.error)
    }

    this.log(`Deleted PR ${args.id}`)
  }
}
