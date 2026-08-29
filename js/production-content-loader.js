import { validateApkCanonicalPackage } from "./apk-content-adapter.js";

const DEFAULT_ENTRY_PATH = "data/production-entry.json";

function fail(code, message, details = {}) {
    const error = new Error(message);
    error.code = code;
    error.details = details;
    throw error;
}

async function fetchJson(fetchImpl, path) {
    const response = await fetchImpl(path);
    if (!response.ok) {
        fail(
            "PRODUCTION_CONTENT_FETCH_FAILED",
            `Failed to load ${path}: ${response.status}`,
            { path, status: response.status }
        );
    }
    return response.json();
}

function catalogPath(entry, name) {
    const packageRoot = entry.packageIndex
        .replace(/\/package-index\.json$/u, "");
    return `${packageRoot}/catalogs/${name}.json`;
}

function validateRouteGraph(routeGraph) {
    const valid = routeGraph?.schemaVersion === "apk-route-graph/1.0"
        && routeGraph?.source?.gameplayExecuted === false
        && Array.isArray(routeGraph?.packs)
        && routeGraph.packs.length > 0
        && routeGraph.packs.every(pack => (
            typeof pack.id === "string"
            && Array.isArray(pack.flows)
            && Array.isArray(pack.pools)
            && typeof pack.entryFlowId === "string"
        ));
    return {
        valid,
        schemaVersion: routeGraph?.schemaVersion ?? null,
        packCount: Array.isArray(routeGraph?.packs) ? routeGraph.packs.length : 0
    };
}

function materializeRouteGraphShard(shard, expectedPackId) {
    const valid = shard?.schemaVersion === "apk-route-graph-shard/1.0"
        && shard?.source?.gameplayExecuted === false
        && shard?.packId === expectedPackId
        && shard?.pack?.id === expectedPackId;
    if (!valid) {
        fail(
            "INVALID_ACTIVE_APK_ROUTE_GRAPH_SHARD",
            `Active APK route graph shard for "${String(expectedPackId)}" is invalid.`,
            {
                expectedPackId,
                schemaVersion: shard?.schemaVersion ?? null,
                packId: shard?.packId ?? null
            }
        );
    }
    return {
        schemaVersion: "apk-route-graph/1.0",
        packageVersion: shard.packageVersion,
        status: shard.status,
        source: shard.source,
        generatedBy: shard.generatedBy,
        packs: [shard.pack],
        diagnostics: shard.diagnostics ?? { missingExactReferences: [] }
    };
}

