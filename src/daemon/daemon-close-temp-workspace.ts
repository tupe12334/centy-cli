import type {
  CloseTempWorkspaceRequest,
  CloseTempWorkspaceResponse,
} from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Close and remove a temporary workspace
 */
export function daemonCloseTempWorkspace(
  request: CloseTempWorkspaceRequest
): Promise<CloseTempWorkspaceResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().closeTempWorkspace(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
