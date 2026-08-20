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
          prereq: 'This chapter builds directly on Chapter 1 (free fall, velocity) and the toolkit\'s vector components — make sure both feel solid before diving in.',
          hook: 'A basketball player releases a shot on a wild diagonal arc, and somehow it drops through the hoop anyway, over and over in practice. No one is solving equations mid-shot — but the exact math you\'re about to learn is quietly running underneath every one of those arcs.',
          body: 'Once something moves in two dimensions — a thrown ball, a kicked soccer ball, a launched rocket — its motion looks complicated. The trick that makes it simple: split it into a **horizontal story** and a **vertical story**, and handle them completely separately.\n\nHorizontally, nothing pushes the object once it leaves your hand (ignore air resistance), so it moves at **constant velocity**. Vertically, gravity pulls down the whole time, so it moves with **constant acceleration** $g$ — exactly the free fall you already know from Chapter 1.',
          callout: { variant: 'key', text: 'The only thing the x-motion and y-motion share is **time**. They tick along on the same clock, but neither one affects the other.' }
        },
        {
          kind: 'mcq',
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
          prompt: 'A ball rolls off a table and falls to the floor at the same instant an identical ball is dropped straight down from the same height. Which one lands first?',
          options: ['The one that rolled off — it has extra speed', 'The one that was dropped — it fell straighter', 'They land at the same time', 'It depends on how fast the first ball was rolling'],
          correct: 2,
          explain: 'Both balls start with the same vertical velocity (zero) and fall under the same $g$. Their vertical stories are identical, so they land simultaneously — no matter how fast the first one was moving horizontally.',
          wrongExplain: { 0: 'Horizontal speed doesn\'t affect how long the fall takes — only the vertical story (starting vertical velocity and $g$) decides fall time, and that\'s identical for both balls.' },
          hint: 'Ask only about the vertical story — horizontal speed doesn\'t enter into it at all.'
        },
        {
          kind: 'numeric',
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
          formula: { name: 'Launch velocity components', tex: 'v_{0x} = v_0\\cos\\theta \\qquad v_{0y} = v_0\\sin\\theta', vars: [
            { sym: 'v_0', mean: 'launch speed' },
            { sym: '\\theta', mean: 'launch angle above horizontal' },
            { sym: 'v_{0x}', mean: 'horizontal velocity component (stays constant)' },
            { sym: 'v_{0y}', mean: 'vertical velocity component (gravity acts on this one)' }
          ] }
        },
        {
          kind: 'numeric',
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
          prompt: 'Same launch — 25 m/s at 30°. What is its vertical velocity component $v_{0y}$, in m/s?',
          unit: 'm/s',
          correct: 12.5,
          tol: 0.3,
          explain: 'v0y = v0 sin θ = 25 × sin(30°) = 25 × 0.5 = 12.5 m/s.',
          hint: 'v0y = v0 sin θ.'
        },
        {
          kind: 'mcq',
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
          formula: { name: 'Time of flight', tex: 'T = \\frac{2v_{0y}}{g} = \\frac{2v_0\\sin\\theta}{g}', vars: [
            { sym: 'T', mean: 'total time of flight' },
            { sym: 'v_{0y}', mean: 'initial vertical velocity component' },
            { sym: 'g', mean: 'gravitational acceleration' }
          ] },
          callout: { variant: 'info', text: 'At the peak, the *vertical* velocity is momentarily zero — but the horizontal velocity never stops. That\'s why the path bends into a smooth arc instead of coming to a dead stop.' }
        },
        {
          kind: 'numeric',
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
          body: 'Range is just the horizontal-motion story applied over the full time of flight: constant velocity $v_{0x}$, for a duration $T$. Substituting $T$ in gives a single formula in terms of $v_0$ and $\\theta$ alone.',
          formula: { name: 'Range', tex: 'R = v_{0x}\\,T = \\frac{v_0^2\\sin(2\\theta)}{g}', vars: [
            { sym: 'R', mean: 'horizontal range' },
            { sym: 'v_0, \\theta', mean: 'launch speed and angle' },
            { sym: 'g', mean: 'gravitational acceleration' }
          ] }
        },
        {
          kind: 'numeric',
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
      id: 'proj-range-angle',
      title: 'How Range Depends on Angle',
      sub: '6 steps · finding the sweet spot',
      steps: [
        {
          kind: 'lesson',
          title: 'Why 45° is special',
          hook: 'A javelin thrower and a shot-putter aim for very different-looking trajectories, but there\'s one specific angle — 45° — that sends anything the farthest for a given launch speed, whether it\'s a javelin, a cannonball, or a golf ball off a flat green.',
          body: 'Look again at the range formula: $R = \\frac{v_0^2 \\sin(2\\theta)}{g}$. For a fixed launch speed, $R$ is entirely controlled by $\\sin(2\\theta)$ — and sine maxes out at exactly 1, when its argument is 90°. That happens when $2\\theta = 90°$, i.e. $\\theta = 45°$.',
          formula: { name: 'Range', tex: 'R = \\frac{v_0^2\\sin(2\\theta)}{g}', vars: [
            { sym: 'R', mean: 'horizontal range' },
            { sym: 'v_0, \\theta', mean: 'launch speed and angle' },
            { sym: 'g', mean: 'gravitational acceleration' }
          ] },
          callout: { variant: 'key', text: 'This only holds when launch and landing heights are equal. Launch off a cliff, or up onto a platform, and the ideal angle shifts away from 45°.' }
        },
        {
          kind: 'mcq',
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
          prompt: 'A projectile launched at 20° lands at the same range as an identical launch (same $v_0$) at which other angle?',
          options: ['20°', '70°', '45°', '90°'],
          correct: 1,
          explain: '20° and 70° are complementary (they add to 90°), so sin(2×20°) = sin(40°) = sin(140°) = sin(2×70°) — same range.',
          wrongExplain: { 2: '45° gives the single largest possible range — but it doesn\'t specifically tie with 20°. That match is 70°, since 20° + 70° = 90° (complementary angles).' }
        },
        {
          kind: 'numeric',
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
          formula: { name: 'Height at horizontal distance x', tex: 'y = v_{0y}t - \\tfrac{1}{2}gt^2 \\quad \\text{where } t = x / v_{0x}', vars: [
            { sym: 'y', mean: 'height above launch level at that point' },
            { sym: 'x', mean: 'horizontal distance traveled' },
            { sym: 't', mean: 'time to reach that x, found first' },
            { sym: 'v_{0x}, v_{0y}', mean: 'horizontal and vertical velocity components' },
            { sym: 'g', mean: 'gravitational acceleration' }
          ] }
        },
        {
          kind: 'numeric',
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
    }
  );

})(typeof window !== 'undefined' ? window : globalThis);
