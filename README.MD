# 斗罗人生模拟器

使用 HTML、CSS、原生 JavaScript 和 JSON 构建的斗罗大陆魂师人生转盘模拟器。

## 当前阶段

- V0.5 RC1 使用独立入口 `v05-demo.html`，只发布 `douluo1` 的 0～25 岁展示范围；默认 seed 在第 100 项完整提交后锁定 25 岁终点。
- V0.5 RC1 从 `data/v05-rc/production-entry.json` 加载专用 package index/policy，只请求 `route-graph.douluo1.json` 与四类 runtime evidence；不请求 monolith、`douluo2`、`options.json` 或 archive preservation 文件。
- 当前 RC1 文件位于从 `main@c7d2978` 建立的独立工作树；尚未 stage、commit、push、创建 focused PR 或发布 Pages。
- V1 是默认可运行入口，提供早期年度事件玩法。
- V2 是独立的 production playtest 入口，已经具备 Player v2、年度会话、最小 WheelFlowEngine 和原子年度提交。
- V2 页面当前承载第一条完整 production 游戏内容“6 岁武魂觉醒”：依次抽取先天魂力、1～4 个武魂数量、一次共享品质、每槽独立基础形态和 271 项正式目录中的具体武魂，成功后原子推进到 7 岁内容边界。
- 271 项主模式目录包含 233 项 `canon` 和 38 项 `expanded`，同一玩家本次觉醒按定义 ID 无放回抽取。
- 先天 0 级合法且保持 `level = 0` 与魂力成长锁定；品质战力系数为 0% / 10% / 25% / 30%，多武魂叠加上限 100%。
- 该 playtest 不伪造 0～5 岁履历；刷新页面会重置到 6 岁场景起点，当前没有 save/load。
- V2 尚未替代 V1，也尚未实现 save/load、battle 或 ending。

## 运行

ES modules 和 JSON 加载需要通过本地 HTTP 服务器访问仓库目录。

```powershell
python -m http.server 8000
```

然后打开：

- V1：`http://localhost:8000/index.html`
- V2 production playtest：`http://localhost:8000/v2-demo.html`
- V0.5 RC1：`http://localhost:8000/v05-demo.html`

## 测试

```powershell
npm test
```

如果系统 PATH 中没有 Node.js，请使用 Codex bundled Node.js：

```powershell
& 'C:\Users\Myosotis\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test
```

## 项目边界

- V0.5 的 25 岁是 release/presentation boundary，不是完整人生 ending；自定义 seed 仍可在未接语义处 typed stop。
- archive option 2R 在 manifest 中记录三个 `originalPath`，实体原字节保存在 `data/v2/archive/apk-replaced-2026-08-16/` 对应子目录；活跃路径保持 `main@c7d2978` 状态，归档实体不进入 V0.5 runtime 请求。
- V1 与 V2 当前保持独立。
- V2 页面按当前 Player.age 调用 Annual Flow Resolver，不通过数组下标固定 flow。
- 当前没有 confirmed 的 7 岁 production annual flow；页面到达 7 岁后显示内容边界并停止推进。
- `data/v2/examples/` 是技术样例，不是正式游戏内容。
- `data/reference/legacy-wheel/` 是旧数据参考档案，不是 production 数据。
- `inferred` / `provisional` 不得自动升级为 `confirmed`。
- Player 不持久化派生战力，战力由独立计算器即时计算。
- 特殊天赋、0～5 岁、学院、魂环、战斗和存档仍未实现。

当前架构决策见 `docs/DECISION_RECORD_V2.md`，开发进度见 `docs/DEVLOG.md`。
