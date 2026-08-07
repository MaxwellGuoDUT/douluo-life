import {
    assertValidPlayerV2,
    clonePlayerStateValue
} from "./player-v2.js";

function isPlainObject(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return false;
    }

    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
}

function fail(code, message, details = {}) {
    throw new V2AnnualFlowResolutionError(code, message, details);
}

export class V2AnnualFlowResolutionError extends Error {
    constructor(code, message, details = {}) {
        super(message);
        this.name = "V2AnnualFlowResolutionError";
        this.code = code;
        this.details = details;
    }
}

export function resolveAnnualFlowForPlayer({
    player,
    registry,
    flows
} = {}) {
    assertValidPlayerV2(player);

    if (!isPlainObject(registry)
        || registry.schemaVersion !== "annual-flow-registry/1.0"
        || !Array.isArray(registry.entries)) {
        fail(
            "INVALID_ANNUAL_FLOW_REGISTRY",
            "Annual flow registry requires schemaVersion and entries."
        );
    }

    if (!Array.isArray(flows)) {
        fail("INVALID_ANNUAL_FLOW_COLLECTION", "flows must be an array.");
    }

    const entries = registry.entries.filter(entry => entry?.age === player.age);

    if (entries.length !== 1) {
        fail(
            entries.length === 0
                ? "NO_ANNUAL_FLOW_FOR_AGE"
                : "AMBIGUOUS_ANNUAL_FLOW_FOR_AGE",
            `Expected exactly one annual flow entry for age ${player.age}.`,
            {
                age: player.age,
                matches: entries.length
            }
        );
    }

    const [entry] = entries;

    if (entry.reviewStatus !== "confirmed") {
        fail(
            "ANNUAL_FLOW_ENTRY_NOT_CONFIRMED",
            "Production annual flow entries must be confirmed.",
            {
                age: player.age,
                reviewStatus: entry.reviewStatus ?? null
            }
        );
    }

    const matches = flows.filter(flow => flow?.id === entry.flowId);

    if (matches.length !== 1) {
        fail(
            "ANNUAL_FLOW_REFERENCE_INVALID",
            `Annual flow entry must reference exactly one flow "${String(entry.flowId)}".`,
            {
                flowId: entry.flowId ?? null,
                matches: matches.length
            }
        );
    }

    const [flow] = matches;

    if (flow.reviewStatus !== "confirmed") {
        fail(
            "ANNUAL_FLOW_NOT_CONFIRMED",
            "Production annual flows must be confirmed.",
            {
                flowId: flow.id,
                reviewStatus: flow.reviewStatus ?? null
            }
        );
    }

    return clonePlayerStateValue(flow);
}

export default resolveAnnualFlowForPlayer;
