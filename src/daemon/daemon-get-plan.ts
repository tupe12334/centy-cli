import type { GetPlanRequest, GetPlanResponse } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Get plan via daemon
 */
export function daemonGetPlan(
  request: GetPlanRequest
): Promise<GetPlanResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().getPlan(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
