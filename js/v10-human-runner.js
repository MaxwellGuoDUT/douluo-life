import {
    V05_DEFAULT_SEED,
    createV05ContentIndex,
    createV05DemoRunner
} from "./v05-demo.js";
import {
    createApkRouteContentIndex,
    createApkRouteDynamicHandlers,
    createApkRouteRequirementEvaluator
} from "./apk-route-runtime.js";
import { calculateApkCombatPower } from "./apk-combat-power-runtime.js";
import { applyApkEffects, selectApkPoolOptions } from "./apk-rule-runtime.js";
import { planFormalHumanScheduler, V10_ASCENSION_ATTEMPT_AGE, assertV10AscensionRetryContract } from "./apk-scheduler-runtime.js";

import { V10_GOD_TRIAL_SEMANTICS, withV10GodTrialRuntime, evaluateV10GodTrialRequirement } from "./v10-god-trial-runtime.js";

import { createV05WheelSegments, resolveV05StaticPool } from "./v05-wheel-view.js";

const V10_HUMAN_MAX_STEPS = 2000;
const V10_BEAST_MAX_STEPS = 25000;
const V10_LIFESPAN_PEAK_LEVEL = "v10:lifespan:peak-level";
const SHREK_FACTION_POOL_ID = "d2701441-4df0-4eeb-bed4-b5dbc8390392";
const SHREK_FACTION_OPTION_ID = "cfe7dd";
const V10_LIFESPAN_TIERS = Object.freeze([
    { level: 0, youngest: 150, oldest: 180 },
    { level: 30, youngest: 165, oldest: 200 },
    { level: 50, youngest: 185, oldest: 230 },
    { level: 70, youngest: 220, oldest: 280 },
    { level: 90, youngest: 260, oldest: 320 },
    { level: 95, youngest: 300, oldest: 360 },
    { level: 99, youngest: 340, oldest: 400 }
]);
const SOURCE_CHARACTER_FIELDS = Object.freeze([
    "route", "wallet", "entrySelections", "age", "level", "maxLevel",
    "beastYears", "timelineEra", "gender", "appearance", "appearanceRank",
    "storyTime", "timelineAge", "elapsedYears", "npcAges", "npcRelationships",
    "innatePower", "initialPowerResult", "talentProgression", "annualGrowthPolicy",
    "faction", "storyBranch", "branchStartTimelineAge", "beast", "beastOrigin",
    "godTrial", "godTrials", "seaTrial", "martialSoulTalents", "talents",
    "martialSouls", "bloodlines", "attributes", "elementProgress", "soulBones",
    "skills", "artifacts", "traits", "titles", "domains", "godhood", "godhoods",
    "ending", "flags", "background", "affiliations"
]);

function projectCharacter(character) {
    return Object.fromEntries(SOURCE_CHARACTER_FIELDS
        .filter(field => field in character)
        .map(field => [field, structuredClone(character[field])]));
}

export { projectCharacter as projectV10SourceCharacter };

function exactString(value, targetKinds = []) {
    return typeof value === "string"
        ? { kind: "exact-string", value, targetKinds, resolved: true }
        : { kind: "absent" };
}

