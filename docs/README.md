# litellmgateway 文档中心

本目录是 `litellmgateway` 仓库（被逆向系统 `open-api/`，即 `SYS-qvsu-openapi`）的**文档总入口**。

整套文档由三条流水线产出，全部为中文：

| 流水线 | 使用技能 | 产物目录 | 状态 |
|---|---|---|---|
| ① 源码逆向工程 | `codebase-reverse`（技能名 `reverse-new`） | [`meta-model/`](./meta-model/meta-index.md) | ✅ 官方校验器 **PASS / ERROR=0** |
| ② 本体建模 | `ontology-driven-dev` | [`ontology/`](./ontology/00-ontology-overview.md) | 进行中 |
| ③ 架构图与发布页 | `consulting-html-ppt` | [`../pages/architecture.html`](../pages/architecture.html) | 进行中 |

---

## 一、从哪里开始读

### 想快速了解系统
1. [`architecture.md`](./architecture.md) — 架构图文档（系统上下文、分层、模块、部署、安全、数据、调用链、风险）
2. [`meta-model/technical-architecture.md`](./meta-model/technical-architecture.md) — 技术架构与系统主定义 `SYS-qvsu-openapi`
3. [`meta-model/business-architecture.md`](./meta-model/business-architecture.md) — 4 个业务域、18 个能力、9 个场景

### 想查某个功能怎么实现的
1. [`meta-model/functional-inventory.md`](./meta-model/functional-inventory.md) — 32 个功能清单（找 `FUNC-*`）
2. [`meta-model/function-chain-index.md`](./meta-model/function-chain-index.md) — 每个功能的完整实现主链
3. [`meta-model/interface-index.md`](./meta-model/interface-index.md) — 195 个接口节点

### 想查数据库
1. [`meta-model/database-model.md`](./meta-model/database-model.md) — 34 张物理表主定义
2. [`meta-model/database-schema.md`](./meta-model/database-schema.md) — 逐表逐字段设计（342 个字段）
3. [`meta-model/database-relations.md`](./meta-model/database-relations.md) — 关系与血缘
4. [`meta-model/data-ownership.md`](./meta-model/data-ownership.md) — 数据归属与写入冲突

### 想改代码前评估影响
1. [`meta-model/change-hotspots.md`](./meta-model/change-hotspots.md) — 13 个变更热点
2. [`meta-model/common-capability-index.md`](./meta-model/common-capability-index.md) — 公共能力与安全风险
3. [`meta-model/flow-index.md`](./meta-model/flow-index.md) — 10 条端到端流程

### 想了解可信度与未决问题
1. [`meta-model/source-coverage-report.md`](./meta-model/source-coverage-report.md) — 源码覆盖对账
2. [`meta-model/consistency-report.md`](./meta-model/consistency-report.md) — 双检查器一致性与校验门禁
3. [`meta-model/PROGRESS.md`](./meta-model/PROGRESS.md) — 进度与未决问题 `Q-*`
4. [`ontology/02-assumptions-and-open-questions.md`](./ontology/02-assumptions-and-open-questions.md) — 本体建模假设清单

---

## 二、系统速览

| 项 | 值 |
|---|---|
| 系统 ID | `SYS-qvsu-openapi` |
| 名称 | QVSU OpenAPI 管理与网关服务（精简版） |
| 形态 | 单体 Spring Boot 应用（jar/war） |
| 技术栈 | Spring Boot 2.7.18、MyBatis + PageHelper、Apache Shiro、Druid、Quartz、Thymeleaf、Ehcache、Logback |
| 数据库 | PostgreSQL 11（同时提供 MySQL 方言脚本） |
| 前端 | 服务端渲染 Thymeleaf + jQuery / Bootstrap / bootstrap-table（144 个模板，其中 73 个为框架示例已排除） |
| 端口 | 5656 |
| 默认账号 | `admin` / `admin123` |
| 业务域 | 系统管理、OpenAPI 开放平台、调度任务、平台公共（认证/会话/审计） |
| 规模 | 6 个模块、24 个 Controller、184 个 HTTP 端点、32 个功能、34 张表 |

---

## 三、产物清单

