import assert from "node:assert/strict";
import test from "node:test";

import {
    ensurePlayerV2,
    isPlayerV2,
    migratePlayerV1ToV2
} from "../js/player-state-migration.js";
import {
    createPlayerV2,
    validatePlayerV2
} from "../js/player-v2.js";

function warningCodes(result) {
    return result.warnings.map(warning => warning.code);
}

test("v1 migration deep-copies base fields and preserves unknown input", () => {
    const playerV1 = {
        name: "测试主角",
        age: 12,
        level: 23,
        rank: "大魂师",
        spirit: "蓝银草",
        soulRings: [
            {
                age: 423,
                tier: "百年",
                legacyNote: {
                    source: "owner_input"
                }
            }
        ],
        soulBones: {
            head: null,
            torso: null,
            leftArm: null,
            rightArm: null,
            leftLeg: null,
            rightLeg: null,
            external: null
        },
        academy: "诺丁学院",
        faction: null,
        title: "平民",
        money: 8,
        reputation: 3,
        history: [
            {
                age: 6,
                event: {
                    id: "awakening"
                }
            }
        ],
        ownerExtension: {
            keep: [
                "all",
                "data"
            ]
        }
    };
    const before = JSON.stringify(playerV1);
    const result = migratePlayerV1ToV2(playerV1);
    const migrated = result.player;

    assert.equal(JSON.stringify(playerV1), before);
    assert.equal(isPlayerV2(migrated), true);
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
        assert.deepEqual(migrated[field], playerV1[field]);
    });
    assert.notStrictEqual(migrated.history, playerV1.history);
    assert.notStrictEqual(migrated.history[0], playerV1.history[0]);
    assert.deepEqual(
        migrated.flags.legacyUnrecognizedFields.ownerExtension,
        playerV1.ownerExtension
    );
    assert.notStrictEqual(
        migrated.flags.legacyUnrecognizedFields.ownerExtension,
        playerV1.ownerExtension
    );
    assert.deepEqual(
        migrated.martialSouls[0].soulRings[0]
            .flags.legacyUnrecognizedFields.legacyNote,
        playerV1.soulRings[0].legacyNote
    );
    assert.ok(warningCodes(result).includes(
        "UNRECOGNIZED_LEGACY_FIELD_PRESERVED"
    ));
    assert.equal(validatePlayerV2(migrated).valid, true);
});

test("spirit null migrates to an empty martial soul collection", () => {
    const result = migratePlayerV1ToV2({
        spirit: null,
        soulRings: []
    });

    assert.deepEqual(result.player.martialSouls, []);
    assert.equal(result.player.activeMartialSoulInstanceId, null);
});

test("legacy spirit becomes an unresolved martial soul without invented IDs", () => {
    const result = migratePlayerV1ToV2({
        spirit: "蓝银草",
        soulRings: []
    });
    const soul = result.player.martialSouls[0];

    assert.equal(soul.instanceId, "ms_legacy_1");
    assert.equal(soul.definitionId, null);
    assert.equal(soul.evolutionFamilyId, null);
    assert.equal(soul.legacyName, "蓝银草");
    assert.equal(result.player.activeMartialSoulInstanceId, "ms_legacy_1");
    assert.ok(warningCodes(result).includes(
        "UNRESOLVED_LEGACY_MARTIAL_SOUL"
    ));
});

test("top-level v1 soul rings migrate into the first martial soul", () => {
    const result = migratePlayerV1ToV2({
        spirit: "蓝银草",
        soulRings: [
            {
                age: 423,
                tier: "百年"
            },
            {
                age: 1520,
                tier: "千年"
            }
        ]
    });
    const rings = result.player.martialSouls[0].soulRings;

    assert.deepEqual(rings.map(ring => ring.slot), [1, 2]);
    assert.deepEqual(rings.map(ring => ring.years), [423, 1520]);
    assert.deepEqual(rings.map(ring => ring.ringType), [
        "normal",
        "normal"
    ]);
    assert.equal(Object.hasOwn(result.player, "soulRings"), false);
});

