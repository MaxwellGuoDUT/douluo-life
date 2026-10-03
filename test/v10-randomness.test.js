import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import { createV10Display, actualAgeText, playerWheelView } from '../js/v10-display.js';
import { createV10HistoryView } from '../js/v10-history-view.js';
function runUI(source, context) {
    Object.assign(context, { actualAgeText, playerWheelView,
        createV10Display: fields => createV10Display(fields, context.document),
        createV10HistoryView: options => createV10HistoryView({...options, document: context.document}) });
    return runInNewContext(source, context);
}
import { APK_RUNTIME_EFFECT_TYPES, applyApkEffects, createApkCharacterState, selectApkPoolOptions } from '../js/apk-rule-runtime.js';
import { createV05ContentIndex } from '../js/v05-demo.js';
import { createApkRouteRequirementEvaluator } from '../js/apk-route-runtime.js';
import { createV10ContentLoader } from '../js/v10-content-loader.js';
import { createV10LifeRunner } from '../js/v10-life-runner.js';
import { createV10HumanRunner, planV10HumanLifespan } from '../js/v10-human-runner.js';
import { V10_GOD_TRIAL_STAGES } from '../js/v10-god-trial-runtime.js';

globalThis.document ??= { createElement() { return { relList: { supports: () => true }, addEventListener(name, handler) { if (name === 'load') queueMicrotask(handler); }, setAttribute() {} }; }, getElementsByTagName: () => [], querySelector: () => null, querySelectorAll: () => [], head: { appendChild() {} } };
globalThis.window ??= { dispatchEvent: () => true };

const root = new URL('../', import.meta.url);
const loader = createV10ContentLoader({
    moduleBaseUrl: root.href,
    fetchImpl: async path => ({ ok: true, json: async () => JSON.parse(fs.readFileSync(new URL(path, root), 'utf8')) })
});
const runner = createV10LifeRunner({ contentLoader: loader });

test('grantGodhood raises level bounds and keeps life open until a separate ending effect', () => {
    const input = createApkCharacterState('human');
    input.level = 73;
    const granted = applyApkEffects(input, [{ type: 'grantGodhood', godhoodId: 'sea-god', name: '海神', tier: '一级' }]).character;
    assert.equal(input.level, 73);
    assert.equal(input.godhood, null);
    assert.equal(granted.level, 100);
    assert.equal(granted.maxLevel, 139);
    assert.deepEqual(granted.godhoods.map(item => item.id), ['sea-god']);
    assert.equal(granted.godhood.levelBeforeAscension, 73);
    assert.equal(granted.ending, null);
    const second = applyApkEffects(granted, [{ type: 'grantGodhood', godhoodId: 'angel-god', name: '天使神', tier: '神王' }]).character;
    assert.equal(second.maxLevel, 159);
    assert.deepEqual(second.godhoods.map(item => item.id), ['sea-god', 'angel-god']);
    assert.equal(second.ending, null);
    const repeated = applyApkEffects(second, [{ type: 'grantGodhood', godhoodId: 'angel-god', name: '天使神', tier: '神王' }]).character;
    assert.deepEqual(repeated.godhoods, second.godhoods);
    const terminal = applyApkEffects(second, [{ type: 'ending', endingId: 'source-ascension', title: '飞升', text: '飞升神界' }]).character;
    assert.equal(terminal.ending.id, 'source-ascension');
    assert.equal(terminal.ending.text, '飞升神界');
});

test('approved Shrek branch correction preserves source data, history, resume, and typed drift guards', async () => {
    const loaded = await loader.getHumanRuntimeContent();
    const sourceOption = loaded.routeGraph.packs[0].pools
        .find(pool => pool.id === 'd2701441-4df0-4eeb-bed4-b5dbc8390392')
        .options.find(option => option.id === 'cfe7dd');
    assert.equal(sourceOption.route.effects.find(effect => effect.type === 'setStoryBranch').branch, 3);
    const seed = 'ascension-directed-0';
    const life = await runner.start('douluo1', { route: 'human', seed });
    for (let i = 0; i < 60 && !life.session.character.storyBranch; i++) {
        assert.equal(life.step().error, null);
    }
    const choice = life.session.history.find(item => item.poolId === 'd2701441-4df0-4eeb-bed4-b5dbc8390392');
    assert.equal(choice.optionId, 'cfe7dd');
    assert.equal(choice.effects.find(effect => effect.type === 'setStoryBranch').branch, 1);
    assert.equal(life.session.character.storyBranch, 1);
    assert.equal(life.session.character.flags['formal:faction-locked'], true);
    assert.equal(sourceOption.route.effects.find(effect => effect.type === 'setStoryBranch').branch, 3);
    const snapshot = JSON.parse(JSON.stringify(life.exportSnapshot()));
    const restored = await runner.start('douluo1', { route: 'human', seed, snapshot });
    assert.deepEqual(restored.exportSnapshot(), snapshot);
    assert.deepEqual(restored.step(), life.step());
    assert.deepEqual(restored.exportSnapshot(), life.exportSnapshot());

    const oldSnapshot = structuredClone(snapshot);
    oldSnapshot.session.history.find(item => item.poolId === choice.poolId)
        .effects.find(effect => effect.type === 'setStoryBranch').branch = 3;
    oldSnapshot.session.character.storyBranch = 3;
    delete oldSnapshot.session.character.flags['formal:faction-locked'];
    await assert.rejects(runner.start('douluo1', { route: 'human', seed, snapshot: oldSnapshot }),
        { code: 'V10_SNAPSHOT_SEMANTICS_CHANGED' });

    const second = await runner.start('douluo1', { route: 'human', seed: 'ascension-directed-3' });
    for (let i = 0; i < 60 && !second.session.character.storyBranch; i++) assert.equal(second.step().error, null);
    assert.equal(second.session.character.storyBranch, 2);

    const drift = structuredClone(loaded);
    drift.routeGraph.packs[0].pools.find(pool => pool.id === choice.poolId)
        .options.find(option => option.id === choice.optionId)
        .route.effects.find(effect => effect.type === 'setStoryBranch').branch = 2;
    assert.throws(() => createV10HumanRunner({ loaded: drift, seed }),
        { code: 'V10_SHREK_BRANCH_SOURCE_DRIFT' });
});

test('V1 cultivation lifespan is seeded, monotone, and exempts real immortality states', async () => {
    const base = { packId: 'douluo1', character: {
        route: 'human', age: 200, level: 1, flags: {}, talents: [], godhood: null,
        ending: null
    } };
    const low = planV10HumanLifespan(base, 'lifespan-seed');
    assert.equal(low.terminal, true);
    assert.equal(low.effects[0].endingId, 'douluo1:v10-human-natural-lifespan');
    assert.deepEqual(planV10HumanLifespan(structuredClone(base), 'lifespan-seed'), low);
    base.character.level = 99;
    assert.equal(planV10HumanLifespan(base, 'lifespan-seed'), null);
    base.character.age = 400;
    assert.equal(planV10HumanLifespan(base, 'lifespan-seed').terminal, true);
    for (const exempt of [
        { godhood: { id: 'angel-god' } },
        { flags: { immortal: true } },
        { talents: [{ optionId: '0d2184', text: '永生者' }] }
    ]) {
        assert.equal(planV10HumanLifespan({ ...base, character: { ...base.character, ...exempt } }, 'lifespan-seed'), null);
    }
});

