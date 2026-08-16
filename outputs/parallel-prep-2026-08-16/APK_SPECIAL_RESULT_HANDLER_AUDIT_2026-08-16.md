# APK douluo1 formal-special-result handler 审计

日期：2026-08-16

状态：`source_rules_recovered / typed_handler_connected / store_route_smoke_passed / combat_total_boundary_preserved / browser_control_unavailable`

## 审计对象

- custom handler：`douluo1:handler.formal-special-result`
- after-result action：`douluo1:action.after-formal-special-result`
- 源模块：`apk-analysis/E4FB340E/derived/pretty/douluo1-pack-C6xEgEus.js`
- 源规则数据：`apk-analysis/E4FB340E/derived/static-data/human-foundation-CduvzjjO/01804234-qn.json`
- 运行时：`js/apk-route-runtime.js`、`js/apk-rule-runtime.js`
- 证据生成器：`outputs/parallel-prep-2026-08-16/extract-apk-special-result-runtime-evidence.mjs`
- 活动证据：`data/apk-canonical/catalogs/formal-special-result-runtime-evidence.json`
- APK SHA-256：`E4FB340E0DAD857A018E2F06982D32623BDD683B22BD44230A2257C35DAA11C`
- 源规则数据 SHA-256：`3AB2DA7F75A967B813D0A3850AC35484C9683A60E6176C8144D7BD35C6759DA4`
- 证据包 SHA-256：`BFC70D2A324B5B25CF87F3C584ECF06039C5D004B84FAFD9A1CA5C7F5B997C00`

本审计是静态源码映射，未执行 APK 原始 gameplay。证据包只物化已恢复的源规则，不把旧 combat runtime 当作 APK 战力计算器。

## 源规则恢复结果

证据包 schema 为 `apk-formal-special-result-evidence/1.0`，覆盖 362 个池、2,710 条 option rule：

- 2,169 条无条件/非战力门槛规则；
- 91 条免疫元素门槛规则；
- 10 条完整法则分支规则；
- 440 条依赖 APK `ut.total(character)` 的战力门槛规则。

规则记录保留 source `requirements`、`commonEffects`、成功 effects、失败 effects、完整法则 effects 和 `nextPoolId`。source `tn` 对 `formal:element-draws`、`formal:domain-draws` 的 numeric `setFlag` 转换为 counter effect 的语义也在生成时固化。

## 已接入的运行时语义

1. route option 的 `douluo1:handler.formal-special-result` 通过 evidence package 按 `poolId:optionId` 查找源规则；缺证据时报 `APK_ROUTE_SPECIAL_RESULT_EVIDENCE_MISSING`。
2. 免疫规则使用 `character.elementProgress`；没有战力门槛的规则按 source 成功分支执行。完整法则元素达到 4 时优先使用 `lawCompletionEffects`。
3. base route commit 对该 handler 使用空 effects，避免 route graph 的 supplemental log 与 source qn effects 重复；source 结果由 typed effects 单独提交。
4. 成功且 `nextPoolId` 存在、并且目标池有可用 option 时，写入 `douluo1:flow.special.<nextPoolId>`；否则回到 `douluo1:flow.formal-human.scheduler`。F 级天赋在没有特殊池续接时按 source 推进 1 年。
5. `after-formal-special-result` action 读取并删除 `formal:d1-special-growth-next-flow`，再进入已解析的目标 flow。
6. handler、action、typed effects 任一步失败都会恢复完整 route session，不留下半提交状态。

## 已验证的固定 source 路径

池 `57c7d168-2ffd-4181-bc90-9b91cf9f8e41` 的 option `228beb`（“商店池”）源规则为：

- 成功条件：无额外条件；
- source effects：写入日志“商店池”；
- 后续池：`6fdecf1d-ba27-415a-91a1-8837807134e8`。

自动 smoke 已确认：

- 日志只写入一次，route history 的 base effects 为空；
- next-flow flag 正确写入；
- after-result action 清理 flag；
- 默认 0 铜灵币状态下，后续池可抽出 `454356`（`currencyBelow: 1`）；
- 未再出现 `APK_ROUTE_DYNAMIC_OPTION_UNRESOLVED`。

## 保留的明确边界

- 440 条战力门槛规则报 `APK_ROUTE_SPECIAL_RESULT_COMBAT_POWER_UNRESOLVED`，等待 APK `ut.total` 的独立、源一致实现；
- `formal:opportunity-draws > 0` 时，按身份/等级选择机会池的回跳仍报 `APK_ROUTE_SPECIAL_RESULT_OPPORTUNITY_UNRESOLVED`；
- 骑士王座特殊成员检测 `Al`、奖励池选择 `Ol(Pl(character))` 尚未接入独立 typed runtime；
- 后续 ring、story、complete、魂骨等 custom handler 不在本切片内。

这些边界保持显式，不以旧 combat power、文字猜测或默认池替代。

## 自动验证

- targeted route/runtime + loader：`25 passed, 0 failed`；
- 全量 `npm.cmd test`：`202 passed, 0 failed`；
- `node --check`：route runtime、rule runtime、证据生成器均通过；
- `git diff --check`：通过；仅提示既有 `index.html` 的 LF/CRLF 工作区换行提示。

## 负责人现场验收记录

负责人提供的 Demo 状态确认：

- `routeStatus = ready`；
- 路线历史实际包含 `228beb → after-formal-special-result → 6fdecf1d...`，并继续多次经过 `formal-special-result` 与 `after-formal-special-result`；
- `dynamicHistory` 实际记录了 `douluo1:handler.formal-special-result`、`douluo1:action.after-formal-special-result` 及其 typed effects；
- “商店池”“机遇池”等 source log 已写入，未在 formal-special-result handler 处停止；
- 当前新停止点为完整领域池 `13e60019-9d99-411a-8739-65d3d1eb13bd` 的 `lacksDomain` requirement，错误为 `APK_POOL_HAS_NO_ELIGIBLE_OPTIONS`；
- 控制台结果未在本次粘贴内容中提供，不能替负责人填写。

结论：`formal-special-result` 本切片人工验收通过；领域池 requirement 是下一切片的独立边界。

## 下一次人工验收

在修复 `lacksDomain` 后刷新 `file:///D:/0CODE/douluo-life/apk-route-demo.html`，使用默认 seed `apk-route-demo-seed`，沿此前已验收路径推进到完整领域池：

- 当前路线应能抽出 `douluo1:flow.formal-source.13e60019-9d99-411a-8739-65d3d1eb13bd`；
- `lastSpin.poolId = 13e60019-9d99-411a-8739-65d3d1eb13bd`；
- `lastSpin.optionId` 应为 28 个尚未拥有领域之一，不再出现 `APK_POOL_HAS_NO_ELIGIBLE_OPTIONS`。

提交该步后请确认：领域写入 `character.domains`、routeStatus、控制台和最终结论。

本次没有宣称 Browser 自动控制或浏览器控制台已验证；该部分仍为 `unavailable / unverified`，需要负责人手动记录 routeStatus 与最终结论。
