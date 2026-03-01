const zone = {
  id: 'scripting',
  name: 'Script Forge: Shell Scripting',
  tagline: 'Automate anything with bash scripts.',
  description:
    'Learn variables, conditionals, loops, functions, and exit codes to turn repetitive tasks into reusable scripts.',
  challenges: [
    {
      title: 'The Shebang',
      scenario: 'You are writing a new bash script and need the first line to tell the system which interpreter to use.',
      objective: 'Write the shebang line for a bash script.',
      accepted: ['#!/bin/bash', '#!/usr/bin/env bash'],
      hint: 'It starts with #! and points to the bash binary.',
      solution: '#!/bin/bash',
      lesson: 'The shebang line ensures your script runs with the correct interpreter regardless of the user\'s default shell.'
    },
    {
      title: 'Store a Value',
      scenario: 'You need to assign the string "production" to a variable called ENV.',
      objective: 'Create a shell variable named ENV with value production.',
      accepted: [/^ENV="?production"?$/i, /^ENV='production'$/i],
      hint: 'Variable assignment uses = with no spaces around it.',
      solution: 'ENV="production"',
      lesson: 'Shell variables have no spaces around the = sign. Quotes protect values that contain spaces or special characters.'
    },
    {
      title: 'Read the Substitution',
      inputMode: 'explain',
      scenario: 'A teammate wrote this in a deploy script:',
      objective: 'Explain: COMMIT=$(git rev-parse --short HEAD)',
      accepted: [
        (answer) => {
          const a = answer.toLowerCase();
          const hasCapture = /captur|store|assign|save|set|variable/i.test(a);
          const hasCommand = /run|execut|output|result|command/i.test(a);
          return hasCapture && hasCommand;
        }
      ],
      hint: 'What does $(...) do with the command inside it?',
      solution: 'Runs the git command and stores its output in the COMMIT variable.',
      lesson: '$() is command substitution. It executes the inner command and captures its stdout into the variable.'
    },
    {
      title: 'Conditional Check',
      scenario: 'Your script should only proceed if a file called config.json exists.',
      objective: 'Write an if statement that tests whether config.json exists as a file.',
      accepted: [
        /^if\s+\[\s+-f\s+config\.json\s+\];\s*then$/i,
        /^if\s+\[\[\s+-f\s+config\.json\s+\]\];\s*then$/i,
        /^if\s+test\s+-f\s+config\.json;\s*then$/i
      ],
      hint: 'Use [ -f filename ] to test for file existence.',
      solution: 'if [ -f config.json ]; then',
      lesson: 'The -f test checks if a path exists and is a regular file. Always use spaces inside [ ] brackets.'
    },
    {
      title: 'Loop Through Files',
      scenario: 'Process every .log file in the current directory.',
      objective: 'Write a for loop header that iterates over all .log files.',
      accepted: [
        /^for\s+\w+\s+in\s+\*\.log;\s*do$/i
      ],
      hint: 'Use a glob pattern: for f in *.log; do',
      solution: 'for f in *.log; do',
      lesson: 'Shell for loops expand glob patterns at runtime. This is the idiomatic way to process batches of files.'
    },
    {
      title: 'Define a Function',
      scenario: 'Create a reusable function called greet that echoes "hello".',
      objective: 'Write a shell function definition for greet.',
      accepted: [
        /^greet\s*\(\)\s*\{\s*echo\s+['"]?hello['"]?\s*;\s*\}$/i,
        /^function\s+greet\s*\(\)\s*\{/i,
        /^function\s+greet\s*\{/i,
        /^greet\s*\(\)\s*\{/i
      ],
      hint: 'Two forms: function greet { ... } or greet() { ... }',
      solution: 'greet() { echo "hello"; }',
      lesson: 'Functions let you organize scripts into testable, reusable blocks. The () { } syntax works in all POSIX shells.'
    },
    {
      title: 'Read the Exit Code',
      inputMode: 'explain',
      scenario: 'After running a command, you check this special variable:',
      objective: 'Explain: echo $?',
      accepted: [
        (answer) => {
          const a = answer.toLowerCase();
          const hasExit = /exit\s*(code|status)|return\s*(code|status|value)|status\s*code/i.test(a);
          const hasLast = /last|previous|most recent|preceding/i.test(a);
          return hasExit || (hasLast && /command/i.test(a));
        }
      ],
      hint: '$? holds a number. What does that number represent?',
      solution: 'Prints the exit status of the last executed command (0 = success, non-zero = error).',
      lesson: '$? is essential for error handling in scripts. Always check it after critical commands.'
    }
  ]
};

const codexEntries = [
  { topic: 'Scripting', command: '#!/bin/bash', note: 'Shebang line for bash scripts.' },
  { topic: 'Scripting', command: 'VAR="value"', note: 'Assign a shell variable.' },
  { topic: 'Scripting', command: '$(command)', note: 'Command substitution: capture output.' },
  { topic: 'Scripting', command: 'if [ -f file ]; then', note: 'Test if file exists.' },
  { topic: 'Scripting', command: 'for f in *.log; do', note: 'Loop over matching files.' },
  { topic: 'Scripting', command: 'func() { ...; }', note: 'Define a shell function.' },
  { topic: 'Scripting', command: 'echo $?', note: 'Print last command exit status.' }
];

module.exports = { zone, codexEntries };
