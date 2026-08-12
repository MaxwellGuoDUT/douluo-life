export const SOUL_RING_DEMO_STATUS = Object.freeze({
    READY: "ready",
    WHEEL_SELECTION: "wheel_selection",
    CANDIDATE_SELECTION: "candidate_selection",
    YEAR_INPUT: "year_input",
    ABSORPTION: "absorption",
    SUCCESS: "success",
    FAILURE: "failure",
    IGNORED: "ignored"
});

export const SOUL_RING_DEMO_PHASES = Object.freeze({
    READY: SOUL_RING_DEMO_STATUS.READY,
    WHEEL_SELECTION: SOUL_RING_DEMO_STATUS.WHEEL_SELECTION,
    CANDIDATE_SELECTION: SOUL_RING_DEMO_STATUS.CANDIDATE_SELECTION,
    YEAR_INPUT: SOUL_RING_DEMO_STATUS.YEAR_INPUT,
    ABSORPTION: SOUL_RING_DEMO_STATUS.ABSORPTION,
    TERMINAL: "terminal"
});

const RING_LABELS = Object.freeze({
    1: "第一魂环",
    2: "第二魂环",
    3: "第三魂环",
    4: "第四魂环",
    5: "第五魂环",
    6: "第六魂环",
    7: "第七魂环",
    8: "第八魂环",
    9: "第九魂环"
});

const CHINESE_DIGITS = Object.freeze({
    零: 0,
    〇: 0,
    一: 1,
    二: 2,
    两: 2,
    三: 3,
    四: 4,
    五: 5,
    六: 6,
    七: 7,
    八: 8,
    九: 9
});

const CHINESE_UNITS = Object.freeze({
    十: 10,
    百: 100,
    千: 1000,
    万: 10000,
    亿: 100000000
});

export class SoulRingDemoError extends Error {
    constructor(code, message, details = {}) {
        super(message);
        this.name = "SoulRingDemoError";
        this.code = code;
        this.details = details;
    }
}

function isPlainObject(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return false;
    }

    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
}

function cloneJsonValue(value) {
    if (value === null
        || value === undefined
        || typeof value === "string"
        || typeof value === "boolean") {
        return value;
    }

    if (typeof value === "number") {
        if (!Number.isFinite(value)) {
            throw new TypeError("Soul-ring Demo numbers must be finite.");
        }
        return value;
    }

    if (Array.isArray(value)) {
        return value.map(cloneJsonValue);
    }

    if (isPlainObject(value)) {
        return Object.fromEntries(
            Object.entries(value).map(([key, entry]) => {
                return [key, cloneJsonValue(entry)];
            })
        );
    }

    throw new TypeError("Soul-ring Demo state must contain JSON-compatible values.");
}

function addIssue(issues, code, message, path, details = {}) {
    issues.push({ code, message, path, ...details });
}

function assertPlainObject(value, code, message, details = {}) {
    if (!isPlainObject(value)) {
        throw new SoulRingDemoError(code, message, details);
    }
}

function assertInteger(value, code, message, details = {}) {
    if (!Number.isInteger(value)) {
        throw new SoulRingDemoError(code, message, { ...details, received: value });
    }
}

function assertRng(rng) {
    if (typeof rng !== "function") {
        throw new SoulRingDemoError(
            "INVALID_DEMO_RNG",
            "Soul-ring Demo requires an injected RNG function."
        );
    }
}

function assertRngValue(value) {
    if (!Number.isFinite(value) || value < 0 || value >= 1) {
        throw new SoulRingDemoError(
            "INVALID_DEMO_RNG",
            "Soul-ring Demo RNG must return a finite number in [0, 1).",
            { roll: value }
        );
    }
}

function parseArabicNumber(value) {
    const normalized = String(value).replaceAll(",", "").trim();
    if (!/^\d+$/.test(normalized)) {
        return null;
    }

    const parsed = Number(normalized);
    return Number.isSafeInteger(parsed) ? parsed : null;
}

