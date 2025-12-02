/**
 * Generate the content for issue.md
 */
export function generateIssueMd(title: string, description: string): string {
  const lines = [`# ${title}`, '']

  if (description) {
    lines.push(description)
  }

  lines.push('') // Ensure trailing newline
  return lines.join('\n')
}
