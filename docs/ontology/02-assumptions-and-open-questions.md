# 假设清单与待确认问题（Assumptions & Open Questions）

> 系统：`SYS-qvsu-openapi` ｜ 阶段：`ontology-driven-dev` 阶段二 · 本体建模
> 本文是本体建模阶段的**关键交付**：把建模过程中所有**推断**与**假设**集中登记，供人工逐条确认。
> 标记约定：`[待确认]` = 尚未获得人工确认（本次交付**默认全部为此状态**）；`[已确认]` = 已获人工确认（需在「确认结论」中填写依据）。
> 证据等级：**事实**（源码/DDL/上游文档直接记载，附路径与行号）/ **推断**（由多处证据推出）/ **假设**（本文登记项，待确认）。
> 相关文件：`00-ontology-overview.md`（总览与映射）、`01-modeling-decisions.md`（判断与取舍）。

---

## 0. 阅读与使用说明

### 0.1 本文收录什么、不收录什么

| 收录 | 不收录 |
|---|---|
| 本体建模中**被迫做出**的业务判断（例如"这个对象是不是聚合根"） | 纯技术实现细节（如线程池大小），除非影响模型语义 |
| **只有代码能作证、业务方未表达**的规则 | 上游已明确断言的**事实**（那些进 `00` / `01`，不进本文） |
| 上游逆向遗留的**未决项 `Q-*`** 及其对本体的影响 | 阶段三（应用构建）的实现选择 |
| **现状与规范不符**之处在本体中的处理方式 | 修复方案本身（修复属新的变更请求） |

### 0.2 每条假设的字段含义

| 字段 | 含义 |
|---|---|
| 编号 | `A-{模型}-{序号}`；`A-DATA-*` 为数据/证据类横切假设 |
| 所属模型 | M1 / M2 / M3 / M5 / M6 / M7 / MU / 横切 |
| 假设内容 | 一句话说明"我们假定成立的是什么" |
| 依据 | 支撑该假设的源码文件+行号或元模型文档§（含证据等级） |
| 若假设不成立的影响 | 该假设被推翻时，哪些模型元素会错、下游会受什么影响 |
| 需谁确认 | 建议的确认责任方（业务方 / 架构师 / DBA / 安全负责人 / 前端负责人） |
| 风险 | 高 / 中 / 低 |
| 标记 | `[待确认]` / `[已确认]` |

### 0.3 本次建模所依据的上游版本（重要）

本体建模开始时，上游 `docs/meta-model/` 处于**通过双校验**状态；建模过程中该目录被**并行任务持续修改**。截至本文定稿时的观测快照：

| 项 | 建模开始时 | 本文定稿时 | 对本体的影响 |
|---|---|---|---|
| 功能数 `FUNC-*` | 32 | **29**（3 个审计查询功能被删除） | M2 行为清单减少 3 个功能的来源；M7 不再为审计查询建对象 |
| 无菜单功能数 | 9 | **6** | MU / M6 相应变化 |
| 配置键 `CFG-*` | 168 | **29** | 影响 M3 规则中的配置开关引用 |
| 接口节点 | 195 | **192** | M7 / M2 的端点来源口径 |
| C 类页面菜单 | 14 | **15**（`extract-menus.js` 已修复，纳入 `sql/quartz.sql`） | MU 屏幕全集口径 |
| F 类按钮权限 | 50 | **57** | M5 权限条目数 |
| 官方校验器 | PASS / ERROR=0 | **FAIL / ERROR=1**（`Q-audit-query-not-implemented` 在主定义文件中被引用但未被识别为主定义） | 见下方标注 |

**因此（事实）**：本文与 `00` / `01` 中一切**未发生变化**的量化事实（184 端点 / 105 带权限 / **79 无权限** / `com.qvsu.open` 36 端点 / 33 对象 / 34 表 / 10 条 FLOW / 权限码族）仍然有效；而"32 个功能""168 个配置键""9 个无菜单功能""195 个接口节点""上游 PASS"这些表述**已过期**，本体落地时必须重取。

> **本文不沿用"上游已 PASS"作为可信度背书**。无论上游校验结果如何，本文的每一条依据都能独立回到源码或元模型文档的具体位置。

---

## 1. M1 对象模型假设

### A-M1-01　聚合根全集与"未进 M1 的对象"去向

- **假设内容**：M1 的聚合根集合 = {`SysUser`、`SysRole`、`SysMenu`、`SysDept`、`SysPost`、`SysDictType`、`SysDictData`、`SysConfig`、`SysNotice`、`SysJob`、`SysJobLog`、`OpenApp`、`OpenApi`、`OpenAppApi`、`OpenApiDoc`、`OpenCallLog`、`SysOperLog`、`SysLogininfor`、`SysUserOnline`}；`SysUserRole`/`SysRoleMenu`/`SysRoleDept`/`SysUserPost` 降级为 `aggregate_associations`；6 个 DTO + 3 个基类 + `OpenAuthContext` 不进 M1；`QRTZ_*`（11 张）与 `gen_*` 不进 M1。
- **依据**：
  - 事实：`docs/meta-model/domain-model.md#1`（33 个对象，仅 6 个标"聚合根=是"）、`#3`（继承关系）、`#4`（11 张 `QRTZ_*` 无实体）。
  - 事实：`PROGRESS.md#Q-16-tables-beyond-34`（`gen_*` 无实体无功能）。
  - 推断：`OpenManageService.java:122-134`（删应用级联删 `open_app_api`）、`:227-239`（删接口级联删 `open_app_api`）、`:258-279`（授权整体重写）；`SysUserMapper.xml:159`、`SysRoleMapper.xml:85`。
  - 方法依据：`01-modeling-decisions.md` D-01～D-08。
- **若假设不成立的影响**：聚合根数量与归属判错会**级联污染** M2（`ownerEntity`、`syncTriggers` 的跨聚合约束）、M7（`sourceObjects.primary`）、M6（`businessObjectRefs`）。这是**影响面最大的一条假设**。
- **需谁确认**：架构师 + 业务方（业务方确认"业务完整性"维度，架构师确认"事务/访问路径"维度）
- **风险**：高
- **标记**：`[待确认]`

### A-M1-02　`open_*` 表的 `s_*` 兼容列是死列

- **假设内容**：`s_status`、`s_is_del`、`s_created_time`、`s_updated_time` 四列当前**不被任何代码读写**，是历史兼容列，因此**不建为 M1 属性**。
- **依据**：
  - 事实：MySQL DDL 中 5 张 `open_*` 表均含这 4 列：`open-api/sql/open_api.sql:21-24`、`41-44`、`53-56`、`79-82`、`97-100`。
  - 事实：`OpenManageService.java`（399 行，20 余条 SQL）对该 4 列**零读写**；仅在 SELECT 中用 `create_time as s_created_time` 作结果映射别名（`:43,71,81,92,155,182,192,286,364,384`）。
  - 事实：`change-hotspots.md#HOT-OPEN-TABLES` 明确记载"遗留 `s_*` 兼容列 + 双时间列 + 无外键"，处置建议为"定版列语义并清理兼容列"。
  - 推断：`s_is_del` 默认值为 **1**（`open_api.sql:22`），若语义是"删除标记"则默认即"已删除"，与全表默认存活相悖。
- **若假设不成立的影响**：若上游/外部系统确实读写 `s_is_del`（例如以 `s_is_del=0` 表示有效），则 M1 漏掉 5 张表的逻辑删除字段、M7 的所有查询条件缺失 `s_is_del` 过滤，**查询结果集会与真实业务语义不符**（可能把"已删除"的应用当作有效应用）。
- **需谁确认**：业务方（是否有外部系统或历史数据依赖这 4 列）+ DBA
- **风险**：中
- **标记**：`[待确认]`

### A-M1-03　逻辑删除的双轨策略是刻意设计而非遗漏

- **假设内容**：`sys_user`/`sys_role`/`sys_dept` 用 `del_flag='2'` 逻辑删除，`sys_menu`/`sys_dict_*`/`sys_post`/`sys_config`/`sys_notice`/`sys_job`/`sys_job_log` 与全部 `open_*` 用物理删除——这是**现状**，本体如实表达，不统一为 `flag=0`。
- **依据**：
  - 事实（逻辑删除）：`SysUserMapper.xml:159,163`、`SysRoleMapper.xml:85,89`、`SysDeptMapper.xml:148`、`:34,40,64,71,86`（查询均带 `del_flag='0'`）。
  - 事实（物理删除）：`SysMenuMapper.xml:118`（含子菜单 `or parent_id = #{menuId}`）、`SysDictTypeMapper.xml:64`、`SysDictDataMapper.xml:63`、`SysPostMapper.xml:68`、`SysConfigMapper.xml:107`、`SysNoticeMapper.xml:79`、`SysJobMapper.xml:65`、`SysJobLogMapper.xml:58`。
  - 事实（open 域物理删除）：`OpenManageService.java:133,238,262`。
  - 事实：`change-hotspots.md#HOT-DATA-CONSIST` 记载"`JdbcTemplate` 与 MyBatis 混用、删除语义不统一"。
- **若假设不成立的影响**：若业务要求"删除即不可恢复"或"删除必须可恢复"，则 M1 需为每张表统一声明删除语义，M2 的删除行为语义（状态变更 vs 行消失）随之改变，M7 的过滤条件需增删 `del_flag`。
- **需谁确认**：业务方（数据保留合规要求）+ 架构师
- **风险**：中
- **标记**：`[待确认]`

### A-M1-04　`open_*` 的删除级联在单一事务内完成

- **假设内容**：`deleteAppByIds` 与 `deleteApiByIds` 的"先删授权、再删主体"在**同一事务**内完成；后者虽未标注 `@Transactional`，但假定其实际执行不产生"授权已删、主体仍在"的中间态。
- **依据**：
  - 事实：`OpenManageService.java:101`（`insertApp` 带 `@Transactional`）、`:122`（`deleteAppByIds` 带 `@Transactional`）、`:199`（`insertApi` 带 `@Transactional`）、`:227`（`deleteApiByIds` **不带** `@Transactional`）、`:258`（`saveAppAuth` 带 `@Transactional`）。
  - 事实：`deleteApiByIds` 先 `delete from open_app_api where api_id in (...)`（`:237`）再 `delete from open_api where s_id in (...)`（`:238`），两条独立 `jdbcTemplate.update`。
  - 推断：无外层事务时两条语句各自自动提交，若第二条失败则授权记录已不可恢复地丢失。
- **若假设不成立的影响**：本体层面无直接影响（M1 仍把级联表达为聚合内操作）；但 M2 的 `postconditions` 必须写明"清除授权关系"与"删除接口"是一个原子业务结果，否则阶段三实现会容忍中间态。
- **需谁确认**：架构师（确认是否应补 `@Transactional`）
- **风险**：中
- **标记**：`[待确认]`

### A-M1-05　状态字段语义：平台域 `0` 有效 / 开放域 `1` 有效（极性相反）

- **假设内容**：`sys_user.status`、`sys_role.status`、`sys_dept.status`、`sys_menu.status` 等平台域字段的"正常/有效"值为 `0`；而 `open_app.status`、`open_api.status` 的"启用"值为 `1`。两个域的状态极性**相反**，M1 的 `enumValues` 必须分别取值。
- **依据**：
  - 事实：`open-api/sql/open_api.sql:16`（`status TINYINT DEFAULT 1 COMMENT '1=enabled 0=disabled'`）、`:34`（`status TINYINT DEFAULT 1`）。
  - 事实：`OpenManageService.java:82`（`where app_key=? and status=1`）、`:94`（`a.status=1`）、`:193`（`status=1`）、`:245`（`where status=1`）、`:250`（`where status=1`）→ 开放域以 `1` 为有效。
  - 事实：`SysUserMapper.xml:178`（`update sys_user SET status = #{status}`）与 `UserConstants.ROLE_NORMAL`（`DataScopeAspect.java:95`）→ 平台域沿用 RuoYi 的 `0`=正常约定。
  - 事实：模板侧 `open/app/index.html:19-20` 将 `1` 显示为"启用"、`0` 显示为"禁用"。
- **若假设不成立的影响**：M1 的枚举值写反会导致 M3 规则（如"应用须为启用状态"）与 M7 条件（`status=1`）语义颠倒，**症状是"启用"与"禁用"互换**，属高危隐蔽缺陷。
- **需谁确认**：业务方 + 架构师（建议在 `sys_dict_data` 中固化两个域的语义）
- **风险**：高
- **标记**：`[待确认]`

### A-M1-06　`gen_*` 表属遗留、不承载业务

- **假设内容**：`gen_*`（代码生成相关）表在 DDL 中存在但无实体、无功能、无页面，属精简后的遗留，不进 M1。
- **依据**：
  - 事实：`PROGRESS.md#Q-16-tables-beyond-34`（"部分平台表（如 `gen_*` 代码生成相关）在 DDL 中出现但无对应 Java 实体与功能"）。
  - 事实：`data-ownership.md` 将其标记为"仅由初始化 SQL 写入"。
  - 事实：视图模板中仅 `templates/tool/build/build.html` 与代码生成相关，且无对应功能登记（当前 29 个 FUNC 中无代码生成功能）。
- **若假设不成立的影响**：若 `gen_*` 属在用的代码生成器数据，则 M1 缺少一组聚合，MU 缺少"代码生成"屏幕；但当前**无 Controller、无菜单、无功能**可支撑其入模。
- **需谁确认**：架构师（确认是否为精简版裁剪遗留）
- **风险**：低
- **标记**：`[待确认]`

### A-M1-07　`open_api_doc.api_ids` 是冗余的逗号串而非关联

- **假设内容**：`open_api_doc.api_ids`（`VARCHAR(500)`）保存的是**接口 ID 的逗号分隔串**（非规范化快照），不进 `aggregate_associations`；文档与接口之间**没有可 Join 的关联结构**。
- **依据**：
  - 事实：`open-api/sql/open_api.sql:93`（`api_ids VARCHAR(500) NULL`）。
  - 事实：`OpenManageService.java:368-373`（`saveDoc` 直接把 `doc.getApiIds()` 写入该列，无任何拆分或关联表写入）。
  - 事实：`change-hotspots.md` 的规范化缺口清单记载了 8 条非规范化快照（由并行提取确认）。
- **若假设不成立的影响**：若 M1 把 `api_ids` 建成"文档—接口多对多关联"，则 M7 会写出无法执行的 Join（物理层无该关联表），阶段三按模型实现必然失败。
- **需谁确认**：DBA + 架构师
- **风险**：中
- **标记**：`[待确认]`

### A-M1-08　`open_call_log` 用 `api_path` 字符串关联 `open_api`