### `meta-model/`（逆向元模型，25 份）
| 文件 | 作用 |
|---|---|
| `meta-index.md` | 总索引与主定义位置表 |
| `PROGRESS.md` | 进度、覆盖统计、未决问题 `Q-*` |
| `source-asset-inventory.md` | 源码资产台账（覆盖率分母） |
| `source-coverage-report.md` | 覆盖对账 |
| `consistency-report.md` | 双检查器一致性报告与门禁判定 |
| `validation-report.txt` | 官方校验器原始输出 |
| `technical-architecture.md` | 技术架构，`SYS-*` 主定义 |
| `technical-component-index.md` | 组件与组件能力，`COMP-*` / `TCA-*` |
| `config-index.md` | 配置键级索引，`CFG-*` |
| `module-index.md` | 模块与服务，`MOD-*` / `SVC-*` |
| `business-architecture.md` | 业务域/能力/场景/菜单/入口 |
| `functional-inventory.md` | 功能清单，`FUNC-*` 主定义 |
| `business-function-requirements.md` | 32 个需求面板 |
| `non-menu-function-index.md` | 无菜单功能索引 |
| `function-chain-index.md` | 32 条实现主链 |
| `domain-model.md` | 领域对象，`OBJ-*` |
| `interface-index.md` | 接口清单，`API-*` / `JOB-*` |
| `database-inventory.md` | 数据库资产清单 |
| `database-model.md` | 物理表主定义，`TBL-*` |
| `database-schema.md` | 逐字段设计 |
| `database-relations.md` | 关系与血缘 |
| `database-access-matrix.md` | 功能到表读写矩阵 |
| `data-ownership.md` | 数据归属与冲突 |
| `common-capability-index.md` | 公共能力，`COMMON-*` / `CSI-*` |
| `flow-index.md` | 端到端流程 |
| `change-hotspots.md` | 变更热点与风险 |

### `ontology/`（本体模型）
| 文件 | 作用 |
|---|---|
| `00-ontology-overview.md` | 本体建模总览与模型间关系 |
| `01-modeling-decisions.md` | 建模决策与偏差记录 |
| `02-assumptions-and-open-questions.md` | 假设清单与待确认问题 |
| `yaml/m1-object-model.yaml` | M1 对象模型 |
| `yaml/m2-behavior-model.yaml` | M2 行为模型 |
| `yaml/m3-rule-model.yaml` | M3 规则模型 |
| `yaml/m5-actor-model.yaml` | M5 主体模型 |
| `yaml/m6-flow-model.yaml` | M6 流程模型 |
| `yaml/m7-report-model.yaml` | M7 查询统计与报表模型 |
| `yaml/mu-ui-model.yaml` | MU UI 模型 |
| `03-cross-model-gaps.md` | **跨模型引用差异报告**：七模型 ID 体系不同导致的未解析引用与 M2 孤儿行为台账 |

> ⚠️ **本体模型当前未通过技能的一致性门禁**：248 条跨模型引用无法解析、27 个 M2 行为未被 UI 引用。原因与收敛路径见 [`ontology/03-cross-model-gaps.md`](./ontology/03-cross-model-gaps.md)。这**不影响**逆向元模型的校验结论（`docs/meta-model` 仍为 `PASS / ERROR=0`），但本体部分不能声明为「已闭环」。

### `tools/`（可复现的提取与生成工具）
| 文件 | 作用 |
|---|---|
| `extract-assets.js` | 源码资产、路由 token、类级映射前缀、配置键、权限码、Mapper 语句、DDL 对象提取 → `assets.json` |
| `extract-semantics.ps1` | 表 DDL 字段、控制器端点、视图模板提取 → `semantics.json` |
| `extract-menus.js` | 菜单 INSERT/UPDATE 解析（覆盖 `VALUES`、`SELECT … WHERE NOT EXISTS`、`UPDATE … SET` 三种形式）→ `menus.json` |
| `gen-*.js` | 各元模型文档的确定性生成器 |
| `write-crlf.js` | 统一 CRLF 写入（见 §五 第 1 条，关键） |
| `check-consistency.js` | 独立一致性检查器（不复用官方校验器代码） |
| `gen-consistency-report.js` | 运行双检查器并生成一致性报告 |
| `audit-newline-integrity.ps1` | 审计每个文件在 ANSI 解码下的换行完整性（`Lost` 必须为 0） |
| `analyze-ontology.js` | 本体七模型的 ID / 引用 / 门禁分析 → `ontology-analysis.json` |
| `ontology-gap-report.js` | 依据上述分析渲染 `ontology/03-cross-model-gaps.md` |
| `normalize-line-endings.js` | 把生成物批量转为 CRLF |

