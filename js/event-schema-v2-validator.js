export const EVENT_SCHEMA_V2_VERSION = "event-schema/2.0-draft";

export const EVENT_CANON_LEVELS = Object.freeze([
    "canon",
    "expanded",
    "crossover",
    "parody"
]);

export const EVENT_REVIEW_STATUSES = Object.freeze([
    "confirmed",
    "inferred",
    "provisional",
    "deprecated"
]);

export const EVENT_ADVANCE_TYPES = Object.freeze([
    "same_year",
    "next_year",
    "end",
    "terminal"
]);

export const EVENT_FLOW_OPS = Object.freeze([
    "roll",
    "gate",
    "repeatWheel",
    "dispatchWheel",
    "setRoute",
    "yieldYear",
    "end",
    "terminal"
]);

export const EVENT_ROUTE_LANES = Object.freeze([
    "main",
    "faction",
    "npc",
    "deity",
    "personal",
    "temporary"
]);

export const EVENT_ROUTE_CONFLICT_POLICIES = Object.freeze([
    "block",
    "replace",
    "branch"
]);

const TRIGGER_SCOPES = new Set([
    "age",
    "attributes",
    "state",
    "nestedState",
    "hasEvent",
    "hasTag",
    "hasRoute",
    "routeState",
    "annualFlags",
    "routeFlags"
]);

const NUMERIC_TRIGGER_OPS = new Set([
    "gt",
    "gte",
    "lt",
    "lte",
    "eq"
]);

const PLAYER_ROOT_PATHS = new Set([
    "schemaVersion",
    "name",
    "age",
    "level",
    "rank",
    "combatBase",
    "martialSouls",
    "activeMartialSoulInstanceId",
    "soulBones",
    "domains",
    "combatAttributes",
    "soulCores",
    "deities",
    "artifacts",
    "combatTitles",
    "otherCombatSources",
    "academy",
    "faction",
    "title",
    "money",
    "reputation",
    "flags",
    "routeStates",
    "annualFlags",
    "spinHistory",
    "history"
]);

const NUMERIC_EFFECT_PATHS = new Set([
    "level",
    "money",
    "reputation"
]);

const SET_EFFECT_PATHS = new Set([
    "academy",
    "activeMartialSoulInstanceId",
    "faction",
    "rank",
    "title"
]);

const ADD_EFFECT_PATHS = new Set([
    "martialSouls",
    "domains",
    "combatAttributes",
    "soulCores",
    "deities",
    "artifacts",
    "combatTitles",
    "otherCombatSources"
]);

const FORBIDDEN_DERIVED_COMBAT_PATHS = new Set([
    "combatPower",
    "staticCombatPower",
    "effectiveCombatPower"
]);

const DYNAMIC_PLAYER_PATH_ROOTS = new Set([
    "martialSouls",
    "soulBones",
    "routeStates"
]);

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

function createResult(errors, warnings) {
    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}

function isNonEmptyString(value) {
    return typeof value === "string" && value.length > 0;
}

function validateStringArray(value, path, errors, code) {
    if (!Array.isArray(value)
        || value.some(entry => !isNonEmptyString(entry))) {
        addIssue(
            errors,
            code,
            `${path} must be an array of non-empty strings.`,
            path
        );
        return false;
    }

    return true;
}

function validateNumericCondition(condition, path, errors) {
    if (!isPlainObject(condition)) {
        addIssue(
            errors,
            "INVALID_TRIGGER_CONDITION",
            "Numeric trigger conditions must be comparison objects.",
            path
        );
        return;
    }

    const operations = Object.keys(condition);

    if (operations.length === 0) {
        addIssue(
            errors,
            "EMPTY_TRIGGER_CONDITION",
            "Numeric trigger conditions require at least one operation.",
            path
        );
    }

    operations.forEach(operation => {
        if (!NUMERIC_TRIGGER_OPS.has(operation)) {
            addIssue(
                errors,
                "INVALID_TRIGGER_OP",
                `Unsupported trigger operation "${operation}".`,
                `${path}.${operation}`
            );
            return;
        }

        if (!Number.isFinite(condition[operation])) {
            addIssue(
                errors,
                "INVALID_TRIGGER_VALUE",
                `Trigger operation "${operation}" requires a finite number.`,
                `${path}.${operation}`
            );
        }
    });
}

function validateKnownPlayerPath(
    playerPath,
    path,
    errors,
    warnings
) {
    if (!isNonEmptyString(playerPath)) {
        addIssue(
            errors,
            "EMPTY_TRIGGER_PATH",
            "Trigger path must not be empty.",
            path
        );
        return;
    }

    const root = playerPath.split(/[.[\]]/, 1)[0];

    if (DYNAMIC_PLAYER_PATH_ROOTS.has(root)
        && playerPath !== root) {
        addIssue(
            warnings,
            "DYNAMIC_PLAYER_PATH_UNVERIFIED",
            `Dynamic Player path "${playerPath}" cannot be fully verified statically.`,
            path
        );
        return;
    }

    if (!PLAYER_ROOT_PATHS.has(root)) {
        addIssue(
            errors,
            "UNKNOWN_PLAYER_PATH",
            `Unknown Player v2 path "${playerPath}".`,
            path
        );
    }
}

function validateTriggerMapPaths(
    value,
    path,
    errors,
    warnings,
    options = {}
) {
    if (!isPlainObject(value)) {
        addIssue(
            errors,
            "INVALID_TRIGGER_SCOPE_VALUE",
            `${path} must be a plain object.`,
            path
        );
        return;
    }

    Object.keys(value).forEach(key => {
        if (!isNonEmptyString(key)) {
            addIssue(
                errors,
                "EMPTY_TRIGGER_PATH",
                "Trigger path must not be empty.",
                `${path}.${key}`
            );
            return;
        }

        if (options.playerPaths) {
            validateKnownPlayerPath(
                key,
                `${path}.${key}`,
                errors,
                warnings
            );
        }

        if (options.numericConditions) {
            validateNumericCondition(
                value[key],
                `${path}.${key}`,
                errors
            );
        }

        if (options.dynamicRoots?.has(key)) {
            addIssue(
                warnings,
                "DYNAMIC_PLAYER_PATH_UNVERIFIED",
                `Dynamic Player collection "${key}" cannot be fully verified statically.`,
                `${path}.${key}`
            );
        }
    });
}

