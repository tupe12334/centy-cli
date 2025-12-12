import type { DeletePlanRequest, DeletePlanResponse } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Delete plan via daemon
 */
export function daemonDeletePlan(
  request: DeletePlanRequest
): Promise<DeletePlanResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().deletePlan(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
