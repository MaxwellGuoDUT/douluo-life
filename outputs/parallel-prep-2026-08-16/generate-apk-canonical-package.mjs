#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SOURCE_ROOT = path.join(
    ROOT,
    "apk-analysis",
    "E4FB340E",
    "derived",
    "catalogs"
);
const SOURCE_MANIFEST_PATH = path.join(
    ROOT,
    "outputs",
    "parallel-prep-2026-08-16",
    "APK_PROVENANCE_MANIFEST_2026-08-16.json"
);
const TARGET_ROOT = path.join(ROOT, "data", "apk-canonical");
const TARGET_CATALOG_ROOT = path.join(TARGET_ROOT, "catalogs");
const TARGET_META_ROOT = path.join(TARGET_ROOT, "meta");
const ROUTE_GRAPH_PATH = path.join(TARGET_CATALOG_ROOT, "route-graph.json");
const MARTIAL_SOUL_RUNTIME_EVIDENCE_PATH = path.join(
    TARGET_CATALOG_ROOT,
    "martial-soul-runtime-evidence.json"
);
const FORMAL_SPECIAL_RESULT_EVIDENCE_PATH = path.join(
    TARGET_CATALOG_ROOT,
    "formal-special-result-runtime-evidence.json"
);
const HUMAN_SOUL_RING_EVIDENCE_PATH = path.join(
    TARGET_CATALOG_ROOT,
    "human-soul-ring-runtime-evidence.json"
);
const HUMAN_SOUL_RING_SPECIES_EVIDENCE_PATH = path.join(
    TARGET_CATALOG_ROOT,
    "human-soul-ring-species-runtime-evidence.json"
);
const COMBAT_POWER_EVIDENCE_PATH = path.join(
    TARGET_CATALOG_ROOT,
    "combat-power-runtime-evidence.json"
);

const CATALOGS = [
    ["datasets.csv", "datasets", "dataset"],
    ["martial-souls.csv", "martial-souls", "martialSoul"],
    ["soul-beast-species-raw.csv", "soul-beasts-raw", "soulBeastRaw"],
    ["soul-beast-species.csv", "soul-beasts-structured", "soulBeastStructured"],
    ["pools.csv", "pools", "pool"],
    ["options.csv", "options", "option"],
    ["effects.csv", "effects", "effect"],
    ["requirements.csv", "requirements", "requirement"],
    ["story-timeline.csv", "story-timeline", "storyTimeline"],
    ["endings-and-deaths.csv", "endings-and-deaths", "endingOrDeath"]
];

function fail(message) {
    throw new Error(message);
}

function sha256File(filePath) {
    return crypto
        .createHash("sha256")
        .update(fs.readFileSync(filePath))
        .digest("hex")
        .toUpperCase();
}

function relativePath(filePath) {
    return path.relative(ROOT, filePath).replaceAll(path.sep, "/");
}

function idPart(value) {
    return String(value ?? "")
        .replace(/[^a-zA-Z0-9_-]+/g, "_")
        .replace(/^_+|_+$/g, "");
}

function parseCsv(text) {
    const rows = [];
    let row = [];
    let field = "";
    let quoted = false;

    function pushField() {
        row.push(field);
        field = "";
    }

    function pushRow() {
        if (row.length > 0 && row.some(value => value !== "")) {
            rows.push(row);
        }
        row = [];
    }

    for (let index = 0; index < text.length; index += 1) {
        const character = text[index];

        if (quoted) {
            if (character === "\"" && text[index + 1] === "\"") {
                field += "\"";
                index += 1;
            } else if (character === "\"") {
                quoted = false;
            } else {
                field += character;
            }
            continue;
        }

        if (character === "\"" && field.length === 0) {
            quoted = true;
        } else if (character === ",") {
            pushField();
        } else if (character === "\n") {
            pushField();
            pushRow();
        } else if (character !== "\r") {
            field += character;
        }
    }

    if (quoted) {
        fail("CSV ended inside a quoted field.");
    }

    if (field.length > 0 || row.length > 0) {
        pushField();
        pushRow();
    }

    return rows;
}

function readCsv(fileName) {
    const filePath = path.join(SOURCE_ROOT, fileName);
    const rows = parseCsv(fs.readFileSync(filePath, "utf8"));
    if (rows.length === 0) {
        fail("CSV is empty: " + fileName);
    }

    const headers = rows[0].map(header => (
        header.replace(/^\uFEFF/, "")
    ));
    return rows.slice(1).map((values, rowIndex) => {
        if (values.length !== headers.length) {
            fail(
                "CSV column count mismatch in "
                + fileName
                + " row "
                + String(rowIndex + 2)
                + ": expected "
                + String(headers.length)
                + ", got "
                + String(values.length)
            );
        }

        return Object.fromEntries(
            headers.map((header, index) => [header, values[index]])
        );
    });
}

