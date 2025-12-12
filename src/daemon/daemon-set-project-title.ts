import type {
  SetProjectTitleRequest,
  SetProjectTitleResponse,
} from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Set project-scope title via daemon
 * This title is stored in .centy/project.json and is visible to all users (version-controlled)
 */
export function daemonSetProjectTitle(
  request: SetProjectTitleRequest
): Promise<SetProjectTitleResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().setProjectTitle(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
