import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
    calculate,
    calculateContinuousLevelPower,
    calculateLevelPower,
    calculateSoulBonePower,
    calculateSoulBonesPower,
    calculateSoulRingPower,
    calculateSoulRingsPower,
    validateRules
} from "../js/combat-power.js";

const testDirectory = dirname(fileURLToPath(import.meta.url));
const rulesPath = resolve(testDirectory, "../data/config/combat-power.json");
const baseRules = JSON.parse(readFileSync(rulesPath, "utf8"));

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) {
        return value;
    }

    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
    return value;
}

function createAcceptanceRules() {
    const rules = clone(baseRules);

    rules.level.cumulativeBonusAnchors = [
        {
            id: "fixture_unallocated_breakthrough_total_through_99",
            mode: "cumulative_total_anchor",
            anchorLevel: 99,
            cumulativeBonus: 220,
            allocationStatus: "unallocated",
            fixtureOnly: true,
            status: "provisional",
            reason: "仅表示截至99级累计额外战力，不决定各突破等级的分配"
        }
    ];

    return rules;
}

function topRing(years) {
    return {
        years,
        ringType: "non_divine",
        soulBeastBloodlineGrade: "top"
    };
}

function divineGoldRing() {
    return {
        ringType: "divine_gold"
    };
}

function topSoulBone(years, extra = {}) {
    return {
        years,
        soulBeastBloodlineGrade: "top",
        ...extra
    };
}

test("continuous level curve keeps all confirmed mathematical anchors", () => {
    const levelRules = baseRules.level;

    assert.equal(calculateContinuousLevelPower(10, levelRules), 10);
    assert.equal(calculateContinuousLevelPower(20, levelRules), 30);
    assert.equal(calculateContinuousLevelPower(30, levelRules), 60);
    assert.equal(calculateContinuousLevelPower(99, levelRules), 540);
    assert.equal(calculateContinuousLevelPower(100, levelRules), 550);
    assert.equal(calculateContinuousLevelPower(169, levelRules), 1513);
});

test("base rules expose unresolved 99 and 100 total anchors instead of hiding 220 points", () => {
    const validation = validateRules(baseRules);
    const unresolvedLevels = validation.warnings
        .filter(warning => warning.code === "LEVEL_ANCHOR_UNRESOLVED")
        .map(warning => warning.path)
        .sort();

    assert.equal(validation.valid, true);
    assert.deepEqual(unresolvedLevels, [
        "level.validationAnchors[3]",
        "level.validationAnchors[4]"
    ]);
    assert.equal(calculateLevelPower(99, baseRules), 540);
    assert.equal(calculateLevelPower(100, baseRules), 1040);
});

test("rules validator rejects unsupported first-phase strategy changes", () => {
    const invalidRules = clone(baseRules);

    invalidRules.rounding.minimumOrdinaryItemPower = 0;
    invalidRules.martialSoulAvatar.mode = "all_active";

    const validation = validateRules(invalidRules);

    assert.equal(validation.valid, false);
    assert.ok(validation.errors.some(error => error.code === "INVALID_ROUNDING_RULES"));
    assert.ok(validation.errors.some(error => {
        return error.code === "UNSUPPORTED_MARTIAL_SOUL_AVATAR_STRATEGY";
    }));
});

test("soul ring brackets, bloodline multipliers, and divine gold fixed power match anchors", () => {
    assert.equal(calculateSoulRingPower({
        years: 5000,
        soulBeastBloodlineGrade: "ordinary"
    }, baseRules), 11);
    assert.equal(calculateSoulRingPower({
        years: 5000,
        soulBeastBloodlineGrade: "low"
    }, baseRules), 1);
    assert.equal(calculateSoulRingPower({
        years: 5000,
        soulBeastBloodlineGrade: "top"
    }, baseRules), 22);
    assert.equal(calculateSoulRingPower({
        years: 5000,
        soulBeastBloodlineGrade: "pure_dragon"
    }, baseRules), 33);
    assert.equal(calculateSoulRingPower({
        years: 5000,
        sourceType: "god_bestowed",
        qualityMultiplier: 2
    }, baseRules), 22);
    assert.equal(calculateSoulRingPower({
        years: 200000,
        soulBeastBloodlineGrade: "top"
    }, baseRules), 80);
    assert.equal(calculateSoulRingPower({
        ringType: "divine_gold",
        soulBeastBloodlineGrade: "unknown"
    }, baseRules), 1000);
});

