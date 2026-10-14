import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createV10ContentLoader} from '../../js/v10-content-loader.js';
import {createV10LifeRunner} from '../../js/v10-life-runner.js';
import {createV10SaveStore} from '../../js/v10-save-store.js';

const root = new URL('../../', import.meta.url);
const out = new URL('docs/evidence/runtime-reliability-20261012/', root);
globalThis.document ??= {createElement:()=>({relList:{supports:()=>true},addEventListener(n,f){if(n==='load')queueMicrotask(f)},setAttribute(){}}),getElementsByTagName:()=>[],querySelector:()=>null,querySelectorAll:()=>[],head:{appendChild(){}}};
globalThis.window ??= {dispatchEvent(){}};
export const loader = createV10ContentLoader({moduleBaseUrl:root.href,fetchImpl:async p=>({ok:true,json:async()=>JSON.parse(await fs.readFile(new URL(p,root),'utf8'))})});
export const runner = createV10LifeRunner({contentLoader:loader});
export const store = createV10SaveStore({contentLoader:loader,runner,storage:()=>({getItem:()=>null})});
export async function write(name, value) {
    await fs.mkdir(out, {recursive:true});
    await fs.writeFile(new URL(name,out), typeof value==='string' ? value : JSON.stringify(value,null,2)+'\n');
}
if(process.argv.includes('--journeys')) {
    const cases=[['douluo1','human','v10-save-human',500],['douluo1','beast','day24-beast-1',500],['douluo2','human','day27-human-1',500],['douluo2','beast','audit-20261010-douluo2-beast-1',1800],['douluo1','beast','v10-beast-probe-001',700],['douluo1','human','ascension-directed-3',1500],['douluo1','human','journey-d1-human-20261011',1000]];
    const records=[];
    for(const [packId,route,seed,maxCalls] of cases) {
        const life=await runner.start(packId,{route,seed});let calls=0,recovery=0,godhood=null,transformed=null;
        for(;calls<maxCalls&&life.phase==='ready';calls++) {
            const before=life.exportSnapshot(),result=life.step();
            if(result.error)break;
            const c=life.session.character;
            if(!godhood&&c.godhood){godhood={call:calls+1,name:c.godhood.name,ending:c.ending};await write('godhood-'+seed+'.json',await store.serialize(life))}
            if(!transformed&&c.route==='transformed'){transformed=calls+1;await write('transformed-'+seed+'.json',await store.serialize(life))}
            if([20,100,200,1000].includes(calls+1))await write(`sample-${seed}-${calls+1}.json`,await store.serialize(life));
            if(calls===19||calls===99||transformed===calls+1) {
                const saved=await store.serialize(life),copy=JSON.parse(saved).snapshot;
                const replay=await runner.start(packId,{route,seed,snapshot:copy});
                assert.deepEqual(replay.exportSnapshot(),life.exportSnapshot());
                const restoredBefore=await runner.start(packId,{route,seed,snapshot:before});
                assert.equal(restoredBefore.step().error,null);assert.deepEqual(restoredBefore.exportSnapshot(),life.exportSnapshot());recovery++;
            }
        }
        const c=life.session.character,record={packId,route,seed,calls,history:life.session.history.length,random:life.session.random,phase:life.phase,error:life.error,ending:c.ending,godhood,transformed,recovery,age:c.age,beastYears:c.beastYears,sha256:createHash('sha256').update(JSON.stringify(life.exportSnapshot())).digest('hex')};
        await write('final-'+seed+'.json',await store.serialize(life));records.push(record);console.log(JSON.stringify(record));
    }
    await write('journeys.json',{environment:{node:process.version,platform:process.platform},records});
}
if(process.argv.includes('--search')) {
    const started=performance.now(),records=[];let totalCalls=0;
    const budget={maxMs:120000,maxCalls:7500,maxLives:28,maxCallsPerLife:550};
    for(let i=0;i<budget.maxLives&&totalCalls<budget.maxCalls&&performance.now()-started<budget.maxMs;i++) {
        const route=i<14?'human':'beast',seed=i<14?`reliability-yellow-20261012-${i}`:`transformed-trial-20261012-${i-13}`;
        const life=await runner.start('douluo1',{route,seed});let calls=0;const rewards=[];
        while(life.phase==='ready'&&calls<budget.maxCallsPerLife&&totalCalls<budget.maxCalls&&performance.now()-started<budget.maxMs) {
            const result=life.step();calls++;totalCalls++;if(result.error)break;
            const c=life.session.character;
            if(result.spin?.flowId?.startsWith('humanSeaTrialReward:yellow:')||(route==='beast'&&['二级','神王'].includes(c.godTrial?.tier))) {
                rewards.push({call:calls,flow:result.spin?.flowId,tier:c.godTrial?.tier,stage:c.godTrial?.currentStage,sea:c.seaTrial?.status,godhood:c.godhood});
            }
        }
        const c=life.session.character;records.push({seed,route,calls,phase:life.phase,error:life.error,finalRoute:c.route,seaTrial:c.seaTrial,godTrial:c.godTrial,godhood:c.godhood,rewards});
    }
    await write('bounded-search.json',{budget,totalCalls,durationMs:performance.now()-started,records});console.log(JSON.stringify({lives:records.length,totalCalls,durationMs:performance.now()-started}));
}
if(process.argv.includes('--measure')) {
    const records=[];
    const samples=[['douluo1','human','v10-save-human',20],['douluo1','beast','v10-beast-probe-001',200],['douluo1','beast','v10-beast-probe-001',700]];
    for(const [packId,route,seed,target]of samples) {
        const life=await runner.start(packId,{route,seed});for(let i=0;i<target;i++){assert.equal(life.phase,'ready');assert.equal(life.step().error,null)}
        assert.equal(life.phase,'ready');
        const snapshot=life.exportSnapshot(),text=await store.serialize(life);
        await write(`performance-${target}.json`,text);
        const measurements={step:[],continuous20:[],save:[],read:[],export:[]};
        const map=new Map(),local=createV10SaveStore({contentLoader:loader,runner,storage:()=>({getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)})});
        for(let i=0;i<3;i++) {
            const copy=await runner.start(packId,{route,seed,snapshot});let t=performance.now();assert.equal(copy.step().error,null);measurements.step.push(performance.now()-t);
            const replay=await runner.start(packId,{route,seed,snapshot});t=performance.now();for(let j=0;j<20&&replay.phase==='ready';j++)assert.equal(replay.step().error,null);measurements.continuous20.push(performance.now()-t);
            t=performance.now();await local.write(1,text,{expected:map.get('douluo-life:v10:manual:1:1')??null,overwrite:i>0});measurements.save.push(performance.now()-t);
            t=performance.now();const restored=await local.read(1);measurements.read.push(performance.now()-t);assert.deepEqual(restored.exportSnapshot(),snapshot);
            t=performance.now();assert.equal(await local.serialize(life),text);measurements.export.push(performance.now()-t);
        }
        records.push({packId,route,seed,target,history:snapshot.session.history.length,timeline:snapshot.session.timeline.length,bytes:Buffer.byteLength(text),snapshotBytes:Buffer.byteLength(JSON.stringify(snapshot)),measurements,unchanged:JSON.stringify(snapshot)===JSON.stringify(life.exportSnapshot())});
    }
    await write('performance-node-current.json',{node:process.version,platform:process.platform,repetitions:3,unit:'ms',storage:'in-memory adapter; validation and restore are real; no physical localStorage latency claim',optimization:false,benefit:'unverified; no performance change made',records});
    console.log(JSON.stringify(records.map(r=>({history:r.history,bytes:r.bytes,measurements:r.measurements}))));
}
if(process.argv.includes('--ascension-fixture')) {
    // Genuine natural godhood prefix; entering the independent ending pool and
    // choosing its declared option is an explicit mechanism fixture, not a
    // claim that this seed naturally reached that story branch.
    const source=JSON.parse(await fs.readFile(new URL('godhood-v10-beast-probe-001.json',out),'utf8')).snapshot;
    const pool='1209bb56-d533-48af-b012-204292b96f68';
    Object.assign(source.session,{currentFlowId:'douluo1:flow.formal-story.'+pool,currentPoolId:null,pendingNextStepId:null,awaitingAdvance:false});
    // Source engine defers formal human/transformed endings below age 150.
    // Set that explicit mechanism condition; preserve seed, cursor and weights.
    source.session.character.age=150;
    const life=await runner.start(source.packId,{seed:source.seed,route:source.route,snapshot:source});
    await write('mechanism-ascension-before.json',await store.serialize(life));
    const result=life.step();assert.equal(result.error,null);assert.equal(life.phase,'completed');assert.equal(life.session.character.ending.id,'douluo1:story:independent-ascension');
    await write('mechanism-ascension-after.json',await store.serialize(life));
    assert.equal(result.spin.optionId,'607ee5');
    await write('ascension-mechanism.json',{naturalGodhoodPrefix:true,naturalEndingReachability:false,constructedFlow:pool,constructedAge:150,selectedOption:result.spin.optionId,seedAndCursorUnchanged:true,history:life.session.history.length,rng:life.session.random.cursor,ending:life.session.character.ending});
}
if(process.argv.includes('--verify-browser')) {
    const observations=[];
    for(const file of ['browser-results.json','browser-followup-results.json'])observations.push(...JSON.parse(await fs.readFile(new URL(file,out),'utf8')).records);
    const verified=[];
    for(const row of observations) {
        let snapshot;
        if(row.mechanismFixture)snapshot=JSON.parse(await fs.readFile(new URL('recovery-bridge-before.json',out),'utf8')).snapshot;
        else {
            const packId=row.packId??(row.seed.startsWith('day27-')||row.seed.startsWith('audit-20261010-douluo2-')?'douluo2':'douluo1');
            const life=await runner.start(packId,{route:row.route,seed:row.seed});
            while(life.session.history.length<row.history){assert.equal(life.phase,'ready');assert.equal(life.step().error,null)}
            snapshot=life.exportSnapshot();
        }
        const hash=createHash('sha256').update(JSON.stringify(snapshot)).digest('hex');
        assert.equal(hash,row.sha256,`${row.seed}/${row.history}`);assert.equal(snapshot.session.random.cursor,row.rng);
        verified.push({...row,nodeSnapshotEqual:true});
    }
    const normal=await fs.readFile(new URL('browser-recovery-normal.json',out),'utf8'),raw=await fs.readFile(new URL('browser-recovery-raw.json',out),'utf8');
    assert.equal(normal,raw);assert.deepEqual(JSON.parse(normal).snapshot,JSON.parse(await fs.readFile(new URL('recovery-bridge-before.json',out),'utf8')).snapshot);
    await write('browser-node-equality.json',{verified,normalExportEqualsBefore:true,rawExportExact:true});console.log(`${verified.length} browser snapshots match Node; recovery exports match before`);
}
if(process.argv.includes('--long-journey')) {
    const life=await runner.start('douluo1',{route:'beast',seed:'v10-beast-probe-001'}),events=[];
    for(let call=1;call<=900&&life.phase==='ready';call++) {
        const before=life.exportSnapshot(),result=life.step();assert.equal(result.error,null);
        const c=life.session.character;
        if(c.route!==before.session.character.route || JSON.stringify(c.godhood)!==JSON.stringify(before.session.character.godhood) || c.seaTrial?.tier==='yellow' || c.ending)events.push({call,route:c.route,age:c.age,godhood:c.godhood,seaTrial:c.seaTrial,ending:c.ending});
        if(call===828)await write('natural-ascension-before.json',await store.serialize(life));
        if(c.godTrial && ['二级','神王'].includes(c.godTrial.tier) && c.godTrial.currentStage===1) {
            const copy=await runner.start('douluo1',{route:'beast',seed:life.seed,snapshot:before});
            assert.equal(copy.step().error,null);assert.deepEqual(copy.exportSnapshot(),life.exportSnapshot());
        }
    }
    assert.equal(life.phase,'completed');assert.equal(life.session.character.ending.finalStatus,'god');
    await write('natural-ascension-after.json',await store.serialize(life));
    await write('long-natural-journey.json',{budget:900,seed:life.seed,history:life.session.history.length,rng:life.session.random.cursor,events,tiers:life.session.character.godTrials.map(t=>({tier:t.tier,stages:t.completedStages,status:t.status,completedAtAge:t.completedAtAge})),sha256:createHash('sha256').update(JSON.stringify(life.exportSnapshot())).digest('hex')});
}
if(process.argv.includes('--recovery-fixture')) {
    const snapshot=JSON.parse(await fs.readFile(new URL('sample-v10-save-human-100.json',out),'utf8')).snapshot;
    snapshot.session.character.seaTrial={tier:'seaGod',selection:{optionId:'710c23',text:'海神九考'},startedAtAge:6,status:'qualified',totalStages:9,plannedStages:9,currentStage:1,completedStages:[],claimedRewardStages:[],claimedRewardOptionIds:[]};
    Object.assign(snapshot.session,{currentFlowId:'humanPlan',currentPoolId:null,pendingNextStepId:null,awaitingAdvance:false});
    const life=await runner.start(snapshot.packId,{route:snapshot.route,seed:snapshot.seed,snapshot});
    const before=life.exportSnapshot();await write('recovery-bridge-before.json',await store.serialize(life));
    assert.equal(life.step().error.code,'V10_SEA_GOD_BRIDGE_UNRESOLVED');assert.deepEqual(life.exportSnapshot(),before);
    await write('recovery-bridge-after.json',await store.serialize(life));
}
if (process.argv.includes('--reproduce')) {
    const seed='transformed-trial-20261012-17', life=await runner.start('douluo1',{seed,route:'beast'});
    const operations=[];
    for(let call=1;call<=120;call++) {
        const before=life.exportSnapshot(), result=life.step();
        operations.push({call,optionId:result.spin?.optionId,poolId:result.spin?.poolId,error:result.error});
        if(call===96 || result.error) {
            await write('element-before.json',await store.serialize(await runner.start('douluo1',{seed,route:'beast',snapshot:before})));
            await write('element-reproduction.json',{seed,pack:'douluo1',route:'beast',call,operations,error:result.error,unchanged:JSON.stringify(before)===JSON.stringify(life.exportSnapshot()),history:before.session.history.length,rng:before.session.random.cursor,stages:before.session.character.beast.attributeStages});
            break;
        }
    }
}
