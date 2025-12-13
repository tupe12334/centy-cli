import type { MoveDocRequest, MoveDocResponse } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Move a doc to a different project via daemon
 */
export function daemonMoveDoc(
  request: MoveDocRequest
): Promise<MoveDocResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().moveDoc(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
