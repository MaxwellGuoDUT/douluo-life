import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import test from "node:test";

import {
    V05_DEFAULT_SEED,
    V05_ENDPOINT_AGE,
    V05_PACK_ID,
    createV05ContentIndex,
    createV05DemoRunner
} from "../js/v05-demo.js";

const CATALOG_ROOT = new URL("../data/apk-canonical/catalogs/", import.meta.url);

function readJson(name) {
    return JSON.parse(fs.readFileSync(new URL(name, CATALOG_ROOT), "utf8"));
}

function materializeDouluo1() {
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
        formalSpecialResultEvidence: readJson(
            "formal-special-result-runtime-evidence.json"
        ),
        humanSoulRingEvidence: readJson("human-soul-ring-runtime-evidence.json"),
        humanSoulRingSpeciesEvidence: readJson(
            "human-soul-ring-species-runtime-evidence.json"
        ),
        combatPowerEvidence: readJson("combat-power-runtime-evidence.json")
    };
    return {
        routeGraph,
        contentIndex: createV05ContentIndex(loaded)
    };
}

const runtime = materializeDouluo1();

function createRunner(seed = V05_DEFAULT_SEED) {
    return createV05DemoRunner({ ...runtime, seed });
}

function routeTranscript(session) {
    return session.routeHistory.map(({ flowId, poolId, optionId }) => ({
        flowId,
        poolId,
        optionId
    }));
}

test("V0.5 has an independent entry and keeps every legacy entry intact", () => {
    const html = fs.readFileSync(new URL("../v05-demo.html", import.meta.url), "utf8");
    const app = fs.readFileSync(
        new URL("../js/v05-demo-app.js", import.meta.url),
        "utf8"
    );
    for (const path of ["../index.html", "../v2-demo.html", "../v3-demo.html",
        "../soul-ring-demo.html", "../apk-route-demo.html"]) {
        assert.equal(fs.existsSync(new URL(path, import.meta.url)), true, path);
    }
    assert.match(html, /id="v05Demo"/u);
    assert.match(html, /斗罗人生 V0\.5/u);
    assert.match(html, /0～25 岁/u);
    assert.match(html, /js\/v05-demo-app\.js/u);
    for (const status of ["loading", "ready", "advancing", "boundary", "completed", "error"]) {
        assert.match(app, new RegExp(`\\b${status}\\b`, "u"));
    }
    assert.match(app, /catalogNames:\s*\[\]/u);
    assert.match(app, /routePackId:\s*V05_PACK_ID/u);
    assert.doesNotMatch(app, /douluo2/u);
    assert.doesNotMatch(app, /options\.json/u);
    assert.doesNotMatch(app, /route-graph\.json/u);
});

test("default seed reaches the first exact age-25 commit at item 100 and locks state", async () => {
    const runner = createRunner();
    const transcript = [];
    let result = null;
    while (runner.phase === "ready" && transcript.length < 150) {
        result = runner.step();
        if (result.committed) {
            transcript.push({
                flowId: result.spin.flowId,
                poolId: result.spin.poolId,
                optionId: result.spin.optionId
            });
        }
    }

    assert.equal(result.status, "completed");
    assert.equal(transcript.length, 100);
    assert.deepEqual(transcript.at(-1), {
        flowId: "douluo1:flow.formal-source.c9944ade-310d-41eb-b8ea-01723cab952c",
        poolId: "c9944ade-310d-41eb-b8ea-01723cab952c",
        optionId: "fff9f5"
    });
    assert.equal(
        crypto.createHash("sha256").update(JSON.stringify(transcript)).digest("hex"),
        "967347b48f6680be71b1f33d18c52f392519afd4c7afb5255beae20a74531391"
    );
    assert.equal(runner.session.character.age, V05_ENDPOINT_AGE);
    assert.equal(runner.session.character.level, 42);
    assert.equal(runner.session.random.cursor, 100);
    assert.equal(runner.session.history.length, 100);
    assert.equal(runner.session.routeHistory.length, 100);
    assert.equal(runner.session.currentFlowId, "douluo1:flow.formal-special-growth");
    assert.equal(runner.summary.seed, V05_DEFAULT_SEED);
    assert.equal(runner.summary.martialSouls.length, 1);
    assert.equal(runner.summary.martialSouls[0].ringCount, 4);

    const locked = {
        cursor: runner.session.random.cursor,
        history: runner.session.history.length,
        routeHistory: runner.session.routeHistory.length,
        flowId: runner.session.currentFlowId
    };
    assert.deepEqual(runner.step(), {
        status: "completed",
        committed: false,
        blocked: true,
        reason: "completed",
        error: null,
        summary: runner.summary
    });
    const continuous = await runner.advanceToNextAge();
    assert.equal(continuous.blocked, true);
    assert.deepEqual({
        cursor: runner.session.random.cursor,
        history: runner.session.history.length,
        routeHistory: runner.session.routeHistory.length,
        flowId: runner.session.currentFlowId
    }, locked);
});

