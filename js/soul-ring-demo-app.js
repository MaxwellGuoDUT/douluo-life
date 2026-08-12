import {
    createSoulRingDemo,
    getCandidateWheels,
    SOUL_RING_DEMO_PHASES,
    SOUL_RING_DEMO_STATUS
} from "./soul-ring-demo.js";

const root = document.querySelector("#soulRingDemo");
const fields = {
    level: document.querySelector("#levelInput"),
    slot: document.querySelector("#slotInput"),
    begin: document.querySelector("#beginButton"),
    status: document.querySelector("#statusValue"),
    gameOver: document.querySelector("#gameOverValue"),
    slotValue: document.querySelector("#slotValue"),
    wheelValue: document.querySelector("#wheelValue"),
    candidateValue: document.querySelector("#candidateValue"),
    yearsValue: document.querySelector("#yearsValue"),
    rulesStatus: document.querySelector("#rulesStatusValue"),
    sourceStatus: document.querySelector("#sourceStatusValue"),
    terminal: document.querySelector("#terminalBox"),
    wheelSection: document.querySelector("#wheelSection"),
    wheel: document.querySelector("#wheelInput"),
    loadWheel: document.querySelector("#loadWheelButton"),
    weightedRoll: document.querySelector("#weightedRollButton"),
    wheelMeta: document.querySelector("#wheelMeta"),
    candidates: document.querySelector("#candidateItems"),
    yearSection: document.querySelector("#yearSection"),
    candidateRange: document.querySelector("#candidateRange"),
    years: document.querySelector("#yearsInput"),
    confirmYears: document.querySelector("#confirmYearsButton"),
    absorptionSection: document.querySelector("#absorptionSection"),
    success: document.querySelector("#successButton"),
    failure: document.querySelector("#failureButton"),
    history: document.querySelector("#historyValue"),
    warnings: document.querySelector("#warningsValue"),
    error: document.querySelector("#errorValue")
};

const state = {
    config: null,
    legacyData: null,
    demo: null,
    current: null
};

async function fetchJson(path) {
    const response = await fetch(path);
    if (!response.ok) {
        throw new Error(`加载 ${path} 失败：${response.status}`);
    }
    return response.json();
}

function setError(error) {
    fields.error.textContent = error instanceof Error
        ? `${error.code ? `[${error.code}] ` : ""}${error.message}`
        : String(error);
}

function clearError() {
    fields.error.textContent = "无";
}

function formatCandidateRange(candidate) {
    if (!candidate?.parsedYears || candidate.parsedYears.status !== "parsed") {
        return "旧版文本无法自动解析年限，请手动输入不低于10年的年限。";
    }

    const { minYears, maxYears, exactYears, rangeType } = candidate.parsedYears;
    if (exactYears !== null) {
        return `候选文本给出固定年限：${exactYears}年。`;
    }
    if (rangeType === "open_upper") {
        return `候选范围：${minYears}年以上；请手动输入年限。`;
    }
    return `候选范围：${minYears}–${maxYears}年；请手动输入范围内年限。`;
}

function resetSections() {
    fields.wheelSection.hidden = true;
    fields.yearSection.hidden = true;
    fields.absorptionSection.hidden = true;
    fields.terminal.hidden = true;
    fields.candidates.replaceChildren();
    fields.wheel.replaceChildren();
    fields.wheelMeta.textContent = "";
    fields.candidateRange.textContent = "";
    fields.years.value = "";
}

function renderWheels() {
    if (!state.demo || state.current?.phase !== SOUL_RING_DEMO_PHASES.WHEEL_SELECTION) {
        return;
    }

    const wheels = state.demo.listWheels();
    fields.wheel.replaceChildren();
    wheels.forEach(wheel => {
        const option = document.createElement("option");
        option.value = wheel.id;
        option.textContent = `旧版 Wheel ${wheel.legacyWheelId} · ${wheel.mode} · ${wheel.positiveWeightCount} 个正权重项`;
        fields.wheel.append(option);
    });

    fields.wheelSection.hidden = false;
    if (wheels.length === 0) {
        fields.wheelMeta.textContent = "当前魂环槽位没有可识别的旧版来源轮盘；该槽位在临时资料中保持未决。";
        fields.loadWheel.disabled = true;
        fields.weightedRoll.disabled = true;
    } else {
        fields.wheelMeta.textContent = "来源选择和候选选择均为手动；零权重项不参与选择，空权重项只能手动选择。";
        fields.loadWheel.disabled = false;
        fields.weightedRoll.disabled = false;
    }
}

function renderItems() {
    const current = state.current;
    if (!state.demo || !current?.selectedWheel) {
        return;
    }

    const items = state.demo.listItems();
    fields.candidates.replaceChildren();
    items.forEach(item => {
        const article = document.createElement("article");
        article.className = "item";
        const head = document.createElement("div");
        head.className = "item-head";
        const title = document.createElement("strong");
        title.textContent = `#${item.index} ${item.text}`;
        const weight = document.createElement("span");
        weight.className = "muted";
        weight.textContent = item.weight === null ? "权重：未定义" : `权重：${item.weight}`;
        head.append(title, weight);
        const detail = document.createElement("small");
        detail.textContent = item.weight === null
            ? "临时规则：只能手动选择；不把空权重猜成概率。"
            : `年限解析：${formatCandidateRange(item)}`;
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = "手动选择此项";
        button.addEventListener("click", () => {
            try {
                state.current = state.demo.chooseCandidate(item.index);
                render();
            } catch (error) {
                setError(error);
            }
        });
        article.append(head, detail, button);
        fields.candidates.append(article);
    });
}

