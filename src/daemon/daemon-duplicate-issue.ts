import type { DuplicateIssueRequest, DuplicateIssueResponse } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Duplicate an issue (same or different project) via daemon
 */
export function daemonDuplicateIssue(
  request: DuplicateIssueRequest
): Promise<DuplicateIssueResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().duplicateIssue(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
