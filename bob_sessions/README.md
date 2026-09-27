# IBM Bob Session Records

Screenshots from the IBM Bob 2.0 sessions used to build DevFlow AI. One
directory per team member, named for that member's role in the
[team table](../README.md#team). Files are numbered in capture order.

These are the evidence behind the "IBM Bob Usage During Development" section
of the main README — plan mode producing the architecture, agent mode
executing the sub-tasks, and parallel subagents reviewing the frontend,
backend and documentation.

## Team

| Member | Role | Focus | Shots |
|---|---|---|---|
| [Tauseef](tauseef-khan-lead/) | Team Lead | Architecture, analysis engine, IBM Bob workflow, integration, final review | 5 |
| [Hifza Irfan](hifza-irfan-frontend/) | Frontend / UI | React SPA, pages, components, styling | 4 |
| [Hamza Masood](hamza-masood-sample-qa-docs/) | Sample Project / QA / Docs | Analysis target, validation, documentation | 3 |

## Tauseef — team lead

| Shot | File | Resolution |
|---|---|---|
| 01 | [`tauseef-01.jpg`](tauseef-khan-lead/tauseef-01.jpg) | 1600×850 |
| 02 | [`tauseef-02.jpg`](tauseef-khan-lead/tauseef-02.jpg) | 1600×900 |
| 03 | [`tauseef-03.jpg`](tauseef-khan-lead/tauseef-03.jpg) | 1600×900 |
| 04 | [`tauseef-04.jpg`](tauseef-khan-lead/tauseef-04.jpg) | 1600×900 |
| 05 | [`tauseef-05.jpg`](tauseef-khan-lead/tauseef-05.jpg) | 1600×900 |

## Hifza Irfan — frontend / UI

| Shot | File | Resolution |
|---|---|---|
| 01 | [`hifza-01.jpg`](hifza-irfan-frontend/hifza-01.jpg) | 1600×900 |
| 02 | [`hifza-02.jpg`](hifza-irfan-frontend/hifza-02.jpg) | 468×1020 |
| 03 | [`hifza-03.jpg`](hifza-irfan-frontend/hifza-03.jpg) | 457×873 |
| 04 | [`hifza-04.jpg`](hifza-irfan-frontend/hifza-04.jpg) | 1600×900 |

## Hamza Masood — sample project / QA / docs

| Shot | File | Resolution |
|---|---|---|
| 01 | [`hamza-01.jpg`](hamza-masood-sample-qa-docs/hamza-01.jpg) | 1600×900 |
| 02 | [`hamza-02.jpg`](hamza-masood-sample-qa-docs/hamza-02.jpg) | 1600×900 |
| 03 | [`hamza-03.jpg`](hamza-masood-sample-qa-docs/hamza-03.jpg) | 1600×900 |

## Original filenames

Renamed for readability on commit. The camera filenames they came from, in the
same order, are:

| Shot | Original |
|---|---|
| hifza-01 | `IMG-20260927-WA0014.jpg` |
| hifza-02 | `IMG-20260927-WA0015.jpg` |
| hifza-03 | `IMG-20260927-WA0016.jpg` |
| hifza-04 | `IMG-20260927-WA0017.jpg` |
| tauseef-01 | `IMG-20260927-WA0018.jpg` |
| tauseef-02 | `IMG-20260927-WA0019.jpg` |
| tauseef-03 | `IMG-20260927-WA0020.jpg` |
| tauseef-04 | `IMG-20260927-WA0021.jpg` |
| tauseef-05 | `IMG-20260927-WA0022.jpg` |
| hamza-01 | `IMG-20260927-WA0023.jpg` |
| hamza-02 | `IMG-20260927-WA0024.jpg` |
| hamza-03 | `IMG-20260927-WA0025.jpg` |

## Adding captions

The tables above record what can be verified without opening the files:
identity, capture order and pixel dimensions. They deliberately carry **no
description of what each screenshot shows**, because the screenshots were
filed by their authors and not reviewed when the index was written.

Whoever took a session should add a one-line caption to its row, e.g.

```markdown
| 01 | [`tauseef-01.jpg`](tauseef-khan-lead/tauseef-01.jpg) | 1600×850 | Plan mode: architecture for all 5 modules |
```

Captions are worth adding for two specific reasons. `docs/devflow-plan.md`
records that Sub-Task 1 planned the architecture and that Sub-Tasks 8 and 9 ran
parallel subagent reviews; a caption tying a shot to a sub-task number turns
the folder from a pile of images into something a judge can check against the
plan. And the frontend and backend review subagents are the clearest
demonstration of parallel agent usage, which is a judging criterion, so those
shots benefit most from being labelled.

## Note on `hifza-02` and `hifza-03`

Both are portrait phone captures while the other ten are 1600×900 landscape
desktop shots. Both are valid images and both are kept. They are called out here
so the inconsistency is a known quantity rather than something a reviewer spots
first. Re-capturing them at the same resolution as the rest would make the
folder uniform.
