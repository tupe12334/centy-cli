import { describe, expect, it, vi } from 'vitest'

vi.mock('./load-proto.js', () => ({
  getDaemonClient: vi.fn(() => ({
    duplicateDoc: vi.fn(),
  })),
}))

describe('daemonDuplicateDoc', () => {
  it('should export the function', async () => {
    const { daemonDuplicateDoc } = await import('./daemon-duplicate-doc.js')
    expect(typeof daemonDuplicateDoc).toBe('function')
  })
})
