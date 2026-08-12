export const TALENT_GRADES = Object.freeze([
    "F",
    "E",
    "D",
    "C",
    "B",
    "A",
    "S",
    "god-level"
]);

export const ORDINARY_GROWTH_GRADES = Object.freeze([
    "E",
    "D",
    "C",
    "B",
    "A",
    "S",
    "god-level"
]);

export const TALENT_POOL_IDS = Object.freeze([
    "specialTalents",
    "opportunity",
    "encounterGrowth",
    "soulCoreGrowth"
]);

export const TALENT_IDENTITY_IDS = Object.freeze([
    "rural_commoner",
    "soul_master_child",
    "royal_knight_commander_child",
    "noble_child",
    "imperial",
    "nothing_owned",
    "sect_child",
    "divine_child",
    "divine_reincarnated",
    "reincarnator",
    "traverser",
    "luck_child"
]);

const EXPECTED_INNATE_MAPPING = Object.freeze([
    { min: 0, max: 0, talentGrade: "F", levelCap: 0 },
    { min: 1, max: 1, talentGrade: "E", levelCap: null },
    { min: 2, max: 3, talentGrade: "D", levelCap: null },
    { min: 4, max: 5, talentGrade: "C", levelCap: null },
    { min: 6, max: 7, talentGrade: "B", levelCap: null },
    { min: 8, max: 9, talentGrade: "A", levelCap: null },
    { min: 10, max: 10, talentGrade: "S", levelCap: null },
    { min: 20, max: 20, talentGrade: "god-level", levelCap: null }
]);

const EXPECTED_GROWTH_DELTAS = Object.freeze({
    E: [-5, -2, -1, 0, 1, 2],
    D: [-2, -1, 0, 1, 2, 3],
    C: [-1, 0, 1, 2, 3, 4],
    B: [0, 1, 2, 3, 4, 5],
    A: [1, 2, 3, 4, 5, 6],
    S: [2, 3, 4, 5, 6, 7],
    "god-level": [3, 4, 5, 6, 7, 8]
});

export class TalentRulesError extends Error {
    constructor(message, errors = []) {
        super(message);
        this.name = "TalentRulesError";
        this.errors = errors;
    }
}

export class TalentRuntimeError extends Error {
    constructor(code, message, details = {}) {
        super(message);
        this.name = "TalentRuntimeError";
        this.code = code;
        this.details = details;
    }
}

function isPlainObject(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return false;
    }

    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
}

function addIssue(issues, code, message, path, details = {}) {
    issues.push({
        code,
        message,
        path,
        ...details
    });
}

function cloneJsonValue(value) {
    if (value === undefined
        || value === null
        || typeof value === "string"
        || typeof value === "boolean") {
        return value;
    }

    if (typeof value === "number") {
        if (!Number.isFinite(value)) {
            throw new TypeError("Talent state numbers must be finite.");
        }

        return value;
    }

    if (Array.isArray(value)) {
        return value.map(cloneJsonValue);
    }

    if (isPlainObject(value)) {
        return Object.fromEntries(
            Object.entries(value).map(([key, entry]) => {
                return [key, cloneJsonValue(entry)];
            })
        );
    }

    throw new TypeError("Talent state values must be JSON-compatible plain data.");
}

function equalJson(left, right) {
    return JSON.stringify(left) === JSON.stringify(right);
}

function validateWeightedItems(
    items,
    path,
    errors,
    expectedDeltas = null,
    { requireNarrative = false } = {}
) {
    if (!Array.isArray(items) || items.length === 0) {
        addIssue(
            errors,
            "INVALID_TALENT_POOL_ITEMS",
            "Talent pool items must be a non-empty array.",
            path
        );
        return;
    }

    const ids = new Set();
    const names = new Set();
    let totalWeight = 0;
    items.forEach((item, index) => {
        const itemPath = `${path}[${index}]`;
        if (!isPlainObject(item)) {
            addIssue(errors, "INVALID_TALENT_POOL_ITEM", "Pool item must be an object.", itemPath);
            return;
        }

        if (typeof item.id !== "string" || item.id.length === 0 || ids.has(item.id)) {
            addIssue(errors, "INVALID_TALENT_POOL_ITEM_ID", "Pool item ids must be unique non-empty strings.", `${itemPath}.id`);
        } else {
            ids.add(item.id);
        }

        if (typeof item.name !== "string" || item.name.length === 0 || names.has(item.name)) {
            addIssue(errors, "INVALID_TALENT_POOL_ITEM_NAME", "Pool item names must be unique non-empty strings.", `${itemPath}.name`);
        } else {
            names.add(item.name);
        }

        if (!Number.isInteger(item.weight) || item.weight <= 0) {
            addIssue(errors, "INVALID_TALENT_POOL_ITEM_WEIGHT", "Pool item weight must be a positive integer.", `${itemPath}.weight`);
        } else {
            totalWeight += item.weight;
        }

        if (!Number.isInteger(item.delta)) {
            addIssue(errors, "INVALID_TALENT_GROWTH_DELTA", "Growth pool delta must be an integer.", `${itemPath}.delta`);
        }

        if (requireNarrative
            && (typeof item.narrative !== "string" || item.narrative.trim().length === 0)) {
            addIssue(
                errors,
                "MISSING_TALENT_GROWTH_NARRATIVE",
                "Every ordinary growth result must retain its source narrative text.",
                `${itemPath}.narrative`
            );
        }
    });

    if (expectedDeltas && !equalJson(items.map(item => item.delta), expectedDeltas)) {
        addIssue(
            errors,
            "INVALID_TALENT_GROWTH_VALUES",
            "Growth pool deltas do not match the confirmed provisional pool.",
            path,
            { expectedDeltas, actualDeltas: items.map(item => item.delta) }
        );
    }

    return totalWeight;
}

