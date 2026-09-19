import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { createV10ContentLoader } from "../js/v10-content-loader.js";
import { createV10HumanRunner } from "../js/v10-human-runner.js";
globalThis.document ??= {
    createElement() { return { relList: { supports: () => true },
        addEventListener(name, listener) { if (name === "load") queueMicrotask(listener); }, setAttribute() {} }; },
    getElementsByTagName: () => [], querySelector: () => null,
    querySelectorAll: () => [], head: { appendChild() {} }
};
globalThis.window ??= { dispatchEvent: () => true };
const root = new URL("../", import.meta.url);
const loader = createV10ContentLoader({ moduleBaseUrl: root.href,
    fetchImpl: async path => ({ ok: true, json: async () => JSON.parse(fs.readFileSync(new URL(path, root), "utf8")) }) });
const source = await loader.getSourceRuntime("douluo2");
const graph = await loader.getRouteGraph("douluo2");
function create(seed, route = "human", { sourcePack = source, routeGraph = graph, snapshot = null } = {}) {
    return createV10HumanRunner({ seed, route, snapshot, sourcePack: { ...sourcePack, routeGraph },
        loaded: { routeGraph: { schemaVersion: "apk-route-graph/1.0", packageVersion: source.manifest.version,
            packs: [{ ...routeGraph.pack, id: "douluo2" }] } } });
}
function advance(runner, limit = 1000) {
    for (let step = 0; step < limit && runner.phase === "ready"; step++) {
        const before = structuredClone(runner.session);
        const result = runner.step();
        if (["boundary", "error"].includes(runner.phase)) {
            assert.deepEqual(runner.session, before, "rejected step must be fully atomic");
            assert.fail(JSON.stringify({ flow: runner.session.currentFlowId, error: result.error }));
        }
    }
    return runner;
}
test("Douluo II owns its human entry and only its eight source beast periods", () => {
    assert.equal(graph.pack.routeEntries.human, source.manifest.entryFlowId);
    const entry = graph.pack.flows.find(flow => flow.id === graph.pack.routeEntries.beast);
    const pool = graph.pack.pools.find(pool => pool.id === entry.source.poolId);
    assert.deepEqual(pool.options.map(option => option.id).sort(), ["59e386", "ba905f", "4c8fd7", "8702ff", "b7137a", "e189ee", "f33cca", "1b3ec8"].sort());
    assert.ok(pool.options.every(option => option.route.customHandler.value === "bootstrap:handler.period"));
    const beast = advance(create("day27-beast-2", "beast"), 2);
    assert.equal(beast.session.worldEra, "douluo2");
    assert.ok(pool.options.some(option => option.id === beast.session.character.entrySelections.period.optionId));
    assert.ok(beast.session.character.timelineAge < 0);
});
for (const scenario of [
    { route: "human", seed: "day27-human-1", ending: "death" },
    { route: "human", seed: "day27-human-3", ending: "douluo2:human-lifespan-150", age: 150 },
    { route: "beast", seed: "day27-beast-1", ending: "death", finalRoute: "transformed" },
    { route: "beast", seed: "day27-beast-2", ending: "death", finalRoute: "beast" },
    { route: "beast", seed: "day27-beast-3", ending: "douluo2-supreme-beast-god", finalRoute: "beast" }
]) {
    test(`source route replay: ${scenario.seed} -> ${scenario.ending}`, () => {
        const runner = advance(create(scenario.seed, scenario.route));
        assert.equal(runner.phase, "completed");
        assert.equal(runner.summary.ending.id, scenario.ending);
        if (scenario.age) assert.equal(runner.summary.age, scenario.age);
        if (scenario.finalRoute) assert.equal(runner.summary.route, scenario.finalRoute);
        assert.equal(runner.session.packId, "douluo2");
        assert.equal(runner.session.pendingFollowUps.length, 0);
        const before = runner.exportSnapshot();
        assert.equal(runner.step().committed, false);
        assert.deepEqual(runner.exportSnapshot(), before);
        const restored = create(scenario.seed, scenario.route, { snapshot: JSON.parse(JSON.stringify(before)) });
        assert.equal(restored.phase, "completed");
        assert.deepEqual(restored.summary, runner.summary);
    });
}
test("independent seed replay and JSON resume preserve every committed field", () => {
    const seed = "day27-beast-1";
    const first = advance(create(seed, "beast"), 70);
    const independent = advance(create(seed, "beast"), 70);
    assert.deepEqual(independent.exportSnapshot(), first.exportSnapshot());
    const resumed = create(seed, "beast", { snapshot: JSON.parse(JSON.stringify(first.exportSnapshot())) });
    advance(first); advance(resumed);
    assert.deepEqual(resumed.exportSnapshot(), first.exportSnapshot());
    assert.ok(first.session.dynamicHistory.some(item => item.operation === "followUp.prepare.soulBone"));
});
test("wrong pack, content, version and malformed snapshots reject without changing a live run", () => {
    const seed = "day27-human-1";
    const live = advance(create(seed), 3);
    const original = live.exportSnapshot();
    for (const corrupt of [
        value => { value.packId = "douluo1"; },
        value => { value.session.packId = "douluo1"; },
        value => { value.contentIdentity = "old-content"; },
        value => { value.schemaVersion = "v10-runner-snapshot/999"; },
        value => { delete value.session.history; },
        value => { value.session.random.cursor = -1; },
        value => { value.session.currentFlowId = "douluo1:flow.formal-human.identity"; }
    ]) {
        const snapshot = structuredClone(original); corrupt(snapshot);
        assert.throws(() => create(seed, "human", { snapshot }), error => ["V10_SNAPSHOT_INVALID", "V05_SESSION_SNAPSHOT_INVALID"].includes(error.code));
        assert.deepEqual(live.exportSnapshot(), original);
    }
});
test("removing a source handler rejects atomically without a Douluo I fallback", () => {
    const customHandlers = { ...source.game.customHandlers };
    delete customHandlers["douluo2:handler.human.country"];
    const runner = create("day27-human-1", "human", { sourcePack: { ...source, game: { ...source.game, customHandlers } } });
    const before = runner.exportSnapshot();
    assert.equal(runner.step().error.code, "APK_ROUTE_DYNAMIC_OPTION_UNRESOLVED");
    assert.deepEqual(runner.exportSnapshot(), before);
});
test("unknown source effects and conditions remain typed atomic boundaries", () => {
    for (const field of ["effects", "requirements"]) {
        const altered = structuredClone(graph);
        const flow = altered.pack.flows.find(flow => flow.id === altered.pack.entryFlowId);
        const pool = altered.pack.pools.find(pool => pool.id === flow.source.poolId);
        for (const option of pool.options) {
            option.source[field] = [{ type: "unknown-day27-semantics" }];
            option.route[field] = option.source[field];
        }
        const runner = create("day27-human-1", "human", { routeGraph: altered });
        const before = runner.exportSnapshot();
        const result = runner.step();
        assert.ok(["UNSUPPORTED_APK_EFFECT", "APK_REQUIREMENT_UNRESOLVED"].includes(result.error?.code), JSON.stringify(result.error));
        assert.deepEqual(runner.exportSnapshot(), before);
    }
});

