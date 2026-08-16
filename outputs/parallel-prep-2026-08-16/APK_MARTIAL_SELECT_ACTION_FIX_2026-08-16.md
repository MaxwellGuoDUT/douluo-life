# APK douluo1 formal-human.select-martial 修复记录

日期：2026-08-16

状态：`source_proven_select_martial_connected / canonical_id_typo_fixed / real_seed_smoke_passed / next_boundary_formal_special_result / browser_control_unavailable`

## 问题定位

负责人使用 `apk-route-demo-seed` 运行到 `douluo1:flow.formal-human.select-martial` 时，页面显示：

`APK_ROUTE_DYNAMIC_SOURCE_GAP：斗一正式武魂天赋对应的武魂池或 flow 不存在。`

错误详情中的运行时 pool ID 为：

`24eda03e-beae-40f2-a7db-20b6318cd1c7`

但 canonical route graph 的 C/B 级兽武魂 pool 与 flow ID 均为：

`24eda03c-beae-40f2-a7db-20b6318cd1c7`

因此这是运行时常量的单字符拼写错误，不是 APK 源数据缺失，也不是浏览器缓存问题；本地使用相同状态已复现。

## 修复

已将 `js/apk-route-runtime.js` 中 `DOULUO1_MARTIAL_POOL_IDS.beastMiddle` 修正为 canonical ID，并新增 C 级兽武魂真实路径回归测试。

## 验证

- targeted route/rule tests：`28 passed, 0 failed`；
- 全量回归：`201 passed, 0 failed`；
- canonical C 级兽武魂路径：
  `douluo1:flow.formal-human.select-martial`
  → `douluo1:flow.formal-human.martial.24eda03c-beae-40f2-a7db-20b6318cd1c7`；
- 使用负责人相同 seed `apk-route-demo-seed` 的真实 route smoke 已通过武魂选择、after-martial、scheduler，并进入 `formal-special-growth`；
- 当前下一边界为 `APK_ROUTE_DYNAMIC_OPTION_UNRESOLVED`，customHandler 为 `douluo1:handler.formal-special-result`。

## 重新人工验收方式

请刷新 [apk-route-demo.html](/D:/0CODE/douluo-life/apk-route-demo.html)，选择 `douluo1`，保留 seed `apk-route-demo-seed`，从头点击“抽取并提交一步”。

本次不应再出现 `APK_ROUTE_DYNAMIC_SOURCE_GAP` 或 `24eda03e...`。推进到 special-growth 后，预期在特殊成长选项提交处出现明确的 `douluo1:handler.formal-special-result` 边界；记录该次的目标 flow、pool、routeStatus、控制台状态和结论即可。
