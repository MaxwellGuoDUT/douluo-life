import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import { createV10ContentLoader } from "../js/v10-content-loader.js";
import { createV10HumanRunner, projectV10SourceCharacter } from "../js/v10-human-runner.js";
import { createV10LifeRunner } from "../js/v10-life-runner.js";

globalThis.document ??= { createElement() { return { relList: { supports: () => true }, addEventListener(name, handler) { if (name === "load") queueMicrotask(handler); }, setAttribute() {} }; }, getElementsByTagName: () => [], querySelector: () => null, querySelectorAll: () => [], head: { appendChild() {} } };
globalThis.window ??= { dispatchEvent: () => true };

const root = new URL("../", import.meta.url);
const pageRunner = createV10LifeRunner({ contentLoader: createV10ContentLoader({
    moduleBaseUrl: root.href,
    fetchImpl: async path => ({ ok: true, json: async () => JSON.parse(fs.readFileSync(new URL(path, root), "utf8")) })
}) });

const CATALOG_ROOT = new URL("../data/apk-canonical/catalogs/", import.meta.url);

function readCatalog(name) {
    return JSON.parse(fs.readFileSync(new URL(name, CATALOG_ROOT), "utf8"));
}

function materializeDouluo1({ formalEvidence = true } = {}) {
    const shard = readCatalog("route-graph.douluo1.json");
    return {
        routeGraph: {
            schemaVersion: "apk-route-graph/1.0",
            packageVersion: shard.packageVersion,
            status: shard.status,
            source: shard.source,
            generatedBy: shard.generatedBy,
            packs: [shard.pack],
            diagnostics: shard.diagnostics
        },
        formalSpecialResultEvidence: formalEvidence
            ? readCatalog("formal-special-result-runtime-evidence.json")
            : null,
        humanSoulRingEvidence: readCatalog("human-soul-ring-runtime-evidence.json"),
        followUpPrepareEvidence: readCatalog("followup-prepare-runtime-evidence.json"),
        humanSoulRingSpeciesEvidence: readCatalog(
            "human-soul-ring-species-runtime-evidence.json"
        ),
        officialBeastElementEvidence: readCatalog(
            "official-beast-element-runtime-evidence.json"
        ),
        combatPowerEvidence: readCatalog("combat-power-runtime-evidence.json")
    };
}

const loaded = materializeDouluo1();

function terminalProjection(runner) {
    return {
        phase: runner.phase,
        age: runner.summary?.age,
        level: runner.summary?.level,
        ending: runner.summary?.ending,
        cursor: runner.session.random.cursor,
        history: runner.session.history.length,
        routeHistory: runner.session.routeHistory.length,
        dynamicHistory: runner.session.dynamicHistory.length
    };
}

test("page human runner completes at its source death and locks further steps", async () => {
    const runner = await pageRunner.start("douluo1", { route: "human", seed: "apk-route-demo-seed" });
    const result = await runner.runToTerminal({ yieldStep: () => Promise.resolve() });
    assert.equal(result.status, "completed");
    assert.equal(runner.phase, "completed");
    assert.equal(runner.summary.age, 20);
    assert.equal(runner.summary.ending.kind, "death");
    assert.equal(runner.summary.ending.title, "陨落");
    assert.ok(runner.summary.history > 100);
    assert.equal(runner.session.random.cursor, runner.session.history.length);
    const locked = structuredClone(terminalProjection(runner));
    assert.equal(runner.step().blocked, true);
    assert.deepEqual(terminalProjection(runner), locked);
});

test("a fixed page human seed double-run is deterministic through source death", async () => {
    const first = await pageRunner.start("douluo1", { route: "human", seed: "v05-destiny-002" });
    const second = await pageRunner.start("douluo1", { route: "human", seed: "v05-destiny-002" });
    await first.runToTerminal({ yieldStep: () => Promise.resolve() });
    await second.runToTerminal({ yieldStep: () => Promise.resolve() });
    assert.deepEqual(terminalProjection(first), terminalProjection(second));
    assert.equal(first.summary.age, 19);
    assert.equal(first.summary.ending.id, "death");
    assert.equal(first.session.finished, true);
});

