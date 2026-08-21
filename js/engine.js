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
       formula: {name, words, tex, vars: [{sym, mean}...]},
                                      // words: optional plain-English
                                      // restatement of the formula, no
                                      // symbols, rendered above the math —
                                      // "displacement = final position -
                                      // initial position" above "Δx = xf-xi"
                                      // vars renders an optional "who's who"
                                      // legend below the formula, sym
                                      // through math, mean through inline
                                      // markup
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

  /* ---------- calculator: safe expression evaluator (no eval/Function) ---------- */

  function calcTokenize(src) {
    var tokens = [], i = 0, n = src.length;
    while (i < n) {
      var c = src[i];
      if (c === ' ') { i++; continue; }
      if ((c >= '0' && c <= '9') || c === '.') {
        var j = i, dots = 0;
        while (j < n && ((src[j] >= '0' && src[j] <= '9') || src[j] === '.')) {
          if (src[j] === '.') dots++;
          j++;
        }
        if (dots > 1) throw new Error('bad number');
        tokens.push({ t: 'num', v: parseFloat(src.slice(i, j)) });
        i = j;
        continue;
      }
      if (c === '+' || c === '-') { tokens.push({ t: 'op', v: c }); i++; continue; }
      if (c === '*' || c === '×') { tokens.push({ t: 'op', v: '*' }); i++; continue; }
      if (c === '/' || c === '÷') { tokens.push({ t: 'op', v: '/' }); i++; continue; }
      if (c === '^') { tokens.push({ t: 'op', v: '^' }); i++; continue; }
      if (c === '(') { tokens.push({ t: 'lp' }); i++; continue; }
      if (c === ')') { tokens.push({ t: 'rp' }); i++; continue; }
      if (c === '√') { tokens.push({ t: 'sqrt' }); i++; continue; }
      throw new Error('unexpected character: ' + c);
    }
    return tokens;
  }

  // Recursive-descent, precedence low->high: + - , * / , ^ (right-assoc), unary - / √
  function CalcParser(tokens) {
    this.toks = tokens;
    this.pos = 0;
  }
  CalcParser.prototype.peek = function () { return this.toks[this.pos]; };
  CalcParser.prototype.take = function () { return this.toks[this.pos++]; };
  CalcParser.prototype.expr = function () {
    var v = this.term(), t;
    while ((t = this.peek()) && t.t === 'op' && (t.v === '+' || t.v === '-')) {
      this.take();
      var rhs = this.term();
      v = t.v === '+' ? v + rhs : v - rhs;
    }
    return v;
  };
  CalcParser.prototype.term = function () {
    var v = this.power(), t;
    while ((t = this.peek()) && t.t === 'op' && (t.v === '*' || t.v === '/')) {
      this.take();
      var rhs = this.power();
      v = t.v === '*' ? v * rhs : v / rhs;
    }
    return v;
  };
  CalcParser.prototype.power = function () {
    var v = this.unary();
    var t = this.peek();
    if (t && t.t === 'op' && t.v === '^') { this.take(); return Math.pow(v, this.power()); }
    return v;
  };
  CalcParser.prototype.unary = function () {
    var t = this.peek();
    if (t && t.t === 'op' && t.v === '-') { this.take(); return -this.unary(); }
    if (t && t.t === 'op' && t.v === '+') { this.take(); return this.unary(); }
    if (t && t.t === 'sqrt') {
      this.take();
      var v = this.unary();
      if (v < 0) throw new Error('sqrt of a negative number');
      return Math.sqrt(v);
    }
    return this.primary();
  };
  CalcParser.prototype.primary = function () {
    var t = this.take();
    if (!t) throw new Error('unexpected end of expression');
    if (t.t === 'num') return t.v;
    if (t.t === 'lp') {
      var v = this.expr();
      var close = this.take();
      if (!close || close.t !== 'rp') throw new Error('missing )');
      return v;
    }
    throw new Error('unexpected token');
  };

  function calcEval(src) {
    var tokens = calcTokenize(src);
    if (!tokens.length) throw new Error('empty expression');
    var p = new CalcParser(tokens);
    var v = p.expr();
    if (p.pos !== tokens.length) throw new Error('unexpected trailing input');
    if (typeof v !== 'number' || !isFinite(v)) throw new Error('result is not a finite number');
    return v;
  }

  function calcSafeEval(src) {
    try { return { ok: true, value: calcEval(src) }; }
    catch (e) { return { ok: false }; }
  }

  function isCalcOpChar(c) {
    return c === '+' || c === '-' || c === '×' || c === '÷' || c === '^';
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
      (formula.words ? '<div class="formula-words">' + fmt.inline(formula.words) + '</div>' : '') +
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
    var resuming = false;
    if (saved && saved.idx >= 0 && saved.idx < n) {
      this.idx = saved.idx;
      this.maxIdx = Math.min(n - 1, Math.max(this.idx, saved.maxIdx != null ? saved.maxIdx : this.idx));
      this.stepAnswers = saved.answers.slice(0, n);
      resuming = this.idx > 0;
    } else {
      this.idx = 0;
      this.maxIdx = 0;
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
    // Resuming mid-lesson replays only already-graded steps, not unseen
    // content — but silently landing past step 1 can read as "this wasn't
    // taught yet" to someone who doesn't remember an earlier visit. Say so.
    if (resuming) this._toast('↩ Resumed at step ' + (this.idx + 1) + ' of ' + n);
  }

  Engine.prototype._toast = function (msg) {
    var el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2600);
  };

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
    root.PA.store.saveStepProgress(this.lesson.id, this.idx, this.stepAnswers, this.maxIdx);
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
    var fwd = el('button', 'icon-btn', '›');
    fwd.type = 'button';
    fwd.title = 'Skip forward to a step you already reached';
    fwd.addEventListener('click', function () { self._goForward(); });
    this.fwdBtn = fwd;
    var calc = el('button', 'icon-btn', '🧮');
    calc.type = 'button';
    calc.title = 'Calculator';
    calc.addEventListener('click', function () { self._toggleCalc(); });
    this.calcBtn = calc;
    var bar = el('div', 'player-bar');
    this.barFill = el('div', 'player-bar-fill');
    bar.appendChild(this.barFill);
    this.scoreEl = el('div', 'player-score', '0/0');
    top.appendChild(close); top.appendChild(back); top.appendChild(fwd); top.appendChild(calc); top.appendChild(bar); top.appendChild(this.scoreEl);

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

    this.calcOpen = false;
    this.calcExpr = '';
    this._calcErrored = false;
    this._calcLastResult = null;
    this._buildCalc();
    this.node.appendChild(this.calcPanel);

    document.body.appendChild(this.node);
    document.body.style.overflow = 'hidden';

    this._calcKeyHandler = function (e) { self._onCalcKey(e); };
    document.addEventListener('keydown', this._calcKeyHandler);
  };

  Engine.prototype._updateChrome = function () {
    var steps = this.lesson.steps;
    var pct = Math.round(((this.idx) / steps.length) * 100);
    this.barFill.style.width = Math.max(6, pct) + '%';
    this.scoreEl.textContent = this.correct + '/' + this.total;
    this.backBtn.disabled = this.idx === 0;
    this.backBtn.style.opacity = this.idx === 0 ? '.32' : '';
    this.backBtn.style.pointerEvents = this.idx === 0 ? 'none' : '';
    var canSkipFwd = this.idx < this.maxIdx;
    this.fwdBtn.disabled = !canSkipFwd;
    this.fwdBtn.style.opacity = canSkipFwd ? '' : '.32';
    this.fwdBtn.style.pointerEvents = canSkipFwd ? '' : 'none';
  };

  /* ---- calculator panel ---- */
  Engine.prototype._buildCalc = function () {
    var self = this;
    var panel = el('div', 'calc-panel');
    panel.style.display = 'none';
    this.calcPanel = panel;

    var head = el('div', 'calc-head');
    head.appendChild(el('span', 'calc-title', '🧮 Calculator'));
    var closeBtn = el('button', 'icon-btn calc-close', '✕');
    closeBtn.type = 'button';
    closeBtn.addEventListener('click', function () { self._closeCalc(); });
    head.appendChild(closeBtn);
    panel.appendChild(head);

    var disp = el('div', 'calc-display');
    this.calcExprEl = el('div', 'calc-expr', '0');
    this.calcResultEl = el('div', 'calc-result', '');
    disp.appendChild(this.calcExprEl);
    disp.appendChild(this.calcResultEl);
    panel.appendChild(disp);

    var keys = [
      { l: 'C', a: 'clear', r: 1, c: 1 }, { l: '(', a: 'lp', r: 1, c: 2 },
      { l: ')', a: 'rp', r: 1, c: 3 }, { l: '⌫', a: 'bksp', r: 1, c: 4 },
      { l: '√', a: 'sqrt', r: 2, c: 1 }, { l: '^', a: 'pow', r: 2, c: 2 },
      { l: '÷', a: 'div', r: 2, c: 3 }, { l: '×', a: 'mul', r: 2, c: 4 },
      { l: '7', a: 'd7', r: 3, c: 1 }, { l: '8', a: 'd8', r: 3, c: 2 },
      { l: '9', a: 'd9', r: 3, c: 3 }, { l: '−', a: 'sub', r: 3, c: 4 },
      { l: '4', a: 'd4', r: 4, c: 1 }, { l: '5', a: 'd5', r: 4, c: 2 },
      { l: '6', a: 'd6', r: 4, c: 3 }, { l: '+', a: 'add', r: 4, c: 4 },
      { l: '1', a: 'd1', r: 5, c: 1 }, { l: '2', a: 'd2', r: 5, c: 2 },
      { l: '3', a: 'd3', r: 5, c: 3 }, { l: '=', a: 'eq', r: 5, c: 4, rs: 2 },
      { l: '0', a: 'd0', r: 6, c: 1, cs: 2 }, { l: '.', a: 'dot', r: 6, c: 3 }
    ];
    var grid = el('div', 'calc-grid');
    keys.forEach(function (k) {
      var btn = el('button', 'calc-key' + (k.a === 'eq' ? ' eq' : (k.a === 'd' + k.l || k.a === 'dot' ? '' : ' op')), fmt.esc(k.l));
      btn.type = 'button';
      btn.style.gridColumn = k.c + (k.cs ? ' / span ' + k.cs : '');
      btn.style.gridRow = k.r + (k.rs ? ' / span ' + k.rs : '');
      btn.addEventListener('click', function () { self._calcKeyAction(k.a); });
      grid.appendChild(btn);
    });
    panel.appendChild(grid);

    var useBtn = el('button', 'btn btn-sm calc-use', 'Use this result ↓');
    useBtn.type = 'button';
    useBtn.disabled = true;
    useBtn.addEventListener('click', function () { self._calcUseResult(); });
    this.calcUseBtn = useBtn;
    panel.appendChild(useBtn);
  };

  Engine.prototype._calcKeyAction = function (code) {
    if (code === 'clear') return this._calcClear();
    if (code === 'lp') return this._calcOpenParen();
    if (code === 'rp') return this._calcCloseParen();
    if (code === 'bksp') return this._calcBackspace();
    if (code === 'sqrt') return this._calcSqrt();
    if (code === 'pow') return this._calcAppendOp('^');
    if (code === 'div') return this._calcAppendOp('÷');
    if (code === 'mul') return this._calcAppendOp('×');
    if (code === 'sub') return this._calcAppendOp('-');
    if (code === 'add') return this._calcAppendOp('+');
    if (code === 'eq') return this._calcEquals();
    if (code === 'dot') return this._calcAppendDot();
    if (code.charAt(0) === 'd') return this._calcAppendDigit(code.charAt(1));
  };

  Engine.prototype._toggleCalc = function () {
    if (this.calcOpen) this._closeCalc(); else this._openCalc();
  };
  Engine.prototype._openCalc = function () {
    this.calcOpen = true;
    this.calcPanel.style.display = '';
    this.calcBtn.classList.add('on');
    this._calcRefresh();
  };
  Engine.prototype._closeCalc = function () {
    if (!this.calcOpen) return;
    this.calcOpen = false;
    this.calcPanel.style.display = 'none';
    this.calcBtn.classList.remove('on');
    // Wipe the expression on close so a stale result/typo from a previous
    // calculation never silently prefixes what's typed next time it opens.
    this._calcSetExpr('');
  };

  Engine.prototype._onCalcKey = function (e) {
    if (!this.calcOpen) return;
    var ae = document.activeElement;
    if (ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA') && !this.calcPanel.contains(ae)) return;
    var k = e.key;
    if (k >= '0' && k <= '9') { this._calcAppendDigit(k); e.preventDefault(); return; }
    if (k === '.') { this._calcAppendDot(); e.preventDefault(); return; }
    if (k === '+') { this._calcAppendOp('+'); e.preventDefault(); return; }
    if (k === '-') { this._calcAppendOp('-'); e.preventDefault(); return; }
    if (k === '*') { this._calcAppendOp('×'); e.preventDefault(); return; }
    if (k === '/') { this._calcAppendOp('÷'); e.preventDefault(); return; }
    if (k === '^') { this._calcAppendOp('^'); e.preventDefault(); return; }
    if (k === '(') { this._calcOpenParen(); e.preventDefault(); return; }
    if (k === ')') { this._calcCloseParen(); e.preventDefault(); return; }
    if (k === 'Enter' || k === '=') { this._calcEquals(); e.preventDefault(); return; }
    if (k === 'Backspace') { this._calcBackspace(); e.preventDefault(); return; }
    if (k === 'Escape') { this._closeCalc(); e.preventDefault(); return; }
    if (k === 'c' || k === 'C') { this._calcClear(); e.preventDefault(); return; }
  };

  Engine.prototype._calcSetExpr = function (expr) {
    this.calcExpr = expr;
    this._calcErrored = false;
    this._calcRefresh();
  };
  Engine.prototype._calcAppendDigit = function (d) { this._calcSetExpr(this.calcExpr + d); };
  Engine.prototype._calcAppendDot = function () {
    var m = /[0-9.]*$/.exec(this.calcExpr)[0];
    if (m.indexOf('.') !== -1) return;
    this._calcSetExpr(this.calcExpr + (m === '' ? '0.' : '.'));
  };
  Engine.prototype._calcAppendOp = function (op) {
    var e = this.calcExpr;
    if (e === '' || e.charAt(e.length - 1) === '(') {
      if (op === '-') this._calcSetExpr(e + '-');
      return;
    }
    if (isCalcOpChar(e.charAt(e.length - 1))) this._calcSetExpr(e.slice(0, -1) + op);
    else this._calcSetExpr(e + op);
  };
  Engine.prototype._calcOpenParen = function () { this._calcSetExpr(this.calcExpr + '('); };
  Engine.prototype._calcCloseParen = function () {
    var opens = (this.calcExpr.match(/\(/g) || []).length;
    var closes = (this.calcExpr.match(/\)/g) || []).length;
    if (opens <= closes) return;
    var last = this.calcExpr.charAt(this.calcExpr.length - 1);
    if (last === '(' || isCalcOpChar(last)) return;
    this._calcSetExpr(this.calcExpr + ')');
  };
  Engine.prototype._calcSqrt = function () { this._calcSetExpr(this.calcExpr + '√('); };
  Engine.prototype._calcBackspace = function () {
    if (!this.calcExpr) return;
    var t = this.calcExpr.slice(-2) === '√(' ? this.calcExpr.slice(0, -2) : this.calcExpr.slice(0, -1);
    this._calcSetExpr(t);
  };
  Engine.prototype._calcClear = function () { this._calcSetExpr(''); };
  Engine.prototype._calcEquals = function () {
    var r = this._calcEvaluate();
    if (r.ok) { this.calcExpr = r.display; this._calcErrored = false; }
    else { this._calcErrored = true; }
    this._calcRefresh();
  };

  /** Shared by live preview and '=': auto-closes unmatched '(' so a learner
   *  who forgets a trailing ')' (very common after √() still gets a result. */
  Engine.prototype._calcEvaluate = function () {
    var expr = this.calcExpr;
    if (!expr) return { ok: false };
    var opens = (expr.match(/\(/g) || []).length;
    var closes = (expr.match(/\)/g) || []).length;
    for (var k = closes; k < opens; k++) expr += ')';
    var r = calcSafeEval(expr);
    if (!r.ok) return { ok: false };
    return { ok: true, value: r.value, display: fmt.num(r.value, 6) };
  };

  Engine.prototype._calcRefresh = function () {
    if (!this.calcExprEl) return;
    this.calcExprEl.textContent = this.calcExpr || '0';
    if (!this.calcExpr) {
      this.calcResultEl.textContent = '';
      this.calcResultEl.classList.remove('calc-err');
      this.calcUseBtn.disabled = true;
      this._calcLastResult = null;
      return;
    }
    var r = this._calcEvaluate();
    if (r.ok) {
      this.calcResultEl.textContent = '= ' + r.display;
      this.calcResultEl.classList.remove('calc-err');
      this.calcUseBtn.disabled = false;
      this._calcLastResult = r.display;
    } else {
      this.calcResultEl.textContent = this._calcErrored ? 'Error' : '';
      this.calcResultEl.classList.toggle('calc-err', !!this._calcErrored);
      this.calcUseBtn.disabled = true;
      this._calcLastResult = null;
    }
  };

  Engine.prototype._calcUseResult = function () {
    if (this._calcLastResult == null) return;
    var input = this.scroll.querySelector('.numinput:not([disabled])');
    if (!input) { this._toast('No answer field on this step'); return; }
    input.value = this._calcLastResult;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.focus();
    this._toast('Filled the answer field');
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
    this._closeCalc();
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
      if (this.idx > this.maxIdx) this.maxIdx = this.idx;
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

  /** Skip forward one step, but only into territory already reached this
   *  lesson (this.maxIdx) — never past unseen content. */
  Engine.prototype._goForward = function () {
    if (this.idx >= this.maxIdx) return;
    this.idx++;
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
          self.maxIdx = Math.min(n - 1, Math.max(self.idx, savedNext.maxIdx != null ? savedNext.maxIdx : self.idx));
          self.stepAnswers = savedNext.answers.slice(0, n);
        } else {
          self.idx = 0;
          self.maxIdx = 0;
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
    document.removeEventListener('keydown', this._calcKeyHandler);
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
