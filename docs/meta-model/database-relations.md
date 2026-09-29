# 数据关系与血缘（database-relations）

本文件登记 QVSU OpenAPI 管理与网关服务（精简化单体 Spring Boot 应用）的 34 张唯一物理表之间的字段级关系、关联簇、数据血缘与数据库方言差异。

- 表清单与物理对象登记：见 [表清单](./database-inventory.md)。
- 每张表的稳定标识与业务含义主定义：见 [表主定义](./database-model.md)。
- 逐字段类型、可空、默认值、索引：见 [字段设计](./database-schema.md)。
- 功能 / 接口 / DAO 到物理表的 R/C/U/D 矩阵：见 [数据访问矩阵](./database-access-matrix.md)。
- 主写所有者与写入冲突：见 [数据归属](./data-ownership.md)。

## 1. 结论摘要

| 序号 | 结论 | 证据等级 |
|---|---|---|
| 1 | 34 张物理表的 DDL 中**不存在任何** `FOREIGN KEY` / `REFERENCES` / `CONSTRAINT` 子句；全部关系都是逻辑外键 | 事实 |
| 2 | 表间关系只靠应用代码（MyBatis Mapper SQL、`JdbcTemplate` 语句）与 `delete`/`batch insert` 的配对调用维持一致性，数据库不做引用完整性校验 | 事实 |
| 3 | 四张多对多关联表（`sys_user_role`、`sys_role_menu`、`sys_role_dept`、`sys_user_post`）都采用"复合主键 + 先删后批插"的写法，任一侧主表被删除时由 Service 层手工清理 | 事实 |
| 4 | 至少 4 处关系存在"写入方删了子行/漏删子行"的不对称：`sys_menu` 删除不删 `sys_role_menu`、`sys_post` 无软删除却无关联清理、`open_call_log` 与 `open_app`/`open_api` 之间只有字符串弱引用、`QRTZ_*` 11 张表运行期零访问 | 事实 |

## 2. 证据等级与判定口径

| 等级 | 含义 |
|---|---|
| 事实 | 直接读到 DDL 约束、Mapper SQL 语句、`JdbcTemplate` 语句或 Java 代码赋值 |
| 推断 | 由多处证据交叉推出（例如字段名 + 值域 + 读写代码路径一致） |
| 假设 | 仅有命名线索，尚未找到读写两侧代码 |

"物理外键"一列的含义：`无` 表示 DDL 中无 `FOREIGN KEY` 约束；`无（有 UNIQUE）` 表示虽无外键但有唯一约束可用于约束重复。

## 3. 物理外键现状

对 `open-api/` 下全部 21 个 `.sql` 文件检索 `foreign key` / `references` / `constraint`（不区分大小写）结果为 **0 条命中**。因此：

- 全部 34 张表之间 **0 个物理外键**。
- 数据库层无法阻止孤儿行、无法级联删除、无法级联更新。
- 参照完整性 100% 由应用层承担，具体承担点见第 5 章的关系清单"证据"列。

同时注意：`sys_dict_type.dict_type` 有 `unique (dict_type)`（MySQL 与 PostgreSQL 两份 DDL 均有），`open_app.app_key` 与 `open_api.api_path` 有 `UNIQUE`，`open_app_api (app_id, api_id)` 有唯一约束。这是本库仅有的三类完整性约束。

## 4. 关系分簇

34 张表按业务归属划分为 5 簇，合计 34 张，不重不漏。下表同时给出各表在 [表主定义](./database-model.md) 中的稳定标识，正文与关系图中一律以该标识或物理表名引用，本文件不重复任何主定义。

| 簇名 | 表数 | 物理表（稳定标识） |
|---|---:|---|
| 系统权限簇 | 9 | `TBL-sys_user`、`TBL-sys_role`、`TBL-sys_menu`、`TBL-sys_dept`、`TBL-sys_post`、`TBL-sys_user_role`、`TBL-sys_role_menu`、`TBL-sys_role_dept`、`TBL-sys_user_post` |
| 开放平台业务簇 | 5 | `TBL-open_app`、`TBL-open_api`、`TBL-open_app_api`、`TBL-open_call_log`、`TBL-open_api_doc` |
| 字典参数簇 | 3 | `TBL-sys_dict_type`、`TBL-sys_dict_data`、`TBL-sys_config` |
| 审计与通知簇 | 4 | `TBL-sys_oper_log`、`TBL-sys_logininfor`、`TBL-sys_user_online`、`TBL-sys_notice` |
| Quartz 调度簇 | 13 | `TBL-sys_job`、`TBL-sys_job_log`、`TBL-QRTZ_JOB_DETAILS`、`TBL-QRTZ_TRIGGERS`、`TBL-QRTZ_SIMPLE_TRIGGERS`、`TBL-QRTZ_CRON_TRIGGERS`、`TBL-QRTZ_BLOB_TRIGGERS`、`TBL-QRTZ_CALENDARS`、`TBL-QRTZ_PAUSED_TRIGGER_GRPS`、`TBL-QRTZ_FIRED_TRIGGERS`、`TBL-QRTZ_SCHEDULER_STATE`、`TBL-QRTZ_LOCKS`、`TBL-QRTZ_SIMPROP_TRIGGERS` |
| **合计** | **34** | |

## 5. 字段级关系清单

### 5.1 系统权限簇（关联表两侧 + 自关联树 + 部门归属）

