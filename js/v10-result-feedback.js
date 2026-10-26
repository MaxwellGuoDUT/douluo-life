// UI-only projection of a committed before/after pair. Never reads probabilities,
// executes effects, or infers a reward from option/requirement prose.
const list = value => Array.isArray(value) ? value : [];
const name = item => typeof item === 'string' ? item : item?.name ?? item?.text ?? null;
const countRings = character => list(character?.martialSouls).reduce((sum, soul) => sum + list(soul.rings).length, 0);
const gods = character => list(character?.godhoods).length || (character?.godhood ? 1 : 0);
const countClaims = character => list(character?.seaTrial?.claimedRewardStages).length
    + list(character?.godTrial?.claimedRewardStages).length;

export function prepareResultFeedback(before, after, changes = []) {
    const levelDelta = Number.isFinite(before.level) && Number.isFinite(after.level) ? after.level - before.level : 0;
    const ringDelta = countRings(after) - countRings(before);
    const souls = list(after.martialSouls), previousSouls = list(before.martialSouls);
    let kind = '命运结果', title = null, tone = 'neutral';
    if (before.route === 'beast' && after.route === 'transformed') {
        kind = '化形'; title = '化形为人'; tone = 'important';
    } else if (gods(after) > gods(before)) {
        kind = '神位'; title = '获得神位'; tone = 'important';
    } else if (souls.length > previousSouls.length) {
        kind = previousSouls.length ? '武魂变化' : '武魂觉醒';
        title = previousSouls.length ? '获得新的武魂' : name(souls[0]) ?? '武魂已觉醒'; tone = 'important';
    } else if (ringDelta > 0) {
        kind = '魂环获取'; title = `获得${ringDelta === 1 ? '一枚' : ringDelta + '枚'}魂环`; tone = 'important';
    } else if (list(after.soulBones).length > list(before.soulBones).length) {
        kind = '魂骨获取'; title = '获得魂骨'; tone = 'important';
    } else if (countClaims(after) > countClaims(before)) {
        kind = '考核奖励'; title = '领取考核奖励'; tone = 'important';
    } else if (levelDelta !== 0) {
        kind = '修炼成长'; title = `魂力${levelDelta > 0 ? '提升' : '倒退'} ${Math.abs(levelDelta)} 级`;
        tone = levelDelta < 0 ? 'setback' : 'growth';
    } else if (before.route === 'beast' && after.route === 'beast'
        && Number.isFinite(before.beastYears) && Number.isFinite(after.beastYears)
        && before.beastYears !== after.beastYears) {
        const delta = after.beastYears - before.beastYears;
        kind = '魂兽成长'; title = `修为${delta > 0 ? '增加' : '减少'} ${Math.abs(delta).toLocaleString('zh-CN')} 年`;
        tone = delta < 0 ? 'setback' : 'growth';
    }
    // Mechanic changes precede bookkeeping. Full strings remain in the existing
    // disclosure; compact chips must not reproduce an entire multi-soul archive.
    const priority = ['路线', '神位', '武魂与魂环', '魂骨', '普通神考进度', '海神岛考核进度', '等级', '修为年限', '天赋', '特质', '技能', '领域', '属性', '血脉', '铜灵币', '实际年龄'];
    const ranked = changes.map((text, index) => ({ text, index,
        rank: priority.findIndex(label => text.startsWith(label + ' ') || text.startsWith(label + '：')) }));
    ranked.sort((a, b) => (a.rank < 0 ? 99 : a.rank) - (b.rank < 0 ? 99 : b.rank) || a.index - b.index);
    let highlights = ranked.slice(0, 3).map(({text}) => {
        const readable = text.replace(/^等级 /u, '魂力 ');
        return readable.length > 88 ? readable.slice(0, 87) + '…' : readable;
    });
    if (souls.length > previousSouls.length) {
        highlights = [`武魂 ${previousSouls.length} → ${souls.length} 个`,
            ...(levelDelta ? [`魂力 ${before.level} → ${after.level}（${levelDelta > 0 ? '+' : ''}${levelDelta}）`] : [])];
    }
    if (ringDelta > 0) {
        const newRings = souls.flatMap((soul, index) => list(soul.rings).slice(list(previousSouls[index]?.rings).length));
        const years = newRings.filter(ring => Number.isFinite(ring.years)).map(ring => `${ring.years.toLocaleString('zh-CN')}年`);
        highlights = [`魂环 ${countRings(before)} → ${countRings(after)} 枚`,
            ...(years.length ? [`新魂环年限 ${years.join('、')}`] : []),
            ...(levelDelta ? [`魂力 ${before.level} → ${after.level}（${levelDelta > 0 ? '+' : ''}${levelDelta}）`] : [])];
    }
    return Object.freeze({ kind, title, tone, highlights });
}

export function createResultFeedbackDisplay(fields, document = globalThis.document) {
    return function renderResultFeedback({ feedback = null, phase = 'ready', character = {}, text = null, ending = null, changes = [] } = {}) {
        const stopped = ['boundary', 'error'].includes(phase), completed = phase === 'completed';
        const raw = typeof text === 'string' ? text.trim() : '';
        let kind = feedback?.kind ?? (raw ? '上次抽取' : '命运转盘');
        let title = feedback?.title ?? (raw && raw.length <= 36 ? raw : raw ? '命运已揭晓' : '等待抽取');
        let tone = feedback?.tone ?? 'neutral';
        let summary = '';
        if (completed) { kind = '人生结局'; title = ending?.title ?? character.ending?.title ?? '旅程结束'; tone = 'ending'; summary = ending?.text ?? character.ending?.text ?? raw; }
        else if (stopped) { kind = '推进暂停'; title = '本步未提交'; tone = 'neutral'; summary = '已保留此前的人生进度，可保存或导出。'; }
        else if (raw && !feedback?.title && raw.length > 36) summary = raw.length > 140 ? raw.slice(0, 139) + '…' : raw;
        if (!completed && character.flags?.['formal:deferred-ending:douluo1:story:independent-ascension'] === true) {
            summary = [summary, '已记录飞升选项，尚未形成飞升结局；后续仍须满足条件并实际结算。'].filter(Boolean).join(' ');
        }
        const age = character.route === 'beast'
            ? character.beast?.chronologicalAge ?? character.beastOrigin?.chronologicalAge : character.age;
        fields['result-kind'].textContent = kind + (Number.isFinite(age) ? ` · ${age.toLocaleString('zh-CN')}岁` : '');
        fields['result-title'].textContent = title;
        fields['result-summary'].textContent = summary;
        fields['result-summary'].hidden = !summary;
        fields['result-feedback'].setAttribute('data-tone', tone);
        const highlights = stopped || completed ? [] : feedback?.highlights ?? [];
        fields['result-highlights'].replaceChildren(...highlights.map(text => {
            const item = document.createElement('li'); item.textContent = text; return item;
        }));
        fields['result-highlights'].hidden = highlights.length === 0;
        fields['result-change-details'].hidden = changes.length === 0;
        fields['result-source'].hidden = !raw;
    };
}
