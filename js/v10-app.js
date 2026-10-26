import { createV10RouteWheel, createV10EraWheel } from "./v10-route-wheel.js";
import { createV10ContentLoader } from "./v10-content-loader.js";
import { createV10LifeRunner } from "./v10-life-runner.js";
import { createV10SaveStore, MAX_SAVE_BYTES } from "./v10-save-store.js";
import { createV10Display, actualAgeText, playerWheelView } from "./v10-display.js";
import { createV10HistoryView } from "./v10-history-view.js";
import { packName, routeName, growthChanges, nextGoal, endingText, problemInfo } from "./v10-experience.js";

const loader = createV10ContentLoader();
const runner = createV10LifeRunner({ contentLoader: loader });
const saves = createV10SaveStore({ contentLoader: loader, runner });
const saveSlot = document.querySelector("#save-slot");
const saveStatus = document.querySelector("#save-status");
const saveFile = document.querySelector("#save-file");
const packList = document.querySelector("#pack-list");
const status = document.querySelector("#v10-status");
const game = document.querySelector("#human-game");
const characterToggle = document.querySelector("#character-toggle");
const characterMenuPanel = document.querySelector("#character-menu-panel");
const routeToggle = document.querySelector("#route-toggle");
const gameFields = Object.fromEntries([
    "human-seed", "human-restart", "human-new", "human-step", "human-age", "human-terminal",
    "human-reroll", "human-progress", "human-age-value", "human-level-value", "human-stage-value",
    "human-cursor-value", "human-route-value", "human-result", "human-options", "human-history", "human-ending",
    "human-ending-text", "game-route-label", "game-title", "human-age-label",
    "human-species-value", "human-ability-counts", "human-wheel", "human-wheel-title", "human-wheel-note",
    "human-martial-souls", "human-soul-bones", "human-attributes", "human-domains",
    "human-bloodlines", "human-talents", "human-skills", "human-godhood",
    "current-seed", "character-name", "character-bloodline", "character-attributes",
    "cultivation-label", "cultivation-value", "actual-age-value", "combat-power-value", "human-fast-cancel", "character-identity", "wheel-labels", "runtime-diagnostics",
    "result-changes", "result-feedback", "result-kind", "result-title", "result-summary", "result-highlights", "result-change-details", "result-source", "next-goal", "life-save-state", "problem-details", "problem-status", "human-ending-title", "bloodline-label", "sea-god-choice", "sea-god-ascend", "sea-god-continue"
].map(id => [id, document.querySelector(`#${id}`)]));
const panels = {
    "character-menu-panel": { panel: characterMenuPanel, toggle: characterToggle },
    "history-panel": { panel: document.querySelector("#history-panel"), toggle: document.querySelector("#history-toggle") },
    "save-panel": { panel: document.querySelector("#save-panel"), toggle: document.querySelector("#save-toggle") }
};
const openingWheels = new Map();
let lifeRunner = null;
let gameBusy = false;
let activeRoute = "human";
let activePack = "douluo1";
let manualSeed = false;
// One transient pre-draw snapshot; never written to a save slot.
let undoCheckpoint = null;
// UI-only cancellation; never persisted in a session or save.
let autoRunning = false;
let autoEpoch = 0;
let autoTask = null;
// One transient batch request; never included in session snapshots or save slots.
let fastControl = null;
let fastTask = null;
let unsaved = false;
let lastChanges = [];
let lastFeedback = null;
let lastError = null;
let slotsEpoch = 0;
let slotsLoading = false;
function confirmDiscard() {
    return !unsaved || window.confirm("当前人生有未保存进度。继续将离开这段进度；取消后可先打开存档手动保存或导出。是否继续？");
}
function captureCommit(snapshot) {
    undoCheckpoint = { snapshot, nextCursor: lifeRunner.session.random.cursor };
    lastChanges = growthChanges(snapshot.session.character, lifeRunner.session.character);
    lastFeedback = prepareResultFeedback(snapshot.session.character, lifeRunner.session.character, lastChanges);
    unsaved = true;
    lastError = null;
}

function stopFast(reason = "paused") {
    if (fastControl && !fastControl.reason) {
        fastControl.reason = reason;
        gameFields["human-terminal"].disabled = true;
        gameFields["human-fast-cancel"].disabled = true;
        gameFields["human-progress"].textContent = reason === "cancelled" ? "正在取消推进…" : "正在暂停极速…";
    }
}

function stopContinuous() { stopAuto(); stopFast(); }

