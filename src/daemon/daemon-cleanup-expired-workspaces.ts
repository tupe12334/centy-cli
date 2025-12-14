import type {
  CleanupExpiredWorkspacesRequest,
  CleanupExpiredWorkspacesResponse,
} from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Cleanup all expired temporary workspaces
 */
export function daemonCleanupExpiredWorkspaces(
  request: CleanupExpiredWorkspacesRequest
): Promise<CleanupExpiredWorkspacesResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().cleanupExpiredWorkspaces(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
