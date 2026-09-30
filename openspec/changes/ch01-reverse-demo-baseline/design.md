# Design

## Context

只补充三条**现状事实**（Why 见 `proposal.md`）：

1. **工程现状不是空白**：`open-api/qvsu-openapi` 是一个可编译可运行的 Spring Boot 2.7.18 单体（265 个 Java 文件、144 个模板、34 张表）。它已经有分层、有鉴权、有代理转发、有调用日志——**缺的是模型语义，不是骨架**。
2. **唯一可用的对外入口是 `/open/**`**：`OpenApiFilter` 只对 `/open/` 前缀生效（`OpenApiFilter.java:44`），其余路径全部被 Shiro 登录态挡住。本境实测已确认：`/v1/models` 与 `/nosuchpath123` 的表现完全相同（都 302 → `/login`），因此「302」不能被当成「路由存在只是要登录」。
3. **数据结构已经存在双重形态**：`open_api`/`open_app`/`open_call_log` 等表同时有 `create_time/update_time` 与 `s_status/s_is_del/s_created_time/s_updated_time` 两套列；`.sql` 里没有外键、没有视图、没有存储过程。后续任何 schema 演进都要先接受这个既成事实。

## Goals / Non-Goals

**Goals**

- 一条命令冻结基线指纹；一套脚本产出机器清单；两张表（复用矩阵、缺口风险）回答「哪些能用、缺什么」。
- 所有结论**可复核**：每条判定带 `文件:行号`，每个缺口带建议章节，每条风险带触发条件。
- 基线**真实可跑**：编译、启动、接口、页面四类证据都要有真实输出，不是「预期结果」。
- 双平台可重跑（Linux bash / Windows PowerShell），因为本仓库的开发环境与 CI 环境不同。

**Non-Goals（设计层边界）**

- 不引入任何新的运行时依赖（脚本只用 `bash`/`unzip`/`grep`/`find`/`mvn` 与 PowerShell 内置能力）。
- 不把逆向产物做成「文档站」。本境只交 Markdown，不建站点、不上 Pages。
- 不改 `open-api.zip` 与 `open-api/**`：包括**不改文件名**。任何改名都留到第 02 境，因为改名会立刻摧毁「原样能跑通」这条参照线。
- 不做代码度量（圈复杂度/覆盖率）：本境回答的是边界与复用，不是质量评分。

## Decisions

### D1：脚本进 `scripts/`，产物进 `docs/reverse/scan-output/`，而不是文章里的 `docs/reverse/`

**决定**：`scripts/reverse/scan.sh` 与 `scripts/reverse/scan.ps1` 是可执行脚本；机器产物落 `docs/reverse/scan-output/`；人工结论落 `docs/reverse/*.md`。

**为什么不用文章原路径**（`docs/reverse/scan.sh` + 产物直接落 `docs/reverse/`）：机器输出与人工结论混在同一个目录，第 03 境开始就会出现「这张表是脚本生成还是人写的」的歧义。分开之后，`scan-output/` 可以整体重跑覆盖，人工文档必须人工改——这个物理隔离就是纪律。

**被否方案**：把扫描做成 Maven 插件或 Java 程序。否掉的理由是逆向阶段不能依赖被逆向工程的构建体系——一旦 `pom.xml` 出问题，扫描也一起死。

### D2：扫描脚本写两套（bash + PowerShell），而不是写一套然后在 Windows 上想办法

**决定**：`scan.sh` 给 CI/Linux，`scan.ps1` 给本机开发。

**实测理由**：本机是 Windows PowerShell 5.1，且装有 WSL/`unzip` 之外的路径都不确定；而 CI 是 Ubuntu。只写 bash 会导致本机无法重跑，只写 PowerShell 会导致 CI 无法验证。两套脚本的产物集合被固定为 7 个文件，用同一份「产物完整性校验」逻辑保证可比。

**代价与缓解**：两套实现会漂移。缓解是 (a) 产物文件名与含义写死在规格里；(b) 两者都在末尾做同样的非空校验；(c) 本境把两侧产物差异记入 `baseline.md` 第 7 节。

**踩到的真实坑（记录，供后续脚本复用）**：Windows PowerShell 5.1 读取**无 BOM** 的 UTF-8 `.ps1` 会按 ANSI(GBK) 解码，中文注释被拆成半字符后整个脚本语法错误。**本仓库所有 `.ps1` 必须带 UTF-8 BOM**。

**另一个真实坑**：本机存在 `HTTP_PROXY=http://127.0.0.1:15236`。探活脚本若不显式把 `Proxy` 置空，所有本机请求都会被送进代理，`curl` 会一律返回 503、`HttpWebRequest` 会挂住。探活脚本必须绕过代理——这直接决定了本境验收证据的真伪。

### D3：`open-api.zip` 保持仓库根不动，不重新打包、不解压进版本库的第二份

