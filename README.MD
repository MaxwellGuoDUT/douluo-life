# 斗罗人生模拟器

使用 HTML、CSS、原生 JavaScript 和 JSON 构建的斗罗大陆魂师人生转盘模拟器。

## 当前阶段

- V1 是默认可运行入口，提供早期年度事件玩法。
- V2 是独立开发入口，已经具备 Player v2、年度会话、最小 WheelFlowEngine 和原子年度提交。
- V2 已承载第一条正式游戏内容“6 岁武魂觉醒”，能够在成功提交后从 6 岁推进到 7 岁。
- V2 尚未替代 V1，也尚未实现 save/load、battle 或 ending。

## 运行

ES modules 和 JSON 加载需要通过本地 HTTP 服务器访问仓库目录。

```powershell
python -m http.server 8000
```

然后打开：

- V1：`http://localhost:8000/index.html`
- V2 demo：`http://localhost:8000/v2-demo.html`

## 测试

```powershell
npm test
```

如果系统 PATH 中没有 Node.js，请使用 Codex bundled Node.js：

```powershell
& 'C:\Users\Myosotis\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test
```

## 项目边界

- V1 与 V2 当前保持独立。
- `data/v2/examples/` 是技术样例，不是正式游戏内容。
- `data/reference/legacy-wheel/` 是旧数据参考档案，不是 production 数据。
- `inferred` / `provisional` 不得自动升级为 `confirmed`。
- Player 不持久化派生战力，战力由独立计算器即时计算。

当前架构决策见 `docs/DECISION_RECORD_V2.md`，开发进度见 `docs/DEVLOG.md`。
