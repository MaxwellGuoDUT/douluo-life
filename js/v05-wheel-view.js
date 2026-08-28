import { selectApkPoolOptions } from "./apk-rule-runtime.js";

export const V05_WHEEL_VIEW_VERSION = "v05-wheel-view/1";

function typedError(code, message, details = {}) {
    const error = new Error(message);
    error.code = code;
    error.details = details;
    return error;
}

function exactValue(transition) {
    return transition?.kind === "exact-string"
        ? transition.value ?? transition.target ?? null
        : null;
}

function normalized(option) {
    return option?.normalized ?? {};
}

function optionId(option) {
    return normalized(option).option_id ?? option?.availability?.optionId ?? option?.id ?? null;
}

function optionText(option) {
    return normalized(option).wheel_label
        ?? normalized(option).text
        ?? optionId(option)
        ?? "未命名选项";
}

function optionWeight(option) {
    return Number(normalized(option).weight ?? 0);
}

function poolTitle(pool, fallback) {
    return pool?.normalized?.pool_name ?? fallback ?? "当前转盘";
}

export function createV05WheelSegments(options = []) {
    const positive = options.filter(option => Number.isFinite(optionWeight(option))
        && optionWeight(option) > 0);
    const totalWeight = positive.reduce((total, option) => total + optionWeight(option), 0);
    if (!(totalWeight > 0)) {
        throw typedError(
            "V05_WHEEL_EMPTY",
            "当前 pool 没有正权重 eligible option。"
        );
    }
    let cursor = 0;
    return positive.map((option, index) => {
        const weight = optionWeight(option);
        const startAngle = cursor;
        const endAngle = index === positive.length - 1
            ? 360
            : cursor + (weight / totalWeight) * 360;
        cursor = endAngle;
        return Object.freeze({
            index,
            optionId: optionId(option),
            text: optionText(option),
            fullText: normalized(option).text ?? optionText(option),
            weight,
            percentage: (weight / totalWeight) * 100,
            startAngle,
            endAngle,
            angle: endAngle - startAngle,
            midpoint: startAngle + ((endAngle - startAngle) / 2)
        });
    });
}

export function resolveV05StaticPool({ contentIndex, session, maxHops = 50 } = {}) {
    const startFlowId = session?.currentFlowId;
    if (!contentIndex?.getFlow || typeof startFlowId !== "string") {
        throw typedError("V05_WHEEL_CONTEXT_INVALID", "无法读取当前 runtime flow。", {
            flowId: startFlowId ?? null
        });
    }
    const visitedFlowIds = [];
    let flowId = startFlowId;
    for (let hop = 0; hop < maxHops; hop += 1) {
        if (visitedFlowIds.includes(flowId)) {
            return { status: "dynamic", reason: "cycle", flowId, visitedFlowIds };
        }
        visitedFlowIds.push(flowId);
        const flow = contentIndex.getFlow(flowId);
        if (!flow) {
            throw typedError("V05_WHEEL_FLOW_NOT_FOUND", `当前 flow 不存在：${flowId}`, {
                flowId,
                visitedFlowIds
            });
        }
        const poolId = exactValue(flow.route?.pool);
        if (poolId) {
            return { status: "pool", flowId, poolId, flow, visitedFlowIds };
        }
        const next = exactValue(flow.route?.next);
        if (next) {
            flowId = next;
            continue;
        }
        if (flow.route?.getNext?.kind === "exact-string"
            || flow.route?.action?.kind === "exact-string") {
            return {
                status: "dynamic",
                reason: "runtime-handler",
                flowId,
                flow,
                visitedFlowIds
            };
        }
        return { status: "dynamic", reason: "unresolved-flow", flowId, flow, visitedFlowIds };
    }
    return { status: "dynamic", reason: "hop-limit", flowId, visitedFlowIds };
}

export function createV05WheelView({
    contentIndex,
    session,
    phase = "ready",
    lastSpin = null
} = {}) {
    const recentResult = lastSpin
        ? { optionId: lastSpin.optionId ?? null, text: lastSpin.text ?? lastSpin.optionId ?? null }
        : null;
    if (["completed", "boundary", "error"].includes(phase)) {
        return Object.freeze({
            version: V05_WHEEL_VIEW_VERSION,
            status: phase,
            title: phase === "completed" ? "25 岁展示终点" : "路线已停止",
            flowId: session?.currentFlowId ?? null,
            poolId: session?.currentPoolId ?? null,
            totalWeight: 0,
            segments: [],
            recentResult,
            selectedOptionId: recentResult?.optionId ?? null
        });
    }
    const resolved = resolveV05StaticPool({ contentIndex, session });
    if (resolved.status !== "pool") {
        return Object.freeze({
            version: V05_WHEEL_VIEW_VERSION,
            status: "dynamic",
            title: "动态转盘由 runtime 解析",
            message: "此 flow 必须在正式提交时由 runtime handler 解析；页面不会猜测 pool、option 或概率。",
            flowId: resolved.flowId,
            poolId: null,
            totalWeight: 0,
            segments: [],
            recentResult,
            selectedOptionId: null,
            boundary: resolved.reason
        });
    }
    const selection = selectApkPoolOptions(
        contentIndex,
        session.character,
        resolved.poolId
    );
    const segments = createV05WheelSegments(selection.options);
    const totalWeight = segments.reduce((total, segment) => total + segment.weight, 0);
    return Object.freeze({
        version: V05_WHEEL_VIEW_VERSION,
        status: "ready",
        title: poolTitle(selection.pool, resolved.poolId),
        flowId: resolved.flowId,
        poolId: resolved.poolId,
        totalWeight,
        segments,
        unresolvedRequirements: selection.unresolved,
        recentResult,
        selectedOptionId: segments.some(segment => segment.optionId === recentResult?.optionId)
            ? recentResult.optionId
            : null
    });
}

export function createV05WheelViewFromSpin(spin, recentResult = null) {
    if (!spin?.pool || !Array.isArray(spin.options)) {
        throw typedError("V05_WHEEL_SPIN_INVALID", "runtime spin 未包含可验证的 eligible snapshot。");
    }
    const segments = createV05WheelSegments(spin.options);
    if (!segments.some(segment => segment.optionId === spin.optionId)) {
        throw typedError(
            "V05_WHEEL_RESULT_NOT_ELIGIBLE",
            "runtime 结果不在该次 eligible wheel snapshot 中。",
            { poolId: spin.poolId ?? null, optionId: spin.optionId ?? null }
        );
    }
    return Object.freeze({
        version: V05_WHEEL_VIEW_VERSION,
        status: "result",
        title: poolTitle(spin.pool, spin.poolId),
        flowId: spin.flowId ?? null,
        poolId: spin.poolId ?? spin.pool?.normalized?.pool_id ?? null,
        totalWeight: segments.reduce((total, segment) => total + segment.weight, 0),
        segments,
        recentResult: recentResult ?? { optionId: spin.optionId, text: spin.text },
        selectedOptionId: spin.optionId
    });
}

export default Object.freeze({
    V05_WHEEL_VIEW_VERSION,
    createV05WheelSegments,
    resolveV05StaticPool,
    createV05WheelView,
    createV05WheelViewFromSpin
});
