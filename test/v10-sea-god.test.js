import test from 'node:test';
import assert from 'node:assert/strict';
import {loader,runner} from '../tools/v10/audit-runtime-reliability.mjs';
import {createV10SaveStore,SAVE_PREFIX} from '../js/v10-save-store.js';
import {applyApkEffects,createApkRandom} from '../js/apk-rule-runtime.js';
import {SEA_GOD_STAGES,SEA_GOD_ID,ASURA_ID,SEA_TRIDENT,SEA_DOMAIN,startSeaGod,seaGodMissing,validateSeaGodState,seaGodEligible} from '../js/v10-sea-god-runtime.js';
import {V10_GOD_TRIAL_SEMANTICS,V10_GOD_TRIAL_STAGES} from '../js/v10-god-trial-runtime.js';
const baseline=(async()=>{const life=await runner.start('douluo1',{route:'human',seed:'v10-save-human'});for(let i=0;i<20;i++)assert.equal(life.step().error,null);return life.exportSnapshot()})();
const start=s=>runner.start(s.packId,{route:s.route,seed:s.seed,snapshot:s});
const at=(s,flow)=>Object.assign(s.session,{currentFlowId:flow,currentPoolId:null,pendingNextStepId:null,awaitingAdvance:false});
async function aim(s,id){
    // Bounded seed selection for an explicitly constructed entry state, not a natural-life claim.
    const view=(await start(s)).wheelView,segments=view.segments;let left=0;
    const item=segments.find(o=>o.optionId===id);assert.ok(item,`${id} is eligible`);
    for(const o of segments){if(o.optionId===id)break;left+=o.weight}
    for(let i=0;i<500;i++){const seed='sea-entry-fixture-'+i,random=createApkRandom(seed,s.session.random.cursor),v=random.next()*view.totalWeight;if(v>left&&v<=left+item.weight){s.seed=seed;s.session.random.seed=seed;return s}}
    throw Error('entry mechanism seed budget exhausted');
}
async function fixture({asura=false,level=99}={}){
    const s=structuredClone(await baseline),c=s.session.character;c.level=level;c.maxLevel=Math.max(99,level);c.age=30;
    c.martialSouls[0].rings=Array.from({length:9},()=>({years:10000,name:'测试魂环'}));
    c.soulBones=['head','torso','leftArm','rightArm','leftLeg','rightLeg'].map(partId=>({id:partId,partId,years:30000,name:'测试魂骨'}));
    if(asura)c.godTrial={tier:'神王',tierSelection:{optionId:'48f196',text:'神王考核'},deityId:ASURA_ID,deityName:'修罗神',deitySelection:{optionId:ASURA_ID,text:'修罗神位考核'},trialId:ASURA_ID,status:'active',currentStage:1,totalStages:9,total:9,completed:0,completedStages:[],claimedRewardStages:[],claimedRewardIds:[],startedAtAge:30};
    startSeaGod(s.session,{optionId:'710c23',text:'海神九考'});at(s,SEA_GOD_STAGES[0].id);return s;
}
async function finish(life){for(let i=0;i<50&&!life.awaitingSeaGodChoice;i++){const r=life.step();assert.equal(r.error,null,JSON.stringify(r.error));assert.equal(life.combatPower.status,'ready')}assert.equal(life.awaitingSeaGodChoice,true);return life}

