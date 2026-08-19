/* ============================================================
   fmt.js — tiny inline math + markup renderer
   No dependencies, no DOM. Turns lesson source strings into HTML.

     "**work** is $F \cdot d$"  ->  "<strong>work</strong> is <span class=mathv>…"

   Math subset supported (deliberately small — enough for intro physics):
     ^x  ^{...}   _x  _{...}
     \frac{a}{b}  \sqrt{x}  \vec{v}  \bar{x}  \hat{n}  \text{...}
     greek letters, \times \cdot \pm \approx \ne \le \ge \to \infty \degree
   ============================================================ */
(function (root) {
  'use strict';

  var SYMBOLS = {
    // greek
    alpha: 'α', beta: 'β', gamma: 'γ', Gamma: 'Γ', delta: 'δ', Delta: 'Δ',
    epsilon: 'ε', zeta: 'ζ', eta: 'η', theta: 'θ', Theta: 'Θ', kappa: 'κ',
    lambda: 'λ', Lambda: 'Λ', mu: 'μ', nu: 'ν', xi: 'ξ', pi: 'π', Pi: 'Π',
    rho: 'ρ', sigma: 'σ', Sigma: 'Σ', tau: 'τ', phi: 'φ', Phi: 'Φ',
    chi: 'χ', psi: 'ψ', omega: 'ω', Omega: 'Ω',
    // operators & relations
    times: '×', cdot: '·', div: '÷', pm: '±', mp: '∓',
    approx: '≈', ne: '≠', neq: '≠', le: '≤', leq: '≤', ge: '≥', geq: '≥',
    ll: '≪', gg: '≫', equiv: '≡', propto: '∝',
    // arrows & misc
    to: '→', rightarrow: '→', leftarrow: '←', Rightarrow: '⇒',
    infty: '∞', degree: '°', partial: '∂', nabla: '∇', sum: '∑', int: '∫',
    perp: '⊥', parallel: '∥', angle: '∠', ldots: '…', cdots: '⋯',
    langle: '⟨', rangle: '⟩', prime: '′'
  };

  // multi-letter names that should render upright, not italic
  var UPRIGHT = /^(sin|cos|tan|log|ln|exp|max|min|abs|avg|net|tot|total|const)/;

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ---------- math ---------- */

  /** Read a {...} group (balanced) or a single char, starting at i. */
  function group(src, i) {
    if (src[i] === '{') {
      var depth = 1, j = i + 1;
      while (j < src.length && depth > 0) {
        if (src[j] === '{') depth++;
        else if (src[j] === '}') depth--;
        if (depth > 0) j++;
      }
      return { body: src.slice(i + 1, j), next: j + 1 };
    }
    if (src[i] === '\\') {                    // e.g. x^\alpha
      var m = /^\\([A-Za-z]+)/.exec(src.slice(i));
      if (m) return { body: m[0], next: i + m[0].length };
    }
    return { body: src[i] === undefined ? '' : src[i], next: i + 1 };
  }

  function math(src) {
    var out = '', i = 0, n = src.length;

    while (i < n) {
      var c = src[i];

      // --- command ---
      if (c === '\\') {
        var m = /^\\([A-Za-z]+)/.exec(src.slice(i));
        if (!m) { out += esc(src[i + 1] || ''); i += 2; continue; }  // \$ \{ etc.
        var name = m[1];
        i += m[0].length;

        if (name === 'frac') {
          var a = group(src, i); i = a.next;
          var b = group(src, i); i = b.next;
          out += '<span class="frac"><span class="num">' + math(a.body) +
                 '</span><span class="den">' + math(b.body) + '</span></span>';
          continue;
        }
        if (name === 'sqrt') {
          var s = group(src, i); i = s.next;
          out += '<span class="sqrt">√<span class="rad">(' + math(s.body) + ')</span></span>';
          continue;
        }
        if (name === 'vec') {
          var v = group(src, i); i = v.next;
          out += '<span class="vecarrow">' + math(v.body) + '</span>';
          continue;
        }
        if (name === 'bar' || name === 'hat') {
          var h = group(src, i); i = h.next;
          out += math(h.body) + (name === 'bar' ? '̄' : '̂');
          continue;
        }
        if (name === 'text' || name === 'mathrm' || name === 'unit') {
          var t = group(src, i); i = t.next;
          out += '<span class="upright">' + esc(t.body) + '</span>';
          continue;
        }
        if (Object.prototype.hasOwnProperty.call(SYMBOLS, name)) {
          out += SYMBOLS[name];
          continue;
        }
        out += esc(name);                      // unknown command: show it plainly
        continue;
      }

      // --- super / subscript ---
      if (c === '^' || c === '_') {
        var g = group(src, i + 1); i = g.next;
        out += (c === '^' ? '<sup>' : '<sub>') + math(g.body) + (c === '^' ? '</sup>' : '</sub>');
        continue;
      }

      // --- identifiers ---
      if (/[A-Za-z]/.test(c)) {
        var word = /^[A-Za-z]+/.exec(src.slice(i))[0];
        if (UPRIGHT.test(word)) {
          out += '<span class="upright">' + esc(word) + '</span>';
          i += word.length;
        } else {
          out += '<i>' + esc(c) + '</i>';      // single italic variable letter
          i += 1;
        }
        continue;
      }

      // --- everything else verbatim ---
      out += esc(c);
      i++;
    }

    return out;
  }

  /** Render a math-only string as a standalone span. */
  function mathSpan(src) {
    return '<span class="mathv">' + math(src) + '</span>';
  }

  /* ---------- inline markup ---------- */

  /** Split on unescaped $ into alternating [text, math, text, math, …]. */
  function splitMath(src) {
    var parts = [], buf = '', inMath = false, i = 0;
    while (i < src.length) {
      var c = src[i];
      if (c === '\\' && src[i + 1] === '$') { buf += '$'; i += 2; continue; }
      if (c === '$') { parts.push(buf); buf = ''; inMath = !inMath; i++; continue; }
      buf += c; i++;
    }
    parts.push(buf);
    return parts;   // even indexes = text, odd = math
  }

  function markup(text) {
    return esc(text)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');
  }

  /** Inline string -> HTML (no block elements). */
  function inline(src) {
    if (src == null) return '';
    var parts = splitMath(String(src)), out = '';
    for (var i = 0; i < parts.length; i++) {
      out += (i % 2 === 1) ? mathSpan(parts[i]) : markup(parts[i]);
    }
    return out;
  }

  /** Multi-paragraph body text -> HTML with <p> wrappers. */
  function rich(src) {
    if (src == null) return '';
    var blocks = String(src).trim().split(/\n\s*\n/);
    var out = '';
    for (var i = 0; i < blocks.length; i++) {
      var b = blocks[i].trim();
      if (!b) continue;
      out += '<p>' + inline(b).replace(/\n/g, '<br>') + '</p>';
    }
    return out;
  }

  /* ---------- number formatting ---------- */

  /** Physics-friendly number display: trims noise, avoids "-0". */
  function num(v, decimals) {
    if (!isFinite(v)) return '—';
    var d = decimals == null ? 2 : decimals;
    var s = v.toFixed(d);
    if (parseFloat(s) === 0) s = (0).toFixed(d);        // kill "-0.00"
    if (d > 0) s = s.replace(/\.?0+$/, '');             // 3.50 -> 3.5, 4.00 -> 4
    return s === '' || s === '-' ? '0' : s;
  }

  root.PA = root.PA || {};
  root.PA.fmt = {
    esc: esc,
    math: math,
    mathSpan: mathSpan,
    inline: inline,
    rich: rich,
    num: num,
    _splitMath: splitMath
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = root.PA.fmt;

})(typeof window !== 'undefined' ? window : globalThis);
