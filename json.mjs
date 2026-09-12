// json.mjs v0.10 — minimal JSON editor shell powered by vanilla-jsoneditor.
// Declarative usage:
//   <pre class="json" data-depth="2">{"name":"korakot/ui","active":true}</pre>
//   <script type="module">import '.../json.mjs';</script>
// Importing the module automatically renders all matching blocks.

import { createJSONEditor } from 'https://cdn.jsdelivr.net/npm/vanilla-jsoneditor@3.13.0/standalone.js/+esm';

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
    card: cssAny(['--viz-card', '--surface-1'], '#f7f7f7')
  };
}

function button(label, c) {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = label;
  b.style.cssText = `min-height:36px;padding:6px 10px;border:1px solid ${c.border};border-radius:6px;background:transparent;color:${c.text};font:inherit;cursor:pointer`;
  return b;
}

function jsonFromContent(content) {
  if (content && Object.prototype.hasOwnProperty.call(content, 'json')) return content.json;
  if (content && typeof content.text === 'string') return JSON.parse(content.text);
  return null;
}

function simplifyContextMenu(items) {
  const found = {};

  function visit(list) {
    for (const item of list || []) {
      if (item?.type === 'button') {
        if (item.text === 'Remove') found.remove = item;
        else if (item.text === 'Insert before') found.insertBefore = item;
        else if (item.text === 'Insert after') found.insertAfter = item;
        else if (item.text === 'Edit key') found.editKey = item;
      } else if ((item?.type === 'row' || item?.type === 'column') && Array.isArray(item.items)) {
        visit(item.items);
      }
    }
  }

  visit(items);
  return [found.remove, found.insertBefore, found.insertAfter, found.editKey].filter(Boolean);
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

  const style = document.createElement('style');
  style.textContent = `
    .json-out .json-editor-host { min-width:0; }
    .json-out .jse-main { border:0 !important; }
    .json-out .jse-contents { border:0 !important; }
    .json-out .jse-insert-selection-area { display:none !important; }
    .json-out .jse-tip { display:none !important; }
  `;

  const toolbar = document.createElement('div');
  toolbar.style.cssText = 'display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-bottom:8px';
  const expand = button('Expand all', c);
  const collapse = button('Collapse all', c);
  const copy = button('Copy JSON', c);
  toolbar.append(expand, collapse, copy);

  const panel = document.createElement('div');
  panel.style.cssText = `border:1px solid ${c.border};border-radius:8px;padding:6px;overflow-x:auto;background:transparent`;
  const host = document.createElement('div');
  host.className = 'json-editor-host';
  panel.appendChild(host);

  const status = document.createElement('div');
  status.setAttribute('aria-live', 'polite');
  status.style.cssText = `min-height:1.5em;margin-top:5px;color:${c.muted};font:12px/1.4 system-ui,sans-serif`;

  const copyBuffer = document.createElement('textarea');
  copyBuffer.setAttribute('aria-hidden', 'true');
  copyBuffer.tabIndex = -1;
  copyBuffer.style.cssText = 'position:absolute;left:-9999px;top:0;width:1px;height:1px;opacity:0';

  root.append(style, toolbar, panel, status, copyBuffer);
  el.replaceWith(root);

  const requestedDepth = Number(options.depth);
  const depth = options.depth == null || options.depth === '' || !Number.isFinite(requestedDepth)
    ? null
    : Math.max(0, Math.floor(requestedDepth));

  let content = { json: structuredClone(data) };

  const editor = createJSONEditor({
    target: host,
    props: {
      content,
      mode: 'tree',
      mainMenuBar: false,
      navigationBar: false,
      statusBar: false,
      indentation: options.space ?? 2,
      onRenderContextMenu(items) {
        return simplifyContextMenu(items);
      },
      onChange(updatedContent) {
        content = updatedContent;
        status.textContent = 'JSON updated';
      },
      onError(error) {
        status.textContent = error?.message || String(error);
      }
    }
  });

  queueMicrotask(async () => {
    try {
      if (depth == null) {
        await editor.expand([], () => true);
      } else {
        await editor.collapse([], true);
        if (depth > 0) await editor.expand([], relativePath => relativePath.length < depth);
      }
    } catch (_) {}
  });

  function currentData() {
    return jsonFromContent(editor.get());
  }

  function currentText() {
    return stringify(currentData(), options.space ?? 2);
  }

  expand.addEventListener('click', async () => {
    await editor.expand([], () => true);
    status.textContent = 'Expanded all';
  });

  collapse.addEventListener('click', async () => {
    await editor.collapse([], true);
    status.textContent = 'Collapsed all';
  });

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
    editor,
    get data() { return currentData(); },
    get: currentData,
    text: currentText,
    copy: () => copy.click(),
    expandAll: () => expand.click(),
    collapseAll: () => collapse.click(),
    destroy: () => editor.destroy()
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