test('V1 lifespan ending commits atomically in both packs and survives snapshot restore', async () => {
    for (const [packId, flowId] of [
        ['douluo1', 'douluo1:flow.formal-human.scheduler'],
        ['douluo2', 'douluo2:flow.annual-growth-plan']
    ]) {
        const seed = `lifespan-${packId}`;
        const start = await runner.start(packId, { route: 'human', seed });
        const snapshot = start.exportSnapshot();
        snapshot.session.character.age = 400;
        snapshot.session.character.level = 99;
        snapshot.session.character.flags['v10:lifespan:peak-level'] = 99;
        snapshot.session.currentFlowId = flowId;
        snapshot.session.pendingNextStepId = flowId;
        const life = await runner.start(packId, { route: 'human', seed, snapshot });
        const cursor = life.session.random.cursor;
        const history = life.session.history.length;
        const result = life.step();
        assert.equal(result.error, null, JSON.stringify(result.error));
        assert.equal(life.phase, 'completed');
        assert.equal(life.summary.ending.id, `${packId}:v10-human-natural-lifespan`);
        assert.equal(life.summary.ending.kind, 'death');
        assert.equal(life.session.random.cursor, cursor);
        assert.equal(life.session.history.length, history);
        const restored = await runner.start(packId, { route: 'human', seed, snapshot: life.exportSnapshot() });
        assert.deepEqual(restored.exportSnapshot(), life.exportSnapshot());
        assert.equal(restored.step().committed, false);
    }
});

test('page runner keeps godhood and immortal lives open beyond natural lifespan', async () => {
    for (const exempt of [
        character => { character.godhood = { id: 'sea-god' }; character.godhoods = [{ id: 'sea-god' }]; },
        character => { character.talents.push({ optionId: '0d2184', text: '永生者' }); }
    ]) {
        const seed = 'lifespan-douluo1';
        const start = await runner.start('douluo1', { route: 'human', seed });
        const snapshot = start.exportSnapshot();
        snapshot.session.character.age = 400;
        snapshot.session.character.level = 99;
        snapshot.session.character.flags['v10:lifespan:peak-level'] = 99;
        snapshot.session.currentFlowId = 'douluo1:flow.formal-human.scheduler';
        snapshot.session.pendingNextStepId = snapshot.session.currentFlowId;
        exempt(snapshot.session.character);
        const life = await runner.start('douluo1', { route: 'human', seed, snapshot });
        const result = life.step();
        assert.equal(result.error, null, JSON.stringify(result.error));
        assert.notEqual(life.summary?.ending?.id, 'douluo1:v10-human-natural-lifespan');
        assert.equal(life.session.character.ending, null);
    }
});

test('V1 continuous advance stops at a resumable batch limit', async () => {
    const life = await runner.start('douluo1', { route: 'human', seed: 'post-150-batch' });
    const result = await life.runToTerminal({ maxSteps: 2, yieldStep: () => Promise.resolve() });
    assert.equal(result.reason, 'batch-limit');
    assert.equal(result.steps, 2);
    assert.equal(life.phase, 'ready');
    const snapshot = life.exportSnapshot();
    const replay = await runner.start('douluo1', { route: 'human', seed: 'post-150-batch', snapshot });
    assert.deepEqual(replay.exportSnapshot(), snapshot);
    assert.equal(life.step().error, null);
    assert.equal(replay.step().error, null);
    assert.deepEqual(replay.exportSnapshot(), life.exportSnapshot());
});

test('Douluo I source runtime commits the complementary combat pool and formal story handler', async () => {
    const seed = '00000000-0000-4000-8000-000000000001';
    const life = await runner.start('douluo1', { route: 'human', seed });
    for (let i = 0; i < 65; i++) {
        const result = life.step();
        assert.equal(result.error, null);
    }
    const before = life.exportSnapshot();
    assert.equal(life.session.random.cursor, 65);
    const contentIndex = createV05ContentIndex(await loader.getHumanRuntimeContent());
    const pool = selectApkPoolOptions(contentIndex, life.session.character,
        'e86c0163-ccdc-4a71-a4a7-ed802953e5e0',
        { requirementEvaluator: createApkRouteRequirementEvaluator({ contentIndex }) });
    assert.equal(pool.options.length, 1);
    assert.equal(pool.unresolved.length, 0);
    const result = life.step();
    assert.equal(result.error, null);
    assert.equal(result.committed, true);
    assert.equal(life.phase, 'ready');
    assert.equal(life.session.history.at(-1).poolId, 'e86c0163-ccdc-4a71-a4a7-ed802953e5e0');
    assert.equal(life.session.dynamicHistory.at(-1).handlerId, 'douluo1:handler.formal-story.result');
    assert.equal(life.session.character.flags['formal:d1-story:completed:e86c0163-ccdc-4a71-a4a7-ed802953e5e0'], true);
    assert.equal(life.session.random.cursor, 66);
    assert.equal(life.session.history.length, 66);
    assert.notDeepEqual(life.exportSnapshot(), before);
    assert.equal(life.step().error, null);
    assert.notEqual(life.session.history.at(-1).poolId, 'e86c0163-ccdc-4a71-a4a7-ed802953e5e0');
    const replay = await runner.start('douluo1', { route: 'human', seed });
    for (let i = 0; i < 67; i++) replay.step();
    assert.deepEqual(replay.exportSnapshot(), life.exportSnapshot());
    await life.runToTerminal({ yieldStep: () => Promise.resolve() });
    assert.equal(life.phase, 'completed');
    assert.equal(life.session.history.length, 99);
    assert.equal(life.session.random.cursor, 99);
    assert.equal(life.session.history.filter(entry => entry.poolId === 'e86c0163-ccdc-4a71-a4a7-ed802953e5e0').length, 1);
    assert.equal(life.summary.ending.id, 'death');
});

