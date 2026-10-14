import test from 'node:test';
import assert from 'node:assert/strict';
import {growthChanges,nextGoal,endingText,problemInfo} from '../js/v10-experience.js';
import {eventCategory,lifeReview,createV10HistoryView} from '../js/v10-history-view.js';
import {createV10Display} from '../js/v10-display.js';
import {SEA_GOD_STAGES} from '../js/v10-sea-god-runtime.js';
test('changes are based on committed data, preserve zero, route, rings, bones and ability upgrades',()=>{
 const before={route:'human',age:10,level:9,wallet:{copper:0},martialSouls:[{name:'蓝银草',rings:[]}],soulBones:[],skills:[{name:'锻造术',level:1}]};
 const after=structuredClone(before);after.level=10;after.age=11;after.wallet.copper=20;after.martialSouls[0].rings.push({years:423});after.soulBones.push({name:'左臂骨',years:1000});after.skills[0].level=2;
 const original=structuredClone(before),next=structuredClone(after),changes=growthChanges(before,after).join('\n');
 assert.match(changes,/等级 9 → 10（\+1）/);assert.match(changes,/铜灵币 0 → 20/);assert.match(changes,/423年/);assert.match(changes,/左臂骨/);assert.match(changes,/2级/);
 assert.deepEqual(before,original);assert.deepEqual(after,next);assert.deepEqual(growthChanges(after,after),[]);
 const beast={route:'beast',beastYears:100000,beast:{chronologicalAge:200,attributeStages:{fire:1}}};
 assert.match(growthChanges(beast,{...beast,beastYears:110000,beast:{...beast.beast,chronologicalAge:210}}).join('\n'),/实际年龄 200 → 210/);
 assert.match(growthChanges(beast,{route:'transformed',age:6,level:1}).join('\n'),/路线：魂兽 → 化形后人类/);
 assert.match(growthChanges({route:'human'},{route:'human',level:0}).join('\n'),/等级：来源未记录 → 0/);
 const sea={route:'human',appearanceRank:3,seaTrial:{tier:'yellow',status:'active',claimedRewardStages:[],totalStages:4}};
 const rewarded=structuredClone(sea);rewarded.appearanceRank++;rewarded.seaTrial.claimedRewardStages.push(1);
 assert.match(growthChanges(sea,rewarded).join('\n'),/容貌等级 3 → 4/);assert.match(growthChanges(sea,rewarded).join('\n'),/已领取0\/4考奖励 → 黄级 · 考核中 · 已领取1\/4/);
});
test('history categories reject prose guesses and pagination/search retain the complete history',()=>{
 const node=()=>({value:'',listeners:{},addEventListener(n,f){this.listeners[n]=f},replaceChildren(...c){this.children=c;this.renders=(this.renders??0)+1}});
 const timeline=Array.from({length:220},(_,i)=>({kind:'result',poolId:'p',optionId:String(i),text:`事件${i} ${i%2?'危险':'成长'}`}));
 const history=timeline.map((e,i)=>({poolId:e.poolId,optionId:e.optionId,effects:i%2?[{type:'conditional',effects:[{type:'death'}]}]:[{type:'changeLevel'}]}));
 const original=structuredClone({timeline,history}),list=node(),older=node(),newer=node(),latest=node(),status=node(),filter=node(),search=node();filter.value='all';
 assert.equal(eventCategory(timeline[1],history[1]),'result');assert.equal(eventCategory(timeline[0],history[0]),'growth');
 assert.equal(eventCategory({kind:'dynamic'},history[0]),'dynamic');
 const view=createV10HistoryView({list,older,newer,latest,status,filter,search,getTimeline:()=>timeline,getHistory:()=>history,document:{createElement:node}});
 view.render();const renders=list.renders;view.render();assert.equal(list.renders,renders,'no redundant DOM replacement');
 filter.value='growth';filter.listeners.change();assert.equal(list.children.length,50);assert.match(status.textContent,/匹配 110 \/ 完整 220/);
 older.listeners.click();assert.equal(list.children[0].textContent,timeline[20].text);
 search.value='事件20 成长';search.listeners.input();assert.equal(list.children.length,1);assert.equal(list.children[0].textContent,timeline[20].text);
 search.value='不存在';search.listeners.input();assert.equal(list.children.length,0);
 view.reset();view.render();assert.equal(filter.value,'all');assert.equal(search.value,'');assert.equal(list.children.at(-1).textContent,timeline.at(-1).text);
 assert.deepEqual({timeline,history},original);assert.match(lifeReview(timeline,history),/尚无可可靠提取/);
});
test('system notes do not shift result categories; committed Sea stages filter and review without prose guesses',()=>{
 const node=()=>({value:'',listeners:{},addEventListener(n,f){this.listeners[n]=f},replaceChildren(...c){this.children=c}});
 const first=SEA_GOD_STAGES[0],last=SEA_GOD_STAGES[8];
 const history=[{poolId:'growth',optionId:'g',effects:[{type:'changeLevel'}]},
     {poolId:first.poolId,optionId:first.id,effects:[]},{poolId:last.poolId,optionId:last.id,effects:[]},
     {poolId:'growth',optionId:'g',effects:[{type:'changeLevel'}]},
     {poolId:'other',optionId:'prose',effects:[]}];
 const results=history.map((r,i)=>({kind:'result',poolId:r.poolId,optionId:r.optionId,text:['前次成长','第一考实领奖励','继承海神实领奖励','后次成长','条件文案：可能继承海神'][i]}));
 const timeline=[{kind:'system',text:'开局说明'},results[0],{kind:'system',text:'海神资格即开始'},results[1],results[2],{kind:'system',text:'继续人生'},results[3],results[4]];
 const before=structuredClone({timeline,history}),list=node(),filter=node(),search=node(),status=node();filter.value='finale';
 const view=createV10HistoryView({list,filter,search,status,older:node(),newer:node(),latest:node(),getTimeline:()=>timeline,getHistory:()=>history,document:{createElement:node}});
 view.render();assert.deepEqual(list.children.map(n=>n.textContent),[results[1].text,results[2].text]);
 filter.value='growth';filter.listeners.change();assert.deepEqual(list.children.map(n=>n.textContent),[results[0].text,results[3].text]);
 assert.match(lifeReview(timeline,history),/继承海神实领奖励/);
 assert.equal(eventCategory(results[4],history[4]),'result');
 assert.equal(eventCategory(results[1],{...history[1],poolId:'unrelated'}),'result');
 view.reset();view.render();assert.equal(list.children.length,timeline.length);assert.deepEqual({timeline,history},before);
});

