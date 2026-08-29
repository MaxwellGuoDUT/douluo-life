import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import { createV05ContentIndex, createV05DemoRunner } from "../js/v05-demo.js";
import {
    V05_LIFE_ARCHIVE_KEY,
    V05_LIFE_ARCHIVE_LIMIT,
    addV05LifeArchiveRecord,
    clearV05LifeArchive,
    createV05LifeArchiveRecord,
    parseV05LifeArchive,
    readV05LifeArchive
} from "../js/v05-life-archive.js";
import { V05_SAVE_KEY, digestV05Value } from "../js/v05-save-store.js";

const CATALOG_ROOT = new URL("../data/apk-canonical/catalogs/", import.meta.url);
const readJson = name => JSON.parse(fs.readFileSync(new URL(name, CATALOG_ROOT), "utf8"));

function completedRunner() {
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
    const runner = createV05DemoRunner({ routeGraph, contentIndex, seed: "apk-route-demo-seed" });
    while (runner.phase === "ready") runner.step();
    return runner;
}

const runner = completedRunner();
const record = createV05LifeArchiveRecord({
    runner,
    destinyId: "custom",
    packageVersion: "v05-rc2/2026-08-29",
    completedAt: "2026-08-29T00:00:00.000Z"
});

function memoryStorage(initial = []) {
    const data = new Map(initial);
    return {
        data,
        getItem(key) { return data.get(key) ?? null; },
        setItem(key, value) { data.set(key, value); },
        removeItem(key) { data.delete(key); }
    };
}

function withIntegrity(value) {
    const copy = structuredClone(value);
    delete copy.integrityDigest;
    copy.integrityDigest = digestV05Value(copy);
    return copy;
}

test("archive accepts completed age25 only and excludes runtime state", () => {
    assert.equal(record.age, 25);
    assert.equal(record.committedCount, 100);
    assert.equal("session" in record, false);
    assert.equal("history" in record, false);
    assert.equal("routeHistory" in record, false);
    assert.equal(Array.isArray(record.martialSouls), true);
    assert.equal(Array.isArray(record.soulRings), true);
    const ready = { phase: "ready", session: { character: { age: 0 } } };
    assert.throws(
        () => createV05LifeArchiveRecord({ runner: ready }),
        error => error.code === "V05_ARCHIVE_COMPLETED_ONLY"
    );
});

test("archive storage is idempotent and isolated from active save and other keys", () => {
    const storage = memoryStorage([[V05_SAVE_KEY, "active"], ["other", "keep"]]);
    const first = addV05LifeArchiveRecord(storage, record);
    const second = addV05LifeArchiveRecord(storage, record);
    assert.equal(first.added, true);
    assert.equal(second.added, false);
    assert.equal(readV05LifeArchive(storage).records.length, 1);
    clearV05LifeArchive(storage);
    assert.equal(storage.data.has(V05_LIFE_ARCHIVE_KEY), false);
    assert.equal(storage.data.get(V05_SAVE_KEY), "active");
    assert.equal(storage.data.get("other"), "keep");
});

test("archive rejects bad JSON, unknown schema and tampering without auto-clear", () => {
    assert.throws(() => parseV05LifeArchive("{"), error => error.code === "V05_ARCHIVE_SCHEMA_INVALID");
    assert.throws(
        () => parseV05LifeArchive({ schema: "douluo-life-v05-life-archive", schemaVersion: 99, records: [] }),
        error => error.code === "V05_ARCHIVE_VERSION_UNSUPPORTED"
    );
    const tampered = { schema: "douluo-life-v05-life-archive", schemaVersion: 1, records: [{ ...record, level: 999 }] };
    assert.throws(() => parseV05LifeArchive(tampered), error => error.code === "V05_ARCHIVE_RECORD_INVALID");
    const storage = memoryStorage([[V05_LIFE_ARCHIVE_KEY, "{"]]);
    assert.throws(() => readV05LifeArchive(storage), error => error.code === "V05_ARCHIVE_SCHEMA_INVALID");
    assert.equal(storage.data.get(V05_LIFE_ARCHIVE_KEY), "{");
});

test("archive refuses the 51st unique summary and never evicts", () => {
    const records = Array.from({ length: V05_LIFE_ARCHIVE_LIMIT }, (_, index) => withIntegrity({
        ...record,
        archiveId: `life-${String(index).padStart(3, "0")}`,
        summaryDigest: `summary-${String(index).padStart(3, "0")}`
    }));
    const storage = memoryStorage([[V05_LIFE_ARCHIVE_KEY, JSON.stringify({
        schema: "douluo-life-v05-life-archive",
        schemaVersion: 1,
        records
    })]]);
    const next = withIntegrity({ ...record, archiveId: "life-051", summaryDigest: "summary-051" });
    assert.throws(
        () => addV05LifeArchiveRecord(storage, next),
        error => error.code === "V05_ARCHIVE_LIMIT_REACHED"
    );
    assert.equal(readV05LifeArchive(storage).records.length, V05_LIFE_ARCHIVE_LIMIT);
});

test("archive quota and security failures preserve completed runner state", () => {
    const unavailable = {
        getItem() { return null; },
        setItem() { throw new DOMException("quota", "QuotaExceededError"); }
    };
    const before = [runner.phase, runner.session.random.cursor, runner.session.history.length];
    assert.throws(
        () => addV05LifeArchiveRecord(unavailable, record),
        error => error.code === "V05_ARCHIVE_STORAGE_UNAVAILABLE"
    );
    assert.deepEqual([runner.phase, runner.session.random.cursor, runner.session.history.length], before);
});
