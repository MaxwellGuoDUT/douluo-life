export const APK_COMBAT_POWER_RUNTIME_VERSION = "apk-combat-power-runtime/1.0";
export const APK_COMBAT_POWER_EVIDENCE_SCHEMA_VERSION = "apk-combat-power-evidence/1.0";

function isPlainObject(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false;
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
}

function clone(value) {
    return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function fail(code, message, details = {}) {
    throw new ApkCombatPowerRuntimeError(code, message, details);
}

function finite(value, label) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
        fail(
            "APK_COMBAT_POWER_INVALID_VALUE",
            `APK 战力计算收到非有限${label}。`,
            { label, value }
        );
    }
    return number;
}

function apkRound(value) {
    const number = finite(value, "战力");
    return number < 0
        ? -Math.floor(-number + 0.5)
        : Math.floor(number + 0.5);
}

function minOne(value) {
    return Math.max(1, apkRound(value));
}

function nonNegativeInteger(value, label) {
    return Math.max(0, Math.floor(finite(value ?? 0, label)));
}

function sum(values) {
    return values.reduce((total, value) => total + finite(value, "战力构成"), 0);
}

function scaled(value, basisPoints, minimum = true) {
    const basis = finite(basisPoints, "战力倍率");
    const product = (finite(value, "战力") * basis) / 10000;
    if (basis === 0) return 0;
    if (basis < 0) return apkRound(product);
    return minimum ? minOne(product) : apkRound(product);
}

function evidenceFormula(evidence) {
    if (evidence?.schemaVersion !== APK_COMBAT_POWER_EVIDENCE_SCHEMA_VERSION
        || !isPlainObject(evidence.formula)) {
        fail(
            "APK_COMBAT_POWER_EVIDENCE_INVALID",
            "APK 战力计算缺少可验证的来源公式证据包。",
            { expectedSchemaVersion: APK_COMBAT_POWER_EVIDENCE_SCHEMA_VERSION }
        );
    }
    const formula = evidence.formula;
    const requiredDefinitions = [
        "levelPower",
        "beastCultivation",
        "agePower",
        "ringQualityMultipliers",
        "martialSoulQuality",
        "martialSoulAvatarQuality",
        "attributeQuality",
        "bloodlineQuality",
        "titlePower",
        "godArmorPower",
        "titleKinds",
        "soulBoneParts",
        "constants"
    ];
    const missingDefinitions = requiredDefinitions.filter(key => (
        !Array.isArray(formula[key]) && !isPlainObject(formula[key])
    ));
    const sets = formula.staticOptionSets;
    const missingSets = [
        "lowMartialSouls",
        "topMartialSouls",
        "subDragonRingTypes",
        "earthDragonRingTypes",
        "pureDragonRingTypes",
        "lowRingSpecies",
        "topRingSpecies"
    ].filter(key => !Array.isArray(sets?.[key]));
    const coverage = formula.coverage;
    if (missingDefinitions.length > 0
        || missingSets.length > 0
        || coverage?.status !== "source-verified-with-typed-guards"
        || coverage?.noApproximateTotal !== true) {
        fail(
            "APK_COMBAT_POWER_EVIDENCE_INVALID",
            "APK 战力来源证据包缺少计算器定义。",
            {
                missingDefinitions,
                missingSets,
                coverageStatus: coverage?.status ?? null,
                noApproximateTotal: coverage?.noApproximateTotal ?? null
            }
        );
    }
    return formula;
}

function lookupQuality(map, key) {
    const value = map?.[key];
    if (!Number.isFinite(Number(value))) {
        fail(
            "APK_COMBAT_POWER_SOURCE_VALUE_MISSING",
            `APK 战力来源表缺少键 "${String(key)}"。`,
            { key }
        );
    }
    return Number(value);
}

function uncoveredState(area, message, details = {}) {
    fail(
        "APK_COMBAT_POWER_UNCOVERED_STATE",
        message,
        { area, ...details }
    );
}

