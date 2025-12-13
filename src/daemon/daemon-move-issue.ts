import type { MoveIssueRequest, MoveIssueResponse } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Move an issue to a different project via daemon
 */
export function daemonMoveIssue(
  request: MoveIssueRequest
): Promise<MoveIssueResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().moveIssue(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
