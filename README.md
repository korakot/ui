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

## json.mjs — collapsible JSON viewer/editor
Put valid JSON in `<pre class="json">`; importing the module replaces it with a collapsible tree. Object keys are shown without quotes. Primitive values (string, number, boolean, null) can be edited inline; structural editing is intentionally not included yet. Copy JSON exports the edited JSON object.

```html
<pre class="json">{
  "name": "korakot/ui",
  "active": true,
  "files": ["cy.mjs", "three.mjs", "json.mjs"]
}</pre>
<script type="module">
  import 'https://cdn.jsdelivr.net/gh/korakot/ui@main/json.mjs';
</script>
```

Click a primitive value to edit it; Enter saves and Esc cancels. It exports `render`, `renderPre`, `renderAll`, and `stringify`.

## planned
point-review

---

# ui (ภาษาไทย)
ไลบรารี UI ตัวเล็ก ๆ สำหรับโหลดผ่าน CDN เข้าไปใน chat widget (เช่น Claude Visualizer, ChatGPT `@Visualize` / `app_block`) — widget หนึ่งอันใช้แค่ script tag + data.

## cy.mjs
เป็น ESM version ของ Cytoscape renderer ใช้ DSL เดียวกับ `cy.js` และ auto-render เมื่อ import เหมาะกับ ChatGPT `app_block` / `@Visualize` และ host ที่รองรับ module

## three.mjs
เป็น DSL ฉาก 3D แบบย่อบน Three.js มี camera, light, resize, render loop และ orbit / zoom / pan แบบ lightweight ที่อยู่ใน `three.mjs` เอง จึงไม่ต้อง import `OrbitControls` แยก และเหมาะกับ ESM sandbox เช่น ChatGPT `app_block`

รายละเอียดเต็มอยู่ที่ **[three.md](three.md)**

## json.mjs
เป็น JSON tree แบบย่อที่ collapse/expand ได้ แสดง key โดยไม่ใส่ quote แก้ค่า primitive ได้ และ export JSON ที่แก้แล้วด้วย Copy โดยยังไม่รองรับการแก้โครงสร้าง object/array

## แผนต่อไป
point-review
