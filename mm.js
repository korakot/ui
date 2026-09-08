// mm.js v0.1 — render <pre class="mm"> Mermaid blocks inside chat widgets.
// Usage:
//   <script src="https://cdn.jsdelivr.net/gh/korakot/ui@<tag>/mm.js"></script>
//   <pre class="mm">graph LR; A-->B</pre>
(function () {
  if (window.__mm) { window.__mm.render(); return; }
  var SRC = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js';
  var dark = matchMedia('(prefers-color-scheme: dark)').matches;
  var n = 0, ready = false;

  // Poll for the global, not onload — hosts may re-inject scripts after streaming.
  function load(cb) {
    if (window.mermaid) return cb();
    if (!document.querySelector('script[src="' + SRC + '"]')) {
      var s = document.createElement('script'); s.src = SRC; document.head.appendChild(s);
    }
    var t = setInterval(function () { if (window.mermaid) { clearInterval(t); cb(); } }, 50);
  }

  function render() {
    if (!ready) {
      mermaid.initialize({ startOnLoad: false, theme: dark ? 'dark' : 'neutral' });
      ready = true;
    }
    document.querySelectorAll('pre.mm:not([data-mm])').forEach(function (pre) {
      pre.dataset.mm = '1';
      var code = pre.textContent.trim();
      var box = document.createElement('div');
      box.className = 'mm-out';
      pre.replaceWith(box);
      mermaid.render('mm' + (n++), code)
        .then(function (r) { box.innerHTML = r.svg; })
        .catch(function (e) { box.innerHTML = '<pre style="color:#c00">' + String(e.message || e) + '</pre>'; });
    });
  }

  window.__mm = { render: function () { load(render); } };
  load(render);
})();
