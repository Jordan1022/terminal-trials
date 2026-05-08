const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const SANDBOX_PREFIX = 'terminal-trials-sandbox-';

const ALLOWED_COMMANDS = new Set([
  'pwd',
  'echo',
  'ls',
  'cd',
  'mkdir',
  'touch',
  'du',
  'cat',
  'cp',
  'mv',
  'rm',
  'head',
  'tail',
  'wc',
  'grep',
  'rg',
  'sort',
  'uniq',
  'find',
  'cut',
  'sed',
  'awk',
  'tr',
  'xargs',
  'chmod',
  'source',
  'alias',
  'export',
  'printenv',
  'gzip'
]);

const BLOCKED_PATTERNS = [
  { pattern: /(^|[^|])&&|(^|[^|])\|\||;/, reason: 'Command chaining is not allowed in the sandbox.' },
  { pattern: /\$\(|`/, reason: 'Command substitution is not allowed in the sandbox.' },
  { pattern: /\b(?:curl|wget|ssh|scp|rsync|sudo|mkfs|dd)\b/i, reason: 'Network, privilege, and disk-management commands are not allowed in the sandbox.' },
  { pattern: /(^|\s)\/(?!$)/, reason: 'Absolute paths are not allowed in the sandbox.' },
  { pattern: /(^|\s|\/)\.\.(?:\/|\s|$)/, reason: 'Parent-directory traversal is not allowed in the sandbox.' },
  { pattern: /\brm\s+-[A-Za-z]*r[A-Za-z]*f|\brm\s+-[A-Za-z]*f[A-Za-z]*r|\brm\s+-rf\b/i, reason: 'Recursive force removal is not allowed in the sandbox.' }
];

function tokenize(command) {
  return String(command || '').match(/"[^"]*"|'[^']*'|\S+/g) || [];
}

function validateExecutorSegment(segment) {
  const parts = tokenize(segment);
  const command = parts[0];

  if (command === 'xargs') {
    if (parts.length === 2 && parts[1] === 'rm') {
      return { safe: true };
    }
    return { safe: false, reason: 'Only `xargs rm` is allowed in the sandbox.' };
  }

  if (command === 'find') {
    const execIndex = parts.indexOf('-exec');
    if (execIndex === -1) {
      return { safe: true };
    }
    const execParts = parts.slice(execIndex + 1);
    if (execParts.length === 3 && execParts[0] === 'gzip' && execParts[1] === '{}' && execParts[2] === '+') {
      return { safe: true };
    }
    return { safe: false, reason: 'Only `find ... -exec gzip {} +` is allowed in the sandbox.' };
  }

  return { safe: true };
}

function createSandbox() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), SANDBOX_PREFIX));
  return dir;
}

function cleanupSandbox(dir) {
  if (!dir || !dir.includes(SANDBOX_PREFIX)) {
    return;
  }
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch {
    // ignore cleanup errors
  }
}

function isSafeCommand(command) {
  const input = String(command || '').trim();
  if (!input) {
    return { safe: false, reason: 'Empty commands are not allowed in the sandbox.' };
  }

  if (input === 'cd ..') {
    return { safe: true };
  }

  for (const { pattern, reason } of BLOCKED_PATTERNS) {
    if (pattern.test(input)) {
      return { safe: false, reason };
    }
  }

  const commandNames = input
    .split('|')
    .map((segment) => segment.trim().match(/^([A-Za-z0-9_.-]+)/)?.[1])
    .filter(Boolean);

  if (!commandNames.length) {
    return { safe: false, reason: 'Only simple training commands are allowed in the sandbox.' };
  }

  const blockedCommand = commandNames.find((name) => !ALLOWED_COMMANDS.has(name));
  if (blockedCommand) {
    return { safe: false, reason: `Command \`${blockedCommand}\` is not allowed in the sandbox.` };
  }

  for (const segment of input.split('|')) {
    const executorSafety = validateExecutorSegment(segment.trim());
    if (!executorSafety.safe) {
      return executorSafety;
    }
  }

  return { safe: true };
}

function executeInSandbox(command, sandboxDir, timeout = 5000) {
  const safety = isSafeCommand(command);
  if (!safety.safe) {
    return { stdout: '', stderr: safety.reason, exitCode: 1, blocked: true };
  }

  try {
    const stdout = execSync(command, {
      cwd: sandboxDir,
      timeout,
      encoding: 'utf8',
      shell: process.env.SHELL || '/bin/bash',
      env: {
        ...process.env,
        HOME: sandboxDir,
        PATH: process.env.PATH
      },
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return { stdout: stdout || '', stderr: '', exitCode: 0, blocked: false };
  } catch (err) {
    return {
      stdout: err.stdout || '',
      stderr: err.stderr || err.message,
      exitCode: err.status || 1,
      blocked: false
    };
  }
}

module.exports = { createSandbox, cleanupSandbox, executeInSandbox, isSafeCommand };
