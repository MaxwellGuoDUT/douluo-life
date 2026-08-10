import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
    AWAKENING_FORMS,
    AWAKENING_INNATE_SOUL_POWER_VALUES,
    AWAKENING_QUALITY_GRADES,
    calculateCatalogExhaustionProbability,
    drawWeighted,
    validateAwakeningProbabilityConfig
} from "../js/production-awakening.js";

const testDirectory = dirname(fileURLToPath(import.meta.url));

function readJson(relativePath) {
    return JSON.parse(readFileSync(resolve(testDirectory, relativePath), "utf8"));
}

function sumWeights(items) {
    return items.reduce((sum, item) => sum + item.weight, 0);
}

function boundaryFor(items, field, value) {
    const index = items.findIndex(item => item[field] === value);
    assert.notEqual(index, -1);
    const totalWeight = sumWeights(items);
    return items.slice(0, index).reduce((sum, item) => sum + item.weight, 0)
        / totalWeight;
}

test("production probability config validates every integer-weight row", () => {
    const config = readJson("../data/v2/config/awakening-probabilities.json");
    const before = JSON.stringify(config);
    const validation = validateAwakeningProbabilityConfig(config);

    assert.equal(validation.valid, true, JSON.stringify(validation.errors));
    assert.equal(JSON.stringify(config), before);
    assert.equal(sumWeights(config.innateSoulPowerRoll.items), 1000);
    AWAKENING_INNATE_SOUL_POWER_VALUES.forEach(value => {
        const key = String(value);
        assert.equal(sumWeights(config.martialSoulCountRolls.byInnateSoulPower[key]), 10000);
        assert.equal(sumWeights(config.qualityRolls.byInnateSoulPower[key]), 10000);
    });
    assert.equal(config.formRoll.totalWeight, 1000);
    assert.equal(sumWeights(config.formRoll.items), 1000);
    assert.deepEqual(
        config.formRoll.items.map(item => item.weight),
        [340, 360, 200, 60, 40]
    );
    assert.equal(config.formRoll.dependsOnInnateSoulPower, false);
    assert.deepEqual(config.qualityRolls.slotPolicy, {
        mode: "shared_quality_per_awakening",
        drawCount: 1,
        hiddenDecay: false
    });
});

test("confirmed probability anchors stay separate from combat coefficients", () => {
    const config = readJson("../data/v2/config/awakening-probabilities.json");
    const combatRules = readJson("../data/config/combat-power.json");
    const innateByValue = new Map(config.innateSoulPowerRoll.items.map(item => {
        return [item.innateSoulPower, item];
    }));
    const quality20 = new Map(
        config.qualityRolls.byInnateSoulPower["20"].map(item => {
            return [item.qualityGrade, item.weight];
        })
    );

    assert.equal(innateByValue.get(0).weight / 1000, 0.05);
    assert.equal(innateByValue.get(20).weight / 1000, 0.005);
    assert.equal(quality20.get("extreme") / 10000, 0.5);
    assert.equal(Object.hasOwn(config.qualityRolls, "coefficients"), false);
    assert.deepEqual(combatRules.martialSoulQuality.coefficients, {
        low: 0,
        ordinary: 0.1,
        top: 0.25,
        extreme: 0.3
    });
    assert.equal(combatRules.martialSoulQuality.stacking.coefficientCap, 1);
});

test("weighted runtime honors exact innate-soul-power boundaries", () => {
    const config = readJson("../data/v2/config/awakening-probabilities.json");
    const items = config.innateSoulPowerRoll.items;

    [0, 1, 10, 20].forEach(value => {
        const randomValue = boundaryFor(items, "innateSoulPower", value);
        const result = drawWeighted(items, () => randomValue);
        assert.equal(result.item.innateSoulPower, value);
    });
});

test("weighted runtime honors exact one-through-four count boundaries", () => {
    const config = readJson("../data/v2/config/awakening-probabilities.json");
    const items = config.martialSoulCountRolls.byInnateSoulPower["6"];

    [1, 2, 3, 4].forEach(value => {
        const result = drawWeighted(items, () => boundaryFor(items, "count", value));
        assert.equal(result.item.count, value);
    });
});

test("weighted runtime honors all quality boundaries including innate-20 extreme at 50%", () => {
    const config = readJson("../data/v2/config/awakening-probabilities.json");
    const items = config.qualityRolls.byInnateSoulPower["20"];

    AWAKENING_QUALITY_GRADES.forEach(value => {
        const randomValue = boundaryFor(items, "qualityGrade", value);
        const result = drawWeighted(items, () => randomValue);
        assert.equal(result.item.qualityGrade, value);
    });
    assert.equal(boundaryFor(items, "qualityGrade", "extreme"), 0.5);
});

test("weighted runtime honors all five fixed form boundaries", () => {
    const config = readJson("../data/v2/config/awakening-probabilities.json");
    const items = config.formRoll.items;

    AWAKENING_FORMS.forEach(value => {
        const result = drawWeighted(items, () => boundaryFor(items, "form", value));
        assert.equal(result.item.form, value);
    });
});

test("approved four-per-cell capacity makes normal exhaustion probability exactly zero", () => {
    const config = readJson("../data/v2/config/awakening-probabilities.json");
    const catalog = readJson("../data/v2/catalogs/martial-souls.json");

    assert.equal(calculateCatalogExhaustionProbability(config, catalog), 0);
});

test("invalid RNG values and non-shared quality policies fail explicitly", () => {
    const config = readJson("../data/v2/config/awakening-probabilities.json");

    assert.throws(
        () => drawWeighted(config.innateSoulPowerRoll.items, () => 1),
        error => error.code === "INVALID_RNG_VALUE"
    );
    config.qualityRolls.slotPolicy.hiddenDecay = true;
    const validation = validateAwakeningProbabilityConfig(config);
    assert.equal(validation.valid, false);
    assert.ok(validation.errors.some(error => {
        return error.code === "INVALID_QUALITY_SLOT_POLICY";
    }));

    config.qualityRolls.slotPolicy = {
        mode: "same_distribution_each_slot",
        hiddenDecay: false
    };
    const independentSlotValidation = validateAwakeningProbabilityConfig(config);
    assert.equal(independentSlotValidation.valid, false);
    assert.ok(independentSlotValidation.errors.some(error => {
        return error.code === "INVALID_QUALITY_SLOT_POLICY";
    }));
});
