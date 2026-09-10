// cy.js v0.1 — render <pre class="cy"> DSL blocks as draggable Cytoscape graphs inside chat widgets.
// Usage:
//   <script src="https://cdn.jsdelivr.net/gh/korakot/ui@<tag>/cy.js"></script>
//   <pre class="cy">@dagre-LR
//   A > B, C
//   B: text shown when B is tapped</pre>
// DSL: `@dagre` | `@dagre-LR` header (default @dagre = top-down); `A > B, C` edges;
//      `A: text` per-node text; bare `A` declares a node; `#` comments. Ids may contain spaces.
(function () {
  if (window.__cy) { window.__cy.render(); return; }
  var SRCS = [
    ['cytoscape',     'https://cdn.jsdelivr.net/npm/cytoscape@3/dist/cytoscape.min.js'],
    ['dagre',         'https://cdn.jsdelivr.net/npm/dagre@0.8.5/dist/dagre.min.js'],
    ['cytoscapeDagre','https://cdn.jsdelivr.net/npm/cytoscape-dagre@2/cytoscape-dagre.js']
  ];

  // Poll for globals, not onload — hosts may re-inject scripts after streaming.
  function load(i, cb) {
    if (i >= SRCS.length) return cb();
    var g = SRCS[i][0], src = SRCS[i][1];
    if (window[g]) return load(i + 1, cb);
    if (!document.querySelector('script[src="' + src + '"]')) {
      var s = document.createElement('script'); s.src = src; document.head.appendChild(s);
    }
    var t = setInterval(function () { if (window[g]) { clearInterval(t); load(i + 1, cb); } }, 50);
  }

  function css(name, fb) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fb;
  }

  var LAYOUTS = {
    dagre:      { name: 'dagre', rankDir: 'TB', nodeSep: 30, rankSep: 50 },
    'dagre-LR': { name: 'dagre', rankDir: 'LR', nodeSep: 30, rankSep: 60 },
    'dagre-TB': { name: 'dagre', rankDir: 'TB', nodeSep: 30, rankSep: 50 }
  };

  function parse(src) {
    var nodes = {}, edges = [], layout = 'dagre';
    function node(id) { id = id.trim(); if (id && !nodes[id]) nodes[id] = { id: id, text: '' }; return id; }
    src.split('\n').forEach(function (line) {
      line = line.trim();
      if (!line || line[0] === '#') return;
      if (line[0] === '@') {
        layout = line.slice(1).trim();
        if (!LAYOUTS[layout]) throw new Error('unknown layout @' + layout);
        return;
      }
      var gt = line.indexOf('>');
      if (gt > -1) {
        var a = node(line.slice(0, gt));
        line.slice(gt + 1).split(',').forEach(function (b) {
          b = node(b); if (a && b) edges.push({ source: a, target: b });
        });
        return;
      }
      var c = line.indexOf(':');
      if (c > -1) { nodes[node(line.slice(0, c))].text = line.slice(c + 1).trim(); return; }
      node(line);
    });
    var els = Object.keys(nodes).map(function (k) { return { data: nodes[k] }; });
    edges.forEach(function (e, i) { els.push({ data: { id: 'e' + i, source: e.source, target: e.target } }); });
    return { els: els, layout: LAYOUTS[layout] };
  }

  function draw(pre) {
    var box = document.createElement('div');
    var canvas = document.createElement('div');
    var cap = document.createElement('div');
    canvas.style.cssText = 'height:320px;border:0.5px solid ' + css('--border', '#ddd') + ';border-radius:8px';
    cap.style.cssText = 'min-height:1.4em;padding:6px 2px;font-size:13px;color:' + css('--text-secondary', '#666');
    box.className = 'cy-out'; box.appendChild(canvas); box.appendChild(cap);
    pre.replaceWith(box);
    try {
      var g = parse(pre.textContent);
      var text = css('--text-primary', '#222'), line = css('--border-stronger', '#888'),
          fill = css('--surface-1', '#f4f4f4'), acc = css('--border-accent', '#378ADD'),
          font = css('--font-sans', 'sans-serif');
      var cy = cytoscape({
        container: canvas, elements: g.els, layout: g.layout,
        wheelSensitivity: 0.2,
        style: [
          { selector: 'node', style: { label: 'data(id)', shape: 'round-rectangle', width: 'label', height: 'label',
            padding: '8px', 'background-color': fill, 'border-width': 1, 'border-color': line,
            color: text, 'font-family': font, 'font-size': 12, 'text-valign': 'center', 'text-halign': 'center',
            'text-wrap': 'wrap', 'text-max-width': '120px' } },
          { selector: 'node[text][text != ""]', style: { 'border-color': acc } },
          { selector: 'node:selected', style: { 'border-width': 2, 'border-color': acc } },
          { selector: 'edge', style: { width: 1.5, 'line-color': line, 'target-arrow-color': line,
            'target-arrow-shape': 'triangle', 'curve-style': 'bezier', 'arrow-scale': 0.8 } }
        ]
      });
      cy.on('tap', 'node', function (e) { cap.textContent = e.target.data('text') || ''; });
      cy.on('tap', function (e) { if (e.target === cy) cap.textContent = ''; });
      box.cy = cy;
    } catch (e) {
      canvas.remove();
      cap.innerHTML = '<pre style="color:#c00">' + String(e.message || e) + '</pre>';
    }
  }

  function render() {
    document.querySelectorAll('pre.cy:not([data-cy])').forEach(function (pre) {
      pre.dataset.cy = '1';
      load(0, function () { cytoscape.use(cytoscapeDagre); draw(pre); });
    });
  }

  window.__cy = { render: render, parse: parse };
  render();
})();
