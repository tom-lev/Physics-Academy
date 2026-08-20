/* ============================================================
   simkit.js — tiny toolkit for building the interactive canvas
   simulations embedded in lesson steps. Builds the DOM scaffold
   that css/style.css already has rules for (.sim, .sim-stage,
   .sim-goal, .sim-readouts, .readout, .sim-controls, .ctrl, …)
   and wires sliders / segmented controls / buttons to a plain
   state object, redrawing on every change.

   A concrete sim (see sims.js) supplies:
     - state:      plain object, the sim's live parameters
     - draw(ctx, w, h, state):  render one frame
     - controls:   [{key,label,type:'range'|'seg', ..., unit}]
     - readouts:   [{label, value(state) -> string}]
     - goal:       {label, hit(state) -> bool}          (optional)
     - buttons:    [{label, run(ctrl)}]                 (optional)
     - animate(state, dt) -> void                       (optional; if
                    present the sim runs a rAF loop instead of only
                    redrawing on control changes)
     - kind:       'dropSim' etc.                       (optional, paired
                    with `orient`; identifies this sim *type* so its
                    one-time orientation banner is only ever shown once,
                    the first time that type appears anywhere in the app)
     - orient:     {text}                                (optional; shown
                    as a dismissible banner above the stage the first
                    time `kind` is encountered, tracked in localStorage)
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

  /** Size a canvas for crisp rendering at the element's CSS size. */
  function fitCanvas(canvas, cssW, cssH) {
    var dpr = root.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.round(cssW * dpr));
    canvas.height = Math.max(1, Math.round(cssH * dpr));
    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  }

  /* ---------- one-time sim-orientation tracking ---------- */

  var SEEN_KEY = 'pa-sim-seen';

  function hasSeenKind(kind) {
    try {
      var raw = root.localStorage.getItem(SEEN_KEY);
      return !!raw && raw.split(',').indexOf(kind) !== -1;
    } catch (e) { return true; }   // storage blocked: don't nag every visit
  }

  function markSeenKind(kind) {
    try {
      var raw = root.localStorage.getItem(SEEN_KEY);
      var seen = raw ? raw.split(',') : [];
      if (seen.indexOf(kind) === -1) { seen.push(kind); root.localStorage.setItem(SEEN_KEY, seen.join(',')); }
    } catch (e) {}
  }

  /* ---------- shared drawing helpers ---------- */

  var draw = {
    clear: function (ctx, w, h) { ctx.clearRect(0, 0, w, h); },

    grid: function (ctx, w, h, step) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,.05)';
      ctx.lineWidth = 1;
      for (var x = 0; x <= w; x += step) { ctx.beginPath(); ctx.moveTo(x + .5, 0); ctx.lineTo(x + .5, h); ctx.stroke(); }
      for (var y = 0; y <= h; y += step) { ctx.beginPath(); ctx.moveTo(0, y + .5); ctx.lineTo(w, y + .5); ctx.stroke(); }
      ctx.restore();
    },

    ground: function (ctx, w, y) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,.22)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, y + .5); ctx.lineTo(w, y + .5); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,.08)';
      ctx.lineWidth = 1;
      for (var x = -20; x < w + 20; x += 14) {
        ctx.beginPath(); ctx.moveTo(x, y + 8); ctx.lineTo(x + 8, y); ctx.stroke();
      }
      ctx.restore();
    },

    circle: function (ctx, x, y, r, color) {
      ctx.save();
      ctx.shadowColor = color; ctx.shadowBlur = 16;
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    },

    dashedV: function (ctx, x, y0, y1, color) {
      ctx.save();
      ctx.strokeStyle = color; ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 5]);
      ctx.beginPath(); ctx.moveTo(x + .5, y0); ctx.lineTo(x + .5, y1); ctx.stroke();
      ctx.restore();
    },

    dashedH: function (ctx, y, x0, x1, color) {
      ctx.save();
      ctx.strokeStyle = color; ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 5]);
      ctx.beginPath(); ctx.moveTo(x0, y + .5); ctx.lineTo(x1, y + .5); ctx.stroke();
      ctx.restore();
    },

    arrow: function (ctx, x0, y0, x1, y1, color, head) {
      head = head || 9;
      ctx.save();
      ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      var ang = Math.atan2(y1 - y0, x1 - x0);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x1 - head * Math.cos(ang - Math.PI / 6), y1 - head * Math.sin(ang - Math.PI / 6));
      ctx.lineTo(x1 - head * Math.cos(ang + Math.PI / 6), y1 - head * Math.sin(ang + Math.PI / 6));
      ctx.closePath(); ctx.fill();
      ctx.restore();
    },

    label: function (ctx, x, y, text, color, align) {
      ctx.save();
      ctx.fillStyle = color || '#9aa9cc';
      ctx.font = '600 12px system-ui, sans-serif';
      ctx.textAlign = align || 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, x, y);
      ctx.restore();
    },

    /** Label an arrow from (x0,y0) to (x1,y1), offset perpendicular to its
     *  own direction (not a fixed screen direction) so it stays legible
     *  next to *that* arrow regardless of which way it points. */
    labelNear: function (ctx, x0, y0, x1, y1, text, color, dist) {
      dist = dist || 13;
      var dx = x1 - x0, dy = y1 - y0;
      var len = Math.hypot(dx, dy) || 1;
      var px = -dy / len, py = dx / len;
      this.label(ctx, x1 + px * dist, y1 + py * dist, text, color, 'center');
    }
  };

  /* ---------- the sim builder ---------- */

  /**
   * Build a .sim block into `host` from `spec`. Returns a controller
   * with .destroy() to stop any animation loop when the step unmounts.
   */
  function build(host, spec) {
    var state = spec.state || {};
    var root_ = el('div', 'sim');

    if (spec.orient && spec.kind && !hasSeenKind(spec.kind)) {
      var orientEl = el('div', 'sim-orient', '<span class="so-ico">🧭</span><span class="so-text">' + fmt.inline(spec.orient.text) + '</span>');
      var orientBtn = el('button', 'so-dismiss', '✕ Got it');
      orientBtn.type = 'button';
      orientBtn.addEventListener('click', function () {
        markSeenKind(spec.kind);
        orientEl.parentNode.removeChild(orientEl);
      });
      orientEl.appendChild(orientBtn);
      root_.appendChild(orientEl);
    }

    var stage = el('div', 'sim-stage');
    var canvas = document.createElement('canvas');
    stage.appendChild(canvas);
    root_.appendChild(stage);

    var goalEl = null;
    if (spec.goal) {
      goalEl = el('div', 'sim-goal', '<span class="g-ico">🎯</span><span class="g-text"></span>');
      root_.appendChild(goalEl);
    }

    var readoutsEl = null;
    if (spec.readouts && spec.readouts.length) {
      readoutsEl = el('div', 'sim-readouts');
      var rvals = [];
      for (var i = 0; i < spec.readouts.length; i++) {
        var r = spec.readouts[i];
        var box = el('div', 'readout');
        box.innerHTML = '<div class="r-label">' + r.label + '</div><div class="r-value"></div>';
        if (r.color) box.style.setProperty('--rcolor', r.color);
        readoutsEl.appendChild(box);
        rvals.push(box.querySelector('.r-value'));
      }
      root_.appendChild(readoutsEl);
    }

    var controlsEl = null, controlRefs = [];
    if ((spec.controls && spec.controls.length) || (spec.buttons && spec.buttons.length)) {
      controlsEl = el('div', 'sim-controls');

      for (var c = 0; c < (spec.controls || []).length; c++) {
        var ctrl = spec.controls[c];
        var row = el('div', 'ctrl');
        var labelHtml = '<span class="ctrl-label">' + ctrl.label + '</span>';
        row.innerHTML = labelHtml;

        if (ctrl.type === 'seg') {
          var seg = el('div', 'seg');
          (function (ctrl, seg) {
            ctrl.options.forEach(function (opt) {
              var b = el('button', opt.value === state[ctrl.key] ? 'on' : '', opt.label);
              b.type = 'button';
              b.addEventListener('click', function () {
                state[ctrl.key] = opt.value;
                var kids = seg.children;
                for (var k = 0; k < kids.length; k++) kids[k].classList.remove('on');
                b.classList.add('on');
                if (spec.onChange) spec.onChange(state);
                render();
              });
              seg.appendChild(b);
            });
          })(ctrl, seg);
          row.appendChild(seg);
        } else {
          var input = document.createElement('input');
          input.type = 'range';
          input.min = ctrl.min; input.max = ctrl.max; input.step = ctrl.step || 1;
          input.value = state[ctrl.key];
          var valEl = el('span', 'ctrl-val');
          (function (ctrl, input, valEl) {
            function refresh() {
              valEl.textContent = ctrl.format ? ctrl.format(state[ctrl.key]) : state[ctrl.key];
            }
            refresh();
            input.addEventListener('input', function () {
              state[ctrl.key] = parseFloat(input.value);
              refresh();
              if (spec.onChange) spec.onChange(state);
              render();
            });
            controlRefs.push({ ctrl: ctrl, input: input, refresh: refresh });
          })(ctrl, input, valEl);
          row.appendChild(input);
          row.appendChild(valEl);
        }
        controlsEl.appendChild(row);
      }

      if (spec.buttons && spec.buttons.length) {
        var btnRow = el('div', 'sim-buttons');
        spec.buttons.forEach(function (b) {
          var btn = el('button', 'simbtn', b.label);
          btn.type = 'button';
          btn.addEventListener('click', function () {
            b.run(state);
            for (var i = 0; i < controlRefs.length; i++) {
              controlRefs[i].input.value = state[controlRefs[i].ctrl.key];
              controlRefs[i].refresh();
            }
            render();
          });
          btnRow.appendChild(btn);
        });
        controlsEl.appendChild(btnRow);
      }

      root_.appendChild(controlsEl);
    }

    host.appendChild(root_);

    var ctx = null;
    function resize() {
      var w = stage.clientWidth, h = Math.round(w * (spec.aspect || 0.5));
      stage.style.height = h + 'px';
      ctx = fitCanvas(canvas, w, h);
      render();
    }

    function render() {
      if (!ctx) return;
      var w = canvas.clientWidth, h = canvas.clientHeight;
      draw.clear(ctx, w, h);
      spec.draw(ctx, w, h, state, draw);

      if (readoutsEl) {
        var vals = readoutsEl.querySelectorAll('.r-value');
        for (var i = 0; i < spec.readouts.length; i++) vals[i].textContent = spec.readouts[i].value(state);
      }
      if (goalEl) {
        var hit = spec.goal.hit(state);
        goalEl.classList.toggle('hit', hit);
        goalEl.querySelector('.g-ico').textContent = hit ? '✅' : '🎯';
        goalEl.querySelector('.g-text').textContent = spec.goal.label(state);
        if (spec.onGoal) spec.onGoal(hit, state);
      }
    }

    var raf = null, last = null;
    function tick(ts) {
      if (last == null) last = ts;
      var dt = Math.min(.05, (ts - last) / 1000);
      last = ts;
      spec.animate(state, dt);
      render();
      raf = root.requestAnimationFrame(tick);
    }
    if (spec.animate) raf = root.requestAnimationFrame(tick);

    var ro = null;
    if (root.ResizeObserver) {
      ro = new ResizeObserver(resize);
      ro.observe(stage);
    } else {
      root.addEventListener('resize', resize);
    }
    resize();

    return {
      state: state,
      render: render,
      destroy: function () {
        if (raf) root.cancelAnimationFrame(raf);
        if (ro) ro.disconnect(); else root.removeEventListener('resize', resize);
      }
    };
  }

  root.PA = root.PA || {};
  root.PA.simkit = { build: build, fitCanvas: fitCanvas, draw: draw };

})(typeof window !== 'undefined' ? window : globalThis);
