#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { APK_ANALYSIS_ROOT, APK_SHA256, requireApkSha256 } from "./apk-provenance.mjs";

const ROOT = process.cwd();
const CHECK_ONLY = process.argv.includes("--check");
const SOURCE_REPO_ROOT = fs.existsSync(path.join(ROOT, APK_ANALYSIS_ROOT))
    ? ROOT
    : path.join(path.dirname(ROOT), "douluo-life");
const DATASET_PATH = `${APK_ANALYSIS_ROOT}/derived/static-data/human-foundation-CduvzjjO/00280930-Dd.json`;
const MODULE_PATH = `${APK_ANALYSIS_ROOT}/derived/pretty/human-foundation-CduvzjjO.js`;
const SOURCE_PATH = path.join(SOURCE_REPO_ROOT, ...DATASET_PATH.split("/"));
const MODULE_SOURCE_PATH = path.join(SOURCE_REPO_ROOT, ...MODULE_PATH.split("/"));
const ROUTE_GRAPH_PATH = path.join(ROOT, "data", "apk-canonical", "catalogs", "route-graph.douluo1.json");
const TARGET_PATH = path.join(ROOT, "data", "apk-canonical", "catalogs", "human-soul-ring-runtime-evidence.json");
const EXPECTED_DATASET_SHA256 = "03754713DF11A56F431CB0A61695372CDC4D53C23C927636BE625ED5D4CADD05";
const EXPECTED_MODULE_SHA256 = "0AABF5E741403FF75BB0192D2661A28179612D095A49C67E03F7E8B46B77EC99";
const RING_POOL_IDS = [
    "24ab4336-6902-498e-a1fa-e65b616d7154", "986c34f4-0e36-49c4-b3cd-3e81ed3b1480",
    "3ba869ca-d2e9-4513-8fcd-6316573c132e", "6532a80b-02c2-4d45-a18c-f297c15a54db",
    "1f67adc9-bbb4-4c54-aca9-17e1380feb54", "d9df4080-7534-4d55-b9e7-0f4b0fdc5ca8",
    "89532610-bd97-4f6d-9ceb-de9a8e67936e", "40c8dd07-5521-4e49-b6ff-ccb256f224a2",
    "4c0d5357-421f-4e34-a878-18c8562587e1", "a99c09fe-a29c-4a7e-bb75-51f405bca3a0"
];

function fail(message, details = null) {
    throw new Error(`${message}${details ? `\n${JSON.stringify(details, null, 2)}` : ""}`);
}
function sha256File(filePath) {
    return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex").toUpperCase();
}
function relativePath(filePath) { return path.relative(ROOT, filePath).replaceAll(path.sep, "/"); }
function clone(value) { return value === undefined ? undefined : JSON.parse(JSON.stringify(value)); }

