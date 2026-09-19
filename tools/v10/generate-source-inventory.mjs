#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const OUTPUT_ROOT = path.join(ROOT, "data", "v10");
const CHECK_ONLY = process.argv.includes("--check");
const VAULT_ARG_INDEX = process.argv.indexOf("--vault");
const DEFAULT_VAULT = path.join(
    path.dirname(ROOT),
    "douluo-life-source-vault",
    "5ba6453",
    "apk-analysis",
    "E4FB340E"
);
const VAULT_ROOT = path.resolve(
    VAULT_ARG_INDEX >= 0 ? process.argv[VAULT_ARG_INDEX + 1] : (
        process.env.DOULUO_SOURCE_VAULT || DEFAULT_VAULT
    )
);
const SOURCE_ROOT = path.join(VAULT_ROOT, "derived", "pretty");
const PACKS = Object.freeze([
    Object.freeze({ id: "douluo1", module: "douluo1-pack-C6xEgEus.js" }),
    Object.freeze({ id: "douluo2", module: "douluo2-pack-BsEUb2l9.js" })
]);
const RUNTIME_MODULES = Object.freeze([
    "App-qyLEl8t4.js",
    "human-foundation-CduvzjjO.js",
    "index-C02WUcAm.js",
    "douluo1-pack-C6xEgEus.js",
    "douluo2-pack-BsEUb2l9.js",
    "index-CfLpLgGT.js",
    "author-revision-aliases-DpeVpXl5.js"
]);
const DOULUO1_INTERNAL_IMPORTS = Object.freeze([
    "App-qyLEl8t4.js",
    "human-foundation-CduvzjjO.js",
    "index-C02WUcAm.js"
]);

function fail(message) {
    throw new Error(message);
}

