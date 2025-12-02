import { join } from 'node:path'
import type { CreateIssueOptions } from '../../types/create-issue-options.js'
import type { CreateIssueResult } from '../../types/create-issue-result.js'
import { readManifest } from '../../utils/read-manifest.js'
import { writeManifest } from '../../utils/write-manifest.js'
import { gatherIssueInput } from './gather-issue-input.js'
import { getConfigDefaults } from './get-config-defaults.js'
import { getNextIssueNumber } from './get-next-issue-number.js'
import { readConfig } from './read-config.js'
import { writeIssueFiles } from './write-issue-files.js'

const CENTY_FOLDER = '.centy'
const ISSUES_FOLDER = 'issues'

/**
 * Create a new issue in the .centy/issues folder
 */
export async function createIssue(
  options?: CreateIssueOptions
): Promise<CreateIssueResult> {
  const opts = options !== undefined ? options : {}
  const cwd = opts.cwd !== undefined ? opts.cwd : process.cwd()
  const centyPath = join(cwd, CENTY_FOLDER)
  const issuesPath = join(centyPath, ISSUES_FOLDER)
  const output = opts.output !== undefined ? opts.output : process.stdout

  // Check .centy folder exists
  const manifest = await readManifest(centyPath)
  if (manifest === null) {
    return {
      success: false,
      error: '.centy folder not initialized. Run "centy init" first.',
    }
  }

  // Read config and get defaults
  const config = await readConfig(centyPath)
  const configDefaults = getConfigDefaults(config)

  // Gather input (title and description)
  const input = await gatherIssueInput(opts, output)
  if (input.title === null) {
    return {
      success: false,
      error: 'Issue title is required',
    }
  }

  // Get next issue number
  const issueNumber = await getNextIssueNumber(issuesPath)

  // Determine status and priority
  const status =
    opts.status !== undefined ? opts.status : configDefaults.defaultStatus
  const priority =
    opts.priority !== undefined ? opts.priority : configDefaults.defaultPriority

  // Write issue files and update manifest
  const result = await writeIssueFiles({
    issuesPath,
    issueNumber,
    title: input.title,
    description: input.description,
    status,
    priority,
    customFields: opts.customFields,
    configCustomFields: configDefaults.customFields,
    manifest,
  })

  await writeManifest(centyPath, result.updatedManifest)

  output.write(`\nCreated issue #${issueNumber}\n`)
  output.write(`  ${result.issueMdPath}\n`)
  output.write(`  ${result.metadataPath}\n`)

  return {
    success: true,
    issueNumber,
    issuePath: result.issueFolderPath,
    issueMarkdownPath: result.issueMdPath,
    metadataPath: result.metadataPath,
  }
}
