import { loadProductionEntry } from "./production-content-loader.js";
import {
    V05_APP_VERSION,
    V05_DEFAULT_SEED,
    V05_ENTRY_PATH,
    V05_PACK_ID,
    createV05DemoRunnerFromLoaded
} from "./v05-demo.js";
import {
    V05_SAVE_KEY,
    clearV05Save,
    createV05Checkpoint,
    createV05ContentIdentity,
    readV05Save,
    restoreV05Checkpoint,
    writeV05Save
} from "./v05-save-store.js";
import { groupV05PresentationTimeline } from "./v05-life-presentation.js";

const root = document.querySelector("#v05Demo");
const fields = Object.fromEntries([
    "seedInput", "seedMode", "startButton", "continueButton", "clearSaveButton",
    "stepButton", "advanceButton", "pageStatus", "saveStatus", "saveSummary",
    "saveWarning", "wheelStage", "wheel", "wheelCenterTitle", "wheelCenterResult",
    "wheelBoundary", "wheelLegend", "eventTitle", "eventText", "eventChanges",
    "boundaryBox", "boundaryText", "completedBox", "endingText", "auditValue",
    "errorValue", "profileButton", "historyButton", "profilePanel", "historyPanel",
    "profileClose", "historyClose", "profileContent", "historyList", "historyCount",
    "drawerBackdrop"
].map(id => [id, document.querySelector(`#${id}`)]));

const app = {
    controlPlane: null,
    loaded: null,
    contentIdentity: null,
    runner: null,
    storedEnvelope: null,
    storedSavePresent: false,
    loading: true,
    loadError: null,
    saveWarning: null,
    displayWheel: null,
    wheelAnimating: false,
    drawer: null,
    drawerTrigger: null
};

function stringify(value) {
    return JSON.stringify(value, null, 2);
}

function selectedSeed() {
    return fields.seedInput.value.trim();
}

function errorRecord(error, fallback = "V05_LOAD_FAILED") {
    return {
        code: error?.code ?? fallback,
        message: error?.message ?? String(error),
        details: error?.details ?? {}
    };
}

function setEvent(title, text, changes = []) {
    fields.eventTitle.textContent = title;
    fields.eventText.textContent = text;
    const fragment = document.createDocumentFragment();
    for (const label of changes ?? []) {
        const item = document.createElement("li");
        item.textContent = label;
        fragment.append(item);
    }
    fields.eventChanges.replaceChildren(fragment);
    fields.eventChanges.hidden = fragment.childNodes.length === 0;
}

function pagePhase() {
    if (app.loading) return "loading";
    if (app.loadError && !app.runner) return "error";
    return app.runner?.phase ?? "ready";
}

function phaseLabel(phase) {
    return {
        loading: "加载中",
        ready: app.runner ? "可转动" : "等待开始",
        advancing: "连续推进中",
        boundary: "兼容边界",
        completed: "25 岁已完成",
        error: "错误"
    }[phase] ?? phase;
}

function colorFor(index) {
    return ["#c78f3f", "#506fa8", "#8a5ba8", "#3f9474", "#bb5d54", "#88743d"][index % 6];
}

function renderWheel(view, { animate = false } = {}) {
    fields.wheel.classList.toggle("is-dynamic", view?.status === "dynamic");
    fields.wheel.classList.toggle("is-locked", ["completed", "boundary", "error"].includes(view?.status));
    fields.wheelCenterTitle.textContent = view?.title ?? "等待开始";
    fields.wheelCenterResult.textContent = view?.recentResult?.text
        ? `最近获得：${view.recentResult.text}`
        : "最近获得：等待开始";
    fields.wheelBoundary.hidden = view?.status !== "dynamic";
    fields.wheelBoundary.textContent = view?.message ?? "";

    const segments = view?.segments ?? [];
    fields.wheel.style.background = segments.length
        ? `conic-gradient(${segments.map((segment, index) => (
            `${colorFor(index)} ${segment.startAngle}deg ${segment.endAngle}deg`
        )).join(", ")})`
        : "radial-gradient(circle, #222b35 0 58%, #161c24 59% 100%)";

    const legend = document.createDocumentFragment();
    for (const segment of segments) {
        const item = document.createElement("li");
        item.className = segment.optionId === view.selectedOptionId ? "is-selected" : "";
        item.dataset.optionId = segment.optionId;
        const name = document.createElement("span");
        name.textContent = segment.fullText;
        const weight = document.createElement("strong");
        weight.textContent = `weight ${segment.weight} · ${segment.percentage.toFixed(2)}%`;
        item.append(name, weight);
        legend.append(item);
    }
    fields.wheelLegend.replaceChildren(legend);

    fields.wheel.classList.remove("is-spinning");
    fields.wheel.style.removeProperty("--landing-rotation");
    if (animate && view?.selectedOptionId) {
        const selected = segments.find(segment => segment.optionId === view.selectedOptionId);
        if (selected) {
            fields.wheel.style.setProperty("--landing-rotation", `${720 + (360 - selected.midpoint)}deg`);
            void fields.wheel.offsetWidth;
            fields.wheel.classList.add("is-spinning");
        }
    }
}

