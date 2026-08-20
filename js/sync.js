/* ============================================================
   sync.js — optional cross-device progress sync.
   store.js stays pure localStorage/single-device; this is a thin
   opt-in layer on top: a reusable "sync code" pairs this browser
   with a small Express+Redis backend (see server/). Wholly inert
   (and store.js behaves exactly as before) until a code is linked.
   ============================================================ */
(function (root) {
  'use strict';

  // Single point of configuration.
  var API_BASE = 'https://physics-academy-nuxi.onrender.com';

  var CODE_KEY = 'physics-academy/sync-code';
  var CODE_RE = /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{4}-[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{4}$/;
  var PUSH_DEBOUNCE_MS = 2500;
  // Render's free tier can take 30-50s to wake a sleeping instance, well past
  // any single request's timeout — so a failed pull/push (most commonly the
  // very first one after a cold start) retries itself with backoff instead of
  // silently stalling until the user forces a resync by hand.
  var RETRY_BASE_MS = 5000;
  var RETRY_MAX_MS = 60000;

  var store = root.PA.store;

  /* --- local code storage (separate key from the progress store) --- */

  var memCode = null;

  function getCode() {
    try {
      if (root.localStorage) {
        var v = root.localStorage.getItem(CODE_KEY);
        return v || null;
      }
    } catch (e) { /* private mode / disabled */ }
    return memCode;
  }

  function setCode(code) {
    memCode = code;
    try { if (root.localStorage) root.localStorage.setItem(CODE_KEY, code); } catch (e) {}
  }

  function clearCode() {
    memCode = null;
    try { if (root.localStorage) root.localStorage.removeItem(CODE_KEY); } catch (e) {}
  }

  function hasCode() { return !!getCode(); }

  function normalizeCodeInput(raw) {
    return (raw || '').replace(/\s+/g, '').toUpperCase();
  }

  /* --- transport --- */

  function request(method, path, body, cb) {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open(method, API_BASE + path, true);
      xhr.timeout = 15000; // Render free tier can cold-start slowly
      if (body != null) xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.onload = function () {
        var data = null;
        try { data = xhr.responseText ? JSON.parse(xhr.responseText) : null; } catch (e) {}
        if (xhr.status >= 200 && xhr.status < 300) cb(null, data);
        else cb(new Error((data && data.error) || ('HTTP ' + xhr.status)), data);
      };
      xhr.onerror = function () { cb(new Error('network error reaching sync server')); };
      xhr.ontimeout = function () { cb(new Error('sync server timed out')); };
      xhr.send(body != null ? JSON.stringify(body) : null);
    } catch (e) {
      cb(e);
    }
  }

  /* --- merge policy (mirrors server/index.js's mergeState) --- */

  function isPlainObject(v) { return !!v && typeof v === 'object' && !(v instanceof Array); }

  function normLesson(r) {
    if (!isPlainObject(r)) return { done: false, best: 0, attempts: 0, lastTs: 0 };
    return {
      done: !!r.done,
      best: typeof r.best === 'number' && isFinite(r.best) ? r.best : 0,
      attempts: typeof r.attempts === 'number' && isFinite(r.attempts) ? Math.max(0, Math.floor(r.attempts)) : 0,
      lastTs: typeof r.lastTs === 'number' && isFinite(r.lastTs) ? r.lastTs : 0
    };
  }

  function mergeStreak(ex, inc) {
    ex = isPlainObject(ex) ? ex : { count: 0, lastDay: null };
    inc = isPlainObject(inc) ? inc : { count: 0, lastDay: null };
    var exDay = typeof ex.lastDay === 'string' ? ex.lastDay : null;
    var inDay = typeof inc.lastDay === 'string' ? inc.lastDay : null;
    var exCount = typeof ex.count === 'number' && isFinite(ex.count) ? ex.count : 0;
    var inCount = typeof inc.count === 'number' && isFinite(inc.count) ? inc.count : 0;

    if (!exDay && !inDay) return { count: 0, lastDay: null };
    if (!exDay) return { count: inCount, lastDay: inDay };
    if (!inDay) return { count: exCount, lastDay: exDay };
    if (exDay === inDay) return { count: Math.max(exCount, inCount), lastDay: exDay };
    return exDay > inDay ? { count: exCount, lastDay: exDay } : { count: inCount, lastDay: inDay };
  }

  function mergeState(existing, incoming) {
    existing = isPlainObject(existing) ? existing : {};
    incoming = isPlainObject(incoming) ? incoming : {};
    var exXp = typeof existing.xp === 'number' && isFinite(existing.xp) ? existing.xp : 0;
    var inXp = typeof incoming.xp === 'number' && isFinite(incoming.xp) ? incoming.xp : 0;

    var exLessons = isPlainObject(existing.lessons) ? existing.lessons : {};
    var inLessons = isPlainObject(incoming.lessons) ? incoming.lessons : {};
    var lessons = {};
    var id;
    for (id in exLessons) { if (Object.prototype.hasOwnProperty.call(exLessons, id)) lessons[id] = true; }
    for (id in inLessons) { if (Object.prototype.hasOwnProperty.call(inLessons, id)) lessons[id] = true; }

    var merged = {};
    for (id in lessons) {
      if (!Object.prototype.hasOwnProperty.call(lessons, id)) continue;
      var hasEx = Object.prototype.hasOwnProperty.call(exLessons, id);
      var hasIn = Object.prototype.hasOwnProperty.call(inLessons, id);
      if (hasEx && hasIn) {
        var a = normLesson(exLessons[id]);
        var b = normLesson(inLessons[id]);
        merged[id] = {
          done: a.done || b.done,
          best: Math.max(a.best, b.best),
          // attempts can't be reconstructed additively across devices; max is the
          // safe conservative choice (same tradeoff as server/index.js).
          attempts: Math.max(a.attempts, b.attempts),
          lastTs: Math.max(a.lastTs, b.lastTs)
        };
      } else {
        merged[id] = normLesson(hasEx ? exLessons[id] : inLessons[id]);
      }
    }

    return {
      xp: Math.max(exXp, inXp),
      streak: mergeStreak(existing.streak, incoming.streak),
      lessons: merged
    };
  }

  /* --- applying a merged result back into PA.store without touching store.js ---
     store.all() returns the live internal data object by reference, and its
     public KEY constant is exactly the localStorage key it persists under, so we
     mutate that object in place and then call the existing addXp(0) (a genuine
     no-op XP delta) purely to reuse store's own save()+onChange notification
     pipeline instead of duplicating it here. */

  var suppressPush = false;

  function applyMergedToStore(merged) {
    var data = store.all();
    data.xp = merged.xp;
    data.streak.count = merged.streak.count;
    data.streak.lastDay = merged.streak.lastDay;
    data.lessons = merged.lessons;
    suppressPush = true;
    try { store.addXp(0); } finally { suppressPush = false; }
    if (root.PA.app && typeof root.PA.app.refresh === 'function') root.PA.app.refresh();
  }

  /* --- status (small non-blocking indicator, read by the #/sync view) --- */

  var status = { syncing: false, lastError: null, lastSyncAt: null, retrying: false };
  var statusListeners = [];

  function setStatus(patch) {
    for (var k in patch) { if (Object.prototype.hasOwnProperty.call(patch, k)) status[k] = patch[k]; }
    for (var i = 0; i < statusListeners.length; i++) statusListeners[i](status);
  }

  /* --- retry-with-backoff for automatic pull/push (not for user-initiated
     generateCode/link, which surface their errors directly instead) --- */

  var retryTimer = null;
  var retryDelay = RETRY_BASE_MS;

  function resetRetry() {
    clearTimeout(retryTimer);
    retryTimer = null;
    retryDelay = RETRY_BASE_MS;
  }

  function scheduleRetry(fn) {
    clearTimeout(retryTimer);
    retryTimer = setTimeout(function () { fn(function () {}); }, retryDelay);
    retryDelay = Math.min(retryDelay * 2, RETRY_MAX_MS);
  }

  /* --- public API --- */

  var Sync = {

    getCode: getCode,
    hasCode: hasCode,

    status: function () { return status; },
    onStatusChange: function (fn) {
      statusListeners.push(fn);
      return function () {
        var i = statusListeners.indexOf(fn);
        if (i >= 0) statusListeners.splice(i, 1);
      };
    },

    generateCode: function (cb) {
      cb = cb || function () {};
      setStatus({ syncing: true, lastError: null });
      request('POST', '/api/sync', null, function (err, data) {
        if (err || !data || !data.code) {
          setStatus({ syncing: false, lastError: (err && err.message) || 'Could not generate a code.', retrying: false });
          cb(err || new Error('Bad response from sync server.'));
          return;
        }
        setCode(data.code);
        setStatus({ syncing: false, lastError: null, lastSyncAt: Date.now(), retrying: false });
        cb(null, data.code);
      });
    },

    link: function (code, cb) {
      cb = cb || function () {};
      var norm = normalizeCodeInput(code);
      if (!CODE_RE.test(norm)) { cb(new Error('Invalid code format. Expected XXXX-XXXX.')); return; }
      setStatus({ syncing: true, lastError: null });
      request('GET', '/api/sync/' + encodeURIComponent(norm), null, function (err, remote) {
        if (err) {
          setStatus({ syncing: false, lastError: err.message, retrying: false });
          cb(err);
          return;
        }
        setCode(norm);
        resetRetry();
        var merged = mergeState(store.all(), remote);
        applyMergedToStore(merged);
        setStatus({ syncing: false, lastError: null, lastSyncAt: Date.now(), retrying: false });
        cb(null, merged);
      });
    },

    push: function (cb) {
      cb = cb || function () {};
      var code = getCode();
      if (!code) { cb(new Error('No sync code linked.')); return; }
      setStatus({ syncing: true, lastError: null });
      request('PUT', '/api/sync/' + encodeURIComponent(code), store.all(), function (err, merged) {
        if (err) {
          var willRetry = hasCode();
          setStatus({ syncing: false, lastError: err.message, retrying: willRetry });
          if (willRetry) scheduleRetry(Sync.push);
          cb(err);
          return;
        }
        resetRetry();
        applyMergedToStore(merged);
        setStatus({ syncing: false, lastError: null, lastSyncAt: Date.now(), retrying: false });
        cb(null, merged);
      });
    },

    pull: function (cb) {
      cb = cb || function () {};
      var code = getCode();
      if (!code) { cb(new Error('No sync code linked.')); return; }
      setStatus({ syncing: true, lastError: null });
      request('GET', '/api/sync/' + encodeURIComponent(code), null, function (err, remote) {
        if (err) {
          var willRetry = hasCode();
          setStatus({ syncing: false, lastError: err.message, retrying: willRetry });
          if (willRetry) scheduleRetry(Sync.pull);
          cb(err);
          return;
        }
        resetRetry();
        var merged = mergeState(store.all(), remote);
        applyMergedToStore(merged);
        setStatus({ syncing: false, lastError: null, lastSyncAt: Date.now(), retrying: false });
        cb(null, merged);
      });
    },

    unlink: function () {
      resetRetry();
      clearCode();
      setStatus({ syncing: false, lastError: null, lastSyncAt: null, retrying: false });
    }
  };

  /* --- auto-push on local change (debounced), auto-pull once on load --- */

  var pushTimer = null;

  store.onChange(function () {
    if (suppressPush) return;
    if (!hasCode()) return;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(function () { Sync.push(function () {}); }, PUSH_DEBOUNCE_MS);
  });

  if (hasCode()) Sync.pull(function () { /* best-effort; failures already handled via status */ });

  root.PA = root.PA || {};
  root.PA.sync = Sync;

})(typeof window !== 'undefined' ? window : globalThis);
