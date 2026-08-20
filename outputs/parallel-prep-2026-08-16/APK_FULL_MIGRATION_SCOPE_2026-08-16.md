# APK 全量内容与规则迁移范围

日期：2026-08-16

状态：owner_decision_recorded / implementation_in_progress

## 已确认决策

负责人已确认：

1. APK 知识产权完全归项目所有，可直接使用 APK 来源数据。
2. 既有武魂和魂兽设定不再作为 production 真源。
3. 武魂、魂兽、觉醒概率、形态/品质、effects、requirements、剧情时间线及相关结局数据同时切换到 APK 来源。
4. APK 全部记录保留，但每条记录继续携带 APK 原始可用性状态，不把 base、auxiliary、dormant、legacy-source-only 等状态压平。

## 真源优先级变更

在上述内容域中，新的优先级为：

~~~text
APK 原始数据与原始可用性状态
→ APK 结构化抽取/迁移层
→ production 运行时适配层
~~~

既有 271 项武魂目录、既有魂兽设定和旧概率配置保留为历史归档或兼容对照，不再作为新的主模式内容真源。不得删除原文件，也不得用新数据覆盖旧归档。

## 全量保留规则

全量保留不等于全量启用。迁移层必须保存：

- APK 原始 pool、option、weight、enabled 和 content_status；
- 魂兽 route_state、source_layer、has_structured_semantics；
- pool status、pool_kind、formal 标记和 option 的 ending_like/death_like；
- 原始 source dataset、option ID、effect、requirement、next 和时间线字段；
- 无法映射到 Player v2 的字段及其 schema gap。

运行时按 APK 原始可用性判断是否进入候选池、正式池、辅助池或 dormant 路由；不得因为迁移方便而统一设置为 enabled 或 production。

## 不自动改变的边界

“全量迁移 APK 数据”不自动等同于：

- 复制 Android 外壳、Hook、加固组件或无关资源；
- 删除 Player v2；
- 把派生战力写入 Player；
- 放弃年度原子提交；
- 把 APK 缺失入口或控制流缺陷当作合理规则；
- 用猜测填补 APK 字段与 Player v2 字段之间的语义缺口。

如 APK effect 或 requirement 与现有 Player v2 不兼容，先进入 typed adapter 或 unresolved/compatibility-gap 清单，不能静默改写语义。

## 当前迁移规模

| 数据域 | 当前规模 | 原始状态重点 |
| --- | ---: | --- |
| APK 武魂 | 584 条 | 14 个 pool/category，当前 584 条均标记 enabled |
| APK 原始魂兽 | 243 条 | current-base 215、auxiliary 12、router-only-dormant 16 |
| 结构化魂兽 | 107 条 | 4 条 schema gap 非空 |
| pools | 4,781 条 | 250 条 formal，156 个池包含禁用 option |
| options | 41,637 条 | 41,241 enabled、396 disabled |
| effects | 19,126 条 | 48 类 effect |
| requirements | 2,848 条 | 18 类 requirement |
| 剧情时间线 | 107 条 | 2 个 world、4 个 branch，存在文本年龄条件 |
| 结局/死亡 | 1,580 条 | ending_like 916、death_like 1,418 |

## 迁移阶段

1. 冻结并归档当前 production 内容与配置。`已完成：archive manifest + SHA-256`
2. 建立 APK canonical data package，保持原始 ID、来源、可用性和状态。`已完成`
3. 建立 effect/requirement/route 的 typed adapter 与 compatibility-gap 报告。`已完成：typed runtime + route graph + route runtime bridge + gap report`
4. 按 APK 状态接入武魂、魂兽、觉醒、pool 和剧情 registry。`canonical package、source route registry、canonical supplemental effects、首段动态 bridge 与斗一正式基础武魂 custom-handler 已完成；觉醒/变异上下文与 Player v2 bridge 待后续切片`
5. 替换 production 入口，保留旧目录为 archive-only。`数据入口与独立 APK 路线入口已完成；setStoryBranch、scheduler action 与 special-growth action 首段已接入，下游 formal-special-result、ring/story/complete handler 仍保留边界`
6. 进行 schema、权重、同 seed、原子失败、route、战力和浏览器验收。`自动回归已完成（201/201）；独立 APK 路线 UI、武魂基础 handler 与 scheduler surface 已通过用户手动验收，special-growth action 待本次人工验收，Browser 控制仍不可用`

## 当前实现证据

- 活动入口：`data/production-entry.json`。
- 运行时：`js/apk-rule-runtime.js`、`js/production-content-loader.js`。
- route bridge：`js/apk-route-runtime.js`。
- 独立路线入口：`apk-route-demo.html`（旧 `v2-demo.html` 保持不变）。
- 路线图：[route-graph.json](/D:/0CODE/douluo-life/data/apk-canonical/catalogs/route-graph.json)。
- 路线提取器：`outputs/parallel-prep-2026-08-16/extract-apk-route-graph.mjs`。
- 武魂 handler 证据：`data/apk-canonical/catalogs/martial-soul-runtime-evidence.json`。
- 武魂证据提取器：`outputs/parallel-prep-2026-08-16/extract-apk-martial-soul-runtime-evidence.mjs`。
- story branch effect 审计：[APK_STORY_BRANCH_EFFECT_AUDIT_2026-08-16.md](/D:/0CODE/douluo-life/outputs/parallel-prep-2026-08-16/APK_STORY_BRANCH_EFFECT_AUDIT_2026-08-16.md)。
- scheduler action 审计：[APK_SCHEDULER_ACTION_AUDIT_2026-08-16.md](/D:/0CODE/douluo-life/outputs/parallel-prep-2026-08-16/APK_SCHEDULER_ACTION_AUDIT_2026-08-16.md)。
- scheduler 证据：[scheduler-runtime-evidence.json](/D:/0CODE/douluo-life/data/apk-canonical/catalogs/scheduler-runtime-evidence.json)。
- special-growth action 审计：[APK_SPECIAL_GROWTH_ACTION_AUDIT_2026-08-16.md](/D:/0CODE/douluo-life/outputs/parallel-prep-2026-08-16/APK_SPECIAL_GROWTH_ACTION_AUDIT_2026-08-16.md)。
- special-growth 证据：[special-growth-runtime-evidence.json](/D:/0CODE/douluo-life/data/apk-canonical/catalogs/special-growth-runtime-evidence.json)。
- select-martial 修复记录：[APK_MARTIAL_SELECT_ACTION_FIX_2026-08-16.md](/D:/0CODE/douluo-life/outputs/parallel-prep-2026-08-16/APK_MARTIAL_SELECT_ACTION_FIX_2026-08-16.md)。
- 验证报告：`outputs/parallel-prep-2026-08-16/APK_MIGRATION_RUNTIME_VERIFICATION_2026-08-16.md`。
- 旧内容归档索引：`data/v2/archive/apk-replaced-2026-08-16/manifest.json`。

本文件只记录范围和决策，不代表已经完成 production 迁移或 Git 交付。
