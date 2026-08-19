/* ============================================================
   lessons/kinematics.js — Chapter 1: Motion in a Line
   Six lessons, from "what is displacement" through reading
   motion graphs. Every graded numeric answer routes through
   PA.kin so the sims and the answer keys can never disagree.
   ============================================================ */
(function (root) {
  'use strict';

  var chapter = root.PA.curriculum.findChapter('kinematics');
  if (!chapter) return;

  chapter.lessons.push(

    /* ============================================================ */
    {
      id: 'kin-position',
      title: 'Position, Displacement & Distance',
      sub: '6 steps · core concept',
      steps: [
        {
          kind: 'lesson',
          title: 'Where something is, and how far it moved',
          body: "Everything in kinematics starts with **position** — where an object is relative to some reference point you choose. Once you have two positions, you can ask a more interesting question: how far did it *move*?\n\nThere are two different answers to that, and mixing them up is the single most common kinematics mistake.",
          callout: { variant: 'key', text: '**Distance** is the total length of the path traveled — always positive. **Displacement** is the straight-line change in position, $\\Delta x = x_f - x_i$ — it can be positive, negative, or zero.' }
        },
        {
          kind: 'mcq',
          prompt: 'You walk 8 m east, then turn around and walk 3 m west. What is your displacement (taking east as positive)?',
          options: ['+11 m', '+5 m', '-5 m', '+8 m'],
          correct: 1,
          explain: 'Displacement only cares about start and end: $\\Delta x = 8 + (-3) = +5$ m. The total distance walked was 11 m, but that\'s a different number.',
          hint: 'Add the two legs as signed numbers, east positive, west negative.'
        },
        {
          kind: 'lesson',
          title: 'Signs are directions',
          body: 'In one dimension, a vector quantity like displacement or velocity is fully described by a magnitude and a **sign**. Pick a positive direction once (often "right" or "up") and stick with it for the whole problem — the sign then tells you which way something points, without needing an arrow.',
          formula: { name: 'Displacement', tex: '\\Delta x = x_f - x_i' }
        },
        {
          kind: 'numeric',
          prompt: 'A drone starts at $x_i = -12\\text{ m}$ and ends at $x_f = 7\\text{ m}$. What is its displacement, in meters?',
          unit: 'm',
          correct: 19,
          tol: 0.1,
          explain: 'Δx = x_f − x_i = 7 − (−12) = 19 m.',
          hint: 'Δx = x_f − x_i — subtract, don\'t just look at the distance between the numbers on a number line... actually that IS the distance between them.'
        },
        {
          kind: 'mcq',
          prompt: 'Which statement about distance and displacement is always true?',
          options: [
            'Distance is greater than or equal to the magnitude of displacement',
            'Displacement is greater than or equal to distance',
            'They are always equal',
            'Distance can be negative if you walk backward'
          ],
          correct: 0,
          explain: 'The straight-line shortcut (|displacement|) can never be longer than the path you actually walked (distance). They\'re only equal when you move in a straight line without reversing.'
        },
        {
          kind: 'order',
          prompt: 'Three hikers each end up 2 km from where they started. Rank their trips by total distance walked, from *least* to *most*.',
          items: [
            'Walked straight there — 2 km in one direction',
            'Walked 3 km out, backtracked 1 km — net 2 km',
            'Walked 6 km out, backtracked 4 km — net 2 km'
          ],
          explain: 'All three have the same 2 km displacement, but distance keeps adding up every time you backtrack — 2 km, then 4 km, then 10 km.'
        }
      ]
    },

    /* ============================================================ */
    {
      id: 'kin-velocity',
      title: 'Velocity & Speed',
      sub: '6 steps · rates of change',
      steps: [
        {
          kind: 'lesson',
          title: 'How fast, and which way',
          body: 'Speed tells you how fast the odometer is spinning — always positive, no direction attached. **Velocity** is the vector version: displacement per time, direction included.',
          formula: { name: 'Average velocity', tex: '\\bar{v} = \\frac{\\Delta x}{\\Delta t}' }
        },
        {
          kind: 'numeric',
          prompt: 'A cyclist rides from $x=0$ to $x=150\\text{ m}$ in 30 s, then stops. What is her average velocity, in m/s?',
          unit: 'm/s',
          correct: 5,
          tol: 0.05,
          explain: 'v̄ = Δx / Δt = 150 / 30 = 5 m/s.'
        },
        {
          kind: 'mcq',
          prompt: 'A runner does a full lap of a 400 m track in 80 s and ends up back where she started. What is her average velocity?',
          options: ['5 m/s', '0.2 m/s', '0 m/s', 'Impossible to say without a stopwatch on each leg'],
          correct: 2,
          explain: 'Average velocity depends on **displacement**, and her displacement for a full lap is zero — start and end point are the same place. Her average *speed*, using distance instead, is 400/80 = 5 m/s.',
          hint: 'Displacement, not distance, goes in the numerator.'
        },
        {
          kind: 'lesson',
          title: 'Instantaneous velocity: zooming all the way in',
          body: 'Average velocity is fine over a long interval, but it hides everything that happened in between. **Instantaneous velocity** is the average velocity over an interval so short it might as well be a single instant — graphically, it\'s the slope of the tangent line on a position-vs-time graph at that point.',
          callout: { variant: 'info', text: 'Steeper slope on an $x$-$t$ graph = faster. A flat slope means the object is momentarily at rest.' }
        },
        {
          kind: 'mcq',
          prompt: 'On a position-vs-time graph, a curve bends so its slope keeps getting steeper (while staying positive). What is the object doing?',
          options: ['Moving in the positive direction and speeding up', 'Moving in the negative direction and slowing down', 'Standing still', 'Moving at constant velocity'],
          correct: 0,
          explain: 'A positive, steepening slope means velocity is positive and increasing — the object is moving forward and speeding up.'
        },
        {
          kind: 'numeric',
          prompt: 'A car covers 300 m in 25 s at constant velocity. If it kept that same velocity, how far would it travel in 40 s, in meters?',
          unit: 'm',
          correct: 480,
          tol: 2,
          explain: 'v = 300/25 = 12 m/s. Distance in 40 s = 12 × 40 = 480 m.',
          hint: 'Find the velocity first, then use x = v·t.'
        }
      ]
    },

    /* ============================================================ */
    {
      id: 'kin-acceleration',
      title: 'Acceleration',
      sub: '6 steps · the rate of the rate',
      steps: [
        {
          kind: 'lesson',
          title: 'Acceleration is how velocity itself changes',
          body: 'If velocity is how fast position changes, **acceleration** is how fast velocity changes. It\'s measured in m/s² — "meters per second, per second" — and like velocity, it has a sign.',
          formula: { name: 'Average acceleration', tex: 'a = \\frac{\\Delta v}{\\Delta t}' }
        },
        {
          kind: 'numeric',
          prompt: 'A skateboarder speeds up from 2 m/s to 11 m/s in 3 s. What is her acceleration, in m/s²?',
          unit: 'm/s²',
          correct: 3,
          tol: 0.05,
          explain: 'a = Δv/Δt = (11 − 2)/3 = 3 m/s².'
        },
        {
          kind: 'mcq',
          prompt: 'Which of these has zero acceleration?',
          options: [
            'A ball rolling at a constant 4 m/s in a straight line',
            'A ball speeding up while rolling downhill',
            'A ball at the top of its bounce, momentarily at rest',
            'A car going around a curve at constant speed'
          ],
          correct: 0,
          explain: 'Constant velocity — same speed, same direction — means Δv = 0, so a = 0. The ball at the top of a bounce still has gravity acting on it (a = -g), and a car turning is changing direction, which is a change in the velocity *vector* even at constant speed.',
          hint: 'Acceleration is about anything changing, including direction — not just speed.'
        },
        {
          kind: 'lesson',
          title: 'Speeding up or slowing down: compare the signs',
          body: 'Whether an object speeds up or slows down doesn\'t depend on the sign of $a$ alone — it depends on how $a$ compares to $v$.',
          callout: { variant: 'key', text: 'Same sign as velocity → **speeding up**. Opposite sign → **slowing down**, regardless of which direction is "positive."' }
        },
        {
          kind: 'mcq',
          prompt: 'A car moves in the negative direction ($v < 0$) while its acceleration is positive ($a > 0$). What is happening to its speed?',
          options: ['Increasing', 'Decreasing', 'Staying constant', 'Not enough information'],
          correct: 1,
          explain: 'v and a have opposite signs, so the acceleration is opposing the motion — the car is braking. Its speed (the magnitude of v) is decreasing, even though a itself is positive.'
        },
        {
          kind: 'numeric',
          prompt: 'A train decelerates at $1.5\\text{ m/s}^2$ from an initial velocity of 20 m/s. Using $v = v_0 + at$, what is its velocity after 8 s, in m/s?',
          unit: 'm/s',
          correct: 8,
          tol: 0.2,
          explain: 'v = v₀ + at = 20 + (−1.5)(8) = 20 − 12 = 8 m/s. Deceleration means a is negative relative to the direction of motion.',
          hint: 'Deceleration means a is negative if v0 is positive.'
        }
      ]
    },

    /* ============================================================ */
    {
      id: 'kin-freefall',
      title: 'Free Fall',
      sub: '6 steps · gravity in action',
      steps: [
        {
          kind: 'lesson',
          title: 'The one acceleration everyone already knows',
          body: 'Drop anything near Earth\'s surface and — ignoring air resistance — it accelerates downward at a constant $g \\approx 9.81\\text{ m/s}^2$, no matter how heavy it is. That last part surprises people every time.',
          formula: { name: 'Free fall from rest', tex: 'h = \\frac{1}{2} g t^2 \\qquad v = g t' },
          callout: { variant: 'info', text: 'This is just the constant-acceleration equations from the last lesson, with $a=g$ and $v_0=0$.' }
        },
        {
          kind: 'mcq',
          prompt: 'You drop a bowling ball and a tennis ball from the same height at the same time, in a vacuum (no air resistance). Which hits the ground first?',
          options: ['The bowling ball, because it\'s heavier', 'The tennis ball, because it\'s lighter', 'They land at the same time', 'Depends on the exact height'],
          correct: 2,
          explain: 'In free fall, acceleration doesn\'t depend on mass — a heavier object needs more force to accelerate it, but gravity conveniently supplies exactly that much more force. Galileo demonstrated this centuries before we had vacuum chambers to prove it cleanly.'
        },
        {
          kind: 'sim',
          prompt: 'Try it yourself: pick a world and a height, then drop the ball.',
          simId: 'drop',
          args: { targetTime: 1.0 },
          note: 'Notice how much longer the fall takes on the Moon than on Earth, even from the same height.'
        },
        {
          kind: 'numeric',
          prompt: 'An object is dropped from rest from a height of 45 m on Earth ($g = 9.81\\text{ m/s}^2$). How long does it take to land, in seconds?',
          unit: 's',
          correct: 3.02,
          tol: 0.05,
          decimals: 2,
          explain: 't = √(2h/g) = √(2 × 45 / 9.81) ≈ 3.02 s.',
          hint: 'Solve h = ½gt² for t.'
        },
        {
          kind: 'numeric',
          prompt: 'Same drop — 45 m on Earth. What is its impact speed, in m/s?',
          unit: 'm/s',
          correct: 29.7,
          tol: 0.4,
          decimals: 1,
          explain: 'v = gt ≈ 9.81 × 3.02 ≈ 29.7 m/s (or directly: v = √(2gh)).'
        },
        {
          kind: 'mcq',
          prompt: 'The same object is dropped from the same height, but on the Moon ($g \\approx 1.62\\text{ m/s}^2$) instead of Earth. What happens to the fall time?',
          options: ['It gets much shorter', 'It gets much longer', 'It stays exactly the same', 'It becomes zero'],
          correct: 1,
          explain: 'Fall time scales as $1/\\sqrt{g}$. Since the Moon\'s gravity is about 6× weaker, the fall takes about √6 ≈ 2.5× longer.'
        }
      ]
    },

    /* ============================================================ */
    {
      id: 'kin-equations',
      title: 'Motion with Constant Acceleration',
      sub: '6 steps · putting it all together',
      steps: [
        {
          kind: 'lesson',
          title: 'Three equations, one underlying idea',
          body: 'Whenever acceleration is constant, three equations connect position, velocity, acceleration, and time. Pick whichever one already contains the variables you have — and skips the one you don\'t.',
          formula: { name: 'The kinematics toolkit', tex: 'v = v_0 + at' },
          callout: { variant: 'key', text: 'Also: $x = x_0 + v_0 t + \\frac{1}{2}at^2$ — and, when time isn\'t given, $v^2 = v_0^2 + 2a\\Delta x$.' }
        },
        {
          kind: 'numeric',
          prompt: 'A car brakes from 24 m/s to a stop with a deceleration of $6\\text{ m/s}^2$. Using $v^2 = v_0^2 + 2a\\Delta x$, how far does it travel before stopping, in meters?',
          unit: 'm',
          correct: 48,
          tol: 1,
          explain: '0 = 24² − 2(6)Δx → Δx = 576/12 = 48 m.',
          hint: 'Rearrange for Δx with v = 0: Δx = v0² / (2·|a|).'
        },
        {
          kind: 'mcq',
          prompt: 'A car\'s braking distance depends on the square of its initial speed. If the speed doubles, what happens to the braking distance (same deceleration)?',
          options: ['It doubles', 'It triples', 'It quadruples', 'It stays the same'],
          correct: 2,
          explain: 'Since Δx ∝ v0², doubling v0 multiplies the stopping distance by 2² = 4. This is exactly why highway speed limits matter so much more than they seem to.'
        },
        {
          kind: 'sim',
          prompt: 'Tune the speed, braking strength, and reaction time so the car stops before the wall.',
          simId: 'brake',
          args: { wallDistance: 45 },
          note: 'The total stopping distance is reaction distance (you react at constant speed) plus braking distance (you decelerate).'
        },
        {
          kind: 'numeric',
          prompt: 'A driver going 18 m/s takes 0.5 s to react, then brakes at $5\\text{ m/s}^2$. What is the total stopping distance, in meters? (reaction distance + braking distance)',
          unit: 'm',
          correct: 41.4,
          tol: 1,
          decimals: 1,
          explain: 'Reaction distance = 18 × 0.5 = 9 m. Braking distance = 18²/(2×5) = 32.4 m. Total ≈ 41.4 m.',
          hint: 'Reaction distance uses constant velocity; braking distance uses v² = v0² − 2a·Δx.'
        },
        {
          kind: 'mcq',
          prompt: 'Which single change would shrink a car\'s total stopping distance the most?',
          options: [
            'Halving the reaction time',
            'Halving the initial speed',
            'Doubling the braking deceleration',
            'They\'d all help equally'
          ],
          correct: 1,
          explain: 'Reaction distance is linear in speed, and braking deceleration only helps linearly too — but braking distance is proportional to speed **squared**. Halving your speed cuts that term to a quarter, which usually dominates the total.'
        }
      ]
    },

    /* ============================================================ */
    {
      id: 'kin-graphs',
      title: 'Reading Motion Graphs',
      sub: '5 steps · seeing motion without a formula',
      steps: [
        {
          kind: 'lesson',
          title: 'Graphs are just motion, translated',
          body: 'You can read almost everything about a motion straight off its graphs, without ever writing an equation.',
          callout: { variant: 'key', text: 'On an $x$-$t$ graph: **slope = velocity**. On a $v$-$t$ graph: **slope = acceleration**, and **area under the curve = displacement**.' }
        },
        {
          kind: 'mcq',
          prompt: 'A position-vs-time graph is a straight line with a constant negative slope. What does this describe?',
          options: [
            'Constant velocity in the negative direction',
            'Constant acceleration in the negative direction',
            'An object speeding up',
            'An object at rest'
          ],
          correct: 0,
          explain: 'A straight line means the slope — the velocity — never changes. A negative, unchanging slope means constant velocity in the negative direction.'
        },
        {
          kind: 'numeric',
          prompt: 'On a velocity-vs-time graph, an object holds a constant 12 m/s for 5 s. The area under that segment equals its displacement. What is that area, in meters?',
          unit: 'm',
          correct: 60,
          tol: 1,
          explain: 'The region is a rectangle: area = 12 m/s × 5 s = 60 m — matching x = v·t exactly, since area under a v-t graph is displacement.',
          hint: 'For constant velocity, the area under the v-t graph is just a rectangle: height × width.'
        },
        {
          kind: 'order',
          prompt: 'Three v-t graphs, each a straight line starting at v = 0 lasting 4 s. Rank them by total displacement (area of the triangle), from *least* to *most*.',
          items: [
            'Rises to 2 m/s over the 4 s',
            'Rises to 6 m/s over the 4 s',
            'Rises to 10 m/s over the 4 s'
          ],
          explain: 'Each is a triangle of base 4 s, so displacement = ½ × 4 × v_final. A steeper line (bigger v_final) sweeps out more area — and more displacement.'
        },
        {
          kind: 'lesson',
          title: 'Chapter wrap-up',
          body: 'You now have the full toolkit for motion in a straight line: **position, velocity, and acceleration**, how they relate through slopes and areas on graphs, and the three constant-acceleration equations that tie them together numerically — including the special case of free fall.\n\nNext up: what happens when motion isn\'t confined to one line.',
          callout: { variant: 'key', text: 'Keep this straight in your head and everything downstream gets easier: **displacement** is a vector, **distance** is a scalar — and the same split applies to velocity vs. speed.' }
        }
      ]
    }
  );

})(typeof window !== 'undefined' ? window : globalThis);
