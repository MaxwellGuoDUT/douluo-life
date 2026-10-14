// Source-derived reward closure; effects remain in claimHumanGodTrialReward.
import { V10_GOD_TRIAL_STAGES, V10_GOD_TRIAL_POOLS } from './v10-god-trial-data.js';
import { V10_SEA_TRIAL_STAGES, V10_SEA_TRIAL_POOLS, V10_SEA_TRIAL_FLOWS } from './v10-sea-trial-data.js';
import { SEA_GOD_STAGES, ASURA_ID, planSeaGod, seaGodRequirement } from './v10-sea-god-runtime.js';
export { V10_GOD_TRIAL_STAGES, V10_GOD_TRIAL_POOLS };
export { V10_SEA_TRIAL_STAGES, V10_SEA_TRIAL_POOLS, V10_SEA_TRIAL_FLOWS };
export const V10_GOD_TRIAL_SEMANTICS = 'douluo1:god-and-sea-trials/8';
export const V10_GOD_TRIAL_CONTENT = JSON.stringify([V10_GOD_TRIAL_SEMANTICS, V10_GOD_TRIAL_STAGES, V10_GOD_TRIAL_POOLS, V10_SEA_TRIAL_STAGES, V10_SEA_TRIAL_POOLS, V10_SEA_TRIAL_FLOWS, SEA_GOD_STAGES]);

function boundary(code, message) { throw Object.assign(new Error(message), { code }); }
const exact = value => typeof value === 'string' ? {kind:'exact-string',value,resolved:true} : {kind:'absent'};

export function withV10GodTrialRuntime(loaded, sourcePack, route) {
    if (sourcePack?.manifest?.id !== 'douluo1' || !['human','beast'].includes(route)) return loaded;
    if (typeof sourcePack.game?.customHandlers?.claimHumanGodTrialReward !== 'function'
        || typeof sourcePack.game?.flowActions?.continueHumanGodTrial !== 'function') {
        boundary('V10_GOD_TRIAL_SOURCE_MISSING', '普通神考缺少源奖励或继续处理器。');
    }
    for (const name of ['claimHumanSeaTrialReward','startHumanSeaTrial','planHumanSeaTrialStages','finishRemainingHumanSeaTrial']) {
        if(typeof sourcePack.game?.customHandlers?.[name]!=='function') boundary('V10_SEA_TRIAL_SOURCE_MISSING','海神岛缺少源处理器：'+name);
    }
    if(typeof sourcePack.game?.flowActions?.continueHumanSeaTrial!=='function') boundary('V10_SEA_TRIAL_SOURCE_MISSING','海神岛缺少源继续处理器。');
    const routeGraph = structuredClone(loaded.routeGraph);
    const pack = routeGraph.packs.find(item => item.id === 'douluo1');
    for (const dependency of ['humanPrepareSoulBonePart', 'humanSoulBonePart', 'humanGodTrialContinue', 'humanSeaTrialContinue', 'humanPrepareMartialAwakening']) {
        if (!pack.flows.some(flow => flow.id === dependency)) {
            boundary('V10_GOD_TRIAL_CLOSURE_MISSING', '普通神考缺少后继流程：' + dependency);
        }
    }
    for (const sourcePool of [...V10_GOD_TRIAL_POOLS,...V10_SEA_TRIAL_POOLS]) {
        if (pack.pools.some(pool => pool.id === sourcePool.id)) {
            boundary('V10_GOD_TRIAL_SOURCE_DRIFT', '神考奖励池已存在，必须先核对来源：' + sourcePool.id);
        }
        const source = structuredClone(sourcePool);
        pack.pools.push({id:source.id,source,options:source.options.map(option=>({
            id:option.id,source:option,route:{next:exact(option.next),customHandler:exact(option.customHandler),
                followUps:[],requirements:option.requirements??[],rerollWhen:option.rerollWhen??[],effects:[]}
        }))});
    }
    for (const source of [...V10_GOD_TRIAL_STAGES.map(stage=>({id:stage.stepId,poolId:stage.poolId})),...V10_SEA_TRIAL_FLOWS]) {
        if (pack.flows.some(flow=>flow.id===source.id)) boundary('V10_GOD_TRIAL_SOURCE_DRIFT', '考核流程已存在：'+source.id);
        pack.flows.push({id:source.id,source,route:{pool:exact(source.poolId),next:exact(),action:exact(),
            getNext:exact(),leaveNext:exact(),possibleNext:[]}});
    }
    for(const s of SEA_GOD_STAGES){
        const source={id:s.id,text:s.text,wheelLabel:s.text,weight:1,enabled:true,requirements:[{type:'v10SeaGodStage',stage:s.stage}],effects:[],customHandler:'v10:sea-god:reward',next:s.stage===3?'humanPrepareSoulBonePart':'humanPlan'};
        const name=`海神独立九考 · 第${s.stage}考`;
        pack.pools.push({id:s.poolId,name,source:{id:s.poolId,name,options:[source]},options:[{id:s.id,source,route:{next:exact(source.next),customHandler:exact(source.customHandler),effects:[],requirements:source.requirements,rerollWhen:[],followUps:[]}}]});
        pack.flows.push({id:s.id,source:{id:s.id,poolId:s.poolId},route:{pool:exact(s.poolId),next:exact(),action:exact(),getNext:exact(),leaveNext:exact(),possibleNext:[]}});
    }
    for(const pool of pack.pools)for(const o of pool.options){
        const requirements=[...(o.route.requirements??[])];
        if(['710c23','d58e35','94cc96'].includes(o.id)){
            o.source.v10OriginalHandler=o.source.customHandler??null;
            o.source.effects=[];o.route.effects=[];
            o.source.customHandler='v10:sea-god:start';o.route.customHandler=exact(o.source.customHandler);
            o.source.next='humanPlan';o.route.next=exact('humanPlan');
            o.source.text=o.source.wheelLabel='海神九考（独立九考，立即开始；仅与修罗共存）';
            delete o.source.unresolvedReason;delete o.source.unresolvedSeverity;
            requirements.push({type:'v10SeaGodEligible'});
        }
        for(const effect of o.route.effects??[]){
            if(effect.type==='startGodTrial'){
                const next=pack.flows.find(f=>f.id===o.route.next?.value),target=pack.pools.find(p=>p.id===next?.route.pool?.value);
                requirements.push({type:'v10SeaGodAllowsTier',allowsAsura:target?.options.some(candidate=>candidate.id===ASURA_ID)===true});
            }
            if(effect.type==='setGodTrialDeity'||effect.type==='grantGodhood')requirements.push({type:'v10SeaGodAllowsDeity',deityId:effect.deityId??effect.godhoodId});
        }
        o.route.requirements=requirements;o.source.requirements=structuredClone(requirements);
    }
    pack.v10GodTrialSemantics=V10_GOD_TRIAL_SEMANTICS;
    return {...loaded,routeGraph};
}

