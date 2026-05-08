const zone = {
  id: 'bash_advanced',
  name: 'Bash Mastery: Arrays & Error Handling',
  difficulty: 'EXPERT',
  tagline: 'Write scripts that are robust enough for production.',
  description:
    'Go beyond single-use scripts: learn bash arrays, strict error modes, signal trapping, here-documents, and option parsing with getopts.',
  challenges: [
    {
      title: 'Declare an Array',
      scenario: 'You need to store three environment names in a bash array: alpha, beta, and gamma.',
      objective: 'Declare a bash array named arr containing alpha, beta, and gamma.',
      accepted: [
        /^arr=\(\s*["']?alpha["']?\s+["']?beta["']?\s+["']?gamma["']?\s*\)$/i
      ],
      hint: 'Bash arrays use parentheses: arr=(item1 item2 item3)',
      solution: 'arr=("alpha" "beta" "gamma")',
      lesson: 'Bash arrays use `()` for initialization. Access elements with `${arr[0]}` or expand all with `${arr[@]}`. Always quote elements that may contain spaces.'
    },
    {
      title: 'Loop Over an Array',
      scenario: 'You want to iterate over every item in the arr array without missing any.',
      objective: 'Write the for loop header to safely iterate over all elements of arr.',
      accepted: [
        /^for\s+\w+\s+in\s+"\$\{arr\[@\]\}";\s*do$/i,
        /^for\s+\w+\s+in\s+"\$\{arr\[\*\]\}";\s*do$/i
      ],
      hint: 'Use ${arr[@]} in double quotes to safely expand all elements.',
      solution: 'for item in "${arr[@]}"; do',
      lesson: '"${arr[@]}" expands each element as a separate quoted word, preserving spaces inside values. "${arr[*]}" joins them into one string — usually not what you want.'
    },
    {
      title: 'Array Length',
      scenario: 'You need to know how many elements are in the arr array before looping.',
      objective: 'Print the number of elements in arr.',
      accepted: [
        /^echo\s+"\$\{#arr\[@\]\}"$/i,
        /^echo\s+\$\{#arr\[@\]\}$/i
      ],
      hint: 'Prefix # inside the expansion to get the count.',
      solution: 'echo "${#arr[@]}"',
      lesson: '`${#arr[@]}` gives the element count. `${#var}` gives the character length of a string. The `#` prefix always means "length of" in bash parameter expansion.'
    },
    {
      title: 'Strict Mode',
      inputMode: 'explain',
      scenario: 'Every robust bash script at your company starts with this header:',
      objective: 'Explain what each flag does in: set -euo pipefail',
      accepted: [
        (answer) => {
          const a = answer.toLowerCase();
          const hasE = /exit|error|fail|nonzero|-e/i.test(a);
          const hasU = /unset|unbound|undefined variable|-u/i.test(a);
          const hasPipefail = /pipefail|pipe failure|pipeline failure|pipe errors?|pipeline errors?/i.test(a);
          return hasE && hasU && hasPipefail;
        }
      ],
      hint: 'Three flags: -e, -u, and -o pipefail. What does each one catch?',
      solution: '-e exits immediately on error, -u treats unset variables as errors, -o pipefail propagates failures through pipes.',
      lesson: '`set -euo pipefail` is the most common bash strict mode header. It catches typos in variable names, swallowed pipe failures, and scripts that should have exited on error but kept running.'
    },
    {
      title: 'Trap on Exit',
      scenario: 'Your script creates temp files and must clean them up even if it crashes partway through.',
      objective: 'Register a cleanup function to run whenever the script exits, using trap.',
      accepted: [
        /^trap\s+['"]cleanup['"]\s+EXIT$/i,
        /^trap\s+cleanup\s+EXIT$/i
      ],
      hint: "trap 'function_or_command' SIGNAL — EXIT fires on any exit.",
      solution: "trap 'cleanup' EXIT",
      lesson: "`trap` catches signals. `EXIT` fires on any exit — normal or error. This pattern guarantees cleanup of temp files, locks, and connections in production scripts."
    },
    {
      title: 'Here-Document',
      inputMode: 'explain',
      scenario: 'A coworker uses this pattern to write a multi-line config file inside a script:',
      objective: 'Explain what a here-document does in: cat <<EOF ... EOF',
      accepted: [
        (answer) => {
          const a = answer.toLowerCase();
          const hasMultiline = /multiline|multi-line|multiple line|block|several line/i.test(a);
          const hasStdin = /stdin|input|feed|pass|send|inline/i.test(a);
          const hasHeredoc = /heredoc|here.?doc|here document/i.test(a);
          return hasHeredoc || (hasMultiline && hasStdin);
        }
      ],
      hint: 'Think about what <<EOF does to the stdin of the cat command.',
      solution: 'A heredoc feeds multiple lines of text as stdin to a command, inline in the script without a separate file.',
      lesson: "Heredocs use `<<MARKER` to start and `MARKER` alone on a line to end. Use `<<'EOF'` (quoted marker) to prevent variable expansion inside the block — useful for generating scripts."
    },
    {
      title: 'Parse Options',
      scenario: 'Your script needs to accept a -v flag for verbose mode and a -f flag that takes a filename argument.',
      objective: 'Write the while loop header that uses getopts to parse these flags.',
      accepted: [
        /^while\s+getopts\s+["']vf:["']\s+\w+;\s*do$/i,
        /^while\s+getopts\s+["']f:v["']\s+\w+;\s*do$/i
      ],
      hint: "A colon after a letter in the option string means that flag requires an argument.",
      solution: 'while getopts "vf:" opt; do',
      lesson: '`getopts` is the POSIX-standard option parser. A `:` after a letter means that flag takes an argument, stored in `$OPTARG`. It handles -h vs --help and graceful errors automatically.'
    }
  ]
};

const codexEntries = [
  { topic: 'Bash Advanced', command: 'arr=("a" "b" "c")', note: 'Declare a bash array.' },
  { topic: 'Bash Advanced', command: 'for x in "${arr[@]}"; do', note: 'Loop over array elements safely.' },
  { topic: 'Bash Advanced', command: '${#arr[@]}', note: 'Number of array elements.' },
  { topic: 'Bash Advanced', command: 'set -euo pipefail', note: 'Enable strict error mode.' },
  { topic: 'Bash Advanced', command: "trap 'fn' EXIT", note: 'Run cleanup function on exit.' },
  { topic: 'Bash Advanced', command: 'cat <<EOF ... EOF', note: 'Here-document: inline stdin block.' },
  { topic: 'Bash Advanced', command: 'while getopts "f:" opt; do', note: 'Parse command-line options.' }
];

module.exports = { zone, codexEntries };
