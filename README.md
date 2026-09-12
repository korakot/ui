# ui
Small UI helpers loaded via CDN into chat widgets (Claude Visualizer and similar). Widget = one script tag + data.

```html
<script src="https://cdn.jsdelivr.net/gh/korakot/ui@main/NAME.js"></script>
```

For ESM helpers such as `cy.mjs` and `three.mjs`:

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
Lines: `@dagre` (default, top-down) or `@dagre-LR` header; `A > B, C` edges; `A: text` per-node text; bare `A` declares a node; `#` comment. Ids may contain spaces. Nodes are draggable; nodes with text get an accent border.

## cy.mjs — ESM / ChatGPT app_block
`cy.mjs` is the portable ESM version of the Cytoscape renderer. It uses the same `<pre class="cy">` DSL as `cy.js`, auto-renders matching blocks when imported, and keeps parser/rendering boilerplate out of each widget.

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

Use `cy.js` for classic-script hosts and `cy.mjs` for ESM/module hosts. `cy.mjs` exports `parse`, `render`, `renderPre`, `renderAll`, and `LAYOUTS` for lower-level use when needed.

## three.mjs — compact 3D scene DSL (Three.js)
Put scene data directly in a `<div class="three">`; importing the module replaces the text with a Three.js canvas. Camera, lighting, resize, and render loop have useful defaults, so simple scenes need only object lines.

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

The DSL intentionally covers common scene description rather than wrapping all of Three.js. For rare features, use JavaScript as an escape hatch:

```html
<script type="module">
  import { render } from 'https://cdn.jsdelivr.net/gh/korakot/ui@main/three.mjs';
  const { THREE, scene, camera, renderer, objects } = render('.my-scene');
  objects.ball.rotation.y = Math.PI / 4;
</script>
```

This keeps generated scene content compact and readable while preserving access to the full Three.js API.

## planned
point-review

---

# ui (ภาษาไทย)
ไลบรารี UI ตัวเล็ก ๆ สำหรับโหลดผ่าน CDN เข้าไปใน chat widget (เช่น Claude Visualizer, ChatGPT `@Visualize` / `app_block`) — widget หนึ่งอันใช้แค่ script tag หนึ่งบรรทัด + ข้อมูล ไม่ต้องเขียน HTML/CSS/JS ซ้ำทุกครั้ง จึงประหยัด token มาก

```html
<script src="https://cdn.jsdelivr.net/gh/korakot/ui@main/NAME.js"></script>
```

## mm.js — วาด Mermaid diagram
```html
<pre class="mm">graph LR; A --> B</pre>
```

## ask.js — ถามผู้ใช้ (เลือกหนึ่ง / เลือกหลาย / จัดอันดับ)
```html
<ask q="คำถาม?">A | B | C</ask>
<ask type="multi" q="เลือกได้หลายข้อ">A | B | C</ask>
<ask type="rank" q="เรียงลำดับ">A | B | C</ask>
```
ตัวเลือกคั่นด้วย `|` ไม่ต้องใช้ JSON — ใน widget เดียวใส่ได้หลายคำถาม จะมีปุ่ม Send ปุ่มเดียว กดแล้วส่งคำตอบกลับเข้า chat ผ่าน `sendPrompt` บรรทัดละคำถาม: `Question? → answer` (rank = `A > B > C`).

## cy.js — กราฟลากโหนดได้ (Cytoscape)
```html
<pre class="cy">@dagre-LR
A > B, C
B > D
B: ข้อความที่จะโชว์ใต้กราฟเมื่อแตะ B</pre>
```
บรรทัดแรก `@dagre` (ค่าเริ่มต้น บนลงล่าง) หรือ `@dagre-LR` (ซ้ายไปขวา); `A > B, C` คือเส้นเชื่อม; `A: ข้อความ` ใส่ข้อความประจำโหนด; ชื่อโหนดมีช่องว่างได้; `#` คือ comment ลากโหนดได้ทันที โหนดที่มีข้อความจะมีขอบสีเน้น

## cy.mjs — ESM สำหรับ ChatGPT / module host
ใช้ DSL เดียวกับ `cy.js` แต่ import แบบ module และ auto-render ได้ทันที เหมาะกับ ChatGPT `app_block` / `@Visualize` และ host ที่รองรับ ESM

## three.mjs — 3D DSL แบบย่อ (Three.js)
ใส่ข้อมูลฉากไว้ใน `<div class="three">` แล้ว import `three.mjs`; โมดูลจะเปลี่ยนข้อความเป็นฉาก Three.js ให้เอง โดยมีกล้อง แสง resize และ render loop เป็นค่าเริ่มต้น จึงใช้ token น้อยมากในฉากทั่วไป

DSL ตั้งใจครอบคลุมงานฉากที่ใช้บ่อย ไม่ได้พยายามครอบ Three.js ทุก API; กรณีพิเศษสามารถ `import { render }` แล้วใช้ `THREE`, `scene`, `camera`, `renderer`, `objects` ที่คืนมาเพื่อเขียน Three.js ตรง ๆ ได้

## แผนต่อไป
point-review
