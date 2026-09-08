# ui
Small UI helpers loaded via CDN into chat widgets (Claude Visualizer and similar). Widget = one script tag + data.

```html
<script src="https://cdn.jsdelivr.net/gh/korakot/ui@main/NAME.js"></script>
```

Versioning: `@main`, then purge `https://purge.jsdelivr.net/gh/korakot/ui@main/NAME.js` after each push.

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

## planned
cy.js (Cytoscape), point-review

---

# ui (ภาษาไทย)
ไลบรารี UI ตัวเล็ก ๆ สำหรับโหลดผ่าน CDN เข้าไปใน chat widget (เช่น Claude Visualizer) — widget หนึ่งอันใช้แค่ script tag หนึ่งบรรทัด + ข้อมูล ไม่ต้องเขียน HTML/CSS/JS ซ้ำทุกครั้ง จึงประหยัด token มาก

```html
<script src="https://cdn.jsdelivr.net/gh/korakot/ui@main/NAME.js"></script>
```

การ version: ใช้ `@main` แล้ว purge cache ที่ `https://purge.jsdelivr.net/gh/korakot/ui@main/NAME.js` หลัง push ทุกครั้ง

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
ตัวเลือกคั่นด้วย `|` ไม่ต้องใช้ JSON — ใน widget เดียวใส่ได้หลายคำถาม จะมีปุ่ม Send ปุ่มเดียว กดแล้วส่งคำตอบกลับเข้า chat ผ่าน `sendPrompt` บรรทัดละคำถาม: `คำถาม? → คำตอบ` (rank = `A > B > C`)

## แผนต่อไป
cy.js (Cytoscape), point-review
