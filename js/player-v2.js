export const PLAYER_V2_SCHEMA_VERSION = "player/2.0";

export const SOUL_BONE_SLOTS = Object.freeze([
    "head",
    "torso",
    "leftArm",
    "rightArm",
    "leftLeg",
    "rightLeg",
    "external"
]);

export const COMBAT_BASE_MODES = Object.freeze([
    "level",
    "civilian_observer",
    "soul_beast_cultivation",
    "hybrid"
]);

export const ROUTE_STATE_BUCKETS = Object.freeze([
    "active",
    "completed",
    "failed",
    "blocked"
]);

const PROHIBITED_DERIVED_POWER_FIELDS = Object.freeze([
    "combatPower",
    "staticCombatPower",
    "effectiveCombatPower"
]);

const ALLOWED_RING_TYPES = new Set([
    "normal",
    "divine_gold"
]);

const ALLOWED_BLOODLINE_GRADES = new Set([
    "low",
    "ordinary",
    "top",
    "sub_dragon",
    "earth_dragon",
    "pure_dragon"
]);

const ALLOWED_SOUL_BONE_STATES = new Set([
    "soul_bone",
    "divine_armor"
]);

const ALLOWED_ROUTE_LANES = new Set([
    "main",
    "faction",
    "npc",
    "deity",
    "personal",
    "temporary"
]);

function isPlainObject(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return false;
    }

    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
}

export function clonePlayerStateValue(value) {
    if (value === null
        || typeof value === "string"
        || typeof value === "boolean") {
        return value;
    }

    if (typeof value === "number") {
        if (!Number.isFinite(value)) {
            throw new TypeError(
                "Player state numbers must be finite for JSON compatibility."
            );
        }

        return value;
    }

    if (Array.isArray(value)) {
        return value.map(clonePlayerStateValue);
    }

    if (isPlainObject(value)) {
        return Object.fromEntries(
            Object.entries(value).map(([key, entry]) => {
                return [key, clonePlayerStateValue(entry)];
            })
        );
    }

    throw new TypeError("Player state values must be JSON-compatible plain data.");
}

function createEmptySoulBones() {
    return Object.fromEntries(
        SOUL_BONE_SLOTS.map(slot => [slot, null])
    );
}

function createEmptyRouteStates() {
    return Object.fromEntries(
        ROUTE_STATE_BUCKETS.map(bucket => [bucket, []])
    );
}

export function createPlayerV2() {
    return {
        schemaVersion: PLAYER_V2_SCHEMA_VERSION,
        name: "主角",
        age: 0,
        level: 1,
        innateSoulPower: null,
        talentGrade: null,
        soulPowerGrowthLocked: false,
        rank: "未觉醒",
        combatBase: {
            mode: "level"
        },
        martialSouls: [],
        activeMartialSoulInstanceId: null,
        soulBones: createEmptySoulBones(),
        domains: [],
        combatAttributes: [],
        soulCores: [],
        deities: [],
        artifacts: [],
        combatTitles: [],
        otherCombatSources: [],
        academy: null,
        faction: null,
        title: "平民",
        money: 0,
        reputation: 0,
        flags: {},
        routeStates: createEmptyRouteStates(),
        annualFlags: {},
        spinHistory: [],
        history: []
    };
}

function addIssue(issues, code, message, path, details = {}) {
    issues.push({
        code,
        message,
        path,
        ...details
    });
}

function validateJsonObject(value, path, errors) {
    if (!isPlainObject(value)) {
        addIssue(
            errors,
            "INVALID_PLAYER_OBJECT",
            `${path} must be a plain object.`,
            path
        );
        return false;
    }

    return true;
}

