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
        followUpPrepareEvidence: readJson("followup-prepare-runtime-evidence.json"),
        humanSoulRingSpeciesEvidence: readJson("human-soul-ring-species-runtime-evidence.json"),
        officialBeastElementEvidence: readJson("official-beast-element-runtime-evidence.json"),
        combatPowerEvidence: readJson("combat-power-runtime-evidence.json")
    });
    return { routeGraph, contentIndex };
}

const runtime = materialize();

test("destiny manifest fixes exactly 512 ordered candidates and 24 official presets", () => {
    validateV05DestinyManifest(manifest);
    assert.equal(manifest.coverage.length, 512);
    assert.equal(manifest.coverage[0].seed, "v05-destiny-000");
    assert.equal(manifest.coverage.at(-1).seed, "v05-destiny-511");
    assert.equal(new Set(manifest.coverage.map(record => record.seed)).size, 512);
    assert.equal(manifest.destinies.length, 24);
    assert.equal(manifest.distribution["completed:none:none"], 218);
    assert.equal(manifest.beforeAfter.first256CompletedBefore, 87);
    assert.equal(manifest.beforeAfter.first256CompletedAfter, 107);
    assert.equal(manifest.beforeAfter.rescuedFirst256, 20);
    assert.deepEqual(manifest.beforeAfter.targetBoundaryCounts, {
        APK_ROUTE_FOLLOWUP_PREPARE_UNRESOLVED: 0,
        APK_ROUTE_SOUL_RING_EVIDENCE_MISSING: 0
    });
    assert.equal(manifest.diversity.coreProfiles >= 8, true);
    assert.equal(manifest.diversity.routeMilestoneProfiles >= 6, true);
    assert.equal(manifest.diversity.growthProfiles >= 6, true);
    assert.equal(manifest.diversity.ringBands >= 4, true);
    assert.equal(manifest.diversity.levelBands >= 3, true);
    assert.equal(manifest.diversity.closureDestinies >= 6, true);
    assert.equal(new Set(manifest.destinies.map(record => record.summaryDigest)).size, 24);
    assert.deepEqual(manifest.destinies.slice(0, 12).map(record => [
        record.seed, record.transcriptDigest, record.characterDigest, record.summaryDigest
    ]), [
        ["v05-destiny-002", "fnv1a32:44a66486", "fnv1a32:23549b41", "fnv1a32:35ef23e2"],
        ["v05-destiny-003", "fnv1a32:31d7eec9", "fnv1a32:90318f02", "fnv1a32:e889d067"],
        ["v05-destiny-008", "fnv1a32:2b07f242", "fnv1a32:e7c59cf4", "fnv1a32:e4e74867"],
        ["v05-destiny-017", "fnv1a32:b2a760e4", "fnv1a32:e5ad725a", "fnv1a32:83741bfc"],
        ["v05-destiny-028", "fnv1a32:42aad93e", "fnv1a32:2164d2cc", "fnv1a32:7329649c"],
        ["v05-destiny-032", "fnv1a32:4a057946", "fnv1a32:d2573a03", "fnv1a32:5bbf5e8a"],
        ["v05-destiny-033", "fnv1a32:ae6066fb", "fnv1a32:9470075c", "fnv1a32:dc46aa57"],
        ["v05-destiny-055", "fnv1a32:efe1e2b7", "fnv1a32:b02cee83", "fnv1a32:9deebda0"],
        ["v05-destiny-065", "fnv1a32:00fb186a", "fnv1a32:e698479a", "fnv1a32:8d57ed73"],
        ["v05-destiny-081", "fnv1a32:5643d8ec", "fnv1a32:a6993ce5", "fnv1a32:1f813b10"],
        ["v05-destiny-092", "fnv1a32:db303bef", "fnv1a32:8ba890d3", "fnv1a32:1c15a03f"],
        ["v05-destiny-175", "fnv1a32:71c86f1d", "fnv1a32:29593ba0", "fnv1a32:010860ba"]
    ]);
});

test("destiny view model is read-only and never exposes precomputed sessions", () => {
    const view = createV05DestinyViewModel(manifest);
    assert.equal(view.length, 24);
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

test("default and custom regression records are re-locked to Day23 runtime", () => {
    const defaultRecord = manifest.regressions.find(record => record.seed === "apk-route-demo-seed");
    const customRecord = manifest.regressions.find(record => record.seed === "v05-custom-1");
    assert.deepEqual(
        [defaultRecord.status, defaultRecord.age, defaultRecord.level, defaultRecord.committedCount, defaultRecord.randomCursor],
        ["completed", 25, 42, 100, 100]
    );
    assert.deepEqual(
        [customRecord.status, customRecord.age, customRecord.committedCount, customRecord.randomCursor, customRecord.errorCode],
        ["completed", 25, 131, 131, null]
    );
    const source = fs.readFileSync(new URL("outputs/parallel-prep-2026-08-16/generate-v05-destiny-cohort.mjs", ROOT), "utf8");
    assert.doesNotMatch(source, /Math\.random\s*\(/u);
    assert.doesNotMatch(source, /Date\.now\s*\(/u);
});
