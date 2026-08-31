import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import {
    APK_ROUTE_OPERATION_REGISTRY,
    commitApkRouteOption,
    createApkRouteContentIndex,
    createApkRouteDynamicHandlers,
    createApkRouteSession,
    drawApkRouteStep,
    resolveApkRoutePool,
    runApkRouteStep
} from "../js/apk-route-runtime.js";

let realRouteGraph;
let realFormalSpecialResultEvidence;
let realHumanSoulRingEvidence;
let realFollowUpPrepareEvidence;
let realHumanSoulRingSpeciesEvidence;
let realOfficialBeastElementEvidence;

function loadRealRouteGraph() {
    if (!realRouteGraph) {
        const shard = JSON.parse(fs.readFileSync(
            new URL(
                "../data/apk-canonical/catalogs/route-graph.douluo1.json",
                import.meta.url
            ),
            "utf8"
        ));
        realRouteGraph = {
            schemaVersion: "apk-route-graph/1.0",
            packageVersion: shard.packageVersion,
            status: shard.status,
            source: shard.source,
            generatedBy: shard.generatedBy,
            packs: [shard.pack],
            diagnostics: shard.diagnostics
        };
    }
    return realRouteGraph;
}

function loadRealFormalSpecialResultEvidence() {
    realFormalSpecialResultEvidence ??= JSON.parse(fs.readFileSync(
        new URL(
            "../data/apk-canonical/catalogs/formal-special-result-runtime-evidence.json",
            import.meta.url
        ),
        "utf8"
    ));
    return realFormalSpecialResultEvidence;
}

function loadRealHumanSoulRingEvidence() {
    realHumanSoulRingEvidence ??= JSON.parse(fs.readFileSync(
        new URL(
            "../data/apk-canonical/catalogs/human-soul-ring-runtime-evidence.json",
            import.meta.url
        ),
        "utf8"
    ));
    return realHumanSoulRingEvidence;
}

function loadRealFollowUpPrepareEvidence() {
    realFollowUpPrepareEvidence ??= JSON.parse(fs.readFileSync(
        new URL(
            "../data/apk-canonical/catalogs/followup-prepare-runtime-evidence.json",
            import.meta.url
        ),
        "utf8"
    ));
    return realFollowUpPrepareEvidence;
}

function loadRealHumanSoulRingSpeciesEvidence() {
    realHumanSoulRingSpeciesEvidence ??= JSON.parse(fs.readFileSync(
        new URL(
            "../data/apk-canonical/catalogs/human-soul-ring-species-runtime-evidence.json",
            import.meta.url
        ),
        "utf8"
    ));
    return realHumanSoulRingSpeciesEvidence;
}

function loadRealOfficialBeastElementEvidence() {
    realOfficialBeastElementEvidence ??= JSON.parse(fs.readFileSync(
        new URL(
            "../data/apk-canonical/catalogs/official-beast-element-runtime-evidence.json",
            import.meta.url
        ),
        "utf8"
    ));
    return realOfficialBeastElementEvidence;
}

function realSoulRingContentIndex({ includeSpeciesEvidence = true } = {}) {
    return createApkRouteContentIndex({
        routeGraph: loadRealRouteGraph(),
        packId: "douluo1",
        humanSoulRingEvidence: loadRealHumanSoulRingEvidence(),
        ...(includeSpeciesEvidence
            ? { humanSoulRingSpeciesEvidence: loadRealHumanSoulRingSpeciesEvidence() }
            : {})
    });
}

function soulRingClosureFixture({
    flowId,
    poolId,
    optionId,
    soulIndex = 0,
    ringIndex = 4,
    additionalSoulRingBatch = null,
    includeSpeciesEvidence = true
}) {
    const routeGraph = loadRealRouteGraph();
    const contentIndex = realSoulRingContentIndex({ includeSpeciesEvidence });
    const session = createApkRouteSession({
        routeGraph,
        packId: "douluo1",
        seed: `soul-ring-species-${flowId}-${optionId}-${soulIndex}`
    });
    session.currentFlowId = flowId;
    session.character.martialSouls = [
        {
            id: "primary-soul",
            name: "主武魂",
            rings: soulIndex === 0 ? [{ years: 10, name: "已有魂环" }, { years: 50, name: "已有魂环" }, { years: 100, name: "已有魂环" }] : [],
            tags: [],
            passives: []
        },
        ...(soulIndex === 1
            ? [{
                id: "secondary-soul",
                name: "副武魂",
                rings: [],
                tags: [],
                passives: []
            }]
            : [])
    ];
    session.character.pendingRing = {
        soulIndex,
        ringIndex,
        years: 500,
        source: { optionId: "ring-age", text: "500年魂环" },
        typeSelection: { optionId: "ring-type", text: "龙类" },
        speciesSelection: null,
        grantsSoulBone: false,
        levelBefore: session.character.level
    };
    session.character.additionalSoulRingBatch = additionalSoulRingBatch;
    const option = contentIndex.getRouteOption(poolId, optionId);
    assert.ok(option, `missing route option ${poolId}:${optionId}`);
    return { contentIndex, session, option };
}

function exact(value, targetKinds = ["flow"]) {
    return {
        kind: "exact-string",
        value,
        target: value,
        targetKinds,
        resolved: true
    };
}

function absent() {
    return { kind: "absent" };
}

function flow({ id, pool, action = null, next = null }) {
    return {
        id,
        source: {
            id,
            ...(pool ? { poolId: pool } : {}),
            ...(action ? { action } : {}),
            ...(next ? { next } : {})
        },
        route: {
            pool: pool ? exact(pool, ["pool"]) : absent(),
            next: next ? exact(next) : absent(),
            possibleNext: [],
            getNext: absent(),
            leaveNext: absent(),
            action: action ? exact(action, ["action"]) : absent()
        }
    };
}

function option({ id, text, effects = [], next = null, followUps = [] }) {
    const source = {
        id,
        text,
        weight: 1,
        enabled: true,
        contentStatus: "formal",
        requirements: [],
        rerollWhen: [],
        effects,
        ...(next ? { next } : {}),
        ...(followUps.length > 0 ? { followUps } : {})
    };
    return {
        id,
        source,
        route: {
            next: next ? { kind: "exact-string", value: next } : absent(),
            customHandler: absent(),
            followUps,
            requirements: [],
            rerollWhen: [],
            effects,
            terminalKinds: effects
                .filter(effect => ["death", "ending"].includes(effect.type))
                .map(effect => effect.type),
            canonicalEvidenceKey: null
        },
        canonicalEvidence: null
    };
}

function syntheticRouteGraph({ dynamicEntry = false, unresolvedOption = false } = {}) {
    const entryFlowId = dynamicEntry ? "flow.dynamic" : "flow.entry";
    const pools = [
        {
            id: "pool.entry",
            name: "入口池",
            contentStatus: "formal",
            developmentOnly: false,
            options: [option({
                id: "entry-option",
                text: "进入下一池",
                effects: [{ type: "changeLevel", amount: 1 }],
                next: "flow.next"
            })]
        },
        {
            id: "pool.next",
            name: "终局池",
            contentStatus: "formal",
            developmentOnly: false,
            options: [option({
                id: "ending-option",
                text: "结束",
                effects: [{ type: "ending", endingId: "test-ending" }]
            })]
        }
    ];
    if (unresolvedOption) {
        pools[0].options = [option({
            id: "unresolved-option",
            text: "没有明确去向",
            effects: []
        })];
    }
    return {
        schemaVersion: "apk-route-graph/1.0",
        packageVersion: "apk-canonical/test",
        source: { gameplayExecuted: false },
        packs: [{
            id: "douluo1",
            entryFlowId,
            registries: { actionIds: ["dynamicAction"] },
            flows: [
                flow({ id: "flow.entry", pool: "pool.entry" }),
                flow({ id: "flow.next", pool: "pool.next" }),
                flow({ id: "flow.dynamic", action: "dynamicAction" })
            ],
            pools
        }]
    };
}

