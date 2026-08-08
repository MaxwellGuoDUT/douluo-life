import { clonePlayerStateValue } from "./player-v2.js";

export const ANNUAL_SESSION_STATUSES = Object.freeze([
    "running",
    "completed",
    "terminal",
    "stopped"
]);

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
    throw new AnnualSessionError(code, message, details);
}

function assertLimits(limits) {
    if (!isPlainObject(limits)) {
        fail(
            "INVALID_FLOW_LIMITS",
            "Annual session limits must be a plain object."
        );
    }

    [
        "maxSpinsPerYear",
        "maxVisitsPerNode"
    ].forEach(field => {
        if (!Number.isInteger(limits[field]) || limits[field] < 1) {
            fail(
                "INVALID_FLOW_LIMITS",
                `${field} must be a positive integer.`,
                {
                    field
                }
            );
        }
    });
}

function assertNodeKey(nodeKey) {
    const separatorIndex = typeof nodeKey === "string"
        ? nodeKey.indexOf(":")
        : -1;

    if (!isNonEmptyString(nodeKey)
        || separatorIndex <= 0
        || separatorIndex >= nodeKey.length - 1) {
        fail(
            "INVALID_ANNUAL_NODE_KEY",
            "nodeKey must include a flow ID and node ID separated by a colon."
        );
    }
}

function validateSessionShape(session) {
    const errors = [];

    function add(code, message, path) {
        errors.push({
            code,
            message,
            path
        });
    }

    if (!isPlainObject(session)) {
        add(
            "INVALID_ANNUAL_SESSION",
            "AnnualSession must be a plain object.",
            "session"
        );
        return errors;
    }

    if (!isNonEmptyString(session.sessionId)) {
        add(
            "INVALID_ANNUAL_SESSION_ID",
            "sessionId must be a non-empty string.",
            "sessionId"
        );
    }

    if (!Number.isInteger(session.age) || session.age < 0) {
        add(
            "INVALID_ANNUAL_SESSION_AGE",
            "age must be a non-negative integer.",
            "age"
        );
    }

    if (!isNonEmptyString(session.seed)) {
        add(
            "INVALID_ANNUAL_SESSION_SEED",
            "seed must be a non-empty string.",
            "seed"
        );
    }

    if (!ANNUAL_SESSION_STATUSES.includes(session.status)) {
        add(
            "INVALID_ANNUAL_SESSION_STATUS",
            `Unsupported AnnualSession status "${String(session.status)}".`,
            "status"
        );
    }

    if (!Number.isInteger(session.spinCount)
        || session.spinCount < 0) {
        add(
            "INVALID_ANNUAL_SPIN_COUNT",
            "spinCount must be a non-negative integer.",
            "spinCount"
        );
    }

    if (!Array.isArray(session.spins)) {
        add(
            "INVALID_ANNUAL_SPINS",
            "spins must be an array.",
            "spins"
        );
    } else if (session.spinCount !== session.spins.length) {
        add(
            "ANNUAL_SPIN_COUNT_MISMATCH",
            "spinCount must equal spins.length.",
            "spinCount"
        );
    }

    if (!isPlainObject(session.visitedNodes)) {
        add(
            "INVALID_ANNUAL_VISITED_NODES",
            "visitedNodes must be a plain object.",
            "visitedNodes"
        );
    } else {
        Object.entries(session.visitedNodes)
            .forEach(([nodeKey, count]) => {
                if (!isNonEmptyString(nodeKey)
                    || !Number.isInteger(count)
                    || count < 0) {
                    add(
                        "INVALID_ANNUAL_VISIT_COUNT",
                        "visitedNodes values must be non-negative integers.",
                        `visitedNodes.${nodeKey}`
                    );
                }
            });
    }

    if (!isPlainObject(session.annualFlags)) {
        add(
            "INVALID_ANNUAL_FLAGS",
            "annualFlags must be a plain object.",
            "annualFlags"
        );
    }

    if (!Array.isArray(session.warnings)) {
        add(
            "INVALID_ANNUAL_WARNINGS",
            "warnings must be an array.",
            "warnings"
        );
    }

    return errors;
}

export class AnnualSessionError extends Error {
    constructor(code, message, details = {}) {
        super(message);
        this.name = "AnnualSessionError";
        this.code = code;
        this.details = details;
    }
}

