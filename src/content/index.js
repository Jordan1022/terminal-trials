const { zone: trailhead, codexEntries: trailheadCodex } = require('./zones/trailhead');
const { zone: linecraft, codexEntries: linecraftCodex } = require('./zones/linecraft');
const { zone: pipeline, codexEntries: pipelineCodex } = require('./zones/pipeline');
const { zone: workflow, codexEntries: workflowCodex } = require('./zones/workflow');
const { zone: tmux, codexEntries: tmuxCodex } = require('./zones/tmux');
const { zone: scripting, codexEntries: scriptingCodex } = require('./zones/scripting');
const { zone: jobcontrol, codexEntries: jobcontrolCodex } = require('./zones/jobcontrol');
const { zone: ssh, codexEntries: sshCodex } = require('./zones/ssh');
const { zone: vim, codexEntries: vimCodex } = require('./zones/vim');
const { zone: dotfiles, codexEntries: dotfilesCodex } = require('./zones/dotfiles');
const { rankTiers } = require('./ranks');

const modules = [
  trailhead,
  linecraft,
  pipeline,
  workflow,
  tmux,
  scripting,
  jobcontrol,
  ssh,
  vim,
  dotfiles
];

const codex = [
  ...trailheadCodex,
  ...linecraftCodex,
  ...pipelineCodex,
  ...workflowCodex,
  ...tmuxCodex,
  ...scriptingCodex,
  ...jobcontrolCodex,
  ...sshCodex,
  ...vimCodex,
  ...dotfilesCodex
];

module.exports = { modules, codex, rankTiers };
