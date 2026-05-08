const assert = require('node:assert/strict');
const test = require('node:test');

const { zone: bashAdvanced } = require('../src/content/zones/bash_advanced');

test('bash strict mode explanation requires pipefail', () => {
  const challenge = bashAdvanced.challenges.find((entry) => entry.title === 'Strict Mode');
  const accepts = challenge.accepted[0];

  assert.equal(accepts('It exits on errors and treats unset variables as errors.'), false);
  assert.equal(
    accepts('It exits on errors, treats unset variables as errors, and pipefail makes pipeline failures propagate.'),
    true
  );
});
