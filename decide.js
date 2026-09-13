(function () {
  if (window.__decide) { window.__decide.render(); return; }
  var CSS = '.decide{display:block;margin:0 0 1rem;white-space:normal;font-family:var(--font-sans)}' +
    '.decide-legend{display:flex;flex-wrap:wrap;gap:16px;font-size:12px;color:var(--text-muted);margin:0 0 12px}' +
    '.decide-legend b{font-weight:500;color:var(--text-secondary)}' +
    '.decide-dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:6px}' +
    '.decide-row{padding:12px;border:0.5px solid var(--border);border-radius:var(--radius);margin:0 0 8px}' +
    '.decide-t{font-size:14px;font-weight:500;margin:0 0 4px}' +
    '.decide-c{font-size:13px;color:var(--text-secondary);line-height:1.5}' +
    '.decide-tag{display:inline-block;margin-top:6px;font-size:11px;padding:2px 8px;border-radius:var(--radius);background:var(--surface-1);color:var(--text-secondary)}' +
    '.decide-f{display:flex;gap:12px;align-items:center;margin-top:10px;flex-wrap:wrap}' +
    '.decide-f input{flex:1;min-width:200px}' +
    '.decide-acts{display:flex;gap:6px;flex-shrink:0}' +
    '.decide-acts button{font-weight:400;color:var(--text-secondary);background:transparent;border:0.5px solid var(--border)}' +
    '.decide-acts button.on{color:#fff;font-weight:500;border:0.5px solid transparent}' +
    '.decide-ov{margin-top:1rem}.decide-ov label{display:block;font-size:13px;color:var(--text-secondary);margin:0 0 6px}' +
    '.decide-ov textarea{width:100%;resize:vertical}' +
    '.decide-bar{display:flex;align-items:center;gap:12px;margin-top:1rem}' +
    '.decide-msg{font-size:13px;color:var(--text-secondary)}';

  var COLORS = ['#0F6E56', '#A32D2D', '#5F5E5A', '#185FA5'];
  var PRESETS = {
    claims: 'Accept:take the claim as stated|Reject:drop the claim',
    triage: 'Resolve:close now; comment becomes resolution|Drop:stop tracking',
    select: 'Include:ship this option|Exclude:leave out',
    code: 'Apply:merge this change|Discard:close without merging'
  };

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
    }).slice(0, 4);
  }

  function points(text) {
    return text.split('\n').map(function (l) { return l.trim(); })
      .filter(function (l) { return l && l[0] !== '#'; })
      .map(function (l) {
        var f = l.split('|').map(function (s) { return s.trim(); });
        return { title: f[0], ctx: f[1] || '', tag: f[2] || '' };
      });
  }

  function build(pre) {
    var A = acts(pre.getAttribute('acts'));
    var P = points(pre.textContent);
    var topic = pre.getAttribute('topic') || '';
    var box = el('div', 'decide');
    pre.parentNode.replaceChild(box, pre);

    var lg = el('div', 'decide-legend');
    A.forEach(function (a, i) {
      var s = el('span');
      var d = el('span', 'decide-dot');
      d.style.background = COLORS[i];
      s.appendChild(d);
      var b = el('b', null, a.label);
      s.appendChild(b);
      if (a.desc) s.appendChild(el('span', null, ' \u2014 ' + a.desc));
      lg.appendChild(s);
    });
    var hint = el('span', null, 'nothing clicked \u2014 skipped; a note alone still comes through');
    hint.style.color = 'var(--text-muted)';
    lg.appendChild(hint);
    box.appendChild(lg);

    P.forEach(function (p) {
      var row = el('div', 'decide-row');
      row.appendChild(el('div', 'decide-t', p.title));
      if (p.ctx) row.appendChild(el('div', 'decide-c', p.ctx));
      if (p.tag) row.appendChild(el('span', 'decide-tag', p.tag));
      var f = el('div', 'decide-f');
      var inp = el('input');
      inp.type = 'text';
      inp.placeholder = 'Optional note / resolution';
      f.appendChild(inp);
      var g = el('div', 'decide-acts');
      A.forEach(function (a, i) {
        var b = el('button', null, a.label);
        b.onclick = function () { pick(g, i); };
        g.appendChild(b);
      });
      f.appendChild(g);
      row.appendChild(f);
      box.appendChild(row);
      p.row = row; p.inp = inp; p.g = g;
    });

    function pick(g, i) {
      if (g.dataset.sel === String(i)) i = -1;
      Array.prototype.forEach.call(g.children, function (b, j) {
        b.className = j === i ? 'on' : '';
        b.style.background = j === i ? COLORS[i] : 'transparent';
        if (j === i) {
          b.innerHTML = '<i class="ti ti-check" style="margin-right:4px;font-size:14px;vertical-align:-1px" aria-hidden="true"></i>' + A[i].label;
        } else b.textContent = A[j].label;
      });
      if (i < 0) delete g.dataset.sel; else g.dataset.sel = i;
    }

    var ov = el('div', 'decide-ov');
    var lab = el('label', null, 'Overall comment (optional) \u2014 feedback that belongs to no single row');
    var ta = el('textarea');
    ta.rows = 3;
    ov.appendChild(lab); ov.appendChild(ta);
    box.appendChild(ov);

    return { box: box, topic: topic, A: A, P: P, ta: ta };
  }

  function output(blk) {
    var kept = [], skipped = [];
    blk.P.forEach(function (p) {
      var s = p.g.dataset.sel;
      var note = p.inp.value.trim();
      if (s == null) {
        if (note) kept.push('- ' + p.title + ' | ' + note);
        else skipped.push(p.title);
        return;
      }
      var act = blk.A[+s].label.toUpperCase();
      kept.push('- [' + act + '] ' + p.title + ' | Comment: ' + (note || '(none)'));
    });
    if (skipped.length) kept.push('- [SKIP] ' + skipped.join(', '));
    var o = blk.ta.value.trim();
    return 'Review of ' + (blk.topic || 'these points') + ':\n' + kept.join('\n') +
      (o ? '\n\nOverall comment:\n' + o : '');
  }

  function render() {
    if (!document.getElementById('decide-css')) {
      var st = el('style'); st.id = 'decide-css'; st.textContent = CSS; document.head.appendChild(st);
    }
    var pres = Array.prototype.slice.call(document.querySelectorAll('pre.decide'));
    if (!pres.length) return;
    var blocks = pres.map(build);
    var last = blocks[blocks.length - 1].box;
    var bar = el('div', 'decide-bar');
    var btn = el('button', null, 'Submit \u2197');
    var msg = el('span', 'decide-msg');
    bar.appendChild(btn); bar.appendChild(msg);
    last.parentNode.insertBefore(bar, last.nextSibling);
    btn.onclick = function () {
      if (btn.disabled) return;
      btn.disabled = true;
      var out = blocks.map(output).join('\n\n');
      if (window.sendPrompt) sendPrompt(out); else console.log(out);
      msg.textContent = 'Submitted.';
      btn.textContent = 'Sent';
    };
  }

  window.__decide = { render: render };
  render();
})();
