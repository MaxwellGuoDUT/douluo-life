import {
    assertValidAnnualSession,
    commitAnnualStep
} from "./annual-session.js";
import {
    assertValidPlayerV2,
    clonePlayerStateValue
} from "./player-v2.js";

export const AWAKENING_FORMS = Object.freeze([
    "tool",
    "beast",
    "plant",
    "food",
    "body"
]);

export const AWAKENING_QUALITY_GRADES = Object.freeze([
    "low",
    "ordinary",
    "top",
    "extreme"
]);

export const AWAKENING_INNATE_SOUL_POWER_VALUES = Object.freeze([
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    20
]);

const MAIN_CANON_LEVELS = Object.freeze(["canon", "expanded"]);
const CONTEXT_PATH_PATTERN = /^[A-Za-z][A-Za-z0-9]*(?:\.[A-Za-z][A-Za-z0-9]*)*$/;

function isPlainObject(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return false;
    }

    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
}

function isNonEmptyString(value) {
    return typeof value === "string" && value.length > 0;
}

function addIssue(issues, code, message, path, details = {}) {
    issues.push({
        code,
        message,
        path,
        ...details
    });
}

function fail(code, message, details = {}) {
    throw new ProductionAwakeningError(code, message, details);
}

function countBy(items, field, values) {
    return Object.fromEntries(values.map(value => [
        value,
        items.filter(item => item[field] === value).length
    ]));
}

export function getMartialSoulCatalogStats(catalog) {
    const definitions = Array.isArray(catalog?.definitions)
        ? catalog.definitions
        : [];
    const grid = Object.fromEntries(AWAKENING_FORMS.map(form => [
        form,
        Object.fromEntries(AWAKENING_QUALITY_GRADES.map(quality => [
            quality,
            definitions.filter(definition => {
                return definition.form === form
                    && definition.qualityGrade === quality;
            }).length
        ]))
    ]));

    return {
        total: definitions.length,
        canonLevels: countBy(
            definitions,
            "canonLevel",
            ["canon", "expanded", "crossover", "parody"]
        ),
        forms: countBy(definitions, "form", AWAKENING_FORMS),
        qualities: countBy(
            definitions,
            "qualityGrade",
            AWAKENING_QUALITY_GRADES
        ),
        grid,
        duplicateNames: definitions.length - new Set(
            definitions.map(definition => definition.name)
        ).size,
        duplicateIds: definitions.length - new Set(
            definitions.map(definition => definition.id)
        ).size
    };
}