function extractExpression(source, marker, opening) {
    const markerIndex = source.indexOf(marker);
    if (markerIndex < 0) fail(`Static source marker not found: ${marker}`);
    const start = source.indexOf(opening, markerIndex + marker.length);
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

function normalizeRule(poolId, option, sourceRefs) {
    if (!Number.isFinite(option.ringYears) || option.ringYears <= 0) {
        fail(`Soul-ring rule has no exact ringYears: ${poolId}:${option.id}`);
    }
    const record = {
        poolId,
        optionId: option.id,
        text: option.text ?? option.id,
        wheelLabel: option.wheelLabel ?? option.text ?? option.id,
        sourceWeight: option.weight,
        sourceEnabled: option.enabled !== false,
        ringYears: option.ringYears,
        grantsSoulBone: option.grantsSoulBone === true,
        requiresGodTrial: option.requiresGodTrial === true,
        customHandler: "prepareSoulRing",
        requirements: option.requiresGodTrial === true ? [{ type: "hasGodTrial" }] : [],
        effects: option.ringLevelDelta === undefined ? [] : [{ type: "changeLevel", amount: option.ringLevelDelta }],
        sourceRefs
    };
    if (option.ringLevelDelta !== undefined) record.ringLevelDelta = option.ringLevelDelta;
    return record;
}

function buildEvidence() {
    const apkPath = fs.readdirSync(SOURCE_REPO_ROOT, { withFileTypes: true })
        .filter(entry => entry.isFile() && entry.name.toLowerCase().endsWith(".apk"))
        .map(entry => path.join(SOURCE_REPO_ROOT, entry.name))
        .find(candidate => sha256File(candidate) === APK_SHA256);
    if (!apkPath) fail(`Fixed APK SHA-256 ${APK_SHA256} was not found in ${SOURCE_REPO_ROOT}.`);
    requireApkSha256(sha256File(apkPath), "fixed APK SHA-256");
    const datasetSha256 = sha256File(SOURCE_PATH);
    const moduleSha256 = sha256File(MODULE_SOURCE_PATH);
    if (datasetSha256 !== EXPECTED_DATASET_SHA256) fail(`Soul-ring dataset SHA-256 mismatch: ${datasetSha256}`);
    if (moduleSha256 !== EXPECTED_MODULE_SHA256) fail(`Soul-ring module SHA-256 mismatch: ${moduleSha256}`);

    const source = JSON.parse(fs.readFileSync(SOURCE_PATH, "utf8"));
    const pools = (Array.isArray(source) ? source : source.pools ?? []).filter(pool => RING_POOL_IDS.includes(pool.id));
    if (pools.length !== RING_POOL_IDS.length) fail(`Expected ${RING_POOL_IDS.length} soul-ring pools, found ${pools.length}.`);
    const recordsByKey = new Map();
    for (const pool of pools) for (const option of pool.options ?? []) {
        recordsByKey.set(`${pool.id}:${option.id}`, normalizeRule(pool.id, option, [{
            kind: "exact-dataset-record", path: DATASET_PATH, poolId: pool.id, optionId: option.id
        }]));
    }

    const moduleText = fs.readFileSync(MODULE_SOURCE_PATH, "utf8");
    if (!moduleText.includes("function Rt(e)")
        || !moduleText.includes("fe.get($e(t, a))")
        || !moduleText.includes("Bd[r.id]")
        || !moduleText.includes("y = f ?? w")) {
        fail("Fixed prepareSoulRing scoped mapping semantics changed.");
    }
    const fallback = vm.runInNewContext(`(${extractExpression(moduleText, "Bd =", "{")})`, {}, { timeout: 2000 });
    const routeGraph = JSON.parse(fs.readFileSync(ROUTE_GRAPH_PATH, "utf8"));
    const canonicalPools = (routeGraph?.pack?.pools ?? []).filter(pool => RING_POOL_IDS.includes(pool.id));
    if (canonicalPools.length !== RING_POOL_IDS.length) fail("Canonical route graph does not contain all ten soul-ring pools.");
    const canonicalByOptionId = new Map();
    for (const pool of canonicalPools) for (const option of pool.options ?? []) {
        const values = canonicalByOptionId.get(option.id) ?? [];
        values.push({ poolId: pool.id, option });
        canonicalByOptionId.set(option.id, values);
    }
    for (const [optionId, rule] of Object.entries(fallback)) {
        const candidates = canonicalByOptionId.get(optionId) ?? [];
        if (candidates.length !== 1) fail(`Fallback soul-ring mapping is not scoped uniquely: ${optionId}`, candidates);
        const { poolId, option } = candidates[0];
        const key = `${poolId}:${optionId}`;
        const fallbackRecord = normalizeRule(poolId, { ...clone(option.source ?? option), ...clone(rule), id: optionId }, [{
            kind: "exact-module-fallback", path: MODULE_PATH, map: "Bd",
            scopedLookup: "fe.get(poolId:optionId) ?? Bd[optionId]", handler: "prepareSoulRing"
        }]);
        const existing = recordsByKey.get(key);
        if (existing) {
            for (const field of ["ringYears", "grantsSoulBone", "requiresGodTrial", "ringLevelDelta"]) {
                if (!Object.is(existing[field], fallbackRecord[field])) {
                    fail(`Conflicting soul-ring source mapping: ${key}:${field}`, { existing, fallback: fallbackRecord });
                }
            }
            existing.sourceRefs.push(...fallbackRecord.sourceRefs);
        } else recordsByKey.set(key, fallbackRecord);
    }

    const canonicalKeys = canonicalPools.flatMap(pool => (pool.options ?? []).map(option => `${pool.id}:${option.id}`));
    const missing = canonicalKeys.filter(key => !recordsByKey.has(key));
    if (missing.length > 0) fail("Canonical prepareSoulRing evidence is incomplete.", missing);
    const records = [...recordsByKey.values()].sort((left, right) => `${left.poolId}:${left.optionId}`.localeCompare(`${right.poolId}:${right.optionId}`));
    const knownDay23Mappings = Object.fromEntries(["7143b4", "505d78", "6df424", "94604a"].map(optionId => {
        const record = records.find(candidate => candidate.optionId === optionId);
        if (!record) fail(`Known Day23 soul-ring mapping is absent: ${optionId}`);
        return [optionId, { poolId: record.poolId, ringYears: record.ringYears,
            grantsSoulBone: record.grantsSoulBone, requiresGodTrial: record.requiresGodTrial }];
    }));
    return {
        schemaVersion: "apk-human-soul-ring-evidence/1.0",
        status: "source-verified-complete",
        source: {
            apkSha256: APK_SHA256, apkPath: relativePath(apkPath), dataset: DATASET_PATH,
            datasetSha256, module: MODULE_PATH, moduleSha256, customHandler: "prepareSoulRing",
            nextResolver: "selectRingTypeStep", sourceFunctions: ["Rt", "de", "Jt", "sn", "$e", "gn"],
            extractionMode: "exact_dataset_plus_exact_module_fallback"
        },
        extraction: {
            poolIds: [...RING_POOL_IDS], poolCount: RING_POOL_IDS.length,
            primaryRecordCount: pools.reduce((count, pool) => count + (pool.options?.length ?? 0), 0),
            fallbackRecordCount: Object.keys(fallback).length, recordCount: records.length,
            canonicalRouteOptionCount: canonicalKeys.length, canonicalCompleteness: true
        },
        knownDay23Mappings,
        records
    };
}

const evidence = buildEvidence();
const serialized = `${JSON.stringify(evidence, null, 2)}\n`;
if (CHECK_ONLY) {
    if (!fs.existsSync(TARGET_PATH) || fs.readFileSync(TARGET_PATH, "utf8") !== serialized) fail(`Generated evidence is stale: ${relativePath(TARGET_PATH)}`);
} else {
    fs.mkdirSync(path.dirname(TARGET_PATH), { recursive: true });
    fs.writeFileSync(TARGET_PATH, serialized, "utf8");
}
process.stdout.write(`${JSON.stringify({ status: "pass", mode: CHECK_ONLY ? "check" : "write",
    target: relativePath(TARGET_PATH), targetSha256: sha256File(TARGET_PATH),
    poolCount: evidence.extraction.poolCount, recordCount: evidence.records.length,
    canonicalRouteOptionCount: evidence.extraction.canonicalRouteOptionCount,
    knownDay23Mappings: evidence.knownDay23Mappings }, null, 2)}\n`);
