# 本体建模决策与偏差记录（Modeling Decisions）

> 系统：`SYS-qvsu-openapi` ｜ 阶段：`ontology-driven-dev` 阶段二 · 本体建模
> 本文逐条记录建模过程中的**判断与取舍**。
> 证据等级：**事实**（直接读源码或逆向文档明确记载）/ **推断**（由多处证据推出）/ **假设**（待人工确认）。
> 相关文件：`00-ontology-overview.md`（总览与映射）、`02-assumptions-and-open-questions.md`（假设清单）。

---

## 0. 决策索引

| 编号 | 主题 | 涉及模型 | 结论一句话 | 主要依据 |
|---|---|---|---|---|
| D-01 | 聚合边界划分依据 | M1 | 采用「同生共死 + 级联删除 + 同一操作内整体重写」三判据，而非"表结构"或"模块归属" | `M1-spec.md#2.2.2` |
| D-02 | `open_app_api` 判为 `OpenApp` 聚合内的独立聚合根（而非子实体） | M1 | 它对**两个**聚合根都有级联删除关系，不满足"只能通过一个聚合根访问" | `OpenManageService.java:122-134` |
| D-03 | `OpenCallLog` / `SysOperLog` / `SysLogininfor` / `SysJobLog` 判为独立聚合根 | M1 | 写入方是"网关/AOP 切面/调度器"这一**独立生命周期**主体，与业务聚合无同生共死关系 | `flow-index.md` 各流程的 R/C/U/D 表 |
| D-04 | `QRTZ_*`（11 张）与 `gen_*` 不进 M1 | M1 | 无业务语义 / 当前未被使用 | `technical-architecture.md#Quartz 调度`、`PROGRESS.md#Q-16-tables-beyond-34` |
| D-05 | 4 个 DTO + 4 个非持久化 value-object 不进 M1 | M1 | 它们是技术契约而非业务对象 | `domain-model.md#0` |
| D-06 | `BaseEntity` / `OptBaseEntity` / `TreeEntity` 不建为 M1 值对象 | M1 | 是**跨聚合通用审计字段集合**，用"公共属性模板"处理，避免每个聚合挂一个重复值对象 | `domain-model.md#OBJ-BaseEntity` 等 |
| D-07 | `SysUserRole` / `SysRoleMenu` / `SysRoleDept` / `SysUserPost` 判为**聚合间关联**而非独立聚合根 | M1 | 它们是纯多对多载体（2 字段），无自身属性与生命周期 | `domain-model.md#1`、`database-schema.md` 各节 |
| D-08 | `SysPost` / `SysDictType` / `SysDictData` / `SysConfig` / `SysNotice` 判为独立聚合根 | M1 | 均有独立生命周期与独立维护页面 | `business-architecture.md#5.4` |
| D-09 | 审计/内建字段不展开为 M1 属性，只保留业务可见项 | M1 | 22/17/14 列的物理表 → 业务属性远少于列数 | `database-schema.md`、`open_api.sql` |
| D-10 | `s_status` / `s_is_del` / `s_created_time` / `s_updated_time` 判为**兼容冗余列**，不进 M1 | M1 | 代码从不读写它们，属死列 | `OpenManageService.java` 全部 SQL 语句 |
| D-11 | 数据字典只建"真正字典化"的枚举，不把状态码硬塞成字典 | M1 | `status` 之类的 0/1 开关用 `Enum`，不建 `data_dictionaries` | `M1-spec.md#2.3.5` |
| D-12 | 逻辑删除策略在 M1 中如实表达为"双轨"，不统一 | M1 | 3 张表逻辑删除、其余物理删除，这是现状 | `SysUserMapper.xml:159`、`SysMenuMapper.xml:118`、`OpenManageService.java:133` |
| D-13 | 1 个 FUNC ≠ 1 个 M2 行为；`GET .../add` 这类渲染端点**不建行为** | M2 | 行为只对应"产生业务结果"的操作 | `interface-index.md` 端点清单 |
| D-14 | `OpenDocController` 的列表/预览判为**屏幕数据源**，不建 M7 对象 | M7/MU | 返回 HTML 视图而非结构化列表数据 | `OpenDocController.java:40-61` |
| D-15 | 导出端点默认归 `LIST_QUERY`，只有取证到固定列/小计/合计才升为 `REPORT` | M7 | 避免把"导出现有查询结果"虚构成正式报表 | `OpenLogController.java:58-116` |
| D-16 | `OpenApiSecurityService` 的鉴权过程拆为多条带 `syncTriggers` 的行为，而非一条长行为 | M2 | 保原子性；鉴权是条件链而非单事务 | `M2-spec.md#3.2.2`、`OpenApiSecurityService.java:61-142` |
| D-17 | 隐含规则的处理：只把"被代码强制且跨对象/跨请求"的约束上升为 M3 | M3 | 其余留在 M1 `refRules`/`invariants` 或不建模 | `M3-spec.md#4.1.1` |
| D-18 | `csrf.enabled=false` 与 `XssFilter` 覆盖不全**不建为规则** | M3 | 规则必须是真实生效的业务判断 | `technical-architecture.md#Shiro 安全链路` |
| D-19 | 无审批流 → M6 不建 `APPROVAL`，MU 不建 `DRAFT`/`SUBMIT` 双按钮 | M6/MU | `MU-spec.md#8.5` 在本项目**不适用** | `flow-index.md#流程总览`、`functional-inventory.md#0` |
| D-20 | `flow-index.md` 的参与者不直接当 `roleRef`，缺失者降级为 `SYSTEM_TASK` | M6 | 规范禁止自由文本参与人 | `M6-spec.md#6.1` |
| D-21 | 无菜单功能不建菜单、不建屏幕 | MU | 无菜单则无法满足"二级菜单与屏幕一对一" | `MU-spec.md#8.2.2`、`non-menu-function-index.md` |
| D-22 | 73 个框架示例模板排除，且排除清单直接决定 MU 的屏幕全集 | MU | 上游已给排除口径，不重复判断 | `PROGRESS.md#1`、`source-coverage-report.md#1` |
| D-23 | `menu_id=4`（qvsu官网外链）不建屏幕 | MU | 外链非本系统页面 | `business-architecture.md#5.1` |
| D-24 | `menu_id=110`（`/monitor/job`）必须建屏幕，来源标注"源码补入" | MU | `menus.json` 提取脚本缺口，不是系统缺口 | `business-architecture.md#7.2` |
| D-25 | 一级菜单只有 2 个 → 不人为拆分凑层级 | MU | 现状即 2 个一级菜单，规范只要求"至少一个二级菜单" | `MU-spec.md#8.2.2` |
| D-26 | `open:*` 15 个权限码入 M5 但标注"无代码侧强制" | M5 | 菜单声明是事实，代码缺失也是事实 | `open_api_menu.sql:8-26`、`interface-index.md#3` |
| D-27 | 不虚构角色继承（`inheritsFrom`）与 `dataScope` | M5 | 数据表无父角色字段；开放域未用 `@DataScope` | `SysRoleMapper.xml`、`technical-architecture.md#AOP` |
| D-28 | `sys_role.data_scope` 的取值到 M5 `dataScope` 的映射按 RuoYi 语义推断并标假设 | M5 | 需实际角色种子数据核对 | `DataScopeAspect` |

---

## 1. M1 对象模型：聚合边界与实体/值对象判定

### D-01 聚合边界的划分依据

**决策**：不用"物理表归属"或"Java 包归属"划聚合，而用 `M1-spec.md#2.2.2` 的五维判据，并在本项目中落地为三条可操作规则：

```text
规则 1（同生共死）：删除 A 时必须同时删除 B（SQL 中物理删除 B），则 B 在 A 的聚合内。
规则 2（整体重写）：B 的集合总是"按 A 先全删再全插"式整体替换，则 B 在 A 的聚合内（B 不是独立聚合根）。
规则 3（独立写入方）：B 的写入方是与 A 无关的第三方（网关切面/调度器/框架），则 B 是独立聚合根，
                   即使 B 通过 ID 引用 A。
三条规则冲突时以规则 3 优先（因为规则 3 直接对应"独立生命周期"这一本质判据）。
```

