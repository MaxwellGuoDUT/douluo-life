import {
    assertValidAnnualSession,
    createAnnualSession
} from "./annual-session.js";
import { CombatPowerCalculator } from "./combat-power.js";
import {
    assertValidPlayerV2,
    clonePlayerStateValue
} from "./player-v2.js";
import {
    DEFAULT_WHEEL_FLOW_LIMITS,
    runFlow
} from "./wheel-flow-engine.js";

function isPlainObject(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return false;
    }

    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
}

function isNonEmptyString(value) {
    return typeof value === "string" && value.length > 0;
}

function fail(code, message, details = {}) {
    throw new V2SessionRunnerError(code, message, details);
}

function defaultSessionId(age) {
    return `v2_year_${String(age).padStart(3, "0")}`;
}

function assertInputs({ player, flow, wheelsById, rng, limits }) {
    try {
        assertValidPlayerV2(player);
    } catch (error) {
        fail("INVALID_PLAYER_V2", "V2SessionRunner requires a valid Player v2.", {
            cause: error instanceof Error ? error.message : String(error),
            errors: error?.errors ?? []
        });
    }

    if (!isPlainObject(flow)
        || !isNonEmptyString(flow.id)
        || !Array.isArray(flow.nodes)) {
        fail("INVALID_FLOW", "V2SessionRunner requires a valid flow.");
    }

    if (!(wheelsById instanceof Map)
        && !Array.isArray(wheelsById)
        && !isPlainObject(wheelsById)) {
        fail("INVALID_WHEEL_REGISTRY", "V2SessionRunner requires wheel data.");
    }

    if (typeof rng !== "function") {
        fail("INVALID_RNG", "rng must be a function.");
    }

    if (!isPlainObject(limits)) {
        fail("INVALID_FLOW_LIMITS", "limits must be a plain object.");
    }
}

function assertNotCommitted(player, sessionId) {
    if (player.history.some(record => {
        return record?.kind === "annual_session"
            && record.sessionId === sessionId;
    })) {
        fail(
            "ANNUAL_SESSION_ALREADY_COMMITTED",
            `AnnualSession "${sessionId}" has already been committed.`,
            { sessionId }
        );
    }
}

function resolveSession({
    player,
    session,
    sessionId,
    seed,
    annualFlags
}) {
    if (session !== undefined) {
        try {
            assertValidAnnualSession(session);
        } catch (error) {
            fail("INVALID_ANNUAL_SESSION", "AnnualSession is invalid.", {
                cause: error instanceof Error ? error.message : String(error),
                errors: error?.details?.errors ?? []
            });
        }

        if (session.status !== "running") {
            fail("SESSION_NOT_RUNNING", `AnnualSession is "${session.status}".`);
        }

        if (session.age !== player.age) {
            fail("SESSION_AGE_MISMATCH", "Player age must match AnnualSession age.", {
                playerAge: player.age,
                sessionAge: session.age
            });
        }

        if (sessionId !== undefined && sessionId !== session.sessionId) {
            fail("SESSION_ID_MISMATCH", "sessionId does not match the supplied session.");
        }

        return clonePlayerStateValue(session);
    }

    const resolvedSessionId = sessionId ?? defaultSessionId(player.age);
    const resolvedSeed = seed ?? `${resolvedSessionId}_seed`;

    if (!isNonEmptyString(resolvedSessionId)) {
        fail("INVALID_ANNUAL_SESSION_ID", "sessionId must be a non-empty string.");
    }

    if (!isNonEmptyString(resolvedSeed)) {
        fail("INVALID_ANNUAL_SESSION_SEED", "seed must be a non-empty string.");
    }

    return createAnnualSession({
        sessionId: resolvedSessionId,
        age: player.age,
        seed: resolvedSeed,
        annualFlags: annualFlags ?? player.annualFlags
    });
}

function createAnnualRecord({ session, flow, fromAge, toAge, advance }) {
    return {
        kind: "annual_session",
        sessionId: session.sessionId,
        age: fromAge,
        nextAge: toAge,
        seed: session.seed,
        flowId: flow.id,
        status: session.status,
        advance,
        spinCount: session.spinCount,
        spins: clonePlayerStateValue(session.spins),
        warnings: clonePlayerStateValue(session.warnings),
        result: clonePlayerStateValue(session.result)
    };
}

