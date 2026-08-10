import assert from "node:assert/strict";
import test from "node:test";

import { Game } from "../js/game.js";
import {
    clonePlayerStateValue,
    createPlayerV2,
    validatePlayerV2
} from "../js/player-v2.js";
import {
    getActiveRoutes,
    getPrimaryMartialSoul,
    getPrimaryMartialSoulName,
    getPrimarySoulRings,
    getSoulRingsForMartialSoul
} from "../js/player-selectors.js";

function createMartialSoul(overrides = {}) {
    return {
        instanceId: "ms_001",
        definitionId: "clear_sky_hammer",
        evolutionFamilyId: "hammer_clear_sky_family",
        legacyName: null,
        slot: 1,
        awakenedAge: 6,
        status: "active",
        sealed: false,
        soulRings: [],
        mutations: [],
        evolutionHistory: [],
        flags: {},
        routeHooksActivated: [],
        ...overrides
    };
}

function errorCodes(validation) {
    return validation.errors.map(error => error.code);
}

test("Player v2 accepts an awakened level-0 player only with the growth lock", () => {
    const player = createPlayerV2();
    player.age = 6;
    player.level = 0;
    player.innateSoulPower = 0;
    player.talentGrade = "F";
    player.soulPowerGrowthLocked = true;
    player.rank = "无魂力";
    player.martialSouls = [createMartialSoul({
        qualityGrade: "low"
    })];
    player.activeMartialSoulInstanceId = "ms_001";

    assert.equal(validatePlayerV2(player).valid, true);

    const unlocked = clonePlayerStateValue(player);
    unlocked.soulPowerGrowthLocked = false;
    assert.ok(errorCodes(validatePlayerV2(unlocked)).includes(
        "LEVEL_ZERO_REQUIRES_GROWTH_LOCK"
    ));

    const clamped = clonePlayerStateValue(player);
    clamped.level = 1;
    assert.ok(errorCodes(validatePlayerV2(clamped)).includes(
        "INVALID_ZERO_SOUL_POWER_STATE"
    ));
});

test("createPlayerV2 returns independent JSON-compatible state without derived combat power", () => {
    const first = createPlayerV2();
    const second = createPlayerV2();

    first.soulBones.head = {
        years: 100
    };
    first.routeStates.active.push({
        routeId: "route_test"
    });
    first.annualFlags.changed = true;

    assert.equal(second.soulBones.head, null);
    assert.deepEqual(second.routeStates.active, []);
    assert.deepEqual(second.annualFlags, {});
    assert.equal(Object.hasOwn(first, "combatPower"), false);
    assert.equal(Object.hasOwn(first, "staticCombatPower"), false);
    assert.equal(Object.hasOwn(first, "effectiveCombatPower"), false);

    const roundTripped = JSON.parse(JSON.stringify(second));

    assert.deepEqual(roundTripped, second);
    assert.deepEqual(validatePlayerV2(roundTripped), {
        valid: true,
        errors: [],
        warnings: []
    });
});

test("Player state cloning rejects non-finite numbers that cannot round-trip through JSON", () => {
    assert.throws(
        () => clonePlayerStateValue({
            value: Number.POSITIVE_INFINITY
        }),
        /must be finite/
    );
    assert.throws(
        () => clonePlayerStateValue(Number.NaN),
        /must be finite/
    );
});

test("Player v2 validator rejects duplicate martial soul identities and slots", () => {
    const cases = [
        {
            overrides: {
                instanceId: "ms_002",
                slot: 2,
                evolutionFamilyId: "other_family"
            },
            code: "DUPLICATE_MARTIAL_SOUL_DEFINITION_ID"
        },
        {
            overrides: {
                instanceId: "ms_002",
                slot: 2,
                definitionId: "other_definition"
            },
            code: "DUPLICATE_MARTIAL_SOUL_EVOLUTION_FAMILY_ID"
        },
        {
            overrides: {
                instanceId: "ms_002",
                definitionId: "other_definition",
                evolutionFamilyId: "other_family"
            },
            code: "DUPLICATE_MARTIAL_SOUL_SLOT"
        }
    ];

    cases.forEach(({ overrides, code }) => {
        const player = createPlayerV2();

        player.martialSouls = [
            createMartialSoul(),
            createMartialSoul(overrides)
        ];
        player.activeMartialSoulInstanceId = "ms_001";

        assert.ok(errorCodes(validatePlayerV2(player)).includes(code));
    });
});

test("Player v2 validator rejects dangling active martial soul references", () => {
    const player = createPlayerV2();

    player.martialSouls = [createMartialSoul()];
    player.activeMartialSoulInstanceId = "ms_missing";

    assert.ok(errorCodes(validatePlayerV2(player)).includes(
        "DANGLING_ACTIVE_MARTIAL_SOUL_REFERENCE"
    ));
});

