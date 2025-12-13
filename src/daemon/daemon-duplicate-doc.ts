import type { DuplicateDocRequest, DuplicateDocResponse } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Duplicate a doc (same or different project) via daemon
 */
export function daemonDuplicateDoc(
  request: DuplicateDocRequest
): Promise<DuplicateDocResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().duplicateDoc(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
