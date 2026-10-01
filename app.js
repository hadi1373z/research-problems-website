const topics = [
  {
    id: "property-testing",
    status: "verified",
    title: "Graph Property Testing & Estimation",
    summary: "What can a tiny random sample reveal about a massive dense graph?",
    intro: [
      "Property testing replaces exact computation with a gap decision: accept graphs having a property and reject graphs that require changing at least an ε-fraction of all possible edges. In the dense-graph model, an algorithm may inspect only a constant-size random induced subgraph, independent of the total number of vertices.",
      "Graphon theory explains the qualitative power of this sampling model, while regularity and removal lemmas control its quantitative cost. The difficult frontier is whether testing and estimating the actual edit distance can be done with comparable sample complexity."
    ],
    problems: [{
      id: "testing-estimation",
      verified: true,
      title: "Does efficient testing imply efficient distance estimation?",
      lead: "Every testable dense-graph property is known to be estimable, but the general conversion may increase sample complexity enormously.",
      statement: "If a property P is testable by sampling q(ε) vertices, must its edit distance be estimable using q(poly(ε)) sampled vertices?",
      formula: "Desired: q(poly(ε))  ·  Best general bound: 2^{poly(1/ε) · 2^{q(ε/2)}}",
      source: "Problem 1.8",
      checked: "2025 survey",
      importance: "General decision-to-estimation principle",
      links: [
        ["2024 paper", "https://arxiv.org/abs/2305.05487"],
        ["2025 survey", "https://arxiv.org/abs/2508.16878"],
        ["Graph-limit background", "https://users.renyi.hu/~sos/2006_Graph_limits_and_parameter_testing.pdf"]
      ]
    }]
  },
  {
    id: "isomorphism",
    status: "verified",
    title: "Graph Isomorphism & Canonization",
    summary: "When do two differently labelled graphs encode exactly the same structure?",
    intro: [
      "Graph isomorphism asks whether one graph can be transformed into another merely by renaming its vertices. It belongs to NP, yet it has resisted both a polynomial-time algorithm and an NP-completeness proof. Practical programs solve many instances quickly, but the worst-case theory remains exceptional.",
      "Babai’s breakthrough reduced the general worst-case running time to quasipolynomial. The surrounding theory combines permutation groups, combinatorics, logic, canonical labelling, and Weisfeiler–Leman refinement. It also connects to graph learning because useful representations should respect isomorphism without collapsing genuinely different graphs."
    ],
    problems: [{
      id: "gi-in-p",
      verified: true,
      title: "Is general graph isomorphism solvable in polynomial time?",
      lead: "Babai gave a deterministic quasipolynomial-time algorithm, but no polynomial-time algorithm is known for unrestricted graphs.",
      statement: "Design a deterministic polynomial-time algorithm for graph isomorphism, or establish a rigorous complexity obstruction that explains why none exists.",
      formula: "Current frontier: exp((log n)^{O(1)})  ·  Goal: n^{O(1)}",
      source: "Classical central problem",
      checked: "2025–2026 literature",
      importance: "Prominent unresolved complexity classification",
      links: [
        ["Babai’s algorithm", "https://arxiv.org/abs/1512.03547"],
        ["Recent advances survey", "https://arxiv.org/abs/2011.01366"],
        ["2025 status source", "https://academic.oup.com/imaiai/article/14/2/iaaf011/8114479"]
      ]
    }]
  },
  {
    id: "graphons",
    status: "candidate",
    title: "Graphons, Sampling & Identifiability",
    summary: "How much of an infinite graph limit can finite random samples determine?",
    intro: [
      "A graphon is a symmetric measurable function that represents the limit of a convergent sequence of dense graphs and also defines a random-graph model. Observing a graph sampled from a graphon gives many dependent edge observations while the latent vertex positions remain hidden.",
      "The central statistical questions concern identifiability, the choice of metric, and how sample complexity depends on structural complexity. Constant and block graphons can be easy, while arbitrary graphons can require exponentially large samples for fine cut-distance accuracy."
    ],
    problems: []
  },
  {
    id: "regularity",
    status: "candidate",
    title: "Regularity, Removal & Quantitative Bounds",
    summary: "Can qualitative decomposition theorems become efficient enough to power real algorithms?",
    intro: [
      "Regularity lemmas approximate a large graph by a bounded collection of pseudorandom pieces. They drive results in graph limits, property testing, counting, and removal, but their worst-case partition sizes can grow as towers of exponentials.",
      "This creates a sharp divide between qualitative existence and useful quantitative bounds. Research asks which graph classes admit polynomial or singly exponential decompositions and whether weaker regularity retains enough information for testing and estimation."
    ],
    problems: []
  },
  {
    id: "graph-learning",
    status: "candidate",
    title: "Learning on Graphs",
    summary: "When can graph neural networks generalize across size, density, and topology?",
    intro: [
      "Graph neural networks process data whose relationships matter as much as individual features. Their expressive power is tied to graph isomorphism tests, while their stability and transfer across graphs can be studied through graph limits and graphon operators.",
      "The theoretical frontier is to identify assumptions under which a model trained on one finite graph transfers to larger samples of the same latent structure. This connects approximation theory, statistical learning, spectral methods, and the limitations of message passing."
    ],
    problems: []
  }
];

