# 窄屏与设备验收

Windows 内置 Chromium，实际 userAgent Chrome/155.0.0.0。尺寸由 innerWidth/innerHeight 核实，单位 CSS 像素。真机由用户在已发布 Pages 回报，未混为本地修复验收。

| 场景 | 320×568 | 360×800 | 390×844 | 412×915 | 844×390 横屏 |
| --- | --- | --- | --- | --- | --- |
| 主界面/底部操作区布局 | confirmed | confirmed | confirmed | confirmed | confirmed |
| 角色、记事、存档三抽屉尺寸/滚动内容 | confirmed | confirmed | confirmed | confirmed | confirmed |
| 四开局、推进、三抽屉、隔离保存 | 共用布局检查 | 共用布局检查 | confirmed | 共用布局检查 | 共用布局检查 |
| 201 条记事分页、分类、搜索、清空 | 布局 | 布局 | confirmed | 布局 | 布局 |
| 自动/极速/暂停/取消 | 动画回归 | 动画回归 | confirmed | 动画回归 | 动画回归 |
| 旋转动画撑宽回归 | confirmed | confirmed | confirmed | confirmed | confirmed |
| 8 槽、原生覆盖取消/确认、刷新主动读取 | 布局 | 布局 | confirmed | 布局 | 布局 |
| JSON 实际选择、导入、读取、版本拒绝 | 损坏 JSON 实际拒绝 | 布局 | confirmed | 布局 | 布局 |
| 问题信息实际复制粘贴 | — | — | confirmed，桌面剪贴板 | — | — |

四开局：唐三人类 v10-save-human、唐三魂兽 day24-beast-1、霍雨浩人类 day27-human-1、霍雨浩魂兽 audit-20261010-douluo2-beast-1。各有三抽屉、实际 10 次推进及槽 5–8 隔离保存，完整导出与 Node 同 seed 顺序推进核对。见 browser-final-equality.json、followup-ui-observations.json。

历史使用合法自然化形的 v10-beast-probe-001 共 201 条：更早页 102–151，最新页 152–201；全量搜索“元素”匹配 16，清空恢复完整 201。分类/搜索仅改变视图；抽屉及中文特质修复前后原始导出字节相同。

原生覆盖 A=11 次、B=12 次：取消保留槽 A 与当前 B，确认写 B。损坏文件拒绝后槽 4 原文与原 201 条导出一致。合法导入只改目标槽，当前 51 次不变；主动读取才到 50 次，隔离槽 8 字节未变。自动/极速均实际启动、暂停/取消；自动中切路线后新人生保持 0/0，无旧任务残留。

## 缺陷与修复

1. 转盘旋转方形盒撑宽页面。同 seed、同 50 次检查点，390 宽帧 scrollWidth 最大 436。仅增加 .wheel-wrap 的 overflow-x:clip，保留纵向指针。对照 12 帧均为 375；六个实际视口各六帧：320→305、360→345、390→375、412→397、844→829、1280→1265，均未超宽。没有性能提升声明。
2. 元素特质英文标识。真实化形样本显示 formal:element.ice.ultimate 等。展示层为 formal:/douluo2: 映射“极致属性 / 法则种子 / 完整法则”，角色详情与变化摘要共用；存档/历史/规则原值保留。实际 formal 样本前后历史和 RNG 201，原始导出字节相同。douluo2 命名空间及全部三阶段另有源/机制单元证据。

截图：[溢出前](followup-overflow-before.png)、[溢出后](followup-overflow-after.png)、[逐帧前](followup-overflow-before.json)、[逐帧后](followup-overflow-after.json)、[六视口核实矩阵](followup-animation-viewport-matrix.json)、[特质前](390-traits-before.png)、[特质后](390-traits-after.png)、[取消覆盖](followup-overwrite-cancel.png)。特质前后两张实际为 1280×720，早期文件名 390 不用作窄屏证明。

明确尺寸文件如 320x568-* 为原始布局截图；部分存档截图拍在摘要校验中，只证明布局，功能由后续实际操作与导出证明。一次覆盖作用于临时标签页的尝试保留为 attempted-*，实际尺寸不匹配，不计验收；清理临时标签后重新核实的六尺寸均匹配请求。

## 真机与工具边界

用户回报 Android 15 Chrome：①键盘收放/旋转；②抽屉滚动/底部按钮；③后台约 10 秒恢复正常。随后对④JSON 导出、系统选择、导入空槽/主动读档、取消选择和状态保护回报“DONE AND FINE”。对象为已发布 V1.1.0；未取得实机截图、精确 Chrome 版本或型号，不扩大为所有手机或本地新增修复通过。iOS Safari 未验收。

内置浏览器不支持 Input.dispatchTouchEvent，触控模拟未验收。切换标签仍报告 visibilityState=visible，不能构成真实后台试验；已手动停止任务，见 followup-background-state.json。模拟不替代软键盘、移动浏览器栏、安全区域硬件、系统后台。桌面文件选择取消接口不接受空列表，保留环境缺口；Android 取消选择有用户实机回报。

剩余：本地修复真机复验、iOS、精确设备元数据及真实桌面后台行为。模拟、单元/Node、已发布 Android 回报各自独立。
