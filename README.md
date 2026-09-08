# ui
Small UI helpers loaded via CDN into chat widgets. Widget = one script tag + data.

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