**备选方案**：
1. 按 `domain-model.md` 已标注的 6 个"聚合根"照抄，其余对象全部作为某聚合的子实体 → **否决**：会导致 `SysUserRole` 之类纯关联表被塞进 `SysUser` 或 `SysRole`，产生"一个子实体同时属于两个聚合"的矛盾。
2. 一表一聚合（34 个聚合根）→ **否决**：会把 `open_app_api`（2 个业务字段的纯关联表）提升为聚合根，与"业务完整性优先"原则冲突，且让 M7 的 Join 语义变复杂。
3. **采用**三规则判定 + 逐个人工复核。

**依据**：
- 事实：`M1-spec.md#2.2.2` 给出聚合五维判据表；`M1-spec.md#2.5.1` 给出"一个聚合子实体不超过 3–5 个、总字段不超过 30 个"的经验法则。
- 事实：`OpenManageService.java:122-134`（`deleteAppByIds` 先 `delete from open_app_api where app_id in (...)` 再 `delete from open_app`，且方法带 `@Transactional`）→ 规则 1 命中。
- 事实：`OpenManageService.java:258-279`（`saveAppAuth` 先 `delete from open_app_api where app_id=?`，再批量 `insert`）→ 规则 2 命中。
- 事实：`OpenApiLogService.java:35`（网关 `finally` 块写 `open_call_log`）与 `OpenApiFilter.java:120` → 规则 3 命中。

**影响**：M1 聚合根数量显著多于"6 个"，但少于 34 个；下游 M2 的"一个行为只改一个聚合"约束变得可判定。

### D-02 `OpenAppApi` 判为独立聚合根（而非 `OpenApp` 的子实体）

**决策**：`OpenAppApi` → **独立聚合根**（或等价地，在 `aggregate_associations` 中表达为 `OpenApp` 与 `OpenApi` 的多对多关联载体），**不**作为 `OpenApp` 的 `entities[]`。

**备选方案**：
1. 作为 `OpenApp` 的子实体（`cascadeDelete: true`）→ 部分成立（应用删除时确实级联），但**不完整**：`OpenManageService.java:237` 证明**删除接口时也会删除同一张表的行**，而"接口"是另一个聚合根 `OpenApi`。子实体若同时级联到两个聚合根，即违反"唯一入口原则"。
2. 作为纯关联表、完全不在 M1 出现（只在 `aggregate_associations` 里写一个 `MANY_TO_MANY`）→ 可行，但会丢失"授权记录自身有 `create_time`/`update_time` 审计字段"这一事实。
3. **采用**：独立聚合根 + `aggregate_associations` 中声明 `OpenApp —(ONE_TO_MANY)— OpenAppApi` 与 `OpenApi —(ONE_TO_MANY)— OpenAppApi` 两条关联；同时在 M2 中把"删除应用"与"删除接口"两个行为各自显式声明对 `OpenAppApi` 的清理（用 `syncTriggers` 或作为 `postconditions` 的一部分）。

**依据**：
- 事实：`OpenManageService.java:132`（删应用时 `delete from open_app_api where app_id in (...)`）。
- 事实：`OpenManageService.java:237`（删接口时 `delete from open_app_api where api_id in (...)`）。
- 事实：`open_app_api` 物理列 9 个，其中业务列仅 `app_id`、`api_id`（`open_api.sql:47-58`，含 `UNIQUE KEY uk_app_api (app_id, api_id)`）→ 事实上的多对多关联表。
- 事实：`OpenManageService.java:237` 所在的 `deleteApiByIds` **未标 `@Transactional`**，而 `deleteAppByIds` 标注了 → 两条级联路径的事务语义不一致（见假设 A-M1-04）。

**影响**：M2 中"删除接口"行为需要跨聚合处理 `OpenAppApi`；`M2-spec.md#3.2.2-4`「下游行为必须作用于另一个独立聚合」的约束在此处**天然满足**（因为 `OpenAppApi` 被判为独立聚合）。

### D-03 日志类对象判为独立聚合根

**决策**：`OpenCallLog`、`SysOperLog`、`SysLogininfor`、`SysJobLog`、`SysUserOnline` 一律判为**独立聚合根**，`ownerEntity` 分别为自身。

**备选方案**：
1. 把 `OpenCallLog` 作为 `OpenApi` 的子实体（因为它有 `api_path`）→ **否决**：`open_call_log` 通过 `api_path`（**字符串**）而非 `api_id` 关联，且写入方是过滤器 `finally` 块，与 `OpenApi` 聚合无同生共死关系。
2. 把 `SysOperLog` 作为"各对象的日志子实体" → **否决**：一张表给所有对象写日志，无单一父聚合。
3. **采用**独立聚合根。

**依据**：
- 事实：`open_call_log` 的关联字段是 `api_path VARCHAR(200)`（`open_api.sql:65`），而 `open_api` 的唯一键也是 `api_path`（`open_api.sql:30`）→ 关联是**值匹配而非 ID 引用**，不满足 `aggregate_associations.referenceField` 的语义。
- 事实：`SysOperLog` 由 `LogAspect` 经 `AsyncManager` 异步写入（`technical-architecture.md#AOP` 表）。
- 事实：`SysJobLog` 由 `AbstractQuartzJob` 写入，写入方是调度线程（`interface-index.md#JOB-quartz-dispatch`）。

**影响**：M7 中"调用日志查询"的来源对象是 `OpenCallLog`（主对象），**不能**通过 `OpenCallLog → OpenApi` 的 Join 取接口名称（没有 ID 可用），只能直接用日志行内冗余的 `app_name`/`api_path`。这解释了为什么日志行内冗余了 `app_name`（`open_api.sql:64`）——是**刻意的冗余**，不是建模冗余。

### D-04 `QRTZ_*` 与 `gen_*` 不进 M1

**决策**：11 张 `QRTZ_*` 表与 `gen_*` 系列表**不建 M1 聚合、不建属性**。

**依据**：
- 事实：`domain-model.md#4` 明确列出 11 张 `QRTZ_*` 表"由 Quartz 框架内部 JDBC 直连，无 MyBatis 实体"，属**已知缺口**。
- 事实：`technical-architecture.md#Quartz 调度` 记载 `ScheduleConfig` 是**空占位类**，其类注释自述"当前使用 Spring Boot 自动配置的 Scheduler（内存模式）"→ `QRTZ_*` 表虽由 DDL 建出但**当前不被 JDBC JobStore 使用**。
- 事实：`PROGRESS.md#Q-16-tables-beyond-34` 指出 `gen_*` 表"在 DDL 中出现但无对应 Java 实体与功能"，`data-ownership.md` 标记为"仅由初始化 SQL 写入"。

**备选方案**：把 `QRTZ_JOB_DETAILS` 等建为 M1 聚合以"完整覆盖 34 张表" → **否决**：`M1-spec.md#2.1` 要求"从业务视角建模，而非数据库表结构视角"；把框架内部表建成业务聚合会让业务读者误判系统存在分布式调度能力。

**影响**：M1 的聚合数不追求与 34 表对齐；`00-ontology-overview.md#4.1` 已声明这一口径。`FUNC-job-scheduler` 的 M6 流程不得声明"调度状态持久化"（见 D-19 与 A-M6-02）。

### D-05 / D-06 DTO 与基类不进 M1

**决策**：

| 对象 | 判定 | 理由 |
|---|---|---|
| `AjaxResult`、`R`、`CxSelect`、`Ztree`、`TableDataInfo`、`OpenResult` | 不进 M1 | 事实：`domain-model.md#1` 标注类别为 `DTO`、物理表"（无，非持久化）" |
| `BaseEntity`、`OptBaseEntity`、`TreeEntity` | 不进 M1，改为"公共属性模板" | 事实：`domain-model.md#3` 显示 19 个实体继承它们；若每个聚合都建一个同名值对象，会产生大量重复定义 |
| `OpenAuthContext` | 作为 M2 行为的**参数说明**而非 M1 值对象 | 事实：`domain-model.md` 标注为 `value-object` 且"随单次请求创建与销毁"，仅承载网关鉴权中间结果 |

**备选方案**：把 `TableDataInfo` 建成 M1 值对象（因为 M7 分页要用）→ **否决**：分页响应结构由 `M7-spec.md#7.4.1` 的 `pagination` 字段直接表达，不需要 M1 参与。

**影响**：33 个 OBJ 中约 10 个不进 M1（6 DTO + 3 基类 + 1 上下文），**必须在 M1 中不出现**，并在本文与本项目假设清单中交代去向，避免"30% 的对象消失了"的误解。

