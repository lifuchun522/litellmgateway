# 本体建模总览（Ontology Overview）

> 系统：`SYS-qvsu-openapi`（QVSU OpenAPI 管理与网关服务）
> 阶段：`ontology-driven-dev` 技能**阶段二 · 本体建模**
> 建模对象：**存量系统逆向后补建本体**（不是正向需求驱动建模）
> 产物语言：zh-CN；稳定 ID、类名/方法名、路径、URL、表名/字段名、配置键保持源码原文。
> 证据等级口径（全文统一）：**事实** = 直接读源码或逆向文档明确记载；**推断** = 由多处证据推出；**假设** = 待人工确认。

---

## 1. 本阶段的目标与边界

### 1.1 目标

把已通过双校验的上游逆向成果（`docs/meta-model/` 25 份中文元模型文档）**折算成一套七模型本体**，使得：

1. 系统里每一个可操作单元（页面按钮、接口、定时任务）都能回溯到某个本体元素；
2. 对象、行为、规则、主体、流程、查询报表、界面七类语义**正交分离**，可以独立演进；
3. 后续阶段三（应用构建）能拿到一份**语义完整、引用闭合**的模型输入，而不是一份代码清单。

### 1.2 本阶段的三个不可混淆点

| 点 | 说明 | 依据 |
|---|---|---|
| **本体是"现状表达"，不是"设计意图"** | 本体必须忠实还原系统**今天**的语义。凡"本应如此但代码没有"的内容（如审批流、限流、权限码校验），只能作为**偏差**或**假设**登记，不能擅自补进模型当成既有能力。 | 技能 §五-2「模型是唯一语义来源」的反向要求：模型不得与代码两套；`business-architecture.md#7` 对「限流不存在」的处置方式即本原则的样板 |
| **YAML 与说明文档分工不同** | 七模型 YAML（`docs/ontology/yaml/`）承载**可被机器消费的字段级定义**，由并行的其他子任务产出；本目录的三份文档承载**输入来源、判断取舍、假设清单**，不逐字段复述 YAML。 | 本次任务书约定；技能 §阶段二产物约定 |
| **上游已 PASS ≠ 本体一定闭合** | 上游校验的是「元模型文档内部一致」（建模开始时 476 个稳定 ID、0 悬空引用），本体校验还要额外满足**跨模型引用门禁**（§5）。上游的 `Q-*` 未决项会**直接继承**为本体的假设。**且上游在本阶段被并行修改**：校验器结果已由 PASS 变为 FAIL（ERROR=1），功能数 32→29、配置键 168→29、接口节点 195→192、无菜单功能 9→6 均已在中途变更 → 本体不得把任何上游计数当作稳定常量。 | `consistency-report.md#2`、`PROGRESS.md#5`、`validation-report.txt`、技能 §阶段二「一致性门禁（强制）」 |

### 1.3 输入基线的一句话概括

> 系统是一个 **RuoYi 系 Spring Boot 单体后台**（Shiro + MyBatis + PageHelper + Quartz + Thymeleaf），在其之上叠加了一个**自研的 OpenAPI 开放平台业务域**（`com.qvsu.open`）：应用/接口/授权/调用日志/文档五个管理页面，加上一个**签名鉴权 + 反向代理**的网关入口和一套自检 httpbin 桩。
> 证据（事实）：`docs/_CONTEXT-FOR-AGENTS.md#2`、`docs/meta-model/business-architecture.md#1.1`、`docs/meta-model/technical-architecture.md#SYS-qvsu-openapi`。

---

## 2. 输入来源（逐条列出）

以下 25 份文档全部位于 `docs/meta-model/`。**建模开始时的输入状态**：上游官方校验器 `validate_meta_model.ps1` 结果 PASS / ERROR=0，独立检查器总错误数 0。**建模过程中该目录被并行任务持续修改**，导致功能数、配置键数、接口节点数、菜单去重基数与校验器结论均发生变化（当前校验器为 **FAIL / ERROR=1**）。本条已在 `02-assumptions-and-open-questions.md` §0.3 与 A-DATA-04 中如实登记；本文件下文凡涉及这些计数处均标注**两个时点**的值。

### 2.1 框架与索引类