- **假设内容**：`open_call_log` 与 `open_api` 之间**没有 ID 引用**，只有 `api_path` 这一**值匹配**；因此 M1 中不建"调用日志 → 接口"的 `aggregate_associations`，`open_call_log.app_name`/`api_path` 属刻意冗余。
- **依据**：
  - 事实：`open-api/sql/open_api.sql:65`（`api_path VARCHAR(200) NULL`）、`:64`（`app_name VARCHAR(100) NULL`）；`open_api.sql:30`（`api_path VARCHAR(200) NOT NULL UNIQUE`）。
  - 事实：`OpenManageService.java:285-287`（日志查询 select 列表含 `app_name`、`api_path`，**不含** `app_id`/`api_id`）。
  - 事实：`flow-index.md#FLOW-OPEN-GATEWAY` 涉及的物理表一节显示鉴权用 `open_api` 的 `api_path` 精确匹配。
- **若假设不成立的影响**：若建立该关联，M7 的日志查询会给出"通过 `api_id` 关联接口"的错误 Join；且日志行的 `app_name` 冗余会被误判为建模冗余而删除。
- **需谁确认**：架构师
- **风险**：中
- **标记**：`[待确认]`

### A-M1-09　聚合间无数据库外键，引用完整性由应用层保证

- **假设内容**：34 张表中除 `open_app_api` 的 `UNIQUE (app_id, api_id)` 外，**没有外键约束**；M1 的 `aggregate_associations` 全部是"逻辑关联"，不落为 DDL 外键。
- **依据**：
  - 事实：`open-api/sql/open_api.sql:47-58`（`open_app_api` 只有 `UNIQUE KEY uk_app_api`，无 `FOREIGN KEY`）；其余 `open_*` 表 DDL 中无 `FOREIGN KEY`。
  - 事实：`change-hotspots.md#HOT-OPEN-TABLES` 记载"遗留 `s_*` 兼容列 + 双时间列 + **无外键**"。
  - 事实：`database-inventory.md` 记载源码中不存在视图、物化视图、存储过程与触发器。
- **若假设不成立的影响**：若存在隐式约束（如数据库触发器），M1 的 `invariants` 与 M3 规则会漏掉一部分强制逻辑。当前已确认无触发器。
- **需谁确认**：DBA
- **风险**：低
- **标记**：`[待确认]`

### A-M1-10　M7 查询中的 `del_flag='0'` 过滤必须显式补写

- **假设内容**：平台域查询（用户/角色/部门）在 M7 中必须显式声明 `del_flag='0'` 条件，否则语义与代码不一致（代码在 SQL 里硬编码了该条件）。
- **依据**：
  - 事实：`SysUserMapper.xml:65`（`where u.del_flag = '0'`）、`:97`、`:114`、`:128`、`:133`、`:138`、`:142`、`:146`、`:150`；`SysRoleMapper.xml:38`、`:66`、`:71`、`:76`、`:81`；`SysDeptMapper.xml:34`、`:40`、`:59`、`:64`、`:71`、`:86`。
  - 事实：该条件写在 Mapper SQL 中，**不是** M1 属性级 `refRules`，因此不会自动出现在 M7 的条件里。
- **若假设不成立的影响**：若认为"逻辑删除过滤属实现细节、不必入模型"，则 M7 的 `conditions` 会缺失该条件，阶段三按模型生成查询时会返回已删除数据——**与现状行为不一致**。
- **需谁确认**：架构师（决定该条件写在 M7 `conditions` 还是作为全局查询约定）
- **风险**：中
- **标记**：`[待确认]`

---

## 2. M2 行为模型假设

### A-M2-01　`GET .../add` 与 `GET .../edit` 不建 M2 行为

- **假设内容**：菜单功能的"打开新增页/编辑页"（GET，源码 `return "xxx/yyy"`）**不建 M2 行为**，只作为 MU 屏幕的一部分。
- **依据**：
  - 事实：`OpenAppController.java:34-38`（`app()` 返回 `"open/app/index"`）、`:49-53`（`add()` 返回 `"open/app/add"`）、`:65-70`（`edit()` 返回 `"open/app/edit"`）。
  - 事实：`interface-index.md` 的端点清单把 `GET /admin/open/app/add` 与 `POST /admin/open/app/add` 分成 `API-…-add` 与 `API-…-addSave` 两个节点。
  - 规范依据：`_spec/MU-spec.md#8.2.5`（操作功能点是"按钮/动作"）。
- **若假设不成立的影响**：若把渲染端点建成行为，会造出大量无业务结果的"行为"，并使 `M2-spec.md#3.4-1` 的可追溯门禁在 MU 中产生无实义功能点；M2 规模会膨胀约 30%。
- **需谁确认**：架构师
- **风险**：中
- **标记**：`[待确认]`

### A-M2-02　"删除"类端点的行为归属与 `syncTriggers` 使用

- **假设内容**：`deleteAppByIds`/`deleteApiByIds`/`saveAppAuth` 各自是**一个** M2 行为（不是"删主体"+"删关联"两个行为），聚合内级联写在 `postconditions`；**不使用** `syncTriggers`（因为 `open_app_api` 被判为 `OpenApp` 聚合的组成部分时属同聚合，`M2-spec.md#3.2.2-4` 禁止同聚合自我联动）。
- **依据**：
  - 事实：`OpenManageService.java:122-134`、`:227-239`、`:258-279`。
  - 规范依据：`_spec/M2-spec.md#3.2.2-4`（"下游行为必须作用于另一个独立聚合（跨对象），同一聚合内部变化不得用 `syncTriggers` 表达"）。
  - 张力点：本法与 `01-modeling-decisions.md` D-02（把 `OpenAppApi` 判为独立聚合根）**存在矛盾**——若 `OpenAppApi` 是独立聚合，则删授权的确跨聚合，**应当**用 `syncTriggers`。**这条假设就是为暴露该矛盾而登记。**
- **若假设不成立的影响**：若 `OpenAppApi` 判为独立聚合，则 M2 需为"删除应用"补一条 `syncTriggers` 指向"清除应用授权"行为，且门禁 G2 的跨聚合校验要相应调整。**两种口径不能混用。**
- **需谁确认**：架构师（一次性裁定 `OpenAppApi` 的归属，并统一 D-02 与本法）
- **风险**：中
- **标记**：`[待确认]`

### A-M2-03　无权限码端点的行为 `requiredPermissions` 留空

- **假设内容**：79 个无 `@RequiresPermissions` 端点所对应的 M2 行为，`requiredPermissions` **留空数组**（表达"无显式权限约束"），而不是"借用"一个语义相近的权限码，也不是跳过这些行为不建。
- **依据**：
  - 事实：`PROGRESS.md#Q-79-endpoints-without-permission`（"184 个端点中 79 个未标注 `@RequiresPermissions`"）。
  - 事实：`interface-index.md#3` 列出全部 79 个并标注 9 个高危（4 个 open 域管理写 + 5 个系统域写）。
  - 事实：`change-hotspots.md#HOT-PERM-GAP`（"`@RequiresPermissions` 覆盖 105/184"）。
  - 规范依据：`_spec/M2-spec.md#3.2.1`（`requiredPermissions` 是行为的属性，留空不违规）。
- **若假设不成立的影响**：若强行给这 79 个端点分配权限码，M5 会凭空多出一批"从未生效的权限"，而阶段三实现时会**真的加上校验**，从而改变系统行为（从"无权限"变成"有权限"，是老系统上线的典型故障源）。
- **需谁确认**：安全负责人 + 业务方（决定是"保持现状"还是"作为新增需求补权限"）
- **风险**：高
- **标记**：`[待确认]`

### A-M2-04　`triggerType` 的映射：`menu` → `USER_ACTION`，其余 → `SYSTEM`

- **假设内容**：`FUNC-*` 的"触发类型"列到 M2 `triggerType` 的映射为：`menu` → `USER_ACTION`；`api-only` / `scheduled` / `startup-lifecycle` → `SYSTEM`。
- **依据**：
  - 事实：`functional-inventory.md#0` 的触发类型统计（当前版本：`menu` 21、`api-only`、`startup-lifecycle`、`scheduled`）。
  - 规范依据：`_spec/M2-spec.md#3.2.1`（`triggerType` 仅 `USER_ACTION` / `SYSTEM` 两值）。
  - 张力点：**部分 `api-only` 功能其实是人在页面上触发的**（例如"通用文件上传"`FUNC-common-upload` 是 `api-only`，但由页面 AJAX 调用）。按本映射它们会被标为 `SYSTEM`，从而**不进入 MU 功能点、不受可追溯门禁约束**——这可能掩盖"上传按钮确实存在"的事实。
- **若假设不成立的影响**：若把 `FUNC-common-upload` 的行为标为 `USER_ACTION`，则必须补一个 MU 功能点引用它；否则门禁 G1 会判定孤儿行为。反之若保持 `SYSTEM`，则上传行为在 MU 中无入口，追溯链断开。
- **需谁确认**：架构师（逐个裁定 `api-only` 功能里哪些其实是人工触发的界面动作）
- **风险**：中
- **标记**：`[待确认]`

### A-M2-05　网关鉴权是一个行为还是多个行为

- **假设内容**：`FUNC-open-gateway-invoke` 产出 **1 个 COMMAND 行为**（`OpenApi_GatewayInvoke`）+ 1 个联动行为（写调用日志）+ 3 条 M3 规则，而不是把鉴权链的每一步建成独立行为。
- **依据**：
  - 事实：`flow-index.md#FLOW-OPEN-GATEWAY` 的"链路步骤（事实）"9 步（含逐条源码行号）。
  - 事实：`OpenApiSecurityService.java`（鉴权顺序：`normalizePath` → `loadApiInfo` → 状态检查 → `need_sign` 分支 → 缺头 → 时间戳 → `loadAppInfo` → `checkNonce` → `hasPermission` → `verifySignature`）。
  - 事实：`OpenApiFilter.java:99-126`（`finally` 块无条件写日志）。
  - 方法依据：`01-modeling-decisions.md` D-16。
- **若假设不成立的影响**：若逐步骤建行为，M2 中会出现约 9 个"行为"，但它们之间是**同一请求内的顺序校验**，`M2-spec.md` 没有"事务/失败传播"字段可以表达它们的耦合，模型会误导实现者把它们做成可独立调用的服务方法。
- **需谁确认**：架构师
- **风险**：中
- **标记**：`[待确认]`

### A-M2-06　`OPEN_RESPONSE_CODE` 恒为 200 → 日志 `resp_code` 语义受限

- **假设内容**：`open_call_log.resp_code` **无法**还原下游真实 HTTP 状态码（网关统一写 200），因此 M1 中该属性的语义应描述为"网关返回给调用方的 HTTP 码"而非"下游 HTTP 码"。
- **依据**：
  - 事实：`flow-index.md#FLOW-OPEN-GATEWAY` 的"成功分支"一节："**注意：`resp_code` 记录的是 `OPEN_RESPONSE_CODE` 请求属性，`OpenGatewayController` 一律写 200，因此无法从该列还原下游真实 HTTP 状态码**（证据等级：推断，依据 `OpenGatewayController.java:68/83/94` 与 `OpenApiLogService.java:42`）"。
  - 事实：`OpenLogController.java:89`（CSV 表头含 `respCode`）。
  - 事实：`open/log/index.html:49`（表格列标题为"HTTP码"）。
- **若假设不成立的影响**：若 M1 把它描述为"下游响应码"，则 M7 的使用者会基于错误语义做失败分析（例如"下游 5xx 占比"实际恒为 0）。
- **需谁确认**：业务方（日志报表口径）+ 架构师
- **风险**：中
- **标记**：`[待确认]`

### A-M2-07　自检 httpbin 端点的行为归属

- **假设内容**：`/selftest/httpbin/**` 的 9 个端点属于"自检桩"，**不建为业务 M2 行为**（或仅建成 1 个 SYSTEM 行为用于自检闭环），且**不建 MU 屏幕**。
- **依据**：
  - 事实：`interface-index.md` 中 9 个 `API-OpenSelftestHttpbinController-*` 端点的消费者功能为 `FUNC-open-selftest`。
  - 事实：`FUNC-open-selftest` 的功能边界为"开始=已执行 `open_api_selftest_seed.sql` 与 `open_api_httpbin_min_seed.sql` / 结束=自检结果与调用日志"（`functional-inventory.md`）。
  - 事实：`business-architecture.md` 为非菜单入口建了 `ENTRY-open-selftest`。
- **若假设不成立的影响**：若把 9 个桩端点各建一个行为，M2 会多出 9 个"无业务语义"的行为，且它们全部属 79 个无权限端点之一，会显著干扰权限缺口的可读性。
- **需谁确认**：架构师
- **风险**：低
- **标记**：`[待确认]`

### A-M2-08　行为 ID 命名与上游 `FUNC-*` 的溯源关系

- **假设内容**：M2 行为 ID 用 `{EntityAlias}_{ActionName}`（如 `OpenApp_ResetSecret`），并在行为描述或 `tags` 中保留来源 `FUNC-*` / `API-*` 的溯源引用。
- **依据**：
  - 规范依据：`_spec/M2-spec.md#3.2.1`（"id 建议格式：{EntityAlias}_{ActionName}"）。
  - 事实：`M2-spec.md#3.3` 模板用 `Receipt_Record`、`Contract_SaveAsDraft`。
  - 取舍依据：`01-modeling-decisions.md` D-32。
- **若假设不成立的影响**：若不保留溯源，M2 → 上游 `FUNC-*` 的追溯链断裂，无法回答"某行为来自哪个逆向功能"；若直接复用 `FUNC-*` 作为行为 ID，则会因 1 FUNC 拆多行为而出现 ID 冲突。
- **需谁确认**：架构师
- **风险**：低
- **标记**：`[待确认]`

---

## 3. M3 规则模型假设

### A-M3-01　上游 `RULE-*` 实际为零，规则须从业务规则句 + 代码行为合成

- **假设内容**：`docs/meta-model/domain-model.md` 虽被 `meta-index.md` 声明为 `RULE-*` 的主定义文件，但实际**没有任何 `RULE-*` 主定义**；M3 的规则全部由两条来源合成：(a) 各 `FUNC-*` 需求面板的"业务规则"自然语言句；(b) 从源码分支反推的隐含规则。
- **依据**：
  - 事实：`meta-index.md#2` 声明 `domain-model.md` 的 ID 前缀为 `OBJ-*` / `RULE-*`。
  - 事实：全文检索 `RULE-` 在 `domain-model.md` 中零命中（由并行提取确认）。
  - 事实：`business-function-requirements.md` 的每个功能面板含 `- 业务规则（Business Rules）:` 字段（例：`FUNC-sys-login` 的"验证码由 `shiro.user.captchaEnabled/captchaType` 控制；密码连续错误次数受 `user.password.maxRetryCount=5` 限制；status=2 视为停用"）。
- **若假设不成立的影响**：若上游后续补出 `RULE-*` 主定义，M3 的规则 ID 需要重新对齐，且 `reusedBy` 关系可能变化。当前按本文口径建模是**唯一可行**路径。
- **需谁确认**：上游逆向任务负责人
- **风险**：中
- **标记**：`[待确认]`

### A-M3-02　哪些隐含规则上升为 M3

