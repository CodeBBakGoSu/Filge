# Dev Runbook

## 1) Start
- Normal: `npm run dev`
- If runtime chunk/module error appears (e.g. `Cannot find module './825.js'`): `npm run dev:clean`

## 2) Mandatory smoke check (before ending session)
With dev server running on `127.0.0.1:3000`:
- `npm run verify:smoke`

This verifies:
- `/`
- `/practice/sw_design`
- `/exam/sw_design`
- `/wrong-note/sw_design`

## 3) Build check
- `npm run build`

## 4) Data check
- `npm run validate:questions`