| 序号 | 父端（被引用） | 子端（引用方） | 字段对 | 关系类型 | 物理外键 | 证据 | 证据等级 |
|---:|---|---|---|---|---|---|---|
| 1 | `sys_user` | `sys_user_role` | `sys_user.user_id` → `sys_user_role.user_id` | 1:N | 无（`sys_user_role` 复合主键 `primary key(user_id, role_id)`） | DDL：`deploy/local-docker/postgres/init/10-qvsu.sql:228-232`；`mapper/system/SysUserRoleMapper.xml:17` `delete from sys_user_role where user_id = #{userId}`；`SysUserServiceImpl.java:180-187` `@Transactional` 内先删 `sys_user_role` 再软删 `sys_user` | 事实 |
| 2 | `sys_role` | `sys_user_role` | `sys_role.role_id` → `sys_user_role.role_id` | 1:N | 无 | `mapper/system/SysUserRoleMapper.xml:21` `countUserRoleByRoleId`；`:43-47` `deleteUserRoleInfos`（按 `role_id` + `user_id in` 删）；写入链：`SysRoleServiceImpl.java:183` `insertRole` → `:187` `insertRoleMenu`（角色菜单）与 `:403-415` `insertAuthUsers` → `SysUserRoleMapper.batchUserRole`（`:415`） | 事实 |
| 3 | `sys_role` | `sys_role_menu` | `sys_role.role_id` → `sys_role_menu.role_id` | 1:N | 无（复合主键 `primary key(role_id, menu_id)`） | DDL：`postgres/init/10-qvsu.sql:245-249`；`mapper/system/SysRoleMenuMapper.xml:13` `deleteRoleMenuByRoleId`；`SysRoleServiceImpl.java:137-145` `@Transactional` 顺序：`deleteRoleMenuByRoleId` → `deleteRoleDeptByRoleId` → `deleteRoleById` | 事实 |
| 4 | `sys_menu` | `sys_role_menu` | `sys_menu.menu_id` → `sys_role_menu.menu_id` | 1:N | 无 | `mapper/system/SysRoleMenuMapper.xml:17` `selectCountRoleMenuByMenuId`；**反向清理缺失**：`mapper/system/SysMenuMapper.xml:118` 的 `deleteMenuById` 只执行 `delete from sys_menu where menu_id = #{menuId} or parent_id = #{menuId}`，`SysMenuServiceImpl.java:304` 也未级联删 `sys_role_menu`，而 `SysMenuServiceImpl.java:340` 又用 `selectCountRoleMenuByMenuId` 做"是否已分配"校验 → 删除菜单后 `sys_role_menu` 留孤儿行，且该孤儿行会让同名菜单重建时误判为已分配 | 事实 |
| 5 | `sys_role` | `sys_role_dept` | `sys_role.role_id` → `sys_role_dept.role_id` | 1:N | 无（复合主键 `primary key(role_id, dept_id)`） | DDL：`postgres/init/10-qvsu.sql:308-312`；`mapper/system/SysRoleDeptMapper.xml:13` `deleteRoleDeptByRoleId`；`SysRoleServiceImpl.java:214-223` `authDataScope` 内先删后批插（`insertRoleDept`，`:254-271`） | 事实 |
| 6 | `sys_dept` | `sys_role_dept` | `sys_dept.dept_id` → `sys_role_dept.dept_id` | 1:N | 无 | `mapper/system/SysRoleDeptMapper.xml:17` `selectCountRoleDeptByDeptId`；`:27-32` `batchRoleDept`；`mapper/system/SysDeptMapper.xml:30-36` `selectRoleDeptTree`：`left join sys_role_dept rd on d.dept_id = rd.dept_id where d.del_flag='0' and rd.role_id=#{roleId}` | 事实 |
| 7 | `sys_user` | `sys_user_post` | `sys_user.user_id` → `sys_user_post.user_id` | 1:N | 无（复合主键 `primary key(user_id, post_id)`） | DDL：`postgres/init/10-qvsu.sql:325-330`；`mapper/system/SysUserPostMapper.xml:13` `deleteUserPostByUserId`；`SysUserServiceImpl.java:197-210` `deleteUserByIds` `@Transactional` 内先删 `sys_user_post` | 事实 |
| 8 | `sys_post` | `sys_user_post` | `sys_post.post_id` → `sys_user_post.post_id` | 1:N | 无 | `mapper/system/SysUserPostMapper.xml:17` `countUserPostById`；`SysPostServiceImpl.java:143` 用该计数做"岗位已分配不可删"校验；`mapper/system/SysPostMapper.xml:44-50` `selectPostsByUserId`：`left join sys_user_post up on u.user_id = up.user_id left join sys_post p on up.post_id = p.post_id` | 事实 |
| 9 | `sys_menu` | `sys_menu` | `sys_menu.menu_id` → `sys_menu.parent_id` | 自关联树 1:N（根节点 `parent_id = 0`） | 无 | DDL：`postgres/init/10-qvsu.sql:137` `parent_id bigint default 0`；`mapper/system/SysMenuMapper.xml:123` 子查询 `(SELECT menu_name FROM sys_menu WHERE menu_id = t.parent_id) parent_name`；`:129` `select count(1) from sys_menu where parent_id=#{menuId}`；`:118` 删除条件含 `or parent_id = #{menuId}`（仅删一层子行，深孙子行不删）；`:134` `checkMenuNameUnique` 以 `parent_id` 为唯一性作用域 | 事实 |
| 10 | `sys_dept` | `sys_dept` | `sys_dept.dept_id` → `sys_dept.parent_id` | 自关联树 1:N（根节点 `parent_id = 0`） | 无 | DDL：`postgres/init/10-qvsu.sql:8` `parent_id bigint default 0`；`mapper/system/SysDeptMapper.xml:76` 子查询 `(select dept_name from sys_dept where dept_id = d.parent_id) parent_name`；`:71` `checkDeptNameUnique` 以 `parent_id` 为作用域；种子数据 `postgres/init/10-qvsu.sql:27-36` 建立 `100 → 101/102 → 103..109` 两层结构 | 事实 |
| 11 | `sys_dept` | `sys_user` | `sys_dept.dept_id` → `sys_user.dept_id` | 1:N | 无 | `mapper/system/SysUserMapper.xml:57` `left join sys_dept d on u.dept_id = d.dept_id`；`:64`（`selectUserList` 同款 join）；`mapper/system/SysDeptMapper.xml:59` `checkDeptExistUser`：`select count(1) from sys_user where dept_id = #{deptId} and del_flag='0'`（删除部门前校验）；`SysDeptServiceImpl.java:170` | 事实 |
| 12 | `sys_dept.ancestors` | —（自身派生列） | `sys_dept.parent_id` 闭包 → `sys_dept.ancestors` 逗号串 | 物化路径（派生） | 无 | 种子值形如 `'0,100,101'`（`postgres/init/10-qvsu.sql:30-36`）；`mapper/system/SysDeptMapper.xml:134-145` `updateDeptChildren` 用 `case dept_id when ... then #{item.ancestors} end` 批量重写；`:82` `selectChildrenDeptById` 用 `position(',' \|\| #{deptId} \|\| ',' in ',' \|\| ancestors \|\| ',') > 0` 反查子树；`framework/aspectj/DataScopeAspect.java:136` 同语义但改用 `find_in_set`（见第 9 章） | 事实 |
| 13 | `sys_user` ↔ `sys_role` | `sys_user_role` | 合成关系：`sys_user.user_id` = `sys_user_role.user_id`，`sys_user_role.role_id` = `sys_role.role_id` | **N:M** | 无 | `mapper/system/SysUserMapper.xml:56-60` `selectUserVo` 三表 join（`sys_user` → `sys_user_role` → `sys_role`）；`:108-124` `selectUnallocatedList` 用 `not in (select u.user_id ... inner join sys_user_role ur ... and ur.role_id = #{roleId})` 表达未分配集合 | 事实 |
| 14 | `sys_role` ↔ `sys_menu` | `sys_role_menu` | 合成关系：`sys_role.role_id` = `sys_role_menu.role_id`，`sys_role_menu.menu_id` = `sys_menu.menu_id` | **N:M** | 无 | `mapper/system/SysMenuMapper.xml:32-40` `selectMenusByUserId` 四表 join（`sys_menu` → `sys_role_menu` → `sys_user_role` → `sys_role`）；`:64-71` `selectPermsByUserId`；`:80-86` `selectMenuTree` 用 `concat(m.menu_id, coalesce(m.perms,''))` 拼装授权树键 | 事实 |
| 15 | `sys_role` ↔ `sys_dept` | `sys_role_dept` | 合成关系：`sys_role.role_id` = `sys_role_dept.role_id`，`sys_role_dept.dept_id` = `sys_dept.dept_id` | **N:M** | 无 | `mapper/system/SysDeptMapper.xml:30-36` `selectRoleDeptTree` 用 `left join sys_role_dept`；`framework/aspectj/DataScopeAspect.java:123` 与 `:127` 在运行期拼接 `OR {}.dept_id IN (SELECT dept_id FROM sys_role_dept WHERE role_id ...)` 注入 `${params.dataScope}`，由 Mapper 的 `${params.dataScope}`（如 `SysUserMapper.xml:88`、`SysDeptMapper.xml:54`）执行 | 事实 |
| 16 | `sys_user` ↔ `sys_post` | `sys_user_post` | 合成关系：`sys_user.user_id` = `sys_user_post.user_id`，`sys_user_post.post_id` = `sys_post.post_id` | **N:M** | 无 | `mapper/system/SysPostMapper.xml:44-50` `selectPostsByUserId`；`SysUserServiceImpl.java:479-496` 读取 `selectRolesByUserId` / `selectPostsByUserId` 组装用户视图 | 事实 |

### 5.2 开放平台业务簇

