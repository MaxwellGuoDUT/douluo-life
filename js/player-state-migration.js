import {
    PLAYER_V2_SCHEMA_VERSION,
    SOUL_BONE_SLOTS,
    assertValidPlayerV2,
    clonePlayerStateValue,
    createPlayerV2
} from "./player-v2.js";

const PLAYER_V1_FIELDS = new Set([
    "name",
    "age",
    "level",
    "rank",
    "spirit",
    "soulRings",
    "soulBones",
    "academy",
    "faction",
    "title",
    "money",
    "reputation",
    "history"
]);

const LEGACY_DERIVED_COMBAT_FIELDS = new Set([
    "combatPower",
    "staticCombatPower",
    "effectiveCombatPower"
]);

const LEGACY_RING_FIELDS = new Set([
    "age",
    "years",
    "tier",
    "ringType",
    "soulBeastBloodlineGrade",
    "sourceType",
    "qualityMultiplier",
    "sourceEntityId",
    "acquiredAge",
    "flags"
]);

const LEGACY_SOUL_BONE_FIELDS = new Set([
    "definitionId",
    "name",
    "age",
    "years",
    "tier",
    "soulBeastBloodlineGrade",
    "sourceType",
    "equipmentState",
    "divineMultiplier",
    "boundMartialSoulInstanceId",
    "flags"
]);

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

function copyUnknownFields(source, knownFields) {
    if (!isPlainObject(source)) {
        return {};
    }

    return Object.fromEntries(
        Object.entries(source)
            .filter(([key]) => !knownFields.has(key))
            .map(([key, value]) => [key, clonePlayerStateValue(value)])
    );
}

function mergeMigrationFlags(sourceFlags, unknownFields) {
    const flags = isPlainObject(sourceFlags)
        ? clonePlayerStateValue(sourceFlags)
        : {};

    flags.migratedFromV1 = true;

    if (Object.keys(unknownFields).length > 0) {
        flags.legacyUnrecognizedFields = unknownFields;
    }

    return flags;
}

function migrateLegacyRing(ring, index, warnings) {
    const path = `soulRings[${index}]`;
    const source = isPlainObject(ring) ? ring : {};
    const unknownFields = isPlainObject(ring)
        ? copyUnknownFields(ring, LEGACY_RING_FIELDS)
        : {
            rawValue: clonePlayerStateValue(ring)
        };

    addWarning(
        warnings,
        "UNRESOLVED_LEGACY_SOUL_RING_METADATA",
        "Legacy soul ring bloodline and source metadata remain unresolved.",
        path
    );

    const flags = mergeMigrationFlags(source.flags, unknownFields);

    if (source.age !== undefined
        && source.years !== undefined
        && source.age !== source.years) {
        flags.legacyConflictingYears = {
            age: clonePlayerStateValue(source.age),
            years: clonePlayerStateValue(source.years)
        };
        addWarning(
            warnings,
            "CONFLICTING_LEGACY_YEARS_FIELDS",
            "Legacy soul ring has conflicting age and years; years was retained.",
            path
        );
    }

    return {
        slot: index + 1,
        years: source.years ?? source.age ?? null,
        tier: source.tier ?? null,
        ringType: source.ringType ?? "normal",
        soulBeastBloodlineGrade: source.soulBeastBloodlineGrade ?? null,
        sourceType: source.sourceType ?? "legacy_unknown",
        qualityMultiplier: source.qualityMultiplier ?? null,
        sourceEntityId: source.sourceEntityId ?? null,
        acquiredAge: source.acquiredAge ?? null,
        flags
    };
}

function createLegacyMartialSoul(legacyName, soulRings) {
    return {
        instanceId: "ms_legacy_1",
        definitionId: null,
        evolutionFamilyId: null,
        legacyName,
        slot: 1,
        awakenedAge: null,
        status: "active",
        sealed: false,
        soulRings,
        mutations: [],
        evolutionHistory: [],
        flags: {
            migratedFromV1: true
        },
        routeHooksActivated: []
    };
}

function migrateLegacySoulBone(bone, slot, warnings) {
    if (bone === null || bone === undefined) {
        return null;
    }

    const path = `soulBones.${slot}`;
    const source = isPlainObject(bone) ? bone : {};
    const unknownFields = isPlainObject(bone)
        ? copyUnknownFields(bone, LEGACY_SOUL_BONE_FIELDS)
        : {
            rawValue: clonePlayerStateValue(bone)
        };

    addWarning(
        warnings,
        "UNRESOLVED_LEGACY_SOUL_BONE_METADATA",
        "Legacy soul bone entity, bloodline, and source metadata remain unresolved.",
        path
    );

    const flags = mergeMigrationFlags(source.flags, unknownFields);

    if (source.age !== undefined
        && source.years !== undefined
        && source.age !== source.years) {
        flags.legacyConflictingYears = {
            age: clonePlayerStateValue(source.age),
            years: clonePlayerStateValue(source.years)
        };
        addWarning(
            warnings,
            "CONFLICTING_LEGACY_YEARS_FIELDS",
            "Legacy soul bone has conflicting age and years; years was retained.",
            path
        );
    }

    return {
        definitionId: source.definitionId ?? null,
        name: source.name ?? null,
        years: source.years ?? source.age ?? null,
        tier: source.tier ?? null,
        soulBeastBloodlineGrade: source.soulBeastBloodlineGrade ?? null,
        sourceType: source.sourceType ?? "legacy_unknown",
        equipmentState: source.equipmentState ?? "soul_bone",
        divineMultiplier: source.divineMultiplier ?? null,
        boundMartialSoulInstanceId: source.boundMartialSoulInstanceId ?? null,
        flags
    };
}

