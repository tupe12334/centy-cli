/**
 * Types for daemon gRPC communication
 */

export interface InitRequest {
  projectPath: string
  force: boolean
  decisions?: ReconciliationDecisions
}

export interface InitResponse {
  success: boolean
  error: string
  created: string[]
  restored: string[]
  reset: string[]
  skipped: string[]
  manifest?: Manifest
}

export interface GetReconciliationPlanRequest {
  projectPath: string
}

export interface ReconciliationPlan {
  toCreate: FileInfo[]
  toRestore: FileInfo[]
  toReset: FileInfo[]
  upToDate: FileInfo[]
  userFiles: FileInfo[]
  needsDecisions: boolean
}

export interface ExecuteReconciliationRequest {
  projectPath: string
  decisions?: ReconciliationDecisions
}

export interface ReconciliationDecisions {
  restore: string[]
  reset: string[]
}

export interface FileInfo {
  path: string
  fileType: 'FILE_TYPE_UNSPECIFIED' | 'FILE_TYPE_FILE' | 'FILE_TYPE_DIRECTORY'
  hash: string
  contentPreview: string
}

export interface Manifest {
  schemaVersion: number
  centyVersion: string
  createdAt: string
  updatedAt: string
  managedFiles: ManagedFile[]
}

export interface ManagedFile {
  path: string
  hash: string
  version: string
  createdAt: string
  fileType: 'FILE_TYPE_UNSPECIFIED' | 'FILE_TYPE_FILE' | 'FILE_TYPE_DIRECTORY'
}

export interface IsInitializedRequest {
  projectPath: string
}

export interface IsInitializedResponse {
  initialized: boolean
  centyPath: string
}
