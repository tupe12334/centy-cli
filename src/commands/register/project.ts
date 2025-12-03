import { Args, Command } from '@oclif/core'

import { daemonRegisterProject } from '../../daemon/daemon-register-project.js'

/**
 * Register a project for tracking
 */
export default class RegisterProject extends Command {
  static override args = {
    path: Args.string({
      description: 'Path to the project (defaults to current directory)',
      required: false,
    }),
  }

  static override description = 'Register a project for tracking'

  static override examples = [
    '<%= config.bin %> register project',
    '<%= config.bin %> register project /path/to/project',
  ]

  public async run(): Promise<void> {
    const { args } = await this.parse(RegisterProject)
    const projectPath = args.path ?? process.env['CENTY_CWD'] ?? process.cwd()

    const response = await daemonRegisterProject({
      projectPath,
    })

    if (!response.success) {
      this.error(response.error)
    }

    this.log(`Registered project "${response.project.name}"`)
    this.log(`  Path: ${response.project.path}`)
    this.log(`  Initialized: ${response.project.initialized ? 'yes' : 'no'}`)
  }
}
