import { CombatPowerCalculator } from "./combat-power.js";
import { createPlayerV2 } from "./player-v2.js";
import { resolveAnnualFlowForPlayer } from "./v2-annual-flow-resolver.js";
import { V2SessionRunner } from "./v2-session-runner.js";
import {
    applyGrowthDelta,
    assertValidTalentConfig,
    drawBirthIdentity,
    resolveAnnualGrowth,
    resolveBirthState
} from "./talent-system.js";
import {
    assertValidLegacyWheelData,
    getSelectableWheelItems,
    parseLegacyYearCandidate
} from "./soul-ring-demo.js";

export const V3_DEMO_STATUS = Object.freeze({
    READY: "ready",
    IDENTITY_DRAWN: "identity_drawn",
    TALENT_DRAWN: "talent_drawn",
    CULTIVATING: "cultivating",
    SUCCESS: "success",
    FAILURE: "failure",
    IGNORED: "ignored"
});

export const V3_DEMO_PHASES = Object.freeze({
    READY: "ready",
    TALENT_PENDING: "talent_pending",
    CULTIVATING: "cultivating",
    TERMINAL: "terminal"
});

export class V3DemoError extends Error {
    constructor(code, message, details = {}) {
        super(message);
        this.name = "V3DemoError";
        this.code = code;
        this.details = details;
    }
}

function isPlainObject(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return false;
    }

    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
}

function cloneJsonValue(value) {
    if (value === null
        || value === undefined
        || typeof value === "string"
        || typeof value === "boolean") {
        return value;
    }

    if (typeof value === "number") {
        if (!Number.isFinite(value)) {
            throw new TypeError("V3 Demo state numbers must be finite.");
        }
        return value;
    }

    if (Array.isArray(value)) {
        return value.map(cloneJsonValue);
    }

    if (isPlainObject(value)) {
        return Object.fromEntries(
            Object.entries(value).map(([key, entry]) => [key, cloneJsonValue(entry)])
        );
    }

    throw new TypeError("V3 Demo values must be JSON-compatible.");
}

function addIssue(issues, code, message, path, details = {}) {
    issues.push({ code, message, path, ...details });
}

function assertPlainObject(value, code, message) {
    if (!isPlainObject(value)) {
        throw new V3DemoError(code, message);
    }
}

function assertInteger(value, code, message) {
    if (!Number.isInteger(value)) {
        throw new V3DemoError(code, message, { received: value });
    }
}

function assertRng(rng) {
    if (typeof rng !== "function") {
        throw new V3DemoError("INVALID_V3_RNG", "V3 Demo requires an injected RNG function.");
    }
}

function drawRng(rng) {
    const roll = rng();
    if (!Number.isFinite(roll) || roll < 0 || roll >= 1) {
        throw new V3DemoError(
            "INVALID_V3_RNG",
            "V3 Demo RNG must return a finite number in [0, 1).",
            { roll }
        );
    }
    return roll;
}

const GROWTH_EVENT_TEXT = Object.freeze({
    "-5": "等级-5，心魔反噬，你的实力受到了重创，可降到当前大等级的最低级",
    "-2": "等级-2，心魔经常在纠缠你，你的修为不进反退，可降到当前大等级的最低级",
    "-1": "等级-1，你陷入了走火入魔，修为倒退1级，可降到当前大等级的最低级",
    "0": "等级+0，本年修炼遇到瓶颈，修为暂时没有变化。"
});

const MARTIAL_SOUL_FORM_TEXT = Object.freeze({
    tool: "器武魂",
    beast: "兽武魂",
    plant: "植物武魂",
    food: "食物武魂",
    body: "本体武魂"
});

const MARTIAL_SOUL_QUALITY_TEXT = Object.freeze({
    low: "低级品质",
    ordinary: "普通品质",
    top: "顶级品质",
    extreme: "极致品质"
});

function setCurrentEvent(state, {
    type,
    title,
    text,
    details = {}
}) {
    state.currentEvent = {
        age: state.age,
        type,
        title,
        text,
        details: cloneJsonValue(details),
        status: "provisional"
    };
}

function formatGrowthEvent(growth) {
    const delta = growth.drawnDelta ?? growth.actualDelta ?? 0;
    const sourceNarrative = growth.selectedResult?.narrative;
    const base = typeof sourceNarrative === "string" && sourceNarrative.trim().length > 0
        ? sourceNarrative
        : GROWTH_EVENT_TEXT[String(delta)]
            ?? (delta > 0
                ? `等级+${delta}，你的修炼取得了进展。`
                : `等级${delta}，本年修炼结果已结算。`);
    const identityBonus = growth.identityBonusTotal ?? 0;
    if (identityBonus > 0) {
        return `${base} 身份额外成长加成+${identityBonus}已生效。`;
    }
    return base;
}

function formatAwakeningNarrative(awakeningResult) {
    const slots = Array.isArray(awakeningResult?.slots)
        ? awakeningResult.slots
        : [];
    if (slots.length === 0) {
        return `武魂抽取完成，共${awakeningResult?.martialSoulCount ?? 0}个武魂。`;
    }

    const slotText = slots.map(slot => {
        const form = MARTIAL_SOUL_FORM_TEXT[slot.form] ?? slot.form ?? "未知形态";
        const quality = MARTIAL_SOUL_QUALITY_TEXT[slot.qualityGrade]
            ?? slot.qualityGrade
            ?? "未知品质";
        const attributes = Array.isArray(slot.attributes) && slot.attributes.length > 0
            ? `，属性为${slot.attributes.join("、")}`
            : "";
        return `第${slot.slot}武魂「${slot.name}」为${quality}${form}${attributes}`;
    }).join("；");

    return `武魂抽取结果：${slotText}。`;
}

