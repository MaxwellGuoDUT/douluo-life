import { createApkRandom } from "./apk-rule-runtime.js";
import { createV05WheelSegments } from "./v05-wheel-view.js";

// New opening rule: eligible human/beast routes have equal weight.
// A separate seed domain leaves every existing life RNG cursor unchanged.
export function createV10RouteWheel(pack, seed = null) {
    const routes = ["human", "beast"].filter(route => pack.supportedRoutes.includes(route));
    if (!pack.sourceRuntimeModule || routes.length === 0) {
        throw Object.assign(new Error("该内容包没有可抽取的开局路线。"), { code: "ROUTE_WHEEL_UNAVAILABLE" });
    }
    const segments = createV05WheelSegments(routes.map(route => ({ normalized: {
        option_id: route, text: route === "human" ? "人类人生" : "魂兽人生", weight: 1
    } })));
    const selected = seed === null ? null : segments[Math.floor(
        createApkRandom(JSON.stringify(["v10-route-wheel/1", pack.id, seed])).next() * segments.length
    )];
    return {
        status: selected ? "result" : "ready", title: "开局路线", totalWeight: segments.length,
        segments, selectedOptionId: selected?.optionId ?? null,
        recentResult: selected ? { optionId: selected.optionId, text: selected.text } : null
    };
}

// Draw the content era before drawing identity; neither draw uses the life cursor.
export function createV10EraWheel(packs, seed = null) {
    const available = packs.filter(pack => ["douluo1", "douluo2"].includes(pack.id)
        && pack.sourceRuntimeModule && pack.supportedRoutes.some(route => ["human", "beast"].includes(route)));
    if (!available.length) throw Object.assign(new Error("没有可抽取的年代。"), { code: "ERA_WHEEL_UNAVAILABLE" });
    const segments = createV05WheelSegments(available.map(pack => ({ normalized: {
        option_id: pack.id, text: pack.id === "douluo1" ? "斗罗一" : "绝世唐门", weight: 1
    } })));
    const selected = seed === null ? null : segments[Math.floor(
        createApkRandom(JSON.stringify(["v10-era-wheel/1", seed])).next() * segments.length
    )];
    return {
        status: selected ? "result" : "ready", title: "年代转盘", totalWeight: segments.length,
        segments, selectedOptionId: selected?.optionId ?? null,
        recentResult: selected ? { optionId: selected.optionId, text: selected.text } : null
    };
}
