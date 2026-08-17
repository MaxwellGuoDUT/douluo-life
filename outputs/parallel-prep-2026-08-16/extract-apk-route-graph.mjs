#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
    APK_ANALYSIS_ROOT,
    APK_SHA256
} from "./apk-provenance.mjs";

const ROOT = process.cwd();
const SOURCE_ROOT = path.join(
    ROOT,
    APK_ANALYSIS_ROOT,
    "derived",
    "pretty"
);
const CANONICAL_OPTIONS_PATH = path.join(
    ROOT,
    "data",
    "apk-canonical",
    "catalogs",
    "options.json"
);
const MARTIAL_SOUL_RUNTIME_EVIDENCE_PATH = path.join(
    ROOT,
    "data",
    "apk-canonical",
    "catalogs",
    "martial-soul-runtime-evidence.json"
);
const TARGET_PATH = path.join(
    ROOT,
    "data",
    "apk-canonical",
    "catalogs",
    "route-graph.json"
);
const SOURCE_SHA256 = APK_SHA256;
const PACKS = [
    {
        id: "douluo1",
        module: "douluo1-pack-C6xEgEus.js"
    },
    {
        id: "douluo2",
        module: "douluo2-pack-BsEUb2l9.js"
    }
];

function fail(message) {
    throw new Error(message);
}

function sha256(value) {
    return crypto
        .createHash("sha256")
        .update(value)
        .digest("hex")
        .toUpperCase();
}

function sha256File(filePath) {
    return sha256(fs.readFileSync(filePath));
}

function relativePath(filePath) {
    return path.relative(ROOT, filePath).replaceAll(path.sep, "/");
}

function installBrowserStubs() {
    if (globalThis.document) return;

    const makeElement = (tag = "div") => ({
        tagName: String(tag).toUpperCase(),
        relList: { supports: () => false },
        style: {},
        children: [],
        appendChild(value) {
            this.children.push(value);
        },
        addEventListener() {},
        removeEventListener() {},
        setAttribute() {},
        getAttribute() {
            return null;
        },
        getContext() {
            return null;
        },
        getBoundingClientRect() {
            return { width: 0, height: 0, top: 0, left: 0 };
        },
        click() {}
    });

    globalThis.window = {
        devicePixelRatio: 1,
        addEventListener() {},
        removeEventListener() {},
        matchMedia() {
            return {
                matches: false,
                addEventListener() {},
                removeEventListener() {}
            };
        },
        requestAnimationFrame() {
            return 0;
        },
        cancelAnimationFrame() {},
        setTimeout,
        clearTimeout,
        dispatchEvent() {},
        ResizeObserver: undefined,
        PointerEvent: undefined
    };
    globalThis.document = {
        createElement: makeElement,
        querySelectorAll() {
            return [];
        },
        getElementsByTagName() {
            return [];
        },
        querySelector() {
            return null;
        },
        addEventListener() {},
        removeEventListener() {},
        head: makeElement("head"),
        body: makeElement("body"),
        activeElement: null,
        hidden: false
    };
    globalThis.MutationObserver = class {
        observe() {}
        disconnect() {}
    };
}

function valueDescriptor(value) {
    if (typeof value === "function") {
        const source = String(value);
        return {
            kind: "dynamic-function",
            name: value.name || null,
            sourceHash: sha256(source),
            sourcePreview: source.slice(0, 240)
        };
    }
    if (value === undefined) {
        return { kind: "absent" };
    }
    if (typeof value === "string") {
        return { kind: "exact-string", value };
    }
    if (value === null) {
        return { kind: "null", value: null };
    }
    return {
        kind: Array.isArray(value) ? "array" : typeof value,
        value: cloneSourceValue(value)
    };
}

function cloneSourceValue(value, seen = new WeakSet()) {
    if (typeof value === "function") return valueDescriptor(value);
    if (value === undefined || value === null) return value;
    if (typeof value !== "object") return value;
    if (seen.has(value)) return { kind: "circular-reference" };
    seen.add(value);
    if (Array.isArray(value)) {
        return value.map(item => cloneSourceValue(item, seen));
    }
    const result = {};
    for (const [key, item] of Object.entries(value)) {
        result[key] = cloneSourceValue(item, seen);
    }
    return result;
}

