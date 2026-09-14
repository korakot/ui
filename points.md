# points.js

`points.js` is a per-point review widget for chat widgets: the reader decides on each of a set of items, leaves per-item notes and one overall comment, and submits the whole batch back as structured text.

It exists for gen-verify loops — an LLM produces several claims, options, or backlog items, and the reader needs to react to each one rather than write prose about all of them.

## Quick start

```html
<script src="https://cdn.jsdelivr.net/gh/korakot/ui@main/points.js"></script>
<pre class="points" topic="skill descriptions" acts="claims">
Title of the point | one line of context
Second point | context
Third point
</pre>
```

Importing `points.js` auto-renders matching `<pre class="points">` blocks and any element carrying a `review` attribute (rich mode, below).

## Two input forms, one widget

- **Line mode** — `<pre class="points">`, one point per line. For atomic items where a sentence or two states the whole decision: rename this, drop that, keep A over B.
- **Rich mode** — any element with a `review` attribute. Its content is arbitrary HTML: a paragraph, a table, a `mm.js` or `cy.js` diagram. Use it whenever the point is easier to judge when *shown* than when described. Rich mode is the default for anything non-trivial; line mode is the shorthand.

Both render the same footer (note input, action buttons, Explain) and produce the same submission format. Line mode is expanded into rich-mode elements internally, so the two can be mixed in one widget under one Submit.

```html
<div topic="auth redesign" acts="claims">
  <div review title="Token refresh matches the spec">
    <pre class="mm">sequenceDiagram; Client->>Server: refresh; Server-->>Client: 200</pre>
  </div>
  <div review title="Latency budget is realistic">
    <table>…</table>
  </div>
</div>
```

- `review` opts the element in. `points.js` wraps it — it never replaces or reparses the content — so other korakot/ui scripts render inside untouched, whatever the load order.
- `title` is the point's name: shown as the row heading and used verbatim in the submission line. Keep it a short decidable statement; explanation goes in the content.
- The content is rendered exactly as written, so it needs its own styling to read as a body rather than loose text. A table wants hairline row borders (`border-bottom: 0.5px solid var(--border)`) and a muted first column (`color: var(--text-secondary)`); a paragraph is fine bare.
- `topic` and `acts` are read from the element, else inherited from the nearest ancestor that has them. A wrapper `<div topic acts>` therefore groups several rich points into one review section.

## Line format

One point per line: `title | context` — the same two-field shape as `ask.js`.

- `title` is required; `context` is optional and is everything after the first `|`, so a `|` inside the context is fine.
- Context length is set by one test: **could the reader decide this row without asking a follow-up?** If not, it is too short. A few sentences is normal — what the claim rests on, what changes if accepted, what the alternative was. There is no line limit; the row wraps. Provenance, if it matters, is a leading word in the context (`inferred: …`), not a separate field.
- When the explanation wants formatting or a picture, switch that point to rich mode instead of cramming it into one line.
- `#` at the start of a line comments it out.
- The block is HTML: escape `<` and `&` as entities.

## Attributes

- `topic` — names the review; comes back in the submission header as `Review of <topic>:`. Omitted, the header falls back to `Review of these points:`.
- `acts` — picks the buttons: a preset name (`claims` default, `triage`, `select`, `code` — see table below), or a custom list of two to four labels separated by `|`, e.g. `Now|Later|Never`. The legend shows a colored dot and the label, nothing else, so the label has to carry the meaning by itself. (`Label:description` is still parsed for compatibility, but the description is not displayed anywhere.)
- `lang` — `th` or `en`. Sets the language of the built-in copy: preset labels, note placeholder, overall-comment label, hint, and the Submit button. Omit it and the widget auto-detects — Thai if any Thai character (U+0E00–U+0E7F) appears in `topic` or the block text, English otherwise. A Thai review therefore usually needs no attribute. One language applies to the whole widget: the first block carrying an explicit `lang` decides for all blocks.

## Presets

| Preset | Slot 1 (teal) | Slot 2 (red) |
|---|---|---|
| `claims` (default) | Accept / ยอมรับ | Reject / ปฏิเสธ |
| `triage` | Resolve / แก้แล้ว | Drop / ทิ้ง |
| `select` | Include / รวม | Exclude / ไม่รวม |
| `code` | Apply / ใช้ | Discard / ทิ้ง |

