import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { createPlayerV2 } from "../js/player-v2.js";
import { V2DemoUI } from "../js/ui-v2-demo.js";

const testDirectory = dirname(fileURLToPath(import.meta.url));

class FakeElement {
    constructor(id = null) {
        this.id = id;
        this.children = [];
        this.dataset = {};
        this.disabled = false;
        this.hidden = false;
        this.textContent = "";
    }

    append(...children) {
        this.children.push(...children);
    }

    replaceChildren(...children) {
        this.children = [...children];
    }
}

class FakeDocument {
    constructor() {
        this.elements = new Map();
    }

    getElementById(id) {
        if (!this.elements.has(id)) {
            this.elements.set(id, new FakeElement(id));
        }
        return this.elements.get(id);
    }

    createElement() {
        return new FakeElement();
    }
}

function createUI() {
    const documentRef = new FakeDocument();
    return {
        documentRef,
        ui: new V2DemoUI(documentRef)
    };
}

function martialSoulResult(slot) {
    const qualities = ["low", "ordinary", "top", "extreme"];
    const forms = ["tool", "beast", "plant", "body"];
    return {
        slot,
        definitionId: `definition_${slot}`,
        name: `武魂 ${slot}`,
        form: forms[slot - 1],
        qualityGrade: qualities[slot - 1],
        attributes: slot === 1 ? [] : [`属性 ${slot}`],
        qualityCombatCoefficient: [0, 0.1, 0.25, 0.3][slot - 1]
    };
}

test("V2 UI renders every real martial-soul slot from one through four", async t => {
    for (const count of [1, 2, 3, 4]) {
        await t.test(`${count} slot`, () => {
            const { ui } = createUI();
            const results = Array.from({ length: count }, (_, index) => {
                return martialSoulResult(index + 1);
            });

            ui.renderMartialSouls(results);
            assert.equal(ui.martialSoulList.children.length, count);
            ui.martialSoulList.children.forEach((item, index) => {
                assert.equal(item.dataset.definitionId, `definition_${index + 1}`);
                assert.equal(item.children[0].textContent, `槽位 ${index + 1} · 武魂 ${index + 1}`);
                assert.match(item.children[1].textContent, /definitionId：definition_/);
                assert.match(item.children[1].textContent, /品质战力加成：/);
            });
        });
    }
});

test("V2 UI initial, busy, and structured-error states remain explicit", () => {
    const { ui } = createUI();
    const player = createPlayerV2();
    player.age = 6;

    ui.renderInitial({
        player,
        currentFlowId: "flow_age_6_production_martial_soul_awakening",
        catalogVersion: "martial-souls/1.1",
        probabilityVersion: "awakening-probabilities/1.2"
    });
    assert.equal(ui.root.dataset.status, "ready");
    assert.equal(ui.fields.age.textContent, "6 岁");
    assert.equal(ui.fields.innateSoulPower.textContent, "未觉醒");
    assert.equal(ui.martialSoulList.children[0].textContent, "尚未觉醒");

    ui.renderBusy();
    ui.setButton("年度执行中…", true);
    assert.equal(ui.root.dataset.status, "running");
    assert.equal(ui.button.disabled, true);

    ui.renderError({
        code: "NO_ELIGIBLE_MARTIAL_SOUL_DEFINITION",
        message: "No eligible definition.",
        details: { slot: 4, form: "body", qualityGrade: "extreme" }
    });
    assert.equal(ui.root.dataset.status, "error");
    assert.match(ui.fields.error.textContent, /NO_ELIGIBLE_MARTIAL_SOUL_DEFINITION/);
    assert.match(ui.fields.error.textContent, /"slot": 4/);
});

test("browser entry loads production inputs and guards duplicate execution", () => {
    const html = readFileSync(resolve(testDirectory, "../v2-demo.html"), "utf8");
    const app = readFileSync(resolve(testDirectory, "../js/app-v2-demo.js"), "utf8");

    assert.match(app, /data\/v2\/catalogs\/martial-souls\.json/);
    assert.match(app, /data\/v2\/config\/awakening-probabilities\.json/);
    assert.match(app, /if \(state\.busy \|\| !state\.playtest\) return;/);
    assert.match(app, /state\.busy = true;/);
    assert.match(app, /state\.busy = false;/);
    assert.doesNotMatch(app, /blue_silver_grass|soft_bone_rabbit|clear_sky_hammer/);
    assert.match(html, /id="martialSoulList"/);
    assert.match(html, /这是从 6 岁开始的场景测试，不包含 0～5 岁履历/);
});