### D-07 4 张纯关联表 → 聚合间关联

**决策**：`SysUserRole`、`SysRoleMenu`、`SysRoleDept`、`SysUserPost` → 不建独立聚合根，改写为 `aggregate_associations` 中的 `MANY_TO_MANY` 关联。

**依据**：
- 事实：`domain-model.md#1` 显示四者字段数均为 2（`database-schema.md` 对应节）。
- 事实：`SysUserRoleMapper.xml:17`、`SysRoleMenuMapper.xml:13`、`SysRoleDeptMapper.xml:13`、`SysUserPostMapper.xml:13` 均为 `delete from ... where <parent>_id = #{...}` 式整体重写 → 符合 D-01 规则 2，但**同时**被两个聚合根共用（如 `SysUserRole` 既随用户也随角色删除：`SysUserMapper.xml:159`、`SysRoleMapper.xml:85`）→ 与 `OpenAppApi` 情形相同。

**与 D-02 的一致性说明**：D-02 把 `OpenAppApi` 判为独立聚合根，本决策把同样结构的 4 张 `sys_*` 关联表判为"聚合间关联"——看似矛盾，实为**同一判据的两种表达**：

| | `OpenAppApi` | `SysUserRole` 等 4 张 |
|---|---|---|
| 关联是否可独立被查询/授权 | **是**：`/admin/open/auth` 是一个独立管理页面，`listAuthorizedApiIds` 是独立查询（`OpenManageService.java:253`） | **否**：没有独立的关联管理页面，只在用户/角色保存时整体重写 |
| M1 表达 | 独立聚合根 + 两条 `aggregate_associations` | 仅两条 `aggregate_associations` |

**影响**：M1 中出现"授权管理"这一个域级聚合，而用户-角色/角色-菜单授权则内化为关联；这与 `business-architecture.md#5.2` 的菜单树一致（授权管理是一个二级菜单页，而用户-角色授权是用户页内的对话框）。

### D-08 5 个平台对象判为独立聚合根

**决策**：`SysPost`、`SysDictType`、`SysDictData`、`SysConfig`、`SysNotice` → 独立聚合根。

**依据**：事实：`business-architecture.md#5.4` 为 岗位管理 `/system/post`、字典管理 `/system/dict`、参数设置 `/system/config`、通知公告 `/system/notice` 各自建了**独立的二级菜单与屏幕**（`MENU-sys-post`、`MENU-sys-dict`、`MENU-sys-config`、`MENU-sys-notice`）→ 有独立维护入口即独立聚合。

**备选方案**：把 `SysDictData` 作为 `SysDictType` 的子实体 → **部分否决**：业务上字典项确实从属于字典类型，且 `SysDictDataMapper.xml:92` 有 `update sys_dict_data set dict_type=... where dict_type=...`（类型改名时同步），但 `SysDictData` 有**独立的二级菜单**与**独立的增删改端点和权限码**（`API-SysDictDataController-*` 带 `system:dict:*`），因此按"访问路径"维度应判为独立聚合。→ **采用**独立聚合，并在 `aggregate_associations` 中声明 `SysDictType —(ONE_TO_MANY)— SysDictData`。

### D-09 / D-10 物理列到 M1 属性的裁剪

**决策**：物理列**不等价于** M1 属性。裁剪规则：

| 列类别 | 处置 | 例证 |
|---|---|---|
| 业务可见字段（页面/导出出现） | 建 M1 属性 | `open_app.app_name`/`app_key`/`status`/`expire_time`（`open_api.sql:15-17`） |
| 审计字段（`create_by`/`create_time`/`update_by`/`update_time`） | 不逐聚合展开，按 D-06 用公共属性模板 | `SysUserMapper.xml:53` 的 22 个 select 列中含 4 个审计列 |
| 技术主键 `s_id` | 建为聚合根标识（不用作业务属性） | `open_api.sql:11` |
| **兼容冗余列** `s_status`/`s_is_del`/`s_created_time`/`s_updated_time` | **不建 M1 属性** | 见下 |
| 大文本（`req_body`/`resp_body`/`html_content`/`req_example`/`resp_example`） | 建属性但标记为长文本（MU 映射 `TEXTAREA`） | `open_api.sql:68,71,94` |
| 敏感字段（`password`/`app_secret`/`salt`） | 建属性但标注"M5/安全敏感，界面不展示" | `open_api.sql:14`、`SysUserMapper.xml:53` |

**`s_*` 兼容列的事实依据（这是本节最关键的一条）**：
- 事实：MySQL DDL 中 5 张 `open_*` 表**都有** `s_status TINYINT DEFAULT 1`、`s_is_del TINYINT DEFAULT 1`、`s_created_time`、`s_updated_time` 四列（`open_api.sql:21-24,41-44,53-56,79-82,97-100`）。
- 事实：`OpenManageService` 中**所有** SQL 语句（共 20 余条）只读写 `status`、`create_time`、`update_time`，**从不**读写 `s_status`/`s_is_del`/`s_created_time`/`s_updated_time`。唯一例外是 SELECT 时用 `create_time as s_created_time` 做**结果映射别名**（`OpenManageService.java:43,71,81,92,155,182,192,286,364,384`），与 `OpenBean` 的 `sCreatedTime` 属性对应。
- 事实：`s_is_del` 的默认值是 **1**（`open_api.sql:22`），若它真是"删除标记"，`1` 通常表示"已删除"，与全表默认存活的语义相悖 → 更可能是从另一套命名体系迁移时留下的**未启用兼容列**。
- 推断：这 4 列是"兼容旧版本/外部系统"的冗余列，当前为死列。
- 假设：若上游确有外部系统直接读写 `s_is_del`，则它必须进 M1（见 A-M1-02）。

**影响**：`open_*` 表的 M1 属性数远小于其列数（例：`open_app` 14 列 → 约 8 个业务属性）。**这一点必须在 M1 YAML 中给出，不能"34 表 342 字段全量展开"**。

### D-11 数据字典的建与不建

**决策**：
- **建**为 M1 `data_dictionaries`：`sys_dict_type`/`sys_dict_data` 中真实存在的字典类型（因为系统有独立的字典管理页与运行时字典缓存 `DictUtils`）。
- **不建**为字典：`status`（0/1 开关）、`need_sign`（0/1）、`sex`（0/1/2 单字符）、`open_call_log.status`（0/1/2 三态）→ 用 `type: Enum` + `enumValues`。

**备选方案**：把所有 0/1 字段都建为字典（因为 RuoYi 风格下"是否"字典确实存在）→ **否决**：`M1-spec.md#2.3.5` 定义字典是"引用数据"，且字典项有 `enabled`/`sortOrder` 等管理语义；把布尔开关塞进字典会引入无意义的字典管理负担。

**事实依据**：`open_api.sql:16`（`status TINYINT DEFAULT 1 COMMENT '1=enabled 0=disabled'`）、`:35`（`need_sign`）、`:73`（`status TINYINT NULL COMMENT '0=ok 1=auth-fail 2=proxy-fail'`）——**注释本身就是枚举语义**，不是字典引用。

**注意（编码影响）**：PostgreSQL 版 `30-open-api.sql` 的这些注释**已被删除**（`deploy/local-docker/postgres/init/30-open-api.sql:8-23` 无 COMMENT），因此枚举语义只能取 **MySQL 副本或 `flow-index.md`/`interface-index.md` 的记载**（见 A-DATA-02）。

### D-12 逻辑删除的双轨策略如实表达

**决策**：M1 中**不**统一声明"逻辑删除"，而是在每个聚合上如实标注删除语义：

| 聚合 | 删除语义 | 事实依据 |
|---|---|---|
| `SysUser` | **逻辑删除**（`del_flag='2'`） | `SysUserMapper.xml:159,163` |
| `SysRole` | **逻辑删除**（`del_flag='2'`） | `SysRoleMapper.xml:85,89` |
| `SysDept` | **逻辑删除**（`del_flag='2'`） | `SysDeptMapper.xml:148` |
| `SysMenu` | **物理删除**（含子菜单：`or parent_id = #{menuId}`） | `SysMenuMapper.xml:118` |
| `SysDictType` / `SysDictData` / `SysPost` / `SysConfig` / `SysNotice` / `SysJob` / `SysJobLog` | **物理删除** | `SysDictTypeMapper.xml:64`、`SysPostMapper.xml:68`、`SysConfigMapper.xml:107`、`SysNoticeMapper.xml:79`、`SysJobMapper.xml:65`、`SysJobLogMapper.xml:58` |
| `OpenApp` / `OpenApi` / `OpenAppApi` / `OpenApiDoc` | **物理删除**（JdbcTemplate 直连，未用 `s_is_del`） | `OpenManageService.java:133,238,262` |

