import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
    calculate,
    calculateContinuousLevelPower,
    calculateLevelPower,
    calculateMartialSoulQualityPower,
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
    return clone(baseRules);
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

test("level 0 and all four quality combat coefficients remain explicit", () => {
    const playerWith = qualities => ({
        martialSouls: qualities.map((qualityGrade, index) => ({
            instanceId: `soul_${index + 1}`,
            definitionId: `definition_${index + 1}`,
            evolutionFamilyId: `family_${index + 1}`,
            qualityGrade
        }))
    });

    assert.equal(calculateLevelPower(0, baseRules), 0);
    assert.equal(
        calculateMartialSoulQualityPower(playerWith(["low"]), 100, baseRules),
        0
    );
    assert.equal(
        calculateMartialSoulQualityPower(playerWith(["ordinary"]), 100, baseRules),
        10
    );
    assert.equal(
        calculateMartialSoulQualityPower(playerWith(["top"]), 100, baseRules),
        25
    );
    assert.equal(
        calculateMartialSoulQualityPower(playerWith(["extreme"]), 100, baseRules),
        30
    );
    assert.equal(
        calculateMartialSoulQualityPower(
            playerWith(["top", "top", "extreme"]),
            100,
            baseRules
        ),
        80
    );
    assert.equal(
        calculateMartialSoulQualityPower(
            playerWith(["extreme", "extreme", "extreme", "extreme"]),
            100,
            baseRules
        ),
        100
    );
    assert.equal(
        calculateMartialSoulQualityPower(playerWith(["extreme"]), 0, baseRules),
        0
    );
});

test("level examples override the compatibility curve at confirmed anchors", () => {
    const levelRules = baseRules.level;

    assert.equal(calculateContinuousLevelPower(10, levelRules), 10);
    assert.equal(calculateContinuousLevelPower(20, levelRules), 30);
    assert.equal(calculateContinuousLevelPower(30, levelRules), 60);
    assert.equal(calculateContinuousLevelPower(99, levelRules), 540);
    assert.equal(calculateContinuousLevelPower(100, levelRules), 550);
    assert.equal(calculateContinuousLevelPower(169, levelRules), 1513);
    assert.equal(calculateLevelPower(91, baseRules), 480);
    assert.equal(calculateLevelPower(96, baseRules), 610);
    assert.equal(calculateLevelPower(98, baseRules), 710);
    assert.equal(calculateLevelPower(99, baseRules), 760);
    assert.equal(calculateLevelPower(100, baseRules), 1260);
});

