import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { validateEventSchemaV2 } from "../js/event-schema-v2-validator.js";
import { createPlayerV2 } from "../js/player-v2.js";
import { V2AnnualFlowResolutionError, resolveAnnualFlowForPlayer } from "../js/v2-annual-flow-resolver.js";
import { V2SessionRunner } from "../js/v2-session-runner.js";

const testDirectory = dirname(fileURLToPath(import.meta.url));

function readJson(relativePath) {
    return JSON.parse(readFileSync(resolve(testDirectory, relativePath), "utf8"));
}

function createAgeSixPlayer() {
    const player = createPlayerV2();
    player.age = 6;
    return player;
}

function createRunner(dataset, player) {
    const flow = resolveAnnualFlowForPlayer({
        player,
        registry: dataset.annualFlowRegistry,
        flows: dataset.flows
    });

    return new V2SessionRunner({
        flow,
        wheelsById: dataset.wheels,
        allowedCanonLevels: ["canon"]
    });
}

function runAwakening(dataset, rng) {
    const player = createAgeSixPlayer();
    const runner = createRunner(dataset, player);
    const result = runner.run({
        player,
        sessionId: "age_6_awakening_test",
        seed: "age_6_awakening_seed",
        rng
    });

    return { player, result };
}

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

test("production age-6 awakening content passes Event Schema v2 validation", () => {
    const dataset = readJson("../data/v2/content/age-6-awakening.json");
    const before = JSON.stringify(dataset);
    const validation = validateEventSchemaV2(dataset);

    assert.equal(validation.valid, true, JSON.stringify(validation.errors));
    assert.deepEqual(validation.errors, []);
    assert.equal(JSON.stringify(dataset), before);
    assert.equal(dataset.contentStatus, "production");
    assert.deepEqual(dataset.sourceEvidence, [
        "data/events/spirit.json",
        "data/entities/martial_souls.json"
    ]);
    assert.equal(dataset.wheels[0].reviewStatus, "confirmed");
    assert.ok(dataset.wheels[0].items.every(item => {
        return item.reviewStatus === "confirmed";
    }));
    assert.equal(JSON.stringify(dataset).includes('"inferred"'), false);
    assert.equal(JSON.stringify(dataset).includes('"provisional"'), false);
});

test("age-6 registry resolves only the confirmed awakening annual flow", () => {
    const dataset = readJson("../data/v2/content/age-6-awakening.json");
    const player = createAgeSixPlayer();
    const flow = resolveAnnualFlowForPlayer({
        player,
        registry: dataset.annualFlowRegistry,
        flows: dataset.flows
    });

    assert.equal(flow.id, "flow_age_6_martial_soul_awakening");

    player.age = 5;
    assert.throws(() => {
        resolveAnnualFlowForPlayer({
            player,
            registry: dataset.annualFlowRegistry,
            flows: dataset.flows
        });
    }, error => {
        return error instanceof V2AnnualFlowResolutionError
            && error.code === "NO_ANNUAL_FLOW_FOR_AGE";
    });
});

test("deterministic age-6 awakening commits martial soul, innate level, spin, and history", () => {
    const dataset = readJson("../data/v2/content/age-6-awakening.json");
    const first = runAwakening(dataset, () => 0.95);
    const second = runAwakening(dataset, () => 0.95);

    assert.deepEqual(first.result, second.result);
    assert.equal(first.player.age, 6);
    assert.deepEqual(first.player.martialSouls, []);
    assert.deepEqual(first.player.history, []);

    const { result } = first;
    assert.equal(result.player.age, 7);
    assert.equal(result.player.level, 3);
    assert.equal(result.player.rank, "魂士");
    assert.equal(result.player.martialSouls.length, 1);
    assert.deepEqual(result.player.martialSouls[0], {
        instanceId: "martial_soul_age_6_slot_1",
        definitionId: "clear_sky_hammer",
        evolutionFamilyId: "hammer_clear_sky_family",
        legacyName: "昊天锤",
        slot: 1,
        awakenedAge: 6,
        status: "active",
        sealed: false,
        soulRings: [],
        mutations: [],
        evolutionHistory: [],
        flags: {},
        routeHooksActivated: []
    });
    assert.equal(
        result.player.activeMartialSoulInstanceId,
        "martial_soul_age_6_slot_1"
    );
    assert.equal(result.spins.length, 1);
    assert.equal(result.spins[0].itemId, "awaken_clear_sky_hammer");
    assert.equal(result.player.spinHistory.length, 1);
    assert.equal(result.player.history.length, 1);
    assert.deepEqual(result.player.history[0], result.annualRecord);
    assert.equal(result.annualRecord.kind, "annual_session");
    assert.equal(result.annualRecord.age, 6);
    assert.equal(result.annualRecord.nextAge, 7);
    assert.equal(result.annualRecord.advance, "next_year");
    assert.equal(
        result.annualRecord.result.itemId,
        "awaken_clear_sky_hammer"
    );
    assert.equal(Object.hasOwn(result.player, "combatPower"), false);
    assert.equal(Object.hasOwn(result.player, "staticCombatPower"), false);
    assert.equal(Object.hasOwn(result.player, "effectiveCombatPower"), false);
});