export function parseChineseInteger(value) {
    const text = String(value)
        .replaceAll(",", "")
        .replaceAll("年", "")
        .trim();
    const arabic = parseArabicNumber(text);
    if (arabic !== null) {
        return arabic;
    }
    if (text.length === 0) {
        return null;
    }

    let total = 0;
    let section = 0;
    let currentDigit = 0;
    let hasDigit = false;

    for (const character of text) {
        if (Object.hasOwn(CHINESE_DIGITS, character)) {
            currentDigit = CHINESE_DIGITS[character];
            hasDigit = true;
            continue;
        }

        const unit = CHINESE_UNITS[character];
        if (!unit) {
            return null;
        }

        if (unit >= 10000) {
            const group = section + (hasDigit ? currentDigit : 0);
            total += (group || 1) * unit;
            section = 0;
        } else {
            section += (hasDigit ? currentDigit : 1) * unit;
        }

        currentDigit = 0;
        hasDigit = false;
    }

    const result = total + section + (hasDigit ? currentDigit : 0);
    return Number.isSafeInteger(result) ? result : null;
}

function stripCandidateAnnotation(text) {
    return String(text)
        .replace(/（[^）]*）/g, "")
        .replace(/\([^)]*\)/g, "")
        .trim();
}

export function parseLegacyYearCandidate(text) {
    const rawText = String(text ?? "").trim();
    const normalized = stripCandidateAnnotation(rawText);

    if (normalized.length === 0) {
        return {
            status: "unresolved",
            rawText,
            minYears: null,
            maxYears: null,
            exactYears: null,
            reason: "empty_candidate"
        };
    }

    const openUpperMatch = normalized.match(/^(.+?)年(?:之上|以上)/);
    if (openUpperMatch) {
        const minYears = parseChineseInteger(openUpperMatch[1]);
        if (minYears !== null) {
            return {
                status: "parsed",
                rawText,
                minYears,
                maxYears: null,
                exactYears: null,
                rangeType: "open_upper"
            };
        }
    }

    const rangeMatch = normalized.match(/^(.+?)[～~至到-](.+?)年$/);
    if (rangeMatch) {
        const minYears = parseChineseInteger(rangeMatch[1]);
        const maxYears = parseChineseInteger(rangeMatch[2]);
        if (minYears !== null && maxYears !== null) {
            return {
                status: "parsed",
                rawText,
                minYears,
                maxYears,
                exactYears: minYears === maxYears ? minYears : null,
                rangeType: "closed_range"
            };
        }
    }

    const exactMatch = normalized.match(/^(.+?)年$/);
    if (exactMatch) {
        const exactYears = parseChineseInteger(exactMatch[1]);
        if (exactYears !== null) {
            return {
                status: "parsed",
                rawText,
                minYears: exactYears,
                maxYears: exactYears,
                exactYears,
                rangeType: "exact"
            };
        }
    }

    return {
        status: "unresolved",
        rawText,
        minYears: null,
        maxYears: null,
        exactYears: null,
        reason: "unrecognized_year_expression"
    };
}

function isProvisionalStatus(value) {
    return value === "provisional";
}

