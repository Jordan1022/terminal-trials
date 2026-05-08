const { zone: trailhead, codexEntries: trailheadCodex } = require('./zones/trailhead');
const { zone: fieldcraft, codexEntries: fieldcraftCodex } = require('./zones/fieldcraft');
const { zone: linecraft, codexEntries: linecraftCodex } = require('./zones/linecraft');
const { zone: pipeline, codexEntries: pipelineCodex } = require('./zones/pipeline');
const { zone: workflow, codexEntries: workflowCodex } = require('./zones/workflow');
const { zone: scripting, codexEntries: scriptingCodex } = require('./zones/scripting');
const { zone: jobcontrol, codexEntries: jobcontrolCodex } = require('./zones/jobcontrol');
const { zone: vim, codexEntries: vimCodex } = require('./zones/vim');
const { zone: tmux, codexEntries: tmuxCodex } = require('./zones/tmux');
const { zone: ssh, codexEntries: sshCodex } = require('./zones/ssh');
const { zone: dotfiles, codexEntries: dotfilesCodex } = require('./zones/dotfiles');
const { zone: powertools, codexEntries: powertoolsCodex } = require('./zones/powertools');
const { zone: bash_advanced, codexEntries: bashAdvancedCodex } = require('./zones/bash_advanced');
const { rankTiers } = require('./ranks');

const modules = [
  trailhead,
  fieldcraft,
  linecraft,
  pipeline,
  workflow,
  scripting,
  jobcontrol,
  vim,
  tmux,
  ssh,
  dotfiles,
  powertools,
  bash_advanced
];

const codex = [
  ...trailheadCodex,
  ...fieldcraftCodex,
  ...linecraftCodex,
  ...pipelineCodex,
  ...workflowCodex,
  ...scriptingCodex,
  ...jobcontrolCodex,
  ...vimCodex,
  ...tmuxCodex,
  ...sshCodex,
  ...dotfilesCodex,
  ...powertoolsCodex,
  ...bashAdvancedCodex
];

module.exports = { modules, codex, rankTiers };
