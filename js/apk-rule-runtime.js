import {
    APK_CONTENT_ADAPTER_VERSION,
    APK_EFFECT_TYPES,
    evaluateApkRequirement
} from "./apk-content-adapter.js";
import { clonePlayerStateValue } from "./player-v2.js";

export const APK_RULE_RUNTIME_VERSION = "apk-rule-runtime/1.0";
export const APK_CHARACTER_SCHEMA_VERSION = "apk-character/1.0";
export const APK_SESSION_SCHEMA_VERSION = "apk-session/1.0";
export const APK_RANDOM_ALGORITHM = "pcg32-counter-v1";

const UINT32_RANGE = 4294967296;
const ANNUAL_GOLD = 10000;
const ANNUAL_COPPER = 100;
const NPC_PROTAGONIST_ID = "douluo2:npc.huo";

const SOURCE_RUNTIME_EFFECT_TYPES = Object.freeze([
    "setRoute",
    "setTimelineEra",
    "setBeastPeriod",
    "setGender",
    "setAppearance",
    "setStoryTime",
    "setStoryBranch",
    "setAge",
    "setFaction",
    "setIdentity",
    "setOrigin",
    "setAffiliation",
    "archiveCompletedGodTrial",
    "prepareHumanSoulRing",
    "setAdditionalSoulRingBatch",
    "removeTrait",
    "deleteFlag",
    "advanceHumanTime",
    "advanceBeastTime"
]);

export const APK_RUNTIME_EFFECT_TYPES = Object.freeze([
    ...new Set([...APK_EFFECT_TYPES, ...SOURCE_RUNTIME_EFFECT_TYPES])
]);

function isPlainObject(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return false;
    }
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
}

function clone(value) {
    return value === undefined ? undefined : clonePlayerStateValue(value);
}

function fail(code, message, details = {}) {
    throw new ApkRuleRuntimeError(code, message, details);
}

function ensureArray(state, key) {
    if (!Array.isArray(state[key])) {
        state[key] = [];
    }
    return state[key];
}

function ensureMap(state, key) {
    if (!isPlainObject(state[key])) {
        state[key] = {};
    }
    return state[key];
}

function ensureWallet(state) {
    if (!isPlainObject(state.wallet)) {
        state.wallet = { copper: 0, transactions: [] };
    }
    if (!Number.isFinite(state.wallet.copper)) {
        state.wallet.copper = 0;
    }
    if (!Array.isArray(state.wallet.transactions)) {
        state.wallet.transactions = [];
    }
    return state.wallet;
}

function setCopper(state, copper) {
    const wallet = ensureWallet(state);
    wallet.copper = Math.max(0, Math.trunc(copper));
    state.money = wallet.copper;
}

function getFlagNumber(state, key) {
    const value = Number(ensureMap(state, "flags")[key] ?? 0);
    return Number.isFinite(value) ? value : 0;
}

function setFlagNumber(state, key, value) {
    ensureMap(state, "flags")[key] = Number.isFinite(value) ? value : 0;
}

function addFlagNumber(state, key, amount) {
    setFlagNumber(state, key, getFlagNumber(state, key) + amount);
}

function createBeastState() {
    return {
        period: null,
        realm: null,
        type: null,
        species: null,
        area: null,
        chronologicalAge: 0,
        bloodlines: [],
        bloodlineComponents: [],
        elementProgress: null,
        attributeStages: {},
        laws: [],
        tribulationsPassed: [],
        evolvedThresholds: [],
        plotDone: [],
        beastGod: false,
        deathShields: 0,
        pseudoReverseShield: null,
        namePrefixes: [],
        nameSuffixes: [],
        lightningShields: [],
        interactions: {},
        godTrialQualification: null
    };
}

export function createApkCharacterState(route = "human") {
    const character = {
        schemaVersion: APK_CHARACTER_SCHEMA_VERSION,
        route,
        wallet: { copper: 0, transactions: [] },
        entrySelections: {
            route: null,
            worldLine: null,
            mainLine: null,
            period: null,
            periodPoolId: null
        },
        age: route === "transformed" ? 6 : 0,
        level: route === "beast" ? 0 : 1,
        maxLevel: 99,
        beastYears: route === "beast" ? 135 : 0,
        timelineEra: null,
        gender: null,
        appearance: null,
        appearanceRank: null,
        storyTime: null,
        timelineAge: null,
        elapsedYears: 0,
        npcAges: {},
        npcRelationships: {},
        innatePower: null,
        innateSoulPower: null,
        initialPowerResult: null,
        talentGrade: null,
        talentProgression: {
            talentGrade: null,
            ordinaryGrowthLocked: false,
            unresolvedTalentGrade: true
        },
        faction: null,
        storyBranch: null,
        branchStartTimelineAge: null,
        beast: route === "beast" ? createBeastState() : null,
        beastOrigin: null,
        godTrial: null,
        godTrials: [],
        seaTrial: null,
        pendingRing: null,
        additionalSoulRingBatch: null,
        martialSoulTalents: [],
        talents: [],
        martialSouls: [],
        bloodlines: [],
        attributes: [],
        combatAttributes: [],
        elementProgress: {},
        soulBones: [],
        skills: [],
        artifacts: [],
        traits: [],
        titles: [],
        domains: [],
        godhood: null,
        godhoods: [],
        ending: null,
        flags: {},
        money: 0,
        logs: [],
        transactions: []
    };
    return character;
}

export function createApkSession({
    seed,
    route = "human",
    character,
    contentPackId = "douluo1",
    cursor = 0
} = {}) {
    if (typeof seed !== "string" || seed.length === 0) {
        fail("INVALID_APK_SEED", "APK session seed must be a non-empty string.");
    }
    if (!Number.isSafeInteger(cursor) || cursor < 0) {
        fail("INVALID_APK_RANDOM_CURSOR", "APK random cursor must be non-negative.");
    }
    return {
        schemaVersion: APK_SESSION_SCHEMA_VERSION,
        character: clone(character ?? createApkCharacterState(route)),
        currentPoolId: null,
        pendingNextStepId: null,
        pendingFollowUps: [],
        awaitingAdvance: false,
        random: {
            seed,
            cursor,
            algorithm: APK_RANDOM_ALGORITHM
        },
        timeline: [],
        finished: false,
        forcedResults: {},
        forcedResultSources: {},
        lastResolvedSpin: null,
        history: [],
        packId: contentPackId
    };
}