test("APK route runtime resolves exact flow-to-pool edges and commits the next flow atomically", () => {
    const routeGraph = syntheticRouteGraph();
    const contentIndex = createApkRouteContentIndex({ routeGraph });
    const session = createApkRouteSession({
        routeGraph,
        seed: "route-runtime-test"
    });

    const resolved = resolveApkRoutePool({ contentIndex, session });
    assert.equal(resolved.poolId, "pool.entry");

    const spin = drawApkRouteStep({ contentIndex, session });
    const committed = commitApkRouteOption({
        contentIndex,
        session,
        spin
    });
    assert.equal(committed.nextFlowId, "flow.next");
    assert.equal(session.character.level, 2);
    assert.equal(session.routeHistory.length, 1);
    assert.equal(session.routeStatus, "ready");
});

test("Day23 source evidence covers 131 follow-up prepares and all 10 ring pools", () => {
    const followUp = loadRealFollowUpPrepareEvidence();
    const rings = loadRealHumanSoulRingEvidence();
    assert.equal(followUp.records.length, 131);
    assert.equal(new Set(followUp.records.map(record => (
        `${record.sourcePoolId}:${record.sourceOptionId}:${record.followUpIndex}`
    ))).size, 131);
    assert.equal(new Set(followUp.records.map(record => (
        `${record.prepare.years}:${record.prepare.quality}`
    ))).size, 50);
    assert.deepEqual([...new Set(followUp.records.map(record => record.prepare.quality))].sort(), [
        "earth-dragon", "ordinary", "pure-dragon", "top"
    ]);
    assert.equal(rings.extraction.poolCount, 10);
    assert.equal(rings.extraction.canonicalRouteOptionCount, 153);
    assert.equal(rings.extraction.canonicalCompleteness, true);
    assert.deepEqual(Object.fromEntries(Object.entries(rings.knownDay23Mappings).map(([id, value]) => [
        id, [value.ringYears, value.grantsSoulBone]
    ])), {
        "7143b4": [10, false],
        "505d78": [10, false],
        "6df424": [100000, true],
        "94604a": [300000, true]
    });
});

test("follow-up evidence rejects an unknown quality before runtime use", () => {
    const evidence = structuredClone(loadRealFollowUpPrepareEvidence());
    evidence.records[0].prepare.quality = "guessed";
    assert.throws(
        () => createApkRouteContentIndex({
            routeGraph: loadRealRouteGraph(),
            packId: "douluo1",
            followUpPrepareEvidence: evidence
        }),
        error => error.code === "APK_ROUTE_FOLLOWUP_PREPARE_EVIDENCE_INVALID"
    );
});

test("APK route runtime preserves terminal effects and ends the route", () => {
    const routeGraph = syntheticRouteGraph();
    const contentIndex = createApkRouteContentIndex({ routeGraph });
    const session = createApkRouteSession({
        routeGraph,
        seed: "route-terminal-test"
    });
    runApkRouteStep({ contentIndex, session });
    const terminal = runApkRouteStep({ contentIndex, session });
    assert.equal(terminal.routeStatus, "terminal");
    assert.equal(session.finished, true);
    assert.equal(session.character.ending.id, "test-ending");
    assert.equal(session.currentFlowId, null);
});

test("APK route runtime preserves exact follow-up pool counts and returns to the source flow", () => {
    const routeGraph = syntheticRouteGraph();
    const pack = routeGraph.packs[0];
    pack.flows.push(flow({ id: "flow.follow", pool: "pool.follow" }));
    pack.pools.push({
        id: "pool.follow",
        name: "后续池",
        contentStatus: "formal",
        developmentOnly: false,
        options: [option({
            id: "follow-option",
            text: "后续结果",
            effects: [{ type: "changeLevel", amount: 1 }],
            next: "flow.next"
        })]
    });
    const entryOption = pack.pools[0].options[0];
    entryOption.source.followUps = [{
        targetPoolId: "pool.follow",
        count: 2,
        reason: "test-follow-up"
    }];
    entryOption.route.followUps = entryOption.source.followUps;

    const contentIndex = createApkRouteContentIndex({ routeGraph });
    const session = createApkRouteSession({
        routeGraph,
        seed: "route-follow-up-test"
    });
    const first = drawApkRouteStep({ contentIndex, session });
    commitApkRouteOption({ contentIndex, session, spin: first });
    assert.equal(session.currentFlowId, "flow.follow");
    assert.equal(session.pendingFollowUps[0].remainingDraws, 2);

    const second = drawApkRouteStep({ contentIndex, session });
    commitApkRouteOption({ contentIndex, session, spin: second });
    assert.equal(session.currentFlowId, "flow.follow");
    assert.equal(session.pendingFollowUps[0].remainingDraws, 1);

    const third = drawApkRouteStep({ contentIndex, session });
    commitApkRouteOption({ contentIndex, session, spin: third });
    assert.equal(session.currentFlowId, "flow.next");
    assert.equal(session.pendingFollowUps.length, 0);
});

test("APK route runtime blocks dynamic flow nodes without guessing", () => {
    const routeGraph = syntheticRouteGraph({ dynamicEntry: true });
    const contentIndex = createApkRouteContentIndex({ routeGraph });
    const session = createApkRouteSession({
        routeGraph,
        seed: "route-dynamic-test"
    });
    assert.throws(
        () => drawApkRouteStep({ contentIndex, session }),
        error => error.code === "APK_ROUTE_DYNAMIC_UNRESOLVED"
            && error.details.handlerId === "dynamicAction"
    );
    assert.equal(session.random.cursor, 0);
});

test("APK route runtime rolls back effects when an option has no exact next or terminal", () => {
    const routeGraph = syntheticRouteGraph({ unresolvedOption: true });
    const contentIndex = createApkRouteContentIndex({ routeGraph });
    const session = createApkRouteSession({
        routeGraph,
        seed: "route-rollback-test"
    });
    const spin = drawApkRouteStep({ contentIndex, session });
    const before = JSON.parse(JSON.stringify(session));
    assert.throws(
        () => commitApkRouteOption({ contentIndex, session, spin }),
        error => error.code === "APK_ROUTE_NEXT_UNRESOLVED"
    );
    assert.deepEqual(session, before);
});

test("APK route runtime reaches the real douluo1 entry pool and exact gender transition", () => {
    const routeGraph = loadRealRouteGraph();
    const contentIndex = createApkRouteContentIndex({
        routeGraph,
        packId: "douluo1"
    });
    const session = createApkRouteSession({
        routeGraph,
        packId: "douluo1",
        seed: "real-route-entry-test"
    });
    const spin = drawApkRouteStep({ contentIndex, session });
    assert.equal(spin.flowId, "douluo1:flow.formal-human.identity");
    assert.equal(spin.poolId, "aa560e1a-db5f-476f-9546-8830fbedee24");
    const committed = commitApkRouteOption({
        contentIndex,
        session,
        spin
    });
    assert.equal(committed.nextFlowId, "douluo1:flow.formal-human.gender");
    assert.equal(session.history.length, 1);
});

