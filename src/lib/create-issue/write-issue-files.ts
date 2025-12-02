import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { CentyManifest } from '../../types/centy-manifest.js'
import type { CustomFieldDefinition } from '../../types/custom-field-definition.js'
import { addFileToManifest } from '../../utils/add-file-to-manifest.js'
import { computeHash } from '../../utils/compute-hash.js'
import { VERSION } from '../../version.js'
import { generateIssueMd } from './generate-issue-md.js'
import { generateMetadata } from './generate-metadata.js'

interface WriteIssueFilesParams {
  issuesPath: string
  issueNumber: string
  title: string
  description: string
  status: string
  priority: 'low' | 'medium' | 'high'
  customFields: Record<string, unknown> | undefined
  configCustomFields: Record<string, CustomFieldDefinition> | undefined
  manifest: CentyManifest
}

interface WriteIssueFilesResult {
  issueFolderPath: string
  issueMdPath: string
  metadataPath: string
  updatedManifest: CentyManifest
}

const ISSUES_FOLDER = 'issues'

/**
 * Create issue files and update manifest
 */
export async function writeIssueFiles(
  params: WriteIssueFilesParams
): Promise<WriteIssueFilesResult> {
  const issueFolderPath = join(params.issuesPath, params.issueNumber)
  const assetsPath = join(issueFolderPath, 'assets')

  // Create issue folder and assets subfolder
  await mkdir(issueFolderPath, { recursive: true })
  await mkdir(assetsPath, { recursive: true })

  // Generate and write issue.md
  const issueMdContent = generateIssueMd(params.title, params.description)
  const issueMdPath = join(issueFolderPath, 'issue.md')
  await writeFile(issueMdPath, issueMdContent, 'utf8')

  // Generate and write metadata.json
  const metadata = generateMetadata({
    status: params.status,
    priority: params.priority,
    customFields: params.customFields,
    configCustomFields: params.configCustomFields,
  })
  const metadataContent = JSON.stringify(metadata, null, 2) + '\n'
  const metadataPath = join(issueFolderPath, 'metadata.json')
  await writeFile(metadataPath, metadataContent, 'utf8')

  // Update manifest with new files
  const now = new Date().toISOString()
  let updatedManifest = addFileToManifest(params.manifest, {
    path: `${ISSUES_FOLDER}/${params.issueNumber}/issue.md`,
    hash: computeHash(issueMdContent),
    version: VERSION,
    createdAt: now,
    type: 'file',
  })

  updatedManifest = addFileToManifest(updatedManifest, {
    path: `${ISSUES_FOLDER}/${params.issueNumber}/metadata.json`,
    hash: computeHash(metadataContent),
    version: VERSION,
    createdAt: now,
    type: 'file',
  })

  updatedManifest = addFileToManifest(updatedManifest, {
    path: `${ISSUES_FOLDER}/${params.issueNumber}/assets/`,
    hash: '',
    version: VERSION,
    createdAt: now,
    type: 'directory',
  })

  return {
    issueFolderPath,
    issueMdPath,
    metadataPath,
    updatedManifest,
  }
}
