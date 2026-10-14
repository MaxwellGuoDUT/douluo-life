// Bounded natural starts: no forced results, state edits, or rerolls.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {runner,loader,store} from '../../../tools/v10/audit-runtime-reliability.mjs';
import {createV10SaveStore} from '../../../js/v10-save-store.js';
import {seaGodMissing,seaGodEligible} from '../../../js/v10-sea-god-runtime.js';
import {V10_GOD_TRIAL_SEMANTICS} from '../../../js/v10-god-trial-runtime.js';
const out=new URL('./',import.meta.url);
const write=(name,value)=>fs.writeFile(new URL(name,out),typeof value==='string'?value:JSON.stringify(value,null,2)+'\n');
const hash=s=>createHash('sha256').update(JSON.stringify(s)).digest('hex');
const targets=new Set(['710c23','d58e35','94cc96','91080d','5ad644']);
const budget={maxMs:480000,maxLives:80,maxCalls:24000,maxCallsPerLife:1600};
if(process.argv.includes('--verify')) {
  const receipt=JSON.parse(await fs.readFile(new URL('search-results.json',out),'utf8'));
  const verified=[],representatives=[],interruptions=[];
  const sampleSeeds=new Set(['natural-sea-20261014-human-013','natural-sea-20261014-human-021']);
  for(const row of receipt.records.filter(r=>r.target||sampleSeeds.has(r.seed))) {
    const life=await runner.start('douluo1',{route:row.route,seed:row.seed});
    const checkpoints=new Map(row.checkpoints.map(c=>[c.call,c]));
    for(let call=1;call<=row.calls;call++) {
      const before=life.exportSnapshot(),r=life.step();
      if(row.error&&call===row.calls) {
        assert.equal(r.error?.code,row.error.code);assert.deepEqual(life.exportSnapshot(),before);break;
      }
      assert.equal(r.error,null,row.seed+' replay '+call);
      const event=row.progress.find(e=>e.call===call);
      if(event) {
        const t=life.session.character.seaTrial;
        assert.deepEqual([t.tier,t.status,t.currentStage,t.claimedRewardStages],[event.tier,event.status,event.stage,event.claimed]);
      }
      const checkpoint=checkpoints.get(call);
      if(checkpoint) {
        const text=await fs.readFile(new URL(checkpoint.file,out),'utf8');
        const s=JSON.parse(text).snapshot;assert.deepEqual(life.exportSnapshot(),s,checkpoint.file);
        const local=createV10SaveStore({contentLoader:loader,runner,storage:()=>({getItem:()=>text})});
        const restored=await local.read(1);assert.deepEqual(restored.exportSnapshot(),s);
        assert.equal(await store.serialize(restored),text);
        verified.push({seed:row.seed,call,file:checkpoint.file,sha256:hash(s),naturalFromStart:true,completeSnapshotEqual:true,strictRestoreAndExportEqual:true});
      }
    }
    assert.equal(hash(life.exportSnapshot()),row.finalSha256);
    const text=await store.serialize(life),file=`${row.seed}-replayed-final.json`;
    await write(file,text);
    const local=createV10SaveStore({contentLoader:loader,runner,storage:()=>({getItem:()=>text})});
    const restored=await local.read(1);
    assert.deepEqual(restored.exportSnapshot(),life.exportSnapshot());
    assert.equal(await store.serialize(restored),text);
    representatives.push({seed:row.seed,calls:row.calls,file,sha256:row.finalSha256,tier:life.session.character.seaTrial?.tier,stages:life.session.character.seaTrial?.claimedRewardStages,naturalFromStart:true,allSeaTransitionsEqual:true,completeSnapshotEqual:true,strictRestoreAndExportEqual:true});
  }
  for(const row of receipt.records.filter(r=>r.error)) {
    const text=await fs.readFile(new URL(`${row.seed}-interrupted.json`,out),'utf8'),s=JSON.parse(text).snapshot;
    const life=await runner.start(s.packId,{route:s.route,seed:s.seed,snapshot:s});
    assert.deepEqual(life.exportSnapshot(),s);
    assert.equal(life.step().error?.code,row.error.code);assert.deepEqual(life.exportSnapshot(),s);
    let strictRead;
    try {
      const local=createV10SaveStore({contentLoader:loader,runner,storage:()=>({getItem:()=>text})});
      const restored=await local.read(1);assert.deepEqual(restored.exportSnapshot(),s);assert.equal(await store.serialize(restored),text);
      strictRead={ok:true,completeSnapshotEqual:true,strictExportEqual:true};
    } catch(error) {strictRead={ok:false,code:error.code??error.name,message:error.message};}
    const counts=Object.fromEntries(['head','torso','leftArm','rightArm','leftLeg','rightLeg','external'].map(part=>[part,s.session.character.soulBones.filter(b=>(b.partId??b.id)===part).length]));
    interruptions.push({seed:row.seed,errorCode:row.error.code,nextAttemptSameError:true,rollbackExact:true,history:s.session.history.length,rng:s.session.random.cursor,bonePartCounts:counts,strictRead});
  }
  const targetLives=receipt.records.filter(r=>r.target).length;
  const result={verified,representatives,interruptions,naturalTargetLives:targetLives,targetReplayStatus:targetLives?'CHECKED':'SKIP: no natural nine/yellow hit; representative other sea trials are separate evidence'};
  await write('replay-verification.json',result);
  console.log(JSON.stringify(result,null,2));
} else {
  const source=(await loader.getSourceRuntime('douluo1')).game;
  const pools=source.pools.filter(p=>p.options.some(o=>targets.has(o.id)));
  const poolIds=new Set(pools.map(p=>p.id));
  await write('entry-source-inventory.json',{note:'Read-only source inventory, not natural or effective candidate coverage.',pools:pools.map(p=>({id:p.id,name:p.name,totalRawWeight:p.options.reduce((n,o)=>n+(o.weight??1),0),options:p.options.map(o=>({id:o.id,text:o.text,weight:o.weight,enabled:o.enabled,requirements:o.requirements??[],rerollWhen:o.rerollWhen??[]}))}))});
  const started=performance.now(),records=[];let totalCalls=0;
  for(let i=0;i<budget.maxLives&&totalCalls<budget.maxCalls&&performance.now()-started<budget.maxMs;i++) {
    const route=i%5===4?'beast':'human',seed=`natural-sea-20261014-${route}-${String(i).padStart(3,'0')}`;
    const life=await runner.start('douluo1',{route,seed});
    const row={seed,route,calls:0,target:false,checkpoints:[],entries:[],progress:[],entryDraws:[],transformedAt:null};
    let previousKey='',lastSea=null;
    while(row.calls<budget.maxCallsPerLife&&totalCalls<budget.maxCalls&&performance.now()-started<budget.maxMs&&life.phase==='ready'&&!life.awaitingSeaGodChoice) {
      const before=life.exportSnapshot(),r=life.step();row.calls++;totalCalls++;
      if(r.error) {
        assert.deepEqual(life.exportSnapshot(),before,'failed atomic step rollback');
        row.error=r.error;row.rollbackExact=true;
        await write(`${seed}-interrupted.json`,await store.serialize(life));break;
      }
      const c=life.session.character,t=c.seaTrial;
      if(route==='beast'&&c.route==='transformed'&&!row.transformedAt)row.transformedAt=row.calls;
      if(poolIds.has(r.spin?.poolId))row.entryDraws.push({call:row.calls,poolId:r.spin.poolId,optionId:r.spin.optionId,age:c.age,level:c.level,seaGodEligibleBefore:seaGodEligible(before.session.character),existingGods:[...(before.session.character.godhoods??[]),...(before.session.character.godhood?[before.session.character.godhood]:[])].map(g=>g.id)});
      if(t) {
        lastSea=structuredClone(t);
        const key=JSON.stringify([t.tier,t.status,t.currentStage,t.claimedRewardStages]);
        if(key!==previousKey) {
          const event={call:row.calls,tier:t.tier,status:t.status,stage:t.currentStage,claimed:[...t.claimedRewardStages],age:c.age,level:c.level,missing:t.tier==='seaGod'?seaGodMissing(c):[],poolId:r.spin?.poolId,optionId:r.spin?.optionId};
          row.progress.push(event);previousKey=key;
          if(before.session.character.seaTrial?.tier!==t.tier)row.entries.push(event);
          if(['seaGod','yellow'].includes(t.tier)) {
            row.target=true;const file=`${seed}-call-${row.calls}.json`;
            await write(file,await store.serialize(life));
            row.checkpoints.push({call:row.calls,file,sha256:hash(life.exportSnapshot()),event});
            if(t.tier==='seaGod'&&t.status==='completed')assert.equal(life.awaitingSeaGodChoice,true);
          }
        }
      }
      if(t?.tier==='yellow'&&t.status==='completed')break;
    }
    const c=life.session.character;
    Object.assign(row,{phase:life.phase,finalRoute:c.route,history:life.session.history.length,rng:life.session.random.cursor,age:c.age,level:c.level,seaTrial:lastSea,missing:lastSea?.tier==='seaGod'?seaGodMissing(c):[],ending:c.ending,gods:[...(c.godhoods??[]),...(c.godhood?[c.godhood]:[])].map(g=>({id:g.id,name:g.name})),finalSha256:hash(life.exportSnapshot())});
    row.seaGodQualified=row.progress.some(e=>e.tier==='seaGod');row.seaGodComplete=life.awaitingSeaGodChoice;
    row.yellowQualified=row.progress.some(e=>e.tier==='yellow');row.yellowComplete=lastSea?.tier==='yellow'&&lastSea.status==='completed';
    row.stopReason=row.error?'typed-interruption':row.seaGodComplete?'nine-inheritance-awaiting-choice':row.yellowComplete?'yellow-completed':life.phase==='completed'?'real-ending':row.calls>=budget.maxCallsPerLife?'per-life-budget':'global-budget';
    if(row.target)await write(`${seed}-last.json`,await store.serialize(life));
    records.push(row);
    const summary={lives:records.length,totalCalls,durationMs:performance.now()-started,seaGodQualified:records.filter(r=>r.seaGodQualified).length,seaGodComplete:records.filter(r=>r.seaGodComplete).length,yellowQualified:records.filter(r=>r.yellowQualified).length,yellowComplete:records.filter(r=>r.yellowComplete).length};
    await write('search-results.json',{environment:{node:process.version,platform:process.platform,semantics:V10_GOD_TRIAL_SEMANTICS},budget,...summary,records});
    console.log(JSON.stringify({seed,calls:row.calls,stop:row.stopReason,sea:row.seaTrial?.tier,stages:row.seaTrial?.claimedRewardStages,missing:row.missing,error:row.error?.code,...summary}));
    if(summary.seaGodComplete>0&&summary.yellowComplete>0)break;
  }
}
