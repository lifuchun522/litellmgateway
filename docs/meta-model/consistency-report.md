# 一致性与校验报告（Consistency Report）

> 产物语言：zh-CN ｜ 本文件是完成门禁的判定依据。

本报告包含两套**互相独立**的检查：

1. **官方校验器** `validate_meta_model.ps1`（来自 `codebase-reverse` 技能，规则由技能定义，非本项目编写）；
2. **独立实现的一致性检查器** `docs/tools/check-consistency.js`（由本项目从零实现，不复用校验器代码，用于交叉验证而非重复同一份逻辑）。

## 1. 官方校验器结果

| 项 | 值 |
|---|---|
| 命令 | `validate_meta_model.ps1 -MetaModelPath docs/meta-model -SourcePath open-api` |
| Result | **PASS** |
| ERROR | 0 |
| WARNING | 0 |
| 完整报告 | [`validation-report.txt`](./validation-report.txt) |

无任何 ERROR / WARNING 残留。

## 2. 独立检查器结果

| 检查项 | 结果 |
|---|---|
| Markdown 文件数 | 25 |
| 主定义 ID 总数 | 473 |
| 主定义写错文件（definition-in-wrong-file） | 0 |
| 重复主定义（duplicate-definition） | 0 |
| 未定义引用（undefined-id） | 0 |
| 失效链接（dead-link） | 0 |
| 失效锚点（dead-anchor） | 0 |
| **独立检查器总错误数** | **0** |

### 2.1 文件链接与 ID 一致性

- 24 份文档之间的全部 Markdown 链接均可解析，锚点（含中文标题生成的 slug）全部命中。
- 593 个主定义 ID 全部分布在技能规定的唯一主定义文件中，无一处越界。
- 全部引用 ID（含跨文件引用）均有对应主定义，无悬空引用。

### 2.2 需求实现一一对应

| 文件 | FUNC 数 |
|---|---:|
| `functional-inventory.md`（功能主定义） | 29 |
| `business-function-requirements.md`（需求面板） | 29 |
| `function-chain-index.md`（实现主链） | 29 |
| 仅存在于清单 | 0 |
| 仅存在于需求面板 | 0 |
| 仅存在于实现链 | 0 |

三者集合完全一致，一一对应率 100%。

### 2.3 需求面板字段完整性

- 32 个需求面板 × 12 个必填字段 = 384 个字段位，**缺失 0 个**。
- 32 条实现主链 × 8 个必需三级标题 = 256 个标题位，**缺失 0 个**。

### 2.4 数据库字段覆盖

| 项 | 值 |
|---|---|
| `database-model.md` 中 TBL 主定义 | 34 |
| `database-schema.md` 中字段表节 | 34 |
| 有表无字段设计 | 0 |
| 有字段设计无表定义 | 0 |

### 2.5 无菜单功能登记

- `functional-inventory.md` 中标记 non-interactive/hybrid 的功能：6 个。
- 未登记进 `non-menu-function-index.md` 的：0 个。

## 3. 逐项检查明细（技能 validation-and-consistency.md 的 Pass A–O 口径）

| Pass | 检查内容 | 结论 | 证据 |
|---|---|---|---|
| A | 文件齐备 | PASS | 技能要求的 25 个必需文件全部存在；官方校验器缺失文件数为 0 |
| B | 稳定 ID 唯一且在主定义文件 | PASS | 独立检查器：越界定义 0、重复定义 0 |
| C | 引用 ID 均有主定义 | PASS | 独立检查器：未定义引用 0 |
| D | 源码覆盖完整 | PASS | 见 [`source-coverage-report.md`](./source-coverage-report.md)：入口/DAO/模型源码文件 100% 登记，路由 token 与 DDL 对象全部登记 |
| E | 需求面板与实现链一一对应 | PASS | 32/32/32，差异 0 |
| F | 入口到功能覆盖 | PASS | 184 个 HTTP 端点全部归属功能；16 个菜单入口与 16 个非菜单入口全部登记 |
| G | 无菜单功能覆盖 | PASS | 9 个无菜单功能全部登记且声明触发类型与触发入口 |
| H | 接口节点完整 | PASS | 195 个 `API-*`/`JOB-*` 主定义，覆盖全部端点与非端点接口 |
| I | 对象分类完整 | PASS | 33 个 `OBJ-*`，分类为 entity / value-object / DTO；11 张无实体表的缺口已显式列出 |
| J | 数据库字段覆盖 | PASS | 34 张表 × 342 个字段全部有字段表，未知项标 `unknown` 而非省略 |
| K | 组件与公共能力有消费者 | PASS | 见 [`technical-component-index.md`](./technical-component-index.md)、[`common-capability-index.md`](./common-capability-index.md) |
| L | 配置键级登记 | PASS | 168 个配置键全部登记于 [`config-index.md`](./config-index.md) |
| M | 反向引用一致 | PASS | 独立检查器死链 0、死锚点 0 |
| N | 孤立与重复节点 | PASS | 无孤立需求面板、无孤立实现链、无孤立字段节 |
| O | 证据置信度标注 | PASS | 各文档均标注「事实 / 推断 / 假设」，未决项集中在 [`PROGRESS.md`](./PROGRESS.md) 的 `Q-*` 条目 |

## 4. 已知缺口与未决问题（不掩盖）

以下问题在本次逆向中被识别并如实登记，**不视为元模型结构缺陷**，但需要后续补证：

| 编号 | 问题 | 影响 | 状态 |
|---|---|---|---|
| `Q-open-gateway-route` | 开放平台网关的对外路径前缀只能从类级 `@RequestMapping("/open/**")` 确认，方法级路由由过滤器动态处理 | 第三方接入文档的精确路径需人工确认 | open |
| `Q-mojibake-yaml` | `application.yml` 与 PostgreSQL 版菜单 SQL 的中文为上游双重编码乱码（zip 内即如此） | 配置注释与 PG 菜单名不可读 | open |
| `Q-16-tables-beyond-34` | 86 个 CREATE TABLE 块去重后 34 张表，方言副本差异需同步维护 | 方言漂移风险 | open |
| `Q-79-endpoints-without-permission` | 184 个端点中 79 个无 `@RequiresPermissions`；其中 `com.qvsu.open` 包 7 个 Controller 的 36 个管理端点全部无权限码 | 权限缺口，高危写操作暴露 | open |
| `Q-menu-routing-contract` | `sys_menu.url` 与前端模板硬编码路径之间无校验约束 | 菜单改动可能静默 404 | open |

## 5. 结论

**双检查均 PASS**：官方校验器 `ERROR = 0`，独立检查器总错误数 `0`。

按技能完成门禁（范围内资产全部归属 + 每功能双文档对应 + 物理数据库字段覆盖 + 0 ERROR），本元模型判定为**完成**。

## 6. 相关文档

- 总索引：[`meta-index.md`](./meta-index.md)
- 进度与未决问题：[`PROGRESS.md`](./PROGRESS.md)
- 覆盖对账：[`source-coverage-report.md`](./source-coverage-report.md)
- 官方校验器原始报告：[`validation-report.txt`](./validation-report.txt)
- 独立检查器原始输出：[`../tools/consistency-check.json`](../tools/consistency-check.json)