function toBoolean(value) {
    if (value === true || value === "True" || value === "true") {
        return true;
    }
    if (value === false || value === "False" || value === "false") {
        return false;
    }
    return value;
}

function toInteger(value) {
    if (value === "" || value === null || value === undefined) {
        return null;
    }
    const parsed = Number(value);
    return Number.isInteger(parsed) ? parsed : value;
}

function parseJsonCell(value) {
    if (value === "" || value === null || value === undefined) {
        return null;
    }

    try {
        return JSON.parse(value);
    } catch {
        return {
            raw: value,
            parseStatus: "unresolved"
        };
    }
}

function normalizeFields(raw, jsonFields = [], integerFields = [], booleanFields = []) {
    const normalized = { ...raw };

    jsonFields.forEach(field => {
        normalized[field] = parseJsonCell(raw[field]);
    });
    integerFields.forEach(field => {
        normalized[field] = toInteger(raw[field]);
    });
    booleanFields.forEach(field => {
        normalized[field] = toBoolean(raw[field]);
    });

    return normalized;
}

function sourceRef(fileName, rowNumber, sourceManifest) {
    return {
        type: "apk_static_extract",
        sha256: sourceManifest.source.sha256,
        path: "apk-analysis/E4FB340E/derived/catalogs/" + fileName,
        sourceId: "apk:E4FB340E:" + fileName + ":row-" + String(rowNumber)
    };
}

function decorateRecord({
    fileName,
    rowNumber,
    kind,
    raw,
    normalized,
    sourceManifest,
    id,
    availability
}) {
    return {
        id,
        kind,
        ownerAuthorization: "confirmed",
        sourceRef: sourceRef(fileName, rowNumber, sourceManifest),
        availability: {
            policy: "preserve_apk_original_state",
            ...availability
        },
        raw,
        normalized
    };
}

