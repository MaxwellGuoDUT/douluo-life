"""Prepare local V1.1.1 archives from HEAD plus an explicit allowlist. Never stage or publish."""
from pathlib import Path
import hashlib, io, json, subprocess, zipfile

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'docs/evidence/v111-pre-release-20261015'
STAGING = ROOT / '.codex-tmp/v111-package-20261015'
EXPECTED_HEAD = '27fe3f505e4103b6d413b28909aa030f3f72d89e'
OWNER = 'docs/evidence/V10_ASCENSION_CLOSURE_2026-09-30.md'

def git(*args):
    return subprocess.check_output(['git', *args], cwd=ROOT)

def digest(data):
    return hashlib.sha256(data).hexdigest()

def safe_path(name):
    p = (ROOT / name).resolve()
    if not p.is_relative_to(ROOT) or name.startswith('/') or '\\' in name or '..' in Path(name).parts:
        raise ValueError(f'Unsafe candidate path: {name}')
    return p

def archive(name, entries):
    target = OUT / 'artifacts' / name
    target.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(target, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for path, data in sorted(entries.items()):
            info = zipfile.ZipInfo(path, date_time=(2026, 10, 15, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            z.writestr(info, data, compresslevel=9)
    with zipfile.ZipFile(target) as z:
        assert sorted(z.namelist()) == sorted(entries)
        assert z.testzip() is None
        for p, data in entries.items():
            assert z.read(p) == data, p
    return {'file': name, 'files': len(entries), 'bytes': target.stat().st_size, 'sha256': digest(target.read_bytes())}

def main():
    assert git('rev-parse', 'HEAD').decode().strip() == EXPECTED_HEAD
    assert not git('diff', '--cached', '--name-only').strip(), 'Staging area must remain empty'
    baseline = json.loads((ROOT/'docs/evidence/post-v110-20261014/code-manifest.json').read_text(encoding='utf-8'))
    paths = [f['path'] for f in baseline['files']]
    paths += ['.gitattributes', 'tools/v10/asset-digests.mjs', 'tools/v10/prepare-v111-package.py', 'README.MD', 'CHANGELOG.md', 'docs/README.md', 'docs/V1.1.1_RELEASE_NOTES.md']
    paths += [str(p.relative_to(ROOT)).replace('\\', '/') for p in sorted((ROOT/'docs/evidence/post-v110-20261014').iterdir()) if p.is_file()]
    review_inputs = ['REVIEW.md', 'PR_DRAFT.md', 'DEPLOYMENT_RUNBOOK.md', 'COMPATIBILITY.md', 'baseline-integrity.json', 'line-ending-reproduction.json', 'git-byte-consistency.json', 'independent-checks.json', 'source-check.log', 'remote-main.json', 'remote-tag.json', 'remote-runs.json', 'clean-suite.log', 'clean-validation.json', 'package-browser.json', 'package-browser.png', 'final-integrity.json']
    paths += ['docs/evidence/v111-pre-release-20261015/'+n for n in review_inputs if (OUT/n).is_file()]
    paths = sorted(set(paths))
    assert OWNER not in paths
    candidates = {p: safe_path(p).read_bytes() for p in paths}
    path_receipt = 'docs/evidence/v111-pre-release-20261015/candidate-paths.txt'
    file_receipt = 'docs/evidence/v111-pre-release-20261015/candidate-files.json'
    paths = sorted(paths + [path_receipt, file_receipt])
    candidates[path_receipt] = ('\n'.join(paths)+'\n').encode('utf-8')
    # The file receipt excludes only itself; the outer package manifest hashes it.
    receipt_entries = [{'path': p, 'bytes': len(b), 'sha256': digest(b)} for p, b in sorted(candidates.items())]
    candidates[file_receipt] = (json.dumps(receipt_entries,ensure_ascii=False,indent=2)+'\n').encode('utf-8')
    # git archive otherwise applies this Windows host's core.autocrlf conversion.
    packed = git('-c', 'core.autocrlf=false', 'archive', '--format=zip', EXPECTED_HEAD)
    with zipfile.ZipFile(io.BytesIO(packed)) as z:
        source = {p: z.read(p) for p in z.namelist() if not p.endswith('/')}
    owner_baseline = source[OWNER]
    source.update(candidates)
    assert source[OWNER] == owner_baseline
    assert STAGING.resolve().is_relative_to((ROOT/'.codex-tmp').resolve())
    if STAGING.exists():
        existing = {str(p.relative_to(STAGING)).replace('\\','/') for p in STAGING.rglob('*') if p.is_file()}
        assert existing <= source.keys(), 'Unexpected file in clean staging; refuse to sweep or remove it'
    for p, data in source.items():
        target = STAGING/p
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)
    html = source['index.html'].decode('utf-8')
    import re
    assets = json.loads(re.search(r'id="v10-assets">(.*?)</script>', html, re.S).group(1))
    runtime_paths = ['index.html', 'v10.html'] + list(assets)
    runtime = {p: source[p] for p in runtime_paths}
    for p, a in assets.items():
        assert digest(runtime[p])[:20] == a['version'], p
    evidence = {p: b for p, b in candidates.items() if p.startswith('docs/') or p in ['README.MD', 'CHANGELOG.md']}
    artifacts = [archive('V1.1.1-source-candidate.zip', source), archive('V1.1.1-static-candidate.zip', runtime), archive('V1.1.1-evidence.zip', evidence)]
    manifest = {'version': '1.1.1', 'status': 'local-unpublished-candidate', 'baseHead': EXPECTED_HEAD, 'baseTree': git('rev-parse','HEAD^{tree}').decode().strip(), 'staging': str(STAGING), 'artifacts': artifacts, 'candidateFiles': [{'path': p, 'bytes': len(b), 'sha256': digest(b)} for p, b in sorted(candidates.items())], 'runtimeFiles': [{'path': p, 'bytes': len(b), 'sha256': digest(b)} for p, b in sorted(runtime.items())], 'ownerWorkingDiffExcluded': True, 'naturalSearchNotRun': True, 'notExecuted': ['git add','commit','push','merge','tag','Release','deploy'], 'note': 'ZIP archives and the outer package manifest stay local. Path and file receipts are included in the whitelist; the file receipt excludes only its own hash. ZIP timestamps are fixed for byte-reproducible rebuilds.'}
    (OUT/'package-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
    (OUT/'candidate-paths.txt').write_bytes(candidates[path_receipt])
    (OUT/'candidate-files.json').write_bytes(candidates[file_receipt])
    print(json.dumps({'candidateFiles':len(paths),'sourceFiles':len(source),'runtimeFiles':len(runtime),'artifacts':artifacts},ensure_ascii=False))

if __name__ == '__main__':
    main()
