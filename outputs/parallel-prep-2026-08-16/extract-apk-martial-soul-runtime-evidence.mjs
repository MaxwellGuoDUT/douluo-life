#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const ROOT = process.cwd();
const SOURCE_ROOT = path.join(
    ROOT,
    "apk-analysis",
    "E4FB340E",
    "derived",
    "pretty"
);
const DOULUO1_SOURCE_PATH = path.join(
    SOURCE_ROOT,
    "douluo1-pack-C6xEgEus.js"
);
const FOUNDATION_SOURCE_PATH = path.join(
    SOURCE_ROOT,
    "human-foundation-CduvzjjO.js"
);
const CATALOG_PATH = path.join(
    ROOT,
    "data",
    "apk-canonical",
    "catalogs",
    "martial-souls.json"
);
const TARGET_PATH = path.join(
    ROOT,
    "data",
    "apk-canonical",
    "catalogs",
    "martial-soul-runtime-evidence.json"
);
const SOURCE_SHA256 = "E4FB340E0DAD857A018E2F06982D32623BDD683B22BD44230A2257C35DAA11C";
const BODY_EVOLUTION_POOL_ID = "f2abac93-6b26-4e3e-aa92-a168db671577";

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

function clone(value) {
    if (value === undefined) return undefined;
    return JSON.parse(JSON.stringify(value));
}

function extractExpression(source, marker, opening) {
    const markerIndex = source.indexOf(marker);
    if (markerIndex < 0) fail(`Static source marker not found: ${marker}`);

    const start = source.indexOf(opening, markerIndex + marker.length);
    if (start < 0) fail(`Static source expression start not found: ${marker}`);

    const closingByOpening = {
        "[": "]",
        "{": "}",
        "(": ")"
    };
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
            if (escaped) {
                escaped = false;
            } else if (character === "\\") {
                escaped = true;
            } else if (character === quote) {
                quote = null;
            }
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
        if (character === "\"" || character === "'" || character === "`") {
            quote = character;
            continue;
        }
        if (character === opening) {
            depth += 1;
        } else if (character === closing) {
            depth -= 1;
            if (depth === 0) return source.slice(start, index + 1);
        }
    }

    fail(`Static source expression was not closed: ${marker}`);
}

function evaluate(expression, context = {}) {
    return vm.runInNewContext(`(${expression})`, context, {
        timeout: 2000
    });
}

function staticSet(source, marker) {
    return new Set(evaluate(extractExpression(source, marker, "[")));
}

function sourceRuleEffects(rule) {
    return (rule?.elements ?? []).map(element => ({
        type: "advanceHumanElement",
        elementId: element.elementId,
        amount: element.amount
    }));
}

function sharedAttributeEffects(rule) {
    return (rule?.attributes ?? []).map(attribute => ({
        type: "ensureHumanElementLevel",
        elementId: attribute.elementId,
        level: attribute.stage
    }));
}

function dedupeStrings(values) {
    return [...new Set(values.filter(value => typeof value === "string"))];
}

function dedupeObjects(values) {
    const seen = new Set();
    return values.filter(value => {
        const fingerprint = JSON.stringify(value);
        if (seen.has(fingerprint)) return false;
        seen.add(fingerprint);
        return true;
    });
}

