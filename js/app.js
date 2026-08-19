/* ============================================================
   app.js — router and view rendering. Hash-based, two views:
     #/                     course map (tiers -> chapter cards)
     #/chapter/<id>         lesson path for one chapter
   The lesson player itself is a full-screen overlay (engine.js)
   that mounts on top of whichever view is behind it.
   ============================================================ */
(function (root) {
  'use strict';

  var fmt = root.PA.fmt;
  var store = root.PA.store;
  var curriculum = root.PA.curriculum;

  var view = document.getElementById('view');
  var toastEl = document.getElementById('toast');
  var toastTimer = null;

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2400);
  }

  /* ---------- topbar chips ---------- */

  function paintChrome() {
    document.getElementById('xp-val').textContent = store.xp();
    document.getElementById('streak-val').textContent = store.streak();
  }
  store.onChange(paintChrome);

  /* ---------- home: course map ---------- */

  function firstUpNext() {
    var chs = curriculum.allChapters();
    for (var i = 0; i < chs.length; i++) {
      var next = store.nextLesson(chs[i]);
      if (next) return { chapter: chs[i], lesson: next };
    }
    return null;
  }

  function renderHome() {
    var page = el('div', 'page');
    var wrap = el('div', 'wrap');

    var hero = el('div', 'hero');
    var up = firstUpNext();
    hero.innerHTML =
      '<h1>Learn physics by <span class="grad">playing with it</span>.</h1>' +
      '<p>Bite-sized lessons, real formulas, and simulations you can grab and break — from your first velocity graph to special relativity.</p>';
    var actions = el('div', 'hero-actions');
    if (up) {
      var cont = el('a', 'btn btn-primary', (store.xp() > 0 ? 'Continue: ' : 'Start: ') + fmt.esc(up.lesson.title));
      cont.href = '#/chapter/' + up.chapter.id;
      actions.appendChild(cont);
    }
    hero.appendChild(actions);
    wrap.appendChild(hero);

    curriculum.tiers.forEach(function (tier) {
      var tierEl = el('div', 'tier');
      tierEl.style.setProperty('--tier-color', tier.color);
      tierEl.innerHTML =
        '<div class="tier-head"><span class="tier-num">' + fmt.esc(tier.num) + '</span><h2>' + fmt.esc(tier.title) + '</h2></div>' +
        '<div class="tier-rule"></div>';

      var grid = el('div', 'chapter-grid');
      tier.chapters.forEach(function (ch) {
        var live = curriculum.isLive(ch);
        var prog = store.chapterProgress(ch);
        var card = el('a', 'chapter-card' + (live ? '' : ' locked'));
        card.href = '#/chapter/' + ch.id;
        card.style.setProperty('--ch-color', ch.color);

        var badge = '';
        if (prog.total > 0 && prog.done === prog.total) badge = '<span class="ch-badge done">Done</span>';
        else if (live) badge = '<span class="ch-badge live">Live</span>';
        else badge = '<span class="ch-badge">Soon</span>';

        card.innerHTML =
          badge +
          '<div class="ch-top"><div class="ch-icon">' + ch.icon + '</div>' +
          '<div class="ch-meta"><div class="ch-kicker">' + fmt.esc(ch.kicker) + '</div>' +
          '<div class="ch-title">' + fmt.esc(ch.title) + '</div></div></div>' +
          '<div class="ch-blurb">' + fmt.esc(ch.blurb) + '</div>' +
          '<div class="ch-foot"><div class="progress-track"><div class="progress-fill" style="width:' + Math.round(prog.pct * 100) + '%"></div></div>' +
          '<div class="ch-count">' + prog.done + '/' + (prog.total || ch.lessons.length) + '</div></div>';
        grid.appendChild(card);
      });
      tierEl.appendChild(grid);
      wrap.appendChild(tierEl);
    });

    page.appendChild(wrap);
    view.innerHTML = '';
    view.appendChild(page);
  }

  /* ---------- chapter: lesson path ---------- */

  function renderChapter(id) {
    var ch = curriculum.findChapter(id);
    if (!ch) { location.hash = '#/'; return; }

    var page = el('div', 'page');
    page.style.setProperty('--ch-color', ch.color);
    var wrap = el('div', 'wrap');

    var crumb = el('a', 'crumb', '← Course map');
    crumb.href = '#/';
    wrap.appendChild(crumb);

    var heroEl = el('div', 'ch-hero');
    heroEl.innerHTML =
      '<div class="ch-icon">' + ch.icon + '</div>' +
      '<div><h1>' + fmt.esc(ch.title) + '</h1><p>' + fmt.esc(ch.blurb) + '</p></div>';
    wrap.appendChild(heroEl);

    if (!ch.lessons.length) {
      var empty = el('div', 'empty');
      empty.innerHTML = '<div class="big">🚧</div><p>This chapter is still being written. Check back soon.</p>';
      wrap.appendChild(empty);
    } else {
      var nextLesson = store.nextLesson(ch);
      var path = el('div', 'path');

      ch.lessons.forEach(function (lesson, i) {
        var done = store.isDone(lesson.id);
        var authored = !!lesson.steps;
        var isNext = authored && nextLesson && nextLesson.id === lesson.id;
        var cls = 'node' + (done ? ' done' : '') + (isNext ? ' next' : '') + (!authored ? ' soon' : '');

        var node = el('button', cls);
        node.type = 'button';
        var dotContent = done ? '✓' : (authored ? String(i + 1) : '🔒');
        node.innerHTML =
          '<div class="node-rail"><div class="node-line"></div><div class="node-dot">' + dotContent + '</div></div>' +
          '<div class="node-body"><div class="node-title">' + fmt.esc(lesson.title) + '</div>' +
          '<div class="node-sub">' + fmt.esc(lesson.sub || '') + '</div></div>';

        if (authored) {
          node.addEventListener('click', function () {
            root.PA.engine.start(ch, lesson, {
              onExit: function () { renderChapter(id); },
              onAdvance: function () {}
            });
          });
        } else {
          node.addEventListener('click', function () { toast('This lesson isn\'t written yet.'); });
        }
        path.appendChild(node);
      });
      wrap.appendChild(path);
    }

    page.appendChild(wrap);
    view.innerHTML = '';
    view.appendChild(page);
  }

  /* ---------- router ---------- */

  function route() {
    var hash = location.hash || '#/';
    var m = /^#\/chapter\/([^/]+)/.exec(hash);
    if (m) renderChapter(decodeURIComponent(m[1]));
    else renderHome();
  }

  root.addEventListener('hashchange', route);
  paintChrome();
  route();

  root.PA = root.PA || {};
  root.PA.app = { toast: toast, refresh: route };

})(typeof window !== 'undefined' ? window : globalThis);
