import {
    commitApkRouteOption,
    createApkRouteContentIndex,
    createApkRouteDynamicHandlers,
    createApkRouteSession,
    drawApkRouteStep
} from "./apk-route-runtime.js";

export const V05_PACK_ID = "douluo1";
export const V05_DEFAULT_SEED = "apk-route-demo-seed";
export const V05_ENDPOINT_AGE = 25;
export const V05_DEFAULT_ADVANCE_LIMIT = 50;

function typedError(code, message, details = {}) {
    const error = new Error(message);
    error.code = code;
    error.details = details;
    return error;
}

function errorRecord(error) {
    return {
        code: error?.code ?? "UNEXPECTED_ERROR",
        message: error?.message ?? String(error),
        details: error?.details ?? {}
    };
}

function isTypedBoundary(error) {
    return typeof error?.code === "string" && error.code.length > 0;
}

function endpointSummary(session, seed) {
    const martialSouls = session.character?.martialSouls ?? [];
    return {
        scope: "V0.5 Demo endpoint; not a complete-life ending",
        packId: session.packId,
        seed,
        age: session.character?.age ?? null,
        level: session.character?.level ?? null,
        copper: session.character?.wallet?.copper ?? 0,
        route: session.character?.route ?? null,
        cursor: session.random?.cursor ?? null,
        history: session.history?.length ?? 0,
        martialSouls: martialSouls.map(soul => ({
            id: soul.id,
            name: soul.name,
            category: soul.category,
            ringCount: soul.rings?.length ?? 0,
            rings: (soul.rings ?? []).map(ring => ({
                years: ring.years,
                name: ring.name,
                type: ring.typeSelection?.text ?? null,
                species: ring.speciesSelection?.text ?? null
            }))
        }))
    };
}

function blockedResult(state, reason = state.phase) {
    return {
        status: state.phase,
        committed: false,
        blocked: true,
        reason,
        error: state.error,
        summary: state.summary
    };
}

export function createV05ContentIndex(loaded) {
    if (!loaded?.routeGraph) {
        throw typedError(
            "V05_ROUTE_GRAPH_MISSING",
            "V0.5 requires the loaded douluo1 route graph shard."
        );
    }
    const packs = loaded.routeGraph.packs ?? [];
    if (packs.length !== 1 || packs[0]?.id !== V05_PACK_ID) {
        throw typedError(
            "V05_ROUTE_PACK_MISMATCH",
            `V0.5 only accepts the ${V05_PACK_ID} route shard.`,
            { packIds: packs.map(pack => pack?.id ?? null) }
        );
    }
    return createApkRouteContentIndex({
        routeGraph: loaded.routeGraph,
        formalSpecialResultEvidence: loaded.formalSpecialResultEvidence,
        humanSoulRingEvidence: loaded.humanSoulRingEvidence,
        humanSoulRingSpeciesEvidence: loaded.humanSoulRingSpeciesEvidence,
        combatPowerEvidence: loaded.combatPowerEvidence,
        packId: V05_PACK_ID
    });
}

