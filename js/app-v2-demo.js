import { validateEventSchemaV2 } from "./event-schema-v2-validator.js";
import { createPlayerV2 } from "./player-v2.js";
import { V2SessionRunner } from "./v2-session-runner.js";
import { V2DemoUI } from "./ui-v2-demo.js";

const ui = new V2DemoUI();
const state = { player: null, runner: null, busy: false };

async function fetchJson(path) {
    const response = await fetch(path);
    if (!response.ok) {
        throw new Error(`Failed to load ${path}: ${response.status}`);
    }
    return response.json();
}

async function initialize() {
    const [dataset, combatPowerRules] = await Promise.all([
        fetchJson("data/v2/examples/vertical-slice.json"),
        fetchJson("data/config/combat-power.json")
    ]);
    const validation = validateEventSchemaV2(dataset);
    if (!validation.valid) {
        const error = new Error("V2 demo dataset failed static validation.");
        error.code = "INVALID_V2_DEMO_DATASET";
        error.details = validation;
        throw error;
    }

    state.player = createPlayerV2();
    state.runner = new V2SessionRunner({
        flow: dataset.flows[0],
        wheelsById: dataset.wheels,
        combatPowerRules
    });
    ui.renderPlayer(state.player);
    ui.setButton("开始 V2 人生", false);
}

async function advanceYear() {
    if (state.busy || !state.player || !state.runner) return;
    state.busy = true;
    ui.setButton("年度执行中…", true);
    try {
        const sequence = state.player.history.length + 1;
        const result = state.runner.run({
            player: state.player,
            sessionId: `v2_demo_${String(state.player.age).padStart(3, "0")}_${sequence}`,
            seed: `v2_demo_seed_${sequence}`,
            rng: Math.random
        });
        state.player = result.player;
        ui.renderResult(result);
    } catch (error) {
        console.error("V2 annual execution failed", error);
        ui.renderError(error);
    } finally {
        state.busy = false;
        ui.setButton("推进 V2 年度", false);
    }
}

ui.button.addEventListener("click", advanceYear);
initialize().catch(error => {
    console.error("V2 demo initialization failed", error);
    ui.renderError(error);
    ui.setButton("V2 数据加载失败", true);
});