export function validateEventTriggerV2(
    trigger,
    {
        path = "$.trigger"
    } = {}
) {
    const errors = [];
    const warnings = [];

    if (!isPlainObject(trigger)) {
        addIssue(
            errors,
            "INVALID_TRIGGER",
            "Trigger must be a plain object.",
            path
        );
        return createResult(errors, warnings);
    }

    Object.entries(trigger).forEach(([scope, value]) => {
        const scopePath = `${path}.${scope}`;

        if (!isNonEmptyString(scope)) {
            addIssue(
                errors,
                "EMPTY_TRIGGER_PATH",
                "Trigger scope/path must not be empty.",
                scopePath
            );
            return;
        }

        if (!TRIGGER_SCOPES.has(scope)) {
            addIssue(
                errors,
                "INVALID_TRIGGER_SCOPE",
                `Unsupported trigger scope "${scope}".`,
                scopePath
            );
            return;
        }

        if (scope === "age") {
            validateNumericCondition(value, scopePath, errors);
            return;
        }

        if (scope === "attributes") {
            validateTriggerMapPaths(
                value,
                scopePath,
                errors,
                warnings,
                {
                    playerPaths: true,
                    numericConditions: true
                }
            );

            if (isPlainObject(value)) {
                Object.keys(value)
                    .filter(playerPath => {
                        return isNonEmptyString(playerPath)
                            && !NUMERIC_EFFECT_PATHS.has(playerPath);
                    })
                    .forEach(playerPath => {
                        addIssue(
                            errors,
                            "TRIGGER_PATH_NOT_NUMERIC",
                            `Player path "${playerPath}" is not a registered numeric attribute.`,
                            `${scopePath}.${playerPath}`
                        );
                    });
            }
            return;
        }

        if (["hasEvent", "hasTag", "hasRoute"].includes(scope)) {
            validateStringArray(
                value,
                scopePath,
                errors,
                "INVALID_TRIGGER_REFERENCE_LIST"
            );
            return;
        }

        validateTriggerMapPaths(
            value,
            scopePath,
            errors,
            warnings,
            {
                playerPaths: scope === "state"
                    || scope === "nestedState",
                dynamicRoots: scope === "nestedState"
                    ? DYNAMIC_PLAYER_PATH_ROOTS
                    : null
            }
        );
    });

    return createResult(errors, warnings);
}

function validateEffectOperation(
    playerPath,
    operation,
    operationValue,
    path,
    errors
) {
    if (operation === "set") {
        if (!SET_EFFECT_PATHS.has(playerPath)) {
            addIssue(
                errors,
                "EFFECT_PATH_NOT_ALLOWED_FOR_OP",
                `Effect path "${playerPath}" does not allow set.`,
                path
            );
        } else if (playerPath === "activeMartialSoulInstanceId") {
            if (!isNonEmptyString(operationValue)) {
                addIssue(
                    errors,
                    "INVALID_EFFECT_VALUE",
                    "activeMartialSoulInstanceId set requires a non-empty string.",
                    path
                );
            }
        } else {
            const allowsNull = playerPath === "academy"
                || playerPath === "faction";

            if ((operationValue === null && !allowsNull)
                || (operationValue !== null
                    && typeof operationValue !== "string")) {
                addIssue(
                    errors,
                    "INVALID_EFFECT_VALUE",
                    `${playerPath} set requires a string${allowsNull ? " or null" : ""}.`,
                    path
                );
            }
        }
        return;
    }

    if (operation === "add") {
        if (!ADD_EFFECT_PATHS.has(playerPath)) {
            addIssue(
                errors,
                "EFFECT_PATH_NOT_ALLOWED_FOR_OP",
                `Effect path "${playerPath}" does not allow add.`,
                path
            );
        } else if (playerPath === "martialSouls"
            && !isPlainObject(operationValue)) {
            addIssue(
                errors,
                "INVALID_EFFECT_VALUE",
                "martialSouls add requires a plain martial soul object.",
                path
            );
        }
        return;
    }

    if (operation === "setKey") {
        if (!isPlainObject(operationValue)
            || !isNonEmptyString(operationValue.key)) {
            addIssue(
                errors,
                "INVALID_EFFECT_SET_KEY",
                "setKey requires a non-empty string key.",
                path
            );
        }

        addIssue(
            errors,
            "UNSUPPORTED_NESTED_EFFECT_OPERATION",
            "Player v2 nested setKey writes are not yet authoritative.",
            path
        );
        return;
    }

    addIssue(
        errors,
        "INVALID_EFFECT_OP",
        `Unsupported effect operation "${operation}".`,
        path
    );
}

export function validateEventEffectsV2(
    effects,
    {
        path = "$.effects"
    } = {}
) {
    const errors = [];
    const warnings = [];

    if (!isPlainObject(effects)) {
        addIssue(
            errors,
            "INVALID_EFFECTS",
            "Effects must be a plain object.",
            path
        );
        return createResult(errors, warnings);
    }

    Object.entries(effects).forEach(([playerPath, value]) => {
        const effectPath = `${path}.${playerPath}`;

        if (!isNonEmptyString(playerPath)) {
            addIssue(
                errors,
                "EMPTY_EFFECT_PATH",
                "Effect path must not be empty.",
                effectPath
            );
            return;
        }

        if (playerPath === "age") {
            addIssue(
                errors,
                "FORBIDDEN_AGE_EFFECT",
                "Event Schema v2 effects must not modify age.",
                effectPath
            );
            return;
        }

        if (FORBIDDEN_DERIVED_COMBAT_PATHS.has(playerPath)) {
            addIssue(
                errors,
                "FORBIDDEN_DERIVED_COMBAT_EFFECT",
                `Effects must not write derived combat field "${playerPath}".`,
                effectPath
            );
            return;
        }

        const root = playerPath.split(/[.[\]]/, 1)[0];

        if (playerPath !== root
            && DYNAMIC_PLAYER_PATH_ROOTS.has(root)) {
            addIssue(
                warnings,
                "DYNAMIC_PLAYER_PATH_UNVERIFIED",
                `Dynamic Player path "${playerPath}" cannot be fully verified statically.`,
                effectPath
            );
            addIssue(
                errors,
                "UNSUPPORTED_NESTED_EFFECT_PATH",
                "Nested Player v2 entity writes require a versioned operation protocol.",
                effectPath
            );
            return;
        }

        if (!PLAYER_ROOT_PATHS.has(root)) {
            addIssue(
                errors,
                "UNKNOWN_PLAYER_PATH",
                `Unknown Player v2 effect path "${playerPath}".`,
                effectPath
            );
            return;
        }

        if (typeof value === "number") {
            if (!Number.isFinite(value)) {
                addIssue(
                    errors,
                    "INVALID_EFFECT_VALUE",
                    "Numeric effects must be finite.",
                    effectPath
                );
            } else if (!NUMERIC_EFFECT_PATHS.has(playerPath)) {
                addIssue(
                    errors,
                    "EFFECT_PATH_NOT_ALLOWED_FOR_OP",
                    `Effect path "${playerPath}" does not allow numeric add.`,
                    effectPath
                );
            }
            return;
        }

        if (!isPlainObject(value)) {
            addIssue(
                errors,
                "INVALID_EFFECT_VALUE",
                "Effect values must be finite numbers or operation objects.",
                effectPath
            );
            return;
        }

        const operations = Object.keys(value);

        if (operations.length !== 1) {
            addIssue(
                errors,
                "CONFLICTING_EFFECT_OPERATIONS",
                "Each effect path must define exactly one operation.",
                effectPath
            );
            return;
        }

        const operation = operations[0];

        validateEffectOperation(
            playerPath,
            operation,
            value[operation],
            `${effectPath}.${operation}`,
            errors
        );
    });

    return createResult(errors, warnings);
}

