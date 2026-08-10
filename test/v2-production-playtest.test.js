import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { V2AnnualFlowResolutionError } from "../js/v2-annual-flow-resolver.js";
import {
    V2ProductionPlaytest,
    V2ProductionPlaytestError,
    V2_PRODUCTION_PLAYTEST_STATUS
} from "../js/v2-production-playtest.js";

const testDirectory = dirname(fileURLToPath(import.meta.url));

function readJson(relativePath) {
    return JSON.parse(readFileSync(resolve(testDirectory, relativePath), "utf8"));
}

function productionDataset() {
    return readJson("../data/v2/content/age-6-awakening.json");
}

function productionOptions(dataset = productionDataset()) {
    return {
        dataset,
        catalog: readJson("../data/v2/catalogs/martial-souls.json"),
        probabilityConfig: readJson("../data/v2/config/awakening-probabilities.json"),
        combatPowerRules: readJson("../data/config/combat-power.json")
    };
}

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function assertResolverError(action, code) {
    assert.throws(action, error => {
        assert.ok(error instanceof V2AnnualFlowResolutionError);
        assert.equal(error.code, code);
        return true;
    });
}

test("production playtest starts at the explicit age-6 scene without invented history", () => {
    const dataset = productionDataset();
    const before = JSON.stringify(dataset);
    const playtest = new V2ProductionPlaytest({
        ...productionOptions(dataset),
        rng: () => 0
    });
    const state = playtest.getState();

    assert.equal(state.status, V2_PRODUCTION_PLAYTEST_STATUS.READY);
    assert.equal(state.currentFlowId, "flow_age_6_production_martial_soul_awakening");
    assert.equal(state.player.age, 6);
    assert.equal(state.player.level, 1);
    assert.equal(state.player.rank, "未觉醒");
    assert.deepEqual(state.player.martialSouls, []);
    assert.deepEqual(state.player.spinHistory, []);
    assert.deepEqual(state.player.history, []);
    assert.equal(state.executionCount, 0);
    assert.equal(state.lastResult, null);
    assert.equal(state.catalogVersion, "martial-souls/1.1");
    assert.equal(state.probabilityVersion, "awakening-probabilities/1.2");
    assert.equal(JSON.stringify(dataset), before);
});

test("production playtest refuses the examples fixture as runtime content", () => {
    const dataset = readJson("../data/v2/examples/vertical-slice.json");

    assert.throws(() => {
        new V2ProductionPlaytest({ dataset });
    }, error => {
        assert.ok(error instanceof V2ProductionPlaytestError);
        assert.equal(error.code, "NON_PRODUCTION_DATASET");
        return true;
    });
});

test("production playtest resolves the registry flow instead of flows[0]", () => {
    const dataset = productionDataset();
    dataset.flows.unshift({
        ...clone(dataset.flows[0]),
        id: "flow_decoy_not_for_age_6",
        title: "不应执行的数组首项",
        trigger: { age: { eq: 99 } }
    });
    const playtest = new V2ProductionPlaytest({
        ...productionOptions(dataset),
        rng: () => 0
    });
    const state = playtest.runYear({
        sessionId: "registry_not_index",
        seed: "registry_not_index_seed"
    });

    assert.equal(
        state.lastResult.annualRecord.flowId,
        "flow_age_6_production_martial_soul_awakening"
    );
    assert.equal(state.lastResult.session.result.innateSoulPower, 0);
    assert.equal(state.lastResult.martialSoulResults.length, 1);
});

test("deterministic production execution commits one real awakening and reaches the boundary", () => {
    const dataset = productionDataset();
    const before = JSON.stringify(dataset);
    const playtest = new V2ProductionPlaytest({
        ...productionOptions(dataset),
        rng: () => 0
    });
    const state = playtest.runYear({
        sessionId: "production_age_6_success",
        seed: "production_age_6_success_seed"
    });

    assert.equal(state.executed, true);
    assert.equal(state.status, V2_PRODUCTION_PLAYTEST_STATUS.CONTENT_BOUNDARY);
    assert.equal(state.player.age, 7);
    assert.equal(state.player.innateSoulPower, 0);
    assert.equal(state.player.level, 0);
    assert.equal(state.player.rank, "无魂力");
    assert.equal(state.player.soulPowerGrowthLocked, true);
    assert.equal(state.player.martialSouls.length, 1);
    assert.equal(
        state.player.martialSouls[0].definitionId,
        state.lastResult.martialSoulResults[0].definitionId
    );
    assert.equal(
        state.player.activeMartialSoulInstanceId,
        "martial_soul_age_6_slot_1"
    );
    assert.equal(state.lastResult.martialSoulResults.length, 1);
    assert.equal(state.lastResult.spins.length, 5);
    assert.equal(state.player.spinHistory.length, 5);
    assert.equal(state.player.history.length, 1);
    assert.equal(state.lastResult.annualRecord.age, 6);
    assert.equal(state.lastResult.annualRecord.nextAge, 7);
    assert.equal(state.lastResult.annualRecord.advance, "next_year");
    assert.equal(state.lastResult.annualRecord.sessionId, "production_age_6_success");
    assert.equal(state.lastResult.annualRecord.seed, "production_age_6_success_seed");
    assert.equal(state.boundary.code, "CONTENT_BOUNDARY_REACHED");
    assert.equal(state.boundary.age, 7);
    assert.equal(Object.hasOwn(state.player, "combatPower"), false);
    assert.equal(Object.hasOwn(state.player, "staticCombatPower"), false);
    assert.equal(Object.hasOwn(state.player, "effectiveCombatPower"), false);
    assert.equal(JSON.stringify(dataset), before);
});

