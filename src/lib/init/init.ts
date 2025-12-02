import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { daemonExecuteReconciliation } from '../../daemon/daemon-execute-reconciliation.js'
import { daemonGetReconciliationPlan } from '../../daemon/daemon-get-reconciliation-plan.js'
import type {
  ReconciliationDecisions as DaemonDecisions,
  FileInfo,
} from '../../daemon/types.js'
import type { InitOptions } from '../../types/init-options.js'
import type { InitResult } from '../../types/init-result.js'
import type { ReconciliationDecisions } from '../../types/reconciliation-decisions.js'
import { closePromptInterface } from '../../utils/close-prompt-interface.js'
import { createEmptyManifest } from '../../utils/create-empty-manifest.js'
import { createPromptInterface } from '../../utils/create-prompt-interface.js'
import { readManifest } from '../../utils/read-manifest.js'
import { writeManifest } from '../../utils/write-manifest.js'
import { VERSION } from '../../version.js'
import { buildReconciliationPlan } from './build-reconciliation-plan.js'
import { checkFolderExists } from './check-folder-exists.js'
import { executeReconciliation } from './execute-reconciliation.js'
import { outputSummary } from './output-summary.js'
import { promptForReset } from './prompt-for-reset.js'
import { promptForRestore } from './prompt-for-restore.js'

const CENTY_FOLDER = '.centy'

/**
 * Initialize a .centy folder
 * Tries daemon first, falls back to local implementation if daemon unavailable
 */
export async function init(options?: InitOptions): Promise<InitResult> {
  const opts = options ?? {}
  const cwd = opts.cwd ?? process.cwd()
  const centyPath = join(cwd, CENTY_FOLDER)
  const output = opts.output ?? process.stdout

  // Try daemon first, fallback to local if unavailable
  const daemonResult = await tryDaemonInit(cwd, centyPath, opts, output)
  if (daemonResult !== null) {
    return daemonResult
  }

  // Fallback to local implementation
  return localInit(cwd, centyPath, opts, output)
}

/**
 * Try to initialize using the daemon
 * Returns null if daemon is unavailable
 */
async function tryDaemonInit(
  cwd: string,
  centyPath: string,
  opts: InitOptions,
  output: NodeJS.WritableStream
): Promise<InitResult | null> {
  const result: InitResult = {
    success: false,
    centyPath,
    created: [],
    restored: [],
    reset: [],
    skipped: [],
    userFiles: [],
  }

  try {
    // Get reconciliation plan from daemon
    const plan = await daemonGetReconciliationPlan({ projectPath: cwd })

    output.write('Connected to centy daemon\n')

    // Convert daemon FileInfo to local format for prompts
    const filesToRestore = plan.toRestore.map(fileInfoToRestoreFormat)
    const filesToReset = plan.toReset.map(fileInfoToResetFormat)

    // Gather user decisions locally (prompts stay in CLI)
    const decisions = await gatherDecisions(
      { toRestore: filesToRestore, toReset: filesToReset },
      opts,
      output
    )

    // Convert decisions to daemon format
    const daemonDecisions: DaemonDecisions = {
      restore: decisions.restore,
      reset: decisions.reset,
    }

    // Execute reconciliation via daemon
    output.write('Initializing .centy folder...\n')
    const response = await daemonExecuteReconciliation({
      projectPath: cwd,
      decisions: daemonDecisions,
    })

    if (!response.success) {
      output.write(`Error: ${response.error}\n`)
      return result
    }

    result.success = true
    result.created = response.created
    result.restored = response.restored
    result.reset = response.reset
    result.skipped = [...response.skipped, ...decisions.skip]
    result.userFiles = plan.userFiles.map(f => f.path)

    outputSummary(output, result)
    return result
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)

    // If daemon is unavailable, return null to trigger fallback
    if (msg.includes('UNAVAILABLE') || msg.includes('ECONNREFUSED')) {
      return null
    }

    // Other errors should be reported
    output.write(`Error: ${msg}\n`)
    return result
  }
}

/**
 * Local implementation (fallback when daemon unavailable)
 */
