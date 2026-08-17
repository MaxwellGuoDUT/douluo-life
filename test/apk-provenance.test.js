import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const EXPECTED_APK_SHA256 = "E4FB340EF0DAD857A018E2F06982D32623BDD683B22BD44230A2257C35DAA11C";
const EXPECTED_PREFIX = EXPECTED_APK_SHA256.slice(0, 8);
const ROOT = process.cwd();

function readJson(relativePath) {
    return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}

test("APK provenance manifest, policy, package index, route graph and runtime evidence share one root SHA", () => {
    const manifest = readJson("outputs/parallel-prep-2026-08-16/APK_PROVENANCE_MANIFEST_2026-08-16.json");
    const policy = readJson("data/apk-canonical/meta/package-policy.json");
    const packageIndex = readJson("data/apk-canonical/package-index.json");
    const routeGraph = readJson("data/apk-canonical/catalogs/route-graph.json");

    assert.equal(manifest.source.sha256, EXPECTED_APK_SHA256);
    assert.equal(manifest.source.sha256DirectoryPrefix, EXPECTED_PREFIX);
    assert.equal(manifest.source.analysisRoot, `apk-analysis/${EXPECTED_PREFIX}`);
    assert.equal(policy.sourceSha256, EXPECTED_APK_SHA256);
    assert.equal(packageIndex.sourceSha256, EXPECTED_APK_SHA256);
    assert.equal(packageIndex.combatPowerEvidence.sourceSha256, EXPECTED_APK_SHA256);
    assert.equal(routeGraph.source.apkSha256, EXPECTED_APK_SHA256);

    const catalogRoot = path.join(ROOT, "data", "apk-canonical", "catalogs");
    const runtimeEvidenceFiles = fs.readdirSync(catalogRoot)
        .filter(fileName => fileName.endsWith("-runtime-evidence.json"))
        .sort();
    assert.ok(runtimeEvidenceFiles.length > 0);
    for (const fileName of runtimeEvidenceFiles) {
        const evidence = readJson(`data/apk-canonical/catalogs/${fileName}`);
        assert.equal(
            evidence.source?.apkSha256,
            EXPECTED_APK_SHA256,
            `${fileName} source.apkSha256`
        );
    }
});

test("APK extractors consume the single provenance constant instead of drifting SHA literals", () => {
    const extractorNames = [
        "extract-apk-combat-power-runtime-evidence.mjs",
        "extract-apk-human-soul-ring-runtime-evidence.mjs",
        "extract-apk-human-soul-ring-species-runtime-evidence.mjs",
        "extract-apk-martial-soul-runtime-evidence.mjs",
        "extract-apk-route-graph.mjs",
        "extract-apk-special-result-runtime-evidence.mjs",
        "generate-apk-canonical-package.mjs"
    ];
    const sourceConstantPath = path.join(
        ROOT,
        "outputs",
        "parallel-prep-2026-08-16",
        "apk-provenance.mjs"
    );
    assert.equal(fs.existsSync(sourceConstantPath), true);
    for (const name of extractorNames) {
        const filePath = path.join(
            ROOT,
            "outputs",
            "parallel-prep-2026-08-16",
            name
        );
        const source = fs.readFileSync(filePath, "utf8");
        assert.match(source, /\.\/apk-provenance\.mjs/u, name);
        assert.doesNotMatch(
            source,
            /(?:APK|SOURCE)_SHA256\s*=\s*["'][0-9A-F]{64}["']/u,
            `${name} contains a private SHA literal`
        );
    }
});

test("APK species evidence records source-verified empty attribute effects", () => {
    const evidence = readJson(
        "data/apk-canonical/catalogs/human-soul-ring-species-runtime-evidence.json"
    );
    const record = evidence.records.find(item => (
        item.poolId === "0141a27b-f784-4830-9ce3-7a1a5fde9ed1"
        && item.optionId === "86a2d7"
    ));
    assert.ok(record);
    assert.equal(record.attributeRuleStatus, "source-verified-no-explicit-attribute-effect");
    assert.deepEqual(record.effects, []);
    assert.deepEqual(record.attributes, []);
    assert.equal(evidence.extraction.noExplicitAttributeEffectRecordCount, 124);
    assert.match(
        evidence.extraction.noExplicitAttributeEffectSemantics,
        /pt\(wt\(poolId, optionId\)\) returns \[\]/u
    );
});
