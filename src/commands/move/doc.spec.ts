import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonMoveDoc = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()

vi.mock('../../daemon/daemon-move-doc.js', () => ({
  daemonMoveDoc: (...args: unknown[]) => mockDaemonMoveDoc(...args),
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

describe('MoveDoc command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockEnsureInitialized.mockResolvedValue('/test/project/.centy')
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./doc.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./doc.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  it('should move doc to target project', async () => {
    const { default: Command } = await import('./doc.js')
    mockResolveProjectPath
      .mockResolvedValueOnce('/source/project')
      .mockResolvedValueOnce('/target/project')
    mockDaemonMoveDoc.mockResolvedValue({
      success: true,
      doc: { slug: 'my-doc', title: 'My Doc' },
      oldSlug: 'my-doc',
    })

    const cmd = createMockCommand(Command, {
      flags: { to: '/target/project' },
      args: { slug: 'my-doc' },
    })

    await cmd.run()

    expect(mockDaemonMoveDoc).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceProjectPath: '/source/project',
        slug: 'my-doc',
        targetProjectPath: '/target/project',
      })
    )
    expect(cmd.logs[0]).toContain('Moved doc')
  })

  it('should move doc with new slug', async () => {
    const { default: Command } = await import('./doc.js')
    mockResolveProjectPath
      .mockResolvedValueOnce('/source/project')
      .mockResolvedValueOnce('/target/project')
    mockDaemonMoveDoc.mockResolvedValue({
      success: true,
      doc: { slug: 'new-slug', title: 'My Doc' },
      oldSlug: 'old-slug',
    })

    const cmd = createMockCommand(Command, {
      flags: { to: '/target/project', 'new-slug': 'new-slug' },
      args: { slug: 'old-slug' },
    })

    await cmd.run()

    expect(mockDaemonMoveDoc).toHaveBeenCalledWith(
      expect.objectContaining({
        newSlug: 'new-slug',
      })
    )
  })

  it('should error when source and target are the same', async () => {
    const { default: Command } = await import('./doc.js')
    mockResolveProjectPath.mockResolvedValue('/same/project')

    const cmd = createMockCommand(Command, {
      flags: { to: '/same/project' },
      args: { slug: 'my-doc' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors[0]).toContain('cannot be the same')
  })

  it('should handle error response', async () => {
    const { default: Command } = await import('./doc.js')
    mockResolveProjectPath
      .mockResolvedValueOnce('/source/project')
      .mockResolvedValueOnce('/target/project')
    mockDaemonMoveDoc.mockResolvedValue({
      success: false,
      error: 'Doc not found',
    })

    const cmd = createMockCommand(Command, {
      flags: { to: '/target/project' },
      args: { slug: 'nonexistent' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Doc not found')
  })

  it('should handle NotInitializedError for source', async () => {
    const { default: Command } = await import('./doc.js')
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
      args: { slug: 'my-doc' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors[0]).toContain('Project not initialized')
  })
})
