# 更新记录

面向玩家的版本变化。开发过程见 [DEVLOG](docs/DEVLOG.md)，当前玩法及限制见 [README](README.MD)。日期使用 Asia/Shanghai。

## 未发布 — 2026-10-04 本地维护候选

- 角色摘要和档案增加当前总战力，复用已有来源计算，无法可靠计算时明确提示。
- 极速运行时可暂停或取消本批；保留已完成的抽取、最近一次重抽和每批200次上限。
- 魂兽转盘读取原有来源名称，动态阶段提供玩家提示；开发ID移至诊断区。
- 实际年龄读取纯魂兽的 chronologicalAge；修为年限、时代和人类年龄分别保持源含义。
- 命运记事每页最多50条，保留更早页位置与完整历史。
- 复用成功事务的脱离快照供最近一次重抽，保持原子回滚和手动八槽。
- 拆分显示与记事职责；不以拆文件宣称提速，长尾和原设备卡顿仍待验收。

本地验证见[长局维护报告](docs/evidence/V101_D2_BEAST_PERFORMANCE_2026-10-04.md)及[战力与极速控制补充](docs/evidence/V101_COMBAT_FAST_CONTROLS_2026-10-04.md)，尚未发布。

## 未打新 tag 的 main 更新

以下变化发生在 v1.0.1 tag 之后，不改写已发布 tag：

- 根首页直接运行当前游戏，旧 v10.html 兼容跳转。
- README 和 package.json 对齐 V1.0.1。
- [PR #15](https://github.com/MaxwellGuoDUT/douluo-life/pull/15)、[PR #16](https://github.com/MaxwellGuoDUT/douluo-life/pull/16)；最终提交 c3d883a，2026-10-03。

## V1.0.1 — 2026-10-03

[Release](https://github.com/MaxwellGuoDUT/douluo-life/releases/tag/v1.0.1) · [PR #14](https://github.com/MaxwellGuoDUT/douluo-life/pull/14) · tag 提交 195025c

- 白底居中单列、大转盘和突出结果，角色、记事、存档集中到抽屉。
- 自动推进可暂停且串行，极速每批最多 200 次。
- 新命运返回时代与路线选择；支持最近一次抽取撤销并重抽，结果仍可能重复。
- 修复斗一人类源流程、二级八考奖励和机会接续；验证真实授神后续生与自由成长飞升。
- 旧斗一人类存档可能因语义不兼容被拒绝，不静默迁移或覆盖。
- 其他斗一神考层级及海神奖励仍可能中断，不保证成神／飞升，不宣称全部源路线闭环。

## V1.0.0 — 2026-09-24

[Release](https://github.com/MaxwellGuoDUT/douluo-life/releases/tag/v1.0.0) · [PR #13](https://github.com/MaxwellGuoDUT/douluo-life/pull/13) · tag 提交 15ff8ee

- 双内容包的人类／魂兽人生与代表性化形、终局。
- 纯前端手动 localStorage 八槽，读取、确认覆盖、JSON 导入导出。
- 当时使用 v10.html 作为正式入口；不包含账号、云同步或自动存档。

## V0.5.0-rc.1 — 2026-08-28（预发布）

[Release](https://github.com/MaxwellGuoDUT/douluo-life/releases/tag/v0.5.0-rc.1)

- 斗一 0～25 岁展示范围、可读人生年表、事件变化卡和结构化终点。
- 25 岁是当时的产品边界，不代表完整人生结局。
- 后续 RC2 候选与 V1 演进见 DEVLOG，不把候选当成已有 Release。
