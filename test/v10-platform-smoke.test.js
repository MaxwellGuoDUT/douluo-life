import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import {
    createV10ContentLoader,
    V10ContentError
} from "../js/v10-content-loader.js";
import {
    createV10LifeRunner,
    V10RuntimeBoundary
} from "../js/v10-life-runner.js";

function response(value, status = 200) {
    return {
        ok: status >= 200 && status < 300,
        status,
        async json() { return value; }
    };
}

test("V1 loader fetches the manifest once and loads pack details lazily", async () => {
    const calls = [];
    const records = new Map([
        ["./data/v10/source-manifest.json", {
            schemaVersion: "v10-source-manifest/1.0",
            packs: [{
                id: "douluo1",
                dynamicInventory: "data/v10/dynamic-inventory.douluo1.json",
                terminalInventory: "data/v10/terminal-inventory.douluo1.json",
                routeGraph: "data/v10/route-graph.douluo1.json"
            }]
        }],
        ["./data/v10/dynamic-inventory.douluo1.json", { packId: "douluo1" }],
        ["./data/v10/terminal-inventory.douluo1.json", { packId: "douluo1" }]
    ]);
    const loader = createV10ContentLoader({
        fetchImpl: async url => {
            calls.push(url);
            return records.has(url) ? response(records.get(url)) : response(null, 404);
        }
    });
    await loader.getManifest();
    await loader.getPackDetails("douluo1");
    assert.deepEqual(calls, [
        "./data/v10/source-manifest.json",
        "./data/v10/dynamic-inventory.douluo1.json",
        "./data/v10/terminal-inventory.douluo1.json"
    ]);
});

test("V1 loader rejects unknown packs with a typed error", async () => {
    const loader = createV10ContentLoader({
        fetchImpl: async () => response({
            schemaVersion: "v10-source-manifest/1.0",
            packs: []
        })
    });
    await assert.rejects(
        loader.getPack("unknown"),
        error => error instanceof V10ContentError && error.code === "PACK_NOT_FOUND"
    );
});

test("V1 loader imports the Douluo I source runtime and foundation lazily", async () => {
    const imports = [];
    const loader = createV10ContentLoader({
        fetchImpl: async () => response({
            schemaVersion: "v10-source-manifest/1.0",
            packs: [{
                id: "douluo1",
                sourceRuntimeModule: "data/v10/source-runtime/pack.js",
                sourceRuntimeFoundation: "data/v10/source-runtime/foundation.js"
            }]
        }),
        moduleBaseUrl: "https://local.test/douluo-life/",
        moduleImport: async url => {
            imports.push(url);
            return url.endsWith("pack.js")
                ? { default: { manifest: { id: "douluo1" }, game: {} } }
                : { marker: "foundation" };
        }
    });
    const runtime = await loader.getSourceRuntime("douluo1");
    assert.equal(runtime.manifest.id, "douluo1");
    assert.equal(runtime.foundation.marker, "foundation");
    assert.deepEqual(imports, [
        "https://local.test/douluo-life/data/v10/source-runtime/pack.js",
        "https://local.test/douluo-life/data/v10/source-runtime/foundation.js"
    ]);
});

test("Douluo II rejects a route absent from its own source manifest", async () => {
    const runner = createV10LifeRunner({
        contentLoader: {
            getHumanRuntimeContent() { assert.fail("unexpected Douluo I load"); },
            async getSourceRuntime() { return { manifest: { supportedRoutes: ["human", "beast"] } }; },
            async getRouteGraph() { return { packId: "douluo2" }; }
        }
    });
    await assert.rejects(
        runner.start("douluo2", { route: "unknown" }),
        error => error instanceof V10RuntimeBoundary
            && error.code === "ROUTE_NOT_SUPPORTED"
    );
});

test("V1 HTML is a static Pages entry with no cloud or account dependency", () => {
    const html = fs.readFileSync(path.join(process.cwd(), "index.html"), "utf8");
    const app = fs.readFileSync(path.join(process.cwd(), "js", "v10-app.js"), "utf8");
    const legacyEntry = fs.readFileSync(path.join(process.cwd(), "v10.html"), "utf8");
    assert.doesNotMatch(html, /http-equiv="refresh"/u);
    assert.match(legacyEntry, /http-equiv="refresh" content="0; url=\.\/"/u);
    assert.match(legacyEntry, /href="\.\/"/u);
    assert.doesNotMatch(legacyEntry, /js\/v10-app\.js/u);
    assert.match(html, /js\/v10-app\.js/u);
    assert.match(html, /纯前端版本/u);
    assert.match(html, /人类人生/u);
    assert.match(app, /开始魂兽人生/u);
    assert.match(app, /human-result.*等待抽取/u);
    assert.match(html, /物种/u);
    assert.match(html, /极速推进/u);
    assert.match(html, /id="human-reroll"[^>]*disabled[^>]*>撤销并重抽/u);
    assert.match(html, /重抽仍可能得到相同结果/u);
    assert.match(html, /每批最多200次/u);
    assert.match(html, /<h1>斗罗大陆<\/h1>/u);
    assert.ok(html.indexOf('id="human-age"') < html.indexOf('id="human-step"'));
    assert.ok(html.indexOf('id="human-step"') < html.indexOf('id="human-terminal"'));
    assert.ok(html.indexOf('id="human-wheel-title"') < html.indexOf('id="human-result"'));
    assert.equal((html.match(/<dialog /gu) ?? []).length, 3);
    for (const id of ['human-soul-bones', 'human-attributes', 'human-domains', 'human-martial-souls']) {
        assert.match(html, new RegExp(`id="${id}"`, 'u'));
    }
    assert.match(html, /id="character-menu-panel"[^>]*hidden/u);
    assert.match(html, /id="character-toggle"[^>]*aria-expanded="false"/u);
    assert.match(html, /id="route-toggle"[^>]*aria-controls="pack-list"/u);
    assert.equal((html.match(/<details><summary>/gu) ?? []).length, 9);
    assert.match(html, /id="runtime-diagnostics"/u);
    assert.doesNotMatch(html, /oidc|postgres|cloud sync/iu);
});