test("APK route runtime commits the source-proven faction story branch", () => {
    const routeGraph = loadRealRouteGraph();
    const contentIndex = createApkRouteContentIndex({
        routeGraph,
        packId: "douluo1"
    });
    const session = createApkRouteSession({
        routeGraph,
        packId: "douluo1",
        seed: "formal-faction-branch"
    });
    session.character.timelineAge = 6;
    const flowId = "douluo1:flow.formal-human.faction";
    const poolId = contentIndex.getFlow(flowId).route.pool.target;
    const option = contentIndex.getOptions(poolId).find(candidate => (
        candidate.normalized.option_id === "218e21"
    ));
    const committed = commitApkRouteOption({
        contentIndex,
        session,
        spin: {
            flowId,
            poolId,
            optionId: "218e21",
            option
        }
    });

    assert.equal(session.character.storyBranch, 2);
    assert.equal(session.character.branchStartTimelineAge, 6);
    assert.equal(session.character.faction.optionId, "218e21");
    assert.equal(session.character.flags["formal:faction-6-chosen"], true);
    assert.equal(session.character.flags["formal:faction-locked"], true);
    assert.equal(committed.nextFlowId, "douluo1:flow.formal-human.scheduler");
});

test("APK route runtime merges canonical identity effects without changing route availability", () => {
    const routeGraph = loadRealRouteGraph();
    const contentIndex = createApkRouteContentIndex({ routeGraph, packId: "douluo1" });
    const identityFlow = contentIndex.getFlow("douluo1:flow.formal-human.identity");
    const identityPoolId = identityFlow.route.pool.target;
    const identity = contentIndex.getOptions(identityPoolId).find(option => (
        option.normalized.option_id === "78ee15"
    ));
    assert.equal(identity.availability.enabled, true);
    assert.equal(identity.normalized.canonical_supplemental_status, "unique");
    assert.deepEqual(
        identity.normalized.effects.filter(effect => (
            effect.type === "setFlag"
                && effect.key === "douluo2:innate-fixed"
        )),
        [{ type: "setFlag", key: "douluo2:innate-fixed", value: 1 }]
    );
});

test("APK route dynamic bridge resolves fixed and non-fixed innate branches from source handlers", () => {
    const routeGraph = loadRealRouteGraph();
    const contentIndex = createApkRouteContentIndex({ routeGraph, packId: "douluo1" });
    const handlers = createApkRouteDynamicHandlers({ contentIndex });
    const fixed = createApkRouteSession({
        routeGraph,
        packId: "douluo1",
        seed: "fixed-innate-route"
    });
    fixed.currentFlowId = "douluo1:flow.formal-human.before-innate";
    fixed.character.background = {
        appliedRuleIds: [],
        identityId: "douluo2:identity.have-nothing"
    };
    fixed.character.flags = {
        "douluo2:innate-fixed": 1,
        "identity:no-special-talent": true
    };
    const fixedSpin = drawApkRouteStep({
        contentIndex,
        session: fixed,
        ...handlers
    });
    assert.equal(fixed.character.innatePower, 1);
    assert.equal(fixedSpin.poolId, "75c9e3e0-6e7d-4f26-9374-e7de53950722");
    assert.deepEqual(
        fixed.dynamicHistory.map(entry => entry.handlerId),
        [
            "douluo1:action.formal-human.before-innate",
            "douluo1:action.formal-human.before-martial-talent"
        ]
    );

    const nonFixed = createApkRouteSession({
        routeGraph,
        packId: "douluo1",
        seed: "non-fixed-innate-route"
    });
    nonFixed.currentFlowId = "douluo1:flow.formal-human.before-innate";
    nonFixed.character.background = {
        appliedRuleIds: [],
        identityId: "douluo2:identity.royal"
    };
    const nonFixedSpin = drawApkRouteStep({
        contentIndex,
        session: nonFixed,
        ...handlers
    });
    assert.equal(nonFixed.character.innatePower, null);
    assert.equal(nonFixedSpin.poolId, "7bb7ef7b-7c43-4bda-a0cf-3cf6578a0d88");
    assert.equal(nonFixed.dynamicHistory[0].effects.length, 0);
});

test("APK route dynamic bridge resolves the canonical C-grade beast martial pool", () => {
    const routeGraph = loadRealRouteGraph();
    const contentIndex = createApkRouteContentIndex({ routeGraph, packId: "douluo1" });
    const session = createApkRouteSession({
        routeGraph,
        packId: "douluo1",
        seed: "canonical-beast-middle"
    });
    session.currentFlowId = "douluo1:flow.formal-human.select-martial";
    session.character.talentProgression.talentGrade = "C";
    session.character.martialSoulTalents = [{
        optionId: "90400d",
        text: "兽武魂"
    }];

    const resolved = resolveApkRoutePool({
        contentIndex,
        session,
        ...createApkRouteDynamicHandlers({ contentIndex })
    });

    assert.equal(
        resolved.flowId,
        "douluo1:flow.formal-human.martial.24eda03c-beae-40f2-a7db-20b6318cd1c7"
    );
    assert.equal(resolved.poolId, "24eda03c-beae-40f2-a7db-20b6318cd1c7");
    assert.equal(
        session.dynamicHistory.at(-1).handlerId,
        "douluo1:action.formal-human.select-martial"
    );
});

test("APK route custom bridge applies source-proven base martial soul category and effects", () => {
    const routeGraph = loadRealRouteGraph();
    const contentIndex = createApkRouteContentIndex({ routeGraph, packId: "douluo1" });
    const session = createApkRouteSession({
        routeGraph,
        packId: "douluo1",
        seed: "formal-martial-body"
    });
    const flowId = "douluo1:flow.formal-human.martial.49e3abc8-1361-4348-94aa-b23c68a53720";
    const poolId = "49e3abc8-1361-4348-94aa-b23c68a53720";
    const optionId = "3cb19c";
    const option = contentIndex.getOptions(poolId).find(candidate => (
        candidate.normalized.option_id === optionId
    ));
    session.currentFlowId = flowId;
    const committed = commitApkRouteOption({
        contentIndex,
        session,
        spin: { flowId, poolId, optionId, option }
    });

    assert.equal(committed.nextFlowId, "douluo1:flow.formal-human.after-martial");
    assert.deepEqual(session.character.martialSouls[0], {
        id: optionId,
        name: "【普通武魂】双手（获得属性【生命】+1）",
        category: "本体武魂",
        rings: [],
        tags: [],
        passives: []
    });
    assert.equal(session.character.elementProgress.life, 1);
    assert.equal(session.character.flags.hasExtremeMartialSoul, false);
    assert.equal(session.dynamicHistory.at(-1).handlerId, "applyHumanMartialSoul");
});

test("APK route custom bridge applies source-proven extreme martial soul effects", () => {
    const routeGraph = loadRealRouteGraph();
    const contentIndex = createApkRouteContentIndex({ routeGraph, packId: "douluo1" });
    const session = createApkRouteSession({
        routeGraph,
        packId: "douluo1",
        seed: "formal-martial-extreme"
    });
    const flowId = "douluo1:flow.formal-human.martial.8c589787-e43d-4064-8546-8b5b7b403fe2";
    const poolId = "8c589787-e43d-4064-8546-8b5b7b403fe2";
    const optionId = "9a9e36";
    const option = contentIndex.getOptions(poolId).find(candidate => (
        candidate.normalized.option_id === optionId
    ));
    session.currentFlowId = flowId;
    commitApkRouteOption({
        contentIndex,
        session,
        spin: { flowId, poolId, optionId, option }
    });

    assert.equal(session.character.martialSouls[0].category, "极致武魂");
    assert.deepEqual(session.character.martialSouls[0].tags, ["dragon"]);
    assert.equal(session.character.elementProgress.fire, 2);
    assert.deepEqual(session.character.domains, ["formal:domain.red-lotus"]);
    assert.equal(session.character.flags.hasExtremeMartialSoul, true);
});

