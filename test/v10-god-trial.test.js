import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import test from 'node:test';
import {createV10ContentLoader} from '../js/v10-content-loader.js';
import {projectV10SourceCharacter} from '../js/v10-human-runner.js';
import {createV10LifeRunner} from '../js/v10-life-runner.js';
import {createV10SaveStore,SAVE_PREFIX} from '../js/v10-save-store.js';
import {V10_GOD_TRIAL_STAGES,V10_GOD_TRIAL_POOLS,V10_GOD_TRIAL_SEMANTICS,V10_GOD_TRIAL_CONTENT,evaluateV10GodTrialRequirement} from '../js/v10-god-trial-runtime.js';
globalThis.document??={createElement(){return {relList:{supports:()=>true},addEventListener(n,h){if(n==='load')queueMicrotask(h)},setAttribute(){}}},getElementsByTagName:()=>[],querySelector:()=>null,querySelectorAll:()=>[],head:{appendChild(){}}};
globalThis.window??={dispatchEvent(){}};
const root=new URL('../',import.meta.url);
const loader=createV10ContentLoader({moduleBaseUrl:root.href,fetchImpl:async p=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(new URL(p,root),'utf8'))})});
const page=createV10LifeRunner({contentLoader:loader});
const legacy=JSON.parse(fs.readFileSync(new URL('test/fixtures/v10-closure/legacy-snapshots.json',root),'utf8'));
function advance(life,n){for(let i=0;i<n;i++){assert.equal(life.phase,'ready');const result=life.step();assert.equal(result.error,null,JSON.stringify(result.error));}return life;}
async function prefix(n=90,runner=page){return advance(await runner.start('douluo1',{seed:'ascension-directed-3',route:'human'}),n);}
function memoryStore(runner=page){const data=new Map([['old-v05','owner fixture']]);const storage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};return {data,store:createV10SaveStore({contentLoader:loader,runner,storage:()=>storage})};}

test('second-tier data matches the source builders; first reward retains the genuine prefix and soul-bone continuation',async()=>{
 const checked=JSON.parse(execFileSync(process.execPath,['tools/v10/audit-ascension-reachability.mjs','--check-god-trial-source'],{cwd:root,encoding:'utf8'}));assert.equal(checked.sourceMatch,true);
 const life=await prefix(),expected=structuredClone(legacy.continuation.final.session);
 // This life first missed the same pool at real commit 89; only the declared /5 marker differs.
 expected.character.flags['v10:independent-ascension:last-attempt-age']=17;
 const ageTransaction={reason:'v10-source-custom-handler',referenceId:'douluo1:flow.formal-story.1209bb56-d533-48af-b012-204292b96f68:douluo1:handler.formal-story.result',idempotencyKey:'v10-source:douluo1:89:a3e30b:2:0:setFlag',type:'setFlag'};
 const at=expected.character.transactions.findIndex(t=>t.idempotencyKey==='spin:douluo1:c9944ade-310d-41eb-b8ea-01723cab952c:907ce8:89:0:changeLevel');assert.ok(at>=0);expected.character.transactions.splice(at,0,ageTransaction);assert.deepEqual(life.session,expected);
 const before=life.exportSnapshot();advance(life,3);const reward=life.session.history.at(-1);assert.equal(reward.poolId,V10_GOD_TRIAL_STAGES[0].poolId);assert.equal(reward.optionId,'d39438');assert.deepEqual(life.session.character.godTrial.completedStages,[1]);assert.equal(life.session.character.godTrial.currentStage,2);assert.ok(life.session.pendingSoulBone);advance(life,1);assert.equal(life.session.pendingSoulBone,null);
 const resumed=await page.start('douluo1',{seed:before.seed,route:'human',snapshot:before});advance(resumed,4);assert.deepEqual(resumed.exportSnapshot(),life.exportSnapshot());
});

