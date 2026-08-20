# APK `applyHumanMartialSoul` 静态审计与基础接入记录（2026-08-16）

状态：`source_proven_base_add_connected / contextual_branches_unresolved`

## 审计边界

本次只审计 APK 已解包的静态 JavaScript 源码，没有启动 APK、没有执行游戏流程、没有调用原始 custom handler 推进游戏状态。

目标是把 `applyHumanMartialSoul` 中可以由源码直接证明的“基础新增武魂”分支物化到独立证据目录，并接入斗一正式初始武魂路线。觉醒、变异替换、成长变异替换和魂环物种分支不在本次接入范围。

## 直接来源

| 来源 | 用途 |
| --- | --- |
| `douluo1-pack-C6xEgEus.js` | `hr` 池级分类、`br/gr/mr` 标签集合、`wr` 选项级固定被动、handler 的上下文分支 |
| `human-foundation-CduvzjjO.js` | `ta` 直接规则、`$d` 元素/领域规则、共享 `pt` 属性规则、极致武魂 `Zt` 规则 |
| `martial-souls.json` | 584 条 APK canonical 武魂记录及原始 enabled/weight/pool/option 标识 |

核心 handler 的源语义是：

1. 通过 pool ID 查出武魂类别；
2. 合并选项固定被动、`Il(poolId, optionId)` 返回的被动；
3. 合并 sword/dragon 标签；
4. 基础上下文执行 `addMartialSoul`；
5. 极致武魂附加极致规则 effects，并提交 `Il` 返回的 typed effects；
6. 根据已加入武魂重新计算 `hasExtremeMartialSoul`。

本阶段运行时只复现上述基础上下文，并以 `douluo1:flow.formal-human.martial.` 为准入前缀。

## 物化结果

- canonical 武魂记录：584
- 有池级分类的记录：584/584
- 有类型化附加 effects 的记录：119
- 有 passives 的记录：10
- 有 tags 的记录：74
- 直接规则记录：46
- 共享属性规则命中：44
- 极致武魂 scope 规则：33
- 固定被动选项：6

完整证据目录：[martial-soul-runtime-evidence.json](/D:/0CODE/douluo-life/data/apk-canonical/catalogs/martial-soul-runtime-evidence.json)

可复现提取器：[extract-apk-martial-soul-runtime-evidence.mjs](/D:/0CODE/douluo-life/outputs/parallel-prep-2026-08-16/extract-apk-martial-soul-runtime-evidence.mjs)

## 已接入运行时

`js/apk-route-runtime.js` 现在对斗一正式初始武魂路线执行：

- `addMartialSoul`：保留 APK option ID 与文本，并写入源码证明的 category/tags/passives；
- `setFlag(hasExtremeMartialSoul)`：按当前武魂列表和本次类别计算；
- `advanceHumanElement`、`ensureHumanElementLevel`、`addDomain`：提交证据目录中的 typed effects；
- custom-handler 记录：写入 `dynamicHistory`，保留 flow、pool、option、handler 和实际 effects。

基础分支测试覆盖：

- `3cb19c`：本体武魂，生命属性 +1；
- `9a9e36`：极致武魂，火属性 +2、红莲领域、dragon 标签；
- `humanAwakenBody`：仍明确抛出 unresolved custom-handler，不把觉醒结果当作新增武魂。

## 本阶段后的下一道边界

真实 `douluo1` `smoke` 路线已越过基础 `applyHumanMartialSoul`，并已接通 faction 选项的 `setStoryBranch`。scheduler 动态 action 的源码优先级现已接通；当前下一处边界是其下游 ring/story/complete custom handler：

```text
flow:   douluo1:flow.formal-human.scheduler
action: douluo1:action.formal-human.schedule
status: scheduler_connected_then_downstream_dynamic_boundary
```

这说明基础武魂 handler 与 faction 分支 effect 均已被真实路线使用。`setStoryBranch` 的来源语义已在独立 APK character/session 中接入；觉醒/变异类 `applyHumanMartialSoul` 仍需另立上下文分支审计，不应顺手放开。
