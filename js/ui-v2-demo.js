import { getPrimaryMartialSoulName } from "./player-selectors.js";

const stringify = value => JSON.stringify(value, null, 2);

export class V2DemoUI {
    constructor(documentRef = document) {
        this.button = documentRef.getElementById("advanceV2Btn");
        this.fields = Object.fromEntries([
            ["age", "ageValue"],
            ["level", "levelValue"],
            ["martialSoul", "martialSoulValue"],
            ["flow", "flowValue"],
            ["item", "itemValue"],
            ["spinCount", "spinCountValue"],
            ["combatPower", "combatPowerValue"],
            ["rulesVersion", "rulesVersionValue"],
            ["annualRecord", "annualRecordValue"],
            ["warnings", "warningsValue"],
            ["error", "errorValue"]
        ].map(([key, id]) => [key, documentRef.getElementById(id)]));
    }

    setButton(text, disabled) {
        this.button.textContent = text;
        this.button.disabled = disabled;
    }

    renderPlayer(player) {
        this.fields.age.textContent = `${player.age} 岁`;
        this.fields.level.textContent = `${player.level} / ${player.rank}`;
        this.fields.martialSoul.textContent = getPrimaryMartialSoulName(player) || "未觉醒";
    }

    renderResult(result) {
        const lastStep = result.flowResult.steps.at(-1);
        const power = result.combatPower;
        const record = result.annualRecord;

        this.renderPlayer(result.player);
        this.fields.flow.textContent = `${record.flowId} / ${lastStep?.nodeId ?? "-"}`;
        this.fields.item.textContent = lastStep?.itemId ?? "-";
        this.fields.spinCount.textContent = String(result.spins.length);
        this.fields.combatPower.textContent = power ? String(power.total) : "未计算";
        this.fields.rulesVersion.textContent = power?.rulesVersion ?? "-";
        this.fields.annualRecord.textContent = `${record.age} 岁 -> ${record.nextAge} 岁 / ${record.advance} / ${record.spinCount} spin`;
        this.fields.warnings.textContent = result.warnings.length ? stringify(result.warnings) : "无";
        this.fields.error.textContent = "无";
    }

    renderError(error) {
        this.fields.error.textContent = stringify({
            code: error?.code ?? "UNEXPECTED_ERROR",
            message: error?.message ?? String(error),
            details: error?.details ?? {}
        });
    }
}

export default V2DemoUI;