function validateEmptyPool(pool, path, errors, warnings) {
    if (!isPlainObject(pool)) {
        addIssue(errors, "INVALID_TALENT_EMPTY_POOL", "Talent pool definition must be an object.", path);
        return;
    }

    if (pool.status !== "unresolved") {
        addIssue(errors, "INVALID_TALENT_EMPTY_POOL_STATUS", "An empty unimplemented pool must remain unresolved.", `${path}.status`);
    }

    if (!Array.isArray(pool.entries) || pool.entries.length !== 0) {
        addIssue(errors, "INVALID_TALENT_EMPTY_POOL_ENTRIES", "This pool must remain empty until its contents are confirmed.", `${path}.entries`);
    }

    warnings.push({
        code: "EMPTY_TALENT_POOL_UNRESOLVED",
        message: "Talent pool is intentionally empty and remains unresolved.",
        path,
        status: "unresolved"
    });
}

function validateIdentityEntries(items, errors) {
    const expectedIds = [...TALENT_IDENTITY_IDS];
    if (!Array.isArray(items) || items.length !== expectedIds.length) {
        addIssue(
            errors,
            "INVALID_TALENT_IDENTITY_POOL",
            `Birth identity pool must contain ${expectedIds.length} entries.`,
            "birthIdentityRoll.items"
        );
        return;
    }

    const actualIds = items.map(item => item?.id);
    if (!equalJson(actualIds, expectedIds)) {
        addIssue(
            errors,
            "INVALID_TALENT_IDENTITY_ORDER",
            "Birth identity entries must retain the configured identity set and order.",
            "birthIdentityRoll.items",
            { expectedIds, actualIds }
        );
    }

    items.forEach((item, index) => {
        if (typeof item?.narrative !== "string" || item.narrative.trim().length === 0) {
            addIssue(
                errors,
                "MISSING_TALENT_IDENTITY_NARRATIVE",
                "Every birth identity must retain its source narrative text.",
                `birthIdentityRoll.items[${index}].narrative`
            );
        }
    });

    const weights = items.map(item => item?.weight);
    if (!weights.every(weight => Number.isInteger(weight) && weight > 0)
        || new Set(weights).size !== 1) {
        addIssue(
            errors,
            "INVALID_TALENT_IDENTITY_WEIGHTS",
            "Birth identity entries must use equal positive integer weights.",
            "birthIdentityRoll.items.weight"
        );
    }

    const byId = new Map(items.map(item => [item?.id, item]));
    const royal = byId.get("royal_knight_commander_child");
    if (!equalJson(royal?.annualGrowthBonuses, [1, 1])) {
        addIssue(
            errors,
            "INVALID_ROYAL_CHILD_BONUSES",
            "Royal knight commander child must apply both +1 annual bonuses.",
            "birthIdentityRoll.items.royal_knight_commander_child.annualGrowthBonuses"
        );
    }

    const luck = byId.get("luck_child");
    if (luck?.extraOpportunityDraws !== 1) {
        addIssue(
            errors,
            "INVALID_LUCK_CHILD_OPPORTUNITY_BONUS",
            "Luck child must have one extra opportunity draw before stacking inputs.",
            "birthIdentityRoll.items.luck_child.extraOpportunityDraws"
        );
    }

    const sect = byId.get("sect_child");
    if (sect?.encounterRestriction?.maxAgeExclusive !== 12
        || sect.encounterRestriction.replacementPool !== "ordinary"
        || sect.encounterRestriction.sameName !== true) {
        addIssue(
            errors,
            "INVALID_SECT_CHILD_REPLACEMENT",
            "Sect child restriction must replace pre-12 encounter growth with a same-name ordinary result.",
            "birthIdentityRoll.items.sect_child.encounterRestriction"
        );
    }

    const reincarnator = byId.get("reincarnator");
    if (reincarnator?.minimumLifeNumber !== 2
        || reincarnator.inheritance?.regenerateSameNameEntities !== true) {
        addIssue(
            errors,
            "INVALID_REINCARNATOR_RULE",
            "Reincarnator must be restricted to the second life and regenerate same-name entities.",
            "birthIdentityRoll.items.reincarnator"
        );
    }
}

