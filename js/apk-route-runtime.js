import { evaluateApkRequirement } from "./apk-content-adapter.js";
import {
    APK_SESSION_SCHEMA_VERSION,
    applyApkEffects,
    commitApkOption,
    createApkCharacterState,
    createApkContentIndex,
    createApkSession,
    drawApkPool
} from "./apk-rule-runtime.js";
import {
    planFormalHumanScheduler
} from "./apk-scheduler-runtime.js";
import {
    planFormalSpecialGrowth
} from "./apk-special-growth-runtime.js";
import {
    calculateApkCombatPower,
    compareApkCombatThreshold
} from "./apk-combat-power-runtime.js";

export const APK_ROUTE_RUNTIME_VERSION = "apk-route-runtime/1.0";
export const APK_ROUTE_SESSION_SCHEMA_VERSION = "apk-route-session/1.0";
export const APK_ROUTE_GRAPH_SCHEMA_VERSION = "apk-route-graph/1.0";

const AVAILABILITY_POLICY = "preserve_apk_original_state";
const FORMAL_SPECIAL_RESULT_HANDLER = "douluo1:handler.formal-special-result";
const FORMAL_SPECIAL_RESULT_ACTION = "douluo1:action.after-formal-special-result";
const OFFICIAL_BEAST_ELEMENT_HANDLER = "douluo1:handler.official-beast.element";
const OFFICIAL_BEAST_ELEMENT_FLOW_PREFIX = "douluo1:flow.official-beast.pool.";
const FORMAL_SPECIAL_RESULT_NEXT_FLOW_FLAG = "formal:d1-special-growth-next-flow";
const FORMAL_OPPORTUNITY_COUNTER = "formal:opportunity-draws";
const FORMAL_SCHEDULER_FLOW = "douluo1:flow.formal-human.scheduler";
const HUMAN_SOUL_BONE_POOL_ID = "ce286ca9-296f-471c-8f4f-701b9c7f6169";
const HUMAN_SEA_SOUL_RING_SPECIES_POOL_ID = "b892ab24-634a-47fb-8e9e-585254bd668e";
const SOUL_BONE_CHANCE_YES_OPTION_IDS = new Set([
    "e8d0db",
    "83a411",
    "4fe815"
]);

function isPlainObject(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return false;
    }
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
}

function clone(value) {
    if (value === undefined) return undefined;
    return JSON.parse(JSON.stringify(value));
}

function fail(code, message, details = {}) {
    throw new ApkRouteRuntimeError(code, message, details);
}

function exactTransition(transition) {
    if (transition?.kind !== "exact-string") return null;
    return typeof transition.value === "string" && transition.value.length > 0
        ? transition.value
        : null;
}

function sourceOption(option) {
    return isPlainObject(option?.source) ? option.source : option ?? {};
}

function routeOptionNext(option) {
    return exactTransition(option?.route?.next)
        ?? (typeof sourceOption(option).next === "string"
            ? sourceOption(option).next
            : null);
}

function routeOptionCustomHandler(option) {
    return exactTransition(option?.route?.customHandler)
        ?? (typeof sourceOption(option).customHandler === "string"
            && sourceOption(option).customHandler.length > 0
            ? sourceOption(option).customHandler
            : null);
}

function isFormalMartialSoulFlow(flowId, packId) {
    return packId === "douluo1"
        && typeof flowId === "string"
        && flowId.startsWith("douluo1:flow.formal-human.martial.");
}

function routeOptionMartialSoulEvidence(option) {
    const evidence = option?.martialSoulRuntimeEvidence;
    if (evidence?.status !== "source-proven") return null;
    if (typeof evidence.category !== "string" || evidence.category.length === 0) {
        return null;
    }
    return {
        category: evidence.category,
        tags: Array.isArray(evidence.tags) ? clone(evidence.tags) : [],
        passives: Array.isArray(evidence.passives) ? clone(evidence.passives) : [],
        effects: Array.isArray(evidence.effects) ? clone(evidence.effects) : [],
        handlerId: evidence.handlerId ?? "applyHumanMartialSoul",
        operation: evidence.operation ?? "addMartialSoul",
        formalContext: evidence.formalContext
            ?? "douluo1:flow.formal-human.martial.<poolId>"
    };
}

function buildFormalSpecialResultRuleMap(evidence) {
    if (evidence?.schemaVersion !== "apk-formal-special-result-evidence/1.0"
        || !Array.isArray(evidence.records)) {
        return new Map();
    }
    return new Map(evidence.records
        .filter(record => (
            typeof record?.poolId === "string"
            && typeof record?.optionId === "string"
        ))
        .map(record => [
            `${record.poolId}:${record.optionId}`,
            clone(record)
        ]));
}

function buildHumanSoulRingRuleMap(evidence) {
    if (evidence?.schemaVersion !== "apk-human-soul-ring-evidence/1.0"
        || !Array.isArray(evidence.records)) {
        return new Map();
    }
    return new Map(evidence.records
        .filter(record => (
            typeof record?.poolId === "string"
            && typeof record?.optionId === "string"
        ))
        .map(record => [
            `${record.poolId}:${record.optionId}`,
            clone(record)
        ]));
}

function buildHumanSoulRingSpeciesRuleMap(evidence) {
    if (evidence?.schemaVersion !== "apk-human-soul-ring-species-evidence/1.0"
        || !Array.isArray(evidence.records)) {
        return new Map();
    }
    return new Map(evidence.records
        .filter(record => (
            typeof record?.poolId === "string"
            && typeof record?.optionId === "string"
        ))
        .map(record => [
            `${record.poolId}:${record.optionId}`,
            clone(record)
        ]));
}

function routeOptionFollowUps(option) {
    if (Array.isArray(option?.route?.followUps)) {
        return clone(option.route.followUps);
    }
    return Array.isArray(sourceOption(option).followUps)
        ? clone(sourceOption(option).followUps)
        : [];
}

function effectFingerprint(effect) {
    return JSON.stringify(effect);
}

function canonicalSupplementalEffects(option) {
    const evidence = option?.canonicalSupplementalEffects;
    if (evidence?.status !== "unique" || !Array.isArray(evidence.effects)) {
        return [];
    }
    return clone(evidence.effects);
}

function mergeOptionEffects(baseEffects, supplementalEffects) {
    const merged = [];
    const seen = new Set();
    for (const effect of [...baseEffects, ...supplementalEffects]) {
        const fingerprint = effectFingerprint(effect);
        if (seen.has(fingerprint)) continue;
        seen.add(fingerprint);
        merged.push(clone(effect));
    }
    return merged;
}

function optionRequirements(option) {
    if (Array.isArray(option?.route?.requirements)) {
        return clone(option.route.requirements);
    }
    return Array.isArray(sourceOption(option).requirements)
        ? clone(sourceOption(option).requirements)
        : [];
}

function optionEffects(option) {
    const baseEffects = Array.isArray(option?.route?.effects)
        ? option.route.effects
        : Array.isArray(sourceOption(option).effects)
        ? clone(sourceOption(option).effects)
        : [];
    return mergeOptionEffects(baseEffects, canonicalSupplementalEffects(option));
}

function getOptionId(option) {
    return option?.normalized?.option_id
        ?? option?.optionId
        ?? sourceOption(option).id
        ?? option?.id
        ?? null;
}

function getPoolId(pool) {
    return pool?.normalized?.pool_id
        ?? pool?.poolId
        ?? pool?.id
        ?? null;
}

function getPoolFlowId(contentIndex, poolId) {
    return contentIndex.flowIdsByPoolId.get(poolId)?.[0] ?? null;
}

function requirementResult(requirements, character) {
    const results = requirements.map(requirement => (
        evaluateApkRequirement(requirement, character)
    ));
    return {
        met: results.every(result => result.status === "met"),
        unresolved: results.filter(result => result.status === "unresolved"),
        results
    };
}

function makePoolRecord(packId, pool) {
    const poolId = pool.id;
    const contentStatus = pool.contentStatus ?? null;
    return {
        id: `${packId}:pool:${poolId}`,
        normalized: {
            pool_id: poolId,
            pool_name: pool.name ?? poolId,
            tags: Array.isArray(pool.tags) ? clone(pool.tags) : [],
            timeline_scope: pool.timelineScope ?? null,
            content_owner: pool.contentOwner ?? packId,
            content_status: contentStatus,
            pool_kind: pool.poolKind ?? null
        },
        availability: {
            policy: AVAILABILITY_POLICY,
            enabled: pool.developmentOnly !== true,
            contentStatus,
            poolId,
            source: "apk-route-graph"
        },
        routeSource: {
            packId,
            poolId,
            source: clone(pool)
        }
    };
}

function makeOptionRecord(packId, poolId, option) {
    const source = sourceOption(option);
    const optionId = option.id ?? source.id;
    const enabled = source.enabled !== false;
    const contentStatus = source.contentStatus ?? null;
    const requirements = optionRequirements(option);
    const rerollWhen = Array.isArray(option?.route?.rerollWhen)
        ? clone(option.route.rerollWhen)
        : Array.isArray(source.rerollWhen)
            ? clone(source.rerollWhen)
            : [];
    const effects = optionEffects(option);
    const supplemental = option.canonicalSupplementalEffects ?? null;
    const next = routeOptionNext(option);
    const customHandler = routeOptionCustomHandler(option);
    return {
        id: `${packId}:option:${poolId}:${optionId}`,
        normalized: {
            pool_id: poolId,
            option_id: optionId,
            text: source.text ?? optionId,
            wheel_label: source.wheelLabel ?? null,
            weight: Number.isFinite(source.weight) ? source.weight : 0,
            enabled,
            content_status: contentStatus,
            requirements,
            reroll_when: rerollWhen,
            effects,
            canonical_supplemental_status: supplemental?.status ?? "none",
            next,
            custom_handler: customHandler ?? ""
        },
        availability: {
            policy: AVAILABILITY_POLICY,
            enabled,
            contentStatus,
            poolId,
            optionId,
            source: "apk-route-graph"
        },
        routeSource: {
            packId,
            poolId,
            optionId,
            source: clone(option),
            failureEvidence: clone(option.canonicalEvidence ?? null),
            canonicalSupplementalEffects: clone(supplemental)
        }
    };
}

