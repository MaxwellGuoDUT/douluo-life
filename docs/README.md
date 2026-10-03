# 文档导航

最新产品状态以 [仓库首页](../README.MD)为准。本文区分现行维护入口、验证记录和历史设计，避免旧文件里的“当前”被误用。

## 现行入口

| 需要了解什么 | 阅读 |
| --- | --- |
| 当前玩法、入口和已知限制 | [README](../README.MD) |
| 本地运行、修改和提交 | [CONTRIBUTING](../CONTRIBUTING.md) |
| 各版本改变了什么 | [CHANGELOG](../CHANGELOG.md) |
| 开发经过与关键取舍 | [DEVLOG](DEVLOG.md) |
| 分支、发布和待整理事项 | [MAINTENANCE](MAINTENANCE.md) |
| 成神飞升、UI 和 V1.0.1 证据 | [验证报告](evidence/V10_ASCENSION_CLOSURE_2026-09-30.md) |

验证报告各节保留当时事实；较晚章节可能更新较早结论。它不是所有路线已验证的声明，发布事实还需对应提交与 Release。

## 当前代码入口

```text
index.html → js/v10-app.js
                 ├─ v10-display.js → 角色／转盘显示和源年龄投影
                 ├─ v10-history-view.js → 50条窗口和页锚点
                 ├─ v10-content-loader.js → data/v10/source-manifest.json
                 ├─ v10-life-runner.js → v10-human-runner.js / APK runtime
                 └─ v10-save-store.js → localStorage 八槽及 JSON 导入导出
```

| 路径 | 维护含义 |
| --- | --- |
| index.html | 当前游戏 HTML；v10.html 兼容旧链接 |
| js/v10-*.js、css/v10.css | 当前界面、流程、加载和存档 |
| js/apk-*.js、data/apk-canonical/ | 当前或历史流程仍依赖的共用规则与内容 |
| data/v10/、tools/v10/ | 当前来源产物及生成／审计工具 |
| test/、test/fixtures/ | 回归与固定历史输入，不进入玩家存档 |
| outputs/parallel-prep-2026-08-16/ | package.json 和测试仍引用的旧生成工具及来源清单 |
| v05-demo.html、v2-demo.html | 历史演示，保留兼容与回归 |
| docs/tasks/、docs/review/ | 任务及审阅历史，不自动构成新一轮实施指令 |

## 历史文档

以下按当时日期和阶段阅读，其中“当前／下一步”不能直接套用到 V1.0.1：

- [AI_CONTEXT](AI_CONTEXT.md)：早期 V1/V2 架构快照。
- [08 月状态基线](CURRENT_PROJECT_STATUS_2026-08-20.md)、[08-07 审阅](PROJECT_STATUS_AND_REVIEW_BRIEF_2026-08-07.md)、[08-02 状态](PROJECT_STATUS_FOR_WEB_CHATGPT_2026-08-02.md)。
- [V0.5 Demo](V05_DEMO.md)、[Day12 日志](CODEX_DAY12_V2_VERTICAL_SLICE_LOG.md)。
- [V2 决策](DECISION_RECORD_V2.md)、[V2 Player](PLAYER_STATE_V2.md)、[流程模型](WHEEL_FLOW_MODEL.md)。
- [早期事件规范](EVENT_SCHEMA.md)、[V2 草案](EVENT_SCHEMA_V2_DRAFT.md)、[战力系统](COMBAT_POWER_SYSTEM.md)。
- 根目录 [Day11 任务书](../CODEX_DAY11_PLAYER_V2_FLOW_FOUNDATION.md)与 [V2 规划](../CODEX_NEXT_STAGE_V2_COMBAT.md)已标为历史。

本次通过导航和历史标记整理，不移动文件，保留原引用、测试与负责人材料。历史记录中的本机路径或未提交任务书仅供追溯，克隆仓库不保证包含。

当前本地维护候选：[2026-10-04标题／年龄／性能报告](evidence/V101_D2_BEAST_PERFORMANCE_2026-10-04.md)。显示与记事模块单向依赖，app保留唯一会话协调；候选不等于正式发布。