const custom = JSON.parse(localStorage.getItem("atlasCandidates") || "[]");
for (const problem of custom) {
  const topic = topics.find(item => item.id === problem.topic);
  if (topic) topic.problems.push(problem);
}

const topicRoot = document.getElementById("topics");
const nav = document.getElementById("topicNav");
const search = document.getElementById("search");
let selected = "all";

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
}

function storedState(id) {
  return JSON.parse(localStorage.getItem(`atlasState:${id}`) || "{}");
}

function makeNavigation() {
  nav.querySelectorAll(".topic-nav").forEach(item => item.remove());
  const entries = [{ id: "all", title: "All topics", description: "Complete atlas", status: "verified", count: topics.length }, ...topics.map(topic => ({ id: topic.id, title: topic.title, description: `${topic.problems.length} shortlisted`, status: topic.status, count: topic.problems.length }))];
  for (const entry of entries) {
    const button = document.createElement("button");
    button.className = `topic-nav${entry.id === selected ? " active" : ""}`;
    button.dataset.id = entry.id;
    button.dataset.status = entry.status;
    button.innerHTML = `<span class="orb"></span><span>${escapeHtml(entry.title)}<small>${escapeHtml(entry.description)}</small></span><span class="number">${entry.count}</span>`;
    button.addEventListener("click", () => { selected = entry.id; makeNavigation(); render(); });
    nav.append(button);
  }
}

function problemTemplate(problem) {
  const state = storedState(problem.id);
  const links = (problem.links || []).map(link => `<a href="${escapeHtml(link[1])}" target="_blank" rel="noreferrer">${escapeHtml(link[0])} ↗</a>`).join("") || "<span>Sources to be verified</span>";
  return `<article class="problem" data-problem="${escapeHtml(problem.id)}"><div class="problem-grid"><div><div class="problem-meta"><span class="badge ${problem.verified ? "" : "candidate"}">${problem.verified ? "Verified open" : "Candidate"}</span><span class="badge">${escapeHtml(problem.source || "Needs source")}</span></div><h4>${escapeHtml(problem.title)}</h4><p>${escapeHtml(problem.lead || "Awaiting a literature check.")}</p><div class="statement">${escapeHtml(problem.statement)}</div>${problem.formula ? `<div class="formula">${escapeHtml(problem.formula)}</div>` : ""}<div class="links">${links}</div></div><div class="facts"><div class="fact"><span>Status checked</span><strong>${escapeHtml(problem.checked || "Not yet")}</strong></div><div class="fact"><span>Why it matters</span><strong>${escapeHtml(problem.importance || "To be assessed")}</strong></div><div class="fact"><span>Your stage</span><select class="stage"><option${state.stage === "Shortlisted" ? " selected" : ""}>Shortlisted</option><option${state.stage === "Reading" ? " selected" : ""}>Reading</option><option${state.stage === "Working" ? " selected" : ""}>Working</option><option${state.stage === "Paused" ? " selected" : ""}>Paused</option></select></div><div class="fact notes-fact"><span>Your notes</span><textarea class="notes" placeholder="Idea, lemma, or next step…">${escapeHtml(state.notes || "")}</textarea><div class="saved"></div></div></div></div></article>`;
}

