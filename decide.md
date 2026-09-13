# decide.js

`decide.js` is a per-point review widget for chat widgets: the reader decides on each of a set of items, leaves per-item notes and one overall comment, and submits the whole batch back as structured text.

It exists for gen-verify loops — an LLM produces several claims, options, or backlog items, and the reader needs to react to each one rather than write prose about all of them.

## Quick start

```html
<script src="https://cdn.jsdelivr.net/gh/korakot/ui@main/decide.js"></script>
<pre class="decide" topic="skill descriptions" acts="claims">
Title of the point | one line of context | sourced · 2026-05-12
Second point | context
</pre>
```

Importing `decide.js` auto-renders matching `<pre class="decide">` blocks.

## Line format

One point per line: `title | context | tag`.

- `title` is required; `context` and `tag` are optional.
- Fields are separated by `|` — keep `|` out of the text itself.
- `#` at the start of a line comments it out.
- The block is HTML: escape `<` and `&` as entities.

## Attributes

- `topic` — names the review; comes back in the submission header as `Review of <topic>:`.
- `acts` — picks the buttons: a preset name (`claims` default, `triage`, `select`, `code` — see table below), or a custom `Label:description|…` with two to four of them. The description shows in the legend, so write it as what the choice *means*, not just a verb.

## Presets

| Preset | Slot 1 (teal) | Slot 2 (red) |
|---|---|---|
| `claims` (default) | Accept — take the claim as stated | Reject — drop the claim |
| `triage` | Resolve — close now; comment becomes resolution | Drop — stop tracking |
| `select` | Include — ship this option | Exclude — leave out |
| `code` | Apply — merge this change | Discard — close without merging |

A custom `acts` takes two to four labels. Use three or four when the review sorts items into categories rather than approving them, e.g. `Now:this sprint|Later:next quarter|Never:drop it`. Slot colors run teal, red, gray, blue regardless of label — put the strongest option in slot 1. A defer slot is never needed: an unclicked row already means defer.

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

## Batching

Over ~15 rows, visual fatigue eats accuracy. Batch by category, source, or priority — render one widget, wait for the submission, then the next — rather than one giant block.

## For testing a change

`@main` on jsdelivr is cached for roughly 12 hours, so a just-pushed change won't be visible under that tag right away. Reference the commit SHA instead while iterating:

```html
<script src="https://cdn.jsdelivr.net/gh/korakot/ui@COMMIT_SHA/decide.js"></script>
```

## Design principle

Render rows, not a prose checklist — inline checkboxes in text are slower to scan and capture no notes. Four buttons is the ceiling: beyond that, rows get wide and committing gets harder; split the review or ask the question a different way instead. Keep context to 1–2 lines; anything needing more belongs in its own chat or document.