function mergeValidation(targetErrors, targetWarnings, validation) {
    targetErrors.push(...validation.errors);
    targetWarnings.push(...validation.warnings);
}

function validateCommonEntity(
    entity,
    expectedKind,
    path,
    errors,
    warnings
) {
    if (!isPlainObject(entity)) {
        addIssue(
            errors,
            "INVALID_SCHEMA_ENTITY",
            `${expectedKind} entries must be plain objects.`,
            path
        );
        return false;
    }

    if (entity.schemaVersion !== EVENT_SCHEMA_V2_VERSION) {
        addIssue(
            errors,
            "INVALID_EVENT_SCHEMA_VERSION",
            `schemaVersion must be "${EVENT_SCHEMA_V2_VERSION}".`,
            `${path}.schemaVersion`
        );
    }

    if (entity.kind !== expectedKind) {
        addIssue(
            errors,
            "INVALID_EVENT_SCHEMA_KIND",
            `kind must be "${expectedKind}".`,
            `${path}.kind`
        );
    }

    if (!isNonEmptyString(entity.id)) {
        addIssue(
            errors,
            "MISSING_EVENT_SCHEMA_ID",
            `${expectedKind} id must be a non-empty string.`,
            `${path}.id`
        );
    }

    if (!EVENT_CANON_LEVELS.includes(entity.canonLevel)) {
        addIssue(
            errors,
            "INVALID_CANON_LEVEL",
            `Unsupported canonLevel "${String(entity.canonLevel)}".`,
            `${path}.canonLevel`
        );
    }

    if (!EVENT_REVIEW_STATUSES.includes(entity.reviewStatus)) {
        addIssue(
            errors,
            "INVALID_REVIEW_STATUS",
            `Unsupported reviewStatus "${String(entity.reviewStatus)}".`,
            `${path}.reviewStatus`
        );
    }

    mergeValidation(
        errors,
        warnings,
        validateEventTriggerV2(entity.trigger, {
            path: `${path}.trigger`
        })
    );

    return true;
}

function createRegistry(
    entries,
    kind,
    path,
    errors,
    warnings
) {
    const registry = new Map();

    entries.forEach((entry, index) => {
        const entryPath = `${path}[${index}]`;

        if (!validateCommonEntity(
            entry,
            kind,
            entryPath,
            errors,
            warnings
        )) {
            return;
        }

        if (!isNonEmptyString(entry.id)) {
            return;
        }

        if (registry.has(entry.id)) {
            addIssue(
                errors,
                `DUPLICATE_${kind.toUpperCase()}_ID`,
                `${kind} id "${entry.id}" is duplicated.`,
                `${entryPath}.id`
            );
            return;
        }

        registry.set(entry.id, {
            entity: entry,
            path: entryPath
        });
    });

    return registry;
}

function validateWeight(value, path, errors, mode) {
    if (value === null) {
        if (mode === "authoritative") {
            addIssue(
                errors,
                "NULL_WEIGHT_FORBIDDEN",
                "Authoritative Event Schema v2 weights must not be null.",
                path
            );
            return false;
        }

        return true;
    }

    if (!Number.isFinite(value) || value < 0) {
        addIssue(
            errors,
            "INVALID_WEIGHT",
            "Weight must be a finite non-negative number.",
            path
        );
        return false;
    }

    return true;
}

