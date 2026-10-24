/* Maistu · script delle pagine secondarie (privacy, cookie, conferma): tema e preferenze. */
(function () {
  'use strict';
  var html = document.documentElement;
  var mq = function (q) { return !!(window.matchMedia && window.matchMedia(q).matches); };
  var t = document.getElementById('theme');
  if (t) t.addEventListener('click', function () {
    var cur = html.getAttribute('data-theme') || (mq('(prefers-color-scheme: light)') ? 'light' : 'dark');
    var next = cur === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    try { localStorage.setItem('maistu-theme', next); } catch (e) {}
  });
  var c = document.getElementById('clearPrefs');
  if (c) c.addEventListener('click', function () {
    try { localStorage.removeItem('maistu-theme'); localStorage.removeItem('maistu-sim'); } catch (e) {}
    html.removeAttribute('data-theme');
    var o = document.getElementById('clearOut'); if (o) o.textContent = 'Fatto: preferenze e simulazione cancellate.';
  });
})();
