#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {
    APK_ANALYSIS_ROOT,
    APK_SHA256
} from "./apk-provenance.mjs";

const ROOT = process.cwd();
const SOURCE_PATH = path.join(
    ROOT,
    APK_ANALYSIS_ROOT,
    "derived",
    "static-data",
    "human-foundation-CduvzjjO",
    "01804234-qn.json"
);
const TARGET_PATH = path.join(
    ROOT,
    "data",
    "apk-canonical",
    "catalogs",
    "formal-special-result-runtime-evidence.json"
);

function sha256File(filePath) {
    return crypto
        .createHash("sha256")
        .update(fs.readFileSync(filePath))
        .digest("hex")
        .toUpperCase();
}

function clone(value) {
    return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function optional(record, source, key) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
        record[key] = clone(source[key]);
    }
}

function extractRule(pool, option) {
    const record = {
        poolId: pool.id,
        optionId: option.id,
        requirements: clone(option.requirements ?? []),
        commonEffects: clone(option.commonEffects ?? []),
        effects: clone(option.effects ?? []),
        failureEffects: clone(option.failureEffects ?? []),
        lawCompletionEffects: clone(option.lawCompletionEffects ?? []),
        nextPoolId: option.nextPoolId ?? null
    };
    optional(record, option, "immunity");
    optional(record, option, "combatThreshold");
    optional(record, option, "combatThresholdOperator");
    optional(record, option, "deathThreshold");
    optional(record, option, "completeLawElementId");
    return record;
}

function main() {
    const source = JSON.parse(fs.readFileSync(SOURCE_PATH, "utf8"));
    const records = (source.pools ?? []).flatMap(pool => (
        (pool.options ?? []).map(option => extractRule(pool, option))
    ));
    const evidence = {
        schemaVersion: "apk-formal-special-result-evidence/1.0",
        source: {
            apkSha256: APK_SHA256,
        dataset: `${APK_ANALYSIS_ROOT}/derived/static-data/human-foundation-CduvzjjO/01804234-qn.json`,
            datasetSha256: sha256File(SOURCE_PATH),
        module: `${APK_ANALYSIS_ROOT}/derived/pretty/douluo1-pack-C6xEgEus.js`,
        foundationModule: `${APK_ANALYSIS_ROOT}/derived/pretty/human-foundation-CduvzjjO.js`,
            customHandler: "douluo1:handler.formal-special-result",
            afterResultAction: "douluo1:action.after-formal-special-result",
            sourceFunctions: ["fn", "Xi[Ua]", "an", "tn"]
        },
        extraction: {
            mode: "static_source_mapping_only",
            gameplayExecuted: false,
            poolCount: (source.pools ?? []).length,
            recordCount: records.length,
            scope: "douluo1 formal special-result option rules; combat-total-dependent branches remain explicit runtime boundaries"
        },
        records
    };
    fs.mkdirSync(path.dirname(TARGET_PATH), { recursive: true });
    fs.writeFileSync(TARGET_PATH, `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
    process.stdout.write(JSON.stringify({
        target: path.relative(ROOT, TARGET_PATH).replaceAll(path.sep, "/"),
        targetSha256: sha256File(TARGET_PATH),
        poolCount: evidence.extraction.poolCount,
        recordCount: records.length,
        bytes: fs.statSync(TARGET_PATH).size
    }, null, 2) + "\n");
}

main();
