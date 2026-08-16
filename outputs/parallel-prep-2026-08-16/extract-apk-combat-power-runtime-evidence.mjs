#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SOURCE_MODULE = path.join(
    ROOT,
    "apk-analysis",
    "E4FB340E",
    "derived",
    "pretty",
    "App-qyLEl8t4.js"
);
const PACK_MODULE = path.join(
    ROOT,
    "apk-analysis",
    "E4FB340E",
    "derived",
    "pretty",
    "douluo1-pack-C6xEgEus.js"
);
const FOUNDATION_MODULE = path.join(
    ROOT,
    "apk-analysis",
    "E4FB340E",
    "derived",
    "pretty",
    "human-foundation-CduvzjjO.js"
);
const TARGET_PATH = path.join(
    ROOT,
    "data",
    "apk-canonical",
    "catalogs",
    "combat-power-runtime-evidence.json"
);
const APK_SHA256 = "E4FB340E0DAD857A018E2F06982D32623BDD683B22BD44230A2257C35DAA11C";

function sha256File(filePath) {
    return crypto
        .createHash("sha256")
        .update(fs.readFileSync(filePath))
        .digest("hex")
        .toUpperCase();
}

function lineNumber(source, index) {
    return source.slice(0, index).split("\n").length;
}

function findDefinitionStart(source, name) {
    const pattern = new RegExp(`(?:const\\s+|\\n\\s*(?:,\\s*)?)${name}\\s*=`);
    const match = pattern.exec(source);
    if (!match) throw new Error(`Static definition ${name} was not found.`);
    return match.index + match[0].length;
}

function balancedLiteral(source, start) {
    let index = start;
    while (/\s/u.test(source[index] ?? "")) index += 1;
    const opening = source[index];
    if (opening !== "[" && opening !== "{") {
        throw new Error(`Static definition at ${start} does not start with a literal.`);
    }
    const closing = opening === "[" ? "]" : "}";
    let depth = 0;
    let quote = null;
    let escaped = false;
    for (; index < source.length; index += 1) {
        const character = source[index];
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
        if (character === "\"" || character === "'") {
            quote = character;
            continue;
        }
        if (character === opening) depth += 1;
        if (character === closing) {
            depth -= 1;
            if (depth === 0) return source.slice(start, index + 1).trim();
        }
    }
    throw new Error(`Static definition starting at ${start} is unbalanced.`);
}

function readDefinition(source, name) {
    const start = findDefinitionStart(source, name);
    const literal = balancedLiteral(source, start);
    // These literals are extracted from the checked-in, prettified APK bundle;
    // they are not application/gameplay execution.
    return {
        value: Function(`"use strict"; return (${literal});`)(),
        line: lineNumber(source, start)
    };
}

function readScalar(source, name) {
    const start = findDefinitionStart(source, name);
    const match = /^\s*(-?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)/iu.exec(
        source.slice(start)
    );
    if (!match) throw new Error(`Static scalar ${name} is not numeric.`);
    const literal = match[1];
    return {
        value: Function(`"use strict"; return (${literal});`)(),
        line: lineNumber(source, start)
    };
}

function readSet(source, name) {
    const definitionStart = findDefinitionStart(source, name);
    let start = definitionStart;
    while (/\s/u.test(source[start] ?? "")) start += 1;
    if (source.startsWith("new Set(", start)) {
        start += "new Set(".length;
    }
    const literal = balancedLiteral(source, start);
    const value = Function(`"use strict"; return (${literal});`)();
    if (!Array.isArray(value)) {
        throw new Error(`Static set ${name} is not an array literal.`);
    }
    return {
        values: value,
        line: lineNumber(source, definitionStart)
    };
}

function sourceFunctionLines(source, names) {
    return Object.fromEntries(names.map(name => {
        const match = new RegExp(`(?:function\\s+${name}\\b|class\\s+${name}\\b|static\\s+${name}\\()`).exec(source);
        return [name, match ? lineNumber(source, match.index) : null];
    }));
}