function exactTarget(value, targetSets) {
    const descriptor = valueDescriptor(value);
    if (descriptor.kind !== "exact-string") return descriptor;
    const target = descriptor.value;
    const targetKinds = [];
    if (targetSets.flowIds.has(target)) targetKinds.push("flow");
    if (targetSets.poolIds.has(target)) targetKinds.push("pool");
    if (targetSets.actionIds?.has(target)) targetKinds.push("action");
    if (targetSets.resolverIds?.has(target)) targetKinds.push("resolver");
    if (targetSets.customHandlerIds?.has(target)) targetKinds.push("customHandler");
    return {
        ...descriptor,
        target,
        targetKinds,
        resolved: targetKinds.length > 0
    };
}

function extractFlow(flow, targetSets) {
    const raw = cloneSourceValue(flow);
    return {
        id: flow.id,
        source: raw,
        route: {
            pool: exactTarget(flow.poolId, targetSets),
            next: exactTarget(flow.next, targetSets),
            possibleNext: Array.isArray(flow.possibleNext)
                ? flow.possibleNext.map(value => exactTarget(value, targetSets))
                : [],
            getNext: exactTarget(flow.getNext, targetSets),
            leaveNext: exactTarget(flow.leaveNext, targetSets),
            action: exactTarget(flow.action, targetSets)
        }
    };
}

function terminalKinds(effects) {
    const kinds = new Set();
    for (const effect of Array.isArray(effects) ? effects : []) {
        if (effect?.type === "death") kinds.add("death");
        if (effect?.type === "ending") kinds.add("ending");
    }
    return [...kinds];
}

function extractOption(
    option,
    poolId,
    canonicalEvidenceByKey,
    canonicalSupplementalEffectsByKey,
    martialSoulRuntimeEvidenceByKey
) {
    const key = `${poolId}:${option.id}`;
    const evidence = canonicalEvidenceByKey.get(key) ?? null;
    const supplementalEffects = canonicalSupplementalEffectsByKey.get(key) ?? null;
    const martialSoulEvidence = martialSoulRuntimeEvidenceByKey.get(key) ?? null;
    const effects = Array.isArray(option.effects) ? option.effects : [];
    const followUps = Array.isArray(option.followUps) ? option.followUps : [];
    return {
        id: option.id,
        source: cloneSourceValue(option),
        route: {
            next: valueDescriptor(option.next),
            customHandler: valueDescriptor(option.customHandler),
            followUps: cloneSourceValue(followUps),
            requirements: cloneSourceValue(option.requirements ?? []),
            rerollWhen: cloneSourceValue(option.rerollWhen ?? []),
            effects: cloneSourceValue(effects),
            terminalKinds: terminalKinds(effects),
            canonicalEvidenceKey: evidence ? key : null
        },
        canonicalEvidence: evidence,
        canonicalSupplementalEffects: supplementalEffects,
        martialSoulRuntimeEvidence: martialSoulEvidence
    };
}

function extractPool(
    pool,
    canonicalEvidenceByKey,
    canonicalSupplementalEffectsByKey,
    martialSoulRuntimeEvidenceByKey
) {
    const knownKeys = new Set([
        "id",
        "canonicalId",
        "name",
        "tags",
        "timelineScope",
        "contentOwner",
        "contentStatus",
        "developmentOnly",
        "poolKind",
        "options"
    ]);
    const extra = {};
    for (const [key, value] of Object.entries(pool)) {
        if (!knownKeys.has(key)) extra[key] = cloneSourceValue(value);
    }
    return {
        id: pool.id,
        canonicalId: pool.canonicalId ?? pool.id,
        name: pool.name ?? null,
        tags: cloneSourceValue(pool.tags ?? []),
        timelineScope: pool.timelineScope ?? null,
        contentOwner: pool.contentOwner ?? null,
        contentStatus: pool.contentStatus ?? null,
        developmentOnly: pool.developmentOnly ?? null,
        poolKind: pool.poolKind ?? null,
        extra,
        options: (Array.isArray(pool.options) ? pool.options : [])
            .map(option => extractOption(
                option,
                pool.id,
                canonicalEvidenceByKey,
                canonicalSupplementalEffectsByKey,
                martialSoulRuntimeEvidenceByKey
            ))
    };
}