test('mechanism fixture: eight page-runner stages agree with source, grant godhood and continue without an ending',async()=>{
 const game=(await loader.getSourceRuntime('douluo1')).game;let life=await prefix();
 for(const stage of V10_GOD_TRIAL_STAGES){
  const fixture=life.exportSnapshot();fixture.session.character.level=Math.max(fixture.session.character.level,stage.minLevel);
  // Explicit mechanism fixture, never used as a genuine life/ascension seed.
  fixture.session.character.soulBones=['head','torso','leftArm','rightArm','leftLeg','rightLeg'].map(partId=>({id:partId,name:partId,partId,years:100000}));
  fixture.session.currentFlowId=stage.stepId;fixture.session.currentPoolId=null;fixture.session.pendingNextStepId=null;fixture.session.awaitingAdvance=false;
  life=await page.start('douluo1',{seed:fixture.seed,route:'human',snapshot:fixture});
  const unchanged=life.exportSnapshot();const wheel=life.wheelView;assert.equal(wheel.status,'ready');assert.ok(wheel.segments.length>0);assert.deepEqual(life.exportSnapshot(),unchanged);
  const result=life.step();assert.equal(result.error,null,JSON.stringify(result.error));assert.equal(result.spin.poolId,stage.poolId);assert.ok(wheel.segments.some(s=>s.optionId===result.spin.optionId));
  const expected=structuredClone(fixture.session);expected.character=projectV10SourceCharacter(expected.character);const pool=V10_GOD_TRIAL_POOLS.find(p=>p.id===stage.poolId);const option=pool.options.find(o=>o.id===result.spin.optionId);
  game.customHandlers.claimHumanGodTrialReward({state:expected,step:{id:stage.stepId,poolId:stage.poolId},option});
  for(const key of ['level','maxLevel','godhood','godhoods','godTrial','domains','traits','artifacts','soulBones','appearanceRank','martialSouls'])assert.deepEqual(life.session.character[key],expected.character[key],stage.stage+': '+key);
  assert.deepEqual(life.session.pendingSoulBone,expected.pendingSoulBone);assert.equal(life.session.character.ending,null);
  let boneSteps=0;while(life.session.pendingSoulBone&&boneSteps++<10){const bone=life.step();assert.equal(bone.error,null,JSON.stringify(bone.error));}assert.equal(life.session.pendingSoulBone,null);
 }
 assert.equal(life.session.character.godhood.id,'e7aa95');assert.equal(life.session.character.godhood.tier,'二级');assert.ok(life.session.character.level>=100);assert.equal(life.phase,'ready');
 const trial=life.session.character.godTrial??life.session.character.godTrials.at(-1);assert.deepEqual(trial.claimedRewardStages,[1,2,3,4,5,6,7,8]);
 const duplicate=structuredClone(life.session);const original=structuredClone(duplicate);const stage=V10_GOD_TRIAL_STAGES.at(-1),pool=V10_GOD_TRIAL_POOLS.at(-1);assert.throws(()=>game.customHandlers.claimHumanGodTrialReward({state:duplicate,step:{poolId:stage.poolId},option:pool.options[0]}));assert.deepEqual(duplicate,original);
 const saved=life.exportSnapshot();const restored=await page.start('douluo1',{seed:saved.seed,route:'human',snapshot:saved});advance(life,1);advance(restored,1);assert.deepEqual(restored.exportSnapshot(),life.exportSnapshot());assert.equal(life.session.character.ending,null);
});

test('reward failure rolls back the entire step including source direct mutation and RNG',async()=>{
 const faulty={...loader,getSourceRuntime:async id=>{const source=await loader.getSourceRuntime(id);if(id!=='douluo1')return source;return {...source,game:{...source.game,customHandlers:{...source.game.customHandlers,claimHumanGodTrialReward(context){source.game.customHandlers.claimHumanGodTrialReward(context);context.applyEffects([{type:'unknown-god-trial-effect'}]);}}}};}};
 const faultyPage=createV10LifeRunner({contentLoader:faulty});const life=await prefix(92,faultyPage);const before=life.exportSnapshot();const result=life.step();assert.equal(result.committed,false);assert.equal(result.error.code,'UNSUPPORTED_APK_EFFECT');assert.deepEqual(life.exportSnapshot(),before);
});

