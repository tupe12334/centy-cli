import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonDeleteIssue = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()

vi.mock('../../daemon/daemon-delete-issue.js', () => ({
  daemonDeleteIssue: (...args: unknown[]) => mockDaemonDeleteIssue(...args),
}))

vi.mock('../../utils/resolve-project-path.js', () => ({
  resolveProjectPath: (...args: unknown[]) => mockResolveProjectPath(...args),
}))

vi.mock('../../utils/ensure-initialized.js', () => ({
  ensureInitialized: (...args: unknown[]) => mockEnsureInitialized(...args),
  NotInitializedError: class NotInitializedError extends Error {
    constructor(message = 'Not initialized') {
      super(message)
      this.name = 'NotInitializedError'
    }
  },
}))

describe('DeleteIssue command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
    mockEnsureInitialized.mockResolvedValue('/test/project/.centy')
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./issue.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./issue.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  it('should delete issue with force flag', async () => {
    const { default: Command } = await import('./issue.js')
    mockDaemonDeleteIssue.mockResolvedValue({ success: true })

    const cmd = createMockCommand(Command, {
      flags: { force: true },
      args: { id: '1' },
    })

    await cmd.run()

    expect(mockDaemonDeleteIssue).toHaveBeenCalledWith(
      expect.objectContaining({
        projectPath: '/test/project',
        issueId: '1',
      })
    )
    expect(cmd.logs[0]).toContain('Deleted issue 1')
  })

  it('should handle delete error', async () => {
    const { default: Command } = await import('./issue.js')
    mockDaemonDeleteIssue.mockResolvedValue({
      success: false,
      error: 'Issue not found',
    })

    const cmd = createMockCommand(Command, {
      flags: { force: true },
      args: { id: '999' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Issue not found')
  })

  it('should handle NotInitializedError', async () => {
    const { default: Command } = await import('./issue.js')
    const { NotInitializedError } =
      await import('../../utils/ensure-initialized.js')
    mockEnsureInitialized.mockRejectedValue(
      new NotInitializedError('Project not initialized')
    )

    const cmd = createMockCommand(Command, {
      flags: { force: true },
      args: { id: '1' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Project not initialized')
  })

  it('should use project flag to resolve path', async () => {
    const { default: Command } = await import('./issue.js')
    mockResolveProjectPath.mockResolvedValue('/other/project')
    mockDaemonDeleteIssue.mockResolvedValue({ success: true })

    const cmd = createMockCommand(Command, {
      flags: { force: true, project: 'other-project' },
      args: { id: '1' },
    })

    await cmd.run()

    expect(mockResolveProjectPath).toHaveBeenCalledWith('other-project')
    expect(mockEnsureInitialized).toHaveBeenCalledWith('/other/project')
  })
})
