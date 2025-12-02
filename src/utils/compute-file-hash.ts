import { readFile } from 'node:fs/promises'
import { computeHash } from './compute-hash.js'

/**
 * Compute SHA-256 hash of a file's contents
 */
export async function computeFileHash(filePath: string): Promise<string> {
  const content = await readFile(filePath, 'utf8')
  return computeHash(content)
}