test("Player v2 validator rejects duplicate soul ring slots within one martial soul", () => {
    const player = createPlayerV2();
    const ring = {
        slot: 1,
        years: 423,
        tier: "百年",
        ringType: "normal",
        soulBeastBloodlineGrade: "top",
        sourceType: "soul_beast",
        qualityMultiplier: null,
        sourceEntityId: null,
        acquiredAge: null,
        flags: {}
    };

    player.martialSouls = [
        createMartialSoul({
            soulRings: [
                ring,
                {
                    ...ring
                }
            ]
        })
    ];
    player.activeMartialSoulInstanceId = "ms_001";

    assert.ok(errorCodes(validatePlayerV2(player)).includes(
        "DUPLICATE_SOUL_RING_SLOT"
    ));
});

test("compatibility selectors read v1 and v2 without exposing mutable mirrors", () => {
    const playerV1 = {
        spirit: "蓝银草",
        soulRings: [
            {
                age: 423
            }
        ]
    };
    const v1Primary = getPrimaryMartialSoul(playerV1);
    const v1Rings = getPrimarySoulRings(playerV1);

    assert.equal(getPrimaryMartialSoulName(playerV1), "蓝银草");
    assert.deepEqual(getSoulRingsForMartialSoul(
        playerV1,
        null
    ), playerV1.soulRings);
    assert.deepEqual(getSoulRingsForMartialSoul(
        playerV1,
        "legacy_primary"
    ), []);
    v1Primary.soulRings[0].age = 999;
    v1Rings[0].age = 888;
    assert.equal(playerV1.soulRings[0].age, 423);

    const playerV2 = createPlayerV2();
    playerV2.martialSouls = [
        createMartialSoul({
            instanceId: "ms_secondary",
            definitionId: "secondary",
            evolutionFamilyId: "secondary_family",
            slot: 2
        }),
        createMartialSoul({
            soulRings: [
                {
                    slot: 1,
                    years: 100,
                    ringType: "normal",
                    soulBeastBloodlineGrade: null,
                    sourceType: "legacy_unknown",
                    qualityMultiplier: null,
                    flags: {}
                }
            ]
        })
    ];
    playerV2.activeMartialSoulInstanceId = "ms_001";
    playerV2.routeStates.active.push({
        routeId: "route_test"
    });

    const v2Primary = getPrimaryMartialSoul(playerV2);
    const v2Rings = getPrimarySoulRings(playerV2);
    const activeRoutes = getActiveRoutes(playerV2);

    assert.equal(v2Primary.instanceId, "ms_001");
    assert.equal(getPrimaryMartialSoulName(playerV2), "clear_sky_hammer");
    assert.deepEqual(
        getSoulRingsForMartialSoul(playerV2, "ms_001"),
        v2Rings
    );
    v2Rings[0].years = 999;
    activeRoutes[0].routeId = "mutated";
    assert.equal(playerV2.martialSouls[1].soulRings[0].years, 100);
    assert.equal(playerV2.routeStates.active[0].routeId, "route_test");
    assert.equal(Object.hasOwn(playerV2, "activeRoutes"), false);
});

test("primary martial soul uses the lowest slot instead of the active combat instance", () => {
    const player = createPlayerV2();

    player.martialSouls = [
        createMartialSoul(),
        createMartialSoul({
            instanceId: "ms_002",
            definitionId: "secondary",
            evolutionFamilyId: "secondary_family",
            slot: 2
        })
    ];
    player.activeMartialSoulInstanceId = "ms_002";

    assert.equal(getPrimaryMartialSoul(player).instanceId, "ms_001");
});

test("Player v2 validator enforces route bucket uniqueness and active main lane", () => {
    const player = createPlayerV2();
    const route = {
        routeId: "route_main",
        lane: "main",
        nodeId: "entry",
        startedAge: 6,
        lastAdvancedAge: 6,
        status: "active",
        data: {},
        flags: {},
        visitCounts: {}
    };

    player.routeStates.active = [
        route,
        {
            ...route,
            routeId: "route_main_2"
        }
    ];
    player.routeStates.completed = [
        {
            ...route,
            status: "completed"
        }
    ];

    const codes = errorCodes(validatePlayerV2(player));

    assert.ok(codes.includes("MULTIPLE_ACTIVE_MAIN_ROUTES"));
    assert.ok(codes.includes("DUPLICATE_ROUTE_STATE_ID"));
});

test("existing new-game smoke continues to create Player v1", () => {
    const game = new Game();
    const originalLog = console.log;

    console.log = () => {};

    try {
        const event = game.startNewGame();

        assert.equal(Object.hasOwn(game.player, "schemaVersion"), false);
        assert.equal(Object.hasOwn(game.player, "spirit"), true);
        assert.equal(Array.isArray(game.player.soulRings), true);
        assert.equal(game.player.history.length, 1);
        assert.equal(typeof event.id, "string");
    } finally {
        console.log = originalLog;
    }
});
