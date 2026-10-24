/* Maistu · maistu.it — script del sito (nessuna libreria). */
(function () {
  'use strict';
  var doc = document, html = doc.documentElement;
  var $ = function (s, r) { return (r || doc).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); };
  var clamp = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
  var mq = function (q) { return !!(window.matchMedia && window.matchMedia(q).matches); };
  var reduce = mq('(prefers-reduced-motion: reduce)');
  var lite = mq('(max-width: 900px)');
  if (lite) html.classList.add('m-lite');
  var store = {
    get: function (k, s) { try { return (s ? sessionStorage : localStorage).getItem(k); } catch (e) { return null; } },
    set: function (k, v, s) { try { (s ? sessionStorage : localStorage).setItem(k, v); } catch (e) {} }
  };
  var esc = function (t) { return String(t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var eur = function (n, d) { return '€ ' + Number(n).toLocaleString('it-IT', { minimumFractionDigits: d == null ? 2 : d, maximumFractionDigits: d == null ? 2 : d }); };
  var rnd = function (a) { return a[Math.floor(Math.random() * a.length)]; };
  var cfg = window.MAISTU_CONFIG || {};

  /* ================= tema ================= */
  var themeBtn = $('#theme');
  function currentTheme() {
    var t = html.getAttribute('data-theme');
    if (t) return t;
    return mq('(prefers-color-scheme: light)') ? 'light' : 'dark';
  }
  if (themeBtn) themeBtn.addEventListener('click', function () {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    store.set('maistu-theme', next);
  });

  /* ================= intro cucita ================= */
  // Parte a ogni arrivo sulla pagina, una volta sola (non ciclica). Se lo script
  // dell'ago non si carica, resta l'animazione K01 originale in <img>.
  var k01 = $('#k01'), replay = $('#replay');
  if (k01 && replay) {
    var showReplay = function () { replay.classList.add('show'); };
    k01.addEventListener('sewn', showReplay);
    setTimeout(showReplay, 7600);
    replay.addEventListener('click', function () {
      replay.classList.remove('show');
      if (window.MaistuSew) window.MaistuSew.play();
      else { var im = $('img', k01); if (im) im.src = 'assets/img/maistu-intro-K01.svg?r=' + Date.now(); setTimeout(showReplay, 6200); }
    });
  }

  /* ================= reveal allo scroll ================= */
  var rvs = $$('.rv');
  if (reduce || !('IntersectionObserver' in window)) {
    rvs.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    rvs.forEach(function (el) { io.observe(el); });
    // Rete di sicurezza: mostra ciò che è già passato sullo schermo.
    var sweepT = 0;
    var sweep = function () {
      sweepT = 0;
      var H = window.innerHeight || 700;
      rvs.forEach(function (el) { if (!el.classList.contains('in') && el.getBoundingClientRect().top < H) el.classList.add('in'); });
    };
    window.addEventListener('scroll', function () { if (!sweepT) sweepT = setTimeout(sweep, 300); }, { passive: true });
    setTimeout(sweep, 1500);
  }

  /* ================= nav attiva ================= */
  var navLinks = $$('.links a');
  if ('IntersectionObserver' in window) {
    var secIO = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (!e.isIntersecting) return;
        navLinks.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    navLinks.forEach(function (a) { var s = $(a.getAttribute('href')); if (s) secIO.observe(s); });
  }

  /* ================= marchio esplorabile ================= */
  var stage = $('#markStage');
  if (stage && window.fetch) {
    fetch('assets/img/maistu-marchio.svg').then(function (r) { return r.ok ? r.text() : Promise.reject(); }).then(function (txt) {
      var tmp = doc.createElement('div');
      tmp.innerHTML = txt;
      var svg = tmp.querySelector('svg');
      if (!svg) return;
      svg.removeAttribute('width'); svg.removeAttribute('height');
      svg.setAttribute('aria-hidden', 'true');
      Array.prototype.forEach.call(svg.children, function (el) {
        var tag = el.tagName.toLowerCase(), fill = (el.getAttribute('fill') || '').toUpperCase(), d = el.getAttribute('d') || '';
        if (tag === 'title' || (tag === 'rect' && fill === '#132849')) return;
        var cls = 'part ';
        if (tag === 'polyline') cls += 'p-cornice';
        else if (tag === 'rect') cls += 'p-punti';
        else if (tag === 'g' || (tag === 'path' && d.indexOf('A') > -1)) cls += 'p-ago';
        else cls += 'p-rombi';
        el.setAttribute('class', cls);
      });
      stage.innerHTML = '';
      stage.appendChild(svg);
    }).catch(function () {});
  }
  $$('.sign').forEach(function (b) {
    b.addEventListener('click', function () {
      var on = b.getAttribute('aria-selected') !== 'true';
      $$('.sign').forEach(function (x) { x.setAttribute('aria-selected', 'false'); });
      b.setAttribute('aria-selected', on ? 'true' : 'false');
      if (stage) { if (on) stage.setAttribute('data-focus', b.getAttribute('data-sign')); else stage.removeAttribute('data-focus'); }
    });
  });
  if (stage) stage.removeAttribute('data-focus');

  /* ================= taglia unica / su misura ================= */
  var fit = $('#fit');
  function setFit(mode, instant) {
    fit.setAttribute('data-mode', mode);
    $$('.fit-switch button', fit).forEach(function (b) { b.setAttribute('aria-checked', String(b.getAttribute('data-mode') === mode)); });
    $$('.fit-v', fit).forEach(function (v, i) {
      var txt = v.getAttribute(mode === 'maistu' ? 'data-b' : 'data-a');
      if (instant || reduce) { v.textContent = txt; return; }
      v.classList.add('swap');
      setTimeout(function () { v.textContent = txt; v.classList.remove('swap'); }, 180 + i * 60);
    });
  }
  if (fit) {
    setFit('maistu', true);
    $$('.fit-switch button', fit).forEach(function (b) { b.addEventListener('click', function () { setFit(b.getAttribute('data-mode')); }); });
  }

  /* ================= telaio (visione): si tesse allo scroll, poi brilla ================= */
  var loom = $('#loom'), loomDots = [], loomLit = -1, loomVisible = false;
  if (loom) {
    var COLS = lite ? 17 : 31, ROWS = lite ? 11 : 15, MID = (ROWS - 1) / 2;
    loom.style.gridTemplateColumns = 'repeat(' + COLS + ', 8px)';
    var frag = doc.createDocumentFragment(), list = [];
    for (var y = 0; y < ROWS; y++) for (var x = 0; x < COLS; x++) {
      var i = doc.createElement('i');
      var dx = Math.abs(((x + 3) % 14) - 7), dy = Math.abs(y - MID), dd = dx + dy;
      if (dd === 7 || dd === 3) i.dataset.c = 'o'; else if (dd < 2 || y === 0 || y === ROWS - 1) i.dataset.c = 'w';
      // ordine di tessitura: riga per riga, dal basso, a zig-zag come una navetta
      var row = ROWS - 1 - y, col = row % 2 ? COLS - 1 - x : x;
      list.push({ el: i, k: row * COLS + col });
      frag.appendChild(i);
    }
    loom.appendChild(frag);
    list.sort(function (a, b) { return a.k - b.k; });
    loomDots = list.map(function (o) { return o.el; });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { loomVisible = en[0].isIntersecting; }).observe(loom);
    // Brillio: a caso alcuni punti si accendono e si spengono, come fili che prendono luce.
    if (!reduce) setInterval(function () {
      if (!loomVisible || loomLit < 1) return;
      for (var n = 0; n < (lite ? 3 : 7); n++) {
        var el = loomDots[Math.floor(Math.random() * loomLit)];
        if (!el || el.classList.contains('tw')) continue;
        el.classList.add(Math.random() < .5 ? 'tw' : 'tw2');
        (function (e) { setTimeout(function () { e.classList.remove('tw', 'tw2'); }, 500 + Math.random() * 900); })(el);
      }
    }, 160);
  }
  function paintLoom(p) {
    var n = Math.round(p * loomDots.length);
    if (n === loomLit) return;
    var lo = Math.min(n, Math.max(loomLit, 0)), hi = Math.max(n, Math.max(loomLit, 0));
    for (var k = lo; k < hi; k++) {
      var el = loomDots[k], on = k < n;
      el.className = on ? 'on ' + (el.dataset.c || '') : '';
    }
    loomLit = n;
  }

  /* ================= trama sullo sfondo delle bande notte ================= */
  // Una griglia di punti che si forma mentre la sezione entra nello schermo e poi
  // respira: qualche punto, a caso, si illumina e si spegne.
  var tramas = $$('canvas.trama').map(function (cv) {
    var o = { cv: cv, ctx: cv.getContext('2d'), p: 0, vis: false, dots: [], w: 0, h: 0, gap: lite ? 26 : 22 };
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { o.vis = en[0].isIntersecting; }).observe(cv);
    else o.vis = true;
    return o;
  });
  function sizeTrama(o) {
    var r = o.cv.parentNode.getBoundingClientRect();
    var w = Math.round(r.width), h = Math.round(r.height);
    if (w === o.w && h === o.h) return;
    o.w = w; o.h = h; o.cv.width = w; o.cv.height = h;
    o.dots = [];
    for (var y = o.gap / 2; y < h; y += o.gap) for (var x = o.gap / 2; x < w; x += o.gap) {
      o.dots.push({ x: x, y: y, th: Math.random(), tw: 0, sp: 0, c: Math.random() < .35 ? 1 : 0 });
    }
  }
  var lastT = 0;
  function drawTramas(ts) {
    requestAnimationFrame(drawTramas);
    if (ts - lastT < (lite ? 80 : 42)) return;
    var dt = Math.min(0.2, (ts - lastT) / 1000); lastT = ts;
    tramas.forEach(function (o) {
      if (!o.vis) return;
      sizeTrama(o);
      var c = o.ctx; c.clearRect(0, 0, o.w, o.h);
      var form = reduce ? 1 : o.p;
      for (var i = 0; i < o.dots.length; i++) {
        var d = o.dots[i];
        if (d.th > form) continue;
        if (!reduce) {
          if (d.tw <= 0 && Math.random() < (lite ? 0.003 : 0.004)) { d.tw = 0.001; d.sp = 0.6 + Math.random() * 1.2; }
          if (d.tw > 0) { d.tw += dt * d.sp; if (d.tw >= 2) d.tw = 0; }
        }
        var glow = d.tw > 0 ? Math.sin(d.tw / 2 * Math.PI) : 0;
        var s = 2.6 + glow * 1.6;
        c.fillStyle = d.c && glow > 0 ? 'rgba(247,132,42,' + (0.10 + glow * 0.55).toFixed(3) + ')' : 'rgba(245,247,251,' + (0.07 + glow * 0.32).toFixed(3) + ')';
        c.fillRect(d.x - s / 2, d.y - s / 2, s, s);
      }
    });
  }
  if (tramas.length) requestAnimationFrame(drawTramas);

  /* ================= 15 giorni ================= */
  var days = $('#days .days-row');
  if (days) for (var dd2 = 1; dd2 <= 15; dd2++) { var dsp = doc.createElement('span'); dsp.textContent = dd2; days.appendChild(dsp); }
  var dayEls = days ? $$('span', days) : [];

  /* ================= scroll: filo di lettura, telaio, metodo, divisori ================= */
  var thread = $('#thread'), visionSec = $('#vision'), methodEl = $('#method'), steps = $$('.mstep'), zzs = $$('.zz'), daysBox = $('#days');
  var raf = 0;
  function onScroll() {
    raf = 0;
    var H = window.innerHeight || 800, sy = window.scrollY || window.pageYOffset;
    var max = doc.documentElement.scrollHeight - H;
    if (thread) thread.style.setProperty('--read', clamp(sy / Math.max(1, max)).toFixed(4));
    if (visionSec && loomDots.length) {
      var r = visionSec.getBoundingClientRect();
      paintLoom(reduce ? 1 : clamp((H - r.top) / (H * 0.55 + r.height * 0.6)));
    }
    if (methodEl) {
      var m = methodEl.getBoundingClientRect();
      var p = reduce ? 1 : clamp((H * 0.62 - m.top) / Math.max(1, m.height - 40));
      methodEl.style.setProperty('--mp', p.toFixed(4));
      steps.forEach(function (s) { var b = s.getBoundingClientRect(); s.classList.toggle('lit', b.top + 28 < H * 0.62 || reduce); });
    }
    zzs.forEach(function (z) { var b = z.getBoundingClientRect(); z.style.setProperty('--zp', (reduce ? 1 : clamp((H - b.top) / (H * 0.7))).toFixed(4)); });
    tramas.forEach(function (o) { var b = o.cv.parentNode.getBoundingClientRect(); o.p = Math.max(o.p, clamp((H - b.top) / (H * 0.9))); });
    if (daysBox) {
      var db = daysBox.getBoundingClientRect(), dp = reduce ? 1 : clamp((H * 0.85 - db.top) / (H * 0.5));
      var lit = Math.round(dp * 15);
      dayEls.forEach(function (e, i) { e.classList.toggle('on', i < lit); });
    }
  }
  function req() { if (!raf) raf = requestAnimationFrame(onScroll); }
  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', req);
  onScroll();

  /* ================= moduli (anteprima Bar Centrale) ================= */
  var MODS = {
    ordini: function () {
      var rows = [['#A-1042', 'Bar Centrale', 'prep', 'In preparazione', 1240], ['#A-1041', 'Pasticceria Melis', 'ok', 'Spedito', 386.4], ['#W-0388', 'Giulia Serra', 'new', 'Nuovo · sito', 74.9], ['#A-1040', 'Hotel Sa Perda', 'ok', 'Consegnato', 2105], ['#M-0217', 'Marco Pinna', 'new', 'Nuovo · Amazon', 39.5]];
      return '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Ordine</th><th>Cliente</th><th>Stato</th><th class="r">Totale</th></tr></thead><tbody>' +
        rows.map(function (r) { return '<tr><td class="mono" style="letter-spacing:.06em">' + r[0] + '</td><td>' + r[1] + '</td><td><button type="button" class="pill st-' + r[2] + '" data-cycle>' + r[3] + '</button></td><td class="r">' + eur(r[4]) + '</td></tr>'; }).join('') +
        '</tbody></table></div><p class="tiny muted" style="margin-top:14px">Tocca uno stato per farlo avanzare.</p>';
    },
    magazzino: function () {
      var rows = [['Caffè in grani 1 kg', 8, 40], ['Latte fresco 1 L', 46, 60], ['Cornetti surgelati ×50', 3, 20], ['Acqua naturale 0,5 L ×24', 31, 40], ['Zucchero in bustine ×1000', 14, 20]];
      return '<div class="stock">' + rows.map(function (r, i) {
        var pct = Math.round(r[1] / r[2] * 100), c = pct < 25 ? 'low' : pct < 50 ? 'mid' : '';
        return '<div class="stock-row"><span class="nm">' + r[0] + '</span><span class="bar"><i class="' + c + '" style="width:' + pct + '%"></i></span><span class="qty">' + r[1] + '</span><button type="button" class="mini-btn" data-restock="' + i + '" data-max="' + r[2] + '">Riordina</button></div>';
      }).join('') + '</div><p class="tiny muted" style="margin-top:16px">Le barre rosse sono sotto la scorta minima. AI CORE le segnala prima che finiscano.</p>';
    },
    documenti: function () {
      var rows = [['FT', 'Fattura 214/2026', 'Bar Centrale · inviata allo SDI', 'ok', 'Consegnata'], ['DDT', 'DDT 388', 'Pasticceria Melis · generato dall\'ordine', 'ok', 'Pronto'], ['FT', 'Fattura 213/2026', 'Hotel Sa Perda · in attesa', 'prep', 'Inviata'], ['NC', 'Nota di credito 12', 'Giulia Serra · reso parziale', 'new', 'Da firmare']];
      return '<div class="doc-list">' + rows.map(function (r) { return '<div class="doc"><span class="ty">' + r[0] + '</span><div><div>' + r[1] + '</div><div class="sb">' + r[2] + '</div></div><span class="pill st-' + r[3] + '">' + r[4] + '</span></div>'; }).join('') + '</div>';
    },
    canali: function () {
      var rows = [['N', 'Negozio', '23 ordini oggi', true], ['S', 'Sito e-commerce', '9 ordini oggi', true], ['A', 'Amazon', '4 ordini oggi', true], ['W', 'WhatsApp', '6 richieste', true], ['E', 'eBay', 'Non collegato', false], ['T', 'Telefono', '2 ordini oggi', true]];
      return '<div class="chans">' + rows.map(function (r) { return '<div class="chan"><span class="ic">' + r[0] + '</span><div><div class="nm">' + r[1] + '</div><div class="sb">' + r[2] + '</div></div><button type="button" class="tg" aria-pressed="' + r[3] + '" aria-label="Attiva ' + r[1] + '"></button></div>'; }).join('') + '</div>';
    }
  };
  var modBody = $('#modBody'), modUrl = $('#modUrl');
  function showMod(id) {
    if (!modBody) return;
    modBody.innerHTML = '<div>' + MODS[id]() + '</div>';
    modUrl.textContent = 'app.maistu.it · ' + id;
    $$('.mod-tabs button').forEach(function (b) { b.setAttribute('aria-selected', String(b.getAttribute('data-mod') === id)); });
  }
  $$('.mod-tabs button').forEach(function (b) { b.addEventListener('click', function () { showMod(b.getAttribute('data-mod')); }); });
  if (modBody) {
    showMod('ordini');
    modBody.addEventListener('click', function (e) {
      var t = e.target.closest('button'); if (!t) return;
      if (t.hasAttribute('data-cycle')) {
        var seq = [['new', 'Nuovo'], ['prep', 'In preparazione'], ['ok', 'Spedito'], ['ok', 'Consegnato']];
        var cur = t.textContent.split(' ·')[0], idx = 0;
        seq.forEach(function (s, i) { if (s[1] === cur) idx = i; });
        var nx = seq[Math.min(idx + 1, seq.length - 1)];
        t.className = 'pill st-' + nx[0]; t.textContent = nx[1];
        t.closest('tr').classList.remove('flash'); void t.offsetWidth; t.closest('tr').classList.add('flash');
      } else if (t.hasAttribute('data-restock')) {
        var row = t.closest('.stock-row'), bar = $('.bar i', row), q = $('.qty', row);
        var max = +t.getAttribute('data-max');
        q.textContent = max; bar.style.width = '100%'; bar.className = '';
        t.textContent = 'Ordinato'; t.disabled = true;
      } else if (t.classList.contains('tg')) {
        var on = t.getAttribute('aria-pressed') !== 'true';
        t.setAttribute('aria-pressed', String(on));
        $('.sb', t.closest('.chan')).textContent = on ? 'Collegato ora' : 'In pausa';
      }
    });
  }

  /* ================= settori ================= */
  var ICONS = {
    ristorazione: '<path d="M7 3v8a3 3 0 0 0 6 0V3M10 3v18M17 3c-2 2-2 6 0 8v10" />',
    hotel: '<path d="M3 20V6M3 13h18v7M21 13a3 3 0 0 0-3-3h-7v3M7 11.5a1.5 1.5 0 1 0 0-.01" />',
    affitti: '<path d="M3 11 12 4l9 7M5 10v10h14V10M10 20v-5h4v5" />',
    retail: '<path d="M4 7h16l-1.5 12a2 2 0 0 1-2 1.8h-9a2 2 0 0 1-2-1.8L4 7ZM9 7a3 3 0 0 1 6 0" />',
    studi: '<path d="M4 7h16v12H4zM9 7V5h6v2M4 12h16" />',
    salute: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10ZM9 11h6M12 8v6" />',
    logistica: '<path d="M3 6h11v10H3zM14 10h4l3 3v3h-7M7 18.5a1.5 1.5 0 1 0 0-.01M17 18.5a1.5 1.5 0 1 0 0-.01" />',
    altro: '<path d="M12 5v14M5 12h14" />'
  };
  // t: come si chiamano le voci del menu in quel settore; x: tre moduli cuciti su misura.
  var SECTORS = {
    ristorazione: { label: 'Ristorazione', co: 'Bar Centrale', desc: 'Ordini al tavolo e da asporto, menu digitali, fornitori e magazzino che si scala da solo.', mods: ['Tavoli e comande', 'Menu digitale', 'Asporto', 'Fidelity'],
      t: { orders: 'Comande', one: 'Nuova comanda', clients: 'Clienti e fidelity', stock: 'Magazzino e fornitori', docs: 'Scontrini e fatture', channels: 'Canali' },
      x: [
        { id: 'sala', l: 'Tavoli e sala', cols: ['Tavolo', 'Comanda', 'Stato'], rows: [['Tavolo 4', '2 cappuccini, 2 cornetti', 'prep', 'In preparazione'], ['Tavolo 7', 'Aperitivo per 4', 'new', 'Nuova'], ['Dehors 2', '3 caffè, 1 succo', 'ok', 'Servita'], ['Banco', 'Asporto Giulia S.', 'new', 'Da ritirare']] },
        { id: 'menu', l: 'Menu digitale', cols: ['Piatto', 'Prezzo', 'Disponibilità'], rows: [['Malloreddus alla campidanese', '€ 12', 'ok', 'Disponibile'], ['Fregola con arselle', '€ 15', 'bad', 'Esaurita'], ['Seadas con miele', '€ 6', 'ok', 'Disponibile'], ['Panino del giorno', '€ 7', 'prep', 'Solo pranzo']] },
        { id: 'turni', l: 'Turni del personale', cols: ['Persona', 'Turno', 'Stato'], rows: [['Luca · banco', '06:30–14:00', 'ok', 'In servizio'], ['Sara · sala', '11:00–19:00', 'ok', 'In servizio'], ['Andrea · cucina', '17:00–24:00', 'new', 'Più tardi'], ['Elena · sala', 'Riposo', 'prep', 'Cambio richiesto']] }
      ],
      cust: ['Pasticceria Melis', 'Giulia Serra', 'Hotel Sa Perda', 'Comune di San Sperate', 'Marco Pinna', 'Circolo Tennis'],
      prod: [['Caffè in grani 1 kg', 18.5, 8, 15], ['Latte fresco 1 L', 1.35, 46, 30], ['Cornetti surgelati ×50', 32, 3, 6], ['Acqua naturale ×24', 6.9, 31, 20], ['Succhi di frutta ×24', 21, 12, 10], ['Zucchero bustine ×1000', 14, 9, 8]],
      ch: ['Banco', 'Tavoli', 'Asporto', 'WhatsApp'] },
    hotel: { label: 'Hotel e ospitalità', co: 'Hotel Sa Perda', desc: 'Prenotazioni, check-in digitale, camere, channel manager e personale in un posto solo.', mods: ['Camere', 'Channel manager', 'Check-in online', 'Housekeeping'],
      t: { orders: 'Prenotazioni', one: 'Nuova prenotazione', clients: 'Ospiti', stock: 'Servizi e scorte', docs: 'Conti e fatture', channels: 'Canali di vendita' },
      x: [
        { id: 'camere', l: 'Camere', cols: ['Camera', 'Ospite', 'Stato'], rows: [['101 · Doppia', 'Famiglia Rossi', 'ok', 'Occupata'], ['102 · Singola', 'Pulizia in corso', 'prep', 'Da preparare'], ['201 · Suite', 'Arrivo 15:00', 'new', 'In arrivo'], ['202 · Doppia', 'Libera', 'ok', 'Pronta']] },
        { id: 'checkin', l: 'Check-in online', cols: ['Ospite', 'Documenti', 'Stato'], rows: [['Laura Bianchi', 'Carta d\'identità', 'ok', 'Completato'], ['Tom Becker', 'Passaporto', 'prep', 'In verifica'], ['Famiglia Dupont', '2 di 4 caricati', 'new', 'Da completare'], ['Paolo Deiana', 'Patente', 'ok', 'Completato']] },
        { id: 'house', l: 'Housekeeping', cols: ['Camera', 'Incarico', 'Stato'], rows: [['102', 'Pulizia partenza', 'prep', 'In corso'], ['201', 'Preparazione suite', 'new', 'Da iniziare'], ['105', 'Cambio asciugamani', 'ok', 'Fatto'], ['Hall', 'Controllo minibar', 'new', 'Da iniziare']] }
      ],
      cust: ['Famiglia Rossi', 'Agenzia Viaggi Isola', 'Laura Bianchi', 'Studio Fenu', 'Tour Operator Mare', 'Paolo Deiana'],
      prod: [['Notte camera doppia', 120, 0, 0], ['Colazione', 12, 0, 0], ['Kit cortesia', 4.5, 22, 30], ['Asciugamani set', 9, 64, 40], ['Transfer aeroporto', 45, 0, 0], ['Late check-out', 30, 0, 0]],
      ch: ['Booking', 'Sito diretto', 'Expedia', 'Telefono'] },
    affitti: { label: 'Affitti brevi', co: 'Case Mare Blu', desc: 'Immobili, calendari, pulizie, serrature smart e messaggi automatici agli ospiti.', mods: ['Calendario', 'Pulizie', 'Serrature smart', 'Rendiconti'],
      t: { orders: 'Soggiorni', one: 'Nuovo soggiorno', clients: 'Ospiti', stock: 'Listini e forniture', docs: 'Ricevute e rendiconti', channels: 'Portali' },
      x: [
        { id: 'immobili', l: 'Calendario immobili', cols: ['Immobile', 'Prossimo evento', 'Stato'], rows: [['Villa Gialla', 'Check-out 10:00', 'prep', 'In uscita'], ['Bilocale Porto', 'Check-in 16:00', 'new', 'In arrivo'], ['Casa Ulivi', 'Ospiti presenti', 'ok', 'Occupata'], ['Loft Centro', 'Libero fino a venerdì', 'ok', 'Pronto']] },
        { id: 'pulizie', l: 'Pulizie', cols: ['Immobile', 'Squadra', 'Stato'], rows: [['Villa Gialla', 'Maria · ore 11', 'prep', 'Programmata'], ['Bilocale Porto', 'Rita · ore 13', 'ok', 'Fatta'], ['Casa Ulivi', 'Cambio biancheria', 'new', 'Da assegnare'], ['Loft Centro', 'Controllo', 'ok', 'Fatta']] },
        { id: 'chiavi', l: 'Serrature smart', cols: ['Porta', 'Codice', 'Stato'], rows: [['Villa Gialla', '•••• scade 10:00', 'prep', 'In scadenza'], ['Bilocale Porto', '4821 per Keller', 'ok', 'Inviato'], ['Casa Ulivi', '7730 per Dupont', 'ok', 'Attivo'], ['Loft Centro', 'Nessuno', 'new', 'Da generare']] }
      ],
      cust: ['Anna Keller', 'Famiglia Dupont', 'Luca Mereu', 'Sara Lilliu', 'Tom Becker', 'Elena Usai'],
      prod: [['Notte Villa Gialla', 180, 0, 0], ['Notte Bilocale Porto', 95, 0, 0], ['Pulizia finale', 60, 0, 0], ['Kit biancheria', 15, 7, 12], ['Prodotti cortesia', 3, 40, 30], ['Caffè in capsule ×50', 14, 4, 10]],
      ch: ['Airbnb', 'Booking', 'Sito diretto', 'WhatsApp'] },
    retail: { label: 'Retail ed e-commerce', co: 'Bottega Sarda', desc: 'Ordini da negozio, sito e marketplace con un magazzino solo, sempre sincronizzato.', mods: ['Cassa', 'E-commerce', 'Marketplace', 'Promozioni'],
      t: { orders: 'Ordini', one: 'Nuovo ordine', clients: 'Clienti', stock: 'Magazzino', docs: 'Fatture e DDT', channels: 'Negozio e online' },
      x: [
        { id: 'shop', l: 'Sito e marketplace', cols: ['Canale', 'Prodotti pubblicati', 'Stato'], rows: [['Sito', '142 prodotti', 'ok', 'Sincronizzato'], ['Amazon', '87 prodotti', 'ok', 'Sincronizzato'], ['eBay', '40 prodotti', 'prep', 'In aggiornamento'], ['Instagram Shop', '25 prodotti', 'new', 'Da approvare']] },
        { id: 'promo', l: 'Promozioni', cols: ['Promozione', 'Periodo', 'Stato'], rows: [['Natale sardo −15%', '1–24 dic', 'new', 'Programmata'], ['3×2 sul carasau', 'Questa settimana', 'ok', 'Attiva'], ['Spedizione gratis', 'Oltre € 49', 'ok', 'Attiva'], ['Black Friday', '28 nov', 'prep', 'In preparazione']] },
        { id: 'resi', l: 'Resi', cols: ['Ordine', 'Motivo', 'Stato'], rows: [['#1029', 'Taglia sbagliata', 'prep', 'In arrivo'], ['#1017', 'Prodotto rovinato', 'ok', 'Rimborsato'], ['#1033', 'Ripensamento', 'new', 'Da approvare'], ['#1008', 'Cambio colore', 'ok', 'Sostituito']] }
      ],
      cust: ['Giulia Serra', 'Marco Pinna', 'Federica Cocco', 'Hotel Sa Perda', 'Negozio Su Barchile', 'Andrea Loi'],
      prod: [['Pecorino sardo 1 kg', 22, 4, 10], ['Mirto 70 cl', 18, 26, 12], ['Pane carasau 500 g', 4.9, 58, 30], ['Cestino in asfodelo', 45, 6, 4], ['Torrone 300 g', 12, 3, 8], ['Miele di corbezzolo', 16, 11, 6]],
      ch: ['Negozio', 'Sito', 'Amazon', 'WhatsApp'] },
    studi: { label: 'Studi professionali', co: 'Studio Melis', desc: 'Pratiche, scadenze, documenti e area riservata per i clienti, con promemoria automatici.', mods: ['Pratiche', 'Scadenze', 'Area clienti', 'Parcelle'],
      t: { orders: 'Incarichi', one: 'Nuovo incarico', clients: 'Clienti', stock: 'Listino prestazioni', docs: 'Parcelle e documenti', channels: 'Contatti' },
      x: [
        { id: 'pratiche', l: 'Pratiche', cols: ['Pratica', 'Responsabile', 'Stato'], rows: [['Dichiarazione Pinna', 'Dott. Melis', 'prep', 'In lavorazione'], ['Bilancio Bottega Sarda', 'Dott.ssa Fenu', 'new', 'Da iniziare'], ['Contratto Hotel Sa Perda', 'Avv. Loi', 'prep', 'In revisione'], ['Successione Usai', 'Dott. Melis', 'ok', 'Completata']] },
        { id: 'scadenze', l: 'Scadenze', cols: ['Scadenza', 'Cliente', 'Stato'], rows: [['F24 · 16 nov', 'Trasporti Campidano', 'bad', 'Fra 3 giorni'], ['IMU · 16 dic', 'Elena Usai', 'new', 'Da preparare'], ['Bilancio · 30 nov', 'Bottega Sarda', 'prep', 'In corso'], ['Rinnovo PEC', 'Studio', 'ok', 'Fatto']] },
        { id: 'area', l: 'Area clienti', cols: ['Cliente', 'Ultimo documento', 'Stato'], rows: [['Marco Pinna', 'Modello 730', 'ok', 'Scaricato'], ['Hotel Sa Perda', 'Bozza contratto', 'new', 'Da leggere'], ['Elena Usai', 'Visura catastale', 'ok', 'Scaricato'], ['Bottega Sarda', 'Richiesta documenti', 'prep', 'In attesa']] }
      ],
      cust: ['Marco Pinna', 'Bottega Sarda', 'Hotel Sa Perda', 'Elena Usai', 'Trasporti Campidano', 'Dott.ssa Fenu'],
      prod: [['Consulenza oraria', 80, 0, 0], ['Dichiarazione redditi', 150, 0, 0], ['Contabilità mensile', 220, 0, 0], ['Pratica societaria', 450, 0, 0], ['Visura', 15, 0, 0], ['Parere scritto', 300, 0, 0]],
      ch: ['Studio', 'Area clienti', 'Email', 'WhatsApp'] },
    salute: { label: 'Salute e benessere', co: 'Centro Armonia', desc: 'Agenda appuntamenti, promemoria, schede clienti e pacchetti, nel rispetto della privacy.', mods: ['Agenda', 'Schede clienti', 'Promemoria', 'Pacchetti'],
      t: { orders: 'Appuntamenti', one: 'Nuovo appuntamento', clients: 'Schede clienti', stock: 'Prodotti e pacchetti', docs: 'Ricevute', channels: 'Prenotazioni' },
      x: [
        { id: 'agenda', l: 'Agenda', cols: ['Ora', 'Appuntamento', 'Stato'], rows: [['09:00', 'Massaggio · Laura B.', 'ok', 'Confermato'], ['10:30', 'Fisioterapia · Paolo D.', 'prep', 'In attesa'], ['12:00', 'Trattamento viso · Sara L.', 'ok', 'Confermato'], ['15:00', 'Libero', 'new', 'Prenotabile']] },
        { id: 'pacchetti', l: 'Pacchetti e abbonamenti', cols: ['Cliente', 'Pacchetto', 'Stato'], rows: [['Laura Bianchi', '5 massaggi · 3 usati', 'ok', 'Attivo'], ['Paolo Deiana', '10 fisioterapie · 9 usate', 'bad', 'In esaurimento'], ['Sara Lilliu', 'Viso mensile', 'ok', 'Attivo'], ['Anna Keller', 'Buono regalo', 'new', 'Da usare']] },
        { id: 'promemoria', l: 'Promemoria', cols: ['Cliente', 'Messaggio', 'Stato'], rows: [['Laura Bianchi', 'Domani alle 9:00', 'ok', 'Inviato su WhatsApp'], ['Paolo Deiana', 'Rinnovo pacchetto', 'prep', 'Programmato'], ['Federica Cocco', 'Ti aspettiamo!', 'new', 'Da inviare'], ['Giulia Serra', 'Auguri di compleanno', 'ok', 'Inviato']] }
      ],
      cust: ['Laura Bianchi', 'Paolo Deiana', 'Sara Lilliu', 'Giulia Serra', 'Anna Keller', 'Federica Cocco'],
      prod: [['Massaggio 50 min', 55, 0, 0], ['Pacchetto 5 sedute', 240, 0, 0], ['Olio essenziale', 14, 9, 6], ['Crema viso', 32, 4, 6], ['Fisioterapia', 60, 0, 0], ['Buono regalo', 50, 20, 5]],
      ch: ['Reception', 'Prenota online', 'Telefono', 'WhatsApp'] },
    logistica: { label: 'Logistica e servizi', co: 'Trasporti Campidano', desc: 'Consegne, interventi tecnici, squadre e mezzi da coordinare, con app per chi è in giro.', mods: ['Interventi', 'Squadre', 'Mezzi', 'App sul campo'],
      t: { orders: 'Spedizioni', one: 'Nuova spedizione', clients: 'Committenti', stock: 'Materiali e tariffe', docs: 'DDT e fatture', channels: 'Canali' },
      x: [
        { id: 'interventi', l: 'Interventi', cols: ['Intervento', 'Squadra', 'Stato'], rows: [['Consegna Cagliari', 'Furgone 2 · Luca', 'prep', 'In viaggio'], ['Ritiro Sestu', 'Furgone 1 · Andrea', 'ok', 'Completato'], ['Assistenza Monastir', 'Tecnico · Paolo', 'new', 'Da assegnare'], ['Consegna Decimo', 'Furgone 3 · Sara', 'ok', 'Consegnato']] },
        { id: 'mezzi', l: 'Mezzi', cols: ['Mezzo', 'Prossima scadenza', 'Stato'], rows: [['Furgone 1 · FX123AB', 'Tagliando fra 800 km', 'prep', 'Da programmare'], ['Furgone 2 · GB456CD', 'Revisione a marzo', 'ok', 'In regola'], ['Furgone 3 · EK789EF', 'Assicurazione 30 nov', 'bad', 'In scadenza'], ['Muletto', 'Controllo annuale', 'ok', 'In regola']] },
        { id: 'campo', l: 'App sul campo', cols: ['Operatore', 'Ultimo aggiornamento', 'Stato'], rows: [['Luca', 'Foto consegna caricata', 'ok', 'Online'], ['Andrea', 'Firma cliente raccolta', 'ok', 'Online'], ['Paolo', 'In attesa del pezzo', 'prep', 'In pausa'], ['Sara', 'Partita da Decimo', 'ok', 'Online']] }
      ],
      cust: ['Bottega Sarda', 'Hotel Sa Perda', 'Bar Centrale', 'Comune di Sestu', 'Edilizia Pani', 'Agricola Serra'],
      prod: [['Consegna urbana', 25, 0, 0], ['Consegna provinciale', 60, 0, 0], ['Bancale EPAL', 12, 18, 25], ['Imballo standard', 3.5, 140, 100], ['Intervento tecnico', 70, 0, 0], ['Gasolio (litri)', 1.7, 380, 400]],
      ch: ['Telefono', 'Portale clienti', 'Email', 'WhatsApp'] }
  };
  var MORE = ['Edilizia e impianti', 'Cantine e aziende agricole', 'Autofficine e carrozzerie', 'Palestre e sport', 'Scuole e formazione', 'Farmacie e parafarmacie', 'Noleggio', 'Artigiani e laboratori', 'Eventi e catering', 'Agenzie immobiliari', 'Produzione e manifattura', 'Ingrosso e distribuzione', 'Associazioni e circoli', 'Pulizie e servizi', 'Ottici', 'Panifici e pasticcerie', 'Agenzie di viaggio', 'Onoranze funebri'];
  var cloud = $('#cloud');
  if (cloud) cloud.innerHTML = MORE.map(function (m, i) { return '<li style="--i:' + i + '">' + m + '</li>'; }).join('') + '<li class="you" style="--i:' + MORE.length + '"><a href="#contatti" data-tipo="Modulo su misura">Il tuo?</a></li>';
  var fSet = $('#f-settore');
  if (fSet) fSet.innerHTML = '<option value="">Scegli…</option>' + Object.keys(SECTORS).map(function (k) { return '<option>' + SECTORS[k].label + '</option>'; }).join('') + MORE.map(function (m) { return '<option>' + m + '</option>'; }).join('') + '<option>Altro</option>';
  var sectGrid = $('#sectGrid');
  if (sectGrid) {
    var h = '';
    Object.keys(SECTORS).forEach(function (k) {
      var s = SECTORS[k];
      h += '<article class="sect rv"><span class="ico"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[k] + '</svg></span><h3>' + s.label + '</h3><p>' + s.desc + '</p><ul>' + s.mods.map(function (m) { return '<li>' + m + '</li>'; }).join('') + '</ul><button type="button" class="try" data-try="' + k + '">Guarda la simulazione →</button></article>';
    });
    h += '<article class="sect custom rv"><span class="ico"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">' + ICONS.altro + '</svg></span><h3>Il tuo settore non c\'è?</h3><p>Nessun problema. Partiamo dai tuoi processi e cuciamo i moduli da zero.</p><a class="try" href="#contatti" data-tipo="Modulo su misura" style="text-decoration:none">Raccontaci come lavori →</a></article>';
    sectGrid.innerHTML = h;
    var extraRv = $$('.sect.rv', sectGrid).concat($$('.more-sect'));
    extraRv.forEach(function (el, i) {
      el.style.setProperty('--rd', (i % 4) * 0.08 + 's');
      if (reduce || !('IntersectionObserver' in window)) el.classList.add('in'); else io.observe(el);
      rvs.push(el);
    });
    sectGrid.addEventListener('click', function (e) {
      var b = e.target.closest('[data-try]'); if (!b) return;
      var d = $('#demo'); if (d) d.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
      setTimeout(function () { pickSector(b.getAttribute('data-try'), true); }, reduce ? 0 : 650);
    });
  }

  /* ================= simulazione "come funziona" ================= */
  var sectorsEl = $('#sectors'), bizName = $('#bizName');
  var demo = null, view = 'panoramica', chosen = 'ristorazione', sewTimer = 0;
  if (sectorsEl) {
    sectorsEl.innerHTML = Object.keys(SECTORS).map(function (k) { return '<button type="button" role="radio" aria-checked="' + (k === chosen) + '" data-k="' + k + '">' + SECTORS[k].label + '</button>'; }).join('');
    sectorsEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) pickSector(b.getAttribute('data-k'), true); });
  }
  function pickSector(k, build) {
    var changed = k !== chosen;
    chosen = k;
    $$('button', sectorsEl).forEach(function (b) { b.setAttribute('aria-checked', String(b.getAttribute('data-k') === k)); });
    if (bizName) {
      // Se il nome era quello di esempio del settore precedente, lo sostituiamo.
      var cur = bizName.value.trim(), isSample = Object.keys(SECTORS).some(function (q) { return SECTORS[q].co === cur; });
      if (changed && (!cur || isSample)) bizName.value = '';
      bizName.placeholder = 'Es. ' + SECTORS[k].co;
    }
    if (build) buildDemo();
  }
  function genDemo(k, name) {
    var s = SECTORS[k];
    var prods = s.prod.map(function (p, i) { return { id: i, n: p[0], price: p[1], q: p[2], min: p[3] }; });
    var custs = s.cust.map(function (c, i) { return { id: i, n: c, city: rnd(['Cagliari', 'San Sperate', 'Sestu', 'Quartu', 'Monastir', 'Decimomannu']), spent: 0, orders: 0 }; });
    var d = { v: 2, k: k, name: name || s.co, prods: prods, custs: custs, orders: [], docs: [], seq: 1040, docSeq: 210, chOn: s.ch.map(function () { return true; }), x: JSON.parse(JSON.stringify(s.x)), week: [] };
    for (var w = 0; w < 6; w++) d.week.push(Math.round(600 + Math.random() * 900));
    for (var o = 0; o < 7; o++) addOrder(d, o < 3 ? 'ok' : o < 5 ? 'prep' : 'new', true);
    d.orders.slice(0, 3).forEach(function (or) { makeDoc(d, or, true); });
    return d;
  }
  function addOrder(d, st, silent) {
    var c = rnd(d.custs), lines = 1 + Math.floor(Math.random() * 3), tot = 0, items = [];
    for (var l = 0; l < lines; l++) {
      var p = rnd(d.prods), q = 1 + Math.floor(Math.random() * (p.price > 60 ? 2 : 5));
      tot += p.price * q; items.push(q + '× ' + p.n);
      if (p.min > 0) p.q = Math.max(0, p.q - q);
    }
    c.spent += tot; c.orders++;
    var o = { id: '#' + (++d.seq), c: c.n, ch: SECTORS[d.k].ch[Math.floor(Math.random() * SECTORS[d.k].ch.length)], st: st || 'new', tot: Math.round(tot * 100) / 100, items: items, fresh: !silent };
    d.orders.unshift(o);
    return o;
  }
  function makeDoc(d, o, silent) {
    if (o.doc) return null;
    o.doc = true;
    var x = { n: 'Documento ' + (++d.docSeq) + '/2026', c: o.c, tot: o.tot, st: silent ? 'ok' : 'prep', fresh: !silent };
    d.docs.unshift(x);
    return x;
  }
  var STL = { 'new': 'Nuovo', prep: 'In corso', ok: 'Completato' };
  var appSide = $('#appSide'), appView = $('#appView'), janaOut = $('#janaOut');
  function T() { return SECTORS[demo.k].t; }
  function navItems() {
    var t = T();
    return [['panoramica', 'Panoramica'], ['ordini', t.orders], ['clienti', t.clients], ['magazzino', t.stock], ['documenti', t.docs], ['canali', t.channels], ['sep', 'Cuciti su misura']].concat(demo.x.map(function (m) { return [m.id, m.l, 1]; }));
  }
  function renderSide() {
    appSide.innerHTML = navItems().map(function (n, i) {
      if (n[0] === 'sep') return '<span class="sep">' + n[1] + '</span>';
      return '<button type="button" style="--i:' + i + '" data-v="' + n[0] + '"' + (n[0] === view ? ' aria-current="page"' : '') + '><span class="sd"></span>' + n[1] + (n[2] ? '<span class="new">✦</span>' : '') + '</button>';
    }).join('');
  }
  function low() { return demo.prods.filter(function (p) { return p.min > 0 && p.q < p.min; }); }
  function todayTotal() { return demo.orders.reduce(function (a, o) { return a + o.tot; }, 0); }
  function best() { return demo.custs.slice().sort(function (a, b) { return b.spent - a.spent; })[0]; }
  function renderView() {
    var v = view, out = '', t = T();
    if (v === 'panoramica') {
      var lw = low(), tot = todayTotal(), todo = demo.orders.filter(function (o) { return !o.doc; }).length;
      var week = demo.week.concat([Math.round(tot)]), mx = Math.max.apply(null, week);
      var days = ['L', 'M', 'M', 'G', 'V', 'S', 'Oggi'];
      out = '<div><div class="kpis"><div class="kpi"><span class="k">' + t.orders + '</span><span class="v">' + demo.orders.length + '</span></div><div class="kpi"><span class="k">Incasso</span><span class="v">' + eur(tot, 0) + '</span></div><div class="kpi"><span class="k">Sotto scorta</span><span class="v' + (lw.length ? ' alert' : '') + '">' + lw.length + '</span></div><div class="kpi"><span class="k">Da fatturare</span><span class="v">' + todo + '</span></div></div>' +
        '<div class="ov"><div><h4>Incassi della settimana</h4><div class="chart">' + week.map(function (w, i) { return '<div><em>' + Math.round(w / 100) / 10 + 'k</em><b style="height:' + Math.max(6, Math.round(w / mx * 92)) + '%"></b><span>' + days[i] + '</span></div>'; }).join('') + '</div></div>' +
        '<div><h4>Jana suggerisce</h4><div class="hint">' +
        (lw.length ? '<p><b>' + lw.length + ' articoli</b> sotto scorta. Scrivi "riordina" e ci penso io.</p>' : '<p>Le scorte sono a posto. <b>Nessun riordino</b> necessario.</p>') +
        (todo ? '<p><b>' + todo + ' ' + t.orders.toLowerCase() + '</b> senza documento. Scrivi "emetti le fatture".</p>' : '<p>Tutti i documenti sono emessi.</p>') +
        '<p>Il cliente più affezionato è <b>' + esc(best().n) + '</b>.</p></div></div></div></div>';
    } else if (v === 'ordini') {
      out = '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>N.</th><th>Cliente</th><th>Canale</th><th>Stato</th><th class="r">Totale</th><th></th></tr></thead><tbody>' +
        demo.orders.map(function (o, i) { return '<tr' + (o.fresh ? ' class="flash"' : '') + '><td class="mono" style="letter-spacing:.06em">' + o.id + '</td><td>' + esc(o.c) + '</td><td>' + o.ch + '</td><td><button type="button" class="pill st-' + o.st + '" data-ost="' + i + '" title="Fai avanzare lo stato">' + STL[o.st] + '</button></td><td class="r">' + eur(o.tot) + '</td><td>' + (o.doc ? '<span class="tiny muted">Emesso</span>' : '<button type="button" class="mini-btn" data-inv="' + i + '">Documento</button>') + '</td></tr>'; }).join('') +
        '</tbody></table></div>';
      demo.orders.forEach(function (o) { o.fresh = false; });
    } else if (v === 'clienti') {
      var cs = demo.custs.slice().sort(function (a, b) { return b.spent - a.spent; });
      out = '<div><input class="search" id="custQ" type="search" placeholder="Cerca in ' + t.clients.toLowerCase() + '" aria-label="Cerca"><div class="tbl-wrap"><table class="tbl" id="custT"><thead><tr><th>Nome</th><th>Città</th><th class="r">' + t.orders + '</th><th class="r">Speso</th></tr></thead><tbody>' +
        cs.map(function (c) { return '<tr data-n="' + esc(c.n.toLowerCase()) + '"><td>' + esc(c.n) + '</td><td>' + c.city + '</td><td class="r">' + c.orders + '</td><td class="r">' + eur(c.spent) + '</td></tr>'; }).join('') + '</tbody></table></div></div>';
    } else if (v === 'magazzino') {
      out = '<div class="stock">' + demo.prods.map(function (p, i) {
        if (p.min === 0) return '<div class="stock-row"><span class="nm">' + esc(p.n) + '</span><span class="tiny muted">Servizio</span><span class="qty">' + eur(p.price, 0) + '</span><span></span></div>';
        var pct = Math.min(100, Math.round(p.q / (p.min * 2) * 100)), c = p.q < p.min ? 'low' : p.q < p.min * 1.4 ? 'mid' : '';
        return '<div class="stock-row"><span class="nm">' + esc(p.n) + '</span><span class="bar"><i class="' + c + '" style="width:' + pct + '%"></i></span><span class="qty">' + p.q + '</span><button type="button" class="mini-btn" data-rs="' + i + '">Riordina</button></div>';
      }).join('') + '</div>';
    } else if (v === 'documenti') {
      out = demo.docs.length ? '<div class="doc-list">' + demo.docs.map(function (x) { return '<div class="doc"' + (x.fresh ? ' style="border-color:var(--or)"' : '') + '><span class="ty">DOC</span><div><div>' + x.n + '</div><div class="sb">' + esc(x.c) + ' · ' + eur(x.tot) + '</div></div><span class="pill st-' + x.st + '">' + (x.st === 'ok' ? 'Consegnato' : 'Inviato') + '</span></div>'; }).join('') + '</div>' : '<p class="empty">Nessun documento ancora.</p>';
      demo.docs.forEach(function (x) { if (x.fresh) { x.fresh = false; setTimeout(function () { x.st = 'ok'; if (view === 'documenti') renderView(); }, 2200); } });
    } else if (v === 'canali') {
      var s = SECTORS[demo.k];
      out = '<div class="chans">' + s.ch.map(function (c, i) {
        var n = demo.orders.filter(function (o) { return o.ch === c; }).length;
        return '<div class="chan"><span class="ic">' + c.charAt(0) + '</span><div><div class="nm">' + c + '</div><div class="sb">' + (demo.chOn[i] ? n + ' ' + t.orders.toLowerCase() : 'In pausa') + '</div></div><button type="button" class="tg" data-ch="' + i + '" aria-pressed="' + demo.chOn[i] + '" aria-label="Attiva ' + c + '"></button></div>';
      }).join('') + '</div>';
    } else {
      var e = demo.x.filter(function (m) { return m.id === v; })[0];
      if (e) out = '<div class="tbl-wrap"><table class="tbl"><thead><tr>' + e.cols.map(function (c) { return '<th>' + c + '</th>'; }).join('') + '</tr></thead><tbody>' +
        e.rows.map(function (r, i) { return '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td><td><button type="button" class="pill st-' + r[2] + '" data-ex="' + v + ':' + i + '">' + r[3] + '</button></td></tr>'; }).join('') +
        '</tbody></table></div><p class="tiny muted" style="margin-top:12px">Modulo cucito su misura per ' + SECTORS[demo.k].label.toLowerCase() + '. Nel tuo Maistu avrà i campi e i passaggi che usi tu.</p>';
    }
    appView.innerHTML = '<div>' + out + '</div>';
    var q = $('#custQ');
    if (q) q.addEventListener('input', function () { var tq = q.value.trim().toLowerCase(); $$('#custT tbody tr').forEach(function (tr) { tr.hidden = tq && tr.getAttribute('data-n').indexOf(tq) < 0; }); });
  }
  function go(v) { view = v; renderSide(); renderView(); }
  function render() {
    $('#appCo').textContent = demo.name;
    $('#appSub').textContent = SECTORS[demo.k].label + ' · simulazione';
    $('#appNew').textContent = '+ ' + T().one;
    $('#appUrl').textContent = 'simulazione.maistu.it/' + demo.name.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    renderSide(); renderView();
  }
  function say(t) { if (janaOut) janaOut.innerHTML = t; }
  function saveDemo() { try { store.set('maistu-sim', JSON.stringify(demo)); } catch (e) {} }
  function buildDemo() {
    var name = (bizName && bizName.value.trim()) || SECTORS[chosen].co;
    var sew = $('#sewing'), msg = $('#sewMsg');
    var steps = ['Prendo le misure…', 'Scelgo il tessuto: ' + SECTORS[chosen].label.toLowerCase() + '…', 'Cucio menu e moduli su misura…', 'Ultimo punto…'];
    demo = genDemo(chosen, name); view = 'panoramica';
    var done = function () { sew.hidden = true; render(); saveDemo(); $('#app').classList.remove('resew'); void $('#app').offsetWidth; $('#app').classList.add('resew'); say('Ecco ' + esc(name) + ': il menu ora parla la lingua di ' + SECTORS[chosen].label.toLowerCase() + ', con tre moduli su misura. Prova a chiedermi "cosa è sotto scorta?"'); };
    if (reduce) { done(); return; }
    clearInterval(sewTimer);
    sew.hidden = false;
    var i = 0; msg.textContent = steps[0];
    sewTimer = setInterval(function () { i++; if (i < steps.length) msg.textContent = steps[i]; else { clearInterval(sewTimer); done(); } }, 380);
  }
  var bd = $('#buildDemo'); if (bd) bd.addEventListener('click', buildDemo);
  if (bizName) bizName.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); buildDemo(); } });
  var rs = $('#appReset'); if (rs) rs.addEventListener('click', function () { demo = genDemo(demo.k, demo.name); view = 'panoramica'; render(); saveDemo(); say('Simulazione azzerata. Si ricomincia da capo.'); });
  var an = $('#appNew'); if (an) an.addEventListener('click', function () { var o = addOrder(demo, 'new'); go('ordini'); saveDemo(); say(T().one + ' <b>' + o.id + '</b> da ' + esc(o.c) + ' via ' + o.ch + ': ' + eur(o.tot) + '. Scorte già aggiornate.'); });
  if (appSide) appSide.addEventListener('click', function (e) { var b = e.target.closest('button[data-v]'); if (b) go(b.getAttribute('data-v')); });
  if (appView) appView.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.hasAttribute('data-ost')) { var o = demo.orders[+b.getAttribute('data-ost')]; o.st = o.st === 'new' ? 'prep' : 'ok'; if (o.st === 'ok' && !o.doc) { makeDoc(demo, o); say(o.id + ' completato. Ho emesso il documento e l\'ho inviato.'); } renderView(); }
    else if (b.hasAttribute('data-inv')) { var od = demo.orders[+b.getAttribute('data-inv')]; makeDoc(demo, od); say('Documento per <b>' + esc(od.c) + '</b> emesso: ' + eur(od.tot) + '.'); renderView(); }
    else if (b.hasAttribute('data-rs')) { var p = demo.prods[+b.getAttribute('data-rs')]; p.q = p.min * 2; say('Ordine al fornitore inviato per <b>' + esc(p.n) + '</b>. Giacenza riportata a ' + p.q + '.'); renderView(); }
    else if (b.hasAttribute('data-ch')) { var ci = +b.getAttribute('data-ch'); demo.chOn[ci] = !demo.chOn[ci]; renderView(); }
    else if (b.hasAttribute('data-ex')) {
      var ref = b.getAttribute('data-ex').split(':'), m = demo.x.filter(function (q) { return q.id === ref[0]; })[0], r = m.rows[+ref[1]];
      var cyc = { 'new': ['prep', 'In corso'], prep: ['ok', 'Fatto'], ok: ['new', 'Da rifare'], bad: ['prep', 'In corso'] }, n = cyc[r[2]]; r[2] = n[0]; r[3] = n[1]; renderView();
    }
    saveDemo();
  });
  var janaBar = $('#janaBar'), janaIn = $('#janaIn');
  function janaAnswer(q) {
    var t = q.toLowerCase().replace(/^jana[, ]*/, ''), lw = low(), tt = T();
    if (/(scort|finisc|mancan|esaurit)/.test(t)) return lw.length ? 'Sotto scorta: ' + lw.map(function (p) { return '<b>' + esc(p.n) + '</b> (' + p.q + ')'; }).join(', ') + '. Vuoi che riordini? Scrivi "riordina".' : 'Niente sotto scorta, è tutto a posto.';
    if (/(riordin|ordina altr|compra)/.test(t)) { if (!lw.length) return 'Non serve riordinare nulla, per ora.'; lw.forEach(function (p) { p.q = p.min * 2; }); if (view === 'magazzino' || view === 'panoramica') renderView(); return 'Fatto: ho inviato ' + lw.length + ' ordini ai fornitori. Le giacenze sono aggiornate.'; }
    if (/(nuov|crea|aggiungi|inserisci)/.test(t)) { var o = addOrder(demo, 'new'); go('ordini'); return tt.one + ' <b>' + o.id + '</b> per ' + esc(o.c) + ': ' + eur(o.tot) + '.'; }
    if (/(fattur|emett|document)/.test(t)) { var c = 0; demo.orders.forEach(function (o) { if (!o.doc) { makeDoc(demo, o); c++; } }); go('documenti'); return c ? 'Ho emesso <b>' + c + ' documenti</b> e li ho inviati.' : 'Sono già tutti emessi.'; }
    if (/(incass|fatturato|vendut|guadagn|com'è andata|com.e andata)/.test(t)) return 'Oggi hai incassato <b>' + eur(todayTotal()) + '</b> su ' + demo.orders.length + ' ' + tt.orders.toLowerCase() + '.';
    if (/(quant|ordin|prenot|appunt|spediz|comand|incaric|soggior)/.test(t)) { var nw = demo.orders.filter(function (o) { return o.st === 'new'; }).length; return 'Hai <b>' + demo.orders.length + ' ' + tt.orders.toLowerCase() + '</b>, ' + nw + ' ancora da lavorare.'; }
    if (/(client|ospit|miglior|affezionat|committent)/.test(t)) { var b = best(); return 'Il cliente migliore è <b>' + esc(b.n) + '</b>: ' + b.orders + ' ' + tt.orders.toLowerCase() + ' per ' + eur(b.spent) + '.'; }
    if (/(ciao|buongiorno|salve)/.test(t)) return 'Ciao! Posso dirti cosa è sotto scorta, crearti un nuovo elemento, emettere documenti o dirti com\'è andata oggi.';
    return 'In questa simulazione so rispondere su <b>scorte</b>, <b>' + tt.orders.toLowerCase() + '</b>, <b>incassi</b>, <b>documenti</b> e <b>clienti</b>. Nel Maistu vero, Jana impara le parole della tua azienda.';
  }
  if (janaBar) janaBar.addEventListener('submit', function (e) {
    e.preventDefault();
    var q = janaIn.value.trim(); if (!q) return;
    say('<span class="muted">Jana sta pensando…</span>');
    janaIn.value = '';
    setTimeout(function () { say(janaAnswer(q)); saveDemo(); }, reduce ? 0 : 450);
  });
  if (appView) {
    var saved = null;
    try { saved = JSON.parse(store.get('maistu-sim') || 'null'); } catch (e) { saved = null; }
    if (saved && saved.v === 2 && SECTORS[saved.k] && saved.orders) { demo = saved; pickSector(saved.k, false); if (bizName && saved.name !== SECTORS[saved.k].co) bizName.value = saved.name; say('Bentornato. Ho ritrovato la simulazione di <b>' + esc(saved.name) + '</b>.'); }
    else { demo = genDemo('ristorazione', 'Bar Centrale'); say('Questa è una simulazione. Tocca un altro settore e guarda come cambiano menu e moduli, oppure chiedimi qualcosa.'); }
    render();
  }

  /* ================= simbolo di Jana: i punti si accendono a onde dal centro ================= */
  var janaMark = $('#janaMark');
  if (janaMark && window.fetch) {
    fetch('assets/img/jana/jana-simbolo-per-fondi-scuri.svg').then(function (r) { return r.ok ? r.text() : Promise.reject(); }).then(function (txt) {
      var tmp = doc.createElement('div'); tmp.innerHTML = txt;
      var svg = tmp.querySelector('svg'); if (!svg) return;
      svg.removeAttribute('width'); svg.removeAttribute('height');
      svg.setAttribute('aria-hidden', 'true');
      Array.prototype.forEach.call(svg.children, function (el) {
        var cx = +(el.getAttribute('cx') || 100), cy = +(el.getAttribute('cy') || 100);
        el.setAttribute('class', 'jd');
        el.style.setProperty('--r', String(Math.round((Math.abs(cx - 100) + Math.abs(cy - 100)) / 13)));
      });
      janaMark.innerHTML = ''; janaMark.appendChild(svg);
      var go = function () { janaMark.classList.add('on'); setTimeout(function () { if (!reduce) janaMark.classList.add('live'); }, 1400); };
      if (reduce || !('IntersectionObserver' in window)) go();
      else { var jo = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { go(); jo.disconnect(); } }, { threshold: 0.3 }); jo.observe(janaMark); }
    }).catch(function () {});
  }

  /* ================= Jana (telefono) ================= */
  var chat = $('#chat'), chips = $('#janaChips'), orb = $('#orb'), jState = $('#janaState');
  var SCRIPT = {
    "Jana, com'è andata ieri?": 'Ieri 64 ordini e € 2.380 di incasso, il 12% in più di martedì scorso. Il prodotto più venduto è stato il cappuccino.',
    'Jana, ordina altro caffè': 'Fatto. Ho chiesto 10 kg di caffè in grani a Torrefazione Isola, consegna prevista giovedì. Ho aggiornato il magazzino.',
    'Jana, chi deve ancora pagare?': 'Tre fatture scadute: Hotel Sa Perda (€ 2.105), Circolo Tennis (€ 340) e Studio Fenu (€ 120). Vuoi che mandi un sollecito gentile?',
    'Jana, prepara il preventivo per Rossi': 'Pronto: catering per 40 persone, € 1.180 IVA inclusa, dai prezzi dell\'ultimo evento. Te lo mando su WhatsApp per controllarlo?',
    'Jana, chiudi il negozio': 'Fatto: luci spente, tapparelle abbassate, clima in modalità notte e allarme attivo. La cassa di oggi è chiusa a € 2.140. Buona serata!'
  };
  function bubble(cls, html) { var p = doc.createElement('p'); p.className = 'msg ' + cls; p.innerHTML = html; chat.appendChild(p); chat.scrollTop = chat.scrollHeight; return p; }
  if (chips) chips.addEventListener('click', function (e) {
    var b = e.target.closest('.chip'); if (!b || b.disabled) return;
    var q = b.textContent; b.disabled = true;
    bubble('out', esc(q));
    if (jState) jState.textContent = 'Sto lavorando';
    var ty = bubble('in typing', '<i></i><i></i><i></i>');
    if (orb) orb.classList.add('talk');
    if (janaMark) janaMark.classList.add('talk');
    setTimeout(function () {
      ty.remove(); bubble('in', SCRIPT[q] || 'Ci penso io.');
      if (orb) orb.classList.remove('talk');
      if (janaMark) janaMark.classList.remove('talk');
      if (jState) jState.textContent = 'In ascolto';
    }, reduce ? 50 : 1100);
  });

  /* ================= prezzi ================= */
  // Listino dei piani (IVA esclusa). Moduli aggiuntivi: prezzi indicativi.
  var PRICING = {
    annualMonths: 10,      // annuale = 10 mensilità (2 mesi gratis)
    maxUsers: 50,          // oltre: quotazione dedicata
    sizePlan: { micro: 'bottega', piccola: 'laboratorio', media: 'atelier', grande: null },
    plans: [
      { id: 'bottega', name: 'Bottega', for: 'Micro imprese, fino a 9 addetti', base: 99, inc: 5, extra: 15,
        feat: ['Ordini e clienti', 'Magazzino', 'Documenti e fattura elettronica', '1 canale di vendita', 'Assistenza via email e WhatsApp'], no: ['AI CORE', 'Jana'] },
      { id: 'laboratorio', name: 'Laboratorio', for: 'Piccole imprese, da 10 a 49 addetti', base: 199, inc: 10, extra: 12,
        feat: ['Tutto di Bottega', 'Canali di vendita illimitati', '1 modulo del tuo settore incluso', 'AI CORE: avvisi e riassunti', 'Formazione del team'], no: ['Jana'] },
      { id: 'atelier', name: 'Atelier', for: 'Medie imprese, da 50 a 249 addetti', base: 349, inc: 20, extra: 10,
        feat: ['Tutto di Laboratorio', 'Moduli di settore illimitati', 'AI CORE con automazioni', 'Jana, comando vocale', 'Più sedi e magazzini', 'Referente dedicato'], no: [] }
    ],
    addons: [
      { id: 'settore', n: 'Modulo di settore', d: 'Tavoli, camere, pratiche, interventi…', p: 29 },
      { id: 'jana', n: 'Jana', d: 'Comando vocale da telefono e computer', p: 19 },
      { id: 'aicore', n: 'AI CORE automazioni', d: 'Email, solleciti e preventivi in automatico', p: 49 },
      { id: 'market', n: 'Marketplace', d: 'Amazon, eBay e altri, sincronizzati', p: 39 },
      { id: 'app', n: 'App sul campo', d: 'Per chi lavora fuori sede', p: 25 },
      { id: 'area', n: 'Area clienti', d: 'Ordini, documenti e pagamenti online', p: 19 }
    ],
    custom: { id: 'custom', n: 'Modulo personalizzato su richiesta', d: 'Lo progettiamo e lo cuciamo per te: commesse, noleggi, produzione, qualsiasi cosa serva alla tua azienda.', p: 29,
      note: 'Il costo reale del modulo si preventiva in base alla richiesta: il prezzo indicato è quello di partenza.' }
  };
  var plansEl = $('#plans'), addonsEl = $('#addons'), usersIn = $('#users'), usersOut = $('#usersOut'), quoteEl = $('#quote');
  var bill = 'm', size = 'micro', addOn = {}, shown = {};
  function planMonthly(pl, users) { return pl.base + Math.max(0, users - pl.inc) * pl.extra; }
  function addonsMonthly() { return PRICING.addons.concat([PRICING.custom]).reduce(function (a, x) { return a + (addOn[x.id] ? x.p : 0); }, 0); }
  function tween(el, from, to) {
    if (reduce || from === to || from == null) { el.textContent = eur(to, 0); return; }
    var t0 = performance.now();
    (function step(now) { var k = Math.min(1, (now - t0) / 380); k = 1 - Math.pow(1 - k, 3); el.textContent = eur(Math.round(from + (to - from) * k), 0); if (k < 1) requestAnimationFrame(step); })(t0);
  }
  function renderPlans() {
    if (!plansEl) return;
    var raw = +usersIn.value, over = raw > PRICING.maxUsers, u = Math.min(raw, PRICING.maxUsers);
    usersOut.value = over ? PRICING.maxUsers + '+' : String(u); usersOut.textContent = usersOut.value;
    usersIn.style.setProperty('--fill', ((raw - 1) / (+usersIn.max - 1) * 100) + '%');
    var quote = over || !PRICING.sizePlan[size];
    var recoId = PRICING.sizePlan[size];
    quoteEl.hidden = !quote;
    if (quote) $('#quoteT').textContent = over ? 'Oltre ' + PRICING.maxUsers + ' persone prepariamo un\'offerta dedicata.' : 'Per un\'azienda con più di 250 addetti prepariamo un\'offerta dedicata.';
    plansEl.classList.toggle('dim', quote);
    var ao = addonsMonthly(), hasCustom = !!addOn.custom;
    plansEl.innerHTML = PRICING.plans.map(function (p) {
      var m = planMonthly(p, u) + ao, per = Math.round(bill === 'y' ? m * PRICING.annualMonths / 12 : m);
      var sub = bill === 'y' ? eur(m * PRICING.annualMonths, 0) + ' all\'anno' : 'Fatturato ogni mese';
      var reco = !quote && p.id === recoId;
      return '<article class="plan' + (reco ? ' reco' : '') + '" data-plan-id="' + p.id + '"><span class="badge">Il piano per la tua azienda</span><h3>' + p.name + '</h3><p class="for">' + p.for + '</p>' +
        '<div class="price">' + (hasCustom ? '<span class="u">da</span>' : '') + '<span class="n" data-v="' + per + '">' + eur(shown[p.id] == null ? per : shown[p.id], 0) + '</span><span class="u">/mese + IVA</span></div>' +
        '<p class="price-sub">' + sub + ' · ' + p.inc + ' utenti inclusi, poi ' + eur(p.extra, 0) + ' l\'uno' + (ao ? ' · moduli aggiuntivi compresi' : '') + '</p>' +
        '<ul>' + p.feat.map(function (f) { return '<li>' + f + '</li>'; }).join('') + p.no.map(function (f) { return '<li class="no">' + f + ' come modulo aggiuntivo</li>'; }).join('') + '</ul>' +
        '<a class="btn ' + (reco ? 'btn-or' : 'btn-ghost') + '" href="#contatti" data-tipo="Preventivo piani cloud" data-plan="' + p.name + '">Scegli ' + p.name + '</a></article>';
    }).join('');
    $$('.price .n', plansEl).forEach(function (el) {
      var id = el.closest('.plan').getAttribute('data-plan-id'), to = +el.getAttribute('data-v');
      tween(el, shown[id], to); shown[id] = to;
    });
  }
  if (plansEl) {
    addonsEl.innerHTML = PRICING.addons.map(function (a) { return '<button type="button" class="addon" aria-pressed="false" data-a="' + a.id + '"><span class="an">' + a.n + '</span><span class="ap">+ ' + eur(a.p, 0) + '/mese</span><span class="ad">' + a.d + '</span></button>'; }).join('') +
      '<button type="button" class="addon addon-custom" aria-pressed="false" data-a="custom"><span class="ac-l"><span class="an">' + PRICING.custom.n + '</span><span class="ap">da ' + eur(PRICING.custom.p, 0) + '/mese</span><span class="ad">' + PRICING.custom.d + '</span></span><span class="ac-r">' + PRICING.custom.note + '</span></button>';
    addonsEl.addEventListener('click', function (e) { var b = e.target.closest('.addon'); if (!b) return; var id = b.getAttribute('data-a'); addOn[id] = !addOn[id]; b.setAttribute('aria-pressed', String(addOn[id])); renderPlans(); });
    usersIn.addEventListener('input', renderPlans);
    $$('#billing button').forEach(function (b) { b.addEventListener('click', function () { bill = b.getAttribute('data-bill'); $$('#billing button').forEach(function (x) { x.setAttribute('aria-checked', String(x === b)); }); renderPlans(); }); });
    // La dimensione sceglie il piano; il numero di persone resta quello impostato.
    $$('#size button').forEach(function (b) { b.addEventListener('click', function () { size = b.getAttribute('data-size'); $$('#size button').forEach(function (x) { x.setAttribute('aria-checked', String(x === b)); }); renderPlans(); }); });
    renderPlans();
  }
  // I pulsanti di piani, quotazioni e moduli precompilano il modulo contatti.
  doc.addEventListener('click', function (e) {
    var a = e.target.closest('[data-tipo]'); if (!a) return;
    var sel = $('#f-tipo'), msg = $('#f-msg');
    if (sel) sel.value = a.getAttribute('data-tipo');
    if (msg && a.getAttribute('data-plan') && !msg.value) {
      var extras = PRICING.addons.concat([PRICING.custom]).filter(function (x) { return addOn[x.id]; }).map(function (x) { return x.n; });
      msg.value = 'Piano ' + a.getAttribute('data-plan') + ', ' + usersOut.value + ' utenti, fatturazione ' + (bill === 'y' ? 'annuale' : 'mensile') + (extras.length ? ', con ' + extras.join(', ') : '') + '.';
    }
  });

  /* ================= moduli inviati a Supabase ================= */
  var live = (cfg.liveHosts || []).indexOf(location.hostname) > -1;
  var fnUrl = function (n) { return String(cfg.supabaseUrl || '').replace(/\/$/, '') + '/functions/v1/' + n; };
  function post(name, body) {
    if (!live) return new Promise(function (res) { setTimeout(function () { res({ ok: true, preview: true }); }, 700); });
    return fetch(fnUrl(name), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { j.status = r.status; if (!r.ok) j.ok = false; return j; }); });
  }
  var form = $('#contactForm');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var out = $('#f-out'), btn = $('#f-send');
    var data = { tipo: $('#f-tipo').value, settore: ($('#f-settore') || {}).value || '', nome: $('#f-nome').value.trim(), email: $('#f-email').value.trim(), azienda: $('#f-azienda').value.trim(), telefono: $('#f-tel').value.trim(), messaggio: $('#f-msg').value.trim(), privacy: $('#f-privacy').checked, website: $('#f-web').value, sito: cfg.sito || 'maistu' };
    out.className = 'f-msg err';
    if (!data.nome) { out.textContent = 'Scrivi il tuo nome.'; $('#f-nome').focus(); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) { out.textContent = 'Controlla l\'email: sembra incompleta.'; $('#f-email').focus(); return; }
    if (!data.privacy) { out.textContent = 'Per inviare serve il consenso all\'informativa privacy.'; return; }
    if (data.settore) data.messaggio = 'Settore: ' + data.settore + (data.messaggio ? '\n\n' + data.messaggio : '');
    btn.disabled = true; out.className = 'f-msg'; out.textContent = 'Invio in corso…';
    post('contact', data).then(function (r) {
      if (r.ok) { out.className = 'f-msg ok'; out.textContent = r.preview ? 'Anteprima: il modulo funziona, ma da qui non invia nulla. Su maistu.it la richiesta arriva a Domotty.' : 'Richiesta ricevuta. Ti abbiamo mandato un\'email di conferma e ti ricontattiamo presto.'; form.reset(); }
      else { out.className = 'f-msg err'; out.textContent = r.status === 429 ? 'Hai già inviato alcune richieste. Riprova tra qualche minuto.' : 'Invio non riuscito. Riprova, oppure scrivici a assistenza@domotty.it.'; }
    }).catch(function () { out.className = 'f-msg err'; out.textContent = 'Invio non riuscito. Controlla la connessione, oppure scrivici a assistenza@domotty.it.'; })
      .then(function () { btn.disabled = false; });
  });
  var nl = $('#nlForm');
  if (nl) nl.addEventListener('submit', function (e) {
    e.preventDefault();
    var out = $('#nl-out'), em = $('#nl-email').value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) { out.textContent = 'Controlla l\'email: sembra incompleta.'; return; }
    out.textContent = 'Un momento…';
    post('newsletter', { action: 'subscribe', email: em, website: $('#nl-web').value, sito: cfg.sito || 'maistu' }).then(function (r) {
      out.textContent = r.ok ? (r.preview ? 'Anteprima: su maistu.it qui partirebbe l\'email di conferma.' : 'Quasi fatto: apri l\'email che ti abbiamo mandato per confermare.') : 'Iscrizione non riuscita. Riprova tra poco.';
      if (r.ok) nl.reset();
    }).catch(function () { out.textContent = 'Iscrizione non riuscita. Riprova tra poco.'; });
  });
})();
