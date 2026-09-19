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
import { applyApkEffects } from "./apk-rule-runtime.js";

const V10_HUMAN_MAX_STEPS = 2000;
const V10_BEAST_MAX_STEPS = 25000;
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

function sourceRuntimeHandlers(contentIndex, sourcePack) {
    const builtIn = createApkRouteDynamicHandlers({ contentIndex });
    const game = sourcePack?.game;
    if (!game) return builtIn;
    const isDouluo2 = sourcePack.manifest?.id === "douluo2";
    const contract = sourcePack.routeGraph?.pack?.runtimeContract;
    if (isDouluo2 && (!contract || typeof sourcePack.engine?.a !== "function" || typeof sourcePack.engine?.l !== "function")) {
        throw Object.assign(new Error("斗罗二缺少权威效果与条件执行器。"), { code: "V10_SOURCE_ENGINE_MISSING" });
    }
    const projectCharacter = character => Object.fromEntries(SOURCE_CHARACTER_FIELDS
        .filter(field => field in character)
        .map(field => [field, structuredClone(character[field])]));
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
        context.session.character = sourceCharacter;
        context.session.currentStepId = context.flow?.source?.id ?? context.flow?.id;
        const value = handler({
            pack: game,
            state: context.session,
            step: context.flow?.source ?? context.flow,
            option: context.routeOption?.source ?? context.routeOption ?? null,
            ...extra
        });
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
            : createApkRouteRequirementEvaluator({ contentIndex }),
        dynamicAction: context => dynamicTransition("action", context),
        dynamicResolver: context => dynamicTransition("resolver", context),
        dynamicOption(context) {
            let aggregate = null;
            const applyEffects = effects => {
                const result = effectApplier(context.session.character, effects, {
                    reason: "v10-source-custom-handler",
                    referenceId: `${context.flowId}:${context.customHandler}`,
                    idempotencyKeyPrefix: `v10-source:${context.session.packId}:${context.session.history.length}:${context.optionId}`
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
    snapshot = null
} = {}) {
    const packId = sourcePack?.manifest?.id ?? "douluo1";
    const runtimeLoaded = withSourceBeastRuntime(loaded, sourcePack, route);
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
        dynamicHandlers: sourceRuntimeHandlers(contentIndex, sourcePack)
    });
    let phase = "ready";
    let error = null;
    let summary = null;
    let busy = false;
    let lastResult = null;

    if (snapshot !== null) {
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

    function commitBaseStep() {
        const snapshot = structuredClone(base.session);
        const result = normalize(base.step());
        if (phase === "boundary" || phase === "error") restoreSession(snapshot);
        return result;
    }

    function commitOne() {
        if (["completed", "boundary", "error"].includes(phase)) {
            return blockedResult(phase, error, summary);
        }
        return commitBaseStep();
    }

    async function advanceUntil(stop, {
        maxSteps,
        onStep = null,
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
                const result = commitBaseStep();
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
        get wheelView() { return base.wheelView; },
        get presentationHistory() { return base.presentationHistory; },
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
        step() {
            if (busy) return blockedResult(phase, error, summary, "busy");
            return commitOne();
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
                        : V10_HUMAN_MAX_STEPS,
                    ...options
                }
            );
        },
        exportSnapshot() {
            return structuredClone({
                schemaVersion: "v10-runner-snapshot/1.0",
                packId: base.session.packId,
                ...(packId === "douluo2" ? { contentIdentity: sourcePack.routeGraph.pack.contentIdentity } : {}),
                route,
                seed,
                session: base.session
            });
        }
    });
}