function validateSoulRing(ring, path, seenSlots, errors, warnings) {
    if (!validateJsonObject(ring, path, errors)) {
        return;
    }

    if (!Number.isInteger(ring.slot) || ring.slot < 1) {
        addIssue(
            errors,
            "INVALID_SOUL_RING_SLOT",
            "Soul ring slot must be a positive integer.",
            `${path}.slot`
        );
    } else if (seenSlots.has(ring.slot)) {
        addIssue(
            errors,
            "DUPLICATE_SOUL_RING_SLOT",
            `Soul ring slot ${ring.slot} is duplicated within one martial soul.`,
            `${path}.slot`
        );
    } else {
        seenSlots.add(ring.slot);
    }

    if (ring.years === null || ring.years === undefined) {
        addIssue(
            warnings,
            "UNRESOLVED_SOUL_RING_YEARS",
            "Soul ring years are unresolved.",
            `${path}.years`
        );
    } else if (!Number.isInteger(ring.years) || ring.years < 1) {
        addIssue(
            errors,
            "INVALID_SOUL_RING_YEARS",
            "Soul ring years must be a positive integer or null while unresolved.",
            `${path}.years`
        );
    }

    if (!ALLOWED_RING_TYPES.has(ring.ringType)) {
        addIssue(
            errors,
            "INVALID_SOUL_RING_TYPE",
            `Unsupported soul ring type "${String(ring.ringType)}".`,
            `${path}.ringType`
        );
    }

    if (ring.soulBeastBloodlineGrade !== null
        && !ALLOWED_BLOODLINE_GRADES.has(ring.soulBeastBloodlineGrade)) {
        addIssue(
            errors,
            "INVALID_SOUL_RING_BLOODLINE",
            `Unsupported soul beast bloodline grade "${String(ring.soulBeastBloodlineGrade)}".`,
            `${path}.soulBeastBloodlineGrade`
        );
    }

    if (ring.tier !== null && typeof ring.tier !== "string") {
        addIssue(
            errors,
            "INVALID_SOUL_RING_TIER",
            "Soul ring tier must be a string or null.",
            `${path}.tier`
        );
    }

    if (typeof ring.sourceType !== "string"
        || ring.sourceType.length === 0) {
        addIssue(
            errors,
            "INVALID_SOUL_RING_SOURCE_TYPE",
            "Soul ring sourceType must be a non-empty string.",
            `${path}.sourceType`
        );
    }

    if (ring.qualityMultiplier !== null
        && (!Number.isFinite(ring.qualityMultiplier)
            || ring.qualityMultiplier <= 0)) {
        addIssue(
            errors,
            "INVALID_GOD_BESTOWED_RING_MULTIPLIER",
            "Soul ring qualityMultiplier must be positive or null.",
            `${path}.qualityMultiplier`
        );
    }

    if (ring.sourceType === "god_bestowed"
        && ring.qualityMultiplier === null) {
        addIssue(
            warnings,
            "UNRESOLVED_GOD_BESTOWED_RING_MULTIPLIER",
            "God-bestowed soul ring qualityMultiplier remains unresolved.",
            `${path}.qualityMultiplier`,
            {
                status: "provisional"
            }
        );
    }

    if (ring.sourceEntityId !== null
        && (typeof ring.sourceEntityId !== "string"
            || ring.sourceEntityId.length === 0)) {
        addIssue(
            errors,
            "INVALID_SOUL_RING_SOURCE_ENTITY_ID",
            "Soul ring sourceEntityId must be a non-empty string or null.",
            `${path}.sourceEntityId`
        );
    }

    if (ring.acquiredAge !== null
        && (!Number.isInteger(ring.acquiredAge)
            || ring.acquiredAge < 0)) {
        addIssue(
            errors,
            "INVALID_SOUL_RING_ACQUIRED_AGE",
            "Soul ring acquiredAge must be a non-negative integer or null.",
            `${path}.acquiredAge`
        );
    }

    if (!isPlainObject(ring.flags)) {
        addIssue(
            errors,
            "INVALID_SOUL_RING_FLAGS",
            "Soul ring flags must be a plain object.",
            `${path}.flags`
        );
    }
}

