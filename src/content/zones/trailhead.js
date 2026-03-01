const zone = {
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
};

const codexEntries = [
  { topic: 'Navigation', command: 'pwd', note: 'Print working directory.' },
  { topic: 'Navigation', command: 'ls -la', note: 'Long list including hidden files.' },
  { topic: 'Navigation', command: 'cd <dir>', note: 'Change current directory.' },
  { topic: 'Files', command: 'mkdir -p a/b/c', note: 'Create nested directories.' },
  { topic: 'Files', command: 'touch file.txt', note: 'Create empty file/update timestamp.' }
];

module.exports = { zone, codexEntries };
