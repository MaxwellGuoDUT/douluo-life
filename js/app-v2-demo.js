import { V2DemoUI } from "./ui-v2-demo.js";
import {
    V2ProductionPlaytest,
    V2_PRODUCTION_PLAYTEST_STATUS
} from "./v2-production-playtest.js";

const ui = new V2DemoUI();
const state = { playtest: null, busy: false };

async function fetchJson(path) {
    const response = await fetch(path);
    if (!response.ok) {
        throw new Error(`Failed to load ${path}: ${response.status}`);
    }
    return response.json();
}

async function initialize() {
    const [dataset, catalog, probabilityConfig, combatPowerRules] = await Promise.all([
        fetchJson("data/v2/content/age-6-awakening.json"),
        fetchJson("data/v2/catalogs/martial-souls.json"),
        fetchJson("data/v2/config/awakening-probabilities.json"),
        fetchJson("data/config/combat-power.json")
    ]);
    state.playtest = new V2ProductionPlaytest({
        dataset,
        catalog,
        probabilityConfig,
        combatPowerRules,
        rng: Math.random
    });
    ui.renderInitial(state.playtest.getState());
    ui.setButton("开始 6 岁武魂觉醒", false);
}

function createExecutionIdentity(player) {
    const nonce = globalThis.crypto?.randomUUID?.()
        ?? `${Date.now()}_${Math.random().toString(36).slice(2)}`;

    return {
        sessionId: `v2_production_age_${String(player.age).padStart(3, "0")}_${nonce}`,
        seed: `v2_production_seed_${nonce}`
    };
}

function waitForNextFrame() {
    return new Promise(resolve => requestAnimationFrame(() => resolve()));
}

async function advanceYear() {
    if (state.busy || !state.playtest) return;

    const before = state.playtest.getState();
    if (before.status === V2_PRODUCTION_PLAYTEST_STATUS.CONTENT_BOUNDARY) {
        ui.renderResult(before);
        ui.setButton("当前 production 内容已结束", true);
        return;
    }

    state.busy = true;
    let failed = false;
    ui.renderBusy();
    ui.setButton("年度执行中…", true);

    try {
        await waitForNextFrame();
        const identity = createExecutionIdentity(before.player);
        const result = state.playtest.runYear({
            ...identity,
            rng: Math.random
        });
        ui.renderResult(result);
    } catch (error) {
        failed = true;
        console.error("V2 production annual execution failed", error);
        ui.renderPlayer(state.playtest.getState().player);
        ui.renderError(error);
    } finally {
        state.busy = false;
        const current = state.playtest.getState();

        if (current.status === V2_PRODUCTION_PLAYTEST_STATUS.CONTENT_BOUNDARY) {
            ui.setButton("当前 production 内容已结束", true);
        } else if (failed) {
            ui.setButton("重试 6 岁武魂觉醒", false);
        } else {
            ui.setButton("推进 production 年度", false);
        }
    }
}

ui.button.addEventListener("click", advanceYear);
initialize().catch(error => {
    console.error("V2 production playtest initialization failed", error);
    ui.renderError(error);
    ui.setButton("Production 数据加载失败", true);
});
