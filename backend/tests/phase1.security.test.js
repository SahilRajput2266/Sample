// Phase 1 security/stability tests.
// Runs with Node's built-in test runner (no extra dependencies):
//   npm test   (from backend/)
//
// Uses a unique local MongoDB database on every run. The real `joborbit`
// database is never touched, and the suite does not run destructive DB cleanup.

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
process.env.MONGO_URI = `mongodb://localhost:27017/joborbit_phase1_tests_${process.pid}_${Date.now()}`;
process.env.NODE_ENV = 'test';

const { default: app } = await import('../app.js');
const { default: User } = await import('../models/User.js');
const { default: generateToken } = await import('../utils/generateToken.js');

let server;
let baseUrl;

const api = async (method, path, { token, body } = {}) => {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let data = null;
  try { data = await res.json(); } catch { /* non-JSON response */ }
  return { status: res.status, data };
};

before(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await mongoose.disconnect();
  server.close();
});

let tokenA;
let tokenB;

// --- Registration & login -------------------------------------------------

test('register: creates user, normalizes email to lowercase, returns token', async () => {
  const { status, data } = await api('POST', '/api/auth/register', {
    body: { fullName: 'User A', email: '  UserA@Example.COM ', password: 'secret123' },
  });
  assert.equal(status, 201);
  assert.equal(data.email, 'usera@example.com');
  assert.ok(data.token);
  tokenA = data.token;
});

test('register: second user', async () => {
  const { status, data } = await api('POST', '/api/auth/register', {
    body: { fullName: 'User B', email: 'userb@example.com', password: 'secret123' },
  });
  assert.equal(status, 201);
  tokenB = data.token;
});

test('login: succeeds with mixed-case email (normalization)', async () => {
  const { status, data } = await api('POST', '/api/auth/login', {
    body: { email: 'USERA@example.com', password: 'secret123' },
  });
  assert.equal(status, 200);
  assert.equal(data.email, 'usera@example.com');
  assert.ok(data.token);
});

test('login: wrong password rejected with 401', async () => {
  const { status } = await api('POST', '/api/auth/login', {
    body: { email: 'usera@example.com', password: 'wrongpass' },
  });
  assert.equal(status, 401);
});

// --- Non-string email / NoSQL operator injection --------------------------

test('login: NoSQL operator object as email is rejected (401), not executed', async () => {
  const { status } = await api('POST', '/api/auth/login', {
    body: { email: { $gt: '' }, password: 'secret123' },
  });
  assert.equal(status, 401);
});

test('register: non-string email rejected with 400', async () => {
  const { status } = await api('POST', '/api/auth/register', {
    body: { fullName: 'Evil', email: { $gt: '' }, password: 'secret123' },
  });
  assert.equal(status, 400);
});

// --- Protected routes -----------------------------------------------------

test('protected route: no token -> single 401 response', async () => {
  const { status } = await api('GET', '/api/auth/me');
  assert.equal(status, 401);
});

test('protected route: bare "Bearer" header (no token) -> 401, no crash (double-next regression)', async () => {
  const res = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { Authorization: 'Bearer' },
  });
  assert.equal(res.status, 401);
  // A second request proves the server survived (double next(err) used to throw).
  const again = await api('GET', '/api/auth/me');
  assert.equal(again.status, 401);
});

test('protected route: garbage token -> 401', async () => {
  const { status } = await api('GET', '/api/auth/me', { token: 'not.a.jwt' });
  assert.equal(status, 401);
});

test('protected route: valid token -> 200 with own user', async () => {
  const { status, data } = await api('GET', '/api/auth/me', { token: tokenA });
  assert.equal(status, 200);
  assert.equal(data.email, 'usera@example.com');
});

// --- User data isolation --------------------------------------------------

test('isolation: user B cannot see or delete user A skills', async () => {
  const created = await api('POST', '/api/profile/skills', {
    token: tokenA,
    body: { skillName: 'Node.js', proficiency: 'Advanced' },
  });
  assert.equal(created.status, 201);
  const skillId = created.data._id;

  const listB = await api('GET', '/api/profile/skills', { token: tokenB });
  assert.equal(listB.status, 200);
  assert.equal(listB.data.length, 0);

  const delB = await api('DELETE', `/api/profile/skills/${skillId}`, { token: tokenB });
  assert.equal(delB.status, 404);

  const listA = await api('GET', '/api/profile/skills', { token: tokenA });
  assert.equal(listA.data.length, 1);
});

// --- Last-admin protection ------------------------------------------------

test('last-admin: cannot demote or deactivate the only active admin', async () => {
  const admin = await User.create({
    fullName: 'Root Admin',
    email: 'rootadmin@example.com',
    password: 'Admin@123456',
    role: 'admin',
  });
  const adminToken = generateToken(admin._id);

  const demote = await api('PUT', `/api/admin/users/${admin._id}`, {
    token: adminToken,
    body: { role: 'user' },
  });
  assert.equal(demote.status, 400);
  assert.match(demote.data.message, /last active admin/i);

  const deactivate = await api('PATCH', `/api/admin/users/${admin._id}/status`, {
    token: adminToken,
    body: { isActive: false },
  });
  assert.equal(deactivate.status, 400);

  // Other fields remain editable on the last admin.
  const rename = await api('PUT', `/api/admin/users/${admin._id}`, {
    token: adminToken,
    body: { fullName: 'Renamed Admin' },
  });
  assert.equal(rename.status, 200);
  assert.equal(rename.data.fullName, 'Renamed Admin');

  // With a second active admin present, demotion is allowed again.
  await User.create({
    fullName: 'Second Admin',
    email: 'admin2@example.com',
    password: 'Admin@123456',
    role: 'admin',
  });
  const demoteNow = await api('PUT', `/api/admin/users/${admin._id}`, {
    token: adminToken,
    body: { role: 'user' },
  });
  assert.equal(demoteNow.status, 200);
  assert.equal(demoteNow.data.role, 'user');
});

// --- Auth rate limiting (LAST: exhausts the login limiter) ----------------

test('rate limit: repeated login attempts hit 429 with clear message', async () => {
  let got429 = null;
  for (let i = 0; i < 15; i++) {
    const res = await api('POST', '/api/auth/login', {
      body: { email: 'usera@example.com', password: 'wrongpass' },
    });
    if (res.status === 429) { got429 = res; break; }
    assert.equal(res.status, 401);
  }
  assert.ok(got429, 'expected a 429 within 15 attempts');
  assert.match(got429.data.message, /too many authentication attempts/i);
});
