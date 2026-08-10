import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { createAnnualSession } from "../js/annual-session.js";
import { createPlayerV2 } from "../js/player-v2.js";
import {
    DEFAULT_WHEEL_FLOW_LIMITS,
    executeFlowNode,
    runFlow
} from "../js/wheel-flow-engine.js";

const testDirectory = dirname(fileURLToPath(import.meta.url));

function readExample(name) {
    return JSON.parse(readFileSync(resolve(
        testDirectory,
        `../data/v2/examples/${name}.minimal.json`
    ), "utf8"));
}

function createPlayer() {
    const player = createPlayerV2();

    player.age = 6;

    return player;
}

function createSession() {
    return createAnnualSession({
        sessionId: "year_006_01",
        age: 6,
        seed: "fixed-seed"
    });
}

function item(id, weight, overrides = {}) {
    return {
        id,
        text: id,
        weight,
        canonLevel: "canon",
        reviewStatus: "confirmed",
        enabled: true,
        trigger: {},
        effects: {},
        ...overrides
    };
}

function wheel(id, items, overrides = {}) {
    return {
        id,
        enabled: true,
        canonLevel: "canon",
        trigger: {},
        items,
        ...overrides
    };
}

function flow(nodes, overrides = {}) {
    return {
        id: "flow_test",
        entryNodeId: nodes[0]?.id,
        sessionLimits: {
            maxSpins: 50,
            status: "provisional"
        },
        nodes,
        ...overrides
    };
}

function sequenceRng(values) {
    let index = 0;
    const rng = () => {
        const value = values[index];

        index += 1;
        return value;
    };

    rng.calls = () => index;
    return rng;
}

function assertEngineError(action, code) {
    assert.throws(action, error => {
        assert.equal(error.code, code);
        return true;
    });
}

test("minimal example flow is deterministic and leaves all inputs unchanged", () => {
    const exampleFlow = readExample("flows")[0];
    const exampleWheels = readExample("wheels");
    const player = createPlayer();
    const session = createSession();
    const playerBefore = JSON.stringify(player);
    const sessionBefore = JSON.stringify(session);
    const flowBefore = JSON.stringify(exampleFlow);
    const wheelsBefore = JSON.stringify(exampleWheels);

    const first = runFlow({
        player,
        session,
        flow: exampleFlow,
        wheelsById: exampleWheels,
        rng: sequenceRng([0.25])
    });
    const second = runFlow({
        player,
        session,
        flow: exampleFlow,
        wheelsById: exampleWheels,
        rng: sequenceRng([0.25])
    });

    assert.deepEqual(first, second);
    assert.equal(first.session.status, "completed");
    assert.equal(first.session.spinCount, 1);
    assert.deepEqual(
        first.session.visitedNodes,
        {
            "flow_minimal:roll_once": 1,
            "flow_minimal:end": 1
        }
    );
    assert.equal(first.player.spinHistory.length, 1);
    assert.equal(first.player.age, 6);
    assert.deepEqual(first.steps.map(step => step.nodeId), [
        "roll_once",
        "end"
    ]);
    assert.equal(JSON.stringify(player), playerBefore);
    assert.equal(JSON.stringify(session), sessionBefore);
    assert.equal(JSON.stringify(exampleFlow), flowBefore);
    assert.equal(JSON.stringify(exampleWheels), wheelsBefore);
});

test("weighted draw honors zero weights and exact boundaries", () => {
    const testWheel = wheel("wheel_weighted", [
        item("zero", 0),
        item("first", 1),
        item("second", 3)
    ]);
    const testFlow = flow([
        {
            id: "roll",
            op: "roll",
            wheelId: testWheel.id,
            next: {
                advance: "end"
            }
        }
    ]);
    const cases = [
        [0, "first"],
        [0.249999, "first"],
        [0.25, "second"],
        [0.999999, "second"]
    ];

    cases.forEach(([randomValue, expectedItemId]) => {
        const result = executeFlowNode({
            player: createPlayer(),
            session: createSession(),
            flow: testFlow,
            nodeId: "roll",
            wheelsById: {
                [testWheel.id]: testWheel
            },
            rng: sequenceRng([randomValue])
        });

        assert.equal(result.item.id, expectedItemId);
        assert.notEqual(result.item.id, "zero");
        assert.equal(result.spin.totalWeight, 4);
    });
});

