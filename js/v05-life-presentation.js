function numberOr(value, fallback = 0) {
    return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function soulKey(soul, index) {
    return soul?.instanceId ?? soul?.id ?? soul?.name ?? `soul-${index}`;
}

function ringSnapshot(ring = {}) {
    return {
        id: ring.id ?? ring.optionId ?? ring.source?.optionId ?? null,
        name: ring.name ?? ring.text ?? "未命名魂环",
        years: ring.years ?? null,
        type: ring.typeSelection?.text ?? ring.type ?? null,
        species: ring.speciesSelection?.text ?? ring.species ?? null,
        acquiredAge: ring.acquiredAge ?? null
    };
}

function martialSoulSnapshot(soul = {}, index = 0) {
    return {
        key: soulKey(soul, index),
        id: soul.id ?? null,
        name: soul.name ?? soul.id ?? `武魂 ${index + 1}`,
        category: soul.category ?? null,
        quality: soul.quality ?? soul.grade ?? null,
        awakenedAge: soul.awakenedAge ?? null,
        rings: (soul.rings ?? []).map(ringSnapshot)
    };
}

function soulBoneSnapshot(bone = {}, index = 0) {
    return {
        key: bone.instanceId ?? bone.id ?? bone.name ?? `bone-${index}`,
        id: bone.id ?? null,
        name: bone.name ?? bone.id ?? `魂骨 ${index + 1}`,
        part: bone.part ?? bone.partId ?? null,
        years: bone.years ?? null
    };
}

function collectSoulBones(character = {}) {
    const source = character.soulBones;
    if (Array.isArray(source)) return source;
    if (!source || typeof source !== "object") return [];
    return Object.values(source).flatMap(value => (
        Array.isArray(value) ? value : value ? [value] : []
    ));
}

export function snapshotV05Character(character = {}) {
    return {
        age: numberOr(character.age),
        level: numberOr(character.level, 1),
        copper: numberOr(character.copper ?? character.wallet?.copper),
        rank: character.rank ?? null,
        route: character.route ?? null,
        martialSouls: (character.martialSouls ?? []).map(martialSoulSnapshot),
        soulBones: collectSoulBones(character).map(soulBoneSnapshot)
    };
}

function scalarChange(before, after) {
    return Object.is(before, after) ? null : { before, after };
}

function addedByKey(before = [], after = []) {
    const existing = new Set(before.map(item => item.key));
    return after.filter(item => !existing.has(item.key));
}

function addedRings(before = [], after = []) {
    const beforeBySoul = new Map(before.map(soul => [soul.key, soul]));
    return after.flatMap(soul => {
        const previousCount = beforeBySoul.get(soul.key)?.rings?.length ?? 0;
        return soul.rings.slice(previousCount).map(ring => ({
            soulKey: soul.key,
            soulName: soul.name,
            ...ring
        }));
    });
}

export function describeV05CharacterChanges(before, after) {
    const previous = snapshotV05Character(before);
    const current = snapshotV05Character(after);
    return {
        age: scalarChange(previous.age, current.age),
        level: scalarChange(previous.level, current.level),
        copper: scalarChange(previous.copper, current.copper),
        rank: scalarChange(previous.rank, current.rank),
        route: scalarChange(previous.route, current.route),
        martialSoulsAdded: addedByKey(previous.martialSouls, current.martialSouls),
        soulRingsAdded: addedRings(previous.martialSouls, current.martialSouls),
        soulBonesAdded: addedByKey(previous.soulBones, current.soulBones)
    };
}

export function presentationChangeLabels(changes = {}) {
    const labels = [];
    if (changes.age) labels.push(`年龄 ${changes.age.before} → ${changes.age.after}`);
    if (changes.level) labels.push(`等级 ${changes.level.before} → ${changes.level.after}`);
    if (changes.copper) {
        const delta = changes.copper.after - changes.copper.before;
        labels.push(`铜灵币 ${changes.copper.before} → ${changes.copper.after}（${delta >= 0 ? "+" : ""}${delta}）`);
    }
    if (changes.rank) labels.push(`境界 ${changes.rank.before ?? "-"} → ${changes.rank.after ?? "-"}`);
    if (changes.route) labels.push(`路线 ${changes.route.before ?? "-"} → ${changes.route.after ?? "-"}`);
    for (const soul of changes.martialSoulsAdded ?? []) {
        labels.push(`觉醒武魂：${soul.name}`);
    }
    for (const ring of changes.soulRingsAdded ?? []) {
        const details = [ring.years ? `${ring.years}年` : null, ring.type, ring.species]
            .filter(Boolean)
            .join(" · ");
        labels.push(`新增魂环：${ring.soulName}${details ? `（${details}）` : ""}`);
    }
    for (const bone of changes.soulBonesAdded ?? []) {
        labels.push(`获得魂骨：${bone.name}`);
    }
    return labels;
}

export function createV05PresentationRecord({
    index,
    spin,
    beforeCharacter,
    afterCharacter,
    randomCursor
}) {
    const before = snapshotV05Character(beforeCharacter);
    const after = snapshotV05Character(afterCharacter);
    const changes = describeV05CharacterChanges(beforeCharacter, afterCharacter);
    return {
        index,
        optionId: spin?.optionId ?? null,
        poolId: spin?.poolId ?? null,
        flowId: spin?.flowId ?? null,
        text: spin?.text ?? spin?.optionId ?? "未命名事件",
        ageBefore: before.age,
        ageAfter: after.age,
        before,
        after,
        changes,
        changeLabels: presentationChangeLabels(changes),
        randomCursor: numberOr(randomCursor)
    };
}

export function v05LifeStage(record) {
    if (record.ageBefore !== record.ageAfter) {
        return {
            key: `${record.ageBefore}-${record.ageAfter}`,
            label: `${record.ageBefore} → ${record.ageAfter} 岁`
        };
    }
    return { key: String(record.ageAfter), label: `${record.ageAfter} 岁` };
}

export function groupV05PresentationTimeline(records = []) {
    const groups = [];
    const byKey = new Map();
    for (const record of records) {
        const stage = v05LifeStage(record);
        let group = byKey.get(stage.key);
        if (!group) {
            group = { ...stage, records: [] };
            byKey.set(stage.key, group);
            groups.push(group);
        }
        group.records.push(record);
    }
    return groups;
}

export function createV05ReadableEnding({ seed, session, records = [] }) {
    const character = snapshotV05Character(session?.character);
    const milestones = records.flatMap(record => record.changeLabels.map(label => ({
        index: record.index,
        age: record.ageAfter,
        label
    })));
    return {
        seed,
        age: character.age,
        level: character.level,
        copper: character.copper,
        rank: character.rank,
        route: character.route,
        committedEvents: records.length,
        martialSouls: character.martialSouls,
        soulBones: character.soulBones,
        milestones,
        boundary: "25 岁展示终点，不代表完整人生终局"
    };
}

export default Object.freeze({
    snapshotV05Character,
    describeV05CharacterChanges,
    presentationChangeLabels,
    createV05PresentationRecord,
    groupV05PresentationTimeline,
    createV05ReadableEnding
});
