/* ============================================================
   lessons/toolkit.js — Foundations: Units, Measurement & Vectors
   The prerequisite chapter every other chapter leans on: SI units,
   conversions, precision, reading graphs, and vectors.
   ============================================================ */
(function (root) {
  'use strict';

  var chapter = root.PA.curriculum.findChapter('toolkit');
  if (!chapter) return;

  chapter.lessons.push(

    /* ============================================================ */
    {
      id: 'tk-units',
      title: 'SI Units & Scientific Notation',
      sub: '6 steps · the language of measurement',
      steps: [
        {
          kind: 'lesson',
          title: 'Physics runs on measurements',
          prereq: 'This chapter assumes basic arithmetic — multiplying, dividing, and recognizing powers of ten ($10^3 = 1000$, and so on). That\'s genuinely all you need to start.',
          hook: 'A phone spec sheet lists "128 GB storage" and a race car\'s top speed as "89 m/s." Neither number means anything without the label stuck to it — and physics is built entirely out of numbers with labels stuck to them.',
          body: 'Every physics claim eventually reduces to a number with a unit attached — "9.81 m/s²" means nothing without both parts. The world standardizes on the **SI system**: meters for length, kilograms for mass, seconds for time, and a handful of others that everything else is built from.',
          callout: { variant: 'info', text: 'Derived units are just combinations of these: a Newton (force) is $\\text{kg}\\cdot\\text{m/s}^2$. A Joule (energy) is $\\text{N}\\cdot\\text{m}$.' }
        },
        {
          kind: 'mcq',
          prompt: 'Which SI base unit measures mass?',
          options: ['Newton', 'Kilogram', 'Joule', 'Pascal'],
          correct: 1,
          explain: 'The kilogram (kg) is one of the seven SI base units. Newton, Joule, and Pascal are all *derived* units, built out of kg, m, and s.',
          wrongExplain: { 0: 'The Newton measures *force* (weight), not mass — an easy mix-up since weight and mass are so closely linked in everyday speech.' }
        },
        {
          kind: 'lesson',
          title: 'Prefixes: shorthand for powers of ten',
          body: 'Rather than writing 0.000000045 m, physicists use prefixes that multiply a unit by a power of ten. Learn these once and you\'ll use them in every chapter from here on.',
          formula: { name: 'Common SI prefixes', tex: '\\text{n} = 10^{-9} \\quad \\mu = 10^{-6} \\quad \\text{m} = 10^{-3} \\quad \\text{k} = 10^{3} \\quad \\text{M} = 10^{6} \\quad \\text{G} = 10^{9}' }
        },
        {
          kind: 'numeric',
          prompt: 'A capacitor is rated at 4700 µF (microfarads). Since $\\mu = 10^{-6}$, what is that value in farads (F)?',
          unit: 'F',
          correct: 0.0047,
          tol: 0.0001,
          decimals: 4,
          explain: '4700 × 10⁻⁶ F = 0.0047 F. Converting between prefixes is always just multiplying by the right power of ten.',
          hint: 'Multiply 4700 by 10⁻⁶.'
        },
        {
          kind: 'mcq',
          prompt: 'A signal has a frequency of 2.4 GHz. Which prefix does "G" represent?',
          options: ['10³ (thousand)', '10⁶ (million)', '10⁹ (billion)', '10¹² (trillion)'],
          correct: 2,
          explain: 'Giga (G) = 10⁹. So 2.4 GHz means 2,400,000,000 cycles per second.',
          wrongExplain: { 1: 'Mega (M) is 10⁶ — a thousand times smaller than giga. Easy to mix up since both describe "big" numbers.' }
        },
        {
          kind: 'order',
          prompt: 'Rank these prefixes from smallest to largest multiplier.',
          items: ['nano (n)', 'milli (m)', 'kilo (k)', 'mega (M)'],
          explain: 'nano = 10⁻⁹, milli = 10⁻³, kilo = 10³, mega = 10⁶ — each is a thousand times the one before it, in order.'
        }
      ]
    },

    /* ============================================================ */
    {
      id: 'tk-conversion',
      title: 'Unit Conversion & Dimensional Analysis',
      sub: '5 steps · never mix your units again',
      steps: [
        {
          kind: 'lesson',
          title: 'Multiply by a clever form of 1',
          hook: 'A recipe calls for "2 cups" of flour and your kitchen scale only reads grams. You\'ve done this kind of conversion a hundred times without thinking about it — this lesson just makes the method behind it explicit and bulletproof.',
          body: 'To convert units, multiply by a fraction that equals 1 — like $\\frac{1000\\text{ m}}{1\\text{ km}}$ — chosen so the unit you don\'t want cancels out and the unit you do want remains.',
          callout: { variant: 'key', text: 'Write the units out and cancel them like algebra. If they don\'t cancel to what you expect, you used the wrong conversion factor.' }
        },
        {
          kind: 'numeric',
          prompt: 'A car travels at 90 km/h. Convert this to m/s. (1 km = 1000 m, 1 h = 3600 s)',
          unit: 'm/s',
          correct: 25,
          tol: 0.2,
          explain: '90 km/h × (1000 m / 1 km) × (1 h / 3600 s) = 90000/3600 = 25 m/s.',
          hint: 'Multiply by 1000 to get meters, then divide by 3600 to get seconds.'
        },
        {
          kind: 'numeric',
          prompt: 'Convert 2.5 hours into seconds.',
          unit: 's',
          correct: 9000,
          tol: 10,
          explain: '2.5 h × 3600 s/h = 9000 s.'
        },
        {
          kind: 'lesson',
          title: 'Dimensional analysis: a built-in error checker',
          body: 'Every physical equation must balance dimensionally — the units on the left must match the units on the right. This won\'t tell you if an equation is *physically* correct, but it will instantly catch typos and misremembered formulas.',
          callout: { variant: 'info', text: 'Example: in $x = v t$, the units check out as $\\text{m} = (\\text{m/s})(\\text{s})$ — the seconds cancel, leaving meters on both sides. ✓' }
        },
        {
          kind: 'mcq',
          prompt: 'Velocity has units of m/s and time has units of s. Which combination has units of a **distance** (meters)?',
          options: ['velocity ÷ time', 'velocity × time', 'velocity × time²', 'velocity² × time'],
          correct: 1,
          explain: '(m/s) × (s) = m — the seconds cancel, leaving meters. None of the other combinations reduce to plain meters.',
          wrongExplain: { 0: '(m/s) ÷ s = m/s² — that\'s an *acceleration* unit, not a distance. Dividing by time here echoes the acceleration formula, but it\'s the wrong operation for this question.' },
          hint: 'Write out the units for each option and cancel algebraically.'
        }
      ]
    },

    /* ============================================================ */
    {
      id: 'tk-measurement',
      title: 'Precision & Significant Figures',
      sub: '5 steps · every measurement has a limit',
      steps: [
        {
          kind: 'lesson',
          title: 'Accuracy and precision are not the same thing',
          hook: 'A weather app reports "73°F" three mornings in a row, rock steady — but the actual temperature outside was 70°F each time. The app isn\'t "wrong" in a single, simple sense: it\'s wrong in a very specific, useful-to-name way.',
          body: '**Accuracy** is how close a measurement is to the true value. **Precision** is how consistent repeated measurements are with each other — regardless of whether they\'re right.',
          callout: { variant: 'key', text: 'A scale that reads 61.2 kg every time you step on it is *precise*. If you actually weigh 58 kg, it\'s precise but not *accurate*.' }
        },
        {
          kind: 'mcq',
          prompt: 'Four dart throws all land tightly clustered — but in the bottom-left corner of the board, far from the bullseye. This result is:',
          options: ['Accurate but not precise', 'Precise but not accurate', 'Both accurate and precise', 'Neither accurate nor precise'],
          correct: 1,
          explain: 'Tightly clustered means precise (consistent). Far from the bullseye means not accurate (not close to the true target).',
          wrongExplain: { 0: 'That\'s backwards: a tight cluster is what makes a result *precise* (consistent), not accurate. Accuracy is about closeness to the true target, which this throw misses.' }
        },
        {
          kind: 'lesson',
          title: 'Significant figures: honesty about your uncertainty',
          body: 'The digits in a measurement that are actually known reliably are its **significant figures**. Reporting more digits than your instrument can justify overstates your precision.',
          callout: { variant: 'info', text: 'Quick rules: all non-zero digits count. Zeros between non-zero digits count. Leading zeros (0.0042) don\'t count. Trailing zeros after a decimal point (4.20) do count.' }
        },
        {
          kind: 'mcq',
          prompt: 'How many significant figures does 0.00420 have?',
          options: ['2', '3', '5', '6'],
          correct: 1,
          explain: 'The leading zeros are just placeholders (not significant). "4", "2", and the trailing "0" after the decimal are all significant — 3 total.',
          wrongExplain: {
            0: 'That misses the trailing zero: it comes after the decimal point, right after significant digits, so it counts too — 3 significant figures, not 2.',
            2: 'That counts the leading zeros. They\'re only placeholders that fix the decimal point\'s position — they don\'t reflect anything measured.'
          }
        },
        {
          kind: 'numeric',
          prompt: 'Multiply 3.2 × 1.70 and report the result to the correct number of significant figures (limited by 3.2, which has 2 sig figs).',
          correct: 5.4,
          tol: 0.05,
          decimals: 1,
          explain: '3.2 × 1.70 = 5.44, but since 3.2 only has 2 significant figures, the answer must be rounded to 2 sig figs: 5.4.',
          hint: 'The result can\'t be more precise than your least-precise input.'
        }
      ]
    },

    /* ============================================================ */
    {
      id: 'tk-graphs',
      title: 'Reading Graphs Like a Scientist',
      sub: '6 steps · slope and area, everywhere',
      steps: [
        {
          kind: 'lesson',
          title: 'Two ideas that show up in every chapter',
          hook: 'A live chart of a phone battery percentage over the day, or a stock ticker climbing and dipping — you already read graphs like these instinctively, judging "how fast" and "how much total" without doing a single calculation. This lesson names the two instincts you\'re already using.',
          body: 'Almost any graph in physics can be read using two ideas: the **slope** tells you a rate of change, and the **area under the curve** tells you an accumulated total. Learn to spot these once, and they\'ll apply to motion, circuits, thermodynamics — everything.',
          callout: { variant: 'key', text: 'Slope = rise/run = how fast the *y*-quantity changes per unit of the *x*-quantity. Area = the running total of *y* accumulated as *x* increases.' }
        },
        {
          kind: 'mcq',
          prompt: 'A tank\'s water level rises steadily, then the graph of level-vs-time suddenly gets steeper. What does that steeper section mean?',
          options: ['Water is draining out', 'Water is flowing in faster than before', 'The tank is full', 'Nothing changed'],
          correct: 1,
          explain: 'A steeper slope on a level-vs-time graph means the level is rising faster — the inflow rate increased.',
          wrongExplain: { 2: 'If the tank were full, the level would stop changing and the graph would go flat (zero slope) — not steeper. A steeper slope means a faster rate, not an ending.' }
        },
        {
          kind: 'numeric',
          prompt: 'Water flows into a tank at a constant rate of 3 L/min for 12 minutes. The area under this flow-rate-vs-time graph equals total volume added. How many liters entered?',
          unit: 'L',
          correct: 36,
          tol: 0.5,
          explain: 'Constant rate over time = a rectangle: area = 3 L/min × 12 min = 36 L.',
          hint: 'For a constant rate, area under the graph is just height × width.'
        },
        {
          kind: 'mcq',
          prompt: 'A graph of $y$ vs $x$ is a straight line through the origin. If $x$ doubles, what happens to $y$?',
          options: ['Also doubles', 'Quadruples', 'Stays the same', 'Halves'],
          correct: 0,
          explain: 'A straight line through the origin means y is directly proportional to x (y = kx). Doubling x doubles y — that\'s what "linear" means.',
          wrongExplain: { 1: 'Quadrupling is what happens for a *squared* relationship (y ∝ x²), not a straight line. A straight line through the origin scales evenly: double the input, double the output.' }
        },
        {
          kind: 'mcq',
          prompt: 'A graph of $y$ vs $x$ curves upward, and doubling $x$ always quadruples $y$. What kind of relationship is this?',
          options: ['Linear ($y \\propto x$)', 'Quadratic ($y \\propto x^2$)', 'Inverse ($y \\propto 1/x$)', 'Constant'],
          correct: 1,
          explain: 'Doubling the input and quadrupling the output (2² = 4) is the signature of a squared relationship: y ∝ x².',
          wrongExplain: { 0: 'A linear relationship would double y when x doubles, not quadruple it. Quadrupling only comes from squaring the input.' }
        },
        {
          kind: 'order',
          prompt: 'Three graphs of $y$ vs. time are all straight lines. Rank them by their slope, from most negative to most positive.',
          items: [
            'Line falling steeply from top-left to bottom-right',
            'Perfectly flat, horizontal line',
            'Line rising steeply from bottom-left to top-right'
          ],
          explain: 'A steep downward line has a large negative slope, flat is zero slope, and a steep upward line has a large positive slope.'
        }
      ]
    },

    /* ============================================================ */
    {
      id: 'tk-vectors',
      title: 'Vectors & Scalars',
      sub: '6 steps · magnitude and direction',
      steps: [
        {
          kind: 'lesson',
          title: 'Some quantities need a direction to mean anything',
          hook: 'Someone asks you for directions to the train station and you answer "500 meters." They\'ll immediately ask "which way?" — a distance alone was never a complete answer, and that missing piece is exactly what separates a vector from a scalar.',
          body: 'A **scalar** is fully described by a single number: mass, temperature, energy, speed. A **vector** needs a magnitude *and* a direction to make sense: displacement, velocity, force. "5 kg" is complete. "5 m/s" going *which way* is not.',
          callout: { variant: 'info', text: 'You\'ve already been using 1D vectors — the + and − signs in kinematics were direction, just squeezed onto a single line.' }
        },
        {
          kind: 'mcq',
          prompt: 'Which of these is a vector quantity?',
          options: ['Temperature', 'Mass', 'Force', 'Energy'],
          correct: 2,
          explain: 'Force has both a size and a direction — "10 N" isn\'t complete without saying which way it pushes. The others are scalars: fully described by a single number.',
          wrongExplain: { 1: 'Mass is a scalar — "5 kg" is a complete statement with no direction attached. Don\'t confuse it with weight (a force), which does have direction.' }
        },
        {
          kind: 'lesson',
          title: 'Adding vectors: tip to tail',
          body: 'To add two vectors graphically, place the tail of the second at the tip of the first — the sum (the **resultant**) is the arrow from the very start to the very end. Order doesn\'t matter: $\\vec{A}+\\vec{B} = \\vec{B}+\\vec{A}$.',
          formula: { name: 'Components', tex: 'A_x = A\\cos\\theta \\qquad A_y = A\\sin\\theta', vars: [
            { sym: 'A', mean: 'the vector\'s length (magnitude)' },
            { sym: '\\theta', mean: 'its angle from the positive x-axis' },
            { sym: 'A_x, A_y', mean: 'its horizontal and vertical components' }
          ] }
        },
        {
          kind: 'sim',
          prompt: 'Tune vector A and vector B (length and angle) so their tip-to-tail sum matches the dashed target vector.',
          simId: 'vectorAdd',
          args: { targetMag: 12, targetAngle: 40 },
          note: 'The pale violet arrow is the resultant — vector A followed by vector B, tip to tail.'
        },
        {
          kind: 'numeric',
          prompt: 'Vector A points 6 units east. Vector B points 8 units north. What is the magnitude of their resultant (east and north are perpendicular)?',
          correct: 10,
          tol: 0.1,
          explain: 'Perpendicular vectors add via the Pythagorean theorem: √(6² + 8²) = √(36+64) = √100 = 10.',
          hint: 'Two perpendicular vectors form the legs of a right triangle — the resultant is the hypotenuse.'
        },
        {
          kind: 'mcq',
          prompt: 'True or false: $\\vec{A} + \\vec{B}$ always gives the same resultant vector as $\\vec{B} + \\vec{A}$.',
          options: ['True — vector addition is commutative', 'False — order changes the direction', 'False — order changes the magnitude', 'Only true if A and B are perpendicular'],
          correct: 0,
          explain: 'Vector addition is commutative, just like ordinary addition. Tip-to-tail with A first or B first traces a different path but lands on the exact same resultant.',
          wrongExplain: { 3: 'It holds for *any* pair of vectors, not just perpendicular ones — commutativity of vector addition has nothing to do with the angle between them.' }
        }
      ]
    }
  );

})(typeof window !== 'undefined' ? window : globalThis);
