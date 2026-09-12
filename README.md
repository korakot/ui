# ui
Small UI helpers loaded via CDN into chat widgets (Claude Visualizer and similar). Widget = one script tag + data.

```html
<script src="https://cdn.jsdelivr.net/gh/korakot/ui@main/NAME.js"></script>
```

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

`cy.mjs` is the ESM version of the Cytoscape renderer. It uses the same `<pre class="cy">` DSL as `cy.js`, auto-renders all matching blocks when imported, and is intended for module-capable hosts such as ChatGPT `app_block` / `@Visualize`.

In ChatGPT, if `app_block` is not yet available in the chat, invoking `@Visualize` once may enable it for subsequent turns.

Minimal usage:

```html
<pre class="cy">@dagre-LR
Basics > Intermediate
Intermediate > Goal
Basics: Start here
Goal: Target concept</pre>

<script type="module">
  await import('https://cdn.jsdelivr.net/gh/korakot/ui@main/cy.mjs');
</script>
```

For ChatGPT/Codex generating an `app_block`, prefer this pattern:

1. Put only the graph DSL in one or more `<pre class="cy">...</pre>` blocks.
2. Add one final `<script type="module">` that imports `cy.mjs`.
3. Do not duplicate the parser, Cytoscape setup, styles, or interaction code in the widget; `cy.mjs` handles them.
4. No explicit `renderAll()` call is required because the module auto-renders on import.

`cy.mjs` currently imports exact-version ESM builds of Cytoscape and `cytoscape-dagre` from jsDelivr. It also exports `parse`, `render`, `renderPre`, `renderAll`, and `LAYOUTS` for lower-level use when needed.

Use `cy.js` for classic-script hosts; use `cy.mjs` for ESM/module hosts. The DSL is the same in both.

## planned
point-review

---

# ui (ภาษาไทย)
ไลบรารี UI ตัวเล็ก ๆ สำหรับโหลดผ่าน CDN เข้าไปใน chat widget (เช่น Claude Visualizer) — widget หนึ่งอันใช้แค่ script tag หนึ่งบรรทัด + ข้อมูล ไม่ต้องเขียน HTML/CSS/JS ซ้ำทุกครั้ง จึงประหยัด token มาก

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

## แผนต่อไป
point-review
