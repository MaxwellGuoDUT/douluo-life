import { createV10ContentLoader } from "./v10-content-loader.js";
import { createV10HumanRunner } from "./v10-human-runner.js";

export class V10RuntimeBoundary extends Error {
    constructor(code, message, details = {}) {
        super(message);
        this.name = "V10RuntimeBoundary";
        this.code = code;
        this.details = details;
    }
}

export function createV10LifeRunner({
    contentLoader = createV10ContentLoader()
} = {}) {
    return Object.freeze({
        async start(packId, { seed, route = "human", snapshot = null } = {}) {
            if (packId === "douluo1") {
                if (!["human", "beast"].includes(route)) {
                    throw new V10RuntimeBoundary(
                        "ROUTE_NOT_SUPPORTED",
                        `当前不能从该路线直接开局：${route}`,
                        { packId, route }
                    );
                }
                let loaded;
                let sourcePack = null;
                if (route === "beast") {
                    const [runtimeContent, sourceRuntime, routeGraph] = await Promise.all([
                        contentLoader.getHumanRuntimeContent(),
                        contentLoader.getSourceRuntime(packId),
                        contentLoader.getRouteGraph(packId)
                    ]);
                    loaded = runtimeContent;
                    sourcePack = Object.freeze({ ...sourceRuntime, routeGraph });
                } else {
                    loaded = await contentLoader.getHumanRuntimeContent();
                }
                return createV10HumanRunner({
                    loaded,
                    seed,
                    route,
                    sourcePack,
                    snapshot
                });
            }
            if (packId === "douluo2") {
                const [sourcePack, graph] = await Promise.all([
                    contentLoader.getSourceRuntime(packId),
                    contentLoader.getRouteGraph(packId)
                ]);
                if (!sourcePack.manifest.supportedRoutes.includes(route)) {
                    throw new V10RuntimeBoundary("ROUTE_NOT_SUPPORTED", "该内容包没有此开局路线。", { packId, route });
                }
                return createV10HumanRunner({
                    loaded: { routeGraph: {
                        schemaVersion: "apk-route-graph/1.0",
                        packageVersion: sourcePack.manifest.version,
                        packs: [{ ...graph.pack, id: packId }]
                    } },
                    sourcePack: { ...sourcePack, routeGraph: graph },
                    seed,
                    route,
                    snapshot
                });
            }
            throw new V10RuntimeBoundary(
                "PACK_NOT_SUPPORTED",
                `不支持的内容包：${packId}`,
                { packId }
            );
        }
    });
}
