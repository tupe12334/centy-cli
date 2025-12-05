/**
 * View/route definitions for the TUI
 */

export type ViewId =
  | 'projects'
  | 'issues'
  | 'issue-detail'
  | 'issue-create'
  | 'docs'
  | 'doc-detail'
  | 'doc-create'
  | 'assets'
  | 'config'
  | 'daemon'
  | 'help'

export interface ViewParams {
  issueId?: string
  docSlug?: string
}

export const VIEW_LABELS: Record<ViewId, string> = {
  projects: 'Projects',
  issues: 'Issues',
  'issue-detail': 'Issue Detail',
  'issue-create': 'New Issue',
  docs: 'Docs',
  'doc-detail': 'Doc Detail',
  'doc-create': 'New Doc',
  assets: 'Assets',
  config: 'Config',
  daemon: 'Daemon',
  help: 'Help',
}

export const SIDEBAR_VIEWS: ViewId[] = [
  'projects',
  'issues',
  'docs',
  'assets',
  'config',
  'daemon',
]
