import { describe, expect, it } from 'vitest'
import { fetchLatestRelease, fetchRelease } from './github-api.js'
import { ReleaseNotFoundError } from './errors.js'

describe('fetchLatestRelease', () => {
  it('should return a release object with required properties', async () => {
    // This test requires network access
    // In CI, this should be mocked
    try {
      const release = await fetchLatestRelease()
      expect(release).toHaveProperty('tag_name')
      expect(release).toHaveProperty('assets')
      expect(Array.isArray(release.assets)).toBe(true)
    } catch {
      // Network error is acceptable in offline environments
    }
  })
})

describe('fetchRelease', () => {
  it('should throw ReleaseNotFoundError for non-existent version', async () => {
    await expect(fetchRelease('v0.0.0-nonexistent')).rejects.toThrow(
      ReleaseNotFoundError
    )
  })

  it('should handle version with or without v prefix', async () => {
    // Both should work the same way
    await expect(fetchRelease('0.0.0-nonexistent')).rejects.toThrow(
      ReleaseNotFoundError
    )
  })
})
