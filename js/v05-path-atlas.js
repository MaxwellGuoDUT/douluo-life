import { digestV05Value } from "./v05-save-store.js";

function clone(value) { return JSON.parse(JSON.stringify(value)); }
function freeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    for (const child of Object.values(value)) freeze(child);
    return Object.freeze(value);
}

function ringBand(count) {
    if (count <= 2) return "rings-0-2";
    if (count <= 4) return "rings-3-4";
    if (count <= 6) return "rings-5-6";
    return "rings-7-plus";
}
function levelBand(level) {
    if (level < 40) return "level-below-40";
    if (level < 60) return "level-40-59";
    if (level < 90) return "level-60-89";
    return "level-90-plus";
}

export function createV05PathSummary(runner) {
    if (!runner || runner.phase !== "completed" || runner.session?.character?.age !== 25) {
        const error = new Error("路径图谱只接受已完成的25岁人生。");
        error.code = "V05_PATH_COMPLETED_ONLY";
        throw error;
    }
    const character = runner.session.character;
    const martialSouls = character.martialSouls ?? [];
    const soulRingCount = martialSouls.reduce((count, soul) => count + (soul.rings?.length ?? 0), 0);
    const faction = character.faction?.optionId ?? character.faction?.text ?? "independent";
    const talent = character.talentProgression?.talentGrade ?? "ungraded";
    const routeSummary = `${character.route ?? "unknown"}:${faction}:${talent}`;
    const routeFacets = [
        `route:${character.route ?? "unknown"}`,
        `talent:${talent}`,
        `martial:${martialSouls[0]?.category ?? "unknown"}`,
        ringBand(soulRingCount),
        levelBand(Number(character.level ?? 0))
    ];
    const closureTags = [...new Set((runner.session.dynamicHistory ?? []).flatMap(event => {
        if (event.operation === "followUp.prepare.soulBone") return ["followup-soul-bone-prepare"];
        if (event.handlerId === "prepareSoulRing"
            && ["7143b4", "505d78", "6df424", "94604a"].includes(event.optionId)) return ["soul-ring-evidence"];
        return [];
    }))].sort();
    const seen = new Set();
    const milestoneTrail = [];
    for (const record of runner.presentationHistory) {
        for (const label of record.changeLabels ?? []) {
            const milestoneId = `milestone-${digestV05Value(label).slice(-8)}`;
            if (seen.has(milestoneId)) continue;
            seen.add(milestoneId);
            milestoneTrail.push({ milestoneId, label: String(label).slice(0, 64), age: record.ageAfter });
            if (milestoneTrail.length === 8) break;
        }
        if (milestoneTrail.length === 8) break;
    }
    const pathSignature = digestV05Value({
        routeFacets,
        closureTags,
        milestoneTrail: milestoneTrail.map(item => item.milestoneId)
    });
    return freeze({ pathSignature, routeFacets, closureTags, milestoneTrail, routeSummary,
        ringBand: ringBand(soulRingCount), levelBand: levelBand(Number(character.level ?? 0)) });
}

export function createV05PathComparison(left, right) {
    if (!left || !right) {
        const error = new Error("双人生对比需要两条图鉴摘要。");
        error.code = "V05_PATH_COMPARE_REQUIRES_TWO";
        throw error;
    }
    const fields = [
        ["武魂", left.martialSouls?.[0]?.name ?? "未知", right.martialSouls?.[0]?.name ?? "未知"],
        ["路线", left.routeSummary, right.routeSummary],
        ["终点等级", left.level, right.level],
        ["魂环", left.soulRings?.length ?? 0, right.soulRings?.length ?? 0],
        ["魂骨", left.soulBones?.length ?? 0, right.soulBones?.length ?? 0],
        ["里程碑", left.milestoneTrail?.length ?? 0, right.milestoneTrail?.length ?? 0],
        ["结局", left.ending, right.ending]
    ];
    return freeze({
        leftId: left.archiveId,
        rightId: right.archiveId,
        items: fields.map(([label, leftValue, rightValue]) => ({
            label, left: clone(leftValue), right: clone(rightValue), same: JSON.stringify(leftValue) === JSON.stringify(rightValue)
        })),
        recoverable: false
    });
}

export default Object.freeze({ createV05PathSummary, createV05PathComparison });