| 序号 | 父端（被引用） | 子端（引用方） | 字段对 | 关系类型 | 物理外键 | 证据 | 证据等级 |
|---:|---|---|---|---|---|---|---|
| 17 | `open_app` | `open_app_api` | `open_app.s_id` → `open_app_api.app_id` | 1:N | 无（`UNIQUE KEY uk_app_api (app_id, api_id)` / PG 侧无名 `UNIQUE (app_id, api_id)`） | DDL：`deploy/local-docker/mysql/init/30-open-api.sql:47-58`；`service/OpenManageService.java:90-99` `inner join open_app_api aa on a.s_id = aa.app_id`；`:255` `listAuthorizedApiIds`；`:262` `delete from open_app_api where app_id=?`；`:132` `deleteAppByIds` 先删 `open_app_api` 再删 `open_app` | 事实 |
| 18 | `open_api` | `open_app_api` | `open_api.s_id` → `open_app_api.api_id` | 1:N | 无 | `service/OpenManageService.java:237` `deleteApiByIds` 先 `delete from open_app_api where api_id in (...)`；`service/OpenApiSecurityService.java:326-331` `hasPermission`：`select count(1) from open_app_api where app_id=? and api_id=?`；`service/OpenManageService.java:274-277` 批插 `insert into open_app_api(app_id, api_id, create_time) ... on conflict (app_id, api_id) do update set update_time=now()` | 事实 |
| 19 | `open_app` ↔ `open_api` | `open_app_api` | 合成关系：`open_app.s_id` = `open_app_api.app_id`，`open_app_api.api_id` = `open_api.s_id` | **N:M** | 无 | 序号 17 + 18 合并；`OpenAuthController.java:58-66` `/admin/open/auth/save` 是唯一的授权关系写入入口；`service/OpenManageService.java:243-251` `listAppOptions` / `listApiOptions` 提供两侧下拉项 | 事实 |
| 20 | `open_app.app_key` | `open_call_log.app_key` | `open_app.app_key` → `open_call_log.app_key` | 1:N（**弱引用：字符串对字符串，且可空**） | 无 | 写入：`filter/OpenApiFilter.java:120` 调用 `openApiLogService.save(traceId, authContext, ...)`；`service/OpenApiLogService.java:37` 取 `authContext.getAppKey()` 写入 `app_key`；上游 `OpenApiSecurityService.java:112` 用 `loadAppInfo(appKey)` 从 `open_app.app_key` 反查；读取：`OpenManageService.java:297-301` `selectLogList` 按 `app_key` 过滤。**鉴权失败分支 `OpenApiFilter.java:85-91` 中 `authContext` 仍为 `null`，因此 `open_call_log.app_key` / `app_name` 为 NULL 行无法回指任何 `open_app` 行** | 事实 |
| 21 | `open_api.api_path` | `open_call_log.api_path` | `open_api.api_path` → `open_call_log.api_path` | 1:N（**弱引用：无 api_id 列**） | 无 | 写入：`service/OpenApiLogService.java:39` `request.getRequestURI()`；上游 `OpenApiSecurityService.java:365-372` `normalizePath` 去掉尾部 `/` 后与 `open_api.api_path` 精确匹配（`:282`）。`open_call_log` 22 个字段中**没有 `api_id`**（DDL `mysql/init/30-open-api.sql:60-86`），故该关系只能靠路径字符串成立；路径改名/大小写/尾斜杠差异会立即断开映射 | 推断 |
| 22 | `open_app` | `open_api_doc` | `open_app.s_id` → `open_api_doc.app_id` | 1:N（子端可空） | 无 | DDL：`mysql/init/30-open-api.sql:90` `app_id BIGINT NULL`；写入：`controller/OpenDocController.java:70-82` `/admin/open/doc/generate` 把请求参数 `appId` 直接落库；`service/OpenManageService.java:368-373` `saveDoc` 的 insert 列含 `app_id` | 事实 |
| 23 | `open_api` | `open_api_doc` | `open_api.s_id` → `open_api_doc.api_ids` | N:M（**非规范化：逗号分隔字符串，`VARCHAR(500)`**） | 无 | DDL：`mysql/init/30-open-api.sql:93` `api_ids VARCHAR(500) NULL`；写入：`controller/OpenDocController.java:72` 先 `Convert.toLongArray(apiIds)` 解析、`:80` 又把原始字符串 `doc.setApiIds(apiIds)` 存回；读取：`service/OpenManageService.java:375-386` `selectApisByIds` 用 `in (拼接字符串)` 反查。`500` 字符上限意味着最多约 71 个 7 位 ID，超长会被数据库静默截断（MySQL 非严格模式）或报错（PostgreSQL），是唯一一处有长度上限的关系容器 | 事实 |

### 5.3 字典参数簇

| 序号 | 父端（被引用） | 子端（引用方） | 字段对 | 关系类型 | 物理外键 | 证据 | 证据等级 |
|---:|---|---|---|---|---|---|---|
| 24 | `sys_dict_type` | `sys_dict_data` | `sys_dict_type.dict_type`（UNIQUE） → `sys_dict_data.dict_type` | 1:N | 无（`sys_dict_type` 侧有 `unique (dict_type)`，`sys_dict_data` 侧 `dict_type` 无约束无索引） | DDL：`postgres/init/10-qvsu.sql:380-381` `primary key (dict_id), unique (dict_type)`；`mapper/system/SysDictDataMapper.xml:45` `where status='0' and dict_type=#{dictType}`；`:59` `countDictDataByType`；`:92` `update sys_dict_data set dict_type=#{newDictType} where dict_type=#{oldDictType}`（**改类型名靠 SQL 级联改键，不是 FK 级联**，由 `SysDictTypeServiceImpl.java:196-201` 的 `@Transactional` 包住）；`SysDictTypeServiceImpl.java:129` 用 `countDictDataByType > 0` 阻止删除仍被引用的类型 | 事实 |
| 25 | — | `sys_config` | 无表间关系：`config_key` 是应用内配置键，非其他表的引用键 | 无 | 无 | `mapper/system/SysConfigMapper.xml` 全文只有 `sys_config` 单表语句；`framework/web/service/ConfigService.java` 通过 `selectConfigByKey` 消费；`SysLoginService.java:85` 读取 `sys.login.blackIPList`、`SysRegisterController.java:39` 读取 `sys.account.registerUser` 均以字符串键取值 | 事实 |

### 5.4 审计与通知簇

| 序号 | 父端（被引用） | 子端（引用方） | 字段对 | 关系类型 | 物理外键 | 证据 | 证据等级 |
|---:|---|---|---|---|---|---|---|
| 26 | `sys_user` | `sys_user_online` | `sys_user.login_name` → `sys_user_online.login_name` | 1:N（**逻辑外键，应用层未实现关联查询**） | 无 | DDL 两侧均为 `login_name varchar(50)`（`postgres/init/10-qvsu.sql:46`、`:498`）；写入：`framework/manager/factory/AsyncFactory.java:48` `online.setLoginName(session.getLoginName())`，其来源是 `SysShiroService.java:55` 从 `sys_user_online` 反构 `OnlineSession` 后回写。**全仓库没有一条 SQL 以 `login_name` join `sys_user` 与 `sys_user_online`**，因此该关系仅由值域一致成立 | 推断 |
| 27 | `sys_user` | `sys_logininfor` | `sys_user.login_name` → `sys_logininfor.login_name` | 1:N（**弱引用：写入值可为任意用户输入**） | 无 | 写入：`framework/manager/factory/AsyncFactory.java:116` `logininfor.setLoginName(username)`；`framework/shiro/service/SysLoginService.java:59/65/72/88/109` 在验证码错、参数空、长度越界、IP 黑名单、用户不存在等分支都调用 `recordLogininfor`，**其中"用户不存在"分支写入的 `login_name` 一定不指向任何 `sys_user` 行**；`SysPasswordService.java:55/61` 亦同。读取：`mapper/system/SysLogininforMapper.xml:24-43`，仅按 `login_name` 模糊匹配，不 join | 事实 |
| 28 | — | `sys_oper_log` | **无键关系**：`oper_name` / `dept_name` 是写入时快照的文本，不与 `sys_user` / `sys_dept` 建立引用 | 无 | 无 | `framework/aspectj/LogAspect.java:101` `operLog.setOperName(currentUser.getLoginName())`、`:105` `operLog.setDeptName(currentUser.getDept().getDeptName())`；`mapper/system/SysOperLogMapper.xml:33` 把两列以纯文本插入，无 ID 列；用户改名或调部门后历史日志不再可 join | 事实 |
| 29 | — | `sys_notice` | **无表间关系** | 无 | 无 | `mapper/system/SysNoticeMapper.xml` 只有 `sys_notice` 单表 insert/update/delete；`notice_content` 为富文本（MySQL 侧 `longblob`，PostgreSQL 侧 `text`），无引用列 | 事实 |

### 5.5 Quartz 调度簇

