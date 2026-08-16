# APK 第一魂环闭环批次审计

日期：2026-08-17

## 批次结论

第一魂环闭环已完成自动验证，当前批次状态为：`automated-verified / awaiting browser acceptance`。

本批次覆盖：

```text
prepareSoulRing
  -> selectRingTypeStep
  -> selectSoulRingType
  -> finalizeSoulRingSpecies
  -> afterSoulRing
  -> soul-bone chance / soul-bone part
  -> humanPlan / scheduler
```

同时覆盖十万年魂环的早期成长分支及其额外魂骨奖励分支。

## 来源证据

### 魂环年限

- `human-soul-ring-runtime-evidence.json`
- APK 静态来源映射，未执行 APK gameplay
- 10 个来源魂环池，176 条记录
- 保留来源年限、权重、可用性、魂骨奖励标记和原始等级效果

### 魂环物种属性

- `human-soul-ring-species-runtime-evidence.json`
- 来源模块中的 `const $a`、`wt`、`pt` 和 `finalizeSoulRingSpecies` 映射
- 107 条来源规则，其中 63 条与 douluo1 route graph 的物种选项匹配
- 63 条匹配规则生成 typed `ensureHumanElementLevel` effects
- 未匹配的 44 条来源规则保留在证据包中，但不被强行接入路线
- 没有来源属性记录的物种不做文本推断

### 魂骨规则

- `soulBonePartCountBelow` 已接入要求适配器
- 保留普通部位单件限制和外附魂骨 100 件容量
- 正常魂环魂骨、魂骨概率、十万年额外魂骨均使用会话层 `pendingSoulBone`

## 实现内容

- route content index / production loader / production entry / package index 接入物种属性证据包。
- 接入 `selectSoulRingType`、`finalizeSoulRingSpecies`、`resolveSoulBoneChance`、`addPendingSoulBone`、`prepareEarlyBonusSoulBone`。
- 接入 `afterSoulRing`、`prepareSoulBonePart`、`resumeEarlyRingReward`、`prepareEarlyBonusSoulBonePart`。
- 修正无 option-level `next` 时回退到当前 flow 明确 `next` 的路由推进规则。
- 接入 `humanPlan -> scheduler` 的 source alias。
- Demo 的路线审计 JSON 现在显示 `pendingSoulBone`。
- 所有动态 handler 仍采用原子事务；失败时恢复完整 session，不静默补全。

## 自动验证

```text
npm.cmd test
213 passed / 0 failed
```

额外验证：

- 生产入口实际加载成功。
- route graph 校验通过，2 个内容包可见。
- 魂环年限证据 176 条，物种属性证据 107 条。
- 变更 JavaScript `node --check` 通过。
- 物种证据包 SHA-256：`2E237594F912AC5F5883C1002930B9DE9B03BB7092FDA430749C0824F91C071D`。

## 人工验收范围

打开 `apk-route-demo.html`，选择 `douluo1`，按路线推进到第一魂环分支，重点检查：

1. 年限结果之后能进入类型池，再进入对应物种池。
2. 物种确定后，角色魂环同时保留年限、类型、物种和来源文本；有来源属性的物种产生对应属性等级。
3. 魂环完成后能进入魂骨概率/魂骨部位分支，并回到 `humanPlan` / scheduler。
4. 十万年魂环进入早期成长池后，能回到同一魂骨结算链。
5. 路线 JSON 中没有静默跳过的边界，`routeStatus` 正常，控制台无异常。

本批次未做浏览器人工验收，因此不把浏览器状态标记为已验证。

## 下一边界

第一魂环闭环之外仍保持明确边界。后续具体由 seed 和路线选择决定，主要包括：

- `douluo1:handler.formal-story.result`；
- 正式故事完成/里程碑 action；
- official beast 的时间、战斗、元素和终局 handler；
- 机会池回跳和完整战力判定。

这些内容不属于本批次，当前仍应停在兼容边界，不做默认实现。