test("ablation: source requirement reads need no character projection", async () => {
    const runnerUrl = new URL("../js/v10-human-runner.js", import.meta.url);
    const text = fs.readFileSync(runnerUrl, "utf8");
    const baselineCall = "sourcePack.engine.l(projectCharacter(character), [requirement])";
    const leanCall = "sourcePack.engine.l(character, [requirement])";
    assert.ok(text.includes(leanCall));
    const variant = text.replace(leanCall, baselineCall)
        .replace(/from "(\.\/[^"]+)"/gu, (_match, path) => 'from ' + JSON.stringify(new URL(path, runnerUrl).href));
    const { createV10HumanRunner: createBaseline } = await import('data:text/javascript;base64,' + Buffer.from(variant).toString('base64'));
    let reads = 0;
    const checkedSource = { ...source, engine: { ...source.engine, l(character, requirements) {
        const before = structuredClone(character);
        const result = source.engine.l(character, requirements);
        assert.deepEqual(character, before, "requirements must not mutate live character");
        reads++;
        return result;
    } } };
    const seed = "day27-beast-1";
    const baseline = advance(createBaseline({ seed, route: "beast", sourcePack: { ...source, routeGraph: graph }, loaded: { routeGraph: { schemaVersion: "apk-route-graph/1.0", packageVersion: source.manifest.version, packs: [{ ...graph.pack, id: "douluo2" }] } } }), 70);
    const makeLean = (snapshot = null, sourcePack = checkedSource) => createV10HumanRunner({ seed, route: "beast", snapshot,
        sourcePack: { ...sourcePack, routeGraph: graph },
        loaded: { routeGraph: { schemaVersion: "apk-route-graph/1.0", packageVersion: source.manifest.version,
            packs: [{ ...graph.pack, id: "douluo2" }] } } });
    const independent = advance(makeLean(), 70);
    assert.deepEqual(independent.exportSnapshot(), baseline.exportSnapshot());
    const resumed = makeLean(JSON.parse(JSON.stringify(baseline.exportSnapshot())));
    advance(baseline); advance(independent); advance(resumed);
    assert.deepEqual(independent.exportSnapshot(), baseline.exportSnapshot());
    assert.deepEqual(resumed.exportSnapshot(), baseline.exportSnapshot());
    assert.ok(reads > 0);
    const handlers = { ...source.game.customHandlers };
    delete handlers["bootstrap:handler.period"];
    const broken = makeLean(null, { ...checkedSource, game: { ...source.game, customHandlers: handlers } });
    const before = broken.exportSnapshot();
    assert.equal(broken.step().error.code, "APK_ROUTE_DYNAMIC_OPTION_UNRESOLVED");
    assert.deepEqual(broken.exportSnapshot(), before);
});

