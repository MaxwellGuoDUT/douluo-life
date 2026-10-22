# 斗罗人生模拟器

[![CI](https://github.com/MaxwellGuoDUT/douluo-life/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/MaxwellGuoDUT/douluo-life/actions/workflows/ci.yml)

斗罗大陆题材的纯前端人生转盘游戏，使用 HTML、CSS、原生 JavaScript 和 JSON 构建。

**[开始游戏](https://maxwellguodut.github.io/douluo-life/)** · [V1.2.0 更新说明](docs/V1.2.0_RELEASE_NOTES.md) · [反馈问题](https://github.com/MaxwellGuoDUT/douluo-life/issues)

## 当前版本：V1.2.0

V1.2.0 将年代与身份都交给转盘：第一转等概率抽取斗罗一／绝世唐门，第二转等概率抽取人类／魂兽，不再手动指定。固定种子可复现开局；现有存档和同种子重播沿用原年代与路线。沿用 V1.1.0 的 /8 存档语义及 V1.1.2 长局优化。详见 [V1.2.0 更新说明](docs/V1.2.0_RELEASE_NOTES.md)，正式归档状态以 [GitHub Releases](https://github.com/MaxwellGuoDUT/douluo-life/releases) 为准。

站点根首页直接运行当前游戏。旧的 [`v10.html`](https://maxwellguodut.github.io/douluo-life/v10.html) 链接会返回根首页，继续有效。

- **双时代、双路线**：斗罗大陆 I（`douluo1`）与绝世唐门（`douluo2`），转盘先等概率抽取时代，再等概率抽取人类或魂兽人生；化形仍由人生事件触发。
- **真实转盘**：复用当前角色状态、源选项及权重；显示大转盘、抽取结果和选项。魂师以等级、武魂与魂环为核心，魂兽展示物种、血脉、修为年限与实际年龄。
- **集中角色信息**：白底居中单列，角色、命运记事、本地存档通过抽屉查看。
- **推进与重抽**：单次转动、可暂停的串行自动推进、每批最多 200 次的极速推进，以及仅撤销最新一次抽取的重抽。重抽仍可能得到相同结果。
- **新命运**：结束当前人生并回到年代与身份转盘，清空当前种子；不会删除已保存槽位。
- **本地存档**：手动 localStorage 8 槽、JSON 导入与导出、覆盖确认。没有账号、云同步或后端，未手动保存的进度不会自动保留，请主动导出备份。

年代和身份抽取使用独立随机域，不消耗人生事件的随机游标。化形仍由人生事件触发。

## 可玩范围与已知限制

- 普通神考四层级33阶段、海神岛23奖励阶段及独立海神九考已接入，九考采用项目确认规则。V1.1.1 取得自然完整九考证据，黄级自然完成仍缺，不宣称全部随机路线均已验证。
- 部分来源内容仍有安全中断边界；魂骨部位全部占满后的待奖励可保存、恢复和导出，但后续结算规则尚未明确，推进会停止。
- 成神与飞升是少数人生的终极成就，不保证发生。人类寿命按当前规则结算；魂兽修为年限与实际年龄分别显示。
- 旧版斗一存档可能因内容语义不兼容被明确拒绝，不自动迁移或覆盖。请保留原导出文件。
- 相同种子与相同操作可复现人生；“同种子重播”从开局开始，不包含本次页面上的重抽操作。刷新、读档或新命运会清除当前撤销机会。

## V1.1.0 维护记录

本版更新范围、存档变化与保留限制见[V1.1.0 发布说明](docs/V1.1.0_RELEASE_NOTES.md)。以下保留各轮实现与验证记录，正式发布状态以对应 tag 和 Release 为准。

2026-10-04 本地修正版改善斗二魂兽标题，按来源字段显示实际年龄，记事每页最多50条并保留全部存档历史。检查点减少一次复制，职责拆分独立按可维护性验收；原设备卡顿和长尾提速尚未证实。详见[本地验证报告](docs/evidence/V101_D2_BEAST_PERFORMANCE_2026-10-04.md)。此轮维护成果纳入 V1.1.0。

原始备份：存档面板新增“导出原始备份”，用于保留旧版或损坏槽位的原始文本。该文件未经校验，不保证可读取；正常导出、读取和导入仍保留校验，备份不会改写任何槽位。此改动纳入 V1.1.0。

2026-10-13 本地候选接入 owner 批准的海神独立九考：资格取得后立即开始，独立领奖，只与修罗共存；继承后可选择继续人生或直接飞升。这是项目补充规则，不宣称还原 APK 未明确的九考奖励。斗一运行语义为 `/8`，此前 `/7` 存档保留原始备份并在原版本继续，不自动迁移。实现与验收见[九考实施报告](docs/evidence/SEA_GOD_NINE_TRIALS_IMPLEMENTATION_2026-10-13.md)。

浏览器后续补验见[九考浏览器验收报告](docs/evidence/SEA_GOD_BROWSER_ACCEPTANCE_2026-10-13.md)：人类、化形后九考及修罗共存已取得真实浏览器与完整快照证据。2026-10-14 又完成[原生覆盖与实际粘贴补验](docs/evidence/BROWSER_NATIVE_CLIPBOARD_RECOVERY_2026-10-14.md)：取消保留A与当前B、确认覆盖后刷新主动读取、真实复制粘贴均已核对；自然完整九考、自然黄级完成和 owner 人工验收仍待补。

2026-10-14 [自然海考覆盖补查](docs/evidence/NATURAL_SEA_COVERAGE_2026-10-14.md)：8分钟预算内26局、13,001次调用，九考/黄级资格均未命中；顶级五考与黑级四考自然重放一致。该报告保留魂骨候选耗尽档读取失败的修复前事实；V1.1.0准备阶段已修复合法中断档恢复，详见[发布准备报告](docs/evidence/V110_RELEASE_PREPARATION_2026-10-14.md)。

## 项目文档

[版本变化](CHANGELOG.md) · [开发与贡献](CONTRIBUTING.md) · [文档导航](docs/README.md) · [开发日志](docs/DEVLOG.md) · [维护记录](docs/MAINTENANCE.md)

## 本地运行

ES modules 和 JSON 内容需要通过 HTTP 服务器访问。仓库根目录中运行：

```powershell
python -m http.server 8000
```

打开 [http://localhost:8000/](http://localhost:8000/)。无需框架或后端服务。修改 JS、JSON 或 css/v10.css 后，需运行 `npm run generate:v10-assets` 更新入口的资源版本绑定；`npm run check:v10-assets` 检查生成结果。

浏览器兼容：完整模块完整性校验的来源支持门槛为 Chrome/Edge 127+、Firefox 138+、Safari 18+。V1.1.1 已完成桌面 Chromium / Pages 资源及恢复检查，用户协助回报 Android 15 Chrome 新版正常；无 iOS 实测，旧页跨版本续跑未验。

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

`v05-demo.html` 和 `v2-demo.html` 保留为历史演示入口，不代表当前正式版本；其中的范围与存档方式不能套用于当前版本。
