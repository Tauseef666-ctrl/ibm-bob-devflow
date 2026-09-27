# bob_sessions/ — IBM Bob 2.0 Hackathon Session Evidence

## Purpose

This directory holds the IBM Bob 2.0 task-session consumption summary screenshots
that serve as evidence of genuine IBM Bob usage during the development of DevFlow AI.

## What counts as valid evidence

A valid screenshot must come from:

```
IBM Bob → Tasks → [selected task] → task header → session consumption summary
```

It must show the actual Bob session summary for a task that was completed during
development. It must not be fabricated, edited, or recreated.

## Directory layout

```
bob_sessions/
├── team-lead/         Screenshots from Tauseef (Team Lead) Bob sessions
├── teammate-2/        Screenshots from Hifza Irfan (Frontend/UI) Bob sessions
└── teammate-3/        Screenshots from Hamza Masood (Sample Project/QA/Docs) Bob sessions
```

## Filename convention

Each file follows the pattern:

```
NN-role-description.png
```

Examples:
- `01-team-lead-planning.png`
- `02-team-lead-architecture.png`
- `01-teammate-2-frontend-foundation.png`
- `01-teammate-3-sample-project-qa.png`

## Evidence inventory

See [`evidence-inventory.md`](evidence-inventory.md) for the full list of relevant
tasks per team member, with descriptions and required filenames.

## Instructions for capturing screenshots

1. Open IBM Bob IDE
2. Go to **Tasks**
3. Select the relevant completed task
4. Open the **task header**
5. Open **session consumption summary**
6. Capture screenshot using OS screenshot tool
7. Save as PNG with the filename shown in `evidence-inventory.md`
8. Place in the correct subdirectory (`team-lead/`, `teammate-2/`, or `teammate-3/`)

## Do not

- Fabricate or edit screenshots
- Take screenshots of chat conversations
- Combine multiple sessions into one image
- Alter token/time/task information in any way
