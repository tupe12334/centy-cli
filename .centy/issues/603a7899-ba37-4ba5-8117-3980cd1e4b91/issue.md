# Add TUI issue editing capability

## Summary

Add the ability to edit existing issues directly in the TUI, following the same patterns used for issue creation.

## Current Behavior

- Issues can be viewed in `IssueDetail` view (read-only)
- Issues can be created via `IssueCreate` view
- No way to edit an existing issue in the TUI (must use CLI `centy update issue` command)

## Proposed Solution

### 1. New `IssueEdit` Component

Create a new `IssueEdit.tsx` component in `/src/tui/components/domain/` that:

- Pre-populates form with existing issue data
- Allows editing: title, description, priority, status
- Supports custom fields editing
- Uses same keyboard patterns as `IssueCreate`:
  - Tab/Shift+Tab to navigate between fields
  - Ctrl+S to save changes
  - Esc to cancel and return to IssueDetail

### 2. New View Type

Add `issue-edit` to the view system in `/src/tui/types/views.ts`

### 3. Navigation from IssueDetail

- Add 'e' keyboard shortcut in `IssueDetail.tsx` to enter edit mode
- Pass current issue data to the edit view

### 4. State Management

- Add `NAVIGATE_TO_ISSUE_EDIT` action or reuse existing navigation pattern
- Use existing `daemonService.updateIssue()` for saving changes

## Implementation Notes

- The daemon already supports issue updates via `daemon-update-issue.ts`
- `daemonService.updateIssue()` is already implemented
- Follow the form patterns established in `IssueCreate.tsx` and `ProjectCreate.tsx`

## Acceptance Criteria

- [ ] Can press 'e' in IssueDetail to enter edit mode
- [ ] All editable fields are pre-populated with current values
- [ ] Can modify title, description, priority, status
- [ ] Ctrl+S saves changes and returns to IssueDetail
- [ ] Esc cancels without saving
- [ ] Status bar shows appropriate keyboard hints