export function validateTalentConfig(config) {
    const errors = [];
    const warnings = [];

    if (!isPlainObject(config)) {
        return {
            valid: false,
            errors: [{
                code: "INVALID_TALENT_CONFIG",
                message: "Talent config must be a plain object.",
                path: "config"
            }],
            warnings
        };
    }

    if (config.schemaVersion !== "talent-config/1.0"
        || config.rulesVersion !== "talent/1.0"
        || config.status !== "provisional") {
        addIssue(
            errors,
            "INVALID_TALENT_CONFIG_METADATA",
            "Talent config metadata must remain talent-config/1.0, talent/1.0, provisional.",
            "config"
        );
    }

    const mapping = config.innateSoulPower?.mapping;
    if (!Array.isArray(mapping)
        || !equalJson(mapping, EXPECTED_INNATE_MAPPING)) {
        addIssue(
            errors,
            "INVALID_INNATE_TALENT_MAPPING",
            "Innate soul power mapping does not match the confirmed mapping.",
            "innateSoulPower.mapping",
            { expected: EXPECTED_INNATE_MAPPING, actual: mapping }
        );
    }

    if (!equalJson(config.innateSoulPower?.supportedValues, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20])) {
        addIssue(
            errors,
            "INVALID_INNATE_SOUL_POWER_VALUES",
            "Supported innate soul power values are incomplete or reordered.",
            "innateSoulPower.supportedValues"
        );
    }

    if (config.levelConstraints?.globalMinimumLevel !== 1
        || config.levelConstraints?.majorLevelWidth !== 10
        || config.levelConstraints?.majorLevelFirstMinimum !== 1) {
        addIssue(
            errors,
            "INVALID_TALENT_LEVEL_CONSTRAINTS",
            "Talent level constraints must preserve global minimum 1 and ten-level major bands.",
            "levelConstraints"
        );
    }

    if (config.ordinaryGrowth?.probabilityMode !== "equal"
        || config.ordinaryGrowth?.currentLevelRange?.min !== 1
        || config.ordinaryGrowth?.currentLevelRange?.max !== 90
        || config.ordinaryGrowth?.currentLevelRange?.maxInclusive !== true) {
        addIssue(
            errors,
            "INVALID_ORDINARY_GROWTH_RANGE",
            "Ordinary growth must be equal-probability and available through current level 90.",
            "ordinaryGrowth"
        );
    }

    ORDINARY_GROWTH_GRADES.forEach(grade => {
        const pool = config.ordinaryGrowth?.pools?.[grade];
        const path = `ordinaryGrowth.pools.${grade}`;
        if (!isPlainObject(pool) || pool.totalWeight !== 6) {
            addIssue(errors, "INVALID_ORDINARY_GROWTH_POOL", "Ordinary growth pool must have total weight 6.", path);
        }
        const totalWeight = validateWeightedItems(
            pool?.items,
            `${path}.items`,
            errors,
            EXPECTED_GROWTH_DELTAS[grade],
            { requireNarrative: true }
        );
        if (totalWeight !== undefined && totalWeight !== pool?.totalWeight) {
            addIssue(errors, "INVALID_ORDINARY_GROWTH_WEIGHT_TOTAL", "Ordinary growth item weights must equal totalWeight.", `${path}.totalWeight`);
        }
    });

    validateIdentityEntries(config.birthIdentityRoll?.items, errors);

    ["specialTalents", "opportunity", "encounterGrowth", "soulCoreGrowth"].forEach(poolId => {
        validateEmptyPool(config.pools?.[poolId], `pools.${poolId}`, errors, warnings);
    });

    if (config.pools?.soulCoreGrowth?.activationMinCurrentLevel !== 91) {
        addIssue(
            errors,
            "INVALID_SOUL_CORE_GROWTH_BOUNDARY",
            "Soul core growth must remain empty from current level 91 onward.",
            "pools.soulCoreGrowth.activationMinCurrentLevel"
        );
    }

    return { valid: errors.length === 0, errors, warnings };
}

export function assertValidTalentConfig(config) {
    const validation = validateTalentConfig(config);
    if (!validation.valid) {
        throw new TalentRulesError(
            "Talent config failed validation.",
            validation.errors
        );
    }

    return validation;
}