function main() {
    const source = fs.readFileSync(SOURCE_MODULE, "utf8");
    const levelPower = readDefinition(source, "ji");
    const beastCultivation = readDefinition(source, "zi");
    const agePower = readDefinition(source, "Ns");
    const ringQualityMultipliers = readDefinition(source, "ul");
    const martialSoulQuality = readDefinition(source, "dl");
    const martialSoulAvatarQuality = readDefinition(source, "cl");
    const attributeQuality = readDefinition(source, "fl");
    const bloodlineQuality = readDefinition(source, "Ui");
    const titlePower = readDefinition(source, "pl");
    const godArmorPower = readDefinition(source, "Eo");
    const constants = {
        levelClampMaximum: readScalar(source, "Ds").value,
        godBestowedPower: readScalar(source, "Fs").value,
        humanSoulCoreBaseCap: readScalar(source, "ml").value,
        domainBasisPoints: readScalar(source, "hl").value,
        soulCoreBasisPoints: readScalar(source, "gl").value,
        defaultItemBasisPoints: readScalar(source, "vl").value,
        divineQualityBasisPoints: 20000,
        soulBoneGodArmorMultiplier: 3,
        multiGodArmorEfficiencyBasisPoints: 8000,
        subHundredArtifactDivisor: 10,
        defaultStatusBasisPoints: 10000,
        severelyInjuredStatusBasisPoints: 5000,
        desperateStatusBasisPoints: 15000,
        beastMillionYearPower: 2510,
        beastMillionYearTribulationPower: 3510
    };
    const soulBoneParts = readDefinition(source, "co");
    const lowMartialSouls = readSet(source, "Pl");
    const topMartialSouls = readSet(source, "Cl");
    const subDragonRingTypes = readSet(source, "El");
    const earthDragonRingTypes = readSet(source, "Ll");
    const pureDragonRingTypes = readSet(source, "Al");
    const lowRingSpecies = readSet(source, "Us");
    const topRingSpecies = readSet(source, "Ws");
    const titleKinds = readDefinition(source, "Gi");
    const formulaLines = sourceFunctionLines(source, [
        "Ke",
        "qe",
        "En",
        "We",
        "Vs",
        "js",
        "bl",
        "yl",
        "zs",
        "wl",
        "Sl",
        "Il",
        "kl",
        "Rl",
        "_l",
        "Hi",
        "Ol",
        "Ln"
    ]);
    const evidence = {
        schemaVersion: "apk-combat-power-evidence/1.0",
        packageVersion: "apk-canonical/2026-08-17",
        ownerAuthorization: "confirmed",
        availabilityPolicy: "preserve_apk_original_state",
        source: {
            apkSha256: APK_SHA256,
            extractionMode: "static_source_mapping_only",
            gameplayExecuted: false,
            modules: [
                {
                    path: "apk-analysis/E4FB340E/derived/pretty/App-qyLEl8t4.js",
                    sha256: sha256File(SOURCE_MODULE),
                    roles: ["combat-power-engine", "source-static-constants"]
                },
                {
                    path: "apk-analysis/E4FB340E/derived/pretty/douluo1-pack-C6xEgEus.js",
                    sha256: sha256File(PACK_MODULE),
                    roles: ["formal-special-result-handler", "threshold-comparison"]
                },
                {
                    path: "apk-analysis/E4FB340E/derived/pretty/human-foundation-CduvzjjO.js",
                    sha256: sha256File(FOUNDATION_MODULE),
                    roles: ["formal-special-result-source-options"]
                }
            ],
            sourceFunctions: {
                combatCalculator: formulaLines,
                formalSpecialResultHandler: {
                    name: "fn",
                    module: "apk-analysis/E4FB340E/derived/pretty/douluo1-pack-C6xEgEus.js",
                    line: lineNumber(
                        fs.readFileSync(PACK_MODULE, "utf8"),
                        fs.readFileSync(PACK_MODULE, "utf8").indexOf("const fn =")
                    )
                }
            }
        },
        extraction: {
            scope: "APK combat-power.total used by douluo1 formal special-result checks",
            sourceFormulaCopiedAsTypedAdapter: true,
            inferredRules: [],
            unsupportedSourceBranches: []
        },
        runtimeContract: {
            totalField: "total",
            thresholdOperators: [">=", ">"],
            defaultThresholdOperator: ">=",
            comparison: "combatPower.total operator combatThreshold",
            deathThreshold: "failure effects are allowed only when combat total is below deathThreshold"
        },
        formula: {
            levelPower: levelPower.value,
            beastCultivation: beastCultivation.value,
            agePower: agePower.value,
            ringQualityMultipliers: ringQualityMultipliers.value,
            martialSoulQuality: martialSoulQuality.value,
            martialSoulAvatarQuality: martialSoulAvatarQuality.value,
            attributeQuality: attributeQuality.value,
            bloodlineQuality: bloodlineQuality.value,
            titlePower: titlePower.value,
            godArmorPower: godArmorPower.value,
            soulBoneParts: soulBoneParts.value,
            constants,
            staticOptionSets: {
                lowMartialSouls: lowMartialSouls.values,
                topMartialSouls: topMartialSouls.values,
                subDragonRingTypes: subDragonRingTypes.values,
                earthDragonRingTypes: earthDragonRingTypes.values,
                pureDragonRingTypes: pureDragonRingTypes.values,
                lowRingSpecies: lowRingSpecies.values,
                topRingSpecies: topRingSpecies.values
            },
            titleKinds: titleKinds.value,
            rounding: {
                finiteNumber: "throw",
                round: "APK qe: half away from zero for finite values",
                positiveScaledValue: "APK We: max(1, round(value * basisPoints / 10000)) unless zero/negative or minimum disabled",
                total: "max(1, round(base + components + status modifiers))",
                statusEffects: {
                    severelyInjured: "positive scaled total by 0.5",
                    desperate: "positive scaled total by 1.5"
                }
            },
            calculationSteps: [
                "human base = levelPower[level], beast base = beastCultivation[beastYears]",
                "human martial-soul quality and optional true-body quality are scaled from base",
                "soul-ring base and quality are derived from source ring years, quality and divine slots",
                "soul-bone base/quality and god-armor contribution are derived from source bone parts",
                "domains, artifacts, attributes, soul cores, items, special skills and other source components are accumulated",
                "status modifiers are applied after component accumulation"
            ]
        },
        fieldMapping: {
            level: "character.level",
            beastYears: "character.beastYears",
            martialSouls: "character.martialSouls",
            soulRings: "character.martialSouls[].rings",
            soulBones: "character.soulBones",
            godhood: "character.godhood or character.godTrial",
            artifacts: "character.artifacts",
            titles: "character.titles",
            domains: "character.domains",
            attributes: "character.attributes / character.elementProgress / character.beast.attributeStages",
            traits: "character.traits",
            flags: "character.flags"
        },
        validationAnchors: {
            formalSpecialOption: {
                poolId: "f4d48cb4-7f96-4153-addb-1570b9781a26",
                optionId: "27c4ae",
                combatThreshold: 47,
                combatThresholdOperator: ">=",
                sourceText: "战力低于于47点判定战斗失败，战败将失去1枚银灵币"
            },
            formalSpecialHandler: {
                module: "apk-analysis/E4FB340E/derived/pretty/douluo1-pack-C6xEgEus.js",
                sourceSemantics: "ut.total(character) >= threshold or > threshold"
            }
        }
    };
    fs.mkdirSync(path.dirname(TARGET_PATH), { recursive: true });
    fs.writeFileSync(TARGET_PATH, `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
    process.stdout.write(JSON.stringify({
        target: path.relative(ROOT, TARGET_PATH).replaceAll(path.sep, "/"),
        targetSha256: sha256File(TARGET_PATH),
        sourceModuleSha256: evidence.source.modules[0].sha256,
        lowMartialSoulCount: lowMartialSouls.values.length,
        topMartialSoulCount: topMartialSouls.values.length,
        lowRingSpeciesCount: lowRingSpecies.values.length,
        topRingSpeciesCount: topRingSpecies.values.length,
        bytes: fs.statSync(TARGET_PATH).size
    }, null, 2) + "\n");
}

main();
