# 斗罗人生模拟器

[![CI](https://github.com/MaxwellGuoDUT/douluo-life/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/MaxwellGuoDUT/douluo-life/actions/workflows/ci.yml)

斗罗大陆题材的纯前端人生转盘游戏，使用 HTML、CSS、原生 JavaScript 和 JSON 构建。

**[开始游戏](https://maxwellguodut.github.io/douluo-life/)** · [V1.0.1 更新说明](https://github.com/MaxwellGuoDUT/douluo-life/releases/tag/v1.0.1) · [反馈问题](https://github.com/MaxwellGuoDUT/douluo-life/issues)

## 当前版本：V1.0.1

站点根首页直接运行当前游戏。旧的 [`v10.html`](https://maxwellguodut.github.io/douluo-life/v10.html) 链接会返回根首页，继续有效。

- **双时代、双路线**：斗罗大陆 I（`douluo1`）与绝世唐门（`douluo2`），均可选择人类或魂兽人生。
- **真实转盘**：复用当前角色状态、源选项及权重；显示大转盘、抽取结果和选项。魂师以等级、武魂与魂环为核心，魂兽展示物种、血脉、修为年限与实际年龄。
- **集中角色信息**：白底居中单列，角色、命运记事、本地存档通过抽屉查看。
- **推进与重抽**：单次转动、可暂停的串行自动推进、每批最多 200 次的极速推进，以及仅撤销最新一次抽取的重抽。重抽仍可能得到相同结果。
- **新命运**：结束当前人生并回到时代与路线选择，清空当前种子；不会删除已保存槽位。
- **本地存档**：手动 localStorage 8 槽、JSON 导入与导出、覆盖确认。没有账号、云同步或后端，未手动保存的进度不会自动保留，请主动导出备份。

## 可玩范围与已知限制

- V1.0.1 修复了斗一人类流程、二级神考八考奖励与机会接续、授神后继续人生及自由成长飞升结算。其他斗一神考层级及海神奖励尚未完整开放，抽到后可能无法继续；不宣称全部源路线均已验证。
- 成神与飞升是少数人生的终极成就，不保证发生。人类寿命按当前规则结算；魂兽修为年限与实际年龄分别显示。
- 旧版斗一人类存档可能因内容语义不兼容被明确拒绝，不自动迁移或覆盖。请保留原导出文件。
- 相同种子与相同操作可复现人生；“同种子重播”从开局开始，不包含本次页面上的重抽操作。刷新、读档或新命运会清除当前撤销机会。

## 本地维护候选（尚未发布）

2026-10-04 本地修正版改善斗二魂兽标题，按来源字段显示实际年龄，记事每页最多50条并保留全部存档历史。检查点减少一次复制，职责拆分独立按可维护性验收；原设备卡顿和长尾提速尚未证实。详见[本地验证报告](docs/evidence/V101_D2_BEAST_PERFORMANCE_2026-10-04.md)。公开站点仍以现有发布为准。

## 项目文档

[版本变化](CHANGELOG.md) · [开发与贡献](CONTRIBUTING.md) · [文档导航](docs/README.md) · [开发日志](docs/DEVLOG.md) · [维护记录](docs/MAINTENANCE.md)

## 本地运行

ES modules 和 JSON 内容需要通过 HTTP 服务器访问。仓库根目录中运行：

```powershell
python -m http.server 8000
```

打开 [http://localhost:8000/](http://localhost:8000/)。无需框架、构建步骤或后端服务。

## 验证

使用 Node.js 24：

```powershell
npm test
```

入口及加载器的针对性检查：

```powershell
node --test test/v10-platform-smoke.test.js
```

完整套件覆盖运行时、随机性、生命周期及手动存档等行为。测试通过、浏览器验收和 Pages 部署是独立证据；源 vault 条件生成检查需要对应源文件，未配置且缺少默认 vault 时该项明确标记 SKIP；套件通过不代表全源路线完整性已经验证。

## 目录与维护

| 路径 | 用途 |
| --- | --- |
| `index.html` | 当前正式游戏首页，唯一游戏 HTML 入口 |
| `v10.html` | 兼容已有链接，跳转至根首页 |
| `css/v10.css`、`js/v10-*.js` | 当前界面、内容加载、人生流程与存档 |
| `data/v10/` | 双时代内容清单及源运行时数据 |
| `test/` | Node.js 回归测试 |
| `docs/evidence/` | 按日期记录的验证与交付证据 |
| `docs/DEVLOG.md` | 历史开发记录，按日期阅读 |

当前状态以本 README 和最新正式 [Release](https://github.com/MaxwellGuoDUT/douluo-life/releases/latest) 为准。发布时同步版本、首页和当前说明；旧任务书、历史日志及候选记录保留原有语境。

`v05-demo.html` 和 `v2-demo.html` 保留为历史演示入口，不代表当前正式版本；其中的范围与存档方式不能套用于 V1.0.1。