export function validateTalentRules(catalog) {
    const errors = [];

    if (!isPlainObject(catalog)) {
        return {
            valid: false,
            errors: [{
                code: "INVALID_TALENT_RULE_CATALOG",
                message: "Talent rule catalog must be a plain object.",
                path: "catalog"
            }]
        };
    }

    if (catalog.schemaVersion !== "talent-rule-catalog/1.0"
        || catalog.catalogVersion !== "talent-rule-catalog/2026-08-12"
        || catalog.status !== "provisional") {
        addIssue(errors, "INVALID_TALENT_RULE_CATALOG_METADATA", "Talent rule catalog metadata is invalid.", "catalog");
    }

    if (catalog.source?.file !== "talent.docx"
        || catalog.source?.structuredTextRead !== true) {
        addIssue(errors, "INVALID_TALENT_RULE_CATALOG_SOURCE", "Talent rule catalog source must retain the structured talent.docx receipt.", "source");
    }

    const expectedCatalogMapping = EXPECTED_INNATE_MAPPING.flatMap(entry => {
        const values = [];
        for (let innateSoulPower = entry.min; innateSoulPower <= entry.max; innateSoulPower += 1) {
            values.push({
                innateSoulPower,
                talentGrade: entry.talentGrade,
                ...(entry.levelCap === null ? {} : { levelCap: entry.levelCap }),
                status: "confirmed"
            });
        }
        return values;
    });
    if (!equalJson(catalog.innateSoulPowerToTalentGrade, expectedCatalogMapping)) {
        addIssue(errors, "INVALID_TALENT_RULE_MAPPING", "Talent rule catalog mapping is incomplete.", "innateSoulPowerToTalentGrade");
    }

    ORDINARY_GROWTH_GRADES.forEach(grade => {
        const narratives = catalog.ordinaryGrowthPools?.narrativesByTalentGrade?.[grade];
        const path = `ordinaryGrowthPools.narrativesByTalentGrade.${grade}`;
        if (!Array.isArray(narratives)
            || narratives.length !== EXPECTED_GROWTH_DELTAS[grade].length
            || !narratives.every(narrative => {
                return typeof narrative === "string" && narrative.trim().length > 0;
            })) {
            addIssue(
                errors,
                "INVALID_TALENT_RULE_NARRATIVES",
                "Every ordinary growth pool must retain a non-empty source narrative for each delta.",
                path
            );
        }
    });

    if (!isPlainObject(catalog.birthIdentities)
        || !Array.isArray(catalog.birthIdentities.entries)
        || catalog.birthIdentities.entries.length !== TALENT_IDENTITY_IDS.length) {
        addIssue(errors, "INVALID_TALENT_RULE_IDENTITIES", "Talent rule catalog must list all birth identities.", "birthIdentities.entries");
    } else {
        catalog.birthIdentities.entries.forEach((entry, index) => {
            if (typeof entry?.narrative !== "string" || entry.narrative.trim().length === 0) {
                addIssue(
                    errors,
                    "MISSING_TALENT_RULE_IDENTITY_NARRATIVE",
                    "Every catalog birth identity must retain its source narrative.",
                    `birthIdentities.entries[${index}].narrative`
                );
            }
        });
    }

    ["specialTalents", "opportunity", "encounterGrowth", "soulCoreGrowth"].forEach(poolId => {
        const pool = catalog.separatePools?.[poolId];
        if (pool?.status !== "unresolved" || !Array.isArray(pool.entries) || pool.entries.length !== 0) {
            addIssue(errors, "INVALID_TALENT_RULE_EMPTY_POOL", "Unresolved talent pools must remain explicitly empty.", `separatePools.${poolId}`);
        }
    });

    return { valid: errors.length === 0, errors };
}

export function assertValidTalentRules(catalog) {
    const validation = validateTalentRules(catalog);
    if (!validation.valid) {
        throw new TalentRulesError(
            "Talent rule catalog failed validation.",
            validation.errors
        );
    }

    return validation;
}

function requirePlainConfig(config) {
    if (!isPlainObject(config)) {
        throw new TalentRuntimeError(
            "INVALID_TALENT_CONFIG",
            "Talent runtime requires a plain config object."
        );
    }
}

function requireInteger(value, code, message) {
    if (!Number.isInteger(value)) {
        throw new TalentRuntimeError(code, message, { received: value });
    }
}

function drawWeighted(items, rng) {
    if (!Array.isArray(items) || items.length === 0) {
        throw new TalentRuntimeError(
            "EMPTY_TALENT_POOL",
            "Cannot draw from an empty talent pool."
        );
    }

    if (typeof rng !== "function") {
        throw new TalentRuntimeError(
            "INVALID_TALENT_RNG",
            "Talent draws require an injected RNG function."
        );
    }

    const roll = rng();
    if (!Number.isFinite(roll) || roll < 0 || roll >= 1) {
        throw new TalentRuntimeError(
            "INVALID_TALENT_RNG",
            "Talent RNG must return a finite number in [0, 1).",
            { roll }
        );
    }

    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    if (!Number.isFinite(totalWeight) || totalWeight <= 0) {
        throw new TalentRuntimeError(
            "INVALID_TALENT_POOL_WEIGHT",
            "Talent pool total weight must be positive."
        );
    }

    const target = roll * totalWeight;
    let cursor = 0;
    for (const item of items) {
        cursor += item.weight;
        if (target < cursor) {
            return {
                item,
                roll,
                target,
                totalWeight
            };
        }
    }

    return {
        item: items[items.length - 1],
        roll,
        target,
        totalWeight
    };
}

function getIdentity(config, identityId) {
    const identity = config.birthIdentityRoll?.items?.find(item => item.id === identityId);
    if (!identity) {
        throw new TalentRuntimeError(
            "UNKNOWN_TALENT_IDENTITY",
            `Unknown birth identity "${String(identityId)}".`,
            { identityId }
        );
    }

    return identity;
}

function assertIdentityEligible(identity, lifeNumber) {
    if (identity.minimumLifeNumber !== undefined
        && lifeNumber < identity.minimumLifeNumber) {
        throw new TalentRuntimeError(
            "IDENTITY_NOT_AVAILABLE_IN_LIFE",
            `Identity "${identity.id}" is only available from life ${identity.minimumLifeNumber}.`,
            { identityId: identity.id, lifeNumber }
        );
    }
}

