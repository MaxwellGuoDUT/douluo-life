import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import {
    classifyApkEffect,
    evaluateApkRequirement,
    isApkRecordSelectable,
    selectApkRecords,
    summarizeApkEffects,
    summarizeApkRequirements,
    validateApkCanonicalPackage
} from "../js/apk-content-adapter.js";

const root = process.cwd();
const packageRoot = path.join(root, "data", "apk-canonical");
const index = JSON.parse(
    fs.readFileSync(path.join(packageRoot, "package-index.json"), "utf8")
);

const catalogs = Object.fromEntries(
    Object.keys(index.counts).map(name => [
        name,
        JSON.parse(
            fs.readFileSync(
                path.join(packageRoot, "catalogs", name + ".json"),
                "utf8"
            )
        )
    ])
);

test("APK canonical package validates every generated catalog", () => {
    const result = validateApkCanonicalPackage({
        index,
        catalogs
    });

    assert.equal(result.valid, true, JSON.stringify(result.errors));
    assert.equal(Object.keys(result.catalogResults).length, 10);
});

test("APK soul-beast availability remains selectable by original route state", () => {
    const records = catalogs["soul-beasts-raw"].records;
    assert.equal(selectApkRecords(records).length, 243);
    assert.equal(
        selectApkRecords(records, {
            routeStates: new Set(["current-base"])
        }).length,
        215
    );
    assert.equal(
        selectApkRecords(records, {
            routeStates: new Set(["auxiliary-species-pool"])
        }).length,
        12
    );
    assert.equal(
        selectApkRecords(records, {
            routeStates: new Set(["router-only-dormant"])
        }).length,
        16
    );
});

test("disabled APK options remain in the package but are excluded by default", () => {
    const records = catalogs.options.records;
    assert.equal(records.length, 41637);
    assert.equal(selectApkRecords(records).length, 41241);
    assert.equal(
        selectApkRecords(records, { includeDisabled: true }).length,
        41637
    );
    assert.equal(
        isApkRecordSelectable(
            records.find(record => record.availability.enabled === false)
        ),
        false
    );
});

test("all extracted APK effect and requirement types are recognized", () => {
    const effectSummary = summarizeApkEffects(catalogs.effects.records);
    const requirementSummary = summarizeApkRequirements(
        catalogs.requirements.records
    );

    assert.equal(Object.keys(effectSummary).length, 48);
    assert.equal(Object.keys(requirementSummary).length, 18);
    assert.equal(
        classifyApkEffect(
            catalogs.effects.records.find(
                record => record.normalized.effectType === "addArtifact"
            )
        ).status,
        "player_collection_candidate"
    );
    assert.equal(
        classifyApkEffect(
            catalogs.effects.records.find(
                record => record.normalized.effectType === "death"
            )
        ).status,
        "terminal_control"
    );
});

test("requirement adapter returns typed unresolved instead of guessing", () => {
    const levelRequirement = {
        normalized: {
            requirement: {
                type: "levelAtLeast",
                value: 10
            },
            requirementType: "levelAtLeast"
        }
    };
    const missingStateRequirement = {
        normalized: {
            requirement: {
                type: "inventoryAtLeast",
                itemId: "example",
                amount: 1
            },
            requirementType: "inventoryAtLeast"
        }
    };

    assert.equal(
        evaluateApkRequirement(levelRequirement, { level: 10 }).status,
        "met"
    );
    assert.equal(
        evaluateApkRequirement(levelRequirement, { level: 3 }).status,
        "not_met"
    );
    assert.equal(
        evaluateApkRequirement(missingStateRequirement, {}).status,
        "unresolved"
    );
});

test("lacksDomain follows the APK domain collection and remains unresolved without it", () => {
    const requirement = {
        normalized: {
            requirement: {
                type: "lacksDomain",
                value: "蓝银领域"
            },
            requirementType: "lacksDomain"
        }
    };

    assert.equal(
        evaluateApkRequirement(requirement, { domains: [] }).status,
        "met"
    );
    assert.equal(
        evaluateApkRequirement(requirement, { domains: ["蓝银领域"] }).status,
        "not_met"
    );
    assert.equal(
        evaluateApkRequirement(requirement, {}).status,
        "unresolved"
    );
});

test("soulBonePartCountBelow preserves the APK part-capacity gate", () => {
    const requirement = {
        type: "soulBonePartCountBelow",
        partId: "external",
        value: 2
    };
    assert.equal(
        evaluateApkRequirement(requirement, { soulBones: [] }).status,
        "met"
    );
    assert.equal(
        evaluateApkRequirement(requirement, {
            soulBones: [
                { id: "a", partId: "external" },
                { id: "b", partId: "external" }
            ]
        }).status,
        "not_met"
    );
    assert.equal(
        evaluateApkRequirement(requirement, {}).status,
        "unresolved"
    );
});
