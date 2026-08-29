#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { APK_ANALYSIS_ROOT, APK_SHA256, requireApkSha256 } from "./apk-provenance.mjs";

const ROOT = process.cwd();
const SOURCE_MODULE = `${APK_ANALYSIS_ROOT}/derived/pretty/douluo1-pack-C6xEgEus.js`;
const MAPPING_MODULE = `${APK_ANALYSIS_ROOT}/derived/pretty/App-qyLEl8t4.js`;
const SOURCE_REPO_ROOT = fs.existsSync(path.join(ROOT, APK_ANALYSIS_ROOT))
    ? ROOT
    : path.join(path.dirname(ROOT), "douluo-life");
const SOURCE_PATH = path.join(SOURCE_REPO_ROOT, ...SOURCE_MODULE.split("/"));
const MAPPING_PATH = path.join(SOURCE_REPO_ROOT, ...MAPPING_MODULE.split("/"));
const ROUTE_GRAPH_PATH = path.join(ROOT, "data", "apk-canonical", "catalogs", "route-graph.douluo1.json");
const TARGET_PATH = path.join(ROOT, "data", "apk-canonical", "catalogs", "official-beast-element-runtime-evidence.json");
const EXPECTED_MODULE_SHA256 = "CD025DBAF024BCCD90B4601B3DAE0850DBE7907CEC9F38AA0ED40D64E3C3E166";
const CHECK_ONLY = process.argv.includes("--check");

function fail(message) { throw new Error(message); }
function sha256File(filePath) {
    return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex").toUpperCase();
}
function relativePath(filePath) { return path.relative(ROOT, filePath).replaceAll(path.sep, "/"); }

function extractExpression(source, marker, opening) {
    const markerIndex = source.indexOf(marker);
    if (markerIndex < 0) fail(`Static source marker not found: ${marker}`);
    const start = source.indexOf(opening, markerIndex + marker.length);
    if (start < 0) fail(`Static source expression start not found: ${marker}`);
    const closing = { "[": "]", "{": "}", "(": ")" }[opening];
    let depth = 0;
    let quote = null;
    let escaped = false;
    let lineComment = false;
    let blockComment = false;
    for (let index = start; index < source.length; index += 1) {
        const character = source[index];
        const next = source[index + 1];
        if (lineComment) { if (character === "\n") lineComment = false; continue; }
        if (blockComment) {
            if (character === "*" && next === "/") { blockComment = false; index += 1; }
            continue;
        }
        if (quote) {
            if (escaped) escaped = false;
            else if (character === "\\") escaped = true;
            else if (character === quote) quote = null;
            continue;
        }
        if (character === "/" && next === "/") { lineComment = true; index += 1; continue; }
        if (character === "/" && next === "*") { blockComment = true; index += 1; continue; }
        if (["\"", "'", "`"].includes(character)) { quote = character; continue; }
        if (character === opening) depth += 1;
        if (character === closing && --depth === 0) return source.slice(start, index + 1);
    }
    fail(`Static source expression was not closed: ${marker}`);
}

function evaluate(expression, context = {}) {
    return vm.runInNewContext(`(${expression})`, context, { timeout: 2000 });
}
function lineOf(source, marker) {
    const index = source.indexOf(marker);
    return index < 0 ? null : source.slice(0, index).split("\n").length;
}

