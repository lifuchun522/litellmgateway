# 数据归属与写入冲突（data-ownership）

本文件登记 QVSU OpenAPI 管理与网关服务（精简化单体 Spring Boot 应用）34 张唯一物理表的**主写所有者**、其他写入方、读取方、多写冲突判定、逻辑删除策略与审计字段，并给出冲突风险清单、数据生命周期与敏感数据清单。

- 表间字段级关系与血缘：见 [数据关系与血缘](./database-relations.md)。
- 表清单与物理对象登记：见 [表清单](./database-inventory.md)。
- 稳定标识与业务含义主定义：见 [表主定义](./database-model.md)。
- 逐字段类型、可写性、写入来源：见 [字段设计](./database-schema.md)。
- 功能 / 接口 / DAO 到表的 R/C/U/D 矩阵：见 [数据访问矩阵](./database-access-matrix.md)。

## 1. 证据与判定口径

| 项目 | 口径 |
|---|---|
| 主写所有者 | 触发该表 INSERT/UPDATE/DELETE 的**权威代码路径**。若存在 SQL 种子脚本，种子单独标注为"初始化写入方" |
| 其他写入方 | 除主写所有者之外的写入来源（含跨 Service 写同一张表、AOP/异步线程、种子脚本、幂等升级脚本） |
| 读取方 | 有 SELECT 语句或结果集映射消费者 |
| 多写冲突 | 判定为"有"的条件：两个及以上互不感知的代码路径能写同一行的同一列；或初始化脚本与运行期代码可互相覆盖；判定为"无"表示所有写入都经单一事务化入口 |
| 证据等级 | `事实`（直接读源码）/ `推断`（多处证据推出）/ `假设`（待确认） |
| 逻辑删除 | `sys_user`、`sys_role`、`sys_dept` 使用 `del_flag`（`'0'` 存在 / `'2'` 删除）；`open_*` 5 张表有 `s_is_del` 列但**无任何代码读写**；其余表为物理删除 |

## 2. 归属总览

| 指标 | 数量 | 说明 |
|---|---:|---|
| 唯一物理表 | 34 | 见 [表清单](./database-inventory.md)；分簇与稳定标识见 [数据关系与血缘](./database-relations.md) 第 4 章 |
| 有应用代码写入方的表 | 23 | 5 张 `open_*` + 18 张 `sys_*`（`sys_user`、`sys_role`、`sys_menu`、`sys_dept`、`sys_post`、`sys_user_role`、`sys_role_menu`、`sys_role_dept`、`sys_user_post`、`sys_oper_log`、`sys_logininfor`、`sys_user_online`、`sys_notice`、`sys_dict_type`、`sys_dict_data`、`sys_config`、`sys_job`、`sys_job_log`） |
| 有 SQL 种子脚本写入方的表 | 17 | `sys_dept`、`sys_user`、`sys_post`、`sys_role`、`sys_menu`、`sys_user_role`、`sys_role_menu`、`sys_role_dept`、`sys_user_post`、`sys_dict_type`、`sys_dict_data`、`sys_config`、`sys_notice`、`sys_job`（14 张）+ `open_app`、`open_api`、`open_app_api`（3 张）。这 17 张**同时**有应用代码写入方，即全部属于"双轨维护"候选 |
| 仅靠种子脚本维护、无应用写入方的表 | 0 | 不存在"只由 SQL 维护"的表 |
| **零写入方（休眠表）** | 11 | 全部 `QRTZ_*`（证据见 3.5 末段） |
| 有逻辑删除（`del_flag`）的表 | 3 | `sys_user`、`sys_role`、`sys_dept` |
| 有 `s_is_del` / `s_status` 列但应用代码零访问的表 | 5 | `open_app`、`open_api`、`open_app_api`、`open_call_log`、`open_api_doc` |
| 缺 `create_by` / `update_by` 物理列的表 | 23 | 4 张关联表 + `sys_oper_log` + `sys_logininfor` + `sys_user_online` + 5 张 `open_*` + 11 张 `QRTZ_*` |
| 存在多写 / 双写冲突的表 | 12 | `sys_menu`、`sys_role_menu`、`sys_user_role`、`sys_role_dept`、`sys_user_post`、`sys_user_online`、`sys_dept`、`sys_dict_data`、`sys_config`、`open_app`、`open_api`、`open_app_api`（逐条见 4.2） |
| 有写入方但无读取界面的表 | 4 | `sys_oper_log`、`sys_logininfor`、`sys_user_online`、`sys_job_log`（见 4.1） |

## 3. 逐表归属登记

### 3.1 系统权限簇（9 张）

