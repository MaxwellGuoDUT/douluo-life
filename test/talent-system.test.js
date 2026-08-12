import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

import {
    applyGrowthDelta,
    assertValidTalentConfig,
    assertValidTalentRules,
    drawBirthIdentity,
    drawOpportunityPool,
    drawSpecialTalent,
    getMajorLevelMinimum,
    inheritReincarnatedState,
    mapInnateSoulPowerToTalentGrade,
    resolveAnnualGrowth,
    resolveBirthState,
    validateTalentConfig,
    validateTalentRules
} from "../js/talent-system.js";

function readJson(path) {
    return JSON.parse(readFileSync(resolve(path), "utf8"));
}

const config = readJson("data/config/talent.json");
const catalog = readJson("data/rules/talent.json");

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

test("talent catalog and runtime config preserve the independent Day16 boundary", () => {
    assert.equal(validateTalentRules(catalog).valid, true);
    assert.equal(validateTalentConfig(config).valid, true);
    assert.doesNotThrow(() => assertValidTalentRules(catalog));
    assert.doesNotThrow(() => assertValidTalentConfig(config));

    const warnings = validateTalentConfig(config).warnings;
    assert.deepEqual(
        warnings.map(warning => warning.path),
        [
            "pools.specialTalents",
            "pools.opportunity",
            "pools.encounterGrowth",
            "pools.soulCoreGrowth"
        ]
    );
    assert.equal(config.ruleCatalog.source, "talent.docx");
    assert.equal(config.rulesVersion, "talent/1.0");
});

test("all ordinary growth outcomes and identities retain their source narratives", () => {
    const grades = ["E", "D", "C", "B", "A", "S", "god-level"];
    grades.forEach(grade => {
        const configNarratives = config.ordinaryGrowth.pools[grade].items
            .map(item => item.narrative);
        assert.equal(configNarratives.every(text => typeof text === "string" && text.length > 0), true);
        assert.deepEqual(
            configNarratives,
            catalog.ordinaryGrowthPools.narrativesByTalentGrade[grade]
        );
    });

    const identities = config.birthIdentityRoll.items.map(item => item.narrative);
    assert.equal(identities.every(text => typeof text === "string" && text.length > 0), true);
    assert.deepEqual(
        identities,
        catalog.birthIdentities.entries.map(entry => entry.narrative)
    );

    const growth = resolveAnnualGrowth({
        config,
        currentLevel: 1,
        talentGrade: "S",
        rng: () => 0
    });
    assert.equal(
        growth.selectedResult.narrative,
        "等级+2，这一年你就随便玩玩，便得到了其他人拼命一整年都没有的提升。"
    );
});

test("innate soul power maps to talent grade without using combat coefficients", () => {
    const expected = new Map([
        [0, "F"],
        [1, "E"],
        [2, "D"],
        [3, "D"],
        [4, "C"],
        [5, "C"],
        [6, "B"],
        [7, "B"],
        [8, "A"],
        [9, "A"],
        [10, "S"],
        [20, "god-level"]
    ]);

    expected.forEach((grade, innateSoulPower) => {
        assert.equal(
            mapInnateSoulPowerToTalentGrade(innateSoulPower, config).talentGrade,
            grade
        );
    });
});

test("birth identities are equal-weight among eligible entries and remain exclusive", () => {
    const first = drawBirthIdentity({
        config,
        lifeNumber: 1,
        rng: () => 0
    });
    const last = drawBirthIdentity({
        config,
        lifeNumber: 1,
        rng: () => 0.999999
    });

    assert.equal(first.identityId, "rural_commoner");
    assert.equal(last.identityId, "luck_child");
    assert.equal(first.identityNarrative.includes("避免任何走火入魔"), true);
    assert.equal(first.eligibleIdentityIds.includes("reincarnator"), false);
    assert.equal(first.eligibleIdentityIds.length, 11);

    assert.throws(
        () => resolveBirthState({
            config,
            baseInnateSoulPower: 1,
            identityId: "reincarnator",
            lifeNumber: 1
        }),
        error => error.code === "IDENTITY_NOT_AVAILABLE_IN_LIFE"
    );
});