function validateWheel(
    wheel,
    path,
    errors,
    warnings,
    mode
) {
    if (wheel.enabled !== undefined
        && typeof wheel.enabled !== "boolean") {
        addIssue(
            errors,
            "INVALID_ENABLED_FLAG",
            "Wheel enabled must be a boolean when present.",
            `${path}.enabled`
        );
    }

    if (wheel.resolution !== "random_weighted") {
        addIssue(
            errors,
            "UNSUPPORTED_WHEEL_RESOLUTION",
            "The first Event Schema v2 phase only supports random_weighted.",
            `${path}.resolution`
        );
    }

    if (Object.prototype.hasOwnProperty.call(wheel, "weight")) {
        validateWeight(
            wheel.weight,
            `${path}.weight`,
            errors,
            mode
        );
    }

    if (!Array.isArray(wheel.items) || wheel.items.length === 0) {
        addIssue(
            errors,
            "INVALID_WHEEL_ITEMS",
            "Wheel items must be a non-empty array.",
            `${path}.items`
        );
        return;
    }

    const itemIds = new Set();
    let drawableCount = 0;

    wheel.items.forEach((item, index) => {
        const itemPath = `${path}.items[${index}]`;

        if (!isPlainObject(item)) {
            addIssue(
                errors,
                "INVALID_WHEEL_ITEM",
                "Wheel items must be plain objects.",
                itemPath
            );
            return;
        }

        if (!isNonEmptyString(item.id)) {
            addIssue(
                errors,
                "MISSING_WHEEL_ITEM_ID",
                "Wheel item id must be a non-empty string.",
                `${itemPath}.id`
            );
        } else if (itemIds.has(item.id)) {
            addIssue(
                errors,
                "DUPLICATE_WHEEL_ITEM_ID",
                `Wheel item id "${item.id}" is duplicated.`,
                `${itemPath}.id`
            );
        } else {
            itemIds.add(item.id);
        }

        const validWeight = validateWeight(
            item.weight,
            `${itemPath}.weight`,
            errors,
            mode
        );

        if (item.enabled !== undefined
            && typeof item.enabled !== "boolean") {
            addIssue(
                errors,
                "INVALID_ENABLED_FLAG",
                "Wheel item enabled must be a boolean when present.",
                `${itemPath}.enabled`
            );
        }

        if (!EVENT_CANON_LEVELS.includes(item.canonLevel)) {
            addIssue(
                errors,
                "INVALID_CANON_LEVEL",
                `Unsupported canonLevel "${String(item.canonLevel)}".`,
                `${itemPath}.canonLevel`
            );
        }

        if (!EVENT_REVIEW_STATUSES.includes(item.reviewStatus)) {
            addIssue(
                errors,
                "INVALID_REVIEW_STATUS",
                `Unsupported reviewStatus "${String(item.reviewStatus)}".`,
                `${itemPath}.reviewStatus`
            );
        }

        mergeValidation(
            errors,
            warnings,
            validateEventTriggerV2(item.trigger, {
                path: `${itemPath}.trigger`
            })
        );
        mergeValidation(
            errors,
            warnings,
            validateEventEffectsV2(item.effects, {
                path: `${itemPath}.effects`
            })
        );

        if (Object.prototype.hasOwnProperty.call(item, "nextByResult")
            || Object.prototype.hasOwnProperty.call(item, "advance")
            || Object.prototype.hasOwnProperty.call(item, "target")) {
            addIssue(
                errors,
                "CONFLICTING_TRANSITION_SOURCE",
                "Wheel items must use only the v2 next object for transitions.",
                itemPath
            );
        }

        if (validWeight
            && item.weight > 0
            && item.enabled !== false) {
            drawableCount += 1;
        }
    });

    if (wheel.enabled !== false && drawableCount === 0) {
        if (mode === "reference") {
            addIssue(
                warnings,
                "REFERENCE_WHEEL_WITHOUT_DRAWABLE_ITEM",
                "Reference wheel has no resolved drawable item.",
                `${path}.items`
            );
        } else {
            addIssue(
                errors,
                "WHEEL_WITHOUT_DRAWABLE_ITEM",
                "Enabled wheels require at least one enabled positive-weight item.",
                `${path}.items`
            );
        }
    }
}

function validateWheelAdvances(
    wheelRecord,
    registries,
    errors
) {
    const { entity: wheel, path } = wheelRecord;

    if (!Array.isArray(wheel.items)) {
        return;
    }

    wheel.items.forEach((item, index) => {
        if (!isPlainObject(item)
            || !Object.prototype.hasOwnProperty.call(item, "next")) {
            return;
        }

        validateAdvance(
            item.next,
            `${path}.items[${index}].next`,
            registries,
            errors
        );
    });
}

function validateTarget(
    target,
    advance,
    path,
    registries,
    errors
) {
    if (!isPlainObject(target)) {
        addIssue(
            errors,
            "INVALID_ADVANCE_TARGET",
            "Advance target must be a plain object.",
            path
        );
        return;
    }

    const identityFields = ["flowId", "routeId", "wheelId"]
        .filter(field => Object.prototype.hasOwnProperty.call(
            target,
            field
        ));

    if (identityFields.length > 1) {
        addIssue(
            errors,
            "CONFLICTING_ADVANCE_TARGET",
            "Advance target must identify exactly one target kind.",
            path
        );
    }

    if (target.kind === "flow_node") {
        const flowRecord = registries.flows.get(target.flowId);

        if (!isNonEmptyString(target.flowId)
            || !isNonEmptyString(target.nodeId)) {
            addIssue(
                errors,
                "INVALID_FLOW_NODE_TARGET",
                "flow_node targets require flowId and nodeId.",
                path
            );
            return;
        }

        if (!flowRecord) {
            addIssue(
                errors,
                "UNKNOWN_FLOW_REFERENCE",
                `Unknown flow "${target.flowId}".`,
                `${path}.flowId`
            );
            return;
        }

        if (!flowRecord.nodes?.has(target.nodeId)) {
            addIssue(
                errors,
                "UNKNOWN_FLOW_NODE_REFERENCE",
                `Unknown flow node "${target.flowId}:${target.nodeId}".`,
                `${path}.nodeId`
            );
        }
        return;
    }

    if (target.kind === "route_node") {
        const routeRecord = registries.routes.get(target.routeId);

        if (!isNonEmptyString(target.routeId)
            || !isNonEmptyString(target.nodeId)) {
            addIssue(
                errors,
                "INVALID_ROUTE_NODE_TARGET",
                "route_node targets require routeId and nodeId.",
                path
            );
            return;
        }

        if (!routeRecord) {
            addIssue(
                errors,
                "UNKNOWN_ROUTE_REFERENCE",
                `Unknown route "${target.routeId}".`,
                `${path}.routeId`
            );
            return;
        }

        const routeFlow = registries.flows.get(
            routeRecord.entity.entry?.flowId
        );

        if (!routeFlow?.nodes?.has(target.nodeId)) {
            addIssue(
                errors,
                "UNKNOWN_ROUTE_NODE_REFERENCE",
                `Route node "${target.routeId}:${target.nodeId}" does not exist in its entry flow.`,
                `${path}.nodeId`
            );
        }
        return;
    }

    if (target.kind === "wheel") {
        if (advance !== "same_year") {
            addIssue(
                errors,
                "INVALID_WHEEL_TARGET_ADVANCE",
                "Wheel targets are only valid for same_year advances.",
                path
            );
        }

        if (!isNonEmptyString(target.wheelId)
            || !registries.wheels.has(target.wheelId)) {
            addIssue(
                errors,
                "UNKNOWN_WHEEL_REFERENCE",
                `Unknown wheel "${String(target.wheelId)}".`,
                `${path}.wheelId`
            );
        }
        return;
    }

    addIssue(
        errors,
        "INVALID_ADVANCE_TARGET_KIND",
        `Unsupported advance target kind "${String(target.kind)}".`,
        `${path}.kind`
    );
}

