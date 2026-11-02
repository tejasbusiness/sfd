# Demo kit: the master prompt for private website previews

Part of the lead-response automation (`docs/15-lead-automation.md`). When a lead arrives, n8n turns it into one detailed prompt. The owner copies that prompt into Claude, in a new empty folder, to build a 2 to 3 page static demo for `https://preview.synergyfirstdigital.com/<token>/`.

This folder is the single source of truth. Nothing here is used by the public website build.

## What is here

| Path | What it is |
|---|---|
| `kits/garage-door.json`, `kits/tree-services.json`, `kits/local-service.json` | One design kit per trade: audience and tone, 3 palettes, 3 Google font pairs, the 2 to 3 pages and their sections, button labels, and the trust and image rules. `local-service` is the fallback for any other trade. |
| `master-prompt.template.md` | The prompt itself, with `{{placeholders}}`. The fixed rules (never invent claims, preview bar, `noindex`, plain HTML/CSS/JS only) live here, so they are always present whatever the AI says. |
| `lib/demo-kit.js` | Shared logic: contrast checks, kit choice, website text extraction, the OpenAI request, answer validation and prompt rendering. No `require()`, so it can be pasted into n8n. |
| `n8n/1-prepare-ai-request.js`, `n8n/2-build-prompt.js` | **Generated** Code-node scripts (kits, template and library inlined). Paste these into n8n. Do not edit them by hand. |

After editing a kit, the template or the library, run:

```
npm run build:demo-kit     # regenerates demo-kit/n8n/*.js
npm run test:validation    # checks every palette for WCAG AA contrast, the prompt rules, and that the generated files are up to date
```

Then paste the changed script into the matching n8n Code node again.

## How the workflow uses it

```
Webhook -> Telegram alert 1 (instant)
        -> Fetch website (HTTP Request)
        -> Code: 1-prepare-ai-request.js
        -> OpenAI (HTTP Request)
        -> Code: 2-build-prompt.js
        -> Telegram: send document (the prompt .md file) with a summary
```

- The AI only chooses a palette and a font pair from the kit and summarises facts it was given. The rules, structure and design tokens come from the template and kit, not from the AI.
- If the AI answer is invalid, the first palette and font pair are used.
- The lead's own phone and email are never put in the prompt (they are only in the alert).
- Visitor-typed text is wrapped in `<lead-data>` and labelled untrusted, and `<`, `>` and `{{` are neutralised.
- If the lead gave a Google Business Profile link, there is no website text to read; the prompt then uses only the form's facts and lists the rest as "still unknown".

## Rules for adding or changing kits

- Every palette needs all 11 colours and must pass the contrast pairs in `lib/demo-kit.js` (`PALETTE_PAIRS`); the test fails otherwise.
- Font pairs use Google Fonts only (the demo's single external request); the URL must contain both family names.
- Keep trade kits free of claims. Trust cues are described by rule (`trustCueRule`), never as content.
- A new trade needs a kit file, `matchTrades` (lower-case labels exactly as the form's `trade` value) and a rebuild.
