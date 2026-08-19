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
       formula: {name, tex},
       hint: 'text',
       // mcq:
       options: [str...], correct: idx, explain: 'str',
       // numeric:
       unit, correct: num, tol, decimals, placeholder, explain,
       // order:
       items: [str... in correct order], explain,
       // sim:
       simId, args, note
     }
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

    this.idx = 0;
    this.correct = 0;
    this.total = 0;
    this.answered = false;
    this.isCorrectAnswer = false;
    this.checkFn = null;      // set per-step; returns bool
    this.gradable = false;
    this.simCtrl = null;

    this._build();
    this._renderStep();
  }

  Engine.prototype._build = function () {
    var self = this;
    var color = this.chapter.color;

    this.node = el('div', 'player');
    this.node.style.setProperty('--ch-color', color);

    var top = el('div', 'player-top');
    var back = el('button', 'icon-btn', '✕');
    back.type = 'button';
    back.addEventListener('click', function () { self.exit(); });
    var bar = el('div', 'player-bar');
    this.barFill = el('div', 'player-bar-fill');
    bar.appendChild(this.barFill);
    this.scoreEl = el('div', 'player-score', '0/0');
    top.appendChild(back); top.appendChild(bar); top.appendChild(this.scoreEl);

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
  };

  Engine.prototype._resetFoot = function (label, disabled) {
    this.feedbackEl.innerHTML = '';
    this.footbar.classList.remove('good', 'bad');
    this.actionBtn.textContent = label;
    this.actionBtn.disabled = !!disabled;
  };

  Engine.prototype._renderStep = function () {
    if (this.simCtrl) { this.simCtrl.destroy(); this.simCtrl = null; }
    this.scroll.innerHTML = '';
    this.scroll.scrollTop = 0;
    this.answered = false;
    this.isCorrectAnswer = false;
    this.checkFn = null;

    var step = this.lesson.steps[this.idx];
    var wrap = el('div', 'step');

    var kickerText = step.kicker || ({ lesson: 'CONCEPT', mcq: 'CHECK YOUR UNDERSTANDING', numeric: 'YOUR TURN', order: 'PUT IT IN ORDER', sim: 'TRY IT' })[step.kind];
    wrap.appendChild(el('div', 'step-kicker', fmt.esc(kickerText)));
    if (step.title) wrap.appendChild(el('h2', null, fmt.inline(step.title)));

    var renderers = {
      lesson: this._renderLesson,
      mcq: this._renderMcq,
      numeric: this._renderNumeric,
      order: this._renderOrder,
      sim: this._renderSim
    };
    renderers[step.kind].call(this, wrap, step);

    this.scroll.appendChild(wrap);

    this.gradable = (step.kind === 'mcq' || step.kind === 'numeric' || step.kind === 'order');
    var isLast = this.idx === this.lesson.steps.length - 1;
    this._resetFoot(this.gradable ? 'Check' : (isLast ? 'Finish' : 'Continue'), this.gradable);
    this._updateChrome();
  };

  /* ---- lesson (pure explanation) ---- */
  Engine.prototype._renderLesson = function (wrap, step) {
    if (step.body) wrap.appendChild(el('div', 'prose', fmt.rich(step.body)));
    renderFormula(wrap, step.formula);
    renderCallout(wrap, step.callout);
  };

  /* ---- multiple choice ---- */
  Engine.prototype._renderMcq = function (wrap, step) {
    var self = this;
    if (step.prompt) wrap.appendChild(el('p', 'prompt', fmt.inline(step.prompt)));
    renderFormula(wrap, step.formula);

    var order = shuffledIndices(step.options.length);
    var list = el('div', 'options');
    var selected = -1;
    var optEls = [];

    order.forEach(function (origIdx, pos) {
      var key = String.fromCharCode(65 + pos);
      var opt = el('button', 'opt', '<span class="opt-key">' + key + '</span><span class="opt-text">' + fmt.inline(step.options[origIdx]) + '</span>');
      opt.type = 'button';
      opt.addEventListener('click', function () {
        if (self.answered) return;
        selected = origIdx;
        optEls.forEach(function (o) { o.classList.remove('sel'); });
        opt.classList.add('sel');
        self.actionBtn.disabled = false;
      });
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
      return { ok: ok, explain: step.explain };
    };
  };

  /* ---- numeric answer ---- */
  Engine.prototype._renderNumeric = function (wrap, step) {
    var self = this;
    if (step.prompt) wrap.appendChild(el('p', 'prompt', fmt.inline(step.prompt)));
    renderFormula(wrap, step.formula);

    var row = el('div', 'numrow');
    var input = document.createElement('input');
    input.type = 'text';
    input.inputMode = 'decimal';
    input.className = 'numinput';
    input.placeholder = step.placeholder || '0';
    input.addEventListener('input', function () {
      self.actionBtn.disabled = input.value.trim() === '';
    });
    row.appendChild(input);
    if (step.unit) row.appendChild(el('span', 'numunit', fmt.esc(step.unit)));
    wrap.appendChild(row);
    renderHint(wrap, step.hint);

    this.checkFn = function () {
      var v = parseFloat(input.value.replace(',', '.'));
      var tol = step.tol != null ? step.tol : Math.max(0.01, Math.abs(step.correct) * 0.03);
      var ok = isFinite(v) && root.PA.kin.near(v, step.correct, tol);
      input.classList.add(ok ? 'ok' : 'ko');
      input.disabled = true;
      var explain = (step.explain || '') +
        (ok ? '' : ' Correct answer: ' + fmt.num(step.correct, step.decimals) + (step.unit ? ' ' + step.unit : '') + '.');
      return { ok: ok, explain: explain };
    };
  };

  /* ---- order / ranking ---- */
  Engine.prototype._renderOrder = function (wrap, step) {
    var self = this;
    if (step.prompt) wrap.appendChild(el('p', 'prompt', fmt.inline(step.prompt)));

    var n = step.items.length;
    var order = shuffledIndices(n);
    var list = el('div', 'orderlist');
    var rows = [];

    function draw() {
      list.innerHTML = '';
      rows = [];
      order.forEach(function (origIdx, pos) {
        var row = el('div', 'orderitem');
        row.innerHTML = '<span class="rank">' + (pos + 1) + '</span>' +
          '<span class="otext">' + fmt.inline(step.items[origIdx]) + '</span>';
        var move = el('div', 'ordermove');
        var up = el('button', null, '▲'); up.type = 'button';
        var down = el('button', null, '▼'); down.type = 'button';
        if (pos === 0) up.disabled = true;
        if (pos === n - 1) down.disabled = true;
        up.addEventListener('click', function () {
          if (self.answered) return;
          var t = order[pos - 1]; order[pos - 1] = order[pos]; order[pos] = t; draw();
        });
        down.addEventListener('click', function () {
          if (self.answered) return;
          var t = order[pos + 1]; order[pos + 1] = order[pos]; order[pos] = t; draw();
        });
        move.appendChild(up); move.appendChild(down);
        row.appendChild(move);
        list.appendChild(row);
        rows.push(row);
      });
    }
    draw();
    wrap.appendChild(list);
    renderHint(wrap, step.hint);
    this.actionBtn.disabled = false;

    this.checkFn = function () {
      var ok = true;
      for (var i = 0; i < n; i++) if (order[i] !== i) { ok = false; break; }
      rows.forEach(function (row, pos) {
        row.classList.add(order[pos] === pos ? 'ok' : 'ko');
      });
      return { ok: ok, explain: step.explain };
    };
  };

  /* ---- interactive simulation ---- */
  Engine.prototype._renderSim = function (wrap, step) {
    if (step.prompt) wrap.appendChild(el('p', 'prompt', fmt.inline(step.prompt)));
    var factory = root.PA.sims[step.simId];
    var spec = factory(step.args || {});
    this.simCtrl = root.PA.simkit.build(wrap, spec);
    if (step.note) wrap.appendChild(el('div', 'callout', '<span class="c-ico">💡</span><div>' + fmt.inline(step.note) + '</div>'));
    this.actionBtn.disabled = false;
  };

  /* ---- action button: Check -> shows feedback, Continue -> next step ---- */
  Engine.prototype._onAction = function () {
    if (this.gradable && !this.answered) {
      var result = this.checkFn();
      this.answered = true;
      this.isCorrectAnswer = result.ok;
      this.total++;
      if (result.ok) this.correct++;
      this._updateChrome();

      this.footbar.classList.add(result.ok ? 'good' : 'bad');
      var head = el('div', 'fb-head ' + (result.ok ? 'good' : 'bad'), result.ok ? '✅ Correct' : '❌ Not quite');
      this.feedbackEl.innerHTML = '';
      this.feedbackEl.appendChild(head);
      if (result.explain) this.feedbackEl.appendChild(el('div', 'fb-body', fmt.inline(result.explain)));

      var isLast = this.idx === this.lesson.steps.length - 1;
      this.actionBtn.textContent = isLast ? 'Finish' : 'Continue';
      this.actionBtn.disabled = false;
      return;
    }
    this._advance();
  };

  Engine.prototype._advance = function () {
    if (this.idx < this.lesson.steps.length - 1) {
      this.idx++;
      this._renderStep();
    } else {
      this._finish();
    }
  };

  Engine.prototype._finish = function () {
    var self = this;
    if (this.simCtrl) { this.simCtrl.destroy(); this.simCtrl = null; }

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
        self.idx = 0; self.correct = 0; self.total = 0;
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