// Coverage map: declarations are not behavior evidence. Static terminal inventory
// contains 7 death and 6 ending references; the replays below cover named cases.
// Sacrifice pool 8ee20fa5... requires beast.laws.length > 0 in source foundation
// line 108262. Both declining and accepting sacrifice have entrance-to-terminal replays.
test('Day27 closeout: source relationship settlement and completed god trials from human entry', () => {
    const life = advance(create('day27-human-2'));
    assert.equal(life.phase, 'completed');
    assert.equal(life.summary.ending.id, 'douluo2:human-lifespan-150');
    assert.equal(life.session.character.flags['douluo2:story:relationship'], 'separated');
    const trials = life.session.character.godTrials;
    assert.ok(trials.length > 0);
    for (const trial of trials) {
        assert.equal(trial.status, 'completed');
        assert.equal(trial.claimedRewardStages.length, trial.totalStages);
        assert.equal(new Set(trial.claimedRewardStages).size, trial.totalStages);
    }
    assert.ok(life.session.character.godhood);
});
for (const scenario of [
    { seed: 'day27-beast-5', ending: 'death', cause: 'formal:5b245136-44f0-4d11-bff2-0bf0ddeaa377:45cd64' },
    { seed: 'day27-beast-7', ending: 'formal:5b245136-44f0-4d11-bff2-0bf0ddeaa377:666e62' },
    { seed: 'day27-beast-10', ending: 'douluo2-divine-beast' }
]) test(`Day27 source combat/ascension terminal from entry: ${scenario.seed}`, () => {
    const life = advance(create(scenario.seed, 'beast'));
    assert.equal(life.phase, 'completed');
    assert.equal(life.summary.ending.id, scenario.ending);
    if (scenario.cause) assert.equal(life.summary.ending.cause, scenario.cause);
    const resumed = create(scenario.seed, 'beast', { snapshot: JSON.parse(JSON.stringify(life.exportSnapshot())) });
    assert.deepEqual(resumed.exportSnapshot(), life.exportSnapshot());
});

