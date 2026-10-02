import fs from 'node:fs/promises';
import { isDeepStrictEqual } from 'node:util';
import { fileURLToPath } from 'node:url';
import { createV10ContentLoader } from '../../js/v10-content-loader.js';
import { createV10LifeRunner } from '../../js/v10-life-runner.js';
import { createV05ContentIndex } from '../../js/v05-demo.js';
import { calculateApkCombatPower } from '../../js/apk-combat-power-runtime.js';
import { createApkRouteRequirementEvaluator } from '../../js/apk-route-runtime.js';
import { APK_FORMAL_SCHEDULER_EVIDENCE, planFormalStory } from '../../js/apk-scheduler-runtime.js';
import {withV10GodTrialRuntime,evaluateV10GodTrialRequirement,V10_GOD_TRIAL_STAGES,V10_GOD_TRIAL_POOLS} from '../../js/v10-god-trial-runtime.js';
const toolStartedAt = Date.now();
const tailSecondTier = process.argv.includes('--second-tier-tail');
const opportunityRepair = process.argv.includes('--opportunity-repair');
const independentAscensionRetry = process.argv.includes('--independent-ascension-retry');
const highSixBoneWindow = independentAscensionRetry || process.argv.includes('--high-six-bone-godhood-window');
if(independentAscensionRetry && process.argv.includes('--high-six-bone-godhood-window'))throw new Error('conflicting retry mode');
if(highSixBoneWindow && process.argv.some(a=>['--six-bone-third-stage-window','--six-bone-opportunity-repair','--six-bone-continuation','--late-opportunity-repair','--late-level-godhood-window','--high-level-godhood-window','--free-mode-godhood-window'].includes(a)))throw new Error('conflicting high six-bone window');
const sixBoneThirdStageWindow = process.argv.includes('--six-bone-third-stage-window');
if(sixBoneThirdStageWindow && process.argv.some(a=>['--six-bone-opportunity-repair','--six-bone-continuation'].includes(a)))throw new Error('conflicting third-stage window');
const sixBoneOpportunityRepair = process.argv.includes('--six-bone-opportunity-repair');
const sixBoneContinuation = sixBoneThirdStageWindow || sixBoneOpportunityRepair || process.argv.includes('--six-bone-continuation');
if(sixBoneOpportunityRepair && process.argv.includes('--six-bone-continuation'))throw new Error('conflicting six-bone repair mode');
const lateOpportunityRepair = process.argv.includes('--late-opportunity-repair');
if(sixBoneContinuation && process.argv.some(a=>['--late-opportunity-repair','--late-level-godhood-window','--high-level-godhood-window','--free-mode-godhood-window'].includes(a)))throw new Error('conflicting six-bone mode');
const lateLevelWindow = lateOpportunityRepair || process.argv.includes('--late-level-godhood-window');
if(lateOpportunityRepair && process.argv.includes('--late-level-godhood-window'))throw new Error('conflicting late modes');
const highLevelWindow = lateLevelWindow || process.argv.includes('--high-level-godhood-window');
if(lateLevelWindow && process.argv.includes('--high-level-godhood-window'))throw new Error('conflicting high windows');
const freeModeWindow = highSixBoneWindow || sixBoneContinuation || highLevelWindow || process.argv.includes('--free-mode-godhood-window');
if(highLevelWindow && process.argv.includes('--free-mode-godhood-window'))throw new Error('conflicting window modes');
const prefixCalls = highSixBoneWindow ? 132 : sixBoneThirdStageWindow ? 499 : sixBoneOpportunityRepair ? 242 : sixBoneContinuation ? 168 : lateOpportunityRepair ? 199 : lateLevelWindow ? 160 : highLevelWindow ? 134 : 116;
const evidenceWindowField = independentAscensionRetry ? 'independentAscensionRetry' : highSixBoneWindow ? 'highSixBoneGodhoodWindow' : sixBoneThirdStageWindow ? 'sixBoneThirdStageWindow' : sixBoneOpportunityRepair ? 'sixBoneOpportunityRepair' : sixBoneContinuation ? 'sixBoneContinuation' : lateOpportunityRepair ? 'lateOpportunityRepair' : lateLevelWindow ? 'lateLevelGodhoodWindow' : highLevelWindow ? 'highLevelGodhoodWindow' : 'freeModeGodhoodWindow';
if([tailSecondTier,opportunityRepair,freeModeWindow].filter(Boolean).length>1)throw new Error('conflicting audit modes');
if(freeModeWindow && process.argv.some(arg=>['--repair-second-tier','--check-god-trial-source'].includes(arg)))throw new Error('conflicting free-mode audit mode');
const root = new URL('../../', import.meta.url);
globalThis.document ??= { createElement() { return { relList: { supports: () => true }, addEventListener(name, handler) { if (name === 'load') queueMicrotask(handler); }, setAttribute() {} }; }, getElementsByTagName: () => [], querySelector: () => null, querySelectorAll: () => [], head: { appendChild() {} } };
globalThis.window ??= { dispatchEvent: () => true };

