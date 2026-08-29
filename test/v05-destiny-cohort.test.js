import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import {
    createV05ContentIndex,
    createV05DemoRunner
} from "../js/v05-demo.js";
import {
    createV05DestinyViewModel,
    getV05Destiny,
    validateV05DestinyManifest
} from "../js/v05-destiny-cohort.js";
import { digestV05Value } from "../js/v05-save-store.js";
import { snapshotV05Character } from "../js/v05-life-presentation.js";

const ROOT = new URL("../", import.meta.url);
const CATALOG_ROOT = new URL("../data/apk-canonical/catalogs/", import.meta.url);
const readJson = (name, root = CATALOG_ROOT) => JSON.parse(fs.readFileSync(new URL(name, root), "utf8"));
const manifest = readJson("data/v05-rc/supported-destinies.json", ROOT);

function materialize() {
    const shard = readJson("route-graph.douluo1.json");
    const routeGraph = {
        schemaVersion: "apk-route-graph/1.0",
        packageVersion: shard.packageVersion,
        status: shard.status,
        source: shard.source,
        generatedBy: shard.generatedBy,
        packs: [shard.pack],
        diagnostics: shard.diagnostics
    };
    const contentIndex = createV05ContentIndex({
        routeGraph,
        formalSpecialResultEvidence: readJson("formal-special-result-runtime-evidence.json"),
        humanSoulRingEvidence: readJson("human-soul-ring-runtime-evidence.json"),
        humanSoulRingSpeciesEvidence: readJson("human-soul-ring-species-runtime-evidence.json"),
        officialBeastElementEvidence: readJson("official-beast-element-runtime-evidence.json"),
        combatPowerEvidence: readJson("combat-power-runtime-evidence.json")
    });
    return { routeGraph, contentIndex };
}

const runtime = materialize();

test("destiny manifest fixes exactly 256 ordered candidates and 12 official presets", () => {
    validateV05DestinyManifest(manifest);
    assert.equal(manifest.coverage.length, 256);
    assert.equal(manifest.coverage[0].seed, "v05-destiny-000");
    assert.equal(manifest.coverage.at(-1).seed, "v05-destiny-255");
    assert.equal(new Set(manifest.coverage.map(record => record.seed)).size, 256);
    assert.equal(manifest.destinies.length, 12);
    assert.equal(manifest.distribution["completed:none:none"], 87);
    assert.equal(manifest.diversity.coreProfiles >= 4, true);
    assert.equal(manifest.diversity.routeMilestoneProfiles >= 3, true);
    assert.equal(manifest.diversity.growthProfiles >= 3, true);
    assert.equal(new Set(manifest.destinies.map(record => record.summaryDigest)).size, 12);
});

test("destiny view model is read-only and never exposes precomputed sessions", () => {
    const view = createV05DestinyViewModel(manifest);
    assert.equal(view.length, 12);
    assert.equal(Object.isFrozen(view), true);
    assert.equal(Object.isFrozen(view[0]), true);
    assert.equal(view[0].official, true);
    assert.equal(view[0].experimental, false);
    assert.equal("session" in view[0], false);
    assert.equal("history" in view[0], false);
    assert.throws(() => getV05Destiny(manifest, "missing"), error => error.code === "V05_DESTINY_NOT_FOUND");
});

test("all official destinies recompute to their locked endpoint and completion guard", () => {
    for (const destiny of manifest.destinies) {
        const runner = createV05DemoRunner({ ...runtime, seed: destiny.seed, destinyId: destiny.id });
        while (runner.phase === "ready") runner.step();
        assert.equal(runner.phase, "completed", destiny.seed);
        assert.equal(runner.session.character.age, 25, destiny.seed);
        assert.equal(runner.session.history.length, destiny.committedCount, destiny.seed);
        assert.equal(runner.session.random.cursor, destiny.randomCursor, destiny.seed);
        assert.equal(runner.session.currentFlowId, destiny.finalFlowId, destiny.seed);
        const transcript = runner.session.routeHistory.map(({ flowId, poolId, optionId }) => ({
            flowId, poolId, optionId
        }));
        assert.equal(digestV05Value(transcript), destiny.transcriptDigest, destiny.seed);
        assert.equal(digestV05Value(snapshotV05Character(runner.session.character)), destiny.characterDigest, destiny.seed);
        assert.equal(digestV05Value(runner.summary), destiny.summaryDigest, destiny.seed);
        const before = [runner.session.random.cursor, runner.session.history.length, runner.session.routeHistory.length];
        assert.equal(runner.step().blocked, true);
        assert.deepEqual([runner.session.random.cursor, runner.session.history.length, runner.session.routeHistory.length], before);
    }
});

test("default and custom regression records are re-locked to Day22 runtime", () => {
    const defaultRecord = manifest.regressions.find(record => record.seed === "apk-route-demo-seed");
    const customRecord = manifest.regressions.find(record => record.seed === "v05-custom-1");
    assert.deepEqual(
        [defaultRecord.status, defaultRecord.age, defaultRecord.level, defaultRecord.committedCount, defaultRecord.randomCursor],
        ["completed", 25, 42, 100, 100]
    );
    assert.deepEqual(
        [customRecord.status, customRecord.age, customRecord.committedCount, customRecord.randomCursor, customRecord.errorCode],
        ["boundary", 24, 129, 130, "APK_ROUTE_FOLLOWUP_PREPARE_UNRESOLVED"]
    );
    const source = fs.readFileSync(new URL("outputs/parallel-prep-2026-08-16/generate-v05-destiny-cohort.mjs", ROOT), "utf8");
    assert.doesNotMatch(source, /Math\.random\s*\(/u);
    assert.doesNotMatch(source, /Date\.now\s*\(/u);
});
