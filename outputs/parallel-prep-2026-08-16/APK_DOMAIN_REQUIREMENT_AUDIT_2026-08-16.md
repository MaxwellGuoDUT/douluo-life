# APK domain requirement 审计

日期：2026-08-16

状态：`source_proven_lacks_domain_connected / real_domain_pool_smoke_passed / browser_manual_retest_pending`

## 当前边界

负责人提供的 Demo 状态在多次 `formal-special-result` 成功后停在：

- flow：`douluo1:flow.formal-source.13e60019-9d99-411a-8739-65d3d1eb13bd`；
- pool：`13e60019-9d99-411a-8739-65d3d1eb13bd`（完整领域池子）；
- error：`APK_POOL_HAS_NO_ELIGIBLE_OPTIONS`；
- 每个 option 的 requirement 均为未接入的 `lacksDomain`。

这不是 `formal-special-result` handler 失败。此前 handler 已实际完成商店池、机遇池和完整领域结果，并进入本领域池。

## 源证据

真实 route graph 中 `douluo1` 和 `douluo2` 均有相同的 28 个完整领域选项。每个选项的 source 结构是：

```json
{
  "requirements": [{ "type": "lacksDomain", "value": "蓝银领域" }],
  "effects": [{ "type": "addDomain", "domainId": "蓝银领域" }]
}
```

APK 源模块 `apk-analysis/E4FB340E/derived/pretty/douluo1-pack-C6xEgEus.js` 也用同一结构生成领域池：`lacksDomain` 检查领域集合，`addDomain` 写回同名领域。当前 typed character 已有 `domains: []` 字段，因而不需要引入新的状态猜测。

## 已接入

`js/apk-content-adapter.js` 现在：

- 登记 `lacksDomain` requirement type；
- `domains` 不是数组时返回结构化 `unresolved`；
- `domains` 不包含目标领域时返回 `met`；
- 已包含目标领域时返回 `not_met`。

因此池选择器会先过滤已经拥有的领域，再按 APK 原始权重抽取剩余领域；提交 `addDomain` 后下一次同领域选项会自然失去资格。

## 自动验证

- requirement 单元测试覆盖：缺少状态、未拥有、已拥有三种结果；
- 真实完整领域池 smoke：成功抽取并提交一个领域，`character.domains` 只新增该领域一次，下一 flow 为 `douluo1:flow.formal-human.scheduler`；
- 全量 `npm.cmd test`：`204 passed, 0 failed`。

## 下一次人工验收

刷新 `file:///D:/0CODE/douluo-life/apk-route-demo.html`，使用默认 seed `apk-route-demo-seed`，沿此前路径推进到完整领域池：

- 不应再出现 `APK_POOL_HAS_NO_ELIGIBLE_OPTIONS`；
- `lastSpin.poolId` 应为 `13e60019-9d99-411a-8739-65d3d1eb13bd`；
- `lastSpin.optionId` 应为 28 个领域中的一个；
- 提交后 `character.domains` 应新增该领域，routeStatus 应为 `ready`；
- 控制台无异常。

本次只接入了有明确 source 结构的 `lacksDomain`，未扩大到其他未登记 requirement。