> 提取与生成工具**以 Node.js 为主**：Windows PowerShell 5.1 在读 UTF-8、JSON 序列化与正则转义上有多个静默陷阱（见 §五），Node 版本无这些问题且结果可复现。

### `pages/`
| 文件 | 作用 |
|---|---|
| `../pages/architecture.html` | 咨询风格架构演示稿（单文件多页，浏览器直接打开） |

---

## 四、工具链使用方法

```powershell
# 1. 提取源码资产（Node，推荐）
node docs/tools/extract-assets.js
node docs/tools/extract-semantics.ps1   # PowerShell；用 Extract… 方式调用见下
node docs/tools/extract-menus.js

# PowerShell 版语义提取（含表 DDL 字段与视图模板）
powershell -File docs/tools/extract-semantics.ps1 -SourcePath open-api -OutputPath docs/tools/semantics.json

# 2. 确定性生成元模型文档
node docs/tools/gen-db-docs.js
node docs/tools/gen-core-docs.js
node docs/tools/gen-domain-docs.js
node docs/tools/gen-interface-index.js
node docs/tools/gen-index-progress.js

# 3. 双检查器验证并生成一致性报告
node docs/tools/gen-consistency-report.js
```

### 官方校验器（技能自带）
```powershell
powershell -File "$env:USERPROFILE\.agents\skills\codebase-reverse\scripts\validate_meta_model.ps1" `
  -MetaModelPath docs/meta-model -SourcePath open-api -ReportPath docs/meta-model/validation-report.txt
```

---

## 五、已知的坑与注意事项（维护者必读）

1. **【最重要】所有元模型 Markdown 必须以 CRLF 写入**。官方校验器用 `Get-Content -Raw` 读文件，Windows PowerShell 5.1 会按 **ANSI 代码页（本机 GBK/936）** 解码 UTF-8 内容。GBK 双字节字符的第二字节可以是 `0x0A`，于是任意 UTF-8 序列（如 `<E6><8D><A2><0A>`）会被解码成**一个字符并吞掉其后的换行**。本次实测：修复前 25 个文件中有 **3410/24648 个换行对校验器不可见**，导致其按行锚定的规则（逐字段正则、逐 ID 正则）静默失效并产生大量幻影错误。`0x0D` 永远不是合法的 GBK 尾字节，因此用 CRLF 结束每一行即可让行结构在这种解码下保持完整。
   - 检测脚本：`docs/tools/audit-newline-integrity.ps1`（输出每个文件的原始 LF 数与解码后 LF 数，`Lost` 必须为 0）。
   - 保障机制：所有生成器通过 `docs/tools/write-crlf.js` 的 `writeText()` 写文档，不会再退化为 LF。
2. **12 个必需字段行（`Business Goal` 等）必须保持 ASCII-only**，中文内容写在其下方的「面板明细」小节。原因同上：字段取值若含中文，跨行字节错位会让字段正则失配（实测：中文值导致 384 个字段检查中 174 个失败）。
3. **校验器的 ID 正则用 `\b` 词边界**，而 `-` 也是词边界，所以**前缀里包含另一个前缀会产生幽灵引用**：`CAPI-x` 会被解析出 `API-x`，`TCAP-x` 会被解析出 `CAP-x`。因此能力接口前缀用 `CSI-`、组件能力前缀用 `TCA-`。
4. **生成器脚本（`docs/tools/*.js`）必须是纯 ASCII**。Node 以 latin-1 解析 `.js`，注释或字符串里的多字节字符（例如破折号 `—`）会直接导致 `SyntaxError: Invalid or unexpected token`。中文一律放进被写入的字符串常量里，不要放进注释。
5. **`Sort-Object -Unique` 在 PS 5.1 下对 hashtable 会静默塌缩为 1 个元素**，去重请手写。
6. **`ConvertTo-Json` 会把单元素数组塌缩成标量**，生成 JSON 时每个集合都要显式包 `@()`。
7. **不要依赖 PowerShell 正则做复杂文本解析**：本机沙箱会把含反斜杠转义的 PS 源码写坏（多次出现 `\'`、`\\s` 被破坏），复杂解析请用 Node.js 或 `read`/`grep` 工具。
8. **上游编码损坏**：`open-api/qvsu-openapi/src/main/resources/application.yml` 与 `deploy/local-docker/postgres/init/40-open-api-menu.sql` 的中文为双重编码乱码，**原始 zip 内即如此**；MySQL 版菜单 SQL 与 Java/XML 源码的中文正常。