if (process.argv.includes('--check-god-trial-source')) {
  const file=new URL('data/v10/source-runtime/douluo1-pack-C6xEgEus.js',root);
  let text=await fs.readFile(file,'utf8');
  text=text.replace(/(["'])(\.\/[^"'\n]+\.js)\1/g,(_,q,p)=>JSON.stringify(new URL(p,file).href));
  text+='\nexport const auditSecondTier={stages:Bt.filter(s=>s.tier==="二级"),pools:af.filter(p=>Bt.some(s=>s.tier==="二级"&&s.poolId===p.id))};';
  let extracted;
  try { extracted=(await import('data:text/javascript;base64,'+Buffer.from(text).toString('base64'))).auditSecondTier; }
  catch(error) { throw new Error('源二级神考读取失败：'+(error.code??error.name)); }
  const stages=extracted.stages.map(({tier,stage,poolId,stepId,minLevel,final,expectedOptionIds})=>({tier,stage,poolId,stepId,minLevel,final,expectedOptionIds}));
  if(!isDeepStrictEqual(stages,V10_GOD_TRIAL_STAGES)||!isDeepStrictEqual(JSON.parse(JSON.stringify(extracted.pools)),V10_GOD_TRIAL_POOLS)) throw new Error('二级神考配置与源不一致');
  console.log(JSON.stringify({sourceMatch:true,stages:8,pools:8,handler:'claimHumanGodTrialReward'}));
  process.exit(0);
}
const loader = createV10ContentLoader({ moduleBaseUrl: root.href, fetchImpl: async p => ({ ok: true, json: async () => JSON.parse(await fs.readFile(new URL(p, root), 'utf8')) }) });
const page = createV10LifeRunner({ contentLoader: loader });
const content = await loader.getHumanRuntimeContent();
// The page uses createV05ContentIndex on this content. Its approved Shrek-only
// copy changes cfe7dd, not these diagnostic pools. Assert each target separately.
const sourcePack = await loader.getSourceRuntime('douluo1');
const index = createV05ContentIndex(withV10GodTrialRuntime(content,sourcePack,'human'));
const baseRequirement = createApkRouteRequirementEvaluator({ contentIndex: index });
const requirement=(record,character)=>evaluateV10GodTrialRequirement(record,character,baseRequirement);
const candidates = [['4cefc71e-ebfa-4e24-8907-66db7f31ab8e','2f0a4a'],['6f1ac8a4-2dc9-4a44-9f9f-919a71257b12','cce3dc'],['1209bb56-d533-48af-b012-204292b96f68','607ee5']];
const targets = new Map(candidates);
const equal = (a,b) => JSON.stringify(a) === JSON.stringify(b);
function delta(a,b,p=[]) {
  if (equal(a,b)) return [];
  if (Array.isArray(a) && Array.isArray(b) && b.length >= a.length && equal(a,b.slice(0,a.length))) return [{op:'append',path:p,value:b.slice(a.length)}];
  if (a && b && !Array.isArray(a) && !Array.isArray(b) && typeof a==='object' && typeof b==='object') return [...new Set([...Object.keys(a),...Object.keys(b)])].flatMap(k => !(k in b) ? [{op:'delete',path:[...p,k]}] : !(k in a) ? [{op:'set',path:[...p,k],value:b[k]}] : delta(a[k],b[k],[...p,k]));
  return [{op:'set',path:p,value:b}];
}
const started = freeModeWindow ? Math.floor(performance.timeOrigin) : tailSecondTier || opportunityRepair ? toolStartedAt : Date.now();
const budget = highSixBoneWindow ? {maxCandidates:1,maxSteps:424,maxPerLife:212,maxMs:60000} : sixBoneThirdStageWindow ? {maxCandidates:1,maxSteps:1398,maxPerLife:699,maxMs:120000} : freeModeWindow ? {maxCandidates:1,maxSteps:1400,maxPerLife:700,maxMs:120000} : opportunityRepair ? {maxCandidates:1,maxSteps:2000,maxPerLife:1000,maxMs:120000} : tailSecondTier ? {maxCandidates:4,maxSteps:5000,maxPerLife:1000,maxMs:120000} : {maxCandidates:64,maxSteps:64000,maxPerLife:1000,maxMs:600000};
const args=process.argv.slice(2);
const writeEvidence=args.includes('--write-evidence');
const repairSecondTier=freeModeWindow||opportunityRepair||tailSecondTier||args.includes('--repair-second-tier');
const runId=independentAscensionRetry?'V10-INDEPENDENT-ASCENSION-RETRY-20261002':highSixBoneWindow?'V10-HIGH-SIX-BONE-GODHOOD-WINDOW-20261002':sixBoneThirdStageWindow?'V10-SIX-BONE-THIRD-STAGE-WINDOW-20261001':sixBoneOpportunityRepair?'V10-SIX-BONE-OPPORTUNITY-REPAIR-20261001':sixBoneContinuation?'V10-SIX-BONE-CONTINUATION-20261001':lateOpportunityRepair?'V10-LATE-OPPORTUNITY-REPAIR-20261001':lateLevelWindow?'V10-LATE-LEVEL-GODHOOD-WINDOW-20261001':highLevelWindow?'V10-HIGH-LEVEL-GODHOOD-WINDOW-20261001':freeModeWindow?'V10-FREE-MODE-GODHOOD-WINDOW-20261001':opportunityRepair?'V10-GOD-TRIAL-OPPORTUNITY-REPAIR-20261001':tailSecondTier?'V10-SECOND-TIER-TAIL-20261001':repairSecondTier?'V10-SECOND-TIER-REPAIR-20261001':'V10-ASCENSION-CLOSURE-20260930';
const requestedSeeds=args.filter(a=>!['--write-evidence','--repair-second-tier','--second-tier-tail','--opportunity-repair','--free-mode-godhood-window','--high-level-godhood-window','--late-level-godhood-window','--late-opportunity-repair','--six-bone-continuation','--six-bone-opportunity-repair','--six-bone-third-stage-window','--high-six-bone-godhood-window','--independent-ascension-retry'].includes(a));
const seeds=requestedSeeds.length ? requestedSeeds : highSixBoneWindow ? ['ascension-directed-633'] : sixBoneContinuation ? ['ascension-closure-20260930-008'] : freeModeWindow ? ['ascension-closure-20260930-002'] : opportunityRepair ? ['god-trial-tail-20261001-002'] : tailSecondTier ? Array.from({length:4},(_,i)=>'god-trial-tail-20261001-'+String(i).padStart(3,'0')) : repairSecondTier ? ['ascension-directed-3',...Array.from({length:24},(_,i)=>'god-trial-repair-20261001-'+String(i).padStart(3,'0'))] : ['ascension-directed-0','ascension-directed-3','ascension-directed-633',...Array.from({length:16},(_,i)=>'ascension-closure-20260930-'+String(i).padStart(3,'0'))];
if(seeds.length>budget.maxCandidates) throw new Error('candidate-budget');
if(opportunityRepair&&seeds.some(seed=>seed!=='god-trial-tail-20261001-002'))throw new Error('opportunity repair seed not authorized');
if(freeModeWindow && (seeds.length!==1 || seeds[0]!==(highSixBoneWindow?'ascension-directed-633':sixBoneContinuation?'ascension-closure-20260930-008':'ascension-closure-20260930-002')))throw new Error('free-mode window seed not authorized');
let priorPrefix=null, priorPrefixEvents=null, retryComparisonEvents=null;
if(freeModeWindow){
  const out=new URL('docs/evidence/v10-ascension-closure-20260930/',root);
  const snapshots=JSON.parse(await fs.readFile(new URL('snapshots.json',out),'utf8'));
  const replayText=await fs.readFile(new URL('replay.jsonl',out),'utf8');
  if(snapshots.runId!=='V10-ASCENSION-CLOSURE-20260930' || Object.hasOwn(snapshots,evidenceWindowField) || replayText.includes(runId))throw new Error('free-mode evidence ownership or duplicate run');
  if(snapshots.root.replaceAll('\\','/')!==fileURLToPath(root).replaceAll('\\','/'))throw new Error('free-mode evidence root mismatch');
  priorPrefix=(highSixBoneWindow ? snapshots.lives : sixBoneThirdStageWindow ? snapshots.sixBoneOpportunityRepair.lives : sixBoneOpportunityRepair ? snapshots.sixBoneContinuation.lives : lateOpportunityRepair ? snapshots.lateLevelGodhoodWindow.lives : lateLevelWindow ? snapshots.highLevelGodhoodWindow.lives : highLevelWindow ? snapshots.freeModeGodhoodWindow.lives : snapshots.lives).find(l=>l.seed===seeds[0]&&l.packId==='douluo1'&&l.route==='human');
  if(priorPrefix?.calls!==(sixBoneOpportunityRepair?700:prefixCalls) || priorPrefix.stop!==(sixBoneThirdStageWindow?'opportunity-counter-not-increased':sixBoneOpportunityRepair?'budget-exhausted':lateOpportunityRepair?'late-window-limit':highLevelWindow?'first-opportunity-window-exited':'free-mode-no-return'))throw new Error('free-mode prefix identity mismatch');
  priorPrefixEvents=replayText.trim().split('\n').map(line=>JSON.parse(line)).filter(e=>e.seed===seeds[0]&&e.inputIndex<=prefixCalls&&(highSixBoneWindow?e.runId===undefined:sixBoneThirdStageWindow?e.runId==='V10-SIX-BONE-OPPORTUNITY-REPAIR-20261001':sixBoneOpportunityRepair?e.runId==='V10-SIX-BONE-CONTINUATION-20261001':sixBoneContinuation?e.runId===undefined:lateOpportunityRepair?e.runId==='V10-LATE-LEVEL-GODHOOD-WINDOW-20261001':lateLevelWindow?e.runId==='V10-HIGH-LEVEL-GODHOOD-WINDOW-20261001':highLevelWindow?e.runId==='V10-FREE-MODE-GODHOOD-WINDOW-20261001':e.runId==='V10-ASCENSION-CLOSURE-20260930'));
  if(priorPrefixEvents.length!==prefixCalls || priorPrefixEvents.some((e,i)=>e.inputIndex!==i+1))throw new Error('free-mode prefix event mismatch');
  const rebuilt=structuredClone(priorPrefix.initial.session);
  for(const event of priorPrefixEvents)applyDelta(rebuilt,event.changes);
  if(sixBoneOpportunityRepair){
    const all=structuredClone(rebuilt);for(const e of replayText.trim().split('\n').map(JSON.parse).filter(e=>e.runId==='V10-SIX-BONE-CONTINUATION-20261001'&&e.seed===seeds[0]&&e.inputIndex>prefixCalls))applyDelta(all,e.changes);
    if(!isDeepStrictEqual(all,priorPrefix.final.session))throw new Error('six-bone prior full reconstruction failed');
    priorPrefix={...priorPrefix,calls:prefixCalls,final:{...priorPrefix.initial,session:rebuilt}};
  }else if(!isDeepStrictEqual(rebuilt,priorPrefix.final.session))throw new Error('free-mode prior prefix reconstruction failed');
  if(highSixBoneWindow && (index.pack.v10GodTrialSemantics!==(independentAscensionRetry?'douluo1:second-tier-god-trial/5':'douluo1:second-tier-god-trial/4') || rebuilt.character.level!==98 || rebuilt.character.background?.identityId!=='douluo2:identity.god-reincarnation' || rebuilt.character.godTrial || rebuilt.character.godhood || !['leftArm','rightArm','leftLeg','rightLeg','head','torso'].every(part=>rebuilt.character.soulBones.some(b=>b.partId===part))))throw new Error('high six-bone prefix drift');
  if(independentAscensionRetry){
    const prior=snapshots.highSixBoneGodhoodWindow;
    if(prior?.runId!=='V10-HIGH-SIX-BONE-GODHOOD-WINDOW-20261002' || prior.lives[0]?.calls!==157 || prior.lives[0]?.final.runtimeSemantics!=='douluo1:second-tier-god-trial/4')throw new Error('retry comparison ownership mismatch');
    retryComparisonEvents=[...priorPrefixEvents,...replayText.trim().split('\n').map(JSON.parse).filter(e=>e.runId===prior.runId && e.seed===seeds[0] && e.inputIndex>132 && e.inputIndex<=156)];
    if(retryComparisonEvents.length!==156 || retryComparisonEvents.some((e,i)=>e.inputIndex!==i+1))throw new Error('retry comparison event mismatch');
  }
  if(sixBoneThirdStageWindow && (priorPrefix.final.runtimeSemantics!=='douluo1:second-tier-god-trial/4' || rebuilt.character.godTrial?.tier!=='二级' || rebuilt.character.godTrial?.status!=='active' || rebuilt.character.godTrial?.currentStage!==3 || rebuilt.character.level!==40 || priorPrefixEvents.at(-1).optionId!=='65eeb9'))throw new Error('third-stage input drift');
}
// S1-derived pruning applies to target B; the authorized free-mode window tests A.
// The first three fixed diagnostics are sufficient when a concrete gap appears;
// do not expand this list without a new stated hypothesis within the same budget.
let totalSteps=0;
const lives=[];
async function replay(seed,packId='douluo1',route='human',factory=page) {
  const life=await factory.start(packId,{seed,route});
  const game=(await loader.getSourceRuntime(packId)).game;
  const initial=life.exportSnapshot(), events=[], marks=[];
  let stop='budget-exhausted', calls=0, grantAt=null, godhoodBefore=null, godhoodAfter=null;
  let windowEnteredAt=null, prefixVerification=null, lateAnnualCalls=0;
  const expectedPrefix=freeModeWindow?structuredClone(priorPrefix.initial.session):null;
  if(freeModeWindow && !isDeepStrictEqual(initial.session,expectedPrefix))return {seed,packId,route,calls:0,stop:'prefix-initial-divergence',grantAt,godhoodBefore,godhoodAfter,phase:life.phase,error:life.error,initial,final:life.exportSnapshot(),marks,events,windowEnteredAt,prefixVerification:{status:'different-initial',paths:delta(expectedPrefix,initial.session).map(d=>d.path)}};
  for(;calls<budget.maxPerLife;) {
    if(totalSteps>=budget.maxSteps || Date.now()-started>=budget.maxMs){stop='global-budget';break;}
    const beforeSnapshot=life.exportSnapshot(), before=beforeSnapshot.session, wheel=life.wheelView;
    const result=life.step(); calls++;totalSteps++;
    const after=life.session;
    const choices=after.history.slice(before.history.length);
    const story=choices.filter(h=>APK_FORMAL_SCHEDULER_EVIDENCE.storyBranches[before.character.storyBranch]?.some(e=>e.poolId===h.poolId));
    const actualPool=result.spin?.poolId ?? choices.at(-1)?.poolId ?? null;
    const eligibility=packId==='douluo1' && actualPool ? index.getOptions(actualPool).map(o=>({id:o.normalized.option_id,enabled:o.availability.enabled,weight:o.normalized.weight,requirements:o.normalized.requirements.map(r=>({requirement:r,result:requirement(r,before.character)}))})) : [];
    const event={runId,seed,packId,initialRoute:route,inputIndex:calls,input:'step',commitIndex:after.history.length,currentRoute:after.character.route,flowId:result.spin?.flowId??after.currentFlowId,poolId:actualPool,optionId:result.spin?.optionId??null,sourceText:result.spin?.text??choices.at(-1)?.text??null,committed:result.committed,status:result.status,error:result.error??null,rngBefore:before.random,rngAfter:structuredClone(after.random),wheel,eligibility,changes:structuredClone(delta(before,after))};
    events.push(event);
    if(freeModeWindow && calls<=(independentAscensionRetry?156:prefixCalls)){
      applyDelta(expectedPrefix,(independentAscensionRetry?retryComparisonEvents:priorPrefixEvents)[calls-1].changes);
      if(independentAscensionRetry && calls===132){
        expectedPrefix.character.flags['v10:independent-ascension:last-attempt-age']=before.character.age;
        expectedPrefix.character.transactions.push({reason:'v10-source-custom-handler',referenceId:'douluo1:flow.formal-story.1209bb56-d533-48af-b012-204292b96f68:douluo1:handler.formal-story.result',idempotencyKey:'v10-source:douluo1:132:a3e30b:2:0:setFlag',type:'setFlag'});
        event.prefixDeclaredChange={paths:[['character','flags','v10:independent-ascension:last-attempt-age'],['character','transactions']],markerAge:before.character.age,transaction:structuredClone(expectedPrefix.character.transactions.at(-1))};
      }
      if(!isDeepStrictEqual(expectedPrefix,after)){
        prefixVerification={status:'different',input:calls,paths:delta(expectedPrefix,after).map(d=>d.path)};
        event.prefixComparison=prefixVerification;stop='prefix-divergence';break;
      }
      if(independentAscensionRetry && [131,132,156].includes(calls))prefixVerification={status:calls===131?'equal':'equal-with-declared-marker-transaction',calls,fullyEqualCalls:131,declaredFirstDifference:132};
      else if(!independentAscensionRetry && calls===prefixCalls)prefixVerification={status:'equal',calls:prefixCalls};
    }
    if(freeModeWindow && windowEnteredAt===null && after.character.level>=((lateLevelWindow||highSixBoneWindow)?91:highLevelWindow?71:61) && after.character.level<=((lateLevelWindow||highSixBoneWindow)?99:highLevelWindow?90:70))windowEnteredAt=calls;
    if(repairSecondTier && grantAt===null && !before.character.godhood && after.character.godhood){
      grantAt=calls;godhoodBefore=beforeSnapshot;godhoodAfter=life.exportSnapshot();
    }
    if(repairSecondTier && grantAt!==null && calls>=grantAt+20){stop='godhood-plus-20';break;}
    if(story.length || targets.has(actualPool)) marks.push({input:calls,commit:after.history.length,age:before.character.age,timelineAge:before.character.timelineAge,level:before.character.level,power:calculateApkCombatPower(before.character,index.combatPowerEvidence).total,branch:before.character.storyBranch,godhood:before.character.godhood,godTrial:before.character.godTrial,seaTrial:before.character.seaTrial,choices:story.length?story:choices,flags:structuredClone(after.character.flags),eligible:eligibility,wheel});
    if(choices.some(h=>targets.get(h.poolId)===h.optionId)){stop=independentAscensionRetry && !after.character.ending?'ascension-option-without-settlement':'ascension-hit';break;}
    if(life.phase!=='ready'){stop=life.phase;break;}
    if(sixBoneThirdStageWindow && calls>prefixCalls && after.character.godTrial?.claimedRewardStages?.includes(3)){stop='third-stage-submitted';break;}
    if(sixBoneThirdStageWindow && calls>prefixCalls && !after.character.godhood && after.character.godTrial?.status!=='active'){stop='active-trial-prerequisite-lost';break;}
    if(repairSecondTier && after.character.godTrial?.tier && (freeModeWindow || after.character.godTrial.deityId) && after.character.godTrial.tier!=='二级'){stop='outside-approved-second-tier';break;}
    if(packId==='douluo1' && after.character.godTrial?.status==='active'){
      const next=game.flowActions.continueHumanGodTrial({state:structuredClone(after)});
      if(next?.startsWith('humanGodTrialReward:') && !game.flows[next] && !index.getFlow(next)){event.diagnosticOnly={sourceNext:next,sourceFlowPresent:false,indexFlowPresent:!!index.getFlow(next)};stop='source-reward-flow-missing';break;}
    }
    if(!repairSecondTier && packId==='douluo1' && after.character.storyBranch===3){stop='branch-3';break;}
    if(!freeModeWindow && packId==='douluo1' && after.character.flags['formal:d1-story:free-mode'] && !(repairSecondTier && (after.character.godTrial?.tier==='二级'||after.character.godhood))){stop='free-mode-no-return';break;}
    if((highLevelWindow||sixBoneContinuation||highSixBoneWindow) && calls>prefixCalls){
      const sourceOption=index.getRouteOption(event.poolId,event.optionId)?.source;
      const counter=sourceOption?.effects?.find(e=>e.type==='changeCounter'&&e.key==='formal:god-trial-draws'&&e.amount===1);
      const rule=index.getFormalSpecialResultRule(event.poolId,event.optionId);
      if(counter && rule && rule.combatThreshold===undefined && rule.deathThreshold===undefined && !rule.immunity && !(Number(after.character.flags['formal:god-trial-draws'])>Number(before.character.flags['formal:god-trial-draws']??0))){event.diagnosticOnly={sourceCounter:structuredClone(counter),before:before.character.flags['formal:god-trial-draws']??0,after:after.character.flags['formal:god-trial-draws']??0};const knownNonPrerequisite=sixBoneThirdStageWindow && event.poolId==='6f28c153-03f6-45a2-9e1b-7457287e1e8d' && event.optionId==='65eeb9' && before.character.godTrial?.status==='active' && after.character.godTrial?.status==='active' && before.character.godTrial.deityId===after.character.godTrial.deityId;
        if(knownNonPrerequisite)event.diagnosticOnly.disposition='known-gap-not-required-for-active-trial';else{stop='opportunity-counter-not-increased';break;}}
    }
    if((lateLevelWindow||sixBoneThirdStageWindow||highSixBoneWindow) && calls>prefixCalls && before.character.age<after.character.age)lateAnnualCalls++;
    if(highSixBoneWindow && calls>prefixCalls && (calls-prefixCalls>=80 || lateAnnualCalls>=10)){stop='high-six-bone-window-limit';break;}
    if(highSixBoneWindow && !independentAscensionRetry && calls>prefixCalls && (after.character.level<91 || after.character.level>99) && !(Number(after.character.flags['formal:god-trial-draws'])>0) && !['qualified','active'].includes(after.character.godTrial?.status) && !after.character.godhood){stop='high-six-bone-window-exited';break;}
    if(sixBoneThirdStageWindow && calls>prefixCalls && (calls-prefixCalls>=200 || lateAnnualCalls>=30)){stop='third-stage-window-limit';break;}
    if(lateLevelWindow && calls>prefixCalls && (calls-prefixCalls>=200 || lateAnnualCalls>=(lateOpportunityRepair?20:10)) && !after.character.godTrial && !after.character.godhood && !(Number(after.character.flags['formal:god-trial-draws'])>0)){stop='late-window-limit';break;}
    if((sixBoneContinuation||highSixBoneWindow) && calls>prefixCalls && !after.character.godhood && !['leftArm','rightArm','leftLeg','rightLeg','head','torso'].every(part=>after.character.soulBones.some(b=>b.partId===part))){stop='six-bone-prerequisite-lost';break;}
    if(freeModeWindow && !sixBoneContinuation && !highSixBoneWindow && after.character.level>(lateLevelWindow?99:highLevelWindow?90:70) && !(Number(after.character.flags['formal:god-trial-draws'])>0) && !['qualified','active'].includes(after.character.godTrial?.status) && !after.character.godhood){stop='first-opportunity-window-exited';break;}
  }
  return {seed,packId,route,calls,stop,grantAt,godhoodBefore,godhoodAfter,phase:life.phase,error:life.error,initial,final:life.exportSnapshot(),marks,events,...(freeModeWindow?{windowEnteredAt,prefixVerification}:{}),...(sixBoneThirdStageWindow?{thirdStageAnnualCalls:lateAnnualCalls}:{}),...(highSixBoneWindow?{highSixBoneAnnualCalls:lateAnnualCalls}:{})};
}
for(const seed of seeds) { if((freeModeWindow||tailSecondTier||opportunityRepair)&&(totalSteps>=budget.maxSteps||Date.now()-started>=budget.maxMs))break; const found=await replay(seed); lives.push(found); if(found.stop==='ascension-hit'||found.stop==='godhood-plus-20'||(!repairSecondTier&&found.stop==='source-reward-flow-missing')) break; }
const independentVerification=[];
if(repairSecondTier){
  for(const life of lives){
    if(freeModeWindow && !(independentAscensionRetry && life.stop==='ascension-hit' && life.final.session.character.ending) && (life.grantAt===null || !life.events.slice(life.grantAt).some(e=>e.committed))){independentVerification.push({seed:life.seed,status:'not-run-no-godhood-continuation'});continue;}
    if(totalSteps+life.calls>budget.maxSteps || Date.now()-started>=budget.maxMs){independentVerification.push({seed:life.seed,status:'not-run-budget'});break;}
    const independent=await replay(life.seed,life.packId,life.route,createV10LifeRunner({contentLoader:loader}));
    if(!isDeepStrictEqual(life.final,independent.final)) throw new Error('independent replay mismatch: '+life.seed);
    independentVerification.push({seed:life.seed,status:'equal',calls:independent.calls});
  }
}
// This is source-state forensics, not repeat Browser acceptance.
if(!repairSecondTier && !requestedSeeds.length && totalSteps < budget.maxSteps && Date.now()-started < budget.maxMs) lives.push(await replay('day27-beast-3','douluo2','beast'));
const fixed=lives.find(l=>l.seed==='ascension-directed-3');
let continuation=null;
if(!repairSecondTier && fixed?.stop==='free-mode-no-return' && fixed.calls < budget.maxPerLife && totalSteps < budget.maxSteps && Date.now()-started < budget.maxMs){
  const life=await page.start('douluo1',{seed:fixed.seed,route:'human',snapshot:fixed.final});
  const beforeSnapshot=life.exportSnapshot(), before=beforeSnapshot.session, wheel=life.wheelView;
  const result=life.step(); totalSteps++;
  const after=life.session;
  const game=(await loader.getSourceRuntime('douluo1')).game;
  const next=game.flowActions.continueHumanGodTrial({state:structuredClone(after)});
  continuation={seed:fixed.seed,initial:fixed.final,final:life.exportSnapshot(),events:[{seed:fixed.seed,packId:'douluo1',initialRoute:'human',inputIndex:fixed.calls+1,input:'step',commitIndex:after.history.length,currentRoute:after.character.route,flowId:result.spin?.flowId,poolId:result.spin?.poolId,optionId:result.spin?.optionId,sourceText:result.spin?.text,status:result.status,committed:result.committed,error:result.error,rngBefore:before.random,rngAfter:structuredClone(after.random),wheel,changes:delta(before,after),diagnosticOnly:{sourceNext:next,sourceFlowPresent:!!game.flows[next],indexFlowPresent:!!index.getFlow(next),purpose:'source-state diagnosis after irreversible target-search stop; no fabricated state'}}]};
}
const source=await loader.getSourceRuntime('douluo1');
const staticCandidates=candidates.map(([poolId,optionId])=>({poolId,optionId,source:source.game.pools.find(p=>p.id===poolId)?.options.find(o=>o.id===optionId),index:index.getRouteOption(poolId,optionId)}));

const result={schemaVersion:'v10-ascension-audit/1',root:fileURLToPath(root),startedAt:new Date(started).toISOString(),elapsedMs:Date.now()-started,budget,totalSteps,candidates:lives.filter(l=>l.packId==='douluo1').length,seeds,staticCandidates,lives,continuation};
function applyDelta(value, changes){
  for(const change of changes){let parent=value;for(const key of change.path.slice(0,-1))parent=parent[key];const key=change.path.at(-1);if(change.op==='set')parent[key]=structuredClone(change.value);else if(change.op==='delete')delete parent[key];else parent[key].push(...structuredClone(change.value));}return value;
}
for(const trace of [...lives,...(continuation?[continuation]:[])]) {const reconstructed=structuredClone(trace.initial.session);for(const event of trace.events)applyDelta(reconstructed,event.changes);if(!isDeepStrictEqual(reconstructed,trace.final.session))throw new Error('trace reconstruction failed: '+trace.seed);}
if(writeEvidence && repairSecondTier && lives.some(l=>l.events.length)){
  const out=new URL('docs/evidence/v10-ascension-closure-20260930/',root);
  const replayFile=new URL('replay.jsonl',out), snapshotFile=new URL('snapshots.json',out);
  const oldSnapshotsText=await fs.readFile(snapshotFile,'utf8'),oldSnapshots=JSON.parse(oldSnapshotsText);
  const evidenceField=freeModeWindow?evidenceWindowField:opportunityRepair?'opportunityRepair':tailSecondTier?'secondTierTailSearch':'secondTierRepair';
  if(oldSnapshots.runId!=='V10-ASCENSION-CLOSURE-20260930'||oldSnapshots[evidenceField]) throw new Error('既有证据归属或重复修正记录需要检查');
  const oldReplay=await fs.readFile(replayFile,'utf8');
  if(!oldReplay.endsWith('\n')||oldReplay.includes(runId)) throw new Error('既有轨迹归属或重复runId需要检查');
  const traces=lives.map(({events,marks,...trace})=>trace);
  const repair={runId,startedAt:result.startedAt,elapsedMs:result.elapsedMs,budget,totalSteps,candidates:result.candidates,independentVerification,lives:traces};
  await fs.appendFile(replayFile,lives.flatMap(l=>l.events).map(e=>JSON.stringify(e)).join('\n')+'\n');
  // Retain every existing field and byte preceding the closing root brace.
  const at=Buffer.byteLength(oldSnapshotsText.slice(0,oldSnapshotsText.lastIndexOf('}')));
  const addition=Buffer.from(',\n'+JSON.stringify(evidenceField)+':'+JSON.stringify(repair,null,2)+'\n}\n');
  const handle=await fs.open(snapshotFile,'r+');
  try{await handle.write(addition,0,addition.length,at);}finally{await handle.close();}
  console.log(JSON.stringify({runId,totalSteps,candidates:result.candidates,traceReconstruction:'all-pass',independentVerification,rows:traces.map(l=>({seed:l.seed,calls:l.calls,stop:l.stop,grantAt:l.grantAt,ending:l.final.session.character.ending,godhood:l.final.session.character.godhood,...(freeModeWindow?{windowEnteredAt:l.windowEnteredAt,prefixVerification:l.prefixVerification}:{})}))}));
}else if(writeEvidence && !repairSecondTier){
  const out=new URL('docs/evidence/v10-ascension-closure-20260930/',root);
  const replayFile=new URL('replay.jsonl',out), snapshotFile=new URL('snapshots.json',out);
  for(const file of [replayFile,snapshotFile]){try{await fs.access(file);throw new Error('Existing evidence must be read and its ownership checked: '+file);}catch(error){if(error.code!=='ENOENT')throw error;}}
  await fs.mkdir(out,{recursive:true});
  const events=lives.flatMap(l=>l.events);if(continuation)events.push(...continuation.events);
  await fs.writeFile(replayFile,events.map(e=>JSON.stringify(e)).join('\n')+'\n',{flag:'wx'});
  const snapshots={schemaVersion:'v10-ascension-audit-snapshots/1',runId:'V10-ASCENSION-CLOSURE-20260930',root:fileURLToPath(root),startedAt:result.startedAt,elapsedMs:result.elapsedMs,budget,totalSteps,candidates:result.candidates,lives:lives.map(({seed,packId,route,calls,stop,phase,error,initial,final})=>({seed,packId,route,calls,stop,phase,error,initial,final})),continuation:continuation?{seed:continuation.seed,initial:continuation.initial,final:continuation.final,diagnostic:continuation.events[0].diagnosticOnly}:null,staticCandidates};
  await fs.writeFile(snapshotFile,JSON.stringify(snapshots,null,2)+'\n',{flag:'wx'});
  console.log(JSON.stringify({startedAt:result.startedAt,elapsedMs:result.elapsedMs,totalSteps,candidates:result.candidates,rows:snapshots.lives.map(l=>({seed:l.seed,calls:l.calls,stop:l.stop})),traceReconstruction:'all-pass',files:[fileURLToPath(replayFile),fileURLToPath(snapshotFile)]}));
}else console.log(JSON.stringify(result));
