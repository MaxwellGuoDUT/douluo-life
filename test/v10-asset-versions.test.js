import test from 'node:test';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';import {createAssetFetch} from '../js/v10-asset-fetch.js';
test('page-pinned fetch retains the build hash and integrity at a project subpath',async()=>{const seen=[];const wrapped=createAssetFetch(async(...a)=>{seen.push(a);return {ok:true}},{baseUrl:'https://example.test/game/index.html',assets:{'data/test.json':{version:'abc123',integrity:'sha384-evidence'}}});await wrapped('./data/test.json',{cache:'no-cache'});assert.deepEqual(seen,[['https://example.test/game/data/test.json?v=abc123',{cache:'no-cache',integrity:'sha384-evidence'}]]);});
test('unregistered and external data cannot silently enter a page version',()=>{let called=false;const fetch=createAssetFetch(()=>{called=true},{baseUrl:'https://example.test/game/',assets:{}});assert.throws(()=>fetch('../other.json'),{code:'ASSET_VERSION_UNKNOWN'});assert.throws(()=>fetch('https://other.test/data.json'),{code:'ASSET_VERSION_UNKNOWN'});assert.equal(called,false);});
test('Node and injected loaders retain their explicit fetch without a page manifest',()=>{const fetch=()=>{};assert.equal(createAssetFetch(fetch),fetch);});
test('committed HTML version pins and SRI match every current asset',()=>{const result=execFileSync(process.execPath,['tools/v10/generate-asset-versions.mjs','--check'],{cwd:new URL('../',import.meta.url),encoding:'utf8'});assert.match(result,/integrity match/);});

test('asset generation rejects Windows line-ending drift and preserves raw source-module bytes',async()=>{
 const {assetDigests}=await import('../tools/v10/asset-digests.mjs');const {createHash}=await import('node:crypto');const lf=Buffer.from('export default 1;\n'),crlf=Buffer.from('export default 1;\r\n');
 assert.throws(()=>assetDigests('js/example.js',crlf),/must use LF/);assert.throws(()=>assetDigests('data/example.json',Buffer.from('{}\r\n')),/must use LF/);
 const raw=assetDigests('data/v10/source-runtime/example.js',crlf);assert.equal(raw.version,createHash('sha256').update(crlf).digest('hex').slice(0,20));assert.notEqual(raw.version,assetDigests('js/example.js',lf).version);
});

test('source preload URLs have integrity metadata and legacy source CSS is predeclared with SRI',async()=>{
 const fs=await import('node:fs/promises');const html=await fs.readFile(new URL('../index.html',import.meta.url),'utf8');const map=JSON.parse(/type="importmap">([\s\S]*?)<\/script>/u.exec(html)[1]);const assets=JSON.parse(/id="v10-assets">([\s\S]*?)<\/script>/u.exec(html)[1]);
 for(const [path,asset]of Object.entries(assets).filter(([p])=>p.endsWith('.js')))assert.equal(map.integrity['./'+path],asset.integrity);
 assert.ok(html.includes('id="v10-source-style" rel="stylesheet" href="data/v10/source-runtime/App-B4anXMNi.css" integrity="'+assets['data/v10/source-runtime/App-B4anXMNi.css'].integrity+'"'));assert.match(html,/style\.addEventListener\('error',stop/);
});