test('unknown requirements remain unknown and a missing source handler is a typed rejection',async()=>{
 assert.equal(evaluateV10GodTrialRequirement({type:'unknown-requirement'},{},()=>({status:'unknown'})).status,'unknown');
 const conditionLoader={...loader,getHumanRuntimeContent:async()=>{const loaded=structuredClone(await loader.getHumanRuntimeContent());const pack=loaded.routeGraph.packs[0];const flow=pack.flows.find(f=>f.id===pack.entryFlowId);const pool=pack.pools.find(p=>p.id===flow.route.pool.value);for(const option of pool.options){option.route.requirements=[{type:'unknown-god-trial-condition'}];option.source.requirements=[{type:'unknown-god-trial-condition'}];}return loaded;}};
 const conditionLife=await createV10LifeRunner({contentLoader:conditionLoader}).start('douluo1',{seed:'unknown-condition-fixture',route:'human'});const conditionBefore=conditionLife.exportSnapshot();const conditionResult=conditionLife.step();assert.equal(conditionResult.committed,false);assert.equal(conditionResult.error.code,'APK_POOL_HAS_NO_ELIGIBLE_OPTIONS');assert.deepEqual(conditionLife.exportSnapshot(),conditionBefore);
 const absent={...loader,getSourceRuntime:async id=>{const source=await loader.getSourceRuntime(id);const handlers={...source.game.customHandlers};delete handlers.claimHumanGodTrialReward;return {...source,game:{...source.game,customHandlers:handlers}};}};
 await assert.rejects(createV10LifeRunner({contentLoader:absent}).start('douluo1',{seed:'ascension-directed-3',route:'human'}),{code:'V10_GOD_TRIAL_SOURCE_MISSING'});
});

test('in-memory eight slots preserve source reward replay and reject legacy semantics atomically',async()=>{
 const {data,store}=memoryStore();const life=await prefix();const strings=[];for(let slot=1;slot<=8;slot++){const text=await store.serialize(life);strings.push(text);await store.write(slot,text);advance(life,1);}assert.equal(new Set(strings).size,8);
 for(let slot=1;slot<=8;slot++){assert.equal(await store.exportSlot(slot),strings[slot-1]);const restored=await store.read(slot);const envelope=JSON.parse(strings[slot-1]);assert.deepEqual(restored.exportSnapshot(),envelope.snapshot);}
 const before=[...data],active=life.exportSnapshot();const legacySnapshot=legacy.continuation.final;await assert.rejects(page.start('douluo1',{seed:legacySnapshot.seed,route:'human',snapshot:legacySnapshot}),{code:'V10_SNAPSHOT_SEMANTICS_CHANGED'});
 const graph=await loader.getRouteGraph('douluo1'),human=await loader.getHumanRuntimeContent();const bytes=new TextEncoder().encode(JSON.stringify(['v10-local-save/1.0',graph,human]));const digest=await crypto.subtle.digest('SHA-256',bytes);const oldIdentity=Buffer.from(digest).toString('hex');
 const oldText=JSON.stringify({schemaVersion:'v10-local-save/1.0',packId:'douluo1',contentIdentity:oldIdentity,snapshot:legacySnapshot});await assert.rejects(store.write(1,oldText,{expected:strings[0],overwrite:true}),{code:'SAVE_CONTENT_MISMATCH'});
 const bad=JSON.parse(strings[0]);delete bad.snapshot.runtimeSemantics;await assert.rejects(store.write(1,JSON.stringify(bad),{expected:strings[0],overwrite:true}),{code:'V10_SNAPSHOT_SEMANTICS_CHANGED'});
 await assert.rejects(store.write(1,strings[1],{expected:strings[0]}),{code:'SAVE_OVERWRITE_REQUIRED'});assert.deepEqual([...data],before);assert.deepEqual(life.exportSnapshot(),active);assert.equal(data.get('old-v05'),'owner fixture');
 await store.write(1,strings[1],{expected:strings[0],overwrite:true});assert.equal(data.get(SAVE_PREFIX+1),strings[1]);for(let slot=2;slot<=8;slot++)assert.equal(data.get(SAVE_PREFIX+slot),strings[slot-1]);
 assert.equal(JSON.parse(strings[0]).snapshot.runtimeSemantics,V10_GOD_TRIAL_SEMANTICS);
});

