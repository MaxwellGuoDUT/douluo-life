import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {runner,loader,store} from './audit-runtime-reliability.mjs';
import {createV10SaveStore} from '../../js/v10-save-store.js';
import {seaGodEligible,seaGodMissing} from '../../js/v10-sea-god-runtime.js';
import {V10_GOD_TRIAL_SEMANTICS,V10_SEA_TRIAL_POOLS} from '../../js/v10-god-trial-runtime.js';
const out=new URL('../../docs/evidence/post-v110-20261014/',import.meta.url);
const write=(n,v)=>fs.writeFile(new URL(n,out),typeof v==='string'?v:JSON.stringify(v,null,2)+'\n');
const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
const budget={maxMs:1800000,maxLives:240,maxNewSeeds:234,maxCalls:90000,prefixMs:1080000,prefixCalls:54000,prefixPerLife:200,perLife:4800,continuationCallLimit:76000,continuationMs:1500000};
if(await fs.stat(new URL('natural-search.json',out)).then(()=>true,()=>false))throw Error('This evidence round already exists; do not restart without a separately authorized budget and output directory.');
const began=performance.now(),rows=[],candidates=[],targets=new Set(['710c23','d58e35','94cc96','91080d','5ad644']);let totalCalls=0,replayCalls=0,freshStarts=0;
const source=(await loader.getSourceRuntime('douluo1')).game;
const pools=[...source.pools,...V10_SEA_TRIAL_POOLS].filter(p=>p.options.some(o=>targets.has(o.id)));const poolIds=new Set(pools.map(p=>p.id));
await write('natural-policy.json',{budget,count:'Every production step() attempt, including failed attempts and replay; initialization/restore/serialize are not advancement calls. No rerolls; pending inheritance selects continue/ascend only on post-journey branches.',strategy:'At most 234 new seeds alternating 4 human to 1 beast; six start slots reserved for full replays; all fresh starts capped at 240; 200-step prefixes. Continue target-qualified first, then eligible high-level lives with pool draws, then eligible level. All prefixes retained in ledger. No global probability estimate.',semantics:V10_GOD_TRIAL_SEMANTICS,pools:pools.map(p=>({id:p.id,name:p.name}))});
const elapsed=()=>performance.now()-began;
const can=()=>totalCalls<budget.maxCalls&&elapsed()<budget.maxMs;
const capture=async(row,life,label)=>{const file=`${row.seed}-${label}.json`,text=await store.serialize(life);await write(file,text);row.checkpoints.push({call:row.calls,file,hash:hash(life.exportSnapshot())});};
async function advance(row,life,limit,ms,globalCalls){
 while(row.calls<limit&&elapsed()<ms&&totalCalls<globalCalls&&life.phase==='ready'&&!life.awaitingSeaGodChoice){
  const before=life.exportSnapshot(),r=life.step();row.calls++;totalCalls++;row.inputs.push('step');
  if(r.error){assert.deepEqual(life.exportSnapshot(),before);row.error=r.error;row.rollbackExact=true;await capture(row,life,'interrupted');
   const text=await store.serialize(life),local=createV10SaveStore({contentLoader:loader,runner,storage:()=>({getItem:()=>text})});const copy=await local.read(1);assert.deepEqual(copy.exportSnapshot(),life.exportSnapshot());assert.equal(await store.serialize(copy),text);row.strictInterruptionRestore=true;break;}
  const c=life.session.character,t=c.seaTrial;
  if(c.route==='transformed'&&!row.transformedAt)row.transformedAt=row.calls;
  if(poolIds.has(r.spin?.poolId))row.opportunities.push({call:row.calls,poolId:r.spin.poolId,option:r.spin.optionId,eligibleBefore:seaGodEligible(before.session.character),gods:before.session.character.godhoods,age:c.age,level:c.level});
  const key=JSON.stringify(t&&[t.tier,t.status,t.currentStage,t.claimedRewardStages]);
  if(t&&key!==row.previous){row.previous=key;row.progress.push({call:row.calls,tier:t.tier,status:t.status,stage:t.currentStage,rewards:t.claimedRewardStages,age:c.age,history:life.session.history.length,rng:life.session.random.cursor,missing:t.tier==='seaGod'?seaGodMissing(c):[]});
   if(['seaGod','yellow'].includes(t.tier)){row.target=true;if(before.session.character.seaTrial?.tier!==t.tier){const file=`${row.seed}-qualification-before.json`;await write(file,await store.serialize(await runner.start('douluo1',{route:row.route,seed:row.seed,snapshot:before})));row.beforeQualification=file;}await capture(row,life,`call-${row.calls}`);}}
  if(t?.tier==='yellow'&&t.status==='completed')break;
 }
 const c=life.session.character;Object.assign(row,{phase:life.phase,finalRoute:c.route,age:c.age,level:c.level,history:life.session.history.length,rng:life.session.random.cursor,seaTrial:c.seaTrial,ending:c.ending,eligible:seaGodEligible(c),finalHash:hash(life.exportSnapshot()),missing:c.seaTrial?.tier==='seaGod'?seaGodMissing(c):[]});
 row.nineQualified=row.progress.some(p=>p.tier==='seaGod');row.yellowQualified=row.progress.some(p=>p.tier==='yellow');row.nineComplete=life.awaitingSeaGodChoice;row.yellowComplete=row.progress.some(p=>p.tier==='yellow'&&p.status==='completed');
 row.stop=row.error?(row.error.code==='UNEXPECTED_ERROR'?'advance-error':'typed-interruption'):row.nineComplete?'nine-inheritance':row.yellowComplete?'yellow-completed':life.phase==='completed'?'real-ending':row.calls>=budget.perLife?'per-life-budget':'prefix-filter-stop';
}
const summary=()=>({budget,totalCalls,replayCalls,freshStarts,durationMs:elapsed(),lives:rows.length,nineQualified:rows.filter(r=>r.nineQualified).length,nineComplete:rows.filter(r=>r.nineComplete).length,yellowQualified:rows.filter(r=>r.yellowQualified).length,yellowComplete:rows.filter(r=>r.yellowComplete).length,records:rows});
for(let i=0;i<budget.maxNewSeeds&&freshStarts<budget.maxLives&&can()&&elapsed()<budget.prefixMs&&totalCalls<budget.prefixCalls;i++){
 const route=i%5===4?'beast':'human',seed=`post110-sea-${route}-${String(i).padStart(3,'0')}`;
 freshStarts++;const life=await runner.start('douluo1',{seed,route});const row={seed,route,calls:0,inputs:[],opportunities:[],progress:[],checkpoints:[]};rows.push(row);
 await advance(row,life,budget.prefixPerLife,budget.prefixMs,budget.prefixCalls);
 if(row.phase==='ready'&&!row.error&&!row.nineComplete&&!row.yellowComplete)candidates.push({row,snapshot:life.exportSnapshot(),score:(row.target?100000:0)+(row.eligible?10000:0)+row.opportunities.length*100+row.level});
 if(row.target)await capture(row,life,'prefix-last');
 await write('natural-search.json',summary());console.log(JSON.stringify({phase:'prefix',seed,calls:row.calls,stop:row.stop,nine:row.nineQualified,yellow:row.yellowQualified,totalCalls,elapsed:elapsed()}));
}
candidates.sort((a,b)=>b.score-a.score);
for(const candidate of candidates){if(!can()||totalCalls>=budget.continuationCallLimit||elapsed()>=budget.continuationMs)break;
 const {row,snapshot,score}=candidate;row.continuationRank=score;
 const life=await runner.start('douluo1',{route:row.route,seed:row.seed,snapshot});
 await advance(row,life,budget.perLife,budget.continuationMs,budget.continuationCallLimit);
 if(row.stop==='prefix-filter-stop')row.stop='global-budget-stop';
 if(row.target)await capture(row,life,'last');
 await write('natural-search.json',summary());console.log(JSON.stringify({phase:'continuation',seed:row.seed,calls:row.calls,stop:row.stop,sea:row.seaTrial?.tier,totalCalls,elapsed:elapsed()}));
 if(rows.some(r=>r.nineComplete)&&rows.some(r=>r.yellowComplete))break;
}
for(const row of rows.filter(r=>r.target)){
 if(!can()||freshStarts>=budget.maxLives||budget.maxCalls-totalCalls<row.calls){row.replay='budget-unavailable';continue;}
 freshStarts++;const life=await runner.start('douluo1',{seed:row.seed,route:row.route});let completed=true;
 for(let i=0;i<row.inputs.length;i++){if(!can()){completed=false;break;}const r=life.step();totalCalls++;replayCalls++;if(r.error){assert.equal(r.error.code,row.error?.code);break;}
  for(const cp of row.checkpoints.filter(p=>p.call===i+1)){const text=await fs.readFile(new URL(cp.file,out),'utf8');assert.deepEqual(life.exportSnapshot(),JSON.parse(text).snapshot);}}
 if(completed){assert.equal(hash(life.exportSnapshot()),row.finalHash);const text=await store.serialize(life);const local=createV10SaveStore({contentLoader:loader,runner,storage:()=>({getItem:()=>text})});const copy=await local.read(1);assert.deepEqual(copy.exportSnapshot(),life.exportSnapshot());assert.equal(await store.serialize(copy),text);row.replay={completeSnapshotHistoryRngEqual:true,strictRestore:true,originalExportBytesEqual:text===await fs.readFile(new URL(row.checkpoints.at(-1).file,out),'utf8')};
  if(row.nineComplete){const inherited=life.exportSnapshot();life.resolveSeaGodAscension('continue');if(can()){const r=life.step();totalCalls++;replayCalls++;row.continueBranch={committed:r.committed,error:r.error};await write(`${row.seed}-continue.json`,await store.serialize(life));}const asc=await runner.start('douluo1',{route:row.route,seed:row.seed,snapshot:inherited});asc.resolveSeaGodAscension('ascend');await write(`${row.seed}-ascend.json`,await store.serialize(asc));row.ascendBranch={phase:asc.phase,rngUnchanged:asc.session.random.cursor===inherited.session.random.cursor};}}
 else row.replay='time-budget-stop';
}
await write('natural-search.json',summary());console.log(JSON.stringify({...summary(),records:undefined}));
