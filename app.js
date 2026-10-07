const topics = [
  {
    id: "property-testing",
    status: "verified",
    title: "Graph Property Testing & Estimation",
    summary: "What can a tiny random sample reveal about a massive dense graph?",
    intro: [
      "In the dense-graph model, distance to a property is the minimum number of edge additions or deletions divided by n². A tester distinguishes membership from distance at least ε, with success probability at least 2/3. A canonical tester observes a uniformly sampled induced subgraph.",
      "Sample complexity counts vertices; edge-query complexity counts inspected pairs and can be quadratic in that sample size. These bounds concern information used, not the running time of computation on the sample. Estimation asks for a tolerant decision at an arbitrary distance threshold."
    ],
    problems: [{
      id: "testing-estimation",
      verified: true,
      title: "Does efficient testing imply efficient distance estimation?",
      lead: "Qualitative equivalence is proved; a comparable quantitative conversion remains open.",
      model: "Fix a graph property P in the dense model. qP(ε) counts sampled vertices; dP(G) is normalized edit distance. An estimator distinguishes dP(G) ≤ α from dP(G) ≥ α+ε, for every threshold α, with probability at least 2/3.",
      statement: "If P is testable using qP(ε) sampled vertices, is it estimable using qP(ε′) vertices for some ε′ = poly(ε)? The polynomial rescaling may depend on P, but not on n or ε.",
      known: "The 2025 survey's Theorem 5.3 gives a general doubly exponential conversion. Problem 5.4 asks for the much smaller rescaled tester bound.",
      formula: "Known upper bound: exp(poly(1/ε) · exp(qP(ε/2)))  ·  Target: qP(poly(ε))",
      source: "Problem 5.4 (2025); Problem 1.8 (2023)",
      checked: "2025 survey, §5",
      reviewed: "2026-10-07",
      statusNote: "Explicit open problem in the survey; subsequent-work searches found no resolution. This is a literature review, not an automatic status guarantee.",
      importance: "General decision-to-estimation principle",
      links: [
        ["2023 paper · Problem 1.8", "https://arxiv.org/html/2305.05487"],
        ["2025 survey · §5", "https://arxiv.org/html/2508.16878v1#S5"],
        ["Graph-limit background", "https://users.renyi.hu/~sos/2006_Graph_limits_and_parameter_testing.pdf"]
      ]
    }, {
      id: "colorability-sample-complexity",
      verified: true,
      title: "Is the optimal sample complexity of k-colorability Θ(log(k)/ε)?",
      lead: "A September 2026 result gives a k-dependent lower bound and a sharper upper bound, but they still differ.",
      model: "For k ≥ 2 and ε sufficiently small for the given k, let Sk(ε) be the least sample size such that a uniformly sampled induced subgraph of every graph ε-far from k-colorable is non-k-colorable with probability at least 2/3. Distance counts edge deletions divided by n².",
      statement: "Prove or disprove Sk(ε) = Θ(log(k)/ε), as conjectured by Kushnir and Shapira. Determine the sharp dependence on k and ε for the canonical one-sided tester.",
      known: "Their Theorems 1.1–1.2 prove Ω(log(k)/ε) and O((k/ε) log(1/ε)). This improves both bounds recorded in the 2025 survey.",
      formula: "Ω(log(k)/ε) ≤ Sk(ε) ≤ O((k/ε) log(1/ε))",
      source: "Conjecture 1.3 · RANDOM 2026",
      checked: "9 September 2026 paper",
      reviewed: "2026-10-07",
      statusNote: "The conference paper states the conjecture explicitly; no later resolution was located in the review.",
      importance: "Sharp limits of detecting global colorability from small samples",
      links: [
        ["Kushnir–Shapira · 2026", "https://drops.dagstuhl.de/entities/document/10.4230/LIPIcs.APPROX/RANDOM.2026.35"],
        ["Paper · Theorems 1.1–1.2", "https://drops.dagstuhl.de/storage/00lipics/lipics-vol392-approx-random2026/LIPIcs.APPROX-RANDOM.2026.35/LIPIcs.APPROX-RANDOM.2026.35.pdf"]
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
      model: "Input: two finite simple undirected graphs G,H on n vertices. They are isomorphic when a bijection φ preserves adjacency in both directions. The algorithm must work for every input, without degree or structural restrictions.",
      statement: "Does a deterministic algorithm decide whether G ≅ H in n^{O(1)} time?",
      known: "Babai proves a deterministic quasipolynomial-time algorithm. Neuen's 2026 survey still identifies unrestricted polynomial-time GI as open. Polynomial-time algorithms on restricted classes do not settle this question.",
      formula: "Known general upper bound: exp((log n)^{O(1)})  ·  Target: n^{O(1)}",
      source: "Babai; Neuen 2026, Introduction",
      checked: "2026 survey",
      reviewed: "2026-10-07",
      statusNote: "The cited survey records the open status; no accepted general polynomial-time solution was located in the review.",
      importance: "Prominent unresolved complexity classification",
      links: [
        ["Babai’s algorithm", "https://arxiv.org/abs/1512.03547"],
        ["Neuen · 2026 survey", "https://epub.uni-regensburg.de/78630/1/1-s2.0-S1574013726000274-main.pdf"]
      ]
    }, {
      id: "gi-degree-fpt",
      verified: true,
      title: "Is graph isomorphism fixed-parameter tractable in maximum degree?",
      lead: "Polynomial time for each fixed degree is known; a uniform exponent independent of the degree remains elusive.",
      model: "Both input graphs have n vertices and maximum degree at most d, with d≥2 (degrees 0 and 1 are elementary). Fixed-parameter tractability means time f(d) · n^C for a computable f and an absolute constant C independent of d.",
      statement: "Is there an isomorphism algorithm with running time f(d) · n^C for all n and d?",
      known: "Grohe, Neuen and Schweitzer obtain n^{O((log d)^c)} time for an absolute c. The exponent still depends on d; Neuen's 2026 survey, §4.1 after Corollary 4.7, explicitly records FPT in maximum degree as open.",
      formula: "Known: n^{O((log d)^c)}  ·  Target: f(d) · n^C",
      source: "Neuen 2026 · after Corollary 4.7",
      checked: "2026 survey, §4.1",
      reviewed: "2026-10-07",
      statusNote: "Explicit open-status statement in the survey; no later FPT resolution was located.",
      importance: "A uniform algorithmic guarantee for graphs of bounded degree",
      links: [
        ["2026 survey · §4.1", "https://epub.uni-regensburg.de/78630/1/1-s2.0-S1574013726000274-main.pdf"],
        ["Small-degree algorithm", "https://arxiv.org/abs/1802.04659"]
      ]
    }]
  },
  {
    id: "graphons",
    status: "verified",
    title: "Graphons, Sampling & Identifiability",
    summary: "How much of an infinite graph limit can finite random samples determine?",
    intro: [
      "Graphons W:[0,1]²→[0,1] describe dense graph limits, considered up to weak isomorphism rather than pointwise equality.",
      "Cycle densities retain spectral information. Does equality of that information lift to finite cospectral approximations in cut distance?"
    ],
    problems: [{
      id: "cospectral-graphon-approximation",
      verified: true,
      title: "Can equal-density cospectral graphons resist finite cospectral approximation?",
      lead: "Cospectrality passes to graph limits; reversing that passage can fail. Is equal edge density enough to remove the obstruction?",
      model: "U,W are graphons with t(Ck,U)=t(Ck,W) for every k≥3 and ∫U=∫W. Here t is homomorphism density, Ck is a cycle, and δ□ is cut distance after measure-preserving relabeling. WG is the step graphon representing G.",
      statement: "Do such U,W exist for which no finite simple cospectral graph pairs Gj,Hj of equal order tending to infinity satisfy δ□(WGj,U)→0 and δ□(WHj,W)→0? Cospectral finite graphs have identical adjacency spectra, including multiplicities.",
      known: "The paper proves inapproximability when ∫U≠∫W. Equal edge density rules out that particular obstruction and is the remaining published question.",
      formula: "Equal cycle densities + equal edge density ⇒ finite cospectral approximation?",
      source: "Problem 7 · EJC 33(1), P1.10 (2026)",
      checked: "January 2026 journal paper",
      reviewed: "2026-10-07",
      statusNote: "Explicitly open in the published paper; targeted later-work searches found no resolution. The preprint numbers it Problem 4.4.",
      importance: "Which spectral equivalences survive approximation by finite graphs?",
      links: [
        ["Published paper · 2026", "https://www.combinatorics.org/ojs/index.php/eljc/article/view/v33i1p10"],
        ["Journal PDF · Problem 7", "https://www.combinatorics.org/ojs/index.php/eljc/article/download/v33i1p10/pdf/"],
        ["Preprint · Problem 4.4", "https://arxiv.org/html/2411.13229"]
      ]
    }]
  },
  {
    id: "regularity",
    status: "verified",
    title: "Regularity, Removal & Quantitative Bounds",
    summary: "Can qualitative decomposition theorems become efficient enough to power real algorithms?",
    intro: [
      "Regularity lemmas approximate a large graph by a bounded collection of pseudorandom pieces. They drive results in graph limits, property testing, counting, and removal, but their worst-case partition sizes can grow as towers of exponentials.",
      "This creates a sharp divide between qualitative existence and useful quantitative bounds. Research asks which graph classes admit polynomial or singly exponential decompositions and whether weaker regularity retains enough information for testing and estimation."
    ],
    problems: [{
      id: "triangle-removal-bounds",
      verified: true,
      title: "Narrow the quantitative gap in triangle removal",
      lead: "A polynomial removal bound is already ruled out. The remaining gap runs from quasipolynomial growth to a tower.",
      model: "Let T(G) count unordered triangles and τ△(G) be the fewest edge deletions making G triangle-free. Define δ△(ε)=inf T(G)/n³ over all positive integers n and all eligible n-vertex graphs with τ△(G)≥εn². tower(h) denotes a tower of twos of height h.",
      statement: "Determine sharper asymptotic upper or lower bounds for δ△(ε) as ε→0, reducing the gap between the known construction and removal guarantees.",
      known: "Fox's removal argument gives a tower of height O(log(1/ε)) for 1/δ△. Behrend-type constructions give exp(Ω(log²(1/ε))); Hunter's 2025 construction improves the constant while retaining this form.",
      formula: "exp(Ω(log²(1/ε))) ≤ 1/δ△(ε) ≤ tower(O(log(1/ε)))",
      source: "2026 homomorphisms paper · §1.3",
      checked: "2026 paper; Hunter 2025",
      reviewed: "2026-10-07",
      statusNote: "The 2026 paper explicitly calls narrowing this gap open; no subsequent resolution was located.",
      importance: "Quantitative foundations of removal and dense graph testing",
      links: [
        ["Open-status source · §1.3", "https://arxiv.org/html/2502.20278v1#S1.SS3"],
        ["Fox · removal upper bound", "https://annals.math.princeton.edu/2011/174-1/p17"],
        ["Hunter · 2025 lower bound", "https://arxiv.org/abs/2507.05231"]
      ]
    }, {
      id: "induced-c4-removal",
      verified: true,
      title: "Does induced C₄ removal admit a polynomial bound?",
      lead: "The induced four-cycle case has an exponential guarantee, while a polynomial guarantee remains conjectural.",
      model: "An induced C₄ is a set of four vertices spanning a cycle with no diagonal edges. Distance to induced-C₄-freeness allows both edge additions and deletions, normalized by n².",
      statement: "Do absolute constants a,b>0 exist such that every n-vertex graph requiring at least εn² edge edits to become induced-C₄-free contains at least aε^b n⁴ induced copies of C₄?",
      known: "Gishboliner and Shapira prove a lower bound 2^{−(1/ε)^C} n⁴ for some absolute C>0. Gishboliner's 2025 notes restate the polynomial improvement as Conjecture 3.6. Labeled versus unlabeled copies changes only the constant factor.",
      formula: "Known: 2^{−poly(1/ε)} n⁴ copies  ·  Conjectured: poly(ε) n⁴ copies",
      source: "Conjecture 3.6 · IBS 2025 notes",
      checked: "2025 notes, §3",
      reviewed: "2026-10-07",
      statusNote: "Explicit conjecture in the author's notes; 2025–2026 searches found no polynomial removal theorem settling it.",
      importance: "Polynomial testing of induced-subgraph properties",
      links: [
        ["2025 notes · Conjecture 3.6", "https://www.ibs.re.kr/ecopro/wp-content/uploads/2025/08/IBS_2025Summer_removal_lemma.pdf"],
        ["Gishboliner–Shapira · Theorem 1.1", "https://arxiv.org/abs/1709.08159"]
      ]
    }]
  },
  {
    id: "graph-learning",
    status: "candidate",
    title: "Learning on Graphs",
    summary: "When can graph neural networks generalize across size, density, and topology?",
    intro: [
      "Graph neural networks process data whose relationships matter as much as individual features. Their expressive power is tied to graph isomorphism tests, while their stability and transfer across graphs can be studied through graph limits and graphon operators.",
      "The question below concerns a fixed network applied to graphs sampled from the same graphon. Quantitative bounds must specify the architecture, activation, and signal assumptions. Size transfer alone does not establish generalization after training or transfer between different graph distributions."
    ],
    problems: [{
      id: "higher-order-transfer-rates",
      verified: false,
      title: "Quantitative transferability of higher-order graphon networks",
      lead: "Qualitative transfer is known; general explicit rates are an author-posed research direction.",
      model: "Fix an Invariant Graphon Network N (IWN) with architecture and weights independent of n,m and continuous activation. W:[0,1]²→[0,1] is symmetric measurable; f is scalar measurable, ||f||∞≤r>1. Independently sample simple loopless graph-signals using iid uniform positions, conditional Bernoulli(W(xi,xj)) edges, and f(xi) signals.",
      statement: "Obtain explicit, tight bounds on E|N(Gn,fn)−N(Gm,fm)| beyond the restricted two-layer analytic architecture. Track tensor order, depth, weights, signal bound, and activation regularity.",
      known: "Theorem 5.2/Corollary 5.3 give qualitative transferability. Theorem 5.4 covers a specified two-layer real-analytic class under Theorem G.1's condition r||(a,b,c)||₁<R, where R is the activation's convergence radius.",
      formula: "Restricted class, sufficiently large n,m: E|N(Gn,fn)−N(Gm,fm)| ≤ C(N,r)[(log n)^(−1/2)+(log m)^(−1/2)]",
      source: "Herbst–Jegelka · ICLR 2025, §6",
      checked: "2025 paper; later status unconfirmed",
      reviewed: "2026-10-07",
      statusNote: "Published future direction; later status unconfirmed. No common rate for all continuous activations or distribution-shift guarantee is claimed.",
      importance: "Finite-sample guarantees for expressive graph models",
      links: [
        ["ICLR 2025 · §6 and Theorem 5.4", "https://arxiv.org/html/2503.14338"],
        ["Later framework · Appendix G.3", "https://papers.neurips.cc/paper_files/paper/2025/file/60b393761eea35bf491687c46e4f1a5a-Paper-Conference.pdf"]
      ]
    }]
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
  return `<article class="problem" data-problem="${escapeHtml(problem.id)}">
    <div class="problem-grid"><div>
      <div class="problem-meta"><span class="badge ${problem.verified ? "" : "candidate"}">${problem.verified ? "Verified open" : "Candidate"}</span><span class="badge">${escapeHtml(problem.source || "Needs source")}</span></div>
      <h4>${escapeHtml(problem.title)}</h4>
      <p>${escapeHtml(problem.lead || "Awaiting a literature check.")}</p>
      ${problem.model ? `<div class="research-detail"><h5>Model and assumptions</h5><p>${escapeHtml(problem.model)}</p></div>` : ""}
      <div class="research-detail"><h5>${problem.verified ? "Open question" : "Candidate question"}</h5><div class="statement">${escapeHtml(problem.statement)}</div></div>
      ${problem.known ? `<div class="research-detail"><h5>Known results</h5><p>${escapeHtml(problem.known)}</p></div>` : ""}
      ${problem.formula ? `<div class="formula">${escapeHtml(problem.formula)}</div>` : ""}
      <div class="links">${links}</div>
      ${problem.statusNote ? `<p class="status-note">${escapeHtml(problem.statusNote)}</p>` : ""}
    </div><div class="facts">
      <div class="fact"><span>Status evidence</span><strong>${escapeHtml(problem.checked || "Not yet")}</strong></div>
      <div class="fact"><span>Reviewed on</span><strong>${escapeHtml(problem.reviewed || "Not reviewed")}</strong></div>
      <div class="fact"><span>Why it matters</span><strong>${escapeHtml(problem.importance || "To be assessed")}</strong></div>
      <div class="fact"><span>Your stage</span><select class="stage"><option${state.stage === "Shortlisted" ? " selected" : ""}>Shortlisted</option><option${state.stage === "Reading" ? " selected" : ""}>Reading</option><option${state.stage === "Working" ? " selected" : ""}>Working</option><option${state.stage === "Paused" ? " selected" : ""}>Paused</option></select></div>
      <div class="fact notes-fact"><span>Your notes</span><textarea class="notes" placeholder="Idea, lemma, or next step…">${escapeHtml(state.notes || "")}</textarea><div class="saved"></div></div>
    </div></div>
  </article>`;
}

function topicTemplate(topic) {
  return `<article class="topic"><header class="topic-head" role="button" aria-expanded="true"><div><div class="kicker"><span class="badge ${topic.status === "candidate" ? "candidate" : ""}">${topic.status === "verified" ? "Active topic" : "Candidate topic"}</span><span class="badge">${topic.problems.length} problem${topic.problems.length === 1 ? "" : "s"}</span></div><h2>${escapeHtml(topic.title)}</h2><p class="topic-summary">${escapeHtml(topic.summary)}</p></div><button class="open-button" aria-label="Collapse topic">−</button></header><div class="topic-body"><div class="intro">${topic.intro.map(paragraph => `<p>${escapeHtml(paragraph)}</p>`).join("")}</div><div class="section-title"><h3>Shortlisted research questions</h3><span>${topic.problems.length ? "Open problems and labeled candidates" : "None verified yet"}</span></div>${topic.problems.length ? topic.problems.map(problemTemplate).join("") : '<div class="placeholder">This topic is ready. The next step is to find and verify one precise, high-impact open problem.</div>'}</div></article>`;
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
    const searchable = [topic.title, topic.summary, ...topic.intro, ...topic.problems.flatMap(problem => [problem.title, problem.statement, problem.model || "", problem.known || "", problem.formula || "", problem.source || "", storedState(problem.id).notes || ""])].join(" ").toLowerCase();
    return (selected === "all" || selected === topic.id) && searchable.includes(term);
  });
  topicRoot.innerHTML = visible.map(topicTemplate).join("") || '<div class="placeholder">No topic matches this search.</div>';
  document.getElementById("topicCount").textContent = topics.length;
  const problems = topics.flatMap(topic => topic.problems);
  document.getElementById("verifiedCount").textContent = problems.filter(problem => problem.verified).length;
  const latestReview = problems.map(problem => problem.reviewed).filter(date => /^\d{4}-\d{2}-\d{2}$/.test(date || "")).sort().pop();
  document.getElementById("reviewedDate").textContent = latestReview ? new Date(`${latestReview}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }) : "Not reviewed";
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
