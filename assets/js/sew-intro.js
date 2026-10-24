/* Maistu · intro "cucita": l'ago cuce il marchio punto per punto, poi compaiono nome e motto.
   Usa il logo verticale originale (maistu-logo-verticale-trasparente-per-fondi-scuri.svg)
   senza modificarne la geometria: anima solo la comparsa dei suoi elementi.
   Espone window.MaistuSew.play() per il pulsante "Rivedi". */
(function () {
  'use strict';
  var host = document.getElementById('k01');
  if (!host || !window.fetch || !window.requestAnimationFrame) return;
  var SRC = 'assets/img/maistu-logo-verticale-trasparente-per-fondi-scuri.svg';
  var NS = 'http://www.w3.org/2000/svg';
  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var TIP = [158.12, 40.67];          // punta dell'ago nella posizione finale
  var EYE = [179.96 - TIP[0], 5.32 - TIP[1]]; // cruna, relativa alla punta
  var svg, parts, raf = 0, t0 = 0, plan = [], trail = [], trailEl, dur = 0;

  var ease = function (x) { return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  var lerp = function (a, b, k) { return a + (b - a) * k; };
  function pts(el) { return el.getAttribute('points').trim().split(/\s+/).map(function (p) { var q = p.split(','); return [+q[0], +q[1]]; }); }

  function setup(txt) {
    var tmp = document.createElement('div');
    tmp.innerHTML = txt;
    svg = tmp.querySelector('svg');
    if (!svg) return false;
    svg.removeAttribute('width'); svg.removeAttribute('height');
    svg.setAttribute('class', 'sew-svg');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Maistu, il gestionale su misura');
    var kids = Array.prototype.slice.call(svg.children);
    parts = { tile: null, zz: [], col1: [], v: [], col2: [], rombo: null, rombini: null, filo: null, ago: null, name: [], motto: [] };
    kids.forEach(function (el) {
      var tag = el.tagName.toLowerCase(), fill = (el.getAttribute('fill') || '').toUpperCase(), tr = el.getAttribute('transform') || '', d = el.getAttribute('d') || '';
      if (tag === 'rect' && el.getAttribute('rx') && +el.getAttribute('width') > 100) parts.tile = el;
      else if (tag === 'polyline') parts.zz.push(el);
      else if (tag === 'rect' && fill === '#F5F7FB') (+el.getAttribute('x') < 100 ? parts.col1 : parts.col2).push(el);
      else if (tag === 'rect' && fill === '#F7842A') parts.v.push(el);
      else if (tag === 'g') parts.ago = el;
      else if (tag === 'path' && tr.indexOf('248.99') > -1) parts.name.push(el);
      else if (tag === 'path' && tr.indexOf('281.10') > -1) parts.motto.push(el);
      else if (tag === 'path' && d.indexOf(' A') > -1) parts.filo = el;
      else if (tag === 'path' && el.getAttribute('fill') === 'none') parts.rombo = el;
      else if (tag === 'path') parts.rombini = el;
    });
    if (!parts.tile || parts.zz.length < 2 || !parts.ago || !parts.filo) return false;
    // ordine di cucitura della M: colonna sinistra dal basso, la V, colonna destra dall'alto
    var y = function (e) { return +e.getAttribute('y'); }, x = function (e) { return +e.getAttribute('x'); };
    parts.col1.sort(function (a, b) { return y(b) - y(a); });
    parts.col2.sort(function (a, b) { return y(a) - y(b); });
    parts.v.sort(function (a, b) { return x(a) - x(b); });
    parts.dots = parts.col1.concat(parts.v, parts.col2);
    // filo che segue l'ago
    trailEl = document.createElementNS(NS, 'polyline');
    trailEl.setAttribute('fill', 'none');
    trailEl.setAttribute('stroke', '#F7842A');
    trailEl.setAttribute('stroke-width', '1.5');
    trailEl.setAttribute('stroke-linecap', 'round');
    trailEl.setAttribute('stroke-linejoin', 'round');
    trailEl.setAttribute('class', 'sew-trail');
    svg.insertBefore(trailEl, parts.ago);
    [parts.zz[0], parts.zz[1], parts.filo].forEach(function (el) { el.setAttribute('pathLength', '1'); });
    buildPlan();
    host.innerHTML = '';
    host.appendChild(svg);
    host.classList.add('sewn');
    return true;
  }

  // Il percorso dell'ago: segmenti [t0, t1, da, a] in secondi, più gli eventi di comparsa.
  function buildPlan() {
    plan = []; var t = 0.35;
    function move(to, d) { var from = plan.length ? plan[plan.length - 1][3] : [236, -14]; plan.push([t, t + d, from, to]); t += d; }
    move(pts(parts.zz[0])[0], 0.4);
    parts.zzT = [];
    [0, 1].forEach(function (i) {
      var p = pts(parts.zz[i]);
      if (i === 1) move(p[0], 0.22);
      var s = t;
      for (var k = 1; k < p.length; k++) move(p[k], 0.075);
      parts.zzT.push([s, t]);
    });
    parts.dotT = [];
    parts.dots.forEach(function (el, i) {
      var c = [+el.getAttribute('x') + 4.2, +el.getAttribute('y') + 4.2];
      move(c, i === 0 ? 0.2 : 0.06);
      parts.dotT.push(t);
    });
    move([100, 136.8], 0.16); parts.romboT = t;
    move([TIP[0], TIP[1]], 0.5); parts.landT = t;
    parts.filoT = [t + 0.05, t + 0.75];
    parts.nameT = t + 0.55;
    parts.mottoT = parts.nameT + parts.name.length * 0.1 + 0.25;
    dur = parts.mottoT + 0.7;
  }

  function needleAt(time) {
    if (!plan.length) return TIP;
    if (time <= plan[0][0]) return plan[0][2];
    for (var i = 0; i < plan.length; i++) {
      var s = plan[i];
      if (time <= s[1]) { var k = ease((time - s[0]) / (s[1] - s[0])); return [lerp(s[2][0], s[3][0], k), lerp(s[2][1], s[3][1], k)]; }
    }
    return plan[plan.length - 1][3];
  }
  function show(el, on) { if (el) el.classList.toggle('on', on); }
  function frame(now) {
    var time = (now - t0) / 1000;
    var P = needleAt(time);
    parts.ago.setAttribute('transform', 'translate(' + (P[0] - TIP[0]).toFixed(2) + ' ' + (P[1] - TIP[1]).toFixed(2) + ')');
    show(parts.ago, time > 0.3);
    show(parts.tile, time > 0);
    // cornici: il filo arancio si stende dietro l'ago
    parts.zz.forEach(function (el, i) {
      var r = parts.zzT[i], k = Math.max(0, Math.min(1, (time - r[0]) / (r[1] - r[0])));
      el.style.strokeDashoffset = String(1 - k);
      el.style.opacity = time >= r[0] ? 1 : 0;
    });
    parts.dots.forEach(function (el, i) { show(el, time >= parts.dotT[i]); });
    show(parts.rombo, time >= parts.romboT); show(parts.rombini, time >= parts.romboT);
    var f = Math.max(0, Math.min(1, (time - parts.filoT[0]) / (parts.filoT[1] - parts.filoT[0])));
    parts.filo.style.strokeDashoffset = String(1 - ease(f));
    parts.filo.style.opacity = f > 0 ? 1 : 0;
    parts.name.forEach(function (el, i) { show(el, time >= parts.nameT + i * 0.1); });
    parts.motto.forEach(function (el) { show(el, time >= parts.mottoT); });
    // filo volante dalla cruna: ultimi 0,35 s di movimento, sparisce quando l'ago si posa
    var eye = [P[0] + EYE[0], P[1] + EYE[1]];
    trail.push([time, eye]);
    while (trail.length && time - trail[0][0] > 0.35) trail.shift();
    var fade = time < parts.landT ? 1 : Math.max(0, 1 - (time - parts.landT) / 0.3);
    trailEl.setAttribute('points', fade > 0 ? trail.map(function (q) { return q[1][0].toFixed(1) + ',' + q[1][1].toFixed(1); }).join(' ') : '');
    trailEl.style.opacity = fade * 0.9;
    if (time < dur) raf = requestAnimationFrame(frame);
    else finish();
  }
  function finish() {
    cancelAnimationFrame(raf); raf = 0;
    Array.prototype.forEach.call(svg.children, function (el) { el.classList && el.classList.add('on'); });
    parts.ago.removeAttribute('transform');
    parts.zz.concat([parts.filo]).forEach(function (el) { el.style.strokeDashoffset = '0'; el.style.opacity = 1; });
    trailEl.setAttribute('points', '');
    host.classList.add('done');
    host.dispatchEvent(new CustomEvent('sewn'));
  }
  function play() {
    if (!svg) return;
    cancelAnimationFrame(raf);
    host.classList.remove('done');
    Array.prototype.forEach.call(svg.querySelectorAll('.on'), function (el) { el.classList.remove('on'); });
    trail = [];
    if (reduce) { finish(); return; }
    svg.classList.add('ready');
    t0 = performance.now();
    raf = requestAnimationFrame(frame);
  }
  window.MaistuSew = { play: play, duration: function () { return dur; } };
  fetch(SRC).then(function (r) { return r.ok ? r.text() : Promise.reject(); })
    .then(function (txt) { if (setup(txt)) play(); })
    .catch(function () { /* resta l'animazione K01 in <img> */ });
})();
