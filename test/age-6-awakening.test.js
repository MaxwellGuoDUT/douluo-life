import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { validateEventSchemaV2 } from "../js/event-schema-v2-validator.js";
import { createPlayerV2 } from "../js/player-v2.js";
import {
    V2AnnualFlowResolutionError,
    resolveAnnualFlowForPlayer
} from "../js/v2-annual-flow-resolver.js";
import { V2SessionRunner } from "../js/v2-session-runner.js";

const testDirectory = dirname(fileURLToPath(import.meta.url));

function readJson(relativePath) {
    return JSON.parse(readFileSync(resolve(testDirectory, relativePath), "utf8"));
}

function productionInputs() {
    return {
        dataset: readJson("../data/v2/content/age-6-awakening.json"),
        catalog: readJson("../data/v2/catalogs/martial-souls.json"),
        probabilityConfig: readJson("../data/v2/config/awakening-probabilities.json"),
        combatPowerRules: readJson("../data/config/combat-power.json")
    };
}

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function createAgeSixPlayer() {
    const player = createPlayerV2();
    player.age = 6;
    return player;
}

function sequenceRng(values) {
    let index = 0;
    const rng = () => {
        assert.ok(index < values.length, "RNG sequence was exhausted.");
        const value = values[index];
        index += 1;
        return value;
    };
    rng.calls = () => index;
    return rng;
}

function fourBodyExtremeSequence() {
    return [
        0.999,
        0.999,
        0.999,
        ...Array(4).fill([0.999, 0]).flat()
    ];
}

function createRunner({
    dataset,
    catalog,
    probabilityConfig,
    combatPowerRules,
    player,
    failureInjector
}) {
    const flow = resolveAnnualFlowForPlayer({
        player,
        registry: dataset.annualFlowRegistry,
        flows: dataset.flows
    });

    return new V2SessionRunner({
        flow,
        wheelsById: dataset.wheels,
        allowedCanonLevels: ["canon", "expanded"],
        combatPowerRules,
        awakeningRuntime: {
            catalog,
            probabilityConfig,
            rulesVersion: combatPowerRules.rulesVersion,
            ...(failureInjector ? { failureInjector } : {})
        }
    });
}

function runAwakening({
    values,
    sessionId = "age_6_production_awakening",
    inputs = productionInputs(),
    failureInjector
}) {
    const player = createAgeSixPlayer();
    const rng = sequenceRng(values);
    const runner = createRunner({
        ...inputs,
        player,
        failureInjector
    });
    const result = runner.run({
        player,
        sessionId,
        seed: `${sessionId}_seed`,
        rng
    });
    return { player, result, rng };
}

test("production age-6 content validates and references only production inputs", () => {
    const { dataset } = productionInputs();
    const before = JSON.stringify(dataset);
    const validation = validateEventSchemaV2(dataset);

    assert.equal(validation.valid, true, JSON.stringify(validation.errors));
    assert.deepEqual(validation.errors, []);
    assert.equal(JSON.stringify(dataset), before);
    assert.equal(dataset.contentStatus, "production");
    assert.deepEqual(dataset.sourceEvidence, [
        "data/v2/catalogs/martial-souls.json",
        "data/v2/config/awakening-probabilities.json"
    ]);
    assert.equal(dataset.wheels.length, 0);
    assert.equal(dataset.runtimeDependencies.catalogVersion, "martial-souls/1.1");
    assert.equal(JSON.stringify(dataset).includes("data/events/spirit.json"), false);
    assert.equal(JSON.stringify(dataset).includes("data/entities/martial_souls.json"), false);
});

