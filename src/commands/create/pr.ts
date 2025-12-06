import { Command, Flags } from '@oclif/core'

import { daemonCreatePr } from '../../daemon/daemon-create-pr.js'
import { daemonIsInitialized } from '../../daemon/daemon-is-initialized.js'

/**
 * Create a new pull request in the .centy/prs folder
 */
export default class CreatePr extends Command {
  static override description = 'Create a new pull request in the .centy folder'

  static override examples = [
    '<%= config.bin %> create pr',
    '<%= config.bin %> create pr --title "Add feature" --source feature-branch',
    '<%= config.bin %> create pr -t "Bug fix" -s bugfix/123 --target main',
    '<%= config.bin %> create pr -t "Feature" --issues 1,2 --reviewers alice,bob',
  ]

  static override flags = {
    title: Flags.string({
      char: 't',
      description: 'PR title',
      required: true,
    }),
    description: Flags.string({
      char: 'd',
      description: 'PR description',
    }),
    source: Flags.string({
      char: 's',
      description: 'Source branch name (auto-detected if not provided)',
    }),
    target: Flags.string({
      description: 'Target branch name (defaults to main)',
    }),
    issues: Flags.string({
      char: 'i',
      description: 'Linked issue IDs (comma-separated)',
    }),
    reviewers: Flags.string({
      char: 'r',
      description: 'Reviewers (comma-separated)',
    }),
    priority: Flags.string({
      char: 'p',
      description: 'Priority level (low/medium/high)',
      options: ['low', 'medium', 'high'],
    }),
    status: Flags.string({
      description: 'Initial status (draft/open)',
      options: ['draft', 'open'],
      default: 'draft',
    }),
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(CreatePr)
    const cwd = process.env['CENTY_CWD'] ?? process.cwd()

    const initStatus = await daemonIsInitialized({ projectPath: cwd })
    if (!initStatus.initialized) {
      this.error('.centy folder not initialized. Run "centy init" first.')
    }

    // Convert priority string to number
    const priorityMap: Record<string, number> = {
      high: 1,
      medium: 2,
      low: 3,
    }
    const priority = flags.priority ? priorityMap[flags.priority] : 0

    // Parse comma-separated lists
    const linkedIssues = flags.issues
      ? flags.issues.split(',').map(s => s.trim())
      : []
    const reviewers = flags.reviewers
      ? flags.reviewers.split(',').map(s => s.trim())
      : []

    const result = await daemonCreatePr({
      projectPath: cwd,
      title: flags.title,
      description: flags.description ?? '',
      sourceBranch: flags.source,
      targetBranch: flags.target,
      linkedIssues,
      reviewers,
      priority,
      status: flags.status ?? 'draft',
      customFields: {},
    })

    if (!result.success) {
      this.error(result.error ?? 'Failed to create PR')
    }

    this.log(`Created PR #${result.displayNumber}`)
    this.log(`ID: ${result.id}`)
    this.log(`Source branch: ${result.detectedSourceBranch}`)
    this.log(`\nFiles created:`)
    for (const file of result.createdFiles) {
      this.log(`  ${file}`)
    }
  }
}
