function normalizeCommand(value) {
  return String(value || '').trim().replace(/\s+/g, ' ');
}

function isAccepted(answer, acceptedRules = []) {
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

function tokens(command) {
  return normalizeCommand(command).match(/"[^"]*"|'[^']*'|\S+/g) || [];
}

function unquote(value) {
  return String(value || '').replace(/^['"]|['"]$/g, '');
}

function commandName(command) {
  return tokens(command)[0] || '';
}

function flagTokens(command) {
  return tokens(command).filter((token) => /^-[A-Za-z0-9]+/.test(token));
}

function echoText(command) {
  const parts = tokens(command);
  if ((parts[0] || '').toLowerCase() !== 'echo') {
    return null;
  }
  return parts.slice(1).map(unquote).join(' ').trim();
}

function feedbackForAnswer(answer, challenge) {
  if (!challenge || isAccepted(answer, challenge.accepted || [])) {
    return null;
  }

  const solution = normalizeCommand(challenge.solution || '');
  const actual = normalizeCommand(answer);
  const expectedCommand = commandName(solution);
  const actualCommand = commandName(actual);

  if (!actual) {
    return 'Enter a command, or type `hint` if you need a nudge.';
  }

  if (expectedCommand && actualCommand && expectedCommand.toLowerCase() !== actualCommand.toLowerCase()) {
    return `Start with \`${expectedCommand}\` for this objective. Your command starts with \`${actualCommand}\`.`;
  }

  const expectedEcho = echoText(solution);
  const actualEcho = echoText(actual);
  if (expectedEcho !== null && actualEcho !== null && expectedEcho !== actualEcho) {
    return `Your text: ${actualEcho || '(empty)'}. Target text: ${expectedEcho}.`;
  }

  const actualFlags = new Set(flagTokens(actual).map((flag) => flag.toLowerCase()));
  const missingFlags = flagTokens(solution).filter((flag) => !actualFlags.has(flag.toLowerCase()));
  if (missingFlags.length === 1) {
    return `Missing flag: ${missingFlags[0]}. Compare with the reference command: ${solution}.`;
  }
  if (missingFlags.length > 1) {
    return `Missing flags: ${missingFlags.join(', ')}. Compare with the reference command: ${solution}.`;
  }

  if (expectedCommand && actualCommand && expectedCommand.toLowerCase() === actualCommand.toLowerCase()) {
    return `Close. Compare arguments and ordering with the reference command: ${solution}.`;
  }

  return `Try matching the objective more closely. Reference command: ${solution}.`;
}

module.exports = {
  normalizeCommand,
  isAccepted,
  feedbackForAnswer
};