function collectMartialSoulRuntimeEvidence() {
    if (!fs.existsSync(MARTIAL_SOUL_RUNTIME_EVIDENCE_PATH)) {
        return {
            available: false,
            sourcePath: relativePath(MARTIAL_SOUL_RUNTIME_EVIDENCE_PATH),
            sourceSha256: null,
            recordCount: 0,
            evidenceByKey: new Map()
        };
    }

    const raw = fs.readFileSync(MARTIAL_SOUL_RUNTIME_EVIDENCE_PATH, "utf8");
    const evidence = JSON.parse(raw);
    const evidenceByKey = new Map();
    for (const record of evidence.records ?? []) {
        if (!record?.key) continue;
        evidenceByKey.set(record.key, {
            status: "source-proven",
            handlerId: record.sourceEvidence?.handlerId ?? "applyHumanMartialSoul",
            operation: record.sourceEvidence?.operation ?? "addMartialSoul",
            formalContext: record.sourceEvidence?.formalContext
                ?? "douluo1:flow.formal-human.martial.<poolId>",
            category: record.category ?? null,
            tags: cloneSourceValue(record.tags ?? []),
            passives: cloneSourceValue(record.passives ?? []),
            effects: cloneSourceValue(record.effects ?? [])
        });
    }
    return {
        available: true,
        sourcePath: relativePath(MARTIAL_SOUL_RUNTIME_EVIDENCE_PATH),
        sourceSha256: sha256File(MARTIAL_SOUL_RUNTIME_EVIDENCE_PATH),
        recordCount: evidenceByKey.size,
        evidenceByKey
    };
}

function collectCanonicalEvidence() {
    if (!fs.existsSync(CANONICAL_OPTIONS_PATH)) {
        return {
            records: [],
            summary: {
                available: false,
                sourcePath: relativePath(CANONICAL_OPTIONS_PATH),
                sourceSha256: null,
                recordCount: 0,
                uniqueKeys: 0,
                keysWithFailureEffects: 0,
                keysWithTerminalMarkers: 0,
                variantConflicts: 0,
                keysWithSupplementalEffects: 0,
                supplementalEffectConflicts: 0
            },
            evidenceByKey: new Map(),
            supplementalEffectsByKey: new Map()
        };
    }

    const raw = fs.readFileSync(CANONICAL_OPTIONS_PATH, "utf8");
    const catalog = JSON.parse(raw);
    const byKey = new Map();
    const supplementalByKey = new Map();
    for (const record of catalog.records ?? []) {
        const normalized = record.normalized ?? {};
        const poolId = normalized.pool_id;
        const optionId = normalized.option_id;
        if (!poolId || !optionId) continue;
        const key = `${poolId}:${optionId}`;
        const effects = Array.isArray(normalized.effects)
            ? normalized.effects
            : [];
        if (effects.length > 0) {
            if (!supplementalByKey.has(key)) supplementalByKey.set(key, []);
            supplementalByKey.get(key).push({
                dataset: normalized.dataset ?? null,
                sourceId: record.sourceRef?.sourceId ?? null,
                effects: cloneSourceValue(effects)
            });
        }
        const failureEffects = Array.isArray(normalized.failure_effects)
            ? normalized.failure_effects
            : [];
        const endingLike = normalized.ending_like === true;
        const deathLike = normalized.death_like === true;
        if (failureEffects.length === 0 && !endingLike && !deathLike) continue;
        if (!byKey.has(key)) byKey.set(key, []);
        byKey.get(key).push({
            dataset: normalized.dataset ?? null,
            sourceId: record.sourceRef?.sourceId ?? null,
            failureEffects: cloneSourceValue(failureEffects),
            terminalKinds: [
                ...(endingLike ? ["ending"] : []),
                ...(deathLike ? ["death"] : [])
            ],
            canonicalNext: normalized.next ?? null,
            canonicalCustomHandler: normalized.custom_handler || null
        });
    }

    const records = [...byKey.entries()]
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, variants]) => ({
            key,
            variants,
            variantCount: variants.length,
            variantFingerprints: [...new Set(variants.map(variant => JSON.stringify({
                failureEffects: variant.failureEffects,
                terminalKinds: variant.terminalKinds,
                canonicalNext: variant.canonicalNext,
                canonicalCustomHandler: variant.canonicalCustomHandler
            })))]
                .map(value => sha256(value))
        }));
    const keysWithFailureEffects = records.filter(record => record.variants
        .some(variant => variant.failureEffects.length > 0)).length;
    const keysWithTerminalMarkers = records.filter(record => record.variants
        .some(variant => variant.terminalKinds.length > 0)).length;
    const variantConflicts = records.filter(record => record.variantFingerprints.length > 1).length;
    const evidenceByKey = new Map(records.map(record => [record.key, record]));
    const supplementalEffectsByKey = new Map();
    for (const [key, variants] of supplementalByKey.entries()) {
        const fingerprints = [...new Set(variants.map(variant => (
            JSON.stringify(variant.effects)
        )))];
        if (fingerprints.length === 1) {
            supplementalEffectsByKey.set(key, {
                status: "unique",
                effects: JSON.parse(fingerprints[0]),
                sourceCount: variants.length,
                datasets: [...new Set(variants.map(variant => variant.dataset)
                    .filter(Boolean))],
                sourceIds: [...new Set(variants.map(variant => variant.sourceId)
                    .filter(Boolean))]
            });
        } else {
            supplementalEffectsByKey.set(key, {
                status: "variant-conflict",
                sourceCount: variants.length,
                variantCount: fingerprints.length,
                variantFingerprints: fingerprints.map(value => sha256(value))
            });
        }
    }
    const supplementalEffectConflicts = [...supplementalEffectsByKey.values()]
        .filter(value => value.status === "variant-conflict").length;
    return {
        records,
        evidenceByKey,
        supplementalEffectsByKey,
        summary: {
            available: true,
            sourcePath: relativePath(CANONICAL_OPTIONS_PATH),
            sourceSha256: sha256(raw),
            recordCount: catalog.recordCount ?? catalog.records?.length ?? 0,
            uniqueKeys: records.length,
            keysWithFailureEffects,
            keysWithTerminalMarkers,
            variantConflicts,
            keysWithSupplementalEffects: supplementalEffectsByKey.size,
            supplementalEffectConflicts
        }
    };
}