function validateMartialSouls(player, errors, warnings) {
    if (!Array.isArray(player.martialSouls)) {
        addIssue(
            errors,
            "INVALID_MARTIAL_SOUL_COLLECTION",
            "martialSouls must be an array.",
            "martialSouls"
        );
        return;
    }

    const instanceIds = new Set();
    const definitionIds = new Set();
    const evolutionFamilyIds = new Set();
    const slots = new Set();

    player.martialSouls.forEach((soul, index) => {
        const path = `martialSouls[${index}]`;

        if (!validateJsonObject(soul, path, errors)) {
            return;
        }

        if (typeof soul.instanceId !== "string" || soul.instanceId.length === 0) {
            addIssue(
                errors,
                "INVALID_MARTIAL_SOUL_INSTANCE_ID",
                "Martial soul instanceId must be a non-empty string.",
                `${path}.instanceId`
            );
        } else if (instanceIds.has(soul.instanceId)) {
            addIssue(
                errors,
                "DUPLICATE_MARTIAL_SOUL_INSTANCE_ID",
                `Martial soul instanceId "${soul.instanceId}" is duplicated.`,
                `${path}.instanceId`
            );
        } else {
            instanceIds.add(soul.instanceId);
        }

        if (soul.definitionId === null) {
            addIssue(
                warnings,
                "UNRESOLVED_MARTIAL_SOUL_DEFINITION",
                "Martial soul definitionId is unresolved.",
                `${path}.definitionId`
            );
        } else if (typeof soul.definitionId !== "string"
            || soul.definitionId.length === 0) {
            addIssue(
                errors,
                "INVALID_MARTIAL_SOUL_DEFINITION_ID",
                "Martial soul definitionId must be a non-empty string or null.",
                `${path}.definitionId`
            );
        } else if (definitionIds.has(soul.definitionId)) {
            addIssue(
                errors,
                "DUPLICATE_MARTIAL_SOUL_DEFINITION_ID",
                `Martial soul definitionId "${soul.definitionId}" is duplicated.`,
                `${path}.definitionId`
            );
        } else {
            definitionIds.add(soul.definitionId);
        }

        if (soul.evolutionFamilyId === null) {
            addIssue(
                warnings,
                "UNRESOLVED_MARTIAL_SOUL_EVOLUTION_FAMILY",
                "Martial soul evolutionFamilyId is unresolved.",
                `${path}.evolutionFamilyId`
            );
        } else if (typeof soul.evolutionFamilyId !== "string"
            || soul.evolutionFamilyId.length === 0) {
            addIssue(
                errors,
                "INVALID_MARTIAL_SOUL_EVOLUTION_FAMILY_ID",
                "Martial soul evolutionFamilyId must be a non-empty string or null.",
                `${path}.evolutionFamilyId`
            );
        } else if (evolutionFamilyIds.has(soul.evolutionFamilyId)) {
            addIssue(
                errors,
                "DUPLICATE_MARTIAL_SOUL_EVOLUTION_FAMILY_ID",
                `Martial soul evolutionFamilyId "${soul.evolutionFamilyId}" is duplicated.`,
                `${path}.evolutionFamilyId`
            );
        } else {
            evolutionFamilyIds.add(soul.evolutionFamilyId);
        }

        if (!Number.isInteger(soul.slot) || soul.slot < 1) {
            addIssue(
                errors,
                "INVALID_MARTIAL_SOUL_SLOT",
                "Martial soul slot must be a positive integer.",
                `${path}.slot`
            );
        } else if (slots.has(soul.slot)) {
            addIssue(
                errors,
                "DUPLICATE_MARTIAL_SOUL_SLOT",
                `Martial soul slot ${soul.slot} is duplicated.`,
                `${path}.slot`
            );
        } else {
            slots.add(soul.slot);
        }

        if (soul.legacyName !== null
            && (typeof soul.legacyName !== "string"
                || soul.legacyName.length === 0)) {
            addIssue(
                errors,
                "INVALID_MARTIAL_SOUL_LEGACY_NAME",
                "Martial soul legacyName must be a non-empty string or null.",
                `${path}.legacyName`
            );
        }

        if (soul.awakenedAge !== null
            && (!Number.isInteger(soul.awakenedAge)
                || soul.awakenedAge < 0)) {
            addIssue(
                errors,
                "INVALID_MARTIAL_SOUL_AWAKENED_AGE",
                "Martial soul awakenedAge must be a non-negative integer or null.",
                `${path}.awakenedAge`
            );
        }

        if (typeof soul.status !== "string" || soul.status.length === 0) {
            addIssue(
                errors,
                "INVALID_MARTIAL_SOUL_STATUS",
                "Martial soul status must be a non-empty string.",
                `${path}.status`
            );
        }

        if (typeof soul.sealed !== "boolean") {
            addIssue(
                errors,
                "INVALID_MARTIAL_SOUL_SEALED_STATE",
                "Martial soul sealed must be a boolean.",
                `${path}.sealed`
            );
        }

        ["qualityGrade", "avatarGrade"].forEach(field => {
            if (Object.prototype.hasOwnProperty.call(soul, field)
                && soul[field] !== null
                && (typeof soul[field] !== "string"
                    || soul[field].length === 0)) {
                addIssue(
                    errors,
                    "INVALID_MARTIAL_SOUL_OPTIONAL_GRADE",
                    `${field} must be a non-empty string or null when present.`,
                    `${path}.${field}`
                );
            }
        });

        ["mutations", "evolutionHistory", "routeHooksActivated"]
            .forEach(field => {
                if (!Array.isArray(soul[field])) {
                    addIssue(
                        errors,
                        "INVALID_MARTIAL_SOUL_COLLECTION",
                        `Martial soul ${field} must be an array.`,
                        `${path}.${field}`
                    );
                }
            });

        if (!isPlainObject(soul.flags)) {
            addIssue(
                errors,
                "INVALID_MARTIAL_SOUL_FLAGS",
                "Martial soul flags must be a plain object.",
                `${path}.flags`
            );
        }

        if (!Array.isArray(soul.soulRings)) {
            addIssue(
                errors,
                "INVALID_SOUL_RING_COLLECTION",
                "martialSoul.soulRings must be an array.",
                `${path}.soulRings`
            );
        } else {
            const ringSlots = new Set();

            soul.soulRings.forEach((ring, ringIndex) => {
                validateSoulRing(
                    ring,
                    `${path}.soulRings[${ringIndex}]`,
                    ringSlots,
                    errors,
                    warnings
                );
            });
        }
    });

    if (player.activeMartialSoulInstanceId !== null) {
        if (typeof player.activeMartialSoulInstanceId !== "string"
            || !instanceIds.has(player.activeMartialSoulInstanceId)) {
            addIssue(
                errors,
                "DANGLING_ACTIVE_MARTIAL_SOUL_REFERENCE",
                "activeMartialSoulInstanceId must be null or reference an existing instance.",
                "activeMartialSoulInstanceId"
            );
        }
    }
}

