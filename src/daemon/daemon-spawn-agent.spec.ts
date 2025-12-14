import { describe, expect, it, vi, beforeEach } from 'vitest'
// eslint-disable-next-line import/order
import { daemonSpawnAgent } from './daemon-spawn-agent.js'

vi.mock('./load-proto.js', () => ({
  getDaemonClient: vi.fn(),
}))

// eslint-disable-next-line import/first
import { getDaemonClient } from './load-proto.js'

describe('daemonSpawnAgent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should resolve with response on success', async () => {
    const mockResponse = {
      success: true,
      error: '',
      agentName: 'test-agent',
      issueId: 'issue-123',
      displayNumber: 42,
      promptPreview: 'Test prompt',
    }
    const mockClient = {
      spawnAgent: vi.fn((_req, callback) => {
        callback(null, mockResponse)
      }),
    }
    // eslint-disable-next-line no-restricted-syntax
    vi.mocked(getDaemonClient).mockReturnValue(mockClient as never)

    // eslint-disable-next-line no-restricted-syntax
    const result = await daemonSpawnAgent({} as never)

    expect(result).toEqual(mockResponse)
    expect(mockClient.spawnAgent).toHaveBeenCalledWith({}, expect.any(Function))
  })

  it('should reject with error on failure', async () => {
    const mockError = new Error('gRPC error')
    const mockClient = {
      spawnAgent: vi.fn((_req, callback) => {
        callback(mockError, null)
      }),
    }
    // eslint-disable-next-line no-restricted-syntax
    vi.mocked(getDaemonClient).mockReturnValue(mockClient as never)

    // eslint-disable-next-line no-restricted-syntax
    await expect(daemonSpawnAgent({} as never)).rejects.toThrow('gRPC error')
  })
})