function validateAdvance(
    next,
    path,
    registries,
    errors
) {
    if (!isPlainObject(next)) {
        addIssue(
            errors,
            "INVALID_ADVANCE",
            "Advance must be a plain object.",
            path
        );
        return;
    }

    if (!EVENT_ADVANCE_TYPES.includes(next.advance)) {
        addIssue(
            errors,
            "INVALID_ADVANCE_TYPE",
            `Unsupported advance "${String(next.advance)}".`,
            `${path}.advance`
        );
        return;
    }

    if (next.advance === "same_year") {
        if (!Object.prototype.hasOwnProperty.call(next, "target")) {
            addIssue(
                errors,
                "MISSING_SAME_YEAR_TARGET",
                "same_year advances require an explicit target.",
                `${path}.target`
            );
            return;
        }

        validateTarget(
            next.target,
            next.advance,
            `${path}.target`,
            registries,
            errors
        );
        return;
    }

    if (next.advance === "next_year") {
        if (next.target?.kind !== "route_node") {
            addIssue(
                errors,
                "INVALID_NEXT_YEAR_TARGET",
                "next_year must target a persistent route_node.",
                `${path}.target`
            );
            return;
        }

        validateTarget(
            next.target,
            next.advance,
            `${path}.target`,
            registries,
            errors
        );
        return;
    }

    if (Object.prototype.hasOwnProperty.call(next, "target")) {
        addIssue(
            errors,
            "FORBIDDEN_STOP_TARGET",
            `${next.advance} advances must not carry a target.`,
            `${path}.target`
        );
    }

    if (next.advance === "terminal"
        && next.reason !== undefined
        && !isNonEmptyString(next.reason)) {
        addIssue(
            errors,
            "INVALID_TERMINAL_REASON",
            "terminal reason must be a non-empty string when present.",
            `${path}.reason`
        );
    }
}

function getDrawableItems(wheel) {
    return Array.isArray(wheel?.items)
        ? wheel.items.filter(item => {
            return isPlainObject(item)
                && item.enabled !== false
                && Number.isFinite(item.weight)
                && item.weight > 0;
        })
        : [];
}

function validateRollNode(
    node,
    path,
    wheel,
    registries,
    errors
) {
    if (!wheel) {
        return;
    }

    const drawableItems = getDrawableItems(wheel);
    const itemsWithNext = drawableItems.filter(item => {
        return Object.prototype.hasOwnProperty.call(item, "next");
    });

    if (Object.prototype.hasOwnProperty.call(node, "next")) {
        if (itemsWithNext.length > 0) {
            addIssue(
                errors,
                "CONFLICTING_TRANSITION_SOURCE",
                "roll cannot mix node.next with item.next transitions.",
                path
            );
        }

        validateAdvance(
            node.next,
            `${path}.next`,
            registries,
            errors
        );
        return;
    }

    if (itemsWithNext.length !== drawableItems.length) {
        addIssue(
            errors,
            "MISSING_ROLL_ADVANCE",
            "roll requires node.next or a next on every drawable item.",
            path
        );
    }
}

function validateGateNode(
    node,
    path,
    wheel,
    registries,
    errors
) {
    if (Object.prototype.hasOwnProperty.call(node, "next")) {
        addIssue(
            errors,
            "CONFLICTING_TRANSITION_SOURCE",
            "gate must use only nextByItemId.",
            `${path}.next`
        );
    }

    if (!isPlainObject(node.nextByItemId)) {
        addIssue(
            errors,
            "INVALID_GATE_MAPPING",
            "gate nextByItemId must be a plain object.",
            `${path}.nextByItemId`
        );
        return;
    }

    if (!wheel) {
        return;
    }

    const drawableItems = getDrawableItems(wheel);
    const allItemIds = new Set(
        wheel.items
            .filter(item => isPlainObject(item))
            .map(item => item.id)
    );

    wheel.items.forEach((item, index) => {
        if (Object.prototype.hasOwnProperty.call(item, "next")) {
            addIssue(
                errors,
                "CONFLICTING_TRANSITION_SOURCE",
                "Items used by gate must not define next.",
                `${path}.wheel:${wheel.id}.items[${index}].next`
            );
        }
    });

    drawableItems.forEach(item => {
        if (!Object.prototype.hasOwnProperty.call(
            node.nextByItemId,
            item.id
        )) {
            addIssue(
                errors,
                "MISSING_GATE_ITEM_MAPPING",
                `gate has no transition for drawable item "${item.id}".`,
                `${path}.nextByItemId`
            );
        }
    });

    Object.entries(node.nextByItemId).forEach(([itemId, next]) => {
        if (!allItemIds.has(itemId)) {
            addIssue(
                errors,
                "UNKNOWN_GATE_ITEM_MAPPING",
                `gate maps unknown item "${itemId}".`,
                `${path}.nextByItemId.${itemId}`
            );
        }

        validateAdvance(
            next,
            `${path}.nextByItemId.${itemId}`,
            registries,
            errors
        );
    });
}

function validateRepeatNode(
    node,
    path,
    registries,
    errors
) {
    const hasCountFrom = isNonEmptyString(node.countFrom);
    const hasFixedCount = Number.isInteger(node.count)
        && node.count >= 0;

    if (!hasCountFrom && !hasFixedCount) {
        addIssue(
            errors,
            "INVALID_REPEAT_COUNT_SOURCE",
            "repeatWheel requires countFrom or a non-negative integer count.",
            path
        );
    }

    if (isNonEmptyString(node.wheelId)) {
        if (!registries.wheels.has(node.wheelId)) {
            addIssue(
                errors,
                "UNKNOWN_WHEEL_REFERENCE",
                `Unknown wheel "${node.wheelId}".`,
                `${path}.wheelId`
            );
        }
    } else if (node.pool?.mode === "merge"
        && Array.isArray(node.pool.sources)
        && node.pool.sources.length > 0) {
        node.pool.sources.forEach((source, index) => {
            if (!isPlainObject(source)
                || !registries.wheels.has(source.wheelId)) {
                addIssue(
                    errors,
                    "UNKNOWN_WHEEL_REFERENCE",
                    `Unknown merged-pool wheel "${String(source?.wheelId)}".`,
                    `${path}.pool.sources[${index}].wheelId`
                );
            }
        });
    } else {
        addIssue(
            errors,
            "MISSING_REPEAT_WHEEL_SOURCE",
            "repeatWheel requires wheelId or a non-empty merge pool.",
            path
        );
    }

    validateAdvance(
        node.next,
        `${path}.next`,
        registries,
        errors
    );
}