| 序号 | 父端（被引用） | 子端（引用方） | 字段对 | 关系类型 | 物理外键 | 证据 | 证据等级 |
|---:|---|---|---|---|---|---|---|
| 30 | `sys_job` | `sys_job_log` | `sys_job.job_name` + `sys_job.job_group` → `sys_job_log.job_name` + `sys_job_log.job_group` | 1:N（**快照式弱引用：`sys_job_log` 无 `job_id` 列**） | 无 | DDL：`sql/quartz.sql:152-162`（`sys_job_log` 8 列，无 `job_id`）；写入：`quartz/util/AbstractQuartzJob.java:78-79` `sysJobLog.setJobName(...)` / `setJobGroup(...)`，`:106` 经 `ISysJobLogService.addJobLog` → `mapper/quartz/SysJobLogMapper.xml:72-78` 插入。`sys_job.job_name` 允许改名（`SysJobMapper.xml:78`），改名后历史日志与新任务定义脱钩 | 事实 |
| 31 | `QRTZ_JOB_DETAILS` | `QRTZ_TRIGGERS` | `(sched_name, job_name, job_group)` → 同名列 | N:1 | 无 | `sql/quartz.sql:18-36`：`QRTZ_TRIGGERS` 含 `job_name`/`job_group` 两列且 `PRIMARY KEY (sched_name, trigger_name, trigger_group)`，与 `QRTZ_JOB_DETAILS` 的 `PRIMARY KEY (sched_name, job_name, job_group)`（`:15`）构成 Quartz 官方 schema 的逻辑外键；DDL 未写 `REFERENCES` | 事实 |
| 32 | `QRTZ_TRIGGERS` | `QRTZ_CRON_TRIGGERS` | `(sched_name, trigger_name, trigger_group)` → 同名列 | 1:1 扩展表 | 无 | `sql/quartz.sql:48-55`，主键与外键列同名同长 | 事实 |
| 33 | `QRTZ_TRIGGERS` | `QRTZ_SIMPLE_TRIGGERS` | 同上 | 1:1 扩展表 | 无 | `sql/quartz.sql:38-46` | 事实 |
| 34 | `QRTZ_TRIGGERS` | `QRTZ_SIMPROP_TRIGGERS` | 同上 | 1:1 扩展表 | 无 | `sql/quartz.sql:109-125`（14 列） | 事实 |
| 35 | `QRTZ_TRIGGERS` | `QRTZ_BLOB_TRIGGERS` | 同上 | 1:1 扩展表 | 无 | `sql/quartz.sql:57-63` | 事实 |
| 36 | `QRTZ_CALENDARS` | `QRTZ_TRIGGERS` | `(sched_name, calendar_name)` → `calendar_name` | 1:N | 无 | `sql/quartz.sql:32` `calendar_name varchar(200) NULL`、`:65-70` `QRTZ_CALENDARS PRIMARY KEY (sched_name, calendar_name)` | 事实 |
| 37 | `QRTZ_TRIGGERS` | `QRTZ_PAUSED_TRIGGER_GRPS` | `trigger_group` → `trigger_group` | 1:N | 无 | `sql/quartz.sql:72-76`，按触发组暂停 | 事实 |
| 38 | `QRTZ_SCHEDULER_STATE` | `QRTZ_FIRED_TRIGGERS` | `(sched_name, instance_name)` → `(sched_name, instance_name)` | 1:N | 无 | `sql/quartz.sql:78-93` `instance_name varchar(200) NOT NULL`、`:95-101` `QRTZ_SCHEDULER_STATE PRIMARY KEY (sched_name, instance_name)` | 事实 |

**Quartz 簇关键事实（影响上述 8 条关系的实际存在性）**：`quartz/config/ScheduleConfig.java` 是空的占位类（全文 14 行，仅注释说明"当前使用 Spring Boot 自动配置的 Scheduler（内存模式）"），`pom.xml:76` 引入 `spring-boot-starter-quartz`，`application.yml` 未设置 `spring.quartz.job-store-type`，因此实际使用 JDBC JobStore 之外的 **RAMJobStore**；对 `open-api/qvsu-openapi/src/main` 全量检索 `QRTZ` / `qrtz` **0 条命中**。结论：`QRTZ_*` 11 张表在运行期既不写也不读，第 31–38 条关系是"DDL 上成立、运行期不生效"的休眠关系；`sys_job` 才是调度定义的权威数据源（`SysJobServiceImpl.java:39-48` 启动时 `scheduler.clear()` 后从 `sys_job` 全量重建触发器）。

## 6. 关系总图（分簇）

以下 ASCII 图按第 4 章的 5 个簇绘制。`-->` 表示逻辑外键（父 → 子），`<->` 表示经关联表的多对多，`-.->` 表示弱引用 / 非规范化引用，`==>` 表示派生列。

### 6.1 系统权限簇（9 张表）

```text
                    +---------------------+
                    |     sys_dept        |
                    | PK dept_id          |
                    |    parent_id  <----+--- (自关联树, parent_id=0 为根)
                    |    ancestors  ====+=== (parent_id 闭包物化路径 "0,100,101")
                    +----------+----------+
                        ^      ^
        dept_id         |      |  dept_id
   (sys_user.dept_id)   |      |  (sys_role_dept.dept_id)
                        |      |
        +---------------+      +----------------+
        |                                       |
+-------+--------+                    +---------+--------+
|   sys_user     |                    |    sys_role      |
| PK user_id     |                    | PK role_id       |
+---+--------+---+                    +--+------------+--+
    |        |                           |            |
    |        | (user_id)                 | (role_id)  | (role_id)
    |        v                           v            v
    |  +-----+-------------+   +---------+------+  +--+--------------+
    |  |  sys_user_role    |   |  sys_role_menu |  |  sys_role_dept  |
    |  | PK(user_id,role_id|   | PK(role_id,   |  | PK(role_id,     |
    |  +-------------------+   |    menu_id)   |  |    dept_id)     |
    |        ^                 +-------+-------+  +-----------------+
    |        | (role_id)               | (menu_id)
    |        |                         v
    |  +-----+------+          +-------+--------+
    |  |  sys_role  |          |    sys_menu    |
    |  +------------+          | PK menu_id     |
    |                          |    parent_id <-+-- (自关联树, parent_id=0 为根)
    |                          +----------------+
    | (user_id)
    v
+---+----------------+
|   sys_user_post    |
| PK(user_id,post_id)|
+---------+----------+
          ^ (post_id)
          |
   +------+-------+
   |   sys_post   |
   | PK post_id   |
   +--------------+
```

合成多对多关系（4 组）：

```text
sys_user <-> sys_role   经 sys_user_role
sys_role <-> sys_menu   经 sys_role_menu
sys_role <-> sys_dept   经 sys_role_dept
sys_user <-> sys_post   经 sys_user_post
```

### 6.2 开放平台业务簇（5 张表）

```text
   +--------------------+                  +--------------------+
   |     open_app       |                  |     open_api       |
   | PK s_id            |                  | PK s_id            |
   | UK app_key         |                  | UK api_path        |
   |    app_secret      |                  |    method          |
   +----+----------+----+                  +----+----------+----+
        |          |                            |          |
        | app_id   |                            | api_id   |
        |          +-----------+   +------------+          |
        |                      v   v                       |
        |            +---------+---+--------+               |
        |            |     open_app_api     |               |
        |            | PK s_id              |               |
        |            | UK (app_id, api_id)  |               |
        |            +----------------------+               |
        |                                                    |
        | app_key (弱引用, 可空)                api_path (弱引用, 字符串)
        |                                                    |
        +----------------+             +---------------------+
                         v             v
                 +-------+-------------+--------+
                 |        open_call_log         |
                 | PK s_id                      |
                 |    trace_id (IDX)            |
                 |    app_key  (IDX, NULL-able) |
                 |    app_name (冗余快照)        |
                 |    api_path (无 IDX)          |
                 |    req_headers/resp_headers  |  <-- 无任何写入方
                 +------------------------------+

   +--------------------+   app_id    +---------------------------+
   |     open_app       +------------>|       open_api_doc        |
   +--------------------+             | PK s_id                   |
                                      |    api_ids VARCHAR(500) --+--. 逗号分隔
   +--------------------+   s_id      |    html_content LONGTEXT  |  | 非规范化
   |     open_api       +------------>+---------------------------+  |
   +--------------------+  <----------------------------------------'
                          (api_ids 字符串内含多个 open_api.s_id)
```

### 6.3 字典参数簇（3 张表）

```text
   +--------------------+                          +--------------------+
   |   sys_dict_type    |   dict_type (逻辑外键)   |   sys_dict_data    |
   | PK dict_id         +------------------------->| PK dict_code       |
   | UK dict_type       |   1:N                    |    dict_type       |
   +--------------------+  (改键靠 UPDATE 级联,    +--------------------+
                          非 FK ON UPDATE CASCADE)

   +--------------------+
   |     sys_config     |  独立表：config_key 只被应用代码读取，
   | PK config_id       |  不与其他 33 张表建立任何关系
   | UK 无 (checkConfig-|
   |    KeyUnique 走    |
   |    SELECT limit 1) |
   +--------------------+
```

### 6.4 审计与通知簇（4 张表）

```text
   +-----------------+        +----------------------+      +-----------------+
   |    sys_user     |        |    sys_oper_log      |      |   sys_notice    |
   | PK user_id      |        | PK oper_id           |      | PK notice_id    |
   | UK? (无, 走      |        |    oper_name  ------+----->|  (无引用列)     |
   |   checkLogin-   |        |    dept_name  ------+--.   +-----------------+
   |   NameUnique)   |        +----------------------+  |
   +--+-----------+--+                                  |  快照文本, 不 join
      |           |        与 sys_user / sys_dept 无键关系
      |           |  login_name (逻辑外键, 无 join 实现)
      |           +------------------------------+
      |                                          v
      |                            +-----------------------+
      |    login_name (弱引用,     |   sys_user_online     |
      |    可指向不存在的用户)      | PK sessionId          |
      +--------------------------->|    login_name         |
                                   |    status / expire_time|
                                   +-----------------------+
                                              |
                                              | 1:N
                                              v
                                   +-----------------------+
                                   |   sys_logininfor      |
                                   | PK info_id            |
                                   |    login_name         |
                                   +-----------------------+
```

