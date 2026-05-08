const assert = require('node:assert/strict');
const test = require('node:test');

const { box, paint, visibleLength, wrapAnsi, zoneBadge } = require('../src/ui');

test('box wraps long colored content by visible width', () => {
  const rendered = box('WRAP', [paint('Sandbox: /tmp/terminal-trials-sandbox-abcdef/src/deep/file.txt', 'cyan')], 44);
  const lines = rendered.split('\n');

  assert.ok(lines.length > 5);
  for (const line of lines) {
    assert.equal(visibleLength(line), 44);
  }
  assert.match(rendered, /terminal-trials/);
  assert.match(rendered, /sandbox/);
});

test('wrapAnsi preserves ANSI color reset while wrapping visible text', () => {
  const wrapped = wrapAnsi(paint('alpha beta gamma delta', 'green'), 12);

  assert.ok(wrapped.length > 1);
  assert.ok(wrapped.every((line) => visibleLength(line) <= 12));
  assert.ok(wrapped.every((line) => line.includes('\x1b[')));
});

test('newer zones have distinct badges', () => {
  assert.deepEqual(zoneBadge('fieldcraft'), ['[Fieldcraft]', 'File Scout']);
  assert.deepEqual(zoneBadge('powertools'), ['[Power Tools]', 'Text Alchemist']);
  assert.deepEqual(zoneBadge('bash_advanced'), ['[Bash Mastery]', 'Script Sentinel']);
});
