import { loadProductionEntry } from "./production-content-loader.js";
import {
    V05_DEFAULT_SEED,
    V05_ENTRY_PATH,
    V05_PACK_ID,
    createV05DemoRunnerFromLoaded
} from "./v05-demo.js";
import {
    groupV05PresentationTimeline,
    presentationChangeLabels
} from "./v05-life-presentation.js";

const root = document.querySelector("#v05Demo");
const fields = {
    seed: document.querySelector("#seedInput"),
    seedMode: document.querySelector("#seedMode"),
    start: document.querySelector("#startButton"),
    step: document.querySelector("#stepButton"),
    advance: document.querySelector("#advanceButton"),
    reset: document.querySelector("#resetButton"),
    pageStatus: document.querySelector("#pageStatus"),
    character: document.querySelector("#characterValue"),
    currency: document.querySelector("#currencyValue"),
    progress: document.querySelector("#progressValue"),
    flow: document.querySelector("#flowValue"),
    pool: document.querySelector("#poolValue"),
    routeStatus: document.querySelector("#routeStatus"),
    source: document.querySelector("#sourceValue"),
    eventTitle: document.querySelector("#eventTitle"),
    eventText: document.querySelector("#eventText"),
    eventChanges: document.querySelector("#eventChanges"),
    boundaryBox: document.querySelector("#boundaryBox"),
    boundaryText: document.querySelector("#boundaryText"),
    completedBox: document.querySelector("#completedBox"),
    summary: document.querySelector("#summaryValue"),
    endingOverview: document.querySelector("#endingOverview"),
    endingSouls: document.querySelector("#endingSouls"),
    endingBoundary: document.querySelector("#endingBoundary"),
    audit: document.querySelector("#auditValue"),
    error: document.querySelector("#errorValue"),
    history: document.querySelector("#historyList")
};

const app = {
    controlPlane: null,
    loaded: null,
    runner: null,
    loading: true,
    loadError: null
};

function stringify(value) {
    return JSON.stringify(value, null, 2);
}

function selectedSeed() {
    return fields.seed.value.trim();
}

function renderChangeList(target, labels, itemClass = "") {
    const fragment = document.createDocumentFragment();
    for (const label of labels) {
        const item = document.createElement("li");
        if (itemClass) item.className = itemClass;
        item.textContent = label;
        fragment.append(item);
    }
    target.replaceChildren(fragment);
    target.hidden = labels.length === 0;
}

function setEvent(title, text, changes = []) {
    fields.eventTitle.textContent = title;
    fields.eventText.textContent = text;
    renderChangeList(fields.eventChanges, changes);
}

function pagePhase() {
    if (app.loading) return "loading";
    if (app.loadError) return "error";
    return app.runner?.phase ?? "ready";
}

function pageStatusLabel(phase) {
    return {
        loading: "加载中",
        ready: app.runner ? "可以推进" : "等待开始",
        advancing: "连续推进中",
        boundary: "兼容边界",
        completed: "V0.5 已完成",
        error: "错误"
    }[phase] ?? phase;
}

function renderHistory(records) {
    if (!records?.length) {
        fields.history.replaceChildren();
        const item = document.createElement("p");
        item.className = "timeline-empty";
        item.textContent = "开始后，每个成功提交的事件都会保留在这里。";
        fields.history.append(item);
        return;
    }
    const fragment = document.createDocumentFragment();
    for (const group of groupV05PresentationTimeline(records)) {
        const section = document.createElement("section");
        section.className = "timeline-group";
        const heading = document.createElement("h3");
        heading.textContent = group.label;
        const list = document.createElement("ol");
        for (const record of group.records) {
            const item = document.createElement("li");
            item.className = "timeline-record";
            const text = document.createElement("p");
            text.textContent = record.text;
            const meta = document.createElement("span");
            meta.className = "timeline-meta";
            meta.textContent = `事件 ${record.index} · cursor ${record.randomCursor}`;
            item.append(text, meta);
            if (record.changeLabels.length) {
                const changes = document.createElement("div");
                changes.className = "timeline-changes";
                for (const label of record.changeLabels) {
                    const change = document.createElement("span");
                    change.className = "timeline-change";
                    change.textContent = label;
                    changes.append(change);
                }
                item.append(changes);
            }
            list.append(item);
        }
        section.append(heading, list);
        fragment.append(section);
    }
    fields.history.replaceChildren(fragment);
}

function endingStat(label, value) {
    const item = document.createElement("div");
    item.className = "ending-stat";
    const heading = document.createElement("strong");
    heading.textContent = label;
    const content = document.createElement("span");
    content.textContent = value ?? "-";
    item.append(heading, content);
    return item;
}

