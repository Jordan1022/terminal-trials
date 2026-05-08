const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

function legacySavePath(projectRoot) {
  return path.join(projectRoot, 'save', 'progress.json');
}

function resolveSavePath({
  env = process.env,
  platform = process.platform,
  homedir = os.homedir()
} = {}) {
  if (env.TT_SAVE_PATH) {
    return path.resolve(env.TT_SAVE_PATH);
  }

  if (platform === 'darwin') {
    return path.join(homedir, 'Library', 'Application Support', 'Terminal Trials', 'progress.json');
  }
  if (platform === 'win32') {
    const appData = env.APPDATA || path.join(homedir, 'AppData', 'Roaming');
    return path.join(appData, 'Terminal Trials', 'progress.json');
  }
  return path.join(homedir, '.local', 'share', 'terminal-trials', 'progress.json');
}

function readJson(filePath, migrateProgress) {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    return migrateProgress(JSON.parse(fs.readFileSync(filePath, 'utf8')));
  } catch {
    return null;
  }
}

function createProgressStore({
  projectRoot,
  env = process.env,
  platform = process.platform,
  homedir = os.homedir(),
  migrateProgress = (progress) => progress,
  rankForXp = () => ''
}) {
  const savePath = resolveSavePath({ env, platform, homedir });
  const oldPath = legacySavePath(projectRoot);

  return {
    savePath,
    legacySavePath: oldPath,
    loadProgress() {
      return readJson(savePath, migrateProgress) || readJson(oldPath, migrateProgress);
    },
    saveProgress(progress) {
      fs.mkdirSync(path.dirname(savePath), { recursive: true });
      progress.rank = rankForXp(progress.xp);
      progress.updatedAt = new Date().toISOString();
      fs.writeFileSync(savePath, JSON.stringify(progress, null, 2));
    }
  };
}

module.exports = {
  createProgressStore,
  legacySavePath,
  resolveSavePath
};
