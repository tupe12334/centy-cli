import { execSync } from 'node:child_process'
import { Command, Flags } from '@oclif/core'
import { getInstallScriptUrl } from '../../lib/install-script-url.js'

// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class InstallAll extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override description =
    'Download and install all centy binaries (daemon and tui)'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = ['<%= config.bin %> install all']

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    version: Flags.string({
      char: 'v',
      description: 'Specific version to install (default: latest)',
    }),
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(InstallAll)

    const env = {
      ...process.env,
      ...(flags.version ? { VERSION: flags.version } : {}),
    }

    this.log('Installing all centy binaries...')

    try {
      execSync(`curl -fsSL ${getInstallScriptUrl()} | sh`, {
        stdio: 'inherit',
        env,
      })
      this.log('All centy binaries installed successfully')
    } catch {
      this.error('Failed to install centy binaries')
    }
  }
}
