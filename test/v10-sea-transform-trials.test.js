import assert from 'node:assert/strict';
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import test from 'node:test';
import {resolveSourceVault} from '../tools/v10/source-vault.mjs';
import {createV10ContentLoader} from '../js/v10-content-loader.js';
import {createV10LifeRunner} from '../js/v10-life-runner.js';
import {createV10SaveStore,SAVE_PREFIX} from '../js/v10-save-store.js';
import {projectV10SourceCharacter} from '../js/v10-human-runner.js';
import {V10_SEA_TRIAL_STAGES as stages,V10_SEA_TRIAL_POOLS as pools,V10_GOD_TRIAL_STAGES as godStages,
    V10_GOD_TRIAL_SEMANTICS,planV10SeaTrial,planV10GodTrialReward} from '../js/v10-god-trial-runtime.js';
globalThis.document ??= {createElement:()=>({relList:{supports:()=>true},addEventListener(n,f){if(n==='load')queueMicrotask(f)},setAttribute(){}}),getElementsByTagName:()=>[],querySelector:()=>null,querySelectorAll:()=>[],head:{appendChild(){}}};
globalThis.window ??= {dispatchEvent(){}};
const root=new URL('../',import.meta.url);
const loader=createV10ContentLoader({moduleBaseUrl:root.href,fetchImpl:async p=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(new URL(p,root),'utf8'))})});
const runner=createV10LifeRunner({contentLoader:loader});
const human=(async()=>{const life=await runner.start('douluo1',{seed:'ascension-directed-3',route:'human'});for(let i=0;i<90;i++)assert.equal(life.step().error,null);return life.exportSnapshot()})();
const transformed=(async()=>{const life=await runner.start('douluo1',{seed:'v10-beast-probe-001',route:'beast'});for(let i=0;i<200&&(!life.session.character.martialSouls.length||life.session.character.route==='beast');i++)assert.equal(life.step().error,null);assert.equal(life.session.character.route,'transformed');return life.exportSnapshot()})();
function atFlow(snapshot,flow){snapshot.session.currentFlowId=flow;snapshot.session.currentPoolId=null;snapshot.session.pendingNextStepId=null;snapshot.session.awaitingAdvance=false;return snapshot}
async function seaFixture(tier,route='human',planned){const snapshot=structuredClone(await (route==='human'?human:transformed));const total=stages.filter(s=>s.tier===tier).length;Object.assign(snapshot.session.character,{level:70,godTrial:null,seaTrial:{tier,selection:{optionId:({yellow:'91080d',purple:'9c3004',black:'e8f6b8',top:'7e9bfa'})[tier],text:tier},startedAtAge:6,totalStages:total,plannedStages:planned??total,currentStage:1,completedStages:[],claimedRewardStages:[],claimedRewardOptionIds:[],status:'active'}});snapshot.session.character.flags['formal:d1-scheduler-mode']='seaTrial';return atFlow(snapshot,'humanPlan')}
const start=s=>runner.start('douluo1',{seed:s.seed,route:s.route,snapshot:s});

