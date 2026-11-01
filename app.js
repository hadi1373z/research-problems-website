const researchState = window.RESEARCH_STATE;
const topics = structuredClone(researchState.topics);

const core = window.ResearchCore;
const savedCandidates = core.readStorage(localStorage, "atlasCandidates", []);
const custom = Array.isArray(savedCandidates) ? savedCandidates : [];
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
  const state = core.readStorage(localStorage, `atlasState:${id}`, {});
  return state && typeof state === "object" && !Array.isArray(state) ? state : {};
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
  return `<article class="problem" id="${escapeHtml(problem.id)}" data-problem="${escapeHtml(problem.id)}">
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
    ${researchTemplate(problem)}
    ${backgroundTemplate(problem)}
  </article>`;
}

function researchTemplate(problem) {
  const r = problem.research;
  if (!r) return "";
  return `<section class="research-progress" aria-labelledby="progress-${escapeHtml(problem.id)}">
    <div class="progress-heading"><div><div class="eyebrow">Shared research record</div><h5 id="progress-${escapeHtml(problem.id)}">Where the next attempt starts</h5></div><span class="badge candidate">Full problem ${escapeHtml(r.status)}</span></div>
    <p class="remaining-gap">${escapeHtml(r.currentGap)}</p>
    <div class="result-list">${r.results.map(result => `<details class="result-record"><summary><span>${escapeHtml(result.title)}</span><small>${result.kind === "preprint" ? "Reported preprint" : "Derivation · needs independent review"}</small></summary><div class="result-content"><div class="formula">${escapeHtml(result.claim)}</div><h6>Exact assumptions</h6><ul>${result.assumptions.map(a=>`<li>${escapeHtml(a)}</li>`).join("")}</ul><p>${escapeHtml(result.argument)}</p><p><strong>Remaining limitation:</strong> ${escapeHtml(result.limitation)}</p><p class="review-note">Novelty: ${escapeHtml(result.novelty)}. Recorded ${escapeHtml(result.date)}.</p><div class="links"><a href="${core.safeHref(result.proofUrl)}">Read full argument ↗</a>${result.sourceUrl ? `<a href="${core.safeHref(result.sourceUrl)}">Attributed primary source ↗</a>` : ""}${result.verificationUrl ? `<a href="${core.safeHref(result.verificationUrl)}">Finite verification results ↗</a>` : ""}</div></div></details>`).join("")}</div>
    <div class="frontier-list">${r.nextTasks.filter(t=>t.status === "ready").map(task=>`<article class="frontier-task"><div class="eyebrow">Next task · ${escapeHtml(task.kind)}</div><h6>${escapeHtml(task.title)}</h6><p>${escapeHtml(task.question)}</p><p class="acceptance"><strong>A useful outcome:</strong> ${escapeHtml(task.acceptance)}</p><button class="button compact continue-task" data-problem-id="${escapeHtml(problem.id)}" data-task-id="${escapeHtml(task.id)}">Copy this task for AI</button></article>`).join("")}</div>
    <details class="attempt-history"><summary>Prior attempts and routes to avoid</summary><div class="result-content">${r.attempts.map(a=>`<div class="attempt-entry"><strong>${escapeHtml(a.date)} · ${escapeHtml(a.outcome)}</strong><p>${escapeHtml(a.claim)}</p><p>${escapeHtml(a.validation)}</p><small>Attempt ${escapeHtml(a.id)} · ${escapeHtml(a.review)}</small></div>`).join("")}<h6>Failed or insufficient routes</h6><ul>${r.obstacles.map(o=>`<li><strong>${escapeHtml(o.route)}</strong> ${escapeHtml(o.reason)}</li>`).join("")}</ul></div></details>
    <div class="progress-actions"><button class="button record-attempt" data-problem-id="${escapeHtml(problem.id)}">Record an attempt</button><a href="research.html#${escapeHtml(problem.id)}">Readable AI handoff ↗</a><a class="permalink" href="#${escapeHtml(problem.id)}">Link to this problem</a></div>
  </section>`;
}

function backgroundTemplate(problem) {
  if (!problem.backgroundResults?.length) return "";
  return `<section class="background-results research-detail" aria-labelledby="background-${escapeHtml(problem.id)}">
    <h5 id="background-${escapeHtml(problem.id)}">Background results</h5>
    <p class="background-intro">Established results behind this question, with explanations of what they prove and how they connect to the remaining gap.</p>
    <ol>${problem.backgroundResults.map(result => `<li><h6>${escapeHtml(result.title)}</h6><p>${escapeHtml(result.explanation)}</p>${result.formula ? `<div class="formula">${escapeHtml(result.formula)}</div>` : ""}<p class="result-relevance"><strong>Connection to the question:</strong> ${escapeHtml(result.relevance)}</p><a class="result-source" href="${escapeHtml(result.url)}" target="_blank" rel="noreferrer">${escapeHtml(result.citation)} ↗</a></li>`).join("")}</ol>
    ${problem.backgroundConclusion ? `<div class="background-gap"><h6>What remains open</h6><p>${escapeHtml(problem.backgroundConclusion)}</p></div>` : ""}
  </section>`;
}

