# Proposal

## Why

仓库根目录挂着 `open-api.zip`（3,840,532 字节，SHA256 `A798558197D898011BBBF4AF2A0CA5F84CBFA5480099EE4D3A8E3FBE7F7BBE05`），解压后是一个能跑但没人说得清的 Java 后端工程：`open-api/qvsu-openapi`，Spring Boot 2.7.18 + MyBatis + Shiro + Druid + Quartz + Thymeleaf，单模块 jar，端口 5656。

问题不在于「能不能跑」，而在于**它现在是一个黑盒**，回答不了四个必答问题：

1. 有哪些模块、请求从哪进、走哪条链出去？（读代码能猜，但猜出来的结论不可复核）
2. 哪些代码能直接复用、哪些要改名复用、哪些必须废弃？（后面 17 境全要查这张表）
3. 它到底是不是一个「网关」？（直觉去请求 `/v1/chat/completions` 会拿到 404，但没人知道原因是拦截器、路由前缀，还是压根没写）
4. 换一台机器、换一个人，能不能复现出同样的结论？（现在靠的是「我记得」）

第 01 境要交付的正是这四件事的答案。它是整个系列的 0 号基线：后面的换骨（第 02 境）、本体（第 03 境）、协议（第 04 境）、流水线（第 05 境）都必须在这条参照线上做增量，基线不清就是一路返工。

> 来源：`docs/tutorials/hunter-gateway/chapters/01-move-blood/01-Demo逆向筑基-文章.md`

## What Changes

**一、只读扫描脚本（可重跑，不原地解压）**

- 新增 `scripts/reverse/scan.sh`：把文章里那段手敲的扫描固化成脚本——冻结 zip 哈希、定位真实项目根、统计根包与包分布、导出 Controller 注解候选、导出依赖树、清点配置/SQL/容器化资产。
- 新增 `scripts/reverse/scan.ps1`：Windows 等价实现（本仓库当前开发环境是 Windows，不能只有 bash 一条路）。
- 扫描只读：`open-api.zip` 与已解压的 `open-api/` **一行都不改**，中间产物落在 `.reverse-work/`（已 gitignore）。

**二、As-Is 基线文档（每一条都能指回文件路径）**

- 新增 `docs/reverse/as-is.md`，结构固定不自由发挥：运行前置条件 → 模块树 → 启动入口 → 接口清单 → 调用链 → ER → 页面路由 → 外部依赖 → 复用矩阵 → 缺口清单 → 风险清单。
- 第一节**不是**模块树，而是「运行前置条件」：JDK、Maven、必需的外部服务与端口、必需执行的 SQL、已验证的启动命令。理由是三次诊断里有两次根因都是环境缺失而非代码缺陷。

**三、三份可被反驳的表（机器输出 + 人工确认分离）**

- `docs/reverse/endpoints.md`：候选接口 + 「确认/否决/待验证」列 + 确认人 + 否决理由。机器筛出来的原始输出会混入被注释的映射、测试类里的映射、只在特定 profile 生效的映射，直接当结论等于把噪音当事实。
- `docs/reverse/reuse-matrix.md`：表头固定为「对象、所在路径、判定、理由、证据（文件:行号）、生效章节」，判定取值固定五档：直接复用 / 改名复用 / 重构复用 / 废弃 / 新增。
- `docs/reverse/gaps-and-risks.md`：**缺口**（必须补的能力，按能力域归类并给出建议章节）与**风险**（可能出问题的地方，按严重度排序并给出触发条件）分开两张表。混在一起就无法判断优先级。

**四、冻结基线（三件事：哈希、可运行命令、分支）**

- `docs/reverse/baseline.md`：zip 哈希、解压根目录、已验证的编译与启动命令、验证响应原文。
- 分支 `chapter/01-reverse-demo-baseline`，提交 `docs(ch01): reverse engineer open-api demo baseline`（文章原文为 `chapter/01-reverse-demo` 与同一条提交信息，本仓库统一章节分支命名加 `-baseline` 后缀以区分同名能力）。

**明确不做（Not Do）**

- **不改一行源码。** 包括不改根包名、不改品牌名、不删框架示例页面。改名必须发生在基线冻结之后，顺序不能颠倒——一旦替换完成，就永远失去「原样能跑通」这条参照线，后面任何故障都无法区分是旧有问题还是自己改坏的。
- 不做性能优化、不加新功能、不升级依赖版本。
- 不把 As-Is 文档写成架构设计：本境只描述**是什么**，不描述**应该是什么**（那是第 03 境本体建模的事）。
- 不补 `/v1/*` 协议入口：本境把「协议入口完全缺失」登记成最高优先级缺口，交给第 04 境，而不是顺手写一个假的。

## Capabilities

### New Capabilities

- `reverse-baseline`：把一份无文档的既有工程转成可回归、可复核、可复现的 0 号基线的能力——只读扫描、As-Is 资产清点、复用矩阵判定、缺口与风险分账、基线冻结与复现验证。

### Modified Capabilities

无。仓库此前没有任何 OpenSpec 能力规格（`openspec/specs/` 为空），因此不存在需要变更的既有能力。

## Impact

**新增文件**

| 位置 | 影响 |
|------|------|
| `scripts/reverse/scan.sh` | 只读扫描（CI / Linux 侧） |
| `scripts/reverse/scan.ps1` | 只读扫描（Windows 侧等价实现） |
| `docs/reverse/as-is.md` | As-Is 基线主文档 |
| `docs/reverse/endpoints.md` | 接口候选与人工确认表 |
| `docs/reverse/reuse-matrix.md` | 复用矩阵 |
| `docs/reverse/gaps-and-risks.md` | 缺口清单与风险清单 |
| `docs/reverse/baseline.md` | 基线冻结记录（哈希 / 命令 / 验证原文） |
| `docs/reverse/scan-output/` | 扫描机器产物（packages/endpoints/assets/dependency-tree/zip.sha256/root.txt） |

**不改动的文件**

- `open-api.zip`、`open-api/**`：全程只读。CI 有一道门禁检查 `open-api.zip` 的哈希与首个提交一致。

**新增外部依赖**

无。脚本只用 `bash`/`unzip`/`grep`/`find`（Linux）与 PowerShell 内置能力（Windows）。

**风险**

- 扫描脚本的候选结果不是结论。对策：`endpoints.md` 强制带人工确认列，被否决的必须写理由。
- Windows 与 Linux 两套脚本可能漂移。对策：CI 在 Ubuntu 上跑 `scan.sh` 并检查产物非空；本地另跑 `scan.ps1`，两者产物行数差异记入 `as-is.md` 的说明。
