#!/usr/bin/env node

import fs from "node:fs";

const ALLOWED_REVIEW_STATUSES = new Set([
    "reference_candidate",
    "待审定",
    "confirmed",
    "modified_confirmed",
    "rejected",
    "provisional",
    "inferred",
    "unresolved",
    "partial"
]);

const PRODUCTION_REVIEW_STATUSES = new Set([
    "confirmed",
    "modified_confirmed"
]);

const ALLOWED_CANON_LEVELS = new Set([
    "canon",
    "expanded",
    "crossover",
    "parody"
]);

const PRODUCTION_CANON_LEVELS = new Set([
    "canon",
    "expanded"
]);

const SHA256_PATTERN = /^[0-9a-f]{64}$/i;

function issue(issues, severity, code, message, path = null) {
    issues.push({ severity, code, message, ...(path ? { path } : {}) });
}

function isPlainObject(value) {
    return value !== null
        && typeof value === "object"
        && !Array.isArray(value);
}

function extractRecords(document) {
    if (Array.isArray(document)) {
        return document;
    }

    if (!isPlainObject(document)) {
        throw new Error("Input must be a JSON array or object.");
    }

    for (const key of ["records", "definitions", "candidates", "entries"]) {
        if (Array.isArray(document[key])) {
            return document[key];
        }
    }

    throw new Error(
        "Input object must contain one of: records, definitions, candidates, entries."
    );
}

function validateSourceRefs(record, path, issues) {
    if (!Array.isArray(record.sourceRefs) || record.sourceRefs.length === 0) {
        issue(
            issues,
            "error",
            "SOURCE_REFS_MISSING",
            "sourceRefs must be a non-empty array.",
            path + ".sourceRefs"
        );
        return;
    }

    record.sourceRefs.forEach((sourceRef, sourceIndex) => {
        const sourcePath = path + ".sourceRefs[" + sourceIndex + "]";
        if (!isPlainObject(sourceRef)) {
            issue(issues, "error", "SOURCE_REF_INVALID", "sourceRef must be an object.", sourcePath);
            return;
        }

        for (const field of ["type", "path", "sourceId"]) {
            if (typeof sourceRef[field] !== "string" || sourceRef[field].trim() === "") {
                issue(
                    issues,
                    "error",
                    "SOURCE_REF_FIELD_MISSING",
                    field + " must be a non-empty string.",
                    sourcePath + "." + field
                );
            }
        }

        if (typeof sourceRef.sha256 !== "string" || !SHA256_PATTERN.test(sourceRef.sha256)) {
            issue(
                issues,
                "error",
                "SOURCE_REF_HASH_INVALID",
                "sourceRef.sha256 must be a 64-character hexadecimal SHA-256.",
                sourcePath + ".sha256"
            );
        }
    });
}

function validateRecords(records) {
    const issues = [];
    const seenIds = new Map();

    records.forEach((record, index) => {
        const path = "records[" + index + "]";
        if (!isPlainObject(record)) {
            issue(issues, "error", "RECORD_INVALID", "Record must be an object.", path);
            return;
        }

        if (typeof record.id !== "string" || record.id.trim() === "") {
            issue(issues, "error", "RECORD_ID_MISSING", "id must be a non-empty string.", path + ".id");
        } else if (seenIds.has(record.id)) {
            issue(
                issues,
                "error",
                "RECORD_ID_DUPLICATE",
                "id duplicates records[" + seenIds.get(record.id) + "].",
                path + ".id"
            );
        } else {
            seenIds.set(record.id, index);
        }

        if (!ALLOWED_REVIEW_STATUSES.has(record.reviewStatus)) {
            issue(
                issues,
                "error",
                "REVIEW_STATUS_INVALID",
                "reviewStatus is missing or outside the declared review protocol.",
                path + ".reviewStatus"
            );
        }

        if (!ALLOWED_CANON_LEVELS.has(record.canonLevel)) {
            issue(
                issues,
                "error",
                "CANON_LEVEL_INVALID",
                "canonLevel must be canon, expanded, crossover, or parody.",
                path + ".canonLevel"
            );
        }

        if (typeof record.productionEligible !== "boolean") {
            issue(
                issues,
                "error",
                "PRODUCTION_ELIGIBILITY_INVALID",
                "productionEligible must be boolean.",
                path + ".productionEligible"
            );
        }

        validateSourceRefs(record, path, issues);

        const productionEligible = record.productionEligible === true;
        if (productionEligible
            && !PRODUCTION_REVIEW_STATUSES.has(record.reviewStatus)) {
            issue(
                issues,
                "error",
                "UNCONFIRMED_PRODUCTION_RECORD",
                "productionEligible=true requires confirmed or modified_confirmed reviewStatus.",
                path + ".productionEligible"
            );
        }

        if (productionEligible
            && !PRODUCTION_CANON_LEVELS.has(record.canonLevel)) {
            issue(
                issues,
                "error",
                "NON_PRODUCTION_CANON_RECORD",
                "productionEligible=true requires canon or expanded canonLevel.",
                path + ".productionEligible"
            );
        }
    });

    return {
        recordCount: records.length,
        uniqueIdCount: seenIds.size,
        errorCount: issues.filter(item => item.severity === "error").length,
        warningCount: issues.filter(item => item.severity === "warning").length,
        issues
    };
}

