import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { validateEventSchemaV2 } from "../js/event-schema-v2-validator.js";
import { createPlayerV2 } from "../js/player-v2.js";
import {
    V2SessionRunner,
    V2SessionRunnerError,
    runV2AnnualSession
} from "../js/v2-session-runner.js";

const testDirectory = dirname(fileURLToPath(import.meta.url));

function readJson(relativePath) {
    return JSON.parse(readFileSync(resolve(testDirectory, relativePath), "utf8"));
}

function createPlayer(age = 6) {
    const player = createPlayerV2();
    player.age = age;
    return player;
}

function sequenceRng(values) {
    let index = 0;
    const rng = () => values[index++];
    rng.calls = () => index;
    return rng;
}

function createRunner(dataset, rules) {
    return new V2SessionRunner({
        flow: dataset.flows[0],
        wheelsById: dataset.wheels,
        combatPowerRules: rules
    });
}

function assertRunnerError(action, code) {
    assert.throws(action, error => {
        assert.ok(error instanceof V2SessionRunnerError);
        assert.equal(error.code, code);
        return true;
    });
}

test("vertical slice data validates and commits one next-year session", () => {
    const dataset = readJson("../data/v2/examples/vertical-slice.json");
    const rules = readJson("../data/config/combat-power.json");
    const validation = validateEventSchemaV2(dataset);
    const player = createPlayer();
    const before = JSON.stringify(player);
    const result = createRunner(dataset, rules).run({
        player,
        sessionId: "year_006_vertical_01",
        seed: "vertical-seed",
        rng: sequenceRng([0])
    });

    assert.equal(validation.valid, true);
    assert.equal(result.player.age, 7);
    assert.equal(result.player.reputation, 1);
    assert.equal(result.player.spinHistory.length, 1);
    assert.equal(result.player.history.length, 1);
    assert.equal(result.session.status, "completed");
    assert.equal(result.session.result.advance, "next_year");
    assert.equal(result.annualRecord.nextAge, 7);
    assert.equal(result.flowResult.steps[0].itemId, "annual_reputation_gain");
    assert.equal(result.combatPower.rulesVersion, "combat-power/2.0");
    assert.equal(Object.hasOwn(result.player, "combatPower"), false);
    assert.equal(JSON.stringify(player), before);
});

test("same_year keeps age and commits multiple spins before end", () => {
    const firstWheel = {
        id: "wheel_same_year_money",
        enabled: true,
        canonLevel: "canon",
        trigger: {},
        items: [{
            id: "money",
            text: "money",
            weight: 1,
            canonLevel: "canon",
            reviewStatus: "confirmed",
            enabled: true,
            trigger: {},
            effects: { money: 1 }
        }]
    };
    const secondWheel = {
        ...firstWheel,
        id: "wheel_same_year_reputation",
        items: [{ ...firstWheel.items[0], id: "reputation", effects: { reputation: 1 } }]
    };
    const flow = {
        id: "flow_same_year_runner",
        entryNodeId: "first",
        sessionLimits: { maxSpins: 50, status: "provisional" },
        nodes: [
            {
                id: "first",
                op: "roll",
                wheelId: firstWheel.id,
                next: {
                    advance: "same_year",
                    target: { kind: "flow_node", flowId: "flow_same_year_runner", nodeId: "second" }
                }
            },
            { id: "second", op: "roll", wheelId: secondWheel.id, next: { advance: "end" } }
        ]
    };
    const result = runV2AnnualSession({
        player: createPlayer(),
        flow,
        wheelsById: [firstWheel, secondWheel],
        sessionId: "year_006_same_year",
        seed: "same-year-seed",
        rng: sequenceRng([0, 0])
    });

    assert.equal(result.player.age, 6);
    assert.equal(result.player.money, 1);
    assert.equal(result.player.reputation, 1);
    assert.equal(result.session.result.advance, "end");
    assert.equal(result.session.spinCount, 2);
});

test("invalid effects leave the input player and route state unchanged", () => {
    const dataset = readJson("../data/v2/examples/vertical-slice.json");
    const player = createPlayer();
    const wheel = {
        ...dataset.wheels[0],
        id: "wheel_invalid_effect",
        items: [{ ...dataset.wheels[0].items[0], effects: { combatPower: 100 } }]
    };
    const flow = {
        ...dataset.flows[0],
        id: "flow_invalid_effect",
        nodes: [{ ...dataset.flows[0].nodes[0], wheelId: wheel.id }]
    };
    const before = JSON.stringify(player);
    const rng = sequenceRng([0]);

    assert.throws(() => runV2AnnualSession({
        player,
        flow,
        wheelsById: [wheel],
        sessionId: "year_006_invalid_effect",
        seed: "invalid-effect-seed",
        rng
    }), error => {
        assert.equal(error.code, "FORBIDDEN_DERIVED_COMBAT_EFFECT");
        return true;
    });
    assert.equal(rng.calls(), 1);
    assert.equal(JSON.stringify(player), before);
});

test("a completed annual session cannot be submitted twice", () => {
    const dataset = readJson("../data/v2/examples/vertical-slice.json");
    const runner = createRunner(dataset);
    const first = runner.run({
        player: createPlayer(),
        sessionId: "year_006_duplicate",
        seed: "duplicate-seed",
        rng: sequenceRng([0])
    });
    const beforeRetry = JSON.stringify(first.player);

    assertRunnerError(() => runner.run({
        player: first.player,
        session: first.session,
        rng: sequenceRng([0])
    }), "SESSION_NOT_RUNNING");
    assertRunnerError(() => runner.run({
        player: first.player,
        sessionId: "year_006_duplicate",
        seed: "duplicate-seed",
        rng: sequenceRng([0])
    }), "ANNUAL_SESSION_ALREADY_COMMITTED");
    assert.equal(JSON.stringify(first.player), beforeRetry);
});

test("three annual sessions use isolated session state and deterministic RNG", () => {
    const dataset = readJson("../data/v2/examples/vertical-slice.json");
    const runner = createRunner(dataset);
    let player = createPlayer();
    const results = [];

    for (let index = 0; index < 3; index += 1) {
        const result = runner.run({
            player,
            sessionId: `year_00${6 + index}_three_years`,
            seed: `three-years-${index}`,
            rng: sequenceRng([0])
        });
        results.push(result);
        player = result.player;
    }

    assert.deepEqual(results.map(result => result.player.age), [7, 8, 9]);
    assert.deepEqual(results.map(result => result.session.spinCount), [1, 1, 1]);
    assert.equal(player.reputation, 3);
    assert.equal(player.spinHistory.length, 3);
    assert.equal(player.history.length, 3);
    assert.deepEqual(player.annualFlags, {});
});
