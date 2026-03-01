const modules = [
  {
    id: 'trailhead',
    name: 'Trailhead: Navigation',
    tagline: 'Move fast and never feel lost in a terminal again.',
    description:
      'Learn location awareness, listing files, changing directories, and creating filesystem scaffolding.',
    challenges: [
      {
        title: 'Where Am I?',
        scenario: 'You open a terminal and need to print your current directory path.',
        objective: 'Print the present working directory.',
        accepted: ['pwd', /^echo\s+\$PWD$/i],
        hint: 'Three letters. Starts with p.',
        solution: 'pwd',
        lesson: '`pwd` is your location beacon. Use it anytime you lose orientation in a project.'
      },
      {
        title: 'See Everything',
        scenario: 'You need a detailed list, including hidden files.',
        objective: 'List files in long format with dotfiles included.',
        accepted: [/^ls\s+-la$/i, /^ls\s+-al$/i],
        hint: 'Use `ls` with two single-letter flags.',
        solution: 'ls -la',
        lesson: '`-l` adds details, `-a` includes hidden files. Together they give a full directory view.'
      },
      {
        title: 'Step Into Source',
        scenario: 'You are in a project root and want to enter the src folder.',
        objective: 'Change into `src` directory.',
        accepted: ['cd src', /^cd\s+\.\/src$/i],
        hint: 'Directory changes use one two-letter command.',
        solution: 'cd src',
        lesson: '`cd` changes your shell context. Relative paths keep commands short and readable.'
      },
      {
        title: 'Build Structure Fast',
        scenario: 'Create nested directories for logs in one shot: logs/2026/march.',
        objective: 'Create the full nested path in one command.',
        accepted: ['mkdir -p logs/2026/march', /^mkdir\s+-p\s+logs\/2026\/march$/i],
        hint: 'Use `mkdir` with a flag that creates parents.',
        solution: 'mkdir -p logs/2026/march',
        lesson: '`mkdir -p` avoids errors when parent folders do not exist and is script-friendly.'
      },
      {
        title: 'Drop a Marker File',
        scenario: 'Create an empty markdown note named notes.md.',
        objective: 'Create `notes.md` without opening an editor.',
        accepted: ['touch notes.md', /^:>\s*notes\.md$/i],
        hint: 'A common command for creating empty files also updates timestamps.',
        solution: 'touch notes.md',
        lesson: '`touch` is the fastest way to create placeholders or update modified times.'
      }
    ]
  },
  {
    id: 'linecraft',
    name: 'Linecraft Dojo: Cursor Mastery',
    tagline: 'Edit commands at speed without retyping.',
    description:
      'Master shell line editing: jump to start/end, move by word, cut text, and handle multi-line edits.',
    challenges: [
      {
        title: 'Snap to Start',
        scenario: 'Your cursor is at the end of a long command. Jump to the start instantly.',
        objective: 'Use the readline shortcut for beginning-of-line.',
        inputMode: 'keypress',
        acceptedKeySequences: [['ctrl+a']],
        accepted: [/^ctrl\+a$/i, /^ctrl-a$/i],
        hint: 'Control key + first letter.',
        solution: 'Ctrl+A',
        lesson: 'Ctrl+A jumps to the start of the current command line in most shells.'
      },
      {
        title: 'Snap to End',
        scenario: 'Now jump from middle of command to the end.',
        objective: 'Use the readline shortcut for end-of-line.',
        inputMode: 'keypress',
        acceptedKeySequences: [['ctrl+e']],
        accepted: [/^ctrl\+e$/i, /^ctrl-e$/i],
        hint: 'Control key + fifth letter.',
        solution: 'Ctrl+E',
        lesson: 'Ctrl+E moves to command end, perfect before appending flags.'
      },
      {
        title: 'Word Hop Left',
        scenario: 'Move back one word without arrow key tapping.',
        objective: 'Use the backward-word shortcut.',
        inputMode: 'keypress',
        acceptedKeySequences: [['alt+b'], ['escape', 'b']],
        accepted: [/^alt\+b$/i, /^option\+b$/i, /^meta\+b$/i, /^esc\s+b$/i],
        hint: 'Commonly Alt/Option plus one letter.',
        solution: 'Alt+B (or Option+B on macOS terminals)',
        lesson: 'Word jumps let you surgically edit long commands much faster.'
      },
      {
        title: 'Word Hop Right',
        scenario: 'Move forward one word quickly in the command buffer.',
        objective: 'Use the forward-word shortcut.',
        inputMode: 'keypress',
        acceptedKeySequences: [['alt+f'], ['escape', 'f']],
        accepted: [/^alt\+f$/i, /^option\+f$/i, /^meta\+f$/i, /^esc\s+f$/i],
        hint: 'Same modifier as word-left, different letter.',
        solution: 'Alt+F (or Option+F on macOS terminals)',
        lesson: 'Forward word jumps pair with backward jumps for efficient navigation.'
      },
      {
        title: 'Delete Previous Word',
        scenario: 'You mistyped one argument and want to delete just the previous word.',
        objective: 'Use the backward-kill-word shortcut.',
        inputMode: 'keypress',
        acceptedKeySequences: [['ctrl+w']],
        accepted: [/^ctrl\+w$/i, /^ctrl-w$/i],
        hint: 'Control plus the letter usually used for closing tabs in browsers.',
        solution: 'Ctrl+W',
        lesson: 'Ctrl+W deletes the word left of cursor, ideal for fast corrections.'
      },
      {
        title: 'Cut to Start of Line',
        scenario: 'Cursor is in the middle and you want to clear everything left of it.',
        objective: 'Use the readline shortcut that kills backward to line start.',
        inputMode: 'keypress',
        acceptedKeySequences: [['ctrl+u']],
        accepted: [/^ctrl\+u$/i, /^ctrl-u$/i],
        hint: 'Control key + u.',
        solution: 'Ctrl+U',
        lesson: 'Ctrl+U removes text from cursor back to the start of the line.'
      },
      {
        title: 'Cut to End of Line',
        scenario: 'Keep the beginning of a command, remove everything after cursor.',
        objective: 'Use the shortcut that kills forward to line end.',
        inputMode: 'keypress',
        acceptedKeySequences: [['ctrl+k']],
        accepted: [/^ctrl\+k$/i, /^ctrl-k$/i],
        hint: 'Control key + k.',
        solution: 'Ctrl+K',
        lesson: 'Ctrl+K removes text from cursor to end of line.'
      },
      {
        title: 'Open Multi-line Editor',
        scenario: 'You are composing a long command/function and want full editor control.',
        objective: 'Use the readline shortcut to open the current line in your editor.',
        inputMode: 'keypress',
        acceptedKeySequences: [['ctrl+x', 'ctrl+e']],
        accepted: [/^ctrl\+x\s+ctrl\+e$/i, /^ctrl-x\s+ctrl-e$/i],
        hint: 'It is a two-key sequence starting with Ctrl+X.',
        solution: 'Ctrl+X Ctrl+E',
        lesson: 'Ctrl+X Ctrl+E opens your shell editor for complex or multi-line command editing.'
      }
    ]
  },
  {
    id: 'pipeline',
    name: 'Pipeline Forge: Text Ops',
    tagline: 'Turn raw output into precise answers.',
    description:
      'Practice filtering, counting, sorting, and redirecting output like a power user.',
    challenges: [
      {
        title: 'Find Failures',
        scenario: 'You need lines containing ERROR from app.log.',
        objective: 'Search app.log for ERROR.',
        accepted: [/^grep\s+(['"])?ERROR\1\s+app\.log$/i, /^rg\s+(['"])?ERROR\1\s+app\.log$/i],
        hint: 'Use grep or rg.',
        solution: 'grep "ERROR" app.log',
        lesson: '`grep` and `rg` are your text scanners. `rg` is usually faster in big repos.'
      },
      {
        title: 'Count Matches',
        scenario: 'Now report how many ERROR lines are in app.log.',
        objective: 'Count matches directly in one command.',
        accepted: [/^grep\s+-c\s+(['"])?ERROR\1\s+app\.log$/i, /^rg\s+-c\s+(['"])?ERROR\1\s+app\.log$/i],
        hint: 'One flag on grep or rg returns a count.',
        solution: 'grep -c "ERROR" app.log',
        lesson: 'Use count flags before adding extra pipes. Fewer processes, cleaner commands.'
      },
      {
        title: 'Top Requesters',
        scenario: 'access.log has IP addresses, one per line. You need top 5 by frequency.',
        objective: 'Sort, count duplicates, and show the top five.',
        accepted: [
          /^sort\s+access\.log\s*\|\s*uniq\s+-c\s*\|\s*sort\s+-nr\s*\|\s*head\s+-n\s*5$/i,
          /^sort\s+access\.log\s*\|\s*uniq\s+-c\s*\|\s*sort\s+-nr\s*\|\s*head\s+-5$/i
        ],
        hint: 'Pipeline: sort -> uniq -c -> sort -nr -> head.',
        solution: 'sort access.log | uniq -c | sort -nr | head -n 5',
        lesson: 'Pipelines let each command do one job well. Chain simple tools for complex outcomes.'
      },
      {
        title: 'Append Log Entry',
        scenario: 'Add `deploy ok` as a new line at the end of deploy.log.',
        objective: 'Append text to a file without overwriting it.',
        accepted: [/^echo\s+['"]deploy ok['"]\s*>>\s*deploy\.log$/i],
        hint: 'Use `>>`, not `>`.',
        solution: 'echo "deploy ok" >> deploy.log',
        lesson: '`>>` appends safely. `>` overwrites the file and can destroy data.'
      },
      {
        title: 'Count JS Files',
        scenario: 'Count JavaScript files under the current directory.',
        objective: 'Use find + wc to count files ending in .js.',
        accepted: [
          /^find\s+\.\s+-name\s+['"]\*\.js['"]\s*\|\s*wc\s+-l$/i,
          /^find\s+\.\s+-type\s+f\s+-name\s+['"]\*\.js['"]\s*\|\s*wc\s+-l$/i
        ],
        hint: 'find with a name pattern piped into line count.',
        solution: 'find . -name "*.js" | wc -l',
        lesson: '`find` + `wc -l` is a classic pattern for reliable inventory counts.'
      }
    ]
  },
  {
    id: 'workflow',
    name: 'Ops Deck: Shell Workflow',
    tagline: 'Control processes, permissions, and environment state.',
    description:
      'Build practical operations instincts: process checks, kill signals, chmod, archives, and exports.',
    challenges: [
      {
        title: 'Process Recon',
        scenario: 'You want to check if nginx is running.',
        objective: 'List processes and filter for nginx.',
        accepted: [/^ps\s+aux\s*\|\s*grep\s+nginx$/i, /^pgrep\s+-a\s+nginx$/i],
        hint: 'Use `ps aux | grep ...` or `pgrep -a`.',
        solution: 'ps aux | grep nginx',
        lesson: '`pgrep -a` is cleaner for scripts; `ps | grep` is universal and easy to remember.'
      },
      {
        title: 'Terminate By PID',
        scenario: 'A process with PID 4242 is stuck.',
        objective: 'Send a standard termination signal to PID 4242.',
        accepted: ['kill 4242', /^kill\s+-15\s+4242$/i],
        hint: 'Use kill with the PID.',
        solution: 'kill 4242',
        lesson: '`kill` defaults to SIGTERM (15), giving processes a chance to shut down cleanly.'
      },
      {
        title: 'Make It Executable',
        scenario: 'A script named deploy.sh should be runnable directly.',
        objective: 'Grant execute permission.',
        accepted: ['chmod +x deploy.sh', /^chmod\s+u\+x\s+deploy\.sh$/i],
        hint: '`chmod` plus execute flag.',
        solution: 'chmod +x deploy.sh',
        lesson: '`chmod +x` is the practical default for scripts you need to run as commands.'
      },
      {
        title: 'Create Compressed Backup',
        scenario: 'Archive the folder project/ into backup.tgz.',
        objective: 'Create a gzipped tar archive.',
        accepted: [/^tar\s+-czf\s+backup\.tgz\s+project\/?$/i],
        hint: 'Use tar flags c z f in that order.',
        solution: 'tar -czf backup.tgz project/',
        lesson: '`tar -czf` is the standard Linux/macOS backup shortcut for directories.'
      },
      {
        title: 'Set Env Var',
        scenario: 'Set environment variable APP_ENV to production for the current shell.',
        objective: 'Export APP_ENV as production.',
        accepted: [/^export\s+APP_ENV=production$/i, /^APP_ENV=production\s+export\s+APP_ENV$/i],
        hint: 'Use export KEY=value syntax.',
        solution: 'export APP_ENV=production',
        lesson: '`export` makes variables available to child processes launched from that shell.'
      }
    ]
  },
  {
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
  }
];

const codex = [
  { topic: 'Navigation', command: 'pwd', note: 'Print working directory.' },
  { topic: 'Navigation', command: 'ls -la', note: 'Long list including hidden files.' },
  { topic: 'Navigation', command: 'cd <dir>', note: 'Change current directory.' },
  { topic: 'Line Editing', command: 'Ctrl+A', note: 'Jump to start of line.' },
  { topic: 'Line Editing', command: 'Ctrl+E', note: 'Jump to end of line.' },
  { topic: 'Line Editing', command: 'Alt+B', note: 'Move cursor back one word.' },
  { topic: 'Line Editing', command: 'Alt+F', note: 'Move cursor forward one word.' },
  { topic: 'Line Editing', command: 'Ctrl+W', note: 'Delete previous word.' },
  { topic: 'Line Editing', command: 'Ctrl+U', note: 'Delete to beginning of line.' },
  { topic: 'Line Editing', command: 'Ctrl+K', note: 'Delete to end of line.' },
  { topic: 'Line Editing', command: 'Ctrl+X Ctrl+E', note: 'Open external editor for multi-line editing.' },
  { topic: 'Files', command: 'mkdir -p a/b/c', note: 'Create nested directories.' },
  { topic: 'Files', command: 'touch file.txt', note: 'Create empty file/update timestamp.' },
  { topic: 'Search', command: 'grep "text" file', note: 'Search text in file.' },
  { topic: 'Search', command: 'rg "text"', note: 'Fast recursive search.' },
  { topic: 'Pipes', command: 'cmd1 | cmd2', note: 'Send output of one command to another.' },
  { topic: 'Output', command: 'echo "x" >> log.txt', note: 'Append output to file.' },
  { topic: 'Process', command: 'ps aux | grep name', note: 'Find running process.' },
  { topic: 'Process', command: 'kill <pid>', note: 'Terminate process by PID.' },
  { topic: 'Permissions', command: 'chmod +x script.sh', note: 'Make script executable.' },
  { topic: 'Archive', command: 'tar -czf backup.tgz folder/', note: 'Compress directory.' },
  { topic: 'Env', command: 'export KEY=value', note: 'Set environment variable.' },
  { topic: 'tmux', command: 'tmux new -s name', note: 'Create named session.' },
  { topic: 'tmux', command: 'tmux split-window -h', note: 'Split left/right panes.' },
  { topic: 'tmux', command: 'tmux split-window -v', note: 'Split top/bottom panes.' },
  { topic: 'tmux', command: 'Ctrl+b [', note: 'Enter copy mode for scrolling/selection.' },
  { topic: 'tmux', command: 'Space / v', note: 'Begin selection in copy mode.' },
  { topic: 'tmux', command: 'Enter / y', note: 'Yank selection in copy mode.' },
  { topic: 'tmux', command: 'Ctrl+b d', note: 'Detach session.' },
  { topic: 'tmux', command: 'tmux attach -t name', note: 'Reattach session.' }
];

const rankTiers = [
  { xp: 0, title: 'Shell Newcomer' },
  { xp: 80, title: 'Pathfinder' },
  { xp: 180, title: 'Pipeline Ranger' },
  { xp: 320, title: 'Ops Navigator' },
  { xp: 520, title: 'Pane Commander' },
  { xp: 760, title: 'Terminal Grandmaster' }
];

module.exports = {
  modules,
  codex,
  rankTiers
};
