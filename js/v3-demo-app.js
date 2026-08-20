import {
    createV3Demo,
    V3_DEMO_PHASES
} from "./v3-demo.js";

const root = document.querySelector("#v3Demo");
const fields = {
    talentInput: document.querySelector("#talentInput"),
    advance: document.querySelector("#advanceButton"),
    spinWheel: document.querySelector("#spinWheel"),
    spinLabel: document.querySelector("#spinLabel"),
    currentEventTitle: document.querySelector("#currentEventTitle"),
    currentEventText: document.querySelector("#currentEventText"),
    currentEventDetails: document.querySelector("#currentEventDetails"),
    status: document.querySelector("#statusValue"),
    age: document.querySelector("#ageValue"),
    level: document.querySelector("#levelValue"),
    identity: document.querySelector("#identityValue"),
    talentValue: document.querySelector("#talentValue"),
    awakening: document.querySelector("#awakeningValue"),
    ringCount: document.querySelector("#ringCountValue"),
    boneCount: document.querySelector("#boneCountValue"),
    power: document.querySelector("#powerValue"),
    gameOver: document.querySelector("#gameOverValue"),
    terminal: document.querySelector("#terminalBox"),
    message: document.querySelector("#messageValue"),
    souls: document.querySelector("#soulsValue"),
    rings: document.querySelector("#ringsValue"),
    bones: document.querySelector("#bonesValue"),
    battle: document.querySelector("#battleValue"),
    history: document.querySelector("#historyValue"),
    warnings: document.querySelector("#warningsValue"),
    combat: document.querySelector("#combatValue"),
    rules: document.querySelector("#rulesValue"),
    error: document.querySelector("#errorValue")
};

const state = {
    config: null,
    talentConfig: null,
    combatRules: null,
    legacyData: null,
    demo: null,
    current: null,
    busy: false
};

async function fetchJson(path) {
    const response = await fetch(path);
    if (!response.ok) {
        throw new Error(`加载 ${path} 失败：${response.status}`);
    }
    return response.json();
}

function stringify(value) {
    return JSON.stringify(value, null, 2);
}

function setError(error) {
    fields.error.textContent = stringify({
        code: error?.code ?? "UNEXPECTED_ERROR",
        message: error?.message ?? String(error),
        details: error?.details ?? {}
    });
}

function clearError() {
    fields.error.textContent = "无";
}

function renderPills(target, entries, formatter) {
    target.replaceChildren();
    if (entries.length === 0) {
        const empty = document.createElement("span");
        empty.className = "muted";
        empty.textContent = "暂无";
        target.append(empty);
        return;
    }

    entries.forEach(entry => {
        const pill = document.createElement("span");
        pill.className = "pill";
        pill.textContent = formatter(entry);
        target.append(pill);
    });
}

function getAllRings(current) {
    const nested = (current.player.martialSouls ?? []).flatMap(soul => {
        return Array.isArray(soul.soulRings) ? soul.soulRings : [];
    });
    return nested.length > 0 ? nested : (current.player.soulRings ?? []);
}

function renderTerminal(current) {
    const terminal = current.phase === V3_DEMO_PHASES.TERMINAL;
    fields.terminal.hidden = !terminal;
    if (!terminal) {
        fields.terminal.textContent = "";
        return;
    }

    const className = current.outcome === "success"
        ? "success"
        : current.outcome === "failure"
            ? "failure"
            : "ignored";
    fields.terminal.className = `terminal ${className}`;
    fields.terminal.textContent = current.message;
}

function getAdvanceLabel(current) {
    if (current.phase === V3_DEMO_PHASES.READY) {
        return "抽取身份并推进到1岁";
    }
    if (current.phase === V3_DEMO_PHASES.TALENT_PENDING) {
        return current.age === 5
            ? "抽取天赋、武魂并推进到6岁"
            : `抽取并推进到${current.age + 1}岁`;
    }
    if (current.phase === V3_DEMO_PHASES.CULTIVATING) {
        return `修炼并推进到${current.age + 1}岁`;
    }
    return "游戏已结束";
}