function validateAwakeningData(awakeningData) {
    if (!isPlainObject(awakeningData)
        || !isPlainObject(awakeningData.dataset)
        || !isPlainObject(awakeningData.catalog)
        || !isPlainObject(awakeningData.probabilityConfig)) {
        throw new V3DemoError(
            "INVALID_V3_AWAKENING_DATA",
            "V3 Demo requires the production age-6 awakening inputs."
        );
    }
    if (awakeningData.dataset.contentStatus !== "production"
        || awakeningData.catalog.status !== "production"
        || awakeningData.probabilityConfig.status !== "production") {
        throw new V3DemoError(
            "INVALID_V3_AWAKENING_DATA_STATUS",
            "V3 Demo can only read the confirmed production awakening inputs."
        );
    }
}

function weightedDraw(items, rng) {
    const eligible = items.filter(item => Number.isFinite(item.weight) && item.weight > 0);
    if (eligible.length === 0) {
        throw new V3DemoError(
            "V3_LEGACY_WEIGHTS_UNRESOLVED",
            "The selected legacy wheel has no positive resolved weight."
        );
    }

    const totalWeight = eligible.reduce((sum, item) => sum + item.weight, 0);
    const roll = drawRng(rng);
    const target = roll * totalWeight;
    let cursor = 0;

    for (const item of eligible) {
        cursor += item.weight;
        if (target < cursor) {
            return { item, roll, target, totalWeight };
        }
    }

    return {
        item: eligible.at(-1),
        roll,
        target,
        totalWeight
    };
}

function getWheel(legacyData, legacyWheelId) {
    const wheel = legacyData.wheels.find(candidate => candidate.legacyWheelId === legacyWheelId);
    if (!wheel) {
        throw new V3DemoError(
            "V3_LEGACY_WHEEL_NOT_FOUND",
            `Legacy wheel ${String(legacyWheelId)} was not found.`,
            { legacyWheelId }
        );
    }
    return wheel;
}

function getItemByIndex(items, itemIndex) {
    return items.find(item => item.index === itemIndex) ?? null;
}

