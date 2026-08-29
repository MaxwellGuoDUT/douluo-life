#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import {
    APK_SHA256,
    requireApkSha256
} from "./apk-provenance.mjs";

const ROOT = process.cwd();
const OUTPUT_ROOT = path.join(ROOT, "data", "v05-rc");
const CHECK_ONLY = process.argv.includes("--check");
const PACKAGE_VERSION = "v05-rc2/2026-08-29";
const SOURCE_MANIFEST = "outputs/parallel-prep-2026-08-16/APK_PROVENANCE_MANIFEST_2026-08-16.json";
const ARCHIVE_MANIFEST = "data/v2/archive/apk-replaced-2026-08-16/manifest.json";
const APPROVED_ARCHIVE_FILES = Object.freeze([
    Object.freeze({
        originalPath: "data/v2/catalogs/martial-souls.json",
        archivePath: "data/v2/archive/apk-replaced-2026-08-16/catalogs/martial-souls.json"
    }),
    Object.freeze({
        originalPath: "data/v2/config/awakening-probabilities.json",
        archivePath: "data/v2/archive/apk-replaced-2026-08-16/config/awakening-probabilities.json"
    }),
    Object.freeze({
        originalPath: "data/v2/content/age-6-awakening.json",
        archivePath: "data/v2/archive/apk-replaced-2026-08-16/content/age-6-awakening.json"
    })
]);

const ASSETS = Object.freeze({
    routeGraphDouluo1: "data/apk-canonical/catalogs/route-graph.douluo1.json",
    formalSpecialResultEvidence: "data/apk-canonical/catalogs/formal-special-result-runtime-evidence.json",
    humanSoulRingEvidence: "data/apk-canonical/catalogs/human-soul-ring-runtime-evidence.json",
    humanSoulRingSpeciesEvidence: "data/apk-canonical/catalogs/human-soul-ring-species-runtime-evidence.json",
    combatPowerEvidence: "data/apk-canonical/catalogs/combat-power-runtime-evidence.json",
    officialBeastElementEvidence: "data/apk-canonical/catalogs/official-beast-element-runtime-evidence.json",
    supportedDestinies: "data/v05-rc/supported-destinies.json"
});

const BUILD_INPUTS = Object.freeze({
    martialSoulRuntimeEvidence: "data/apk-canonical/catalogs/martial-soul-runtime-evidence.json"
});

function fail(message) {
    throw new Error(message);
}

function absolute(relativePath) {
    return path.join(ROOT, ...relativePath.split("/"));
}

function readJson(relativePath) {
    return JSON.parse(fs.readFileSync(absolute(relativePath), "utf8"));
}

function sha256(relativePath) {
    return crypto.createHash("sha256")
        .update(fs.readFileSync(absolute(relativePath)))
        .digest("hex")
        .toUpperCase();
}

function canonicalTextSha256(relativePath) {
    const text = fs.readFileSync(absolute(relativePath), "utf8").replace(/\r\n/gu, "\n");
    return crypto.createHash("sha256").update(text, "utf8").digest("hex").toUpperCase();
}

function descriptor(relativePath) {
    return {
        path: relativePath,
        sizeBytes: fs.statSync(absolute(relativePath)).size,
        sha256: sha256(relativePath)
    };
}

function sourceSha(document, label) {
    return requireApkSha256(
        document?.source?.apkSha256 ?? document?.sourceSha256,
        `${label} source SHA-256`
    );
}

function validateSources() {
    const provenance = readJson(SOURCE_MANIFEST);
    requireApkSha256(provenance?.source?.sha256, "provenance manifest source SHA-256");

    const routeShard = readJson(ASSETS.routeGraphDouluo1);
    if (routeShard.schemaVersion !== "apk-route-graph-shard/1.0"
        || routeShard.packId !== "douluo1"
        || routeShard.pack?.id !== "douluo1") {
        fail("V0.5 RC requires the single douluo1 route shard.");
    }
    sourceSha(routeShard, "douluo1 route shard");

    for (const [name, relativePath] of Object.entries(ASSETS).slice(1)) {
        const document = readJson(relativePath);
        if (name === "supportedDestinies") {
            if (document.schemaVersion !== "douluo-life-v05-destiny-cohort/1.0"
                || document.packageVersion !== PACKAGE_VERSION
                || document.endpointAge !== 25
                || document.destinies?.length < 12) {
                fail("V0.5 RC requires the generated Day22 destiny cohort.");
            }
        } else {
            sourceSha(document, name);
        }
    }
    sourceSha(
        readJson(BUILD_INPUTS.martialSoulRuntimeEvidence),
        "martial soul runtime evidence"
    );

    const archive = readJson(ARCHIVE_MANIFEST);
    if (archive.schemaVersion !== "production-content-archive/1.0"
        || archive.status !== "archive-only"
        || archive.archivedAt !== "2026-08-16"
        || archive.reason !== "APK owner-authorized migration replaced these files as the active content source."
        || archive.preservationPolicy !== "retain_original_bytes_with_path_mapping") {
        fail("The approved legacy archive manifest semantics changed.");
    }
    if (archive.files?.length !== APPROVED_ARCHIVE_FILES.length) {
        fail("The approved legacy archive file mapping changed.");
    }
    for (const [index, expected] of APPROVED_ARCHIVE_FILES.entries()) {
        const file = archive.files[index];
        if (file.originalPath !== expected.originalPath
            || file.archivePath !== expected.archivePath
            || file.originalPath === file.archivePath) {
            fail(`Archive path mapping changed: ${expected.originalPath}`);
        }
        const actual = canonicalTextSha256(file.archivePath);
        if (actual !== String(file.sha256).toUpperCase()) {
            fail(`Archive source hash mismatch: ${file.archivePath}`);
        }
    }
    return { routeShard, archive };
}