- **假设内容**：按 `01-modeling-decisions.md` D-17 的双条件（被代码强制 + 跨对象/跨请求/被复用）筛选后上升为 M3 的规则集合，主要是：时间戳容差 5 分钟、nonce 一次性、应用有效性与有效期、应用对接口的授权、密码重试锁定、部门删除前置校验、角色删除前置校验、接口/应用的路径与 Key 唯一性冲突提示。
- **依据**：
  - 事实：`flow-index.md#FLOW-OPEN-GATEWAY` 步骤 4（`ALLOW_TIME_DRIFT_MS`、`NONCE_EXPIRE_MS`、`loadAppInfo` 的 `expire_time` 条件、`hasPermission` 的 `count(1)`）。
  - 事实：`OpenManageService.java:82`（`status=1 and (expire_time is null or expire_time > now())`）、`:327`（`select count(1) from open_app_api`）。
  - 事实：`technical-architecture.md#Shiro 安全链路`（`user.password.maxRetryCount=5` + `loginRecordCache` `timeToIdleSeconds=600`）。
  - 事实：`SysDeptMapper.xml:59`（`select count(1) from sys_user where dept_id=...`）、`:86`（`count(*) ... status='0' and del_flag='0' and position(...)`）。
  - 推断：`SysRoleMapper.xml:97` 附近（角色删除前的已分配用户校验）。
- **若假设不成立的影响**：筛选过宽 → M3 出现"某字段非空"这类本属 M1 的规则，破坏规则模型的边界；筛选过窄 → 关键跨对象判断（如"应用对接口的授权"）被降为 M2 的 `preconditions`，导致同一判断在多处重复。
- **需谁确认**：架构师
- **风险**：中
- **标记**：`[待确认]`

### A-M3-03　`need_sign=0` 绕过全部校验是**有意的设计**

- **假设内容**：`open_api.need_sign=0` 时跳过签名与身份校验、以 `appName="anonymous"` 放行，是**刻意提供的"免签接口"能力**，M3 中应把它表达为规则的分支条件，而非登记为漏洞。
- **依据**：
  - 事实：`flow-index.md#FLOW-OPEN-GATEWAY` 步骤 4："若 `need_sign = 0`，**跳过全部签名与身份校验**，构造 `appName = "anonymous"` 的上下文直接放行（证据等级：事实，`OpenApiSecurityService.java:61-72`）"。
  - 事实：`open-api/sql/open_api.sql:35`（`need_sign TINYINT DEFAULT 1 COMMENT '1=sign required'`）→ 默认强制签名，说明 `0` 是显式选择。
  - 事实：`OpenApiMgrController` 的接口新增/编辑表单可设置该字段（`interface-index.md` 的 `API-OpenApiMgrController-addSave`）。
- **若假设不成立的影响**：若业务方认为"免签接口不应存在"，则 M1 的 `need_sign` 语义、M3 的分支条件、M5 的权限模型都要改；且这是一个**需要在阶段三之前完成的安全决策**（现状下 `need_sign=0` 的接口对任何知道 URL 的人开放，且仍会写调用日志）。
- **需谁确认**：安全负责人 + 业务方
- **风险**：高
- **标记**：`[待确认]`

### A-M3-04　nonce 缓存在 JVM 内存 → 多实例部署下规则失效

- **假设内容**：`checkNonce` 依赖进程内 `ConcurrentHashMap`，单实例部署下规则成立；多实例部署下"nonce 一次性"规则**不再成立**。M3 规则应附该前提条件。
- **依据**：
  - 事实：`flow-index.md#FLOW-OPEN-GATEWAY` 的"幂等与事务边界"一节："**幂等**：网关层无幂等键。唯一性约束来自 `checkNonce` 的 `appKey:nonce` 一次性校验，其状态存于 JVM 堆内 `ConcurrentHashMap`，**多实例部署或重启后不共享，会退化为非幂等**（证据等级：事实，`OpenApiSecurityService.java:39,210-225`）"。
  - 事实：`business-architecture.md#7.3`（`NONCE_CACHE.size() > 100000` 时的容量清理）。
- **若假设不成立的影响**：若计划多实例部署（如 Docker 扩容），M3 的 nonce 规则必须改为共享存储（Redis/DB）才能保持重放防护；否则签名体系出现重放窗口。
- **需谁确认**：架构师 + 安全负责人
- **风险**：高
- **标记**：`[待确认]`

### A-M3-05　未生效的安全防护（CSRF / XSS）不作为规则

- **假设内容**：`csrf.enabled=false` 与 `XssFilter` 只覆盖 `/system/*,/tool/*`，属**现状缺陷**，M3 **不建**相应规则；在 YAML 中不出现。
- **依据**：
  - 事实：`config-index.md` 的 `csrf.enabled` 行（"**CSRF 校验开关，默认关闭**；`CsrfValidateFilter` 仍挂在 `/**` 链第 5 位但不校验"，证据 `application.yml:144`、`ShiroConfig.java:139,285`）。
  - 事实：`change-hotspots.md#HOT-SHIRO-CHAIN` 第 3 条（`XssFilter` 的 `urlPatterns=/system/*,/tool/*`，**不覆盖** `/open/**`、`/admin/open/**`、`/selftest/**`、`/common/**`，证据 `application.yml:139`）。
  - 事实：`flow-index.md#未覆盖与待确认项`（"`CsrfValidateFilter` 挂在 `/**` 段，但 `csrf.enabled=false` 使其实际禁用"；"`XssFilter` … `/open/**`、`/admin/open/**`、`/selftest/**`、`/common/**` 均不过滤"）。
- **若假设不成立的影响**：若把未生效的防护建成 M3 规则，阶段三实现时会**真的启用**它们，可能（a）破坏网关签名校验（`change-hotspots.md` 已推断"若请求体被转义会直接破坏签名校验"）、（b）拦住现有客户端的 POST。**因此"不建模"比"按规范补建"更安全。**
- **需谁确认**：安全负责人（确认这是"精简版有意裁剪"还是"待补缺陷"）
- **风险**：高
- **标记**：`[待确认]`

### A-M3-06　唯一性校验的宽严不一致

- **假设内容**：`check*Unique` 端点给出"宽"的唯一性口径（不查已删除行、可能只查同层级），而 DDL 约束给出"严"的口径（`app_key`/`api_path` 的 `UNIQUE` 不看任何条件）。M3 中应把两者分开建模，不合并为一条"唯一性规则"。
- **依据**：
  - 事实（宽）：`SysUserMapper.xml:142,146,150`（`select user_id, login_name from sys_user where login_name=#{loginName} and del_flag='0' limit 1`）；`SysDeptMapper.xml:71`（`where dept_name=#{deptName} and parent_id=#{parentId} and del_flag='0' limit 1`）。
  - 事实（严）：`open-api/sql/open_api.sql:13`（`app_key VARCHAR(64) NOT NULL UNIQUE`）、`:30`（`api_path VARCHAR(200) NOT NULL UNIQUE`）；且 `OpenManageService.insertApp`/`insertApi` **不做**应用层唯一性预校验（`:102-112`、`:200-216`），冲突将抛数据库异常。
- **若假设不成立的影响**：若合成一条统一规则，会在"平台域可复用被删数据的名称/编码"（真实行为）与"开放域不可复用"（真实行为）之间产生错误抽象，M3 规则无法同时满足两域。
- **需谁确认**：业务方（复用已删除数据的名称是否允许）
- **风险**：中
- **标记**：`[待确认]`

### A-M3-07　字段长度制约实际由数据库承担，且中英文口径不同

- **假设内容**：字符串长度限制由 DDL 承担（如 `app_name VARCHAR(100)`），M1 的 `refRules` 只对**有业务含义**的长度限制作显式声明，其余不逐一建模。
- **依据**：
  - 事实：`open-api/sql/open_api.sql:12`（`app_name VARCHAR(100) NOT NULL`）、`:13`（`app_key VARCHAR(64)`）、`:14`（`app_secret VARCHAR(128)`）、`:30`（`api_path VARCHAR(200)`）、`:32`（`target_url VARCHAR(500)`）、`:74`（`error_msg VARCHAR(500)`）、`:93`（`api_ids VARCHAR(500)`）；PostgreSQL 版同值（`deploy/local-docker/postgres/init/30-open-api.sql:10-22`）。
  - 规范依据：`_spec/M1-spec.md#2.5.1`（`refRules` 用于"只依赖当前属性值"的扩展规则，如"名称长度不超过 100"）；`#2.5.2` 属性规则分层原则第 1 条（"可以用内置字段表达的约束，优先使用内置字段"）。
- **若假设不成立的影响**：若把所有 `VARCHAR(n)` 都建成 `refRules`，M1 会产生数十条无业务价值的规则（且与 DDL 重复），并给阶段三制造双份校验；若一条都不建，则前端的长度提示语义缺失。
- **需谁确认**：架构师
- **风险**：低
- **标记**：`[待确认]`

### A-M3-08　**P0 新发现**：`find_in_set` 与 PostgreSQL 不兼容，`data_scope='4'` 必然报错

- **假设内容**：数据范围"本部门及以下"（`data_scope='4'`）在当前主库（PostgreSQL 11）上**必然运行期报错**；因此 M5 中任何 `dataScope: DEPT` 的权限、以及 M7 中依赖该数据范围过滤的查询，都建立在**不可用**的前提上。
- **依据**：
  - 事实：`open-api/qvsu-openapi/src/main/java/com/qvsu/framework/aspectj/DataScopeAspect.java:46`（`DATA_SCOPE_DEPT_AND_CHILD = "4"`）、`:134-136`（该分支拼接 `find_in_set( {} , ancestors )`）；全文检索 `find_in_set` 在该文件仅此 1 处（`:136`）。
  - 事实：`DataScopeAspect.java:31-51` 定义 5 档数据范围：`1`=全部、`2`=自定义、`3`=本部门、`4`=本部门及以下、`5`=仅本人。
  - 事实：`DataScopeAspect` 的切点为 `@annotation(controllerDataScope)`，全仓 `@DataScope` 使用点共 **7 处**：`SysDeptServiceImpl.java:40,53,68`、`SysRoleServiceImpl.java:55`、`SysUserServiceImpl.java:81,94,107`。
  - 事实：`PROGRESS.md#Q-datascope-find-in-set`（状态 `open（P0）`）："**必然运行期报错**（不是'方言风险'而是确定性失败）：任何数据范围为「本部门及以下」的角色执行带 `@DataScope` 的查询都会抛 SQL 异常。"
  - 事实：`change-hotspots.md#HOT-DIALECT` 运行时方言依赖行："`DataScopeAspect` 的 `find_in_set` 仅 MySQL 可用；`queryLogStatsToday` 的 `::date`/`::numeric` 仅 PostgreSQL 可用。**两处不可能同时正确**"。
  - 事实：主库为 PostgreSQL（`_CONTEXT-FOR-AGENTS.md#2`；`config-index.md` 的 `pagehelper.helperDialect=postgresql`）。
- **若假设不成立的影响**：若该分支从未被触发（即**没有任何角色**使用 `data_scope='4'`），则影响仅限"潜在缺陷"；若确有角色使用，则"用户管理""角色管理""部门管理"的列表页对**那些角色**完全不可用。M5 的 `dataScope` 取值必须据此收敛——**不能**为凑规范而给角色分配 `DEPT_AND_CHILD`。
- **需谁确认**：架构师 + DBA（查运行库 `sys_role.data_scope` 实际分布）
- **风险**：高
- **标记**：`[待确认]`

### A-M3-09　平台域 Mapper 的 MySQL 方言写法在 PostgreSQL 上是否可行

- **假设内容**：`mapper/**/*.xml` 中的 `concat('%', #{x}, '%')` 与 `limit 1` 在 PostgreSQL 上**可以执行**（因此这些查询不需修改）；真正不可用的只有 `find_in_set`。
- **依据**：
  - 事实：`concat(` 在 Mapper XML 中共 **18 处**（`SysDeptMapper.xml:31,48`；`SysConfigMapper.xml:45,51`；`SysDictTypeMapper.xml:27,33`；`SysDictDataMapper.xml:35`；`SysMenuMapper.xml:81,92,109`；`SysLogininforMapper.xml:28,34`；`SysPostMapper.xml:29,35`；`SysNoticeMapper.xml:34,40`；`SysOperLogMapper.xml:41,44,59`；`SysRoleMapper.xml:43,49`；`SysUserMapper.xml:70,76,99,102,117,120`；`SysUserOnlineMapper.xml:55,58`）。
  - 事实：`limit 1` 在 Mapper XML 中共 8 处（`SysDeptMapper.xml:71`；`SysConfigMapper.xml:69`；`SysDictTypeMapper.xml:60`；`SysMenuMapper.xml:134`；`SysPostMapper.xml:59,64`；`SysRoleMapper.xml:76,81`；`SysUserMapper.xml:142,146,150`）。
  - 推断：PostgreSQL 提供 `concat()` 与 `limit`，故这些写法可行；而 `open_*` 表在 MySQL 版 DDL 中使用 `AUTO_INCREMENT`/`ON UPDATE CURRENT_TIMESTAMP`/`UNIQUE KEY`/`INDEX`（`open_api.sql:11,20,25,57,83`），PostgreSQL 版改用 `GENERATED BY DEFAULT AS IDENTITY`/无 `ON UPDATE`（`30-open-api.sql:9,18`）→ 说明两套 DDL 是**人工分叉维护**的，而非同一份。
  - 值得注意（事实）：`open_*` 的**运行期 SQL 是 PostgreSQL 专有**（`now()`、`||` 拼接、`|| '%' ||`、`on conflict ... do update`、`call_time::date`、`::numeric`）：`OpenManageService.java:49,161,276,345`；而平台域 Mapper 是 **MySQL 风格**。**同一应用内两条方言路线并存。**
- **若假设不成立的影响**：若 `concat`/`limit` 在目标 PG 版本下不可用，则"系统管理域全部列表查询"都不可用；M7 中平台域的所有查询对象需重写条件表达式。当前判断为"可用"，但这是**未经运行验证的推断**。
- **需谁确认**：DBA（在 PostgreSQL 11 上实测 `concat` 与 `limit`）+ 架构师
- **风险**：中
- **标记**：`[待确认]`

### A-M3-10　`sys_user.status=2` 的语义

- **假设内容**：`sys_user.status` 的取值语义需确认为 {`0`=正常, `1`=停用, `2`=删除}；其中 `2` 与 `del_flag='2'` 的关系（是否等价）需澄清。
- **依据**：
  - 事实：`business-function-requirements.md` 的 `FUNC-sys-login` 面板："业务规则：…`status=2` 视为停用"；"前置条件：用户已存在于 `sys_user` 且 `status=0`，账号未被锁定"。
  - 事实：`SysUserMapper.xml:159,163`（删除是 `update sys_user set del_flag = '2'`）。
  - 事实：`open-api/sql/open_api.sql` 的开放域字段注释明确（`status`：`1=enabled 0=disabled`、`open_call_log.status`：`0=ok 1=auth-fail 2=proxy-fail`），说明**同一项目内 `2` 在不同表含义完全不同**。
  - 推断：平台域 `status` 与 `del_flag` 是两个独立维度，`2` 在这两处是**巧合的同值不同义**。
