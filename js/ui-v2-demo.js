import { getPrimaryMartialSoulName } from "./player-selectors.js";

const stringify = value => JSON.stringify(value, null, 2);

export class V2DemoUI {
    constructor(documentRef = document) {
        this.root = documentRef.getElementById("v2Playtest");
        this.button = documentRef.getElementById("advanceV2Btn");
        this.boundarySection = documentRef.getElementById("boundarySection");
        this.fields = Object.fromEntries([
            ["pageStatus", "pageStatusValue"],
            ["scene", "sceneValue"],
            ["age", "ageValue"],
            ["level", "levelValue"],
            ["martialSoul", "martialSoulValue"],
            ["flow", "flowValue"],
            ["item", "itemValue"],
            ["itemText", "itemTextValue"],
            ["spinCount", "spinCountValue"],
            ["spinHistoryCount", "spinHistoryCountValue"],
            ["historyCount", "historyCountValue"],
            ["combatPower", "combatPowerValue"],
            ["rulesVersion", "rulesVersionValue"],
            ["annualRecord", "annualRecordValue"],
            ["boundary", "boundaryValue"],
            ["warnings", "warningsValue"],
            ["error", "errorValue"]
        ].map(([key, id]) => [key, documentRef.getElementById(id)]));
    }

    setButton(text, disabled) {
        this.button.textContent = text;
        this.button.disabled = disabled;
    }

    setStatus(status, text) {
        this.root.dataset.status = status;
        this.fields.pageStatus.textContent = text;
    }

    renderPlayer(player) {
        this.fields.age.textContent = `${player.age} 岁`;
        this.fields.level.textContent = `${player.level} / ${player.rank}`;
        this.fields.martialSoul.textContent = getPrimaryMartialSoulName(player) || "未觉醒";
        this.fields.spinHistoryCount.textContent = String(player.spinHistory.length);
        this.fields.historyCount.textContent = String(player.history.length);
    }

    renderInitial(state) {
        this.renderPlayer(state.player);
        this.fields.scene.textContent = "6 岁武魂觉醒 production playtest";
        this.fields.flow.textContent = state.currentFlowId;
        this.fields.item.textContent = "-";
        this.fields.itemText.textContent = "尚未执行";
        this.fields.spinCount.textContent = "0";
        this.fields.combatPower.textContent = "尚未计算";
        this.fields.rulesVersion.textContent = "-";
        this.fields.annualRecord.textContent = "尚无年度记录";
        this.fields.warnings.textContent = "无";
        this.fields.error.textContent = "无";
        this.boundarySection.hidden = true;
        this.fields.boundary.textContent = "";
        this.setStatus("ready", "Production 数据已加载并校验，等待执行 6 岁年度。");
    }

    renderBusy() {
        this.fields.error.textContent = "无";
        this.setStatus("running", "6 岁武魂觉醒年度执行中…");
    }

    renderResult(state) {
        const result = state.lastResult;
        const lastStep = result?.flowResult.steps.at(-1);
        const power = result?.combatPower;
        const record = result?.annualRecord;
        const item = result?.selectedItem;

        this.renderPlayer(state.player);
        this.fields.flow.textContent = record
            ? `${record.flowId} / ${lastStep?.nodeId ?? "-"}`
            : state.currentFlowId ?? "-";
        this.fields.item.textContent = item?.id ?? lastStep?.itemId ?? "-";
        this.fields.itemText.textContent = item?.text ?? "-";
        this.fields.spinCount.textContent = String(result?.spins.length ?? 0);
        this.fields.combatPower.textContent = power ? String(power.total) : "未计算";
        this.fields.rulesVersion.textContent = power?.rulesVersion ?? "-";
        this.fields.annualRecord.textContent = record
            ? `${record.age} 岁 -> ${record.nextAge} 岁 / ${record.advance} / ${record.spinCount} spin`
            : "尚无年度记录";
        this.fields.warnings.textContent = result?.warnings.length
            ? stringify(result.warnings)
            : "无";
        this.fields.error.textContent = "无";

        if (state.boundary) {
            this.boundarySection.hidden = false;
            this.fields.boundary.textContent = `${state.boundary.message} 当前没有 confirmed 的 7 岁 production annual flow。`;
            this.setStatus("content_boundary", "6 岁年度已成功完成；当前 production 内容到此为止。");
        } else {
            this.boundarySection.hidden = true;
            this.fields.boundary.textContent = "";
            this.setStatus("ready", "年度执行完成，可以继续检查下一 production 年度。");
        }
    }

    renderError(error) {
        this.fields.error.textContent = stringify({
            code: error?.code ?? "UNEXPECTED_ERROR",
            message: error?.message ?? String(error),
            details: error?.details ?? {}
        });
        this.setStatus("error", "Production playtest 发生真实错误，Player 保持执行前状态。");
    }
}

export default V2DemoUI;
