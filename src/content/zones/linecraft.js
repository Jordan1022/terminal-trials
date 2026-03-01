const zone = {
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
};

const codexEntries = [
  { topic: 'Line Editing', command: 'Ctrl+A', note: 'Jump to start of line.' },
  { topic: 'Line Editing', command: 'Ctrl+E', note: 'Jump to end of line.' },
  { topic: 'Line Editing', command: 'Alt+B', note: 'Move cursor back one word.' },
  { topic: 'Line Editing', command: 'Alt+F', note: 'Move cursor forward one word.' },
  { topic: 'Line Editing', command: 'Ctrl+W', note: 'Delete previous word.' },
  { topic: 'Line Editing', command: 'Ctrl+U', note: 'Delete to beginning of line.' },
  { topic: 'Line Editing', command: 'Ctrl+K', note: 'Delete to end of line.' },
  { topic: 'Line Editing', command: 'Ctrl+X Ctrl+E', note: 'Open external editor for multi-line editing.' }
];

module.exports = { zone, codexEntries };
