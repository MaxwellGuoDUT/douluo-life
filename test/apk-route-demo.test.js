import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

test("APK route demo is a separate production surface and exposes the explicit boundary UI", () => {
    const entry = JSON.parse(fs.readFileSync(
        new URL("../data/production-entry.json", import.meta.url),
        "utf8"
    ));
    const html = fs.readFileSync(
        new URL("../apk-route-demo.html", import.meta.url),
        "utf8"
    );
    const app = fs.readFileSync(
        new URL("../js/apk-route-demo-app.js", import.meta.url),
        "utf8"
    );
    assert.equal(entry.routeDemo, "apk-route-demo.html");
    assert.equal(entry.routeRuntime, "js/apk-route-runtime.js");
    assert.equal(entry.routeGraphLoadingPolicy, "pack-shard-first-monolith-fallback");
    assert.equal(entry.releaseScope.channel, "preview");
    assert.equal(entry.releaseScope.typedBoundaryAllowed, true);
    assert.equal(entry.releaseScope.completeRouteClaimAllowed, false);
    assert.deepEqual(entry.releaseScope.publicPreviewPackIds, ["douluo1"]);
    assert.deepEqual(entry.releaseScope.experimentalUnverifiedPackIds, ["douluo2"]);
    assert.deepEqual(
        entry.releaseScope.knownBoundaries.map(boundary => ({
            packId: boundary.packId,
            customHandler: boundary.customHandler,
            verification: boundary.verification
        })),
        [
            {
                packId: "douluo1",
                customHandler: "douluo1:handler.official-beast.element",
                verification: "browser-verified-fixed-seed"
            },
            {
                packId: "douluo2",
                customHandler: "douluo2:handler.human.country",
                verification: "browser-verified-entry-step"
            }
        ]
    );
    assert.match(html, /id="apkRouteDemo"/u);
    assert.match(html, /js\/apk-route-demo-app\.js/u);
    assert.match(app, /APK route graph/u);
    assert.match(app, /createApkRouteContentIndex/u);
    assert.match(app, /renderBoundary/u);
    assert.match(app, /routePackId: packId/u);
    assert.match(app, /点击开始时才加载对应 route shard/u);
    assert.match(app, /公开 preview 仅包含 douluo1/u);
    assert.match(app, /实验\/未验证/u);
});
