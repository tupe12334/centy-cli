import type { CreateIssueOptions } from '../../types/create-issue-options.js'
import { closePromptInterface } from '../../utils/close-prompt-interface.js'
import { createPromptInterface } from '../../utils/create-prompt-interface.js'
import { promptForDescription } from './prompt-for-description.js'
import { promptForTitle } from './prompt-for-title.js'

interface GatherInputResult {
  title: string | null
  description: string
}

/**
 * Gather title and description from options or prompts
 */
export async function gatherIssueInput(
  opts: CreateIssueOptions,
  output: NodeJS.WritableStream
): Promise<GatherInputResult> {
  // Get title (prompt if not provided)
  let title: string | undefined = opts.title
  if (title === undefined) {
    const rl = createPromptInterface(opts.input, opts.output)
    title = await promptForTitle(rl, output)
    closePromptInterface(rl)
  }

  if (!title || title.trim() === '') {
    return { title: null, description: '' }
  }

  // Get description (prompt if not provided)
  let description = opts.description
  if (description === undefined) {
    const rl = createPromptInterface(opts.input, opts.output)
    description = await promptForDescription(rl, output)
    closePromptInterface(rl)
  }

  return { title, description: description !== undefined ? description : '' }
}