function findLevelPower(level, entries, maximumLevel) {
    const safeEntries = Array.isArray(entries) ? entries : [];
    if (safeEntries.length === 0) {
        fail("APK_COMBAT_POWER_EVIDENCE_INVALID", "APK 等级战力来源表为空。");
    }
    const boundedLevel = Math.min(
        finite(maximumLevel, "等级上限"),
        Math.max(1, Math.floor(finite(level, "等级")))
    );
    let selected = safeEntries[0];
    for (const entry of safeEntries) {
        if (boundedLevel >= Number(entry.minimumLevel)) selected = entry;
    }
    return finite(selected.basePower, "等级战力")
        + (boundedLevel - Number(selected.minimumLevel))
        * finite(selected.powerPerLevel, "等级战力增量");
}

function findBeastCultivationPower(
    years,
    passedMillionYearTribulation,
    entries,
    formulaConstants
) {
    const cultivation = nonNegativeInteger(years, "魂兽修为");
    if (cultivation < 10) return 1;
    if (cultivation >= 1000000) {
        return passedMillionYearTribulation
            ? formulaConstants.beastMillionYearTribulationPower
            : formulaConstants.beastMillionYearPower;
    }
    const safeEntries = Array.isArray(entries) ? entries : [];
    let selected = safeEntries[0];
    for (const entry of safeEntries) {
        if (cultivation >= Number(entry.minimumYears)) selected = entry;
    }
    return finite(selected.basePower, "魂兽修为战力")
        + Math.floor(
            (cultivation - Number(selected.minimumYears))
            / Number(selected.yearsPerStep)
        ) * finite(selected.powerPerStep, "魂兽修为战力增量");
}

function agePower(years, entries) {
    const safeYears = nonNegativeInteger(years, "年限");
    const entry = (Array.isArray(entries) ? entries : [])
        .find(candidate => safeYears >= Number(candidate.minimumYears));
    return Number.isFinite(Number(entry?.power)) ? Number(entry.power) : 0;
}

function ringQuality(ring, formula) {
    const quality = ring?.quality ?? "ordinary";
    const base = agePower(ring?.years, formula.agePower);
    return base <= 0
        ? 0
        : scaled(
            base,
            ring?.divine === true || quality === "divine"
                ? formula.constants.divineQualityBasisPoints
                : lookupQuality(formula.ringQualityMultipliers, quality),
        );
}

function soulBoneQuality(bone, formula) {
    const quality = bone?.quality ?? "ordinary";
    const base = agePower(bone?.years, formula.agePower);
    return base <= 0
        ? 0
        : scaled(
            base,
            bone?.divine === true || quality === "divine"
                ? formula.constants.divineQualityBasisPoints
                : lookupQuality(formula.ringQualityMultipliers, quality),
        );
}

function setHas(values, value) {
    return Array.isArray(values) && values.includes(value);
}

function sourceMartialSoulQuality(soul, formula) {
    const sets = formula.staticOptionSets;
    const ranking = { low: 0, ordinary: 1, top: 2, ultimate: 3 };
    const qualityOfId = id => setHas(sets.lowMartialSouls, id)
        ? "low"
        : setHas(sets.topMartialSouls, id)
            ? "top"
            : "ordinary";
    const qualities = [
        qualityOfId(soul?.id),
        ...(Array.isArray(soul?.awakenings) ? soul.awakenings : [])
            .map(awakening => qualityOfId(awakening?.optionId))
    ];
    if (soul?.tags?.includes("ultimate") || soul?.category === "极致武魂") {
        qualities.push("ultimate");
    }
    return qualities.reduce(
        (best, candidate) => ranking[candidate] > ranking[best] ? candidate : best,
        "low"
    );
}

function sourceSoulRingQuality(ring, formula) {
    if (ring?.quality && ring.quality !== "divine") return ring.quality;
    const speciesId = ring?.speciesSelection?.optionId;
    const typeId = ring?.typeSelection?.optionId;
    const sets = formula.staticOptionSets;
    return setHas(sets.lowRingSpecies, speciesId)
        ? "low"
        : setHas(sets.pureDragonRingTypes, typeId)
            ? "pure-dragon"
            : setHas(sets.earthDragonRingTypes, typeId)
                ? "earth-dragon"
                : setHas(sets.subDragonRingTypes, typeId)
                    ? "sub-dragon"
                    : setHas(sets.topRingSpecies, speciesId)
                        ? "top"
                        : "ordinary";
}

