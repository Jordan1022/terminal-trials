const zone = {
  id: 'ssh',
  name: 'Outpost: SSH & Remote Ops',
  tagline: 'Reach any machine from your terminal.',
  description:
    'Learn secure connections, key generation, file transfers, directory syncing, and SSH tunnels.',
  challenges: [
    {
      title: 'Connect to a Host',
      scenario: 'You need to log into a remote server as user deploy on host 10.0.1.50.',
      objective: 'Open an SSH session to the remote host.',
      accepted: [
        /^ssh\s+deploy@10\.0\.1\.50$/i,
        /^ssh\s+-l\s+deploy\s+10\.0\.1\.50$/i
      ],
      hint: 'ssh user@host is the standard form.',
      solution: 'ssh deploy@10.0.1.50',
      lesson: 'SSH creates an encrypted tunnel to the remote host. The user@host format is the most common connection syntax.'
    },
    {
      title: 'Generate a Key Pair',
      scenario: 'You need to set up passwordless authentication with a modern key type.',
      objective: 'Generate an Ed25519 SSH key pair.',
      accepted: [
        /^ssh-keygen\s+-t\s+ed25519$/i,
        /^ssh-keygen\s+-t\s+ed25519\s+-C\s+/i
      ],
      hint: 'Use ssh-keygen with the -t flag for key type.',
      solution: 'ssh-keygen -t ed25519',
      lesson: 'Ed25519 keys are shorter, faster, and more secure than RSA. They are the modern default for SSH.'
    },
    {
      title: 'Copy a File Over',
      scenario: 'Send report.pdf to the /tmp/ directory on server 10.0.1.50 as user deploy.',
      objective: 'Use scp to copy a local file to a remote host.',
      accepted: [
        /^scp\s+report\.pdf\s+deploy@10\.0\.1\.50:\/tmp\/?$/i
      ],
      hint: 'scp works like cp but with user@host:path syntax for the destination.',
      solution: 'scp report.pdf deploy@10.0.1.50:/tmp/',
      lesson: '`scp` uses the SSH protocol for secure file transfer. It works for single files or directories with -r.'
    },
    {
      title: 'Sync Directories',
      scenario: 'Keep the local ./build/ folder in sync with /var/www/ on the remote server.',
      objective: 'Use rsync over SSH to sync directories.',
      accepted: [
        /^rsync\s+-avz\s+\.\/build\/?\s+deploy@10\.0\.1\.50:\/var\/www\/?$/i,
        /^rsync\s+-avz\s+build\/?\s+deploy@10\.0\.1\.50:\/var\/www\/?$/i
      ],
      hint: 'rsync -avz for archive, verbose, compressed transfer.',
      solution: 'rsync -avz ./build/ deploy@10.0.1.50:/var/www/',
      lesson: '`rsync` only transfers changed files, making it far faster than scp for repeated syncs. The trailing / on source matters.'
    },
    {
      title: 'Read the Config',
      inputMode: 'explain',
      scenario: 'Your ~/.ssh/config contains this block:',
      objective: 'Explain:\nHost prod\n  HostName 10.0.1.50\n  User deploy\n  IdentityFile ~/.ssh/deploy_key',
      accepted: [
        (answer) => {
          const a = answer.toLowerCase();
          const hasShortcut = /shortcut|alias|nickname|short|instead of|replace|refer/i.test(a);
          const hasConnect = /connect|ssh|log\s*in|host/i.test(a);
          return hasShortcut && hasConnect;
        }
      ],
      hint: 'What can you type instead of the full ssh command after this config exists?',
      solution: 'Defines a shortcut so `ssh prod` connects as deploy@10.0.1.50 using a specific key.',
      lesson: 'SSH config lets you define aliases for hosts, avoiding long command lines and managing keys per server.'
    },
    {
      title: 'Open a Tunnel',
      scenario: 'A database on the remote server only listens on localhost:5432. Forward it to your local port 5432.',
      objective: 'Create a local SSH port forward.',
      accepted: [
        /^ssh\s+-L\s+5432:localhost:5432\s+deploy@10\.0\.1\.50$/i,
        /^ssh\s+-L\s+5432:127\.0\.0\.1:5432\s+deploy@10\.0\.1\.50$/i
      ],
      hint: 'Use -L local:remote_host:remote_port to create the tunnel.',
      solution: 'ssh -L 5432:localhost:5432 deploy@10.0.1.50',
      lesson: 'SSH tunnels let you securely access remote services that are not exposed to the internet.'
    }
  ]
};

const codexEntries = [
  { topic: 'SSH', command: 'ssh user@host', note: 'Connect to remote host.' },
  { topic: 'SSH', command: 'ssh-keygen -t ed25519', note: 'Generate modern SSH key pair.' },
  { topic: 'SSH', command: 'scp file user@host:path', note: 'Copy file to remote host.' },
  { topic: 'SSH', command: 'rsync -avz src/ user@host:dst/', note: 'Sync directories over SSH.' },
  { topic: 'SSH', command: '~/.ssh/config', note: 'Define host aliases and key settings.' },
  { topic: 'SSH', command: 'ssh -L local:host:remote', note: 'Create local port forward tunnel.' }
];

module.exports = { zone, codexEntries };
