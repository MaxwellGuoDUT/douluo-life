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

export async function loadProductionEntry({
    fetchImpl = globalThis.fetch,
    entryPath = DEFAULT_ENTRY_PATH,
    catalogNames = null,
    validate = true,
    includeRouteGraph = false
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
    const routeGraphPath = entry.routeGraph
        ?? index.routeGraph?.path
        ?? null;
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
    const routeGraph = includeRouteGraph && routeGraphPath
        ? await fetchJson(fetchImpl, routeGraphPath)
        : null;
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
        routeGraphPath,
        formalSpecialResultEvidence,
        formalSpecialResultEvidencePath,
        humanSoulRingEvidence,
        humanSoulRingEvidencePath,
        humanSoulRingSpeciesEvidence,
        humanSoulRingSpeciesEvidencePath,
        combatPowerEvidence,
        combatPowerEvidencePath,
        routeGraphValidation,
        catalogs,
        complete,
        validation
    };
}

export default Object.freeze({ loadProductionEntry });