function topicTemplate(topic) {
  return `<article class="topic"><header class="topic-head" role="button" aria-expanded="true"><div><div class="kicker"><span class="badge ${topic.status === "candidate" ? "candidate" : ""}">${topic.status === "verified" ? "Active topic" : "Candidate topic"}</span><span class="badge">${topic.problems.length} problem${topic.problems.length === 1 ? "" : "s"}</span></div><h2>${escapeHtml(topic.title)}</h2><p class="topic-summary">${escapeHtml(topic.summary)}</p></div><button class="open-button" aria-label="Collapse topic">−</button></header><div class="topic-body"><div class="intro">${topic.intro.map(paragraph => `<p>${escapeHtml(paragraph)}</p>`).join("")}</div><div class="section-title"><h3>Shortlisted open problems</h3><span>${topic.problems.length ? "Explicit statements with sources" : "None verified yet"}</span></div>${topic.problems.length ? topic.problems.map(problemTemplate).join("") : '<div class="placeholder">This topic is ready. The next step is to find and verify one precise, high-impact open problem.</div>'}</div></article>`;
}

function bindInteractions() {
  document.querySelectorAll(".topic-head").forEach(header => header.addEventListener("click", () => {
    const body = header.nextElementSibling;
    const wasOpen = !body.hidden;
    body.hidden = wasOpen;
    header.setAttribute("aria-expanded", String(!wasOpen));
    header.querySelector(".open-button").textContent = wasOpen ? "+" : "−";
  }));
  document.querySelectorAll(".problem").forEach(card => {
    const id = card.dataset.problem;
    const stage = card.querySelector(".stage");
    const notes = card.querySelector(".notes");
    const saved = card.querySelector(".saved");
    let timer;
    const persist = () => {
      localStorage.setItem(`atlasState:${id}`, JSON.stringify({ stage: stage.value, notes: notes.value }));
      saved.textContent = "Saved locally";
      clearTimeout(timer);
      timer = setTimeout(() => { saved.textContent = ""; }, 1300);
    };
    stage.addEventListener("change", persist);
    notes.addEventListener("input", persist);
  });
}

function render() {
  const term = search.value.trim().toLowerCase();
  const visible = topics.filter(topic => {
    const searchable = [topic.title, topic.summary, ...topic.intro, ...topic.problems.flatMap(problem => [problem.title, problem.statement, storedState(problem.id).notes || ""])].join(" ").toLowerCase();
    return (selected === "all" || selected === topic.id) && searchable.includes(term);
  });
  topicRoot.innerHTML = visible.map(topicTemplate).join("") || '<div class="placeholder">No topic matches this search.</div>';
  document.getElementById("topicCount").textContent = topics.length;
  document.getElementById("verifiedCount").textContent = topics.flatMap(topic => topic.problems).filter(problem => problem.verified).length;
  bindInteractions();
}

search.addEventListener("input", render);
const dialog = document.getElementById("candidateDialog");
const topicSelect = document.getElementById("topicSelect");
topicSelect.innerHTML = topics.map(topic => `<option value="${topic.id}">${escapeHtml(topic.title)}</option>`).join("");
document.getElementById("addButton").addEventListener("click", () => dialog.showModal());
document.getElementById("saveCandidate").addEventListener("click", event => {
  const title = document.getElementById("candidateTitle").value.trim();
  const statement = document.getElementById("candidateStatement").value.trim();
  if (!title || !statement) return;
  event.preventDefault();
  const problem = { id: `candidate-${Date.now()}`, topic: topicSelect.value, verified: false, title, statement, lead: "A proposed question awaiting a literature check.", importance: "To be assessed" };
  custom.unshift(problem);
  localStorage.setItem("atlasCandidates", JSON.stringify(custom));
  topics.find(topic => topic.id === problem.topic).problems.unshift(problem);
  document.getElementById("candidateForm").reset();
  dialog.close();
  makeNavigation();
  render();
});

makeNavigation();
render();
