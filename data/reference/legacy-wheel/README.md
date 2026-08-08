# 旧版转盘表 JSON 整理

> **REFERENCE DATA ONLY**：本目录不是 production 内容；转换结果与推断仅供核对和迁移参考。`inferred` 不等于 `confirmed`，未经人工确认不得升级为正式游戏数据。

本目录保存 `0.1初版汇总.xlsx` 的无损转换结果和基于内容做出的逻辑推断。

这里的核心解释是：

- 每个 `WheelID` 都是一个转盘节点。
- `Title` 中的“你选择”是叙事表达，不表示玩家手动选择。
- 一次年度活动可以连续触发多个转盘，例如门槛、数量、内容和结果转盘。
- 原表没有保存完整的跳转图，因此确定数据与推断数据必须分开。

## 文件

### `legacy_rows.json`

原表逐行转换结果。保留原始 `WheelID`、标题、选项序号、文本、权重和 Excel 行号。

这是核对转换是否丢失内容的底稿，不建议直接供游戏运行。

### `wheels.normalized.json`

按 `WheelID` 聚合后的 510 个转盘。

每个转盘包含：

- 统一的转盘 ID；
- 原始 `WheelID`；
- 功能类型提示；
- 所属路线提示；
- 权重完整性信息；
- 原始选项；
- 仅依据编号顺序生成的低置信度后继提示。

选项中的 `nextWheelId` 和 `effects` 均保持 `null`，因为原表没有提供这些信息。

### `flows.inferred.json`

目前能够较可靠还原的复合转盘流程，包括：

- 武魂数量、类别与具体武魂；
- 特殊天赋获取；
- 特殊经历获取；
- 原著剧情干预次数；
- 魂师精英大赛；
- 杀戮之都。

其中 `confidence` 表示推断可信度。

### `routes.inferred.json`

根据 ID 区间、标题和主题整理出的 20 个共享区或剧情路线。

`orderedWheelIds` 只代表内容上的候选顺序，不代表原项目真实的逐项跳转关系。

### `conversion_report.json`

转换校验、权重模式、同池重复项和重复标题报告。

## 权重处理

- 正数权重：当一个转盘的所有选项都有明确权重且总和大于 0 时，计算概率。
- 空权重：保持 `null`，不擅自解释为 0 或 1。
- 零权重：保留原项，并标记 `legacyDisabledHint: true`。
- 混合权重：不计算概率，等待人工确认原游戏默认值规则。

## 重新生成

```powershell
python tools/convert_legacy_wheels.py `
  --input "D:\0CODE\json\0.1初版汇总.xlsx" `
  --output-dir "data\reference\legacy-wheel"
```

转换器只使用 Python 标准库读取 XLSX 内部 XML，不会修改源工作簿。
