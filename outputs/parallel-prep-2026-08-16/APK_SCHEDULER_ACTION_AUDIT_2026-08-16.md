# APK douluo1 scheduler action 审计

日期：2026-08-16

状态：`source_proven_scheduler_connected / source_proven_special_growth_connected / user_manual_acceptance_passed / downstream_dynamic_boundaries_preserved / browser_control_unavailable`

## 审计对象

- action：`douluo1:action.formal-human.schedule`
- flow：`douluo1:flow.formal-human.scheduler`
- APK 源文件：`apk-analysis/E4FB340E/derived/pretty/douluo1-pack-C6xEgEus.js`
- 运行时桥接：`js/apk-scheduler-runtime.js`、`js/apk-route-runtime.js`
- 证据摘要：`data/apk-canonical/catalogs/scheduler-runtime-evidence.json`
- APK SHA-256：`E4FB340E0DAD857A018E2F06982D32623BDD683B22BD44230A2257C35DAA11C`

本审计为静态源码映射，未执行 APK 原始 gameplay；运行时只使用已物化的 flow/pool/option 与 typed effects。

## 源码证明的优先级

`$i(e)` 在 APK 中按以下顺序返回目标：

1. 人类寿命达到 150 岁时应用 `douluo1:human-lifespan-150` 结算。
2. 存在待结算魂骨时进入 `humanPrepareSoulBonePart`。
3. 有元素抽取次数时消耗 `formal:element-draws`，进入官方魂兽池 `f2abac93-6b26-4e3e-aa92-a168db671577`。
4. 有领域抽取次数且尚未收集全部领域时消耗 `formal:domain-draws`，进入来源池 `13e60019-9d99-411a-8739-65d3d1eb13bd`。
5. 神考次数可用时，先归档已结束的神考，再消耗一次次数、设置 scheduler mode/index，进入 `humanGodTrialTier`。
6. 魂环规划优先于年度成长：源码会选择主武魂缺失环位，或 90 级后的副武魂补环批次。
7. 90 级以上的领域雏形会先清除雏形状态；仍缺领域时进入领域来源池。
8. `annual` 模式先按分支顺序检查 43 个 `d1Plot1` 或 32 个 `d1Plot2` 剧情池，再选择 F 级特殊成长或年度成长池。
9. `godTrial` 模式回写 annual 并设置 `godTrialReturnStep`；`seaTrial` 模式回写 annual 并进入海神岛第一来源池。
10. 未识别 scheduler mode 按 APK 返回正式 complete flow。

## 已接入的运行时语义

- 年度池映射保留 APK 原始 ID：F/E、D、C、B、A、S、divine，以及 90 级和 100 级成长池。
- 故事分支保留源码的 timeline age 门槛、45 条显式前置标记，以及两个战斗胜利门槛；不满足时写入源码同名 skipped flag。
- 神考结束状态通过 typed `archiveCompletedGodTrial` 归档至 `godTrials`，不会丢弃历史状态。
- 魂环 planner 写入源码所需的 `pendingRing` 与 `additionalSoulRingBatch` 上下文。
- 动态 action 现在支持源码式 terminal result；150 岁结算不会伪造一个后续 flow，也不会消耗 RNG。
- 动态 action 的 target 校验发生在 effects 提交前；目标缺失、typed effect 失败或后续解析失败都会恢复完整 session。

## 自动验证

当前 route/rule targeted tests：`28 passed, 0 failed`；全量回归：`201 passed, 0 failed`。

覆盖：

- D 级年度池的精确目标；
- 元素机会优先于年度池；
- 已结束神考归档、次数递减和 scheduler mode 语义；
- 150 岁源码结算、terminal 状态和 RNG cursor 不变；
- scheduler 目标缺失时 priority effect 与 session 原子回滚；
- 既有 exact route、武魂基础 handler、`setStoryBranch` 和全局 rule tests。

## 真实运行时 smoke 边界

此前在 branch 2、timeline age 6、E 级天赋且无武魂的 route session 中，scheduler 已实际完成一次年度池选择：年龄推进至 7，下一 flow 为 `douluo1:flow.formal-special-growth`；当时随后在该下游 action 处以 `APK_ROUTE_DYNAMIC_UNRESOLVED` 停止，证明阻断点来自下游 dynamic action，而不是年度优先级本身。

本阶段已继续接通该下游 action：真实 route smoke 已从 `douluo1:flow.formal-special-growth` 实际解析到来源特殊成长池，并在其选项的 `douluo1:handler.formal-special-result` 处以 `APK_ROUTE_DYNAMIC_OPTION_UNRESOLVED` 停止。特殊成长 action 的详细证据见 `APK_SPECIAL_GROWTH_ACTION_AUDIT_2026-08-16.md`；前置 C 级兽武魂 pool ID 修复见 `APK_MARTIAL_SELECT_ACTION_FIX_2026-08-16.md`。

## 负责人手动验收

日期：2026-08-16

- scheduler 可见：通过；
- scheduler 后目标 flow：负责人未填写，本报告不作推断；
- routeStatus：负责人未填写，本报告不作推断；
- 本次路径出现明确兼容边界：否；
- 控制台异常：否；
- 负责人结论：通过。

该结果确认当前 demo surface 的 scheduler 人工验收通过；不覆盖下游 `formal-special-growth`、魂环、剧情和 complete handler 的后续验收。

## 保留的下游边界

这些边界已被明确保留，未用猜测填充：

- `douluo1:handler.formal-special-result` 与 `douluo1:action.after-formal-special-result`；
- `humanPrimaryRingAge*` / `humanSecondaryRingAge` 后续 ring resolver、魂环类型和 custom handlers；
- formal story option 的 `douluo1:handler.formal-story.result`；
- `douluo1:action.formal-human.complete`；
- `humanPrepareSoulBonePart` 后续动作；
- foundation 中存在但最终 pack 未导出的 `humanEarlyRingDomain` possibleNext。

因此，“scheduler action 已连接”不等于“APK 全部正式剧情已自动可达”。Browser 控制工具当前仍不可用，未宣称浏览器验收。
