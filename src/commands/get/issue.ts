import { Args, Command, Flags } from '@oclif/core'

import { daemonGetIssue } from '../../daemon/daemon-get-issue.js'
import { daemonGetIssueByDisplayNumber } from '../../daemon/daemon-get-issue-by-display-number.js'
import { daemonIsInitialized } from '../../daemon/daemon-is-initialized.js'

/**
 * Get a single issue by ID or display number
 */
export default class GetIssue extends Command {
  static override args = {
    id: Args.string({
      description: 'Issue ID (UUID) or display number',
      required: true,
    }),
  }

  static override description = 'Get a single issue by ID or display number'

  static override examples = [
    '<%= config.bin %> get issue 1',
    '<%= config.bin %> get issue abc123-uuid',
    '<%= config.bin %> get issue 1 --json',
  ]

  static override flags = {
    json: Flags.boolean({
      description: 'Output as JSON',
      default: false,
    }),
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(GetIssue)
    const cwd = process.env['CENTY_CWD'] ?? process.cwd()

    const initStatus = await daemonIsInitialized({ projectPath: cwd })
    if (!initStatus.initialized) {
      this.error('.centy folder not initialized. Run "centy init" first.')
    }

    // Try to parse as display number first
    const displayNumber = Number.parseInt(args.id, 10)
    const isDisplayNumber = !Number.isNaN(displayNumber) && displayNumber > 0

    const issue = isDisplayNumber
      ? await daemonGetIssueByDisplayNumber({
          projectPath: cwd,
          displayNumber,
        })
      : await daemonGetIssue({
          projectPath: cwd,
          issueId: args.id,
        })

    if (flags.json) {
      this.log(JSON.stringify(issue, null, 2))
      return
    }

    const meta = issue.metadata
    this.log(`Issue #${issue.displayNumber}`)
    this.log(`ID: ${issue.id}`)
    this.log(`Title: ${issue.title}`)
    this.log(`Status: ${meta !== undefined ? meta.status : 'unknown'}`)
    this.log(
      `Priority: ${meta !== undefined ? (meta.priorityLabel !== '' ? meta.priorityLabel : `P${meta.priority}`) : 'P?'}`
    )
    this.log(`Created: ${meta !== undefined ? meta.createdAt : 'unknown'}`)
    this.log(`Updated: ${meta !== undefined ? meta.updatedAt : 'unknown'}`)
    if (issue.description) {
      this.log(`\nDescription:\n${issue.description}`)
    }
  }
}
