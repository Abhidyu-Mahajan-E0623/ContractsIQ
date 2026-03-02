# Color Theme Change Plan (Orange/White -> ProcDNA Blue/White)

## Goal
Update the UI accent theme from orange to blue/white using the ProcDNA logo blue shade, and replace the sidebar bottom-left AI text block with the ProcDNA logo.

## Constraints
- Change only orange theme accents to blue.
- Do not modify non-orange colors (for example green success, red critical, purple category chips, neutral grays).
- Keep layout, spacing, and component structure unchanged.

## Blue Palette Source
- Use ProcDNA logo blue sampled from the provided logo asset.
- Primary brand blue: `#0052B3`
- Supporting blue (gradient/secondary): `#1F6ED4`
- Light blue surface: `#EAF3FF`
- Very light blue surface: `#F3F8FF`

## Implementation Steps
1. Add logo asset
- Add `assets/procdna-logo.png` and use it in the sidebar footer.

2. Replace sidebar footer text with logo
- In `index.html`, replace the `AI-Powered / Contract intelligence ready` block content with an `<img>` logo element.
- In `styles.css`, add minimal styles for logo sizing (`.sidebar-logo`) while preserving current container box dimensions.

3. Update global theme variables (targeted)
- In `styles.css` `:root`, change orange theme variables to blue equivalents:
  - `--accent-color`
  - `--accent-light`
  - `--status-expiring`
  - `--status-draft`

4. Update hardcoded orange accents only
- In `styles.css`, `index.html`, and `app.js`, replace orange hex tokens with mapped blue tokens.
- Restrict replacements to orange-family values only.
- Do not touch existing green/red/purple/gray tokens.

5. Verify scope
- Re-scan for remaining orange tokens.
- Confirm only orange-family values changed and non-orange palette remains intact.
- Confirm sidebar bottom-left displays logo image.

## Fixes for Expiring/Warning Colors
6. Revert wrongly replaced yellow/orange statuses
- `--status-expiring` and related `.status-badge.expiring` were incorrectly changed to blue; they should be yellow/amber (`#f59e0b`).
- `.alert-item.orange` backgrounds and text, and its badge, should be reverted to soft yellow/orange colors.
- In `app.js`, the "Expiring" slice of the Contract Status chart should be reverted from `#0052B3` to `#f59e0b` (amber).

## Further UI Polish
7. Fix logo and bounding box size
- Ensure `.sidebar-logo` fits properly within `.ai-powered-box`.
- Reduce padding or logo height to make the unit 40% shorter.

8. Fix Search Bar Icon Color
- In `app.js`'s `showAnswer` function, update the hardcoded `#0052B3` color of the sparkle icons (`fa-sparkles`) to `#f59e0b` (Expiring/Warning yellow).

9. Contracts Filter Pills Color
- In `styles.css`, update `.filter-pill:hover` and `.filter-pill.active` to use `#0052B3` instead of the legacy orange color (`#ea580c`).

10. Upload Modal Option Boxes Color
- In `styles.css`, update `.modal-option:hover` to use blue border and background colors, replacing the legacy orange.

11. Sidebar Active Tab Border and Badge Color
- In `index.html`, remove the inline style `border-left: 3px solid #ea580c;` from the "Alerts" navigation item and ensure we use the ProcDNA blue instead.
- Also, in `index.html`, change the "7" badge background from `#ea580c` to `#0052B3` or another suitable blue color in the inline styles for the nav item.

12. Alerts Page Reversion
- In `app.js`'s `renderAlerts()` function, revert the changes that incorrectly mapped "Expiring" and "Ending" alerts (Critical, High, Medium) to blue/gray tones.
- High severity alerts (e.g. Optum Data License) should be orange.
- Critical severity alerts (e.g. Deloitte contract) should be red.
- Ensure the data mappings in `syntheticData.alerts` match up with the CSS alert-items (`.alert-item.critical`, `.alert-item.orange`, `.alert-item.blue`, etc.).