| 物理表 | 主写所有者（权威写入方） | 其他写入方 | 读取方 | 多写冲突 | 逻辑删除字段与策略 | 审计字段 |
|---|---|---|---|---|---|---|
| `TBL-sys_user` | `com.qvsu.system.service.impl.SysUserServiceImpl`（`insertUser`:221、`registerUser`:239、`updateUser`:253、`insertUserAuth`:312、`insertUserRole`:336、`insertUserPost`:361、`updateUserAvatar`:286、`updateLoginInfo`:299、`resetUserPwd`:325、`deleteUserById`:183、`deleteUserByIds`:198、`updateUserStatus`:593、`importUser`:528-550） | ① `framework/shiro/service/SysRegisterService.java:71` `registerUser`（注册入口）；② `web/controller/system/SysProfileController.java:92`（改密）与 `:165`（改头像）；③ `framework/shiro/service/SysLoginService.java:182` `recordLoginInfo` 写 `login_ip`/`login_date`；④ 无幂等迁移升级脚本；⑤ 种子 `deploy/local-docker/{mysql,postgres}/init/10-qvsu.sql`（各 2 行 admin/ry） | `SysUserServiceImpl` 全部 select；`framework/shiro/realm/UserRealm`（认证）；`framework/aspectj/LogAspect.java:90`（当前用户）；`framework/aspectj/DataScopeAspect.java`（数据范围）；`mapper/system/SysDeptMapper.xml:59`（部门删除前校验）；`mapper/system/SysPostMapper.xml:46`（岗位反查） | **有**：① 用户管理页与个人中心都能改 `password`/`salt`（`resetUserPwd` 双入口）；② 登录流程写 `login_ip`/`login_date`，而 `updateUser` 的动态 `<set>` 也含这两列（`SysUserMapper.xml:198-199`），用户保存表单与登录事件会互相覆盖；③ `importUser`（`SysUserServiceImpl.java:536`）与 `insertUser`（`:224`）都走 `insertUser` 语句；④ `updateUser` 会**无条件重写** `sys_user_role` 与 `sys_user_post`（`:253-265`），与角色管理页的授权操作互相覆盖（见 4.2 第 5 条） | `del_flag char(1) default '0'`；删除即 `update sys_user set del_flag = '2'`（`SysUserMapper.xml:158-167`）；所有列表/唯一性校验都带 `del_flag = '0'`；**无物理删除语句** | `create_by`、`create_time`、`update_by`、`update_time`、`remark`（21 列全含）。`create_by` 由 Service 从 `ShiroUtils` 取，`update_time` 由 Mapper 强制 `now()` |
| `TBL-sys_role` | `com.qvsu.system.service.impl.SysRoleServiceImpl`（`insertRole`:183、`updateRole`:198、`authDataScope`:215、`insertRoleMenu`:230、`insertRoleDept`:254、`changeStatus`:365、`deleteAuthUser`:377、`deleteAuthUsers`:390、`insertAuthUsers`:403、`deleteRoleById`:141、`deleteRoleByIds`:169） | 种子 `10-qvsu.sql`（超级管理员/普通角色 2 行）；`open-api/sql/quartz.sql` 与两套方言 `35-quartz.sql` 只写 `sys_role_menu` 不写 `sys_role` | `SysRoleServiceImpl` 全部 select；`mapper/system/SysUserMapper.xml:59`（用户 join 角色）；`SysLoginService.setRolePermission`（装配权限集） | 无：角色本身只有角色管理页一个写入入口 | `del_flag default '0'`；删除即 `update sys_role set del_flag = '2'`（`SysRoleMapper.xml:84-93`）；`selectRoleList` 带 `del_flag = '0'` | `create_by`、`create_time`、`update_by`、`update_time`、`remark`（12 列全含） |
| `TBL-sys_menu` | `com.qvsu.system.service.impl.SysMenuServiceImpl`（`insertMenu`、`updateMenu`、`updateMenuSort`、`deleteMenuById`） | **双轨维护**：① `deploy/local-docker/{mysql,postgres}/init/10-qvsu.sql`（16 个 C/M 菜单 + 39 个 F 按钮，行 158-218）；② `{mysql,postgres}/init/35-quartz.sql` 与 `open-api/sql/quartz.sql:190-209`（菜单 110 + 按钮 1050-1056）；③ `{mysql,postgres}/init/40-open-api-menu.sql` 与 `open-api/sql/open_api_menu.sql`（OpenAPI 菜单 2100-2150 + 删除 monitor/tool 菜单） | `SysMenuServiceImpl` 全部 select；`mysql/SysMenuMapper.xml:32-86` 的权限/菜单树查询；`thymeleaf-extras-shiro` 前端 `shiro:hasPermission` | **有，且是本项目最严重的双写冲突**：种子脚本用 `DELETE ... WHERE menu_id BETWEEN` / `perms IN (...)` / `url LIKE '/tool/%'` 硬编码范围增删菜单，管理员在菜单管理页做的任何增删改在下次执行这些脚本时会被静默删除或覆盖（详见 4.2 第 1 条） | 无逻辑删除字段；`deleteMenuById` 执行**物理删除**（`SysMenuMapper.xml:118`），且只删自身与一层子行，不清理 `sys_role_menu` | `create_by`、`create_time`、`update_by`、`update_time`、`remark`（16 列全含）。**注意：`updateMenu` 只在 `updateBy` 非空时写 `update_by`**（`SysMenuMapper.xml:151`），而 `updateMenuSort`（`:191-195`）完全不写任何审计字段 |
| `TBL-sys_dept` | `com.qvsu.system.service.impl.SysDeptServiceImpl`（`insertDept`、`updateDept`、`updateDeptChildren`、`updateDeptStatusNormal`、`deleteDeptById`） | 种子 `10-qvsu.sql`（10 行部门树 + `ancestors` 物化路径）；幂等升级脚本无 | `SysDeptServiceImpl` 全部 select；`SysUserMapper.xml:57`（用户 join 部门）；`SysRoleDeptMapper.xml:33`（角色部门树）；`DataScopeAspect.java:136`（部门及以下范围子查询）；`LogAspect.java:102-106`（取当前用户部门名） | 无严重冲突：唯一写入入口是部门管理页；但 `ancestors` 由 `updateDeptChildren` 批量重写，与 `DataScopeAspect` 运行期拼 SQL 读取存在读写时序竞争（移动部门瞬间的数据范围可能不一致） | `del_flag default '0'`；`deleteDeptById` 是 `update sys_dept set del_flag = '2'`（`SysDeptMapper.xml:147-149`）；**但 `SysDeptServiceImpl.deleteDeptById` 的前置校验只查 `checkDeptExistUser`（未删除用户）与 `selectNormalChildrenDeptById`（正常子部门），不校验 `sys_role_dept` 是否引用该部门** | `create_by`、`create_time`、`update_by`、`update_time`；**该表没有 `remark` 列**（14 列） |
| `TBL-sys_post` | `com.qvsu.system.service.impl.SysPostServiceImpl`（`insertPost`、`updatePost`、`deletePostByIds`） | 种子 `10-qvsu.sql`（ceo/se/hr/user 4 行）；无幂等升级脚本 | `SysPostServiceImpl` 全部 select；`SysPostMapper.xml:44-50`（按用户查岗位）；`SysUserPostMapper.xml:17`（删除前校验） | 无 | **无逻辑删除字段**；`deletePostByIds` 是物理 `delete from sys_post`（`SysPostMapper.xml:67-72`）。前置校验 `countUserPostById > 0` 抛 `ServiceException("已分配,不能删除")`（`SysPostServiceImpl.java:99-106`）会阻止删除已分配岗位，但**不阻止删除 `sys_user_post` 之外的其他引用（本表无其他引用方）** | `create_by`、`create_time`、`update_by`、`update_time`、`remark`（10 列全含） |
| `TBL-sys_user_role` | `SysUserRoleMapper.batchUserRole`，由 `SysUserServiceImpl.insertUserRole`（`:336`，被 `insertUser`:228、`updateUser`:259、`insertUserAuth`:315 三处调用）写入 | **第二写入方（角色侧）**：`SysRoleServiceImpl.insertAuthUsers`（`:403-415`）也调 `batchUserRole`；删除方同上：`SysRoleServiceImpl.deleteAuthUser`（`:377-380`）经 `deleteUserRoleInfo`、`deleteAuthUsers`（`:390-393`）经 `deleteUserRoleInfos`；种子 `10-qvsu.sql`（2 行） | `SysUserServiceImpl.selectUserRoleByUserId`；`SysRoleServiceImpl.selectRolesByUserId`；`SysMenuMapper.xml:36,58,68` 三处 join 用于权限计算 | **有**：用户管理页的"分配角色"与角色管理页的"分配用户"都写 `sys_user_role`，两者互相不感知（无乐观锁、无版本号）；写入模式都是"先按一侧 delete 再批量 insert"，因此一侧保存会覆盖另一侧刚提交的结果 | 无逻辑删除字段（2 列复合主键）；删除为物理 DELETE | **无审计字段**（仅 `user_id`、`role_id`），无法追溯"谁在何时授了什么权" |
| `TBL-sys_role_menu` | `SysRoleMenuMapper.batchRoleMenu`，由 `SysRoleServiceImpl.insertRoleMenu`（`:230-247`）写入，该方法被 `insertRole`（`:187`）与 `updateRole`（`:198-205`，先 `deleteRoleMenuByRoleId` 再批插）两处调用 | ① 种子 `10-qvsu.sql:254-302`（角色 2 的 48 行）；② `quartz.sql` / 两套方言 `35-quartz.sql:211-229`（角色 1 的 8 行 + 角色 2 的 1 行，全部 `WHERE NOT EXISTS` 幂等）；③ `{mysql,postgres}/init/40-open-api-menu.sql:5,26-60,63-108`（角色 1/2 各 17 行 + 两段范围删除） | `SysMenuMapper.xml:35,57,67,76,83` 四处 join 用于菜单树与权限集；`SysRoleMenuMapper.xml:17` 已分配计数；`SysDeptMapper.xml` 不涉及 | **有**：种子脚本按 `menu_id` 区间（`BETWEEN 2100 AND 2150`）和 `perms IN (...)` 删除，与角色管理页保存的整表覆盖（`deleteRoleMenuByRoleId` + 批插）无协调机制 | 无逻辑删除字段；物理 DELETE。**删除菜单时不级联删本表**（`SysMenuMapper.deleteMenuById` 只删 `sys_menu`），会产生孤儿行（见 4.2 第 2 条） | **无审计字段**（仅 `role_id`、`menu_id`） |
| `TBL-sys_role_dept` | `SysRoleDeptMapper.batchRoleDept`，由 `SysRoleServiceImpl.insertRoleDept`（`:254-271`）写入，该方法被 `authDataScope`（`:215-223`，先 `deleteRoleDeptByRoleId` 再批插）调用 | 种子 `10-qvsu.sql:317-319`（角色 2 的 3 行）；无幂等升级脚本 | `SysDeptMapper.xml:30-36`（角色部门树）；`DataScopeAspect.java:123,127`（数据范围子查询注入 `${params.dataScope}`） | 无（单一写入入口） | 无逻辑删除字段；物理 DELETE（`deleteRoleDeptByRoleId` / `deleteRoleDept`） | **无审计字段**（仅 `role_id`、`dept_id`） |
| `TBL-sys_user_post` | `SysUserPostMapper.batchUserPost`，由 `SysUserServiceImpl.insertUserPost`（`SysUserServiceImpl.java:377`）调用 | 种子 `10-qvsu.sql:335-336`（2 行）；`SysPostServiceImpl` 只读不写本表 | `SysPostServiceImpl.selectPostsByUserId`（`:59-62`）；`SysPostMapper.xml:44-50`；`SysUserServiceImpl.java:496` | 无（单一写入入口，均在用户保存事务内） | 无逻辑删除字段；物理 DELETE（`deleteUserPostByUserId` / `deleteUserPost`） | **无审计字段**（仅 `user_id`、`post_id`） |

### 3.2 开放平台业务簇（5 张）

