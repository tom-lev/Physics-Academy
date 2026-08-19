/* ============================================================
   curriculum.js — course structure (tiers -> chapters -> lessons)
   Lesson content itself lives in js/lessons/*.js, which push their
   step arrays into the matching chapter after this file has run.
   ============================================================ */
(function (root) {
  'use strict';

  var PALETTE = ['#38bdf8', '#8b8cf9', '#34d399', '#f59e0b', '#f472b6', '#22d3ee', '#fb7185', '#a78bfa'];

  var TIERS = [
    {
      id: 't0',
      num: 'Toolkit',
      title: 'Before You Start',
      color: '#a3adc2',
      chapters: [
        { id: 'toolkit', icon: '🧰', title: 'Units, Measurement & Vectors',
          blurb: 'SI units, unit conversion, significant figures, reading graphs, and vectors — the toolkit every chapter after this one leans on.' }
      ]
    },
    {
      id: 't1',
      num: 'Tier 1',
      title: 'Mechanics',
      color: '#38bdf8',
      chapters: [
        { id: 'kinematics', icon: '🏃', title: 'Motion in a Line',
          blurb: 'Position, velocity and acceleration — and the graphs that tie them together.' },
        { id: 'projectile', icon: '🎯', title: '2D Motion & Projectiles',
          blurb: 'Splitting motion into independent horizontal and vertical stories.' },
        { id: 'forces', icon: '🧲', title: "Newton's Laws",
          blurb: "Why things speed up, slow down, or refuse to budge." },
        { id: 'energy', icon: '🔋', title: 'Work & Energy',
          blurb: 'The one quantity that never disappears — it just changes costume.' },
        { id: 'momentum', icon: '🎱', title: 'Momentum & Collisions',
          blurb: 'What billiard balls know that most people forget.' },
        { id: 'circular-gravity', icon: '🪐', title: 'Circular Motion & Gravity',
          blurb: 'Why orbits don’t fall, and what keeps a curve a curve.' },
        { id: 'rotational', icon: '🌀', title: 'Rotational Motion',
          blurb: 'Torque, spin, and the rotational twin of every law you just learned.' },
        { id: 'fluids', icon: '💧', title: 'Fluid Mechanics',
          blurb: 'Pressure, buoyancy, and why airplanes and ships both make sense.' }
      ]
    },
    {
      id: 't2',
      num: 'Tier 2',
      title: 'Oscillations & Waves',
      color: '#8b8cf9',
      chapters: [
        { id: 'shm', icon: '〰️', title: 'Simple Harmonic Motion',
          blurb: 'Springs, pendulums, and the rhythm underneath both.' },
        { id: 'waves', icon: '🌊', title: 'Mechanical Waves',
          blurb: 'How a disturbance travels without the medium going anywhere.' },
        { id: 'sound', icon: '🔊', title: 'Sound',
          blurb: 'Resonance, pitch, and why an ambulance changes tone as it passes.' }
      ]
    },
    {
      id: 't3',
      num: 'Tier 3',
      title: 'Thermodynamics',
      color: '#f59e0b',
      chapters: [
        { id: 'heat', icon: '🌡️', title: 'Heat & Temperature',
          blurb: 'What temperature actually measures, and how heat moves.' },
        { id: 'kinetic-gas', icon: '💨', title: 'Kinetic Theory of Gases',
          blurb: 'Pressure and temperature, rebuilt from molecules bouncing around.' },
        { id: 'thermo-laws', icon: '🔥', title: 'Laws of Thermodynamics',
          blurb: 'Energy bookkeeping for the universe, and why some things never run backward.' }
      ]
    },
    {
      id: 't4',
      num: 'Tier 4',
      title: 'Electricity & Magnetism',
      color: '#f472b6',
      chapters: [
        { id: 'electrostatics', icon: '✨', title: 'Electrostatics',
          blurb: 'Charge, Coulomb’s law, and the fields charges set up around themselves.' },
        { id: 'circuits', icon: '🔌', title: 'Electric Circuits',
          blurb: 'Ohm’s law, resistors, and how current actually decides where to go.' },
        { id: 'magnetism', icon: '🧭', title: 'Magnetism',
          blurb: 'Moving charge meets magnetic field — and things curve.' },
        { id: 'induction', icon: '🔃', title: 'Electromagnetic Induction',
          blurb: 'How a changing magnetic field pushes electrons around — the whole electric grid, basically.' },
        { id: 'em-waves', icon: '📡', title: 'Electromagnetic Waves',
          blurb: 'The moment electricity, magnetism, and light turned out to be one thing.' }
      ]
    },
    {
      id: 't5',
      num: 'Tier 5',
      title: 'Optics',
      color: '#22d3ee',
      chapters: [
        { id: 'reflection-refraction', icon: '🔍', title: 'Reflection & Refraction',
          blurb: 'Why light bends at a boundary, and why mirrors flip.' },
        { id: 'lenses-mirrors', icon: '👓', title: 'Lenses & Mirrors',
          blurb: 'How glass and curved surfaces build images out of light.' },
        { id: 'wave-optics', icon: '🌈', title: 'Wave Optics',
          blurb: 'Interference and diffraction — the experiments that proved light is a wave.' }
      ]
    },
    {
      id: 't6',
      num: 'Tier 6',
      title: 'Modern Physics',
      color: '#c084fc',
      chapters: [
        { id: 'relativity', icon: '🚀', title: 'Special Relativity',
          blurb: 'What happens to space and time when nothing can outrun light.' },
        { id: 'quantum', icon: '⚛️', title: 'Intro to Quantum',
          blurb: 'Where light starts acting like particles, and particles start acting like waves.' },
        { id: 'nuclear', icon: '☢️', title: 'Atomic & Nuclear Physics',
          blurb: 'Inside the atom: energy levels, radioactivity, and what holds a nucleus together.' }
      ]
    }
  ];

  // give every chapter a color and a running "Chapter N" kicker (toolkit excluded)
  (function stamp() {
    var n = 0;
    for (var i = 0; i < TIERS.length; i++) {
      var isToolkit = TIERS[i].id === 't0';
      var chs = TIERS[i].chapters;
      for (var j = 0; j < chs.length; j++) {
        if (isToolkit) {
          chs[j].kicker = 'Foundations';
          chs[j].color = TIERS[i].color;
        } else {
          n++;
          chs[j].kicker = 'Chapter ' + n;
          chs[j].color = PALETTE[(n - 1) % PALETTE.length];
        }
        chs[j].lessons = [];
      }
    }
  })();

  function allChapters() {
    var out = [];
    for (var i = 0; i < TIERS.length; i++) {
      var chs = TIERS[i].chapters;
      for (var j = 0; j < chs.length; j++) out.push(chs[j]);
    }
    return out;
  }

  function findChapter(id) {
    var chs = allChapters();
    for (var i = 0; i < chs.length; i++) if (chs[i].id === id) return chs[i];
    return null;
  }

  function findLesson(chapterId, lessonId) {
    var ch = findChapter(chapterId);
    if (!ch) return null;
    for (var i = 0; i < ch.lessons.length; i++) if (ch.lessons[i].id === lessonId) return ch.lessons[i];
    return null;
  }

  /** Chapter that contains lessonId, else null. */
  function chapterOfLesson(lessonId) {
    var chs = allChapters();
    for (var i = 0; i < chs.length; i++) {
      for (var j = 0; j < chs[i].lessons.length; j++) {
        if (chs[i].lessons[j].id === lessonId) return chs[i];
      }
    }
    return null;
  }

  /** Chapter is "live" once it has at least one lesson with steps. */
  function isLive(chapter) {
    for (var i = 0; i < chapter.lessons.length; i++) {
      if (chapter.lessons[i].steps) return true;
    }
    return false;
  }

  root.PA = root.PA || {};
  root.PA.curriculum = {
    tiers: TIERS,
    allChapters: allChapters,
    findChapter: findChapter,
    findLesson: findLesson,
    chapterOfLesson: chapterOfLesson,
    isLive: isLive
  };

})(typeof window !== 'undefined' ? window : globalThis);
