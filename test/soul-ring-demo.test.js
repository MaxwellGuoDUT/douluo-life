import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

import {
    assertValidLegacyWheelData,
    assertValidSoulRingDemoConfig,
    createSoulRingDemo,
    getCandidateWheels,
    getSelectableWheelItems,
    parseChineseInteger,
    parseLegacyYearCandidate,
    resolveCandidateYears,
    validateLegacyWheelData,
    validateSoulRingDemoConfig,
    SOUL_RING_DEMO_PHASES,
    SOUL_RING_DEMO_STATUS
} from "../js/soul-ring-demo.js";

function readJson(path) {
    return JSON.parse(readFileSync(resolve(path), "utf8"));
}

const config = readJson("data/config/soul-ring-demo.json");
const legacyData = readJson("data/reference/legacy-wheel/wheels.normalized.json");

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function createDemo({ level = 10, rng = () => 0.5 } = {}) {
    return createSoulRingDemo({
        legacyData,
        config,
        player: { level, soulRings: [] },
        rng
    });
}

function beginFirstRing(demo) {
    demo.begin({ slot: 1 });
    demo.selectWheel("legacy_wheel_67");
    return demo;
}

test("temporary soul-ring config and legacy source remain provisional and reference-only", () => {
    assert.equal(validateSoulRingDemoConfig(config).valid, true);
    assert.equal(validateLegacyWheelData(legacyData).valid, true);
    assert.doesNotThrow(() => assertValidSoulRingDemoConfig(config));
    assert.doesNotThrow(() => assertValidLegacyWheelData(legacyData));
    assert.equal(config.status, "provisional");
    assert.equal(config.source.sourceStatus, "REFERENCE DATA ONLY");
    assert.equal(config.source.productionEligible, false);
    assert.equal(config.yearResolution.testOnlyFixedYears, 18000);
    assert.equal(config.yearResolution.testOnlyFixedYearsEnabledInBrowser, false);
    assert.equal(validateSoulRingDemoConfig(config).warnings[0].status, "provisional");
    assert.equal(validateLegacyWheelData(legacyData).warnings[0].status, "provisional");
});

test("legacy year text parser handles Arabic, Chinese, ranges, open upper bounds, and unresolved text", () => {
    assert.equal(parseChineseInteger("一万八千"), 18000);
    assert.equal(parseChineseInteger("两万两千"), 22000);
    assert.equal(parseChineseInteger("764年"), 764);

    assert.deepEqual(parseLegacyYearCandidate("一万六千～一万八千年（心愿甲虫）"), {
        status: "parsed",
        rawText: "一万六千～一万八千年（心愿甲虫）",
        minYears: 16000,
        maxYears: 18000,
        exactYears: null,
        rangeType: "closed_range"
    });
    assert.equal(parseLegacyYearCandidate("十万年之上（十万年魂兽献祭）").minYears, 100000);
    assert.equal(parseLegacyYearCandidate("423年").exactYears, 423);
    assert.equal(parseLegacyYearCandidate("十万年之上（十万年魂兽献祭）").maxYears, null);
    assert.equal(parseLegacyYearCandidate("特殊未解析文本").status, "unresolved");
});

test("slot lookup keeps multiple legacy routes manual and excludes 第二武魂 titles", () => {
    const firstRingWheels = getCandidateWheels(legacyData, 1, config);
    assert.equal(firstRingWheels.some(wheel => wheel.legacyWheelId === 67), true);
    assert.equal(firstRingWheels.some(wheel => wheel.title.includes("第二武魂")), false);
    assert.equal(getCandidateWheels(legacyData, 8, config).length, 0);

    const mixedWheel = getCandidateWheels(legacyData, 3, config)
        .find(wheel => wheel.legacyWheelId === 69);
    assert.equal(mixedWheel.selectionMode, "manual_only");
    assert.equal(mixedWheel.hasNullWeight, true);
});

test("zero-weight legacy items are retained for audit but cannot be selected", () => {
    const items = getSelectableWheelItems(legacyData, "legacy_wheel_67");
    assert.equal(items.some(item => item.index === 1), false);
    assert.equal(items.some(item => item.index === 2), true);
    assert.equal(items.find(item => item.index === 2).selectionStatus, "weighted_eligible");
});