| 物理表 | 主写所有者（权威写入方） | 其他写入方 | 读取方 | 多写冲突 | 逻辑删除字段与策略 | 审计字段 |
|---|---|---|---|---|---|---|
| `TBL-open_app` | `com.qvsu.open.service.OpenManageService`（`insertApp`:102-112、`updateApp`:114-120、`deleteAppByIds`:122-134、`resetSecret`:136-147），经 `controller/OpenAppController` 暴露 | ① 种子 `{mysql,postgres}/init/50-open-api-seed.sql:8-9`（`s_id=90001`，含 `ON DUPLICATE KEY UPDATE` 幂等写法只存在于 `open-api/sql/open_api_httpbin_min_seed.sql:10-15`）；② `open-api/sql/open_api_selftest_seed.sql:9-10`；③ `open-api/sql/open_api_httpbin_min_seed.sql:8-15`；④ 幂等升级脚本 `31-open-api-compat.sql` 会 `UPDATE open_app SET s_status/s_is_del/s_created_time/s_updated_time/create_time/update_time` 全表回填 | `OpenManageService.selectAppList`/`selectAppById`/`selectAppByAppKey`/`selectUsableAppByApiId`/`listAppOptions`；`OpenApiSecurityService.loadAppInfo:239-259`（**运行期鉴权热路径**）；`ApiDocService.generateHtml`/`buildSignedCurl` | **有（种子 vs 运行期）**：种子脚本先 `DELETE FROM open_app WHERE s_id = 90001` 再 INSERT，会**物理删除**管理员通过界面对该行做过的任何修改（含 resetSecret 后的新密钥） | 有 `s_is_del` 列（`DEFAULT 1`，`OptBaseEntity.java:45-46` 注释为"0：无效;1：有效"），但 `OpenManageService` 的全部 SQL 既**不读也不写** `s_is_del` 与 `s_status`；删除走**物理 DELETE**（`delete from open_app where s_id in (...)`） | 物理列只有 `create_time`、`update_time`（+ 兼容列 `s_created_time`、`s_updated_time`）。**没有 `create_by` / `update_by` 列**，但 `OpenAppController.java:61` 调 `app.setsCreateBy(getLoginName())`、`:78` 调 `app.setsUpdateBy(getLoginName())`，这两个值**只存在于 Java 对象**，不落库（见 4.3） |
| `TBL-open_api` | `com.qvsu.open.service.OpenManageService`（`insertApi`:199-216、`updateApi`:218-225、`deleteApiByIds`:227-239），经 `controller/OpenApiMgrController` 暴露 | ① `{mysql,postgres}/init/50-open-api-seed.sql:11-44`（9 条 httpbin 自检接口，含 `s_id=90001..90009`）；② `open_api_selftest_seed.sql:13-35`；③ `open_api_httpbin_min_seed.sql:17-24` | `OpenManageService.selectApiList`/`selectApiById`/`selectApiByPath`/`selectApisByIds`/`listApiOptions`；`OpenApiSecurityService.loadApiInfo:261-322`（**运行期鉴权热路径**，含"POST 方法兼容"二次查询）；`ApiDocService` | **有（种子 vs 运行期）**：三份种子都会先 `DELETE FROM open_api WHERE s_id IN (90001..)` 再 INSERT，会覆盖界面修改；且 `open_api.sql` 的 `api_path` 有 `UNIQUE` 约束，多份种子同时导入会因重复路径冲突 | 有 `s_is_del` / `s_status` 列，代码零访问；删除走**物理 DELETE**（`delete from open_api where s_id in (...)`） | 物理列 `create_time`、`update_time`、`s_created_time`、`s_updated_time`（17 列）。`updateApi`**不更新 `update_time`**（`OpenManageService.java:222` 的 update 语句无 `update_time=now()`），而 MySQL 侧的 `ON UPDATE CURRENT_TIMESTAMP` 会自动补、PostgreSQL 侧不会 → **同一操作在两种数据库下 `update_time` 行为不同**。无 `create_by`/`update_by` 列 |
| `TBL-open_app_api` | `OpenManageService.saveAppAuth:258-279`（`delete from open_app_api where app_id=?` + `batchUpdate insert ... on conflict (app_id, api_id) do update set update_time=now()`），经 `controller/OpenAuthController.save`（`/admin/open/auth/save`）暴露 | ① 级联清理方：`OpenManageService.deleteAppByIds:132`（按 `app_id` 删）与 `deleteApiByIds:237`（按 `api_id` 删）；② 种子 `50-open-api-seed.sql:47-55`（9 行）、`open_api_selftest_seed.sql:38-42`（4 行）、`open_api_httpbin_min_seed.sql:26-31`（3 行） | `OpenManageService.listAuthorizedApiIds:253-256`、`selectUsableAppByApiId:88-99`、`listAppOptions`/`listApiOptions`；`OpenApiSecurityService.hasPermission:324-332`（**运行期鉴权热路径**）；`ApiDocService.buildCurlExample`（找示例应用） | **有，三层并存**：① `saveAppAuth` 是"按 app 全量覆盖"语义；② `deleteAppByIds`/`deleteApiByIds` 是"按父键级联清理"语义；③ 三份种子脚本按固定 ID 集合 DELETE + INSERT。三种语义无锁协调，并发执行会产生"刚授权完又被种子删掉"或"删应用后残留授权行"（后者不会发生，因为删应用会先删本表） | 无逻辑删除字段使用；`s_is_del` 存在但代码零访问；`saveAppAuth` 与级联清理都是**物理 DELETE** | 仅 `create_time`、`update_time`、`s_created_time`、`s_updated_time`（9 列）。**授权关系没有"谁授的权"记录**；且 `OpenAuthController` 的 `save` 方法**没有 `@Log` 注解**，因此 `sys_oper_log` 也不会留下审计痕迹（见 4.2 第 6 条） |
| `TBL-open_call_log` | `com.qvsu.open.service.OpenApiLogService.save:29-55`（**全仓库唯一 INSERT 入口**），由 `filter/OpenApiFilter.java:120` 在 `finally` 块调用 | **无其他写入方**（`open-api/qvsu-openapi/src/main` 全量检索 `open_call_log` 只出现 3 条语句：1 条 INSERT、2 条 SELECT）。种子脚本不写本表，幂等升级脚本只 `UPDATE ... s_status/s_is_del/时间列` 回填 | `OpenManageService.selectLogList:283-328`（列表 + CSV 导出共用）、`queryLogStatsToday:339-357`（今日统计与 TOP5）；消费入口 `controller/OpenLogController`（`list` / `stats` / `exportCsv`）与模板 `templates/open/log/index.html` | 无写入冲突（单写者），但**没有任何 UPDATE / DELETE / 归档语句**（见 4.2 第 3 条） | 有 `s_is_del` / `s_status` 列，代码零访问；**无删除语句、无归档策略**，属纯追加表 | 时间列齐全（`call_time`、`create_time`、`update_time`、`s_created_time`、`s_updated_time`，22 列），但**无 `create_by`/`update_by`**；且 `update_time`/`s_updated_time` 依赖 MySQL 的 `ON UPDATE CURRENT_TIMESTAMP`，PG 侧恒为插入时刻，语义退化 |
| `TBL-open_api_doc` | `OpenManageService.saveDoc:368-373`（**只有 INSERT**），由 `controller/OpenDocController.generate:68-85`（`/admin/open/doc/generate`）调用 | **无其他写入方**（全仓库检索 `open_api_doc` 只有 1 条 INSERT + 1 条 SELECT；种子脚本、升级脚本均不涉及） | `OpenManageService.selectDocList:361-366`；`OpenDocController.list`（`/admin/open/doc/list`）；`templates/open/doc/index.html` | 无写入冲突；但 `generate` 每次调用都**追加一行**且无去重（同一 `appId` + `apiIds` 反复生成会不断产生新行），列表接口 `selectDocList` 又**不带分页**（`startPage()` 未被调用） | 有 `s_is_del` 列，代码零访问；**无 UPDATE / DELETE 语句**，文档只能新增不能改删 | 仅 `create_time`、`update_time`、`s_created_time`、`s_updated_time`；无 `create_by`/`update_by` |

### 3.3 字典参数簇（3 张）