test('goals distinguish missing source, recorded requirements, and unsupported runtime',()=>{
 const node=()=>({textContent:'',replaceChildren(){},style:{},setAttribute(){}}),fields=new Proxy({}, {get:(t,k)=>t[k]??=node()});
 const display=createV10Display(fields,{createElement:node});
 const c={route:'human',level:70,soulBones:[{partId:'head'}],godTrial:{tier:'二级',status:'active',currentStage:1,totalStages:8}};
 const progress=display.godTrialProgress(c,'douluo1');assert.match(progress,/需/);assert.match(progress,/还缺躯干骨/);assert.doesNotMatch(progress,/还缺头骨/);
 assert.match(nextGoal(c,'douluo1','ready',progress),/当前70级/);assert.match(nextGoal({route:'beast'},'douluo2','ready'),/来源未记录/);
 assert.match(nextGoal(c,'douluo1','boundary',progress),/运行时暂不支持/);
 c.soulBones.push({name:'来源中的魂骨但未记录部位'});assert.match(display.godTrialProgress(c,'douluo1'),/来源未记录/);
});
test('real ending metadata and limited diagnostics do not invent death or upload a save',()=>{
 const life={seed:'fixed',phase:'boundary',error:{code:'MISSING_SOURCE',message:'暂未支持'},session:{packId:'douluo1',history:[],character:{route:'human',age:75,level:99,godhood:{name:'神位'}},timeline:Array.from({length:30},(_,i)=>({kind:'result',text:String(i)+'x'.repeat(400)}))}};
 assert.match(endingText(life),/未判定死亡/);assert.match(nextGoal(life.session.character,'douluo1','ready'),/人生仍在继续/);
 const info=JSON.parse(problemInfo(life));assert.equal(info.recent.length,5);assert.equal(info.recent[0].text.length,240);assert.equal(info.seed,'fixed');assert.equal(info.code,'MISSING_SOURCE');assert.equal(info.snapshot,undefined);
 assert.deepEqual(Object.keys(info),['version','pack','route','seed','phase','flow','pool','code','recent']);
 life.phase='completed';life.session.character.ending={id:'douluo1:v10-human-natural-lifespan',kind:'death',text:'寿数已尽'};assert.match(endingText(life),/^寿终/);
 life.session.character.ending={title:'飞升',text:'进入神界'};assert.match(endingText(life),/^飞升/);
});
