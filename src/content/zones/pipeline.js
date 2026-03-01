const zone = {
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
};

const codexEntries = [
  { topic: 'Search', command: 'grep "text" file', note: 'Search text in file.' },
  { topic: 'Search', command: 'rg "text"', note: 'Fast recursive search.' },
  { topic: 'Pipes', command: 'cmd1 | cmd2', note: 'Send output of one command to another.' },
  { topic: 'Output', command: 'echo "x" >> log.txt', note: 'Append output to file.' }
];

module.exports = { zone, codexEntries };