function hashSeed(seed) {
    let value = (1779033703 ^ seed.length) >>> 0;
    for (let index = 0; index < seed.length; index += 1) {
        value = Math.imul(value ^ seed.charCodeAt(index), 3432918353);
        value = (value << 13) | (value >>> 19);
    }
    value = Math.imul(value ^ (value >>> 16), 2246822507);
    value = Math.imul(value ^ (value >>> 13), 3266489909);
    return (value ^ (value >>> 16)) >>> 0;
}

function mixUint32(value) {
    const first = (Math.imul(value >>> 0, 747796405) + 2891336453) >>> 0;
    const second = Math.imul(
        ((first >>> ((first >>> 28) + 4)) ^ first) >>> 0,
        277803737
    ) >>> 0;
    return ((second >>> 22) ^ second) >>> 0;
}

function pcg32At(seed, cursor) {
    if (!Number.isSafeInteger(cursor) || cursor < 0) {
        fail("INVALID_APK_RANDOM_CURSOR", "APK random cursor must be non-negative.");
    }
    const low = cursor >>> 0;
    const high = Math.floor(cursor / UINT32_RANGE) >>> 0;
    const mixed = (
        hashSeed(seed)
        + low
        + Math.imul(high, 2654435769)
    ) >>> 0;
    return mixUint32(mixed) / UINT32_RANGE;
}

export function nextApkRandom(random) {
    if (!isPlainObject(random)
        || typeof random.seed !== "string"
        || random.seed.length === 0) {
        fail("INVALID_APK_RANDOM_STATE", "APK random state is incomplete.");
    }
    if (random.algorithm !== APK_RANDOM_ALGORITHM) {
        fail(
            "UNSUPPORTED_APK_RANDOM_ALGORITHM",
            `Unsupported APK random algorithm "${String(random.algorithm)}".`
        );
    }
    const value = pcg32At(random.seed, random.cursor);
    random.cursor += 1;
    return value;
}

export function createApkRandom(seed, cursor = 0) {
    const random = {
        seed,
        cursor,
        algorithm: APK_RANDOM_ALGORITHM
    };
    return {
        next() {
            return nextApkRandom(random);
        },
        get cursor() {
            return random.cursor;
        },
        get seed() {
            return random.seed;
        },
        get algorithm() {
            return random.algorithm;
        },
        snapshot() {
            return clone(random);
        }
    };
}

function getNormalized(record) {
    return record?.normalized ?? record;
}

function getPoolId(record) {
    return getNormalized(record)?.pool_id
        ?? getNormalized(record)?.poolId
        ?? record?.availability?.poolId
        ?? null;
}

function getOptionText(record) {
    const normalized = getNormalized(record);
    return normalized?.text ?? normalized?.display_name ?? record?.id ?? "";
}

function getOptionWeight(record) {
    const value = Number(getNormalized(record)?.weight);
    return Number.isFinite(value) ? value : 0;
}

function getOptionRequirements(record) {
    const requirements = getNormalized(record)?.requirements;
    return Array.isArray(requirements) ? requirements : [];
}

function getOptionEffects(record) {
    const effects = getNormalized(record)?.effects;
    return Array.isArray(effects) ? effects : [];
}

function getOptionRerollWhen(record) {
    const values = getNormalized(record)?.reroll_when;
    return Array.isArray(values) ? values : [];
}

function getContentStatus(record) {
    return record?.availability?.contentStatus
        ?? getNormalized(record)?.content_status
        ?? null;
}

function requirementStatuses(requirements, character) {
    return requirements.map(requirement => (
        evaluateApkRequirement(requirement, character)
    ));
}

function allRequirementsMet(requirements, character) {
    const results = requirementStatuses(requirements, character);
    return {
        met: results.every(result => result.status === "met"),
        unresolved: results.filter(result => result.status === "unresolved"),
        results
    };
}

export function createApkContentIndex({ pools, options } = {}) {
    const poolRecords = Array.isArray(pools?.records) ? pools.records : pools;
    const optionRecords = Array.isArray(options?.records) ? options.records : options;
    if (!Array.isArray(poolRecords) || !Array.isArray(optionRecords)) {
        fail(
            "INVALID_APK_CONTENT_INDEX",
            "APK content index requires pool and option records."
        );
    }

    const poolsById = new Map();
    const optionsByPoolId = new Map();
    poolRecords.forEach(pool => {
        const poolId = getPoolId(pool);
        if (typeof poolId === "string" && poolId.length > 0) {
            poolsById.set(poolId, pool);
        }
    });
    optionRecords.forEach(option => {
        const poolId = getPoolId(option);
        if (!optionsByPoolId.has(poolId)) {
            optionsByPoolId.set(poolId, []);
        }
        optionsByPoolId.get(poolId).push(option);
    });

    return {
        pools: poolRecords,
        options: optionRecords,
        getPool(poolId) {
            return poolsById.get(poolId) ?? null;
        },
        getOptions(poolId) {
            return [...(optionsByPoolId.get(poolId) ?? [])];
        }
    };
}

function isSourceSelectable(record, includeDisabled) {
    if (!includeDisabled && record?.availability?.enabled !== true) {
        return false;
    }
    if (getContentStatus(record) === "staging") {
        return false;
    }
    return getOptionWeight(record) > 0;
}

export function selectApkPoolOptions(
    contentIndex,
    character,
    poolId,
    {
        includeDisabled = false,
        excludeOptionIds = [],
        excludeRerolled = true
    } = {}
) {
    const pool = contentIndex.getPool(poolId);
    if (!pool) {
        fail("APK_POOL_NOT_FOUND", `APK pool "${poolId}" does not exist.`);
    }
    const excluded = new Set(excludeOptionIds);
    const details = [];
    const options = contentIndex.getOptions(poolId).filter(option => {
        if (!isSourceSelectable(option, includeDisabled)) return false;
        if (excluded.has(getNormalized(option)?.option_id ?? option.availability?.optionId)) {
            return false;
        }
        const requirementResult = allRequirementsMet(
            getOptionRequirements(option),
            character
        );
        if (!requirementResult.met) {
            if (requirementResult.unresolved.length > 0) {
                details.push({
                    optionId: getNormalized(option)?.option_id ?? option.id,
                    status: "unresolved",
                    requirements: requirementResult.results
                });
            }
            return false;
        }
        if (excludeRerolled) {
            const rerollWhen = getOptionRerollWhen(option);
            if (rerollWhen.length > 0) {
                const reroll = allRequirementsMet(rerollWhen, character);
                if (reroll.met) return false;
            }
        }
        return true;
    });
    return {
        pool,
        options,
        unresolved: details
    };
}