test('owner nine-stage rewards settle independently, preserve Asura, stop for a choice and restore exactly',async()=>{
    const s=await fixture({asura:true}),asura=structuredClone(s.session.character.godTrial),life=await start(s);
    // Run each explicit reward flow to isolate it from the eligible Asura scheduler.
    for(const stage of SEA_GOD_STAGES){
        const snap=life.exportSnapshot();at(snap,stage.id);const step=await start(snap),before=step.exportSnapshot();
        assert.equal(step.wheelView.title,`海神独立九考 · 第${stage.stage}考`);
        assert.equal(step.step().error,null);const c=step.session.character;
        assert.deepEqual(c.godTrial,asura);assert.equal(c.seaTrial.claimedRewardStages.length,stage.stage);
        if(stage.stage===3)assert.equal(step.session.pendingSoulBone.years,100000);
        if(stage.stage===6)assert.equal(c.domains.filter(d=>d===SEA_DOMAIN).length,1);
        if(stage.stage===7)assert.equal(c.artifacts.find(a=>a.id===SEA_TRIDENT).stage,'embryo');
        if(stage.stage===9){assert.equal(c.godhood.id,SEA_GOD_ID);assert.equal(c.level,100);assert.equal(c.ending,null);assert.equal(step.step().reason,'sea-god-choice')}
        const replay=await start(before);assert.equal(replay.step().error,null);assert.deepEqual(replay.exportSnapshot(),step.exportSnapshot());
        if(stage.stage===3)while(step.session.pendingSoulBone)assert.equal(step.step().error,null);
        Object.assign(life.session,step.exportSnapshot().session);
    }
    assert.deepEqual(life.session.character.seaTrial.claimedRewardStages,[1,2,3,4,5,6,7,8,9]);
    assert.equal(life.session.character.elementProgress['水'],4);
    assert.deepEqual(life.session.character.martialSouls[0].rings.map(r=>r.years),Array(9).fill(25000));
    assert.ok(life.session.character.soulBones.every(b=>[45000,115000].includes(b.years)));
    assert.equal(life.session.character.artifacts.find(a=>a.id===SEA_TRIDENT).stage,'complete');
    assert.equal(life.resolveSeaGodAscension('continue').committed,true);
    for(let i=0;i<40&&life.session.character.godTrial?.status==='active';i++)assert.equal(life.step().error,null);
    const completedAsura=[life.session.character.godTrial,...life.session.character.godTrials].find(t=>t?.deityId===ASURA_ID);
    assert.equal(completedAsura.status,'completed');assert.equal(completedAsura.claimedRewardStages.length,9);
    assert.equal(life.session.character.seaTrial.claimedRewardStages.length,9);
});
test('actual bone follow-up, fast stop, active save/read and direct under-150 ascension are complete',async()=>{
    const life=await start(await fixture());const result=await life.runToTerminal({maxSteps:40});assert.equal(result.reason,'sea-god-choice');
    assert.equal(life.session.pendingSoulBone,null);assert.equal(life.phase,'ready');
    const map=new Map(),store=createV10SaveStore({contentLoader:loader,runner,storage:()=>({getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)})});
    await store.write(1,await store.serialize(life));const replay=await store.read(1);assert.deepEqual(replay.exportSnapshot(),life.exportSnapshot());
    const cursor=replay.session.random.cursor,history=replay.session.history.length;
    assert.equal(replay.resolveSeaGodAscension('ascend').status,'completed');assert.equal(replay.session.character.ending.id,'douluo1:sea-god-ascension');
    assert.equal(replay.session.character.ending.finalStatus,'god');assert.equal(replay.session.random.cursor,cursor);assert.equal(replay.session.history.length,history);
    await store.write(2,await store.serialize(replay));assert.deepEqual((await store.read(2)).exportSnapshot(),replay.exportSnapshot());
});
test('continue keeps godhood, restores progression, permits later ascent and never lowers an Asura level',async()=>{
    const s=await fixture();s.session.character.level=159;s.session.character.godhood={id:ASURA_ID,name:'修罗神',tier:'神王',levelCap:159};s.session.character.godhoods=[structuredClone(s.session.character.godhood)];
    const life=await finish(await start(s));assert.equal(life.session.character.level,159);
    assert.equal(life.resolveSeaGodAscension('continue').committed,true);const snap=life.exportSnapshot();
    assert.equal(life.resolveSeaGodAscension('continue').committed,false);assert.deepEqual(life.exportSnapshot(),snap);
    const replay=await start(snap);assert.equal(life.step().error,null);assert.equal(replay.step().error,null);assert.deepEqual(life.exportSnapshot(),replay.exportSnapshot());
    life.resolveSeaGodAscension('ascend');assert.equal(life.phase,'completed');assert.equal(life.session.character.godhoods.length,2);
});
test('Sea and active Asura finish through the real scheduler with independent ledgers',async()=>{
    const life=await finish(await start(await fixture({asura:true})));
    assert.deepEqual(life.session.character.seaTrial.claimedRewardStages,[1,2,3,4,5,6,7,8,9]);
    const asura=[life.session.character.godTrial,...life.session.character.godTrials].find(t=>t?.deityId===ASURA_ID);
    assert.equal(asura.status,'completed');assert.deepEqual(asura.claimedRewardStages,[1,2,3,4,5,6,7,8,9]);
    assert.deepEqual(new Set(life.session.character.godhoods.map(g=>g.id)),new Set([ASURA_ID,SEA_GOD_ID]));
});
test('missing level, rings, regular bones and unique items wait without death; external bone cannot substitute',async()=>{
    const s=await fixture({level:20});assert.deepEqual(seaGodMissing(s.session.character),['40级（当前20级）']);
    at(s,'humanPlan');const waiting=await start(s),cursor=waiting.session.random.cursor;
    assert.equal(waiting.step().error,null);assert.equal(waiting.session.character.seaTrial.currentStage,1);
    assert.deepEqual(waiting.session.character.seaTrial.claimedRewardStages,[]);assert.equal(waiting.session.character.ending,null);
    assert.equal(waiting.session.random.cursor,cursor+1);
    const c=(await fixture()).session.character;c.seaTrial.currentStage=9;c.soulBones[0].partId='external';c.soulBones[0].id='external';
    assert.ok(seaGodMissing(c).includes('头魂骨'));assert.ok(seaGodMissing(c).includes(SEA_DOMAIN));assert.ok(seaGodMissing(c).includes('海神三叉戟胚胎'));
    assert.equal(c.ending,null);
});

