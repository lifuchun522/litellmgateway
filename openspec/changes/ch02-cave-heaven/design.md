# Design

## Context

三条现状事实（Why 见 `proposal.md`）：

1. **工程是单模块**（`packaging=jar`，无父 POM），根包 `com.qvsu`，265 个 Java 文件里有 267 处 `package`/`import` 引用它。没有多模块依赖需要同步，这是换骨成本低的前提。
2. **字符串引用有四处落在编译器视野之外**：`src/main/resources/mapper/**/*Mapper.xml` 的 `namespace`、`logback.xml` 的 `<logger name="com.qvsu">`、`banner.txt` 的 `${qvsu.version}` 占位符、以及 **数据库 `sys_job.invoke_target` 里存的 `qvsuTask.qvsuNoParams`**（实测 19 行）。前三处靠扫描 + 运行期验证，第四处必须靠数据库升级语句。
3. **第 01 境已经冻结了可运行基线**，并且确认工程只有 `/open/**` 一个免登录入口，`/v1/*` 不存在。因此本境的回归尺子只能建立在这 6 个真实行为上（`/`、`/index`、`/login`、`/v1/models`、`/v1/chat/completions`、`/open/`、一个必然不存在的路径），而不是文章示例里的 `/v1/models` 响应体。

## Goals / Non-Goals

**Goals**

- 标识换成自己的，且**行为零差异**——而且是机械判定的零差异，不是人眼比对。
- 任何一个字符串引用漏改，都能被脚本或运行期证据抓到。
- 兼容期结束时有明确的删除清单，不留「临时兼容」变成永久债。

**Non-Goals（设计层边界）**

- 不拆模块、不改目录结构。`open-api/qvsu-openapi/` 这个名字留着——改它会连带动 CI 的 `working-directory`、Docker 的 build context、所有人的本地路径，收益远小于风险。
- 不动方法体。哪怕是明显的坏味道（`OpenManageService` 拼 SQL）也不动，它们已在第 01 境记账。
- 不新增业务能力。`/internal/compat/config-prefix` 是换骨期临时件，不是第一个网关接口。
- 不修注释乱码的**原文**（基线里注释已是 GBK 被按 UTF-8 解读的产物，原文不可恢复）。重写为可读中文，但不动任何配置键与取值。

## Decisions

### D1：用 `git mv` 迁目录 + 分级文本替换，而不是 IDE 重构

**决定**：`git mv` 迁移 `src/main/java/com/qvsu` → `src/main/java/cloud/joysky/llmgateway`（保留重命名历史），再用脚本按「一级 / 二级 / 三级」三档替换文本。

**为什么不用 IDE 的 Rename Package**：IDE 重命名覆盖代码，**不覆盖** mapper XML 的 namespace、logback 的 logger 名、banner 占位符、Docker 与脚本里的字符串。这些恰恰是翻车点。而脚本替换可以一次跑完并留痕，且可重复。

**被否方案**：改一处跑一次（报错驱动）。否掉的理由是它在前三个错误上有效，到第五个错误就失控，且无法证明「改完了」。

### D2：回归尺子用「归一化的行为快照」，而不是响应正文

**决定**：`baseline/*.json` 存的是 `{name, method, path, httpStatus, location, contentType}`，不是响应正文。比对脚本按这个结构逐项 diff。

**为什么不用响应正文**：`/login` 的 HTML 里含每次请求都变的 CSRF token 与会话 id，直接 diff 必然假阳性；而假阳性会训练人忽略这个门禁，比没有门禁更糟。归一化到「状态码 + 跳转目标 + 内容类型」后，diff 是确定性的，且**足以证明换骨没改变路由与鉴权行为**——这正是本境要守的那条线。

**代价与缓解**：这会把「响应体内部字段变化」漏掉。缓解是：本境本来就不改任何方法体，响应体在结构上不可能变；真正需要逐字段比对的响应对齐留到第 04 境（协议契约）用专门的契约测试做。

### D3：兼容期用「配置类内部接管」，而不是双前缀绑定

**决定**：`LlmGatewayConfig` 只绑新前缀；新增 `LegacyPrefixCompat` 在容器初始化早期读 `Environment`，按三条规则判定（只在旧前缀 → 搬运 + 警告；新前缀存在 → 记录可删；都没有 → 无副作用）。

**为什么不做双前缀绑定**：让一个配置类同时接受两个前缀，需要两套 setter 或一个自定义 `Binder`，会让「新前缀优先」这条规则散落在字段级别。集中在一个类里，规则只有一处，测试也只需断言一处。

**踩到的坑（记录）**：第一版用 `Binder.bind(prefix, Bindable.mapOf(String.class, String.class))` 读旧前缀，**绑不出来**——旧前缀是一组扁平标量键（`qvsu.name`），Binder 到 `Map` 只吃带层级的映射结构。实测 `values` 为空，于是兼容代码静默不生效。改成逐键 `env.getProperty()` 后正常。这正是「静默失效」的典型：不报错、不告警，只是没起作用。

### D4：兼容状态用「只读诊断端点」暴露，而不是靠启动横幅

**决定**：新增 `GET /internal/compat/config-prefix` 返回兼容状态；验收脚本断言它，不解析启动横幅。