function buildEvidence() {
    const apkCandidates = fs.readdirSync(SOURCE_REPO_ROOT, { withFileTypes: true })
        .filter(entry => entry.isFile() && entry.name.toLowerCase().endsWith(".apk"))
        .map(entry => path.join(SOURCE_REPO_ROOT, entry.name));
    const apkPath = apkCandidates.find(candidate => sha256File(candidate) === APK_SHA256);
    if (!apkPath) fail(`Fixed APK SHA-256 ${APK_SHA256} was not found in ${SOURCE_REPO_ROOT}.`);
    requireApkSha256(sha256File(apkPath), "fixed APK SHA-256");
    const moduleSha256 = sha256File(SOURCE_PATH);
    if (moduleSha256 !== EXPECTED_MODULE_SHA256) {
        fail(`douluo1 source module SHA-256 mismatch: expected ${EXPECTED_MODULE_SHA256}, got ${moduleSha256}.`);
    }
    const mappingModuleSha256 = sha256File(MAPPING_PATH);
    const sourceText = fs.readFileSync(SOURCE_PATH, "utf8");
    const mappingText = fs.readFileSync(MAPPING_PATH, "utf8");
    if (!sourceText.includes("advanceBeastElement({")
        || !sourceText.includes("t.poolId && Wl(t.poolId, a.id)")
        || !sourceText.includes("e.character.beast")
        || !sourceText.includes("vl(e.character, d)")) {
        fail("Fixed advanceBeastElement handler semantics changed.");
    }
    const elements = evaluate(extractExpression(mappingText, "const ts =", "["));
    const symbols = Object.fromEntries(
        [...mappingText.matchAll(/\b(tu|nu) = "([^"]+)"/gu)].map(match => [match[1], match[2]])
    );
    const mapping = evaluate(extractExpression(mappingText, "iu =", "{"), symbols);
    if (!Array.isArray(elements) || elements.length !== 18 || !mapping || typeof mapping !== "object") {
        fail("Source element mapping table is incomplete.");
    }
    const graph = JSON.parse(fs.readFileSync(ROUTE_GRAPH_PATH, "utf8"));
    const pack = graph?.pack;
    if (pack?.id !== "douluo1") fail("douluo1 route graph shard is missing.");
    const records = [];
    for (const [poolId, optionIds] of Object.entries(mapping)) {
        if (!Array.isArray(optionIds) || optionIds.length !== elements.length) {
            fail(`Source element mapping length mismatch for pool ${poolId}.`);
        }
        const pool = pack.pools.find(candidate => candidate.id === poolId);
        if (!pool) continue;
        const official = (pool.options ?? []).filter(option => (
            option?.source?.customHandler === "douluo1:handler.official-beast.element"
        ));
        if (official.length !== optionIds.length) fail(`Official option count mismatch for pool ${poolId}.`);
        for (const [index, optionId] of optionIds.entries()) {
            const option = pool.options.find(candidate => candidate.id === optionId);
            if (!option || option?.source?.customHandler !== "douluo1:handler.official-beast.element") {
                fail(`Mapped option is not an exact official-beast option: ${poolId}:${optionId}.`);
            }
            const elementId = elements[index];
            if (typeof elementId !== "string" || !elementId.trim()) fail(`Empty element at ${poolId}:${optionId}.`);
            records.push({
                poolId,
                optionId,
                elementId,
                branchPolicy: "beast-state:advanceBeastElement;human-state:advanceHumanElement",
                sourceRef: {
                    handlerLine: lineOf(sourceText, "advanceBeastElement({"),
                    mappingFunction: "Wl",
                    mappingTable: "iu",
                    mappingElementTable: "ts",
                    mappingIndex: index
                }
            });
        }
    }
    records.sort((left, right) => `${left.poolId}:${left.optionId}`.localeCompare(`${right.poolId}:${right.optionId}`));
    const recordKeys = records.map(record => `${record.poolId}:${record.optionId}`);
    if (new Set(recordKeys).size !== recordKeys.length) fail("Duplicate evidence key.");
    return {
        schemaVersion: "apk-official-beast-element-runtime-evidence/1.0",
        status: "source-verified",
        source: {
            apkSha256: APK_SHA256,
            apkPath: relativePath(apkPath),
            modulePath: SOURCE_MODULE,
            moduleSha256,
            handlerId: "advanceBeastElement",
            canonicalHandlerId: "douluo1:handler.official-beast.element",
            extractionMode: "static_source_mapping_only",
            mappingModulePath: MAPPING_MODULE,
            mappingModuleSha256,
            mappingFunction: "Wl"
        },
        records,
        summary: {
            packId: "douluo1",
            poolCount: new Set(records.map(record => record.poolId)).size,
            recordCount: records.length,
            uniqueKeyCount: recordKeys.length,
            sourceHandlerLine: lineOf(sourceText, "advanceBeastElement({")
        }
    };
}

function main() {
    const evidence = buildEvidence();
    const expected = `${JSON.stringify(evidence, null, 2)}\n`;
    if (CHECK_ONLY) {
        if (!fs.existsSync(TARGET_PATH) || fs.readFileSync(TARGET_PATH, "utf8") !== expected) {
            fail(`Generated evidence is stale: ${relativePath(TARGET_PATH)}`);
        }
    } else {
        fs.mkdirSync(path.dirname(TARGET_PATH), { recursive: true });
        fs.writeFileSync(TARGET_PATH, expected, "utf8");
    }
    process.stdout.write(`${JSON.stringify({
        status: "pass",
        mode: CHECK_ONLY ? "check" : "write",
        target: relativePath(TARGET_PATH),
        targetSha256: sha256File(TARGET_PATH),
        moduleSha256: evidence.source.moduleSha256,
        poolCount: evidence.summary.poolCount,
        recordCount: evidence.records.length
    }, null, 2)}\n`);
}

main();