function render(current) {
    if (!current) return;

    const rings = getAllRings(current);
    const event = current.currentEvent ?? {
        title: "等待开始",
        text: "点击抽取键开始0岁身份抽取。",
        details: {}
    };
    fields.currentEventTitle.textContent = event.title;
    fields.currentEventText.textContent = event.text;
    fields.currentEventDetails.textContent = stringify(event.details ?? {});

    fields.status.textContent = current.status;
    fields.age.textContent = `${current.age}岁`;
    fields.level.textContent = `${current.level}级`;
    fields.identity.textContent = current.identity
        ? `${current.identity.identityName}（${current.identity.identityId}）`
        : "未抽取";
    fields.talentValue.textContent = current.talent
        ? `${current.talent.innateSoulPower}级 / ${current.talent.talentGrade}`
        : "未抽取";
    fields.awakening.textContent = current.awakening
        ? `${current.awakening.martialSoulCount}个：${current.awakening.martialSoulNames.join("、")}`
        : "尚未觉醒";
    fields.ringCount.textContent = String(rings.length);
    fields.boneCount.textContent = String(current.player.soulBones.length);
    fields.power.textContent = String(current.combatPower?.staticCombatPower ?? 0);
    fields.gameOver.textContent = current.gameOver ? "是" : "否";
    fields.message.textContent = current.message;

    renderPills(
        fields.souls,
        current.player.martialSouls ?? [],
        soul => `槽位${soul.slot} · ${soul.legacyName ?? soul.definitionId} · ${soul.qualityGrade}`
    );
    renderPills(
        fields.rings,
        rings,
        ring => `第${ring.slot}魂环 · ${ring.years}年 · 旧Wheel ${ring.legacyWheelId}`
    );
    renderPills(
        fields.bones,
        current.player.soulBones,
        bone => `${bone.slot} · ${bone.years}年 · ${bone.name}`
    );
    fields.battle.textContent = current.battle
        ? stringify(current.battle)
        : "尚未到达100级。";
    fields.history.textContent = stringify(current.history);
    fields.warnings.textContent = stringify([
        ...current.warnings,
        ...(current.combatPower?.warnings ?? [])
    ]);
    fields.combat.textContent = current.combatPower
        ? stringify(current.combatPower)
        : "尚未计算";
    fields.rules.textContent = stringify({
        rulesStatus: current.rulesStatus,
        sourceStatus: current.sourceStatus,
        audit: current.rulesAudit,
        awakening: current.awakening
            ? {
                sourceStatus: current.awakening.sourceStatus,
                status: current.awakening.status,
                flowId: current.awakening.flowId,
                catalogVersion: current.awakening.catalogVersion,
                probabilityVersion: current.awakening.probabilityVersion
            }
            : null
    });

    fields.advance.disabled = state.busy
        || current.phase === V3_DEMO_PHASES.TERMINAL;
    fields.advance.textContent = state.busy
        ? "转盘转动中…"
        : getAdvanceLabel(current);
    renderTerminal(current);
}

function selectedTalentValue() {
    return fields.talentInput.value === "random"
        ? null
        : Number(fields.talentInput.value);
}

function wait(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function advanceWithAnimation() {
    if (state.busy || !state.demo || !state.current
        || state.current.phase === V3_DEMO_PHASES.TERMINAL) {
        return;
    }

    state.busy = true;
    clearError();
    fields.spinLabel.textContent = "时间推进中：转盘转动中…";
    fields.spinWheel.classList.remove("spinning");
    void fields.spinWheel.offsetWidth;
    fields.spinWheel.classList.add("spinning");
    render(state.current);

    try {
        await wait(state.config?.animation?.durationMs ?? 450);
        state.current = state.demo.advanceYear({
            innateSoulPower: selectedTalentValue()
        });
        fields.spinLabel.textContent = `本次抽取完成，当前${state.current.age}岁。`;
        render(state.current);
    } catch (error) {
        setError(error);
        fields.spinLabel.textContent = "本次抽取失败，状态未继续推进。";
    } finally {
        state.busy = false;
        render(state.current);
    }
}

fields.advance.addEventListener("click", advanceWithAnimation);

Promise.all([
    fetchJson("data/config/v3-demo.json"),
    fetchJson("data/config/talent.json"),
    fetchJson("data/config/combat-power.json"),
    fetchJson("data/reference/legacy-wheel/wheels.normalized.json"),
    fetchJson("data/v2/content/age-6-awakening.json"),
    fetchJson("data/v2/catalogs/martial-souls.json"),
    fetchJson("data/v2/config/awakening-probabilities.json")
]).then(([
    config,
    talentConfig,
    combatRules,
    legacyData,
    awakeningDataset,
    awakeningCatalog,
    awakeningProbabilityConfig
]) => {
    state.config = config;
    root.style.setProperty("--spin-duration", `${config.animation.durationMs}ms`);
    state.talentConfig = talentConfig;
    state.combatRules = combatRules;
    state.legacyData = legacyData;
    state.demo = createV3Demo({
        v3Config: config,
        talentConfig,
        combatRules,
        legacyData,
        awakeningData: {
            dataset: awakeningDataset,
            catalog: awakeningCatalog,
            probabilityConfig: awakeningProbabilityConfig
        },
        rng: Math.random
    });
    state.current = state.demo.getState();
    root.dataset.status = "ready";
    fields.advance.disabled = false;
    fields.spinLabel.textContent = "每次点击推进一年，并播放一次转盘动画。";
    render(state.current);
}).catch(error => {
    root.dataset.status = "error";
    setError(error);
    fields.advance.textContent = "加载失败";
    fields.advance.disabled = true;
});
