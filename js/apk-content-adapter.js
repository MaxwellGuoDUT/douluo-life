export const APK_CONTENT_ADAPTER_VERSION = "apk-content-adapter/1.0";

export const APK_EFFECT_TYPES = Object.freeze([
    "addArtifact",
    "addBeastNamePrefix",
    "addBeastNameSuffix",
    "addCombatPowerBonus",
    "addDeathShield",
    "addDomainEmbryo",
    "addDomainSeed",
    "addInventoryStack",
    "addLevelCombatPowerPercentBonus",
    "addLevelLossShield",
    "addLog",
    "addNextTimeSkipLevelBonus",
    "addSoulBone",
    "addSoulRing",
    "addTalent",
    "addTitle",
    "addTrait",
    "advanceBeastElement",
    "advanceHumanElement",
    "advanceStoryProtagonistAge",
    "applyPendingSoulBoneUpgrade",
    "changeAllSoulBoneYears",
    "changeAllSoulRingYears",
    "changeAnnualIncome",
    "changeAnnualLevelBonus",
    "changeAppearanceRank",
    "changeBeastYears",
    "changeBeastYearsWithFloor",
    "changeCounter",
    "changeCounterWithLevelReward",
    "changeCurrency",
    "changeLevel",
    "conditional",
    "death",
    "ending",
    "equipGodArmorOrDie",
    "grantCompleteLaw",
    "progressAttribute",
    "queueSoulBoneUpgrade",
    "removeHumanElement",
    "setAllSoulBoneQuality",
    "setAllSoulRingQuality",
    "setBeastYears",
    "setFlag",
    "setInnatePower",
    "setLevel",
    "setTalentGrade",
    "upgradeArtifacts"
]);

export const APK_REQUIREMENT_TYPES = Object.freeze([
    "anyOf",
    "beastNameSuffixCountAtLeast",
    "completeLawCountAtLeast",
    "counterAtLeast",
    "currencyAtLeast",
    "currencyBelow",
    "genderOptionIs",
    "hasAnySoulBone",
    "hasAttribute",
    "hasBeastNameSuffix",
    "hasSoulBonePart",
    "inventoryAtLeast",
    "inventoryBelow",
    "isDragonBeast",
    "lacksDomain",
    "lacksFlag",
    "lacksTrait",
    "levelAtLeast",
    "soulBonePartCountBelow",
    "talentGradeAtLeast"
]);

const EFFECT_TYPE_SET = new Set(APK_EFFECT_TYPES);
const REQUIREMENT_TYPE_SET = new Set(APK_REQUIREMENT_TYPES);
const TALENT_GRADE_ORDER = Object.freeze([
    "F",
    "E",
    "D",
    "C",
    "B",
    "A",
    "S",
    "god-level",
    "神级天赋"
]);

function isPlainObject(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return false;
    }

    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
}

function clone(value) {
    if (value === undefined) {
        return undefined;
    }
    return JSON.parse(JSON.stringify(value));
}

function getEffectObject(effectRecord) {
    return effectRecord?.normalized?.effect
        ?? effectRecord?.effect
        ?? effectRecord;
}

function getRequirementObject(requirementRecord) {
    return requirementRecord?.normalized?.requirement
        ?? requirementRecord?.requirement
        ?? requirementRecord;
}

function getRequirementType(requirementRecord) {
    const requirement = getRequirementObject(requirementRecord);
    return requirement?.type
        ?? requirementRecord?.normalized?.requirementType
        ?? requirementRecord?.requirementType
        ?? null;
}

function getNumericValue(value) {
    if (Number.isFinite(value)) {
        return value;
    }
    if (isPlainObject(value)) {
        for (const key of ["value", "amount", "copper", "minimum", "threshold"]) {
            if (Number.isFinite(value[key])) {
                return value[key];
            }
        }
    }
    return null;
}

function getPlayerSoulBone(player, part) {
    const soulBones = player?.soulBones;
    if (Array.isArray(soulBones)) {
        return soulBones.find(bone => (
            bone?.partId === part
            || bone?.id === part
        ));
    }
    if (!isPlainObject(soulBones)) {
        return undefined;
    }
    return soulBones[part];
}

