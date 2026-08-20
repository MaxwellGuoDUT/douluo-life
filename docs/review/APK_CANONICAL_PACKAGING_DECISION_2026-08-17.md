# APK canonical package packaging decision（2026-08-20 更新）

## 决策状态与授权边界

负责人已选择：

- `D1-A`：发布口径限定为 preview，允许在明确 typed boundary 停止；禁止宣传完整路线或完整总值。
- `D2-B`：route graph 使用 compact JSON，并按 `douluo1` / `douluo2` 分片、运行时按 pack 懒加载。
- `D3-A`：已在未来 push 前把 GitHub Pages source 从 Draft 分支迁移到 `main / (root)`；Draft 分支后续 push 不再直接部署公开站点。
- `A-FILE`：授权本轮文件实现；不包含 staging、commit、push、PR 修改、Pages 配置、merge 或发布。
- `A-FILE-RC`：浏览器 RC 后收窄公开范围；仅 `douluo1` 属于公开 preview，`douluo2` shard 保留为 `experimental / unverified`，不宣称可推进或完成。

来源 APK SHA 固定为 `E4FB340EF0DAD857A018E2F06982D32623BDD683B22BD44230A2257C35DAA11C`。`official-beast.element` 的人类/魂兽上下文语义仍未闭合，本决策不授权其成功路径。

## 1. Preview 发布契约

- `data/production-entry.json` 将发布通道标记为 `preview`，允许结构化 typed boundary，明确禁止 complete-route claim。
- 公开 preview pack 仅为 `douluo1`。`douluo2` 保留生成、索引和按需加载能力，但必须标记为实验/未验证，不属于公开路线能力声明。
- `douluo1` 已知固定 seed 边界为 `beast.element.unresolved`：页面必须保留错误码、operation ID/status 和未提交历史，不允许静默补线。
- `douluo2` 浏览器入口 smoke 在首步 `cd9337` 到达 `douluo2:handler.human.country` typed boundary；该结果只证明入口与 shard 可加载，不证明路线可推进。
- 本地自动验证、浏览器验证、静态 APK 证据、unresolved 和 excluded 必须继续分别记录。
- 若未来版本要改称完整正式路线，必须重新经过 D1 发布门；本次 `D1-A` 不能继承为完整版本授权。

## 2. Route graph 生成与分片

生成器 `outputs/parallel-prep-2026-08-16/extract-apk-route-graph.mjs` 同一次运行产出：

- `data/apk-canonical/catalogs/route-graph.json`：compact monolith，仅作审计和旧入口兼容回退。
- `data/apk-canonical/catalogs/route-graph.douluo1.json`：compact douluo1 runtime shard。
- `data/apk-canonical/catalogs/route-graph.douluo2.json`：compact douluo2 runtime shard。

shard 使用 `apk-route-graph-shard/1.0`，包含唯一 pack、来源 SHA、生成器路径和该 pack 的 missing-exact diagnostics。禁止手工拆写或把运行时临时对象保存为正式 shard。

package generator 把 shard 路径、pack ID、标题、入口 flow、字节数和 SHA-256 写入 `package-index.json`。运行时只使用 index 列出的 shard；未知 pack 返回结构化错误，不猜测文件名。

每个 shard descriptor 同时带 `releaseStatus`：`douluo1=public-preview`，`douluo2=experimental-unverified`。该状态只控制发布声明与 UI 标识，不删除数据，也不把未验证路线提升为生产能力。

### 只读测量基线

| 对象 | JSON MiB | gzip-9 MiB | Brotli-q6 MiB |
|---|---:|---:|---:|
| pretty monolith | 50.762 | 2.920 | 0.683 |
| compact monolith | 28.441 | 2.205 | 0.616 |
| douluo1 runtime envelope | 13.607 | 1.083 | 0.296 |
| douluo2 runtime envelope | 13.938 | 1.063 | 0.289 |
| options pretty | 94.356 | 3.177 | 1.470 |
| options compact | 72.101 | 2.934 | 1.299 |

最终生成尺寸和 SHA 必须以 package index 与测试为准；上表只是方案选择时的内存测量，不冒充生成结果。

## 3. Pages 懒加载路径

新入口链为：

```text
/douluo-life/apk-route-demo.html
  -> data/production-entry.json
  -> data/apk-canonical/package-index.json
  -> data/apk-canonical/meta/package-policy.json
  -> 用户选择 pack
  -> data/apk-canonical/catalogs/route-graph.<packId>.json
  -> 四类 runtime evidence
```

`js/production-content-loader.js` 优先使用 package index 的 `routeGraphShards[packId].path`，并把 shard 物化为既有 runtime 接口需要的单-pack route graph。只有旧 package 没有 shard metadata 时才回退 monolith。

Demo 首屏只加载 entry/index/policy；用户点击开始或切换 pack 时才请求该 shard。`catalogNames: []` 保持不请求约 99 MB 的 `options.json`。

Demo 的 pack 选择器必须显示公开状态；选择 `douluo2` 时明确提示“实验/未验证”，不得沿用 `douluo1` 的公开 preview 文案。

旧入口 `apk-route-demo.html` 和相对 `/douluo-life/` 路径保持兼容。发布后必须用新鲜页面 Network 证明只请求所选 pack shard，不请求 monolith 与 options。

## 4. 压缩与 Release artifact

- Git 中保留 compact UTF-8 JSON 和生成器计算的 SHA，不提交 `.gz` / `.br` 作为运行时真源。
- GitHub Pages 当前实测在 `Accept-Encoding: gzip, br` 下仍返回 gzip；Brotli 只作为 Release 下载副本，除非未来托管层能正确设置 `Content-Encoding: br`。
- Release artifact 目标包含 production entry、package index、policy、完整 canonical catalogs、compact monolith、两个 pack shard、runtime evidence、生成报告和 `SHA256SUMS`。
- artifact、gzip/Brotli 副本、tag 和 GitHub Release 均不在本次 A-FILE 授权内。
- Git LFS 不作为 Pages runtime 方案。

## 5. Pages source 已完成迁移

`A-PAGES-SOURCE` 已独立执行并完成：

- Pages source 已从 `codex/day14-release-closeout / (root)` 迁移到 `main / (root)`。
- `pages build and deployment` run `32360588072` 从 `main` 的 `c7d2978ea8a3e9063f99e31cdcb1b4cf448f1137` 部署成功。
- 新鲜公开页面 smoke 正常显示“斗罗人生模拟器 / v0.0.1 Alpha”；当前公开站点仍来自 `main`，不是本地未提交的 Preview RC。
- Draft 分支后续 push 不会直接改变 Pages，因此先前的 push freeze 已解除；push 仍需独立授权。
- merge 到 `main` 会自动触发公开部署。任何 `A-MERGE` 请求必须同时说明这一外部影响，不能把 merge 视为纯 Git 内部动作。

生成 policy 只保存稳定约束 `stable_source_required_draft_branch_excluded`，不把一次性的迁移动作或可漂移的部署 run 硬编码成长期运行时策略；部署快照保留在本决策与 DEVLOG 中。

## 6. 排除范围

APK 原文件、`apk-analysis/`、`docs/tasks/`、Word/Excel、`data/v2/archive/`、owner outputs、`.codex-tmp/`、无关 `index.html` 和无法证明属于本任务的材料，不纳入本次变更，也不自动删除。Git 操作必须继续使用明确文件清单，禁止 `git add .`、`git add -A` 和宽范围 glob。