test("content boundary prevents a second session, spin, history entry, or RNG draw", () => {
    let rngCalls = 0;
    const rng = () => {
        rngCalls += 1;
        return 0;
    };
    const playtest = new V2ProductionPlaytest({
        ...productionOptions(),
        rng
    });
    const first = playtest.runYear({
        sessionId: "boundary_once",
        seed: "boundary_once_seed"
    });
    const second = playtest.runYear();

    assert.equal(first.executed, true);
    assert.equal(second.executed, false);
    assert.equal(rngCalls, 5);
    assert.equal(second.player.age, 7);
    assert.equal(second.player.spinHistory.length, 5);
    assert.equal(second.player.history.length, 1);
    assert.equal(second.executionCount, 1);
    assert.deepEqual(second.lastResult, first.lastResult);
});

test("age-6 no-flow remains a configuration error instead of a content boundary", () => {
    const dataset = productionDataset();
    dataset.annualFlowRegistry.entries = [];

    assertResolverError(() => {
        new V2ProductionPlaytest(productionOptions(dataset));
    }, "NO_ANNUAL_FLOW_FOR_AGE");
});

test("production playtest rejects a confirmed but non-canon annual flow", () => {
    const dataset = productionDataset();
    dataset.flows[0].canonLevel = "expanded";

    assert.throws(() => {
        new V2ProductionPlaytest(productionOptions(dataset));
    }, error => {
        assert.ok(error instanceof V2ProductionPlaytestError);
        assert.equal(error.code, "ANNUAL_FLOW_NOT_CANON");
        return true;
    });
});

test("unconfirmed registry entries and flows remain strict resolver errors", async t => {
    await t.test("registry entry", () => {
        const dataset = productionDataset();
        dataset.annualFlowRegistry.entries[0].reviewStatus = "provisional";

        assertResolverError(() => {
            new V2ProductionPlaytest(productionOptions(dataset));
        }, "ANNUAL_FLOW_ENTRY_NOT_CONFIRMED");
    });

    await t.test("resolved flow", () => {
        const dataset = productionDataset();
        dataset.flows[0].reviewStatus = "inferred";

        assertResolverError(() => {
            new V2ProductionPlaytest(productionOptions(dataset));
        }, "ANNUAL_FLOW_NOT_CONFIRMED");
    });
});

test("invalid and ambiguous registry references remain strict resolver errors", async t => {
    await t.test("invalid reference", () => {
        const dataset = productionDataset();
        dataset.annualFlowRegistry.entries[0].flowId = "missing_flow";

        assertResolverError(() => {
            new V2ProductionPlaytest(productionOptions(dataset));
        }, "ANNUAL_FLOW_REFERENCE_INVALID");
    });

    await t.test("ambiguous age", () => {
        const dataset = productionDataset();
        dataset.annualFlowRegistry.entries.push({
            ...dataset.annualFlowRegistry.entries[0]
        });

        assertResolverError(() => {
            new V2ProductionPlaytest(productionOptions(dataset));
        }, "AMBIGUOUS_ANNUAL_FLOW_FOR_AGE");
    });
});

test("non-no-flow errors after age 6 are not swallowed as content boundary", () => {
    const dataset = productionDataset();
    dataset.annualFlowRegistry.entries.push(
        {
            age: 7,
            flowId: "missing_age_7_a",
            reviewStatus: "confirmed"
        },
        {
            age: 7,
            flowId: "missing_age_7_b",
            reviewStatus: "confirmed"
        }
    );
    const playtest = new V2ProductionPlaytest({
        ...productionOptions(dataset),
        rng: () => 0
    });
    const before = playtest.getState();

    assertResolverError(() => {
        playtest.runYear({
            sessionId: "age_7_ambiguous",
            seed: "age_7_ambiguous_seed"
        });
    }, "AMBIGUOUS_ANNUAL_FLOW_FOR_AGE");
    assert.deepEqual(playtest.getState(), before);
});

test("annual failure preserves the complete pre-run playtest state", () => {
    const dataset = productionDataset();
    const playtest = new V2ProductionPlaytest({
        ...productionOptions(dataset),
        rng: () => 0
    });
    const before = playtest.getState();

    assert.throws(() => {
        playtest.runYear({
            sessionId: "production_failure",
            seed: "production_failure_seed",
            rng: () => 1
        });
    }, error => error.code === "INVALID_RNG_VALUE");
    assert.deepEqual(playtest.getState(), before);
});
