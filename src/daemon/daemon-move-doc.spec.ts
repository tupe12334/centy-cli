import { describe, expect, it, vi } from 'vitest'

vi.mock('./load-proto.js', () => ({
  getDaemonClient: vi.fn(() => ({
    moveDoc: vi.fn(),
  })),
}))

describe('daemonMoveDoc', () => {
  it('should export the function', async () => {
    const { daemonMoveDoc } = await import('./daemon-move-doc.js')
    expect(typeof daemonMoveDoc).toBe('function')
  })
})