test('default starts use fresh seeds, while replay and typed seeds stay reproducible', async () => {
    const nodes = new Map();
    const documentListeners = {};
    const starts = [];
    let batchOptions;
    let currentLife;
    let sequence = 0;
    const element = () => ({
        value: '', textContent: '', dataset: {}, disabled: false, hidden: false,
        style: { setProperty() {}, removeProperty() {} }, attributes: {},
        setAttribute(name, value) { this.attributes[name] = value; },
        focus() { this.focused = true; }, querySelector: () => ({ focus() {} }),
        listeners: {}, addEventListener(name, handler) { this.listeners[name] = handler; },
        replaceChildren(...children) { this.children = children; }, scrollIntoView() {}
    });
    const document = {
        querySelector(selector) { if (!nodes.has(selector)) nodes.set(selector, element()); return nodes.get(selector); },
        querySelectorAll: () => [], createElement: element,
        addEventListener(name, handler) { documentListeners[name] = handler; }
    };
    document.querySelector('#character-menu-panel').hidden = true;
    const fakeLife = (packId, seed, route) => ({
        phase: 'ready', characterProfile: { route, age: 0, level: 0, stage: '开局' },
        session: { packId, random: { cursor: 0 }, history: [], timeline: [], character: { beastYears: 0 } },
        lastResult: null, wheelView: { segments: [] }, seed,
        runToTerminal: async options => { batchOptions = options; return { reason: 'batch-limit', steps: options.maxSteps }; },
        exportSnapshot: () => ({ packId, route, seed })
    });
    const context = {
        V10_GOD_TRIAL_STAGES,
        document, setTimeout, crypto: { randomUUID: () => `fresh-${++sequence}` },
        createV10ContentLoader: () => ({ getManifest: async () => ({ packs: [] }) }),
        createV10LifeRunner: () => ({ start: async (packId, { seed, route }) => {
            starts.push({ packId, seed, route });
            currentLife = fakeLife(packId, seed, route);
            return currentLife;
        } }),
        createV10SaveStore: () => ({ list: async () => [], read: async () => currentLife })
    };
    const app = fs.readFileSync(new URL('../js/v10-app.js', import.meta.url), 'utf8').replace(/^import .+;\r?\n/gmu, '');
    runUI(app + '\nglobalThis.testUI = { startLife, renderGame, saveAction, runLife };', context);
    await context.testUI.startLife('human', 'douluo1');
    assert.equal(nodes.get('#pack-list').hidden, true);
    assert.equal(nodes.get('#v10-status').hidden, true);
    assert.equal(nodes.get('#route-toggle').attributes['aria-expanded'], 'false');
    nodes.get('#route-toggle').listeners.click();
    assert.equal(nodes.get('#pack-list').hidden, false);
    assert.equal(nodes.get('#route-toggle').attributes['aria-expanded'], 'true');
    nodes.get('#route-toggle').listeners.click();
    assert.equal(nodes.get('#pack-list').hidden, true);
    await context.testUI.startLife('human', 'douluo1');
    assert.deepEqual(starts.map(start => start.seed), ['fresh-1', 'fresh-2']);
    assert.equal(nodes.get('#human-seed').value, 'fresh-2');
    await context.testUI.startLife('human', 'douluo1', { replay: true });
    assert.equal(starts.at(-1).seed, 'fresh-2');
    nodes.get('#human-seed').value = 'chosen-seed';
    nodes.get('#human-seed').listeners.input();
    await context.testUI.startLife('beast', 'douluo2');
    assert.deepEqual(starts.at(-1), { packId: 'douluo2', seed: 'chosen-seed', route: 'beast' });
    await context.testUI.startLife('beast', 'douluo2', { fresh: true });
    assert.equal(starts.at(-1).seed, 'fresh-3');
    await context.testUI.startLife('beast', 'douluo2');
    assert.equal(starts.at(-1).seed, 'fresh-4');
    nodes.get('#route-toggle').listeners.click();
    assert.equal(nodes.get('#pack-list').hidden, false);
    await context.testUI.saveAction('load');
    assert.equal(nodes.get('#pack-list').hidden, true);
    assert.equal(nodes.get('#route-toggle').attributes['aria-expanded'], 'false');
    currentLife.wheelView = { status: 'ready', title: '真实池', poolId: 'pool-1', totalWeight: 4, segments: [
        { optionId: 'a', fullText: '第一项', weight: 1, percentage: 25, startAngle: 0, endAngle: 90 },
        { optionId: 'b', fullText: '第二项', weight: 3, percentage: 75, startAngle: 90, endAngle: 360 }
    ] };
    context.testUI.renderGame();
    assert.match(nodes.get('#human-wheel').style.background, /0deg 90deg/);
    assert.match(nodes.get('#human-options').children[1].textContent, /第二项 · 权重 3 · 75\.00%/);
    assert.equal(nodes.get('#human-route-value').textContent, 'douluo2 / 魂兽');
    assert.equal(nodes.get('#human-species-value').textContent, '未确定');
    assert.equal(nodes.get('#character-menu-panel').hidden, true);
    nodes.get('#character-toggle').listeners.click();
    assert.equal(nodes.get('#character-menu-panel').hidden, false);
    assert.equal(nodes.get('#character-toggle').attributes['aria-expanded'], 'true');
    documentListeners.keydown({ key: 'Escape' });
    assert.equal(nodes.get('#character-menu-panel').hidden, true);
    assert.equal(nodes.get('#character-toggle').focused, true);
    Object.assign(currentLife.session.character, {
        martialSouls: [{ name: '蓝银草', rings: [{ years: 1000 }] }],
        soulBones: [{ name: '头骨', years: 200000 }],
        attributes: ['water'], elementProgress: { water: 2, fire: 1 },
        domains: ['海神领域'], bloodlines: ['地龙血脉'],
        talents: [{ text: '永生者' }], traits: ['坚韧'],
        skills: [{ name: '锻造术', level: 6 }], artifacts: [{ name: '海神三叉戟', rank: 2 }],
        godhood: { name: '海神', tier: '一级' },
        godhoods: [{ name: '海神', tier: '一级' }, { name: '天使神', tier: '一级' }],
        titles: ['封号斗罗']
    });
    const beforeDetails = JSON.stringify(currentLife.session);
    context.testUI.renderGame();
    assert.equal(nodes.get('#human-ability-counts').textContent, '1 / 2 / 1');
    assert.match(nodes.get('#human-martial-souls').children[0].textContent, /蓝银草 · 1环（1000年）/);
    assert.equal(nodes.get('#human-soul-bones').children[0].textContent, '头骨 · 200000年');
    assert.deepEqual(nodes.get('#human-attributes').children.map(item => item.textContent), ['水（water） · 进度 2', '火（fire） · 进度 1']);
    assert.equal(nodes.get('#human-domains').children[0].textContent, '海神领域');
    assert.equal(nodes.get('#human-bloodlines').children[0].textContent, '地龙血脉');
    assert.deepEqual(nodes.get('#human-talents').children.map(item => item.textContent), ['天赋：永生者', '特质：坚韧']);
    assert.deepEqual(nodes.get('#human-skills').children.map(item => item.textContent), ['技能：锻造术 · 6级', '神器：海神三叉戟 · 阶2']);
    assert.deepEqual(nodes.get('#human-godhood').children.map(item => item.textContent),
        ['神位：海神 · 一级', '神位：天使神 · 一级', '称号：封号斗罗']);
    assert.equal(JSON.stringify(currentLife.session), beforeDetails);
    currentLife.session.character.godhoods = [];
    context.testUI.renderGame();
    assert.deepEqual(nodes.get('#human-godhood').children.map(item => item.textContent),
        ['神位：海神 · 一级', '称号：封号斗罗']);
    // Player progress must describe source state without mutating it or granting a godhood.
    currentLife.session.packId = 'douluo1';
    currentLife.session.character.level = 31;
    currentLife.session.character.godTrial = { tier: '二级', status: 'active', deityName: '地龙神', currentStage: 3, totalStages: 8, claimedRewardStages: [1,2] };
    currentLife.session.character.soulBones = ['head','torso','leftLeg','rightLeg','rightArm'].map(partId => ({partId}));
    const trialBefore = JSON.stringify(currentLife.session);
    context.testUI.renderGame();
    assert.match(nodes.get('#human-stage-value').textContent, /第3考.*需60级（当前31级）/);
    assert.ok(nodes.get('#human-godhood').children[0].textContent.includes('已领取2/8考奖励'));
    assert.equal(nodes.get('#human-godhood').children[1].textContent, '神考继承需要六个部位魂骨：还缺左臂骨');
    assert.equal(JSON.stringify(currentLife.session), trialBefore);
    currentLife.session.character.godTrial = {tier:'神王',status:'qualified'};
    context.testUI.renderGame();
    assert.match(nodes.get('#human-stage-value').textContent, /神王考核.*奖励流程未完整开放/);
    currentLife.session.character.flags = {'formal:deferred-ending:douluo1:story:independent-ascension':true};
    context.testUI.renderGame();
    assert.match(nodes.get('#human-result').textContent, /尚未形成飞升结局/);
    assert.equal(currentLife.phase, 'ready');
    delete currentLife.session.character.flags['formal:deferred-ending:douluo1:story:independent-ascension'];
    delete currentLife.session.character.godTrial;
    currentLife.session.character.soulBones = [];
    context.testUI.renderGame();
    assert.equal(nodes.get('#human-soul-bones').children[0].textContent, '暂无');
    currentLife.wheelView = { status: 'dynamic', title: '动态转盘', message: '由 runtime 解析', flowId: 'flow-1', segments: [] };
    context.testUI.renderGame();
    assert.equal(nodes.get('#human-options').children.length, 0);
    assert.match(nodes.get('#runtime-diagnostics').textContent, /flow-1/);
    assert.doesNotMatch(nodes.get('#human-wheel-note').textContent, /flow-1|runtime/);
    await context.testUI.runLife('runToTerminal', '正在连续推进…');
    assert.equal(batchOptions.maxSteps, 200);
    assert.match(nodes.get('#human-progress').textContent, /本批已推进 200 次/);
    nodes.get('#history-panel').hidden = true;
    nodes.get('#save-panel').hidden = true;
    nodes.get('#character-toggle').listeners.click();
    nodes.get('#history-toggle').listeners.click();
    assert.equal(nodes.get('#character-menu-panel').hidden, true);
    assert.equal(nodes.get('#history-panel').hidden, false);
    assert.equal(nodes.get('#history-toggle').attributes['aria-expanded'], 'true');
    documentListeners.keydown({ key: 'Escape' });
    assert.equal(nodes.get('#history-panel').hidden, true);
    assert.equal(nodes.get('#history-toggle').focused, true);
    currentLife.session.timeline = [{ text: '走入星斗大森林' }, { text: '获得新的机缘' }];
    currentLife.phase = 'completed';
    currentLife.summary = { ending: { title: '陨落', cause: '魂兽袭击' }, route: 'beast', level: 2, history: 2 };
    currentLife.session.character.beastYears = 50;
    context.testUI.renderGame();
    nodes.get('#history-toggle').listeners.click();
    assert.deepEqual(nodes.get('#human-history').children.map(item => item.textContent), ['走入星斗大森林', '获得新的机缘']);
    assert.match(nodes.get('#human-ending-text').textContent, /魂兽袭击/);
    currentLife.summary.ending = { title: '至高兽神', kind: 'success' };
    currentLife.session.history.push({ text: '突破成功，你成就至高兽神的神位' });
    currentLife.lastWheelResult = null;
    context.testUI.renderGame();
    assert.match(nodes.get('#human-ending-text').textContent, /突破成功，你成就至高兽神的神位/);
});