**备选方案**：按技能规范"逻辑删除 `flag=0`"统一改写为逻辑删除 → **否决**：那是**阶段三（构建）**的落地规范，不是**阶段二（建模）**对现状的描述权。本体必须描述现状（见 `00-ontology-overview.md#1.2`）。→ 改为在假设清单中登记为"现状与规范不符"（A-M1-03）。

**影响**：M2 的"删除"行为在平台域与开放域语义不同（前者是状态变更，后者是行消失）；M7 查询若涉及 `SysUser` 必须隐含 `del_flag='0'` 过滤条件——这条**必须**写入 M7 的 `conditions`，否则查询语义与代码不一致。

---

## 2. M2 行为模型：原子性、触发类型与联动

### D-13 1 个 FUNC ≠ 1 个 M2 行为；渲染端点不建行为

**决策**：行为集合的生成规则：

```text
对每个 FUNC：
  1) 取该 FUNC 的所有 API-* 端点
  2) 剔除"渲染页面"端点：GET 且返回视图名（源码里 return "xxx/yyy"）→ 归 MU 屏幕，不建行为
  3) 剔除"下拉/树数据/唯一性校验"辅助端点：无独立业务结果的读操作 → 不建 M2 行为
     （例：/system/dept/treeData/{excludeId}、/system/user/checkLoginNameUnique）
  4) 剩余端点按语义归并为原子行为：POST 写操作通常 1 端点 = 1 行为；
     同一对象的"新增保存"与"修改保存"是 2 个行为；
     "/list" 类查询 = 1 个 QUERY 行为（若跨对象则绑定 M7）
```

**依据**：
- 事实：`OpenAppController.java:34-38`（`@GetMapping() app()` 返回 `"open/app/index"` 视图名）、`:49-53`（`/add` 返回 `"open/app/add"`）→ 这两类都是渲染，非业务行为。
- 事实：`interface-index.md#3` 把 `checkDeptNameUnique`、`selectDictTree`、`treeData`、`checkPostNameUnique`、`checkMenuNameUnique`、`checkRoleKeyUnique` 等标为"低危：查询/渲染或唯一性校验辅助接口"。
- 事实：`M2-spec.md#3.4-1` 要求 `USER_ACTION` 行为必须被 MU 功能点引用 → 若把渲染端点建成行为，MU 中将出现"打开新增页"这类无实义的功能点，且与"操作功能点是按钮/动作"的语义（`MU-spec.md#8.2.5`）冲突。

**备选方案**：把唯一性校验建成 QUERY 行为（因为它确实是一次查询）→ **否决**：`M2-spec.md#3.1` 要求行为有"确定性的状态变更或业务结果"；唯一性校验的结果只用于界面即时提示，且**同一校验逻辑在新增和修改两处被复用** → 更适合作为 M1 `refRules`（`unique: true`）或 M3 规则，而非 M2 行为。

**影响**：184 个端点不会变成 184 个行为。预期的行为规模显著小于端点数，与 MU 功能点数量同量级。

### D-14 文档管理页判为屏幕数据源（不建 M7 对象）

**决策**：`OpenDocController` 的 `/admin/open/doc`（`docPage`）、`/apis`、`/html/{apiId}` 不建 M7 对象；`/list` 视其实现判定。

**依据**：
- 事实：`OpenDocController.java:40`（`docPage()` 返回视图）、`:53`（`@GetMapping(value = "/html/{apiId}", produces = MediaType.TEXT_HTML_VALUE)`）→ 返回 HTML 内容而非结构化数据。
- 事实：`M7-spec.md#7.3` 的 `objectType` 四类均要求"结果列"（`resultColumns`），而 `/html/{apiId}` 的产出是一段 HTML 字符串，无法表达为结果列。
- 事实：`OpenManageService.java:361-366`（`selectDocList()` 是**单表无条件查询**），符合 `M7-spec.md#7.2` 表"单聚合简单查询 → 可独立定义 M2 QUERY 行为，通常不建立 M7"。

**备选方案**：把文档列表建成 `LIST_QUERY` → **否决**：单表查询不满足 M7 的"跨对象关联查询"定位，会稀释 M7 的语义。

**影响**：`FUNC-open-doc-manage` 在 M7 中**没有**对应对象；其列表查询仍是 M2 `behaviorType: QUERY` 行为，但 `queryReportRef` 留空（这是 `M2-spec.md#3.2.1` 允许的：`queryReportRef` 仅在"行为执行 M7 对象"时填写）。

### D-15 导出端点的 M7 归类

**决策**：

| 导出端点 | 归类 | 理由 |
|---|---|---|
| `GET /admin/open/log/exportCsv`（`OpenLogController:58`） | **REPORT** | 事实：有**固定表头 13 列**硬编码（`OpenLogController.java:89`），列集合与列表页列不要求一致，且恒定输出 `\uFEFF` BOM → 符合 `M7-spec.md#7.4.6` 的 `reportOptions.title/exportFormats` 语义 |
| `POST /system/config/export`、`/system/dict/export`、`/system/dict/data/export`、`/system/user/export`、`/system/post/export`、`/system/role/export`、`/monitor/job/export`、`/monitor/jobLog/export` | **默认为 LIST_QUERY**（导出即"当前查询结果"），**除非**在模板/实现中取证到分组小计或合计才升为 REPORT | 事实：这些端点由 RuoYi 的 `ExcelUtil` 从同一 `list` 查询结果导出，**列集合取自 Java 实体注解而非独立报表定义** → 没有独立的"报表语义" |

**备选方案**：把所有导出都建成 REPORT → **否决**：`M7-spec.md#7.4.6` 的 `reportOptions` 要求 `groupFields`/`subtotalFields`/`totalFields`；凭空填写即造假，留空则 `objectType=REPORT` 的强约束（`M7-spec.md#7.6-7`）不成立。

**影响**：M7 中 `objectType: REPORT` 的对象数量很少（预计 1–2 个），绝大多数是 `LIST_QUERY` + 少数 `STATISTICAL_QUERY`（`GET /admin/open/log/stats`）。

### D-16 网关鉴权过程的原子性拆分

**决策**：`FUNC-open-gateway-invoke` **不**建成一条"网关转发"行为，而拆为：

```text
OpenApi_GatewayInvoke（COMMAND, SYSTEM, ownerEntity = OpenApi）
  preconditions: 请求 URI 以 /open/ 开头
  postconditions: 转发结果写入响应；open_call_log 落库
  appliedRules:  RULE-OPEN-AUTH-SIGN-CHECK、RULE-OPEN-API-STATUS-CHECK、RULE-OPEN-APP-PERMISSION-CHECK
  syncTriggers:
    - behaviorRef: OpenCallLog_Record    description: 无论成功/失败均写入调用日志（finally 语义）
```

**依据**：
- 事实：`OpenApiSecurityService.authenticate` 内部是**顺序条件链**：`normalizePath` → `loadApiInfo` → `status != 1` → `need_sign == 0` 直接放行 → 缺头 → 时间戳容差 → `loadAppInfo` → `checkNonce` → `hasPermission` → `verifySignature`（`flow-index.md#FLOW-OPEN-GATEWAY` 链路步骤 4，逐个给了源码行号）。
- 事实：`OpenApiFilter.java:99-126` 的 `finally` 块无条件写日志 → 这是**联动语义**而非主行为的一部分。
- 事实：`M2-spec.md#3.2.2-5` 要求"联动失败的语义必须在 `postconditions` 或 M6 流程中明确，禁止隐含吞掉异常"；`OpenApiLogService.java:51-54` 确实吞掉了日志写入异常 → 必须在 `postconditions` 中显式写明"日志写入失败不影响主链路返回"。

