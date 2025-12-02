import { mkdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { getNextIssueNumber } from './get-next-issue-number.js'

describe('getNextIssueNumber', () => {
  let tempDir: string

  beforeEach(async () => {
    tempDir = join(tmpdir(), `centy-test-issue-${Date.now()}`)
    await mkdir(tempDir, { recursive: true })
  })

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true })
  })

  it('should return 0001 for empty folder', async () => {
    const result = await getNextIssueNumber(tempDir)
    expect(result).toBe('0001')
  })

  it('should return 0001 for non-existent folder', async () => {
    const result = await getNextIssueNumber(join(tempDir, 'nonexistent'))
    expect(result).toBe('0001')
  })

  it('should return next number after existing issues', async () => {
    await mkdir(join(tempDir, '0001'))
    await mkdir(join(tempDir, '0002'))
    const result = await getNextIssueNumber(tempDir)
    expect(result).toBe('0003')
  })

  it('should handle gaps in numbering', async () => {
    await mkdir(join(tempDir, '0001'))
    await mkdir(join(tempDir, '0005'))
    const result = await getNextIssueNumber(tempDir)
    expect(result).toBe('0006')
  })

  it('should ignore non-numeric folders', async () => {
    await mkdir(join(tempDir, '0001'))
    await mkdir(join(tempDir, 'not-an-issue'))
    await mkdir(join(tempDir, '123')) // wrong format (3 digits)
    const result = await getNextIssueNumber(tempDir)
    expect(result).toBe('0002')
  })

  it('should ignore files (only count directories)', async () => {
    await mkdir(join(tempDir, '0001'))
    // Create a file named like an issue number
    const { writeFile } = await import('node:fs/promises')
    await writeFile(join(tempDir, '0002'), 'test')
    const result = await getNextIssueNumber(tempDir)
    expect(result).toBe('0002')
  })
})
