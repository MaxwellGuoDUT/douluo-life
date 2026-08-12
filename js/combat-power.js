const DEFAULT_BREAKDOWN = Object.freeze({
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

export class CombatPowerRulesError extends Error {
    constructor(message, errors) {
        super(message);
        this.name = "CombatPowerRulesError";
        this.errors = errors;
    }
}

function isPlainObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function addWarning(warnings, code, message, path, details = {}) {
    warnings.push({
        code,
        message,
        path,
        ...details
    });
}

function toNaturalNumber(value) {
    if (!Number.isFinite(value)) {
        return 0;
    }

    return Math.max(0, Math.round(value));
}

function toRoundedNumber(value) {
    if (!Number.isFinite(value)) {
        return 0;
    }

    return Math.round(value);
}

function assertValidLevel(level, levelRules) {
    const minLevel = levelRules?.minLevel;
    const maxLevel = levelRules?.maxLevel;

    if (!Number.isInteger(level)) {
        throw new RangeError(`Player level must be an integer; received ${String(level)}.`);
    }

    if (!Number.isInteger(minLevel) || !Number.isInteger(maxLevel)) {
        throw new TypeError("Combat power level rules must define integer minLevel and maxLevel.");
    }

    if (level < minLevel || level > maxLevel) {
        throw new RangeError(`Player level ${level} is outside the configured range ${minLevel}-${maxLevel}.`);
    }
}

function getApplicableBonusTotal(level, bonuses, warnings, path) {
    if (!Array.isArray(bonuses)) {
        return 0;
    }

    return bonuses.reduce((sum, entry, index) => {
        if (!isPlainObject(entry) || !Number.isFinite(entry.bonus)) {
            return sum;
        }

        const activationLevel = entry.level ?? entry.minLevel;
        const maxLevel = entry.maxLevel;

        if (!Number.isInteger(activationLevel) || level < activationLevel) {
            return sum;
        }

        if (Number.isInteger(maxLevel) && level > maxLevel) {
            return sum;
        }

        if (entry.status === "provisional" && Array.isArray(warnings)) {
            addWarning(
                warnings,
                "PROVISIONAL_RULE_APPLIED",
                `Provisional level bonus "${entry.id || index}" was applied.`,
                `${path}[${index}]`,
                { status: "provisional" }
            );
        }

        return sum + entry.bonus;
    }, 0);
}

function getApplicableCumulativeBonus(level, anchors, warnings) {
    if (!Array.isArray(anchors)) {
        return 0;
    }

    const applicableAnchors = anchors
        .filter(anchor => {
            return isPlainObject(anchor)
                && Number.isInteger(anchor.anchorLevel)
                && Number.isFinite(anchor.cumulativeBonus)
                && level >= anchor.anchorLevel;
        })
        .sort((left, right) => right.anchorLevel - left.anchorLevel);
    const anchor = applicableAnchors[0];

    if (!anchor) {
        return 0;
    }

    if (Array.isArray(warnings)) {
        addWarning(
            warnings,
            "PROVISIONAL_CUMULATIVE_LEVEL_ANCHOR",
            `Fixture-only cumulative level anchor "${anchor.id}" was applied without allocating its bonus to breakthrough levels.`,
            "level.cumulativeBonusAnchors",
            {
                status: anchor.status,
                anchorLevel: anchor.anchorLevel,
                cumulativeBonus: anchor.cumulativeBonus,
                allocationStatus: anchor.allocationStatus
            }
        );
    }

    return anchor.cumulativeBonus;
}

export function calculateContinuousLevelPower(level, levelRules) {
    assertValidLevel(level, levelRules);

    const explicitEntry = getLevelPowerEntry(level, levelRules);

    if (explicitEntry
        && explicitEntry.valueMode !== "final"
        && Number.isFinite(explicitEntry.power)) {
        return toNaturalNumber(explicitEntry.power);
    }

    if (levelRules.continuousCurve?.mode !== "increment_by_decade") {
        throw new TypeError(`Unsupported level curve mode "${String(levelRules.continuousCurve?.mode)}".`);
    }

    if (level === 0) {
        return 0;
    }

    const decade = Math.floor((level - 1) / 10);
    const remainder = level - decade * 10;

    return 5 * decade * (decade + 1) + remainder * (decade + 1);
}

export function calculateLevelPower(level, rules, warnings) {
    const levelRules = rules?.level;

    if (!isPlainObject(levelRules)) {
        throw new TypeError("Combat power rules must include a level object.");
    }

    const explicitEntry = getLevelPowerEntry(level, levelRules);

    if (explicitEntry?.valueMode === "final"
        && Number.isFinite(explicitEntry.power)) {
        return toNaturalNumber(explicitEntry.power);
    }

    const continuousPower = calculateContinuousLevelPower(level, levelRules);

    if (Number.isInteger(levelRules.confirmedThroughLevel)
        && level > levelRules.confirmedThroughLevel
        && !(explicitEntry?.status === "confirmed"
            && Number.isFinite(explicitEntry.power))
        && Array.isArray(warnings)) {
        addWarning(
            warnings,
            "LEVEL_RULE_ABOVE_TABLE_UNRESOLVED",
            `Level ${level} is above the confirmed table range through level ${levelRules.confirmedThroughLevel}; the configured compatibility curve was used.`,
            "level.continuousCurve",
            {
                confirmedThroughLevel: levelRules.confirmedThroughLevel,
                status: "unresolved"
            }
        );
    }

    const breakthroughPower = getApplicableBonusTotal(
        level,
        levelRules.breakthroughBonuses,
        warnings,
        "level.breakthroughBonuses"
    );
    const cumulativeAnchorPower = getApplicableCumulativeBonus(
        level,
        levelRules.cumulativeBonusAnchors,
        warnings
    );
    const specialLevelPower = getApplicableBonusTotal(
        level,
        levelRules.specialLevelBonuses,
        warnings,
        "level.specialLevelBonuses"
    );

    return toNaturalNumber(
        continuousPower
        + breakthroughPower
        + cumulativeAnchorPower
        + specialLevelPower
    );
}

function getLevelPowerEntry(level, levelRules) {
    return Array.isArray(levelRules?.powerEntries)
        ? levelRules.powerEntries.find(entry => entry?.level === level)
        : null;
}

function validateBonusEntries(entries, path, levelRules, errors) {
    if (!Array.isArray(entries)) {
        errors.push({
            code: "INVALID_BONUS_TABLE",
            message: `${path} must be an array.`,
            path
        });
        return;
    }

    const ids = new Set();

    entries.forEach((entry, index) => {
        const entryPath = `${path}[${index}]`;
        const activationLevel = entry?.level ?? entry?.minLevel;

        if (!isPlainObject(entry)) {
            errors.push({
                code: "INVALID_BONUS_ENTRY",
                message: "Bonus entries must be objects.",
                path: entryPath
            });
            return;
        }

        if (typeof entry.id !== "string" || entry.id.length === 0 || ids.has(entry.id)) {
            errors.push({
                code: "INVALID_OR_DUPLICATE_BONUS_ID",
                message: "Bonus entries require a unique non-empty id.",
                path: `${entryPath}.id`
            });
        } else {
            ids.add(entry.id);
        }

        if (!Number.isInteger(activationLevel)
            || activationLevel < levelRules.minLevel
            || activationLevel > levelRules.maxLevel) {
            errors.push({
                code: "INVALID_BONUS_LEVEL",
                message: `Bonus activation level must be within ${levelRules.minLevel}-${levelRules.maxLevel}.`,
                path: entryPath
            });
        }

        if (!Number.isFinite(entry.bonus) || entry.bonus < 0) {
            errors.push({
                code: "INVALID_BONUS_VALUE",
                message: "Bonus must be a non-negative finite number.",
                path: `${entryPath}.bonus`
            });
        }
    });
}

function validateCumulativeBonusAnchors(levelRules, errors) {
    const anchors = levelRules.cumulativeBonusAnchors;

    if (!Array.isArray(anchors)) {
        errors.push({
            code: "INVALID_CUMULATIVE_BONUS_ANCHORS",
            message: "level.cumulativeBonusAnchors must be an array.",
            path: "level.cumulativeBonusAnchors"
        });
        return;
    }

    if (anchors.length > 0 && levelRules.breakthroughBonuses.length > 0) {
        errors.push({
            code: "CUMULATIVE_ANCHOR_OVERLAPS_BREAKTHROUGH_TABLE",
            message: "Fixture cumulative anchors cannot be combined with allocated breakthrough bonuses.",
            path: "level.cumulativeBonusAnchors"
        });
    }

    const ids = new Set();
    const levels = new Set();

    anchors.forEach((anchor, index) => {
        const path = `level.cumulativeBonusAnchors[${index}]`;

        if (!isPlainObject(anchor)
            || anchor.mode !== "cumulative_total_anchor"
            || !Number.isInteger(anchor.anchorLevel)
            || anchor.anchorLevel < levelRules.minLevel
            || anchor.anchorLevel > levelRules.maxLevel
            || !Number.isFinite(anchor.cumulativeBonus)
            || anchor.cumulativeBonus < 0
            || anchor.status !== "provisional"
            || anchor.allocationStatus !== "unallocated"
            || anchor.fixtureOnly !== true) {
            errors.push({
                code: "INVALID_CUMULATIVE_BONUS_ANCHOR",
                message: "Cumulative anchors must be explicit provisional, unallocated, fixture-only totals.",
                path
            });
            return;
        }

        if (typeof anchor.id !== "string"
            || anchor.id.length === 0
            || ids.has(anchor.id)
            || levels.has(anchor.anchorLevel)) {
            errors.push({
                code: "DUPLICATE_CUMULATIVE_BONUS_ANCHOR",
                message: "Cumulative anchors require unique ids and anchor levels.",
                path
            });
            return;
        }

        ids.add(anchor.id);
        levels.add(anchor.anchorLevel);
    });
}

function validateAgeBrackets(soulRingRules, errors) {
    const brackets = soulRingRules?.ageBrackets;

    if (!Array.isArray(brackets) || brackets.length === 0) {
        errors.push({
            code: "INVALID_AGE_BRACKETS",
            message: "soulRings.ageBrackets must be a non-empty array.",
            path: "soulRings.ageBrackets"
        });
        return;
    }

    let expectedMin = soulRingRules.minimumLegalYears;

    brackets.forEach((bracket, index) => {
        const path = `soulRings.ageBrackets[${index}]`;

        if (!isPlainObject(bracket)
            || !Number.isInteger(bracket.minYears)
            || (bracket.maxYears !== null && !Number.isInteger(bracket.maxYears))
            || !Number.isFinite(bracket.basePower)
            || bracket.basePower < 0) {
            errors.push({
                code: "INVALID_AGE_BRACKET",
                message: "Age bracket must define integer bounds and a non-negative basePower.",
                path
            });
            return;
        }

        if (bracket.minYears !== expectedMin) {
            errors.push({
                code: "NON_CONTIGUOUS_AGE_BRACKETS",
                message: `Expected minYears ${expectedMin}, received ${bracket.minYears}.`,
                path
            });
        }

        if (bracket.maxYears !== null && bracket.maxYears < bracket.minYears) {
            errors.push({
                code: "INVALID_AGE_BRACKET_RANGE",
                message: "maxYears must be null or greater than or equal to minYears.",
                path
            });
        }

        if (bracket.maxYears === null && index !== brackets.length - 1) {
            errors.push({
                code: "OPEN_AGE_BRACKET_NOT_LAST",
                message: "Only the final age bracket may use maxYears: null.",
                path
            });
        }

        expectedMin = bracket.maxYears === null ? null : bracket.maxYears + 1;
    });

    if (brackets[brackets.length - 1]?.maxYears !== null) {
        errors.push({
            code: "AGE_BRACKETS_NOT_OPEN_ENDED",
            message: "The final soul ring age bracket must be open-ended.",
            path: `soulRings.ageBrackets[${brackets.length - 1}]`
        });
    }
}

function validateBloodlineMultipliers(soulRingRules, errors) {
    const expectedGrades = [
        "low",
        "ordinary",
        "top",
        "sub_dragon",
        "earth_dragon",
        "pure_dragon"
    ];
    const multipliers = soulRingRules?.bloodlineMultipliers;

    if (!isPlainObject(multipliers)) {
        errors.push({
            code: "INVALID_BLOODLINE_MULTIPLIERS",
            message: "soulRings.bloodlineMultipliers must be an object.",
            path: "soulRings.bloodlineMultipliers"
        });
        return;
    }

    expectedGrades.forEach(grade => {
        if (!Number.isFinite(multipliers[grade]) || multipliers[grade] <= 0) {
            errors.push({
                code: "INVALID_BLOODLINE_MULTIPLIER",
                message: `Bloodline multiplier "${grade}" must be a positive finite number.`,
                path: `soulRings.bloodlineMultipliers.${grade}`
            });
        }
    });

    if (soulRingRules?.bloodlineDistributionRequiredTotal !== 100) {
        errors.push({
            code: "INVALID_BLOODLINE_DISTRIBUTION_TOTAL",
            message: "Mixed soul beast bloodline percentages must require a total of 100.",
            path: "soulRings.bloodlineDistributionRequiredTotal"
        });
    }
}

function validateNamedCoefficients(definitions, path, requiredNames, errors) {
    if (!isPlainObject(definitions)) {
        errors.push({
            code: "INVALID_COEFFICIENT_MAP",
            message: `${path} must be an object.`,
            path
        });
        return;
    }

    requiredNames.forEach(name => {
        if (!Number.isFinite(definitions[name]) || definitions[name] < 0) {
            errors.push({
                code: "INVALID_COEFFICIENT",
                message: `Coefficient "${name}" must be a non-negative finite number.`,
                path: `${path}.${name}`
            });
        }
    });
}

function validateFixedFirstPhaseStrategies(rules, errors) {
    const supportedBaseModes = rules.combatBase?.supportedModes;
    const implementedBaseModes = rules.combatBase?.implementedModes;
    const requiredBaseModes = [
        "level",
        "civilian_observer",
        "soul_beast_cultivation",
        "hybrid"
    ];

    if (rules.combatBase?.defaultMode !== "level"
        || !Array.isArray(supportedBaseModes)
        || !requiredBaseModes.every(mode => supportedBaseModes.includes(mode))
        || !Array.isArray(implementedBaseModes)
        || implementedBaseModes.length !== 2
        || !implementedBaseModes.includes("level")
        || !implementedBaseModes.includes("civilian_observer")) {
        errors.push({
            code: "UNSUPPORTED_COMBAT_BASE_STRATEGY",
            message: "First phase must default to level, declare all four modes, and implement level plus civilian_observer.",
            path: "combatBase"
        });
    }

    if (rules.martialSoulQuality?.stacking?.mode !== "sum"
        || !Number.isFinite(rules.martialSoulQuality?.stacking?.coefficientCap)
        || rules.martialSoulQuality.stacking.coefficientCap < 0) {
        errors.push({
            code: "UNSUPPORTED_MARTIAL_SOUL_STACKING",
            message: "First-phase martial soul quality stacking must use sum with a non-negative coefficientCap.",
            path: "martialSoulQuality.stacking"
        });
    }

    if (rules.martialSoulAvatar?.mode !== "active_only"
        || !Number.isInteger(rules.martialSoulAvatar?.unlockLevel)
        || rules.martialSoulAvatar.unlockLevel < rules.level?.minLevel
        || rules.martialSoulAvatar.unlockLevel > rules.level?.maxLevel) {
        errors.push({
            code: "UNSUPPORTED_MARTIAL_SOUL_AVATAR_STRATEGY",
            message: "First-phase martial soul avatar must use active_only with a valid unlockLevel.",
            path: "martialSoulAvatar"
        });
    }

    if (rules.soulBones?.reuseSoulRingAgeBrackets !== true
        || rules.soulBones?.reuseBloodlineMultipliers !== true
        || !Number.isInteger(rules.soulBones?.minimumItemPower)
        || rules.soulBones.minimumItemPower < 1) {
        errors.push({
            code: "UNSUPPORTED_SOUL_BONE_STRATEGY",
            message: "First-phase soul bones must reuse ring brackets/bloodlines and have integer minimumItemPower >= 1.",
            path: "soulBones"
        });
    }

    if (rules.rounding?.roundEachSoulRing !== true
        || rules.rounding?.roundEachSoulBone !== true
        || rules.rounding?.combineCoefficientsBeforeRounding !== true) {
        errors.push({
            code: "UNSUPPORTED_ROUNDING_STRATEGY",
            message: "First-phase item and coefficient rounding strategy flags must remain enabled.",
            path: "rounding"
        });
    }

    ["domains", "attributes"].forEach(moduleName => {
        const moduleRules = rules.coefficientModules?.[moduleName];

        if (!isPlainObject(moduleRules)
            || moduleRules.stacking !== "sum"
            || typeof moduleRules.playerField !== "string"
            || typeof moduleRules.coefficientField !== "string"
            || !isPlainObject(moduleRules.definitions)) {
            errors.push({
                code: "UNSUPPORTED_COEFFICIENT_MODULE_STRATEGY",
                message: `First-phase ${moduleName} must use definition-driven sum stacking.`,
                path: `coefficientModules.${moduleName}`
            });
        }
    });
}

function validateDivineArmorEfficiencyRules(divineArmorRules, errors) {
    const efficiencyRules = divineArmorRules?.efficiencyByDivinePositionCount;
    const requiredCoefficients = new Map([
        [1, 1],
        [2, 0.8],
        [3, 0.6],
        [4, 0.4]
    ]);

    if (!Array.isArray(efficiencyRules)) {
        errors.push({
            code: "INVALID_DIVINE_ARMOR_POSITION_EFFICIENCY",
            message: "Divine armor must define efficiency rules for one through four divine positions.",
            path: "divineArmor.efficiencyByDivinePositionCount"
        });
        return;
    }

    requiredCoefficients.forEach((expectedCoefficient, divinePositionCount) => {
        const rule = efficiencyRules.find(entry => {
            return entry?.divinePositionCount === divinePositionCount;
        });

        if (!rule
            || !Number.isFinite(rule.coefficient)
            || rule.coefficient !== expectedCoefficient) {
            errors.push({
                code: "INVALID_DIVINE_ARMOR_POSITION_EFFICIENCY",
                message: `Divine armor efficiency for ${divinePositionCount} divine positions must be ${expectedCoefficient}.`,
                path: `divineArmor.efficiencyByDivinePositionCount.${divinePositionCount}`
            });
        }
    });
}

function validateLevelAnchors(rules, errors, warnings) {
    const anchors = rules.level?.validationAnchors;

    if (!Array.isArray(anchors)) {
        errors.push({
            code: "INVALID_LEVEL_ANCHORS",
            message: "level.validationAnchors must be an array.",
            path: "level.validationAnchors"
        });
        return;
    }

    anchors.forEach((anchor, index) => {
        const path = `level.validationAnchors[${index}]`;

        if (!isPlainObject(anchor)
            || !Number.isInteger(anchor.level)
            || !Number.isFinite(anchor.expectedPower)) {
            errors.push({
                code: "INVALID_LEVEL_ANCHOR",
                message: "A level anchor must define integer level and finite expectedPower.",
                path
            });
            return;
        }

        let actualPower;

        try {
            actualPower = anchor.kind === "continuous"
                ? calculateContinuousLevelPower(anchor.level, rules.level)
                : calculateLevelPower(anchor.level, rules);
        } catch (error) {
            errors.push({
                code: "LEVEL_ANCHOR_CALCULATION_FAILED",
                message: error.message,
                path
            });
            return;
        }

        if (actualPower === anchor.expectedPower) {
            return;
        }

        const issue = {
            code: anchor.status === "provisional"
                ? "LEVEL_ANCHOR_UNRESOLVED"
                : "LEVEL_ANCHOR_MISMATCH",
            message: `Level ${anchor.level} ${anchor.kind || "total"} anchor expected ${anchor.expectedPower}, calculated ${actualPower}.`,
            path,
            expectedPower: anchor.expectedPower,
            actualPower,
            unresolvedBonus: anchor.unresolvedBonus ?? 0,
            status: anchor.status || "confirmed"
        };

        if (anchor.status === "provisional") {
            warnings.push(issue);
        } else {
            errors.push(issue);
        }
    });
}

export function validateRules(rules) {
    const errors = [];
    const warnings = [];

    if (!isPlainObject(rules)) {
        return {
            valid: false,
            errors: [{
                code: "INVALID_RULES",
                message: "Combat power rules must be an object.",
                path: ""
            }],
            warnings
        };
    }

    if (typeof rules.rulesVersion !== "string" || rules.rulesVersion.length === 0) {
        errors.push({
            code: "MISSING_RULES_VERSION",
            message: "rulesVersion must be a non-empty string.",
            path: "rulesVersion"
        });
    }

    const levelRules = rules.level;

    if (!isPlainObject(levelRules)
        || !Number.isInteger(levelRules.minLevel)
        || !Number.isInteger(levelRules.maxLevel)
        || levelRules.minLevel > levelRules.maxLevel) {
        errors.push({
            code: "INVALID_LEVEL_RULES",
            message: "level must define a valid integer minLevel/maxLevel range.",
            path: "level"
        });
    } else {
        if (levelRules.continuousCurve?.mode !== "increment_by_decade") {
            errors.push({
                code: "UNSUPPORTED_LEVEL_CURVE",
                message: "Only increment_by_decade is supported in the first phase.",
                path: "level.continuousCurve.mode"
            });
        }

        validateBonusEntries(
            levelRules.breakthroughBonuses,
            "level.breakthroughBonuses",
            levelRules,
            errors
        );
        validateBonusEntries(
            levelRules.specialLevelBonuses,
            "level.specialLevelBonuses",
            levelRules,
            errors
        );
        validateCumulativeBonusAnchors(levelRules, errors);
    }

    validateAgeBrackets(rules.soulRings, errors);
    validateBloodlineMultipliers(rules.soulRings, errors);
    validateNamedCoefficients(
        rules.martialSoulQuality?.coefficients,
        "martialSoulQuality.coefficients",
        ["low", "ordinary", "top", "extreme"],
        errors
    );
    validateNamedCoefficients(
        rules.martialSoulAvatar?.coefficients,
        "martialSoulAvatar.coefficients",
        ["top", "extreme"],
        errors
    );
    validateFixedFirstPhaseStrategies(rules, errors);

    if (!Number.isFinite(rules.soulRings?.divineGold?.fixedPower)
        || rules.soulRings.divineGold.fixedPower < 0) {
        errors.push({
            code: "INVALID_DIVINE_RING_POWER",
            message: "The divine gold ring fixedPower must be a non-negative finite number.",
            path: "soulRings.divineGold.fixedPower"
        });
    }

    if (rules.rounding?.mode !== "math_round"
        || !Number.isInteger(rules.rounding?.minimumOrdinaryItemPower)
        || rules.rounding.minimumOrdinaryItemPower < 1
        || !Number.isInteger(rules.rounding?.minimumTotalPower)
        || rules.rounding.minimumTotalPower < 0) {
        errors.push({
            code: "INVALID_ROUNDING_RULES",
            message: "First-phase rounding requires math_round, integer item minimum >= 1, and non-negative integer total minimum.",
            path: "rounding"
        });
    }

    if (!Number.isFinite(rules.divineArmor?.defaultMultiplier)
        || rules.divineArmor.defaultMultiplier < 0
        || rules.divineArmor?.replacesSoulBonePower !== true) {
        errors.push({
            code: "INVALID_DIVINE_ARMOR_RULES",
            message: "Divine armor requires a non-negative defaultMultiplier and replacement semantics.",
            path: "divineArmor"
        });
    }

    validateDivineArmorEfficiencyRules(rules.divineArmor, errors);

    if (errors.length === 0) {
        validateLevelAnchors(rules, errors, warnings);
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}

function collectMartialSouls(player, warnings) {
    if (!Array.isArray(player.martialSouls)) {
        if (typeof player.spirit === "string" && player.spirit.length > 0) {
            addWarning(
                warnings,
                "LEGACY_SPIRIT_UNRESOLVED",
                "Legacy player.spirit has no stable definitionId or combat quality grade; martial soul contributions were skipped.",
                "spirit"
            );
        }

        return [];
    }

    const instanceIds = new Set();
    const definitionIds = new Set();
    const evolutionFamilyIds = new Set();
    const uniqueSouls = [];

    player.martialSouls.forEach((soul, index) => {
        const path = `martialSouls[${index}]`;

        if (!isPlainObject(soul)) {
            addWarning(
                warnings,
                "MISSING_MARTIAL_SOUL_ENTITY",
                "Martial soul entries must be objects.",
                path
            );
            return;
        }

        const hasDefinitionId = typeof soul.definitionId === "string"
            && soul.definitionId.length > 0;

        if (soul.definitionId === null) {
            addWarning(
                warnings,
                "UNRESOLVED_MARTIAL_SOUL_DEFINITION",
                "Martial soul definitionId is unresolved; definition-driven contributions were skipped.",
                `${path}.definitionId`
            );
        } else if (!hasDefinitionId) {
            addWarning(
                warnings,
                "MISSING_MARTIAL_SOUL_ENTITY",
                "Martial soul definitionId must be a non-empty string or null.",
                `${path}.definitionId`
            );
            return;
        }

        if (typeof soul.instanceId !== "string" || soul.instanceId.length === 0) {
            addWarning(
                warnings,
                "MISSING_MARTIAL_SOUL_INSTANCE_ID",
                "Martial soul entries should include a stable instanceId.",
                `${path}.instanceId`
            );
        } else if (instanceIds.has(soul.instanceId)) {
            addWarning(
                warnings,
                "DUPLICATE_MARTIAL_SOUL_INSTANCE",
                `Duplicate martial soul instanceId "${soul.instanceId}" was ignored.`,
                path
            );
            return;
        }

        if (hasDefinitionId && definitionIds.has(soul.definitionId)) {
            addWarning(
                warnings,
                "DUPLICATE_MARTIAL_SOUL",
                `Duplicate martial soul definitionId "${soul.definitionId}" was ignored.`,
                path
            );
            return;
        }

        if (typeof soul.evolutionFamilyId === "string"
            && soul.evolutionFamilyId.length > 0
            && evolutionFamilyIds.has(soul.evolutionFamilyId)) {
            addWarning(
                warnings,
                "DUPLICATE_MARTIAL_SOUL_FAMILY",
                `Duplicate martial soul evolutionFamilyId "${soul.evolutionFamilyId}" was ignored.`,
                path
            );
            return;
        }

        if (typeof soul.evolutionFamilyId !== "string"
            || soul.evolutionFamilyId.length === 0) {
            addWarning(
                warnings,
                "MISSING_MARTIAL_SOUL_FAMILY",
                "Martial soul entries should include evolutionFamilyId for duplicate-family checks.",
                `${path}.evolutionFamilyId`
            );
        }

        if (typeof soul.instanceId === "string" && soul.instanceId.length > 0) {
            instanceIds.add(soul.instanceId);
        }

        if (hasDefinitionId) {
            definitionIds.add(soul.definitionId);
        }

        if (typeof soul.evolutionFamilyId === "string"
            && soul.evolutionFamilyId.length > 0) {
            evolutionFamilyIds.add(soul.evolutionFamilyId);
        }

        uniqueSouls.push(soul);
    });

    return uniqueSouls;
}

function resolveCoefficient(definitions, grade, warnings, path, warningCode) {
    if (typeof grade !== "string" || !Object.prototype.hasOwnProperty.call(definitions, grade)) {
        addWarning(
            warnings,
            warningCode,
            `Unknown or missing coefficient grade "${String(grade)}".`,
            path
        );
        return null;
    }

    const coefficient = definitions[grade];

    if (!Number.isFinite(coefficient) || coefficient < 0) {
        addWarning(
            warnings,
            "INVALID_COEFFICIENT",
            `Coefficient for grade "${grade}" is invalid.`,
            path
        );
        return null;
    }

    return coefficient;
}

function calculateMartialSoulQualityFromSouls(souls, levelPower, rules, warnings) {
    const qualityRules = rules.martialSoulQuality;
    const coefficients = qualityRules?.coefficients || {};
    let coefficientSum = 0;

    souls.forEach((soul, index) => {
        const grade = soul[qualityRules.gradeField];
        const coefficient = resolveCoefficient(
            coefficients,
            grade,
            warnings,
            `martialSouls[${index}].${qualityRules.gradeField}`,
            "UNKNOWN_MARTIAL_SOUL_QUALITY"
        );

        if (coefficient !== null) {
            coefficientSum += coefficient;
        }
    });

    const cap = qualityRules?.stacking?.coefficientCap;

    if (Number.isFinite(cap)) {
        coefficientSum = Math.min(coefficientSum, cap);
    }

    return toNaturalNumber(levelPower * coefficientSum);
}

export function calculateMartialSoulQualityPower(player, levelPower, rules, warnings = []) {
    const souls = collectMartialSouls(player, warnings);
    return calculateMartialSoulQualityFromSouls(souls, levelPower, rules, warnings);
}

function calculateMartialSoulAvatarFromSouls(player, souls, levelPower, rules, warnings) {
    const avatarRules = rules.martialSoulAvatar;

    if (player.level < avatarRules.unlockLevel) {
        return 0;
    }

    let activeSoul;

    if (typeof player.activeMartialSoulInstanceId === "string") {
        activeSoul = souls.find(soul => {
            return soul.instanceId === player.activeMartialSoulInstanceId;
        });
    } else if (typeof player.activeMartialSoulId === "string") {
        addWarning(
            warnings,
            "LEGACY_ACTIVE_MARTIAL_SOUL_REFERENCE",
            "Legacy activeMartialSoulId was resolved by definitionId; migrate to activeMartialSoulInstanceId.",
            "activeMartialSoulId"
        );
        activeSoul = souls.find(soul => {
            return soul.definitionId === player.activeMartialSoulId
                || soul.instanceId === player.activeMartialSoulId;
        });
    } else {
        if (souls.length > 0) {
            addWarning(
                warnings,
                "MISSING_ACTIVE_MARTIAL_SOUL",
                "Martial soul avatar requires activeMartialSoulInstanceId at or above the unlock level.",
                "activeMartialSoulInstanceId"
            );
        }

        return 0;
    }

    if (!activeSoul) {
        addWarning(
            warnings,
            "UNKNOWN_ACTIVE_MARTIAL_SOUL",
            "The active martial soul reference does not match an available martial soul instance.",
            "activeMartialSoulInstanceId"
        );
        return 0;
    }

    const grade = activeSoul[avatarRules.gradeField]
        ?? activeSoul[avatarRules.fallbackGradeField];
    const coefficient = resolveCoefficient(
        avatarRules.coefficients || {},
        grade,
        warnings,
        `martialSouls.${activeSoul.definitionId}.${avatarRules.gradeField}`,
        "UNKNOWN_MARTIAL_SOUL_AVATAR_GRADE"
    );

    return coefficient === null ? 0 : toNaturalNumber(levelPower * coefficient);
}

export function calculateMartialSoulAvatarPower(player, levelPower, rules, warnings = []) {
    const souls = collectMartialSouls(player, warnings);
    return calculateMartialSoulAvatarFromSouls(player, souls, levelPower, rules, warnings);
}

function resolveYears(entity, itemRules, warnings, path) {
    const yearsField = itemRules.yearsField || "years";
    const legacyYearsField = itemRules.legacyYearsField;
    let years = entity[yearsField];

    if (years === undefined && legacyYearsField && entity[legacyYearsField] !== undefined) {
        years = entity[legacyYearsField];
        addWarning(
            warnings,
            "LEGACY_YEARS_FIELD",
            `Legacy "${legacyYearsField}" was read as "${yearsField}".`,
            `${path}.${legacyYearsField}`
        );
    }

    if (!Number.isInteger(years) || years < 1) {
        addWarning(
            warnings,
            "INVALID_ITEM_YEARS",
            "Soul ring or soul bone years must be a positive integer.",
            `${path}.${yearsField}`
        );
        return null;
    }

    return years;
}

function findAgeBracket(years, soulRingRules, itemType) {
    return soulRingRules.ageBrackets.find(bracket => {
        return years >= bracket.minYears
            && (bracket.maxYears === null || years <= bracket.maxYears)
            && (!bracket.ringType || bracket.ringType === itemType);
    });
}

function resolveBloodlineMultiplier(entity, soulRingRules, warnings, path) {
    if (entity.sourceType === soulRingRules.godBestowed?.sourceType) {
        const multiplierField = soulRingRules.godBestowed.qualityMultiplierField;
        const hasExplicitMultiplier = entity[multiplierField] !== undefined;
        const multiplier = hasExplicitMultiplier
            ? entity[multiplierField]
            : soulRingRules.godBestowed.defaultQualityMultiplier;

        if (!Number.isFinite(multiplier) || multiplier <= 0) {
            addWarning(
                warnings,
                "INVALID_GOD_BESTOWED_MULTIPLIER",
                `God-bestowed items require a positive ${multiplierField}.`,
                `${path}.${multiplierField}`
            );
            return null;
        }

        if (!hasExplicitMultiplier && Array.isArray(warnings)) {
            addWarning(
                warnings,
                "DEFAULT_GOD_BESTOWED_MULTIPLIER",
                `God-bestowed item used the configured default ${multiplierField}.`,
                `${path}.${multiplierField}`,
                {
                    status: "confirmed"
                }
            );
        }

        return multiplier;
    }

    const multipliers = soulRingRules.bloodlineMultipliers;

    const distributionField = soulRingRules.bloodlineDistributionField
        || "soulBeastBloodlineDistribution";
    const gradeField = soulRingRules.bloodlineDistributionGradeField || "grade";
    const percentageField = soulRingRules.bloodlineDistributionPercentageField || "percentage";
    const requiredTotal = soulRingRules.bloodlineDistributionRequiredTotal ?? 100;
    const distribution = entity[distributionField];

    if (distribution !== undefined) {

        if (!Array.isArray(distribution) || distribution.length === 0) {
            addWarning(
                warnings,
                "INVALID_SOUL_BEAST_BLOODLINE_DISTRIBUTION",
                `${distributionField} must be a non-empty array.`,
                `${path}.${distributionField}`
            );
            return null;
        }

        let percentageTotal = 0;
        let weightedMultiplier = 0;
        let invalid = false;

        distribution.forEach((entry, index) => {
            const entryPath = `${path}.${distributionField}[${index}]`;
            const grade = entry?.[gradeField] ?? entry?.soulBeastBloodlineGrade;
            const percentage = entry?.[percentageField];

            if (typeof grade !== "string"
                || !Object.prototype.hasOwnProperty.call(multipliers, grade)) {
                addWarning(
                    warnings,
                    "UNKNOWN_SOUL_BEAST_BLOODLINE_GRADE",
                    `Unknown or missing mixed soulBeastBloodline grade "${String(grade)}".`,
                    `${entryPath}.${gradeField}`
                );
                invalid = true;
                return;
            }

            if (!Number.isFinite(percentage) || percentage < 0) {
                addWarning(
                    warnings,
                    "INVALID_SOUL_BEAST_BLOODLINE_PERCENTAGE",
                    "Mixed soulBeastBloodline percentages must be non-negative finite numbers.",
                    `${entryPath}.${percentageField}`
                );
                invalid = true;
                return;
            }

            percentageTotal += percentage;
            weightedMultiplier += (percentage / 100) * multipliers[grade];
        });

        if (invalid || Math.abs(percentageTotal - requiredTotal) > 1e-9) {
            if (!invalid) {
                addWarning(
                    warnings,
                    "SOUL_BEAST_BLOODLINE_PERCENTAGE_TOTAL_MISMATCH",
                    `Mixed soulBeastBloodline percentages must total ${requiredTotal}; received ${percentageTotal}.`,
                    `${path}.${distributionField}`,
                    {
                        percentageTotal,
                        requiredTotal
                    }
                );
            }
            return null;
        }

        return weightedMultiplier;
    }

    const grade = entity.soulBeastBloodlineGrade;

    if (typeof grade !== "string" || !Object.prototype.hasOwnProperty.call(multipliers, grade)) {
        addWarning(
            warnings,
            "UNKNOWN_SOUL_BEAST_BLOODLINE_GRADE",
            `Unknown or missing soulBeastBloodlineGrade "${String(grade)}".`,
            `${path}.soulBeastBloodlineGrade`
        );
        return null;
    }

    return multipliers[grade];
}

function calculateAgeBasedItemPower(
    entity,
    itemRules,
    soulRingRules,
    roundingRules,
    warnings,
    path
) {
    const years = resolveYears(entity, itemRules, warnings, path);

    if (years === null) {
        return 0;
    }

    if (years < soulRingRules.minimumLegalYears) {
        addWarning(
            warnings,
            "ILLEGAL_SOUL_ITEM_YEARS",
            `Years ${years} are below the current legal minimum ${soulRingRules.minimumLegalYears}.`,
            `${path}.${itemRules.yearsField || "years"}`
        );
        return 0;
    }

    const itemType = entity.ringType === "normal"
        ? "non_divine"
        : entity.ringType || "non_divine";
    const bracket = findAgeBracket(years, soulRingRules, itemType);

    if (!bracket) {
        addWarning(
            warnings,
            "UNMATCHED_SOUL_ITEM_YEARS",
            `No configured age bracket matches ${years} years.`,
            `${path}.${itemRules.yearsField || "years"}`
        );
        return 0;
    }

    const multiplier = resolveBloodlineMultiplier(entity, soulRingRules, warnings, path);

    if (multiplier === null) {
        return 0;
    }

    const minimumPower = Math.max(
        1,
        itemRules.minimumItemPower
            ?? soulRingRules.minimumItemPower
            ?? roundingRules.minimumOrdinaryItemPower
    );

    return Math.max(minimumPower, toNaturalNumber(bracket.basePower * multiplier));
}

export function calculateSoulRingPower(
    ring,
    rules,
    warnings = [],
    path = "soulRings[0]",
    baseMode = "level"
) {
    if (!isPlainObject(ring)) {
        addWarning(
            warnings,
            "MISSING_SOUL_RING_ENTITY",
            "Soul ring entries must be objects.",
            path
        );
        return 0;
    }

    const soulRingRules = rules.soulRings;

    const fixedSlotRule = baseMode === "level"
        && Array.isArray(soulRingRules.fixedSlotPower)
        ? soulRingRules.fixedSlotPower.find(rule => {
            return Number.isInteger(ring.slot)
                && Number.isInteger(rule.minSlot)
                && Number.isInteger(rule.maxSlot)
                && ring.slot >= rule.minSlot
                && ring.slot <= rule.maxSlot;
        })
        : null;

    if (fixedSlotRule) {
        return toNaturalNumber(fixedSlotRule.fixedPower);
    }

    if (ring.ringType === soulRingRules.divineGold.ringType) {
        return toNaturalNumber(soulRingRules.divineGold.fixedPower);
    }

    return calculateAgeBasedItemPower(
        ring,
        soulRingRules,
        soulRingRules,
        rules.rounding,
        warnings,
        path
    );
}

function collectSoulRings(player, souls, warnings) {
    const nestedRings = [];

    souls.forEach((soul, soulIndex) => {
        if (!Array.isArray(soul.soulRings)) {
            return;
        }

        soul.soulRings.forEach((ring, ringIndex) => {
            nestedRings.push({
                ring,
                path: `martialSouls[${soulIndex}].soulRings[${ringIndex}]`
            });
        });
    });

    const legacyRings = Array.isArray(player.soulRings) ? player.soulRings : [];

    if (nestedRings.length > 0) {
        if (legacyRings.length > 0) {
            addWarning(
                warnings,
                "AMBIGUOUS_SOUL_RING_STORAGE",
                "Both martialSouls[].soulRings and legacy player.soulRings contain data; nested martial soul rings were used.",
                "soulRings"
            );
        }

        return nestedRings;
    }

    return legacyRings.map((ring, index) => ({
        ring,
        path: `soulRings[${index}]`
    }));
}

function calculateSoulRingsFromSouls(player, souls, rules, warnings) {
    const baseMode = player.combatBase?.mode
        ?? rules.combatBase?.defaultMode;

    return collectSoulRings(player, souls, warnings).reduce((sum, entry) => {
        return sum + calculateSoulRingPower(
            entry.ring,
            rules,
            warnings,
            entry.path,
            baseMode
        );
    }, 0);
}

export function calculateSoulRingsPower(player, rules, warnings = []) {
    const souls = collectMartialSouls(player, warnings);
    return calculateSoulRingsFromSouls(player, souls, rules, warnings);
}

export function calculateSoulBonePower(bone, rules, warnings = [], path = "soulBones[0]") {
    if (!isPlainObject(bone)) {
        addWarning(
            warnings,
            "MISSING_SOUL_BONE_ENTITY",
            "Soul bone entries must be objects.",
            path
        );
        return 0;
    }

    return calculateAgeBasedItemPower(
        bone,
        rules.soulBones,
        rules.soulRings,
        rules.rounding,
        warnings,
        path
    );
}

function normalizeSoulBones(player) {
    if (Array.isArray(player.soulBones)) {
        return player.soulBones.map((bone, index) => ({
            bone,
            path: `soulBones[${index}]`
        }));
    }

    if (isPlainObject(player.soulBones)) {
        return Object.entries(player.soulBones)
            .filter(([, bone]) => bone !== null && bone !== undefined)
            .map(([slot, bone]) => ({
                bone,
                path: `soulBones.${slot}`
            }));
    }

    return [];
}

function getDefinitionId(reference) {
    if (typeof reference === "string") {
        return reference;
    }

    if (isPlainObject(reference) && typeof reference.definitionId === "string") {
        return reference.definitionId;
    }

    return null;
}

function countUniqueDefinitionReferences(entries) {
    if (!Array.isArray(entries)) {
        return 0;
    }

    const ids = new Set();

    entries.forEach(reference => {
        const definitionId = getDefinitionId(reference);

        if (definitionId) {
            ids.add(definitionId);
        }
    });

    return ids.size;
}

function resolveDivineArmorEfficiency(player, rules, warnings) {
    const divineArmorRules = rules.divineArmor || {};
    const countField = divineArmorRules.divinePositionCountField || "deities";
    const divinePositionCount = countUniqueDefinitionReferences(player[countField]) || 1;
    const efficiencyRule = Array.isArray(divineArmorRules.efficiencyByDivinePositionCount)
        ? divineArmorRules.efficiencyByDivinePositionCount.find(rule => {
            return rule?.divinePositionCount === divinePositionCount;
        })
        : null;

    if (efficiencyRule && Number.isFinite(efficiencyRule.coefficient)) {
        return efficiencyRule.coefficient;
    }

    addWarning(
        warnings,
        "UNRESOLVED_DIVINE_ARMOR_POSITION_EFFICIENCY",
        `No divine armor efficiency rule exists for ${divinePositionCount} divine positions; full merged divine armor power was retained.`,
        `divineArmor.efficiencyByDivinePositionCount`,
        {
            divinePositionCount,
            status: "unresolved"
        }
    );

    return 1;
}

function calculateDefinitionPower(definition, levelPower, warnings, path) {
    if (definition.status === "provisional") {
        addWarning(
            warnings,
            "PROVISIONAL_RULE_APPLIED",
            "A provisional entity contribution rule was applied.",
            path,
            { status: "provisional" }
        );
    }

    if (definition.mode === "fixed") {
        if (!Number.isFinite(definition.power) || definition.power < 0) {
            addWarning(
                warnings,
                "INVALID_FIXED_CONTRIBUTION",
                "Fixed combat contribution requires a non-negative power.",
                path
            );
            return 0;
        }

        return toNaturalNumber(definition.power);
    }

    if (definition.mode === "level_coefficient") {
        if (!Number.isFinite(definition.coefficient)) {
            addWarning(
                warnings,
                "INVALID_LEVEL_COEFFICIENT",
                "Level coefficient contribution requires a finite coefficient.",
                path
            );
            return 0;
        }

        return toRoundedNumber(levelPower * definition.coefficient);
    }

    addWarning(
        warnings,
        "UNKNOWN_CONTRIBUTION_MODE",
        `Unknown contribution mode "${String(definition.mode)}".`,
        path
    );
    return 0;
}

function calculateDefinitionReferences(entries, definitions, levelPower, warnings, path) {
    if (!Array.isArray(entries)) {
        return 0;
    }

    const seenIds = new Set();

    return entries.reduce((sum, reference, index) => {
        const entryPath = `${path}[${index}]`;
        const definitionId = getDefinitionId(reference);

        if (!definitionId) {
            addWarning(
                warnings,
                "MISSING_ENTITY_REFERENCE",
                "Combat contribution entries require a definitionId.",
                entryPath
            );
            return sum;
        }

        if (seenIds.has(definitionId)) {
            addWarning(
                warnings,
                "DUPLICATE_ENTITY_REFERENCE",
                `Duplicate combat contribution "${definitionId}" was ignored.`,
                entryPath
            );
            return sum;
        }

        seenIds.add(definitionId);
        const definition = definitions?.[definitionId];

        if (!isPlainObject(definition)) {
            addWarning(
                warnings,
                "MISSING_ENTITY_DEFINITION",
                `No combat rule definition exists for "${definitionId}".`,
                entryPath
            );
            return sum;
        }

        return sum + calculateDefinitionPower(
            definition,
            levelPower,
            warnings,
            `${path}.definitions.${definitionId}`
        );
    }, 0);
}

export function calculateSoulBonesPower(player, levelPower, rules, warnings = []) {
    let soulBones = 0;
    let divineArmor = 0;
    let reportedProvisionalDefaultMultiplier = false;

    normalizeSoulBones(player).forEach(({ bone, path }) => {
        const basePower = calculateSoulBonePower(bone, rules, warnings, path);

        if (basePower === 0) {
            return;
        }

        if (bone.equipmentState === rules.divineArmor.equipmentState) {
            const usesDefaultMultiplier = bone.divineMultiplier === undefined;
            const multiplier = usesDefaultMultiplier
                ? rules.divineArmor.defaultMultiplier
                : bone.divineMultiplier;

            if (!Number.isFinite(multiplier) || multiplier < 0) {
                addWarning(
                    warnings,
                    "INVALID_DIVINE_ARMOR_MULTIPLIER",
                    "Divine armor multiplier must be a non-negative finite number.",
                    `${path}.divineMultiplier`
                );
                return;
            }

            if (usesDefaultMultiplier
                && rules.divineArmor.status === "provisional"
                && !reportedProvisionalDefaultMultiplier) {
                addWarning(
                    warnings,
                    "PROVISIONAL_DIVINE_ARMOR_RULE_APPLIED",
                    "The provisional default divine armor multiplier was applied.",
                    "divineArmor.defaultMultiplier",
                    { status: "provisional" }
                );
                reportedProvisionalDefaultMultiplier = true;
            }

            divineArmor += toNaturalNumber(basePower * multiplier);
            return;
        }

        soulBones += basePower;
    });

    divineArmor += calculateDefinitionReferences(
        player.divineArmorSets,
        rules.divineArmor.setBonuses,
        levelPower,
        warnings,
        "divineArmorSets"
    );

    divineArmor = toNaturalNumber(
        divineArmor * resolveDivineArmorEfficiency(player, rules, warnings)
    );

    return {
        soulBones: toNaturalNumber(soulBones),
        divineArmor: toNaturalNumber(divineArmor)
    };
}

export function calculateCoefficientModulePower(
    player,
    levelPower,
    moduleName,
    rules,
    warnings = []
) {
    const moduleRules = rules.coefficientModules?.[moduleName];

    if (!isPlainObject(moduleRules)) {
        addWarning(
            warnings,
            "MISSING_COEFFICIENT_MODULE_RULES",
            `No coefficient module rules exist for "${moduleName}".`,
            `coefficientModules.${moduleName}`
        );
        return 0;
    }

    const entries = player[moduleRules.playerField];

    if (!Array.isArray(entries)) {
        return 0;
    }

    const seenIds = new Set();
    let coefficientSum = 0;

    entries.forEach((reference, index) => {
        const path = `${moduleRules.playerField}[${index}]`;
        const definitionId = getDefinitionId(reference);

        if (!definitionId) {
            addWarning(
                warnings,
                "MISSING_ENTITY_REFERENCE",
                `${moduleName} entries require a definitionId.`,
                path
            );
            return;
        }

        if (seenIds.has(definitionId)) {
            addWarning(
                warnings,
                "DUPLICATE_ENTITY_REFERENCE",
                `Duplicate ${moduleName} definitionId "${definitionId}" was ignored.`,
                path
            );
            return;
        }

        seenIds.add(definitionId);
        const definition = moduleRules.definitions?.[definitionId];
        const coefficient = definition?.[moduleRules.coefficientField];

        if (!Number.isFinite(coefficient)) {
            addWarning(
                warnings,
                "MISSING_ENTITY_DEFINITION",
                `No valid ${moduleName} coefficient exists for "${definitionId}".`,
                path
            );
            return;
        }

        if (definition.status === "provisional") {
            addWarning(
                warnings,
                "PROVISIONAL_RULE_APPLIED",
                `A provisional ${moduleName} coefficient was applied.`,
                `${path}.definitionId`,
                { status: "provisional" }
            );
        }

        coefficientSum += coefficient;
    });

    return toRoundedNumber(levelPower * coefficientSum);
}

export function calculateEntityContributionModulePower(
    player,
    levelPower,
    moduleName,
    rules,
    warnings = []
) {
    const moduleRules = rules.entityContributionModules?.[moduleName];

    if (!isPlainObject(moduleRules)) {
        addWarning(
            warnings,
            "MISSING_ENTITY_MODULE_RULES",
            `No entity contribution module rules exist for "${moduleName}".`,
            `entityContributionModules.${moduleName}`
        );
        return 0;
    }

    return toRoundedNumber(calculateDefinitionReferences(
        player[moduleRules.playerField],
        moduleRules.definitions,
        levelPower,
        warnings,
        moduleRules.playerField
    ));
}

function calculateLevelBase(player, rules, warnings) {
    const mode = player.combatBase?.mode ?? rules.combatBase?.defaultMode;

    if (mode === "civilian_observer") {
        return 0;
    }

    if (mode !== "level") {
        addWarning(
            warnings,
            "UNIMPLEMENTED_COMBAT_BASE_MODE",
            `Combat base mode "${String(mode)}" is not implemented in the first phase.`,
            "combatBase.mode",
            { status: "provisional" }
        );
        return 0;
    }

    return calculateLevelPower(player.level, rules, warnings);
}

export function calculate(player, rules) {
    if (!isPlainObject(player)) {
        throw new TypeError("Player state must be an object.");
    }

    const rulesValidation = validateRules(rules);

    if (!rulesValidation.valid) {
        throw new CombatPowerRulesError(
            "Combat power rules failed validation.",
            rulesValidation.errors
        );
    }

    const warnings = [...rulesValidation.warnings];
    const combatBaseMode = player.combatBase?.mode
        ?? rules.combatBase?.defaultMode;

    if (combatBaseMode === "civilian_observer") {
        return {
            total: 0,
            staticCombatPower: 0,
            breakdown: {
                ...DEFAULT_BREAKDOWN
            },
            warnings,
            rulesVersion: rules.rulesVersion,
            combatBaseMode,
            combatParticipation: "none"
        };
    }

    const levelPower = calculateLevelBase(player, rules, warnings);
    const martialSouls = collectMartialSouls(player, warnings);
    const soulBonePower = calculateSoulBonesPower(
        player,
        levelPower,
        rules,
        warnings
    );
    const breakdown = {
        ...DEFAULT_BREAKDOWN,
        level: levelPower,
        martialSoulQuality: calculateMartialSoulQualityFromSouls(
            martialSouls,
            levelPower,
            rules,
            warnings
        ),
        martialSoulAvatar: calculateMartialSoulAvatarFromSouls(
            player,
            martialSouls,
            levelPower,
            rules,
            warnings
        ),
        soulRings: calculateSoulRingsFromSouls(
            player,
            martialSouls,
            rules,
            warnings
        ),
        soulBones: soulBonePower.soulBones,
        divineArmor: soulBonePower.divineArmor,
        domains: calculateCoefficientModulePower(
            player,
            levelPower,
            "domains",
            rules,
            warnings
        ),
        attributes: calculateCoefficientModulePower(
            player,
            levelPower,
            "attributes",
            rules,
            warnings
        ),
        soulCore: calculateEntityContributionModulePower(
            player,
            levelPower,
            "soulCore",
            rules,
            warnings
        ),
        deity: calculateEntityContributionModulePower(
            player,
            levelPower,
            "deity",
            rules,
            warnings
        ),
        artifacts: calculateEntityContributionModulePower(
            player,
            levelPower,
            "artifacts",
            rules,
            warnings
        ),
        titles: calculateEntityContributionModulePower(
            player,
            levelPower,
            "titles",
            rules,
            warnings
        ),
        other: calculateEntityContributionModulePower(
            player,
            levelPower,
            "other",
            rules,
            warnings
        )
    };
    const total = Math.max(
        rules.rounding.minimumTotalPower,
        toNaturalNumber(
            Object.values(breakdown).reduce((sum, value) => sum + value, 0)
        )
    );

    return {
        total,
        staticCombatPower: total,
        breakdown,
        warnings,
        rulesVersion: rules.rulesVersion,
        combatBaseMode,
        combatParticipation: "static_and_effective"
    };
}

export const CombatPowerCalculator = Object.freeze({
    calculate,
    calculateContinuousLevelPower,
    calculateLevelPower,
    calculateMartialSoulQualityPower,
    calculateMartialSoulAvatarPower,
    calculateSoulRingPower,
    calculateSoulRingsPower,
    calculateSoulBonePower,
    calculateSoulBonesPower,
    calculateCoefficientModulePower,
    calculateEntityContributionModulePower,
    validateRules
});

export default CombatPowerCalculator;