test("enabled, canon, and trigger filters run before RNG consumption", () => {
    const testWheel = wheel("wheel_filtered", [
        item("disabled", 10, {
            enabled: false
        }),
        item("parody", 10, {
            canonLevel: "parody"
        }),
        item("wrong_age", 10, {
            trigger: {
                age: {
                    eq: 7
                }
            }
        }),
        item("eligible", 1)
    ]);
    const testFlow = flow([
        {
            id: "roll",
            op: "roll",
            wheelId: testWheel.id,
            next: {
                advance: "end"
            }
        }
    ]);
    const rng = sequenceRng([0.5]);
    const result = executeFlowNode({
        player: createPlayer(),
        session: createSession(),
        flow: testFlow,
        nodeId: "roll",
        wheelsById: [testWheel],
        rng,
        allowedCanonLevels: ["canon"]
    });

    assert.equal(result.item.id, "eligible");
    assert.equal(result.spin.totalWeight, 1);
    assert.equal(rng.calls(), 1);

    const emptyWheel = wheel("wheel_empty", [
        item("disabled", 1, {
            enabled: false
        })
    ]);
    const emptyFlow = flow([
        {
            id: "roll",
            op: "roll",
            wheelId: emptyWheel.id,
            next: {
                advance: "end"
            }
        }
    ]);
    const unusedRng = sequenceRng([0.5]);

    assertEngineError(() => executeFlowNode({
        player: createPlayer(),
        session: createSession(),
        flow: emptyFlow,
        nodeId: "roll",
        wheelsById: [emptyWheel],
        rng: unusedRng
    }), "EMPTY_ELIGIBLE_POOL");
    assert.equal(unusedRng.calls(), 0);
});

test("invalid runtime weights and RNG values do not commit state", () => {
    const invalidWeightWheel = wheel("wheel_invalid_weight", [
        item("invalid", -1)
    ]);
    const testFlow = flow([
        {
            id: "roll",
            op: "roll",
            wheelId: invalidWeightWheel.id,
            next: {
                advance: "end"
            }
        }
    ]);
    const player = createPlayer();
    const session = createSession();
    const beforePlayer = JSON.stringify(player);
    const beforeSession = JSON.stringify(session);
    const unusedRng = sequenceRng([0]);

    assertEngineError(() => executeFlowNode({
        player,
        session,
        flow: testFlow,
        nodeId: "roll",
        wheelsById: [invalidWeightWheel],
        rng: unusedRng
    }), "INVALID_RUNTIME_WEIGHT");
    assert.equal(unusedRng.calls(), 0);
    assert.equal(JSON.stringify(player), beforePlayer);
    assert.equal(JSON.stringify(session), beforeSession);

    const validWheel = wheel("wheel_valid", [
        item("only", 1)
    ]);
    testFlow.nodes[0].wheelId = validWheel.id;
    const invalidRng = sequenceRng([1]);

    assertEngineError(() => executeFlowNode({
        player,
        session,
        flow: testFlow,
        nodeId: "roll",
        wheelsById: [validWheel],
        rng: invalidRng
    }), "INVALID_RNG_VALUE");
    assert.equal(invalidRng.calls(), 1);
    assert.equal(JSON.stringify(player), beforePlayer);
    assert.equal(JSON.stringify(session), beforeSession);
});

test("invalid effects consume one draw but never leave partial state", () => {
    const forbiddenWheel = wheel("wheel_forbidden", [
        item("only", 1, {
            effects: {
                combatPower: 999
            }
        })
    ]);
    const testFlow = flow([
        {
            id: "roll",
            op: "roll",
            wheelId: forbiddenWheel.id,
            next: {
                advance: "end"
            }
        }
    ]);
    const player = createPlayer();
    const session = createSession();
    const beforePlayer = JSON.stringify(player);
    const beforeSession = JSON.stringify(session);
    const rng = sequenceRng([0]);

    assertEngineError(() => executeFlowNode({
        player,
        session,
        flow: testFlow,
        nodeId: "roll",
        wheelsById: [forbiddenWheel],
        rng
    }), "FORBIDDEN_DERIVED_COMBAT_EFFECT");
    assert.equal(rng.calls(), 1);
    assert.equal(JSON.stringify(player), beforePlayer);
    assert.equal(JSON.stringify(session), beforeSession);

    const ageWheel = wheel("wheel_age", [
        item("only", 1, {
            effects: {
                age: 1
            }
        })
    ]);
    testFlow.nodes[0].wheelId = ageWheel.id;

    assertEngineError(() => executeFlowNode({
        player,
        session,
        flow: testFlow,
        nodeId: "roll",
        wheelsById: [ageWheel],
        rng: sequenceRng([0])
    }), "FORBIDDEN_AGE_EFFECT");
    assert.equal(JSON.stringify(player), beforePlayer);
    assert.equal(JSON.stringify(session), beforeSession);

    const invalidStateWheel = wheel("wheel_invalid_state", [
        item("only", 1, {
            effects: {
                level: -2
            }
        })
    ]);
    testFlow.nodes[0].wheelId = invalidStateWheel.id;

    assertEngineError(() => executeFlowNode({
        player,
        session,
        flow: testFlow,
        nodeId: "roll",
        wheelsById: [invalidStateWheel],
        rng: sequenceRng([0])
    }), "PLAYER_STATE_INVALID_AFTER_EFFECTS");
    assert.equal(JSON.stringify(player), beforePlayer);
    assert.equal(JSON.stringify(session), beforeSession);
});

