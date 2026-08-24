/* ============================================================
   lessons/forces.js — Chapter 3: Newton's Laws
   Five lessons: inertia, F=ma, action-reaction, friction, and
   inclined planes. Every graded numeric answer routes through
   PA.kin so the sims and the answer keys can never disagree.
   ============================================================ */
(function (root) {
  'use strict';

  var chapter = root.PA.curriculum.findChapter('forces');
  if (!chapter) return;

  chapter.lessons.push(

    /* ============================================================ */
    {
      id: 'fc-first-law',
      title: "Newton's First Law — Inertia",
      sub: '6 steps · why nothing changes on its own',
      steps: [
        {
          kind: 'lesson',
          title: 'Objects resist changes to their motion',
          prereq: 'This chapter leans on vectors and velocity/acceleration from the first two chapters — force is the *why* behind motion you already know how to describe.',
          hook: "You're standing on a bus that brakes hard, and your body lurches forward even though nothing pushed you forward. Your body was just continuing to do what it was already doing — the bus is what changed.",
          body: "Every chapter so far has described *how* things move. This chapter asks *why*. Newton's First Law is the starting point: an object at rest stays at rest, and an object in motion stays in motion at constant velocity, **unless a net force acts on it**.\n\nThat resistance to changing motion is called **inertia**. It's not a force — it's a property every object with mass has, just by existing.",
          callout: { variant: 'key', text: 'Net force = 0 doesn\'t mean "not moving." It means "velocity isn\'t changing" — which includes staying at rest *and* cruising at constant speed in a straight line.' }
        },
        {
          kind: 'mcq',
          difficulty: 'easy',
          prompt: 'A hockey puck slides across frictionless ice with no one touching it. What happens to its velocity?',
          options: ['It gradually slows down and stops', 'It stays exactly the same, forever', 'It speeds up slightly', 'It curves off to one side'],
          correct: 1,
          explain: 'With zero net force acting on it (no friction, no push), the First Law says its velocity simply doesn\'t change — same speed, same direction, indefinitely.',
          wrongExplain: { 0: 'That\'s the everyday intuition friction trains into us — but this puck is on frictionless ice. With zero net force, the First Law says velocity simply doesn\'t change at all.' }
        },
        {
          kind: 'lesson',
          title: 'The misconception motion needs a force to continue',
          body: 'It *feels* like moving things need a constant push to keep going — because in everyday life, friction and air resistance are always quietly working against motion, and something has to fight them just to maintain a constant speed. But that "something" is only replacing the energy friction steals; it isn\'t needed to keep an object moving in the idealized, frictionless sense.',
          callout: { variant: 'warn', text: 'A car needs its engine running just to *cruise* at constant highway speed — not because motion needs a force, but because friction and air drag are constantly trying to slow it down. Turn off the engine and it decelerates, it doesn\'t stop instantly.' }
        },
        {
          kind: 'mcq',
          difficulty: 'medium',
          prompt: 'A book sits on a table, motionless. According to the First Law, what can you conclude about the net force on it?',
          options: ['It must be zero', 'It must equal the book\'s weight', 'It must point downward', 'You can\'t say — there\'s no motion to analyze'],
          correct: 0,
          explain: 'Constant velocity (zero, in this case) means zero net force. Gravity is still pulling down on the book, but the table is pushing up with an equal and opposite normal force, so the two cancel exactly.',
          wrongExplain: { 1: 'The book\'s weight is one of the individual forces on it — net force is what\'s left *after* combining all of them. Gravity down and the normal force up cancel exactly, leaving net force at zero, not equal to the weight.' }
        },
        {
          kind: 'lesson',
          title: 'Why seatbelts matter',
          body: 'When a car slams to a stop, the car\'s frame decelerates fast — but your body, by inertia, "wants" to keep moving at the car\'s original speed. Without a seatbelt, nothing supplies the force to decelerate *you* along with the car, until the windshield or dashboard does it for you, abruptly.\n\nThe seatbelt\'s job is to supply that decelerating force gradually, over your whole torso, instead of letting inertia carry you into something harder and smaller.',
          callout: { variant: 'info', text: 'This is the First Law in its most consequential everyday form: your body keeps moving unless something forces it to stop. The only question is *what* stops it, and *how gently*.' }
        },
        {
          kind: 'mcq',
          difficulty: 'hard',
          prompt: 'A car is turning left at a perfectly constant speed. Is the net force on the car zero?',
          options: ['Yes — speed never changes, so net force is zero', 'No — changing direction is changing velocity, so there must be a net force', 'Only if the car speeds up while turning', 'Net force only applies to straight-line motion'],
          correct: 1,
          explain: 'Velocity is a vector — direction counts as much as speed. Turning changes the direction, so velocity is changing even at constant speed, which means there IS a net force (pointing toward the turn, as you\'ll see in a later chapter). The First Law only guarantees zero net force for motion that\'s constant in *both* speed and direction.',
          wrongExplain: { 0: 'Speed staying constant isn\'t the whole story — velocity is a vector, and turning changes its *direction*. A changing velocity means there IS a net force, even without any change in speed.' }
        }
      ]
    },

    /* ============================================================ */
    {
      id: 'fc-second-law',
      title: "Newton's Second Law — F = ma",
      sub: '7 steps · force, mass & acceleration',
      steps: [
        {
          kind: 'lesson',
          title: 'The law that connects push to speed-up',
          hook: "Pushing an empty shopping cart takes barely any effort to speed up. Push the exact same way on a cart loaded with a dozen bags of concrete, and it barely budges — same push, wildly different result.",
          body: 'The First Law says what happens with *zero* net force. The Second Law says what happens with *nonzero* net force: it produces an acceleration, in the same direction as the force, proportional to the force and inversely proportional to the object\'s mass.',
          formula: { name: "Newton's Second Law", words: 'net force = mass × acceleration', tex: '\\vec{F}_{net} = m\\vec{a}', vars: [
            { sym: 'F_{net}', mean: 'net force acting on the object' },
            { sym: 'm', mean: 'its mass' },
            { sym: 'a', mean: 'the acceleration produced' }
          ] },
          callout: { variant: 'key', text: 'Bigger net force → bigger acceleration. Bigger mass → smaller acceleration for the same force. Mass is literally a measure of how much an object resists being accelerated.' }
        },
        {
          kind: 'numeric',
          difficulty: 'easy',
          prompt: 'A 1200 kg car experiences a net force of 3600 N. What is its acceleration, in m/s²?',
          unit: 'm/s²',
          correct: 3,
          tol: 0.1,
          explain: 'a = F_net / m = 3600 / 1200 = 3 m/s².',
          hint: 'Rearrange F = ma to solve for a.'
        },
        {
          kind: 'mcq',
          difficulty: 'medium',
          prompt: 'The idea of a "free-body diagram" is to isolate one object and draw every force acting *on* it (not forces it exerts on other things). Why bother, instead of just eyeballing the situation?',
          options: [
            'It\'s required by law in physics class',
            'It forces you to account for every force before adding them up, so nothing gets missed or double-counted',
            'It replaces the need for F = ma entirely',
            'It only matters when there are more than three forces'
          ],
          correct: 1,
          explain: 'The whole point of isolating one object and listing its forces is bookkeeping: it\'s easy to forget a force (like friction, or a normal force) or accidentally include a force that acts on something else. Once every force on the object is accounted for, you sum them as vectors to get F_net.',
          wrongExplain: { 2: 'A free-body diagram doesn\'t replace F = ma — it\'s the bookkeeping step that makes sure you\'ve got the right forces *before* you plug them into F = ma.' }
        },
        {
          kind: 'lesson',
          title: 'Mass vs. weight: a scalar and a force',
          hook: 'Step on a bathroom scale and what it reports is a *force* — your weight — not directly your mass. That\'s why astronauts don\'t shrink in orbit: nothing about how much matter they\'re made of has changed, only how hard something is pulling on it.',
          body: '**Mass** is how much matter something has — a scalar, in kilograms, that never changes no matter where the object is. **Weight** is the *force* of gravity pulling on that mass, and since it depends on the local gravitational field, it\'s different on the Moon than on Earth.',
          formula: { name: 'Weight', words: 'weight = mass × local gravitational acceleration', tex: 'W = mg', vars: [
            { sym: 'W', mean: 'weight (a force, in newtons)' },
            { sym: 'm', mean: 'mass' },
            { sym: 'g', mean: 'local gravitational acceleration' }
          ] }
        },
        {
          kind: 'numeric',
          difficulty: 'medium',
          prompt: 'A person has a mass of 75 kg. What is their weight on Earth, in newtons ($g = 9.81\\text{ m/s}^2$)?',
          unit: 'N',
          correct: 735.75,
          tol: 5,
          decimals: 1,
          explain: 'W = mg = 75 × 9.81 = 735.75 N.',
          hint: 'W = mg.'
        },
        {
          kind: 'mcq',
          difficulty: 'medium',
          prompt: 'That same 75 kg person travels to the Moon, where $g \\approx 1.62\\text{ m/s}^2$. What happens to their mass and weight?',
          options: [
            'Both stay exactly the same',
            'Mass stays the same; weight decreases',
            'Mass decreases; weight stays the same',
            'Both decrease by the same factor'
          ],
          correct: 1,
          explain: 'Mass (75 kg) is a property of the person\'s matter — it doesn\'t care about location. Weight (mg) depends on g, so on the Moon it drops to about 75 × 1.62 ≈ 121.5 N, roughly a sixth of its Earth value — same person, much lighter scale reading.',
          wrongExplain: { 3: 'Mass isn\'t affected by location at all — it\'s a property of the matter itself. Only weight (which depends on g) changes on the Moon; mass stays exactly 75 kg.' }
        },
        {
          kind: 'numeric',
          difficulty: 'hard',
          prompt: 'A rocket sled needs to accelerate a 200 kg test dummy assembly at $12.5\\text{ m/s}^2$. Using $F_{net} = ma$, what net force is required, in newtons?',
          unit: 'N',
          correct: 2500,
          tol: 20,
          explain: 'F_net = ma = 200 × 12.5 = 2500 N.',
          hint: 'F_net = ma — you already have both m and a.'
        }
      ]
    },

    /* ============================================================ */
    {
      id: 'fc-third-law',
      title: "Newton's Third Law — Action & Reaction",
      sub: '6 steps · forces always come in pairs',
      steps: [
        {
          kind: 'lesson',
          title: 'Every force has a partner',
          hook: "Stand on a skateboard next to a wall and push off it — you shoot backward, even though you're the one doing the pushing. Somehow pushing something else got *you* moving.",
          body: 'Whenever object A pushes or pulls on object B, object B pushes or pulls back on A with a force of the **same magnitude**, in the **opposite direction**. These two forces are an action-reaction pair — and critically, they act on *two different objects*, not the same one.',
          formula: { name: "Newton's Third Law", words: 'force A exerts on B = -(force B exerts on A)', tex: '\\vec{F}_{A\\text{ on }B} = -\\vec{F}_{B\\text{ on }A}', vars: [
            { sym: 'F_{A\\text{ on }B}', mean: 'force A exerts on B' },
            { sym: 'F_{B\\text{ on }A}', mean: 'force B exerts on A — equal in size, opposite in direction' }
          ] }
        },
        {
          kind: 'mcq',
          difficulty: 'easy',
          prompt: 'A common misconception: "action-reaction pairs cancel out, so nothing should ever be able to accelerate." What\'s wrong with that reasoning?',
          options: [
            'Nothing — Newton\'s Third Law really does mean nothing can accelerate',
            'The two forces act on *different* objects, so they never appear together in the same F_net calculation for either one',
            'The reaction force is always slightly smaller than the action force',
            'Action-reaction pairs only apply to collisions'
          ],
          correct: 1,
          explain: 'The two forces in a pair never act on the same object — so they can\'t cancel *for* that object. When you push off a wall, the wall pushes back on *you* (accelerating you), while your push acts on the *wall* (which usually doesn\'t move because something else, like the ground, holds it in place). Each object only "feels" its own half of the pair.',
          wrongExplain: { 2: 'Action-reaction pairs are *exactly* equal in magnitude, always — not approximately smaller. The real resolution is that the two forces act on different objects, so they never cancel for either one.' }
        },
        {
          kind: 'lesson',
          title: 'The normal force is a reaction force',
          body: 'When a book rests on a table, the book pushes down on the table (its weight, transmitted through contact), and the table pushes back up on the book — that upward push is the **normal force**. It\'s not a separate mysterious force; it\'s the table\'s side of an action-reaction pair, and it adjusts automatically to whatever is needed to prevent objects from passing through each other.',
          callout: { variant: 'info', text: 'That\'s also why the normal force on a table isn\'t always equal to weight — press down on the book with your hand, and the table pushes back harder to compensate. The normal force adapts; it isn\'t fixed at mg.' }
        },
        {
          kind: 'mcq',
          difficulty: 'medium',
          prompt: 'You stand still on the ground. Your feet push down on the Earth; what is the Third Law reaction to that force?',
          options: [
            'The normal force the ground exerts up on your feet',
            'Your own weight',
            'The friction between your shoes and the ground',
            'There is no reaction force in this case'
          ],
          correct: 0,
          explain: 'Your feet pushing down on the Earth (action) is paired with the Earth pushing up on your feet (reaction) — that upward push is exactly the normal force. Your weight is a separate force (gravity pulling you down), whose Third Law partner is actually your pull on the Earth, not the normal force.',
          wrongExplain: { 1: 'Your weight is gravity pulling on *you* — a completely separate force from this feet/ground pair. Weight\'s own Third Law partner is actually your gravitational pull on the Earth, not the normal force.' }
        },
        {
          kind: 'lesson',
          title: 'Rockets: throw mass one way, get pushed the other',
          body: 'A rocket doesn\'t "push against" the air or the launchpad — it works even in the vacuum of space. It shoves exhaust gas out the back at high speed (action: rocket pushes gas backward); by the Third Law, the gas pushes the rocket forward with an equal and opposite force (reaction). No air, ground, or water required.',
          callout: { variant: 'key', text: 'Any time something speeds up by throwing mass in the opposite direction — a rocket, a swimmer pushing water backward, a person jumping off a skateboard — that\'s Newton\'s Third Law doing the work.' }
        },
        {
          kind: 'numeric',
          difficulty: 'hard',
          prompt: 'A skater pushes against a wall with a force of 180 N. By Newton\'s Third Law, with how much force does the wall push back on the skater, in newtons?',
          unit: 'N',
          correct: 180,
          tol: 2,
          explain: 'Action-reaction pairs always have equal magnitude: the wall pushes back with exactly 180 N, in the opposite direction — that push is what accelerates the skater away from the wall.',
          hint: 'Reaction forces always match the action force in magnitude.'
        }
      ]
    },

    /* ============================================================ */
    {
      id: 'fc-checkpoint',
      title: "Checkpoint: Newton's Three Laws",
      sub: '5 steps · mixed review',
      steps: [
        {
          kind: 'lesson',
          title: 'Quick check before moving on',
          hook: 'A crash-test engineer replaying slow-motion footage is reading all three laws off a single collision at once — what kept moving until something stopped it, how hard that stop pushed back, and what pushed back just as hard in return.',
          body: 'Five quick questions mixing inertia, F = ma, and action-reaction before friction adds a whole new force to the mix.'
        },
        {
          kind: 'mcq',
          difficulty: 'easy',
          prompt: 'A ball floats motionless in deep space, far from any planet, with zero forces acting on it. According to the First Law, what happens to it?',
          options: ['It drifts to a stop eventually', 'It stays exactly where it is, forever', 'It slowly accelerates', 'It depends on its mass'],
          correct: 1,
          explain: 'Zero net force means zero change in velocity — an object at rest with nothing acting on it just stays at rest, indefinitely.',
          wrongExplain: { 0: 'Coming to a stop requires a force (like friction) to slow it down — and there\'s nothing out here to supply one.' }
        },
        {
          kind: 'numeric',
          difficulty: 'easy',
          prompt: 'A 5 kg object accelerates at $2\\text{ m/s}^2$. What net force acts on it, in newtons?',
          unit: 'N',
          correct: 10,
          tol: 0.2,
          explain: 'F_net = ma = 5 × 2 = 10 N.',
          hint: 'F_net = ma.'
        },
        {
          kind: 'numeric',
          difficulty: 'medium',
          prompt: 'What is the weight of a 12 kg object on Earth, in newtons ($g = 9.81\\text{ m/s}^2$)?',
          unit: 'N',
          correct: 117.72,
          tol: 1,
          decimals: 1,
          explain: 'W = mg = 12 × 9.81 = 117.72 N.',
          hint: 'W = mg.'
        },
        {
          kind: 'mcq',
          difficulty: 'medium',
          prompt: 'A hammer strikes a nail, pushing it downward into a board. By Newton\'s Third Law, what pushes back on the hammer?',
          options: ['The nail pushes up on the hammer, equally hard', 'The board absorbs the force, so nothing pushes back', 'Gravity pushes back on the hammer', 'Nothing — the hammer keeps all its force'],
          correct: 0,
          explain: 'Action-reaction pairs are exact: the hammer pushes the nail down, so the nail pushes the hammer up with exactly the same magnitude — that\'s the jolt you feel in your hand.'
        },
        {
          kind: 'mcq',
          difficulty: 'hard',
          prompt: 'A box sits still on a table. Its weight (gravity pulling down) is one force on it. What is that weight\'s actual Newton\'s Third Law reaction pair?',
          options: ['The normal force the table exerts upward on the box', 'The box\'s own gravitational pull on the Earth', 'The friction between the box and the table', 'Weight has no reaction pair — it just balances the normal force'],
          correct: 1,
          explain: 'The normal force balances weight for this box\'s *net force*, but that\'s a coincidence of this situation, not a Third Law pair — a pair is always the same *kind* of force acting back on the *other* object. Gravity\'s partner is the box pulling back on the Earth, just as gravitationally.',
          wrongExplain: { 0: 'The normal force happens to cancel weight here, but they\'re not a Third Law pair — a real pair is the same interaction acting on the other object. The normal force\'s own pair is the box pushing down on the table.' }
        }
      ]
    },

    /* ============================================================ */
    {
      id: 'fc-friction',
      title: 'Friction — Static & Kinetic',
      sub: '7 steps · the force that resists sliding',
      steps: [
        {
          kind: 'lesson',
          title: 'Friction opposes relative sliding',
          hook: "A heavy box refuses to budge no matter how hard you shove — until, with one extra bit of effort, it suddenly breaks free and slides almost too easily. Something changes right at that instant.",
          body: 'Friction is a force between two surfaces in contact that opposes their sliding relative to each other. It comes in two flavors: **static friction**, which resists an object *starting* to slide, and **kinetic friction**, which resists an object that is *already* sliding. Both are proportional to the normal force pressing the surfaces together.',
          formula: { name: 'Friction force', words: 'maximum static friction ≤ coefficient of static friction × normal force — kinetic friction = coefficient of kinetic friction × normal force', tex: 'f_s \\le \\mu_s N    f_k = \\mu_k N', vars: [
            { sym: 'f_s', mean: 'static friction (ranges from 0 up to a maximum)' },
            { sym: '\\mu_s', mean: 'coefficient of static friction' },
            { sym: 'f_k', mean: 'kinetic friction, once sliding' },
            { sym: '\\mu_k', mean: 'coefficient of kinetic friction' },
            { sym: 'N', mean: 'normal force' }
          ] }
        },
        {
          kind: 'lesson',
          title: 'Static friction is a range, not a fixed value',
          body: 'This is the detail that trips people up: static friction isn\'t always equal to $\\mu_s N$ — it can be **anything from 0 up to that maximum**, automatically matching whatever force is needed to keep the object from sliding. Only once the applied force *exceeds* $\\mu_s N$ does the object actually start to move.',
          callout: { variant: 'key', text: 'Push a heavy crate with 50 N and it doesn\'t budge? Static friction is pushing back with exactly 50 N — not the maximum, just enough. It only maxes out right at the instant before sliding begins.' }
        },
        {
          kind: 'numeric',
          difficulty: 'easy',
          prompt: 'A 20 kg crate sits on a floor with $\\mu_s = 0.45$ ($g = 9.81\\text{ m/s}^2$). What is the maximum static friction force before it starts to slide, in newtons?',
          unit: 'N',
          correct: 88.29,
          tol: 2,
          decimals: 1,
          explain: 'N = mg = 20 × 9.81 = 196.2 N. f_s,max = μs N = 0.45 × 196.2 ≈ 88.29 N.',
          hint: 'First find N = mg, then f_s,max = μs N.'
        },
        {
          kind: 'mcq',
          difficulty: 'medium',
          prompt: 'That same 20 kg crate ($f_{s,max} \\approx 88.3\\text{ N}$) is pushed with a steady 70 N force. What happens?',
          options: ['It slides, slowly accelerating', 'It stays put — static friction matches the 70 N push', 'It slides at constant velocity', 'Not enough information'],
          correct: 1,
          explain: '70 N is below the maximum static friction of about 88.3 N, so static friction simply rises to match it — 70 N of friction, net force zero, crate stays put.',
          wrongExplain: { 0: '70 N is below this crate\'s maximum static friction (~88.3 N) — static friction simply rises to match the push exactly, so net force stays zero and nothing moves.' }
        },
        {
          kind: 'numeric',
          difficulty: 'medium',
          prompt: 'Once that crate IS sliding (kinetic friction takes over) with $\\mu_k = 0.3$, what is the kinetic friction force, in newtons?',
          unit: 'N',
          correct: 58.86,
          tol: 2,
          decimals: 1,
          explain: 'f_k = μk N = 0.3 × 196.2 ≈ 58.86 N — noticeably less than the 88.29 N it took to get it moving in the first place.',
          hint: 'f_k = μk N, same normal force as before.'
        },
        {
          kind: 'mcq',
          difficulty: 'hard',
          prompt: 'Why is it typically harder to get a heavy box moving from rest than it is to keep it sliding at constant speed?',
          options: [
            'It isn\'t harder — both take exactly the same force',
            'Because $\\mu_k$ is usually a bit larger than $\\mu_s$',
            'Because $\\mu_s$ is usually a bit larger than $\\mu_k$, so the peak static friction you must overcome exceeds the kinetic friction once it\'s moving',
            'Because the box gets lighter once it starts moving'
          ],
          correct: 2,
          explain: 'Static friction can climb all the way up to μs N before releasing; kinetic friction, once sliding, settles at the usually-lower μk N. That\'s the everyday feeling of a box "breaking free" with a jerk and then sliding more easily.',
          wrongExplain: { 1: 'It\'s the other way around — μs is usually the *larger* one. That\'s exactly why breaking an object free from rest takes more force than keeping it sliding afterward.' }
        },
        {
          kind: 'sim',
          prompt: 'Set the incline angle and the static friction coefficient so the block sits right on the edge of sliding — the classic "angle of repose."',
          simId: 'incline',
          args: { angle: 20, muS: 0.3 },
          note: 'Watch the green friction arrow flip red the moment the block starts sliding — that\'s the switch from static to kinetic friction.'
        }
      ]
    },

    /* ============================================================ */
    {
      id: 'fc-incline',
      title: 'Inclined Planes',
      sub: '7 steps · gravity, tilted',
      steps: [
        {
          kind: 'lesson',
          title: 'Same trick as tk-vectors, new context',
          hook: "A delivery driver parks on a gentle hill, and the hand brake alone is enough to hold the truck still. Park on a much steeper hill and even a fully engaged brake isn't enough — the truck creeps forward. Same gravity, pulling differently depending on the slope.",
          body: 'On a slope, gravity still pulls straight down — but "straight down" is neither perfectly along the slope nor perfectly perpendicular to it. Just like splitting any vector into components, split weight into a piece **parallel to the slope** (what actually pulls the object down the ramp) and a piece **perpendicular to the slope** (what presses the object into the surface).',
          formula: { name: 'Weight components on a slope', words: 'weight component along the slope = mass × gravity × sin(angle) — weight component into the slope = mass × gravity × cos(angle)', tex: 'W_{\\parallel} = mg\\sin\\theta    W_{\\perp} = mg\\cos\\theta', vars: [
            { sym: 'W_{\\parallel}', mean: 'weight component along the slope' },
            { sym: 'W_{\\perp}', mean: 'weight component into the slope' },
            { sym: 'm, g', mean: 'mass and gravitational acceleration' },
            { sym: '\\theta', mean: 'incline angle from horizontal' }
          ] },
          callout: { variant: 'info', text: 'θ is measured from the horizontal ground to the slope. Steeper slope (bigger θ) → more weight redirected along the slope, less pressing into it — same redistribution idea as launch angle in Chapter 2.' }
        },
        {
          kind: 'numeric',
          difficulty: 'easy',
          prompt: 'An 8 kg block sits on a $25°$ incline ($g = 9.81\\text{ m/s}^2$). What is the component of its weight parallel to the slope (pulling it down the ramp), in newtons?',
          unit: 'N',
          correct: 33.17,
          tol: 1,
          decimals: 1,
          explain: 'W∥ = mg sin θ = 8 × 9.81 × sin(25°) ≈ 33.17 N.',
          hint: 'W∥ = mg sin θ — the component along the slope.'
        },
        {
          kind: 'numeric',
          difficulty: 'medium',
          prompt: 'Same block (8 kg, 25° incline). What is the component of its weight perpendicular to the slope, in newtons?',
          unit: 'N',
          correct: 71.13,
          tol: 1.5,
          decimals: 1,
          explain: 'W⊥ = mg cos θ = 8 × 9.81 × cos(25°) ≈ 71.13 N. Double-check the pairing: sin goes with the *along-slope* pull, cos goes with the *into-the-surface* push — it\'s easy to swap these by accident.',
          hint: 'W⊥ = mg cos θ — the component pressing into the slope.'
        },
        {
          kind: 'lesson',
          title: 'The normal force balances the perpendicular piece',
          hook: 'A suitcase on an airport\'s tilted baggage ramp neither sinks through the belt nor pops off the surface — something is exactly canceling the piece of gravity trying to press it through.',
          body: 'That something is the normal force. As long as the block isn\'t flying off the ramp or being crushed into it, there\'s no acceleration *perpendicular* to the slope — so the normal force exactly balances $W_\\perp$. That\'s why the normal force on an incline is $mg\\cos\\theta$, not the full weight $mg$ like it would be on flat ground.',
          formula: { name: 'Normal force on a slope', words: 'normal force = mass × gravitational acceleration × cos(incline angle)', tex: 'N = mg\\cos\\theta', vars: [
            { sym: 'N', mean: 'normal force' },
            { sym: 'm', mean: 'mass' },
            { sym: 'g', mean: 'gravitational acceleration' },
            { sym: '\\theta', mean: 'incline angle from horizontal' }
          ] }
        },
        {
          kind: 'numeric',
          difficulty: 'medium',
          prompt: 'A frictionless incline is set at $25°$. Using only the parallel component of gravity, what is the block\'s acceleration down the slope, in m/s²?',
          unit: 'm/s²',
          correct: 4.15,
          tol: 0.15,
          decimals: 2,
          explain: 'With no friction, the only force along the slope is gravity\'s component: a = g sin θ = 9.81 × sin(25°) ≈ 4.15 m/s². Notice the mass cancelled out entirely — same as free fall being mass-independent.',
          hint: 'Frictionless: a = g sin θ (mass cancels out of F = ma).'
        },
        {
          kind: 'lesson',
          title: 'Adding friction back in',
          hook: 'A freshly waxed ski and a beat-up, rusty one send you down the exact same slope at very different speeds — the whole difference comes down to friction eating into gravity\'s pull.',
          body: 'With kinetic friction acting up the slope (opposing the sliding), it subtracts from the down-slope pull. The net acceleration is what\'s left after friction takes its cut.',
          formula: { name: 'Acceleration down an incline, with kinetic friction', words: 'acceleration = gravity × (sin(angle) - coefficient of kinetic friction × cos(angle))', tex: 'a = g(\\sin\\theta - \\mu_k\\cos\\theta)', vars: [
            { sym: 'a', mean: 'acceleration down the slope' },
            { sym: 'g', mean: 'gravitational acceleration' },
            { sym: '\\theta', mean: 'incline angle from horizontal' },
            { sym: '\\mu_k', mean: 'coefficient of kinetic friction' }
          ] },
          callout: { variant: 'warn', text: 'If $\\mu_k \\cos\\theta$ is bigger than $\\sin\\theta$, the formula goes negative — meaning friction alone is enough to keep it from sliding at all once it\'s at rest.' }
        },
        {
          kind: 'numeric',
          difficulty: 'hard',
          prompt: 'Same 25° incline, now with $\\mu_k = 0.15$. What is the block\'s acceleration down the slope, in m/s²?',
          unit: 'm/s²',
          correct: 2.81,
          tol: 0.15,
          decimals: 2,
          explain: 'a = g(sin θ − μk cos θ) = 9.81 × (sin 25° − 0.15 × cos 25°) ≈ 9.81 × (0.4226 − 0.1359) ≈ 2.81 m/s² — noticeably less than the frictionless 4.15 m/s².',
          hint: 'a = g(sin θ − μk cos θ).'
        },
        {
          kind: 'sim',
          prompt: 'Now flip the challenge: pick a static friction coefficient, then tune the angle to balance the block right at its critical, about-to-slide angle.',
          simId: 'incline',
          args: { angle: 10, muS: 0.6 },
          note: 'The critical angle is where tan θ = μs — steeper than that and gravity\'s along-slope pull beats the maximum friction can supply.'
        }
      ]
    },

    /* ============================================================ */
    /* Practice lesson: `pool` + `draw` instead of `steps`. Pool mix is
       60/30/10 easy/medium/hard (12/6/2); each run keeps that at 6/3/1. */
    {
      id: 'fc-practice',
      title: 'Force Equation Practice',
      sub: 'endless drill · 10 fresh questions per run',
      draw: { easy: 6, medium: 3, hard: 1 },
      intro: {
        kind: 'lesson',
        title: 'Same three laws, forty different situations',
        hook: 'Every free-body diagram a physicist has ever drawn is the same short checklist run again: name the forces, add them as signed numbers, divide by the mass. What makes it feel effortless later is only ever how many times you did it earlier.',
        body: 'This is a drill on the equations this chapter taught — nothing new appears here. Ten questions get drawn fresh from a bigger bank each time you open it, so you can run it over and over and keep getting a different set.\n\nThe 🧮 button at the top opens a calculator if you need one.',
        callout: { variant: 'key', text: 'Your toolkit: $F_{net} = ma$, weight $W = mg$ (use $g = 9.81\\text{ m/s}^2$), friction $f_k = \\mu_k N$ with $f_s \\le \\mu_s N$, a flat-ground normal force $N = mg$, and on a slope $N = mg\\cos\\theta$ with $W_{\\parallel} = mg\\sin\\theta$.' }
      },
      pool: [
        /* ---- easy (12) ---- */
        {
          kind: 'numeric',
          difficulty: 'easy',
          prompt: 'A net force of 40 N acts on a 8 kg crate. What is its acceleration, in m/s²?',
          unit: 'm/s²',
          correct: 5,
          tol: 0.1,
          explain: 'a = F_net/m = 40/8 = 5 m/s². Newton\'s Second Law rearranged — the same force produces less acceleration the heavier the object is.',
          hint: 'Rearrange F = ma for a.'
        },
        {
          kind: 'numeric',
          difficulty: 'easy',
          prompt: 'What is the weight of a 12 kg suitcase on Earth ($g = 9.81\\text{ m/s}^2$), in newtons?',
          unit: 'N',
          correct: 117.7,
          tol: 1,
          decimals: 1,
          explain: 'W = mg = 12 × 9.81 ≈ 117.7 N. Mass (12 kg) and weight (117.7 N) are different quantities in different units — the mass would be unchanged on the Moon, the weight would not.',
          hint: 'W = mg.'
        },
        {
          kind: 'numeric',
          difficulty: 'easy',
          prompt: 'A 3 kg ball accelerates at $4\\text{ m/s}^2$. What net force acts on it, in newtons?',
          unit: 'N',
          correct: 12,
          tol: 0.2,
          explain: 'F_net = ma = 3 × 4 = 12 N.',
          hint: 'F = ma, straight from the definition.'
        },
        {
          kind: 'mcq',
          difficulty: 'easy',
          prompt: 'A hockey puck slides across frictionless ice at a constant 6 m/s. What is the net force on it?',
          options: ['Zero', '6 N in the direction of motion', 'Equal to its weight', 'Impossible to say without the mass'],
          correct: 0,
          explain: 'Constant velocity means zero acceleration, and F_net = ma, so the net force must be zero. This is Newton\'s First Law: motion needs no force to *continue*, only to *change*.',
          wrongExplain: { 1: 'That\'s the everyday intuition that something moving must be pushed — but a force is what *changes* motion. Steady motion at constant velocity needs no net force at all.' }
        },
        {
          kind: 'numeric',
          difficulty: 'easy',
          prompt: 'A 20 kg box rests on flat ground with nothing pressing on it. What is the normal force from the ground, in newtons?',
          unit: 'N',
          correct: 196.2,
          tol: 2,
          decimals: 1,
          explain: 'On flat ground with no extra vertical push, the surface pushes back with exactly the object\'s weight: N = mg = 20 × 9.81 ≈ 196.2 N. The box isn\'t accelerating vertically, so the vertical forces must cancel.',
          hint: 'On level ground with nothing else pushing down, N = mg.'
        },
        {
          kind: 'numeric',
          difficulty: 'easy',
          prompt: 'A crate is pressed onto the floor with a normal force of 150 N. If $\\mu_k = 0.3$, what is the kinetic friction force while it slides, in newtons?',
          unit: 'N',
          correct: 45,
          tol: 0.5,
          explain: 'f_k = μ_k N = 0.3 × 150 = 45 N. Notice friction depends on how hard the surfaces are pressed together, not on how fast the crate is sliding.',
          hint: 'f_k = μ_k N.'
        },
        {
          kind: 'mcq',
          difficulty: 'easy',
          prompt: 'You push against a wall with 200 N. What force does the wall exert on you?',
          options: [
            '200 N back toward you',
            'Zero — the wall isn\'t moving',
            'More than 200 N, since the wall is stronger',
            'It depends on the wall\'s mass'
          ],
          correct: 0,
          explain: 'Newton\'s Third Law: forces always come in equal, opposite pairs, one on each of the two objects. The wall not moving says nothing about the force it exerts — it says the wall has other forces (the floor, the foundation) balancing it.',
          wrongExplain: { 1: 'Not moving doesn\'t mean not pushing. The wall pushes back with exactly 200 N; it stays put because the ground and its foundation balance that push, not because the force is absent.' }
        },
        {
          kind: 'numeric',
          difficulty: 'easy',
          prompt: 'A 1200 kg car accelerates at $2.5\\text{ m/s}^2$. What net force does that require, in newtons?',
          unit: 'N',
          correct: 3000,
          tol: 20,
          explain: 'F_net = ma = 1200 × 2.5 = 3000 N.',
          hint: 'F = ma — watch that the mass is in kilograms already.'
        },
        {
          kind: 'mcq',
          difficulty: 'easy',
          prompt: 'Two forces act on a box along one line: 30 N right and 12 N left. What is the net force?',
          options: ['18 N right', '42 N right', '18 N left', 'Zero'],
          correct: 0,
          explain: 'Along one line, forces add as signed numbers: +30 − 12 = +18 N, so 18 N to the right. Only this *net* value goes into F = ma, never one force on its own.',
          wrongExplain: { 1: 'Adding them as 30 + 12 treats both as pushing the same way. They oppose each other, so the leftward one subtracts.' }
        },
        {
          kind: 'numeric',
          difficulty: 'easy',
          prompt: 'A 5 kg block sits on a 30° slope. What is the component of its weight along the slope, in newtons?',
          unit: 'N',
          correct: 24.5,
          tol: 0.6,
          decimals: 1,
          explain: 'W∥ = mg sin θ = 5 × 9.81 × sin 30° = 49.05 × 0.5 ≈ 24.5 N. This along-slope component is the part of gravity actually trying to slide the block down.',
          hint: 'W∥ = mg sin θ — sin, not cos, for the along-slope part.'
        },
        {
          kind: 'mcq',
          difficulty: 'easy',
          prompt: 'An elevator moves upward at a constant speed. How does the normal force on a passenger compare with their weight?',
          options: ['Equal to their weight', 'Greater than their weight', 'Less than their weight', 'Zero'],
          correct: 0,
          explain: 'Constant speed means zero acceleration, so the vertical forces must cancel exactly: N = mg. It\'s *accelerating* upward that would make N exceed the weight — moving upward on its own does nothing.',
          wrongExplain: { 1: 'That happens while the elevator *accelerates* upward, not while it moves at a steady speed. At constant velocity there\'s no net force, so N and mg must be equal.' }
        },
        {
          kind: 'numeric',
          difficulty: 'easy',
          prompt: 'A 2 kg object is in free fall with no air resistance. What is the net force on it, in newtons?',
          unit: 'N',
          correct: 19.6,
          tol: 0.4,
          decimals: 1,
          explain: 'The only force is gravity, so F_net = W = mg = 2 × 9.81 ≈ 19.6 N downward. Check it against F = ma: 2 kg × 9.81 m/s² gives the same number, which is exactly why every object falls at g regardless of mass.',
          hint: 'In free fall, the only force acting is the weight.'
        },

        /* ---- medium (6) ---- */
        {
          kind: 'numeric',
          difficulty: 'medium',
          prompt: 'A 10 kg crate is pushed with 60 N along level ground where $\\mu_k = 0.25$. What is its acceleration, in m/s²?',
          unit: 'm/s²',
          correct: 3.55,
          tol: 0.15,
          decimals: 2,
          explain: 'Normal force N = mg = 98.1 N, so friction f_k = 0.25 × 98.1 ≈ 24.5 N opposing the push. Net force = 60 − 24.5 = 35.5 N, and a = 35.5/10 ≈ 3.55 m/s².',
          hint: 'Find the normal force, then friction, then subtract it from the push before dividing by the mass.'
        },
        {
          kind: 'numeric',
          difficulty: 'medium',
          prompt: 'A 4 kg block sits on a 20° slope. What is the normal force from the surface, in newtons?',
          unit: 'N',
          correct: 36.9,
          tol: 0.8,
          decimals: 1,
          explain: 'N = mg cos θ = 4 × 9.81 × cos 20° ≈ 39.24 × 0.9397 ≈ 36.9 N — less than the full weight of 39.2 N, because on a slope only part of the weight presses into the surface.',
          hint: 'On a slope the normal force uses cos, not sin.'
        },
        {
          kind: 'numeric',
          difficulty: 'medium',
          prompt: 'A 6 kg block rests on flat ground with $\\mu_s = 0.4$. What is the maximum horizontal force it can take before it starts to slide, in newtons?',
          unit: 'N',
          correct: 23.5,
          tol: 0.6,
          decimals: 1,
          explain: 'Maximum static friction is f_s,max = μ_s N = 0.4 × (6 × 9.81) = 0.4 × 58.86 ≈ 23.5 N. Push any harder than that and static friction can no longer match you, so the block breaks loose.',
          hint: 'The threshold is the largest value static friction can reach: μ_s N.'
        },
        {
          kind: 'mcq',
          difficulty: 'medium',
          prompt: 'An elevator accelerates *upward* at $2\\text{ m/s}^2$. How does the normal force on a passenger compare with their weight?',
          options: [
            'Greater than their weight',
            'Less than their weight',
            'Exactly equal to their weight',
            'Zero'
          ],
          correct: 0,
          explain: 'For a net upward force, the upward normal force must beat the downward weight: N − mg = ma, so N = m(g + a) — larger than mg. That extra push is exactly the heavy feeling in your feet as an elevator starts up.',
          wrongExplain: { 1: 'That\'s the *downward*-acceleration case, where you feel lighter. Accelerating upward needs a net upward force, so N has to exceed mg.' }
        },
        {
          kind: 'numeric',
          difficulty: 'medium',
          prompt: 'A block slides down a frictionless 25° incline. What is its acceleration, in m/s²?',
          unit: 'm/s²',
          correct: 4.15,
          tol: 0.15,
          decimals: 2,
          explain: 'With no friction, a = g sin θ = 9.81 × sin 25° ≈ 9.81 × 0.4226 ≈ 4.15 m/s². The mass cancels out entirely — every block on that slope accelerates the same.',
          hint: 'With μ_k = 0, the incline acceleration formula collapses to just g sin θ.'
        },
        {
          kind: 'order',
          difficulty: 'medium',
          prompt: 'Four objects each feel the same 60 N net force. Rank them by the acceleration produced, from *smallest* to *largest*.',
          items: [
            'A 30 kg object',
            'A 20 kg object',
            'A 12 kg object',
            'A 5 kg object'
          ],
          explain: 'From $a = F_{net}/m$, acceleration is inversely proportional to mass — the same force moves a heavier object less. So the heaviest accelerates least (60/30 = 2 m/s²) and the lightest most (60/5 = 12 m/s²).'
        },

        /* ---- hard (2) ---- */
        {
          kind: 'numeric',
          difficulty: 'hard',
          prompt: 'A block slides down a 30° incline with $\\mu_k = 0.2$. What is its acceleration down the slope, in m/s²?',
          unit: 'm/s²',
          correct: 3.21,
          tol: 0.15,
          decimals: 2,
          explain: 'a = g(sin θ − μ_k cos θ) = 9.81 × (sin 30° − 0.2 × cos 30°) = 9.81 × (0.5 − 0.1732) ≈ 9.81 × 0.3268 ≈ 3.21 m/s² — well down from the frictionless 4.91 m/s².',
          hint: 'a = g(sin θ − μ_k cos θ) — the friction term uses cos.'
        },
        {
          kind: 'numeric',
          difficulty: 'hard',
          prompt: 'A 70 kg person stands in an elevator accelerating downward at $1.5\\text{ m/s}^2$. What is the normal force from the floor, in newtons?',
          unit: 'N',
          correct: 581.7,
          tol: 6,
          decimals: 1,
          explain: 'Taking up as positive: N − mg = ma with a = −1.5, so N = m(g + a) = 70 × (9.81 − 1.5) = 70 × 8.31 ≈ 581.7 N — less than the 686.7 N weight, which is why you feel momentarily lighter as a lift starts down.',
          hint: 'Write N − mg = ma with a negative (downward) acceleration, then solve for N.'
        }
      ]
    }
  );

})(typeof window !== 'undefined' ? window : globalThis);