test("weighted first-ring draw records its provisional warning in the returned state", () => {
    const demo = beginFirstRing(createDemo({ rng: () => 0 }));
    const state = demo.drawWeightedCandidate();

    assert.equal(state.phase, SOUL_RING_DEMO_PHASES.YEAR_INPUT);
    assert.equal(state.selectedCandidate.itemIndex, 2);
    assert.equal(state.warnings.some(warning => warning.code === "LEGACY_WEIGHTED_ROLL"), true);
});

test("manual success commits a provisional ring and ends the game", () => {
    const demo = beginFirstRing(createDemo());
    demo.chooseCandidate(2);
    const waiting = demo.confirmYears({ years: 120 });
    assert.equal(waiting.phase, SOUL_RING_DEMO_PHASES.ABSORPTION);
    assert.equal(waiting.resolvedRing.sourceType, "legacy_reference_demo");
    assert.equal(waiting.resolvedRing.qualityMultiplier, null);

    const finished = demo.settleOutcome("success");
    assert.equal(finished.status, SOUL_RING_DEMO_STATUS.SUCCESS);
    assert.equal(finished.gameOver, true);
    assert.equal(finished.player.soulRings.length, 1);
    assert.equal(finished.player.soulRings[0].years, 120);
    assert.equal(finished.history.at(-1).ringCommitted, true);
});

test("manual failure ends the game without committing the ring", () => {
    const demo = beginFirstRing(createDemo());
    demo.chooseCandidate(2);
    demo.confirmYears({ years: 120 });

    const finished = demo.settleOutcome("failure");
    assert.equal(finished.status, SOUL_RING_DEMO_STATUS.FAILURE);
    assert.equal(finished.gameOver, true);
    assert.equal(finished.player.soulRings.length, 0);
    assert.equal(finished.history.at(-1).ringCommitted, false);
});

test("mixed/null legacy weights stay manual and do not become guessed probabilities", () => {
    const demo = createDemo();
    demo.begin({ slot: 3 });
    demo.selectWheel("legacy_wheel_69");
    const nullWeight = demo.listItems().find(item => item.index === 12);
    assert.equal(nullWeight.weight, null);
    assert.throws(
        () => demo.drawWeightedCandidate(),
        error => error.code === "LEGACY_WEIGHTS_UNRESOLVED"
    );

    const selected = demo.chooseCandidate(12);
    assert.equal(selected.phase, SOUL_RING_DEMO_PHASES.YEAR_INPUT);
    assert.equal(selected.warnings.some(warning => warning.code === "LEGACY_NULL_WEIGHT_MANUAL_SELECTION"), true);
    assert.throws(
        () => demo.drawWeightedCandidate(),
        error => error.code === "INVALID_DEMO_PHASE"
    );
});

test("18000 years is available only as an explicit test fixture", () => {
    const candidate = getSelectableWheelItems(legacyData, "legacy_wheel_399")
        .find(item => item.index === 2);

    assert.equal(candidate.parsedYears.minYears, 16000);
    assert.equal(candidate.parsedYears.maxYears, 18000);
    assert.equal(
        resolveCandidateYears(candidate, {
            fixedYears: 18000,
            testOnly: true,
            config
        }),
        18000
    );
    assert.throws(
        () => resolveCandidateYears(candidate, {
            fixedYears: 18000,
            testOnly: false,
            config
        }),
        error => error.code === "TEST_FIXTURE_ONLY"
    );
});

test("level 0 ignores the soul-ring flow and ends immediately without drawing", () => {
    let rngCalled = false;
    const demo = createDemo({
        level: 0,
        rng: () => {
            rngCalled = true;
            throw new Error("level 0 must not draw a wheel");
        }
    });

    const finished = demo.begin({ slot: 1 });
    assert.equal(finished.status, SOUL_RING_DEMO_STATUS.IGNORED);
    assert.equal(finished.phase, SOUL_RING_DEMO_PHASES.TERMINAL);
    assert.equal(finished.gameOver, true);
    assert.equal(finished.outcome, "ignored");
    assert.equal(rngCalled, false);
});

test("demo state is isolated from caller player, config, and legacy source objects", () => {
    const player = { level: 10, soulRings: [] };
    const beforePlayer = clone(player);
    const beforeConfig = clone(config);
    const beforeLegacyData = clone(legacyData);
    const demo = createSoulRingDemo({
        legacyData,
        config,
        player,
        rng: () => 0
    });

    beginFirstRing(demo).chooseCandidate(2);
    demo.confirmYears({ years: 120 });
    demo.settleOutcome("success");

    assert.deepEqual(player, beforePlayer);
    assert.deepEqual(config, beforeConfig);
    assert.deepEqual(legacyData, beforeLegacyData);
});