async function loadPack(pack) {
    const modulePath = path.join(SOURCE_ROOT, pack.module);
    if (!fs.existsSync(modulePath)) fail(`Missing APK pack module: ${modulePath}`);
    const imported = await import(pathToFileURL(modulePath).href);
    const value = imported.default;
    if (!value?.manifest || !value?.game) {
        fail(`APK pack does not expose manifest/game: ${pack.id}`);
    }
    return {
        id: pack.id,
        module: relativePath(modulePath),
        moduleSha256: sha256File(modulePath),
        manifest: cloneSourceValue(value.manifest),
        aliases: cloneSourceValue(value.aliases ?? null),
        game: value.game
    };
}

function summarizePack(pack, flows, pools) {
    const options = pools.flatMap(pool => pool.options);
    const flowCount = flows.length;
    const poolCount = pools.length;
    const optionCount = options.length;
    const directFlowNext = flows.filter(flow => flow.route.next.kind === "exact-string").length;
    const dynamicFlowResolvers = flows.filter(flow => flow.route.getNext.kind === "exact-string").length;
    const flowPoolNodes = flows.filter(flow => flow.route.pool.kind === "exact-string").length;
    const possibleNextEntries = flows.reduce(
        (count, flow) => count + flow.route.possibleNext.length,
        0
    );
    const directOptionNext = options.filter(option => (
        option.route.next.kind === "exact-string"
    )).length;
    const optionWithoutNext = options.filter(option => (
        option.route.next.kind === "absent"
    )).length;
    const optionsWithRequirements = options.filter(option => (
        option.route.requirements.length > 0
    )).length;
    const optionsWithFailureEvidence = options.filter(option => (
        option.canonicalEvidence?.variants?.some(variant => (
            variant.failureEffects.length > 0
        ))
    )).length;
    const terminalOptions = options.filter(option => (
        option.route.terminalKinds.length > 0
        || option.canonicalEvidence?.variants?.some(variant => (
            variant.terminalKinds.length > 0
        ))
    )).length;
    return {
        flows: flowCount,
        pools: poolCount,
        options: optionCount,
        flowPoolNodes,
        directFlowNext,
        dynamicFlowResolvers,
        possibleNextEntries,
        directOptionNext,
        optionWithoutNext,
        optionsWithRequirements,
        optionsWithFailureEvidence,
        terminalOptions,
        actions: pack.game.flowActions ? Object.keys(pack.game.flowActions).length : 0,
        resolvers: pack.game.flowResolvers ? Object.keys(pack.game.flowResolvers).length : 0,
        customHandlers: pack.game.customHandlers
            ? Object.keys(pack.game.customHandlers).length
            : 0
    };
}

