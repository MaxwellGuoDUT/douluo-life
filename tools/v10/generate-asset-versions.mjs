import fs from 'node:fs/promises';
import {assetDigests} from './asset-digests.mjs';
const root=new URL('../../',import.meta.url);
async function files(dir){const list=[];for(const e of await fs.readdir(new URL(dir+'/',root),{withFileTypes:true})){const p=dir+'/'+e.name;if(e.isDirectory())list.push(...await files(p));else if(/\.(js|json|css)$/u.test(p))list.push(p);}return list;}
const paths=[...await files('js'),...await files('data'), 'css/v10.css'].sort();const assets={},imports={},integrity={};
for(const p of paths){const bytes=await fs.readFile(new URL(p,root)),digests=assetDigests(p,bytes),version=digests.version,sri=digests.integrity;assets[p]=digests;if(p.endsWith('.js')){imports['./'+p]='./'+p+'?v='+version;integrity['./'+p+'?v='+version]=sri;integrity['./'+p]=sri;}}
const htmlPath=new URL('index.html',root),old=await fs.readFile(htmlPath,'utf8');
let html=old.replace(/\s*<!-- V10-ASSETS-BEGIN -->[\s\S]*?<!-- V10-ASSETS-END -->/u,'');
const sourceStyle='data/v10/source-runtime/App-B4anXMNi.css';
const style='<link id="v10-source-style" rel="stylesheet" href="'+sourceStyle+'" integrity="'+assets[sourceStyle].integrity+'" onerror="this.dataset.failed=&#39;true&#39;">';
const block='\n    <!-- V10-ASSETS-BEGIN -->\n    '+style+'\n    <script type="importmap">'+JSON.stringify({imports,integrity})+'</script>\n    <script type="application/json" id="v10-assets">'+JSON.stringify(assets)+'</script>\n    <!-- V10-ASSETS-END -->';
html=html.replace(/<link rel="stylesheet" href="css\/v10\.css[^"]*"(?: integrity="[^"]*")?>/u,`<link rel="stylesheet" href="css/v10.css?v=${assets['css/v10.css'].version}" integrity="${assets['css/v10.css'].integrity}">`);
html=html.replace('</head>',block+'\n</head>');
const entry=`<script id="v10-entry-bootstrap">(()=>{const status=document.getElementById('v10-status');const stop=()=>{status.textContent='资源版本不一致或加载失败，已停止启动。原槽位保留；请重新打开页面后备份原始存档。';status.dataset.tone='error';};if(!HTMLScriptElement.supports?.('importmap')){status.textContent='浏览器不支持资源版本绑定，请使用支持 import maps 的新版浏览器。原槽位保留。';return;}const script=document.createElement('script');script.type='module';script.src='js/v10-app.js?v=${assets['js/v10-app.js'].version}';script.integrity='${assets['js/v10-app.js'].integrity}';script.onerror=stop;const start=()=>document.body.appendChild(script);const style=document.getElementById('v10-source-style');if(style.dataset.failed==='true'){stop();return;}if(style.sheet){start();return;}style.addEventListener('load',start,{once:true});style.addEventListener('error',stop,{once:true});})();</script>`;
html=html.replace(/<script (?:type="module" src="js\/v10-app\.js[^"]*"[^>]*|id="v10-entry-bootstrap")[\s\S]*?<\/script>/u,entry);
if(process.argv.includes('--check')){if(html!==old)throw Error('HTML asset versions are stale; run npm run generate:v10-assets');console.log('Asset URL hashes and integrity match all local JS, JSON and CSS.');}else await fs.writeFile(htmlPath,html);
