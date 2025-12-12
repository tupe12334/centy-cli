import { describe, expect, it, vi, beforeEach } from 'vitest'
import { daemonGetOrganization } from './daemon-get-organization.js'

vi.mock('./load-proto.js', () => ({
  getDaemonClient: vi.fn(),
}))

import { getDaemonClient } from './load-proto.js'

describe('daemonGetOrganization', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should resolve with response on success', async () => {
    const mockResponse = { found: true }
    const mockClient = {
      getOrganization: vi.fn((_req, callback) => {
        callback(null, mockResponse)
      }),
    }
    vi.mocked(getDaemonClient).mockReturnValue(mockClient as never)

    const result = await daemonGetOrganization({} as never)

    expect(result).toEqual(mockResponse)
    expect(mockClient.getOrganization).toHaveBeenCalledWith(
      {},
      expect.any(Function)
    )
  })

  it('should reject with error on failure', async () => {
    const mockError = new Error('gRPC error')
    const mockClient = {
      getOrganization: vi.fn((_req, callback) => {
        callback(mockError, null)
      }),
    }
    vi.mocked(getDaemonClient).mockReturnValue(mockClient as never)

    await expect(daemonGetOrganization({} as never)).rejects.toThrow(
      'gRPC error'
    )
  })
})