test('original vault generates all 23 sea stages and 3 entrances without changing source IDs or weights',t=>{
    const vault=resolveSourceVault();
    if(!vault.explicit&&!fs.existsSync(vault.path)){t.skip('Restored source vault is absent; configure DOULUO_SOURCE_VAULT to validate sea trials.');return}
    const result=spawnSync(process.execPath,['tools/v10/generate-god-trial.mjs','--check'],{cwd:root,encoding:'utf8'});
    assert.equal(result.status,0,result.stderr||result.stdout);
    assert.deepEqual(['yellow','purple','black','top'].map(t=>stages.filter(s=>s.tier===t).length),[4,5,6,8]);
    assert.equal(pools.length,26);
});
for(const tier of ['yellow','purple','black','top']) test(`mechanism: ${tier} source rewards, complete continuation and restored RNG/history`,async()=>{
    const snapshot=await seaFixture(tier),life=await start(snapshot),game=(await loader.getSourceRuntime('douluo1')).game;
    const visited=[];
    for(let i=0;i<90&&life.session.character.seaTrial.status==='active';i++){
        const before=life.exportSnapshot();void life.wheelView;assert.deepEqual(life.exportSnapshot(),before);
        const result=life.step();assert.equal(result.error,null,JSON.stringify(result.error));
        assert.notEqual(result.spin?.poolId,'e7e646c0-8c53-4f95-b978-5bb661d57fa5','no extra fixed top-tier reward');
        const stage=stages.find(s=>s.poolId===result.spin?.poolId);if(!stage)continue;
        visited.push(stage.stage);assert.equal(stage.tier,tier);
        const expected=structuredClone(before.session);expected.character=projectV10SourceCharacter(expected.character);
        const option=pools.find(p=>p.id===stage.poolId).options.find(o=>o.id===result.spin.optionId);
        game.customHandlers.claimHumanSeaTrialReward({state:expected,step:{poolId:stage.poolId},option});
        for(const key of ['seaTrial','level','appearanceRank','traits','artifacts','martialSouls'])assert.deepEqual(life.session.character[key],expected.character[key],`${tier}/${stage.stage}/${key}`);
        assert.deepEqual(life.session.pendingSoulBone,expected.pendingSoulBone);
        const replay=await start(before);assert.equal(replay.step().error,null);assert.deepEqual(replay.exportSnapshot(),life.exportSnapshot());
    }
    assert.deepEqual(visited,stages.filter(s=>s.tier===tier).map(s=>s.stage));assert.equal(life.session.character.seaTrial.status,'completed');assert.equal(life.session.character.ending,null);
    const after=life.exportSnapshot(),replay=await start(after);for(let i=0;i<3;i++){assert.equal(life.step().error,null);assert.equal(replay.step().error,null)}assert.deepEqual(replay.exportSnapshot(),life.exportSnapshot());
});
test('partial exams wait for source before-war opportunity, failure grants nothing, and duplicates reject',async()=>{
    const snapshot=await seaFixture('yellow','human',1);snapshot.session.character.timelineAge=24;
    const life=await start(snapshot);for(let i=0;i<30&&life.session.character.seaTrial.currentStage===1;i++)assert.equal(life.step().error,null);assert.equal(life.session.character.seaTrial.currentStage,2);
    const index={pack:{v10GodTrialSemantics:V10_GOD_TRIAL_SEMANTICS},getFlow:()=>true};
    assert.equal(planV10SeaTrial(index,life.session),null);
    const state=structuredClone(life.session);state.character.timelineAge=25;assert.equal(planV10SeaTrial(index,state).target,'humanSeaTrialBeforeGodWar');
    const game=(await loader.getSourceRuntime('douluo1')).game;
    game.customHandlers.finishRemainingHumanSeaTrial({state});assert.equal(state.character.seaTrial.plannedStages,4);
    state.character.seaTrial.status='failed';assert.equal(planV10SeaTrial(index,state),null);
    const duplicate=await seaFixture('yellow');duplicate.session.character.seaTrial.claimedRewardStages=[1];
    const rejected=await start(duplicate);let failure=null,before=null;for(let i=0;i<30&&!failure;i++){before=rejected.exportSnapshot();failure=rejected.step().error}assert.equal(failure.code,'V10_SEA_TRIAL_STATE_INVALID');assert.deepEqual(rejected.exportSnapshot(),before);
});
test('unversioned seaGod qualifications reject without silently migrating or granting a deity',async()=>{
    const snapshot=structuredClone(await human);snapshot.session.character.seaTrial={tier:'seaGod',selection:{optionId:'710c23',text:'海神九考'},startedAtAge:6,status:'qualified',totalStages:9,plannedStages:9,currentStage:1,completedStages:[],claimedRewardStages:[],claimedRewardOptionIds:[]};atFlow(snapshot,'humanPlan');
    const before=structuredClone(snapshot);await assert.rejects(start(snapshot),{code:'V10_SEA_GOD_STATE_INVALID'});assert.deepEqual(snapshot,before);assert.equal(snapshot.session.character.godhood,null);
});
test('sea source-handler failure rolls back reward, RNG, pending bone and complete history',async()=>{
    const broken={...loader,getSourceRuntime:async id=>{const source=await loader.getSourceRuntime(id);return {...source,game:{...source.game,customHandlers:{...source.game.customHandlers,claimHumanSeaTrialReward(c){source.game.customHandlers.claimHumanSeaTrialReward(c);throw Object.assign(new Error('fixture'),{code:'SEA_FIXTURE_FAILURE'})}}}}}};
    const snapshot=await seaFixture('top');atFlow(snapshot,'humanSeaTrialReward:top:1');const life=await createV10LifeRunner({contentLoader:broken}).start('douluo1',{seed:snapshot.seed,route:snapshot.route,snapshot});const before=life.exportSnapshot();assert.equal(life.step().error.code,'SEA_FIXTURE_FAILURE');assert.deepEqual(life.exportSnapshot(),before);
});
for(const [tier,id,name] of [['三级','c4723a','锐金之神'],['二级','97c9b1','fixture deity'],['一级','ddb29f','雷神'],['神王','fcac00','修罗神位考核']])test(`transformation mechanism: all ${tier} stages preserve beast opening and resume through godhood`,async()=>{
    const snapshot=structuredClone(await transformed),origin=structuredClone(snapshot.session.character.beastOrigin),originalTrial=(await human).session.character.godTrial;
    const deityId=tier==='二级'?originalTrial.deityId:id,deityName=tier==='二级'?originalTrial.deityName:name;
    Object.assign(snapshot.session.character,{level:99,godTrial:{...structuredClone(originalTrial),tier,deityId,deityName,trialId:deityId,currentStage:1,totalStages:godStages.filter(s=>s.tier===tier).length,claimedRewardStages:[]},soulBones:['head','torso','leftArm','rightArm','leftLeg','rightLeg'].map(partId=>({id:partId,name:partId,partId,years:100000}))});atFlow(snapshot,'humanGodTrialContinue');
    const life=await start(snapshot),visited=[];
    for(let i=0;i<100&&life.session.character.godTrial.status==='active';i++){
        const before=life.exportSnapshot(),result=life.step();assert.equal(result.error,null,JSON.stringify(result.error));const stage=godStages.find(s=>s.poolId===result.spin?.poolId);if(stage){visited.push(stage.stage);if([1,4].includes(stage.stage)){const replay=await start(before);assert.equal(replay.step().error,null);assert.deepEqual(replay.exportSnapshot(),life.exportSnapshot())}}
    }
    assert.deepEqual(visited,godStages.filter(s=>s.tier===tier).map(s=>s.stage));assert.equal(life.exportSnapshot().route,'beast');assert.equal(life.session.character.route,'transformed');assert.deepEqual(life.session.character.beastOrigin,origin);assert.equal(life.session.character.godhood.id,deityId);assert.equal(life.session.character.ending,null);
    const map=new Map(),store=createV10SaveStore({contentLoader:loader,runner,storage:()=>({getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)})});const saved=await store.serialize(life);await store.write(1,saved);const replay=await store.read(1);for(let i=0;i<3;i++){assert.equal(life.step().error,null);assert.equal(replay.step().error,null)}assert.deepEqual(replay.exportSnapshot(),life.exportSnapshot());
});
test('pure beast does not receive human trials and old beast snapshots remain raw-exportable',async()=>{
    const index={pack:{v10GodTrialSemantics:V10_GOD_TRIAL_SEMANTICS},getFlow:()=>true};const snapshot=await seaFixture('yellow');snapshot.session.character.route='beast';assert.equal(planV10SeaTrial(index,snapshot.session),null);assert.equal(planV10GodTrialReward(index,snapshot.session),null);
    const old=structuredClone(await transformed);delete old.runtimeSemantics;await assert.rejects(start(old),{code:'V10_SNAPSHOT_SEMANTICS_CHANGED'});
    const raw=JSON.stringify({schemaVersion:'v10-local-save/1.0',packId:'douluo1',contentIdentity:'old',snapshot:old}),map=new Map([[SAVE_PREFIX+1,raw]]),store=createV10SaveStore({contentLoader:loader,runner,storage:()=>({getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)})});assert.equal(await store.exportSlot(1,{rawBackup:true}),raw);await assert.rejects(store.read(1),{code:'SAVE_CONTENT_MISMATCH'});assert.equal(map.get(SAVE_PREFIX+1),raw);
});
