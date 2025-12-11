import { describe, expect, it, vi, beforeEach } from 'vitest'
import { daemonSetProjectFavorite } from './daemon-set-project-favorite.js'

vi.mock('./load-proto.js', () => ({
  getDaemonClient: vi.fn(),
}))

import { getDaemonClient } from './load-proto.js'

describe('daemonSetProjectFavorite', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should resolve with response on success', async () => {
    const mockResponse = { success: true }
    const mockClient = {
      setProjectFavorite: vi.fn((_req, callback) => {
        callback(null, mockResponse)
      }),
    }
    vi.mocked(getDaemonClient).mockReturnValue(mockClient as never)

    const result = await daemonSetProjectFavorite({} as never)

    expect(result).toEqual(mockResponse)
    expect(mockClient.setProjectFavorite).toHaveBeenCalledWith(
      {},
      expect.any(Function)
    )
  })

  it('should reject with error on failure', async () => {
    const mockError = new Error('gRPC error')
    const mockClient = {
      setProjectFavorite: vi.fn((_req, callback) => {
        callback(mockError, null)
      }),
    }
    vi.mocked(getDaemonClient).mockReturnValue(mockClient as never)

    await expect(daemonSetProjectFavorite({} as never)).rejects.toThrow(
      'gRPC error'
    )
  })
})