async function localInit(
  cwd: string,
  centyPath: string,
  opts: InitOptions,
  output: NodeJS.WritableStream
): Promise<InitResult> {
  const result: InitResult = {
    success: false,
    centyPath,
    created: [],
    restored: [],
    reset: [],
    skipped: [],
    userFiles: [],
  }

  try {
    await ensureCentyFolder(centyPath, output)
    const manifest = await readManifest(centyPath)
    const plan = await buildReconciliationPlan(centyPath, manifest)
    const decisions = await gatherLocalDecisions(plan, opts, output)
    const baseManifest =
      manifest !== null ? manifest : createEmptyManifest(VERSION)
    const updatedManifest = await executeReconciliation(
      centyPath,
      plan,
      decisions,
      baseManifest
    )

    await writeManifest(centyPath, updatedManifest)

    result.success = true
    result.created = plan.toCreate
    result.restored = decisions.restore
    result.reset = decisions.reset
    result.skipped = decisions.skip
    result.userFiles = plan.userFiles

    outputSummary(output, result)
    return result
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    output.write(`Error: ${msg}\n`)
    return result
  }
}

async function ensureCentyFolder(
  centyPath: string,
  output: NodeJS.WritableStream
): Promise<void> {
  const folderExists = await checkFolderExists(centyPath)
  if (!folderExists) {
    output.write('Creating .centy folder...\n')
    await mkdir(centyPath, { recursive: true })
  } else {
    output.write('Found existing .centy folder. Checking for changes...\n')
  }
}

interface FileToRestore {
  path: string
  wasInManifest: boolean
}

interface FileToReset {
  path: string
  currentHash: string
  originalHash: string
}

function fileInfoToRestoreFormat(info: FileInfo): FileToRestore {
  return {
    path: info.path,
    wasInManifest: true,
  }
}

function fileInfoToResetFormat(info: FileInfo): FileToReset {
  return {
    path: info.path,
    currentHash: info.hash,
    originalHash: '',
  }
}

interface Plan {
  toRestore: FileToRestore[]
  toReset: FileToReset[]
}

interface LocalDecisions {
  restore: string[]
  reset: string[]
  skip: string[]
}

async function gatherDecisions(
  plan: Plan,
  opts: InitOptions,
  output: NodeJS.WritableStream
): Promise<LocalDecisions> {
  const decisions: LocalDecisions = {
    restore: [],
    reset: [],
    skip: [],
  }

  if (plan.toRestore.length > 0) {
    if (opts.force === true) {
      decisions.restore = plan.toRestore.map(f => f.path)
    } else {
      const rl = createPromptInterface(opts.input, opts.output)
      const restoreResult = await promptForRestore(rl, output, plan.toRestore)
      decisions.restore = restoreResult.restore
      decisions.skip.push(...restoreResult.skip)
      closePromptInterface(rl)
    }
  }

  if (plan.toReset.length > 0) {
    if (opts.force === true) {
      decisions.skip.push(...plan.toReset.map(f => f.path))
    } else {
      const rl = createPromptInterface(opts.input, opts.output)
      const resetResult = await promptForReset(rl, output, plan.toReset)
      decisions.reset = resetResult.reset
      decisions.skip.push(...resetResult.skip)
      closePromptInterface(rl)
    }
  }

  return decisions
}

interface LocalPlan {
  toRestore: Array<{ path: string; wasInManifest: boolean }>
  toReset: Array<{ path: string; currentHash: string; originalHash: string }>
}

async function gatherLocalDecisions(
  plan: LocalPlan,
  opts: InitOptions,
  output: NodeJS.WritableStream
): Promise<ReconciliationDecisions> {
  const decisions: ReconciliationDecisions = {
    restore: [],
    reset: [],
    skip: [],
  }

  if (plan.toRestore.length > 0) {
    if (opts.force === true) {
      decisions.restore = plan.toRestore.map(f => f.path)
    } else {
      const rl = createPromptInterface(opts.input, opts.output)
      const restoreResult = await promptForRestore(rl, output, plan.toRestore)
      decisions.restore = restoreResult.restore
      decisions.skip.push(...restoreResult.skip)
      closePromptInterface(rl)
    }
  }

  if (plan.toReset.length > 0) {
    if (opts.force === true) {
      decisions.skip.push(...plan.toReset.map(f => f.path))
    } else {
      const rl = createPromptInterface(opts.input, opts.output)
      const resetResult = await promptForReset(rl, output, plan.toReset)
      decisions.reset = resetResult.reset
      decisions.skip.push(...resetResult.skip)
      closePromptInterface(rl)
    }
  }

  return decisions
}