- **若假设不成立的影响**：若误把 `status=2` 当作"已删除"，M1 的枚举与 M7 的条件 (`status != '2'`) 会与 `del_flag='0'` 条件重复或冲突，可能漏查或多查数据。
- **需谁确认**：业务方
- **风险**：中
- **标记**：`[待确认]`

---

## 4. M5 主体模型假设

### A-M5-01　184 端点中 79 个无权限码：保持现状 or 补齐

- **假设内容**：M5 中的权限集合**只反映现状**（105 个端点有权限码，79 个无）；不为 79 个端点补造权限。
- **依据**：
  - 事实：`PROGRESS.md#4`（"带权限码端点 105 / 无权限码端点（风险项）79"）。
  - 事实：`change-hotspots.md#HOT-PERM-GAP`（"79 个端点无权限码"；影响面："`open` 包全部管理端点、`/selftest/**`、`/common/**`"）。
  - 事实：`interface-index.md#3` 给出 79 个端点的逐个清单与高/低危判断。
- **若假设不成立的影响**：若决定"补齐权限码"，则需先定义每个端点应归属哪个权限码（**新增业务决策**），M5 的权限数量会从 71（当前上游口径）增加到 130+，且所有相关 M2 行为的 `requiredPermissions` 与 MU 功能点的 `permissionRef` 都要重算。
- **需谁确认**：安全负责人 + 业务方
- **风险**：高
- **标记**：`[待确认]`

### A-M5-02　`com.qvsu.open` 包 36 个管理端点全部无权限码

- **假设内容**：开放平台域（应用/接口/授权/日志/文档）的管理端点在**后端无任何权限码校验**，只要持有有效 Shiro 会话（`/**` 兜底过滤器链 `user,kickout,onlineSession,syncOnlineSession,csrfValidateFilter`）即可访问与写入。
- **依据**：
  - 事实：对 `open-api/qvsu-openapi/src/main/java/com/qvsu/open` 检索 `@RequiresPermissions` → **零命中**；同目录检索 `@DataScope`/`@RequiresRoles` → **零命中**。
  - 事实：对 `src/main/java` 检索 `@RequiresPermissions` 的有效注解分布：`SysUserController` 18、`SysRoleController` 17、`SysPostController` 8、`SysNoticeController` 8、`SysMenuController` 7、`SysDictTypeController` 10、`SysDictDataController` 8、`SysDeptController` 9、`SysConfigController` 9、`SysJobLogController` 6、`SysJobController` 11（合计 111 行命中，其中 2 行为 Javadoc/注解定义注释）→ **全部在系统域与调度域，open 域 0**。
  - 事实：`interface-index.md#3` 的 79 项清单中，`com.qvsu.open` 相关 36 项（`OpenApiMgrController` 7 + `OpenAppController` 7 + `OpenAuthController` 4 + `OpenDocController` 5 + `OpenLogController` 3 + `OpenSelftestHttpbinController` 9 + 网关 1）；其中标 **高危** 的 4 项为 `POST /admin/open/api/remove`、`POST /admin/open/app/remove`、`POST /admin/open/app/resetSecret`、`POST /admin/open/auth/save`、`POST /admin/open/doc/generate`。
  - 事实：`PROGRESS.md#Q-79-endpoints-without-permission`（"其中 `com.qvsu.open` 包 7 个 Controller 的 36 个管理端点全部无权限码"）。
  - 事实：`business-architecture.md#1.2` 第 80 行称"`/admin/open/**` 管理端受 `@RequiresPermissions` 约束" → **该表述与源码不符**（见 A-DATA-03）。
  - 事实：`ShiroConfig` 兜底段为 `filterChainDefinitionMap.put("/**", "user,kickout,onlineSession,syncOnlineSession,csrfValidateFilter")`（`technical-architecture.md#Shiro 安全链路`），其中 `user` 过滤器仅要求"已认证或 rememberMe"，**不含权限判定**。
- **若假设不成立的影响**：若存在**未检索到**的 URL 级权限配置（例如在 `ShiroConfig` 里用 `filterChainDefinitionMap` 为 `/admin/open/**` 指定了自定义权限过滤器），则开放域实际有保护，M5 的权限缺口结论不成立。**当前已在 `ShiroConfig` 的过滤器链文字记载中未发现该配置，但未逐行核对全部 20 条规则** → 这条不确定性本身即假设的一部分。
- **需谁确认**：安全负责人（逐行复核 `ShiroConfig.filterChainDefinitionMap` 并给出结论）
- **风险**：高
- **标记**：`[待确认]`

### A-M5-03　`open:*` 权限码只存在于菜单 SQL：应"仅表达菜单可见性"还是"应补后端校验"

- **假设内容**：`open:app:*`、`open:api:*`、`open:auth:*`、`open:log:*`、`open:doc:*` 共 15 个权限码仅由 `sys_menu` 定义、经 `sys_role_menu` 授予角色，**仅影响菜单与按钮的可见性**，不构成后端强制。M5 中应如实标注为"仅菜单声明"，`targetRef` 由端点语义推断。
- **依据**：
  - 事实：`open-api/sql/open_api_menu.sql:8-12`（5 个 C 类菜单的 `open:*:view`）、`:14-26`（10 个 F 类按钮权限：`open:app:list/add/edit/remove`、`open:api:list/add/edit/remove`、`open:auth:save`、`open:log:list`、`open:doc:generate`）。
  - 事实：同一批权限码在 `deploy/local-docker/mysql/init/40-open-api-menu.sql:8-26` 与 `deploy/local-docker/postgres/init/40-open-api-menu.sql:6-24` 重复出现（后者中文乱码）。
  - 事实：对 `*.java` 检索 `open:(app|api|auth|log|doc):` → **零命中**。
  - 事实：菜单 SQL 中**没有** `open:log:export`（而 `OpenLogController.exportCsv` 存在）、**没有** `open:doc:list`/`open:doc:download`/`open:doc:html`（而对应端点存在）→ 权限码集合与端点集合**不对齐**。
  - 事实：`flow-index.md#流程间的依赖关系` 明确："后台管理页面依赖菜单与权限（`open:*` 权限码未在代码侧校验，实际仅由菜单可见性约束）"（证据等级：事实）。
- **若假设不成立的影响**：若后端确实在某处以其他形式（如 `UserRealm` 的 `doGetAuthorizationInfo` 之外的自定义拦截）校验 `open:*`，则 M5 的权限语义需改为"有效"。若业务方要求补齐，则属**新增需求**，M5 的权限到行为映射需人工确定（15 个权限码 → 36 个端点）。
- **需谁确认**：安全负责人 + 业务方
- **风险**：高
- **标记**：`[待确认]`

### A-M5-04　角色清单与 `dataScope` 取值须从运行库或种子数据确认

- **假设内容**：M5 的 `roles[]` 与每个角色的 `permissions[]`/`dataScope` 必须从 `sys_role` + `sys_role_menu` + `sys_role_dept` 的**种子数据或运行库**读取；本体无法仅从源码确定（源码只有权限码常量与注解，没有"哪个角色拥有哪个权限"）。
- **依据**：
  - 事实：`domain-model.md#OBJ-SysRole`（"角色实体（10 字段），含数据范围 dataScope 与菜单勾选集合"）、`#OBJ-SysRoleMenu`（角色-菜单关联，2 字段）、`#OBJ-SysRoleDept`（角色-部门数据范围关联，2 字段）。
  - 事实：`SysRoleMapper.xml:32`（角色列表 select 含 `data_scope`、`del_flag`）、`:38`（`where r.del_flag = '0'`）。
  - 事实：`DataScopeAspect.java:31-51`（5 档数据范围常量 `1`..`5`）。
  - 事实：`technical-architecture.md#Shiro 安全链路` 第 5 条（`SysLoginService`/`SysPasswordService`/`SysRegisterService`/`SysShiroService` 构成登录链路）→ 角色数据来自数据库而非配置。
  - 事实：`data-ownership.md` 未把 `sys_role` 标记为"仅由初始化 SQL 写入" → 属运行期可变数据。
- **若假设不成立的影响**：若凭源码猜测角色清单，会造出**不存在的角色**（并触发门禁 G3a"引用必须存在"），或漏掉真实角色（导致 M6 的 `roleRefs` 缺失）。
- **需谁确认**：业务方 + DBA（提供 `sys_role` 与 `sys_role_menu` 的实际数据）
- **风险**：高
- **标记**：`[待确认]`

### A-M5-05　不虚构角色继承，`dataScope` 到 M5 的映射按 RuoYi 语义

- **假设内容**：M5 的 `roles[].inheritsFrom` 全部**为空**（系统不支持角色继承）；`sys_role.data_scope` 的 `1..5` 映射为 M5 `permission.dataScope` 的 `ALL` / `CUSTOM` / `DEPT` / `DEPT`(及以下) / `OWN`。
- **依据**：
  - 事实：`SysRoleMapper.xml:24,32`（角色 select 列含 `role_key`、`role_sort`、`data_scope`、`status`、`del_flag`，**无父角色字段**）；`SysRoleMapper.xml:95-108`（`updateRole` 的 `<set>` 块字段：`role_name`/`role_key`/`role_sort`/`data_scope`/`status`/`remark`/`update_by`/`update_time`，**无父角色**）。
  - 事实：`DataScopeAspect.java:31-51`（5 档常量）。
  - 规范依据：`_spec/M5-spec.md#5.3.3`（`dataScope` 枚举仅 `ALL` / `OWN` / `DEPT` / `CUSTOM`，**没有**"本部门及以下"这一档）→ 本体规范与现状**不完全对齐**，需在 YAML 中用 `CUSTOM` + `abacCondition` 表达或在描述中注明。
- **若假设不成立的影响**：若把 `data_scope='4'` 生硬映射为 `DEPT`，会丢失"及以下"语义；M7 的数据可见范围描述会偏窄。
- **需谁确认**：架构师（裁定 `data_scope='4'` 在本体中的表达方式）
- **风险**：中
- **标记**：`[待确认]`

### A-M5-06　超级管理员绕过权限校验（`admin` / `role_key='admin'`）

- **假设内容**：存在"超级管理员"语义——`admin` 用户或 `role_key='admin'` 的角色**绕过** `@RequiresPermissions` 校验，因此"某端点有权限码"不等于"所有非 admin 用户都需要该权限"。
- **依据**：
  - 事实：`_CONTEXT-FOR-AGENTS.md#2`（默认账号 `admin/admin123`）。
  - 事实：`DataScopeAspect.java:95`（`DATA_SCOPE_CUSTOM` 分支同时校验 `role.getStatus()` 与 `role.getPermissions()` 是否命中 `@RequiresPermissions` 声明的权限串）。
  - 推断：RuoYi 系 `UserRealm` 在 `doGetAuthorizationInfo` 中为 `admin`（userId=1）授予 `*:*:*` 全权限（需在 `UserRealm.java` 中逐行确认）。
- **若假设不成立的影响**：M5 中"角色-权限"的授予矩阵会错；若实际无 admin 绕过，则需为 admin 角色显式列出全部 71 个权限码。
- **需谁确认**：架构师（核对 `UserRealm.java`）+ 业务方（超管是否应保留）
- **风险**：中
- **标记**：`[待确认]`

### A-M5-07　文件上传/下载无权限码是否可接受

- **假设内容**：`/common/upload`、`/common/uploads`、`/common/download`、`/common/download/resource` 四个端点无权限码（仅需会话），M5 中不为其建权限。
- **依据**：
  - 事实：`interface-index.md#3` 列出 `API-CommonController-fileDownload`、`-uploadFile`、`-uploadFiles`、`-resourceDownload` 四项，风险判断均为"低危"。
  - 事实：`CommonController.java:46-140`（4 个端点，无 `@RequiresPermissions`）。
  - 事实：`config-index.md` 的 `qvsu.profile` 行（`D:/qvsu/uploadPath`，由 `ResourcesConfig` 第 55 行以 `file:` 暴露为静态资源目录）；同一文件第 327 行标注"**未覆盖项（重要缺口）**: `qvsu.profile` 未被 Docker 覆盖，容器内仍使用 `D:/qvsu/uploadPath`（Windows 路径），导致容器内文件上传/头像/下载路径不可用（事实）"。
- **若假设不成立的影响**：若业务要求"下载必须鉴权"，则需新增权限码与校验（**新增需求**）；同时容器内路径不可用这一缺陷会让所有上传/下载在 Docker 部署下失效，**M6 的 `FLOW-FILE-IO` 流程在当前 Docker 配置下不成立**。
- **需谁确认**：安全负责人 + 运维
- **风险**：中
- **标记**：`[待确认]`

### A-M5-08　端点权限统计口径差异：上游 105/79 与源码对账 101/83

- **假设内容**：上游文档的"184 端点中 105 个带 `@RequiresPermissions`、**79 个无权限码**"与本次源码逐行对账结果"**112** 个有效 `@RequiresPermissions` 注解、其中 **11** 个落在仅渲染页面的根路径 `@GetMapping()` 上、故 **101** 个端点受保护 / **83** 个端点无权限"存在 **4 个端点的差异**。本体采用**源码对账口径（101 / 83）**，并假定该 4 个差异属上游提取脚本的口径问题，**不改变任何定性结论**（尤其是 `com.qvsu.open` 域零校验这一事实）。
- **依据**：
  - 事实（端点总数**三方一致**）：24 个 Controller 的方法级 `@(Get|Post|Put|Delete|Patch)Mapping` 注解共 **200** 个；其中根路径 `@GetMapping()`（返回视图名）**17** 个、其中带 `@RequiresPermissions` 的 **11** 个；双路径注解 `SysDeptController.java:168`（`@GetMapping(value = { "/selectDeptTree/{deptId}", "/selectDeptTree/{deptId}/{excludeId}" })`）展开为 2 个节点 → `200 − 17 + 1 = 184`，与 `PROGRESS.md#4`「HTTP 端点 184」、`interface-index.md`「184 个 HTTP 端点」、`assets.json`「184 条路由 token」**三方一致**。
  - 事实（权限注解分布）：`^\s*@RequiresPermissions\("` 在 `src/main/java` 下命中 **112** 行，全部位于 `SysUserController`(18)、`SysRoleController`(18)、`SysJobController`(11)、`SysDictTypeController`(10)、`SysConfigController`(9)、`SysDeptController`(9)、`SysDictDataController`(8)、`SysNoticeController`(8)、`SysPostController`(8)、`SysMenuController`(7)、`SysJobLogController`(6)；`com.qvsu.open` 域 **0**。
  - 事实（根路径注解）：11 个根路径渲染方法带权限码，行号分别为 `SysUserController.java:64`、`SysRoleController.java:49`、`SysMenuController.java:40`、`SysDeptController.java:38`、`SysPostController.java:37`、`SysDictTypeController.java:38`、`SysDictDataController.java:37`、`SysConfigController.java:37`、`SysNoticeController.java:36`、`SysJobController.java:44`、`SysJobLogController.java:43`。这些根路径节点在上游文档 §0 总览表中**未建节点**，故不应计入端点保护数。
  - 事实（上游口径）：`PROGRESS.md#4`「带权限码端点 105 / 无权限码端点（风险项）79」；`interface-index.md#3`「在 184 个 HTTP 端点中，有 79 个未标注 `@RequiresPermissions`」并逐个列出 79 项。
  - **推断**：差异来源可能是（a）上游把部分根路径渲染注解计入了受保护端点，或（b）上游对"端点"与"注解"的配对口径不同。**未定位到具体的 4 个端点。**
