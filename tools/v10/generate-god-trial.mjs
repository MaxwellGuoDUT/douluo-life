import fs from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { resolveSourceVault } from './source-vault.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const args = process.argv.slice(2);
const i = args.indexOf('--vault');
if (args.some((arg, at) => !['--check', '--vault'].includes(arg) && !(i >= 0 && at === i + 1))) throw new Error('Unknown argument');
if (i >= 0 && (!args[i + 1] || args[i + 1].startsWith('--'))) throw new Error('--vault requires a path');
const vault = resolveSourceVault({ root, configured: i >= 0 ? args[i + 1] : process.env.DOULUO_SOURCE_VAULT }).path;
const file = pathToFileURL(path.join(vault, 'derived', 'pretty', 'douluo1-pack-C6xEgEus.js'));
globalThis.document ??= { createElement: () => ({ relList: { supports: () => true }, addEventListener(n, f) { if (n === 'load') queueMicrotask(f); }, setAttribute() {} }),
    getElementsByTagName: () => [], querySelector: () => null, querySelectorAll: () => [], head: { appendChild() {} } };
globalThis.window ??= { dispatchEvent() {} };
let source = await fs.readFile(file, 'utf8');
source = source.replace(/(["'])(\.\/[^"'\n]+\.js)\1/g, (_, q, p) => JSON.stringify(new URL(p, file).href));
source += '\nexport const extractedTrials={stages:Bt,pools:af,seaStages:qd,seaPools:pc.slice(0,qd.length+3),seaFlows:Object.values(Ec).filter(f=>f.id.startsWith("humanSeaTrial")&&f.id!=="humanSeaTrialContinue")};';
const data = (await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'))).extractedTrials;
const stages = data.stages.map(({ tier, stage, poolId, stepId, minLevel, final, expectedOptionIds }) =>
    ({ tier, stage, poolId, stepId, minLevel, final, expectedOptionIds }));
if (JSON.stringify(Object.fromEntries(['三级','二级','一级','神王'].map(tier => [tier, stages.filter(s => s.tier === tier).length]))) !== JSON.stringify({三级:7,二级:8,一级:9,神王:9})) throw new Error('Source trial inventory changed');
const text = '// Generated from the original douluo1 Bt / af builders; do not edit.\n'
    + 'export const V10_GOD_TRIAL_STAGES = Object.freeze(' + JSON.stringify(stages, null, 2) + ');\n'
    + 'export const V10_GOD_TRIAL_POOLS = Object.freeze([\n' + data.pools.map(pool => JSON.stringify(pool)).join(',\n') + '\n]);\n';
const output = new URL('../../js/v10-god-trial-data.js', import.meta.url);
if (args.includes('--check')) {
    if ((await fs.readFile(output, 'utf8')).replaceAll('\r\n', '\n') !== text) throw new Error('God trial data differs from source');
} else await fs.writeFile(output, text);
console.log(JSON.stringify({ sourceMatch: true, stages: stages.length, pools: data.pools.length, mode: args.includes('--check') ? 'check' : 'generate' }));
if (JSON.stringify(['yellow','purple','black','top'].map(tier=>data.seaStages.filter(s=>s.tier===tier).length)) !== '[4,5,6,8]') throw new Error('Source sea trial inventory changed');
const seaText='// Generated from original douluo1 qd / pc / Ec builders; do not edit.\n'
    + 'export const V10_SEA_TRIAL_STAGES = Object.freeze('+JSON.stringify(data.seaStages,null,2)+');\n'
    + 'export const V10_SEA_TRIAL_POOLS = Object.freeze([\n'+data.seaPools.map(p=>JSON.stringify(p)).join(',\n')+'\n]);\n'
    + 'export const V10_SEA_TRIAL_FLOWS = Object.freeze('+JSON.stringify(data.seaFlows,null,2)+');\n';
const seaOutput=new URL('../../js/v10-sea-trial-data.js',import.meta.url);
if(args.includes('--check')) {
    if((await fs.readFile(seaOutput,'utf8')).replaceAll('\r\n','\n')!==seaText) throw new Error('Sea trial data differs from source');
} else await fs.writeFile(seaOutput,seaText);
console.log(JSON.stringify({sourceMatch:true,seaStages:data.seaStages.length,seaPools:data.seaPools.length,seaFlows:data.seaFlows.length}));
