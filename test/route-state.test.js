import assert from "node:assert/strict";
import test from "node:test";

import { createPlayerV2 } from "../js/player-v2.js";
import {
    RouteStateError,
    advanceRoute,
    blockRoute,
    canEnterRoute,
    completeRoute,
    createRouteState,
    enterRoute,
    failRoute
} from "../js/route-state.js";

function routeDefinition(overrides = {}) {
    return {
        id: "route_faction_a",
        lane: "faction",
        entry: {
            flowId: "flow_a",
            nodeId: "entry"
        },
        mutexGroups: [],
        conflictPolicy: "block",
        ...overrides
    };
}

function routeRegistry(...definitions) {
    return Object.fromEntries(
        definitions.map(definition => [definition.id, definition])
    );
}

function activeRoute(definition, overrides = {}) {
    return {
        ...createRouteState({
            routeId: definition.id,
            lane: definition.lane,
            nodeId: definition.entry.nodeId,
            age: 8,
            data: {
                nested: {
                    value: 1
                }
            },
            flags: {
                retained: true
            },
            visitCounts: {
                entry: 2
            }
        }),
        ...overrides
    };
}

function assertRouteError(action, code) {
    assert.throws(action, error => {
        assert.ok(error instanceof RouteStateError);
        assert.equal(error.code, code);
        return true;
    });
}

test("createRouteState is deterministic, isolated, and JSON-compatible", () => {
    const input = {
        routeId: "route_test",
        lane: "personal",
        nodeId: "entry",
        age: 6,
        data: {
            nested: {
                value: 1
            }
        },
        flags: {
            enabled: true
        },
        visitCounts: {
            entry: 0
        }
    };
    const first = createRouteState(input);
    const second = createRouteState(input);

    assert.deepEqual(first, second);
    assert.deepEqual(JSON.parse(JSON.stringify(first)), first);
    first.data.nested.value = 9;
    first.flags.enabled = false;
    first.visitCounts.entry = 3;
    assert.equal(input.data.nested.value, 1);
    assert.equal(input.flags.enabled, true);
    assert.equal(input.visitCounts.entry, 0);
    assert.equal(second.data.nested.value, 1);
});

test("canEnterRoute allows an explicit non-conflicting route without mutation", () => {
    const routeStates = createPlayerV2().routeStates;
    const definition = routeDefinition();
    const before = JSON.stringify(routeStates);

    assert.deepEqual(canEnterRoute(
        routeStates,
        definition,
        {
            routeDefinitionsById: routeRegistry(definition)
        }
    ), {
        allowed: true,
        code: null,
        conflicts: [],
        requiredHandler: null,
        policy: "block"
    });
    assert.equal(JSON.stringify(routeStates), before);
});

test("the same route cannot re-enter from any state bucket", () => {
    const routeStates = createPlayerV2().routeStates;
    const definition = routeDefinition();
    const state = activeRoute(definition, {
        status: "completed"
    });

    routeStates.completed.push(state);

    const decision = canEnterRoute(
        routeStates,
        definition,
        {
            routeDefinitionsById: routeRegistry(definition)
        }
    );

    assert.equal(decision.allowed, false);
    assert.equal(decision.code, "ROUTE_ALREADY_PRESENT");
    assert.equal(decision.conflicts[0].bucket, "completed");
});

test("block policy detects main-lane and mutex conflicts", () => {
    const existingMain = routeDefinition({
        id: "route_main_a",
        lane: "main"
    });
    const newMain = routeDefinition({
        id: "route_main_b",
        lane: "main"
    });
    const routeStates = createPlayerV2().routeStates;

    routeStates.active.push(activeRoute(existingMain));

    let decision = canEnterRoute(
        routeStates,
        newMain,
        {
            routeDefinitionsById: routeRegistry(existingMain, newMain)
        }
    );

    assert.equal(decision.code, "MAIN_ROUTE_CONFLICT");
    assert.equal(decision.allowed, false);

    const existingFaction = routeDefinition({
        id: "route_faction_a",
        mutexGroups: ["major_faction_core"]
    });
    const newFaction = routeDefinition({
        id: "route_faction_b",
        mutexGroups: ["major_faction_core"]
    });
    const mutexStates = createPlayerV2().routeStates;

    mutexStates.active.push(activeRoute(existingFaction));
    decision = canEnterRoute(
        mutexStates,
        newFaction,
        {
            routeDefinitionsById: routeRegistry(
                existingFaction,
                newFaction
            )
        }
    );

    assert.equal(decision.code, "ROUTE_MUTEX_CONFLICT");
    assert.deepEqual(
        decision.conflicts[0].mutexGroups,
        ["major_faction_core"]
    );
});

test("replace and branch conflicts require dedicated handlers", () => {
    ["replace", "branch"].forEach(policy => {
        const existing = routeDefinition({
            id: "route_existing",
            lane: "main"
        });
        const incoming = routeDefinition({
            id: `route_${policy}`,
            lane: "main",
            conflictPolicy: policy
        });
        const routeStates = createPlayerV2().routeStates;

        routeStates.active.push(activeRoute(existing));

        const decision = canEnterRoute(
            routeStates,
            incoming,
            {
                routeDefinitionsById: routeRegistry(existing, incoming)
            }
        );

        assert.equal(
            decision.code,
            "ROUTE_CONFLICT_HANDLER_REQUIRED"
        );
        assert.equal(decision.requiredHandler, policy);
        assert.equal(decision.allowed, false);
    });
});

