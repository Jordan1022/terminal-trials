const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

const ANSI_PATTERN = /\x1b\[[0-9;]*m/g;

function paint(text, color) {
  return `${colors[color] || ''}${text}${colors.reset}`;
}

function bold(text) {
  return `${colors.bold}${text}${colors.reset}`;
}

function dim(text) {
  return `${colors.dim}${text}${colors.reset}`;
}

function clear() {
  process.stdout.write('\x1Bc');
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function line(width = 72) {
  return '-'.repeat(width);
}

function stripAnsi(text) {
  return String(text || '').replace(ANSI_PATTERN, '');
}

function visibleLength(text) {
  return stripAnsi(text).length;
}

function padVisible(text, width) {
  const padding = Math.max(0, width - visibleLength(text));
  return `${text}${' '.repeat(padding)}`;
}

function wrapPlainWords(text, width) {
  const clean = String(text || '');
  if (!clean) {
    return [''];
  }

  const lines = [];
  for (const paragraph of clean.split('\n')) {
    let current = '';
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      if (!current) {
        current = word;
      } else if (current.length + 1 + word.length <= width) {
        current += ` ${word}`;
      } else {
        lines.push(current);
        current = word;
      }

      while (current.length > width) {
        lines.push(current.slice(0, width));
        current = current.slice(width);
      }
    }
    lines.push(current);
  }

  return lines.length ? lines : [''];
}

function wrapAnsi(text, width) {
  const value = String(text || '');
  if (!value) {
    return [''];
  }
  if (visibleLength(value) <= width) {
    return [value];
  }

  if (!ANSI_PATTERN.test(value)) {
    ANSI_PATTERN.lastIndex = 0;
    return wrapPlainWords(value, width);
  }
  ANSI_PATTERN.lastIndex = 0;

  const firstAnsi = value.match(/^\x1b\[[0-9;]*m/)?.[0];
  const plain = stripAnsi(value);
  const ansiCount = value.match(ANSI_PATTERN)?.length || 0;
  if (firstAnsi && ansiCount <= 2 && value.endsWith(colors.reset)) {
    return wrapPlainWords(plain, width).map((entry) => `${firstAnsi}${entry}${colors.reset}`);
  }

  const lines = [];
  let current = '';
  let currentVisible = 0;
  let activeCode = '';

  const flush = () => {
    if (currentVisible === 0 && !current) {
      lines.push('');
    } else {
      lines.push(activeCode && !current.endsWith(colors.reset) ? `${current}${colors.reset}` : current);
    }
    current = activeCode || '';
    currentVisible = 0;
  };

  for (let i = 0; i < value.length;) {
    const rest = value.slice(i);
    const ansi = rest.match(/^\x1b\[[0-9;]*m/);
    if (ansi) {
      const code = ansi[0];
      current += code;
      activeCode = code === colors.reset ? '' : code;
      i += code.length;
      continue;
    }

    const char = value[i];
    i += 1;

    if (char === '\n') {
      flush();
      continue;
    }

    if (currentVisible >= width) {
      flush();
    }

    if (char === ' ' && currentVisible === 0) {
      continue;
    }

    current += char;
    currentVisible += 1;
  }

  if (currentVisible > 0 || !lines.length) {
    lines.push(activeCode && !current.endsWith(colors.reset) ? `${current}${colors.reset}` : current);
  }

  return lines;
}

function box(title, lines, width = 72) {
  const safeWidth = Math.max(width, 40);
  const top = `+${'-'.repeat(safeWidth - 2)}+`;
  const maxInner = safeWidth - 4;
  const titleText = visibleLength(title) > maxInner ? `${stripAnsi(title).slice(0, maxInner - 3)}...` : title;
  const header = `| ${padVisible(bold(titleText), maxInner)} |`;
  const body = lines
    .flatMap((entry) => wrapAnsi(entry, maxInner))
    .map((entry) => {
      return `| ${padVisible(entry, maxInner)} |`;
    })
    .join('\n');

  return `${top}\n${header}\n${top}\n${body}\n${top}`;
}

function progressBar(value, max, width = 30) {
  const ratio = max <= 0 ? 0 : Math.min(1, Math.max(0, value / max));
  const filled = Math.round(ratio * width);
  const empty = width - filled;
  return `[${paint('█'.repeat(filled), 'green')}${'·'.repeat(empty)}] ${Math.round(ratio * 100)}%`;
}

function banner() {
  return [
    paint('████████╗███████╗██████╗ ███╗   ███╗██╗███╗   ██╗ █████╗ ██╗         ', 'cyan'),
    paint('╚══██╔══╝██╔════╝██╔══██╗████╗ ████║██║████╗  ██║██╔══██╗██║         ', 'cyan'),
    paint('   ██║   █████╗  ██████╔╝██╔████╔██║██║██╔██╗ ██║███████║██║         ', 'blue'),
    paint('   ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║██║██║╚██╗██║██╔══██║██║         ', 'blue'),
    paint('   ██║   ███████╗██║  ██║██║ ╚═╝ ██║██║██║ ╚████║██║  ██║███████╗    ', 'magenta'),
    paint('   ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝    ', 'magenta'),
    paint('████████╗██████╗ ██╗ █████╗ ██╗     ███████╗                              ', 'yellow'),
    paint('╚══██╔══╝██╔══██╗██║██╔══██╗██║     ██╔════╝                              ', 'yellow'),
    paint('   ██║   ██████╔╝██║███████║██║     ███████╗                              ', 'green'),
    paint('   ██║   ██╔══██╗██║██╔══██║██║     ╚════██║                              ', 'green'),
    paint('   ██║   ██║  ██║██║██║  ██║███████╗███████║                              ', 'cyan'),
    paint('   ╚═╝   ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚══════╝╚══════╝                              ', 'cyan')
  ].join('\n');
}

function zoneBadge(moduleId) {
  const badges = {
    trailhead: ['[Trailhead]', 'Path Scout'],
    linecraft: ['[Linecraft]', 'Cursor Ninja'],
    fieldcraft: ['[Fieldcraft]', 'File Scout'],
    pipeline: ['[Pipeline]', 'Text Smith'],
    workflow: ['[Workflow]', 'Ops Pilot'],
    tmux: ['[tmux]', 'Pane Tactician'],
    scripting: ['[Scripting]', 'Automation Mage'],
    jobcontrol: ['[Job Control]', 'Process Wrangler'],
    ssh: ['[SSH]', 'Remote Runner'],
    vim: ['[vim]', 'Modal Monk'],
    dotfiles: ['[Dotfiles]', 'Shell Stylist'],
    powertools: ['[Power Tools]', 'Text Alchemist'],
    bash_advanced: ['[Bash Mastery]', 'Script Sentinel']
  };
  return badges[moduleId] || ['[Terminal]', 'Command Adventurer'];
}

function mascot(pose = 'idle') {
  const poses = {
    idle: ['   /\\_/\\   ', '  ( o.o )  ', '   > ^ <   '],
    coach: ['   /\\_/\\   ', '  ( ^.^ )  ', '  /|===|\\  '],
    mission: ['   /\\_/\\   ', '  ( >.< )  ', '  /| ! |\\  '],
    sandbox: ['   /\\_/\\   ', '  ( o_o )  ', '  /|_|_|\\  '],
    success: ['   /\\_/\\   ', '  ( ^o^ )  ', ' \\_\\_/_/_/ '],
    alert: ['   /\\_/\\   ', '  ( O_O )  ', '   > ! <   ']
  };
  return poses[pose] || poses.idle;
}

function flavorArt({ moduleId = null, pose = 'idle', caption = '' } = {}) {
  const [badgeTop, badgeBottom] = zoneBadge(moduleId);
  const cat = mascot(pose);
  const badgeColor = moduleId ? 'cyan' : 'magenta';
  const poseColor = pose === 'success' ? 'green' : pose === 'mission' ? 'yellow' : 'blue';
  const lines = [
    `${paint(cat[0], poseColor)}   ${paint(badgeTop, badgeColor)}`,
    `${paint(cat[1], poseColor)}   ${paint(badgeBottom, 'white')}`,
    `${paint(cat[2], poseColor)}   ${dim(caption || 'Terminal companion online')}`
  ];
  return lines.join('\n');
}

module.exports = {
  paint,
  bold,
  dim,
  clear,
  sleep,
  line,
  stripAnsi,
  visibleLength,
  wrapAnsi,
  box,
  progressBar,
  banner,
  zoneBadge,
  flavorArt
};