function validateDispatchNode(
    node,
    path,
    registries,
    errors
) {
    if (!isNonEmptyString(node.source)) {
        addIssue(
            errors,
            "INVALID_DISPATCH_SOURCE",
            "dispatchWheel source must be a non-empty session key.",
            `${path}.source`
        );
    }

    const mappings = isPlainObject(node.wheelByResult)
        ? Object.entries(node.wheelByResult)
        : [];
    const hasFallback = isNonEmptyString(node.fallbackWheelId);

    if (mappings.length === 0 && !hasFallback) {
        addIssue(
            errors,
            "MISSING_DISPATCH_MAPPING",
            "dispatchWheel requires wheelByResult entries or fallbackWheelId.",
            path
        );
    }

    mappings.forEach(([resultId, wheelId]) => {
        if (!isNonEmptyString(resultId)
            || !registries.wheels.has(wheelId)) {
            addIssue(
                errors,
                "UNKNOWN_DISPATCH_WHEEL_REFERENCE",
                `Dispatch result "${resultId}" references an unknown wheel.`,
                `${path}.wheelByResult.${resultId}`
            );
        }
    });

    if (hasFallback && !registries.wheels.has(node.fallbackWheelId)) {
        addIssue(
            errors,
            "UNKNOWN_DISPATCH_WHEEL_REFERENCE",
            `Unknown fallback wheel "${node.fallbackWheelId}".`,
            `${path}.fallbackWheelId`
        );
    }

    validateAdvance(
        node.next,
        `${path}.next`,
        registries,
        errors
    );
}

function validateNode(
    node,
    path,
    registries,
    errors,
    warnings
) {
    if (!EVENT_FLOW_OPS.includes(node.op)) {
        addIssue(
            errors,
            "UNSUPPORTED_FLOW_OP",
            `Unsupported flow op "${String(node.op)}".`,
            `${path}.op`
        );
        return;
    }

    if (node.saveAs !== undefined && !isNonEmptyString(node.saveAs)) {
        addIssue(
            errors,
            "INVALID_SESSION_CONTEXT_PATH",
            "saveAs must be a non-empty string when present.",
            `${path}.saveAs`
        );
    }

    if (node.targetScope !== undefined
        && !["annual", "route"].includes(node.targetScope)) {
        addIssue(
            errors,
            "INVALID_TARGET_SCOPE",
            "targetScope must be annual or route when present.",
            `${path}.targetScope`
        );
    }

    if (node.op === "roll" || node.op === "gate") {
        const wheelRecord = registries.wheels.get(node.wheelId);

        if (!isNonEmptyString(node.wheelId) || !wheelRecord) {
            addIssue(
                errors,
                "UNKNOWN_WHEEL_REFERENCE",
                `Unknown wheel "${String(node.wheelId)}".`,
                `${path}.wheelId`
            );
            return;
        }

        if (node.op === "roll") {
            validateRollNode(
                node,
                path,
                wheelRecord.entity,
                registries,
                errors
            );
        } else {
            validateGateNode(
                node,
                path,
                wheelRecord.entity,
                registries,
                errors
            );
        }
        return;
    }

    if (node.op === "repeatWheel") {
        validateRepeatNode(node, path, registries, errors);
        return;
    }

    if (node.op === "dispatchWheel") {
        validateDispatchNode(node, path, registries, errors);
        return;
    }

    if (node.op === "setRoute") {
        if (!registries.routes.has(node.routeId)) {
            addIssue(
                errors,
                "UNKNOWN_ROUTE_REFERENCE",
                `Unknown route "${String(node.routeId)}".`,
                `${path}.routeId`
            );
        }

        validateAdvance(
            node.next,
            `${path}.next`,
            registries,
            errors
        );
        return;
    }

    if (node.op === "yieldYear") {
        if (node.next?.advance !== "next_year") {
            addIssue(
                errors,
                "INVALID_YIELD_YEAR_ADVANCE",
                "yieldYear requires next.advance next_year.",
                `${path}.next`
            );
        }

        validateAdvance(
            node.next,
            `${path}.next`,
            registries,
            errors
        );
        return;
    }

    if (Object.prototype.hasOwnProperty.call(node, "next")) {
        addIssue(
            errors,
            "STOP_NODE_HAS_ADVANCE",
            `${node.op} nodes must not define next.`,
            `${path}.next`
        );
    }

    if (node.op === "terminal"
        && node.reason !== undefined
        && !isNonEmptyString(node.reason)) {
        addIssue(
            errors,
            "INVALID_TERMINAL_REASON",
            "terminal reason must be a non-empty string when present.",
            `${path}.reason`
        );
    }
}

function prepareFlowNodes(flowRecord, errors) {
    const { entity: flow, path } = flowRecord;
    const nodes = new Map();

    if (!Array.isArray(flow.nodes) || flow.nodes.length === 0) {
        addIssue(
            errors,
            "INVALID_FLOW_NODES",
            "Flow nodes must be a non-empty array.",
            `${path}.nodes`
        );
        flowRecord.nodes = nodes;
        return;
    }

    flow.nodes.forEach((node, index) => {
        const nodePath = `${path}.nodes[${index}]`;

        if (!isPlainObject(node)) {
            addIssue(
                errors,
                "INVALID_FLOW_NODE",
                "Flow nodes must be plain objects.",
                nodePath
            );
            return;
        }

        if (!isNonEmptyString(node.id)) {
            addIssue(
                errors,
                "MISSING_FLOW_NODE_ID",
                "Flow node id must be a non-empty string.",
                `${nodePath}.id`
            );
            return;
        }

        if (nodes.has(node.id)) {
            addIssue(
                errors,
                "DUPLICATE_FLOW_NODE_ID",
                `Flow node id "${node.id}" is duplicated.`,
                `${nodePath}.id`
            );
            return;
        }

        nodes.set(node.id, {
            entity: node,
            path: nodePath
        });
    });

    flowRecord.nodes = nodes;
}