test("missing active route definitions never masquerade as no conflict", () => {
    const existing = routeDefinition({
        id: "route_existing"
    });
    const incoming = routeDefinition({
        id: "route_incoming"
    });
    const routeStates = createPlayerV2().routeStates;

    routeStates.active.push(activeRoute(existing));

    const decision = canEnterRoute(
        routeStates,
        incoming,
        {
            routeDefinitionsById: routeRegistry(incoming)
        }
    );

    assert.equal(decision.allowed, false);
    assert.equal(decision.code, "MISSING_ACTIVE_ROUTE_DEFINITION");
});

test("active route state must match its registered definition", () => {
    const existing = routeDefinition({
        id: "route_existing"
    });
    const incoming = routeDefinition({
        id: "route_incoming"
    });
    const mismatchedDefinition = routeDefinition({
        id: "wrong_definition",
        lane: "main"
    });
    const routeStates = createPlayerV2().routeStates;

    routeStates.active.push(activeRoute(existing));

    assertRouteError(() => canEnterRoute(
        routeStates,
        incoming,
        {
            routeDefinitionsById: {
                [existing.id]: mismatchedDefinition,
                [incoming.id]: incoming
            }
        }
    ), "ACTIVE_ROUTE_DEFINITION_MISMATCH");
});

test("enterRoute creates a new active state atomically", () => {
    const routeStates = createPlayerV2().routeStates;
    const definition = routeDefinition();
    const before = JSON.stringify(routeStates);
    const result = enterRoute(
        routeStates,
        definition,
        {
            age: 8,
            routeDefinitionsById: routeRegistry(definition)
        }
    );

    assert.equal(JSON.stringify(routeStates), before);
    assert.equal(result.routeStates.active.length, 1);
    assert.equal(result.routeState.routeId, definition.id);
    assert.equal(result.routeState.startedAge, 8);
    result.routeState.flags.changed = true;
    assert.deepEqual(result.routeStates.active[0].flags, {});
});

test("advanceRoute guards stale nodes and preserves nested route data", () => {
    const definition = routeDefinition();
    const routeStates = createPlayerV2().routeStates;
    const state = activeRoute(definition);

    routeStates.active.push(state);
    const before = JSON.stringify(routeStates);
    const result = advanceRoute(
        routeStates,
        definition.id,
        {
            expectedNodeId: "entry",
            nextNodeId: "trial",
            age: 9
        }
    );

    assert.equal(JSON.stringify(routeStates), before);
    assert.equal(result.routeState.nodeId, "trial");
    assert.equal(result.routeState.lastAdvancedAge, 9);
    assert.equal(result.routeState.visitCounts.entry, 3);
    assert.deepEqual(result.routeState.data, state.data);
    assert.deepEqual(result.routeState.flags, state.flags);
    result.routeState.data.nested.value = 99;
    assert.equal(result.routeStates.active[0].data.nested.value, 1);

    assertRouteError(() => advanceRoute(
        result.routeStates,
        definition.id,
        {
            expectedNodeId: "entry",
            nextNodeId: "stale-write",
            age: 9
        }
    ), "STALE_ROUTE_NODE");
});

test("terminal route operations move state without losing metadata", () => {
    const operations = [
        [completeRoute, "completed"],
        [failRoute, "failed"],
        [blockRoute, "blocked"]
    ];

    operations.forEach(([operation, bucket]) => {
        const definition = routeDefinition({
            id: `route_${bucket}`
        });
        const routeStates = createPlayerV2().routeStates;
        const state = activeRoute(definition);

        routeStates.active.push(state);
        const before = JSON.stringify(routeStates);
        const result = operation(
            routeStates,
            definition.id,
            {
                age: 10
            }
        );

        assert.equal(JSON.stringify(routeStates), before);
        assert.deepEqual(result.routeStates.active, []);
        assert.equal(result.routeStates[bucket].length, 1);
        assert.equal(result.routeState.status, bucket);
        assert.equal(result.routeState.lastAdvancedAge, 10);
        assert.deepEqual(result.routeState.data, state.data);
        assert.deepEqual(result.routeState.flags, state.flags);
        assert.deepEqual(result.routeState.visitCounts, state.visitCounts);
    });
});

test("non-active routes and age regression are rejected without mutation", () => {
    const definition = routeDefinition();
    const routeStates = createPlayerV2().routeStates;
    const state = activeRoute(definition, {
        status: "completed"
    });

    routeStates.completed.push(state);
    const before = JSON.stringify(routeStates);

    assertRouteError(() => completeRoute(
        routeStates,
        definition.id,
        {
            age: 10
        }
    ), "ACTIVE_ROUTE_NOT_FOUND");
    assert.equal(JSON.stringify(routeStates), before);

    const activeStates = createPlayerV2().routeStates;
    activeStates.active.push(activeRoute(definition));
    const activeBefore = JSON.stringify(activeStates);

    assertRouteError(() => advanceRoute(
        activeStates,
        definition.id,
        {
            expectedNodeId: "entry",
            nextNodeId: "trial",
            age: 7
        }
    ), "ROUTE_AGE_REGRESSION");
    assert.equal(JSON.stringify(activeStates), activeBefore);
});