function randomValueFrom(random) {
    if (typeof random === "function") {
        const value = random();
        if (!Number.isFinite(value) || value < 0 || value > 1) {
            fail("INVALID_APK_RANDOM_VALUE", "APK RNG must return a value in [0, 1].");
        }
        return value;
    }
    if (random && typeof random.next === "function") {
        return random.next();
    }
    if (isPlainObject(random)) {
        return nextApkRandom(random);
    }
    fail("INVALID_APK_RNG", "APK pool draw requires a function or random state.");
}

export function drawApkPool({
    contentIndex,
    character,
    poolId,
    random,
    excludeOptionIds = [],
    includeDisabled = false,
    excludeRerolled = true
} = {}) {
    const selection = selectApkPoolOptions(
        contentIndex,
        character,
        poolId,
        { excludeOptionIds, includeDisabled, excludeRerolled }
    );
    if (selection.options.length === 0) {
        fail(
            "APK_POOL_HAS_NO_ELIGIBLE_OPTIONS",
            `APK pool "${poolId}" has no eligible options.`,
            { unresolved: selection.unresolved }
        );
    }

    const totalWeight = selection.options.reduce(
        (total, option) => total + getOptionWeight(option),
        0
    );
    const randomValue = randomValueFrom(random);
    const threshold = randomValue * totalWeight;
    let cursor = 0;
    let selected = selection.options.at(-1);
    for (const option of selection.options) {
        cursor += getOptionWeight(option);
        if (cursor >= threshold) {
            selected = option;
            break;
        }
    }
    return {
        pool: clone(selection.pool),
        option: clone(selected),
        options: clone(selection.options),
        unresolved: clone(selection.unresolved),
        totalWeight,
        randomValue,
        eligibleCount: selection.options.length,
        optionId: getNormalized(selected)?.option_id ?? selected.id,
        text: getOptionText(selected)
    };
}

function getEffectObject(effectRecord) {
    return effectRecord?.normalized?.effect
        ?? effectRecord?.effect
        ?? effectRecord;
}

function ensureTalentProgression(state) {
    if (!isPlainObject(state.talentProgression)) {
        state.talentProgression = {
            talentGrade: null,
            ordinaryGrowthLocked: false,
            unresolvedTalentGrade: true
        };
    }
    return state.talentProgression;
}

function talentGradeFromPower(value) {
    if (value === null || value === undefined) return null;
    if (value === 0) return "F";
    if (value === 1) return "E";
    if (value === 2 || value === 3) return "D";
    if (value === 4 || value === 5) return "C";
    if (value === 6 || value === 7) return "B";
    if (value === 8 || value === 9) return "A";
    if (value === 10) return "S";
    if (value === 20) return "divine";
    return null;
}

function clampLevel(state, value) {
    const flags = ensureMap(state, "flags");
    const minimum = flags.noSoulPower ? 0 : 1;
    let maximum = Number.isFinite(state.maxLevel) ? state.maxLevel : 99;
    if (state.martialSouls.some(soul => soul.passives?.includes("levelCap:29"))
        && !flags.immortalHerb
        && !state.traits.includes("innate-dao-body")) {
        maximum = Math.min(maximum, 29);
    }
    return Math.max(minimum, Math.min(maximum, Math.trunc(value)));
}

function canSetLevel(state, value) {
    return !ensureMap(state, "flags").noSoulPower || value <= state.level;
}

function consumeLevelLossShield(state) {
    const entries = Object.entries(ensureMap(state, "flags"))
        .filter(([key, value]) => {
            if (!key.startsWith("formal:level-loss-shield:") || Number(value ?? 0) < 1) {
                return false;
            }
            const maximum = Number(key.split(":")[2]);
            return !Number.isFinite(maximum) || state.level <= maximum;
        });
    const entry = entries[0];
    if (!entry) return false;
    setFlagNumber(state, entry[0], Math.max(0, Number(entry[1]) - 1));
    ensureMap(state, "flags")["formal:last-level-loss-prevented"] = entry[0];
    return true;
}

function consumeDeathShield(state) {
    const entries = Object.entries(ensureMap(state, "flags"))
        .filter(([key, value]) => {
            if (!key.startsWith("formal:death-shield:") || Number(value ?? 0) < 1) {
                return false;
            }
            const maximum = Number(key.split(":")[2]);
            return !Number.isFinite(maximum) || state.level <= maximum;
        })
        .sort(([left], [right]) => {
            const leftReset = left.includes(":reset-human-cultivation:") ? 1 : 0;
            const rightReset = right.includes(":reset-human-cultivation:") ? 1 : 0;
            return leftReset - rightReset || left.localeCompare(right);
        });
    const entry = entries[0];
    if (!entry) return false;
    setFlagNumber(state, entry[0], Math.max(0, Number(entry[1]) - 1));
    if (entry[0].includes(":reset-human-cultivation:")) {
        state.level = Math.max(
            ensureMap(state, "flags").noSoulPower ? 0 : 1,
            1
        );
        state.soulBones = [];
        state.martialSouls.forEach(soul => {
            soul.rings = [];
        });
    }
    ensureMap(state, "flags")["formal:last-death-prevented"] = entry[0];
    return true;
}

function ensureBeast(state) {
    if (!isPlainObject(state.beast)) {
        state.beast = createBeastState();
    }
    return state.beast;
}

function advanceElement(state, elementId, amount = 1, beast = false) {
    const normalized = String(elementId ?? "").trim();
    if (!normalized) return;
    if (beast) {
        const target = ensureBeast(state);
        const current = target.attributeStages[normalized] ?? 0;
        const next = Math.max(0, Math.min(4, Math.trunc(current + amount)));
        target.attributeStages[normalized] = next;
        target.elementProgress = {
            elementId: normalized,
            consecutiveCount: next,
            stage: next >= 4
                ? "complete-law"
                : next === 3 ? "law-seed" : next === 2 ? "ultimate" : "normal"
        };
        if (next >= 1 && !target.bloodlines.includes(normalized)) {
            target.bloodlines.push(normalized);
        }
        if (next >= 4 && !target.laws.includes(`douluo2:law.${normalized}`)) {
            target.laws.push(`douluo2:law.${normalized}`);
        }
        return;
    }
    const current = Number(ensureMap(state, "elementProgress")[normalized] ?? 0);
    const next = Math.max(0, Math.min(4, Math.trunc(current + amount)));
    ensureMap(state, "elementProgress")[normalized] = next;
    if (next > 0 && !state.attributes.includes(normalized)) {
        state.attributes.push(normalized);
    }
    const prefix = `formal:element.${normalized}.`;
    state.traits = state.traits.filter(trait => !trait.startsWith(prefix));
    if (next === 2) state.traits.push(`${prefix}ultimate`);
    if (next === 3) state.traits.push(`${prefix}law-seed`);
    if (next === 4) state.traits.push(`${prefix}complete-law`);
}