### 6.5 Quartz 调度簇（13 张表）

```text
  应用层权威数据源（运行期真实读写）
  +----------------+                +------------------+
  |    sys_job     |  job_name +    |   sys_job_log    |
  | PK job_id      |  job_group     | PK job_log_id    |
  |   (MySQL 侧    +--------------->|  (无 job_id 列)   |
  |    主键为      |  1:N 快照弱引用 +------------------+
  |    job_id,     |
  |    job_name,   |
  |    job_group)  |
  +--------+-------+
           | 启动时 scheduler.clear() 后全量重建（SysJobServiceImpl.init）
           v
  QRTZ_* 11 张表：DDL 存在，运行期零访问（RAMJobStore）

  +----------------+          +-------------------------+
  | QRTZ_JOB_DETAILS|<--------+      QRTZ_TRIGGERS      |
  | PK(sched_name, |  N:1      | PK(sched_name,          |
  |   job_name,    |           |   trigger_name,          |
  |   job_group)   |           |   trigger_group)         |
  +----------------+           +--+-----+-----+-----+----+
                                  |     |     |     |
              1:1 扩展表  +-------+     |     |     +--------+
                          v             v     v              v
              +-----------+--+ +--------+--+ +--+---------+ +--+-----------+
              | QRTZ_CRON_   | | QRTZ_     | | QRTZ_SIM-  | | QRTZ_BLOB_  |
              | TRIGGERS     | | SIMPLE_   | | PROP_TRIG- | | TRIGGERS    |
              |              | | TRIGGERS  | | GERS       | |             |
              +--------------+ +-----------+ +------------+ +-------------+

  +----------------+  1:N  +----------------+      +----------------------+
  | QRTZ_CALENDARS +------>|  QRTZ_TRIGGERS |      | QRTZ_PAUSED_TRIGGER_ |
  | PK(sched_name, |       | calendar_name  |      | GRPS                 |
  |   calendar_name|      +----------------+      | PK(sched_name,       |
  +----------------+       ^  ^                    |    trigger_group)    |
                           |  |  1:N              +----------+-----------+
                           |  |                               |
                           |  |  trigger_group                |  trigger_group
                           |  +-------------------------------+
                           |
  +------------------------+-------+     +---------------------------+
  |    QRTZ_SCHEDULER_STATE        | 1:N |   QRTZ_FIRED_TRIGGERS     |
  | PK(sched_name, instance_name)  +---->| PK(sched_name, entry_id)  |
  |     last_checkin_time          |     |    instance_name / state  |
  +--------------------------------+     +---------------------------+
  +--------------------------------+
  |        QRTZ_LOCKS              |  独立表：悲观锁（sched_name, lock_name）
  +--------------------------------+
```

## 7. 非规范化与快照关系

| 序号 | 位置 | 形态 | 影响 | 证据等级 |
|---:|---|---|---|---|
| N1 | `open_call_log.app_name` | 写入时快照 `open_app.app_name` | `open_app` 改名后历史日志仍显示旧名；`OpenManageService.java:354` 的今日 TOP5 统计 `group by app_name` 会把同一应用的不同历史名算作两组 | 事实 |
| N2 | `open_call_log.api_path` / `method` | 写入时快照请求 URI 与方法，无 `api_id` | 无法用外键或 ID 反查 `open_api`；`open_api.api_path` 改名后历史日志与新定义脱钩 | 事实 |
| N3 | `open_api_doc.api_ids` | `VARCHAR(500)` 逗号串 | 破坏第一范式；长度上限约束关系基数（约 71 个 7 位 ID）；解析失败静默返回空（`OpenManageService.java:376-380` 对 `null`/空返回 `emptyList`） | 事实 |
| N4 | `sys_oper_log.oper_name` / `dept_name` | 写入时快照登录名与部门名 | 无 ID 列，无法 join；重名部门/改名用户无法追溯 | 事实 |
| N5 | `sys_job_log.job_name` / `job_group` / `invoke_target` | 写入时快照 | 无 `job_id`；`sys_job` 改名后日志与新定义脱钩 | 事实 |
| N6 | `sys_dept.ancestors` | `parent_id` 闭包的物化路径 | 插入/移动部门时必须由 `SysDeptServiceImpl` 同步重算；`DataScopeAspect.java:136` 与 `SysDeptMapper.xml:82` 用了两套不同的字符串匹配函数（见第 9 章） | 事实 |
| N7 | `sys_user.login_ip` / `login_date` | 由登录流程高频覆盖的"最后值"列 | 只保留最后一次，无法追溯历史（历史在 `sys_logininfor`） | 事实 |
| N8 | `sys_job_log.job_message` | 把执行耗时编码进中文字符串（`AbstractQuartzJob.java:91`） | `SysJobLog.startTime` / `endTime` 在 `quartz/domain/SysJobLog.java:47-50` 声明但 `sys_job_log` 表只有 8 列，**这两个字段不落库**，耗时只能从 `job_message` 文本里解析 | 事实 |

## 8. 数据血缘

### 8.1 `open_call_log`（网关调用日志）

**写入来源（唯一入口）**：

| 环节 | 落点 | 说明 |
|---|---|---|
| 1 | `open/qvsu-openapi/src/main/java/com/qvsu/open/filter/OpenApiFilter.java:42-45` | `OncePerRequestFilter.shouldNotFilter` 只放行 URI 以 `/open/` 开头的请求；其他 URI 完全不写日志 |
| 2 | `OpenApiFilter.java:53-57` | `traceId` 取请求头 `X-Trace-Id`，缺失时 `UUID.randomUUID()`；`:69` 回写响应头 |
| 3 | `OpenApiFilter.java:80-84` | 鉴权通过 → 转发；`:85-91` 鉴权失败（`OpenApiSecurityException`）→ `status = 1`；`:92-98` 其他异常 → `status = 2` |
| 4 | `OpenApiFilter.java:99-126` | `finally` 块**无条件**调用 `openApiLogService.save(...)` |
| 5 | `service/OpenApiLogService.java:29-55` | `insert into open_call_log(trace_id, app_key, app_name, api_path, method, req_body, resp_code, resp_body, cost_ms, status, error_msg, client_ip, call_time) values(...)`；`:20` `TEXT_MAX_LENGTH = 4000`，`:57-64` `cut()` 把 `req_body`、`resp_body`、`error_msg` 截断到 4000 字符 |

**血缘特征与缺陷**：

| 序号 | 事实 | 证据等级 |
|---:|---|---|
| L1 | 插入语句只覆盖 13 列，`open_call_log` 22 列中的 `req_headers`、`resp_headers`、`update_time`、`s_status`、`s_is_del`、`s_created_time`、`s_updated_time`、`s_id` 由 DDL 默认值填充 | 事实 |
| L2 | `req_headers` / `resp_headers` **在任何 Java 代码中都不出现**（全仓库检索 `req_headers` 仅命中 DDL 与 `sql/open_call_log_headers_upgrade.sql`），是彻底的死列；`sql/open_call_log_headers_upgrade.sql` 用 MySQL 专有语法 `ADD COLUMN ... AFTER method` 追加，PostgreSQL 无法执行 | 事实 |
| L3 | `status` 三值语义来自 `OpenApiFilter`：`0=成功`、`1=鉴权失败`、`2=代理或系统异常`；与 DDL 注释 `0=ok 1=auth-fail 2=proxy-fail`（`mysql/init/30-open-api.sql:73`）一致 | 事实 |
| L4 | 鉴权失败行 `app_key`/`app_name` 为 NULL，因为 `authContext` 只在鉴权成功后赋值（`OpenApiFilter.java:81`）；因此按 `app_key` 过滤会漏掉全部鉴权失败记录 | 事实 |
| L5 | 写入无事务包裹、异常被 `catch (Exception ex)` 吞掉只记 error 日志（`OpenApiLogService.java:51-54`），日志丢失不会影响主链路 | 事实 |

**读取方**：

| 读取方 | 语句 | 证据等级 |
|---|---|---|
| `OpenLogController.list`（`/admin/open/log/list`） | `OpenManageService.java:283-328` `selectLogList`：支持 `trace_id`、`app_key`、`api_path like`、`status`、`call_time` 区间，`order by s_id desc` | 事实 |
| `OpenLogController.stats`（`/admin/open/log/stats`） | `OpenManageService.java:339-357` `queryLogStatsToday`：`where call_time::date = current_date`（**PostgreSQL 专有 `::` 转型**），别名 `totalCalls`/`successCalls`/`avgCost` 未加引号，依赖 PostgreSQL 折叠为小写 | 事实 |
| `OpenLogController.exportCsv`（`/admin/open/log/exportCsv`） | `OpenLogController.java:58-116`：复用 `selectLogList`，输出 13 列 CSV（含 `reqBody`、`respBody`），带 UTF-8 BOM | 事实 |
| 列表模板 | `resources/templates/open/log/index.html`（见 [接口清单](./interface-index.md) 中调用日志页面的路由登记） | 推断 |

