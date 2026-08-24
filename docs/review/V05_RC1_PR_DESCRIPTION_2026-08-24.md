# V0.5 RC1 focused PR 状态记录

> Draft PR [#5](https://github.com/MaxwellGuoDUT/douluo-life/pull/5)：`main@c7d2978 ← codex/v05-rc1@e98bf8a`。远端 body 已按当前证据创建；本文件继续记录 Ready 前状态，不授权修改 PR、转 Ready、merge 或 Pages。

## Summary

- 新增独立 `v05-demo.html`，提供 `douluo1` 0～25 岁 RC1 展示边界，不替换 `main` 上已有 V1/V2 入口。
- 使用 RC 专用 `data/v05-rc/production-entry.json`、package index 和 policy；页面只加载 `douluo1` shard 与四类 runtime evidence。
- 复用来源可追溯的 APK runtime，并保持 `APK_ROUTE_DYNAMIC_OPTION_UNRESOLVED` 与 `APK_COMBAT_POWER_UNCOVERED_STATE` typed stop，不猜测未闭合语义。
- archive 采用 option 2R：manifest 保留三个 `originalPath`，e17ec72 原字节实体存放于对应 `archivePath`；活跃路径保持 main 基线，归档实体不进入 runtime 请求面。
- generator 是三个 RC JSON 的唯一写入来源；测试校验生成器 freshness、SHA-256、shard-only 闭包、archive 语义与 runtime exclusion。

## Product boundary

- public pack：`douluo1`
- endpoint：精确 25 岁完整 commit 后停止
- default seed：`apk-route-demo-seed`
- transcript：100 项，SHA-256 `967347b48f6680be71b1f33d18c52f392519afd4c7afb5255beae20a74531391`
- custom seed：允许在未接 handler 处 typed boundary，失败项不提交

不包含 `douluo2` 可玩性、25 岁后内容、新 handler、save/load、V1/V2/V3 重构、monolith/全目录 package、APK 原文件、owner Office/task/output 材料或 Pages 配置变更。

## Validation

- 方案 2 历史验证：generator check 与 focused 83/83 通过；完整回归 155/175，20 个旧 V2 失败。
- 方案 2R 通过 archivePath 迁移消除对活跃 V2 原路径的覆盖；generator write/check 通过，focused tests 83/83，完整 `npm.cmd test` 175/175。
- 变更路径终审为 47/47；`main@c7d2978..e98bf8a` 提交级 whitespace check 通过。
- 当前 focused checkout 的真实浏览器 RC 已通过：默认 seed 到25岁、shard-only Network、console、完成锁、刷新与390×844窄屏均合格。
- GitHub 没有 `e98bf8a` 的 Actions run，仓库没有提交级 CI workflow 或 required checks；CI 为 `unavailable / not configured`，不是 passed。
- PR review 为 `unavailable`：0 reviews、0 comments、0 review requests。Pages 仍发布 `main@c7d2978`，V0.5 公开页面未部署或验收。
- focused checkout 只包含 V1、V2 与 V0.5 HTML；V3、临时魂环 Demo 和 APK Route Demo 留在 PR #4/原混合工作树，属于 focused 拓扑排除。

## Delivery state

精确47路径已提交为 `e98bf8a` 并普通 push；Draft PR #5 已创建，状态为 `CLEAN / MERGEABLE`。Ready 前审计结论为 `Conditional Go`：本轮四文档状态同步需另经 stage、commit、push 后复核 PR head。当前未转 Ready、未 merge，未修改 Pages、tag 或 Release。
