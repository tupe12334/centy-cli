# Add configurable sorting options to TUI Issues list view

Allow users to configure how issues are sorted in the TUI Issues list view. The default should be sorting by priority (highest first), but users should be able to choose other sort options.

## Sorting Options to Include

- **Priority** (default) - highest priority first
- **Display number** - sequential issue number
- **Created date** - newest or oldest first
- **Updated date** - most recently updated first
- **Status** - grouped by status

## Requirements

1. Add keyboard shortcut to cycle through sort options (e.g., `s` key)
2. Display current sort mode in the UI header or status bar
3. **Persistence**: Store sort preference in a new `config.local.json` file (user-specific, not committed to repo)
4. Sorting should be done client-side in the TUI component

## Implementation Notes

**Key Files to Modify**:

- `src/tui/components/domain/IssueList.tsx` - Add sorting logic and UI
- `src/tui/state/app-state.tsx` - Add sort preference state
- New: `config.local.json` file for persisting user preferences

**Current State**:

- Issues are currently sorted by `displayNumber` server-side in daemon
- No user configuration for sorting preferences exists
- Available fields: `displayNumber`, `priority`, `status`, `createdAt`, `updatedAt`, `title`