function validateSoulBone(bone, path, martialSoulIds, errors, warnings) {
    if (bone === null) {
        return;
    }

    if (!validateJsonObject(bone, path, errors)) {
        return;
    }

    if (bone.years === null || bone.years === undefined) {
        addIssue(
            warnings,
            "UNRESOLVED_SOUL_BONE_YEARS",
            "Soul bone years are unresolved.",
            `${path}.years`
        );
    } else if (!Number.isInteger(bone.years) || bone.years < 1) {
        addIssue(
            errors,
            "INVALID_SOUL_BONE_YEARS",
            "Soul bone years must be a positive integer or null while unresolved.",
            `${path}.years`
        );
    }

    if (bone.soulBeastBloodlineGrade !== null
        && !ALLOWED_BLOODLINE_GRADES.has(bone.soulBeastBloodlineGrade)) {
        addIssue(
            errors,
            "INVALID_SOUL_BONE_BLOODLINE",
            `Unsupported soul beast bloodline grade "${String(bone.soulBeastBloodlineGrade)}".`,
            `${path}.soulBeastBloodlineGrade`
        );
    }

    if (bone.definitionId !== null
        && (typeof bone.definitionId !== "string"
            || bone.definitionId.length === 0)) {
        addIssue(
            errors,
            "INVALID_SOUL_BONE_DEFINITION_ID",
            "Soul bone definitionId must be a non-empty string or null.",
            `${path}.definitionId`
        );
    }

    if (bone.name !== null && typeof bone.name !== "string") {
        addIssue(
            errors,
            "INVALID_SOUL_BONE_NAME",
            "Soul bone name must be a string or null.",
            `${path}.name`
        );
    }

    if (bone.tier !== null && typeof bone.tier !== "string") {
        addIssue(
            errors,
            "INVALID_SOUL_BONE_TIER",
            "Soul bone tier must be a string or null.",
            `${path}.tier`
        );
    }

    if (typeof bone.sourceType !== "string"
        || bone.sourceType.length === 0) {
        addIssue(
            errors,
            "INVALID_SOUL_BONE_SOURCE_TYPE",
            "Soul bone sourceType must be a non-empty string.",
            `${path}.sourceType`
        );
    }

    if (!ALLOWED_SOUL_BONE_STATES.has(bone.equipmentState)) {
        addIssue(
            errors,
            "INVALID_SOUL_BONE_EQUIPMENT_STATE",
            `Unsupported soul bone equipment state "${String(bone.equipmentState)}".`,
            `${path}.equipmentState`
        );
    }

    if (bone.boundMartialSoulInstanceId !== null
        && (typeof bone.boundMartialSoulInstanceId !== "string"
            || !martialSoulIds.has(bone.boundMartialSoulInstanceId))) {
        addIssue(
            errors,
            "DANGLING_SOUL_BONE_MARTIAL_SOUL_REFERENCE",
            "boundMartialSoulInstanceId must be null or reference an existing martial soul.",
            `${path}.boundMartialSoulInstanceId`
        );
    }

    if (bone.divineMultiplier !== null
        && (!Number.isFinite(bone.divineMultiplier)
            || bone.divineMultiplier < 0)) {
        addIssue(
            errors,
            "INVALID_SOUL_BONE_DIVINE_MULTIPLIER",
            "Soul bone divineMultiplier must be a non-negative number or null.",
            `${path}.divineMultiplier`
        );
    }

    if (!isPlainObject(bone.flags)) {
        addIssue(
            errors,
            "INVALID_SOUL_BONE_FLAGS",
            "Soul bone flags must be a plain object.",
            `${path}.flags`
        );
    }
}