### 8.2 `sys_oper_log`（操作日志，AOP 写入）

| 环节 | 落点 | 说明 |
|---|---|---|
| 1 | `framework/aspectj/LogAspect.java:56-57` | `@Before("@annotation(controllerLog)")` 记录起始时间到 `ThreadLocal` |
| 2 | `LogAspect.java:67-71` / `:79-83` | `@AfterReturning` 与 `@AfterThrowing` 两个切点都进入 `handleLog` |
| 3 | `LogAspect.java:85-126` | 组装 `SysOperLog`：`operIp`（`ShiroUtils.getIp()`）、`operUrl`（截 255）、`operName`/`deptName`（当前登录用户）、`method`（`类名.方法名()`）、`requestMethod`、`businessType`/`title`/`operatorType`（来自 `@Log` 注解）、`operParam`（截 2000）、`jsonResult`（截 2000）、`costTime` |
| 4 | `LogAspect.java:45` | `EXCLUDE_PROPERTIES = { "password", "oldPassword", "newPassword", "confirmPassword" }`，请求参数序列化时排除这些属性 |
| 5 | `LogAspect.java:125` | `AsyncManager.me().execute(AsyncFactory.recordOper(operLog))` —— **异步写入** |
| 6 | `framework/manager/factory/AsyncFactory.java:69-81` | 异步任务内先 `AddressUtils.getRealAddressByIP(operIp)` 补 `operLocation`，再调 `ISysOperLogService.insertOperlog` |
| 7 | `system/service/impl/SysOperLogServiceImpl.java:30` → `mapper/system/SysOperLogMapper.xml:32-35` | `insert into sys_oper_log(...16 列..., oper_time) values (..., now())` |

写入触发点：只有标注了 `@Log` 的 Controller 方法才产生记录；`OpenAppController.java:55/72/82/91`、`OpenApiMgrController.java:75/91/100` 是开放平台侧的实际触发点。**`OpenAuthController`（授权保存）与 `OpenLogController`（日志查询/导出）没有 `@Log` 注解，因此"谁改了授权关系""谁导出了调用日志"不会被记录**（证据：`controller/OpenAuthController.java` 与 `controller/OpenLogController.java` 全文无 `@Log`）。

读取方：`SysOperLogServiceImpl.selectOperLogList` / `selectOperLogById` / `deleteOperLogByIds` / `cleanOperLog`（`cleanOperLog` 执行 `truncate table sys_oper_log`，`SysOperLogMapper.xml:82-84`）。**但 `web/controller/system/` 下不存在 `SysOperLogController`**（同目录只有 Captcha/Config/Dept/DictData/DictType/Index/Login/Menu/Notice/Post/Profile/Register/Role/User 共 14 个 Controller），且 `deploy/local-docker/mysql/init/40-open-api-menu.sql:82-90` 显式删除了 `monitor:operlog:*` 权限的菜单与其 `sys_role_menu` 授权。结论：`sys_oper_log` 有写入、有 Mapper、有清空语句，但**没有可达的 UI 入口与查询接口**。

### 8.3 `sys_logininfor`（登录日志）

| 环节 | 落点 | 说明 |
|---|---|---|
| 1 | `framework/shiro/service/SysLoginService.java:59/65/72/80/88/109/115/121` | 验证码错误、用户名或密码为空、密码长度越界、用户名长度越界、IP 黑名单命中、用户不存在、用户已删除、用户已停用 —— 8 个失败分支各记录一条 |
| 2 | `SysLoginService.java:127` | 成功后记录 `Constants.LOGIN_SUCCESS` |
| 3 | `framework/shiro/service/SysPasswordService.java:55/61` | 密码重试超限、密码不匹配 2 个分支 |
| 4 | `framework/manager/factory/AsyncFactory.java:92-135` | 异步任务：取 `User-Agent` 头解析 `browser`/`os`，`AddressUtils.getRealAddressByIP(ip)` 补 `login_location`，同时把同一份信息打到名为 `sys-user` 的 logger（`:109`） |
| 5 | `AsyncFactory.java:123-130` | 状态映射：`LOGIN_SUCCESS`/`LOGOUT`/`REGISTER` → `SUCCESS`；`LOGIN_FAIL` → `FAIL` |
| 6 | `AsyncFactory.java:132` → `system/service/impl/SysLogininforServiceImpl.java:31` → `mapper/system/SysLogininforMapper.xml:19-22` | `insert into sys_logininfor (login_name, status, ipaddr, login_location, browser, os, msg, login_time) values (..., now())` |

`logout` 与 `register` 也会写（`AsyncFactory.java:123` 的 `Constants.LOGOUT` / `Constants.REGISTER` 分支），因此 `sys_logininfor` 的语义是"认证类事件流"而非严格意义的登录流水。

读取方与 `sys_oper_log` 同构：`SysLogininforServiceImpl` 提供 list/delete/clean（`cleanLogininfor` → `truncate table sys_logininfor`），但**没有 `SysLogininforController`**，且 `40-open-api-menu.sql:82-90` 删除了全部 `monitor:logininfor:*` 菜单。同样属于"有表、有 DAO、无入口"。

### 8.4 `sys_user_online`（在线会话投影）

| 环节 | 落点 | 说明 |
|---|---|---|
| 1 | `framework/shiro/session/OnlineSessionDAO.java:67-101` `syncToDb` | 由 `shiro.session.dbSyncPeriod: 1`（分钟，`application.yml:121`）与"属性变更"两个条件决定是否需要落库；`:100` 交给 `AsyncFactory.syncSessionToDb` |
| 2 | `framework/manager/factory/AsyncFactory.java:38-61` | 把 `OnlineSession` 投影成 `SysUserOnline`：`sessionId`、`loginName`、`deptName`、`ipaddr`、`loginLocation`（IP 反查）、`browser`、`os`、`status`、`startTimestamp`、`lastAccessTime`、`expireTime` |
| 3 | `system/mapper/SysUserOnlineMapper.xml:31-45` | `insert ... on conflict (sessionId) do update set ... excluded.*` —— **PostgreSQL UPSERT 语法**，MySQL 需改写为 `ON DUPLICATE KEY UPDATE` |
| 4 | 读取（会话恢复） | `framework/shiro/service/SysShiroService.java:39-43` `getSession` → `selectOnlineById`；`:45-61` `createSession` 把行反构回 `OnlineSession`。即 `sys_user_online` 是 Shiro 会话的**实际持久化载体**，`OnlineSessionDAO.doReadSession`（`:52-56`）直连它 |
| 5 | 删除 | `OnlineSessionDAO.doDelete`（`:107-116`）→ `SysShiroService.deleteSession`（`:28-31`）→ `deleteOnlineById`；`framework/shiro/web/session/OnlineWebSessionManager.java:96-168` `validateSessions` 扫描 `last_access_time <= 过期基准` 的行并 `batchDeleteOnline` |
| 6 | 无直接删除入口 | 没有 `SysUserOnlineController`，`forceLogout`（`SysUserOnlineServiceImpl.java:105-108`）与 `batchDeleteOnline`（`:65-75`）都只被框架内部调用 |

一致性风险（同时见 [数据归属](./data-ownership.md) 第 4 章）：会话真值在 Shiro 的 `EhCacheManager` 缓存（`OnlineSessionDAO extends EnterpriseCacheSessionDAO`），`sys_user_online` 是**最多滞后 `dbSyncPeriod` 分钟的投影**；`AsyncFactory.syncSessionToDb` 在异步线程执行，写入失败只打日志，会产生"DB 有行但缓存已过期"或"缓存有会话但 DB 无行"的双向不一致。因为 `shiro.session.maxSession: -1`（`application.yml:125`，不限并发会话）与 `kickoutAfter: false`（`:127`），该表无上界增长压力。

### 8.5 `sys_job_log`

