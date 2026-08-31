import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import {
    createV05DestinyExplorerRecords,
    createV05DestinyFilterOptions,
    filterV05Destinies
} from "../js/v05-destiny-explorer.js";

const manifest = JSON.parse(fs.readFileSync(
    new URL("../data/v05-rc/supported-destinies.json", import.meta.url),
    "utf8"
));
const records = createV05DestinyExplorerRecords(manifest);

test("destiny explorer exposes all 24 immutable official records", () => {
    assert.equal(records.length, 24);
    assert.equal(Object.isFrozen(records), true);
    assert.equal(Object.isFrozen(records[0]), true);
    assert.deepEqual(records.map(record => record.id), manifest.destinies.map(record => record.id));
    assert.equal(records.every(record => record.official && !record.experimental), true);
});

test("search trims and folds case without mutating manifest order", () => {
    const before = JSON.stringify(manifest.destinies);
    const token = records[0].primaryMartialSoul.name;
    const found = filterV05Destinies(records, { query: `  ${token.toLocaleUpperCase("zh-CN")}  ` });
    assert.equal(found.some(record => record.id === records[0].id), true);
    assert.equal(JSON.stringify(manifest.destinies), before);
    assert.deepEqual(filterV05Destinies(records, { query: "__no_such_destiny__" }), []);
});

test("combined filters intersect and clear restores the recommended 24", () => {
    const target = records.find(record => record.routeFacets.length > 0);
    const filtered = filterV05Destinies(records, {
        martialCategory: target.primaryMartialSoul.category,
        ringBand: target.ringBand,
        levelBand: target.levelBand,
        routeFacet: target.routeFacets[0],
        growthProfile: target.growthProfile
    });
    assert.equal(filtered.length >= 1, true);
    assert.equal(filtered.every(record => (
        record.primaryMartialSoul.category === target.primaryMartialSoul.category
        && record.ringBand === target.ringBand
        && record.levelBand === target.levelBand
        && record.routeFacets.includes(target.routeFacets[0])
        && record.growthProfile === target.growthProfile
    )), true);
    assert.deepEqual(
        filterV05Destinies(records).map(record => record.id),
        records.map(record => record.id)
    );
});

test("level and ring sorts are deterministic with seed tie-breaks", () => {
    const byLevel = filterV05Destinies(records, { sort: "level" });
    const byRings = filterV05Destinies(records, { sort: "rings" });
    for (let index = 1; index < byLevel.length; index += 1) {
        assert.equal(byLevel[index - 1].level >= byLevel[index].level, true);
    }
    for (let index = 1; index < byRings.length; index += 1) {
        assert.equal(byRings[index - 1].soulRingCount >= byRings[index].soulRingCount, true);
    }
    const options = createV05DestinyFilterOptions(records);
    assert.equal(options.martialCategories.length > 0, true);
    assert.equal(options.routeFacets.length > 0, true);
    assert.equal(Object.isFrozen(options), true);
});
