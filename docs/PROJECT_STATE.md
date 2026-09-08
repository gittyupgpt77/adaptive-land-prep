# Project state

Verified takeover production: c0fbf35ffaf3afc6150c1162811cb4c29ee6478a (PR #13), Consumer Audit and Pages successful; production app.js/index.html/styles.css/service-worker.js matched exactly.

Current nutrition increment: next meal action, immediate saved meal progress, explicit completion separate from partial logging, and complete-day-only downstream fueling. Preserve existing four base meals through Week 24 and five afterward, plus adaptive additions.

Known limitations: recipe calories are template estimates, not ingredient-derived; full-plan macro inference remains the established target estimate. Precise ingredients, substitutions, preparation and grocery generation need a nutrient-backed model. Current-day prescriptions may still change following updated check-ins; confirmed meal snapshots need stronger versioning. Manual deviations are full-day totals, not meal-level edits.

Settings increment: Program → Settings reuses existing account, private backup and device recovery controls. Signed-in password reset uses provider email. Explicit Day 1 survives startup even without history. Restart needs an archived Journey epoch with atomic rollback and backup support; changing programStart alone would contaminate qualification and date-based records.

Nutrition evidence: ISSN protein position stand https://link.springer.com/article/10.1186/s12970-017-0177-8 supports distributed protein about every 3–4 hours, with total intake prioritized; four occasions is a product heuristic, not a mandatory rule. Existing 185 g target is preserved, not newly validated. NIH vitamin C and iron fact sheets support brief steaming/microwaving to reduce some vitamin losses and vitamin C with nonheme iron. USDA leftovers guidance supports prompt refrigeration, 3–4 day storage, and 165°F reheating. No greens/red-meat anti-inflammatory claim is established.