test('player seed 105th source death immediately appears above the wheel', async () => {
    const seed = 'e17471b9-3ae9-47d5-9ebd-7198d09c9b3e';
    const life = await runner.start('douluo1', { route: 'human', seed });
    for (let step = 0; step < 104; step += 1) {
        const result = life.step();
        assert.equal(result.error, null, `step ${step + 1}: ${JSON.stringify(result.error)}`);
    }
    assert.equal(life.phase, 'ready');
    const beforeDeath = life.exportSnapshot();
    const nodes = new Map();
    const element = () => ({
        textContent: '', value: '', dataset: {}, hidden: false, disabled: false,
        style: { setProperty() {}, removeProperty() {} },
        setAttribute() {}, addEventListener() {},
        replaceChildren(...children) { this.children = children; }
    });
    const document = {
        querySelector(selector) { if (!nodes.has(selector)) nodes.set(selector, element()); return nodes.get(selector); },
        querySelectorAll: () => [], createElement: element, addEventListener() {}
    };
    document.querySelector('#human-ending').hidden = true;
    document.querySelector('#history-panel').hidden = true;
    const context = {
        document,
        setTimeout() { throw new Error('terminal UI must not wait for wheel animation'); },
        createV10ContentLoader: () => ({ getManifest: async () => ({ packs: [] }) }),
        createV10LifeRunner: () => ({}),
        createV10SaveStore: () => ({ list: async () => [] }),
        testLife: life
    };
    const app = fs.readFileSync(new URL('../js/v10-app.js', import.meta.url), 'utf8').replace(/^import .+;\r?\n/gmu, '');
    runUI(app + '\nlifeRunner = testLife; globalThis.testUI = { runLife };', context);
    await context.testUI.runLife('step', '正在提交一次选择…');
    assert.equal(life.phase, 'completed');
    assert.equal(life.session.history.length, 105);
    assert.equal(life.session.character.ending.kind, 'death');
    assert.equal(nodes.get('#human-ending').hidden, false);
    assert.match(nodes.get('#human-result').textContent, /人生结局：逃不过炮灰的宿命，你死了/);
    assert.match(nodes.get('#human-ending-text').textContent, /陨落 · 21岁 · 等级38 · 105次选择 · 逃不过炮灰的宿命，你死了/);
    assert.equal(nodes.get('#human-stage-value').textContent, '人生结局');
    assert.equal(nodes.get('#human-wheel-title').textContent, '人生结局');
    assert.equal(nodes.get('#human-step').disabled, true);
    assert.match(nodes.get('#human-progress').textContent, /人生已结束/);
    const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
    assert.ok(html.indexOf('id="human-ending"') < html.indexOf('class="wheel-wrap"'));
    const replay = await runner.start('douluo1', { route: 'human', seed, snapshot: beforeDeath });
    replay.step();
    assert.deepEqual(replay.exportSnapshot(), life.exportSnapshot());
});

