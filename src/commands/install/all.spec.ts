import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMockCommand } from '../../testing/command-test-utils.js'

const mockExecSync = vi.fn()

vi.mock('node:child_process', () => ({
  execSync: (...args: unknown[]) => mockExecSync(...args),
}))

describe('InstallAll command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./all.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./all.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  it('should call install script without BINARIES filter', async () => {
    const { default: Command } = await import('./all.js')

    const cmd = createMockCommand(Command, {
      flags: {},
      args: {},
    })

    await cmd.run()

    expect(mockExecSync).toHaveBeenCalledWith(
      expect.stringContaining('curl -fsSL'),
      expect.objectContaining({
        stdio: 'inherit',
      })
    )
  })
})
