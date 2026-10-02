import { createV10ContentLoader } from "./v10-content-loader.js";
import { createV10LifeRunner } from "./v10-life-runner.js";
import { createV10SaveStore, MAX_SAVE_BYTES } from "./v10-save-store.js";
import { V10_GOD_TRIAL_STAGES } from "./v10-god-trial-runtime.js";

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
    "cultivation-label", "cultivation-value", "actual-age-value", "character-identity", "wheel-labels"
].map(id => [id, document.querySelector(`#${id}`)]));
const panels = {
    "character-menu-panel": { panel: characterMenuPanel, toggle: characterToggle },
    "history-panel": { panel: document.querySelector("#history-panel"), toggle: document.querySelector("#history-toggle") },
    "save-panel": { panel: document.querySelector("#save-panel"), toggle: document.querySelector("#save-toggle") }
};
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

function stopAuto() {
    autoRunning = false;
    autoEpoch += 1;
    gameFields["human-age"].textContent = "自动推进";
}

async function stopAutoAndWait() {
    stopAuto();
    if (autoTask) await autoTask;
}

async function toggleAuto() {
    if (autoRunning) { stopAuto(); return; }
    if (!lifeRunner || gameBusy || autoTask || ["completed", "boundary", "error"].includes(lifeRunner.phase)) return;
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
                if (["completed", "boundary", "error"].includes(lifeRunner.phase)) break;
                if (autoRunning && epoch === autoEpoch && steps < 200) {
                    await new Promise(resolve => setTimeout(resolve, 180));
                }
            }
        } finally {
            stopAuto();
            const failureMessage = failed ? gameFields["human-progress"].textContent : null;
            renderGame();
            if (failureMessage) gameFields["human-progress"].textContent = failureMessage;
            if (!failed && !["completed", "boundary", "error"].includes(lifeRunner.phase)) {
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
    packList.hidden = !visible;
    status.hidden = !visible;
    routeToggle.setAttribute("aria-expanded", String(visible));
    routeToggle.textContent = visible ? "收起路线" : "更换路线";
}

function togglePanel(id) {
    const { panel, toggle } = panels[id];
    if (!panel.hidden) return closePanel(id);
    stopAuto();
    for (const other of Object.keys(panels)) {
        if (other !== id && !panels[other].panel.hidden) closePanel(other, false);
    }
    panel.hidden = false;
    panel.showModal?.();
    toggle.setAttribute("aria-expanded", "true");
    if (id === "history-panel" && lifeRunner) renderHistory();
    panel.querySelector("[data-close-panel]").focus();
}

function renderHistory() {
    const history = lifeRunner.session.timeline
        .filter(entry => typeof entry.text === "string" && entry.text.trim())
        .map(entry => {
            const item = document.createElement("li");
            item.textContent = entry.text;
            return item;
        });
    gameFields["human-history"].replaceChildren(...history);
}

const ATTRIBUTE_NAMES = Object.freeze({
    fire: "火", water: "水", earth: "土", metal: "金", wood: "木",
    ice: "冰", wind: "风", lightning: "雷", light: "光", dark: "暗",
    life: "生命", death: "死亡", poison: "毒", space: "空间", time: "时间",
    strength: "力量", speed: "速度", defense: "防御", spirit: "精神",
    destruction: "毁灭", solar: "太阳", moon: "月亮", haze: "岚"
});

function entryName(value) {
    if (typeof value === "string") return value;
    return value?.name ?? value?.text ?? value?.title ?? value?.id ?? value?.optionId ?? "未命名";
}

function renderDetailList(id, entries) {
    const values = entries.length ? entries : ["暂无"];
    gameFields[id].replaceChildren(...values.map(value => {
        const item = document.createElement("li");
        item.textContent = value;
        return item;
    }));
}

function godTrialProgress(character, packId) {
    const trial = character.godTrial;
    if (!trial) return null;
    const status = { qualified: "待选择神位", active: "考核中", failed: "神考失败",
        completed: "考核完成", abandoned: "考核已结束" }[trial.status] ?? "考核状态待确认";
    if (packId === "douluo1" && trial.tier !== "二级") {
        return (trial.tier ?? "未知层级") + "考核 · " + status + " · 奖励流程未完整开放";
    }
    const claimed = trial.claimedRewardStages?.length ?? 0;
    const stage = trial.currentStage > 0 ? " · 第" + trial.currentStage + "考" : "";
    const requirement = packId === "douluo1" && trial.status === "active"
        ? V10_GOD_TRIAL_STAGES.find(item => item.stage === trial.currentStage) : null;
    const level = requirement ? " · 需" + requirement.minLevel + "级（当前" + character.level + "级）" : "";
    return (trial.tier ?? "") + "神考" + (trial.deityName ? " · " + trial.deityName : "")
        + " · " + status + " · 已领取" + claimed + "/" + (trial.totalStages ?? trial.total ?? "—") + "考奖励" + stage + level;
}

function characterAttributes(character) {
    return [...new Set([
        ...(character.attributes ?? []), ...(character.combatAttributes ?? []),
        ...Object.keys(character.elementProgress ?? {}),
        ...Object.keys(character.beast?.attributeStages ?? {})
    ].map(value => typeof value === "string" ? value : entryName(value)))];
}

function bloodlineTexts(character) {
    const beast = character.beast ?? character.beastOrigin;
    const lines = beast?.bloodlines ?? [];
    const components = beast?.bloodlineComponents ?? [];
    const beastLines = lines.map(line => {
        const selection = line.selection ?? line;
        const component = components.find(item => item.bloodlineId === selection.optionId);
        const percent = Number.isFinite(component?.ratioBasisPoints) ? component.ratioBasisPoints / 100 : line.percentage;
        return entryName(selection) + (Number.isFinite(percent) ? percent + "%" : "");
    });
    return [...new Set([...beastLines, ...(character.bloodlines ?? []).map(entryName)])];
}

function renderCharacterSummary(character, profile) {
    const isBeast = profile.route === "beast";
    const beast = character.beast ?? character.beastOrigin;
    const species = profile.species ?? beast?.species?.text;
    const name = character.name ?? (isBeast && species
        ? [...(beast?.namePrefixes ?? []), species, ...(beast?.nameSuffixes ?? [])].map(entryName).join("")
        : (character.martialSouls ?? []).map(entryName).join(" / "));
    gameFields["character-name"].textContent = name?.split(/[（(]/u)[0].trim() || (isBeast ? "魂兽本体未确定" : "武魂未确定");
    const lines = bloodlineTexts(character);
    gameFields["character-bloodline"].textContent = lines.join(" + ") || "暂无";
    gameFields["character-bloodline"].title = lines.join(" + ") || "暂无";
    gameFields["character-attributes"].replaceChildren(...(characterAttributes(character).length
        ? [...new Set(characterAttributes(character).map(attribute => ATTRIBUTE_NAMES[attribute] ?? attribute))] : ["暂无属性"]).map(attribute => {
            const tag = document.createElement("span");
            tag.textContent = ATTRIBUTE_NAMES[attribute] ?? attribute;
            return tag;
        }));
    const cultivation = isBeast ? character.beastYears : character.level;
    const age = character.age;
    gameFields["cultivation-label"].textContent = isBeast ? "修为年限" : "魂力修为";
    gameFields["cultivation-value"].textContent = Number.isFinite(cultivation)
        ? cultivation.toLocaleString("zh-CN") + (isBeast ? " 年" : " 级") : "未确定";
    gameFields["actual-age-value"].textContent = Number.isFinite(age) ? age.toLocaleString("zh-CN") + " 岁" : "未确定";
    renderDetailList("character-identity", [
        "名称：" + (name || gameFields["character-name"].textContent),
        "血脉：" + (lines.join(" + ") || "暂无"),
        "修为：" + gameFields["cultivation-value"].textContent,
        "实际年龄：" + gameFields["actual-age-value"].textContent,
        "性别：" + (character.gender ? entryName(character.gender) : "未确定"),
        "时代：" + (beast?.period ? entryName(beast.period) : character.entrySelections?.period ? entryName(character.entrySelections.period) : "未确定"),
        "时间线：" + (character.entrySelections?.worldLine ? entryName(character.entrySelections.worldLine) : "未确定"),
        "容貌：" + (character.appearance ? entryName(character.appearance) : "未确定"),
        "初始魂力：" + (Number.isFinite(character.innateSoulPower) ? character.innateSoulPower + "级" : "未确定"),
        "初始势力：" + (character.faction ? entryName(character.faction) : "未确定"),
        "栖息地：" + (beast?.area ? entryName(beast.area) : "未确定")
    ]);
}

function renderCharacterDetails(character, packId) {
    const martialSouls = character.martialSouls ?? [];
    renderDetailList("human-martial-souls", martialSouls.map(soul => {
        const rings = soul.rings ?? [];
        const years = rings.map(ring => Number.isFinite(ring?.years) ? `${ring.years}年` : entryName(ring));
        return `${entryName(soul)} · ${rings.length}环${years.length ? `（${years.join("、")}）` : ""}`;
    }));
    renderDetailList("human-soul-bones", (character.soulBones ?? []).map(bone =>
        `${entryName(bone)}${Number.isFinite(bone?.years) ? ` · ${bone.years}年` : ""}`));
    const progress = character.elementProgress ?? {};
    const beastProgress = character.beast?.attributeStages ?? {};
    const attributes = characterAttributes(character);
    gameFields["human-ability-counts"].textContent = `${(character.soulBones ?? []).length} / ${attributes.length} / ${(character.domains ?? []).length}`;
    renderDetailList("human-attributes", attributes.map(attribute => {
        const id = typeof attribute === "string" ? attribute : entryName(attribute);
        const name = ATTRIBUTE_NAMES[id] ? `${ATTRIBUTE_NAMES[id]}（${id}）` : id;
        const stage = progress[id] ?? beastProgress[id];
        return `${name}${Number.isFinite(stage) && stage > 0 ? ` · 进度 ${stage}` : ""}`;
    }));
    renderDetailList("human-domains", (character.domains ?? []).map(entryName));
    renderDetailList("human-bloodlines", bloodlineTexts(character));
    renderDetailList("human-talents", [
        ...(character.talents ?? []).map(talent => `天赋：${entryName(talent)}`),
        ...(character.martialSoulTalents ?? []).map(talent => `武魂天赋：${entryName(talent)}`),
        ...(character.traits ?? []).map(trait => `特质：${entryName(trait)}`)
    ]);
    renderDetailList("human-skills", [
        ...(character.skills ?? []).map(skill => `技能：${entryName(skill)}${Number.isFinite(skill?.level) ? ` · ${skill.level}级` : ""}`),
        ...(character.artifacts ?? []).map(artifact => `神器：${entryName(artifact)}${Number.isFinite(artifact?.rank) ? ` · 阶${artifact.rank}` : ""}`)
    ]);
    const godhoods = character.godhoods?.length ? character.godhoods : character.godhood ? [character.godhood] : [];
    const trialText = godTrialProgress(character, packId);
    const boneParts = { head: "头骨", torso: "躯干骨", leftArm: "左臂骨", rightArm: "右臂骨", leftLeg: "左腿骨", rightLeg: "右腿骨" };
    const acquiredParts = new Set((character.soulBones ?? []).map(bone => bone.partId ?? bone.part));
    const missing = Object.entries(boneParts).filter(([part]) => !acquiredParts.has(part)).map(([,name]) => name);
    const boneRequirement = packId === "douluo1" && character.godTrial?.tier === "二级"
        && ["qualified", "active"].includes(character.godTrial.status)
        ? "神考继承需要六个部位魂骨：" + (missing.length ? "还缺" + missing.join("、") : "已齐全，仍须完成考核") : null;
    renderDetailList("human-godhood", [
        ...(trialText ? [trialText] : []),
        ...(boneRequirement ? [boneRequirement] : []),
        ...godhoods.map(godhood => `神位：${entryName(godhood)}${godhood.tier ? ` · ${godhood.tier}` : ""}`),
        ...(character.titles ?? []).map(title => `称号：${entryName(title)}`)
    ]);
}

function renderWheel(view) {
    const disc = gameFields["human-wheel"];
    const segments = Array.isArray(view?.segments) ? view.segments : [];
    const colors = ["#285976", "#8c4051", "#2d7067", "#79517f", "#94633c", "#3e694a", "#356379", "#9a4c34", "#535383", "#68804a", "#977331", "#416c73"];
    disc.style.background = segments.length
        ? `conic-gradient(${segments.map((segment, index) => `${colors[index % colors.length]} ${segment.startAngle}deg ${segment.endAngle}deg`).join(", ")})`
        : "#e8eef1";
    disc.className = `life-wheel ${segments.length ? "has-options" : "is-quiet"}`;
    disc.setAttribute("aria-label", segments.length
        ? `${view.title}，${segments.length}个可选扇区，总权重${view.totalWeight}`
        : view?.message ?? view?.title ?? "等待开始");
    gameFields["human-wheel-title"].textContent = view?.title ?? "等待开始";
    gameFields["wheel-labels"].replaceChildren(...segments.map(segment => {
        const label = document.createElement("span");
        label.className = "wheel-label";
        label.dataset.optionId = segment.optionId;
        const fullText = segment.fullText ?? segment.text ?? segment.optionId;
        const chars = [...fullText];
        label.textContent = chars.length > 13 ? chars.slice(0, 12).join("") + "…" : fullText;
        const midpoint = segment.midpoint ?? (segment.startAngle + segment.endAngle) / 2;
        label.style.transform = "rotate(" + (midpoint - 90) + "deg) translateY(-50%)";
        const arc = segment.endAngle - segment.startAngle;
        // Tiny sectors keep their full, accessible text in the list.
        if (arc < 4) label.hidden = true;
        if (arc < 10) label.style.fontSize = "10px";
        return label;
    }));
    gameFields["human-wheel-note"].textContent = view?.status === "dynamic"
        ? `${view.message} 当前流程：${view.flowId ?? "未确定"}`
        : view?.status === "completed" ? "人生已完成，转盘锁定。"
            : ["boundary", "error"].includes(view?.status) ? "运行时已停止；请查看下方错误。"
                : segments.length ? `下一可选转盘 · ${view.poolId ?? "未确定池"} · 总权重 ${view.totalWeight}`
                    : "下一可选转盘将在开局后显示。";
    gameFields["human-options"].replaceChildren(...segments.map(segment => {
        const item = document.createElement("li");
        item.textContent = `${segment.fullText ?? segment.text ?? segment.optionId} · 权重 ${segment.weight} · ${segment.percentage.toFixed(2)}%`;
        return item;
    }));
}

async function animateCommittedSpin(view) {
    const selected = view?.segments?.find(segment => segment.optionId === view.selectedOptionId);
    if (!selected) return;
    renderWheel(view);
    const disc = gameFields["human-wheel"];
    disc.style.setProperty("--landing-rotation", `${720 + 360 - selected.midpoint}deg`);
    disc.className = "life-wheel has-options is-spinning";
    await new Promise(resolve => setTimeout(resolve, 720));
    disc.style.removeProperty("--landing-rotation");
}

function setGameBusy(value, message = null) {
    gameBusy = value;
    for (const id of ["human-restart", "human-new", "human-step", "human-age", "human-terminal"]) {
        gameFields[id].disabled = (!lifeRunner && id !== "human-new")
            || (value && !(autoRunning && ["human-age", "human-new", "human-restart"].includes(id)));
    }
    gameFields["human-reroll"].disabled = !undoCheckpoint || (value && !autoRunning);
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
    await stopAutoAndWait();
    if (gameBusy) return;
    if (!saveSlot.value) {
        await refreshSlots();
        if (gameBusy) return;
    }
    const slot = Number(saveSlot.value);
    setGameBusy(true);
    saveStatus.textContent = "正在校验存档…";
    try {
        if (action === "load") {
            const restored = await saves.read(slot);
            lifeRunner = restored;
            undoCheckpoint = null;
            const snapshot = restored.exportSnapshot();
            activePack = snapshot.packId;
            activeRoute = snapshot.route;
            gameFields["human-seed"].value = snapshot.seed;
            manualSeed = true;
            game.hidden = false;
            setRouteChoicesVisible(false);
            saveStatus.textContent = `已读取${slot}号槽；${restored.phase === "completed" ? "人生已结束。" : "可继续当前人生。"}`;
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
    const routeText = profile.route === "transformed" ? "化形后人类" : profile.route === "beast" ? "魂兽" : "人类";
    gameFields["game-route-label"].textContent = `${session.packId} · ${routeText}`;
    gameFields["human-route-value"].textContent = `${session.packId} / ${routeText}`;
    gameFields["game-title"].textContent = isBeast
        ? "魂兽人生"
        : profile.route === "transformed"
            ? "化形后人类生命周期"
            : "人类人生";
    gameFields["current-seed"].textContent = gameFields["human-seed"].value;
    renderCharacterSummary(session.character, profile);
    gameFields["human-age-label"].textContent = "实际年龄";
    gameFields["human-age-value"].textContent = Number.isFinite(session.character.age) ? session.character.age + "岁" : "未确定";
    gameFields["human-level-value"].textContent = String(profile.level ?? "—");
    gameFields["human-species-value"].textContent = profile.species ?? "未确定";
    const completed = lifeRunner.phase === "completed";
    const wheel = completed ? null : lifeRunner.wheelView;
    const trialText = godTrialProgress(session.character, session.packId);
    gameFields["human-stage-value"].textContent = completed ? "人生结局"
        : trialText ?? (session.character.flags?.["formal:d1-story:free-mode"] ? "自由修炼" : wheel?.title ?? "人生成长");
    gameFields["human-cursor-value"].textContent = `${session.random.cursor} / ${session.history.length}`;
    renderCharacterDetails(session.character, session.packId);
    const resultText = (completed
        ? lifeRunner.summary?.ending?.text ?? lifeRunner.lastWheelResult?.recentResult?.text
        : wheel?.recentResult?.text)
        ?? lifeRunner.lastResult?.spin?.option?.normalized?.text ?? session.history.at(-1)?.text;
    gameFields["human-result"].textContent = completed
        ? `人生结局：${resultText ?? lifeRunner.summary?.ending?.title ?? "旅程结束"}`
        : resultText ? `已抽取：${resultText}` : "等待抽取";
    if (!completed && session.character.flags?.["formal:deferred-ending:douluo1:story:independent-ascension"] === true) {
        gameFields["human-result"].textContent += " 已抽到过飞升选项，但尚未形成飞升结局：当前规则在150岁前只记录该选择，后续仍须满足条件并实际结算。";
    }
    renderWheel(completed ? { status: "completed", title: "人生结局", segments: [] } : wheel);
    if (!panels["history-panel"].panel.hidden) renderHistory();
    gameFields["human-ending"].hidden = !completed;
    if (completed) {
        const ending = lifeRunner.summary.ending;
        const progress = lifeRunner.summary.route === "beast"
            ? `修为年限${lifeRunner.session.character.beastYears}年 · 实际年龄${Number.isFinite(session.character.age) ? session.character.age + "岁" : "未确定"}`
            : `${lifeRunner.summary.age}岁`;
        const detail = [ending?.text, ["death", "success"].includes(ending?.kind) ? resultText : null, ending?.cause]
            .find(value => typeof value === "string" && value.trim());
        gameFields["human-ending-text"].textContent = `${ending?.title ?? "人生结局"} · ${progress} · 等级${lifeRunner.summary.level} · ${lifeRunner.summary.history}次选择${detail ? ` · ${detail}` : ""}`;
    }
    const blocked = ["completed", "boundary", "error"].includes(lifeRunner.phase);
    gameFields["human-step"].disabled = gameBusy || autoRunning || blocked;
    gameFields["human-age"].disabled = (gameBusy && !autoRunning) || blocked;
    gameFields["human-terminal"].disabled = gameBusy || autoRunning || blocked;
    gameFields["human-restart"].disabled = gameBusy && !autoRunning;
    gameFields["human-new"].disabled = gameBusy && !autoRunning;
    gameFields["human-reroll"].disabled = !undoCheckpoint || (gameBusy && !autoRunning);
    gameFields["human-seed"].disabled = gameBusy;
    gameFields["human-progress"].textContent = completed
        ? "人生已结束，可保存或导出这段旅程。"
        : ["boundary", "error"].includes(lifeRunner.phase)
            ? `${lifeRunner.error.code}：${lifeRunner.error.message}${lifeRunner.error.details?.poolId ? ` · 源池 ${lifeRunner.error.details.poolId}` : ""}${lifeRunner.error.details?.flowId ? ` · 流程 ${lifeRunner.error.details.flowId}` : ""}`
            : `运行中 · ${isBeast ? `${profile.beastYears}年` : `${profile.age}岁`} · ${gameFields["human-stage-value"].textContent}`;
}

function clearLifeView(route = null, packId = null) {
    undoCheckpoint = null;
    gameFields["human-reroll"].disabled = true;
    gameFields["human-result"].textContent = "等待抽取";
    renderWheel(null);
    gameFields["human-history"].replaceChildren();
    gameFields["human-ending"].hidden = true;
    gameFields["human-ending-text"].textContent = "";
    gameFields["game-route-label"].textContent = packId ? `${packId} · ${route}` : "尚未开始";
    for (const id of ["human-age-value", "human-level-value", "human-route-value", "human-stage-value", "human-cursor-value"]) gameFields[id].textContent = "—";
    gameFields["human-species-value"].textContent = "未确定";
    renderCharacterSummary({}, { route });
    renderCharacterDetails({});
    gameFields["human-ability-counts"].textContent = "0 / 0 / 0";
    gameFields["human-progress"].textContent = "等待开始";
}

async function newFate() {
    await stopAutoAndWait();
    if (gameBusy) return;
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
    setStatus("请选择斗罗一 / 斗罗二，以及人类 / 魂兽，重新开始命运。", "ready");
    packList.querySelector("[data-start-route]")?.focus();
    packList.scrollIntoView({ block: "start" });
}

async function startLife(route = activeRoute, packId = activePack, { replay = false, fresh = false } = {}) {
    await stopAutoAndWait();
    if (gameBusy) return;
    activeRoute = route;
    activePack = packId;
    lifeRunner = null;
    clearLifeView(route, packId);
    game.hidden = false;
    setGameBusy(true, `正在载入${packId === "douluo2" ? "绝世唐门" : "斗罗一"}${route === "beast" ? "魂兽" : "人类"}内容…`);
    try {
        const seed = fresh || (!replay && !manualSeed) || !gameFields["human-seed"].value.trim()
            ? globalThis.crypto.randomUUID()
            : gameFields["human-seed"].value.trim();
        gameFields["human-seed"].value = seed;
        if (fresh) manualSeed = false;
        lifeRunner = await runner.start(packId, {
            seed,
            route
        });
        for (const id of Object.keys(panels)) if (!panels[id].panel.hidden) closePanel(id, false);
        setRouteChoicesVisible(false);
        renderGame();
        game.scrollIntoView({ block: "start" });
    } catch (error) {
        gameFields["human-progress"].textContent = `${error.code ?? "START_FAILED"}：${error.message}`;
    } finally {
        setGameBusy(false);
        renderGame();
    }
}

async function runLife(action, label, automatic = false) {
    if (!lifeRunner || gameBusy || (autoRunning && !automatic)
        || ["completed", "boundary", "error"].includes(lifeRunner.phase)) return;
    setGameBusy(true, label);
    let batchResult = null;
    let failure = null;
    try {
        if (action === "step") {
            const before = lifeRunner.exportSnapshot();
            const result = lifeRunner.step();
            if (result.committed) {
                undoCheckpoint = { snapshot: before, nextCursor: lifeRunner.session.random.cursor };
                gameFields["human-reroll"].disabled = !automatic;
            }
            if (lifeRunner.phase === "completed") {
                renderGame();
            } else if (result.committed && lifeRunner.lastWheelResult) {
                gameFields["human-result"].textContent = `已抽取：${lifeRunner.lastWheelResult.recentResult?.text ?? result.spin?.optionId ?? "结果已提交"}`;
                await animateCommittedSpin(lifeRunner.lastWheelResult);
            }
        } else {
            let before = lifeRunner.exportSnapshot();
            batchResult = await lifeRunner[action]({
                ...(action === "runToTerminal" ? { maxSteps: 200 } : {}),
                onStep(result, step) {
                    if (result.committed) {
                        undoCheckpoint = { snapshot: before, nextCursor: lifeRunner.session.random.cursor };
                        before = lifeRunner.exportSnapshot();
                    }
                    if (step % 25 === 0) renderGame();
                },
                yieldStep: () => new Promise(resolve => setTimeout(resolve, 0))
            });
        }
    } catch (error) {
        stopAuto();
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
        undoCheckpoint = { snapshot, nextCursor: candidate.session.random.cursor };
        renderGame();
        if (candidate.phase !== "completed" && candidate.lastWheelResult) {
            await animateCommittedSpin(candidate.lastWheelResult);
        }
    } catch (error) {
        failure = (error.code ?? "REROLL_FAILED") + "：" + error.message;
    } finally {
        setGameBusy(false);
        renderGame();
        if (failure) gameFields["human-progress"].textContent = failure;
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

gameFields["human-seed"].addEventListener("input", () => { manualSeed = Boolean(gameFields["human-seed"].value.trim()); });
gameFields["human-restart"].addEventListener("click", () => { if (lifeRunner) void startLife(activeRoute, activePack, { replay: true }); });
gameFields["human-new"].addEventListener("click", () => newFate());
gameFields["human-reroll"].addEventListener("click", () => rerollLast());
gameFields["human-step"].addEventListener("click", () => void runLife("step", "正在提交一次选择…"));
gameFields["human-age"].addEventListener("click", () => void toggleAuto());
gameFields["human-terminal"].addEventListener("click", () => void runLife("runToTerminal", "正在连续推进…"));
routeToggle.addEventListener("click", () => {
    stopAuto();
    if (!characterMenuPanel.hidden) closeCharacterMenu(false);
    const visible = packList.hidden;
    setRouteChoicesVisible(visible);
    if (visible) packList.scrollIntoView({ block: "start" });
});
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
document.addEventListener("visibilitychange", () => { if (document.hidden) stopAuto(); });
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
void refreshSlots();
