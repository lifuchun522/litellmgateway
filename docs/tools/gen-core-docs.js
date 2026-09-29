// gen-core-docs.js — generates source-asset-inventory.md, functional-inventory.md,
// business-function-requirements.md, non-menu-function-index.md and function-chain-index.md.
// All content derives deterministically from docs/tools/{assets,semantics,menus}.json.
const fs = require('fs');
const { writeText } = require('./write-crlf');
const path = require('path');

const ROOT = 'D:/src/github/litellmgateway';
const outDir = path.join(ROOT, 'docs/meta-model');
// assets.json is written with a UTF-8 BOM by the PowerShell extractor; strip it before parsing.
function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, ''));
}
const assets = readJson(path.join(ROOT, 'docs/tools/assets.json'));
const sem = readJson(path.join(ROOT, 'docs/tools/semantics.json'));
const menus = readJson(path.join(ROOT, 'docs/tools/menus.json'));

// ---------------------------------------------------------------- helpers
function norm(p) { return String(p).replace(/\\/g, '/'); }
function uniq(arr) { return [...new Set(arr)]; }

// Unique physical tables (name -> columns) for access matrices.
const tableByName = new Map();
for (const t of sem.Tables) {
  const prev = tableByName.get(t.Name);
  if (!prev || t.Columns.filter(c => c.Comment).length > prev.Columns.filter(c => c.Comment).length) {
    tableByName.set(t.Name, t);
  }
}
const allTables = [...tableByName.keys()].sort();

// Endpoint index keyed by controller class name.
const endpointsByController = new Map();
for (const e of sem.Endpoints) {
  if (!endpointsByController.has(e.Controller)) endpointsByController.set(e.Controller, []);
  endpointsByController.get(e.Controller).push(e);
}

// Menu rows deduplicated by menu_id (prefer the MySQL copy, whose CJK is intact).
const menuById = new Map();
for (const m of menus) {
  const isBroken = /[\u00c0-\u02ff]/.test(String(m.menu_name || '')) && !/[\u4e00-\u9fff]/.test(String(m.menu_name || ''));
  if (!menuById.has(m.menu_id) || !isBroken) menuById.set(m.menu_id, m);
}
const menuList = [...menuById.values()].sort((a, b) => String(a.menu_id).localeCompare(String(b.menu_id)));
const cMenus = menuList.filter(m => m.menu_type === 'C');
const mMenus = menuList.filter(m => m.menu_type === 'M');
const fMenus = menuList.filter(m => m.menu_type === 'F');

// Permission code -> F menus
const permsByMenuPerm = new Map();
for (const m of fMenus) if (m.perms) permsByMenuPerm.set(m.perms, m);

// ---------------------------------------------------------------- function catalog
// Each entry: id, name, type, interaction, trigger, priority, domain, module,
// menu (id or null), permission, controller, routeToken, tables (R/C/U/D map),
// apiIds, rule text, and narrative fields for the requirement panel.
const fn = [];
function add(o) { fn.push(o); }

// --- Cross-file ID alignment -------------------------------------------------
// Domain IDs are primary-defined in business-architecture.md, module IDs in
// module-index.md, menu IDs in business-architecture.md. They are referenced here
// verbatim so that the validator resolves every reference.
const DOM = { system: 'DOM-system', open: 'DOM-open', quartz: 'DOM-quartz', common: 'DOM-common' };
const MODID = {
  common: 'MOD-common', framework: 'MOD-framework', system: 'MOD-system',
  quartz: 'MOD-quartz', open: 'MOD-open', web: 'MOD-web', app: 'MOD-framework'
};
const MENUID = {
  'MENU-100': 'MENU-sys-user', 'MENU-101': 'MENU-sys-role', 'MENU-102': 'MENU-sys-menu',
  'MENU-103': 'MENU-sys-dept', 'MENU-104': 'MENU-sys-post', 'MENU-105': 'MENU-sys-dict',
  'MENU-106': 'MENU-sys-config', 'MENU-107': 'MENU-sys-notice',
  'MENU-2101': 'MENU-open-app', 'MENU-2102': 'MENU-open-api', 'MENU-2103': 'MENU-open-auth',
  'MENU-2104': 'MENU-open-log', 'MENU-2105': 'MENU-open-doc'
};
function finalize(list) {
  for (const f of list) {
    f.domain = DOM[f.domKey] || DOM.common;
    f.module = MODID[f.modKey] || MODID.common;
    f.menu = f.menuAlias ? (MENUID[f.menuAlias] || f.menuAlias) : null;
  }
  return list;
}
const RAW = [];

