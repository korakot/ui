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
Put scene data directly in a `<div class="three">`; importing the module replaces the text with a Three.js canvas. Camera, lighting, resize, render loop, and orbit controls have useful defaults, so simple scenes need only object lines.

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

Core DSL:

```text
camera x y z [fov]
look x y z
bg color
light x y z [power] [color]
ambient [power] [color]
box [id] x y z [size|x,y,z] [color]
sphere [id] x y z [radius] [color]
cylinder [id] x y z [radius] [height] [color]
plane [id] x y z [width] [height] [color]
rot id x y z
line id1 id2 [color]
arrow id1 id2 [color]
```

Ids are optional for shapes; if omitted they are generated automatically. `rot` uses degrees. `#` starts a comment.

Orbit controls are **on by default**: drag to orbit, wheel/pinch to zoom, and right-drag/two-finger gesture to pan. Disable them only when needed:

```js
render('.three', { orbit: false });
```

The DSL intentionally covers common scene description rather than wrapping all of Three.js. For rare features, use JavaScript as an escape hatch:

```html
<script type="module">
  import { render } from 'https://cdn.jsdelivr.net/gh/korakot/ui@main/three.mjs';
  const { THREE, scene, camera, renderer, controls, objects } = render('.my-scene');
  objects.ball.rotation.y = Math.PI / 4;
</script>
```

This keeps generated scene content compact and readable while preserving access to the full Three.js API.

## planned
point-review

---

# ui (ภาษาไทย)
ไลบรารี UI ตัวเล็ก ๆ สำหรับโหลดผ่าน CDN เข้าไปใน chat widget (เช่น Claude Visualizer, ChatGPT `@Visualize` / `app_block`) — widget หนึ่งอันใช้แค่ script tag + ข้อมูล ไม่ต้องเขียน HTML/CSS/JS ซ้ำทุกครั้ง จึงประหยัด token มาก

## cy.mjs
เป็น ESM version ของ Cytoscape renderer ใช้ DSL เดียวกับ `cy.js` และ auto-render เมื่อ import เหมาะกับ ChatGPT `app_block` / `@Visualize` และ host ที่รองรับ module

## three.mjs
เป็น DSL ฉาก 3D แบบย่อบน Three.js มี camera, light, resize, render loop และ **orbit controls เปิดเป็นค่าเริ่มต้น** จึงสามารถลากหมุนฉาก ซูม และ pan ได้ทันที ถ้าไม่ต้องการใช้ `render(..., { orbit: false })`

DSL ตั้งใจครอบคลุมงานที่ใช้บ่อย ไม่ได้ห่อ Three.js ทุก API; กรณีพิเศษใช้ `THREE`, `scene`, `camera`, `renderer`, `controls`, `objects` ที่ `render()` คืนมาได้โดยตรง

## แผนต่อไป
point-review