export function createV05DemoRunner({
    contentIndex,
    routeGraph,
    seed = V05_DEFAULT_SEED,
    endpointAge = V05_ENDPOINT_AGE
} = {}) {
    if (!contentIndex?.getFlow || !contentIndex?.getRouteOption) {
        throw typedError("V05_CONTENT_INDEX_MISSING", "V0.5 requires a route content index.");
    }
    if (!routeGraph?.packs?.some(pack => pack.id === V05_PACK_ID)) {
        throw typedError("V05_ROUTE_GRAPH_MISSING", "V0.5 requires the douluo1 route graph.");
    }
    if (!Number.isInteger(endpointAge) || endpointAge < 1) {
        throw typedError("V05_ENDPOINT_INVALID", "V0.5 endpointAge must be a positive integer.");
    }

    const dynamicHandlers = createApkRouteDynamicHandlers({ contentIndex });
    const state = {
        phase: "ready",
        session: null,
        lastSpin: null,
        lastCommit: null,
        error: null,
        summary: null,
        seed: null,
        cancelRequested: false
    };

    function initialize(nextSeed) {
        const normalizedSeed = String(nextSeed ?? "").trim();
        if (!normalizedSeed) {
            throw typedError("INVALID_APK_SEED", "seed must not be empty.");
        }
        state.session = createApkRouteSession({
            routeGraph,
            packId: V05_PACK_ID,
            seed: normalizedSeed
        });
        state.seed = normalizedSeed;
        state.phase = "ready";
        state.lastSpin = null;
        state.lastCommit = null;
        state.error = null;
        state.summary = null;
        state.cancelRequested = false;
    }

    function stopAtBoundary(error, phase = "boundary") {
        state.error = errorRecord(error);
        state.phase = phase;
        return {
            status: state.phase,
            committed: false,
            blocked: false,
            spin: state.lastSpin,
            error: state.error
        };
    }

    function commitOne({ advancing = false } = {}) {
        if (state.phase === "completed"
            || state.phase === "boundary"
            || state.phase === "error") {
            return blockedResult(state);
        }
        if (state.phase === "advancing" && !advancing) {
            return blockedResult(state, "busy");
        }
        try {
            const spin = drawApkRouteStep({
                contentIndex,
                session: state.session,
                ...dynamicHandlers
            });
            state.lastSpin = spin;
            if (spin.status === "terminal") {
                return stopAtBoundary(typedError(
                    "V05_ROUTE_TERMINATED_EARLY",
                    "The APK route terminated before the V0.5 age endpoint.",
                    { age: state.session.character?.age ?? null }
                ));
            }
            const committed = commitApkRouteOption({
                contentIndex,
                session: state.session,
                spin,
                ...dynamicHandlers
            });
            state.lastCommit = committed;
            const age = state.session.character?.age;
            if (age === endpointAge) {
                state.phase = "completed";
                state.summary = endpointSummary(state.session, state.seed);
            } else if (age > endpointAge) {
                state.phase = "boundary";
                state.error = errorRecord(typedError(
                    "V05_ENDPOINT_SKIPPED",
                    `A committed APK option advanced past the exact age ${endpointAge} endpoint.`,
                    { age, endpointAge, optionId: spin.optionId }
                ));
            } else if (!advancing) {
                state.phase = "ready";
            }
            return {
                status: state.phase,
                committed: true,
                blocked: false,
                spin,
                commit: committed,
                error: state.error,
                summary: state.summary
            };
        } catch (error) {
            return stopAtBoundary(error, isTypedBoundary(error) ? "boundary" : "error");
        }
    }

    initialize(seed);

    return Object.freeze({
        get phase() {
            return state.phase;
        },
        get session() {
            return state.session;
        },
        get lastSpin() {
            return state.lastSpin;
        },
        get lastCommit() {
            return state.lastCommit;
        },
        get error() {
            return state.error;
        },
        get summary() {
            return state.summary;
        },
        step() {
            return commitOne();
        },
        cancelAdvance() {
            state.cancelRequested = true;
        },
        reset({ seed: nextSeed = V05_DEFAULT_SEED } = {}) {
            if (state.phase === "advancing") return false;
            initialize(nextSeed);
            return true;
        },
        async advanceToNextAge({
            maxSteps = V05_DEFAULT_ADVANCE_LIMIT,
            onStep = null,
            yieldStep = () => Promise.resolve()
        } = {}) {
            if (state.phase !== "ready") return blockedResult(state);
            if (!Number.isInteger(maxSteps) || maxSteps < 1) {
                return stopAtBoundary(typedError(
                    "V05_ADVANCE_LIMIT_INVALID",
                    "Continuous advance requires a positive integer maxSteps."
                ));
            }
            const startAge = state.session.character?.age;
            state.phase = "advancing";
            state.cancelRequested = false;
            for (let step = 1; step <= maxSteps; step += 1) {
                if (state.cancelRequested) {
                    state.phase = "ready";
                    return { status: "ready", committed: false, cancelled: true, steps: step - 1 };
                }
                const result = commitOne({ advancing: true });
                if (typeof onStep === "function") await onStep(result, step);
                if (!result.committed || state.phase !== "advancing") {
                    return { ...result, steps: step };
                }
                if (state.session.character?.age !== startAge) {
                    state.phase = "ready";
                    return { ...result, status: "ready", steps: step, ageChanged: true };
                }
                await yieldStep();
            }
            return stopAtBoundary(typedError(
                "V05_ADVANCE_LIMIT_REACHED",
                "Continuous advance stopped at its configured safety limit.",
                { maxSteps, age: state.session.character?.age ?? null }
            ));
        }
    });
}

export function createV05DemoRunnerFromLoaded({
    loaded,
    seed = V05_DEFAULT_SEED
} = {}) {
    return createV05DemoRunner({
        contentIndex: createV05ContentIndex(loaded),
        routeGraph: loaded.routeGraph,
        seed
    });
}

export default Object.freeze({
    V05_PACK_ID,
    V05_DEFAULT_SEED,
    V05_ENDPOINT_AGE,
    V05_DEFAULT_ADVANCE_LIMIT,
    createV05ContentIndex,
    createV05DemoRunner,
    createV05DemoRunnerFromLoaded
});