function assertRouteGraph(routeGraph) {
    if (!isPlainObject(routeGraph)
        || routeGraph.schemaVersion !== APK_ROUTE_GRAPH_SCHEMA_VERSION
        || !Array.isArray(routeGraph.packs)) {
        fail(
            "INVALID_APK_ROUTE_GRAPH",
            "APK route runtime requires an apk-route-graph/1.0 document."
        );
    }
}

function getPack(routeGraph, packId) {
    const pack = routeGraph.packs.find(candidate => candidate.id === packId);
    if (!pack) {
        fail(
            "APK_ROUTE_PACK_NOT_FOUND",
            `APK route pack "${String(packId)}" does not exist.`,
            { packId }
        );
    }
    return pack;
}

export function createApkRouteContentIndex({
    routeGraph,
    packId = "douluo1",
    formalSpecialResultEvidence = routeGraph?.formalSpecialResultEvidence ?? null,
    humanSoulRingEvidence = routeGraph?.humanSoulRingEvidence ?? null,
    humanSoulRingSpeciesEvidence = routeGraph?.humanSoulRingSpeciesEvidence ?? null,
    combatPowerEvidence = routeGraph?.combatPowerEvidence ?? null
} = {}) {
    assertRouteGraph(routeGraph);
    const pack = getPack(routeGraph, packId);
    if (!Array.isArray(pack.flows) || !Array.isArray(pack.pools)) {
        fail(
            "INVALID_APK_ROUTE_PACK",
            `APK route pack "${packId}" has no complete flow/pool registry.`
        );
    }

    const pools = pack.pools.map(pool => makePoolRecord(packId, pool));
    const options = pack.pools.flatMap(pool => (
        pool.options.map(option => makeOptionRecord(packId, pool.id, option))
    ));
    const contentIndex = createApkContentIndex({
        pools: { records: pools },
        options: { records: options }
    });
    const flowsById = new Map(pack.flows.map(flow => [flow.id, flow]));
    const flowIdsByPoolId = new Map();
    for (const flow of pack.flows) {
        const poolId = exactTransition(flow.route?.pool);
        if (!poolId) continue;
        if (!flowIdsByPoolId.has(poolId)) flowIdsByPoolId.set(poolId, []);
        flowIdsByPoolId.get(poolId).push(flow.id);
    }
    const routeOptionsByKey = new Map();
    for (const pool of pack.pools) {
        for (const option of pool.options) {
            routeOptionsByKey.set(`${pool.id}:${option.id}`, option);
        }
    }
    const formalSpecialResultRulesByKey = buildFormalSpecialResultRuleMap(
        formalSpecialResultEvidence
    );
    const humanSoulRingRulesByKey = buildHumanSoulRingRuleMap(
        humanSoulRingEvidence
    );
    const humanSoulRingSpeciesRulesByKey = buildHumanSoulRingSpeciesRuleMap(
        humanSoulRingSpeciesEvidence
    );
    return Object.freeze({
        ...contentIndex,
        packId,
        pack,
        routeGraph,
        flowsById,
        flowIdsByPoolId,
        routeOptionsByKey,
        formalSpecialResultRulesByKey,
        humanSoulRingRulesByKey,
        humanSoulRingSpeciesRulesByKey,
        combatPowerEvidence,
        getFlow(flowId) {
            return flowsById.get(flowId) ?? null;
        },
        getRouteOption(poolId, optionId) {
            return routeOptionsByKey.get(`${poolId}:${optionId}`) ?? null;
        },
        getFlowForPool(poolId) {
            return flowIdsByPoolId.get(poolId)?.[0] ?? null;
        },
        getFormalSpecialResultRule(poolId, optionId) {
            return formalSpecialResultRulesByKey.get(`${poolId}:${optionId}`) ?? null;
        },
        getHumanSoulRingRule(poolId, optionId) {
            return humanSoulRingRulesByKey.get(`${poolId}:${optionId}`) ?? null;
        },
        getHumanSoulRingSpeciesRule(poolId, optionId) {
            return humanSoulRingSpeciesRulesByKey.get(`${poolId}:${optionId}`) ?? null;
        }
    });
}

export function createApkRouteSession({
    routeGraph,
    packId = "douluo1",
    seed,
    route = "human",
    character,
    cursor = 0
} = {}) {
    const contentIndex = createApkRouteContentIndex({ routeGraph, packId });
    const session = createApkSession({
        seed,
        route,
        character: character ?? createApkCharacterState(route),
        contentPackId: packId,
        cursor
    });
    return {
        ...session,
        routeSchemaVersion: APK_ROUTE_SESSION_SCHEMA_VERSION,
        routeGraphVersion: routeGraph.packageVersion ?? null,
        currentFlowId: contentIndex.pack.entryFlowId,
        routeStatus: "ready",
        routeHistory: [],
        dynamicHistory: [],
        pendingDynamic: null,
        pendingSoulBone: null,
        lastRouteSpin: null
    };
}

function validateSession(session) {
    if (!isPlainObject(session)
        || session.schemaVersion !== APK_SESSION_SCHEMA_VERSION
        || session.routeSchemaVersion !== APK_ROUTE_SESSION_SCHEMA_VERSION) {
        fail(
            "INVALID_APK_ROUTE_SESSION",
            "APK route runtime requires an APK route session created by createApkRouteSession."
        );
    }
}

function firstExistingFlow(contentIndex, suffixes) {
    for (const suffix of suffixes) {
        const flowId = `${contentIndex.packId}:${suffix}`;
        if (contentIndex.getFlow(flowId)) return flowId;
    }
    return null;
}

function getOptionEffectsFromRecord(option) {
    return Array.isArray(option?.normalized?.effects)
        ? option.normalized.effects
        : [];
}

function findIdentityOptionId(contentIndex, identityId) {
    const identityFlowId = firstExistingFlow(contentIndex, [
        "flow.formal-human.identity",
        "flow.human.identity"
    ]);
    const identityFlow = identityFlowId
        ? contentIndex.getFlow(identityFlowId)
        : null;
    const identityPoolId = exactTransition(identityFlow?.route?.pool);
    const identityOption = identityPoolId
        ? contentIndex.getOptions(identityPoolId).find(option => (
            getOptionEffectsFromRecord(option).some(effect => (
                effect?.type === "setIdentity"
                && effect.identityId === identityId
            ))
        ))
        : null;
    return getOptionId(identityOption);
}

function fixedInnateActionResult(contentIndex, session, value) {
    const identityId = session.character?.background?.identityId;
    const identityOptionId = findIdentityOptionId(contentIndex, identityId);
    if (!identityOptionId) {
        fail(
            "APK_ROUTE_DYNAMIC_SOURCE_GAP",
            "固定先天魂力缺少可追溯的正式身份来源选项。",
            { identityId, packId: contentIndex.packId }
        );
    }
    const nextSuffixes = contentIndex.packId === "douluo2"
        ? session.character?.flags?.["identity:only-ultimate-martial-soul"] === true
            ? ["flow.human.before-special"]
            : ["flow.human.martial-talent"]
        : ["flow.formal-human.before-martial-talent"];
    const target = firstExistingFlow(contentIndex, nextSuffixes);
    if (!target) {
        fail(
            "APK_ROUTE_DYNAMIC_SOURCE_GAP",
            "固定先天魂力 action 的正式后续 flow 不存在。",
            { packId: contentIndex.packId, nextSuffixes }
        );
    }
    return {
        target,
        effects: [{
            type: "setInnatePower",
            value,
            selection: {
                optionId: identityOptionId,
                text: `身份固定先天魂力 ${value}`
            }
        }]
    };
}

function forcedUltimateMartialTalentResult(contentIndex) {
    const flowId = firstExistingFlow(contentIndex, [
        "flow.formal-human.martial-talent",
        "flow.human.martial-talent"
    ]);
    const poolId = exactTransition(contentIndex.getFlow(flowId)?.route?.pool);
    const option = poolId
        ? contentIndex.getOptions(poolId).find(candidate => (
            getOptionId(candidate) === "898d7a"
        ))
        : null;
    const talentEffect = getOptionEffectsFromRecord(option).find(effect => (
        effect?.type === "addMartialSoulTalent"
    ));
    const target = firstExistingFlow(contentIndex, [
        "flow.formal-human.before-special",
        "flow.human.before-special"
    ]);
    if (!talentEffect || !target) {
        fail(
            "APK_ROUTE_DYNAMIC_SOURCE_GAP",
            "极致武魂固定天赋 action 缺少正式选项或后续 flow。",
            { packId: contentIndex.packId, optionId: "898d7a", poolId, target }
        );
    }
    return { target, effects: [clone(talentEffect)] };
}

const DOULUO1_MARTIAL_POOL_IDS = Object.freeze({
    beastLow: "f1afa805-95b7-4d54-aea2-d3de15e54c5a",
    beastMiddle: "24eda03c-beae-40f2-a7db-20b6318cd1c7",
    beastHigh: "96be4279-1aa6-49b3-bf4c-e164871129cf",
    toolLow: "cb2dce39-17c0-4b0b-9cca-94778d215d7f",
    toolMiddle: "c3c10f01-29f6-4278-afdd-a7c9136ba98d",
    toolHigh: "08c42cec-f04d-49bc-8896-4239e1973726",
    body: "49e3abc8-1361-4348-94aa-b23c68a53720",
    extreme: "8c589787-e43d-4064-8546-8b5b7b403fe2",
    plant: "2cc51e7d-9a0a-43c8-bf4e-e12bf30ef6e6"
});

function formalSelectMartialResult(contentIndex, session) {
    const talent = session.character?.martialSoulTalents?.at(-1);
    const optionId = talent?.optionId;
    const categoryByOptionId = {
        "90400d": "beast",
        "d72963": "tool",
        "6fc4cb": "body",
        "898d7a": "extreme",
        "8b7cb0": "plant"
    };
    const category = categoryByOptionId[optionId];
    if (!category) {
        fail(
            "APK_ROUTE_DYNAMIC_SOURCE_GAP",
            "斗一正式武魂天赋缺少显式路由。",
            { optionId: optionId ?? null }
        );
    }
    const grade = session.character?.talentProgression?.talentGrade;
    const tier = ["A", "S", "divine", "god-level", "神级天赋"].includes(grade)
        ? "High"
        : ["C", "B"].includes(grade)
            ? "Middle"
            : "Low";
    const poolKey = category === "beast"
        ? `beast${tier}`
        : category === "tool"
            ? `tool${tier}`
            : category;
    const poolId = DOULUO1_MARTIAL_POOL_IDS[poolKey];
    const target = firstExistingFlow(contentIndex, [
        `flow.formal-human.martial.${poolId}`
    ]);
    if (!poolId || !target) {
        fail(
            "APK_ROUTE_DYNAMIC_SOURCE_GAP",
            "斗一正式武魂天赋对应的武魂池或 flow 不存在。",
            { optionId, category, grade, poolId, target }
        );
    }
    return target;
}