**备选方案**：把鉴权链的每一步都建成独立 M2 行为 → **否决过度拆解**：`normalizePath`、`loadApiInfo` 等是同一事务边界内的顺序校验，拆开后无法表达"任一步失败即整体失败"的语义（`M2-spec.md` 无"事务/失败传播"字段）。→ 采用"一条主行为 + 多条 M3 规则 + 一条审计联动"的结构。

**影响**：`FUNC-open-gateway-invoke` 只产出 1 个 COMMAND 行为 + 1 个联动行为 + 3 条 M3 规则；`FLOW-OPEN-GATEWAY` 在 M6 中的活动数（约 9 步）**多于** M2 行为数——这正好体现 M6「流程只编排粗粒度阶段」的定位。

### D-17 隐含规则上升为 M3 的门槛

**决策**：从代码反推的隐含规则，**只有同时满足以下两条**才上升为 M3：

```text
条件 A：被代码强制（有真实的 throw / 返回错误 / 校验分支）
条件 B：跨对象 或 跨请求 或 被多个行为复用
否则：能由 M1 内置字段表达 → M1；只依赖单属性 → M1.refRules；同一聚合内多属性 → M1.invariants；
      仅在某一个行为内部的一次性校验 → 留在 M2 的 preconditions。
```

**判定示例（全部为事实+推断）**：

| 候选规则 | 事实证据 | 判定 | 落点 |
|---|---|---|---|
| `app_key` 全局唯一 | `open_api.sql:13` `app_key VARCHAR(64) NOT NULL UNIQUE`；`insertApp` 不校验唯一性，靠 DB 约束（`OpenManageService.java:108`） | 单属性唯一性 | **M1** `unique: true` |
| `api_path` 全局唯一 | `open_api.sql:30` `UNIQUE`；`selectApiByPath` 依赖它（`OpenManageService.java:189`） | 单属性唯一性 | **M1** `unique: true` |
| `(app_id, api_id)` 唯一 | `open_api.sql:57` `UNIQUE KEY uk_app_api`；`saveAppAuth` 用 `on conflict do update`（`OpenManageService.java:276`） | 跨两属性但同对象 | **M1** `invariants` |
| 时间戳容差 5 分钟 | `OpenApiSecurityService` `ALLOW_TIME_DRIFT_MS`（`flow-index.md` 步骤 4） | 跨对象（凭据+接口+应用）且被网关链路复用 | **M3** VALIDATION |
| nonce 一次性（5 分钟） | `NONCE_CACHE` + `NONCE_EXPIRE_MS`（`flow-index.md` 步骤 4） | 跨请求状态 | **M3** VALIDATION |
| `need_sign=0` 时跳过全部校验 | `OpenApiSecurityService.java:61-72` | 是行为分支，不是规则 | **M2** `preconditions` + 流程网关 |
| 应用须存在且未过期（`expire_time`） | `selectAppByAppKey` SQL 条件（`OpenManageService.java:82`） | 跨对象（应用+当前时间） | **M3** VALIDATION |
| 应用须对接口有授权 | `select count(1) from open_app_api`（`flow-index.md` 步骤 4） | 跨对象（应用+接口） | **M3** VALIDATION |
| 重置密钥后密钥非空 | `resetSecret` 抛 `RuntimeException("app not found")`（`OpenManageService.java:141-145`） | 单行为内一次性校验 | **M2** `preconditions` |
| 密码连续错误 5 次锁定 10 分钟 | `user.password.maxRetryCount=5` + Ehcache `timeToIdleSeconds=600`（`technical-architecture.md#Shiro 安全链路`） | 跨请求 + 与登录行为分离 | **M3** RISK |
| 部门存在子部门/用户时不可删除 | `SysDeptMapper.xml:59,86` 的 `count` 校验 | 跨对象（部门+用户+部门树） | **M3** VALIDATION |
| 菜单删除会连带删除子菜单 | `SysMenuMapper.xml:118` 同一条 SQL | 同一聚合内 | **M1** `invariants` 或 M2 行为说明 |
| 角色被用户占用时不可删除 | `SysRoleMapper.xml:97` 附近查询已分配用户 | 跨对象 | **M3** VALIDATION |
| 用户名/手机号/邮箱唯一 | `SysUserMapper.xml:128,133,138` | 单属性唯一 | **M1** `unique` + M2 `preconditions`（RuoYi 用前置校验而非 DB 唯一键） |
| `status=2` 视为停用 | `business-function-requirements.md#FUNC-sys-login` | 枚举语义 | **M1** `enumValues` |

**依据**：`M3-spec.md#4.1.1` 的判定顺序（内置字段 → `refRules` → `invariants` → M3）与 §4.5「单一职责、无副作用」。

**影响**：M3 规则数量**远少于**"把所有 if 都建模"的直觉；且**大量候选规则留在 M1**——这正是 `M3-spec.md` 强调的边界。若 M3 里出现"某字段不能为空"这类规则，即属**建模错误**。

### D-18 "未生效的防护"不建为规则

**决策**：以下内容**不建** M3 规则、**不建** M6 活动：

| 内容 | 事实 | 处置 |
|---|---|---|
| CSRF 校验 | `csrf.enabled=false`（`application.yml:144`）；`CsrfValidateFilter` 挂在 `/**` 但 `setEnabled(false)` | 不建规则；在假设清单登记为"现状缺陷"（A-M3-02） |
| XSS 过滤 | `xss.enabled=true` 但 `urlPatterns` 仅 `/system/*,/tool/*`；`/open/**`、`/admin/open/**`、`/selftest/**`、`/common/**` 均不过滤（`flow-index.md#未覆盖与待确认项`） | 不建规则；登记为缺陷（A-M3-03） |
| 限流 | 全仓 `rateLimit`/`限流`/`qps`/`Semaphore`/`Bucket` **零命中**（`business-architecture.md#7.3`） | 不建规则、不建 M6 活动；登记为"场景标题含限流但能力不存在"（A-M6-03） |
| `nonce` 缓存容量保护（>100000 清理） | `business-architecture.md#7.3` 明确"这是缓存容量保护，不构成对调用方的速率或配额约束" | 不建规则 |

**备选方案**：把"应有但未生效"的防护建成规则并标注"未生效" → **否决**：会造成 M3 中出现永不触发的规则，破坏"规则=被行为同步调用的真实判断"语义，并给阶段三留下错误的实现暗示。

### D-19 无审批流 → M6/MU 的连带决策

**决策**：
1. M6 **不建** `flowType: APPROVAL` 流程；不建 `APPROVAL_TASK` 活动；不建 `approvalOutcomes`。
2. MU **不建** `actionType: DRAFT` / `SUBMIT` / `APPROVE` / `REJECT` / `RETURN` 功能点。
3. `MU-spec.md#8.5`「带审批功能必须含保存草稿/提交双按钮」在本项目**不适用**，并在 MU 文档中显式说明"不适用 + 理由"，避免评审者误判为漏项。
4. `M6-spec.md#6.5-6`「审批活动的处理结果必须显式覆盖通过、驳回、退回」在本项目**无适用对象**。

**依据（四条独立证据）**：
- 事实：`flow-index.md#流程总览` 的 10 条 FLOW 全部为技术/协同流，**无一条**是"提交—审批—通过/驳回"结构。
- 事实：`functional-inventory.md#0` 的功能清单中**无任何**审批类功能（类型枚举只有 platform / operations / business / common-entry；该清单在建模期间由 32 个减为 29 个，用途分类始终不含审批类）。
- 事实：`domain-model.md#1` 的 33 个 OBJ 中**无审批单/审批任务/审批记录实体**。
- 事实：`technical-architecture.md#Spring Boot 版本与依赖清单`（来源 `pom.xml`）中无 Activiti / Flowable / Camunda 依赖；`flow-index.md#未覆盖与待确认项` 亦无审批相关条目。

**备选方案**：因为 `sys_notice` 有"发布"动作、`SysRole` 有"授权"动作，就推断存在轻量审批 → **否决**：`SysNoticeMapper.xml:66` 的 `update sys_notice` 是直接更新状态，无中间审批态；`SysRoleController` 的授权是直接写入，无审核节点。

**影响**：M6 只有 `COLLABORATION`；`M6-spec.md#6.2.2` 的审批流模板在本项目中只作为"不适用"记录。

### D-20 流程参与者的降级

**决策**：`flow-index.md` 中的参与者按下列规则映射：

