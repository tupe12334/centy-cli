import { describe, expect, it, vi, beforeEach } from 'vitest'
import { daemonUntrackProject } from './daemon-untrack-project.js'

vi.mock('./load-proto.js', () => ({
  getDaemonClient: vi.fn(),
}))

import { getDaemonClient } from './load-proto.js'

describe('daemonUntrackProject', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should resolve with response on success', async () => {
    const mockResponse = { success: true }
    const mockClient = {
      untrackProject: vi.fn((_req, callback) => {
        callback(null, mockResponse)
      }),
    }
    vi.mocked(getDaemonClient).mockReturnValue(mockClient as never)

    const result = await daemonUntrackProject({} as never)

    expect(result).toEqual(mockResponse)
    expect(mockClient.untrackProject).toHaveBeenCalledWith(
      {},
      expect.any(Function)
    )
  })

  it('should reject with error on failure', async () => {
    const mockError = new Error('gRPC error')
    const mockClient = {
      untrackProject: vi.fn((_req, callback) => {
        callback(mockError, null)
      }),
    }
    vi.mocked(getDaemonClient).mockReturnValue(mockClient as never)

    await expect(daemonUntrackProject({} as never)).rejects.toThrow(
      'gRPC error'
    )
  })
})
