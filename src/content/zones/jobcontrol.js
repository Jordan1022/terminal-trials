const zone = {
  id: 'jobcontrol',
  name: 'Command Tower: Job Control',
  tagline: 'Juggle processes without losing your place.',
  description:
    'Master suspending, resuming, and backgrounding processes to run multiple tasks from a single terminal.',
  challenges: [
    {
      title: 'Freeze a Process',
      scenario: 'A long-running build is hogging your terminal. Suspend it without killing it.',
      objective: 'Use the keyboard shortcut to suspend the foreground process.',
      inputMode: 'keypress',
      acceptedKeySequences: [['ctrl+z']],
      accepted: [/^ctrl\+z$/i, /^ctrl-z$/i],
      hint: 'Control key + the last letter of the alphabet.',
      solution: 'Ctrl+Z',
      lesson: 'Ctrl+Z sends SIGTSTP, pausing the process. It stays in memory, ready to resume.'
    },
    {
      title: 'Resume in Background',
      scenario: 'You suspended a process with Ctrl+Z. Now let it continue running in the background.',
      objective: 'Resume the most recently stopped job in the background.',
      accepted: ['bg', /^bg\s+%\d+$/i],
      hint: 'Two letters. Stands for background.',
      solution: 'bg',
      lesson: '`bg` resumes a stopped job in the background so you get your prompt back while it runs.'
    },
    {
      title: 'Bring It Back',
      scenario: 'A background job needs your attention. Pull it to the foreground.',
      objective: 'Bring the most recent background job to the foreground.',
      accepted: ['fg', /^fg\s+%\d+$/i],
      hint: 'Two letters. Stands for foreground.',
      solution: 'fg',
      lesson: '`fg` moves a background or stopped job back to the foreground for interactive use.'
    },
    {
      title: 'Check Active Jobs',
      scenario: 'You have several suspended and background processes. List them all.',
      objective: 'Show all jobs managed by the current shell.',
      accepted: ['jobs', /^jobs\s+-l$/i],
      hint: 'One word. It literally lists your jobs.',
      solution: 'jobs',
      lesson: '`jobs` shows job IDs, states (running/stopped), and commands. Use %N to reference specific jobs.'
    },
    {
      title: 'Launch in Background',
      scenario: 'Start a long download without blocking your terminal.',
      objective: 'Run `sleep 300` in the background from the start.',
      accepted: [/^sleep\s+300\s*&$/i],
      hint: 'Add a single character at the end of the command.',
      solution: 'sleep 300 &',
      lesson: '`&` at the end of a command starts it in the background immediately. No need to Ctrl+Z first.'
    },
    {
      title: 'Read the Nohup',
      inputMode: 'explain',
      scenario: 'A sysadmin runs this before logging off:',
      objective: 'Explain: nohup ./backup.sh > /dev/null 2>&1 &',
      accepted: [
        (answer) => {
          const a = answer.toLowerCase();
          const hasSurvive = /surviv|persist|keep|continu|logout|disconnect|hangup|close|terminal/i.test(a);
          const hasBackground = /background|&|detach/i.test(a);
          return hasSurvive && hasBackground;
        }
      ],
      hint: 'What happens to a process when you close your terminal? What prevents that?',
      solution: 'Runs backup.sh in the background, immune to hangup signals, with all output discarded.',
      lesson: '`nohup` prevents SIGHUP from killing the process when your session ends. Combined with & it creates a truly detached process.'
    }
  ]
};

const codexEntries = [
  { topic: 'Job Control', command: 'Ctrl+Z', note: 'Suspend foreground process.' },
  { topic: 'Job Control', command: 'bg', note: 'Resume stopped job in background.' },
  { topic: 'Job Control', command: 'fg', note: 'Bring job to foreground.' },
  { topic: 'Job Control', command: 'jobs', note: 'List shell jobs.' },
  { topic: 'Job Control', command: 'command &', note: 'Start command in background.' },
  { topic: 'Job Control', command: 'nohup cmd &', note: 'Run process immune to hangup.' }
];

module.exports = { zone, codexEntries };