test('opportunity correction matches the source once, restores, rejects drift atomically and rejects /1 saves',async()=>{
 const seed='god-trial-tail-20261001-002',poolId='a7f4d0a4-734d-4b16-9a1d-53ae2fb55497',optionId='cf6cc4',key='formal:god-trial-draws';
 const counter={type:'changeCounter',key,amount:1};
 const life=advance(await page.start('douluo1',{seed,route:'human'}),121),before=life.exportSnapshot();
 const old=legacy.secondTierTailSearch.lives.find(l=>l.seed===seed);
 const oldState=structuredClone(old.initial.session);
 const events=fs.readFileSync(new URL('test/fixtures/v10-closure/legacy-replay.jsonl',root),'utf8').trimEnd().split('\n').map(JSON.parse).filter(e=>e.runId==='V10-SECOND-TIER-TAIL-20261001'&&e.seed===seed&&e.inputIndex<122);
 for(const event of events)for(const change of event.changes){let parent=oldState;for(const p of change.path.slice(0,-1))parent=parent[p];const p=change.path.at(-1);if(change.op==='set')parent[p]=structuredClone(change.value);else if(change.op==='delete')delete parent[p];else parent[p].push(...structuredClone(change.value));}
 assert.deepEqual(before.session,oldState);
 const source=(await loader.getSourceRuntime('douluo1')).game,option=source.pools.find(p=>p.id===poolId).options.find(o=>o.id===optionId);
 const sourceEngine=await import('../data/v10/source-runtime/App-qyLEl8t4.js');
 const expected=structuredClone(before.session);expected.character=projectV10SourceCharacter(expected.character);const emitted=[];
 source.customHandlers[option.customHandler]({pack:source,state:expected,step:source.flows['douluo1:flow.special.'+poolId],option,applyEffects(effects){emitted.push(...structuredClone(effects));sourceEngine.a(expected.character,effects.filter(e=>e.type!=='addLog'));}});
 assert.deepEqual(emitted.filter(e=>e.key===key),[counter]);assert.equal(expected.character.flags[key],1);
 const result=life.step();assert.equal(result.error,null);assert.equal(result.spin.optionId,optionId);assert.equal(life.session.character.flags[key],expected.character.flags[key]);
 assert.equal(life.session.character.transactions.filter(t=>t.referenceId?.includes(optionId)&&t.type==='changeCounter').length,1);
 assert.equal(life.session.random.cursor,122);
 const restored=await page.start('douluo1',{seed,route:'human',snapshot:before});advance(restored,1);assert.deepEqual(restored.exportSnapshot(),life.exportSnapshot());
 const after=life.exportSnapshot(),resumed=await page.start('douluo1',{seed,route:'human',snapshot:after});advance(life,1);advance(resumed,1);assert.deepEqual(resumed.exportSnapshot(),life.exportSnapshot());assert.ok(life.session.character.godTrial);
 // Content variants are explicit mechanism fixtures, never genuine source or life evidence.
 const variant=modify=>({...loader,getHumanRuntimeContent:async()=>{const content=structuredClone(await loader.getHumanRuntimeContent());const route=content.routeGraph.packs[0].pools.find(p=>p.id===poolId).options.find(o=>o.id===optionId);const rule=content.formalSpecialResultEvidence.records.find(r=>r.poolId===poolId&&r.optionId===optionId);modify(route,rule);return content;}});
 const duplicatePage=createV10LifeRunner({contentLoader:variant((_route,rule)=>rule.effects.push(counter))});
 const duplicate=await duplicatePage.start('douluo1',{seed,route:'human',snapshot:before});advance(duplicate,1);assert.equal(duplicate.session.character.flags[key],1);
 for(const [modify,code] of [
  [(route)=>{route.route.effects=[];route.source.effects=[];},'V10_GOD_TRIAL_OPPORTUNITY_SOURCE_DRIFT'],
  [(_route,rule)=>rule.effects.push(counter,{type:'unknown-opportunity-effect'}),'UNSUPPORTED_APK_EFFECT']
 ]){
  const fixture=await createV10LifeRunner({contentLoader:variant(modify)}).start('douluo1',{seed,route:'human',snapshot:before});const untouched=fixture.exportSnapshot();const rejected=fixture.step();assert.equal(rejected.committed,false);assert.equal(rejected.error.code,code);assert.deepEqual(fixture.exportSnapshot(),untouched);
 }
 assert.equal(old.final.runtimeSemantics,'douluo1:second-tier-god-trial/1');
 await assert.rejects(page.start('douluo1',{seed,route:'human',snapshot:old.final}),{code:'V10_SNAPSHOT_SEMANTICS_CHANGED'});
 const graph=await loader.getRouteGraph('douluo1'),human=await loader.getHumanRuntimeContent();
 const oldContent=V10_GOD_TRIAL_CONTENT.replace(V10_GOD_TRIAL_SEMANTICS,'douluo1:second-tier-god-trial/1');
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(['v10-local-save/1.0',graph,human,oldContent])));
 const oldEnvelope=JSON.stringify({schemaVersion:'v10-local-save/1.0',packId:'douluo1',contentIdentity:Buffer.from(digest).toString('hex'),snapshot:old.final});
 const {data,store}=memoryStore(),strings=[...data];await assert.rejects(store.write(1,oldEnvelope),{code:'SAVE_CONTENT_MISMATCH'});assert.deepEqual([...data],strings);
});


