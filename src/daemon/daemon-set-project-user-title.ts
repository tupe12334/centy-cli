import type {
  SetProjectUserTitleRequest,
  SetProjectUserTitleResponse,
} from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Set project user-scope title via daemon
 * This title is stored in ~/.centy/projects.json and is only visible to the current user
 */
export function daemonSetProjectUserTitle(
  request: SetProjectUserTitleRequest
): Promise<SetProjectUserTitleResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().setProjectUserTitle(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