function convertRows(fileName, kind, rows, sourceManifest) {
    return rows.map((raw, index) => {
        const rowNumber = index + 2;

        if (kind === "dataset") {
            return decorateRecord({
                fileName,
                rowNumber,
                kind,
                raw,
                normalized: {
                    dataset: raw.dataset,
                    sha256: raw.sha256,
                    duplicateOf: raw.duplicate_of || null,
                    type: raw.type,
                    itemCount: toInteger(raw.item_count),
                    poolCount: toInteger(raw.pool_count),
                    firstKeys: raw.first_keys
                        ? raw.first_keys.split(",")
                        : []
                },
                sourceManifest,
                id: "apk_dataset_" + String(index + 1).padStart(4, "0"),
                availability: {
                    enabled: true,
                    duplicateOf: raw.duplicate_of || null
                }
            });
        }

        if (kind === "martialSoul") {
            const normalized = normalizeFields(
                raw,
                [],
                ["weight"],
                ["enabled"]
            );
            return decorateRecord({
                fileName,
                rowNumber,
                kind,
                raw,
                normalized,
                sourceManifest,
                id: "apk_martial_soul_" + raw.option_id,
                availability: {
                    enabled: normalized.enabled,
                    poolId: raw.pool_id,
                    poolName: raw.pool_name,
                    category: raw.category
                }
            });
        }

        if (kind === "soulBeastRaw") {
            const normalized = normalizeFields(
                raw,
                [],
                ["weight"],
                ["enabled", "has_structured_semantics"]
            );
            return decorateRecord({
                fileName,
                rowNumber,
                kind,
                raw,
                normalized,
                sourceManifest,
                id: "apk_soul_beast_raw_" + String(index + 1).padStart(4, "0"),
                availability: {
                    enabled: normalized.enabled,
                    routeState: raw.route_state,
                    sourceLayer: raw.source_layer,
                    poolId: raw.pool_id,
                    category: raw.category,
                    hasStructuredSemantics: normalized.has_structured_semantics
                }
            });
        }

        if (kind === "soulBeastStructured") {
            const normalized = normalizeFields(
                raw,
                ["attributes", "schema_gaps"],
                ["weight"],
                ["fusion_stacks", "enabled"]
            );
            return decorateRecord({
                fileName,
                rowNumber,
                kind,
                raw,
                normalized,
                sourceManifest,
                id: "apk_soul_beast_structured_" + raw.option_id,
                availability: {
                    enabled: normalized.enabled,
                    poolId: raw.pool_id,
                    schemaGaps: normalized.schema_gaps
                }
            });
        }

        if (kind === "pool") {
            const normalized = normalizeFields(
                raw,
                ["tags", "effect_types", "requirement_types"],
                [
                    "option_count",
                    "enabled_option_count",
                    "weight_total",
                    "min_weight",
                    "max_weight",
                    "ending_options",
                    "death_options"
                ],
                ["martial_soul_topic", "soul_beast_topic", "plot_topic"]
            );
            return decorateRecord({
                fileName,
                rowNumber,
                kind,
                raw,
                normalized,
                sourceManifest,
                id: "apk_pool_" + idPart(raw.dataset) + "_" + raw.pool_id,
                availability: {
                    status: raw.status || null,
                    poolKind: raw.pool_kind || null,
                    enabledOptionCount: normalized.enabled_option_count,
                    optionCount: normalized.option_count
                }
            });
        }

        if (kind === "option") {
            const normalized = normalizeFields(
                raw,
                ["requirements", "reroll_when", "effects", "failure_effects", "next"],
                ["weight"],
                ["enabled", "ending_like", "death_like"]
            );
            return decorateRecord({
                fileName,
                rowNumber,
                kind,
                raw,
                normalized,
                sourceManifest,
                id: "apk_option_"
                    + idPart(raw.dataset)
                    + "_"
                    + raw.pool_id
                    + "_"
                    + raw.option_id,
                availability: {
                    enabled: normalized.enabled,
                    contentStatus: raw.content_status || null,
                    poolId: raw.pool_id,
                    poolName: raw.pool_name,
                    endingLike: normalized.ending_like,
                    deathLike: normalized.death_like
                }
            });
        }

        if (kind === "effect") {
            const normalized = {
                effectType: raw.effect_type,
                effect: parseJsonCell(raw.effect)
            };
            return decorateRecord({
                fileName,
                rowNumber,
                kind,
                raw,
                normalized,
                sourceManifest,
                id: "apk_effect_"
                    + idPart(raw.dataset)
                    + "_"
                    + raw.pool_id
                    + "_"
                    + raw.option_id
                    + "_"
                    + String(index + 1),
                availability: {
                    poolId: raw.pool_id,
                    optionId: raw.option_id
                }
            });
        }

        if (kind === "requirement") {
            const normalized = {
                bucket: raw.bucket,
                requirementType: raw.requirement_type,
                requirement: parseJsonCell(raw.requirement)
            };
            return decorateRecord({
                fileName,
                rowNumber,
                kind,
                raw,
                normalized,
                sourceManifest,
                id: "apk_requirement_"
                    + idPart(raw.dataset)
                    + "_"
                    + raw.pool_id
                    + "_"
                    + raw.option_id
                    + "_"
                    + String(index + 1),
                availability: {
                    poolId: raw.pool_id,
                    optionId: raw.option_id
                }
            });
        }

        if (kind === "storyTimeline") {
            const normalized = normalizeFields(
                raw,
                [],
                ["order", "minimum_timeline_age", "ending_effects", "death_effects"],
                []
            );
            return decorateRecord({
                fileName,
                rowNumber,
                kind,
                raw,
                normalized,
                sourceManifest,
                id: "apk_story_" + raw.world + "_" + raw.branch + "_" + raw.order + "_" + raw.pool_id,
                availability: {
                    world: raw.world,
                    branch: raw.branch,
                    minimumTimelineAge: raw.minimum_timeline_age,
                    poolId: raw.pool_id
                }
            });
        }

        if (kind === "endingOrDeath") {
            const normalized = normalizeFields(
                raw,
                ["effects"],
                ["weight"],
                ["ending_like", "death_like"]
            );
            return decorateRecord({
                fileName,
                rowNumber,
                kind,
                raw,
                normalized,
                sourceManifest,
                id: "apk_ending_or_death_"
                    + idPart(raw.dataset)
                    + "_"
                    + raw.pool_id
                    + "_"
                    + raw.option_id,
                availability: {
                    endingLike: normalized.ending_like,
                    deathLike: normalized.death_like,
                    poolId: raw.pool_id
                }
            });
        }

        fail("Unsupported catalog kind: " + kind);
    });
}

function writeJson(filePath, value) {
    fs.writeFileSync(
        filePath,
        JSON.stringify(value, null, 2) + "\n",
        "utf8"
    );
}

