/**
 * Options for the init command
 */
export interface InitOptions {
  /** Working directory (defaults to process.cwd()) */
  cwd?: string
  /** Skip interactive prompts, use defaults */
  force?: boolean
  /** Input stream for prompts (defaults to process.stdin) */
  input?: NodeJS.ReadableStream
  /** Output stream for messages (defaults to process.stdout) */
  output?: NodeJS.WritableStream
}
