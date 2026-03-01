# Terminal Trials

Terminal Trials is a gamified CLI training app focused on practical shell and tmux skill growth.

## What you get
- Campaign map with progressive learning zones
- Command challenges with hints and solution explanations
- Flash drills for speed reps
- Rank + XP progression
- Saved progress in local JSON

## Skill zones
- Trailhead: navigation and filesystem basics
- Linecraft Dojo: readline cursor movement, line cutting, and multi-line editor flow
- Pipeline Forge: grep/rg, pipes, sorting, counting, redirection
- Ops Deck: process control, chmod, tar, env vars
- Citadel: tmux sessions, panes, copy-mode multi-line selection, and workflow control

## Run it
```bash
cd /Users/jordanallen/Documents/Goodly/terminal-trials
npm run summon
```

`npm start` still works as an alias.

## Save file
`save/progress.json`

## Controls
- Use numeric menu options
- Arrow-key navigation works in interactive terminals (`Up/Down + Enter`) for launch and menu screens
- During missions:
  - Type a command to answer
  - Type `hint` for help
  - Type `skip` to reveal solution and continue
  - In Linecraft shortcut missions, press the actual keys (fallback to typed answer in non-interactive terminals)

## Recommended workflow
1. Clear each campaign zone in order.
2. Use Flash Drills after each zone.
3. Keep Codex open while practicing in your real terminal.
4. Replay zones to reinforce speed and command recall.
