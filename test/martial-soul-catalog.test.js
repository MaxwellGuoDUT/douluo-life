import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
    AWAKENING_FORMS,
    AWAKENING_QUALITY_GRADES,
    getMartialSoulCatalogStats,
    validateMartialSoulCatalog
} from "../js/production-awakening.js";

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, "..");

function readJson(relativePath) {
    return JSON.parse(readFileSync(resolve(testDirectory, relativePath), "utf8"));
}

function sha256(path) {
    return createHash("sha256").update(readFileSync(path)).digest("hex").toUpperCase();
}

test("approved production catalog has the exact 271-item main-mode boundary", () => {
    const catalog = readJson("../data/v2/catalogs/martial-souls.json");
    const before = JSON.stringify(catalog);
    const validation = validateMartialSoulCatalog(catalog);
    const stats = getMartialSoulCatalogStats(catalog);

    assert.equal(validation.valid, true, JSON.stringify(validation.errors));
    assert.equal(JSON.stringify(catalog), before);
    assert.equal(catalog.catalogVersion, "martial-souls/1.1");
    assert.equal(catalog.reviewDecision, "MARTIAL_SOUL_CAPACITY_REVIEW_2026-08-10");
    assert.equal(catalog.approvedDecisionCount, 14);
    assert.equal(stats.total, 271);
    assert.deepEqual(stats.canonLevels, {
        canon: 233,
        expanded: 38,
        crossover: 0,
        parody: 0
    });
    assert.equal(stats.duplicateNames, 0);
    assert.equal(stats.duplicateIds, 0);
    assert.deepEqual(Object.keys(stats.forms).sort(), [...AWAKENING_FORMS].sort());
    assert.deepEqual(
        Object.keys(stats.qualities).sort(),
        [...AWAKENING_QUALITY_GRADES].sort()
    );
    assert.ok(catalog.definitions.every(definition => {
        return definition.reviewStatus === "confirmed"
            && definition.enabled === true
            && ["canon", "expanded"].includes(definition.canonLevel)
            && Array.isArray(definition.attributes);
    }));
});

test("all 20 approved form-quality cells have the reviewed capacity", () => {
    const catalog = readJson("../data/v2/catalogs/martial-souls.json");
    const stats = getMartialSoulCatalogStats(catalog);

    assert.deepEqual(stats.grid, {
        tool: { low: 19, ordinary: 26, top: 29, extreme: 10 },
        beast: { low: 4, ordinary: 44, top: 46, extreme: 25 },
        plant: { low: 13, ordinary: 4, top: 6, extreme: 9 },
        food: { low: 4, ordinary: 4, top: 4, extreme: 4 },
        body: { low: 4, ordinary: 4, top: 6, extreme: 6 }
    });
    AWAKENING_FORMS.forEach(form => {
        AWAKENING_QUALITY_GRADES.forEach(quality => {
            assert.ok(stats.grid[form][quality] >= 4, `${form}/${quality}`);
        });
    });
    assert.deepEqual(stats.forms, {
        tool: 84,
        beast: 119,
        plant: 32,
        food: 16,
        body: 20
    });
    assert.deepEqual(stats.qualities, {
        low: 44,
        ordinary: 82,
        top: 91,
        extreme: 54
    });
});

test("named acceptance anchors and all 14 approved decisions are materialized", () => {
    const catalog = readJson("../data/v2/catalogs/martial-souls.json");
    const decisions = readJson(
        "../data/v2/catalogs/martial-soul-review-decisions-2026-08-10.json"
    );
    const byId = new Map(catalog.definitions.map(definition => [definition.id, definition]));
    const byName = new Map(catalog.definitions.map(definition => [definition.name, definition]));

    assert.deepEqual(
        (({ form, qualityGrade, attributes }) => ({ form, qualityGrade, attributes }))(
            byName.get("阑尾")
        ),
        { form: "body", qualityGrade: "low", attributes: ["普通"] }
    );
    assert.deepEqual(
        (({ form, qualityGrade, attributes }) => ({ form, qualityGrade, attributes }))(
            byName.get("佛跳墙")
        ),
        { form: "food", qualityGrade: "extreme", attributes: ["普通"] }
    );
    ["六翼天使", "海神", "死灵圣法神", "血魂魔傀", "死神魔傀"]
        .forEach(name => assert.equal(byName.get(name).form, "body"));

    assert.equal(decisions.status, "approved");
    assert.equal(decisions.decision, "all_accepted");
    assert.equal(decisions.decisions.length, 14);
    decisions.decisions.forEach(decision => {
        const definition = byId.get(decision.definitionId);
        assert.ok(definition, decision.definitionId);
        assert.equal(definition.form, decision.confirmedForm);
        assert.equal(definition.qualityGrade, decision.confirmedQualityGrade);
        assert.equal(
            definition.reviewDecision,
            "MARTIAL_SOUL_CAPACITY_REVIEW_2026-08-10"
        );
    });
});

test("read-only generator check is deterministic and preserves the source workbook", () => {
    const sourceWorkbook = resolve(
        repositoryRoot,
        "outputs/019feb1f-67df-7000-b2a0-65bcc1340042/MARTIAL_SOUL_REVIEW_2026-08-10.xlsx"
    );
    const decisions = resolve(
        repositoryRoot,
        "data/v2/catalogs/martial-soul-review-decisions-2026-08-10.json"
    );
    const catalog = resolve(repositoryRoot, "data/v2/catalogs/martial-souls.json");
    const generator = resolve(repositoryRoot, "tools/generate_martial_soul_catalog.py");
    const python = resolve(
        process.env.USERPROFILE,
        ".cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe"
    );
    const beforeHash = sha256(sourceWorkbook);

    assert.equal(existsSync(python), true, `Bundled Python was not found: ${python}`);
    const execution = spawnSync(python, [
        generator,
        "--input", sourceWorkbook,
        "--decisions", decisions,
        "--output", catalog,
        "--check"
    ], {
        cwd: repositoryRoot,
        encoding: "utf8"
    });

    assert.equal(execution.status, 0, execution.stderr || execution.stdout);
    assert.equal(sha256(sourceWorkbook), beforeHash);
    assert.equal(
        beforeHash,
        "78BDC7F2FFEFD3529B690265490855EC641F8AF7F841EF1D057034D4EE4426FA"
    );
});
