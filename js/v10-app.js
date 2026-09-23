import { createV10ContentLoader } from "./v10-content-loader.js";
import { createV10LifeRunner } from "./v10-life-runner.js";
import { createV10SaveStore, MAX_SAVE_BYTES } from "./v10-save-store.js";

const loader = createV10ContentLoader();
const runner = createV10LifeRunner({ contentLoader: loader });
const saves = createV10SaveStore({ contentLoader: loader, runner });
const saveSlot = document.querySelector("#save-slot");
const saveStatus = document.querySelector("#save-status");
const saveFile = document.querySelector("#save-file");
const packList = document.querySelector("#pack-list");
const status = document.querySelector("#v10-status");
const game = document.querySelector("#human-game");
const gameFields = Object.fromEntries([
    "human-seed", "human-restart", "human-step", "human-age", "human-terminal",
    "human-progress", "human-age-value", "human-level-value", "human-stage-value",
    "human-cursor-value", "human-result", "human-options", "human-ending",
    "human-ending-text", "game-route-label", "game-title", "human-age-label",
    "human-species-value"
].map(id => [id, document.querySelector(`#${id}`)]));
let lifeRunner = null;
let gameBusy = false;
let activeRoute = "human";
let activePack = "douluo1";

function setStatus(message, tone = "info") {
    status.textContent = message;
    status.dataset.tone = tone;
}

function setGameBusy(value, message = null) {
    gameBusy = value;
    for (const id of ["human-restart", "human-step", "human-age", "human-terminal"]) {
        gameFields[id].disabled = value;
    }
    gameFields["human-seed"].disabled = value;
    for (const button of document.querySelectorAll("[data-start-route]")) button.disabled = value;
    for (const control of document.querySelectorAll("#save-panel button, #save-panel input, #save-panel select")) control.disabled = value;
    if (message) gameFields["human-progress"].textContent = message;
}

async function refreshSlots() {
    const selected = saveSlot.value;
    const slots = await saves.list();
    saveSlot.replaceChildren(...slots.map(({ slot, summary }) => {
        const option = document.createElement("option");
        option.value = String(slot);
        option.textContent = `${slot}号 · ${summary}`;
        return option;
    }));
    if (selected) saveSlot.value = selected;
}

async function saveAction(action) {
    if (gameBusy) return;
    const slot = Number(saveSlot.value);
    setGameBusy(true);
    saveStatus.textContent = "正在校验存档…";
    try {
        if (action === "load") {
            const restored = await saves.read(slot);
            lifeRunner = restored;
            const snapshot = restored.exportSnapshot();
            activePack = snapshot.packId;
            activeRoute = snapshot.route;
            gameFields["human-seed"].value = snapshot.seed;
            game.hidden = false;
            saveStatus.textContent = `已读取${slot}号槽；可继续当前人生。`;
        } else if (action === "export") {
            const text = await saves.exportSlot(slot);
            const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
            const link = document.createElement("a");
            link.href = url;
            link.download = `douluo-life-slot-${slot}.json`;
            link.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            saveStatus.textContent = `已导出${slot}号槽。`;
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
            await saves.write(slot, text, { expected, overwrite: expected !== null });
            saveStatus.textContent = `已${action === "import" ? "导入" : "保存"}到${slot}号槽。`;
        }
    } catch (error) {
        saveStatus.textContent = `${error.code ?? "SAVE_FAILED"}：${error.message}`;
    } finally {
        await refreshSlots();
        setGameBusy(false);
        renderGame();
    }
}

