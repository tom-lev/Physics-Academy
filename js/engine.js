/* ============================================================
   engine.js — the lesson player.
   Takes a lesson (array of steps) and drives the fixed-position
   .player overlay: renders one step at a time, grades answers,
   tracks score, and hands off to Store on completion.

   Step schema (see js/lessons/*.js for real examples):
     {
       kind: 'lesson' | 'mcq' | 'numeric' | 'order' | 'sim',
       kicker, title,                // optional heading bits
       body,                         // rich text, 'lesson' kind
       prompt,                       // question text, other kinds
       callout: {variant, icon, text},
       formula: {name, tex, vars: [{sym, mean}...]},  // vars renders an
                                      // optional "who's who" legend below
                                      // the formula, sym through math, mean
                                      // through inline markup
       hint: 'text',
       // lesson only:
       prereq: 'text',               // rendered as a fixed prereq callout,
                                      // above everything else in the step —
                                      // reserved for a chapter's first lesson
       hook: 'text',                 // short relatable scenario rendered
                                      // above body, before the formal def
       // mcq:
       options: [str...], correct: idx, explain: 'str',
       wrongExplain: {idx: 'str'},   // optional, keyed by option's original
                                      // index (same indexing as `correct`);
                                      // misconception-specific explanation
                                      // shown instead of `explain` when that
                                      // particular wrong option is picked
       // numeric:
       unit, correct: num, tol, decimals, placeholder, explain,
       // order:
       items: [str... in correct order], explain,
       // sim:
       simId, args, note
     }

   Mid-lesson progress (current step + graded answers so far) is
   persisted via PA.store.save/load/clearStepProgress so leaving and
   reopening a lesson resumes where you left off; Back/Continue replay
   already-graded steps in their locked, already-answered state rather
   than re-asking them.
   ============================================================ */