test("rings without a legacy spirit are retained on an unresolved placeholder", () => {
    const result = migratePlayerV1ToV2({
        spirit: null,
        soulRings: [
            {
                age: 100
            }
        ]
    });

    assert.equal(result.player.martialSouls.length, 1);
    assert.equal(result.player.martialSouls[0].legacyName, null);
    assert.equal(result.player.martialSouls[0].definitionId, null);
    assert.equal(result.player.martialSouls[0].soulRings[0].years, 100);
    assert.equal(result.player.activeMartialSoulInstanceId, null);
    assert.ok(warningCodes(result).includes(
        "LEGACY_SOUL_RINGS_WITHOUT_MARTIAL_SOUL"
    ));
});

test("legacy soul bone age migrates to years with unresolved metadata warnings", () => {
    const result = migratePlayerV1ToV2({
        spirit: null,
        soulRings: [],
        soulBones: {
            head: {
                name: "头部魂骨",
                age: 50000
            }
        }
    });
    const bone = result.player.soulBones.head;

    assert.equal(bone.years, 50000);
    assert.equal(Object.hasOwn(bone, "age"), false);
    assert.equal(bone.definitionId, null);
    assert.equal(bone.soulBeastBloodlineGrade, null);
    assert.equal(bone.sourceType, "legacy_unknown");
    assert.ok(warningCodes(result).includes(
        "UNRESOLVED_LEGACY_SOUL_BONE_METADATA"
    ));
});

test("ensurePlayerV2 deep-copies v2 input without repeating migration", () => {
    const player = createPlayerV2();
    const first = ensurePlayerV2(player);
    const second = ensurePlayerV2(first.player);

    assert.deepEqual(first.player, player);
    assert.deepEqual(second.player, player);
    assert.notStrictEqual(first.player, player);
    assert.notStrictEqual(second.player, first.player);
    assert.deepEqual(first.warnings, []);
    assert.deepEqual(second.warnings, []);
    assert.deepEqual(second.player.martialSouls, []);
});

test("invalid known legacy fields are preserved with explicit warnings", () => {
    const result = migratePlayerV1ToV2({
        spirit: {
            name: "legacy-object"
        },
        soulRings: {
            age: 100
        },
        soulBones: "legacy-bones"
    });

    assert.deepEqual(result.player.flags.legacyInvalidSpirit, {
        name: "legacy-object"
    });
    assert.deepEqual(result.player.flags.legacyInvalidSoulRings, {
        age: 100
    });
    assert.equal(
        result.player.flags.legacyInvalidSoulBones,
        "legacy-bones"
    );
    assert.ok(warningCodes(result).includes(
        "INVALID_LEGACY_SPIRIT_PRESERVED"
    ));
    assert.ok(warningCodes(result).includes(
        "INVALID_LEGACY_SOUL_RINGS_PRESERVED"
    ));
    assert.ok(warningCodes(result).includes(
        "INVALID_LEGACY_SOUL_BONES_PRESERVED"
    ));
});

test("unknown schema versions are rejected instead of guessed as Player v1", () => {
    assert.throws(
        () => ensurePlayerV2({
            schemaVersion: "player/3.0"
        }),
        /Unsupported player schemaVersion/
    );
});

test("legacy derived combat values are warned about but never persisted", () => {
    const result = migratePlayerV1ToV2({
        combatPower: 999,
        staticCombatPower: null
    });

    assert.equal(Object.hasOwn(result.player, "combatPower"), false);
    assert.equal(Object.hasOwn(result.player, "staticCombatPower"), false);
    assert.equal(
        Object.hasOwn(
            result.player.flags.legacyUnrecognizedFields ?? {},
            "combatPower"
        ),
        false
    );
    assert.equal(
        warningCodes(result).filter(code => {
            return code === "LEGACY_DERIVED_COMBAT_FIELD_DROPPED";
        }).length,
        2
    );
});
