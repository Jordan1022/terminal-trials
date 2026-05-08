const zone = {
  id: 'pipeline',
  name: 'Pipeline Forge: Text Ops',
  difficulty: 'INTERMEDIATE',
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
    },
    {
      title: 'Redirect to File',
      scenario: 'You need to capture only the WARNING lines from app.log into a separate file called warnings.txt.',
      objective: 'Search app.log for WARN and redirect the output into warnings.txt.',
      accepted: [
        /^grep\s+(['"])?WARN\1\s+app\.log\s*>\s*warnings\.txt$/i,
        /^rg\s+(['"])?WARN\1\s+app\.log\s*>\s*warnings\.txt$/i
      ],
      hint: 'Use grep then > to redirect stdout to a file.',
      solution: 'grep "WARN" app.log > warnings.txt',
      lesson: '`>` redirects stdout to a file, overwriting it. `>>` appends instead. Use `>` when building a fresh output, `>>` when adding to an existing log.'
    },
    {
      title: 'Search Recursively',
      scenario: 'You need to find every TODO comment scattered across all files in the src/ directory.',
      objective: 'Search for the string TODO in every file under src/ recursively.',
      accepted: [
        /^grep\s+-r\s+(['"])?TODO\1\s+src\/?$/i,
        /^rg\s+(['"])?TODO\1\s+src\/?$/i,
        /^grep\s+-r\s+(['"])?TODO\1\s+src\/$/i
      ],
      hint: 'grep has a flag to search directories recursively.',
      solution: 'grep -r "TODO" src/',
      lesson: '`grep -r` recurses into subdirectories. `rg` does this by default and is much faster in large codebases. Add `-l` to list only the matching filenames.'
    },
    {
      title: 'Cut a Column',
      scenario: 'data.csv has comma-separated fields. You only need the second column (names).',
      objective: 'Use cut to extract the second comma-delimited field from data.csv.',
      accepted: [
        /^cut\s+-d,\s+-f2\s+data\.csv$/i,
        /^cut\s+-d\s+,\s+-f2\s+data\.csv$/i
      ],
      hint: 'cut takes a delimiter flag and a field number.',
      solution: 'cut -d, -f2 data.csv',
      lesson: '`cut -d, -f2` splits each line on `,` and returns field 2. Use `-f1,3` for multiple fields or `-f2-4` for a range. Lighter-weight than awk for simple field extraction.'
    }
  ]
};

const codexEntries = [
  { topic: 'Search', command: 'grep "text" file', note: 'Search text in file.' },
  { topic: 'Search', command: 'grep -r "text" dir/', note: 'Recursive search in directory.' },
  { topic: 'Search', command: 'rg "text"', note: 'Fast recursive search.' },
  { topic: 'Pipes', command: 'cmd1 | cmd2', note: 'Send output of one command to another.' },
  { topic: 'Output', command: 'cmd > file.txt', note: 'Redirect stdout to file (overwrite).' },
  { topic: 'Output', command: 'echo "x" >> log.txt', note: 'Append output to file.' },
  { topic: 'Fields', command: 'cut -d, -f2 file', note: 'Extract comma-delimited field 2.' }
];

module.exports = { zone, codexEntries };