export function validateSoulRingDemoConfig(config) {
    const errors = [];
    const warnings = [];

    if (!isPlainObject(config)) {
        return {
            valid: false,
            errors: [{
                code: "INVALID_SOUL_RING_DEMO_CONFIG",
                message: "Soul-ring Demo config must be a plain object.",
                path: "config"
            }],
            warnings
        };
    }

    if (config.schemaVersion !== "soul-ring-demo-config/1.0"
        || config.demoVersion !== "soul-ring-demo/0.1"
        || !isProvisionalStatus(config.status)) {
        addIssue(errors, "INVALID_SOUL_RING_DEMO_METADATA", "Soul-ring Demo metadata must remain provisional.", "config");
    }

    const requiredProvisionalPaths = [
        "source",
        "interaction",
        "trigger",
        "slotRules",
        "legacyWeightPolicy",
        "yearResolution",
        "absorption",
        "levelZero",
        "transitionHistory"
    ];
    requiredProvisionalPaths.forEach(path => {
        if (!isProvisionalStatus(config[path]?.status)) {
            addIssue(errors, "NON_PROVISIONAL_DEMO_RULE", "Every Demo rule must remain provisional.", path);
        }
    });

    if (config.source?.sourceStatus !== "REFERENCE DATA ONLY"
        || config.source?.productionEligible !== false) {
        addIssue(errors, "INVALID_DEMO_SOURCE_BOUNDARY", "Demo source must remain reference-only and non-production.", "source");
    }

    if (config.interaction?.mode !== "manual_trigger_and_selection"
        || config.interaction?.manualCandidateSelectionAllowed !== true) {
        addIssue(errors, "INVALID_DEMO_INTERACTION_MODE", "Demo must support manual triggering and candidate selection.", "interaction");
    }

    if (config.trigger?.minimumLevel !== 10) {
        addIssue(errors, "INVALID_DEMO_TRIGGER_LEVEL", "Temporary Demo trigger minimum must be level 10.", "trigger.minimumLevel");
    }

    if (config.slotRules?.minimumSlot !== 1
        || config.slotRules?.maximumSlot !== 9) {
        addIssue(errors, "INVALID_DEMO_SLOT_RANGE", "Demo slot range must be soul rings 1 through 9.", "slotRules");
    }

    if (config.legacyWeightPolicy?.positiveWeightsEligibleForWeightedRoll !== true
        || config.legacyWeightPolicy?.zeroWeightItems !== "not_selectable"
        || config.legacyWeightPolicy?.nullWeightItems !== "manual_selection_only"
        || config.legacyWeightPolicy?.mixedWeightWheel !== "manual_selection_only") {
        addIssue(errors, "INVALID_LEGACY_WEIGHT_POLICY", "Legacy weight semantics must preserve positive, zero, null, and mixed boundaries.", "legacyWeightPolicy");
    }

    if (config.yearResolution?.minimumLegalYears !== 10
        || config.yearResolution?.testOnlyFixedYears !== 18000
        || config.yearResolution?.testOnlyFixedYearsEnabledInBrowser !== false) {
        addIssue(errors, "INVALID_DEMO_YEAR_POLICY", "Demo year policy must keep 18000 years test-only.", "yearResolution");
    }

    if (config.absorption?.mode !== "manual_outcome"
        || config.absorption?.terminalAfterEitherOutcome !== true) {
        addIssue(errors, "INVALID_DEMO_ABSORPTION_POLICY", "Demo absorption must expose terminal success and failure outcomes.", "absorption");
    }

    if (config.levelZero?.mode !== "ignore_and_end"
        || config.levelZero?.terminalStatus !== "ignored") {
        addIssue(errors, "INVALID_DEMO_LEVEL_ZERO_POLICY", "Level 0 must be ignored and end the Demo.", "levelZero");
    }

    if (config.transitionHistory?.recordNarrativeTransitions !== true) {
        addIssue(errors, "INVALID_DEMO_TRANSITION_POLICY", "Demo must record narrative transition information.", "transitionHistory");
    }

    warnings.push({
        code: "PROVISIONAL_DEMO_RULES",
        message: "All soul-ring Demo rules are provisional and must not be promoted to production.",
        path: "config",
        status: "provisional"
    });

    return { valid: errors.length === 0, errors, warnings };
}

export function assertValidSoulRingDemoConfig(config) {
    const validation = validateSoulRingDemoConfig(config);
    if (!validation.valid) {
        throw new SoulRingDemoError(
            "INVALID_SOUL_RING_DEMO_CONFIG",
            "Soul-ring Demo config failed validation.",
            { errors: validation.errors }
        );
    }
    return validation;
}

