# 阶段 1 实施准备包

日期：2026-08-16

状态：readiness_only / production implementation not started

## 结论

当前 production 基线稳定，可以在负责人完成内容审定后进入阶段 1；但阶段 1 的内容入口、年龄段 flow 和世界时期语义尚未进入 production。此文件只做文件映射、能力盘点和实施顺序准备，不代替负责人做内容决定。

## 当前已有能力

| 阶段 1 依赖 | 当前证据 | 状态 |
| --- | --- | --- |
| Player v2 基础状态 | js/player-v2.js 的 createPlayerV2、校验器和迁移测试 | confirmed baseline |
| 年龄字段从 0 开始 | Player.age 与 Player v2 校验器 | confirmed baseline |
| 6 岁 production 觉醒 | data/v2/content/age-6-awakening.json、js/production-awakening.js、js/v2-production-playtest.js | confirmed baseline |
| 共享品质一次抽取 | awakening-probabilities/1.2 与觉醒测试 | confirmed baseline |
| 0 级非战斗边界 | production 觉醒、战力和测试夹具 | confirmed baseline |
| 年度原子提交 | js/v2-session-runner.js、js/annual-session.js、失败注入测试 | confirmed baseline |
| 路线状态基础操作 | js/route-state.js 的 enter、advance、complete、fail、block | confirmed baseline |
| 天赋与战力分离 | js/talent-system.js、js/combat-power.js 与回归测试 | confirmed baseline |
| 未决池结构化返回 | data/config/talent.json 与 talent-system.js | confirmed baseline |

## 阶段 1 能力缺口

| 阶段 1 目标 | 当前状态 | 后续处理 |
| --- | --- | --- |
| 世界时期与 Player 年龄分离 | Player v2 当前有 age，但未发现 worldEra/timeline 的正式真源字段 | 先确认语义，再设计字段和迁移；不能从 APK 自动推断 |
| 出生地、出生身份、种族和外貌进入 Player 真源 | 身份抽取运行时存在于 talent/V3 侧，Player v2 基础对象尚未形成完整出生状态 | 依据负责人确认语义接入 Player v2 |
| 1～5 岁普通年度主循环 | 当前 production 内容 registry 只有 6 岁正式入口 | 需要阶段 1 内容确认后新增最小 flow |
| 7 岁初级学院、12 岁高级学院、18 岁成人路线 | 当前没有对应 production flow | 内容和路线入口确认后逐段接入 |
| seed 真正驱动所有抽取 | 年度 session 保存 seed，runner 接受注入 rng，但默认值仍为 Math.random | 设计并接入版本化 RNG adapter；不改变已有 6 岁规则语义 |
| 既有 route state 接入年度主循环 | 基础 route state 已有，按年龄解析 flow 的 resolver 已有；跨年龄 route/node 编排仍不足 | 只实现阶段 1 直接需要的最小操作 |
| 浏览器端 0～18 岁连续验收 | 当前只完成既有 production playtest 边界，未完成 0～18 岁真实点击流 | 阶段 1 runtime 与内容完成后单独验收 |

## 现有文件到后续变更的映射

以下是候选影响面，不代表现在已经授权修改：

| 能力 | 主要现有文件 | 预计新增/修改类型 |
| --- | --- | --- |
| Player 出生/时期状态 | js/player-v2.js、js/player-state-migration.js、对应测试 | schema、迁移、校验、兼容测试 |
| 确定性 RNG | js/annual-session.js、js/v2-session-runner.js、js/production-awakening.js | RNG adapter、seed/cursor 契约、重放测试 |
| 1～5 岁年度编排 | data/v2/content/、js/v2-annual-flow-resolver.js、js/v2-session-runner.js | 内容驱动 flow 与最小调度能力 |
| 7/12/18 岁 milestone | data/v2/content/、data/v2/examples/ 的 schema 参考、路线模块 | 经审定内容、flow/route 数据和测试 |
| 0～18 岁 UI | v2-demo.html、js/ui-v2-demo.js、js/v2-production-playtest.js | 玩家可见入口、状态展示、浏览器验收 |
| 回归与失败注入 | test/player-v2.test.js、test/annual-session.test.js、test/v2-production-playtest.test.js | 阶段 1 专项测试，不替代浏览器验收 |

## 建议实施顺序

1. 负责人确认第一条主线、出生语义和第一批采用内容。
2. 固定 worldEra、出生状态和 Player.age 的真源与迁移策略。
3. 接入版本化确定性 RNG，并保持现有 6 岁 production 觉醒回归通过。
4. 先实现 1～5 岁最小普通年度循环，再加入 7、12、18 岁明确入口。
5. 为每个新 flow 增加稳定 ID、来源、状态、同 seed 重放和原子失败测试。
6. 最后做 0～18 岁浏览器逐步点击、状态展示、防重复提交和控制台验收。

## 当前明确不做

- 不修改 data/v2/ production 内容；
- 不把 APK 或 legacy candidate 复制进 production；
- 不替空的 special/opportunity/soul-core 池发明内容；
- 不为了未来 APK effect 一次性重写通用引擎；
- 不把自动化通过等同于 browser verified；
- 不执行 stage、commit、push 或 PR。
