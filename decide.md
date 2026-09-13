# decide.js

`decide.js` is a per-point review widget for chat widgets: the reader decides on each of a set of items, leaves per-item notes and one overall comment, and submits the whole batch back as structured text.

It exists for gen-verify loops — an LLM produces several claims, options, or backlog items, and the reader needs to react to each one rather than write prose about all of them.

## Quick start

```html
<script src="https://cdn.jsdelivr.net/gh/korakot/ui@main/decide.js"></script>
<pre class="decide" topic="skill descriptions" acts="claims">
Title of the point | one line of context
Second point | context
Third point
</pre>
```

Importing `decide.js` auto-renders matching `<pre class="decide">` blocks.

## Line format

One point per line: `title | context` — the same two-field shape as `ask.js`.

- `title` is required; `context` is optional and is everything after the first `|`, so a `|` inside the context is fine.
- Keep context to 1–2 lines. Provenance, if it matters, is a leading word in the context (`inferred: …`), not a separate field.
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

## Row behavior

Every button is optional. Clicking the selected button again unselects it.

- A row with a button clicked submits as `[LABEL] title | Comment: note-or-(none)`.
- A row left unclicked but with a note submits as `title | note` — no bracket, no assumed action. The note itself carries the response.
- A row left completely untouched (no click, no note) is not sent on its own line. All such rows across the block are folded into one trailing `[SKIP] title, title, …` line, so a mostly-untouched batch doesn't cost one line per row.

## Multiple blocks, one Submit

Several `<pre class="decide">` blocks in the same widget share a single Submit button — matches `ask.js`'s convention of one Send per widget rather than one per element. Submitting sends one `Review of <topic>:` section per block, in document order, separated by a blank line.

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

## For testing a change

`@main` on jsdelivr is cached for roughly 12 hours, so a just-pushed change won't be visible under that tag right away. Reference the commit SHA instead while iterating:

```html
<script src="https://cdn.jsdelivr.net/gh/korakot/ui@COMMIT_SHA/decide.js"></script>
```

## Design principle

Render rows, not a prose checklist — inline checkboxes in text are slower to scan and capture no notes. Four buttons is the ceiling: beyond that, rows get wide and committing gets harder; split the review or ask the question a different way instead. Keep context to 1–2 lines; anything needing more belongs in its own chat or document. Keep the copy minimal — the legend carries dots and labels only, and the hint says the buttons are optional without spelling out every combination.
