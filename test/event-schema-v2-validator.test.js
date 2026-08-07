import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
    validateEventEffectsV2,
    validateEventSchemaV2,
    validateEventTriggerV2
} from "../js/event-schema-v2-validator.js";

const testDirectory = dirname(fileURLToPath(import.meta.url));

function readExample(name) {
    const path = resolve(
        testDirectory,
        `../data/v2/examples/${name}.minimal.json`
    );

    return JSON.parse(readFileSync(path, "utf8"));
}

function createValidDataset() {
    return {
        wheels: readExample("wheels"),
        flows: readExample("flows"),
        routes: readExample("routes")
    };
}

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function errorCodes(result) {
    return result.errors.map(error => error.code);
}

test("minimal v2 examples validate without modifying the dataset", () => {
    const dataset = createValidDataset();
    const before = JSON.stringify(dataset);
    const result = validateEventSchemaV2(dataset);

    assert.equal(result.valid, true);
    assert.deepEqual(result.errors, []);
    assert.ok(result.warnings.some(warning => {
        return warning.code === "PROVISIONAL_SESSION_LIMIT"
            && warning.status === "provisional";
    }));
    assert.equal(JSON.stringify(dataset), before);
});

test("wheel validation rejects duplicate ids, invalid fields, and empty pools", () => {
    const dataset = createValidDataset();
    const duplicateWheel = clone(dataset.wheels[0]);

    duplicateWheel.items = [
        {
            ...duplicateWheel.items[0],
            enabled: "yes",
            weight: null,
            canonLevel: "fanfic"
        },
        {
            ...duplicateWheel.items[0],
            weight: 0
        }
    ];
    dataset.wheels.push(duplicateWheel);

    const codes = errorCodes(validateEventSchemaV2(dataset));

    assert.ok(codes.includes("DUPLICATE_WHEEL_ID"));
    assert.ok(codes.includes("DUPLICATE_WHEEL_ITEM_ID"));
    assert.ok(codes.includes("NULL_WEIGHT_FORBIDDEN"));
    assert.ok(codes.includes("INVALID_ENABLED_FLAG"));
    assert.ok(codes.includes("INVALID_CANON_LEVEL"));
    assert.ok(codes.includes("WHEEL_WITHOUT_DRAWABLE_ITEM"));
});

test("advance validation enforces allowed types, targets, and references", () => {
    const cases = [
        {
            next: {
                advance: "later"
            },
            code: "INVALID_ADVANCE_TYPE"
        },
        {
            next: {
                advance: "same_year"
            },
            code: "MISSING_SAME_YEAR_TARGET"
        },
        {
            next: {
                advance: "next_year",
                target: {
                    kind: "flow_node",
                    flowId: "flow_minimal",
                    nodeId: "end"
                }
            },
            code: "INVALID_NEXT_YEAR_TARGET"
        },
        {
            next: {
                advance: "end",
                target: {
                    kind: "flow_node",
                    flowId: "flow_minimal",
                    nodeId: "end"
                }
            },
            code: "FORBIDDEN_STOP_TARGET"
        },
        {
            next: {
                advance: "same_year",
                target: {
                    kind: "flow_node",
                    flowId: "flow_missing",
                    nodeId: "end"
                }
            },
            code: "UNKNOWN_FLOW_REFERENCE"
        }
    ];

    cases.forEach(({ next, code }) => {
        const dataset = createValidDataset();

        dataset.flows[0].nodes[0].next = next;

        assert.ok(errorCodes(validateEventSchemaV2(dataset)).includes(
            code
        ));
    });
});

test("roll and gate reject ambiguous transition ownership", () => {
    const rollDataset = createValidDataset();

    rollDataset.wheels[0].items[0].next = {
        advance: "end"
    };
    assert.ok(errorCodes(validateEventSchemaV2(rollDataset)).includes(
        "CONFLICTING_TRANSITION_SOURCE"
    ));

    const gateDataset = createValidDataset();
    const node = gateDataset.flows[0].nodes[0];

    node.op = "gate";
    delete node.next;
    node.nextByItemId = {};

    assert.ok(errorCodes(validateEventSchemaV2(gateDataset)).includes(
        "MISSING_GATE_ITEM_MAPPING"
    ));
});

test("flow validation rejects missing entry, references, and unsupported ops", () => {
    const dataset = createValidDataset();
    const flow = dataset.flows[0];

    flow.entryNodeId = "missing";
    flow.nodes[0].wheelId = "wheel_missing";
    flow.nodes.push({
        id: "unsupported",
        op: "playerChoice"
    });

    const codes = errorCodes(validateEventSchemaV2(dataset));

    assert.ok(codes.includes("UNKNOWN_FLOW_ENTRY_NODE"));
    assert.ok(codes.includes("UNKNOWN_WHEEL_REFERENCE"));
    assert.ok(codes.includes("UNSUPPORTED_FLOW_OP"));
});

test("repeatWheel and dispatchWheel require explicit sources", () => {
    const repeatDataset = createValidDataset();
    const repeatNode = repeatDataset.flows[0].nodes[0];

    repeatNode.op = "repeatWheel";
    delete repeatNode.wheelId;
    delete repeatNode.next;

    let codes = errorCodes(validateEventSchemaV2(repeatDataset));

    assert.ok(codes.includes("INVALID_REPEAT_COUNT_SOURCE"));
    assert.ok(codes.includes("MISSING_REPEAT_WHEEL_SOURCE"));

    const dispatchDataset = createValidDataset();
    const dispatchNode = dispatchDataset.flows[0].nodes[0];

    dispatchNode.op = "dispatchWheel";
    delete dispatchNode.wheelId;
    delete dispatchNode.next;

    codes = errorCodes(validateEventSchemaV2(dispatchDataset));
    assert.ok(codes.includes("INVALID_DISPATCH_SOURCE"));
    assert.ok(codes.includes("MISSING_DISPATCH_MAPPING"));
});