function validateSoulBones(player, errors, warnings) {
    if (!validateJsonObject(player.soulBones, "soulBones", errors)) {
        return;
    }

    const actualSlots = Object.keys(player.soulBones);
    const martialSoulIds = new Set(
        Array.isArray(player.martialSouls)
            ? player.martialSouls
                .filter(soul => isPlainObject(soul))
                .map(soul => soul.instanceId)
                .filter(id => typeof id === "string")
            : []
    );

    SOUL_BONE_SLOTS.forEach(slot => {
        if (!Object.prototype.hasOwnProperty.call(player.soulBones, slot)) {
            addIssue(
                errors,
                "MISSING_SOUL_BONE_SLOT",
                `Soul bone slot "${slot}" is required.`,
                `soulBones.${slot}`
            );
            return;
        }

        validateSoulBone(
            player.soulBones[slot],
            `soulBones.${slot}`,
            martialSoulIds,
            errors,
            warnings
        );
    });

    actualSlots
        .filter(slot => !SOUL_BONE_SLOTS.includes(slot))
        .forEach(slot => {
            addIssue(
                errors,
                "UNKNOWN_SOUL_BONE_SLOT",
                `Unknown soul bone slot "${slot}".`,
                `soulBones.${slot}`
            );
        });
}

function validateRouteStateEntry(
    routeState,
    bucket,
    path,
    routeIds,
    errors
) {
    if (!validateJsonObject(routeState, path, errors)) {
        return;
    }

    if (typeof routeState.routeId !== "string"
        || routeState.routeId.length === 0) {
        addIssue(
            errors,
            "INVALID_ROUTE_STATE_ID",
            "Route state routeId must be a non-empty string.",
            `${path}.routeId`
        );
    } else if (routeIds.has(routeState.routeId)) {
        addIssue(
            errors,
            "DUPLICATE_ROUTE_STATE_ID",
            `Route "${routeState.routeId}" occurs in more than one route state entry.`,
            `${path}.routeId`
        );
    } else {
        routeIds.add(routeState.routeId);
    }

    if (!ALLOWED_ROUTE_LANES.has(routeState.lane)) {
        addIssue(
            errors,
            "INVALID_ROUTE_STATE_LANE",
            `Unsupported route lane "${String(routeState.lane)}".`,
            `${path}.lane`
        );
    }

    if (typeof routeState.nodeId !== "string"
        || routeState.nodeId.length === 0) {
        addIssue(
            errors,
            "INVALID_ROUTE_STATE_NODE_ID",
            "Route state nodeId must be a non-empty string.",
            `${path}.nodeId`
        );
    }

    ["startedAge", "lastAdvancedAge"].forEach(field => {
        if (!Number.isInteger(routeState[field]) || routeState[field] < 0) {
            addIssue(
                errors,
                "INVALID_ROUTE_STATE_AGE",
                `${field} must be a non-negative integer.`,
                `${path}.${field}`
            );
        }
    });

    if (routeState.status !== bucket) {
        addIssue(
            errors,
            "ROUTE_STATE_STATUS_BUCKET_MISMATCH",
            `Route status must be "${bucket}" in routeStates.${bucket}.`,
            `${path}.status`
        );
    }

    ["data", "flags", "visitCounts"].forEach(field => {
        if (!isPlainObject(routeState[field])) {
            addIssue(
                errors,
                "INVALID_ROUTE_STATE_MAP",
                `${field} must be a plain object.`,
                `${path}.${field}`
            );
        }
    });

    if (isPlainObject(routeState.visitCounts)) {
        Object.entries(routeState.visitCounts).forEach(([nodeId, count]) => {
            if (!Number.isInteger(count) || count < 0) {
                addIssue(
                    errors,
                    "INVALID_ROUTE_VISIT_COUNT",
                    `Visit count for "${nodeId}" must be a non-negative integer.`,
                    `${path}.visitCounts.${nodeId}`
                );
            }
        });
    }
}