function renderGame() {
    if (!lifeRunner) return;
    const profile = lifeRunner.characterProfile;
    const session = lifeRunner.session;
    const isBeast = profile.route === "beast";
    gameFields["game-route-label"].textContent = `${session.packId} · ${profile.route}`;
    gameFields["game-title"].textContent = isBeast
        ? "完整魂兽生命周期"
        : profile.route === "transformed"
            ? "化形后人类生命周期"
            : "完整人类生命周期";
    gameFields["human-age-label"].textContent = isBeast ? "魂兽年限" : "年龄";
    gameFields["human-age-value"].textContent = String(
        isBeast ? profile.beastYears : profile.age ?? "—"
    );
    gameFields["human-level-value"].textContent = String(profile.level ?? "—");
    gameFields["human-species-value"].textContent = profile.species ?? "—";
    gameFields["human-stage-value"].textContent = profile.stage ?? "人生结局";
    gameFields["human-cursor-value"].textContent = `${session.random.cursor} / ${session.history.length}`;
    const last = lifeRunner.lastResult;
    if (last?.spin?.option?.normalized) {
        const option = last.spin.option.normalized;
        gameFields["human-result"].textContent = `最近结果：${option.text ?? option.option_id}`;
    } else {
        gameFields["human-result"].textContent = "尚未转动。";
    }
    const completed = lifeRunner.phase === "completed";
    const wheel = completed ? null : lifeRunner.wheelView;
    const segments = Array.isArray(wheel?.segments) ? wheel.segments : [];
    const options = segments.map(segment => {
        const item = document.createElement("li");
        item.textContent = `${segment.label ?? segment.text ?? segment.optionId} · ${segment.weight}`;
        return item;
    });
    gameFields["human-options"].replaceChildren(...options);
    gameFields["human-ending"].hidden = !completed;
    if (completed) {
        const ending = lifeRunner.summary.ending;
        const progress = lifeRunner.summary.route === "beast"
            ? `${lifeRunner.session.character.beastYears}年`
            : `${lifeRunner.summary.age}岁`;
        gameFields["human-ending-text"].textContent = `${ending?.title ?? "人生结局"} · ${progress} · 等级${lifeRunner.summary.level} · ${lifeRunner.summary.history}次选择`;
    }
    const blocked = ["completed", "boundary", "error"].includes(lifeRunner.phase);
    gameFields["human-step"].disabled = gameBusy || blocked;
    gameFields["human-age"].disabled = gameBusy || blocked;
    gameFields["human-terminal"].disabled = gameBusy || blocked;
    gameFields["human-restart"].disabled = gameBusy;
    gameFields["human-seed"].disabled = gameBusy;
    gameFields["human-progress"].textContent = completed
        ? "人生已结束，可保存或导出这段旅程。"
        : ["boundary", "error"].includes(lifeRunner.phase)
            ? `${lifeRunner.error.code}：${lifeRunner.error.message}`
            : `运行中 · ${isBeast ? `${profile.beastYears}年` : `${profile.age}岁`} · ${profile.stage}`;
}

async function startLife(route = activeRoute, packId = activePack) {
    if (gameBusy) return;
    activeRoute = route;
    activePack = packId;
    lifeRunner = null;
    gameFields["human-result"].textContent = "尚未转动。";
    gameFields["human-options"].replaceChildren();
    gameFields["human-ending"].hidden = true;
    gameFields["human-ending-text"].textContent = "";
    gameFields["game-route-label"].textContent = `${packId} · ${route}`;
    for (const id of ["human-age-value", "human-level-value", "human-species-value", "human-stage-value", "human-cursor-value"]) gameFields[id].textContent = "—";
    game.hidden = false;
    setGameBusy(true, `正在载入${packId === "douluo2" ? "绝世唐门" : "斗罗一"}${route === "beast" ? "魂兽" : "人类"}内容…`);
    try {
        lifeRunner = await runner.start(packId, {
            seed: gameFields["human-seed"].value,
            route
        });
        renderGame();
        game.scrollIntoView({ block: "start" });
    } catch (error) {
        gameFields["human-progress"].textContent = `${error.code ?? "START_FAILED"}：${error.message}`;
    } finally {
        setGameBusy(false);
        renderGame();
    }
}