test("unbounded cycles and nodes without a stop path are rejected", () => {
    const dataset = createValidDataset();
    const flow = dataset.flows[0];

    delete flow.sessionLimits;
    flow.entryNodeId = "a";
    flow.nodes = [
        {
            id: "a",
            op: "roll",
            wheelId: "wheel_minimal",
            next: {
                advance: "same_year",
                target: {
                    kind: "flow_node",
                    flowId: "flow_minimal",
                    nodeId: "b"
                }
            }
        },
        {
            id: "b",
            op: "roll",
            wheelId: "wheel_minimal",
            next: {
                advance: "same_year",
                target: {
                    kind: "flow_node",
                    flowId: "flow_minimal",
                    nodeId: "a"
                }
            }
        }
    ];

    const codes = errorCodes(validateEventSchemaV2(dataset));

    assert.ok(codes.includes("UNBOUNDED_FLOW_CYCLE"));
    assert.ok(codes.includes("FLOW_NODE_WITHOUT_STOP_PATH"));
});

test("route validation enforces lane, mutex, policy, and entry references", () => {
    const dataset = createValidDataset();
    const route = dataset.routes[0];

    route.lane = "unknown";
    route.mutexGroups = ["group", "group"];
    route.conflictPolicy = "replace";
    route.reviewStatus = "provisional";
    route.entry.nodeId = "missing";

    const codes = errorCodes(validateEventSchemaV2(dataset));

    assert.ok(codes.includes("INVALID_ROUTE_LANE"));
    assert.ok(codes.includes("DUPLICATE_ROUTE_MUTEX_GROUP"));
    assert.ok(codes.includes("UNCONFIRMED_DESTRUCTIVE_ROUTE_POLICY"));
    assert.ok(codes.includes("UNKNOWN_ROUTE_ENTRY_NODE"));
});

test("trigger validation checks scope, op, path, and dynamic Player paths", () => {
    const result = validateEventTriggerV2({
        unknownScope: true,
        attributes: {
            "": {
                eq: 1
            },
            level: {
                approximately: 10
            }
        },
        nestedState: {
            martialSouls: {
                slot: 1
            }
        }
    });

    assert.ok(errorCodes(result).includes("INVALID_TRIGGER_SCOPE"));
    assert.ok(errorCodes(result).includes("EMPTY_TRIGGER_PATH"));
    assert.ok(errorCodes(result).includes("INVALID_TRIGGER_OP"));
    assert.ok(result.warnings.some(warning => {
        return warning.code === "DYNAMIC_PLAYER_PATH_UNVERIFIED";
    }));
});

test("effects validation protects age and every derived combat path", () => {
    [
        "combatPower",
        "staticCombatPower",
        "effectiveCombatPower"
    ].forEach(path => {
        const result = validateEventEffectsV2({
            [path]: 1
        });

        assert.ok(errorCodes(result).includes(
            "FORBIDDEN_DERIVED_COMBAT_EFFECT"
        ));
    });

    const result = validateEventEffectsV2({
        age: 1,
        "": 1,
        "martialSouls.0.soulRings": {
            add: {
                years: 100
            }
        }
    });

    assert.ok(errorCodes(result).includes("FORBIDDEN_AGE_EFFECT"));
    assert.ok(errorCodes(result).includes("EMPTY_EFFECT_PATH"));
    assert.ok(errorCodes(result).includes(
        "UNSUPPORTED_NESTED_EFFECT_PATH"
    ));
    assert.ok(result.warnings.some(warning => {
        return warning.code === "DYNAMIC_PLAYER_PATH_UNVERIFIED";
    }));
});

test("effects allow only registered Player v2 path/operation pairs", () => {
    const valid = validateEventEffectsV2({
        level: 1,
        money: -2,
        faction: {
            set: "武魂殿"
        },
        activeMartialSoulInstanceId: {
            set: "martial_soul_slot_1"
        },
        martialSouls: {
            add: {
                instanceId: "martial_soul_slot_1"
            }
        },
        domains: {
            add: {
                definitionId: "domain_test"
            }
        }
    });
    const invalid = validateEventEffectsV2({
        name: 1,
        flags: {
            setKey: {
                key: "route",
                value: true
            }
        },
        title: {
            set: "称号",
            add: "冲突"
        },
        activeMartialSoulInstanceId: {
            set: ""
        },
        martialSouls: {
            add: []
        }
    });

    assert.deepEqual(valid, {
        valid: true,
        errors: [],
        warnings: []
    });
    assert.ok(errorCodes(invalid).includes(
        "EFFECT_PATH_NOT_ALLOWED_FOR_OP"
    ));
    assert.ok(errorCodes(invalid).includes(
        "UNSUPPORTED_NESTED_EFFECT_OPERATION"
    ));
    assert.ok(errorCodes(invalid).includes(
        "CONFLICTING_EFFECT_OPERATIONS"
    ));
    assert.ok(errorCodes(invalid).includes("INVALID_EFFECT_VALUE"));
});
