#!/usr/bin/env node

/**
 * Centy CLI - Project management via code
 */

import { init } from './commands/init/index.js'
import { getVersion } from './index.js'

async function main(): Promise<void> {
  const args = process.argv.slice(2)

  if (args.includes('--version') || args.includes('-v')) {
    console.log(`centy v${getVersion()}`)
    return
  }

  if (args.includes('--help') || args.includes('-h') || args.length === 0) {
    console.log(`
centy - Project management via code

Usage:
  centy [command] [options]

Commands:
  init          Initialize a .centy folder in the current project

Options:
  -v, --version Show version number
  -h, --help    Show help
  --force       Skip interactive prompts (for init command)

Examples:
  centy init              Initialize centy in current project
  centy init --force      Initialize without prompts
`)
    return
  }

  const command = args[0]

  if (command === 'init') {
    const force = args.includes('--force') || args.includes('-f')
    // Allow CENTY_CWD env var to override working directory (for testing)
    const env = process.env
    const cwd = env.CENTY_CWD
    const result = await init({ force, cwd })
    if (!result.success) {
      process.exit(1)
    }
    return
  }

  console.log(`Unknown command: ${args[0]}`)
  console.log('Run "centy --help" for usage information.')
  process.exit(1)
}

main().catch(error => {
  console.error(
    'Error:',
    error instanceof Error ? error.message : String(error)
  )
  process.exit(1)
})
