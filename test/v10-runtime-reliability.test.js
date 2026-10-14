import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import {runner,loader} from '../tools/v10/audit-runtime-reliability.mjs';
import {createV10SaveStore,SAVE_PREFIX} from '../js/v10-save-store.js';
import {createApkRouteContentIndex,createApkRouteRequirementEvaluator} from '../js/apk-route-runtime.js';
import {applyApkEffects,selectApkPoolOptions,drawApkPool} from '../js/apk-rule-runtime.js';
import {V10_GOD_TRIAL_SEMANTICS} from '../js/v10-god-trial-runtime.js';

const seed='transformed-trial-20261012-17';
// Captured from the unmodified candidate, before the failing 96th call.
// Mechanism-only rebase of the preserved pre-tribulation state into the new rules.
// Production /7 saves remain strictly rejected; the historical evidence is untouched.
const fixture=JSON.parse(fs.readFileSync(new URL('../docs/evidence/runtime-reliability-20261012/element-before.json',import.meta.url),'utf8')).snapshot;
fixture.runtimeSemantics=V10_GOD_TRIAL_SEMANTICS;
const prefix=Promise.resolve(fixture);
const start=snapshot=>runner.start('douluo1',{seed:snapshot.seed,route:snapshot.route,snapshot});

test('natural tribulation bonus settles once, retains legal elements, and restores deterministically',async()=>{
    const before=await prefix, life=await start(before);
    const previous=before.session.character.beast.attributeStages['雷'];
    const result=life.step();assert.equal(result.error,null);
    assert.equal(result.spin.optionId,'421431');
    assert.equal(life.session.character.beast.attributeStages['雷'],previous+1);
    assert.equal(life.session.history.length,96);assert.equal(life.session.random.cursor,96);
    assert.equal(life.session.character.ending,null);
    assert.equal(life.session.character.beast.tribulationsPassed.filter(v=>v===300000).length,1);
    const memory=new Map(),store=createV10SaveStore({contentLoader:loader,runner,storage:()=>({getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v)})});
    await store.write(1,await store.serialize(life));const restored=await store.read(1);
    assert.deepEqual(restored.exportSnapshot(),life.exportSnapshot());
    for(let i=0;i<60&&life.phase==='ready';i++){const a=restored.step(),b=life.step();assert.equal(a.error,null);assert.equal(b.error,null);assert.deepEqual(restored.exportSnapshot(),life.exportSnapshot())}
    assert.ok(life.session.history.length>96);
    assert.equal(memory.has(SAVE_PREFIX+'1'),true);
});

test('completed tribulation element rerolls before settlement; legal alternatives and exhaustion stay explicit',async()=>{
    const loaded=await loader.getHumanRuntimeContent(),index=createApkRouteContentIndex(loaded);
    const character=structuredClone((await prefix).session.character);
    const poolId='5d6a4b01-90a2-49fa-ad43-bf97cde910b9';
    const evaluator=createApkRouteRequirementEvaluator({contentIndex:index});
    const options=()=>selectApkPoolOptions(index,character,poolId,{requirementEvaluator:evaluator}).options;
    assert.ok(options().some(o=>o.normalized.option_id==='421431'));
    character.beast.attributeStages['雷']=4;
    assert.equal(options().some(o=>o.normalized.option_id==='421431'),false);
    assert.ok(options().length>0);
    const before=structuredClone(character);
    assert.throws(()=>applyApkEffects(character,[{type:'advanceBeastElement',elementId:'雷'}]),e=>e.code==='APK_BEAST_ELEMENT_ALREADY_COMPLETE');
    assert.deepEqual(character,before);
    const snapshot=structuredClone(await prefix);
    snapshot.session.character=character;
    snapshot.session.currentFlowId='douluo1:flow.official-beast.pool.'+poolId;
    snapshot.session.currentPoolId=null;snapshot.session.awaitingAdvance=false;snapshot.session.pendingNextStepId=null;
    const game=(await loader.getSourceRuntime('douluo1')).game;
    const pool=game.pools.find(p=>p.id===poolId),previous=pool.options.map(o=>o.weight);
    // Explicit mechanism-only exhaustion: no production weights are changed.
    const isolated=structuredClone(loaded);
    const target=isolated.routeGraph.packs.find(p=>p.id==='douluo1').pools.find(p=>p.id===poolId);
    for(const option of target.options){option.source.enabled=false}
    const emptyIndex=createApkRouteContentIndex(isolated);
    assert.equal(selectApkPoolOptions(emptyIndex,character,poolId,{requirementEvaluator:evaluator}).options.length,0);
    const random={seed:'empty-element-fixture',cursor:95,algorithm:'pcg32-counter-v1'};
    assert.throws(()=>drawApkPool({contentIndex:emptyIndex,character,poolId,random,requirementEvaluator:evaluator}),e=>e.code==='APK_POOL_HAS_NO_ELIGIBLE_OPTIONS');
    assert.equal(random.cursor,95);
    assert.deepEqual(pool.options.map(o=>o.weight),previous);
    const replay=await start(snapshot);const value=replay.step();assert.equal(value.error,null);assert.notEqual(value.spin?.optionId,'421431');
    assert.equal(replay.session.character.beast.attributeStages['雷'],4);
});

