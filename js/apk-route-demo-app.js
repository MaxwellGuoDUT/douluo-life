import { loadProductionEntry } from "./production-content-loader.js";
import {
    commitApkRouteOption,
    createApkRouteContentIndex,
    createApkRouteDynamicHandlers,
    createApkRouteSession,
    drawApkRouteStep
} from "./apk-route-runtime.js";

const root = document.querySelector("#apkRouteDemo");
const fields = {
    pack: document.querySelector("#packSelect"),
    seed: document.querySelector("#seedInput"),
    start: document.querySelector("#startButton"),
    step: document.querySelector("#stepButton"),
    pageStatus: document.querySelector("#pageStatus"),
    routeStatus: document.querySelector("#routeStatus"),
    flow: document.querySelector("#flowValue"),
    pool: document.querySelector("#poolValue"),
    character: document.querySelector("#characterValue"),
    currency: document.querySelector("#currencyValue"),
    cursor: document.querySelector("#cursorValue"),
    history: document.querySelector("#historyValue"),
    eventTitle: document.querySelector("#eventTitle"),
    eventText: document.querySelector("#eventText"),
    boundaryBox: document.querySelector("#boundaryBox"),
    boundaryText: document.querySelector("#boundaryText"),
    spin: document.querySelector("#spinValue"),
    characterJson: document.querySelector("#characterJson"),
    routeJson: document.querySelector("#routeJson"),
    error: document.querySelector("#errorValue")
};

const state = {
    loaded: null,
    contentIndex: null,
    dynamicHandlers: null,
    session: null,
    lastSpin: null,
    busy: false,
    error: null
};

function stringify(value) {
    return JSON.stringify(value, null, 2);
}

function setError(error) {
    state.error = {
        code: error?.code ?? "UNEXPECTED_ERROR",
        message: error?.message ?? String(error),
        details: error?.details ?? {}
    };
}

function clearError() {
    state.error = null;
}

function render() {
    const session = state.session;
    const loaded = state.loaded;
    fields.pageStatus.textContent = root.dataset.status === "error"
        ? "加载失败"
        : session ? "已连接 APK route runtime" : loaded ? "路线资料已加载" : "加载中";
    fields.routeStatus.textContent = session?.routeStatus ?? "-";
    fields.flow.textContent = session?.currentFlowId ?? "-";
    fields.pool.textContent = session?.currentPoolId ?? "-";
    fields.character.textContent = session
        ? `${session.character.age} 岁 / ${session.character.level} 级`
        : "-";
    fields.currency.textContent = session?.character?.wallet?.copper ?? "-";
    fields.cursor.textContent = session?.random?.cursor ?? "-";
    fields.history.textContent = session?.history?.length ?? 0;

    if (state.lastSpin) {
        fields.spin.textContent = stringify({
            flowId: state.lastSpin.flowId,
            poolId: state.lastSpin.poolId,
            optionId: state.lastSpin.optionId,
            text: state.lastSpin.text,
            weight: state.lastSpin.option?.normalized?.weight,
            eligibleCount: state.lastSpin.eligibleCount,
            totalWeight: state.lastSpin.totalWeight,
            randomValue: state.lastSpin.randomValue,
            cursorAfter: state.session?.random?.cursor
        });
    } else {
        fields.spin.textContent = "尚未抽取";
    }
    fields.characterJson.textContent = session
        ? stringify(session.character)
        : "尚未开始";
    fields.routeJson.textContent = session
        ? stringify({
            routeSchemaVersion: session.routeSchemaVersion,
            routeGraphVersion: session.routeGraphVersion,
            routeHistory: session.routeHistory,
            dynamicHistory: session.dynamicHistory,
            pendingFollowUps: session.pendingFollowUps,
            pendingSoulBone: session.pendingSoulBone,
            lastRouteSpin: session.lastRouteSpin
        })
        : loaded
            ? stringify({
                routeGraph: loaded.routeGraphValidation,
                packs: loaded.routeGraph.packs.map(pack => ({
                    id: pack.id,
                    entryFlowId: pack.entryFlowId,
                    summary: pack.summary
                }))
            })
            : "尚未开始";
    fields.error.textContent = state.error ? stringify(state.error) : "无";
    fields.start.disabled = !state.loaded || state.busy;
    fields.step.disabled = !state.session
        || state.busy
        || state.session.routeStatus === "terminal"
        || root.dataset.status === "boundary";
}

