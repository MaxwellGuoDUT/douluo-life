import assert from "node:assert/strict";
import test from "node:test";

import {
    APK_EFFECT_TYPES,
    evaluateApkRequirement
} from "../js/apk-content-adapter.js";
import {
    APK_RANDOM_ALGORITHM,
    APK_RUNTIME_EFFECT_TYPES,
    applyApkEffects,
    commitApkOption,
    createApkCharacterState,
    createApkContentIndex,
    createApkRandom,
    createApkSession,
    drawApkPool,
    nextApkRandom,
    selectApkPoolOptions
} from "../js/apk-rule-runtime.js";

function syntheticContent() {
    return createApkContentIndex({
        pools: {
            records: [{
                id: "pool-1",
                normalized: {
                    pool_id: "pool-1",
                    pool_name: "测试池"
                },
                availability: {
                    policy: "preserve_apk_original_state",
                    status: "formal"
                }
            }]
        },
        options: {
            records: [
                {
                    id: "option-enabled",
                    normalized: {
                        pool_id: "pool-1",
                        option_id: "option-enabled",
                        text: "启用选项",
                        weight: 3,
                        enabled: true,
                        requirements: [{ type: "levelAtLeast", value: 1 }],
                        reroll_when: [],
                        effects: [{ type: "changeLevel", amount: 2 }]
                    },
                    availability: {
                        policy: "preserve_apk_original_state",
                        enabled: true,
                        contentStatus: null
                    }
                },
                {
                    id: "option-disabled",
                    normalized: {
                        pool_id: "pool-1",
                        option_id: "option-disabled",
                        text: "停用选项",
                        weight: 99,
                        requirements: [],
                        reroll_when: [],
                        effects: []
                    },
                    availability: {
                        policy: "preserve_apk_original_state",
                        enabled: false,
                        contentStatus: null
                    }
                }
            ]
        }
    });
}

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

test("APK PCG32 counter keeps the source algorithm and advances only the cursor", () => {
    const random = createApkRandom("runtime-test-seed");
    const first = random.next();
    const second = random.next();
    assert.equal(random.algorithm, APK_RANDOM_ALGORITHM);
    assert.equal(random.cursor, 2);
    assert.notEqual(first, second);

    const replay = { seed: "runtime-test-seed", cursor: 0, algorithm: APK_RANDOM_ALGORITHM };
    assert.equal(nextApkRandom(replay), first);
    assert.equal(nextApkRandom(replay), second);
    assert.equal(replay.cursor, 2);
});

test("APK pool selection preserves disabled records but excludes them from the draw", () => {
    const contentIndex = syntheticContent();
    const character = createApkCharacterState();
    const selected = selectApkPoolOptions(contentIndex, character, "pool-1");
    assert.deepEqual(
        selected.options.map(option => option.normalized.option_id),
        ["option-enabled"]
    );

    const includingDisabled = selectApkPoolOptions(
        contentIndex,
        character,
        "pool-1",
        { includeDisabled: true }
    );
    assert.deepEqual(
        includingDisabled.options.map(option => option.normalized.option_id),
        ["option-enabled", "option-disabled"]
    );

    const spin = drawApkPool({
        contentIndex,
        character,
        poolId: "pool-1",
        random: () => 0.999
    });
    assert.equal(spin.optionId, "option-enabled");
    assert.equal(spin.eligibleCount, 1);
});

test("APK effect batches are atomic and apply the source-style state changes", () => {
    const character = createApkCharacterState();
    const result = applyApkEffects(character, [
        { type: "setInnatePower", value: 10 },
        { type: "setTalentGrade", grade: "S" },
        { type: "changeLevel", amount: 2 },
        { type: "changeCurrency", copper: 125 },
        { type: "addInventoryStack", category: "item", itemId: "coin", amount: 2 },
        { type: "addTrait", traitId: "trait:test" },
        { type: "addAttribute", attributeId: "lightning" },
        { type: "addDomainEmbryo", embryoId: "domain:test", unlockLevel: 1 },
        { type: "addArtifact", artifact: { id: "artifact:test", rank: 1, combatPower: 300 } },
        {
            type: "conditional",
            condition: { type: "levelAtLeast", value: 10 },
            thenEffects: [{ type: "setFlag", key: "conditional:met", value: true }]
        }
    ]);

    assert.equal(result.applied, true);
    assert.equal(result.character.innatePower, 10);
    assert.equal(result.character.innateSoulPower, 10);
    assert.equal(result.character.talentGrade, "S");
    assert.equal(result.character.level, 12);
    assert.equal(result.character.wallet.copper, 125);
    assert.equal(result.character.money, 125);
    assert.equal(result.character.flags["formal:inventory:item:coin"], 2);
    assert.equal(result.character.flags["conditional:met"], true);
    assert.equal(result.character.flags["formal:domain-draws"], 1);
    assert.equal(result.character.artifacts[0].combatPower, 300);
    assert.deepEqual(character, createApkCharacterState());

    const before = clone(character);
    assert.throws(() => {
        applyApkEffects(character, [
            { type: "setFlag", key: "should:not:commit", value: true },
            { type: "changeCurrency", copper: -1 }
        ]);
    }, error => error.code === "APK_INSUFFICIENT_CURRENCY");
    assert.deepEqual(character, before);
});