**决定**：仓库里只有一份 `open-api.zip` 与一份已解压的 `open-api/`，二者都不动；`.reverse-work*/` 进 `.gitignore`。

**为什么不在改动过程中重新打 zip**：zip 的哈希是 0 号基线的锚点，一旦重新打包，锚点失效，后面所有「回滚到基线对比」都失去参照。

**被否方案**：把 `open-api/` 删掉，让每个人自己解压。否掉的理由是 CI 需要在不解压的情况下就能编译——多一步解压就多一个失败点。

### D4：接口清单是「候选 + 人工确认」两段，不是一段

**决定**：`scan-output/endpoints.raw.txt` 永远是机器候选；`docs/reverse/endpoints.md` 是人工确认表，三态（确认/否决/待验证），否决必须写一句理由。

**理由（实测证据）**：245 条候选里混着 `src/test/java` 下 4 个集成测试类的映射、被注释掉的映射、以及只在特定 profile 生效的映射。把原始输出当接口清单，等于把噪音当事实。

**代价**：245 条逐条确认是这次最耗人力的动作。缓解是把「测试类一律否决」做成一条规则，一次砍掉大块噪音。

### D5：缺口与风险分文件、分表头

**决定**：两张表结构不同——缺口是「能力域 / 缺口 / 证据 / 严重度 / 建议章节」，风险是「严重度 / 风险 / 触发条件 / 后果 / 缓解」。

**为什么必须分**：混在一起的直接后果是优先级失真。本境实例：「没有 `/v1` 入口」是必须排期的缺口，「数据源连不上会启动失败」是必须盯的风险——前者要写代码，后者要配环境。同一张表里两个都叫「问题」，看表的人就会去写代码解决环境问题。

**被否方案**：统一成一张「问题清单」加 `type` 列。否掉的理由是列语义会被拉扯到最宽，最后没有一列能填得具体。

### D6：基线的验收标准是「行为不变」，用真实往返而不是「能启动」

**决定**：本境的验证由三段真实证据构成：(1) 11 条路径的 HTTP 状态码探测；(2) 一条完整的签名请求 → 代理转发 → 统一响应包裹的往返；(3) 三条鉴权失败路径的错误码。

**为什么不满足于「启动成功」**：能启动不等于链路通。只有走完一次带签名的真实往返，才能证明 `OpenApiFilter` 的鉴权、`OpenApiProxyService` 的转发、`OpenResult` 的包裹三段都在工作——而这正是后续章节要改造的三段。

**代价**：需要两个实例（网关 18080 + 上游回显 5656）和一个 PostgreSQL。这是本境最大的环境成本，但换来的是后续每一境都能用同一条命令复现。

## Risks / Trade-offs

| 风险 | 缓解 |
|---|---|
| 扫描脚本把人工结论覆盖掉 | 机器产物与人写文档物理分离（D1） |
| 两套脚本漂移 | 产物文件名固定 + 双端非空校验 + 差异记入 `baseline.md` |
| 245 条候选确认耗时 | 「测试类一律否决」规则批量砍噪音；剩余逐条 read 核实注解 |
| 逆向结论变成「一次性文档」 | 复用矩阵带证据列，第 03 境起每章都要回查这张表 |
| 本机代理导致证据失真 | 探活脚本显式绕过代理，并在 `baseline.md` 里记录这个坑 |

## Migration Plan

1. 建立隔离目录与 `.gitignore`（`.reverse-work/`、`.reverse-work2/`）。
2. 跑扫描（两套脚本各一次），对比产物。
3. 起 PostgreSQL 11 + 两个应用实例，采三段证据。
4. 写人工文档：`as-is.md`、`endpoints.md`、`reuse-matrix.md`、`gaps-and-risks.md`、`baseline.md`。
5. 冻结：分支 `chapter/01-reverse-demo-baseline`，提交 `docs(ch01): reverse engineer open-api demo baseline`。

**回滚策略**：本境不产生代码变更，回滚 = 删除新增的 `docs/reverse/**`、`scripts/reverse/**` 与 `openspec/changes/ch01-*`，`open-api/` 与 `open-api.zip` 始终未被触碰。

**兼容性**：无运行时影响，不影响任何既有构建与启动路径。

## Open Questions

（不影响规格、实现与任务拆分，实现阶段直接定即可）

- `endpoints.raw.txt` 的 245 条里，`docs/reverse/endpoints.md` 的「待验证」条目是否需要在第 02 境回归时清零？——按第 02 境「残留扫描为空」的口径，建议清零。
- 是否要把 `open-api/sql/*.sql` 与 `deploy/**/init/*.sql` 做一次差异比对（MySQL 与 PostgreSQL 两套 DDL 是否等价）？——第 13 境引入 Flyway 时顺便做，本境不做。
