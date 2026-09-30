# Proposal

## Why

第 01 境把 `open-api.zip` 逆向成了可回归的 0 号基线，但它有一个刺眼的事实：**这份基线从头到尾都是别人的名字**。

- Maven 坐标是 `com.qvsu:qvsu-openapi`，对外产品名叫「聚搭OpenAPI系统」，镜像/容器叫 `openapi-app`、`qvsu_open_api`；
- 配置前缀是 `qvsu:`，日志与数据源都按这个前缀读；
- 产物名是 `qvsu-openapi.jar`。

现在的处境是：**Demo 能跑，功能对得上，但名字不是你的**。这件事不能拖到后面做——第 03 境要定领域本体（类名、表名都要定下来），第 04 境要刻对外协议契约（品牌与 base_url 会出现在文档与 SDK 里），越晚改名代价越大。

但改名这件事有一个非常具体的失效模式：**报错驱动改名**。改一处、跑一次，漏一处、炸一处，前三个错误有效，到第五个错误就失控——因为你已经分不清「是我改坏的」还是「它本来就坏」。而且最危险的不是「改得太多」，是**改得太少**：改 95% 比改 0% 危险得多，半迁移状态在编译期不报错，在运行期静默失效。

所以本境的目标不是「改完」，而是**在不改变任何行为的前提下改完，并且能证明行为没变**。

> 来源：`docs/tutorials/hunter-gateway/chapters/02-cave-heaven/02-工程脱胎换骨-文章.md`

## What Changes

**一、标识改名（三级粒度，先扫清单再动手）**

| 级别 | 对象 | 做法 |
|---|---|---|
| 一级 | 完整包名 `com.qvsu` → `cloud.joysky.llmgateway` | 全仓批量（`git mv` 迁移目录 + 文本替换），安全 |
| 二级 | Maven 坐标、启动类名、配置前缀、任务类名 | 逐文件确认 |
| 三级 | 品牌文案、镜像名、容器名、脚本注释 | 人工过一遍清单 |

具体产物：
- Maven 坐标：`cloud.joysky:llm-gateway`，`<name>llm-gateway</name>`，产物 `target/llm-gateway.jar`；
- 根包 `cloud.joysky.llmgateway`，目录 `src/main/java/cloud/joysky/llmgateway`、`src/test/java/cloud/joysky/llmgateway`；
- 启动类 `LlmGatewayApplication`（原 `QvsuApplication`）、`LlmGatewayServletInitializer`（原 `QvsuServletInitializer`）；
- 配置类 `LlmGatewayConfig`（原 `QvsuConfig`）；定时任务类 `LlmGatewayTask`（原 `QvsuTask`，文件名一并改）；
- 配置前缀 `llmgateway:`（原 `qvsu:`）；
- 品牌名「轻量级 LLM 网关」（原「聚搭OpenAPI系统」），模板文案 42 处同步；
- 镜像/容器名 `llm-gateway`（原 `openapi-app` / `qvsu-open_api`）。

**二、配置前缀兼容期（一个月）**

- 新增 `common/config/LegacyPrefixCompat`：**新前缀优先**；只有旧前缀时把 `qvsu.*` 的值搬到有效配置，并在日志里打废弃警告（含生效键名）；两者都没有时不做任何事。
- 新增只读诊断端点 `GET /internal/compat/config-prefix`（标注 `@Anonymous`），返回 `legacyApplied / legacyKeys / newPrefixPresent / legacyPrefixPresent / effectiveName / effectiveVersion`，让验收脚本能断言，而不是靠读启动横幅。
- 新增 `src/main/resources/application-prefixcompat.yml`：只含 `qvsu:` 的样例配置，用于手工复现兼容路径。
- 新增可离线跑的单元测试 `LegacyPrefixCompatTest`（5 例）：只有旧前缀生效、新旧同时存在时新前缀优先、都没有时无副作用、未知键被忽略、状态可复位。

**三、保留旧标识的两处，登记为技术债**

| 保留项 | 原因 | 删除时间 |
|---|---|---|
| 模块目录名 `open-api/qvsu-openapi/` | 本境明确不拆模块、不改目录结构（改目录会连带动 CI、Docker build context、所有人的本地路径） | 第 03 境若确有必要再动 |
| 定时任务的 Bean 名 `qvsuTask` | `sys_job.invoke_target` 存的是「Bean 名.方法名」字符串（实测 19 行），改 Bean 名会让已存在的任务找不到目标；方法名已改为 `params`/`noParams`/`multipleParams` 并用 `open-api/sql/llmgateway_rename_upgrade.sql` 幂等更新数据库 | 兼容期一个月后 |
| `/qvsu.png`、`/qvsu/**` 资源前缀 | Shiro 放行规则与静态资源路径成对存在；只改一处会导致资源 404 或绕过鉴权（已登记为风险 R16） | 与品牌资源整理一并做 |