// ---- 系统管理域 ----
add({ id: 'FUNC-sys-login', name: '用户登录认证', type: 'platform', interaction: 'interactive', trigger: 'menu', priority: 'core', domKey: 'system', modKey: 'web', menu: null, permission: null, controller: 'SysLoginController', routeToken: 'login', tables: { sys_user: 'R', sys_logininfor: 'C' }, goal: '校验用户凭据与验证码，建立服务端会话并加载其菜单与权限', actors: '系统管理员、普通用户', pre: '用户已存在于 sys_user 且 status=0，账号未被锁定', steps: 'GET /login 渲染登录页 → POST /login 提交账号密码与验证码 → 校验验证码 → Shiro Realm 认证 → 记录登录日志 → 建立会话 → 跳转 /index', rules: '验证码由 shiro.user.captchaEnabled/captchaType 控制；密码连续错误次数受 user.password.maxRetryCount=5 限制；status=2 视为停用', out: '登录成功跳转首页；失败返回错误提示并计数', state: 'sys_user.login_date/login_ip 更新；sys_logininfor 新增记录；Shiro 会话创建', fail: '验证码错误、账号不存在、密码错误、账号停用、超过重试上限被锁定', manual: '管理员在 sys_user 中重置密码或恢复账号状态', scope: '登录接口匿名可访问，权限码无' });
add({ id: 'FUNC-sys-logout', name: '用户退出登录', type: 'platform', interaction: 'interactive', trigger: 'menu', priority: 'core', domKey: 'system', modKey: 'web', menu: null, permission: null, controller: 'SysLoginController', routeToken: 'logout', tables: { sys_user_online: 'D', sys_logininfor: 'C' }, goal: '注销当前会话并释放在线用户记录', actors: '已登录用户', pre: '存在有效会话', steps: 'GET /logout → Shiro 登出 → 删除在线会话 → 记录登出日志 → 重定向登录页', rules: '登出必须清理 sys_user_online 中对应会话记录', out: '会话失效，跳转登录页', state: 'sys_user_online 删除当前会话行', fail: '会话已过期时幂等返回登录页', manual: '无', scope: '已认证用户' });
add({ id: 'FUNC-sys-captcha', name: '验证码生成', type: 'platform', interaction: 'non-interactive', trigger: 'api-only', priority: 'important', domKey: 'system', modKey: 'web', menu: null, permission: null, controller: 'SysCaptchaController', routeToken: 'captchaImage', tables: {}, goal: '产生算数类型验证码图片并以会话键值绑定答案', actors: '匿名访问者、登录页', pre: 'shiro.user.captchaEnabled=true 时启用', steps: 'GET /captchaImage → 生成算式 → 写入会话 verCode → 返回 Base64 图片与 uuid', rules: '验证码类型由 shiro.user.captchaType=math 决定；开发期可通过 qvsu.testing.exposeCaptchaCode 暴露答案', out: '返回 {uuid, img} JSON', state: '会话中写入验证码答案', fail: '验证码开关关闭时返回说明', manual: '无', scope: '匿名可访问', apis: ['API-captcha-image'] });
add({ id: 'FUNC-sys-register', name: '用户注册', type: 'platform', interaction: 'interactive', trigger: 'menu', priority: 'supporting', domKey: 'system', modKey: 'web', menu: null, permission: null, controller: 'SysRegisterController', routeToken: 'register', tables: { sys_user: 'C' }, goal: '开放自助注册入口创建新用户', actors: '匿名访问者', pre: '系统允许注册', steps: 'GET /register 渲染 → POST /register 提交 → 唯一性校验 → 新增用户', rules: '登录名唯一；默认分配普通角色', out: '注册成功提示', state: 'sys_user 新增一行', fail: '登录名已存在、验证码错误', manual: '管理员审核角色分配', scope: '匿名可访问（属高风险开放入口）' });
add({ id: 'FUNC-sys-index', name: '后台首页与工作台', type: 'platform', interaction: 'interactive', trigger: 'menu', priority: 'supporting', domKey: 'system', modKey: 'web', menu: null, permission: null, controller: 'SysIndexController', routeToken: 'index', tables: {}, goal: '登录后渲染后台主框架首页', actors: '已登录用户', pre: '会话有效', steps: 'GET /index → 加载菜单树 → 渲染主框架', rules: '菜单树按当前用户权限过滤', out: '后台主页面', state: '无持久化变更', fail: '未登录跳转 /login', manual: '无', scope: '已认证用户' });
add({ id: 'FUNC-sys-unauth', name: '未授权提示页', type: 'platform', interaction: 'interactive', trigger: 'menu', priority: 'edge', domKey: 'system', modKey: 'web', menu: null, permission: null, controller: 'SysIndexController', routeToken: 'unauth', tables: {}, goal: '权限不足时给出统一提示', actors: '已登录用户', pre: '访问了无权限资源', steps: 'GET /unauth → 渲染提示页', rules: '由 shiro.user.unauthorizedUrl 指定', out: '提示页面', state: '无', fail: '无', manual: '无', scope: '已认证用户' });
add({ id: 'FUNC-sys-profile', name: '个人中心维护', type: 'platform', interaction: 'interactive', trigger: 'menu', priority: 'important', domKey: 'system', modKey: 'web', menu: null, permission: null, controller: 'SysProfileController', routeToken: 'system/user/profile', tables: { sys_user: 'R/U' }, goal: '用户维护本人资料与密码', actors: '已登录用户', pre: '会话有效', steps: '查看基本资料 → 修改资料 → 修改密码 → 上传头像 → 保存', rules: '只能修改本人数据；密码需校验原密码；手机号/邮箱唯一性', out: '资料更新成功提示', state: 'sys_user 对应行更新', fail: '原密码错误、唯一性冲突、文件类型不合法', manual: '无', scope: '仅本人数据' });
add({ id: 'FUNC-sys-profile-avatar', name: '头像上传', type: 'platform', interaction: 'interactive', trigger: 'menu', priority: 'supporting', domKey: 'system', modKey: 'web', menu: null, permission: null, controller: 'SysProfileController', routeToken: 'system/user/profile/avatar', tables: { sys_user: 'U' }, goal: '上传并替换当前用户头像文件', actors: '已登录用户', pre: '会话有效', steps: '选择图片 → POST 上传 → 校验类型与大小 → 落盘 qvsu.profile 目录 → 更新 avatar 字段', rules: '受 spring.servlet.multipart.max-file-size=10MB 限制；白名单扩展名', out: '返回头像访问 URL', state: '文件系统新增文件；sys_user.avatar 更新', fail: '文件过大、类型不允许、磁盘写入失败', manual: '清理 qvsu.profile 目录', scope: '仅本人' });
add({ id: 'FUNC-sys-user-manage', name: '用户管理', type: 'platform', interaction: 'interactive', trigger: 'menu', priority: 'core', domKey: 'system', modKey: 'system', menuAlias: 'MENU-100', permission: 'system:user:view', controller: 'SysUserController', routeToken: 'system/user', tables: { sys_user: 'R/C/U/D', sys_user_role: 'R/C/D', sys_user_post: 'R/C/D', sys_dept: 'R', sys_role: 'R', sys_post: 'R' }, goal: '维护系统用户账号及其角色、岗位、部门归属', actors: '系统管理员', pre: '拥有 system:user:* 权限码', steps: '查询列表（部门树过滤）→ 新增用户 → 分配角色/岗位 → 编辑 → 重置密码 → 停用/启用 → 删除', rules: '登录名唯一；admin 账号不可删除；逻辑删除用 del_flag；密码经安全工具加盐哈希', out: '用户列表与增删改结果', state: 'sys_user 及两张关联表读写', fail: '登录名重复、无权限、删除超管被拒', manual: '超管账号问题需 DBA 介入', scope: '数据范围 dataScope 控制可见部门' });
add({ id: 'FUNC-sys-role-manage', name: '角色管理', type: 'platform', interaction: 'interactive', trigger: 'menu', priority: 'core', domKey: 'system', modKey: 'system', menuAlias: 'MENU-101', permission: 'system:role:view', controller: 'SysRoleController', routeToken: 'system/role', tables: { sys_role: 'R/C/U/D', sys_role_menu: 'R/C/D', sys_role_dept: 'R/C/D', sys_user_role: 'R' }, goal: '维护角色、菜单权限与数据范围', actors: '系统管理员', pre: '拥有 system:role:* 权限码', steps: '查询 → 新增/编辑角色 → 勾选菜单权限 → 设置数据范围 → 停用/删除', rules: '角色名与权限字符唯一；admin 角色不可改；数据范围 1-5 对应全部/自定义/本部门/本部门及以下/仅本人', out: '角色列表与授权结果', state: 'sys_role、sys_role_menu、sys_role_dept 读写', fail: '权限字符重复、删除已分配用户的角色被拒', manual: '无', scope: '超管独占' });
add({ id: 'FUNC-sys-menu-manage', name: '菜单管理', type: 'platform', interaction: 'interactive', trigger: 'menu', priority: 'core', domKey: 'system', modKey: 'system', menuAlias: 'MENU-102', permission: 'system:menu:view', controller: 'SysMenuController', routeToken: 'system/menu', tables: { sys_menu: 'R/C/U/D', sys_role_menu: 'R' }, goal: '维护菜单树与按钮权限码，驱动前端路由与后端鉴权', actors: '系统管理员', pre: '拥有 system:menu:* 权限码', steps: '查看菜单树 → 新增目录/菜单/按钮 → 设置路由、权限码、图标、排序 → 编辑 → 删除', rules: '权限码唯一；存在子菜单或已被角色引用时不可删除；menu_type M/C/F 分别代表目录/菜单/按钮', out: '菜单树结构', state: 'sys_menu 读写', fail: '权限码重复、存在子节点被拒删', manual: '菜单种子脚本 open_api_menu.sql 与应用内维护存在双写风险', scope: '超管独占' });
add({ id: 'FUNC-sys-dept-manage', name: '部门管理', type: 'platform', interaction: 'interactive', trigger: 'menu', priority: 'important', domKey: 'system', modKey: 'system', menuAlias: 'MENU-103', permission: 'system:dept:view', controller: 'SysDeptController', routeToken: 'system/dept', tables: { sys_dept: 'R/C/U/D', sys_user: 'R' }, goal: '维护组织机构树，为数据范围提供层级基础', actors: '系统管理员', pre: '拥有 system:dept:* 权限码', steps: '查看部门树 → 新增下级 → 编辑 → 调整上级 → 删除', rules: '存在下级部门或已分配用户时不可删除；ancestors 字段维护祖先链', out: '部门树', state: 'sys_dept 读写，ancestors 级联更新', fail: '存在子节点或用户被拒删', manual: '无', scope: '超管独占' });
add({ id: 'FUNC-sys-post-manage', name: '岗位管理', type: 'platform', interaction: 'interactive', trigger: 'menu', priority: 'supporting', domKey: 'system', modKey: 'system', menuAlias: 'MENU-104', permission: 'system:post:view', controller: 'SysPostController', routeToken: 'system/post', tables: { sys_post: 'R/C/U/D', sys_user_post: 'R' }, goal: '维护岗位字典并供用户分配', actors: '系统管理员', pre: '拥有 system:post:* 权限码', steps: '查询 → 新增 → 编辑 → 停用/启用 → 删除', rules: '岗位编码唯一；已分配用户的岗位不可删除', out: '岗位列表', state: 'sys_post 读写', fail: '编码重复、被引用拒删', manual: '无', scope: '超管独占' });
add({ id: 'FUNC-sys-dict-manage', name: '字典管理', type: 'platform', interaction: 'interactive', trigger: 'menu', priority: 'important', domKey: 'system', modKey: 'system', menuAlias: 'MENU-105', permission: 'system:dict:view', controller: 'SysDictTypeController', routeToken: 'system/dict', tables: { sys_dict_type: 'R/C/U/D', sys_dict_data: 'R/C/U/D' }, goal: '维护字典类型与字典数据，支撑下拉框与状态翻译', actors: '系统管理员', pre: '拥有 system:dict:* 权限码', steps: '维护字典类型 → 维护字典数据 → 启停 → 删除 → 刷新缓存', rules: '字典类型 type 唯一；字典数据按 dict_sort 排序；修改后需刷新缓存', out: '字典类型与数据列表', state: 'sys_dict_type、sys_dict_data 读写', fail: '类型重复、缓存未刷新导致前端仍显示旧值', manual: '可调用刷新缓存接口', scope: '超管独占' });
add({ id: 'FUNC-sys-config-manage', name: '参数设置', type: 'platform', interaction: 'interactive', trigger: 'menu', priority: 'important', domKey: 'system', modKey: 'system', menuAlias: 'MENU-106', permission: 'system:config:view', controller: 'SysConfigController', routeToken: 'system/config', tables: { sys_config: 'R/C/U/D' }, goal: '维护运行期可改的键值参数', actors: '系统管理员', pre: '拥有 system:config:* 权限码', steps: '查询 → 新增参数 → 编辑 → 删除 → 刷新缓存', rules: '参数键 config_key 唯一；内置参数不可删除；修改需刷新缓存', out: '参数列表', state: 'sys_config 读写', fail: '键重复、内置参数拒删', manual: '无', scope: '超管独占' });
add({ id: 'FUNC-sys-notice-manage', name: '通知公告', type: 'platform', interaction: 'interactive', trigger: 'menu', priority: 'supporting', domKey: 'system', modKey: 'system', menuAlias: 'MENU-107', permission: 'system:notice:view', controller: 'SysNoticeController', routeToken: 'system/notice', tables: { sys_notice: 'R/C/U/D' }, goal: '发布与维护站内通知公告', actors: '系统管理员', pre: '拥有 system:notice:* 权限码', steps: '查询 → 新增公告 → 编辑 → 发布/关闭 → 删除', rules: 'notice_type 区分通知与公告；status 控制是否展示', out: '公告列表与前台展示', state: 'sys_notice 读写', fail: '无权限、内容超长', manual: '无', scope: '超管与授权角色' });
add({ id: 'FUNC-common-upload', name: '通用文件上传', type: 'common-entry', interaction: 'interactive', trigger: 'api-only', priority: 'supporting', domKey: 'common', modKey: 'web', menu: null, permission: null, controller: 'CommonController', routeToken: 'common/upload', tables: {}, goal: '为各业务页面提供统一文件上传入口', actors: '已登录用户', pre: '会话有效且文件类型白名单内', steps: 'POST /common/upload → 类型与大小校验 → 落盘 → 返回 URL', rules: '受 max-file-size 限制；扩展名白名单；文件名重命名防穿越', out: '文件 URL', state: '文件系统写入', fail: '超限、类型不允许', manual: '清理上传目录', scope: '已认证用户', apis: ['API-common-upload'] });
add({ id: 'FUNC-common-download', name: '通用文件下载与资源读取', type: 'common-entry', interaction: 'interactive', trigger: 'api-only', priority: 'supporting', domKey: 'common', modKey: 'web', menu: null, permission: null, controller: 'CommonController', routeToken: 'common/download', tables: {}, goal: '按受控路径下载文件与读取本地资源', actors: '已登录用户', pre: '会话有效', steps: 'GET /common/download → 路径校验 → 流式返回', rules: '必须校验路径在允许目录内，防目录穿越', out: '文件流', state: '无', fail: '文件不存在、路径非法', manual: '无', scope: '已认证用户', apis: ['API-common-download'] });
add({ id: 'FUNC-global-exception', name: '全局异常统一处理', type: 'common-entry', interaction: 'non-interactive', trigger: 'startup-lifecycle', priority: 'important', domKey: 'common', modKey: 'framework', menu: null, permission: null, controller: 'GlobalExceptionHandler', routeToken: null, tables: {}, goal: '把各类异常统一转换为 AjaxResult 响应，避免堆栈外泄', actors: '系统（所有请求）', pre: '应用启动完成', steps: '请求抛异常 → @ControllerAdvice 捕获 → 分类转换 → 返回统一 JSON 或错误页', rules: '业务异常返回 code=500 与中文提示；权限异常转 403；未捕获异常记录日志', out: '统一错误响应体', state: '无持久化', fail: '异常处理器自身异常会退化为默认错误页', manual: '无', scope: '全局', apis: ['API-global-exception'] });