test("invalid 1-9 year rings and unknown bloodline grades are reported and skipped", () => {
    const warnings = [];

    assert.equal(calculateSoulRingPower({
        years: 9,
        soulBeastBloodlineGrade: "ordinary"
    }, baseRules, warnings, "ringUnderReview"), 0);
    assert.equal(calculateSoulRingPower({
        years: 5000,
        soulBeastBloodlineGrade: "unconfirmed_grade"
    }, baseRules, warnings, "ringUnknownBloodline"), 0);
    assert.ok(warnings.some(warning => warning.code === "ILLEGAL_SOUL_ITEM_YEARS"));
    assert.ok(warnings.some(warning => warning.code === "UNKNOWN_SOUL_BEAST_BLOODLINE_GRADE"));
});

test("99-level acceptance fixture reproduces ring, bone, and total anchors without mutating input", () => {
    const rules = createAcceptanceRules();

    rules.coefficientModules.domains.definitions.limit_domain_fixture = {
        coefficient: 0.2,
        status: "provisional"
    };
    rules.coefficientModules.attributes.definitions.attribute_fixture_99 = {
        coefficient: 0.22,
        status: "provisional"
    };

    const player = {
        level: 99,
        combatBase: {
            mode: "level"
        },
        activeMartialSoulInstanceId: "extreme_martial_soul_instance_fixture",
        martialSouls: [
            {
                instanceId: "extreme_martial_soul_instance_fixture",
                definitionId: "extreme_martial_soul_fixture",
                evolutionFamilyId: "extreme_martial_soul_family_fixture",
                qualityGrade: "extreme",
                avatarGrade: "extreme",
                soulRings: [
                    topRing(100),
                    topRing(500),
                    topRing(1000),
                    topRing(5000),
                    topRing(10000),
                    topRing(10000),
                    topRing(50000),
                    topRing(50000),
                    topRing(100000)
                ]
            }
        ],
        soulBones: {
            head: topSoulBone(50000),
            torso: topSoulBone(50000),
            leftArm: topSoulBone(50000),
            rightArm: topSoulBone(50000),
            leftLeg: topSoulBone(50000),
            rightLeg: topSoulBone(100000),
            external: null
        },
        domains: [
            {
                definitionId: "limit_domain_fixture"
            }
        ],
        combatAttributes: [
            {
                definitionId: "attribute_fixture_99"
            }
        ]
    };
    const frozenPlayer = deepFreeze(player);
    const frozenRules = deepFreeze(rules);
    const beforePlayer = JSON.stringify(frozenPlayer);
    const beforeRules = JSON.stringify(frozenRules);

    assert.equal(calculateSoulRingsPower(frozenPlayer, frozenRules), 262);
    assert.equal(calculateSoulBonePower(
        frozenPlayer.soulBones.head,
        frozenRules
    ), 42);
    assert.deepEqual(
        calculateSoulBonesPower(frozenPlayer, 760, frozenRules),
        {
            soulBones: 270,
            divineArmor: 0
        }
    );

    const result = calculate(frozenPlayer, frozenRules);

    assert.equal(calculateLevelPower(99, frozenRules), 760);
    assert.deepEqual(result.breakdown, {
        level: 760,
        martialSoulQuality: 228,
        martialSoulAvatar: 228,
        soulRings: 262,
        soulBones: 270,
        divineArmor: 0,
        domains: 152,
        attributes: 167,
        soulCore: 0,
        deity: 0,
        artifacts: 0,
        titles: 0,
        other: 0
    });
    assert.equal(result.total, 2067);
    assert.equal(result.rulesVersion, "combat-power/1.0");
    assert.ok(result.warnings.some(warning => {
        return warning.code === "PROVISIONAL_CUMULATIVE_LEVEL_ANCHOR";
    }));
    assert.equal(JSON.stringify(frozenPlayer), beforePlayer);
    assert.equal(JSON.stringify(frozenRules), beforeRules);
});

