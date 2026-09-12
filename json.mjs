// json.mjs v0.3 — collapsible JSON viewer with primitive-value editing, Copy JSON, and initial depth control.
// Declarative usage:
//   <pre class="json" data-depth="2">{"name":"korakot/ui","active":true}</pre>
//   <script type="module">import '.../json.mjs';</script>
// Importing the module automatically renders all matching blocks.

function cssAny(names, fallback) {
  const style = getComputedStyle(document.documentElement);
  for (const name of names) {
    const value = style.getPropertyValue(name).trim();
    if (value) return value;
  }
  return fallback;
}

function colors() {
  return {
    text: cssAny(['--viz-text', '--text-primary'], '#222'),
    muted: cssAny(['--viz-muted', '--text-secondary'], '#666'),
    border: cssAny(['--viz-border', '--border'], '#ddd'),
    card: cssAny(['--viz-card', '--surface-1'], '#f7f7f7'),
    accent: cssAny(['--viz-accent', '--border-accent'], '#378ADD'),
    string: cssAny(['--viz-series-3'], '#2f7d32'),
    number: cssAny(['--viz-series-2'], '#7a55b6'),
    boolean: cssAny(['--viz-series-4'], '#b05a00')
  };
}

function keyLabel(key) {
  return key == null ? '' : String(key) + ': ';
}

function valueText(value) {
  if (value === null) return 'null';
  if (typeof value === 'string') return JSON.stringify(value);
  return String(value);
}

function valueColor(value, c) {
  if (value === null) return c.muted;
  if (typeof value === 'string') return c.string;
  if (typeof value === 'number') return c.number;
  if (typeof value === 'boolean') return c.boolean;
  return c.text;
}

function parseEdited(text, original) {
  if (typeof original === 'string') {
    const trimmed = text.trim();
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (typeof parsed === 'string') return parsed;
      } catch (_) {}
    }
    return text;
  }
  if (typeof original === 'number') {
    const n = Number(text.trim());
    if (!Number.isFinite(n)) throw new Error('Enter a valid number');
    return n;
  }
  if (typeof original === 'boolean') {
    const t = text.trim().toLowerCase();
    if (t === 'true') return true;
    if (t === 'false') return false;
    throw new Error('Boolean must be true or false');
  }
  if (original === null) {
    const t = text.trim();
    if (t === 'null') return null;
    try {
      const parsed = JSON.parse(t);
      if (parsed !== null && typeof parsed === 'object') throw new Error();
      return parsed;
    } catch (_) {
      throw new Error('Use null or a primitive JSON value');
    }
  }
  return original;
}

function button(label, c) {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = label;
  b.style.cssText = `min-height:36px;padding:6px 10px;border:1px solid ${c.border};border-radius:6px;background:transparent;color:${c.text};font:inherit;cursor:pointer`;
  return b;
}

function setExpanded(container, expanded) {
  const toggle = container.querySelector(':scope > .json-head > .json-toggle');
  const children = container.querySelector(':scope > .json-children');
  const footer = container.querySelector(':scope > .json-close');
  const summary = container.querySelector(':scope > .json-head > .json-summary');
  if (!toggle || !children || !footer || !summary) return;
  toggle.setAttribute('aria-expanded', String(expanded));
  toggle.textContent = expanded ? '▾' : '▸';
  children.hidden = !expanded;
  footer.hidden = !expanded;
  summary.hidden = expanded;
}

function makePrimitive(value, key, depth, parent, prop, state) {
  const { c, status } = state;
  const row = document.createElement('div');
  row.style.cssText = `padding-left:${depth * 18}px;min-width:max-content;display:flex;align-items:center;gap:2px;min-height:28px`;

  if (key != null) {
    const k = document.createElement('span');
    k.textContent = keyLabel(key);
    row.appendChild(k);
  }

  const valueButton = document.createElement('button');
  valueButton.type = 'button';
  valueButton.textContent = valueText(value);
  valueButton.title = 'Click to edit';
  valueButton.style.cssText = `border:0;border-radius:4px;padding:2px 4px;background:transparent;color:${valueColor(value, c)};font:inherit;text-align:left;cursor:text`;
  row.appendChild(valueButton);

  valueButton.addEventListener('click', () => {
    if (row.querySelector('input')) return;
    const original = parent[prop];
    const input = document.createElement('input');
    input.type = 'text';
    input.value = valueText(original);
    input.style.cssText = `min-width:160px;border:1px solid ${c.border};border-radius:5px;background:${c.card};color:${c.text};padding:4px 7px;font:inherit;outline:none`;
    valueButton.replaceWith(input);
    input.focus();
    input.select();

    let finished = false;
    function restore() { if (input.isConnected) input.replaceWith(valueButton); }
    function cancel() {
      if (finished) return;
      finished = true;
      restore();
      status.textContent = 'Edit cancelled';
    }
    function commit() {
      if (finished) return;
      try {
        const next = parseEdited(input.value, original);
        finished = true;
        parent[prop] = next;
        valueButton.textContent = valueText(next);
        valueButton.style.color = valueColor(next, c);
        restore();
        status.textContent = `${key ?? prop} updated`;
      } catch (error) {
        status.textContent = error?.message || String(error);
        input.focus();
        input.select();
      }
    }

    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        commit();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        cancel();
      }
    });
    input.addEventListener('blur', () => { if (!finished) cancel(); }, { once: true });
  });

  return row;
}