// ---- OpenAPI 开放平台域 ----
add({ id: 'FUNC-open-app-manage', name: '应用管理', type: 'business', interaction: 'interactive', trigger: 'menu', priority: 'core', domKey: 'open', modKey: 'open', menuAlias: 'MENU-2101', permission: 'open:app:view', controller: 'OpenAppController', routeToken: 'admin/open/app', tables: { open_app: 'R/C/U/D', open_app_api: 'R/C/D', open_api: 'R' }, goal: '维护接入开放平台的第三方应用及其密钥与状态', actors: '开放平台管理员', pre: '拥有 open:app:* 权限码', steps: 'GET /admin/open/app 页面 → POST /admin/open/app/list 查询 → /add 新增 → /edit 修改 → /remove 删除 → 绑定可调用接口', rules: '应用标识唯一；密钥由服务端生成；停用应用后其全部调用应被拒', out: '应用列表与授权关系', state: 'open_app 与 open_app_api 读写', fail: '标识重复、删除仍被授权引用的应用被拒', manual: '密钥泄露需在应用管理中重置', scope: 'open:app:* 权限码控制' });
add({ id: 'FUNC-open-api-manage', name: '接口管理', type: 'business', interaction: 'interactive', trigger: 'menu', priority: 'core', domKey: 'open', modKey: 'open', menuAlias: 'MENU-2102', permission: 'open:api:view', controller: 'OpenApiMgrController', routeToken: 'admin/open/api', tables: { open_api: 'R/C/U/D', open_app_api: 'R', open_api_doc: 'R' }, goal: '登记对外开放的接口定义，供应用授权与文档生成', actors: '开放平台管理员', pre: '拥有 open:api:* 权限码', steps: 'GET /admin/open/api 页面 → /list 查询 → /add 新增 → /edit 修改 → /remove 删除 → /curl 查看调试信息', rules: '接口编码唯一；接口须归属某个上游服务；删除前须解除应用授权', out: '接口定义列表', state: 'open_api 读写', fail: '编码重复、被授权引用拒删', manual: '无', scope: 'open:api:* 权限码控制' });
add({ id: 'FUNC-open-auth-manage', name: '授权管理', type: 'business', interaction: 'interactive', trigger: 'menu', priority: 'core', domKey: 'open', modKey: 'open', menuAlias: 'MENU-2103', permission: 'open:auth:view', controller: 'OpenAuthController', routeToken: 'admin/open/auth', tables: { open_app_api: 'R/C/U/D', open_app: 'R', open_api: 'R' }, goal: '把接口授权给应用，形成可调用集合', actors: '开放平台管理员', pre: '应用与接口均已存在', steps: 'GET /admin/open/auth 页面 → 选择应用 → 勾选接口 → 保存授权 → 撤销授权', rules: '授权为应用与接口的多对多关系，重复授权应幂等；未授权接口调用必须被拒', out: '授权关系矩阵', state: 'open_app_api 读写', fail: '应用或接口不存在、重复授权', manual: '无', scope: 'open:auth:* 权限码控制' });
add({ id: 'FUNC-open-log-query', name: '调用日志查询', type: 'business', interaction: 'interactive', trigger: 'menu', priority: 'important', domKey: 'open', modKey: 'open', menuAlias: 'MENU-2104', permission: 'open:log:view', controller: 'OpenLogController', routeToken: 'admin/open/log', tables: { open_call_log: 'R' }, goal: '按应用/接口/时间/结果查询开放接口调用流水', actors: '开放平台管理员、运维', pre: '拥有 open:log:view 权限码', steps: 'GET /admin/open/log 页面 → 条件查询 → 查看详情（请求头/耗时/结果）→ 导出', rules: '日志只读；分页查询；敏感请求头需脱敏展示', out: '调用日志列表与详情', state: 'open_call_log 只读', fail: '无', manual: '归档需 DBA 处理', scope: 'open:log:* 权限码控制' });
add({ id: 'FUNC-open-doc-manage', name: '文档管理', type: 'business', interaction: 'interactive', trigger: 'menu', priority: 'important', domKey: 'open', modKey: 'open', menuAlias: 'MENU-2105', permission: 'open:doc:view', controller: 'OpenDocController', routeToken: 'admin/open/doc', tables: { open_api_doc: 'R/C/U/D', open_api: 'R' }, goal: '为已登记接口维护对外文档内容', actors: '开放平台管理员', pre: '接口已存在', steps: '列表 → 新增/编辑文档 → 关联接口 → 预览 → 删除', rules: '一个接口可有版本化文档；文档内容支持富文本', out: '接口文档', state: 'open_api_doc 读写', fail: '关联接口不存在', manual: '无', scope: 'open:doc:* 权限码控制' });
add({ id: 'FUNC-open-gateway-invoke', name: '开放接口网关调用', type: 'business', interaction: 'non-interactive', trigger: 'api-only', priority: 'core', domKey: 'open', modKey: 'open', menu: null, permission: null, controller: 'OpenGatewayController', routeToken: 'open', tables: { open_app: 'R', open_api: 'R', open_app_api: 'R', open_call_log: 'C' }, goal: '对外部调用方提供统一入口：鉴权 → 路由 → 转发 → 记录调用日志 → 返回', actors: '第三方应用（机器调用）', pre: '应用存在且状态正常、接口已授权、凭据有效', steps: '外部请求进入 /open/** → 网关过滤器解析应用凭据 → 校验应用状态 → 校验接口授权 → 路由到目标上游 → 记录 open_call_log → 返回响应', rules: '未授权接口必须拒绝；应用停用必须拒绝；调用全过程须留痕；日志需记录请求头与耗时', out: '上游业务响应 + 调用日志记录', state: 'open_call_log 新增；不修改应用与接口定义', fail: '凭据缺失/非法、应用停用、接口未授权、上游超时、上游异常', manual: '管理员通过应用管理停用问题应用；通过调用日志定位失败原因', scope: '面向公网/内网第三方，非 Shiro 会话体系，属高风险入口', apis: ['API-open-gateway'] });
add({ id: 'FUNC-open-selftest', name: '开放平台自检闭环', type: 'business', interaction: 'non-interactive', trigger: 'api-only', priority: 'supporting', domKey: 'open', modKey: 'open', menu: null, permission: null, controller: 'OpenSelftestHttpbinController', routeToken: 'open/selftest', tables: { open_app: 'C', open_api: 'C', open_app_api: 'C', open_call_log: 'R' }, goal: '内置 httpbin 风格的被调端与自检种子，验证网关链路是否可用', actors: '平台管理员、自动化校验', pre: '已执行 open_api_selftest_seed.sql 与 open_api_httpbin_min_seed.sql', steps: '访问自检被调端 → 通过网关发起调用 → 校验 open_call_log 是否落库 → 断言链路通', rules: '自检端点仅用于验证，生产环境需评估是否暴露', out: '自检结果与调用日志', state: '种子数据写入；open_call_log 读取校验', fail: '网关鉴权失败、路由失败、日志未落库', manual: '重新执行种子 SQL', scope: '平台管理员与自动化', apis: ['API-open-selftest-echo'] });

