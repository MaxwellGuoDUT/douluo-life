#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { APK_ANALYSIS_ROOT, APK_SHA256, requireApkSha256 } from "./apk-provenance.mjs";

const ROOT = process.cwd();
const CHECK_ONLY = process.argv.includes("--check");
const MODULE_PATH = `${APK_ANALYSIS_ROOT}/derived/pretty/human-foundation-CduvzjjO.js`;
const DOULUO1_MODULE_PATH = `${APK_ANALYSIS_ROOT}/derived/pretty/douluo1-pack-C6xEgEus.js`;
const SOURCE_REPO_ROOT = fs.existsSync(path.join(ROOT, APK_ANALYSIS_ROOT))
    ? ROOT
    : path.join(path.dirname(ROOT), "douluo-life");
const SOURCE_PATH = path.join(SOURCE_REPO_ROOT, ...MODULE_PATH.split("/"));
const DOULUO1_MODULE_SOURCE_PATH = path.join(SOURCE_REPO_ROOT, ...DOULUO1_MODULE_PATH.split("/"));
const ROUTE_GRAPH_PATH = path.join(ROOT, "data", "apk-canonical", "catalogs", "route-graph.douluo1.json");
const TARGET_PATH = path.join(ROOT, "data", "apk-canonical", "catalogs", "followup-prepare-runtime-evidence.json");
const EXPECTED_SOURCE_MODULE_SHA256 = "0AABF5E741403FF75BB0192D2661A28179612D095A49C67E03F7E8B46B77EC99";
const EXPECTED_DOULUO1_MODULE_SHA256 = "CD025DBAF024BCCD90B4601B3DAE0850DBE7907CEC9F38AA0ED40D64E3C3E166";
const SOUL_BONE_POOL_ID = "ce286ca9-296f-471c-8f4f-701b9c7f6169";
const QUALITIES = new Set(["ordinary", "top", "pure-dragon", "earth-dragon"]);

function fail(message, details = null) {
    const suffix = details ? `\n${JSON.stringify(details, null, 2)}` : "";
    throw new Error(`${message}${suffix}`);
}

function sha256File(filePath) {
    return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex").toUpperCase();
}

function relativePath(filePath) {
    return path.relative(ROOT, filePath).replaceAll(path.sep, "/");
}