export function validateMartialSoulCatalog(catalog) {
    const errors = [];

    if (!isPlainObject(catalog)) {
        return {
            valid: false,
            errors: [{
                code: "INVALID_MARTIAL_SOUL_CATALOG",
                message: "Martial-soul catalog must be a plain object.",
                path: "catalog"
            }],
            stats: getMartialSoulCatalogStats(null)
        };
    }

    if (catalog.schemaVersion !== "martial-soul-catalog/1.0") {
        addIssue(
            errors,
            "INVALID_MARTIAL_SOUL_CATALOG_SCHEMA",
            "Unsupported martial-soul catalog schemaVersion.",
            "schemaVersion"
        );
    }

    if (!isNonEmptyString(catalog.catalogVersion)) {
        addIssue(
            errors,
            "MISSING_MARTIAL_SOUL_CATALOG_VERSION",
            "catalogVersion must be a non-empty string.",
            "catalogVersion"
        );
    }

    if (catalog.status !== "production") {
        addIssue(
            errors,
            "NON_PRODUCTION_MARTIAL_SOUL_CATALOG",
            "Martial-soul catalog status must be production.",
            "status"
        );
    }

    if (!Array.isArray(catalog.allowedCanonLevels)
        || catalog.allowedCanonLevels.length !== MAIN_CANON_LEVELS.length
        || !MAIN_CANON_LEVELS.every(level => {
            return catalog.allowedCanonLevels.includes(level);
        })) {
        addIssue(
            errors,
            "INVALID_MAIN_MODE_BOUNDARY",
            "Main-mode catalog must allow canon and expanded only.",
            "allowedCanonLevels"
        );
    }

    if (!Array.isArray(catalog.definitions)) {
        addIssue(
            errors,
            "INVALID_MARTIAL_SOUL_DEFINITIONS",
            "definitions must be an array.",
            "definitions"
        );
    } else {
        catalog.definitions.forEach((definition, index) => {
            const path = `definitions[${index}]`;
            if (!isPlainObject(definition)) {
                addIssue(
                    errors,
                    "INVALID_MARTIAL_SOUL_DEFINITION",
                    "Catalog definitions must be plain objects.",
                    path
                );
                return;
            }

            ["id", "name", "sourceReview"].forEach(field => {
                if (!isNonEmptyString(definition[field])) {
                    addIssue(
                        errors,
                        "INVALID_MARTIAL_SOUL_DEFINITION_FIELD",
                        `${field} must be a non-empty string.`,
                        `${path}.${field}`
                    );
                }
            });

            if (!AWAKENING_FORMS.includes(definition.form)) {
                addIssue(
                    errors,
                    "UNKNOWN_MARTIAL_SOUL_FORM",
                    `Unknown martial-soul form "${String(definition.form)}".`,
                    `${path}.form`
                );
            }

            if (!AWAKENING_QUALITY_GRADES.includes(
                definition.qualityGrade
            )) {
                addIssue(
                    errors,
                    "UNKNOWN_MARTIAL_SOUL_QUALITY",
                    `Unknown martial-soul quality "${String(definition.qualityGrade)}".`,
                    `${path}.qualityGrade`
                );
            }

            if (!Array.isArray(definition.attributes)
                || definition.attributes.some(attribute => {
                    return !isNonEmptyString(attribute);
                })) {
                addIssue(
                    errors,
                    "INVALID_MARTIAL_SOUL_ATTRIBUTES",
                    "attributes must be an array of non-empty strings.",
                    `${path}.attributes`
                );
            }

            if (!MAIN_CANON_LEVELS.includes(definition.canonLevel)) {
                addIssue(
                    errors,
                    "FORBIDDEN_MAIN_MODE_CONTENT",
                    "Main-mode catalog contains forbidden canonLevel content.",
                    `${path}.canonLevel`
                );
            }

            if (definition.reviewStatus !== "confirmed"
                || definition.enabled !== true) {
                addIssue(
                    errors,
                    "UNCONFIRMED_MARTIAL_SOUL_DEFINITION",
                    "Production definitions must be confirmed and enabled.",
                    path
                );
            }
        });
    }

    const stats = getMartialSoulCatalogStats(catalog);
    if (stats.total !== 271
        || stats.canonLevels.canon !== 233
        || stats.canonLevels.expanded !== 38
        || stats.canonLevels.crossover !== 0
        || stats.canonLevels.parody !== 0) {
        addIssue(
            errors,
            "INVALID_MARTIAL_SOUL_CATALOG_COUNTS",
            "Production catalog must contain 271 definitions: 233 canon and 38 expanded.",
            "definitions",
            { stats }
        );
    }

    if (stats.duplicateIds !== 0 || stats.duplicateNames !== 0) {
        addIssue(
            errors,
            "DUPLICATE_MARTIAL_SOUL_CATALOG_IDENTITY",
            "Production catalog names and IDs must be unique.",
            "definitions",
            { stats }
        );
    }

    AWAKENING_FORMS.forEach(form => {
        AWAKENING_QUALITY_GRADES.forEach(quality => {
            if (stats.grid[form][quality] === 0) {
                addIssue(
                    errors,
                    "EMPTY_MARTIAL_SOUL_CATALOG_CELL",
                    "Every form-quality catalog cell must be non-empty.",
                    `definitions.${form}.${quality}`
                );
            }
        });
    });

    return {
        valid: errors.length === 0,
        errors,
        stats
    };
}

export function assertValidMartialSoulCatalog(catalog) {
    const validation = validateMartialSoulCatalog(catalog);
    if (!validation.valid) {
        fail(
            "INVALID_MARTIAL_SOUL_CATALOG",
            "Martial-soul catalog failed production validation.",
            validation
        );
    }
    return validation;
}

function validateWeightedItems({
    items,
    totalWeight,
    path,
    valueField,
    expectedValues,
    errors
}) {
    if (!Array.isArray(items) || items.length !== expectedValues.length) {
        addIssue(
            errors,
            "INVALID_AWAKENING_WEIGHT_ROW",
            `${path} must contain ${expectedValues.length} items.`,
            path
        );
        return;
    }

    const values = new Set();
    let actualTotal = 0;
    items.forEach((item, index) => {
        const itemPath = `${path}[${index}]`;
        if (!isPlainObject(item)
            || !isNonEmptyString(item.id)
            || !isNonEmptyString(item.text)
            || !Number.isInteger(item.weight)
            || item.weight < 0) {
            addIssue(
                errors,
                "INVALID_AWAKENING_WEIGHT_ITEM",
                "Weighted items require id, text, and a non-negative integer weight.",
                itemPath
            );
            return;
        }
        actualTotal += item.weight;
        values.add(item[valueField]);
    });

    if (actualTotal !== totalWeight) {
        addIssue(
            errors,
            "INVALID_AWAKENING_WEIGHT_TOTAL",
            `${path} weights must total ${totalWeight}.`,
            path,
            { actualTotal, expectedTotal: totalWeight }
        );
    }

    if (values.size !== expectedValues.length
        || !expectedValues.every(value => values.has(value))) {
        addIssue(
            errors,
            "INVALID_AWAKENING_WEIGHT_VALUES",
            `${path} has unexpected ${valueField} values.`,
            path
        );
    }
}

