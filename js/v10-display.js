import { V10_GOD_TRIAL_STAGES } from './v10-god-trial-runtime.js';
// Match the source UI: pure beast time uses chronologicalAge; transformed humans use age.
export function actualAge(character) {
    return character.route === 'beast'
        ? character.beast?.chronologicalAge ?? character.beastOrigin?.chronologicalAge ?? null
        : character.age;
}
export function actualAgeText(character) {
    const age = actualAge(character);
    return Number.isFinite(age) ? age.toLocaleString('zh-CN') + ' 岁'
        : character.route === 'beast' ? '该路线未记录实际年龄' : '未确定';
}
export function playerWheelView(view) {
    if (!view) return view;
    const internal = /(?:[0-9a-f]{8}-[0-9a-f-]{27,}|douluo[12]:|flow\.|runtime)/iu;
    if (view.status === 'dynamic') {
        const title = '命运接续';
        const message = '下一次推进将结算当前阶段，再显示可抽取的转盘。';
        return view.title === title && view.message === message ? view : {...view, title, message};
    }
    return typeof view.title === 'string' && view.title.trim() && !internal.test(view.title)
        ? view : {...view, title: '当前命运转盘'};
}
// This module receives fields, not a second runner or session.
export function createV10Display(gameFields, document = globalThis.document) {
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
        const attributes = characterAttributes(character);
        gameFields["character-attributes"].replaceChildren(...(attributes.length
            ? [...new Set(attributes.map(attribute => ATTRIBUTE_NAMES[attribute] ?? attribute))] : ["暂无属性"]).map(attribute => {
                const tag = document.createElement("span");
                tag.textContent = ATTRIBUTE_NAMES[attribute] ?? attribute;
                return tag;
            }));
        const cultivation = isBeast ? character.beastYears : character.level;
        gameFields["cultivation-label"].textContent = isBeast ? "修为年限" : "魂力修为";
        gameFields["cultivation-value"].textContent = Number.isFinite(cultivation)
            ? cultivation.toLocaleString("zh-CN") + (isBeast ? " 年" : " 级") : "未确定";
        gameFields["actual-age-value"].textContent = actualAgeText(character);
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

    function renderWheel(rawView) {
        const view = playerWheelView(rawView);
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
            ? view.message
            : view?.status === "completed" ? "人生已完成，转盘锁定。"
                : ["boundary", "error"].includes(view?.status) ? "人生推进已停止；请查看下方错误详情。"
                    : segments.length ? `下一可选转盘 · 总权重 ${view.totalWeight}`
                        : "下一可选转盘将在开局后显示。";
        gameFields["human-options"].replaceChildren(...segments.map(segment => {
            const item = document.createElement("li");
            item.textContent = `${segment.fullText ?? segment.text ?? segment.optionId} · 权重 ${segment.weight} · ${segment.percentage.toFixed(2)}%`;
            return item;
        }));
    }


    return {renderCharacterSummary, renderCharacterDetails, renderWheel, godTrialProgress};
}