What each pair means — for picking the preset, not shown in the UI: `claims` takes the claim as stated vs drops it; `triage` closes the item now (the comment becomes the resolution) vs stops tracking it; `select` ships the option vs leaves it out; `code` merges the change vs closes it without merging.

A custom `acts` takes two to four labels. Use three or four when the review sorts items into categories rather than approving them, e.g. `Now|Later|Never`. Slot colors run teal, red, gray, blue regardless of label — put the strongest option in slot 1. A defer slot is never needed: an unclicked row already means defer.

## Legend and copy

The legend is a single row above the points: one colored dot + label per action, then a hint that the buttons are optional.

| Element | English | ไทย |
|---|---|---|
| hint | a comment alone, or with a button, both work | ใส่เฉพาะความเห็น หรือ กดปุ่มด้วยก็ได้ |
| row input placeholder | Comment | ความเห็น |
| box below the rows | Overall comment | ความเห็นโดยรวม |
| button → after submit | Submit ↗ → Sent | ส่ง ↗ → ส่งแล้ว |
| per-row explain button | Explain ↗ | อธิบาย ↗ |

## Row behavior

Every button is optional. Clicking the selected button again unselects it.

Each row also has an **Explain ↗** button. It calls `sendPrompt('Explain this point: <title> (review of <topic>)')` immediately — the review stays open, the model answers in chat, and the reader comes back to the buttons. It exists because "I need more before I can decide" is the most common reason a review stalls; it does not excuse thin context.

- A row with a button clicked submits as `[LABEL] title | Comment: note-or-(none)`.
- A row left unclicked but with a note submits as `title | note` — no bracket, no assumed action. The note itself carries the response.
- A row left completely untouched (no click, no note) is not sent on its own line. All such rows across the block are folded into one trailing `[SKIP] title, title, …` line, so a mostly-untouched batch doesn't cost one line per row.

## Multiple blocks, one Submit

Everything reviewable in one widget — line-mode blocks and rich-mode elements alike — shares a single Submit button, matching `ask.js`'s convention of one Send per widget. Points are grouped by `topic` (each `<pre class="points">` is its own group; rich elements group under their nearest `topic` ancestor, or a default group if none). Submitting sends one `Review of <topic>:` section per group, in document order, separated by a blank line. A legend is drawn once at the top and again only where a later group uses a different `acts` set.

## Submission format

```text
Review of <topic>:
- [ACTION] <title> | Comment: <comment-or-(none)>
- <title> | <note>
- [SKIP] <title>, <title>, <title>

Overall comment:
<text>
```

The `Overall comment` section is present only when the box is non-empty.

The structural keys (`Review of`, `Comment:`, `(none)`, `[SKIP]`, `Overall comment:`) are always English — the submission is for the model, not the reader. `ACTION` is the button label itself, so a Thai review returns `[ยอมรับ]`, `[ทิ้ง]`, and so on.

## Batching

Over ~15 rows, visual fatigue eats accuracy. Batch by category, source, or priority — render one widget, wait for the submission, then the next — rather than one giant block.

## After pushing a change

`@main` on jsdelivr is cached for roughly 12 hours. Purge it right after pushing so the new build serves immediately:

```
curl https://purge.jsdelivr.net/gh/korakot/ui@main/points.js
```

The response lists each CDN provider with `true` once cleared. Pinning a commit SHA (`@COMMIT_SHA/points.js`) is the fallback when a purge isn't possible.

The purge does not reach the browser. A chat that already loaded `@main/points.js` will reuse its cached copy for the next widget in the same conversation, even after a successful purge — the symptom is the old build running silently (e.g. `[review]` elements rendered with no footer). When testing a push in the same chat, load by commit SHA; `@main` is fine in a fresh chat.

## Design principle

Render rows, not a prose checklist — inline checkboxes in text are slower to scan and capture no notes. Four buttons is the ceiling: beyond that, rows get wide and committing gets harder; split the review or ask the question a different way instead. Give each point enough context to decide on — the reader should never have to ask before clicking; when that means a table or diagram, use rich mode rather than more prose. Keep the copy minimal — the legend carries dots and labels only, and the hint says the buttons are optional without spelling out every combination.
