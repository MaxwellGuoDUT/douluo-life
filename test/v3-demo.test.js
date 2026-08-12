import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

import {
    assertValidV3DemoConfig,
    createV3Demo,
    validateV3DemoConfig,
    V3_DEMO_PHASES,
    V3_DEMO_STATUS
} from "../js/v3-demo.js";

function readJson(path) {
    return JSON.parse(readFileSync(resolve(path), "utf8"));
}

const v3Config = readJson("data/config/v3-demo.json");
const talentConfig = readJson("data/config/talent.json");
const combatRules = readJson("data/config/combat-power.json");
const legacyData = readJson("data/reference/legacy-wheel/wheels.normalized.json");
const awakeningDataset = readJson("data/v2/content/age-6-awakening.json");
const awakeningCatalog = readJson("data/v2/catalogs/martial-souls.json");
const awakeningProbabilityConfig = readJson("data/v2/config/awakening-probabilities.json");
const v3Html = readFileSync("v3-demo.html", "utf8");
const v3App = readFileSync("js/v3-demo-app.js", "utf8");

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function createDemo({ rng = () => 0.999999, combat = combatRules } = {}) {
    return createV3Demo({
        v3Config,
        talentConfig,
        combatRules: combat,
        legacyData,
        awakeningData: {
            dataset: awakeningDataset,
            catalog: awakeningCatalog,
            probabilityConfig: awakeningProbabilityConfig
        },
        rng
    });
}

test("V3 config validates as a separate provisional demo and preserves the old reference boundary", () => {
    assert.equal(validateV3DemoConfig(v3Config).valid, true);
    assert.doesNotThrow(() => assertValidV3DemoConfig(v3Config));
    assert.equal(v3Config.status, "provisional");
    assert.equal(v3Config.source.sourceStatus, "REFERENCE DATA ONLY");
    assert.equal(v3Config.source.productionEligible, false);
    assert.equal(v3Config.awakening.mode, "production_runtime_isolated");
    assert.equal(v3Config.awakening.status, "provisional");
    assert.equal(v3Config.animation.durationMs, 450);
    assert.equal(awakeningDataset.contentStatus, "production");
    assert.equal(awakeningCatalog.status, "production");
    assert.equal(awakeningProbabilityConfig.status, "production");
    assert.deepEqual(v3Config.breakthroughs.levels, [10, 20, 30, 40, 50, 60, 70, 80, 90]);
    assert.equal(v3Config.soulBones.probability, 0.05);
});

test("V3 main page keeps state and audit details inside a collapsible side panel", () => {
    const mainMarkup = v3Html.match(/<main[\s\S]*?<\/main>/i)?.[0] ?? "";
    const sideMarkup = v3Html.match(/<details[\s\S]*?<\/details>/i)?.[0] ?? "";

    assert.equal((v3Html.match(/id="advanceButton"/g) ?? []).length, 1);
    assert.equal(v3Html.includes("var(--spin-duration, .45s)"), true);
    assert.equal(v3App.includes("state.config?.animation?.durationMs ?? 450"), true);
    assert.equal(mainMarkup.includes("statusValue"), false);
    assert.equal(mainMarkup.includes("ringsValue"), false);
    assert.equal(mainMarkup.includes("rulesValue"), false);
    assert.equal(mainMarkup.includes("currentEventTitle"), true);
    assert.equal(sideMarkup.includes("statusValue"), true);
    assert.equal(sideMarkup.includes("ringsValue"), true);
    assert.equal(sideMarkup.includes("rulesValue"), true);
});

