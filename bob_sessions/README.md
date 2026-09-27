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

| Shot | File | Resolution | Session |
|---|---|---|---|
| 01 | [`tauseef-01.jpg`](tauseef-khan-lead/tauseef-01.jpg) | 1600×850 | Planning & architecture (Plan mode, 9-sub-task plan) |
| 02 | [`tauseef-02.jpg`](tauseef-khan-lead/tauseef-02.jpg) | 1600×900 | Backend foundation + analysis engine (Sub-Tasks 1–4) |
| 03 | [`tauseef-03.jpg`](tauseef-khan-lead/tauseef-03.jpg) | 1600×900 | Five analysis modules + sample project (Sub-Tasks 2, 5) |
| 04 | [`tauseef-04.jpg`](tauseef-khan-lead/tauseef-04.jpg) | 1600×900 | Windows npm fix + engine refactor (Sub-Task 9 debugging) |
| 05 | [`tauseef-05.jpg`](tauseef-khan-lead/tauseef-05.jpg) | 1600×900 | Documentation, integration & final validation (Sub-Task 9) |

## Hifza Irfan — frontend / UI

| Shot | File | Resolution | Session |
|---|---|---|---|
| 01 | [`hifza-01.jpg`](hifza-irfan-frontend/hifza-01.jpg) | 1600×900 | Frontend foundation (Sub-Task 7) |
| 02 | [`hifza-02.jpg`](hifza-irfan-frontend/hifza-02.jpg) | 468×1020 | Frontend pages (Sub-Task 8) |
| 03 | [`hifza-03.jpg`](hifza-irfan-frontend/hifza-03.jpg) | 457×873 | Frontend pages, continued (Sub-Task 8) |
| 04 | [`hifza-04.jpg`](hifza-irfan-frontend/hifza-04.jpg) | 1600×900 | Frontend pages, final pass (Sub-Task 8) |

## Hamza Masood — sample project / QA / docs

| Shot | File | Resolution | Session |
|---|---|---|---|
| 01 | [`hamza-01.jpg`](hamza-masood-sample-qa-docs/hamza-01.jpg) | 1600×900 | Sample project QA & demo validation |
| 02 | [`hamza-02.jpg`](hamza-masood-sample-qa-docs/hamza-02.jpg) | 1600×900 | Sample project QA & demo validation, continued |
| 03 | [`hamza-03.jpg`](hamza-masood-sample-qa-docs/hamza-03.jpg) | 1600×900 | Sample project QA & demo validation, final pass |

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

## Session labels

The Session column names the work each shot covers, so a shot can be checked
against `docs/devflow-plan.md` and the commit history rather than trusted
blind. It is taken from
[`evidence-inventory.md`](evidence-inventory.md), which cross-references each
session to the sub-task log and the commits that resulted.

Where the inventory was more granular than a screenshot count, several shots
carry the same session. That is accurate rather than padding: the folder holds
12 screenshots across 10 distinct sessions, and the two extra shots are
continuation captures of Hifza's Sub-Task 8 session.

Captions are still worth adding per shot, e.g.

```markdown
| 01 | [`tauseef-01.jpg`](tauseef-khan-lead/tauseef-01.jpg) | 1600×850 | Planning & architecture (Plan mode, 9-sub-task plan) |
```

The two highest-value shots to caption precisely are the parallel frontend and
backend review subagents from Sub-Tasks 8 and 9, since parallel agent usage is
a judging criterion and a judge will look for it.

## Note on `hifza-02` and `hifza-03`

Both are portrait phone captures while the other ten are 1600×900 landscape
desktop shots. Both are valid images and both are kept. They are called out here
so the inconsistency is a known quantity rather than something a reviewer spots
first. Re-capturing them at the same resolution as the rest would make the
folder uniform.
