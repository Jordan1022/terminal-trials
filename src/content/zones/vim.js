const zone = {
  id: 'vim',
  name: 'The Editor: Vim Basics',
  tagline: 'Edit files without leaving the terminal.',
  description:
    'Learn vim modes, navigation, editing, saving, and searching — enough to handle any terminal editing task.',
  challenges: [
    {
      title: 'Open a File',
      scenario: 'You need to edit server.conf from the command line.',
      objective: 'Open server.conf in vim.',
      accepted: ['vim server.conf', /^vi\s+server\.conf$/i, /^nvim\s+server\.conf$/i],
      hint: 'Three letters, then the filename.',
      solution: 'vim server.conf',
      lesson: 'Vim is installed on virtually every Unix system. Knowing the basics means you can edit files anywhere.'
    },
    {
      title: 'Enter Insert Mode',
      scenario: 'You opened a file in vim and need to start typing text at the cursor position.',
      objective: 'Enter insert mode to begin typing.',
      accepted: ['i', 'a', 'o'],
      hint: 'A single key switches from normal mode to insert mode.',
      solution: 'i',
      lesson: '`i` inserts before cursor, `a` appends after cursor, `o` opens a new line below. All enter insert mode.'
    },
    {
      title: 'Save and Quit',
      scenario: 'You finished editing and want to save your changes and exit vim.',
      objective: 'Write the file and quit vim.',
      accepted: [':wq', ':x', /^:wq!?$/i, 'ZZ'],
      hint: 'It starts with a colon, then two letters for write and quit.',
      solution: ':wq',
      lesson: '`:wq` writes and quits in one step. `:x` is equivalent. `ZZ` (no colon) does the same from normal mode.'
    },
    {
      title: 'Quit Without Saving',
      scenario: 'You made a mess and want to abandon all changes and exit.',
      objective: 'Quit vim without saving changes.',
      accepted: [':q!'],
      hint: 'Quit command with a force flag.',
      solution: ':q!',
      lesson: '`:q!` forces quit without writing. The `!` overrides vim\'s safety check for unsaved changes.'
    },
    {
      title: 'Delete a Line',
      scenario: 'You need to remove the current line entirely from normal mode.',
      objective: 'Delete the current line in vim.',
      accepted: ['dd'],
      hint: 'Press the same letter twice from normal mode.',
      solution: 'dd',
      lesson: '`dd` deletes the current line and stores it in the register. You can paste it elsewhere with `p`.'
    },
    {
      title: 'Search in File',
      scenario: 'You need to find the word "error" somewhere in a large config file.',
      objective: 'Search forward for "error" in vim.',
      accepted: ['/error', /^\/error$/i],
      hint: 'Start with a forward slash, then the search term.',
      solution: '/error',
      lesson: '`/` starts forward search. Press `n` for next match, `N` for previous. It supports regex patterns.'
    },
    {
      title: 'Read the Yank',
      inputMode: 'explain',
      scenario: 'You see a colleague use this sequence in vim:',
      objective: 'Explain: yy then p',
      accepted: [
        (answer) => {
          const a = answer.toLowerCase();
          const hasCopy = /cop(y|ies)|yank|duplicat/i.test(a);
          const hasPaste = /past|put|insert|below|after/i.test(a);
          return hasCopy && hasPaste;
        }
      ],
      hint: '`yy` does something to the current line. `p` does something with what was captured.',
      solution: 'Copies (yanks) the current line, then pastes it below the cursor.',
      lesson: 'Vim\'s yank/put system is like copy/paste. `yy` copies a line, `p` puts it after the cursor position.'
    }
  ]
};

const codexEntries = [
  { topic: 'Vim', command: 'vim file', note: 'Open file in vim.' },
  { topic: 'Vim', command: 'i', note: 'Enter insert mode.' },
  { topic: 'Vim', command: ':wq', note: 'Save and quit.' },
  { topic: 'Vim', command: ':q!', note: 'Quit without saving.' },
  { topic: 'Vim', command: 'dd', note: 'Delete current line.' },
  { topic: 'Vim', command: '/pattern', note: 'Search forward in file.' },
  { topic: 'Vim', command: 'yy / p', note: 'Copy line / paste below.' }
];

module.exports = { zone, codexEntries };
