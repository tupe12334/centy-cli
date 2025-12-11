import { describe, expect, it, vi, beforeEach } from 'vitest'
import { daemonGetReconciliationPlan } from './daemon-get-reconciliation-plan.js'

vi.mock('./load-proto.js', () => ({
  getDaemonClient: vi.fn(),
}))

import { getDaemonClient } from './load-proto.js'

describe('daemonGetReconciliationPlan', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should resolve with response on success', async () => {
    const mockResponse = { success: true }
    const mockClient = {
      getReconciliationPlan: vi.fn((_req, callback) => {
        callback(null, mockResponse)
      }),
    }
    vi.mocked(getDaemonClient).mockReturnValue(mockClient as never)

    const result = await daemonGetReconciliationPlan({} as never)

    expect(result).toEqual(mockResponse)
    expect(mockClient.getReconciliationPlan).toHaveBeenCalledWith(
      {},
      expect.any(Function)
    )
  })

  it('should reject with error on failure', async () => {
    const mockError = new Error('gRPC error')
    const mockClient = {
      getReconciliationPlan: vi.fn((_req, callback) => {
        callback(mockError, null)
      }),
    }
    vi.mocked(getDaemonClient).mockReturnValue(mockClient as never)

    await expect(daemonGetReconciliationPlan({} as never)).rejects.toThrow(
      'gRPC error'
    )
  })
})
