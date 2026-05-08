const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { createProgressStore, legacySavePath, resolveSavePath } = require('../src/progress');

test('TT_SAVE_PATH overrides the default save path', () => {
  assert.equal(
    resolveSavePath({
      env: { TT_SAVE_PATH: '/tmp/terminal-trials-save.json' },
      platform: 'linux',
      homedir: '/home/tester'
    }),
    '/tmp/terminal-trials-save.json'
  );
});

test('default save path uses user data location outside the repo', () => {
  assert.equal(
    resolveSavePath({ env: {}, platform: 'linux', homedir: '/home/tester' }),
    '/home/tester/.local/share/terminal-trials/progress.json'
  );
  assert.equal(
    resolveSavePath({ env: {}, platform: 'darwin', homedir: '/Users/tester' }),
    '/Users/tester/Library/Application Support/Terminal Trials/progress.json'
  );
});

test('progress store reads legacy repo save when the new path is empty', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'terminal-trials-progress-'));
  const newSave = path.join(root, 'new', 'progress.json');
  const legacy = legacySavePath(root);
  fs.mkdirSync(path.dirname(legacy), { recursive: true });
  fs.writeFileSync(legacy, JSON.stringify({ name: 'Legacy Operator', moduleState: {} }));

  const store = createProgressStore({
    projectRoot: root,
    env: { TT_SAVE_PATH: newSave },
    migrateProgress: (progress) => ({ ...progress, migrated: true }),
    rankForXp: () => 'Newbie'
  });

  assert.deepEqual(store.loadProgress(), { name: 'Legacy Operator', moduleState: {}, migrated: true });
  store.saveProgress({ name: 'New Operator', xp: 0 });
  assert.equal(JSON.parse(fs.readFileSync(newSave, 'utf8')).name, 'New Operator');
});
