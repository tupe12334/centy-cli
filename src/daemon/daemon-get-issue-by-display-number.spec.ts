import { describe, expect, it, vi, beforeEach } from 'vitest'
import { daemonGetIssueByDisplayNumber } from './daemon-get-issue-by-display-number.js'

vi.mock('./load-proto.js', () => ({
  getDaemonClient: vi.fn(),
}))

import { getDaemonClient } from './load-proto.js'

describe('daemonGetIssueByDisplayNumber', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should resolve with response on success', async () => {
    const mockResponse = { success: true }
    const mockClient = {
      getIssueByDisplayNumber: vi.fn((_req, callback) => {
        callback(null, mockResponse)
      }),
    }
    vi.mocked(getDaemonClient).mockReturnValue(mockClient as never)

    const result = await daemonGetIssueByDisplayNumber({} as never)

    expect(result).toEqual(mockResponse)
    expect(mockClient.getIssueByDisplayNumber).toHaveBeenCalledWith(
      {},
      expect.any(Function)
    )
  })

  it('should reject with error on failure', async () => {
    const mockError = new Error('gRPC error')
    const mockClient = {
      getIssueByDisplayNumber: vi.fn((_req, callback) => {
        callback(mockError, null)
      }),
    }
    vi.mocked(getDaemonClient).mockReturnValue(mockClient as never)

    await expect(daemonGetIssueByDisplayNumber({} as never)).rejects.toThrow(
      'gRPC error'
    )
  })
})