export function validateLegacyWheelData(data) {
    const errors = [];
    const warnings = [];

    if (!isPlainObject(data)) {
        return {
            valid: false,
            errors: [{
                code: "INVALID_LEGACY_WHEEL_DATA",
                message: "Legacy wheel data must be a plain object.",
                path: "data"
            }],
            warnings
        };
    }

    if (!Array.isArray(data.wheels) || data.wheels.length === 0) {
        addIssue(errors, "INVALID_LEGACY_WHEEL_COLLECTION", "Legacy wheel data must contain a non-empty wheels array.", "wheels");
    }

    if (data.metadata?.schemaVersion !== "legacy-wheel-conversion/1.0"
        || data.metadata?.interpretation?.includes("必须通过随机转盘") !== true) {
        addIssue(errors, "INVALID_LEGACY_WHEEL_METADATA", "Legacy wheel metadata does not match the reference-only conversion receipt.", "metadata");
    }

    (data.wheels ?? []).forEach((wheel, index) => {
        if (!isPlainObject(wheel)) {
            addIssue(errors, "INVALID_LEGACY_WHEEL", "Each legacy wheel must be an object.", `wheels[${index}]`);
            return;
        }
        if (!Number.isInteger(wheel.legacyWheelId) || !Array.isArray(wheel.items)) {
            addIssue(errors, "INVALID_LEGACY_WHEEL_FIELDS", "Legacy wheel must contain legacyWheelId and items.", `wheels[${index}]`);
        }
    });

    warnings.push({
        code: "LEGACY_REFERENCE_ONLY",
        message: "Legacy wheel data is used only by the provisional Demo.",
        path: "metadata",
        status: "provisional"
    });

    return { valid: errors.length === 0, errors, warnings };
}

export function assertValidLegacyWheelData(data) {
    const validation = validateLegacyWheelData(data);
    if (!validation.valid) {
        throw new SoulRingDemoError(
            "INVALID_LEGACY_WHEEL_DATA",
            "Legacy wheel data failed Demo validation.",
            { errors: validation.errors }
        );
    }
    return validation;
}

function getSlotTitle(slot, config) {
    return config.slotRules?.titleBySlot?.[String(slot)] ?? RING_LABELS[slot];
}

function wheelHasExcludedTitle(wheel, config) {
    return (config.slotRules?.excludeTitlesContaining ?? []).some(fragment => {
        return String(wheel.title).includes(fragment);
    });
}

export function getCandidateWheels(data, slot, config) {
    assertPlainObject(data, "INVALID_LEGACY_WHEEL_DATA", "Legacy wheel data must be a plain object.");
    assertPlainObject(config, "INVALID_SOUL_RING_DEMO_CONFIG", "Soul-ring Demo config must be a plain object.");
    assertInteger(slot, "INVALID_SOUL_RING_SLOT", "Soul-ring slot must be an integer.");

    const title = getSlotTitle(slot, config);
    return (data.wheels ?? [])
        .filter(wheel => wheel?.title === title && !wheelHasExcludedTitle(wheel, config))
        .map(wheel => {
            const positiveWeightCount = (wheel.items ?? []).filter(item => Number.isFinite(item.weight) && item.weight > 0).length;
            const hasNullWeight = (wheel.items ?? []).some(item => item.weight === null);
            return {
                id: wheel.id,
                legacyWheelId: wheel.legacyWheelId,
                title: wheel.title,
                mode: wheel.weightProfile?.mode ?? "unknown",
                weightProfile: cloneJsonValue(wheel.weightProfile ?? null),
                positiveWeightCount,
                hasNullWeight,
                selectionMode: wheel.weightProfile?.probabilitiesResolved === true
                    && !hasNullWeight
                    ? "weighted_or_manual"
                    : "manual_only",
                status: "provisional"
            };
        });
}

function findWheel(data, wheelId) {
    return (data.wheels ?? []).find(wheel => {
        return wheel.id === wheelId || wheel.legacyWheelId === wheelId;
    });
}

