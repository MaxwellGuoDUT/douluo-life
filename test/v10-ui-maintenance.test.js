import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { createV10ContentLoader } from '../js/v10-content-loader.js';
import { createV10LifeRunner } from '../js/v10-life-runner.js';
import { createV10HumanRunner } from '../js/v10-human-runner.js';
import { actualAge, actualAgeText, createV10Display } from '../js/v10-display.js';
import { calculateApkCombatPower } from '../js/apk-combat-power-runtime.js';
import { createV10HistoryView, historyWindow } from '../js/v10-history-view.js';
globalThis.document ??= {createElement(){return {relList:{supports:()=>true},addEventListener(n,f){if(n==='load')queueMicrotask(f)},setAttribute(){}}},getElementsByTagName:()=>[],querySelector:()=>null,querySelectorAll:()=>[],head:{appendChild(){}}};
globalThis.window ??= {dispatchEvent:()=>true};
const root=new URL('../',import.meta.url);
const loader=createV10ContentLoader({moduleBaseUrl:root.href,fetchImpl:async p=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(new URL(p,root),'utf8'))})});
const factory=createV10LifeRunner({contentLoader:loader});
const node=()=>({textContent:'',children:[],listeners:{},style:{},dataset:{},setAttribute(){},replaceChildren(...items){this.children=items},addEventListener(n,f){this.listeners[n]=f}});
const documentFixture={createElement:node};
const fields=new Proxy({}, {get(target,id){return target[id]??=node()}});
const display=createV10Display(fields,documentFixture);
test('real Douluo II beast source names, time effects, DOM, RNG and JSON restore agree',async()=>{
 const life=await factory.start('douluo2',{route:'beast',seed:'day27-beast-3'});
 const graph=await loader.getRouteGraph('douluo2');
 assert.equal(life.wheelView.title,graph.pack.pools.find(p=>p.id===life.wheelView.poolId).source.name);
 assert.equal(actualAge(life.session.character),0);
 let dynamic=0,timeSteps=0;
 for(let i=0;i<55;i++){
  const before=life.exportSnapshot();const view=life.wheelView;
  display.renderWheel(view);display.renderCharacterSummary(life.session.character,life.characterProfile);
  assert.deepEqual(life.exportSnapshot(),before,'display never draws or mutates');
  assert.doesNotMatch(fields['human-wheel-title'].textContent,/runtime|[0-9a-f]{8}-[0-9a-f-]{27,}/iu);
  assert.doesNotMatch(fields['human-wheel-note'].textContent,/douluo2:|runtime|[0-9a-f]{8}-/iu);
  if(view.status==='dynamic'){dynamic++;assert.equal(fields['human-wheel-title'].textContent,'命运接续');assert.equal(view.segments.length,0)}
  assert.equal(life.step().committed,true);
  if(actualAge(life.session.character)!==actualAge(before.session.character)){
   timeSteps++;
   assert.equal(actualAge(life.session.character)-actualAge(before.session.character),10);
   assert.equal(life.session.character.age,0);assert.ok(life.session.history.at(-1).text);
  }
 }
 assert.ok(dynamic>0&&timeSteps>=5);
 assert.equal(actualAge(life.session.character),80);assert.equal(life.session.character.timelineAge,-120);
 display.renderCharacterSummary(life.session.character,life.characterProfile);
 assert.equal(fields['actual-age-value'].textContent,'80 岁');
 const saved=JSON.parse(JSON.stringify(life.exportSnapshot()));
 const restored=await factory.start('douluo2',{route:'beast',seed:life.seed,snapshot:saved});
 assert.equal(actualAgeText(restored.session.character),'80 岁');assert.deepEqual(restored.exportSnapshot(),saved);
 assert.equal(actualAge({route:'transformed',age:6,beastOrigin:{chronologicalAge:80}}),6);
 assert.equal(actualAgeText({route:'beast',age:0}),'该路线未记录实际年龄');
 assert.equal(actualAgeText({route:'human',age:0}),'0 岁');
});
test('checkpoint ablation: four real openings retain all fields and isolate saved pre-draw history',async()=>{
 for(const [packId,route,seed] of [['douluo1','human','apk-route-demo-seed'],['douluo1','beast','day24-beast-1'],['douluo2','human','day27-human-3'],['douluo2','beast','day27-beast-3']]){
  const baseline=await factory.start(packId,{route,seed});const lean=await factory.start(packId,{route,seed});let checkpoint=null;
  for(let i=0;i<60&&baseline.phase==='ready';i++){
   const before=baseline.exportSnapshot();const first=baseline.step();let calls=0;
   const second=lean.step({onCheckpoint(value){checkpoint=value;calls++}});
   assert.equal(second.committed,first.committed);assert.deepEqual(second.error,first.error);
   assert.deepEqual(lean.exportSnapshot(),baseline.exportSnapshot());assert.equal(calls,first.committed?1:0);
   if(first.committed){assert.deepEqual(checkpoint,before);const after=lean.exportSnapshot();
    const checkpointCopy=structuredClone(checkpoint);checkpoint.session.timeline.push({text:'alias probe'});checkpoint.session.character.flags.aliasProbe=true;
    assert.deepEqual(lean.exportSnapshot(),after);checkpoint=checkpointCopy;
   }
  }
  if(checkpoint){const restored=await factory.start(packId,{route,seed,snapshot:JSON.parse(JSON.stringify(checkpoint))});assert.deepEqual(restored.exportSnapshot(),checkpoint)}
 }
});
test('rejected effect retains session and does not publish a checkpoint; batch publishes latest pre-draw',async()=>{
 const source=await loader.getSourceRuntime('douluo2'), graph=structuredClone(await loader.getRouteGraph('douluo2'));
 const flow=graph.pack.flows.find(f=>f.id===graph.pack.entryFlowId);const pool=graph.pack.pools.find(p=>p.id===flow.source.poolId);
 for(const option of pool.options){option.source.effects=[{type:'unknown-maintenance-effect'}];option.route.effects=option.source.effects}
 const bad=createV10HumanRunner({seed:'maintenance-reject',sourcePack:{...source,routeGraph:graph},loaded:{routeGraph:{schemaVersion:'apk-route-graph/1.0',packs:[{...graph.pack,id:"douluo2"}]}}});
 const before=bad.exportSnapshot();let calls=0;bad.step({onCheckpoint(){calls++}});
 assert.equal(calls,0);assert.deepEqual(bad.exportSnapshot(),before);assert.equal(bad.error.code,'UNSUPPORTED_APK_EFFECT');
 const life=await factory.start('douluo2',{route:'beast',seed:'day27-beast-3'});let latest;
 await life.runToTerminal({maxSteps:20,onCheckpoint(snapshot){latest=snapshot},yieldStep:()=>Promise.resolve()});
 assert.equal(latest.session.history.length,19);assert.equal(life.session.history.length,20);
 const restored=await factory.start('douluo2',{route:'beast',seed:life.seed,snapshot:latest});restored.step();assert.deepEqual(restored.exportSnapshot(),life.exportSnapshot());
});
test('history view fixture renders <=50 nodes, anchors old pages, and reset follows latest without losing entries',()=>{
 const timeline=Array.from({length:1000},(_,i)=>({text:'记录'+(i+1)}));const list=node(),older=node(),newer=node(),latest=node(),status=node();
 const view=createV10HistoryView({list,older,newer,latest,status,getTimeline:()=>timeline,document:documentFixture});
 view.render();assert.equal(list.children.length,50);assert.equal(list.children[0].textContent,'记录951');
 older.listeners.click();assert.equal(list.children[0].textContent,'记录901');timeline.push({text:'新记录'});view.render();assert.equal(list.children[0].textContent,'记录901');
 newer.listeners.click();assert.equal(list.children[0].textContent,'记录951');latest.listeners.click();assert.equal(list.children.at(-1).textContent,'新记录');
 view.reset();view.render();assert.equal(list.children.length,50);assert.equal(timeline.length,1001);
 assert.deepEqual(historyWindow([{text:''},{text:'真实文本'},{text:' '}]).entries,[{text:'真实文本'}]);
});


