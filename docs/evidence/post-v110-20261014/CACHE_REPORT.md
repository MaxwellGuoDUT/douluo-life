# 静态资源版本一致性

confirmed：隔离复现与本地修复验证。线上修复未部署。2026-10-15 只读 Pages HTML/脚本响应仍为 Cache-Control:max-age=600，稳定 URL，见 pages-*-headers-20261015.txt。扫描未发现 serviceWorker/CacheStorage/caches.open 注册；loader 有页面内 Promise/Map 缓存，浏览器有独立 HTTP 与模块缓存。

## 复现

probe-post110.mjs 仅绑定 127.0.0.1:8766。/probe/ 先从 Git c3d883a 提供旧 HTML/JS/JSON：资源缓存 600 秒、HTML 重验证。正常开局暖完整旧资源后切 current 模式，普通刷新取得新 HTML，继续命中旧脚本/数据。网络回执为 HTML revision=local-current、脚本/数据 revision=c3d883a；实际导出仍是 douluo1:second-tier-god-trial/5。

稳定地址和独立缓存导致混用的机制已确认。原发布事故未保留逐请求日志，不能断言原事故每一缓存节点均已溯源。

## 本地修复

生成器用当前 JS/JSON/CSS 字节哈希绑定 URL；HTML import map 覆盖静态和动态模块依赖。模块/样式 SHA-384 SRI，依赖 import-map integrity 在本地 Chromium 验证；数据 fetch 带版本与 integrity，未知资源拒绝进入页面版本。不支持 import maps 时停止启动并保留槽位；入口/子模块失败显示停止启动。

相关静态文件变更后运行 npm run generate:v10-assets；npm run check:v10-assets 及完整套件拒绝过期 pins。没有新增 service worker、后端、遥测、自动保存/迁移，没有清空 localStorage、删严格版本保护或自动强刷未保存状态。已打开的匹配旧页面保持既有会话，由用户主动重新打开后使用匹配的新资源。

| 场景 | 结果 | 证据 |
| --- | --- | --- |
| 旧页面继续运行 | 保持既有语义 | 旧暖缓存开局/保存 |
| 普通刷新混用 | 修复前复现 /5；修复后匹配 /8 | cache-mixed-network.json、cache-fixed-network.json、cache-current-export.json |
| 冷启动/子路径 | 匹配资源正常开局 | 生产四路线、/probe/ 取证 |
| 绕过旧缓存后普通刷新 | 正常恢复，不自动强刷 | followup-cache-recovered.png |
| 缓存命中 | 匹配版本正常载入 | followup-cache-hit-network.json |
| 入口 URL 返回旧 JS | SRI 拒绝，停止启动 | cache-integrity-blocked.png |
| 单独子模块旧字节 | 停止启动 | followup-cache-child-integrity.png、对应 network.json |
| JSON 返回 {} | LOAD_FAILED，拒绝加载 | followup-cache-data-integrity.png、对应 network.json |
| 入口 404 | 停止启动，槽保留 | followup-cache-404.png、对应 network.json |
| 数据失败的恢复路径 | 槽 8 可导出原文，与正常原始字节相同 | followup-cache-data-raw-slot8.json、browser-final-equality.json |
| 旧 /5 档 | 严格拒绝，原文备份与旧导出完全一致 | cache-legacy-export.json、cache-legacy-raw-after.json |
| 当前 /8 往返 | 实际导出/系统选择/导入/读取一致 | cache-current-import-read.png、390 文件往返与 Node 对照 |

用户主动重开匹配页面后可备份和读取。模块失败期间不执行游戏或保存；数据失败时已加载的原文备份操作可用。部分失败无独立 loadingFailed 工具事件，以实际网络响应、隔离模式、UI 停止/LOAD_FAILED 与原槽备份联合佐证，不伪造错误响应。

线上待验：获得独立部署授权后的旧标签普通刷新、重开、CDN 查询参数缓存、实际资源字节对应关系、Android/iOS 兼容性。仅确认本地 Chromium 行为，未声明所有浏览器或所有缓存问题永久解决。原始静态源资源和 vault 未修改，改变的是应用加载边界。
