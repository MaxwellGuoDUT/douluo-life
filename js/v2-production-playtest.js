import { validateEventSchemaV2 } from "./event-schema-v2-validator.js";
import {
    clonePlayerStateValue,
    createPlayerV2
} from "./player-v2.js";
import {
    V2AnnualFlowResolutionError,
    resolveAnnualFlowForPlayer
} from "./v2-annual-flow-resolver.js";
import { V2SessionRunner } from "./v2-session-runner.js";

export const V2_PRODUCTION_PLAYTEST_STATUS = Object.freeze({
    READY: "ready",
    CONTENT_BOUNDARY: "content_boundary"
});

const PLAYTEST_START_AGE = 6;
const CURRENT_CONTENT_BOUNDARY_AGE = 7;

function isPlainObject(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return false;
    }

    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
}

function fail(code, message, details = {}) {
    throw new V2ProductionPlaytestError(code, message, details);
}

function validateProductionDataset(dataset) {
    if (!isPlainObject(dataset)) {
        fail(
            "INVALID_PRODUCTION_DATASET",
            "V2 production playtest requires a JSON dataset."
        );
    }

    const ownedDataset = clonePlayerStateValue(dataset);
    const validation = validateEventSchemaV2(ownedDataset);

    if (!validation.valid) {
        fail(
            "INVALID_PRODUCTION_DATASET",
            "V2 production dataset failed Event Schema v2 validation.",
            validation
        );
    }

    if (ownedDataset.contentStatus !== "production") {
        fail(
            "NON_PRODUCTION_DATASET",
            "V2 production playtest refuses non-production content.",
            {
                expected: "production",
                actual: ownedDataset.contentStatus ?? null
            }
        );
    }

    return ownedDataset;
}

function assertCanonFlow(flow) {
    if (flow.canonLevel !== "canon") {
        fail(
            "ANNUAL_FLOW_NOT_CANON",
            "V2 production playtest only executes canon annual flows.",
            {
                flowId: flow.id,
                canonLevel: flow.canonLevel ?? null
            }
        );
    }

    return flow;
}

function resolveProductionFlow(player, dataset) {
    return assertCanonFlow(resolveAnnualFlowForPlayer({
        player,
        registry: dataset.annualFlowRegistry,
        flows: dataset.flows
    }));
}

function resolveSelectedItem(dataset, result) {
    const spin = result.spins.at(-1);
    const wheels = dataset.wheels.filter(wheel => wheel?.id === spin?.wheelId);
    const items = wheels.length === 1
        ? wheels[0].items.filter(item => item?.id === spin?.itemId)
        : [];

    if (items.length !== 1) {
        fail(
            "PRODUCTION_RESULT_ITEM_NOT_FOUND",
            "The committed production spin must resolve to exactly one item.",
            {
                wheelId: spin?.wheelId ?? null,
                itemId: spin?.itemId ?? null,
                matches: items.length
            }
        );
    }

    if (items[0].reviewStatus !== "confirmed") {
        fail(
            "PRODUCTION_RESULT_ITEM_NOT_CONFIRMED",
            "V2 production playtest only displays confirmed result items.",
            {
                itemId: items[0].id,
                reviewStatus: items[0].reviewStatus ?? null
            }
        );
    }

    return clonePlayerStateValue(items[0]);
}

function isCurrentContentBoundary(error, beforePlayer, result) {
    return error instanceof V2AnnualFlowResolutionError
        && error.code === "NO_ANNUAL_FLOW_FOR_AGE"
        && beforePlayer.age === PLAYTEST_START_AGE
        && result.player.age === CURRENT_CONTENT_BOUNDARY_AGE
        && result.annualRecord.age === PLAYTEST_START_AGE
        && result.annualRecord.nextAge === CURRENT_CONTENT_BOUNDARY_AGE
        && result.annualRecord.advance === "next_year";
}

export class V2ProductionPlaytestError extends Error {
    constructor(code, message, details = {}) {
        super(message);
        this.name = "V2ProductionPlaytestError";
        this.code = code;
        this.details = details;
    }
}

export function createAgeSixProductionPlayer() {
    const player = createPlayerV2();
    player.age = PLAYTEST_START_AGE;
    return player;
}

export class V2ProductionPlaytest {
    constructor({
        dataset,
        combatPowerRules,
        rng = Math.random
    } = {}) {
        if (typeof rng !== "function") {
            fail("INVALID_RNG", "V2 production playtest requires an RNG function.");
        }

        this.dataset = validateProductionDataset(dataset);
        this.combatPowerRules = combatPowerRules === undefined
            ? undefined
            : clonePlayerStateValue(combatPowerRules);
        this.rng = rng;
        this.player = createAgeSixProductionPlayer();
        this.status = V2_PRODUCTION_PLAYTEST_STATUS.READY;
        this.executionCount = 0;
        this.lastResult = null;
        this.boundary = null;
        this.currentFlowId = resolveProductionFlow(
            this.player,
            this.dataset
        ).id;
    }

    getState() {
        return clonePlayerStateValue({
            status: this.status,
            player: this.player,
            currentFlowId: this.currentFlowId,
            executionCount: this.executionCount,
            lastResult: this.lastResult,
            boundary: this.boundary
        });
    }

    runYear({
        sessionId,
        seed,
        rng = this.rng
    } = {}) {
        if (this.status === V2_PRODUCTION_PLAYTEST_STATUS.CONTENT_BOUNDARY) {
            return {
                ...this.getState(),
                executed: false
            };
        }

        const beforePlayer = clonePlayerStateValue(this.player);
        const flow = resolveProductionFlow(beforePlayer, this.dataset);
        const nextSequence = this.executionCount + 1;
        const resolvedSessionId = sessionId
            ?? `v2_production_age_${String(beforePlayer.age).padStart(3, "0")}_${nextSequence}`;
        const resolvedSeed = seed ?? `${resolvedSessionId}_seed`;
        const runner = new V2SessionRunner({
            flow,
            wheelsById: this.dataset.wheels,
            allowedCanonLevels: ["canon"],
            combatPowerRules: this.combatPowerRules
        });
        const result = runner.run({
            player: beforePlayer,
            sessionId: resolvedSessionId,
            seed: resolvedSeed,
            rng
        });
        const selectedItem = resolveSelectedItem(this.dataset, result);
        let nextStatus = V2_PRODUCTION_PLAYTEST_STATUS.READY;
        let nextFlowId;
        let boundary = null;

        try {
            nextFlowId = resolveProductionFlow(result.player, this.dataset).id;
        } catch (error) {
            if (!isCurrentContentBoundary(error, beforePlayer, result)) {
                throw error;
            }

            nextStatus = V2_PRODUCTION_PLAYTEST_STATUS.CONTENT_BOUNDARY;
            nextFlowId = null;
            boundary = {
                code: "CONTENT_BOUNDARY_REACHED",
                age: result.player.age,
                message: "当前 production 内容边界已到达 7 岁。"
            };
        }

        this.player = clonePlayerStateValue(result.player);
        this.status = nextStatus;
        this.currentFlowId = nextFlowId;
        this.executionCount = nextSequence;
        this.lastResult = {
            ...clonePlayerStateValue(result),
            selectedItem
        };
        this.boundary = boundary;

        return {
            ...this.getState(),
            executed: true
        };
    }
}

export default V2ProductionPlaytest;