test("APK route custom bridge keeps awakening contexts explicitly unresolved", () => {
    const routeGraph = loadRealRouteGraph();
    const contentIndex = createApkRouteContentIndex({ routeGraph, packId: "douluo1" });
    const session = createApkRouteSession({
        routeGraph,
        packId: "douluo1",
        seed: "awakening-boundary"
    });
    const flowId = "humanAwakenBody";
    const poolId = "49e3abc8-1361-4348-94aa-b23c68a53720";
    const optionId = "3cb19c";
    const option = contentIndex.getOptions(poolId).find(candidate => (
        candidate.normalized.option_id === optionId
    ));
    session.currentFlowId = flowId;
    const before = JSON.parse(JSON.stringify(session));
    assert.throws(
        () => commitApkRouteOption({
            contentIndex,
            session,
            spin: { flowId, poolId, optionId, option }
        }),
        error => error.code === "APK_ROUTE_DYNAMIC_OPTION_UNRESOLVED"
            && error.details.customHandler === "applyHumanMartialSoul"
    );
    assert.deepEqual(session, before);
});

test("APK route operation registry dispatches by context and keeps unresolved branches explicit", () => {
    assert.deepEqual(
        APK_ROUTE_OPERATION_REGISTRY
            .filter(entry => entry.handlerId === "applyHumanMartialSoul")
            .map(entry => [entry.operationId, entry.context, entry.status]),
        [
            [
                "formal-human.martial.addMartialSoul",
                "douluo1:flow.formal-human.martial.*",
                "connected"
            ],
            [
                "human.soulRing.species.sharedClosure",
                "humanRingSpecies3|humanRingSpecies4|humanRingSpecies5",
                "connected"
            ],
            ["human.awakening.unresolved", "humanAwaken*|humanExtraMartial*", "unresolved"],
            ["human.replacement.unresolved", "*replace*|*replacement*|*mutation*", "unresolved"],
            ["beast.martial.unresolved", "*beast*|*special-martial*", "unresolved"]
        ]
    );
    assert.deepEqual(
        APK_ROUTE_OPERATION_REGISTRY
            .filter(entry => entry.handlerId === "douluo1:handler.official-beast.element")
            .map(entry => [entry.operationId, entry.context, entry.status]),
        [[
            "beast.element",
            "douluo1:flow.official-beast.pool.*",
            "connected"
        ]]
    );
});

test("APK official beast element handler uses exact evidence for human context", () => {
    const routeGraph = loadRealRouteGraph();
    const contentIndex = createApkRouteContentIndex({
        routeGraph,
        packId: "douluo1",
        officialBeastElementEvidence: loadRealOfficialBeastElementEvidence()
    });
    const session = createApkRouteSession({
        routeGraph,
        packId: "douluo1",
        seed: "official-beast-element-boundary"
    });
    const flowId = "douluo1:flow.official-beast.pool.f2abac93-6b26-4e3e-aa92-a168db671577";
    const poolId = "f2abac93-6b26-4e3e-aa92-a168db671577";
    const optionId = "f16385";
    session.currentFlowId = flowId;
    const option = contentIndex.getOptions(poolId).find(candidate => candidate.normalized.option_id === optionId);
    const cursor = session.random.cursor;
    const committed = commitApkRouteOption({
        contentIndex,
        session,
        spin: { flowId, poolId, optionId, option },
        ...createApkRouteDynamicHandlers({ contentIndex })
    });
    assert.equal(committed.nextFlowId, "douluo1:flow.formal-human.scheduler");
    assert.equal(session.character.elementProgress.destruction, 1);
    assert.equal(session.character.beast, null);
    assert.equal(session.random.cursor, cursor);
});

test("APK official beast element handler updates only beast progression", () => {
    const routeGraph = loadRealRouteGraph();
    const contentIndex = createApkRouteContentIndex({
        routeGraph,
        packId: "douluo1",
        officialBeastElementEvidence: loadRealOfficialBeastElementEvidence()
    });
    const session = createApkRouteSession({ routeGraph, packId: "douluo1", seed: "beast-element" });
    const flowId = "douluo1:flow.official-beast.pool.f2abac93-6b26-4e3e-aa92-a168db671577";
    const poolId = "f2abac93-6b26-4e3e-aa92-a168db671577";
    const optionId = "f16385";
    const option = contentIndex.getOptions(poolId).find(candidate => candidate.normalized.option_id === optionId);
    session.currentFlowId = flowId;
    session.character.route = "beast";
    session.character.beast = {
        elementProgress: null,
        attributeStages: {},
        bloodlines: [],
        laws: [],
        evolvedThresholds: [],
        plotDone: []
    };
    commitApkRouteOption({
        contentIndex,
        session,
        spin: { flowId, poolId, optionId, option },
        ...createApkRouteDynamicHandlers({ contentIndex })
    });
    assert.equal(session.character.beast.attributeStages["毁灭"], 1);
    assert.equal(session.character.elementProgress.destruction, undefined);
    assert.equal(session.currentFlowId, "douluo1:flow.official-beast.pool.3f788371-f7de-4ddd-81a1-eae9a9287dbc");
});

test("APK official beast element missing evidence rejects atomically", () => {
    const routeGraph = loadRealRouteGraph();
    const contentIndex = createApkRouteContentIndex({ routeGraph, packId: "douluo1" });
    const session = createApkRouteSession({ routeGraph, packId: "douluo1", seed: "missing-element-evidence" });
    const flowId = "douluo1:flow.official-beast.pool.f2abac93-6b26-4e3e-aa92-a168db671577";
    const poolId = "f2abac93-6b26-4e3e-aa92-a168db671577";
    const optionId = "f16385";
    const option = contentIndex.getOptions(poolId).find(candidate => candidate.normalized.option_id === optionId);
    session.currentFlowId = flowId;
    const before = structuredClone(session);
    assert.throws(
        () => commitApkRouteOption({ contentIndex, session, spin: { flowId, poolId, optionId, option } }),
        error => error.code === "APK_ROUTE_BEAST_ELEMENT_EVIDENCE_MISSING"
    );
    assert.deepEqual(session, before);
});

for (const scenario of [
    {
        name: "humanRingSpecies3",
        flowId: "humanRingSpecies3",
        poolId: "8001d4e9-2ead-484c-86ab-550686c6ce0d",
        optionId: "3e4f40",
        expectedElement: ["wind", 1]
    },
    {
        name: "humanRingSpecies4 / bddfef",
        flowId: "humanRingSpecies4",
        poolId: "917a611f-c50b-4c67-9b27-da19f136e5c5",
        optionId: "bddfef",
        expectedElement: ["earth", 2]
    },
    {
        name: "humanRingSpecies5",
        flowId: "humanRingSpecies5",
        poolId: "c898523e-82f4-45d4-9dc8-ee6845e2b74d",
        optionId: "ea0b14",
        expectedElement: ["strength", 2]
    }
]) {
    test(`APK shared soul-ring species closure handles ${scenario.name}`, () => {
        const { contentIndex, session, option } = soulRingClosureFixture(scenario);
        const beforeSoulIds = session.character.martialSouls.map(soul => soul.id);
        const committed = commitApkRouteOption({
            contentIndex,
            session,
            spin: {
                flowId: scenario.flowId,
                poolId: scenario.poolId,
                optionId: scenario.optionId,
                option
            }
        });

        assert.equal(committed.nextFlowId, "humanAfterSoulRing");
        assert.deepEqual(
            session.character.martialSouls.map(soul => soul.id),
            beforeSoulIds,
            "species selection must not add a martial soul"
        );
        assert.equal(session.character.martialSouls[0].rings.length, 4);
        assert.equal(session.character.martialSouls[0].rings[3].years, 500);
        assert.equal(
            session.character.elementProgress[scenario.expectedElement[0]],
            scenario.expectedElement[1]
        );
        assert.equal(
            session.dynamicHistory.at(-1).operation,
            "human.soulRing.species.sharedClosure"
        );
        assert.equal(
            session.dynamicHistory.at(-1).soulRingBatchStatus.mode,
            "primary-or-unbatched"
        );
    });
}

