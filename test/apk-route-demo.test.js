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
    assert.match(html, /id="apkRouteDemo"/u);
    assert.match(html, /js\/apk-route-demo-app\.js/u);
    assert.match(app, /APK route graph/u);
    assert.match(app, /createApkRouteContentIndex/u);
    assert.match(app, /renderBoundary/u);
});