test("representative page destinies keep advancing after a 200-step batch", async () => {
    const seeds = ["v05-destiny-001", "v05-destiny-013"];
    const outcomes = [];
    for (const seed of seeds) {
        const runner = await pageRunner.start("douluo1", { route: "human", seed });
        const batch = await runner.runToTerminal({ yieldStep: () => Promise.resolve() });
        outcomes.push({
            seed,
            reason: batch.reason,
            phase: runner.phase,
            age: runner.session.character.age,
            history: runner.session.history.length,
            resumed: runner.step().committed
        });
    }
    assert.equal(outcomes.length, seeds.length);
    assert.ok(outcomes.every(outcome => outcome.reason === "batch-limit" && outcome.phase === "ready"));
    assert.ok(outcomes.every(outcome => outcome.history === 200 && outcome.resumed));
    assert.ok(outcomes.every(outcome => outcome.age > 25));
});

test("missing human handler evidence rejects atomically", () => {
    const runner = createV10HumanRunner({
        loaded: materializeDouluo1({ formalEvidence: false }),
        seed: "apk-route-demo-seed"
    });
    for (let step = 0; step < 1000 && runner.phase === "ready"; step += 1) {
        const before = structuredClone(runner.session);
        const result = runner.step();
        if (result.status === "boundary") {
            assert.match(result.error.code, /EVIDENCE|DYNAMIC|UNRESOLVED/u);
            assert.deepEqual(runner.session, before);
            return;
        }
    }
    assert.fail("expected a typed evidence boundary");
});


// Altered snapshots below are explicitly mechanism fixtures, never reachability evidence.
import { createV05ContentIndex } from "../js/v05-demo.js";
import { planFormalStory, planFormalHumanScheduler, V10_ASCENSION_ATTEMPT_AGE } from "../js/apk-scheduler-runtime.js";
import { withV10GodTrialRuntime } from "../js/v10-god-trial-runtime.js";

const retryLoader = createV10ContentLoader({ moduleBaseUrl: root.href,
    fetchImpl: async path => ({ ok: true, json: async () => JSON.parse(fs.readFileSync(new URL(path, root), "utf8")) }) });
const retryPool = "1209bb56-d533-48af-b012-204292b96f68";
const retryFlow = "douluo1:flow.formal-story." + retryPool;
const retryPreselection = "formal:d1-story:selected:cdae9943-fb9d-49ba-853c-40d9b78924ae:403ea3";

async function retryPrefix() {
    const life = await pageRunner.start("douluo1", { seed: "ascension-directed-633", route: "human" });
    for (let n = 0; n < 131; n++) assert.equal(life.step().error, null);
    return life;
}

test("ascension retry: genuine 131 prefix remains equal; insufficient first result records one atomic age and restores", async () => {
    const life = await retryPrefix(), before = life.exportSnapshot();
    const old = JSON.parse(fs.readFileSync(new URL("test/fixtures/v10-closure/legacy-snapshots.json", root), "utf8"));
    const expected = structuredClone(old.lives.find(l => l.seed === "ascension-directed-633").initial.session);
    const events = fs.readFileSync(new URL("test/fixtures/v10-closure/legacy-replay.jsonl", root), "utf8").trim().split("\n").map(JSON.parse)
        .filter(e => e.seed === "ascension-directed-633" && e.runId === undefined && e.inputIndex <= 132);
    function apply(event) { for (const d of event.changes) { let obj = expected; for (const p of d.path.slice(0, -1)) obj = obj[p]; const p = d.path.at(-1); if (d.op === "set") obj[p] = structuredClone(d.value); else if (d.op === "delete") delete obj[p]; else obj[p].push(...structuredClone(d.value)); } }
    for (const event of events.slice(0, 131)) apply(event);
    assert.deepEqual(life.session, expected); assert.equal(before.session.character.level, 98);
    const result = life.step(); assert.equal(result.error, null); assert.equal(result.spin.optionId, "a3e30b");
    apply(events[131]);
    expected.character.flags[V10_ASCENSION_ATTEMPT_AGE] = before.session.character.age;
    expected.character.transactions.push({ reason: "v10-source-custom-handler", referenceId: retryFlow + ":douluo1:handler.formal-story.result",
        idempotencyKey: "v10-source:douluo1:132:a3e30b:2:0:setFlag", type: "setFlag" });
    assert.deepEqual(life.session, expected);
    const resumed = await pageRunner.start("douluo1", { seed: before.seed, route: "human", snapshot: before }); resumed.step();
    assert.deepEqual(resumed.exportSnapshot(), life.exportSnapshot());
    const after = life.exportSnapshot(), restored = await pageRunner.start("douluo1", { seed: after.seed, route: "human", snapshot: after });
    life.step(); restored.step(); assert.deepEqual(life.exportSnapshot(), restored.exportSnapshot());
    assert.notEqual(life.session.history.at(-1).poolId, retryPool);
});