function formalAfterMartialResult(contentIndex, session) {
    const targetCount = Number(session.character?.flags?.["identity:martial-soul-count"] ?? 1);
    if (session.character?.martialSouls?.length < targetCount) {
        const extraPoolId = session.character?.flags?.["formal:special-extra-martial-pool"];
        if (typeof extraPoolId === "string" && extraPoolId.length > 0) {
            return firstExistingFlow(contentIndex, [
                `flow.formal-human.special-martial.${extraPoolId}`
            ]);
        }
        return firstExistingFlow(contentIndex, ["flow.formal-human.select-martial"]);
    }
    return firstExistingFlow(contentIndex, ["flow.formal-human.faction"]);
}

function formalBeforeSpecialResult(contentIndex, session) {
    const flags = session.character?.flags ?? {};
    const identityId = session.character?.background?.identityId;
    const noSpecial = identityId === "douluo2:identity.god-reincarnation"
        || flags["identity:no-special-talent"] === true;
    const forceSpecial = flags["identity:force-special-talent"] === true;
    const suffixes = contentIndex.packId === "douluo2"
        ? noSpecial
            ? ["flow.human.growth"]
            : forceSpecial
                ? ["flow.human.special"]
                : ["flow.human.special-check"]
        : noSpecial
            ? ["flow.formal-human.select-martial"]
            : forceSpecial
                ? ["flow.formal-human.special-talent"]
                : ["flow.formal-human.special-check"];
    const target = firstExistingFlow(contentIndex, suffixes);
    if (!target) {
        fail(
            "APK_ROUTE_DYNAMIC_SOURCE_GAP",
            "特殊天赋前置 action 的正式后续 flow 不存在。",
            { packId: contentIndex.packId, suffixes }
        );
    }
    return target;
}

function normalizedRecordRequirements(record, key) {
    const value = record?.normalized?.[key];
    return Array.isArray(value) ? value : [];
}

function formalSpecialResultPoolHasEligibleOption(contentIndex, poolId, character) {
    if (!contentIndex.getPool(poolId)) return false;
    return contentIndex.getOptions(poolId).some(option => {
        if (option?.normalized?.enabled === false) return false;
        const requirements = normalizedRecordRequirements(option, "requirements");
        const rerollWhen = normalizedRecordRequirements(option, "reroll_when");
        return requirementResult(requirements, character).met
            && !(rerollWhen.length > 0
                && requirementResult(rerollWhen, character).met);
    });
}

function formalSpecialResultAfterAction(contentIndex, session) {
    const next = session.character?.flags?.[FORMAL_SPECIAL_RESULT_NEXT_FLOW_FLAG];
    if (typeof next !== "string" || next.length === 0) {
        fail(
            "APK_ROUTE_SPECIAL_RESULT_NEXT_MISSING",
            "斗一正式特殊成长结果缺少已解析的后续 flow。",
            {
                action: FORMAL_SPECIAL_RESULT_ACTION,
                flag: FORMAL_SPECIAL_RESULT_NEXT_FLOW_FLAG
            }
        );
    }

    const opportunityDraws = Math.max(
        0,
        Math.trunc(Number(session.character?.flags?.[FORMAL_OPPORTUNITY_COUNTER] ?? 0))
    );
    if (next === FORMAL_SCHEDULER_FLOW && opportunityDraws > 0) {
        fail(
            "APK_ROUTE_SPECIAL_RESULT_OPPORTUNITY_UNRESOLVED",
            "正式特殊成长结果需要机会池回跳，但该机会池选择器尚未接入。",
            {
                action: FORMAL_SPECIAL_RESULT_ACTION,
                opportunityDraws,
                identityId: session.character?.background?.identityId ?? null,
                level: session.character?.level ?? null
            }
        );
    }
    return {
        target: next,
        effects: [{
            type: "deleteFlag",
            key: FORMAL_SPECIAL_RESULT_NEXT_FLOW_FLAG
        }],
        reason: FORMAL_SPECIAL_RESULT_ACTION
    };
}

function selectRingTypeStepResult(contentIndex, session) {
    const ringIndex = Number(session.character?.pendingRing?.ringIndex);
    if (!Number.isInteger(ringIndex) || ringIndex < 1 || ringIndex > 9) {
        fail(
            "APK_ROUTE_SOUL_RING_CONTEXT_MISSING",
            "魂环类型步骤缺少有效的待处理环序。",
            {
                handlerId: "selectRingTypeStep",
                pendingRing: clone(session.character?.pendingRing ?? null)
            }
        );
    }
    const target = `humanRingType${ringIndex}`;
    if (contentIndex.getFlow(target)) return target;
    const scopedTarget = firstExistingFlow(contentIndex, [
        `flow.humanRingType${ringIndex}`
    ]);
    if (scopedTarget) return scopedTarget;
    fail(
        "APK_ROUTE_FLOW_NOT_FOUND",
        `魂环类型步骤指向缺失的 flow "${target}"。`,
        { handlerId: "selectRingTypeStep", ringIndex, target }
    );
}

function soulRingSelection(optionId, option) {
    const source = sourceOption(option);
    return {
        optionId,
        text: source.text ?? optionId
    };
}

function soulRingBatchStatus(session, pendingRing, context) {
    const batch = session.character?.additionalSoulRingBatch;
    if (batch === null || batch === undefined) {
        return {
            mode: "primary-or-unbatched",
            indices: [],
            pendingSoulIndex: Number(pendingRing.soulIndex)
        };
    }
    if (!Array.isArray(batch)
        || batch.some(index => !Number.isInteger(Number(index)) || Number(index) < 1)) {
        fail(
            "APK_ROUTE_SOUL_RING_BATCH_CONTEXT_INVALID",
            "副武魂补环批次必须是正整数武魂槽位数组。",
            {
                ...context,
                additionalSoulRingBatch: clone(batch)
            }
        );
    }
    const indices = [...new Set(batch.map(index => Number(index)))];
    const pendingSoulIndex = Number(pendingRing.soulIndex);
    if (indices.length > 0 && !indices.includes(pendingSoulIndex)) {
        fail(
            "APK_ROUTE_SOUL_RING_BATCH_CONTEXT_MISMATCH",
            "待处理副武魂不在当前补环批次中。",
            {
                ...context,
                additionalSoulRingBatch: clone(indices),
                pendingSoulIndex
            }
        );
    }
    return {
        mode: indices.length > 0 ? "secondary-batch" : "empty-batch",
        indices,
        pendingSoulIndex,
        pendingBatchPosition: indices.indexOf(pendingSoulIndex)
    };
}

function requirePendingRing(session, handlerId) {
    const pendingRing = session.character?.pendingRing;
    if (!isPlainObject(pendingRing)
        || !Number.isInteger(Number(pendingRing.soulIndex))
        || Number(pendingRing.soulIndex) < 0
        || !Number.isInteger(Number(pendingRing.ringIndex))
        || Number(pendingRing.ringIndex) < 1
        || Number(pendingRing.ringIndex) > 9) {
        fail(
            "APK_ROUTE_SOUL_RING_CONTEXT_MISSING",
            `魂环 handler "${handlerId}" 缺少有效的待处理魂环上下文。`,
            { handlerId, pendingRing: clone(pendingRing ?? null) }
        );
    }
    return pendingRing;
}

function applyRouteCustomEffects({
    session,
    effects,
    handlerId,
    referenceId,
    operation = handlerId
}) {
    const safeEffects = Array.isArray(effects) ? clone(effects) : [];
    const result = safeEffects.length > 0
        ? applyApkEffects(
            session.character,
            safeEffects,
            {
                reason: "apk-route-custom-handler",
                referenceId,
                idempotencyKeyPrefix: `custom:${session.packId}:${referenceId}:${session.history.length}`
            }
        )
        : {
            character: session.character,
            controls: { appliedTypes: [], terminal: null },
            applied: false
        };
    session.character = result.character;
    session.dynamicHistory ??= [];
    session.dynamicHistory.push({
        kind: "customHandler",
        handlerId,
        operation,
        effects: safeEffects,
        applied: result.applied,
        controls: clone(result.controls ?? null)
    });
    return result;
}

function applySelectSoulRingTypeHandler({
    contentIndex,
    session,
    spin,
    routeOption,
    optionId
}) {
    const pendingRing = requirePendingRing(session, "selectSoulRingType");
    const next = routeOptionNext(routeOption);
    if (!next
        || !/^humanRingSpecies\d+$/u.test(next)
        || !contentIndex.getFlow(next)) {
        fail(
            "APK_ROUTE_SOUL_RING_TYPE_SOURCE_GAP",
            `魂环类型选项 "${optionId}" 缺少明确的物种 flow。`,
            { flowId: spin.flowId, poolId: spin.poolId, optionId, next }
        );
    }
    pendingRing.typeSelection = soulRingSelection(optionId, routeOption);
    const result = {
        character: session.character,
        controls: { appliedTypes: [], terminal: null },
        applied: true
    };
    session.dynamicHistory ??= [];
    session.dynamicHistory.push({
        kind: "customHandler",
        handlerId: "selectSoulRingType",
        operation: "selectSoulRingType",
        flowId: spin.flowId,
        poolId: spin.poolId,
        optionId,
        typeSelection: clone(pendingRing.typeSelection),
        nextFlowId: next,
        effects: [],
        applied: true,
        controls: clone(result.controls)
    });
    return result;
}