export function drawBirthIdentity({ config, rng, lifeNumber = 1 }) {
    requirePlainConfig(config);
    requireInteger(lifeNumber, "INVALID_LIFE_NUMBER", "lifeNumber must be an integer.");
    if (lifeNumber < 1) {
        throw new TalentRuntimeError("INVALID_LIFE_NUMBER", "lifeNumber must be at least 1.");
    }

    const eligible = (config.birthIdentityRoll?.items ?? []).filter(identity => {
        return identity.minimumLifeNumber === undefined
            || lifeNumber >= identity.minimumLifeNumber;
    });
    if (eligible.length === 0) {
        throw new TalentRuntimeError(
            "NO_ELIGIBLE_TALENT_IDENTITY",
            "No birth identity is eligible for this life number.",
            { lifeNumber }
        );
    }

    const draw = drawWeighted(eligible, rng);
    return {
        identityId: draw.item.id,
        identityName: draw.item.name,
        identityNarrative: draw.item.narrative ?? "",
        lifeNumber,
        eligibleIdentityIds: eligible.map(identity => identity.id),
        draw: {
            roll: draw.roll,
            target: draw.target,
            totalWeight: draw.totalWeight
        }
    };
}

export function mapInnateSoulPowerToTalentGrade(innateSoulPower, config) {
    requirePlainConfig(config);
    requireInteger(
        innateSoulPower,
        "INVALID_INNATE_SOUL_POWER",
        "Innate soul power must be an integer."
    );

    const mapping = config.innateSoulPower?.mapping ?? [];
    const entry = mapping.find(candidate => {
        return innateSoulPower >= candidate.min && innateSoulPower <= candidate.max;
    });
    if (!entry) {
        throw new TalentRuntimeError(
            "UNSUPPORTED_INNATE_SOUL_POWER",
            `Innate soul power ${innateSoulPower} has no configured talent grade.`,
            { innateSoulPower }
        );
    }

    return {
        innateSoulPower,
        talentGrade: entry.talentGrade,
        levelCap: entry.levelCap ?? null
    };
}

function resolveBirthInnateSoulPower(baseInnateSoulPower, identity) {
    requireInteger(
        baseInnateSoulPower,
        "INVALID_INNATE_SOUL_POWER",
        "Base innate soul power must be an integer."
    );

    let value = identity.fixedInnateSoulPower !== undefined
        ? identity.fixedInnateSoulPower
        : baseInnateSoulPower + (identity.innateSoulPowerDelta ?? 0);

    if (identity.innateSoulPowerMinimum !== undefined) {
        value = Math.max(value, identity.innateSoulPowerMinimum);
    }
    if (identity.innateSoulPowerMaximum !== undefined) {
        value = Math.min(value, identity.innateSoulPowerMaximum);
    }

    return value;
}

export function resolveBirthState({
    config,
    baseInnateSoulPower,
    rng,
    lifeNumber = 1,
    identityId = null
}) {
    requirePlainConfig(config);
    let identityDraw = null;
    let selectedIdentityId = identityId;

    if (selectedIdentityId === null) {
        identityDraw = drawBirthIdentity({ config, rng, lifeNumber });
        selectedIdentityId = identityDraw.identityId;
    }

    const identity = getIdentity(config, selectedIdentityId);
    assertIdentityEligible(identity, lifeNumber);
    const innateSoulPower = resolveBirthInnateSoulPower(baseInnateSoulPower, identity);
    const grade = mapInnateSoulPowerToTalentGrade(innateSoulPower, config);

    return {
        status: "resolved",
        lifeNumber,
        identityId: identity.id,
        identityName: identity.name,
        identityNarrative: identity.narrative ?? "",
        identityDraw,
        innateSoulPower,
        talentGrade: grade.talentGrade,
        talentLevelCap: grade.levelCap,
        annualGrowthBonuses: [...(identity.annualGrowthBonuses ?? [])],
        annualMoneyDelta: identity.annualMoneyDelta ?? 0,
        extraOpportunityDraws: identity.extraOpportunityDraws ?? 0,
        removeNegativeGrowth: identity.removeNegativeGrowth === true,
        martialSoulPolicy: identity.martialSoulPolicy ?? "any",
        specialTalentPolicy: identity.specialTalentPolicy ?? "optional_pool",
        specialTalentId: identity.specialTalentId ?? null,
        guaranteedTwinMartialSouls: identity.guaranteedTwinMartialSouls === true,
        encounterRestriction: cloneJsonValue(identity.encounterRestriction ?? null),
        inheritance: cloneJsonValue(identity.inheritance ?? null)
    };
}