function validateRouteStates(player, errors) {
    if (!isPlainObject(player.routeStates)) {
        addIssue(
            errors,
            "INVALID_ROUTE_STATE_COLLECTION",
            "routeStates must be an object.",
            "routeStates"
        );
        return;
    }

    Object.keys(player.routeStates)
        .filter(bucket => !ROUTE_STATE_BUCKETS.includes(bucket))
        .forEach(bucket => {
            addIssue(
                errors,
                "UNKNOWN_ROUTE_STATE_BUCKET",
                `Unknown route state bucket "${bucket}".`,
                `routeStates.${bucket}`
            );
        });

    const routeIds = new Set();
    let activeMainRouteCount = 0;

    ROUTE_STATE_BUCKETS.forEach(bucket => {
        const entries = player.routeStates[bucket];

        if (!Array.isArray(entries)) {
            addIssue(
                errors,
                "INVALID_ROUTE_STATE_BUCKET",
                `routeStates.${bucket} must be an array.`,
                `routeStates.${bucket}`
            );
            return;
        }

        entries.forEach((routeState, index) => {
            validateRouteStateEntry(
                routeState,
                bucket,
                `routeStates.${bucket}[${index}]`,
                routeIds,
                errors
            );

            if (bucket === "active" && routeState?.lane === "main") {
                activeMainRouteCount += 1;
            }
        });
    });

    if (activeMainRouteCount > 1) {
        addIssue(
            errors,
            "MULTIPLE_ACTIVE_MAIN_ROUTES",
            "Only one main route may be active at a time.",
            "routeStates.active"
        );
    }
}

function validateCollections(player, errors) {
    [
        "domains",
        "combatAttributes",
        "soulCores",
        "deities",
        "artifacts",
        "combatTitles",
        "otherCombatSources",
        "spinHistory",
        "history"
    ].forEach(field => {
        if (!Array.isArray(player[field])) {
            addIssue(
                errors,
                "INVALID_PLAYER_COLLECTION",
                `${field} must be an array.`,
                field
            );
        }
    });

    ["flags", "annualFlags"].forEach(field => {
        if (!isPlainObject(player[field])) {
            addIssue(
                errors,
                "INVALID_PLAYER_MAP",
                `${field} must be a plain object.`,
                field
            );
        }
    });

    validateRouteStates(player, errors);
}

