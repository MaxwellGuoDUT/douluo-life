import { SEA_GOD_STAGES } from './v10-sea-god-runtime.js';
export const HISTORY_PAGE_SIZE = 50;
// Scan only until one page of visible text is found; never build DOM for the whole timeline.
export function historyWindow(timeline, end = timeline.length, pageSize = HISTORY_PAGE_SIZE) {
    const stop = Math.min(Math.max(0, end), timeline.length);
    const entries = [];
    let start = stop;
    while (start > 0 && entries.length < pageSize) {
        const entry = timeline[--start];
        if (typeof entry?.text === 'string' && entry.text.trim()) entries.push(entry);
    }
    entries.reverse();
    return { start, end: stop, entries };
}
// Categories use committed effects or exact known trial stages, never option prose.
export function eventCategory(entry, record) {
    if(entry?.kind !== 'result' || entry.poolId !== record?.poolId || entry.optionId !== record?.optionId) return entry?.kind ?? 'unrecorded';
    if(SEA_GOD_STAGES.some(s=>s.poolId===record.poolId&&s.id===record.optionId)) return 'finale';
    const types = new Set((record.effects ?? []).map(e => e.type));
    if(['ending','death','grantGodhood','startGodTrial','setGodTrialDeity','archiveCompletedGodTrial'].some(t=>types.has(t))) return 'finale';
    if(['addMartialSoul','replaceMartialSoul','awakenMartialSoul','addSoulRing','setSoulRing','addSoulBone','addTalent','addTrait','addSkill','addArtifact','addAttribute','addDomain','addBloodline'].some(t=>types.has(t))) return 'ability';
    if(['changeLevel','setLevel','advanceHumanTime','advanceBeastTime','changeBeastYears','changeBeastYearsWithFloor','setBeastYears','advanceBeastElement','advanceHumanElement'].some(t=>types.has(t))) return 'growth';
    return entry.kind;
}
function timelineCategory(history) {
    let resultIndex=0;
    return entry=>eventCategory(entry,entry?.kind==='result'?history[resultIndex++]:null);
}
export function lifeReview(timeline, history=[]) {
    if(!timeline.length) return '人生尚未留下记事。';
    const categoryOf=timelineCategory(history);
    const milestones=timeline.map((e,i)=>({e,i,category:categoryOf(e)}))
        .filter(item=>['ability','finale'].includes(item.category));
    const chosen=[...milestones.slice(0,2),...milestones.slice(-3)].filter((item,i,items)=>items.findIndex(x=>x.i===item.i)===i);
    return `从开局走到第${timeline.length}条记事；以下是有已提交机制或直接效果记录的能力与神考/终局节点（不代表条件文字中的奖励必然生效）：`
        + (chosen.length ? '\n'+chosen.map(({e,i})=>`第${i+1}条：${e.text}`).join('\n') : ' 尚无可可靠提取的关键节点，可查阅完整记事。');
}
export function createV10HistoryView({ list, older, newer, latest, status, getTimeline, getHistory=()=>[], filter, search, review, document = globalThis.document }) {
    // null follows the latest page; a numeric end anchors an older page across appends.
    let end = null;
    let lastRender = null;
    let reviewed = null;
    let filtered = null;
    function matching() {
        const timeline=getTimeline(), history=getHistory(), category=filter?.value ?? 'all', query=(search?.value ?? '').trim().toLocaleLowerCase();
        if(category==='all' && !query) return timeline;
        if(filtered?.timeline===timeline && filtered.length===timeline.length && filtered.history===history && filtered.category===category && filtered.query===query) return filtered.entries;
        const categoryOf=timelineCategory(history);
        const entries=timeline.filter(entry=> {
            const recordedCategory=categoryOf(entry);
            return (category==='all' || recordedCategory===category)
                && (!query || entry.text?.toLocaleLowerCase().includes(query));
        });
        filtered={timeline,length:timeline.length,history,category,query,entries};
        return entries;
    }
    function render() {
        const timeline = matching();
        const window = historyWindow(timeline, end ?? timeline.length);
        const unchanged=lastRender?.timeline===timeline && lastRender.start===window.start && lastRender.end===window.end;
        lastRender={timeline,start:window.start,end:window.end};
        if(!unchanged) list.replaceChildren(...window.entries.map(entry => {
            const item = document.createElement('li');
            item.textContent = entry.text;
            return item;
        }));
        list.start = window.start + 1;
        older.disabled = window.start === 0;
        newer.disabled = window.end >= timeline.length;
        latest.disabled = end === null;
        status.textContent = (window.entries.length
            ? `记录 ${window.start + 1}–${window.end} / ${timeline.length}` : '没有匹配的记事') + ` · 匹配 ${timeline.length} / 完整 ${getTimeline().length} 条`;
        if(review && (reviewed?.timeline!==getTimeline() || reviewed.length!==getTimeline().length)) {
            review.textContent=lifeReview(getTimeline(),getHistory());reviewed={timeline:getTimeline(),length:getTimeline().length};
        }
        return window;
    }
    older.addEventListener('click', () => {
        const timeline=matching();
        end = historyWindow(timeline, end ?? timeline.length).start;
        render();
    });
    newer.addEventListener('click', () => {
        const timeline = matching();
        let next = end ?? timeline.length;
        let count = 0;
        while (next < timeline.length && count < HISTORY_PAGE_SIZE) {
            const entry = timeline[next++];
            if (typeof entry?.text === 'string' && entry.text.trim()) count++;
        }
        end = next >= timeline.length ? null : next;
        render();
    });
    latest.addEventListener('click', () => { end = null; render(); });
    filter?.addEventListener('change',()=>{end=null;lastRender=null;render();});
    search?.addEventListener('input',()=>{end=null;lastRender=null;render();});
    return { render, reset() { end = null; lastRender=null;filtered=null;reviewed=null;if(filter)filter.value='all';if(search)search.value=''; } };
}
