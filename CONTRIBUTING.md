# 开发与贡献

先读 [当前产品说明](README.MD)、[文档导航](docs/README.md)和已有 [Issues](https://github.com/MaxwellGuoDUT/douluo-life/issues)，确认问题属于当前正式入口。

## 本地运行

使用 Node.js 24 运行测试，使用 Python 3 提供本地静态服务：

```sh
git clone https://github.com/MaxwellGuoDUT/douluo-life.git
cd douluo-life
python -m http.server 8000
```

打开 http://localhost:8000/ 。当前没有 npm 依赖或构建步骤，不需要 npm install。另开终端执行：

```sh
npm test
```

先运行受影响的测试；文档或模板改动检查链接、格式和描述即可。不为增加数字重复全量或新增与实现重复的断言。

## 源内容与测试边界

游戏和普通测试使用仓库已提交的内容，不要求外部 vault。生成一致性检查另需恢复后的来源材料：

```sh
npm run check:v10-source -- --vault /absolute/path/to/E4FB340E
```

生成器和源清单测试支持 DOULUO_SOURCE_VAULT 环境变量。未配置且默认 vault 不存在时，该测试明确 SKIP；显式配置错误或源检查失败应报错。CI 绿色不能证明缺席的来源校验已执行。

不要手改 data/v10 生成图谱、清单或来源副本。改变生成内容时修改生成逻辑并说明来源依据；不要上传原 APK、本地 vault、私人存档或巨大临时审计轨迹。

## 修改原则

- 先核对工作树和现有差异，使用精确路径提交，不清理其他人的未提交材料。
- 保持 HTML/CSS/原生 JavaScript、手动 localStorage 八槽。新增依赖或账号／云功能须有实际需求。
- 权重与结果来自同一运行时；保留确定性随机数、存档内容身份和失败回滚。
- 未知规则返回明确边界，不猜映射、吞错或强制结局。
- outputs/parallel-prep-2026-08-16 的跟踪文件仍被生成器和测试使用，不能作为缓存删除。
- 检查新增层是否有实际消费者，避免重复状态与未来占位；删除层之前验证行为一致。

## 提交 PR

从最新 main 开一个主题明确的 codex/ 分支；已有进行中的工作树无需为了形式重建。PR 写明问题、用户可见变化、实际验证、存档兼容影响和未验证范围。

自动测试、真实回放、Browser、负责人验收和部署分别记录，不把历史结果写成本次运行结果。玩家可见变化更新 [CHANGELOG](CHANGELOG.md)，阶段成果记入 [DEVLOG](docs/DEVLOG.md)；详细证据沿用原报告。

main 合并会触发 Pages。合并前检查 PR CI，合并后核对对应提交的 CI 和 Pages；tag/Release 指向固定提交，不随 main 移动。参见 [维护记录](docs/MAINTENANCE.md)。

仓库尚未指定统一 LICENSE；本次不替来源材料选择许可。涉及许可范围时由维护者单独确认。
