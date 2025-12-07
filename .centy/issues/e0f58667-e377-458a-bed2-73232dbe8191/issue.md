# Display issue UUID in TUI issue detail view

When viewing an issue in the TUI detail view, display the issue's UUID in the metadata section.

Currently the detail view shows status, priority, creation/update dates, custom fields, and description. The UUID (id field) is not displayed.

Add the issue UUID to the metadata section so users can see and copy the unique identifier when viewing issue details.

Implementation: Modify src/tui/components/domain/IssueDetail.tsx to add issue.id to the metadata section.
