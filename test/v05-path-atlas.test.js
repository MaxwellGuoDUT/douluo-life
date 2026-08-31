import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import { createV05ContentIndex, createV05DemoRunner } from "../js/v05-demo.js";
import { createV05LifeArchiveRecord } from "../js/v05-life-archive.js";
import { createV05PathComparison, createV05PathSummary } from "../js/v05-path-atlas.js";

const CATALOG_ROOT = new URL("../data/apk-canonical/catalogs/", import.meta.url);
const readJson = name => JSON.parse(fs.readFileSync(new URL(name, CATALOG_ROOT), "utf8"));

function createRunner(seed) {
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
    return createV05DemoRunner({ routeGraph, contentIndex, seed });
}

function complete(seed) {
    const runner = createRunner(seed);
    while (runner.phase === "ready") runner.step();
    assert.equal(runner.phase, "completed", seed);
    return runner;
}

test("path summary is bounded, runtime-derived and excludes recoverable state", () => {
    const runner = complete("v05-destiny-013");
    const summary = createV05PathSummary(runner);
    assert.equal(typeof summary.pathSignature, "string");
    assert.equal(summary.milestoneTrail.length <= 8, true);
    assert.equal(summary.closureTags.includes("followup-soul-bone-prepare"), true);
    assert.equal(summary.routeFacets.length >= 5, true);
    for (const forbidden of ["session", "history", "routeHistory", "dynamicHistory", "random"]) {
        assert.equal(forbidden in summary, false);
    }
    assert.throws(
        () => createV05PathSummary(createRunner("not-complete")),
        error => error.code === "V05_PATH_COMPLETED_ONLY"
    );
});

test("two-life comparison is fixed-field and non-recoverable", () => {
    const left = createV05LifeArchiveRecord({
        runner: complete("apk-route-demo-seed"),
        packageVersion: "v05-rc2/2026-08-30",
        completedAt: "2026-08-30T00:00:00.000Z"
    });
    const right = createV05LifeArchiveRecord({
        runner: complete("v05-custom-1"),
        packageVersion: "v05-rc2/2026-08-30",
        completedAt: "2026-08-30T00:00:01.000Z"
    });
    const comparison = createV05PathComparison(left, right);
    assert.equal(comparison.items.length, 7);
    assert.equal(comparison.recoverable, false);
    assert.equal(comparison.leftId, left.archiveId);
    assert.equal(comparison.rightId, right.archiveId);
    assert.throws(
        () => createV05PathComparison(left, null),
        error => error.code === "V05_PATH_COMPARE_REQUIRES_TWO"
    );
});
