# V0.5 RC1 focused PR description（本地草案）

> 目标基线：`main@c7d2978`。目标分支：`codex/v05-rc1`。本文件不表示 PR 已创建、远端 body 已更新或分支已 push。

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
- 变更路径仍须终审为 47/47，tracked `git diff --check` 必须通过。自动化全绿不替代当前 checkout 的浏览器、CI、review 或独立 Ready 授权。
- 当前 checkout 的真实浏览器、GitHub CI、PR review 与 Pages 验收仍需独立执行，不能由 Day18 历史浏览器证据替代。

## Delivery state

当前仅完成授权文件范围内的本地实现；未 stage、commit、push、创建 PR、转 Ready、merge、tag、Release 或修改 Pages。
