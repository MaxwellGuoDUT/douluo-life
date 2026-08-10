import { getPrimaryMartialSoulName } from "./player-selectors.js";

const stringify = value => JSON.stringify(value, null, 2);
const FORM_LABELS = Object.freeze({
    tool: "器",
    beast: "兽",
    plant: "植物",
    food: "食物",
    body: "本体"
});
const QUALITY_LABELS = Object.freeze({
    low: "低等",
    ordinary: "普通",
    top: "顶级",
    extreme: "极致"
});

function percentage(value) {
    return `${Math.round(value * 100)}%`;
}

export class V2DemoUI {
    constructor(documentRef = document) {
        this.document = documentRef;
        this.root = documentRef.getElementById("v2Playtest");
        this.button = documentRef.getElementById("advanceV2Btn");
        this.boundarySection = documentRef.getElementById("boundarySection");
        this.martialSoulList = documentRef.getElementById("martialSoulList");
        this.fields = Object.fromEntries([
            ["pageStatus", "pageStatusValue"],
            ["scene", "sceneValue"],
            ["age", "ageValue"],
            ["innateSoulPower", "innateSoulPowerValue"],
            ["talentGrade", "talentGradeValue"],
            ["level", "levelValue"],
            ["growthLock", "growthLockValue"],
            ["martialSoulCount", "martialSoulCountValue"],
            ["martialSoul", "martialSoulValue"],
            ["flow", "flowValue"],
            ["spinCount", "spinCountValue"],
            ["spinHistoryCount", "spinHistoryCountValue"],
            ["historyCount", "historyCountValue"],
            ["combatPower", "combatPowerValue"],
            ["combatBreakdown", "combatBreakdownValue"],
            ["rulesVersion", "rulesVersionValue"],
            ["catalogVersion", "catalogVersionValue"],
            ["probabilityVersion", "probabilityVersionValue"],
            ["annualRecord", "annualRecordValue"],
            ["spins", "spinsValue"],
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
        const awakened = player.innateSoulPower !== null;
        this.fields.age.textContent = `${player.age} 岁`;
        this.fields.innateSoulPower.textContent = awakened
            ? `${player.innateSoulPower} 级`
            : "未觉醒";
        this.fields.talentGrade.textContent = player.talentGrade ?? "未觉醒";
        this.fields.level.textContent = awakened
            ? `${player.level} / ${player.rank}`
            : "未觉醒";
        this.fields.growthLock.textContent = awakened
            ? (player.soulPowerGrowthLocked ? "已锁定" : "未锁定")
            : "未觉醒";
        this.fields.martialSoulCount.textContent = awakened
            ? String(player.martialSouls.length)
            : "未觉醒";
        this.fields.martialSoul.textContent = getPrimaryMartialSoulName(player)
            || "未觉醒";
        this.fields.spinHistoryCount.textContent = String(player.spinHistory.length);
        this.fields.historyCount.textContent = String(player.history.length);
    }

    renderMartialSouls(results = []) {
        this.martialSoulList.replaceChildren();
        if (results.length === 0) {
            const empty = this.document.createElement("li");
            empty.textContent = "尚未觉醒";
            this.martialSoulList.append(empty);
            return;
        }

        results.forEach(result => {
            const item = this.document.createElement("li");
            item.dataset.definitionId = result.definitionId;
            const title = this.document.createElement("strong");
            title.textContent = `槽位 ${result.slot} · ${result.name}`;
            const details = this.document.createElement("span");
            const attributes = result.attributes.length
                ? result.attributes.join(" / ")
                : "暂无已确认属性";
            details.textContent = [
                `${FORM_LABELS[result.form]}形态`,
                `${QUALITY_LABELS[result.qualityGrade]}品质`,
                `属性：${attributes}`,
                `definitionId：${result.definitionId}`,
                `品质战力加成：${percentage(result.qualityCombatCoefficient)}`
            ].join(" · ");
            item.append(title, details);
            this.martialSoulList.append(item);
        });
    }

    renderInitial(state) {
        this.renderPlayer(state.player);
        this.renderMartialSouls();
        this.fields.scene.textContent = "6 岁正式武魂觉醒 production playtest";
        this.fields.flow.textContent = state.currentFlowId;
        this.fields.spinCount.textContent = "0";
        this.fields.combatPower.textContent = "尚未计算";
        this.fields.combatBreakdown.textContent = "尚未计算";
        this.fields.rulesVersion.textContent = "-";
        this.fields.catalogVersion.textContent = state.catalogVersion;
        this.fields.probabilityVersion.textContent = state.probabilityVersion;
        this.fields.annualRecord.textContent = "尚无年度记录";
        this.fields.spins.textContent = "尚无随机记录";
        this.fields.warnings.textContent = "无";
        this.fields.error.textContent = "无";
        this.boundarySection.hidden = true;
        this.fields.boundary.textContent = "";
        this.setStatus("ready", "Production 目录、概率、年度内容和战力配置已加载并校验，等待执行。 ");
    }

    renderBusy() {
        this.fields.error.textContent = "无";
        this.setStatus("running", "正在执行先天魂力、数量、共享品质与每槽武魂生成链…");
    }

    renderResult(state) {
        const result = state.lastResult;
        const lastStep = result?.flowResult.steps.at(-1);
        const power = result?.combatPower;
        const record = result?.annualRecord;
        const awakening = result?.session?.result;

        this.renderPlayer(state.player);
        this.renderMartialSouls(result?.martialSoulResults ?? []);
        this.fields.flow.textContent = record
            ? `${record.flowId} / ${lastStep?.nodeId ?? "-"}`
            : state.currentFlowId ?? "-";
        this.fields.spinCount.textContent = String(result?.spins.length ?? 0);
        this.fields.combatPower.textContent = power ? String(power.total) : "未计算";
        this.fields.combatBreakdown.textContent = power
            ? stringify(power.breakdown)
            : "未计算";
        this.fields.rulesVersion.textContent = power?.rulesVersion ?? "-";
        this.fields.catalogVersion.textContent = awakening?.catalogVersion
            ?? state.catalogVersion;
        this.fields.probabilityVersion.textContent = awakening?.probabilityVersion
            ?? state.probabilityVersion;
        this.fields.annualRecord.textContent = record
            ? `${record.age} 岁 -> ${record.nextAge} 岁 / ${record.advance} / ${record.spinCount} spin`
            : "尚无年度记录";
        this.fields.spins.textContent = result?.spins.length
            ? stringify(result.spins)
            : "尚无随机记录";
        this.fields.warnings.textContent = result?.warnings.length
            ? stringify(result.warnings)
            : "无";
        this.fields.error.textContent = "无";

        if (state.boundary) {
            this.boundarySection.hidden = false;
            this.fields.boundary.textContent = `${state.boundary.message} 当前没有 confirmed 的 7 岁 production annual flow。`;
            this.setStatus("content_boundary", "完整觉醒链已原子提交；当前 production 内容到达 7 岁边界。");
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
