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
    assert.equal(restored.session.character.age, 17);
    assert.equal(restored.session.random.cursor, 95);
    assert.equal(restored.session.history.length, 94);
    assert.equal(restored.error.code, "APK_ROUTE_DYNAMIC_OPTION_UNRESOLVED");
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
