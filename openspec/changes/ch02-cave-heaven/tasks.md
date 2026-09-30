# Tasks

> 每条任务都带「验证：」——没有验证行的任务不算完成。
> 本境的灵魂是第 6 节：**行为零差异必须由脚本判定，不由人眼判定**。

## 0. 准备

- [x] 0.1 从 `chapter/01-reverse-demo-baseline` 拉出 `chapter/02-cave-heaven`；
      验证：`git status` 显示当前分支正确且工作区干净
- [x] 0.2 用第 01 境的基线建一个独立 worktree，在其中起一个实例采黄金快照；
      验证：`.smoke-out/` 生成 6 个行为快照，且与运行时探测结果一致

## 1. 一级替换：完整包名

- [x] 1.1 `git mv` 迁移 `src/main/java/com/qvsu` → `src/main/java/cloud/joysky/llmgateway`；
      验证：`git status` 显示 `RM`（重命名+修改）而不是 `D`+`A`（删除+新增），重命名历史保留
- [x] 1.2 迁移 `src/test/java/com/qvsu` → `src/test/java/cloud/joysky/llmgateway`；
      验证：同上
- [x] 1.3 全仓文本替换 `com.qvsu` → `cloud.joysky.llmgateway`（`.java`/`.xml`/`.yml`/`.properties`/`.html`/`.js`）；
      验证：替换脚本报告命中文件数（实测 290 个），且模块 `src` 与 `resources` 内旧包名残留为 0

## 2. 二级替换：坐标、类名、前缀

- [x] 2.1 Maven 坐标 `cloud.joysky:llm-gateway`，`<name>llm-gateway</name>`，描述改为中文；
      验证：`mvn -B -ntp package -DskipTests` 产出 `target/llm-gateway.jar`
- [x] 2.2 启动类改名 `QvsuApplication` → `LlmGatewayApplication`、`QvsuServletInitializer` → `LlmGatewayServletInitializer`；
      验证：启动日志出现 `Started LlmGatewayApplication`
- [x] 2.3 配置类改名 `QvsuConfig` → `LlmGatewayConfig`，并新增 `applyLegacy` 与 `resetForTest`；
      验证：编译通过，且无残留 `QvsuConfig` 引用
- [x] 2.4 任务类改名 `QvsuTask` → `LlmGatewayTask`，**同时** `git mv` 文件名（避免「文件名与类名不一致」）；
      验证：`git status` 显示重命名；旧文件不再存在
- [x] 2.5 配置前缀 `qvsu:` → `llmgateway:`，并把基线里乱码的注释重写为可读中文；
      验证：新实例诊断端点返回 `newPrefixPresent=true`、`legacyPrefixPresent=false`
- [x] 2.6 `banner.txt` 占位符 `${qvsu.version}` → `${llmgateway.version}`；
      验证：新实例横幅版本号为 `1.0.0`（旧前缀实例下为未解析的占位符，属预期）
- [x] 2.7 `logback.xml` 的 logger 名、2 个 mapper XML 的 namespace 随一级替换更新；
      验证：应用 debug 日志按配置输出；任一 Mapper 页面可用（无「绑定语句未找到」）

## 3. 兼容期实现

- [x] 3.1 新增 `LegacyPrefixCompat`：只在旧前缀 → 搬运+警告；新前缀存在 → 只记录可删；都没有 → 无副作用；
      验证：`resolve(Environment)` 的三条分支各有一个单测断言
- [x] 3.2 逐键读取而非 `Binder.bind(mapOf)`（扁平键绑不出来，第一版实测静默失效）；
      验证：单测断言旧前缀的值真的被搬到 `LlmGatewayConfig`
- [x] 3.3 新增只读诊断端点 `GET /internal/compat/config-prefix`（`@Anonymous`），暴露兼容状态；
      验证：请求返回 `{legacyApplied, legacyKeys, newPrefixPresent, legacyPrefixPresent, effectiveName, effectiveVersion}`
- [x] 3.4 新增单测 `LegacyPrefixCompatTest`（5 例，离线、不连库、不启 Spring 上下文）；
      验证：`mvn -B -ntp test -Dtest=LegacyPrefixCompatTest` → Tests run: 5, Failures: 0, Errors: 0
- [x] 3.5 静态状态污染问题：`LlmGatewayConfig` 与 `LegacyPrefixCompat` 的静态字段提供复位入口，`@BeforeEach` 复位；
      验证：连续跑 5 个用例不互相影响（实测 5/5 通过）
- [x] 3.6 新增 `application-prefixcompat.yml` 样例（只含旧前缀）；
      验证：用它启动应用能正常起来，且诊断端点显示兼容生效

