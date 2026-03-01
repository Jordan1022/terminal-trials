const zone = {
  id: 'dotfiles',
  name: 'Home Base: Environment & Dotfiles',
  tagline: 'Make your terminal yours.',
  description:
    'Configure your shell with aliases, PATH extensions, environment variables, and dotfile management.',
  challenges: [
    {
      title: 'Create an Alias',
      scenario: 'You type `ls -la` dozens of times a day. Create a shortcut.',
      objective: 'Create an alias called ll that runs ls -la.',
      accepted: [
        /^alias\s+ll='ls\s+-la'$/i,
        /^alias\s+ll="ls\s+-la"$/i
      ],
      hint: 'alias name=\'command\' is the syntax.',
      solution: 'alias ll=\'ls -la\'',
      lesson: 'Aliases turn long or frequent commands into short names. Add them to your shell rc file to make them permanent.'
    },
    {
      title: 'Check Your PATH',
      scenario: 'A command is not found. You want to see which directories your shell searches.',
      objective: 'Print the current PATH variable.',
      accepted: ['echo $PATH', /^echo\s+"\$PATH"$/i, /^printenv\s+PATH$/i],
      hint: 'echo plus a dollar sign variable.',
      solution: 'echo $PATH',
      lesson: 'PATH is a colon-separated list of directories the shell searches for executables, checked left to right.'
    },
    {
      title: 'Extend Your PATH',
      scenario: 'You have custom scripts in ~/bin that you want to run from anywhere.',
      objective: 'Add ~/bin to the front of your PATH.',
      accepted: [
        /^export\s+PATH="\$HOME\/bin:\$PATH"$/i,
        /^export\s+PATH="~\/bin:\$PATH"$/i,
        /^export\s+PATH=\$HOME\/bin:\$PATH$/i
      ],
      hint: 'Prepend the directory and re-export PATH with the old value appended.',
      solution: 'export PATH="$HOME/bin:$PATH"',
      lesson: 'Prepending to PATH gives your custom scripts priority over system defaults. Always include $PATH to keep existing entries.'
    },
    {
      title: 'Reload Config',
      scenario: 'You just edited your .bashrc and want changes to take effect without opening a new terminal.',
      objective: 'Source your .bashrc to apply changes in the current shell.',
      accepted: [
        'source ~/.bashrc',
        '. ~/.bashrc',
        'source ~/.zshrc',
        '. ~/.zshrc'
      ],
      hint: 'A command that reads and executes a file in the current shell context.',
      solution: 'source ~/.bashrc',
      lesson: '`source` (or `.`) runs a script in the current shell, so variable and function changes take effect immediately.'
    },
    {
      title: 'Read the Dotfile',
      inputMode: 'explain',
      scenario: 'A colleague asks you about shell startup files:',
      objective: 'Explain the difference between .bashrc and .bash_profile.',
      accepted: [
        (answer) => {
          const a = answer.toLowerCase();
          const hasLogin = /login/i.test(a);
          const hasInteractive = /interactive|non-login|non login|every\s*(time|new)|each\s*(time|new|terminal|shell)/i.test(a);
          return hasLogin && hasInteractive;
        }
      ],
      hint: 'One runs for login shells, the other for interactive non-login shells.',
      solution: '.bash_profile runs for login shells (SSH, first terminal). .bashrc runs for each new interactive non-login shell.',
      lesson: 'Most people source .bashrc from .bash_profile to keep one config. Zsh uses .zshrc for both cases.'
    },
    {
      title: 'Set Default Editor',
      scenario: 'Git and other tools ask for an editor. Set vim as your system-wide default.',
      objective: 'Export the EDITOR environment variable as vim.',
      accepted: [
        /^export\s+EDITOR=vim$/i,
        /^export\s+EDITOR="vim"$/i,
        /^export\s+EDITOR='vim'$/i
      ],
      hint: 'export VARIABLE=value for the editor.',
      solution: 'export EDITOR=vim',
      lesson: 'Many CLI tools read the EDITOR variable. Setting it once ensures consistent behavior across git, crontab, and more.'
    }
  ]
};

const codexEntries = [
  { topic: 'Dotfiles', command: 'alias name=\'cmd\'', note: 'Create a command shortcut.' },
  { topic: 'Dotfiles', command: 'echo $PATH', note: 'Show executable search path.' },
  { topic: 'Dotfiles', command: 'export PATH="dir:$PATH"', note: 'Prepend directory to PATH.' },
  { topic: 'Dotfiles', command: 'source ~/.bashrc', note: 'Reload shell config.' },
  { topic: 'Dotfiles', command: '.bashrc vs .bash_profile', note: 'Interactive vs login shell config.' },
  { topic: 'Dotfiles', command: 'export EDITOR=vim', note: 'Set default text editor.' }
];

module.exports = { zone, codexEntries };