test('mechanism fixture: the 91–99 opportunity matches source once, restores and rejects drift and /2 saves',async()=>{
 const seed='ascension-closure-20260930-002',poolId='cb923c96-7fa3-474b-8c37-8e530d0a8e26',optionId='49adbc',key='formal:god-trial-draws';
 const counter={type:'changeCounter',key,amount:1};
 const original=advance(await page.start('douluo1',{seed,route:'human'}),163),before=original.exportSnapshot();
 // The real prefix enters this pool; selecting the rare option below is a content fixture, not genuine evidence.
 assert.equal(original.session.history.at(-1).poolId,'941e1495-bcf8-4d4a-8b2e-70ef942422c4');assert.equal(original.session.history.at(-1).optionId,'0258c9');
 const source=(await loader.getSourceRuntime('douluo1')).game,option=source.pools.find(p=>p.id===poolId).options.find(o=>o.id===optionId);
 const expected=structuredClone(before.session);expected.character=projectV10SourceCharacter(expected.character);const emitted=[];
 const engine=await import('../data/v10/source-runtime/App-qyLEl8t4.js');
 source.customHandlers[option.customHandler]({pack:source,state:expected,step:source.flows['douluo1:flow.special.'+poolId],option,applyEffects(effects){emitted.push(...structuredClone(effects));engine.a(expected.character,effects.filter(e=>e.type!=='addLog'));}});
 assert.deepEqual(emitted.filter(e=>e.key===key),[counter]);assert.equal(expected.character.flags[key],1);
 const variant=modify=>({...loader,getHumanRuntimeContent:async()=>{const c=structuredClone(await loader.getHumanRuntimeContent());const pool=c.routeGraph.packs[0].pools.find(p=>p.id===poolId);for(const o of pool.options){o.source.weight=o.id===optionId?1:0;}const route=pool.options.find(o=>o.id===optionId),rule=c.formalSpecialResultEvidence.records.find(r=>r.poolId===poolId&&r.optionId===optionId);modify(route,rule);return c;}});
 const fixedPage=createV10LifeRunner({contentLoader:variant(()=>{})});const life=await fixedPage.start('douluo1',{seed,route:'human',snapshot:before});
 const outcome=life.step();assert.equal(outcome.error,null);assert.equal(outcome.spin.optionId,optionId);assert.equal(life.session.character.flags[key],expected.character.flags[key]);
 assert.equal(life.session.character.transactions.filter(t=>t.referenceId?.includes(optionId)&&t.type==='changeCounter').length,1);
 assert.equal(life.session.random.cursor,164);assert.equal(life.session.character.godhood,null);assert.equal(life.session.character.ending,null);
 const restored=await fixedPage.start('douluo1',{seed,route:'human',snapshot:before});advance(restored,1);assert.deepEqual(restored.exportSnapshot(),life.exportSnapshot());
 const after=life.exportSnapshot(),resumed=await fixedPage.start('douluo1',{seed,route:'human',snapshot:after});advance(life,1);advance(resumed,1);assert.deepEqual(resumed.exportSnapshot(),life.exportSnapshot());assert.equal(life.session.character.flags[key],0);assert.ok(life.session.character.godTrial);
 const dupPage=createV10LifeRunner({contentLoader:variant((_route,rule)=>rule.effects.push(counter))});const dup=await dupPage.start('douluo1',{seed,route:'human',snapshot:before});advance(dup,1);assert.equal(dup.session.character.flags[key],1);
 for(const [modify,code] of [
  [(route)=>{route.route.effects=[];route.source.effects=[];},'V10_GOD_TRIAL_OPPORTUNITY_SOURCE_DRIFT'],
  [(_route,rule)=>rule.effects.push(counter,counter),'V10_GOD_TRIAL_OPPORTUNITY_MAPPING_DRIFT'],
  [(_route,rule)=>rule.effects.push(counter,{type:'unknown-opportunity-effect'}),'UNSUPPORTED_APK_EFFECT']
 ]){const fixture=await createV10LifeRunner({contentLoader:variant(modify)}).start('douluo1',{seed,route:'human',snapshot:before});const untouched=fixture.exportSnapshot();const rejected=fixture.step();assert.equal(rejected.committed,false);assert.equal(rejected.error.code,code);assert.deepEqual(fixture.exportSnapshot(),untouched);}
 assert.deepEqual(original.exportSnapshot(),before);
 const old=legacy.lateLevelGodhoodWindow.lives[0].final;assert.equal(old.runtimeSemantics,'douluo1:second-tier-god-trial/2');await assert.rejects(page.start('douluo1',{seed,route:'human',snapshot:old}),{code:'V10_SNAPSHOT_SEMANTICS_CHANGED'});
 const graph=await loader.getRouteGraph('douluo1'),human=await loader.getHumanRuntimeContent();const oldContent=V10_GOD_TRIAL_CONTENT.replace(V10_GOD_TRIAL_SEMANTICS,'douluo1:second-tier-god-trial/2');
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(['v10-local-save/1.0',graph,human,oldContent])));
 const envelope=JSON.stringify({schemaVersion:'v10-local-save/1.0',packId:'douluo1',contentIdentity:Buffer.from(digest).toString('hex'),snapshot:old});
 const {data,store}=memoryStore();const strings=[...data];await assert.rejects(store.write(1,envelope),{code:'SAVE_CONTENT_MISMATCH'});assert.deepEqual([...data],strings);
});