test("APK shared soul-ring species primitive fills a secondary martial soul and preserves its batch", () => {
    const scenario = {
        flowId: "humanRingSpecies4",
        poolId: "917a611f-c50b-4c67-9b27-da19f136e5c5",
        optionId: "bddfef",
        soulIndex: 1,
        ringIndex: 1,
        additionalSoulRingBatch: [1, 2]
    };
    const { contentIndex, session, option } = soulRingClosureFixture(scenario);
    const beforeSoulIds = session.character.martialSouls.map(soul => soul.id);
    const committed = commitApkRouteOption({
        contentIndex,
        session,
        spin: { ...scenario, option }
    });

    assert.equal(committed.nextFlowId, "humanAfterSoulRing");
    assert.deepEqual(session.character.martialSouls.map(soul => soul.id), beforeSoulIds);
    assert.equal(session.character.martialSouls[1].rings.length, 1);
    assert.equal(session.character.martialSouls[1].rings[0].years, 500);
    assert.deepEqual(session.character.additionalSoulRingBatch, [1, 2]);
    assert.deepEqual(session.dynamicHistory.at(-1).soulRingBatchStatus, {
        mode: "secondary-batch",
        indices: [1, 2],
        pendingSoulIndex: 1,
        pendingBatchPosition: 0
    });
    assert.equal(session.character.elementProgress.earth, 2);
});

for (const failure of [
    {
        name: "missing pendingRing",
        fixture: { flowId: "humanRingSpecies4", poolId: "917a611f-c50b-4c67-9b27-da19f136e5c5", optionId: "bddfef" },
        mutate: session => { session.character.pendingRing = null; },
        code: "APK_ROUTE_SOUL_RING_CONTEXT_MISSING"
    },
    {
        name: "missing species evidence",
        fixture: { flowId: "humanRingSpecies4", poolId: "917a611f-c50b-4c67-9b27-da19f136e5c5", optionId: "bddfef", includeSpeciesEvidence: false },
        mutate: () => {},
        code: "APK_ROUTE_SOUL_RING_SPECIES_EVIDENCE_MISSING"
    },
    {
        name: "unknown flow",
        fixture: { flowId: "humanRingSpecies4-unknown", poolId: "917a611f-c50b-4c67-9b27-da19f136e5c5", optionId: "bddfef" },
        mutate: () => {},
        code: "APK_ROUTE_DYNAMIC_OPTION_UNRESOLVED"
    }
]) {
    test(`APK shared soul-ring species closure atomically rejects ${failure.name}`, () => {
        const { contentIndex, session, option } = soulRingClosureFixture(failure.fixture);
        failure.mutate(session);
        const before = JSON.parse(JSON.stringify(session));
        assert.throws(
            () => commitApkRouteOption({
                contentIndex,
                session,
                spin: {
                    flowId: failure.fixture.flowId,
                    poolId: failure.fixture.poolId,
                    optionId: failure.fixture.optionId,
                    option
                }
            }),
            error => error.code === failure.code
        );
        assert.deepEqual(session, before);
    });
}

test("APK scheduler action selects the source annual pool after its priority heads", () => {
    const routeGraph = loadRealRouteGraph();
    const contentIndex = createApkRouteContentIndex({ routeGraph, packId: "douluo1" });
    const session = createApkRouteSession({
        routeGraph,
        packId: "douluo1",
        seed: "scheduler-annual"
    });
    session.currentFlowId = "douluo1:flow.formal-human.scheduler";
    session.character.talentProgression.talentGrade = "D";
    const resolved = resolveApkRoutePool({
        contentIndex,
        session,
        ...createApkRouteDynamicHandlers({ contentIndex })
    });

    assert.equal(
        resolved.flowId,
        "douluo1:flow.formal-source.63b90f87-37fc-4c1d-b87b-0d75f1553f6a"
    );
    assert.equal(resolved.poolId, "63b90f87-37fc-4c1d-b87b-0d75f1553f6a");
    assert.equal(session.dynamicHistory.at(-1).handlerId, "douluo1:action.formal-human.schedule");
});

test("APK scheduler preserves source priority for element draws and god-trial archiving", () => {
    const routeGraph = loadRealRouteGraph();
    const contentIndex = createApkRouteContentIndex({ routeGraph, packId: "douluo1" });
    const element = createApkRouteSession({
        routeGraph,
        packId: "douluo1",
        seed: "scheduler-element"
    });
    element.currentFlowId = "douluo1:flow.formal-human.scheduler";
    element.character.flags["formal:element-draws"] = 2;
    const elementResolved = resolveApkRoutePool({
        contentIndex,
        session: element,
        ...createApkRouteDynamicHandlers({ contentIndex })
    });
    assert.equal(elementResolved.poolId, "f2abac93-6b26-4e3e-aa92-a168db671577");
    assert.equal(element.character.flags["formal:element-draws"], 1);

    const god = createApkRouteSession({
        routeGraph,
        packId: "douluo1",
        seed: "scheduler-god-trial"
    });
    god.currentFlowId = "douluo1:flow.formal-human.scheduler";
    god.character.godTrial = { status: "completed", tier: "top" };
    god.character.flags["formal:god-trial-draws"] = 1;
    const godResolved = resolveApkRoutePool({
        contentIndex,
        session: god,
        ...createApkRouteDynamicHandlers({ contentIndex })
    });
    assert.equal(godResolved.flowId, "humanGodTrialTier");
    assert.equal(god.character.godTrial, null);
    assert.equal(god.character.godTrials.length, 1);
    assert.equal(god.character.flags["formal:god-trial-draws"], 0);
    assert.equal(god.character.flags["formal:d1-scheduler-mode"], "annual");
});

test("APK scheduler reaches the source lifespan terminal without consuming RNG", () => {
    const routeGraph = loadRealRouteGraph();
    const contentIndex = createApkRouteContentIndex({ routeGraph, packId: "douluo1" });
    const session = createApkRouteSession({
        routeGraph,
        packId: "douluo1",
        seed: "scheduler-lifespan"
    });
    session.currentFlowId = "douluo1:flow.formal-human.scheduler";
    session.character.age = 150;
    const terminal = drawApkRouteStep({
        contentIndex,
        session,
        ...createApkRouteDynamicHandlers({ contentIndex })
    });

    assert.equal(terminal.status, "terminal");
    assert.equal(session.routeStatus, "terminal");
    assert.equal(session.character.ending.id, "douluo1:human-lifespan-150");
    assert.equal(session.random.cursor, 0);
    assert.equal(session.dynamicHistory.at(-1).terminal, true);
});

test("APK scheduler rolls back priority effects when its exact target is absent", () => {
    const routeGraph = {
        schemaVersion: "apk-route-graph/1.0",
        packageVersion: "apk-canonical/scheduler-test",
        source: { gameplayExecuted: false },
        packs: [{
            id: "douluo1",
            entryFlowId: "flow.scheduler",
            registries: { actionIds: ["douluo1:action.formal-human.schedule"] },
            flows: [flow({
                id: "flow.scheduler",
                action: "douluo1:action.formal-human.schedule"
            })],
            pools: []
        }]
    };
    const contentIndex = createApkRouteContentIndex({ routeGraph, packId: "douluo1" });
    const session = createApkRouteSession({
        routeGraph,
        packId: "douluo1",
        seed: "scheduler-rollback"
    });
    session.currentFlowId = "flow.scheduler";
    session.character.flags["formal:element-draws"] = 1;
    const before = JSON.parse(JSON.stringify(session));

    assert.throws(
        () => drawApkRouteStep({
            contentIndex,
            session,
            ...createApkRouteDynamicHandlers({ contentIndex })
        }),
        error => error.code === "APK_ROUTE_FLOW_NOT_FOUND"
    );
    assert.deepEqual(session, before);
});

