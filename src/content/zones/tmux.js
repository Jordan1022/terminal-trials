const zone = {
  id: 'tmux',
  name: 'Citadel: tmux Mastery',
  tagline: 'Run multi-pane workflows without losing context.',
  description:
    'Learn sessions, panes, copy-mode selection, detach/attach flow, and fast tmux control habits.',
  challenges: [
    {
      title: 'Start Named Session',
      scenario: 'Open a new tmux session named dojo.',
      objective: 'Create and enter a named session.',
      accepted: ['tmux new -s dojo', 'tmux new-session -s dojo'],
      hint: 'tmux new with a session name flag.',
      solution: 'tmux new -s dojo',
      lesson: 'Named sessions prevent confusion when juggling multiple projects.'
    },
    {
      title: 'Split Vertical Panes',
      scenario: 'Create a left/right split in the current window.',
      objective: 'Run the tmux command for a horizontal split line (side-by-side panes).',
      accepted: ['tmux split-window -h', 'tmux splitw -h', /^ctrl\+b\s+%$/i, /^ctrl-b\s+%$/i],
      hint: 'Command form: tmux split-window with one flag.',
      solution: 'tmux split-window -h',
      lesson: '`-h` creates side-by-side panes. Use this for code vs logs workflows.'
    },
    {
      title: 'Split Horizontal Panes',
      scenario: 'Create a top/bottom split in the current pane.',
      objective: 'Run the tmux command for a vertical split line (stacked panes).',
      accepted: ['tmux split-window -v', 'tmux splitw -v', /^ctrl\+b\s+"$/i, /^ctrl-b\s+"$/i],
      hint: 'Same command as previous challenge, different flag.',
      solution: 'tmux split-window -v',
      lesson: '`-v` stacks panes. Great for monitoring output while editing above.'
    },
    {
      title: 'Enter Copy Mode',
      scenario: 'You need to scroll and select text from pane output.',
      objective: 'Enter tmux copy mode.',
      accepted: ['tmux copy-mode', /^ctrl\+b\s+\[$/i, /^ctrl-b\s+\[$/i],
      hint: 'Use prefix + [ or the direct command.',
      solution: 'Ctrl+b [',
      lesson: 'Copy mode lets you scroll history and select multi-line output safely.'
    },
    {
      title: 'Start Selection in Copy Mode',
      scenario: 'You are in copy mode and want to begin selecting text.',
      objective: 'Use the selection key in copy mode.',
      accepted: [/^space$/i, /^v$/i],
      hint: 'In default key mode this is Space; in vi mode many use v.',
      solution: 'Space (or v in vi copy-mode keys)',
      lesson: 'Starting selection is required before yanking text from pane history.'
    },
    {
      title: 'Yank Selection',
      scenario: 'You finished selecting multiple lines and want to copy them.',
      objective: 'Copy selected text to tmux buffer.',
      accepted: [/^enter$/i, /^y$/i],
      hint: 'In default key mode use Enter; vi key mode often uses y.',
      solution: 'Enter (or y in vi copy-mode keys)',
      lesson: 'Yanking stores selected pane text in tmux buffer for paste operations.'
    },
    {
      title: 'Detach Safely',
      scenario: 'You need to leave tmux running and return to your normal shell.',
      objective: 'Use the key sequence for detach.',
      accepted: [/^ctrl\+b\s+d$/i, /^ctrl-b\s+d$/i, /^tmux\s+detach$/i],
      hint: 'Prefix key then a single letter.',
      solution: 'Ctrl+b d',
      lesson: 'Detach is the superpower: keep long-running tasks alive after disconnecting.'
    },
    {
      title: 'Reattach Session',
      scenario: 'Later, reconnect to the dojo session.',
      objective: 'Attach to a named session.',
      accepted: ['tmux attach -t dojo', 'tmux attach-session -t dojo', 'tmux a -t dojo'],
      hint: 'Attach with target flag.',
      solution: 'tmux attach -t dojo',
      lesson: 'Attach lets you resume context instantly from any terminal window.'
    }
  ]
};

const codexEntries = [
  { topic: 'tmux', command: 'tmux new -s name', note: 'Create named session.' },
  { topic: 'tmux', command: 'tmux split-window -h', note: 'Split left/right panes.' },
  { topic: 'tmux', command: 'tmux split-window -v', note: 'Split top/bottom panes.' },
  { topic: 'tmux', command: 'Ctrl+b [', note: 'Enter copy mode for scrolling/selection.' },
  { topic: 'tmux', command: 'Space / v', note: 'Begin selection in copy mode.' },
  { topic: 'tmux', command: 'Enter / y', note: 'Yank selection in copy mode.' },
  { topic: 'tmux', command: 'Ctrl+b d', note: 'Detach session.' },
  { topic: 'tmux', command: 'tmux attach -t name', note: 'Reattach session.' }
];

module.exports = { zone, codexEntries };
