/* ============================================================
   Physics Academy sync API — 3 endpoints backed by Upstash Redis.
   POST   /api/sync         create a new sync code + empty state
   GET    /api/sync/:code   fetch stored state for a code
   PUT    /api/sync/:code   merge incoming state into stored state
   GET    /health, GET /    trivial status checks
   ============================================================ */

const express = require('express');
const cors = require('cors');
const { Redis } = require('@upstash/redis');

const PORT = process.env.PORT || 3000;

// Crockford-ish alphabet: no 0/O, 1/I/L — safe for a human to read/type on a phone.
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const CODE_RE = /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{4}-[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{4}$/;

const REDIS_UNAVAILABLE_MSG =
  'Sync backend not configured: set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.';

// Constructed lazily from env so a missing config doesn't crash the process on boot —
// local dev / a mid-misconfigured deploy should still start and answer with a clear 503.
let redis = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN
  });
}

function redisKey(code) {
  return 'sync:' + code;
}

function normalizeCode(raw) {
  if (typeof raw !== 'string') return null;
  const code = raw.trim().toUpperCase();
  return CODE_RE.test(code) ? code : null;
}

function randomGroup() {
  let s = '';
  for (let i = 0; i < 4; i++) {
    s += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return s;
}

function generateCode() {
  return randomGroup() + '-' + randomGroup();
}

async function generateUniqueCode() {
  // Collision odds are ~1 in 31^8; a handful of retries is just cheap paranoia.
  for (let i = 0; i < 5; i++) {
    const code = generateCode();
    const existing = await redis.get(redisKey(code));
    if (!existing) return code;
  }
  return generateCode();
}

function isPlainObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function validatePayload(body) {
  if (!isPlainObject(body)) return 'Body must be a JSON object.';
  if (typeof body.xp !== 'number' || !isFinite(body.xp)) return 'xp must be a finite number.';
  if (!isPlainObject(body.lessons)) return 'lessons must be an object.';
  if (body.streak !== undefined && !isPlainObject(body.streak)) return 'streak must be an object.';
  return null;
}

// Coerces one lesson record defensively so a garbled field (NaN, wrong type)
// can't poison Math.max()/comparisons during merge.
function normLesson(r) {
  if (!isPlainObject(r)) return { done: false, best: 0, attempts: 0, lastTs: 0 };
  return {
    done: !!r.done,
    best: typeof r.best === 'number' && isFinite(r.best) ? r.best : 0,
    attempts: typeof r.attempts === 'number' && isFinite(r.attempts) ? Math.max(0, Math.floor(r.attempts)) : 0,
    lastTs: typeof r.lastTs === 'number' && isFinite(r.lastTs) ? r.lastTs : 0
  };
}

function mergeStreak(existing, incoming) {
  const ex = isPlainObject(existing) ? existing : { count: 0, lastDay: null };
  const inc = isPlainObject(incoming) ? incoming : { count: 0, lastDay: null };
  const exDay = typeof ex.lastDay === 'string' ? ex.lastDay : null;
  const inDay = typeof inc.lastDay === 'string' ? inc.lastDay : null;
  const exCount = typeof ex.count === 'number' && isFinite(ex.count) ? ex.count : 0;
  const inCount = typeof inc.count === 'number' && isFinite(inc.count) ? inc.count : 0;

  if (!exDay && !inDay) return { count: 0, lastDay: null };
  if (!exDay) return { count: inCount, lastDay: inDay };
  if (!inDay) return { count: exCount, lastDay: exDay };
  if (exDay === inDay) return { count: Math.max(exCount, inCount), lastDay: exDay };
  return exDay > inDay ? { count: exCount, lastDay: exDay } : { count: inCount, lastDay: inDay };
}

function mergeState(existing, incoming) {
  const ex = isPlainObject(existing) ? existing : { xp: 0, streak: { count: 0, lastDay: null }, lessons: {} };
  const exXp = typeof ex.xp === 'number' && isFinite(ex.xp) ? ex.xp : 0;

  const exLessons = isPlainObject(ex.lessons) ? ex.lessons : {};
  const inLessons = isPlainObject(incoming.lessons) ? incoming.lessons : {};
  const lessons = {};
  const ids = Object.assign({}, exLessons, inLessons);
  for (const id in ids) {
    if (!Object.prototype.hasOwnProperty.call(ids, id)) continue;
    const hasEx = Object.prototype.hasOwnProperty.call(exLessons, id);
    const hasIn = Object.prototype.hasOwnProperty.call(inLessons, id);
    if (hasEx && hasIn) {
      const a = normLesson(exLessons[id]);
      const b = normLesson(inLessons[id]);
      lessons[id] = {
        done: a.done || b.done,
        best: Math.max(a.best, b.best),
        // attempts aren't additive across devices (we can't reconstruct which device's
        // attempts already include the other's), so max is the safe conservative choice.
        attempts: Math.max(a.attempts, b.attempts),
        lastTs: Math.max(a.lastTs, b.lastTs)
      };
    } else {
      lessons[id] = normLesson(hasEx ? exLessons[id] : inLessons[id]);
    }
  }

  return {
    xp: Math.max(exXp, incoming.xp),
    streak: mergeStreak(ex.streak, incoming.streak),
    lessons: lessons,
    updatedAt: Date.now()
  };
}

const app = express();

const ALLOWED_ORIGIN = /^https:\/\/tom-lev\.github\.io$/;
const LOCAL_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/;

app.use(cors({
  origin: function (origin, cb) {
    if (!origin) return cb(null, true); // curl, health checks, server-to-server
    if (ALLOWED_ORIGIN.test(origin) || LOCAL_ORIGIN.test(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  }
}));
app.use(express.json({ limit: '100kb' }));

app.get('/', function (req, res) {
  res.status(200).json({ status: 'ok', service: 'physics-academy-sync-api' });
});

app.get('/health', function (req, res) {
  res.status(200).json({ status: 'ok', redisConfigured: !!redis });
});

app.post('/api/sync', async function (req, res, next) {
  try {
    if (!redis) return res.status(503).json({ error: REDIS_UNAVAILABLE_MSG });
    const code = await generateUniqueCode();
    const fresh = { xp: 0, streak: { count: 0, lastDay: null }, lessons: {}, updatedAt: Date.now() };
    await redis.set(redisKey(code), fresh);
    res.status(201).json({ code: code });
  } catch (e) { next(e); }
});

app.get('/api/sync/:code', async function (req, res, next) {
  try {
    const code = normalizeCode(req.params.code);
    if (!code) return res.status(400).json({ error: 'Invalid sync code format. Expected XXXX-XXXX.' });
    if (!redis) return res.status(503).json({ error: REDIS_UNAVAILABLE_MSG });
    const state = await redis.get(redisKey(code));
    if (!state) return res.status(404).json({ error: 'No progress found for this sync code.' });
    res.status(200).json(state);
  } catch (e) { next(e); }
});

app.put('/api/sync/:code', async function (req, res, next) {
  try {
    const code = normalizeCode(req.params.code);
    if (!code) return res.status(400).json({ error: 'Invalid sync code format. Expected XXXX-XXXX.' });
    if (!redis) return res.status(503).json({ error: REDIS_UNAVAILABLE_MSG });
    const validationError = validatePayload(req.body);
    if (validationError) return res.status(400).json({ error: validationError });

    const key = redisKey(code);
    const existing = await redis.get(key);
    // PUT is an upsert: a device pushing to a code that was never explicitly
    // POST-initialized (edge case, but harmless) just merges against empty state.
    const merged = mergeState(existing, req.body);
    await redis.set(key, merged);
    res.status(200).json(merged);
  } catch (e) { next(e); }
});

app.use(function (req, res) {
  res.status(404).json({ error: 'Not found.' });
});

// eslint-disable-next-line no-unused-vars
app.use(function (err, req, res, next) {
  if (err && err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'Origin not allowed.' });
  }
  if (err && (err.type === 'entity.parse.failed' || err.type === 'entity.too.large')) {
    return res.status(400).json({ error: 'Invalid or oversized JSON body.' });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error.' });
});

if (require.main === module) {
  app.listen(PORT, function () {
    console.log('physics-academy-sync-api listening on port ' + PORT + ' (redis configured: ' + !!redis + ')');
  });
}

module.exports = app;