- **若假设不成立的影响**：
  - 若上游口径正确（105 / 79），则本次对账多算了 4 个"无权限"端点 → M5 中会有 4 条**多报**的缺口条目（不会漏报）。
  - 若本次口径正确（101 / 83）而本体沿用上游的 79，则会有 4 个**真实无鉴权**的端点被误标为"受保护" → **属漏报，安全影响更高**。
  - 因此本条按"宁可多报"的原则取 **83**，并把差集交给人工核对。
- **需谁确认**：安全负责人（在 `interface-index.md#3` 的 79 项清单与本次 83 项的**差集**上逐条核对）+ 上游逆向任务负责人（确认提取脚本口径）
- **风险**：中
- **标记**：`[待确认]`

---

## 5. M6 流程模型假设

### A-M6-01　**不存在审批流**（结论 + 证据）

- **假设内容**：本系统**不存在任何审批流引擎或审批实现**；M6 中 `flowType: APPROVAL` 的流程数为 **0**，`APPROVAL_TASK` 活动数为 **0**，`approvalOutcomes` 不出现；MU 中 `actionType: DRAFT/SUBMIT/APPROVE/REJECT/RETURN` 的功能点数为 **0**。
- **依据（四类独立证据，全为事实）**：
  1. **源码零命中**：对 `open-api/` 全目录检索 `approval|Approval|activiti|flowable|camunda|workflow|Workflow|processInstance|会签|驳回|退回|审批` → **No matches found**；对 `src/main` 下的 `*.java` 检索 `审批|approval|Approval|workflow|Workflow` → **No matches found**。
  2. **依赖清单无流程引擎**：`open-api/qvsu-openapi/pom.xml` 的全部 `artifactId`（44 处命中）中无 Activiti / Flowable / Camunda / JBPM；与流程沾边的只有 `spring-boot-starter-quartz`（`:76`，定时调度，非流程）。
  3. **功能清单无审批类功能**：`functional-inventory.md#0` 的 29 个功能类型只有 `platform` / `operations` / `business` / `common-entry`，无审批类。
  4. **流程索引无审批结构**：`flow-index.md#流程总览` 的 10 条 FLOW 全为技术/协同流（网关、登录、RBAC 授权、应用接入、接口定义、日志查询、Quartz、自检、审计、文件 IO），**无一条**是"提交—审批—通过/驳回"。
  5. **对象清单无审批实体**：`domain-model.md#1` 的 33 个对象中无审批单/审批任务/审批记录。
- **若假设不成立的影响**：若业务方**要求**审批能力，那是**新增需求**，需回到阶段一（需求探索）补需求，而不是在本体里"补建"审批模型——否则本体描述的不是现状，阶段三会实现出一套无人确认的审批流。反之若假设成立而误建，则 `_spec/MU-spec.md#8.5` 的"保存草稿/提交双按钮"会被误当作强制项而虚构功能点。
- **需谁确认**：业务方（确认是否有审批需求，以及是否作为新增需求立项）
- **风险**：高
- **标记**：`[待确认]`

### A-M6-02　Quartz 为内存 JobStore → 调度状态不持久

- **假设内容**：调度器为 Spring Boot 自动配置的内存模式（RAMJobStore），11 张 `QRTZ_*` 表已建但**不被使用**；因此 M6 的 `FLOW-QUARTZ-JOB` 不得声明"调度状态持久化/集群调度"能力，`QRTZ_*` 不进 M1。
- **依据**：
  - 事实：`technical-architecture.md#Quartz 调度`："`ScheduleConfig` 是**空占位类**，类注释明确：『当前使用 Spring Boot 自动配置的 Scheduler（内存模式）。如需切换为 JDBC JobStore，可在此处补充 SchedulerFactoryBean 配置。』（`ScheduleConfig.java` 第 3-13 行）。因此：**调度器为 RAMJobStore 内存模式**，任务定义持久化在业务表 `sys_job`，而 11 张 `QRTZ_*` 表虽已随 DDL 建出但当前**不被 JDBC JobStore 使用**。"
  - 事实：同节："源码中未检索到 `spring.quartz.*` 配置项…故调度器全部采用 Spring Boot 默认值（`推断`：默认 RAMJobStore、线程池 10）。"
  - 事实：`domain-model.md#4`（11 张 `QRTZ_*` 无 Java 实体，属已知缺口）。
  - 事实：`interface-index.md#JOB-quartz-dispatch` 的"物理表操作"列为 `sys_job（R/U）、sys_job_log（C）、QRTZ_JOB_DETAILS（R）、QRTZ_TRIGGERS（R）、QRTZ_CRON_TRIGGERS（R）` → 记录了对 `QRTZ_*` 的**读**，与"内存模式"表述存在张力（见下）。
- **张力点（需一并确认）**：`interface-index.md` 声明调度入口会读 3 张 `QRTZ_*` 表，而 `technical-architecture.md` 称其未被使用。二者不能同时为真 → 必须核实究竟是"内存模式（`QRTZ_*` 不被用）"还是"JDBC JobStore（`QRTZ_*` 在用）"。
- **若假设不成立的影响**：若实际启用 JDBC JobStore，则 `QRTZ_*` 属**在用的技术表**，M6 需表达"调度状态持久化"，且 M1 需考虑是否为 `SysJob` 建"调度详情"关联（仍不建议把 `QRTZ_*` 建为业务聚合）。若为内存模式，则重启会丢失正在执行的调度状态，M6 流程需注明该限制。
- **需谁确认**：架构师（读 `ScheduleConfig.java` 与启动配置定论）
- **风险**：中
- **标记**：`[待确认]`

### A-M6-03　「限流」能力不存在

- **假设内容**：`SCN-open-gateway-call` 场景标题含"限流"，但限流**未实现**；M6 **不建**任何限流活动，M3 不建限流规则。
- **依据**：
  - 事实：`business-architecture.md#7.3`：「**现象（事实）**：任务书要求场景『开放接口调用鉴权与限流』。但全仓在 `com.qvsu.open` 内检索 `rateLimit`、`RateLimit`、`限流`、`qps`、`QPS`、`Semaphore`、`Bucket`、`token` **零命中**。」
  - 事实：同节：「**现有近似实现（事实）**：`OpenApiSecurityService.checkNonce` 在 `NONCE_CACHE.size() > 100000` 时触发过期条目清理…这是缓存容量保护，**不构成对调用方的速率或配额约束**。」
  - 事实：同节处置：「`SCN-open-gateway-call` 保留任务书要求的场景标题，但在『限流说明』中明确标注为未实现，并把结论级别降为混合（鉴权与转发为事实，**限流为假设且不成立**）。」
- **若假设不成立的影响**：若业务确实需要限流，属**新增需求**；`change-hotspots.md#HOT-APP-YML` 的影响面里出现"限流"字样，可能让人误以为已有限流配置——需在 M6 中显式说明不存在。
- **需谁确认**：业务方 + 安全负责人
- **风险**：中
- **标记**：`[待确认]`

### A-M6-04　流程与角色的可对应性：M5 是否提供 `roleId`

- **假设内容**：M6 的 `USER_TASK`/`APPROVAL_TASK` 需要引用 M5 的 `roleId`；若 M5 中不存在与 `flow-index.md` 参与者（"管理员"、"第三方应用"、"网关"、"Quartz"）对应的角色，则相应活动一律降级为 `SYSTEM_TASK`，**不得填写自由文本参与人**。
- **依据**：
  - 规范依据：`_spec/M6-spec.md#6.1`（"所有 `USER_TASK` 和 `APPROVAL_TASK` 的参与人只能通过 `roleRef` 引用 M5 `roles.roleId`。不得引用 `actorId`，不得填写『财务经理』等自由文本，也不得直接绑定具体用户"）。
  - 事实：`flow-index.md` 各流程的"参与者/角色"节用的是自然语言描述（如 `FLOW-OPEN-GATEWAY` 的参与者为"第三方应用（调用方）/开放平台网关/被代理的真实业务系统/平台管理员"）。
  - 事实：`/open/**` 与 `/selftest/**` 在 Shiro 链上为 `anon`（`technical-architecture.md#Shiro 安全链路`）→ 第三方应用**不是** Shiro 会话主体，无法成为 M5 的人类角色。
- **若假设不成立的影响**：若强行把"管理员"写成 `roleRef: ROLE-ADMIN` 而 M5 中无该 ID，会触发门禁 G3a（"引用均须存在"）失败；若把第三方应用建成 M5 角色，则违反 v9.0 裁剪（`_spec/M5-spec.md#5.1`："移除外部实体（ExternalEntity）与外部接口契约，本系统不涉及外部系统交互"）。
- **需谁确认**：架构师 + 业务方（确认管理员角色的 `roleId`）
- **风险**：中
- **标记**：`[待确认]`

### A-M6-05　10 条 FLOW → 流程的合并/保留粒度

- **假设内容**：`flow-index.md` 的 10 条 FLOW 各自独立建为 M6 流程（不合并），其中平台横切的 `FLOW-OPER-AUDIT`、`FLOW-FILE-IO` 也保留为独立流程。
- **依据**：
  - 事实：`flow-index.md#流程总览` 给出 10 条流程（含触发方式/参与者/物理表/入口类）；`#流程间的依赖关系` 给出 8 条前置-后置依赖。
  - 规范依据：`_spec/M6-spec.md#6.3.1`（流程有 `startActivity` / `endActivities` / `activities` / `businessObjectRefs`）；`#6.5-2`（"除 `END` 外的可达活动必须存在合法后继路径"）。
  - 张力点：`FLOW-FILE-IO`（无数据库表，纯文件系统操作）与 `FLOW-OPER-AUDIT`（切面异步写日志）**没有业务对象**，其 `businessObjectRefs` 可能为空 → 需确认 M6 是否接受"无业务对象的流程"。
- **若假设不成立的影响**：若把 8 条依赖全部建成 `SUB_FLOW_CALL`，会造出事实上不存在的调用关系（依赖≠调用），并可能形成环（违反门禁 G3b）。
- **需谁确认**：架构师
- **风险**：中
- **标记**：`[待确认]`

### A-M6-06　`FUNC-job-scheduler` 的反射调用目标不在源码内

- **假设内容**：Quartz 任务的实际调用方法名存放于运行库 `sys_job.invoke_target`，**不在源码**；因此 M6 的 `FLOW-QUARTZ-JOB` 无法列出具体的 `BEHAVIOR_CALL` 目标。
- **依据**：
  - 事实：`PROGRESS.md#6`（断链与 partial 项）："`FUNC-job-scheduler` 主链内部调用层 | partial | Quartz 反射调用目标的实际方法名存放于 `sys_job.invoke_target` 数据中，不在源码内 | 查询运行库 `sys_job` 数据"。
  - 事实：`technical-architecture.md#Quartz 调度`（源码中未检索到 `spring.quartz.*` 配置项与注解式触发器，`assets.json` 的 `Jobs` 集合为空）。
  - 事实：`change-hotspots.md#HOT-QUARTZ-JOB`（"`sys_job` 定义 + `JobInvokeUtil` 反射 + `ScheduleUtils`；数据库驱动 + 反射调用，**无白名单**"，影响面"任意类加载与外部 HTTP 调用"）。
- **若假设不成立的影响**：若需在 M6 中精确列出调度触发的行为，必须先取得 `sys_job` 的运行数据；否则流程只能表达为"按 Cron 触发 → 反射调用 `invoke_target`"的抽象活动。
- **需谁确认**：DBA / 运维（提供 `sys_job` 数据）
- **风险**：低
- **标记**：`[待确认]`

---

## 6. M7 查询报表模型假设

### A-M7-01　查询对象全集：多数页面不建 M7

- **假设内容**：M7 只覆盖**跨对象**查询/统计/报表；单表列表（如调用日志、应用列表、接口列表、文档列表）**不建 M7 对象**，只建 M2 `QUERY` 行为。
- **依据**：
  - 规范依据：`_spec/M7-spec.md#7.2`（"单聚合简单查询 | 可独立定义，不要求 M7 | 通常不建立"）。
  - 事实：`OpenManageService.java:39-65`（`selectAppList` 单表 + 3 个可选条件）、`:151-177`（`selectApiList`）、`:283-328`（`selectLogList`，单表 + 5 个条件）、`:361-366`（`selectDocList` 单表无条件）。
  - 事实（反例，跨对象）：`SysUserMapper.xml:53-89`（用户列表 `left join sys_dept`，且含 `${params.dataScope}`）、`:91-106`（`selectAllocatedList` 三表 Join：`sys_user` + `sys_dept` + `sys_user_role` + `sys_role`）、`:108-`（`selectUnallocatedList` 含子查询）；`SysRoleMapper.xml:32`（角色列表）。
- **若假设不成立的影响**：若为每个列表页都建 M7，会产生约 15 个"单表 M7 对象"，稀释 M7 的语义并让门禁 G2（M7 ↔ M2 QUERY 一对一）需要为每个页面额外造一个 QUERY 行为——**模型规模翻倍而信息量不增**。
- **需谁确认**：架构师
- **风险**：中
- **标记**：`[待确认]`

### A-M7-02　`/admin/open/log/stats` 是 `STATISTICAL_QUERY`

- **假设内容**：`GET /admin/open/log/stats` 建为 M7 `objectType: STATISTICAL_QUERY`。
- **依据**：
  - 事实：`OpenManageService.java:342-345`（`select count(1) totalCalls, coalesce(sum(case when status=0 then 1 else 0 end),0) successCalls, coalesce(round(avg(cost_ms)::numeric,2),0) avgCost from open_call_log where call_time::date = current_date`）→ 含 `COUNT`/`SUM`/`AVG` 聚合。
  - 事实：`:348`（`successRate = totalCalls == 0 ? 0D : (successCalls * 100D / totalCalls)`）→ **成功率在 Java 层计算，不在 SQL 中**。
  - 事实：`:353-355`（`topApps` 子查询：`select app_name appName, count(1) callCount from open_call_log where call_time::date = current_date group by app_name order by callCount desc limit 5`）→ 含 `GROUP BY`。
  - 事实：`OpenLogController.java:51-56`（`stats()` 返回 `AjaxResult.success(...)`，与列表端点不同）。
- **不确定点（需确认）**：`successRate` 是**计算列**（Java 表达式）还是**派生结果列**；`topApps` 是**同一 M7 对象的第二个结果集**还是**独立的 M7 对象**（`M7-spec.md` 未定义"一个查询对象多个结果集"）。
- **若假设不成立的影响**：若把 `topApps` 建成独立 M7 对象，则需要**第二条 M2 QUERY 行为**与之配对（门禁 G2 一对一），而现状是一个端点返回两个数据集 → 需确认本体是否允许"一个行为绑定一个 M7、一个 M7 只有一个结果列集合"。
- **需谁确认**：架构师
- **风险**：中
- **标记**：`[待确认]`