| 物理表 | 主写所有者（权威写入方） | 其他写入方 | 读取方 | 多写冲突 | 逻辑删除字段与策略 | 审计字段 |
|---|---|---|---|---|---|---|
| `TBL-sys_dict_type` | `com.qvsu.system.service.impl.SysDictTypeServiceImpl`（`insertDictType`:181、`updateDictType`:196-205、`deleteDictTypeById`/`deleteDictTypeByIds`:129-133）与 `SysDictDataServiceImpl` 无关 | ① 种子 `10-qvsu.sql:384-391`（8 个基础字典类型）；② `quartz.sql` / 两套方言 `35-quartz.sql:165-171`（`sys_job_status`、`sys_job_group` 2 条，`WHERE NOT EXISTS` 幂等） | `SysDictTypeServiceImpl.selectDictTypeList`/`selectDictTypeAll`/`selectDictTypeById`/`selectDictTypeByType`；`DictUtils`（Ehcache `sys-dict` 读写）；`mapper/system/SysDictDataMapper.xml` 不 join 本表（靠 `dict_type` 字符串） | 无严重冲突（种子用 `INSERT ... WHERE NOT EXISTS` 保护） | 无逻辑删除字段；物理 DELETE（`deleteDictTypeById`）。前置校验 `countDictDataByType(dictType) > 0` 抛异常阻止删除仍被引用的类型（`SysDictTypeServiceImpl.java:129`） | `create_by`、`create_time`、`update_by`、`update_time`、`remark`（9 列全含） |
| `TBL-sys_dict_data` | `com.qvsu.system.service.impl.SysDictDataServiceImpl`（`insertDictData`:87、`updateDictData`:105、`deleteDictDataById`/`deleteDictDataByIds`:72-73） | **第二写入方（跨 Service）**：`SysDictTypeServiceImpl.updateDictType:196-201` 执行 `update sys_dict_data set dict_type = #{newDictType} where dict_type = #{oldDictType}`，即字典类型改名会**级联改写本表全部同类型行**；另有多处种子：`10-qvsu.sql:417-440`（24 行）、`quartz.sql` / `35-quartz.sql:171-185`（4 行）、`40-open-api-menu.sql` 不写本表 | `SysDictDataServiceImpl.selectDictDataList`/`selectDictDataByType`/`selectDictLabel`/`selectDictDataById`；`SysDictTypeServiceImpl` 多处；`DictUtils`（Ehcache `sys-dict`）；`BaseController`/Excel 注解回显 | **有**：① 字典数据管理页与字典类型管理页都能改 `dict_type` 列；② 改名操作跨两张表且靠 `@Transactional` 保证，但 `SysDictDataServiceImpl.updateDictData` 也接受 `dictType` 入参，可单独把一行挪到另一个类型下，造成"类型表无此类型但数据表有"的悬空引用 | 无逻辑删除字段；物理 DELETE（`deleteDictDataById`/`deleteDictDataByIds`） | `create_by`、`create_time`、`update_by`、`update_time`、`remark`（14 列全含）。**`updateDictDataType` 的级联改名不写 `update_by`/`update_time`**（`SysDictDataMapper.xml:91-93` 只 set `dict_type`） |
| `TBL-sys_config` | `com.qvsu.system.service.impl.SysConfigServiceImpl`（`insertConfig`:95-103、`updateConfig`:111-126、`deleteConfigByIds`:133-147） | 种子 `10-qvsu.sql:461-471`（11 个内置参数，全部 `config_type='Y'`）；无幂等升级脚本 | `SysConfigServiceImpl.selectConfigByKey`（**Ehcache `sys-config` 写穿缓存**，`:58-74`）、`selectConfigList`/`selectConfigById`；`framework/web/service/ConfigService.getKey`（Thymeleaf `@config.getKey(...)`）；`SysLoginService.java:85`（IP 黑名单）、`SysRegisterController.java:39`（是否开放注册）、`SysLoginController.java:51` | **有（缓存 vs 数据库）**：`selectConfigByKey` 走 Ehcache，只有经 `ISysConfigService` 的写入才会同步缓存；**直接改库不会生效**。缓存清理入口 `clearConfigCache`/`resetConfigCache`（`SysConfigServiceImpl.java:166-179`）在导入语句中被引用（模板层），但监控页（`monitor:cache:*`）的菜单已被 `40-open-api-menu.sql:82-90` 删除，管理员没有可达的"刷新缓存"按钮 | 无逻辑删除字段；物理 DELETE（`deleteConfigById`）。内置参数（`config_type='Y'`）不允许删除（`SysConfigServiceImpl.java:140-143`） | `create_by`、`create_time`、`update_by`、`update_time`、`remark`（10 列全含） |

### 3.4 审计与通知簇（4 张）

| 物理表 | 主写所有者（权威写入方） | 其他写入方 | 读取方 | 多写冲突 | 逻辑删除字段与策略 | 审计字段 |
|---|---|---|---|---|---|---|
| `TBL-sys_oper_log` | `framework/aspectj/LogAspect.handleLog`（`:85-137`）→ `framework/manager/factory/AsyncFactory.recordOper`（`:69-81`）→ `SysOperLogServiceImpl.insertOperlog`（`:30`）→ `mapper/system/SysOperLogMapper.xml:32-35`。触发面是全部标注 `@Log` 的 Controller 方法 | 无其他 INSERT。**删除/清空方**：`SysOperLogServiceImpl.deleteOperLogByIds:54`（按 ID 物理删除）与 `cleanOperLog:75`（`truncate table sys_oper_log`，`SysOperLogMapper.xml:82-84`） | `SysOperLogServiceImpl.selectOperLogList`/`selectOperLogById`；行业务消费者是**已删除菜单的监控页**（`40-open-api-menu.sql:82-90` 删除了全部 `monitor:operlog:*`），且仓库中**不存在 `SysOperLogController`** → 有表、有 Mapper、有清空语句，**无查询接口、无 UI 入口** | 无写入冲突（单写者 + 异步单线程队列）。但**异步写入脱离调用方事务**：`AsyncManager.me().execute(...)` 在请求线程之外执行，业务事务回滚不会撤销日志行 | 无逻辑删除字段；`deleteOperLogByIds` 物理删除，`cleanOperLog` 为 `TRUNCATE`（不可回滚、不触发触发器、重置自增） | **无 `create_by`/`update_by`**；自带 `oper_time`（写入时 `now()`）与 `cost_time`（毫秒）。`oper_name`/`dept_name` 是快照文本 |
| `TBL-sys_logininfor` | `framework/manager/factory/AsyncFactory.recordLogininfor`（`:92-135`）→ `SysLogininforServiceImpl.insertLogininfor`（`:31`）→ `mapper/system/SysLogininforMapper.xml:19-22` | 无其他 INSERT。**删除/清空方**：`deleteLogininforByIds:55` 与 `cleanLogininfor:64`（`truncate table sys_logininfor`，`SysLogininforMapper.xml:52-54`） | `SysLogininforServiceImpl.selectLogininforList:43`；消费者同样是已被删除的 `monitor:logininfor:*` 监控页，且**不存在 `SysLogininforController`** → 无入口 | 无写入冲突。调用面很广（8 个登录失败分支 + 1 个成功分支 + 2 个密码校验分支，见 [数据关系与血缘](./database-relations.md) 8.3），但它们共用同一个异步工厂，无并发写同一行的可能 | 无逻辑删除字段；物理删除 + `TRUNCATE` | **无 `create_by`/`update_by`**；自带 `login_time`。`ipaddr`/`login_location`/`browser`/`os` 为登录时快照 |
| `TBL-sys_user_online` | `framework/manager/factory/AsyncFactory.syncSessionToDb`（`:38-61`）→ `SysUserOnlineServiceImpl.saveOnline`（`:83-86`）→ `mapper/system/SysUserOnlineMapper.xml:31-45`（`insert ... on conflict (sessionId) do update set ... excluded.*`）。上游触发点是 `OnlineSessionDAO.syncToDb`（`:67-101`） | **删除方有两个**：① `SysShiroService.deleteSession`（`:28-31`）经 `OnlineSessionDAO.doDelete`（`:107-116`）；② `OnlineWebSessionManager.validateSessions`（`:96-168`）扫描过期会话后 `batchDeleteOnline`。另 `SysUserOnlineServiceImpl.forceLogout`（`:105-108`）也是删除，但无调用方 | `SysUserOnlineMapper.selectOnlineById`（**Shiro 会话恢复热路径**，`OnlineSessionDAO.doReadSession` → `SysShiroService.getSession`）、`selectUserOnlineList`、`selectOnlineByExpired` | **有（DB 与内存会话的双向不一致）**：会话真值在 Shiro 缓存（`OnlineSessionDAO extends EnterpriseCacheSessionDAO`），本表是**最多滞后 `shiro.session.dbSyncPeriod: 1` 分钟的异步投影**（`application.yml:121`）；异步写失败只打 error 日志（`AsyncFactory` 未捕获时由线程池吞掉）。`saveOnline` 是 upsert（PG 专有语法），删除是硬 DELETE，无版本控制 | 无逻辑删除字段；物理 DELETE（`deleteOnlineById`） | **完全无审计字段**（11 列：`sessionId`、`login_name`、`dept_name`、`ipaddr`、`login_location`、`browser`、`os`、`status`、`start_timestamp`、`last_access_time`、`expire_time`） |
| `TBL-sys_notice` | `com.qvsu.system.service.impl.SysNoticeServiceImpl`（`insertNotice`:56、`updateNotice`:68、`deleteNoticeByIds`:80） | 种子 `{mysql,postgres}/init/10-qvsu.sql:533-535`（3 条公告，第 3 条为含外链图片的富文本） | `SysNoticeServiceImpl.selectNoticeById`/`selectNoticeList`；首页与通知公告页模板 | 无写入冲突；但种子会因 `insert into sys_notice values(...)` 无 `WHERE NOT EXISTS` 保护，**重复执行 `10-qvsu.sql` 会因主键冲突失败**（该脚本整体是 `drop table if exists` + 重建，即初始化专用） | 无逻辑删除字段；物理 DELETE（`deleteNoticeByIds`） | `create_by`、`create_time`、`update_by`、`update_time`、`remark`（10 列全含） |

### 3.5 Quartz 调度簇（13 张）