function profileRow(label, value) {
    const row = document.createElement("div");
    row.className = "profile-row";
    const key = document.createElement("strong");
    key.textContent = label;
    const content = document.createElement("span");
    content.textContent = value ?? "-";
    row.append(key, content);
    return row;
}

function renderProfile(profile) {
    if (!profile) {
        fields.profileContent.replaceChildren(profileRow("状态", "尚未开始人生"));
        return;
    }
    const fragment = document.createDocumentFragment();
    fragment.append(
        profileRow("性别", profile.gender),
        profileRow("年龄 / 等级", `${profile.age} 岁 / ${profile.level} 级`),
        profileRow("境界 / 修为", profile.rank ?? `${profile.level} 级`),
        profileRow("铜灵币", String(profile.copper)),
        profileRow("路线", profile.route),
        profileRow("路线状态", profile.routeStatus),
        profileRow("阵营 / 主线", profile.faction)
    );
    const soulHeading = document.createElement("h3");
    soulHeading.textContent = "武魂与魂环";
    fragment.append(soulHeading);
    if (!profile.martialSouls.length) fragment.append(profileRow("武魂", "尚未觉醒"));
    for (const soul of profile.martialSouls) {
        const card = document.createElement("section");
        card.className = "profile-card";
        const title = document.createElement("strong");
        title.textContent = [soul.name, soul.category].filter(Boolean).join(" · ");
        const rings = document.createElement("ul");
        for (const ring of soul.rings) {
            const item = document.createElement("li");
            item.textContent = [ring.name, ring.years ? `${ring.years}年` : null, ring.type, ring.species]
                .filter(Boolean).join(" · ");
            rings.append(item);
        }
        if (!soul.rings.length) {
            const empty = document.createElement("p");
            empty.textContent = "魂环：无";
            card.append(title, empty);
        } else card.append(title, rings);
        fragment.append(card);
    }
    const boneHeading = document.createElement("h3");
    boneHeading.textContent = "魂骨";
    fragment.append(boneHeading, profileRow(
        "已获得",
        profile.soulBones.length
            ? profile.soulBones.map(bone => [bone.name, bone.part, bone.years ? `${bone.years}年` : null]
                .filter(Boolean).join(" · ")).join("；")
            : "无"
    ));
    const milestoneHeading = document.createElement("h3");
    milestoneHeading.textContent = "里程碑与边界";
    fragment.append(milestoneHeading);
    const milestones = document.createElement("ul");
    milestones.className = "milestone-list";
    for (const milestone of profile.milestones) {
        const item = document.createElement("li");
        item.textContent = `${milestone.age} 岁 · ${milestone.label}`;
        milestones.append(item);
    }
    if (profile.boundary) {
        const item = document.createElement("li");
        item.textContent = profile.boundary;
        milestones.append(item);
    }
    if (!milestones.childNodes.length) {
        const item = document.createElement("li");
        item.textContent = "暂无里程碑";
        milestones.append(item);
    }
    fragment.append(milestones);
    fields.profileContent.replaceChildren(fragment);
}

