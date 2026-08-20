# APK 正式特殊成长战力边界批次审计

日期：2026-08-17

## 批次结论

当前批次状态：`automated-verified / awaiting browser acceptance`。

本批次关闭的边界是：

```text
APK_ROUTE_SPECIAL_RESULT_COMBAT_POWER_UNRESOLVED
```

它不是路线图接线错误。APK 正式特殊成长 handler 在静态 bundle 中明确执行：

```text
combatPower = APK combatPower.total(character)
success = combatPower >= combatThreshold
```

当来源规则的运算符为 `>` 时使用严格大于；否则使用 `>=`。本次错误发生在 `f4d48cb4-7f96-4153-addb-1570b9781a26 / 27c4ae`，来源阈值为 `47 >=`。

## 来源证据

新证据包：

`data/apk-canonical/catalogs/combat-power-runtime-evidence.json`

- schema：`apk-combat-power-evidence/1.0`
- 提取方式：`static_source_mapping_only`
- 未执行 APK gameplay
- 包含 APK 等级/修为曲线、魂环/魂骨年限与品质倍率、武魂品质集合、魂环类型/物种集合、属性/领域/魂核/神器/神装/状态修正常量和字段映射
- APK 源哈希：`E4FB340E0DAD857A018E2F06982D32623BDD683B22BD44230A2257C35DAA11C`
- 证据包 SHA-256：`CE15F74E4573886832C254CB90D05F7105C9AAAEF49E8FBA6BC2218B3E7462CE`

来源模块哈希已写入证据包：

- `App-qyLEl8t4.js`：`05EA991B3AB0BB7F475F0686D7CB21AEB8934B539C3190D050A3CAF45214FC09`
- `douluo1-pack-C6xEgEus.js`：`CD025DBAF024BCCD90B4601B3DAE0850DBE7907CEC9F38AA0ED40D64E3C3E166`
- `human-foundation-CduvzjjO.js`：`0AABF5E741403FF75BB0192D2661A28179612D095A49C67E03F7E8B46B77EC99`

## 实现内容

- 新增 `js/apk-combat-power-runtime.js`，按 APK `combatPower.total` 的来源步骤实现 typed adapter。
- 正式特殊成长 handler 接入来源战力证据，支持 `>=` 和 `>` 两种来源比较。
- 补齐来源失败原子性：低于战力阈值时使用 `failureEffects`；存在 `deathThreshold` 时按来源总战力判断是否允许失败效果。
- 保留 APK 的 `formal:last-combat-lost` 标记语义。
- production loader、production entry、package index 和 route demo 均接入战力证据包。
- 缺少证据包或证据定义不完整时仍返回结构化边界并恢复完整 session，不使用项目旧的 provisional 战力公式代替。

## 自动验证

```text
npm.cmd test
218 passed / 0 failed
```

新增针对性测试覆盖：

1. 证据包校验；
2. 47 点等值边界的 `>=` 成功；
3. 低于阈值时失败效果与铜币 0 下限；
4. `>` 的严格比较；
5. 缺失战力证据时的明确边界与 session 回滚。

固定锚点自动验证结果：

```text
level = 24
ordinary martial soul = 4
50-year soul ring = 1
APK total combat power = 47
```

因此 `27c4ae` 在等值 47 时按 APK 来源判定为成功。

## 人工验收

请重新加载 `apk-route-demo.html`，选择 `douluo1`，使用之前触发该边界的相同 seed 和操作路径，推进到：

```text
poolId  = f4d48cb4-7f96-4153-addb-1570b9781a26
optionId = 27c4ae
```

检查：

1. 不再出现 `APK_ROUTE_SPECIAL_RESULT_COMBAT_POWER_UNRESOLVED`；
2. 路线审计的正式特殊成长记录出现 `combatPower.total`、阈值和比较运算符；
3. 依据实际 total，铜币按成功/失败来源效果变化，失败时不低于 0；
4. 提交后 `routeStatus` 为 `ready`，下一 flow 先进入 `douluo1:flow.after-formal-special-result`；再次推进后按来源 action 回到 scheduler 或明确后续特殊池；
5. 控制台无异常，路线 JSON 无静默补线。

本报告不把浏览器结果预先标记为已验证；当前仅为自动验证通过，等待人工验收。

## 下一边界

本批次只关闭 APK 总战力驱动的正式特殊成长判定，不代表 APK 全路线已经闭环。其他未登记 custom handler、正式故事结果、机会池回跳、魂兽路线和更深层终局仍应继续以明确兼容边界处理。