function withSourceBeastRuntime(loaded, sourcePack, route) {
    if (route !== "beast" || sourcePack?.manifest?.id === "douluo2") return loaded;
    const foundation = sourcePack?.foundation;
    const flow = foundation?.$?.beastPeriod;
    const pool = foundation?.a3?.find(item => item?.id === flow?.poolId);
    if (!flow || !pool) {
        throw Object.assign(new Error("权威 foundation 缺少魂兽时期入口。"), {
            code: "V10_BEAST_PERIOD_SOURCE_MISSING"
        });
    }
    const sourceGraphPack = sourcePack?.routeGraph?.pack;
    const landFlow = sourceGraphPack?.flows?.find(item => item.id === "beastLandFinal");
    const landPool = sourceGraphPack?.pools?.find(item => (
        item.id === "d39bb131-6949-4a46-9733-19d0335f668c"
    ));
    if (!landFlow || !landPool) {
        throw Object.assign(new Error("生成清单缺少权威陆地兽神终局闭包。"), {
            code: "V10_BEAST_LAND_CLOSURE_MISSING"
        });
    }
    const routeFlow = {
        id: flow.id,
        source: structuredClone(flow),
        route: {
            pool: exactString(flow.poolId, ["pool"]),
            next: exactString(flow.next, ["flow"]),
            possibleNext: [],
            getNext: { kind: "absent" },
            leaveNext: { kind: "absent" },
            action: { kind: "absent" }
        }
    };
    const routePool = {
        id: pool.id,
        source: structuredClone(pool),
        options: pool.options.map(option => ({
            id: option.id,
            source: structuredClone(option),
            route: {
                next: { kind: "absent" },
                customHandler: exactString(option.customHandler, ["customHandler"]),
                followUps: [],
                requirements: structuredClone(option.requirements ?? []),
                rerollWhen: structuredClone(option.rerollWhen ?? []),
                effects: structuredClone(option.effects ?? []),
                failureEffects: structuredClone(option.failureEffects ?? [])
            }
        }))
    };
    const routeGraph = structuredClone(loaded.routeGraph);
    const pack = routeGraph.packs.find(item => item.id === "douluo1");
    if (!pack.flows.some(item => item.id === flow.id)) pack.flows.unshift(routeFlow);
    if (!pack.pools.some(item => item.id === pool.id)) pack.pools.unshift(routePool);
    if (!pack.flows.some(item => item.id === landFlow.id)) {
        pack.flows.push(structuredClone(landFlow));
    }
    if (!pack.pools.some(item => item.id === landPool.id)) {
        pack.pools.push(structuredClone(landPool));
    }
    return { ...loaded, routeGraph };
}

function withCorrectedShrekBranch(loaded, packId, route) {
    if (packId !== "douluo1" || route !== "human") return loaded;
    const pack = loaded.routeGraph?.packs?.find(item => item.id === packId);
    const pool = pack?.pools?.find(item => item.id === SHREK_FACTION_POOL_ID);
    const option = pool?.options?.find(item => item.id === SHREK_FACTION_OPTION_ID);
    const sourceOption = pool?.source?.options?.find(item => item.id === SHREK_FACTION_OPTION_ID);
    const effects = option?.route?.effects;
    const expected = effects?.filter(effect => effect.type === "setStoryBranch");
    if (!option || expected?.length !== 1 || expected[0].branch !== 3
        || !effects.some(effect => effect.type === "setFaction"
            && effect.selection?.optionId === SHREK_FACTION_OPTION_ID)
        || JSON.stringify(option.source?.effects) !== JSON.stringify(effects)
        || (sourceOption && JSON.stringify(sourceOption.effects) !== JSON.stringify(effects))) {
        throw Object.assign(new Error("史莱克主线源选项结构已变化，无法应用已核准的分支修正。"), {
            code: "V10_SHREK_BRANCH_SOURCE_DRIFT"
        });
    }
    const correctedEffects = effects.flatMap(effect => effect.type === "setStoryBranch"
        ? [{ ...effect, branch: 1 }, { type: "setFlag", key: "formal:faction-locked", value: true }]
        : [effect]);
    const correctedOption = {
        ...option,
        source: { ...option.source, effects: correctedEffects },
        route: { ...option.route, effects: correctedEffects }
    };
    const correctedPool = {
        ...pool,
        ...(sourceOption ? { source: { ...pool.source, options: pool.source.options.map(item =>
            item.id === SHREK_FACTION_OPTION_ID ? { ...item, effects: correctedEffects } : item) } } : {}),
        options: pool.options.map(item => item.id === SHREK_FACTION_OPTION_ID ? correctedOption : item)
    };
    return { ...loaded, routeGraph: { ...loaded.routeGraph, packs: loaded.routeGraph.packs.map(item =>
        item.id === packId ? { ...item, pools: item.pools.map(candidate =>
            candidate.id === SHREK_FACTION_POOL_ID ? correctedPool : candidate) } : item) } };
}

