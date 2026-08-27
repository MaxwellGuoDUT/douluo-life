# V0.5 RC1 focused PR、Day20 交付与公开验收收口记录

> PR [#5](https://github.com/MaxwellGuoDUT/douluo-life/pull/5) 已经 Ready 并合并；页面滚动 hotfix 由 PR [#6](https://github.com/MaxwellGuoDUT/douluo-life/pull/6) 合并，Day19 状态文档由 PR #7 收口，Day20 玩家呈现层由 PR [#8](https://github.com/MaxwellGuoDUT/douluo-life/pull/8) 合并。本文件保留 RC 范围，并把自动化、Codex Browser、owner acceptance、CI、Pages 与发布登记分层记录。

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
- Ready 前快照：GitHub 没有 `e98bf8a` 的 Actions run，仓库没有提交级 CI workflow 或 required checks；当时 CI 为 `unavailable / not configured`，不是 passed。
- Ready 前快照：PR review 为 `unavailable`（0 reviews、0 comments、0 review requests），Pages 当时仍发布 `main@c7d2978`，V0.5 尚未公开部署或验收。
- focused checkout 只包含 V1、V2 与 V0.5 HTML；V3、临时魂环 Demo 和 APK Route Demo 留在 PR #4/原混合工作树，属于 focused 拓扑排除。
- PR #5 以 merge commit `67abd4785d5365c8c95816201ef4524688709b21` 合并，Pages run [32752990658](https://github.com/MaxwellGuoDUT/douluo-life/actions/runs/32752990658) 成功。
- 公开页面发现推进时页面级滚动问题后，hotfix commit `981af0f74142c956a4605a40a19d5b690fc3cb43` 仅修改应用绑定与对应测试；focused `7/7`、完整 `176/176` 通过。
- PR #6 以 merge commit `10d33a2bb0f3399df7a18c139848f4330a41ec35` 合并，Pages run [32755367252](https://github.com/MaxwellGuoDUT/douluo-life/actions/runs/32755367252) 成功。
- Codex 自动浏览器在公开页面验证到21岁，确认启动、限定 Network、console 0 与不再自动跳底；最终批次超时，未将剩余项目记作 Codex 自动验证。
- 项目负责人随后完成人工公开验收，确认不再自动跳底，并通过0～25岁、Network、console、完成锁、刷新与390×844窄屏。该结论明确归类为负责人验收。

## Delivery state

精确47路径与 Ready 文档已通过 PR #5 合并；两文件页面滚动 hotfix 已通过 PR #6 合并，后续状态文档已由 PR #7 合并。Day19 的 Pages 与 owner public acceptance 继续成立；不得用下面的本地候选改写这些独立证据。

## Day20 player presentation delivery

`A-DAY20-IMPLEMENT` 的候选已由精确13路径提交 `7d1e48566366a37dfc7696f97a919c0cefe4ada7` 交付，并经 PR #8 以 merge commit `35f7c2f20359f07fdb2513517dd262f61b102cb5` 合并到 `main`：

- 玩家可见变化：事件变更卡、按 `N 岁` / `N → N+1 岁` 分组的完整人生年表、25岁可读结局；
- 实现范围：新增纯呈现模块和测试，扩展 V0.5 runner/UI，增加 Node 24 CI，并把 package version 设为 `0.5.0-rc.1`；
- 自动化：定向 `13/13`、完整 `182/182`、generator `--check`、script syntax 与 whitespace checks 通过；
- Codex 本地 Browser：默认 seed 25岁 `100/100` 与100条记录闭合；custom seed 在 `APK_ROUTE_DYNAMIC_OPTION_UNRESOLVED` 处为 `95/94` 与94条记录；390×844 无横向溢出，console warning/error 为0；
- CI：PR run [33056544343](https://github.com/MaxwellGuoDUT/douluo-life/actions/runs/33056544343) 与 main push run [33057309608](https://github.com/MaxwellGuoDUT/douluo-life/actions/runs/33057309608) 均成功；
- Pages：run [33057308794](https://github.com/MaxwellGuoDUT/douluo-life/actions/runs/33057308794) 与 deployment `6119825967` 成功，部署 `main@35f7c2f20359f07fdb2513517dd262f61b102cb5`，source 为 `main / (root)`；
- Codex 公开 Browser：新年表/变化卡和不自动跳底已确认，推进到8岁、cursor/history `40/40` 后控制通道超时；25岁、custom seed、console、Network 与390×844不记为本次 Codex 公开自动完成；
- owner public acceptance：默认 seed 到达25岁/42级、铜灵币29850、`100/100`，第100项完整提交，24→25岁变化卡、铁角牛与4个魂环、结构化结局、完成锁和边界声明均可见，结构化错误为无；该终点记录不自动证明 Network、console、390×844 或 custom seed；
- RC identity：`v0.5.0-rc.1` GitHub prerelease，tag 指向本次五文档 closeout 合并后的准确 `main` SHA；无自定义 Release asset，不生成 `SHA256SUMS`。

明确排除 PR #4、V3、临时魂环 Demo、APK Route Demo、`douluo2`、25岁后内容、`official-beast.element`、其他 unresolved handler、save/load、owner 材料、archive 迁移与清理。
