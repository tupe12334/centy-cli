import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GithubApiError, ReleaseNotFoundError } from './errors.js'
import type { GithubRelease } from './types.js'

// Mock Octokit
const mockGetLatestRelease = vi.fn()
const mockListReleases = vi.fn()
const mockGetReleaseByTag = vi.fn()

vi.mock('@octokit/rest', () => {
  return {
    Octokit: class MockOctokit {
      repos: {
        getLatestRelease: typeof mockGetLatestRelease
        listReleases: typeof mockListReleases
        getReleaseByTag: typeof mockGetReleaseByTag
      }
      constructor() {
        this.repos = {
          getLatestRelease: mockGetLatestRelease,
          listReleases: mockListReleases,
          getReleaseByTag: mockGetReleaseByTag,
        }
      }
    },
  }
})

// Import after mocking
const { fetchLatestRelease, fetchRelease } = await import('./github-api.js')

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})

// Sample release data
const mockRelease: GithubRelease = {
  tag_name: 'v0.1.0',
  assets: [
    {
      name: 'centy-daemon-x86_64-unknown-linux-gnu.tar.gz',
      browser_download_url:
        'https://github.com/centy-io/centy-daemon/releases/download/v0.1.0/centy-daemon-x86_64-unknown-linux-gnu.tar.gz',
    },
  ],
}

describe('fetchLatestRelease', () => {
  it('should return the latest stable release', async () => {
    mockGetLatestRelease.mockResolvedValueOnce({ data: mockRelease })

    const release = await fetchLatestRelease()

    expect(release).toEqual(mockRelease)
    expect(release).toHaveProperty('tag_name')
    expect(release).toHaveProperty('assets')
    expect(Array.isArray(release.assets)).toBe(true)
  })

  it('should fall back to pre-release when no stable release exists', async () => {
    const preRelease: GithubRelease = {
      tag_name: 'v0.1.0-beta.1',
      assets: [],
    }

    // First call returns 404 (no stable release)
    mockGetLatestRelease.mockRejectedValueOnce({ status: 404 })
    // Second call returns pre-releases list
    mockListReleases.mockResolvedValueOnce({ data: [preRelease] })

    const release = await fetchLatestRelease()

    expect(release).toEqual(preRelease)
  })

  it('should throw GithubApiError when no releases exist', async () => {
    // First call returns 404 (no stable release)
    mockGetLatestRelease.mockRejectedValueOnce({ status: 404 })
    // Second call returns empty array
    mockListReleases.mockResolvedValueOnce({ data: [] })

    await expect(fetchLatestRelease()).rejects.toThrow(
      'No releases found for centy-daemon'
    )
  })

  it('should throw GithubApiError on rate limit', async () => {
    mockGetLatestRelease.mockRejectedValueOnce({
      status: 403,
      message: 'rate limit exceeded',
    })

    await expect(fetchLatestRelease()).rejects.toThrow(GithubApiError)
  })

  it('should throw GithubApiError on server error', async () => {
    mockGetLatestRelease.mockRejectedValueOnce({
      status: 500,
      message: 'Internal Server Error',
    })

    await expect(fetchLatestRelease()).rejects.toThrow(GithubApiError)
  })
})

describe('fetchRelease', () => {
  it('should return a specific release by version', async () => {
    mockGetReleaseByTag.mockResolvedValueOnce({ data: mockRelease })

    const release = await fetchRelease('v0.1.0')

    expect(release).toEqual(mockRelease)
    expect(mockGetReleaseByTag).toHaveBeenCalledWith({
      owner: 'centy-io',
      repo: 'centy-daemon',
      tag: 'v0.1.0',
    })
  })

  it('should add v prefix if missing', async () => {
    mockGetReleaseByTag.mockResolvedValueOnce({ data: mockRelease })

    await fetchRelease('0.1.0')

    expect(mockGetReleaseByTag).toHaveBeenCalledWith({
      owner: 'centy-io',
      repo: 'centy-daemon',
      tag: 'v0.1.0',
    })
  })

  it('should throw ReleaseNotFoundError for non-existent version', async () => {
    mockGetReleaseByTag.mockRejectedValueOnce({ status: 404 })

    await expect(fetchRelease('v0.0.0-nonexistent')).rejects.toThrow(
      ReleaseNotFoundError
    )
  })

  it('should throw ReleaseNotFoundError with correct message', async () => {
    mockGetReleaseByTag.mockRejectedValueOnce({ status: 404 })

    await expect(fetchRelease('v0.0.0-nonexistent')).rejects.toThrow(
      'Release v0.0.0-nonexistent not found'
    )
  })

  it('should handle version without v prefix for non-existent release', async () => {
    mockGetReleaseByTag.mockRejectedValueOnce({ status: 404 })

    // Without v prefix - should still normalize and throw ReleaseNotFoundError
    await expect(fetchRelease('0.0.0-nonexistent')).rejects.toThrow(
      ReleaseNotFoundError
    )
  })

  it('should throw GithubApiError on rate limit (403)', async () => {
    mockGetReleaseByTag.mockRejectedValueOnce({
      status: 403,
      message: 'rate limit exceeded',
    })

    await expect(fetchRelease('v0.1.0')).rejects.toThrow(GithubApiError)
  })

  it('should throw GithubApiError on server error (500)', async () => {
    mockGetReleaseByTag.mockRejectedValueOnce({
      status: 500,
      message: 'Internal Server Error',
    })

    await expect(fetchRelease('v0.1.0')).rejects.toThrow(GithubApiError)
  })
})
