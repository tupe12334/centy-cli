import { describe, expect, it, vi } from 'vitest'

vi.mock('./load-proto.js', () => ({
  getDaemonClient: vi.fn(() => ({
    moveIssue: vi.fn(),
  })),
}))

describe('daemonMoveIssue', () => {
  it('should export the function', async () => {
    const { daemonMoveIssue } = await import('./daemon-move-issue.js')
    expect(typeof daemonMoveIssue).toBe('function')
  })
})