test('addBloodline follows source idempotency and a real Douluo I branch commits it', async () => {
    assert.ok(APK_RUNTIME_EFFECT_TYPES.includes('addBloodline'));
    const state = createApkCharacterState('human');
    const applied = applyApkEffects(state, [
        { type: 'addBloodline', bloodlineId: '地龙血脉' },
        { type: 'addBloodline', bloodlineId: '地龙血脉' }
    ]);
    assert.deepEqual(applied.character.bloodlines, ['地龙血脉']);
    assert.deepEqual(state.bloodlines, []);

    const life = await runner.start('douluo1', { route: 'human', seed: 'player-b' });
    for (let i = 0; i < 12 && !life.session.character.bloodlines.includes('地龙血脉'); i++) {
        const result = life.step();
        assert.ok(!result.error, JSON.stringify(result.error));
    }
    assert.ok(life.session.character.bloodlines.includes('地龙血脉'));
    assert.equal(life.phase, 'ready');
    const snapshot = life.exportSnapshot();
    const restored = await runner.start('douluo1', { route: 'human', seed: 'player-b', snapshot: JSON.parse(JSON.stringify(snapshot)) });
    assert.deepEqual(restored.exportSnapshot(), snapshot);
    const replay = await runner.start('douluo1', { route: 'human', seed: 'player-b' });
    for (let i = 0; i < snapshot.session.history.length; i++) replay.step();
    assert.deepEqual(replay.exportSnapshot(), snapshot);
    assert.deepEqual(restored.step(), life.step());
    assert.deepEqual(restored.exportSnapshot(), life.exportSnapshot());
    const before = structuredClone(state);
    assert.throws(() => applyApkEffects(state, [
        { type: 'addBloodline', bloodlineId: '地龙血脉' },
        { type: 'missing-source-effect' }
    ]), { code: 'UNSUPPORTED_APK_EFFECT' });
    assert.deepEqual(state, before);
});

test('god trial start and deity effects match the source engine and reject an active trial atomically', async () => {
    const sourceEngine = await import('../data/v10/source-runtime/App-qyLEl8t4.js');
    const start = { type: 'startGodTrial', tier: '一级', total: 9,
        selection: { optionId: 'ee1504', text: '一级神考核' } };
    const deity = { type: 'setGodTrialDeity', deityId: 'source-deity', deityName: '神位',
        selection: { optionId: 'source-deity', text: '神位' } };
    const base = createApkCharacterState('human');
    const runnerText = fs.readFileSync(new URL('../js/v10-human-runner.js', import.meta.url), 'utf8');
    const fieldText = runnerText.match(/SOURCE_CHARACTER_FIELDS = Object\.freeze\(\[([\s\S]*?)\]\)/u)?.[1];
    assert.ok(fieldText);
    const fields = [...fieldText.matchAll(/"([^"]+)"/gu)].map(match => match[1]);
    const source = Object.fromEntries(fields.filter(field => field in base).map(field => [field, structuredClone(base[field])]));
    sourceEngine.a(source, [start, deity]);
    const local = applyApkEffects(base, [start, deity]);
    assert.deepEqual(local.character.godTrial, JSON.parse(JSON.stringify(source.godTrial)));
    assert.deepEqual(base.godTrial, null);
    await assert.rejects(async () => applyApkEffects(local.character, [start]), { code: 'APK_GOD_TRIAL_ACTIVE' });
    assert.equal(local.character.godTrial.status, 'active');
});

test('different real seeds diverge, and the same seed replays the same state', async () => {
    const sample = async seed => {
        const life = await runner.start('douluo1', { route: 'human', seed });
        for (let i = 0; i < 6 && life.phase === 'ready'; i++) {
            const result = life.step();
            assert.ok(!result.error, JSON.stringify(result.error));
        }
        return life.exportSnapshot();
    };
    const first = await sample('player-a');
    assert.deepEqual(await sample('player-a'), first);
    assert.notDeepEqual((await sample('player-b')).session.history, first.session.history);
});

test('ablation A/B: unused V1 presentationHistory forwarding does not change runtime or rollback', async () => {
    const moduleUrl = new URL('../js/v10-human-runner.js', import.meta.url);
    const lean = fs.readFileSync(moduleUrl, 'utf8');
    assert.equal(lean.includes('get presentationHistory()'), false);
    const original = lean.replace('        get lastWheelResult() { return base.lastWheelResult; },',
        '        get lastWheelResult() { return base.lastWheelResult; },\n        get presentationHistory() { return base.presentationHistory; },');
    assert.notEqual(original, lean);
    const absoluteImports = original.replace(/from "(\.\/[^"]+)"/gu,
        (_match, path) => `from "${new URL(path, moduleUrl).href}"`);
    const aFactory = (await import('data:text/javascript;base64,' + Buffer.from(absoluteImports).toString('base64'))).createV10HumanRunner;
    const bFactory = createV10HumanRunner;
    const loaded = await loader.getHumanRuntimeContent();
    const source = await loader.getSourceRuntime('douluo1');
    const routeGraph = await loader.getRouteGraph('douluo1');
    const sourcePack = { ...source, routeGraph };
    const observed = [];
    for (const factory of [aFactory, bFactory]) {
        const life = factory({ loaded, sourcePack, seed: 'apk-route-demo-seed' });
        for (let i = 0; i < 12; i++) assert.equal(life.step().error, null);
        const snapshot = life.exportSnapshot();
        const restored = factory({ loaded, sourcePack, seed: 'apk-route-demo-seed', snapshot: JSON.parse(JSON.stringify(snapshot)) });
        assert.deepEqual(restored.exportSnapshot(), snapshot);
        await restored.runToTerminal({ yieldStep: () => Promise.resolve() });
        assert.equal(restored.phase, 'completed');
        const brokenHandlers = { ...source.game.customHandlers };
        delete brokenHandlers['douluo1:handler.formal-story.result'];
        const broken = factory({ loaded, sourcePack: { ...sourcePack, game: { ...source.game, customHandlers: brokenHandlers } },
            seed: '00000000-0000-4000-8000-000000000001' });
        for (let i = 0; i < 65; i++) assert.equal(broken.step().error, null);
        const before = broken.exportSnapshot();
        const rejected = broken.step();
        assert.equal(rejected.status, 'boundary');
        assert.deepEqual(broken.exportSnapshot(), before);
        observed.push({
            snapshot, resumed: restored.exportSnapshot(), ending: restored.summary.ending,
            cursor: restored.session.random.cursor, history: restored.session.history,
            rejected: { error: rejected.error, snapshot: broken.exportSnapshot() }
        });
    }
    assert.deepEqual(observed[0], observed[1]);
});