function makeNode(value, key, depth, parent, prop, state) {
  if (value === null || typeof value !== 'object') {
    return makePrimitive(value, key, depth, parent, prop, state);
  }

  const { c } = state;
  const row = document.createElement('div');
  row.className = 'json-object';
  row.style.cssText = `padding-left:${depth * 18}px;min-width:max-content`;

  const entries = Array.isArray(value) ? value.map((v, i) => [i, v]) : Object.entries(value);
  const openChar = Array.isArray(value) ? '[' : '{';
  const closeChar = Array.isArray(value) ? ']' : '}';

  const head = document.createElement('div');
  head.className = 'json-head';
  head.style.cssText = 'display:flex;align-items:center;gap:2px;min-height:28px';

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'json-toggle';
  toggle.textContent = '▾';
  toggle.setAttribute('aria-expanded', 'true');
  toggle.style.cssText = `width:28px;height:28px;border:0;border-radius:4px;background:transparent;color:${c.muted};font:inherit;cursor:pointer`;

  const label = document.createElement('span');
  label.textContent = `${keyLabel(key)}${openChar}`;

  const summary = document.createElement('span');
  summary.className = 'json-summary';
  summary.hidden = true;
  summary.textContent = ` … ${closeChar}  ${entries.length} item${entries.length === 1 ? '' : 's'}`;
  summary.style.color = c.muted;

  head.append(toggle, label, summary);
  row.appendChild(head);

  const children = document.createElement('div');
  children.className = 'json-children';
  for (const [childKey, childValue] of entries) {
    children.appendChild(makeNode(childValue, childKey, depth + 1, value, childKey, state));
  }

  const footer = document.createElement('div');
  footer.className = 'json-close';
  footer.textContent = closeChar;
  footer.style.paddingLeft = '18px';

  row.append(children, footer);
  toggle.addEventListener('click', () => {
    setExpanded(row, toggle.getAttribute('aria-expanded') !== 'true');
  });

  const initiallyExpanded = state.depth == null || depth < state.depth;
  setExpanded(row, initiallyExpanded);
  return row;
}

export function stringify(data, space = 2) {
  return JSON.stringify(data, null, space);
}

export function render(target, data, options = {}) {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!(el instanceof Element)) throw new TypeError('render(target, data): target must be a DOM Element or selector');

  const c = colors();
  const root = document.createElement('div');
  root.className = 'json-out';
  root.style.cssText = `color:${c.text};font:13px/1.5 ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;min-width:0`;

  const toolbar = document.createElement('div');
  toolbar.style.cssText = 'display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-bottom:8px';
  const expand = button('Expand all', c);
  const collapse = button('Collapse all', c);
  const copy = button('Copy JSON', c);
  toolbar.append(expand, collapse, copy);

  const panel = document.createElement('div');
  panel.style.cssText = `border:1px solid ${c.border};border-radius:8px;padding:10px;overflow-x:auto;background:transparent`;
  const tree = document.createElement('div');
  panel.appendChild(tree);

  const status = document.createElement('div');
  status.setAttribute('aria-live', 'polite');
  status.style.cssText = `min-height:1.5em;margin-top:5px;color:${c.muted};font:12px/1.4 system-ui,sans-serif`;

  const copyBuffer = document.createElement('textarea');
  copyBuffer.setAttribute('aria-hidden', 'true');
  copyBuffer.tabIndex = -1;
  copyBuffer.style.cssText = 'position:absolute;left:-9999px;top:0;width:1px;height:1px;opacity:0';

  root.append(toolbar, panel, status, copyBuffer);
  el.replaceWith(root);

  const requestedDepth = Number(options.depth);
  const depth = options.depth == null || options.depth === '' || !Number.isFinite(requestedDepth)
    ? null
    : Math.max(0, Math.floor(requestedDepth));
  const state = { c, status, depth };
  const holder = { value: data };
  tree.appendChild(makeNode(holder.value, null, 0, holder, 'value', state));

  function currentText() {
    return stringify(holder.value, options.space ?? 2);
  }

  expand.addEventListener('click', () => root.querySelectorAll('.json-object').forEach(n => setExpanded(n, true)));
  collapse.addEventListener('click', () => root.querySelectorAll('.json-object').forEach(n => setExpanded(n, false)));
  copy.addEventListener('click', () => {
    copyBuffer.value = currentText();
    copyBuffer.focus();
    copyBuffer.select();
    copyBuffer.setSelectionRange(0, copyBuffer.value.length);
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (_) {}
    status.textContent = ok ? 'JSON copied to clipboard' : 'Copy was blocked in this environment';
  });

  const api = {
    root,
    data: holder.value,
    get: () => holder.value,
    text: currentText,
    copy: () => copy.click(),
    expandAll: () => expand.click(),
    collapseAll: () => collapse.click()
  };
  root.json = api;
  return api;
}

export function renderPre(pre, options = {}) {
  if (!(pre instanceof Element)) throw new TypeError('renderPre(pre): pre must be a DOM Element');
  let data;
  try {
    data = JSON.parse(pre.textContent);
  } catch (error) {
    const message = document.createElement('pre');
    message.style.color = '#c00';
    message.textContent = `Invalid JSON: ${error?.message || error}`;
    pre.replaceWith(message);
    return null;
  }

  const merged = { ...options };
  if (merged.depth == null && pre.dataset.depth != null && pre.dataset.depth !== '') {
    const n = Number(pre.dataset.depth);
    if (Number.isFinite(n)) merged.depth = n;
  }
  return render(pre, data, merged);
}

export function renderAll(root = document, options = {}) {
  const rendered = [];
  root.querySelectorAll('pre.json:not([data-json])').forEach((pre) => {
    pre.dataset.json = '1';
    rendered.push(renderPre(pre, options));
  });
  return rendered;
}

export default { render, renderPre, renderAll, stringify };

renderAll();
