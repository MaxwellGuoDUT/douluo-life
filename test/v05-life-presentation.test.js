import assert from "node:assert/strict";
import test from "node:test";

import {
    createV05PresentationRecord,
    createV05ReadableEnding,
    describeV05CharacterChanges,
    groupV05PresentationTimeline,
    presentationChangeLabels,
    snapshotV05Character
} from "../js/v05-life-presentation.js";

function character(overrides = {}) {
    return {
        age: 6,
        level: 10,
        rank: "魂师",
        route: "human",
        wallet: { copper: 320 },
        martialSouls: [{
            instanceId: "soul-1",
            id: "blue-silver-grass",
            name: "蓝银草",
            category: "plant",
            rings: []
        }],
        soulBones: {},
        ...overrides
    };
}

test("presentation snapshots expose stable player-facing fields", () => {
    const source = character();
    const snapshot = snapshotV05Character(source);
    source.wallet.copper = 0;
    source.martialSouls[0].name = "mutated";

    assert.equal(snapshot.copper, 320);
    assert.equal(snapshot.martialSouls[0].name, "蓝银草");
    assert.deepEqual(snapshot.soulBones, []);
});

test("character changes describe age, level, currency and new soul rings", () => {
    const before = character();
    const after = character({
        age: 7,
        level: 11,
        wallet: { copper: 280 },
        martialSouls: [{
            ...before.martialSouls[0],
            rings: [{
                id: "ring-1",
                years: 423,
                typeSelection: { text: "力量型" },
                speciesSelection: { text: "植物系" }
            }]
        }]
    });
    const changes = describeV05CharacterChanges(before, after);

    assert.deepEqual(changes.age, { before: 6, after: 7 });
    assert.deepEqual(changes.level, { before: 10, after: 11 });
    assert.deepEqual(changes.copper, { before: 320, after: 280 });
    assert.equal(changes.soulRingsAdded.length, 1);
    assert.equal(changes.soulRingsAdded[0].soulName, "蓝银草");
    assert.deepEqual(presentationChangeLabels(changes), [
        "年龄 6 → 7",
        "等级 10 → 11",
        "铜灵币 320 → 280（-40）",
        "新增魂环：蓝银草（423年 · 力量型 · 植物系）"
    ]);
});

test("presentation records retain before and after snapshots after source mutation", () => {
    const before = character();
    const after = character({ age: 7, wallet: { copper: 300 } });
    const record = createV05PresentationRecord({
        index: 4,
        spin: { optionId: "o4", poolId: "p4", flowId: "f4", text: "前往学院" },
        beforeCharacter: before,
        afterCharacter: after,
        randomCursor: 4
    });
    after.age = 99;
    after.wallet.copper = 0;

    assert.equal(record.index, 4);
    assert.equal(record.ageBefore, 6);
    assert.equal(record.ageAfter, 7);
    assert.equal(record.after.copper, 300);
    assert.deepEqual(record.changeLabels, ["年龄 6 → 7", "铜灵币 320 → 300（-20）"]);
});

test("timeline grouping preserves repeated ages and transition stages", () => {
    const records = [
        { index: 1, ageBefore: 0, ageAfter: 0 },
        { index: 2, ageBefore: 0, ageAfter: 1 },
        { index: 3, ageBefore: 1, ageAfter: 1 },
        { index: 4, ageBefore: 1, ageAfter: 1 }
    ];
    const groups = groupV05PresentationTimeline(records);

    assert.deepEqual(groups.map(group => [group.label, group.records.length]), [
        ["0 岁", 1],
        ["0 → 1 岁", 1],
        ["1 岁", 2]
    ]);
});

test("readable ending summarizes committed events without claiming complete life", () => {
    const finalCharacter = character({ age: 25, level: 42, wallet: { copper: 29850 } });
    const records = [{ index: 1, ageAfter: 1, changeLabels: ["年龄 0 → 1"] }];
    const ending = createV05ReadableEnding({
        seed: "apk-route-demo-seed",
        session: { character: finalCharacter },
        records
    });

    assert.equal(ending.age, 25);
    assert.equal(ending.level, 42);
    assert.equal(ending.copper, 29850);
    assert.equal(ending.committedEvents, 1);
    assert.match(ending.boundary, /不代表完整人生终局/u);
    assert.deepEqual(ending.milestones, [{ index: 1, age: 1, label: "年龄 0 → 1" }]);
});
