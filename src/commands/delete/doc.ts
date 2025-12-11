/* eslint-disable ddd/require-spec-file */
import { Args, Command, Flags } from '@oclif/core'

import { daemonDeleteDoc } from '../../daemon/daemon-delete-doc.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../../utils/ensure-initialized.js'

/**
 * Delete a doc
 */
export default class DeleteDoc extends Command {
  static override args = {
    slug: Args.string({
      description: 'Doc slug',
      required: true,
    }),
  }

  static override description = 'Delete a documentation file'

  static override examples = [
    '<%= config.bin %> delete doc getting-started',
    '<%= config.bin %> delete doc api-reference --force',
  ]

  static override flags = {
    force: Flags.boolean({
      char: 'f',
      description: 'Skip confirmation prompt',
      default: false,
    }),
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(DeleteDoc)
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
          `Are you sure you want to delete doc "${args.slug}"? (y/N) `,
          resolve
        )
      })
      rl.close()
      if (answer.toLowerCase() !== 'y') {
        this.log('Cancelled.')
        return
      }
    }

    const response = await daemonDeleteDoc({
      projectPath: cwd,
      slug: args.slug,
    })

    if (!response.success) {
      this.error(response.error)
    }

    this.log(`Deleted doc "${args.slug}"`)
  }
}
