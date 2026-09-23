import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const ROOT = process.cwd();
const DATA_ROOT = path.join(ROOT, "data", "v10");

function readJson(fileName) {
    return JSON.parse(fs.readFileSync(path.join(DATA_ROOT, fileName), "utf8"));
}

test("V1 source manifest exposes the two authoritative source packs", () => {
    const manifest = readJson("source-manifest.json");
    assert.equal(manifest.schemaVersion, "v10-source-manifest/1.0");
    assert.deepEqual(manifest.packs.map(pack => pack.id), ["douluo1", "douluo2"]);
    assert.deepEqual(manifest.packs[0].supportedRoutes, ["human", "beast", "transformed"]);
    assert.deepEqual(manifest.packs[1].supportedRoutes, ["human", "beast"]);
    assert.equal(manifest.source.rawApkRequiredAtRuntime, false);
    assert.doesNotMatch(JSON.stringify(manifest), /[A-Z]:\\/u);
    assert.equal(
        manifest.packs[0].sourceRuntimeModule,
        "data/v10/source-runtime/douluo1-pack-C6xEgEus.js"
    );
    assert.equal(
        manifest.packs[0].sourceRuntimeFoundation,
        "data/v10/source-runtime/human-foundation-CduvzjjO.js"
    );
    assert.equal(manifest.packs[1].sourceRuntimeModule, "data/v10/source-runtime/douluo2-pack-BsEUb2l9.js");
    for (const fileName of [
        "App-qyLEl8t4.js",
        "human-foundation-CduvzjjO.js",
        "index-C02WUcAm.js",
        "douluo1-pack-C6xEgEus.js",
        "douluo2-pack-BsEUb2l9.js",
        "author-revision-aliases-DpeVpXl5.js",
        "index-CfLpLgGT.js"
    ]) {
        assert.ok(fs.existsSync(path.join(DATA_ROOT, "source-runtime", fileName)));
    }
});

for (const packId of ["douluo1", "douluo2"]) {
    test(`${packId} route shard and inventories agree`, () => {
        const graph = readJson(`route-graph.${packId}.json`);
        const dynamic = readJson(`dynamic-inventory.${packId}.json`);
        const terminal = readJson(`terminal-inventory.${packId}.json`);
        assert.equal(graph.schemaVersion, "v10-route-graph-shard/1.0");
        assert.equal(graph.packId, packId);
        assert.equal(graph.pack.flows.length, graph.pack.summary.flows);
        assert.equal(graph.pack.pools.length, graph.pack.summary.pools);
        assert.equal(
            graph.pack.pools.reduce((sum, pool) => sum + pool.options.length, 0),
            graph.pack.summary.options
        );
        assert.equal(dynamic.summary.actions, dynamic.registries.actions.length);
        assert.equal(dynamic.summary.resolvers, dynamic.registries.resolvers.length);
        assert.equal(
            dynamic.summary.customHandlers,
            dynamic.registries.customHandlers.length
        );
        assert.ok(dynamic.effects.types.length > 0);
        assert.ok(terminal.explicit.every(item => (
            item.kind === "death" || item.kind === "ending"
        )));
        assert.equal(
            terminal.explicitCount,
            terminal.explicit.reduce((sum, item) => sum + item.count, 0)
        );
        assert.equal(terminal.typedBoundary.status, "partial");
    });
}

test("Douluo I restores only the exact land-finale source closure", () => {
    const graph = readJson("route-graph.douluo1.json");
    assert.deepEqual(graph.source.recoveredClosures, [{
        id: "beast-land-finale",
        reason: "final source export filters a referenced display pool",
        flowId: "beastLandFinal",
        poolId: "d39bb131-6949-4a46-9733-19d0335f668c"
    }]);
    assert.equal(graph.pack.summary.flows, 914);
    assert.equal(graph.pack.summary.pools, 758);
    assert.equal(graph.pack.summary.options, 6456);
    assert.equal(graph.pack.summary.actions, 47);
    assert.equal(graph.pack.summary.resolvers, 11);
    assert.equal(graph.pack.summary.customHandlers, 53);
    assert.equal(graph.pack.flows.filter(flow => flow.id === "beastLandFinal").length, 1);
    const pool = graph.pack.pools.find(item => (
        item.id === "d39bb131-6949-4a46-9733-19d0335f668c"
    ));
    assert.equal(pool.options.length, 7);
    assert.ok(pool.options.every(option => (
        option.route.customHandler.value === "resolveBeastLandFinal"
    )));
});

test("source generator check is current when the restored vault is present", () => {
    const defaultVault = path.join(
        path.dirname(ROOT),
        "douluo-life-source-vault",
        "5ba6453",
        "apk-analysis",
        "E4FB340E"
    );
    if (!fs.existsSync(defaultVault)) return;
    const result = spawnSync(
        process.execPath,
        [path.join(ROOT, "tools", "v10", "generate-source-inventory.mjs"), "--check"],
        { cwd: ROOT, encoding: "utf8" }
    );
    assert.equal(result.status, 0, result.stderr || result.stdout);
});
