# 元模型总索引（Meta Index）

> **产物语言：zh-CN**（依据：用户明确指定「文档写到 docs 目录下」，且仓库既有文档《架构决策实验室架构方案1期》为中文，故锁定中文输出）。
> 稳定 ID、类名/方法名、路径、URL、表名/字段名、配置键均保持源码原文。

## 1. 范围（Scope）

| 项 | 内容 |
|---|---|
| 系统 ID | `SYS-qvsu-openapi`（见 [technical-architecture.md](./technical-architecture.md)） |
| 系统名称 | QVSU OpenAPI 管理与网关服务（精简版） |
| 仓库 | `D:\src\github\litellmgateway` |
| 被逆向代码 | `open-api/`（由仓库根 `open-api.zip` 解压所得） |
| 架构类型 | 单体 Spring Boot 2.x + MyBatis + Shiro，服务端渲染 Thymeleaf |
| 部署单元 | `qvsu-openapi` 单模块（jar/war）、`deploy/local-docker` 组合部署 |
| 逆向模式 | `reverse-new` 全量架构与功能基线模式（B0–B9） |
| 输出语言 | zh-CN |
| 产物目录 | `docs/meta-model/` |

### 1.1 顶层目录归属

| 顶层目录 | 归属 | 处理方式 |
|---|---|---|
| `open-api/qvsu-openapi` | 应用源码（唯一可运行模块） | 全量逆向 |
| `open-api/sql` | 业务 SQL 与种子脚本 | 全量登记（DDL 与菜单来源） |
| `open-api/deploy/local-docker` | 本地组合部署（PostgreSQL 11 + 应用） | 登记为部署单元 |
| `open-api/deploy/dev-docker` | 拉取外部私有镜像 | **排除**：不可复现构建 |
| `.github` | CI 工作流 | 不在逆向范围（与运行时功能无关） |
| `架构决策实验室架构方案1期-2.pdf` | 上游设计文档 | 作为旁证，不作为事实来源 |

## 2. 产物清单与主定义位置

| 文件 | 作用 | 主定义 ID 前缀 | 统计 |
|---|---|---|---|
| [`technical-architecture.md`](./technical-architecture.md) | 技术架构与系统主定义 | `SYS-*` |  |
| [`technical-component-index.md`](./technical-component-index.md) | 技术组件与能力接口 | `COMP-*` / `TCAP-*` |  |
| [`module-index.md`](./module-index.md) | 模块与服务索引 | `MOD-*` / `SVC-*` |  |
| [`business-architecture.md`](./business-architecture.md) | 业务域/能力/场景/菜单/入口 | `DOM-*` / `CAP-*` / `SCN-*` / `MENU-*` / `ENTRY-*` |  |
| [`functional-inventory.md`](./functional-inventory.md) | 功能清单 | `FUNC-*` | 29 个功能 |
| [`business-function-requirements.md`](./business-function-requirements.md) | 业务功能需求面板 | （无，引用 FUNC） | 29 个面板 |
| [`non-menu-function-index.md`](./non-menu-function-index.md) | 无菜单功能索引 | （无，引用 FUNC） | 6 个功能 |
| [`function-chain-index.md`](./function-chain-index.md) | 功能实现主链 | （无，引用 FUNC） | 29 条主链 |
| [`domain-model.md`](./domain-model.md) | 领域对象模型 | `OBJ-*` / `RULE-*` | 33 个对象 |
| [`interface-index.md`](./interface-index.md) | 接口清单 | `API-*` / `EVENT-*` / `JOB-*` | 192 个接口节点 |
| [`database-inventory.md`](./database-inventory.md) | 数据库资产清单 | （无，引用 TBL） | 34 张表 |
| [`database-model.md`](./database-model.md) | 物理表主定义 | `TBL-*` / `STORE-*` / `TOPIC-*` | 34 张表 |
| [`database-schema.md`](./database-schema.md) | 逐字段设计 | （无，引用 TBL） | 34 节字段表 |
| [`database-relations.md`](./database-relations.md) | 表关系与血缘 | （无，引用 TBL） |  |
| [`database-access-matrix.md`](./database-access-matrix.md) | 功能到表读写矩阵 | （无） |  |
| [`data-ownership.md`](./data-ownership.md) | 数据归属与冲突 | （无，引用 TBL） |  |
| [`common-capability-index.md`](./common-capability-index.md) | 公共能力索引 | `COMMON-*` / `CAPI-*` |  |
| [`flow-index.md`](./flow-index.md) | 端到端流程索引 | （无） |  |
| [`config-index.md`](./config-index.md) | 配置键索引 | `CFG-*` | 29 个配置键 |
| [`change-hotspots.md`](./change-hotspots.md) | 变更热点与风险 | （无） |  |
| [`source-asset-inventory.md`](./source-asset-inventory.md) | 源码资产台账（覆盖分母） | （无） | 409 个文件 |
| [`source-coverage-report.md`](./source-coverage-report.md) | 源码覆盖对账 | （无） |  |
| [`consistency-report.md`](./consistency-report.md) | 一致性检查报告 | （无） |  |
| [`PROGRESS.md`](./PROGRESS.md) | 进度与断链登记 | `Q-*` |  |

## 3. 阅读路径建议

1. 先看 [technical-architecture.md](./technical-architecture.md) 与 [business-architecture.md](./business-architecture.md) 建立整体认知；
2. 用 [functional-inventory.md](./functional-inventory.md) 找功能，用 [function-chain-index.md](./function-chain-index.md) 追实现；
3. 用 [interface-index.md](./interface-index.md) 查接口契约，用 [database-schema.md](./database-schema.md) 查字段；
4. 改动前先读 [change-hotspots.md](./change-hotspots.md)，合规审计读 [common-capability-index.md](./common-capability-index.md)；
5. 覆盖率与可信度看 [source-coverage-report.md](./source-coverage-report.md) 与 [consistency-report.md](./consistency-report.md)。

## 4. 事实来源与工具

| 工具 | 作用 | 产物 |
|---|---|---|
| `docs/tools/extract-assets.ps1` | 源码资产、路由、配置键、权限码、Mapper 语句提取 | `docs/tools/assets.json` |
| `docs/tools/extract-semantics.ps1` | 表 DDL、控制器端点、视图模板提取 | `docs/tools/semantics.json` |
| `docs/tools/extract-menus.js` | 菜单 INSERT 语句解析 | `docs/tools/menus.json` |
| `docs/tools/gen-*.js` | 各产物的确定性生成 | 本目录 Markdown |
| `validate_meta_model.ps1` | 官方校验器 | `docs/meta-model/validation-report.txt` |