function validateFlow(
    flowRecord,
    registries,
    errors,
    warnings
) {
    const { entity: flow, path, nodes } = flowRecord;

    if (!isNonEmptyString(flow.entryNodeId)
        || !nodes.has(flow.entryNodeId)) {
        addIssue(
            errors,
            "UNKNOWN_FLOW_ENTRY_NODE",
            "entryNodeId must reference an existing node.",
            `${path}.entryNodeId`
        );
    }

    if (flow.sessionLimits !== undefined) {
        if (!isPlainObject(flow.sessionLimits)
            || !Number.isInteger(flow.sessionLimits.maxSpins)
            || flow.sessionLimits.maxSpins < 1) {
            addIssue(
                errors,
                "INVALID_FLOW_SESSION_LIMIT",
                "sessionLimits.maxSpins must be a positive integer.",
                `${path}.sessionLimits.maxSpins`
            );
        } else if (flow.sessionLimits.status === "provisional") {
            addIssue(
                warnings,
                "PROVISIONAL_SESSION_LIMIT",
                "Flow session limit remains provisional.",
                `${path}.sessionLimits`,
                {
                    status: "provisional"
                }
            );
        }
    }

    const savedSessionKeys = new Set(
        [...nodes.values()]
            .map(nodeRecord => nodeRecord.entity.saveAs)
            .filter(isNonEmptyString)
    );

    nodes.forEach(nodeRecord => {
        if (nodeRecord.entity.op === "repeatWheel"
            && isNonEmptyString(nodeRecord.entity.countFrom)
            && !savedSessionKeys.has(nodeRecord.entity.countFrom)) {
            addIssue(
                errors,
                "UNKNOWN_REPEAT_COUNT_SOURCE",
                `repeatWheel countFrom "${nodeRecord.entity.countFrom}" is not produced by this flow.`,
                `${nodeRecord.path}.countFrom`
            );
        }

        validateNode(
            nodeRecord.entity,
            nodeRecord.path,
            registries,
            errors,
            warnings
        );
    });
}

function validateRoute(
    routeRecord,
    registries,
    errors
) {
    const { entity: route, path } = routeRecord;

    if (!EVENT_ROUTE_LANES.includes(route.lane)) {
        addIssue(
            errors,
            "INVALID_ROUTE_LANE",
            `Unsupported route lane "${String(route.lane)}".`,
            `${path}.lane`
        );
    }

    if (!validateStringArray(
        route.mutexGroups,
        `${path}.mutexGroups`,
        errors,
        "INVALID_ROUTE_MUTEX_GROUPS"
    )) {
        return;
    }

    if (new Set(route.mutexGroups).size !== route.mutexGroups.length) {
        addIssue(
            errors,
            "DUPLICATE_ROUTE_MUTEX_GROUP",
            "Route mutexGroups must not contain duplicates.",
            `${path}.mutexGroups`
        );
    }

    if (!EVENT_ROUTE_CONFLICT_POLICIES.includes(
        route.conflictPolicy
    )) {
        addIssue(
            errors,
            "INVALID_ROUTE_CONFLICT_POLICY",
            `Unsupported route conflictPolicy "${String(route.conflictPolicy)}".`,
            `${path}.conflictPolicy`
        );
    } else if (["replace", "branch"].includes(route.conflictPolicy)
        && route.reviewStatus !== "confirmed") {
        addIssue(
            errors,
            "UNCONFIRMED_DESTRUCTIVE_ROUTE_POLICY",
            `${route.conflictPolicy} requires confirmed narrative review.`,
            `${path}.conflictPolicy`
        );
    }

    if (!isPlainObject(route.entry)
        || !isNonEmptyString(route.entry.flowId)
        || !isNonEmptyString(route.entry.nodeId)) {
        addIssue(
            errors,
            "INVALID_ROUTE_ENTRY",
            "Route entry requires flowId and nodeId.",
            `${path}.entry`
        );
        return;
    }

    const flowRecord = registries.flows.get(route.entry.flowId);

    if (!flowRecord) {
        addIssue(
            errors,
            "UNKNOWN_FLOW_REFERENCE",
            `Unknown route entry flow "${route.entry.flowId}".`,
            `${path}.entry.flowId`
        );
        return;
    }

    if (!flowRecord.nodes?.has(route.entry.nodeId)) {
        addIssue(
            errors,
            "UNKNOWN_ROUTE_ENTRY_NODE",
            `Unknown route entry node "${route.entry.nodeId}".`,
            `${path}.entry.nodeId`
        );
    }
}

function collectNodeAdvances(node, wheel) {
    if (node.op === "gate" && isPlainObject(node.nextByItemId)) {
        return Object.values(node.nextByItemId);
    }

    if (Object.prototype.hasOwnProperty.call(node, "next")) {
        return [node.next];
    }

    if (node.op === "roll" && Array.isArray(wheel?.items)) {
        return getDrawableItems(wheel)
            .filter(item => Object.prototype.hasOwnProperty.call(
                item,
                "next"
            ))
            .map(item => item.next);
    }

    return [];
}

function buildFlowGraph(registries, warnings) {
    const adjacency = new Map();
    const stopNodes = new Set();
    const opaqueExitNodes = new Set();
    const entries = [];

    registries.flows.forEach((flowRecord, flowId) => {
        if (flowRecord.nodes?.has(flowRecord.entity.entryNodeId)) {
            entries.push(`${flowId}\u0000${flowRecord.entity.entryNodeId}`);
        }

        flowRecord.nodes?.forEach((nodeRecord, nodeId) => {
            const key = `${flowId}\u0000${nodeId}`;
            const node = nodeRecord.entity;
            const wheel = registries.wheels.get(node.wheelId)?.entity;
            const advances = collectNodeAdvances(node, wheel);
            const edges = [];

            adjacency.set(key, edges);

            if (["end", "terminal", "yieldYear"].includes(node.op)) {
                stopNodes.add(key);
            }

            advances.forEach(next => {
                if (!isPlainObject(next)) {
                    return;
                }

                if (["end", "terminal", "next_year"].includes(
                    next.advance
                )) {
                    stopNodes.add(key);
                    return;
                }

                if (next.advance === "same_year"
                    && next.target?.kind === "flow_node"
                    && isNonEmptyString(next.target.flowId)
                    && isNonEmptyString(next.target.nodeId)) {
                    edges.push(
                        `${next.target.flowId}\u0000${next.target.nodeId}`
                    );
                    return;
                }

                if (next.advance === "same_year" && next.target) {
                    opaqueExitNodes.add(key);
                    addIssue(
                        warnings,
                        "FLOW_STOP_PATH_UNPROVEN",
                        "A same_year non-flow target prevents complete static stop-path proof.",
                        nodeRecord.path
                    );
                }
            });
        });
    });

    return {
        adjacency,
        entries,
        opaqueExitNodes,
        stopNodes
    };
}