async function toggleFast() {
    if (fastControl) { stopFast(); return; }
    if (!lifeRunner || gameBusy || autoRunning || autoTask || fastTask
        || ["completed", "boundary", "error"].includes(lifeRunner.phase)) return;
    const control = { reason: null };
    fastControl = control;
    fastTask = runLife("runToTerminal", "极速推进中…");
    try { await fastTask; } finally {
        const message = gameFields["human-progress"].textContent;
        fastControl = null;
        fastTask = null;
        renderGame();
        if(lifeRunner.awaitingSeaGodChoice)gameFields['human-progress'].textContent='海神已继承，请选择立即飞升或继续人生。';
        else if (!["completed", "boundary", "error"].includes(lifeRunner.phase)) {
            gameFields["human-progress"].textContent = control.reason === "cancelled"
                ? "本批极速推进已取消，已完成的抽取保留。"
                : control.reason === "paused" ? "极速推进已暂停，可继续推进。" : message;
        }
    }
}

function stopAuto() {
    autoRunning = false;
    autoEpoch += 1;
    gameFields["human-age"].textContent = "自动推进";
}

async function stopAutoAndWait() {
    stopContinuous();
    if (autoTask) await autoTask;
    if (fastTask) await fastTask;
}

async function toggleAuto() {
    if (autoRunning) { stopAuto(); return; }
    if (!lifeRunner || gameBusy || autoTask || fastControl || fastTask || ["completed", "boundary", "error"].includes(lifeRunner.phase)) return;
    autoRunning = true;
    const epoch = ++autoEpoch;
    gameFields["human-age"].textContent = "暂停推进";
    autoTask = (async () => {
        let steps = 0;
        let failed = false;
        try {
            while (autoRunning && epoch === autoEpoch && steps < 200) {
                if (await runLife("step", "自动推进中…", true) === false) { failed = true; break; }
                steps += 1;
                if (["completed", "boundary", "error"].includes(lifeRunner.phase)||lifeRunner.awaitingSeaGodChoice) break;
                if (autoRunning && epoch === autoEpoch && steps < 200) {
                    await new Promise(resolve => setTimeout(resolve, 180));
                }
            }
        } finally {
            stopAuto();
            const failureMessage = failed ? gameFields["human-progress"].textContent : null;
            renderGame();
            if (failureMessage) gameFields["human-progress"].textContent = failureMessage;
            if(lifeRunner.awaitingSeaGodChoice)gameFields['human-progress'].textContent='海神已继承，请选择立即飞升或继续人生。';
            else if (!failed && !["completed", "boundary", "error"].includes(lifeRunner.phase)) {
                gameFields["human-progress"].textContent = steps >= 200
                    ? "自动已推进200次，已暂停，可再次启动。"
                    : "自动推进已暂停。";
            }
        }
    })();
    try { await autoTask; } finally { autoTask = null; }
}

function setStatus(message, tone = "info") {
    status.textContent = message;
    status.dataset.tone = tone;
}

function closePanel(id, returnFocus = true) {
    const { panel, toggle } = panels[id];
    panel.close?.();
    panel.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    if (returnFocus) toggle.focus();
}

function closeCharacterMenu(returnFocus = true) {
    closePanel("character-menu-panel", returnFocus);
}

function setRouteChoicesVisible(visible) {
    if (visible && !gameBusy) for (const wheel of openingWheels.values()) {
        wheel.disc.style.transform = "";
        wheel.renderWheel(createV10EraWheel(wheel.packs));
        wheel.result.textContent = "先抽取年代，再抽取人类／魂兽身份。";
    }
    packList.hidden = !visible;
    status.hidden = !visible;
    routeToggle.setAttribute("aria-expanded", String(visible));
    routeToggle.textContent = visible ? "收起路线" : "更换路线";
}

function togglePanel(id) {
    const { panel, toggle } = panels[id];
    if (!panel.hidden) return closePanel(id);
    const refreshAfterAdvance = Boolean(gameBusy || autoTask || fastTask);
    stopContinuous();
    for (const other of Object.keys(panels)) {
        if (other !== id && !panels[other].panel.hidden) closePanel(other, false);
    }
    panel.hidden = false;
    // Refresh current facts before showing the drawer, including between batch renders.
    if (id === "character-menu-panel" && lifeRunner) renderGame();
    panel.showModal?.();
    toggle.setAttribute("aria-expanded", "true");
    if (id === "history-panel" && lifeRunner) renderHistory();
    if (id === 'save-panel') void refreshSlots();
    // Finish the in-flight atomic step before refreshing an opened drawer.
    void stopAutoAndWait().then(() => {
        if (!panel.hidden && (id !== "character-menu-panel" || refreshAfterAdvance)) renderGame();
    });
    panel.querySelector("[data-close-panel]").focus();
}

const { renderCombatPower, renderCharacterSummary, renderCharacterDetails, renderWheel, godTrialProgress, prepareResultFeedback, renderResultFeedback } = createV10Display(gameFields);
const historyView = createV10HistoryView({
    list: gameFields['human-history'],
    older: document.querySelector('#history-older'), newer: document.querySelector('#history-newer'),
    latest: document.querySelector('#history-latest'), status: document.querySelector('#history-page'),
    getTimeline: () => lifeRunner?.session.timeline ?? [],
    getHistory: () => lifeRunner?.session.history ?? [],
    filter: document.querySelector('#history-filter'), search: document.querySelector('#history-search'),
    review: document.querySelector('#life-review')
});
function renderHistory() { historyView.render(); }

