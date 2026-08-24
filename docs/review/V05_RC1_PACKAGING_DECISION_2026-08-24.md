# V0.5 RC1 Packaging Decision

状态：`owner-confirmed archive 2R / implementation complete / focused and full automated validation passed / Git delivery not authorized`

日期：2026-08-24

## 决策

采用 PR 方案 B：以 `main@c7d2978` 为基线建立 focused V0.5 RC1 变更，不继续把 RC1 混入 PR #4 的大范围 Draft。RC runtime package 只包含 `douluo1` shard 与四类运行证据，并由专用 entry/index/policy 描述。

## Runtime 闭包

- entry：`data/v05-rc/production-entry.json`
- index：`data/v05-rc/package-index.json`
- policy：`data/v05-rc/package-policy.json`
- route：`data/apk-canonical/catalogs/route-graph.douluo1.json`
- evidence：formal special result、human soul ring、human soul ring species、combat power
- build-only：martial-soul runtime evidence

runtime 明确排除 monolith `route-graph.json`、`douluo2` shard、`options.json`、全量 catalogs 与三个 archive preservation 文件。loader 使用 `catalogNames: []` 与 `routePackId=douluo1`；找不到已列出的 pack 时必须 typed fail，不猜测路径。

## Archive option 2R

`data/v2/archive/apk-replaced-2026-08-16/manifest.json` 为 archive-only manifest。其 `archivedAt=2026-08-16` 表示三个旧 production 文件因负责人授权的 APK migration 被替代、转入 archive-only 状态的日期；`reason` 精确记录该替代原因，不表示文件在 Day19 被删除或重新生成。2R 保留 `originalPath` 记录，并用独立 `archivePath` 保存原字节。

manifest 所列映射为：

- `data/v2/catalogs/martial-souls.json` → `data/v2/archive/apk-replaced-2026-08-16/catalogs/martial-souls.json`
- `data/v2/config/awakening-probabilities.json` → `data/v2/archive/apk-replaced-2026-08-16/config/awakening-probabilities.json`
- `data/v2/content/age-6-awakening.json` → `data/v2/archive/apk-replaced-2026-08-16/content/age-6-awakening.json`

三个 archivePath 实体保留 e17ec72 原始字节与 SHA-256；活跃 originalPath 恢复 `main@c7d2978` 状态。归档实体仅用于可追溯性和回滚保全，不得成为 V0.5 runtime 请求。生成器同时验证 manifest 语义、路径映射与三者哈希。

## 发布边界

V0.5 RC1 只声明 `douluo1` 0～25 岁 presentation boundary、默认 seed 自动化锁定和明确 typed boundaries。它不声明完整人生、25 岁后路线、`douluo2` 可玩、save/load 或所有 APK 动态 handler 已完成。

文件实现不等于 Git/PR/Pages 交付。stage、commit、push、创建 focused PR、Ready、merge 和公开发布继续使用独立授权门。

## 验证结论

方案 2 的历史结果为 focused 83/83、完整 155/175；20 个失败来自活跃原路径被 e17 文件覆盖。负责人选择 2R 后，重新验证为 focused 83/83、完整 175/175，generator write/check 均通过。2R 在不增加第 48 路径的前提下闭合了 archive preservation 与 V2 基线兼容性。
