# Terminal Trials

Welcome to your command-line training RPG.

Terminal Trials turns shell learning into a campaign: train hands-on, pass certifications, unlock new zones, and rank up from newbie to terminal wizard.

## Why this is fun
- You are the operator. The terminal is your world map.
- Each zone has themed visuals, an ASCII companion, and focused skills.
- You train first (guided, low pressure), then certify (XP + unlocks).
- Some zones run real command sandboxes. Others run safe mocked systems.

## Launch the game
```bash
cd /Users/jordanallen/Documents/Goodly/terminal-trials
npm run summon
```

Also supported:
- `npm start` (alias)
- `npm run gauntlet` (alias)

## Gameplay loop
1. Enter a zone.
2. Run Guided Training (learn by doing).
3. Start Certification Quiz when ready.
4. Earn XP, clear zone, unlock next zone.
5. Use Flash Drills to build speed.

## Your first 5 minutes
1. Launch with `npm run summon`.
2. Choose `Start from the beginning` on first run.
3. Enter `Trailhead`.
4. Complete Guided Training.
5. Start certification right away.

## Campaign zones
- Trailhead: Navigation
- Linecraft Dojo: Cursor and line editing shortcuts
- Pipeline Forge: Text search, pipes, filtering, counts
- Ops Deck: Process, permissions, archives, env vars
- Citadel: tmux sessions, panes, copy mode
- Script Forge: Bash scripting fundamentals
- Command Tower: Job control and background process flow
- Outpost: SSH and remote operations
- Vim Sanctum: Modal editing fundamentals
- Home Base: Dotfiles and shell environment setup

## Controls
- Menus: arrow keys (`Up/Down + Enter`) or number keys
- If raw terminal input is flaky:
```bash
TT_NO_RAW_MENU=1 npm run summon
```
- During training/challenges:
  - `hint` for help
  - `show` to view reference in guided practice
  - `skip` (or `next` in guided mode) to move on
- Linecraft drills are context-based: you edit a mock command line with real keypresses and the game validates the resulting cursor/text state.

## Sandbox modes
- Real filesystem sandbox zones:
  - Trailhead, Pipeline, Script Forge, Home Base
- Mocked systems sandbox zones:
  - Ops Deck (process simulation)
  - Citadel (tmux session simulation)
  - Outpost (SSH/remote simulation)

All sandboxes are temporary and auto-cleaned after training.

## Save data
- Save file: `save/progress.json`
- Tracks XP, rank, zone unlocks, training completion, and quiz progress.

## What you get
- Guided instruction before quizzes
- Practical command execution in sandboxed environments
- Visual terminal UI with themed ASCII art
- Progressive unlocks + rank progression
- Fast repeat mode via Flash Drills and Codex

## Pro tip
Keep a second terminal open and try commands there too. The fastest progress comes from doing each command both in-game and in your real shell.
