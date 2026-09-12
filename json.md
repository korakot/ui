# json.mjs

`json.mjs` is a compact JSON tree viewer/editor for chat widgets and browser ESM hosts.

It uses `vanilla-jsoneditor` as the editing engine, but keeps the visible UI intentionally minimal.

## Quick start

```html
<pre class="json" data-depth="2">{
  "name": "korakot/ui",
  "active": true,
  "files": ["cy.mjs", "three.mjs", "json.mjs"]
}</pre>
<script type="module">
  import 'https://cdn.jsdelivr.net/gh/korakot/ui@main/json.mjs';
</script>
```

Importing `json.mjs` auto-renders matching `<pre class="json">` blocks.

## What it provides

- collapsible JSON tree
- inline value editing
- editable object keys
- structural editing with a small context menu
- initial expansion depth via `data-depth`
- Expand all / Collapse all
- Copy JSON
- undo/redo through the underlying editor keyboard behavior

The context menu is intentionally limited to four actions, in this order:

1. Remove
2. Insert before
3. Insert after
4. Edit key

The larger `vanilla-jsoneditor` context menu, between-row insert hover controls, and context-menu tip are hidden.

## Expansion depth

Use `data-depth` on the source `<pre>`:

```html
<pre class="json" data-depth="2">...</pre>
```

- omitted: expand everything
- `0`: collapse everything
- `1`: show the root level
- `2`, `3`, ...: progressively expand deeper levels

## Editing

Primitive values can be edited directly in the tree.

For object keys and structural changes, open the context menu on an item. The wrapper keeps only the four common actions listed above.

The editor intentionally does not expose the full advanced menu from `vanilla-jsoneditor`.

## Copy JSON

The toolbar includes **Copy JSON**, which copies the current edited JSON as formatted text.

Download is intentionally not included because browser-sandbox download behavior is unreliable in some chat widget hosts.

## Programmatic rendering

```html
<div id="target"></div>

<script type="module">
  import { render } from 'https://cdn.jsdelivr.net/gh/korakot/ui@main/json.mjs';

  const api = render('#target', {
    name: 'korakot/ui',
    active: true
  }, {
    depth: 2,
    space: 2
  });
</script>
```

`render()` returns an API object with:

```text
{
  root,
  editor,
  data,
  get(),
  text(),
  copy(),
  expandAll(),
  collapseAll(),
  destroy()
}
```

`data` and `get()` return the current edited JSON value. `text()` returns formatted JSON text.

## Exports

`json.mjs` exports:

```text
render
renderPre
renderAll
stringify
```

Importing the module also calls `renderAll()` automatically.

## ChatGPT `app_block`

`json.mjs` is designed to work in ESM sandboxes such as ChatGPT `@Visualize` / `app_block`.

Typical pattern:

```html
<pre class="json" data-depth="3">{
  "hello": "world",
  "items": [1, 2, 3]
}</pre>

<script type="module">
  import 'https://cdn.jsdelivr.net/gh/korakot/ui@main/json.mjs';
</script>
```

For testing a new change, importing by commit SHA avoids CDN cache ambiguity:

```js
await import('https://cdn.jsdelivr.net/gh/korakot/ui@COMMIT_SHA/json.mjs');
```

## Design principle

Use a mature editor engine for correctness and history, but expose only the small set of interactions that are useful for chat-generated widgets.

The goal is a calm JSON editor rather than a full IDE-like JSON tool.