test("confirmed awakening weights produce the expected deterministic boundaries", () => {
    const dataset = readJson("../data/v2/content/age-6-awakening.json");
    const cases = [
        [0, "blue_silver_grass", 1],
        [0.6, "soft_bone_rabbit", 1],
        [0.9, "clear_sky_hammer", 3]
    ];

    cases.forEach(([randomValue, definitionId, level]) => {
        const { result } = runAwakening(dataset, () => randomValue);
        assert.equal(result.player.martialSouls[0].definitionId, definitionId);
        assert.equal(result.player.level, level);
        assert.equal(result.player.age, 7);
    });
});

test("age-6 awakening fails without candidates and leaves input unchanged", () => {
    const dataset = readJson("../data/v2/content/age-6-awakening.json");
    dataset.wheels[0].items.forEach(item => {
        item.enabled = false;
    });

    const player = createAgeSixPlayer();
    const before = clone(player);
    const runner = createRunner(dataset, player);

    assert.throws(() => {
        runner.run({
            player,
            sessionId: "age_6_no_candidates",
            seed: "age_6_no_candidates_seed",
            rng: () => 0
        });
    }, error => error.code === "EMPTY_ELIGIBLE_POOL");

    assert.deepEqual(player, before);
});

test("a mid-year failure rolls back awakening effects, spin, history, and age", () => {
    const dataset = readJson("../data/v2/content/age-6-awakening.json");
    const flow = dataset.flows[0];
    const firstNode = flow.nodes[0];

    firstNode.next = {
        advance: "same_year",
        target: {
            kind: "flow_node",
            flowId: flow.id,
            nodeId: "roll_blocked_follow_up"
        }
    };
    flow.sessionLimits.maxSpins = 2;
    flow.nodes.push({
        id: "roll_blocked_follow_up",
        op: "roll",
        wheelId: "wheel_age_6_blocked_follow_up",
        next: {
            advance: "next_year",
            target: {
                kind: "route_node",
                routeId: "route_age_6_martial_soul_awakening",
                nodeId: "roll_martial_soul_awakening"
            }
        }
    });
    dataset.wheels.push({
        schemaVersion: "event-schema/2.0-draft",
        kind: "wheel",
        id: "wheel_age_6_blocked_follow_up",
        title: "原子回滚测试后续节点",
        role: "result",
        resolution: "random_weighted",
        canonLevel: "canon",
        reviewStatus: "confirmed",
        enabled: true,
        trigger: {},
        items: [{
            id: "blocked_at_age_6",
            text: "仅用于验证第二步无候选时的年度回滚",
            weight: 1,
            canonLevel: "canon",
            reviewStatus: "confirmed",
            enabled: true,
            trigger: {
                age: {
                    eq: 99
                }
            },
            effects: {
                reputation: 1
            }
        }]
    });

    const player = createAgeSixPlayer();
    const before = clone(player);
    const runner = createRunner(dataset, player);

    assert.throws(() => {
        runner.run({
            player,
            sessionId: "age_6_mid_year_failure",
            seed: "age_6_mid_year_failure_seed",
            rng: () => 0.95
        });
    }, error => error.code === "EMPTY_ELIGIBLE_POOL");

    assert.deepEqual(player, before);
    assert.equal(player.age, 6);
    assert.deepEqual(player.martialSouls, []);
    assert.deepEqual(player.spinHistory, []);
    assert.deepEqual(player.history, []);
});