test('recorded /3 sessions match fresh /5 and current snapshots resume identically',async()=>{
 const run=legacy.lateOpportunityRepair;assert.ok(run);const trace=run.lives[0];assert.equal(trace.initial.runtimeSemantics,'douluo1:second-tier-god-trial/3');await assert.rejects(page.start('douluo1',{seed:trace.seed,route:'human',snapshot:trace.initial}),{code:'V10_SNAPSHOT_SEMANTICS_CHANGED'});
 const events=fs.readFileSync(new URL('test/fixtures/v10-closure/legacy-replay.jsonl',root),'utf8').trim().split('\n').map(JSON.parse).filter(e=>e.runId===run.runId);
 function recorded(n){const snapshot=structuredClone(trace.initial);for(const e of events.filter(e=>e.inputIndex<=n))for(const d of e.changes){let o=snapshot.session;for(const k of d.path.slice(0,-1))o=o[k];const k=d.path.at(-1);if(d.op==='set')o[k]=structuredClone(d.value);else if(d.op==='delete')delete o[k];else o[k].push(...structuredClone(d.value));}return snapshot;}
 const current=await page.start('douluo1',{seed:trace.seed,route:'human'});for(const n of [216,217,228]){advance(current,n-current.session.history.length);assert.deepEqual(current.session,recorded(n).session);const saved=current.exportSnapshot(),resumed=await page.start('douluo1',{seed:trace.seed,route:'human',snapshot:saved});advance(current,1);advance(resumed,1);assert.deepEqual(resumed.exportSnapshot(),current.exportSnapshot());assert.deepEqual(current.session,recorded(n+1).session);}
 assert.equal(recorded(216).session.character.flags['formal:god-trial-draws']??0,0);assert.equal(recorded(217).session.character.flags['formal:god-trial-draws'],1);assert.equal(recorded(218).session.character.flags['formal:god-trial-draws'],0);
 const final=recorded(229).session.character;assert.equal(final.godTrial.status,'failed');assert.equal(final.godhood,null);assert.equal(final.ending,null);assert.equal(final.soulBones.some(b=>b.partId==='leftArm'),false);
});