| 物理表 | 主写所有者（权威写入方） | 其他写入方 | 读取方 | 多写冲突 | 逻辑删除字段与策略 | 审计字段 |
|---|---|---|---|---|---|---|
| `TBL-sys_job` | `com.qvsu.quartz.service.impl.SysJobServiceImpl`（`insertJob`:204-213、`updateJob`:222-231、`pauseJob`:81-92、`resumeJob`:101-112、`deleteJob`:121-131、`deleteJobByIds`:141-149、`changeStatus`:158-171），经 `quartz/controller/SysJobController`（`/monitor/job`，权限 `monitor:job:*`）暴露 | ① 种子 `quartz.sql` / 两套方言 `35-quartz.sql:232-242`（3 个默认任务，全部 `status='1'` 暂停、`WHERE NOT EXISTS` 幂等）；② 升级脚本 `35-quartz.sql:246` 对 `job_id` 做 `setval` 修正（仅 PG） | `SysJobServiceImpl.selectJobList`/`selectJobById`/`selectJobAll`（`init()` 启动时全量读，`:39-48`）；`SysJobLogMapper` 不 join | **有（运行期 vs 启动重建）**：`SysJobServiceImpl.init()` 在 `@PostConstruct` 中先 `scheduler.clear()` 再按 `sys_job` 全量重建触发器 —— 内存中任何运行时改动都会被下次重启抹掉；同时 `sys_job` 的 MySQL 侧主键是 `(job_id, job_name, job_group)`、PG 侧是 `(job_id)`，两套数据库对"同 ID 多行"的容忍度不同 | 无逻辑删除字段；物理 DELETE（`deleteJobById`/`deleteJobByIds`），且 `deleteJob` 会在删除行成功后同步 `scheduler.deleteJob` | `create_by`、`create_time`、`update_by`、`update_time`、`remark`（20 列全含）。**`request_headers` 是明文列**，代码注释自身示例即 `{"Authorization":"Bearer token"}`（`quartz/task/HttpTask.java:42,74`），可存凭据（见第 6 章） |
| `TBL-sys_job_log` | `quartz/util/AbstractQuartzJob.after`（`:72-113`）→ `SysJobLogServiceImpl.addJobLog`（`:52-55`）→ `mapper/quartz/SysJobLogMapper.xml:72-78` | 无其他 INSERT。删除方：`deleteJobLogByIds`:64-67、`deleteJobLogById`:75-78、`cleanJobLog`:84-87（`truncate table sys_job_log`） | `SysJobLogServiceImpl.selectJobLogList`/`selectJobLogById`；`quartz/controller/SysJobLogController`（`/monitor/jobLog`，复用 `monitor:job:view/list/export/remove/detail` 权限）；模板 `templates/monitor/job/jobLog.html` | 无写入冲突（Quartz 工作线程单写）。但**持久化与执行非原子**：`:104-112` 的 try/catch 使写日志失败不影响任务，可能丢日志 | 无逻辑删除字段；物理删除 + `TRUNCATE` | 仅 `create_time`；无 `create_by`/`update_by`。`startTime`/`endTime` 在 `quartz/domain/SysJobLog.java:47-50` 声明但**表中无对应列**，耗时只能从 `job_message` 文本解析（见 [数据关系与血缘](./database-relations.md) 7.N8） |
| `TBL-QRTZ_JOB_DETAILS` | **无**（运行期零访问） | 无 | 无 | 无 | 无（表结构无删除标识列） | 无 |
| `TBL-QRTZ_TRIGGERS` | **无** | 无 | 无 | 无 | 无 | 无 |
| `TBL-QRTZ_SIMPLE_TRIGGERS` | **无** | 无 | 无 | 无 | 无 | 无 |
| `TBL-QRTZ_CRON_TRIGGERS` | **无** | 无 | 无 | 无 | 无 | 无 |
| `TBL-QRTZ_BLOB_TRIGGERS` | **无** | 无 | 无 | 无 | 无 | 无 |
| `TBL-QRTZ_CALENDARS` | **无** | 无 | 无 | 无 | 无 | 无 |
| `TBL-QRTZ_PAUSED_TRIGGER_GRPS` | **无** | 无 | 无 | 无 | 无 | 无 |
| `TBL-QRTZ_FIRED_TRIGGERS` | **无** | 无 | 无 | 无 | 无 | 无 |
| `TBL-QRTZ_SCHEDULER_STATE` | **无** | 无 | 无 | 无 | 无 | 无 |
| `TBL-QRTZ_LOCKS` | **无** | 无 | 无 | 无 | 无 | 无 |
| `TBL-QRTZ_SIMPROP_TRIGGERS` | **无** | 无 | 无 | 无 | 无 | 无 |

**11 张 `QRTZ_*` 判定为休眠表的证据（事实）**：① `quartz/config/ScheduleConfig.java` 全文 14 行，只有注释声明"当前使用 Spring Boot 自动配置的 Scheduler（内存模式）"，类体为空；② `pom.xml:76` 引入 `spring-boot-starter-quartz`，`application.yml` / `application-druid.yml` 均未配置 `spring.quartz.job-store-type` → 默认 `memory`（RAMJobStore）；③ 对 `open-api/qvsu-openapi/src/main` 全量检索 `QRTZ` / `qrtz` 得 **0 条命中**；④ `sql/quartz.sql:4` 与两套方言 `35-quartz.sql:2` 用 `CREATE TABLE IF NOT EXISTS` 建表，其种子段（`:164-242`）只写 `sys_dict_*`、`sys_menu`、`sys_role_menu`、`sys_job`，从不写 `QRTZ_*`。因此这 11 张表是"DDL 存在、无人拥有、永无数据"的空表。

## 4. 冲突与风险清单

### 4.1 休眠与无主数据（无写入方）

| 序号 | 对象 | 风险 | 证据等级 |
|---:|---|---|---|
| 1 | 11 张 `QRTZ_*` | 无主表：DDL、索引、主键齐全，但既无写入方也无读取方（见 3.5 末段证据）。运维若按 DDL 推断"Quartz 用的是 JDBC JobStore"，会误判集群能力（实际是单机内存调度，多实例部署会重复触发任务） | 事实 |
| 2 | `sys_oper_log` | 有写入方、有删除方、无查询方：`SysOperLogController` 不存在，`monitor:operlog:*` 菜单已删除 | 事实 |
| 3 | `sys_logininfor` | 同上：无 `SysLogininforController`，`monitor:logininfor:*` 菜单已删除 | 事实 |
| 4 | `sys_user_online` | 无查询入口：`forceLogout`/`batchDeleteOnline` 只被框架内部调用，无强退界面；`monitor:online:*` 菜单已删除 | 事实 |
| 5 | `sys_job_log` | `SysJobLogController` 存在（`/monitor/jobLog`）但 `sys_menu` 中无任何 `jobLog` 记录（全量检索 `open-api/**/*.sql` 的 `monitor:jobLog` 与 `/monitor/jobLog` 均 0 命中），页面模板 `templates/monitor/job/jobLog.html` 存在却无法从菜单进入 | 事实 |
| 6 | `open_call_log.req_headers` / `resp_headers` | 死列：DDL 与升级脚本存在，Java 代码零引用 | 事实 |

### 4.2 多写冲突

