(function () {
  var CSS = '.pr{display:block;margin:0 0 1rem;white-space:normal;font-family:var(--font-sans)}' +
    '.pr-legend{display:flex;flex-wrap:wrap;gap:16px;font-size:12px;color:var(--text-muted);margin:0 0 12px}' +
    '.pr-legend b{font-weight:500;color:var(--text-secondary)}' +
    '.pr-dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:6px}' +
    '.pr-row{padding:12px;border:0.5px solid var(--border);border-radius:var(--radius);margin:0 0 8px}' +
    '.pr-t{font-size:14px;font-weight:500;margin:0 0 4px}' +
    '.pr-c{font-size:13px;color:var(--text-secondary);line-height:1.5}' +
    '.pr-tag{display:inline-block;margin-top:6px;font-size:11px;padding:2px 8px;border-radius:var(--radius);background:var(--surface-1);color:var(--text-secondary)}' +
    '.pr-f{display:flex;gap:12px;align-items:center;margin-top:10px;flex-wrap:wrap}' +
    '.pr-f input{flex:1;min-width:200px}' +
    '.pr-acts{display:flex;gap:6px;flex-shrink:0}' +
    '.pr-acts button{font-weight:400;color:var(--text-secondary);background:transparent;border:0.5px solid var(--border)}' +
    '.pr-acts button.on{color:#fff;font-weight:500;border:0.5px solid transparent}' +
    '.pr-ov{margin-top:1rem}.pr-ov label{display:block;font-size:13px;color:var(--text-secondary);margin:0 0 6px}' +
    '.pr-ov textarea{width:100%;resize:vertical}' +
    '.pr-bar{display:flex;align-items:center;gap:12px;margin-top:1rem}' +
    '.pr-msg{font-size:13px;color:var(--text-secondary)}';

  var COLORS = ['#0F6E56', '#A32D2D', '#5F5E5A'];
  var PRESETS = {
    claims: 'Accept:take the claim as stated|Reject:drop the claim|Skip:defer; revisit later',
    triage: 'Resolve:close now; comment becomes resolution|Drop:stop tracking|Keep:leave as-is',
    select: 'Include:ship this option|Exclude:leave out|Maybe:needs more info',
    code: 'Apply:merge this change|Discard:close without merging|Defer:needs follow-up'
  };
  var MARK = { '+': 0, '-': 1, '~': 2 };

  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }

  function acts(spec) {
    var s = PRESETS[(spec || 'claims').trim()] || spec || PRESETS.claims;
    return s.split('|').map(function (p) {
      var i = p.indexOf(':');
      return i < 0 ? { label: p.trim(), desc: '' } : { label: p.slice(0, i).trim(), desc: p.slice(i + 1).trim() };
    }).slice(0, 3);
  }

  function points(text) {
    return text.split('\n').map(function (l) { return l.trim(); })
      .filter(function (l) { return l && l[0] !== '#'; })
      .map(function (l) {
        var def = null;
        if (MARK[l[0]] != null && l[1] === ' ') { def = MARK[l[0]]; l = l.slice(2); }
        var f = l.split('|').map(function (s) { return s.trim(); });
        return { title: f[0], ctx: f[1] || '', tag: f[2] || '', def: def };
      });
  }

  function build(pre) {
    var A = acts(pre.getAttribute('acts'));
    var P = points(pre.textContent);
    var topic = pre.getAttribute('topic') || '';
    var box = el('div', 'pr');
    pre.parentNode.replaceChild(box, pre);

    var lg = el('div', 'pr-legend');
    A.forEach(function (a, i) {
      var s = el('span');
      var d = el('span', 'pr-dot');
      d.style.background = COLORS[i];
      s.appendChild(d);
      var b = el('b', null, a.label);
      s.appendChild(b);
      if (a.desc) s.appendChild(el('span', null, ' \u2014 ' + a.desc));
      lg.appendChild(s);
    });
    box.appendChild(lg);

    P.forEach(function (p) {
      var row = el('div', 'pr-row');
      row.appendChild(el('div', 'pr-t', p.title));
      if (p.ctx) row.appendChild(el('div', 'pr-c', p.ctx));
      if (p.tag) row.appendChild(el('span', 'pr-tag', p.tag));
      var f = el('div', 'pr-f');
      var inp = el('input');
      inp.type = 'text';
      inp.placeholder = 'Optional note / resolution';
      f.appendChild(inp);
      var g = el('div', 'pr-acts');
      A.forEach(function (a, i) {
        var b = el('button', null, a.label);
        b.onclick = function () { pick(g, i); };
        g.appendChild(b);
      });
      f.appendChild(g);
      row.appendChild(f);
      box.appendChild(row);
      p.row = row; p.inp = inp; p.g = g;
      if (p.def != null) pick(g, p.def);
    });

    function pick(g, i) {
      Array.prototype.forEach.call(g.children, function (b, j) {
        b.className = j === i ? 'on' : '';
        b.style.background = j === i ? COLORS[i] : 'transparent';
        if (j === i) {
          b.innerHTML = '<i class="ti ti-check" style="margin-right:4px;font-size:14px;vertical-align:-1px" aria-hidden="true"></i>' + A[i].label;
        } else b.textContent = A[j].label;
      });
      g.dataset.sel = i;
    }

    var ov = el('div', 'pr-ov');
    var lab = el('label', null, 'Overall comment (optional) \u2014 feedback that belongs to no single row');
    var ta = el('textarea');
    ta.rows = 3;
    ov.appendChild(lab); ov.appendChild(ta);
    box.appendChild(ov);

    var bar = el('div', 'pr-bar');
    var btn = el('button', null, 'Submit \u2197');
    var msg = el('span', 'pr-msg');
    bar.appendChild(btn); bar.appendChild(msg);
    box.appendChild(bar);

    btn.onclick = function () {
      var lines = P.map(function (p) {
        var s = p.g.dataset.sel;
        var act = s == null ? 'NONE' : A[+s].label.toUpperCase();
        return '- [' + act + '] ' + p.title + ' | Comment: ' + (p.inp.value.trim() || '(none)');
      });
      var o = ta.value.trim();
      var out = 'Review of ' + (topic || 'these points') + ':\n' + lines.join('\n') +
        (o ? '\n\nOverall comment:\n' + o : '');
      if (window.sendPrompt) sendPrompt(out); else console.log(out);
      msg.textContent = 'Submitted.';
      btn.textContent = 'Sent';
    };
  }

  function render() {
    if (!document.getElementById('pr-css')) {
      var st = el('style'); st.id = 'pr-css'; st.textContent = CSS; document.head.appendChild(st);
    }
    Array.prototype.slice.call(document.querySelectorAll('pre.pr')).forEach(build);
  }

  window.__pr = { render: render };
  render();
})();