function getSoulBonePartId(bone) {
    return bone?.partId ?? bone?.id ?? null;
}

function getSoulBoneCount(state, partId = null, external = false) {
    const bones = Array.isArray(state.soulBones) ? state.soulBones : [];
    if (partId === null) return bones.length;
    return bones.filter(bone => {
        if (external) return getSoulBonePartId(bone) === "external";
        return getSoulBonePartId(bone) === partId || bone?.id === partId;
    }).length;
}

function annualIncomeForLevel(level) {
    const normalized = Math.max(1, Math.trunc(level));
    if (normalized >= 100) return ANNUAL_GOLD;
    if (normalized >= 91) return ANNUAL_COPPER;
    return Math.ceil(normalized / 10) * 10;
}

function beastTimeIncome(startYears, cultivationDelta, years) {
    let total = 0;
    for (let index = 0; index < years; index += 1) {
        const current = Math.max(
            0,
            startYears + Math.floor((cultivationDelta * index) / Math.max(1, years))
        );
        const value = current >= 1000000
            ? 100 * ANNUAL_GOLD
            : current >= 100000
                ? ANNUAL_GOLD
                : current >= 10000
                    ? 10 * ANNUAL_COPPER
                    : current >= 1000
                        ? ANNUAL_COPPER
                        : current >= 100
                            ? 10
                            : current >= 10 ? 1 : 0;
        total += value;
    }
    return total;
}

function finalizeState(state) {
    const flags = ensureMap(state, "flags");
    const unlockPrefix = "formal:domain-embryo-unlock:";
    for (const [key, unlockLevel] of Object.entries(flags)) {
        if (key.startsWith(unlockPrefix) && state.level >= Number(unlockLevel)) {
            addFlagNumber(state, "formal:domain-draws", 1);
            delete flags[key];
        }
    }
    if (flags["formal:pending-domain-seed"] === true) {
        const embryoKey = Object.keys(flags).find(key => key.startsWith(unlockPrefix));
        if (embryoKey) {
            delete flags[embryoKey];
            flags["formal:pending-domain-seed"] = false;
            addFlagNumber(state, "formal:domain-draws", 1);
            const inventoryKey = "formal:inventory:item:领域种子";
            flags[inventoryKey] = Math.max(0, getFlagNumber(state, inventoryKey) - 1);
        }
    }
}