test('screenshot UI projects distinct human and beast facts without changing the session', async () => {
    const { nodes, ui, life } = screenshotUIHarness();
    const before = JSON.stringify(life.session);
    ui.renderGame();
    assert.equal(JSON.stringify(life.session), before);
    assert.equal(nodes.get('#cultivation-value').textContent, '19 级');
    assert.equal(nodes.get('#actual-age-value').textContent, '10 岁');
    assert.equal(nodes.get('#character-name').textContent, '蓝银草');
    life.characterProfile.route = 'beast';
    Object.assign(life.session.character, {
        route: 'beast', age: 160, beastYears: 1045,
        beast: { chronologicalAge: 160, species: { text: '测试本体' }, bloodlines: [
            { selection: { optionId: 'body', text: '本体' }, percentage: 50 },
            { selection: { optionId: 'other', text: '融合血脉' }, percentage: 50 }
        ], bloodlineComponents: [{bloodlineId:'body',ratioBasisPoints:5000},{bloodlineId:'other',ratioBasisPoints:5000}],
        attributeStages: { earth: 1 } }
    });
    const beastBefore = JSON.stringify(life.session);
    ui.renderGame();
    assert.equal(nodes.get('#character-name').textContent, '测试本体');
    assert.equal(nodes.get('#cultivation-value').textContent, '1,045 年');
    assert.equal(nodes.get('#actual-age-value').textContent, '160 岁');
    assert.equal(nodes.get('#character-bloodline').textContent, '本体50% + 融合血脉50%');
    assert.ok(nodes.get('#character-attributes').children.some(tag => tag.textContent === '土'));
    ui.togglePanel('character-menu-panel');
    ui.closePanel('character-menu-panel');
    assert.equal(JSON.stringify(life.session), beastBefore);
    life.characterProfile.route = 'transformed';
    life.session.character.route = 'transformed';
    ui.renderGame();
    assert.equal(nodes.get('#cultivation-value').textContent, '19 级');
    assert.equal(nodes.get('#character-name').textContent, '蓝银草');
    delete life.session.character.age;
    delete life.session.character.level;
    ui.renderGame();
    assert.equal(nodes.get('#actual-age-value').textContent, '未确定');
    assert.equal(nodes.get('#cultivation-value').textContent, '未确定');
});

test('screenshot UI auto is serial and pause waits for the current committed animation', async () => {
    const h = screenshotUIHarness();
    const pending = h.ui.toggleAuto();
    assert.equal(h.steps(), 1);
    assert.equal(h.nodes.get('#human-age').disabled, false);
    await h.ui.runLife('step', 'manual');
    assert.equal(h.steps(), 1);
    await h.ui.toggleAuto(); // pause while animation is pending
    await h.flushTimer();
    await pending;
    assert.equal(h.steps(), 1);
    assert.equal(h.nodes.get('#human-age').textContent, '自动推进');
    assert.equal(h.nodes.get('#human-step').disabled, false);
});

test('screenshot UI auto cancels on drawers, hidden page, route, new life, and load', async () => {
    for (const cancel of ['drawer', 'hidden', 'route', 'new', 'load']) {
        const h = screenshotUIHarness();
        const oldLife = h.life;
        const pending = h.ui.toggleAuto();
        let switching;
        if (cancel === 'drawer') h.ui.togglePanel('history-panel');
        if (cancel === 'hidden') { h.document.hidden = true; h.listeners.visibilitychange(); }
        if (cancel === 'route') h.nodes.get('#route-toggle').listeners.click();
        if (cancel === 'new') switching = h.nodes.get('#human-new').listeners.click();
        if (cancel === 'load') switching = h.ui.saveAction('load');
        await h.flushTimer();
        await pending;
        if (switching) await switching;
        assert.equal(oldLife.session.history.length, 1, cancel);
        assert.equal(h.timers.length, 0, cancel);
        assert.equal(h.nodes.get('#human-age').textContent, '自动推进');
        await h.ui.stopAutoAndWait();
        assert.equal(oldLife.session.history.length, 1, cancel);
    }
});

test('screenshot UI auto caps at 200 and terminal or typed failure locks all advance entries', async () => {
    const thrown = screenshotUIHarness();
    thrown.life.step = () => { throw new Error('fixture unexpected failure'); };
    await thrown.ui.toggleAuto();
    assert.match(thrown.nodes.get('#human-progress').textContent, /UI_STEP_FAILED.*fixture unexpected failure/);
    assert.equal(thrown.timers.length, 0);
    const cap = screenshotUIHarness({ immediate: true });
    await cap.ui.toggleAuto();
    assert.equal(cap.steps(), 200);
    assert.match(cap.nodes.get('#human-progress').textContent, /200次.*暂停/);
    assert.equal(cap.nodes.get('#human-age').textContent, '自动推进');
    for (const phase of ['completed', 'boundary', 'error']) {
        const h = screenshotUIHarness({ stopPhase: phase });
        await h.ui.toggleAuto();
        assert.equal(h.steps(), 1);
        for (const id of ['human-step','human-age','human-terminal']) assert.equal(h.nodes.get('#'+id).disabled, true);
        assert.equal(h.timers.length, 0);
        if (phase === 'completed') assert.match(h.nodes.get('#human-result').textContent, /完整终局文字/);
        else assert.match(h.nodes.get('#human-progress').textContent, /FIXTURE_TYPED_STOP/);
    }
});