| 上游参与者表述 | 映射 | 依据 |
|---|---|---|
| "管理员" | 若 M5 中存在对应角色 → `roleRef`；否则 → `SYSTEM_TASK`（不写自由文本） | `M6-spec.md#6.1` 强制"不得填写自由文本，不得直接绑定具体用户" |
| "三方应用 / 调用方" | **不是 M5 参与者**（无 Shiro 会话），→ `SYSTEM_TASK` 或流程外部触发 | 事实：`ShiroConfig` 把 `/open/**` 设为 `anon`，网关自行按 appKey 签名鉴权（`technical-architecture.md#Shiro 安全链路`） |
| "网关 / Quartz / 过滤器 / 切面" | → `SYSTEM_TASK` | 事实：这些是框架组件，不是 M5 角色 |
| "已登录用户 / 匿名访问者" | 登录前的流程 → 无 `roleRef` 的 `USER_TASK` 不成立，改用 `SYSTEM_TASK` 描述；登录后的流程 → 用 M5 中实际存在的角色 | 同上 |

**备选方案**：为"管理员""第三方应用"凭空造 M5 角色 ID → **否决**：违反"模型是唯一语义来源"与"引用必须存在"门禁（`M6-spec.md#6.6`）。

**影响**：M6 中 `USER_TASK`/`APPROVAL_TASK` 数量可能为 **0**（若 M5 中无确切可对应角色），流程主要由 `SYSTEM_TASK` + `BEHAVIOR_CALL` 构成。这会触发 G3a 门禁的"`roleRef` 引用均须存在"校验——**空集合是合法结果**，但必须在 M6 文档中说明"本项目无人工审批节点"，避免被判为漏建。

---

## 3. M5 主体模型：角色、权限与缺口

### D-21 权限码的两套证据分级

**决策**：M5 的 `permissions[]` 中每条权限必须标注证据级别：

| 证据级别 | 含义 | 本项目实例 |
|---|---|---|
| `事实-代码强制` | 源码中存在 `@RequiresPermissions("xxx")`，Shiro 注解通知器已开启（`ShiroConfig#authorizationAttributeSourceAdvisor`） | `system:user:list`（`SysUserController.java:71`）、`monitor:job:view`（`SysJobController.java:44`） |
| `事实-仅菜单声明` | 权限码**只**出现在菜单/按钮权限 SQL 中，源码中无任何校验点 | `open:app:view`、`open:api:view`、`open:auth:view`、`open:log:view`、`open:doc:view` 及 10 个 `open:*:list/add/edit/remove/save/generate` |

**依据**：
- 事实：对 `*.java` 检索 `open:(app|api|auth|log|doc):` **零命中**；对 `*.sql` 检索同一模式命中 **48 处**，其中 15 个唯一权限码（每题 3 份方言副本）：`open_api_menu.sql:8-26`、`deploy/local-docker/mysql/init/40-open-api-menu.sql:8-26`、`deploy/local-docker/postgres/init/40-open-api-menu.sql:6-24`。
- 事实：`@RequiresPermissions` 在源码中共 **111 处**（含 1 处 Javadoc 引用与 1 处注解定义注释；有效注解约 109 处），全部落在 `Sys*Controller`、`SysJobController`、`SysJobLogController`，**无一处在 `com.qvsu.open.controller.*`**。
- 事实：`interface-index.md#3` 列出 79 个无权限码端点，其中 9 个被标 **高危**（4 个 open 域管理写操作 + 5 个系统域写操作）。

**备选方案**：只看菜单 SQL，把 `open:*` 当成与 `system:*` 同等的权限 → **否决**：这会把"菜单可见性约束"误报为"后端鉴权"，属**最危险的一类建模错误**（会让阶段三以为开放域已有权限保护）。

**影响**：M5 的 55 个权限码中，`open:*` 这一族（15 个）全部为 `事实-仅菜单声明`；`permissions[].targetRef` 只能靠**端点语义推断**到 M2 行为（见 A-M5-02）。同时：**79 个端点对应的行为没有可填的 `requiredPermissions`**。

### D-22 不虚构角色继承与数据范围

**决策**：
- `roles[].inheritsFrom`：**默认为空**（不写角色继承）。
- `permissions[].dataScope`：仅当角色数据中存在 `sys_role.data_scope` 且该角色确实在校验链上生效时才填；在**开放域**（`com.qvsu.open`）一律不填（因为开放域无 `@DataScope` 使用点）。

**依据**：
- 事实：`SysRoleMapper.xml:24,32,38` 的 select 列包含 `role_key`、`role_sort`、`data_scope`、`status`、`del_flag`，**无** `parent_role_id` 之类字段；`Domain-model.md#OBJ-SysRole` 描述为"10 字段，含数据范围 dataScope 与菜单勾选集合"→ **无父角色概念**。
- 事实：`M5-spec.md#5.3.2` 的 `inheritsFrom` 是本体规范能力，不是本系统的现状。
- 事实：`technical-architecture.md#AOP 与横切能力` 表显示 `DataScopeAspect` 的切点是 `@annotation(controllerDataScope)`；检索 `com.qvsu.open` 包无 `@DataScope` 使用。
- 推断：开放域（应用/接口/授权/日志/文档）**无数据范围隔离**，任意有会话的用户可见全部数据。

**影响**：M5 中开放域的 `dataScope` 语义只能是 `ALL`；若业务要求"应用只能被责任人看到"，那属于**新增需求**而非现状建模（见 A-M5-04）。

### D-23 无菜单功能不进 M5 的人工角色授权链

**决策**：9 个无菜单功能的 `SYSTEM` 行为**不**赋予任何角色权限；它们不出现在 MU 功能点中。

**依据**：事实：`non-menu-function-index.md` 的 9 个功能触发类型为 `api-only`(7)/`scheduled`(1)/`startup-lifecycle`(1)，均无菜单入口；`M2-spec.md#3.4-1` 的可追溯门禁只约束 `triggerType=USER_ACTION` 的行为。

**影响**：门禁 G1 的 `A ⊆ B` 断言中，A 集合**不含**这 9 个功能的行为，因此不会因"MU 里没有它们的功能点"而报错。

---

## 4. M6 流程模型：流程粒度与边界

### D-24 10 条 FLOW 全部折算为 `COLLABORATION`

**决策**：`flow-index.md` 的 10 条 FLOW → M6 中 10 条 `flowType: COLLABORATION` 流程（其中 `FLOW-FILE-IO`、`FLOW-OPER-AUDIT` 属平台横切，可考虑合并为一个"平台横切协同流"或保留独立）。

**备选方案**：
1. 只建"业务"流程（`FLOW-APP-ONBOARD`、`FLOW-INTERFACE-DEFINE`、`FLOW-CALLLOG-QUERY`、`FLOW-OPEN-GATEWAY`、`FLOW-SELFTEST`），把登录/授权/审计/文件/调度当"技术流程"排除 → **否决**：这 5 条恰恰是权限与安全的边界所在，排除后 M6 无法表达"登录后才装载权限"这类关键顺序依赖（`flow-index.md#流程间的依赖关系` 已明确该依赖）。
2. 把 10 条全部建成独立流程 → **采用**，但允许合并高度相似的横切流程。

**依据**：事实：`flow-index.md#流程总览` 给出 10 条流程的触发方式/参与者/物理表/入口类；`#流程间的依赖关系` 给出 8 条前置-后置依赖。

**影响**：M6 `SUB_FLOW_CALL` 的候选来自这 8 条依赖中确属"调用"的部分（需逐个判定"依赖"是"调用"还是"时序前置"，后者不能建成 `SUB_FLOW_CALL`）。**不得**把 8 条依赖全部建成子流程调用（会造出事实上不存在的调用关系）。

### D-25 流程粒度与 M2 行为粒度的分工

**决策**：M6 只承载"粗粒度阶段"，不复制 M2 行为内部逻辑。

| 层 | 表达的内容 | 例（`FLOW-APP-ONBOARD`） |
|---|---|---|
| M6 | 阶段顺序、人工/系统分界、条件网关 | "管理员录入应用 → 管理员登记接口 → 管理员授权 → 应用可调用" |
| M2 | 每个阶段的原子行为与联动 | `OpenApp_Insert`、`OpenApi_Insert`、`OpenAppApi_SaveAuth` |
| M3 | 阶段间的判断条件 | "应用不存在/已过期则不可鉴权" |