test("ascension retry mechanism: annual eligibility, priorities, nonterminal cooldown, source ending and rollback", async () => {
    const life = await retryPrefix(), nonterminalPrefix = life.exportSnapshot(); assert.equal(life.step().error, null);
    const original = life.exportSnapshot();
    const source = await retryLoader.getSourceRuntime("douluo1");
    const index = createV05ContentIndex(withV10GodTrialRuntime(await retryLoader.getHumanRuntimeContent(), source, "human"));
    const fixture = structuredClone(original.session); fixture.character.age++; fixture.character.level = 100;
    fixture.currentFlowId = "douluo1:flow.formal-human.scheduler"; fixture.currentPoolId = null;
    fixture.pendingNextStepId = null; fixture.awaitingAdvance = false;
    const plan = session => planFormalHumanScheduler({ contentIndex: index, session, allowPost150: true });
    assert.equal(plan(fixture).target, retryFlow);
    assert.equal(fixture.character.flags["formal:d1-story:free-mode"], true);
    assert.equal(fixture.character.flags["formal:d1-story:completed:" + retryPool], true);
    for (const change of [s => s.character.level = 99, s => s.character.age--, s => s.character.storyBranch = 1,
        s => delete s.character.flags[retryPreselection], s => delete s.character.flags[V10_ASCENSION_ATTEMPT_AGE],
        s => s.character.godTrial = { status: "qualified" }, s => s.character.godTrial = { status: "active" },
        s => s.character.ending = { id: "fixture-terminal" }, s => s.pendingSoulBone = { id: "fixture-pending" },
        s => s.character.flags["formal:element-draws"] = 1,
        s => { s.character.traits.push("domain-prototype"); s.character.domains = []; }]) {
        const rejected = structuredClone(fixture); change(rejected); assert.notEqual(plan(rejected).target, retryFlow);
    }
    assert.notEqual(planFormalStory({ contentIndex: index, character: fixture.character, allowPost150: false }).target, retryFlow);
    const noInitialEligibility = structuredClone(original); delete noInitialEligibility.session.character.flags[V10_ASCENSION_ATTEMPT_AGE];
    noInitialEligibility.session.character.level = 100; noInitialEligibility.session.currentFlowId = retryFlow;
    noInitialEligibility.session.currentPoolId = null; noInitialEligibility.session.pendingNextStepId = null; noInitialEligibility.session.awaitingAdvance = false;
    const luckyMiss = await pageRunner.start("douluo1", { seed: original.seed, route: "human", snapshot: noInitialEligibility });
    assert.equal(luckyMiss.step().error, null); assert.equal(Object.hasOwn(luckyMiss.session.character.flags, V10_ASCENSION_ATTEMPT_AGE), false);
    // Exact pool result fixture: unchanged RNG and weights, source handler still owns the result.
    const retrySnapshot = { ...original, session: structuredClone(fixture) };
    const retry = await pageRunner.start("douluo1", { seed: original.seed, route: "human", snapshot: retrySnapshot });
    const result = retry.step(); assert.equal(result.error, null); assert.equal(result.spin.poolId, retryPool);
    assert.equal(result.spin.optionId, "607ee5");
    // Source rule confirmed in native Node: both engines defer human endings below 150.
    assert.equal(retry.session.character.ending, null);
    assert.equal(retry.session.character.flags["formal:deferred-ending:douluo1:story:independent-ascension"], true);
    assert.equal(retry.session.character.flags[V10_ASCENSION_ATTEMPT_AGE], fixture.character.age);
    // Compare the original source handler and native source engine at the same fixture age.
    const sourceExpected = structuredClone(fixture), engine = await import("../data/v10/source-runtime/App-qyLEl8t4.js");
    sourceExpected.character = projectV10SourceCharacter(sourceExpected.character);
    const sourceOption = source.game.pools.find(p => p.id === retryPool).options.find(o => o.id === "607ee5");
    source.game.customHandlers[sourceOption.customHandler]({ state: sourceExpected, step: source.game.flows[retryFlow], option: sourceOption,
        applyEffects(effects) { engine.a(sourceExpected.character, effects.filter(e => e.type !== "addLog")); } });
    assert.equal(sourceExpected.character.ending, null);
    assert.equal(sourceExpected.character.flags["formal:deferred-ending:douluo1:story:independent-ascension"], true);
    // At 150 local effects settle as well; verify that the retry cannot bypass a real ending.
    const endingFixture = structuredClone(retrySnapshot); endingFixture.session.character.age = 150;
    endingFixture.session.character.flags[V10_ASCENSION_ATTEMPT_AGE] = 149;
    const ended = await pageRunner.start("douluo1", { seed: original.seed, route: "human", snapshot: endingFixture });
    const settlement = ended.step(); assert.equal(settlement.error, null); assert.equal(settlement.spin.optionId, "607ee5");
    assert.equal(ended.session.character.ending.id, "douluo1:story:independent-ascension");
    const locked = ended.exportSnapshot(); assert.equal(ended.step().blocked, true); assert.deepEqual(ended.exportSnapshot(), locked);
    assert.notEqual(plan(ended.session).target, retryFlow);
    // Use the unchanged RNG/history of the original 131 snapshot; do not force a result.
    const nonterminalFixture = structuredClone(nonterminalPrefix);
    nonterminalFixture.session.character.age++;
    nonterminalFixture.session.character.level = 100;
    nonterminalFixture.session.character.flags[V10_ASCENSION_ATTEMPT_AGE] = original.session.character.age;
    nonterminalFixture.session.character.flags["formal:d1-story:free-mode"] = true;
    nonterminalFixture.session.character.flags["formal:d1-story:completed:" + retryPool] = true;
    nonterminalFixture.session.currentFlowId = "douluo1:flow.formal-human.scheduler";
    nonterminalFixture.session.currentPoolId = null;
    nonterminalFixture.session.pendingNextStepId = null;
    nonterminalFixture.session.awaitingAdvance = false;
    const nonterminal = await pageRunner.start("douluo1", { seed: original.seed, route: "human", snapshot: nonterminalFixture });
    const miss = nonterminal.step(); assert.equal(miss.error, null); assert.equal(miss.spin.poolId, retryPool);
    assert.notEqual(miss.spin.optionId, "607ee5");
    assert.equal(nonterminal.session.character.flags[V10_ASCENSION_ATTEMPT_AGE], nonterminalFixture.session.character.age);
    assert.notEqual(plan(nonterminal.session).target, retryFlow);
    const restored = await pageRunner.start("douluo1", { seed: original.seed, route: "human", snapshot: nonterminal.exportSnapshot() });
    nonterminal.step(); restored.step(); assert.deepEqual(nonterminal.exportSnapshot(), restored.exportSnapshot());
    assert.notEqual(nonterminal.session.history.at(-1).poolId, retryPool);
    for (const invalid of [-1, 1.5, fixture.character.age + 1, undefined]) {
        const bad = structuredClone(retrySnapshot); bad.session.character.flags[V10_ASCENSION_ATTEMPT_AGE] = invalid;
        const runner = await pageRunner.start("douluo1", { seed: original.seed, route: "human", snapshot: bad });
        const untouched = runner.exportSnapshot(), rejected = runner.step();
        assert.equal(rejected.committed, false); assert.equal(rejected.error.code, "V10_ASCENSION_RETRY_STATE_INVALID"); assert.deepEqual(runner.exportSnapshot(), untouched);
    }
    const variant = modify => ({ ...retryLoader, getHumanRuntimeContent: async () => {
        const content = structuredClone(await retryLoader.getHumanRuntimeContent()); modify(content.routeGraph.packs[0].pools.find(p => p.id === retryPool)); return content; } });
    const drift = createV10LifeRunner({ contentLoader: variant(p => { p.options[2].source.weight = 41; }) });
    const driftLife = await drift.start("douluo1", { seed: original.seed, route: "human", snapshot: retrySnapshot });
    const untouched = driftLife.exportSnapshot(), rejected = driftLife.step();
    assert.equal(rejected.error.code, "V10_ASCENSION_RETRY_SOURCE_DRIFT"); assert.deepEqual(driftLife.exportSnapshot(), untouched);
    const faultyLoader = { ...retryLoader, getSourceRuntime: async id => {
        const pack = await retryLoader.getSourceRuntime(id); const handler = pack.game.customHandlers["douluo1:handler.formal-story.result"];
        return { ...pack, game: { ...pack.game, customHandlers: { ...pack.game.customHandlers,
            "douluo1:handler.formal-story.result"(context) { handler(context); context.applyEffects([{ type: "unknown-retry-effect" }]); } } } };
    } };
    // Move back to the exact source-result prefix for this handler failure fixture.
    const exact = await createV10LifeRunner({ contentLoader: faultyLoader }).start("douluo1", { seed: original.seed, route: "human", snapshot: retrySnapshot });
    const exactBefore = exact.exportSnapshot(), exactFailure = exact.step(); assert.equal(exactFailure.error.code, "UNSUPPORTED_APK_EFFECT"); assert.deepEqual(exact.exportSnapshot(), exactBefore);
    assert.deepEqual(life.exportSnapshot(), original);
});