function getPlayerSoulBonePartCount(player, part) {
    const soulBones = player?.soulBones;
    if (Array.isArray(soulBones)) {
        return soulBones.filter(bone => (
            bone?.partId === part
            || bone?.id === part
        )).length;
    }
    if (!isPlainObject(soulBones)) return null;
    const value = soulBones[part];
    if (Array.isArray(value)) return value.length;
    return value && value.equipmentState !== "empty" ? 1 : 0;
}

function hasAnySoulBone(player) {
    const soulBones = player?.soulBones;
    if (Array.isArray(soulBones)) {
        return soulBones.length > 0;
    }
    if (!isPlainObject(soulBones)) {
        return null;
    }
    return Object.values(soulBones).some(value => (
        isPlainObject(value)
        && value.equipmentState !== "empty"
        && (value.years !== null || value.id !== null)
    ));
}

function hasAttribute(player, attributeId) {
    const attributes = Array.isArray(player?.attributes)
        ? player.attributes
        : player?.combatAttributes;
    if (!Array.isArray(attributes)) {
        return null;
    }
    return attributes.some(attribute => (
        attribute === attributeId
        || attribute?.id === attributeId
        || attribute?.attributeId === attributeId
    ));
}

function getTalentGrade(player) {
    return player?.talentProgression?.talentGrade
        ?? player?.talentGrade
        ?? null;
}

function getCopper(player) {
    if (Number.isFinite(player?.wallet?.copper)) {
        return player.wallet.copper;
    }
    if (Number.isFinite(player?.money)) {
        return player.money;
    }
    return null;
}

function getRequirementValue(requirement, keys = []) {
    for (const key of keys) {
        if (requirement && Object.prototype.hasOwnProperty.call(requirement, key)) {
            return requirement[key];
        }
    }
    return null;
}

function getBeast(player) {
    return isPlainObject(player?.beast) ? player.beast : null;
}

function getInventoryCount(player, category, itemId) {
    if (!isPlainObject(player?.flags)) {
        return null;
    }
    const key = `formal:inventory:${category}:${itemId}`;
    const count = Number(player.flags[key] ?? 0);
    return Number.isFinite(count) ? count : 0;
}

function getCompleteLawCount(player) {
    const traits = Array.isArray(player?.traits) ? player.traits : null;
    const beastLaws = Array.isArray(player?.beast?.laws)
        ? player.beast.laws
        : [];
    if (!traits && !Array.isArray(player?.beast?.laws)) {
        return null;
    }
    const traitLaws = (traits ?? []).filter(trait => (
        typeof trait === "string" && trait.endsWith(".complete-law")
    ));
    return new Set([...traitLaws, ...beastLaws]).size;
}

function evaluateAnyOf(requirements, player) {
    if (!Array.isArray(requirements) || requirements.length === 0) {
        return {
            status: "unresolved",
            reason: "anyOf requires a non-empty conditions array."
        };
    }

    const results = requirements.map(requirement => (
        evaluateApkRequirement(requirement, player)
    ));

    if (results.some(result => result.status === "met")) {
        return {
            status: "met",
            children: results
        };
    }
    if (results.every(result => result.status === "not_met")) {
        return {
            status: "not_met",
            children: results
        };
    }
    return {
        status: "unresolved",
        reason: "At least one anyOf branch requires an unmapped Player v2 field.",
        children: results
    };
}

export function getApkAvailability(record) {
    if (!isPlainObject(record?.availability)) {
        return {
            policy: "unresolved",
            enabled: null
        };
    }
    return clone(record.availability);
}

export function isApkRecordSelectable(
    record,
    {
        includeDisabled = false,
        routeStates = null,
        sourceLayers = null,
        contentStatuses = null
    } = {}
) {
    const availability = getApkAvailability(record);

    if (!includeDisabled && availability.enabled !== true) {
        return false;
    }
    if (routeStates && !routeStates.has(availability.routeState)) {
        return false;
    }
    if (sourceLayers && !sourceLayers.has(availability.sourceLayer)) {
        return false;
    }
    if (contentStatuses && !contentStatuses.has(availability.contentStatus)) {
        return false;
    }

    return true;
}

export function selectApkRecords(records, options = {}) {
    if (!Array.isArray(records)) {
        throw new TypeError("selectApkRecords requires an array.");
    }

    return records.filter(record => (
        isApkRecordSelectable(record, options)
    ));
}

