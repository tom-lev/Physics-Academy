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
      sub: '7 steps · core concept',
      steps: [
        {
          kind: 'lesson',
          title: 'Where something is, and how far it moved',
          prereq: 'This chapter assumes basic algebra (solving for a variable, adding and subtracting negative numbers), plus the units and vector ideas from the toolkit chapter.',
          hook: "You drive 8 km to a store, then realize you forgot your wallet and drive straight back home. Your odometer now reads 16 km more than when you left — but if someone asks how far from home you currently are, the honest answer is zero. Two completely different, both correct, answers to \"how far did you go?\"",
          body: "Everything in kinematics starts with **position** — where an object is relative to some reference point you choose. Once you have two positions, you can ask a more interesting question: how far did it *move*?\n\nThere are two different answers to that, and mixing them up is the single most common kinematics mistake.",
          callout: { variant: 'key', text: '**Distance** is the total length of the path traveled — always positive. **Displacement** is the straight-line change in position: $\\Delta$ ("delta") means "change in," and $x_i$/$x_f$ mean initial/final position, so $\\Delta x = x_f - x_i$ — it can be positive, negative, or zero.' }
        },
        {
          kind: 'sim',
          prompt: 'Watch: 8 m east, then turn around and walk 3 m west. Distance and displacement start out matching — watch where they diverge.',
          simId: 'walkTrack',
          args: { leg1: 8, leg2: 3 },
          note: 'Distance (the trail) only ever grows. Displacement (the dashed arrow) grows too — until you turn around, and then it shrinks.'
        },
        {
          kind: 'mcq',
          difficulty: 'easy',
          prompt: 'You walk 8 m east, then turn around and walk 3 m west. What is your displacement (taking east as positive)?',
          options: ['+11 m', '+5 m', '-5 m', '+8 m'],
          correct: 1,
          explain: 'Displacement only cares about start and end: $\\Delta x = 8 + (-3) = +5$ m. The total distance walked was 11 m, but that\'s a different number.',
          wrongExplain: { 0: 'That\'s the *total distance* walked (8 + 3 = 11 m) — displacement only cares about your net change in position, not how much ground you covered getting there.' },
          hint: 'Add the two legs as signed numbers, east positive, west negative.'
        },
        {
          kind: 'lesson',
          title: 'Signs are directions',
          hook: 'A bank statement doesn\'t draw arrows: "+\\$50" means money came in, "−\\$50" means it went out, and the sign alone carries all the direction anyone needs.',
          body: 'One-dimensional motion works the same way. A vector quantity like displacement or velocity, squeezed onto a single line, is fully described by a magnitude and a **sign**. Pick a positive direction once (often "right" or "up") and stick with it for the whole problem — the sign then tells you which way something points, without needing an arrow.',
          formula: { name: 'Displacement', words: 'displacement = final position - initial position', tex: '\\Delta x = x_f - x_i', vars: [
            { sym: '\\Delta x', mean: 'displacement' },
            { sym: 'x_f', mean: 'final position' },
            { sym: 'x_i', mean: 'initial position' }
          ] },
          callout: { variant: 'info', text: 'Worked example: a hiker starts at $x_i = 3$ m and ends at $x_f = 10$ m — $\\Delta x = 10 - 3 = +7$ m. Now say she\'d started 3 m on the *other* side of zero instead, at $x_i = -3$ m, ending at the same $x_f = 10$ m: $\\Delta x = 10 - (-3) = +13$ m. Subtracting a negative starting position just adds — same rule as on any number line.' }
        },
        {
          kind: 'numeric',
          difficulty: 'medium',
          prompt: 'A drone starts at $x_i = -12\\text{ m}$ and ends at $x_f = 7\\text{ m}$. What is its displacement, in meters?',
          unit: 'm',
          correct: 19,
          tol: 0.1,
          explain: 'Δx = x_f − x_i = 7 − (−12) = 19 m.',
          hint: 'Δx = x_f − x_i — subtract, don\'t just look at the distance between the numbers on a number line... actually that IS the distance between them.'
        },
        {
          kind: 'mcq',
          difficulty: 'medium',
          prompt: 'Which statement about distance and displacement is always true?',
          options: [
            'Distance is greater than or equal to the magnitude of displacement',
            'Displacement is greater than or equal to distance',
            'They are always equal',
            'Distance can be negative if you walk backward'
          ],
          correct: 0,
          explain: 'The straight-line shortcut (|displacement|) can never be longer than the path you actually walked (distance). They\'re only equal when you move in a straight line without reversing.',
          wrongExplain: {
            1: 'That\'s backwards — the straight-line shortcut (displacement) can never *exceed* the actual path length (distance), since any path length is at least as long as a straight line between its endpoints.',
            2: 'They\'re only equal for straight-line motion with no reversing. The moment you double back even slightly, distance keeps climbing while displacement doesn\'t.'
          }
        },
        {
          kind: 'order',
          difficulty: 'hard',
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
          hook: 'Your GPS reports a 30-minute drive as "40 km, average speed 80 km/h" — a single tidy number that hides ten minutes stuck in traffic followed by a fast, open highway. That one average is real, but it\'s definitely not the whole story.',
          body: 'Speed tells you how fast the odometer is spinning — always positive, no direction attached. **Velocity** is the vector version: displacement per time, direction included.',
          formula: { name: 'Average velocity', words: 'average velocity = displacement / time elapsed', tex: '\\bar{v} = \\frac{\\Delta x}{\\Delta t}', vars: [
            { sym: '\\bar{v}', mean: 'average velocity' },
            { sym: '\\Delta x', mean: 'displacement over the interval' },
            { sym: '\\Delta t', mean: 'time elapsed' }
          ] }
        },
        {
          kind: 'numeric',
          difficulty: 'easy',
          prompt: 'A cyclist rides from $x=0$ to $x=150\\text{ m}$ in 30 s, then stops. What is her average velocity, in m/s?',
          unit: 'm/s',
          correct: 5,
          tol: 0.05,
          explain: 'v̄ = Δx / Δt = 150 / 30 = 5 m/s.'
        },
        {
          kind: 'mcq',
          difficulty: 'medium',
          prompt: 'A runner does a full lap of a 400 m track in 80 s and ends up back where she started. What is her average velocity?',
          options: ['5 m/s', '0.2 m/s', '0 m/s', 'Impossible to say without a stopwatch on each leg'],
          correct: 2,
          explain: 'Average velocity depends on **displacement**, and her displacement for a full lap is zero — start and end point are the same place. Her average *speed*, using distance instead, is 400/80 = 5 m/s.',
          wrongExplain: { 0: 'That 5 m/s is her average *speed* (distance ÷ time). Average *velocity* uses displacement instead, and a full lap means she ends up exactly where she started.' },
          hint: 'Displacement, not distance, goes in the numerator.'
        },
        {
          kind: 'lesson',
          title: 'Instantaneous velocity: zooming all the way in',
          hook: 'A trip computer\'s "avg speed: 65 km/h" hides the fact you did 120 on the open highway and 20 crawling through a work zone — one honest number smoothing over a much messier reality.',
          body: 'Your speedometer, by contrast, never lies like that — it reports **instantaneous velocity**, the average velocity over an interval so short it might as well be a single instant.\n\nPicture that on a position-vs-time ($x$-$t$) graph: if the line curves — because the speed keeps changing — zoom in far enough on any one point and the curve starts looking almost perfectly straight. That straight line, the one that just grazes the curve at that exact point and matches its direction there without crossing through it, is called the **tangent line**. Its slope *is* your instantaneous velocity at that instant.',
          callout: { variant: 'info', text: 'Steeper slope on an $x$-$t$ graph = faster. A flat slope means the object is momentarily at rest.' }
        },
        {
          kind: 'mcq',
          difficulty: 'medium',
          prompt: 'On a position-vs-time graph, a curve bends so its slope keeps getting steeper (while staying positive). What is the object doing?',
          options: ['Moving in the positive direction and speeding up', 'Moving in the negative direction and slowing down', 'Standing still', 'Moving at constant velocity'],
          correct: 0,
          explain: 'A positive, steepening slope means velocity is positive and increasing — the object is moving forward and speeding up.',
          wrongExplain: { 3: 'Constant velocity would look like a *straight* line on an x-t graph (unchanging slope). Here the slope keeps getting steeper, which means velocity itself is increasing, not constant.' }
        },
        {
          kind: 'numeric',
          difficulty: 'hard',
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
      sub: '7 steps · the rate of the rate',
      steps: [
        {
          kind: 'lesson',
          title: 'Acceleration is how velocity itself changes',
          hook: 'A rollercoaster car sits at the very top of the first hill, motionless for a split second — and everyone still screams, because they can feel what\'s coming. Being momentarily still and being unaffected by acceleration are two very different things.',
          body: 'If velocity is how fast position changes, **acceleration** is how fast velocity changes. It\'s measured in m/s² — "meters per second, per second" — and like velocity, it has a sign.',
          formula: { name: 'Average acceleration', words: 'average acceleration = change in velocity / time elapsed', tex: 'a = \\frac{\\Delta v}{\\Delta t}', vars: [
            { sym: 'a', mean: 'average acceleration' },
            { sym: '\\Delta v', mean: 'change in velocity' },
            { sym: '\\Delta t', mean: 'time elapsed' }
          ] }
        },
        {
          kind: 'numeric',
          difficulty: 'easy',
          prompt: 'A skateboarder speeds up from 2 m/s to 11 m/s in 3 s. What is her acceleration, in m/s²?',
          unit: 'm/s²',
          correct: 3,
          tol: 0.05,
          explain: 'a = Δv/Δt = (11 − 2)/3 = 3 m/s².'
        },
        {
          kind: 'mcq',
          difficulty: 'medium',
          prompt: 'Which of these has zero acceleration?',
          options: [
            'A ball rolling at a constant 4 m/s in a straight line',
            'A ball speeding up while rolling downhill',
            'A ball at the top of its bounce, momentarily at rest',
            'A car going around a curve at constant speed'
          ],
          correct: 0,
          explain: 'Constant velocity — same speed, same direction — means Δv = 0, so a = 0. The ball at the top of a bounce still has gravity acting on it (a = -g), and a car turning is changing direction, which is a change in the velocity *vector* even at constant speed.',
          wrongExplain: {
            2: 'Momentarily at rest isn\'t the same as zero acceleration — gravity never stopped pulling on the ball (a = −g the whole time), which is exactly why it doesn\'t stay at rest.',
            3: 'Constant *speed* isn\'t the same as constant *velocity*. Turning changes the direction, so the velocity vector is still changing — meaning there IS an acceleration.'
          },
          hint: 'Acceleration is about anything changing, including direction — not just speed.'
        },
        {
          kind: 'lesson',
          title: 'Speeding up or slowing down: compare the signs',
          hook: 'Slam the brakes while driving forward and you decelerate. Shift into reverse and slam that exact same pedal, and it now speeds you up backward — the pedal never changed, only how it compares to which way you were already going.',
          body: 'That\'s the whole rule: whether an object speeds up or slows down doesn\'t depend on the sign of $a$ alone — it depends on how $a$ compares to $v$.',
          callout: { variant: 'key', text: 'Same sign as velocity → **speeding up**. Opposite sign → **slowing down**, regardless of which direction is "positive."' }
        },
        {
          kind: 'mcq',
          difficulty: 'medium',
          prompt: 'A car moves in the negative direction ($v < 0$) while its acceleration is positive ($a > 0$). What is happening to its speed?',
          options: ['Increasing', 'Decreasing', 'Staying constant', 'Not enough information'],
          correct: 1,
          explain: 'v and a have opposite signs, so the acceleration is opposing the motion — the car is braking. Its speed (the magnitude of v) is decreasing, even though a itself is positive.',
          wrongExplain: { 0: 'A positive acceleration doesn\'t automatically mean speeding up — it depends on how a\'s sign compares to v\'s. Here they\'re opposite, so the acceleration is actually opposing the motion.' }
        },
        {
          kind: 'lesson',
          title: 'Turning the definition into a prediction',
          hook: 'A train driver easing off at a steady rate doesn\'t need to watch the speedometer to know what it\'ll read in eight seconds — the rate of change alone is enough to say so in advance.',
          body: 'Rearranging $a = \\frac{\\Delta v}{\\Delta t}$ does something genuinely useful: instead of *measuring* how velocity changed, you can **predict** what the velocity will be. Multiply both sides by $\\Delta t$ and you get the change in velocity; add it to what you started with, and you have the velocity at any later moment.',
          formula: { name: 'Velocity after constant acceleration', words: 'final velocity = initial velocity + acceleration × time', tex: 'v = v_0 + at', vars: [
            { sym: 'v', mean: 'velocity after time t' },
            { sym: 'v_0', mean: 'initial velocity (the subscript 0 means "at time zero")' },
            { sym: 'a', mean: 'acceleration (constant)' },
            { sym: 't', mean: 'time elapsed' }
          ] },
          callout: { variant: 'info', text: 'Worked example: a cyclist rolling at $v_0 = 4$ m/s speeds up at $a = 2\\text{ m/s}^2$ for $t = 3$ s. Then $v = 4 + (2)(3) = 4 + 6 = 10$ m/s. If instead she were *slowing* at that rate, $a$ would be $-2\\text{ m/s}^2$: $v = 4 + (-2)(3) = -2$ m/s — negative, meaning she\'d have stopped and started rolling backward.' }
        },
        {
          kind: 'numeric',
          difficulty: 'hard',
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
      id: 'kin-checkpoint',
      title: 'Checkpoint: Position, Velocity & Acceleration',
      sub: '6 steps · mixed review',
      steps: [
        {
          kind: 'lesson',
          title: 'Quick check before moving on',
          hook: 'A driving instructor watching a student\'s speedometer and odometer at once is silently tracking three things simultaneously — where the car is, how fast it\'s going, and whether that speed is climbing or falling — exactly the three ideas the last three lessons built.',
          body: 'Five quick questions mixing position/displacement, velocity, and acceleration — before the full equation toolkit and free fall build on top of all three.'
        },
        {
          kind: 'mcq',
          difficulty: 'easy',
          prompt: 'A hiker walks 5 km north, then 5 km south, back to the exact same spot. What is her displacement?',
          options: ['10 km', '5 km', '0 km', 'Depends on how long it took'],
          correct: 2,
          explain: 'Displacement only depends on start and end position — and she ends up exactly where she started, so it\'s zero. (Her *distance* walked was 10 km, a different number.)',
          wrongExplain: { 0: 'That\'s the total distance walked (5 + 5 = 10 km), not displacement — displacement only cares about net change in position.' }
        },
        {
          kind: 'numeric',
          difficulty: 'easy',
          prompt: 'A jogger runs from $x = 10\\text{ m}$ to $x = 90\\text{ m}$ in 20 s. What is her average velocity, in m/s?',
          unit: 'm/s',
          correct: 4,
          tol: 0.1,
          explain: 'v̄ = Δx/Δt = (90 − 10)/20 = 4 m/s.',
          hint: 'Find Δx first, then divide by the time.'
        },
        {
          kind: 'numeric',
          difficulty: 'medium',
          prompt: 'A cart speeds up from 3 m/s to 15 m/s in 4 s. What is its acceleration, in m/s²?',
          unit: 'm/s²',
          correct: 3,
          tol: 0.1,
          explain: 'a = Δv/Δt = (15 − 3)/4 = 3 m/s².',
          hint: 'a = Δv/Δt.'
        },
        {
          kind: 'mcq',
          difficulty: 'medium',
          prompt: 'An object has negative velocity and negative acceleration. What is happening to its speed?',
          options: ['Increasing', 'Decreasing', 'Staying constant', 'Not enough information'],
          correct: 0,
          explain: 'Same sign as velocity means speeding up — here both v and a are negative, so it\'s speeding up in the negative direction.',
          wrongExplain: { 1: 'Decreasing speed happens when v and a have *opposite* signs. Here they\'re both negative — the same sign — which means speeding up, not slowing down.' }
        },
        {
          kind: 'numeric',
          difficulty: 'hard',
          prompt: 'A skater rolls at 2 m/s and accelerates at $1.5\\text{ m/s}^2$ for 6 s. Using $v = v_0 + at$, what is her velocity at the end, in m/s?',
          unit: 'm/s',
          correct: 11,
          tol: 0.2,
          explain: 'v = v₀ + at = 2 + (1.5)(6) = 2 + 9 = 11 m/s. Note this is her velocity at that instant, not her average over the 6 s — she was slower than this the whole way up to it.',
          hint: 'Plug v0 = 2, a = 1.5, t = 6 into v = v0 + at.'
        }
      ]
    },

    /* ============================================================ */
    {
      id: 'kin-equations',
      title: 'Motion with Constant Acceleration',
      sub: '8 steps · putting it all together',
      steps: [
        {
          kind: 'lesson',
          title: 'Three equations, one underlying idea',
          hook: 'A car safety engineer needs a vehicle\'s stopping distance without physically crashing it forty times on a test track. Given just its speed and how hard it can brake, one equation hands over the answer before a single test run happens.',
          body: 'You already have one of these: $v = v_0 + at$, from the acceleration lesson. It answers "how fast?" — but says nothing about **how far**. This lesson adds the two equations that do.\n\nThe first one comes straight from a fact you can see: while accelerating steadily, an object covers the distance it *would* have covered at its starting speed, **plus** an extra bit that grows with the acceleration and with the square of the time.',
          formula: { name: 'Position under constant acceleration', words: 'displacement = initial velocity × time + half × acceleration × time squared', tex: '\\Delta x = v_0 t + \\frac{1}{2}at^2', vars: [
            { sym: '\\Delta x', mean: 'displacement over the interval' },
            { sym: 'v_0', mean: 'initial velocity' },
            { sym: 'a', mean: 'acceleration (constant)' },
            { sym: 't', mean: 'time elapsed' }
          ] },
          callout: { variant: 'info', text: 'Worked example: a skater rolling at $v_0 = 2$ m/s accelerates at $a = 1.5\\text{ m/s}^2$ for $t = 6$ s. The first term is $v_0 t = 2 \\times 6 = 12$ m — how far she\'d have gone without speeding up. The second is $\\frac{1}{2}at^2 = 0.5 \\times 1.5 \\times 6^2 = 0.5 \\times 1.5 \\times 36 = 27$ m — the bonus from accelerating. Total: $\\Delta x = 12 + 27 = 39$ m.' }
        },
        {
          kind: 'numeric',
          difficulty: 'easy',
          prompt: 'A cyclist starts from rest ($v_0 = 0$) and accelerates at $2\\text{ m/s}^2$ for 5 s. Using $\\Delta x = v_0 t + \\frac{1}{2}at^2$, how far does she travel, in meters?',
          unit: 'm',
          correct: 25,
          tol: 0.5,
          explain: 'Starting from rest kills the first term: $v_0 t = 0$. So Δx = ½at² = 0.5 × 2 × 5² = 0.5 × 2 × 25 = 25 m. Whenever something starts from rest, that equation collapses to just ½at².',
          hint: 'v0 = 0, so the whole first term vanishes — you only need ½at².'
        },
        {
          kind: 'lesson',
          title: 'The third one: when nobody tells you the time',
          body: 'Here\'s the situation the first two equations can\'t handle. A car is doing 24 m/s and brakes hard — how far until it stops? You know the speeds and the braking rate, but **not** how many seconds it takes. Both equations you have need $t$.\n\nSo we eliminate it. Solve $v = v_0 + at$ for $t$, substitute into the position equation, and every $t$ cancels out — leaving one equation that never mentions time at all.',
          formula: { name: 'The timeless equation', words: 'final velocity squared = initial velocity squared + 2 × acceleration × displacement', tex: 'v^2 = v_0^2 + 2a\\Delta x', vars: [
            { sym: 'v', mean: 'final velocity' },
            { sym: 'v_0', mean: 'initial velocity' },
            { sym: 'a', mean: 'acceleration (negative when it opposes the motion)' },
            { sym: '\\Delta x', mean: 'displacement over the interval' }
          ] },
          callout: { variant: 'info', text: 'Worked example: a cyclist at $v_0 = 6$ m/s brakes at $a = -3\\text{ m/s}^2$ until she stops, so $v = 0$. Substituting: $0 = 6^2 + 2(-3)\\Delta x$, which is $0 = 36 - 6\\Delta x$. Moving terms over: $6\\Delta x = 36$, so $\\Delta x = 6$ m. Time never entered the calculation.' }
        },
        {
          kind: 'numeric',
          difficulty: 'easy',
          prompt: 'A car brakes from 24 m/s to a stop with a deceleration of $6\\text{ m/s}^2$. Using $v^2 = v_0^2 + 2a\\Delta x$, how far does it travel before stopping, in meters?',
          unit: 'm',
          correct: 48,
          tol: 1,
          explain: '0 = 24² − 2(6)Δx → Δx = 576/12 = 48 m.',
          hint: 'Rearrange for Δx with v = 0: Δx = v0² / (2·|a|).'
        },
        {
          kind: 'mcq',
          difficulty: 'medium',
          prompt: 'A car\'s braking distance depends on the square of its initial speed. If the speed doubles, what happens to the braking distance (same deceleration)?',
          options: ['It doubles', 'It triples', 'It quadruples', 'It stays the same'],
          correct: 2,
          explain: 'Since Δx ∝ v0², doubling v0 multiplies the stopping distance by 2² = 4. This is exactly why highway speed limits matter so much more than they seem to.',
          wrongExplain: { 0: 'That\'s what would happen if distance scaled directly with speed — but it scales with speed *squared*, so doubling speed quadruples the distance instead.' }
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
          difficulty: 'medium',
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
          difficulty: 'hard',
          prompt: 'Which single change would shrink a car\'s total stopping distance the most?',
          options: [
            'Halving the reaction time',
            'Halving the initial speed',
            'Doubling the braking deceleration',
            'They\'d all help equally'
          ],
          correct: 1,
          explain: 'Reaction distance is linear in speed, and braking deceleration only helps linearly too — but braking distance is proportional to speed **squared**. Halving your speed cuts that term to a quarter, which usually dominates the total.',
          wrongExplain: { 2: 'Doubling deceleration does help — it halves the braking-distance term — but that term already depends on speed *squared*, so halving speed cuts it to a quarter, a bigger win.' }
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
          hook: 'Drop a hammer and a feather at the same time and every instinct says the hammer wins easily. In 1971, an Apollo 15 astronaut did exactly that on the airless Moon, on live TV — and they hit the ground at the same instant.',
          body: 'Drop anything near Earth\'s surface and — ignoring air resistance — it accelerates downward at a constant $g \\approx 9.81\\text{ m/s}^2$, no matter how heavy it is. That last part surprises people every time.',
          formula: { name: 'Free fall from rest', words: 'height fallen = ½ × gravity × time² — and speed = gravity × time', tex: 'h = \\frac{1}{2} g t^2 \\qquad v = g t', vars: [
            { sym: 'h', mean: 'height fallen' },
            { sym: 'g', mean: 'gravitational acceleration (≈9.81 m/s² on Earth)' },
            { sym: 't', mean: 'time since release' },
            { sym: 'v', mean: 'speed after falling for time t' }
          ] },
          callout: { variant: 'info', text: 'This is just the constant-acceleration equations from the last lesson, with $a=g$ and $v_0=0$.' }
        },
        {
          kind: 'mcq',
          difficulty: 'easy',
          prompt: 'You drop a bowling ball and a tennis ball from the same height at the same time, in a vacuum (no air resistance). Which hits the ground first?',
          options: ['The bowling ball, because it\'s heavier', 'The tennis ball, because it\'s lighter', 'They land at the same time', 'Depends on the exact height'],
          correct: 2,
          explain: 'In free fall, acceleration doesn\'t depend on mass — a heavier object needs more force to accelerate it, but gravity conveniently supplies exactly that much more force. Galileo demonstrated this centuries before we had vacuum chambers to prove it cleanly.',
          wrongExplain: { 0: 'It feels true because a heavier object needs more force to accelerate — but gravity supplies exactly that much more force, so the extra mass cancels out and both fall at the same rate.' }
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
          difficulty: 'medium',
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
          difficulty: 'medium',
          prompt: 'Same drop — 45 m on Earth. What is its impact speed, in m/s?',
          unit: 'm/s',
          correct: 29.7,
          tol: 0.4,
          decimals: 1,
          explain: 'v = gt ≈ 9.81 × 3.02 ≈ 29.7 m/s (or directly: v = √(2gh)).'
        },
        {
          kind: 'mcq',
          difficulty: 'hard',
          prompt: 'The same object is dropped from the same height, but on the Moon ($g \\approx 1.62\\text{ m/s}^2$) instead of Earth. What happens to the fall time?',
          options: ['It gets much shorter', 'It gets much longer', 'It stays exactly the same', 'It becomes zero'],
          correct: 1,
          explain: 'Fall time scales as $1/\\sqrt{g}$. Since the Moon\'s gravity is about 6× weaker, the fall takes about √6 ≈ 2.5× longer.',
          wrongExplain: { 2: 'Mass not mattering for fall time doesn\'t mean gravity\'s *strength* doesn\'t matter too — g itself is smaller on the Moon, so the acceleration is weaker and the fall takes longer.' }
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
          hook: 'You\'ve watched a phone\'s live speed graph during a drive and known instantly whether you were speeding up, cruising, or braking — before glancing at a single number. This lesson turns that instinct into a precise reading of position and velocity graphs.',
          body: 'You can read almost everything about a motion straight off its graphs — no equation required.',
          callout: { variant: 'key', text: 'On an $x$-$t$ graph: **slope = velocity**. On a $v$-$t$ graph: **slope = acceleration**, and **area under the curve = displacement**.' }
        },
        {
          kind: 'mcq',
          difficulty: 'easy',
          prompt: 'A position-vs-time graph is a straight line with a constant negative slope. What does this describe?',
          options: [
            'Constant velocity in the negative direction',
            'Constant acceleration in the negative direction',
            'An object speeding up',
            'An object at rest'
          ],
          correct: 0,
          explain: 'A straight line means the slope — the velocity — never changes. A negative, unchanging slope means constant velocity in the negative direction.',
          wrongExplain: { 1: 'A *constant* slope on an x-t graph means velocity isn\'t changing — that\'s constant velocity, not constant acceleration. Acceleration would show up as the slope itself curving.' }
        },
        {
          kind: 'numeric',
          difficulty: 'medium',
          prompt: 'On a velocity-vs-time graph, an object holds a constant 12 m/s for 5 s. The area under that segment equals its displacement. What is that area, in meters?',
          unit: 'm',
          correct: 60,
          tol: 1,
          explain: 'The region is a rectangle: area = 12 m/s × 5 s = 60 m — matching x = v·t exactly, since area under a v-t graph is displacement.',
          hint: 'For constant velocity, the area under the v-t graph is just a rectangle: height × width.'
        },
        {
          kind: 'order',
          difficulty: 'hard',
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
    },

    /* ============================================================ */
    /* Practice lesson: `pool` + `draw` instead of `steps`, so every run
       draws a fresh sample. Pool mix is 60/30/10 easy/medium/hard (12/6/2),
       and each run keeps that ratio at 6/3/1. */
    {
      id: 'kin-practice',
      title: 'Equation Practice',
      sub: 'endless drill · 10 fresh questions per run',
      draw: { easy: 6, medium: 3, hard: 1 },
      intro: {
        kind: 'lesson',
        title: 'Reps, not revelations',
        hook: 'Nobody learned to drive by reading about clutches. At some point the only thing left is to do it enough times that picking the right equation stops feeling like a decision and starts feeling like a reflex.',
        body: 'This is a drill, not a new lesson — every equation here already appeared earlier in the chapter. Ten questions get drawn fresh from a bigger bank each time you open it, so you can run it as many times as you like and keep getting a different set.\n\nThe 🧮 button at the top of the screen opens a calculator with **x²** and **√** keys, which most of these need.',
        callout: { variant: 'key', text: 'Your four tools, and the one quantity each leaves out: $v = v_0 + at$ (no distance), $\\Delta x = v_0 t + \\frac{1}{2}at^2$ (no final velocity), $v^2 = v_0^2 + 2a\\Delta x$ (no time), and $\\bar{v} = \\frac{\\Delta x}{\\Delta t}$ for average velocity. Pick the one that already has what you were given — and skips what you weren\'t.' }
      },
      pool: [
        /* ---- easy (12) ---- */
        {
          kind: 'numeric',
          difficulty: 'easy',
          prompt: 'A tram starts at rest and accelerates at $1.2\\text{ m/s}^2$ for 10 s. What is its velocity at the end, in m/s?',
          unit: 'm/s',
          correct: 12,
          tol: 0.2,
          explain: 'v = v₀ + at = 0 + (1.2)(10) = 12 m/s. Starting from rest means v₀ = 0, so the answer is just a·t.',
          hint: 'v = v0 + at, with v0 = 0.'
        },
        {
          kind: 'numeric',
          difficulty: 'easy',
          prompt: 'A runner covers 120 m in 15 s. What is her average velocity, in m/s?',
          unit: 'm/s',
          correct: 8,
          tol: 0.1,
          explain: 'v̄ = Δx/Δt = 120/15 = 8 m/s. Average velocity never cares what happened in between — only the net displacement and the total time.',
          hint: 'Average velocity is displacement divided by time.'
        },
        {
          kind: 'numeric',
          difficulty: 'easy',
          prompt: 'A skateboarder rolling at 3 m/s accelerates at $2\\text{ m/s}^2$ for 4 s. What is her final velocity, in m/s?',
          unit: 'm/s',
          correct: 11,
          tol: 0.2,
          explain: 'v = v₀ + at = 3 + (2)(4) = 3 + 8 = 11 m/s.',
          hint: 'v = v0 + at.'
        },
        {
          kind: 'numeric',
          difficulty: 'easy',
          prompt: 'A stone is dropped from rest and falls for 2 s on Earth ($g = 9.81\\text{ m/s}^2$). How far does it fall, in meters?',
          unit: 'm',
          correct: 19.6,
          tol: 0.4,
          decimals: 1,
          explain: 'h = ½gt² = 0.5 × 9.81 × 2² = 0.5 × 9.81 × 4 ≈ 19.6 m.',
          hint: 'Dropped from rest, so h = ½gt².'
        },
        {
          kind: 'numeric',
          difficulty: 'easy',
          prompt: 'A car speeds up from 8 m/s to 20 m/s in 6 s. What is its acceleration, in m/s²?',
          unit: 'm/s²',
          correct: 2,
          tol: 0.1,
          explain: 'a = Δv/Δt = (20 − 8)/6 = 12/6 = 2 m/s². Acceleration is always the *change* in velocity per second, never the velocity itself.',
          hint: 'a = Δv/Δt — find the change in velocity first.'
        },
        {
          kind: 'mcq',
          difficulty: 'easy',
          prompt: 'You need the displacement of an object, and you know $v_0$, $a$, and $t$ — but not the final velocity. Which equation fits?',
          options: [
            '$\\Delta x = v_0 t + \\frac{1}{2}at^2$',
            '$v = v_0 + at$',
            '$v^2 = v_0^2 + 2a\\Delta x$',
            '$a = \\frac{\\Delta v}{\\Delta t}$'
          ],
          correct: 0,
          explain: 'That equation contains exactly $v_0$, $a$, $t$ and $\\Delta x$ — everything you have plus the one thing you want, and no final velocity anywhere. That\'s always how you pick.',
          wrongExplain: { 2: 'That one has no $t$ in it, which sounds convenient — but it *does* need the final velocity $v$, and you weren\'t given one.' }
        },
        {
          kind: 'numeric',
          difficulty: 'easy',
          prompt: 'A cyclist starts from rest and accelerates at $1.5\\text{ m/s}^2$ for 4 s. How far does she travel, in meters?',
          unit: 'm',
          correct: 12,
          tol: 0.3,
          explain: 'From rest, Δx = ½at² = 0.5 × 1.5 × 4² = 0.5 × 1.5 × 16 = 12 m.',
          hint: 'v0 = 0, so only the ½at² term survives.'
        },
        {
          kind: 'mcq',
          difficulty: 'easy',
          prompt: 'An object moves with constant velocity. What is its acceleration?',
          options: ['Zero', 'Equal to its velocity', 'Constant but non-zero', 'Impossible to say'],
          correct: 0,
          explain: 'Constant velocity means Δv = 0 over any interval, so a = Δv/Δt = 0. Moving fast and accelerating are completely separate things — a car cruising at 30 m/s has zero acceleration.',
          wrongExplain: { 1: 'Velocity and acceleration are independent — an object can be fast with zero acceleration (steady cruising) or momentarily still with large acceleration (top of a bounce).' }
        },
        {
          kind: 'numeric',
          difficulty: 'easy',
          prompt: 'A train travelling at 30 m/s decelerates at $2\\text{ m/s}^2$. What is its velocity after 5 s, in m/s?',
          unit: 'm/s',
          correct: 20,
          tol: 0.3,
          explain: 'Decelerating means a is negative: v = 30 + (−2)(5) = 30 − 10 = 20 m/s.',
          hint: 'Deceleration makes a negative when v0 is positive.'
        },
        {
          kind: 'mcq',
          difficulty: 'easy',
          prompt: 'A ball is thrown straight up. At the exact top of its flight, what are its velocity and acceleration?',
          options: [
            'Velocity zero, acceleration $g$ downward',
            'Velocity zero, acceleration zero',
            'Velocity $g$ upward, acceleration zero',
            'Both still pointing upward'
          ],
          correct: 0,
          explain: 'The velocity passes through zero as the ball reverses — but gravity never switched off, so the acceleration is still $g$ downward the entire time. That is exactly why it doesn\'t hang there.',
          wrongExplain: { 1: 'If acceleration were also zero at the top, the ball would simply stay there forever. Gravity keeps pulling throughout — only the *velocity* is momentarily zero.' }
        },
        {
          kind: 'numeric',
          difficulty: 'easy',
          prompt: 'A jogger runs from $x_i = 5\\text{ m}$ to $x_f = 65\\text{ m}$ in 12 s. What is his average velocity, in m/s?',
          unit: 'm/s',
          correct: 5,
          tol: 0.1,
          explain: 'Δx = 65 − 5 = 60 m, so v̄ = 60/12 = 5 m/s. Note the displacement is 60 m, not 65 — position and displacement aren\'t the same thing.',
          hint: 'Find Δx = x_f − x_i first, then divide by the time.'
        },
        {
          kind: 'mcq',
          difficulty: 'easy',
          prompt: 'On a velocity-vs-time graph, what does the slope of the line represent?',
          options: ['Acceleration', 'Displacement', 'Position', 'Average speed'],
          correct: 0,
          explain: 'Slope is rise over run — here, change in velocity over change in time, which is precisely a = Δv/Δt. (The *area* under that same graph is the displacement.)',
          wrongExplain: { 1: 'Displacement is the **area** under a v-t graph, not its slope. Slope gives the rate the velocity is changing — the acceleration.' }
        },

        /* ---- medium (6) ---- */
        {
          kind: 'numeric',
          difficulty: 'medium',
          prompt: 'A motorcycle at 20 m/s brakes at $4\\text{ m/s}^2$ until it stops. How far does it travel while braking, in meters?',
          unit: 'm',
          correct: 50,
          tol: 1,
          explain: 'No time given, so use v² = v₀² + 2aΔx: 0 = 20² + 2(−4)Δx → 0 = 400 − 8Δx → Δx = 400/8 = 50 m.',
          hint: 'You have both velocities and the acceleration but no time — that points at one specific equation.'
        },
        {
          kind: 'numeric',
          difficulty: 'medium',
          prompt: 'A car rolling at 5 m/s accelerates at $3\\text{ m/s}^2$ for 4 s. How far does it travel, in meters?',
          unit: 'm',
          correct: 44,
          tol: 1,
          explain: 'Δx = v₀t + ½at² = 5(4) + 0.5(3)(4²) = 20 + 24 = 44 m. The first term is the distance from its starting speed; the second is the bonus from accelerating.',
          hint: 'Both terms matter here — v0 isn\'t zero this time.'
        },
        {
          kind: 'numeric',
          difficulty: 'medium',
          prompt: 'An object is dropped from rest from a height of 20 m on Earth ($g = 9.81\\text{ m/s}^2$). How long does it take to land, in seconds?',
          unit: 's',
          correct: 2.02,
          tol: 0.06,
          decimals: 2,
          explain: 'From h = ½gt², solve for t: t = √(2h/g) = √(2 × 20 / 9.81) = √4.077 ≈ 2.02 s.',
          hint: 'Rearrange h = ½gt² for t — you\'ll need a square root.'
        },
        {
          kind: 'mcq',
          difficulty: 'medium',
          prompt: 'A car has velocity $v = -12$ m/s and acceleration $a = -3\\text{ m/s}^2$. What is happening to its speed?',
          options: ['Increasing', 'Decreasing', 'Constant', 'Not enough information'],
          correct: 0,
          explain: 'Same sign as the velocity means speeding up — both are negative here, so it is gaining speed in the negative direction. The sign of $a$ on its own never settles this; only its sign *relative to* $v$ does.',
          wrongExplain: { 1: 'A negative acceleration doesn\'t automatically mean slowing down. Slowing needs $a$ and $v$ to have *opposite* signs — here they match, so it speeds up.' }
        },
        {
          kind: 'numeric',
          difficulty: 'medium',
          prompt: 'A sprinter accelerates from rest to 9 m/s over a distance of 13.5 m. What is her acceleration, in m/s²?',
          unit: 'm/s²',
          correct: 3,
          tol: 0.1,
          explain: 'No time given, so v² = v₀² + 2aΔx: 9² = 0 + 2a(13.5) → 81 = 27a → a = 3 m/s².',
          hint: 'You know both velocities and the distance, but not the time.'
        },
        {
          kind: 'order',
          difficulty: 'medium',
          prompt: 'Four cars each brake to a stop at the same deceleration. Rank them by braking distance, from *shortest* to *longest*.',
          items: [
            'Starts at 10 m/s',
            'Starts at 15 m/s',
            'Starts at 20 m/s',
            'Starts at 30 m/s'
          ],
          explain: 'Braking distance is $\\Delta x = v_0^2 / (2|a|)$ — it grows with the **square** of the starting speed, so the ordering follows the speeds, but the gaps widen fast. The 30 m/s car needs nine times the distance of the 10 m/s one, not three times.'
        },

        /* ---- hard (2) ---- */
        {
          kind: 'numeric',
          difficulty: 'hard',
          prompt: 'A driver going 20 m/s reacts for 0.6 s before braking at $5\\text{ m/s}^2$. What is the total stopping distance, in meters? (reaction distance + braking distance)',
          unit: 'm',
          correct: 52,
          tol: 1,
          explain: 'Two phases. Reaction: constant velocity, so 20 × 0.6 = 12 m. Braking: v² = v₀² + 2aΔx gives Δx = 20²/(2×5) = 400/10 = 40 m. Total = 12 + 40 = 52 m.',
          hint: 'Handle the two phases separately — no acceleration during the reaction time.'
        },
        {
          kind: 'numeric',
          difficulty: 'hard',
          prompt: 'A ball is thrown straight up at 15 m/s ($g = 9.81\\text{ m/s}^2$). How high does it rise above the launch point, in meters?',
          unit: 'm',
          correct: 11.5,
          tol: 0.4,
          decimals: 1,
          explain: 'At the highest point v = 0. Using v² = v₀² + 2aΔx with a = −9.81: 0 = 15² − 2(9.81)Δx → Δx = 225/19.62 ≈ 11.5 m.',
          hint: 'The one thing you know about the top of the flight is that the velocity there is zero.'
        }
      ]
    },

    /* ============================================================ */
    {
      id: 'kin-playground',
      title: 'Free-Fall Playground',
      sub: '2 steps · unlimited practice, no grade',
      steps: [
        {
          kind: 'lesson',
          title: 'One last thing — just for fun',
          body: 'Every idea from this chapter — position, velocity, acceleration, and the constant-acceleration equations — is really just one skill: given a world, a height, and a launch velocity, predict exactly when and how fast something hits the ground.\n\nBelow is an open sandbox version of that skill. Match the glowing target, score a point, get a fresh (slightly tougher) one. There\'s no pass/fail here and no limit on rounds — play as long as it\'s fun.',
          callout: { variant: 'key', text: 'Tip: a positive launch velocity throws it **up** first — it still has to come back down past your starting height before it reaches the ground.' }
        },
        {
          kind: 'sim',
          prompt: 'Match the target. Beat your score.',
          simId: 'freeFallPlayground',
          note: 'Positive velocity = thrown up, negative = thrown down, zero = simply dropped.'
        }
      ]
    }
  );

})(typeof window !== 'undefined' ? window : globalThis);
