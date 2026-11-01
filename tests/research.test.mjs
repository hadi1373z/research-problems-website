import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const require=createRequire(import.meta.url);
const core=require('../research-core.js');
const state=JSON.parse(fs.readFileSync(path.join(root,'research-state.json'),'utf8'));
const problems=core.allProblems(state);
const first=problems[0];
const draft=()=>({schemaVersion:1,status:'draft',review:'unreviewed',baseRevision:state.revision,problemId:first.id,taskId:first.research.nextTasks[0].id,priorAttemptIds:first.research.attempts.map(a=>a.id),outcome:'audit',claim:'An independent check of the finite-order lower bound with explicit constants.',assumptions:['Dense simple graphs and without-replacement vertex samples.'],argument:'A written coupling with an explicit finite-order error term.',validation:'The mathematical argument is checked separately from finite corroboration.',limitations:'This does not prove the general conversion.',sources:['https://arxiv.org/html/2508.16878v1'],nextStep:'Determine whether the same finite-order comparison extends to a larger property family.'});

test('canonical results, tasks, attempts, references and scopes are consistent',()=>{
  assert.deepEqual(core.validateState(state),[]);
  assert.ok(problems.every(p=>p.research.status==='open'));
  assert.ok(state.history.every(h=>h.kind!=='site-update'||h.countsAsResearch===false));
});
test('a browser-independent reader can find every question, gap, attempt and next task',()=>{
  const html=fs.readFileSync(path.join(root,'research.html'),'utf8');
  assert.ok(!/<script\b/i.test(html));
  for(const p of problems){
    assert.ok(html.includes(`id="${p.id}"`));
    assert.ok(html.includes(core.escapeHtml(p.statement)));
    assert.ok(html.includes(core.escapeHtml(p.research.currentGap)));
    for(const t of p.research.nextTasks) assert.ok(html.includes(core.escapeHtml(t.acceptance)));
    for(const a of p.research.attempts) assert.ok(html.includes(a.id));
  }
  assert.ok(html.includes('no-progress'));
});
test('every local proof and verification target exists, including proof anchors',()=>{
  for(const p of problems) for(const result of p.research.results) for(const key of ['proofUrl','verificationUrl']){
    const url=result[key];
    if(!url||/^https?:/.test(url))continue;
    const [file,anchor]=url.split('#');
    const target=path.join(root,file);
    assert.ok(fs.existsSync(target),url);
    if(anchor)assert.ok(fs.readFileSync(target,'utf8').includes(`id="${anchor}"`),url);
  }
});
test('a handoff names the exact baseline, selected task, scope, and honest stopping path',()=>{
  for(const p of problems){
    const t=p.research.nextTasks[0];
    const prompt=core.buildPrompt(state,p.id,t.id);
    assert.ok(prompt.includes(state.revision));
    assert.ok(prompt.includes(t.acceptance));
    assert.ok(prompt.includes(p.research.attempts[0].id));
    assert.ok(prompt.includes('no-progress'));
    assert.ok(prompt.includes('independent review'));
    assert.ok(prompt.includes(p.research.results[0].limitation));
  }
  assert.throws(()=>core.buildPrompt(state,first.id,'missing-task'));
});
test('drafts reject stale baselines, cross-problem tasks, duplicate claims and premature verification',()=>{
  assert.deepEqual(core.validateDraft(draft(),state),[]);
  for(const patch of [{baseRevision:'stale'},{taskId:problems[1].research.nextTasks[0].id},{claim:first.research.attempts[0].claim},{review:'verified'},{sources:['javascript:alert(1)']}]){
    assert.ok(core.validateDraft({...draft(),...patch},state).length>0,JSON.stringify(patch));
  }
  assert.deepEqual(core.validateDraft({...draft(),outcome:'no-progress',claim:'No reliable new conclusion; a specific coupling estimate remains unproved.'},state),[]);
});
test('full resolution cannot be set merely by changing its status',()=>{
  const copy=structuredClone(state);
  copy.topics[0].problems[0].research.status='resolved';
  assert.ok(core.validateState(copy).some(e=>e.includes('independent review')));
});
test('untrusted strings and storage failure do not execute or destroy legacy notes',()=>{
  assert.equal(core.escapeHtml('<img src=x onerror="alert(1)">'),'&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
  for(const url of ['javascript:alert(1)','data:text/html,x','//evil.example','../secret','https://user:password@example.com'])assert.equal(core.isSafeUrl(url),false,url);
  const values=new Map([['atlasState:old',JSON.stringify({notes:'Keep this existing note',stage:'Working'})],['bad','{']]);
  const storage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};
  assert.equal(core.readStorage(storage,'atlasState:old',{}).notes,'Keep this existing note');
  assert.deepEqual(core.readStorage(storage,'bad',[]),[]);
  assert.equal(core.writeStorage(storage,'atlasResearchDrafts',[draft()]),true);
  assert.equal(core.readStorage(storage,'atlasState:old',{}).stage,'Working');
  assert.equal(core.writeStorage({setItem(){throw new Error('Unavailable');}},'key',{}),false);
});
test('generated browser data and the no-JavaScript handoff match the canonical revision',()=>{
  const result=spawnSync(process.execPath,['scripts/build.mjs','--check'],{cwd:root,encoding:'utf8'});
  assert.equal(result.status,0,result.stdout+result.stderr);
});