async function animateCommittedSpin(view) {
    const selected = view?.segments?.find(segment => segment.optionId === view.selectedOptionId);
    if (!selected) return;
    renderWheel(view);
    if (globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const disc = gameFields["human-wheel"];
    disc.style.setProperty("--landing-rotation", `${720 + 360 - selected.midpoint}deg`);
    disc.className = "life-wheel has-options is-spinning";
    await new Promise(resolve => setTimeout(resolve, 720));
    disc.style.removeProperty("--landing-rotation");
}

function setGameBusy(value, message = null) {
    gameBusy = value;
    routeToggle.disabled = value;
    for (const id of ["human-restart", "human-new", "human-step", "human-age", "human-terminal"]) {
        gameFields[id].disabled = (!lifeRunner && id !== "human-new")
            || (value && !(autoRunning && ["human-age", "human-new", "human-restart"].includes(id))
                && !(fastControl && ["human-terminal", "human-new", "human-restart"].includes(id)))
            || (id === "human-terminal" && Boolean(fastControl?.reason));
    }
    gameFields["human-fast-cancel"].hidden = !fastControl;
    gameFields["human-fast-cancel"].disabled = !fastControl || Boolean(fastControl.reason);
    gameFields["human-terminal"].textContent = fastControl ? "暂停极速" : "极速推进";
    gameFields["human-reroll"].disabled = !undoCheckpoint || (value && !autoRunning && !fastControl);
    gameFields["human-seed"].disabled = value;
    for (const button of document.querySelectorAll("[data-start-route]")) button.disabled = value;
    for (const control of document.querySelectorAll("#save-panel button, #save-panel input, #save-panel select")) control.disabled = value || slotsLoading;
    if (message) gameFields["human-progress"].textContent = message;
}

async function refreshSlots() {
    const epoch=++slotsEpoch;
    slotsLoading=true;
    saveSlot.disabled=true;
    for(const button of document.querySelectorAll('[data-save-action]')) button.disabled=true;
    document.querySelector('#save-slot-summary').textContent='正在校验槽位摘要…';
    const selected = saveSlot.value;
    try {
        const slots = await saves.list();
        if(epoch !== slotsEpoch) return;
        saveSlot.replaceChildren(...slots.map(({ slot, summary }) => {
            const option = document.createElement("option");
            option.value = String(slot);
            option.textContent = `${slot}号 · ${summary}`;
            return option;
        }));
        if (selected) saveSlot.value = selected;
        renderSlotSummary();
    } catch(error) { saveStatus.textContent=`槽位摘要读取失败：${error.message}。当前人生保留，可导出当前人生。`; }
    finally {
        if(epoch===slotsEpoch) {
            slotsLoading=false;saveSlot.disabled=gameBusy;
            for(const button of document.querySelectorAll('[data-save-action]')) button.disabled=gameBusy;
        }
    }
}
function renderSlotSummary() {
    document.querySelector('#save-slot-summary').textContent=saveSlot.selectedOptions?.[0]?.textContent ?? '请选择槽位。';
}

async function saveAction(action) {
    await stopAutoAndWait();
    if (gameBusy) return;
    setGameBusy(true);
    slotsEpoch += 1;
    slotsLoading = false;
    saveStatus.textContent = action === "export-raw" ? "正在导出原始备份…" : "正在校验存档…";
    try {
        if (!saveSlot.value) await refreshSlots();
        const slot = Number(saveSlot.value);
        if (action === "load") {
            if (!confirmDiscard()) { saveStatus.textContent = "已取消读取；当前人生和槽位均保留。"; return; }
            const restored = await saves.read(slot);
            lifeRunner = restored;
            unsaved = false;
            lastChanges = [];
            lastError = null;
            historyView.reset();
            undoCheckpoint = null;
            const snapshot = restored.exportSnapshot();
            activePack = snapshot.packId;
            activeRoute = snapshot.route;
            gameFields["human-seed"].value = snapshot.seed;
            manualSeed = true;
            game.hidden = false;
            setRouteChoicesVisible(false);
            saveStatus.textContent = `已读取${slot}号槽；${restored.phase === "completed" ? "人生已结束。" : ["boundary","error"].includes(restored.phase) ? "已恢复中断时的进度，可保存、导出并查看问题信息。" : "可继续当前人生。"}`;
        } else if (["export", "export-raw", "export-current"].includes(action)) {
            const rawBackup = action === "export-raw";
            if (action === 'export-current' && !lifeRunner) throw new Error('请先开始一次人生。');
            const text = action === 'export-current' ? await saves.serialize(lifeRunner) : await saves.exportSlot(slot, { rawBackup });
            const blob = new Blob([text], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = action === 'export-current' ? 'douluo-life-current.json' : `douluo-life-slot-${slot}${rawBackup ? "-raw-backup" : ""}.json`;
            link.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            saveStatus.textContent = action === 'export-current' ? (blob.size > MAX_SAVE_BYTES ? '已导出当前人生；文件超过4 MiB读取上限，仅作状态备份，当前版本无法导入。槽位保持不变。' : '已导出当前人生；槽位保持不变，请保管下载文件。') : rawBackup
                ? `已导出${slot}号槽原始备份（未经校验，不代表可读取）；原槽位保持不变。`
                : `已导出${slot}号槽。`;
        } else {
            const expected = saves.raw(slot);
            let text;
            if (action === "import") {
                const file = saveFile.files[0];
                if (!file) throw new Error("请先选择要导入的 JSON 文件。");
                if (file.size > MAX_SAVE_BYTES) throw new Error("文件超过4 MiB上限。");
                text = await file.text();
            } else {
                if (!lifeRunner) throw new Error("请先开始一次人生。");
                text = await saves.serialize(lifeRunner);
            }
            if (expected !== null && !window.confirm(`确认覆盖${slot}号槽？建议先导出原存档。`)) {
                saveStatus.textContent = "已取消覆盖；原槽位保持不变。";
                return;
            }
            const saved = await saves.write(slot, text, { expected, overwrite: expected !== null });
            // Reuse the validated write summary; no second restore of all eight slots.
            if(saved && saveSlot.selectedOptions?.[0]) saveSlot.selectedOptions[0].textContent=`${slot}号 · ${saved.summary}`;
            renderSlotSummary();
            if (action === 'save') unsaved = false;
            saveStatus.textContent = `已${action === "import" ? "导入" : "保存"}到${slot}号槽。`;
        }
    } catch (error) {
        lastError = error;
        saveStatus.textContent = `${error.code ?? "SAVE_FAILED"}：${error.message} 当前人生未切换，原槽位未被本操作替换。可重试、换空槽，或先导出原始备份；存储不可用时可导出当前人生。`;
    } finally {
        // Slots are refreshed when the drawer opens; reads/exports/cancellation do not change them.
        setGameBusy(false);
        renderGame();
    }
}

function renderGame() {
    gameFields['problem-details'].textContent = problemInfo(lifeRunner,lastError);
    if (!lifeRunner) return;
    const profile = lifeRunner.characterProfile;
    const session = lifeRunner.session;
    const isBeast = profile.route === "beast";
    const routeText = profile.route === "transformed" ? "化形后人类" : profile.route === "beast" ? "魂兽" : "人类";
    gameFields["game-route-label"].textContent = `${packName(session.packId)} · ${routeText}`;
    gameFields["human-route-value"].textContent = `${packName(session.packId)} / ${routeText}`;
    gameFields["game-title"].textContent = isBeast
        ? "魂兽人生"
        : profile.route === "transformed"
            ? "化形后人类生命周期"
            : "人类人生";
    gameFields["current-seed"].textContent = lifeRunner.seed ?? session.random.seed ?? '来源未记录';
    gameFields["life-save-state"].textContent = unsaved ? '有未保存进度 · 请手动保存或导出' : '当前无新增未保存抽取 · 手动保存，不会自动恢复';
    renderCombatPower(lifeRunner.combatPower);
    const characterPanelOpen = !characterMenuPanel.hidden;
    renderCharacterSummary(session.character, profile, { includeIdentity: characterPanelOpen });
    gameFields["human-age-label"].textContent = "实际年龄";
    gameFields["human-age-value"].textContent = actualAgeText(session.character);
    gameFields["human-level-value"].textContent = isBeast ? '魂兽以修为年限成长' : String(profile.level ?? "来源未记录");
    gameFields["human-species-value"].textContent = profile.species ?? "未确定";
    const completed = lifeRunner.phase === "completed";
    const wheel = completed ? null : playerWheelView(lifeRunner.wheelView);
    gameFields["runtime-diagnostics"].textContent = `pack: ${session.packId} · route: ${session.character.route} · flowId: ${wheel?.flowId ?? session.currentFlowId ?? "—"} · poolId: ${wheel?.poolId ?? session.currentPoolId ?? "—"} · code: ${lifeRunner.error?.code ?? "—"}`;
    const trialText = godTrialProgress(session.character, session.packId);
    gameFields['next-goal'].textContent = nextGoal(session.character,session.packId,lifeRunner.phase,trialText);
    gameFields["human-stage-value"].textContent = completed ? "人生结局"
        : trialText ?? (session.character.flags?.["formal:d1-story:free-mode"] ? "自由修炼" : wheel?.title ?? "人生成长");
    gameFields["human-cursor-value"].textContent = `${session.random.cursor} / ${session.history.length}`;
    if (characterPanelOpen) renderCharacterDetails(session.character, session.packId);
    const resultText = (completed
        ? lifeRunner.summary?.ending?.text ?? lifeRunner.lastWheelResult?.recentResult?.text
        : wheel?.recentResult?.text)
        ?? lifeRunner.lastResult?.spin?.option?.normalized?.text ?? session.history.at(-1)?.text;
    gameFields["human-result"].textContent = completed
        ? `人生结局：${resultText ?? lifeRunner.summary?.ending?.title ?? "旅程结束"}`
        : resultText ? `已抽取：${resultText}` : "等待抽取";
    gameFields['result-changes'].textContent = lastChanges.join('\n');
    if (!completed && session.character.flags?.["formal:deferred-ending:douluo1:story:independent-ascension"] === true) {
        gameFields["human-result"].textContent += " 已抽到过飞升选项，但尚未形成飞升结局：当前规则在150岁前只记录该选择，后续仍须满足条件并实际结算。";
    }
    renderResultFeedback({ feedback: lastChanges.length ? lastFeedback : null,
        phase: lifeRunner.phase, character: session.character, text: resultText,
        ending: lifeRunner.summary?.ending, changes: lastChanges });
    renderWheel(completed ? { status: "completed", title: "人生结局", segments: [] } : wheel);
    if (!panels["history-panel"].panel.hidden) renderHistory();
    gameFields["human-ending"].hidden = !["completed","boundary","error"].includes(lifeRunner.phase);
    if (!gameFields['human-ending'].hidden) {
        gameFields['human-ending-title'].textContent = completed ? '人生结局' : '旅程暂时中断';
        gameFields['human-ending-text'].textContent = endingText(lifeRunner);
    }
    const blocked = ["completed", "boundary", "error"].includes(lifeRunner.phase);
    const seaChoice=Boolean(lifeRunner.awaitingSeaGodChoice);
    gameFields['sea-god-choice'].hidden=blocked||session.character.seaTrial?.tier!=='seaGod'||session.character.seaTrial.status!=='completed';
    gameFields['sea-god-continue'].hidden=!seaChoice;
    gameFields['sea-god-ascend'].disabled=gameBusy;
    if(seaChoice)stopContinuous();
    gameFields["human-step"].disabled = gameBusy || autoRunning || blocked || seaChoice;
    gameFields["human-age"].disabled = (gameBusy && !autoRunning) || blocked || seaChoice;
    gameFields["human-terminal"].disabled = (gameBusy && !fastControl) || autoRunning || blocked || seaChoice || Boolean(fastControl?.reason);
    gameFields["human-terminal"].textContent = fastControl ? "暂停极速" : "极速推进";
    gameFields["human-fast-cancel"].hidden = !fastControl;
    gameFields["human-fast-cancel"].disabled = !fastControl || Boolean(fastControl.reason) || blocked;
    gameFields["human-restart"].disabled = gameBusy && !autoRunning && !fastControl;
    gameFields["human-new"].disabled = gameBusy && !autoRunning && !fastControl;
    gameFields["human-reroll"].disabled = seaChoice || !undoCheckpoint || (gameBusy && !autoRunning && !fastControl);
    gameFields["human-seed"].disabled = gameBusy;
    gameFields['human-step'].textContent = wheel?.status==='dynamic' ? '结算当前阶段' : '转动一次命运';
    gameFields["human-progress"].textContent = completed
        ? "人生已结束，可保存或导出这段旅程。"
        : ["boundary", "error"].includes(lifeRunner.phase)
            ? `${lifeRunner.error?.code==='APK_POOL_HAS_NO_ELIGIBLE_OPTIONS'?'当前阶段没有可用选项':lifeRunner.phase==='boundary'?'当前内容尚未支持':'本次结算失败'}。推进已停止，原进度保留；可保存、导出并复制问题信息。未判定为死亡，技术详情见诊断信息。`
            : gameBusy ? (wheel?.status==='dynamic' ? '正在结算当前阶段…' : '正在提交抽取…')
                : autoRunning ? '自动推进中 · 点击暂停将在当前一步完成后停止'
                    : fastControl ? '极速推进中 · 可暂停，已完成的抽取保留'
                        : seaChoice ? '海神已继承，请选择立即飞升或继续人生。' : wheel?.status==='dynamic' ? '下一步将结算当前阶段，不是新的随机抽取。' : `可抽取下一次命运 · ${gameFields['human-stage-value'].textContent}`;
}

function clearLifeView(route = null, packId = null) {
    lastFeedback = null;
    renderResultFeedback();
    gameFields['sea-god-choice'].hidden=true;
    undoCheckpoint = null;
    lastChanges = [];
    lastError = null;
    gameFields['result-changes'].textContent = '';
    gameFields['problem-status'].textContent = '';
    gameFields['problem-details'].textContent = problemInfo(null);
    gameFields['life-save-state'].textContent = '开局前请了解：只有手动保存或导出才会保留人生；刷新后需主动读档。部分内容遇到运行时边界会中断。';
    gameFields["human-reroll"].disabled = true;
    gameFields["human-result"].textContent = "等待抽取";
    renderWheel(null);
    historyView.reset();
    gameFields["human-history"].replaceChildren();
    gameFields["human-ending"].hidden = true;
    gameFields["human-ending-text"].textContent = "";
    gameFields["game-route-label"].textContent = packId ? `${packId} · ${route}` : "尚未开始";
    for (const id of ["human-age-value", "human-level-value", "human-route-value", "human-stage-value", "human-cursor-value"]) gameFields[id].textContent = "—";
    gameFields["human-species-value"].textContent = "未确定";
    renderCombatPower(null);
    renderCharacterSummary({}, { route });
    renderCharacterDetails({});
    gameFields["human-ability-counts"].textContent = "0 / 0 / 0";
    gameFields["human-progress"].textContent = "等待开始";
}

async function newFate() {
    await stopAutoAndWait();
    if (gameBusy) return;
    if (!confirmDiscard()) return;
    unsaved = false;
    for (const id of Object.keys(panels)) if (!panels[id].panel.hidden) closePanel(id, false);
    lifeRunner = null;
    activePack = null;
    activeRoute = null;
    manualSeed = false;
    gameFields["human-seed"].value = "";
    gameFields["current-seed"].textContent = "尚未开始";
    clearLifeView();
    game.hidden = true;
    setGameBusy(false);
    setRouteChoicesVisible(true);
    setStatus("转动命运开局，年代与身份都由转盘决定。", "ready");
    packList.querySelector("[data-start-route]")?.focus();
    packList.scrollIntoView({ block: "start" });
}

async function animateOpeningWheel(wheel, view, message) {
    const disc = wheel.disc;
    disc.style.transform = "";
    wheel.renderWheel(view);
    wheel.result.textContent = message;
    const selected = view.segments.find(segment => segment.optionId === view.selectedOptionId);
    const rotation = `${1080 - selected.midpoint}deg`;
    disc.style.setProperty("--landing-rotation", rotation);
    disc.getBoundingClientRect?.();
    if (!globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
        disc.className = "life-wheel has-options is-spinning";
        await new Promise(resolve => setTimeout(resolve, 720));
    }
    disc.className = "life-wheel has-options";
    disc.style.transform = `rotate(${rotation})`;
    disc.style.removeProperty("--landing-rotation");
}

async function startLife(route = activeRoute, packId = activePack, { replay = false, fresh = false, openingWheel = null } = {}) {
    await stopAutoAndWait();
    if (gameBusy) return;
    if (!confirmDiscard()) return;
    const replaySeed = lifeRunner?.seed ?? lifeRunner?.session.random.seed;
    let failure = null;
    setGameBusy(true, openingWheel ? "正在抽取开局路线…" : `正在载入${packId === "douluo2" ? "绝世唐门" : "斗罗一"}${route === "beast" ? "魂兽" : "人类"}内容…`);
    try {
        const seed = replay && replaySeed ? replaySeed : fresh || (!replay && !manualSeed) || !gameFields["human-seed"].value.trim()
            ? globalThis.crypto.randomUUID()
            : gameFields["human-seed"].value.trim();
        if (openingWheel) {
            const era = createV10EraWheel(openingWheel.packs, seed);
            await animateOpeningWheel(openingWheel, era, "正在抽取年代…");
            packId = era.selectedOptionId;
            const pack = openingWheel.packs.find(item => item.id === packId);
            const identity = createV10RouteWheel(pack, seed);
            await animateOpeningWheel(openingWheel, identity, `年代：${era.recentResult.text}。正在抽取身份…`);
            route = identity.selectedOptionId;
            openingWheel.result.textContent = `${era.recentResult.text} · ${identity.recentResult.text}，正在载入…`;
        }
        const candidate = await runner.start(packId, {
            seed,
            route
        });
        activeRoute = route;
        activePack = packId;
        clearLifeView(route,packId);
        lifeRunner = candidate;
        unsaved = false;
        gameFields['human-seed'].value = seed;
        if (fresh) manualSeed = false;
        game.hidden = false;
        for (const id of Object.keys(panels)) if (!panels[id].panel.hidden) closePanel(id, false);
        setRouteChoicesVisible(false);
        renderGame();
        game.scrollIntoView({ block: "start" });
    } catch (error) {
        lastError = error;
        failure = `${error.code ?? "START_FAILED"}：${error.message} 开局未切换，原人生保留。`;
        if (openingWheel) openingWheel.result.textContent = failure;
    } finally {
        setGameBusy(false);
        renderGame();
        if(failure) { setStatus(failure,'error');gameFields['human-progress'].textContent=failure; }
    }
}

async function runLife(action, label, automatic = false) {
    if (!lifeRunner || gameBusy || (autoRunning && !automatic) || (fastControl && action !== "runToTerminal")
        || ["completed", "boundary", "error"].includes(lifeRunner.phase)) return;
    setGameBusy(true, label);
    let batchResult = null;
    let failure = null;
    try {
        if (action === "step") {
            const result = lifeRunner.step({ onCheckpoint: captureCommit });
            if (!result.committed) lastChanges = [];
            if (result.committed) {
                gameFields["human-reroll"].disabled = !automatic;
            }
            if (lifeRunner.phase === "completed") {
                renderGame();
            } else if (result.committed && lifeRunner.lastWheelResult) {
                renderGame();
                await animateCommittedSpin(lifeRunner.lastWheelResult);
            }
        } else {
            batchResult = await lifeRunner[action]({
                ...(action === "runToTerminal" ? { maxSteps: 200, shouldStop: () => Boolean(fastControl?.reason) } : {}),
                onCheckpoint: captureCommit,
                onStep(result, step) {
                    if (!result.committed) lastChanges=[];
                    if (step % 25 === 0) renderGame();
                },
                yieldStep: () => new Promise(resolve => setTimeout(resolve, 0))
            });
        }
    } catch (error) {
        stopAuto();
        lastError = error;
        lastChanges = [];
        failure = (error.code ?? "UI_STEP_FAILED") + "：" + error.message;
    } finally {
        setGameBusy(false);
        renderGame();
        if (failure) gameFields["human-progress"].textContent = failure;
        if (batchResult?.reason === "batch-limit") {
            gameFields["human-progress"].textContent = `本批已推进 ${batchResult.steps} 次，尚无结局，可继续推进。`;
        }
    }
    return !failure;
}


async function rerollLast() {
    await stopAutoAndWait();
    if (gameBusy || !lifeRunner || !undoCheckpoint) return;
    setGameBusy(true, "正在撤销最新抽取并重抽…");
    let failure = null;
    try {
        const snapshot = structuredClone(undoCheckpoint.snapshot);
        // Retain spent random inputs: restoring the old cursor would repeat the old draw.
        snapshot.session.random.cursor = undoCheckpoint.nextCursor;
        const candidate = await runner.start(snapshot.packId, {
            seed: snapshot.seed, route: snapshot.route, snapshot
        });
        const result = candidate.step();
        if (!result.committed) {
            throw Object.assign(new Error(candidate.error?.message ?? "本次重抽未提交，原结果已保留。"), {
                code: candidate.error?.code ?? "REROLL_NOT_COMMITTED"
            });
        }
        // Publish only a validated, committed replacement; failures retain the original life.
        lifeRunner = candidate;
        unsaved = true;
        lastChanges = growthChanges(snapshot.session.character, candidate.session.character);
        lastFeedback = prepareResultFeedback(snapshot.session.character, candidate.session.character, lastChanges);
        lastError = null;
        historyView.reset();
        undoCheckpoint = { snapshot, nextCursor: candidate.session.random.cursor };
        renderGame();
        if (candidate.phase !== "completed" && candidate.lastWheelResult) {
            await animateCommittedSpin(candidate.lastWheelResult);
        }
    } catch (error) {
        lastError = error;
        lastChanges = [];
        failure = (error.code ?? "REROLL_FAILED") + "：" + error.message;
    } finally {
        setGameBusy(false);
        renderGame();
        if (failure) gameFields["human-progress"].textContent = failure;
    }
}

function openingCard(packs) {
    const article = document.createElement("article");
    article.className = "pack-card";
    article.innerHTML = `<h2>让命运决定你的一生</h2>
        <p>第一转抽取年代：斗罗一／绝世唐门，各50%。第二转抽取身份：人类／魂兽，各50%。化形仍由人生事件触发。</p>
        <section class="route-wheel-stage" aria-label="年代与身份转盘">
            <h3 class="route-wheel-title">年代转盘</h3>
            <div class="wheel-wrap"><div class="wheel-pointer" aria-hidden="true"></div>
                <div class="life-wheel" role="img"><div class="wheel-labels" aria-hidden="true"></div><div class="wheel-hub">命运</div></div>
            </div>
            <p class="route-wheel-result" role="status" aria-live="polite">先抽取年代，再抽取人类／魂兽身份。</p>
            <details class="options-details"><summary>当前转盘概率</summary><p class="wheel-note"></p><ol class="wheel-options"></ol></details>
        </section><div class="card-actions"></div>`;
    const fields = {
        "human-wheel": article.querySelector(".life-wheel"),
        "human-wheel-title": article.querySelector(".route-wheel-title"),
        "wheel-labels": article.querySelector(".wheel-labels"),
        "human-wheel-note": article.querySelector(".wheel-note"),
        "human-options": article.querySelector(".wheel-options")
    };
    const openingWheel = { packs, disc: fields["human-wheel"],
        result: article.querySelector(".route-wheel-result"), renderWheel: createV10Display(fields).renderWheel };
    openingWheels.set("opening", openingWheel);
    openingWheel.renderWheel(createV10EraWheel(packs));
    const start = document.createElement("button");
    start.type = "button";
    start.className = "primary-action";
    start.textContent = "转盘开启人生";
    start.dataset.startRoute = "random";
    start.addEventListener("click", () => void startLife(null, null, { openingWheel }));
    article.querySelector(".card-actions").append(start);
    return article;
}

async function boot() {
    try {
        const manifest = await loader.getManifest();
        packList.replaceChildren(...(manifest.packs.length ? [openingCard(manifest.packs)] : []));
        setStatus("年代与身份都由转盘抽取：先抽斗罗一／绝世唐门，再抽人类／魂兽。", "ready");
    } catch (error) {
        setStatus(`LOAD_FAILED：${error.message}`, "error");
    }
}

gameFields["human-seed"].addEventListener("input", () => { manualSeed = Boolean(gameFields["human-seed"].value.trim()); });
gameFields["human-restart"].addEventListener("click", () => { if (lifeRunner) void startLife(activeRoute, activePack, { replay: true }); });
gameFields["human-new"].addEventListener("click", () => newFate());
gameFields["human-reroll"].addEventListener("click", () => rerollLast());
gameFields["human-step"].addEventListener("click", () => void runLife("step", "正在提交一次选择…"));
gameFields["human-age"].addEventListener("click", () => void toggleAuto());
gameFields["human-terminal"].addEventListener("click", () => void toggleFast());
for(const [id,choice] of [['sea-god-ascend','ascend'],['sea-god-continue','continue']])gameFields[id].addEventListener('click',async()=>{
    await stopAutoAndWait();if(gameBusy||!lifeRunner)return;
    setGameBusy(true);
    try{const before=lifeRunner.exportSnapshot().session.character;const result=lifeRunner.resolveSeaGodAscension(choice);if(result.committed){unsaved=true;undoCheckpoint=null;lastChanges=growthChanges(before,lifeRunner.session.character);lastError=null;}}
    catch(error){lastError=error;}
    finally{setGameBusy(false);renderGame();}
});
gameFields["human-fast-cancel"].addEventListener("click", () => stopFast("cancelled"));
routeToggle.addEventListener("click", () => {
    stopContinuous();
    if (!characterMenuPanel.hidden) closeCharacterMenu(false);
    const visible = packList.hidden;
    setRouteChoicesVisible(visible);
    if (visible) packList.scrollIntoView({ block: "start" });
});
document.querySelector('#copy-problem').addEventListener('click', async () => {
    gameFields['problem-details'].textContent=problemInfo(lifeRunner,lastError);
    try {
        await navigator.clipboard.writeText(gameFields['problem-details'].textContent);
        gameFields['problem-status'].textContent='已复制有限问题信息；未包含完整存档，也没有上传。';
    } catch { gameFields['problem-status'].textContent='复制不可用，请展开问题信息并手动选择复制。'; }
});
for(const button of document.querySelectorAll('[data-ending-action]')) button.addEventListener('click',()=> {
    const action=button.dataset.endingAction;
    if(action==='save') togglePanel('save-panel');
    if(action==='export') void saveAction('export-current');
    if(action==='replay') void startLife(activeRoute,activePack,{replay:true});
    if(action==='new') void newFate();
});
globalThis.window?.addEventListener?.('beforeunload',event=>{ if(unsaved){event.preventDefault();event.returnValue='';} });
for (const [id, { toggle }] of Object.entries(panels)) toggle.addEventListener("click", () => togglePanel(id));
for (const [id, { panel }] of Object.entries(panels)) {
    panel.addEventListener("cancel", event => { event.preventDefault(); closePanel(id); });
    panel.addEventListener("click", event => {
        if (event.target !== panel || !panel.getBoundingClientRect) return;
        const rect = panel.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right
            || event.clientY < rect.top || event.clientY > rect.bottom) closePanel(id);
    });
}
document.addEventListener("visibilitychange", () => { if (document.hidden) stopContinuous(); });
for (const button of document.querySelectorAll("[data-close-panel]")) button.addEventListener("click", () => closePanel(button.dataset.closePanel));
document.addEventListener("keydown", event => {
    const open = Object.keys(panels).find(id => !panels[id].panel.hidden);
    if (event.key === "Tab" && open) {
        const focusable = [...panels[open].panel.querySelectorAll(
            'button:not([disabled]), input:not([disabled]), select:not([disabled]), summary, [tabindex="0"]'
        )].filter(element => element.getClientRects().length);
        const first = focusable[0], last = focusable.at(-1);
        if (first && ((event.shiftKey && document.activeElement === first)
            || (!event.shiftKey && document.activeElement === last))) {
            event.preventDefault();
            (event.shiftKey ? last : first).focus();
        }
    }
    if (event.key === "Escape") {
        const open = Object.keys(panels).find(id => !panels[id].panel.hidden);
        if (open) closePanel(open);
        else if (!characterMenuPanel.hidden) closeCharacterMenu();
    }
});

boot();
for (const button of document.querySelectorAll("[data-save-action]")) {
    button.addEventListener("click", () => void saveAction(button.dataset.saveAction));
}
saveSlot.addEventListener('change',renderSlotSummary);
