const zone = {
  id: 'workflow',
  name: 'Ops Deck: Shell Workflow',
  tagline: 'Control processes, permissions, and environment state.',
  description:
    'Build practical operations instincts: process checks, kill signals, chmod, archives, and exports.',
  challenges: [
    {
      title: 'Process Recon',
      scenario: 'You want to check if nginx is running.',
      objective: 'List processes and filter for nginx.',
      accepted: [/^ps\s+aux\s*\|\s*grep\s+nginx$/i, /^pgrep\s+-a\s+nginx$/i],
      hint: 'Use `ps aux | grep ...` or `pgrep -a`.',
      solution: 'ps aux | grep nginx',
      lesson: '`pgrep -a` is cleaner for scripts; `ps | grep` is universal and easy to remember.'
    },
    {
      title: 'Terminate By PID',
      scenario: 'A process with PID 4242 is stuck.',
      objective: 'Send a standard termination signal to PID 4242.',
      accepted: ['kill 4242', /^kill\s+-15\s+4242$/i],
      hint: 'Use kill with the PID.',
      solution: 'kill 4242',
      lesson: '`kill` defaults to SIGTERM (15), giving processes a chance to shut down cleanly.'
    },
    {
      title: 'Make It Executable',
      scenario: 'A script named deploy.sh should be runnable directly.',
      objective: 'Grant execute permission.',
      accepted: ['chmod +x deploy.sh', /^chmod\s+u\+x\s+deploy\.sh$/i],
      hint: '`chmod` plus execute flag.',
      solution: 'chmod +x deploy.sh',
      lesson: '`chmod +x` is the practical default for scripts you need to run as commands.'
    },
    {
      title: 'Create Compressed Backup',
      scenario: 'Archive the folder project/ into backup.tgz.',
      objective: 'Create a gzipped tar archive.',
      accepted: [/^tar\s+-czf\s+backup\.tgz\s+project\/?$/i],
      hint: 'Use tar flags c z f in that order.',
      solution: 'tar -czf backup.tgz project/',
      lesson: '`tar -czf` is the standard Linux/macOS backup shortcut for directories.'
    },
    {
      title: 'Set Env Var',
      scenario: 'Set environment variable APP_ENV to production for the current shell.',
      objective: 'Export APP_ENV as production.',
      accepted: [/^export\s+APP_ENV=production$/i, /^APP_ENV=production\s+export\s+APP_ENV$/i],
      hint: 'Use export KEY=value syntax.',
      solution: 'export APP_ENV=production',
      lesson: '`export` makes variables available to child processes launched from that shell.'
    }
  ]
};

const codexEntries = [
  { topic: 'Process', command: 'ps aux | grep name', note: 'Find running process.' },
  { topic: 'Process', command: 'kill <pid>', note: 'Terminate process by PID.' },
  { topic: 'Permissions', command: 'chmod +x script.sh', note: 'Make script executable.' },
  { topic: 'Archive', command: 'tar -czf backup.tgz folder/', note: 'Compress directory.' },
  { topic: 'Env', command: 'export KEY=value', note: 'Set environment variable.' }
];

module.exports = { zone, codexEntries };