function topicTemplate(topic) {
  return `<article class="topic"><header class="topic-head" role="button" tabindex="0" aria-expanded="true"><div><div class="kicker"><span class="badge ${topic.status === "candidate" ? "candidate" : ""}">${topic.status === "verified" ? "Active topic" : "Candidate topic"}</span><span class="badge">${topic.problems.length} problem${topic.problems.length === 1 ? "" : "s"}</span></div><h2>${escapeHtml(topic.title)}</h2><p class="topic-summary">${escapeHtml(topic.summary)}</p></div><button class="open-button" aria-label="Collapse topic">−</button></header><div class="topic-body"><div class="intro">${topic.intro.map(paragraph => `<p>${escapeHtml(paragraph)}</p>`).join("")}</div><div class="section-title"><h3>Shortlisted research questions</h3><span>${topic.problems.length ? "Open problems and labeled candidates" : "None verified yet"}</span></div>${topic.problems.length ? topic.problems.map(problemTemplate).join("") : '<div class="placeholder">This topic is ready. The next step is to find and verify one precise, high-impact open problem.</div>'}</div></article>`;
}

function bindInteractions() {
  document.querySelectorAll(".topic-head").forEach(header => header.addEventListener("keydown", event => {
    if (event.target === header && ["Enter", " "].includes(event.key)) { event.preventDefault(); header.click(); }
  }));
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
      const state = { ...storedState(id), stage: stage.value, notes: notes.value };
      const ok = core.writeStorage(localStorage, `atlasState:${id}`, state);
      saved.textContent = ok ? "Saved locally" : "Storage unavailable; copy your note";
      clearTimeout(timer);
      timer = setTimeout(() => { saved.textContent = ""; }, 1300);
    };
    stage.addEventListener("change", persist);
    notes.addEventListener("input", persist);
  });
  document.querySelectorAll(".continue-task").forEach(button => button.addEventListener("click", () => copyHandoff(button.dataset.problemId, button.dataset.taskId)));
  document.querySelectorAll(".record-attempt").forEach(button => button.addEventListener("click", () => openAttempt(button.dataset.problemId)));
}

