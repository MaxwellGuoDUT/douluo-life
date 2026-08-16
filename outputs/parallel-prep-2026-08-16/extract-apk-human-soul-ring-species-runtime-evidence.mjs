#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const ROOT = process.cwd();
const SOURCE_PATH = path.join(
    ROOT,
    "apk-analysis",
    "E4FB340E",
    "derived",
    "pretty",
    "human-foundation-CduvzjjO.js"
);
const ROUTE_GRAPH_PATH = path.join(
    ROOT,
    "data",
    "apk-canonical",
    "catalogs",
    "route-graph.json"
);
const TARGET_PATH = path.join(
    ROOT,
    "data",
    "apk-canonical",
    "catalogs",
    "human-soul-ring-species-runtime-evidence.json"
);
const APK_SHA256 = "E4FB340EF0DAD857A018E2F06982D32623BDD683B22BD44230A2257C35DAA11C";

function sha256File(filePath) {
    return crypto
        .createHash("sha256")
        .update(fs.readFileSync(filePath))
        .digest("hex")
        .toUpperCase();
}

function fail(message) {
    throw new Error(message);
}

function extractExpression(source, marker, opening) {
    const markerIndex = source.indexOf(marker);
    if (markerIndex < 0) fail(`Static source marker not found: ${marker}`);
    const start = source.indexOf(opening, markerIndex + marker.length);
    if (start < 0) fail(`Static source expression start not found: ${marker}`);
    const closingByOpening = { "[": "]", "{": "}", "(": ")" };
    const closing = closingByOpening[opening];
    let depth = 0;
    let quote = null;
    let escaped = false;
    let lineComment = false;
    let blockComment = false;
    for (let index = start; index < source.length; index += 1) {
        const character = source[index];
        const next = source[index + 1];
        if (lineComment) {
            if (character === "\n") lineComment = false;
            continue;
        }
        if (blockComment) {
            if (character === "*" && next === "/") {
                blockComment = false;
                index += 1;
            }
            continue;
        }
        if (quote) {
            if (escaped) escaped = false;
            else if (character === "\\") escaped = true;
            else if (character === quote) quote = null;
            continue;
        }
        if (character === "/" && next === "/") {
            lineComment = true;
            index += 1;
            continue;
        }
        if (character === "/" && next === "*") {
            blockComment = true;
            index += 1;
            continue;
        }
        if (["\"", "'", "`"].includes(character)) {
            quote = character;
            continue;
        }
        if (character === opening) depth += 1;
        else if (character === closing) {
            depth -= 1;
            if (depth === 0) return source.slice(start, index + 1);
        }
    }
    fail(`Static source expression was not closed: ${marker}`);
}

function evaluate(expression) {
    return vm.runInNewContext(`(${expression})`, {}, { timeout: 2000 });
}

function sourceEffects(record) {
    return (record.attributes ?? []).map(attribute => ({
        type: "ensureHumanElementLevel",
        elementId: attribute.elementId,
        level: attribute.stage
    }));
}

function main() {
    const sourceText = fs.readFileSync(SOURCE_PATH, "utf8");
    const rules = evaluate(extractExpression(sourceText, "const $a =", "["));
    const graph = JSON.parse(fs.readFileSync(ROUTE_GRAPH_PATH, "utf8"));
    const pack = graph.packs.find(candidate => candidate.id === "douluo1");
    if (!pack) fail("douluo1 route pack is missing.");
    const routeKeys = new Set();
    for (const pool of pack.pools) {
        for (const option of pool.options ?? []) {
            if (option.source?.customHandler === "finalizeSoulRingSpecies") {
                routeKeys.add(`${pool.id}:${option.id}`);
            }
        }
    }
    const records = rules.map(rule => ({
        ...rule,
        effects: sourceEffects(rule),
        routeGraphMatch: routeKeys.has(`${rule.poolId}:${rule.optionId}`)
    }));
    const evidence = {
        schemaVersion: "apk-human-soul-ring-species-evidence/1.0",
        source: {
            apkSha256: APK_SHA256,
            module: "apk-analysis/E4FB340E/derived/pretty/human-foundation-CduvzjjO.js",
            moduleSha256: sha256File(SOURCE_PATH),
            staticExpression: "const $a",
            sourceFunctions: ["wt", "pt", "de", "finalizeSoulRingSpecies"]
        },
        extraction: {
            mode: "static_source_mapping_only",
            gameplayExecuted: false,
            packId: "douluo1",
            customHandler: "finalizeSoulRingSpecies",
            recordCount: records.length,
            routeGraphMatchedRecordCount: records.filter(record => record.routeGraphMatch).length,
            routeGraphUnmatchedRecordCount: records.filter(record => !record.routeGraphMatch).length,
            scope: "APK shared soul-ring species attribute rules and typed effects"
        },
        records
    };
    fs.mkdirSync(path.dirname(TARGET_PATH), { recursive: true });
    fs.writeFileSync(TARGET_PATH, `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
    process.stdout.write(JSON.stringify({
        target: path.relative(ROOT, TARGET_PATH).replaceAll(path.sep, "/"),
        targetSha256: sha256File(TARGET_PATH),
        recordCount: records.length,
        routeGraphMatchedRecordCount: evidence.extraction.routeGraphMatchedRecordCount,
        bytes: fs.statSync(TARGET_PATH).size
    }, null, 2) + "\n");
}

main();
