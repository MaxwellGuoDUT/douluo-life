import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createV10RouteWheel, createV10EraWheel } from '../js/v10-route-wheel.js';
import { createV10ContentLoader } from '../js/v10-content-loader.js';
import { createV10LifeRunner } from '../js/v10-life-runner.js';
import { createV10SaveStore } from '../js/v10-save-store.js';
const root=new URL('../',import.meta.url);
const manifest=JSON.parse(fs.readFileSync(new URL('data/v10/source-manifest.json',root),'utf8'));

test('opening wheels have equal real sectors, exclude transformed and never mutate the manifest',()=>{
    const original=JSON.stringify(manifest);
    for(const pack of manifest.packs) {
        const view=createV10RouteWheel(pack);
        assert.equal(view.selectedOptionId,null);
        assert.deepEqual(view.segments.map(s=>[s.optionId,s.weight,s.percentage,s.startAngle,s.endAngle]),
            [['human',1,50,0,180],['beast',1,50,180,360]]);
        const seen=new Set();
        for(let i=0;i<100;i++) {
            const result=createV10RouteWheel(pack,'route-test-'+i);
            assert.deepEqual(result,createV10RouteWheel(pack,'route-test-'+i));
            seen.add(result.selectedOptionId);
        }
        assert.deepEqual([...seen].sort(),['beast','human']);
    }
    assert.equal(JSON.stringify(manifest),original);
    const limited={...manifest.packs[0],supportedRoutes:['beast','transformed']};
    assert.equal(createV10RouteWheel(limited,'seed').selectedOptionId,'beast');
    assert.equal(createV10RouteWheel(limited).segments[0].percentage,100);
    assert.throws(()=>createV10RouteWheel({...limited,supportedRoutes:['transformed']}),{code:'ROUTE_WHEEL_UNAVAILABLE'});
});

globalThis.document ??= {createElement(){return {relList:{supports:()=>true},addEventListener(n,f){if(n==='load')queueMicrotask(f)},setAttribute(){}}},getElementsByTagName:()=>[],querySelector:()=>null,querySelectorAll:()=>[],head:{appendChild(){}}};
globalThis.window ??= {dispatchEvent:()=>true};
const loader=createV10ContentLoader({moduleBaseUrl:root.href,fetchImpl:async p=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(new URL(p,root),'utf8'))})});
const factory=createV10LifeRunner({contentLoader:loader});
const slots=new Map();
const saves=createV10SaveStore({contentLoader:loader,runner:factory,storage:()=>({getItem:k=>slots.get(k)??null,setItem:(k,v)=>slots.set(k,v)})});
test('four drawn openings match explicit baseline RNG/history, strict export recovery and next step',async()=>{
    for(const pack of manifest.packs)for(const route of ['human','beast']) {
        let seed;
        for(let i=0;i<100;i++)if(createV10EraWheel(manifest.packs,'route-journey-'+i).selectedOptionId===pack.id && createV10RouteWheel(pack,'route-journey-'+i).selectedOptionId===route){seed='route-journey-'+i;break;}
        assert.ok(seed);
        const era=createV10EraWheel(manifest.packs,seed).selectedOptionId;
        const drawn=await factory.start(era,{seed,route:createV10RouteWheel(pack,seed).selectedOptionId});
        const baseline=await factory.start(pack.id,{seed,route});
        assert.deepEqual(drawn.exportSnapshot(),baseline.exportSnapshot());
        assert.equal(drawn.session.random.cursor,0);
        assert.equal(drawn.session.history.length,0);
        for(let i=0;i<4;i++){assert.deepEqual(drawn.step(),baseline.step());assert.deepEqual(drawn.exportSnapshot(),baseline.exportSnapshot());}
        const text=await saves.serialize(drawn);
        await saves.write(1,text,{expected:saves.raw(1),overwrite:saves.raw(1)!==null});
        const restored=await saves.read(1);
        assert.equal(await saves.serialize(restored),text);
        assert.deepEqual(restored.step(),drawn.step());
        assert.deepEqual(restored.exportSnapshot(),drawn.exportSnapshot());
    }
});

test('era wheel draws both available packs reproducibly and never offers a manual era choice',()=>{
    const preview=createV10EraWheel(manifest.packs);
    assert.deepEqual(preview.segments.map(s=>[s.optionId,s.percentage]),[['douluo1',50],['douluo2',50]]);
    const seen=new Set();
    for(let i=0;i<100;i++) {
        const a=createV10EraWheel(manifest.packs,'era-'+i);
        assert.deepEqual(a,createV10EraWheel(manifest.packs,'era-'+i));seen.add(a.selectedOptionId);
    }
    assert.equal(seen.size,2);
    assert.equal(createV10EraWheel([manifest.packs[1]],'seed').selectedOptionId,'douluo2');
    assert.throws(()=>createV10EraWheel([]),{code:'ERA_WHEEL_UNAVAILABLE'});
    const app=fs.readFileSync(new URL('js/v10-app.js',root),'utf8');
    assert.doesNotMatch(app,/dataset\.packId|startLife\(null, pack\.id/);
    assert.match(app,/startLife\(null, null, \{ openingWheel \}\)/);
});