(function (root) {
  'use strict';

  var fmt = root.PA.fmt;

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function shuffledIndices(n) {
    var a = [];
    for (var i = 0; i < n; i++) a.push(i);
    for (var i2 = a.length - 1; i2 > 0; i2--) {
      var j = Math.floor(Math.random() * (i2 + 1));
      var t = a[i2]; a[i2] = a[j]; a[j] = t;
    }
    return a;
  }

  /* ---------- shared block renderers ---------- */

  function renderCallout(container, callout) {
    if (!callout) return;
    var box = el('div', 'callout' + (callout.variant ? ' ' + callout.variant : ''));
    var ico = callout.icon || (callout.variant === 'warn' ? '⚠️' : callout.variant === 'key' ? '🔑' : '💡');
    box.innerHTML = '<span class="c-ico">' + ico + '</span><div>' + fmt.inline(callout.text) + '</div>';
    container.appendChild(box);
  }

  function renderFormula(container, formula) {
    if (!formula) return;
    var box = el('div', 'formula');
    box.innerHTML = (formula.name ? '<span class="fname">' + fmt.esc(formula.name) + '</span>' : '') +
      fmt.mathSpan(formula.tex);
    if (formula.vars && formula.vars.length) {
      var legend = el('div', 'formula-legend');
      legend.innerHTML = formula.vars.map(function (v) {
        return '<span class="fv"><span class="fv-sym">' + fmt.mathSpan(v.sym) + '</span> — ' + fmt.inline(v.mean) + '</span>';
      }).join('');
      box.appendChild(legend);
    }
    container.appendChild(box);
  }

  function renderHint(container, hint) {
    if (!hint) return;
    var btn = el('button', 'hint-btn', '💡 Hint');
    btn.type = 'button';
    var shown = false, text = null;
    btn.addEventListener('click', function () {
      shown = !shown;
      if (shown && !text) {
        text = el('div', 'hint-text', fmt.inline(hint));
        container.appendChild(text);
      }
      if (text) text.style.display = shown ? '' : 'none';
      btn.textContent = shown ? '💡 Hide hint' : '💡 Hint';
    });
    container.appendChild(btn);
  }

  /* ---------- Engine ---------- */

  function Engine(opts) {
    this.chapter = opts.chapter;
    this.lesson = opts.lesson;
    this.onExit = opts.onExit || function () {};
    this.onAdvance = opts.onAdvance || function () {};

    var n = this.lesson.steps.length;
    var saved = root.PA.store.loadStepProgress(this.lesson.id);
    if (saved && saved.idx >= 0 && saved.idx < n) {
      this.idx = saved.idx;
      this.stepAnswers = saved.answers.slice(0, n);
    } else {
      this.idx = 0;
      this.stepAnswers = [];
    }

    this.correct = 0;
    this.total = 0;
    this.answered = false;
    this.checkFn = null;      // set per-step; returns {ok, explain, detail}
    this.gradable = false;
    this.simCtrl = null;

    this._recomputeScore();
    this._build();
    this._renderStep();
  }

  Engine.prototype._recomputeScore = function () {
    var correct = 0, total = 0;
    for (var i = 0; i < this.stepAnswers.length; i++) {
      var a = this.stepAnswers[i];
      if (a && a.graded) { total++; if (a.ok) correct++; }
    }
    this.correct = correct;
    this.total = total;
  };

  Engine.prototype._saveProgress = function () {
    root.PA.store.saveStepProgress(this.lesson.id, this.idx, this.stepAnswers);
  };

  Engine.prototype._build = function () {
    var self = this;
    var color = this.chapter.color;

    this.node = el('div', 'player');
    this.node.style.setProperty('--ch-color', color);

    var top = el('div', 'player-top');
    var close = el('button', 'icon-btn', '✕');
    close.type = 'button';
    close.addEventListener('click', function () { self.exit(); });
    var back = el('button', 'icon-btn', '‹');
    back.type = 'button';
    back.title = 'Previous step';
    back.addEventListener('click', function () { self._goBack(); });
    this.backBtn = back;
    var bar = el('div', 'player-bar');
    this.barFill = el('div', 'player-bar-fill');
    bar.appendChild(this.barFill);
    this.scoreEl = el('div', 'player-score', '0/0');
    top.appendChild(close); top.appendChild(back); top.appendChild(bar); top.appendChild(this.scoreEl);

    this.scroll = el('div', 'player-scroll');

    this.footbar = el('div', 'footbar');
    var inner = el('div', 'foot-inner');
    this.feedbackEl = el('div', 'feedback');
    this.actionBtn = el('button', 'btn btn-primary', 'Continue');
    this.actionBtn.type = 'button';
    this.actionBtn.addEventListener('click', function () { self._onAction(); });
    inner.appendChild(this.feedbackEl);
    inner.appendChild(this.actionBtn);
    this.footbar.appendChild(inner);

    this.node.appendChild(top);
    this.node.appendChild(this.scroll);
    this.node.appendChild(this.footbar);

    document.body.appendChild(this.node);
    document.body.style.overflow = 'hidden';
  };

  Engine.prototype._updateChrome = function () {
    var steps = this.lesson.steps;
    var pct = Math.round(((this.idx) / steps.length) * 100);
    this.barFill.style.width = Math.max(6, pct) + '%';
    this.scoreEl.textContent = this.correct + '/' + this.total;
    this.backBtn.disabled = this.idx === 0;
    this.backBtn.style.opacity = this.idx === 0 ? '.32' : '';
    this.backBtn.style.pointerEvents = this.idx === 0 ? 'none' : '';
  };

  Engine.prototype._resetFoot = function (label, disabled) {
    this.feedbackEl.innerHTML = '';
    this.footbar.classList.remove('good', 'bad');
    this.actionBtn.textContent = label;
    this.actionBtn.disabled = !!disabled;
  };

  Engine.prototype._showFeedback = function (ok, explain, exact) {
    this.footbar.classList.add(ok ? 'good' : 'bad');
    var headText = ok ? (exact ? '🎯 Exact!' : '✅ Correct') : '❌ Not quite';
    var head = el('div', 'fb-head ' + (ok ? 'good' : 'bad'), headText);
    this.feedbackEl.innerHTML = '';
    this.feedbackEl.appendChild(head);
    if (explain) this.feedbackEl.appendChild(el('div', 'fb-body', fmt.inline(explain)));
  };

  Engine.prototype._renderStep = function () {
    if (this.simCtrl) { this.simCtrl.destroy(); this.simCtrl = null; }
    this.scroll.innerHTML = '';
    this.scroll.scrollTop = 0;
    this.checkFn = null;

    var step = this.lesson.steps[this.idx];
    var saved = this.stepAnswers[this.idx] || null;
    this.gradable = (step.kind === 'mcq' || step.kind === 'numeric' || step.kind === 'order');
    this.answered = !!(saved && saved.graded);

    var wrap = el('div', 'step');

    var kickerText = step.kicker || ({ lesson: 'CONCEPT', mcq: 'CHECK YOUR UNDERSTANDING', numeric: 'YOUR TURN', order: 'PUT IT IN ORDER', sim: 'TRY IT' })[step.kind];
    var kickerRow = el('div', 'step-kicker-row');
    kickerRow.appendChild(el('span', 'step-kicker', fmt.esc(kickerText)));
    if (step.difficulty) kickerRow.appendChild(el('span', 'diff-badge diff-' + step.difficulty, fmt.esc(step.difficulty)));
    wrap.appendChild(kickerRow);
    if (step.title) wrap.appendChild(el('h2', null, fmt.inline(step.title)));

    var isLast = this.idx === this.lesson.steps.length - 1;
    var freshDisabled = (step.kind === 'mcq' || step.kind === 'numeric');
    this._resetFoot(this.gradable ? 'Check' : (isLast ? 'Finish' : 'Continue'), !this.answered && freshDisabled);

    var renderers = {
      lesson: this._renderLesson,
      mcq: this._renderMcq,
      numeric: this._renderNumeric,
      order: this._renderOrder,
      sim: this._renderSim
    };
    renderers[step.kind].call(this, wrap, step, saved);

    this.scroll.appendChild(wrap);

    if (this.answered) {
      this.actionBtn.textContent = isLast ? 'Finish' : 'Continue';
      this.actionBtn.disabled = false;
      this._showFeedback(saved.ok, saved.explain, saved.exact);
    }

    this._updateChrome();
  };

  /* ---- lesson (pure explanation) ---- */
  Engine.prototype._renderLesson = function (wrap, step) {
    if (step.prereq) renderCallout(wrap, { variant: 'prereq', icon: '🎒', text: step.prereq });
    if (step.hook) wrap.appendChild(el('div', 'lesson-hook', fmt.inline(step.hook)));
    if (step.body) wrap.appendChild(el('div', 'prose', fmt.rich(step.body)));
    renderFormula(wrap, step.formula);
    renderCallout(wrap, step.callout);
  };

  /* ---- multiple choice ---- */
  Engine.prototype._renderMcq = function (wrap, step, saved) {
    var self = this;
    if (step.prompt) wrap.appendChild(el('p', 'prompt', fmt.inline(step.prompt)));
    renderFormula(wrap, step.formula);

    var order = shuffledIndices(step.options.length);
    var list = el('div', 'options');
    var selected = saved ? saved.detail.selected : -1;
    var optEls = [];

    order.forEach(function (origIdx, pos) {
      var key = String.fromCharCode(65 + pos);
      var opt = el('button', 'opt', '<span class="opt-key">' + key + '</span><span class="opt-text">' + fmt.inline(step.options[origIdx]) + '</span>');
      opt.type = 'button';
      if (saved) {
        opt.classList.add('locked');
        if (origIdx === step.correct) opt.classList.add('ok');
        else if (origIdx === selected) opt.classList.add('ko');
        else opt.classList.add('dim');
      } else {
        opt.addEventListener('click', function () {
          if (self.answered) return;
          selected = origIdx;
          optEls.forEach(function (o) { o.classList.remove('sel'); });
          opt.classList.add('sel');
          self.actionBtn.disabled = false;
        });
      }
      optEls.push(opt);
      list.appendChild(opt);
    });
    wrap.appendChild(list);
    renderHint(wrap, step.hint);

    this.checkFn = function () {
      var ok = selected === step.correct;
      optEls.forEach(function (o, pos) {
        var origIdx = order[pos];
        o.classList.add('locked');
        if (origIdx === step.correct) o.classList.add('ok');
        else if (origIdx === selected) o.classList.add('ko');
        else o.classList.add('dim');
      });
      var explain = (!ok && step.wrongExplain && step.wrongExplain[selected] != null) ?
        step.wrongExplain[selected] : step.explain;
      return { ok: ok, explain: explain, detail: { selected: selected } };
    };
  };

  /* ---- numeric answer ---- */
  Engine.prototype._renderNumeric = function (wrap, step, saved) {
    var self = this;
    if (step.prompt) wrap.appendChild(el('p', 'prompt', fmt.inline(step.prompt)));
    renderFormula(wrap, step.formula);

    var row = el('div', 'numrow');
    var input = document.createElement('input');
    input.type = 'text';
    input.inputMode = 'decimal';
    input.className = 'numinput';
    input.placeholder = step.placeholder || '0';

    if (saved) {
      input.value = saved.detail.value;
      input.disabled = true;
      input.classList.add(saved.ok ? 'ok' : 'ko');
    } else {
      input.addEventListener('input', function () {
        self.actionBtn.disabled = input.value.trim() === '';
      });
    }
    row.appendChild(input);
    if (step.unit) row.appendChild(el('span', 'numunit', fmt.esc(step.unit)));
    wrap.appendChild(row);
    renderHint(wrap, step.hint);

    this.checkFn = function () {
      var v = parseFloat(input.value.replace(',', '.'));
      var tol = step.tol != null ? step.tol : Math.max(0.01, Math.abs(step.correct) * 0.03);
      var ok = isFinite(v) && root.PA.kin.near(v, step.correct, tol);
      var exact = ok && fmt.num(v, step.decimals) === fmt.num(step.correct, step.decimals);
      input.classList.add(ok ? 'ok' : 'ko');
      input.disabled = true;
      var explain = (step.explain || '') +
        (ok ? '' : ' Correct answer: ' + fmt.num(step.correct, step.decimals) + (step.unit ? ' ' + step.unit : '') + '.');
      return { ok: ok, exact: exact, explain: explain, detail: { value: v } };
    };
  };

  /* ---- order / ranking (drag to reorder) ---- */
  Engine.prototype._renderOrder = function (wrap, step, saved) {
    var self = this;
    if (step.prompt) wrap.appendChild(el('p', 'prompt', fmt.inline(step.prompt)));

    var n = step.items.length;
    var order = saved ? saved.detail.order.slice() : shuffledIndices(n);
    var locked = !!saved;
    var GAP = 9;
    var list = el('div', 'orderlist');
    var rows = [];
    var drag = null;

    function draw() {
      list.innerHTML = '';
      rows = [];
      order.forEach(function (origIdx, pos) {
        var row = el('div', 'orderitem');
        row.innerHTML =
          '<span class="rank">' + (pos + 1) + '</span>' +
          '<span class="otext">' + fmt.inline(step.items[origIdx]) + '</span>' +
          (locked ? '' : '<span class="draghandle" aria-hidden="true">⠿⠿</span>');
        if (locked) row.classList.add(order[pos] === pos ? 'ok' : 'ko');
        list.appendChild(row);
        rows.push(row);
        if (!locked) wireDrag(row, pos);
      });
    }

    function wireDrag(row, pos) {
      var handle = row.querySelector('.draghandle');
      handle.addEventListener('pointerdown', function (e) {
        if (self.answered) return;
        if (e.button != null && e.button !== 0) return;
        startDrag(e, pos);
      });
    }

    function measure() {
      var heights = rows.map(function (r) { return r.offsetHeight; });
      var tops = [], y = 0;
      for (var i = 0; i < heights.length; i++) { tops[i] = y; y += heights[i] + GAP; }
      var mids = tops.map(function (t, i) { return t + heights[i] / 2; });
      return { heights: heights, tops: tops, mids: mids };
    }

    function startDrag(e, startPos) {
      if (e.cancelable) e.preventDefault();
      var m = measure();
      drag = { startPos: startPos, target: startPos, startY: e.clientY, heights: m.heights, tops: m.tops, mids: m.mids };
      var row = rows[startPos];
      row.classList.add('dragging');
      try { row.setPointerCapture(e.pointerId); } catch (err) {}
      row.addEventListener('pointermove', onMove);
      row.addEventListener('pointerup', onUp);
      row.addEventListener('pointercancel', onUp);

      function onMove(ev) {
        if (!drag) return;
        var dy = ev.clientY - drag.startY;
        row.style.transform = 'translateY(' + dy + 'px)';

        var center = drag.mids[drag.startPos] + dy;
        var count = 0;
        for (var i = 0; i < rows.length; i++) {
          if (i === drag.startPos) continue;
          if (drag.mids[i] < center) count++;
        }
        if (count !== drag.target) { drag.target = count; preview(); }
      }

      function preview() {
        var posOrder = [];
        for (var i = 0; i < rows.length; i++) posOrder.push(i);
        var moved = posOrder.splice(drag.startPos, 1)[0];
        posOrder.splice(drag.target, 0, moved);

        var y = 0;
        for (var k = 0; k < posOrder.length; k++) {
          var p = posOrder[k];
          if (p !== drag.startPos) {
            rows[p].style.transition = 'transform .16s ease';
            rows[p].style.transform = 'translateY(' + (y - drag.tops[p]) + 'px)';
          }
          y += drag.heights[p] + GAP;
        }
      }

      function onUp(ev) {
        try { row.releasePointerCapture(ev.pointerId); } catch (err) {}
        row.removeEventListener('pointermove', onMove);
        row.removeEventListener('pointerup', onUp);
        row.removeEventListener('pointercancel', onUp);
        var target = drag.target, startPosLocal = drag.startPos;
        drag = null;
        if (target !== startPosLocal) {
          var moved = order.splice(startPosLocal, 1)[0];
          order.splice(target, 0, moved);
        }
        draw();
      }
    }

    draw();
    wrap.appendChild(list);
    renderHint(wrap, step.hint);

    this.checkFn = function () {
      var ok = true;
      for (var i = 0; i < n; i++) if (order[i] !== i) { ok = false; break; }
      rows.forEach(function (row, pos) {
        row.classList.add(order[pos] === pos ? 'ok' : 'ko');
      });
      return { ok: ok, explain: step.explain, detail: { order: order.slice() } };
    };
  };

  /* ---- interactive simulation ---- */
  Engine.prototype._renderSim = function (wrap, step) {
    if (step.prompt) wrap.appendChild(el('p', 'prompt', fmt.inline(step.prompt)));
    var factory = root.PA.sims[step.simId];
    var spec = factory(step.args || {});
    this.simCtrl = root.PA.simkit.build(wrap, spec);
    if (step.note) wrap.appendChild(el('div', 'callout', '<span class="c-ico">💡</span><div>' + fmt.inline(step.note) + '</div>'));
  };

  /* ---- action button: Check -> shows feedback, Continue -> next step ---- */
  Engine.prototype._onAction = function () {
    if (this.gradable && !this.answered) {
      var result = this.checkFn();
      this.answered = true;
      this.stepAnswers[this.idx] = { graded: true, ok: result.ok, exact: result.exact, explain: result.explain, detail: result.detail };
      this._recomputeScore();
      this._updateChrome();
      this._showFeedback(result.ok, result.explain, result.exact);

      var isLast = this.idx === this.lesson.steps.length - 1;
      this.actionBtn.textContent = isLast ? 'Finish' : 'Continue';
      this.actionBtn.disabled = false;
      this._saveProgress();
      return;
    }
    this._advance();
  };

  Engine.prototype._advance = function () {
    if (this.idx < this.lesson.steps.length - 1) {
      this.idx++;
      this._renderStep();
      this._saveProgress();
    } else {
      this._finish();
    }
  };

  Engine.prototype._goBack = function () {
    if (this.idx === 0) return;
    this.idx--;
    this._renderStep();
    this._saveProgress();
  };

  Engine.prototype._finish = function () {
    var self = this;
    if (this.simCtrl) { this.simCtrl.destroy(); this.simCtrl = null; }

    root.PA.store.clearStepProgress(this.lesson.id);
    var result = root.PA.store.completeLesson(this.lesson.id, this.correct, this.total);
    this.onAdvance(result);

    this.scroll.innerHTML = '';
    this.footbar.style.display = 'none';
    this.barFill.style.width = '100%';

    var pct = Math.round(result.accuracy * 100);
    var screen = el('div', 'done-screen');
    screen.innerHTML =
      '<div class="done-medal">' + (pct >= 80 ? '🏆' : pct >= 50 ? '🥈' : '📘') + '</div>' +
      '<h2>' + (result.firstTime ? 'Lesson complete!' : 'Nice review!') + '</h2>' +
      '<p>' + fmt.esc(this.lesson.title) + '</p>' +
      '<div class="done-stats">' +
        '<div class="done-stat" style="--ds-color:var(--warn)"><div class="ds-value">+' + result.xpGained + '</div><div class="ds-label">XP</div></div>' +
        '<div class="done-stat" style="--ds-color:var(--good)"><div class="ds-value">' + pct + '%</div><div class="ds-label">Accuracy</div></div>' +
        '<div class="done-stat" style="--ds-color:#fb923c"><div class="ds-value">' + result.streak + '</div><div class="ds-label">Streak</div></div>' +
      '</div>' +
      '<div class="done-actions"></div>';
    this.scroll.appendChild(screen);

    var actions = screen.querySelector('.done-actions');
    var next = root.PA.store.nextLesson(this.chapter);
    if (next && next.id !== this.lesson.id) {
      var nextBtn = el('button', 'btn btn-primary btn-block', 'Next lesson →');
      nextBtn.type = 'button';
      nextBtn.addEventListener('click', function () {
        self.lesson = next;
        var n = next.steps.length;
        var savedNext = root.PA.store.loadStepProgress(next.id);
        if (savedNext && savedNext.idx >= 0 && savedNext.idx < n) {
          self.idx = savedNext.idx;
          self.stepAnswers = savedNext.answers.slice(0, n);
        } else {
          self.idx = 0;
          self.stepAnswers = [];
        }
        self._recomputeScore();
        self.footbar.style.display = '';
        self._renderStep();
      });
      actions.appendChild(nextBtn);
    }
    var backBtn = el('button', 'btn btn-ghost btn-block', 'Back to chapter');
    backBtn.type = 'button';
    backBtn.addEventListener('click', function () { self.exit(); });
    actions.appendChild(backBtn);
  };

  Engine.prototype.exit = function () {
    if (this.simCtrl) { this.simCtrl.destroy(); this.simCtrl = null; }
    document.body.style.overflow = '';
    this.node.parentNode.removeChild(this.node);
    this.onExit();
  };

  root.PA = root.PA || {};
  root.PA.engine = {
    start: function (chapter, lesson, opts) {
      opts = opts || {};
      return new Engine({
        chapter: chapter,
        lesson: lesson,
        onExit: opts.onExit,
        onAdvance: opts.onAdvance
      });
    }
  };

})(typeof window !== 'undefined' ? window : globalThis);