function renderEnding(readable) {
    if (!readable) {
        fields.endingOverview.replaceChildren();
        fields.endingSouls.replaceChildren();
        fields.endingBoundary.textContent = "25 岁展示终点，不代表完整人生终局";
        return;
    }
    fields.endingOverview.replaceChildren(
        endingStat("年龄 / 等级", `${readable.age} 岁 / ${readable.level} 级`),
        endingStat("铜灵币", String(readable.copper)),
        endingStat("已提交事件", String(readable.committedEvents)),
        endingStat("seed", readable.seed),
        endingStat("境界", readable.rank),
        endingStat("路线", readable.route)
    );
    const souls = document.createDocumentFragment();
    if (!readable.martialSouls.length) {
        const empty = document.createElement("p");
        empty.textContent = "没有已记录武魂。";
        souls.append(empty);
    }
    for (const soul of readable.martialSouls) {
        const item = document.createElement("div");
        item.className = "ending-soul";
        const name = document.createElement("strong");
        name.textContent = soul.name;
        const rings = document.createElement("p");
        rings.textContent = soul.rings.length
            ? `魂环：${soul.rings.map(ring => [ring.years ? `${ring.years}年` : null, ring.type, ring.species]
                .filter(Boolean)
                .join(" · ") || ring.name).join("；")}`
            : "魂环：无";
        item.append(name, rings);
        souls.append(item);
    }
    fields.endingSouls.replaceChildren(souls);
    fields.endingBoundary.textContent = readable.boundary;
}

function render() {
    const phase = pagePhase();
    const runner = app.runner;
    const session = runner?.session;
    const busy = phase === "loading" || phase === "advancing";
    root.dataset.status = phase;
    fields.pageStatus.textContent = pageStatusLabel(phase);
    fields.character.textContent = session
        ? `${session.character.age} 岁 / ${session.character.level} 级`
        : "-";
    fields.currency.textContent = session?.character?.wallet?.copper ?? "-";
    fields.progress.textContent = session
        ? `${session.random.cursor} / ${session.history.length}`
        : "-";
    fields.flow.textContent = session?.currentFlowId ?? "-";
    fields.pool.textContent = session?.currentPoolId ?? "-";
    fields.routeStatus.textContent = session?.routeStatus ?? "-";
    fields.source.textContent = app.loaded
        ? `APK canonical / ${V05_PACK_ID} / ${app.loaded.routeGraphMode}`
        : `APK canonical / ${V05_PACK_ID}`;
    fields.seedMode.textContent = selectedSeed() === V05_DEFAULT_SEED
        ? "默认验收路径"
        : "实验 seed · 可能提前停止";

    fields.start.disabled = !app.controlPlane || busy;
    fields.seed.disabled = busy;
    fields.step.disabled = !runner || phase !== "ready";
    fields.advance.disabled = !runner || !["ready", "advancing"].includes(phase);
    fields.advance.textContent = phase === "advancing" ? "停止连续推进" : "推进至下一岁";
    fields.reset.disabled = !runner || busy;

    fields.boundaryBox.hidden = phase !== "boundary";
    fields.boundaryText.textContent = runner?.error
        ? `${runner.error.code}：${runner.error.message}`
        : "";
    fields.completedBox.hidden = phase !== "completed";
    fields.summary.textContent = runner?.summary ? stringify(runner.summary) : "";
    renderEnding(runner?.summary?.readable ?? null);
    fields.error.textContent = app.loadError
        ? stringify(app.loadError)
        : runner?.error
            ? stringify(runner.error)
            : "无";
    fields.audit.textContent = session
        ? stringify({
            seed: selectedSeed(),
            phase,
            routeStatus: session.routeStatus,
            currentFlowId: session.currentFlowId,
            currentPoolId: session.currentPoolId,
            cursor: session.random.cursor,
            history: session.history.length,
            routeHistory: session.routeHistory.length,
            dynamicHistory: session.dynamicHistory.length,
            lastSpin: runner.lastSpin,
            character: session.character
        })
        : app.controlPlane
            ? stringify({
                packId: V05_PACK_ID,
                shard: app.controlPlane.routeGraphShards?.[V05_PACK_ID] ?? null,
                loadingPolicy: app.controlPlane.entry?.routeGraphLoadingPolicy
            })
            : "尚未开始";
    renderHistory(runner?.presentationHistory ?? []);
}

