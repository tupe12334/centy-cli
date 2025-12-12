import type { UpdatePlanRequest, UpdatePlanResponse } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Update (create or modify) plan via daemon
 */
export function daemonUpdatePlan(
  request: UpdatePlanRequest
): Promise<UpdatePlanResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().updatePlan(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
