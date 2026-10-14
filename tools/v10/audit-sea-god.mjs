// Owner-approved mechanism fixtures; never alter source weights or packaged source.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {runner,store} from './audit-runtime-reliability.mjs';
import {createApkRandom} from '../../js/apk-rule-runtime.js';
import {SEA_GOD_STAGES,ASURA_ID} from '../../js/v10-sea-god-runtime.js';
const out=new URL('../../docs/evidence/sea-god-nine-20261013/',import.meta.url);
const write=async(name,value)=>{await fs.mkdir(out,{recursive:true});await fs.writeFile(new URL(name,out),typeof value==='string'?value:JSON.stringify(value,null,2)+'\n')};
const restore=s=>runner.start(s.packId,{route:s.route,seed:s.seed,snapshot:s});
const at=(s,flow)=>Object.assign(s.session,{currentFlowId:flow,currentPoolId:null,pendingNextStepId:null,awaitingAdvance:false});
const hash=s=>createHash('sha256').update(JSON.stringify(s)).digest('hex');
async function aim(s,id){
    const view=(await restore(s)).wheelView;let left=0;const item=view.segments.find(o=>o.optionId===id);assert.ok(item);
    for(const o of view.segments){if(o.optionId===id)break;left+=o.weight}
    for(let i=0;i<500;i++){const seed='sea-entry-fixture-'+i,v=createApkRandom(seed,s.session.random.cursor).next()*view.totalWeight;if(v>left&&v<=left+item.weight){s.seed=seed;s.session.random.seed=seed;return}}
    throw Error('bounded entry seed selection exhausted');
}
function ready(s){
    const c=s.session.character;c.level=99;c.maxLevel=99;c.age=30;
    c.martialSouls[0].rings=Array.from({length:9},()=>({years:10000,name:'机制样本魂环'}));
    c.soulBones=['head','torso','leftArm','rightArm','leftLeg','rightLeg'].map(partId=>({id:partId,partId,name:'机制样本魂骨',years:30000}));
    at(s,SEA_GOD_STAGES[0].id);return s;
}
if(process.argv.includes('--fixtures')){
    const records=[];
    for(const route of ['human','beast']){
        const prefix=await runner.start('douluo1',{route,seed:route==='human'?'v10-save-human':'v10-beast-probe-001'});
        for(let i=0;i<(route==='human'?20:49);i++)assert.equal(prefix.step().error,null);
        if(route==='beast')assert.equal(prefix.session.character.route,'transformed');
        const entry=prefix.exportSnapshot();entry.session.character.level=20;
        at(entry,'douluo1:flow.formal-story.8c4f9874-bda6-4751-97d7-ae73a6c0cd58');await aim(entry,'d58e35');
        let life=await restore(entry);await write(`${route}-entry-before.json`,await store.serialize(life));
        assert.equal(life.step().error,null);assert.equal(life.session.character.seaTrial.status,'active');assert.equal(life.session.character.seaTrial.currentStage,1);
        await write(`${route}-entry-after.json`,await store.serialize(life));
        life=await restore(ready(life.exportSnapshot()));await write(`${route}-nine-before.json`,await store.serialize(life));
        const transitions=[];
        for(let i=0;i<50&&!life.awaitingSeaGodChoice;i++){
            const before=life.exportSnapshot();if(life.session.character.seaTrial.currentStage===9)await write(`${route}-ninth-before.json`,await store.serialize(life));
            const r=life.step();assert.equal(r.error,null,JSON.stringify(r.error));
            const replay=await restore(before);assert.equal(replay.step().error,null);assert.deepEqual(replay.exportSnapshot(),life.exportSnapshot());
            transitions.push({flow:r.spin?.flowId,option:r.spin?.optionId,stage:life.session.character.seaTrial.currentStage,sha256:hash(life.exportSnapshot())});
        }
        assert.equal(life.awaitingSeaGodChoice,true);assert.equal(life.session.character.ending,null);
        await write(`${route}-inheritance.json`,await store.serialize(life));
        const pending=life.exportSnapshot(),cursor=life.session.random.cursor,history=life.session.history.length;
        assert.equal(life.resolveSeaGodAscension('continue').committed,true);await write(`${route}-continued.json`,await store.serialize(life));
        const replay=await restore(life.exportSnapshot());assert.equal(life.step().error,null);assert.equal(replay.step().error,null);assert.deepEqual(replay.exportSnapshot(),life.exportSnapshot());
        life=await restore(pending);life.resolveSeaGodAscension('ascend');assert.equal(life.phase,'completed');assert.equal(life.session.random.cursor,cursor);assert.equal(life.session.history.length,history);
        await write(`${route}-ascended.json`,await store.serialize(life));
        records.push({route,actualRoute:life.session.character.route,prefixNatural:true,entryAndRewardConditionsConstructed:true,naturalNineComplete:false,transitions,ending:life.session.character.ending,ascendConsumesRandom:false,ascendAddsHistory:false});
    }
    const dual=JSON.parse(await fs.readFile(new URL('human-nine-before.json',out),'utf8')).snapshot,c=dual.session.character;
    c.godTrial={tier:'神王',tierSelection:{optionId:'48f196',text:'神王考核'},deityId:ASURA_ID,deityName:'修罗神',deitySelection:{optionId:ASURA_ID,text:'修罗神位考核'},trialId:ASURA_ID,status:'active',currentStage:1,totalStages:9,total:9,completed:0,completedStages:[],claimedRewardStages:[],claimedRewardIds:[],startedAtAge:30};
    let life=await restore(dual);await write('dual-before.json',await store.serialize(life));
    for(let i=0;i<50&&!life.awaitingSeaGodChoice;i++)assert.equal(life.step().error,null);
    assert.equal(life.awaitingSeaGodChoice,true);
    const asura=[life.session.character.godTrial,...life.session.character.godTrials].find(t=>t?.deityId===ASURA_ID);
    assert.equal(asura.status,'completed');assert.equal(asura.claimedRewardStages.length,9);
    await write('dual-inheritance.json',await store.serialize(life));
    await write('mechanism.json',{environment:{node:process.version,platform:process.platform},records,dual:{asuraStages:9,seaStages:9,sha256:hash(life.exportSnapshot())},note:'Explicit mechanism samples; natural prefixes do not make constructed entry/levels/rings/bones natural hits.'});
    console.log('human, natural-transformed prefix and Asura coexistence mechanisms verified');
}
if(process.argv.includes('--natural')){
    const budget={maxMs:90000,maxLives:16,maxCalls:6000,maxCallsPerLife:700},started=performance.now(),records=[];let totalCalls=0;
    const known=[14,27,45,60,62,9];
    for(let i=0;i<budget.maxLives&&totalCalls<budget.maxCalls&&performance.now()-started<budget.maxMs;i++){
        const seed=i<known.length?'sea-island-20261012-'+known[i]:'sea-god-natural-20261013-'+i;
        const life=await runner.start('douluo1',{route:'human',seed});let calls=0,qualified=null;
        while(life.phase==='ready'&&!life.awaitingSeaGodChoice&&calls<budget.maxCallsPerLife&&totalCalls<budget.maxCalls&&performance.now()-started<budget.maxMs){
            const before=life.exportSnapshot(),result=life.step();calls++;totalCalls++;if(result.error)break;
            if(!qualified&&life.session.character.seaTrial?.tier==='seaGod'){
                qualified=calls;await write(`natural-${seed}-before.json`,await store.serialize(await restore(before)));await write(`natural-${seed}-qualified.json`,await store.serialize(life));
            }
        }
        if(qualified)await write(`natural-${seed}-last.json`,await store.serialize(life));
        records.push({seed,calls,qualified,phase:life.phase,error:life.error,seaTrial:life.session.character.seaTrial,ending:life.session.character.ending,complete:life.awaitingSeaGodChoice});
    }
    await write('bounded-natural.json',{budget,totalCalls,durationMs:performance.now()-started,records});console.log(JSON.stringify({lives:records.length,totalCalls,qualified:records.filter(r=>r.qualified).length,complete:records.filter(r=>r.complete).length}));
}
if(process.argv.includes('--verify-nine-browser')){
    const observations=JSON.parse(await fs.readFile(new URL('browser-followup-observations.json',out),'utf8'));
    const snapshot=async name=>JSON.parse(await fs.readFile(new URL(name+'.json',out),'utf8')).snapshot;
    const expected={};
    for(const name of ['human-nine-before','human-inheritance','human-continued','beast-nine-before','beast-inheritance','dual-before'])expected[name]=await snapshot(name);
    const finishCurrent=async name=>{
        const life=await restore(expected[name]);
        for(let i=0;i<50&&!life.awaitingSeaGodChoice;i++)assert.equal(life.step().error,null);
        assert.equal(life.awaitingSeaGodChoice,true);return life;
    };
    // Pool titles are persisted in lastResolvedSpin. Replay the current code;
    // do not ignore that field to force equality with pre-label-fix fixtures.
    const beastCurrent=await finishCurrent('beast-nine-before');expected['beast-inheritance']=beastCurrent.exportSnapshot();
    beastCurrent.resolveSeaGodAscension('ascend');expected['beast-ascended-current']=beastCurrent.exportSnapshot();
    expected['dual-inheritance-current']=(await finishCurrent('dual-before')).exportSnapshot();
    const humanCurrent=await finishCurrent('human-nine-before');expected['current-human-inheritance']=humanCurrent.exportSnapshot();
    humanCurrent.resolveSeaGodAscension('ascend');expected['current-human-ascended']=humanCurrent.exportSnapshot();
    const advanced=await restore(expected['human-continued']);assert.equal(advanced.step().error,null);
    expected['human-advanced-B']=advanced.exportSnapshot();advanced.resolveSeaGodAscension('ascend');
    expected['human-ascended-after-growth']=advanced.exportSnapshot();
    expected['human-ending-restored']=expected['human-ascended-after-growth'];
    expected['human-A-after-tool-interruption']=expected['human-continued'];
    expected['human-B-after-tool-interruption']=expected['human-advanced-B'];
    const verified=[];
    for(const row of observations.records){
        const s=expected[row.label];assert.ok(s,'known receipt label '+row.label);
        assert.equal(hash(s),row.sha256,row.label);assert.equal(s.session.random.cursor,row.rng);assert.equal(s.session.history.length,row.history);
        verified.push({...row,completeSnapshotEqual:true});
    }
    const exports=[];
    for(const [file,s]of [['browser-human-ascended',expected['human-ascended-after-growth']],['browser-beast-ascended',expected['beast-ascended-current']],['browser-dual-inheritance',expected['dual-inheritance-current']],['browser-dual-after-drawers',expected['dual-inheritance-current']],['browser-dual-after-history-fix',expected['dual-inheritance-current']],['browser-current-human-inheritance',expected['current-human-inheritance']],['browser-current-human-ascended',expected['current-human-ascended']]]){
        const text=await fs.readFile(new URL(file+'.json',out),'utf8'),actual=JSON.parse(text).snapshot;
        assert.deepEqual(actual,s,file);assert.equal(await store.serialize(await restore(actual)),text,file+' strict read/export');
        exports.push({file,sha256:hash(actual),history:actual.session.history.length,rng:actual.session.random.cursor,completeSnapshotEqual:true,strictRestoreAndExportEqual:true});
    }
    assert.equal(await fs.readFile(new URL('browser-dual-inheritance.json',out),'utf8'),await fs.readFile(new URL('browser-dual-after-drawers.json',out),'utf8'));
    const dual=(await snapshot('browser-dual-inheritance')).session.character;
    const asura=[dual.godTrial,...dual.godTrials].find(t=>t?.deityId===ASURA_ID);
    assert.equal(asura.claimedRewardStages.length,9);assert.equal(dual.seaTrial.claimedRewardStages.length,9);
    await write('browser-node-equality-followup.json',{verified,exports,checks:verified.length+exports.length,distinctSnapshots:new Set([...verified,...exports].map(r=>r.sha256)).size,drawersPreserveCompleteSnapshot:true,dual:{seaStages:9,asuraStages:9,gods:dual.godhoods.map(g=>g.id)},nativeConfirm:observations.nativeConfirm,clipboard:observations.clipboard});
    console.log(`${verified.length} browser slot snapshots and ${exports.length} actual downloads match complete Node snapshots; strict export and drawer equality pass`);
}
