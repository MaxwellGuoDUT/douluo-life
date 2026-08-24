import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import {
    createApkCharacterState
} from "../js/apk-rule-runtime.js";
import {
    calculateApkCombatPower,
    compareApkCombatThreshold,
    validateApkCombatPowerEvidence
} from "../js/apk-combat-power-runtime.js";
import {
    commitApkRouteOption,
    createApkRouteContentIndex,
    createApkRouteSession
} from "../js/apk-route-runtime.js";

const SPECIAL_POOL_ID = "f4d48cb4-7f96-4153-addb-1570b9781a26";
const SPECIAL_OPTION_ID = "27c4ae";

function loadJson(path) {
    return JSON.parse(fs.readFileSync(new URL(path, import.meta.url), "utf8"));
}

function loadEvidence() {
    return loadJson("../data/apk-canonical/catalogs/combat-power-runtime-evidence.json");
}

function loadRouteGraph() {
    const shard = loadJson(
        "../data/apk-canonical/catalogs/route-graph.douluo1.json"
    );
    return {
        schemaVersion: "apk-route-graph/1.0",
        packageVersion: shard.packageVersion,
        status: shard.status,
        source: shard.source,
        generatedBy: shard.generatedBy,
        packs: [shard.pack],
        diagnostics: shard.diagnostics
    };
}

function loadSpecialEvidence() {
    return loadJson("../data/apk-canonical/catalogs/formal-special-result-runtime-evidence.json");
}

function makeCharacter(level) {
    const character = createApkCharacterState("human");
    character.level = level;
    character.martialSouls = [{
        id: "typed-test-ordinary-soul",
        category: "兽武魂",
        rings: [{
            years: 50,
            typeSelection: null,
            speciesSelection: null
        }],
        tags: [],
        passives: []
    }];
    return character;
}

function specialFixture(level, combatPowerEvidence = loadEvidence()) {
    const routeGraph = loadRouteGraph();
    const contentIndex = createApkRouteContentIndex({
        routeGraph,
        packId: "douluo1",
        formalSpecialResultEvidence: loadSpecialEvidence(),
        combatPowerEvidence
    });
    const session = createApkRouteSession({
        routeGraph,
        packId: "douluo1",
        seed: `combat-power-${level}`,
        character: makeCharacter(level)
    });
    session.currentFlowId = `douluo1:flow.special.${SPECIAL_POOL_ID}`;
    const option = contentIndex.getRouteOption(SPECIAL_POOL_ID, SPECIAL_OPTION_ID);
    return { contentIndex, session, option };
}

test("APK combat-power evidence validates and reproduces the exact 47-point source anchor", () => {
    const evidence = loadEvidence();
    assert.equal(validateApkCombatPowerEvidence(evidence).valid, true);
    const result = calculateApkCombatPower(makeCharacter(24), evidence);

    assert.equal(result.base, 42);
    assert.equal(result.components.martialSoulQuality, 4);
    assert.equal(result.components.soulRingBase, 1);
    assert.equal(result.total, 47);
});

test("APK combat threshold operators preserve source equality semantics", () => {
    assert.equal(compareApkCombatThreshold(47, 47, ">="), true);
    assert.equal(compareApkCombatThreshold(46, 47, ">="), false);
    assert.equal(compareApkCombatThreshold(47, 47, ">"), false);
    assert.equal(compareApkCombatThreshold(48, 47, ">"), true);
});

test("formal special-result handler applies success effects at the source equality boundary", () => {
    const { contentIndex, session, option } = specialFixture(24);
    const committed = commitApkRouteOption({
        contentIndex,
        session,
        spin: {
            flowId: session.currentFlowId,
            poolId: SPECIAL_POOL_ID,
            optionId: SPECIAL_OPTION_ID,
            option
        }
    });

    assert.equal(committed.nextFlowId, "douluo1:flow.after-formal-special-result");
    assert.equal(session.character.wallet.copper, 100);
    assert.equal(session.character.flags["formal:last-combat-lost"], undefined);
    assert.equal(session.dynamicHistory.at(-1).combatPower.total, 47);
    assert.equal(session.dynamicHistory.at(-1).success, true);
});

test("formal special-result handler applies source failure effects below the threshold and clamps currency", () => {
    const { contentIndex, session, option } = specialFixture(23);
    const committed = commitApkRouteOption({
        contentIndex,
        session,
        spin: {
            flowId: session.currentFlowId,
            poolId: SPECIAL_POOL_ID,
            optionId: SPECIAL_OPTION_ID,
            option
        }
    });

    assert.equal(committed.nextFlowId, "douluo1:flow.after-formal-special-result");
    assert.equal(session.character.wallet.copper, 0);
    assert.equal(session.character.flags["formal:last-combat-lost"], true);
    assert.equal(session.dynamicHistory.at(-1).combatPower.total, 44);
    assert.equal(session.dynamicHistory.at(-1).success, false);
    assert.equal(session.dynamicHistory.at(-1).failureAllowed, true);
});

test("formal special-result handler keeps the combat source boundary explicit when evidence is absent", () => {
    const { contentIndex, session, option } = specialFixture(24, null);
    const before = JSON.parse(JSON.stringify(session));

    assert.throws(
        () => commitApkRouteOption({
            contentIndex,
            session,
            spin: {
                flowId: session.currentFlowId,
                poolId: SPECIAL_POOL_ID,
                optionId: SPECIAL_OPTION_ID,
                option
            }
        }),
        error => error.code === "APK_ROUTE_SPECIAL_RESULT_COMBAT_POWER_EVIDENCE_MISSING"
    );
    assert.deepEqual(session, before);
});

