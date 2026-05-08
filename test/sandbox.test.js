const assert = require('node:assert/strict');
const test = require('node:test');

const { isSafeCommand } = require('../src/sandbox');

test('safe training commands are allowed', () => {
  assert.equal(isSafeCommand('grep "ERROR" app.log').safe, true);
  assert.equal(isSafeCommand('sort access.log | uniq -c | sort -nr | head -n 5').safe, true);
  assert.equal(isSafeCommand('echo "deploy ok" >> deploy.log').safe, true);
  assert.equal(isSafeCommand('find . -name "*.tmp" | xargs rm').safe, true);
  assert.equal(isSafeCommand('find . -name "*.log" -exec gzip {} +').safe, true);
  assert.equal(isSafeCommand('cd ..').safe, true);
});

test('unsafe shell features and escape paths are blocked', () => {
  const blocked = [
    'cat /etc/passwd',
    'cat ../secret.txt',
    'echo $(whoami)',
    'echo `whoami`',
    'echo ok; rm temp.txt',
    'echo ok && rm temp.txt',
    'curl https://example.com',
    'sudo ls',
    'rm -rf .',
    'find . -name "*.tmp" | xargs sh -c "echo unsafe"',
    'find . -name "*.log" -exec sh -c "echo unsafe" {} +'
  ];

  for (const command of blocked) {
    assert.equal(isSafeCommand(command).safe, false, command);
  }
});