export function summarizeApkAvailability(records, field) {
    if (!Array.isArray(records)) {
        throw new TypeError("summarizeApkAvailability requires an array.");
    }

    const counts = {};
    records.forEach(record => {
        const value = getApkAvailability(record)[field] ?? "";
        counts[value] = (counts[value] ?? 0) + 1;
    });
    return counts;
}

export function validateApkCanonicalCatalog(catalog) {
    const errors = [];
    const ids = new Set();

    if (!isPlainObject(catalog)) {
        return {
            valid: false,
            errors: ["Catalog must be a plain object."],
            recordCount: 0,
            enabledCount: 0
        };
    }

    if (catalog.schemaVersion !== "apk-canonical-catalog/1.0") {
        errors.push("Unsupported APK canonical catalog schema.");
    }
    if (catalog.ownerAuthorization !== "confirmed") {
        errors.push("Catalog owner authorization is not confirmed.");
    }
    if (!Array.isArray(catalog.records)) {
        errors.push("Catalog records must be an array.");
    }

    const records = Array.isArray(catalog.records) ? catalog.records : [];
    records.forEach((record, index) => {
        const path = "records[" + index + "]";
        if (!isPlainObject(record)) {
            errors.push(path + " must be an object.");
            return;
        }
        if (typeof record.id !== "string" || record.id.length === 0) {
            errors.push(path + ".id must be a non-empty string.");
        } else if (ids.has(record.id)) {
            errors.push(path + ".id is duplicated.");
        } else {
            ids.add(record.id);
        }
        if (record.ownerAuthorization !== "confirmed") {
            errors.push(path + ".ownerAuthorization is not confirmed.");
        }
        if (!isPlainObject(record.sourceRef)
            || typeof record.sourceRef.path !== "string"
            || typeof record.sourceRef.sha256 !== "string"
            || typeof record.sourceRef.sourceId !== "string") {
            errors.push(path + ".sourceRef is incomplete.");
        }
        if (record.availability?.policy !== "preserve_apk_original_state") {
            errors.push(path + ".availability policy is not preserved.");
        }
    });

    if (catalog.recordCount !== records.length) {
        errors.push("recordCount does not match records.length.");
    }

    return {
        valid: errors.length === 0,
        errors,
        recordCount: records.length,
        uniqueIdCount: ids.size,
        enabledCount: records.filter(record => (
            record.availability?.enabled === true
        )).length
    };
}