function applyFinalizeSoulRingSpeciesHandler({
    contentIndex,
    session,
    spin,
    routeOption,
    optionId,
    operationId = "humanSoulRingSpeciesClosure"
}) {
    const pendingRing = requirePendingRing(session, "finalizeSoulRingSpecies");
    if (!isPlainObject(pendingRing.source)
        || !pendingRing.typeSelection) {
        fail(
            "APK_ROUTE_SOUL_RING_CONTEXT_MISSING",
            `魂环物种选项 "${optionId}" 缺少年限或类型上下文。`,
            {
                flowId: spin.flowId,
                poolId: spin.poolId,
                optionId,
                pendingRing: clone(pendingRing)
            }
        );
    }
    if (!(contentIndex.humanSoulRingSpeciesRulesByKey?.size > 0)) {
        fail(
            "APK_ROUTE_SOUL_RING_SPECIES_EVIDENCE_MISSING",
            "魂环物种收束缺少 APK 属性来源证据包。",
            {
                flowId: spin.flowId,
                poolId: spin.poolId,
                optionId,
                handlerId: "finalizeSoulRingSpecies"
            }
        );
    }
    const speciesEvidence = contentIndex.getHumanSoulRingSpeciesRule(
        spin.poolId,
        optionId
    );
    if (!speciesEvidence) {
        fail(
            "APK_ROUTE_SOUL_RING_SPECIES_EVIDENCE_MISSING",
            `魂环物种选项 "${optionId}" 缺少 APK 属性来源证据。`,
            {
                flowId: spin.flowId,
                poolId: spin.poolId,
                optionId,
                handlerId: "finalizeSoulRingSpecies"
            }
        );
    }
    const batchStatus = soulRingBatchStatus(session, pendingRing, {
        flowId: spin.flowId,
        poolId: spin.poolId,
        optionId
    });
    const speciesSelection = soulRingSelection(optionId, routeOption);
    pendingRing.speciesSelection = speciesSelection;
    const effects = [{
        type: "setSoulRing",
        soulIndex: Number(pendingRing.soulIndex),
        ringIndex: Number(pendingRing.ringIndex) - 1,
        ring: {
            years: pendingRing.years,
            name: pendingRing.source.text,
            source: clone(pendingRing.source),
            typeSelection: clone(pendingRing.typeSelection),
            speciesSelection: clone(speciesSelection)
        }
    }];
    if (spin.poolId === HUMAN_SEA_SOUL_RING_SPECIES_POOL_ID) {
        effects.push({
            type: "advanceHumanElement",
            elementId: "water",
            amount: 1
        });
    }
    for (const effect of speciesEvidence?.effects ?? []) {
        effects.push(clone(effect));
    }
    const result = applyRouteCustomEffects({
        session,
        effects,
        handlerId: "finalizeSoulRingSpecies",
        operation: operationId,
        referenceId: `${spin.poolId}:${optionId}:finalizeSoulRingSpecies`
    });
    const history = session.dynamicHistory.at(-1);
    Object.assign(history, {
        flowId: spin.flowId,
        poolId: spin.poolId,
        optionId,
        speciesSelection: clone(speciesSelection),
        speciesEvidence: clone(speciesEvidence),
        soulRingBatchStatus: clone(batchStatus)
    });
    return result;
}

function applyResolveSoulBoneChanceHandler({
    session,
    spin,
    optionId
}) {
    const isSuccess = SOUL_BONE_CHANCE_YES_OPTION_IDS.has(optionId);
    if (isSuccess && !isPlainObject(session.pendingSoulBone)) {
        fail(
            "APK_ROUTE_SOUL_BONE_CONTEXT_MISSING",
            `魂骨概率选项 "${optionId}" 缺少待结算魂骨年限。`,
            { flowId: spin.flowId, poolId: spin.poolId, optionId }
        );
    }
    if (!isSuccess) session.pendingSoulBone = null;
    const result = {
        character: session.character,
        controls: { appliedTypes: [], terminal: null },
        applied: true
    };
    session.dynamicHistory ??= [];
    session.dynamicHistory.push({
        kind: "customHandler",
        handlerId: "resolveSoulBoneChance",
        operation: "resolveSoulBoneChance",
        flowId: spin.flowId,
        poolId: spin.poolId,
        optionId,
        soulBoneDropped: isSuccess,
        effects: [],
        applied: true,
        controls: clone(result.controls)
    });
    return result;
}

function soulBonePartId(routeOption, optionId) {
    const requirement = optionRequirements(routeOption).find(item => (
        item?.type === "soulBonePartCountBelow"
        && typeof item.partId === "string"
        && item.partId.length > 0
    ));
    return requirement?.partId
        ?? (optionId === "9a5039" ? "external" : optionId);
}

function applyAddPendingSoulBoneHandler({
    session,
    routeOption,
    spin,
    optionId
}) {
    const pendingSoulBone = session.pendingSoulBone;
    if (!isPlainObject(pendingSoulBone)
        || !Number.isFinite(Number(pendingSoulBone.years))
        || Number(pendingSoulBone.years) <= 0) {
        fail(
            "APK_ROUTE_SOUL_BONE_CONTEXT_MISSING",
            `魂骨部位选项 "${optionId}" 缺少待结算魂骨年限。`,
            { flowId: spin.flowId, poolId: spin.poolId, optionId }
        );
    }
    const partId = soulBonePartId(routeOption, optionId);
    const source = sourceOption(routeOption);
    const soulBone = {
        id: optionId,
        name: source.text ?? optionId,
        years: Number(pendingSoulBone.years),
        partId
    };
    if (pendingSoulBone.quality) soulBone.quality = pendingSoulBone.quality;
    const effects = [{
        type: "addSoulBone",
        soulBone,
        ...(partId === "external" ? { partCapacity: 100 } : {})
    }];
    const result = applyRouteCustomEffects({
        session,
        effects,
        handlerId: "addPendingSoulBone",
        operation: "addPendingSoulBone",
        referenceId: `${spin.poolId}:${optionId}:addPendingSoulBone`
    });
    session.pendingSoulBone = null;
    const history = session.dynamicHistory.at(-1);
    Object.assign(history, {
        flowId: spin.flowId,
        poolId: spin.poolId,
        optionId,
        soulBone: clone(soulBone)
    });
    return result;
}

function applyPrepareEarlyBonusSoulBoneHandler({
    session,
    spin,
    routeOption,
    optionId
}) {
    const pendingRing = requirePendingRing(session, "prepareEarlyBonusSoulBone");
    if (!isPlainObject(pendingRing.source)) {
        fail(
            "APK_ROUTE_SOUL_RING_CONTEXT_MISSING",
            `额外魂骨奖励选项 "${optionId}" 缺少原魂环来源。`,
            { flowId: spin.flowId, poolId: spin.poolId, optionId }
        );
    }
    if (session.pendingSoulBone) {
        fail(
            "APK_ROUTE_SOUL_BONE_CONTEXT_CONFLICT",
            "额外魂骨奖励不能覆盖尚未结算的魂骨。",
            { flowId: spin.flowId, poolId: spin.poolId, optionId }
        );
    }
    session.pendingSoulBone = {
        years: 100000,
        source: soulRingSelection(optionId, routeOption)
    };
    const result = {
        character: session.character,
        controls: { appliedTypes: [], terminal: null },
        applied: true
    };
    session.dynamicHistory ??= [];
    session.dynamicHistory.push({
        kind: "customHandler",
        handlerId: "prepareEarlyBonusSoulBone",
        operation: "prepareEarlyBonusSoulBone",
        flowId: spin.flowId,
        poolId: spin.poolId,
        optionId,
        pendingSoulBone: clone(session.pendingSoulBone),
        effects: [],
        applied: true,
        controls: clone(result.controls)
    });
    return result;
}

function unresolvedRouteOperation({
    operation,
    customHandler,
    spin,
    optionId
}) {
    fail(
        "APK_ROUTE_DYNAMIC_OPTION_UNRESOLVED",
        `APK option "${optionId}" requires unresolved operation "${operation.operationId}".`,
        {
            flowId: spin.flowId,
            poolId: spin.poolId,
            optionId,
            customHandler,
            operationId: operation.operationId,
            operationStatus: operation.status
        }
    );
}