test('real six-bone prefix: low-level opportunity matches source once, restores, rolls back drift and rejects /3',async()=>{
 const seed='ascension-closure-20260930-008',poolId='dab03114-3b0a-416a-a2a2-4a1e57af0157',optionId='c77382',key='formal:god-trial-draws',counter={type:'changeCounter',key,amount:1};
 const life=advance(await page.start('douluo1',{seed,route:'human'}),242),before=life.exportSnapshot();const source=(await loader.getSourceRuntime('douluo1')).game,option=source.pools.find(p=>p.id===poolId).options.find(o=>o.id===optionId),expected=structuredClone(before.session),emitted=[];
 expected.character=projectV10SourceCharacter(expected.character);const engine=await import('../data/v10/source-runtime/App-qyLEl8t4.js');assert.equal(engine.n(expected.character),true);
 source.customHandlers[option.customHandler]({pack:source,state:expected,step:source.flows['douluo1:flow.special.'+poolId],option,applyEffects(effects){emitted.push(...structuredClone(effects));engine.a(expected.character,effects.filter(e=>e.type!=='addLog'));}});assert.deepEqual(emitted.filter(e=>e.key===key),[counter]);
 const result=life.step();assert.equal(result.error,null);assert.equal(result.spin.optionId,optionId);assert.equal(life.session.character.flags[key],1);assert.equal(life.session.character.transactions.filter(t=>t.referenceId?.includes(optionId)&&t.type==='changeCounter').length,1);
 const restored=await page.start('douluo1',{seed,route:'human',snapshot:before});advance(restored,1);assert.deepEqual(restored.exportSnapshot(),life.exportSnapshot());
 const after=life.exportSnapshot(),resumed=await page.start('douluo1',{seed,route:'human',snapshot:after});advance(life,1);advance(resumed,1);assert.deepEqual(resumed.exportSnapshot(),life.exportSnapshot());assert.equal(life.session.character.flags[key],0);assert.ok(life.session.character.godTrial);
 const variant=modify=>({...loader,getHumanRuntimeContent:async()=>{const c=structuredClone(await loader.getHumanRuntimeContent()),route=c.routeGraph.packs[0].pools.find(p=>p.id===poolId).options.find(o=>o.id===optionId),rule=c.formalSpecialResultEvidence.records.find(r=>r.poolId===poolId&&r.optionId===optionId);modify(route,rule);return c;}});
 const dup=await createV10LifeRunner({contentLoader:variant((_route,rule)=>rule.effects.push(counter))}).start('douluo1',{seed,route:'human',snapshot:before});advance(dup,1);assert.equal(dup.session.character.flags[key],1);
 for(const [modify,code] of [[route=>{route.route.effects=[];route.source.effects=[];},'V10_GOD_TRIAL_OPPORTUNITY_SOURCE_DRIFT'],[(_route,rule)=>rule.effects.push(counter,counter),'V10_GOD_TRIAL_OPPORTUNITY_MAPPING_DRIFT'],[(_route,rule)=>rule.effects.push(counter,{type:'unknown-opportunity-effect'}),'UNSUPPORTED_APK_EFFECT']]){const fixture=await createV10LifeRunner({contentLoader:variant(modify)}).start('douluo1',{seed,route:'human',snapshot:before}),saved=fixture.exportSnapshot(),rejected=fixture.step();assert.equal(rejected.committed,false);assert.equal(rejected.error.code,code);assert.deepEqual(fixture.exportSnapshot(),saved);}
 const old=legacy.sixBoneContinuation.lives[0].final;assert.equal(old.runtimeSemantics,'douluo1:second-tier-god-trial/3');await assert.rejects(page.start('douluo1',{seed,route:'human',snapshot:old}),{code:'V10_SNAPSHOT_SEMANTICS_CHANGED'});
 const graph=await loader.getRouteGraph('douluo1'),human=await loader.getHumanRuntimeContent(),oldContent=V10_GOD_TRIAL_CONTENT.replace(V10_GOD_TRIAL_SEMANTICS,'douluo1:second-tier-god-trial/3'),digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(['v10-local-save/1.0',graph,human,oldContent]))),envelope=JSON.stringify({schemaVersion:'v10-local-save/1.0',packId:'douluo1',contentIdentity:Buffer.from(digest).toString('hex'),snapshot:old});const {data,store}=memoryStore(),unchanged=[...data];await assert.rejects(store.write(1,envelope),{code:'SAVE_CONTENT_MISMATCH'});assert.deepEqual([...data],unchanged);
});


