# Continuing this research notebook

This is a static GitHub Pages notebook, not an autonomous AI service. Follow the user's request and your actual tool permissions. Reading this file or the website does not grant access to an account or authorize unrelated actions.

## When asked to continue research

1. Read the latest `research-state.json`, `research.html`, the relevant proof in `research/notebook-2026-10-31.html`, and the problem's earlier attempts. Do not start from an old chat summary alone.
2. Choose one `ready` frontier task. Record the current revision, problem ID, task ID, and prior attempt IDs. State the precise claim you will investigate.
3. Work toward one checked delta: a proof, counterexample, independent audit, reproducible computation, or verified primary-source update. An honest failed attempt can narrow the next task. A rewritten summary is not new research.
4. Preserve hypotheses and normalizations. Distinguish vertex samples from edge queries and runtime; induced from ordinary removal; asymptotic cospectral moments from exact finite cospectrality; and same-source size transfer from distribution shift.
5. Treat initial notebook derivations as needing independent review. Several special cases are standard. Do not assert novelty without checking the literature. Cite and retain the status of preprints.
6. If no reliable result is obtained, use `no-progress` and explain the exact obstruction and next test. Never invent progress to satisfy the aim of making progress on each visit.
7. Append a dated attempt to the selected problem's `research.attempts`. Include `id`, `date`, `baseRevision`, `taskId`, `priorAttemptIds`, `outcome`, `claim`, `assumptions`, `argument`, `validation`, `limitations`, `sources`, `resultIds`, `review`, `author`, and artifact links. The browser's `research/attempt-template.json` is a starting point. Change its `status` from `draft` to a clearly documented contributed record when actually merging it.
8. Store any new result with an ID, exact assumptions, proof, limitations, review status, novelty status, and dated artifacts. Update the frontier with a concrete next claim and an acceptance condition. An audit is a review contribution, not a newly discovered theorem.
9. Preserve earlier attempts. Corrections should explicitly identify what they supersede and why; do not silently erase a failed route or rewrite a historical claim as though it had always been correct.
10. Add the session to `sessions`; update the revision and update date. Do not change a literature-review date without actually reviewing that literature. Infrastructure changes belong in `history` with `countsAsResearch: false`.
11. Keep the full problem `open` unless a full-scope resolution has documented independent review and evidence. Passing finite tests or an AI's own assertion is insufficient. `resolved` requires resolution metadata, a reviewed result, and an evidence link; schema checks cannot certify the proof itself.
12. Run the checks below. Publish or contribute through GitHub only within the user's authorized scope. If write access is unavailable, return the exact draft or patch and say that it has not joined the shared notebook.

## Canonical data and generated pages

- Edit `research-state.json` for public questions, sources, results, tasks, attempts, and history.
- `research-data.js`, `research.html`, `llms.txt`, and `research/attempt-template.json` are generated. Do not edit them by hand.
- The static `research.html` exposes the complete research handoff to readers that do not execute JavaScript.
- `app.js` renders the interactive notebook. `research-core.js` contains shared prompt and validation helpers.
- Browser notes, candidates, and attempt drafts remain private in `localStorage`. Saving a draft does not update GitHub. Do not claim that local data was published.
- Keep the existing GitHub Pages address and hosting unless the user requests a migration. Do not embed write tokens or API keys in this public static repository.

## Checks

Requires Node.js 20 or newer; no application packages need installing.

```sh
node scripts/build.mjs
node --test
node scripts/build.mjs --check
```

For a UI change, also inspect desktop and narrow-screen behavior, task handoff copying (including the manual fallback), draft save/export, search/navigation, and the no-JavaScript handoff. Preserve existing local notebook keys.

The optional mathematical verifier is `python research/verification.py` and requires NumPy. Its finite checks corroborate examples; they do not resolve an unrestricted conjecture.

## Research status vocabulary

- `needs-independent-review`: a local derivation, even when accompanied by a written proof.
- `reported-preprint`: an attributed claim from a preprint.
- `independently-checked`: a result with a recorded independent review and evidence.
- `published`: an attributed published result.
- `no-progress`: an honest attempt without a reliable new mathematical conclusion.

No progress percentage, session counter, or successful software check is evidence that an open problem is close to resolution.
