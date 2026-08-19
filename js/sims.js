/* ============================================================
   sims.js — concrete interactive simulations, built on simkit.js
   and graded against the same physics.js functions the lesson
   answer keys use. Each factory takes `args` from the lesson step
   and returns a spec consumable by PA.simkit.build().
   ============================================================ */
(function (root) {
  'use strict';

  var kin = root.PA.kin;
  var fmt = root.PA.fmt;

  var PLANETS = [
    { value: 'earth', label: 'Earth' },
    { value: 'moon', label: 'Moon' },
    { value: 'mars', label: 'Mars' },
    { value: 'jupiter', label: 'Jupiter' }
  ];

  var MAX_DROP_HEIGHT = 50;

  /** Drop a ball from height h on a chosen world; watch fall time & impact speed. */
  function dropSim(args) {
    args = args || {};
    var targetTime = args.targetTime;

    return {
      aspect: 0.62,
      state: { planet: 'earth', height: args.height || 20, t: 0, falling: false },

      controls: [
        { key: 'planet', label: 'World', type: 'seg', options: PLANETS },
        { key: 'height', label: 'Height', type: 'range', min: 2, max: MAX_DROP_HEIGHT, step: 1, format: function (v) { return v + ' m'; } }
      ],
      buttons: [
        { label: '⬇ Drop it', run: function (state) { state.t = 0; state.falling = true; } }
      ],

      readouts: [
        { label: 'Gravity', value: function (s) { return fmt.num(kin.gravity[s.planet], 2) + ' m/s²'; } },
        { label: 'Fall time', value: function (s) { return fmt.num(kin.fallTime(s.height, kin.gravity[s.planet]), 2) + ' s'; } },
        { label: 'Impact speed', value: function (s) { return fmt.num(kin.fallSpeed(s.height, kin.gravity[s.planet]), 1) + ' m/s'; }, color: 'var(--brand)' }
      ],

      goal: targetTime ? {
        label: function () { return 'Land in under ' + targetTime + ' s'; },
        hit: function (s) { return kin.fallTime(s.height, kin.gravity[s.planet]) <= targetTime; }
      } : null,

      animate: function (state, dt) {
        if (!state.falling) return;
        state.t += dt;
        var g = kin.gravity[state.planet];
        var T = kin.fallTime(state.height, g);
        if (state.t >= T) { state.t = T; state.falling = false; }
      },

      draw: function (ctx, w, h, state, d) {
        var g = kin.gravity[state.planet];
        var groundY = h - 28;
        var topY = 26;
        var scale = (groundY - topY) / MAX_DROP_HEIGHT;

        d.grid(ctx, w, h, 28);
        d.ground(ctx, w, groundY);

        var y = kin.position(state.height, 0, -g, state.t);
        if (y < 0) y = 0;
        var ballY = groundY - y * scale;
        var ballX = w / 2;

        d.dashedV(ctx, ballX, topY, groundY, 'rgba(255,255,255,.18)');
        d.circle(ctx, ballX, ballY, 11, '#38bdf8');
        d.label(ctx, ballX + 20, ballY, fmt.num(y, 1) + ' m', '#9aa9cc', 'left');
        d.label(ctx, w - 12, topY, state.height + ' m', '#64739a', 'right');
      }
    };
  }

  /** Brake before a wall: reaction distance + braking distance vs. how far away it is. */
  function brakeSim(args) {
    args = args || {};
    var wallDistance = args.wallDistance || 45;
    var maxRange = wallDistance * 1.35;

    return {
      aspect: 0.34,
      state: { speed: args.speed || 20, decel: args.decel || 6, reaction: args.reaction != null ? args.reaction : 0.4 },

      controls: [
        { key: 'speed', label: 'Speed', type: 'range', min: 5, max: 35, step: 1, format: function (v) { return v + ' m/s'; } },
        { key: 'decel', label: 'Braking', type: 'range', min: 2, max: 9, step: 0.5, format: function (v) { return v + ' m/s²'; } },
        { key: 'reaction', label: 'Reaction time', type: 'range', min: 0, max: 1.5, step: 0.1, format: function (v) { return fmt.num(v, 1) + ' s'; } }
      ],

      readouts: [
        { label: 'Reaction dist.', value: function (s) { return fmt.num(s.speed * s.reaction, 1) + ' m'; } },
        { label: 'Braking dist.', value: function (s) { return fmt.num(kin.stoppingDistance(s.speed, s.decel), 1) + ' m'; } },
        { label: 'Total', value: function (s) { return fmt.num(kin.totalStoppingDistance(s.speed, s.decel, s.reaction), 1) + ' m'; }, color: 'var(--brand)' }
      ],

      goal: {
        label: function () { return 'Stop before the wall, ' + wallDistance + ' m away'; },
        hit: function (s) { return kin.totalStoppingDistance(s.speed, s.decel, s.reaction) <= wallDistance; }
      },

      draw: function (ctx, w, h, state, d) {
        var roadY = h - 30;
        var scale = (w - 40) / maxRange;
        var startX = 20;

        d.grid(ctx, w, h, 28);
        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,.16)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, roadY + .5); ctx.lineTo(w, roadY + .5); ctx.stroke();
        ctx.restore();

        var reactD = state.speed * state.reaction;
        var totalD = kin.totalStoppingDistance(state.speed, state.decel, state.reaction);
        var wallX = startX + wallDistance * scale;
        var stopX = startX + totalD * scale;
        var crashed = totalD > wallDistance;

        // wall
        ctx.save();
        ctx.fillStyle = crashed ? '#fb7185' : '#9aa9cc';
        ctx.fillRect(wallX, roadY - 34, 6, 34);
        ctx.restore();
        d.label(ctx, wallX, roadY - 42, 'wall', '#9aa9cc', 'center');

        // reaction segment marker
        var reactX = startX + reactD * scale;
        d.dashedV(ctx, reactX, roadY - 22, roadY, 'rgba(251,191,36,.5)');

        // car (or crash) at stopping point
        var carX = Math.min(stopX, crashed ? wallX + 14 : stopX);
        ctx.save();
        ctx.font = '26px system-ui, sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
        ctx.fillText(crashed ? '💥' : '🚗', carX, roadY - 6);
        ctx.restore();

        d.label(ctx, startX, roadY + 16, 'start', '#64739a', 'left');
      }
    };
  }

  function angDiff(a, b) {
    var d = (a - b) % 360;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    return Math.abs(d);
  }

  /** Tune two vectors (tip-to-tail) so their sum matches a dashed target vector. */
  function vectorAddSim(args) {
    args = args || {};
    var targetMag = args.targetMag != null ? args.targetMag : 12;
    var targetAngle = args.targetAngle != null ? args.targetAngle : 40;
    var tolMag = args.tolMag != null ? args.tolMag : 0.5;
    var tolAngle = args.tolAngle != null ? args.tolAngle : 6;
    var worldMax = 34;

    function sum(state) {
      var ar = state.aAng * Math.PI / 180, br = state.bAng * Math.PI / 180;
      var x = state.aMag * Math.cos(ar) + state.bMag * Math.cos(br);
      var y = state.aMag * Math.sin(ar) + state.bMag * Math.sin(br);
      return { x: x, y: y, mag: Math.hypot(x, y), ang: Math.atan2(y, x) * 180 / Math.PI };
    }

    return {
      aspect: 0.62,
      state: { aMag: 6, aAng: 0, bMag: 6, bAng: 90 },

      controls: [
        { key: 'aMag', label: 'Vector A — length', type: 'range', min: 0, max: 15, step: 0.5, format: function (v) { return fmt.num(v, 1); } },
        { key: 'aAng', label: 'Vector A — angle', type: 'range', min: -180, max: 180, step: 5, format: function (v) { return v + '°'; } },
        { key: 'bMag', label: 'Vector B — length', type: 'range', min: 0, max: 15, step: 0.5, format: function (v) { return fmt.num(v, 1); } },
        { key: 'bAng', label: 'Vector B — angle', type: 'range', min: -180, max: 180, step: 5, format: function (v) { return v + '°'; } }
      ],

      readouts: [
        { label: 'Resultant length', value: function (s) { return fmt.num(sum(s).mag, 1); }, color: 'var(--violet)' },
        { label: 'Resultant angle', value: function (s) { return fmt.num(sum(s).ang, 0) + '°'; }, color: 'var(--violet)' }
      ],

      goal: {
        label: function () { return 'Match the dashed target: ' + targetMag + ' @ ' + targetAngle + '°'; },
        hit: function (s) {
          var r = sum(s);
          return Math.abs(r.mag - targetMag) <= tolMag && angDiff(r.ang, targetAngle) <= tolAngle;
        }
      },

      draw: function (ctx, w, h, state, d) {
        var cx = w / 2, cy = h / 2;
        var scale = (Math.min(w, h) / 2 - 26) / worldMax;

        d.grid(ctx, w, h, 26);
        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, cy + .5); ctx.lineTo(w, cy + .5); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + .5, 0); ctx.lineTo(cx + .5, h); ctx.stroke();
        ctx.restore();

        function pt(mag, angDeg) {
          var r = angDeg * Math.PI / 180;
          return { x: cx + mag * scale * Math.cos(r), y: cy - mag * scale * Math.sin(r) };
        }

        var tgt = pt(targetMag, targetAngle);
        ctx.save();
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(tgt.x, tgt.y); ctx.stroke();
        ctx.restore();
        d.label(ctx, tgt.x + 8, tgt.y - 8, 'target', '#c3cbe0', 'left');

        var aTip = pt(state.aMag, state.aAng);
        var r = sum(state);
        var sTip = { x: cx + r.x * scale, y: cy - r.y * scale };

        d.arrow(ctx, cx, cy, sTip.x, sTip.y, 'rgba(139,140,249,.55)', 11);
        d.arrow(ctx, cx, cy, aTip.x, aTip.y, '#38bdf8', 9);
        d.arrow(ctx, aTip.x, aTip.y, sTip.x, sTip.y, '#f59e0b', 9);

        d.label(ctx, aTip.x, aTip.y - 12, 'A', '#38bdf8', 'center');
        d.label(ctx, (aTip.x + sTip.x) / 2, (aTip.y + sTip.y) / 2 - 12, 'B', '#f59e0b', 'center');
      }
    };
  }

  root.PA = root.PA || {};
  root.PA.sims = {
    drop: dropSim,
    brake: brakeSim,
    vectorAdd: vectorAddSim
  };

})(typeof window !== 'undefined' ? window : globalThis);
