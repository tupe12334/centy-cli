import { describe, expect, it, vi, beforeEach } from 'vitest'
import { daemonListOrganizations } from './daemon-list-organizations.js'

vi.mock('./load-proto.js', () => ({
  getDaemonClient: vi.fn(),
}))

import { getDaemonClient } from './load-proto.js'

describe('daemonListOrganizations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should resolve with response on success', async () => {
    const mockResponse = { organizations: [], totalCount: 0 }
    const mockClient = {
      listOrganizations: vi.fn((_req, callback) => {
        callback(null, mockResponse)
      }),
    }
    vi.mocked(getDaemonClient).mockReturnValue(mockClient as never)

    const result = await daemonListOrganizations({} as never)

    expect(result).toEqual(mockResponse)
    expect(mockClient.listOrganizations).toHaveBeenCalledWith(
      {},
      expect.any(Function)
    )
  })

  it('should reject with error on failure', async () => {
    const mockError = new Error('gRPC error')
    const mockClient = {
      listOrganizations: vi.fn((_req, callback) => {
        callback(mockError, null)
      }),
    }
    vi.mocked(getDaemonClient).mockReturnValue(mockClient as never)

    await expect(daemonListOrganizations({} as never)).rejects.toThrow(
      'gRPC error'
    )
  })
})