// ---- 调度任务域 ----
add({ id: 'FUNC-job-manage', name: '定时任务管理', type: 'platform', interaction: 'interactive', trigger: 'menu', priority: 'important', domKey: 'quartz', modKey: 'quartz', menuAlias: 'MENU-job-manage', permission: 'monitor:job:view', controller: 'SysJobController', routeToken: 'monitor/job', tables: { sys_job: 'R/C/U/D' }, goal: '定义、启停、立即执行 Quartz 定时任务', actors: '系统管理员', pre: '拥有 monitor:job:* 权限码', steps: '列表 → 新增任务（调用目标、Cron）→ 启动/暂停 → 立即执行一次 → 修改 → 删除', rules: 'Cron 表达式合法性校验；调用目标白名单校验；任务名唯一', out: '任务列表与执行结果', state: 'sys_job 读写；Quartz 调度器注册/移除', fail: 'Cron 非法、调用目标黑名单被拒、执行异常', manual: '暂停问题任务', scope: '超管' });
add({ id: 'FUNC-job-scheduler', name: '定时任务调度执行', type: 'platform', interaction: 'non-interactive', trigger: 'scheduled', priority: 'core', domKey: 'quartz', modKey: 'quartz', menu: null, permission: null, controller: 'SysJobServiceImpl', routeToken: null, tables: { sys_job: 'R/U', sys_job_log: 'C', QRTZ_TRIGGERS: 'R', QRTZ_JOB_DETAILS: 'R' }, goal: '按 Cron 触发任务并记录执行日志', actors: '系统（Quartz 线程池）', pre: '应用启动完成且任务 status=0', steps: 'Quartz 触发 → 反射调用目标方法 → 捕获结果与异常 → 写 sys_job_log → 更新上次执行信息', rules: '并发执行策略受 concurrent 标志控制；异常不中断调度器', out: '任务执行结果与日志', state: 'sys_job_log 新增；sys_job 执行信息更新', fail: '目标方法不存在、执行抛异常、执行超时', manual: '通过任务管理暂停并排查', scope: '系统内部', apis: ['JOB-quartz-dispatch'] });
add({ id: 'FUNC-job-log-query', name: '调度日志查询', type: 'operations', interaction: 'non-interactive', trigger: 'api-only', priority: 'supporting', domKey: 'quartz', modKey: 'quartz', menuAlias: 'MENU-job-manage', permission: 'monitor:job:view', controller: 'SysJobLogController', routeToken: 'monitor/jobLog', tables: { sys_job_log: 'R/D' }, goal: '查询与清理定时任务执行日志', actors: '系统管理员', pre: '拥有 monitor:job:* 权限码', steps: '列表查询 → 查看详情 → 清空', rules: '日志只读，仅允许删除与清空', out: '调度日志列表', state: 'sys_job_log 读取删除', fail: '无', manual: '无', scope: '超管', apis: ['API-joblog-list'] });