export function validateV3DemoConfig(config) {
    const errors = [];
    const warnings = [];

    if (!isPlainObject(config)) {
        return {
            valid: false,
            errors: [{
                code: "INVALID_V3_DEMO_CONFIG",
                message: "V3 Demo config must be a plain object.",
                path: "config"
            }],
            warnings
        };
    }

    if (config.schemaVersion !== "v3-demo-config/1.0"
        || config.demoVersion !== "v3-demo/0.1"
        || config.status !== "provisional") {
        addIssue(errors, "INVALID_V3_DEMO_METADATA", "V3 Demo metadata must remain provisional.", "config");
    }

    if (config.source?.sourceStatus !== "REFERENCE DATA ONLY"
        || config.source?.productionEligible !== false
        || config.source?.status !== "provisional") {
        addIssue(errors, "INVALID_V3_SOURCE_BOUNDARY", "V3 Demo must remain reference-only and non-production.", "source");
    }

    if (config.ageFlow?.birthAge !== 0
        || config.ageFlow?.talentDrawAge !== 6
        || config.ageFlow?.annualCultivationStartsAt !== 6
        || config.ageFlow?.status !== "provisional") {
        addIssue(errors, "INVALID_V3_AGE_FLOW", "V3 Demo age flow must be 0-year identity, 6-year talent, then annual cultivation.", "ageFlow");
    }

    if (config.awakening?.mode !== "production_runtime_isolated"
        || config.awakening?.status !== "provisional"
        || config.awakening?.contentFile !== "data/v2/content/age-6-awakening.json"
        || config.awakening?.catalogFile !== "data/v2/catalogs/martial-souls.json"
        || config.awakening?.probabilityFile !== "data/v2/config/awakening-probabilities.json") {
        addIssue(errors, "INVALID_V3_AWAKENING_SOURCE", "V3 must connect the confirmed production age-6 awakening runtime while keeping the V3 orchestration provisional.", "awakening");
    }

    const supportedValues = config.talentDraw?.supportedValues;
    if (!Array.isArray(supportedValues)
        || !supportedValues.includes(0)
        || !supportedValues.includes(10)
        || !supportedValues.includes(20)
        || config.talentDraw?.startingLevelForNonZero !== 1
        || config.talentDraw?.status !== "provisional") {
        addIssue(errors, "INVALID_V3_TALENT_DRAW", "V3 talent draw must use the supported innate soul-power values and remain provisional.", "talentDraw");
    }

    if (config.cultivation?.ordinaryGrowthMaximumLevel !== 90
        || config.cultivation?.post90Mode !== "v3_fixture_plus_one_per_year"
        || config.cultivation?.post90Delta !== 1
        || config.cultivation?.finalLevel !== 100
        || config.cultivation?.status !== "provisional") {
        addIssue(errors, "INVALID_V3_CULTIVATION", "V3 cultivation must preserve the 90-level boundary and explicit provisional post-90 bridge.", "cultivation");
    }

    const breakthroughLevels = config.breakthroughs?.levels;
    if (!Array.isArray(breakthroughLevels)
        || JSON.stringify(breakthroughLevels) !== JSON.stringify([10, 20, 30, 40, 50, 60, 70, 80, 90])
        || config.breakthroughs?.status !== "provisional") {
        addIssue(errors, "INVALID_V3_BREAKTHROUGHS", "V3 breakthrough levels must be 10 through 90 by tens.", "breakthroughs");
    }

    const wheelBySlot = config.soulRings?.wheelBySlot;
    if (!isPlainObject(wheelBySlot) || config.soulRings?.status !== "provisional") {
        addIssue(errors, "INVALID_V3_RING_CONFIG", "V3 soul-ring source configuration is invalid.", "soulRings");
    } else {
        for (let slot = 1; slot <= 9; slot += 1) {
            const entry = wheelBySlot[String(slot)];
            if (!Number.isInteger(entry?.legacyWheelId)
                || entry.status !== "provisional"
                || !["weighted_positive", "fixed_reference_item"].includes(entry.selection)
                || (entry.selection === "fixed_reference_item" && !Number.isInteger(entry.itemIndex))) {
                addIssue(errors, "INVALID_V3_RING_SOURCE", "Every V3 ring slot requires an explicit provisional legacy-wheel source.", `soulRings.wheelBySlot.${slot}`);
            }
        }
    }

    if (config.soulRings?.yearResolution?.status !== "provisional") {
        addIssue(errors, "INVALID_V3_RING_YEAR_POLICY", "V3 ring year resolution must remain provisional.", "soulRings.yearResolution");
    }

    if (!Number.isFinite(config.soulBones?.probability)
        || config.soulBones.probability < 0
        || config.soulBones.probability > 1
        || !Number.isInteger(config.soulBones?.sourceWheelLegacyId)
        || !Array.isArray(config.soulBones?.eligibleItemIndexes)
        || config.soulBones.eligibleItemIndexes.length === 0
        || config.soulBones.status !== "provisional"
        || config.soulBones.yearResolution?.status !== "provisional") {
        addIssue(errors, "INVALID_V3_BONE_CONFIG", "V3 soul-bone probability and legacy source configuration are invalid.", "soulBones");
    }

    if (config.animation?.durationMs !== 450
        || config.animation?.status !== "provisional") {
        addIssue(errors, "INVALID_V3_ANIMATION", "V3 turntable animation must use the accelerated provisional duration.", "animation");
    }

    if (config.battle?.opponentName !== "比比东"
        || config.battle?.opponentCombatPower !== 1500
        || config.battle?.comparison !== "player_static_combat_power_gte"
        || config.battle?.terminalAfterBattle !== true
        || config.battle?.status !== "provisional") {
        addIssue(errors, "INVALID_V3_BATTLE", "V3 battle must compare against provisional fixed Bibi Dong combat power 10000 and terminate.", "battle");
    }

    warnings.push({
        code: "PROVISIONAL_V3_RULES",
        message: "The complete V3 demo flow is provisional and must not be promoted to production.",
        path: "config",
        status: "provisional"
    });

    return { valid: errors.length === 0, errors, warnings };
}

export function assertValidV3DemoConfig(config) {
    const validation = validateV3DemoConfig(config);
    if (!validation.valid) {
        throw new V3DemoError(
            "INVALID_V3_DEMO_CONFIG",
            "V3 Demo config failed validation.",
            { errors: validation.errors }
        );
    }
    return validation;
}

function appendHistory(state, type, text, details = {}) {
    state.history.push({
        index: state.history.length + 1,
        type,
        age: state.age,
        text,
        status: "provisional",
        ...cloneJsonValue(details)
    });
}

function ensurePhase(state, expectedPhase) {
    if (state.phase !== expectedPhase) {
        throw new V3DemoError(
            "INVALID_V3_PHASE",
            `This action requires phase "${expectedPhase}", current phase is "${state.phase}".`,
            { expectedPhase, currentPhase: state.phase }
        );
    }
}

function resolveRangeMinimum(item, config, warnings) {
    const parsed = parseLegacyYearCandidate(item.text);
    if (parsed.status === "parsed" && parsed.minYears !== null) {
        return {
            years: parsed.exactYears ?? parsed.minYears,
            parsed
        };
    }

    const fallbackKey = `${item.legacyWheelId}:${item.index}`;
    const fallback = config.soulRings.yearResolution.fallbackYearsByWheelItem?.[fallbackKey];
    if (Number.isInteger(fallback)) {
        warnings.push({
            code: "V3_RING_YEAR_FALLBACK",
            message: "Legacy ring text was unresolved; the explicit V3 fallback year was used.",
            path: `soulRings.${fallbackKey}`,
            years: fallback,
            status: "provisional"
        });
        return {
            years: fallback,
            parsed
        };
    }

    throw new V3DemoError(
        "V3_RING_YEAR_UNRESOLVED",
        `Legacy ring candidate "${String(item.text)}" has no usable year expression.`,
        { itemIndex: item.index, text: item.text }
    );
}

