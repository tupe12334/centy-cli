import { describe, expect, it } from 'vitest'
import { extractArchive } from './extract.js'

describe('extractArchive', () => {
  it('should throw error for non-existent tar.gz file', async () => {
    await expect(
      extractArchive('/nonexistent/file.tar.gz', '/tmp', 'tar.gz')
    ).rejects.toThrow()
  })

  it('should throw error for non-existent zip file', async () => {
    await expect(
      extractArchive('/nonexistent/file.zip', '/tmp', 'zip')
    ).rejects.toThrow()
  })
})
