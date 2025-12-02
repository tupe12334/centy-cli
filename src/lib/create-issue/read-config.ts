import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { CentyConfig } from '../../types/centy-config.js'

/**
 * Read .centy/config.json
 * Returns null if config doesn't exist
 */
export async function readConfig(
  centyPath: string
): Promise<CentyConfig | null> {
  try {
    const configPath = join(centyPath, 'config.json')
    const content = await readFile(configPath, 'utf8')
    return JSON.parse(content) as CentyConfig
  } catch {
    return null
  }
}