const ROUTE_OPERATION_REGISTRY = Object.freeze([
    Object.freeze({
        operationId: "formal-human.martial.addMartialSoul",
        handlerId: "applyHumanMartialSoul",
        context: "douluo1:flow.formal-human.martial.*",
        status: "connected",
        matches: ({ packId, flowId, customHandler }) => (
            packId === "douluo1"
            && customHandler === "applyHumanMartialSoul"
            && isFormalMartialSoulFlow(flowId, packId)
        ),
        execute: applyFormalMartialSoulHandler
    }),
    Object.freeze({
        operationId: "human.soulRing.species.sharedClosure",
        handlerId: "applyHumanMartialSoul",
        context: "humanRingSpecies3|humanRingSpecies4|humanRingSpecies5",
        status: "connected",
        matches: ({ packId, flowId, customHandler }) => (
            packId === "douluo1"
            && customHandler === "applyHumanMartialSoul"
            && /^humanRingSpecies[345]$/u.test(flowId)
        ),
        execute: args => applyFinalizeSoulRingSpeciesHandler({
            ...args,
            operationId: "human.soulRing.species.sharedClosure"
        })
    }),
    Object.freeze({
        operationId: "human.soulRing.species.finalize",
        handlerId: "finalizeSoulRingSpecies",
        context: "humanRingSpecies[1-15]",
        status: "connected",
        matches: ({ packId, flowId, customHandler }) => (
            packId === "douluo1"
            && customHandler === "finalizeSoulRingSpecies"
            && /^humanRingSpecies\d+$/u.test(flowId)
        ),
        execute: args => applyFinalizeSoulRingSpeciesHandler({
            ...args,
            operationId: "human.soulRing.species.finalize"
        })
    }),
    Object.freeze({
        operationId: "human.soulRing.prepare",
        handlerId: "prepareSoulRing",
        context: "handler:prepareSoulRing",
        status: "connected",
        matches: ({ packId, customHandler }) => (
            packId === "douluo1" && customHandler === "prepareSoulRing"
        ),
        execute: applyPrepareSoulRingHandler
    }),
    Object.freeze({
        operationId: "human.soulRing.selectType",
        handlerId: "selectSoulRingType",
        context: "handler:selectSoulRingType",
        status: "connected",
        matches: ({ packId, customHandler }) => (
            packId === "douluo1" && customHandler === "selectSoulRingType"
        ),
        execute: applySelectSoulRingTypeHandler
    }),
    Object.freeze({
        operationId: "human.soulBone.resolveChance",
        handlerId: "resolveSoulBoneChance",
        context: "handler:resolveSoulBoneChance",
        status: "connected",
        matches: ({ packId, customHandler }) => (
            packId === "douluo1" && customHandler === "resolveSoulBoneChance"
        ),
        execute: applyResolveSoulBoneChanceHandler
    }),
    Object.freeze({
        operationId: "human.soulBone.addPending",
        handlerId: "addPendingSoulBone",
        context: "handler:addPendingSoulBone",
        status: "connected",
        matches: ({ packId, customHandler }) => (
            packId === "douluo1" && customHandler === "addPendingSoulBone"
        ),
        execute: applyAddPendingSoulBoneHandler
    }),
    Object.freeze({
        operationId: "human.soulBone.prepareEarlyBonus",
        handlerId: "prepareEarlyBonusSoulBone",
        context: "handler:prepareEarlyBonusSoulBone",
        status: "connected",
        matches: ({ packId, customHandler }) => (
            packId === "douluo1" && customHandler === "prepareEarlyBonusSoulBone"
        ),
        execute: applyPrepareEarlyBonusSoulBoneHandler
    }),
    Object.freeze({
        operationId: "formal.specialResult",
        handlerId: FORMAL_SPECIAL_RESULT_HANDLER,
        context: "douluo1:handler.formal-special-result",
        status: "connected",
        matches: ({ packId, customHandler }) => (
            packId === "douluo1" && customHandler === FORMAL_SPECIAL_RESULT_HANDLER
        ),
        execute: applyFormalSpecialResultHandler
    }),
    Object.freeze({
        operationId: "human.awakening.unresolved",
        handlerId: "applyHumanMartialSoul",
        context: "humanAwaken*|humanExtraMartial*",
        status: "unresolved",
        matches: ({ customHandler, flowId }) => (
            customHandler === "applyHumanMartialSoul"
            && /^(?:humanAwaken|humanExtraMartial)/u.test(flowId)
        ),
        execute: unresolvedRouteOperation
    }),
    Object.freeze({
        operationId: "human.replacement.unresolved",
        handlerId: "applyHumanMartialSoul",
        context: "*replace*|*replacement*|*mutation*",
        status: "unresolved",
        matches: ({ customHandler, flowId }) => (
            customHandler === "applyHumanMartialSoul"
            && /replace|replacement|mutation/iu.test(flowId)
        ),
        execute: unresolvedRouteOperation
    }),
    Object.freeze({
        operationId: "beast.element.unresolved",
        handlerId: OFFICIAL_BEAST_ELEMENT_HANDLER,
        context: "douluo1:flow.official-beast.pool.*",
        status: "unresolved",
        matches: ({ packId, flowId, customHandler }) => (
            packId === "douluo1"
            && customHandler === OFFICIAL_BEAST_ELEMENT_HANDLER
            && typeof flowId === "string"
            && flowId.startsWith(OFFICIAL_BEAST_ELEMENT_FLOW_PREFIX)
        ),
        execute: unresolvedRouteOperation
    }),
    Object.freeze({
        operationId: "beast.martial.unresolved",
        handlerId: "applyHumanMartialSoul",
        context: "*beast*|*special-martial*",
        status: "unresolved",
        matches: ({ customHandler, flowId }) => (
            customHandler === "applyHumanMartialSoul"
            && /beast|special-martial/iu.test(flowId)
        ),
        execute: unresolvedRouteOperation
    })
]);

export const APK_ROUTE_OPERATION_REGISTRY = Object.freeze(
    ROUTE_OPERATION_REGISTRY.map(({ matches, execute, ...metadata }) => (
        Object.freeze(metadata)
    ))
);

function resolveRouteOperation(context) {
    return ROUTE_OPERATION_REGISTRY.find(operation => operation.matches(context)) ?? null;
}

function soulBoneChanceFlow(years) {
    if (years < 100) return "humanSoulBoneChanceTen";
    if (years < 1000) return "humanSoulBoneChanceHundred";
    if (years < 10000) return "humanSoulBoneChanceThousand";
    return "humanSoulBoneChanceTenThousand";
}

function soulRingRewardContinuation(contentIndex, session) {
    const pendingRing = requirePendingRing(session, "afterSoulRing");
    if (!isPlainObject(pendingRing.source)
        || !pendingRing.speciesSelection) {
        fail(
            "APK_ROUTE_SOUL_RING_CONTEXT_MISSING",
            "魂环尚未完整落定，无法进入魂骨结算。",
            { pendingRing: clone(pendingRing) }
        );
    }
    if (session.pendingSoulBone) {
        fail(
            "APK_ROUTE_SOUL_BONE_CONTEXT_CONFLICT",
            "魂骨结算不能覆盖尚未结算的魂骨。",
            { pendingRing: clone(pendingRing) }
        );
    }
    session.pendingSoulBone = {
        years: pendingRing.years,
        source: clone(pendingRing.source)
    };
    const target = pendingRing.grantsSoulBone === true
        || Number(pendingRing.years) >= 100000
        ? "humanPrepareSoulBonePart"
        : soulBoneChanceFlow(Number(pendingRing.years));
    session.character.pendingRing = null;
    if (!contentIndex.getFlow(target)) {
        fail(
            "APK_ROUTE_FLOW_NOT_FOUND",
            `魂骨结算指向缺失的 flow "${target}"。`,
            { target, pendingRing: clone(pendingRing) }
        );
    }
    return target;
}

function soulBonePoolHasEligibleOption(contentIndex, character) {
    return contentIndex.getOptions(HUMAN_SOUL_BONE_POOL_ID).some(option => {
        if (option?.normalized?.enabled === false
            || option?.normalized?.content_status === "staging") {
            return false;
        }
        const requirements = optionRequirements(option);
        const rerollWhen = Array.isArray(option?.normalized?.reroll_when)
            ? option.normalized.reroll_when
            : [];
        return requirementResult(requirements, character).met
            && !(rerollWhen.length > 0
                && requirementResult(rerollWhen, character).met);
    });
}

function prepareSoulBonePartResult(contentIndex, session, fallbackFlowId) {
    if (!isPlainObject(session.pendingSoulBone)) {
        fail(
            "APK_ROUTE_SOUL_BONE_CONTEXT_MISSING",
            "魂骨部位准备步骤缺少待结算魂骨。",
            { fallbackFlowId }
        );
    }
    const target = soulBonePoolHasEligibleOption(contentIndex, session.character)
        ? fallbackFlowId === "humanResumeEarlyRingReward"
            ? "humanEarlyBonusSoulBonePart"
            : "humanSoulBonePart"
        : fallbackFlowId;
    if (target !== fallbackFlowId && !contentIndex.getFlow(target)) {
        fail(
            "APK_ROUTE_FLOW_NOT_FOUND",
            `魂骨部位准备步骤指向缺失的 flow "${target}"。`,
            { target, fallbackFlowId }
        );
    }
    if (target === fallbackFlowId) session.pendingSoulBone = null;
    return target;
}

function afterSoulRingResult(contentIndex, session) {
    const pendingRing = requirePendingRing(session, "afterSoulRing");
    const effects = [];
    const soulKey = `${pendingRing.soulIndex}:${pendingRing.ringIndex}`;
    const milestoneFlag = `formal:ring-milestone-level:${soulKey}`;
    const levelBefore = Number(pendingRing.levelBefore);
    if (Number.isInteger(levelBefore)
        && levelBefore >= 10
        && levelBefore <= 90
        && levelBefore % 10 === 0
        && session.character.flags?.[milestoneFlag] !== true) {
        effects.push({ type: "changeLevel", amount: 1 });
        effects.push({ type: "setFlag", key: milestoneFlag, value: true });
    }
    const earlyGrowthFlag = `formal:early-hundred-thousand-ring-growth:${soulKey}`;
    if (Number(pendingRing.years) >= 100000
        && levelBefore < 80
        && session.character.flags?.[earlyGrowthFlag] !== true) {
        effects.push({ type: "setFlag", key: earlyGrowthFlag, value: true });
        return {
            target: "humanEarlyRingGrowth",
            effects,
            reason: "afterSoulRing"
        };
    }
    const target = soulRingRewardContinuation(contentIndex, session);
    return { target, effects, reason: "afterSoulRing" };
}

function resumeEarlyRingRewardResult(contentIndex, session) {
    return {
        target: soulRingRewardContinuation(contentIndex, session),
        effects: [],
        reason: "resumeEarlyRingReward"
    };
}