| 序号 | 冲突 | 参与方 | 后果 | 证据等级 |
|---:|---|---|---|---|
| 1 | **`sys_menu` 由 SQL 种子与应用代码双重维护** | ① `SysMenuServiceImpl.insertMenu`/`updateMenu`/`deleteMenuById`；② 两套方言 `init/40-open-api-menu.sql:4-5`：`DELETE FROM sys_role_menu WHERE menu_id BETWEEN 2100 AND 2150` 加上 `DELETE FROM sys_menu WHERE menu_id BETWEEN 2100 AND 2150`；③ `:82-90`：按 `perms IN ('monitor:operlog:view',...)` 与 `url IN ('/monitor/operlog',...)` 与硬编码 ID 列表 `(108,109,111,112,113,500,501,1039..1049)` 三个条件删除；④ `:105-108`：按 `perms LIKE 'tool:%'` 与 `url LIKE '/tool/%'` 与硬编码 ID `(3,114,115,116,1057..1061)` 删除；⑤ `open-api/sql/quartz.sql:190-209` 用 `INSERT ... WHERE NOT EXISTS` + 无条件 `UPDATE sys_menu SET parent_id=1, order_num=9, ... WHERE menu_id=110` | 管理员在菜单管理页新建的任何位于 `2100-2150`、`108/109/111-113/500/501/1039-1049`、`3/114-116/1057-1061` 区间的菜单，或任何 `perms` 以 `tool:` 开头、`url` 以 `/tool/` 开头的菜单，会在下次执行该脚本时被**静默物理删除**；`menu_id=110`（定时任务）的任何界面调整会被无条件覆盖回脚本值 | 事实 |
| 2 | **删除菜单不清理 `sys_role_menu`** | `SysMenuServiceImpl.deleteMenuById` → `SysMenuMapper.xml:118` 只执行 `delete from sys_menu where menu_id = #{menuId} or parent_id = #{menuId}` | 留下孤儿 `sys_role_menu` 行；而 `SysMenuServiceImpl.java:340` 用 `selectCountRoleMenuByMenuId` 判断"菜单是否已分配"，重建同 ID 菜单时会把历史授权当作既有授权，出现"新菜单建出来就已授权给多个角色"的越权效果 | 事实 |
| 3 | **`open_call_log` 高频写入，缺归档与清理** | 唯一写入方 `OpenApiFilter` 对**每个** `/open/**` 请求无条件插入一行（含 forward 失败与鉴权失败），表内 22 列中 `req_body`/`resp_body` 各可达 4000 字符 | 全仓库对 `open_call_log` **只有 INSERT 与 SELECT，没有 UPDATE / DELETE / 分区 / 归档 / 定时清理**（检索 `open_call_log` 在 `src/main` 只出现 3 条语句）；`sys_job` 中也没有任何针对该表的清理任务（种子只有 3 个默认任务且均为暂停，`invoke_target` 为 `qvsuTask.*`）。按默认 1500ms 超时与 4000 字符报文估算，单请求可写入约 8 KB，表无上界增长；同时 `call_time`/`app_key`/`trace_id` 三个索引**在 PostgreSQL 侧不存在**（只在 MySQL DDL 中定义），日志列表与统计查询最终会退化为全表扫描 | 事实 |
| 4 | **`sys_user_online` 会话数据与内存会话不一致** | 写：`OnlineSessionDAO.syncToDb`（受 `dbSyncPeriod=1` 分钟节流，异步）→ `AsyncFactory.syncSessionToDb` → `saveOnline`（PG upsert）；真值：Shiro `EhCacheManager` 的 `EnterpriseCacheSessionDAO`；删：`SysShiroService.deleteSession` / `OnlineWebSessionManager.validateSessions` | ① 最长 1 分钟的投影滞后：刚登录的用户在"在线用户"语义上还不存在；② 异步写失败只打日志，产生"缓存有会话、DB 无行"→ 过期扫描扫不到该会话，行永不删除；③ 反向：DB 有行但缓存已失效时，`validateSessions` 会通过 `retrieveSession` 抛 `InvalidSessionException` 补偿删除；④ `shiro.session.maxSession: -1`（不限并发）与 `kickoutAfter: false` 意味着没有上限保护 | 事实 |
| 5 | **四张关联表都是"先删后批插"的整表覆盖** | `SysUserServiceImpl.insertUserAuth`（删 `sys_user_role` 后重插）、`SysUserServiceImpl.updateUser`（删 `sys_user_role`+`sys_user_post` 后重插）、`SysUserServiceImpl.insertUserRole`/`insertUserPost`、`SysRoleServiceImpl.insertRoleMenu`（由 `updateRole` 先删后插）、`SysRoleServiceImpl.insertRoleDept`（由 `authDataScope` 先删后插）、`SysRoleServiceImpl.insertAuthUsers` | 两个管理员同时对同一用户/角色操作时，后提交者会完整覆盖先提交者的授权（无乐观锁、无版本列）；`sys_user_role` 更是被用户页（`insertUserAuth`/`updateUser`）与角色页（`insertAuthUsers`）双向覆盖（见 3.1）。关联表**没有任何审计字段**，覆盖痕迹不可追溯 | 事实 |
| 6 | **授权与日志导出操作无审计** | `OpenAuthController`（`/admin/open/auth/save` 保存应用-接口授权）与 `OpenLogController`（`list`/`stats`/`exportCsv`）两个类**全文不含 `@Log` 注解**，而 `OpenAppController`（`:55/72/82/91`）与 `OpenApiMgrController`（`:75/91/100`）都有 | "谁改了开放平台授权""谁导出了含报文正文的调用日志 CSV"不会进 `sys_oper_log`；结合 `open_app_api` 无审计字段，授权变更完全无痕 | 事实 |
| 7 | **`sys_dict_data.dict_type` 跨 Service 改写** | `SysDictDataServiceImpl.updateDictData`（单行改 `dict_type`）与 `SysDictTypeServiceImpl.updateDictType`（`update sys_dict_data set dict_type=新值 where dict_type=旧值` 批量改） | 两条路径都改同一列且无互斥；单行改可以把一行挪到类型表中不存在的 `dict_type` 下，形成悬空引用（本列无外键约束）；级联改名那条 SQL **不写 `update_by`/`update_time`** | 事实 |
| 8 | **`sys_config` 缓存与数据库双写** | 缓存侧 `CacheUtils`（Ehcache `sys-config`，`SysConfigServiceImpl:58-179`）；数据库侧任何直连写入 | 直接 `UPDATE sys_config` 不生效，须重启或走缓存清理；而缓存清理的监控页面（`monitor:cache:*`）菜单已被 `40-open-api-menu.sql:82-90` 删除，管理员没有可达的刷新入口 | 事实 |
| 9 | **`open_app` / `open_api` / `open_app_api` 被三份种子脚本反复重建** | `50-open-api-seed.sql`（两套方言）、`open_api_selftest_seed.sql`、`open_api_httpbin_min_seed.sql` 都以 `DELETE FROM open_app_api/open_api/open_app WHERE s_id/ID IN (...)` 开头 | 固定 ID 段（`90001`、`90001-90009`、`90103-90105`）的数据会被反复物理删除重建；`open_api.app_key`/`api_path` 的 `UNIQUE` 约束使"局部导入"可能因唯一键冲突中断；`httpbin_min_seed` 的 `ON DUPLICATE KEY UPDATE` 是 MySQL 专有语法，在 PostgreSQL 上直接报错 | 事实 |
| 10 | **`sys_dept.ancestors` 冗余列与 `DataScopeAspect` 运行期 SQL** | 写方 `SysDeptServiceImpl.updateDeptChildren` 批量重写；读方 `DataScopeAspect.java:136` 把 `find_in_set` 子查询注入 `${params.dataScope}` | 移动部门时 `ancestors` 的重算与并发登录用户的数据范围查询之间存在窗口，用户可能在一次请求内看到新旧范围混合的数据；`find_in_set` 在 PostgreSQL 上不存在（另一处同类判断 `SysDeptMapper.xml:82` 用的是 PG 语法 `position(... in ...)`），两处实现不一致 | 事实 |

### 4.3 幽灵列与未落库的审计赋值

| 序号 | 现象 | 证据 | 证据等级 |
|---:|---|---|---|
| 1 | `open_app` / `open_api` / `open_app_api` / `open_call_log` / `open_api_doc` 五张表的 `create_by` / `update_by` **没有物理列**（5 份 DDL 脚本均无 `s_create_by`、`s_update_by`），但 `OpenAppController.java:61` 调 `app.setsCreateBy(getLoginName())`、`:78` 调 `app.setsUpdateBy(getLoginName())` | `OpenManageService.insertApp:108-111` 与 `updateApp:117-119` 的 SQL 列清单都不含创建人/更新人；`OptBaseEntity.java:24,56` 只是 Java 字段 | 事实 |
| 2 | `OptBaseEntity` 声明 12 个业务字段（`sId`、`sCreateBy`、`sCreatedDept`、`sOwner`、`sOwnerDept`、`sFacilitator`、`sCreatedTime`、`sStatus`、`sIsDel`、`sOrgCode`、`sUpdatedTime`、`sUpdateBy`），`open_app` 只有其中 5 个有物理列（`s_id`、`s_status`、`s_is_del`、`s_created_time`、`s_updated_time`） | `OptBaseEntity.java:16-64` 对比 `mysql/init/30-open-api.sql:10-25` | 事实 |
| 3 | `s_status` 与 `s_is_del` 两个兼容列在 `open_*` 五张表中**从未被应用代码读写**：全部 SELECT 与 INSERT/UPDATE 语句里出现的都是 `status`（业务启停位），不是 `s_status`；`s_is_del` 只由 DDL 默认值（`1`）与幂等升级脚本的 `COALESCE` 回填 | `OpenManageService.java:42-43,70-71,80-82,109,118,140,154-155,182-183,192-193,204,222,286-287,333,364,371` 全部语句 | 事实 |
| 4 | 兼容语义自相矛盾：`OptBaseEntity.java:45-46` 注释"删除标识:0：无效;1：有效"，DDL 默认值为 `1`，而 `31-open-api-compat.sql:57` 的回填语句是 `s_is_del = COALESCE(s_is_del, 1)` | 三处证据一致指向"1 = 有效"，与 RuoYi 原生 `del_flag`（`0` = 存在）语义相反；任何按 `del_flag` 习惯写 `where s_is_del = 0` 的查询会得到"全部已删除"的错误结论 | 事实 |

### 4.4 无写入方但被升级脚本改写的数据

`31-open-api-compat.sql`（两套方言各一份）对 5 张 `open_*` 表执行无条件全表 `UPDATE ... SET s_status/s_is_del/s_created_time/s_updated_time/create_time/update_time = COALESCE(...)`。这意味着即使应用代码从不写这些列，**迁移脚本也是一个事实上的写入方**，且它按 `COALESCE(目标列, 源列, NOW())` 的优先级回填 —— 在 PostgreSQL 侧，因为 `update_time`/`s_updated_time` 没有 `ON UPDATE CURRENT_TIMESTAMP`，该脚本会把 `update_time` 一次性刷成脚本执行时刻的值，丢失原有的"最后业务修改时间"。证据等级：事实。

## 5. 数据生命周期

### 5.1 初始化（种子 SQL）