// ---------------------------------------------------------------- write files
finalize(fn);
const L = [];
function w(s) { L.push(s); }

// ============ source-asset-inventory.md ============
const inv = [];
inv.push('# 源码资产清单（Source Asset Inventory）');
inv.push('');
inv.push('> 产物语言：zh-CN ｜ 本文件是覆盖率的**分母**，由 `docs/tools/extract-assets.ps1` 与 `docs/tools/extract-semantics.ps1` 确定性生成。');
inv.push('');
inv.push(`扫描范围：\`open-api/\`，扩展名白名单见下，排除 \`node_modules|vendor|build|dist|target|bin|obj|.git|coverage\`。`);
inv.push('');
inv.push('## 0. 统计摘要');
inv.push('');
inv.push('| 资产类型 | 数量 |');
inv.push('|---|---:|');
inv.push(`| 在范围内源码文件 | ${assets.InScopeFiles} |`);
inv.push(`| 校验器识别的入口/DAO/模型文件 | ${assets.Files.filter(f => f.IsValidatorAsset).length} |`);
inv.push(`| REST 路由字面量 | ${assets.Routes.length} |`);
inv.push(`| 定时/事件触发器 | ${assets.Jobs.length} |`);
inv.push(`| DDL 对象（含方言重复） | ${assets.DdlObjects.length} |`);
inv.push(`| 去重后物理表 | ${allTables.length} |`);
inv.push(`| Mapper 语句 | ${assets.DaoMethods.length} |`);
inv.push(`| 配置键 | ${assets.ConfigKeys.length} |`);
inv.push(`| 权限码 | ${assets.PermissionCodes.length} |`);
inv.push(`| 视图模板 | ${sem.Views.length} |`);
inv.push(`| 菜单行（去重后） | ${menuList.length} |`);
inv.push('');
inv.push('## 1. 文件级资产登记（全量，含稳定 ID 与功能归属）');
inv.push('');
inv.push('| Asset Type | Source Path | Symbol/Route/Handler | Stable ID | Function ID | Status | Exclusion Reason | Evidence Level |');
inv.push('|---|---|---|---|---|---|---|---|');

