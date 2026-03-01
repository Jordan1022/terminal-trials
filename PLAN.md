# Terminal Trials Plan

## Project Name
Terminal Trials: The Shellmaster Gauntlet

## Mission
Build an interactive terminal game that teaches real command-line and tmux skills through progressive challenge zones.

## Learning Tracks
1. Trailhead: Navigation
- Location awareness (`pwd`)
- Listing files (`ls -la`)
- Directory movement (`cd`)
- Directory/file creation (`mkdir -p`, `touch`)

2. Pipeline Forge: Text Ops
- Search with `grep` / `rg`
- Counting and filtering
- Sorting, dedupe, and top-N summaries
- Redirection and append workflow

3. Ops Deck: Shell Workflow
- Process inspection and termination
- Permission changes (`chmod`)
- Archives (`tar -czf`)
- Environment variables (`export`)

4. Citadel: tmux Mastery
- Session lifecycle (`new`, `attach`, `detach`)
- Pane splitting and navigation
- Practical multi-pane habits

## Game Design
- Hub menu with campaign map, flash drills, codex, and metrics.
- Zone progression: each cleared zone unlocks the next one.
- Challenge engine: validate typed commands, offer hints, reveal solutions.
- XP and rank tiers to reward consistency.
- Save system to persist progress between sessions.

## Technical Approach
- Runtime: Node.js, no external dependencies.
- UI: ANSI color, framed boxes, ASCII banner, progress bars.
- Data model: module/challenge content separated from engine logic.
- Storage: local JSON save file under `save/progress.json`.

## Execution Steps
1. Scaffold standalone project and command scripts.
2. Implement reusable terminal UI helper functions.
3. Implement game engine, progression rules, validation, and persistence.
4. Write educational challenge content for each track.
5. Add docs and run smoke tests.
