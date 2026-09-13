# ui
Small UI helpers loaded via CDN into chat widgets (Claude Visualizer, ChatGPT `@Visualize` / `app_block`, and similar). Widget = one script tag + data.

Classic script:

```html
<script src="https://cdn.jsdelivr.net/gh/korakot/ui@main/NAME.js"></script>
```

ESM helper:

```html
<script type="module">import 'https://cdn.jsdelivr.net/gh/korakot/ui@main/NAME.mjs';</script>
```

In ChatGPT, an initial `@Visualize` call may be needed before `app_block` is available.

## mm.js — Mermaid
```html
<pre class="mm">graph LR; A --> B</pre>
```

## ask.js — elicitation (single / multi / rank)
```html
<ask q="Question?">A | B | C</ask>
<ask type="multi" q="Pick any">A | B | C</ask>
<ask type="rank" q="Order these">A | B | C</ask>
```
One Send button per widget → `sendPrompt` with one line per question: `Question? → answer` (rank = `A > B > C`).

## cy.js — draggable graph (Cytoscape)
```html
<pre class="cy">@dagre-LR
A > B, C
B > D
B: text shown under the graph when B is tapped</pre>
```
Lines: `@dagre` (default, top-down) or `@dagre-LR`; `A > B, C` edges; `A: text` per-node text; bare `A` declares a node; `#` comment. Ids may contain spaces.

## cy.mjs — portable ESM Cytoscape renderer
Same DSL as `cy.js`, but designed for ESM/module hosts such as ChatGPT `app_block` / `@Visualize`. Importing it auto-renders matching `<pre class="cy">` blocks.

```html
<pre class="cy">@dagre-LR
Basics > Intermediate
Intermediate > Goal
Basics: Start here
Goal: Target concept</pre>
<script type="module">
  import 'https://cdn.jsdelivr.net/gh/korakot/ui@main/cy.mjs';
</script>
```

It exports `parse`, `render`, `renderPre`, `renderAll`, and `LAYOUTS`. Use `cy.js` for classic-script hosts and `cy.mjs` for ESM hosts.

## three.mjs — compact 3D scene DSL (Three.js)
Put scene data directly in a `<div class="three">`; importing the module replaces it with an interactive Three.js canvas. Camera, lighting, resize, render loop, and lightweight orbit / zoom / pan controls have useful defaults.

```html
<div class="three">
box cube 0 0 0 1 coral
sphere ball 2 0 0 .6 skyblue
arrow cube ball
</div>
<script type="module">
  import 'https://cdn.jsdelivr.net/gh/korakot/ui@main/three.mjs';
</script>
```

The controls are implemented inside `three.mjs`, so no separate Three.js `OrbitControls` import or import map is required. The DSL covers common scene description; direct Three.js remains available as an escape hatch.

See **[three.md](three.md)** for the full DSL, controls, API, animation, and ChatGPT `app_block` notes.

## json.mjs — minimal JSON tree editor
Put valid JSON in `<pre class="json">`; importing the module replaces it with a collapsible tree editor powered by `vanilla-jsoneditor`, with a deliberately small UI.

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

Supports inline value editing, key editing, Remove / Insert before / Insert after, `data-depth`, Expand all / Collapse all, and Copy JSON. The larger editor menus, between-row insert hover UI, and context-menu tip are hidden.

It exports `render`, `renderPre`, `renderAll`, and `stringify`.

See **[json.md](json.md)** for the full behavior, API, editing notes, and ChatGPT `app_block` usage.

## pr.js — point review (accept / reject / skip each item)
```html
<pre class="pr" topic="skill descriptions" acts="claims">
Title of the point | one line of context | sourced · 2026-05-12
Second point | context
</pre>
```
Lines: `title | context | tag`, one point per line; `|` fields after the first are optional, `#` comments a line. `acts` picks the verb trio — preset name `claims` (default), `triage`, `select`, `code`, or a custom `Label:description|Label:description|Label:description`. Renders a legend, per-point comment fields, three action buttons (teal / red / gray + check icon), and one overall-comment box. Submit → `sendPrompt`:
```
Review of <topic>:
- [ACTION] <title> | Comment: <comment-or-(none)>

Overall comment:
<text>
```

## planned
field (text/number/date + Send)

---

# ui (ภาษาไทย)
ไลบรารี UI ตัวเล็ก ๆ สำหรับโหลดผ่าน CDN เข้าไปใน chat widget (เช่น Claude Visualizer, ChatGPT `@Visualize` / `app_block`) — widget หนึ่งอันใช้แค่ script tag + data.

## cy.mjs
เป็น ESM version ของ Cytoscape renderer ใช้ DSL เดียวกับ `cy.js` และ auto-render เมื่อ import เหมาะกับ ChatGPT `app_block` / `@Visualize` และ host ที่รองรับ module

## three.mjs
เป็น DSL ฉาก 3D แบบย่อบน Three.js มี camera, light, resize, render loop และ orbit / zoom / pan แบบ lightweight ที่อยู่ใน `three.mjs` เอง จึงไม่ต้อง import `OrbitControls` แยก และเหมาะกับ ESM sandbox เช่น ChatGPT `app_block`

รายละเอียดเต็มอยู่ที่ **[three.md](three.md)**

## json.mjs
เป็น JSON tree editor แบบย่อที่ใช้ `vanilla-jsoneditor` เป็น engine แต่ลด UI ให้เหลือเท่าที่จำเป็น แก้ value และ key ได้ มี Remove / Insert before / Insert after, กำหนดความลึกเริ่มต้นด้วย `data-depth`, Expand/Collapse ทั้งหมด และ Copy JSON โดยซ่อนเมนูขั้นสูงกับ UI ที่รบกวนสายตา

รายละเอียดเต็มอยู่ที่ **[json.md](json.md)**

## แผนต่อไป
field