const COMBAT_POWER_DIFFERENTIAL_CASES = [
    {
        name: "human base",
        build: () => {
            const character = createApkCharacterState("human");
            character.level = 24;
            return character;
        },
        total: 42,
        components: {}
    },
    {
        name: "beast cultivation base",
        build: () => {
            const character = createApkCharacterState("beast");
            character.beastYears = 1000;
            return character;
        },
        total: 100,
        components: {}
    },
    {
        name: "beast title scales from base",
        build: () => {
            const character = createApkCharacterState("beast");
            character.beastYears = 1000;
            character.beast.nameSuffixes = ["王"];
            return character;
        },
        total: 110,
        components: { beastTitles: 10 }
    },
    {
        name: "single pure-dragon bloodline",
        build: () => {
            const character = createApkCharacterState("beast");
            character.beastYears = 1000;
            character.beast.bloodlines = [{
                selection: { optionId: "bloodline-pure" },
                typeOptionId: "fc8f55",
                percentage: 100
            }];
            return character;
        },
        total: 150,
        components: { beastBloodline: 50 }
    },
    {
        name: "mixed pure and low bloodline",
        build: () => {
            const character = createApkCharacterState("beast");
            character.beastYears = 1000;
            character.beast.bloodlines = [
                {
                    selection: { optionId: "bloodline-pure" },
                    typeOptionId: "fc8f55",
                    percentage: 50
                },
                {
                    selection: { optionId: "83cab9" },
                    percentage: 50
                }
            ];
            return character;
        },
        total: 100,
        components: { bloodlineFusion: 0 }
    },
    {
        name: "severely injured status",
        build: () => {
            const character = createApkCharacterState("human");
            character.level = 24;
            character.flags["combat:status-multiplier-basis-points"] = 5000;
            character.flags["combat:status-modifier"] = 10;
            return character;
        },
        total: 26,
        components: { status: -16 }
    },
    {
        name: "divine soul ring quality",
        build: () => {
            const character = createApkCharacterState("human");
            character.level = 24;
            character.martialSouls = [{
                id: "divine-ring-soul",
                rings: [{ years: 50, quality: "divine" }],
                tags: [],
                passives: []
            }];
            return character;
        },
        total: 48,
        components: { soulRingBase: 1, soulRingQuality: 1 }
    },
    {
        name: "human god armor below level 100",
        build: () => {
            const character = createApkCharacterState("human");
            character.level = 99;
            character.flags.godTrialArmor = true;
            character.godhood = { tier: "三级" };
            character.soulBones = [{ id: "head", years: 1000, quality: "ordinary" }];
            return character;
        },
        total: 768,
        components: { soulBoneBase: 8, godArmor: 0 }
    },
    {
        name: "human god armor at level 100",
        build: () => {
            const character = createApkCharacterState("human");
            character.level = 100;
            character.flags.godTrialArmor = true;
            character.godhood = { tier: "三级" };
            character.soulBones = [{ id: "head", years: 1000, quality: "ordinary" }];
            return character;
        },
        total: 1884,
        components: { godArmor: 324, godhood: 300, soulBoneBase: 0 }
    },
    {
        name: "human artifact is divided below level 100",
        build: () => {
            const character = createApkCharacterState("human");
            character.level = 99;
            character.godhood = { tier: "三级" };
            character.artifacts = [{ id: "artifact", stage: "complete" }];
            return character;
        },
        total: 790,
        components: { artifacts: 30 }
    },
    {
        name: "beast artifact keeps full god-tier value",
        build: () => {
            const character = createApkCharacterState("beast");
            character.beastYears = 100;
            character.godhood = { tier: "三级" };
            character.artifacts = [{ id: "artifact", stage: "complete" }];
            return character;
        },
        total: 330,
        components: { artifacts: 300 }
    }
];

for (const differentialCase of COMBAT_POWER_DIFFERENTIAL_CASES) {
    test(`APK combat differential table: ${differentialCase.name}`, () => {
        const result = calculateApkCombatPower(differentialCase.build(), loadEvidence());
        assert.equal(result.total, differentialCase.total);
        for (const [component, expected] of Object.entries(differentialCase.components)) {
            assert.equal(result.components[component], expected, component);
        }
    });
}

test("APK combat power returns a typed guard for an unknown status multiplier", () => {
    const character = createApkCharacterState("human");
    character.flags["combat:status-multiplier-basis-points"] = 12500;
    assert.throws(
        () => calculateApkCombatPower(character, loadEvidence()),
        error => error.code === "APK_COMBAT_POWER_UNCOVERED_STATE"
            && error.details.area === "status"
    );
});

test("APK combat power returns a typed guard instead of approximating an uncovered state", () => {
    const character = createApkCharacterState("beast");
    character.uncoveredCombatPowerStates = ["future-bloodline-rule"];
    assert.throws(
        () => calculateApkCombatPower(character, loadEvidence()),
        error => error.code === "APK_COMBAT_POWER_UNCOVERED_STATE"
            && error.details.area === "character.uncoveredCombatPowerStates"
    );
});
