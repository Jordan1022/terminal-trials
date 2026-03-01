const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const SANDBOX_PREFIX = 'terminal-trials-sandbox-';

const FORBIDDEN_PATTERNS = [
  /rm\s+-rf\s+\//,
  /rm\s+-rf\s+~/,
  /rm\s+-rf\s+\.\./,
  />\s*\/dev\/sd/,
  /mkfs/,
  /dd\s+if=/,
  /:\(\)\s*\{\s*:\s*\|\s*:\s*&\s*\}\s*;?\s*:/,
  /curl.*\|.*sh/,
  /wget.*\|.*sh/,
  /sudo\s/,
  /chmod\s+-R\s+777\s+\//,
  /mv\s+.*\s+\/dev\//
];

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
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(command)) {
      return { safe: false, reason: 'That command is not allowed in the sandbox.' };
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

module.exports = { createSandbox, cleanupSandbox, executeInSandbox };
