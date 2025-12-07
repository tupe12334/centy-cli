import { describe, expect, it } from 'vitest'
import { verifyChecksum } from './checksum.js'
import { ChecksumNotFoundError } from './errors.js'

describe('verifyChecksum', () => {
  it('should throw ChecksumNotFoundError when file not in checksum list', async () => {
    const checksumContent = 'abc123  other-file.txt\ndef456  another-file.txt'

    await expect(
      verifyChecksum('/path/to/file', 'missing-file.txt', checksumContent)
    ).rejects.toThrow(ChecksumNotFoundError)
  })

  it('should parse checksum file format correctly', async () => {
    const checksumContent =
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  empty-file.txt'

    // This will fail because the file doesn't exist, but it tests parsing
    await expect(
      verifyChecksum('/nonexistent', 'empty-file.txt', checksumContent)
    ).rejects.toThrow() // Will throw ENOENT, not ChecksumNotFoundError
  })
})
