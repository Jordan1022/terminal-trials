const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline/promises');
const readlineCore = require('node:readline');
const { stdin, stdout } = require('node:process');

const { modules, codex, rankTiers } = require('./content');
const { paint, bold, dim, clear, line, box, progressBar, banner } = require('./ui');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SAVE_PATH = path.join(PROJECT_ROOT, 'save', 'progress.json');

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
    moduleState,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function ensureSaveDir() {
  fs.mkdirSync(path.dirname(SAVE_PATH), { recursive: true });
}

function loadProgress() {
  try {
    if (!fs.existsSync(SAVE_PATH)) {
      return null;
    }
    return JSON.parse(fs.readFileSync(SAVE_PATH, 'utf8'));
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
    return Boolean(state && (state.completed || state.currentChallenge > 0));
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
      if (typeof rl.resume === 'function') {
        rl.resume();
      }
      resolve(value);
    };

    const onKeypress = (str, key) => {
      if (key && key.ctrl && key.name === 'c') {
        finish(null);
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

    if (typeof rl.pause === 'function') {
      rl.pause();
    }
    readlineCore.emitKeypressEvents(stdin);
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
      if (typeof rl.resume === 'function') {
        rl.resume();
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

    if (typeof rl.pause === 'function') {
      rl.pause();
    }
    readlineCore.emitKeypressEvents(stdin);
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
  return paint('READY', 'yellow');
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
    const typedName = await ask(rl, 'Choose your operator callsign (blank for Operator): ');
    const name = typedName || 'Operator';
    const created = buildNewProgress(name);
    saveProgress(created);
    return created;
  }

  while (true) {
    const canContinue = hasCampaignActivity(existing);
    const choice = await chooseMenuOption(rl, {
      render: () => {
        console.log(banner());
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

    if (choice === 'exit' || choice === null) {
      return null;
    }
  }
}

async function runChallenge(rl, module, challenge, challengeIndex) {
  let attempts = 0;
  const keypressMode = challenge.inputMode === 'keypress';

  while (attempts < 3) {
    clear();
    const lines = [
      `Zone: ${module.name}`,
      `Challenge ${challengeIndex + 1}/${module.challenges.length}: ${challenge.title}`,
      line(Math.min(58, width() - 4)),
      `Scenario: ${challenge.scenario}`,
      `Objective: ${bold(challenge.objective)}`,
      '',
      keypressMode
        ? dim('Press the real shortcut now. Press `h` for hint or `k` to skip.')
        : dim('Type a command. Use `hint` for help or `skip` to reveal solution.')
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

    const answer = await ask(rl, '\ncommand> ');

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
      console.log(`\n${paint('Correct.', 'green')} Command accepted.`);
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

async function runModule(rl, progress, module) {
  const state = progress.moduleState[module.id];
  const freshRun = !state.completed;

  clear();
  console.log(
    box(
      module.name,
      [module.tagline, '', module.description, '', dim('Complete mission commands to earn XP and unlock new zones.')],
      width()
    )
  );
  await pause(rl, 'Press Enter to deploy into this zone...');

  const startIndex = freshRun ? state.currentChallenge : 0;

  for (let i = startIndex; i < module.challenges.length; i += 1) {
    const result = await runChallenge(rl, module, module.challenges[i], i);

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
    console.log(box('ZONE CLEARED', [`${module.name} complete.`, `Reward: +40 XP bonus`, `Current Rank: ${progress.rank}`], width()));
    if (unlocked) {
      console.log(`\n${paint('New zone unlocked:', 'green')} ${unlocked.name}`);
    }
    await pause(rl);
    return;
  }

  clear();
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
        console.log(renderPlayerCard(progress));
        console.log();
        console.log(bold('Campaign Zones'));
      },
      options: zoneOptions,
      prompt: 'Choose a zone: '
    });

    if (choice === 'back' || choice === null) {
      return;
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
    module.challenges.map((challenge) => ({ moduleName: module.name, challenge }))
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

    clear();
    console.log(
      box(
        `FLASH DRILL ${i + 1}/${drills.length}`,
        [
          `Zone: ${moduleName}`,
          `Objective: ${bold(challenge.objective)}`,
          '',
          dim('One attempt. Enter the best command you know.')
        ],
        width()
      )
    );

    const answer = await ask(rl, '\ncommand> ');
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

    if (choice === 'exit' || choice === null) {
      saveProgress(progress);
      clear();
      console.log(paint('Session ended. Keep training.', 'green'));
      return;
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