test('screenshot UI new fate clears all pack and route combinations and returns home', async () => {
    for (const packId of ['douluo1','douluo2']) for (const route of ['human','beast']) {
        const h = screenshotUIHarness({immediate:true});
        h.life.session.packId = packId;
        h.life.characterProfile.route = route;
        h.life.session.character.route = route;
        h.nodes.get('#human-seed').value = 'old-manual-seed';
        h.nodes.get('#human-seed').listeners.input();
        await h.ui.runLife('step','fixture spin');
        const before = JSON.stringify(h.life.session);
        h.ui.togglePanel('character-menu-panel');
        await h.nodes.get('#human-new').listeners.click();
        assert.equal(h.ui.currentLife(),null);
        assert.equal(JSON.stringify(h.life.session),before);
        assert.equal(h.starts.length,0);
        assert.equal(h.seedCalls(),0);
        assert.equal(h.nodes.get('#human-game').hidden,true);
        assert.equal(h.nodes.get('#pack-list').hidden,false);
        assert.equal(h.nodes.get('#v10-status').hidden,false);
        assert.equal(h.nodes.get('#human-seed').value,'');
        assert.equal(h.nodes.get('#current-seed').textContent,'尚未开始');
        assert.equal(h.nodes.get('#human-result').textContent,'等待抽取');
        for (const id of ['human-options','human-history']) assert.equal(h.nodes.get('#'+id).children.length,0);
        assert.equal(h.nodes.get('#human-ending').hidden,true);
        for (const id of ['actual-age-value','cultivation-value']) assert.equal(h.nodes.get('#'+id).textContent,'未确定');
        for (const id of ['character-menu-panel','history-panel','save-panel']) assert.equal(h.nodes.get('#'+id).hidden,true);
        for (const id of ['human-step','human-age','human-terminal','human-restart']) assert.equal(h.nodes.get('#'+id).disabled,true);
        h.nodes.get('#human-restart').listeners.click();
        await h.ui.runLife('step','home cannot advance');
        assert.equal(h.starts.length,0);
        assert.equal(h.steps(),1);
        const nextPack = packId === 'douluo1' ? 'douluo2' : 'douluo1';
        const nextRoute = route === 'human' ? 'beast' : 'human';
        await h.ui.startLife(nextRoute,nextPack);
        assert.deepEqual(h.starts,[{packId:nextPack,route:nextRoute,seed:'new-fixture-1'}]);
        assert.equal(h.ui.currentLife().session.random.cursor,0);
        assert.equal(h.ui.currentLife().session.history.length,0);
        await h.nodes.get('#human-new').listeners.click();
        h.nodes.get('#human-seed').value = 'new-manual-seed';
        h.nodes.get('#human-seed').listeners.input();
        await h.ui.startLife(route,packId);
        assert.equal(h.starts.at(-1).seed,'new-manual-seed');
    }
});

test('screenshot UI new fate waits for auto animation without advancing the next life', async () => {
    const h = screenshotUIHarness();
    const pending = h.ui.toggleAuto();
    assert.equal(h.steps(),1);
    const resetting = h.nodes.get('#human-new').listeners.click();
    assert.equal(h.nodes.get('#human-age').textContent,'自动推进');
    await h.flushTimer();
    await pending;
    await resetting;
    assert.equal(h.ui.currentLife(),null);
    assert.equal(h.timers.length,0);
    assert.equal(h.starts.length,0);
    await h.ui.startLife('beast','douluo2');
    assert.equal(h.steps(),1);
    assert.equal(h.ui.currentLife().session.random.cursor,0);
    assert.equal(h.ui.currentLife().session.history.length,0);
    assert.equal(h.timers.length,0);
});


test('screenshot UI reroll is one-level, uses fresh random inputs, and preserves failed originals', async () => {
    const h = screenshotUIHarness({immediate:true});
    assert.equal(h.nodes.get('#human-reroll').disabled,true);
    await h.nodes.get('#human-reroll').listeners.click();
    assert.equal(h.steps(),0);
    await h.ui.runLife('step','fixture');
    assert.equal(h.nodes.get('#human-reroll').disabled,false);
    await h.nodes.get('#human-reroll').listeners.click();
    assert.equal(h.ui.currentLife().session.history.length,1);
    assert.equal(h.ui.currentLife().session.random.cursor,2);
    await h.nodes.get('#human-reroll').listeners.click();
    assert.equal(h.ui.currentLife().session.history.length,1);
    assert.equal(h.ui.currentLife().session.random.cursor,3);
    assert.equal(h.life.session.history.length,1);
    assert.equal(h.life.session.random.cursor,1);
    for (const opts of [{restoreFailure:true},{rejectReroll:true}]) {
        const failed = screenshotUIHarness({immediate:true,...opts});
        await failed.ui.runLife('step','fixture');
        const original=failed.ui.currentLife(), before=original.exportSnapshot();
        const checkpoint=JSON.stringify(failed.ui.checkpoint());
        await failed.nodes.get('#human-reroll').listeners.click();
        assert.equal(failed.ui.currentLife(),original);
        assert.deepEqual(original.exportSnapshot(),before);
        assert.equal(JSON.stringify(failed.ui.checkpoint()),checkpoint);
        assert.equal(failed.nodes.get('#human-reroll').disabled,false);
        assert.match(failed.nodes.get('#human-progress').textContent,/FIXTURE_(RESTORE_FAILED|REROLL_REJECT)/);
    }
});

test('screenshot UI reroll restores real facts and original weighted pool in both packs and routes', async () => {
    // Four fixed short prefixes only; no seed discovery or forced outcome.
    for (const packId of ['douluo1','douluo2']) for (const route of ['human','beast']) {
        const life=await runner.start(packId,{route,seed:'ui-reroll-validation'});
        const h=screenshotUIHarness({immediate:true,actualLife:life});
        for(let i=0;i<2;i++) assert.equal(await h.ui.runLife('step','real prefix'),true);
        const before=life.exportSnapshot(), wheelBefore=life.wheelView;
        assert.equal(await h.ui.runLife('step','latest draw'),true);
        const original=life.exportSnapshot();
        const retrySnapshot=structuredClone(before);
        retrySnapshot.session.random.cursor=original.session.random.cursor;
        const expected=await runner.start(packId,{route,seed:before.seed,snapshot:retrySnapshot});
        assert.deepEqual(expected.wheelView.segments,wheelBefore.segments);
        assert.equal(expected.step().committed,true);
        await h.nodes.get('#human-reroll').listeners.click();
        const replacement=h.ui.currentLife().exportSnapshot();
        assert.deepEqual(replacement,expected.exportSnapshot());
        assert.deepEqual(life.exportSnapshot(),original); // replaced runner remains untouched
        assert.equal(replacement.session.history.length,original.session.history.length);
        assert.ok(replacement.session.random.cursor>original.session.random.cursor);
        const resumed=await runner.start(packId,{route,seed:before.seed,snapshot:replacement});
        assert.deepEqual(resumed.exportSnapshot(),replacement);
        assert.deepEqual(resumed.step(),h.ui.currentLife().step());
        assert.deepEqual(resumed.exportSnapshot(),h.ui.currentLife().exportSnapshot());
    }
});

test('screenshot UI reroll pauses auto, waits for animation and prevents concurrent replacements', async () => {
    const h=screenshotUIHarness();
    const auto=h.ui.toggleAuto();
    assert.equal(h.nodes.get('#human-reroll').disabled,false);
    const retry=h.nodes.get('#human-reroll').listeners.click();
    await h.flushTimer();
    await auto;
    // Replacement animation is now pending, so repeated clicks cannot commit again.
    const started=h.starts.length;
    await h.nodes.get('#human-reroll').listeners.click();
    assert.equal(h.starts.length,started);
    await h.flushTimer();
    await retry;
    assert.equal(h.ui.currentLife().session.history.length,1);
    assert.equal(h.ui.currentLife().session.random.cursor,2);
    assert.equal(h.timers.length,0);
    assert.equal(h.nodes.get('#human-age').textContent,'自动推进');
});