export class V2SessionRunnerError extends Error {
    constructor(code, message, details = {}) {
        super(message);
        this.name = "V2SessionRunnerError";
        this.code = code;
        this.details = details;
    }
}

export function runV2AnnualSession({
    player,
    flow,
    wheelsById,
    session,
    sessionId,
    seed,
    annualFlags,
    rng = Math.random,
    limits = DEFAULT_WHEEL_FLOW_LIMITS,
    startNodeId,
    triggerMatcher,
    allowedCanonLevels,
    combatPowerRules
} = {}) {
    assertInputs({ player, flow, wheelsById, rng, limits });

    const inputPlayer = clonePlayerStateValue(player);
    const currentSession = resolveSession({
        player: inputPlayer,
        session,
        sessionId,
        seed,
        annualFlags
    });

    assertNotCommitted(inputPlayer, currentSession.sessionId);

    const flowResult = runFlow({
        player: inputPlayer,
        session: currentSession,
        flow,
        startNodeId,
        wheelsById,
        rng,
        limits,
        ...(triggerMatcher ? { triggerMatcher } : {}),
        ...(allowedCanonLevels ? { allowedCanonLevels } : {})
    });

    const advance = flowResult.result?.advance;

    if (!["end", "next_year"].includes(advance)) {
        fail("FLOW_DID_NOT_COMPLETE", "Annual flow must end or advance to next_year.");
    }

    const fromAge = inputPlayer.age;
    const toAge = advance === "next_year" ? fromAge + 1 : fromAge;
    const committedPlayer = clonePlayerStateValue(flowResult.player);

    committedPlayer.age = toAge;
    if (advance === "next_year") {
        committedPlayer.annualFlags = {};
    }

    const annualRecord = createAnnualRecord({
        session: flowResult.session,
        flow,
        fromAge,
        toAge,
        advance
    });
    committedPlayer.history.push(annualRecord);

    try {
        assertValidPlayerV2(committedPlayer);
    } catch (error) {
        fail("PLAYER_STATE_INVALID_AFTER_ANNUAL_COMMIT", "Annual commit is invalid.", {
            cause: error instanceof Error ? error.message : String(error),
            errors: error?.errors ?? []
        });
    }

    const combatPower = combatPowerRules
        ? CombatPowerCalculator.calculate(committedPlayer, combatPowerRules)
        : null;
    const warnings = [
        ...clonePlayerStateValue(flowResult.session.warnings),
        ...(combatPower?.warnings
            ? clonePlayerStateValue(combatPower.warnings)
            : [])
    ];

    return {
        player: committedPlayer,
        session: clonePlayerStateValue(flowResult.session),
        flowResult: {
            ...clonePlayerStateValue(flowResult),
            player: clonePlayerStateValue(committedPlayer)
        },
        spins: clonePlayerStateValue(flowResult.session.spins),
        annualRecord,
        combatPower: combatPower ? clonePlayerStateValue(combatPower) : null,
        warnings
    };
}

export class V2SessionRunner {
    constructor({
        flow,
        wheelsById,
        limits = DEFAULT_WHEEL_FLOW_LIMITS,
        triggerMatcher,
        allowedCanonLevels,
        combatPowerRules
    } = {}) {
        this.flow = flow;
        this.wheelsById = wheelsById;
        this.limits = limits;
        this.triggerMatcher = triggerMatcher;
        this.allowedCanonLevels = allowedCanonLevels;
        this.combatPowerRules = combatPowerRules;
    }

    run(options = {}) {
        return runV2AnnualSession({
            ...options,
            flow: options.flow ?? this.flow,
            wheelsById: options.wheelsById ?? this.wheelsById,
            limits: options.limits ?? this.limits,
            triggerMatcher: options.triggerMatcher ?? this.triggerMatcher,
            allowedCanonLevels: options.allowedCanonLevels ?? this.allowedCanonLevels,
            combatPowerRules: options.combatPowerRules ?? this.combatPowerRules
        });
    }
}

export default V2SessionRunner;
