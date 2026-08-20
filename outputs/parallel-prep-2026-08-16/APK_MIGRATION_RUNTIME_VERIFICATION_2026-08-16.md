# APK 迁移运行时首批验证报告

日期：2026-08-16

状态：`route_dynamic_bridge_partial / source_proven_martial_base_connected / source_proven_story_branch_connected / source_proven_scheduler_connected / source_proven_special_growth_connected / source_proven_special_result_connected / source_proven_lacks_domain_connected / user_manual_acceptance_previous_surface_martial_soul_and_scheduler_and_special_result / browser_manual_retest_pending`

## 已完成

- `data/production-entry.json` 已将活动内容源指向 `data/apk-canonical/`。
- APK canonical package 保留全部抽取记录，并保留 `enabled`、`contentStatus`、route/source layer、ending/death 等原始状态。
- 新增 `js/apk-rule-runtime.js`：
  - `pcg32-counter-v1` seed/cursor 抽取；
  - 先条件过滤、再按权重抽取；
  - 48 类抽取 effect 均有显式 typed handler；
  - source runtime 中与当前目录相关的路线/时间/出生状态效果也有独立 handler；
  - effects 在克隆状态上整组提交，失败不修改输入；
  - 死亡护盾、等级损失护盾、死亡和结局控制保持显式结果。
- 新增 `js/production-content-loader.js`，支持活动入口的完整加载和按目录的 lazy load。
- 新增 `data/apk-canonical/catalogs/route-graph.json`，恢复 `douluo1`、`douluo2` 的正式 `flow → pool → option → next` 静态路线；动态 action/resolver/customHandler 以 registry 和显式动态边界保留。
- 新增 `js/apk-route-runtime.js`，将 route graph 接入 APK session：支持 exact flow 跳转、按 APK 权重抽取、effects 原子提交、follow-up 队列和终局；动态节点会结构化阻断并回滚。
- 路线图已物化 canonical options 中 4,932 个 supplemental-effect key；其中 6 个来源效果冲突项保持 `variant-conflict`，不自动提交。
- `js/apk-route-runtime.js` 已接入首段 source-proven dynamic bridge：固定/非固定先天魂力、极致武魂身份分支、特殊天赋前置、斗一武魂池选择、斗一正式武魂后的 faction 前置，以及斗二正式性别/外观后的明确入口。
- `applyHumanMartialSoul` 的基础正式分支已接入：584/584 条 APK 武魂记录有分类证据，类型化元素/领域效果、固定被动和标签均来自源码静态映射；运行时仅在 `douluo1:flow.formal-human.martial.*` 下执行 `addMartialSoul`。
- `setStoryBranch` 已按 APK 原始语义接入：写入 `storyBranch`，并把当前 `timelineAge` 写入 `branchStartTimelineAge`；分支值严格限定为源码 schema 的 `1/2/3`。
- `douluo1:action.formal-human.schedule` 已按 APK 源码优先级接入：寿命、待结算魂骨、元素/领域机会、神考归档、魂环 planner、剧情顺序和年度成长池均保留精确目标；证据见 `APK_SCHEDULER_ACTION_AUDIT_2026-08-16.md`。
- `douluo1:action.formal-special-growth` 已按 APK 源码接入：身份分组、F 级覆盖、一无所有/普通身份等级段、56 个特殊成长池 target 和年龄前置 suppression flag 均保留；证据见 `APK_SPECIAL_GROWTH_ACTION_AUDIT_2026-08-16.md`。
- `douluo1:handler.formal-special-result` 与 `douluo1:action.after-formal-special-result` 已接入 source evidence：2710 条规则中无战力门槛、免疫和完整法则分支按 typed effects 执行；440 条依赖 APK 战力总值的规则仍显式阻断；证据见 `APK_SPECIAL_RESULT_HANDLER_AUDIT_2026-08-16.md`。
- `lacksDomain` 已按 source `domains` 集合接入 typed requirement；完整领域池 28 个选项可以按已拥有领域过滤并提交 `addDomain`；证据见 `APK_DOMAIN_REQUIREMENT_AUDIT_2026-08-16.md`。
- `douluo1:action.formal-human.select-martial` 的 C/B 级兽武魂 canonical pool ID 拼写错误已修正；负责人相同 seed 已通过武魂选择、after-martial、scheduler 并进入 special-growth，修复记录见 `APK_MARTIAL_SELECT_ACTION_FIX_2026-08-16.md`。
- 觉醒、变异替换、成长变异替换和魂环物种分支继续结构化阻断；没有把这些上下文误当作基础新增武魂。
- 新增独立入口 `apk-route-demo.html`，不替换旧的 `v2-demo.html`；生产入口登记了 route graph 与该 demo 路径。
- 路线规模：1,695 个 flow、1,449 个 pool、12,501 个 pack option；1,587 个 flow→pool、35,667 个明确 flow 引用、167 个已登记 resolver 引用。
- 旧 271 项武魂目录、旧概率配置和旧 6 岁 flow 未被覆盖；其原始 SHA-256 已登记在 `data/v2/archive/apk-replaced-2026-08-16/manifest.json`，当前三项指纹全部匹配。