function usesOldShrekBranch(snapshot) {
    return snapshot?.session?.history?.some(item => item.poolId === SHREK_FACTION_POOL_ID
        && item.optionId === SHREK_FACTION_OPTION_ID
        && item.effects?.some(effect => effect.type === "setStoryBranch" && effect.branch === 3));
}

export function planV10HumanLifespan(session, seed) {
    const character = session.character;
    if (character.route === "beast" || character.ending || character.godhood
        || character.flags?.immortal === true
        || character.talents?.some(talent => talent?.optionId === "0d2184")) return null;
    const age = character.age;
    if (!Number.isSafeInteger(age) || age < 150) return null;
    const level = Math.max(0, Math.trunc(Number(character.level) || 0),
        Math.trunc(Number(character.flags?.[V10_LIFESPAN_PEAK_LEVEL]) || 0));
    const tier = V10_LIFESPAN_TIERS.findLast(entry => level >= entry.level);
    // One seed-specific longevity percentile is shared by every cultivation
    // tier, so gaining levels can only extend the lifespan.
    let hash = 2166136261;
    const key = `${session.packId}:${seed}:v10-human-lifespan`;
    for (let index = 0; index < key.length; index += 1) {
        hash = Math.imul(hash ^ key.charCodeAt(index), 16777619);
    }
    const lifespan = tier.youngest + Math.floor((hash >>> 0) / 4294967296
        * (tier.oldest - tier.youngest + 1));
    if (age < lifespan) return null;
    return {
        terminal: true,
        effects: [{
            type: "ending",
            endingId: `${session.packId}:v10-human-natural-lifespan`,
            title: "寿终",
            kind: "death",
            text: `享年${age}岁；最高修为${level}级。`
        }],
        reason: "v10-human-natural-lifespan"
    };
}

