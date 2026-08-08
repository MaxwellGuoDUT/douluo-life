import {
    ROUTE_STATE_BUCKETS,
    clonePlayerStateValue
} from "./player-v2.js";

export const ROUTE_LANES = Object.freeze([
    "main",
    "faction",
    "npc",
    "deity",
    "personal",
    "temporary"
]);

export const ROUTE_CONFLICT_POLICIES = Object.freeze([
    "block",
    "replace",
    "branch"
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
    throw new RouteStateError(code, message, details);
}

function assertAge(age, field = "age") {
    if (!Number.isInteger(age) || age < 0) {
        fail(
            "INVALID_ROUTE_AGE",
            `${field} must be a non-negative integer.`,
            {
                field
            }
        );
    }
}

function assertVisitCounts(visitCounts) {
    if (!isPlainObject(visitCounts)) {
        fail(
            "INVALID_ROUTE_VISIT_COUNTS",
            "visitCounts must be a plain object."
        );
    }

    Object.entries(visitCounts).forEach(([nodeId, count]) => {
        if (!isNonEmptyString(nodeId)
            || !Number.isInteger(count)
            || count < 0) {
            fail(
                "INVALID_ROUTE_VISIT_COUNT",
                "Route visit counts require non-empty node IDs and non-negative integers.",
                {
                    nodeId,
                    count
                }
            );
        }
    });
}

function assertRouteStateEntry(routeState, bucket) {
    if (!isPlainObject(routeState)) {
        fail(
            "INVALID_ROUTE_STATE",
            `routeStates.${bucket} entries must be plain objects.`
        );
    }

    if (!isNonEmptyString(routeState.routeId)) {
        fail(
            "INVALID_ROUTE_ID",
            "Route state routeId must be a non-empty string."
        );
    }

    if (!ROUTE_LANES.includes(routeState.lane)) {
        fail(
            "INVALID_ROUTE_LANE",
            `Unsupported route lane "${String(routeState.lane)}".`
        );
    }

    if (!isNonEmptyString(routeState.nodeId)) {
        fail(
            "INVALID_ROUTE_NODE_ID",
            "Route state nodeId must be a non-empty string."
        );
    }

    assertAge(routeState.startedAge, "startedAge");
    assertAge(routeState.lastAdvancedAge, "lastAdvancedAge");

    if (routeState.lastAdvancedAge < routeState.startedAge) {
        fail(
            "ROUTE_AGE_REGRESSION",
            "lastAdvancedAge must not precede startedAge."
        );
    }

    if (routeState.status !== bucket) {
        fail(
            "ROUTE_STATUS_BUCKET_MISMATCH",
            `Route status must be "${bucket}" in routeStates.${bucket}.`
        );
    }

    if (!isPlainObject(routeState.data)
        || !isPlainObject(routeState.flags)) {
        fail(
            "INVALID_ROUTE_STATE_METADATA",
            "Route data and flags must be plain objects."
        );
    }

    assertVisitCounts(routeState.visitCounts);
}

function assertRouteStates(routeStates) {
    if (!isPlainObject(routeStates)) {
        fail(
            "INVALID_ROUTE_STATES",
            "routeStates must be a plain object."
        );
    }

    Object.keys(routeStates)
        .filter(bucket => !ROUTE_STATE_BUCKETS.includes(bucket))
        .forEach(bucket => {
            fail(
                "UNKNOWN_ROUTE_STATE_BUCKET",
                `Unknown route state bucket "${bucket}".`
            );
        });

    const routeIds = new Set();
    let activeMainCount = 0;

    ROUTE_STATE_BUCKETS.forEach(bucket => {
        if (!Array.isArray(routeStates[bucket])) {
            fail(
                "INVALID_ROUTE_STATE_BUCKET",
                `routeStates.${bucket} must be an array.`
            );
        }

        routeStates[bucket].forEach(routeState => {
            assertRouteStateEntry(routeState, bucket);

            if (routeIds.has(routeState.routeId)) {
                fail(
                    "DUPLICATE_ROUTE_ID",
                    `Route "${routeState.routeId}" occurs more than once.`
                );
            }

            routeIds.add(routeState.routeId);

            if (bucket === "active" && routeState.lane === "main") {
                activeMainCount += 1;
            }
        });
    });

    if (activeMainCount > 1) {
        fail(
            "MULTIPLE_ACTIVE_MAIN_ROUTES",
            "Only one main route may be active."
        );
    }
}

function assertRouteDefinition(routeDefinition) {
    if (!isPlainObject(routeDefinition)) {
        fail(
            "INVALID_ROUTE_DEFINITION",
            "Route definition must be a plain object."
        );
    }

    if (!isNonEmptyString(routeDefinition.id)) {
        fail(
            "INVALID_ROUTE_ID",
            "Route definition id must be a non-empty string."
        );
    }

    if (!ROUTE_LANES.includes(routeDefinition.lane)) {
        fail(
            "INVALID_ROUTE_LANE",
            `Unsupported route lane "${String(routeDefinition.lane)}".`
        );
    }

    if (!isPlainObject(routeDefinition.entry)
        || !isNonEmptyString(routeDefinition.entry.flowId)
        || !isNonEmptyString(routeDefinition.entry.nodeId)) {
        fail(
            "INVALID_ROUTE_ENTRY",
            "Route entry requires flowId and nodeId."
        );
    }

    if (!Array.isArray(routeDefinition.mutexGroups)
        || routeDefinition.mutexGroups.some(group => {
            return !isNonEmptyString(group);
        })) {
        fail(
            "INVALID_ROUTE_MUTEX_GROUPS",
            "Route mutexGroups must be an array of non-empty strings."
        );
    }

    const conflictPolicy = routeDefinition.conflictPolicy ?? "block";

    if (!ROUTE_CONFLICT_POLICIES.includes(conflictPolicy)) {
        fail(
            "INVALID_ROUTE_CONFLICT_POLICY",
            `Unsupported route conflictPolicy "${String(conflictPolicy)}".`
        );
    }

    return conflictPolicy;
}

function resolveRouteDefinition(routeDefinitionsById, routeId) {
    if (routeDefinitionsById instanceof Map) {
        return routeDefinitionsById.get(routeId);
    }

    if (isPlainObject(routeDefinitionsById)) {
        return routeDefinitionsById[routeId];
    }

    fail(
        "INVALID_ROUTE_DEFINITION_REGISTRY",
        "routeDefinitionsById must be a Map or plain object."
    );
}

function createDecision({
    allowed,
    code = null,
    conflicts = [],
    requiredHandler = null,
    policy
}) {
    return {
        allowed,
        code,
        conflicts: clonePlayerStateValue(conflicts),
        requiredHandler,
        policy
    };
}

function findRoute(routeStates, routeId) {
    for (const bucket of ROUTE_STATE_BUCKETS) {
        const index = routeStates[bucket].findIndex(routeState => {
            return routeState.routeId === routeId;
        });

        if (index >= 0) {
            return {
                bucket,
                index,
                routeState: routeStates[bucket][index]
            };
        }
    }

    return null;
}

function assertTransitionAge(routeState, age) {
    assertAge(age);

    if (age < routeState.lastAdvancedAge) {
        fail(
            "ROUTE_AGE_REGRESSION",
            "Route state cannot move backwards in age.",
            {
                routeId: routeState.routeId,
                lastAdvancedAge: routeState.lastAdvancedAge,
                requestedAge: age
            }
        );
    }
}

function cloneTransitionResult(routeStates, routeState) {
    return {
        routeStates,
        routeState: clonePlayerStateValue(routeState)
    };
}

function moveActiveRoute(
    routeStates,
    routeId,
    targetBucket,
    {
        age
    }
) {
    assertRouteStates(routeStates);

    if (!isNonEmptyString(routeId)) {
        fail(
            "INVALID_ROUTE_ID",
            "routeId must be a non-empty string."
        );
    }

    const found = findRoute(routeStates, routeId);

    if (!found || found.bucket !== "active") {
        fail(
            "ACTIVE_ROUTE_NOT_FOUND",
            `Route "${routeId}" is not active.`,
            {
                routeId,
                currentBucket: found?.bucket ?? null
            }
        );
    }

    assertTransitionAge(found.routeState, age);

    const nextRouteStates = clonePlayerStateValue(routeStates);
    const [routeState] = nextRouteStates.active.splice(found.index, 1);

    routeState.status = targetBucket;
    routeState.lastAdvancedAge = age;
    nextRouteStates[targetBucket].push(routeState);

    return cloneTransitionResult(nextRouteStates, routeState);
}

export class RouteStateError extends Error {
    constructor(code, message, details = {}) {
        super(message);
        this.name = "RouteStateError";
        this.code = code;
        this.details = details;
    }
}

export function createRouteState({
    routeId,
    lane,
    nodeId,
    age,
    data = {},
    flags = {},
    visitCounts = {}
} = {}) {
    if (!isNonEmptyString(routeId)) {
        fail(
            "INVALID_ROUTE_ID",
            "routeId must be a non-empty string."
        );
    }

    if (!ROUTE_LANES.includes(lane)) {
        fail(
            "INVALID_ROUTE_LANE",
            `Unsupported route lane "${String(lane)}".`
        );
    }

    if (!isNonEmptyString(nodeId)) {
        fail(
            "INVALID_ROUTE_NODE_ID",
            "nodeId must be a non-empty string."
        );
    }

    assertAge(age);

    if (!isPlainObject(data) || !isPlainObject(flags)) {
        fail(
            "INVALID_ROUTE_STATE_METADATA",
            "Route data and flags must be plain objects."
        );
    }

    assertVisitCounts(visitCounts);

    return {
        routeId,
        lane,
        nodeId,
        startedAge: age,
        lastAdvancedAge: age,
        status: "active",
        data: clonePlayerStateValue(data),
        flags: clonePlayerStateValue(flags),
        visitCounts: clonePlayerStateValue(visitCounts)
    };
}

export function canEnterRoute(
    routeStates,
    routeDefinition,
    {
        routeDefinitionsById = {}
    } = {}
) {
    assertRouteStates(routeStates);
    const policy = assertRouteDefinition(routeDefinition);
    const existing = findRoute(routeStates, routeDefinition.id);

    if (existing) {
        return createDecision({
            allowed: false,
            code: "ROUTE_ALREADY_PRESENT",
            conflicts: [
                {
                    routeId: routeDefinition.id,
                    bucket: existing.bucket
                }
            ],
            policy
        });
    }

    const conflicts = [];
    let hasMainConflict = false;
    let hasMutexConflict = false;
    const newMutexGroups = new Set(routeDefinition.mutexGroups);

    for (const activeRoute of routeStates.active) {
        const activeDefinition = resolveRouteDefinition(
            routeDefinitionsById,
            activeRoute.routeId
        );

        if (!activeDefinition) {
            return createDecision({
                allowed: false,
                code: "MISSING_ACTIVE_ROUTE_DEFINITION",
                conflicts: [
                    {
                        routeId: activeRoute.routeId
                    }
                ],
                policy
            });
        }

        assertRouteDefinition(activeDefinition);

        if (activeDefinition.id !== activeRoute.routeId
            || activeDefinition.lane !== activeRoute.lane) {
            fail(
                "ACTIVE_ROUTE_DEFINITION_MISMATCH",
                `Active route "${activeRoute.routeId}" does not match its registered definition.`,
                {
                    routeId: activeRoute.routeId,
                    stateLane: activeRoute.lane,
                    definitionId: activeDefinition.id,
                    definitionLane: activeDefinition.lane
                }
            );
        }

        const mainConflict = routeDefinition.lane === "main"
            && activeRoute.lane === "main";
        const sharedMutexGroups = activeDefinition.mutexGroups.filter(
            group => newMutexGroups.has(group)
        );

        if (!mainConflict && sharedMutexGroups.length === 0) {
            continue;
        }

        hasMainConflict ||= mainConflict;
        hasMutexConflict ||= sharedMutexGroups.length > 0;
        conflicts.push({
            routeId: activeRoute.routeId,
            main: mainConflict,
            mutexGroups: sharedMutexGroups
        });
    }

    if (conflicts.length === 0) {
        return createDecision({
            allowed: true,
            policy
        });
    }

    if (policy === "replace" || policy === "branch") {
        return createDecision({
            allowed: false,
            code: "ROUTE_CONFLICT_HANDLER_REQUIRED",
            conflicts,
            requiredHandler: policy,
            policy
        });
    }

    return createDecision({
        allowed: false,
        code: hasMainConflict
            ? "MAIN_ROUTE_CONFLICT"
            : hasMutexConflict
                ? "ROUTE_MUTEX_CONFLICT"
                : "ROUTE_CONFLICT",
        conflicts,
        policy
    });
}

export function enterRoute(
    routeStates,
    routeDefinition,
    {
        age,
        routeDefinitionsById = {}
    } = {}
) {
    assertAge(age);
    const decision = canEnterRoute(
        routeStates,
        routeDefinition,
        {
            routeDefinitionsById
        }
    );

    if (!decision.allowed) {
        fail(
            decision.code,
            `Route "${String(routeDefinition?.id)}" cannot be entered.`,
            {
                decision
            }
        );
    }

    const nextRouteStates = clonePlayerStateValue(routeStates);
    const routeState = createRouteState({
        routeId: routeDefinition.id,
        lane: routeDefinition.lane,
        nodeId: routeDefinition.entry.nodeId,
        age
    });

    nextRouteStates.active.push(routeState);

    return cloneTransitionResult(nextRouteStates, routeState);
}

export function advanceRoute(
    routeStates,
    routeId,
    {
        expectedNodeId,
        nextNodeId,
        age
    } = {}
) {
    assertRouteStates(routeStates);

    if (!isNonEmptyString(routeId)
        || !isNonEmptyString(expectedNodeId)
        || !isNonEmptyString(nextNodeId)) {
        fail(
            "INVALID_ROUTE_ADVANCE",
            "advanceRoute requires routeId, expectedNodeId, and nextNodeId."
        );
    }

    const found = findRoute(routeStates, routeId);

    if (!found || found.bucket !== "active") {
        fail(
            "ACTIVE_ROUTE_NOT_FOUND",
            `Route "${routeId}" is not active.`
        );
    }

    if (found.routeState.nodeId !== expectedNodeId) {
        fail(
            "STALE_ROUTE_NODE",
            `Route "${routeId}" is no longer at "${expectedNodeId}".`,
            {
                actualNodeId: found.routeState.nodeId,
                expectedNodeId
            }
        );
    }

    assertTransitionAge(found.routeState, age);

    const nextRouteStates = clonePlayerStateValue(routeStates);
    const routeState = nextRouteStates.active[found.index];

    routeState.visitCounts[expectedNodeId] = (
        routeState.visitCounts[expectedNodeId] ?? 0
    ) + 1;
    routeState.nodeId = nextNodeId;
    routeState.lastAdvancedAge = age;

    return cloneTransitionResult(nextRouteStates, routeState);
}

export function completeRoute(routeStates, routeId, options) {
    return moveActiveRoute(
        routeStates,
        routeId,
        "completed",
        options
    );
}

export function failRoute(routeStates, routeId, options) {
    return moveActiveRoute(
        routeStates,
        routeId,
        "failed",
        options
    );
}

export function blockRoute(routeStates, routeId, options) {
    return moveActiveRoute(
        routeStates,
        routeId,
        "blocked",
        options
    );
}