function getSelectableItems(wheel) {
    return (wheel.items ?? []).filter(item => item.weight === null || (Number.isFinite(item.weight) && item.weight > 0));
}

export function getSelectableWheelItems(data, wheelId) {
    const wheel = findWheel(data, wheelId);
    if (!wheel) {
        throw new SoulRingDemoError(
            "UNKNOWN_LEGACY_WHEEL",
            `Legacy wheel "${String(wheelId)}" was not found.`,
            { wheelId }
        );
    }

    return getSelectableItems(wheel).map(item => ({
        ...cloneJsonValue(item),
        selectionStatus: item.weight === null ? "manual_only_unresolved_weight" : "weighted_eligible",
        parsedYears: parseLegacyYearCandidate(item.text),
        status: "provisional"
    }));
}

function weightedChoice(items, rng) {
    assertRng(rng);
    const numericItems = items.filter(item => Number.isFinite(item.weight) && item.weight > 0);
    if (numericItems.length === 0) {
        throw new SoulRingDemoError(
            "LEGACY_WEIGHTS_UNRESOLVED",
            "This legacy wheel has no positive resolved weights; choose a candidate manually."
        );
    }

    const totalWeight = numericItems.reduce((sum, item) => sum + item.weight, 0);
    const roll = rng();
    assertRngValue(roll);
    const target = roll * totalWeight;
    let cursor = 0;

    for (const item of numericItems) {
        cursor += item.weight;
        if (target < cursor) {
            return { item, roll, target, totalWeight };
        }
    }

    return {
        item: numericItems[numericItems.length - 1],
        roll,
        target,
        totalWeight
    };
}

function resolveWheelItem(wheel, itemIndex) {
    const item = (wheel.items ?? []).find(candidate => candidate.index === itemIndex);
    if (!item) {
        throw new SoulRingDemoError(
            "UNKNOWN_LEGACY_WHEEL_ITEM",
            `Item ${String(itemIndex)} was not found in legacy wheel ${String(wheel.legacyWheelId)}.`,
            { wheelId: wheel.legacyWheelId, itemIndex }
        );
    }
    if (item.weight === 0) {
        throw new SoulRingDemoError(
            "LEGACY_ZERO_WEIGHT_ITEM",
            "Zero-weight legacy items are retained for audit but are not selectable.",
            { wheelId: wheel.legacyWheelId, itemIndex }
        );
    }
    return item;
}

function appendHistory(state, type, text, details = {}) {
    state.history.push({
        index: state.history.length + 1,
        type,
        text,
        status: "provisional",
        ...cloneJsonValue(details)
    });
}

function ensurePhase(state, expectedPhase) {
    if (state.phase !== expectedPhase) {
        throw new SoulRingDemoError(
            "INVALID_DEMO_PHASE",
            `This action requires phase "${expectedPhase}", current phase is "${state.phase}".`,
            { expectedPhase, currentPhase: state.phase }
        );
    }
}

function normalizePlayer(player) {
    const normalized = cloneJsonValue(player ?? {});
    if (!isPlainObject(normalized)) {
        throw new SoulRingDemoError("INVALID_DEMO_PLAYER", "Demo player must be a plain object.");
    }
    if (!Number.isInteger(normalized.level) || normalized.level < 0) {
        throw new SoulRingDemoError("INVALID_DEMO_PLAYER_LEVEL", "Demo player level must be a non-negative integer.");
    }
    if (!Array.isArray(normalized.soulRings)) {
        normalized.soulRings = [];
    }
    return normalized;
}

function getCandidateSummary(item, wheel) {
    const parsedYears = parseLegacyYearCandidate(item.text);
    return {
        wheelId: wheel.id,
        legacyWheelId: wheel.legacyWheelId,
        itemIndex: item.index,
        text: item.text,
        weight: item.weight,
        parsedYears,
        status: "provisional"
    };
}

