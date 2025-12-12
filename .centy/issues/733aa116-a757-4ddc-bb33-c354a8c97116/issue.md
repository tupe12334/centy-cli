# Add TUI support for move/duplicate issues and docs

## Summary

Add TUI (Terminal User Interface) support for moving and duplicating issues and docs between projects.

## Background

The daemon now supports these operations via gRPC:

- `MoveIssue` / `DuplicateIssue` - Transfer/copy issues between projects
- `MoveDoc` / `DuplicateDoc` - Transfer/copy docs between projects

Related: centy-daemon Issue #43, CLI Issue for move/duplicate commands

## Features to implement

### 1. Keyboard shortcuts in IssueDetail view

Add new keybindings:

- `m` - Move issue to another project (opens project selector)
- `D` (shift+d) - Duplicate issue (opens dialog with options)

### 2. Keyboard shortcuts in DocDetail view

Add new keybindings:

- `m` - Move doc to another project
- `D` (shift+d) - Duplicate doc

### 3. Project selector modal

When moving/duplicating to another project:

- Show list of available projects (from daemon registry)
- Filter/search projects
- Highlight current project (not selectable for move)
- Show project path on selection

### 4. Duplicate dialog

Options for duplicate:

- Target project (dropdown/selector)
- New title (text input, default: "Copy of {original}")
- For docs: new slug (text input, default: "{slug}-copy")

### 5. Feedback

- Show success message with new display number/slug
- On move: auto-navigate to target project's item
- On duplicate in same project: show link to new item
- Show error message if operation fails

## Implementation details

### Files to modify

- `src/tui/components/domain/IssueDetail.tsx` - Add move/duplicate keybindings
- `src/tui/components/domain/DocDetail.tsx` - Add move/duplicate keybindings

### New components

- `src/tui/components/domain/ProjectSelector.tsx` - Modal for selecting target project
- `src/tui/components/domain/DuplicateDialog.tsx` - Dialog for duplicate options

### Services

- `src/tui/services/daemon-service.ts` - Add moveIssue, duplicateIssue, moveDoc, duplicateDoc methods

### Help text

- Update help panel to show new keybindings