export function getMajorLevelMinimum(currentLevel, config) {
    requirePlainConfig(config);
    requireInteger(currentLevel, "INVALID_CURRENT_LEVEL", "currentLevel must be an integer.");

    if (currentLevel < config.levelConstraints.globalMinimumLevel) {
        throw new TalentRuntimeError(
            "INVALID_CURRENT_LEVEL",
            "currentLevel is below the global talent level minimum.",
            { currentLevel }
        );
    }

    const width = config.levelConstraints.majorLevelWidth;
    const firstMinimum = config.levelConstraints.majorLevelFirstMinimum;
    return Math.floor((currentLevel - firstMinimum) / width) * width + firstMinimum;
}

export function applyGrowthDelta(currentLevel, delta, config) {
    requirePlainConfig(config);
    requireInteger(currentLevel, "INVALID_CURRENT_LEVEL", "currentLevel must be an integer.");
    requireInteger(delta, "INVALID_TALENT_GROWTH_DELTA", "Talent growth delta must be an integer.");

    const globalMinimum = config.levelConstraints.globalMinimumLevel;
    if (currentLevel === 0) {
        return 0;
    }
    if (currentLevel < globalMinimum) {
        throw new TalentRuntimeError(
            "INVALID_CURRENT_LEVEL",
            "Non-observer currentLevel must be at least the global minimum.",
            { currentLevel }
        );
    }

    const candidate = currentLevel + delta;
    if (delta < 0) {
        return Math.max(globalMinimum, getMajorLevelMinimum(currentLevel, config), candidate);
    }

    return Math.max(globalMinimum, candidate);
}

function getOrdinaryGrowthItems(config, talentGrade, identity) {
    const items = config.ordinaryGrowth?.pools?.[talentGrade]?.items;
    if (!Array.isArray(items) || items.length === 0) {
        throw new TalentRuntimeError(
            "EMPTY_ORDINARY_GROWTH_POOL",
            `No ordinary growth pool exists for talent grade "${String(talentGrade)}".`,
            { talentGrade }
        );
    }

    if (identity?.removeNegativeGrowth !== true) {
        return items;
    }

    const positiveOnly = items.filter(item => item.delta >= 0);
    if (positiveOnly.length === 0) {
        throw new TalentRuntimeError(
            "EMPTY_RURAL_GROWTH_POOL",
            "Rural commoner filtering removed every ordinary growth result.",
            { talentGrade }
        );
    }

    return positiveOnly;
}

function getAnnualGrowthBonuses(identity) {
    return (identity?.annualGrowthBonuses ?? []).map((bonus, index) => {
        if (!Number.isInteger(bonus)) {
            throw new TalentRuntimeError(
                "INVALID_IDENTITY_GROWTH_BONUS",
                "Identity annual growth bonuses must be integers.",
                { index, bonus }
            );
        }
        return bonus;
    });
}

function materializeGrowthResult({
    config,
    identity,
    currentLevel,
    poolId,
    draw,
    warnings = [],
    replacement = null
}) {
    if (!Number.isInteger(draw.item.delta)) {
        return {
            status: "unresolved",
            code: "GROWTH_RESULT_HAS_NO_DELTA",
            poolId,
            currentLevel,
            nextLevel: currentLevel,
            draws: [cloneJsonValue(draw)],
            warnings: [{
                code: "GROWTH_RESULT_HAS_NO_DELTA",
                message: "Selected growth result has no integer level delta.",
                path: `${poolId}.${draw.item.id}`,
                status: "unresolved"
            }]
        };
    }

    const identityGrowthBonuses = getAnnualGrowthBonuses(identity);
    const identityBonusTotal = identityGrowthBonuses.reduce((sum, value) => sum + value, 0);
    const rawDelta = draw.item.delta + identityBonusTotal;
    const nextLevel = applyGrowthDelta(currentLevel, rawDelta, config);

    return {
        status: replacement ? "replaced" : "resolved",
        poolId,
        currentLevel,
        lowerBound: currentLevel === 0 ? 0 : getMajorLevelMinimum(currentLevel, config),
        selectedResult: cloneJsonValue(draw.item),
        draw: {
            roll: draw.roll,
            target: draw.target,
            totalWeight: draw.totalWeight
        },
        draws: [cloneJsonValue(draw.item)],
        drawnDelta: draw.item.delta,
        identityGrowthBonuses,
        identityBonusTotal,
        annualMoneyDelta: identity?.annualMoneyDelta ?? 0,
        rawDelta,
        nextLevel,
        actualDelta: nextLevel - currentLevel,
        replacement,
        warnings
    };
}

function emptyPoolResult(poolId, currentLevel, code = "EMPTY_TALENT_POOL") {
    return {
        status: "unresolved",
        code,
        poolId,
        currentLevel,
        nextLevel: currentLevel,
        draws: [],
        warnings: [{
            code,
            message: `Talent pool "${poolId}" is empty and remains unresolved.`,
            path: `pools.${poolId}.entries`,
            status: "unresolved"
        }]
    };
}

function attachOpportunityDraw(result, {
    config,
    identity,
    identityId,
    rng,
    additionalOpportunityDraws
}) {
    const configuredDraws = identity?.extraOpportunityDraws ?? 0;
    if (configuredDraws === 0 && additionalOpportunityDraws === 0) {
        return result;
    }

    const opportunity = drawOpportunityPool({
        config,
        identityId,
        rng,
        additionalDraws: additionalOpportunityDraws
    });
    return {
        ...result,
        opportunity,
        warnings: [
            ...(result.warnings ?? []),
            ...(opportunity.warnings ?? [])
        ]
    };
}

