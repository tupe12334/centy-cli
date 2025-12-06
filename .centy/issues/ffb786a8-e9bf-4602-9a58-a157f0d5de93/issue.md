# Add option to create issues and docs from the TUI

Currently, the TUI only supports viewing/browsing issues and docs. Users should be able to create new issues and docs directly from the TUI interface.

## Current State

- TUI supports: viewing projects, issues, docs, assets, config, daemon management
- Issue/doc creation only available via CLI: `centy create issue` and `centy create doc`

## Proposed Feature

### Issue Creation

- Add keyboard shortcut (e.g., 'c' or 'n') in IssueList view to create a new issue
- Implement IssueCreate form/screen with fields for:
  - Title (required)
  - Description (optional, could open external editor)
  - Priority selection (low/medium/high)
  - Status (default to 'open')
- Add `createIssue` method to DaemonService

### Doc Creation

- Add keyboard shortcut in DocList view to create a new doc
- Implement DocCreate form/screen with fields for:
  - Title (required)
  - Slug (auto-generated from title, but editable)
  - Content (could open external editor for markdown)
- Add `createDoc` method to DaemonService

## Key Files to Modify

- `src/tui/services/daemon-service.ts` - add createIssue/createDoc methods
- `src/tui/components/domain/` - add IssueCreate.tsx, DocCreate.tsx
- `src/tui/types/views.ts` - add issue-create, doc-create view types
- `src/tui/components/domain/IssueList.tsx` - add 'c' shortcut
- `src/tui/components/domain/DocList.tsx` - add 'c' shortcut
