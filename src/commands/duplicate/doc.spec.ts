import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../../testing/command-test-utils.js'

const mockDaemonDuplicateDoc = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockEnsureInitialized = vi.fn()

vi.mock('../../daemon/daemon-duplicate-doc.js', () => ({
  daemonDuplicateDoc: (...args: unknown[]) => mockDaemonDuplicateDoc(...args),
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

describe('DuplicateDoc command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
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

  it('should duplicate doc in same project', async () => {
    const { default: Command } = await import('./doc.js')
    mockDaemonDuplicateDoc.mockResolvedValue({
      success: true,
      doc: { slug: 'my-doc-copy', title: 'Copy of My Doc' },
    })

    const cmd = createMockCommand(Command, {
      flags: {},
      args: { slug: 'my-doc' },
    })

    await cmd.run()

    expect(mockDaemonDuplicateDoc).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceProjectPath: '/test/project',
        slug: 'my-doc',
        targetProjectPath: '/test/project',
      })
    )
    expect(cmd.logs[0]).toContain('Duplicated doc')
  })

  it('should duplicate doc with new slug', async () => {
    const { default: Command } = await import('./doc.js')
    mockDaemonDuplicateDoc.mockResolvedValue({
      success: true,
      doc: { slug: 'readme-v2', title: 'Readme V2' },
    })

    const cmd = createMockCommand(Command, {
      flags: { 'new-slug': 'readme-v2' },
      args: { slug: 'readme' },
    })

    await cmd.run()

    expect(mockDaemonDuplicateDoc).toHaveBeenCalledWith(
      expect.objectContaining({
        newSlug: 'readme-v2',
      })
    )
  })

  it('should handle error response', async () => {
    const { default: Command } = await import('./doc.js')
    mockDaemonDuplicateDoc.mockResolvedValue({
      success: false,
      error: 'Doc not found',
    })

    const cmd = createMockCommand(Command, {
      flags: {},
      args: { slug: 'nonexistent' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Doc not found')
  })

  it('should handle NotInitializedError', async () => {
    const { default: Command } = await import('./doc.js')
    const { NotInitializedError } =
      await import('../../utils/ensure-initialized.js')
    mockEnsureInitialized.mockRejectedValue(
      new NotInitializedError('Project not initialized')
    )

    const cmd = createMockCommand(Command, {
      flags: {},
      args: { slug: 'my-doc' },
    })

    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors[0]).toContain('Project not initialized')
  })
})
