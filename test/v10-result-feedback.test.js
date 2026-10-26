import assert from 'node:assert/strict';
import test from 'node:test';
import { prepareResultFeedback, createResultFeedbackDisplay } from '../js/v10-result-feedback.js';
import { growthChanges } from '../js/v10-experience.js';

const human = () => ({ route: 'human', age: 12, level: 10, martialSouls: [], soulBones: [], wallet: { copper: 0 } });
function project(before, after) {
    const original = structuredClone({ before, after });
    const changes = growthChanges(before, after), unchanged = [...changes];
    const result = prepareResultFeedback(before, after, changes);
    assert.deepEqual({ before, after }, original);
    assert.deepEqual(changes, unchanged);
    return result;
}
function view() {
    const element = () => ({ hidden: false, textContent: '', children: [], attributes: {},
        setAttribute(key, value) { this.attributes[key] = value; },
        replaceChildren(...children) { this.children = children; } });
    const fields = Object.fromEntries(['result-kind', 'result-title', 'result-summary', 'result-feedback',
        'result-highlights', 'result-change-details', 'result-source'].map(id => [id, element()]));
    return { fields, render: createResultFeedbackDisplay(fields, { createElement: element }) };
}

test('awakening and ring feedback use real state changes, including custom-handler rewards without effects', () => {
    const before = human(), awakened = structuredClone(before);
    awakened.martialSouls.push({ name: '木制巨槌', rings: [] });
    const awakening = project(before, awakened);
    assert.equal(awakening.kind, '武魂觉醒');
    assert.equal(awakening.title, '木制巨槌');
    assert.equal(awakening.tone, 'important');
    assert.deepEqual(awakening.highlights, ['武魂 0 → 1 个']);
    const ringed = structuredClone(awakened);
    ringed.martialSouls[0].rings.push({ years: 423, name: '第一魂环' });
    const ring = project(awakened, ringed);
    assert.equal(ring.kind, '魂环获取');
    assert.equal(ring.title, '获得一枚魂环');
    assert.deepEqual(ring.highlights, ['魂环 0 → 1 枚', '新魂环年限 423年']);
    assert.equal(project(ringed, ringed).tone, 'neutral', 'unchanged character is never awarded a second ring');
});

test('source prose never upgrades an uncommitted reward into important feedback', () => {
    const character = human(), { fields, render } = view();
    const feedback = project(character, character);
    render({ feedback, character, text: '满足条件后可能获得神位', changes: [] });
    assert.equal(fields['result-feedback'].attributes['data-tone'], 'neutral');
    assert.match(fields['result-kind'].textContent, /^命运结果/);
    assert.equal(fields['result-highlights'].hidden, true);
    assert.equal(fields['result-change-details'].hidden, true);
    render({ character: { ...character, flags: { 'formal:deferred-ending:douluo1:story:independent-ascension': true } }, text: '飞升' });
    assert.match(fields['result-summary'].textContent, /尚未形成飞升结局/);
    assert.equal(fields['result-summary'].hidden, false);
});

test('level loss remains a setback and beast cultivation stays distinct from chronological age', () => {
    const before = human(), after = { ...before, level: 9, age: 13 };
    const loss = project(before, after);
    assert.equal(loss.title, '魂力倒退 1 级');
    assert.equal(loss.tone, 'setback');
    assert.doesNotMatch(loss.title, /死亡|寿终|结束/);
    const beast = { route: 'beast', beastYears: 1000, beast: { chronologicalAge: 100 } };
    const grown = { ...beast, beastYears: 2000, beast: { chronologicalAge: 101 } };
    const feedback = project(beast, grown);
    assert.equal(feedback.title, '修为增加 1,000 年');
    const { fields, render } = view(); render({ feedback, character: grown, text: '修为成长' });
    assert.match(fields['result-kind'].textContent, /101岁/);
    assert.doesNotMatch(fields['result-kind'].textContent, /2,000岁/);
    assert.equal(project(beast, { route: 'transformed', age: 6, level: 1 }).title, '化形为人');
});

test('important rewards outrank routine growth; normal chips are bounded and complete changes stay untouched', () => {
    const before = human(); before.martialSouls = [{ name: '普通武魂', rings: [] }];
    const after = structuredClone(before);
    after.martialSouls[0].rings.push({ years: 100 }); after.level++;
    after.age++; after.wallet.copper = 20;
    assert.equal(project(before, after).kind, '魂环获取');
    const many = ['实际年龄 1 → 2', '铜灵币 1 → 2', '等级 13 → 14（+1）', '技能：无 → ' + '技能'.repeat(100)];
    const copy = [...many], result = prepareResultFeedback(before, { ...before, level: 11 }, many);
    assert.equal(result.highlights.length, 3);
    assert.ok(result.highlights.every(text => text.length <= 88));
    assert.match(result.highlights[0], /^魂力/);
    assert.deepEqual(many, copy);
});

test('reading a save, failed steps, and endings cannot show stale awarded growth', () => {
    const { fields, render } = view();
    const before = human(), after = { ...before, level: 11 };
    const feedback = project(before, after);
    render({ feedback, character: after, text: '等级+1', changes: growthChanges(before, after) });
    assert.equal(fields['result-title'].textContent, '魂力提升 1 级');
    render({ character: after, text: '等级+1' }); // Loading has no before/after commit.
    assert.match(fields['result-kind'].textContent, /^上次抽取/);
    assert.equal(fields['result-highlights'].hidden, true);
    render({ phase: 'boundary', character: after, feedback, text: '等级+1' });
    assert.equal(fields['result-title'].textContent, '本步未提交');
    assert.equal(fields['result-highlights'].children.length, 0);
    render({ phase: 'completed', character: after, ending: { title: '飞升', text: '进入神界' }, feedback });
    assert.equal(fields['result-title'].textContent, '飞升');
    assert.equal(fields['result-summary'].textContent, '进入神界');
    assert.equal(fields['result-highlights'].hidden, true);
    render();
    assert.equal(fields['result-title'].textContent, '等待抽取');
    assert.equal(fields['result-source'].hidden, true);
});
