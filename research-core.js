/* Shared pure helpers for the website, static handoff, and validation. */
(function (root) {
  'use strict';
  const outcomes = ['proof', 'counterexample', 'audit', 'computation', 'literature-update', 'no-progress'];
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const allProblems = state => state.topics.flatMap(topic => topic.problems);
  const normalize = value => String(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
  function isSafeUrl(value) {
    if (typeof value !== 'string' || !value || /[\s\\<>"']/u.test(value)) return false;
    if (/^https?:\/\//i.test(value)) {
      try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password; } catch { return false; }
    }
    return /^[a-zA-Z0-9][a-zA-Z0-9_./#?=&%+-]*$/.test(value) && !value.split(/[?#]/)[0].split('/').includes('..');
  }
  const safeHref = value => escapeHtml(isSafeUrl(value) ? value : '#');
  function readStorage(storage, key, fallback) {
    try { const value = JSON.parse(storage.getItem(key)); return value === null ? fallback : value; } catch { return fallback; }
  }
  function writeStorage(storage, key, value) {
    try { storage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
  }
  function findTask(state, problemId, taskId) {
    return allProblems(state).find(p => p.id === problemId)?.research?.nextTasks.find(t => t.id === taskId);
  }
  function buildPrompt(state, problemId, taskId) {
    const chosen = allProblems(state).filter(p => !problemId || p.id === problemId);
    if (!chosen.length) throw new Error('Unknown problem.');
    const lines = [
      `Continue the research notebook at ${state.siteUrl}`,
      `Read the current ${state.siteUrl}research-state.json and ${state.siteUrl}research.html before working.`,
      `If your web reader cannot access GitHub Pages, read the same state at https://raw.githubusercontent.com/hadi1373z/research-problems-website/main/research-state.json and the protocol in the GitHub repository.`,
      `This handoff was prepared from revision ${state.revision}; refresh it if the shared state has changed.`,
      'Choose ONE concrete ready task. Work toward a checked research delta, not a rewrite of the existing summary.',
      'Treat this request as research within the tools and permissions actually available to you. The website does not grant account access.',
      ''
    ];
    for (const problem of chosen) {
      const research = problem.research;
      lines.push(`PROBLEM ${problem.id}: ${problem.title}`, `Model: ${problem.model}`, `Question: ${problem.statement}`, `Remaining gap: ${research.currentGap}`);
      for (const result of research.results) lines.push(`Existing result ${result.id} [${result.review}; novelty ${result.novelty}]: ${result.claim}`, `Read proof: ${new URL(result.proofUrl, state.siteUrl).href}`, `Scope: ${result.assumptions.join(' ')} Limitation: ${result.limitation}`);
      lines.push(`Prior attempts: ${research.attempts.map(a => a.id).join(', ')}`);
      for (const obstacle of research.obstacles) lines.push(`Do not repeat this unsupported shortcut: ${obstacle.route} Reason: ${obstacle.reason}`);
      const tasks = research.nextTasks.filter(t => t.status === 'ready' && (!taskId || t.id === taskId));
      for (const task of tasks) lines.push(`READY TASK ${task.id} (${task.kind}): ${task.title}`, `Work: ${task.question}`, `Acceptance: ${task.acceptance}`);
      lines.push('');
    }
    if (taskId && !chosen.some(p => p.research.nextTasks.some(t => t.id === taskId && t.status === 'ready'))) throw new Error('Unknown or unavailable task.');
    lines.push(
      'Verify the mathematics, the exact assumptions, and relevant primary sources. Separate a restricted result, an independent audit, and an unrestricted resolution.',
      'Finite experiments corroborate examples; they do not prove asymptotic claims. Do not assert novelty without a literature check.',
      'Append a dated attempt with baseline revision, prior attempt IDs, task ID, exact claim, assumptions, proof or counterexample, validation, limitations, source links, and a concrete next task.',
      'If no reliable new result is obtained, record outcome no-progress and the precise obstruction. Do not invent progress.',
      'Preserve old attempts; corrections should supersede them explicitly. Leave the full problem open unless an independent review supports a full resolution.',
      `For a shared update, use ${state.repositoryUrl} and follow AGENTS.md. Edit research-state.json, append the attempt, update the frontier, and run node scripts/build.mjs plus node --test.`,
      `If repository write access is unavailable, return a reviewable draft using ${state.siteUrl}research/attempt-template.json. Browser drafts are not shared until merged.`,
      'Report exactly what changed relative to the baseline and where it was saved.'
    );
    return lines.join('\n');
  }
  function validateDraft(draft, state) {
    const errors = [];
    const problem = allProblems(state).find(p => p.id === draft?.problemId);
    if (!draft || draft.schemaVersion !== 1) return ['Unsupported attempt format.'];
    if (draft.baseRevision !== state.revision) errors.push('The shared revision changed. Refresh the baseline before merging this draft.');
    if (!problem) errors.push('Choose a public research problem.');
    if (findTask(state, draft.problemId, draft.taskId)?.status !== 'ready') errors.push('Choose a ready task belonging to this problem.');
    if (!outcomes.includes(draft.outcome)) errors.push('Choose a supported outcome, including no-progress when appropriate.');
    for (const key of ['claim', 'argument', 'validation', 'limitations', 'nextStep']) if (typeof draft[key] !== 'string' || !draft[key].trim()) errors.push(`Complete ${key}.`);
    if (!Array.isArray(draft.assumptions) || !draft.assumptions.some(x => typeof x === 'string' && x.trim())) errors.push('State at least one assumption.');
    if (!Array.isArray(draft.priorAttemptIds) || !problem?.research.attempts.every(a => draft.priorAttemptIds.includes(a.id))) errors.push('Include the current prior attempt IDs.');
    if (!Array.isArray(draft.sources) || draft.sources.some(url => !/^https?:\/\//i.test(url) || !isSafeUrl(url))) errors.push('Sources must be complete http or https URLs, one per line.');
    if (draft.status !== 'draft' || draft.review !== 'unreviewed') errors.push('Exported browser attempts must remain unreviewed drafts.');
    if (problem?.research.attempts.some(a => normalize(a.claim) === normalize(draft.claim))) errors.push('This claim repeats an existing attempt. State the actual new delta or a specific independent audit.');
    return errors;
  }
  function validateState(state) {
    const errors = [];
    if (state.schemaVersion !== 1 || !state.revision) errors.push('Missing state version.');
    if (!Array.isArray(state.protocol) || !state.protocol.length) errors.push('Missing continuation protocol.');
    const ids = new Set();
    const addId = (id, label) => { if (typeof id !== 'string' || !/^[a-z0-9][a-z0-9-]*$/.test(id) || ids.has(id)) errors.push(`Invalid or duplicate ${label}: ${id}`); ids.add(id); };
    for (const topic of state.topics || []) {
      addId(topic.id, 'topic ID');
      for (const problem of topic.problems || []) {
        addId(problem.id, 'problem ID');
        const r = problem.research;
        if (!r || !r.currentGap || !r.results?.length || !r.nextTasks?.length || !r.attempts?.length) { errors.push(`Incomplete research state for ${problem.id}`); continue; }
        if (!['open','resolved'].includes(r.status)) errors.push(`Unsupported full-problem status: ${problem.id}`);
        const resultIds = new Set(r.results.map(x => x.id));
        for (const result of r.results) {
          addId(result.id, 'result ID');
          if (!result.assumptions?.length || !result.argument || !result.limitation || !result.novelty) errors.push(`Missing result scope: ${result.id}`);
          if (!['needs-independent-review','reported-preprint','independently-checked','published'].includes(result.review)) errors.push(`Missing review status: ${result.id}`);
          for (const key of ['proofUrl','verificationUrl','sourceUrl']) if (result[key] && !isSafeUrl(result[key])) errors.push(`Unsafe ${key}: ${result.id}`);
        }
        for (const task of r.nextTasks) {
          addId(task.id, 'task ID');
          if (!task.question || !task.acceptance || !['ready','completed','blocked'].includes(task.status)) errors.push(`Incomplete task: ${task.id}`);
          if (task.resultIds.some(id => !resultIds.has(id))) errors.push(`Unknown task result: ${task.id}`);
        }
        for (const attempt of r.attempts) {
          addId(attempt.id, 'attempt ID');
          if (!attempt.date || !attempt.validation || !attempt.limitations || !attempt.baseRevision) errors.push(`Incomplete attempt: ${attempt.id}`);
          if (attempt.resultIds.some(id => !resultIds.has(id))) errors.push(`Unknown attempt result: ${attempt.id}`);
          for (const url of attempt.artifactUrls || []) if (!isSafeUrl(url)) errors.push(`Unsafe attempt artifact: ${attempt.id}`);
        }
        for (const obstacle of r.obstacles) {
          addId(obstacle.id, 'obstacle ID');
          if (!obstacle.reason || obstacle.evidenceResultIds.some(id => !resultIds.has(id))) errors.push(`Incomplete obstacle: ${obstacle.id}`);
        }
        if (r.status === 'resolved') {
          const resolution = r.resolution;
          const result = r.results.find(x => x.id === resolution?.resultId);
          if (!resolution?.reviewedBy || !resolution.reviewedAt || resolution.scope !== 'full' || !isSafeUrl(resolution.evidenceUrl) || !['independently-checked','published'].includes(result?.review)) errors.push(`A full resolution needs independent review and evidence: ${problem.id}`);
        }
      }
    }
    return errors;
  }
  const api = {outcomes, escapeHtml, safeHref, isSafeUrl, allProblems, readStorage, writeStorage, findTask, buildPrompt, validateDraft, validateState};
  root.ResearchCore = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(globalThis);
