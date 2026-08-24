import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import { spawnSync } from "node:child_process";
import test from "node:test";

const ROOT = new URL("../", import.meta.url);

function readJson(path) {
    return JSON.parse(fs.readFileSync(new URL(path, ROOT), "utf8"));
}

function sha256(path) {
    return crypto.createHash("sha256")
        .update(fs.readFileSync(new URL(path, ROOT)))
        .digest("hex")
        .toUpperCase();
}

test("V0.5 RC artifacts are generator-current and shard-only", () => {
    const check = spawnSync(
        process.execPath,
        ["outputs/parallel-prep-2026-08-16/generate-v05-rc-package.mjs", "--check"],
        { cwd: ROOT, encoding: "utf8" }
    );
    assert.equal(check.status, 0, check.stderr || check.stdout);

    const entry = readJson("data/v05-rc/production-entry.json");
    const index = readJson("data/v05-rc/package-index.json");
    const policy = readJson("data/v05-rc/package-policy.json");
    assert.deepEqual(entry.releaseScope.publicPackIds, ["douluo1"]);
    assert.equal(entry.releaseScope.endpointAge, 25);
    assert.equal(entry.routeGraph, undefined);
    assert.equal(index.routeGraph, undefined);
    assert.deepEqual(Object.keys(index.routeGraphShards), ["douluo1"]);
    assert.equal(policy.routeGraphPackagingPolicy, "pack-shard-only-no-monolith-fallback");

    const runtimePaths = index.files.map(file => file.path);
    assert.deepEqual(runtimePaths, [
        "data/apk-canonical/catalogs/route-graph.douluo1.json",
        "data/apk-canonical/catalogs/formal-special-result-runtime-evidence.json",
        "data/apk-canonical/catalogs/human-soul-ring-runtime-evidence.json",
        "data/apk-canonical/catalogs/human-soul-ring-species-runtime-evidence.json",
        "data/apk-canonical/catalogs/combat-power-runtime-evidence.json"
    ]);
    for (const file of index.files) {
        assert.equal(sha256(file.path), file.sha256);
        assert.equal(fs.statSync(new URL(file.path, ROOT)).size, file.sizeBytes);
    }
    const serialized = JSON.stringify({ entry, index, policy });
    for (const forbidden of ["route-graph.json", "douluo2", "options.json"]) {
        assert.equal(serialized.includes(forbidden), false, forbidden);
    }
});

test("archive option 2R preserves exact bytes off the active runtime paths", () => {
    const manifest = readJson("data/v2/archive/apk-replaced-2026-08-16/manifest.json");
    const entry = readJson("data/v05-rc/production-entry.json");
    const index = readJson("data/v05-rc/package-index.json");
    assert.equal(manifest.schemaVersion, "production-content-archive/1.0");
    assert.equal(manifest.status, "archive-only");
    assert.equal(manifest.archivedAt, "2026-08-16");
    assert.equal(
        manifest.reason,
        "APK owner-authorized migration replaced these files as the active content source."
    );
    assert.equal(
        manifest.preservationPolicy,
        "retain_original_bytes_with_path_mapping"
    );
    assert.deepEqual(manifest.files.map(file => file.originalPath), [
        "data/v2/catalogs/martial-souls.json",
        "data/v2/config/awakening-probabilities.json",
        "data/v2/content/age-6-awakening.json"
    ]);
    assert.deepEqual(manifest.files.map(file => file.archivePath), [
        "data/v2/archive/apk-replaced-2026-08-16/catalogs/martial-souls.json",
        "data/v2/archive/apk-replaced-2026-08-16/config/awakening-probabilities.json",
        "data/v2/archive/apk-replaced-2026-08-16/content/age-6-awakening.json"
    ]);
    const expectedSizes = new Map([
        ["data/v2/archive/apk-replaced-2026-08-16/catalogs/martial-souls.json", 86986],
        ["data/v2/archive/apk-replaced-2026-08-16/config/awakening-probabilities.json", 12749],
        ["data/v2/archive/apk-replaced-2026-08-16/content/age-6-awakening.json", 4775]
    ]);
    for (const file of manifest.files) {
        assert.notEqual(file.originalPath, file.archivePath);
        assert.equal(sha256(file.archivePath), file.sha256);
        assert.equal(
            fs.statSync(new URL(file.archivePath, ROOT)).size,
            expectedSizes.get(file.archivePath)
        );
    }

    const runtimeSurface = JSON.stringify({ entry, files: index.files });
    for (const file of manifest.files) {
        assert.equal(runtimeSurface.includes(file.originalPath), false, file.originalPath);
        assert.equal(runtimeSurface.includes(file.archivePath), false, file.archivePath);
    }
    assert.equal(
        runtimeSurface.includes(index.buildInputs.martialSoulRuntimeEvidence.path),
        false
    );
});
