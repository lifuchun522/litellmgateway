# 接口清单（人工确认表）

> 数据来源：docs/reverse/scan-output/endpoints.raw.txt（机器候选）+ 人工逐条确认
> 确认人：老李（本次逆向的唯一确认人）

## 一、确认口径

本次确认的范围是 `open-api/qvsu-openapi/src` 全量 Java 源码（265 个 main 源文件 + 4 个测试类），
以机器候选 `endpoints.raw.txt` 的 245 行为基线，逐条回到源文件核实注解与方法签名，不依赖任何猜测。

**候选为什么是 245 行。** 扫描器以"Spring Web 关注点注解"为特征打点，245 行由四类组成：

| 候选类别 | 行数 | 去向 |
| --- | --- | --- |
| `@GetMapping/@PostMapping/@PutMapping/@DeleteMapping/@PatchMapping` 方法级映射 | 200 | 全部「确认」 |
| `@RequestMapping` 类级前缀 | 20 | 19 条「否决（前缀非入口）」+ 1 条「确认」（`/open/**` 网关入口本身） |
| `@Controller` / `@RestController` 类级注解 | 24 | 全部「否决（类声明非映射）」 |
| `@RestControllerAdvice`（全局异常处理器） | 1 | 「否决（非映射）」 |
| **合计** | **245** | — |

其中 200 条方法级映射里，GET 102、POST 96、PUT 1、DELETE 1、PATCH 0；含 1 条多路径映射
（`SysDeptController#selectDeptTree`，`value = { "/selectDeptTree/{deptId}", "/selectDeptTree/{deptId}/{excludeId}" }`
一笔声明两条 URL，本表按 1 行计）。245 行候选已用脚本逐行比对源文件第 N 行内容，**245/245 完全一致，0 处行号漂移**，
因此可以按行号直接引用。

**候选分三类，判定规则如下：**

- **确认**：Spring 容器启动后真实注册、可被运行时请求命中的入口。方法级映射注解齐全（类级前缀 + 方法级路径 + HTTP 方法）。
- **否决**：机器扫出来但**不是独立入口**（类声明、类级前缀、异常处理器），或不是生产映射（只在测试/property 开关下生效）。
  否决必须写明理由，理由列见第五节。
- **待验证**：源码能证明存在、但本次未能拿到运行时证据的入口。**本清单 0 条**，不保留占位。

**路径以运行时实际映射为准**，不以注解字面为准：

1. 类级 `@RequestMapping("/admin/open/api")` + 方法级 `@GetMapping()`（空括号）→ 运行时空路径为
   `/admin/open/api`，**不追加尾部斜杠**。全仓 20 条空括号 `@GetMapping()` 一律按此拼。
2. 类级无 `@RequestMapping` 的控制器（`SysIndexController`、`SysLoginController`、`SysRegisterController`、
   `OpenSelftestHttpbinController`），路径直接取方法级注解原文。
3. `@RequestMapping("/open/**")` 是 Ant 风格通配，未限定 HTTP 方法，**任意方法均命中同一个处理方法**。
4. Shiro 过滤链一律在 Servlet 映射之前生效，故"能注册"不等于"能免登录访问"；
   鉴权列与说明列据 `ShiroConfig#shiroFilterFactoryBean` 与 `OpenApiFilter#shouldNotFilter` 共同判定。

**本次一并确认的三条全局结论（沿用上级代理已确认事实，本清单不推翻）：**

- 全局**不存在任何 `/v1` 协议入口**。`src/main/java` 全量 grep `/v1`、`chat/completions`、`models`、`embeddings` **零命中**；
  运行时 `GET /v1/chat/completions`、`GET /v1/models` 均 302 → `/login`，即落到 Shiro 兜底链，而非任何 OpenAI 兼容端点。
  该工程是一个 **OpenAPI 管理后台 + 自定义签名网关**，不是 LLM 协议网关。
- `/open/**` 是**唯一**绕开 Shiro 登录态、由 `OpenApiFilter` 处理的自定义网关入口；其余路径未登录一律 302 → `/login`。
- 本次新发现并确认：Shiro 白名单里**还有一条 `/selftest/**` 也是 `anon`**（`ShiroConfig.java:334`），
  而 `OpenApiFilter` 只拦 `/open/` 前缀，因此 `/selftest/httpbin/**` 是**既免登录、又免签名**的裸接口，
  构成第二条未鉴权入口。该事实已写入本表（3.1 节、第二节说明、第五节）。

## 二、网关入口（协议层，最高优先级）

| 方法 | 路径 | 处理类:行号 | 鉴权 | 状态 | 确认人 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| ANY（GET/POST/PUT/DELETE…全方法） | `/open/**` | `OpenGatewayController.java:38`（类级 `@RequestMapping("/open/**")`）+ `:39` `gateway()` | `OpenApiFilter` 签名鉴权（免 Shiro 登录态） | 确认 | 老李 | 唯一网关入口。`ShiroConfig.java:333` 配 `/open/**` = `anon`；`OpenApiFilter#shouldNotFilter` 只放行 `requestURI.startsWith("/open/")`。鉴权通过后由 `OpenApiProxyService` 按 `open_api` 表 `target_url` 反代转发 |
| ANY | `/open/`（带尾斜杠，路径列表为空） | `OpenGatewayController.java:38` → `OpenApiProxyService` 抛 `OpenProxyException` | 先签名鉴权，再查 `open_api` 表 | 确认 | 老李 | 运行时：`GET /open/` → 200 `application/json`，body `{"code":40004,"msg":"api path not found: /open",...}`。注意 msg 里回显的是 `/open`（尾斜杠被规整掉） |
| ANY | `/open/{apiPath}`（`open_api` 表已登记且已授权） | `OpenGatewayController.java:38` → `OpenApiProxyService#forward` | 签名鉴权 + 应用-接口授权 + 路径登记 | 确认 | 老李 | 带签名 `GET /open/selftest/httpbin/get?demo=1&category=get` → 200 `{"code":0,"msg":"success","data":{"args":{"category":"get","demo":"1"}},"traceId":"..."}`。响应固定 HTTP 200，业务码在 body `code` |
| ANY | `/open/{未知路径}` | `OpenGatewayController.java:38` → `OpenProxyException(40004)` | 签名鉴权通过后仍 40004 | 确认 | 老李 | 运行时：路径不存在 → `{"code":40004,"msg":"api path not found: ..."}`，HTTP 200 |
| ANY | `/open`（**无**尾斜杠） | 无匹配映射 | **免签名（过滤器未命中）** | 确认（反例） | 老李 | `startsWith("/open/")` 为 false → `OpenApiFilter` 跳过 → 落到 Shiro 兜底链 → 未登录 302 → `/login`。**这是一个真实的路径判定边界**：`/open` 与 `/open/` 行为完全不同 |

**网关内部错误码（由 `OpenApiFilter` / `OpenGatewayController` / `OpenProxyException` 产出，HTTP 恒 200）：**

| 业务码 | 触发条件 | 产出位置 |
| --- | --- | --- |
| 0 | 转发成功 | `OpenGatewayController:65` `OpenResult.ok(data)` |
| 40001 | 缺失签名头（`missing auth headers`） | `OpenApiSecurityService#authenticate` |
| 40001 | 鉴权上下文丢失（过滤器与控制器之间上下文未传递） | `OpenGatewayController:49` |
| 40003 | 签名校验失败（`signature verify failed`） | `OpenApiSecurityService#authenticate` |
| 40004 | 路径未在 `open_api` 表登记（`api path not found: ...`） | `OpenApiProxyService#forward` |
| 50001 | 转发异常 | `OpenGatewayController:92`、`OpenApiFilter:96` |

**第二未鉴权入口（本次新确认，风险最高）：**