function applyEffect(state, effect, controls, meta) {
    const type = effect?.type;
    if (typeof type !== "string" || type.length === 0) {
        fail("INVALID_APK_EFFECT", "APK effect must contain a type.");
    }
    const value = Number.isFinite(effect.amount) ? effect.amount : 0;
    const flags = ensureMap(state, "flags");
    switch (type) {
        case "conditional": {
            const result = evaluateApkRequirement(effect.condition, state);
            if (result.status === "unresolved") {
                fail(
                    "APK_EFFECT_CONDITION_UNRESOLVED",
                    "APK conditional effect requires an unmapped state field.",
                    { condition: clone(effect.condition), result }
                );
            }
            const effects = result.status === "met"
                ? effect.thenEffects
                : (effect.elseEffects ?? []);
            if (!Array.isArray(effects)) {
                fail("INVALID_APK_CONDITIONAL_EFFECT", "Conditional effect branch must be an array.");
            }
            effects.forEach(child => applyEffect(state, child, controls, meta));
            break;
        }
        case "setRoute":
            state.route = effect.route;
            state.age = 0;
            state.level = effect.route === "beast" ? 0 : 1;
            state.beastYears = effect.route === "beast" ? 10 : 0;
            flags.routeSelected = true;
            state.beast = effect.route === "beast" ? createBeastState() : null;
            state.beastOrigin = null;
            break;
        case "setTimelineEra":
            state.timelineEra = clone(effect.selection);
            break;
        case "setBeastPeriod":
            ensureBeast(state).period = clone(effect.selection);
            state.beast.chronologicalAge = 0;
            state.timelineAge = 0;
            state.elapsedYears = 0;
            break;
        case "setGender":
            state.gender = clone(effect.selection);
            break;
        case "setAppearance":
            state.appearance = clone(effect.selection);
            state.appearanceRank = effect.rank ?? null;
            break;
        case "changeAppearanceRank":
            state.appearanceRank = Math.max(
                0,
                Math.min(7, (state.appearanceRank ?? 0) + value)
            );
            break;
        case "setStoryTime":
            state.storyTime = {
                ...clone(effect.value),
                selection: clone(effect.value?.selection)
            };
            state.timelineAge = effect.value?.tangAge ?? null;
            break;
        case "setAge":
            state.age = Math.max(0, Math.trunc(effect.value));
            break;
        case "setInnatePower": {
            const fixed = Number.isFinite(flags["douluo2:innate-fixed"])
                ? flags["douluo2:innate-fixed"]
                : null;
            const cap10 = flags["douluo2:innate-cap-10"] === true;
            const offset = Number.isFinite(flags["douluo2:innate-offset"])
                ? flags["douluo2:innate-offset"]
                : 0;
            const raw = fixed ?? effect.value + offset;
            const capped = cap10 ? Math.min(10, raw) : raw;
            const minimum = flags["identity:innate-min-1"] === true
                ? Math.max(1, capped)
                : capped;
            state.innatePower = Math.max(0, Math.trunc(minimum));
            state.innateSoulPower = state.innatePower;
            state.initialPowerResult = clone(effect.selection);
            if (state.innatePower === 0) {
                state.level = 0;
                flags.noSoulPower = true;
            } else {
                state.level = clampLevel(state, state.innatePower);
            }
            const grade = talentGradeFromPower(state.innatePower);
            const progression = ensureTalentProgression(state);
            progression.talentGrade = grade;
            progression.ordinaryGrowthLocked = grade === "F";
            progression.unresolvedTalentGrade = grade === null;
            state.talentGrade = grade;
            break;
        }
        case "setTalentGrade": {
            const progression = ensureTalentProgression(state);
            progression.talentGrade = effect.grade;
            progression.ordinaryGrowthLocked = effect.grade === "F";
            progression.unresolvedTalentGrade = false;
            state.talentGrade = effect.grade;
            break;
        }
        case "setFaction":
            state.faction = clone(effect.selection);
            break;
        case "setStoryBranch": {
            if (!Number.isInteger(effect.branch)
                || ![1, 2, 3].includes(effect.branch)) {
                fail(
                    "INVALID_APK_STORY_BRANCH",
                    "APK story branch must be one of 1, 2, or 3.",
                    { effect: clone(effect) }
                );
            }
            state.storyBranch = effect.branch;
            state.branchStartTimelineAge = state.timelineAge;
            break;
        }
        case "setIdentity":
            state.background ??= { appliedRuleIds: [] };
            state.background.identityId = effect.identityId;
            break;
        case "setOrigin":
            state.background ??= { appliedRuleIds: [] };
            state.background.originId = effect.originId;
            break;
        case "setAffiliation": {
            const affiliations = ensureArray(state, "affiliations");
            const index = affiliations.findIndex(entry => (
                entry.factionId === effect.affiliation?.factionId
            ));
            if (index >= 0) affiliations[index] = clone(effect.affiliation);
            else affiliations.push(clone(effect.affiliation));
            break;
        }
        case "archiveCompletedGodTrial": {
            const trial = state.godTrial;
            if (trial && ["completed", "failed", "abandoned"].includes(trial.status)) {
                ensureArray(state, "godTrials").push(clone(trial));
                state.godTrial = null;
            }
            break;
        }
        case "prepareHumanSoulRing":
            state.pendingRing = {
                soulIndex: Math.trunc(effect.soulIndex),
                ringIndex: Math.trunc(effect.ringIndex),
                years: 0,
                source: null,
                typeSelection: null,
                speciesSelection: null,
                grantsSoulBone: false,
                levelBefore: state.level
            };
            break;
        case "setAdditionalSoulRingBatch":
            state.additionalSoulRingBatch = effect.value === null
                ? null
                : clone(effect.value);
            break;
        case "removeTrait":
            state.traits = (state.traits ?? []).filter(trait => trait !== effect.traitId);
            break;
        case "deleteFlag":
            delete flags[effect.key];
            break;
        case "changeCurrency": {
            const wallet = ensureWallet(state);
            const copper = Math.trunc(effect.copper ?? 0);
            if (copper >= 0) {
                setCopper(state, wallet.copper + copper);
            } else {
                const required = -copper;
                if (effect.insufficient === "clamp") {
                    const debit = Math.min(required, wallet.copper);
                    const insufficient = wallet.copper < required;
                    setCopper(state, wallet.copper - debit);
                    if (insufficient && Array.isArray(effect.onInsufficientEffects)) {
                        effect.onInsufficientEffects.forEach(child => {
                            applyEffect(state, child, controls, meta);
                        });
                    }
                } else if (wallet.copper < required) {
                    fail("APK_INSUFFICIENT_CURRENCY", `灵币不足：需要 ${required} 铜灵币。`);
                } else {
                    setCopper(state, wallet.copper - required);
                }
            }
            break;
        }
        case "changeLevel":
            if (value < 0 && consumeLevelLossShield(state)) break;
            if (canSetLevel(state, state.level + value)) {
                state.level = clampLevel(state, state.level + value);
            }
            break;
        case "setLevel":
            if (canSetLevel(state, effect.value)) {
                state.level = clampLevel(state, effect.value);
            }
            break;
        case "advanceHumanTime": {
            const years = Math.trunc(effect.years ?? 0);
            const income = (
                annualIncomeForLevel(state.level)
                + (Number.isFinite(flags["identity:annual-income-bonus-copper"])
                    ? flags["identity:annual-income-bonus-copper"]
                    : 0)
            ) * Math.max(0, years);
            setCopper(state, ensureWallet(state).copper + income);
            state.age = Math.max(0, state.age + years);
            state.timelineAge = (state.timelineAge ?? state.storyTime?.tangAge ?? 0) + years;
            state.elapsedYears += years;
            const pending = Math.trunc(getFlagNumber(
                state,
                "formal:next-time-skip-level-bonus"
            ));
            if (pending !== 0) {
                state.level = clampLevel(state, state.level + pending);
                flags["formal:next-time-skip-level-bonus"] = 0;
            }
            break;
        }
        case "advanceBeastTime": {
            if (state.route !== "beast" || !state.beast) {
                fail("APK_BEAST_STATE_REQUIRED", "纯魂兽时间推进缺少魂兽状态。");
            }
            const years = Math.max(0, Math.trunc(effect.years ?? 0));
            const cultivationDelta = Math.trunc(effect.cultivationDelta ?? 0);
            const income = beastTimeIncome(state.beastYears, cultivationDelta, years);
            setCopper(state, ensureWallet(state).copper + income);
            state.beastYears = Math.max(0, state.beastYears + cultivationDelta);
            state.beast.chronologicalAge += years;
            state.elapsedYears += years;
            state.timelineAge = (state.timelineAge ?? 0) + years;
            break;
        }
        case "advanceStoryProtagonistAge": {
            const years = Math.max(0, Math.trunc(effect.years ?? 1));
            state.timelineAge = (state.timelineAge ?? state.storyTime?.tangAge ?? 0) + years;
            if (state.storyTime) state.storyTime.tangAge += years;
            if (Number.isFinite(state.npcAges[NPC_PROTAGONIST_ID])) {
                state.npcAges[NPC_PROTAGONIST_ID] += years;
            }
            break;
        }
        case "changeBeastYears":
            state.beastYears = Math.max(0, state.beastYears + value);
            break;
        case "changeBeastYearsWithFloor":
            state.beastYears = Math.max(
                Math.trunc(effect.minimum ?? 0),
                state.beastYears + value
            );
            break;
        case "setBeastYears":
            state.beastYears = Math.max(0, Math.trunc(effect.value));
            break;
        case "advanceBeastElement": {
            const first = state.route === "beast"
                && !state.attributes.includes(effect.elementId);
            advanceElement(state, effect.elementId, 1, true);
            if (first) addCopper(state, ANNUAL_COPPER);
            break;
        }
        case "advanceHumanElement":
            advanceElement(state, effect.elementId, effect.amount ?? 1, false);
            break;
        case "ensureHumanElementLevel": {
            const current = Number(ensureMap(state, "elementProgress")[effect.elementId] ?? 0);
            advanceElement(state, effect.elementId, Math.max(0, effect.level - current), false);
            break;
        }
        case "removeHumanElement": {
            delete ensureMap(state, "elementProgress")[effect.elementId];
            state.attributes = state.attributes.filter(id => id !== effect.elementId);
            const prefix = `formal:element.${effect.elementId}.`;
            state.traits = state.traits.filter(trait => !trait.startsWith(prefix));
            delete flags[`formal:attribute-progress:${effect.elementId}`];
            break;
        }
        case "addMartialSoulTalent":
            addUniqueOption(ensureArray(state, "martialSoulTalents"), effect.selection);
            break;
        case "addMartialSoul":
            ensureArray(state, "martialSouls").push({
                id: effect.soulId,
                name: effect.name ?? null,
                category: effect.category ?? null,
                rings: [],
                tags: effect.tags ? clone(effect.tags) : [],
                passives: effect.passives ? clone(effect.passives) : []
            });
            state.level = clampLevel(state, state.level);
            break;
        case "replaceMartialSoul":
            state.martialSouls[effect.soulIndex] = {
                id: effect.soulId,
                name: effect.name ?? null,
                category: effect.category ?? null,
                rings: [],
                tags: effect.tags ? clone(effect.tags) : [],
                passives: effect.passives ? clone(effect.passives) : []
            };
            state.level = clampLevel(state, state.level);
            break;
        case "awakenMartialSoul": {
            const soul = state.martialSouls[effect.soulIndex];
            if (!soul) fail("APK_MARTIAL_SOUL_NOT_FOUND", "武魂槽位不存在。", effect);
            soul.awakenings ??= [];
            addUniqueOption(soul.awakenings, effect.awakening);
            soul.tags = [...new Set([...(soul.tags ?? []), ...(effect.tags ?? [])])];
            soul.passives = [...new Set([...(soul.passives ?? []), ...(effect.passives ?? [])])];
            state.level = clampLevel(state, state.level);
            break;
        }
        case "addSoulRing": {
            const soul = state.martialSouls[effect.soulIndex];
            if (!soul) break;
            soul.rings ??= [];
            if (!soul.rings.some(ring => ring.name === effect.ring?.name)) {
                soul.rings.push(clone(effect.ring));
            }
            break;
        }
        case "setSoulRing": {
            const soul = state.martialSouls[effect.soulIndex];
            if (!soul) fail("APK_MARTIAL_SOUL_NOT_FOUND", "魂环归属的武魂槽位不存在。", effect);
            soul.rings ??= [];
            const current = soul.rings[effect.ringIndex];
            if (!current) {
                soul.rings[effect.ringIndex] = clone(effect.ring);
                break;
            }
            const same = current.years === effect.ring?.years
                && current.name === effect.ring?.name
                && current.source?.optionId === effect.ring?.source?.optionId
                && current.typeSelection?.optionId === effect.ring?.typeSelection?.optionId
                && current.speciesSelection?.optionId === effect.ring?.speciesSelection?.optionId;
            if (!same) {
                fail("APK_SOUL_RING_OVERWRITE", "禁止覆盖已有魂环。", effect);
            }
            break;
        }
        case "addSoulBone": {
            const bones = ensureArray(state, "soulBones");
            const bone = clone(effect.soulBone);
            const partId = bone.partId ?? bone.id;
            if (effect.partCapacity !== undefined) {
                if (getSoulBoneCount(state, partId, partId === "external") < effect.partCapacity) {
                    if (partId && bone.partId === undefined) bone.partId = partId;
                    bones.push(bone);
                }
            } else if (!bones.some(item => (
                item.id === bone.id
                || (bone.partId && item.partId === bone.partId)
            ))) {
                if (partId && bone.partId === undefined) bone.partId = partId;
                bones.push(bone);
            }
            break;
        }
        case "addTalent":
            addUniqueOption(ensureArray(state, "talents"), effect.selection);
            break;
        case "addTrait":
            if (!state.traits.includes(effect.traitId)) state.traits.push(effect.traitId);
            break;
        case "addTitle":
            if (!state.titles.includes(effect.titleId)) state.titles.push(effect.titleId);
            break;
        case "addBeastNamePrefix":
            if (!state.beast) fail("APK_BEAST_STATE_REQUIRED", "非魂兽角色不能获得魂兽名称前缀。");
            if (!state.beast.namePrefixes.includes(effect.prefix)) state.beast.namePrefixes.push(effect.prefix);
            if (effect.prefix === "路边") flags.beastPrimaryRoadside = true;
            break;
        case "addBeastNameSuffix":
            if (!state.beast) fail("APK_BEAST_STATE_REQUIRED", "非魂兽角色不能获得魂兽名称后缀。");
            if (!state.beast.nameSuffixes.includes(effect.suffix)) state.beast.nameSuffixes.push(effect.suffix);
            break;
        case "addAttribute":
            if (!state.attributes.includes(effect.attributeId)) state.attributes.push(effect.attributeId);
            break;
        case "grantCompleteLaw":
            advanceElement(state, effect.elementId, 4, false);
            if (!state.traits.includes(`formal:element.${effect.elementId}.complete-law`)) {
                state.traits.push(`formal:element.${effect.elementId}.complete-law`);
            }
            if (state.beast) {
                const beast = ensureBeast(state);
                if (!beast.laws.includes(`douluo2:law.${effect.elementId}`)) {
                    beast.laws.push(`douluo2:law.${effect.elementId}`);
                }
            }
            break;
        case "addDomain":
            state.domains.push(effect.domainId);
            if (state.route === "beast") addCopper(state, 10 * ANNUAL_COPPER);
            break;
        case "addDomainEmbryo":
            if (!state.traits.includes(`formal:domain-embryo:${effect.embryoId}`)) {
                state.traits.push(`formal:domain-embryo:${effect.embryoId}`);
            }
            flags[`formal:domain-embryo-unlock:${effect.embryoId}`] = Math.max(
                1,
                Math.trunc(effect.unlockLevel)
            );
            break;
        case "addDomainSeed":
            flags["formal:pending-domain-seed"] = true;
            break;
        case "addArtifact": {
            const existing = state.artifacts.find(item => item.id === effect.artifact?.id);
            if (!existing) state.artifacts.push(clone(effect.artifact));
            else {
                if (effect.artifact.stage === "complete") existing.stage = "complete";
                existing.rank = Math.max(existing.rank ?? 0, effect.artifact.rank ?? 0);
                existing.combatPower = Math.max(existing.combatPower ?? 0, effect.artifact.combatPower ?? 0);
            }
            break;
        }
        case "upgradeArtifacts": {
            const ranks = [0, 300, 500, 800, 1000, 2000];
            const amount = Math.max(0, Math.trunc(effect.amount));
            state.artifacts.forEach(artifact => {
                const index = ranks.findIndex(rank => rank >= (artifact.combatPower ?? 0));
                const current = index < 0 ? ranks.length - 1 : index;
                const next = Math.min(ranks.length - 1, current + amount);
                artifact.combatPower = ranks[next];
                artifact.rank = Math.max(artifact.rank ?? 0, next);
            });
            break;
        }
        case "changeAllSoulRingYears":
            state.martialSouls.forEach(soul => (soul.rings ?? []).forEach(ring => {
                ring.years = Math.max(0, (ring.years ?? 0) + value);
            }));
            break;
        case "changeAllSoulBoneYears":
            state.soulBones.forEach(bone => {
                bone.years = Math.max(0, (bone.years ?? 0) + value);
            });
            break;
        case "queueSoulBoneUpgrade":
            flags["formal:pending-soul-bone-upgrade-years"] = Math.max(0, Math.trunc(value));
            break;
        case "applyPendingSoulBoneUpgrade": {
            const amount = Math.max(0, Math.trunc(getFlagNumber(
                state,
                "formal:pending-soul-bone-upgrade-years"
            )));
            if (amount <= 0) fail("APK_PENDING_SOUL_BONE_UPGRADE_MISSING", "没有待结算的魂骨年限提升。");
            const selected = state.soulBones.filter(bone => (
                effect.external
                    ? getSoulBonePartId(bone) === "external"
                    : getSoulBonePartId(bone) === effect.partId
                        || bone.id === effect.partId
            ));
            if (!selected.length) fail("APK_SOUL_BONE_PART_NOT_FOUND", "角色没有可升级的魂骨部位。", effect);
            selected.forEach(bone => {
                bone.years = Math.max(0, (bone.years ?? 0) + amount);
            });
            delete flags["formal:pending-soul-bone-upgrade-years"];
            break;
        }
        case "addInventoryStack": {
            const key = `formal:inventory:${effect.category}:${effect.itemId}`;
            const next = Math.max(0, Math.trunc(getFlagNumber(state, key) + value));
            flags[key] = effect.maxStacks === undefined
                ? next
                : Math.min(effect.maxStacks, next);
            break;
        }
        case "addCombatPowerBonus": {
            const key = effect.category === "status"
                ? "combat:status-modifier"
                : `combat:${effect.category}-bonus`;
            addFlagNumber(state, key, value);
            break;
        }
        case "addLevelCombatPowerPercentBonus": {
            const activeBelowLevel = effect.activeBelowLevel ?? Number.POSITIVE_INFINITY;
            const key = `combat:${effect.category}:level-percent:${Math.trunc(effect.basisPoints)}:${Number.isFinite(activeBelowLevel) ? activeBelowLevel : "always"}`;
            addFlagNumber(state, key, 1);
            break;
        }
        case "changeAnnualIncome":
            addFlagNumber(state, "identity:annual-income-bonus-copper", effect.copper ?? 0);
            break;
        case "addNextTimeSkipLevelBonus":
            addFlagNumber(state, "formal:next-time-skip-level-bonus", value);
            break;
        case "changeAnnualLevelBonus": {
            state.annualGrowthPolicy ??= {
                preventLevelPenaltySources: [],
                annualLevelBonus: 0
            };
            state.annualGrowthPolicy.annualLevelBonus += value;
            break;
        }
        case "changeCounterWithLevelReward": {
            const before = Math.max(0, Math.trunc(getFlagNumber(state, effect.key)));
            const after = Math.max(0, before + Math.trunc(value));
            flags[effect.key] = after;
            const threshold = Math.trunc(effect.threshold);
            if (threshold > 0) {
                const rewards = Math.floor(after / threshold) - Math.floor(before / threshold);
                if (rewards > 0) {
                    state.level = clampLevel(
                        state,
                        state.level + rewards * Math.trunc(effect.levelPerThreshold)
                    );
                }
            }
            break;
        }
        case "progressAttribute": {
            const before = Number(ensureMap(state, "elementProgress")[effect.attributeId] ?? 0);
            if (effect.completedAttributeId
                && before >= (effect.completionThreshold ?? 4)
                && effect.levelIfComplete) {
                state.level = clampLevel(state, state.level + effect.levelIfComplete);
                break;
            }
            advanceElement(state, effect.attributeId, effect.amount ?? 1, false);
            addFlagNumber(
                state,
                `formal:attribute-progress:${effect.attributeId}`,
                effect.amount ?? 1
            );
            if (effect.completionThreshold
                && effect.completedAttributeId
                && Number(ensureMap(state, "elementProgress")[effect.attributeId] ?? 0)
                    >= effect.completionThreshold) {
                advanceElement(state, effect.completedAttributeId, 4, false);
            }
            break;
        }
        case "addDeathShield": {
            const key = `formal:death-shield:${effect.maxLevel ?? "any"}:${effect.resurrectionCost ?? "none"}:${effect.shieldId}`;
            addFlagNumber(state, key, Math.max(0, Math.trunc(value)));
            break;
        }
        case "addLevelLossShield": {
            const key = `formal:level-loss-shield:${effect.maxLevel ?? "any"}:${effect.shieldId}`;
            addFlagNumber(state, key, Math.max(0, Math.trunc(value)));
            break;
        }
        case "setAllSoulRingQuality":
            state.martialSouls.forEach(soul => (soul.rings ?? []).forEach(ring => {
                ring.quality = effect.quality;
            }));
            break;
        case "setAllSoulBoneQuality":
            state.soulBones.forEach(bone => {
                bone.quality = effect.quality;
            });
            break;
        case "equipGodArmorOrDie": {
            const minimum = Math.max(0, Math.trunc(effect.minimumSoulBones));
            if (minimum >= 6 || getSoulBoneCount(state) >= minimum) {
                flags.godTrialArmor = true;
            } else if (!consumeDeathShield(state)) {
                markDeath(state, {
                    cause: effect.cause,
                    title: "神考失败"
                });
            }
            break;
        }
        case "setFlag":
            flags[effect.key] = clone(effect.value);
            break;
        case "changeCounter":
            flags[effect.key] = Number(flags[effect.key] ?? 0) + value;
            break;
        case "addLog":
            ensureArray(state, "logs").push(clone(effect));
            break;
        case "death":
            if (!consumeDeathShield(state)) markDeath(state, { cause: effect.cause });
            break;
        case "ending":
            if (state.route !== "beast"
                && flags.formalHumanSetupComplete === true
                && state.age < 150) {
                flags[`formal:deferred-ending:${effect.endingId}`] = true;
                flags["formal:free-mode"] = true;
            } else {
                state.ending = createEnding(state, {
                    id: effect.endingId,
                    title: effect.title ?? effect.endingId,
                    kind: effect.kind ?? "success",
                    text: effect.text
                });
            }
            break;
        default:
            fail(
                "UNSUPPORTED_APK_EFFECT",
                `APK effect type "${type}" is not implemented by the typed runtime.`,
                { effect: clone(effect), adapterVersion: APK_CONTENT_ADAPTER_VERSION }
            );
    }
    controls.appliedTypes.push(type);
}

