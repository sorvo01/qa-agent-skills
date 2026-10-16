# Session: <charter in one line>

- **Tester:** <name>   **Date:** <YYYY-MM-DD>   **Time box:** <60 min>   **Actual:** <min>
- **Build / URL:** <...>   **Browser / device:** <...>   **Accounts:** <roles used>
- **Heuristics chosen:** <e.g. Interruptions, Roles and ownership, Money>

## Notes

| Time | Tag | Note | Evidence |
|---|---|---|---|
| 10:02 | TEST | Viewer opens a shared project; Edit and Delete are hidden | |
| 10:06 | BUG | Bulk-actions menu still offers "Delete selected" to the Viewer | shot-01.png, POST /api/projects/bulk-delete 200 |
| 10:12 | ISSUE | CSV export as Viewer includes the private notes column: expected? | |
| 10:24 | IDEA | Separate charter: Editor demoted in the middle of a session | |

## Debrief

1. **Covered / not reached:** <...>
2. **Bugs:** <ID, title, severity>  **Issues:** <...>  **Ideas:** <...>
3. **Obstacles:** <...>
4. **Next session should explore:** <...>
5. **Confidence in this area:** <low / medium / high>, because <...>