test("100-level Seagod acceptance reconstruction reaches 14288 with explicit provisional rules", () => {
    const rules = createAcceptanceRules();

    rules.coefficientModules.domains.definitions.sea_domain_fixture = {
        coefficient: 0.15,
        status: "provisional"
    };
    rules.coefficientModules.domains.definitions.killing_domain_fixture = {
        coefficient: 0.15,
        status: "provisional"
    };
    rules.coefficientModules.attributes.definitions.attribute_fixture_100 = {
        coefficient: 0.6865,
        status: "provisional"
    };
    rules.divineArmor.setBonuses.divine_armor_set_fixture = {
        mode: "fixed",
        power: 800,
        status: "provisional"
    };
    rules.entityContributionModules.deity.definitions.deity_fixture = {
        mode: "level_coefficient",
        coefficient: 2,
        status: "provisional"
    };
    rules.entityContributionModules.artifacts.definitions.artifact_fixture = {
        mode: "fixed",
        power: 800,
        status: "provisional"
    };
    rules.entityContributionModules.other.definitions.other_fixture = {
        mode: "fixed",
        power: 800,
        status: "provisional"
    };

    const divineArmorState = {
        equipmentState: "divine_armor"
    };
    const player = deepFreeze({
        level: 100,
        combatBase: {
            mode: "level"
        },
        activeMartialSoulInstanceId: "clear_sky_hammer_instance_fixture",
        martialSouls: [
            {
                instanceId: "blue_silver_emperor_instance_fixture",
                definitionId: "blue_silver_emperor_fixture",
                evolutionFamilyId: "blue_silver_family_fixture",
                qualityGrade: "top",
                avatarGrade: "top",
                soulRings: [
                    ...Array.from({ length: 9 }, () => topRing(100000)),
                    divineGoldRing()
                ]
            },
            {
                instanceId: "clear_sky_hammer_instance_fixture",
                definitionId: "clear_sky_hammer",
                evolutionFamilyId: "hammer_clear_sky_family",
                qualityGrade: "top",
                avatarGrade: "top",
                soulRings: [
                    ...Array.from({ length: 3 }, () => topRing(100000)),
                    ...Array.from({ length: 5 }, () => topRing(200000)),
                    topRing(1000000),
                    divineGoldRing()
                ]
            }
        ],
        soulBones: {
            head: topSoulBone(100000, divineArmorState),
            torso: topSoulBone(100000, divineArmorState),
            leftArm: topSoulBone(100000, divineArmorState),
            rightArm: topSoulBone(100000, divineArmorState),
            leftLeg: topSoulBone(200000, divineArmorState),
            rightLeg: topSoulBone(200000, divineArmorState),
            external: topSoulBone(1000000, divineArmorState)
        },
        divineArmorSets: [
            {
                definitionId: "divine_armor_set_fixture"
            }
        ],
        domains: [
            {
                definitionId: "sea_domain_fixture"
            },
            {
                definitionId: "killing_domain_fixture"
            }
        ],
        combatAttributes: [
            {
                definitionId: "attribute_fixture_100"
            }
        ],
        deities: [
            {
                definitionId: "deity_fixture"
            }
        ],
        artifacts: [
            {
                definitionId: "artifact_fixture"
            }
        ],
        otherCombatSources: [
            {
                definitionId: "other_fixture"
            }
        ]
    });
    const frozenRules = deepFreeze(rules);
    const result = calculate(player, frozenRules);

    assert.equal(calculateLevelPower(100, frozenRules), 1260);
    assert.equal(calculateSoulRingsPower(player, frozenRules), 3520);
    assert.deepEqual(
        calculateSoulBonesPower(player, 1260, frozenRules),
        {
            soulBones: 0,
            divineArmor: 3200
        }
    );
    assert.deepEqual(result.breakdown, {
        level: 1260,
        martialSoulQuality: 630,
        martialSoulAvatar: 315,
        soulRings: 3520,
        soulBones: 0,
        divineArmor: 3200,
        domains: 378,
        attributes: 865,
        soulCore: 0,
        deity: 2520,
        artifacts: 800,
        titles: 0,
        other: 800
    });
    assert.equal(result.total, 14288);
    assert.ok(result.warnings.some(warning => {
        return warning.code === "PROVISIONAL_CUMULATIVE_LEVEL_ANCHOR";
    }));
    assert.ok(result.warnings.some(warning => {
        return warning.code === "PROVISIONAL_RULE_APPLIED";
    }));
    assert.ok(result.warnings.some(warning => {
        return warning.code === "PROVISIONAL_DIVINE_ARMOR_RULE_APPLIED";
    }));
});