function sourceSoulRingBreakdown(character, level, formula) {
    let base = 0;
    let quality = 0;
    for (const soul of Array.isArray(character.martialSouls) ? character.martialSouls : []) {
        for (const [ringIndex, ring] of (Array.isArray(soul?.rings) ? soul.rings : []).entries()) {
            const yearsPower = agePower(ring?.years, formula.agePower);
            const godLevel = level >= 100 && ringIndex >= 9;
            const contribution = godLevel ? formula.constants.godBestowedPower : ringQuality({
                ...ring,
                quality: sourceSoulRingQuality(ring, formula),
                divine: ring?.quality === "divine"
            }, formula);
            base += godLevel ? formula.constants.godBestowedPower : yearsPower;
            quality += contribution - (
                godLevel ? formula.constants.godBestowedPower : yearsPower
            );
        }
    }
    return { base, quality };
}

function bonePart(bone, formula) {
    const sourcePart = bone?.partId ?? bone?.id;
    if (typeof sourcePart === "string" && sourcePart.startsWith("growth-external:")) {
        return "external";
    }
    return formula.soulBoneParts[sourcePart] ?? null;
}

function godhoodKind(character, formula) {
    const sourceTier = character?.godhood?.tier ?? character?.godTrial?.tier;
    const map = {
        三级: "third",
        二级: "second",
        一级: "first",
        神王: "king"
    };
    return map[sourceTier] ?? sourceTier ?? null;
}

function godhoodKinds(character, formula) {
    const godhoods = Array.isArray(character?.godhoods) && character.godhoods.length > 0
        ? character.godhoods
        : [character?.godhood ?? character?.godTrial].filter(Boolean);
    return godhoods
        .map(entry => {
            if (typeof entry === "string") return entry;
            if (!isPlainObject(entry)) {
                uncoveredState(
                    "godhood",
                    "神位条目必须是字符串或包含 tier 的对象。",
                    { entry: clone(entry) }
                );
            }
            return godhoodKind({ godhood: entry }, formula);
        })
        .filter(kind => kind !== null && kind !== undefined);
}

function sourceSoulBoneBreakdown(character, godArmorSets, formula) {
    let base = 0;
    let quality = 0;
    let godArmor = 0;
    const armorSets = Array.isArray(godArmorSets) ? godArmorSets : [];
    const bones = Array.isArray(character.soulBones) ? character.soulBones : [];
    for (const bone of bones) {
        const yearsPower = agePower(bone?.years, formula.agePower);
        const qualityPower = soulBoneQuality(bone, formula);
        if (bone?.godArmor === true
            || (armorSets.length > 0 && bonePart(bone, formula) !== "external")) {
            const multiplier = Math.max(1, armorSets.length);
            godArmor += qualityPower
                * formula.constants.soulBoneGodArmorMultiplier
                * multiplier;
        } else {
            base += yearsPower;
            quality += qualityPower - yearsPower;
        }
    }
    const armorSetPower = sum(
        armorSets.map(kind => lookupQuality(formula.godArmorPower, kind))
    );
    const combinedArmor = godArmor + armorSetPower;
    return {
        base,
        quality,
        godArmor: armorSets.length > 1
            ? minOne(
                (combinedArmor * formula.constants.multiGodArmorEfficiencyBasisPoints)
                / 10000
            )
            : combinedArmor
    };
}

function attributeQualities(character) {
    const stages = character?.beast?.attributeStages;
    const values = stages && Object.keys(stages).length > 0
        ? Object.values(stages)
        : character?.elementProgress && Object.keys(character.elementProgress).length > 0
            ? Object.values(character.elementProgress)
            : null;
    if (values) {
        return values.flatMap(value => (
            value >= 4
                ? ["complete-law"]
                : value === 3
                    ? ["law-seed"]
                    : value === 2
                        ? ["ultimate"]
                        : value === 1
                            ? ["ordinary"]
                            : []
        ));
    }
    const ranking = { ordinary: 1, ultimate: 2, "law-seed": 3, "complete-law": 4 };
    const qualities = new Map();
    for (const attribute of Array.isArray(character?.attributes) ? character.attributes : []) {
        qualities.set(attribute, "ordinary");
    }
    const suffixes = [
        [".complete-law", "complete-law"],
        [".law-seed", "law-seed"],
        [".ultimate", "ultimate"]
    ];
    for (const trait of Array.isArray(character?.traits) ? character.traits : []) {
        const prefix = trait.startsWith("formal:element.")
            ? "formal:element."
            : trait.startsWith("douluo2:element.")
                ? "douluo2:element."
                : null;
        if (!prefix) continue;
        const suffix = suffixes.find(([candidate]) => trait.endsWith(candidate));
        if (!suffix) continue;
        const attribute = trait.slice(prefix.length, -suffix[0].length);
        if (!attribute) continue;
        const current = qualities.get(attribute);
        if (!current || ranking[suffix[1]] > ranking[current]) qualities.set(attribute, suffix[1]);
    }
    return [...qualities.values()];
}