test('combat display matches each pack runtime, restores and never consumes RNG or changes state',async()=>{
 for(const [packId,route,seed] of [['douluo1','human','apk-route-demo-seed'],['douluo1','beast','day24-beast-1'],['douluo2','human','day27-human-3'],['douluo2','beast','day27-beast-3']]){
  const life=await factory.start(packId,{route,seed});
  const source=packId==='douluo2'?await loader.getSourceRuntime(packId):null;
  const loaded=packId==='douluo1'?await loader.getHumanRuntimeContent():null;
  for(let i=0;i<35&&life.phase==='ready';i++){
   const before=life.exportSnapshot(); const power=life.combatPower;
   const expected=packId==='douluo2'?source.engine.C.total(life.session.character):calculateApkCombatPower(life.session.character,loaded.combatPowerEvidence).total;
   assert.equal(power.status,'ready');assert.equal(power.total,expected);
   display.renderCombatPower(power);display.renderCharacterSummary(life.session.character,life.characterProfile);
   assert.equal(fields['combat-power-value'].textContent,expected.toLocaleString('zh-CN'));
   assert.ok(fields['character-identity'].children.some(n=>n.textContent==='战力：'+expected.toLocaleString('zh-CN')));
   assert.deepEqual(life.exportSnapshot(),before);
   assert.equal(life.step().committed,true);
  }
  const saved=life.exportSnapshot();const restored=await factory.start(packId,{route,seed,snapshot:JSON.parse(JSON.stringify(saved))});
  assert.deepEqual(restored.combatPower,life.combatPower);assert.deepEqual(restored.exportSnapshot(),saved);
 }
 const guarded=await factory.start('douluo1',{route:'human',seed:'combat-uncovered'});
 guarded.session.character.flags['combat:status-multiplier-basis-points']=12345;
 const before=guarded.exportSnapshot();const unavailable=guarded.combatPower;
 assert.equal(unavailable.status,'unavailable');assert.equal(unavailable.total,null);
 assert.equal(unavailable.code,'APK_COMBAT_POWER_UNCOVERED_STATE');
 display.renderCombatPower(unavailable);assert.equal(fields['combat-power-value'].textContent,'暂无法计算');
 assert.deepEqual(guarded.exportSnapshot(),before);
 display.renderCombatPower(null);assert.equal(fields['combat-power-value'].textContent,'未确定');
});