export function drawSpecialTalent({ config, identityId, rng }) {
    requirePlainConfig(config);
    const identity = getIdentity(config, identityId);
    const policy = identity.specialTalentPolicy ?? "optional_pool";

    if (policy === "forbidden") {
        return {
            status: "forbidden",
            identityId,
            poolId: "specialTalents",
            draws: [],
            warnings: []
        };
    }

    if (policy === "fixed") {
        return {
            status: "fixed",
            identityId,
            poolId: "specialTalents",
            selectedTalentId: identity.specialTalentId,
            draws: [],
            warnings: []
        };
    }

    const entries = config.pools?.specialTalents?.entries ?? [];
    if (entries.length === 0) {
        const result = emptyPoolResult("specialTalents", null, "SPECIAL_TALENT_POOL_UNRESOLVED");
        return {
            ...result,
            identityId,
            guaranteed: policy === "guaranteed_pool"
        };
    }

    const draw = drawWeighted(entries, rng);
    return {
        status: policy === "guaranteed_pool" ? "guaranteed" : "resolved",
        identityId,
        poolId: "specialTalents",
        guaranteed: policy === "guaranteed_pool",
        selectedTalent: cloneJsonValue(draw.item),
        draw: {
            roll: draw.roll,
            target: draw.target,
            totalWeight: draw.totalWeight
        },
        draws: [cloneJsonValue(draw.item)],
        warnings: []
    };
}

export function drawOpportunityPool({
    config,
    identityId,
    rng,
    additionalDraws = 0
}) {
    requirePlainConfig(config);
    requireInteger(additionalDraws, "INVALID_OPPORTUNITY_DRAW_COUNT", "additionalDraws must be an integer.");
    if (additionalDraws < 0) {
        throw new TalentRuntimeError("INVALID_OPPORTUNITY_DRAW_COUNT", "additionalDraws cannot be negative.");
    }

    const identity = getIdentity(config, identityId);
    const drawCount = (identity.extraOpportunityDraws ?? 0) + additionalDraws;
    if (drawCount === 0) {
        return {
            status: "not_applicable",
            identityId,
            poolId: "opportunity",
            drawCount: 0,
            draws: [],
            warnings: []
        };
    }

    const entries = config.pools?.opportunity?.entries ?? [];
    if (entries.length === 0) {
        const result = emptyPoolResult("opportunity", null, "OPPORTUNITY_POOL_UNRESOLVED");
        return {
            ...result,
            identityId,
            drawCount
        };
    }

    const draws = [];
    for (let index = 0; index < drawCount; index += 1) {
        const draw = drawWeighted(entries, rng);
        draws.push({
            item: cloneJsonValue(draw.item),
            roll: draw.roll,
            target: draw.target,
            totalWeight: draw.totalWeight
        });
    }

    return {
        status: "resolved",
        identityId,
        poolId: "opportunity",
        drawCount,
        draws,
        warnings: []
    };
}

