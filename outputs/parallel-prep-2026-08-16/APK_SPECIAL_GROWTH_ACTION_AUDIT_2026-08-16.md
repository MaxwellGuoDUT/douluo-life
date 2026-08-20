# APK douluo1 formal-special-growth action 审计

日期：2026-08-16

状态：`source_proven_special_growth_connected / formal_special_result_connected_with_explicit_combat_boundary / store_route_smoke_passed / browser_control_unavailable`

## 审计对象

- action：`douluo1:action.formal-special-growth`
- flow：`douluo1:flow.formal-special-growth`
- APK 源文件：`apk-analysis/E4FB340E/derived/pretty/douluo1-pack-C6xEgEus.js`
- 分组与等级池来源：`apk-analysis/E4FB340E/derived/pretty/human-foundation-CduvzjjO.js`
- 运行时桥接：`js/apk-special-growth-runtime.js`、`js/apk-route-runtime.js`
- 证据摘要：`data/apk-canonical/catalogs/special-growth-runtime-evidence.json`
- 特殊结果证据：`data/apk-canonical/catalogs/formal-special-result-runtime-evidence.json`
- APK SHA-256：`E4FB340E0DAD857A018E2F06982D32623BDD683B22BD44230A2257C35DAA11C`

本审计为静态源码映射，未执行 APK 原始 gameplay。运行时只使用已物化的 route graph 与 source-proven typed effect。

## 源码证明的选择语义

源码 handler 先刷新 `formal:suppress-encounter`，再按身份组和等级段返回 `douluo1:flow.special.<poolId>`：

1. 身份缺失时使用 `douluo2:identity.have-nothing`；该身份归入“一无所有”组。
2. `talentProgression.talentGrade === "F"` 时强制使用“一无所有”组，覆盖当前身份组。
3. 其余身份按源码 `la` 映射到 4 个普通组：平民/自由魂师/宗门弟子、旅行者/重生者/气运之子、骑士/神之子/神祇转世、贵族/皇室。
4. 一无所有组使用 12 段规则：`level 0 => tier 1`；其余为 `min(12, floor((level - 1) / 10) + 2)`。
5. 其他身份组使用源码规则：`min(11, (floor(max(1, level) - 1) / 10 + 1) | 0)`。
6. 56 个等级池 target 保留 APK 原始 pool ID；route graph 中对应 `flow.special.<poolId>` 均存在。
7. 源码 `El/Rg` 的副作用按 typed `setFlag` 写入：仅当 `identity:suppress-encounter-before-12 === true && age < 12` 时，`formal:suppress-encounter` 为 `true`。

## 已接入的运行时语义

- 新增 `planFormalSpecialGrowth`，只响应 `douluo1:action.formal-special-growth`。
- target 在 effects 提交前校验；目标不存在、身份无映射或等级无对应池时显式报 `APK_ROUTE_DYNAMIC_SOURCE_GAP`，不猜测替代池。
- suppression flag 使用已有 `setFlag` typed effect，保持与 APK handler 的状态副作用一致。
- route runtime 的 dynamic transition 仍保持原子性；draw 失败会恢复完整 session。
- 已接入 `douluo1:handler.formal-special-result` 与 `douluo1:action.after-formal-special-result`：规则来自独立 source evidence package，不从 route option 的空 effects 猜测结果。
- 无战力门槛的规则按 source `commonEffects + effects/failureEffects/lawCompletionEffects` 提交；`formal:element-draws`、`formal:domain-draws` 的 source numeric flag 会转换为 typed counter effect。
- 成功后只在目标池存在可用 option 时进入 `douluo1:flow.special.<nextPoolId>`；否则写入 source next-flow flag 并回到 scheduler；F 级天赋在无特殊池续接时按 source 推进 1 年。
- `after-formal-special-result` action 消耗并清理 next-flow flag；机会次数大于 0 的身份/等级机会池回跳仍显式保留为 unresolved。
- 440 条依赖 APK 战力总值的规则仍报 `APK_ROUTE_SPECIAL_RESULT_COMBAT_POWER_UNRESOLVED`，没有混入旧 `js/combat-power.js` 或自行估算。