async function runLife(action, label) {
    if (!lifeRunner || gameBusy) return;
    setGameBusy(true, label);
    try {
        if (action === "step") {
            lifeRunner.step();
        } else {
            await lifeRunner[action]({
                onStep(_result, step) {
                    if (step % 25 === 0) renderGame();
                },
                yieldStep: () => new Promise(resolve => setTimeout(resolve, 0))
            });
        }
    } finally {
        setGameBusy(false);
        renderGame();
    }
}

function packCard(pack) {
    const article = document.createElement("article");
    article.className = "pack-card";
    const routes = pack.supportedRoutes.join(" / ");
    article.innerHTML = `
        <p class="eyebrow">${pack.id}</p>
        <h2>${pack.title}</h2>
        <p class="route-label">路线：${routes}</p>
        <dl class="inventory-grid">
            <div><dt>流程</dt><dd>${pack.summary.flows}</dd></div>
            <div><dt>事件池</dt><dd>${pack.summary.pools}</dd></div>
            <div><dt>选项</dt><dd>${pack.summary.options}</dd></div>
            <div><dt>动态处理</dt><dd>${pack.summary.actions + pack.summary.resolvers + pack.summary.customHandlers}</dd></div>
        </dl>
        <div class="card-actions"></div>
        <p class="pack-detail" hidden></p>
    `;
    const actions = article.querySelector(".card-actions");
    if (pack.sourceRuntimeModule) {
        for (const [route, label] of [["human", "开始人类人生"], ["beast", "开始魂兽人生"]]) {
            if (!pack.supportedRoutes.includes(route)) continue;
            const start = document.createElement("button");
            start.type = "button";
            start.className = route === "human" ? "primary-action" : "secondary-action";
            start.textContent = label;
            start.dataset.startRoute = route;
            start.addEventListener("click", () => void startLife(route, pack.id));
            actions.append(start);
        }
    } else {
        const pending = document.createElement("button");
        pending.type = "button";
        pending.className = "primary-action";
        pending.textContent = "运行时待接入";
        pending.disabled = true;
        actions.append(pending);
    }
    const inspect = document.createElement("button");
    inspect.type = "button";
    inspect.className = "secondary-action";
    inspect.textContent = "查看源清单";
    inspect.addEventListener("click", async () => {
        inspect.disabled = true;
        try {
            const { dynamicInventory, terminalInventory } = await loader.getPackDetails(pack.id);
            const detail = article.querySelector(".pack-detail");
            detail.textContent = `动作 ${dynamicInventory.summary.actions} · 解析器 ${dynamicInventory.summary.resolvers} · 自定义处理 ${dynamicInventory.summary.customHandlers} · 明示终局效果 ${terminalInventory.explicitCount}`;
            detail.hidden = false;
            inspect.textContent = "源清单已载入";
        } catch (error) {
            setStatus(error.message, "error");
            inspect.disabled = false;
        }
    });
    actions.append(inspect);
    return article;
}

async function boot() {
    try {
        const manifest = await loader.getManifest();
        packList.replaceChildren(...manifest.packs.map(packCard));
        setStatus("双包内容已就绪，可选择人类或魂兽人生。", "ready");
    } catch (error) {
        setStatus(`LOAD_FAILED：${error.message}`, "error");
    }
}

gameFields["human-restart"].addEventListener("click", () => void startLife());
gameFields["human-step"].addEventListener("click", () => void runLife("step", "正在提交一次选择…"));
gameFields["human-age"].addEventListener("click", () => void runLife("advanceToNextAge", "正在推进至下一阶段…"));
gameFields["human-terminal"].addEventListener("click", () => void runLife("runToTerminal", "正在推进至人生结局…"));

boot();
for (const button of document.querySelectorAll("[data-save-action]")) {
    button.addEventListener("click", () => void saveAction(button.dataset.saveAction));
}
void refreshSlots();