| 阶段 | 脚本 | 影响的表 | 幂等性 |
|---|---|---|---|
| 建库 | `{mysql}/init/00-create-db.sql`、`{postgres}/init/00-init.sql` | 无（仅建库/建 schema） | 非幂等（创建型） |
| 平台基线 | `{mysql,postgres}/init/10-qvsu.sql` | `sys_dept`(10)、`sys_user`(2)、`sys_post`(4)、`sys_role`(2)、`sys_menu`(55)、`sys_user_role`(2)、`sys_role_menu`(48)、`sys_role_dept`(3)、`sys_user_post`(2)、`sys_dict_type`(8)、`sys_dict_data`(24)、`sys_config`(11)、`sys_notice`(3) | **完全不幂等**：全部是 `drop table if exists` + `create table` + `insert`，重跑即清空重建 |
| OpenAPI 业务表 | `{mysql,postgres}/init/30-open-api.sql` 与 `open-api/sql/open_api.sql` | `open_app`、`open_api`、`open_app_api`、`open_call_log`、`open_api_doc`（建表 + `DROP TABLE IF EXISTS`） | 非幂等（DROP + CREATE） |
| 兼容列补齐 | `{mysql}/init/31-open-api-compat.sql`（过程式）与 `{postgres}/init/31-open-api-compat.sql`（`ADD COLUMN IF NOT EXISTS`）；独立副本 `open-api/sql/open_api_compat_upgrade.sql`（仅 MySQL 语法） | 5 张 `open_*` 的 `s_*` 列 + 全表回填 `UPDATE` | **幂等**（两侧各自实现） |
| Quartz 与任务 | `{mysql,postgres}/init/35-quartz.sql` 与 `open-api/sql/quartz.sql` | `sys_job`(3)、`sys_dict_type`(2)、`sys_dict_data`(4)、`sys_menu`(8)、`sys_role_menu`(9)、11 张 `QRTZ_*`（仅建表） | 部分幂等：`CREATE TABLE IF NOT EXISTS` + `INSERT ... WHERE NOT EXISTS`；但 `UPDATE sys_menu SET ... WHERE menu_id = 110` 是无条件覆盖；PG 版尾部有 `setval` |
| OpenAPI 菜单 | `{mysql,postgres}/init/40-open-api-menu.sql` 与 `open-api/sql/open_api_menu.sql` | `sys_menu`（+22 行、-若干行）、`sys_role_menu`（+34 行、-若干行），并 `DROP TABLE gen_table`、`gen_table_column` | 部分幂等：先按区间 DELETE 再 INSERT，可重复执行；但**会静默删除区间内的其他菜单**（见 4.2 第 1 条） |
| 自检种子 | `{mysql,postgres}/init/50-open-api-seed.sql`、`open-api/sql/open_api_selftest_seed.sql`、`open-api/sql/open_api_httpbin_min_seed.sql` | `open_app`(1)、`open_api`(9 / 5 / 3)、`open_app_api`(9 / 4 / 3) | 前两份靠"先 DELETE 固定 ID 再 INSERT"实现幂等；`httpbin_min_seed` 用 MySQL 专有 `ON DUPLICATE KEY UPDATE`（PG 上不可执行） |
| 文档生成种子 | `open-api/sql/open_api.sql` 附带的 `open_call_log_headers_upgrade.sql` | `open_call_log` 加 `req_headers` / `resp_headers` 两列 | 非幂等，且为 MySQL 专有 `AFTER` 子句 |

### 5.2 运行期写入

| 写入模式 | 表 | 触发频率线索 | 事务性 |
|---|---|---|---|
| 同步、事务内 | `sys_user`、`sys_role`、`sys_menu`、`sys_dept`、`sys_post`、`sys_dict_type`、`sys_dict_data`、`sys_config`、`sys_notice`、`sys_user_role`、`sys_role_menu`、`sys_role_dept`、`sys_user_post`、`open_app`、`open_api`、`open_app_api`、`open_api_doc`、`sys_job` | 人工操作触发 | 有关联表的操作都用 `@Transactional`（`SysUserServiceImpl:180/197/220/252/311`、`SysRoleServiceImpl:137/154/182/197/214`、`SysDictTypeServiceImpl:196`、`SysDeptServiceImpl:212`、`OpenManageService:101/122/199/227/258`） |
| 异步、事务外 | `sys_oper_log`（`AsyncManager` + `AsyncFactory.recordOper`）、`sys_logininfor`（`AsyncFactory.recordLogininfor`）、`sys_user_online`（`AsyncFactory.syncSessionToDb`） | 每次带 `@Log` 的请求 / 每次认证事件 / 每 `dbSyncPeriod` 分钟每会话 | **无**：脱离调用方事务，业务回滚不撤销、日志失败不回滚业务 |
| 同步、事务外（无事务注解） | `open_call_log`（`OpenApiLogService.save` 仅在 `jdbcTemplate.update` 外裹 try/catch） | **每个 `/open/**` 请求 1 行** | 无；异常被吞（`:51-54`） |
| Quartz 工作线程 | `sys_job_log` | 每个启用的 `sys_job` 每次触发 1 行（种子任务均为暂停，开箱不增长） | 无（`AbstractQuartzJob` 的 try/catch 使日志失败不影响任务） |
| 启动期 | `sys_config`（`@PostConstruct loadingConfigCache` 只读不写库）、`sys_job`（`init()` 只读库后写内存 `scheduler`）、`SysDictTypeServiceImpl`（缓存预热） | 每次应用启动 | 不适用 |

### 5.3 逻辑删除与回收

| 表 | 删除方式 | 是否可恢复 | 清理入口 |
|---|---|---|---|
| `sys_user` | `del_flag='2'`（`SysUserMapper.xml:158-167`） | 可恢复（改回 `'0'`），但 `selectUserByLoginName` 等查询都带 `del_flag='0'`，无界面入口恢复 | 无 UI；只能改库 |
| `sys_role` | `del_flag='2'`（`SysRoleMapper.xml:84-93`） | 同上 | 无 UI；只能改库 |
| `sys_dept` | `del_flag='2'`（`SysDeptMapper.xml:147-149`） | 同上 | 无 UI；只能改库 |
| `sys_user_role` / `sys_role_menu` / `sys_role_dept` / `sys_user_post` | 物理 DELETE | 不可恢复 | 由对应的用户/角色保存操作隐式清理 |
| `sys_menu` | 物理 DELETE（含一层子行） | 不可恢复 | 菜单管理页；**不清理 `sys_role_menu`** |
| `sys_post` / `sys_dict_type` / `sys_dict_data` / `sys_config` / `sys_notice` / `sys_job` | 物理 DELETE | 不可恢复 | 各自管理页 |
| `sys_oper_log` | 按 ID 物理 DELETE + `TRUNCATE` | 不可恢复 | **`cleanOperLog` 存在但无 Controller、无菜单**（4.1 第 2 条） |
| `sys_logininfor` | 按 ID 物理 DELETE + `TRUNCATE` | 不可恢复 | **`cleanLogininfor` 存在但无 Controller、无菜单**（4.1 第 3 条） |
| `sys_job_log` | 按 ID 物理 DELETE + `TRUNCATE` | 不可恢复 | `SysJobLogController.clean`（`/monitor/jobLog/clean`）可用，但该页面**无菜单入口**（4.1 第 5 条），须手输 URL |
| `sys_user_online` | 物理 DELETE | 不可恢复 | 框架内部自动清理（`OnlineWebSessionManager.validateSessions`）；无人工入口 |
| `open_app` | 物理 DELETE（`deleteAppByIds`，并先删 `open_app_api`） | 不可恢复 | 应用管理页"删除"按钮；无回收站 |
| `open_api` | 物理 DELETE（`deleteApiByIds`，并先删 `open_app_api`） | 不可恢复 | 接口管理页"删除"按钮 |
| `open_app_api` | 物理 DELETE | 不可恢复 | 授权管理页保存（整表覆盖）或删应用/删接口时级联 |
| `open_call_log` | **无任何删除路径** | 不适用 | **完全缺失**（4.2 第 3 条） |
| `open_api_doc` | **无任何删除路径** | 不适用 | **完全缺失**；文档只能新增 |
| 11 张 `QRTZ_*` | 无数据，无删除路径 | 不适用 | 不适用 |

### 5.4 是否有人工清理入口（汇总）

| 清理能力 | 代码层 | UI 层（`sys_menu` 可达） |
|---|---|---|
| 清空操作日志 | 有（`cleanOperLog` → `TRUNCATE`） | **无**（`monitor:operlog:*` 菜单被删除，且无 Controller） |
| 清空登录日志 | 有（`cleanLogininfor` → `TRUNCATE`） | **无**（同上） |
| 清空定时任务日志 | 有（`cleanJobLog` → `TRUNCATE`，`SysJobLogController./monitor/jobLog/clean`） | **无菜单**（页面模板存在但无 `sys_menu` 行） |
| 强制下线在线用户 | 有（`forceLogout`/`batchDeleteOnline`） | **无**（`monitor:online:*` 菜单被删除） |
| 刷新参数/字典缓存 | 有（`resetConfigCache`、`resetDictCache`、`clearConfigCache`、`clearDictCache`） | **无**（`monitor:cache:*` 菜单被删除） |
| 清理调用日志 | **无**（无 DELETE、无归档任务） | **无** |
| 清理接口文档 | **无**（无 DELETE） | **无** |
| 清理孤儿 `sys_role_menu` | **无** | **无** |
| 删除/清理 `QRTZ_*` | 不需要（无数据） | 不适用 |

## 6. 敏感数据清单

