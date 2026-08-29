import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import {
    V05_APP_VERSION,
    V05_DEFAULT_SEED,
    V05_PACK_ID,
    createV05ContentIndex,
    createV05DemoRunner
} from "../js/v05-demo.js";
import {
    V05_SAVE_KEY,
    clearV05Save,
    createV05Checkpoint,
    createV05ContentIdentity,
    parseV05Save,
    readV05Save,
    restoreV05Checkpoint,
    writeV05Save
} from "../js/v05-save-store.js";

const CATALOG_ROOT = new URL("../data/apk-canonical/catalogs/", import.meta.url);
const readJson = name => JSON.parse(fs.readFileSync(new URL(name, CATALOG_ROOT), "utf8"));

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
    const loaded = {
        routeGraph,
        formalSpecialResultEvidence: readJson("formal-special-result-runtime-evidence.json"),
        humanSoulRingEvidence: readJson("human-soul-ring-runtime-evidence.json"),
        humanSoulRingSpeciesEvidence: readJson("human-soul-ring-species-runtime-evidence.json"),
        officialBeastElementEvidence: readJson("official-beast-element-runtime-evidence.json"),
        combatPowerEvidence: readJson("combat-power-runtime-evidence.json")
    };
    return {
        routeGraph,
        contentIndex: createV05ContentIndex(loaded),
        identity: createV05ContentIdentity({ routeGraph, packId: V05_PACK_ID, appVersion: V05_APP_VERSION })
    };
}

const runtime = materialize();
const createRunner = seed => createV05DemoRunner({ ...runtime, seed });

function core(runner) {
    return {
        phase: runner.phase,
        character: runner.session.character,
        random: runner.session.random,
        flow: runner.session.currentFlowId,
        history: runner.session.history,
        routeHistory: runner.session.routeHistory,
        presentation: runner.presentationHistory,
        summary: runner.summary,
        error: runner.error
    };
}

test("mid-life checkpoint restores exactly and continues homomorphically to age 25", () => {
    const control = createRunner(V05_DEFAULT_SEED);
    const saved = createRunner(V05_DEFAULT_SEED);
    for (let index = 0; index < 34; index += 1) {
        control.step();
        saved.step();
    }
    const envelope = createV05Checkpoint({ runner: saved, contentIdentity: runtime.identity, savedAt: "2026-08-28T00:00:00.000Z" });
    const restored = restoreV05Checkpoint({ raw: JSON.stringify(envelope), createRunner, contentIdentity: runtime.identity }).runner;
    assert.deepEqual(core(restored), core(saved));
    while (control.phase === "ready") control.step();
    while (restored.phase === "ready") restored.step();
    assert.deepEqual(core(restored), core(control));
});

test("completed checkpoint restores 25 years, 100/100, and completion lock with zero extra draw", () => {
    const runner = createRunner(V05_DEFAULT_SEED);
    while (runner.phase === "ready") runner.step();
    const envelope = createV05Checkpoint({ runner, contentIdentity: runtime.identity });
    const restored = restoreV05Checkpoint({ raw: envelope, createRunner, contentIdentity: runtime.identity }).runner;
    assert.equal(restored.phase, "completed");
    assert.equal(restored.session.character.age, 25);
    assert.equal(restored.session.random.cursor, 100);
    assert.equal(restored.session.history.length, 100);
    const before = { cursor: restored.session.random.cursor, history: restored.session.history.length };
    assert.equal(restored.step().blocked, true);
    assert.deepEqual({ cursor: restored.session.random.cursor, history: restored.session.history.length }, before);
});

test("typed boundary checkpoint replays the failed draw without committing it", () => {
    const runner = createRunner("v05-custom-1");
    while (runner.phase === "ready") runner.step();
    const envelope = createV05Checkpoint({ runner, contentIdentity: runtime.identity });
    const restored = restoreV05Checkpoint({ raw: envelope, createRunner, contentIdentity: runtime.identity }).runner;
    assert.equal(restored.phase, "boundary");
    assert.equal(restored.session.character.age, 24);
    assert.equal(restored.session.random.cursor, 130);
    assert.equal(restored.session.history.length, 129);
    assert.equal(restored.error.code, "APK_ROUTE_FOLLOWUP_PREPARE_UNRESOLVED");
});

test("bad JSON, unknown version, content drift, and replay tampering are typed rejects", () => {
    assert.throws(() => parseV05Save("{"), error => error.code === "V05_SAVE_SCHEMA_INVALID");
    const runner = createRunner(V05_DEFAULT_SEED);
    runner.step();
    const envelope = createV05Checkpoint({ runner, contentIdentity: runtime.identity });
    assert.throws(
        () => restoreV05Checkpoint({ raw: { ...envelope, schemaVersion: 99 }, createRunner, contentIdentity: runtime.identity }),
        error => error.code === "V05_SAVE_VERSION_UNSUPPORTED"
    );
    assert.throws(
        () => restoreV05Checkpoint({ raw: envelope, createRunner, contentIdentity: { ...runtime.identity, contentFingerprint: "changed" } }),
        error => error.code === "V05_SAVE_CONTENT_MISMATCH"
    );
    assert.throws(
        () => restoreV05Checkpoint({ raw: { ...envelope, characterDigest: "tampered" }, createRunner, contentIdentity: runtime.identity }),
        error => error.code === "V05_SAVE_REPLAY_MISMATCH"
    );
});

