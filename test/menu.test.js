const assert = require('node:assert/strict');
const test = require('node:test');

const { formatTypedMenuLabel, parseTypedMenuChoice } = require('../src/menu');

test('disabled typed menu options do not render as selectable shortcuts', () => {
  assert.equal(
    formatTypedMenuLabel({ key: '4', label: '4) Pipeline Forge  [LOCKED]', disabled: true }),
    '-) Pipeline Forge  [LOCKED]'
  );
});

test('disabled typed menu shortcuts remain blocked when typed', () => {
  const options = [
    { key: '1', value: 'trailhead', label: '1) Trailhead' },
    { key: '4', value: 'pipeline', label: '4) Pipeline', disabled: true }
  ];

  assert.deepEqual(parseTypedMenuChoice('4', options), { value: null, reason: 'disabled' });
  assert.deepEqual(parseTypedMenuChoice('1', options), { value: 'trailhead', reason: 'ok' });
});