**依据**：`M6-spec.md#6.1` 与 `#6.5-8`（"跨对象联动已由 M2 `syncTriggers` 承载，流程中可用 `SYSTEM_TASK` 标注联动触发的结果活动，但**不得重复定义联动逻辑**"）。

**影响**：M6 的活动数应远少于 M2 的行为数；若某流程的活动逐个等于 M2 行为且无网关，则该流程**没有建模价值**，应合并或降级为 M2 的 `syncTriggers`。

---

## 5. M7 查询报表模型：查询与报表的界限

### D-26 什么时候建 M7，什么时候不建

**决策**（可直接执行的判定树）：

```text
该查询是否为"单聚合、无条件或仅等值过滤"的简单列表？
├─ 是 → 只建 M2 QUERY 行为，不建 M7（M7-spec.md#7.2）
└─ 否 → 是否跨 2 个及以上 M1 对象？
        ├─ 否 → 只建 M2 QUERY 行为
        └─ 是 → 建 M7 对象
                ├─ 返回单条主记录 + 关联信息 → DETAIL_QUERY
                ├─ 返回列表且支持分页/排序 → LIST_QUERY
                ├─ 含聚合函数或 GROUP BY → STATISTICAL_QUERY
                └─ 有固定列 + 分组 + 小计/合计 + 导出格式 → REPORT
```

**本项目的落地结论**：

| 查询 | 判定 | 依据 |
|---|---|---|
| `/admin/open/log/list`（`OpenLogController:42`） | **不建 M7**（单表 + 条件过滤，无 Join） | 事实：`OpenManageService.selectLogList` 是单表查询（`OpenManageService.java:285-287`），条件为 `trace_id`/`app_key`/`api_path LIKE`/`status`/时间范围 |
| `/admin/open/log/stats`（`OpenLogController:51`） | **建 M7 `STATISTICAL_QUERY`** | 事实：`queryLogStatsToday` 含 `count(1)`、`sum(case...)`、`avg(cost_ms)`、`GROUP BY app_name ORDER BY callCount DESC LIMIT 5`（`OpenManageService.java:342-355`）→ 有聚合 + 分组 → 满足 STATISTICAL_QUERY |
| `/admin/open/app/list`、`/admin/open/api/list`、`/admin/open/doc/list` | **不建 M7**（单表） | 事实：`selectAppList`/`selectApiList`/`selectDocList` 均为单表（`OpenManageService.java:39-65,151-177,361-366`）。**分页差异（必须逐端点确认，不得用"有 list 端点即有分页"的启发式）**：`app/list` 与 `api/list` **有**服务端分页（`OpenAppController.java:44`、`OpenApiMgrController.java:51` 调 `startPage()`），`doc/list` **无**分页（`OpenDocController.java:61-66`：GET、零参数、无 `startPage()`、返回 `AjaxResult`）；平台域 `POST /system/menu/list`（`SysMenuController.java:48`）与 `POST /system/dept/list`（`SysDeptController.java:46`）同样**无** `startPage()`。全仓 `startPage()` 共 17 处调用、分布 14 个类 |
| `/admin/open/auth/apiIds`（`OpenAuthController:50`） | **建 M7 `LIST_QUERY`**（跨 `open_app_api` + `open_api`） | 事实：`listAuthorizedApiIds` 单表，但授权页需要"已授权接口 + 可选接口"两个集合（`listApiOptions` + `listAuthorizedApiIds`）→ 页面语义是跨对象；需人工确认口径（A-M7-02） |
| `/admin/open/doc/download`（`OpenDocController:87`） | **建 M7 `REPORT`**（若确为按应用/接口组装文档导出） | 待取证（A-M7-03） |
| `/admin/open/log/exportCsv`（`OpenLogController:58`） | **建 M7 `REPORT`** | 见 D-15 |
| 系统域各 `.../list`（用户/角色/菜单/部门/岗位/字典/参数/公告/任务/任务日志） | 逐个判定：`sys_user` 列表实际 Join `sys_dept`（`SysUserMapper.xml:63`），`sys_role` 列表 Join `sys_user_role`（`SysRoleMapper.xml:66`）→ **建 M7**；纯单表的（如公告）→ **不建** | 事实：`SysUserMapper.xml:63`（`from sys_user u ... left join sys_dept d`）、`SysRoleMapper.xml:32`（角色列表 select 含 `r.*` 与关联计数） |

**依据**：`M7-spec.md#7.2` 的分界表与 `#7.3` 的对象类型表。

**影响**：M7 的对象数量显著少于"每个列表页一个对象"的直觉。**不建 M7 的页面在 MU 中仍可能是 `QUERY_LIST` 屏幕**——屏幕类型（MU）与查询对象（M7）是两个正交维度。

### D-27 `preAggregation` 的使用门槛

**决策**：仅当"两个及以上一对多来源同时参与聚合"时才写 `preAggregation`。

**本项目情况**：唯一的聚合查询 `queryLogStatsToday` 的 `topApps` 子查询是"单表单维度分组"，**不涉及多来源相乘** → **不需要 `preAggregation`**。

**依据**：事实：`OpenManageService.java:353-355` 的 `topApps` 是 `select app_name appName, count(1) callCount from open_call_log ... group by app_name`，来源只有 `open_call_log` 一个。

**影响**：M7 中 `preAggregation` 预计为空；`M7-spec.md#7.6-6`「禁止以 `SUM(DISTINCT amount)` 代替预聚合」在本项目无适用场景，但若将来新增"按应用统计调用次数+按接口统计成功率"的复合报表，即须使用。

---

## 6. MU UI 模型：页面取舍与排除

### D-28 屏幕全集 = 菜单真值 + 源码补入 − 外链

**决策**：

```text
MU 屏幕全集 =
  二级菜单真值 14 个（business-architecture.md#5.4 的 C 类）
  + 源码补入 1 个（menu_id=110 /monitor/job）
  − 外链 1 个（menu_id=4 qvsu官网 → ENTRY-external-homepage，非本系统页面）
= 15 个业务屏幕
```

一级菜单：`MENU-sys-root`（系统管理）、`MENU-open-root`（OpenAPI管理）共 **2 个**。

**依据**：
- 事实：`business-architecture.md#5.2` 的菜单树总览（含 ASCII 树），明确 2 个 M 类目录 + 14 个 C 类页面 + 1 个外链。
- 事实：`business-architecture.md#7.1` 说明"33 C + 5 M"是 5 份方言副本的累计行数（33 = 11×3），去重真值为 14 C + 2 M。
- 事实：`business-architecture.md#7.2` 说明 `menu_id=110` 来自 `sql/quartz.sql:191-208`，未被 `menus.json` 提取脚本覆盖，但源码 `SysJobController` 确实存在且带 `monitor:job:*` 权限码 → **必须建屏幕**。
- 事实：`business-architecture.md#5.1` 说明 `menu_id=4` 是 `target=menuBlank` 的外链 `http://qvsu.vip`，无权限码、无 Controller、无模板 → 不建屏幕。

**备选方案**：按任务书的"33 C + 5 M"建 33 个二级菜单 → **否决**：会把同一逻辑菜单建立 3 份主定义，违反"同一逻辑菜单只有一个主定义"的一致性要求（`business-architecture.md#7.1` 的处理意见）。→ 在假设清单中登记为待确认（A-MU-03）。

### D-29 屏幕类型判定规则

**决策**：按模板结构判定 `screenType`：

| 判定顺序 | `screenType` | 模板特征 |
|---|---|---|
| 1 | `LIST_MAINTENANCE` | 页面只有"工具栏（关键词+新增）+ 列表表格 + 行内编辑/删除 + 弹窗表单"，页面本身不展示表单 |
| 2 | `MASTER_DETAIL_FORM` | 页面有主表表单区 + 从表表格（含"新增行/删除行"） |
| 3 | `QUERY_LIST` | 页面上方查询条件区 + 下方结果表格 + 分页 |
| 4 | `SINGLE_FORM` | 页面只有一个表单（单条录入/编辑），无列表 |

**关键约束（来自规范，必须遵守）**：`MU-spec.md#8.4.1` 明确"`SINGLE_FORM` 用于**单条记录的录入/维护**……主数据、数据字典、简单实体等需要'列表 + 增删改'的维护界面应使用 `LIST_MAINTENANCE`，**不得**用 `SINGLE_FORM` 在页面顶部堆表单 + 底部列表的方式实现"。

