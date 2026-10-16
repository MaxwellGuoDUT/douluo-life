import test from 'node:test';import assert from 'node:assert/strict';import {playerTraitName} from '../js/v10-player-names.js';import {growthFacts} from '../js/v10-experience.js';import {createV10Display} from '../js/v10-display.js';
test('both element trait namespaces display source stage names without mutating IDs',()=>{
 const c={route:'beast',traits:['douluo2:element.水.ultimate','douluo2:element.water.law-seed','formal:element.ice.complete-law','已有中文特质'],beast:{},martialSouls:[]};const before=structuredClone(c);
 const fields=new Proxy({}, {get:(t,k)=>t[k]??={textContent:'',replaceChildren(...items){this.items=items}}});const display=createV10Display(fields,{createElement:()=>({textContent:''})});display.renderCharacterDetails(c,'douluo2');assert.deepEqual(fields['human-talents'].items.map(x=>x.textContent),['特质：水元素 · 极致属性','特质：水元素 · 法则种子','特质：冰元素 · 完整法则','特质：已有中文特质']);assert.equal(growthFacts(c).get('特质'),'水元素 · 极致属性；水元素 · 法则种子；冰元素 · 完整法则；已有中文特质');assert.deepEqual(c,before);assert.equal(playerTraitName('unknown-owner-id'),'unknown-owner-id');
});

test('trait display aliases preserve growth metadata and changes without mutating state',()=>{
 const before={route:'human',traits:[{name:'已有中文特质',level:1,rank:2,quality:'优良'},{id:'formal:element.ice.ultimate',years:3,level:4}]};const original=structuredClone(before),after=structuredClone(before);after.traits[0].level=2;
 assert.equal(growthFacts(before).get('特质'),'已有中文特质 · 1级 · 阶2 · 优良；冰元素 · 极致属性 · 3年 · 4级');assert.notEqual(growthFacts(after).get('特质'),growthFacts(before).get('特质'));assert.deepEqual(before,original);
});
