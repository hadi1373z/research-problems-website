# Research Problems Website

A topic-first research notebook for exploring open questions in graph theory, theoretical computer science, and graph learning. Start with a topic introduction, follow precise problem statements and literature sources, then track your reading and research ideas.

**[Visit the live website →](https://hadi1373z.github.io/research-problems-website/)**

Built with HTML, CSS, and vanilla JavaScript. No application dependencies, build step, or account required.

## What you can do

- Browse topics using the sidebar and expand or collapse their introductions and problem lists.
- Search topic descriptions, problem statements, assumptions, known results, bounds, source labels, background explanations, and your saved notes. Search filters whole topics.
- Read curated problem cards with explicit models and assumptions, known results, quantitative bounds where available, literature links, and dated status evidence.
- Track each problem through **Shortlisted**, **Reading**, **Working**, or **Paused**, with notes that save automatically in your browser.
- Read the cospectral graphon question's **Background results**: seven explanations with formulas, primary sources, and a discussion of the remaining gap.
- Add a personal **candidate question** to an existing topic for a later literature check.
- Use the responsive layout on desktop or mobile, with colors that follow your system's light or dark theme.

## Current topics

The collection contains five topics, seven problems marked **Verified open**, and one sourced **Candidate** research direction. The latest literature review was **7 October 2026**; each card separates its review date from the date of the evidence it cites.

| Topic | Included problem / status |
| --- | --- |
| Graph property testing and estimation | Testing versus estimation; sharp k-colorability sample complexity, with September 2026 bounds |
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
- There is currently no account system, synchronization, or import/export feature. Candidate editing, deletion, and promotion to verified status are not available in the interface.

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
| [`app.js`](app.js) | Public topic and problem data, rendering, search, and local notebook storage |
| [`styles.css`](styles.css) | Layout, responsive styles, and light/dark colors |
| [`LICENSE`](LICENSE) | MIT license |

## Verification and contributions

**Verified open** is a manually curated label: an entry needs an explicit literature source and a check of its open status against relevant recent work. Each card's **Status evidence** identifies the source supporting that assessment; **Reviewed on** records when the literature search was performed. The accompanying note explains the scope and limits of that review. Status is not checked automatically; revisit the sources before starting a research project.

The mathematics distinguishes sampled vertices from edge queries and running time, induced removal from ordinary removal, and same-source graph-size transfer from distribution shift. The graph-learning extension remains a candidate because its present open status is less firmly established than the published conjectures.

Contributions can add precise questions, improve topic introductions, update bounds and sources, or improve the website itself. [Open an issue](https://github.com/hadi1373z/research-problems-website/issues) to suggest a change, or submit a pull request.

Public topics and problem cards are defined in the `topics` array at the top of [`app.js`](app.js). For a new or revised problem:

1. Use a unique, stable `id` and place the entry in the appropriate topic's `problems` array.
2. Include a descriptive `title`, a precise `statement`, a short `lead`, and an `importance` explanation. Define the `model` and its assumptions, separate proved results in `known`, and add `formula` for useful bounds or targets.
   For explanatory background, add an optional `backgroundResults` array with `title`, `explanation`, optional `formula`, `relevance`, `citation`, and primary-source `url` fields. Use `backgroundConclusion` to explain the remaining gap.
3. Provide `links` as `[label, URL]` pairs, such as `[["Paper title", "https://arxiv.org/abs/2305.05487"]]`, a `source` identifying the problem or result, the evidence in `checked`, an ISO review date in `reviewed`, and a `statusNote` describing the review's limits.
4. Keep `verified: false` for a candidate. Set `verified: true` only after the literature and status checks are complete.
5. Preview the site locally and check topic navigation, search, and the changed card before opening a pull request.

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