→ **本项目判断**：`/admin/open/app`、`/admin/open/api`、`/system/user`、`/system/role`、`/system/menu`、`/system/dept`、`/system/post`、`/system/dict`、`/system/config`、`/system/notice`、`/monitor/job` 这些"列表 + 新增/编辑"页面 → **`LIST_MAINTENANCE`**（弹窗式维护），而**不是** `SINGLE_FORM`。
→ 但 RuoYi 的原生实现是"列表页 + 独立的 add/edit 页面"（独立 URL：`/system/user/add`、`/system/user/edit/{userId}`），**不是弹窗** → 这是**现状与规范的结构性差异**，必须在 MU 中显式选择：(a) 按现状建为 `LIST_MAINTENANCE` 但布局图如实画出"独立新增页"；(b) 按规范建为弹窗式。**默认选 (a) 按现状**（本体描述现状），并在假设清单登记（A-MU-06）。

**依据**：
- 事实：`OpenAppController.java:49-53`（`/add` 返回独立视图 `"open/app/add"`）、`:65-70`（`/edit/{id}` 返回 `"open/app/edit"`）→ 独立新增/编辑页，非弹窗。
- 事实：`MU-spec.md#8.4.4` 规定列表维护界面"新增点击'新增'按钮后弹出对话框（Modal）"。

### D-30 框架示例页排除

**决策**：73 个被排除的模板**不建屏幕、不建菜单、不进 MU**；在 MU 文档中给出排除清单与理由。

**依据**：
- 事实：`PROGRESS.md#1` 明确排除 `templates/demo/**`、`static/ajax/libs/**`、`src/test/**`、`deploy/dev-docker/**`。
- 事实：`source-coverage-report.md#1`：视图模板 144 个 → 71 建模 / 73 排除。
- 事实：`_CONTEXT-FOR-AGENTS.md#2.5-4`："前端存在大量 RuoYi 自带 `templates/demo/**` 示例页（144 个模板中占多数），属于框架示例而非业务功能，必须作为**范围排除**登记并说明理由。"
- 事实：`business-architecture.md#7.6` 表最后一行同样确认"`templates/demo/**` 框架示例页占 144 个模板多数 → 属范围排除，本文件不为其建立任何菜单或入口节点"。

**备选方案**：为 demo 页建屏幕并在 MU 中标注"示例" → **否决**：会把 73 个非业务页面带进本体，使 MU 的追溯价值崩溃（读者无法分辨哪些是真实业务页面）。

**影响**：MU 的屏幕全集**只允许**来自 71 个在范围模板；任何 `screenRef` 对应的模板路径若落在排除清单内，即为建模错误（对应门禁 G6）。

### D-31 ASCII 布局的证据来源与缺口处理

**决策**：
- 布局图的**控件与标签**：优先取模板文件中的真实控件与中文 label；取不到的（模板为纯 JS 渲染、或字段名无中文标签）**不得**凭字段名编造中文标签，而应：(a) 用 `M1` 属性的 `label`（若已确定）；或 (b) 写为不可判定的占位描述并在假设清单登记。
- 布局图的**区域划分**：按 `MU-spec.md#8.4` 的四类模板（单表/主从/查询列表/列表维护）强制规则绘制，**不描述视觉样式**。

**依据**：事实：`MU-spec.md#8.1` 边界第 2 条"不承载视觉设计……ASCII 布局只表达区域划分与控件排布"；`#8.4` 规定等宽字符、边框字符集、控件标注语法。

**影响**：存在"控件存在但中文标签无佐证"的部分（如纯 JS 动态生成的表格列、`open/log/index.html` 中的统计卡片）→ 全部进假设清单（A-MU-07）。

---

## 7. 跨模型横向决策

### D-32 ID 命名策略

**决策**：

| 模型 | ID 命名 | 依据 |
|---|---|---|
| M1 聚合 | 沿用上游 `OBJ-*` 语义，但改为本体风格 `AGG-{Domain}-{Seq}` | `M1-spec.md#2.3.1` 未强制格式，`#2.4` 示例用 `AGG-CONTRACT-001` |
| M2 行为 | `{EntityAlias}_{ActionName}` | `M2-spec.md#3.2.1` 明确建议格式 |
| M3 规则 | `RULE-{Domain}-{Seq}` | `M3-spec.md#4.3.1` 明确建议格式 |
| M5 权限 | `PERM-{Domain}-{Action}` | `M5-spec.md#5.3.3` 明确建议格式 |
| M5 角色 | `ROLE-{Name}` | `M5-spec.md#5.4` 示例 |
| M6 流程 | `FLOW-{DOMAIN}-{NNN}` | `M6-spec.md#6.3.1` 明确建议格式 |
| M7 查询 | `QR-{DOMAIN}-{NNN}`；报表 `RPT-{DOMAIN}-{NNN}` | `M7-spec.md#7.4.1` 明确建议格式 |
| MU 屏幕 | `frm{Xxx}`（建议与实现控件名一致） | `MU-spec.md#8.2.3` |

**关键取舍**：**上游 `OBJ-*` ID 不直接复用为本体 ID**，因为 `OBJ-SysUser` 之类的 ID 中混入了 Java 类名，而 M1 的聚合是业务概念（例如"用户"聚合可能对应 `SysUser` + `SysUserRole`）。但**必须**在 M1 的 `tags` 或描述中保留上游 `OBJ-*` 的溯源引用，否则丢失可追溯性。

**依据**：事实：`00-ontology-overview.md#1.2` 指出的"本体是现状表达"，而上游 `OBJ-*` 是"Java 对象清单"，二者粒度不同。

### D-33 「事实 / 推断 / 假设」三级标注的落地要求

**决策**：三个文档（本目录全部文件）与 YAML 注释中，每条结论必须可归入三级之一：

| 等级 | 判定标准 | 例 |
|---|---|---|
| **事实** | 能在源码/DDL/上游文档中找到直接记载，可给出路径+行号 | `SysUserMapper.xml:159` 的 `update sys_user set del_flag='2'` |
| **推断** | 由 2 处及以上证据推出，无单一直接证据 | "`s_*` 列是未被使用的兼容列"（依据：DDL 有列 + 代码从不读写 + 默认值语义相悖） |
| **假设** | 待人工确认；若假设不成立会影响模型正确性 | "`open:*` 权限码应由后端强制校验"（A-M5-03） |

**约束**：**推断不得写成事实**。这是本次逆向阶段被上游反复强调的要求（`business-architecture.md#0.1`、`consistency-report.md#Pass O`）。

### D-34 不作为决策的事项（明确不做）

| 事项 | 为什么不做 |
|---|---|
| 不修改 `docs/meta-model/`、`docs/ontology/_spec/`、`docs/ontology/yaml/` 下任何文件 | 本次任务的硬性约定；上游已 PASS，`_spec` 是只读规范，`yaml` 由并行任务产出 |
| 不为"现状缺陷"提修复方案 | 建模阶段只描述现状并登记偏差；修复属新的变更请求（`business-architecture.md#7.3` 的"待确认动作"即此原则） |
| 不补建需求规格说明书 | `ontology-driven-dev` 阶段一在本项目中不可回溯执行（无业务方输入）；缺失由 `02-assumptions-and-open-questions.md` 的假设清单替代承担 |
| 不预测 M7 的 `referenceSql` | `M7-spec.md#7.1` 明确 v9.0 中参考 SQL 改为**可选**，物理表名在实现阶段确定 |

---

## 8. 相关文档

- 总览与映射：[`00-ontology-overview.md`](./00-ontology-overview.md)
- 假设与未决问题：[`02-assumptions-and-open-questions.md`](./02-assumptions-and-open-questions.md)
- 七模型规范（只读）：[`_spec/00-overview-and-relations.md`](./_spec/00-overview-and-relations.md)、[`_spec/M1-spec.md`](./_spec/M1-spec.md)、[`_spec/M2-spec.md`](./_spec/M2-spec.md)、[`_spec/M3-spec.md`](./_spec/M3-spec.md)、[`_spec/M5-spec.md`](./_spec/M5-spec.md)、[`_spec/M6-spec.md`](./_spec/M6-spec.md)、[`_spec/M7-spec.md`](./_spec/M7-spec.md)、[`_spec/MU-spec.md`](./_spec/MU-spec.md)
