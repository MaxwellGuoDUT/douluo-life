import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import { createV10HumanRunner } from "../js/v10-human-runner.js";

const CATALOG_ROOT = new URL("../data/apk-canonical/catalogs/", import.meta.url);

function readCatalog(name) {
    return JSON.parse(fs.readFileSync(new URL(name, CATALOG_ROOT), "utf8"));
}

function materializeDouluo1({ formalEvidence = true } = {}) {
    const shard = readCatalog("route-graph.douluo1.json");
    return {
        routeGraph: {
            schemaVersion: "apk-route-graph/1.0",
            packageVersion: shard.packageVersion,
            status: shard.status,
            source: shard.source,
            generatedBy: shard.generatedBy,
            packs: [shard.pack],
            diagnostics: shard.diagnostics
        },
        formalSpecialResultEvidence: formalEvidence
            ? readCatalog("formal-special-result-runtime-evidence.json")
            : null,
        humanSoulRingEvidence: readCatalog("human-soul-ring-runtime-evidence.json"),
        followUpPrepareEvidence: readCatalog("followup-prepare-runtime-evidence.json"),
        humanSoulRingSpeciesEvidence: readCatalog(
            "human-soul-ring-species-runtime-evidence.json"
        ),
        officialBeastElementEvidence: readCatalog(
            "official-beast-element-runtime-evidence.json"
        ),
        combatPowerEvidence: readCatalog("combat-power-runtime-evidence.json")
    };
}

const loaded = materializeDouluo1();

function terminalProjection(runner) {
    return {
        phase: runner.phase,
        age: runner.summary?.age,
        level: runner.summary?.level,
        ending: runner.summary?.ending,
        cursor: runner.session.random.cursor,
        history: runner.session.history.length,
        routeHistory: runner.session.routeHistory.length,
        dynamicHistory: runner.session.dynamicHistory.length
    };
}

test("V1 default human life continues past 25 and completes at its source death", async () => {
    const runner = createV10HumanRunner({ loaded, seed: "apk-route-demo-seed" });
    const result = await runner.runToTerminal();
    assert.equal(result.status, "completed");
    assert.equal(runner.phase, "completed");
    assert.equal(runner.summary.age, 85);
    assert.equal(runner.summary.ending.kind, "death");
    assert.equal(runner.summary.ending.title, "陨落");
    assert.ok(runner.summary.history > 100);
    assert.equal(runner.session.random.cursor, runner.session.history.length);
    const locked = structuredClone(terminalProjection(runner));
    assert.equal(runner.step().blocked, true);
    assert.deepEqual(terminalProjection(runner), locked);
});

test("a fixed human seed double-run is deterministic through age 150", async () => {
    const first = createV10HumanRunner({ loaded, seed: "v05-destiny-002" });
    const second = createV10HumanRunner({ loaded, seed: "v05-destiny-002" });
    await first.runToTerminal();
    await second.runToTerminal();
    assert.deepEqual(terminalProjection(first), terminalProjection(second));
    assert.equal(first.summary.age, 150);
    assert.equal(first.summary.ending.id, "douluo1:human-lifespan-150");
    assert.equal(first.session.finished, true);
});

test("representative production destinies cover evidence and follow-up branches", async () => {
    const seeds = ["v05-destiny-001", "v05-destiny-013"];
    const outcomes = [];
    for (const seed of seeds) {
        const runner = createV10HumanRunner({ loaded, seed });
        await runner.runToTerminal();
        outcomes.push({
            seed,
            phase: runner.phase,
            ending: runner.summary?.ending?.id,
            age: runner.summary?.age
        });
    }
    assert.equal(outcomes.length, seeds.length);
    assert.ok(outcomes.every(outcome => outcome.phase === "completed"));
    assert.ok(outcomes.every(outcome => typeof outcome.ending === "string"));
    assert.ok(outcomes.every(outcome => outcome.age > 25));
});

test("missing human handler evidence rejects atomically", () => {
    const runner = createV10HumanRunner({
        loaded: materializeDouluo1({ formalEvidence: false }),
        seed: "apk-route-demo-seed"
    });
    for (let step = 0; step < 1000 && runner.phase === "ready"; step += 1) {
        const before = structuredClone(runner.session);
        const result = runner.step();
        if (result.status === "boundary") {
            assert.match(result.error.code, /EVIDENCE|DYNAMIC|UNRESOLVED/u);
            assert.deepEqual(runner.session, before);
            return;
        }
    }
    assert.fail("expected a typed evidence boundary");
});