function addCopper(state, amount) {
    setCopper(state, ensureWallet(state).copper + amount);
}

function addUniqueOption(target, value) {
    if (!value || typeof value !== "object") return;
    if (!target.some(entry => entry?.optionId === value.optionId)) {
        target.push(clone(value));
    }
}

function createEnding(state, ending) {
    const kind = ending.kind ?? "success";
    const finalStatus = ending.finalStatus
        ?? (kind === "death"
            ? "dead"
            : ensureMap(state, "flags").finalStatus
                ?? (state.godhood ? "god" : "alive"));
    return {
        id: ending.id,
        title: ending.title,
        kind,
        text: ending.text ?? null,
        finalStatus,
        finalLevel: state.level,
        finalBeastYears: state.beastYears,
        deathCause: kind === "death" ? ending.cause ?? ending.deathCause ?? null : null,
        cause: kind === "death" ? ending.cause ?? ending.deathCause ?? null : null,
        godhoodAtEnding: state.godhood ? clone(state.godhood) : null
    };
}

function markDeath(state, { cause = null, title = "陨落" } = {}) {
    ensureMap(state, "flags").finalStatus = "dead";
    state.ending = createEnding(state, {
        id: "death",
        title,
        kind: "death",
        cause,
        finalStatus: "dead"
    });
}