test("age-6 registry resolves only the confirmed production awakening flow", () => {
    const { dataset } = productionInputs();
    const player = createAgeSixPlayer();
    const flow = resolveAnnualFlowForPlayer({
        player,
        registry: dataset.annualFlowRegistry,
        flows: dataset.flows
    });

    assert.equal(flow.id, "flow_age_6_production_martial_soul_awakening");

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

test("deterministic level-0 awakening commits five audited spins and stays level 0", () => {
    const first = runAwakening({ values: [0, 0, 0, 0, 0] });
    const second = runAwakening({ values: [0, 0, 0, 0, 0] });

    assert.deepEqual(first.result, second.result);
    assert.equal(first.player.age, 6);
    assert.equal(first.player.level, 1);
    assert.deepEqual(first.player.martialSouls, []);
    assert.deepEqual(first.player.spinHistory, []);
    assert.deepEqual(first.player.history, []);

    const { result } = first;
    assert.equal(result.player.age, 7);
    assert.equal(result.player.innateSoulPower, 0);
    assert.equal(result.player.talentGrade, "F");
    assert.equal(result.player.level, 0);
    assert.equal(result.player.rank, "无魂力");
    assert.equal(result.player.soulPowerGrowthLocked, true);
    assert.equal(result.player.martialSouls.length, 1);
    assert.equal(result.player.martialSouls[0].slot, 1);
    assert.equal(result.player.martialSouls[0].qualityGrade, "low");
    assert.equal(result.player.activeMartialSoulInstanceId, "martial_soul_age_6_slot_1");
    assert.deepEqual(result.spins.map(spin => spin.selectionKind), [
        "innate_soul_power",
        "martial_soul_count",
        "martial_soul_quality",
        "martial_soul_form",
        "martial_soul_definition"
    ]);
    assert.equal(result.spins.length, 5);
    assert.deepEqual(result.player.spinHistory, result.spins);
    assert.equal(result.player.history.length, 1);
    assert.deepEqual(result.player.history[0], result.annualRecord);
    assert.equal(result.annualRecord.age, 6);
    assert.equal(result.annualRecord.nextAge, 7);
    assert.equal(result.annualRecord.advance, "next_year");
    assert.equal(result.annualRecord.result.innateSoulPower, 0);
    assert.equal(result.annualRecord.result.martialSoulCount, 1);
    assert.equal(result.combatPower.total, 0);
    assert.equal(result.combatPower.breakdown.level, 0);
    assert.equal(result.combatPower.breakdown.martialSoulQuality, 0);
    assert.equal(Object.hasOwn(result.player, "combatPower"), false);
    assert.equal(Object.hasOwn(result.player, "staticCombatPower"), false);
    assert.equal(Object.hasOwn(result.player, "effectiveCombatPower"), false);
    assert.equal(first.rng.calls(), 5);
});

test("four-slot awakening shares one quality and remains ordered, unique, equal-weight, and audited", () => {
    const { result, rng } = runAwakening({
        values: fourBodyExtremeSequence(),
        sessionId: "age_6_four_unique"
    });
    const souls = result.player.martialSouls;
    const ids = souls.map(soul => soul.definitionId);
    const definitionSpins = result.spins.filter(spin => {
        return spin.selectionKind === "martial_soul_definition";
    });
    const qualitySpins = result.spins.filter(spin => {
        return spin.selectionKind === "martial_soul_quality";
    });

    assert.equal(result.player.age, 7);
    assert.equal(result.player.innateSoulPower, 20);
    assert.equal(result.player.level, 20);
    assert.equal(souls.length, 4);
    assert.deepEqual(souls.map(soul => soul.slot), [1, 2, 3, 4]);
    assert.equal(new Set(ids).size, 4);
    assert.equal(new Set(souls.map(soul => soul.instanceId)).size, 4);
    assert.equal(result.player.activeMartialSoulInstanceId, souls[0].instanceId);
    assert.ok(souls.every(soul => soul.qualityGrade === "extreme"));
    assert.equal(result.session.result.qualityGrade, "extreme");
    assert.equal(result.spins.length, 11);
    assert.equal(result.player.spinHistory.length, 11);
    assert.equal(rng.calls(), 11);
    assert.deepEqual(definitionSpins.map(spin => spin.eligibleCount), [6, 5, 4, 3]);
    assert.ok(definitionSpins.every(spin => spin.itemWeight === 1));
    assert.ok(definitionSpins.every(spin => spin.details.equalWeight === true));
    assert.equal(qualitySpins.length, 1);
    assert.equal(qualitySpins[0].slot, null);
    assert.equal(qualitySpins[0].details.innateSoulPower, 20);
    assert.equal(qualitySpins[0].details.sharedAcrossSlots, true);
    assert.deepEqual(qualitySpins[0].details.appliesToSlots, [1, 2, 3, 4]);
    assert.deepEqual(result.session.result.definitionIds, ids);
    assert.equal(result.session.result.slots.length, 4);
    assert.ok(result.session.result.slots.every(slot => {
        return slot.qualityGrade === "extreme";
    }));
});

test("catalog exhaustion produces a structured error and rolls back the whole year", () => {
    const inputs = productionInputs();
    const reducedCell = inputs.catalog.definitions.filter(definition => {
        return definition.form === "body" && definition.qualityGrade === "extreme";
    });
    reducedCell.slice(3).forEach(definition => {
        definition.form = "tool";
    });
    const player = createAgeSixPlayer();
    const before = clone(player);
    const runner = createRunner({ ...inputs, player });
    const rng = sequenceRng(fourBodyExtremeSequence());

    assert.throws(() => {
        runner.run({
            player,
            sessionId: "age_6_catalog_exhaustion",
            seed: "age_6_catalog_exhaustion_seed",
            rng
        });
    }, error => {
        assert.equal(error.code, "NO_ELIGIBLE_MARTIAL_SOUL_DEFINITION");
        assert.equal(error.details.slot, 4);
        assert.equal(error.details.form, "body");
        assert.equal(error.details.qualityGrade, "extreme");
        assert.deepEqual(error.details.allowedCanonLevels, ["canon", "expanded"]);
        assert.equal(error.details.excludedDefinitionIds.length, 3);
        return true;
    });
    assert.deepEqual(player, before);
    assert.equal(player.age, 6);
    assert.deepEqual(player.martialSouls, []);
    assert.deepEqual(player.spinHistory, []);
    assert.deepEqual(player.history, []);
});

test("every production failure injection point preserves the complete input Player", async t => {
    const points = [
        "after_innate_soul_power",
        "after_martial_soul_count",
        "after_shared_quality",
        "after_slot_form",
        "during_definition_draw",
        "during_materialization",
        "before_final_player_validation"
    ];

    for (const point of points) {
        await t.test(point, () => {
            const inputs = productionInputs();
            const player = createAgeSixPlayer();
            const before = clone(player);
            const runner = createRunner({
                ...inputs,
                player,
                failureInjector(actualPoint) {
                    if (actualPoint === point) {
                        const error = new Error(`Injected failure at ${point}`);
                        error.code = "INJECTED_AWAKENING_FAILURE";
                        throw error;
                    }
                }
            });

            assert.throws(() => {
                runner.run({
                    player,
                    sessionId: `failure_${point}`,
                    seed: `failure_${point}_seed`,
                    rng: sequenceRng(fourBodyExtremeSequence())
                });
            }, error => error.code === "INJECTED_AWAKENING_FAILURE");
            assert.deepEqual(player, before);
        });
    }
});
