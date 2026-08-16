# APK 来源与抽取资产 Provenance Manifest

日期：2026-08-16

状态：reference_only / no production authorization

## 结论

已为当前 APK、抽取目录、关键静态摘要、阶段 0 产物和 production 对照基线建立可复核的来源登记。原 APK 的 SHA-256 为：

E4FB340EF0DAD857A018E2F06982D32623BDD683B22BD44230A2257C35DAA11C

抽取目录 apk-analysis/E4FB340E 的目录标识与哈希前缀一致。

完整机器可读清单见同目录的 APK_PROVENANCE_MANIFEST_2026-08-16.json。

## 来源链

~~~text
原 APK
  └─ SHA-256 E4FB340E...
      └─ apk-analysis/E4FB340E/
          ├─ apk-entry-inventory.csv
          ├─ extracted/AndroidManifest.xml
          ├─ tooling/（Acorn 8.15.0 / Prettier 3.6.2）
          ├─ derived/static-data-summary.json
          └─ derived/catalogs/*.csv + summary.json
~~~

## 关键规模

| 项目 | 数量 |
| --- | ---: |
| 唯一静态数据集 | 61 |
| 静态数据文件 | 79 |
| 池记录 | 4,781 |
| 选项记录 | 41,637 |
| effect 记录 | 19,126 |
| requirement 记录 | 2,848 |
| 结局/死亡记录 | 1,580 |
| APK 武魂记录 | 584 |
| APK 原始魂兽记录 | 243 |
| 结构化魂兽记录 | 107 |
| 剧情时间线记录 | 107 |

## 阶段 0 产物关联

当前 provenance 链关联到：

- docs/review/APK_RULE_COMPARISON_2026-08-16.md
- outputs/stage0-evidence-review-2026-08-16/stage0-counts.json
- outputs/stage0-evidence-review-2026-08-16/STAGE0_EVIDENCE_REVIEW_2026-08-16.xlsx

这些文件仍保持审阅、参考或待审定状态。登记它们的路径和哈希，不代表接受其中任何候选内容。

## 与 production 的对照基线

- data/v2/catalogs/martial-souls.json：271 项，271 个唯一 ID，当前为 production。
- data/v2/config/awakening-probabilities.json：12 个先天魂力项、12 组武魂数量权重、12 组品质权重，当前为 production。
- APK 静态数据不覆盖、替换或隐式解释上述 production 规则。

## 使用边界

本清单只解决“这份证据来自哪里、当前文件是否可复核”的问题，不解决：

- 哪些 APK 候选应采用；
- APK 与现有规则冲突时如何取舍；
- canonLevel、权重、effects、requirements、路线和结局的最终语义；
- 文案重写、复制授权或主模式资格；
- production 导入、代码实现或 Git 交付。