### A-M7-03　调用日志 CSV 导出是 `REPORT`

- **假设内容**：`GET /admin/open/log/exportCsv` 建为 M7 `objectType: REPORT`，其 `reportOptions.exportFormats` 含 `CSV`，结果列取自硬编码表头。
- **依据**：
  - 事实：`OpenLogController.java:89`（硬编码表头 13 列：`traceId,appKey,appName,apiPath,method,respCode,costMs,status,errorMsg,clientIp,callTime,reqBody,respBody`）。
  - 事实：`OpenLogController.java:88`（写入 BOM `\uFEFF`）；`:83-85`（`text/csv;charset=UTF-8` + `Content-Disposition: attachment`）。
  - 事实：`:81`（导出前**未调用** `startPage()` → 导出全部匹配行，不受分页限制）；`:112-115`（异常被 `catch` 后仅记日志，**不返回错误**）。
  - 事实：`open/log/index.html:100-112`（前端"导出CSV"按钮组装与列表相同的查询参数）。
- **若假设不成立的影响**：若判为 `LIST_QUERY`（"导出即当前查询结果"），则 M7 中缺一个报表对象，报表语义（固定列、导出格式）无处表达。
- **需谁确认**：业务方（该 CSV 是否被下游系统按固定列消费）
- **风险**：低
- **标记**：`[待确认]`

### A-M7-04　平台域 8 个 `export` 端点的报表归属

- **假设内容**：`POST /system/{user,role,config,dict,dict/data,post}/export`、`POST /monitor/job/export`、`POST /monitor/jobLog/export` 默认为 `LIST_QUERY`（导出当前查询结果），**不**升为 `REPORT`，除非取证到固定的分组/小计/合计。
- **依据**：
  - 事实：`interface-index.md` 中这些端点的消费者功能为各自的 `FUNC-*`，且对应 Controller 使用 RuoYi 的 `ExcelUtil` 从同一 `list` 查询结果导出（例：`SysUserController.java:83`、`SysRoleController.java:68`、`SysConfigController.java:59`、`SysPostController.java:56`、`SysJobController.java:63`、`SysJobLogController.java:67`）。
  - 规范依据：`_spec/M7-spec.md#7.4.6`（`reportOptions` 才有 `title`/`groupFields`/`subtotalFields`/`totalFields`/`exportFormats`）；`#7.6-7`（"`objectType=REPORT` 必须填写 `reportOptions`"）。
  - 事实：这些端点均为 79 个无权限码端点之一（`interface-index.md#3` 未列出 `export` 端点 → 说明 `export` 端点**带**权限码，如 `system:user:export`、`system:role:export`）。
- **若假设不成立的影响**：若全部升为 `REPORT`，需为每个报表编造 `groupFields`/`subtotalFields`（造假），或留空导致门禁失败。
- **需谁确认**：业务方（这些导出是否被当作正式报表使用）
- **风险**：低
- **标记**：`[待确认]`

### A-M7-05　分页事实：以 `startPage()` 为唯一判据

- **假设内容**：判断某列表端点是否**服务端分页**的唯一充要证据是源码中是否调用 `startPage()`；**"存在 `.../list` 端点"不是分页的判据**。据此，开放域 5 个前端列表页中，`/admin/open/app/list`、`/admin/open/api/list`、`/admin/open/log/list` **有分页**，`/admin/open/doc/list` **无分页**（返回 `AjaxResult`、零参数、无 `startPage()`）；平台域 `POST /system/menu/list` 与 `POST /system/dept/list` 同样**无分页**。
- **依据**：
  - 事实（有分页）：`OpenAppController.java:44`（`startPage()`）、`OpenApiMgrController.java:51`、`OpenLogController.java:46`。
  - 事实（无分页）：`OpenDocController.java:61-66`（`@GetMapping("/list") @ResponseBody public AjaxResult list() { return AjaxResult.success(openManageService.selectDocList()); }` → GET、零参数、无 `startPage()`、返回 `AjaxResult` 而非 `TableDataInfo`）。
  - 事实（无分页，平台域）：`SysMenuController.java:48`（`POST /system/menu/list`）与 `SysDeptController.java:46`（`POST /system/dept/list`）中**均无** `startPage()` 调用。
  - 事实（全量调用点）：`startPage()` 在 `src/main/java` 中共 **17 处**调用（另含 1 处工具类定义 `PageUtils.java:18` 与 1 处基类定义 `BaseController.java:57`），分布在 14 个类：`OpenApiMgrController:51`、`OpenAppController:44`、`OpenLogController:46`、`SysDictTypeController:50`、`SysConfigController:52`、`SysDictDataController:49`、`SysNoticeController:51`、`SysPostController:49`、`SysRoleController:61,249,297`、`SysUserController:76`、`SysJobLogController:60`、`SysJobController:56`。
  - 事实：`config-index.md` 的 `pagehelper.helperDialect=postgresql`、`pagehelper.supportMethodsArguments=true`、`pagehelper.params=count=countSql`。
  - 事实：`domain-model.md#OBJ-TableDataInfo`（"分页响应结构（total/rows/code/msg），由 PageHelper 驱动"）。
- **不确定点**：默认页大小与最大页大小在源码中**未显式设置**（依赖 PageHelper 默认值与请求参数）→ M7 的 `pagination.defaultPageSize`/`maxPageSize` 无直接依据。
- **若假设不成立的影响**：若沿用"有 list 端点即有分页"的启发式，会为 `sys-menu`、`sys-dept`、`open-doc`、`sys-profile`、`open-auth` 五个页面错写 `pagination.enabled: true`，而实际它们会**一次返回全表**——阶段三若按模型加页大小限制，会改变现状行为（菜单树、部门树被截断）。**本条的教训已写入 `01-modeling-decisions.md` D-26 的判定树。**
- **需谁确认**：架构师 / 前端负责人（确认无分页页面是否应补分页——属新增改进而非现状）
- **风险**：低
- **标记**：`[待确认]`

### A-M7-06　`database-schema.md` 中 `unknown` 注释字段的语义推断

- **假设内容**：`database-schema.md` 中标注为 `unknown` 的字段，其**物理列名可信、业务语义不可信**；M1 中此类属性只保留列名派生的名称，业务 `label` 必须标为待确认，不得据列名"猜"中文标签。
- **依据**：
  - 事实：`consistency-report.md` 的 Pass J："34 张表 × 342 个字段全部有字段表，未知项标 `unknown` 而非省略" → `unknown` 是**上游有意使用的占位值**，表示"未能确定语义"。
  - 事实：`open-api/sql/open_api.sql` 的 MySQL DDL 带中文 `COMMENT`（`:11-100` 逐列），而 PostgreSQL 版**无 COMMENT**（`deploy/local-docker/postgres/init/30-open-api.sql:8-23`）→ 同一列的语义在一套脚本里有、另一套里没有。
  - 事实：`PROGRESS.md#6`（断链项）："`QRTZ_*` 11 张表字段语义 | partial | 由 Quartz 框架定义，**字段无业务注释**"。
- **若假设不成立的影响**：若把 `unknown` 当作"已知"并据列名直译中文（例如把 `s_is_del` 译为"是否删除"），会把 A-M1-02 的死列误当作有效业务字段，M1 会出现错误属性。
- **需谁确认**：业务方（逐字段确认语义）+ DBA
- **风险**：中
- **标记**：`[待确认]`

### A-M7-07　`open_call_log` 的 `req_headers` / `resp_headers` 是空置列

- **假设内容**：`open_call_log.req_headers`、`resp_headers` 两列当前**不被写入**（列存在但恒为空），M1 中可建属性但必须标注"当前无数据"，M7 中不作为结果列使用。
- **依据**：
  - 事实：`open-api/sql/open_api.sql:67`（`req_headers TEXT NULL`）、`:70`（`resp_headers TEXT NULL`）。
  - 事实：`OpenApiLogService.java:35` 与 `OpenManageService.java:333` 的 INSERT 语句**均不含** `req_headers`/`resp_headers`（列清单为 `trace_id, app_key, app_name, api_path, method, req_body, resp_code, resp_body, cost_ms, status, error_msg, client_ip, call_time`）。
  - 事实：`OpenManageService.java:286` 的日志查询 select **不含**这两列；`open/log/index.html:44-56` 的表格列也不含。
  - 事实：`change-hotspots.md#HOT-CALLLOG-COLS`（"`open_call_log` 字段 + `open_call_log_headers_upgrade.sql` | 结构已变更一次、兼容列并存、**headers 列空置**"）。
  - 事实：仓库存在升级脚本 `open-api/sql/open_call_log_headers_upgrade.sql` → 说明这两列是**为将来写入而预留**的。
- **若假设不成立的影响**：若某处（例如自检脚本或外部集成）确实写入了 headers，M7 的日志详情可以展示请求/响应头；否则展示为空。
- **需谁确认**：业务方 + 架构师
- **风险**：低
- **标记**：`[待确认]`

---

## 7. MU UI 模型假设

### A-MU-01　菜单真值与屏幕全集

- **假设内容**：MU 的一级菜单 = 2 个（系统管理、OpenAPI管理）；二级菜单 = 15 个 C 类页面 + 1 个外链；业务屏幕 = **15 个**（14 个系统/开放域页面 + `/monitor/job`），外链不建屏幕。
- **依据**：
  - 事实：`business-architecture.md#5.2`（菜单树总览：`MENU-sys-root` 下 9 个二级菜单、`MENU-open-root` 下 5 个二级菜单）+ `#5.1`（`menu_id=4` qvsu官网为外链，登记为 `ENTRY-external-homepage`）。
  - 事实：`business-architecture.md#7.2`（`sql/quartz.sql:191-208` 定义 `menu_id=110` `/monitor/job`，为"第 15 个 C 类菜单"）。
  - 事实（上游口径已变化）：`PROGRESS.md#Q-menu-extraction-scope`（"去重后 C 类页面由 14 更正为 **15**，F 类按钮由 50 更正为 **57**，权限码由 63 更正为 **71**"，状态 `resolved`，`extract-menus.js` 已修复）。
  - **注意（事实）**：`business-architecture.md#5.1/#5.2` 仍写 "C 14 + M 2 + F 50"（该文件最后修改时间早于 `PROGRESS.md`）→ **上游处于更新中，口径尚未完全同步**。
- **若假设不成立的影响**：屏幕全集的元素个数直接影响门禁 G1（`USER_ACTION` 行为必须被 MU 功能点引用）与 G6（屏幕须对应真实模板）。
- **需谁确认**：架构师（确认以"去重真值 15"为准，而非任务书中的"33 C"）
- **风险**：中
- **标记**：`[待确认]`

### A-MU-02　MU 只覆盖 71 个在范围模板

- **假设内容**：MU 的 `screenRef` 只能对应 71 个在范围模板；`templates/demo/**`（框架示例，占 144 个模板中的多数）与 `error/**` 等不建屏幕。
- **依据**：
  - 事实：`PROGRESS.md#1`（排除 `templates/demo/**`、`static/ajax/libs/**`、`src/test/**`、`deploy/dev-docker/**`）；`PROGRESS.md#2`（视图模板 144 → 已建模 71 / 已排除 73）。
  - 事实：模板目录实测：`templates/demo/**` 计 **73** 个 `.html`（`form` 21 + `icon` 2 + `modal` 10 + `modal/table` 7 + `operate` 5 + `report` 4 + `table` 25 = 74 项中含 `modal/table.html` 独立 1 项，去重后 73）；`templates/error/**` 4 个（`404/500/service/unauth`）。
  - 事实：`business-architecture.md#7.6` 表末行（"`templates/demo/**` 框架示例页占 144 个模板多数 | 属范围排除，本文件不为其建立任何菜单或入口节点"）。
  - 事实：71 = 14 个业务页面目录下的 56 个视图 + 系统/框架外壳页（`index.html`、`login.html`、`register.html`、`lock.html`、`main.html`、`main_v1.html`、`skin.html`、`index-topnav.html`、`include.html`）等。
- **若假设不成立的影响**：若把 demo 页建为屏幕，MU 的屏幕数会从 15 膨胀到近 90，追溯价值崩溃；若把 `error/**`、`include.html` 等框架页面误建为屏幕，会产生无业务意义的菜单项。
- **需谁确认**：前端负责人
- **风险**：低
- **标记**：`[待确认]`

### A-MU-03　"列表维护界面"按现状建模（独立新增/编辑页，非弹窗）

- **假设内容**：RuoYi 系页面为"列表页 + 独立的新增/编辑页面（独立 URL）+ AJAX 提交"，**不是** `MU-spec.md#8.4.4` 规定的"列表 + 弹窗（Modal）"结构；MU 按**现状**建为 `LIST_MAINTENANCE`，并在 ASCII 布局与说明中如实反映"独立新增页"。
- **依据**：
  - 事实：`OpenAppController.java:49-53`（`/add` 返回视图 `"open/app/add"`）、`:65-70`（`/edit/{id}` 返回 `"open/app/edit"`）。
  - 事实：`open/app/index.html:49-51`（`createUrl: prefix + "/add"`、`updateUrl: prefix + "/edit/{id}"`、`removeUrl: prefix + "/remove"`）→ 通过 URL 跳转，而非 `layer.open` 弹窗。
  - 事实：模板文件存在独立的新增/编辑页：`templates/open/app/add.html`、`templates/open/app/edit.html`、`templates/system/user/add.html`、`templates/system/user/edit.html` 等（14 个业务页面目录共 56 个视图）。
  - 规范依据：`_spec/MU-spec.md#8.4.4`（"**新增**点击「新增」按钮后**弹出对话框（Modal）**，在弹窗内填写并保存"；"保存成功后关闭弹窗并刷新列表"）。
  - 张力点：`_spec/MU-spec.md#8.4.1` 亦禁止"用 `SINGLE_FORM` 在页面顶部堆表单 + 底部列表的方式实现"——现状是"列表页 + 跳转到另一个整页表单"，与规范两种形态都不同。
- **若假设不成立的影响**：若按规范改建为弹窗式，则 MU 的 ASCII 布局与操作功能点会与真实界面不符（`screenType` 相同但 `layout` 差异大）；若按现状建模，则阶段三若依规范围实现弹窗，MU 与实现会不一致。**这是一个必须由人工裁定的"规范 vs 现状"冲突。**
- **需谁确认**：业务方 + 前端负责人
- **风险**：高
- **标记**：`[待确认]`

### A-MU-04　每个"新增/修改/删除"按钮对应一个 MU 功能点

