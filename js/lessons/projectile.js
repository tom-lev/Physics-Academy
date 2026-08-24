/* ============================================================
   lessons/projectile.js — Chapter 2: 2D Motion & Projectiles
   Five lessons: splitting motion into x/y, velocity components
   from a launch angle, the time/height/range formulas, how range
   depends on angle, and putting it together with obstacles and
   the target-practice sim. Every graded numeric answer routes
   through PA.kin so the sims and the answer keys can never disagree.
   ============================================================ */
(function (root) {
  'use strict';

  var chapter = root.PA.curriculum.findChapter('projectile');
  if (!chapter) return;

  chapter.lessons.push(

    /* ============================================================ */
    {
      id: 'proj-independence',
      title: 'Two Motions, One Object',
      sub: '6 steps · the core insight',
      steps: [
        {
          kind: 'lesson',
          title: 'The x-motion and the y-motion don\'t know about each other',
          prereq: 'This chapter builds directly on Chapter 1 (free fall, velocity) and the toolkit\'s vector components — including evaluating $\\sin\\theta$/$\\cos\\theta$ on a calculator, which shows up in almost every formula from here on.',
          hook: 'A basketball player releases a shot on a wild diagonal arc, and somehow it drops through the hoop anyway, over and over in practice. No one is solving equations mid-shot — but the exact math you\'re about to learn is quietly running underneath every one of those arcs.',
          body: 'Once something moves in two dimensions — a thrown ball, a kicked soccer ball, a launched rocket — its motion looks complicated. The trick that makes it simple: split it into a **horizontal story** and a **vertical story**, and handle them completely separately.\n\nHorizontally, nothing pushes the object once it leaves your hand (ignore air resistance), so it moves at **constant velocity**. Vertically, gravity pulls down the whole time, so it moves with **constant acceleration** $g$ — exactly the free fall you already know from Chapter 1.',
          callout: { variant: 'key', text: 'The only thing the x-motion and y-motion share is **time**. They tick along on the same clock, but neither one affects the other.' }
        },
        {
          kind: 'mcq',
          difficulty: 'easy',
          prompt: 'A ball is thrown through the air (ignore air resistance). While it is in flight, what is its horizontal acceleration?',
          options: ['0', '$g$, downward', '$g$, upward', 'Depends on the launch angle'],
          correct: 0,
          explain: 'Gravity is a purely vertical force — it never pushes sideways. With no horizontal force acting on it, the ball\'s horizontal acceleration is zero, so its horizontal velocity never changes during the flight.',
          wrongExplain: { 1: '$g$ is a *vertical* acceleration — it only ever acts along the vertical direction. Nothing pushes or pulls the ball sideways, so the horizontal acceleration is exactly zero, whatever the launch angle.' }
        },
        {
          kind: 'lesson',
          title: 'Galileo\'s two balls',
          body: 'Here\'s the classic demonstration of just how separate the two stories are: drop one ball straight down, and at the exact same instant, launch a second ball **horizontally** from the same height. Air resistance aside, they hit the ground at the *exact same moment* — even though one of them also traveled a long way sideways.',
          callout: { variant: 'info', text: 'The horizontal velocity only decides *how far sideways* the second ball ends up. It has zero effect on *how long the fall takes* — that\'s decided entirely by the vertical story, which is identical for both balls.' }
        },
        {
          kind: 'mcq',
          difficulty: 'medium',
          prompt: 'A ball rolls off a table and falls to the floor at the same instant an identical ball is dropped straight down from the same height. Which one lands first?',
          options: ['The one that rolled off — it has extra speed', 'The one that was dropped — it fell straighter', 'They land at the same time', 'It depends on how fast the first ball was rolling'],
          correct: 2,
          explain: 'Both balls start with the same vertical velocity (zero) and fall under the same $g$. Their vertical stories are identical, so they land simultaneously — no matter how fast the first one was moving horizontally.',
          wrongExplain: { 0: 'Horizontal speed doesn\'t affect how long the fall takes — only the vertical story (starting vertical velocity and $g$) decides fall time, and that\'s identical for both balls.' },
          hint: 'Ask only about the vertical story — horizontal speed doesn\'t enter into it at all.'
        },
        {
          kind: 'numeric',
          difficulty: 'medium',
          prompt: 'A ball rolls off a table with a horizontal speed of 15 m/s and falls a height of 20 m ($g = 9.81\\text{ m/s}^2$). Since it starts with zero *vertical* velocity, this is just free fall — how long is it in the air, in seconds?',
          unit: 's',
          correct: 2.02,
          tol: 0.05,
          decimals: 2,
          explain: 't = √(2h/g) = √(2 × 20 / 9.81) ≈ 2.02 s — exactly the free-fall time formula from Chapter 1. Notice the 15 m/s never entered the calculation.',
          hint: 'Vertical motion only: t = √(2h/g), same as dropping something from rest.'
        },
        {
          kind: 'numeric',
          difficulty: 'hard',
          prompt: 'Same ball — rolls off at 15 m/s horizontally, falls for about 2.02 s. Since horizontal velocity is constant, how far does it travel horizontally before landing, in meters?',
          unit: 'm',
          correct: 30.3,
          tol: 0.6,
          decimals: 1,
          explain: 'x = vx · t = 15 × 2.02 ≈ 30.3 m. The horizontal distance uses the *same* time the vertical drop took — that shared clock is the only link between the two motions.',
          hint: 'x = vx · t, using the time you just found.'
        }
      ]
    },

    /* ============================================================ */
    {
      id: 'proj-components',
      title: 'Launch Angle & Velocity Components',
      sub: '6 steps · splitting the launch velocity',
      steps: [
        {
          kind: 'lesson',
          title: 'Same trick as vector components, new context',
          hook: 'A soccer player choosing between a low, fast free-kick and a high, looping one over the wall is unconsciously trading horizontal speed for vertical speed — the same launch effort, just split differently depending on the angle.',
          body: 'When something launches at an angle $\\theta$ above the horizontal — a cannonball, a soccer kick, a basketball shot — its initial velocity $v_0$ is a vector, and it splits into components exactly the way you learned in the vectors lesson: $A_x = A\\cos\\theta$, $A_y = A\\sin\\theta$.\n\nHere, $v_{0x}$ stays constant for the entire flight (nothing changes it). $v_{0y}$ is just the *starting* vertical velocity — gravity immediately starts eating into it.',
          formula: { name: 'Launch velocity components', words: 'horizontal launch velocity = launch speed × cos(angle) — vertical launch velocity = launch speed × sin(angle)', tex: 'v_{0x} = v_0\\cos\\theta \\qquad v_{0y} = v_0\\sin\\theta', vars: [
            { sym: 'v_0', mean: 'launch speed' },
            { sym: '\\theta', mean: 'launch angle above horizontal' },
            { sym: 'v_{0x}', mean: 'horizontal velocity component (stays constant)' },
            { sym: 'v_{0y}', mean: 'vertical velocity component (gravity acts on this one)' }
          ] }
        },
        {
          kind: 'numeric',
          difficulty: 'easy',
          prompt: 'A ball is launched at $v_0 = 25\\text{ m/s}$, at $30°$ above horizontal. What is its horizontal velocity component $v_{0x}$, in m/s?',
          unit: 'm/s',
          correct: 21.65,
          tol: 0.4,
          decimals: 2,
          explain: 'v0x = v0 cos θ = 25 × cos(30°) = 25 × 0.866 ≈ 21.65 m/s.',
          hint: 'v0x = v0 cos θ.'
        },
        {
          kind: 'numeric',
          difficulty: 'medium',
          prompt: 'Same launch — 25 m/s at 30°. What is its vertical velocity component $v_{0y}$, in m/s?',
          unit: 'm/s',
          correct: 12.5,
          tol: 0.3,
          explain: 'v0y = v0 sin θ = 25 × sin(30°) = 25 × 0.5 = 12.5 m/s.',
          hint: 'v0y = v0 sin θ.'
        },
        {
          kind: 'mcq',
          difficulty: 'medium',
          prompt: 'For a fixed launch speed $v_0$, which launch angle gives the *largest* horizontal velocity component $v_{0x}$?',
          options: ['0° (straight along the ground)', '45°', '90° (straight up)', 'It\'s the same at every angle'],
          correct: 0,
          explain: '$v_{0x} = v_0\\cos\\theta$, and cosine is largest (equal to 1) at 0°. As the launch gets steeper, more and more of $v_0$ gets redirected into the vertical component instead.',
          wrongExplain: { 1: '45° turns out to be special for *range* (in a later lesson), not for maximizing a single component. $\\cos\\theta$ — which controls $v_{0x}$ — is actually largest at 0° and only shrinks as the angle steepens.' }
        },
        {
          kind: 'lesson',
          title: 'One launch speed, redistributed',
          body: 'Think of $v_0$ as a fixed budget that gets split between "sideways" and "upward" depending on the angle. A shallow launch spends almost the whole budget on $v_{0x}$; a steep launch spends most of it on $v_{0y}$.',
          callout: { variant: 'key', text: 'As $\\theta$ increases from 0° to 90°, $v_{0x} = v_0\\cos\\theta$ shrinks while $v_{0y} = v_0\\sin\\theta$ grows — same $v_0$, just divided differently between the two directions.' }
        },
        {
          kind: 'mcq',
          difficulty: 'hard',
          prompt: 'A ball is launched at exactly 45° above horizontal. How do its $v_{0x}$ and $v_{0y}$ compare?',
          options: ['$v_{0x} > v_{0y}$', '$v_{0x} < v_{0y}$', '$v_{0x} = v_{0y}$', 'Can\'t tell without knowing $v_0$'],
          correct: 2,
          explain: 'At 45°, cos(45°) = sin(45°) ≈ 0.707, so the two components come out exactly equal, no matter what $v_0$ is.',
          wrongExplain: { 0: 'At exactly 45°, cos(45°) and sin(45°) are equal (≈0.707) — so neither component actually comes out bigger than the other.' }
        }
      ]
    },

    /* ============================================================ */
    {
      id: 'proj-flight',
      title: 'Time of Flight, Max Height & Range',
      sub: '7 steps · the three headline numbers',
      steps: [
        {
          kind: 'lesson',
          title: 'The vertical story sets the clock',
          hook: 'A quarterback\'s long pass, a fountain jet, a stone skipped off a bridge — every one of them climbs, pauses for an instant at the very top, and falls back down in exactly the same time it took to rise.',
          body: 'For a projectile launched and landing at the same height, the vertical motion is a mirror image of throwing something straight up: it climbs, decelerates to a stop at the peak, then falls back down — taking exactly as long to fall as it took to rise. So the total time of flight is *twice* the time to reach the peak.',
          formula: { name: 'Time of flight', words: 'total time of flight = 2 × vertical launch velocity / gravity', tex: 'T = \\frac{2v_{0y}}{g} = \\frac{2v_0\\sin\\theta}{g}', vars: [
            { sym: 'T', mean: 'total time of flight' },
            { sym: 'v_{0y}', mean: 'initial vertical velocity component' },
            { sym: 'g', mean: 'gravitational acceleration' }
          ] },
          callout: { variant: 'info', text: 'At the peak, the *vertical* velocity is momentarily zero — but the horizontal velocity never stops. That\'s why the path bends into a smooth arc instead of coming to a dead stop.' }
        },
        {
          kind: 'numeric',
          difficulty: 'easy',
          prompt: 'A projectile launches at $v_0 = 30\\text{ m/s}$, at $53°$ above horizontal ($g = 9.81\\text{ m/s}^2$). What is its total time of flight, in seconds?',
          unit: 's',
          correct: 4.88,
          tol: 0.1,
          decimals: 2,
          explain: 'v0y = 30 sin(53°) ≈ 23.96 m/s. T = 2v0y/g = 2 × 23.96 / 9.81 ≈ 4.88 s.',
          hint: 'First find v0y = v0 sin θ, then T = 2v0y/g.'
        },
        {
          kind: 'numeric',
          difficulty: 'medium',
          prompt: 'Same launch (30 m/s at 53°). What is its maximum height, in meters? (Same idea as "peak height" from Chapter 1 free fall, using $v_{0y}$ as the launch speed.)',
          unit: 'm',
          correct: 29.3,
          tol: 0.6,
          decimals: 1,
          explain: 'H = v0y² / (2g) = 23.96² / (2 × 9.81) ≈ 29.3 m — the same formula as peak height for something thrown straight up, just using v0y instead of v0.',
          hint: 'H = v0y² / (2g).'
        },
        {
          kind: 'lesson',
          title: 'Range: how far horizontally',
          hook: 'A slugger\'s home-run ball and a golfer\'s drive off the tee both eventually ask the exact same question: how far does this thing actually travel before it comes back down?',
          body: 'Range is just the horizontal-motion story applied over the full time of flight: constant velocity $v_{0x}$, for a duration $T$. Substituting $T$ in gives a single formula in terms of $v_0$ and $\\theta$ alone.',
          formula: { name: 'Range', words: 'horizontal range = horizontal launch velocity × time of flight', tex: 'R = v_{0x}\\,T = \\frac{v_0^2\\sin(2\\theta)}{g}', vars: [
            { sym: 'R', mean: 'horizontal range' },
            { sym: 'v_0, \\theta', mean: 'launch speed and angle' },
            { sym: 'g', mean: 'gravitational acceleration' }
          ] }
        },
        {
          kind: 'numeric',
          difficulty: 'medium',
          prompt: 'Same launch again (30 m/s at 53°, time of flight ≈ 4.88 s). What is its range, in meters?',
          unit: 'm',
          correct: 88.2,
          tol: 1.5,
          decimals: 1,
          explain: 'v0x = 30 cos(53°) ≈ 18.05 m/s. R = v0x · T ≈ 18.05 × 4.88 ≈ 88.2 m — matches v0²sin(2θ)/g = 30² × sin(106°) / 9.81 as well.',
          hint: 'R = v0x · T, using v0x = v0 cos θ.'
        },
        {
          kind: 'sim',
          prompt: 'Dial in a launch speed and angle to clear the wall and land the shot in the target zone.',
          simId: 'projectile',
          args: { speed: 20, angle: 45, wallX: 40, wallHeight: 6, targetXMin: 70, targetXMax: 85 },
          note: 'Watch how the readouts (time of flight, max height, range) change as you drag the sliders — they\'re the exact same formulas you just used by hand.'
        },
        {
          kind: 'mcq',
          difficulty: 'hard',
          prompt: 'At what point during a projectile\'s flight is its overall speed (not just vertical speed) at a minimum?',
          options: ['Right at launch', 'At the peak of its arc', 'Just before it lands', 'Speed stays constant the whole flight'],
          correct: 1,
          explain: 'Overall speed is √(vx² + vy²). vx never changes, but vy shrinks to exactly zero at the peak — so that\'s the one moment total speed equals just vx, its smallest value anywhere along the path.',
          wrongExplain: { 2: 'Just before landing, the vertical speed has built back up to nearly its launch value — that\'s close to the *fastest* point of the flight, not the slowest.' },
          hint: 'Speed combines both components: think about which component vanishes, and where.'
        }
      ]
    },

    /* ============================================================ */
    {
      id: 'proj-checkpoint',
      title: 'Checkpoint: Splitting the Motion',
      sub: '5 steps · mixed review',
      steps: [
        {
          kind: 'lesson',
          title: 'Quick check before moving on',
          hook: 'A golf commentator watching a drive can tell you, almost by instinct, roughly how long it\'ll stay airborne and about where it\'ll land — the exact same horizontal/vertical split the last three lessons just made precise.',
          body: 'Five quick questions mixing the horizontal/vertical split, velocity components, and time/height/range before we chase the angle that maximizes range.'
        },
        {
          kind: 'mcq',
          difficulty: 'easy',
          prompt: 'Two identical balls launch horizontally from the same height and the same instant — one at 5 m/s, one at 15 m/s. Which lands first?',
          options: ['The 5 m/s ball', 'The 15 m/s ball', 'They land at the same time', 'Depends on the launch height'],
          correct: 2,
          explain: 'Both start with zero vertical velocity and fall under the same $g$ — identical vertical stories mean identical fall times, no matter the horizontal speed.',
          wrongExplain: { 1: 'Horizontal speed has zero effect on fall time — only the vertical story (starting vertical velocity and $g$) does, and that\'s the same for both.' }
        },
        {
          kind: 'numeric',
          difficulty: 'medium',
          prompt: 'A ball launches at $v_0 = 16\\text{ m/s}$, at $60°$ above horizontal. What is its vertical velocity component $v_{0y}$, in m/s?',
          unit: 'm/s',
          correct: 13.86,
          tol: 0.3,
          decimals: 2,
          explain: 'v0y = v0 sin θ = 16 × sin(60°) ≈ 16 × 0.866 ≈ 13.86 m/s.',
          hint: 'v0y = v0 sin θ.'
        },
        {
          kind: 'numeric',
          difficulty: 'medium',
          prompt: 'Same launch (16 m/s at 60°, $v_{0y} ≈ 13.86$ m/s, $g = 9.81\\text{ m/s}^2$). What is its total time of flight, in seconds?',
          unit: 's',
          correct: 2.82,
          tol: 0.1,
          decimals: 2,
          explain: 'T = 2v0y/g = 2 × 13.86 / 9.81 ≈ 2.82 s.',
          hint: 'T = 2v0y/g.'
        },
        {
          kind: 'numeric',
          difficulty: 'hard',
          prompt: 'Same launch again (16 m/s at 60°, time of flight ≈ 2.82 s). What is its range, in meters?',
          unit: 'm',
          correct: 22.6,
          tol: 0.6,
          decimals: 1,
          explain: 'v0x = 16 cos(60°) = 8 m/s. R = v0x · T ≈ 8 × 2.82 ≈ 22.6 m.',
          hint: 'R = v0x · T, using v0x = v0 cos θ.'
        },
        {
          kind: 'mcq',
          difficulty: 'medium',
          prompt: 'At the very peak of a projectile\'s arc, which velocity component is momentarily zero?',
          options: ['Horizontal ($v_x$)', 'Vertical ($v_y$)', 'Both', 'Neither'],
          correct: 1,
          explain: 'The vertical velocity drops to zero right at the peak (that\'s what defines the peak) — but the horizontal velocity never stops, which is why the path curves smoothly instead of halting.'
        }
      ]
    },

    /* ============================================================ */
    {
      id: 'proj-range-angle',
      title: 'How Range Depends on Angle',
      sub: '6 steps · finding the sweet spot',
      steps: [
        {
          kind: 'lesson',
          title: 'Why 45° is special',
          hook: 'A javelin thrower and a shot-putter aim for very different-looking trajectories, but there\'s one specific angle — 45° — that sends anything the farthest for a given launch speed, whether it\'s a javelin, a cannonball, or a golf ball off a flat green.',
          body: 'Look again at the range formula: $R = \\frac{v_0^2 \\sin(2\\theta)}{g}$. For a fixed launch speed, $R$ is entirely controlled by $\\sin(2\\theta)$ — and sine maxes out at exactly 1, when its argument is 90°. That happens when $2\\theta = 90°$, i.e. $\\theta = 45°$.',
          formula: { name: 'Range', words: 'horizontal range = launch speed² × sin(2 × launch angle) / gravity', tex: 'R = \\frac{v_0^2\\sin(2\\theta)}{g}', vars: [
            { sym: 'R', mean: 'horizontal range' },
            { sym: 'v_0, \\theta', mean: 'launch speed and angle' },
            { sym: 'g', mean: 'gravitational acceleration' }
          ] },
          callout: { variant: 'key', text: 'This only holds when launch and landing heights are equal. Launch off a cliff, or up onto a platform, and the ideal angle shifts away from 45°.' }
        },
        {
          kind: 'mcq',
          difficulty: 'easy',
          prompt: 'For a fixed launch speed, with equal launch and landing height, which angle gives the maximum range?',
          options: ['30°', '45°', '60°', '90°'],
          correct: 1,
          explain: 'R ∝ sin(2θ), which peaks when 2θ = 90°, i.e. θ = 45°. At θ = 90° the projectile goes straight up and comes straight back down — zero range.',
          wrongExplain: { 3: 'At 90° the projectile goes straight up and comes straight back down to the same spot — zero horizontal range, the worst choice here, not the best.' }
        },
        {
          kind: 'lesson',
          title: 'Complementary angles tie',
          body: 'Since $\\sin(2\\theta) = \\sin(180° - 2\\theta) = \\sin(2(90°-\\theta))$, any two angles that add up to 90° give the *same* range. A flat, fast 20° shot and a steep, lofted 70° shot travel the exact same horizontal distance — they just take very different paths to get there.',
          callout: { variant: 'info', text: 'One clears the same distance low and quick; the other goes high and slow. Same range, same $v_0$, totally different flight.' }
        },
        {
          kind: 'mcq',
          difficulty: 'medium',
          prompt: 'A projectile launched at 20° lands at the same range as an identical launch (same $v_0$) at which other angle?',
          options: ['20°', '70°', '45°', '90°'],
          correct: 1,
          explain: '20° and 70° are complementary (they add to 90°), so sin(2×20°) = sin(40°) = sin(140°) = sin(2×70°) — same range.',
          wrongExplain: { 2: '45° gives the single largest possible range — but it doesn\'t specifically tie with 20°. That match is 70°, since 20° + 70° = 90° (complementary angles).' }
        },
        {
          kind: 'numeric',
          difficulty: 'medium',
          prompt: 'A projectile launches at $v_0 = 18\\text{ m/s}$, at $30°$ ($g = 9.81\\text{ m/s}^2$). What is its range, in meters?',
          unit: 'm',
          correct: 28.6,
          tol: 0.6,
          decimals: 1,
          explain: 'R = v0² sin(2θ) / g = 18² × sin(60°) / 9.81 ≈ 324 × 0.866 / 9.81 ≈ 28.6 m.',
          hint: 'R = v0² sin(2θ) / g.'
        },
        {
          kind: 'order',
          difficulty: 'hard',
          prompt: 'Three balls launch at the same speed but different angles: 15°, 60°, and 40°. Rank them by range, from *least* to *most*.',
          items: ['15° launch angle', '60° launch angle', '40° launch angle'],
          explain: 'Range depends on sin(2θ): sin(30°) ≈ 0.50 for 15°, sin(120°) ≈ 0.87 for 60°, and sin(80°) ≈ 0.98 for 40°. The closer an angle sits to 45°, the further sin(2θ) — and the range — climbs toward its peak.'
        }
      ]
    },

    /* ============================================================ */
    {
      id: 'proj-target',
      title: 'Clearing Obstacles & Hitting the Target',
      sub: '6 steps · putting it all together',
      steps: [
        {
          kind: 'lesson',
          title: 'Does it clear the wall?',
          hook: 'A basketball player has to arc a shot just over a defender\'s outstretched hand and still have it drop through the hoop several meters further on — clearing an obstacle and hitting a target are two separate conditions the same shot has to satisfy at once.',
          body: 'Everything so far has asked "where does it land?" But you can just as easily ask "how high is it at some horizontal distance $x$, *before* it lands?" — useful for checking whether a shot clears a wall, a net, or a defender\'s outstretched arms.\n\nThe trick: find the time it takes to travel that far horizontally ($t = x/v_{0x}$), then plug that time into the vertical-motion equation.',
          formula: { name: 'Height at horizontal distance x', words: 'height at that point = vertical launch velocity × time - ½ × gravity × time²', tex: 'y = v_{0y}t - \\tfrac{1}{2}gt^2 \\quad \\text{where } t = x / v_{0x}', vars: [
            { sym: 'y', mean: 'height above launch level at that point' },
            { sym: 'x', mean: 'horizontal distance traveled' },
            { sym: 't', mean: 'time to reach that x, found first' },
            { sym: 'v_{0x}, v_{0y}', mean: 'horizontal and vertical velocity components' },
            { sym: 'g', mean: 'gravitational acceleration' }
          ] }
        },
        {
          kind: 'numeric',
          difficulty: 'easy',
          prompt: 'A ball launches at $v_0 = 20\\text{ m/s}$, at $40°$ ($g = 9.81\\text{ m/s}^2$). What is its height above launch level after traveling 15 m horizontally, in meters?',
          unit: 'm',
          correct: 7.88,
          tol: 0.5,
          decimals: 2,
          explain: 'v0x = 20cos(40°) ≈ 15.32 m/s, so t = 15/15.32 ≈ 0.98 s at x = 15 m. v0y = 20sin(40°) ≈ 12.86 m/s. y = v0y·t − ½gt² ≈ 12.86(0.98) − 0.5(9.81)(0.98)² ≈ 7.88 m.',
          hint: 'Find t = x / v0x first, then use y = v0y·t − ½gt².'
        },
        {
          kind: 'mcq',
          difficulty: 'medium',
          prompt: 'Using that result — a height of about 7.9 m at x = 15 m — does this ball clear a 3 m wall placed right at x = 15 m?',
          options: ['Yes, it comfortably clears it', 'No, it hits below 3 m', 'It exactly grazes the top', 'Impossible to tell'],
          correct: 0,
          explain: 'At x = 15 m the ball is about 7.9 m up — well above a 3 m wall. It clears with about 4.9 m to spare.'
        },
        {
          kind: 'sim',
          prompt: 'Now the full challenge: clear the wall *and* land the shot inside the target zone. Tune both speed and angle.',
          simId: 'projectile',
          args: { speed: 20, angle: 45, wallX: 55, wallHeight: 10, targetXMin: 95, targetXMax: 110 },
          note: 'Too flat and you\'ll slam into the wall; too steep or too slow and you\'ll land short of the target.'
        },
        {
          kind: 'mcq',
          difficulty: 'hard',
          prompt: 'Two identical balls launch at the same speed, one at 30° and one at 60°. How do their ranges and max heights compare?',
          options: [
            'Same range (complementary angles); the 60° ball goes higher',
            'Same max height; the 30° ball goes farther',
            'Both identical in every way',
            'Both range and height are completely unrelated between them'
          ],
          correct: 0,
          explain: '30° and 60° add to 90°, so sin(2θ) — and therefore range — matches for both. But max height depends on v0y = v0sinθ alone, and sin(60°) > sin(30°), so the steeper 60° launch climbs higher even though it lands at the same spot.',
          wrongExplain: { 1: 'It\'s the reverse: 30° and 60° tie on *range* (complementary angles), while max height differs — and it\'s the steeper 60° launch that climbs higher, not the 30° one that lands farther.' }
        },
        {
          kind: 'lesson',
          title: 'Chapter wrap-up',
          body: 'You can now fully describe projectile motion: split it into an independent horizontal story (constant velocity) and vertical story (constant acceleration $g$), connected only by a shared clock. From the launch speed and angle, you can find the velocity components, the time of flight, the max height, the range — and even the height at any point along the arc.\n\nNext up: the *why* behind all this motion — the forces that cause it in the first place.',
          callout: { variant: 'key', text: '$v_{0x} = v_0\\cos\\theta$, $v_{0y} = v_0\\sin\\theta$, $T = 2v_{0y}/g$, $H = v_{0y}^2/(2g)$, $R = v_0^2\\sin(2\\theta)/g$ — and 45° maximizes range when launch and landing heights match.' }
        }
      ]
    },

    /* ============================================================ */
    /* Practice lesson: `pool` + `draw` instead of `steps`. Pool mix is
       60/30/10 easy/medium/hard (12/6/2); each run keeps that at 6/3/1. */
    {
      id: 'proj-practice',
      title: 'Projectile Equation Practice',
      sub: 'endless drill · 10 fresh questions per run',
      draw: { easy: 6, medium: 3, hard: 1 },
      intro: {
        kind: 'lesson',
        title: 'Split it, solve it, repeat',
        hook: 'Ask a good outfielder how they know where a fly ball lands and you\'ll get a shrug. They aren\'t computing anything — they\'ve just watched thousands of arcs. You get there the same way, one worked launch at a time.',
        body: 'This is a drill on the equations this chapter taught — nothing new appears here. Ten questions get drawn fresh from a bigger bank each time you open it, so you can run it over and over and keep getting a different set.\n\nThe 🧮 button at the top opens a calculator with **x²** and **√** keys.',
        callout: { variant: 'key', text: 'Split every launch first: $v_{0x} = v_0\\cos\\theta$ (constant forever) and $v_{0y} = v_0\\sin\\theta$ (falls under $g$). Then $T = \\frac{2v_{0y}}{g}$, $H = \\frac{v_{0y}^2}{2g}$, and $R = v_{0x}T = \\frac{v_0^2\\sin(2\\theta)}{g}$. Use $g = 9.81\\text{ m/s}^2$.' }
      },
      pool: [
        /* ---- easy (12) ---- */
        {
          kind: 'numeric',
          difficulty: 'easy',
          prompt: 'A ball is launched at 20 m/s at 30°. What is its horizontal velocity component $v_{0x}$, in m/s?',
          unit: 'm/s',
          correct: 17.3,
          tol: 0.3,
          decimals: 1,
          explain: 'v₀ₓ = v₀cos θ = 20 × cos 30° = 20 × 0.866 ≈ 17.3 m/s. This one never changes for the whole flight — gravity pulls straight down, so it has no effect sideways.',
          hint: 'Horizontal uses cos.'
        },
        {
          kind: 'numeric',
          difficulty: 'easy',
          prompt: 'The same ball: 20 m/s at 30°. What is its vertical velocity component $v_{0y}$, in m/s?',
          unit: 'm/s',
          correct: 10,
          tol: 0.2,
          explain: 'v₀ᵧ = v₀ sin θ = 20 × sin 30° = 20 × 0.5 = 10 m/s. Unlike the horizontal part, this one shrinks under gravity, hits zero at the top, then grows downward.',
          hint: 'Vertical uses sin.'
        },
        {
          kind: 'mcq',
          difficulty: 'easy',
          prompt: 'A cannonball is fired at an angle. What happens to its horizontal velocity during the flight (ignoring air resistance)?',
          options: [
            'It stays constant the whole way',
            'It decreases steadily until landing',
            'It decreases going up, then increases coming down',
            'It drops to zero at the highest point'
          ],
          correct: 0,
          explain: 'Gravity pulls straight down, so it changes only the vertical motion. Nothing acts horizontally, so $v_x$ is the same at launch, at the peak, and at landing.',
          wrongExplain: { 3: 'It\'s the *vertical* velocity that hits zero at the peak. The horizontal part is untouched by gravity and keeps its launch value the whole flight.' }
        },
        {
          kind: 'numeric',
          difficulty: 'easy',
          prompt: 'A projectile has $v_{0y} = 15$ m/s. How long until it reaches its highest point, in seconds? ($g = 9.81\\text{ m/s}^2$)',
          unit: 's',
          correct: 1.53,
          tol: 0.05,
          decimals: 2,
          explain: 'At the peak the vertical velocity is zero, so from v = v₀ᵧ − gt: t = v₀ᵧ/g = 15/9.81 ≈ 1.53 s. That\'s exactly half the total flight time for a level launch.',
          hint: 'At the top, the vertical velocity is zero.'
        },
        {
          kind: 'numeric',
          difficulty: 'easy',
          prompt: 'A projectile has $v_{0y} = 15$ m/s. What is its total time of flight over level ground, in seconds?',
          unit: 's',
          correct: 3.06,
          tol: 0.08,
          decimals: 2,
          explain: 'T = 2v₀ᵧ/g = 2 × 15 / 9.81 ≈ 3.06 s. The trip up and the trip down take exactly the same time, so the total is just double the time to the peak.',
          hint: 'T = 2v0y/g.'
        },
        {
          kind: 'mcq',
          difficulty: 'easy',
          prompt: 'One ball is dropped from a table while an identical ball is fired horizontally off the same table at the same instant. Which hits the floor first?',
          options: [
            'They land at the same time',
            'The dropped ball',
            'The fired ball',
            'Depends on how fast the fired one goes'
          ],
          correct: 0,
          explain: 'The vertical and horizontal motions are completely independent. Both balls start with zero vertical velocity and fall the same height under the same $g$, so they land together — the fired one just lands much farther away.',
          wrongExplain: { 1: 'The horizontal launch gives the second ball no *vertical* head start or handicap. Both fall the same height under the same gravity, so their fall times match exactly.' }
        },
        {
          kind: 'numeric',
          difficulty: 'easy',
          prompt: 'A ball is kicked at 25 m/s at 40°. What is its vertical velocity component, in m/s?',
          unit: 'm/s',
          correct: 16.1,
          tol: 0.3,
          decimals: 1,
          explain: 'v₀ᵧ = 25 × sin 40° ≈ 25 × 0.643 ≈ 16.1 m/s.',
          hint: 'Vertical component uses sin θ.'
        },
        {
          kind: 'numeric',
          difficulty: 'easy',
          prompt: 'A projectile launched at 45° has a horizontal velocity of 14 m/s and a flight time of 2.0 s. What is its range, in meters?',
          unit: 'm',
          correct: 28,
          tol: 0.5,
          explain: 'Horizontally it just cruises at constant speed, so R = v₀ₓT = 14 × 2.0 = 28 m. Range is never anything more exotic than "horizontal speed × time in the air."',
          hint: 'Horizontal motion is constant velocity: distance = speed × time.'
        },
        {
          kind: 'mcq',
          difficulty: 'easy',
          prompt: 'At the highest point of a projectile\'s arc, what is its vertical velocity?',
          options: ['Zero', 'Equal to $v_0$', 'Equal to $v_{0y}$', 'Equal to $g$'],
          correct: 0,
          explain: 'The vertical velocity is what reverses at the top, so it must pass through zero there. The *total* speed isn\'t zero, though — the horizontal component is still at its full launch value.',
          wrongExplain: { 2: 'v₀ᵧ is the vertical velocity at *launch*. Gravity has been eating away at it the whole way up, until it reaches exactly zero at the peak.' }
        },
        {
          kind: 'numeric',
          difficulty: 'easy',
          prompt: 'A projectile has $v_{0y} = 9$ m/s. What is its maximum height above the launch point, in meters?',
          unit: 'm',
          correct: 4.13,
          tol: 0.15,
          decimals: 2,
          explain: 'H = v₀ᵧ²/(2g) = 81/19.62 ≈ 4.13 m. Only the vertical component matters here — the horizontal one has no say in how high it climbs.',
          hint: 'H = v0y² / (2g).'
        },
        {
          kind: 'numeric',
          difficulty: 'easy',
          prompt: 'A ball is thrown at 30 m/s at 60°. What is its horizontal velocity component, in m/s?',
          unit: 'm/s',
          correct: 15,
          tol: 0.3,
          explain: 'v₀ₓ = 30 × cos 60° = 30 × 0.5 = 15 m/s. A steep launch trades horizontal speed for vertical — at 60° only half the launch speed goes sideways.',
          hint: 'cos 60° = 0.5.'
        },
        {
          kind: 'mcq',
          difficulty: 'easy',
          prompt: 'Over level ground, which launch angle gives the greatest range for a fixed launch speed?',
          options: ['45°', '30°', '60°', '90°'],
          correct: 0,
          explain: 'Range is $R = v_0^2\\sin(2\\theta)/g$, and $\\sin(2\\theta)$ peaks at $2\\theta = 90°$, so $\\theta = 45°$. It\'s the best balance between going fast sideways and staying in the air long enough to use that speed.',
          wrongExplain: { 3: 'At 90° the ball goes straight up and lands back on your head — maximum height, zero range. There\'s no horizontal velocity at all.' }
        },

        /* ---- medium (6) ---- */
        {
          kind: 'numeric',
          difficulty: 'medium',
          prompt: 'A ball is launched at 20 m/s at 30° over level ground. What is its total time of flight, in seconds?',
          unit: 's',
          correct: 2.04,
          tol: 0.06,
          decimals: 2,
          explain: 'First the vertical component: v₀ᵧ = 20 × sin 30° = 10 m/s. Then T = 2v₀ᵧ/g = 20/9.81 ≈ 2.04 s.',
          hint: 'Two steps: find v0y first, then use T = 2v0y/g.'
        },
        {
          kind: 'numeric',
          difficulty: 'medium',
          prompt: 'A ball is launched at 20 m/s at 30° over level ground. What is its maximum height, in meters?',
          unit: 'm',
          correct: 5.1,
          tol: 0.2,
          decimals: 1,
          explain: 'v₀ᵧ = 20 × sin 30° = 10 m/s, so H = v₀ᵧ²/(2g) = 100/19.62 ≈ 5.1 m.',
          hint: 'Find v0y first, then H = v0y²/(2g).'
        },
        {
          kind: 'numeric',
          difficulty: 'medium',
          prompt: 'A ball is launched at 20 m/s at 30° over level ground. What is its range, in meters?',
          unit: 'm',
          correct: 35.3,
          tol: 0.8,
          decimals: 1,
          explain: 'R = v₀²sin(2θ)/g = 400 × sin 60° / 9.81 = 400 × 0.866 / 9.81 ≈ 35.3 m. Equivalently v₀ₓT = 17.3 × 2.04 ≈ 35.3 m — the two routes always agree.',
          hint: 'Either R = v0²sin(2θ)/g, or find v0x and T separately and multiply.'
        },
        {
          kind: 'numeric',
          difficulty: 'medium',
          prompt: 'A stone is thrown horizontally at 12 m/s from a 20 m high cliff. How far from the base does it land, in meters?',
          unit: 'm',
          correct: 24.2,
          tol: 0.8,
          decimals: 1,
          explain: 'The vertical story sets the clock: thrown horizontally means v₀ᵧ = 0, so 20 = ½gt² → t = √(40/9.81) ≈ 2.02 s. Then horizontally, x = 12 × 2.02 ≈ 24.2 m.',
          hint: 'Use the fall height to get the time, then multiply by the horizontal speed.'
        },
        {
          kind: 'mcq',
          difficulty: 'medium',
          prompt: 'Two balls are launched at the same speed, one at 25° and one at 65°. How do their ranges compare?',
          options: [
            'Equal — the angles are complementary',
            'The 25° ball goes farther',
            'The 65° ball goes farther',
            'Not enough information'
          ],
          correct: 0,
          explain: '25° + 65° = 90°, so $\\sin(2\\theta)$ gives $\\sin 50°$ for both — identical ranges. Their paths look nothing alike, though: the 65° shot climbs far higher and hangs in the air much longer.',
          wrongExplain: { 2: 'Steeper means higher and longer in the air, but also much less horizontal speed. For complementary angles those two effects cancel exactly, so the ranges tie.' }
        },
        {
          kind: 'order',
          difficulty: 'medium',
          prompt: 'Four balls are launched at the same speed over level ground. Rank them by range, from *shortest* to *longest*.',
          items: [
            'Launched at 10°',
            'Launched at 20°',
            'Launched at 35°',
            'Launched at 45°'
          ],
          explain: 'Range follows $\\sin(2\\theta)$, which climbs steadily from 0° up to its maximum at 45°. All four angles are below 45°, so the ordering is simply shallowest to steepest.'
        },

        /* ---- hard (2) ---- */
        {
          kind: 'numeric',
          difficulty: 'hard',
          prompt: 'A ball is kicked at 18 m/s at 35°. How high is it when it has travelled 10 m horizontally, in meters?',
          unit: 'm',
          correct: 4.75,
          tol: 0.25,
          decimals: 2,
          explain: 'Components: v₀ₓ = 18cos35° ≈ 14.74 m/s, v₀ᵧ = 18sin35° ≈ 10.32 m/s. The horizontal distance sets the clock: t = 10/14.74 ≈ 0.678 s. Then y = v₀ᵧt − ½gt² = 10.32 × 0.678 − 0.5 × 9.81 × 0.678² ≈ 7.00 − 2.26 ≈ 4.75 m.',
          hint: 'Convert the horizontal distance into a time first, then feed that time into the vertical equation.'
        },
        {
          kind: 'numeric',
          difficulty: 'hard',
          prompt: 'A projectile launched over level ground has a range of 40 m and a launch speed of 22 m/s. What is its launch angle, in degrees? (give the shallower of the two possible answers)',
          unit: '°',
          correct: 27.1,
          tol: 1.2,
          decimals: 1,
          explain: 'From R = v₀²sin(2θ)/g: sin(2θ) = Rg/v₀² = 40 × 9.81 / 484 ≈ 0.8107. So 2θ ≈ 54.2°, giving θ ≈ 27.1°. (The complementary angle ≈ 62.9° reaches the same 40 m on a much steeper arc.)',
          hint: 'Rearrange the range formula for sin(2θ), then take the inverse sine and halve it.'
        }
      ]
    }
  );

})(typeof window !== 'undefined' ? window : globalThis);
