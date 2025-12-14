# Add link display and management to TUI

The issue linking feature is implemented in the daemon and web app (Issue #38).

Need to add TUI support:

- Display links section in IssueDetail, DocDetail, PRDetail views
- Add link management (create/delete) in TUI mode
- Follow existing TUI patterns from IssueDetail.tsx

Files to modify:

- src/tui/components/domain/IssueDetail.tsx
- src/tui/components/domain/DocDetail.tsx (if exists)
- src/tui/components/domain/PRDetail.tsx

May need new components:

- src/tui/components/domain/LinkSection.tsx
- src/tui/hooks/useLinks.ts