export function createAnnualSession({
    sessionId,
    age,
    seed,
    annualFlags = {}
} = {}) {
    if (!isNonEmptyString(sessionId)) {
        fail(
            "INVALID_ANNUAL_SESSION_ID",
            "sessionId must be a non-empty string."
        );
    }

    if (!Number.isInteger(age) || age < 0) {
        fail(
            "INVALID_ANNUAL_SESSION_AGE",
            "age must be a non-negative integer."
        );
    }

    if (!isNonEmptyString(seed)) {
        fail(
            "INVALID_ANNUAL_SESSION_SEED",
            "seed must be a non-empty string."
        );
    }

    if (!isPlainObject(annualFlags)) {
        fail(
            "INVALID_ANNUAL_FLAGS",
            "annualFlags must be a plain object."
        );
    }

    return {
        sessionId,
        age,
        seed,
        status: "running",
        spinCount: 0,
        visitedNodes: {},
        annualFlags: clonePlayerStateValue(annualFlags),
        spins: [],
        warnings: [],
        result: null
    };
}

export function validateAnnualSession(session) {
    const errors = validateSessionShape(session);

    return {
        valid: errors.length === 0,
        errors
    };
}

export function assertValidAnnualSession(session) {
    const validation = validateAnnualSession(session);

    if (!validation.valid) {
        fail(
            "INVALID_ANNUAL_SESSION",
            "AnnualSession failed validation.",
            {
                errors: validation.errors
            }
        );
    }

    return validation;
}

export function assertCanExecuteNode(
    session,
    nodeKey,
    {
        willSpin = false
    } = {},
    limits
) {
    assertValidAnnualSession(session);
    assertLimits(limits);
    assertNodeKey(nodeKey);

    if (session.status !== "running") {
        fail(
            "SESSION_NOT_RUNNING",
            `AnnualSession is "${session.status}", not running.`
        );
    }

    const visits = session.visitedNodes[nodeKey] ?? 0;

    if (visits >= limits.maxVisitsPerNode) {
        fail(
            "MAX_VISITS_PER_NODE_EXCEEDED",
            `Node "${nodeKey}" reached maxVisitsPerNode.`,
            {
                nodeKey,
                visits,
                limit: limits.maxVisitsPerNode
            }
        );
    }

    if (willSpin && session.spinCount >= limits.maxSpinsPerYear) {
        fail(
            "MAX_SPINS_PER_YEAR_EXCEEDED",
            "AnnualSession reached maxSpinsPerYear.",
            {
                spinCount: session.spinCount,
                limit: limits.maxSpinsPerYear
            }
        );
    }

    return true;
}

export function commitAnnualStep(
    session,
    {
        nodeKey,
        spin = null,
        warnings = [],
        status,
        result
    } = {},
    limits
) {
    const willSpin = spin !== null;

    if (willSpin && !isPlainObject(spin)) {
        fail(
            "INVALID_ANNUAL_SPIN",
            "spin must be a plain object or null."
        );
    }

    if (!Array.isArray(warnings)) {
        fail(
            "INVALID_ANNUAL_WARNINGS",
            "Step warnings must be an array."
        );
    }

    if (status !== undefined
        && !ANNUAL_SESSION_STATUSES.includes(status)) {
        fail(
            "INVALID_ANNUAL_SESSION_STATUS",
            `Unsupported AnnualSession status "${String(status)}".`
        );
    }

    assertCanExecuteNode(
        session,
        nodeKey,
        {
            willSpin
        },
        limits
    );

    const nextSession = clonePlayerStateValue(session);

    nextSession.visitedNodes[nodeKey] = (
        nextSession.visitedNodes[nodeKey] ?? 0
    ) + 1;

    if (willSpin) {
        nextSession.spins.push(clonePlayerStateValue(spin));
        nextSession.spinCount += 1;
    }

    nextSession.warnings.push(...clonePlayerStateValue(warnings));

    if (status !== undefined) {
        nextSession.status = status;
    }

    if (Object.prototype.hasOwnProperty.call(
        arguments[1] ?? {},
        "result"
    )) {
        nextSession.result = clonePlayerStateValue(result);
    }

    return nextSession;
}
