# 项目维护与整理记录

审计日期：2026-10-03（Asia/Shanghai）。远端基线 main 为 c3d883acf382d397a2a3c58f8b77a915c5446803。以下分支、PR 与检查结果是查询快照，不是永久实时状态。

## 本次发现与处理

| 问题 | 本地整理 |
| --- | --- |
| README 已更新，旧文档仍自称当前入口 | 文档导航和醒目的历史说明，保留原正文 |
| 版本说明与开发流水混杂 | 新增玩家向 CHANGELOG，DEVLOG 保留开发经过 |
| 无贡献和反馈规范 | CONTRIBUTING、问题／建议模板和 PR 模板 |
| 无仓库级忽略规则 | 仅忽略依赖、局部临时目录、环境配置和系统杂项 |
| 缺默认 vault 的检查被计作通过 | 明确 SKIP；支持 DOULUO_SOURCE_VAULT，显式错误配置仍失败 |
| Node 版本要求只在 CI 里 | package.json 声明 Node 24.x |
| outputs 易被误删 | 标明其中 12 个跟踪文件仍被生成器／测试引用，暂不搬迁 |
| 已有开发补记未在 GitHub 展示 | DEVLOG 纳入待交付审阅；原发布报告和其他 owner 差异独立保留 |

## GitHub 基线

- 公共仓库，默认 main；About 简介和根首页正确，Wiki 关闭、Issues 开启，目前无 topics。
- main 的 [CI](https://github.com/MaxwellGuoDUT/douluo-life/actions/runs/37117956134) 与 [Pages](https://github.com/MaxwellGuoDUT/douluo-life/actions/runs/37117955795) 均成功，对应 c3d883a。
- Pages 从 main 根目录部署，合并有公开发布副作用。
- 最新正式 Release 是 v1.0.1，tag 指向 195025c；后续首页更新不移动该 tag。
- 无开放 Issue；一个开放 Draft [PR #4](https://github.com/MaxwellGuoDUT/douluo-life/pull/4)，来自早期 APK 集成分支。
- 12 个远端分支，main 未保护，rulesets 查询为空；绿色 CI 不是强制合并门槛。
- 没有统一 LICENSE，本次不擅自选择许可证或替来源内容作许可承诺。

## 远端整理候选（尚未执行）

### 已合并历史分支

以下 9 个远端 head 已用 git merge-base 验证为 main@c3d883a 的祖先。删除前须重新核对远端 head；仅考虑远端引用，不删除或归档本地工作树。

- codex/day10-v2-combat-foundation
- codex/day14-v2-production-playtest
- codex/day20-player-presentation
- codex/day20-rc1-closeout
- codex/day21-v05-wheel-save
- codex/day22-v05-destiny-cohort
- codex/day23-v05-runtime-coverage-explorer
- codex/day24-v05
- codex/v05-rc1

保留 main。codex/v10-randomness-hotfix 虽已被 main 包含，仍用于本地整理，不与旧分支一起删除。

### 历史 PR 单独处理

codex/day14-release-closeout 的 e17ec72 不是 main 祖先，PR #4 仍为 Draft，不能当作“已合并垃圾”。建议停止把它作为当前发布候选；如决定关闭 PR，保留该分支与历史材料，不直接合并进现行 main。

### 设置建议

- topics：javascript、browser-game、simulation-game、github-pages、single-player。
- main 可禁止强推／删除，要求既有 ci 的 test 检查通过；个人维护不强制第二位审批人。实施前确认权限及准确 check 名，避免错误配置。
- 保持 Pages 来源、旧 tag 和 Release；本次文档整理无需新发补丁版本。
- LICENSE 待维护者确认自有代码与来源内容范围后决定，不预选 MIT 等许可。
- 以上设置、关闭 PR 和远端分支删除均未执行，不得据本文宣称已完成。

## 每次交付

1. 一个主题对应一个 PR，写清问题和结果，不整份复制历史任务书。
2. 按影响验证：源变化再查 vault，UI 变化查交互，普通文档不重跑人生。
3. 玩家变化记 CHANGELOG，阶段成果记 DEVLOG，详细验证引用原报告。
4. 合并前检查 PR CI，之后核对 main CI 和 Pages 的准确 SHA；有版本发布需求再创建 tag/Release。
5. 确认分支已合并且无进行中的工作，再清理远端引用；保留本地 owner 材料。

## 消融

不新增构建框架、包依赖、文档网站、Issue／发布机器人或额外 CI 工作流。不搬迁运行时和生成数据，不改写 Git 历史，不删除旧演示。先减少重复的“当前状态”，让现有 CI 如实报告验证边界。

## 本地验证与交付清单 — 2026-10-04

本轮验证完成：

- 8 份新／现行文档的 33 个本地链接和大小写检查通过，编码及代码围栏正常。
- 3 份加历史标记的文档，其原正文与 HEAD 完整一致；原报告与任务书写入前后未变。
- 两个 Issue 模板必需头部字段存在；实际 GitHub 界面以模板合并后显示为准。
- 默认 vault 缺席：4 通过、1 明确跳过。
- DOULUO_SOURCE_VAULT 指向真实 vault：5/5 通过，生成器实际执行 --check。
- 显式指向不存在的 vault：4 通过、1 预期失败、退出码 1，没有静默跳过。
- git diff --check 通过。只改测试的环境识别和结果报告，未改断言或游戏代码，不重复全量人生套件。

拟交付的精确 15 条路径如下，其中 DEVLOG 包含此前已完成的历史补记：

1. .gitignore
2. .github/ISSUE_TEMPLATE/bug_report.md
3. .github/ISSUE_TEMPLATE/feature_request.md
4. .github/PULL_REQUEST_TEMPLATE.md
5. README.MD
6. CHANGELOG.md
7. CONTRIBUTING.md
8. docs/README.md
9. docs/MAINTENANCE.md
10. docs/AI_CONTEXT.md
11. docs/CURRENT_PROJECT_STATUS_2026-08-20.md
12. docs/V05_DEMO.md
13. docs/DEVLOG.md
14. package.json
15. test/v10-source-inventory.test.js

现有 docs/evidence/V10_ASCENSION_CLOSURE_2026-09-30.md 发布回执差异、未跟踪审计数据和四份任务书不在此清单，原地保留。未 stage、commit、push、创建／关闭 PR、修改设置或删除分支。

下一步是对这份具体候选执行提交、PR／CI、合并及 Pages 核对；远端分支删除、关闭 PR #4 和保护规则可另批处理。此处记录已准备的操作，不是远端完成回执。

## 2026-10-04 — 本地游戏维护候选接续

继承上述15文件，不搬迁源数据、outputs或旧演示。本轮新增显示／记事职责边界、源标题和年龄展示修复、单份检查点及有界记事；全部19条本轮路径、性能波动和验证分类见[报告](evidence/V101_D2_BEAST_PERFORMANCE_2026-10-04.md)。负责人于2026-10-04反馈“我觉得目前没有问题”，本地候选人工验收通过，并授权补写DEVLOG、提交和推送当前topic分支。量化性能限制仍见报告，原待决PR、合并、发布及远端整理清单保持；本次推送不代表这些动作已完成。