| 环节 | 落点 | 说明 |
|---|---|---|
| 1 | `quartz/util/AbstractQuartzJob.java:33-53` | Quartz `Job.execute` 统一编排：`before` 记开始时间 → `doExecute` → `after` |
| 2 | `AbstractQuartzJob.java:72-113` | `after` 组装 `SysJobLog`：`jobName`、`jobGroup`、`invokeTarget`（HTTP 类型任务改写为 `requestMethod + " " + requestUrl`，`:83-86`）、`jobMessage`（中文耗时文本）、`status`、`exceptionInfo`（截 2000） |
| 3 | `AbstractQuartzJob.java:106` | `SpringUtils.getBean(ISysJobLogService.class).addJobLog(sysJobLog)`；`:104-112` 外层 try/catch，写日志失败不影响任务本身 |
| 4 | `quartz/service/impl/SysJobLogServiceImpl.java:52-55` → `mapper/quartz/SysJobLogMapper.xml:72-78` | `insert into sys_job_log(job_name, job_group, invoke_target, job_message, status, exception_info, create_time) values (..., now())` |

`sys_job_log` 的爆发源是 `sys_job` 中 `status='1'`（暂停）之外的启用任务；`sql/quartz.sql:232-242` 种子包含 3 个每 10/15/20 秒触发的默认任务，但种子把它们的 `status` 都置为 `'1'`（暂停），因此开箱状态下 `sys_job_log` 不增长。读取方为 `SysJobLogController`（`/monitor/jobLog`，复用 `monitor:job:view/list/export/remove/detail` 权限）；**`sys_menu` 中没有任何 `/monitor/jobLog` 或 `monitor:jobLog:*` 记录**（全量检索 `open-api/**/*.sql` 的 `monitor:jobLog` 与 `/monitor/jobLog` 均 0 命中），故该页面属于"有 Controller、无菜单"的不可达功能。

### 8.6 `open_api_doc.html_content`（文档快照）

`OpenDocController.generate`（`controller/OpenDocController.java:68-85`）在生成文档时把 `ApiDocService.generateHtml` 的完整 HTML 字符串落库到 `open_api_doc.html_content`（`service/OpenManageService.java:368-373`）。该 HTML 由 `open/doc/ApiDocService.java` 现场拼接，并会把示例应用的 **appSecret 参与计算的签名** 写进 `curl` 示例（`ApiDocService.java:139-148`：`X-Sign` 头值由 `buildRequestSign(appKey, appSecret, ...)` 生成）。因此 `open_app.app_secret` 的血缘下游不止鉴权链路，还包括 `open_api_doc.html_content` 与 `/admin/open/doc/download` 导出的 HTML 文件。证据等级：事实（代码路径直接可读）。

## 9. MySQL 与 PostgreSQL 两套 DDL 的方言差异

主库为 PostgreSQL 11（`application.yml` 默认 `jdbc:postgresql://localhost:5432/jd_openapi`），同时提供 MySQL 方言脚本，并且 `deploy/local-docker` 下两套 `init/*.sql` 平行维护。

### 9.1 类型与自增

| 序号 | 对象 | MySQL 写法 | PostgreSQL 写法 | 差异性质 | 证据等级 |
|---:|---|---|---|---|---|
| D1 | 全部主键（除 `QRTZ_*`） | `bigint(20) not null auto_increment` | `bigint not null GENERATED BY DEFAULT AS IDENTITY` | 类型族一致、生成策略不同。**PG 身份列不会因种子脚本显式插入 ID 而推进序列**：`deploy/local-docker/postgres/init/10-qvsu.sql:27-36,71-72,97-102,126-129,158-218` 全部显式插入 ID 却不调 `setval`，只有 `postgres/init/35-quartz.sql:246` 为 `sys_job` 补了 `setval`；MySQL 侧 `auto_increment=200/100/2000` 的写法本身能避开该问题 | 事实 |
| D2 | `sys_config.config_id` | `int(5)` | `integer` | 一致 | 事实 |
| D3 | `sys_notice.notice_id` | `int(4)` | `integer` | 一致 | 事实 |
| D4 | 全部时间列 | `datetime` / `datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` | `timestamp` / `timestamp DEFAULT CURRENT_TIMESTAMP` | **PG 侧没有 `ON UPDATE CURRENT_TIMESTAMP`**，`update_time` 必须由应用显式 `now()` 维护（如 `SysMenuMapper.xml:152`） | 事实 |
| D5 | `open_*.status` / `need_sign` / `s_status` / `s_is_del` | `TINYINT` | `smallint` | 宽度语义等价 | 事实 |
| D6 | `sys_notice.notice_content` | `longblob` | `text` | **类型族不同**：MySQL 存二进制对象，PG 存字符；富文本公告在 MySQL 侧按字节存取 | 事实 |
| D7 | `QRTZ_JOB_DETAILS.job_data` / `QRTZ_TRIGGERS.job_data` / `QRTZ_BLOB_TRIGGERS.blob_data` / `QRTZ_CALENDARS.calendar` | `blob` | `bytea` | 二进制类型名不同 | 事实 |
| D8 | `QRTZ_TRIGGERS.misfire_instr` | `smallint(2)` | `smallint` | 一致 | 事实 |
| D9 | `QRTZ_SIMPROP_TRIGGERS.dec_prop_1/2` | `numeric(13,4)` | `numeric(13,4)` | 一致 | 事实 |
| D10 | 全部表 | `) engine=innodb auto_increment=N comment='...'` | 无 | MySQL 侧有存储引擎、自增起始值与表注释；PG 侧三者全无 | 事实 |
| D11 | 列注释 | 每列 `comment '...'`（中文） | 无列注释 | **PG 侧丢失全部中文列语义**，`database-schema.md` 的字段含义只能从 MySQL 副本或 Java 字段名取得 | 事实 |
| D12 | 时间函数 | `sysdate()`（种子数据）/ `NOW()` / `CURRENT_TIMESTAMP` | `now()` | 种子脚本两种写法并存；PG 不支持 `SYSDATE()`，`sql/quartz.sql:166` 等使用 `SYSDATE()` 的脚本不能直接在 PG 执行 | 事实 |

### 9.2 约束与索引

| 序号 | 对象 | MySQL | PostgreSQL | 差异性质 | 证据等级 |
|---:|---|---|---|---|---|
| D13 | `sys_job` 主键 | `PRIMARY KEY (job_id, job_name, job_group)`（`sql/quartz.sql:149`） | `PRIMARY KEY (job_id)`（`postgres/init/35-quartz.sql:147`） | **主键定义不一致**：MySQL 允许"同 job_id 多行"，PG 禁止；同一份业务代码在两侧的插入/更新语义不同 | 事实 |
| D14 | `open_call_log` 索引 | `INDEX idx_trace_id (trace_id)`、`INDEX idx_app_key (app_key)`、`INDEX idx_call_time (call_time)` | **无任何索引** | PG 侧全部丢失，调用日志表的三个核心查询维度退化为全表扫描 | 事实 |
| D15 | `sys_oper_log` 索引 | `key idx_sys_oper_log_bt (business_type)`、`idx_sys_oper_log_s (status)`、`idx_sys_oper_log_ot (oper_time)` | **无** | 同上 | 事实 |
| D16 | `sys_logininfor` 索引 | `key idx_sys_logininfor_s (status)`、`idx_sys_logininfor_lt (login_time)` | **无** | 同上 | 事实 |
| D17 | `open_app_api` 唯一约束 | 具名 `UNIQUE KEY uk_app_api (app_id, api_id)` | 无名 `UNIQUE (app_id, api_id)` | 约束等价，但 PG 侧约束名由系统生成，脚本无法按名引用 | 事实 |
| D18 | `sys_dict_type` 唯一约束 | `unique (dict_type)` | `unique (dict_type)` | 一致 | 事实 |
| D19 | 全部表 | 0 个 `FOREIGN KEY` | 0 个 `FOREIGN KEY` | 一致（两侧都无引用完整性） | 事实 |

### 9.3 SQL 语句与脚本层的方言依赖（最严重的同步风险）

