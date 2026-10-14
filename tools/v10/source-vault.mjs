import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

// Local checkout first, then the primary checkout's sibling for managed worktrees.
// Explicit configuration never falls back, so a typo remains a failing check.
export function resolveSourceVault({ root = process.cwd(), configured = process.env.DOULUO_SOURCE_VAULT,
    gitCommonDir } = {}) {
    if (configured !== undefined && configured !== '') return { path: path.resolve(root, configured), explicit: true };
    const sibling = repo => path.join(path.dirname(repo), 'douluo-life-source-vault', '5ba6453', 'apk-analysis', 'E4FB340E');
    const local = sibling(root);
    if (fs.existsSync(local)) return { path: local, explicit: false };
    if (gitCommonDir === undefined) {
        const result = spawnSync('git', ['rev-parse', '--path-format=absolute', '--git-common-dir'], { cwd: root, encoding: 'utf8' });
        gitCommonDir = result.status === 0 ? result.stdout.trim() : null;
    }
    const primary = gitCommonDir && path.basename(gitCommonDir) === '.git' ? sibling(path.dirname(gitCommonDir)) : null;
    return { path: primary && fs.existsSync(primary) ? primary : local, explicit: false };
}
