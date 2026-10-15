# 兼容性来源核对（2026-10-15）

MDN 原始兼容数据将 import maps 与其中 integrity 分开记录：Chrome 127、Firefox 138、Safari 18 开始支持后者；Chrome 的 import maps 本身从89开始，Safari从16.4开始。HTMLScriptElement.supports('importmap') 不能证明 integrity 成员可用。

- https://raw.githubusercontent.com/mdn/browser-compat-data/main/html/elements/script.json
- https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script/type/importmap
- https://webkit.org/blog/15865/webkit-features-in-safari-18-0/ （Web API 节明确加入 imported module scripts SRI）

这是来源兼容信息；实际证明仅为此前桌面 Chromium155 验收。Android15 的用户回报针对 V1.1.0；Safari、Firefox 和新增修复真机仍未验收。本轮未将版本门槛作为 UA 判断，旧浏览器的 import-map integrity 不能保证被执行。所有浏览器覆盖不是发布前复核结论。
