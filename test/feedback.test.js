const assert = require('node:assert/strict');
const test = require('node:test');

const { feedbackForAnswer, isAccepted } = require('../src/answerFeedback');

test('accepted answers produce no coaching feedback', () => {
  const challenge = {
    accepted: [/^ls\s+-la$/i],
    solution: 'ls -la',
    objective: 'List files in long format with dotfiles included.'
  };

  assert.equal(isAccepted('ls -la', challenge.accepted), true);
  assert.equal(feedbackForAnswer('ls -la', challenge), null);
});

test('missing flags are called out directly', () => {
  const challenge = {
    accepted: [/^ls\s+-la$/i],
    solution: 'ls -la',
    objective: 'List files in long format with dotfiles included.'
  };

  assert.match(feedbackForAnswer('ls', challenge), /Missing flag: -la/);
});

test('wrong echo literal points to the target text', () => {
  const challenge = {
    accepted: [/^echo\s+["']Hello,\s+terminal["']$/i],
    solution: 'echo "Hello, terminal"',
    objective: 'Use echo to print the text: Hello, terminal'
  };

  const feedback = feedbackForAnswer('echo hello', challenge);
  assert.match(feedback, /Target text: Hello, terminal/);
  assert.match(feedback, /Your text: hello/);
});

test('unrelated command reports the expected command family', () => {
  const challenge = {
    accepted: [/^cat\s+README\.md$/i],
    solution: 'cat README.md',
    objective: 'Print README.md.'
  };

  assert.match(feedbackForAnswer('grep README.md', challenge), /Start with `cat`/);
});