export function applyApkEffects(
    character,
    effects,
    {
        reason = "formal-option-effect",
        referenceId = "effect-engine",
        idempotencyKeyPrefix = null
    } = {}
) {
    if (!isPlainObject(character)) {
        fail("INVALID_APK_CHARACTER", "APK effects require a character object.");
    }
    if (!Array.isArray(effects)) {
        fail("INVALID_APK_EFFECT_LIST", "APK effects must be an array.");
    }
    const beforeTransactions = Array.isArray(character.transactions)
        ? character.transactions
        : [];
    if (idempotencyKeyPrefix
        && beforeTransactions.some(transaction => (
            transaction.idempotencyKey?.startsWith(`${idempotencyKeyPrefix}:`)
        ))) {
        return {
            character: clone(character),
            controls: { appliedTypes: [], skipped: true },
            applied: false
        };
    }

    const next = clone(character);
    ensureArray(next, "transactions");
    const controls = {
        appliedTypes: [],
        terminal: null
    };
    const meta = { reason, referenceId };
    effects.forEach((record, index) => {
        const effect = getEffectObject(record);
        applyEffect(next, effect, controls, meta);
        next.transactions.push({
            reason,
            referenceId,
            idempotencyKey: `${idempotencyKeyPrefix ?? "effect-batch"}:${index}:${effect.type}`,
            type: effect.type
        });
    });
    finalizeState(next);
    controls.terminal = next.ending ? clone(next.ending) : null;
    return {
        character: next,
        controls,
        applied: effects.length > 0
    };
}