test('screenshot UI reroll targets last fast or terminal draw and clears on new life or load', async () => {
    const fast=screenshotUIHarness({immediate:true});
    await fast.ui.runLife('runToTerminal','fast');
    assert.equal(fast.ui.checkpoint().snapshot.session.history.length,4);
    await fast.nodes.get('#human-reroll').listeners.click();
    assert.equal(fast.ui.currentLife().session.history.length,5);
    assert.equal(fast.ui.currentLife().session.random.cursor,6);
    const ended=screenshotUIHarness({immediate:true,stopPhase:'completed'});
    await ended.ui.runLife('step','ending');
    assert.equal(ended.nodes.get('#human-step').disabled,true);
    assert.equal(ended.nodes.get('#human-reroll').disabled,false);
    await ended.nodes.get('#human-reroll').listeners.click();
    assert.equal(ended.ui.currentLife().session.history.length,1);
    for(const action of ['new','start','load']) {
        const h=screenshotUIHarness({immediate:true});
        await h.ui.runLife('step','fixture');
        if(action==='new') await h.nodes.get('#human-new').listeners.click();
        if(action==='start') await h.ui.startLife('beast','douluo2');
        if(action==='load') await h.ui.saveAction('load');
        assert.equal(h.ui.checkpoint(),null);
        assert.equal(h.nodes.get('#human-reroll').disabled,true);
        const n=h.starts.length;
        await h.nodes.get('#human-reroll').listeners.click();
        assert.equal(h.starts.length,n);
    }
});

function screenshotUIHarness({ immediate = false, stopPhase = null, actualLife = null, restoreFailure = false, rejectReroll = false } = {}) {
    // Explicit UI mechanism fixture, never used as a real gameplay reachability input.
    const nodes = new Map(), listeners = {}, timers = [], starts = [];
    const element = () => ({
        textContent: '', value: '', dataset: {}, hidden: false, disabled: false, attributes: {},
        style: { setProperty() {}, removeProperty() {} },
        listeners: {}, setAttribute(name,value) { this.attributes[name] = value; },
        addEventListener(name,handler) { this.listeners[name] = handler; },
        replaceChildren(...children) { this.children = children; },
        focus() { this.focused = true; }, querySelector: () => ({ focus() {} }), scrollIntoView() {}
    });
    const document = {
        hidden: false,
        querySelector(selector) { if (!nodes.has(selector)) nodes.set(selector, element()); return nodes.get(selector); },
        querySelectorAll: () => [], createElement: element,
        addEventListener(name,handler) { listeners[name] = handler; }
    };
    for (const id of ['character-menu-panel','history-panel','save-panel']) document.querySelector('#'+id).hidden = true;
    let count = 0;
    const life = {
        phase: 'ready', characterProfile: {route:'human', age:10, level:19},
        session: {packId:'douluo1',random:{cursor:0},history:[],timeline:[],
            character:{route:'human',age:10,level:19,martialSouls:[{name:'蓝银草'}]}},
        wheelView: { title:'UI机制测试池', status:'ready', totalWeight:4, segments:[
            {optionId:'a',fullText:'真实映射格式的选项全文',weight:1,percentage:25,startAngle:0,endAngle:90,midpoint:45},
            {optionId:'b',fullText:'第二项',weight:3,percentage:75,startAngle:90,endAngle:360,midpoint:225}
        ] },
        lastWheelResult:null,
        step({ onCheckpoint = null } = {}) {
            const checkpoint = onCheckpoint ? this.exportSnapshot() : null;
            count += 1;
            if (['boundary','error'].includes(stopPhase)) {
                this.phase=stopPhase; this.error={code:'FIXTURE_TYPED_STOP',message:'测试停止'};
                return {committed:false};
            }
            this.session.random.cursor += 1;
            this.session.history.push({text:'fixture choice '+count});
            this.lastWheelResult = {...this.wheelView,selectedOptionId:'a',recentResult:{text:'测试抽取结果'}};
            if (stopPhase) {
                this.phase = stopPhase;
                this.error = {code:'FIXTURE_TYPED_STOP',message:'测试停止'};
                this.summary = {route:'human',age:10,level:19,history:count,ending:{title:'测试结局',text:'完整终局文字'}};
            }
            if (onCheckpoint) onCheckpoint(checkpoint);
            return {committed:true};
        },
        exportSnapshot() { return {packId:this.session.packId,route:this.session.character.route,seed:this.seed ?? 'fixture',session:structuredClone(this.session)}; },
        async runToTerminal({onStep, onCheckpoint}) {
            for (let i=1;i<=5;i++) { const result = this.step({onCheckpoint}); await onStep(result,i); if (!result.committed) break; }
            return {reason:'batch-limit',steps:5};
        }
    };
    const initialSession = structuredClone(life.session);
    let seedCount = 0;
    const context = {
        document, structuredClone, V10_GOD_TRIAL_STAGES, crypto:{randomUUID:()=> 'new-fixture-'+(++seedCount)},
        setTimeout(callback) { if (immediate) queueMicrotask(callback); else timers.push(callback); },
        createV10ContentLoader:()=>({getManifest:async()=>({packs:[]})}),
        createV10LifeRunner:()=>({start:async(packId, options)=> {
            starts.push({packId,...options});
            if (options.snapshot && restoreFailure) throw Object.assign(new Error('fixture restore failure'), {code:'FIXTURE_RESTORE_FAILED'});
            if (actualLife) return runner.start(packId,options);
            const session = structuredClone(options.snapshot?.session ?? initialSession);
            session.packId = packId; session.character.route = options.route;
            const candidate = {...life,seed:options.seed,phase:'ready',lastWheelResult:null,session,characterProfile:{...life.characterProfile,route:options.route}};
            if (options.snapshot && rejectReroll) {
                candidate.error={code:'FIXTURE_REROLL_REJECT',message:'fixture rejected'};
                candidate.step=()=>({committed:false});
            }
            return candidate;
        }}),
        createV10SaveStore:()=>({list:async()=>[],read:async()=>({...life,phase:'ready',session:structuredClone(life.session)})}),
        testLife:actualLife ?? life
    };
    const app = fs.readFileSync(new URL('../js/v10-app.js', import.meta.url),'utf8').replace(/^import .+;\r?\n/gmu,'');
    runUI(app+'\nlifeRunner=testLife; globalThis.testUI={renderGame,runLife,toggleAuto,stopAutoAndWait,togglePanel,closePanel,startLife,saveAction,currentLife:()=>lifeRunner,checkpoint:()=>undoCheckpoint};',context);
    context.testUI.renderGame();
    return {nodes,listeners,document,life,ui:context.testUI,timers,starts,seedCalls:()=>seedCount,steps:()=>count,
        async flushTimer() { assert.ok(timers.length); timers.shift()(); for(let i=0;i<15;i++) await Promise.resolve(); }
    };
}