function validateResolvedYears(candidate, years, config) {
    assertInteger(years, "INVALID_SOUL_RING_YEARS", "Soul-ring years must be an integer.");
    const minimum = config.yearResolution.minimumLegalYears;
    if (years < minimum) {
        throw new SoulRingDemoError(
            "INVALID_SOUL_RING_YEARS",
            `Soul-ring years must be at least ${minimum}.`,
            { years, minimum }
        );
    }

    if (candidate.parsedYears.status === "parsed") {
        if (candidate.parsedYears.minYears !== null && years < candidate.parsedYears.minYears) {
            throw new SoulRingDemoError(
                "YEARS_OUTSIDE_LEGACY_RANGE",
                "Selected years are below the legacy candidate range.",
                { years, minYears: candidate.parsedYears.minYears }
            );
        }
        if (candidate.parsedYears.maxYears !== null && years > candidate.parsedYears.maxYears) {
            throw new SoulRingDemoError(
                "YEARS_OUTSIDE_LEGACY_RANGE",
                "Selected years are above the legacy candidate range.",
                { years, maxYears: candidate.parsedYears.maxYears }
            );
        }
    }

    return years;
}

export function resolveCandidateYears(candidate, {
    years = null,
    fixedYears = null,
    testOnly = false,
    config
} = {}) {
    assertPlainObject(config, "INVALID_SOUL_RING_DEMO_CONFIG", "Soul-ring Demo config must be a plain object.");
    assertPlainObject(candidate, "INVALID_SOUL_RING_CANDIDATE", "Soul-ring candidate must be a plain object.");

    if (fixedYears !== null) {
        if (testOnly !== true || fixedYears !== config.yearResolution.testOnlyFixedYears) {
            throw new SoulRingDemoError(
                "TEST_FIXTURE_ONLY",
                "Fixed soul-ring years are available only to the explicit test fixture.",
                { fixedYears }
            );
        }
        return validateResolvedYears(candidate, fixedYears, config);
    }

    if (years === null) {
        if (candidate.parsedYears?.exactYears !== null
            && candidate.parsedYears?.exactYears !== undefined) {
            return validateResolvedYears(candidate, candidate.parsedYears.exactYears, config);
        }
        throw new SoulRingDemoError(
            "MANUAL_YEARS_REQUIRED",
            "A range or unresolved legacy candidate requires manual soul-ring years input."
        );
    }

    return validateResolvedYears(candidate, years, config);
}