| 序号 | 位置 | 方言归属 | 说明 | 证据等级 |
|---:|---|---|---|---|
| D20 | `mapper/system/SysUserMapper.xml:79,82`、`SysRoleMapper.xml:55,58`、`SysDictTypeMapper.xml:36,39`、`SysConfigMapper.xml:54,57`、`quartz/SysJobLogMapper.xml:39,42` | **仅 PostgreSQL** | `to_char(x,'YYYYMMDD') >= to_char(cast(? as timestamp),'YYYYMMDD')` —— MySQL 无 `to_char`/`cast(... as timestamp)` | 事实 |
| D21 | `mapper/system/SysUserOnlineMapper.xml:34-44` | **仅 PostgreSQL** | `on conflict (sessionId) do update set ... excluded.*` | 事实 |
| D22 | `service/OpenManageService.java:276` | **仅 PostgreSQL** | `insert into open_app_api(...) ... on conflict (app_id, api_id) do update set update_time=now()` | 事实 |
| D23 | `service/OpenManageService.java:345`、`:354` | **仅 PostgreSQL** | `call_time::date = current_date`、`avg(cost_ms)::numeric` —— `::` 转型 MySQL 不支持 | 事实 |
| D24 | `mapper/system/SysDeptMapper.xml:82,86` | **仅 PostgreSQL** | `position(',' \|\| #{deptId} \|\| ',' in ',' \|\| ancestors \|\| ',') > 0` —— `position(x in y)` 与 `\|\|` 拼接 MySQL 均不支持 | 事实 |
| D25 | `framework/aspectj/DataScopeAspect.java:136` | **仅 MySQL** | `find_in_set({}, ancestors)` —— PG 无 `find_in_set`；该分支在 `data_scope='4'`（本部门及以下）时生效。种子数据中 `sys_role.data_scope` 只有 `'1'` 与 `'2'`，因此是潜在缺陷而非当前故障 | 事实 |
| D26 | `framework/aspectj/DataScopeAspect.java:123,127` | 双方言 | `SELECT dept_id FROM sys_role_dept WHERE role_id ...` —— 子查询通用 | 事实 |
| D27 | `mapper/system/SysUserMapper.xml:142,146`、`SysRoleMapper.xml:76,81`、`SysMenuMapper.xml:134`、`SysDeptMapper.xml:71`、`SysDictTypeMapper.xml:60`、`SysPostMapper.xml:59,64`、`SysConfigMapper.xml:69`、`service/OpenApiSecurityService.java:243,282,303` | 双方言 | `limit 1` —— MySQL 与 PG 均支持 | 事实 |
| D28 | `mapper/**/*.xml` 全部 | 双方言 | `concat('%', #{x}, '%')` —— MySQL 原生、PG 9.1+ 支持 | 事实 |
| D29 | `sql/open_api_httpbin_min_seed.sql:10-15,26-31` | **仅 MySQL** | `ON DUPLICATE KEY UPDATE` + `VALUES(col)` 函数 | 事实 |
| D30 | `sql/open_call_log_headers_upgrade.sql:2-3` | **仅 MySQL** | `ALTER TABLE ... ADD COLUMN ... AFTER method` —— PG 无 `AFTER` 子句 | 事实 |
| D31 | `deploy/local-docker/mysql/init/31-open-api-compat.sql:4-21`（与 `open-api/sql/open_api_compat_upgrade.sql` 内容一致） | **仅 MySQL** | 用 `CREATE PROCEDURE` + `information_schema.COLUMNS` + `PREPARE/EXECUTE` 实现幂等加列 | 事实 |
| D31b | `deploy/local-docker/postgres/init/31-open-api-compat.sql:3-31` | **仅 PostgreSQL** | 用 31 条 `ALTER TABLE IF EXISTS ... ADD COLUMN IF NOT EXISTS ...` 实现同样的幂等加列，**两侧脚本形式完全不同**（过程式 vs 声明式），后续任一侧新增 `s_*` 列都必须手工同步两份；两份的 5 张表 5×5 列清单目前一致 | 事实 |
| D31c | `deploy/local-docker/postgres/init/50-open-api-seed.sql:11,15,19,23,27,31,35,39,43` | 数据内容差异 | PG 种子的 `description` 是**双重编码乱码**（形如 `GET 鏌ヨ鍙傛暟绀轰緥`），MySQL 种子 `50-open-api-seed.sql:13,17,...` 中文正常；且 PG 种子把 `target_url` 指向 `http://127.0.0.1:5656/selftest/httpbin/*`（自己），MySQL 种子指向 `https://httpbin.org/*`（外网），两侧自检链路的实际行为不同 | 事实 |
| D31d | `deploy/local-docker/postgres/init/40-open-api-menu.sql` 与 `mysql/init/40-open-api-menu.sql` | 数据内容差异 | 两者的 `DELETE`/`INSERT` 结构与 ID 范围（2100–2150、108/109/111-113/500/501/1039-1049、3/114-116/1057-1061）完全一致，但 PG 副本的菜单中文名同样乱码（与共享上下文中记录的 `application.yml` 双重编码问题同源） | 事实 |
| D32 | `pom.xml` 依赖 | **仅 PostgreSQL** | 只有 `org.postgresql:postgresql`（`:78`），**没有 MySQL 驱动依赖**；`application.yml:89` `pagehelper.helperDialect: postgresql` | 事实 |

### 9.4 同步维护风险评估

| 序号 | 风险 | 说明 | 证据等级 |
|---:|---|---|---|
| R1 | 双份 DDL 已出现实质漂移 | `sys_job` 主键（D13）、`open_call_log`/`sys_oper_log`/`sys_logininfor` 索引（D14–D16）、`sys_notice.notice_content` 类型（D6）三处已经不同；说明"两份脚本平行维护"已经失效 | 事实 |
| R2 | MySQL 路径不可运行 | 即使补齐 DDL，`pom.xml` 无 MySQL 驱动（D32），且 12 处 Mapper SQL 是 PG 专有（D20–D24），启动后一旦触发列表查询即报错；`open_api_httpbin_min_seed.sql` 的 `ON DUPLICATE KEY UPDATE` 又与 D22 的 `on conflict` 互相矛盾 | 事实 |
| R3 | 反向不可运行 | 若以 PostgreSQL 为准，`DataScopeAspect.java:136` 的 `find_in_set`（D25）与 `sql/quartz.sql` 的 `SYSDATE()`（D12）在 PG 上失败 | 事实 |
| R4 | 注释与索引只在 MySQL 侧 | PG 侧丢失全部列中文注释（D11）与 6 个查询索引（D14–D16），而生产库是 PG，等于"文档写得最全的副本不是运行的那一份" | 事实 |
| R5 | `s_create_by` / `s_update_by` 是"代码里有、两套 DDL 里都没有"的幽灵列 | `open-api/sql/open_api.sql`、`mysql/init/30-open-api.sql`、`postgres/init/30-open-api.sql`、两份 `31-open-api-compat.sql` 共 5 份脚本均无这两列；`OpenAppController.java:61` 仍调用 `app.setsCreateBy(getLoginName())`（见 [数据归属](./data-ownership.md) 第 4 章） | 事实 |
| R6 | 缺少单一事实源 | `open-api/sql/*.sql` 与 `deploy/local-docker/{mysql,postgres}/init/*.sql` 是两组人工同步的副本，无迁移工具（Flyway/Liquibase）参与 | 事实 |

## 10. 存疑项与待确认

| 序号 | 存疑内容 | 现有证据 | 需要的动作 |
|---:|---|---|---|
| Q1 | `open_call_log.api_path` 与 `open_api.api_path` 是否在所有部署形态下严格相等 | `OpenApiSecurityService.normalizePath` 只去尾部 `/`；网关端口/context-path 变化会改变 `getRequestURI()` 的形态 | 在生产网关上比对 `open_call_log.api_path` 去重集合与 `open_api.api_path` 集合的差集 |
| Q2 | `sys_user_online` 行数是否长期显著偏离 Shiro 缓存中的活跃会话数 | `dbSyncPeriod=1` 分钟、`AsyncFactory` 异步写、写失败仅记日志 | 生产采样比对 ehcache `shiro-activeSessionCache` 条目数与 `select count(*) from sys_user_online` |
| Q3 | `sys_role_menu` 中孤儿 `menu_id` 的实际数量（序号 4 的缺陷） | `SysMenuMapper.deleteMenuById` 不级联删 `sys_role_menu`；种子脚本 `40-open-api-menu.sql:4-5,65-108` 却成对 DELETE | 执行 `select count(*) from sys_role_menu rm left join sys_menu m on rm.menu_id=m.menu_id where m.menu_id is null` |
| Q4 | `sys_job` 在 MySQL 侧 `PRIMARY KEY (job_id, job_name, job_group)` 是否曾被真实使用 | 两套 DDL 主键不一致，代码只用 `job_id` 定位（`SysJobMapper.xml:61,96`） | 确认历史部署是否使用过 MySQL 方言 |
| Q5 | `req_headers` / `resp_headers` 是否计划由未来的追踪组件写入 | 全仓库仅 DDL 与 upgrade 脚本出现该列名，`sql/open_call_log_headers_upgrade.sql` 只做加列 | 确认该升级脚本的引入背景与后续写入计划 |
| Q6 | `open_api_doc` 是否有生产数据、`html_content` 平均体积 | 表由 `open_api.sql` 建出；`html_content LONGTEXT`（MySQL）/ `text`（PG）；生成入口 `OpenDocController.generate` 无分页、列表接口 `selectDocList` 一次全取 | 采样统计行数与平均/最大 `html_content` 长度 |