## 自动验证

- targeted route/runtime + loader：`25 passed, 0 failed`。
- 全量回归：`202 passed, 0 failed`。

新增覆盖：

- 默认/一无所有身份的 7 级 E 级天赋命中 tier 2：`96127132-31a6-4525-b568-2167d93a41cf`；
- 年龄 6 且前置 suppression flag 为 true 时，运行时写入 `formal:suppress-encounter: true`；
- 皇室身份命中贵族组 tier 1：`57c7d168-2ffd-4181-bc90-9b91cf9f8e41`；
- F 级天赋覆盖皇室身份并回到一无所有组 tier 2；
- 未映射身份的 source gap 与 draw 原子回滚；
- formal select-martial 的 C 级兽武魂 canonical pool ID 修复回归；
- 真实 route graph 的 `57c7d168-2ffd-4181-bc90-9b91cf9f8e41 / 228beb`（“商店池”）精确提交：source log 写入一次、base route effects 保持为空、next-flow flag 写入 `douluo1:flow.special.6fdecf1d-ba27-415a-91a1-8837807134e8`。
- after-result action 清理 flag，并在默认 0 铜灵币状态下抽到后续池 option `454356`；未出现 custom-handler boundary。

## 真实 route smoke

使用真实 `douluo1` route graph、年龄 7、等级 7、E 级天赋、无身份背景、`identity:suppress-encounter-before-12 = true` 可到达特殊成长池；另使用 source evidence 对固定池/选项做精确结果 smoke：

- `douluo1:action.formal-special-growth` 实际解析到 `douluo1:flow.special.96127132-31a6-4525-b568-2167d93a41cf`；
- 实际抽取池为 `96127132-31a6-4525-b568-2167d93a41cf`；
- `formal:suppress-encounter` 实际写入 `true`；
- `228beb` 的 source rule 为无条件成功、添加日志“商店池”、后续池为 `6fdecf1d-ba27-415a-91a1-8837807134e8`；
- 提交后先进入 `douluo1:flow.after-formal-special-result`，再由 action 解析到该后续特殊池；
- 默认钱包为 0 时，后续池的 `454356`（`currencyBelow: 1`）可用，结果 handler 仍可继续回到 after-result/scheduler 语义。

## 下一次人工验收

请在独立 APK route demo 中确认特殊成长结果，并记录：

- 是否能看到 `douluo1:flow.formal-special-growth` 后的特殊成长池；
- 显示的目标 flow / pool 是否为当前测试所到达的 source pool；
- `formal:suppress-encounter` 是否按角色年龄和身份前置 flag 更新；
- 选择 `228beb / 商店池` 后，是否不再出现 `APK_ROUTE_DYNAMIC_OPTION_UNRESOLVED`；
- `lastSpin` 是否显示后续 `douluo1:flow.special.6fdecf1d-ba27-415a-91a1-8837807134e8` 与 option `454356`；
- route JSON 的 `dynamicHistory` 是否记录 `douluo1:handler.formal-special-result` 与 `douluo1:action.after-formal-special-result`；
- routeStatus、控制台异常和最终结论。

本次未宣称 Browser 自动控制或浏览器控制台已验证；这些仍为 `unavailable / unverified`。

## 保留的下游边界

- 440 条依赖 APK 战力总值的正式特殊成长规则；
- 机会次数大于 0 时按身份/等级选择机会池的 `after-formal-special-result` 回跳；
- 骑士王座特殊成员/奖励池映射仍未接入独立 typed runtime；
- `humanPrimaryRingAge*` / `humanSecondaryRingAge` 后续 ring resolver、魂环类型和 custom handlers；
- formal story option 的 `douluo1:handler.formal-story.result`；
- `douluo1:action.formal-human.complete`；
- `humanPrepareSoulBonePart` 后续动作；
- foundation 中存在但最终 pack 未导出的 `humanEarlyRingDomain` possibleNext。

因此，“formal-special-growth action 与无战力门槛的特殊结果 handler 已连接”不等于“战力判定分支、机会回跳或 APK 全部正式剧情已自动可达”。