test('fresh natural seed ends by source rules without the historic double reward or interruption',async()=>{
    const life=await runner.start('douluo1',{seed,route:'beast'});
    for(let i=0;i<150&&life.phase==='ready';i++)assert.equal(life.step().error,null);
    assert.equal(life.phase,'completed');assert.equal(life.session.character.ending.kind,'death');
});

test('source settlement failure rolls back reward, threshold, history and random input; retry after restore matches',async()=>{
    const snapshot=await prefix,game=(await loader.getSourceRuntime('douluo1')).game;
    const key='douluo1:handler.official-beast.tribulation', original=game.customHandlers[key];
    const life=await start(snapshot),before=life.exportSnapshot();
    try{game.customHandlers[key]=ctx=>{original(ctx);throw Object.assign(new Error('injected after settlement'),{code:'RELIABILITY_INJECTED'})};
        assert.equal(life.step().error.code,'RELIABILITY_INJECTED');assert.deepEqual(life.exportSnapshot(),before);
    }finally{game.customHandlers[key]=original}
    const a=await start(life.exportSnapshot()),b=await start(before);assert.deepEqual(a.step(),b.step());assert.deepEqual(a.exportSnapshot(),b.exportSnapshot());
});

const exhaustedText=fs.readFileSync(new URL('../docs/evidence/natural-sea-20261014/natural-sea-20261014-beast-004-interrupted.json',import.meta.url),'utf8');

test('natural exhausted bone pool restores as a saveable boundary without losing the pending reward or history',async()=>{
    const snapshot=JSON.parse(exhaustedText).snapshot,life=await start(snapshot);
    assert.equal(life.phase,'boundary');assert.equal(life.error.code,'APK_POOL_HAS_NO_ELIGIBLE_OPTIONS');
    assert.deepEqual(life.exportSnapshot(),snapshot);
    assert.equal(life.wheelView.status,'boundary');assert.deepEqual(life.wheelView.segments,[]);
    assert.equal(life.wheelView.recentResult.optionId,'2b818c');
    assert.equal(life.session.character.ending,null);assert.equal(life.session.pendingSoulBone.years,50);
    const data=new Map([['owner','untouched']]);
    const store=createV10SaveStore({contentLoader:loader,runner,storage:()=>({getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)})});
    assert.equal(await store.serialize(life),exhaustedText);
    await store.write(1,exhaustedText);
    const restored=await store.read(1);
    assert.equal(restored.phase,'boundary');assert.deepEqual(restored.exportSnapshot(),snapshot);
    for(const result of [restored.step(),await restored.advanceToNextAge(),await restored.runToTerminal({maxSteps:3})]) {
        assert.equal(result.blocked,true);assert.equal(result.committed,false);
    }
    assert.deepEqual(restored.exportSnapshot(),snapshot);
    assert.equal(await store.serialize(restored),exhaustedText);
    assert.equal(await store.exportSlot(1),exhaustedText);assert.equal(data.get('owner'),'untouched');
});

test('one legal bone slot resumes normally while exhausted-state recovery still rejects incompatible and missing-flow saves',async()=>{
    // Explicit mechanism counterexample: the historical natural snapshot is not edited.
    const snapshot=JSON.parse(exhaustedText).snapshot;
    const bones=snapshot.session.character.soulBones;
    bones.splice(bones.findIndex(b=>b.partId==='external'),1);
    const life=await start(snapshot),before=life.exportSnapshot();
    assert.equal(life.phase,'ready');assert.equal(life.wheelView.segments.length,1);
    assert.equal(life.wheelView.segments[0].optionId,'9a5039');
    const replay=await start(before);assert.equal(life.step().committed,true);assert.equal(replay.step().committed,true);
    assert.deepEqual(life.exportSnapshot(),replay.exportSnapshot());
    assert.equal(life.session.character.soulBones.filter(b=>b.partId==='external').length,100);
    assert.equal(life.session.history.length,before.session.history.length+1);
    assert.equal(life.session.random.cursor,before.session.random.cursor+1);
    const data=new Map([[SAVE_PREFIX+'1',exhaustedText]]);
    const store=createV10SaveStore({contentLoader:loader,runner,storage:()=>({getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)})});
    for(const corrupt of [v=>{v.snapshot.runtimeSemantics='douluo1:god-and-sea-trials/7'},v=>{v.snapshot.session.currentFlowId='missing-bone-flow'}]) {
        const envelope=JSON.parse(exhaustedText);corrupt(envelope);
        await assert.rejects(store.write(1,JSON.stringify(envelope),{expected:exhaustedText,overwrite:true}));
        assert.equal(data.get(SAVE_PREFIX+'1'),exhaustedText);
    }
});
