# Terminal Trials

Terminal Trials is a gamified CLI training app focused on practical shell and tmux skill growth.

## What you get
- Campaign map with progressive learning zones
- Guided training (instruction + practice) before certification quizzes
- Live sandbox training in command-heavy zones (Trailhead, Pipeline, Scripting, Dotfiles)
- Mocked sandbox training for system/remote workflows (Workflow, tmux, SSH)
- Themed ASCII mascot + zone flavor art across screens for visual feedback
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
- If your terminal has raw-input issues, force typed menus with: `TT_NO_RAW_MENU=1 npm run summon`
- During missions:
  - Type a command to answer
  - Type `hint` for help
  - Type `skip` to reveal solution and continue
  - In Linecraft shortcut missions, press the actual keys (fallback to typed answer in non-interactive terminals)

## Recommended workflow
1. Run each zone's Guided Training first.
2. Start that zone's certification quiz for XP/unlocks.
3. Use Flash Drills after each zone.
4. Keep Codex open while practicing in your real terminal.

## Sandbox Training
- In supported zones, practice runs inside a temporary filesystem sandbox and executes your real commands.
- In mock-supported zones, commands run against a safe simulated environment (processes/sessions/remote host state).
- The app shows the sandbox path during training.
- The sandbox is cleaned up automatically when training ends.