export function commitApkOption({
    session,
    contentIndex,
    option,
    poolId,
    reason = "formal-option-effect",
    effectsOverride = null
} = {}) {
    if (!isPlainObject(session) || session.schemaVersion !== APK_SESSION_SCHEMA_VERSION) {
        fail("INVALID_APK_SESSION", "APK option commit requires an APK session.");
    }
    const actualPoolId = poolId ?? session.currentPoolId;
    const normalized = getNormalized(option);
    const optionId = normalized?.option_id ?? option?.id;
    const eligible = selectApkPoolOptions(
        contentIndex,
        session.character,
        actualPoolId
    ).options;
    const selected = eligible.find(candidate => (
        (getNormalized(candidate)?.option_id ?? candidate.id) === optionId
    ));
    if (!selected) {
        fail(
            "APK_OPTION_NOT_ELIGIBLE",
            `APK option "${optionId}" is not eligible in pool "${actualPoolId}".`
        );
    }
    const before = clone(session);
    try {
        const effects = Array.isArray(effectsOverride)
            ? clone(effectsOverride)
            : getOptionEffects(selected);
        const result = applyApkEffects(
            session.character,
            effects,
            {
                reason,
                referenceId: `${actualPoolId}:${optionId}`,
                idempotencyKeyPrefix: `spin:${session.packId}:${actualPoolId}:${optionId}:${session.history.length}`
            }
        );
        session.character = result.character;
        session.currentPoolId = actualPoolId;
        session.history.push({
            poolId: actualPoolId,
            optionId,
            text: getOptionText(selected),
            randomCursor: session.random.cursor,
            effects: clone(effects)
        });
        session.timeline.push({
            kind: "result",
            text: getOptionText(selected),
            poolId: actualPoolId,
            optionId,
            source: "normal"
        });
        if (session.character.ending) session.finished = true;
        session.lastResolvedSpin = {
            poolId: actualPoolId,
            poolTitle: getNormalized(contentIndex.getPool(actualPoolId))?.pool_name ?? actualPoolId,
            selectedOption: {
                optionId,
                text: getOptionText(selected),
                weight: getOptionWeight(selected)
            },
            result: { optionId, text: getOptionText(selected) },
            randomCursorAfter: session.random.cursor
        };
        return {
            session,
            option: clone(selected),
            effectResult: result
        };
    } catch (error) {
        Object.assign(session, before);
        throw error;
    }
}

export class ApkRuleRuntimeError extends Error {
    constructor(code, message, details = {}) {
        super(message);
        this.name = "ApkRuleRuntimeError";
        this.code = code;
        this.details = details;
    }
}

export default Object.freeze({
    APK_CHARACTER_SCHEMA_VERSION,
    APK_RANDOM_ALGORITHM,
    APK_RULE_RUNTIME_VERSION,
    APK_RUNTIME_EFFECT_TYPES,
    APK_SESSION_SCHEMA_VERSION,
    applyApkEffects,
    commitApkOption,
    createApkCharacterState,
    createApkContentIndex,
    createApkRandom,
    createApkSession,
    drawApkPool,
    nextApkRandom,
    selectApkPoolOptions
});
