# APK canonical package packaging decision（2026-08-17）

## 决策状态

本页是 PR #4 Draft 阶段的 packaging decision，不授权合并、发布或重写分支。当前 canonical package 继续由生成器产生，来源 APK SHA 固定为 `E4FB340EF0DAD857A018E2F06982D32623BDD683B22BD44230A2257C35DAA11C`。

## 1. 分片

- 保留控制面为小文件：`data/production-entry.json`、`data/apk-canonical/package-index.json` 和 `data/apk-canonical/meta/package-policy.json`。入口只指向 package index，不把内容复制进 HTML。
- route graph 以 `packId` 分片：`douluo1` 和 `douluo2` 各自成为一个生成的 route shard；当前整体 `route-graph.json`（约 53.2 MB）保留为审计/校验产物，分片不得手工拆写。
- 已独立存在的 `options`（约 98.9 MB）、`effects`（约 25.1 MB）、`pools`（约 10.9 MB）等 catalog 继续按域独立加载；不把所有 catalog 合并为一个首屏 JSON。
- 运行时首屏只加载 entry、package index、policy；route demo 按现有 `includeRouteGraph` 选择加载 route graph 和四类运行时 evidence，完整 catalog 仍按调用方需要加载。后续若切换到 route shard，必须同步更新生成器、index、loader、校验测试和 Pages 验收，不允许只替换文件布局。

## 2. 压缩

- Git 中保留可审计的 UTF-8 canonical JSON 和生成器计算的 SHA；不提交同一内容的 `.zip`、`.gz`、`.br` 重复副本作为运行时真源。
- Release 构建可同时产出 Brotli 和 gzip 传输副本，但只有在 Pages/CDN 明确返回正确 `Content-Encoding` 时才启用预压缩 URL。GitHub Pages 的当前加载路径继续请求原始 `.json`，不在浏览器端加入猜测式解压。
- 压缩产物的校验对象是解压后的 canonical 文件；Release 同时输出 `SHA256SUMS`，区分源文件 SHA、传输包 SHA 和 route graph 内部 SHA。

## 3. Release artifact

- 目标 artifact：`apk-canonical-2026-08-17.zip`，内容为 `data/production-entry.json`、canonical package、policy、catalogs、route graph、runtime evidence、生成报告和 `SHA256SUMS`。
- artifact 必须从同一次生成器运行的工作树构建，并在打包前验证 manifest/policy/package index/route graph/runtime evidence 的根 APK SHA 全部一致。
- 本轮只记录决策，不生成或发布 Release artifact；PR 仍为 Draft。APK 原文件、`apk-analysis/`、任务书、Word/Excel、archive、负责人生成输出和无关 `index.html` 继续排除在提交范围外；用于复现 canonical package 的 `outputs/parallel-prep-2026-08-16/` 生成器与 provenance 模块属于可审计源代码范围。

## 4. GitHub Pages 加载路径

当前入口链固定为：

```text
/douluo-life/apk-route-demo.html
  -> data/production-entry.json
  -> data/apk-canonical/package-index.json
  -> data/apk-canonical/meta/package-policy.json
  -> data/apk-canonical/catalogs/route-graph.json
  -> data/apk-canonical/catalogs/*-runtime-evidence.json
```

`js/production-content-loader.js` 使用相对路径，部署到项目 Pages 时应从仓库子路径 `/douluo-life/` 打开精确页面 `apk-route-demo.html`，不能把 `/data/...` 当作站点根路径。未来启用 pack shard 时，Pages 路径应由 package index 提供，且必须保留上面的入口兼容性测试。

## 结论

先保持当前 canonical JSON + generator + package index 的可审计结构；下一阶段再以生成器产出 pack-level route shards，并在实测 Pages 的缓存、Content-Encoding 和首屏网络请求后切换。未完成这些验证前，不合并 PR #4，也不把压缩或分片后的路径写成已验收事实。