test("missing or ambiguous advances fail after selection without commit", () => {
    const missingWheel = wheel("wheel_missing_next", [
        item("only", 1)
    ]);
    const missingFlow = flow([
        {
            id: "roll",
            op: "roll",
            wheelId: missingWheel.id
        }
    ]);
    const player = createPlayer();
    const session = createSession();
    const beforePlayer = JSON.stringify(player);
    const beforeSession = JSON.stringify(session);
    const missingRng = sequenceRng([0]);

    assertEngineError(() => executeFlowNode({
        player,
        session,
        flow: missingFlow,
        nodeId: "roll",
        wheelsById: [missingWheel],
        rng: missingRng
    }), "MISSING_ADVANCE");
    assert.equal(missingRng.calls(), 1);
    assert.equal(JSON.stringify(player), beforePlayer);
    assert.equal(JSON.stringify(session), beforeSession);

    const ambiguousWheel = wheel("wheel_ambiguous", [
        item("only", 1, {
            next: {
                advance: "end"
            }
        })
    ]);
    const ambiguousFlow = flow([
        {
            id: "roll",
            op: "roll",
            wheelId: ambiguousWheel.id,
            next: {
                advance: "end"
            }
        }
    ]);

    assertEngineError(() => executeFlowNode({
        player,
        session,
        flow: ambiguousFlow,
        nodeId: "roll",
        wheelsById: [ambiguousWheel],
        rng: sequenceRng([0])
    }), "AMBIGUOUS_ADVANCE_SOURCE");
    assert.equal(JSON.stringify(player), beforePlayer);
    assert.equal(JSON.stringify(session), beforeSession);
});

test("runFlow executes multiple same-year rolls and an end node", () => {
    const firstWheel = wheel("wheel_first", [
        item("first", 1, {
            effects: {
                level: 1
            }
        })
    ]);
    const secondWheel = wheel("wheel_second", [
        item("second", 1, {
            effects: {
                faction: {
                    set: "武魂殿"
                }
            }
        })
    ]);
    const testFlow = flow([
        {
            id: "first",
            op: "roll",
            wheelId: firstWheel.id,
            next: {
                advance: "same_year",
                target: {
                    kind: "flow_node",
                    flowId: "flow_test",
                    nodeId: "second"
                }
            }
        },
        {
            id: "second",
            op: "roll",
            wheelId: secondWheel.id,
            next: {
                advance: "same_year",
                target: {
                    kind: "flow_node",
                    flowId: "flow_test",
                    nodeId: "end"
                }
            }
        },
        {
            id: "end",
            op: "end"
        }
    ]);
    const result = runFlow({
        player: createPlayer(),
        session: createSession(),
        flow: testFlow,
        wheelsById: [firstWheel, secondWheel],
        rng: sequenceRng([0, 0])
    });

    assert.equal(result.player.level, 2);
    assert.equal(result.player.faction, "武魂殿");
    assert.equal(result.player.age, 6);
    assert.equal(result.player.spinHistory.length, 2);
    assert.equal(result.session.spinCount, 2);
    assert.equal(result.session.status, "completed");
    assert.deepEqual(result.steps.map(step => step.nodeId), [
        "first",
        "second",
        "end"
    ]);
});

test("remaining unsupported ops and unknown ops have distinct error codes", () => {
    [
        "setRoute",
        "yieldYear",
        "terminal"
    ].forEach(op => {
        const testFlow = flow([
            {
                id: "node",
                op
            }
        ]);

        assertEngineError(() => executeFlowNode({
            player: createPlayer(),
            session: createSession(),
            flow: testFlow,
            nodeId: "node",
            wheelsById: {},
            rng: sequenceRng([0])
        }), "UNSUPPORTED_FLOW_OP");
    });

    const unknownFlow = flow([
        {
            id: "node",
            op: "playerChoice"
        }
    ]);

    assertEngineError(() => executeFlowNode({
        player: createPlayer(),
        session: createSession(),
        flow: unknownFlow,
        nodeId: "node",
        wheelsById: {},
        rng: sequenceRng([0])
    }), "UNKNOWN_FLOW_OP");
});

