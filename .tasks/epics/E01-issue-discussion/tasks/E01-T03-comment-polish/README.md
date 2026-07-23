# E01-T03 — Comment workflow polish

Status: `done`

## User outcome

Commenting stays clear and controllable from keyboard use through network
failure.

## Acceptance criteria

- Cmd/Ctrl+Enter submits the composer and saves an edit.
- Empty or whitespace-only comments cannot be submitted.
- Pending actions disable duplicate submissions.
- Failed loads can be retried and failed mutations preserve user text.
- Buttons and fields expose useful accessible names.