test("base rules validate the confirmed human level examples", () => {
    const validation = validateRules(baseRules);

    assert.equal(validation.valid, true);
    assert.equal(
        validation.warnings.some(warning => warning.code === "LEVEL_ANCHOR_UNRESOLVED"),
        false
    );
    assert.equal(calculateLevelPower(99, baseRules), 760);
    assert.equal(calculateLevelPower(100, baseRules), 1260);
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

test("civilian observer route is explicitly non-combat and always returns zero power", () => {
    const result = calculate({
        level: 0,
        combatBase: {
            mode: "civilian_observer"
        },
        martialSouls: [{
            instanceId: "observer_soul",
            definitionId: "observer_definition",
            evolutionFamilyId: "observer_family",
            qualityGrade: "extreme"
        }]
    }, baseRules);

    assert.equal(result.total, 0);
    assert.equal(result.staticCombatPower, 0);
    assert.equal(result.combatBaseMode, "civilian_observer");
    assert.equal(result.combatParticipation, "none");
    assert.deepEqual(result.breakdown, {
        level: 0,
        martialSoulQuality: 0,
        martialSoulAvatar: 0,
        soulRings: 0,
        soulBones: 0,
        divineArmor: 0,
        domains: 0,
        attributes: 0,
        soulCore: 0,
        deity: 0,
        artifacts: 0,
        titles: 0,
        other: 0
    });
});

test("table-defined positive modifiers are summed before the subtotal is rounded", () => {
    const rules = clone(baseRules);
    rules.coefficientModules.domains.definitions.domain_fixture = {
        coefficient: 0.1,
        status: "confirmed"
    };
    rules.coefficientModules.attributes.definitions.attribute_fixture = {
        coefficient: 0.05,
        status: "confirmed"
    };
    rules.entityContributionModules.soulCore.definitions.core_fixture = {
        mode: "level_coefficient",
        coefficient: 0.5,
        status: "confirmed"
    };

    const result = calculate({
        level: 20,
        combatBase: {
            mode: "level"
        },
        domains: [{ definitionId: "domain_fixture" }],
        combatAttributes: [{ definitionId: "attribute_fixture" }],
        soulCores: [{ definitionId: "core_fixture" }]
    }, rules);

    assert.equal(result.breakdown.level, 30);
    assert.equal(result.breakdown.domains, 3);
    assert.equal(result.breakdown.attributes, 2);
    assert.equal(result.breakdown.soulCore, 15);
    assert.equal(result.total, 50);
});

test("soul ring brackets, bloodline multipliers, and divine gold fixed power match anchors", () => {
    assert.equal(calculateSoulRingPower({
        years: 764,
        soulBeastBloodlineGrade: "ordinary"
    }, baseRules), 6);
    assert.equal(calculateSoulRingPower({
        years: 500,
        soulBeastBloodlineGrade: "ordinary"
    }, baseRules), 6);
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
    assert.equal(calculateSoulRingPower({
        slot: 10,
        years: 100,
        ringType: "normal",
        soulBeastBloodlineGrade: "low"
    }, baseRules), 1000);
    const normalMillionYearPower = calculateSoulRingPower({
        years: 1000000,
        ringType: "normal",
        soulBeastBloodlineGrade: "top"
    }, baseRules);
    const nonDivineMillionYearPower = calculateSoulRingPower({
        years: 1000000,
        ringType: "non_divine",
        soulBeastBloodlineGrade: "top"
    }, baseRules);

    assert.equal(normalMillionYearPower, 400);
    assert.equal(normalMillionYearPower, nonDivineMillionYearPower);
});

test("mixed bloodline percentages must total 100 and use a weighted multiplier", () => {
    assert.equal(calculateSoulRingPower({
        years: 5000,
        soulBeastBloodlineDistribution: [
            { grade: "top", percentage: 50 },
            { grade: "ordinary", percentage: 50 }
        ]
    }, baseRules), 17);

    const warnings = [];
    assert.equal(calculateSoulRingPower({
        years: 5000,
        soulBeastBloodlineDistribution: [
            { grade: "top", percentage: 40 },
            { grade: "ordinary", percentage: 50 }
        ]
    }, baseRules, warnings, "mixedBloodline"), 0);
    assert.ok(warnings.some(warning => {
        return warning.code === "SOUL_BEAST_BLOODLINE_PERCENTAGE_TOTAL_MISMATCH";
    }));
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

    assert.equal(calculateSoulRingsPower(frozenPlayer, frozenRules), 264);
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
        soulRings: 264,
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
    assert.equal(result.total, 2069);
    assert.equal(result.staticCombatPower, 2069);
    assert.equal(result.rulesVersion, "combat-power/2.0");
    assert.equal(JSON.stringify(frozenPlayer), beforePlayer);
    assert.equal(JSON.stringify(frozenRules), beforeRules);
});

test("100-level Seagod acceptance reconstruction reaches the corrected 14318 anchor", () => {
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
        coefficient: 0.71,
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
        attributes: 895,
        soulCore: 0,
        deity: 2520,
        artifacts: 800,
        titles: 0,
        other: 800
    });
    assert.equal(result.total, 14318);
    assert.ok(result.warnings.some(warning => {
        return warning.code === "PROVISIONAL_RULE_APPLIED";
    }));
});

test("merged divine armor applies the confirmed multi-divine-position efficiency", () => {
    const efficiencyByCount = [
        [1, 1],
        [2, 0.8],
        [3, 0.6],
        [4, 0.4]
    ];

    efficiencyByCount.forEach(([count, coefficient]) => {
        const rules = clone(baseRules);
        rules.divineArmor.setBonuses = Object.fromEntries(
            Array.from({ length: count }, (_, index) => {
                return [`divine_set_${index + 1}`, {
                    mode: "fixed",
                    power: 1000,
                    status: "confirmed"
                }];
            })
        );

        const player = {
            divineArmorSets: Array.from({ length: count }, (_, index) => ({
                definitionId: `divine_set_${index + 1}`
            })),
            deities: Array.from({ length: count }, (_, index) => ({
                definitionId: `deity_${index + 1}`
            }))
        };

        assert.deepEqual(
            calculateSoulBonesPower(player, 100, rules),
            {
                soulBones: 0,
                divineArmor: Math.round(count * 1000 * coefficient)
            }
        );
    });
});