function createSourceProvenDynamicAction({ contentIndex, session, handlerId }) {
    const flags = session.character?.flags ?? {};
    if (handlerId === "douluo1:action.formal-human.before-innate"
        || handlerId === "douluo2:action.human.before-innate") {
        const value = flags["douluo2:innate-fixed"];
        if (!Number.isFinite(value)) {
            return firstExistingFlow(contentIndex, [
                "flow.formal-human.innate",
                "flow.human.innate"
            ]);
        }
        return fixedInnateActionResult(contentIndex, session, value);
    }
    if (handlerId === "douluo1:action.formal-human.before-martial-talent") {
        if (flags["identity:only-ultimate-martial-soul"] !== true) {
            return firstExistingFlow(contentIndex, ["flow.formal-human.martial-talent"]);
        }
        return forcedUltimateMartialTalentResult(contentIndex);
    }
    if (handlerId === "douluo1:action.formal-human.select-martial") {
        return formalSelectMartialResult(contentIndex, session);
    }
    if (handlerId === "douluo1:action.formal-human.after-martial") {
        return formalAfterMartialResult(contentIndex, session);
    }
    if (handlerId === "douluo1:action.formal-human.finish") {
        return firstExistingFlow(contentIndex, ["flow.formal-human.scheduler"]);
    }
    if (handlerId === "douluo1:action.formal-human.start-god-trial") {
        return {
            target: firstExistingFlow(contentIndex, ["flow.formal-human.scheduler"]),
            effects: [
                { type: "setFlag", key: "formal:d1-scheduler-mode", value: "godTrial" },
                { type: "setFlag", key: "formal:d1-scheduler-index", value: 0 }
            ]
        };
    }
    if (handlerId === "douluo1:action.formal-human.schedule") {
        return planFormalHumanScheduler({ contentIndex, session });
    }
    if (handlerId === "douluo1:action.formal-human.scheduler-alias") {
        return firstExistingFlow(contentIndex, ["flow.formal-human.scheduler"]);
    }
    if (handlerId === "douluo1:action.formal-special-growth") {
        return planFormalSpecialGrowth({ contentIndex, session });
    }
    if (handlerId === FORMAL_SPECIAL_RESULT_ACTION) {
        return formalSpecialResultAfterAction(contentIndex, session);
    }
    if (handlerId === "selectRingTypeStep") {
        return selectRingTypeStepResult(contentIndex, session);
    }
    if (handlerId === "afterSoulRing") {
        return afterSoulRingResult(contentIndex, session);
    }
    if (handlerId === "prepareSoulBonePart") {
        return {
            target: prepareSoulBonePartResult(
                contentIndex,
                session,
                "humanPlan"
            ),
            effects: [],
            reason: "prepareSoulBonePart"
        };
    }
    if (handlerId === "resumeEarlyRingReward") {
        return resumeEarlyRingRewardResult(contentIndex, session);
    }
    if (handlerId === "prepareEarlyBonusSoulBonePart") {
        return {
            target: prepareSoulBonePartResult(
                contentIndex,
                session,
                "humanResumeEarlyRingReward"
            ),
            effects: [],
            reason: "prepareEarlyBonusSoulBonePart"
        };
    }
    if (handlerId === "douluo1:action.formal-human.before-special"
        || handlerId === "douluo2:action.human.before-special") {
        return formalBeforeSpecialResult(contentIndex, session);
    }
    if (handlerId === "douluo2:action.foundation.routeAfterFormalGender") {
        return session.character?.route === "transformed"
            ? firstExistingFlow(contentIndex, ["flow.human.transformedAppearance"])
            : firstExistingFlow(contentIndex, ["flow.human.appearance"]);
    }
    if (handlerId === "douluo2:action.foundation.routeAfterFormalAppearance") {
        return firstExistingFlow(contentIndex, ["flow.human.before-innate"]);
    }
    return null;
}

export function createApkRouteDynamicHandlers({ contentIndex } = {}) {
    if (!contentIndex?.getFlow || !contentIndex?.getOptions) {
        fail(
            "INVALID_APK_ROUTE_INDEX",
            "Dynamic handler creation requires a route content index."
        );
    }
    const dynamicAction = context => {
        const result = createSourceProvenDynamicAction(context);
        if (result === null) {
            fail(
                "APK_ROUTE_DYNAMIC_UNRESOLVED",
                `APK dynamic action "${context.handlerId}" remains unresolved.`,
                { handlerId: context.handlerId, flowId: context.flow?.id }
            );
        }
        return result;
    };
    return Object.freeze({
        dynamicAction,
        dynamicResolver: context => {
            if (context.kind !== "resolver"
                || context.handlerId !== "selectRingTypeStep") {
                fail(
                    "APK_ROUTE_DYNAMIC_UNRESOLVED",
                    `APK dynamic resolver "${context.handlerId}" remains unresolved.`,
                    { handlerId: context.handlerId, flowId: context.flow?.id }
                );
            }
            const result = createSourceProvenDynamicAction(context);
            if (result === null) {
                fail(
                    "APK_ROUTE_DYNAMIC_UNRESOLVED",
                    `APK dynamic resolver "${context.handlerId}" remains unresolved.`,
                    { handlerId: context.handlerId, flowId: context.flow?.id }
                );
            }
            return result;
        }
    });
}

function resolveDynamicTransition({
    contentIndex,
    session,
    flow,
    transition,
    dynamicResolver,
    kind
}) {
    if (typeof dynamicResolver !== "function") {
        fail(
            "APK_ROUTE_DYNAMIC_UNRESOLVED",
            `APK route node "${flow.id}" requires a dynamic ${kind}.`,
            {
                flowId: flow.id,
                kind,
                handlerId: transition.value,
                possibleNext: clone(flow.source?.possibleNext ?? [])
            }
        );
    }
    const result = dynamicResolver({
        contentIndex,
        session,
        flow: clone(flow),
        handlerId: transition.value,
        kind
    });
    const terminal = result
        && typeof result === "object"
        && result.terminal === true;
    const target = typeof result === "string"
        ? result
        : result?.target ?? result?.flowId ?? result?.nextFlowId;
    if (!terminal && (typeof target !== "string" || target.length === 0)) {
        fail(
            "APK_ROUTE_DYNAMIC_INVALID_RESULT",
            `Dynamic ${kind} for "${flow.id}" did not return a flow ID.`,
            { flowId: flow.id, kind, handlerId: transition.value, result }
        );
    }
    if (!terminal && !contentIndex.getFlow(target)) {
        fail(
            "APK_ROUTE_FLOW_NOT_FOUND",
            `Dynamic ${kind} returned an unknown flow "${target}".`,
            { flowId: flow.id, kind, handlerId: transition.value, target }
        );
    }
    const effects = typeof result === "string"
        ? []
        : Array.isArray(result?.effects)
            ? clone(result.effects)
            : null;
    if (effects === null) {
        fail(
            "APK_ROUTE_DYNAMIC_INVALID_EFFECTS",
            `Dynamic ${kind} for "${flow.id}" returned invalid effects.`,
            { flowId: flow.id, kind, handlerId: transition.value, result }
        );
    }
    let effectResult = null;
    if (effects.length > 0) {
        effectResult = applyApkEffects(
            session.character,
            effects,
            {
                reason: "apk-route-dynamic",
                referenceId: `${flow.id}:${transition.value}`,
                idempotencyKeyPrefix: `dynamic:${session.packId}:${session.history.length}:${flow.id}:${transition.value}`
            }
        );
        session.character = effectResult.character;
        session.dynamicHistory ??= [];
    }
    session.dynamicHistory ??= [];
    session.dynamicHistory.push({
        flowId: flow.id,
        kind,
        handlerId: transition.value,
        target: terminal ? null : target,
        terminal,
        effects,
        applied: effects.length > 0,
        controls: clone(effectResult?.controls ?? null)
    });
    if (terminal) {
        session.currentFlowId = null;
        session.currentPoolId = null;
        session.pendingNextStepId = null;
        session.pendingDynamic = null;
        session.routeStatus = "terminal";
        session.finished = true;
        return null;
    }
    session.currentFlowId = target;
    return target;
}

export function resolveApkRoutePool({
    contentIndex,
    session,
    dynamicResolver = null,
    dynamicAction = null,
    maxHops = 50
} = {}) {
    if (!contentIndex?.flowsById || !contentIndex?.getPool) {
        fail("INVALID_APK_ROUTE_INDEX", "APK route pool resolution requires a route content index.");
    }
    validateSession(session);
    if (session.finished || session.character?.ending) {
        return {
            status: "terminal",
            flowId: session.currentFlowId,
            poolId: null,
            flow: null,
            visitedFlowIds: []
        };
    }
    if (typeof session.currentFlowId !== "string" || session.currentFlowId.length === 0) {
        fail("APK_ROUTE_FLOW_MISSING", "APK route session has no current flow ID.");
    }

    let flowId = session.currentFlowId;
    const visitedFlowIds = [];
    for (let hop = 0; hop < maxHops; hop += 1) {
        if (visitedFlowIds.includes(flowId)) {
            fail(
                "APK_ROUTE_CYCLE",
                `APK route resolution cycled at flow "${flowId}".`,
                { visitedFlowIds }
            );
        }
        visitedFlowIds.push(flowId);
        const flow = contentIndex.getFlow(flowId);
        if (!flow) {
            fail("APK_ROUTE_FLOW_NOT_FOUND", `APK flow "${flowId}" does not exist.`, {
                flowId,
                visitedFlowIds
            });
        }

        const poolId = exactTransition(flow.route?.pool);
        if (poolId) {
            if (!contentIndex.getPool(poolId)) {
                fail(
                    "APK_ROUTE_POOL_NOT_FOUND",
                    `APK flow "${flow.id}" points to missing pool "${poolId}".`,
                    { flowId: flow.id, poolId, visitedFlowIds }
                );
            }
            return {
                status: "pool",
                flowId: flow.id,
                poolId,
                flow: clone(flow),
                visitedFlowIds
            };
        }

        const next = exactTransition(flow.route?.next);
        if (next) {
            flowId = next;
            continue;
        }

        const resolver = flow.route?.getNext;
        if (resolver?.kind === "exact-string") {
            flowId = resolveDynamicTransition({
                contentIndex,
                session,
                flow,
                transition: resolver,
                dynamicResolver,
                kind: "resolver"
            });
            continue;
        }

        const action = flow.route?.action;
        if (action?.kind === "exact-string") {
            const nextFlowId = resolveDynamicTransition({
                contentIndex,
                session,
                flow,
                transition: action,
                dynamicResolver: dynamicAction,
                kind: "action"
            });
            if (nextFlowId === null && session.routeStatus === "terminal") {
                return {
                    status: "terminal",
                    flowId: null,
                    poolId: null,
                    flow: null,
                    visitedFlowIds
                };
            }
            flowId = nextFlowId;
            continue;
        }

        const possibleNext = Array.isArray(flow.source?.possibleNext)
            ? flow.source.possibleNext
            : [];
        if (possibleNext.length > 0) {
            fail(
                "APK_ROUTE_AMBIGUOUS",
                `APK flow "${flow.id}" has possibleNext but no resolvable selector.`,
                { flowId: flow.id, possibleNext: clone(possibleNext), visitedFlowIds }
            );
        }
        fail(
            "APK_ROUTE_TERMINAL_UNRESOLVED",
            `APK flow "${flow.id}" has no pool or resolvable next step.`,
            { flowId: flow.id, visitedFlowIds }
        );
    }
    fail(
        "APK_ROUTE_HOP_LIMIT",
        `APK route resolution exceeded ${maxHops} flow hops.`,
        { currentFlowId: flowId, visitedFlowIds }
    );
}

