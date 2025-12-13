import { describe, expect, it, vi } from 'vitest'

vi.mock('./load-proto.js', () => ({
  getDaemonClient: vi.fn(() => ({
    duplicateIssue: vi.fn(),
  })),
}))

describe('daemonDuplicateIssue', () => {
  it('should export the function', async () => {
    const { daemonDuplicateIssue } = await import('./daemon-duplicate-issue.js')
    expect(typeof daemonDuplicateIssue).toBe('function')
  })
})