export function validatePlayerV2(player) {
    const errors = [];
    const warnings = [];

    if (!validateJsonObject(player, "player", errors)) {
        return {
            valid: false,
            errors,
            warnings
        };
    }

    if (player.schemaVersion !== PLAYER_V2_SCHEMA_VERSION) {
        addIssue(
            errors,
            "INVALID_PLAYER_SCHEMA_VERSION",
            `schemaVersion must be "${PLAYER_V2_SCHEMA_VERSION}".`,
            "schemaVersion"
        );
    }

    PROHIBITED_DERIVED_POWER_FIELDS.forEach(field => {
        if (Object.prototype.hasOwnProperty.call(player, field)) {
            addIssue(
                errors,
                "DERIVED_COMBAT_POWER_FIELD_FORBIDDEN",
                `Player v2 must not store derived field "${field}".`,
                field
            );
        }
    });

    ["spirit", "soulRings", "activeRoutes"].forEach(field => {
        if (Object.prototype.hasOwnProperty.call(player, field)) {
            addIssue(
                errors,
                "LEGACY_MIRROR_FIELD_FORBIDDEN",
                `Player v2 must not store compatibility mirror "${field}".`,
                field
            );
        }
    });

    if (!Number.isInteger(player.age) || player.age < 0) {
        addIssue(
            errors,
            "INVALID_PLAYER_AGE",
            "Player age must be a non-negative integer.",
            "age"
        );
    }

    if (!Number.isInteger(player.level) || player.level < 0) {
        addIssue(
            errors,
            "INVALID_PLAYER_LEVEL",
            "Player level must be a non-negative integer.",
            "level"
        );
    }

    if (player.innateSoulPower !== null
        && (!Number.isInteger(player.innateSoulPower)
            || player.innateSoulPower < 0)) {
        addIssue(
            errors,
            "INVALID_INNATE_SOUL_POWER",
            "innateSoulPower must be a non-negative integer or null.",
            "innateSoulPower"
        );
    }

    if (player.talentGrade !== null
        && (typeof player.talentGrade !== "string"
            || player.talentGrade.length === 0)) {
        addIssue(
            errors,
            "INVALID_TALENT_GRADE",
            "talentGrade must be a non-empty string or null.",
            "talentGrade"
        );
    }

    if (typeof player.soulPowerGrowthLocked !== "boolean") {
        addIssue(
            errors,
            "INVALID_SOUL_POWER_GROWTH_LOCK",
            "soulPowerGrowthLocked must be a boolean.",
            "soulPowerGrowthLocked"
        );
    }

    if (player.level === 0 && player.soulPowerGrowthLocked !== true) {
        addIssue(
            errors,
            "LEVEL_ZERO_REQUIRES_GROWTH_LOCK",
            "Player level 0 requires soulPowerGrowthLocked = true.",
            "soulPowerGrowthLocked"
        );
    }

    if (player.innateSoulPower === 0
        && (player.level !== 0 || player.soulPowerGrowthLocked !== true)) {
        addIssue(
            errors,
            "INVALID_ZERO_SOUL_POWER_STATE",
            "Innate soul power 0 requires level 0 and a permanent growth lock.",
            "innateSoulPower"
        );
    }

    ["name", "rank", "title"].forEach(field => {
        if (typeof player[field] !== "string") {
            addIssue(
                errors,
                "INVALID_PLAYER_TEXT_FIELD",
                `${field} must be a string.`,
                field
            );
        }
    });

    ["academy", "faction"].forEach(field => {
        if (player[field] !== null && typeof player[field] !== "string") {
            addIssue(
                errors,
                "INVALID_PLAYER_OPTIONAL_TEXT_FIELD",
                `${field} must be a string or null.`,
                field
            );
        }
    });

    ["money", "reputation"].forEach(field => {
        if (!Number.isFinite(player[field])) {
            addIssue(
                errors,
                "INVALID_PLAYER_NUMERIC_FIELD",
                `${field} must be a finite number.`,
                field
            );
        }
    });

    if (!isPlainObject(player.combatBase)
        || !COMBAT_BASE_MODES.includes(player.combatBase.mode)) {
        addIssue(
            errors,
            "INVALID_COMBAT_BASE_MODE",
            "combatBase.mode must use a supported mode.",
            "combatBase.mode"
        );
    } else if (player.combatBase.mode !== "level") {
        if (player.combatBase.mode !== "civilian_observer") {
            addIssue(
                warnings,
                "UNIMPLEMENTED_COMBAT_BASE_MODE",
                `Combat base mode "${player.combatBase.mode}" is valid but not implemented.`,
                "combatBase.mode",
                {
                    status: "provisional"
                }
            );
        }
    }

    if (player.level === 0
        && player.combatBase?.mode !== "civilian_observer") {
        addIssue(
            errors,
            "LEVEL_ZERO_REQUIRES_CIVILIAN_OBSERVER_ROUTE",
            "Level 0 must use the civilian_observer progression route and cannot enter combat.",
            "combatBase.mode"
        );
    }

    if (player.level !== 0
        && player.combatBase?.mode === "civilian_observer") {
        addIssue(
            errors,
            "CIVILIAN_OBSERVER_ROUTE_REQUIRES_LEVEL_ZERO",
            "The civilian_observer progression route is reserved for level 0.",
            "combatBase.mode"
        );
    }

    validateMartialSouls(player, errors, warnings);
    validateSoulBones(player, errors, warnings);
    validateCollections(player, errors);

    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}

export class PlayerV2ValidationError extends Error {
    constructor(errors) {
        super("Player v2 failed validation.");
        this.name = "PlayerV2ValidationError";
        this.errors = errors;
    }
}

export function assertValidPlayerV2(player) {
    const validation = validatePlayerV2(player);

    if (!validation.valid) {
        throw new PlayerV2ValidationError(validation.errors);
    }

    return validation;
}
