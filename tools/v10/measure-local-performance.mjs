import fs from 'node:fs';
import { performance } from 'node:perf_hooks';
import { createV10ContentLoader } from '../../js/v10-content-loader.js';
import { createV10LifeRunner } from '../../js/v10-life-runner.js';
const root = new URL('../../', import.meta.url);
globalThis.document ??= {createElement(){return {relList:{supports:()=>true},addEventListener(n,f){if(n==='load')queueMicrotask(f)},setAttribute(){}}},getElementsByTagName:()=>[],querySelector:()=>null,querySelectorAll:()=>[],head:{appendChild(){}}};
globalThis.window ??= {dispatchEvent:()=>true};
const loader=createV10ContentLoader({moduleBaseUrl:root.href,fetchImpl:async p=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(new URL(p,root),'utf8'))})});
const factory=createV10LifeRunner({contentLoader:loader});
const nativeClone=globalThis.structuredClone;
let sessionClones=0, cloneMs=0, jsonSessionCopies=0;
const nativeStringify=JSON.stringify;
JSON.stringify=(v,...args)=>{if(v?.timeline)jsonSessionCopies++;return nativeStringify(v,...args)};
globalThis.structuredClone=(v)=>{const start=performance.now();const out=nativeClone(v);if(v?.timeline || v?.session?.timeline)sessionClones++;cloneMs+=performance.now()-start;return out};
const stats=a=>{if(!a.length)return {n:0,median:null,p95:null,windowMedians:[]};const b=[...a].sort((x,y)=>x-y);return {n:b.length,median:+b[Math.floor(b.length/2)].toFixed(3),p95:+b[Math.min(b.length-1,Math.ceil(b.length*.95)-1)].toFixed(3),windowMedians:[0,5,10].map(i=>{const w=a.slice(i,i+5).sort((x,y)=>x-y);return +w[Math.floor(w.length/2)]?.toFixed(3)})}};
const mode=process.argv[2]??'compare';
if(mode==='verify') {
 const assert=(await import('node:assert/strict')).default;
 for(const target of [20,100,300]) {
  const original=await factory.start('douluo2',{route:'beast',seed:'day27-beast-3'});
  for(let i=0;i<target&&original.phase==='ready';i++)original.step();
  const snapshot=original.exportSnapshot();
  const before=await factory.start('douluo2',{route:'beast',seed:original.seed,snapshot});
  const after=await factory.start('douluo2',{route:'beast',seed:original.seed,snapshot});
  let checkpoint;
  for(let i=0;i<5&&before.phase==='ready';i++) {
   const expected=before.exportSnapshot();const baseline=before.step();
   const lean=after.step({onCheckpoint(value){checkpoint=value}});
   assert.equal(lean.committed,baseline.committed);
   assert.deepEqual(lean.error,baseline.error);
   assert.deepEqual(after.exportSnapshot(),before.exportSnapshot());
   assert.equal(after.phase,before.phase);
   if(lean.committed)assert.deepEqual(checkpoint,expected);
  }
  const state=after.exportSnapshot();checkpoint.session.timeline.push({text:'alias probe'});
  assert.deepEqual(after.exportSnapshot(),state);
  console.log('PASS complete snapshot + phase/error + checkpoint isolation at history '+target);
 }
} else {
const rows=[];
// Fixed existing seed; 3 x 5-step windows at each legal point, 60s budget per point.
if(!['before','after','compare'].includes(mode))throw new Error('Use compare, before or after');
for(const target of [20,100,300]){
 const life=await factory.start('douluo2',{route:'beast',seed:'day27-beast-3'});
 for(let i=0;i<target&&life.phase==='ready';i++)life.step();
 const snapshot=life.exportSnapshot();
 const samples={step:[],export:[],projection:[],sessionClones:[],cloneMs:[],uiStep:[],uiCopies:[],uiFullCopies:[]};
 for(let repeat=-1;repeat<3;repeat++){
  const current=await factory.start('douluo2',{route:'beast',seed:life.seed,snapshot});
  const budget=performance.now();
  for(let i=0;i<5&&current.phase==='ready'&&performance.now()-budget<60000;i++){
   let t=performance.now();current.exportSnapshot();if(repeat>=0)samples.export.push(performance.now()-t);
   sessionClones=0;cloneMs=0;t=performance.now();current.step();if(repeat>=0){samples.step.push(performance.now()-t);samples.sessionClones.push(sessionClones);samples.cloneMs.push(cloneMs)}
   t=performance.now();void current.wheelView;void current.characterProfile;if(repeat>=0)samples.projection.push(performance.now()-t);
  }
 }
 const paired={before:{time:[],copies:[]},after:{time:[],copies:[]}};
 for(let repeat=-1;repeat<3;repeat++){
  const variants=mode==='compare' ? (repeat%2===0?['before','after']:['after','before']) : [mode];
  for(const variant of variants){
   const current=await factory.start('douluo2',{route:'beast',seed:life.seed,snapshot});
   const budget=performance.now();
   for(let i=0;i<5&&current.phase==='ready'&&performance.now()-budget<60000;i++){
    sessionClones=0;jsonSessionCopies=0;const t=performance.now();
    if(variant==='before'){current.exportSnapshot();current.step()}
    else current.step({onCheckpoint(){}});
    if(repeat>=0){paired[variant].time.push(performance.now()-t);paired[variant].copies.push(sessionClones+jsonSessionCopies)}
   }
  }
 }
 if(mode!=='compare'){samples.uiStep=paired[mode].time;samples.uiFullCopies=paired[mode].copies;delete samples.uiCopies;}
 const session=snapshot.session;
 rows.push({target,phase:life.phase,history:session.history.length,timeline:session.timeline.length,age:session.character.age,chronologicalAge:session.character.beast?.chronologicalAge,beastYears:session.character.beastYears,bytes:Buffer.byteLength(JSON.stringify(snapshot)),...(mode==='compare'?{paired:Object.fromEntries(Object.entries(paired).map(([k,v])=>[k,{time:stats(v.time),copies:stats(v.copies)}]))}:{}),...Object.fromEntries(Object.entries(samples).map(([k,a])=>[k,stats(a)]))});
}
const probe=await factory.start('douluo2',{route:'beast',seed:'day27-beast-3'});const graph=await loader.getRouteGraph('douluo2');const trace=[];
for(let i=0;i<55&&probe.phase==='ready';i++){
 const view=probe.wheelView;const before=nativeClone(probe.session.character);const dynamicStart=probe.session.dynamicHistory.length;probe.step();
 if(i<3 || probe.session.character.beast?.chronologicalAge!==before.beast?.chronologicalAge){const pool=graph.pack.pools.find(p=>p.id===view.poolId);trace.push({step:i+1,title:view.title,status:view.status,poolId:view.poolId,graphName:pool?.name,sourceName:pool?.source?.name,flow:probe.session.currentFlowId,text:probe.session.history.at(-1)?.text,age:[before.age,probe.session.character.age],chronologicalAge:[before.beast?.chronologicalAge,probe.session.character.beast?.chronologicalAge],beastYears:[before.beastYears,probe.session.character.beastYears],timelineAge:[before.timelineAge,probe.session.character.timelineAge],timelineEra:probe.session.character.timelineEra,dynamicOperations:probe.session.dynamicHistory.slice(dynamicStart).map(x=>({operation:x.operation,handlerId:x.handlerId,effects:x.effects}))})}
}
const output={mode,node:process.version,platform:process.platform,windows:'3 x 5 steps, 1 warmup window, fixed day27-beast-3, targets 20/100/300, 60s per window; stop on boundary',rows,trace};
fs.mkdirSync(new URL('.tmp/v101/',root),{recursive:true});
fs.writeFileSync(new URL(`.tmp/v101/${mode}.json`,root),JSON.stringify(output,null,2));
console.log(JSON.stringify(output,null,2));

}