**四、回归尺子（本境的灵魂）**

- 新增 `baseline/`：在**换骨前的第 01 境基线上**采集的黄金快照（6 个接口行为 + 1 个请求样例）。
- 新增 `scripts/smoke.sh` / `scripts/smoke.ps1`：采集当前行为与基线逐项比对，差异即失败；`-Capture` 模式用于生成黄金快照。
- 新增 `scripts/check-rename.sh` / `check-rename.ps1`：残留扫描，命中旧包名、旧配置前缀、旧制品/镜像标识即非零退出。

**明确不做（Not Do）**

- **不拆模块、不改目录结构、不改接口路径。** 结构留到第 03 境。
- **不动任何方法体的逻辑。** 凡是要改方法体、拆接口、换序列化框架的，一律不属于本章。
- 不顺手修坏味道：Demo 原有的硬编码、日志不成体系、`OpenManageService` 的字符串拼 SQL 全部原样保留（它们已在第 01 境的缺口与风险清单里记账）。
- 不修 `application.yml` 与 `application-druid.yml` 里**注释**的乱码（基线既是 GBK 被按 UTF-8 解读的产物，原文已不可恢复）。本境重写注释为可读中文，但不改动任何配置项的名称、层级与取值。
- 不做 `/v1/*` 协议实现（第 04 境的事）。

## Capabilities

### New Capabilities

- `project-rebranding`：在不改变行为的前提下更换工程标识的能力——三级粒度的替换纪律、旧前缀兼容与废弃提示、残留扫描门禁、以基线快照为准的行为回归。
- `config-prefix-compat`：配置前缀迁移的兼容期语义——新前缀优先、旧前缀搬运与废弃警告、兼容状态的可观测与可复位。

### Modified Capabilities

无。第 01 境建立的是 `reverse-baseline`（逆向能力），本境不修改它的任何要求，只**消费**它的产物（`baseline.md` 与 `reuse-matrix.md`）。

## Impact

**改动范围（305 个文件）**

| 位置 | 影响 |
|------|------|
| `open-api/qvsu-openapi/src/main/java/**` | 267 个 Java 文件的 `package`/`import` 与类名引用 |
| `open-api/qvsu-openapi/src/test/java/**` | 4 个集成测试的包与 import |
| `open-api/qvsu-openapi/src/main/resources/**` | `application.yml` 前缀与注释、2 个 mapper XML 的 namespace、`logback.xml` 的 logger 名、`banner.txt` 的占位符、5 个模板的品牌文案、新增 2 个 yml |
| `open-api/qvsu-openapi/pom.xml` | 坐标、名称、描述、MySQL 驱动依赖、`mysql.connector.version` |
| `open-api/deploy/**` | 2 个 Dockerfile、2 个 compose、`reinit.sh`/`reinit.bat`、docker-local 配置 |
| `open-api/sql/**` | 新增幂等升级脚本 `llmgateway_rename_upgrade.sql` |
| `.env.example` | 新增（变量前缀统一为 `LLMGATEWAY_*`） |
| `scripts/**` | 新增 4 个脚本 |
| `baseline/**` | 新增黄金快照 |
| `pages/architecture.html` | 1 处包名（并标注新旧对应） |

**新增运行期配置**

- `LLMGATEWAY_DB_URL` / `LLMGATEWAY_DB_USER` / `LLMGATEWAY_DB_PASSWORD`（`application-local.yml`、`application-mysql.yml` 引用）
- `SPRING_PROFILES_ACTIVE=local|mysql|druid`
- `SHIRO_CIPHER_KEY`、`DRUID_LOGIN_USERNAME` / `DRUID_LOGIN_PASSWORD`（`.env.example` 列出，尚未接线）

**新增依赖**

- `com.mysql:mysql-connector-j`（`application-mysql.yml` 需要；之前只有 PostgreSQL 驱动，切 mysql profile 会起不来）

**风险**

- 兼容期分支多留一个月，旧前缀必须删（已进技术债清单）。
- `verifySignature` 等热路径的代码只改了包名，没有动逻辑；但**凡是字符串形式的引用**（MyBatis namespace、logger 名、banner 占位符、Shiro 放行路径、`sys_job.invoke_target`）编译器都不管，必须靠脚本扫 + 运行期验证。本境三类翻车点（`spring.factories`、MyBatis namespace、yml 前缀）逐一验证：前者本工程不存在，后两者已实测通过。