export async function loadProductionEntry({
    fetchImpl = globalThis.fetch,
    entryPath = DEFAULT_ENTRY_PATH,
    catalogNames = null,
    validate = true,
    includeRouteGraph = false,
    routePackId = null
} = {}) {
    if (typeof fetchImpl !== "function") {
        fail("PRODUCTION_CONTENT_FETCH_UNAVAILABLE", "A fetch implementation is required.");
    }
    const entry = await fetchJson(fetchImpl, entryPath);
    if (entry.schemaVersion !== "production-entry/1.0"
        || entry.status !== "active") {
        fail("INVALID_PRODUCTION_ENTRY", "Active production entry is invalid.", { entry });
    }
    if (entry.source !== "apk-canonical") {
        fail(
            "UNSUPPORTED_PRODUCTION_SOURCE",
            `Unsupported active production source "${String(entry.source)}".`
        );
    }

    const index = await fetchJson(fetchImpl, entry.packageIndex);
    const policy = await fetchJson(fetchImpl, entry.policy);
    const monolithRouteGraphPath = entry.routeGraph
        ?? index.routeGraph?.path
        ?? null;
    const routeGraphShards = entry.routeGraphShards
        ?? index.routeGraphShards
        ?? {};
    let routeGraphPath = monolithRouteGraphPath;
    let routeGraphMode = "monolith";
    if (routePackId !== null) {
        if (typeof routePackId !== "string" || !routePackId.trim()) {
            fail(
                "INVALID_PRODUCTION_ROUTE_PACK",
                "routePackId must be a non-empty string when provided."
            );
        }
        routePackId = routePackId.trim();
        const shardDescriptor = routeGraphShards[routePackId];
        if (shardDescriptor?.path) {
            routeGraphPath = shardDescriptor.path;
            routeGraphMode = "pack-shard";
        } else if (Object.keys(routeGraphShards).length > 0) {
            fail(
                "PRODUCTION_ROUTE_PACK_NOT_FOUND",
                `Route graph shard "${routePackId}" is not listed by the active package.`,
                { routePackId, availablePackIds: Object.keys(routeGraphShards) }
            );
        } else {
            routeGraphMode = "monolith-fallback";
        }
    }
    const formalSpecialResultEvidencePath = entry.formalSpecialResultEvidence
        ?? index.formalSpecialResultEvidence?.path
        ?? null;
    const humanSoulRingEvidencePath = entry.humanSoulRingEvidence
        ?? index.humanSoulRingEvidence?.path
        ?? null;
    const humanSoulRingSpeciesEvidencePath = entry.humanSoulRingSpeciesEvidence
        ?? index.humanSoulRingSpeciesEvidence?.path
        ?? null;
    const combatPowerEvidencePath = entry.combatPowerEvidence
        ?? index.combatPowerEvidence?.path
        ?? null;
    const officialBeastElementEvidencePath = entry.officialBeastElementEvidence
        ?? index.officialBeastElementEvidence?.path
        ?? null;
    const supportedDestiniesPath = entry.supportedDestinies
        ?? index.supportedDestinies?.path
        ?? null;
    const routeGraphDocument = includeRouteGraph && routeGraphPath
        ? await fetchJson(fetchImpl, routeGraphPath)
        : null;
    const routeGraphShard = routeGraphMode === "pack-shard"
        ? routeGraphDocument
        : null;
    const routeGraph = routeGraphShard
        ? materializeRouteGraphShard(routeGraphShard, routePackId)
        : routeGraphDocument;
    const formalSpecialResultEvidence = includeRouteGraph
        && formalSpecialResultEvidencePath
        ? await fetchJson(fetchImpl, formalSpecialResultEvidencePath)
        : null;
    const humanSoulRingEvidence = includeRouteGraph
        && humanSoulRingEvidencePath
        ? await fetchJson(fetchImpl, humanSoulRingEvidencePath)
        : null;
    const humanSoulRingSpeciesEvidence = includeRouteGraph
        && humanSoulRingSpeciesEvidencePath
        ? await fetchJson(fetchImpl, humanSoulRingSpeciesEvidencePath)
        : null;
    const combatPowerEvidence = includeRouteGraph
        && combatPowerEvidencePath
        ? await fetchJson(fetchImpl, combatPowerEvidencePath)
        : null;
    const officialBeastElementEvidence = includeRouteGraph
        && officialBeastElementEvidencePath
        ? await fetchJson(fetchImpl, officialBeastElementEvidencePath)
        : null;
    const supportedDestinies = supportedDestiniesPath
        ? await fetchJson(fetchImpl, supportedDestiniesPath)
        : null;
    const routeGraphValidation = routeGraph
        ? validateRouteGraph(routeGraph)
        : null;
    if (routeGraphValidation && !routeGraphValidation.valid) {
        fail(
            "INVALID_ACTIVE_APK_ROUTE_GRAPH",
            "Active APK route graph failed validation.",
            routeGraphValidation
        );
    }
    const names = catalogNames ?? Object.keys(index.counts ?? {});
    const catalogs = {};
    for (const name of names) {
        catalogs[name] = await fetchJson(fetchImpl, catalogPath(entry, name));
    }

    const complete = names.length === Object.keys(index.counts ?? {}).length
        && Object.keys(index.counts ?? {}).every(name => catalogs[name]);
    const validation = complete && validate
        ? validateApkCanonicalPackage({ index, catalogs })
        : null;
    if (validation && !validation.valid) {
        fail(
            "INVALID_ACTIVE_APK_PACKAGE",
            "Active APK canonical package failed validation.",
            validation
        );
    }
    return {
        entry,
        index,
        policy,
        routeGraph,
        routeGraphShard,
        routeGraphPath,
        routeGraphMode,
        routeGraphShards,
        formalSpecialResultEvidence,
        formalSpecialResultEvidencePath,
        humanSoulRingEvidence,
        humanSoulRingEvidencePath,
        humanSoulRingSpeciesEvidence,
        humanSoulRingSpeciesEvidencePath,
        combatPowerEvidence,
        combatPowerEvidencePath,
        officialBeastElementEvidence,
        officialBeastElementEvidencePath,
        supportedDestinies,
        supportedDestiniesPath,
        routeGraphValidation,
        catalogs,
        complete,
        validation
    };
}

export default Object.freeze({ loadProductionEntry });