test('Day27 sacrifice pool is source-reachable; declining preserves progression to terminal', () => {
    const life = create('day27-beast-15', 'beast');
    const poolId = '8ee20fa5-f9da-469b-aa21-fb2a2dc8e871';
    let reachedWithLaw = false;
    for (let i = 0; i < 1100 && life.phase === 'ready'; i++) {
        const lawsBefore = life.session.character.beast?.laws?.length ?? 0;
        const historyBefore = life.session.history.length;
        const result = life.step();
        assert.ok(!result.error, JSON.stringify(result.error));
        const selection = life.session.history.slice(historyBefore).find(item => item.poolId === poolId);
        if (selection) {
            assert.ok(lawsBefore > 0);
            assert.equal(selection.optionId, 'fab033');
            assert.equal(life.phase, 'ready');
            reachedWithLaw = true;
        }
    }
    assert.equal(reachedWithLaw, true);
    assert.equal(life.phase, 'completed');
    assert.equal(life.summary.ending.id, 'douluo2-supreme-beast-god');
});
test('source optional follow-up requirements match empty conditions; real differences still roll back', () => {
    const seed = 'day27-beast-135';
    const life = advance(create(seed, 'beast'), 650);
    const before = life.exportSnapshot();
    const poolId = '04d05245-7e51-4b32-a649-4478a1d83c00';
    const optionId = '483d2e';
    const rule = source.game.pools.find(pool => pool.id === poolId).options.find(option => option.id === optionId).followUps[0];
    assert.equal(Object.hasOwn(rule, 'requirements'), false);
    function withRule(nextRule) {
        const pools = source.game.pools.map(pool => pool.id !== poolId ? pool : { ...pool,
            options: pool.options.map(option => option.id !== optionId ? option : { ...option, followUps: [nextRule] }) });
        return create(seed, 'beast', { snapshot: before, sourcePack: { ...source, game: { ...source.game, pools } } });
    }
    for (const corrupt of [
        { ...rule, requirements: [{ type: 'levelAtLeast', value: 999 }] },
        { ...rule, count: 2 }, { ...rule, reason: 'not-the-source-reason' },
        { ...rule, prepare: { ...rule.prepare, years: rule.prepare.years + 1 } }
    ]) {
        const rejected = withRule(corrupt);
        assert.equal(rejected.step().error?.code, 'APK_ROUTE_FOLLOWUP_PREPARE_EVIDENCE_MISMATCH');
        assert.deepEqual(rejected.exportSnapshot(), before);
    }
    const explicitEmpty = withRule({ ...rule, requirements: [] });
    assert.equal(explicitEmpty.step().committed, true);
    const result = life.step();
    assert.equal(result.committed, true, JSON.stringify(result.error));
    assert.deepEqual(life.exportSnapshot(), explicitEmpty.exportSnapshot());
    assert.ok(life.session.dynamicHistory.some(item => item.sourcePoolId === poolId
        && item.sourceOptionId === optionId && item.operation === 'followUp.prepare.soulBone'));
    advance(life, 2000);
    assert.equal(life.phase, 'completed');
});

test('Day27 acceptance of sacrifice reaches its source terminal and survives JSON restore', () => {
    const seed = 'day27-beast-158';
    const life = create(seed, 'beast');
    const poolId = '8ee20fa5-f9da-469b-aa21-fb2a2dc8e871';
    let witnessed = false;
    for (let i = 0; i < 1100 && life.phase === 'ready'; i++) {
        const lawCount = life.session.character.beast?.laws?.length ?? 0;
        const historyCount = life.session.history.length;
        const result = life.step();
        assert.ok(!result.error, JSON.stringify(result.error));
        const choice = life.session.history.slice(historyCount).find(item => item.poolId === poolId);
        if (choice) {
            assert.ok(lawCount > 0);
            assert.equal(choice.optionId, '9ceefb');
            witnessed = true;
        }
    }
    assert.equal(witnessed, true);
    assert.equal(life.phase, 'completed');
    assert.equal(life.summary.ending.id, 'formal:' + poolId + ':9ceefb');
    const snapshot = JSON.parse(JSON.stringify(life.exportSnapshot()));
    const restored = create(seed, 'beast', { snapshot });
    assert.deepEqual(restored.exportSnapshot(), snapshot);
    assert.deepEqual(restored.summary, life.summary);
    assert.equal(restored.step().committed, false);
    assert.deepEqual(restored.exportSnapshot(), snapshot);
});
test('Day27 relationship ending follows source deferred-ending semantics until age 150', () => {
    const life = create('day27-human-10');
    const poolId = 'b71254fa-19d5-41c2-beee-15a7b795654c';
    const endingId = 'formal:' + poolId + ':763287';
    let witnessed = false;
    for (let i = 0; i < 1100 && life.phase === 'ready'; i++) {
        const count = life.session.history.length;
        const result = life.step();
        assert.ok(!result.error, JSON.stringify(result.error));
        if (life.session.history.slice(count).some(item => item.poolId === poolId && item.optionId === '763287')) {
            assert.equal(life.session.character.flags['douluo2:story:relationship'], 'estranged');
            assert.equal(life.session.character.flags['formal:deferred-ending:' + endingId], true);
            assert.equal(life.session.character.flags['formal:free-mode'], true);
            assert.equal(life.session.character.ending, null);
            assert.equal(life.phase, 'ready');
            witnessed = true;
        }
    }
    assert.equal(witnessed, true);
    assert.equal(life.phase, 'completed');
    assert.equal(life.summary.age, 150);
    assert.equal(life.summary.ending.id, 'douluo2:human-lifespan-150');
});
