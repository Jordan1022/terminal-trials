const zone = {
  id: 'powertools',
  name: 'Power Tools: sed, awk & xargs',
  difficulty: 'EXPERT',
  tagline: 'Process text at scale with surgical precision.',
  description:
    'Master the stream editors and pipeline amplifiers that separate terminal experts from everyone else: sed, awk, cut, tr, and xargs.',
  challenges: [
    {
      title: 'Inline Substitution',
      scenario: 'You need to replace every occurrence of ERROR with FIXED in app.log.',
      objective: 'Use sed to substitute ERROR with FIXED globally.',
      accepted: [
        /^sed\s+'s\/ERROR\/FIXED\/g'\s+app\.log$/i,
        /^sed\s+"s\/ERROR\/FIXED\/g"\s+app\.log$/i
      ],
      hint: "sed 's/pattern/replacement/flags' file — the g flag means global (all matches).",
      solution: "sed 's/ERROR/FIXED/g' app.log",
      lesson: "The `g` flag replaces all matches per line. Without it, sed only replaces the first match on each line. Use `-i` to edit the file in place: `sed -i 's/old/new/g' file`."
    },
    {
      title: 'Strip Comment Lines',
      scenario: 'config.txt has comment lines starting with #. You want to view it without them.',
      objective: 'Use sed to delete all lines that begin with #.',
      accepted: [
        /^sed\s+'\/\^#\/d'\s+config\.txt$/i,
        /^sed\s+"\/\^#\/d"\s+config\.txt$/i
      ],
      hint: "sed '/pattern/d' deletes matching lines.",
      solution: "sed '/^#/d' config.txt",
      lesson: "In sed, `/pattern/d` deletes all matching lines. `^#` anchors to the line start, so only lines beginning with # are removed — not lines that contain # elsewhere."
    },
    {
      title: 'Extract First Field',
      scenario: 'access.log has space-separated fields. You need just the first column (IP addresses).',
      objective: 'Use awk to print the first whitespace-delimited field of every line in access.log.',
      accepted: [
        (answer) => {
          const a = answer.trim();
          return /^awk\s+['"]\{\s*print\s+\$1\s*\}['"]\s+access\.log$/i.test(a);
        }
      ],
      hint: "awk splits on whitespace by default. $1 is the first field.",
      solution: "awk '{print $1}' access.log",
      lesson: "awk splits each line into fields on whitespace. `$1` is the first field, `$2` the second, `$NF` is the last. This pattern is invaluable for structured log analysis."
    },
    {
      title: 'Sum a Column',
      inputMode: 'explain',
      scenario: 'A teammate uses this one-liner to total large request sizes:',
      objective: "Explain: awk '$3 > 500 { sum += $3 } END { print sum }' requests.log",
      accepted: [
        (answer) => {
          const a = answer.toLowerCase();
          const hasSum = /sum|add|total|accumulat/i.test(a);
          const hasEnd = /end|after|finish|all lines|final/i.test(a);
          return hasSum && hasEnd;
        }
      ],
      hint: 'Think about what the condition does, what += accumulates, and when END runs.',
      solution: "Filters lines where the 3rd field exceeds 500, accumulates a running total, then prints it after all lines are processed.",
      lesson: "awk's END block runs once after all input is consumed. The pattern — filter, accumulate in a variable, report in END — is the foundation of awk data processing."
    },
    {
      title: 'Cut a Field',
      scenario: '/etc/passwd uses : as a delimiter. You need just the usernames in the first field.',
      objective: 'Use cut to print the first colon-delimited field of /etc/passwd.',
      accepted: [
        /^cut\s+-d:\s+-f1\s+\/etc\/passwd$/i,
        /^cut\s+-d\s+:\s+-f1\s+\/etc\/passwd$/i
      ],
      hint: 'cut takes a delimiter flag (-d) and a field number flag (-f).',
      solution: 'cut -d: -f1 /etc/passwd',
      lesson: '`cut -d: -f1` splits on `:` and extracts field 1. Use `-f1,3` for multiple fields or `-f1-3` for a range. Lighter-weight than awk for simple field extraction.'
    },
    {
      title: 'Translate Characters',
      scenario: 'You need input.txt uppercased for a report header.',
      objective: 'Use tr to convert all lowercase letters in input.txt to uppercase.',
      accepted: [
        /^tr\s+'?\[:\s*lower\s*:\]'?\s+'?\[:\s*upper\s*:\]'?\s*<\s*input\.txt$/i,
        /^cat\s+input\.txt\s*\|\s*tr\s+'?\[:\s*lower\s*:\]'?\s+'?\[:\s*upper\s*:\]'?$/i
      ],
      hint: "tr '[:lower:]' '[:upper:]' reads from stdin.",
      solution: "tr '[:lower:]' '[:upper:]' < input.txt",
      lesson: "`tr` translates characters one-for-one. POSIX classes like `[:lower:]` are portable across systems. Also useful: `tr -d '\\r'` strips Windows line endings from files."
    },
    {
      title: 'Batch Delete with xargs',
      scenario: 'The project has leftover .tmp files scattered across subdirectories.',
      objective: 'Find all .tmp files under the current directory and delete them via xargs.',
      accepted: [
        /^find\s+\.\s+-name\s+['"]\*\.tmp['"]\s*\|\s*xargs\s+rm$/i,
        /^find\s+\.\s+-name\s+'\*\.tmp'\s*\|\s*xargs\s+rm$/i
      ],
      hint: "xargs converts stdin lines into arguments for another command.",
      solution: 'find . -name "*.tmp" | xargs rm',
      lesson: "`xargs` bridges commands: it reads stdin lines and passes them as arguments. Add `-I {}` for custom placement: `find . -name '*.tmp' | xargs -I {} mv {} /archive/`."
    },
    {
      title: 'Find and Execute',
      scenario: 'You need to gzip-compress every .log file in the current tree.',
      objective: 'Use find with -exec to run gzip on every .log file found.',
      accepted: [
        (answer) => {
          const a = answer.trim();
          return /^find\s+\.\s+-name\s+(['"])\*\.log\1\s+-exec\s+gzip\s+\{\}\s+(\\;|\+)$/i.test(a) ||
                 /^find\s+\.\s+-name\s+\*\.log\s+-exec\s+gzip\s+\{\}\s+(\\;|\+)$/i.test(a);
        }
      ],
      hint: 'find -exec runs a command per result. Use {} as the placeholder and + to batch files safely.',
      solution: 'find . -name "*.log" -exec gzip {} +',
      lesson: "`find -exec cmd {} +` batches matched files into command invocations without going through a shell. The older `\\;` form runs once per file and is slower for large sets."
    }
  ]
};

const codexEntries = [
  { topic: 'Text Processing', command: "sed 's/old/new/g' file", note: 'Replace all matches in file.' },
  { topic: 'Text Processing', command: "sed '/^#/d' file", note: 'Delete lines matching pattern.' },
  { topic: 'Text Processing', command: "awk '{print $1}' file", note: 'Print first field per line.' },
  { topic: 'Text Processing', command: 'cut -d: -f1 file', note: 'Cut first colon-delimited field.' },
  { topic: 'Text Processing', command: "tr '[:lower:]' '[:upper:]'", note: 'Uppercase via stdin.' },
  { topic: 'Text Processing', command: 'find . -name "*.x" | xargs rm', note: 'Batch delete matched files.' },
  { topic: 'Text Processing', command: 'find . -name "*.x" -exec cmd {} \\;', note: 'Execute command per result.' }
];

module.exports = { zone, codexEntries };
