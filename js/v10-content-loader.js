import { loadProductionEntry } from "./production-content-loader.js";

export class V10ContentError extends Error {
    constructor(code, message, details = {}) {
        super(message);
        this.name = "V10ContentError";
        this.code = code;
        this.details = details;
    }
}

function assertDocument(condition, code, message, details = {}) {
    if (!condition) throw new V10ContentError(code, message, details);
}

function joinUrl(baseUrl, relativePath) {
    const cleanBase = String(baseUrl).replace(/\/$/u, "");
    const cleanPath = String(relativePath).replace(/^\.\//u, "");
    return `${cleanBase}/${cleanPath}`;
}

async function fetchJson(fetchImpl, url) {
    const response = await fetchImpl(url);
    if (!response?.ok) {
        throw new V10ContentError(
            "CONTENT_FETCH_FAILED",
            `无法读取内容：${url}`,
            { url, status: response?.status ?? null }
        );
    }
    return response.json();
}

export function createV10ContentLoader({
    fetchImpl = globalThis.fetch,
    baseUrl = ".",
    moduleImport = url => import(url),
    moduleBaseUrl = globalThis.document?.baseURI ?? new URL("../", import.meta.url).href
} = {}) {
    assertDocument(
        typeof fetchImpl === "function",
        "FETCH_UNAVAILABLE",
        "当前环境没有可用的 fetch。"
    );
    const cache = new Map();
    const load = async (path) => {
        if (!cache.has(path)) {
            cache.set(path, fetchJson(fetchImpl, joinUrl(baseUrl, path)));
        }
        return cache.get(path);
    };
    const getManifest = async () => {
        const manifest = await load("data/v10/source-manifest.json");
        assertDocument(
            manifest?.schemaVersion === "v10-source-manifest/1.0"
                && Array.isArray(manifest.packs),
            "INVALID_SOURCE_MANIFEST",
            "V1 source manifest 格式无效。"
        );
        return manifest;
    };
    const getPack = async (packId) => {
        const manifest = await getManifest();
        const pack = manifest.packs.find(item => item.id === packId);
        assertDocument(
            pack,
            "PACK_NOT_FOUND",
            `未找到内容包：${packId}`,
            { packId }
        );
        return pack;
    };
    return Object.freeze({
        getManifest,
        getPack,
        async getPackDetails(packId) {
            const pack = await getPack(packId);
            const [dynamicInventory, terminalInventory] = await Promise.all([
                load(pack.dynamicInventory),
                load(pack.terminalInventory)
            ]);
            assertDocument(
                dynamicInventory?.packId === packId
                    && terminalInventory?.packId === packId,
                "PACK_ARTIFACT_MISMATCH",
                `内容包清单不匹配：${packId}`,
                { packId }
            );
            return { pack, dynamicInventory, terminalInventory };
        },
        async getRouteGraph(packId) {
            const pack = await getPack(packId);
            const graph = await load(pack.routeGraph);
            assertDocument(
                graph?.schemaVersion === "v10-route-graph-shard/1.0"
                    && graph.packId === packId,
                "INVALID_ROUTE_GRAPH",
                `路线分片无效：${packId}`,
                { packId }
            );
            return graph;
        },
        async getSourceRuntime(packId) {
            const pack = await getPack(packId);
            assertDocument(
                typeof pack.sourceRuntimeModule === "string"
                    && pack.sourceRuntimeModule.length > 0,
                "PACK_SOURCE_RUNTIME_NOT_AVAILABLE",
                `内容包尚无可加载的 source runtime：${packId}`,
                { packId }
            );
            const moduleUrl = new URL(pack.sourceRuntimeModule, moduleBaseUrl).href;
            const imported = await moduleImport(moduleUrl);
            const sourcePack = imported?.default;
            assertDocument(
                sourcePack?.manifest?.id === packId && sourcePack?.game,
                "PACK_SOURCE_RUNTIME_INVALID",
                `内容包 source runtime 格式无效：${packId}`,
                { packId, moduleUrl }
            );
            const foundation = typeof pack.sourceRuntimeFoundation === "string"
                ? await moduleImport(new URL(pack.sourceRuntimeFoundation, moduleBaseUrl).href)
                : null;
            const engine = packId === "douluo2"
                ? await moduleImport(new URL("data/v10/source-runtime/App-qyLEl8t4.js", moduleBaseUrl).href)
                : null;
            if (packId === "douluo2") {
                const bootstrap = (await moduleImport(new URL("data/v10/source-runtime/index-CfLpLgGT.js", moduleBaseUrl).href)).default;
                return Object.freeze({ ...sourcePack, foundation, engine, game: {
                    ...sourcePack.game,
                    customHandlers: { ...sourcePack.game.customHandlers,
                        "bootstrap:handler.period": bootstrap.game.customHandlers["bootstrap:handler.period"] }
                } });
            }
            return Object.freeze({ ...sourcePack, foundation, engine });
        },
        async getHumanRuntimeContent() {
            return loadProductionEntry({
                fetchImpl,
                entryPath: "data/v05-rc/production-entry.json",
                catalogNames: [],
                validate: false,
                includeRouteGraph: true,
                routePackId: "douluo1"
            });
        }
    });
}
