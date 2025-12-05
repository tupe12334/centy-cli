#!/usr/bin/env bun
import { execute } from '@oclif/core'

// Check if running with no arguments (or just --interactive flag)
const args = process.argv.slice(2)
const hasCommand = args.length > 0 && !args[0].startsWith('-')
const isHelp = args.includes('--help') || args.includes('-h')
const isInteractive = args.includes('--interactive') || args.includes('-i')

// Launch TUI mode if no command provided (or explicit --interactive flag)
if ((!hasCommand && !isHelp) || isInteractive) {
  const { startTUI } = await import('../dist/tui/index.js')
  await startTUI()
} else {
  await execute({ dir: import.meta.url })
}