test("identity modifiers resolve at birth and preserve the two royal +1 bonuses", () => {
    const rural = resolveBirthState({
        config,
        baseInnateSoulPower: 1,
        identityId: "rural_commoner"
    });
    assert.equal(rural.innateSoulPower, 0);
    assert.equal(rural.talentGrade, "F");
    assert.equal(rural.removeNegativeGrowth, true);

    const soulMasterChild = resolveBirthState({
        config,
        baseInnateSoulPower: 10,
        identityId: "soul_master_child"
    });
    assert.equal(soulMasterChild.innateSoulPower, 10);
    assert.equal(soulMasterChild.martialSoulPolicy, "no_extreme");

    const royalChild = resolveBirthState({
        config,
        baseInnateSoulPower: 1,
        identityId: "royal_knight_commander_child"
    });
    assert.deepEqual(royalChild.annualGrowthBonuses, [1, 1]);

    const nobleChild = resolveBirthState({
        config,
        baseInnateSoulPower: 1,
        identityId: "noble_child"
    });
    assert.equal(nobleChild.annualMoneyDelta, 100);

    const divineReincarnated = resolveBirthState({
        config,
        baseInnateSoulPower: 0,
        identityId: "divine_reincarnated"
    });
    assert.equal(divineReincarnated.innateSoulPower, 20);
    assert.equal(divineReincarnated.talentGrade, "god-level");
    assert.equal(divineReincarnated.specialTalentPolicy, "fixed");
});

test("negative growth cannot cross the current major level floor", () => {
    assert.equal(getMajorLevelMinimum(20, config), 11);
    assert.equal(getMajorLevelMinimum(21, config), 21);
    assert.equal(getMajorLevelMinimum(30, config), 21);
    assert.equal(getMajorLevelMinimum(31, config), 31);
    assert.equal(applyGrowthDelta(21, -5, config), 21);
    assert.equal(applyGrowthDelta(31, -8, config), 31);
    assert.equal(applyGrowthDelta(1, -5, config), 1);
    assert.equal(applyGrowthDelta(20, -5, config), 15);
});

test("ordinary growth applies the selected pool, rural filtering, and level-90 boundary", () => {
    const level21 = resolveAnnualGrowth({
        config,
        currentLevel: 21,
        talentGrade: "E",
        rng: () => 0
    });
    assert.equal(level21.drawnDelta, -5);
    assert.equal(level21.nextLevel, 21);

    const rural = resolveAnnualGrowth({
        config,
        currentLevel: 21,
        talentGrade: "E",
        identityId: "rural_commoner",
        rng: () => 0
    });
    assert.equal(rural.drawnDelta, 0);
    assert.equal(rural.nextLevel, 21);

    const level90 = resolveAnnualGrowth({
        config,
        currentLevel: 90,
        talentGrade: "E",
        rng: () => 0
    });
    assert.equal(level90.lowerBound, 81);
    assert.equal(level90.nextLevel, 85);

    let rngCalled = false;
    const level91 = resolveAnnualGrowth({
        config,
        currentLevel: 91,
        talentGrade: "S",
        rng: () => {
            rngCalled = true;
            return 0;
        }
    });
    assert.equal(level91.status, "unresolved");
    assert.equal(level91.code, "SOUL_CORE_GROWTH_UNRESOLVED");
    assert.equal(rngCalled, false);

    const observer = resolveAnnualGrowth({
        config,
        currentLevel: 0,
        talentGrade: "F",
        rng: () => {
            throw new Error("civilian observer must not draw ordinary growth");
        }
    });
    assert.equal(observer.status, "civilian_observer");
    assert.equal(observer.nextLevel, 0);
});

test("royal commander child applies both annual +1 bonuses", () => {
    const result = resolveAnnualGrowth({
        config,
        currentLevel: 15,
        talentGrade: "E",
        identityId: "royal_knight_commander_child",
        rng: () => 0
    });

    assert.equal(result.drawnDelta, -5);
    assert.deepEqual(result.identityGrowthBonuses, [1, 1]);
    assert.equal(result.identityBonusTotal, 2);
    assert.equal(result.rawDelta, -3);
    assert.equal(result.nextLevel, 12);
});

