import { describe, expect, it, vi, beforeEach } from 'vitest'
import { daemonListDocs } from './daemon-list-docs.js'

vi.mock('./load-proto.js', () => ({
  getDaemonClient: vi.fn(),
}))

import { getDaemonClient } from './load-proto.js'

describe('daemonListDocs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should resolve with response on success', async () => {
    const mockResponse = { success: true }
    const mockClient = {
      listDocs: vi.fn((_req, callback) => {
        callback(null, mockResponse)
      }),
    }
    vi.mocked(getDaemonClient).mockReturnValue(mockClient as never)

    const result = await daemonListDocs({} as never)

    expect(result).toEqual(mockResponse)
    expect(mockClient.listDocs).toHaveBeenCalledWith({}, expect.any(Function))
  })

  it('should reject with error on failure', async () => {
    const mockError = new Error('gRPC error')
    const mockClient = {
      listDocs: vi.fn((_req, callback) => {
        callback(mockError, null)
      }),
    }
    vi.mocked(getDaemonClient).mockReturnValue(mockClient as never)

    await expect(daemonListDocs({} as never)).rejects.toThrow('gRPC error')
  })
})
