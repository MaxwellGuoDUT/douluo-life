import fs from 'node:fs/promises';
import {createV10ContentLoader} from '../../js/v10-content-loader.js';
import {createV10LifeRunner} from '../../js/v10-life-runner.js';
import {createV10SaveStore} from '../../js/v10-save-store.js';
import {V10_SEA_TRIAL_STAGES as seaStages,V10_GOD_TRIAL_STAGES as godStages,V10_GOD_TRIAL_SEMANTICS} from '../../js/v10-god-trial-runtime.js';
const root=new URL('../../',import.meta.url);
globalThis.document??={createElement:()=>({relList:{supports:()=>true},addEventListener(n,f){if(n==='load')queueMicrotask(f)},setAttribute(){}}),getElementsByTagName:()=>[],querySelector:()=>null,querySelectorAll:()=>[],head:{appendChild(){}}};globalThis.window??={dispatchEvent(){}};
const loader=createV10ContentLoader({moduleBaseUrl:root.href,fetchImpl:async p=>({ok:true,json:async()=>JSON.parse(await fs.readFile(new URL(p,root),'utf8'))})}),runner=createV10LifeRunner({contentLoader:loader});
const store=createV10SaveStore({contentLoader:loader,runner,storage:()=>({getItem:()=>null})});
if(process.argv.includes('--boundary-fixture')) {
    const life=await runner.start('douluo1',{seed:'sea-island-20261012-9',route:'human'});
    for(let i=0;i<119;i++){const r=life.step();if(r.error)throw new Error(r.error.message)}
    const snapshot=life.exportSnapshot(),game=(await loader.getSourceRuntime('douluo1')).game;
    // Explicit mechanism fixture: genuine prefix, then source handlers select seaGod.
    // This is never labeled a naturally selected nine-exam life.
    game.customHandlers.startHumanSeaTrial({state:snapshot.session,option:{id:'710c23',text:'海神九考'}});
    game.customHandlers.planHumanSeaTrialStages({state:snapshot.session,option:{id:'85088e',text:'全部完成'}});
    Object.assign(snapshot.session,{currentFlowId:'humanPlan',currentPoolId:null,pendingNextStepId:null,awaitingAdvance:false});
    const fixture=await runner.start('douluo1',{seed:snapshot.seed,route:snapshot.route,snapshot});
    const before=JSON.stringify(fixture.exportSnapshot()),result=fixture.step();
    if(result.error?.code!=='V10_SEA_GOD_BRIDGE_UNRESOLVED'||JSON.stringify(fixture.exportSnapshot())!==before)throw new Error('SeaGod boundary fixture did not roll back');
    const out=new URL('docs/evidence/sea-transform-trials-20261012/',root);await fs.mkdir(out,{recursive:true});
    await fs.writeFile(new URL('mechanism-seaGod-boundary.json',out),await store.serialize(fixture));
    console.log(JSON.stringify({fixture:true,naturalNineExam:false,code:result.error.code,unchanged:true}));process.exit(0);
}
const results=[],exports=[],start=performance.now();let totalCalls=0;
const cases=process.argv.includes('--focused')
    ? [['beast','v10-beast-probe-001'],...[2,6,8,22,23].map(i=>['beast',`transformed-trial-20261012-${i}`]),...Array.from({length:40},(_,i)=>['human',`sea-island-20261012-${i+25}`])]
    : [['human','v10-save-human'],['beast','v10-beast-probe-001'],...Array.from({length:24},(_,i)=>['human',`sea-island-20261012-${i+1}`]),...Array.from({length:24},(_,i)=>['beast',`transformed-trial-20261012-${i+1}`])];
const covered=new Set();let beastReward=false;
for(const [route,seed] of cases){
    if(totalCalls>=18000||performance.now()-start>240000)break;
    const life=await runner.start('douluo1',{seed,route});let calls=0,error=null,savedSea=false,savedGod=false;const rewards=[];
    for(;calls<500&&life.phase==='ready';){
        const before=life.exportSnapshot(),result=life.step();calls++;totalCalls++;
        if(result.error){error=result.error;break}
        const sea=seaStages.find(s=>s.poolId===result.spin?.poolId),god=godStages.find(s=>s.poolId===result.spin?.poolId);
        if(sea){covered.add(sea.tier);rewards.push({type:'sea',tier:sea.tier,stage:sea.stage,call:calls,poolId:sea.poolId,optionId:result.spin.optionId});if(!savedSea){exports.push([`natural-${seed}-before-sea.json`,await store.serialize(await runner.start('douluo1',{seed,route,snapshot:before}))]);savedSea=true}}
        if(god&&route==='beast'){beastReward=true;rewards.push({type:'transformed-god',tier:god.tier,stage:god.stage,call:calls,poolId:god.poolId,optionId:result.spin.optionId});if(!savedGod){exports.push([`natural-${seed}-before-god.json`,await store.serialize(await runner.start('douluo1',{seed,route,snapshot:before}))]);savedGod=true}}
        if(savedSea&&life.session.character.seaTrial?.status==='completed')break;
        if(savedGod&&life.session.character.godhood)break;
    }
    const c=life.session.character,record={seed,route,finalRoute:c.route,calls,rewards,seaTrial:c.seaTrial,godTrial:c.godTrial,godhood:c.godhood,phase:life.phase,error,age:c.age,level:c.level,ending:c.ending,history:life.session.history.length,rng:life.session.random.cursor};
    results.push(record);console.log(JSON.stringify(record));
    if(covered.size===4&&beastReward)break;
}
const evidence={semantics:V10_GOD_TRIAL_SEMANTICS,node:process.version,platform:process.platform,budget:{maxCallsPerLife:500,maxTotalCalls:18000,maxMs:240000},totalCalls,durationMs:performance.now()-start,seaTiers:[...covered],beastReward,results};
if(process.argv.includes('--write-evidence')){const out=new URL('docs/evidence/sea-transform-trials-20261012/',root);await fs.mkdir(out,{recursive:true});await fs.writeFile(new URL(process.argv.includes('--focused')?'natural-focused.json':'natural-search.json',out),JSON.stringify(evidence,null,2)+'\n');for(const [name,text]of exports)await fs.writeFile(new URL(name,out),text)}
console.log(JSON.stringify({totalCalls,seaTiers:[...covered],beastReward,durationMs:evidence.durationMs}));
if(results.some(r=>r.error&&r.error.code!=='V10_SEA_GOD_BRIDGE_UNRESOLVED'))process.exitCode=1;