| 文件 | 作用（在本体建模中的用途） | 本阶段读取的关键结论 |
|---|---|---|
| `meta-index.md` | 产物清单与稳定 ID 前缀总账；确定哪些文件是"主定义文件" | 25 份文档的职责分工；ID 前缀归属表。**注意**：其声明 `domain-model.md` 为 `RULE-*` 主定义位置，但该文件实际**无任何 `RULE-*` 定义**（见 `02-assumptions-and-open-questions.md` A-M3-01） |
| `PROGRESS.md` | 逆向进度与**未决问题 `Q-*`** 主定义 | 建模开始时 5 个 `Q-*`（网关路由、乱码、方言副本、79 无权限端点、菜单路由契约）；建模过程中新增 3 个：`Q-datascope-find-in-set`（**P0**：`DataScopeAspect.java:136` 用 MySQL 专有 `find_in_set`，在 PostgreSQL 上必然报错）、`Q-audit-query-not-implemented`（3 个审计查询功能已删除）、`Q-menu-extraction-scope`（菜单去重真值 C 14→15、F 50→57）→ 全部继承为本阶段假设 |
| `consistency-report.md` | 完成门禁判定依据；A–O 逐项检查 | 184 端点/105 带权限/**79 无权限**；34 表/342 字段；33 OBJ。**注意**：并行修改后该文件的 §2 计数（29 个 FUNC）与 Pass E/G/H/L 的表述（32/9/195/168）**内部已不自洽**，且顶部 Result 已为 FAIL |
| `source-coverage-report.md` | 覆盖对账（分母口径） | 关键分母：144 个模板中 **71 个在范围内、73 个排除**；409 源码文件 335 建模/74 排除；权限码 55 个 |
| `source-asset-inventory.md` | 源码资产台账；**排除清单**来源 | 排除口径：`templates/demo/**`、`static/ajax/libs/**`、`src/test/**`、`deploy/dev-docker/**`（这决定 MU 必须排除框架示例页，见 §4.7） |
| `validation-report.txt` | 官方校验器原始报告 | 建模开始时：PASS、ERROR/WARNING/INFO 全 0、476 个已定义 ID、32 个功能定义。**建模过程中变为 FAIL / ERROR=1**（`undefined-id`：`Q-audit-query-not-implemented` 被引用但主定义未被识别） |

### 2.2 技术类（决定 M1/M5/M6 的可用能力边界）

| 文件 | 作用 | 本阶段读取的关键结论 |
|---|---|---|
| `technical-architecture.md` | 技术架构与 `SYS-*` 主定义 | **Shiro 过滤器链**（anon 段含 `/open/**`、`/selftest/**`）；`@RequiresPermissions` 生效依赖 `authorizationAttributeSourceAdvisor`；**Quartz 为内存 JobStore**（`ScheduleConfig` 空占位类自述）；`csrf.enabled=false` 使 CSRF 过滤器实际禁用；`XssFilter` 只覆盖 `/system/*,/tool/*`；无 `@Scheduled`/`@XxlJob`/`@EventListener` 注解式触发器 |
| `technical-component-index.md` | 技术组件与能力接口 `COMP-*`/`TCAP-*` | 组件的消费者，用于 M2 行为的技术落点标注 |
| `module-index.md` | 模块与服务 `MOD-*`/`SVC-*` | 6 个模块（`MOD-open`/`MOD-system`/`MOD-quartz`/`MOD-framework`/`MOD-web`/`MOD-common`）→ 映射为 MU 的一级菜单/功能分组依据 |
| `config-index.md` | 配置键 `CFG-*`（建模开始时 168 个；当前 **29 个**） | `shiro.user.captchaEnabled=true`、`user.password.maxRetryCount=5`、`pagehelper.helperDialect=postgresql`、`csrf.enabled=false`（**已挂链但失效**）、`qvsu.profile=D:/qvsu/uploadPath`（**Docker 未覆盖，容器内路径不可用**）等影响规则建模的开关 |
| `change-hotspots.md` | 变更热点与风险 | 12 个 `HOT-*`；与本阶段直接相关的：`HOT-PERM-GAP`（权限覆盖 105/184）、`HOT-DIALECT`（`find_in_set` 仅 MySQL 可用、`::date` 仅 PostgreSQL 可用，**两处不可能同时正确**）、`HOT-OPEN-TABLES`（遗留 `s_*` 兼容列 + 双时间列 + 无外键）、`HOT-CALLLOG-COLS`（headers 列空置）、`HOT-ROUTING-CONTRACT`（菜单-路由-模板无校验约束）、`HOT-DATA-CONSIST`（事务与删除策略不统一） |

### 2.3 业务与功能类（M1/M2/M3 的主要输入）

| 文件 | 作用 | 本阶段读取的关键结论 |
|---|---|---|
| `business-architecture.md` | 业务域 `DOM-*` / 能力 `CAP-*` / 场景 `SCN-*` / 菜单 `MENU-*` / 入口 `ENTRY-*` 主定义 | 4 个业务域 18 个能力 9 个场景；**菜单树（该文件口径）：C 14 + M 2 + 外链 1**（去重后），与 `PROGRESS.md` 的 C 15 口径尚未同步；§7 的 6 条偏差登记（菜单 14≠33、quartz 菜单未被提取脚本收录、**限流不存在**、**操作审计只写不读**、与并行产物一致性待复核、编码损坏影响面） |
| `functional-inventory.md` | 功能 `FUNC-*` 主定义（建模开始时 32 个；当前 **29 个**，3 个审计查询功能已删除） | 每个 FUNC 的类型/交互方式/触发类型/优先级/所属域/菜单入口 → **M2 行为的第一手清单**；触发类型统计（当前版本）：`menu` 21 / `api-only` 其余 / `startup-lifecycle` / `scheduled` |
| `business-function-requirements.md` | 功能需求面板（12 字段 × 每个 FUNC） | 每个 FUNC 的业务目标、参与者、前置条件、主流程、**业务规则**、状态变化、失败分支、权限与数据范围 → **M3 规则与 M2 前置/后置条件的主要来源**；也是 M5 角色推断的依据 |
| `non-menu-function-index.md` | 无菜单功能登记（建模开始时 9 个；当前 **6 个**） | 验证码、全局异常、网关调用、自检、调度执行、调度日志 → **MU 不能为它们建菜单页**，只能以 `SYSTEM` 触发或不进 MU |
| `function-chain-index.md` | 功能实现主链（与 FUNC 数一致，每条 8 个三级标题） | 「对象角色」「规则与状态」「闭环」三节 → 交叉印证 M1 对象用途、M2 行为边界、M3 规则归属 |
| `domain-model.md` | **33 个对象 `OBJ-*` 主定义**（并声明含 `RULE-*`，但**实际无 `RULE-*`**） | 对象分类（entity 23 / DTO 6 / value-object 4）；**已标注聚合根的对象仅 6 个**（`SysUser`、`SysRole`、`SysMenu`、`SysDept`、`OpenApp`、`OpenApi`）；19 个对象继承 `BaseEntity`/`TreeEntity` 或 `OptBaseEntity`；§4 列出 **11 张无实体物理表**（`QRTZ_*`） |
| `interface-index.md` | 接口节点 `API-*`/`JOB-*` 主定义（建模开始时 195 个 = 184 HTTP 端点 + 11 非端点；当前 **192 个**） | §3「端点权限覆盖缺口」**逐个列出 79 个无权限码端点及其高/低危判断** → M7 查询清单与 M5 权限缺口的核心证据；`JOB-quartz-dispatch` 是唯一调度入口节点 |
| `flow-index.md` | 10 条端到端流程 `FLOW-*` | §流程总览表 + §流程间依赖关系 + §未覆盖与待确认项 → **M6 流程的直接输入**（10 条流程，全部为非审批的协同/技术流，见 §4.5） |

### 2.4 数据类（M1 属性与 M7 取数的物理依据）

| 文件 | 作用 | 本阶段读取的关键结论 |
|---|---|---|
| `database-inventory.md` | 数据库资产清单 | 34 张唯一表；**无视图、无物化视图、无存储过程、无触发器** |
| `database-model.md` | 34 张表 `TBL-*` 主定义 | 表与对象的映射；5 张 `open_*` 业务表的列数（`open_app` 14 / `open_api` 17 / `open_app_api` 9 / `open_call_log` 22 / `open_api_doc` 12） |
| `database-schema.md` | 34 节逐字段设计（342 字段） | M1 属性类型与必填性的物理证据；**未知项标 `unknown` 而不省略**（`consistency-report.md#Pass J`）→ 直接决定本阶段假设 §M7 的 `unknown` 语义推断条目 |
| `database-relations.md` | 表关系与血缘 | M1「聚合间关联（`aggregate_associations`）」的外键证据；M7 `joins` 的关联字段证据 |
| `database-access-matrix.md` | 功能 × 表的 R/C/U/D 矩阵 | 判定"某行为是否只写一个聚合"（M1 事务边界与 M2 原子性）的关键证据 |
| `data-ownership.md` | 数据归属与冲突 | 判定聚合归属与写入方；尤其「仅由初始化 SQL 写入」的表（`gen_*`、`QRTZ_*`）→ 决定这些表**不进 M1 聚合**（见 `01-modeling-decisions.md` D-04） |

### 2.5 不作为事实来源的输入

| 输入 | 处置 |
|---|---|
| `架构决策实验室架构方案1期-2.pdf` | **仅作旁证，不作事实来源**（`meta-index.md#1.1`）；本体建模不引用其结论 |
| `open-api/README.md`、仓库根 `README.md` | 中文乱码，仅提取 ASCII 信息（默认账号 `admin/admin123`、端口 5656）；账号信息同时由 `open-api/sql/` 初始化脚本交叉印证 |
| `docs/tools/*.json`（`assets.json`/`semantics.json`/`menus.json`） | 机器可读提取数据；本体建模**不依赖**它们的中间结果，只读由其生成的 25 份文档（避免与上游产物口径分叉），但对**可独立复核的计数**（端点、权限）做了源码级重新对账（见 §2.6） |

### 2.6 端点与权限计数的源码级对账（本阶段独立复核）

由于"184 端点 / 105 带权限 / 79 无权限"是 M5 与 M7 的关键分母，本阶段**未直接采信文档数字**，而是回到源码重新对账一次。方法：统计 24 个 Controller 中方法级 `@(Get|Post|Put|Delete|Patch)Mapping` 注解数，排除"仅渲染页面"的根路径 `@GetMapping()`（该类端点在上游文档 §0 总览表中确实未建节点），并对双路径注解做展开。

| 项 | 数值 | 说明 |
|---|---:|---|
| 方法级映射注解总数 | **200** | 分布在 24 个 Controller（另 `BaseController` 为抽象基类，0 个） |
| 其中根路径 `@GetMapping()`（渲染页面） | **17** | 全部为返回视图名的方法（如 `OpenAppController.app()` 返回 `"open/app/index"`） |
| 其中根路径 `@GetMapping()` **且带 `@RequiresPermissions`** | 11 | 如 `SysUserController.java:64` 的 `system:user:view` |
| 双路径注解展开（`SysDeptController.java:168` 的 `{ "/selectDeptTree/{deptId}", "/selectDeptTree/{deptId}/{excludeId}" }`） | **+1** | 上游文档把它拆为 `API-SysDeptController-selectDeptTree` 与 `-selectDeptTree-2` 两个 ID |
| ⇒ HTTP 端点节点总数 | **184** | `200 − 17 + 1`，与上游 `PROGRESS.md#4`、`interface-index.md`、`assets.json` **三方一致** |
| `@RequiresPermissions` 注解数（有效注解，非注释） | **112** | 全部落在系统域与调度域；`com.qvsu.open` 域 **0** |
| 其中落在根路径渲染方法上（不计入端点保护） | 11 | 见上 |
| ⇒ 受保护的端点节点数 | **101** | `112 − 11` |
| ⇒ 无权限码的端点节点数 | **83** | `184 − 101` |
| 上游文档口径 | 105 受保护 / **79 无权限** | 与本次对账存在 **+4 / −4** 的差异（上游多算 4 个受保护端点） |

> **对账结论（事实）**：端点总数 **184 三方一致**，可以放心使用；"受保护 105 / 无权限 79"与源码的逐行对账结果 **101 / 83** 存在 **4 个端点的差异**。
> **本体处置**：**数量以源码对账为准（101 / 83）**；但**不改变任何定性结论**——`com.qvsu.open` 域的 36 个端点（含 4 个高危写操作）与 `/selftest/**`、`/common/**` 的无鉴权事实不受影响（该域 `@RequiresPermissions` 实测为 0，见 `02-assumptions-and-open-questions.md` A-M5-02）。
> **差异未定位到具体端点**，已登记为假设条目（`02-assumptions-and-open-questions.md` A-M5-08 `[待确认]`），需人工在 `interface-index.md#3` 的 79 项清单与此处 83 项的差集上逐条核对。

---

## 3. 七模型清单、职责、产出文件与建模顺序

### 3.1 模型清单

| 编号 | 模型名称 | 核心职责 | 产出文件 | 在本项目中的主要输入 | 规模预估（依据上游） |
|---|---|---|---|---|---|
| **M1** | 对象模型 Object Model | 聚合根 / 子实体 / 值对象 / 属性 / 数据字典 / 聚合不变性 / 聚合间关联 | `docs/ontology/yaml/m1-object-model.yaml` | `domain-model.md`（33 OBJ）、`database-model.md` + `database-schema.md`（34 表 342 字段）、`database-relations.md` | 候选聚合根：业务域 5 个（`OpenApp`/`OpenApi`/`OpenApiDoc` 及需判定的 `OpenAppApi`/`OpenCallLog`）+ 平台域 4 个（`SysUser`/`SysRole`/`SysMenu`/`SysDept`）+ 调度域 1 个（`SysJob`）；**注意 `domain-model.md` 已标聚合根的只有 6 个**（见 §4.1） |
| **M2** | 行为模型 Behavior Model | 原子行为（COMMAND/QUERY）、触发类型、前置/后置条件、`appliedRules`、`requiredPermissions`、`syncTriggers`、`queryReportRef` | `docs/ontology/yaml/m2-behavior-model.yaml` | `functional-inventory.md`（29 FUNC，建模开始时 32）、`business-function-requirements.md`（主流程/状态变化）、`function-chain-index.md`、`interface-index.md`（184 端点） | 每个 FUNC 通常拆出 2–6 个原子行为（"新增保存/修改保存/删除/导出"各算一个），并补齐 M7 所需的 QUERY 行为；**注意** 184 个端点中"GET 渲染页"不建行为（见 §4.2） |
| **M3** | 规则模型 Rule Model | 跨对象 / 跨行为 / 需独立复用的业务决策规则（VALIDATION/CALCULATION/DERIVATION/TRANSFORMATION/RISK） | `docs/ontology/yaml/m3-rule-model.yaml` | `domain-model.md` 的 RULE、`business-function-requirements.md` 的「业务规则」字段、`interface-index.md` 的失败分支 | 上游显式 `RULE-*` 很少；大部分候选规则是**从代码行为反推的隐含规则**（"先删后建"式授权保存、唯一性校验、状态门禁），须逐条标注证据等级 |
| **M5** | 主体模型 Actor Model | 参与者（HUMAN/SYSTEM）、角色（含继承）、权限（BEHAVIOR/ENTITY + dataScope + ABAC）、权限组 | `docs/ontology/yaml/m5-actor-model.yaml` | `domain-model.md` 的 `SysRole`/`SysUser`、`business-architecture.md#5`（菜单与按钮权限）、`interface-index.md#3`（权限缺口）、`open-api/sql/*menu*.sql`（权限码真值） | 权限码 55 个（`PROGRESS.md#2`）；角色真值须从 `sys_role` 种子数据与 `DataScopeAspect` 反推；**`open:*` 15 个权限码无代码侧校验**（§4.2） |
| **M6** | 流程模型 Flow Model | 端到端协同流（COLLABORATION）与审批流（APPROVAL）、活动/网关/分支/子流程 | `docs/ontology/yaml/m6-flow-model.yaml` | `flow-index.md`（10 条 FLOW）、`business-architecture.md#4`（9 个 SCN）、`function-chain-index.md` | **不存在审批流引擎**（§4.5）；10 条 FLOW 全部折算为 `COLLABORATION`，`APPROVAL_TASK` 类活动预计为 0 个 |
| **M7** | 查询统计与报表模型 Query & Report Model | 跨对象查询/统计/固定报表的来源、关联、参数、条件、结果列、分组、排序、分页、可选参考 SQL | `docs/ontology/yaml/m7-report-model.yaml` | `interface-index.md` 的 `*/list`、`*/export*`、`/admin/open/log/stats`、`/admin/open/doc/*`、`database-schema.md` | 主要来源：21 个菜单功能 + 各模块 `.../list` 端点（PageHelper 分页）+ 2 个导出（`OpenLogController.exportCsv`、`SysJobLogController.export` 等）+ 1 个统计（`log/stats`） |
| **MU** | UI 模型 UI Model | 总体界面 → 一级菜单 → 二级菜单 → 屏幕（ASCII 布局 + 元素）→ 操作功能点（→ M2 行为） | `docs/ontology/yaml/mu-ui-model.yaml` | `business-architecture.md#5`（菜单树）、`templates/**` 的 71 个在范围模板、`SysMenuMapper.xml` 按钮权限、`interface-index.md` | 一级菜单真值 **2 个**（系统管理、OpenAPI管理），二级菜单真值 **14 个 + 外链 1 个**；框架示例页必须排除（§4.6） |

### 3.2 建模顺序（技能 §阶段二建议顺序）

```text
① M1 对象模型         —— 先定聚合边界与属性，是一切引用的根
        ↓（提供 ownerEntity / sourceObjects）
② M5 角色（先只做 roles/actors，不填 permissions）
        ↓（提供 roleId，供 M6 人工活动与 M2 权限声明使用）
③ M3 规则模型         —— 只依赖 M1，可以早做
        ↓（提供 ruleId，供 M2.appliedRules 与 M6.ruleRef 引用）
④ M2 行为模型         —— 依赖 M1 + M3 + M5(角色)；填写 appliedRules / requiredPermissions / syncTriggers
        ↓（提供 behaviorId）
⑤ M7 查询报表模型     —— 依赖 M1；与 M2 的 QUERY 行为一对一绑定
        ↓（提供 queryReportRef，回填 M2 的 queryReportRef）
⑥ M5 权限（补齐 permissions/权限组）—— 依赖 M2 的 behaviorId 作为权限目标
        ↓（提供 permissionId，回填 M2.requiredPermissions 与 MU.actionPoint.permissionRef）
⑦ M6 流程模型         —— 依赖 M1 + M2 + M3 + M5(角色)
        ↓
⑧ MU UI 模型          —— 依赖 M1 + M2 + M6 + M7；最后做，才能把功能点全部挂到已存在的行为上
```

> **为什么 M5 拆成两次（② 与 ⑥）**：`M5-spec.md#5.1` 明确「权限定义不内嵌于行为模型，而是在行为模型中声明 `requiredPermissions`，在主体模型中定义权限的授予关系」。因此必须先有角色（供 M6 人工活动 `roleRef` 使用），再在 M2 行为 ID 稳定后补齐权限到行为的绑定，避免图省事写成"先编权限 ID、再让 M2 去凑"。

### 3.3 模型间引用关系（ASCII 关系图）

```text
                         ┌──────────────────────────────────────────────┐
                         │              M1  对象模型                     │
                         │  聚合根 / 子实体 / 值对象 / 属性 / 数据字典    │
                         │  aggregate_associations（聚合间 ID 引用）      │
                         └──────────────────────────────────────────────┘
                              ▲        ▲          ▲            ▲
               ownerEntity    │        │          │            │  sourceObjects
               sourceField    │        │          │            │  joins
                              │        │          │            │
        ┌─────────────────────┘        │          │            └──────────────────┐
        │                              │          │                               │
┌───────┴────────┐          ┌──────────┴───┐  ┌───┴──────────┐          ┌─────────┴────────┐
│  M2  行为模型   │          │ M3  规则模型  │  │ M5  主体模型  │          │ M7 查询报表模型   │
│ COMMAND/QUERY  │          │ 只判断/计算   │  │ 参与者/角色/  │          │ 来源/关联/条件/   │
│ pre/postcond.  │          │ 不改状态      │  │ 权限/权限组   │          │ 结果列/分组/排序  │
└───────┬────────┘          └──────┬───────┘  └───┬──────────┘          └─────────┬────────┘
        │  appliedRules            │              │  requiredPermissions          │
        │ ─────────────────────────┘              │  ◄────────────────────────────┘
        │  requiredPermissions ──────────────────► │        （M7 不定义权限）
        │                                          │
        │  syncTriggers.behaviorRef  ──► 另一个聚合的 M2 行为（跨对象同步联动）
        │                                          │
        │  queryReportRef ◄──── 严格一对一 ────► M7.behaviorRef
        │                                          │
        └──────────────────┬───────────────────────┘
                           │  behaviorRef / roleRef / ruleRef
                           ▼
                 ┌───────────────────────────┐
                 │      M6  流程模型          │
                 │ COLLABORATION / APPROVAL  │
                 │ 活动链 + 网关 + 子流程     │
                 │ SUB_FLOW_CALL 调用图无环   │
                 └───────────┬───────────────┘
                             │  flowRef（屏幕触发/承载的流程）
                             ▼
                 ┌───────────────────────────┐
                 │      MU  UI 模型           │
                 │ 应用 → 一级菜单 → 二级菜单  │
                 │   → 屏幕(ASCII) → 操作功能点│
                 │  actionPoint.behaviorRef ──┼──► 回到 M2（可追溯门禁）
                 └───────────────────────────┘

引用方向汇总（技能 §1.3 关键设计决策 1–7）：
  M1 ← M2/M3/M5/M6/M7/MU（全员引用 M1）
  M3 ← M2.appliedRules、M2.syncTriggers.ruleRef、M6.ruleRef
  M5.roles ← M6.roleRefs / activity.roleRef（M6 只能引用角色，不得引用 actorId 或自由文本）
  M2 ← M6.trigger.behaviorRef / activity.behaviorRef、MU.actionPoint.behaviorRef
  M7 ← M2.queryReportRef（一对一，双向一致）
  M7 ✗→ M3 / M5 / M6（禁止跨模型引用）
```

---

## 4. 本体建模与上游逆向的映射关系表

### 4.1 `OBJ-*` → M1 聚合根/实体/值对象

| 上游来源 | 上游事实 | 本体映射规则 | 本项目的实际情况 |
|---|---|---|---|
| `domain-model.md#1` 33 个 OBJ | entity 23 / DTO 6 / value-object 4；**仅 6 个标"聚合根=是"** | 标"聚合根=是"的 → M1 `aggregateType: AGGREGATE_ROOT`；DTO 与非持久化 value-object → **不进 M1 聚合**（属技术契约）；其余 entity → 需按 `M1-spec.md#2.2.2` 聚合识别指南逐个人工判定为「聚合根」或「子实体」或「独立聚合」 | **判定的最大难点**：19 个关联表/日志表/字典表（`SysUserRole`、`SysRoleMenu`、`SysRoleDept`、`SysUserPost`、`SysOperLog`、`SysLogininfor`、`SysUserOnline`、`SysJobLog`、`OpenAppApi`、`OpenCallLog` 等）在 `domain-model.md` 里都被称为 entity，但**没有任何一个是"必须与另一个对象同生共死"**，按 `M1-spec.md` 的聚合五维判据（业务完整性/生命周期/事务边界/访问路径/引用方式）多数应落为**独立聚合根**或**聚合间关联**，少数落为**子实体**。逐条判断见 `01-modeling-decisions.md` D-01～D-05 |
| `domain-model.md#3` 继承关系 | 19 个对象继承 `BaseEntity` / `TreeEntity` / `OptBaseEntity` | 继承的公共字段（`createBy`/`createTime`/`updateBy`/`updateTime`/`remark`，开放域另含审计与逻辑删除）**不逐个展开为 M1 属性**，按"跨聚合通用审计字段"统一处理 | `OptBaseEntity` 为开放域 5 个对象共用的 14 字段基类（`domain-model.md#OBJ-OptBaseEntity`）→ 应作为**值对象/公共属性模板**而非实体 |
| `domain-model.md#4` | 11 张 `QRTZ_*` 表无 Java 实体 | `QRTZ_*` **不进 M1**（Quartz 框架内部表，无业务语义） | 事实：`ScheduleConfig` 自述内存模式，`QRTZ_*` 当前**不被 JDBC JobStore 使用**（`technical-architecture.md#Quartz 调度`）→ 更强化"不进 M1"的结论 |
| `database-model.md` + `database-schema.md` | 34 表 / 342 字段 | M1 属性名取 Java 字段 camelCase，`label` 取中文注释或模板标签；`type` 按 `M1-spec.md#2.3.4` 的 DataType 映射 | 344 字段中部分**无中文标签**（`unknown`），须标假设 |
| `SysDictType`/`SysDictData` | 字典类型 4 字段、字典数据 9 字段 | → M1 `data_dictionaries`（`dictionaryId` = `sys_dict_type_id`，`typeCode` = `dict_type`） | 已有字典表实体，直接可映射；`M1-spec.md#2.3.5` 规定字典项**平级、不允许 parentCode** |

**已明确的 6 个聚合根（事实，`domain-model.md#1` 直接标注）**：`SysUser`、`SysRole`、`SysMenu`、`SysDept`、`OpenApp`、`OpenApi`。

### 4.2 `FUNC-*` → M2 行为

| 上游来源 | 映射规则 | 本项目的实际情况 |
|---|---|---|
| `functional-inventory.md` 的 FUNC（当前 29 个；建模开始时 32 个） | **1 个 FUNC ≠ 1 个 M2 行为**。FUNC 是"业务功能"（可含多个页面动作），M2 行为是"原子操作"。拆分规则：一个 FUNC 的 CRUD 各动作 → 独立行为；"新增保存"与"修改保存"是**两个**行为；"导出"若产生独立业务结果 → 独立 QUERY 行为 | 以 `FUNC-open-app-manage` 为例，其端点有 `list`、`add`（GET 渲染）、`addSave`、`edit`（GET 渲染）、`editSave`、`remove`、`resetSecret` → 至少拆出 5 个行为（含 `resetSecret` 这一**有独立业务语义的重置密钥行为**，典型易漏项） |
| `functional-inventory.md` 的"触发类型"列 | `menu`(21) → `triggerType: USER_ACTION`；`api-only` / `scheduled` / `startup-lifecycle` → `triggerType: SYSTEM`（`M2-spec.md#3.2.1` 只允许 USER_ACTION / SYSTEM 两值） | **门禁关键**：21 个 menu 触发的 FUNC 的行为必须是 `USER_ACTION`，且**必须被至少一个 MU 功能点引用**；非 menu 触发的 FUNC 的行为只能是 `SYSTEM`，**不得**出现在 MU 功能点里。**注意**：`FUNC-common-upload` 之类的 `api-only` 功能其实是**页面 AJAX 触发的人工动作**，标为 `SYSTEM` 会使上传按钮在 MU 中失去追溯链（见 `02-…` A-M2-04） |
| `business-function-requirements.md` 的「主流程」「状态变化」 | → M2 `preconditions` / `postconditions` | 例：`FUNC-sys-login` 状态变化「`sys_user.login_date/login_ip` 更新；`sys_logininfor` 新增；Shiro 会话创建」→ 跨 3 个对象，须拆为**登录行为 + 同步联动（`syncTriggers`）写日志** |
| `business-function-requirements.md` 的「业务规则」 | → 优先 `M1.refRules`/`invariants`，跨对象才进 M3，由 `M2.appliedRules` 引用 | 判定顺序严格按 `M3-spec.md#4.1.1` |
| `interface-index.md` 184 端点 | 每个端点**不**自动等于一个行为（`GET .../add` 只是渲染表单页，`POST .../add` 才是行为） | 事实：菜单功能普遍是"GET 渲染 + POST 提交"成对出现（如 `API-SysConfigController-add` 与 `-addSave`）。**只有 POST 写操作与 `.../list` 查询才是行为候选**，GET 渲染页归属 MU 屏幕而非 M2 |

### 4.3 `RULE-*` / 业务规则 → M3 规则

| 上游来源 | 映射规则 | 本项目的实际情况 |
|---|---|---|
| `domain-model.md` 的 `RULE-*` | 直接映射为 M3 `rules[]`，保留 ID 语义 | 上游显式 RULE 数量少，需要 M3 建模时逐条核对实际覆盖 |
| `business-function-requirements.md`「业务规则」字段 | **分层归位**，不是一律进 M3 | 例：`FUNC-sys-login`「密码连续错误次数受 `user.password.maxRetryCount=5` 限制」→ 只依赖单个用户的计数状态，**跨请求**，落 M3（VALIDATION/RISK）；「验证码由开关控制」是**配置读取**，更接近 `preconditions` 而非规则 |
| `function-chain-index.md`「规则与状态」节 | 交叉印证 M3 归属与 `reusedBy` 反查 | 用于填写 `reusedBy` |
| `interface-index.md#3` 高危缺权限端点 | **不**映射为规则；权限缺口归 M5（§4.4）与假设清单 | 例：`POST /admin/open/app/resetSecret` 无权限码 → M5 假设条目，不是 M3 规则 |
| 代码中显式的"先删后建"式实现 | → M3 CALCULATION/TRANSFORMATION 或 `invariants` | 例：授权保存（`OpenAuthController.save`）在 `open_app_api` 上"按应用整体替换授权集合"→ 是否需要"至少保留一条授权""授权集合非空"这类规则，**代码未声明**，属隐含规则假设 |

### 4.4 `MENU-*` / `COMMON-*` / `CAPI-*` → M5 主体与权限

| 上游来源 | 映射规则 | 本项目的实际情况 |
|---|---|---|
| `business-architecture.md#5` 菜单主定义（M 2 + C 14 + 外链 1） | 菜单 `perms` 列（C 类 `xxx:view`）→ M5 权限；菜单树 → **MU**（不是 M5） | **必须区分**：菜单节点本身进 MU；菜单携带的 `perms` 与 F 类按钮权限进 M5 |
| `business-architecture.md#5.5` F 类按钮权限 50 个 | → M5 `permissions[]`，`targetType: BEHAVIOR`，`targetRef` 指向 M2 行为 ID | 事实依据：`open_api_menu.sql:14-26` 的 F 类 `perms`（`open:app:add` 等）；按钮权限的 `menu_id` 父子关系给出**权限到页面的归属**，可反推权限应绑定到哪个屏幕的功能点 |
| `common-capability-index.md` `COMMON-*` / `CAPI-*` | 公共能力**不**直接变成 M5 权限；只有"某能力被某角色/某行为消费"时才体现为 M2 `requiredPermissions` | 例：文件上传（`COMMON-*`）**无独立权限码**（`API-CommonController-uploadFile` 在 79 缺口清单中），因此 M5 中的上传权限只能标为**缺口假设** |
| `domain-model.md` `SysRole` / `SysUser` / `SysRoleMenu` / `SysRoleDept` / `SysUserRole` | → M5 `actors` / `roles`（`inheritsFrom` 视 `sys_role` 数据；`dataScope` 视 `sys_role.data_scope`） | **注意**：本体规范支持角色多继承（`M5-spec.md#5.3.2`），而 RuoYi 系 `sys_role` 表**无父角色字段** → 应判为"无继承"，而非凭空造继承关系 |
| `technical-architecture.md#AOP` `DataScopeAspect` | → M5 `permission.dataScope` + `abacCondition` | 事实：`DataScopeAspect` 依据角色 `dataScope` 拼 SQL 过滤条件（`technical-architecture.md` AOP 表）→ 这正是 `dataScope` 的代码依据；但 **`com.qvsu.open` 域未使用 `@DataScope`** → 开放域权限的 `dataScope` 只能是假设 |

### 4.5 `flow-index.md` 端到端流程 → M6

| 上游来源 | 映射规则 | 本项目的实际情况 |
|---|---|---|
| `flow-index.md#流程总览` 10 条 FLOW | 每条 FLOW → M6 `flows[]` 一个 `COLLABORATION` 流程；步骤 → `activities[]`；分支表 → `GATEWAY` + `branches[]` | 10 条：`FLOW-OPEN-GATEWAY`、`FLOW-ADMIN-LOGIN`、`FLOW-RBAC-AUTHZ`、`FLOW-APP-ONBOARD`、`FLOW-INTERFACE-DEFINE`、`FLOW-CALLLOG-QUERY`、`FLOW-QUARTZ-JOB`、`FLOW-SELFTEST`、`FLOW-OPER-AUDIT`、`FLOW-FILE-IO` |
| `flow-index.md#流程间的依赖关系` | → M6 `SUB_FLOW_CALL` 候选 | 8 条前置/后置依赖（如 `FLOW-APP-ONBOARD → FLOW-OPEN-GATEWAY`）。**必须检查调用图无环**（技能门禁 3） |
| `flow-index.md` 的参与者/角色行 | → M6 `roleRefs` + 活动 `roleRef` | **难点**：`flow-index.md` 的参与者多为"管理员""第三方应用""网关""Quartz"，其中"管理员"是**自然人描述而非 M5 角色 ID**；`M6-spec.md#6.1` 强制"只能引用 `roleId`，不得填写自由文本"。→ 必须先确认 M5 中是否存在 ADMIN 角色及其 `roleId`，否则流程一律标假设 |
| 「是否存在审批流」 | 检索证据 | **结论（事实）：本系统不存在任何审批流引擎或审批实现。** 证据：① 全仓检索 `approval`/`approve`/`workflow`/`activiti`/`flowable`/`camunda`/`processInstance`/`会签`/`驳回`/`退回` 无业务命中（只有 RuoYi 自带注释与文档措辞）；② 10 条 FLOW 全部为技术/协同流，**无一条是"提交—审批—通过/驳回"结构**；③ `functional-inventory.md` 32 个 FUNC 中**无任何"审批"类功能**；④ 对象 `domain-model.md` 33 个 OBJ 中**无审批单/审批任务/审批记录实体**。→ M6 `flowType: APPROVAL` 的流程预计为 **0 个**，`APPROVAL_TASK` 活动为 **0 个** |
| 9 个 `SCN-*` 业务场景 | → M6 流程的候补（场景比流程粗） | `business-architecture.md#4` 的 9 个场景中，`SCN-open-gateway-call` 标题含"限流"但**限流未实现**（`business-architecture.md#7.3`）→ M6 该流程不得含限流活动 |

### 4.6 `interface-index.md` 的列表查询 → M7

| 上游来源 | 映射规则 | 本项目的实际情况 |
|---|---|---|
| `interface-index.md` 中的 `POST .../list` 端点 | → M7 `objectType: LIST_QUERY`，并与一条 M2 QUERY 行为严格一对一 | 事实：各模块均以 `POST .../list` 承载 PageHelper 分页（`TableDataInfo` 为分页响应结构，`domain-model.md#OBJ-TableDataInfo`）；端点清单如 `API-SysConfigController-list`、`API-OpenAppController-list`、`API-OpenLogController-list`、`API-SysJobLogController-list` |
| `.../export`、`exportCsv` 端点 | → M7 用途区分：**只导出当前查询结果 → 仍属 LIST_QUERY**；**带固定列/分组/小计/合计 → `objectType: REPORT` 并填 `reportOptions`** | 事实：`API-SysConfigController-export`、`API-SysDictTypeController-export`、`API-SysUserController-export`、`API-SysJobController-export`、`API-SysJobLogController-export`、`API-OpenLogController-exportCsv`；**判定"是否有固定列/小计"必须回模板与导出实现取证**，取证不足时标假设 |
| `API-OpenLogController-stats` | → `objectType: STATISTICAL_QUERY` | 事实：`GET /admin/open/log/stats` 是唯一明确的统计端点 → 至少 1 个统计查询对象 |
| `API-OpenDocController-list` / `-apis` / `-download` | → 需判定：文档列表是"M7 查询"还是"页面渲染数据源" | `M7-spec.md#7.2` 规定「单聚合简单查询可独立定义为 M2 QUERY 行为，**不要求** M7」；`OpenDocController.list` 返回 HTML 视图（`produces` 未声明 JSON）→ 归 MU 屏幕数据源，**不建 M7 对象**（判断理由见 `01-modeling-decisions.md` D-14） |
| 权限 | M7 **不得**出现 `requiredPermissions`/`roleRefs`/`ruleRefs` | 数据访问权限仍由 M2 行为的 `requiredPermissions` 承载（`M7-spec.md#7.1`） |

### 4.7 `interface-index.md` + 模板 → MU

| 上游来源 | 映射规则 | 本项目的实际情况 |
|---|---|---|
| `business-architecture.md#5.2` 菜单树 | 一级菜单 → `menuId`；二级菜单 → `children[]` + `screenRef`；**强制两级**（`MU-spec.md#8.2.2`） | 真值：一级 **2 个**（`MENU-sys-root` 系统管理、`MENU-open-root` OpenAPI管理）；二级 **15 个 C 类 + 1 个外链**（外链 `menu_id=4` qvsu官网 → `ENTRY-external-homepage`，**不建屏幕**）。其中 `MENU-job-manage`（`menu_id=110`，`/monitor/job`）来自 `sql/quartz.sql:191-208`，上游文档记为"第 15 个 C 类菜单" |
| 菜单 `url` 列 | → 屏幕的 URL（用于 MU 屏幕定位） | 事实：`/system/user`、`/system/role`、`/admin/open/app` 等；**注意 `HOT-ROUTING-CONTRACT`**：`sys_menu.url` 与模板内 `ctx + "..."` 硬编码路径之间**无校验约束**，菜单改动可能静默 404（`change-hotspots.md`、`PROGRESS.md#Q-menu-routing-contract`） |
| `templates/**`（范围内 71 个） | → 屏幕 `screenType` 判定 + ASCII 布局 + `elements` | 判定依据：模板内是否有工具栏+表格+独立新增/编辑页（`LIST_MAINTENANCE`）、是否有查询条件区+结果表（`QUERY_LIST`）、是否有主表+从表（`MASTER_DETAIL_FORM`）、是否单条表单（`SINGLE_FORM`） |
| `templates/**`（排除 73 个） | **框架示例页必须排除**，不得建屏幕 | 事实依据：`PROGRESS.md#1` 排除 `templates/demo/**`；`_CONTEXT-FOR-AGENTS.md#2.5-4` 明确"RuoYi 自带 `templates/demo/**` 示例页必须作为范围排除登记"。实测 `templates/demo/**` 计 73 个 `.html` |
| F 类按钮权限（57 个） | → 屏幕 `actions[]`（`actionType: BUTTON`）或 `DRAFT`/`SUBMIT`/`APPROVE`/`REJECT`/`RETURN` | **关键偏差**：`MU-spec.md#8.5` 强制"带审批功能必须含保存草稿/提交双按钮"，但本系统**无审批流** → 该强制条款在本项目中**不适用**，不得为凑双按钮而虚构 `DRAFT`/`SUBMIT` 功能点（见 `01-modeling-decisions.md` D-19） |
| 菜单未见但源码存在的页面（如 `/monitor/job`） | → 必须建屏幕（源码是事实） | 事实：`SysJobController` 存在于源码且带 `monitor:job:*` 权限码（`SysJobController.java:44-197`），菜单来自 `sql/quartz.sql` 而非 `menus.json`（`business-architecture.md#7.2`）→ 该屏幕必须建，并登记其菜单来源举证为"源码补入" |
| 无菜单功能（当前 6 个；建模开始时 9 个） | **不建一级/二级菜单，不建屏幕** | `MU-spec.md#8.2.2` 要求"二级菜单与屏幕一对一"；无菜单功能没有菜单 → 无法挂屏幕。这些功能的 `USER_ACTION` 行为不会存在（它们以 `SYSTEM` 触发），因此不违反可追溯门禁 |

---

## 5. 一致性门禁与自检口径（强制）

本体 YAML 产出后，必须逐条核对技能 §阶段二的「一致性门禁（强制）」。本阶段文档预先给出**核对方法与依据来源**，使门禁可被机械复核。

| # | 门禁要求（技能原文） | 核对方法 | 依据来源 | 本项目预期结论 |
|---|---|---|---|---|
| G1a | M2 `triggerType=USER_ACTION` 行为须被至少一个 MU 操作功能点引用 | 取 M2 中所有 `USER_ACTION` 行为的 `id` 集合 A；取 MU 所有 `actionPoint.behaviorRef` 集合 B；断言 **A ⊆ B** | `M2-spec.md#3.4-1`、`MU-spec.md#8.2.5` | 预期通过；风险点在"GET 渲染页被误建为行为"（§4.2 已设抑制规则） |
| G1b | MU 引用行为须存在 | 断言 MU 中每个 `behaviorRef` ∈ M2 `behaviors[].id` | 同上 | 预期通过 |
| G2 | M7 `behaviorRef` ↔ M2 `queryReportRef` 严格一对一 | 构建双向映射：`M7.behaviorRef → M2.id` 与 `M2.queryReportRef → M7.id`；断言两集合元素个数相等、无一对多 | `M7-spec.md#7.6-3`、`M2-spec.md#3.4-5` | 预期通过；**风险点**：同一列表页若被拆成"列表查询 + 导出"两条 QUERY 行为却只建一个 M7 对象，会破坏一对一 |
| G3a | M6 的 `roleRef`/`behaviorRef`/`subFlowRef`/`ruleRef` 引用均须存在 | 四类引用分别对 M5 `roles.roleId`、M2 `behaviors[].id`、M6 `flows[].id`、M3 `rules[].id` 求交集 | `M6-spec.md#6.6` 跨模型引用矩阵 | **高风险**：`flow-index.md` 用"管理员/网关/Quartz"等自然人描述指代参与者，M5 中可能不存在对应 `roleId` → 须先补 M5 角色或用 `SYSTEM_TASK` 表达 |
| G3b | `SUB_FLOW_CALL` 调用图无环 | 对 `flows[].activities[activityType=SUB_FLOW_CALL].subFlowRef` 建有向图，做拓扑排序/DFS 环检测 | `M6-spec.md#6.5-5` | 预期通过；数据上 `flow-index.md#流程间的依赖关系` 是链式（LOGIN→RBAC→APP-ONBOARD→GATEWAY→CALLLOG），无环 |
| G4 | 每个正式查询报表与唯一 M2 QUERY 行为双向一对一；联动描述中规则条件与结论不混写 | 同 G2；并抽查 `syncTriggers[].description` 是否把"条件结论"写进了源行为（应拆为 `ruleRef` + 目标行为） | `M7-spec.md#7.6-2/3`、技能 §1.4 强制语义边界 | 预期通过；**风险点**：`FUNC-open-gateway-invoke` 的"鉴权→路由→转发→日志"若写成一条长行为会破坏原子性，须拆成多行为 + `syncTriggers` |
| G5（附加，本项目特有） | M5 中 `permissions[].targetRef` 指向的 `behaviorId` 必须存在；`open:*` 15 个权限码因**无代码侧校验**，其 `targetRef` 只能推断，须逐条标 `[待确认]` | 断言 `targetRef` ∈ M2 `behaviors[].id`；并对 `open:*` 权限单独出假设清单 | `interface-index.md#3`、`open_api_menu.sql:8-26`、§4.4 | **将产生最多假设条目** |
| G6（附加，本项目特有） | MU 屏幕必须能追溯到真实模板文件；被排除的 73 个模板不得出现在 MU | 逐个 `screenRef` 对应的模板路径须存在且不在排除清单内 | `PROGRESS.md#1`、`source-coverage-report.md#1` | 预期通过 |

### 5.1 与上游逆向的口径差异（必须在 YAML 与本体校验中保持一致）

| 差异点 | 上游口径 | 本体口径 | 处置 |
|---|---|---|---|
| 菜单数量 | `business-architecture.md#5.1` 写 **C 14 + M 2 + F 50**；`business-architecture.md#7.1/#7.2` 指出任务书要求的"33 C + 5 M"是**方言副本累计行数**（33 = 11×3），且 `sql/quartz.sql` 的 `menu_id=110` **未被提取脚本收录**；`PROGRESS.md#Q-menu-extraction-scope` 已把去重真值更正为 **C 15 / F 57 / 权限码 71**（提取脚本已修复） | MU 取**去重真值**，屏幕全集 = **15 个 C 类业务页面**（含 `menu_id=110` `/monitor/job`）；F 类按钮权限按 57 个登记 | 采用 `PROGRESS.md` 的最新口径（去重真值），并在 `02-assumptions-and-open-questions.md` A-MU-01 登记为待确认项；`business-architecture.md` 的旧计数待上游同步 |
| 对象数量 | 33 个 OBJ（含 6 DTO、3 基类 + 1 上下文） | M1 聚合/实体数量**必然远小于 33**，因为多数关联表/日志表被判为独立聚合或非聚合 | 必须在 `01-modeling-decisions.md` 逐条给出"哪些 OBJ 未进 M1、为什么"，避免出现"33 个 OBJ 消失了"的无解释缺口 |
| 端点与权限 | 184 端点 / 105 带权限 / **79 无权限**；`PROGRESS.md#Q-79-endpoints-without-permission` 另载"`com.qvsu.open` 7 个 Controller 的 36 个管理端点全部无权限码"；`open:*` 权限码只存在于菜单 SQL | 端点总数 184 **不变**；受保护/无权限按源码逐行对账为 **101 / 83**（见 §2.6）。M5 的 `permissions[]` 必须把"菜单 SQL 声明的权限"与"代码实际校验的权限"**分成两个证据等级** | 数量取源码对账（101 / 83），差异登记为 A-M5-08；定性结论（`com.qvsu.open` 域零权限校验）不变，见 §4.4 与 A-M5-02/A-M5-03 |

---

## 6. YAML 产出应满足的形态要求（供并行 YAML 任务对齐）

本文件不产出 YAML，但为对齐其他子任务的产出，这里固定"应当产出什么"的最小骨架（字段语义见 `_spec/`）。

| 文件 | 顶层键 | 必填要点 |
|---|---|---|
| `m1-object-model.yaml` | `model_type: OBJECT`、`version`、`domain`、`aggregates`、`data_dictionaries`、`aggregate_associations` | 每个聚合含 `id/name/alias/aggregateType/description/lifecycle/attributes/entities/valueObjects/invariants/tags`；`AggregateRootRef` 属性必须写 `targetAggregate`；`DictionaryRef` 必须写 `dictionaryRef` 且**不得**同时写 `enumValues` |
| `m2-behavior-model.yaml` | `model_type: BEHAVIOR`、`behaviors` | 每个行为含 `id`（`{EntityAlias}_{ActionName}`）/`name`/`ownerEntity`/`behaviorType`/`triggerType`/`preconditions`/`postconditions`/`appliedRules`/`requiredPermissions`/`syncTriggers`；QUERY 行为须写 `queryReportRef` 且 `syncTriggers` 为空数组 |
| `m3-rule-model.yaml` | `model_type: RULE`、`rules` | 每条含 `id`（`RULE-{Domain}-{Seq}`）/`name`/`ruleType`/`description`/`inputParams`/`outputType`/`expression`/`reusedBy`/`version`；无副作用 |
| `m5-actor-model.yaml` | `model_type: ACTOR`、`actors`、`roles`、`permissions` | `permission.targetType` ∈ {BEHAVIOR, ENTITY}；`dataScope` ∈ {ALL, OWN, DEPT, CUSTOM}；**不得**出现 `ExternalEntity`、`externalContract`（v9.0 已裁剪） |
| `m6-flow-model.yaml` | `model_type: FLOW`、`flows` | 每条含 `id`（`FLOW-{DOMAIN}-{NNN}`）/`flowType`/`businessObjectRefs`/`roleRefs`/`trigger`/`preconditions`/`postconditions`/`startActivity`/`endActivities`/`activities`/`version`；`USER_TASK`/`APPROVAL_TASK` 必填 `roleRef` |
| `m7-report-model.yaml` | `model_type: REPORT`、`query_reports` | `objectType` ∈ {DETAIL_QUERY, LIST_QUERY, STATISTICAL_QUERY, REPORT}；**必须且只能有一个** `primary: true` 来源；两个以上一对多来源同时聚合时必须写 `preAggregation`，禁止 `SUM(DISTINCT ...)` |
| `mu-ui-model.yaml` | `model_type: UI`、`application`、`screens` | 菜单**强制两级**，一级菜单至少一个二级菜单；只有二级菜单有 `screenRef`；ASCII 布局只用 `┌ ─ ┐ └ ┘ │ ├ ┤` 与 `[txt]`/`(cbo)`/`{dtp}`/`[psl…]`/`@grd` 标注，且布局中每个 `elementId` 必须在 `elements` 中存在 |

### 6.1 一致性门禁的可机械检查清单

```text
[G1]  A = M2.behaviors[triggerType==USER_ACTION].id
      B = MU.screens[*].actions[*].behaviorRef
      断言 A ⊆ B；断言 B ⊆ M2.behaviors[*].id
[G2]  断言 count(M7.query_reports) == count(M2.behaviors[behaviorType==QUERY])
      断言 M7[i].behaviorRef == 该 M2 行为的 id（双向、一对一）
[G3]  断言 M6.flows[*].roleRefs ∪ 活动 roleRef ⊆ M5.roles[*].roleId
      断言 M6.behaviorRef ⊆ M2.behaviors[*].id
      断言 M6.ruleRef ⊆ M3.rules[*].id
      断言 SUB_FLOW_CALL 图无环
[G4]  断言 M7 对象内不出现 requiredPermissions / roleRefs / ruleRefs / flowRefs
[G5]  断言 M5.permissions[*].targetRef ⊆ M2.behaviors[*].id
[G6]  断言 MU.screens[*].screenRef 对应模板存在，且不在 73 个排除模板内
```

---

## 7. 与「正向开发」的差异说明（存量系统逆向后补建本体）

### 7.1 根本差异

| 维度 | 正向开发（技能默认路径） | 本项目（逆向后补建） |
|---|---|---|
| 输入 | 阶段一产出的《需求规格说明书 V9》，其**附录 C 七模型建模输入基线**是确定性输入 | 25 份逆向元模型文档；**没有需求基线**，语义来自代码 |
| M1 的来源 | 业务对象访谈 + 领域建模 | 已有 34 张表与 33 个 Java 对象的**既成事实**；聚合边界要"反向推导"，而不是"正向设计" |
| M2/M3 的来源 | 需求文档的"业务规则"字段 | `business-function-requirements.md` 的规则字段 + **从代码行为反推的隐含规则** |
| M5 的来源 | 阶段一阶段六「角色权限」确认 | `sys_role`/`sys_menu` 种子数据 + 代码注解；**权限缺口是常态而非例外** |
| M6 的来源 | 阶段一阶段四「端到端协同流与审批流」 | `flow-index.md` 的 10 条技术/业务流；**审批流需先证伪再建模** |
| MU 的来源 | 阶段一阶段七「UI 原型」（可选） | 已有 Thymeleaf 模板 + 菜单 SQL；**框架示例页必须剔除** |
| 门禁性质 | 保证"需求 → 模型 → 代码"不跑偏 | 保证"代码 → 模型"不臆造，且**现状与规范不符之处必须显式登记** |

### 7.2 现状与规范不符的偏差清单（本项目特有，必须在 YAML 与假设清单中显式登记）

| # | 偏差 | 事实证据 | 对本体建模的影响 | 登记位置 |
|---|---|---|---|---|
| D1 | **184 个端点中 79 个无 `@RequiresPermissions`** | `interface-index.md#3` 逐个列出；`PROGRESS.md#Q-79-endpoints-without-permission` | M5 无法为这些端点找到对应权限码 → 相关 M2 行为的 `requiredPermissions` 只能留空或用 SUPPRESSED 语义表达；相关 MU 功能点的 `permissionRef` 只能省略 | A-M5-01 |
| D2 | **`com.qvsu.open` 包 7 个 Controller 的 36 个管理端点全部无权限码** | `_CONTEXT-FOR-AGENTS.md#2.2` 端点计数 7+7+4+5+3+9=35（管理控制器）+ 网关 `@RequestMapping("/open/**")` 1 个；`interface-index.md#3` 说明 **9 个高危写操作**（4 个 open 域管理写 + 5 个系统域写）与 27 个 open 域端点全部在缺口清单内 | **开放域的主体（M5）与权限映射几乎无法成立**：菜单 SQL 声明了 `open:app:view` 等 15 个权限码，但代码侧没有任何一处校验它们 → M5 中这 15 个权限必须标为"仅菜单可见性约束，无后端强制" | A-M5-02、A-M5-03 |
| D3 | **`open:*` 权限码只存在于菜单 SQL** | `open-api/sql/open_api_menu.sql:8-26`、`deploy/local-docker/mysql/init/40-open-api-menu.sql:8-26`、`deploy/local-docker/postgres/init/40-open-api-menu.sql:6-24`；对 `*.java` 检索 `open:(app\|api\|auth\|log\|doc):` **零命中** | M5 的 `permissions[]` 中这 15 条依据只能是"菜单声明（事实）+ 无代码校验（事实）" | A-M5-03 |
| D4 | **不存在审批流引擎** | §4.5 的四条证据 | M6 中 `flowType: APPROVAL` 为 0 个；MU 中 `actionType: DRAFT/SUBMIT/APPROVE/REJECT/RETURN` 为 0 个；`MU-spec.md#8.5` 双按钮规则**不适用** | A-M6-01、A-MU-01 |
| D5 | **Quartz 为内存 JobStore（RAMJobStore）** | `ScheduleConfig` 空占位类自述"当前使用 Spring Boot 自动配置的 Scheduler（内存模式）"（`technical-architecture.md#Quartz 调度`）；11 张 `QRTZ_*` 表虽建但**不被使用** | `FUNC-job-scheduler` 的调度状态**无法持久化**（重启丢失触发状态）→ M6 `FLOW-QUARTZ-JOB` 的活动不得声明"持久化调度状态"；`QRTZ_*` 不进 M1（§4.1） | A-M6-02 |
| D6 | **`templates/demo/**` 等 73 个模板被排除** | `PROGRESS.md#1`、`source-coverage-report.md#1`（144 模板 → 71 建模 / 73 排除） | MU 只允许为 71 个在范围模板建屏幕；框架示例页不得建屏幕、不得建菜单 | A-MU-02 |
| D7 | **菜单去重真值为 C 14 + M 2，与任务书"33 C + 5 M"不一致** | `business-architecture.md#7.1` | MU 一级菜单 2 个、二级菜单 14 个（+1 外链、+1 源码补入的 `/monitor/job`） | A-MU-03 |
| D8 | **`application.yml` 与 PostgreSQL 版菜单 SQL 中文双重编码乱码** | `PROGRESS.md#Q-mojibake-yaml`、`_CONTEXT-FOR-AGENTS.md#2.5-1/2`；实测 `40-open-api-menu.sql:6` 为 `搴旂敤绠＄悊`（"应用管理"的乱码形态） | 配置注释与 PG 菜单名不可读 → M1 属性的中文 `label`、MU 的菜单中文名**必须取 MySQL 副本或模板中文**，取不到的须标假设 | A-DATA-01 |
| D9 | **`csrf.enabled=false`、`XssFilter` 只覆盖 `/system/*,/tool/*`** | `technical-architecture.md#Shiro 安全链路`、`flow-index.md#未覆盖与待确认项` | 不应把这些"未生效的防护"建成 M3 规则（规则须是真实生效的业务判断） | A-M3-01 |
| D10 | **「限流」能力不存在** | `business-architecture.md#7.3`：全仓检索 `rateLimit`/`限流`/`qps`/`Semaphore`/`Bucket`/`token` **零命中** | `SCN-open-gateway-call` 场景标题含"限流"但不得在 M6/M3 中建限流活动或规则 | A-M6-03 |
| D11 | **操作审计"只写不读"** | `business-architecture.md#7.4`：仅 `insertOperlog`，无 `SysOperLogController`；菜单 SQL 显式删除 `monitor:operlog:*` 等 | `FUNC-sys-operlog-query`/`FUNC-sys-logininfor-query`/`FUNC-sys-useronline-query` 三个 FUNC **无对应读取端点** → 它们的 M2 QUERY 行为与 M7 对象**可能无法成立**；须标为断链假设 | A-M7-01、A-M2-01 |
| D12 | **`gen_*` 平台表存在但无实体、无功能** | `PROGRESS.md#Q-16-tables-beyond-34`、`data-ownership.md`（标记"仅由初始化 SQL 写入"） | `gen_*` 不进 M1 聚合；如需保留则标为"遗留/未使用" | A-M1-01 |
| D13 | **`sql/quartz.sql` 的 `menu_id=110` 未被 `menus.json` 收录** | `business-architecture.md#7.2` | MU 必须补建 `/monitor/job` 屏幕；这是"上游提取脚本缺口"而非"系统缺口" | A-MU-04 |
| D14 | **菜单-路由-模板三方无校验约束** | `PROGRESS.md#Q-menu-routing-contract`、`change-hotspots.md#HOT-ROUTING-CONTRACT` | MU 的 `screenRef` 与 URL 对应关系属"约定"而非"约束"，本体校验无法自动保证 → 假设条目 | A-MU-05 |

### 7.3 对阶段三（应用构建）的直接影响

| 影响 | 说明 |
|---|---|
| **不能照抄上游"审批"章节** | 技能 `references/本体模型业务功能开发指导书.md` 的「审批端到端」章节与 MU 双按钮规则，在本项目中**无对应模型元素**；阶段三若强行实现审批引擎，即违反"模型是唯一语义来源"。 |
| **M5 与代码的权限不一致必须显式处理** | 阶段三按 `@require_permission` 落地 M5 时，会**同时**修掉 D1/D2/D3 的权限缺口，或明确以"现状复刻"为目标保留缺口。二者必须由人工决策，不能由 AI 静默选一个。 |
| **查询报表的"报表面"弱** | 系统只有一个统计端点（`log/stats`），无固定列/分组/小计的正式报表 → M7 主要产出 `LIST_QUERY`。阶段三不应虚构报表页。 |
| **菜单只有两级且仅 2 个一级菜单** | MU 的"总体界面 → 一级菜单 → 二级菜单"结构在本项目中会很"瘦"（2 → 14），这是现状；不得为凑层级而拆细。 |

---

## 8. 本目录文档清单与阅读顺序

| 文件 | 内容 | 读者 |
|---|---|---|
| `00-ontology-overview.md`（本文件） | 输入来源、七模型清单、建模顺序、映射关系、门禁、与正向开发的差异 | 全体 |
| `01-modeling-decisions.md` | 逐条建模判断与取舍（聚合边界、值对象判定、规则归位、页面排除、报表与查询界限） | YAML 建模者、评审者 |
| `02-assumptions-and-open-questions.md` | **假设清单**（编号/所属模型/内容/依据/影响/确认人/标记）+ 汇总统计 + 人工确认 Top 10 | 业务方、架构师、下游开发 |
| `_spec/`（只读） | 七模型元文件规范（M1～MU）与模型间关系总览 | 全体 |
| `yaml/`（并行任务产出） | 七个 YAML | 阶段三 |

**推荐阅读顺序**：本文件 §1–§4（建立输入与映射认知）→ `02-assumptions-and-open-questions.md`（先看未决项，避免把假设当事实）→ `01-modeling-decisions.md`（看判断细节）→ `_spec/`（查字段语义）。