## 自动验证

```text
npm.cmd test
202 tests passed, 0 failed
```

新增验证覆盖：

- APK canonical package 的 10 个目录及数量；
- 当前/辅助/休眠魂兽状态筛选；
- 禁用 option 保留但默认不抽取；
- APK 原版随机算法的同 seed 重放；
- 典型 effect、requirement、条件分支和整组原子回滚；
- 活动 production entry 与 archive-only 指纹；
- 完整包加载和 partial lazy load 的边界。
- 双 pack 路线图的 entry flow、exact 首跳、动态 resolver registry 和 unresolved 计数；路线图按需加载验证。
- synthetic route runtime 的 exact 跳转、终局、动态 action 阻断和原子回滚；真实 `douluo1` 入口到 gender flow 的 smoke test。
- canonical identity supplemental effects 与原始可用性保持；固定/非固定先天魂力动态分支、武魂天赋选择分支、基础武魂 category/effect 分支、`setStoryBranch` 时间线语义、scheduler 优先级/终局/回滚和未接入觉醒上下文的阻断测试通过。
- special-growth action 的身份组/F 覆盖、56 个来源 target、suppression flag、source gap 回滚，以及特殊成长结果 handler 的商店池→后续池 smoke 通过；战力依赖分支仍明确停在 typed boundary。
- 负责人现场状态确认 formal-special-result 与 after-result 已实际多次通过；新的停止点为完整领域池 `lacksDomain` requirement，已完成代码接入，等待浏览器复验。
- C 级兽武魂 select-martial canonical ID 修复、真实 seed 路径和前置 route continuation 通过。
- 本地静态 HTTP 资源检查：`apk-route-demo.html`、`js/apk-route-demo-app.js`、active production entry、route graph 均返回 HTTP 200。

## 当前仍未自动猜测的兼容边界

这些不是本批失败，而是必须继续保留为显式迁移工作：

1. 路线图中有 1 个明确 `possibleNext`（`humanEarlyRingDomain`）没有出现在最终 pack flow registry；它在 foundation 源中存在但未被最终 pack 导出，仍保持 unresolved，未猜接。
2. canonical 静态目录中有 894 个唯一 option key 带 failure/终局证据，其中 226 个 key 存在多个来源变体；这些变体已全部保留，但通用 option 提交器尚未把 failure effects 绑定到战斗/判定失败协议。
3. 当前运行时使用独立的 `apk-character/1.0` 状态，不修改现有 Player v2 schema；共享年度事务和 Player v2 的桥接仍需按实际首条路线逐项接入。
4. `applyHumanMartialSoul` 的基础正式 `addMartialSoul` 分支、faction option `218e21` 的 `setStoryBranch` typed effect、`douluo1:action.formal-human.schedule`、`douluo1:action.formal-special-growth`、special-result handler 和 `lacksDomain` typed requirement 已接入；剩余边界包括 APK 战力总值、机会回跳、骑士王座特殊映射，以及 ring/story/complete custom handler，不再用猜测补线。
5. `applyHumanMartialSoul` 的 `humanAwaken*`、变异替换、成长变异替换和魂环物种上下文仍未接入，必须按各自状态语义单独审计。
6. 现有 `v2-demo.html` 仍是旧 6 岁 Player v2 兼容演示面，不应与 APK 路线 UI 混同。APK 活动数据入口已切换，独立 APK 路线 UI、武魂基础 handler、scheduler surface 与 special-result 现场路径均已得到用户验收证据；lacksDomain 修复等待复验。

用户于 2026-08-16 提供现场状态，确认 special-result 与 after-result 已多次实际执行；现场新的停止点是完整领域池的 `lacksDomain` requirement，控制台结果未提供。当前会话仍未暴露可调用的 in-app Browser 控制工具，因此自动化浏览器点击、可见状态和浏览器控制台结果记录为 `unavailable / unverified`；上述 HTTP 200 只证明静态资源可服务，不等同于 browser verified。

因此，本报告代表“数据源、规则适配、原子运行时首批切片、首段动态桥、武魂基础 custom-handler 切片、`setStoryBranch` typed effect、scheduler action、special-growth action、special-result handler 和 lacksDomain requirement 已完成；独立路线 UI、武魂基础 handler、scheduler surface 与 special-result 路径已有人工证据”，不代表领域池修复已完成浏览器复验、战力依赖分支或 APK 全部剧情路线已经可达。