function renderHistory(records) {
    fields.historyCount.textContent = String(records?.length ?? 0);
    if (!records?.length) {
        const empty = document.createElement("p");
        empty.className = "timeline-empty";
        empty.textContent = "开始后，每个成功提交的事件都会保留在这里。";
        fields.historyList.replaceChildren(empty);
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
    fields.historyList.replaceChildren(fragment);
}

function saveSummary(envelope) {
    if (!envelope) return "当前浏览器没有 V0.5 存档。";
    const time = envelope.savedAt ? new Date(envelope.savedAt).toLocaleString("zh-CN") : "未知";
    return `${envelope.seed} · ${envelope.age} 岁 / ${envelope.level} 级 · ${envelope.committedCount} 项 · ${envelope.phase} · ${time}`;
}

function render() {
    const phase = pagePhase();
    const busy = ["loading", "advancing"].includes(phase);
    const runner = app.runner;
    root.dataset.status = phase;
    fields.pageStatus.textContent = phaseLabel(phase);
    fields.saveStatus.textContent = runner
        ? `${runner.session.random.cursor} cursor / ${runner.session.history.length} history`
        : `存档 key：${V05_SAVE_KEY}`;
    fields.saveSummary.textContent = saveSummary(app.storedEnvelope);
    fields.saveWarning.hidden = !app.saveWarning;
    fields.saveWarning.textContent = app.saveWarning ? `${app.saveWarning.code}：${app.saveWarning.message}` : "";
    fields.seedMode.textContent = selectedSeed() === V05_DEFAULT_SEED ? "默认验收路径" : "实验 seed";
    fields.seedInput.disabled = busy;
    fields.startButton.disabled = !app.controlPlane || busy;
    fields.continueButton.disabled = !app.storedEnvelope || busy;
    fields.clearSaveButton.disabled = !app.storedSavePresent || busy;
    fields.stepButton.disabled = !runner || phase !== "ready";
    fields.advanceButton.disabled = !runner || !["ready", "advancing"].includes(phase);
    fields.advanceButton.textContent = phase === "advancing" ? "停止连续推进" : "推进至下一岁";
    fields.boundaryBox.hidden = phase !== "boundary";
    fields.boundaryText.textContent = runner?.error ? `${runner.error.code}：${runner.error.message}` : "";
    fields.completedBox.hidden = phase !== "completed";
    fields.endingText.textContent = runner?.summary?.readable
        ? `${runner.summary.readable.age} 岁 · ${runner.summary.readable.level} 级 · ${runner.summary.readable.committedEvents}/100 已提交；完成锁已生效。`
        : "";
    fields.errorValue.textContent = app.loadError
        ? stringify(app.loadError)
        : runner?.error ? stringify(runner.error) : "无";
    fields.auditValue.textContent = runner
        ? stringify({ seed: runner.seed, phase, currentFlowId: runner.session.currentFlowId,
            currentPoolId: runner.session.currentPoolId, cursor: runner.session.random.cursor,
            history: runner.session.history.length, routeHistory: runner.session.routeHistory.length,
            dynamicHistory: runner.session.dynamicHistory.length, lastSpin: runner.lastSpin })
        : "尚未开始";
    renderProfile(runner?.characterProfile ?? null);
    renderHistory(runner?.presentationHistory ?? []);
    renderWheel(app.displayWheel ?? runner?.wheelView ?? null, { animate: app.wheelAnimating });
}

function refreshStoredSave() {
    try {
        app.storedSavePresent = window.localStorage.getItem(V05_SAVE_KEY) !== null;
        app.storedEnvelope = readV05Save(window.localStorage);
        app.loadError = null;
    } catch (error) {
        app.storedEnvelope = null;
        app.storedSavePresent = true;
        app.loadError = errorRecord(error, "V05_SAVE_SCHEMA_INVALID");
        setEvent("本地存档已拒绝", "原始存档仍保留；可明确清除后开始新人生。");
    }
}

async function loadRuntime(seed) {
    app.loaded = await loadProductionEntry({ entryPath: V05_ENTRY_PATH, catalogNames: [],
        validate: false, includeRouteGraph: true, routePackId: V05_PACK_ID });
    app.contentIdentity = createV05ContentIdentity({
        routeGraph: app.loaded.routeGraph,
        packId: V05_PACK_ID,
        appVersion: V05_APP_VERSION
    });
    return createV05DemoRunnerFromLoaded({ loaded: app.loaded, seed });
}

async function startLife() {
    if (app.loading || !app.controlPlane) return;
    const seed = selectedSeed();
    if (!seed) {
        app.loadError = errorRecord(Object.assign(new Error("seed 不能为空。"), { code: "INVALID_APK_SEED" }));
        setEvent("无法开始", "请输入非空 seed。");
        render();
        return;
    }
    if (app.storedSavePresent && !window.confirm("开始新人生不会立即删除旧存档；首次成功提交后将覆盖当前 V0.5 存档。是否继续？")) return;
    app.loading = true;
    app.loadError = null;
    app.saveWarning = null;
    app.runner = null;
    app.displayWheel = null;
    setEvent("正在加载斗一路线", "只请求 douluo1 shard 与正式 runtime evidence。");
    render();
    try {
        app.runner = await loadRuntime(seed);
        setEvent("新人生已开始", "中央转盘来自当前 runtime eligible options；每次完整提交后自动保存。");
    } catch (error) {
        app.loadError = errorRecord(error);
        setEvent("加载失败", "douluo1 shard 或运行时证据无法加载。");
    } finally {
        app.loading = false;
        render();
    }
}

async function continueLife() {
    if (!app.storedEnvelope || app.loading) return;
    app.loading = true;
    app.loadError = null;
    app.saveWarning = null;
    app.runner = null;
    app.displayWheel = null;
    setEvent("正在验证本地检查点", "创建全新 runner 并按相同 seed 确定性重放。");
    render();
    try {
        await loadRuntime(app.storedEnvelope.seed);
        const restored = restoreV05Checkpoint({
            raw: app.storedEnvelope,
            contentIdentity: app.contentIdentity,
            createRunner: seed => createV05DemoRunnerFromLoaded({ loaded: app.loaded, seed })
        });
        app.runner = restored.runner;
        fields.seedInput.value = restored.envelope.seed;
        setEvent("已从本地检查点恢复", "重放、cursor、history、角色和内容指纹校验全部一致。");
    } catch (error) {
        app.loadError = errorRecord(error, "V05_SAVE_REPLAY_MISMATCH");
        setEvent("本地存档已拒绝", "未激活部分 runner，原始存档也未被自动删除。");
    } finally {
        app.loading = false;
        render();
    }
}

function persistCheckpoint() {
    if (!app.runner || !app.contentIdentity) return;
    try {
        const envelope = createV05Checkpoint({ runner: app.runner, contentIdentity: app.contentIdentity });
        writeV05Save(window.localStorage, envelope);
        app.storedEnvelope = envelope;
        app.storedSavePresent = true;
        app.saveWarning = null;
    } catch (error) {
        app.saveWarning = errorRecord(error, "V05_SAVE_STORAGE_UNAVAILABLE");
        console.warn("V0.5 persistence warning", app.saveWarning);
    }
}

function showResult(result) {
    if (result.wheel) {
        app.displayWheel = result.wheel;
        app.wheelAnimating = true;
        window.setTimeout(() => {
            app.wheelAnimating = false;
            render();
        }, 900);
    }
    if (result.status === "completed") {
        setEvent("到达 25 岁", "第 100 个 option 已完整提交；完成锁阻止后续 RNG 和 history。", result.presentation?.changeLabels);
    } else if (result.status === "boundary") {
        setEvent("路线停在兼容边界", "失败项未提交；typed boundary 已作为完整检查点保存。");
    } else if (result.status === "error") {
        setEvent("运行错误", "发生非预期错误；当前人生已停止。");
    } else if (result.committed) setEvent("本次获得", result.spin.text, result.presentation?.changeLabels);
}

function stepLife() {
    if (!app.runner) return;
    app.displayWheel = null;
    const result = app.runner.step();
    showResult(result);
    if (result.committed || (result.status === "boundary" && !result.blocked)) persistCheckpoint();
    render();
}

async function advanceLife() {
    if (!app.runner) return;
    if (app.runner.phase === "advancing") {
        app.runner.cancelAdvance();
        return;
    }
    app.displayWheel = null;
    setEvent("连续推进", "每项仍由同一个 runtime 原子提交；存档只写入完整提交点。");
    render();
    const result = await app.runner.advanceToNextAge({
        maxSteps: 50,
        onStep(stepResult) {
            showResult(stepResult);
            if (stepResult.committed || (stepResult.status === "boundary" && !stepResult.blocked)) persistCheckpoint();
            render();
        },
        yieldStep: () => new Promise(resolve => window.setTimeout(resolve, 0))
    });
    if (result.cancelled) setEvent("连续推进已停止", "已在完整提交之间停止，没有产生半条记录或半条存档。");
    else if (result.ageChanged) setEvent("已推进到下一岁", `当前 ${app.runner.session.character.age} 岁。`);
    else showResult(result);
    render();
}

function clearSave() {
    if (!app.storedSavePresent || !window.confirm("只清除当前站点的 V0.5 专用存档？正在运行的人生不会被修改。")) return;
    try {
        clearV05Save(window.localStorage);
        app.storedEnvelope = null;
        app.storedSavePresent = false;
        app.saveWarning = null;
        setEvent("本地存档已清除", "只删除了 V0.5 专用 key；当前内存中的人生未改变。");
    } catch (error) {
        app.saveWarning = errorRecord(error, "V05_SAVE_STORAGE_UNAVAILABLE");
    }
    render();
}

function closeDrawer({ restoreFocus = true } = {}) {
    if (!app.drawer) return;
    const panel = app.drawer === "profile" ? fields.profilePanel : fields.historyPanel;
    const trigger = app.drawerTrigger;
    panel.classList.remove("is-open");
    panel.setAttribute("aria-hidden", "true");
    fields.profileButton.setAttribute("aria-expanded", "false");
    fields.historyButton.setAttribute("aria-expanded", "false");
    fields.drawerBackdrop.hidden = true;
    app.drawer = null;
    app.drawerTrigger = null;
    if (restoreFocus) trigger?.focus();
}

function openDrawer(name, trigger) {
    if (app.drawer === name) {
        closeDrawer();
        return;
    }
    closeDrawer({ restoreFocus: false });
    app.drawer = name;
    app.drawerTrigger = trigger;
    const panel = name === "profile" ? fields.profilePanel : fields.historyPanel;
    trigger.setAttribute("aria-expanded", "true");
    panel.classList.add("is-open");
    panel.setAttribute("aria-hidden", "false");
    fields.drawerBackdrop.hidden = false;
    (name === "profile" ? fields.profileClose : fields.historyClose).focus();
}

fields.startButton.addEventListener("click", () => void startLife());
fields.continueButton.addEventListener("click", () => void continueLife());
fields.clearSaveButton.addEventListener("click", clearSave);
fields.stepButton.addEventListener("click", stepLife);
fields.advanceButton.addEventListener("click", () => void advanceLife());
fields.seedInput.addEventListener("input", render);
fields.profileButton.addEventListener("click", () => openDrawer("profile", fields.profileButton));
fields.historyButton.addEventListener("click", () => openDrawer("history", fields.historyButton));
fields.profileClose.addEventListener("click", () => closeDrawer());
fields.historyClose.addEventListener("click", () => closeDrawer());
fields.drawerBackdrop.addEventListener("click", () => closeDrawer());
document.addEventListener("keydown", event => {
    if (event.key === "Escape" && app.drawer) closeDrawer();
});

loadProductionEntry({ entryPath: V05_ENTRY_PATH, catalogNames: [], validate: false }).then(loaded => {
    if (!loaded.routeGraphShards?.[V05_PACK_ID]?.path) {
        const error = new Error("活动 package 未列出 douluo1 route shard。");
        error.code = "V05_ROUTE_SHARD_NOT_LISTED";
        throw error;
    }
    app.controlPlane = loaded;
    refreshStoredSave();
    if (!app.loadError) setEvent("V0.5 RC2 候选已就绪", "可开始新人生，或继续经过重放验证的本地检查点。");
}).catch(error => {
    app.loadError = errorRecord(error, "V05_CONTROL_PLANE_LOAD_FAILED");
    setEvent("入口加载失败", "无法读取 production entry、package index 或 policy。");
}).finally(() => {
    app.loading = false;
    render();
});