function collectReferenceDiagnostics(packGraphs) {
    const allFlowIds = new Set();
    const allPoolIds = new Set();
    for (const pack of packGraphs) {
        for (const flow of pack.flows) allFlowIds.add(flow.id);
        for (const pool of pack.pools) allPoolIds.add(pool.id);
    }
    const missing = [];
    const count = {
        exactFlowReferences: 0,
        exactPoolReferences: 0,
        dynamicResolverReferences: 0,
        unresolvedDynamicResolverReferences: 0,
        missingExactReferences: 0,
        crossPackExactReferences: 0,
        flowIdCollisions: 0,
        poolIdCollisions: 0
    };
    const seenFlowIds = new Map();
    const seenPoolIds = new Map();
    for (const pack of packGraphs) {
        for (const flow of pack.flows) {
            if (flow.route.pool.kind === "exact-string") {
                const target = flow.route.pool.target;
                if (allPoolIds.has(target)) {
                    count.exactPoolReferences += 1;
                    if (!pack.pools.some(pool => pool.id === target)) {
                        count.crossPackExactReferences += 1;
                    }
                } else {
                    count.missingExactReferences += 1;
                    missing.push({ packId: pack.id, owner: flow.id, field: "poolId", target });
                }
            }
            if (flow.route.getNext.kind === "exact-string") {
                if (flow.route.getNext.targetKinds?.includes("resolver")) {
                    count.dynamicResolverReferences += 1;
                } else {
                    count.unresolvedDynamicResolverReferences += 1;
                    missing.push({
                        packId: pack.id,
                        owner: flow.id,
                        field: "getNext",
                        target: flow.route.getNext.target
                    });
                }
            }
            for (const field of ["next", "leaveNext"]) {
                const transition = flow.route[field];
                if (transition.kind !== "exact-string") continue;
                const target = transition.target;
                if (allFlowIds.has(target)) {
                    count.exactFlowReferences += 1;
                    if (!pack.flows.some(candidate => candidate.id === target)) {
                        count.crossPackExactReferences += 1;
                    }
                } else {
                    count.missingExactReferences += 1;
                    missing.push({ packId: pack.id, owner: flow.id, field, target });
                }
            }
            for (const transition of flow.route.possibleNext) {
                if (transition.kind !== "exact-string") continue;
                const target = transition.target;
                if (allFlowIds.has(target)) {
                    count.exactFlowReferences += 1;
                    if (!pack.flows.some(candidate => candidate.id === target)) {
                        count.crossPackExactReferences += 1;
                    }
                } else {
                    count.missingExactReferences += 1;
                    missing.push({
                        packId: pack.id,
                        owner: flow.id,
                        field: "possibleNext",
                        target
                    });
                }
            }
        }
        for (const pool of pack.pools) {
            for (const option of pool.options) {
                const transition = option.route.next;
                if (transition.kind === "exact-string") {
                    const target = transition.value;
                    if (!allFlowIds.has(target)) {
                        count.missingExactReferences += 1;
                        missing.push({
                            packId: pack.id,
                            owner: `${pool.id}:${option.id}`,
                            field: "option.next",
                            target
                        });
                    }
                }
                for (const followUp of option.route.followUps) {
                    if (followUp?.targetPoolId && !allPoolIds.has(followUp.targetPoolId)) {
                        count.missingExactReferences += 1;
                        missing.push({
                            packId: pack.id,
                            owner: `${pool.id}:${option.id}`,
                            field: "followUps.targetPoolId",
                            target: followUp.targetPoolId
                        });
                    }
                }
            }
        }
        for (const flow of pack.flows) {
            if (!seenFlowIds.has(flow.id)) seenFlowIds.set(flow.id, []);
            seenFlowIds.get(flow.id).push(pack.id);
        }
        for (const pool of pack.pools) {
            if (!seenPoolIds.has(pool.id)) seenPoolIds.set(pool.id, []);
            seenPoolIds.get(pool.id).push(pack.id);
        }
    }
    count.flowIdCollisions = [...seenFlowIds.values()].filter(ids => ids.length > 1).length;
    count.poolIdCollisions = [...seenPoolIds.values()].filter(ids => ids.length > 1).length;
    return {
        count,
        missingExactReferences: missing,
        collisions: {
            flowIds: [...seenFlowIds.entries()]
                .filter(([, ids]) => ids.length > 1)
                .map(([id, packs]) => ({ id, packs })),
            poolIds: [...seenPoolIds.entries()]
                .filter(([, ids]) => ids.length > 1)
                .map(([id, packs]) => ({ id, packs }))
        }
    };
}

