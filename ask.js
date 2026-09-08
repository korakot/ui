(function () {
  var CSS = '.ask{display:block;margin:0 0 1rem}.ask-q{font-size:15px;font-weight:500;margin:0 0 8px}' +
    '.ask-opt{display:flex;align-items:center;gap:10px;padding:8px 12px;border:0.5px solid var(--border);border-radius:var(--radius);margin:0 0 6px;cursor:pointer;background:var(--surface-2);font-size:14px}' +
    '.ask-opt:hover{border-color:var(--border-strong)}.ask-opt.on{border:2px solid var(--border-accent);padding:7px 11px;background:var(--bg-accent);color:var(--text-accent)}' +
    '.ask-opt .n{min-width:20px;color:var(--text-muted);font-size:13px}.ask-opt .sp{flex:1}' +
    '.ask-opt button{padding:0 6px;height:24px;font-size:12px;line-height:1}' +
    '.ask-bar{display:flex;align-items:center;gap:12px;margin:4px 0 0}.ask-err{font-size:13px;color:var(--text-danger)}';

  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }

  function build(a) {
    var type = (a.getAttribute('type') || 'single').toLowerCase();
    var opts = a.textContent.split('|').map(function (s) { return s.trim(); }).filter(Boolean);
    a.textContent = '';
    a.className = 'ask';
    if (a.getAttribute('q')) a.appendChild(el('p', 'ask-q', a.getAttribute('q')));
    var box = el('div');
    a.appendChild(box);
    var state = { type: type, sel: [], order: opts.slice() };

    function draw() {
      box.innerHTML = '';
      var list = type === 'rank' ? state.order : opts;
      list.forEach(function (o, i) {
        var row = el('div', 'ask-opt');
        if (type === 'rank') {
          row.appendChild(el('span', 'n', String(i + 1)));
          row.appendChild(el('span', 'sp', o));
          var up = el('button', null, '\u2191'), dn = el('button', null, '\u2193');
          up.onclick = function (ev) { ev.stopPropagation(); move(i, -1); };
          dn.onclick = function (ev) { ev.stopPropagation(); move(i, 1); };
          row.appendChild(up); row.appendChild(dn);
          row.draggable = true;
          row.ondragstart = function (ev) { ev.dataTransfer.setData('text', String(i)); };
          row.ondragover = function (ev) { ev.preventDefault(); };
          row.ondrop = function (ev) {
            ev.preventDefault();
            var from = +ev.dataTransfer.getData('text');
            var it = state.order.splice(from, 1)[0];
            state.order.splice(i, 0, it); draw();
          };
        } else {
          var on = state.sel.indexOf(o) >= 0;
          if (on) row.classList.add('on');
          var ic = el('i', 'ti ' + (type === 'multi' ? (on ? 'ti-square-check' : 'ti-square') : (on ? 'ti-circle-check' : 'ti-circle')));
          ic.style.fontSize = '18px';
          row.appendChild(ic);
          row.appendChild(el('span', 'sp', o));
          row.onclick = function () {
            if (type === 'multi') { on ? state.sel.splice(state.sel.indexOf(o), 1) : state.sel.push(o); }
            else state.sel = [o];
            draw();
          };
        }
        box.appendChild(row);
      });
    }
    function move(i, d) {
      var j = i + d;
      if (j < 0 || j >= state.order.length) return;
      var t = state.order[i]; state.order[i] = state.order[j]; state.order[j] = t; draw();
    }
    draw();
    a.__ask = state;
  }

  function answer(a) {
    var s = a.__ask, q = a.getAttribute('q') || '';
    var v = s.type === 'rank' ? s.order.join(' > ') : s.sel.join(', ');
    return { q: q, v: v, ok: s.type === 'rank' || s.sel.length > 0 };
  }

  function render() {
    if (!document.getElementById('ask-css')) {
      var st = el('style'); st.id = 'ask-css'; st.textContent = CSS; document.head.appendChild(st);
    }
    var asks = Array.prototype.slice.call(document.querySelectorAll('ask:not([data-ask])'));
    if (!asks.length) return;
    asks.forEach(function (a) { a.dataset.ask = '1'; build(a); });
    var last = asks[asks.length - 1];
    var bar = el('div', 'ask-bar');
    var btn = el('button', null, 'Send \u2197');
    var err = el('span', 'ask-err');
    bar.appendChild(btn); bar.appendChild(err);
    last.parentNode.insertBefore(bar, last.nextSibling);
    btn.onclick = function () {
      var all = Array.prototype.slice.call(document.querySelectorAll('ask[data-ask]'));
      var out = all.map(answer);
      if (out.some(function (o) { return !o.ok; })) { err.textContent = 'Pick an option first'; return; }
      err.textContent = '';
      var msg = out.map(function (o) { return (o.q ? o.q + ' → ' : '') + o.v; }).join('\n');
      if (window.sendPrompt) sendPrompt(msg); else console.log(msg);
      btn.textContent = 'Sent';
    };
  }

  window.__ask = { render: render };
  render();
})();
