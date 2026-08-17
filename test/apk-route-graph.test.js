import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const ROUTE_GRAPH_PATH = new URL(
    "../data/apk-canonical/catalogs/route-graph.json",
    import.meta.url
);

function loadRouteGraph() {
    return JSON.parse(fs.readFileSync(ROUTE_GRAPH_PATH, "utf8"));
}

test("APK route graph records source flow, pool, option and dynamic boundaries", () => {
    const graph = loadRouteGraph();
    assert.equal(graph.schemaVersion, "apk-route-graph/1.0");
    assert.equal(graph.source.gameplayExecuted, false);
    assert.equal(graph.source.transitionPolicy.startsWith("exact_string_edges_only"), true);
    assert.deepEqual(
        graph.packs.map(pack => pack.id),
        ["douluo1", "douluo2"]
    );
    assert.equal(graph.diagnostics.count.unresolvedDynamicResolverReferences, 0);
    assert.equal(graph.diagnostics.count.missingExactReferences, 1);
    assert.equal(graph.canonicalEvidence.available, true);
    assert.equal(graph.canonicalEvidence.keysWithFailureEffects > 0, true);
    assert.equal(graph.canonicalEvidence.keysWithSupplementalEffects > 0, true);
    assert.equal(graph.canonicalEvidence.supplementalEffectConflicts, 6);
});

test("APK route graph keeps the formal entry route and exact first transition", () => {
    const graph = loadRouteGraph();
    const douluo1 = graph.packs.find(pack => pack.id === "douluo1");
    const entry = douluo1.flows.find(flow => flow.id === douluo1.entryFlowId);
    assert.equal(entry.route.pool.target, "aa560e1a-db5f-476f-9546-8830fbedee24");
    const pool = douluo1.pools.find(item => item.id === entry.route.pool.target);
    const identity = pool.options.find(option => option.id === "d57aef");
    assert.equal(identity.route.next.value, "douluo1:flow.formal-human.gender");
    assert.equal(identity.route.next.kind, "exact-string");
    assert.equal(identity.route.effects[0].type, "setIdentity");
});

test("APK route graph carries compact source-proven martial soul handler evidence", () => {
    const graph = loadRouteGraph();
    assert.equal(graph.martialSoulRuntimeEvidence.available, true);
    assert.equal(graph.martialSoulRuntimeEvidence.recordCount, 584);
    const douluo1 = graph.packs.find(pack => pack.id === "douluo1");
    const pool = douluo1.pools.find(item => (
        item.id === "49e3abc8-1361-4348-94aa-b23c68a53720"
    ));
    const bodySoul = pool.options.find(option => option.id === "3cb19c");
    assert.deepEqual(bodySoul.martialSoulRuntimeEvidence, {
        status: "source-proven",
        handlerId: "applyHumanMartialSoul",
        operation: "addMartialSoul",
        formalContext: "douluo1:flow.formal-human.martial.<poolId>",
        category: "本体武魂",
        tags: [],
        passives: [],
        effects: [{
            type: "advanceHumanElement",
            elementId: "life",
            amount: 1
        }]
    });
});

test("APK first soul-ring species evidence maps explicit and empty source attributes", () => {
    const evidence = JSON.parse(fs.readFileSync(new URL(
        "../data/apk-canonical/catalogs/human-soul-ring-species-runtime-evidence.json",
        import.meta.url
    ), "utf8"));
    assert.equal(evidence.schemaVersion, "apk-human-soul-ring-species-evidence/1.0");
    assert.equal(evidence.source.apkSha256.length, 64);
    assert.equal(evidence.extraction.gameplayExecuted, false);
    assert.equal(evidence.extraction.recordCount, 231);
    assert.equal(evidence.extraction.routeGraphMatchedRecordCount, 171);
    const titan = evidence.records.find(record => record.optionId === "a28a72");
    assert.deepEqual(titan.effects, [{
        type: "ensureHumanElementLevel",
        elementId: "strength",
        level: 1
    }]);
});