## 4. 三级替换：品牌、镜像、脚本

- [x] 4.1 5 个模板的品牌文案替换（42 处）：`聚搭OpenAPI系统` → `轻量级 LLM 网关`，`[ 聚搭 ]` → `[ LLM ]`；
      验证：`/login` 页面标题为「登录轻量级 LLM 网关」，且页面内容不含旧品牌串
- [x] 4.2 两个 Dockerfile 的产物名与基础镜像（顺带修掉第 01 境登记的 R2：原 `apt-get` 源已下线）；
      验证：`grep` 部署目录不再出现旧产物名与旧镜像名
- [x] 4.3 compose 的 service 名、镜像名、容器名改为新口径；
      验证：`grep` 无残留
- [x] 4.4 `reinit.sh` / `reinit.bat` 的容器名同步；
      验证：`grep` 无残留
- [x] 4.5 新增 `.env.example`（`LLMGATEWAY_*` 变量 + 两个 profile 说明）；
      验证：文件存在且列出 3 个数据源变量、`SPRING_PROFILES_ACTIVE`、Shiro 与 Druid 变量
- [x] 4.6 `pages/architecture.html` 的包名同步，并标注新旧对应关系；
      验证：全仓（除历史证据目录）检索旧包名为空

## 5. 保留项与技术债

- [x] 5.1 模块目录名 `open-api/qvsu-openapi/` 有意保留；
      验证：残留扫描的输出里显式说明这一条
- [x] 5.2 Bean 名 `qvsuTask` 有意保留，方法名改为 `params`/`noParams`/`multipleParams`，并新增幂等数据库升级语句 `open-api/sql/llmgateway_rename_upgrade.sql`；
      验证：升级语句可重复执行，且覆盖 `sys_job` 里 3 种旧调用目标写法
- [x] 5.3 `/qvsu.png`、`/qvsu/**` 资源前缀有意保留（与 `ResourcesConfig` 成对）；
      验证：已登记为风险 R16
- [x] 5.4 兼容期删除清单写入 `proposal.md` 的「What Changes」技术债表；
      验证：表格含 3 行，每行有原因与删除时机

## 6. 回归尺子（本境的灵魂）

- [x] 6.1 `baseline/` 黄金快照（6 个行为 + 1 个请求样例）随仓库版本化；
      验证：目录内有 7 个文件，快照内容为归一化行为而非响应正文
- [x] 6.2 `scripts/smoke.sh` 与 `scripts/smoke.ps1`：采集 + 比对 + `-Capture` 生成；
      验证：两侧脚本都能在 Linux/Windows 上跑
- [x] 6.3 回归脚本排除请求样例（第一版把它当行为快照，产生假差异）；
      验证：重跑后输出中不再出现「基线有 chat-req.json，当前采集缺失」
- [x] 6.4 回归脚本显式绕过 HTTP 代理；
      验证：本机设着 `HTTP_PROXY` 时仍能正确探测本机端口
- [x] 6.5 **换骨后跑回归：6/6 一致**；
      验证：`& .\scripts\smoke.ps1` → 输出「换骨回归通过：接口行为与基线一致」，退出码 0
- [x] 6.6 `scripts/check-rename.sh` 与 `check-rename.ps1`：残留扫描；
      验证：当前仓库扫描通过（三段全部「无残留」，退出码 0）；人为引入一处旧包名则失败

## 7. 验收与文档

- [x] 7.1 编译 + 打包通过；
      验证：`mvn -B -ntp package -DskipTests` → BUILD SUCCESS
- [x] 7.2 新前缀实例启动并验证品牌与新前缀；
      验证：`{"effectiveName":"轻量级 LLM 网关","newPrefixPresent":true,"legacyPrefixPresent":false}`
- [x] 7.3 旧前缀实例启动并验证兼容生效；
      验证：`application-prefixcompat.yml` 场景下应用正常启动
- [x] 7.4 写 `docs/design/ch02-工程脱胎换骨.md`；
      验证：文档含三级替换清单、四处字符串引用的验证方式、保留项与技术债、与文章的差异
- [x] 7.5 本变更四件套齐全且通过校验；
      验证：`openspec validate ch02-cave-heaven --strict` 无错误

## 8. 提交与推送

- [ ] 8.1 提交 `chore: rebrand demo baseline to llm-gateway`；
      验证：`git log --oneline -1` 输出该提交信息
- [ ] 8.2 推送分支并开 PR 到 `main`；
      验证：`gh pr view` 能打开且 CI 绿
- [ ] 8.3 CI 增加换骨残留扫描与回归门禁；
      验证：PR 上出现对应步骤，且人为引入残留时该步骤失败
