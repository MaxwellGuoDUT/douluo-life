import { actualAge, actualAgeText } from './v10-display.js';
export const packName = id => ({douluo1:'斗罗大陆 · 唐三时代',douluo2:'绝世唐门 · 霍雨浩时代'}[id] ?? '时代未记录');
export const routeName = route => ({human:'人类',beast:'魂兽',transformed:'化形后人类'}[route] ?? '路线未记录');
const name = item => typeof item === 'string' ? item : item?.name ?? item?.text ?? item?.title ?? '名称未记录';
const number = value => Number.isFinite(value) ? value.toLocaleString('zh-CN') : '来源未记录';
// Only small, displayable values are retained. Never clone a session or execute a rule.
export function growthFacts(c) {
    const facts = new Map();
    if(c.route !== 'beast') facts.set('等级', c.level);
    if(c.route === 'beast') facts.set('修为年限', c.beastYears);
    facts.set('实际年龄',actualAge(c));
    facts.set('容貌等级',c.appearanceRank);
    for(const [label,key] of [['普通神考进度','godTrial'],['海神岛考核进度','seaTrial']]) {
        const trial=c[key];
        const tier={yellow:'黄级',purple:'紫级',black:'黑级',top:'顶级',seaGod:'海神九考',三级:'三级',二级:'二级',一级:'一级',神王:'神王'}[trial?.tier]??'层级来源未记录';
        const status={qualified:'资格已记录',active:'考核中',completed:'考核完成',failed:'考核失败',abandoned:'考核已结束'}[trial?.status]??'状态来源未记录';
        facts.set(label,trial ? `${tier} · ${status} · 已领取${trial.claimedRewardStages?.length??'来源未记录'}/${trial.totalStages??trial.total??'来源未记录'}考奖励` : '');
    }
    facts.set('铜灵币',c.wallet?.copper ?? c.money);
    const describe = item => name(item) + (Number.isFinite(item?.years) ? ` · ${number(item.years)}年` : '')
        + (Number.isFinite(item?.level) ? ` · ${item.level}级` : '') + (Number.isFinite(item?.rank) ? ` · 阶${item.rank}` : '') + (item?.quality ? ` · ${item.quality}` : '');
    facts.set('武魂与魂环',(c.martialSouls ?? []).map(s => `${name(s)}：${(s.rings ?? []).map(describe).join('、') || '尚无魂环'}`).join('；'));
    for(const [label,key] of [['魂骨','soulBones'],['天赋','talents'],['特质','traits'],['技能','skills'],['领域','domains'],['神器','artifacts'],['神位','godhoods'],['属性','attributes'],['血脉','bloodlines']]) {
        facts.set(label,(c[key] ?? []).map(describe).join('；'));
    }
    facts.set('血脉融合',(c.beast?.bloodlines ?? []).map(line=>{
        const selection=line.selection ?? line,component=c.beast?.bloodlineComponents?.find(part=>part.bloodlineId===selection.optionId);
        return name(selection)+(Number.isFinite(component?.ratioBasisPoints)?` ${component.ratioBasisPoints/100}%`:'');
    }).join('；'));
    facts.set('元素进度',JSON.stringify({...c.beast?.attributeStages,...c.elementProgress}));
    facts.set('路线',routeName(c.route));
    return facts;
}
export function growthChanges(before,after) {
    const a=growthFacts(before),b=growthFacts(after),changes=[];
    for(const [label,to] of b) {
        const from=a.get(label);
        if(Object.is(from,to)) continue;
        if(typeof to==='number' && typeof from==='number') changes.push(`${label} ${number(from)} → ${number(to)}（${to-from>0?'+':''}${number(to-from)}）`);
        else if(label==='元素进度') changes.push(`元素进度 ${from} → ${to}`);
        else {
            const text=value=>value==null?'来源未记录':value===''?'尚无记录':String(value);
            changes.push(`${label}：${text(from)} → ${text(to)}`);
        }
    }
    return changes;
}
export function nextGoal(c,packId,phase,trialText) {
    if(['boundary','error'].includes(phase)) return '运行时暂不支持或结算失败：请保存、导出当前人生，并复制问题信息。未判定为死亡。';
    if(phase==='completed') return '这段人生已结束，可保存回顾、同种子重播或开始随机新人生。';
    if(trialText) return trialText + '；完整条件请查看「神考、神位与称号」。奖励是否获得以实际结算为准。';
    if(c.godhood || c.godhoods?.length) return '已获得神位，人生仍在继续；成神不等于飞升结束，后续事件仍按源规则结算。';
    return c.route==='beast' ? '继续积累修为并应对遭遇；化形、突破和终局由实际事件决定，不保证出现。具体突破条件来源未记录。'
        : '继续成长、收集魂环与能力；当前具体突破条件来源未记录，请以抽取和结算提示为准。';
}
export function endingText(life) {
    const c=life.session.character,ending=c.ending ?? life.summary?.ending;
    const stopped=['boundary','error'].includes(life.phase);
    const title=stopped ? '内容中断 / 结算停止（未判定死亡）' : ending?.id?.endsWith(':v10-human-natural-lifespan') ? '寿终' : ending?.title ?? '人生结局';
    const peak=c.flags?.['v10:lifespan:peak-level'];
    const reason=[ending?.text, ['death','success'].includes(ending?.kind) ? life.session.history.at(-1)?.text : null, ending?.cause]
        .find(text=>typeof text==='string' && text.trim() && !/^formal:|^[0-9a-f]{8}-/u.test(text));
    return [title,packName(life.session.packId),routeName(c.route),`实际年龄 ${actualAgeText(c)}`,
        c.route==='beast'?`修为 ${number(c.beastYears)}年`:`等级 ${number(c.level)}${Number.isFinite(peak)?` · 最高等级 ${peak}`:''}`,
        stopped ? '未完成的步骤已回滚。已提交的人生可以保存和导出，技术详情见问题信息。' : reason,
        (c.martialSouls ?? []).length ? `武魂：${c.martialSouls.map(name).join('、')}` : null,
        (c.godhoods ?? []).length ? `神位：${c.godhoods.map(name).join('、')}` : null,
        `已记录 ${life.session.history.length} 次抽取`].filter(Boolean).join(' · ');
}
export function problemInfo(life,error=null) {
    const session=life?.session;
    return JSON.stringify({version:'1.1.0',pack:session?.packId ?? null,
        route:session?.character?.route ?? null,seed:life?.seed ?? session?.random?.seed ?? null,
        phase:life?.phase ?? 'not-started',flow:session?.currentFlowId ?? null,pool:session?.currentPoolId ?? null,
        code:error?.code ?? life?.error?.code ?? null,
        recent:(session?.timeline ?? []).slice(-5).map(e=>({kind:e.kind,text:e.text.slice(0,240)}))},null,2);
}
