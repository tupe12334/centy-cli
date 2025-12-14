import type {
  ListTempWorkspacesRequest,
  ListTempWorkspacesResponse,
} from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * List all temporary workspaces
 */
export function daemonListTempWorkspaces(
  request: ListTempWorkspacesRequest
): Promise<ListTempWorkspacesResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().listTempWorkspaces(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