function attributePower(base, character, formula) {
    const qualities = attributeQualities(character);
    const counts = new Map();
    for (const quality of qualities) counts.set(quality, (counts.get(quality) ?? 0) + 1);
    return sum([...counts].map(([quality, count]) => (
        scaled(base, lookupQuality(formula.attributeQuality, quality) * count)
    )));
}

function titlePower(base, character, formula) {
    const names = new Set([
        ...(Array.isArray(character?.beast?.nameSuffixes) ? character.beast.nameSuffixes : []),
        ...(Array.isArray(character?.titles) ? character.titles : [])
    ]);
    const unknownTitles = [...names].filter(title => !formula.titleKinds?.[title]);
    if (unknownTitles.length > 0) {
        uncoveredState(
            "beastTitles",
            "魂兽称号存在未登记的来源映射，拒绝返回近似总战力。",
            { unknownTitles }
        );
    }
    const titleBasisPoints = sum([...names]
        .map(title => formula.titleKinds?.[title])
        .filter(Boolean)
        .map(kind => lookupQuality(formula.titlePower, kind)));
    const titleBonuses = character?.beastTitleBonuses;
    if (titleBonuses !== undefined && !Array.isArray(titleBonuses)) {
        uncoveredState(
            "beastTitleBonuses",
            "魂兽称号额外战力必须是来源数组。",
            { value: clone(titleBonuses) }
        );
    }
    return (titleBasisPoints === 0 ? 0 : scaled(base, titleBasisPoints))
        + sum((titleBonuses ?? []).map(value => apkRound(value)));
}

function sourceBeastBloodlineQuality(character, entry, primary, formula) {
    if (!isPlainObject(entry) || !isPlainObject(entry.selection)
        || typeof entry.selection.optionId !== "string") {
        uncoveredState(
            "beastBloodline",
            "魂兽血脉条目缺少来源 selection.optionId。",
            { entry: clone(entry) }
        );
    }
    const selectionId = entry.selection.optionId;
    if (primary
        && (character?.flags?.["formal:beast-supreme-bloodline"] === true
            || character?.beast?.nameSuffixes?.includes("主宰"))) {
        return "supreme";
    }
    if (setHas(formula.staticOptionSets.lowRingSpecies, selectionId)) return "low";
    if (entry.typeOptionId === "fc8f55") return "pure-dragon";
    if (entry.typeOptionId === "5ee629") return "earth-dragon";
    if (entry.typeOptionId === "f7fb5e") return "sub-dragon";
    if (setHas(formula.staticOptionSets.topRingSpecies, selectionId)) return "top";
    return "ordinary";
}

function sourceBeastBloodlineComposition(character, formula) {
    const beast = character?.beast;
    const bloodlines = beast?.bloodlines ?? [];
    const components = beast?.bloodlineComponents ?? [];
    if (!Array.isArray(bloodlines) || !Array.isArray(components)) {
        uncoveredState(
            "beastBloodline",
            "魂兽血脉与血脉融合批次必须是数组。",
            { bloodlines: clone(bloodlines), components: clone(components) }
        );
    }
    if (components.length > 0) {
        return components.map((component, index) => {
            if (!isPlainObject(component)
                || !Number.isFinite(Number(component.ratioBasisPoints))
                || Number(component.ratioBasisPoints) < 0) {
                uncoveredState(
                    "beastBloodlineComposition",
                    "魂兽血脉融合批次缺少有效 ratioBasisPoints。",
                    { index, component: clone(component) }
                );
            }
            const selected = bloodlines.find(entry => (
                entry?.selection?.optionId === component.bloodlineId
            )) ?? bloodlines[index];
            return {
                quality: selected
                    ? sourceBeastBloodlineQuality(
                        character,
                        selected,
                        component.role === "primary",
                        formula
                    )
                    : "ordinary",
                ratioBasisPoints: Number(component.ratioBasisPoints)
            };
        });
    }
    const composition = bloodlines.map((entry, index) => {
        if (!Number.isFinite(Number(entry?.percentage))) {
            uncoveredState(
                "beastBloodline",
                "魂兽血脉条目缺少有效 percentage。",
                { index, entry: clone(entry) }
            );
        }
        return {
            quality: sourceBeastBloodlineQuality(character, entry, index === 0, formula),
            ratioBasisPoints: Math.max(0, Math.round(Number(entry.percentage) * 100))
        };
    });
    if (composition.length > 0) {
        composition[composition.length - 1].ratioBasisPoints += (
            10000 - sum(composition.map(entry => entry.ratioBasisPoints))
        );
    }
    return composition;
}