test("V3 starts with an exclusive birth identity at age 0 and applies it at talent draw", () => {
    const demo = createDemo({ rng: () => 0.2 });
    const started = demo.start();

    assert.equal(started.age, 0);
    assert.equal(started.phase, V3_DEMO_PHASES.TALENT_PENDING);
    assert.equal(started.status, V3_DEMO_STATUS.IDENTITY_DRAWN);
    assert.equal(started.identity.identityId, "royal_knight_commander_child");
    assert.equal(started.currentEvent.text.includes("每次时间跳跃可额外获得等级+1"), true);
    assert.equal(started.identity.eligibleIdentityIds.includes("reincarnator"), false);

    const talent = demo.drawTalent({ innateSoulPower: 10 });
    assert.equal(talent.age, 6);
    assert.equal(talent.phase, V3_DEMO_PHASES.CULTIVATING);
    assert.equal(talent.level, 1);
    assert.equal(talent.talent.innateSoulPower, 10);
    assert.equal(talent.talent.talentGrade, "S");
    assert.equal(talent.awakening.martialSoulCount >= 1, true);
    assert.equal(talent.player.martialSouls.length, talent.awakening.martialSoulCount);
    assert.equal(talent.currentEvent.type, "awakening");
    assert.equal(talent.currentEvent.text.includes("武魂抽取结果："), true);
    assert.equal(typeof talent.awakening.narrative, "string");
    assert.equal(talent.history.filter(record => record.type === "narrative").length, 6);
});

test("the one-button timeline advances exactly one year per call and draws talent at age 6", () => {
    const demo = createDemo({ rng: () => 0.999999 });

    let state = demo.advanceYear();
    assert.equal(state.age, 1);
    assert.equal(state.identity.identityId, "luck_child");
    assert.equal(state.phase, V3_DEMO_PHASES.TALENT_PENDING);

    state = demo.advanceYear();
    assert.equal(state.age, 2);
    state = demo.advanceYear();
    assert.equal(state.age, 3);
    state = demo.advanceYear();
    assert.equal(state.age, 4);
    state = demo.advanceYear();
    assert.equal(state.age, 5);
    state = demo.advanceYear({ innateSoulPower: 10 });
    assert.equal(state.age, 6);
    assert.equal(state.talent.talentGrade, "S");
    assert.equal(state.level, 1);

    state = demo.advanceYear();
    assert.equal(state.age, 7);
    assert.equal(state.level, 8);
});

test("annual cultivation uses the existing talent pool and immediate identity bonuses", () => {
    const rolls = [0.2, 0.999999];
    const demo = createDemo({
        rng: () => rolls.shift() ?? 0.999999
    });
    demo.start();
    demo.drawTalent({ innateSoulPower: 10 });
    const nextYear = demo.cultivateYear();

    assert.equal(nextYear.age, 7);
    assert.equal(nextYear.level, 10);
    assert.equal(nextYear.history.some(record => record.type === "breakthrough" && record.breakthroughLevel === 10), true);
    assert.equal(nextYear.breakthroughs[0].ring.slot, 1);
    assert.equal(nextYear.breakthroughs[0].ring.legacyWheelId, 67);
    assert.equal(nextYear.breakthroughs[0].ring.years, 100000);
    assert.equal(nextYear.player.martialSouls[0].soulRings.length, 1);
    assert.equal(nextYear.combatPower.breakdown.soulRings > 0, true);
    assert.equal(nextYear.currentEvent.text.includes("等级+7，这一年你陷入了顿悟。"), true);
});

test("the current event explains a negative annual growth draw", () => {
    const demo = createDemo({ rng: () => 0.2 });
    demo.start();
    const state = demo.drawTalent({ innateSoulPower: 1 });
    assert.equal(state.level, 1);

    const nextYear = demo.cultivateYear();
    assert.equal(nextYear.currentEvent.type, "cultivation");
    assert.equal(nextYear.currentEvent.text.includes("心魔经常在纠缠你"), true);
    assert.equal(nextYear.history.at(-1).growth.drawnDelta, -2);
});

