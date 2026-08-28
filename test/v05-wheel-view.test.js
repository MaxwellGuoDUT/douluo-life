import assert from "node:assert/strict";
import test from "node:test";

import { createApkCharacterState, createApkContentIndex } from "../js/apk-rule-runtime.js";
import {
    createV05WheelSegments,
    createV05WheelView,
    createV05WheelViewFromSpin
} from "../js/v05-wheel-view.js";

function option(id, weight, { enabled = true, requirements = [] } = {}) {
    return {
        id,
        normalized: {
            pool_id: "pool-1",
            option_id: id,
            text: id,
            wheel_label: `label-${id}`,
            weight,
            enabled,
            requirements,
            reroll_when: [],
            effects: []
        },
        availability: { enabled, contentStatus: "formal", optionId: id }
    };
}

function syntheticIndex(flow) {
    const base = createApkContentIndex({
        pools: { records: [{ id: "pool-1", normalized: { pool_id: "pool-1", pool_name: "真实测试池" } }] },
        options: { records: [
            option("a", 3),
            option("b", 1),
            option("disabled", 99, { enabled: false }),
            option("zero", 0),
            option("locked", 20, { requirements: [{ type: "levelAtLeast", value: 99 }] })
        ] }
    });
    return {
        ...base,
        getFlow(id) {
            return id === flow.id ? flow : null;
        }
    };
}

test("wheel segments preserve runtime eligible order, weights, and close at 360 degrees", () => {
    const index = syntheticIndex({
        id: "flow-static",
        route: { pool: { kind: "exact-string", value: "pool-1" } }
    });
    const session = { currentFlowId: "flow-static", character: createApkCharacterState() };
    const before = structuredClone(session);
    const view = createV05WheelView({ contentIndex: index, session });

    assert.equal(view.status, "ready");
    assert.equal(view.title, "真实测试池");
    assert.deepEqual(view.segments.map(segment => segment.optionId), ["a", "b"]);
    assert.deepEqual(view.segments.map(segment => segment.weight), [3, 1]);
    assert.deepEqual(view.segments.map(segment => segment.percentage), [75, 25]);
    assert.equal(view.segments[0].startAngle, 0);
    assert.equal(view.segments.at(-1).endAngle, 360);
    assert.equal(view.segments.reduce((sum, segment) => sum + segment.angle, 0), 360);
    assert.deepEqual(session, before);
});

test("dynamic handler flow returns a presentation boundary without guessing a pool", () => {
    const index = syntheticIndex({
        id: "flow-dynamic",
        route: {
            pool: { kind: "absent" },
            next: { kind: "absent" },
            action: { kind: "exact-string", value: "runtime-handler" }
        }
    });
    const view = createV05WheelView({
        contentIndex: index,
        session: { currentFlowId: "flow-dynamic", character: createApkCharacterState() }
    });
    assert.equal(view.status, "dynamic");
    assert.equal(view.poolId, null);
    assert.deepEqual(view.segments, []);
    assert.match(view.message, /不会猜测/u);
});

test("runtime spin view selects the exact result and does not consume or mutate RNG state", () => {
    const options = [option("a", 3), option("b", 1)];
    const spin = {
        pool: { normalized: { pool_id: "pool-1", pool_name: "抽取快照" } },
        options,
        poolId: "pool-1",
        flowId: "flow-static",
        optionId: "b",
        text: "b"
    };
    const random = { seed: "fixed", cursor: 17 };
    const before = structuredClone({ spin, random });
    const view = createV05WheelViewFromSpin(spin);
    assert.equal(view.selectedOptionId, "b");
    assert.equal(view.segments.find(segment => segment.optionId === "b").percentage, 25);
    assert.deepEqual({ spin, random }, before);
    assert.throws(
        () => createV05WheelViewFromSpin({ ...spin, optionId: "missing" }),
        error => error.code === "V05_WHEEL_RESULT_NOT_ELIGIBLE"
    );
});

test("zero or negative-only candidates cannot form a wheel", () => {
    assert.throws(
        () => createV05WheelSegments([option("zero", 0), option("negative", -1)]),
        error => error.code === "V05_WHEEL_EMPTY"
    );
});