function extractExpression(source, marker, opening) {
    const markerIndex = source.indexOf(marker);
    if (markerIndex < 0) fail(`Static source marker not found: ${marker}`);
    const start = source.indexOf(opening, markerIndex + marker.length);
    if (start < 0) fail(`Static source expression start not found: ${marker}`);
    const closing = { "[": "]", "{": "}", "(": ")" }[opening];
    let depth = 0;
    let quote = null;
    let escaped = false;
    for (let index = start; index < source.length; index += 1) {
        const character = source[index];
        if (quote) {
            if (escaped) escaped = false;
            else if (character === "\\") escaped = true;
            else if (character === quote) quote = null;
            continue;
        }
        if (["\"", "'", "`"].includes(character)) { quote = character; continue; }
        if (character === opening) depth += 1;
        if (character === closing && --depth === 0) return source.slice(start, index + 1);
    }
    fail(`Static source expression was not closed: ${marker}`);
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
    const douluo1ModuleSha256 = sha256File(DOULUO1_MODULE_SOURCE_PATH);
    if (moduleSha256 !== EXPECTED_SOURCE_MODULE_SHA256) fail(`Source handler module SHA-256 mismatch: ${moduleSha256}`);
    if (douluo1ModuleSha256 !== EXPECTED_DOULUO1_MODULE_SHA256) fail(`douluo1 module SHA-256 mismatch: ${douluo1ModuleSha256}`);

    const sourceText = fs.readFileSync(SOURCE_PATH, "utf8");
    if (!sourceText.includes("function hi(e)")
        || !sourceText.includes("type: \"soulBone\"")
        || !sourceText.includes("years: e.soulBoneYears")
        || !sourceText.includes("quality: e.soulBoneQuality")
        || !sourceText.includes("prepareSoulBonePart({ state: e })")
        || !sourceText.includes("addPendingSoulBone({ state: e, option: t })")) {
        fail("Fixed follow-up prepare handler semantics changed.");
    }
    const sourceRules = vm.runInNewContext(
        `(${extractExpression(sourceText, "const ci =", "[")})`,
        {},
        { timeout: 2000 }
    ).filter(rule => rule?.target === "soul-bone");
    const sourceByKey = new Map(sourceRules.map(rule => [`${rule.poolId}:${rule.optionId}`, rule]));
    if (sourceByKey.size !== sourceRules.length) fail("Source follow-up mapping contains duplicate scoped keys.");

    const routeGraph = JSON.parse(fs.readFileSync(ROUTE_GRAPH_PATH, "utf8"));
    const pack = routeGraph?.pack;
    if (pack?.id !== "douluo1" || pack.sourceModuleSha256 !== EXPECTED_DOULUO1_MODULE_SHA256) {
        fail("Canonical douluo1 route graph identity changed.");
    }
    const records = [];
    for (const pool of pack.pools ?? []) {
        for (const option of pool.options ?? []) {
            for (const [followUpIndex, followUp] of (option.route?.followUps ?? []).entries()) {
                if (!followUp.prepare) continue;
                const key = `${pool.id}:${option.id}`;
                const source = sourceByKey.get(key);
                const expectedRequirements = Number.isFinite(source?.combatThreshold)
                    ? [{ type: "combatPowerAtLeast", value: source.combatThreshold }]
                    : [];
                const exact = source
                    && source.target === "soul-bone"
                    && source.count === followUp.count
                    && source.reason === followUp.reason
                    && source.soulBoneYears === followUp.prepare.years
                    && source.soulBoneQuality === followUp.prepare.quality
                    && followUp.targetPoolId === SOUL_BONE_POOL_ID
                    && JSON.stringify(expectedRequirements) === JSON.stringify(followUp.requirements ?? []);
                if (!exact) fail(`Route/source follow-up mapping mismatch: ${key}:${followUpIndex}`, { source, followUp });
                if (followUp.prepare.type !== "soulBone"
                    || !Number.isInteger(followUp.prepare.years)
                    || followUp.prepare.years <= 0
                    || !QUALITIES.has(followUp.prepare.quality)) {
                    fail(`Invalid prepare payload: ${key}:${followUpIndex}`, followUp.prepare);
                }
                records.push({
                    sourcePoolId: pool.id,
                    sourceOptionId: option.id,
                    followUpIndex,
                    targetPoolId: followUp.targetPoolId,
                    count: followUp.count,
                    reason: followUp.reason,
                    requirements: followUp.requirements ?? [],
                    prepare: followUp.prepare,
                    sourceRefs: [{
                        modulePath: MODULE_PATH,
                        ruleTable: "ci",
                        bridgeFunction: "hi",
                        targetFunction: "si",
                        handlerAction: "prepareSoulBonePart",
                        commitHandler: "addPendingSoulBone",
                        sourceRuleLine: lineOf(sourceText, `optionId: \"${option.id}\"`)
                    }]
                });
            }
        }
    }
    records.sort((left, right) => (
        `${left.sourcePoolId}:${left.sourceOptionId}:${String(left.followUpIndex).padStart(3, "0")}`
            .localeCompare(`${right.sourcePoolId}:${right.sourceOptionId}:${String(right.followUpIndex).padStart(3, "0")}`)
    ));
    const keys = records.map(record => `${record.sourcePoolId}:${record.sourceOptionId}:${record.followUpIndex}`);
    if (records.length !== 131 || new Set(keys).size !== 131) fail("Expected exactly 131 unique route prepare records.");
    const combinations = new Set(records.map(record => `${record.prepare.years}:${record.prepare.quality}`));
    if (combinations.size !== 50) fail(`Expected 50 prepare combinations, found ${combinations.size}.`);
    const qualityCounts = Object.fromEntries([...QUALITIES].sort().map(quality => [
        quality,
        records.filter(record => record.prepare.quality === quality).length
    ]));
    if (Object.values(qualityCounts).some(count => count === 0)) fail("All four source qualities must be represented.");
    return {
        schemaVersion: "apk-followup-prepare-evidence/1.0",
        status: "source-verified",
        source: {
            apkSha256: APK_SHA256,
            apkPath: relativePath(apkPath),
            modulePath: MODULE_PATH,
            moduleSha256,
            douluo1ModulePath: DOULUO1_MODULE_PATH,
            douluo1ModuleSha256,
            routeGraphPath: "data/apk-canonical/catalogs/route-graph.douluo1.json",
            routeGraphSha256: sha256File(ROUTE_GRAPH_PATH),
            handlerIds: ["prepareSoulBonePart", "addPendingSoulBone"],
            extractionMode: "static_source_mapping_only"
        },
        records,
        summary: {
            recordCount: records.length,
            uniquePrepareCount: combinations.size,
            sourceRuleCount: sourceRules.length,
            qualityCounts
        }
    };
}

const evidence = buildEvidence();
const serialized = `${JSON.stringify(evidence, null, 2)}\n`;
if (CHECK_ONLY) {
    if (!fs.existsSync(TARGET_PATH) || fs.readFileSync(TARGET_PATH, "utf8") !== serialized) {
        fail(`Generated evidence is stale: ${relativePath(TARGET_PATH)}`);
    }
} else {
    fs.mkdirSync(path.dirname(TARGET_PATH), { recursive: true });
    fs.writeFileSync(TARGET_PATH, serialized, "utf8");
}
process.stdout.write(`${JSON.stringify({
    status: "pass",
    mode: CHECK_ONLY ? "check" : "write",
    target: relativePath(TARGET_PATH),
    targetSha256: sha256File(TARGET_PATH),
    recordCount: evidence.summary.recordCount,
    uniquePrepareCount: evidence.summary.uniquePrepareCount,
    qualityCounts: evidence.summary.qualityCounts
}, null, 2)}\n`);