test("APK setStoryBranch preserves the source branch and timeline semantics", () => {
    const character = createApkCharacterState();
    character.timelineAge = 6;
    const result = applyApkEffects(character, [
        { type: "setStoryBranch", branch: 2 }
    ]);

    assert.equal(result.character.storyBranch, 2);
    assert.equal(result.character.branchStartTimelineAge, 6);
    assert.equal(character.storyBranch, null);
    assert.equal(character.branchStartTimelineAge, null);

    assert.throws(
        () => applyApkEffects(character, [
            { type: "setStoryBranch", branch: 4 }
        ]),
        error => error.code === "INVALID_APK_STORY_BRANCH"
    );
    assert.equal(character.storyBranch, null);
});

test("APK requirements use the expanded APK state instead of treating it as an unresolved Player v2 field", () => {
    const character = createApkCharacterState("beast");
    character.level = 12;
    character.wallet.copper = 100;
    character.money = 100;
    character.flags.beastHasDragonBloodline = true;
    character.flags["formal:inventory:item:coin"] = 3;
    character.traits.push("trait:existing");
    character.beast.nameSuffixes.push("王");
    character.gender = { optionId: "female" };
    character.soulBones.push({ id: "head", partId: "head", years: 1000 });

    const checks = [
        [{ type: "inventoryAtLeast", category: "item", itemId: "coin", amount: 2 }, "met"],
        [{ type: "currencyBelow", copper: 200 }, "met"],
        [{ type: "isDragonBeast" }, "met"],
        [{ type: "hasBeastNameSuffix", value: "王" }, "met"],
        [{ type: "beastNameSuffixCountAtLeast", value: 1 }, "met"],
        [{ type: "hasAnySoulBone" }, "met"],
        [{ type: "genderOptionIs", value: "female" }, "met"],
        [{ type: "lacksTrait", value: "trait:missing" }, "met"],
        [{ type: "levelAtLeast", value: 20 }, "not_met"]
    ];
    checks.forEach(([requirement, expected]) => {
        assert.equal(evaluateApkRequirement(requirement, character).status, expected);
    });
});

test("APK option commit uses one cloned effect transaction and rolls back on failure", () => {
    const contentIndex = syntheticContent();
    const session = createApkSession({ seed: "commit-seed" });
    const spin = drawApkPool({
        contentIndex,
        character: session.character,
        poolId: "pool-1",
        random: session.random
    });
    const committed = commitApkOption({
        session,
        contentIndex,
        option: spin.option,
        poolId: "pool-1"
    });
    assert.equal(committed.session.character.level, 3);
    assert.equal(committed.session.history.length, 1);
    assert.equal(committed.session.timeline.length, 1);
    assert.equal(committed.session.character.transactions.length, 1);

    const second = createApkSession({ seed: "failure-seed" });
    const before = clone(second);
    assert.throws(() => {
        commitApkOption({
            session: second,
            contentIndex: createApkContentIndex({
                pools: { records: [{ id: "pool-1", normalized: { pool_id: "pool-1" } }] },
                options: { records: [{
                    id: "bad",
                    normalized: {
                        pool_id: "pool-1",
                        option_id: "bad",
                        text: "失败",
                        weight: 1,
                        requirements: [],
                        effects: [{ type: "changeCurrency", copper: -1 }]
                    },
                    availability: { enabled: true }
                }] }
            }),
            option: { id: "bad" },
            poolId: "pool-1"
        });
    }, error => error.code === "APK_INSUFFICIENT_CURRENCY");
    assert.deepEqual(second, before);
});

test("every extracted APK effect type has a runtime classification or an explicit typed handler", () => {
    const contentIndex = syntheticContent();
    assert.equal(APK_EFFECT_TYPES.length, 48);
    assert.ok(APK_EFFECT_TYPES.every(type => APK_RUNTIME_EFFECT_TYPES.includes(type)));
    assert.ok(contentIndex.getPool("pool-1"));
});