function installBrowserStubs() {
    if (globalThis.document) return;
    const makeElement = (tag = "div") => ({
        tagName: String(tag).toUpperCase(),
        relList: { supports: () => false },
        style: {},
        children: [],
        appendChild(value) { this.children.push(value); },
        addEventListener() {},
        removeEventListener() {},
        setAttribute() {},
        getAttribute() { return null; },
        getContext() { return null; },
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
        requestAnimationFrame() { return 0; },
        cancelAnimationFrame() {},
        setTimeout,
        clearTimeout,
        dispatchEvent() {},
        ResizeObserver: undefined,
        PointerEvent: undefined
    };
    globalThis.document = {
        createElement: makeElement,
        querySelectorAll() { return []; },
        getElementsByTagName() { return []; },
        querySelector() { return null; },
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

function cloneSourceValue(value, seen = new WeakSet()) {
    if (typeof value === "function") {
        return {
            kind: "dynamic-function",
            name: value.name || null,
            arity: value.length
        };
    }
    if (value === undefined) return { kind: "absent" };
    if (value === null || typeof value !== "object") return value;
    if (seen.has(value)) return { kind: "circular-reference" };
    seen.add(value);
    if (Array.isArray(value)) {
        return value.map(item => cloneSourceValue(item, seen));
    }
    return Object.fromEntries(Object.entries(value).map(([key, item]) => (
        [key, cloneSourceValue(item, seen)]
    )));
}

function valueDescriptor(value, targetSets = null) {
    if (typeof value === "function") return cloneSourceValue(value);
    if (value === undefined) return { kind: "absent" };
    if (value === null) return { kind: "null", value: null };
    if (typeof value !== "string") {
        return {
            kind: Array.isArray(value) ? "array" : typeof value,
            value: cloneSourceValue(value)
        };
    }
    const descriptor = { kind: "exact-string", value };
    if (!targetSets) return descriptor;
    const targetKinds = Object.entries(targetSets)
        .filter(([, values]) => values.has(value))
        .map(([kind]) => kind);
    return {
        ...descriptor,
        targetKinds,
        resolved: targetKinds.length > 0
    };
}

function routeFlow(flow, targetSets) {
    return {
        id: flow.id,
        source: cloneSourceValue(flow),
        route: {
            pool: valueDescriptor(flow.poolId, targetSets),
            next: valueDescriptor(flow.next, targetSets),
            possibleNext: Array.isArray(flow.possibleNext)
                ? flow.possibleNext.map(value => valueDescriptor(value, targetSets))
                : [],
            getNext: valueDescriptor(flow.getNext, targetSets),
            leaveNext: valueDescriptor(flow.leaveNext, targetSets),
            action: valueDescriptor(flow.action, targetSets)
        }
    };
}

function routePool(pool, targetSets) {
    return {
        id: pool.id,
        source: cloneSourceValue(pool),
        options: (Array.isArray(pool.options) ? pool.options : []).map(option => ({
            id: option.id,
            source: cloneSourceValue(option),
            route: {
                next: valueDescriptor(option.next, targetSets),
                customHandler: valueDescriptor(option.customHandler, targetSets),
                followUps: cloneSourceValue(option.followUps ?? []),
                requirements: cloneSourceValue(option.requirements ?? []),
                rerollWhen: cloneSourceValue(option.rerollWhen ?? []),
                effects: cloneSourceValue(option.effects ?? []),
                failureEffects: cloneSourceValue(option.failureEffects ?? [])
            }
        }))
    };
}

function addReference(map, id, owner, field) {
    if (typeof id !== "string" || !map.has(id)) return;
    map.get(id).push({ owner, field });
}

function collectRegistry(kind, registry, flows, pools) {
    const ids = Object.keys(registry ?? {}).sort();
    const references = new Map(ids.map(id => [id, []]));
    for (const flow of flows) {
        if (kind === "action") addReference(references, flow.action, flow.id, "action");
        if (kind === "resolver") addReference(references, flow.getNext, flow.id, "getNext");
    }
    if (kind === "customHandler") {
        for (const pool of pools) {
            for (const option of pool.options ?? []) {
                addReference(
                    references,
                    option.customHandler,
                    `${pool.id}:${option.id}`,
                    "customHandler"
                );
            }
        }
    }
    return ids.map(id => ({
        id,
        implementation: cloneSourceValue(registry[id]),
        referenceCount: references.get(id).length,
        references: references.get(id)
    }));
}

function collectEffects(flows, pools) {
    const byType = new Map();
    const untyped = [];
    const visit = (owner, field, effects) => {
        for (const [index, effect] of (Array.isArray(effects) ? effects : []).entries()) {
            const reference = { owner, field, index };
            if (!effect || typeof effect.type !== "string") {
                untyped.push({ ...reference, value: cloneSourceValue(effect) });
                continue;
            }
            if (!byType.has(effect.type)) byType.set(effect.type, []);
            byType.get(effect.type).push(reference);
        }
    };
    for (const flow of flows) {
        visit(flow.id, "effects", flow.effects);
        visit(flow.id, "failureEffects", flow.failureEffects);
    }
    for (const pool of pools) {
        for (const option of pool.options ?? []) {
            const owner = `${pool.id}:${option.id}`;
            visit(owner, "effects", option.effects);
            visit(owner, "failureEffects", option.failureEffects);
        }
    }
    return {
        types: [...byType.entries()]
            .sort(([left], [right]) => left.localeCompare(right))
            .map(([type, references]) => ({ type, count: references.length, references })),
        untyped
    };
}

function collectTerminals(effectInventory) {
    const explicit = effectInventory.types
        .filter(item => item.type === "death" || item.type === "ending")
        .map(item => ({
            kind: item.type,
            count: item.count,
            references: item.references
        }));
    return {
        schemaVersion: "v10-terminal-inventory/1.0",
        policy: "explicit death/ending effects only; no inference from labels or handler names",
        explicit,
        explicitCount: explicit.reduce((total, item) => total + item.count, 0),
        typedBoundary: {
            status: "partial",
            code: "DYNAMIC_TERMINAL_SEMANTICS_REQUIRE_RUNTIME_CONNECTION",
            detail: "Dynamic action, resolver and customHandler terminal behavior is preserved but not inferred."
        }
    };
}

function summarize(flows, pools, registries, effectInventory) {
    const options = pools.flatMap(pool => pool.options ?? []);
    return {
        flows: flows.length,
        pools: pools.length,
        options: options.length,
        actions: registries.actions.length,
        resolvers: registries.resolvers.length,
        customHandlers: registries.customHandlers.length,
        effectTypes: effectInventory.types.length,
        effectOccurrences: effectInventory.types.reduce((sum, item) => sum + item.count, 0),
        untypedEffects: effectInventory.untyped.length
    };
}

async function extractDouluo1LandClosure(modulePath) {
    const moduleRoot = path.dirname(modulePath);
    let source = fs.readFileSync(modulePath, "utf8");
    for (const fileName of DOULUO1_INTERNAL_IMPORTS) {
        source = source.replaceAll(
            `"./${fileName}"`,
            JSON.stringify(pathToFileURL(path.join(moduleRoot, fileName)).href)
        );
    }
    const exportAnchor = "export { zs as default };";
    if (!source.includes(exportAnchor)) {
        fail("Douluo I source export anchor changed before land-finale extraction");
    }
    source = source.replace(
        exportAnchor,
        "export { zs as default, ps as __v10LandFinalPool, Ds as __v10BeastFlows };"
    );
    const internal = await import(
        `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`
    );
    const flow = internal.__v10BeastFlows?.beastLandFinal;
    const pool = internal.__v10LandFinalPool;
    if (flow?.id !== "beastLandFinal"
        || flow.poolId !== "d39bb131-6949-4a46-9733-19d0335f668c"
        || flow.next !== flow.id
        || pool?.id !== flow.poolId
        || pool.options?.length !== 7
        || pool.options.some(option => option.customHandler !== "resolveBeastLandFinal")) {
        fail("Douluo I land-finale source closure no longer matches its exact source shape");
    }
    return {
        id: "beast-land-finale",
        reason: "final source export filters a referenced display pool",
        flow: cloneSourceValue(flow),
        pool: cloneSourceValue(pool)
    };
}

async function loadPack(config) {
    const modulePath = path.join(SOURCE_ROOT, config.module);
    if (!fs.existsSync(modulePath)) fail(`Missing source pack module: ${modulePath}`);
    const imported = await import(pathToFileURL(modulePath).href);
    const pack = imported.default;
    if (!pack?.manifest || !pack?.game) {
        fail(`Source pack does not expose manifest/game: ${config.id}`);
    }
    if (pack.manifest.id !== config.id) {
        fail(`Source pack id mismatch: expected ${config.id}, got ${pack.manifest.id}`);
    }
    let flows = Object.values(pack.game.flows ?? {});
    let pools = Array.isArray(pack.game.pools) ? pack.game.pools : [];
    let runtimeContract = null;
    let routeEntries = null;
    let customHandlers = pack.game.customHandlers;
    let contentIdentity = null;
    if (config.id === "douluo2") {
        const identity = createHash("sha256");
        for (const name of [config.module, ...DOULUO1_INTERNAL_IMPORTS, "author-revision-aliases-DpeVpXl5.js", "index-CfLpLgGT.js"]) {
            identity.update(name).update(fs.readFileSync(path.join(SOURCE_ROOT, name)));
        }
        contentIdentity = `douluo2:${identity.digest("hex")}`;
        const appPath = path.join(SOURCE_ROOT, "App-qyLEl8t4.js");
        const appSource = fs.readFileSync(appPath, "utf8");
        const cases = (start, end) => {
            const from = appSource.indexOf(start);
            const to = appSource.indexOf(end, from);
            if (from < 0 || to <= from) fail("Source engine contract anchors changed");
            return [...new Set([...appSource.slice(from, to).matchAll(/case "([^"]+)":/gu)].map(match => match[1]))].sort();
        };
        runtimeContract = {
            effectTypes: cases("function Na(t, e, n)", "function Kt(t, e"),
            requirementTypes: cases("function Nn(t, e)", "function Yt(t, e")
        };
        const routingStart = appSource.indexOf("const ko = {");
        const routingEnd = appSource.indexOf("const th = [", routingStart);
        if (routingStart < 0 || routingEnd < 0) fail("Source App entry routing anchors changed");
        const routing = await import(`data:text/javascript;base64,${Buffer.from(
            appSource.slice(routingStart, routingEnd) + "\nexport { ks, eh, ko };"
        ).toString("base64")}`);
        const bootstrap = (await import(pathToFileURL(path.join(SOURCE_ROOT, "index-CfLpLgGT.js")).href)).default;
        const entry = bootstrap.game.flows["bootstrap:flow.beast-period"];
        const periodPool = bootstrap.game.pools.find(pool => pool.id === entry.poolId);
        const options = periodPool.options.filter(option => routing.eh.has(option.id));
        if (options.length !== routing.eh.size || options.some(option => routing.ks(periodPool.id, option.id)?.packId !== "douluo2")
            || !pack.game.flows["douluo2:flow.foundation.entry"]) fail("Source Douluo II period bridge is incomplete");
        // Existing source action initializeDouluo2BeastEra consumes the exact
        // bootstrap period and transitions into the source beast setup.
        flows = [...flows, { ...entry, next: "douluo2:flow.foundation.entry" }];
        pools = [...pools, { ...periodPool, options }];
        customHandlers = { ...customHandlers, "bootstrap:handler.period": bootstrap.game.customHandlers["bootstrap:handler.period"] };
        routeEntries = { human: pack.manifest.entryFlowId, beast: entry.id };
    }
    const recoveredClosures = [];
    if (config.id === "douluo1") {
        const closure = await extractDouluo1LandClosure(modulePath);
        if (flows.some(flow => flow.id === closure.flow.id)
            || pools.some(pool => pool.id === closure.pool.id)) {
            fail("Douluo I land-finale closure is already present in the final source export");
        }
        flows = [...flows, closure.flow];
        pools = [...pools, closure.pool];
        recoveredClosures.push({
            id: closure.id,
            reason: closure.reason,
            flowId: closure.flow.id,
            poolId: closure.pool.id
        });
    }
    const targetSets = {
        flow: new Set(flows.map(flow => flow.id)),
        pool: new Set(pools.map(pool => pool.id)),
        action: new Set(Object.keys(pack.game.flowActions ?? {})),
        resolver: new Set(Object.keys(pack.game.flowResolvers ?? {})),
        customHandler: new Set(Object.keys(customHandlers ?? {}))
    };
    const registries = {
        actions: collectRegistry("action", pack.game.flowActions, flows, pools),
        resolvers: collectRegistry("resolver", pack.game.flowResolvers, flows, pools),
        customHandlers: collectRegistry(
            "customHandler",
            customHandlers,
            flows,
            pools
        )
    };
    const effectInventory = collectEffects(flows, pools);
    const summary = summarize(flows, pools, registries, effectInventory);
    return {
        graph: {
            schemaVersion: "v10-route-graph-shard/1.0",
            packId: config.id,
            source: {
                vaultId: "5ba6453/apk-analysis/E4FB340E",
                module: `derived/pretty/${config.module}`,
                extractionMode: "source-export-materialization",
                gameplayExecuted: false,
                recoveredClosures
            },
            pack: {
                manifest: cloneSourceValue(pack.manifest),
                ...(runtimeContract ? { runtimeContract, routeEntries, contentIdentity,
                    ownership: cloneSourceValue(pack.game.ownership) } : {}),
                entryFlowId: pack.manifest.entryFlowId ?? null,
                aliases: cloneSourceValue(pack.aliases ?? null),
                registryIds: {
                    actions: registries.actions.map(item => item.id),
                    resolvers: registries.resolvers.map(item => item.id),
                    customHandlers: registries.customHandlers.map(item => item.id)
                },
                summary,
                flows: flows.map(flow => routeFlow(flow, targetSets)),
                pools: pools.map(pool => routePool(pool, targetSets))
            }
        },
        dynamicInventory: {
            schemaVersion: "v10-dynamic-inventory/1.0",
            packId: config.id,
            policy: "registry IDs and exact source field references only",
            registries,
            effects: effectInventory,
            summary
        },
        terminalInventory: {
            ...collectTerminals(effectInventory),
            packId: config.id
        },
        manifest: cloneSourceValue(pack.manifest),
        module: config.module,
        moduleBytes: fs.statSync(modulePath).size,
        summary
    };
}

function normalizeLineEndings(value) {
    return value.replace(/\r\n?/gu, "\n");
}

function serialized(value) {
    return `${JSON.stringify(value)}\n`;
}

function writeOrCheck(fileName, value) {
    const target = path.join(OUTPUT_ROOT, fileName);
    const expected = serialized(value);
    if (CHECK_ONLY) {
        if (!fs.existsSync(target)
            || normalizeLineEndings(fs.readFileSync(target, "utf8")) !== expected) {
            fail(`Generated V1.0 source artifact is stale: data/v10/${fileName}`);
        }
        return;
    }
    fs.mkdirSync(OUTPUT_ROOT, { recursive: true });
    if (fs.existsSync(target) && fs.readFileSync(target, "utf8") === expected) return;
    fs.writeFileSync(target, expected, "utf8");
}

function copyOrCheckRuntimeModule(fileName, sourceRoot = SOURCE_ROOT) {
    const source = path.join(sourceRoot, fileName);
    const target = path.join(OUTPUT_ROOT, "source-runtime", fileName);
    if (!fs.existsSync(source)) fail(`Missing source runtime module: ${source}`);
    const expected = fs.readFileSync(source);
    if (CHECK_ONLY) {
        if (!fs.existsSync(target) || !fs.readFileSync(target).equals(expected)) {
            fail(`Generated V1.0 source runtime is stale: data/v10/source-runtime/${fileName}`);
        }
        return;
    }
    fs.mkdirSync(path.dirname(target), { recursive: true });
    if (fs.existsSync(target) && fs.readFileSync(target).equals(expected)) return;
    fs.writeFileSync(target, expected);
}

async function main() {
    if (VAULT_ARG_INDEX >= 0 && !process.argv[VAULT_ARG_INDEX + 1]) {
        fail("--vault requires an absolute or relative path");
    }
    installBrowserStubs();
    const results = [];
    for (const pack of PACKS) results.push(await loadPack(pack));
    const sourceManifest = {
        schemaVersion: "v10-source-manifest/1.0",
        source: {
            vaultId: "5ba6453/apk-analysis/E4FB340E",
            authority: "restored decompiled source vault",
            rawApkRequiredAtRuntime: false
        },
        generatedBy: "tools/v10/generate-source-inventory.mjs",
        packs: results.map(result => ({
            id: result.manifest.id,
            version: result.manifest.version,
            title: result.manifest.title,
            entryFlowId: result.manifest.entryFlowId,
            supportedRoutes: result.manifest.supportedRoutes,
            sourceModule: `derived/pretty/${result.module}`,
            sourceModuleBytes: result.moduleBytes,
            sourceRuntimeModule: `data/v10/source-runtime/${result.module}`,
            sourceRuntimeFoundation: "data/v10/source-runtime/human-foundation-CduvzjjO.js",
            routeGraph: `data/v10/route-graph.${result.manifest.id}.json`,
            dynamicInventory: `data/v10/dynamic-inventory.${result.manifest.id}.json`,
            terminalInventory: `data/v10/terminal-inventory.${result.manifest.id}.json`,
            summary: result.summary
        }))
    };
    writeOrCheck("source-manifest.json", sourceManifest);
    for (const result of results) {
        const id = result.manifest.id;
        writeOrCheck(`route-graph.${id}.json`, result.graph);
        writeOrCheck(`dynamic-inventory.${id}.json`, result.dynamicInventory);
        writeOrCheck(`terminal-inventory.${id}.json`, result.terminalInventory);
    }
    for (const moduleName of RUNTIME_MODULES) {
        copyOrCheckRuntimeModule(moduleName);
    }
    copyOrCheckRuntimeModule(
        "App-B4anXMNi.css",
        path.join(VAULT_ROOT, "extracted", "assets", "public", "assets")
    );
    process.stdout.write(`${JSON.stringify({
        status: "pass",
        mode: CHECK_ONLY ? "check" : "write",
        sourceVault: VAULT_ROOT,
        packs: results.map(result => ({
            id: result.manifest.id,
            summary: result.summary
        }))
    }, null, 2)}\n`);
}

main().catch(error => {
    console.error(error?.stack ?? error);
    process.exitCode = 1;
});
