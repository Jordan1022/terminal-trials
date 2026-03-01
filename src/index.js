const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline/promises');
const readlineCore = require('node:readline');
const { stdin, stdout } = require('node:process');

const { modules, codex, rankTiers } = require('./content/index');
const { paint, bold, dim, clear, line, box, progressBar, banner, flavorArt } = require('./ui');
const { createSandbox, cleanupSandbox, executeInSandbox } = require('./sandbox');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SAVE_PATH = path.join(PROJECT_ROOT, 'save', 'progress.json');
const GUIDED_FILESYSTEM_SANDBOX_MODULES = new Set(['trailhead', 'pipeline', 'scripting', 'dotfiles']);
const GUIDED_MOCK_SANDBOX_MODULES = new Set(['workflow', 'tmux', 'ssh']);

function rankForXp(xp) {
  let rank = rankTiers[0].title;
  for (const tier of rankTiers) {
    if (xp >= tier.xp) {
      rank = tier.title;
    }
  }
  return rank;
}

function buildNewProgress(name) {
  const moduleState = {};
  modules.forEach((module, index) => {
    moduleState[module.id] = {
      unlocked: index === 0,
      trainingCompleted: false,
      completed: false,
      currentChallenge: 0
    };
  });

  return {
    name,
    xp: 0,
    rank: rankForXp(0),
    totalAnswered: 0,
    correctAnswers: 0,
    flashBest: 0,
    placementCompleted: false,
    moduleState,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function ensureSaveDir() {
  fs.mkdirSync(path.dirname(SAVE_PATH), { recursive: true });
}

function migrateProgress(progress) {
  if (!progress || !progress.moduleState) {
    return progress;
  }

  modules.forEach((module, index) => {
    if (!progress.moduleState[module.id]) {
      const prevModule = index > 0 ? modules[index - 1] : null;
      const prevCompleted = prevModule && progress.moduleState[prevModule.id]?.completed;
      progress.moduleState[module.id] = {
        unlocked: index === 0 || Boolean(prevCompleted),
        trainingCompleted: false,
        completed: false,
        currentChallenge: 0
      };
    }

    if (progress.moduleState[module.id].trainingCompleted === undefined) {
      const state = progress.moduleState[module.id];
      state.trainingCompleted = Boolean(state.completed || state.currentChallenge > 0);
    }
  });

  if (progress.placementCompleted === undefined) {
    progress.placementCompleted = false;
  }

  return progress;
}

function loadProgress() {
  try {
    if (!fs.existsSync(SAVE_PATH)) {
      return null;
    }
    return migrateProgress(JSON.parse(fs.readFileSync(SAVE_PATH, 'utf8')));
  } catch (error) {
    return null;
  }
}

function saveProgress(progress) {
  ensureSaveDir();
  progress.rank = rankForXp(progress.xp);
  progress.updatedAt = new Date().toISOString();
  fs.writeFileSync(SAVE_PATH, JSON.stringify(progress, null, 2));
}

function normalizeCommand(value) {
  return value.trim().replace(/\s+/g, ' ');
}

function isAccepted(answer, acceptedRules) {
  const normalized = normalizeCommand(answer);
  const lowered = normalized.toLowerCase();

  return acceptedRules.some((rule) => {
    if (typeof rule === 'string') {
      return lowered === normalizeCommand(rule).toLowerCase();
    }
    if (rule instanceof RegExp) {
      return rule.test(normalized);
    }
    if (typeof rule === 'function') {
      return rule(normalized);
    }
    return false;
  });
}

function moduleCompletion(progress) {
  const completed = modules.filter((m) => progress.moduleState[m.id]?.completed).length;
  return {
    completed,
    total: modules.length,
    pct: Math.round((completed / modules.length) * 100)
  };
}

function accuracy(progress) {
  if (progress.totalAnswered === 0) {
    return 0;
  }
  return Math.round((progress.correctAnswers / progress.totalAnswered) * 100);
}

function hasCampaignActivity(progress) {
  if (!progress) {
    return false;
  }

  if (progress.totalAnswered > 0 || progress.xp > 0 || progress.flashBest > 0) {
    return true;
  }

  if (!progress.moduleState) {
    return false;
  }

  return modules.some((module) => {
    const state = progress.moduleState[module.id];
    return Boolean(state && (state.completed || state.currentChallenge > 0 || state.trainingCompleted));
  });
}

async function ask(rl, prompt) {
  const answer = await rl.question(paint(prompt, 'cyan'));
  return answer.trim();
}

async function pause(rl, message = 'Press Enter to continue...') {
  await ask(rl, `\n${message} `);
}

function supportsArrowMenus() {
  if (process.env.TT_NO_RAW_MENU === '1') {
    return false;
  }
  return Boolean(stdin.isTTY && stdout.isTTY && typeof stdin.setRawMode === 'function');
}

function firstEnabledIndex(options) {
  const idx = options.findIndex((option) => !option.disabled);
  return idx >= 0 ? idx : 0;
}

function nextEnabledIndex(options, start, delta) {
  const len = options.length;
  if (len === 0) {
    return 0;
  }

  let idx = start;
  for (let i = 0; i < len; i += 1) {
    idx = (idx + delta + len) % len;
    if (!options[idx].disabled) {
      return idx;
    }
  }
  return start;
}

function parseTypedMenuChoice(choice, options) {
  const trimmed = choice.trim();
  if (!trimmed) {
    return { value: null, reason: 'invalid' };
  }

  const byKey = options.find((option) => option.key === trimmed);
  if (byKey) {
    if (byKey.disabled) {
      return { value: null, reason: 'disabled' };
    }
    return { value: byKey.value, reason: 'ok' };
  }

  if (/^\d+$/.test(trimmed)) {
    const index = Number(trimmed) - 1;
    if (index >= 0 && index < options.length) {
      const option = options[index];
      if (option.disabled) {
        return { value: null, reason: 'disabled' };
      }
      return { value: option.value, reason: 'ok' };
    }
  }

  return { value: null, reason: 'invalid' };
}

async function chooseMenuOption(rl, { render, options, prompt = 'Select: ' }) {
  if (!supportsArrowMenus()) {
    while (true) {
      clear();
      render();
      console.log();
      options.forEach((option) => {
        console.log(option.label);
      });

      const typed = await ask(rl, `\n${prompt}`);
      const parsed = parseTypedMenuChoice(typed, options);
      if (parsed.reason === 'ok') {
        return parsed.value;
      }
      if (parsed.reason === 'disabled') {
        console.log(paint('\nThat option is currently disabled.', 'red'));
        await pause(rl);
        continue;
      }
      console.log(paint('\nUnknown menu option.', 'red'));
      await pause(rl);
    }
  }

  return new Promise((resolve) => {
    let selected = firstEnabledIndex(options);
    const wasRaw = Boolean(stdin.isRaw);

    const draw = (statusText = '') => {
      clear();
      render();
      console.log();
      options.forEach((option, index) => {
        const marker = index === selected ? paint('> ', 'cyan') : '  ';
        const text = option.disabled ? dim(option.label) : option.label;
        console.log(`${marker}${text}`);
      });
      console.log();
      console.log(dim(statusText || 'Use Up/Down arrows and Enter. Number keys also work.'));
    };

    const finish = (value) => {
      stdin.off('keypress', onKeypress);
      if (!wasRaw) {
        stdin.setRawMode(false);
      }
      resolve(value);
    };

    const onKeypress = (str, key) => {
      if (key && key.ctrl && key.name === 'c') {
        finish('__interrupt');
        return;
      }

      if (key && key.name === 'up') {
        selected = nextEnabledIndex(options, selected, -1);
        draw();
        return;
      }

      if (key && key.name === 'down') {
        selected = nextEnabledIndex(options, selected, 1);
        draw();
        return;
      }

      if (key && (key.name === 'return' || key.name === 'enter')) {
        const option = options[selected];
        if (option && !option.disabled) {
          finish(option.value);
          return;
        }
        draw('That option is currently disabled.');
        return;
      }

      if (typeof str === 'string' && /^[0-9]$/.test(str)) {
        const option = options.find((entry) => entry.key === str);
        if (!option) {
          draw('Unknown shortcut key.');
          return;
        }
        if (option.disabled) {
          draw('That option is currently disabled.');
          return;
        }
        finish(option.value);
      }
    };

    readlineCore.emitKeypressEvents(stdin);
    stdin.resume();
    if (!wasRaw) {
      stdin.setRawMode(true);
    }
    stdin.on('keypress', onKeypress);
    draw();
  });
}

function normalizeShortcutToken(token) {
  if (!token) {
    return '';
  }

  return String(token)
    .trim()
    .toLowerCase()
    .replace(/^control\+/, 'ctrl+')
    .replace(/^control-/, 'ctrl+')
    .replace(/^ctrl-/, 'ctrl+')
    .replace(/^option\+/, 'alt+')
    .replace(/^option-/, 'alt+')
    .replace(/^meta\+/, 'alt+')
    .replace(/^meta-/, 'alt+')
    .replace(/\s+/g, '');
}

function normalizeShortcutSequences(challenge) {
  const sequences = Array.isArray(challenge.acceptedKeySequences) ? challenge.acceptedKeySequences : [];
  return sequences
    .map((sequence) => (Array.isArray(sequence) ? sequence : [sequence]))
    .map((sequence) => sequence.map((token) => normalizeShortcutToken(token)).filter(Boolean))
    .filter((sequence) => sequence.length > 0);
}

function sequenceEquals(left, right) {
  if (left.length !== right.length) {
    return false;
  }
  for (let i = 0; i < left.length; i += 1) {
    if (left[i] !== right[i]) {
      return false;
    }
  }
  return true;
}

function sequenceStartsWith(sequence, prefix) {
  if (prefix.length > sequence.length) {
    return false;
  }
  for (let i = 0; i < prefix.length; i += 1) {
    if (sequence[i] !== prefix[i]) {
      return false;
    }
  }
  return true;
}

function shortcutTokenFromKeypress(str, key) {
  if (key && key.ctrl && key.name) {
    return normalizeShortcutToken(`ctrl+${key.name}`);
  }
  if (key && key.meta && key.name) {
    return normalizeShortcutToken(`alt+${key.name}`);
  }
  if (key && (key.name === 'return' || key.name === 'enter')) {
    return 'enter';
  }
  if (key && key.name === 'space') {
    return 'space';
  }
  if (key && key.name === 'escape') {
    return 'escape';
  }
  if (key && key.name && key.name.length === 1) {
    return key.name.toLowerCase();
  }
  if (typeof str === 'string' && str.length === 1) {
    return str.toLowerCase();
  }
  return '';
}

function formatShortcutToken(token) {
  const normalized = normalizeShortcutToken(token);
  if (!normalized) {
    return '';
  }
  if (normalized === 'space') {
    return 'Space';
  }
  if (normalized === 'enter') {
    return 'Enter';
  }
  if (normalized === 'escape') {
    return 'Esc';
  }
  if (normalized.includes('+')) {
    return normalized
      .split('+')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('+');
  }
  return normalized.toUpperCase();
}

function formatShortcutSequence(sequence) {
  return sequence.map((token) => formatShortcutToken(token)).join(' then ');
}

async function captureShortcutSequence(rl, challenge) {
  const acceptedSequences = normalizeShortcutSequences(challenge);
  if (!acceptedSequences.length || !supportsArrowMenus()) {
    const typed = await ask(rl, '\nshortcut> ');
    return { mode: 'typed', typed };
  }

  return new Promise((resolve) => {
    const wasRaw = Boolean(stdin.isRaw);
    const maxLen = acceptedSequences.reduce((acc, sequence) => Math.max(acc, sequence.length), 1);
    let captured = [];
    let idleTimer = null;

    const cleanup = () => {
      if (idleTimer) {
        clearTimeout(idleTimer);
        idleTimer = null;
      }
      stdin.off('keypress', onKeypress);
      if (!wasRaw) {
        stdin.setRawMode(false);
      }
    };

    const finish = (result) => {
      cleanup();
      resolve(result);
    };

    const scheduleIdleResolution = () => {
      if (idleTimer) {
        clearTimeout(idleTimer);
      }
      idleTimer = setTimeout(() => finish({ mode: 'keypress', sequence: captured }), 1100);
    };

    const onKeypress = (str, key) => {
      const token = shortcutTokenFromKeypress(str, key);
      if (!token) {
        return;
      }

      if (captured.length === 0 && token === 'h') {
        finish({ mode: 'control', action: 'hint' });
        return;
      }
      if (captured.length === 0 && token === 'k') {
        finish({ mode: 'control', action: 'skip' });
        return;
      }

      captured.push(token);
      console.log(`${paint('Captured:', 'cyan')} ${formatShortcutSequence(captured)}`);

      const exact = acceptedSequences.some((sequence) => sequenceEquals(sequence, captured));
      const anyPrefix = acceptedSequences.some((sequence) => sequenceStartsWith(sequence, captured));
      const hasLongerPrefix = acceptedSequences.some(
        (sequence) => sequence.length > captured.length && sequenceStartsWith(sequence, captured)
      );

      if (exact && !hasLongerPrefix) {
        finish({ mode: 'keypress', sequence: captured });
        return;
      }
      if (!anyPrefix || captured.length >= maxLen) {
        finish({ mode: 'keypress', sequence: captured });
        return;
      }

      scheduleIdleResolution();
    };

    readlineCore.emitKeypressEvents(stdin);
    stdin.resume();
    if (!wasRaw) {
      stdin.setRawMode(true);
    }
    stdin.on('keypress', onKeypress);
  });
}

function isAcceptedShortcutSequence(challenge, sequence) {
  const acceptedSequences = normalizeShortcutSequences(challenge);
  const normalized = (sequence || []).map((token) => normalizeShortcutToken(token)).filter(Boolean);
  return acceptedSequences.some((allowed) => sequenceEquals(allowed, normalized));
}

function shuffle(list) {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function unlockNextModule(progress, currentModuleId) {
  const idx = modules.findIndex((module) => module.id === currentModuleId);
  const next = modules[idx + 1];
  if (!next) {
    return null;
  }
  if (!progress.moduleState[next.id].unlocked) {
    progress.moduleState[next.id].unlocked = true;
    return next;
  }
  return null;
}

function width() {
  return Math.min(100, Math.max(72, stdout.columns || 80));
}

function renderFlavor(moduleId, pose, caption) {
  console.log(flavorArt({ moduleId, pose, caption }));
}

function renderPlayerCard(progress) {
  const completion = moduleCompletion(progress);
  const stats = [
    `Operator: ${bold(progress.name)}   Rank: ${paint(progress.rank, 'yellow')}`,
    `XP: ${progress.xp}   Accuracy: ${accuracy(progress)}%   Flash Best: ${progress.flashBest}/5`,
    `Campaign Completion: ${completion.completed}/${completion.total}`,
    progressBar(completion.completed, completion.total, 34)
  ];
  return box('COMMAND DECK', stats, width());
}

function missionStatus(progress, module) {
  const state = progress.moduleState[module.id];
  if (!state.unlocked) {
    return paint('LOCKED', 'red');
  }
  if (state.completed) {
    return paint('CLEARED', 'green');
  }
  if (!state.trainingCompleted) {
    return paint('TRAIN', 'cyan');
  }
  return paint('READY', 'yellow');
}

function setupGuidedSandboxFixture(moduleId, sandboxDir) {
  if (moduleId === 'trailhead') {
    fs.mkdirSync(path.join(sandboxDir, 'src'), { recursive: true });
    fs.writeFileSync(path.join(sandboxDir, '.env'), 'APP_ENV=dev\n');
    fs.writeFileSync(path.join(sandboxDir, 'README.md'), '# Sandbox\n');
    return;
  }

  if (moduleId === 'pipeline') {
    fs.writeFileSync(
      path.join(sandboxDir, 'app.log'),
      [
        'INFO service boot',
        'ERROR db unavailable',
        'INFO retrying',
        'ERROR timeout'
      ].join('\n') + '\n'
    );
    fs.writeFileSync(
      path.join(sandboxDir, 'access.log'),
      [
        '10.0.0.2',
        '10.0.0.3',
        '10.0.0.2',
        '10.0.0.4',
        '10.0.0.2',
        '10.0.0.3',
        '10.0.0.5'
      ].join('\n') + '\n'
    );
    fs.writeFileSync(path.join(sandboxDir, 'deploy.log'), 'boot ok\n');
    fs.mkdirSync(path.join(sandboxDir, 'src'), { recursive: true });
    fs.mkdirSync(path.join(sandboxDir, 'lib'), { recursive: true });
    fs.writeFileSync(path.join(sandboxDir, 'src', 'index.js'), 'console.log("hi");\n');
    fs.writeFileSync(path.join(sandboxDir, 'lib', 'util.js'), 'module.exports = {};\n');
    fs.writeFileSync(path.join(sandboxDir, 'README.md'), 'not js\n');
    return;
  }

  if (moduleId === 'scripting') {
    fs.writeFileSync(path.join(sandboxDir, 'config.json'), '{\"ok\":true}\n');
    fs.writeFileSync(path.join(sandboxDir, 'a.log'), 'a\n');
    fs.writeFileSync(path.join(sandboxDir, 'b.log'), 'b\n');
    fs.writeFileSync(path.join(sandboxDir, 'script.sh'), '#!/bin/bash\necho run\n');
    return;
  }

  if (moduleId === 'dotfiles') {
    fs.mkdirSync(path.join(sandboxDir, 'bin'), { recursive: true });
    fs.writeFileSync(path.join(sandboxDir, '.bashrc'), '# bash rc\n');
    fs.writeFileSync(path.join(sandboxDir, '.zshrc'), '# zsh rc\n');
    return;
  }

  if (moduleId === 'workflow') {
    fs.mkdirSync(path.join(sandboxDir, 'project'), { recursive: true });
    fs.writeFileSync(path.join(sandboxDir, 'deploy.sh'), '#!/bin/bash\necho deploy\n');
    return;
  }

  if (moduleId === 'ssh') {
    fs.writeFileSync(path.join(sandboxDir, 'report.pdf'), 'mock report\n');
    fs.mkdirSync(path.join(sandboxDir, 'build'), { recursive: true });
    fs.writeFileSync(path.join(sandboxDir, 'build', 'index.html'), '<h1>build</h1>\n');
    return;
  }
}

function shouldUseGuidedSandbox(module, challenge) {
  if (!(GUIDED_FILESYSTEM_SANDBOX_MODULES.has(module.id) || GUIDED_MOCK_SANDBOX_MODULES.has(module.id))) {
    return false;
  }
  if (challenge.inputMode) {
    return false;
  }
  return true;
}

function createMockRuntime(moduleId, sandboxDir) {
  if (moduleId === 'workflow') {
    return {
      moduleId,
      processes: [
        { pid: 4242, cmd: 'nginx: master process /usr/sbin/nginx', running: true },
        { pid: 4310, cmd: 'nginx: worker process', running: true },
        { pid: 1188, cmd: 'node api.js', running: true }
      ],
      files: {
        deployShExecutable: false,
        backupCreated: false
      },
      env: {
        APP_ENV: 'dev'
      },
      sandboxDir
    };
  }

  if (moduleId === 'tmux') {
    return {
      moduleId,
      sessionName: null,
      attached: false,
      paneCount: 1,
      copyMode: false,
      selecting: false,
      bufferReady: false
    };
  }

  if (moduleId === 'ssh') {
    return {
      moduleId,
      keyGenerated: false,
      connectedHost: null,
      remoteTmpFiles: new Set(),
      remoteWwwSynced: false,
      tunnelActive: false,
      sandboxDir
    };
  }

  return null;
}

function executeInMockRuntime(moduleId, command, runtime) {
  const input = normalizeCommand(command);

  if (moduleId === 'workflow') {
    if (/^ps\s+aux\s*\|\s*grep\s+nginx$/i.test(input)) {
      const lines = runtime.processes
        .filter((p) => p.running && p.cmd.includes('nginx'))
        .map((p) => `root     ${p.pid}  0.0  0.1  123456  1234 ?        Ss   00:00   0:00 ${p.cmd}`);
      lines.push('jordan   7777  0.0  0.0   4242   256 pts/0    S+   00:00   0:00 grep nginx');
      return { stdout: `${lines.join('\n')}\n`, stderr: '', exitCode: 0, blocked: false };
    }

    if (/^pgrep\s+-a\s+nginx$/i.test(input)) {
      const lines = runtime.processes
        .filter((p) => p.running && p.cmd.includes('nginx'))
        .map((p) => `${p.pid} ${p.cmd}`);
      return { stdout: `${lines.join('\n')}\n`, stderr: '', exitCode: lines.length ? 0 : 1, blocked: false };
    }

    if (/^kill(\s+-15)?\s+4242$/i.test(input)) {
      const target = runtime.processes.find((p) => p.pid === 4242 && p.running);
      if (!target) {
        return { stdout: '', stderr: 'kill: 4242: no such process', exitCode: 1, blocked: false };
      }
      target.running = false;
      return { stdout: '', stderr: '', exitCode: 0, blocked: false };
    }

    if (/^chmod\s+(\+x|u\+x)\s+deploy\.sh$/i.test(input)) {
      runtime.files.deployShExecutable = true;
      return { stdout: '', stderr: '', exitCode: 0, blocked: false };
    }

    if (/^tar\s+-czf\s+backup\.tgz\s+project\/?$/i.test(input)) {
      runtime.files.backupCreated = true;
      fs.writeFileSync(path.join(runtime.sandboxDir, 'backup.tgz'), 'mock-tarball\n');
      return { stdout: '', stderr: '', exitCode: 0, blocked: false };
    }

    if (/^export\s+APP_ENV=production$/i.test(input) || /^APP_ENV=production\s+export\s+APP_ENV$/i.test(input)) {
      runtime.env.APP_ENV = 'production';
      return { stdout: '', stderr: '', exitCode: 0, blocked: false };
    }

    return { stdout: '', stderr: 'mock-shell: command not modeled for Workflow sandbox.', exitCode: 1, blocked: false };
  }

  if (moduleId === 'tmux') {
    const createMatch = input.match(/^tmux\s+(new|new-session)\s+-s\s+([a-zA-Z0-9_-]+)$/i);
    if (createMatch) {
      runtime.sessionName = createMatch[2];
      runtime.attached = true;
      runtime.paneCount = 1;
      runtime.copyMode = false;
      runtime.selecting = false;
      runtime.bufferReady = false;
      return { stdout: `[mock tmux] session '${runtime.sessionName}' created and attached\n`, stderr: '', exitCode: 0, blocked: false };
    }

    if (/^tmux\s+(split-window|splitw)\s+-h$/i.test(input)) {
      if (!runtime.sessionName) {
        return { stdout: '', stderr: 'mock tmux: no active session', exitCode: 1, blocked: false };
      }
      runtime.paneCount += 1;
      return { stdout: `[mock tmux] split horizontal, panes=${runtime.paneCount}\n`, stderr: '', exitCode: 0, blocked: false };
    }

    if (/^tmux\s+(split-window|splitw)\s+-v$/i.test(input)) {
      if (!runtime.sessionName) {
        return { stdout: '', stderr: 'mock tmux: no active session', exitCode: 1, blocked: false };
      }
      runtime.paneCount += 1;
      return { stdout: `[mock tmux] split vertical, panes=${runtime.paneCount}\n`, stderr: '', exitCode: 0, blocked: false };
    }

    if (/^tmux\s+copy-mode$/i.test(input) || /^ctrl\+b\s+\[$/i.test(input) || /^ctrl-b\s+\[$/i.test(input)) {
      runtime.copyMode = true;
      runtime.selecting = false;
      return { stdout: '[mock tmux] copy mode enabled\n', stderr: '', exitCode: 0, blocked: false };
    }

    if (/^(space|v)$/i.test(input)) {
      if (!runtime.copyMode) {
        return { stdout: '', stderr: 'mock tmux: enter copy mode first', exitCode: 1, blocked: false };
      }
      runtime.selecting = true;
      return { stdout: '[mock tmux] selection started\n', stderr: '', exitCode: 0, blocked: false };
    }

    if (/^(enter|y)$/i.test(input)) {
      if (!runtime.selecting) {
        return { stdout: '', stderr: 'mock tmux: no active selection', exitCode: 1, blocked: false };
      }
      runtime.selecting = false;
      runtime.copyMode = false;
      runtime.bufferReady = true;
      return { stdout: '[mock tmux] selection yanked to buffer\n', stderr: '', exitCode: 0, blocked: false };
    }

    if (/^tmux\s+detach$/i.test(input) || /^ctrl\+b\s+d$/i.test(input) || /^ctrl-b\s+d$/i.test(input)) {
      if (!runtime.attached) {
        return { stdout: '', stderr: 'mock tmux: already detached', exitCode: 1, blocked: false };
      }
      runtime.attached = false;
      return { stdout: '[mock tmux] detached session\n', stderr: '', exitCode: 0, blocked: false };
    }

    const attachMatch = input.match(/^tmux\s+(attach|attach-session|a)\s+-t\s+([a-zA-Z0-9_-]+)$/i);
    if (attachMatch) {
      const target = attachMatch[2];
      if (!runtime.sessionName || runtime.sessionName !== target) {
        return { stdout: '', stderr: `mock tmux: session '${target}' not found`, exitCode: 1, blocked: false };
      }
      runtime.attached = true;
      return { stdout: `[mock tmux] attached to '${target}'\n`, stderr: '', exitCode: 0, blocked: false };
    }

    return { stdout: '', stderr: 'mock-shell: command not modeled for tmux sandbox.', exitCode: 1, blocked: false };
  }

  if (moduleId === 'ssh') {
    if (/^ssh\s+deploy@10\.0\.1\.50$/i.test(input) || /^ssh\s+-l\s+deploy\s+10\.0\.1\.50$/i.test(input)) {
      runtime.connectedHost = 'deploy@10.0.1.50';
      return { stdout: '[mock ssh] connected to deploy@10.0.1.50\n', stderr: '', exitCode: 0, blocked: false };
    }

    if (/^ssh-keygen\s+-t\s+ed25519(\s+-C\s+.+)?$/i.test(input)) {
      runtime.keyGenerated = true;
      const sshDir = path.join(runtime.sandboxDir, '.ssh');
      fs.mkdirSync(sshDir, { recursive: true });
      fs.writeFileSync(path.join(sshDir, 'id_ed25519'), 'mock-private-key\n');
      fs.writeFileSync(path.join(sshDir, 'id_ed25519.pub'), 'mock-public-key\n');
      return { stdout: '[mock ssh-keygen] generated ~/.ssh/id_ed25519\n', stderr: '', exitCode: 0, blocked: false };
    }

    if (/^scp\s+report\.pdf\s+deploy@10\.0\.1\.50:\/tmp\/?$/i.test(input)) {
      runtime.remoteTmpFiles.add('report.pdf');
      return { stdout: 'report.pdf                                  100%  12B   0.0KB/s   00:00\n', stderr: '', exitCode: 0, blocked: false };
    }

    if (/^rsync\s+-avz\s+(\.\/)?build\/?\s+deploy@10\.0\.1\.50:\/var\/www\/?$/i.test(input)) {
      runtime.remoteWwwSynced = true;
      return {
        stdout: 'sending incremental file list\n./\nindex.html\n\nsent 145 bytes  received 22 bytes  334.00 bytes/sec\n',
        stderr: '',
        exitCode: 0,
        blocked: false
      };
    }

    if (/^ssh\s+-L\s+5432:(localhost|127\.0\.0\.1):5432\s+deploy@10\.0\.1\.50$/i.test(input)) {
      runtime.tunnelActive = true;
      return { stdout: '[mock ssh] tunnel active on localhost:5432\n', stderr: '', exitCode: 0, blocked: false };
    }

    return { stdout: '', stderr: 'mock-shell: command not modeled for SSH sandbox.', exitCode: 1, blocked: false };
  }

  return { stdout: '', stderr: 'mock runtime unavailable', exitCode: 1, blocked: false };
}

async function runPlacementTest(rl, progress) {
  for (const module of modules) {
    const eligible = module.challenges.filter((c) => c.inputMode !== 'sandbox');
    if (eligible.length < 2) {
      continue;
    }

    const testChallenges = [eligible[0], eligible[eligible.length - 1]];
    let passedBoth = true;

    clear();
    renderFlavor(module.id, 'coach', 'Placement duel: prove mastery or train from here.');
    console.log();
    console.log(
      box('PLACEMENT TEST', [
        `Zone: ${module.name}`,
        'Answer 2 questions correctly to skip this zone.',
        dim('No XP is awarded during placement.')
      ], width())
    );
    await pause(rl, 'Press Enter to start...');

    for (const challenge of testChallenges) {
      clear();
      renderFlavor(module.id, 'mission', challenge.title);
      console.log();
      console.log(
        box('PLACEMENT', [
          `Zone: ${module.name}`,
          `Objective: ${bold(challenge.objective)}`
        ], width())
      );

      const prompt = challenge.inputMode === 'explain' ? '\nexplain> ' : '\ncommand> ';
      const answer = await ask(rl, prompt);
      if (!isAccepted(answer, challenge.accepted)) {
        passedBoth = false;
        console.log(paint('\nMissed.', 'red'));
        console.log(`${paint('Reference:', 'yellow')} ${challenge.solution}`);
        await pause(rl);
        break;
      }
      console.log(paint('\nCorrect.', 'green'));
      await pause(rl);
    }

    if (passedBoth) {
      progress.moduleState[module.id].trainingCompleted = true;
      progress.moduleState[module.id].completed = true;
      progress.moduleState[module.id].currentChallenge = module.challenges.length;
      unlockNextModule(progress, module.id);
      saveProgress(progress);
      console.log(paint(`\n${module.name}: SKIPPED (placement pass)`, 'green'));
      await pause(rl);
    } else {
      progress.placementCompleted = true;
      saveProgress(progress);
      console.log(paint(`\nPlacement complete. You'll start at: ${module.name}`, 'yellow'));
      await pause(rl);
      return;
    }
  }

  progress.placementCompleted = true;
  saveProgress(progress);
  console.log(paint('\nAll zones passed. You\'re placed at max level.', 'green'));
  await pause(rl);
}

async function onboarding(rl) {
  const existing = loadProgress();

  if (!existing) {
    clear();
    console.log(banner());
    console.log();
    console.log(paint('Terminal Trials', 'yellow'));
    console.log(dim('Train shell and tmux skills through mission-based command challenges.'));
    console.log();
    renderFlavor(null, 'coach', 'A little terminal buddy will guide your training.');
    console.log();
    const typedName = await ask(rl, 'Choose your operator callsign (blank for Operator): ');
    const name = typedName || 'Operator';
    const created = buildNewProgress(name);
    saveProgress(created);

    const placementChoice = await chooseMenuOption(rl, {
      render: () => {
        renderFlavor(null, 'alert', 'Quick calibration before campaign start.');
        console.log();
        console.log();
        console.log(paint('Skill Assessment', 'yellow'));
        console.log('Already know your way around a terminal?');
        console.log(dim('Take a quick placement test to skip zones you\'ve mastered.'));
      },
      options: [
        { key: '1', value: 'test', label: '1) Take placement test' },
        { key: '2', value: 'skip', label: '2) Start from the beginning' }
      ]
    });

    if (placementChoice === 'test') {
      await runPlacementTest(rl, created);
    }

    return created;
  }

  while (true) {
    const canContinue = hasCampaignActivity(existing);
    const choice = await chooseMenuOption(rl, {
      render: () => {
        console.log(banner());
        console.log();
        renderFlavor(null, 'idle', 'Pick your path.');
        console.log();
        console.log(renderPlayerCard(existing));
      },
      options: [
        {
          key: '1',
          value: 'continue',
          label: canContinue
            ? '1) Continue campaign'
            : `1) Continue campaign ${dim('(disabled: no missions played yet)')}`,
          disabled: !canContinue
        },
        { key: '2', value: 'new', label: '2) New operator profile (overwrite save)' },
        { key: '0', value: 'exit', label: '0) Exit' }
      ]
    });

    if (choice === 'continue') {
      return existing;
    }

    if (choice === 'new') {
      const typedName = await ask(rl, 'New operator callsign: ');
      const name = typedName || 'Operator';
      const created = buildNewProgress(name);
      saveProgress(created);
      return created;
    }

    if (choice === 'exit') {
      return null;
    }

    if (choice === '__interrupt' || choice === null) {
      console.log(paint('\nUse option 0 to exit the app.', 'yellow'));
      await pause(rl);
      continue;
    }
  }
}

async function runChallenge(rl, module, challenge, challengeIndex) {
  let attempts = 0;
  const keypressMode = challenge.inputMode === 'keypress';
  const explainMode = challenge.inputMode === 'explain';

  while (attempts < 3) {
    clear();
    renderFlavor(module.id, keypressMode ? 'alert' : 'mission', challenge.title);
    console.log();
    const instructionText = keypressMode
      ? dim('Press the real shortcut now. Press `h` for hint or `k` to skip.')
      : explainMode
        ? dim('Explain what this command does in your own words. Use `hint` for help or `skip` to reveal.')
        : dim('Type a command. Use `hint` for help or `skip` to reveal solution.');
    const lines = [
      `Zone: ${module.name}`,
      `Challenge ${challengeIndex + 1}/${module.challenges.length}: ${challenge.title}`,
      line(Math.min(58, width() - 4)),
      `Scenario: ${challenge.scenario}`,
      `Objective: ${bold(challenge.objective)}`,
      '',
      instructionText
    ];

    console.log(box('ACTIVE MISSION', lines, width()));
    if (attempts > 0) {
      console.log(paint(`\nAttempt ${attempts + 1}/3`, 'yellow'));
    }

    if (keypressMode) {
      const captured = await captureShortcutSequence(rl, challenge);

      if (captured.mode === 'control' && captured.action === 'hint') {
        console.log(`\n${paint('Hint:', 'magenta')} ${challenge.hint}`);
        await pause(rl);
        continue;
      }

      if (captured.mode === 'control' && captured.action === 'skip') {
        console.log(`\n${paint('Solution:', 'yellow')} ${challenge.solution}`);
        console.log(`${paint('Why:', 'cyan')} ${challenge.lesson}`);
        await pause(rl);
        return { passed: false, attempts: attempts + 1, skipped: true };
      }

      if (captured.mode === 'typed') {
        const answer = captured.typed;
        if (!answer) {
          continue;
        }
        if (answer.toLowerCase() === 'hint') {
          console.log(`\n${paint('Hint:', 'magenta')} ${challenge.hint}`);
          await pause(rl);
          continue;
        }
        if (answer.toLowerCase() === 'skip') {
          console.log(`\n${paint('Solution:', 'yellow')} ${challenge.solution}`);
          console.log(`${paint('Why:', 'cyan')} ${challenge.lesson}`);
          await pause(rl);
          return { passed: false, attempts: attempts + 1, skipped: true };
        }
        if (isAccepted(answer, challenge.accepted)) {
          console.log(`\n${paint('Correct.', 'green')} Shortcut accepted.`);
          console.log(`${paint('Why it matters:', 'cyan')} ${challenge.lesson}`);
          await pause(rl);
          return { passed: true, attempts: attempts + 1, skipped: false };
        }
      } else if (isAcceptedShortcutSequence(challenge, captured.sequence)) {
        console.log(`\n${paint('Correct.', 'green')} Shortcut accepted.`);
        console.log(`${paint('Why it matters:', 'cyan')} ${challenge.lesson}`);
        await pause(rl);
        return { passed: true, attempts: attempts + 1, skipped: false };
      } else {
        const capturedText = Array.isArray(captured.sequence) && captured.sequence.length
          ? formatShortcutSequence(captured.sequence)
          : 'No valid key captured';
        console.log(`\n${paint('Captured sequence:', 'yellow')} ${capturedText}`);
      }

      attempts += 1;
      console.log(`\n${paint('Not quite.', 'red')} Try again.`);
      if (attempts === 2) {
        console.log(`${paint('Tip:', 'magenta')} ${challenge.hint}`);
      }
      if (attempts >= 3) {
        console.log(`${paint('Solution:', 'yellow')} ${challenge.solution}`);
        console.log(`${paint('Why:', 'cyan')} ${challenge.lesson}`);
        await pause(rl);
        return { passed: false, attempts, skipped: false };
      }
      await pause(rl);
      continue;
    }

    const prompt = explainMode ? '\nexplain> ' : '\ncommand> ';
    const answer = await ask(rl, prompt);

    if (!answer) {
      continue;
    }

    if (answer.toLowerCase() === 'hint') {
      console.log(`\n${paint('Hint:', 'magenta')} ${challenge.hint}`);
      await pause(rl);
      continue;
    }

    if (answer.toLowerCase() === 'skip') {
      console.log(`\n${paint('Solution:', 'yellow')} ${challenge.solution}`);
      console.log(`${paint('Why:', 'cyan')} ${challenge.lesson}`);
      await pause(rl);
      return { passed: false, attempts: attempts + 1, skipped: true };
    }

    if (isAccepted(answer, challenge.accepted)) {
      const acceptMsg = explainMode ? 'Explanation accepted.' : 'Command accepted.';
      console.log(`\n${paint('Correct.', 'green')} ${acceptMsg}`);
      console.log(`${paint('Why it matters:', 'cyan')} ${challenge.lesson}`);
      await pause(rl);
      return { passed: true, attempts: attempts + 1, skipped: false };
    }

    attempts += 1;
    console.log(`\n${paint('Not quite.', 'red')} Try again.`);
    if (attempts === 2) {
      console.log(`${paint('Tip:', 'magenta')} ${challenge.hint}`);
    }
    if (attempts >= 3) {
      console.log(`${paint('Solution:', 'yellow')} ${challenge.solution}`);
      console.log(`${paint('Why:', 'cyan')} ${challenge.lesson}`);
      await pause(rl);
      return { passed: false, attempts, skipped: false };
    }
    await pause(rl);
  }

  return { passed: false, attempts: 3, skipped: false };
}

async function runSandboxChallenge(rl, module, challenge, challengeIndex) {
  const sandboxDir = createSandbox();
  let checkCount = 0;
  const maxChecks = 5;

  try {
    if (challenge.sandbox && challenge.sandbox.setup) {
      challenge.sandbox.setup(sandboxDir);
    }

    clear();
    renderFlavor(module.id, 'sandbox', challenge.title);
    console.log();
    const lines = [
      `Zone: ${module.name}`,
      `Challenge ${challengeIndex + 1}/${module.challenges.length}: ${challenge.title}`,
      line(Math.min(58, width() - 4)),
      `Scenario: ${challenge.scenario}`,
      `Objective: ${bold(challenge.objective)}`,
      '',
      dim('LIVE SANDBOX: Commands execute in a real temp directory.'),
      dim('Type commands to accomplish the objective. Use `check` to verify.'),
      dim('Use `hint` for help or `skip` to reveal solution.')
    ];
    console.log(box('SANDBOX MISSION', lines, width()));

    while (checkCount < maxChecks) {
      const input = await ask(rl, `\n${paint('sandbox', 'yellow')}> `);

      if (!input) {
        continue;
      }

      if (input.toLowerCase() === 'hint') {
        console.log(`\n${paint('Hint:', 'magenta')} ${challenge.hint}`);
        continue;
      }

      if (input.toLowerCase() === 'skip') {
        console.log(`\n${paint('Solution:', 'yellow')} ${challenge.solution}`);
        console.log(`${paint('Why:', 'cyan')} ${challenge.lesson}`);
        await pause(rl);
        return { passed: false, attempts: checkCount + 1, skipped: true };
      }

      if (input.toLowerCase() === 'check') {
        checkCount += 1;
        const result = challenge.sandbox.verify(sandboxDir);
        if (result.passed) {
          console.log(`\n${paint('Verified.', 'green')} ${result.feedback || 'Objective complete.'}`);
          console.log(`${paint('Why it matters:', 'cyan')} ${challenge.lesson}`);
          await pause(rl);
          return { passed: true, attempts: checkCount, skipped: false };
        }
        console.log(`\n${paint('Not yet.', 'red')} ${result.feedback || 'Check the objective and try again.'}`);
        if (checkCount >= 2) {
          console.log(`${paint('Tip:', 'magenta')} ${challenge.hint}`);
        }
        if (checkCount >= maxChecks) {
          console.log(`\n${paint('Solution:', 'yellow')} ${challenge.solution}`);
          console.log(`${paint('Why:', 'cyan')} ${challenge.lesson}`);
          await pause(rl);
          return { passed: false, attempts: checkCount, skipped: false };
        }
        continue;
      }

      const result = executeInSandbox(input, sandboxDir, challenge.sandbox?.timeout || 5000);

      if (result.blocked) {
        console.log(paint(`\nBlocked: ${result.stderr}`, 'red'));
        continue;
      }

      if (result.stdout) {
        process.stdout.write(result.stdout);
        if (!result.stdout.endsWith('\n')) {
          console.log();
        }
      }
      if (result.stderr) {
        console.log(paint(result.stderr, 'red'));
      }
    }

    return { passed: false, attempts: maxChecks, skipped: false };
  } finally {
    cleanupSandbox(sandboxDir);
  }
}

async function runPracticeChallenge(rl, module, challenge, challengeIndex, sandboxDir = null, mockRuntime = null) {
  const keypressMode = challenge.inputMode === 'keypress';
  const explainMode = challenge.inputMode === 'explain';
  const sandboxMode = Boolean(sandboxDir) && !keypressMode && !explainMode;
  const mockMode = Boolean(mockRuntime) && sandboxMode;

  while (true) {
    clear();
    renderFlavor(module.id, sandboxMode ? 'sandbox' : 'coach', challenge.title);
    console.log();
    const instructions = keypressMode
      ? dim('Press the real shortcut. `h`=hint, `k`=next, or type `show` in fallback mode.')
      : explainMode
        ? dim('Explain it in your own words. Type `hint`, `show`, or `next`.')
        : sandboxMode
          ? dim(mockMode
            ? 'Run the command in the mock sandbox. Type `hint`, `show`, or `next`.'
            : 'Run the command in a real sandbox. Type `hint`, `show`, or `next`.')
          : dim('Type the command to practice. Type `hint`, `show`, or `next`.');

    const lines = [
      `Zone: ${module.name}`,
      `Practice ${challengeIndex + 1}/${module.challenges.length}: ${challenge.title}`,
      line(Math.min(58, width() - 4)),
      `Scenario: ${challenge.scenario}`,
      `Target: ${bold(challenge.objective)}`,
      `Reference: ${paint(challenge.solution, 'cyan')}`,
      `Why: ${challenge.lesson}`,
      '',
      sandboxMode ? dim(`Sandbox: ${sandboxDir}${mockMode ? ' (mock runtime)' : ''}`) : '',
      instructions
    ];
    console.log(box('GUIDED PRACTICE', lines, width()));

    if (keypressMode) {
      const captured = await captureShortcutSequence(rl, challenge);

      if (captured.mode === 'control' && captured.action === 'hint') {
        console.log(`\n${paint('Hint:', 'magenta')} ${challenge.hint}`);
        await pause(rl);
        continue;
      }

      if (captured.mode === 'control' && captured.action === 'skip') {
        return false;
      }

      if (captured.mode === 'typed') {
        const input = (captured.typed || '').trim();
        const lower = input.toLowerCase();
        if (!input) {
          continue;
        }
        if (lower === 'hint' || lower === 'h') {
          console.log(`\n${paint('Hint:', 'magenta')} ${challenge.hint}`);
          await pause(rl);
          continue;
        }
        if (lower === 'show' || lower === 'solution' || lower === 's') {
          console.log(`\n${paint('Reference:', 'yellow')} ${challenge.solution}`);
          console.log(`${paint('Why:', 'cyan')} ${challenge.lesson}`);
          await pause(rl);
          continue;
        }
        if (lower === 'next' || lower === 'skip' || lower === 'n' || lower === 'k') {
          return false;
        }
        if (isAccepted(input, challenge.accepted)) {
          console.log(`\n${paint('Nice.', 'green')} Practice complete.`);
          await pause(rl);
          return true;
        }
      } else if (isAcceptedShortcutSequence(challenge, captured.sequence)) {
        console.log(`\n${paint('Nice.', 'green')} Practice complete.`);
        await pause(rl);
        return true;
      } else {
        const capturedText = Array.isArray(captured.sequence) && captured.sequence.length
          ? formatShortcutSequence(captured.sequence)
          : 'No valid key captured';
        console.log(`\n${paint('Captured:', 'yellow')} ${capturedText}`);
      }

      console.log(paint('\nTry again, or use `h`/`k`.', 'red'));
      await pause(rl);
      continue;
    }

    const prompt = explainMode
      ? '\npractice explain> '
      : sandboxMode
        ? `\n${paint('practice-sandbox', 'yellow')}> `
        : '\npractice command> ';
    const answer = await ask(rl, prompt);
    const lower = answer.toLowerCase();

    if (!answer) {
      continue;
    }

    if (lower === 'hint' || lower === 'h') {
      console.log(`\n${paint('Hint:', 'magenta')} ${challenge.hint}`);
      await pause(rl);
      continue;
    }

    if (lower === 'show' || lower === 'solution' || lower === 's') {
      console.log(`\n${paint('Reference:', 'yellow')} ${challenge.solution}`);
      console.log(`${paint('Why:', 'cyan')} ${challenge.lesson}`);
      await pause(rl);
      continue;
    }

    if (lower === 'next' || lower === 'skip' || lower === 'n') {
      return false;
    }

    if (sandboxMode) {
      const result = mockMode
        ? executeInMockRuntime(module.id, answer, mockRuntime)
        : executeInSandbox(answer, sandboxDir, challenge.sandbox?.timeout || 5000);
      if (result.blocked) {
        console.log(paint(`\nBlocked: ${result.stderr}`, 'red'));
        await pause(rl);
        continue;
      }
      if (result.stdout) {
        process.stdout.write(result.stdout);
        if (!result.stdout.endsWith('\n')) {
          console.log();
        }
      }
      if (result.stderr) {
        console.log(paint(result.stderr, 'red'));
      }

      if (isAccepted(answer, challenge.accepted)) {
        if (result.exitCode === 0) {
          console.log(`\n${paint('Nice.', 'green')} Practice complete.`);
        } else {
          console.log(paint('\nMatched target command. Non-zero is okay here (some snippets are partial by design).', 'yellow'));
        }
        await pause(rl);
        return true;
      }
      console.log(paint('\nThat command ran, but it is not the target for this drill.', 'red'));
      await pause(rl);
      continue;
    }

    if (isAccepted(answer, challenge.accepted)) {
      console.log(`\n${paint('Nice.', 'green')} Practice complete.`);
      await pause(rl);
      return true;
    }

    console.log(paint('\nNot yet. Keep practicing or type `show`.', 'red'));
    await pause(rl);
  }
}

async function runSandboxPracticeChallenge(rl, module, challenge, challengeIndex) {
  const sandboxDir = createSandbox();

  try {
    if (challenge.sandbox && challenge.sandbox.setup) {
      challenge.sandbox.setup(sandboxDir);
    }

    while (true) {
      clear();
      renderFlavor(module.id, 'sandbox', challenge.title);
      console.log();
      const lines = [
        `Zone: ${module.name}`,
        `Practice ${challengeIndex + 1}/${module.challenges.length}: ${challenge.title}`,
        line(Math.min(58, width() - 4)),
        `Scenario: ${challenge.scenario}`,
        `Target: ${bold(challenge.objective)}`,
        `Reference: ${paint(challenge.solution, 'cyan')}`,
        `Why: ${challenge.lesson}`,
        '',
        dim('LIVE PRACTICE: run real commands in a temp sandbox.'),
        dim('Type `goal` to validate, `hint`, `show`, or `next`.')
      ];
      console.log(box('GUIDED PRACTICE', lines, width()));

      const input = await ask(rl, `\n${paint('practice-sandbox', 'yellow')}> `);
      const lower = input.toLowerCase();

      if (!input) {
        continue;
      }
      if (lower === 'hint' || lower === 'h') {
        console.log(`\n${paint('Hint:', 'magenta')} ${challenge.hint}`);
        await pause(rl);
        continue;
      }
      if (lower === 'show' || lower === 'solution' || lower === 's') {
        console.log(`\n${paint('Reference:', 'yellow')} ${challenge.solution}`);
        console.log(`${paint('Why:', 'cyan')} ${challenge.lesson}`);
        await pause(rl);
        continue;
      }
      if (lower === 'next' || lower === 'skip' || lower === 'n') {
        return false;
      }
      if (lower === 'goal' || lower === 'check') {
        const result = challenge.sandbox.verify(sandboxDir);
        if (result.passed) {
          console.log(`\n${paint('Nice.', 'green')} ${result.feedback || 'Objective complete.'}`);
          await pause(rl);
          return true;
        }
        console.log(`\n${paint('Not yet.', 'red')} ${result.feedback || 'Try another command.'}`);
        await pause(rl);
        continue;
      }

      const result = executeInSandbox(input, sandboxDir, challenge.sandbox?.timeout || 5000);
      if (result.blocked) {
        console.log(paint(`\nBlocked: ${result.stderr}`, 'red'));
        await pause(rl);
        continue;
      }
      if (result.stdout) {
        process.stdout.write(result.stdout);
        if (!result.stdout.endsWith('\n')) {
          console.log();
        }
      }
      if (result.stderr) {
        console.log(paint(result.stderr, 'red'));
      }
      await pause(rl);
    }
  } finally {
    cleanupSandbox(sandboxDir);
  }
}

async function runGuidedTraining(rl, module) {
  const usesFilesystemSandbox = GUIDED_FILESYSTEM_SANDBOX_MODULES.has(module.id);
  const usesMockSandbox = GUIDED_MOCK_SANDBOX_MODULES.has(module.id);
  const moduleSandboxDir = usesFilesystemSandbox || usesMockSandbox ? createSandbox() : null;
  const moduleMockRuntime = usesMockSandbox ? createMockRuntime(module.id, moduleSandboxDir) : null;

  if (moduleSandboxDir) {
    setupGuidedSandboxFixture(module.id, moduleSandboxDir);
  }

  clear();
  renderFlavor(module.id, 'coach', 'Guided training mode engaged.');
  console.log();
  console.log(
    box(
      `${module.name} - Guided Training`,
      [
        module.tagline,
        '',
        'Phase 1: Learn by doing with references and unlimited practice.',
        'Phase 2: Certification quiz based on what you just practiced.',
        moduleSandboxDir
          ? `Sandbox workspace: ${moduleSandboxDir}${usesMockSandbox ? ' (mock runtime)' : ''}`
          : 'This zone uses guided non-sandbox practice.',
        '',
        dim('Training is not graded. Quiz attempts are graded.')
      ],
      width()
    )
  );
  await pause(rl, 'Press Enter to start training...');

  let practiced = 0;
  try {
    for (let i = 0; i < module.challenges.length; i += 1) {
      const challenge = module.challenges[i];
      const result = challenge.inputMode === 'sandbox'
        ? await runSandboxPracticeChallenge(rl, module, challenge, i)
        : await runPracticeChallenge(
          rl,
          module,
          challenge,
          i,
          shouldUseGuidedSandbox(module, challenge) ? moduleSandboxDir : null,
          shouldUseGuidedSandbox(module, challenge) ? moduleMockRuntime : null
        );
      if (result) {
        practiced += 1;
      }
    }
  } finally {
    cleanupSandbox(moduleSandboxDir);
  }

  clear();
  renderFlavor(module.id, 'success', 'Training complete. Certification unlocked.');
  console.log();
  console.log(
    box(
      'TRAINING COMPLETE',
      [
        `${module.name} guided training finished.`,
        `Drills completed: ${practiced}/${module.challenges.length}`,
        dim('Next step: certification quiz for XP and unlocks.')
      ],
      width()
    )
  );
  await pause(rl);
}

async function runModule(rl, progress, module) {
  const state = progress.moduleState[module.id];
  const freshRun = !state.completed;

  clear();
  renderFlavor(module.id, 'mission', module.tagline);
  console.log();
  console.log(
    box(
      module.name,
      [module.tagline, '', module.description, '', dim('Complete mission commands to earn XP and unlock new zones.')],
      width()
    )
  );
  await pause(rl, 'Press Enter to deploy into this zone...');

  if (freshRun && !state.trainingCompleted) {
    await runGuidedTraining(rl, module);
    state.trainingCompleted = true;
    saveProgress(progress);

    const nextStep = await chooseMenuOption(rl, {
      render: () => {
        renderFlavor(module.id, 'coach', 'You trained. Ready for certification?');
        console.log();
        console.log(
          box(
            'NEXT STEP',
            [
              `${module.name} training is done.`,
              'Start certification now for XP and unlock progress, or come back later.'
            ],
            width()
          )
        );
      },
      options: [
        { key: '1', value: 'start', label: '1) Start certification quiz now' },
        { key: '2', value: 'later', label: '2) Return to campaign map' }
      ],
      prompt: 'Choose: '
    });

    if (nextStep !== 'start') {
      return;
    }
  }

  const startIndex = freshRun ? state.currentChallenge : 0;

  for (let i = startIndex; i < module.challenges.length; i += 1) {
    const challenge = module.challenges[i];
    const result = challenge.inputMode === 'sandbox'
      ? await runSandboxChallenge(rl, module, challenge, i)
      : await runChallenge(rl, module, challenge, i);

    progress.totalAnswered += 1;

    if (result.passed) {
      progress.correctAnswers += 1;
      if (freshRun) {
        const xpGain = Math.max(6, 14 - (result.attempts - 1) * 3);
        progress.xp += xpGain;
      }
    } else if (freshRun && !result.skipped) {
      progress.xp += 2;
    }

    if (freshRun) {
      state.currentChallenge = i + 1;
      saveProgress(progress);
    }
  }

  if (freshRun) {
    state.completed = true;
    progress.xp += 40;

    const unlocked = unlockNextModule(progress, module.id);
    saveProgress(progress);

    clear();
    renderFlavor(module.id, 'success', 'Zone victory.');
    console.log();
    console.log(box('ZONE CLEARED', [`${module.name} complete.`, `Reward: +40 XP bonus`, `Current Rank: ${progress.rank}`], width()));
    if (unlocked) {
      console.log(`\n${paint('New zone unlocked:', 'green')} ${unlocked.name}`);
    }
    await pause(rl);
    return;
  }

  clear();
  renderFlavor(module.id, 'idle', 'Replay complete. Skills reinforced.');
  console.log();
  console.log(box('REPLAY COMPLETE', ['No XP granted on replays, but you sharpened command muscle memory.'], width()));
  await pause(rl);
}

async function expeditionMap(rl, progress) {
  while (true) {
    const zoneOptions = modules.map((module, index) => {
      const state = progress.moduleState[module.id];
      const progressText = state.completed
        ? `${module.challenges.length}/${module.challenges.length}`
        : `${Math.min(state.currentChallenge, module.challenges.length)}/${module.challenges.length}`;
      return {
        key: String(index + 1),
        value: module.id,
        label: `${index + 1}) ${module.name}  ${missionStatus(progress, module)}  ${dim(progressText)}`,
        disabled: !state.unlocked
      };
    });
    zoneOptions.push({ key: '0', value: 'back', label: '0) Back' });

    const choice = await chooseMenuOption(rl, {
      render: () => {
        renderFlavor(null, 'idle', 'Choose your next training zone.');
        console.log();
        console.log(renderPlayerCard(progress));
        console.log();
        console.log(bold('Campaign Zones'));
      },
      options: zoneOptions,
      prompt: 'Choose a zone: '
    });

    if (choice === 'back') {
      return;
    }
    if (choice === '__interrupt' || choice === null) {
      console.log(paint('\nUse option 0 to go back.', 'yellow'));
      await pause(rl);
      continue;
    }
    const selectedModule = modules.find((module) => module.id === choice);
    if (!selectedModule) {
      continue;
    }
    await runModule(rl, progress, selectedModule);
  }
}

async function flashDrills(rl, progress) {
  const unlockedModules = modules.filter((module) => progress.moduleState[module.id].unlocked);
  const questionPool = unlockedModules.flatMap((module) =>
    module.challenges
      .filter((challenge) => challenge.inputMode !== 'sandbox')
      .map((challenge) => ({ moduleName: module.name, challenge }))
  );

  if (questionPool.length === 0) {
    clear();
    console.log(paint('No unlocked zones yet.', 'red'));
    await pause(rl);
    return;
  }

  const drills = shuffle(questionPool).slice(0, Math.min(5, questionPool.length));
  let score = 0;

  for (let i = 0; i < drills.length; i += 1) {
    const { moduleName, challenge } = drills[i];

    const isExplain = challenge.inputMode === 'explain';
    clear();
    console.log(
      box(
        `FLASH DRILL ${i + 1}/${drills.length}`,
        [
          `Zone: ${moduleName}`,
          `Objective: ${bold(challenge.objective)}`,
          '',
          dim(isExplain ? 'One attempt. Explain what the command does.' : 'One attempt. Enter the best command you know.')
        ],
        width()
      )
    );

    const answer = await ask(rl, isExplain ? '\nexplain> ' : '\ncommand> ');
    progress.totalAnswered += 1;

    if (isAccepted(answer, challenge.accepted)) {
      score += 1;
      progress.correctAnswers += 1;
      console.log(paint('\nCorrect.', 'green'));
    } else {
      console.log(paint('\nMissed.', 'red'));
      console.log(`${paint('Reference:', 'yellow')} ${challenge.solution}`);
    }

    await pause(rl);
  }

  const xpGain = score * 8;
  progress.xp += xpGain;
  progress.flashBest = Math.max(progress.flashBest, score);
  saveProgress(progress);

  clear();
  console.log(box('FLASH SUMMARY', [`Score: ${score}/${drills.length}`, `XP earned: +${xpGain}`], width()));
  await pause(rl);
}

async function showCodex(rl) {
  clear();
  renderFlavor(null, 'coach', 'Reference deck loaded.');
  console.log();
  console.log(box('COMMAND CODEX', ['Quick reference for high-frequency commands.'], width()));

  let topic = '';
  for (const entry of codex) {
    if (entry.topic !== topic) {
      topic = entry.topic;
      console.log(`\n${paint(topic, 'yellow')}`);
    }
    console.log(`  ${paint(entry.command, 'cyan')}  ${dim(entry.note)}`);
  }

  await pause(rl);
}

async function showStats(rl, progress) {
  const completion = moduleCompletion(progress);

  clear();
  renderFlavor(null, 'idle', 'Operator telemetry.');
  console.log();
  console.log(
    box(
      'OPERATOR METRICS',
      [
        `Name: ${progress.name}`,
        `Rank: ${progress.rank}`,
        `XP: ${progress.xp}`,
        `Accuracy: ${accuracy(progress)}% (${progress.correctAnswers}/${progress.totalAnswered})`,
        `Campaign: ${completion.completed}/${completion.total}`,
        progressBar(completion.completed, completion.total, 34)
      ],
      width()
    )
  );

  console.log('\nZone Breakdown');
  modules.forEach((module) => {
    const state = progress.moduleState[module.id];
    const marker = state.completed ? paint('CLEARED', 'green') : state.unlocked ? paint('ACTIVE', 'yellow') : paint('LOCKED', 'red');
    console.log(`- ${module.name}: ${marker}`);
  });

  await pause(rl);
}

async function resetProgress(rl) {
  clear();
  console.log(paint('This will erase your save data.', 'red'));
  const confirm = await ask(rl, 'Type RESET to confirm (or anything else to cancel): ');
  if (confirm !== 'RESET') {
    return null;
  }

  const typedName = await ask(rl, 'New operator callsign: ');
  const name = typedName || 'Operator';
  const fresh = buildNewProgress(name);
  saveProgress(fresh);
  return fresh;
}

async function mainMenu(rl, progress) {
  while (true) {
    const choice = await chooseMenuOption(rl, {
      render: () => {
        renderFlavor(null, 'idle', 'Ready for another run?');
        console.log();
        console.log(renderPlayerCard(progress));
      },
      options: [
        { key: '1', value: 'expedition', label: '1) Expedition Map (structured campaign)' },
        { key: '2', value: 'flash', label: '2) Flash Drills (quick command reps)' },
        { key: '3', value: 'codex', label: '3) Command Codex' },
        { key: '4', value: 'stats', label: '4) Operator Metrics' },
        { key: '5', value: 'reset', label: '5) Reset Progress' },
        { key: '0', value: 'exit', label: '0) Exit' }
      ]
    });

    if (choice === 'expedition') {
      await expeditionMap(rl, progress);
      saveProgress(progress);
      continue;
    }

    if (choice === 'flash') {
      await flashDrills(rl, progress);
      continue;
    }

    if (choice === 'codex') {
      await showCodex(rl);
      continue;
    }

    if (choice === 'stats') {
      await showStats(rl, progress);
      continue;
    }

    if (choice === 'reset') {
      const maybeFresh = await resetProgress(rl);
      if (maybeFresh) {
        progress = maybeFresh;
      }
      continue;
    }

    if (choice === 'exit') {
      saveProgress(progress);
      clear();
      console.log(paint('Session ended. Keep training.', 'green'));
      return;
    }

    if (choice === '__interrupt' || choice === null) {
      console.log(paint('\nUse option 0 to exit the app.', 'yellow'));
      await pause(rl);
      continue;
    }
  }
}

async function run() {
  const rl = readline.createInterface({ input: stdin, output: stdout });

  try {
    const progress = await onboarding(rl);
    if (!progress) {
      clear();
      return;
    }

    await mainMenu(rl, progress);
  } finally {
    rl.close();
  }
}

run().catch((error) => {
  console.error(paint(`Unexpected error: ${error.message}`, 'red'));
  process.exitCode = 1;
});