export function drawApkRouteStep({
    contentIndex,
    session,
    dynamicResolver = null,
    dynamicAction = null
} = {}) {
    validateSession(session);
    const snapshot = clone(session);
    try {
        const resolved = resolveApkRoutePool({
            contentIndex,
            session,
            dynamicResolver,
            dynamicAction
        });
        if (resolved.status === "terminal") return resolved;
        const cursorBefore = session.random.cursor;
        const spin = drawApkPool({
            contentIndex,
            character: session.character,
            poolId: resolved.poolId,
            random: session.random
        });
        session.currentPoolId = resolved.poolId;
        session.routeStatus = "drawn";
        session.pendingDynamic = null;
        session.lastRouteSpin = {
            flowId: resolved.flowId,
            poolId: resolved.poolId,
            optionId: spin.optionId,
            cursorBefore,
            cursorAfter: session.random.cursor,
            visitedFlowIds: clone(resolved.visitedFlowIds)
        };
        return {
            ...spin,
            flowId: resolved.flowId,
            poolId: resolved.poolId,
            flow: resolved.flow,
            visitedFlowIds: resolved.visitedFlowIds,
            routeStatus: session.routeStatus
        };
    } catch (error) {
        restoreSession(session, snapshot);
        throw error;
    }
}

function restoreSession(session, snapshot) {
    for (const key of Object.keys(session)) delete session[key];
    Object.assign(session, snapshot);
}

function buildFollowUp({
    contentIndex,
    session,
    sourcePoolId,
    sourceOptionId,
    followUp,
    returnFlowId,
    index
}) {
    const targetPoolId = followUp?.targetPoolId;
    const targetFlowId = contentIndex.getFlowForPool(targetPoolId);
    if (!targetFlowId) {
        fail(
            "APK_ROUTE_FOLLOWUP_FLOW_NOT_FOUND",
            `APK follow-up pool "${String(targetPoolId)}" has no formal flow.`,
            { sourcePoolId, sourceOptionId, followUp: clone(followUp) }
        );
    }
    if (followUp?.prepare) {
        fail(
            "APK_ROUTE_FOLLOWUP_PREPARE_UNRESOLVED",
            `APK follow-up "${String(followUp.reason ?? "unknown")}" requires prepare semantics.`,
            { sourcePoolId, sourceOptionId, followUp: clone(followUp), targetFlowId }
        );
    }
    const requirements = Array.isArray(followUp?.requirements)
        ? followUp.requirements
        : [];
    const requirementStatus = requirementResult(requirements, session.character);
    if (!requirementStatus.met) {
        return {
            skipped: true,
            reason: requirementStatus.unresolved.length > 0
                ? "requirements_unresolved"
                : "requirements_not_met",
            targetPoolId,
            targetFlowId,
            requirementStatus
        };
    }
    return {
        id: `${sourcePoolId}:${sourceOptionId}:${session.history.length}:${index}`,
        sourcePoolId,
        sourceOptionId,
        targetPoolId,
        targetFlowId,
        remainingDraws: Math.max(1, Math.trunc(Number(followUp.count) || 1)),
        returnFlowId,
        reason: followUp.reason ?? null,
        requirementStatus
    };
}

function applyFormalMartialSoulHandler({
    contentIndex,
    session,
    spin,
    routeOption,
    optionId
}) {
    const evidence = routeOptionMartialSoulEvidence(routeOption);
    if (!evidence) {
        fail(
            "APK_ROUTE_MARTIAL_SOUL_EVIDENCE_MISSING",
            `APK option "${optionId}" has no source-proven martial soul handler evidence.`,
            {
                poolId: spin.poolId,
                optionId,
                handlerId: "applyHumanMartialSoul",
                flowId: spin.flowId
            }
        );
    }

    const source = sourceOption(routeOption);
    const hasExtremeMartialSoul = (
        session.character.martialSouls ?? []
    ).some(soul => soul?.category === "极致武魂")
        || evidence.category === "极致武魂";
    const effects = [
        {
            type: "addMartialSoul",
            soulId: optionId,
            name: source.text ?? optionId,
            category: evidence.category,
            tags: evidence.tags,
            passives: evidence.passives
        },
        {
            type: "setFlag",
            key: "hasExtremeMartialSoul",
            value: hasExtremeMartialSoul
        },
        ...evidence.effects
    ];
    const effectResult = applyApkEffects(
        session.character,
        effects,
        {
            reason: "apk-route-custom-handler",
            referenceId: `${spin.poolId}:${optionId}:applyHumanMartialSoul`,
            idempotencyKeyPrefix: `custom:${session.packId}:${spin.poolId}:${optionId}:${session.history.length}`
        }
    );
    session.character = effectResult.character;
    session.dynamicHistory ??= [];
    session.dynamicHistory.push({
        kind: "customHandler",
        handlerId: evidence.handlerId,
        operation: evidence.operation,
        flowId: spin.flowId,
        poolId: spin.poolId,
        optionId,
        formalContext: evidence.formalContext,
        effects: clone(effects),
        applied: true,
        controls: clone(effectResult.controls ?? null)
    });
    return effectResult;
}

function applyPrepareSoulRingHandler({
    contentIndex,
    session,
    spin,
    routeOption,
    optionId
}) {
    const rule = contentIndex.getHumanSoulRingRule(spin.poolId, optionId);
    if (!rule) {
        fail(
            "APK_ROUTE_SOUL_RING_EVIDENCE_MISSING",
            `APK option "${optionId}" has no source-proven soul-ring rule.`,
            {
                poolId: spin.poolId,
                optionId,
                handlerId: "prepareSoulRing",
                flowId: spin.flowId
            }
        );
    }
    if (!Number.isFinite(rule.ringYears) || rule.ringYears <= 0) {
        fail(
            "APK_ROUTE_SOUL_RING_EVIDENCE_INVALID",
            `APK option "${optionId}" has an invalid source soul-ring age.`,
            { poolId: spin.poolId, optionId, rule: clone(rule) }
        );
    }
    const pendingRing = session.character?.pendingRing;
    const soulIndex = Number(pendingRing?.soulIndex);
    const ringIndex = Number(pendingRing?.ringIndex);
    if (!isPlainObject(pendingRing)
        || !Number.isInteger(soulIndex)
        || soulIndex < 0
        || !Number.isInteger(ringIndex)
        || ringIndex < 1
        || ringIndex > 9) {
        fail(
            "APK_ROUTE_SOUL_RING_CONTEXT_MISSING",
            `APK option "${optionId}" requires a valid pendingRing context.`,
            {
                poolId: spin.poolId,
                optionId,
                handlerId: "prepareSoulRing",
                pendingRing: clone(pendingRing ?? null)
            }
        );
    }

    const source = sourceOption(routeOption);
    session.character.pendingRing = {
        ...pendingRing,
        years: rule.ringYears,
        source: {
            optionId,
            text: source.text ?? rule.text ?? optionId
        },
        grantsSoulBone: rule.grantsSoulBone === true
    };
    const effectResult = {
        character: session.character,
        controls: { appliedTypes: [], terminal: null },
        applied: true
    };
    session.dynamicHistory ??= [];
    session.dynamicHistory.push({
        kind: "customHandler",
        handlerId: "prepareSoulRing",
        operation: "prepareSoulRing",
        flowId: spin.flowId,
        poolId: spin.poolId,
        optionId,
        pendingRing: clone(session.character.pendingRing),
        effects: [],
        applied: true,
        controls: clone(effectResult.controls)
    });
    return effectResult;
}