**为什么不信横幅**：本境实测踩到两次误判——横幅上的 `${llmgateway.version}` 在配置未解析时会**原样打印占位符**，而旧前缀测试里它又恰好显示了旧值，导致「看起来生效了」。横幅是给人看的，不是给断言用的。

**代价**：多一个免登录端点。缓解：只读、不含密钥，且与兼容逻辑一起在兼容期结束时删除。

### D5：`/qvsu.png`、`/qvsu/**`、模块目录名、`qvsuTask` Bean 名**有意保留**

**决定**：这四处不改，并在残留扫描的排除清单与 `reuse-matrix` / `gaps-and-risks` 里写明原因。

| 保留项 | 不改的理由 | 删除时机 |
|---|---|---|
| `open-api/qvsu-openapi/` 模块目录 | 改目录会连带动 CI 与 Docker build context | 第 03 境若确有必要 |
| `qvsuTask` Bean 名 | `sys_job.invoke_target` 里存的是字符串（实测 19 行），改 Bean 名会让已存在的任务找不到目标 | 兼容期结束（方法名已改为新值，数据库已提供幂等升级脚本） |
| `/qvsu.png`、`/qvsu/**` 资源前缀 | Shiro 放行规则与 `ResourcesConfig` 的资源前缀常量成对存在，只改一处会导致资源 404 或绕过鉴权（已登记为风险 R16） | 与品牌资源整理一并做 |
| 历史 SQL 文件名 `open-api/sql/open_api*.sql` | 已有环境的初始化记录以文件名定位 | 不删 |

**被否方案**：把四处一起改干净。否掉的理由是本境的验收标准是「行为零差异」，而这四处里有两处（目录名、资源前缀）**一旦改就会改变行为或部署路径**，属于第 03 境的范围。

### D6：`mvn test` 的离线口径在本境首次建立

**决定**：新增的 `LegacyPrefixCompatTest` 不启动 Spring 上下文、不连数据库，只对 `LegacyPrefixCompat.resolve(Environment)` 做断言；用 `MockEnvironment` 构造输入。

**为什么**：第 01 境的 4 个集成测试都要连 5433 端口的 PostgreSQL，CI 里只能 `continue-on-error`。换骨新写的逻辑如果也依赖数据库，那「兼容通过」就只能靠人在本机点一下。这个测试把兼容判定与 Spring 生命周期解耦，于是它能在 CI 里真跑。

**代价**：不覆盖「Spring 真的把新前缀绑进去了」这件事。缓解：那条用运行期诊断端点验证（D4）。

## Risks / Trade-offs

| 风险 | 缓解 |
|---|---|
| 字符串引用漏改且静默失效 | 四条字符串引用逐一有对应验证：mapper namespace → 页面可用；logger 名 → debug 日志可见；banner → 版本号解析；`sys_job` → 幂等升级脚本 |
| 半迁移状态（改 95%） | 残留扫描门禁 + 编译 + 回归三件套，任一不过即不提交 |
| 兼容期拖成永久 | 技术债清单写死删除时间与删除项，兼容代码集中在一个类里且带 `TEMP` 标注 |
| 归一化快照掩盖响应体变化 | 本境不改方法体；逐字段契约比对交给第 04 境 |
| 本机 HTTP 代理导致探活失真 | 回归脚本显式 `Proxy = $null`（第 01 境踩过：不绕过代理时全部请求返回 503） |
| `.ps1` 在 PowerShell 5.1 下按 ANSI 解码报语法错 | 本仓库所有 `.ps1` 带 UTF-8 BOM（第 01 境踩过） |

## Migration Plan

1. 从 `chapter/01-reverse-demo-baseline` 拉分支 `chapter/02-cave-heaven`。
2. 在**换骨前**的基线上采黄金快照（用 ch01 的 worktree 起一个实例，`smoke.ps1 -Capture`）。
3. `git mv` 迁移目录 + 一级替换（包名）→ 二级替换（坐标、类名、前缀）→ 三级替换（品牌、镜像、脚本）。
4. 补兼容层与诊断端点，写离线单测。
5. 编译 → 起服务 → 跑残留扫描（必须 0）→ 跑回归（必须 6/6 一致）→ 验证品牌与新前缀。
6. 提交 `chore: rebrand demo baseline to llm-gateway`，推送并开 PR。

**回滚策略**：本境只改标识，回滚 = `git checkout chapter/01-reverse-demo-baseline`；`open-api.zip` 与 `docs/reverse/**` 全程未动，基线锚点仍然有效。

**兼容性**：旧配置前缀可继续使用一个月（打废弃警告）；旧 Bean 名保持不变，已存在的定时任务不需要先改库。

## Open Questions

（不影响规格、实现与任务拆分）

- `spring.factories` 是文章点名的三个翻车点之一，本工程**不存在**该文件（检索为空）。这条差异记入验收记录。
- MySQL profile 从未在本机跑通（本机只有 PostgreSQL）。本境只保证「切 profile 时驱动存在且配置完整」，真实连接验证留给需要它的那一境。
- `/qvsu.png` 这个文件名是否值得改成品牌名？——它与 Shiro 放行规则、`ResourcesConfig` 前缀常量三处联动，属于第 03 境的整理范围。
