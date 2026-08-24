import assert from "node:assert/strict";
import test from "node:test";

import {
    classifyApkEffect,
    evaluateApkRequirement,
    selectApkRecords
} from "../js/apk-content-adapter.js";

test("V0.5 adapter selection keeps disabled and non-formal evidence out by default", () => {
    const records = [
        { id: "formal", availability: { enabled: true, contentStatus: "formal" } },
        { id: "disabled", availability: { enabled: false, contentStatus: "formal" } },
        { id: "candidate", availability: { enabled: true, contentStatus: "candidate" } }
    ];
    const selected = selectApkRecords(records, {
        contentStatuses: new Set(["formal"])
    });
    assert.deepEqual(selected.map(record => record.id), ["formal"]);
});

test("V0.5 adapter preserves exact supported predicates and typed unresolved boundaries", () => {
    assert.deepEqual(
        evaluateApkRequirement({ type: "levelAtLeast", value: 20 }, { level: 20 }),
        { status: "met", requirementType: "levelAtLeast" }
    );
    assert.equal(
        evaluateApkRequirement({ type: "futureRequirement" }, {}).status,
        "unresolved"
    );
    assert.equal(classifyApkEffect({ type: "changeLevel", amount: 1 }).status,
        "player_scalar_or_flag_candidate");
    assert.equal(classifyApkEffect({ type: "futureEffect" }).status, "unknown");
});
