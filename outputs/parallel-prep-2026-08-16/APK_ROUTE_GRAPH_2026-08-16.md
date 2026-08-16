# APK Route Graph 复原记录（2026-08-16）

状态：`source_routes_recovered_dynamic_handlers_explicit`

本阶段从 APK 解包后的正式 `douluo1`、`douluo2` pack 模块恢复可执行路线的静态部分，建立：

`flow → pool → option → next`

同时保留 option 的 requirements、rerollWhen、effects、followUps、customHandler，以及静态目录中可匹配到的 failure effects 与终局标记证据。
对 canonical options 中能唯一证明的 supplemental effects 也按 `pool_id:option_id` 物化进路线图；存在来源变体冲突的项保留冲突指纹，不自动选择。
对 `applyHumanMartialSoul` 也建立了独立的静态证据目录，并将基础 `addMartialSoul` 分支所需的紧凑字段嵌入路线图；觉醒、变异替换和魂环物种上下文仍保持未接入。

## 来源与边界

- APK SHA-256：`E4FB340E0DAD857A018E2F06982D32623BDD683B22BD44230A2257C35DAA11C`
- 来源模块：
  - `apk-analysis/E4FB340E/derived/pretty/douluo1-pack-C6xEgEus.js`
  - `apk-analysis/E4FB340E/derived/pretty/douluo2-pack-BsEUb2l9.js`
- 提取方式：隔离的构建期静态导出 materialization；没有启动 APK、没有执行游戏流程、没有推进玩家状态。
- 跳转政策：只有 source pack 中明确出现的字符串跳转才登记为 exact edge；action、resolver 和未审计的 customHandler 行为保留为动态节点，不以名称推断结果。已审计的基础 `applyHumanMartialSoul` 仅在斗一正式初始武魂 flow 前缀下接入；`setStoryBranch` 则作为独立 APK character effect 按源码语义接入。

## 恢复规模

| 内容包 | flow | pool | option | flow→pool | 直接 option.next | resolver 引用 | 带 requirements 的 option | 终局 option |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| douluo1 | 913 | 757 | 6,449 | 842 | 5,612 | 83 | 1,173 | 353 |
| douluo2 | 782 | 692 | 6,052 | 745 | 5,215 | 84 | 1,140 | 274 |
| 合计（按 pack 记录计） | 1,695 | 1,449 | 12,501 | 1,587 | 10,827 | 167 | 2,313 | 627 |

全局诊断：

- 明确 flow 引用：35,667；明确 pool 引用：1,587。
- 167 个 `getNext` 引用均能在对应 pack 的 resolver registry 中找到；未发现缺失的动态 resolver ID。
- 1 个明确的 `possibleNext` 未在最终 pack flow registry 中注册：`humanPrepareEarlyRingDomain → humanEarlyRingDomain`。该节点在 `human-foundation` 源中存在，但没有被 `douluo1` 最终 `game.flows` 导出；目前保留为 unresolved，不自动补接。
- 两个 pack 之间存在 46 个 flow ID、634 个 pool ID 重合。它们作为 pack 内记录分别保留，不把重合误判为跨包跳转。
- canonical options 共关联出 4,932 个 supplemental-effect key，其中 6 个 key 存在效果变体冲突；冲突项保持 `variant-conflict`，未进入运行时自动提交。
- `applyHumanMartialSoul` 静态证据覆盖 584/584 条 APK 武魂记录：119 条带类型化附加效果、10 条带被动、74 条带标签；这些字段均来自 APK 源码映射，不从名称或相邻 ID 推导。

## failure effects 与终局证据

从 canonical `options.json` 中按 `pool_id:option_id` 关联保留：

- 894 个唯一 option key 有 failure/终局相关证据。
- 708 个 key 有 failure effects。
- 395 个 key 有 `endingLike` 或 `deathLike` 标记。
- 226 个 key 存在多个静态来源变体，全部保留为 `canonicalEvidence.variants`，未擅自选择其中一个覆盖 source pack 的正式 option。

因此，路线图已经能向后续 runtime 提供 source pack 的明确跳转和门控数据；failure-effect 变体及动态 handler 的运行时选择仍是兼容层需要显式处理的边界。

## 产物

- 路线图：[route-graph.json](/D:/0CODE/douluo-life/data/apk-canonical/catalogs/route-graph.json)
- 可复现提取器：[extract-apk-route-graph.mjs](/D:/0CODE/douluo-life/outputs/parallel-prep-2026-08-16/extract-apk-route-graph.mjs)
- 武魂 handler 证据：[martial-soul-runtime-evidence.json](/D:/0CODE/douluo-life/data/apk-canonical/catalogs/martial-soul-runtime-evidence.json)
- 武魂证据提取器：[extract-apk-martial-soul-runtime-evidence.mjs](/D:/0CODE/douluo-life/outputs/parallel-prep-2026-08-16/extract-apk-martial-soul-runtime-evidence.mjs)
- story branch effect 审计：[APK_STORY_BRANCH_EFFECT_AUDIT_2026-08-16.md](/D:/0CODE/douluo-life/outputs/parallel-prep-2026-08-16/APK_STORY_BRANCH_EFFECT_AUDIT_2026-08-16.md)
- 首段动态桥：[apk-route-runtime.js](/D:/0CODE/douluo-life/js/apk-route-runtime.js)
- 生产入口：[production-entry.json](/D:/0CODE/douluo-life/data/production-entry.json)
- 旧 Player v2 内容仍由归档清单保留，未被删除或覆盖。

## 验证

- `npm.cmd test`：`196 passed，0 failed`。
- 新增路线图测试覆盖：schema、来源边界、双 pack entry flow、首个身份池的 exact `next`、canonical supplemental effects、武魂 handler 证据、动态 resolver 与 unresolved 计数。
- scheduler action 审计与证据见 [APK_SCHEDULER_ACTION_AUDIT_2026-08-16.md](/D:/0CODE/douluo-life/outputs/parallel-prep-2026-08-16/APK_SCHEDULER_ACTION_AUDIT_2026-08-16.md) 和 [scheduler-runtime-evidence.json](/D:/0CODE/douluo-life/data/apk-canonical/catalogs/scheduler-runtime-evidence.json)。