test("a breakthrough performs a 5% soul-bone event using old-wheel reward text", () => {
    const rolls = [0.2, 0, 0, 0, 0, 0.999999, 0.999999, 0, 0];
    const demo = createDemo({
        rng: () => rolls.shift() ?? 0.999999
    });
    demo.start();
    demo.drawTalent({ innateSoulPower: 10 });
    const state = demo.cultivateYear();

    assert.equal(state.breakthroughs[0].soulBone.legacyWheelId, 71);
    assert.equal(state.breakthroughs[0].soulBone.itemIndex, 4);
    assert.equal(state.player.soulBones.length, 1);
    assert.equal(state.player.soulBones[0].years, 100000);
    assert.equal(state.player.soulBones[0].slot, "head");
});

test("level 0 follows the observer terminal route at the 6-year talent draw", () => {
    const demo = createDemo({ rng: () => 0 });
    demo.start();
    const finished = demo.drawTalent({ innateSoulPower: 0 });

    assert.equal(finished.status, V3_DEMO_STATUS.IGNORED);
    assert.equal(finished.phase, V3_DEMO_PHASES.TERMINAL);
    assert.equal(finished.gameOver, true);
    assert.equal(finished.outcome, "ignored");
    assert.equal(finished.player.soulRings.length, 0);
    assert.equal(finished.player.soulBones.length, 0);
});

test("automatic cultivation crosses every ten-level breakthrough and uses the explicit post-90 fixture", () => {
    const demo = createDemo();
    demo.start();
    demo.drawTalent({ innateSoulPower: 10 });
    const finished = demo.autoCultivate({ maxYears: 200 });

    assert.equal(finished.level, 100);
    assert.equal(finished.phase, V3_DEMO_PHASES.TERMINAL);
    assert.equal(finished.gameOver, true);
    assert.equal(finished.breakthroughs.length, 9);
    assert.deepEqual(
        finished.breakthroughs.map(breakthrough => breakthrough.level),
        [10, 20, 30, 40, 50, 60, 70, 80, 90]
    );
    assert.equal(finished.breakthroughs.find(breakthrough => breakthrough.level === 80).ring.legacyWheelId, 632);
    assert.equal(finished.breakthroughs.find(breakthrough => breakthrough.level === 80).ring.years, 990000);
    assert.equal(finished.history.some(record => record.growth?.code === "V3_POST_90_FIXTURE_GROWTH"), true);
    assert.equal(finished.battle.opponentName, "比比东");
    assert.equal(finished.battle.opponentCombatPower, 1500);
    assert.equal(finished.outcome, "success");
});

test("battle succeeds when the injected combat rules produce at least 1500 static power", () => {
    const boostedRules = clone(combatRules);
    boostedRules.level.powerEntries = boostedRules.level.powerEntries.map(entry => {
        return entry.level === 100
            ? { ...entry, power: 1500 }
            : entry;
    });
    boostedRules.level.validationAnchors = boostedRules.level.validationAnchors.map(anchor => {
        return anchor.kind === "total" && anchor.level === 100
            ? { ...anchor, expectedPower: 1500 }
            : anchor;
    });

    const demo = createDemo({ combat: boostedRules });
    demo.start();
    demo.drawTalent({ innateSoulPower: 10 });
    const finished = demo.autoCultivate({ maxYears: 200 });

    assert.equal(finished.outcome, "success");
    assert.equal(finished.battle.playerCombatPower >= 1500, true);
    assert.equal(finished.message.includes("游戏成功结束"), true);
});

test("V3 runtime does not mutate old-wheel, talent, or combat input objects", () => {
    const beforeLegacy = clone(legacyData);
    const beforeTalent = clone(talentConfig);
    const beforeCombat = clone(combatRules);
    const demo = createDemo();
    demo.start();
    demo.drawTalent({ innateSoulPower: 10 });
    demo.cultivateYear();

    assert.deepEqual(legacyData, beforeLegacy);
    assert.deepEqual(talentConfig, beforeTalent);
    assert.deepEqual(combatRules, beforeCombat);
});
