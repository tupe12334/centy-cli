import { describe, expect, it, vi, beforeEach } from 'vitest'
// eslint-disable-next-line import/order
import { daemonDeletePlan } from './daemon-delete-plan.js'

vi.mock('./load-proto.js', () => ({
  getDaemonClient: vi.fn(),
}))

// eslint-disable-next-line import/first
import { getDaemonClient } from './load-proto.js'

describe('daemonDeletePlan', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should resolve with response on success', async () => {
    const mockResponse = { success: true }
    const mockClient = {
      deletePlan: vi.fn((_req, callback) => {
        callback(null, mockResponse)
      }),
    }
    // eslint-disable-next-line no-restricted-syntax
    vi.mocked(getDaemonClient).mockReturnValue(mockClient as never)

    // eslint-disable-next-line no-restricted-syntax
    const result = await daemonDeletePlan({} as never)

    expect(result).toEqual(mockResponse)
    expect(mockClient.deletePlan).toHaveBeenCalledWith({}, expect.any(Function))
  })

  it('should reject with error on failure', async () => {
    const mockError = new Error('gRPC error')
    const mockClient = {
      deletePlan: vi.fn((_req, callback) => {
        callback(mockError, null)
      }),
    }
    // eslint-disable-next-line no-restricted-syntax
    vi.mocked(getDaemonClient).mockReturnValue(mockClient as never)

    // eslint-disable-next-line no-restricted-syntax
    await expect(daemonDeletePlan({} as never)).rejects.toThrow('gRPC error')
  })
})