export function planV10GodTrialReward(contentIndex, session) {
    if (contentIndex?.pack?.v10GodTrialSemantics !== V10_GOD_TRIAL_SEMANTICS) return null;
    if (session.character.route === 'beast') return null;
    const trial=session.character.godTrial;
    if (!trial || trial.status !== 'active' || !trial.deityId) return null;
    const stage=V10_GOD_TRIAL_STAGES.find(item=>item.tier===trial.tier && item.stage===trial.currentStage);
    if (!stage || !Array.isArray(trial.claimedRewardStages)) boundary('V10_GOD_TRIAL_STATE_INVALID','神考层级、阶段或领取记录无效。');
    if (trial.claimedRewardStages.includes(trial.currentStage) || session.character.level < stage.minLevel) return null;
    if (!contentIndex.getFlow(stage.stepId)) boundary('V10_GOD_TRIAL_CLOSURE_MISSING','神考奖励流程未注册：'+stage.stepId);
    return {target:stage.stepId,effects:[],reason:'v10-god-trial-reward'};
}

// Source zt / qc: use the shared seaTrial state, never alias formal pool/option IDs.
export function planV10SeaTrial(contentIndex, session) {
    if(contentIndex?.pack?.v10GodTrialSemantics!==V10_GOD_TRIAL_SEMANTICS || session.character.route==='beast') return null;
    const c=session.character, trial=c.seaTrial;
    if(!trial || !['qualified','active'].includes(trial.status)) return null;
    if(trial.tier==='seaGod') {
        return planSeaGod(contentIndex,session);
    }
    if(trial.status!=='active') return null;
    if(!Number.isSafeInteger(trial.currentStage) || !Array.isArray(trial.claimedRewardStages)) boundary('V10_SEA_TRIAL_STATE_INVALID','海神岛考次或领取记录无效。');
    let target=null;
    if(trial.currentStage<=trial.plannedStages) {
        if(trial.claimedRewardStages.includes(trial.currentStage)) boundary('V10_SEA_TRIAL_STATE_INVALID','当前海神岛奖励已经领取，拒绝重复结算。');
        const stage=V10_SEA_TRIAL_STAGES.find(s=>s.tier===trial.tier&&s.stage===trial.currentStage);
        if(!stage) boundary('V10_SEA_TRIAL_STATE_INVALID','海神岛考次没有源奖励池。');
        target=`humanSeaTrialReward:${stage.tier}:${stage.stage}`;
    } else if(trial.currentStage<=trial.totalStages && (c.timelineAge??c.age)>=25 && !c.flags?.seaTrialBeforeGodWarChecked) target='humanSeaTrialBeforeGodWar';
    if(!target) return null;
    if(!contentIndex.getFlow(target)) boundary('V10_SEA_TRIAL_CLOSURE_MISSING','海神岛后继流程未注册：'+target);
    return {target,effects:[],reason:'v10-sea-trial'};
}

export function evaluateV10GodTrialRequirement(record, character, fallback) {
    const requirement=record?.normalized?.requirement??record?.requirement??record;
    const trial=character.godTrial;
    const sea=seaGodRequirement(requirement,character);
    if(sea!==null)return {status:sea?'met':'not_met',requirementType:requirement.type};
    let met;
    switch(requirement?.type) {
        case 'godTrialStatusIs': met=trial?.status===requirement.value; break;
        case 'godTrialTierIs': met=trial?.tier===requirement.value; break;
        case 'godTrialStageIs': met=trial?.currentStage===requirement.value; break;
        case 'godTrialRewardUnclaimed': met=!!trial && Array.isArray(trial.claimedRewardStages) && !trial.claimedRewardStages.includes(requirement.stage); break;
        case 'seaTrialStatusIs': met=character.seaTrial?.status===requirement.value; break;
        case 'seaTrialTierIs': met=character.seaTrial?.tier===requirement.value; break;
        case 'seaTrialStageIs': met=character.seaTrial?.currentStage===requirement.value; break;
        case 'seaTrialRewardUnclaimed': met=!!character.seaTrial && Array.isArray(character.seaTrial.claimedRewardStages) && !character.seaTrial.claimedRewardStages.includes(requirement.stage); break;
        default: return fallback(record,character);
    }
    return {status:met?'met':'not_met',requirementType:requirement.type};
}
