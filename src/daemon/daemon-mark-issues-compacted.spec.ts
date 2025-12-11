import { describe, expect, it, vi, beforeEach } from 'vitest'
import { daemonMarkIssuesCompacted } from './daemon-mark-issues-compacted.js'

vi.mock('./load-proto.js', () => ({
  getDaemonClient: vi.fn(),
}))

import { getDaemonClient } from './load-proto.js'

describe('daemonMarkIssuesCompacted', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should resolve with response on success', async () => {
    const mockResponse = { success: true }
    const mockClient = {
      markIssuesCompacted: vi.fn((_req, callback) => {
        callback(null, mockResponse)
      }),
    }
    vi.mocked(getDaemonClient).mockReturnValue(mockClient as never)

    const result = await daemonMarkIssuesCompacted({} as never)

    expect(result).toEqual(mockResponse)
    expect(mockClient.markIssuesCompacted).toHaveBeenCalledWith(
      {},
      expect.any(Function)
    )
  })

  it('should reject with error on failure', async () => {
    const mockError = new Error('gRPC error')
    const mockClient = {
      markIssuesCompacted: vi.fn((_req, callback) => {
        callback(mockError, null)
      }),
    }
    vi.mocked(getDaemonClient).mockReturnValue(mockClient as never)

    await expect(daemonMarkIssuesCompacted({} as never)).rejects.toThrow(
      'gRPC error'
    )
  })
})
