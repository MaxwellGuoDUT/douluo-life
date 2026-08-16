# APK `prepareSoulRing` handler 审计

日期：2026-08-16

状态：`source_proven_prepareSoulRing_connected / selectRingTypeStep_connected / browser_manual_retest_pending`

## 当前边界

负责人提供的 Demo 状态已通过 scheduler 与完整领域池，继续到：

- flow：`humanPrimaryRingAge1`；
- pool：`24ab4336-6902-498e-a1fa-e65b616d7154`；
- option：`d57e06`（`50年魂环`）；
- error：`APK_ROUTE_DYNAMIC_OPTION_UNRESOLVED`；
- custom handler：`prepareSoulRing`。

这不是 scheduler 或领域 requirement 失败，而是魂环年龄结果与后续类型步骤之间尚未接入的精确动态边界。

## 源规则

APK `human-foundation-CduvzjjO.js` 的 `Rt` 为十个魂环年龄池生成统一的 `prepareSoulRing` handler；选项源数据位于：

- 静态源数据：`apk-analysis/E4FB340E/derived/static-data/human-foundation-CduvzjjO/00280930-Dd.json`；
- 源模块：`apk-analysis/E4FB340E/derived/pretty/human-foundation-CduvzjjO.js`；
- 源函数：`Rt`、`de`、`Jt`、`sn`、`$e`；
- APK SHA-256：`E4FB340E0DAD857A018E2F06982D32623BDD683B22BD44230A2257C35DAA11C`。

已静态提取 10 个魂环池、176 条 source rule。`d57e06` 的源规则为：

```json
{
  "poolId": "24ab4336-6902-498e-a1fa-e65b616d7154",
  "optionId": "d57e06",
  "ringYears": 50,
  "grantsSoulBone": false,
  "requiresGodTrial": false,
  "customHandler": "prepareSoulRing"
}
```

APK handler 本身只更新 `pendingRing.years`、`pendingRing.source` 和 `pendingRing.grantsSoulBone`；它不会在该步直接写入已完成魂环。十万年献祭选项的 `ringLevelDelta` 仍由 route option 的 typed `changeLevel` effect 处理，避免重复应用。

## 已接入

1. 新增证据包：[human-soul-ring-runtime-evidence.json](/D:/0CODE/douluo-life/data/apk-canonical/catalogs/human-soul-ring-runtime-evidence.json)。
2. `production-entry` 与 package index 已登记该证据包；loader 在 route graph 模式下加载它。
3. `prepareSoulRing` custom handler：
   - 缺证据时报 `APK_ROUTE_SOUL_RING_EVIDENCE_MISSING`；
   - 缺少有效 `pendingRing` 时报 `APK_ROUTE_SOUL_RING_CONTEXT_MISSING`；
   - 按源规则写入年龄、来源和魂骨标记；
   - 任一失败恢复完整 route session。
4. 当前 flow 的 `getNext: selectRingTypeStep` 已接入：
   - 主武魂第一环进入 `humanRingType1`；
   - 仍校验目标 flow 存在，不根据 `possibleNext` 猜测路径。
5. 新增证据提取器：[extract-apk-human-soul-ring-runtime-evidence.mjs](/D:/0CODE/douluo-life/outputs/parallel-prep-2026-08-16/extract-apk-human-soul-ring-runtime-evidence.mjs)。

当前仍未接入的是 `selectSoulRingType`、`finalizeSoulRingSpecies`、魂骨后续处理和 `afterSoulRing` action；它们会作为下一批独立边界保留。

## 自动验证

- 定向 route/runtime + loader：`29 passed, 0 failed`；
- 全量 `npm.cmd test`：`207 passed, 0 failed`；
- 覆盖 `d57e06 → pendingRing → humanRingType1`；
- 覆盖十万年选项的等级增量与魂骨标记；
- 覆盖证据缺失时的原子回滚；
- `node --check`：route runtime、loader、证据提取器通过。

本报告不宣称 Browser 自动控制或浏览器控制台验证；当前状态为 `browser_manual_retest_pending`。

## 下一次人工验收

刷新 `file:///D:/0CODE/douluo-life/apk-route-demo.html`，保持默认 seed `apk-route-demo-seed`，沿此前已验收路径推进到 `humanPrimaryRingAge1`，提交出现的魂环年龄选项。

本步通过条件：

- 不再出现 `APK_ROUTE_DYNAMIC_OPTION_UNRESOLVED`；
- `routeStatus = ready`；
- 当前 flow 变为 `humanRingType1`；
- 角色摘要中的 `pendingRing.years = 50`、`source.optionId = d57e06`、`grantsSoulBone = false`；
- 路线审计中出现 `prepareSoulRing` 与 `selectRingTypeStep`，且 `nextFlowId = humanRingType1`；
- 控制台无异常。

完成本步后不要把后续 `selectSoulRingType` 的新边界记为本步失败；请把它作为下一次独立人工验收起点。