| 序号 | 对象 | 敏感内容 | 存储形态与风险 | 证据等级 |
|---:|---|---|---|---|
| 1 | `sys_user.password` | 口令哈希 | `MD5(loginName + password + salt)` 的 32 位十六进制（`SysPasswordService.java:81-84`）。**单轮 MD5、无迭代、无慢哈希**，且 `loginName` 与 `salt` 均可从同一行读取，属可离线高速爆破的弱哈希。列宽 `varchar(50)` 恰好容纳 32 位十六进制，说明设计上不打算用更长摘要 | 事实 |
| 2 | `sys_user.salt` | 明文盐 | `varchar(20)`，种子值仅为 `'111111'` / `'222222'`（`10-qvsu.sql:71-72`）；默认空串（DDL `default ''`），即新建用户可能拿到空盐 | 事实 |
| 3 | `open_app.app_secret` | 开放平台签名密钥 | 明文存储，格式 `"sk_" + UUID.randomUUID().toString().replace("-","")`（`OpenManageService.java:395-398`）。`resetSecret` 通过 HTTP 响应体明文回传新密钥（`OpenAppController.java:97-98` `AjaxResult.success("重置成功", newSecret)`）；数据库层无列级加密、无脱敏视图 | 事实 |
| 4 | `open_app.app_key` | 应用标识（可视为半敏感） | `"ak_" + UUID` 前 16 位十六进制（`OpenManageService.java:390-393`），明文且有 `UNIQUE` 约束 | 事实 |
| 5 | 种子脚本中的固定密钥对 | `ak_selftest_demo` / `sk_selftest_demo_1234567890abcdef` | **硬编码在 5 份脚本**中：`{mysql,postgres}/init/50-open-api-seed.sql:9`、`open-api/sql/open_api_selftest_seed.sql:10`、`open-api/sql/open_api_httpbin_min_seed.sql:9`。属可预测的固定凭据，若某环境保留了自检数据则等于开放了一个已知密钥的网关账号 | 事实 |
| 6 | Druid 监控账号与数据库账号 | `postgres` / `123456` | `application-druid.yml:10-11,17`（数据源 `master`/`slave` 的 `username`/`password`）与 `:49-50`（`stat-view-servlet` 的 `login-username`/`login-password`）。明文写在版本库内；Druid 监控页可查看 SQL 与连接信息，属高风险组合。`.gitignore` 存在但对已提交文件无效 | 事实 |
| 7 | `open_call_log.req_body` / `resp_body` | 完整请求/响应报文 | 各截断 4000 字符（`OpenApiLogService.java:20,41-43`）后原文落库。若业务方把 token、身份证号、银行卡号等放在 JSON body 中，会被原文保存；`X-App-Key`/`X-Sign`/`X-Nonce`/`X-Timestamp` 四个鉴权头**不在** body 中（由 `copyHeaders` 单独处理），所以签名本身不落 body | 事实 |
| 8 | `open_call_log.req_headers` / `resp_headers` | 设计上要保存的请求/响应头（含 `X-App-Key`、`X-Sign`） | 列已建但**无写入方**（死列）。风险是"设计意图"层面：一旦按 `open_call_log_headers_upgrade.sql` 的意图补齐写入方，签名头与 Cookie 会进入数据库 | 事实 |
| 9 | `open_call_log.error_msg` | 异常信息原文 | 截 4000 字符；`OpenApiSecurityService.java:141` 在签名校验失败时会 `log.warn("... expected={}, actual={} ...")` 把**期望签名与实际签名**写进应用日志（非本表），签名可被离线复用至时间窗内 | 事实 |
| 10 | `sys_oper_log.oper_param` / `json_result` | 请求参数与响应体快照 | 各截 2000 字符（`LogAspect.java:51,163,179`）。排除列表只有 4 个属性名：`password`、`oldPassword`、`newPassword`、`confirmPassword`（`LogAspect.java:45`）——**`salt`、`appSecret`、`token`、`secret`、`idCard` 等均不在排除列表**，若出现在参数或返回对象中会被原文记录 | 事实 |
| 11 | `sys_logininfor` | 登录 IP、登录地点、浏览器、操作系统、登录名 | `ipaddr`(128)、`login_location`(255)、`browser`(50)、`os`(50) 全部明文；`login_name` 在失败分支可写入任意用户输入串（见 [数据关系与血缘](./database-relations.md) 序号 27） | 事实 |
| 12 | `sys_user_online` | 会话 ID、登录 IP、登录地点、浏览器、OS | 明文；`sessionId` 是会话主键，泄漏等价于会话劫持材料 | 事实 |
| 13 | `sys_user.email` / `sys_user.phonenumber` / `sys_dept.phone` / `sys_dept.email` / `sys_user.avatar` | 个人可识别信息与文件路径 | 明文列；`avatar` 是文件路径（`varchar(100)`），可能暴露存储目录结构 | 事实 |
| 14 | `open_api_doc.html_content` | 含 appKey 与由 appSecret 派生的签名的接入文档 | `ApiDocService.buildSignedCurl`（`:129-155`）把示例应用的 `X-App-Key` 与用 `appSecret` 计算出的 `X-Sign` 写进 HTML；`OpenDocController.generate` 把整段 HTML 落库到本列，`/admin/open/doc/download`（`:87-105`）还能直接下载。持文档者可在时间窗内复用签名头 | 事实 |
| 15 | `sys_job.request_headers` / `request_body` | HTTP 任务的明文凭据与报文 | `quartz/task/HttpTask.java:42,74,193` 的代码注释自身示例即 `{"Authorization":"Bearer token"}`；`SysJobController` 允许界面录入 `request_headers`（`SysJobMapper.xml:84,108,127`），因此 Bearer Token、Basic 凭据等会以明文存入 `sys_job.request_headers varchar(1000)` | 事实 |
| 16 | `sys_config.config_value` | 参数值 | 种子值本身不含密钥，但该列是通用键值容器，`sys.login.blackIPList`（`:471`）等安全策略也存放于此；改库需清缓存才生效（4.2 第 8 条），存在"以为改了策略实际未生效"的安全风险 | 事实 |
| 17 | `sys_notice.notice_content` | 富文本公告（可含外链图片与 HTML） | 种子第 3 条含多个外部站点链接与图片（`10-qvsu.sql:535`）；渲染路径未做 HTML 白名单（XSS 过滤配置见 [配置清单](./config-index.md)），属内容注入面而非数据泄漏面 | 推断 |
| 18 | 应用日志 `sys-user` logger | 登录 IP、地址、登录名、状态、消息 | `AsyncFactory.java:102-109` 把同一份 `sys_logininfor` 内容同时写入名为 `sys-user` 的 logger，日志落地形式与保留策略由 `logback.xml` 决定 | 事实 |

## 7. 存疑项与待确认

| 序号 | 存疑内容 | 现有证据 | 需要的动作 |
|---:|---|---|---|
| Q1 | `open_call_log` 在生产环境的实际行数与日均写入量 | 单请求 1 行、无清理路径、`call_time` 索引仅在 MySQL DDL 中存在 | 采样 `select count(*), pg_total_relation_size('open_call_log') from open_call_log`，并比对日均增量 |
| Q2 | `sys_user_online` 行数与 Shiro 缓存活跃会话数的偏差 | `dbSyncPeriod=1` 分钟 + 异步写入，无对账机制 | 生产采样比对，并核对是否存在长期滞留的死行 |
| Q3 | `sys_role_menu` 中孤儿行数量 | `SysMenuMapper.deleteMenuById` 不级联删除 | 执行 `select count(*) from sys_role_menu rm left join sys_menu m on rm.menu_id = m.menu_id where m.menu_id is null` |
| Q4 | `open_api_doc` 是否在生产使用、行数与 `html_content` 体积 | 无 UPDATE/DELETE、`selectDocList` 无分页、`generate` 每次追加 | 采样统计行数与 `avg(length(html_content))`，并确认导出下载是否被审计 |
| Q5 | `sys_job.request_headers` 是否已存入真实凭据 | 列类型支持且界面可录入，`HttpTask` 注释示例即 Bearer Token | 查 `select job_id, request_url, request_headers from sys_job where request_headers <> ''`，评估是否需列级加密 |
| Q6 | `sys_oper_log` / `sys_logininfor` / `sys_user_online` 是否确有历史数据需要保留 | 三者都无 Controller、无菜单，但都有 Mapper、删除/清空语句与模板残留 | 采样行数与时间跨度，据此决定是"补回菜单"还是"登记为废弃表" |
| Q7 | `open_*` 五张表的 `s_is_del` / `s_status` 兼容列是否仍需要保留 | 代码零访问，仅 DDL 与兼容升级脚本维护 | 确认兼容层的下线计划，或补上写入/过滤逻辑 |
| Q8 | `deploy/dev-docker`、`deploy/local-docker` 之外的部署形态是否使用 MySQL | `pom.xml` 无 MySQL 驱动、`pagehelper.helperDialect: postgresql`、12 处 PG 专有 Mapper SQL | 确认生产库类型；若确为 PG，可将 MySQL 方言脚本登记为废弃副本 |
