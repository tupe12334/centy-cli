import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { CentyManifest } from '../types/centy-manifest.js'

const MANIFEST_FILENAME = '.centy-manifest.json'

/**
 * Read manifest from .centy folder
 * Returns null if manifest doesn't exist
 */
export async function readManifest(
  centyPath: string
): Promise<CentyManifest | null> {
  try {
    const manifestPath = join(centyPath, MANIFEST_FILENAME)
    const content = await readFile(manifestPath, 'utf8')
    return JSON.parse(content) as CentyManifest
  } catch {
    return null
  }
}