test("continuous age advance and single-step advance produce the same age-25 session", async () => {
    const single = createRunner();
    while (single.phase === "ready") single.step();

    const continuous = createRunner();
    for (let age = 1; age <= V05_ENDPOINT_AGE; age += 1) {
        const result = await continuous.advanceToNextAge();
        if (age < V05_ENDPOINT_AGE) {
            assert.equal(result.ageChanged, true);
            assert.equal(continuous.session.character.age, age);
        } else {
            assert.equal(result.status, "completed");
        }
    }

    assert.equal(continuous.phase, "completed");
    assert.deepEqual(continuous.session.character, single.session.character);
    assert.deepEqual(continuous.session.random, single.session.random);
    assert.deepEqual(routeTranscript(continuous.session), routeTranscript(single.session));
});

test("custom seed stops at a typed unresolved option without committing the failed item", () => {
    const runner = createRunner("v05-custom-1");
    let result;
    for (let step = 1; step <= 95; step += 1) result = runner.step();

    assert.equal(result.status, "boundary");
    assert.equal(runner.session.character.age, 17);
    assert.equal(runner.session.random.cursor, 95);
    assert.equal(runner.session.history.length, 94);
    assert.equal(runner.error.code, "APK_ROUTE_DYNAMIC_OPTION_UNRESOLVED");
    assert.equal(runner.error.details.operationId, "beast.element.unresolved");
    assert.equal(runner.lastSpin.optionId, "a935ef");

    const before = {
        cursor: runner.session.random.cursor,
        history: runner.session.history.length
    };
    assert.equal(runner.step().blocked, true);
    assert.deepEqual({
        cursor: runner.session.random.cursor,
        history: runner.session.history.length
    }, before);
});

test("busy guard blocks a second action and cancellation stops between commits", async () => {
    const runner = createRunner();
    let releaseYield;
    const advance = runner.advanceToNextAge({
        yieldStep: () => new Promise(resolve => {
            releaseYield = resolve;
        })
    });
    await Promise.resolve();
    assert.equal(runner.phase, "advancing");
    const cursor = runner.session.random.cursor;
    const blocked = runner.step();
    assert.equal(blocked.blocked, true);
    assert.equal(blocked.reason, "busy");
    assert.equal(runner.session.random.cursor, cursor);
    runner.cancelAdvance();
    releaseYield();
    const result = await advance;
    assert.equal(result.cancelled, true);
    assert.equal(runner.phase, "ready");
    assert.equal(runner.session.history.length, runner.session.random.cursor);
});

test("V0.5 rejects a route graph that is not the single douluo1 shard", () => {
    assert.throws(
        () => createV05ContentIndex({
            routeGraph: {
                schemaVersion: "apk-route-graph/1.0",
                packs: [{ id: "douluo2" }]
            }
        }),
        error => error.code === "V05_ROUTE_PACK_MISMATCH"
    );
    assert.equal(V05_PACK_ID, "douluo1");
});