function specialResultElementValue(character, elementId) {
    const value = character?.elementProgress?.[elementId];
    return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function normalizeFormalSpecialResultEffects(poolId, optionId, effects) {
    return effects.map(effect => {
        if (effect?.type === "setFlag"
            && ["formal:element-draws", "formal:domain-draws"].includes(effect.key)
            && typeof effect.value === "number") {
            return {
                type: "changeCounter",
                key: effect.key,
                amount: effect.value
            };
        }
        return clone(effect);
    });
}

function applyFormalSpecialResultHandler({
    contentIndex,
    session,
    spin,
    optionId
}) {
    const rule = contentIndex.getFormalSpecialResultRule(spin.poolId, optionId);
    if (!rule) {
        fail(
            "APK_ROUTE_SPECIAL_RESULT_EVIDENCE_MISSING",
            `APK option "${optionId}" has no source-proven formal special-result rule.`,
            {
                poolId: spin.poolId,
                optionId,
                handlerId: FORMAL_SPECIAL_RESULT_HANDLER,
                flowId: spin.flowId
            }
        );
    }

    const character = session.character;
    const immunity = rule.immunity ?? null;
    const hasCombatThreshold = Object.prototype.hasOwnProperty.call(rule, "combatThreshold");
    const hasDeathThreshold = Object.prototype.hasOwnProperty.call(rule, "deathThreshold");
    const combatPowerResult = hasCombatThreshold || hasDeathThreshold
        ? (() => {
            if (!contentIndex.combatPowerEvidence) {
                fail(
                    "APK_ROUTE_SPECIAL_RESULT_COMBAT_POWER_EVIDENCE_MISSING",
                    "正式特殊成长结果依赖 APK 战力总值，但路线内容索引未加载战力来源证据包。",
                    {
                        poolId: spin.poolId,
                        optionId,
                        handlerId: FORMAL_SPECIAL_RESULT_HANDLER
                    }
                );
            }
            return calculateApkCombatPower(
                character,
                contentIndex.combatPowerEvidence
            );
        })()
        : null;
    let success;
    if (immunity) {
        success = specialResultElementValue(character, immunity.elementId)
            >= Math.max(1, Number(immunity.level ?? 1));
    } else if (hasCombatThreshold) {
        success = compareApkCombatThreshold(
            combatPowerResult.total,
            rule.combatThreshold,
            rule.combatThresholdOperator ?? ">="
        );
    } else {
        success = true;
    }

    const completeLaw = typeof rule.completeLawElementId === "string"
        && specialResultElementValue(character, rule.completeLawElementId) >= 4;
    const failureAllowed = success === false
        && (!hasDeathThreshold
            || combatPowerResult.total < Number(rule.deathThreshold));
    const chosenEffects = completeLaw
        ? rule.lawCompletionEffects
        : success
            ? rule.effects
            : failureAllowed
                ? rule.failureEffects
                : [];
    const coreEffects = normalizeFormalSpecialResultEffects(
        spin.poolId,
        optionId,
        [
            ...(Array.isArray(rule.commonEffects) ? rule.commonEffects : []),
            ...(Array.isArray(chosenEffects) ? chosenEffects : [])
        ]
    );
    let effectResult = {
        character,
        controls: { appliedTypes: [], terminal: null },
        applied: false
    };
    const applyBatch = (effects, suffix) => {
        if (effects.length === 0) return;
        const result = applyApkEffects(
            session.character,
            effects,
            {
                reason: "apk-route-custom-handler",
                referenceId: `${spin.poolId}:${optionId}:${FORMAL_SPECIAL_RESULT_HANDLER}:${suffix}`,
                idempotencyKeyPrefix: `custom:${session.packId}:${spin.poolId}:${optionId}:${session.history.length}:${suffix}`
            }
        );
        session.character = result.character;
        effectResult = {
            character: result.character,
            controls: {
                appliedTypes: [
                    ...(effectResult.controls?.appliedTypes ?? []),
                    ...(result.controls?.appliedTypes ?? [])
                ],
                terminal: result.controls?.terminal ?? effectResult.controls?.terminal ?? null
            },
            applied: effectResult.applied || result.applied
        };
    };

    applyBatch(coreEffects, "core");

    const nextPoolId = typeof rule.nextPoolId === "string" && rule.nextPoolId.length > 0
        ? rule.nextPoolId
        : null;
    if (success && nextPoolId && !contentIndex.getPool(nextPoolId)) {
        fail(
            "APK_ROUTE_SPECIAL_RESULT_NEXT_POOL_NOT_FOUND",
            `正式特殊成长结果指向缺失的后续池 "${nextPoolId}"。`,
            { poolId: spin.poolId, optionId, nextPoolId }
        );
    }
    const continueToSpecialPool = success
        && nextPoolId !== null
        && formalSpecialResultPoolHasEligibleOption(
            contentIndex,
            nextPoolId,
            session.character
        );
    const nextFlow = continueToSpecialPool
        ? `douluo1:flow.special.${nextPoolId}`
        : FORMAL_SCHEDULER_FLOW;

    const timeEffects = character.talentProgression?.talentGrade === "F"
        && !continueToSpecialPool
        ? [{ type: "advanceHumanTime", years: 1 }]
        : [];
    if (!session.character.ending) applyBatch(timeEffects, "time");

    const flagEffects = !session.character.ending
        ? [
            ...(!success && hasCombatThreshold
                ? [{ type: "setFlag", key: "formal:last-combat-lost", value: true }]
                : []),
            { type: "setFlag", key: FORMAL_SPECIAL_RESULT_NEXT_FLOW_FLAG, value: nextFlow }
        ]
        : [];
    applyBatch(flagEffects, "next");

    session.dynamicHistory ??= [];
    session.dynamicHistory.push({
        kind: "customHandler",
        handlerId: FORMAL_SPECIAL_RESULT_HANDLER,
        operation: "formalSpecialResult",
        flowId: spin.flowId,
        poolId: spin.poolId,
        optionId,
        success,
        combatPower: clone(combatPowerResult),
        combatThreshold: hasCombatThreshold ? rule.combatThreshold : null,
        combatThresholdOperator: hasCombatThreshold
            ? rule.combatThresholdOperator ?? ">="
            : null,
        deathThreshold: hasDeathThreshold ? rule.deathThreshold : null,
        failureAllowed,
        completeLaw,
        nextPoolId,
        nextFlow,
        effects: clone([...coreEffects, ...timeEffects, ...flagEffects]),
        applied: effectResult.applied,
        controls: clone(effectResult.controls ?? null)
    });
    return effectResult;
}

export function commitApkRouteOption({
    contentIndex,
    session,
    spin,
    option = spin?.option,
    dynamicResolver = null
} = {}) {
    if (!contentIndex?.getRouteOption) {
        fail("INVALID_APK_ROUTE_INDEX", "APK route option commit requires a route content index.");
    }
    validateSession(session);
    if (!spin || typeof spin.poolId !== "string") {
        fail("INVALID_APK_ROUTE_SPIN", "APK route option commit requires a route spin result.");
    }
    const optionId = spin.optionId ?? getOptionId(option);
    const routeOption = contentIndex.getRouteOption(spin.poolId, optionId);
    if (!routeOption) {
        fail(
            "APK_ROUTE_OPTION_NOT_FOUND",
            `APK route option "${String(optionId)}" does not exist in pool "${spin.poolId}".`,
            { poolId: spin.poolId, optionId }
        );
    }
    const customHandler = routeOptionCustomHandler(routeOption);
    const operationContext = {
        contentIndex,
        packId: contentIndex.packId,
        session,
        spin,
        flowId: spin.flowId,
        poolId: spin.poolId,
        routeOption,
        customHandler,
        optionId
    };
    const operation = customHandler
        ? resolveRouteOperation(operationContext)
        : null;
    if (customHandler && !operation) {
        fail(
            "APK_ROUTE_DYNAMIC_OPTION_UNRESOLVED",
            `APK option "${optionId}" requires customHandler "${customHandler}".`,
            { poolId: spin.poolId, optionId, customHandler }
        );
    }
    if (operation?.status === "unresolved") {
        operation.execute({
            ...operationContext,
            operation,
            customHandler
        });
    }
    const snapshot = clone(session);
    try {
        const committed = commitApkOption({
            session,
            contentIndex,
            option,
            poolId: spin.poolId,
            reason: "apk-route-option",
            effectsOverride: operation?.operationId === "formal.specialResult"
                ? []
                : null
        });
        const customEffectResult = operation
            ? operation.execute(operationContext)
            : null;
        const flow = contentIndex.getFlow(spin.flowId);
        let next = routeOptionNext(routeOption)
            ?? exactTransition(flow?.route?.next);
        if (!next) {
            const resolver = flow?.route?.getNext;
            if (resolver?.kind === "exact-string") {
                next = resolveDynamicTransition({
                    contentIndex,
                    session,
                    flow,
                    transition: resolver,
                    dynamicResolver,
                    kind: "resolver"
                });
            }
        }
        if (next && !contentIndex.getFlow(next)) {
            fail(
                "APK_ROUTE_FLOW_NOT_FOUND",
                `APK option "${optionId}" points to missing flow "${next}".`,
                { poolId: spin.poolId, optionId, next }
            );
        }
        if (!next && !session.character.ending && routeOptionFollowUps(routeOption).length === 0) {
            fail(
                "APK_ROUTE_NEXT_UNRESOLVED",
                `APK option "${optionId}" has no exact next flow and no terminal effect.`,
                {
                    poolId: spin.poolId,
                    optionId,
                    effects: optionEffects(routeOption)
                }
            );
        }

        let nextFlowId = next;
        const activeFollowUp = session.pendingFollowUps[0];
        if (activeFollowUp?.targetPoolId === spin.poolId) {
            activeFollowUp.remainingDraws -= 1;
            if (activeFollowUp.remainingDraws > 0) {
                nextFlowId = activeFollowUp.targetFlowId;
            } else {
                const completed = session.pendingFollowUps.shift();
                nextFlowId = session.pendingFollowUps[0]?.targetFlowId
                    ?? completed.returnFlowId;
            }
        }

        const followUpResults = [];
        const followUps = routeOptionFollowUps(routeOption);
        for (const [index, followUp] of followUps.entries()) {
            const result = buildFollowUp({
                contentIndex,
                session,
                sourcePoolId: spin.poolId,
                sourceOptionId: optionId,
                followUp,
                returnFlowId: nextFlowId,
                index
            });
            followUpResults.push(result);
            if (!result.skipped) {
                session.pendingFollowUps.push(result);
            }
        }
        const firstPending = session.pendingFollowUps[0];
        if (firstPending) nextFlowId = firstPending.targetFlowId;

        if (session.character.ending || session.finished) {
            session.currentFlowId = null;
            session.currentPoolId = null;
            session.pendingNextStepId = null;
            session.routeStatus = "terminal";
            session.pendingDynamic = null;
        } else if (typeof nextFlowId === "string" && nextFlowId.length > 0) {
            session.currentFlowId = nextFlowId;
            session.currentPoolId = null;
            session.pendingNextStepId = nextFlowId;
            session.routeStatus = "ready";
            session.pendingDynamic = null;
        } else {
            fail(
                "APK_ROUTE_NEXT_UNRESOLVED",
                `APK option "${optionId}" did not produce a next flow.`,
                { poolId: spin.poolId, optionId, followUpResults }
            );
        }

        session.routeHistory.push({
            flowId: spin.flowId,
            poolId: spin.poolId,
            optionId,
            nextFlowId: session.currentFlowId,
            followUpResults,
            routeStatus: session.routeStatus
        });
        session.lastRouteSpin = {
            ...(session.lastRouteSpin ?? {}),
            flowId: spin.flowId,
            poolId: spin.poolId,
            optionId,
            nextFlowId: session.currentFlowId,
            routeStatus: session.routeStatus
        };
        return {
            session,
            option: clone(committed.option),
            effectResult: customEffectResult
                ? {
                    base: committed.effectResult,
                    customHandler: customEffectResult
                }
                : committed.effectResult,
            nextFlowId: session.currentFlowId,
            followUpResults,
            routeStatus: session.routeStatus
        };
    } catch (error) {
        restoreSession(session, snapshot);
        throw error;
    }
}

export function runApkRouteStep({
    contentIndex,
    session,
    dynamicResolver = null,
    dynamicAction = null
} = {}) {
    const spin = drawApkRouteStep({
        contentIndex,
        session,
        dynamicResolver,
        dynamicAction
    });
    if (spin.status === "terminal") return spin;
    return commitApkRouteOption({
        contentIndex,
        session,
        spin,
        dynamicResolver
    });
}

export class ApkRouteRuntimeError extends Error {
    constructor(code, message, details = {}) {
        super(message);
        this.name = "ApkRouteRuntimeError";
        this.code = code;
        this.details = details;
    }
}

export default Object.freeze({
    APK_ROUTE_GRAPH_SCHEMA_VERSION,
    APK_ROUTE_RUNTIME_VERSION,
    APK_ROUTE_SESSION_SCHEMA_VERSION,
    APK_ROUTE_OPERATION_REGISTRY,
    ApkRouteRuntimeError,
    commitApkRouteOption,
    createApkRouteContentIndex,
    createApkRouteDynamicHandlers,
    createApkRouteSession,
    drawApkRouteStep,
    resolveApkRoutePool,
    runApkRouteStep
});
