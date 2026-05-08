const zone = {
  id: 'fieldcraft',
  name: 'Fieldcraft: File Basics',
  difficulty: 'BEGINNER',
  tagline: 'Handle files with confidence from day one.',
  description:
    'Master the essential file commands every terminal user needs: reading, copying, moving, deleting, and inspecting files.',
  challenges: [
    {
      title: 'Say Hello',
      scenario: 'You need to print a greeting message to the terminal.',
      objective: 'Use echo to print the text: Hello, terminal',
      accepted: [/^echo\s+["']Hello,\s+terminal["']$/i, /^echo\s+Hello,\s+terminal$/i],
      hint: 'Use echo with the message in quotes.',
      solution: 'echo "Hello, terminal"',
      lesson: '`echo` writes text to stdout. Quoting strings is good practice when they contain spaces or special characters.'
    },
    {
      title: 'Read a File',
      scenario: 'You want to see the full contents of README.md without opening an editor.',
      objective: 'Print the contents of README.md to the terminal.',
      accepted: [/^cat\s+README\.md$/i],
      hint: 'The cat command concatenates and displays file contents.',
      solution: 'cat README.md',
      lesson: '`cat` is the fastest way to read a small file. For large files, prefer `less` so you can scroll interactively.'
    },
    {
      title: 'Copy a File',
      scenario: 'Before editing README.md you want a backup copy.',
      objective: 'Copy README.md to README.md.bak.',
      accepted: [/^cp\s+README\.md\s+README\.md\.bak$/i],
      hint: 'The copy command takes a source and a destination.',
      solution: 'cp README.md README.md.bak',
      lesson: '`cp src dest` copies a file. Add `-r` to copy directories recursively.'
    },
    {
      title: 'Move a File',
      scenario: 'notes.txt was left in the root but belongs in the docs directory.',
      objective: 'Move notes.txt into the docs/ folder.',
      accepted: [/^mv\s+notes\.txt\s+docs\/notes\.txt$/i, /^mv\s+notes\.txt\s+docs\/?$/i],
      hint: '`mv` handles both renaming and moving in one command.',
      solution: 'mv notes.txt docs/notes.txt',
      lesson: '`mv` moves and renames in one command. There is no separate rename command in standard Unix.'
    },
    {
      title: 'Delete a File',
      scenario: 'temp.txt is no longer needed.',
      objective: 'Delete temp.txt.',
      accepted: [/^rm\s+temp\.txt$/i],
      hint: 'The remove command takes the file name as an argument.',
      solution: 'rm temp.txt',
      lesson: '`rm` is permanent — there is no recycle bin. Double-check before running. Use `rm -i` for interactive confirmation on important work.'
    },
    {
      title: 'Peek at the Top',
      scenario: 'server.log is hundreds of lines. You only need to check the first 5.',
      objective: 'Print the first 5 lines of server.log.',
      accepted: [/^head\s+-n\s+5\s+server\.log$/i, /^head\s+-5\s+server\.log$/i],
      hint: 'Use head with a line count flag.',
      solution: 'head -n 5 server.log',
      lesson: '`head` lets you preview the beginning of a file instantly. Useful for checking log format before processing.'
    },
    {
      title: 'Peek at the Bottom',
      scenario: 'The most recent entries in deploy.log are at the end of the file.',
      objective: 'Print the last 10 lines of deploy.log.',
      accepted: [/^tail\s+-n\s+10\s+deploy\.log$/i, /^tail\s+-10\s+deploy\.log$/i],
      hint: 'Use tail with a line count flag.',
      solution: 'tail -n 10 deploy.log',
      lesson: '`tail -f` follows a file as it grows — indispensable for watching live logs in real time.'
    },
    {
      title: 'Count Lines',
      scenario: 'You need a quick count of how many entries are in access.log.',
      objective: 'Count the number of lines in access.log.',
      accepted: [/^wc\s+-l\s+access\.log$/i],
      hint: 'wc (word count) accepts a -l flag to count lines only.',
      solution: 'wc -l access.log',
      lesson: '`wc -l` is the fastest way to count log entries or records. Combine with grep: `grep "ERROR" app.log | wc -l`.'
    },
    {
      title: 'Get Help',
      inputMode: 'explain',
      scenario: 'You encounter a command you have never used before and need to understand it.',
      objective: 'Describe two ways to look up what a command does.',
      accepted: [
        (answer) => {
          const a = answer.toLowerCase();
          return /manual|man page|documentation|--help|help flag|usage/i.test(a);
        }
      ],
      hint: 'Think about the system manual and built-in help flags.',
      solution: 'Run `man <command>` for the full manual page, or `<command> --help` for a quick usage summary.',
      lesson: '`man ls` opens the manual for ls. `ls --help` prints a shorter summary. Both are essential for self-sufficiency at the terminal.'
    }
  ]
};

const codexEntries = [
  { topic: 'Files', command: 'echo "text"', note: 'Print text to stdout.' },
  { topic: 'Files', command: 'cat file', note: 'Display file contents.' },
  { topic: 'Files', command: 'cp src dest', note: 'Copy a file.' },
  { topic: 'Files', command: 'mv src dest', note: 'Move or rename a file.' },
  { topic: 'Files', command: 'rm file', note: 'Delete a file (permanent, no undo).' },
  { topic: 'Files', command: 'head -n N file', note: 'Print first N lines.' },
  { topic: 'Files', command: 'tail -n N file', note: 'Print last N lines.' },
  { topic: 'Files', command: 'wc -l file', note: 'Count lines in a file.' }
];

module.exports = { zone, codexEntries };