export function createSoulRingDemo({
    legacyData,
    config,
    player = { level: 10, soulRings: [] },
    rng = Math.random
}) {
    assertValidSoulRingDemoConfig(config);
    assertValidLegacyWheelData(legacyData);
    assertRng(rng);

    const state = {
        status: SOUL_RING_DEMO_STATUS.READY,
        phase: SOUL_RING_DEMO_PHASES.READY,
        gameOver: false,
        outcome: null,
        message: "等待手动开始临时魂环 Demo。",
        sourceStatus: "REFERENCE DATA ONLY",
        rulesStatus: "provisional",
        player: normalizePlayer(player),
        selectedSlot: null,
        selectedWheel: null,
        selectedCandidate: null,
        resolvedRing: null,
        history: [],
        warnings: [
            {
                code: "PROVISIONAL_SOUL_RING_DEMO",
                message: "本 Demo 仅使用旧版参考转盘资料，不代表正式生产规则。",
                path: "config",
                status: "provisional"
            }
        ]
    };

    appendHistory(state, "transition", "临时魂环 Demo 已准备；这条过场记录仅用于展示流程。", {
        sourceStatus: "REFERENCE DATA ONLY"
    });

    function getState() {
        return cloneJsonValue(state);
    }

    function begin({ slot }) {
        ensurePhase(state, SOUL_RING_DEMO_PHASES.READY);
        assertInteger(slot, "INVALID_SOUL_RING_SLOT", "Soul-ring slot must be an integer.");

        if (slot < config.slotRules.minimumSlot || slot > config.slotRules.maximumSlot) {
            throw new SoulRingDemoError("INVALID_SOUL_RING_SLOT", "Soul-ring slot is outside the Demo range.", { slot });
        }

        state.selectedSlot = slot;
        appendHistory(state, "transition", `开始手动抽取${getSlotTitle(slot, config)}。`, { slot });

        if (state.player.level === 0) {
            state.status = SOUL_RING_DEMO_STATUS.IGNORED;
            state.phase = SOUL_RING_DEMO_PHASES.TERMINAL;
            state.gameOver = true;
            state.outcome = "ignored";
            state.message = "0级路线忽略魂环抽取；本次临时 Demo 直接结束。";
            appendHistory(state, "terminal", state.message, { outcome: "ignored" });
            return getState();
        }

        if (state.player.level < config.trigger.minimumLevel) {
            throw new SoulRingDemoError(
                "SOUL_RING_TRIGGER_NOT_MET",
                `临时 Demo 要求等级至少为${config.trigger.minimumLevel}。`,
                { level: state.player.level }
            );
        }

        state.status = SOUL_RING_DEMO_STATUS.WHEEL_SELECTION;
        state.phase = SOUL_RING_DEMO_PHASES.WHEEL_SELECTION;
        state.message = "请选择旧版参考资料中的来源轮盘。";
        return getState();
    }

    function listWheels() {
        if (state.selectedSlot === null) {
            return [];
        }
        return getCandidateWheels(legacyData, state.selectedSlot, config);
    }

    function selectWheel(wheelId) {
        ensurePhase(state, SOUL_RING_DEMO_PHASES.WHEEL_SELECTION);
        const wheel = findWheel(legacyData, wheelId);
        const allowed = listWheels().some(candidate => candidate.id === wheel?.id);
        if (!wheel || !allowed) {
            throw new SoulRingDemoError(
                "INVALID_DEMO_WHEEL_SELECTION",
                "Selected wheel is not an allowed source for this soul-ring slot.",
                { wheelId, slot: state.selectedSlot }
            );
        }

        state.selectedWheel = {
            id: wheel.id,
            legacyWheelId: wheel.legacyWheelId,
            title: wheel.title,
            status: "provisional"
        };
        state.status = SOUL_RING_DEMO_STATUS.CANDIDATE_SELECTION;
        state.phase = SOUL_RING_DEMO_PHASES.CANDIDATE_SELECTION;
        state.message = "请选择一个可用的旧版魂环候选项；零权重项保留但不可选。";
        appendHistory(state, "transition", `已选择旧版来源轮盘 ${wheel.legacyWheelId}。`, {
            wheelId: wheel.id,
            legacyWheelId: wheel.legacyWheelId
        });
        return getState();
    }

    function listItems() {
        if (!state.selectedWheel) {
            return [];
        }
        return getSelectableWheelItems(legacyData, state.selectedWheel.id);
    }

    function chooseCandidate(itemIndex) {
        ensurePhase(state, SOUL_RING_DEMO_PHASES.CANDIDATE_SELECTION);
        const wheel = findWheel(legacyData, state.selectedWheel.id);
        const item = resolveWheelItem(wheel, itemIndex);
        const candidate = getCandidateSummary(item, wheel);
        state.selectedCandidate = candidate;
        state.status = SOUL_RING_DEMO_STATUS.YEAR_INPUT;
        state.phase = SOUL_RING_DEMO_PHASES.YEAR_INPUT;
        state.message = candidate.parsedYears.status === "parsed"
            && candidate.parsedYears.exactYears !== null
            ? `已选择${candidate.text}；可以确认年限。`
            : `已选择${candidate.text}；请手动输入合法年限。`;
        if (item.weight === null) {
            state.warnings.push({
                code: "LEGACY_NULL_WEIGHT_MANUAL_SELECTION",
                message: "该旧版候选项没有权重，仅作为临时 Demo 的手动选择。",
                path: `wheel.${wheel.legacyWheelId}.item.${item.index}`,
                status: "provisional"
            });
        }
        appendHistory(state, "transition", `手动选择候选魂环：${candidate.text}。`, {
            wheelId: wheel.id,
            itemIndex: item.index
        });
        return getState();
    }

    function drawWeightedCandidate() {
        ensurePhase(state, SOUL_RING_DEMO_PHASES.CANDIDATE_SELECTION);
        const wheel = findWheel(legacyData, state.selectedWheel.id);
        const items = getSelectableItems(wheel);
        if (items.some(item => item.weight === null)) {
            throw new SoulRingDemoError(
                "LEGACY_WEIGHTS_UNRESOLVED",
                "This legacy wheel contains null weights; use manual candidate selection."
            );
        }
        const draw = weightedChoice(items, rng);
        state.warnings.push({
            code: "LEGACY_WEIGHTED_ROLL",
            message: "候选项按旧版显式正权重临时抽取；结果仍为 provisional。",
            path: `wheel.${wheel.legacyWheelId}`,
            status: "provisional",
            roll: draw.roll,
            totalWeight: draw.totalWeight,
            selectedItemIndex: draw.item.index
        });
        chooseCandidate(draw.item.index);
        return getState();
    }

    function confirmYears({ years = null, testFixedYears = null } = {}) {
        ensurePhase(state, SOUL_RING_DEMO_PHASES.YEAR_INPUT);
        const resolvedYears = resolveCandidateYears(state.selectedCandidate, {
            years,
            fixedYears: testFixedYears,
            testOnly: testFixedYears !== null,
            config
        });
        state.resolvedRing = {
            slot: state.selectedSlot,
            years: resolvedYears,
            text: state.selectedCandidate.text,
            wheelId: state.selectedCandidate.wheelId,
            legacyWheelId: state.selectedCandidate.legacyWheelId,
            itemIndex: state.selectedCandidate.itemIndex,
            ringType: "normal",
            sourceType: "legacy_reference_demo",
            qualityMultiplier: null,
            status: "provisional"
        };
        state.status = SOUL_RING_DEMO_STATUS.ABSORPTION;
        state.phase = SOUL_RING_DEMO_PHASES.ABSORPTION;
        state.message = "魂环候选已确定；请选择临时 Demo 的吸收结果。";
        appendHistory(state, "transition", `魂环年限暂定为${resolvedYears}年，等待吸收结果。`, {
            years: resolvedYears
        });
        return getState();
    }

    function settleOutcome(outcome) {
        ensurePhase(state, SOUL_RING_DEMO_PHASES.ABSORPTION);
        if (outcome !== "success" && outcome !== "failure") {
            throw new SoulRingDemoError(
                "INVALID_ABSORPTION_OUTCOME",
                "Absorption outcome must be success or failure.",
                { outcome }
            );
        }

        state.outcome = outcome;
        state.gameOver = true;
        state.phase = SOUL_RING_DEMO_PHASES.TERMINAL;
        state.status = outcome === "success"
            ? SOUL_RING_DEMO_STATUS.SUCCESS
            : SOUL_RING_DEMO_STATUS.FAILURE;

        if (outcome === "success") {
            state.player.soulRings.push(cloneJsonValue(state.resolvedRing));
            state.message = `临时 Demo：第${state.resolvedRing.slot}魂环吸收成功，游戏结束。`;
        } else {
            state.message = `临时 Demo：第${state.resolvedRing.slot}魂环吸收失败，游戏结束；魂环未写入。`;
        }

        appendHistory(state, "terminal", state.message, {
            outcome,
            ringCommitted: outcome === "success"
        });
        return getState();
    }

    return Object.freeze({
        getState,
        begin,
        listWheels,
        selectWheel,
        listItems,
        chooseCandidate,
        drawWeightedCandidate,
        confirmYears,
        settleOutcome
    });
}

export {
    RING_LABELS
};