test("storage errors are typed and clear removes only the V0.5 key", () => {
    const runner = createRunner(V05_DEFAULT_SEED);
    runner.step();
    const envelope = createV05Checkpoint({ runner, contentIdentity: runtime.identity });
    const data = new Map([["other", "keep"]]);
    const storage = {
        setItem(key, value) { data.set(key, value); },
        removeItem(key) { data.delete(key); }
    };
    writeV05Save(storage, envelope);
    assert.equal(data.has(V05_SAVE_KEY), true);
    clearV05Save(storage);
    assert.equal(data.has(V05_SAVE_KEY), false);
    assert.equal(data.get("other"), "keep");
    const unavailable = { setItem() { throw new DOMException("quota", "QuotaExceededError"); } };
    assert.throws(
        () => writeV05Save(unavailable, envelope),
        error => error.code === "V05_SAVE_STORAGE_UNAVAILABLE"
    );
    assert.equal(runner.session.history.length, 1);
    assert.equal(runner.session.random.cursor, 1);
});

test("continuous onStep checkpoint normalizes advancing to ready and bad storage is not deleted", async () => {
    const runner = createRunner(V05_DEFAULT_SEED);
    let releaseYield;
    const advancing = runner.advanceToNextAge({
        yieldStep: () => new Promise(resolve => { releaseYield = resolve; })
    });
    await Promise.resolve();
    assert.equal(runner.phase, "advancing");
    const checkpoint = createV05Checkpoint({ runner, contentIdentity: runtime.identity });
    assert.equal(checkpoint.phase, "ready");
    assert.equal(checkpoint.committedCount, runner.session.history.length);
    runner.cancelAdvance();
    releaseYield();
    await advancing;

    let removed = false;
    const storage = {
        getItem() { return "{"; },
        removeItem() { removed = true; }
    };
    assert.throws(() => readV05Save(storage), error => error.code === "V05_SAVE_SCHEMA_INVALID");
    assert.equal(removed, false);
});

test("Day21 v1 ready and completed saves migrate after exact replay", () => {
    for (const committedCount of [34, 100]) {
        const runner = createRunner(V05_DEFAULT_SEED);
        while (runner.phase === "ready" && runner.session.history.length < committedCount) runner.step();
        const current = createV05Checkpoint({ runner, contentIdentity: runtime.identity });
        const legacy = {
            ...current,
            schemaVersion: 1,
            packageIdentity: { ...current.packageIdentity, contentFingerprint: "day21-content" }
        };
        delete legacy.destinyId;
        const restored = restoreV05Checkpoint({ raw: legacy, createRunner, contentIdentity: runtime.identity });
        assert.equal(restored.migrated, true);
        assert.equal(restored.sourceEnvelope, legacy);
        assert.equal(restored.envelope.schemaVersion, 2);
        assert.equal(restored.envelope.destinyId, "custom");
        assert.equal(restored.runner.session.history.length, committedCount);
        assert.equal(restored.runner.phase, runner.phase);
    }
});

test("Day21 boundary closed by Day22 returns semantics changed without auto-advance", () => {
    const runner = createRunner("v05-custom-1");
    for (let index = 0; index < 94; index += 1) runner.step();
    const ready = createV05Checkpoint({ runner, contentIdentity: runtime.identity });
    const legacyBoundary = {
        ...ready,
        schemaVersion: 1,
        phase: "boundary",
        boundaryCode: "APK_ROUTE_DYNAMIC_OPTION_UNRESOLVED",
        packageIdentity: { ...ready.packageIdentity, contentFingerprint: "day21-content" }
    };
    delete legacyBoundary.destinyId;
    assert.throws(
        () => restoreV05Checkpoint({ raw: legacyBoundary, createRunner, contentIdentity: runtime.identity }),
        error => error.code === "V05_SAVE_BOUNDARY_SEMANTICS_CHANGED"
            && error.details.previousBoundaryCode === "APK_ROUTE_DYNAMIC_OPTION_UNRESOLVED"
    );
    assert.equal(legacyBoundary.committedCount, 94);
    assert.equal(legacyBoundary.randomCursor, 94);
});

test("Day22 official destiny identity requires manifest id and matching seed", () => {
    const manifest = JSON.parse(fs.readFileSync(
        new URL("../data/v05-rc/supported-destinies.json", import.meta.url),
        "utf8"
    ));
    const destiny = manifest.destinies[0];
    const runner = createRunner(destiny.seed);
    runner.step();
    const envelope = createV05Checkpoint({
        runner,
        contentIdentity: runtime.identity,
        destinyId: destiny.id
    });
    const restored = restoreV05Checkpoint({
        raw: envelope,
        createRunner,
        contentIdentity: runtime.identity,
        destinyManifest: manifest
    });
    assert.equal(restored.envelope.destinyId, destiny.id);
    assert.throws(
        () => restoreV05Checkpoint({
            raw: { ...envelope, seed: "wrong-seed" },
            createRunner,
            contentIdentity: runtime.identity,
            destinyManifest: manifest
        }),
        error => error.code === "V05_SAVE_DESTINY_MISMATCH"
    );
});