export function isPlayerV2(player) {
    return isPlainObject(player)
        && player.schemaVersion === PLAYER_V2_SCHEMA_VERSION;
}

export function migratePlayerV1ToV2(playerV1) {
    if (!isPlainObject(playerV1)) {
        throw new TypeError("Player v1 migration input must be a plain object.");
    }

    if (isPlayerV2(playerV1)) {
        assertValidPlayerV2(playerV1);

        return {
            player: clonePlayerStateValue(playerV1),
            warnings: []
        };
    }

    if (Object.prototype.hasOwnProperty.call(playerV1, "schemaVersion")) {
        throw new TypeError(
            `Unsupported player schemaVersion "${String(playerV1.schemaVersion)}".`
        );
    }

    const player = createPlayerV2();
    const warnings = [];

    [
        "name",
        "age",
        "level",
        "rank",
        "academy",
        "faction",
        "title",
        "money",
        "reputation",
        "history"
    ].forEach(field => {
        if (Object.prototype.hasOwnProperty.call(playerV1, field)) {
            player[field] = clonePlayerStateValue(playerV1[field]);
        }
    });

    const legacyRings = Array.isArray(playerV1.soulRings)
        ? playerV1.soulRings.map((ring, index) => {
            return migrateLegacyRing(ring, index, warnings);
        })
        : [];
    const hasLegacySpirit = typeof playerV1.spirit === "string"
        && playerV1.spirit.length > 0;

    if (hasLegacySpirit || legacyRings.length > 0) {
        player.martialSouls = [
            createLegacyMartialSoul(
                hasLegacySpirit ? playerV1.spirit : null,
                legacyRings
            )
        ];
        player.activeMartialSoulInstanceId = hasLegacySpirit
            ? "ms_legacy_1"
            : null;

        if (hasLegacySpirit) {
            addWarning(
                warnings,
                "UNRESOLVED_LEGACY_MARTIAL_SOUL",
                "Legacy martial soul name was preserved without inventing a definitionId.",
                "spirit",
                {
                    legacyName: playerV1.spirit
                }
            );
        } else {
            addWarning(
                warnings,
                "LEGACY_SOUL_RINGS_WITHOUT_MARTIAL_SOUL",
                "Legacy soul rings were preserved on an unresolved placeholder martial soul.",
                "soulRings"
            );
        }
    }

    if (Object.prototype.hasOwnProperty.call(playerV1, "spirit")
        && playerV1.spirit !== null
        && !hasLegacySpirit) {
        player.flags.legacyInvalidSpirit = clonePlayerStateValue(
            playerV1.spirit
        );
        addWarning(
            warnings,
            "INVALID_LEGACY_SPIRIT_PRESERVED",
            "Invalid legacy spirit data was preserved in migration metadata.",
            "spirit"
        );
    }

    if (Object.prototype.hasOwnProperty.call(playerV1, "soulRings")
        && !Array.isArray(playerV1.soulRings)) {
        player.flags.legacyInvalidSoulRings = clonePlayerStateValue(
            playerV1.soulRings
        );
        addWarning(
            warnings,
            "INVALID_LEGACY_SOUL_RINGS_PRESERVED",
            "Invalid legacy soulRings data was preserved in migration metadata.",
            "soulRings"
        );
    }

    const legacySoulBones = isPlainObject(playerV1.soulBones)
        ? playerV1.soulBones
        : {};

    SOUL_BONE_SLOTS.forEach(slot => {
        player.soulBones[slot] = migrateLegacySoulBone(
            legacySoulBones[slot],
            slot,
            warnings
        );
    });

    if (Object.prototype.hasOwnProperty.call(playerV1, "soulBones")
        && !isPlainObject(playerV1.soulBones)) {
        player.flags.legacyInvalidSoulBones = clonePlayerStateValue(
            playerV1.soulBones
        );
        addWarning(
            warnings,
            "INVALID_LEGACY_SOUL_BONES_PRESERVED",
            "Invalid legacy soulBones data was preserved in migration metadata.",
            "soulBones"
        );
    }

    const unrecognizedFields = copyUnknownFields(
        playerV1,
        new Set([
            ...PLAYER_V1_FIELDS,
            ...LEGACY_DERIVED_COMBAT_FIELDS
        ])
    );

    player.flags.migratedFromV1 = true;

    if (Object.keys(unrecognizedFields).length > 0) {
        player.flags.legacyUnrecognizedFields = unrecognizedFields;

        Object.keys(unrecognizedFields).forEach(field => {
            addWarning(
                warnings,
                "UNRECOGNIZED_LEGACY_FIELD_PRESERVED",
                `Unrecognized legacy field "${field}" was preserved in migration metadata.`,
                field
            );
        });
    }

    LEGACY_DERIVED_COMBAT_FIELDS.forEach(field => {
        if (!Object.prototype.hasOwnProperty.call(playerV1, field)) {
            return;
        }

        addWarning(
            warnings,
            "LEGACY_DERIVED_COMBAT_FIELD_DROPPED",
            `Legacy derived combat field "${field}" was intentionally not persisted.`,
            field
        );
    });

    assertValidPlayerV2(player);

    return {
        player,
        warnings
    };
}

export function ensurePlayerV2(player) {
    if (isPlayerV2(player)) {
        assertValidPlayerV2(player);

        return {
            player: clonePlayerStateValue(player),
            warnings: []
        };
    }

    if (isPlainObject(player)
        && Object.prototype.hasOwnProperty.call(player, "schemaVersion")) {
        throw new TypeError(
            `Unsupported player schemaVersion "${String(player.schemaVersion)}".`
        );
    }

    return migratePlayerV1ToV2(player);
}
