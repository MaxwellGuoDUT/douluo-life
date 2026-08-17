import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import test from "node:test";

import {
    commitApkRouteOption,
    createApkRouteContentIndex,
    createApkRouteDynamicHandlers,
    createApkRouteSession,
    drawApkRouteStep
} from "../js/apk-route-runtime.js";

const ROOT = process.cwd();
const CATALOG_ROOT = "data/apk-canonical/catalogs";

function readCatalog(name) {
    return JSON.parse(fs.readFileSync(
        `${ROOT}/${CATALOG_ROOT}/${name}`,
        "utf8"
    ));
}

test("fixed APK route seed preserves the first 83 results and commits result 84", () => {
    const routeGraph = readCatalog("route-graph.json");
    const contentIndex = createApkRouteContentIndex({
        routeGraph,
        formalSpecialResultEvidence: readCatalog(
            "formal-special-result-runtime-evidence.json"
        ),
        humanSoulRingEvidence: readCatalog(
            "human-soul-ring-runtime-evidence.json"
        ),
        humanSoulRingSpeciesEvidence: readCatalog(
            "human-soul-ring-species-runtime-evidence.json"
        ),
        combatPowerEvidence: readCatalog("combat-power-runtime-evidence.json"),
        packId: "douluo1"
    });
    const session = createApkRouteSession({
        routeGraph,
        packId: "douluo1",
        seed: "apk-route-demo-seed"
    });
    const handlers = createApkRouteDynamicHandlers({ contentIndex });
    const transcript = [];
    let result84;

    for (let step = 1; step <= 84; step += 1) {
        const spin = drawApkRouteStep({
            contentIndex,
            session,
            ...handlers
        });
        transcript.push({
            flowId: spin.flowId,
            poolId: spin.poolId,
            optionId: spin.optionId
        });
        const committed = commitApkRouteOption({
            contentIndex,
            session,
            spin,
            ...handlers
        });
        if (step === 84) result84 = { spin, committed };
    }

    const prefixDigest = crypto
        .createHash("sha256")
        .update(JSON.stringify(transcript.slice(0, 83)))
        .digest("hex");
    assert.equal(
        prefixDigest,
        "5d06fefdc351e1e803ba260567bfc7fd5e35a20d6bc8f6cd1aba2ee0e9d0349c"
    );
    assert.deepEqual(transcript[82], {
        flowId: "humanRingType3",
        poolId: "385a54cb-a18c-4232-a2a4-f4508cad7fbc",
        optionId: "838519"
    });
    assert.deepEqual(transcript[83], {
        flowId: "humanRingSpecies4",
        poolId: "917a611f-c50b-4c67-9b27-da19f136e5c5",
        optionId: "bddfef"
    });
    assert.equal(result84.committed.nextFlowId, "humanAfterSoulRing");
    assert.equal(session.random.cursor, 84);
    assert.equal(session.history.length, 84);
    assert.equal(session.character.age, 21);
    assert.equal(session.character.level, 32);
    assert.equal(session.character.martialSouls.length, 1);
    assert.equal(session.character.martialSouls[0].rings.length, 3);
    assert.deepEqual(session.character.martialSouls[0].rings[2], {
        years: 2000,
        name: "2000年魂环",
        source: {
            optionId: "e6fc15",
            text: "2000年魂环"
        },
        typeSelection: {
            optionId: "838519",
            text: "地龙种"
        },
        speciesSelection: {
            optionId: "bddfef",
            text: "土龙（真龙血脉比较纯粹的地龙，自带极致土属性，若血脉融合则叠加）"
        }
    });
    assert.equal(session.character.elementProgress.earth, 2);
    assert.equal(session.character.pendingRing.years, 2000);
    assert.deepEqual(session.character.pendingRing.speciesSelection, {
        optionId: "bddfef",
        text: "土龙（真龙血脉比较纯粹的地龙，自带极致土属性，若血脉融合则叠加）"
    });
    assert.equal(session.routeStatus, "ready");
});

test("fixed APK route seed continues to the next real unresolved boundary", () => {
    const routeGraph = readCatalog("route-graph.json");
    const contentIndex = createApkRouteContentIndex({
        routeGraph,
        formalSpecialResultEvidence: readCatalog(
            "formal-special-result-runtime-evidence.json"
        ),
        humanSoulRingEvidence: readCatalog(
            "human-soul-ring-runtime-evidence.json"
        ),
        humanSoulRingSpeciesEvidence: readCatalog(
            "human-soul-ring-species-runtime-evidence.json"
        ),
        combatPowerEvidence: readCatalog("combat-power-runtime-evidence.json"),
        packId: "douluo1"
    });
    const session = createApkRouteSession({
        routeGraph,
        packId: "douluo1",
        seed: "apk-route-demo-seed"
    });
    const handlers = createApkRouteDynamicHandlers({ contentIndex });

    for (let step = 1; step <= 218; step += 1) {
        const spin = drawApkRouteStep({
            contentIndex,
            session,
            ...handlers
        });
        commitApkRouteOption({
            contentIndex,
            session,
            spin,
            ...handlers
        });
    }

    const spin = drawApkRouteStep({
        contentIndex,
        session,
        ...handlers
    });
    assert.deepEqual({
        flowId: spin.flowId,
        poolId: spin.poolId,
        optionId: spin.optionId
    }, {
        flowId: "douluo1:flow.official-beast.pool.f2abac93-6b26-4e3e-aa92-a168db671577",
        poolId: "f2abac93-6b26-4e3e-aa92-a168db671577",
        optionId: "f16385"
    });
    assert.throws(
        () => commitApkRouteOption({
            contentIndex,
            session,
            spin,
            ...handlers
        }),
        error => error.code === "APK_ROUTE_DYNAMIC_OPTION_UNRESOLVED"
            && error.details.operationId === "beast.element.unresolved"
            && error.details.operationStatus === "unresolved"
    );
    assert.equal(session.random.cursor, 219);
    assert.equal(session.history.length, 218);
    assert.equal(session.character.age, 58);
    assert.equal(session.character.level, 91);
    assert.equal(session.currentFlowId, "douluo1:flow.official-beast.pool.f2abac93-6b26-4e3e-aa92-a168db671577");
    assert.equal(session.routeStatus, "drawn");
});
