import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonMoveIssue = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()

vi.mock('../../daemon/daemon-move-issue.js', () => ({
  daemonMoveIssue: (...args: unknown[]) => mockDaemonMoveIssue(...args),
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

describe('MoveIssue command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
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

  it('should move issue to target project', async () => {
    const { default: Command } = await import('./issue.js')
    mockResolveProjectPath
      .mockResolvedValueOnce('/source/project')
      .mockResolvedValueOnce('/target/project')
    mockDaemonMoveIssue.mockResolvedValue({
      success: true,
      issue: { displayNumber: 5 },
      oldDisplayNumber: 1,
    })

    const cmd = createMockCommand(Command, {
      flags: { to: '/target/project' },
      args: { id: '1' },
    })

    await cmd.run()

    expect(mockDaemonMoveIssue).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceProjectPath: '/source/project',
        issueId: '1',
        targetProjectPath: '/target/project',
      })
    )
    expect(cmd.logs[0]).toContain('Moved issue')
  })

  it('should error when source and target are the same', async () => {
    const { default: Command } = await import('./issue.js')
    mockResolveProjectPath.mockResolvedValue('/same/project')

    const cmd = createMockCommand(Command, {
      flags: { to: '/same/project' },
      args: { id: '1' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors[0]).toContain('cannot be the same')
  })

  it('should handle error response', async () => {
    const { default: Command } = await import('./issue.js')
    mockResolveProjectPath
      .mockResolvedValueOnce('/source/project')
      .mockResolvedValueOnce('/target/project')
    mockDaemonMoveIssue.mockResolvedValue({
      success: false,
      error: 'Issue not found',
    })

    const cmd = createMockCommand(Command, {
      flags: { to: '/target/project' },
      args: { id: '999' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Issue not found')
  })

  it('should handle NotInitializedError for source', async () => {
    const { default: Command } = await import('./issue.js')
    const { NotInitializedError } =
      await import('../../utils/ensure-initialized.js')
    mockResolveProjectPath
      .mockResolvedValueOnce('/source/project')
      .mockResolvedValueOnce('/target/project')
    mockEnsureInitialized.mockRejectedValue(
      new NotInitializedError('Project not initialized')
    )

    const cmd = createMockCommand(Command, {
      flags: { to: '/target/project' },
      args: { id: '1' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors[0]).toContain('Project not initialized')
  })
})