function sourceBeastBloodlineBreakdown(base, character, formula) {
    const composition = sourceBeastBloodlineComposition(character, formula);
    if (composition.length > 1) {
        return {
            composition,
            beastBloodline: 0,
            bloodlineFusion: sum(composition.map(entry => (
                scaled(
                    base,
                    lookupQuality(formula.bloodlineQuality, entry.quality)
                        * entry.ratioBasisPoints
                        / 10000,
                    false
                )
            ))) + apkRound(character.bloodlineFusionBonus ?? 0)
        };
    }
    const fallbackQuality = composition[0]?.quality
        ?? character.beastBloodlineQuality
        ?? ({
            0: "ordinary",
            1: "low",
            2: "top",
            3: "sub-dragon",
            4: "earth-dragon",
            5: "pure-dragon"
        }[character.beastBloodlineLevel]);
    return {
        composition,
        beastBloodline: fallbackQuality
            ? scaled(base, lookupQuality(formula.bloodlineQuality, fallbackQuality), false)
            : 0,
        bloodlineFusion: apkRound(character.bloodlineFusionBonus ?? 0)
    };
}

function itemPower(base, items, formula) {
    const values = Array.isArray(items) ? items : [];
    const fixed = values
        .filter(item => item?.kind === "fixed")
        .map(item => apkRound(item?.value ?? 0));
    const defaults = values.filter(item => item?.kind === "default").length;
    return sum([
        ...fixed,
        ...(defaults > 0
            ? [scaled(base, formula.constants.defaultItemBasisPoints * defaults)]
            : [])
    ]);
}

function levelPercentBonus(character, category, base) {
    const level = finite(character?.level ?? 1, "等级");
    return Object.entries(character?.flags ?? {})
        .filter(([key]) => key.startsWith(`combat:${category}:level-percent:`))
        .reduce((total, [key, value]) => {
            const parts = key.split(":");
            const legacy = parts.length === 4;
            const basisPoints = Number(legacy ? value ?? 0 : parts[3]);
            const count = Number(legacy ? 1 : value ?? 0);
            const activeBelowLevel = Number(legacy ? parts[3] : parts[4]);
            if ((Number.isFinite(activeBelowLevel) && level >= activeBelowLevel)
                || !Number.isFinite(basisPoints)
                || !Number.isFinite(count)) {
                return total;
            }
            return total + scaled(base, basisPoints) * Math.max(0, Math.trunc(count));
        }, 0);
}

function artifactInputs(character, godKind, route, level, formula) {
    const artifacts = Array.isArray(character?.artifacts) ? character.artifacts : [];
    const complete = artifacts.filter(artifact => artifact?.stage === "complete");
    const fixed = sum(complete.map(artifact => artifact?.combatPower ?? 0));
    const fallback = complete
        .filter(artifact => artifact?.combatPower === undefined)
        .flatMap(artifact => {
            if (!godKind) {
                uncoveredState(
                    "artifacts",
                    "完整神器缺少固定战力和神装档位来源，拒绝返回近似总战力。",
                    { artifact: clone(artifact) }
                );
            }
            return [godKind];
        });
    const fallbackPower = fallback.map(kind => lookupQuality(formula.godArmorPower, kind));
    const subHundredHuman = route === "human" && level < 100;
    return sum([
        ...(subHundredHuman
            ? fallbackPower.map(value => apkRound(value / formula.constants.subHundredArtifactDivisor))
            : fallbackPower),
        subHundredHuman
            ? apkRound(fixed / formula.constants.subHundredArtifactDivisor)
            : fixed
    ]);
}

