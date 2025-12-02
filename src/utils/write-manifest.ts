import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { CentyManifest } from '../types/centy-manifest.js'

const MANIFEST_FILENAME = '.centy-manifest.json'

/**
 * Write manifest to .centy folder
 */
export async function writeManifest(
  centyPath: string,
  manifest: CentyManifest
): Promise<void> {
  const manifestPath = join(centyPath, MANIFEST_FILENAME)
  const content = JSON.stringify(manifest, null, 2)
  await writeFile(manifestPath, content, 'utf8')
}
