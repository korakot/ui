(function () {
  if (window.__points) { window.__points.render(); return; }
  var CSS = '.points{display:block;margin:0 0 1rem;white-space:normal;font-family:var(--font-sans)}' +
    '.point-legend{display:flex;flex-wrap:wrap;gap:16px;font-size:12px;color:var(--text-muted);margin:0 0 12px;align-items:center}' +
    '.point-legend b{font-weight:500;color:var(--text-secondary)}' +
    '.point-dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:6px}' +
    '.point-row{padding:12px;border:0.5px solid var(--border);border-radius:var(--radius);margin:0 0 8px}' +
    '.point-t{font-size:14px;font-weight:500;margin:0 0 4px}' +
    '.point-c{font-size:13px;color:var(--text-secondary);line-height:1.5}' +
    '.point-f{display:flex;gap:12px;align-items:center;margin-top:10px;flex-wrap:wrap}' +
    '.point-f input{flex:1;min-width:200px}' +
    '.point-acts{display:flex;gap:6px;flex-shrink:0}' +
    '.point-acts button{font-weight:400;color:var(--text-secondary);background:transparent;border:0.5px solid var(--border)}' +
    '.point-acts button.on{color:#fff;font-weight:500;border:0.5px solid transparent}' +
    '.point-ov{margin-top:1rem}.point-ov label{display:block;font-size:13px;color:var(--text-secondary);margin:0 0 6px}' +
    '.point-ov textarea{width:100%;resize:vertical}' +
    '.point-bar{display:flex;align-items:center;gap:12px;margin-top:1rem}' +
    '.point-msg{font-size:13px;color:var(--text-secondary)}' +
    '.point-row > .point-body{font-size:14px;line-height:1.6;margin:0 0 4px}' +
    '.point-x{font-weight:400;color:var(--text-secondary);background:transparent;border:0.5px solid var(--border)}';

  var COLORS = ['#0F6E56', '#A32D2D', '#5F5E5A', '#185FA5'];
  var THAI_RE = /[\u0E00-\u0E7F]/;

  var PRESETS = {
    en: {
      claims: 'Accept:take the claim as stated|Reject:drop the claim',
      triage: 'Resolve:close now; comment becomes resolution|Drop:stop tracking',
      select: 'Include:ship this option|Exclude:leave out',
      code: 'Apply:merge this change|Discard:close without merging'
    },
    th: {
      claims: '\u0e22\u0e2d\u0e21\u0e23\u0e31\u0e1a:\u0e23\u0e31\u0e1a\u0e02\u0e49\u0e2d\u0e04\u0e27\u0e32\u0e21\u0e15\u0e32\u0e21\u0e17\u0e35\u0e48\u0e23\u0e30\u0e1a\u0e38|\u0e1b\u0e0f\u0e34\u0e40\u0e2a\u0e18:\u0e15\u0e31\u0e14\u0e02\u0e49\u0e2d\u0e04\u0e27\u0e32\u0e21\u0e17\u0e34\u0e49\u0e07',
      triage: '\u0e41\u0e01\u0e49\u0e41\u0e25\u0e49\u0e27:\u0e1b\u0e34\u0e14\u0e15\u0e2d\u0e19\u0e19\u0e35\u0e49; \u0e04\u0e2d\u0e21\u0e40\u0e21\u0e19\u0e15\u0e4c\u0e04\u0e37\u0e2d\u0e17\u0e32\u0e07\u0e41\u0e01\u0e49|\u0e17\u0e34\u0e49\u0e07:\u0e40\u0e25\u0e34\u0e01\u0e15\u0e34\u0e14\u0e15\u0e32\u0e21',
      select: '\u0e23\u0e27\u0e21:\u0e40\u0e25\u0e37\u0e2d\u0e01\u0e15\u0e31\u0e27\u0e40\u0e25\u0e37\u0e2d\u0e01\u0e19\u0e35\u0e49|\u0e44\u0e21\u0e48\u0e23\u0e27\u0e21:\u0e44\u0e21\u0e48\u0e40\u0e2d\u0e32',
      code: '\u0e43\u0e0a\u0e49:\u0e23\u0e27\u0e21\u0e01\u0e32\u0e23\u0e40\u0e1b\u0e25\u0e35\u0e48\u0e22\u0e19\u0e41\u0e1b\u0e25\u0e07\u0e19\u0e35\u0e49|\u0e17\u0e34\u0e49\u0e07:\u0e1b\u0e34\u0e14\u0e42\u0e14\u0e22\u0e44\u0e21\u0e48\u0e23\u0e27\u0e21'
    }
  };

  var STR = {
    en: {
      overall: 'Overall comment',
      notePh: 'Comment',
      hint: 'a comment alone, or with a button, both work',
      submit: 'Submit \u2197',
      sent: 'Sent',
      submitted: 'Submitted.',
      explain: 'Explain \u2197',
      explainMsg: 'Explain this point: {t} (review of {k})'
    },
    th: {
      overall: '\u0e04\u0e27\u0e32\u0e21\u0e40\u0e2b\u0e47\u0e19\u0e42\u0e14\u0e22\u0e23\u0e27\u0e21',
      notePh: '\u0e04\u0e27\u0e32\u0e21\u0e40\u0e2b\u0e47\u0e19',
      hint: '\u0e43\u0e2a\u0e48\u0e40\u0e09\u0e1e\u0e32\u0e30\u0e04\u0e27\u0e32\u0e21\u0e40\u0e2b\u0e47\u0e19 \u0e2b\u0e23\u0e37\u0e2d \u0e01\u0e14\u0e1b\u0e38\u0e48\u0e21\u0e14\u0e49\u0e27\u0e22\u0e01\u0e47\u0e44\u0e14\u0e49',
      submit: '\u0e2a\u0e48\u0e07 \u2197',
      sent: '\u0e2a\u0e48\u0e07\u0e41\u0e25\u0e49\u0e27',
      submitted: '\u0e2a\u0e48\u0e07\u0e41\u0e25\u0e49\u0e27',
      explain: '\u0e2d\u0e18\u0e34\u0e1a\u0e32\u0e22 \u2197',
      explainMsg: '\u0e2d\u0e18\u0e34\u0e1a\u0e32\u0e22\u0e02\u0e49\u0e2d\u0e19\u0e35\u0e49: {t} (\u0e23\u0e35\u0e27\u0e34\u0e27 {k})'
    }
  };

  function attr(e, name) {
    for (var n = e; n && n.getAttribute; n = n.parentNode) {
      var v = n.getAttribute(name);
      if (v != null && v !== '') return v;
    }
    return '';
  }

  function detectLang(els) {
    for (var i = 0; i < els.length; i++) {
      var l = attr(els[i], 'lang').toLowerCase();
      if (l === 'th' || l === 'en') return l;
    }
    var text = els.map(function (e) { return attr(e, 'topic') + (e.getAttribute('title') || '') + e.textContent; }).join('');
    return THAI_RE.test(text) ? 'th' : 'en';
  }

  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }

  function acts(spec, lang) {
    var key = (spec || 'claims').trim();
    var table = PRESETS[lang] || PRESETS.en;
    var s = table[key] || spec || table.claims;
    return s.split('|').map(function (p) {
      var i = p.indexOf(':');
      return i < 0 ? { label: p.trim(), desc: '' } : { label: p.slice(0, i).trim(), desc: p.slice(i + 1).trim() };
    }).slice(0, 4);
  }

  function points(text) {
    return text.split('\n').map(function (l) { return l.trim(); })
      .filter(function (l) { return l && l[0] !== '#'; })
      .map(function (l) {
        var i = l.indexOf('|');
        return i < 0 ? { title: l, ctx: '' } : { title: l.slice(0, i).trim(), ctx: l.slice(i + 1).trim() };
      });
  }

  function expandPre(pre) {
    var wrap = el('div');
    wrap.setAttribute('topic', pre.getAttribute('topic') || '');
    if (pre.getAttribute('acts')) wrap.setAttribute('acts', pre.getAttribute('acts'));
    if (pre.getAttribute('lang')) wrap.setAttribute('lang', pre.getAttribute('lang'));
    points(pre.textContent).forEach(function (p) {
      var d = el('div');
      d.setAttribute('review', '');
      d.setAttribute('title', p.title);
      if (p.ctx) d.appendChild(el('div', 'point-body', p.ctx));
      wrap.appendChild(d);
    });
    pre.parentNode.replaceChild(wrap, pre);
    return wrap;
  }

  function buildRow(e, lang, s) {
    var A = acts(attr(e, 'acts'), lang);
    var title = e.getAttribute('title') || '';
    e.removeAttribute('title');
    e.className = (e.className ? e.className + ' ' : '') + 'point-row';
    if (title) {
      var t = el('div', 'point-t', title);
      e.insertBefore(t, e.firstChild);
    }
    var f = el('div', 'point-f');
    var inp = el('input');
    inp.type = 'text';
    inp.placeholder = s.notePh;
    f.appendChild(inp);
    var g = el('div', 'point-acts');
    A.forEach(function (a, i) {
      var b = el('button', null, a.label);
      b.onclick = function () { pick(g, i, A); };
      g.appendChild(b);
    });
    var x = el('button', 'point-x', s.explain);
    x.onclick = function () {
      var msg = s.explainMsg.replace('{t}', title).replace('{k}', attr(e, 'topic') || '-');
      if (window.sendPrompt) sendPrompt(msg); else console.log(msg);
    };
    g.appendChild(x);
    f.appendChild(g);
    e.appendChild(f);
    return { el: e, title: title, A: A, inp: inp, g: g, topic: attr(e, 'topic') };
  }

  function pick(g, i, A) {
    if (g.dataset.sel === String(i)) i = -1;
    Array.prototype.forEach.call(g.children, function (b, j) {
      if (b.className === 'point-x') return;
      b.className = j === i ? 'on' : '';
      b.style.background = j === i ? COLORS[i] : 'transparent';
      if (j === i) {
        b.innerHTML = '<i class="ti ti-check" style="margin-right:4px;font-size:14px;vertical-align:-1px" aria-hidden="true"></i>' + A[i].label;
      } else b.textContent = A[j].label;
    });
    if (i < 0) delete g.dataset.sel; else g.dataset.sel = i;
  }

  function legend(A, s) {
    var lg = el('div', 'point-legend');
    A.forEach(function (a, i) {
      var sp = el('span');
      var d = el('span', 'point-dot');
      d.style.background = COLORS[i];
      sp.appendChild(d);
      sp.appendChild(el('b', null, a.label));
      lg.appendChild(sp);
    });
    var hint = el('span', null, s.hint);
    hint.style.color = 'var(--text-muted)';
    lg.appendChild(hint);
    return lg;
  }

  function groupKey(e) {
    for (var n = e.parentNode; n && n.getAttribute; n = n.parentNode) {
      if (n.getAttribute('topic') != null) return n;
    }
    return document.body;
  }

  function output(grp) {
    var kept = [], skipped = [];
    grp.rows.forEach(function (r) {
      var sel = r.g.dataset.sel;
      var note = r.inp.value.trim();
      if (sel == null) {
        if (note) kept.push('- ' + r.title + ' | ' + note);
        else skipped.push(r.title);
        return;
      }
      var act = r.A[+sel].label.toUpperCase();
      kept.push('- [' + act + '] ' + r.title + ' | Comment: ' + (note || '(none)'));
    });
    if (skipped.length) kept.push('- [SKIP] ' + skipped.join(', '));
    var o = grp.ta ? grp.ta.value.trim() : '';
    return 'Review of ' + (grp.topic || 'these points') + ':\n' + kept.join('\n') +
      (o ? '\n\nOverall comment:\n' + o : '');
  }

  function render() {
    if (!document.getElementById('point-css')) {
      var st = el('style'); st.id = 'point-css'; st.textContent = CSS; document.head.appendChild(st);
    }
    Array.prototype.slice.call(document.querySelectorAll('pre.points')).forEach(expandPre);
    var els = Array.prototype.slice.call(document.querySelectorAll('[review]'));
    if (!els.length) return;
    var lang = detectLang(els);
    var s = STR[lang];

    var groups = [], byKey = [];
    els.forEach(function (e) {
      var k = groupKey(e);
      var gi = byKey.indexOf(k);
      if (gi < 0) { byKey.push(k); groups.push({ key: k, topic: k.getAttribute ? (k.getAttribute('topic') || '') : '', rows: [] }); gi = groups.length - 1; }
      groups[gi].rows.push(buildRow(e, lang, s));
    });

    var lastActs = '';
    groups.forEach(function (grp) {
      var first = grp.rows[0].el;
      var sig = grp.rows[0].A.map(function (a) { return a.label; }).join('|');
      if (sig !== lastActs) {
        first.parentNode.insertBefore(legend(grp.rows[0].A, s), first);
        lastActs = sig;
      }
      var lastEl = grp.rows[grp.rows.length - 1].el;
      var ov = el('div', 'point-ov');
      var ta = el('textarea');
      ta.rows = 3;
      ov.appendChild(el('label', null, s.overall)); ov.appendChild(ta);
      lastEl.parentNode.insertBefore(ov, lastEl.nextSibling);
      grp.ta = ta; grp.lastEl = ov;
    });

    var tail = groups[groups.length - 1].lastEl;
    var bar = el('div', 'point-bar');
    var btn = el('button', null, s.submit);
    var msg = el('span', 'point-msg');
    bar.appendChild(btn); bar.appendChild(msg);
    tail.parentNode.insertBefore(bar, tail.nextSibling);
    btn.onclick = function () {
      if (btn.disabled) return;
      btn.disabled = true;
      var out = groups.map(output).join('\n\n');
      if (window.sendPrompt) sendPrompt(out); else console.log(out);
      msg.textContent = s.submitted;
      btn.textContent = s.sent;
    };
  }

  window.__points = { render: render };
  render();
})();