test('full water law and existing unique items retain identity while every remaining fixed reward settles once',async()=>{
    const s=await fixture(),c=s.session.character;c.elementProgress['水']=4;c.domains.push(SEA_DOMAIN);
    c.artifacts.push({id:SEA_TRIDENT,name:'海神三叉戟',stage:'complete',rank:1,combatPower:0});
    const life=await finish(await start(s)),after=life.exportSnapshot();
    assert.equal(life.session.character.elementProgress['水'],4);
    assert.equal(life.session.character.domains.filter(d=>d===SEA_DOMAIN).length,1);
    assert.equal(life.session.character.artifacts.filter(a=>a.id===SEA_TRIDENT).length,1);
    assert.equal(life.session.character.martialSouls[0].rings[0].years,25000);
    assert.equal(life.step().reason,'sea-god-choice');assert.deepEqual(life.exportSnapshot(),after);
});

test('source adapter rejects replacement after an Asura payout and atomically restores both ledgers and RNG',async()=>{
    const s=await fixture({asura:true});at(s,V10_GOD_TRIAL_STAGES.find(t=>t.tier==='神王'&&t.stage===1).stepId);
    const life=await start(s),before=life.exportSnapshot(),game=(await loader.getSourceRuntime('douluo1')).game;
    const original=game.customHandlers.claimHumanGodTrialReward;
    try{
        game.customHandlers.claimHumanGodTrialReward=ctx=>{original(ctx);ctx.state.character.seaTrial={tier:'yellow'}};
        assert.equal(life.step().error.code,'V10_SEA_GOD_SOURCE_REPLACEMENT');assert.deepEqual(life.exportSnapshot(),before);
    }finally{game.customHandlers.claimHumanGodTrialReward=original}
    const restored=await start(life.exportSnapshot()),expected=await start(before);
    assert.equal(restored.step().error,null);assert.equal(expected.step().error,null);
    assert.deepEqual(restored.exportSnapshot(),expected.exportSnapshot());assert.deepEqual(restored.session.character.seaTrial,before.session.character.seaTrial);
});
test('three genuine entry IDs start immediately and archive non-Asura trials without revoking rewards',async()=>{
    for(const [flow,pool,id]of [['humanSeaTrialSelect','cf8335da-795a-4d26-b4c2-e29aaaf49980','710c23'],['douluo1:flow.formal-story.8c4f9874-bda6-4751-97d7-ae73a6c0cd58','8c4f9874-bda6-4751-97d7-ae73a6c0cd58','d58e35'],['humanGodDeityFirst','0025071b-4c37-4013-b2b7-43750819e528','94cc96']]){
        const s=structuredClone(await baseline),c=s.session.character;c.level=20;
        c.godTrial={tier:'一级',status:'active',deityId:'e58ec3',currentStage:2,totalStages:9,claimedRewardStages:[1],completedStages:[1],claimedRewardIds:['kept']};
        const money=c.wallet.copper;at(s,flow);await aim(s,id);
        const life=await start(s),r=life.step();assert.equal(r.error,null,JSON.stringify(r.error));
        assert.equal(life.session.character.seaTrial.status,'active');assert.equal(life.session.character.seaTrial.currentStage,1);assert.equal(life.session.character.seaTrial.plannedStages,9);
        assert.equal(life.session.character.godTrial,null);assert.equal(life.session.character.godTrials.at(-1).status,'abandoned');assert.deepEqual(life.session.character.godTrials.at(-1).claimedRewardIds,['kept']);assert.equal(life.session.character.wallet.copper,money);
        assert.notEqual(life.session.currentFlowId,'humanSeaTrialFiveYears');
    }
});
test('already inherited gods filter Sea, and Sea filters foreign tiers/deities without changing weights',async()=>{
    const s=structuredClone(await baseline);s.session.character.godhoods=[{id:'e58ec3',name:'光明神'}];assert.equal(seaGodEligible(s.session.character),false);
    s.session.character.godhoods=[{id:ASURA_ID}];assert.equal(seaGodEligible(s.session.character),true);
    const full=await fixture();assert.equal(seaGodEligible(full.session.character),false);
    const life=await start(full),before=life.exportSnapshot();assert.throws(()=>applyApkEffects(life.session.character,[{type:'ending',endingId:'douluo1:sea-god-ascension'}]),{code:'V10_SEA_GOD_ASCENSION_INVALID'});assert.deepEqual(life.exportSnapshot(),before);
    const foreign=structuredClone(await baseline);foreign.session.character.godhoods=[{id:'e58ec3'}];at(foreign,'humanSeaTrialSelect');
    assert.equal((await start(foreign)).wheelView.segments.some(o=>o.optionId==='710c23'),false);
    const tier=await fixture();tier.session.character.godTrial=null;at(tier,'humanGodTrialTier');
    const godTier=(await start(tier)).wheelView;assert.ok(godTier.segments.length>0);assert.ok(godTier.segments.every(o=>o.optionId==='48f196'));
    await aim(tier,'48f196');const selecting=await start(tier);assert.equal(selecting.step().error,null);
    const deity=selecting.wheelView;assert.ok(deity.segments.length>0);assert.ok(deity.segments.every(o=>o.optionId===ASURA_ID));
    assert.equal(selecting.step().error,null);assert.equal(selecting.session.character.godTrial.deityId,ASURA_ID);
});
test('source qualification failure and duplicate replay preserve all state, ledger, RNG and history',async()=>{
    const life=await start(await fixture()),game=(await loader.getSourceRuntime('douluo1')).game;
    const s=life.exportSnapshot();s.session.character.seaTrial.claimedRewardStages=[1];
    await assert.rejects(start(s),{code:'V10_SEA_GOD_STATE_INVALID'});
    const before=life.exportSnapshot();const r=life.step();assert.equal(r.error,null);
    const duplicate=life.exportSnapshot();at(duplicate,SEA_GOD_STAGES[0].id);const replay=await start(duplicate),saved=replay.exportSnapshot();assert.ok(replay.step().error);assert.deepEqual(replay.exportSnapshot(),saved);
    assert.notDeepEqual(life.exportSnapshot(),before);
    const entry=structuredClone(await baseline);entry.session.character.level=20;at(entry,'humanSeaTrialSelect');await aim(entry,'710c23');
    const sourceLife=await start(entry),entryBefore=sourceLife.exportSnapshot(),original=game.customHandlers.startHumanSeaTrial;
    try{game.customHandlers.startHumanSeaTrial=ctx=>{original(ctx);throw Object.assign(new Error('after qualification'),{code:'SEA_ENTRY_INJECTED'})};assert.equal(sourceLife.step().error.code,'SEA_ENTRY_INJECTED');assert.deepEqual(sourceLife.exportSnapshot(),entryBefore)}
    finally{game.customHandlers.startHumanSeaTrial=original}
    const a=await start(entryBefore),b=await start(sourceLife.exportSnapshot());assert.equal(a.step().error,null);assert.equal(b.step().error,null);assert.deepEqual(a.exportSnapshot(),b.exportSnapshot());
});
test('/7 saves are rejected without migration and remain exact raw backups',async()=>{
    const s=structuredClone(await baseline);s.runtimeSemantics='douluo1:god-and-sea-trials/7';await assert.rejects(start(s),{code:'V10_SNAPSHOT_SEMANTICS_CHANGED'});
    const raw=JSON.stringify({schemaVersion:'v10-local-save/1.0',packId:'douluo1',contentIdentity:'previous',snapshot:s}),map=new Map([[SAVE_PREFIX+1,raw]]),store=createV10SaveStore({contentLoader:loader,runner,storage:()=>({getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)})});
    assert.equal(await store.exportSlot(1,{rawBackup:true}),raw);await assert.rejects(store.read(1),{code:'SAVE_CONTENT_MISMATCH'});assert.equal(map.get(SAVE_PREFIX+1),raw);assert.equal(V10_GOD_TRIAL_SEMANTICS,'douluo1:god-and-sea-trials/8');
});

test('natural Sea God entry resumes at a level gate without entering the ordinary five-year lottery',async()=>{
 const life=await runner.start('douluo1',{route:'human',seed:'post110-sea-human-080'});
 for(let i=0;i<129;i++)assert.equal(life.step().error,null,'natural input '+(i+1));
 const before=life.exportSnapshot();assert.equal(before.session.character.seaTrial.currentStage,3);assert.equal(before.session.character.level,53);assert.match(seaGodMissing(before.session.character).join(' '),/60级/);
 const restored=await start(before),result=life.step();assert.equal(result.error,null);assert.equal(restored.step().error,null);assert.deepEqual(restored.exportSnapshot(),life.exportSnapshot());
 assert.notEqual(result.spin?.poolId,'e05f293d-e2cd-4e78-ab58-6e15f3271015');assert.equal(life.session.character.flags['formal:d1-story:skipped:e05f293d-e2cd-4e78-ab58-6e15f3271015'],true);assert.deepEqual(life.session.character.seaTrial,before.session.character.seaTrial);assert.deepEqual(life.session.history.slice(0,129),before.session.history);
});
