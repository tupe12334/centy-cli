import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ReleaseNotFoundError } from './errors.js'
import type { GithubRelease } from './types.js'

// Use vi.hoisted so mocks are available when vi.mock is hoisted
const { mockFetchRelease, mockFetchLatestRelease } = vi.hoisted(() => ({
  mockFetchRelease: vi.fn(),
  mockFetchLatestRelease: vi.fn(),
}))

vi.mock('./github-api.js', () => ({
  fetchRelease: mockFetchRelease,
  fetchLatestRelease: mockFetchLatestRelease,
}))

// Import after mocking
const { installDaemon } = await import('./install-daemon.js')

// Mock release data (empty assets to trigger "no binary found" quickly)
const mockRelease: GithubRelease = {
  tag_name: 'v0.1.0',
  assets: [],
}

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('installDaemon', () => {
  it('should return result with success property', async () => {
    mockFetchRelease.mockResolvedValueOnce(mockRelease)

    const result = await installDaemon({
      version: '0.1.0',
      force: true,
    })

    expect(result).toHaveProperty('success')
    expect(typeof result.success).toBe('boolean')
  })

  it('should return error for non-existent version', async () => {
    mockFetchRelease.mockRejectedValueOnce(
      new ReleaseNotFoundError('v0.0.0-nonexistent')
    )

    const result = await installDaemon({
      version: '0.0.0-nonexistent',
      force: true,
    })

    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
    expect(result.error).toContain('v0.0.0-nonexistent')
  })

  it('should accept custom log functions', async () => {
    mockFetchRelease.mockResolvedValueOnce(mockRelease)

    const logs: string[] = []
    const warnings: string[] = []

    await installDaemon({
      version: '0.1.0',
      force: true,
      log: msg => logs.push(msg),
      warn: msg => warnings.push(msg),
    })

    expect(logs.length).toBeGreaterThan(0)
  })

  it('should use fetchLatestRelease when no version specified', async () => {
    mockFetchLatestRelease.mockResolvedValueOnce(mockRelease)

    await installDaemon({ force: true })

    expect(mockFetchLatestRelease).toHaveBeenCalledOnce()
    expect(mockFetchRelease).not.toHaveBeenCalled()
  })

  it('should use fetchRelease when version is specified', async () => {
    mockFetchRelease.mockResolvedValueOnce(mockRelease)

    await installDaemon({ version: '0.1.0', force: true })

    expect(mockFetchRelease).toHaveBeenCalledWith('0.1.0')
    expect(mockFetchLatestRelease).not.toHaveBeenCalled()
  })
})