test("APK formal special-growth action selects the source poor-group tier and refreshes encounter suppression", () => {
    const routeGraph = loadRealRouteGraph();
    const contentIndex = createApkRouteContentIndex({ routeGraph, packId: "douluo1" });
    const session = createApkRouteSession({
        routeGraph,
        packId: "douluo1",
        seed: "special-growth-default"
    });
    session.currentFlowId = "douluo1:flow.formal-special-growth";
    session.character.age = 6;
    session.character.level = 7;
    session.character.talentProgression.talentGrade = "E";
    session.character.flags["identity:suppress-encounter-before-12"] = true;

    const resolved = resolveApkRoutePool({
        contentIndex,
        session,
        ...createApkRouteDynamicHandlers({ contentIndex })
    });

    assert.equal(resolved.flowId, "douluo1:flow.special.96127132-31a6-4525-b568-2167d93a41cf");
    assert.equal(resolved.poolId, "96127132-31a6-4525-b568-2167d93a41cf");
    assert.equal(session.character.flags["formal:suppress-encounter"], true);
    assert.equal(session.dynamicHistory.at(-1).handlerId, "douluo1:action.formal-special-growth");
});

test("APK formal special-growth action maps identity groups and lets F override the identity", () => {
    const routeGraph = loadRealRouteGraph();
    const contentIndex = createApkRouteContentIndex({ routeGraph, packId: "douluo1" });

    const royal = createApkRouteSession({
        routeGraph,
        packId: "douluo1",
        seed: "special-growth-royal"
    });
    royal.currentFlowId = "douluo1:flow.formal-special-growth";
    royal.character.level = 1;
    royal.character.talentProgression.talentGrade = "D";
    royal.character.background = {
        appliedRuleIds: [],
        identityId: "douluo2:identity.royal"
    };
    const royalResolved = resolveApkRoutePool({
        contentIndex,
        session: royal,
        ...createApkRouteDynamicHandlers({ contentIndex })
    });
    assert.equal(royalResolved.poolId, "57c7d168-2ffd-4181-bc90-9b91cf9f8e41");

    const fOverride = createApkRouteSession({
        routeGraph,
        packId: "douluo1",
        seed: "special-growth-f-override"
    });
    fOverride.currentFlowId = "douluo1:flow.formal-special-growth";
    fOverride.character.level = 1;
    fOverride.character.talentProgression.talentGrade = "F";
    fOverride.character.background = {
        appliedRuleIds: [],
        identityId: "douluo2:identity.royal"
    };
    const fResolved = resolveApkRoutePool({
        contentIndex,
        session: fOverride,
        ...createApkRouteDynamicHandlers({ contentIndex })
    });
    assert.equal(fResolved.poolId, "96127132-31a6-4525-b568-2167d93a41cf");
    assert.equal(fOverride.character.flags["formal:suppress-encounter"], false);
});

test("APK formal special-growth action rejects an unmapped identity and draw rolls back", () => {
    const routeGraph = loadRealRouteGraph();
    const contentIndex = createApkRouteContentIndex({ routeGraph, packId: "douluo1" });
    const session = createApkRouteSession({
        routeGraph,
        packId: "douluo1",
        seed: "special-growth-rollback"
    });
    session.currentFlowId = "douluo1:flow.formal-special-growth";
    session.character.background = {
        appliedRuleIds: [],
        identityId: "douluo2:identity.unmapped"
    };
    const before = JSON.parse(JSON.stringify(session));

    assert.throws(
        () => drawApkRouteStep({
            contentIndex,
            session,
            ...createApkRouteDynamicHandlers({ contentIndex })
        }),
        error => error.code === "APK_ROUTE_DYNAMIC_SOURCE_GAP"
            && error.details.identityId === "douluo2:identity.unmapped"
    );
    assert.deepEqual(session, before);
});

test("APK formal special-growth result handler requires its source evidence package", () => {
    const routeGraph = loadRealRouteGraph();
    const contentIndex = createApkRouteContentIndex({ routeGraph, packId: "douluo1" });
    const session = createApkRouteSession({
        routeGraph,
        packId: "douluo1",
        seed: "special-growth-real-smoke"
    });
    session.currentFlowId = "douluo1:flow.formal-special-growth";
    session.character.age = 7;
    session.character.level = 7;
    session.character.talentProgression.talentGrade = "E";
    session.character.flags["identity:suppress-encounter-before-12"] = true;
    const handlers = createApkRouteDynamicHandlers({ contentIndex });
    const spin = drawApkRouteStep({ contentIndex, session, ...handlers });
    const beforeCommit = JSON.parse(JSON.stringify(session));

    assert.equal(spin.flowId, "douluo1:flow.special.96127132-31a6-4525-b568-2167d93a41cf");
    assert.equal(spin.poolId, "96127132-31a6-4525-b568-2167d93a41cf");
    assert.equal(session.character.flags["formal:suppress-encounter"], true);
    assert.throws(
        () => commitApkRouteOption({ contentIndex, session, spin }),
        error => error.code === "APK_ROUTE_SPECIAL_RESULT_EVIDENCE_MISSING"
            && error.details.handlerId === "douluo1:handler.formal-special-result"
    );
    assert.deepEqual(session, beforeCommit);
});

test("APK formal special-growth result handler applies the source store rule and resolves its next pool", () => {
    const routeGraph = loadRealRouteGraph();
    const contentIndex = createApkRouteContentIndex({
        routeGraph,
        packId: "douluo1",
        formalSpecialResultEvidence: loadRealFormalSpecialResultEvidence()
    });
    const session = createApkRouteSession({
        routeGraph,
        packId: "douluo1",
        seed: "special-result-store"
    });
    const poolId = "57c7d168-2ffd-4181-bc90-9b91cf9f8e41";
    const optionId = "228beb";
    const flowId = `douluo1:flow.special.${poolId}`;
    const option = contentIndex.getOptions(poolId).find(candidate => (
        candidate.normalized.option_id === optionId
    ));
    session.currentFlowId = flowId;

    const committed = commitApkRouteOption({
        contentIndex,
        session,
        spin: { flowId, poolId, optionId, option }
    });

    assert.equal(committed.nextFlowId, "douluo1:flow.after-formal-special-result");
    assert.equal(session.character.logs.at(-1).text, "商店池");
    assert.equal(
        session.character.flags["formal:d1-special-growth-next-flow"],
        "douluo1:flow.special.6fdecf1d-ba27-415a-91a1-8837807134e8"
    );
    assert.deepEqual(session.history.at(-1).effects, []);
    assert.equal(
        session.dynamicHistory.at(-1).handlerId,
        "douluo1:handler.formal-special-result"
    );

    const nextSpin = drawApkRouteStep({
        contentIndex,
        session,
        ...createApkRouteDynamicHandlers({ contentIndex })
    });
    assert.equal(
        nextSpin.flowId,
        "douluo1:flow.special.6fdecf1d-ba27-415a-91a1-8837807134e8"
    );
    assert.equal(nextSpin.poolId, "6fdecf1d-ba27-415a-91a1-8837807134e8");
    assert.equal(nextSpin.optionId, "454356");
    assert.equal(session.character.flags["formal:d1-special-growth-next-flow"], undefined);
    assert.equal(
        session.dynamicHistory.at(-1).handlerId,
        "douluo1:action.after-formal-special-result"
    );
});