test('real fast cancellation stops before next transaction and retains latest reroll checkpoint',async()=>{
 for(const [packId,route,seed] of [['douluo1','human','apk-route-demo-seed'],['douluo2','beast','day27-beast-3']]){
  const life=await factory.start(packId,{route,seed});const reference=await factory.start(packId,{route,seed});
  const initial=life.exportSnapshot();
  const zero=await life.runToTerminal({maxSteps:200,shouldStop:()=>true});
  assert.equal(zero.reason,'cancelled');assert.equal(zero.steps,0);assert.equal(life.phase,'ready');assert.deepEqual(life.exportSnapshot(),initial);
  let stop=false,checkpoint=null;
  const result=await life.runToTerminal({maxSteps:200,shouldStop:()=>stop,onCheckpoint:s=>{checkpoint=s},onStep:(r,n)=>{assert.equal(r.committed,true);if(n===4)stop=true},yieldStep:()=>Promise.resolve()});
  assert.equal(result.reason,'cancelled');assert.equal(result.steps,4);assert.equal(life.phase,'ready');
  let expectedCheckpoint;for(let i=0;i<4;i++){expectedCheckpoint=reference.exportSnapshot();reference.step()}
  assert.deepEqual(life.exportSnapshot(),reference.exportSnapshot());assert.deepEqual(checkpoint,expectedCheckpoint);
  assert.deepEqual(life.step(),reference.step());assert.deepEqual(life.exportSnapshot(),reference.exportSnapshot());
 }
});
