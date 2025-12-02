import { writeFile, mkdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { computeHash } from './compute-hash.js'
import { computeFileHash } from './compute-file-hash.js'

describe('computeHash', () => {
  it('should return consistent SHA-256 hash for same input', () => {
    const input = 'hello world'
    const hash1 = computeHash(input)
    const hash2 = computeHash(input)
    expect(hash1).toBe(hash2)
  })

  it('should return different hashes for different inputs', () => {
    const hash1 = computeHash('hello')
    const hash2 = computeHash('world')
    expect(hash1).not.toBe(hash2)
  })

  it('should return a 64-character hex string', () => {
    const hash = computeHash('test')
    expect(hash).toMatch(/^[a-f0-9]{64}$/)
  })

  it('should handle empty string', () => {
    const hash = computeHash('')
    expect(hash).toMatch(/^[a-f0-9]{64}$/)
  })

  it('should handle unicode content', () => {
    const hash = computeHash('שלום עולם')
    expect(hash).toMatch(/^[a-f0-9]{64}$/)
  })
})

describe('computeFileHash', () => {
  let tempDir: string

  beforeEach(async () => {
    tempDir = join(tmpdir(), `centy-test-${Date.now()}`)
    await mkdir(tempDir, { recursive: true })
  })

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true })
  })

  it('should compute hash of file contents', async () => {
    const filePath = join(tempDir, 'test.txt')
    const content = 'hello world'
    await writeFile(filePath, content, 'utf8')

    const fileHash = await computeFileHash(filePath)
    const contentHash = computeHash(content)

    expect(fileHash).toBe(contentHash)
  })

  it('should throw error for non-existent file', async () => {
    const filePath = join(tempDir, 'nonexistent.txt')
    await expect(computeFileHash(filePath)).rejects.toThrow()
  })
})