export function resolveAnnualGrowth({
    config,
    currentLevel,
    talentGrade,
    identityId = null,
    age = null,
    requestedPool = "ordinary",
    rng,
    additionalOpportunityDraws = 0
}) {
    requirePlainConfig(config);
    requireInteger(currentLevel, "INVALID_CURRENT_LEVEL", "currentLevel must be an integer.");

    if (currentLevel < 0) {
        throw new TalentRuntimeError("INVALID_CURRENT_LEVEL", "currentLevel cannot be negative.");
    }

    const identity = identityId === null ? null : getIdentity(config, identityId);

    if (requestedPool === "opportunity") {
        return drawOpportunityPool({
            config,
            identityId,
            rng,
            additionalDraws: additionalOpportunityDraws
        });
    }

    if (requestedPool === "specialTalents") {
        return drawSpecialTalent({ config, identityId, rng });
    }

    if (requestedPool === "soulCoreGrowth") {
        return attachOpportunityDraw(
            emptyPoolResult("soulCoreGrowth", currentLevel, "SOUL_CORE_GROWTH_UNRESOLVED"),
            {
                config,
                identity,
                identityId,
                rng,
                additionalOpportunityDraws
            }
        );
    }

    if (currentLevel === 0) {
        return {
            status: "civilian_observer",
            poolId: "civilian_observer",
            currentLevel: 0,
            nextLevel: 0,
            drawnDelta: 0,
            rawDelta: 0,
            actualDelta: 0,
            draws: [],
            warnings: []
        };
    }

    if (requestedPool === "ordinary"
        && currentLevel > config.ordinaryGrowth.currentLevelRange.max) {
        return emptyPoolResult("soulCoreGrowth", currentLevel, "SOUL_CORE_GROWTH_UNRESOLVED");
    }

    if (requestedPool === "encounterGrowth") {
        const encounterEntries = config.pools?.encounterGrowth?.entries ?? [];
        if (encounterEntries.length === 0) {
            return emptyPoolResult("encounterGrowth", currentLevel, "ENCOUNTER_GROWTH_POOL_UNRESOLVED");
        }

        const encounterDraw = drawWeighted(encounterEntries, rng);
        const restriction = identity?.encounterRestriction;
        const blocked = restriction
            && age !== null
            && Number.isInteger(age)
            && age < restriction.maxAgeExclusive;

        if (blocked) {
            const ordinaryItems = getOrdinaryGrowthItems(config, talentGrade, identity)
                .filter(item => item.name === encounterDraw.item.name);
            if (ordinaryItems.length === 0) {
                return {
                    status: "unresolved",
                    code: "MISSING_SAME_NAME_ORDINARY_RESULT",
                    poolId: "ordinary",
                    currentLevel,
                    nextLevel: currentLevel,
                    draws: [cloneJsonValue(encounterDraw.item)],
                    warnings: [{
                        code: "MISSING_SAME_NAME_ORDINARY_RESULT",
                        message: "Sect-child encounter restriction could not regenerate a same-name ordinary result.",
                        path: `ordinaryGrowth.pools.${talentGrade}.items`,
                        status: "unresolved",
                        blockedResultName: encounterDraw.item.name
                    }]
                };
            }

            const ordinaryDraw = drawWeighted(ordinaryItems, rng);
            return attachOpportunityDraw(materializeGrowthResult({
                config,
                identity,
                currentLevel,
                poolId: "ordinary",
                draw: ordinaryDraw,
                replacement: {
                    reason: "SECT_CHILD_PRE_12_ENCOUNTER_REPLACED",
                    originalPoolId: "encounterGrowth",
                    originalResultName: encounterDraw.item.name
                }
            }), {
                config,
                identity,
                identityId,
                rng,
                additionalOpportunityDraws
            });
        }

        return attachOpportunityDraw(materializeGrowthResult({
            config,
            identity,
            currentLevel,
            poolId: "encounterGrowth",
            draw: encounterDraw
        }), {
            config,
            identity,
            identityId,
            rng,
            additionalOpportunityDraws
        });
    }

    const ordinaryItems = getOrdinaryGrowthItems(config, talentGrade, identity);
    const ordinaryDraw = drawWeighted(ordinaryItems, rng);
    return attachOpportunityDraw(materializeGrowthResult({
        config,
        identity,
        currentLevel,
        poolId: "ordinary",
        draw: ordinaryDraw
    }), {
        config,
        identity,
        identityId,
        rng,
        additionalOpportunityDraws
    });
}

function defaultInstanceIdFactory(oldInstanceId, entity, index) {
    const base = oldInstanceId
        || entity.instanceId
        || entity.id
        || entity.name
        || "entity";
    return `${base}_regenerated_${index + 1}`;
}

export function regenerateEntities(entities, { instanceIdFactory = defaultInstanceIdFactory } = {}) {
    if (!Array.isArray(entities)) {
        throw new TalentRuntimeError(
            "INVALID_REINCARNATED_ENTITIES",
            "Entities to regenerate must be an array."
        );
    }
    if (typeof instanceIdFactory !== "function") {
        throw new TalentRuntimeError(
            "INVALID_INSTANCE_ID_FACTORY",
            "instanceIdFactory must be a function."
        );
    }

    const seenIds = new Set();
    return entities.map((entity, index) => {
        if (!isPlainObject(entity)) {
            throw new TalentRuntimeError(
                "INVALID_REINCARNATED_ENTITY",
                "Each reincarnated entity must be a plain object.",
                { index }
            );
        }

        const clone = cloneJsonValue(entity);
        const oldInstanceId = clone.instanceId ?? clone.id ?? clone.name ?? `entity_${index + 1}`;
        const newInstanceId = instanceIdFactory(oldInstanceId, clone, index);
        if (typeof newInstanceId !== "string"
            || newInstanceId.length === 0
            || newInstanceId === oldInstanceId
            || seenIds.has(newInstanceId)) {
            throw new TalentRuntimeError(
                "INVALID_REGENERATED_INSTANCE_ID",
                "Reincarnated entities require unique instance ids different from the previous life.",
                { index, oldInstanceId, newInstanceId }
            );
        }

        clone.instanceId = newInstanceId;
        seenIds.add(newInstanceId);
        return clone;
    });
}

export function inheritReincarnatedState(previousLife, options = {}) {
    if (!isPlainObject(previousLife)) {
        throw new TalentRuntimeError(
            "INVALID_PREVIOUS_LIFE",
            "previousLife must be a plain object."
        );
    }

    return {
        identityId: previousLife.identityId ?? null,
        innateSoulPower: previousLife.innateSoulPower ?? null,
        talentGrade: previousLife.talentGrade ?? null,
        talent: cloneJsonValue(previousLife.talent ?? null),
        identityTraits: cloneJsonValue(previousLife.identityTraits ?? null),
        postnatalAttributes: cloneJsonValue(previousLife.postnatalAttributes ?? []),
        domains: regenerateEntities(previousLife.domains ?? [], options),
        skills: regenerateEntities(previousLife.skills ?? [], options)
    };
}