function validateReachability(graph, registries, errors, warnings) {
    const reachable = new Set();
    const queue = [...graph.entries];

    while (queue.length > 0) {
        const key = queue.shift();

        if (reachable.has(key)) {
            continue;
        }

        reachable.add(key);
        (graph.adjacency.get(key) || []).forEach(next => queue.push(next));
    }

    graph.adjacency.forEach((_, key) => {
        if (reachable.has(key)) {
            return;
        }

        const [flowId, nodeId] = key.split("\u0000");
        const nodePath = registries.flows
            .get(flowId)?.nodes?.get(nodeId)?.path;

        addIssue(
            warnings,
            "UNREACHABLE_FLOW_NODE",
            `Flow node "${flowId}:${nodeId}" is unreachable from all flow entries.`,
            nodePath || "$.flows"
        );
    });

    const reverse = new Map(
        [...graph.adjacency.keys()].map(key => [key, []])
    );

    graph.adjacency.forEach((edges, key) => {
        edges.forEach(target => {
            if (reverse.has(target)) {
                reverse.get(target).push(key);
            }
        });
    });

    const canStop = new Set([
        ...graph.stopNodes,
        ...graph.opaqueExitNodes
    ]);
    const stopQueue = [...canStop];

    while (stopQueue.length > 0) {
        const key = stopQueue.shift();

        (reverse.get(key) || []).forEach(previous => {
            if (!canStop.has(previous)) {
                canStop.add(previous);
                stopQueue.push(previous);
            }
        });
    }

    graph.adjacency.forEach((_, key) => {
        if (canStop.has(key)) {
            return;
        }

        const [flowId, nodeId] = key.split("\u0000");
        const nodePath = registries.flows
            .get(flowId)?.nodes?.get(nodeId)?.path;

        addIssue(
            errors,
            "FLOW_NODE_WITHOUT_STOP_PATH",
            `Flow node "${flowId}:${nodeId}" has no path to a stop state.`,
            nodePath || "$.flows"
        );
    });
}

function findStronglyConnectedComponents(adjacency) {
    let nextIndex = 0;
    const indices = new Map();
    const lowLinks = new Map();
    const stack = [];
    const onStack = new Set();
    const components = [];

    function visit(key) {
        indices.set(key, nextIndex);
        lowLinks.set(key, nextIndex);
        nextIndex += 1;
        stack.push(key);
        onStack.add(key);

        (adjacency.get(key) || []).forEach(target => {
            if (!adjacency.has(target)) {
                return;
            }

            if (!indices.has(target)) {
                visit(target);
                lowLinks.set(
                    key,
                    Math.min(lowLinks.get(key), lowLinks.get(target))
                );
            } else if (onStack.has(target)) {
                lowLinks.set(
                    key,
                    Math.min(lowLinks.get(key), indices.get(target))
                );
            }
        });

        if (lowLinks.get(key) !== indices.get(key)) {
            return;
        }

        const component = [];
        let member;

        do {
            member = stack.pop();
            onStack.delete(member);
            component.push(member);
        } while (member !== key);

        components.push(component);
    }

    adjacency.forEach((_, key) => {
        if (!indices.has(key)) {
            visit(key);
        }
    });

    return components;
}

function validateCycleLimits(graph, registries, errors) {
    findStronglyConnectedComponents(graph.adjacency)
        .filter(component => {
            if (component.length > 1) {
                return true;
            }

            const key = component[0];
            return (graph.adjacency.get(key) || []).includes(key);
        })
        .forEach(component => {
            const flowIds = new Set(
                component.map(key => key.split("\u0000")[0])
            );

            flowIds.forEach(flowId => {
                const flowRecord = registries.flows.get(flowId);
                const maxSpins = flowRecord?.entity
                    ?.sessionLimits?.maxSpins;

                if (!Number.isInteger(maxSpins) || maxSpins < 1) {
                    addIssue(
                        errors,
                        "UNBOUNDED_FLOW_CYCLE",
                        `Flow "${flowId}" participates in a cycle without a positive maxSpins limit.`,
                        `${flowRecord?.path || "$.flows"}.sessionLimits.maxSpins`
                    );
                }
            });
        });
}

function normalizeDataset(dataset, errors) {
    if (!isPlainObject(dataset)) {
        addIssue(
            errors,
            "INVALID_EVENT_SCHEMA_DATASET",
            "Event Schema v2 dataset must be a plain object.",
            "$"
        );
        return {
            wheels: [],
            flows: [],
            routes: []
        };
    }

    const normalized = {};

    ["wheels", "flows", "routes"].forEach(collection => {
        if (!Array.isArray(dataset[collection])) {
            addIssue(
                errors,
                "INVALID_EVENT_SCHEMA_COLLECTION",
                `${collection} must be an array.`,
                `$.${collection}`
            );
            normalized[collection] = [];
        } else {
            normalized[collection] = dataset[collection];
        }
    });

    return normalized;
}

export function validateEventSchemaV2(
    dataset,
    {
        mode = "authoritative"
    } = {}
) {
    const errors = [];
    const warnings = [];

    if (!["authoritative", "reference"].includes(mode)) {
        addIssue(
            errors,
            "INVALID_VALIDATION_MODE",
            `Unsupported validation mode "${String(mode)}".`,
            "$.mode"
        );
    }

    const normalized = normalizeDataset(dataset, errors);
    const registries = {
        wheels: createRegistry(
            normalized.wheels,
            "wheel",
            "$.wheels",
            errors,
            warnings
        ),
        flows: createRegistry(
            normalized.flows,
            "flow",
            "$.flows",
            errors,
            warnings
        ),
        routes: createRegistry(
            normalized.routes,
            "route",
            "$.routes",
            errors,
            warnings
        )
    };

    registries.flows.forEach(flowRecord => {
        prepareFlowNodes(flowRecord, errors);
    });

    normalized.wheels.forEach((wheel, index) => {
        if (!isPlainObject(wheel)) {
            return;
        }

        validateWheel(
            wheel,
            `$.wheels[${index}]`,
            errors,
            warnings,
            mode
        );
    });

    registries.routes.forEach(routeRecord => {
        validateRoute(routeRecord, registries, errors);
    });

    registries.wheels.forEach(wheelRecord => {
        validateWheelAdvances(wheelRecord, registries, errors);
    });

    registries.flows.forEach(flowRecord => {
        validateFlow(
            flowRecord,
            registries,
            errors,
            warnings
        );
    });

    const graph = buildFlowGraph(registries, warnings);

    validateReachability(graph, registries, errors, warnings);
    validateCycleLimits(graph, registries, errors);

    return createResult(errors, warnings);
}

export default validateEventSchemaV2;