function resolveBoneYears(text, ringYears, config, warnings) {
    const explicitYears = config.soulBones.yearResolution.explicitTextYears ?? {};
    const explicitPattern = Object.keys(explicitYears)
        .sort((left, right) => right.length - left.length)
        .find(pattern => String(text).includes(pattern));
    if (explicitPattern) {
        return explicitYears[explicitPattern];
    }

    if (config.soulBones.yearResolution.currentRingYearsForAbsorptionLimitOrExternal
        && (String(text).includes("对应吸收极限") || String(text).includes("外附魂骨"))) {
        return ringYears;
    }

    const fallback = config.soulBones.yearResolution.unresolvedFallbackYears;
    warnings.push({
        code: "V3_BONE_YEAR_FALLBACK",
        message: "Legacy soul-bone reward text has no explicit year; the provisional fallback year was used.",
        path: "soulBones.yearResolution.unresolvedFallbackYears",
        years: fallback,
        status: "provisional"
    });
    return fallback;
}

function getFirstFreeBoneSlot(bones, slots) {
    const used = new Set(bones.map(bone => bone.slot));
    return slots.find(slot => !used.has(slot)) ?? `extra_${bones.length + 1}`;
}

function sumInteger(values) {
    return values.reduce((sum, value) => sum + (Number.isInteger(value) ? value : 0), 0);
}

function drawV3InnateSoulPower(config, rng) {
    const entries = config.talentDraw.supportedValues.map(value => ({ value, weight: 1 }));
    const draw = weightedDraw(entries, rng);
    return {
        value: draw.item.value,
        roll: draw.roll,
        target: draw.target,
        totalWeight: draw.totalWeight,
        status: "provisional"
    };
}

function getBreakthroughsBetween(config, previousLevel, nextLevel) {
    return config.breakthroughs.levels.filter(level => {
        return level > previousLevel && level <= nextLevel;
    });
}