export function validateApkCanonicalPackage({ index, catalogs } = {}) {
    const errors = [];
    const catalogResults = {};

    if (!isPlainObject(index)
        || index.schemaVersion !== "apk-canonical-package/1.0") {
        errors.push("Invalid APK canonical package index.");
    }
    if (!isPlainObject(catalogs)) {
        errors.push("APK canonical package catalogs must be an object.");
    }

    const safeCatalogs = isPlainObject(catalogs) ? catalogs : {};
    for (const [name, expectedCount] of Object.entries(index?.counts ?? {})) {
        const catalog = safeCatalogs[name];
        const result = validateApkCanonicalCatalog(catalog);
        catalogResults[name] = result;
        if (!result.valid) {
            errors.push(
                name + " has " + String(result.errors.length) + " validation errors."
            );
        }
        if (result.recordCount !== expectedCount) {
            errors.push(
                name + " expected "
                + String(expectedCount)
                + " records but found "
                + String(result.recordCount)
                + "."
            );
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        catalogResults
    };
}

export function classifyApkEffect(effectRecord) {
    const effect = getEffectObject(effectRecord);
    const type = effect?.type
        ?? effectRecord?.normalized?.effectType
        ?? effectRecord?.effectType
        ?? null;

    if (!EFFECT_TYPE_SET.has(type)) {
        return {
            status: "unknown",
            type,
            source: clone(effectRecord)
        };
    }

    let status = "requires_typed_state";
    if (["death", "ending"].includes(type)) {
        status = "terminal_control";
    } else if ([
        "changeLevel",
        "setLevel",
        "changeCurrency",
        "setFlag",
        "setInnatePower",
        "setTalentGrade"
    ].includes(type)) {
        status = "player_scalar_or_flag_candidate";
    } else if ([
        "addArtifact",
        "addDomainEmbryo",
        "addDomainSeed",
        "addTitle"
    ].includes(type)) {
        status = "player_collection_candidate";
    }

    return {
        status,
        type,
        source: clone(effect)
    };
}

export function summarizeApkEffects(effectRecords) {
    if (!Array.isArray(effectRecords)) {
        throw new TypeError("summarizeApkEffects requires an array.");
    }

    const summary = {};
    effectRecords.forEach(record => {
        const classification = classifyApkEffect(record);
        const key = classification.type ?? "unknown";
        if (!summary[key]) {
            summary[key] = {
                count: 0,
                status: classification.status
            };
        }
        summary[key].count += 1;
    });
    return summary;
}

export function evaluateApkRequirement(requirementRecord, player = {}) {
    const requirement = getRequirementObject(requirementRecord);
    const type = getRequirementType(requirementRecord);

    if (!REQUIREMENT_TYPE_SET.has(type)) {
        return {
            status: "unresolved",
            requirementType: type,
            reason: "Unknown APK requirement type."
        };
    }

    const value = requirement?.value
        ?? requirement?.minimum
        ?? requirement?.amount
        ?? requirement?.grade
        ?? requirement?.gender
        ?? null;

    switch (type) {
        case "anyOf":
            return {
                requirementType: type,
                ...evaluateAnyOf(
                    requirement.conditions ?? requirement.options,
                    player
                )
            };
        case "lacksFlag":
            return {
                status: player.flags?.[value] ? "not_met" : "met",
                requirementType: type
            };
        case "lacksDomain": {
            if (!Array.isArray(player?.domains)) {
                return {
                    status: "unresolved",
                    requirementType: type,
                    reason: "APK domain state is not present."
                };
            }
            return {
                status: player.domains.includes(value) ? "not_met" : "met",
                requirementType: type
            };
        }
        case "levelAtLeast":
            return {
                status: Number.isFinite(player.level) && player.level >= value
                    ? "met"
                    : Number.isFinite(player.level) ? "not_met" : "unresolved",
                requirementType: type
            };
        case "talentGradeAtLeast": {
            const playerIndex = TALENT_GRADE_ORDER.indexOf(getTalentGrade(player));
            const requiredIndex = TALENT_GRADE_ORDER.indexOf(value);
            return {
                status: playerIndex < 0 || requiredIndex < 0
                    ? "unresolved"
                    : playerIndex >= requiredIndex ? "met" : "not_met",
                requirementType: type
            };
        }
        case "currencyAtLeast":
        case "currencyBelow": {
            const copper = getCopper(player);
            if (!Number.isFinite(copper)) {
                return {
                    status: "unresolved",
                    requirementType: type,
                    reason: "APK copper state is not present."
                };
            }
            const threshold = getNumericValue({
                value: getRequirementValue(requirement, ["copper", "amount", "minimum", "value"])
            });
            if (!Number.isFinite(threshold)) {
                return {
                    status: "unresolved",
                    requirementType: type,
                    reason: "Currency threshold is not numeric."
                };
            }
            return {
                status: type === "currencyAtLeast"
                    ? copper >= threshold ? "met" : "not_met"
                    : copper < threshold ? "met" : "not_met",
                requirementType: type
            };
        }
        case "hasAnySoulBone": {
            const result = hasAnySoulBone(player);
            return {
                status: result === null
                    ? "unresolved"
                    : result ? "met" : "not_met",
                requirementType: type
            };
        }
        case "hasSoulBonePart": {
            const bone = getPlayerSoulBone(player, value);
            return {
                status: bone === undefined
                    ? "unresolved"
                    : bone && bone.equipmentState !== "empty"
                        ? "met"
                        : "not_met",
                requirementType: type
            };
        }
        case "soulBonePartCountBelow": {
            const partId = requirement.partId ?? value;
            const count = getPlayerSoulBonePartCount(player, partId);
            const threshold = getNumericValue(requirement);
            return {
                status: count === null || !Number.isFinite(threshold)
                    ? "unresolved"
                    : count < threshold ? "met" : "not_met",
                requirementType: type
            };
        }
        case "hasAttribute": {
            const result = hasAttribute(player, value);
            return {
                status: result === null
                    ? "unresolved"
                    : result ? "met" : "not_met",
                requirementType: type
            };
        }
        case "lacksTrait": {
            if (!Array.isArray(player?.traits)) {
                return {
                    status: "unresolved",
                    requirementType: type,
                    reason: "APK traits state is not present."
                };
            }
            return {
                status: player.traits.includes(value) ? "not_met" : "met",
                requirementType: type
            };
        }
        case "hasBeastNameSuffix": {
            const beast = getBeast(player);
            if (!beast) {
                return {
                    status: player?.route === "beast" ? "not_met" : "unresolved",
                    requirementType: type,
                    reason: player?.route === "beast"
                        ? "Current APK beast has no matching suffix."
                        : "APK beast state is not present."
                };
            }
            return {
                status: beast.nameSuffixes?.includes(value)
                    ? "met"
                    : "not_met",
                requirementType: type
            };
        }
        case "beastNameSuffixCountAtLeast": {
            const beast = getBeast(player);
            if (!beast) {
                return {
                    status: player?.route === "beast" ? "not_met" : "unresolved",
                    requirementType: type,
                    reason: "APK beast state is not present."
                };
            }
            const suffixes = Array.isArray(requirement.suffixes)
                ? requirement.suffixes
                : null;
            const actual = new Set(beast.nameSuffixes ?? []);
            const count = suffixes
                ? new Set(suffixes.filter(suffix => actual.has(suffix))).size
                : actual.size;
            return {
                status: count >= getNumericValue(requirement)
                    ? "met"
                    : "not_met",
                requirementType: type
            };
        }
        case "inventoryAtLeast":
        case "inventoryBelow": {
            const category = requirement.category ?? "item";
            const itemId = requirement.itemId ?? requirement.value;
            const count = getInventoryCount(player, category, itemId);
            const threshold = getNumericValue({
                value: requirement.amount ?? requirement.minimum ?? requirement.value
            });
            if (!Number.isFinite(count) || !Number.isFinite(threshold)) {
                return {
                    status: "unresolved",
                    requirementType: type,
                    reason: "APK inventory requirement is incomplete."
                };
            }
            return {
                status: type === "inventoryAtLeast"
                    ? count >= threshold ? "met" : "not_met"
                    : count < threshold ? "met" : "not_met",
                requirementType: type
            };
        }
        case "isDragonBeast": {
            if (!isPlainObject(player?.flags)
                || !Object.prototype.hasOwnProperty.call(
                    player.flags,
                    "beastHasDragonBloodline"
                )) {
                return {
                    status: "unresolved",
                    requirementType: type,
                    reason: "APK dragon-bloodline flag is not present."
                };
            }
            return {
                status: player.flags.beastHasDragonBloodline
                    ? "met"
                    : "not_met",
                requirementType: type
            };
        }
        case "completeLawCountAtLeast": {
            const count = getCompleteLawCount(player);
            const threshold = getNumericValue(requirement);
            return {
                status: count === null || !Number.isFinite(threshold)
                    ? "unresolved"
                    : count >= threshold ? "met" : "not_met",
                requirementType: type
            };
        }
        case "counterAtLeast": {
            if (!isPlainObject(player?.flags)) {
                return {
                    status: "unresolved",
                    requirementType: type,
                    reason: "APK counter flags are not present."
                };
            }
            const count = Number(player.flags[requirement.key] ?? 0);
            const threshold = getNumericValue(requirement);
            return {
                status: Number.isFinite(count) && Number.isFinite(threshold)
                    && count >= threshold ? "met" : "not_met",
                requirementType: type
            };
        }
        case "genderOptionIs": {
            const gender = player?.gender;
            if (gender === undefined || gender === null) {
                return {
                    status: "unresolved",
                    requirementType: type,
                    reason: "APK gender selection is not present."
                };
            }
            const actual = gender?.optionId ?? gender;
            return {
                status: actual === value ? "met" : "not_met",
                requirementType: type
            };
        }
        default:
            return {
                status: "unresolved",
                requirementType: type,
                reason: "Requirement adapter branch is not implemented."
            };
    }
}

export function summarizeApkRequirements(requirementRecords) {
    if (!Array.isArray(requirementRecords)) {
        throw new TypeError("summarizeApkRequirements requires an array.");
    }

    const summary = {};
    requirementRecords.forEach(record => {
        const type = getRequirementType(record) ?? "unknown";
        if (!summary[type]) {
            summary[type] = {
                count: 0,
                evaluator: "typed_status_result"
            };
        }
        summary[type].count += 1;
    });
    return summary;
}
