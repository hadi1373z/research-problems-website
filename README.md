# Research Problems Website

A topic-first research notebook for exploring open questions in graph theory, theoretical computer science, and graph learning. Start with a topic introduction, follow precise problem statements and literature sources, then continue from a shared record of results, failed approaches, and concrete next tasks.

**[Visit the live website →](https://hadi1373z.github.io/research-problems-website/)**

Built with HTML, CSS, and vanilla JavaScript. No application dependencies or account required. Generated handoff files are committed, so visiting the site needs no build. After editing canonical research data, run the small Node.js generation and validation step.

## Continue research across AI sessions

The shared notebook preserves the 31 October 2026 research attempts and supports cumulative, reviewable progress. Start with the [readable AI handoff](research.html), [canonical research state](research-state.json), and [repository research protocol](AGENTS.md). Each public problem has scoped results, review labels, previous attempts, insufficient routes, and frontier tasks with acceptance criteria.

Use **Copy AI research handoff** or a problem's **Copy this task for AI** button to start a session. Ask it to work on one specific claim, check the evidence, append its result, and leave the next task. A proof, counterexample, independent audit, reproducible computation, or sourced update can be useful. If the attempt yields no reliable new result, record **no-progress** honestly. No unrestricted problem is claimed solved; novelty of notebook derivations is unassessed.

A page view does not run an AI job. This static website supplies instructions and durable context; it cannot guarantee a breakthrough. Shared progress becomes available to future sessions only after a repository contribution is merged. Browser drafts stay private until exported and contributed.

## What you can do

- Browse topics using the sidebar and expand or collapse their introductions and problem lists.
- Search topic descriptions, problem statements, assumptions, known results, bounds, source labels, background explanations, and your saved notes. Search filters whole topics.
- Read curated problem cards with explicit models and assumptions, known results, quantitative bounds where available, literature links, and dated status evidence.
- Track each problem through **Shortlisted**, **Reading**, **Working**, or **Paused**, with notes that save automatically in your browser.
- Read the cospectral graphon question's **Background results**: seven explanations with formulas, primary sources, and a discussion of the remaining gap.
- Add a personal **candidate question** to an existing topic for a later literature check.
- Use the responsive layout on desktop or mobile, with colors that follow your system's light or dark theme.

## Current topics

The collection contains five topics, seven problems marked **Verified open**, and one sourced **Candidate** research direction. The imported research snapshot was reviewed on **31 October 2026**; each card separates its review date from the date of the evidence it cites.

| Topic | Included problem / status |
| --- | --- |
| Graph property testing and estimation | Testing versus estimation; sharp k-colorability sample complexity, including a clearly labeled late-October 2026 preprint update |
| Graph isomorphism and canonization | Polynomial-time GI; fixed-parameter tractability in maximum degree |
| Graphons, sampling, and identifiability | Equal-density cospectral graphons and finite cospectral approximation |
| Regularity, removal, and quantitative bounds | Triangle-removal bounds; polynomial induced-C₄ removal |
| Learning on graphs | Quantitative transferability of higher-order graphon networks (**Candidate**) |

## Getting started

1. Open the [website](https://hadi1373z.github.io/research-problems-website/) and choose a topic, or keep **All topics** selected.
2. Read its introduction, examine a problem statement, and follow the linked papers or surveys.
3. Change **Your stage** and write in **Your notes** to keep track of your next step.
4. Use **+ Add candidate** to select a topic and enter a title and precise question. New questions remain marked **Candidate** until reviewed.

## Your notes and local data

Research stages, notes, and browser-added candidates are stored in `localStorage`. They are saved for that browser profile and website origin, without being sent to a server or committed to this repository.

- The hosted website and a local development copy have separate notebooks. Using a different browser, profile, device, or local server address also gives you separate data.
- Clearing site data removes those saved entries. Keep a separate copy of important notes.
- There is no account system or automatic synchronization. Research attempts can be saved as private drafts and exported as JSON; notes and browser-added candidates are not included in that export. Candidate editing, deletion, and promotion to verified status are not available in the interface.

Adding a candidate on the website updates your personal notebook. To add a problem to the public collection, contribute a repository change as described below.

## Run locally

Clone the repository and serve its root directory with any static web server. For example, with Git and Python 3 installed:

```sh
git clone https://github.com/hadi1373z/research-problems-website.git
cd research-problems-website
python -m http.server 8000 --bind 127.0.0.1
```

Open [http://127.0.0.1:8000](http://127.0.0.1:8000). On Windows, use `py -m http.server 8000 --bind 127.0.0.1` if Python is available through the `py` launcher.

You can also open `index.html` directly. A local HTTP server is recommended for consistent browser storage behavior. Use a current browser with JavaScript and local storage enabled.

## Project structure

| File | Purpose |
| --- | --- |
| [`index.html`](index.html) | Page structure, summary, search field, and candidate dialog |
| [`research-state.json`](research-state.json) | Canonical questions, results, tasks, attempts, and research protocol |
| [`research.html`](research.html) | Generated readable AI handoff; works without JavaScript |
| [`research-data.js`](research-data.js) | Generated browser copy of the canonical state |
| [`research-core.js`](research-core.js) | Shared prompts, validation, escaping, and storage helpers |
| [`app.js`](app.js) | Rendering, search, local notes, task copying, and private draft save/export |
| [`research/`](research/) | Dated proofs, PDF, finite verifier and results, sources, and attempt template |
| [`scripts/build.mjs`](scripts/build.mjs) | Validate canonical data and regenerate browser state and handoff |
| [`tests/`](tests/) | Continuation, state-integrity, stale-draft, and artifact checks |
| [`styles.css`](styles.css) | Layout, responsive styles, and light/dark colors |
| [`LICENSE`](LICENSE) | MIT license |

## Verification and contributions

**Verified open** is a manually curated label: an entry needs an explicit literature source and a check of its open status against relevant recent work. Each card's **Status evidence** identifies the source supporting that assessment; **Reviewed on** records when the literature search was performed. The accompanying note explains the scope and limits of that review. Status is not checked automatically; revisit the sources before starting a research project.

The mathematics distinguishes sampled vertices from edge queries and running time, induced removal from ordinary removal, and same-source graph-size transfer from distribution shift. The graph-learning extension remains a candidate because its present open status is less firmly established than the published conjectures.

Contributions can add precise questions, improve topic introductions, update bounds and sources, or improve the website itself. [Open an issue](https://github.com/hadi1373z/research-problems-website/issues) to suggest a change, or submit a pull request.

Public topics and problem cards are defined in the `topics` array in [`research-state.json`](research-state.json). Read [AGENTS.md](AGENTS.md) before contributing research. For a new or revised problem:

1. Use a unique, stable `id` and place the entry in the appropriate topic's `problems` array.
2. Include a descriptive `title`, a precise `statement`, a short `lead`, and an `importance` explanation. Define the `model` and its assumptions, separate proved results in `known`, and add `formula` for useful bounds or targets.
   For explanatory background, add an optional `backgroundResults` array with `title`, `explanation`, optional `formula`, `relevance`, `citation`, and primary-source `url` fields. Use `backgroundConclusion` to explain the remaining gap.
3. Provide `links` as `[label, URL]` pairs, such as `[["Paper title", "https://arxiv.org/abs/2305.05487"]]`, a `source` identifying the problem or result, the evidence in `checked`, an ISO review date in `reviewed`, and a `statusNote` describing the review's limits.
4. Keep `verified: false` for a candidate. Set `verified: true` only after the literature and status checks are complete.
5. Append the research attempt and its exact scope, review status, validation, limitations, and next task. Preserve prior attempts; document corrections rather than erasing history.
6. Run `node scripts/build.mjs`, `node --test`, and `node scripts/build.mjs --check` (Node.js 20+, no packages to install). Preview navigation, search, the changed card, and draft export before contributing.

Optional mathematical verification: `python research/verification.py` requires NumPy. These finite checks corroborate examples; they do not establish general conjectures. The notebook HTML and PDF retain their original date. Website infrastructure updates are recorded separately from mathematical research sessions.

## Deploy with GitHub Pages

This is a static website that can be served directly from the repository root. To publish your own copy:

1. Fork or copy the repository to your GitHub account.
2. Open the repository's **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select **main** and **/ (root)**, then save.
5. Once deployment completes, use the website URL shown in Pages settings. Update the live website links in your copy of this README.

See GitHub's [publishing-source guide](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) for the full setup instructions.

## License

Released under the [MIT License](LICENSE).
