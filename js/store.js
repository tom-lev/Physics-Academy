/* ============================================================
   store.js — progress persistence (XP, streak, lesson records)
   No DOM dependencies: safe to unit-test in Node.
   ============================================================ */
(function (root) {
  'use strict';

  var KEY = 'physics-academy/v1';
  var VERSION = 1;

  function fresh() {
    return {
      version: VERSION,
      xp: 0,
      lessons: {},                       // id -> { done, best, attempts, lastTs }
      streak: { count: 0, lastDay: null },
      createdAt: Date.now()
    };
  }

  /* --- day helpers (local calendar days, not 24h windows) --- */

  function dayKey(ts) {
    var d = new Date(ts);
    // pad manually; toISOString would shift to UTC and break streaks near midnight
    var m = d.getMonth() + 1, day = d.getDate();
    return d.getFullYear() + '-' + (m < 10 ? '0' + m : m) + '-' + (day < 10 ? '0' + day : day);
  }

  function daysBetween(aKey, bKey) {
    var a = aKey.split('-').map(Number), b = bKey.split('-').map(Number);
    var ad = Date.UTC(a[0], a[1] - 1, a[2]);
    var bd = Date.UTC(b[0], b[1] - 1, b[2]);
    return Math.round((bd - ad) / 86400000);
  }

  /* --- storage backend (degrades to memory if localStorage is blocked) --- */

  var mem = null;

  function backend() {
    try {
      if (root.localStorage) {
        root.localStorage.setItem('__pa_probe', '1');
        root.localStorage.removeItem('__pa_probe');
        return root.localStorage;
      }
    } catch (e) { /* private mode / disabled */ }
    return null;
  }

  function normalize(raw) {
    var d = fresh();
    if (!raw || typeof raw !== 'object') return d;
    if (typeof raw.xp === 'number' && isFinite(raw.xp)) d.xp = Math.max(0, Math.floor(raw.xp));
    if (raw.lessons && typeof raw.lessons === 'object') {
      for (var id in raw.lessons) {
        if (!Object.prototype.hasOwnProperty.call(raw.lessons, id)) continue;
        var r = raw.lessons[id];
        if (!r || typeof r !== 'object') continue;
        d.lessons[id] = {
          done: !!r.done,
          best: clamp01(typeof r.best === 'number' ? r.best : 0),
          attempts: Math.max(0, Math.floor(r.attempts || 0)),
          lastTs: typeof r.lastTs === 'number' ? r.lastTs : 0
        };
      }
    }
    if (raw.streak && typeof raw.streak === 'object') {
      d.streak.count = Math.max(0, Math.floor(raw.streak.count || 0));
      d.streak.lastDay = typeof raw.streak.lastDay === 'string' ? raw.streak.lastDay : null;
    }
    if (typeof raw.createdAt === 'number') d.createdAt = raw.createdAt;
    return d;
  }

  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  var data;
  (function init() {
    var b = backend();
    if (!b) { mem = fresh(); data = mem; return; }
    try {
      var raw = b.getItem(KEY);
      data = raw ? normalize(JSON.parse(raw)) : fresh();
    } catch (e) {
      data = fresh();
    }
  })();

  var listeners = [];

  function save() {
    var b = backend();
    if (b) {
      try { b.setItem(KEY, JSON.stringify(data)); } catch (e) { /* quota */ }
    }
    for (var i = 0; i < listeners.length; i++) listeners[i](data);
  }

  /* --- public API --- */

  var Store = {

    KEY: KEY,

    all: function () { return data; },

    onChange: function (fn) { listeners.push(fn); return function () {
      var i = listeners.indexOf(fn); if (i >= 0) listeners.splice(i, 1);
    }; },

    xp: function () { return data.xp; },

    addXp: function (n) {
      n = Math.max(0, Math.floor(n || 0));
      data.xp += n;
      save();
      return data.xp;
    },

    record: function (lessonId) {
      return data.lessons[lessonId] || null;
    },

    isDone: function (lessonId) {
      var r = data.lessons[lessonId];
      return !!(r && r.done);
    },

    /**
     * Mark a lesson finished.
     * @param {string} lessonId
     * @param {number} correct  questions answered right
     * @param {number} total    gradable questions in the lesson
     * @param {number} [now]    injectable clock (tests)
     * @returns {{xpGained:number, accuracy:number, firstTime:boolean, streak:number}}
     */
    completeLesson: function (lessonId, correct, total, now) {
      now = now || Date.now();
      total = Math.max(0, Math.floor(total || 0));
      correct = Math.min(Math.max(0, Math.floor(correct || 0)), total);

      var accuracy = total > 0 ? correct / total : 1;
      var prev = data.lessons[lessonId];
      var firstTime = !(prev && prev.done);

      data.lessons[lessonId] = {
        done: true,
        best: Math.max(prev ? prev.best : 0, accuracy),
        attempts: (prev ? prev.attempts : 0) + 1,
        lastTs: now
      };

      // XP: full award the first time, a reduced award for review passes.
      var base = firstTime ? 20 : 5;
      var bonus = Math.round(accuracy * (firstTime ? 30 : 10));
      var gained = base + bonus;
      data.xp += gained;

      this._touchStreak(now);
      save();

      return {
        xpGained: gained,
        accuracy: accuracy,
        firstTime: firstTime,
        streak: data.streak.count
      };
    },

    _touchStreak: function (now) {
      var today = dayKey(now);
      var last = data.streak.lastDay;
      if (last === today) return;                       // already counted today
      if (last && daysBetween(last, today) === 1) data.streak.count += 1;
      else data.streak.count = 1;                       // first ever, or a gap
      data.streak.lastDay = today;
    },

    /** Streak decays to 0 for display once more than a day has passed. */
    streak: function (now) {
      now = now || Date.now();
      var last = data.streak.lastDay;
      if (!last) return 0;
      var gap = daysBetween(last, dayKey(now));
      return gap <= 1 ? data.streak.count : 0;
    },

    /** @returns {{done:number,total:number,pct:number}} */
    chapterProgress: function (chapter) {
      var lessons = (chapter && chapter.lessons) || [];
      var done = 0;
      for (var i = 0; i < lessons.length; i++) {
        if (Store.isDone(lessons[i].id)) done++;
      }
      return {
        done: done,
        total: lessons.length,
        pct: lessons.length ? done / lessons.length : 0
      };
    },

    /** First not-yet-done lesson that actually has content, else null. */
    nextLesson: function (chapter) {
      var lessons = (chapter && chapter.lessons) || [];
      for (var i = 0; i < lessons.length; i++) {
        if (lessons[i].steps && !Store.isDone(lessons[i].id)) return lessons[i];
      }
      return null;
    },

    reset: function () {
      data = fresh();
      var b = backend();
      if (b) { try { b.removeItem(KEY); } catch (e) {} }
      save();
    },

    /* test seam */
    _dayKey: dayKey,
    _daysBetween: daysBetween,
    _normalize: normalize
  };

  root.PA = root.PA || {};
  root.PA.store = Store;

  if (typeof module !== 'undefined' && module.exports) module.exports = Store;

})(typeof window !== 'undefined' ? window : globalThis);
