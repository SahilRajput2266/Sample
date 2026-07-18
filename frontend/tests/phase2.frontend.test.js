import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultForField, emptyFor } from '../src/components/profile/resourceManager.utils.js';
import { loadDashboardStats } from '../src/pages/dashboard.utils.js';

test('select fields initialize to their displayed first option', () => {
  const form = emptyFor([
    { name: 'proficiency', type: 'select', options: ['Beginner', 'Advanced'] },
    { name: 'active', type: 'checkbox' },
    { name: 'notes' },
  ]);
  assert.deepEqual(form, { proficiency: 'Beginner', active: false, notes: '' });
  assert.equal(defaultForField({ type: 'select', options: ['Full-time'] }), 'Full-time');
});

test('dashboard retains successful sections when one endpoint fails', async () => {
  const result = await loadDashboardStats([
    Promise.resolve({ data: { completionPercentage: 80 } }),
    Promise.reject(new Error('jobs unavailable')),
    Promise.resolve({ data: { totalApplications: 4 } }),
  ]);
  assert.deepEqual(result.data.profile, { completionPercentage: 80 });
  assert.equal(result.data.jobs, undefined);
  assert.deepEqual(result.data.applications, { totalApplications: 4 });
  assert.deepEqual(result.errors, ['Unable to load jobs statistics']);
});