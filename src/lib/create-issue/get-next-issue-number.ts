import { readdir } from 'node:fs/promises'

/**
 * Get the next available issue number (zero-padded 4 digits)
 */
export async function getNextIssueNumber(issuesPath: string): Promise<string> {
  try {
    const entries = await readdir(issuesPath, { withFileTypes: true })
    const issueNumbers = entries
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name)
      .filter(name => /^\d{4}$/.test(name))
      .map(name => parseInt(name, 10))

    const maxNumber = issueNumbers.length > 0 ? Math.max(...issueNumbers) : 0
    const nextNumber = maxNumber + 1
    return nextNumber.toString().padStart(4, '0')
  } catch {
    // If issues folder doesn't exist, start at 0001
    return '0001'
  }
}