function sourceRuntimeHandlers(contentIndex, sourcePack, allowPost150, seed) {
    const builtIn = createApkRouteDynamicHandlers({ contentIndex });
    const game = sourcePack?.game;
    if (!game) return builtIn;
    const isDouluo2 = sourcePack.manifest?.id === "douluo2";
    const localRequirementEvaluator = isDouluo2 ? null : createApkRouteRequirementEvaluator({ contentIndex });
    const contract = sourcePack.routeGraph?.pack?.runtimeContract;
    if (isDouluo2 && (!contract || typeof sourcePack.engine?.a !== "function" || typeof sourcePack.engine?.l !== "function")) {
        throw Object.assign(new Error("斗罗二缺少权威效果与条件执行器。"), { code: "V10_SOURCE_ENGINE_MISSING" });
    }
    function checkRequirement(requirement) {
        if (!contract.requirementTypes.includes(requirement?.type)) {
            throw Object.assign(new Error(`Source requirement unavailable: ${requirement?.type}`), { code: "APK_REQUIREMENT_UNRESOLVED" });
        }
        if (["anyOf", "allOf"].includes(requirement.type)) requirement.conditions.forEach(checkRequirement);
    }
    const effectApplier = isDouluo2 ? (character, effects, meta = {}) => {
        const raw = effects.map(record => record?.normalized?.effect ?? record?.effect ?? record);
        function checkEffects(items) {
            for (const effect of items) {
                if (effect?.type !== "addLog" && !contract.effectTypes.includes(effect?.type)) {
                    throw Object.assign(new Error(`Source effect unavailable: ${effect?.type}`), { code: "UNSUPPORTED_APK_EFFECT" });
                }
                if (effect.type === "conditional") {
                    checkRequirement(effect.condition);
                    checkEffects(effect.thenEffects);
                    checkEffects(effect.elseEffects ?? []);
                }
            }
        }
        checkEffects(raw);
        const next = structuredClone(character);
        const transactions = next.transactions ?? [];
        if (meta.idempotencyKeyPrefix && transactions.some(item => item.idempotencyKey?.startsWith(`${meta.idempotencyKeyPrefix}:`))) {
            return { character: next, controls: { appliedTypes: [], skipped: true }, applied: false };
        }
        const sourceCharacter = projectCharacter(next);
        // Source Na leaves addLog to the option/timeline presentation; keep the
        // existing local log convention without sending it to the state engine.
        sourcePack.engine.a(sourceCharacter, raw.filter(effect => effect.type !== "addLog"), meta);
        Object.assign(next, JSON.parse(JSON.stringify(sourceCharacter)));
        next.transactions = [...transactions, ...raw.map((effect, index) => ({
            reason: meta.reason, referenceId: meta.referenceId,
            idempotencyKey: `${meta.idempotencyKeyPrefix ?? "effect-batch"}:${index}:${effect.type}`,
            type: effect.type
        }))];
        return { character: next, controls: { appliedTypes: raw.map(effect => effect.type), terminal: next.ending ?? null }, applied: raw.length > 0 };
    } : applyApkEffects;

    function sourceCall(registryName, context, extra = {}) {
        const handler = game[registryName]?.[context.handlerId];
        if (typeof handler !== "function") return { found: false, value: null };
        const localCharacter = context.session.character;
        const sourceCharacter = projectCharacter(localCharacter);
        const post150Planner = allowPost150 && localCharacter.route !== "beast"
            && localCharacter.age >= 150 && registryName === "flowActions"
            && ["douluo2:action.annual-growth-plan", "douluo2:action.human-story.plan", "planHumanStep"].includes(context.handlerId);
        // The copied source planner embeds the 150-year ending. Give only that
        // planning call its last pre-limit age, then retain the real age.
        if (post150Planner) sourceCharacter.age = 149;
        context.session.character = sourceCharacter;
        context.session.currentStepId = context.flow?.source?.id ?? context.flow?.id;
        const value = handler({
            pack: game,
            state: context.session,
            step: context.flow?.source ?? context.flow,
            option: context.routeOption?.source ?? context.routeOption ?? null,
            ...extra
        });
        if (post150Planner) {
            if (context.session.character.age !== 149) {
                throw Object.assign(new Error("年度规划器意外修改了年龄。"), {
                    code: "V10_POST150_PLANNER_AGE_MUTATION"
                });
            }
            context.session.character.age = localCharacter.age;
        }
        context.session.character = {
            ...localCharacter,
            ...context.session.character,
            schemaVersion: localCharacter.schemaVersion
        };
        const jsonState = JSON.parse(JSON.stringify(context.session));
        for (const key of Object.keys(context.session)) delete context.session[key];
        Object.assign(context.session, jsonState);
        return {
            found: true,
            value
        };
    }

    function dynamicTransition(kind, context) {
        const registryName = kind === "action" ? "flowActions" : "flowResolvers";
        if (allowPost150 && kind === "action" && [
            "douluo1:action.formal-human.schedule",
            "douluo2:action.annual-growth-plan",
            "douluo2:action.human-story.plan",
            "planHumanStep"
        ].includes(context.handlerId)) {
            const lifespan = planV10HumanLifespan(context.session, seed);
            if (lifespan) return lifespan;
        }
        if (allowPost150 && kind === "action"
            && context.handlerId === "douluo1:action.formal-human.schedule") {
            return planFormalHumanScheduler({ contentIndex, session: context.session, allowPost150: true });
        }
        if (sourcePack.manifest?.id === "douluo2" || context.session.character?.route === "beast") {
            const source = sourceCall(registryName, context);
            if (source.found) {
                return source.value == null && context.session.character?.ending
                    ? { terminal: true, effects: [] }
                    : source.value;
            }
            if (sourcePack.manifest?.id === "douluo2") {
                throw Object.assign(new Error(`Source ${registryName} is unavailable: ${context.handlerId}`), {
                    code: "APK_ROUTE_DYNAMIC_UNRESOLVED"
                });
            }
        }
        try {
            return kind === "action"
                ? builtIn.dynamicAction(context)
                : builtIn.dynamicResolver(context);
        } catch (error) {
            if (error?.code !== "APK_ROUTE_DYNAMIC_UNRESOLVED") throw error;
            const source = sourceCall(registryName, context);
            if (source.found) return source.value;
            throw error;
        }
    }

    return Object.freeze({
        effectApplier,
        requirementEvaluator: isDouluo2
            ? (record, character) => {
                const requirement = record?.normalized?.requirement ?? record?.requirement ?? record;
                checkRequirement(requirement);
                return { status: sourcePack.engine.l(character, [requirement]) ? "met" : "not_met", requirementType: requirement.type };
            }
            : (record, character) => evaluateV10GodTrialRequirement(record, character, localRequirementEvaluator),
        dynamicAction: context => dynamicTransition("action", context),
        dynamicResolver: context => dynamicTransition("resolver", context),
        dynamicOption(context) {
            const before = context.session.character;
            const recordAscensionAttempt = contentIndex.pack?.v10GodTrialSemantics === V10_GOD_TRIAL_SEMANTICS
                && context.session.packId === "douluo1" && before.route === "human" && !before.ending
                && before.storyBranch === 2
                && before.flags?.["formal:d1-story:selected:cdae9943-fb9d-49ba-853c-40d9b78924ae:403ea3"] === true
                && context.poolId === "1209bb56-d533-48af-b012-204292b96f68"
                && context.customHandler === "douluo1:handler.formal-story.result"
                && ((context.optionId === "a3e30b" && before.level < 100)
                    || Object.hasOwn(before.flags ?? {}, V10_ASCENSION_ATTEMPT_AGE));
            if (recordAscensionAttempt) assertV10AscensionRetryContract(contentIndex, before);
            const attemptAge = before.age;
            let aggregate = null;
            let effectBatch = 0;
            const applyEffects = effects => {
                const result = effectApplier(context.session.character, effects, {
                    reason: "v10-source-custom-handler",
                    referenceId: `${context.flowId}:${context.customHandler}`,
                    idempotencyKeyPrefix: `v10-source:${context.session.packId}:${context.session.history.length}:${context.optionId}:${effectBatch++}`
                });
                context.session.character = result.character;
                aggregate = result;
                return result;
            };
            const source = sourceCall("customHandlers", {
                ...context,
                handlerId: context.customHandler,
                flow: context.contentIndex.getFlow(context.flowId)
            }, { applyEffects });
            if (!source.found) {
                const error = new Error(`Source customHandler is unavailable: ${context.customHandler}`);
                error.code = "APK_ROUTE_DYNAMIC_OPTION_UNRESOLVED";
                throw error;
            }
            if (recordAscensionAttempt && !context.session.character.ending) {
                if (context.session.character.age !== attemptAge) {
                    throw Object.assign(new Error("独立飞升结果意外改变年龄。"), { code: "V10_ASCENSION_RETRY_STATE_INVALID" });
                }
                applyEffects([{ type: "setFlag", key: V10_ASCENSION_ATTEMPT_AGE, value: attemptAge }]);
            }
            context.session.dynamicHistory.push({
                kind: "customHandler",
                handlerId: context.customHandler,
                operation: "source-runtime",
                flowId: context.flowId,
                poolId: context.poolId,
                optionId: context.optionId
            });
            return aggregate ?? source.value ?? null;
        }
    });
}

