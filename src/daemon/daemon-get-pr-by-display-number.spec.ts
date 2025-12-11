import { describe, expect, it, vi, beforeEach } from 'vitest'
import { daemonGetPrByDisplayNumber } from './daemon-get-pr-by-display-number.js'

vi.mock('./load-proto.js', () => ({
  getDaemonClient: vi.fn(),
}))

import { getDaemonClient } from './load-proto.js'

describe('daemonGetPrByDisplayNumber', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should resolve with response on success', async () => {
    const mockResponse = { success: true }
    const mockClient = {
      getPrByDisplayNumber: vi.fn((_req, callback) => {
        callback(null, mockResponse)
      }),
    }
    vi.mocked(getDaemonClient).mockReturnValue(mockClient as never)

    const result = await daemonGetPrByDisplayNumber({} as never)

    expect(result).toEqual(mockResponse)
    expect(mockClient.getPrByDisplayNumber).toHaveBeenCalledWith(
      {},
      expect.any(Function)
    )
  })

  it('should reject with error on failure', async () => {
    const mockError = new Error('gRPC error')
    const mockClient = {
      getPrByDisplayNumber: vi.fn((_req, callback) => {
        callback(mockError, null)
      }),
    }
    vi.mocked(getDaemonClient).mockReturnValue(mockClient as never)

    await expect(daemonGetPrByDisplayNumber({} as never)).rejects.toThrow(
      'gRPC error'
    )
  })
})
