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
    "00280930-Dd.json"
);
const TARGET_PATH = path.join(
    ROOT,
    "data",
    "apk-canonical",
    "catalogs",
    "human-soul-ring-runtime-evidence.json"
);
const RING_POOL_IDS = [
    "24ab4336-6902-498e-a1fa-e65b616d7154",
    "986c34f4-0e36-49c4-b3cd-3e81ed3b1480",
    "3ba869ca-d2e9-4513-8fcd-6316573c132e",
    "6532a80b-02c2-4d45-a18c-f297c15a54db",
    "1f67adc9-bbb4-4c54-aca9-17e1380feb54",
    "d9df4080-7534-4d55-b9e7-0f4b0fdc5ca8",
    "89532610-bd97-4f6d-9ceb-de9a8e67936e",
    "40c8dd07-5521-4e49-b6ff-ccb256f224a2",
    "4c0d5357-421f-4e34-a878-18c8562587e1",
    "a99c09fe-a29c-4a7e-bb75-51f405bca3a0"
];

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

function extractRule(pool, option) {
    const record = {
        poolId: pool.id,
        optionId: option.id,
        text: option.text ?? option.id,
        wheelLabel: option.wheelLabel ?? option.text ?? option.id,
        sourceWeight: option.weight,
        sourceEnabled: option.enabled !== false,
        ringYears: option.ringYears,
        grantsSoulBone: option.grantsSoulBone === true,
        requiresGodTrial: option.requiresGodTrial === true,
        customHandler: "prepareSoulRing"
    };
    if (option.ringLevelDelta !== undefined) {
        record.ringLevelDelta = option.ringLevelDelta;
    }
    record.requirements = record.requiresGodTrial
        ? [{ type: "hasGodTrial" }]
        : [];
    record.effects = record.ringLevelDelta === undefined
        ? []
        : [{ type: "changeLevel", amount: record.ringLevelDelta }];
    return record;
}

function main() {
    const source = JSON.parse(fs.readFileSync(SOURCE_PATH, "utf8"));
    const pools = (Array.isArray(source) ? source : source.pools ?? [])
        .filter(pool => RING_POOL_IDS.includes(pool.id));
    if (pools.length !== RING_POOL_IDS.length) {
        throw new Error(
            `Expected ${RING_POOL_IDS.length} soul-ring pools, found ${pools.length}.`
        );
    }
    const records = pools.flatMap(pool => (
        (pool.options ?? []).map(option => extractRule(pool, option))
    ));
    if (records.some(record => !Number.isFinite(record.ringYears))) {
        throw new Error("Every soul-ring record must have a numeric ringYears value.");
    }
    const evidence = {
        schemaVersion: "apk-human-soul-ring-evidence/1.0",
        source: {
            apkSha256: APK_SHA256,
        dataset: `${APK_ANALYSIS_ROOT}/derived/static-data/human-foundation-CduvzjjO/00280930-Dd.json`,
            datasetSha256: sha256File(SOURCE_PATH),
        module: `${APK_ANALYSIS_ROOT}/derived/pretty/human-foundation-CduvzjjO.js`,
            customHandler: "prepareSoulRing",
            nextResolver: "selectRingTypeStep",
            sourceFunctions: ["Rt", "de", "Jt", "sn", "$e"]
        },
        extraction: {
            mode: "static_source_mapping_only",
            gameplayExecuted: false,
            poolIds: RING_POOL_IDS,
            poolCount: pools.length,
            recordCount: records.length,
            scope: "douluo1 human soul-ring age pools and the shared secondary-soul-ring pool"
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