test("APK route runtime evaluates the source complete-domain pool and commits a domain once", () => {
    const routeGraph = loadRealRouteGraph();
    const contentIndex = createApkRouteContentIndex({ routeGraph, packId: "douluo1" });
    const session = createApkRouteSession({
        routeGraph,
        packId: "douluo1",
        seed: "domain-pool-requirement"
    });
    const flowId = "douluo1:flow.formal-source.13e60019-9d99-411a-8739-65d3d1eb13bd";
    const poolId = "13e60019-9d99-411a-8739-65d3d1eb13bd";
    session.currentFlowId = flowId;
    session.character.domains = [];

    const spin = drawApkRouteStep({ contentIndex, session });
    const committed = commitApkRouteOption({ contentIndex, session, spin });
    const routeOption = contentIndex.getRouteOption(poolId, spin.optionId);
    const domainId = routeOption.source.effects.find(effect => effect.type === "addDomain").domainId;

    assert.equal(spin.poolId, poolId);
    assert.equal(committed.nextFlowId, "douluo1:flow.formal-human.scheduler");
    assert.deepEqual(session.character.domains, [domainId]);
    assert.equal(session.routeStatus, "ready");
});

test("APK prepareSoulRing stores the source age result and resolves selectRingTypeStep", () => {
    const routeGraph = loadRealRouteGraph();
    const contentIndex = createApkRouteContentIndex({
        routeGraph,
        packId: "douluo1",
        humanSoulRingEvidence: loadRealHumanSoulRingEvidence()
    });
    const session = createApkRouteSession({
        routeGraph,
        packId: "douluo1",
        seed: "soul-ring-prepare"
    });
    const flowId = "humanPrimaryRingAge1";
    const poolId = "24ab4336-6902-498e-a1fa-e65b616d7154";
    const optionId = "d57e06";
    session.currentFlowId = flowId;
    session.character.pendingRing = {
        soulIndex: 0,
        ringIndex: 1,
        years: 0,
        source: null,
        typeSelection: null,
        speciesSelection: null,
        grantsSoulBone: false,
        levelBefore: session.character.level
    };
    const option = contentIndex.getRouteOption(poolId, optionId);
    const committed = commitApkRouteOption({
        contentIndex,
        session,
        spin: { flowId, poolId, optionId, option },
        ...createApkRouteDynamicHandlers({ contentIndex })
    });

    assert.equal(committed.nextFlowId, "humanRingType1");
    assert.equal(session.character.pendingRing.years, 50);
    assert.deepEqual(session.character.pendingRing.source, {
        optionId,
        text: "50年魂环"
    });
    assert.equal(session.character.pendingRing.grantsSoulBone, false);
    assert.equal(session.character.logs.at(-1).text, "50年魂环");
    assert.equal(
        session.dynamicHistory.find(entry => entry.handlerId === "prepareSoulRing")
            ?.operation,
        "prepareSoulRing"
    );
    assert.equal(
        session.dynamicHistory.at(-1).handlerId,
        "selectRingTypeStep"
    );
    assert.equal(session.routeStatus, "ready");
});

test("APK prepareSoulRing preserves source level delta and soul-bone grant metadata", () => {
    const routeGraph = loadRealRouteGraph();
    const contentIndex = createApkRouteContentIndex({
        routeGraph,
        packId: "douluo1",
        humanSoulRingEvidence: loadRealHumanSoulRingEvidence()
    });
    const session = createApkRouteSession({
        routeGraph,
        packId: "douluo1",
        seed: "soul-ring-special-result"
    });
    const flowId = "humanPrimaryRingAge1";
    const poolId = "24ab4336-6902-498e-a1fa-e65b616d7154";
    const optionId = "0f93b2";
    session.currentFlowId = flowId;
    session.character.pendingRing = {
        soulIndex: 0,
        ringIndex: 1,
        years: 0,
        source: null,
        typeSelection: null,
        speciesSelection: null,
        grantsSoulBone: false,
        levelBefore: session.character.level
    };
    const option = contentIndex.getRouteOption(poolId, optionId);
    commitApkRouteOption({
        contentIndex,
        session,
        spin: { flowId, poolId, optionId, option },
        ...createApkRouteDynamicHandlers({ contentIndex })
    });

    assert.equal(session.character.level, 1 + 5);
    assert.equal(session.character.pendingRing.years, 100000);
    assert.equal(session.character.pendingRing.grantsSoulBone, true);
});

test("APK prepareSoulRing rolls back when its source evidence is unavailable", () => {
    const routeGraph = loadRealRouteGraph();
    const contentIndex = createApkRouteContentIndex({
        routeGraph,
        packId: "douluo1"
    });
    const session = createApkRouteSession({
        routeGraph,
        packId: "douluo1",
        seed: "soul-ring-evidence-boundary"
    });
    const flowId = "humanPrimaryRingAge1";
    const poolId = "24ab4336-6902-498e-a1fa-e65b616d7154";
    const optionId = "d57e06";
    session.currentFlowId = flowId;
    session.character.pendingRing = {
        soulIndex: 0,
        ringIndex: 1,
        years: 0,
        source: null,
        typeSelection: null,
        speciesSelection: null,
        grantsSoulBone: false,
        levelBefore: session.character.level
    };
    const before = JSON.parse(JSON.stringify(session));
    const option = contentIndex.getRouteOption(poolId, optionId);

    assert.throws(
        () => commitApkRouteOption({
            contentIndex,
            session,
            spin: { flowId, poolId, optionId, option },
            ...createApkRouteDynamicHandlers({ contentIndex })
        }),
        error => error.code === "APK_ROUTE_SOUL_RING_EVIDENCE_MISSING"
    );
    assert.deepEqual(session, before);
});

test("APK first soul-ring closure stores type, species attributes and returns to the scheduler boundary", () => {
    const routeGraph = loadRealRouteGraph();
    const contentIndex = createApkRouteContentIndex({
        routeGraph,
        packId: "douluo1",
        humanSoulRingEvidence: loadRealHumanSoulRingEvidence(),
        humanSoulRingSpeciesEvidence: loadRealHumanSoulRingSpeciesEvidence()
    });
    const session = createApkRouteSession({
        routeGraph,
        packId: "douluo1",
        seed: "soul-ring-first-closure"
    });
    const dynamicHandlers = createApkRouteDynamicHandlers({ contentIndex });
    session.character.martialSouls = [{
        id: "test-soul",
        name: "测试武魂",
        rings: [],
        tags: [],
        passives: []
    }];
    session.currentFlowId = "humanRingType1";
    session.character.pendingRing = {
        soulIndex: 0,
        ringIndex: 1,
        years: 50,
        source: { optionId: "d57e06", text: "50年魂环" },
        typeSelection: null,
        speciesSelection: null,
        grantsSoulBone: false,
        levelBefore: session.character.level
    };

    const typePoolId = "cf8ae025-165d-4b52-8d67-58a5989bc832";
    const typeOption = contentIndex.getRouteOption(typePoolId, "fb7c2b");
    commitApkRouteOption({
        contentIndex,
        session,
        spin: {
            flowId: "humanRingType1",
            poolId: typePoolId,
            optionId: "fb7c2b",
            option: typeOption
        },
        ...dynamicHandlers
    });
    assert.equal(session.currentFlowId, "humanRingSpecies1");
    assert.deepEqual(session.character.pendingRing.typeSelection, {
        optionId: "fb7c2b",
        text: "猴子类类"
    });

    const speciesPoolId = "83306f0e-1096-4cb2-8e89-951303751680";
    const speciesOption = contentIndex.getRouteOption(speciesPoolId, "a28a72");
    commitApkRouteOption({
        contentIndex,
        session,
        spin: {
            flowId: "humanRingSpecies1",
            poolId: speciesPoolId,
            optionId: "a28a72",
            option: speciesOption
        },
        ...dynamicHandlers
    });
    assert.equal(session.currentFlowId, "humanAfterSoulRing");
    assert.equal(session.character.elementProgress.strength, 1);
    assert.deepEqual(session.character.martialSouls[0].rings[0], {
        years: 50,
        name: "50年魂环",
        source: { optionId: "d57e06", text: "50年魂环" },
        typeSelection: { optionId: "fb7c2b", text: "猴子类类" },
        speciesSelection: {
            optionId: "a28a72",
            text: "【顶级血脉】泰坦巨猿（拥有力量属性，血脉融合则叠加）"
        }
    });

    const settled = runApkRouteStep({
        contentIndex,
        session,
        ...dynamicHandlers
    });
    assert.equal(settled.nextFlowId, "humanPlan");
    assert.equal(session.pendingSoulBone, null);
    assert.equal(session.character.pendingRing, null);
    assert.equal(
        session.dynamicHistory.some(entry => entry.handlerId === "afterSoulRing"),
        true
    );
    assert.equal(
        session.dynamicHistory.some(entry => entry.handlerId === "resolveSoulBoneChance"),
        true
    );
});

