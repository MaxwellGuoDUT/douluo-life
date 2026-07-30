import {
    EVENT_CANON_LEVELS,
    EVENT_FLOW_OPS,
    validateEventEffectsV2
} from "./event-schema-v2-validator.js";
import {
    assertCanExecuteNode,
    assertValidAnnualSession,
    commitAnnualStep
} from "./annual-session.js";
import {
    assertValidPlayerV2,
    clonePlayerStateValue
} from "./player-v2.js";

export const DEFAULT_WHEEL_FLOW_LIMITS = Object.freeze({
    maxSpinsPerYear: 50,
    maxVisitsPerNode: 5,
    maxRepeatCount: 20,
    maxRouteAdvancesPerAge: 10,
    status: "provisional"
});

const SUPPORTED_FLOW_OPS = new Set([
    "roll",
    "end"
]);

const SUPPORTED_ADVANCES = new Set([
    "same_year",
    "end"
]);

const KNOWN_ADVANCES = new Set([
    "same_year",
    "next_year",
    "end",
    "terminal"
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
    throw new WheelFlowError(code, message, details);
}

function assertRuntimeLimits(limits) {
    if (!isPlainObject(limits)) {
        fail(
            "INVALID_FLOW_LIMITS",
            "WheelFlowEngine limits must be a plain object."
        );
    }

    [
        "maxSpinsPerYear",
        "maxVisitsPerNode",
        "maxRepeatCount",
        "maxRouteAdvancesPerAge"
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

function assertEngineInputs(player, session, flow) {
    assertValidPlayerV2(player);
    assertValidAnnualSession(session);

    if (player.age !== session.age) {
        fail(
            "SESSION_AGE_MISMATCH",
            "Player age must match AnnualSession age.",
            {
                playerAge: player.age,
                sessionAge: session.age
            }
        );
    }

    if (!isPlainObject(flow)
        || !isNonEmptyString(flow.id)
        || !Array.isArray(flow.nodes)) {
        fail(
            "INVALID_FLOW",
            "Flow requires an id and nodes array."
        );
    }
}

function findFlowNode(flow, nodeId) {
    if (!isNonEmptyString(nodeId)) {
        fail(
            "MISSING_FLOW_NODE",
            "nodeId must be a non-empty string."
        );
    }

    const matches = flow.nodes.filter(node => node?.id === nodeId);

    if (matches.length !== 1) {
        fail(
            "MISSING_FLOW_NODE",
            `Flow "${flow.id}" must contain exactly one node "${nodeId}".`,
            {
                flowId: flow.id,
                nodeId,
                matches: matches.length
            }
        );
    }

    return matches[0];
}

function assertSupportedNode(node) {
    if (!isNonEmptyString(node.op)) {
        fail(
            "UNKNOWN_FLOW_OP",
            "Flow node op must be a non-empty string."
        );
    }

    if (SUPPORTED_FLOW_OPS.has(node.op)) {
        return;
    }

    if (EVENT_FLOW_OPS.includes(node.op)) {
        fail(
            "UNSUPPORTED_FLOW_OP",
            `Flow op "${node.op}" is recognized but not implemented by the minimal engine.`,
            {
                op: node.op
            }
        );
    }

    fail(
        "UNKNOWN_FLOW_OP",
        `Unknown flow op "${node.op}".`,
        {
            op: node.op
        }
    );
}

function resolveWheel(wheelsById, wheelId) {
    let wheel;

    if (wheelsById instanceof Map) {
        wheel = wheelsById.get(wheelId);
    } else if (Array.isArray(wheelsById)) {
        const matches = wheelsById.filter(entry => entry?.id === wheelId);

        if (matches.length === 1) {
            [wheel] = matches;
        }
    } else if (isPlainObject(wheelsById)) {
        wheel = wheelsById[wheelId];
    } else {
        fail(
            "INVALID_WHEEL_REGISTRY",
            "wheelsById must be a Map, array, or plain object."
        );
    }

    if (!isPlainObject(wheel)) {
        fail(
            "MISSING_WHEEL",
            `Wheel "${String(wheelId)}" was not found.`,
            {
                wheelId
            }
        );
    }

    return wheel;
}

function matchesNumericCondition(value, condition) {
    if (!Number.isFinite(value) || !isPlainObject(condition)) {
        return false;
    }

    return Object.entries(condition).every(([operation, expected]) => {
        if (!Number.isFinite(expected)) {
            return false;
        }

        if (operation === "gt") {
            return value > expected;
        }

        if (operation === "gte") {
            return value >= expected;
        }

        if (operation === "lt") {
            return value < expected;
        }

        if (operation === "lte") {
            return value <= expected;
        }

        if (operation === "eq") {
            return value === expected;
        }

        return false;
    });
}

function findRouteState(player, routeId) {
    if (!isPlainObject(player.routeStates)) {
        return null;
    }

    for (const bucket of [
        "active",
        "completed",
        "failed",
        "blocked"
    ]) {
        const routeState = player.routeStates[bucket]?.find(entry => {
            return entry?.routeId === routeId;
        });

        if (routeState) {
            return routeState;
        }
    }

    return null;
}

function matchesShallowMap(actual, expected) {
    return isPlainObject(actual)
        && isPlainObject(expected)
        && Object.entries(expected).every(([key, value]) => {
            return actual[key] === value;
        });
}

export function matchesEventTriggerV2(
    trigger,
    {
        player,
        session
    }
) {
    if (!isPlainObject(trigger)) {
        return false;
    }

    return Object.entries(trigger).every(([scope, condition]) => {
        if (scope === "age") {
            return matchesNumericCondition(player.age, condition);
        }

        if (scope === "attributes") {
            return isPlainObject(condition)
                && Object.entries(condition).every(([path, expected]) => {
                    return matchesNumericCondition(
                        player[path],
                        expected
                    );
                });
        }

        if (scope === "state") {
            return matchesShallowMap(player, condition);
        }

        if (scope === "nestedState") {
            return isPlainObject(condition)
                && Object.entries(condition).every(([path, expected]) => {
                    return matchesShallowMap(player[path], expected);
                });
        }

        if (scope === "hasEvent") {
            return Array.isArray(condition)
                && condition.every(eventId => {
                    return player.history.some(record => {
                        return record?.event?.id === eventId
                            || record?.eventId === eventId;
                    });
                });
        }

        if (scope === "hasTag") {
            return Array.isArray(condition)
                && condition.every(tag => {
                    return player.history.some(record => {
                        return Array.isArray(record?.event?.tags)
                            && record.event.tags.includes(tag);
                    });
                });
        }

        if (scope === "hasRoute") {
            return Array.isArray(condition)
                && condition.every(routeId => {
                    return Boolean(findRouteState(player, routeId));
                });
        }

        if (scope === "routeState") {
            return isPlainObject(condition)
                && Object.entries(condition).every(
                    ([routeId, expected]) => {
                        return matchesShallowMap(
                            findRouteState(player, routeId),
                            expected
                        );
                    }
                );
        }

        if (scope === "annualFlags") {
            return matchesShallowMap(session.annualFlags, condition);
        }

        if (scope === "routeFlags") {
            return isPlainObject(condition)
                && Object.entries(condition).every(
                    ([routeId, expected]) => {
                        return matchesShallowMap(
                            findRouteState(player, routeId)?.flags,
                            expected
                        );
                    }
                );
        }

        return false;
    });
}

function callTriggerMatcher(
    triggerMatcher,
    trigger,
    context,
    path
) {
    let result;

    try {
        result = triggerMatcher(trigger, context);
    } catch (error) {
        fail(
            "TRIGGER_MATCHER_FAILED",
            `Trigger matcher failed at ${path}.`,
            {
                path,
                cause: error instanceof Error
                    ? error.message
                    : String(error)
            }
        );
    }

    if (typeof result !== "boolean") {
        fail(
            "INVALID_TRIGGER_MATCHER_RESULT",
            `Trigger matcher must return a boolean at ${path}.`,
            {
                path
            }
        );
    }

    return result;
}

function assertAllowedCanonLevels(allowedCanonLevels) {
    if (!Array.isArray(allowedCanonLevels)
        || allowedCanonLevels.length === 0
        || allowedCanonLevels.some(level => {
            return !EVENT_CANON_LEVELS.includes(level);
        })) {
        fail(
            "INVALID_CANON_FILTER",
            "allowedCanonLevels must contain valid canon levels."
        );
    }
}

function buildCandidatePool({
    player,
    session,
    flow,
    node,
    wheel,
    triggerMatcher,
    allowedCanonLevels
}) {
    assertAllowedCanonLevels(allowedCanonLevels);
    const canonLevels = new Set(allowedCanonLevels);
    const context = {
        player,
        session,
        flow,
        node,
        wheel,
        item: null
    };

    if (wheel.enabled === false
        || !canonLevels.has(wheel.canonLevel)
        || !callTriggerMatcher(
            triggerMatcher,
            wheel.trigger,
            context,
            `wheel:${wheel.id}.trigger`
        )) {
        fail(
            "WHEEL_NOT_ELIGIBLE",
            `Wheel "${wheel.id}" is not eligible for this execution.`
        );
    }

    if (!Array.isArray(wheel.items)) {
        fail(
            "INVALID_RUNTIME_WHEEL",
            `Wheel "${wheel.id}" items must be an array.`
        );
    }

    const candidates = wheel.items.filter(item => {
        if (!isPlainObject(item)
            || item.enabled === false
            || !canonLevels.has(item.canonLevel)) {
            return false;
        }

        return callTriggerMatcher(
            triggerMatcher,
            item.trigger,
            {
                ...context,
                item
            },
            `wheel:${wheel.id}.item:${String(item.id)}.trigger`
        );
    });

    candidates.forEach(item => {
        if (!Number.isFinite(item.weight) || item.weight < 0) {
            fail(
                "INVALID_RUNTIME_WEIGHT",
                `Wheel item "${String(item.id)}" has an invalid weight.`,
                {
                    wheelId: wheel.id,
                    itemId: item.id,
                    weight: item.weight
                }
            );
        }
    });

    const totalWeight = candidates.reduce(
        (sum, item) => sum + item.weight,
        0
    );

    if (candidates.length === 0 || totalWeight <= 0) {
        fail(
            "EMPTY_ELIGIBLE_POOL",
            `Wheel "${wheel.id}" has no positive eligible candidates.`
        );
    }

    return {
        candidates,
        totalWeight
    };
}

function drawCandidate(candidates, totalWeight, rng) {
    if (typeof rng !== "function") {
        fail(
            "INVALID_RNG",
            "WheelFlowEngine requires an injected RNG function."
        );
    }

    const randomValue = rng();

    if (!Number.isFinite(randomValue)
        || randomValue < 0
        || randomValue >= 1) {
        fail(
            "INVALID_RNG_VALUE",
            "RNG must return a finite number in [0, 1).",
            {
                randomValue
            }
        );
    }

    const target = randomValue * totalWeight;
    let cumulativeWeight = 0;

    for (const item of candidates) {
        cumulativeWeight += item.weight;

        if (item.weight > 0 && target < cumulativeWeight) {
            return {
                item,
                randomValue
            };
        }
    }

    fail(
        "RUNTIME_DRAW_FAILED",
        "Weighted draw did not select an item."
    );
}

function assertEffects(effects, path) {
    const validation = validateEventEffectsV2(effects, {
        path
    });

    if (!validation.valid) {
        const [firstError] = validation.errors;

        fail(
            firstError.code,
            firstError.message,
            {
                path: firstError.path,
                errors: validation.errors
            }
        );
    }

    return validation.warnings;
}

function applyEffects(player, effects) {
    const nextPlayer = clonePlayerStateValue(player);

    Object.entries(effects).forEach(([path, operation]) => {
        if (typeof operation === "number") {
            nextPlayer[path] += operation;
            return;
        }

        if (Object.prototype.hasOwnProperty.call(operation, "set")) {
            nextPlayer[path] = clonePlayerStateValue(operation.set);
            return;
        }

        if (Object.prototype.hasOwnProperty.call(operation, "add")) {
            nextPlayer[path].push(
                clonePlayerStateValue(operation.add)
            );
            return;
        }

        fail(
            "UNSUPPORTED_EFFECT_OPERATION",
            `Runtime effect operation for "${path}" is not implemented.`
        );
    });

    return nextPlayer;
}

function resolveAdvance(item, node, flow) {
    const itemHasNext = Object.prototype.hasOwnProperty.call(
        item,
        "next"
    );
    const nodeHasNext = Object.prototype.hasOwnProperty.call(
        node,
        "next"
    );

    if (itemHasNext && nodeHasNext) {
        fail(
            "AMBIGUOUS_ADVANCE_SOURCE",
            "Selected item and flow node both define next."
        );
    }

    if (!itemHasNext && !nodeHasNext) {
        fail(
            "MISSING_ADVANCE",
            "Selected item and flow node do not define next."
        );
    }

    const next = itemHasNext ? item.next : node.next;

    if (!isPlainObject(next) || !isNonEmptyString(next.advance)) {
        fail(
            "INVALID_ADVANCE",
            "next must be an advance object."
        );
    }

    if (!KNOWN_ADVANCES.has(next.advance)) {
        fail(
            "UNKNOWN_ADVANCE",
            `Unknown advance "${String(next.advance)}".`
        );
    }

    if (!SUPPORTED_ADVANCES.has(next.advance)) {
        fail(
            "UNSUPPORTED_ADVANCE",
            `Advance "${next.advance}" is recognized but not implemented by the minimal engine.`,
            {
                advance: next.advance
            }
        );
    }

    if (next.advance === "end") {
        if (Object.prototype.hasOwnProperty.call(next, "target")) {
            fail(
                "INVALID_END_ADVANCE",
                "end advances must not carry a target."
            );
        }

        return next;
    }

    if (next.target?.kind !== "flow_node") {
        fail(
            "UNSUPPORTED_TARGET_KIND",
            "same_year currently supports only flow_node targets.",
            {
                targetKind: next.target?.kind ?? null
            }
        );
    }

    if (next.target.flowId !== flow.id) {
        fail(
            "UNSUPPORTED_CROSS_FLOW_TARGET",
            "The minimal engine does not execute cross-flow targets.",
            {
                targetFlowId: next.target.flowId
            }
        );
    }

    findFlowNode(flow, next.target.nodeId);

    return next;
}

function createSpin({
    player,
    session,
    flow,
    node,
    wheel,
    item,
    totalWeight,
    randomValue
}) {
    return {
        sessionId: session.sessionId,
        age: player.age,
        seed: session.seed,
        drawIndex: session.spinCount + 1,
        flowId: flow.id,
        nodeId: node.id,
        wheelId: wheel.id,
        itemId: item.id,
        itemWeight: item.weight,
        totalWeight,
        randomValue
    };
}

function assertFlowSpinLimit(flow, session) {
    if (flow.sessionLimits === undefined) {
        return;
    }

    const maxSpins = flow.sessionLimits?.maxSpins;

    if (!Number.isInteger(maxSpins) || maxSpins < 1) {
        fail(
            "INVALID_FLOW_SPIN_LIMIT",
            "flow.sessionLimits.maxSpins must be a positive integer."
        );
    }

    const flowSpinCount = session.spins.filter(spin => {
        return spin?.flowId === flow.id;
    }).length;

    if (flowSpinCount >= maxSpins) {
        fail(
            "MAX_FLOW_SPINS_EXCEEDED",
            `Flow "${flow.id}" reached its maxSpins limit.`,
            {
                flowId: flow.id,
                flowSpinCount,
                limit: maxSpins
            }
        );
    }
}

function executeEndNode({
    player,
    session,
    flow,
    node,
    limits
}) {
    const nodeKey = `${flow.id}:${node.id}`;

    assertCanExecuteNode(
        session,
        nodeKey,
        {
            willSpin: false
        },
        limits
    );

    const next = {
        advance: "end"
    };
    const nextSession = commitAnnualStep(
        session,
        {
            nodeKey,
            status: "completed",
            result: {
                advance: "end",
                flowId: flow.id,
                nodeId: node.id
            }
        },
        limits
    );

    return {
        player: clonePlayerStateValue(player),
        session: nextSession,
        next,
        item: null,
        spin: null,
        warnings: []
    };
}

export class WheelFlowError extends Error {
    constructor(code, message, details = {}) {
        super(message);
        this.name = "WheelFlowError";
        this.code = code;
        this.details = details;
    }
}

export function executeFlowNode({
    player,
    session,
    flow,
    nodeId,
    wheelsById,
    rng,
    limits = DEFAULT_WHEEL_FLOW_LIMITS,
    triggerMatcher = matchesEventTriggerV2,
    allowedCanonLevels = EVENT_CANON_LEVELS
} = {}) {
    assertRuntimeLimits(limits);
    assertEngineInputs(player, session, flow);
    const node = findFlowNode(flow, nodeId);

    assertSupportedNode(node);

    if (node.saveAs !== undefined
        || node.countFrom !== undefined
        || node.source !== undefined) {
        fail(
            "UNSUPPORTED_SESSION_CONTEXT_WRITE",
            "The minimal AnnualSession does not yet support sessionContext operations.",
            {
                nodeId: node.id
            }
        );
    }

    if (node.op === "end") {
        return executeEndNode({
            player,
            session,
            flow,
            node,
            limits
        });
    }

    const nodeKey = `${flow.id}:${node.id}`;

    assertFlowSpinLimit(flow, session);
    assertCanExecuteNode(
        session,
        nodeKey,
        {
            willSpin: true
        },
        limits
    );

    const wheel = resolveWheel(wheelsById, node.wheelId);
    const {
        candidates,
        totalWeight
    } = buildCandidatePool({
        player,
        session,
        flow,
        node,
        wheel,
        triggerMatcher,
        allowedCanonLevels
    });
    const {
        item,
        randomValue
    } = drawCandidate(candidates, totalWeight, rng);
    const warnings = assertEffects(
        item.effects,
        `wheel:${wheel.id}.item:${item.id}.effects`
    );
    const next = resolveAdvance(item, node, flow);
    const spin = createSpin({
        player,
        session,
        flow,
        node,
        wheel,
        item,
        totalWeight,
        randomValue
    });
    const nextPlayer = applyEffects(player, item.effects);

    nextPlayer.spinHistory.push(clonePlayerStateValue(spin));

    try {
        assertValidPlayerV2(nextPlayer);
    } catch (error) {
        fail(
            "PLAYER_STATE_INVALID_AFTER_EFFECTS",
            "Selected effects would produce an invalid Player v2 state.",
            {
                cause: error instanceof Error
                    ? error.message
                    : String(error),
                errors: error?.errors ?? []
            }
        );
    }

    const endsSession = next.advance === "end";
    const nextSession = commitAnnualStep(
        session,
        {
            nodeKey,
            spin,
            warnings,
            ...(endsSession
                ? {
                    status: "completed",
                    result: {
                        advance: "end",
                        flowId: flow.id,
                        nodeId: node.id,
                        wheelId: wheel.id,
                        itemId: item.id
                    }
                }
                : {})
        },
        limits
    );

    return {
        player: nextPlayer,
        session: nextSession,
        next: clonePlayerStateValue(next),
        item: clonePlayerStateValue(item),
        spin: clonePlayerStateValue(spin),
        warnings: clonePlayerStateValue(warnings)
    };
}

export function runFlow({
    player,
    session,
    flow,
    startNodeId,
    ...options
} = {}) {
    assertEngineInputs(player, session, flow);
    let currentPlayer = player;
    let currentSession = session;
    let currentNodeId = startNodeId ?? flow.entryNodeId;
    const steps = [];

    if (!isNonEmptyString(currentNodeId)) {
        fail(
            "MISSING_FLOW_ENTRY_NODE",
            "runFlow requires flow.entryNodeId or startNodeId."
        );
    }

    while (true) {
        const step = executeFlowNode({
            ...options,
            player: currentPlayer,
            session: currentSession,
            flow,
            nodeId: currentNodeId
        });

        steps.push({
            nodeId: currentNodeId,
            next: clonePlayerStateValue(step.next),
            itemId: step.item?.id ?? null,
            spin: step.spin
                ? clonePlayerStateValue(step.spin)
                : null
        });
        currentPlayer = step.player;
        currentSession = step.session;

        if (step.next.advance === "end") {
            return {
                player: currentPlayer,
                session: currentSession,
                steps,
                result: clonePlayerStateValue(currentSession.result)
            };
        }

        currentNodeId = step.next.target.nodeId;
    }
}

export default Object.freeze({
    executeFlowNode,
    matchesEventTriggerV2,
    runFlow
});