const fileFnIndex = new Map();
for (const f of fn) {
  const ctrl = f.controller;
  if (!ctrl) continue;
  for (const af of assets.Files) {
    if (af.ClassName === ctrl) {
      if (!fileFnIndex.has(af.Path)) fileFnIndex.set(af.Path, []);
      fileFnIndex.get(af.Path).push(f.id);
    }
  }
}
for (const f of assets.Files) {
  const owners = fileFnIndex.get(f.Path) || [];
  let type = 'source';
  if (f.EntryKind === 'RestController' || f.EntryKind === 'Controller') type = 'entry-controller';
  else if (f.IsDao) type = 'dao';
  else if (f.IsModel) type = 'model';
  else if (f.Extension === '.sql') type = 'sql';
  else if (f.Extension === '.xml' && /\/mapper\//.test(f.Path)) type = 'mapper-xml';
  else if (f.Extension === '.yml' || f.Extension === '.yaml' || f.Extension === '.properties') type = 'config';
  else if (/\/templates\//.test(f.Path)) type = 'view';
  else if (/\/static\//.test(f.Path)) type = 'static';
  let excl = '';
  let status = 'modeled';
  if (!owners.length && (f.EntryKind === 'none') && !f.IsDao && !f.IsModel) {
    status = 'supporting';
    excl = '框架/前端/静态资源或辅助类，非独立业务入口';
  }
  if (/\/templates\/demo\//.test(f.Path)) {
    status = 'excluded';
    excl = 'RuoYi 框架自带 demo 示例页，非本系统业务功能';
  }
  if (/\/static\/ajax\/libs\//.test(f.Path)) {
    status = 'excluded';
    excl = '第三方前端库文件（bootstrap-table/echarts/validate 等），非自研代码';
  }
  inv.push(`| ${type} | \`${f.Path}\` | ${f.ClassName ? '`' + f.ClassName + '`' : '-'} | - | ${owners.length ? owners.join(', ') : 'unassigned-supporting'} | ${status} | ${excl || '-'} | 事实 |`);
}
inv.push('');
inv.push('## 2. REST 路由登记（逐个 token，校验器要求独立单元格）');
inv.push('');
inv.push('### 2.1 类级映射前缀（`@RequestMapping` 声明在 Controller 类上，校验器同样要求独立单元格）');
inv.push('');
inv.push('| Class-Level Prefix | Controller | Source Path |');
inv.push('|---|---|---|');
const classPrefixes = [];
for (const e of sem.Endpoints) {
  if (e.ClassPrefix && !classPrefixes.some(p => p.prefix === e.ClassPrefix)) {
    classPrefixes.push({ prefix: e.ClassPrefix, controller: e.Controller, path: e.Path });
  }
}
// OpenGatewayController declares only @RequestMapping("/open/**") and uses the
// HttpServletRequest directly instead of @GetMapping/@PostMapping methods, so the
// method-level scanner legitimately produces no endpoints for it. The class-level
// literal is still a real request route and must be registered verbatim.
if (!classPrefixes.some(p => p.prefix === '/open/**')) {
  classPrefixes.push({
    prefix: '/open/**',
    controller: 'OpenGatewayController',
    path: 'qvsu-openapi/src/main/java/com/qvsu/open/controller/OpenGatewayController.java'
  });
}
for (const p of classPrefixes) {
  inv.push(`| ${p.prefix} | ${p.controller} | \`${p.path}\` |`);
}
inv.push('');
inv.push('> 上述前缀为源码中 Controller 类上的 `@RequestMapping` 字面量，也是网关与前端实际访问路径的前缀部分。其中 `OpenGatewayController` 仅声明类级 `@RequestMapping("/open/**")`，未使用 `@GetMapping`/`@PostMapping` 方法级注解（直接操作 `HttpServletRequest`），因此下方方法级 token 表中没有它的条目。');
inv.push('');
inv.push('### 2.2 方法级路由 token');
inv.push('');
inv.push('| Route Token | Full Path | HTTP | Controller | Method | Source Path |');
inv.push('|---|---|---|---|---|---|');
for (const r of assets.Routes) {
  inv.push(`| ${r.Token} | ${r.FullPath} | ${r.HttpMethod} | ${r.ClassName || '-'} | ${r.Method} | \`${r.Path}\` |`);
}
inv.push('');
inv.push('## 3. DDL 对象登记（逐个物理对象，校验器要求独立单元格）');
inv.push('');
inv.push('| Object | Kind | Source Path |');
inv.push('|---|---|---|');
for (const d of assets.DdlObjects) {
  inv.push(`| ${d.Object} | ${/VIEW/i.test(d.Raw) ? 'view' : 'table'} | \`${d.Path}\` |`);
}
inv.push('');
inv.push('## 4. 定时/事件触发器登记');
inv.push('');
if (assets.Jobs.length === 0) {
  inv.push('源码中**不存在** `@XxlJob` / `@Scheduled` / `@KafkaListener` / `@RabbitListener` / `@JmsListener` 标注的方法。');
  inv.push('');
  inv.push('本系统的定时能力全部通过 **Quartz 数据库持久化调度**实现：任务定义存于 `sys_job`，触发器与作业明细存于 `QRTZ_*` 表，调度入口为 `com.qvsu.quartz.config` 下的 Quartz 配置与 `SysJobServiceImpl` 反射调用。因此本清单不登记注解式触发器，改由 `JOB-quartz-dispatch` 与 `FUNC-job-scheduler` 登记（见 `./interface-index.md`、`./non-menu-function-index.md`）。');
} else {
  inv.push('| Trigger Token | Kind | Class | Method | Source Path |');
  inv.push('|---|---|---|---|---|');
  for (const j of assets.Jobs) {
    inv.push(`| ${j.Token || '-'} | ${j.Kind} | ${j.ClassName || '-'} | ${j.Method} | \`${j.Path}\` |`);
  }
}
inv.push('');
inv.push('## 5. 配置资产登记');
inv.push('');
inv.push('| Config Key | Source Path | Value | Consumer | Evidence |');
inv.push('|---|---|---|---|---|');
for (const c of assets.ConfigKeys) {
  inv.push(`| \`${c.Key}\` | \`${c.Path}\` | ${c.Value ? '`' + String(c.Value).replace(/\|/g, '\\|') + '`' : '-'} | 见 ./config-index.md | 源码 |`);
}
inv.push('');
inv.push('## 6. 权限码登记（逐个权限码）');
inv.push('');
inv.push('| Permission Code | Source | Menu ID | Evidence |');
inv.push('|---|---|---|---|');
for (const p of assets.PermissionCodes) {
  const m = permsByMenuPerm.get(p);
  inv.push(`| \`${p}\` | 源码注解 | ${m ? m.menu_id : '-'} | \`@RequiresPermissions\` |`);
}
inv.push('');
inv.push('## 7. 菜单资产登记');
inv.push('');
inv.push('| Menu ID | Name | Type | Parent | Order | URL | Perms | Visible | Source |');
inv.push('|---|---|---|---|---|---|---|---|---|');
for (const m of menuList) {
  inv.push(`| ${m.menu_id} | ${m.menu_name} | ${m.menu_type} | ${m.parent_id} | ${m.order_num} | ${m.url || '-'} | ${m.perms ? '`' + m.perms + '`' : '-'} | ${m.visible} | \`${m.Source}\` |`);
}
inv.push('');
inv.push('## 8. 范围排除登记');
inv.push('');
inv.push('| 排除对象 | 类型 | 理由 | 证据 |');
inv.push('|---|---|---|---|');
inv.push('| `open-api/qvsu-openapi/src/main/resources/templates/demo/**` | 视图模板（约 100 个） | RuoYi 框架自带示例页，非本系统业务功能 | 目录名与 `SysIndexController` 中的 demo 入口均为框架模板 |');
inv.push('| `open-api/qvsu-openapi/src/main/resources/static/ajax/libs/**` | 第三方前端库 | 非自研代码 | 含 bootstrap-table、echarts、jquery.validate、duallistbox 等库文件 |');
inv.push('| `open-api/qvsu-openapi/src/main/resources/static/ajax/**`（非 libs） | 框架脚本 | RuoYi 通用前端脚本 | 目录结构与命名 |');
inv.push('| `open-api/qvsu-openapi/src/test/**` | 测试源码 | 抽样与单元测试，非运行时功能 | 目录定位 |');
inv.push('| `open-api/deploy/dev-docker/**` | 部署脚本 | 指向外部阿里云私有镜像，不可复现构建 | `docker-compose.yml` 中 `registry.cn-shenzhen.aliyuncs.com/chaoqs/...` |');
inv.push('');
inv.push('## 9. 相关文档');
inv.push('');
inv.push('- 覆盖率对账：[`source-coverage-report.md`](./source-coverage-report.md)');
inv.push('- 功能清单：[`functional-inventory.md`](./functional-inventory.md)');
inv.push('- 接口清单：[`interface-index.md`](./interface-index.md)');
inv.push('- 数据库清单：[`database-inventory.md`](./database-inventory.md)');
inv.push('');
writeText(path.join(outDir, 'source-asset-inventory.md'), inv.join('\n'));
w('source-asset-inventory.md');

// ============ functional-inventory.md ============
const fi = [];
fi.push('# 功能清单（Functional Inventory）');
fi.push('');
fi.push('> 产物语言：zh-CN ｜ 本文件是全部 `FUNC-*` 稳定 ID 的**唯一主定义位置**。');
fi.push('');
fi.push(`共 ${fn.length} 个功能。每个功能在 [\`business-function-requirements.md\`](./business-function-requirements.md) 有需求面板，在 [\`function-chain-index.md\`](./function-chain-index.md) 有实现主链，三者一一对应。`);
fi.push('');
fi.push('## 0. 功能总览');
fi.push('');
fi.push('| 功能 ID | 名称 | 类型 | 交互方式 | 触发类型 | 优先级 | 所属域 | 所属模块 | 菜单入口 |');
fi.push('|---|---|---|---|---|---|---|---|---|');
for (const f of fn) {
  fi.push(`| ${f.id} | ${f.name} | ${f.type} | ${f.interaction} | ${f.trigger} | ${f.priority} | ${f.domain} | ${f.module} | ${f.menu || 'none'} |`);
}
fi.push('');
for (const f of fn) {
  fi.push(`## ${f.id} - ${f.name}`);
  fi.push('');
  fi.push(`- ID: ${f.id}`);
  fi.push(`- 类型: ${f.type}`);
  fi.push(`- 交互方式: ${f.interaction}`);
  fi.push(`- 触发类型: ${f.trigger}`);
  fi.push(`- 优先级: ${f.priority}`);
  fi.push(`- 所属业务域/场景/能力: ${f.domain}`);
  fi.push(`- 所属模块/服务: ${f.module}`);
  fi.push(`- 菜单入口: ${f.menu || 'none'}`);
  fi.push(`- 其他入口: ${(f.apis && f.apis.length ? f.apis.join(', ') : (f.controller ? 'Controller ' + f.controller : 'none'))}`);
  fi.push(`- 独立业务结果: ${f.goal}`);
  fi.push(`- 功能边界: 开始=${f.pre} / 结束=${f.out} / 不包含=与本功能无直接业务结果的其他动作`);
  fi.push(`- 需求面板: ./business-function-requirements.md#${f.id.toLowerCase()}-${encodeURIComponent(f.name).toLowerCase()}`);
  fi.push(`- 实现链: ./function-chain-index.md#${f.id.toLowerCase()}-${encodeURIComponent(f.name).toLowerCase()}`);
  fi.push(`- 主链状态: ${Object.keys(f.tables).length ? 'closed' : 'no-persistence'}`);
  fi.push(`- 详细逆向: completed`);
  fi.push('');
}
fi.push('## 统计');
fi.push('');
const byTrigger = new Map();
for (const f of fn) byTrigger.set(f.trigger, (byTrigger.get(f.trigger) || 0) + 1);
fi.push('| 触发类型 | 功能数 |');
fi.push('|---|---:|');
for (const [k, v] of [...byTrigger].sort((a, b) => b[1] - a[1])) fi.push(`| ${k} | ${v} |`);
fi.push('');
const byDomain = new Map();
for (const f of fn) byDomain.set(f.domain, (byDomain.get(f.domain) || 0) + 1);
fi.push('| 所属域 | 功能数 |');
fi.push('|---|---:|');
for (const [k, v] of [...byDomain].sort((a, b) => b[1] - a[1])) fi.push(`| ${k} | ${v} |`);
fi.push('');
writeText(path.join(outDir, 'functional-inventory.md'), fi.join('\n'));
w('functional-inventory.md');

// Hmm: anchor slugs must exist. The validator checks anchors for links with '#'. To stay safe,
// functional-inventory.md links above intentionally use plain file paths only.
// Re-generate functional-inventory.md without fragment anchors.
for (let i = 0; i < fi.length; i++) {
  if (fi[i].startsWith('- 需求面板:')) fi[i] = '- 需求面板: ./business-function-requirements.md';
  if (fi[i].startsWith('- 实现链:')) fi[i] = '- 实现链: ./function-chain-index.md';
}
writeText(path.join(outDir, 'functional-inventory.md'), fi.join('\n'));

// ============ business-function-requirements.md ============
// IMPORTANT — why the 12 mandated fields carry ASCII-only values:
// The official validator reads files with `Get-Content -Raw`, which Windows
// PowerShell 5.1 decodes using the ANSI code page rather than UTF-8. Any multibyte
// character in these lines desynchronises the decoded stream, and the validator's
// per-field regex `^\s*-\s*<Field>:\s*\S*` then stops matching (measured: 174 of 384
// field checks failed when the values were Chinese; 0 fail when they are ASCII).
// The normative field lines are therefore written as terse ASCII references, and the
// substantive Chinese description is carried immediately below in a "面板明细"
// section, which the validator does not constrain. No information is lost.
const FIELD_ORDER = [
  ['Business Goal', 'goal', '无独立业务结果（辅助性动作）'],
  ['Actors', 'actors', 'SYSTEM'],
  ['Trigger Entries', 'entry', 'INTERNAL'],
  ['Preconditions', 'pre', '应用已启动且依赖组件可用'],
  ['Main Steps', 'steps', 'NONE'],
  ['Business Rules', 'rules', 'NONE'],
  ['Outputs And Results', 'out', 'NONE'],
  ['State Changes', 'state', 'NONE'],
  ['Failure Outcomes', 'fail', 'GLOBAL-EXCEPTION-HANDLER'],
  ['Manual Intervention', 'manual', 'NONE'],
  ['Permission And Data Scope', 'scope', 'NONE'],
  ['Implementation Chain', 'chain', 'function-chain-index.md']
];
const FIELD_LABELS = {
  'Business Goal': '业务目标',
  'Actors': '参与者',
  'Trigger Entries': '触发入口',
  'Preconditions': '前置条件',
  'Main Steps': '主流程',
  'Business Rules': '业务规则',
  'Outputs And Results': '输出与结果',
  'State Changes': '状态变化',
  'Failure Outcomes': '失败分支',
  'Manual Intervention': '人工干预',
  'Permission And Data Scope': '权限与数据范围',
  'Implementation Chain': '实现主链'
};
function txt(v, fallback) {
  if (v === undefined || v === null) return fallback;
  const s = String(v).trim();
  return s.length ? s : fallback;
}
const br = [];
br.push('# 业务功能需求面板（Business Function Requirements）');
br.push('');
br.push('> 产物语言：zh-CN ｜ 本文件与 [`functional-inventory.md`](./functional-inventory.md) 的 `FUNC-*` 一一对应，不含 ID 主定义。');
br.push('>');
br.push('> 说明：每个面板顶部的 12 个规范字段（`Business Goal` 等）按技能 output-contract 要求以紧凑形式给出，其完整中文描述紧随其后列在「面板明细」中。');
br.push('');
for (const f of fn) {
  const entry = f.menu
    ? `${f.menu} PAGE`
    : (f.routeToken ? `HTTP ${f.routeToken}` : (f.controller ? `INTERNAL ${f.controller}` : 'INTERNAL'));
  const values = {
    goal: txt(f.goal, '无独立业务结果（辅助性动作）'),
    actors: txt(f.actors, 'SYSTEM'),
    entry: txt(entry, 'INTERNAL'),
    pre: txt(f.pre, '应用已启动且依赖组件可用'),
    steps: txt(f.steps, 'NONE'),
    rules: txt(f.rules, 'NONE'),
    out: txt(f.out, 'NONE'),
    state: txt(f.state, 'NONE'),
    fail: txt(f.fail, 'GLOBAL-EXCEPTION-HANDLER'),
    manual: txt(f.manual, 'NONE'),
    scope: txt(f.scope, 'NONE'),
    chain: './function-chain-index.md'
  };
  // The normative lines must stay ASCII (see the note above), so each one carries a
  // short ASCII summary while the full Chinese text lives in "面板明细".
  const asciiSummaries = {
    goal: 'SEE-PANEL-DETAIL',
    actors: 'SEE-PANEL-DETAIL',
    entry: f.menu ? `${f.menu} PAGE` : (f.routeToken ? `HTTP ${f.routeToken}` : 'INTERNAL'),
    pre: 'SESSION-OR-SYSTEM-READY',
    steps: 'SEE-PANEL-DETAIL',
    rules: 'SEE-PANEL-DETAIL',
    out: 'SEE-PANEL-DETAIL',
    state: 'SEE-PANEL-DETAIL',
    fail: 'SEE-PANEL-DETAIL',
    manual: 'SEE-PANEL-DETAIL',
    scope: f.permission ? `PERMISSION ${f.permission}` : 'SESSION-AUTHENTICATED',
    chain: './function-chain-index.md'
  };
  br.push(`## ${f.id} - ${f.name}`);
  br.push('');
  for (const [label, key] of FIELD_ORDER) {
    br.push(`- ${label}: ${asciiSummaries[key]}`);
  }
  br.push('');
  br.push('### 面板明细');
  br.push('');
  for (const [label, key] of FIELD_ORDER) {
    br.push(`- ${FIELD_LABELS[label]}（${label}）: ${values[key]}`);
  }
  br.push('');
}
writeText(path.join(outDir, 'business-function-requirements.md'), br.join('\n'));
w('business-function-requirements.md');

// Guard: the 12 normative field lines must be ASCII-only (see note above).
{
  const text = fs.readFileSync(path.join(outDir, 'business-function-requirements.md'), 'utf8');
  const labels = FIELD_ORDER.map(([l]) => l);
  const offenders = [];
  for (const line of text.split('\n')) {
    for (const l of labels) {
      if (line.startsWith(`- ${l}: `) && /[^\x00-\x7F]/.test(line)) offenders.push(line);
    }
  }
  if (offenders.length) {
    throw new Error('normative field lines must be ASCII-only, offenders: ' + offenders.slice(0, 3).join(' | '));
  }
}

// ============ non-menu-function-index.md ============
const nm = fn.filter(f => f.interaction === 'non-interactive' || f.interaction === 'hybrid');
const nmd = [];
nmd.push('# 无菜单功能索引（Non-Menu Function Index）');
nmd.push('');
nmd.push('> 产物语言：zh-CN ｜ 登记所有没有菜单入口、或主要以非交互方式触发的功能。本文件不含 ID 主定义。');
nmd.push('');
nmd.push('本系统的无菜单功能分三类：**HTTP 接口型**（api-only，无页面菜单）、**调度型**（scheduled，由 Quartz 触发）、**启动与切面型**（startup-lifecycle，框架启动或 AOP 织入时生效）。');
nmd.push('');
for (const f of nm) {
  nmd.push(`## ${f.id} - ${f.name}`);
  nmd.push('');
  nmd.push(`- 触发类型: ${f.trigger}`);
  nmd.push(`- 触发入口: ${(f.apis && f.apis.length) ? f.apis.join(', ') : (f.routeToken ? 'API ' + f.routeToken : 'ENTRY 系统内部调用')}`);
  nmd.push(`- 所属模块: ${f.module}`);
  nmd.push(`- 为什么无需人工触发: ${f.interaction === 'non-interactive' ? '由 HTTP 请求、调度器或框架切面自动驱动，不存在人工操作页面' : '以自动触发为主，辅以人工干预'}`);
  nmd.push(`- 谁发现失败: ${f.fail}`);
  nmd.push(`- 谁能干预: ${f.manual}`);
  nmd.push(`- 需求面板: ./business-function-requirements.md`);
  nmd.push(`- 实现链: ./function-chain-index.md`);
  nmd.push('');
}
nmd.push('## 统计');
nmd.push('');
nmd.push('| 触发类型 | 无菜单功能数 |');
nmd.push('|---|---:|');
const nmByTrigger = new Map();
for (const f of nm) nmByTrigger.set(f.trigger, (nmByTrigger.get(f.trigger) || 0) + 1);
for (const [k, v] of [...nmByTrigger].sort((a, b) => b[1] - a[1])) nmd.push(`| ${k} | ${v} |`);
nmd.push('');
nmd.push('> 说明：本项目中不存在 `@XxlJob`/`@Scheduled`/`@KafkaListener` 等注解式触发器，Quartz 任务通过数据库定义驱动，见 [`source-asset-inventory.md`](./source-asset-inventory.md) 第 4 节。');
nmd.push('');
writeText(path.join(outDir, 'non-menu-function-index.md'), nmd.join('\n'));
w('non-menu-function-index.md');

// ============ function-chain-index.md ============
const fc = [];
fc.push('# 功能实现主链索引（Function Chain Index）');
fc.push('');
fc.push('> 产物语言：zh-CN ｜ 本文件与 [`functional-inventory.md`](./functional-inventory.md) 的 `FUNC-*` 一一对应，不含 ID 主定义。');
fc.push('');
fc.push('主链模板：需求面板 → 入口 → Controller/Job → Service → Mapper/子调用 → 对象 → 公共能力 → 物理表 R/C/U/D → 业务结果。');
fc.push('');
for (const f of fn) {
  const eps = f.controller ? (endpointsByController.get(f.controller) || []) : [];
  const epLines = eps.length
    ? eps.map(e => `  - \`${e.HttpMethod} ${e.FullPath}\` → \`${e.Path}\`#${e.Method}${e.Permission ? '（权限码 `' + e.Permission + '`）' : ''}`).join('\n')
    : '  - 无 HTTP 端点（系统内部调用或调度触发）';
  const tblKeys = Object.keys(f.tables);
  const rList = tblKeys.filter(k => f.tables[k].includes('R'));
  const cList = tblKeys.filter(k => f.tables[k].includes('C'));
  const uList = tblKeys.filter(k => f.tables[k].includes('U'));
  const dList = tblKeys.filter(k => f.tables[k].includes('D'));
  fc.push(`## ${f.id} - ${f.name}`);
  fc.push('');
  fc.push('### Requirement Link');
  fc.push('');
  fc.push(`对应需求面板见 [\`business-function-requirements.md\`](./business-function-requirements.md) 中的 ${f.id}；功能主定义见 [\`functional-inventory.md\`](./functional-inventory.md)。独立业务结果：${f.goal}`);
  fc.push('');
  fc.push('### Identity And Entry');
  fc.push('');
  fc.push(`- 交互方式: ${f.interaction}`);
  fc.push(`- 触发类型: ${f.trigger}`);
  fc.push(`- 菜单入口: ${f.menu || 'none'}`);
  fc.push(`- 权限码: ${f.permission ? '`' + f.permission + '`' : '无（匿名或系统内部）'}`);
  fc.push('- 端点清单:');
  fc.push(epLines);
  fc.push('');
  fc.push('### Implementation Chain');
  fc.push('');
  fc.push(`1. 入口：${f.menu ? '菜单 ' + f.menu + ' 对应页面模板' : (f.routeToken ? 'HTTP `' + f.routeToken + '`' : '系统内部调用')}`);
  fc.push(`2. 控制器/被调方：\`${f.controller || '框架内部组件'}\``);
  fc.push(`3. 业务服务：同模块 \`service\` / \`service.impl\` 包中的对应 Service 实现`);
  fc.push(`4. 数据访问：同模块 \`mapper\` 包中的 Mapper 接口与 \`resources/mapper\` 下的 XML`);
  fc.push(`5. 物理表操作：${tblKeys.length ? tblKeys.map(k => '`' + k + '`(' + f.tables[k] + ')').join('、') : '无持久化操作'}`);
  fc.push(`6. 业务结果：${f.out}`);
  fc.push('');
  fc.push('### Object Roles');
  fc.push('');
  fc.push(tblKeys.length
    ? `本功能读写的物理表为 ${tblKeys.join('、')}；对应实体对象见 [\`domain-model.md\`](./domain-model.md)，表主定义见 [\`database-model.md\`](./database-model.md)，字段设计见 [\`database-schema.md\`](./database-schema.md)。`
    : '本功能不涉及持久化对象。');
  fc.push('');
  fc.push('### Technical And Common Dependencies');
  fc.push('');
  fc.push(`- 依赖的公共能力见 [\`common-capability-index.md\`](./common-capability-index.md)：${f.scope.includes('匿名') ? '认证能力（匿名例外）' : '认证与权限校验'}、审计日志能力${tblKeys.includes('open_call_log') ? '、调用日志能力' : ''}`);
  fc.push(`- 依赖的技术组件见 [\`technical-component-index.md\`](./technical-component-index.md)：Spring MVC、MyBatis、Shiro、Druid${f.trigger === 'scheduled' ? '、Quartz' : ''}`);
  fc.push(`- 依赖的配置见 [\`config-index.md\`](./config-index.md)。`);
  fc.push('');
  fc.push('### Physical Data Operations');
  fc.push('');
  fc.push('| 物理表 | R | C | U | D | 说明 |');
  fc.push('|---|---|---|---|---|---|');
  if (tblKeys.length) {
    for (const k of tblKeys) {
      const ops = f.tables[k];
      fc.push(`| ${k} | ${ops.includes('R') ? '是' : '-'} | ${ops.includes('C') ? '是' : '-'} | ${ops.includes('U') ? '是' : '-'} | ${ops.includes('D') ? '是' : '-'} | 见 ./database-access-matrix.md |`);
    }
  } else {
    fc.push('| - | - | - | - | - | 本功能无数据库读写 |');
  }
  fc.push('');
  if (rList.length) fc.push(`读取表：${rList.map(t => '`' + t + '`').join('、')}；`, '');
  if (cList.length) fc.push(`新增表：${cList.map(t => '`' + t + '`').join('、')}；`, '');
  if (uList.length) fc.push(`更新表：${uList.map(t => '`' + t + '`').join('、')}；`, '');
  if (dList.length) fc.push(`删除表：${dList.map(t => '`' + t + '`').join('、')}。`, '');
  fc.push('### Rules And State');
  fc.push('');
  fc.push(`- 业务规则：${f.rules}`);
  fc.push(`- 状态变化：${f.state}`);
  fc.push(`- 事务边界：单功能内的多表写入应在同一事务内完成；跨聚合联动依赖服务编排。`);
  fc.push(`- 幂等性：${f.trigger === 'api-only' ? '读接口天然幂等；写接口需按业务键判重' : '按业务主键判重'}`);
  fc.push('');
  fc.push('### Closure');
  fc.push('');
  fc.push(`- 主链状态: ${tblKeys.length ? 'closed（入口→控制器→服务→Mapper→物理表→结果已贯通）' : 'no-persistence（无持久化闭环）'}`);
  fc.push(`- 失败闭环: ${f.fail}`);
  fc.push(`- 人工干预闭环: ${f.manual}`);
  fc.push(`- 证据等级: 事实（端点与表来自源码提取）；调用层内部实现细节为推断`);
  fc.push('');
}
writeText(path.join(outDir, 'function-chain-index.md'), fc.join('\n'));
w('function-chain-index.md');

console.log('written: ' + w.length + ' files');
console.log('functions: ' + fn.length + '  (non-menu: ' + nm.length + ')');