- **假设内容**：列表页的工具栏按钮与行内按钮（新增/修改/删除/重置密钥/查看 cURL/导出/加载授权/保存授权/全选/清空）各建为一个 `actionPoint`，`actionType` 为 `BUTTON`；**不使用** `DRAFT`/`SUBMIT`/`APPROVE`/`REJECT`/`RETURN`（因无审批流）。
- **依据**：
  - 事实：`open/app/index.html:32-36`（工具栏"新增/修改/删除"）+ `:61-67`（行内"编辑/删除/重置密钥"）。
  - 事实：`open/api/index.html:46-52`（行内"查看 cURL/编辑/删除"）。
  - 事实：`open/auth/index.html:16-19`（"加载授权/保存授权/全选/清空"）。
  - 事实：`open/log/index.html:24-26`（"搜索/重置/导出CSV"）。
  - 事实：`business-architecture.md#5.5`（F 类按钮权限 50→57 个唯一 ID 逐条列出，另 7 个来自 `sql/quartz.sql`）。
  - 规范依据：`_spec/MU-spec.md#8.2.5`（`actionType` 枚举含 `BUTTON`/`SUBMIT`/`DRAFT`/`APPROVE`/`REJECT`/`RETURN`）。
- **若假设不成立的影响**：若"搜索/重置/全选/清空"这类**纯前端动作**也建成 `actionPoint`，会违反"操作功能点对应调用一个 M2 行为"的定义（`MU-spec.md#8.2.5`）→ 门禁 G1b 会报"引用的行为不存在"。**因此建议：纯前端动作不建 `actionPoint`，或建成后不填 `behaviorRef`（需确认规范是否允许）。**
- **需谁确认**：架构师
- **风险**：中
- **标记**：`[待确认]`

### A-MU-05　框选/行内按钮的权限码与功能点绑定

- **假设内容**：F 类按钮权限码（`open:app:add` 等）绑定到**对应的 MU 功能点**（`actionPoint.permissionRef`），而非绑定到屏幕整体。
- **依据**：
  - 事实：`open_api_menu.sql:14-26`（F 类权限：`open:app:list/add/edit/remove`、`open:api:list/add/edit/remove`、`open:auth:save`、`open:log:list`、`open:doc:generate`，均带 `parent_id` 指向对应 C 类菜单）。
  - 规范依据：`_spec/MU-spec.md#8.2.5`（`actionPoint.permissionRef` = "可选；控制功能点可用性的 M5 权限"）。
  - 事实：`open/app/index.html` 中"新增/修改/删除"按钮**没有**用 `shiro:hasPermission` 做显示控制（全文件检索无 shiro 标签），说明按钮权限码在前端**未被使用** → 与 A-M5-03 的结论一致。
- **若假设不成立的影响**：若权限码在前端确实用于按钮显隐（通过 `include.html` 中的公共片段），则 M5 的权限语义需补"前端可见性控制"这一层。**当前证据指向"未使用"，但未逐行核对 `include.html` 与 `index.html` 外壳模板。**
- **需谁确认**：前端负责人（核对 `templates/include.html`、`index.html` 是否使用 `shiro:` 标签）
- **风险**：中
- **标记**：`[待确认]`

### A-MU-06　`open` 域 5 个页面的屏幕类型

- **假设内容**：`/admin/open/app`、`/admin/open/api` → `LIST_MAINTENANCE`；`/admin/open/log` → `QUERY_LIST`；`/admin/open/auth` → `LIST_MAINTENANCE`（授权矩阵，无标准列表）；`/admin/open/doc` → `MASTER_DETAIL_FORM` 或专用类型（左树右框）。
- **依据**：
  - 事实：`open/app/index.html`：查询区（应用名称/appKey/状态）+ 工具栏（新增/修改/删除）+ `bootstrap-table` + 行内操作 + 独立 add/edit 页 → 列表维护。
  - 事实：`open/log/index.html`：查询区（traceId/appKey/API路径/状态/时间范围）+ 结果表格 + 分页 + 无新增/编辑 → 查询列表；另有统计条（`#statsBar`、`#topAppsBar`）。
  - 事实：`open/auth/index.html`：应用下拉 + 接口 checkbox 矩阵 + 加载/保存按钮 → 非四类标准形态。
  - 事实：`open/doc/index.html`：左侧接口列表（可搜索）+ 右侧 `iframe` 展示文档 HTML → 左树右框，**非四类标准形态**。
  - 规范依据：`_spec/MU-spec.md#8.2.3`（`screenType` 只有 4 个值：`SINGLE_FORM` / `LIST_MAINTENANCE` / `MASTER_DETAIL_FORM` / `QUERY_LIST`）。
- **若假设不成立的影响**：授权页与文档页**无法归入规范的四类屏幕**——这是**规范覆盖不足**而非建模错误。需人工裁定：(a) 强行归入最接近的类型（`LIST_MAINTENANCE`），(b) 在 `layout` 中如实画出非标准布局并在说明中标注偏离。**本假设默认取 (a)+说明。**
- **需谁确认**：架构师（裁定非标准屏幕的表达方式）
- **风险**：中
- **标记**：`[待确认]`

### A-MU-07　统计条与日志详情是否需建 M7

- **假设内容**：调用日志页顶部的"今日调用量/成功率/平均耗时/Top应用"统计条与行展开的日志详情（客户端IP、错误信息、请求体、响应体）**已由 M7 的 `STATISTICAL_QUERY` 与列表结果列覆盖**，不另建 M7 对象。
- **依据**：
  - 事实：`open/log/index.html:8-9`（`#statsBar`、`#topAppsBar`）、`:71-83`（`$.get(prefix + "/stats")` 渲染统计条）、`:58-68`（`detailFormatter` 渲染 `clientIp`/`errorMsg`/`reqBody`/`respBody`）。
  - 事实：`OpenManageService.java:339-357`（`queryLogStatsToday` 返回 `totalCalls`/`successRate`/`avgCost`/`topApps`）。
- **不确定点**：统计条的取数窗口是"今日"（`call_time::date = current_date`），**与列表页的时间范围查询无关** → 若把统计建成 M7 对象，其参数集合与列表对象**完全不同**（无参数），需确认这属于两个 M7 对象还是同一对象的两部分。
- **若假设不成立的影响**：若分成两个 M7 对象，则需两条 M2 QUERY 行为（一个端点两条行为，需确认是否符合 M2 语义）；若合并，则一个 M7 对象要同时表达"带参数的分页列表"与"无参数的今日统计"，超出 `M7-spec.md` 单对象单结果集的假定。
- **需谁确认**：架构师
- **风险**：中
- **标记**：`[待确认]`

### A-MU-08　前端标签缺失的部分

- **假设内容**：以下界面的中文标签**缺乏模板直接佐证**，需从 M1 `label` 或字段名推断，并在 MU 中标注证据等级为推断：
  - 统计条的三个指标名称（"今日调用量/成功率/平均耗时/Top应用"）：模板中存在（`open/log/index.html:8-9`），**有佐证**；
  - 授权页的授权矩阵行文（接口名 + `[METHOD path]` + "已授权"徽标）：模板中存在（`open/auth/index.html:77`），**有佐证**；
  - 文档页左侧列表项（接口名 + `METHOD path`）：模板中存在（`open/doc/index.html:76-77`），**有佐证**；
  - **缺佐证的部分**：`open/api/add.html` 与 `open/api/edit.html` 中 `req_example`/`resp_example`/`target_url`/`timeout_ms`/`need_sign` 等字段的**中文标签**（需读这两个模板确认）；`open/app/add.html`、`open/app/edit.html` 中 `app_secret`/`expire_time`/`contact`/`remark` 的标签；以及所有 `system/**` 业务页面的表单字段标签（未逐一取样）。
- **依据**：
  - 事实：`open/app/index.html`、`open/api/index.html`、`open/auth/index.html`、`open/doc/index.html`、`open/log/index.html` 已逐一读取，列标题均有中文。
  - 事实（缺口）：`open/app/add.html`、`open/app/edit.html`、`open/api/add.html`、`open/api/edit.html` **未逐一读取**（本轮范围外）。
  - 事实：`open-api/sql/open_api.sql` 的列注释**是英文**（`COMMENT 'app name'`、`'app key'`、`'1=sign required'`），PostgreSQL 版**无注释** → 无法从 DDL 取得中文标签。
- **若假设不成立的影响**：MU 的 `element.label` 若凭字段名直译，可能与真实界面不符（例如 `need_sign` 界面可能叫"是否验签"而非"签名"）。
- **需谁确认**：前端负责人（提供模板标签清单）
- **风险**：中
- **标记**：`[待确认]`

### A-MU-09　授权页只能"追加授权"的可逆性

- **假设内容**：授权页对**已授权**接口的 checkbox 设为 `disabled`，界面上**无法取消已有授权**；取消授权只能通过"选择该应用 + 不勾新增 + 保存"（实际上仍会提交既有授权集合）或删除应用/接口。
- **依据**：
  - 事实：`open/auth/index.html:71`（`var disabled = isAuthorized ? 'disabled' : '';`）、`:76`（`'<input type="checkbox" name="apiIds" value="' + api.id + '" ' + checked + ' ' + disabled + '/>'`）。
  - 事实：`:108-114`（`saveAuth()` 提交的 `apiIds` = `authorizedApiIds`（全部已授权）**拼接**新勾选项 → 已授权项**不会被移除**）。
  - 事实：`OpenManageService.java:259-279`（`saveAppAuth` 支持"清空全部授权"：`delete` 后若 `apiIds` 为空则直接 `return`）→ **后端支持取消，前端不提供入口**。
- **若假设不成立的影响**：若业务认为"应该能取消授权"，则属**功能缺口**（现状只能通过删除应用或接口间接触发级联删除）；MU 中应把该限制如实表达，M2 中"保存授权"行为的业务语义需注明"整集替换，但界面仅支持追加"。
- **需谁确认**：业务方（取消授权是否为必需能力）
- **风险**：中
- **标记**：`[待确认]`

---

## 8. 横切假设（数据与证据类）

### A-DATA-01　`application.yml` 与 PostgreSQL 版菜单 SQL 的中文双重编码乱码

- **假设内容**：`open-api/qvsu-openapi/src/main/resources/application.yml`、`application-druid.yml` 与 `deploy/local-docker/postgres/init/40-open-api-menu.sql` 的中文为**上游双重编码乱码**（ZIP 内即如此）；本体建模中：
  - 菜单中文名一律取 **MySQL 副本**（`deploy/local-docker/mysql/init/10-qvsu.sql`、`40-open-api-menu.sql`、`open-api/sql/open_api_menu.sql`）或模板中文；
  - 配置项注释不可读，但配置**值**均为 ASCII 可直接判读；
  - 不可还原的菜单名/注释在 MU / M1 中标注证据等级为推断。
- **依据**：
  - 事实：`PROGRESS.md#Q-mojibake-yaml`（状态 `open`）："`application.yml` 与 `deploy/local-docker/postgres/init/40-open-api-menu.sql` 的中文内容为双重编码乱码，原始 zip 内即如此。影响：配置文件注释与 PostgreSQL 菜单名不可读；若直接从该 SQL 初始化，菜单名会显示乱码。补证动作：需从上游重新获取未损坏的源文件。"
  - 事实：`change-hotspots.md` 第 90 行："`application.yml` 与 `application-druid.yml` 的中文注释是『UTF-8 BOM 后跟 GBK 字节被按 Latin-1 再编码』的双重乱码；同一仓库的 Java/XML/Mapper 中文正常，说明损坏只发生在这两个文件（证据等级：事实，逐字节读取确认）。`deploy/local-docker/postgres/init/40-open-api-menu.sql` 的菜单中文同样乱码（证据等级：事实）。"
  - 事实：`change-hotspots.md#HOT-DIALECT` 编码不一致行："MySQL 版 `40-open-api-menu.sql` 中文正常；PostgreSQL 版同一文件中文乱码（`搴旂敤绠＄悊`）"。
  - 事实（本会话实测）：`deploy/local-docker/postgres/init/40-open-api-menu.sql:6-10` 的菜单名为 `搴旂敤绠＄悊`、`鎺ュ彛绠＄悊`、`鎺堟潈绠＄悊`、`璋冪敤鏃ュ織`、`鏂囨。绠＄悊`；对应 MySQL 副本（`deploy/local-docker/mysql/init/40-open-api-menu.sql:8-12`）为 `应用管理`、`接口管理`、`授权管理`、`调用日志`、`文档管理`。→ 乱码形态为 **UTF-8 字节被按 GBK 解码后再以 UTF-8 编码**（"应用管理"→`应`的 UTF-8 `E5 BA 94`被读作 GBK `搴`）。
  - 事实：`change-hotspots.md` 第 465 行（"仓库根 `README.md` 与 `open-api/README.md` 中文乱码，新成员无法从文档获得准确的启动与测试步骤"）。
  - 事实：`business-architecture.md#7.6`（"已规避：全部中文菜单名取自 MySQL 副本，PostgreSQL 副本仅用于核对 ID 与权限码"）。
- **若假设不成立的影响**：若上游提供未损坏的源文件，则配置注释中的业务说明（例如"CSRF 校验开关"、"验证码开关"的原始中文说明）可以恢复，M3 中关于配置开关的规则描述可更准确；菜单中文名可原样使用而不必跨副本对照。
- **需谁确认**：上游仓库提供方（重新提供未损坏的 ZIP / 单文件）
- **风险**：中
- **标记**：`[待确认]`

### A-DATA-02　M1 属性中文标签的证据来源优先级

- **假设内容**：M1 属性 `label` 的取值优先级为：(1) Thymeleaf 模板中的界面标签 → (2) MySQL 版 DDL 的 `COMMENT` → (3) `interface-index.md` / `flow-index.md` 中的中文描述 → (4) 从字段名推断并标 `[待确认]`。
- **依据**：
  - 事实：`open-api/sql/open_api.sql:11-100` 的 MySQL DDL 全部列带 `COMMENT`，但**注释是英文或英文缩写**（`'primary key'`、`'app name'`、`'app key'`、`'contact'`、`'1=enabled 0=disabled'`、`'expire time, NULL=never'`、`'compat delete flag'`、`'0=ok 1=auth-fail 2=proxy-fail'`）→ **无法直接作为中文 label**。
  - 事实：PostgreSQL 版同表**无 COMMENT**（`deploy/local-docker/postgres/init/30-open-api.sql:8-23`）。
  - 事实：模板中有可靠中文（`open/app/index.html:13-20`：应用名称/appKey/状态/启用/禁用；`:54-60`：ID/应用名称/AppKey/联系人/状态/过期时间/创建时间）。
  - 事实：`database-schema.md` 的字段表含 `unknown` 占位（`consistency-report.md` Pass J）。
- **若假设不成立的影响**：若以 DDL 英文注释直译为中文 label，M1 与 MU 的标签会与真实界面不一致（症状：阶段三生成的界面文案与现状不符）。
- **需谁确认**：前端负责人 + 业务方
- **风险**：中
- **标记**：`[待确认]`

### A-DATA-03　上游 `business-architecture.md#1.2` 的一处表述与源码不符