function main() {
    const sourceManifest = JSON.parse(
        fs.readFileSync(SOURCE_MANIFEST_PATH, "utf8")
    );

    fs.mkdirSync(TARGET_CATALOG_ROOT, { recursive: true });
    fs.mkdirSync(TARGET_META_ROOT, { recursive: true });

    const packageFiles = [];
    const counts = {};

    for (const [fileName, outputName, kind] of CATALOGS) {
        const rows = readCsv(fileName);
        const records = convertRows(fileName, kind, rows, sourceManifest);
        const outputPath = path.join(TARGET_CATALOG_ROOT, outputName + ".json");
        writeJson(outputPath, {
            schemaVersion: "apk-canonical-catalog/1.0",
            packageVersion: "apk-canonical/2026-08-16",
            sourceFile: "apk-analysis/E4FB340E/derived/catalogs/" + fileName,
            sourceSha256: sourceManifest.source.sha256,
            ownerAuthorization: "confirmed",
            availabilityPolicy: "preserve_apk_original_state",
            recordCount: records.length,
            records
        });
        counts[outputName] = records.length;
        packageFiles.push(outputPath);
    }

    if (fs.existsSync(ROUTE_GRAPH_PATH)) {
        packageFiles.push(ROUTE_GRAPH_PATH);
    }
    if (fs.existsSync(MARTIAL_SOUL_RUNTIME_EVIDENCE_PATH)) {
        packageFiles.push(MARTIAL_SOUL_RUNTIME_EVIDENCE_PATH);
    }
    if (fs.existsSync(FORMAL_SPECIAL_RESULT_EVIDENCE_PATH)) {
        packageFiles.push(FORMAL_SPECIAL_RESULT_EVIDENCE_PATH);
    }
    if (fs.existsSync(HUMAN_SOUL_RING_EVIDENCE_PATH)) {
        packageFiles.push(HUMAN_SOUL_RING_EVIDENCE_PATH);
    }
    if (fs.existsSync(HUMAN_SOUL_RING_SPECIES_EVIDENCE_PATH)) {
        packageFiles.push(HUMAN_SOUL_RING_SPECIES_EVIDENCE_PATH);
    }
    if (fs.existsSync(COMBAT_POWER_EVIDENCE_PATH)) {
        packageFiles.push(COMBAT_POWER_EVIDENCE_PATH);
    }

    const policyPath = path.join(TARGET_META_ROOT, "package-policy.json");
    writeJson(policyPath, {
        schemaVersion: "apk-canonical-policy/1.0",
        packageVersion: "apk-canonical/2026-08-16",
        ownerAuthorization: "confirmed",
        sourceManifest: "outputs/parallel-prep-2026-08-16/APK_PROVENANCE_MANIFEST_2026-08-16.json",
        sourceSha256: sourceManifest.source.sha256,
        availabilityPolicy: "preserve_apk_original_state",
        oldProductionPolicy: "archive_only",
        runtimePolicy: "typed_adapter_required_for_unmapped_effects_and_requirements",
        domains: [
            "martial_souls",
            "soul_beasts",
            "awakening_probability",
            "forms_and_quality",
            "pools",
            "options",
            "effects",
            "requirements",
            "story_timeline",
            "endings_and_deaths"
        ]
    });
    packageFiles.push(policyPath);

    const fileEntries = packageFiles.map(filePath => ({
        path: relativePath(filePath),
        sizeBytes: fs.statSync(filePath).size,
        sha256: sha256File(filePath)
    }));

    const generatorPath = path.join(
        ROOT,
        "outputs",
        "parallel-prep-2026-08-16",
        "generate-apk-canonical-package.mjs"
    );
    const index = {
        schemaVersion: "apk-canonical-package/1.0",
        packageVersion: "apk-canonical/2026-08-16",
        status: "owner_authorized_migration",
        sourceManifest: "outputs/parallel-prep-2026-08-16/APK_PROVENANCE_MANIFEST_2026-08-16.json",
        sourceSha256: sourceManifest.source.sha256,
        generatedBy: relativePath(generatorPath),
        generatorSha256: sha256File(generatorPath),
        availabilityPolicy: "preserve_apk_original_state",
        oldProductionPolicy: "archive_only",
        routeGraph: fs.existsSync(ROUTE_GRAPH_PATH)
            ? {
                path: relativePath(ROUTE_GRAPH_PATH),
                status: JSON.parse(fs.readFileSync(ROUTE_GRAPH_PATH, "utf8")).status,
                sizeBytes: fs.statSync(ROUTE_GRAPH_PATH).size,
                sha256: sha256File(ROUTE_GRAPH_PATH)
            }
            : null,
        formalSpecialResultEvidence: fs.existsSync(FORMAL_SPECIAL_RESULT_EVIDENCE_PATH)
            ? {
                path: relativePath(FORMAL_SPECIAL_RESULT_EVIDENCE_PATH),
                status: JSON.parse(fs.readFileSync(
                    FORMAL_SPECIAL_RESULT_EVIDENCE_PATH,
                    "utf8"
                )).schemaVersion,
                recordCount: JSON.parse(fs.readFileSync(
                    FORMAL_SPECIAL_RESULT_EVIDENCE_PATH,
                    "utf8"
                )).records.length,
                sha256: sha256File(FORMAL_SPECIAL_RESULT_EVIDENCE_PATH)
            }
            : null,
        humanSoulRingEvidence: fs.existsSync(HUMAN_SOUL_RING_EVIDENCE_PATH)
            ? {
                path: relativePath(HUMAN_SOUL_RING_EVIDENCE_PATH),
                status: JSON.parse(fs.readFileSync(
                    HUMAN_SOUL_RING_EVIDENCE_PATH,
                    "utf8"
                )).schemaVersion,
                recordCount: JSON.parse(fs.readFileSync(
                    HUMAN_SOUL_RING_EVIDENCE_PATH,
                    "utf8"
                )).records.length,
                sha256: sha256File(HUMAN_SOUL_RING_EVIDENCE_PATH)
            }
            : null,
        humanSoulRingSpeciesEvidence: fs.existsSync(HUMAN_SOUL_RING_SPECIES_EVIDENCE_PATH)
            ? {
                path: relativePath(HUMAN_SOUL_RING_SPECIES_EVIDENCE_PATH),
                status: JSON.parse(fs.readFileSync(
                    HUMAN_SOUL_RING_SPECIES_EVIDENCE_PATH,
                    "utf8"
                )).schemaVersion,
                recordCount: JSON.parse(fs.readFileSync(
                    HUMAN_SOUL_RING_SPECIES_EVIDENCE_PATH,
                    "utf8"
                )).records.length,
                routeGraphMatchedRecordCount: JSON.parse(fs.readFileSync(
                    HUMAN_SOUL_RING_SPECIES_EVIDENCE_PATH,
                    "utf8"
                )).extraction.routeGraphMatchedRecordCount,
                sizeBytes: fs.statSync(HUMAN_SOUL_RING_SPECIES_EVIDENCE_PATH).size,
                sha256: sha256File(HUMAN_SOUL_RING_SPECIES_EVIDENCE_PATH)
            }
            : null,
        martialSoulRuntimeEvidence: fs.existsSync(MARTIAL_SOUL_RUNTIME_EVIDENCE_PATH)
            ? {
                path: relativePath(MARTIAL_SOUL_RUNTIME_EVIDENCE_PATH),
                status: JSON.parse(fs.readFileSync(
                    MARTIAL_SOUL_RUNTIME_EVIDENCE_PATH,
                    "utf8"
                )).schemaVersion,
                sizeBytes: fs.statSync(MARTIAL_SOUL_RUNTIME_EVIDENCE_PATH).size,
                sha256: sha256File(MARTIAL_SOUL_RUNTIME_EVIDENCE_PATH)
            }
            : null,
        combatPowerEvidence: fs.existsSync(COMBAT_POWER_EVIDENCE_PATH)
            ? {
                path: relativePath(COMBAT_POWER_EVIDENCE_PATH),
                status: JSON.parse(fs.readFileSync(
                    COMBAT_POWER_EVIDENCE_PATH,
                    "utf8"
                )).schemaVersion,
                sourceSha256: JSON.parse(fs.readFileSync(
                    COMBAT_POWER_EVIDENCE_PATH,
                    "utf8"
                )).source?.apkSha256 ?? null,
                sizeBytes: fs.statSync(COMBAT_POWER_EVIDENCE_PATH).size,
                sha256: sha256File(COMBAT_POWER_EVIDENCE_PATH)
            }
            : null,
        counts,
        files: fileEntries
    };
    const indexPath = path.join(TARGET_ROOT, "package-index.json");
    writeJson(indexPath, index);

    console.log(JSON.stringify({
        status: "pass",
        targetRoot: relativePath(TARGET_ROOT),
        sourceSha256: sourceManifest.source.sha256,
        counts,
        fileCount: fileEntries.length + 1
    }, null, 2));
}

main();