function terminalSummary(base) {
    const character = base.session.character;
    return Object.freeze({
        scope: `V1.0 ${base.session.packId} ${character?.route ?? "unknown"} source terminal`,
        packId: base.session.packId,
        seed: base.seed,
        age: character?.age ?? null,
        level: character?.level ?? null,
        route: character?.route ?? null,
        ending: structuredClone(character?.ending ?? null),
        cursor: base.session.random?.cursor ?? null,
        history: base.session.history?.length ?? 0,
        routeHistory: base.session.routeHistory?.length ?? 0,
        dynamicHistory: base.session.dynamicHistory?.length ?? 0
    });
}

function blockedResult(phase, error, summary, reason = phase) {
    return {
        status: phase,
        committed: false,
        blocked: true,
        reason,
        error,
        summary
    };
}

export function createV10HumanRunner({
    loaded,
    seed = V05_DEFAULT_SEED,
    route = "human",
    sourcePack = null,
    snapshot = null,
    allowPost150 = false
} = {}) {
    const packId = sourcePack?.manifest?.id ?? "douluo1";
    const runtimeLoaded = withCorrectedShrekBranch(
        withV10GodTrialRuntime(withSourceBeastRuntime(loaded, sourcePack, route), sourcePack, route), packId, route
    );
    let contentIndex = packId === "douluo1"
        ? createV05ContentIndex(runtimeLoaded)
        : createApkRouteContentIndex({ routeGraph: runtimeLoaded.routeGraph, packId });
    if (packId === "douluo2") {
        contentIndex = Object.freeze({ ...contentIndex,
            getFollowUpPrepareRule(poolId, optionId, index) {
                const option = sourcePack.game.pools.find(pool => pool.id === poolId)?.options.find(option => option.id === optionId);
                return option?.followUps?.[index] ?? null;
            }
        });
    }
    const handlers = sourceRuntimeHandlers(contentIndex, sourcePack, allowPost150, seed);
    const base = createV05DemoRunner({
        contentIndex,
        packId,
        routeGraph: runtimeLoaded?.routeGraph,
        seed,
        endpointAge: Number.MAX_SAFE_INTEGER,
        route,
        entryFlowId: packId === "douluo2"
            ? sourcePack.routeGraph.pack.routeEntries[route]
            : route === "beast" ? "beastPeriod" : null,
        dynamicHandlers: handlers
    });
    const godTrialRuntimeEnabled = contentIndex.pack.v10GodTrialSemantics === V10_GOD_TRIAL_SEMANTICS;
    let phase = "ready";
    let error = null;
    let summary = null;
    let busy = false;
    let lastResult = null;

    if (snapshot !== null) {
        if (godTrialRuntimeEnabled && snapshot?.runtimeSemantics !== V10_GOD_TRIAL_SEMANTICS) {
            throw Object.assign(new Error('旧存档使用了未注册二级神考奖励的运行语义，请保留原文件并重新开局。'), {
                code: 'V10_SNAPSHOT_SEMANTICS_CHANGED'
            });
        }
        if (packId === "douluo1" && route === "human" && usesOldShrekBranch(snapshot)) {
            throw Object.assign(new Error("旧存档使用了史莱克主线的错误分支语义，请保留原文件并重新开局。"), {
                code: "V10_SNAPSHOT_SEMANTICS_CHANGED"
            });
        }
        if (snapshot?.schemaVersion !== "v10-runner-snapshot/1.0"
            || snapshot?.packId !== packId
            || snapshot?.seed !== seed
            || snapshot?.route !== route
            || (packId === "douluo2" && (snapshot.contentIdentity !== sourcePack.routeGraph.pack.contentIdentity
                || !snapshot.contentIdentity
                || snapshot.session?.character?.schemaVersion !== "apk-character/1.0"
                || !["human", "beast", "transformed"].includes(snapshot.session?.character?.route)
                || !Number.isSafeInteger(snapshot.session?.random?.cursor)
                || snapshot.session.random.cursor < 0
                || snapshot.session.random.algorithm !== "pcg32-counter-v1"
                || !["history", "routeHistory", "dynamicHistory", "pendingFollowUps", "timeline"].every(key => Array.isArray(snapshot.session?.[key]))
                || !Array.isArray(snapshot.session?.character?.transactions)
                || (!snapshot.session.finished && !contentIndex.getFlow(snapshot.session.currentFlowId))))
            || !snapshot.session) {
            throw Object.assign(new Error("V1 存档与当前路线或 seed 不匹配。"), {
                code: "V10_SNAPSHOT_INVALID"
            });
        }
        base.restore(snapshot.session);
        if (base.session.finished && base.session.character.ending) {
            phase = "completed";
            summary = terminalSummary(base);
        }
    }

    function normalize(result) {
        lastResult = result;
        const sourceTerminal = base.session.routeStatus === "terminal"
            && (base.session.finished || base.session.character?.ending);
        if ((result?.committed && sourceTerminal)
            || (sourceTerminal && result?.error?.code === "V05_ROUTE_TERMINATED_EARLY")) {
            phase = "completed";
            summary = terminalSummary(base);
            error = null;
            return {
                ...result,
                status: phase,
                blocked: false,
                error: null,
                summary
            };
        }
        if (result?.status === "boundary" || result?.status === "error") {
            phase = result.status;
            error = result.error;
        } else if (!busy) {
            phase = "ready";
        }
        return { ...result, status: phase, error, summary };
    }

    function restoreSession(snapshot) {
        for (const key of Object.keys(base.session)) delete base.session[key];
        Object.assign(base.session, snapshot);
    }

    function snapshotEnvelope(session) {
        return {
            schemaVersion: "v10-runner-snapshot/1.0",
            packId,
            ...(godTrialRuntimeEnabled ? { runtimeSemantics: V10_GOD_TRIAL_SEMANTICS } : {}),
            ...(packId === "douluo2" ? { contentIdentity: sourcePack.routeGraph.pack.contentIdentity } : {}),
            route, seed, session
        };
    }

    function commitBaseStep(onCheckpoint = null) {
        const snapshot = structuredClone(base.session);
        const committed = base.step();
        if (allowPost150 && committed.committed) {
            const character = base.session.character;
            character.flags[V10_LIFESPAN_PEAK_LEVEL] = Math.max(
                Number(character.flags[V10_LIFESPAN_PEAK_LEVEL]) || 0,
                Number(character.level) || 0
            );
        }
        const result = normalize(committed);
        if (phase === "boundary" || phase === "error") restoreSession(snapshot);
        // The rollback copy is detached on success. Publish it only after full commit;
        // failed steps restore it privately and leave the prior UI undo opportunity intact.
        else if (result.committed && onCheckpoint) onCheckpoint(snapshotEnvelope(snapshot));
        return result;
    }

    function commitOne(onCheckpoint) {
        if (["completed", "boundary", "error"].includes(phase)) {
            return blockedResult(phase, error, summary);
        }
        return commitBaseStep(onCheckpoint);
    }

    async function advanceUntil(stop, {
        maxSteps,
        onStep = null,
        onCheckpoint = null,
        shouldStop = null,
        yieldStep = () => Promise.resolve()
    }) {
        if (phase !== "ready" || busy) {
            return blockedResult(phase, error, summary, busy ? "busy" : phase);
        }
        if (!Number.isInteger(maxSteps) || maxSteps < 1) {
            throw Object.assign(new Error("maxSteps must be a positive integer."), {
                code: "V10_HUMAN_STEP_LIMIT_INVALID"
            });
        }
        busy = true;
        phase = "advancing";
        try {
            for (let step = 1; step <= maxSteps; step += 1) {
                // Stop between transactions, before consuming the next random input.
                if (shouldStop?.()) {
                    phase = "ready";
                    return { status: phase, committed: false, blocked: false, steps: step - 1, reason: "cancelled" };
                }
                const result = commitBaseStep(onCheckpoint);
                if (typeof onStep === "function") await onStep(result, step);
                if (phase === "completed" || phase === "boundary" || phase === "error") {
                    return { ...result, steps: step };
                }
                if (stop()) {
                    phase = "ready";
                    return { ...result, status: phase, steps: step };
                }
                await yieldStep();
            }
            if (allowPost150) {
                phase = "ready";
                return {
                    status: phase,
                    committed: false,
                    blocked: false,
                    steps: maxSteps,
                    reason: "batch-limit"
                };
            }
            phase = "boundary";
            error = {
                code: "V10_HUMAN_STEP_LIMIT_REACHED",
                message: "连续推进达到安全上限，最后一次成功提交保持不变。",
                details: { maxSteps, age: base.session.character?.age ?? null }
            };
            return {
                status: phase,
                committed: false,
                blocked: false,
                steps: maxSteps,
                error
            };
        } finally {
            busy = false;
        }
    }

    return Object.freeze({
        get phase() { return phase; },
        get session() { return base.session; },
        get error() { return error; },
        get summary() { return summary; },
        get seed() { return base.seed; },
        get lastResult() { return lastResult; },
        get lastWheelResult() { return base.lastWheelResult; },
        get wheelView() {
            if (!godTrialRuntimeEnabled || phase !== 'ready'
                || !base.session.currentFlowId?.startsWith('humanGodTrialReward:二级:')) return base.wheelView;
            const resolved = resolveV05StaticPool({ contentIndex, session: base.session });
            const selection = selectApkPoolOptions(contentIndex, base.session.character, resolved.poolId, {
                requirementEvaluator: handlers.requirementEvaluator
            });
            const segments = createV05WheelSegments(selection.options);
            const last = base.session.history.at(-1);
            const recentResult = last ? { optionId: last.optionId, text: last.text } : null;
            return Object.freeze({ version: 'v05-wheel-view/1', status: 'ready',
                title: selection.pool.normalized.pool_name, flowId: resolved.flowId, poolId: resolved.poolId,
                segments, totalWeight: segments.reduce((total, item) => total + item.weight, 0),
                unresolvedRequirements: selection.unresolved, recentResult,
                selectedOptionId: segments.some(item => item.optionId === recentResult?.optionId) ? recentResult.optionId : null });
        },
        get combatPower() {
            try {
                // Reuse the same calculators as runtime combat requirements.
                const total = packId === "douluo2"
                    ? sourcePack.engine.C.total(base.session.character)
                    : calculateApkCombatPower(base.session.character, contentIndex.combatPowerEvidence).total;
                if (!Number.isFinite(total)) throw new Error("战力结果不是有限数值。");
                return { status: "ready", total };
            } catch (error) {
                return { status: "unavailable", total: null, code: error.code ?? "V10_COMBAT_POWER_UNAVAILABLE", message: error.message };
            }
        },
        get characterProfile() {
            return Object.freeze({
                ...base.characterProfile,
                route: base.session.character?.route,
                beastYears: base.session.character?.beastYears ?? 0,
                species: base.session.character?.beast?.species?.text ?? null,
                stage: base.session.currentFlowId,
                ending: structuredClone(base.session.character?.ending ?? null),
                boundary: phase === "completed"
                    ? "source terminal（完整提交后锁定）"
                    : phase === "boundary"
                        ? "typed boundary（失败项未提交）"
                        : null
            });
        },
        step({ onCheckpoint = null } = {}) {
            if (busy) return blockedResult(phase, error, summary, "busy");
            return commitOne(onCheckpoint);
        },
        advanceToNextAge(options = {}) {
            const progressKey = base.session.character?.route === "beast"
                ? "beastYears"
                : "age";
            const start = base.session.character?.[progressKey];
            return advanceUntil(
                () => base.session.character?.[progressKey] !== start,
                { maxSteps: 100, ...options }
            );
        },
        runToTerminal(options = {}) {
            return advanceUntil(
                () => false,
                {
                    maxSteps: route === "beast"
                        ? V10_BEAST_MAX_STEPS
                        : allowPost150 ? 200 : V10_HUMAN_MAX_STEPS,
                    ...options
                }
            );
        },
        exportSnapshot() {
            return structuredClone(snapshotEnvelope(base.session));
        }
    });
}
