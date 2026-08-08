import assert from "node:assert/strict";
import test from "node:test";

import {
    AnnualSessionError,
    assertCanExecuteNode,
    commitAnnualStep,
    createAnnualSession,
    validateAnnualSession
} from "../js/annual-session.js";

const limits = Object.freeze({
    maxSpinsPerYear: 2,
    maxVisitsPerNode: 2,
    maxRepeatCount: 20,
    maxRouteAdvancesPerAge: 10
});

function createSession() {
    return createAnnualSession({
        sessionId: "year_006_01",
        age: 6,
        seed: "example-seed",
        annualFlags: {
            started: true
        }
    });
}

function assertSessionError(action, code) {
    assert.throws(action, error => {
        assert.ok(error instanceof AnnualSessionError);
        assert.equal(error.code, code);
        return true;
    });
}

test("createAnnualSession returns isolated deterministic JSON data", () => {
    const inputFlags = {
        nested: {
            value: 1
        }
    };
    const first = createAnnualSession({
        sessionId: "year_006_01",
        age: 6,
        seed: "example-seed",
        annualFlags: inputFlags
    });
    const second = createAnnualSession({
        sessionId: "year_006_01",
        age: 6,
        seed: "example-seed",
        annualFlags: inputFlags
    });

    assert.deepEqual(first, second);
    assert.deepEqual(JSON.parse(JSON.stringify(first)), first);
    assert.deepEqual(validateAnnualSession(first), {
        valid: true,
        errors: []
    });
    first.annualFlags.nested.value = 9;
    assert.equal(inputFlags.nested.value, 1);
    assert.equal(second.annualFlags.nested.value, 1);
    assert.equal(Object.hasOwn(first, "sessionContext"), false);
});

test("commitAnnualStep atomically records visits and spins", () => {
    const session = createSession();
    const before = JSON.stringify(session);
    const spin = {
        flowId: "flow_minimal",
        nodeId: "roll_once",
        wheelId: "wheel_minimal",
        itemId: "only",
        randomValue: 0.25
    };
    const result = commitAnnualStep(
        session,
        {
            nodeKey: "flow_minimal:roll_once",
            spin
        },
        limits
    );

    assert.equal(JSON.stringify(session), before);
    assert.equal(result.spinCount, 1);
    assert.equal(result.spins.length, 1);
    assert.equal(result.visitedNodes["flow_minimal:roll_once"], 1);
    result.spins[0].itemId = "mutated";
    assert.equal(spin.itemId, "only");
});

test("limits allow the final legal commit and reject the next one", () => {
    const session = createSession();
    const first = commitAnnualStep(
        session,
        {
            nodeKey: "flow_a:node_a",
            spin: {
                itemId: "first"
            }
        },
        limits
    );
    const second = commitAnnualStep(
        first,
        {
            nodeKey: "flow_a:node_b",
            spin: {
                itemId: "second"
            }
        },
        limits
    );
    const before = JSON.stringify(second);

    assert.equal(second.spinCount, 2);
    assertSessionError(() => commitAnnualStep(
        second,
        {
            nodeKey: "flow_a:node_c",
            spin: {
                itemId: "third"
            }
        },
        limits
    ), "MAX_SPINS_PER_YEAR_EXCEEDED");
    assert.equal(JSON.stringify(second), before);

    const oneVisit = commitAnnualStep(
        session,
        {
            nodeKey: "flow_b:node_a"
        },
        limits
    );
    const twoVisits = commitAnnualStep(
        oneVisit,
        {
            nodeKey: "flow_b:node_a"
        },
        limits
    );
    const visitBefore = JSON.stringify(twoVisits);

    assert.equal(twoVisits.visitedNodes["flow_b:node_a"], 2);
    assertSessionError(() => commitAnnualStep(
        twoVisits,
        {
            nodeKey: "flow_b:node_a"
        },
        limits
    ), "MAX_VISITS_PER_NODE_EXCEEDED");
    assert.equal(JSON.stringify(twoVisits), visitBefore);
});

test("combined limit failure never leaves a partial visit", () => {
    let session = createSession();

    session = commitAnnualStep(
        session,
        {
            nodeKey: "flow_a:first",
            spin: {
                itemId: "first"
            }
        },
        limits
    );
    session = commitAnnualStep(
        session,
        {
            nodeKey: "flow_a:second",
            spin: {
                itemId: "second"
            }
        },
        limits
    );

    const before = JSON.stringify(session);

    assertSessionError(() => commitAnnualStep(
        session,
        {
            nodeKey: "flow_a:never_committed",
            spin: {
                itemId: "third"
            }
        },
        limits
    ), "MAX_SPINS_PER_YEAR_EXCEEDED");
    assert.equal(JSON.stringify(session), before);
    assert.equal(
        Object.hasOwn(
            session.visitedNodes,
            "flow_a:never_committed"
        ),
        false
    );
});

test("status, result, and warnings commit together", () => {
    const session = createSession();
    const result = commitAnnualStep(
        session,
        {
            nodeKey: "flow_minimal:end",
            warnings: [
                {
                    code: "EXAMPLE_WARNING"
                }
            ],
            status: "completed",
            result: {
                advance: "end"
            }
        },
        limits
    );

    assert.equal(result.status, "completed");
    assert.deepEqual(result.result, {
        advance: "end"
    });
    assert.deepEqual(result.warnings, [
        {
            code: "EXAMPLE_WARNING"
        }
    ]);
    assertSessionError(() => assertCanExecuteNode(
        result,
        "flow_minimal:another",
        {},
        limits
    ), "SESSION_NOT_RUNNING");
});

test("invalid commits and invalid node keys leave input unchanged", () => {
    const session = createSession();
    const before = JSON.stringify(session);

    assertSessionError(() => commitAnnualStep(
        session,
        {
            nodeKey: "missing-flow-prefix",
            spin: []
        },
        limits
    ), "INVALID_ANNUAL_SPIN");
    assert.equal(JSON.stringify(session), before);

    assertSessionError(() => assertCanExecuteNode(
        session,
        "node_only",
        {},
        limits
    ), "INVALID_ANNUAL_NODE_KEY");
    assertSessionError(() => assertCanExecuteNode(
        session,
        ":node_only",
        {},
        limits
    ), "INVALID_ANNUAL_NODE_KEY");
    assert.equal(JSON.stringify(session), before);
});