function sourceQualityList(character, formula) {
    return (Array.isArray(character?.martialSouls) ? character.martialSouls : [])
        .map(soul => sourceMartialSoulQuality(soul, formula));
}

export function validateApkCombatPowerEvidence(evidence) {
    try {
        evidenceFormula(evidence);
        return {
            valid: true,
            schemaVersion: evidence.schemaVersion,
            sourceSha256: evidence.source?.apkSha256 ?? null
        };
    } catch (error) {
        return {
            valid: false,
            schemaVersion: evidence?.schemaVersion ?? null,
            errors: [{
                code: error.code ?? "APK_COMBAT_POWER_EVIDENCE_INVALID",
                message: error.message,
                details: clone(error.details ?? {})
            }]
        };
    }
}

export function calculateApkCombatPower(character, evidence) {
    if (!isPlainObject(character)) {
        fail("APK_COMBAT_POWER_CHARACTER_INVALID", "APK 战力计算需要角色状态对象。");
    }
    const formula = evidenceFormula(evidence);
    if (Array.isArray(character.uncoveredCombatPowerStates)
        && character.uncoveredCombatPowerStates.length > 0) {
        uncoveredState(
            "character.uncoveredCombatPowerStates",
            "角色明确标记了尚未覆盖的战力状态，拒绝返回近似总战力。",
            { states: clone(character.uncoveredCombatPowerStates) }
        );
    }
    const route = character.route === "beast" ? "beast" : "human";
    const level = Math.min(169, Math.max(1, Math.floor(finite(character.level ?? 1, "等级"))));
    const base = route === "beast"
        ? findBeastCultivationPower(
            character.beastYears ?? 0,
            character.beast?.tribulationsPassed?.includes(1000000) === true,
            formula.beastCultivation,
            formula.constants
        )
        : findLevelPower(
            level,
            formula.levelPower,
            formula.constants.levelClampMaximum
        );
    const components = {};
    if (route === "human") {
        const soulQualities = sourceQualityList(character, formula);
        components.martialSoulQuality = sum(soulQualities.map(quality => (
            scaled(base, lookupQuality(formula.martialSoulQuality, quality))
        )));
        if (level >= 70) {
            const bodyQualities = character.martialSoulBodyQuality
                ? [character.martialSoulBodyQuality]
                : soulQualities;
            components.martialSoulAvatar = sum(bodyQualities.map(quality => (
                scaled(base, lookupQuality(formula.martialSoulAvatarQuality, quality))
            )));
        }
        const rings = sourceSoulRingBreakdown(character, level, formula);
        components.soulRingBase = rings.base;
        components.soulRingQuality = rings.quality;
    }

    const passedMillionYearTribulation = character.beast?.tribulationsPassed?.includes(1000000) === true;
    const divineEligible = route === "human"
        ? level >= 100
        : passedMillionYearTribulation;
    const godhoodKindsList = godhoodKinds(character, formula);
    const godKind = godhoodKindsList[0] ?? null;
    const godArmorSets = divineEligible
        && character.flags?.godTrialArmor === true
        && godKind
        ? [godKind]
        : [];
    const bones = sourceSoulBoneBreakdown(character, godArmorSets, formula);
    components.soulBoneBase = bones.base;
    components.soulBoneQuality = bones.quality;
    components.godArmor = bones.godArmor;
    if (divineEligible) {
        components.godhood = sum(
            godhoodKindsList.map(kind => lookupQuality(formula.godArmorPower, kind))
        );
    }

    const domainCount = nonNegativeInteger(character.domains?.length ?? 0, "领域数量");
    components.domains = domainCount > 0
        ? scaled(base, formula.constants.domainBasisPoints * domainCount)
        : 0;
    const artifactPower = artifactInputs(character, godKind, route, level, formula);
    components.artifacts = artifactPower;
    components.attributes = attributePower(base, character, formula);
    if (route === "beast") {
        const bloodline = sourceBeastBloodlineBreakdown(base, character, formula);
        if (bloodline.composition.length <= 1) {
            components.beastBloodline = bloodline.beastBloodline;
        }
        components.bloodlineFusion = bloodline.bloodlineFusion;
        components.beastTitles = titlePower(base, character, formula);
    }
    components.plotCharacterTemplate = apkRound(character.plotCharacterTemplate ?? 0);

    const soulCoreCount = nonNegativeInteger(character.flags?.soulCoreCount ?? 0, "魂核数量");
    const soulCoreBase = route === "human"
        ? Math.min(base, formula.constants.humanSoulCoreBaseCap)
        : base;
    components.soulCores = soulCoreCount > 0
        ? scaled(soulCoreBase, soulCoreCount * formula.constants.soulCoreBasisPoints)
        : 0;
    components.items = itemPower(base, character.items, formula)
        + apkRound(character.itemBonuses ?? 0)
        + levelPercentBonus(character, "item", base);
    components.specialSkills = itemPower(base, character.specialSkills, formula)
        + apkRound(character.specialSkillBonuses ?? 0)
        + levelPercentBonus(character, "special-skill", base);
    components.special = sum((Array.isArray(character.bonuses) ? character.bonuses : []).map(value => apkRound(value)));

    const statusModifier = finite(character.flags?.["combat:status-modifier"] ?? 0, "战力状态修正");
    const hasStatusBasis = Object.prototype.hasOwnProperty.call(
        character.flags ?? {},
        "combat:status-multiplier-basis-points"
    );
    const statusBasis = Number(
        character.flags?.["combat:status-multiplier-basis-points"]
            ?? formula.constants.defaultStatusBasisPoints
    );
    if (hasStatusBasis
        && ![
            formula.constants.defaultStatusBasisPoints,
            formula.constants.severelyInjuredStatusBasisPoints,
            formula.constants.desperateStatusBasisPoints
        ].includes(statusBasis)) {
        uncoveredState(
            "status",
            "战力状态倍率未登记，拒绝返回近似总战力。",
            { statusBasis }
        );
    }
    const statusEffects = statusBasis === formula.constants.severelyInjuredStatusBasisPoints
        ? ["severely-injured"]
        : statusBasis === formula.constants.desperateStatusBasisPoints
            ? ["desperate"]
            : [];
    let totalBeforeStatusEffect = base + sum(Object.values(components)) + statusModifier;
    let total = Math.max(1, apkRound(totalBeforeStatusEffect));
    for (const effect of statusEffects) {
        total = minOne(effect === "severely-injured" ? total * 0.5 : total * 1.5);
    }
    components.status = total - totalBeforeStatusEffect + statusModifier;
    return {
        schemaVersion: APK_COMBAT_POWER_RUNTIME_VERSION,
        sourceEvidenceSchemaVersion: evidence.schemaVersion,
        base,
        baseCategory: route === "beast" ? "beastCultivation" : "level",
        components,
        total,
        sourceInputs: {
            route,
            level,
            godhoodKind: godKind,
            godhoodKinds: godhoodKindsList,
            divineEligible,
            statusEffects,
            beastBloodlineComposition: route === "beast"
                ? sourceBeastBloodlineComposition(character, formula)
                : []
        }
    };
}

export function compareApkCombatThreshold(total, threshold, operator = ">=") {
    const combatPower = finite(total, "总战力");
    const combatThreshold = finite(threshold, "战力阈值");
    if (operator === ">") return combatPower > combatThreshold;
    if (operator === ">=") return combatPower >= combatThreshold;
    fail(
        "APK_COMBAT_POWER_OPERATOR_UNSUPPORTED",
        `APK 战力阈值运算符 "${String(operator)}" 未登记。`,
        { operator, supportedOperators: [">=", ">"] }
    );
}

export class ApkCombatPowerRuntimeError extends Error {
    constructor(code, message, details = {}) {
        super(message);
        this.name = "ApkCombatPowerRuntimeError";
        this.code = code;
        this.details = details;
    }
}

export default Object.freeze({
    APK_COMBAT_POWER_EVIDENCE_SCHEMA_VERSION,
    APK_COMBAT_POWER_RUNTIME_VERSION,
    ApkCombatPowerRuntimeError,
    calculateApkCombatPower,
    compareApkCombatThreshold,
    validateApkCombatPowerEvidence
});
