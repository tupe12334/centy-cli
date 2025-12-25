import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMockCommand } from '../../testing/command-test-utils.js'

const mockExecSync = vi.fn()

vi.mock('node:child_process', () => ({
  execSync: (...args: unknown[]) => mockExecSync(...args),
}))

describe('InstallTui command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./tui.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./tui.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  it('should call install script with BINARIES=centy-tui', async () => {
    const { default: Command } = await import('./tui.js')

    const cmd = createMockCommand(Command, {
      flags: {},
      args: {},
    })

    await cmd.run()

    expect(mockExecSync).toHaveBeenCalledWith(
      expect.stringContaining('curl -fsSL'),
      expect.objectContaining({
        env: expect.objectContaining({ BINARIES: 'centy-tui' }),
      })
    )
  })
})
