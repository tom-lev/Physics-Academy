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
          body: 'Here\'s the thing about physics: it never trusts a naked number. A roller coaster\'s speed readout flashes "30" at the bottom of the first drop — 30 what? Miles an hour, and it\'s a fun ride. Meters a second, and it\'s a genuine emergency. That gap is exactly why physicists glue a **unit** to absolutely everything, and the whole world standardizes on the same toolkit for it: the **SI system** — meters for length, kilograms for mass, seconds for time, and a handful of others everything else gets built from.',
          callout: { variant: 'info', text: 'Derived units are just combinations of these: a Newton (force) is $\\text{kg}\\cdot\\text{m/s}^2$. A Joule (energy) is $\\text{N}\\cdot\\text{m}$.' }
        },
        {
          kind: 'mcq',
          difficulty: 'easy',
          prompt: 'Which SI base unit measures mass?',
          options: ['Newton', 'Kilogram', 'Joule', 'Pascal'],
          correct: 1,
          explain: 'The kilogram (kg) is one of the seven SI base units. Newton, Joule, and Pascal are all *derived* units, built out of kg, m, and s.',
          wrongExplain: { 0: 'The Newton measures *force* (weight), not mass — an easy mix-up since weight and mass are so closely linked in everyday speech.' }
        },
        {
          kind: 'lesson',
          title: 'Prefixes: shorthand for powers of ten',
          body: 'Nobody wants to write 0.000000045 seconds by hand every time, so physicists shrink it with a prefix instead. A power of ten just tells you how many places to shift a decimal point: $10^3 = 1000$ shifts it 3 places *right* (multiply). $10^{-3} = 0.001$ shifts it 3 places *left* instead — a negative exponent means "divide by," not some harder kind of math.\n\nYour phone\'s processor spec ("3.5 GHz"), a USB cable\'s transfer rate, a camera flash\'s capacitor — all of them lean on exactly this shorthand. Learn the handful below once, and you\'ll use them in every chapter from here on.',
          formula: { name: 'Common SI prefixes', tex: '1\\text{ km} = 1\\times 10^{3}\\text{ m}', vars: [
            { sym: 'n', mean: 'nano — $10^{-9}$' },
            { sym: '\\mu', mean: 'micro — $10^{-6}$' },
            { sym: 'm', mean: 'milli — $10^{-3}$' },
            { sym: 'k', mean: 'kilo — $10^{3}$' },
            { sym: 'M', mean: 'mega — $10^{6}$' },
            { sym: 'G', mean: 'giga — $10^{9}$' }
          ] },
          callout: { variant: 'info', text: 'To use one, swap the prefix for its power of ten and multiply: **5 ns** = $5 \\times 10^{-9}$ s = 0.000000005 s (decimal point shifted 9 places left).' }
        },
        {
          kind: 'numeric',
          difficulty: 'medium',
          prompt: 'A capacitor (an electrical component that stores charge, rated in **farads**, F, the unit of capacitance) is rated at 4700 µF (microfarads). Since $\\mu = 10^{-6}$, what is that value in farads (F)?',
          unit: 'F',
          correct: 0.0047,
          tol: 0.0001,
          decimals: 4,
          explain: '4700 × 10⁻⁶ F = 0.0047 F. Converting between prefixes is always just multiplying by the right power of ten.',
          hint: 'Multiply 4700 by 10⁻⁶.'
        },
        {
          kind: 'mcq',
          difficulty: 'medium',
          prompt: 'A signal has a frequency of 2.4 GHz. Which prefix does "G" represent?',
          options: ['10³ (thousand)', '10⁶ (million)', '10⁹ (billion)', '10¹² (trillion)'],
          correct: 2,
          explain: 'Giga (G) = 10⁹. So 2.4 GHz means 2,400,000,000 cycles per second.',
          wrongExplain: { 1: 'Mega (M) is 10⁶ — a thousand times smaller than giga. Easy to mix up since both describe "big" numbers.' }
        },
        {
          kind: 'order',
          difficulty: 'hard',
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
          body: 'The trick is always the same: multiply by a fraction that secretly equals 1 — like $\\frac{1000\\text{ m}}{1\\text{ km}}$ — chosen so the unit you don\'t want cancels out and the unit you actually need is what\'s left standing.',
          callout: { variant: 'key', text: 'Write the units out and cancel them like algebra. If they don\'t cancel to what you expect, you used the wrong conversion factor.' }
        },
        {
          kind: 'numeric',
          difficulty: 'easy',
          prompt: 'A car travels at 90 km/h. Convert this to m/s. (1 km = 1000 m, 1 h = 3600 s)',
          unit: 'm/s',
          correct: 25,
          tol: 0.2,
          explain: '90 km/h × (1000 m / 1 km) × (1 h / 3600 s) = 90000/3600 = 25 m/s.',
          hint: 'Multiply by 1000 to get meters, then divide by 3600 to get seconds.'
        },
        {
          kind: 'numeric',
          difficulty: 'medium',
          prompt: 'Convert 2.5 hours into seconds.',
          unit: 's',
          correct: 9000,
          tol: 10,
          explain: '2.5 h × 3600 s/h = 9000 s.'
        },
        {
          kind: 'lesson',
          title: 'Dimensional analysis: a built-in error checker',
          hook: 'In 1999, NASA lost a \\$125 million Mars orbiter because one engineering team\'s software used pounds-force and another\'s used newtons, and nobody caught the mismatch until the spacecraft was gone.',
          body: 'Dimensional analysis is the cheap insurance against exactly that kind of disaster: every physical equation must balance dimensionally — the units on the left must match the units on the right. It won\'t tell you if an equation is *physically* correct, but it will instantly catch typos and misremembered formulas, the kind that, in the wrong context, cost \\$125 million.',
          callout: { variant: 'info', text: 'Example: in $x = v t$, the units check out as $\\text{m} = (\\text{m/s})(\\text{s})$ — the seconds cancel, leaving meters on both sides. ✓' }
        },
        {
          kind: 'mcq',
          difficulty: 'hard',
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
          body: '**Accuracy** is how close a measurement lands to the actual truth. **Precision** is how consistent it stays with itself, reading after reading — whether or not it\'s anywhere near right. A device can nail one of these and completely miss the other.',
          callout: { variant: 'key', text: 'A scale that reads 61.2 kg every time you step on it is *precise*. If you actually weigh 58 kg, it\'s precise but not *accurate*.' }
        },
        {
          kind: 'mcq',
          difficulty: 'easy',
          prompt: 'Four dart throws all land tightly clustered — but in the bottom-left corner of the board, far from the bullseye. This result is:',
          options: ['Accurate but not precise', 'Precise but not accurate', 'Both accurate and precise', 'Neither accurate nor precise'],
          correct: 1,
          explain: 'Tightly clustered means precise (consistent). Far from the bullseye means not accurate (not close to the true target).',
          wrongExplain: { 0: 'That\'s backwards: a tight cluster is what makes a result *precise* (consistent), not accurate. Accuracy is about closeness to the true target, which this throw misses.' }
        },
        {
          kind: 'lesson',
          title: 'Significant figures: honesty about your uncertainty',
          hook: 'Pull a tape measure with millimeter marks and you can honestly claim "182.3 cm" — but claim "182.347 cm" off that same tape and you\'re not measuring anymore, you\'re just making digits up.',
          body: 'The digits in a measurement that are actually known reliably are its **significant figures**. Reporting more digits than your instrument can justify doesn\'t make the answer more true — it just makes it more dishonest.',
          callout: { variant: 'info', text: 'Quick rules: all non-zero digits count. Zeros between non-zero digits count. Leading zeros (0.0042) don\'t count. Trailing zeros after a decimal point (4.20) do count.' }
        },
        {
          kind: 'mcq',
          difficulty: 'medium',
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
          difficulty: 'hard',
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
      id: 'tk-checkpoint',
      title: 'Checkpoint: Units, Conversion & Precision',
      sub: '5 steps · mixed review',
      steps: [
        {
          kind: 'lesson',
          title: 'Quick check before moving on',
          hook: 'A pilot reading an altimeter, a nurse reading a syringe, an engineer reading a resistor\'s color bands — every one of them is doing exactly what the last three lessons taught: attaching the right power of ten, converting cleanly, and reporting only the digits they can trust.',
          body: 'Five quick questions mixing everything so far — prefixes, conversion, and precision — before graphs and vectors build on top of it.'
        },
        {
          kind: 'mcq',
          difficulty: 'easy',
          prompt: 'Which prefix represents $10^{-3}$?',
          options: ['kilo (k)', 'milli (m)', 'mega (M)', 'nano (n)'],
          correct: 1,
          explain: 'milli (m) = $10^{-3}$ — a thousandth. kilo is $10^3$, mega is $10^6$, nano is $10^{-9}$.',
          wrongExplain: { 0: 'kilo (k) is $10^{+3}$ — a *thousand times bigger*, the opposite direction from milli.' }
        },
        {
          kind: 'numeric',
          difficulty: 'easy',
          prompt: 'Convert 45 minutes into seconds.',
          unit: 's',
          correct: 2700,
          tol: 5,
          explain: '45 min × 60 s/min = 2700 s.',
          hint: 'Multiply by 60 to go from minutes to seconds.'
        },
        {
          kind: 'numeric',
          difficulty: 'medium',
          prompt: 'A resistor (an electrical component rated in **ohms**, Ω, the unit of resistance) is marked 2.2 kΩ. Since k = $10^3$, what is that in ohms (Ω)?',
          unit: 'Ω',
          correct: 2200,
          tol: 20,
          explain: '2.2 × $10^3$ Ω = 2200 Ω.',
          hint: 'Multiply 2.2 by 1000.'
        },
        {
          kind: 'mcq',
          difficulty: 'medium',
          prompt: 'How many significant figures does 0.0620 have?',
          options: ['2', '3', '4', '5'],
          correct: 1,
          explain: 'The leading zeros (0.0) are placeholders and don\'t count. "6", "2", and the trailing "0" after the decimal are all significant — 3 total.',
          wrongExplain: { 0: 'That misses the trailing zero after the decimal point — it comes right after significant digits, so it counts too.' }
        },
        {
          kind: 'mcq',
          difficulty: 'hard',
          prompt: 'A speedometer reads exactly "100.0 km/h" every single time you check it, but you\'re actually going 90 km/h. This speedometer is:',
          options: ['Accurate but not precise', 'Precise but not accurate', 'Both accurate and precise', 'Neither'],
          correct: 1,
          explain: 'Reading the same value every time means it\'s *precise* (consistent). Being consistently 10 km/h off from the truth means it\'s not *accurate*.',
          wrongExplain: { 0: 'That\'s backwards — a rock-steady repeated reading is what makes something precise, not accurate. Accuracy is about closeness to the true 90 km/h, which this misses every time.' }
        }
      ]
    },

    /* ============================================================ */
    {
      id: 'tk-graphs',
      title: 'Reading Graphs Like a Scientist',
      sub: '8 steps · slope and area, everywhere',
      steps: [
        {
          kind: 'lesson',
          title: 'Two ideas that show up in every chapter',
          hook: 'A live chart of a phone battery percentage over the day, or a stock ticker climbing and dipping — you already read graphs like these instinctively, judging "how fast" and "how much total" without doing a single calculation. This lesson names the two instincts you\'re already using.',
          body: 'Almost any graph in physics boils down to two ideas: the **slope** tells you a rate — how fast something\'s changing right now — and the **area under the curve** tells you a running total, everything that\'s piled up so far. Spot these two patterns once and they\'ll follow you through motion, circuits, thermodynamics — every graph you\'ll meet in this course.',
          callout: { variant: 'key', text: 'Slope = rise/run = how fast the *y*-quantity changes per unit of the *x*-quantity. Area = the running total of *y* accumulated as *x* increases.' }
        },
        {
          kind: 'sim',
          prompt: 'Drag the slope slider and watch the line get steeper or flatter — and watch the slope number match it exactly.',
          simId: 'slopeGraph',
          args: { slope: 3 },
          note: 'A steeper line always means a bigger slope number, whichever direction it points.'
        },
        {
          kind: 'sim',
          prompt: 'Drag Rate and Time and watch the shaded area — and its number — grow. That\'s "area under the curve" in action.',
          simId: 'areaGraph',
          args: { rate: 4, dur: 6 },
          note: 'A taller or wider shaded region always means a bigger accumulated total.'
        },
        {
          kind: 'mcq',
          difficulty: 'easy',
          prompt: 'A tank\'s water level rises steadily, then the graph of level-vs-time suddenly gets steeper. What does that steeper section mean?',
          options: ['Water is draining out', 'Water is flowing in faster than before', 'The tank is full', 'Nothing changed'],
          correct: 1,
          explain: 'A steeper slope on a level-vs-time graph means the level is rising faster — the inflow rate increased.',
          wrongExplain: { 2: 'If the tank were full, the level would stop changing and the graph would go flat (zero slope) — not steeper. A steeper slope means a faster rate, not an ending.' }
        },
        {
          kind: 'numeric',
          difficulty: 'medium',
          prompt: 'Water flows into a tank at a constant rate of 3 L/min for 12 minutes. The area under this flow-rate-vs-time graph equals total volume added. How many liters entered?',
          unit: 'L',
          correct: 36,
          tol: 0.5,
          explain: 'Constant rate over time = a rectangle: area = 3 L/min × 12 min = 36 L.',
          hint: 'For a constant rate, area under the graph is just height × width.'
        },
        {
          kind: 'mcq',
          difficulty: 'medium',
          prompt: 'A graph of $y$ vs $x$ is a straight line through the origin. If $x$ doubles, what happens to $y$?',
          options: ['Also doubles', 'Quadruples', 'Stays the same', 'Halves'],
          correct: 0,
          explain: 'A straight line through the origin means y is directly proportional to x (y = kx). Doubling x doubles y — that\'s what "linear" means.',
          wrongExplain: { 1: 'Quadrupling is what happens for a *squared* relationship (y ∝ x²), not a straight line. A straight line through the origin scales evenly: double the input, double the output.' }
        },
        {
          kind: 'mcq',
          difficulty: 'medium',
          prompt: 'A graph of $y$ vs $x$ curves upward, and doubling $x$ always quadruples $y$. What kind of relationship is this?',
          options: ['Linear ($y \\propto x$)', 'Quadratic ($y \\propto x^2$)', 'Inverse ($y \\propto 1/x$)', 'Constant'],
          correct: 1,
          explain: 'Doubling the input and quadrupling the output (2² = 4) is the signature of a squared relationship: y ∝ x².',
          wrongExplain: { 0: 'A linear relationship would double y when x doubles, not quadruple it. Quadrupling only comes from squaring the input.' }
        },
        {
          kind: 'order',
          difficulty: 'hard',
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
          body: 'A **scalar** is the whole story in one number — mass, temperature, energy, speed — done, nothing missing. A **vector** needs a partner fact to mean anything at all: a magnitude *and* a direction. "5 kg" is complete. "5 m/s" going *which way* just left you hanging.',
          callout: { variant: 'info', text: 'You\'ve already been using 1D vectors — the + and − signs in kinematics were direction, just squeezed onto a single line.' }
        },
        {
          kind: 'mcq',
          difficulty: 'easy',
          prompt: 'Which of these is a vector quantity?',
          options: ['Temperature', 'Mass', 'Force', 'Energy'],
          correct: 2,
          explain: 'Force has both a size and a direction — "10 N" isn\'t complete without saying which way it pushes. The others are scalars: fully described by a single number.',
          wrongExplain: { 1: 'Mass is a scalar — "5 kg" is a complete statement with no direction attached. Don\'t confuse it with weight (a force), which does have direction.' }
        },
        {
          kind: 'lesson',
          title: 'Adding vectors: tip to tail',
          hook: 'A pilot flying due north at 200 km/h through a 40 km/h crosswind doesn\'t actually travel due north over the ground — their plane\'s velocity and the wind\'s velocity add together into a path that\'s neither one alone.',
          body: 'The trick for finding that combined path is beautifully simple: place the tail of the second vector at the tip of the first — the sum (the **resultant**) is the arrow from the very start to the very end. From here on, a small arrow overhead ($\\vec{A}$) marks something as a vector, to distinguish it from just its magnitude ($A$, a plain number) — and order never matters: $\\vec{A}+\\vec{B} = \\vec{B}+\\vec{A}$.',
          formula: { name: 'Components', words: 'horizontal component = magnitude × cos(angle) — vertical component = magnitude × sin(angle)', tex: 'A_x = A\\cos\\theta \\qquad A_y = A\\sin\\theta', vars: [
            { sym: 'A', mean: 'the vector\'s length (magnitude)' },
            { sym: '\\theta', mean: 'its angle from the positive x-axis' },
            { sym: 'A_x, A_y', mean: 'its horizontal and vertical components' }
          ] },
          callout: { variant: 'info', text: 'You don\'t need to memorize $\\cos\\theta$ and $\\sin\\theta$ — any calculator (including your phone) gives you their value for any angle instantly. Conceptually: they measure how much of a length-1 arrow pointing at angle $\\theta$ lands along the x-axis and y-axis respectively, so multiplying by $A$ splits a length-$A$ vector into its horizontal and vertical pieces. You\'ll be plugging numbers into a calculator for these from here on, not deriving them by hand.' }
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
          difficulty: 'medium',
          prompt: 'Vector A points 6 units east. Vector B points 8 units north — east and north meet at a right angle (90°), meaning they\'re **perpendicular**. What is the magnitude of their resultant?',
          correct: 10,
          tol: 0.1,
          formula: { name: 'Pythagorean theorem (right triangles only)', words: 'hypotenuse = square root of (leg one² + leg two²)', tex: 'c = \\sqrt{a^2+b^2}', vars: [
            { sym: 'a, b', mean: 'the two perpendicular legs' },
            { sym: 'c', mean: 'the hypotenuse — the longest side, opposite the right angle' }
          ] },
          explain: 'Perpendicular vectors add via the Pythagorean theorem: √(6² + 8²) = √(36+64) = √100 = 10.',
          hint: 'Two perpendicular vectors form the legs of a right triangle — the resultant is the hypotenuse. Plug their lengths in for a and b.'
        },
        {
          kind: 'mcq',
          difficulty: 'hard',
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
