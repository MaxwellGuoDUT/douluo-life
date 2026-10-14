import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { resolveSourceVault } from '../tools/v10/source-vault.mjs';

test('vault lookup: local sibling wins, worktree uses common checkout, explicit errors do not fall back', t => {
    const base = path.resolve('fixture-vault-parent'), root = path.join(base, 'worktrees', 'feature', 'game');
    const primaryRepo = path.join(base, 'primary', 'game');
    const suffix = path.join('douluo-life-source-vault', '5ba6453', 'apk-analysis', 'E4FB340E');
    const local = path.join(path.dirname(root), suffix), primary = path.join(path.dirname(primaryRepo), suffix);
    const present = new Set([primary]);
    t.mock.method(fs, 'existsSync', p => present.has(p));
    const options = { root, configured: '', gitCommonDir: path.join(primaryRepo, '.git') };
    assert.deepEqual(resolveSourceVault(options), { path: primary, explicit: false });
    present.add(local);
    assert.deepEqual(resolveSourceVault(options), { path: local, explicit: false });
    assert.deepEqual(resolveSourceVault({ ...options, configured: 'bad-path' }), { path: path.join(root, 'bad-path'), explicit: true });
    present.clear();
    assert.deepEqual(resolveSourceVault(options), { path: local, explicit: false });
    assert.deepEqual(resolveSourceVault({ ...options, gitCommonDir: null }), { path: local, explicit: false });
});

test('missing --vault argument and an explicit nonexistent vault fail instead of silently skipping', () => {
    for (const tool of ['generate-source-inventory.mjs', 'generate-god-trial.mjs']) {
        for (const args of [['--check','--vault'], ['--check','--vault','fixture-nonexistent-source-vault']]) {
            const result = spawnSync(process.execPath, ['tools/v10/' + tool, ...args], { encoding: 'utf8' });
            assert.notEqual(result.status, 0);
            assert.match(result.stderr, /requires a path|ENOENT|缺少|不存在|source/i);
        }
    }
});