function resultEvent(result) {
    if (result.status === "completed") {
        const count = app.runner?.session?.history?.length ?? "-";
        setEvent(
            "到达 25 岁",
            `第 ${count} 个 option 已完整提交；V0.5 完成锁已阻止后续抽取。`,
            result.presentation?.changeLabels ?? []
        );
    } else if (result.status === "boundary") {
        setEvent("路线停在兼容边界", "失败项没有被静默补全；请查看结构化错误。" );
    } else if (result.status === "error") {
        setEvent("运行错误", "发生非预期错误；当前会话已停止。" );
    } else if (result.committed) {
        setEvent(
            "事件已提交",
            `${result.spin.text}；下一 flow：${result.commit.nextFlowId ?? "终局"}`,
            result.presentation?.changeLabels
                ?? presentationChangeLabels(result.presentation?.changes)
        );
    }
}

async function startLife() {
    if (app.loading || !app.controlPlane) return;
    const seed = selectedSeed();
    if (!seed) {
        app.loadError = { code: "INVALID_APK_SEED", message: "seed 不能为空。", details: {} };
        setEvent("无法开始", "请输入非空 seed。" );
        render();
        return;
    }
    app.loading = true;
    app.loadError = null;
    app.runner = null;
    setEvent("正在加载斗一路线", "只请求 douluo1 shard 与四类 runtime evidence。" );
    render();
    try {
        app.loaded = await loadProductionEntry({
            entryPath: V05_ENTRY_PATH,
            catalogNames: [],
            validate: false,
            includeRouteGraph: true,
            routePackId: V05_PACK_ID
        });
        app.runner = createV05DemoRunnerFromLoaded({ loaded: app.loaded, seed });
        setEvent(
            "新人生已开始",
            `入口 flow：${app.runner.session.currentFlowId}。${seed === V05_DEFAULT_SEED
                ? "这是 V0.5 固定验收路径。"
                : "自定义 seed 为实验路径，遇到未接逻辑会 typed stop。"}`
        );
    } catch (error) {
        app.loadError = {
            code: error?.code ?? "V05_LOAD_FAILED",
            message: error?.message ?? String(error),
            details: error?.details ?? {}
        };
        setEvent("加载失败", "douluo1 shard 或运行时证据无法加载。" );
    } finally {
        app.loading = false;
        render();
    }
}

function stepLife() {
    if (!app.runner) return;
    const result = app.runner.step();
    resultEvent(result);
    render();
}

async function advanceLife() {
    if (!app.runner) return;
    if (app.runner.phase === "advancing") {
        app.runner.cancelAdvance();
        return;
    }
    setEvent("连续推进", "逐项执行同一个原子 runtime；年龄变化、停止请求或边界会立即停下。" );
    render();
    const result = await app.runner.advanceToNextAge({
        maxSteps: 50,
        onStep(stepResult) {
            resultEvent(stepResult);
            render();
        },
        yieldStep: () => new Promise(resolve => window.setTimeout(resolve, 0))
    });
    if (result.cancelled) {
        setEvent("连续推进已停止", "已在完整提交之间停止，没有丢弃已提交 history。" );
    } else if (result.ageChanged) {
        setEvent(
            "已推进到下一岁",
            `当前 ${app.runner.session.character.age} 岁；可继续单步或再次连续推进。`
        );
    } else {
        resultEvent(result);
    }
    render();
}

function resetLife() {
    if (!app.runner) return;
    if (app.runner.reset({ seed: selectedSeed() })) {
        setEvent("会话已重置", "已回到同一 seed 的 0 岁正式入口；未实现 save/load。" );
        render();
    }
}

fields.start.addEventListener("click", () => void startLife());
fields.step.addEventListener("click", stepLife);
fields.advance.addEventListener("click", () => void advanceLife());
fields.reset.addEventListener("click", resetLife);
fields.seed.addEventListener("input", render);

loadProductionEntry({
    entryPath: V05_ENTRY_PATH,
    catalogNames: [],
    validate: false
}).then(loaded => {
    if (!loaded.routeGraphShards?.[V05_PACK_ID]?.path) {
        const error = new Error("活动 package 未列出 douluo1 route shard。");
        error.code = "V05_ROUTE_SHARD_NOT_LISTED";
        throw error;
    }
    app.controlPlane = loaded;
    setEvent("V0.5 已就绪", "点击“开始新人生”后才会加载 douluo1 shard 与运行时证据。" );
}).catch(error => {
    app.loadError = {
        code: error?.code ?? "V05_CONTROL_PLANE_LOAD_FAILED",
        message: error?.message ?? String(error),
        details: error?.details ?? {}
    };
    setEvent("入口加载失败", "无法读取 production entry、package index 或 policy。" );
}).finally(() => {
    app.loading = false;
    render();
});
