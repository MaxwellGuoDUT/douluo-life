import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import { createV10HumanRunner } from "../js/v10-human-runner.js";

const CATALOG_ROOT = new URL("../data/apk-canonical/catalogs/", import.meta.url);

// The restored source bundle contains Vite's preload helper. These inert DOM
// surfaces let Node exercise the source registries without emulating the app UI.
globalThis.document ??= {
    createElement() {
        return {
            relList: { supports: () => true },
            addEventListener(name, listener) {
                if (name === "load") queueMicrotask(listener);
            },
            setAttribute() {}
        };
    },
    getElementsByTagName: () => [],
    querySelector: () => null,
    querySelectorAll: () => [],
    head: { appendChild() {} }
};
globalThis.window ??= { dispatchEvent: () => true };

function readCatalog(name) {
    return JSON.parse(fs.readFileSync(new URL(name, CATALOG_ROOT), "utf8"));
}

function materializeDouluo1() {
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
        formalSpecialResultEvidence: readCatalog(
            "formal-special-result-runtime-evidence.json"
        ),
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

const [packModule, foundation] = await Promise.all([
    import("../data/v10/source-runtime/douluo1-pack-C6xEgEus.js"),
    import("../data/v10/source-runtime/human-foundation-CduvzjjO.js")
]);
const sourcePack = { ...packModule.default, foundation };
sourcePack.routeGraph = JSON.parse(fs.readFileSync(
    new URL("../data/v10/route-graph.douluo1.json", import.meta.url),
    "utf8"
));
const loaded = materializeDouluo1();

function create(seed, options = {}) {
    return createV10HumanRunner({
        loaded,
        sourcePack,
        seed,
        route: "beast",
        ...options
    });
}

function runSteps(runner, count) {
    const results = [];
    for (let step = 0; step < count && runner.phase === "ready"; step += 1) {
        results.push(runner.step());
    }
    return results;
}

function projection(runner) {
    return {
        phase: runner.phase,
        cursor: runner.session.random.cursor,
        history: runner.session.history.length,
        routeHistory: runner.session.routeHistory.length,
        dynamicHistory: runner.session.dynamicHistory.length,
        flow: runner.session.currentFlowId,
        character: runner.session.character
    };
}

test("beast start uses the authority foundation and enters the source pack", () => {
    const runner = create("v10-beast-entry-001");
    const results = runSteps(runner, 12);
    assert.equal(results.length, 12);
    assert.ok(results.every(result => result.committed));
    assert.equal(runner.session.character.route, "beast");
    assert.ok(runner.session.character.beastYears > 0);
    assert.ok(runner.session.character.beast?.species);
    assert.match(runner.session.currentFlowId, /^douluo1:/u);
    assert.equal(runner.session.random.cursor, runner.session.history.length);
});

test("a fixed source beast seed transforms and continues in the shared human runtime", () => {
    const runner = create("v10-beast-probe-001");
    for (let step = 0; step < 200 && runner.session.character.route === "beast"; step += 1) {
        const result = runner.step();
        assert.notEqual(result.status, "boundary", result.error?.message);
    }
    assert.equal(runner.session.character.route, "transformed");
    assert.equal(runner.session.currentFlowId, "douluo1:flow.formal-human.identity");
    assert.ok(runner.session.character.beastOrigin);
    const before = structuredClone(runner.session);
    const continued = runner.step();
    assert.equal(continued.committed, true, continued.error?.message);
    assert.notDeepEqual(runner.session, before);
    assert.equal(runner.session.character.route, "transformed");
});

test("beast snapshots survive JSON round-trip and resume deterministically", () => {
    const first = create("v10-beast-save-001");
    runSteps(first, 24);
    const snapshot = JSON.parse(JSON.stringify(first.exportSnapshot()));
    const resumed = create("v10-beast-save-001", { snapshot });
    assert.deepEqual(resumed.session, first.session);
    const firstResult = first.step();
    const resumedResult = resumed.step();
    assert.deepEqual(resumedResult, firstResult);
    assert.deepEqual(resumed.session, first.session);
});

test("a fixed beast seed is deterministic across independent runs", () => {
    const first = create("v10-beast-cohort-001");
    const second = create("v10-beast-cohort-001");
    runSteps(first, 350);
    runSteps(second, 350);
    assert.deepEqual(projection(second), projection(first));
    assert.equal(first.phase, "completed");
    assert.equal(first.session.character.ending.id, "death");
});

test("representative beast cohort has no reachable typed boundary", () => {
    const outcomes = [];
    for (let index = 1; index <= 12; index += 1) {
        const seed = `v10-beast-cohort-${String(index).padStart(3, "0")}`;
        const runner = create(seed);
        runSteps(runner, 350);
        outcomes.push({
            seed,
            phase: runner.phase,
            route: runner.session.character.route,
            ending: runner.session.character.ending?.id ?? null,
            beastYears: runner.session.character.beastYears,
            flow: runner.session.currentFlowId
        });
        assert.notEqual(
            runner.phase,
            "boundary",
            `${seed}: ${runner.error?.message}; flow=${runner.session.currentFlowId}; option=${runner.lastResult?.spin?.optionId ?? runner.lastResult?.spin?.option?.id ?? "unknown"}; details=${JSON.stringify(runner.error?.details ?? null)}`
        );
        assert.notEqual(runner.phase, "error", `${seed}: ${runner.error?.message}`);
    }
    assert.ok(outcomes.some(outcome => outcome.ending === "death"));
    assert.ok(outcomes.some(outcome => outcome.route === "transformed"));
});

test("generator closes only the authority source land-finale export gap", () => {
    assert.ok(sourcePack.game.flows.beastSeaFinal);
    assert.ok(sourcePack.game.pools.some(pool => (
        pool.id === "7212bdd4-a88d-4cfe-bea9-f9eb3eed8a9d"
    )));
    assert.ok(foundation.w.pools.some(pool => (
        pool.id === "d39bb131-6949-4a46-9733-19d0335f668c"
    )));
    assert.equal(sourcePack.game.flows.beastLandFinal, undefined);
    assert.equal(sourcePack.game.pools.some(pool => (
        pool.id === "d39bb131-6949-4a46-9733-19d0335f668c"
    )), false);
    const graph = sourcePack.routeGraph;
    assert.equal(graph.pack.summary.flows - Object.keys(sourcePack.game.flows).length, 1);
    assert.equal(graph.pack.summary.pools - sourcePack.game.pools.length, 1);
    assert.equal(
        graph.pack.summary.options
            - sourcePack.game.pools.reduce((sum, pool) => sum + pool.options.length, 0),
        7
    );
    const flow = graph.pack.flows.find(item => item.id === "beastLandFinal");
    const pool = graph.pack.pools.find(item => item.id === flow.source.poolId);
    assert.deepEqual(flow.source, {
        id: "beastLandFinal",
        poolId: "d39bb131-6949-4a46-9733-19d0335f668c",
        next: "beastLandFinal"
    });
    assert.equal(pool.options.length, 7);
    assert.ok(pool.options.every(option => (
        option.route.customHandler.value === "resolveBeastLandFinal"
    )));
});

test("missing generated land-finale closure is a typed start boundary", () => {
    assert.throws(
        () => createV10HumanRunner({
            loaded,
            sourcePack: { ...sourcePack, routeGraph: null },
            seed: "v10-beast-missing-land-closure",
            route: "beast"
        }),
        error => error.code === "V10_BEAST_LAND_CLOSURE_MISSING"
    );
});

test("missing source customHandler rejects one whole step atomically", () => {
    const handlers = { ...sourcePack.game.customHandlers };
    delete handlers.setBeastRealm;
    const incompleteSource = {
        ...sourcePack,
        game: { ...sourcePack.game, customHandlers: handlers }
    };
    const runner = createV10HumanRunner({
        loaded,
        sourcePack: incompleteSource,
        seed: "v10-beast-boundary-001",
        route: "beast"
    });
    for (let step = 0; step < 20; step += 1) {
        const before = structuredClone(runner.session);
        const result = runner.step();
        if (result.status === "boundary") {
            assert.equal(result.error.code, "APK_ROUTE_DYNAMIC_OPTION_UNRESOLVED");
            assert.deepEqual(runner.session, before);
            return;
        }
    }
    assert.fail("expected a typed customHandler boundary");
});