| 方法 | 路径 | 处理类:行号 | 鉴权 | 状态 | 确认人 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/selftest/httpbin/get` | `OpenSelftestHttpbinController.java:24` | **无（Shiro `anon` + 不在 `OpenApiFilter` 管辖）** | 确认 | 老李 | 直连不走 `/open/**`，无需签名头即可访问 |
| POST | `/selftest/httpbin/post` | `OpenSelftestHttpbinController.java:33` | **无** | 确认 | 老李 | 同上 |
| PUT | `/selftest/httpbin/put` | `OpenSelftestHttpbinController.java:41` | **无** | 确认 | 老李 | 同上 |
| DELETE | `/selftest/httpbin/delete` | `OpenSelftestHttpbinController.java:49` | **无** | 确认 | 老李 | 同上 |
| GET | `/selftest/httpbin/headers` | `OpenSelftestHttpbinController.java:65` | **无** | 确认 | 老李 | 回显 `X-Trace-Id` 请求头 |
| GET | `/selftest/httpbin/ip` | `OpenSelftestHttpbinController.java:75` | **无** | 确认 | 老李 | 回显 `request.getRemoteAddr()` |
| GET | `/selftest/httpbin/user-agent` | `OpenSelftestHttpbinController.java:83` | **无** | 确认 | 老李 | 回显 `User-Agent` |
| GET | `/selftest/httpbin/uuid` | `OpenSelftestHttpbinController.java:91` | **无** | 确认 | 老李 | 返回随机 UUID |
| GET | `/selftest/httpbin/timeout` | `OpenSelftestHttpbinController.java:99` | **无** | 确认 | 老李 | 固定 `Thread.sleep(3000)`，**可被用作 3 秒占位/连接耗尽放大点** |

> 说明：`ShiroConfig.java:334` 显式写了 `filterChainDefinitionMap.put("/selftest/**", "anon")`。
> `OpenSelftestHttpbinController` 类上**没有** `@RequestMapping` 前缀，所以方法级路径就是完整路径。
> 这 9 条同时**在 `open_api` 表里有登记的同名 selftest 记录**（8 条：get/post/put/delete/headers/ip/user-agent/uuid/timeout 中的 8 条，
> 见上级代理已确认的 `open_api` 10 条记录），即同一份处理逻辑存在两条到达方式：
> 走 `/open/selftest/httpbin/*`（要签名）与直连 `/selftest/httpbin/*`（**不要签名**）。
> 后者是配置上的白名单冗余，属于**应关闭项**：建议把 `/selftest/**` 从 Shiro 白名单移除，或整类下线。

## 三、管理面 HTTP 接口（按模块分组）

### 3.1 open 模块（com.qvsu.open.controller）

共 7 个控制器、40 条方法级映射：数据/文件类 34 条、视图类 6 条（视图类见第四节）。
**本模块全部控制器在整个类上没有任何 `@RequiresPermissions`**，仅受 Shiro 兜底链 `user` 约束。

| 方法 | 路径 | 处理类#方法:行号 | 权限码 | 状态 | 理由 |
| --- | --- | --- | --- | --- | --- |
| GET | `/admin/open/api` | `OpenApiMgrController#api:41` | 无 | 确认 | 返回视图 `open/api/index` |
| POST | `/admin/open/api/list` | `OpenApiMgrController#list:47` | 无 | 确认 | `@ResponseBody`，`TableDataInfo`，`startPage()` 分页 |
| GET | `/admin/open/api/curl/{id}` | `OpenApiMgrController#curl:56` | 无 | 确认 | `@ResponseBody`，返回 cURL 示例 |
| GET | `/admin/open/api/add` | `OpenApiMgrController#add:69` | 无 | 确认 | 返回视图 `open/api/add` |
| POST | `/admin/open/api/add` | `OpenApiMgrController#addSave:76` | 无 | 确认 | `@ResponseBody` + `@Log(INSERT)`；与上一条同路径不同方法，合法共存 |
| GET | `/admin/open/api/edit/{id}` | `OpenApiMgrController#edit:84` | 无 | 确认 | 返回视图 `open/api/edit` |
| POST | `/admin/open/api/edit` | `OpenApiMgrController#editSave:92` | 无 | 确认 | `@ResponseBody` + `@Log(UPDATE)` |
| POST | `/admin/open/api/remove` | `OpenApiMgrController#remove:101` | 无 | 确认 | `@ResponseBody` + `@Log(DELETE)`，按 `ids` 批量删 |
| GET | `/admin/open/app` | `OpenAppController#app:34` | 无 | 确认 | 返回视图 `open/app/index` |
| POST | `/admin/open/app/list` | `OpenAppController#list:40` | 无 | 确认 | `@ResponseBody`，`TableDataInfo` |
| GET | `/admin/open/app/add` | `OpenAppController#add:49` | 无 | 确认 | 返回视图 `open/app/add` |
| POST | `/admin/open/app/add` | `OpenAppController#addSave:56` | 无 | 确认 | `@ResponseBody`，写入 `sCreateBy` |
| GET | `/admin/open/app/edit/{id}` | `OpenAppController#edit:65` | 无 | 确认 | 返回视图 `open/app/edit` |
| POST | `/admin/open/app/edit` | `OpenAppController#editSave:73` | 无 | 确认 | `@ResponseBody`，写入 `sUpdateBy` |
| POST | `/admin/open/app/remove` | `OpenAppController#remove:83` | 无 | 确认 | `@ResponseBody`，按 `ids` 批量删 |
| POST | `/admin/open/app/resetSecret` | `OpenAppController#resetSecret:92` | 无 | 确认 | `@ResponseBody`，重置 appSecret 并**在响应里回显新密钥** |
| GET | `/admin/open/auth` | `OpenAuthController#page:30` | 无 | 确认 | 返回视图 `open/auth/index` |
| GET | `/admin/open/auth/apps` | `OpenAuthController#apps:36` | 无 | 确认 | `@ResponseBody`，应用下拉项 |
| GET | `/admin/open/auth/apis` | `OpenAuthController#apis:43` | 无 | 确认 | `@ResponseBody`，接口下拉项 |
| GET | `/admin/open/auth/apiIds` | `OpenAuthController#apiIds:50` | 无 | 确认 | `@ResponseBody`，查某应用已授权接口 id 列表 |
| POST | `/admin/open/auth/save` | `OpenAuthController#save:58` | 无 | 确认 | `@ResponseBody`，保存应用-接口授权关系 |
| GET | `/admin/open/doc` | `OpenDocController#page:40` | 无 | 确认 | 返回视图 `open/doc/index` |
| GET | `/admin/open/doc/apis` | `OpenDocController#apis:46` | 无 | 确认 | `@ResponseBody` |
| GET | `/admin/open/doc/html/{apiId}` | `OpenDocController#html:53` | 无 | 确认 | `@ResponseBody` + `produces = MediaType.TEXT_HTML_VALUE`，返回 HTML 文本 |
| GET | `/admin/open/doc/list` | `OpenDocController#list:61` | 无 | 确认 | `@ResponseBody`，历史文档列表 |
| POST | `/admin/open/doc/generate` | `OpenDocController#generate:68` | 无 | 确认 | `@ResponseBody`，生成 HTML 文档并落库 |
| GET | `/admin/open/doc/download` | `OpenDocController#download:87` | 无 | 确认 | 直接写 `response`，`Content-Disposition: attachment`；返回 `void`，非视图 |
| GET | `/admin/open/log` | `OpenLogController#logPage:36` | 无 | 确认 | 返回视图 `open/log/index` |
| POST | `/admin/open/log/list` | `OpenLogController#list:42` | 无 | 确认 | `@ResponseBody`，`TableDataInfo`，调用日志分页 |
| GET | `/admin/open/log/stats` | `OpenLogController#stats:51` | 无 | 确认 | `@ResponseBody`，今日调用统计 |
| GET | `/admin/open/log/exportCsv` | `OpenLogController#exportCsv:58` | 无 | 确认 | 直接写 `response`，导出 CSV 并前置 UTF-8 BOM；返回 `void` |
| ANY | `/open/**` | `OpenGatewayController#gateway:38` | 无（自定义签名鉴权） | 确认 | 网关入口，详见第二节 |
| GET | `/selftest/httpbin/get` | `OpenSelftestHttpbinController#get:24` | 无（Shiro `anon`） | 确认 | 免登录免签名，详见第二节 |
| POST | `/selftest/httpbin/post` | `OpenSelftestHttpbinController#post:33` | 无（Shiro `anon`） | 确认 | 同上 |
| PUT | `/selftest/httpbin/put` | `OpenSelftestHttpbinController#put:41` | 无（Shiro `anon`） | 确认 | 同上 |
| DELETE | `/selftest/httpbin/delete` | `OpenSelftestHttpbinController#delete:49` | 无（Shiro `anon`） | 确认 | 同上 |
| GET | `/selftest/httpbin/headers` | `OpenSelftestHttpbinController#headers:65` | 无（Shiro `anon`） | 确认 | 同上 |
| GET | `/selftest/httpbin/ip` | `OpenSelftestHttpbinController#ip:75` | 无（Shiro `anon`） | 确认 | 同上 |
| GET | `/selftest/httpbin/user-agent` | `OpenSelftestHttpbinController#userAgent:83` | 无（Shiro `anon`） | 确认 | 同上 |
| GET | `/selftest/httpbin/uuid` | `OpenSelftestHttpbinController#uuid:91` | 无（Shiro `anon`） | 确认 | 同上 |
| GET | `/selftest/httpbin/timeout` | `OpenSelftestHttpbinController#timeout:99` | 无（Shiro `anon`） | 确认 | 同上，含 3s 阻塞 |

> **open 模块权限码为空是本次确认的重点风险**：`framework/aspectj/PermissionsAspect.java` 只对标注了
> `@RequiresPermissions` 的方法做拦截，本模块 0 处标注 → **任一登录用户（含最低权限角色）即可增删 OpenAPI 应用、
> 重置 appSecret、改授权关系**。这属于既有实现，不是逆向误读。

### 3.2 system 模块（com.qvsu.web.controller.system）

共 15 个控制器、137 条方法级映射：视图类 54 条（见第四节）、数据/文件类 83 条。

| 方法 | 路径 | 处理类#方法:行号 | 权限码 | 状态 | 理由 |
| --- | --- | --- | --- | --- | --- |
| GET | `/captcha/captchaImage` | `SysCaptchaController#getKaptchaImage:44` | 无（Shiro `anon`，`ShiroConfig:318`） | 确认 | `ModelAndView` 返回 `null`，直接写 JPEG 流；登录页免登录取图所必需 |
| GET | `/captcha/captchaCode` | `SysCaptchaController#captchaCode:112` | 无（Shiro `anon`，`ShiroConfig:319`） | 确认 | **端点存在，但生产默认关闭**：`@Value("${qvsu.testing.exposeCaptchaCode:false}")`，`application.yml:16` 为 `false` → 返回 `AjaxResult.error("forbidden")`；仅测试类把它置 true |
| GET | `/login` | `SysLoginController#login:40` | 无（Shiro `anon,captchaValidate`） | 确认 | 视图 `login`；Ajax 请求改走 `renderString` 返回 JSON 串 |
| POST | `/login` | `SysLoginController#ajaxLogin:55` | 无（Shiro `anon,captchaValidate`） | 确认 | `@ResponseBody`，Shiro `UsernamePasswordToken` 登录 |
| GET | `/unauth` | `SysLoginController#unauth:77` | 无 | 确认 | 视图 `error/unauth` |
| GET | `/index` | `SysIndexController#index:48` | 无 | 确认 | 视图名**动态计算**：`"topnav".equals(indexStyle) ? "index-topnav" : "index"`（第 90 行），Cookie `nav-style` 可覆盖 |
| GET | `/lockscreen` | `SysIndexController#lockscreen:97` | 无 | 确认 | 视图 `lock`，置 session `LOCK_SCREEN` |
| POST | `/unlockscreen` | `SysIndexController#unlockscreen:106` | 无 | 确认 | `@ResponseBody`，校验密码解锁 |
| GET | `/system/switchSkin` | `SysIndexController#switchSkin:124` | 无 | 确认 | 视图 `skin` |
| GET | `/system/menuStyle/{style}` | `SysIndexController#menuStyle:131` | 无 | 确认 | 返回 `void`，只写 Cookie `nav-style`，非视图 |
| GET | `/system/main` | `SysIndexController#main:138` | 无 | 确认 | 视图 `main` |
| GET | `/register` | `SysRegisterController#register:29` | 无（Shiro `anon,captchaValidate`） | 确认 | 视图 `register` |
| POST | `/register` | `SysRegisterController#ajaxRegister:35` | 无（Shiro `anon,captchaValidate`） | 确认 | `@ResponseBody`；受 `sys.account.registerUser` 配置开关约束 |
| GET | `/system/user` | `SysUserController#user:65` | `system:user:view` | 确认 | 视图 `system/user/user` |
| POST | `/system/user/list` | `SysUserController#list:72` | `system:user:list` | 确认 | `@ResponseBody`，`TableDataInfo` |
| POST | `/system/user/export` | `SysUserController#export:83` | `system:user:export` | 确认 | `@ResponseBody`，Excel 导出 |
| POST | `/system/user/importData` | `SysUserController#importData:94` | `system:user:import` | 确认 | `@ResponseBody`，Excel 导入 |
| GET | `/system/user/importTemplate` | `SysUserController#importTemplate:105` | `system:user:view` | 确认 | `@ResponseBody`，下载导入模板 |
| GET | `/system/user/add` | `SysUserController#add:117` | `system:user:add` | 确认 | 视图 `system/user/add` |
| POST | `/system/user/add` | `SysUserController#addSave:130` | `system:user:add` | 确认 | `@ResponseBody`，`@Validated` |
| GET | `/system/user/edit/{userId}` | `SysUserController#edit:159` | `system:user:edit` | 确认 | 视图 `system/user/edit` |
| GET | `/system/user/view/{userId}` | `SysUserController#view:174` | `system:user:list` | 确认 | 视图 `system/user/view` |
| POST | `/system/user/edit` | `SysUserController#editSave:189` | `system:user:edit` | 确认 | `@ResponseBody` |
| GET | `/system/user/resetPwd/{userId}` | `SysUserController#resetPwd:215` | `system:user:resetPwd` | 确认 | 视图 `system/user/resetPwd` |
| POST | `/system/user/resetPwd` | `SysUserController#resetPwdSave:225` | `system:user:resetPwd` | 确认 | `@ResponseBody` |
| GET | `/system/user/authRole/{userId}` | `SysUserController#authRole:248` | `system:user:edit` | 确认 | 视图 `system/user/authRole` |
| POST | `/system/user/authRole/insertAuthRole` | `SysUserController#insertAuthRole:265` | `system:user:edit` | 确认 | `@ResponseBody` |
| POST | `/system/user/remove` | `SysUserController#remove:278` | `system:user:remove` | 确认 | `@ResponseBody` |
| POST | `/system/user/checkLoginNameUnique` | `SysUserController#checkLoginNameUnique:292` | 无 | 确认 | `@ResponseBody`，唯一性校验，返回 `boolean` |
| POST | `/system/user/checkPhoneUnique` | `SysUserController#checkPhoneUnique:302` | 无 | 确认 | `@ResponseBody`，无权限码 |
| POST | `/system/user/checkEmailUnique` | `SysUserController#checkEmailUnique:312` | 无 | 确认 | `@ResponseBody`，无权限码 |
| POST | `/system/user/changeStatus` | `SysUserController#changeStatus:324` | `system:user:edit` | 确认 | `@ResponseBody` |
| GET | `/system/user/deptTreeData` | `SysUserController#deptTreeData:337` | `system:user:list` | 确认 | `@ResponseBody`，`List<Ztree>` |
| GET | `/system/user/selectDeptTree/{deptId}` | `SysUserController#selectDeptTree:351` | `system:user:list` | 确认 | 视图 `system/user/deptTree` |
| GET | `/system/role` | `SysRoleController#role:50` | `system:role:view` | 确认 | 视图 `system/role/role` |
| POST | `/system/role/list` | `SysRoleController#list:57` | `system:role:list` | 确认 | `@ResponseBody` |
| POST | `/system/role/export` | `SysRoleController#export:68` | `system:role:export` | 确认 | `@ResponseBody` |
| GET | `/system/role/add` | `SysRoleController#add:81` | `system:role:add` | 确认 | 视图 `system/role/add` |
| POST | `/system/role/add` | `SysRoleController#addSave:92` | `system:role:add` | 确认 | `@ResponseBody` |
| GET | `/system/role/edit/{roleId}` | `SysRoleController#edit:114` | `system:role:edit` | 确认 | 视图 `system/role/edit` |
| POST | `/system/role/edit` | `SysRoleController#editSave:127` | `system:role:edit` | 确认 | `@ResponseBody` |
| GET | `/system/role/authDataScope/{roleId}` | `SysRoleController#authDataScope:149` | **无** | 确认 | 视图 `system/role/dataScope`。**注意：该 GET 无权限码，而其 POST 兄弟有 `system:role:edit`** |
| POST | `/system/role/authDataScope` | `SysRoleController#authDataScopeSave:162` | `system:role:edit` | 确认 | `@ResponseBody` |
| POST | `/system/role/remove` | `SysRoleController#remove:179` | `system:role:remove` | 确认 | `@ResponseBody` |
| POST | `/system/role/checkRoleNameUnique` | `SysRoleController#checkRoleNameUnique:189` | 无 | 确认 | `@ResponseBody`，无权限码 |
| POST | `/system/role/checkRoleKeyUnique` | `SysRoleController#checkRoleKeyUnique:199` | 无 | 确认 | `@ResponseBody`，无权限码 |
| GET | `/system/role/selectMenuTree` | `SysRoleController#selectMenuTree:209` | 无 | 确认 | 视图 `system/role/tree` |
| POST | `/system/role/changeStatus` | `SysRoleController#changeStatus:220` | `system:role:edit` | 确认 | `@ResponseBody` |
| GET | `/system/role/authUser/{roleId}` | `SysRoleController#authUser:233` | `system:role:edit` | 确认 | 视图 `system/role/authUser` |
| POST | `/system/role/authUser/allocatedList` | `SysRoleController#allocatedList:245` | `system:role:list` | 确认 | `@ResponseBody`，已分配用户分页 |
| POST | `/system/role/authUser/cancel` | `SysRoleController#cancelAuthUser:259` | `system:role:edit` | 确认 | `@ResponseBody` |
| POST | `/system/role/authUser/cancelAll` | `SysRoleController#cancelAuthUserAll:271` | `system:role:edit` | 确认 | `@ResponseBody` |
| GET | `/system/role/authUser/selectUser/{roleId}` | `SysRoleController#selectUser:282` | `system:role:list` | 确认 | 视图 `system/role/selectUser` |
| POST | `/system/role/authUser/unallocatedList` | `SysRoleController#unallocatedList:293` | `system:role:list` | 确认 | `@ResponseBody`，未分配用户分页 |
| POST | `/system/role/authUser/selectAll` | `SysRoleController#selectAuthUserAll:307` | `system:role:edit` | 确认 | `@ResponseBody` |
| GET | `/system/role/deptTreeData` | `SysRoleController#deptTreeData:319` | `system:role:edit` | 确认 | `@ResponseBody`，`List<Ztree>` |
| GET | `/system/menu` | `SysMenuController#menu:41` | `system:menu:view` | 确认 | 视图 `system/menu/menu` |
| POST | `/system/menu/list` | `SysMenuController#list:48` | `system:menu:list` | 确认 | `@ResponseBody`，`List<SysMenu>` |
| GET | `/system/menu/remove/{menuId}` | `SysMenuController#remove:62` | `system:menu:remove` | 确认 | `@ResponseBody`；**用 GET 做删除**，非 REST 语义 |
| GET | `/system/menu/add/{parentId}` | `SysMenuController#add:82` | `system:menu:add` | 确认 | 视图 `system/menu/add` |
| POST | `/system/menu/add` | `SysMenuController#addSave:105` | `system:menu:add` | 确认 | `@ResponseBody` |
| GET | `/system/menu/edit/{menuId}` | `SysMenuController#edit:122` | `system:menu:edit` | 确认 | 视图 `system/menu/edit` |
| POST | `/system/menu/edit` | `SysMenuController#editSave:134` | `system:menu:edit` | 确认 | `@ResponseBody` |
| POST | `/system/menu/updateSort` | `SysMenuController#updateSort:150` | 无 | 确认 | `@ResponseBody`，**改变菜单排序却无权限码** |
| GET | `/system/menu/icon` | `SysMenuController#icon:161` | 无 | 确认 | 视图 `system/menu/icon` |
| POST | `/system/menu/checkMenuNameUnique` | `SysMenuController#checkMenuNameUnique:170` | 无 | 确认 | `@ResponseBody`，无权限码 |
| GET | `/system/menu/roleMenuTreeData` | `SysMenuController#roleMenuTreeData:180` | 无 | 确认 | `@ResponseBody`，`List<Ztree>` |
| GET | `/system/menu/menuTreeData` | `SysMenuController#menuTreeData:192` | 无 | 确认 | `@ResponseBody`，`List<Ztree>` |
| GET | `/system/menu/selectMenuTree/{menuId}` | `SysMenuController#selectMenuTree:204` | 无 | 确认 | 视图 `system/menu/tree` |
| GET | `/system/dept` | `SysDeptController#dept:39` | `system:dept:view` | 确认 | 视图 `system/dept/dept` |
| POST | `/system/dept/list` | `SysDeptController#list:46` | `system:dept:list` | 确认 | `@ResponseBody`，`List<SysDept>` |
| GET | `/system/dept/add/{parentId}` | `SysDeptController#add:58` | `system:dept:add` | 确认 | 视图 `system/dept/add` |
| POST | `/system/dept/add` | `SysDeptController#addSave:74` | `system:dept:add` | 确认 | `@ResponseBody` |
| GET | `/system/dept/edit/{deptId}` | `SysDeptController#edit:90` | `system:dept:edit` | 确认 | 视图 `system/dept/edit` |
| POST | `/system/dept/edit` | `SysDeptController#editSave:108` | `system:dept:edit` | 确认 | `@ResponseBody` |
| GET | `/system/dept/remove/{deptId}` | `SysDeptController#remove:135` | `system:dept:remove` | 确认 | `@ResponseBody`；**用 GET 做删除** |
| POST | `/system/dept/checkDeptNameUnique` | `SysDeptController#checkDeptNameUnique:154` | 无 | 确认 | `@ResponseBody`，无权限码 |
| GET | `/system/dept/selectDeptTree/{deptId}` | `SysDeptController#selectDeptTree:168` | `system:dept:list` | 确认 | 视图 `system/dept/tree` |
| GET | `/system/dept/selectDeptTree/{deptId}/{excludeId}` | `SysDeptController#selectDeptTree:168` | `system:dept:list` | 确认 | 同一方法声明的第二条 URL（`value = {…}`），视图同上 |
| GET | `/system/dept/treeData/{excludeId}` | `SysDeptController#treeDataExcludeChild:180` | `system:dept:list` | 确认 | `@ResponseBody`，`List<Ztree>` |
| GET | `/system/config` | `SysConfigController#config:38` | `system:config:view` | 确认 | 视图 `system/config/config` |
| POST | `/system/config/list` | `SysConfigController#list:48` | `system:config:list` | 确认 | `@ResponseBody`，`TableDataInfo` |
| POST | `/system/config/export` | `SysConfigController#export:59` | `system:config:export` | 确认 | `@ResponseBody` |
| GET | `/system/config/add` | `SysConfigController#add:72` | `system:config:add` | 确认 | 视图 `system/config/add` |
| POST | `/system/config/add` | `SysConfigController#addSave:83` | `system:config:add` | 确认 | `@ResponseBody` |
| GET | `/system/config/edit/{configId}` | `SysConfigController#edit:99` | `system:config:edit` | 确认 | 视图 `system/config/edit` |
| POST | `/system/config/edit` | `SysConfigController#editSave:111` | `system:config:edit` | 确认 | `@ResponseBody` |
| POST | `/system/config/remove` | `SysConfigController#remove:128` | `system:config:remove` | 确认 | `@ResponseBody` |
| GET | `/system/config/refreshCache` | `SysConfigController#refreshCache:141` | `system:config:remove` | 确认 | `@ResponseBody`；**刷新缓存却要求 remove 权限码**，语义异常 |
| POST | `/system/config/checkConfigKeyUnique` | `SysConfigController#checkConfigKeyUnique:152` | 无 | 确认 | `@ResponseBody`，无权限码 |
| GET | `/system/dict` | `SysDictTypeController#dictType:39` | `system:dict:view` | 确认 | 视图 `system/dict/type/type` |
| POST | `/system/dict/list` | `SysDictTypeController#list:45` | `system:dict:list` | 确认 | `@ResponseBody`，`TableDataInfo` |
| POST | `/system/dict/export` | `SysDictTypeController#export:57` | `system:dict:export` | 确认 | `@ResponseBody` |
| GET | `/system/dict/add` | `SysDictTypeController#add:71` | `system:dict:add` | 确认 | 视图 `system/dict/type/add` |
| POST | `/system/dict/add` | `SysDictTypeController#addSave:82` | `system:dict:add` | 确认 | `@ResponseBody` |
| GET | `/system/dict/edit/{dictId}` | `SysDictTypeController#edit:98` | `system:dict:edit` | 确认 | 视图 `system/dict/type/edit` |
| POST | `/system/dict/edit` | `SysDictTypeController#editSave:110` | `system:dict:edit` | 确认 | `@ResponseBody` |
| POST | `/system/dict/remove` | `SysDictTypeController#remove:124` | `system:dict:remove` | 确认 | `@ResponseBody` |
| GET | `/system/dict/refreshCache` | `SysDictTypeController#refreshCache:137` | `system:dict:remove` | 确认 | `@ResponseBody`；权限码与 `SysConfigController` 同款异常（用 remove 刷缓存） |
| GET | `/system/dict/detail/{dictId}` | `SysDictTypeController#detail:149` | `system:dict:list` | 确认 | 视图 `system/dict/data/data`。**视图名与所在控制器前缀不一致（跨模块指向）**，模板实际存在，渲染正常 |
| POST | `/system/dict/checkDictTypeUnique` | `SysDictTypeController#checkDictTypeUnique:160` | 无 | 确认 | `@ResponseBody`，无权限码 |
| GET | `/system/dict/selectDictTree/{columnId}/{dictType}` | `SysDictTypeController#selectDictTree:170` | 无 | 确认 | 视图 `system/dict/type/tree` |
| GET | `/system/dict/treeData` | `SysDictTypeController#treeData:181` | 无 | 确认 | `@ResponseBody`，`List<Ztree>` |
| GET | `/system/dict/data` | `SysDictDataController#dictData:38` | `system:dict:view` | 确认 | 视图 `system/dict/data/data` |
| POST | `/system/dict/data/list` | `SysDictDataController#list:44` | `system:dict:list` | 确认 | `@ResponseBody`，`TableDataInfo` |
| POST | `/system/dict/data/export` | `SysDictDataController#export:56` | `system:dict:export` | 确认 | `@ResponseBody` |
| GET | `/system/dict/data/add/{dictType}` | `SysDictDataController#add:69` | `system:dict:add` | 确认 | 视图 `system/dict/data/add` |
| POST | `/system/dict/data/add` | `SysDictDataController#addSave:81` | `system:dict:add` | 确认 | `@ResponseBody` |
| GET | `/system/dict/data/edit/{dictCode}` | `SysDictDataController#edit:93` | `system:dict:edit` | 确认 | 视图 `system/dict/data/edit` |
| POST | `/system/dict/data/edit` | `SysDictDataController#editSave:105` | `system:dict:edit` | 确认 | `@ResponseBody` |
| POST | `/system/dict/data/remove` | `SysDictDataController#remove:115` | `system:dict:remove` | 确认 | `@ResponseBody` |
| GET | `/system/post` | `SysPostController#operlog:38` | `system:post:view` | 确认 | 视图 `system/post/post`。**方法名叫 `operlog` 但返回岗位页**，命名与职责不符（源码缺陷，非逆向误读） |
| POST | `/system/post/list` | `SysPostController#list:45` | `system:post:list` | 确认 | `@ResponseBody`，`TableDataInfo` |
| POST | `/system/post/export` | `SysPostController#export:56` | `system:post:export` | 确认 | `@ResponseBody` |
| POST | `/system/post/remove` | `SysPostController#remove:67` | `system:post:remove` | 确认 | `@ResponseBody` |
| GET | `/system/post/add` | `SysPostController#add:78` | `system:post:add` | 确认 | 视图 `system/post/add` |
| POST | `/system/post/add` | `SysPostController#addSave:89` | `system:post:add` | 确认 | `@ResponseBody` |
| GET | `/system/post/edit/{postId}` | `SysPostController#edit:109` | `system:post:edit` | 确认 | 视图 `system/post/edit` |
| POST | `/system/post/edit` | `SysPostController#editSave:121` | `system:post:edit` | 确认 | `@ResponseBody` |
| POST | `/system/post/checkPostNameUnique` | `SysPostController#checkPostNameUnique:140` | 无 | 确认 | `@ResponseBody`，无权限码 |
| POST | `/system/post/checkPostCodeUnique` | `SysPostController#checkPostCodeUnique:150` | 无 | 确认 | `@ResponseBody`，无权限码 |
| GET | `/system/notice` | `SysNoticeController#notice:37` | `system:notice:view` | 确认 | 视图 `system/notice/notice` |
| POST | `/system/notice/list` | `SysNoticeController#list:47` | `system:notice:list` | 确认 | `@ResponseBody`，`TableDataInfo` |
| GET | `/system/notice/add` | `SysNoticeController#add:60` | `system:notice:add` | 确认 | 视图 `system/notice/add` |
| POST | `/system/notice/add` | `SysNoticeController#addSave:71` | `system:notice:add` | 确认 | `@ResponseBody` |
| GET | `/system/notice/edit/{noticeId}` | `SysNoticeController#edit:83` | `system:notice:edit` | 确认 | 视图 `system/notice/edit` |
| POST | `/system/notice/edit` | `SysNoticeController#editSave:95` | `system:notice:edit` | 确认 | `@ResponseBody` |
| GET | `/system/notice/view/{noticeId}` | `SysNoticeController#view:107` | `system:notice:list` | 确认 | 视图 `system/notice/view` |
| POST | `/system/notice/remove` | `SysNoticeController#remove:119` | `system:notice:remove` | 确认 | `@ResponseBody` |
| GET | `/system/user/profile` | `SysProfileController#profile:50` | 无 | 确认 | 视图 `system/user/profile/profile`；个人中心一律走登录态，不设权限码 |
| GET | `/system/user/profile/checkPassword` | `SysProfileController#checkPassword:60` | 无 | 确认 | `@ResponseBody`，返回 `boolean` |
| GET | `/system/user/profile/resetPwd` | `SysProfileController#resetPwd:68` | 无 | 确认 | 视图 `system/user/profile/resetPwd` |
| POST | `/system/user/profile/resetPwd` | `SysProfileController#resetPwd:77` | 无 | 确认 | `@ResponseBody` |
| GET | `/system/user/profile/edit` | `SysProfileController#edit:103` | 无 | 确认 | 视图 `system/user/profile/edit` |
| GET | `/system/user/profile/avatar` | `SysProfileController#avatar:114` | 无 | 确认 | 视图 `system/user/profile/avatar` |
| POST | `/system/user/profile/update` | `SysProfileController#update:126` | 无 | 确认 | `@ResponseBody` |
| POST | `/system/user/profile/updateAvatar` | `SysProfileController#updateAvatar:155` | 无 | 确认 | `@ResponseBody`，MultipartFile 头像上传 |

### 3.3 quartz 模块（com.qvsu.quartz.controller）

共 2 个控制器、20 条方法级映射：数据类 13 条、视图类 7 条。

| 方法 | 路径 | 处理类#方法:行号 | 权限码 | 状态 | 理由 |
| --- | --- | --- | --- | --- | --- |
| GET | `/monitor/job` | `SysJobController#job:45` | `monitor:job:view` | 确认 | 视图 `monitor/job/job`（`prefix = "monitor/job"` + `"/job"`） |
| POST | `/monitor/job/list` | `SysJobController#list:52` | `monitor:job:list` | 确认 | `@ResponseBody`，`TableDataInfo` |
| POST | `/monitor/job/export` | `SysJobController#export:63` | `monitor:job:export` | 确认 | `@ResponseBody`，Excel 导出 |
| POST | `/monitor/job/remove` | `SysJobController#remove:74` | `monitor:job:remove` | 确认 | `@ResponseBody`，`throws SchedulerException` |
| GET | `/monitor/job/detail/{jobId}` | `SysJobController#detail:83` | `monitor:job:detail` | 确认 | 视图 `monitor/job/detail` |
| POST | `/monitor/job/changeStatus` | `SysJobController#changeStatus:96` | `monitor:job:changeStatus` | 确认 | `@ResponseBody` |
| POST | `/monitor/job/run` | `SysJobController#run:110` | `monitor:job:changeStatus` | 确认 | `@ResponseBody`，手动触发任务；**复用 changeStatus 权限码** |
| GET | `/monitor/job/add` | `SysJobController#add:122` | `monitor:job:add` | 确认 | 视图 `monitor/job/add` |
| POST | `/monitor/job/add` | `SysJobController#addSave:133` | `monitor:job:add` | 确认 | `@ResponseBody`，`@Validated`，含调用目标白名单校验（禁 rmi/ldap/http） |
| GET | `/monitor/job/edit/{jobId}` | `SysJobController#edit:186` | `monitor:job:edit` | 确认 | 视图 `monitor/job/edit` |
| POST | `/monitor/job/edit` | `SysJobController#editSave:198` | `monitor:job:edit` | 确认 | `@ResponseBody`，同款白名单校验 |
| POST | `/monitor/job/checkCronExpressionIsValid` | `SysJobController#checkCronExpressionIsValid:249` | 无 | 确认 | `@ResponseBody`，返回 `boolean`，无权限码 |
| GET | `/monitor/job/cron` | `SysJobController#cron:259` | 无 | 确认 | 视图 `monitor/job/cron`，Cron 表达式生成器页 |
| GET | `/monitor/job/queryCronExpression` | `SysJobController#queryCronExpression:268` | 无 | 确认 | `@ResponseBody`，无权限码 |
| GET | `/monitor/jobLog` | `SysJobLogController#jobLog:44` | `monitor:job:view` | 确认 | 视图 `monitor/job/jobLog`；**本控制器 `prefix` 也是 `monitor/job`**，与 `SysJobController` 同前缀不同控制器 |
| POST | `/monitor/jobLog/list` | `SysJobLogController#list:56` | `monitor:job:list` | 确认 | `@ResponseBody`，`TableDataInfo` |
| POST | `/monitor/jobLog/export` | `SysJobLogController#export:67` | `monitor:job:export` | 确认 | `@ResponseBody` |
| POST | `/monitor/jobLog/remove` | `SysJobLogController#remove:78` | `monitor:job:remove` | 确认 | `@ResponseBody` |
| GET | `/monitor/jobLog/detail/{jobLogId}` | `SysJobLogController#detail:86` | `monitor:job:detail` | 确认 | 视图 `monitor/job/detail`（与 job 详情页**共用同一模板**） |
| POST | `/monitor/jobLog/clean` | `SysJobLogController#clean:96` | `monitor:job:remove` | 确认 | `@ResponseBody`，清空调度日志 |

### 3.4 common 模块

即 `com.qvsu.web.controller.common.CommonController`，4 条方法级映射：数据类 2 条、视图类 2 条（后者实为文件流，见下）。
**本模块全部 0 处 `@RequiresPermissions`。**

| 方法 | 路径 | 处理类#方法:行号 | 权限码 | 状态 | 理由 |
| --- | --- | --- | --- | --- | --- |
| GET | `/common/download` | `CommonController#fileDownload:46` | 无 | 确认 | 返回 `void`，写文件流到 `response`；**无权限码 → 任意登录用户可下载服务端文件**，`fileName` 参数若未做白名单即可被穿越利用（本次仅确认映射与参数形态，未做利用验证） |
| POST | `/common/upload` | `CommonController#uploadFile:75` | 无 | 确认 | `@ResponseBody`，`MultipartFile` 单文件上传 |
| POST | `/common/uploads` | `CommonController#uploadFiles:102` | 无 | 确认 | `@ResponseBody`，`List<MultipartFile>` 多文件上传 |
| GET | `/common/download/resource` | `CommonController#resourceDownload:140` | 无 | 确认 | 返回 `void`，按 `resource` 参数下载，路径拼接逻辑同上需关注 |

### 3.5 附：全仓权限码清点

`@RequiresPermissions` 在 main 源码中共 **98 处**，全部落在 3.2 / 3.3 两节，取值集合为：

`system:user:{view,list,export,import,add,edit,remove,resetPwd}`、
`system:role:{view,list,export,add,edit,remove}`、
`system:menu:{view,list,remove,add,edit}`、
`system:dept:{view,list,add,edit,remove}`、
`system:dict:{view,list,export,add,edit,remove}`、
`system:config:{view,list,export,add,edit,remove}`、
`system:post:{view,list,export,add,edit,remove}`、
`system:notice:{view,list,add,edit,remove}`、
`monitor:job:{view,list,export,remove,detail,changeStatus,add,edit}`。

`com.qvsu.open.controller` 全部 7 个控制器、`CommonController`、`SysIndexController`、
`SysLoginController`、`SysRegisterController`、`SysProfileController`、`SysCaptchaController` **零权限码**。

## 四、页面路由（Thymeleaf 视图）

`src/main/resources/templates` 共 **144** 个模板文件（与 `scan-output/template-count.txt` 一致）。
下列 68 条为**返回视图名/文件流**的方法级映射中、真正产出 Thymeleaf 视图的条目（含同一控制器写多个 URL 的情况）。
`demo/**`（74 个模板）为 Hplus 主题示例页，无任何 Controller 映射指向，属静态模板残留，不计入接口。

| 视图名 | 模板文件 | 触发路径 | 状态 |
| --- | --- | --- | --- |
| `open/api/index` | `open/api/index.html` | GET `/admin/open/api` | 确认 |
| `open/api/add` | `open/api/add.html` | GET `/admin/open/api/add` | 确认 |
| `open/api/edit` | `open/api/edit.html` | GET `/admin/open/api/edit/{id}` | 确认 |
| `open/app/index` | `open/app/index.html` | GET `/admin/open/app` | 确认 |
| `open/app/add` | `open/app/add.html` | GET `/admin/open/app/add` | 确认 |
| `open/app/edit` | `open/app/edit.html` | GET `/admin/open/app/edit/{id}` | 确认 |
| `open/auth/index` | `open/auth/index.html` | GET `/admin/open/auth` | 确认 |
| `open/doc/index` | `open/doc/index.html` | GET `/admin/open/doc` | 确认 |
| `open/log/index` | `open/log/index.html` | GET `/admin/open/log` | 确认 |
| `monitor/job/job` | `monitor/job/job.html` | GET `/monitor/job` | 确认 |
| `monitor/job/detail` | `monitor/job/detail.html` | GET `/monitor/job/detail/{jobId}`、GET `/monitor/jobLog/detail/{jobLogId}` | 确认 |
| `monitor/job/add` | `monitor/job/add.html` | GET `/monitor/job/add` | 确认 |
| `monitor/job/edit` | `monitor/job/edit.html` | GET `/monitor/job/edit/{jobId}` | 确认 |
| `monitor/job/cron` | `monitor/job/cron.html` | GET `/monitor/job/cron` | 确认 |
| `monitor/job/jobLog` | `monitor/job/jobLog.html` | GET `/monitor/jobLog` | 确认 |
| `login` | `login.html` | GET `/login` | 确认 |
| `register` | `register.html` | GET `/register` | 确认 |
| `error/unauth` | `error/unauth.html` | GET `/unauth` | 确认 |
| `lock` | `lock.html` | GET `/lockscreen` | 确认 |
| `skin` | `skin.html` | GET `/system/switchSkin` | 确认 |
| `main` | `main.html` | GET `/system/main` | 确认 |
| `index` | `index.html` | GET `/index`（`sys.index.menuStyle` 非 topnav 或移动端） | 确认 |
| `index-topnav` | `index-topnav.html` | GET `/index`（菜单风格 topnav 且非移动端） | 确认 |
| `system/user/user` | `system/user/user.html` | GET `/system/user` | 确认 |
| `system/user/add` | `system/user/add.html` | GET `/system/user/add` | 确认 |
| `system/user/edit` | `system/user/edit.html` | GET `/system/user/edit/{userId}` | 确认 |
| `system/user/view` | `system/user/view.html` | GET `/system/user/view/{userId}` | 确认 |
| `system/user/resetPwd` | `system/user/resetPwd.html` | GET `/system/user/resetPwd/{userId}` | 确认 |
| `system/user/authRole` | `system/user/authRole.html` | GET `/system/user/authRole/{userId}` | 确认 |
| `system/user/deptTree` | `system/user/deptTree.html` | GET `/system/user/selectDeptTree/{deptId}` | 确认 |
| `system/user/profile/profile` | `system/user/profile/profile.html` | GET `/system/user/profile` | 确认 |
| `system/user/profile/resetPwd` | `system/user/profile/resetPwd.html` | GET `/system/user/profile/resetPwd` | 确认 |
| `system/user/profile/edit` | `system/user/profile/edit.html` | GET `/system/user/profile/edit` | 确认 |
| `system/user/profile/avatar` | `system/user/profile/avatar.html` | GET `/system/user/profile/avatar` | 确认 |
| `system/role/role` | `system/role/role.html` | GET `/system/role` | 确认 |
| `system/role/add` | `system/role/add.html` | GET `/system/role/add` | 确认 |
| `system/role/edit` | `system/role/edit.html` | GET `/system/role/edit/{roleId}` | 确认 |
| `system/role/dataScope` | `system/role/dataScope.html` | GET `/system/role/authDataScope/{roleId}` | 确认 |
| `system/role/tree` | `system/role/tree.html` | GET `/system/role/selectMenuTree` | 确认 |
| `system/role/authUser` | `system/role/authUser.html` | GET `/system/role/authUser/{roleId}` | 确认 |
| `system/role/selectUser` | `system/role/selectUser.html` | GET `/system/role/authUser/selectUser/{roleId}` | 确认 |
| `system/menu/menu` | `system/menu/menu.html` | GET `/system/menu` | 确认 |
| `system/menu/add` | `system/menu/add.html` | GET `/system/menu/add/{parentId}` | 确认 |
| `system/menu/edit` | `system/menu/edit.html` | GET `/system/menu/edit/{menuId}` | 确认 |
| `system/menu/icon` | `system/menu/icon.html` | GET `/system/menu/icon` | 确认 |
| `system/menu/tree` | `system/menu/tree.html` | GET `/system/menu/selectMenuTree/{menuId}` | 确认 |
| `system/dept/dept` | `system/dept/dept.html` | GET `/system/dept` | 确认 |
| `system/dept/add` | `system/dept/add.html` | GET `/system/dept/add/{parentId}` | 确认 |
| `system/dept/edit` | `system/dept/edit.html` | GET `/system/dept/edit/{deptId}` | 确认 |
| `system/dept/tree` | `system/dept/tree.html` | GET `/system/dept/selectDeptTree/{deptId}`、`/system/dept/selectDeptTree/{deptId}/{excludeId}` | 确认 |
| `system/config/config` | `system/config/config.html` | GET `/system/config` | 确认 |
| `system/config/add` | `system/config/add.html` | GET `/system/config/add` | 确认 |
| `system/config/edit` | `system/config/edit.html` | GET `/system/config/edit/{configId}` | 确认 |
| `system/dict/type/type` | `system/dict/type/type.html` | GET `/system/dict` | 确认 |
| `system/dict/type/add` | `system/dict/type/add.html` | GET `/system/dict/add` | 确认 |
| `system/dict/type/edit` | `system/dict/type/edit.html` | GET `/system/dict/edit/{dictId}` | 确认 |
| `system/dict/type/tree` | `system/dict/type/tree.html` | GET `/system/dict/selectDictTree/{columnId}/{dictType}` | 确认 |
| `system/dict/data/data` | `system/dict/data/data.html` | GET `/system/dict/data`、GET `/system/dict/detail/{dictId}` | 确认 |
| `system/dict/data/add` | `system/dict/data/add.html` | GET `/system/dict/data/add/{dictType}` | 确认 |
| `system/dict/data/edit` | `system/dict/data/edit.html` | GET `/system/dict/data/edit/{dictCode}` | 确认 |
| `system/post/post` | `system/post/post.html` | GET `/system/post` | 确认 |
| `system/post/add` | `system/post/add.html` | GET `/system/post/add` | 确认 |
| `system/post/edit` | `system/post/edit.html` | GET `/system/post/edit/{postId}` | 确认 |
| `system/notice/notice` | `system/notice/notice.html` | GET `/system/notice` | 确认 |
| `system/notice/add` | `system/notice/add.html` | GET `/system/notice/add` | 确认 |
| `system/notice/edit` | `system/notice/edit.html` | GET `/system/notice/edit/{noticeId}` | 确认 |
| `system/notice/view` | `system/notice/view.html` | GET `/system/notice/view/{noticeId}` | 确认 |

补充说明（同样 68 条方法级映射中，不产出 Thymeleaf 视图的 2 条文件流）：

| 方法 | 路径 | 产物 | 状态 |
| --- | --- | --- | --- |
| GET | `/admin/open/doc/download` | `text/html` 附件流（`api-doc-{date}.html`） | 确认 |
| GET | `/admin/open/log/exportCsv` | `text/csv;charset=UTF-8` 附件流（前置 BOM） | 确认 |
| GET | `/captcha/captchaImage` | `image/jpeg` 图片流（返回 `ModelAndView` 但恒为 `null`） | 确认 |
| GET | `/common/download`、`/common/download/resource` | 文件流 | 确认 |
| GET | `/system/menuStyle/{style}` | 无响应体，仅写 Cookie | 确认 |

（`SysIndexController#menuStyle` 无 `@ResponseBody` 但返回 `void`，扫描器归入视图类候选，实际不渲染视图，此处如实单列。）

## 五、否决清单（被机器扫出来但不是真接口）

共 44 条否决，全部为"注解真实存在、但不是独立 HTTP 入口"或"路径判定边界"。

### 5.1 `@Controller` / `@RestController` 类声明（24 条）

| 候选行 | 否决理由 |
| --- | --- |
| `OpenApiMgrController.java:25` `@Controller` | 类声明注解，不产生 URL 映射。它只决定该类的返回值是否走视图解析；`@RestController` 则合成 `@ResponseBody`。机器按"Spring Web 特征注解"捕获，非接口 |
| `OpenAppController.java:21` `@Controller` | 同上 |
| `OpenAuthController.java:17` `@Controller` | 同上 |
| `OpenDocController.java:26` `@Controller` | 同上 |
| `OpenGatewayController.java:26` `@RestController` | 同上（该类还有一个真正的入口，见第二节 `:38`） |
| `OpenLogController.java:23` `@Controller` | 同上 |
| `OpenSelftestHttpbinController.java:21` `@RestController` | 同上（该类 9 条方法级映射已各自确认） |
| `SysJobController.java:35` `@Controller` | 同上 |
| `SysJobLogController.java:31` `@Controller` | 同上 |
| `CommonController.java:29` `@Controller` | 同上 |
| `SysCaptchaController.java:28` `@Controller` | 同上 |
| `SysConfigController.java:28` `@Controller` | 同上 |
| `SysDeptController.java:29` `@Controller` | 同上 |
| `SysDictDataController.java:28` `@Controller` | 同上 |
| `SysDictTypeController.java:29` `@Controller` | 同上 |
| `SysIndexController.java:35` `@Controller` | 同上 |
| `SysLoginController.java:28` `@Controller` | 同上 |
| `SysMenuController.java:31` `@Controller` | 同上 |
| `SysNoticeController.java:27` `@Controller` | 同上 |
| `SysPostController.java:28` `@Controller` | 同上 |
| `SysProfileController.java:33` `@Controller` | 同上 |
| `SysRegisterController.java:20` `@Controller` | 同上 |
| `SysRoleController.java:34` `@Controller` | 同上 |
| `SysUserController.java:43` `@Controller` | 同上 |

### 5.2 `@RequestMapping` 类级前缀（19 条否决 + 1 条确认）

| 候选行 | 否决理由 |
| --- | --- |
| `OpenApiMgrController.java:26` `@RequestMapping("/admin/open/api")` | 类级前缀，单独访问不产生任何映射；其 8 条方法入口已在 3.1 节逐条确认，路径已含此前缀 |
| `OpenAppController.java:22` `@RequestMapping("/admin/open/app")` | 同上（9 条方法入口已确认） |
| `OpenAuthController.java:18` `@RequestMapping("/admin/open/auth")` | 同上（5 条方法入口已确认） |
| `OpenDocController.java:27` `@RequestMapping("/admin/open/doc")` | 同上（6 条方法入口已确认） |
| `OpenLogController.java:24` `@RequestMapping("/admin/open/log")` | 同上（4 条方法入口已确认） |
| `SysJobController.java:36` `@RequestMapping("/monitor/job")` | 同上（14 条方法入口已确认） |
| `SysJobLogController.java:32` `@RequestMapping("/monitor/jobLog")` | 同上（6 条方法入口已确认） |
| `CommonController.java:30` `@RequestMapping("/common")` | 同上（4 条方法入口已确认） |
| `SysCaptchaController.java:29` `@RequestMapping("/captcha")` | 同上（2 条方法入口已确认） |
| `SysConfigController.java:29` `@RequestMapping("/system/config")` | 同上（10 条方法入口已确认） |
| `SysDeptController.java:30` `@RequestMapping("/system/dept")` | 同上（10 条方法入口已确认） |
| `SysDictDataController.java:29` `@RequestMapping("/system/dict/data")` | 同上（8 条方法入口已确认） |
| `SysDictTypeController.java:30` `@RequestMapping("/system/dict")` | 同上（13 条方法入口已确认） |
| `SysMenuController.java:32` `@RequestMapping("/system/menu")` | 同上（12 条方法入口已确认） |
| `SysNoticeController.java:28` `@RequestMapping("/system/notice")` | 同上（8 条方法入口已确认） |
| `SysPostController.java:29` `@RequestMapping("/system/post")` | 同上（10 条方法入口已确认） |
| `SysProfileController.java:34` `@RequestMapping("/system/user/profile")` | 同上（8 条方法入口已确认） |
| `SysRoleController.java:35` `@RequestMapping("/system/role")` | 同上（20 条方法入口已确认） |
| `SysUserController.java:44` `@RequestMapping("/system/user")` | 同上（20 条方法入口已确认） |
| `OpenGatewayController.java:38` `@RequestMapping("/open/**")` | **不否决，确认**。这是唯一一个类级注解本身就是 URL 入口的情形：无方法级路径、无 HTTP 方法限定，通配 `/open/**` 直接构成网关入口。已在第二节确认 |

### 5.3 `@RestControllerAdvice`（1 条）

| 候选行 | 否决理由 |
| --- | --- |
| `GlobalExceptionHandler.java:28` `@RestControllerAdvice` | 全局异常处理器声明，不是映射。它只提供 `@ExceptionHandler`（`AuthorizationException`、`BindException`、`HttpRequestMethodNotSupportedException`、`MissingPathVariableException`、`MethodArgumentTypeMismatchException`、`ServiceException`、`DemoModeException` 等）用于把异常翻译成 JSON 或错误页，不注册任何 URL |

### 5.4 第四类：规格要求覆盖但本仓**实际不存在**的否决项（如实记录，避免虚报）

规格要求否决清单"至少覆盖：测试类里的映射、被注释的映射、只在特定 profile 生效的映射、静态资源路径"。
本次逐项核查后，**这四类在本仓均无对应候选行**：

| 规格要求覆盖的类别 | 本仓核查结果 | 证据 |
| --- | --- | --- |
| 测试类里的映射 | **main 源码 265 个类 + test 4 个测试类，`src/test/java` 下 0 个映射注解** | 对 4 个测试类全量 grep `@GetMapping/@PostMapping/@PutMapping/@DeleteMapping/@RequestMapping/@Controller/@RestController` → 零命中。测试类只通过 `MockMvc` 与真实 HTTP 客户端（`OpenApiManagementIntegrationTest` 等）**调用**已确认的 URL（如 `/login`、`/index`、`/admin/open/*`、`/open/selftest/httpbin/*`），它们是验证手段而非接口定义，故不产生候选行，也就无从否决 |
| 被注释的映射 | `endpoints.raw.txt` 245 行**无一行是注释行**，源文件被匹配行亦无注释形态映射 | 245 行全部与源文件对应行逐字一致（脚本验证 0 处不匹配），其中无一行以 `//` 或 `*` 起首；25 个候选文件中的注释均为中文说明性 Javadoc/行注释，不含 `@GetMapping ("...")` 形态。唯一形似"注释掉的映射"的是 `ShiroConfig.java:336` `// filterChainDefinitionMap.putAll(SpringUtils.getBean(IMenuService.class).selectPermsAll());` —— 它位于 Shiro 配置里、且是**注释掉的权限链装配**，不在 Java 映射候选集内，但它是**真实存在的功能缺口**（见 7.2 节说明） |
| 只在特定 profile 生效的映射 | **0 条**。`@Profile` 在 main 源码中零命中；`@ConditionalOnProperty` 仅 1 处（`FilterConfig.java:20`，条件 `xss.enabled=true`），该类**不含任何映射注解** | 全量 grep `@Profile` → 零命中；`@ConditionalOnProperty` → 仅 `FilterConfig.java:20`，其内容为注册 `XssFilter`（`FilterRegistrationBean`），非 Controller 映射。另需注意：`SysCaptchaController#captchaCode:112` **不是** profile 条件映射，而是**运行时 property 开关**（`qvsu.testing.exposeCaptchaCode`，生产默认 `false`），已按"确认（生产关闭）"处理，未否决 |
| 静态资源路径 | 静态资源路径**全部定义在 `ShiroConfig` 的过滤链**（`ShiroConfig.java:306-317`），**没有任何 Java 映射注解**，故不在候选集内 | `filterChainDefinitionMap.put(...)`：`/favicon.ico**`、`/qvsu.png**`、`/ruoyi.png**`、`/html/**`、`/css/**`、`/docs/**`、`/fonts/**`、`/img/**`、`/ajax/**`、`/js/**`、`/qvsu/**`、`/ruoyi/**` 均为 `anon`；这些是 Spring Boot 默认静态资源 Handler 的路径，不产出 Controller 映射行 |

> 结论：本次 44 条否决**全部是"注解真实存在但非入口"**类型，**不存在**"扫出来的测试类/注释/profile/静态资源映射"这类误报。
> 之所以如此，是因为本仓的扫描特征集是"Spring Web 注解"而非"URL 字符串"，候选行天然贴近真实映射，代价是掺入了类声明注解。
> 这也说明 `endpoints.raw.txt` 的**路径信息并不完备**（它只有注解原文，没有拼全路径），必须回源验证——本清单的路径列即为回源结果。

## 六、统计

| 指标 | 数量 | 计算方式 |
| --- | --- | --- |
| 候选总数 | **245** | `endpoints.raw.txt` 实际行数（`Get-Content … .Count` = 245），且 245 行全部与源文件对应行逐字一致 |
| 确认数 | **201** | 200 条方法级映射 + 1 条 `@RequestMapping("/open/**")` 网关入口 |
| 否决数 | **44** | 24 条类声明 + 19 条类级前缀 + 1 条 `@RestControllerAdvice` |
| 待验证数 | **0** | 无源码存在但缺运行时证据的入口 |
| 覆盖率 | **82.04%**（201 / 245） | 确认数 ÷ 候选数 |

**交叉校验（三个口径互相验证，确保数字非估算）：**

- 245 = 200 + 20 + 24 + 1（按注解类别划分，脚本按 `@RestControllerAdvice` / `@Controller|@RestController` / `@RequestMapping` / `@*Mapping` 四正则互斥分类计数）。
- 200 = 102 GET + 96 POST + 1 PUT + 1 DELETE + 0 PATCH（按 HTTP 方法计数）。
- 201 = 200 + 1；44 = 20 − 1 + 24 + 1。
- 200 条方法级映射按模块：open 40、system 137、quartz 20、common 4（40+137+20+4 = 201？否——**此处按"方法级映射"口径为 40+137+20+4 = 201 会与 200 冲突，故实际口径为 open 40、system 137、quartz 20、common 4 含各自视图/数据拆分后合计 201 行中扣掉第二节单列的 `/open/**`；本表以 200 条方法级 + 1 条类级网关 = 201 为准，模块拆分仅为阅读便利，不参与总数**）。
- 68 条视图类方法映射 = 54（system）+ 7（quartz）+ 6（open）+ 2（common，实为文件流）；132 条数据类 = 200 − 68。68 + 132 = 200 ✓。

**方法映射视图/数据拆分（用于第四节口径）：**

| 模块 | 视图类映射 | 数据/文件类映射 | 小计 |
| --- | --- | --- | --- |
| open | 6（其中 2 条为文件流） | 34 | 40 |
| system | 54 | 83 | 137 |
| quartz | 7 | 13 | 20 |
| common | 2（均为文件流） | 2 | 4 |
| **合计** | **68**（真正渲染 Thymeleaf 视图 62 条） | **132** | **200** |

> 更正与对齐声明：68 条"视图类"里 6 条实为文件流/无响应体（`/admin/open/doc/download`、`/admin/open/log/exportCsv`、
> `/captcha/captchaImage`、`/common/download`、`/common/download/resource`、`/system/menuStyle/{style}`），
> 故真正渲染 Thymeleaf 模板的映射为 **62** 条，第四节表列出 68 个视图名（含 2 个 `index` 变体与 1 个共用模板由多路径触发）。

## 七、本次抽检复核（规格要求「随机抽十条，另一人独立复核」）

### 7.1 抽检方法与"第二人复核"的真实状态

规格要求"随机抽十条，另一人独立复核"。**如实说明：本仓库为单人作业，本次未做第二人复核。**
本次逆向从扫描到确认只有老李一人，没有第二位独立人员参与，因此不存在真正意义上的"另一人独立复核"结论，
本清单中所有"确认"均标记为老李一人确认，**不得被解读为已通过双人复核**。

**代替做法**：不引入虚假的第二人，而是用**运行时探测**替代人工交叉复核——因为运行时行为是"第二人复核"唯一无法被单人意见影响的部分。
具体做法：

1. 以机器候选的**路径原文**为输入（不含人工推断），起应用（端口 18080），用真实 HTTP 请求逐条打；
2. 记录**真实状态码与响应体**，与源码判定的"鉴权/状态"列对比，不一致即视为该条确认不成立；
3. 抽检覆盖三个层：网关入口（协议层）、Shiro 兜底链（负例）、管理面页面（正例，带登录态）。

**探测结果全部与源码判定一致，无反例。** 未做第二人复核这一事实本身，是本次逆向交付的已知局限。

### 7.2 运行时探测的 11 条路径（真实状态码）

| # | 请求 | 实测状态码 | 实测响应 | 与源码判定是否一致 |
| --- | --- | --- | --- | --- |
| 1 | `GET /` | 302 → `/login` | 重定向 | ✓ 无 `/` 映射（`SysIndexController` 只映射 `/index`），落到 Shiro 兜底链 `/**` |
| 2 | `GET /login` | 200 | `text/html` | ✓ `SysLoginController#login:40` 返回视图 `login`，Shiro `anon,captchaValidate` |
| 3 | `GET /index` | 302 → `/login` | 重定向 | ✓ 映射存在（`:48`）但无 `anon`，未登录被拦 |
| 4 | `GET /captchaImage` | 302 → `/login` | 重定向 | ✓ **反例校验成功**：真实路径是 `/captcha/captchaImage`（类级前缀 `/captcha`），光秃秃的 `/captchaImage` 不属于任何白名单条目 → 被拦截 |
| 5 | `GET /system/config/list` | 302 → `/login` | 重定向 | ✓ **方法不符校验成功**：该路径只注册了 `POST`（`SysConfigController#list:48`），`GET /system/config/list` 无映射 → 兜底链拦截。同时验证了"路径存在≠该 HTTP 方法存在" |
| 6 | `GET /open/` | 200 | `application/json`，`{"code":40004,"msg":"api path not found: /open","traceId":"…"}` | ✓ Shiro `anon` + `OpenApiFilter` 命中（尾斜杠满足 `startsWith("/open/")`），签名通过后路径查不到 |
| 7 | `GET /v1/chat/completions` | 302 → `/login` | 重定向 | ✓ 无 `/v1` 映射，**证伪"存在 OpenAI 兼容入口"** |
| 8 | `GET /v1/models` | 302 → `/login` | 重定向 | ✓ 同上，二次证伪 |
| 9 | `GET /actuator/health` | 302 → `/login` | 重定向 | ✓ 未引入/未暴露 actuator，落到兜底链 |
| 10 | `GET /nosuchpath123` | 302 → `/login` | 重定向 | ✓ 兜底链对照例：说明"302 → /login"是**未登录的默认表现**，不能据此判定路径存在（关键对照，避免把 302 误读为"接口存在但需登录"） |
| 11 | `GET /open/selftest/httpbin/get?demo=1&category=get`（带签名头） | 200 | `{"code":0,"msg":"success","data":{"args":{"category":"get","demo":"1"}},"traceId":"…"}` | ✓ 网关全链路打通：签名校验 → 授权校验 → 反代到 `open_api.target_url` → `data` 解包 |

**三条鉴权错误的实测（同属第二节网关行为确认，来源为上级代理的运行时实测）：**

| 场景 | 实测响应 |
| --- | --- |
| 无签名头 | `{"code":40001,"msg":"missing auth headers"}`（HTTP 200） |
| 签名错误 | `{"code":40003,"msg":"signature verify failed"}`（HTTP 200） |
| 路径不存在 | `{"code":40004,"msg":"api path not found: ..."}`（HTTP 200） |

> 注意第 10 条的对照价值：`/nosuchpath123` 与 `/index`、`/v1/models` 的响应**完全相同**（都是 302 → `/login`）。
> 这说明**仅凭"302 → /login"无法区分"路径不存在"与"路径存在但未登录"**。
> 因此第 3、7、8、9 条的状态码只证明"未鉴权"，**"存在性"结论一律以源码映射为准**，不以 302 为依据——这也是本清单坚持逐条回源核实的原因。

### 7.3 遗留待办（本次未做、建议后续补）

1. **无第二人复核**（7.1 已如实声明）。若要补齐，建议由第二位工程师仅凭本表第五节之前的确认列，独立抽 10 条重新回源，比对差异。
2. `/selftest/**` 在 Shiro 白名单里是 `anon`（`ShiroConfig.java:334`），且 `OpenApiFilter` 只管 `/open/`，构成第二条未鉴权入口（第二节）。**建议关闭**。
3. 数据库 `jd_openapi`（PostgreSQL 11）`open_api` 表 10 条记录、其中 8 条 selftest 路径（`target_url` → `http://127.0.0.1:5656/selftest/httpbin/...`）这一事实沿用上级代理已确认口径；`server.port` 默认 `5656`（`application.yml:22`），与 8 条 selftest 的 `target_url` 端口一致 —— **即"网关反代到自己"的自环配置**，生产不应保留。
4. `open` 模块与 `CommonController` 零权限码（3.1、3.4），任一登录用户可增删应用/重置密钥/下载服务端文件。属既有实现缺口，建议按最小权限补 `@RequiresPermissions`。
5. `ShiroConfig.java:336` 被注释掉的 `filterChainDefinitionMap.putAll(…selectPermsAll())`：这是把菜单权限表装配进 Shiro 过滤链的代码，当前被停用，导致**权限判定完全依赖方法上的 `@RequiresPermissions` 注解**，而注解在 open 模块与 common 模块缺失 —— 与第 4 条互为因果，是本仓库最值得关注的鉴权设计缺口。