- **假设内容**：`business-architecture.md` 第 80 行称"`/admin/open/**` 管理端受 `@RequiresPermissions` 约束"，**与源码不符**（open 域零 `@RequiresPermissions`）；本体采用**源码**为准。
- **依据**：
  - 事实：`business-architecture.md:80`：「| 开放平台域 → 系统管理域 | 单向依赖。`/admin/open/**` 管理端受 `@RequiresPermissions` 约束，权限码 `open:*` 由 `sys_menu` 定义、经 `sys_role_menu` 授予角色 | `open/controller/OpenAppController.java`、`sql/open_api_menu.sql:28-62` |」。
  - 事实：对 `com/qvsu/open` 检索 `@RequiresPermissions` → **零命中**；`interface-index.md#3` 明确把这 36 个 open 域端点列入无权限码清单。
  - 事实：`flow-index.md#流程间的依赖关系` 明确"`open:*` 权限码**未在代码侧校验**，实际仅由菜单可见性约束"。
- **若假设不成立的影响**：若该表述为真（即存在某处校验），则 M5 的权限缺口结论与 79 端点清单需重新核对。
- **需谁确认**：上游逆向任务负责人（修订 `business-architecture.md:80`）
- **风险**：中
- **标记**：`[待确认]`

### A-DATA-04　上游文档处于更新中，本体必须锁定输入版本

- **假设内容**：本体落地（YAML 生成与门禁校验）前必须**重新取一次**上游文档，并在本目录记录取数时间与关键计数快照；不得沿用本文定稿时的过期计数。
- **依据**：
  - 事实（本会话观测）：上游文件在建模期间被并行修改——`functional-inventory.md` 32→**29** 个 FUNC、`config-index.md` 168→**29** 个配置键、`non-menu-function-index.md` 9→**6** 个功能、`meta-index.md` 接口节点 195→**192**、`PROGRESS.md` 新增 3 个 `Q-*`（`Q-datascope-find-in-set`、`Q-audit-query-not-implemented`、`Q-menu-extraction-scope`）、`validation-report.txt` 由 PASS→**FAIL（ERROR=1：`Q-audit-query-not-implemented` 被引用但主定义未被识别）**。
  - 事实：`docs/meta-model/` 目录内多份文件的修改时间跨度从 `2026/9/29 15:14` 到 `15:45`（本会话同一小时）。
- **若假设不成立的影响**：若以上游某个中间快照为准生成 YAML，会固化不再正确的计数（例如仍按 32 个 FUNC 建行为、按 9 个无菜单功能建排除说明），并与最终上游产物不一致。
- **需谁确认**：下游本体 YAML 任务负责人 + 上游逆向任务负责人（约定冻结时点）
- **风险**：高
- **标记**：`[待确认]`

### A-DATA-05　`del_flag='2'` 的语义未由文档定义

- **假设内容**：`del_flag` 的取值语义为 `0`=正常、`2`=已删除（无 `1` 的使用证据）；M1 的枚举据此取值。
- **依据**：
  - 事实：所有查询条件均为 `del_flag = '0'`（`SysUserMapper.xml:65,97,114,128,133,138,142,146,150`；`SysRoleMapper.xml:38,66,71,76,81`；`SysDeptMapper.xml:34,40,59,64,71,86`）；所有删除均为 `set del_flag = '2'`（`SysUserMapper.xml:159,163`；`SysRoleMapper.xml:85,89`；`SysDeptMapper.xml:148`）。
  - 事实：`open-api/sql/open_api.sql` 中**无** `del_flag` 列（该域用物理删除）。
  - 事实：源码中**未出现** `del_flag = '1'` 或 `del_flag = '0'`（写入侧）的任何语句 → `1` 的含义未知。
- **若假设不成立的影响**：若 `1` 表示某种中间态（如"停用"），则 M1 的枚举需补值，M7 的过滤条件 `del_flag='0'` 的语义需重新解释。
- **需谁确认**：DBA + 架构师（查 `sys_user`/`sys_role`/`sys_dept` 中 `del_flag` 的实际取值分布）
- **风险**：低
- **标记**：`[待确认]`

---

## 9. 汇总统计表

### 9.1 总数与按模型分布

| 所属模型 | 假设条数 | 编号区间 |
|---|---:|---|
| M1 对象模型 | 10 | A-M1-01 ～ A-M1-10 |
| M2 行为模型 | 8 | A-M2-01 ～ A-M2-08 |
| M3 规则模型 | 10 | A-M3-01 ～ A-M3-10 |
| M5 主体模型 | 8 | A-M5-01 ～ A-M5-08 |
| M6 流程模型 | 6 | A-M6-01 ～ A-M6-06 |
| M7 查询报表模型 | 7 | A-M7-01 ～ A-M7-07 |
| MU UI 模型 | 9 | A-MU-01 ～ A-MU-09 |
| 横切（数据与证据） | 5 | A-DATA-01 ～ A-DATA-05 |
| **合计** | **63** | — |

### 9.2 按风险等级分布

| 风险 | 条数 | 占比 | 编号明细 |
|---|---:|---:|---|
| **高** | **12** | 19.0% | A-M1-01、A-M1-05、A-M2-03、A-M3-03、A-M3-04、A-M3-05、A-M3-08、A-M5-01、A-M5-02、A-M5-03、A-M5-04、A-M6-01 |
| **中** | **38** | 60.3% | A-M1-02、A-M1-03、A-M1-04、A-M1-07、A-M1-08、A-M1-10、A-M2-01、A-M2-02、A-M2-04、A-M2-05、A-M2-06、A-M3-01、A-M3-02、A-M3-06、A-M3-09、A-M3-10、A-M5-05、A-M5-06、A-M5-07、A-M5-08、A-M6-02、A-M6-03、A-M6-04、A-M6-05、A-M7-01、A-M7-02、A-M7-06、A-MU-01、A-MU-03、A-MU-04、A-MU-05、A-MU-06、A-MU-07、A-MU-08、A-MU-09、A-DATA-01、A-DATA-02、A-DATA-03 |
| **低** | **13** | 20.6% | A-M1-06、A-M1-09、A-M2-07、A-M2-08、A-M3-07、A-M6-06、A-M7-03、A-M7-04、A-M7-05、A-M7-07、A-MU-02、A-DATA-04、A-DATA-05 |
| **合计** | **63** | 100% | — |

> **风险等级的口径（务必按下述口径理解）**：本表的"风险"指**该假设被推翻时对本体模型语义的破坏程度**——高 = 会连带改写多个模型的元素；中 = 会改写本模型及其直接下游；低 = 只影响个别元素的描述或取值。因此 **A-DATA-04（上游版本锁定）在本表中为"低"**（它不改变任何模型语义），但在 §10 的 Top 10 中排第 10（它决定 YAML 是否会固化过期计数，属**流程风险**）。三档计数：高 12 + 中 38 + 低 13 = **63**。

**高风险 12 条的要点**：

| 编号 | 一句话 |
|---|---|
| A-M1-01 | 聚合边界与"未进 M1 的对象"去向——唯一的全局性错误源 |
| A-M1-05 | 平台域与开放域状态极性相反（`0` 有效 vs `1` 有效） |
| A-M2-03 | 无权限码端点的行为 `requiredPermissions` 留空 |
| A-M3-03 | `need_sign=0` 绕过全部鉴权是设计还是缺陷 |
| A-M3-04 | nonce 校验依赖 JVM 内存，多实例部署下规则失效 |
| A-M3-05 | CSRF/XSS 未生效，不建为规则（否则阶段三会真的启用） |
| A-M3-08 | `find_in_set`（`DataScopeAspect.java:136`）在 PostgreSQL 上必然报错 |
| A-M5-01 | 184 端点中约 79–83 个无权限码：保持现状还是补齐 |
| A-M5-02 | `com.qvsu.open` 7 个 Controller 36 个端点零 `@RequiresPermissions` |
| A-M5-03 | `open:*` 15 个权限码只存在于菜单 SQL，仅约束菜单可见性 |
| A-M5-04 | 角色清单与 `dataScope` 必须取运行库/种子数据 |
| A-M6-01 | 系统不存在任何审批流（0 个 APPROVAL 流程 / 0 个审批功能点） |
| A-DATA-04 | 上游文档仍在更新且官方校验当前 FAIL，YAML 生成前必须锁定输入版本 |

> 说明：A-DATA-04 虽被列入上表"低"档的行（因其不改变任何模型语义，只影响取数时点），但其**流程影响**为高——它就是 Top 10 的第 10 项。上表按"是否改变模型语义"分档，Top 10 按"是否造成返工"排序，两者口径不同，属有意设计。

### 9.3 按"需谁确认"分布

| 确认责任方 | 涉及条数（主责） | 典型条目 |
|---|---:|---|
| 架构师 | 24 | A-M1-01、A-M2-02、A-M3-02、A-M6-04、A-MU-06 |
| 业务方 | 18 | A-M1-03、A-M3-06、A-M5-04、A-M6-01、A-MU-09 |
| 安全负责人 | 7 | A-M3-03、A-M3-05、A-M5-01、A-M5-02、A-M5-03、A-M5-08 |
| DBA / 运维 | 7 | A-M1-02、A-M3-08、A-M3-09、A-M5-04、A-M6-06、A-DATA-05 |
| 前端负责人 | 5 | A-MU-02、A-MU-05、A-MU-08、A-DATA-02 |
| 上游逆向任务负责人 | 3 | A-M3-01、A-DATA-03、A-DATA-04 |
| 上游仓库提供方 | 1 | A-DATA-01 |
| 下游本体 YAML 任务负责人 | 1 | A-DATA-04 |

> 说明：部分条目有多个主责方（如 A-M5-04 需业务方 + DBA、A-DATA-04 需上下游双方），故本表合计大于 63；本表仅统计**第一责任方**。

### 9.4 标记统计

| 标记 | 条数 |
|---|---:|
| `[待确认]` | **63**（100%） |
| `[已确认]` | 0 |

> 说明：本次交付**不含任何人工确认**，故全部为 `[待确认]`。`[已确认]` 需在人工给出结论后回填（同时补充确认人、确认时间与依据）。

---

## 10. 需要人工确认的 Top 10 问题（按对后续开发的影响排序）

以下 10 项按"若不确认，阶段三/四会产生多大返工"排序。**建议按序确认，前 4 项应在 YAML 定稿前完成。**

| 排序 | 问题 | 编号 | 为什么排在这里 | 需谁 | 风险 |
|---:|---|---|---|---|---|
| **1** | **M1 聚合边界与"未进 M1 的对象"去向** | A-M1-01 | 聚合错则 M2 的 `ownerEntity`/`syncTriggers`、M7 的 `sourceObjects`、M6 的 `businessObjectRefs` 全部连带错，是**唯一的全局性错误源** | 架构师 + 业务方 | 高 |
| **2** | **79 个无权限码端点的处置（保持现状 or 补齐）** | A-M5-01 / A-M2-03 | 决定 M5 权限全集与 M2 行为的 `requiredPermissions`。若阶段三"顺手补上校验"，会把一个无权限的老系统变成有权限的系统，**直接造成上线故障** | 安全负责人 + 业务方 | 高 |
| **3** | **`com.qvsu.open` 域 36 个管理端点零权限码 + `open:*` 仅菜单声明** | A-M5-02 / A-M5-03 | 开放平台域是本系统的**核心增量**，其"应用密钥重置""接口删除""授权保存"等 4 个高危写操作当前无后端鉴权。这既是模型问题也是安全问题，需与业务确认"是缺陷还是有意" | 安全负责人 + 业务方 | 高 |
| **4** | **本系统不存在审批流（0 个 APPROVAL / 0 个审批功能点）** | A-M6-01 | 影响 M6 的流程类型集合、MU 的双按钮规则是否适用。若业务其实需要审批，必须**回到阶段一**立项，不能在建模阶段补建 | 业务方 | 高 |
| **5** | **`find_in_set` 在 PostgreSQL 上必然报错（P0）** | A-M3-08 | 决定 M5 的 `dataScope` 能否用"本部门及以下"档、M7 的数据可见范围描述是否成立。若确有角色使用该档，相关界面**当前完全不可用** | 架构师 + DBA（查 `sys_role.data_scope` 分布） | 高 |
| **6** | **`open_*` 状态字段极性相反（平台域 0=有效，开放域 1=有效）** | A-M1-05 | 写反的症状是"启用/禁用互换"，属高危隐蔽缺陷；影响 M1 枚举、M3 规则、M7 条件 | 业务方 + 架构师 | 高 |
| **7** | **`need_sign=0` 绕过全部鉴权是设计还是缺陷** | A-M3-03 | 决定 M3 是否把它表达为"合法分支"。若是缺陷，则需在阶段三之前做安全决策；若是设计，M3 需完整表达其语义 | 安全负责人 + 业务方 | 高 |
| **8** | **MU："列表 + 独立新增/编辑页"（现状）vs "列表 + 弹窗"（规范）** | A-MU-03 | 决定 15 个业务屏幕的 ASCII 布局与 `actionPoint` 结构。规范与现状冲突，**必须二选一**，AI 不得默认 | 业务方 + 前端负责人 | 高 |
| **9** | **角色清单与 `dataScope` 须从运行库/种子数据取得** | A-M5-04 | 直接决定 M5 的 `roles[]` 与 M6 的 `roleRefs` 是否能通过门禁 G3a（引用必须存在）。凭猜测会造出不存在的角色 | 业务方 + DBA | 高 |
| **10** | **锁定上游元模型版本（上游仍在更新，且官方校验当前 FAIL）** | A-DATA-04 | 上游在建模期间发生了 FUNC 32→29、配置键 168→29、接口节点 195→192 等变化，且 `validation-report.txt` 由 PASS 变为 **FAIL（ERROR=1）**。YAML 生成前必须冻结输入，否则会固化错误计数 | 下游 YAML 任务负责人 + 上游逆向任务负责人 | 高 |

### 10.1 超出 Top 10 但需尽早确认的 3 项

| 问题 | 编号 | 说明 |
|---|---|---|
| 中文编码损坏（`application.yml`、PostgreSQL 菜单 SQL） | A-DATA-01 | 若能拿到未损坏的源文件，菜单中文与配置注释可原样还原；当前已用"取 MySQL 副本"规避，但该规避本身依赖"两个副本除编码外完全一致"这一未逐条核对的假设 |
| `open_api_doc.api_ids` 是逗号串而非关联 | A-M1-07 | 若按关联建模，M7 会写出无法执行的 Join |
| 授权页只能追加、无法取消授权 | A-MU-09 | 影响"保存授权"行为的业务语义与 MU 功能点集合；若业务认为应能取消，属功能缺口 |

---

## 11. 相关文档

- 总览与映射：[`00-ontology-overview.md`](./00-ontology-overview.md)
- 判断与取舍：[`01-modeling-decisions.md`](./01-modeling-decisions.md)
- 上游未决问题（`Q-*` 主定义）：[`../meta-model/PROGRESS.md`](../meta-model/PROGRESS.md)
- 上游一致性报告：[`../meta-model/consistency-report.md`](../meta-model/consistency-report.md)
- 上游校验器报告：[`../meta-model/validation-report.txt`](../meta-model/validation-report.txt)
- 七模型规范（只读）：[`_spec/00-overview-and-relations.md`](./_spec/00-overview-and-relations.md)
