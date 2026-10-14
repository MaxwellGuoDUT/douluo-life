// Project rules approved by the owner on 2026-10-13; not an APK reward mapping.
export const SEA_GOD_ID = '94cc96';
export const ASURA_ID = 'fcac00';
export const SEA_DOMAIN = '海神领域';
export const SEA_TRIDENT = 'v10:sea-god:trident';
export const SEA_RULE_VERSION = 'sea-god-nine/1';
const parts = ['head','torso','leftArm','rightArm','leftLeg','rightLeg'];
export const SEA_GOD_STAGES = Object.freeze([
    [40,'等级+2（最多99级）；水元素进度+1'],[50,'当前全部魂环年限+2000年'],
    [60,'获得10万年魂骨一块'],[70,'水元素进度+1；当前全部魂环年限+3000年'],
    [80,'当前全部魂骨年限+5000年'],[90,'完整海神领域；水元素进度+1'],
    [95,'获得海神三叉戟胚胎'],[98,'水元素进度+1；当前全部魂环、魂骨年限各+10000年'],
    [99,'继承海神一级神位；海神三叉戟完整；开放直接飞升']
].map(([minLevel,text],i)=>Object.freeze({stage:i+1,minLevel,text,id:`v10:sea-god:reward:${i+1}`,poolId:`v10:sea-god:pool:${i+1}`})));
const reject = (code,message)=>{throw Object.assign(new Error(message),{code})};
const gods = c=>[...(c.godhoods??[]),...(c.godhood?[c.godhood]:[])];
export const hasSeaGod = c=>c.seaTrial?.tier==='seaGod'||gods(c).some(g=>g.id===SEA_GOD_ID);
export const hasAsuraGod = c=>gods(c).some(g=>g.id===ASURA_ID);
export const seaGodEligible = c=>c.route!=='beast'&&!hasSeaGod(c)&&gods(c).every(g=>g.id===ASURA_ID);
export const seaGodChoicePending = c=>c.seaTrial?.tier==='seaGod'&&c.seaTrial.status==='completed'&&c.seaTrial.ascensionChoice==='pending';
export function assertSeaGodExclusivity(c) {
    if(hasSeaGod(c)&&gods(c).some(g=>![SEA_GOD_ID,ASURA_ID].includes(g.id)))reject('V10_SEA_GOD_CONFLICT','海神只可与修罗共存；本步未提交，已有神位保留。');
    const t=c.godTrial,selectingAsura=t?.status==='qualified'&&!t.deityId&&t.tier==='神王'&&t.tierSelection?.optionId==='48f196';
    if(hasSeaGod(c)&&t&&['qualified','active'].includes(t.status)&&t.deityId!==ASURA_ID&&!selectingAsura)reject('V10_SEA_GOD_CONFLICT','海神考核期间只允许修罗神考共存。');
}
export function validateSeaGodState(c) {
    const t=c.seaTrial;if(t?.tier!=='seaGod')return;
    const n=t.claimedRewardStages?.length;
    if(t.rulesVersion!==SEA_RULE_VERSION||t.totalStages!==9||t.plannedStages!==9||!['active','completed'].includes(t.status)
        ||!Array.isArray(t.completedStages)||!Array.isArray(t.claimedRewardOptionIds)||!Number.isInteger(n)||n>9
        ||t.completedStages.length!==n||t.claimedRewardOptionIds.length!==n
        ||t.claimedRewardStages.some((s,i)=>s!==i+1||t.completedStages[i]!==s||t.claimedRewardOptionIds[i]!==SEA_GOD_STAGES[i].id)
        ||t.currentStage!==n+1||(t.status==='completed')!==(n===9)
        ||(n<9&&t.ascensionChoice!==undefined)
        ||(n===9&&!['pending','continue','ascended'].includes(t.ascensionChoice)))reject('V10_SEA_GOD_STATE_INVALID','海神九考记录不完整或领奖顺序无效，原数据保留。');
    if(n===9&&!gods(c).some(g=>g.id===SEA_GOD_ID))reject('V10_SEA_GOD_STATE_INVALID','九考完成记录与海神神位不一致。');
    if(t.ascensionChoice==='ascended'&&c.ending?.id!=='douluo1:sea-god-ascension')reject('V10_SEA_GOD_STATE_INVALID','飞升选择与真实终局不一致。');
    assertSeaGodExclusivity(c);
}
export function seaGodMissing(c) {
    const t=c.seaTrial,s=SEA_GOD_STAGES[(t?.currentStage??1)-1];if(!s)return [];
    const missing=[];if(c.level<s.minLevel)missing.push(`${s.minLevel}级（当前${c.level}级）`);
    if(s.stage===9){
        if((c.martialSouls?.[0]?.rings?.length??0)<9)missing.push('主武魂9环');
        const names={head:'头',torso:'躯干',leftArm:'左臂',rightArm:'右臂',leftLeg:'左腿',rightLeg:'右腿'};
        for(const p of parts)if(!c.soulBones?.some(b=>(b.partId??b.id)===p))missing.push(names[p]+'魂骨');
        if(!c.domains?.includes(SEA_DOMAIN))missing.push(SEA_DOMAIN);
        if(!c.artifacts?.some(a=>a.id===SEA_TRIDENT&&['embryo','complete'].includes(a.stage)))missing.push('海神三叉戟胚胎');
    }return missing;
}
export function startSeaGod(session,selection,previousSea=null) {
    const c=session.character;
    // A source handler may just have written its unbridged qualification.
    const current=c.seaTrial;c.seaTrial=previousSea;
    const eligible=seaGodEligible(c);c.seaTrial=current;
    if(!eligible)reject('V10_SEA_GOD_INELIGIBLE','已有其他神位或海神资格，不能再次开始海神九考。');
    if(c.godTrial&&c.godTrial.deityId!==ASURA_ID){
        const old=structuredClone(c.godTrial);
        if(['qualified','active'].includes(old.status)){old.status='abandoned';old.abandonedReason='sea-god-exclusive';}
        c.godTrials.push(old);c.godTrial=null;
        for(const key of Object.keys(c.flags))if(key.startsWith('godTrial'))delete c.flags[key];
    }
    c.seaTrial={tier:'seaGod',rulesVersion:SEA_RULE_VERSION,selection,totalStages:9,plannedStages:9,currentStage:1,
        completedStages:[],claimedRewardStages:[],claimedRewardOptionIds:[],status:'active',startedAtAge:c.age,
        ...(previousSea?{previousTrial:structuredClone(previousSea)}:{})};
    c.flags['formal:d1-scheduler-mode']='annual';c.flags['formal:d1-scheduler-index']=0;c.flags.seaGodTrialPending=false;
    session.timeline.push({kind:'system',text:'海神九考立即开始，仅与修罗神考或神位共存。'});
    validateSeaGodState(c);
}
export function planSeaGod(contentIndex,session) {
    const c=session.character;validateSeaGodState(c);
    if(c.seaTrial.status!=='active'||seaGodMissing(c).length)return null;
    const s=SEA_GOD_STAGES[c.seaTrial.currentStage-1];
    if(!contentIndex.getFlow(s.id))reject('V10_SEA_GOD_FLOW_MISSING','海神九考奖励流程缺失。');
    return {target:s.id,effects:[],reason:'sea-god-nine'};
}
export function claimSeaGod(context,applyEffects) {
    const {session}=context,c=session.character;validateSeaGodState(c);
    const t=c.seaTrial,s=SEA_GOD_STAGES[t.currentStage-1];
    if(t.status!=='active'||!s||context.optionId!==s.id||seaGodMissing(c).length)reject('V10_SEA_GOD_REWARD_INVALID','海神九考尚不满足条件或奖励已领取。');
    const effects=[];
    if([1,4,6,8].includes(s.stage)&&(c.elementProgress?.['水']??0)<4)effects.push({type:'advanceHumanElement',elementId:'水'});
    if(s.stage===1&&c.level<99)effects.push({type:'changeLevel',amount:Math.min(2,99-c.level)});
    const rings={2:2000,4:3000,8:10000}[s.stage];if(rings)effects.push({type:'changeAllSoulRingYears',amount:rings});
    const bones={5:5000,8:10000}[s.stage];if(bones)effects.push({type:'changeAllSoulBoneYears',amount:bones});
    if(s.stage===6&&!c.domains.includes(SEA_DOMAIN))effects.push({type:'addDomain',domainId:SEA_DOMAIN});
    if(s.stage===7&&!c.artifacts.some(a=>a.id===SEA_TRIDENT))effects.push({type:'addArtifact',artifact:{id:SEA_TRIDENT,name:'海神三叉戟',stage:'embryo',rank:1}});
    if(s.stage===3){if(session.pendingSoulBone)reject('V10_SEA_GOD_PENDING_BONE','尚有魂骨未结算，本次奖励保留。');session.pendingSoulBone={years:100000,source:{optionId:s.id,text:s.text}};}
    const asura=c.godTrial?structuredClone(c.godTrial):null;
    if(s.stage===9)effects.push({type:'addArtifact',artifact:{id:SEA_TRIDENT,name:'海神三叉戟',stage:'complete',rank:1}},
        {type:'grantGodhood',godhoodId:SEA_GOD_ID,name:'海神',tier:'一级',maxLevel:139});
    if(effects.length)applyEffects(effects);
    // grantGodhood's ordinary-trial completion must not complete the separate Asura trial.
    if(s.stage===9)session.character.godTrial=asura;
    const next=session.character.seaTrial;
    next.completedStages.push(s.stage);next.claimedRewardStages.push(s.stage);next.claimedRewardOptionIds.push(s.id);next.currentStage++;
    if(s.stage===9){next.status='completed';next.completedAtAge=session.character.age;next.ascensionChoice='pending';}
    validateSeaGodState(session.character);
}
export function seaGodRequirement(r,c) {
    if(r.type==='v10SeaGodEligible')return seaGodEligible(c);
    if(r.type==='v10SeaGodAllowsDeity')return !hasSeaGod(c)||r.deityId===ASURA_ID;
    if(r.type==='v10SeaGodAllowsTier')return !hasSeaGod(c)||r.allowsAsura===true;
    if(r.type==='v10SeaGodStage')return c.seaTrial?.tier==='seaGod'&&c.seaTrial.status==='active'&&c.seaTrial.currentStage===r.stage&&!seaGodMissing(c).length;
    return null;
}