test("sect child replaces a blocked encounter with a regenerated same-name ordinary result", () => {
    const fixture = clone(config);
    fixture.pools.encounterGrowth = {
        status: "fixture",
        entries: [
            {
                id: "encounter_e_minus_1",
                name: "E_-1",
                delta: 99,
                weight: 1
            }
        ]
    };

    const replaced = resolveAnnualGrowth({
        config: fixture,
        currentLevel: 15,
        talentGrade: "E",
        identityId: "sect_child",
        age: 11,
        requestedPool: "encounterGrowth",
        rng: () => 0
    });
    assert.equal(replaced.status, "replaced");
    assert.equal(replaced.poolId, "ordinary");
    assert.equal(replaced.replacement.originalResultName, "E_-1");
    assert.equal(replaced.selectedResult.name, "E_-1");
    assert.equal(replaced.drawnDelta, -1);
    assert.equal(replaced.nextLevel, 14);

    const allowed = resolveAnnualGrowth({
        config: fixture,
        currentLevel: 15,
        talentGrade: "E",
        identityId: "sect_child",
        age: 12,
        requestedPool: "encounterGrowth",
        rng: () => 0
    });
    assert.equal(allowed.status, "resolved");
    assert.equal(allowed.poolId, "encounterGrowth");
    assert.equal(allowed.nextLevel, 114);
});

test("empty special and opportunity pools remain explicit unresolved results while stacking draws", () => {
    const imperial = drawSpecialTalent({
        config,
        identityId: "imperial",
        rng: () => 0
    });
    assert.equal(imperial.status, "unresolved");
    assert.equal(imperial.guaranteed, true);
    assert.equal(imperial.code, "SPECIAL_TALENT_POOL_UNRESOLVED");

    const divineReincarnated = drawSpecialTalent({
        config,
        identityId: "divine_reincarnated",
        rng: () => {
            throw new Error("fixed divine reincarnation must not draw");
        }
    });
    assert.equal(divineReincarnated.status, "fixed");
    assert.equal(divineReincarnated.selectedTalentId, "divine_reincarnation");

    const traverser = drawSpecialTalent({
        config,
        identityId: "traverser",
        rng: () => 0
    });
    assert.equal(traverser.status, "forbidden");

    const luck = drawOpportunityPool({
        config,
        identityId: "luck_child",
        additionalDraws: 2,
        rng: () => {
            throw new Error("empty opportunity pool must not draw");
        }
    });
    assert.equal(luck.status, "unresolved");
    assert.equal(luck.drawCount, 3);
    assert.equal(luck.code, "OPPORTUNITY_POOL_UNRESOLVED");

    const annualLuck = resolveAnnualGrowth({
        config,
        currentLevel: 21,
        talentGrade: "B",
        identityId: "luck_child",
        rng: () => 0
    });
    assert.equal(annualLuck.opportunity.status, "unresolved");
    assert.equal(annualLuck.opportunity.drawCount, 1);
});

test("reincarnator state preserves names but regenerates entity instances", () => {
    const previousLife = {
        identityId: "reincarnator",
        innateSoulPower: 10,
        talentGrade: "S",
        talent: { grade: "S", marker: "previous" },
        identityTraits: { formerIdentity: "noble_child" },
        postnatalAttributes: [{ id: "attribute_1", value: 5 }],
        domains: [{ instanceId: "domain_old", name: "旧领域", coefficient: 0.1 }],
        skills: [{ instanceId: "skill_old", name: "旧技能", power: 10 }]
    };

    const nextLife = inheritReincarnatedState(previousLife, {
        instanceIdFactory: (oldId, entity, index) => `${oldId}_life2_${index + 1}`
    });

    assert.deepEqual(nextLife.talent, previousLife.talent);
    assert.deepEqual(nextLife.identityTraits, previousLife.identityTraits);
    assert.notEqual(nextLife.postnatalAttributes, previousLife.postnatalAttributes);
    assert.equal(nextLife.domains[0].name, "旧领域");
    assert.equal(nextLife.domains[0].instanceId, "domain_old_life2_1");
    assert.equal(nextLife.skills[0].name, "旧技能");
    assert.equal(nextLife.skills[0].instanceId, "skill_old_life2_1");
    assert.notEqual(nextLife.domains[0], previousLife.domains[0]);
    assert.notEqual(nextLife.skills[0], previousLife.skills[0]);
});

test("talent runtime calls do not mutate the configured source", () => {
    const before = JSON.stringify(config);
    resolveBirthState({
        config,
        baseInnateSoulPower: 5,
        identityId: "nothing_owned"
    });
    resolveAnnualGrowth({
        config,
        currentLevel: 21,
        talentGrade: "D",
        identityId: "rural_commoner",
        rng: () => 0.9
    });
    assert.equal(JSON.stringify(config), before);
});
