# Session: <charter in one line>

- **Tester:** <name>   **Date:** <YYYY-MM-DD>   **Time box:** <60 min>   **Actual:** <min>
- **Build / URL:** <...>   **Browser / device:** <...>   **Accounts:** <roles used>
- **Heuristics chosen:** <e.g. Interruptions, Roles and ownership, Money>

## Notes

| Time | Tag | Note | Evidence |
|---|---|---|---|
| 10:02 | TEST | Upgrade Membership → Supporter with no card on file | |
| 10:05 | BUG | Plan switched to Supporter, no charge, no card requested | shot-01.png, POST /api/subscription 200 |
| 10:09 | ISSUE | Billing history empty after upgrade: expected or missing? | |
| 10:15 | IDEA | Separate charter: downgrade and cancel timing | |

## Debrief

1. **Covered / not reached:** <...>
2. **Bugs:** <ID, title, severity>  **Issues:** <...>  **Ideas:** <...>
3. **Obstacles:** <...>
4. **Next session should explore:** <...>
5. **Confidence in this area:** <low / medium / high>, because <...>