test('633 opportunity: original source emits one counter; /5 commits once, restores, rejects drift and /4 saves', async () => {
 const seed='ascension-directed-633',poolId='9aed9e67-028b-428c-89fa-52bf3c0e9970',optionId='eed09e',key='formal:god-trial-draws',counter={type:'changeCounter',key,amount:1};
 const life=advance(await page.start('douluo1',{seed,route:'human'}),156),before=life.exportSnapshot();
 const source=(await loader.getSourceRuntime('douluo1')).game,option=source.pools.find(p=>p.id===poolId).options.find(o=>o.id===optionId);
 const expected=structuredClone(before.session);expected.character=projectV10SourceCharacter(expected.character);const engine=await import('../data/v10/source-runtime/App-qyLEl8t4.js'),emitted=[];
 source.customHandlers[option.customHandler]({pack:source,state:expected,step:source.flows['douluo1:flow.special.'+poolId],option,applyEffects(effects){emitted.push(...structuredClone(effects));engine.a(expected.character,effects.filter(e=>e.type!=='addLog'));}});
 assert.deepEqual(emitted.filter(e=>e.key===key),[counter]);assert.equal(before.session.character.level,99);
 const result=life.step();assert.equal(result.error,null);assert.equal(result.spin.optionId,optionId);assert.equal(life.session.character.flags[key],expected.character.flags[key]);assert.equal(life.session.character.transactions.filter(t=>t.referenceId?.includes(optionId)&&t.type==='changeCounter').length,1);
 const restored=await page.start('douluo1',{seed,route:'human',snapshot:before});advance(restored,1);assert.deepEqual(restored.exportSnapshot(),life.exportSnapshot());
 const variant=modify=>({...loader,getHumanRuntimeContent:async()=>{const c=structuredClone(await loader.getHumanRuntimeContent()),route=c.routeGraph.packs[0].pools.find(p=>p.id===poolId).options.find(o=>o.id===optionId),rule=c.formalSpecialResultEvidence.records.find(r=>r.poolId===poolId&&r.optionId===optionId);modify(route,rule);return c;}});
 const dup=await createV10LifeRunner({contentLoader:variant((_route,rule)=>rule.effects.push(counter))}).start('douluo1',{seed,route:'human',snapshot:before});advance(dup,1);assert.equal(dup.session.character.flags[key],1);
 for(const [modify,code] of [[route=>{route.route.effects=[];route.source.effects=[];},'V10_GOD_TRIAL_OPPORTUNITY_SOURCE_DRIFT'],[(_route,rule)=>rule.effects.push(counter,counter),'V10_GOD_TRIAL_OPPORTUNITY_MAPPING_DRIFT'],[(_route,rule)=>rule.effects.push(counter,{type:'unknown-opportunity-effect'}),'UNSUPPORTED_APK_EFFECT']]){const fixture=await createV10LifeRunner({contentLoader:variant(modify)}).start('douluo1',{seed,route:'human',snapshot:before}),saved=fixture.exportSnapshot(),rejected=fixture.step();assert.equal(rejected.error.code,code);assert.deepEqual(fixture.exportSnapshot(),saved);}
 const old=legacy.highSixBoneGodhoodWindow.lives[0].final;assert.equal(old.runtimeSemantics,'douluo1:second-tier-god-trial/4');await assert.rejects(page.start('douluo1',{seed,route:'human',snapshot:old}),{code:'V10_SNAPSHOT_SEMANTICS_CHANGED'});
 const graph=await loader.getRouteGraph('douluo1'),human=await loader.getHumanRuntimeContent(),oldContent=V10_GOD_TRIAL_CONTENT.replace(V10_GOD_TRIAL_SEMANTICS,'douluo1:second-tier-god-trial/4'),digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(['v10-local-save/1.0',graph,human,oldContent]))),envelope=JSON.stringify({schemaVersion:'v10-local-save/1.0',packId:'douluo1',contentIdentity:Buffer.from(digest).toString('hex'),snapshot:old});const {data,store}=memoryStore(),unchanged=[...data];await assert.rejects(store.write(1,envelope),{code:'SAVE_CONTENT_MISMATCH'});assert.deepEqual([...data],unchanged);
});