export function createV3Demo({
    v3Config,
    talentConfig,
    combatRules,
    legacyData,
    awakeningData,
    rng = Math.random
} = {}) {
    assertValidV3DemoConfig(v3Config);
    assertValidTalentConfig(talentConfig);
    assertValidLegacyWheelData(legacyData);
    validateAwakeningData(awakeningData);
    if (!CombatPowerCalculator.validateRules(combatRules).valid) {
        throw new V3DemoError("INVALID_V3_COMBAT_RULES", "Combat power rules failed validation.");
    }
    assertRng(rng);

    const state = {
        status: V3_DEMO_STATUS.READY,
        phase: V3_DEMO_PHASES.READY,
        gameOver: false,
        outcome: null,
        message: "等待开始 V3 临时人生流程。",
        age: 0,
        level: 0,
        rulesStatus: "provisional",
        sourceStatus: "REFERENCE DATA ONLY",
        identity: null,
        talent: null,
        awakening: null,
        player: {
            age: 0,
            level: 0,
            combatBase: { mode: "level" },
            martialSouls: [],
            soulRings: [],
            soulBones: []
        },
        breakthroughs: [],
        battle: null,
        combatPower: null,
        currentEvent: null,
        rulesAudit: {
            status: "provisional",
            demoConfig: "data/config/v3-demo.json",
            talentConfig: "data/config/talent.json",
            combatRules: "data/config/combat-power.json",
            legacyWheelSource: v3Config.source.wheelsFile,
            awakeningRuntime: {
                contentFile: v3Config.awakening.contentFile,
                catalogFile: v3Config.awakening.catalogFile,
                probabilityFile: v3Config.awakening.probabilityFile,
                status: "production_inputs_v3_provisional_orchestration"
            }
        },
        history: [],
        warnings: [
            {
                code: "PROVISIONAL_V3_DEMO",
                message: "V3 只用于最简流程试玩，身份、天赋概率、旧轮盘解释、魂骨概率和战斗结局均不是正式生产规则。",
                path: "config",
                status: "provisional"
            }
        ]
    };

    appendHistory(state, "transition", "V3 Demo 已准备；等待 0 岁身份抽取。", {
        sourceStatus: "REFERENCE DATA ONLY"
    });
    setCurrentEvent(state, {
        type: "ready",
        title: "等待开始",
        text: "点击抽取键开始0岁身份抽取；之后每次点击只推进一年。",
        details: { status: "provisional" }
    });

    function refreshCombatPower() {
        const result = CombatPowerCalculator.calculate(state.player, combatRules);
        state.combatPower = cloneJsonValue(result);
        return result;
    }

    function getState() {
        return cloneJsonValue(state);
    }

    function createForcedAwakeningRng(targetInnateSoulPower) {
        let firstRoll = true;
        return () => {
            if (firstRoll) {
                firstRoll = false;
                const items = awakeningData.probabilityConfig.innateSoulPowerRoll.items;
                const targetIndex = items.findIndex(item => {
                    return item.innateSoulPower === targetInnateSoulPower;
                });
                if (targetIndex < 0) {
                    throw new V3DemoError(
                        "V3_AWAKENING_TALENT_MAPPING_MISSING",
                        "The production awakening probability table does not contain the resolved V3 innate soul power.",
                        { targetInnateSoulPower }
                    );
                }
                const prefixWeight = items
                    .slice(0, targetIndex)
                    .reduce((sum, item) => sum + item.weight, 0);
                const targetItem = items[targetIndex];
                return (prefixWeight + targetItem.weight / 2)
                    / awakeningData.probabilityConfig.innateSoulPowerRoll.totalWeight;
            }
            return drawRng(rng);
        };
    }

    function resolveProductionAwakeningAtSix() {
        const awakeningPlayer = createPlayerV2();
        awakeningPlayer.age = v3Config.ageFlow.talentDrawAge;
        const flow = resolveAnnualFlowForPlayer({
            player: awakeningPlayer,
            registry: awakeningData.dataset.annualFlowRegistry,
            flows: awakeningData.dataset.flows
        });
        const runner = new V2SessionRunner({
            flow,
            wheelsById: awakeningData.dataset.wheels,
            allowedCanonLevels: awakeningData.catalog.allowedCanonLevels,
            awakeningRuntime: {
                catalog: awakeningData.catalog,
                probabilityConfig: awakeningData.probabilityConfig,
                rulesVersion: combatRules.rulesVersion ?? "v3-demo-provisional"
            }
        });
        const result = runner.run({
            player: awakeningPlayer,
            sessionId: `v3_age_6_awakening_${state.history.length + 1}`,
            seed: `v3_age_6_awakening_seed_${state.history.length + 1}`,
            rng: createForcedAwakeningRng(state.talent.innateSoulPower)
        });
        const awakeningResult = result.annualRecord.result;
        state.player.martialSouls = cloneJsonValue(result.player.martialSouls);
        state.player.activeMartialSoulInstanceId = result.player.activeMartialSoulInstanceId;
        state.player.combatBase = { mode: "level" };
        state.player.soulPowerGrowthLocked = false;
        state.player.rank = result.player.rank;
        const awakeningNarrative = formatAwakeningNarrative(awakeningResult);
        state.awakening = {
            ...cloneJsonValue(awakeningResult),
            narrative: awakeningNarrative,
            spins: cloneJsonValue(result.spins),
            warnings: cloneJsonValue(result.warnings),
            sourceStatus: "production_inputs_v3_provisional_orchestration",
            status: "provisional"
        };
        state.warnings.push(...cloneJsonValue(result.warnings));
        appendHistory(
            state,
            "awakening",
            `6岁武魂觉醒：${awakeningNarrative}`,
            {
                awakening: state.awakening,
                status: "provisional"
            }
        );
        return awakeningResult;
    }

    function start() {
        ensurePhase(state, V3_DEMO_PHASES.READY);
        const draw = drawBirthIdentity({
            config: talentConfig,
            lifeNumber: 1,
            rng
        });
        state.identity = {
            identityId: draw.identityId,
            identityName: draw.identityName,
            identityNarrative: draw.identityNarrative,
            eligibleIdentityIds: draw.eligibleIdentityIds,
            draw,
            status: "provisional"
        };
        state.status = V3_DEMO_STATUS.IDENTITY_DRAWN;
        state.phase = V3_DEMO_PHASES.TALENT_PENDING;
        state.message = `0岁身份已抽取：${draw.identityName}；等待6岁天赋抽取。`;
        state.player.identityId = draw.identityId;
        appendHistory(state, "identity", `0岁抽取身份：${draw.identityNarrative || draw.identityName}。`, {
            identityId: draw.identityId,
            identityNarrative: draw.identityNarrative,
            eligibleIdentityIds: draw.eligibleIdentityIds,
            draw: draw.draw
        });
        setCurrentEvent(state, {
            type: "identity",
            title: "0岁·身份生效",
            text: `你出生时的身份是${draw.identityNarrative || draw.identityName}。身份立即生效。`,
            details: {
                identityId: draw.identityId,
                identityNarrative: draw.identityNarrative,
                eligibleIdentityIds: draw.eligibleIdentityIds,
                draw: draw.draw
            }
        });
        return getState();
    }

    function resolveTalentAtSix({ innateSoulPower = null, recordNarrative = true } = {}) {
        let innateDraw;
        let baseInnateSoulPower;
        if (innateSoulPower === null) {
            innateDraw = drawV3InnateSoulPower(v3Config, rng);
            baseInnateSoulPower = innateDraw.value;
        } else {
            assertInteger(innateSoulPower, "INVALID_V3_INNATE_SOUL_POWER", "Innate soul power must be an integer.");
            if (!v3Config.talentDraw.supportedValues.includes(innateSoulPower)) {
                throw new V3DemoError(
                    "UNSUPPORTED_V3_INNATE_SOUL_POWER",
                    "The supplied innate soul power is not in the V3 supported values.",
                    { innateSoulPower }
                );
            }
            baseInnateSoulPower = innateSoulPower;
            innateDraw = {
                mode: "manual_demo_input",
                value: innateSoulPower,
                status: "provisional"
            };
        }

        if (recordNarrative) {
            for (let age = state.age + 1; age <= v3Config.ageFlow.talentDrawAge; age += 1) {
                state.age = age;
                state.player.age = age;
                appendHistory(state, "narrative", `${age}岁：无关紧要的成长过场，尚未进入年度修炼按钮。`);
            }
        } else if (state.age !== v3Config.ageFlow.talentDrawAge) {
            throw new V3DemoError(
                "V3_TALENT_AGE_MISMATCH",
                "The one-button timeline can only resolve talent at age 6.",
                { age: state.age }
            );
        }

        const birthState = resolveBirthState({
            config: talentConfig,
            baseInnateSoulPower,
            identityId: state.identity.identityId,
            lifeNumber: 1
        });
        state.age = v3Config.ageFlow.talentDrawAge;
        state.talent = {
            baseInnateSoulPower,
            innateDraw,
            ...birthState,
            status: "provisional"
        };
        state.player.age = state.age;
        state.player.talentGrade = birthState.talentGrade;
        state.player.innateSoulPower = birthState.innateSoulPower;
        state.level = birthState.innateSoulPower === 0
            ? 0
            : v3Config.talentDraw.startingLevelForNonZero;
        state.player.level = state.level;

        appendHistory(state, "talent", `6岁抽取天赋：先天魂力${birthState.innateSoulPower}，天赋等级${birthState.talentGrade}。`, {
            baseInnateSoulPower,
            innateSoulPower: birthState.innateSoulPower,
            talentGrade: birthState.talentGrade,
            identityId: birthState.identityId,
            draw: innateDraw
        });

        if (state.level === 0) {
            state.player.combatBase = { mode: "civilian_observer" };
            state.status = V3_DEMO_STATUS.IGNORED;
            state.phase = V3_DEMO_PHASES.TERMINAL;
            state.gameOver = true;
            state.outcome = "ignored";
            state.message = "6岁天赋为F/0级；按旁观路线忽略修炼、魂环和魂骨，V3 Demo 结束。";
            appendHistory(state, "terminal", state.message, { outcome: "ignored" });
            setCurrentEvent(state, {
                type: "terminal",
                title: "6岁·F级旁观路线",
                text: "抽到0级先天魂力，直接忽略普通成长池、武魂、魂环和魂骨，游戏结束。",
                details: { outcome: "ignored" }
            });
            refreshCombatPower();
            return getState();
        }

        const awakeningResult = resolveProductionAwakeningAtSix();
        state.status = V3_DEMO_STATUS.CULTIVATING;
        state.phase = V3_DEMO_PHASES.CULTIVATING;
        state.message = "6岁天赋已确定；点击按钮进行下一年修炼。";
        setCurrentEvent(state, {
            type: "awakening",
            title: "6岁·天赋与武魂觉醒",
            text: `先天魂力${birthState.innateSoulPower}（${birthState.talentGrade}）。${state.awakening.narrative}`,
            details: {
                innateSoulPower: birthState.innateSoulPower,
                talentGrade: birthState.talentGrade,
                narrative: state.awakening.narrative,
                martialSoulCount: awakeningResult.martialSoulCount,
                qualityGrade: awakeningResult.qualityGrade,
                slots: awakeningResult.slots,
                spins: state.awakening.spins
            }
        });
        refreshCombatPower();
        return getState();
    }

    function drawTalent({ innateSoulPower = null } = {}) {
        ensurePhase(state, V3_DEMO_PHASES.TALENT_PENDING);
        return resolveTalentAtSix({
            innateSoulPower,
            recordNarrative: true
        });
    }

    function advanceYear({ innateSoulPower = null } = {}) {
        if (state.phase === V3_DEMO_PHASES.READY) {
            start();
            state.age = 1;
            state.player.age = 1;
            appendHistory(state, "narrative", "1岁：身份已生效，时间推进一年。", {
                fromAge: 0,
                toAge: 1
            });
            state.message = "1岁：身份已抽取并生效；继续抽取推进时间。";
            setCurrentEvent(state, {
                type: "narrative",
                title: "1岁·时间推进",
                text: "身份已生效；今年只是无关紧要的过场信息，继续抽取推进到下一岁。",
                details: { fromAge: 0, toAge: 1 }
            });
            return getState();
        }

        if (state.phase === V3_DEMO_PHASES.TALENT_PENDING) {
            if (state.age >= v3Config.ageFlow.talentDrawAge) {
                return resolveTalentAtSix({
                    innateSoulPower,
                    recordNarrative: false
                });
            }

            const fromAge = state.age;
            state.age += 1;
            state.player.age = state.age;
            appendHistory(state, "narrative", `${state.age}岁：时间推进一年。`, {
                fromAge,
                toAge: state.age
            });
            if (state.age === v3Config.ageFlow.talentDrawAge) {
                return resolveTalentAtSix({
                    innateSoulPower,
                    recordNarrative: false
                });
            }
            state.message = `${state.age}岁：继续抽取推进时间，6岁时抽取天赋。`;
            setCurrentEvent(state, {
                type: "narrative",
                title: `${state.age}岁·时间推进`,
                text: "这是无关紧要的过场信息；尚未进入年度修炼抽取。",
                details: { fromAge, toAge: state.age }
            });
            return getState();
        }

        if (state.phase === V3_DEMO_PHASES.CULTIVATING) {
            return cultivateYear();
        }

        throw new V3DemoError(
            "V3_GAME_OVER",
            "The V3 Demo has already ended.",
            { status: state.status, outcome: state.outcome }
        );
    }

    function drawSoulRing(slot) {
        const source = v3Config.soulRings.wheelBySlot[String(slot)];
        const wheel = getWheel(legacyData, source.legacyWheelId);
        const items = getSelectableWheelItems(legacyData, wheel.id);
        let selected;
        let selectionDraw = null;

        if (source.selection === "fixed_reference_item") {
            selected = getItemByIndex(items, source.itemIndex);
            if (!selected) {
                throw new V3DemoError(
                    "V3_RING_REFERENCE_ITEM_NOT_FOUND",
                    `Configured legacy ring item ${source.itemIndex} was not selectable.`,
                    { slot, legacyWheelId: source.legacyWheelId }
                );
            }
        } else {
            if (items.some(item => item.weight === null)) {
                throw new V3DemoError(
                    "V3_RING_MIXED_WEIGHT_SOURCE",
                    `Configured ring wheel ${source.legacyWheelId} contains unresolved weights.`,
                    { slot, legacyWheelId: source.legacyWheelId }
                );
            }
            selectionDraw = weightedDraw(items, rng);
            selected = selectionDraw.item;
        }

        const warnings = [];
        const selectedWithSource = {
            ...selected,
            legacyWheelId: wheel.legacyWheelId
        };
        const resolvedYears = resolveRangeMinimum(selectedWithSource, v3Config, warnings);
        state.warnings.push(...warnings);
        if (source.selection === "fixed_reference_item") {
            state.warnings.push({
                code: "V3_FIXED_RING_REFERENCE",
                message: "This ring slot uses an explicit provisional legacy reference item instead of a resolved ordinary wheel.",
                path: `soulRings.slot.${slot}`,
                legacyWheelId: source.legacyWheelId,
                status: "provisional"
            });
        }

        const ring = {
            slot,
            years: resolvedYears.years,
            text: selectedWithSource.text,
            wheelId: wheel.id,
            legacyWheelId: wheel.legacyWheelId,
            itemIndex: selectedWithSource.index,
            ringType: "non_divine",
            sourceType: "legacy_reference_v3_demo",
            soulBeastBloodlineGrade: "ordinary",
            status: "provisional"
        };

        return {
            ring,
            selectionDraw,
            parsedYears: resolvedYears.parsed,
            warnings
        };
    }

    function drawSoulBone(ring) {
        const probability = v3Config.soulBones.probability;
        const roll = drawRng(rng);
        if (roll >= probability) {
            return {
                status: "not_awarded",
                probability,
                roll,
                warnings: []
            };
        }

        const wheel = getWheel(legacyData, v3Config.soulBones.sourceWheelLegacyId);
        const items = getSelectableWheelItems(legacyData, wheel.id)
            .filter(item => v3Config.soulBones.eligibleItemIndexes.includes(item.index));
        const selected = weightedDraw(items, rng);
        const warnings = [];
        const years = resolveBoneYears(selected.item.text, ring.years, v3Config, warnings);
        const slot = getFirstFreeBoneSlot(state.player.soulBones, v3Config.soulBones.slots);
        const bone = {
            slot,
            years,
            name: selected.item.text,
            text: selected.item.text,
            wheelId: wheel.id,
            legacyWheelId: wheel.legacyWheelId,
            itemIndex: selected.item.index,
            sourceType: "legacy_reference_v3_demo",
            soulBeastBloodlineGrade: "ordinary",
            status: "provisional"
        };

        return {
            status: "awarded",
            probability,
            roll,
            selectionDraw: {
                ...selected,
                item: cloneJsonValue(selected.item)
            },
            bone,
            warnings
        };
    }

    function appendRingToActiveMartialSoul(ring) {
        const activeSoul = state.player.martialSouls.find(soul => {
            return soul.instanceId === state.player.activeMartialSoulInstanceId;
        }) ?? state.player.martialSouls[0];
        if (activeSoul) {
            activeSoul.soulRings.push(ring);
            return;
        }
        state.player.soulRings.push(ring);
    }

    function processBreakthrough(level) {
        const slot = v3Config.breakthroughs.ringSlotByLevel[String(level)];
        if (!Number.isInteger(slot)) {
            throw new V3DemoError(
                "V3_BREAKTHROUGH_SLOT_MISSING",
                `No soul-ring slot is configured for breakthrough level ${level}.`,
                { level }
            );
        }

        const ringResult = drawSoulRing(slot);
        appendRingToActiveMartialSoul(ringResult.ring);
        const boneResult = drawSoulBone(ringResult.ring);
        const breakthrough = {
            level,
            slot,
            ring: ringResult.ring,
            ringSelectionDraw: ringResult.selectionDraw,
            soulBone: boneResult.status === "awarded" ? boneResult.bone : null,
            soulBoneRoll: boneResult.roll,
            soulBoneProbability: boneResult.probability,
            status: "provisional"
        };
        state.breakthroughs.push(breakthrough);
        state.warnings.push(...(boneResult.warnings ?? []));
        appendHistory(state, "breakthrough", `突破${level}级：抽取第${slot}魂环${ringResult.ring.years}年。`, {
            breakthroughLevel: level,
            ring: ringResult.ring,
            soulBone: boneResult.bone ?? null,
            soulBoneStatus: boneResult.status,
            soulBoneRoll: boneResult.roll,
            soulBoneProbability: boneResult.probability
        });

        if (boneResult.status === "awarded") {
            state.player.soulBones.push(boneResult.bone);
        }

        return breakthrough;
    }

    function resolveBattle() {
        if (state.level < v3Config.cultivation.finalLevel) {
            return null;
        }

        const combatPower = refreshCombatPower();
        const playerPower = combatPower.staticCombatPower;
        const opponentPower = v3Config.battle.opponentCombatPower;
        const result = playerPower >= opponentPower ? "success" : "failure";
        state.battle = {
            opponentName: v3Config.battle.opponentName,
            opponentCombatPower: opponentPower,
            playerCombatPower: playerPower,
            result,
            status: "provisional"
        };
        state.outcome = result;
        state.gameOver = true;
        state.phase = V3_DEMO_PHASES.TERMINAL;
        state.status = result === "success"
            ? V3_DEMO_STATUS.SUCCESS
            : V3_DEMO_STATUS.FAILURE;
        state.message = result === "success"
            ? `100级战力${playerPower}，击败固定战力${opponentPower}的${v3Config.battle.opponentName}，游戏成功结束。`
            : `100级战力${playerPower}，未击败固定战力${opponentPower}的${v3Config.battle.opponentName}，游戏失败结束。`;
        setCurrentEvent(state, {
            type: "battle",
            title: "100级·最终战斗",
            text: result === "success"
                ? `你以${playerPower}战力击败固定战力${opponentPower}的${v3Config.battle.opponentName}，成功结束。`
                : `你以${playerPower}战力未能击败固定战力${opponentPower}的${v3Config.battle.opponentName}，失败结束。`,
            details: state.battle
        });
        appendHistory(state, "battle", state.message, {
            opponentName: v3Config.battle.opponentName,
            opponentCombatPower: opponentPower,
            playerCombatPower: playerPower,
            result
        });
        return state.battle;
    }

    function cultivateYear() {
        ensurePhase(state, V3_DEMO_PHASES.CULTIVATING);
        const previousAge = state.age;
        const previousLevel = state.level;
        const nextAge = previousAge + 1;
        let growth;

        if (previousLevel <= v3Config.cultivation.ordinaryGrowthMaximumLevel) {
            growth = resolveAnnualGrowth({
                config: talentConfig,
                currentLevel: previousLevel,
                talentGrade: state.talent.talentGrade,
                identityId: state.talent.identityId,
                age: nextAge,
                rng
            });
        } else {
            const rawDelta = v3Config.cultivation.post90Delta
                + sumInteger(state.talent.annualGrowthBonuses);
            const nextLevel = applyGrowthDelta(previousLevel, rawDelta, talentConfig);
            growth = {
                status: "provisional_fixture",
                code: "V3_POST_90_FIXTURE_GROWTH",
                poolId: "v3_post90_fixture",
                currentLevel: previousLevel,
                nextLevel,
                drawnDelta: v3Config.cultivation.post90Delta,
                identityGrowthBonuses: [...state.talent.annualGrowthBonuses],
                identityBonusTotal: sumInteger(state.talent.annualGrowthBonuses),
                rawDelta,
                actualDelta: nextLevel - previousLevel,
                draws: [],
                warnings: [{
                    code: "V3_POST_90_FIXTURE_GROWTH",
                    message: "91级后使用 V3 Demo 的 +1/年过渡夹具；正式魂核成长池仍为空置。",
                    path: "cultivation.post90Mode",
                    status: "provisional"
                }]
            };
        }

        state.age = nextAge;
        state.level = v3Config.cultivation.clampAtFinalLevel
            ? Math.min(v3Config.cultivation.finalLevel, growth.nextLevel)
            : growth.nextLevel;
        state.player.age = state.age;
        state.player.level = state.level;
        state.warnings.push(...(growth.warnings ?? []));

        const crossedLevels = getBreakthroughsBetween(
            v3Config,
            previousLevel,
            state.level
        );
        const breakthroughResults = crossedLevels.map(processBreakthrough);
        const levelClamped = state.level !== growth.nextLevel;
        appendHistory(state, "cultivation", `${state.age}岁修炼：${previousLevel}级 → ${state.level}级。`, {
            previousAge,
            age: state.age,
            previousLevel,
            nextLevel: state.level,
            growth,
            breakthroughs: breakthroughResults,
            levelClamped
        });

        const breakthroughText = breakthroughResults.length === 0
            ? ""
            : ` 本年突破：${breakthroughResults.map(breakthrough => {
                const boneText = breakthrough.soulBone
                    ? `，并获得魂骨「${breakthrough.soulBone.name}」`
                    : "，魂骨事件未触发";
                return `突破到${breakthrough.level}级，抽取第${breakthrough.slot}魂环（${breakthrough.ring.years}年）${boneText}`;
            }).join("；")}。`;
        const post90Text = growth.code === "V3_POST_90_FIXTURE_GROWTH"
            ? " 91级以后暂用 provisional 的魂核空置过渡，每年固定+1。"
            : "";
        setCurrentEvent(state, {
            type: "cultivation",
            title: `${state.age}岁·年度修炼`,
            text: `${formatGrowthEvent(growth)}${breakthroughText}${post90Text}`,
            details: {
                previousLevel,
                nextLevel: state.level,
                growth,
                breakthroughs: breakthroughResults,
                levelClamped
            }
        });

        refreshCombatPower();
        if (state.level >= v3Config.cultivation.finalLevel) {
            resolveBattle();
        } else {
            state.status = V3_DEMO_STATUS.CULTIVATING;
            state.message = `${state.age}岁修炼完成，目前${state.level}级；继续下一年。`;
        }
        return getState();
    }

    function autoCultivate({ maxYears = 500 } = {}) {
        assertInteger(maxYears, "INVALID_V3_AUTO_LIMIT", "maxYears must be an integer.");
        if (maxYears < 1) {
            throw new V3DemoError("INVALID_V3_AUTO_LIMIT", "maxYears must be positive.");
        }

        let result = getState();
        let years = 0;
        while (state.phase === V3_DEMO_PHASES.CULTIVATING && years < maxYears) {
            result = cultivateYear();
            years += 1;
        }
        if (state.phase === V3_DEMO_PHASES.CULTIVATING) {
            throw new V3DemoError(
                "V3_AUTO_LIMIT_REACHED",
                "Automatic cultivation reached its safety limit before the game ended.",
                { maxYears, level: state.level, age: state.age }
            );
        }
        return result;
    }

    refreshCombatPower();

    return Object.freeze({
        getState,
        start,
        drawTalent,
        advanceYear,
        cultivateYear,
        autoCultivate
    });
}
