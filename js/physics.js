/* ============================================================
   physics.js — the actual physics.
   Pure functions, SI units, no DOM. Every simulation and every
   generated exercise answer routes through here, so the sims and
   the answer keys can never drift apart.
   ============================================================ */
(function (root) {
  'use strict';

  var G_EARTH = 9.81;   // m/s^2

  var Kin = {

    G_EARTH: G_EARTH,

    /** Gravity on assorted worlds, m/s^2. */
    gravity: {
      earth: 9.81,
      moon: 1.62,
      mars: 3.72,
      jupiter: 24.79,
      space: 0
    },

    /** v = v0 + a t */
    velocity: function (v0, a, t) { return v0 + a * t; },

    /** x = x0 + v0 t + ½ a t² */
    position: function (x0, v0, a, t) { return x0 + v0 * t + 0.5 * a * t * t; },

    /** Δx = v0 t + ½ a t² */
    displacement: function (v0, a, t) { return v0 * t + 0.5 * a * t * t; },

    /** v² = v0² + 2 a Δx  →  |v| */
    velocityFromDisplacement: function (v0, a, dx) {
      var v2 = v0 * v0 + 2 * a * dx;
      return v2 <= 0 ? 0 : Math.sqrt(v2);
    },

    /** Δx from v0, v, a  (the timeless one, rearranged) */
    displacementFromVelocities: function (v0, v, a) {
      if (a === 0) return NaN;
      return (v * v - v0 * v0) / (2 * a);
    },

    /** Average velocity over an interval of constant acceleration. */
    averageVelocity: function (v0, v) { return (v0 + v) / 2; },

    /**
     * Total path length travelled (distance, not displacement) between
     * t=0 and t, accounting for a turnaround when the sign of v flips.
     */
    distanceTravelled: function (v0, a, t) {
      if (a === 0) return Math.abs(v0 * t);
      var tTurn = -v0 / a;                       // when v hits zero
      if (tTurn > 0 && tTurn < t) {
        var leg1 = Math.abs(Kin.displacement(v0, a, tTurn));
        var leg2 = Math.abs(Kin.displacement(0, a, t - tTurn));
        return leg1 + leg2;
      }
      return Math.abs(Kin.displacement(v0, a, t));
    },

    /** Time to reach a given velocity. Infinity if unreachable. */
    timeToVelocity: function (v0, a, v) {
      if (a === 0) return v === v0 ? 0 : Infinity;
      var t = (v - v0) / a;
      return t < 0 ? Infinity : t;
    },

    /**
     * Smallest non-negative root of x0 + v0 t + ½a t² = target.
     * Returns null when the target is never reached.
     */
    timeToPosition: function (x0, v0, a, target) {
      var c = x0 - target;
      if (a === 0) {
        if (v0 === 0) return c === 0 ? 0 : null;
        var t0 = -c / v0;
        return t0 >= 0 ? t0 : null;
      }
      var disc = v0 * v0 - 2 * a * c;
      if (disc < 0) return null;
      var r = Math.sqrt(disc);
      var t1 = (-v0 + r) / a, t2 = (-v0 - r) / a;
      var lo = Math.min(t1, t2), hi = Math.max(t1, t2);
      if (lo >= -1e-12) return Math.max(lo, 0);
      if (hi >= -1e-12) return Math.max(hi, 0);
      return null;
    },

    /* ---------- free fall ---------- */

    /** Time for an object dropped from rest to fall a height h. */
    fallTime: function (h, g) {
      g = g == null ? G_EARTH : g;
      if (g <= 0 || h <= 0) return h <= 0 ? 0 : Infinity;
      return Math.sqrt(2 * h / g);
    },

    /** Impact speed after falling h from rest. */
    fallSpeed: function (h, g) {
      g = g == null ? G_EARTH : g;
      return Math.sqrt(Math.max(0, 2 * g * h));
    },

    /** Peak height of something thrown straight up at v0. */
    peakHeight: function (v0, g) {
      g = g == null ? G_EARTH : g;
      if (g <= 0) return Infinity;
      return (v0 * v0) / (2 * g);
    },

    /** Time up to the peak. */
    timeToPeak: function (v0, g) {
      g = g == null ? G_EARTH : g;
      if (g <= 0) return Infinity;
      return v0 / g;
    },

    /* ---------- braking ---------- */

    /** Distance to stop from v0 under deceleration magnitude |a|. */
    stoppingDistance: function (v0, aMag) {
      if (aMag <= 0) return Infinity;
      return (v0 * v0) / (2 * aMag);
    },

    /** Reaction distance + braking distance. */
    totalStoppingDistance: function (v0, aMag, reactionTime) {
      return v0 * (reactionTime || 0) + Kin.stoppingDistance(v0, aMag);
    },

    /* ---------- projectiles (Ch.2) ---------- */

    projectile: function (v0, angleDeg, g) {
      g = g == null ? G_EARTH : g;
      var th = angleDeg * Math.PI / 180;
      var vx = v0 * Math.cos(th), vy = v0 * Math.sin(th);
      var tFlight = g > 0 ? 2 * vy / g : Infinity;
      return {
        vx: vx,
        vy: vy,
        timeOfFlight: tFlight,
        range: g > 0 ? vx * tFlight : Infinity,
        peak: g > 0 ? (vy * vy) / (2 * g) : Infinity
      };
    },

    /** Position {x,y} of a projectile at time t, relative to the launch point. */
    projectilePosition: function (v0, angleDeg, t, g) {
      g = g == null ? G_EARTH : g;
      var th = angleDeg * Math.PI / 180;
      var vx = v0 * Math.cos(th), vy = v0 * Math.sin(th);
      return { x: vx * t, y: vy * t - 0.5 * g * t * t };
    },

    /** Height of the trajectory at horizontal distance x from launch. Null once x is past the landing range. */
    projectileHeightAtX: function (v0, angleDeg, x, g) {
      g = g == null ? G_EARTH : g;
      var th = angleDeg * Math.PI / 180;
      var vx = v0 * Math.cos(th);
      if (vx <= 0) return x === 0 ? 0 : null;
      var range = Kin.projectile(v0, angleDeg, g).range;
      if (x > range) return null;
      return Kin.projectilePosition(v0, angleDeg, x / vx, g).y;
    },

    /* ---------- numeric helpers ---------- */

    /** Area under a piecewise-linear v-t graph = displacement. */
    areaUnderPolyline: function (points) {
      var area = 0;
      for (var i = 1; i < points.length; i++) {
        var p = points[i - 1], q = points[i];
        area += (q.x - p.x) * (p.y + q.y) / 2;      // trapezoid, signed
      }
      return area;
    },

    /** Slope between two points; null when vertical. */
    slope: function (p, q) {
      var dx = q.x - p.x;
      return dx === 0 ? null : (q.y - p.y) / dx;
    },

    clamp: function (v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; },

    lerp: function (a, b, t) { return a + (b - a) * t; },

    /** Tolerant compare for graded numeric answers. */
    near: function (a, b, tol) {
      tol = tol == null ? 0.01 : tol;
      return Math.abs(a - b) <= tol;
    }
  };

  root.PA = root.PA || {};
  root.PA.kin = Kin;

  if (typeof module !== 'undefined' && module.exports) module.exports = Kin;

})(typeof window !== 'undefined' ? window : globalThis);