function renderEvent(title, text) {
    fields.eventTitle.textContent = title;
    fields.eventText.textContent = text;
}

function renderBoundary(error) {
    fields.boundaryBox.hidden = false;
    fields.boundaryText.textContent = `${error.code ?? "UNEXPECTED_ERROR"}：${error.message}`;
    root.dataset.status = "boundary";
}

function clearBoundary() {
    fields.boundaryBox.hidden = true;
    fields.boundaryText.textContent = "";
    if (root.dataset.status === "boundary") root.dataset.status = "ready";
}

function selectedPack() {
    return fields.pack.value || "douluo1";
}

function startSession() {
    if (!state.loaded?.routeGraph) return;
    const seed = fields.seed.value.trim();
    if (!seed) {
        setError({ code: "INVALID_APK_SEED", message: "seed 不能为空。" });
        render();
        return;
    }
    clearError();
    clearBoundary();
    const packId = selectedPack();
    state.contentIndex = createApkRouteContentIndex({
        routeGraph: state.loaded.routeGraph,
        formalSpecialResultEvidence: state.loaded.formalSpecialResultEvidence,
        humanSoulRingEvidence: state.loaded.humanSoulRingEvidence,
        humanSoulRingSpeciesEvidence: state.loaded.humanSoulRingSpeciesEvidence,
        combatPowerEvidence: state.loaded.combatPowerEvidence,
        packId
    });
    state.dynamicHandlers = createApkRouteDynamicHandlers({
        contentIndex: state.contentIndex
    });
    state.session = createApkRouteSession({
        routeGraph: state.loaded.routeGraph,
        packId,
        seed
    });
    state.lastSpin = null;
    renderEvent(
        "路线已开始",
        `入口 flow：${state.session.currentFlowId}。点击“抽取并提交一步”推进 source route。`
    );
    render();
}

async function runStep() {
    if (state.busy || !state.contentIndex || !state.session) return;
    state.busy = true;
    clearError();
    clearBoundary();
    renderEvent("处理中", "正在按 APK 原始权重抽取，并提交一组原子 effects…");
    render();
    try {
        const spin = drawApkRouteStep({
            contentIndex: state.contentIndex,
            session: state.session,
            ...state.dynamicHandlers
        });
        state.lastSpin = spin;
        if (spin.status === "terminal") {
            renderEvent("路线已结束", "角色已经处于终局状态。");
            return;
        }
        const committed = commitApkRouteOption({
            contentIndex: state.contentIndex,
            session: state.session,
            spin,
            ...state.dynamicHandlers
        });
        renderEvent(
            committed.routeStatus === "terminal" ? "路线终局" : "抽取完成",
            `${spin.text}；下一 flow：${committed.nextFlowId ?? "终局"}`
        );
    } catch (error) {
        setError(error);
        renderBoundary(error);
        renderEvent("路线停在兼容边界", "当前边没有被静默补全；请查看错误详情和路线审计。");
    } finally {
        state.busy = false;
        render();
    }
}

fields.start.addEventListener("click", startSession);
fields.step.addEventListener("click", runStep);
fields.pack.addEventListener("change", startSession);

loadProductionEntry({
    catalogNames: [],
    validate: false,
    includeRouteGraph: true
}).then(loaded => {
    state.loaded = loaded;
    if (!loaded.routeGraphValidation?.valid) {
        throw new Error("活动 APK route graph 校验失败。");
    }
    fields.pack.replaceChildren();
    for (const pack of loaded.routeGraph.packs) {
        const option = document.createElement("option");
        option.value = pack.id;
        option.textContent = `${pack.id} · ${pack.manifest?.title ?? pack.id}`;
        fields.pack.append(option);
    }
    fields.pack.disabled = false;
    root.dataset.status = "ready";
    renderEvent("资料已加载", "请选择内容包并点击开始路线。");
    render();
}).catch(error => {
    root.dataset.status = "error";
    setError(error);
    renderEvent("加载失败", "活动 APK route graph 无法加载。");
    render();
});
