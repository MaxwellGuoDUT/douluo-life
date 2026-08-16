import assert from "node:assert/strict";
import test from "node:test";

import { loadProductionEntry } from "../js/production-content-loader.js";

function createMemoryFetch(files) {
    return async path => {
        const value = files[path];
        if (value === undefined) {
            return { ok: false, status: 404, json: async () => ({}) };
        }
        return { ok: true, status: 200, json: async () => value };
    };
}

test("active production entry points to the APK canonical package", async () => {
    const files = {
        "data/production-entry.json": {
            schemaVersion: "production-entry/1.0",
            status: "active",
            source: "apk-canonical",
            packageIndex: "data/apk-canonical/package-index.json",
            policy: "data/apk-canonical/meta/package-policy.json"
        },
        "data/apk-canonical/package-index.json": {
            schemaVersion: "apk-canonical-package/1.0",
            counts: { pools: 1 }
        },
        "data/apk-canonical/meta/package-policy.json": {
            availabilityPolicy: "preserve_apk_original_state"
        },
        "data/apk-canonical/catalogs/pools.json": {
            schemaVersion: "apk-canonical-catalog/1.0",
            ownerAuthorization: "confirmed",
            recordCount: 1,
            records: [{
                id: "pool",
                ownerAuthorization: "confirmed",
                sourceRef: { path: "apk", sha256: "sha", sourceId: "row" },
                availability: { policy: "preserve_apk_original_state" }
            }]
        }
    };

    const loaded = await loadProductionEntry({
        fetchImpl: createMemoryFetch(files)
    });
    assert.equal(loaded.entry.source, "apk-canonical");
    assert.equal(loaded.policy.availabilityPolicy, "preserve_apk_original_state");
    assert.equal(loaded.complete, true);
    assert.equal(loaded.validation.valid, true);
});

test("production loader supports a partial lazy catalog load without falsely claiming full validation", async () => {
    const files = {
        "data/production-entry.json": {
            schemaVersion: "production-entry/1.0",
            status: "active",
            source: "apk-canonical",
            packageIndex: "data/apk-canonical/package-index.json",
            policy: "data/apk-canonical/meta/package-policy.json"
        },
        "data/apk-canonical/package-index.json": {
            schemaVersion: "apk-canonical-package/1.0",
            counts: { pools: 1, options: 1 }
        },
        "data/apk-canonical/meta/package-policy.json": {},
        "data/apk-canonical/catalogs/pools.json": { records: [] }
    };
    const loaded = await loadProductionEntry({
        fetchImpl: createMemoryFetch(files),
        catalogNames: ["pools"]
    });
    assert.equal(loaded.complete, false);
    assert.equal(loaded.validation, null);
});

test("production loader keeps the heavy APK route graph lazy but can validate it on demand", async () => {
    const files = {
        "data/production-entry.json": {
            schemaVersion: "production-entry/1.0",
            status: "active",
            source: "apk-canonical",
            packageIndex: "data/apk-canonical/package-index.json",
            policy: "data/apk-canonical/meta/package-policy.json",
            routeGraph: "data/apk-canonical/catalogs/route-graph.json",
            formalSpecialResultEvidence: "data/apk-canonical/catalogs/formal-special-result-runtime-evidence.json",
            humanSoulRingEvidence: "data/apk-canonical/catalogs/human-soul-ring-runtime-evidence.json",
            humanSoulRingSpeciesEvidence: "data/apk-canonical/catalogs/human-soul-ring-species-runtime-evidence.json",
            combatPowerEvidence: "data/apk-canonical/catalogs/combat-power-runtime-evidence.json"
        },
        "data/apk-canonical/package-index.json": {
            schemaVersion: "apk-canonical-package/1.0",
            counts: {}
        },
        "data/apk-canonical/meta/package-policy.json": {},
        "data/apk-canonical/catalogs/route-graph.json": {
            schemaVersion: "apk-route-graph/1.0",
            source: { gameplayExecuted: false },
            packs: [{ id: "douluo1", entryFlowId: "entry", flows: [], pools: [] }]
        },
        "data/apk-canonical/catalogs/formal-special-result-runtime-evidence.json": {
            schemaVersion: "apk-formal-special-result-evidence/1.0",
            records: []
        },
        "data/apk-canonical/catalogs/human-soul-ring-runtime-evidence.json": {
            schemaVersion: "apk-human-soul-ring-evidence/1.0",
            records: []
        },
        "data/apk-canonical/catalogs/human-soul-ring-species-runtime-evidence.json": {
            schemaVersion: "apk-human-soul-ring-species-evidence/1.0",
            records: []
        },
        "data/apk-canonical/catalogs/combat-power-runtime-evidence.json": {
            schemaVersion: "apk-combat-power-evidence/1.0"
        }
    };
    const lazy = await loadProductionEntry({
        fetchImpl: createMemoryFetch(files),
        validate: false
    });
    assert.equal(lazy.routeGraph, null);
    const loaded = await loadProductionEntry({
        fetchImpl: createMemoryFetch(files),
        validate: false,
        includeRouteGraph: true
    });
    assert.equal(loaded.routeGraph.packs[0].id, "douluo1");
    assert.equal(
        loaded.formalSpecialResultEvidence.schemaVersion,
        "apk-formal-special-result-evidence/1.0"
    );
    assert.equal(
        loaded.humanSoulRingEvidence.schemaVersion,
        "apk-human-soul-ring-evidence/1.0"
    );
    assert.equal(
        loaded.humanSoulRingSpeciesEvidence.schemaVersion,
        "apk-human-soul-ring-species-evidence/1.0"
    );
    assert.equal(
        loaded.combatPowerEvidence.schemaVersion,
        "apk-combat-power-evidence/1.0"
    );
    assert.equal(loaded.routeGraphValidation.valid, true);
});