export function validateAwakeningProbabilityConfig(config) {
    const errors = [];

    if (!isPlainObject(config)) {
        return {
            valid: false,
            errors: [{
                code: "INVALID_AWAKENING_PROBABILITY_CONFIG",
                message: "Awakening probability config must be a plain object.",
                path: "config"
            }]
        };
    }

    if (config.schemaVersion !== "awakening-probability-config/1.0"
        || !isNonEmptyString(config.probabilityVersion)
        || config.status !== "production"
        || config.integerWeightsOnly !== true) {
        addIssue(
            errors,
            "INVALID_AWAKENING_PROBABILITY_METADATA",
            "Awakening probability metadata is invalid or not production.",
            "config"
        );
    }

    validateWeightedItems({
        items: config.innateSoulPowerRoll?.items,
        totalWeight: 1000,
        path: "innateSoulPowerRoll.items",
        valueField: "innateSoulPower",
        expectedValues: AWAKENING_INNATE_SOUL_POWER_VALUES,
        errors
    });

    const countRows = config.martialSoulCountRolls?.byInnateSoulPower;
    const qualityRows = config.qualityRolls?.byInnateSoulPower;
    AWAKENING_INNATE_SOUL_POWER_VALUES.forEach(innateSoulPower => {
        const key = String(innateSoulPower);
        validateWeightedItems({
            items: countRows?.[key],
            totalWeight: 10000,
            path: `martialSoulCountRolls.byInnateSoulPower.${key}`,
            valueField: "count",
            expectedValues: [1, 2, 3, 4],
            errors
        });
        validateWeightedItems({
            items: qualityRows?.[key],
            totalWeight: 10000,
            path: `qualityRolls.byInnateSoulPower.${key}`,
            valueField: "qualityGrade",
            expectedValues: AWAKENING_QUALITY_GRADES,
            errors
        });
    });

    if (config.martialSoulCountRolls?.minimum !== 1
        || config.martialSoulCountRolls?.maximum !== 4) {
        addIssue(
            errors,
            "INVALID_MARTIAL_SOUL_COUNT_RANGE",
            "Martial-soul count range must be 1 through 4.",
            "martialSoulCountRolls"
        );
    }

    if (config.qualityRolls?.slotPolicy?.mode
            !== "shared_quality_per_awakening"
        || config.qualityRolls?.slotPolicy?.drawCount !== 1
        || config.qualityRolls?.slotPolicy?.hiddenDecay !== false) {
        addIssue(
            errors,
            "INVALID_QUALITY_SLOT_POLICY",
            "Awakening must draw quality once and share it across every martial-soul slot.",
            "qualityRolls.slotPolicy"
        );
    }

    validateWeightedItems({
        items: config.formRoll?.items,
        totalWeight: 1000,
        path: "formRoll.items",
        valueField: "form",
        expectedValues: AWAKENING_FORMS,
        errors
    });

    const actualFormWeights = Object.fromEntries(
        (config.formRoll?.items ?? []).map(item => [item.form, item.weight])
    );
    const expectedFormWeights = {
        tool: 340,
        beast: 360,
        plant: 200,
        food: 60,
        body: 40
    };
    if (config.formRoll?.dependsOnInnateSoulPower !== false
        || JSON.stringify(actualFormWeights) !== JSON.stringify(expectedFormWeights)) {
        addIssue(
            errors,
            "INVALID_FORM_ROLL_RULES",
            "Form weights must be fixed at 340/360/200/60/40 and independent of innate soul power.",
            "formRoll"
        );
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

export function assertValidAwakeningProbabilityConfig(config) {
    const validation = validateAwakeningProbabilityConfig(config);
    if (!validation.valid) {
        fail(
            "INVALID_AWAKENING_PROBABILITY_CONFIG",
            "Awakening probability config failed production validation.",
            validation
        );
    }
    return validation;
}

function assertRuntime(runtime) {
    if (!isPlainObject(runtime)) {
        fail(
            "MISSING_AWAKENING_RUNTIME",
            "Production awakening nodes require an awakeningRuntime object."
        );
    }
    assertValidMartialSoulCatalog(runtime.catalog);
    assertValidAwakeningProbabilityConfig(runtime.probabilityConfig);
    if (runtime.failureInjector !== undefined
        && typeof runtime.failureInjector !== "function") {
        fail(
            "INVALID_FAILURE_INJECTOR",
            "failureInjector must be a function when provided."
        );
    }
}

function maybeInject(runtime, point, details = {}) {
    runtime.failureInjector?.(point, clonePlayerStateValue(details));
}

function assertContextPath(path) {
    if (!isNonEmptyString(path) || !CONTEXT_PATH_PATTERN.test(path)) {
        fail(
            "INVALID_SESSION_CONTEXT_PATH",
            `Invalid sessionContext path "${String(path)}".`,
            { path }
        );
    }
}

export function readSessionContextPath(session, path) {
    assertValidAnnualSession(session);
    assertContextPath(path);
    let current = session.sessionContext;
    for (const segment of path.split(".")) {
        if (!isPlainObject(current)
            || !Object.prototype.hasOwnProperty.call(current, segment)) {
            fail(
                "MISSING_SESSION_CONTEXT_VALUE",
                `sessionContext value "${path}" was not found.`,
                { path }
            );
        }
        current = current[segment];
    }
    return clonePlayerStateValue(current);
}

export function saveSessionContextValue(session, path, value) {
    assertValidAnnualSession(session);
    assertContextPath(path);
    if (path.includes(".")) {
        fail(
            "UNSUPPORTED_SESSION_CONTEXT_WRITE",
            "saveAs writes are limited to top-level annual session keys.",
            { path }
        );
    }
    const nextSession = clonePlayerStateValue(session);
    nextSession.sessionContext[path] = clonePlayerStateValue(value);
    return nextSession;
}

function resolveConfigPath(config, path) {
    if (!isNonEmptyString(path) || !CONTEXT_PATH_PATTERN.test(path)) {
        fail(
            "INVALID_PROBABILITY_SOURCE",
            `Invalid probability source "${String(path)}".`,
            { path }
        );
    }
    let current = config;
    for (const segment of path.split(".")) {
        if (!isPlainObject(current)
            || !Object.prototype.hasOwnProperty.call(current, segment)) {
            fail(
                "MISSING_PROBABILITY_SOURCE",
                `Probability source "${path}" was not found.`,
                { path }
            );
        }
        current = current[segment];
    }
    return current;
}

export function drawWeighted(items, rng) {
    if (!Array.isArray(items) || items.length === 0) {
        fail("EMPTY_ELIGIBLE_POOL", "Weighted draw requires candidates.");
    }
    if (typeof rng !== "function") {
        fail("INVALID_RNG", "Awakening runtime requires an RNG function.");
    }

    let totalWeight = 0;
    items.forEach(item => {
        if (!isPlainObject(item)
            || !Number.isFinite(item.weight)
            || item.weight < 0) {
            fail(
                "INVALID_RUNTIME_WEIGHT",
                "Awakening draw contains an invalid weight.",
                { itemId: item?.id ?? null, weight: item?.weight ?? null }
            );
        }
        totalWeight += item.weight;
    });
    if (totalWeight <= 0) {
        fail("EMPTY_ELIGIBLE_POOL", "Weighted draw has no positive weight.");
    }

    const randomValue = rng();
    if (!Number.isFinite(randomValue)
        || randomValue < 0
        || randomValue >= 1) {
        fail(
            "INVALID_RNG_VALUE",
            "RNG must return a finite number in [0, 1).",
            { randomValue }
        );
    }

    const target = randomValue * totalWeight;
    let cumulative = 0;
    for (const item of items) {
        cumulative += item.weight;
        if (item.weight > 0 && target < cumulative) {
            return {
                item,
                randomValue,
                totalWeight
            };
        }
    }
    fail("RUNTIME_DRAW_FAILED", "Weighted draw did not select an item.");
}

function createSpin({
    player,
    session,
    flow,
    node,
    wheelId,
    item,
    randomValue,
    totalWeight,
    selectionKind,
    slot = null,
    eligibleCount = null,
    details = {}
}) {
    return {
        sessionId: session.sessionId,
        age: player.age,
        seed: session.seed,
        drawIndex: session.spinCount + 1,
        flowId: flow.id,
        nodeId: node.id,
        operationId: slot === null
            ? `${node.id}:${selectionKind}`
            : `${node.id}:slot_${slot}:${selectionKind}`,
        wheelId,
        itemId: item.id,
        itemText: item.text ?? item.name ?? item.id,
        itemWeight: item.weight,
        totalWeight,
        randomValue,
        selectionKind,
        slot,
        eligibleCount,
        details: clonePlayerStateValue(details)
    };
}

function commitSpin(session, spin, nodeKey, limits) {
    return commitAnnualStep(
        session,
        {
            nodeKey,
            spin
        },
        limits
    );
}

function extractSavedValue(item) {
    if (Object.prototype.hasOwnProperty.call(item, "innateSoulPower")) {
        return {
            innateSoulPower: item.innateSoulPower,
            talentGrade: item.talentGrade
        };
    }
    for (const field of ["count", "qualityGrade", "form", "value"]) {
        if (Object.prototype.hasOwnProperty.call(item, field)) {
            return clonePlayerStateValue(item[field]);
        }
    }
    return item.id;
}

function resolveNodeAdvance(node) {
    if (!isPlainObject(node.next) || !isNonEmptyString(node.next.advance)) {
        fail(
            "INVALID_ADVANCE",
            `Awakening node "${node.id}" requires a next advance.`
        );
    }
    return clonePlayerStateValue(node.next);
}

export function executeAwakeningProbabilityRollNode({
    player,
    session,
    flow,
    node,
    rng,
    limits,
    awakeningRuntime
}) {
    assertRuntime(awakeningRuntime);
    const source = resolveConfigPath(
        awakeningRuntime.probabilityConfig,
        node.probabilitySource
    );
    const { item, randomValue, totalWeight } = drawWeighted(source.items, rng);
    const spin = createSpin({
        player,
        session,
        flow,
        node,
        wheelId: `awakening:${node.probabilitySource}`,
        item,
        randomValue,
        totalWeight,
        selectionKind: "innate_soul_power",
        eligibleCount: source.items.length
    });
    let nextSession = saveSessionContextValue(
        session,
        node.saveAs,
        extractSavedValue(item)
    );
    nextSession = commitSpin(
        nextSession,
        spin,
        `${flow.id}:${node.id}`,
        limits
    );
    maybeInject(awakeningRuntime, "after_innate_soul_power", {
        itemId: item.id,
        innateSoulPower: item.innateSoulPower
    });
    return {
        player: clonePlayerStateValue(player),
        session: nextSession,
        next: resolveNodeAdvance(node),
        item: clonePlayerStateValue(item),
        spin,
        warnings: []
    };
}

export function executeAwakeningDispatchNode({
    player,
    session,
    flow,
    node,
    rng,
    limits,
    awakeningRuntime
}) {
    assertRuntime(awakeningRuntime);
    const sourceValue = readSessionContextPath(session, node.source);
    const table = resolveConfigPath(
        awakeningRuntime.probabilityConfig,
        node.probabilitySource
    );
    const items = table[String(sourceValue)];
    if (!Array.isArray(items)) {
        fail(
            "MISSING_DISPATCH_MAPPING",
            `No probability row exists for dispatch value "${String(sourceValue)}".`,
            { source: node.source, sourceValue }
        );
    }
    const { item, randomValue, totalWeight } = drawWeighted(items, rng);
    const spin = createSpin({
        player,
        session,
        flow,
        node,
        wheelId: `awakening:${node.probabilitySource}:${String(sourceValue)}`,
        item,
        randomValue,
        totalWeight,
        selectionKind: "martial_soul_count",
        eligibleCount: items.length,
        details: { sourceValue }
    });
    let nextSession = saveSessionContextValue(
        session,
        node.saveAs,
        extractSavedValue(item)
    );
    nextSession = commitSpin(
        nextSession,
        spin,
        `${flow.id}:${node.id}`,
        limits
    );
    maybeInject(awakeningRuntime, "after_martial_soul_count", {
        count: item.count
    });
    return {
        player: clonePlayerStateValue(player),
        session: nextSession,
        next: resolveNodeAdvance(node),
        item: clonePlayerStateValue(item),
        spin,
        warnings: []
    };
}

export function executeAwakeningGateNode({
    player,
    session,
    flow,
    node,
    limits,
    awakeningRuntime
}) {
    assertRuntime(awakeningRuntime);
    const sourceValue = readSessionContextPath(session, node.source);
    const mappingKey = String(sourceValue);
    const mapped = node.nextByValue?.[mappingKey] ?? node.fallback;
    if (!isPlainObject(mapped)) {
        fail(
            "MISSING_GATE_VALUE_MAPPING",
            `Gate "${node.id}" has no mapping for "${mappingKey}".`,
            { source: node.source, sourceValue }
        );
    }
    const nextSession = commitAnnualStep(
        session,
        { nodeKey: `${flow.id}:${node.id}` },
        limits
    );
    return {
        player: clonePlayerStateValue(player),
        session: nextSession,
        next: clonePlayerStateValue(mapped),
        item: null,
        spin: null,
        warnings: []
    };
}

function createMartialSoulInstance(definition, slot, age) {
    return {
        instanceId: `martial_soul_age_${age}_slot_${slot}`,
        slot,
        definitionId: definition.id,
        evolutionFamilyId: null,
        legacyName: definition.name,
        qualityGrade: definition.qualityGrade,
        awakenedAge: age,
        status: "active",
        sealed: false,
        soulRings: [],
        mutations: [],
        evolutionHistory: [],
        flags: {},
        routeHooksActivated: []
    };
}

function chooseCatalogDefinition({
    catalog,
    form,
    qualityGrade,
    excludedDefinitionIds,
    rng,
    slot
}) {
    const excluded = new Set(excludedDefinitionIds);
    const candidates = catalog.definitions.filter(definition => {
        return definition.enabled === true
            && definition.reviewStatus === "confirmed"
            && catalog.allowedCanonLevels.includes(definition.canonLevel)
            && definition.form === form
            && definition.qualityGrade === qualityGrade
            && !excluded.has(definition.id);
    });
    if (candidates.length === 0) {
        fail(
            "NO_ELIGIBLE_MARTIAL_SOUL_DEFINITION",
            "No eligible martial-soul definition remains for this slot.",
            {
                slot,
                form,
                qualityGrade,
                allowedCanonLevels: clonePlayerStateValue(
                    catalog.allowedCanonLevels
                ),
                excludedDefinitionIds: clonePlayerStateValue(
                    excludedDefinitionIds
                )
            }
        );
    }
    const equalWeightCandidates = candidates.map(definition => ({
        ...definition,
        weight: 1,
        text: definition.name
    }));
    return {
        ...drawWeighted(equalWeightCandidates, rng),
        eligibleCount: candidates.length
    };
}

export function executeAwakeningRepeatNode({
    player,
    session,
    flow,
    node,
    rng,
    limits,
    awakeningRuntime
}) {
    assertRuntime(awakeningRuntime);
    const count = readSessionContextPath(session, node.countFrom);
    if (!Number.isInteger(count)
        || count < 1
        || count > 4
        || count > limits.maxRepeatCount) {
        fail(
            "INVALID_REPEAT_COUNT",
            "Production awakening repeat count must be an integer from 1 through 4.",
            { count, limit: limits.maxRepeatCount }
        );
    }
    if (player.martialSouls.length !== 0) {
        fail(
            "PLAYER_ALREADY_HAS_MARTIAL_SOULS",
            "Age-6 production awakening requires an empty martial-soul collection."
        );
    }

    const pipeline = node.pipeline;
    const innateResult = readSessionContextPath(
        session,
        pipeline.innateSoulPowerFrom
    );
    const innateSoulPower = innateResult.innateSoulPower;
    const talentGrade = innateResult.talentGrade;
    const qualityRows = resolveConfigPath(
        awakeningRuntime.probabilityConfig,
        pipeline.qualityProbabilitySource
    );
    const qualityItems = qualityRows[String(innateSoulPower)];
    const formSource = resolveConfigPath(
        awakeningRuntime.probabilityConfig,
        pipeline.formProbabilitySource
    );
    if (!Array.isArray(qualityItems) || !Array.isArray(formSource.items)) {
        fail(
            "MISSING_SLOT_PROBABILITY_SOURCE",
            "Martial-soul slot probability sources are missing.",
            { innateSoulPower }
        );
    }

    let nextPlayer = clonePlayerStateValue(player);
    let nextSession = clonePlayerStateValue(session);
    const selectedDefinitionIds = [];
    const pendingInstances = [];
    const selectedDefinitions = [];

    const qualityDraw = drawWeighted(qualityItems, rng);
    const qualityGrade = qualityDraw.item.qualityGrade;
    nextSession = saveSessionContextValue(
        nextSession,
        "currentQualityGrade",
        qualityGrade
    );
    const qualitySpin = createSpin({
        player,
        session: nextSession,
        flow,
        node,
        wheelId: `awakening:${pipeline.qualityProbabilitySource}:${innateSoulPower}`,
        item: qualityDraw.item,
        randomValue: qualityDraw.randomValue,
        totalWeight: qualityDraw.totalWeight,
        selectionKind: "martial_soul_quality",
        eligibleCount: qualityItems.length,
        details: {
            innateSoulPower,
            sharedAcrossSlots: true,
            appliesToSlots: Array.from({ length: count }, (_, index) => index + 1)
        }
    });
    nextSession = commitSpin(
        nextSession,
        qualitySpin,
        `${flow.id}:${node.id}:shared_quality`,
        limits
    );
    maybeInject(awakeningRuntime, "after_shared_quality", {
        qualityGrade,
        martialSoulCount: count
    });

    for (let slot = 1; slot <= count; slot += 1) {
        nextSession = saveSessionContextValue(
            nextSession,
            "currentSlot",
            slot
        );

        const formDraw = drawWeighted(formSource.items, rng);
        const form = formDraw.item.form;
        nextSession = saveSessionContextValue(
            nextSession,
            "currentForm",
            form
        );
        const formSpin = createSpin({
            player,
            session: nextSession,
            flow,
            node,
            wheelId: `awakening:${pipeline.formProbabilitySource}`,
            item: formDraw.item,
            randomValue: formDraw.randomValue,
            totalWeight: formDraw.totalWeight,
            selectionKind: "martial_soul_form",
            slot,
            eligibleCount: formSource.items.length,
            details: { dependsOnInnateSoulPower: false }
        });
        nextSession = commitSpin(
            nextSession,
            formSpin,
            `${flow.id}:${node.id}:slot_${slot}_form`,
            limits
        );
        maybeInject(awakeningRuntime, "after_slot_form", {
            slot,
            form
        });

        const definitionDraw = chooseCatalogDefinition({
            catalog: awakeningRuntime.catalog,
            form,
            qualityGrade,
            excludedDefinitionIds: selectedDefinitionIds,
            rng,
            slot
        });
        maybeInject(awakeningRuntime, "during_definition_draw", {
            slot,
            form,
            qualityGrade,
            definitionId: definitionDraw.item.id
        });
        const definitionSpin = createSpin({
            player,
            session: nextSession,
            flow,
            node,
            wheelId: `catalog:${awakeningRuntime.catalog.catalogVersion}:${form}:${qualityGrade}`,
            item: definitionDraw.item,
            randomValue: definitionDraw.randomValue,
            totalWeight: definitionDraw.totalWeight,
            selectionKind: "martial_soul_definition",
            slot,
            eligibleCount: definitionDraw.eligibleCount,
            details: {
                form,
                qualityGrade,
                allowedCanonLevels: awakeningRuntime.catalog.allowedCanonLevels,
                excludedDefinitionCount: selectedDefinitionIds.length,
                equalWeight: true
            }
        });
        nextSession = commitSpin(
            nextSession,
            definitionSpin,
            `${flow.id}:${node.id}:slot_${slot}_definition`,
            limits
        );

        const instance = createMartialSoulInstance(
            definitionDraw.item,
            slot,
            player.age
        );
        maybeInject(awakeningRuntime, "during_materialization", {
            slot,
            definitionId: definitionDraw.item.id
        });
        selectedDefinitionIds.push(definitionDraw.item.id);
        selectedDefinitions.push(clonePlayerStateValue(definitionDraw.item));
        pendingInstances.push(instance);
        nextSession = saveSessionContextValue(
            nextSession,
            "selectedDefinitionIds",
            selectedDefinitionIds
        );
        nextSession = saveSessionContextValue(
            nextSession,
            "pendingMartialSoulInstances",
            pendingInstances
        );
    }

    nextPlayer.innateSoulPower = innateSoulPower;
    nextPlayer.talentGrade = talentGrade;
    nextPlayer.level = innateSoulPower;
    nextPlayer.combatBase.mode = innateSoulPower === 0
        ? "civilian_observer"
        : "level";
    nextPlayer.soulPowerGrowthLocked = innateSoulPower === 0;
    nextPlayer.rank = innateSoulPower === 0 ? "无魂力" : "魂士";
    nextPlayer.martialSouls = clonePlayerStateValue(pendingInstances);
    nextPlayer.activeMartialSoulInstanceId = pendingInstances[0].instanceId;
    nextPlayer.spinHistory.push(...clonePlayerStateValue(nextSession.spins));

    maybeInject(awakeningRuntime, "before_final_player_validation", {
        martialSoulCount: count,
        innateSoulPower
    });
    try {
        assertValidPlayerV2(nextPlayer);
    } catch (error) {
        fail(
            "PLAYER_STATE_INVALID_AFTER_AWAKENING",
            "Materialized awakening result failed Player v2 validation.",
            {
                cause: error instanceof Error ? error.message : String(error),
                errors: error?.errors ?? []
            }
        );
    }

    const next = resolveNodeAdvance(node);
    const result = {
        advance: next.advance,
        flowId: flow.id,
        nodeId: node.id,
        innateSoulPower,
        talentGrade,
        soulPowerGrowthLocked: nextPlayer.soulPowerGrowthLocked,
        martialSoulCount: count,
        qualityGrade,
        definitionIds: clonePlayerStateValue(selectedDefinitionIds),
        martialSoulNames: selectedDefinitions.map(definition => definition.name),
        slots: selectedDefinitions.map((definition, index) => ({
            slot: index + 1,
            definitionId: definition.id,
            name: definition.name,
            form: definition.form,
            qualityGrade: definition.qualityGrade,
            attributes: clonePlayerStateValue(definition.attributes),
            canonLevel: definition.canonLevel
        })),
        rulesVersion: awakeningRuntime.rulesVersion ?? null,
        catalogVersion: awakeningRuntime.catalog.catalogVersion,
        probabilityVersion: awakeningRuntime.probabilityConfig.probabilityVersion,
        ...(next.target ? { target: clonePlayerStateValue(next.target) } : {})
    };
    nextSession = commitAnnualStep(
        nextSession,
        {
            nodeKey: `${flow.id}:${node.id}`,
            status: ["end", "next_year"].includes(next.advance)
                ? "completed"
                : undefined,
            result
        },
        limits
    );

    return {
        player: nextPlayer,
        session: nextSession,
        next,
        item: null,
        spin: null,
        warnings: []
    };
}

export function calculateCatalogExhaustionProbability(config, catalog) {
    assertValidAwakeningProbabilityConfig(config);
    assertValidMartialSoulCatalog(catalog);
    const capacities = [];
    AWAKENING_FORMS.forEach(form => {
        AWAKENING_QUALITY_GRADES.forEach(qualityGrade => {
            capacities.push({
                form,
                qualityGrade,
                count: catalog.definitions.filter(definition => {
                    return definition.form === form
                        && definition.qualityGrade === qualityGrade;
                }).length
            });
        });
    });

    if (capacities.every(cell => {
        return cell.count >= config.martialSoulCountRolls.maximum;
    })) {
        return 0;
    }

    const innateTotal = config.innateSoulPowerRoll.totalWeight;
    let totalFailureProbability = 0;
    config.innateSoulPowerRoll.items.forEach(innateItem => {
        const innateProbability = innateItem.weight / innateTotal;
        const countItems = config.martialSoulCountRolls.byInnateSoulPower[
            String(innateItem.innateSoulPower)
        ];
        const qualityItems = config.qualityRolls.byInnateSoulPower[
            String(innateItem.innateSoulPower)
        ];
        countItems.forEach(countItem => {
            qualityItems.forEach(qualityItem => {
                const qualityProbability = qualityItem.weight
                    / config.qualityRolls.totalWeight;
                const qualityCapacities = AWAKENING_FORMS.map(form => {
                    return capacities.find(cell => {
                        return cell.form === form
                            && cell.qualityGrade === qualityItem.qualityGrade;
                    });
                });
                const formProbabilities = AWAKENING_FORMS.map(form => {
                    return config.formRoll.items.find(item => {
                        return item.form === form;
                    }).weight / config.formRoll.totalWeight;
                });
                let successProbability = 0;
                const used = Array(AWAKENING_FORMS.length).fill(0);
                function enumerate(slot, probability) {
                    if (slot === countItem.count) {
                        successProbability += probability;
                        return;
                    }
                    qualityCapacities.forEach((cell, index) => {
                        if (used[index] >= cell.count) {
                            return;
                        }
                        used[index] += 1;
                        enumerate(
                            slot + 1,
                            probability * formProbabilities[index]
                        );
                        used[index] -= 1;
                    });
                }
                enumerate(0, 1);
                totalFailureProbability += innateProbability
                    * (countItem.weight
                        / config.martialSoulCountRolls.totalWeight)
                    * qualityProbability
                    * Math.max(0, 1 - successProbability);
            });
        });
    });
    return totalFailureProbability;
}

export class ProductionAwakeningError extends Error {
    constructor(code, message, details = {}) {
        super(message);
        this.name = "ProductionAwakeningError";
        this.code = code;
        this.details = details;
    }
}

export default Object.freeze({
    assertValidAwakeningProbabilityConfig,
    assertValidMartialSoulCatalog,
    calculateCatalogExhaustionProbability,
    drawWeighted,
    executeAwakeningDispatchNode,
    executeAwakeningGateNode,
    executeAwakeningProbabilityRollNode,
    executeAwakeningRepeatNode,
    getMartialSoulCatalogStats,
    readSessionContextPath,
    saveSessionContextValue,
    validateAwakeningProbabilityConfig,
    validateMartialSoulCatalog
});