function renderTerminal(current) {
    const isTerminal = current.phase === SOUL_RING_DEMO_PHASES.TERMINAL;
    fields.terminal.hidden = !isTerminal;
    if (!isTerminal) {
        fields.terminal.className = "terminal";
        fields.terminal.textContent = "";
        return;
    }

    fields.terminal.className = `terminal ${current.outcome === "success" ? "success" : current.outcome === "failure" ? "failure" : "ignored"}`;
    fields.terminal.textContent = current.message;
}

function render() {
    const current = state.current;
    if (!current) return;

    fields.status.textContent = current.status;
    fields.gameOver.textContent = current.gameOver ? "是" : "否";
    fields.slotValue.textContent = current.selectedSlot ? `第${current.selectedSlot}魂环` : "-";
    fields.wheelValue.textContent = current.selectedWheel
        ? `Wheel ${current.selectedWheel.legacyWheelId}`
        : "-";
    fields.candidateValue.textContent = current.selectedCandidate?.text ?? "-";
    fields.yearsValue.textContent = current.resolvedRing?.years ? `${current.resolvedRing.years}年` : "-";
    fields.rulesStatus.textContent = current.rulesStatus;
    fields.sourceStatus.textContent = current.sourceStatus;
    fields.history.textContent = JSON.stringify(current.history, null, 2);
    fields.warnings.textContent = JSON.stringify(current.warnings, null, 2);

    fields.begin.disabled = current.phase !== SOUL_RING_DEMO_PHASES.READY;
    fields.loadWheel.disabled = current.phase !== SOUL_RING_DEMO_PHASES.WHEEL_SELECTION;
    const selectedWheelSummary = current.selectedWheel
        ? state.demo.listWheels().find(wheel => wheel.id === current.selectedWheel.id)
        : null;
    fields.weightedRoll.disabled = current.phase !== SOUL_RING_DEMO_PHASES.CANDIDATE_SELECTION
        || selectedWheelSummary?.selectionMode !== "weighted_or_manual";
    fields.confirmYears.disabled = current.phase !== SOUL_RING_DEMO_PHASES.YEAR_INPUT;
    fields.success.disabled = current.phase !== SOUL_RING_DEMO_PHASES.ABSORPTION;
    fields.failure.disabled = current.phase !== SOUL_RING_DEMO_PHASES.ABSORPTION;

    if (current.phase === SOUL_RING_DEMO_PHASES.WHEEL_SELECTION) {
        renderWheels();
    }
    if (current.phase === SOUL_RING_DEMO_PHASES.CANDIDATE_SELECTION) {
        fields.wheelSection.hidden = false;
        renderItems();
    }
    if (current.phase === SOUL_RING_DEMO_PHASES.YEAR_INPUT) {
        fields.wheelSection.hidden = false;
        fields.yearSection.hidden = false;
        fields.candidateRange.textContent = formatCandidateRange(current.selectedCandidate);
        const exactYears = current.selectedCandidate?.parsedYears?.exactYears;
        if (exactYears !== null && exactYears !== undefined && fields.years.value === "") {
            fields.years.value = String(exactYears);
        }
    }
    if (current.phase === SOUL_RING_DEMO_PHASES.ABSORPTION) {
        fields.yearSection.hidden = false;
        fields.absorptionSection.hidden = false;
    }
    renderTerminal(current);
}

function initializeDemo() {
    state.demo = createSoulRingDemo({
        legacyData: state.legacyData,
        config: state.config,
        player: { level: 10, soulRings: [] },
        rng: Math.random
    });
    state.current = state.demo.getState();
    root.dataset.status = "ready";
    fields.begin.disabled = false;
    fields.begin.textContent = "开始手动魂环流程";
    render();
}

fields.begin.addEventListener("click", () => {
    clearError();
    try {
        state.demo = createSoulRingDemo({
            legacyData: state.legacyData,
            config: state.config,
            player: {
                level: Number(fields.level.value),
                soulRings: []
            },
            rng: Math.random
        });
        state.current = state.demo.getState();
        state.current = state.demo.begin({ slot: Number(fields.slot.value) });
        resetSections();
        render();
    } catch (error) {
        if (state.demo) {
            state.current = state.demo.getState();
            render();
        }
        setError(error);
    }
});

fields.loadWheel.addEventListener("click", () => {
    clearError();
    try {
        state.current = state.demo.selectWheel(fields.wheel.value);
        renderItems();
        render();
    } catch (error) {
        setError(error);
    }
});

fields.weightedRoll.addEventListener("click", () => {
    clearError();
    try {
        state.current = state.demo.drawWeightedCandidate();
        render();
    } catch (error) {
        setError(error);
    }
});

fields.confirmYears.addEventListener("click", () => {
    clearError();
    try {
        state.current = state.demo.confirmYears({ years: Number(fields.years.value) });
        render();
    } catch (error) {
        setError(error);
    }
});

fields.success.addEventListener("click", () => {
    clearError();
    try {
        state.current = state.demo.settleOutcome("success");
        render();
    } catch (error) {
        setError(error);
    }
});

fields.failure.addEventListener("click", () => {
    clearError();
    try {
        state.current = state.demo.settleOutcome("failure");
        render();
    } catch (error) {
        setError(error);
    }
});

Promise.all([
    fetchJson("data/reference/legacy-wheel/wheels.normalized.json"),
    fetchJson("data/config/soul-ring-demo.json")
]).then(([legacyData, config]) => {
    state.legacyData = legacyData;
    state.config = config;
    initializeDemo();
}).catch(error => {
    root.dataset.status = "error";
    setError(error);
    fields.begin.textContent = "加载失败";
    fields.begin.disabled = true;
});