function render() {
  const term = search.value.trim().toLowerCase();
  const visible = topics.filter(topic => {
    const searchable = [topic.title, topic.summary, ...topic.intro, ...topic.problems.flatMap(problem => [problem.title, problem.statement, problem.model || "", problem.known || "", problem.formula || "", problem.source || "", JSON.stringify(problem.research || {}), ...(problem.backgroundResults || []).flatMap(result => [result.title, result.explanation, result.formula || "", result.relevance, result.citation]), problem.backgroundConclusion || "", storedState(problem.id).notes || ""])].join(" ").toLowerCase();
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
  core.writeStorage(localStorage, "atlasCandidates", custom);
  topics.find(topic => topic.id === problem.topic).problems.unshift(problem);
  document.getElementById("candidateForm").reset();
  dialog.close();
  makeNavigation();
  render();
});

const publicProblems = core.allProblems(researchState);
const handoffDialog = document.getElementById("handoffDialog");
const handoffText = document.getElementById("handoffText");
const feedback = document.getElementById("workspaceFeedback");
async function copyHandoff(problemId, taskId) {
  const text = core.buildPrompt(researchState, problemId, taskId);
  handoffText.value = text;
  handoffDialog.showModal();
  handoffText.focus();
  handoffText.select();
  try {
    if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
    await navigator.clipboard.writeText(text);
    feedback.textContent = "AI handoff copied. Paste it into your research session.";
    document.getElementById("handoffFeedback").textContent = "Copy requested. You can also select this text and copy it manually.";
  } catch {
    feedback.textContent = "Select and copy the handoff below.";
    document.getElementById("handoffFeedback").textContent = "Automatic copying is unavailable here. Select the text and copy it manually.";
  }
}
document.getElementById("copyHandoff").addEventListener("click", () => copyHandoff());
document.querySelectorAll("[data-close-dialog]").forEach(button => button.addEventListener("click", () => document.getElementById(button.dataset.closeDialog).close()));

const attemptDialog = document.getElementById("attemptDialog");
const attemptForm = document.getElementById("attemptForm");
const attemptProblem = document.getElementById("attemptProblem");
const attemptTask = document.getElementById("attemptTask");
const attemptFeedback = document.getElementById("attemptFeedback");
attemptProblem.innerHTML = publicProblems.map(p=>`<option value="${escapeHtml(p.id)}">${escapeHtml(p.title)}</option>`).join("");
let drafts = core.readStorage(localStorage,"atlasResearchDrafts",[]);
if (!Array.isArray(drafts)) drafts = [];
let activeDraftId = null;
function taskOptions() {
  const p = publicProblems.find(p=>p.id === attemptProblem.value);
  attemptTask.innerHTML = p.research.nextTasks.filter(t=>t.status === "ready").map(t=>`<option value="${escapeHtml(t.id)}">${escapeHtml(t.title)}</option>`).join("");
}
function loadDraft(problemId) {
  activeDraftId = null;
  for (const name of ["claim","assumptions","argument","validation","limitations","sources","nextStep","author"]) attemptForm.elements[name].value = "";
  attemptForm.elements.outcome.value = "audit";
  const draft = drafts.find(d=>d.problemId === problemId);
  if (draft) {
    activeDraftId = draft.id;
    if ([...attemptTask.options].some(o=>o.value === draft.taskId)) attemptTask.value = draft.taskId;
    for (const name of ["claim","argument","validation","limitations","nextStep","author","outcome"]) if (typeof draft[name] === "string") attemptForm.elements[name].value = draft[name];
    attemptForm.elements.assumptions.value = (draft.assumptions || []).join("\n");
    attemptForm.elements.sources.value = (draft.sources || []).join("\n");
  }
  attemptFeedback.textContent = draft ? "Loaded your private draft. Saving refreshes its baseline to the current shared revision." : "Your draft will stay in this browser until exported and merged through GitHub.";
}
function openAttempt(problemId) {
  attemptProblem.value = problemId || publicProblems[0].id;
  taskOptions();
  loadDraft(attemptProblem.value);
  attemptDialog.showModal();
}
attemptProblem.addEventListener("change", () => {taskOptions();loadDraft(attemptProblem.value);});
document.getElementById("recordAttempt").addEventListener("click", () => openAttempt());
function makeDraft() {
  const values = Object.fromEntries(new FormData(attemptForm));
  const problem = publicProblems.find(p=>p.id === values.problemId);
  return {
    schemaVersion:1,id:activeDraftId || `draft-${Date.now()}`,status:"draft",review:"unreviewed",baseRevision:researchState.revision,
    problemId:values.problemId,taskId:values.taskId,priorAttemptIds:problem.research.attempts.map(a=>a.id),
    resultIds:[],artifactUrls:[],date:new Date().toISOString().slice(0,10),recordedAt:new Date().toISOString(),author:values.author.trim() || "Browser draft",
    outcome:values.outcome,claim:values.claim.trim(),assumptions:values.assumptions.split("\n").map(x=>x.trim()).filter(Boolean),
    argument:values.argument.trim(),validation:values.validation.trim(),limitations:values.limitations.trim(),
    sources:values.sources.split("\n").map(x=>x.trim()).filter(Boolean),nextStep:values.nextStep.trim(),supersedes:[]
  };
}
function saveDraft() {
  if (!attemptForm.reportValidity()) return null;
  const draft = makeDraft();
  const errors = core.validateDraft(draft,researchState);
  if (errors.length) {attemptFeedback.textContent = errors.join(" "); return null;}
  activeDraftId = draft.id;
  drafts = [draft,...drafts.filter(d=>d.problemId !== draft.problemId)];
  const saved = core.writeStorage(localStorage,"atlasResearchDrafts",drafts);
  document.getElementById("draftCount").textContent = drafts.length;
  attemptFeedback.textContent = saved ? "Saved locally. This is an unreviewed draft; the public research record has not changed." : "Browser storage is unavailable. Export the draft now to keep it.";
  return draft;
}
attemptForm.addEventListener("submit", event => {event.preventDefault();saveDraft();});
document.getElementById("exportAttempt").addEventListener("click", () => {
  const draft = saveDraft();
  if (!draft) return;
  const url = URL.createObjectURL(new Blob([JSON.stringify(draft,null,2)+"\n"],{type:"application/json"}));
  const link = document.createElement("a");
  link.href=url;link.download=`${draft.problemId}-${draft.id}.json`;link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
  attemptFeedback.textContent="Draft exported. Contribute it through the repository to make it available to the next session.";
});
document.getElementById("draftCount").textContent = drafts.length;
document.getElementById("sharedRevision").textContent = researchState.revision;
function followHash() {
  const id = location.hash.slice(1);
  const topic = topics.find(t=>t.problems.some(p=>p.id === id));
  if (topic) {selected=topic.id;search.value="";}
  makeNavigation();render();
  if (topic) document.getElementById(id)?.scrollIntoView({block:"start"});
}
window.addEventListener("hashchange",followHash);
followHash();
