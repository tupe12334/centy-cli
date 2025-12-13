import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonListIssues = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()

vi.mock('../../daemon/daemon-list-issues.js', () => ({
  daemonListIssues: (...args: unknown[]) => mockDaemonListIssues(...args),
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

describe('ListIssues command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
    mockEnsureInitialized.mockResolvedValue('/test/project/.centy')
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./issues.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./issues.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  it('should list issues with default options', async () => {
    const { default: Command } = await import('./issues.js')
    mockDaemonListIssues.mockResolvedValue({
      issues: [
        { displayNumber: 1, title: 'Issue 1', status: 'open' },
        { displayNumber: 2, title: 'Issue 2', status: 'closed' },
      ],
    })

    const cmd = createMockCommand(Command, {
      flags: {},
    })

    await cmd.run()

    expect(mockEnsureInitialized).toHaveBeenCalledWith('/test/project')
    expect(mockDaemonListIssues).toHaveBeenCalled()
  })

  it('should filter by status', async () => {
    const { default: Command } = await import('./issues.js')
    mockDaemonListIssues.mockResolvedValue({
      issues: [{ displayNumber: 1, title: 'Issue 1', status: 'open' }],
    })

    const cmd = createMockCommand(Command, {
      flags: { status: 'open' },
    })

    await cmd.run()

    expect(mockDaemonListIssues).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'open',
      })
    )
  })

  it('should output JSON when json flag is set', async () => {
    const { default: Command } = await import('./issues.js')
    const issues = [{ displayNumber: 1, title: 'Test', status: 'open' }]
    mockDaemonListIssues.mockResolvedValue({ issues })

    const cmd = createMockCommand(Command, {
      flags: { json: true },
    })

    await cmd.run()

    expect(cmd.logs[0]).toBe(JSON.stringify(issues, null, 2))
  })

  it('should handle NotInitializedError', async () => {
    const { default: Command } = await import('./issues.js')
    const { NotInitializedError } =
      await import('../../utils/ensure-initialized.js')
    mockEnsureInitialized.mockRejectedValue(
      new NotInitializedError('Project not initialized')
    )

    const cmd = createMockCommand(Command, {
      flags: {},
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Project not initialized')
  })

  it('should use project flag to resolve path', async () => {
    const { default: Command } = await import('./issues.js')
    mockResolveProjectPath.mockResolvedValue('/other/project')
    mockDaemonListIssues.mockResolvedValue({ issues: [] })

    const cmd = createMockCommand(Command, {
      flags: { project: 'other-project' },
    })

    await cmd.run()

    expect(mockResolveProjectPath).toHaveBeenCalledWith('other-project')
    expect(mockEnsureInitialized).toHaveBeenCalledWith('/other/project')
  })
})