async function main() {
    installBrowserStubs();
    const canonicalEvidence = collectCanonicalEvidence();
    const martialSoulRuntimeEvidence = collectMartialSoulRuntimeEvidence();
    const packGraphs = [];
    for (const packConfig of PACKS) {
        const pack = await loadPack(packConfig);
        const rawFlows = Object.values(pack.game.flows ?? {});
        const rawPools = Array.isArray(pack.game.pools) ? pack.game.pools : [];
        const targetSets = {
            flowIds: new Set(rawFlows.map(flow => flow.id)),
            poolIds: new Set(rawPools.map(pool => pool.id)),
            actionIds: new Set(Object.keys(pack.game.flowActions ?? {})),
            resolverIds: new Set(Object.keys(pack.game.flowResolvers ?? {})),
            customHandlerIds: new Set(Object.keys(pack.game.customHandlers ?? {}))
        };
        const flows = rawFlows.map(flow => extractFlow(flow, targetSets));
        const pools = rawPools.map(pool => extractPool(
            pool,
            canonicalEvidence.evidenceByKey,
            canonicalEvidence.supplementalEffectsByKey,
            martialSoulRuntimeEvidence.evidenceByKey
        ));
        const graph = {
            id: pack.id,
            sourceModule: pack.module,
            sourceModuleSha256: pack.moduleSha256,
            manifest: pack.manifest,
            aliases: pack.aliases,
            entryFlowId: pack.manifest.entryFlowId ?? null,
            registries: {
                actionIds: Object.keys(pack.game.flowActions ?? {}).sort(),
                resolverIds: Object.keys(pack.game.flowResolvers ?? {}).sort(),
                customHandlerIds: Object.keys(pack.game.customHandlers ?? {}).sort()
            },
            summary: summarizePack(pack, flows, pools),
            flows,
            pools
        };
        packGraphs.push(graph);
    }

    const graph = {
        schemaVersion: "apk-route-graph/1.0",
        packageVersion: "apk-canonical/2026-08-16",
        status: "source_routes_recovered_dynamic_handlers_explicit",
        source: {
            apkSha256: SOURCE_SHA256,
            sourceRoot: relativePath(SOURCE_ROOT),
            extractionMode: "bundled_static_export_materialization",
            gameplayExecuted: false,
            transitionPolicy: "exact_string_edges_only; action_and_resolver_behavior_remains_explicit_dynamic"
        },
        generatedBy: relativePath(path.join(
            ROOT,
            "outputs",
            "parallel-prep-2026-08-16",
            "extract-apk-route-graph.mjs"
        )),
        canonicalEvidence: {
            ...canonicalEvidence.summary,
            records: canonicalEvidence.records
        },
        martialSoulRuntimeEvidence: {
            available: martialSoulRuntimeEvidence.available,
            sourcePath: martialSoulRuntimeEvidence.sourcePath,
            sourceSha256: martialSoulRuntimeEvidence.sourceSha256,
            recordCount: martialSoulRuntimeEvidence.recordCount,
            scope: "base addMartialSoul branch only; awakening and mutation contexts remain unresolved"
        },
        packs: packGraphs,
        diagnostics: collectReferenceDiagnostics(packGraphs)
    };

    fs.mkdirSync(path.dirname(TARGET_PATH), { recursive: true });
    fs.writeFileSync(TARGET_PATH, `${JSON.stringify(graph, null, 2)}\n`, "utf8");
    const output = {
        target: relativePath(TARGET_PATH),
        targetSha256: sha256File(TARGET_PATH),
        bytes: fs.statSync(TARGET_PATH).size,
        packs: packGraphs.map(pack => ({
            id: pack.id,
            entryFlowId: pack.entryFlowId,
            summary: pack.summary
        })),
        canonicalEvidence: canonicalEvidence.summary,
        diagnostics: graph.diagnostics.count
    };
    process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
}

main().catch(error => {
    console.error(error?.stack ?? error);
    process.exitCode = 1;
});
