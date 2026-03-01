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

function box(title, lines, width = 72) {
  const safeWidth = Math.max(width, 40);
  const top = `+${'-'.repeat(safeWidth - 2)}+`;
  const maxInner = safeWidth - 4;
  const titleText = title.length > maxInner ? `${title.slice(0, maxInner - 3)}...` : title;
  const header = `| ${bold(titleText)}${' '.repeat(Math.max(0, maxInner - titleText.length))} |`;
  const body = lines
    .map((entry) => {
      const text = entry.length > safeWidth - 4 ? `${entry.slice(0, safeWidth - 7)}...` : entry;
      return `| ${text.padEnd(safeWidth - 4)} |`;
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
    pipeline: ['[Pipeline]', 'Text Smith'],
    workflow: ['[Workflow]', 'Ops Pilot'],
    tmux: ['[tmux]', 'Pane Tactician'],
    scripting: ['[Scripting]', 'Automation Mage'],
    jobcontrol: ['[Job Control]', 'Process Wrangler'],
    ssh: ['[SSH]', 'Remote Runner'],
    vim: ['[vim]', 'Modal Monk'],
    dotfiles: ['[Dotfiles]', 'Shell Stylist']
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
  box,
  progressBar,
  banner,
  flavorArt
};