test("APK soul-bone chance and part closure preserves source years and returns to humanPlan", () => {
    const routeGraph = loadRealRouteGraph();
    const contentIndex = createApkRouteContentIndex({
        routeGraph,
        packId: "douluo1",
        humanSoulRingEvidence: loadRealHumanSoulRingEvidence(),
        humanSoulRingSpeciesEvidence: loadRealHumanSoulRingSpeciesEvidence()
    });
    const session = createApkRouteSession({
        routeGraph,
        packId: "douluo1",
        seed: "soul-bone-positive"
    });
    const dynamicHandlers = createApkRouteDynamicHandlers({ contentIndex });
    session.currentFlowId = "humanSoulBoneChanceHundred";
    session.pendingSoulBone = {
        years: 100,
        source: { optionId: "ring", text: "100年魂环" }
    };
    const chancePoolId = "daf80102-06ae-494c-8e86-6b2db00808ad";
    const chanceOption = contentIndex.getRouteOption(chancePoolId, "e8d0db");
    commitApkRouteOption({
        contentIndex,
        session,
        spin: {
            flowId: "humanSoulBoneChanceHundred",
            poolId: chancePoolId,
            optionId: "e8d0db",
            option: chanceOption
        },
        ...dynamicHandlers
    });
    assert.equal(session.currentFlowId, "humanPrepareSoulBonePart");
    assert.equal(session.pendingSoulBone.years, 100);

    const prepared = resolveApkRoutePool({
        contentIndex,
        session,
        ...dynamicHandlers
    });
    assert.equal(prepared.poolId, "ce286ca9-296f-471c-8f4f-701b9c7f6169");
    assert.equal(session.currentFlowId, "humanSoulBonePart");

    const spin = drawApkRouteStep({
        contentIndex,
        session,
        ...dynamicHandlers
    });
    const committed = commitApkRouteOption({
        contentIndex,
        session,
        spin,
        ...dynamicHandlers
    });
    assert.equal(committed.nextFlowId, "humanPlan");
    assert.equal(session.pendingSoulBone, null);
    assert.equal(session.character.soulBones.length, 1);
    assert.equal(session.character.soulBones[0].years, 100);
    assert.equal(typeof session.character.soulBones[0].partId, "string");
});

test("APK hundred-thousand-year early ring branch resumes through the same soul-bone closure", () => {
    const routeGraph = loadRealRouteGraph();
    const contentIndex = createApkRouteContentIndex({
        routeGraph,
        packId: "douluo1",
        humanSoulRingEvidence: loadRealHumanSoulRingEvidence(),
        humanSoulRingSpeciesEvidence: loadRealHumanSoulRingSpeciesEvidence()
    });
    const session = createApkRouteSession({
        routeGraph,
        packId: "douluo1",
        seed: "soul-ring-early-growth"
    });
    const dynamicHandlers = createApkRouteDynamicHandlers({ contentIndex });
    session.currentFlowId = "humanAfterSoulRing";
    session.character.pendingRing = {
        soulIndex: 0,
        ringIndex: 1,
        years: 100000,
        source: { optionId: "0f93b2", text: "十万年魂环" },
        typeSelection: { optionId: "fb7c2b", text: "猴子类类" },
        speciesSelection: { optionId: "a28a72", text: "泰坦巨猿" },
        grantsSoulBone: true,
        levelBefore: 1
    };

    const early = resolveApkRoutePool({
        contentIndex,
        session,
        ...dynamicHandlers
    });
    assert.equal(early.flowId, "humanEarlyRingGrowth");
    assert.equal(session.character.pendingRing.years, 100000);
    assert.equal(session.pendingSoulBone, null);
    assert.equal(
        session.character.flags["formal:early-hundred-thousand-ring-growth:0:1"],
        true
    );

    const growthPoolId = "2a68b6d8-2791-4e79-b7cc-f2870a0b8581";
    const growthOption = contentIndex.getRouteOption(growthPoolId, "a3c6fa");
    commitApkRouteOption({
        contentIndex,
        session,
        spin: {
            flowId: "humanEarlyRingGrowth",
            poolId: growthPoolId,
            optionId: "a3c6fa",
            option: growthOption
        },
        ...dynamicHandlers
    });
    assert.equal(session.currentFlowId, "humanResumeEarlyRingReward");

    const resumed = resolveApkRoutePool({
        contentIndex,
        session,
        ...dynamicHandlers
    });
    assert.equal(resumed.flowId, "humanSoulBonePart");
    assert.equal(resumed.poolId, "ce286ca9-296f-471c-8f4f-701b9c7f6169");
    assert.equal(session.character.pendingRing, null);
    assert.equal(session.pendingSoulBone.years, 100000);
});

test("APK early growth bonus handler prepares a separate hundred-thousand-year soul bone", () => {
    const routeGraph = loadRealRouteGraph();
    const contentIndex = createApkRouteContentIndex({
        routeGraph,
        packId: "douluo1",
        humanSoulRingEvidence: loadRealHumanSoulRingEvidence(),
        humanSoulRingSpeciesEvidence: loadRealHumanSoulRingSpeciesEvidence()
    });
    const session = createApkRouteSession({
        routeGraph,
        packId: "douluo1",
        seed: "soul-ring-early-bonus"
    });
    const dynamicHandlers = createApkRouteDynamicHandlers({ contentIndex });
    session.currentFlowId = "humanEarlyRingGrowth";
    session.character.pendingRing = {
        soulIndex: 0,
        ringIndex: 1,
        years: 100000,
        source: { optionId: "ring", text: "十万年魂环" },
        typeSelection: { optionId: "type", text: "猴子类类" },
        speciesSelection: { optionId: "species", text: "泰坦巨猿" },
        grantsSoulBone: true,
        levelBefore: 1
    };
    const poolId = "2a68b6d8-2791-4e79-b7cc-f2870a0b8581";
    const optionId = "f87e1a";
    const option = contentIndex.getRouteOption(poolId, optionId);
    commitApkRouteOption({
        contentIndex,
        session,
        spin: {
            flowId: "humanEarlyRingGrowth",
            poolId,
            optionId,
            option
        },
        ...dynamicHandlers
    });
    assert.equal(session.currentFlowId, "humanPrepareEarlyBonusSoulBonePart");
    assert.equal(session.pendingSoulBone.years, 100000);

    const prepared = resolveApkRoutePool({
        contentIndex,
        session,
        ...dynamicHandlers
    });
    assert.equal(prepared.flowId, "humanEarlyBonusSoulBonePart");
    assert.equal(prepared.poolId, "ce286ca9-296f-471c-8f4f-701b9c7f6169");
    const spin = drawApkRouteStep({
        contentIndex,
        session,
        ...dynamicHandlers
    });
    commitApkRouteOption({
        contentIndex,
        session,
        spin,
        ...dynamicHandlers
    });
    assert.equal(session.currentFlowId, "humanResumeEarlyRingReward");
    assert.equal(session.pendingSoulBone, null);
    assert.equal(session.character.soulBones.length, 1);
    assert.equal(session.character.soulBones[0].years, 100000);
});
