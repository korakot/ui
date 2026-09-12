// cy.mjs v0.2 — portable ESM renderer for <pre class="cy"> dependency-map DSL blocks.
// Declarative usage:
//   <pre class="cy">@dagre-LR
//   A > B, C
//   B: text shown when B is tapped</pre>
//   <script type="module">import '.../cy.mjs';</script>
// Importing the module automatically renders all matching blocks.

import cytoscape from 'https://cdn.jsdelivr.net/npm/cytoscape@3.34.3/+esm';
import cytoscapeDagre from 'https://cdn.jsdelivr.net/npm/cytoscape-dagre@4.0.1/+esm';

cytoscape.use(cytoscapeDagre);

export const LAYOUTS = {
  dagre:      { name: 'dagre', rankDir: 'TB', nodeSep: 30, rankSep: 50 },
  'dagre-LR': { name: 'dagre', rankDir: 'LR', nodeSep: 30, rankSep: 60 },
  'dagre-TB': { name: 'dagre', rankDir: 'TB', nodeSep: 30, rankSep: 50 }
};

function cssAny(names, fallback) {
  const style = getComputedStyle(document.documentElement);
  for (const name of names) {
    const value = style.getPropertyValue(name).trim();
    if (value) return value;
  }
  return fallback;
}

export function parse(src) {
  const nodes = {};
  const edges = [];
  let layout = 'dagre';

  function node(id) {
    id = id.trim();
    if (id && !nodes[id]) nodes[id] = { id, text: '' };
    return id;
  }

  String(src).split('\n').forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line || line[0] === '#') return;

    if (line[0] === '@') {
      layout = line.slice(1).trim();
      if (!LAYOUTS[layout]) throw new Error(`unknown layout @${layout}`);
      return;
    }

    const gt = line.indexOf('>');
    if (gt > -1) {
      const source = node(line.slice(0, gt));
      line.slice(gt + 1).split(',').forEach((targetText) => {
        const target = node(targetText);
        if (source && target) edges.push({ source, target });
      });
      return;
    }

    const colon = line.indexOf(':');
    if (colon > -1) {
      const id = node(line.slice(0, colon));
      nodes[id].text = line.slice(colon + 1).trim();
      return;
    }

    node(line);
  });

  const elements = Object.keys(nodes).map((id) => ({ data: nodes[id] }));
  edges.forEach((edge, index) => {
    elements.push({ data: { id: `e${index}`, source: edge.source, target: edge.target } });
  });

  return { elements, layout: { ...LAYOUTS[layout] } };
}

export function render(container, src, options = {}) {
  if (!(container instanceof Element)) {
    throw new TypeError('render(container, src): container must be a DOM Element');
  }

  const parsed = parse(src);
  const text = options.textColor || cssAny(['--viz-text', '--text-primary'], '#222');
  const muted = options.mutedColor || cssAny(['--viz-muted', '--text-secondary'], '#666');
  const line = options.lineColor || cssAny(['--viz-border', '--border-stronger', '--border'], '#888');
  const fill = options.nodeColor || cssAny(['--viz-card', '--surface-1'], '#f4f4f4');
  const accent = options.accentColor || cssAny(['--viz-accent', '--border-accent'], '#378ADD');
  const font = options.fontFamily || cssAny(['--font-sans'], 'sans-serif');

  const cy = cytoscape({
    container,
    elements: parsed.elements,
    layout: parsed.layout,
    wheelSensitivity: options.wheelSensitivity ?? 0.2,
    minZoom: options.minZoom ?? 0.25,
    maxZoom: options.maxZoom ?? 3,
    style: [
      {
        selector: 'node',
        style: {
          label: 'data(id)',
          shape: 'round-rectangle',
          width: 'label',
          height: 'label',
          padding: '8px',
          'background-color': fill,
          'border-width': 1,
          'border-color': line,
          color: text,
          'font-family': font,
          'font-size': 12,
          'text-valign': 'center',
          'text-halign': 'center',
          'text-wrap': 'wrap',
          'text-max-width': '120px'
        }
      },
      {
        selector: 'node[text][text != ""]',
        style: { 'border-color': accent }
      },
      {
        selector: 'node:selected',
        style: { 'border-width': 2, 'border-color': accent }
      },
      {
        selector: 'edge',
        style: {
          width: 1.5,
          'line-color': line,
          'target-arrow-color': line,
          'target-arrow-shape': 'triangle',
          'curve-style': 'bezier',
          'arrow-scale': 0.8
        }
      }
    ]
  });

  if (options.caption instanceof Element) {
    const caption = options.caption;
    caption.style.color = muted;
    cy.on('tap', 'node', (event) => {
      caption.textContent = event.target.data('text') || '';
    });
    cy.on('tap', (event) => {
      if (event.target === cy) caption.textContent = '';
    });
  }

  return cy;
}

export function renderPre(pre, options = {}) {
  if (!(pre instanceof Element)) {
    throw new TypeError('renderPre(pre): pre must be a DOM Element');
  }

  const box = document.createElement('div');
  const canvas = document.createElement('div');
  const caption = document.createElement('div');
  const source = pre.textContent;

  canvas.style.cssText = 'height:320px;border:0.5px solid ' +
    cssAny(['--viz-border', '--border'], '#ddd') + ';border-radius:8px';
  caption.style.cssText = 'min-height:1.4em;padding:6px 2px;font-size:13px';

  box.className = 'cy-out';
  box.appendChild(canvas);
  box.appendChild(caption);
  pre.replaceWith(box);

  try {
    const cy = render(canvas, source, { ...options, caption });
    box.cy = cy;
    return cy;
  } catch (error) {
    canvas.remove();
    const message = document.createElement('pre');
    message.style.color = '#c00';
    message.textContent = String(error?.message || error);
    caption.replaceChildren(message);
    return null;
  }
}

export function renderAll(root = document, options = {}) {
  const rendered = [];
  root.querySelectorAll('pre.cy:not([data-cy])').forEach((pre) => {
    pre.dataset.cy = '1';
    rendered.push(renderPre(pre, options));
  });
  return rendered;
}

export default { parse, render, renderPre, renderAll, LAYOUTS };

// Match the classic cy.js behavior: import once, render declarative DSL blocks.
renderAll();