function releaseDocuments() {
    const { routeShard } = validateSources();
    const runtimeFiles = Object.values(ASSETS).map(descriptor);
    const routeDescriptor = descriptor(ASSETS.routeGraphDouluo1);
    const buildInput = descriptor(BUILD_INPUTS.martialSoulRuntimeEvidence);

    const policy = {
        schemaVersion: "v05-rc-policy/1.0",
        packageVersion: PACKAGE_VERSION,
        channel: "release-candidate",
        sourceManifest: SOURCE_MANIFEST,
        sourceSha256: APK_SHA256,
        publicPackIds: ["douluo1"],
        endpointAge: 25,
        defaultSeed: "apk-route-demo-seed",
        supportedDestinyMinimum: 12,
        candidateSeedCount: 256,
        completedArchiveOnly: true,
        routeGraphPackagingPolicy: "pack-shard-only-no-monolith-fallback",
        catalogLoadingPolicy: "catalogNames-empty",
        archiveManifest: ARCHIVE_MANIFEST,
        typedBoundariesRequired: true
    };

    const index = {
        schemaVersion: "v05-rc-package/1.0",
        packageVersion: PACKAGE_VERSION,
        source: {
            apkSha256: APK_SHA256,
            provenanceManifest: SOURCE_MANIFEST
        },
        routeGraphShards: {
            douluo1: {
                ...routeDescriptor,
                schemaVersion: routeShard.schemaVersion,
                packId: "douluo1",
                title: routeShard.pack?.manifest?.title ?? "斗罗大陆 I",
                entryFlowId: routeShard.pack?.entryFlowId,
                releaseStatus: "v05-rc2"
            }
        },
        formalSpecialResultEvidence: descriptor(ASSETS.formalSpecialResultEvidence),
        humanSoulRingEvidence: descriptor(ASSETS.humanSoulRingEvidence),
        humanSoulRingSpeciesEvidence: descriptor(ASSETS.humanSoulRingSpeciesEvidence),
        combatPowerEvidence: descriptor(ASSETS.combatPowerEvidence),
        officialBeastElementEvidence: descriptor(ASSETS.officialBeastElementEvidence),
        supportedDestinies: descriptor(ASSETS.supportedDestinies),
        buildInputs: {
            martialSoulRuntimeEvidence: buildInput
        },
        counts: {},
        files: runtimeFiles
    };

    const entry = {
        schemaVersion: "production-entry/1.0",
        status: "active",
        source: "apk-canonical",
        packageIndex: "data/v05-rc/package-index.json",
        policy: "data/v05-rc/package-policy.json",
        routeGraphLoadingPolicy: "pack-shard-only",
        formalSpecialResultEvidence: ASSETS.formalSpecialResultEvidence,
        humanSoulRingEvidence: ASSETS.humanSoulRingEvidence,
        humanSoulRingSpeciesEvidence: ASSETS.humanSoulRingSpeciesEvidence,
        combatPowerEvidence: ASSETS.combatPowerEvidence,
        officialBeastElementEvidence: ASSETS.officialBeastElementEvidence,
        supportedDestinies: ASSETS.supportedDestinies,
        routeDemo: "v05-demo.html",
        runtime: "js/apk-rule-runtime.js",
        routeRuntime: "js/apk-route-runtime.js",
        adapter: "js/apk-content-adapter.js",
        availabilityPolicy: "preserve_apk_original_state",
        releaseScope: {
            channel: "release-candidate",
            version: "V0.5 RC2",
            publicPackIds: ["douluo1"],
            endpointAge: 25,
            defaultSeed: "apk-route-demo-seed",
            supportedDestinyMinimum: 12,
            candidateSeedCount: 256,
            typedBoundaryAllowed: true,
            completeLifeClaimAllowed: false,
            knownTypedBoundaries: [
                "APK_ROUTE_DYNAMIC_OPTION_UNRESOLVED",
                "APK_COMBAT_POWER_UNCOVERED_STATE",
                "APK_ROUTE_FOLLOWUP_PREPARE_UNRESOLVED",
                "APK_POOL_HAS_NO_ELIGIBLE_OPTIONS",
                "APK_ROUTE_SOUL_RING_EVIDENCE_MISSING",
                "UNSUPPORTED_APK_EFFECT"
            ]
        },
        legacyArchive: {
            status: "archive-only",
            manifest: ARCHIVE_MANIFEST
        }
    };

    return {
        "package-policy.json": policy,
        "package-index.json": index,
        "production-entry.json": entry
    };
}

function serialized(document) {
    return `${JSON.stringify(document, null, 2)}\n`;
}

function writeOrCheck(fileName, document) {
    const target = path.join(OUTPUT_ROOT, fileName);
    const expected = serialized(document);
    if (CHECK_ONLY) {
        if (!fs.existsSync(target) || fs.readFileSync(target, "utf8") !== expected) {
            fail(`Generated V0.5 RC artifact is stale: data/v05-rc/${fileName}`);
        }
        return;
    }
    fs.mkdirSync(OUTPUT_ROOT, { recursive: true });
    fs.writeFileSync(target, expected, "utf8");
}

const documents = releaseDocuments();
for (const [fileName, document] of Object.entries(documents)) {
    writeOrCheck(fileName, document);
}

process.stdout.write(`${JSON.stringify({
    status: "pass",
    mode: CHECK_ONLY ? "check" : "write",
    packageVersion: PACKAGE_VERSION,
    sourceSha256: APK_SHA256,
    outputFiles: Object.keys(documents)
}, null, 2)}\n`);