test("next_year completes the annual session while terminal remains unsupported", () => {
    const nextYearWheel = wheel("wheel_next_year", [
        item("only", 1, {
            next: {
                advance: "next_year",
                target: {
                    kind: "route_node",
                    routeId: "route_test",
                    nodeId: "roll"
                }
            }
        })
    ]);
    const nextYearFlow = flow([
        {
            id: "roll",
            op: "roll",
            wheelId: nextYearWheel.id
        }
    ]);
    const nextYearResult = executeFlowNode({
        player: createPlayer(),
        session: createSession(),
        flow: nextYearFlow,
        nodeId: "roll",
        wheelsById: [nextYearWheel],
        rng: sequenceRng([0])
    });

    assert.equal(nextYearResult.next.advance, "next_year");
    assert.equal(nextYearResult.session.status, "completed");
    assert.equal(nextYearResult.session.result.advance, "next_year");

    ["terminal"].forEach(advance => {
        const testWheel = wheel(`wheel_${advance}`, [
            item("only", 1, {
                next: {
                    advance
                }
            })
        ]);
        const testFlow = flow([
            {
                id: "roll",
                op: "roll",
                wheelId: testWheel.id
            }
        ]);
        const rng = sequenceRng([0]);

        assertEngineError(() => executeFlowNode({
            player: createPlayer(),
            session: createSession(),
            flow: testFlow,
            nodeId: "roll",
            wheelsById: [testWheel],
            rng
        }), "UNSUPPORTED_ADVANCE");
        assert.equal(rng.calls(), 1);
    });
});

test("annual and per-flow limits stop execution before RNG", () => {
    const testWheel = wheel("wheel_limit", [
        item("only", 1)
    ]);
    const testFlow = flow([
        {
            id: "roll",
            op: "roll",
            wheelId: testWheel.id,
            next: {
                advance: "end"
            }
        }
    ]);
    const annualSession = createSession();

    annualSession.spinCount = 1;
    annualSession.spins.push({
        flowId: "another_flow"
    });
    const annualRng = sequenceRng([0]);

    assertEngineError(() => executeFlowNode({
        player: createPlayer(),
        session: annualSession,
        flow: testFlow,
        nodeId: "roll",
        wheelsById: [testWheel],
        rng: annualRng,
        limits: {
            ...DEFAULT_WHEEL_FLOW_LIMITS,
            maxSpinsPerYear: 1
        }
    }), "MAX_SPINS_PER_YEAR_EXCEEDED");
    assert.equal(annualRng.calls(), 0);

    const flowSession = createSession();

    flowSession.spinCount = 1;
    flowSession.spins.push({
        flowId: "flow_test"
    });
    testFlow.sessionLimits.maxSpins = 1;
    const flowRng = sequenceRng([0]);

    assertEngineError(() => executeFlowNode({
        player: createPlayer(),
        session: flowSession,
        flow: testFlow,
        nodeId: "roll",
        wheelsById: [testWheel],
        rng: flowRng
    }), "MAX_FLOW_SPINS_EXCEEDED");
    assert.equal(flowRng.calls(), 0);
});

test("age mismatch fails before RNG and saveAs writes stable context", () => {
    const testWheel = wheel("wheel_preflight", [
        item("only", 1)
    ]);
    const testFlow = flow([
        {
            id: "roll",
            op: "roll",
            wheelId: testWheel.id,
            next: {
                advance: "end"
            }
        }
    ]);
    const mismatchedPlayer = createPlayer();
    const rng = sequenceRng([0]);

    mismatchedPlayer.age = 7;
    assertEngineError(() => executeFlowNode({
        player: mismatchedPlayer,
        session: createSession(),
        flow: testFlow,
        nodeId: "roll",
        wheelsById: [testWheel],
        rng
    }), "SESSION_AGE_MISMATCH");
    assert.equal(rng.calls(), 0);

    testFlow.nodes[0].saveAs = "result";
    const result = executeFlowNode({
        player: createPlayer(),
        session: createSession(),
        flow: testFlow,
        nodeId: "roll",
        wheelsById: [testWheel],
        rng
    });
    assert.equal(result.session.sessionContext.result, "only");
    assert.equal(rng.calls(), 1);
});
