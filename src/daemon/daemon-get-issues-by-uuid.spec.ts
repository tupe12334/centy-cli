import { describe, expect, it, vi, beforeEach } from 'vitest'
import { daemonGetIssuesByUuid } from './daemon-get-issues-by-uuid.js'

vi.mock('./load-proto.js', () => ({
  getDaemonClient: vi.fn(),
}))

import { getDaemonClient } from './load-proto.js'

describe('daemonGetIssuesByUuid', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should resolve with response on success', async () => {
    const mockResponse = { success: true }
    const mockClient = {
      getIssuesByUuid: vi.fn((_req, callback) => {
        callback(null, mockResponse)
      }),
    }
    vi.mocked(getDaemonClient).mockReturnValue(mockClient as never)

    const result = await daemonGetIssuesByUuid({} as never)

    expect(result).toEqual(mockResponse)
    expect(mockClient.getIssuesByUuid).toHaveBeenCalledWith(
      {},
      expect.any(Function)
    )
  })

  it('should reject with error on failure', async () => {
    const mockError = new Error('gRPC error')
    const mockClient = {
      getIssuesByUuid: vi.fn((_req, callback) => {
        callback(mockError, null)
      }),
    }
    vi.mocked(getDaemonClient).mockReturnValue(mockClient as never)

    await expect(daemonGetIssuesByUuid({} as never)).rejects.toThrow(
      'gRPC error'
    )
  })
})
