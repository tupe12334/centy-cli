import { Args, Command, Flags } from '@oclif/core'

import { daemonGetProjectInfo } from '../../daemon/daemon-get-project-info.js'

/**
 * Get info about a specific project
 */
export default class GetProject extends Command {
  static override args = {
    path: Args.string({
      description: 'Path to the project (defaults to current directory)',
      required: false,
    }),
  }

  static override description = 'Get info about a specific project'

  static override examples = [
    '<%= config.bin %> get project',
    '<%= config.bin %> get project /path/to/project',
    '<%= config.bin %> get project --json',
  ]

  static override flags = {
    json: Flags.boolean({
      description: 'Output as JSON',
      default: false,
    }),
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(GetProject)
    const projectPath = args.path ?? process.env['CENTY_CWD'] ?? process.cwd()

    try {
      const response = await daemonGetProjectInfo({
        projectPath,
      })

      if (!response.found) {
        this.error(`Project not found at "${projectPath}"`)
      }

      if (flags.json) {
        this.log(JSON.stringify(response.project, null, 2))
        return
      }

      const project = response.project
      this.log(`Project: ${project.name}`)
      this.log(`  Path: ${project.path}`)
      this.log(`  Initialized: ${project.initialized ? 'yes' : 'no'}`)
      this.log(`  Issues: ${project.issueCount}`)
      this.log(`  Docs: ${project.docCount}`)
      this.log(`  First accessed: ${project.firstAccessed}`)
      this.log(`  Last accessed: ${project.lastAccessed}`)
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      if (msg.includes('UNAVAILABLE') || msg.includes('ECONNREFUSED')) {
        this.error(
          'Centy daemon is not running. Please start the daemon first.'
        )
      }
      this.error(msg)
    }
  }
}
