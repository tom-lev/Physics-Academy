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

  var PROJ_WORLD_X = 145;
  var PROJ_WORLD_Y = 65;

  /** Dial in launch speed & angle to clear a wall and land in a target zone. */
  function projectileSim(args) {
    args = args || {};
    var wallX = args.wallX != null ? args.wallX : 40;
    var wallHeight = args.wallHeight != null ? args.wallHeight : 6;
    var targetXMin = args.targetXMin != null ? args.targetXMin : 70;
    var targetXMax = args.targetXMax != null ? args.targetXMax : 85;

    function result(s) { return kin.projectile(s.speed, s.angle); }
    function clearsWall(s) {
      if (wallX == null) return true;
      var h = kin.projectileHeightAtX(s.speed, s.angle, wallX);
      return h != null && h > wallHeight;
    }
    function inTarget(s) {
      var r = result(s).range;
      return r >= targetXMin && r <= targetXMax;
    }

    return {
      aspect: 0.55,
      state: { speed: args.speed || 20, angle: args.angle || 45 },

      controls: [
        { key: 'speed', label: 'Launch speed', type: 'range', min: 10, max: 35, step: 1, format: function (v) { return v + ' m/s'; } },
        { key: 'angle', label: 'Launch angle', type: 'range', min: 10, max: 80, step: 1, format: function (v) { return v + '°'; } }
      ],

      readouts: [
        { label: 'Time of flight', value: function (s) { return fmt.num(result(s).timeOfFlight, 2) + ' s'; } },
        { label: 'Max height', value: function (s) { return fmt.num(result(s).peak, 1) + ' m'; } },
        { label: 'Range', value: function (s) { return fmt.num(result(s).range, 1) + ' m'; }, color: 'var(--brand)' }
      ],

      goal: {
        label: function () { return 'Clear the ' + wallHeight + ' m wall, then land between ' + targetXMin + '–' + targetXMax + ' m'; },
        hit: function (s) { return clearsWall(s) && inTarget(s); }
      },

      draw: function (ctx, w, h, state, d) {
        var groundY = h - 26, topY = 16;
        var startX = 18;
        var scaleX = (w - startX - 12) / PROJ_WORLD_X;
        var scaleY = (groundY - topY) / PROJ_WORLD_Y;
        function toPx(x, y) { return { x: startX + x * scaleX, y: groundY - y * scaleY }; }

        d.grid(ctx, w, h, 28);
        d.ground(ctx, w, groundY);

        var hit = state && clearsWall(state) && inTarget(state);

        // target zone
        var tp0 = toPx(targetXMin, 0), tp1 = toPx(targetXMax, 0);
        ctx.save();
        ctx.fillStyle = hit ? 'rgba(52,211,153,.28)' : 'rgba(245,158,11,.22)';
        ctx.fillRect(tp0.x, groundY - 6, tp1.x - tp0.x, 6);
        ctx.restore();
        d.label(ctx, (tp0.x + tp1.x) / 2, groundY + 16, 'target', '#9aa9cc', 'center');

        // wall
        if (wallX != null) {
          var wp = toPx(wallX, 0);
          var wallClear = clearsWall(state);
          ctx.save();
          ctx.fillStyle = wallClear ? 'rgba(255,255,255,.35)' : '#fb7185';
          ctx.fillRect(wp.x - 2, groundY - wallHeight * scaleY, 4, wallHeight * scaleY);
          ctx.restore();
          d.label(ctx, wp.x, groundY - wallHeight * scaleY - 8, 'wall', '#9aa9cc', 'center');
        }

        // trajectory
        var res = result(state);
        var T = res.timeOfFlight;
        ctx.save();
        ctx.strokeStyle = hit ? '#34d399' : '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        var N = 40;
        for (var i = 0; i <= N; i++) {
          var t = (T * i) / N;
          var p = kin.projectilePosition(state.speed, state.angle, t);
          var px = toPx(p.x, Math.max(0, p.y));
          if (i === 0) ctx.moveTo(px.x, px.y); else ctx.lineTo(px.x, px.y);
        }
        ctx.stroke();
        ctx.restore();

        // landing marker
        var land = toPx(res.range, 0);
        d.dashedV(ctx, land.x, topY, groundY, 'rgba(255,255,255,.18)');
        d.label(ctx, land.x, topY - 6, fmt.num(res.range, 1) + ' m', '#c3cbe0', 'center');

        // launch velocity arrow
        var launch = toPx(0, 0);
        var ang = state.angle * Math.PI / 180;
        var arrowLen = 30;
        d.arrow(ctx, launch.x, launch.y, launch.x + Math.cos(ang) * arrowLen, launch.y - Math.sin(ang) * arrowLen, '#f59e0b', 8);
        ctx.save();
        ctx.font = '20px system-ui, sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
        ctx.fillText('🚀', launch.x, launch.y - 2);
        ctx.restore();
      }
    };
  }

  var INCLINE_ANGLE_MAX = 55;
  var INCLINE_TOL = 1.5;
  var INCLINE_SLIDE_MAX = 3;      // meters of slope the block can travel before it settles
  var INCLINE_KINETIC_RATIO = 0.8; // kinetic friction is typically a bit less than static

  /** Tune the incline angle and static friction so the block sits right on the verge of sliding. */
  function inclineSim(args) {
    args = args || {};

    function isSliding(state) { return kin.inclineSlides(state.angle, state.muS); }

    /** Friction force as a fraction of the block's weight (f / mg). */
    function frictionRatio(state) {
      var th = state.angle * Math.PI / 180;
      if (isSliding(state)) return state.muS * INCLINE_KINETIC_RATIO * Math.cos(th);
      return Math.min(Math.sin(th), state.muS * Math.cos(th));
    }

    return {
      aspect: 0.6,
      state: {
        angle: args.angle != null ? args.angle : 25,
        muS: args.muS != null ? args.muS : 0.35,
        pos: 0, vel: 0
      },

      controls: [
        { key: 'angle', label: 'Incline angle', type: 'range', min: 0, max: INCLINE_ANGLE_MAX, step: 1, format: function (v) { return v + '°'; } },
        { key: 'muS', label: 'Static friction μs', type: 'range', min: 0.05, max: 1.0, step: 0.05, format: function (v) { return fmt.num(v, 2); } }
      ],
      buttons: [
        { label: '↻ Reset block', run: function (state) { state.pos = 0; state.vel = 0; } }
      ],

      readouts: [
        { label: 'Critical angle', value: function (s) { return fmt.num(kin.angleOfRepose(s.muS), 1) + '°'; }, color: 'var(--violet)' },
        { label: 'Status', value: function (s) { return isSliding(s) ? 'Sliding ▼' : 'Holding'; } },
        { label: 'Down-slope accel', value: function (s) { return fmt.num(isSliding(s) ? kin.inclineAcceleration(s.angle, s.muS * INCLINE_KINETIC_RATIO) : 0, 2) + ' m/s²'; }, color: 'var(--brand)' }
      ],

      goal: {
        label: function (s) { return 'Balance on the edge: match the critical angle for μs = ' + fmt.num(s.muS, 2) + ' (~' + fmt.num(kin.angleOfRepose(s.muS), 1) + '°), within ' + INCLINE_TOL + '°'; },
        hit: function (s) { return Math.abs(s.angle - kin.angleOfRepose(s.muS)) <= INCLINE_TOL; }
      },

      animate: function (state, dt) {
        if (isSliding(state)) {
          var a = kin.inclineAcceleration(state.angle, state.muS * INCLINE_KINETIC_RATIO);
          state.vel += a * dt;
          state.pos += state.vel * dt;
          if (state.pos > INCLINE_SLIDE_MAX) { state.pos = INCLINE_SLIDE_MAX; state.vel = 0; }
        } else {
          state.vel = 0;
        }
      },

      draw: function (ctx, w, h, state, d) {
        var groundY = h - 26;
        var baseX = 26;
        var slopeLenPx = Math.min(w, h) * 0.62;
        var th = state.angle * Math.PI / 180;

        var top = { x: baseX, y: groundY - slopeLenPx * Math.sin(th) };
        var bottom = { x: baseX + slopeLenPx * Math.cos(th), y: groundY };
        var foot = { x: top.x, y: groundY };

        d.grid(ctx, w, h, 28);
        d.ground(ctx, w, groundY);

        ctx.save();
        ctx.fillStyle = 'rgba(255,255,255,.07)';
        ctx.strokeStyle = 'rgba(255,255,255,.28)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(foot.x, foot.y); ctx.lineTo(top.x, top.y); ctx.lineTo(bottom.x, bottom.y);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.restore();

        d.label(ctx, foot.x + 20, foot.y - 10, fmt.num(state.angle, 0) + '°', '#9aa9cc', 'left');

        var slopeDir = { x: Math.cos(th), y: Math.sin(th) };
        var normalDir = { x: Math.sin(th), y: -Math.cos(th) };

        var t = kin.clamp(state.pos / INCLINE_SLIDE_MAX, 0, 1);
        var onSlope = { x: kin.lerp(top.x, bottom.x, t), y: kin.lerp(top.y, bottom.y, t) };
        var blockHalf = 9;
        var center = { x: onSlope.x + normalDir.x * blockHalf, y: onSlope.y + normalDir.y * blockHalf };

        // Neutral block color, distinct from every force-vector color, so
        // the vectors never blend into the block they're drawn on top of.
        ctx.save();
        ctx.translate(center.x, center.y);
        ctx.rotate(th);
        ctx.fillStyle = '#c3cbe0';
        ctx.shadowColor = 'rgba(195,203,224,.6)'; ctx.shadowBlur = 10;
        ctx.fillRect(-blockHalf, -blockHalf, blockHalf * 2, blockHalf * 2);
        ctx.restore();

        var baseLen = 44;
        var wEnd = { x: center.x, y: center.y + baseLen };
        d.arrow(ctx, center.x, center.y, wEnd.x, wEnd.y, '#f59e0b', 8);
        d.label(ctx, wEnd.x + 6, wEnd.y, 'W', '#f59e0b', 'left');

        var nLen = baseLen * Math.cos(th);
        var nEnd = { x: center.x + normalDir.x * nLen, y: center.y + normalDir.y * nLen };
        d.arrow(ctx, center.x, center.y, nEnd.x, nEnd.y, '#38bdf8', 8);
        d.label(ctx, nEnd.x + 6, nEnd.y, 'N', '#38bdf8', 'left');

        var fRatio = frictionRatio(state);
        if (fRatio > 0.01) {
          // small friction forces still need to read clearly on-canvas, so
          // floor the drawn length well clear of the block's own footprint
          // (never drawn at all for genuine zero friction, e.g. flat ground).
          var fLen = Math.max(baseLen * fRatio, 30);
          var fColor = isSliding(state) ? '#fb7185' : '#34d399';
          var fEnd = { x: center.x - slopeDir.x * fLen, y: center.y - slopeDir.y * fLen };
          d.arrow(ctx, center.x, center.y, fEnd.x, fEnd.y, fColor, 8);
          d.label(ctx, fEnd.x - 6, fEnd.y - 10, 'f', fColor, 'right');
        }
      }
    };
  }

  root.PA = root.PA || {};
  root.PA.sims = {
    drop: dropSim,
    brake: brakeSim,
    vectorAdd: vectorAddSim,
    projectile: projectileSim,
    incline: inclineSim
  };

})(typeof window !== 'undefined' ? window : globalThis);