function validateDocument(document) {
    const records = extractRecords(document);
    return validateRecords(records);
}

function runSelfTest() {
    const valid = {
        records: [
            {
                id: "candidate_confirmed_1",
                reviewStatus: "confirmed",
                canonLevel: "expanded",
                productionEligible: true,
                sourceRefs: [
                    {
                        type: "apk_static_extract",
                        path: "derived/catalogs/example.csv",
                        sourceId: "example-source",
                        sha256: "E4FB340EF0DAD857A018E2F06982D32623BDD683B22BD44230A2257C35DAA11C"
                    }
                ]
            }
        ]
    };

    const invalid = {
        records: [
            {
                id: "candidate_unconfirmed",
                reviewStatus: "inferred",
                canonLevel: "crossover",
                productionEligible: true,
                sourceRefs: []
            },
            {
                id: "candidate_unconfirmed",
                reviewStatus: "待审定",
                canonLevel: "canon",
                productionEligible: false,
                sourceRefs: [
                    {
                        type: "apk_static_extract",
                        path: "derived/catalogs/example.csv",
                        sourceId: "example-source",
                        sha256: "invalid"
                    }
                ]
            }
        ]
    };

    const validResult = validateDocument(valid);
    const invalidResult = validateDocument(invalid);

    if (validResult.errorCount !== 0
        || invalidResult.errorCount < 1
        || !invalidResult.issues.some(item => item.code === "RECORD_ID_DUPLICATE")) {
        throw new Error("Boundary validator self-test failed.");
    }

    return {
        status: "pass",
        validFixture: validResult,
        invalidFixture: invalidResult
    };
}

function main() {
    const args = process.argv.slice(2);
    if (args.includes("--self-test")) {
        console.log(JSON.stringify(runSelfTest(), null, 2));
        return;
    }

    const inputPath = args[0];
    if (!inputPath) {
        console.error("Usage: node validate-content-boundary.mjs <json-path>");
        console.error("       node validate-content-boundary.mjs --self-test");
        process.exitCode = 2;
        return;
    }

    let document;
    try {
        document = JSON.parse(fs.readFileSync(inputPath, "utf8"));
    } catch (error) {
        console.error(JSON.stringify({
            status: "error",
            code: "INPUT_JSON_INVALID",
            message: error instanceof Error ? error.message : String(error)
        }, null, 2));
        process.exitCode = 2;
        return;
    }

    let result;
    try {
        result = validateDocument(document);
    } catch (error) {
        console.error(JSON.stringify({
            status: "error",
            code: "INPUT_SHAPE_INVALID",
            message: error instanceof Error ? error.message : String(error)
        }, null, 2));
        process.exitCode = 2;
        return;
    }

    const output = {
        status: result.errorCount === 0 ? "pass" : "fail",
        scope: "candidate_admission_only",
        ...result
    };
    console.log(JSON.stringify(output, null, 2));
    process.exitCode = result.errorCount === 0 ? 0 : 1;
}

main();