function buildEvidence() {
    const douluo1Source = fs.readFileSync(DOULUO1_SOURCE_PATH, "utf8");
    const foundationSource = fs.readFileSync(FOUNDATION_SOURCE_PATH, "utf8");
    const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8"));

    const poolCategories = evaluate(extractExpression(
        douluo1Source,
        "hr =",
        "{"
    ));
    const fixedPassives = evaluate(extractExpression(
        douluo1Source,
        "wr =",
        "{"
    ));
    const swordOptionIds = staticSet(douluo1Source, "br = new Set");
    const dragonOptionIds = staticSet(douluo1Source, "gr = new Set");
    const dragonPoolIds = staticSet(douluo1Source, "mr = new Set");
    const sharedRules = evaluate(extractExpression(
        foundationSource,
        "const $a =",
        "["
    ));
    const martialRules = evaluate(extractExpression(
        foundationSource,
        "const $d =",
        "["
    ));
    const extremeScopeRules = evaluate(extractExpression(
        foundationSource,
        "Zt =",
        "{"
    ));
    const extremePoolMatch = foundationSource.match(/\bVt\s*=\s*"([^"]+)"/u);
    if (!extremePoolMatch) fail("Static source marker not found: Vt =");
    const extremePoolId = extremePoolMatch[1];

    const taContext = {
        st: BODY_EVOLUTION_POOL_ID,
        Qe: {
            elementOpportunityPerTimeSkip: "formal:element-opportunity-per-time-skip",
            levelMinusOnePerTimeSkip: "formal:level-minus-one-per-time-skip"
        },
        h: (elementId, amount = 1) => ({
            type: "advanceHumanElement",
            elementId,
            amount
        }),
        g: (effects, passives, followUps) => ({
            effects,
            ...(passives ? { passives } : {}),
            ...(followUps ? { followUps } : {})
        }),
        V: (poolId, values) => Object.fromEntries(
            Object.entries(values).map(([optionId, value]) => [
                `${poolId}:${optionId}`,
                value
            ])
        ),
        Hd: "96be4279-1aa6-49b3-bf4c-e164871129cf",
        Qd: "08c42cec-f04d-49bc-8896-4239e1973726",
        Ud: "2cc51e7d-9a0a-43c8-bf4e-e12bf30ef6e6",
        Md: "49e3abc8-1361-4348-94aa-b23c68a53720",
        _d: "f1afa805-95b7-4d54-aea2-d3de15e54c5a"
    };
    const directRules = evaluate(
        extractExpression(foundationSource, "ta =", "{"),
        taContext
    );

    const sharedByKey = new Map(
        sharedRules.map(rule => [`${rule.poolId}:${rule.optionId}`, rule])
    );
    const martialByKey = new Map(
        martialRules.map(rule => [`${rule.poolId}:${rule.optionId}`, rule])
    );

    const records = [];
    let recognizedCatalogRecords = 0;
    let recordsWithTypedEffects = 0;
    let recordsWithPassives = 0;
    let recordsWithTags = 0;
    let recordsWithSharedRules = 0;
    let recordsWithDirectRules = 0;
    let recordsWithExtremeRules = 0;

    for (const record of catalog.records ?? []) {
        const normalized = record.normalized ?? {};
        const poolId = normalized.pool_id;
        const optionId = normalized.option_id;
        const category = poolCategories[poolId];
        if (!category) continue;

        recognizedCatalogRecords += 1;
        const key = `${poolId}:${optionId}`;
        const sharedRule = sharedByKey.get(key) ?? null;
        const martialRule = martialByKey.get(key) ?? null;
        const directRule = directRules[key] ?? null;
        const sharedEffects = sharedAttributeEffects(sharedRule);
        const ilEffects = dedupeObjects([
            ...(directRule?.effects ?? []),
            ...sharedEffects
        ]);
        const ilPassives = dedupeStrings(directRule?.passives ?? []);
        const ilFollowUps = clone(directRule?.followUps ?? []);
        const extremeRule = poolId === extremePoolId
            ? extremeScopeRules[optionId] ?? null
            : null;
        const extremeEffects = extremeRule
            ? [
                ...(extremeRule.elementId && extremeRule.elementLevels
                    ? [{
                        type: "advanceHumanElement",
                        elementId: extremeRule.elementId,
                        amount: extremeRule.elementLevels
                    }]
                    : []),
                ...(extremeRule.domainId
                    ? [{ type: "addDomain", domainId: extremeRule.domainId }]
                    : []),
                ...(extremeRule.extraEffects ?? [])
            ]
            : [];
        const extremePassives = dedupeStrings(extremeRule?.passives ?? []);
        const tags = [];
        if (swordOptionIds.has(optionId)) tags.push("sword");
        if (dragonPoolIds.has(poolId) || dragonOptionIds.has(optionId)) {
            tags.push("dragon");
        }
        const passives = dedupeStrings([
            ...(fixedPassives[optionId] ?? []),
            ...ilPassives,
            ...extremePassives
        ]);
        const effects = [
            ...extremeEffects,
            ...ilEffects
        ];

        if (effects.length > 0) recordsWithTypedEffects += 1;
        if (passives.length > 0) recordsWithPassives += 1;
        if (tags.length > 0) recordsWithTags += 1;
        if (sharedRule) recordsWithSharedRules += 1;
        if (directRule) recordsWithDirectRules += 1;
        if (extremeRule) recordsWithExtremeRules += 1;

        records.push({
            key,
            poolId,
            optionId,
            category,
            tags,
            passives,
            effects,
            sourceEvidence: {
                handlerId: "applyHumanMartialSoul",
                operation: "addMartialSoul",
                formalContext: "douluo1:flow.formal-human.martial.<poolId>",
                fixedPassives: clone(fixedPassives[optionId] ?? []),
                sourceRule: clone(martialRule),
                directRule: clone(directRule),
                sharedRule: clone(sharedRule),
                ilEffects,
                ilPassives,
                ilFollowUps,
                extremeRule: clone(extremeRule),
                extremeEffects,
                extremePassives,
                followUpsAppliedByHandler: false
            }
        });
    }

    return {
        schemaVersion: "apk-martial-soul-runtime-evidence/1.0",
        packageVersion: "apk-canonical/2026-08-16",
        ownerAuthorization: "confirmed",
        availabilityPolicy: "preserve_apk_original_state",
        source: {
            apkSha256: SOURCE_SHA256,
            extractionMode: "static_source_mapping_only",
            gameplayExecuted: false,
            handlerId: "applyHumanMartialSoul",
            files: [
                {
                    path: relativePath(DOULUO1_SOURCE_PATH),
                    sha256: sha256File(DOULUO1_SOURCE_PATH),
                    roles: ["pool-category", "tags", "fixed-passives", "handler-boundary"]
                },
                {
                    path: relativePath(FOUNDATION_SOURCE_PATH),
                    sha256: sha256File(FOUNDATION_SOURCE_PATH),
                    roles: ["direct-rules", "shared-attribute-rules", "extreme-scope-rules"]
                },
                {
                    path: "data/apk-canonical/catalogs/martial-souls.json",
                    sha256: sha256File(CATALOG_PATH),
                    roles: ["canonical-options", "availability"]
                }
            ]
        },
        scope: {
            supported: [
                "normal addMartialSoul branch",
                "douluo1 formal-human martial pool flows"
            ],
            unresolved: [
                "beastSpecies* branch",
                "humanRingSpecies3/4/5 branch",
                "humanAwaken* branch",
                "humanMutatedReplacement branch",
                "humanGrowthMutatedReplacement branch"
            ],
            formalFlowPrefix: "douluo1:flow.formal-human.martial."
        },
        poolCategories: clone(poolCategories),
        summary: {
            catalogRecordCount: catalog.recordCount ?? catalog.records?.length ?? 0,
            recognizedCatalogRecords,
            evidenceRecordCount: records.length,
            recordsWithTypedEffects,
            recordsWithPassives,
            recordsWithTags,
            recordsWithSharedRules,
            recordsWithDirectRules,
            recordsWithExtremeRules,
            directRuleCount: martialRules.length,
            sharedRuleCount: sharedRules.length,
            extremeScopeRuleCount: Object.keys(extremeScopeRules).length,
            fixedPassiveOptionCount: Object.keys(fixedPassives).length,
            tagSwordOptionCount: swordOptionIds.size,
            tagDragonOptionCount: dragonOptionIds.size,
            tagDragonPoolCount: dragonPoolIds.size
        },
        records
    };
}

function main() {
    const evidence = buildEvidence();
    fs.mkdirSync(path.dirname(TARGET_PATH), { recursive: true });
    fs.writeFileSync(
        TARGET_PATH,
        `${JSON.stringify(evidence, null, 2)}\n`,
        "utf8"
    );
    process.stdout.write(`${JSON.stringify({
        status: "pass",
        target: relativePath(TARGET_PATH),
        sha256: sha256File(TARGET_PATH),
        bytes: fs.statSync(TARGET_PATH).size,
        summary: evidence.summary
    }, null, 2)}\n`);
}

main();
