# 基线冻结记录（第 01 境）

> 本章唯一目标是「可回归」。本文件把基线冻结成三件可验证的事实：**压缩包哈希**、**可运行命令**、**一次真实的运行验证**。
> 后续任何一境怀疑「是不是我改坏了」，都必须能仅凭本文件回到起点。

---

## 1. 压缩包指纹

| 项 | 值 |
|---|---|
| 文件 | `open-api.zip`（仓库根） |
| 大小 | 3,840,532 字节 |
| SHA256 | `A798558197D898011BBBF4AF2A0CA5F84CBFA5480099EE4D3A8E3FBE7F7BBE05` |
| zip 条目数 | 894 |
| 解压后项目根（相对仓库） | `open-api/qvsu-openapi` |
| 冻结时间 | 2026-09-29 |

机器产物：`docs/reverse/scan-output/zip.sha256`、`docs/reverse/scan-output/root.txt`。

> 对比素材原文：文章示例哈希是 `9f2c...`（占位），本仓库实测哈希为上表值。**以本表为准**，它就是 0 号基线的锚点。

---

## 2. 运行前置条件

| 依赖 | 本仓库实测值 | 必需性 | 端口/路径 |
|---|---|---|---|
| JDK | Temurin 11.0.29 | 必需 | — |
| Maven | 3.9.11 | 必需 | — |
| PostgreSQL | 11（`postgres:11-alpine` 容器） | **必需**，缺则启动失败 | 5432 |
| 数据库 | `jd_openapi`，用户 `postgres`，口令 `123456`（`application-druid.yml` 默认） | 必需 | — |
| 初始化 SQL | `open-api/deploy/local-docker/postgres/init/*.sql`（7 个文件，按文件名顺序） | 必需（空库场景） | — |

`assets.txt` 里另有 MySQL 一套初始化脚本（`deploy/local-docker/mysql/init/`）与独立 SQL 目录（`open-api/sql/`），但**工程默认驱动是 PostgreSQL**（`driverClassName: org.postgresql.Driver`），MySQL 脚本是备用路径。

---

## 3. 已验证的命令（逐条实测）

### 3.1 逆向扫描（只读，不改任何源码）

```powershell
# Windows
& .\scripts\reverse\scan.ps1
# Linux / CI
./scripts/reverse/scan.sh
```

实测输出：

```text
== scan done ==
zip.sha256    : A798558197D898011BBBF4AF2A0CA5F84CBFA5480099EE4D3A8E3FBE7F7BBE05
root          : open-api/qvsu-openapi
java files    : 265
templates     : 144
endpoint cands: 245
assets        : 29
```

### 3.2 编译与打包

```bash
cd open-api/qvsu-openapi
mvn -B -ntp clean compile        # BUILD SUCCESS，265 个源文件
mvn -B -ntp package -DskipTests  # 产出 target/qvsu-openapi.jar
```

### 3.3 启动（两个实例，端口显式指定）

```bash
# 网关实例
java -jar target/qvsu-openapi.jar --server.port=18080
# 上游回显实例（open_api 表里 selftest 的 target_url 指向 5656）
java -jar target/qvsu-openapi.jar --server.port=5656
```

启动成功标志（真实日志）：

```text
Started QvsuApplication in 15.504 seconds (JVM running for 16.523)
The following 1 profile is active: "druid"
Spring Boot Version: 2.7.18
```

---

## 4. 真实运行验证（HTTP 状态码 + 响应原文）

探测方式：`HttpWebRequest` 且显式 `Proxy = $null`（本机存在 `HTTP_PROXY=http://127.0.0.1:15236`，不绕过会把本机请求也送进代理，导致全部误判为 503）。

| # | 方法 | 路径 | 状态码 | 说明 |
|---|---|---|---|---|
| 1 | GET | `/` | 302 → `/login` | 未登录跳转 |
| 2 | GET | `/login` | 200 `text/html` | 登录页可打开 |
| 3 | GET | `/index` | 302 → `/login` | 管理首页需登录 |
| 4 | GET | `/captchaImage` | 302 → `/login` | 验证码同样受保护 |
| 5 | GET | `/system/config/list` | 302 → `/login` | 管理面接口需登录 |
| 6 | GET | `/open/` | 200 `application/json` | **网关入口存在**（Shiro 放行） |
| 7 | GET | `/v1/chat/completions` | 302 → `/login` | 见下方「重要判读」 |
| 8 | GET | `/v1/models` | 302 → `/login` | 同上 |
| 9 | GET | `/actuator/health` | 302 → `/login` | 工程未引入 actuator |
| 10 | GET | `/nosuchpath123` | 302 → `/login` | 兜底也走登录 |

**重要判读（这是本章最有价值的一条）**：第 7、8 条返回的 302 **不能**被当成「协议入口存在、只是要登录」。判据有两条：

1. 静态判据：在 `src/main/java` 全量检索 `/v1`、`chat/completions`、`models`、`embeddings`，**零命中**（见 `docs/reverse/endpoints.md` 第一节）。
2. 动态判据：第 10 条 `/nosuchpath123`（一个绝对不存在的路径）返回完全相同的 302；说明 302 是 Shiro 的「未登录」兜底，而不是「路由命中」。

结论与素材原文 06、排查第三条诊断链一致：**这份 Demo 是一个管理端应用，不是协议网关**。协议入口完全缺失，登记为最高优先级缺口，交给第 04 境。

### 4.1 传统网关链路真实往返（可复制的证据）

签名算法（读 `OpenApiSecurityService.java:121-145` 得到，非猜测）：
`signMap = {appKey, timestamp, nonce} ∪ 业务参数`，剔除空值，按 key 字典序拼成 `k1=v1&k2=v2`，尾部追加 `&appSecret=<secret>`，再取 `HmacSHA256(plain, appSecret)` 的**小写 hex**。

请求：

```text
GET http://127.0.0.1:18080/open/selftest/httpbin/get?demo=1&category=get
X-App-Key: ak_selftest_demo
X-Timestamp: 1790737545817
X-Nonce: 5dc47ffb5d6a4de98f75d25499d357e3
X-Sign: bab33b837d41f512360b120c5f160ed8383ccb205d660c1fe03a4c6952357f6c
签名原文: appKey=ak_selftest_demo&category=get&demo=1&nonce=5dc47ffb5d6a4de98f75d25499d357e3&timestamp=1790737545817&appSecret=sk_selftest_demo_1234567890abcdef
```

响应（HTTP 200）：

```json
{"code":0,"msg":"success","data":{"args":{"category":"get","demo":"1"}},"traceId":"7442b70d-1d86-45ee-ab3b-3f9a9e3fd1e9"}
```

这条证据同时证明了四件事：`/open/**` 被 Shiro 放行、`OpenApiFilter` 完成签名鉴权、`OpenApiProxyService` 把请求转发到 `target_url`（5656 实例的回显接口）、响应被 `OpenResult` 统一包裹并带 `traceId`。

### 4.2 鉴权失败路径（错误码逐条实测）

| 场景 | 请求 | 响应（HTTP 均为 200） |
|---|---|---|
| 缺认证头 | `GET /open/selftest/httpbin/get`（无任何头） | `{"code":40001,"msg":"missing auth headers","traceId":"97cad27f-..."}` |
| 签名错误 | 同样的头但 `X-Sign: deadbeef` | `{"code":40003,"msg":"signature verify failed","traceId":"9d6e9f1b-..."}` |
| API 不存在 | `GET /open/nope` | `{"code":40004,"msg":"api path not found: /open/nope","traceId":"45280603-..."}` |
| 路径归一后不存在 | `GET /open/` | `{"code":40004,"msg":"api path not found: /open","traceId":"cc8d9be2-..."}` |

注意最后两行：`/open/` 会被 `normalizePath` 去掉尾斜杠再查库。这也说明**错误语义目前是「HTTP 200 + 业务码」**，与 OpenAI 兼容协议要求的真实 HTTP 状态码（401/403/429…）冲突，是第 04 境必须解决的契约问题，登记进缺口清单。

---

## 5. 缺失数据库时的失败形态（真实日志，用于对照排障）

在 PostgreSQL 未启动时启动应用，第 02 号诊断链（数据源连接拒绝）的真实形态：

```text
ERROR c.a.d.p.DruidDataSource - init datasource error, url: jdbc:postgresql://localhost:5432/jd_openapi?currentSchema=public&stringtype=unspecified
org.postgresql.util.PSQLException: Connection to localhost:5432 refused. Check that the hostname and port are correct and that the postmaster is accepting TCP/IP connections.
WARN  o.s.b.w.s.c.AnnotationConfigServletWebServerApplicationContext - Exception encountered during context initialization - cancelling refresh attempt:
  Error creating bean with name 'shiroFilterFactoryBean' ... 'masterDataSource' ... Invocation of init method failed
```

这条日志对应素材原文的判据：「日志里 JDBC URL 指向一个本地地址加一个具体库名，而本机该端口无人监听」。**根因是环境缺失，不是代码缺陷。**

---

## 6. 冻结动作（Git）

```bash
git checkout -b chapter/01-reverse-demo-baseline
git add docs/reverse scripts/reverse openspec/changes/ch01-reverse-demo-baseline
git commit -m "docs(ch01): reverse engineer open-api demo baseline"
```

素材原文的分支名是 `chapter/01-reverse-demo`；本仓库加上 `-baseline` 后缀，原因：`docs/reverse` 这一个能力后续还会被别的境引用，用 `baseline` 明确本境只交基线、不含能力实现。提交信息逐字沿用素材。

---

## 7. 与素材文章的差异（如实记账）

| 项 | 文章写的 | 本仓库实测 | 原因 |
|---|---|---|---|
| JDK | 17 | 11.0.29 | `pom.xml` 的 `java.version=1.8`，Spring Boot 2.7.18；本机可用 JDK 11，编译通过 |
| Spring Boot | 3.x | 2.7.18 | 以工程实际 `pom.xml` 为准（文章本身也说「具体版本以解压后 pom.xml 为准」） |
| 压缩包哈希 | `9f2c...`（示例占位） | `A7985581...` | 文章标注为示例输出 |
| 扫描脚本路径 | `docs/reverse/scan.sh` | `scripts/reverse/scan.sh` | 本仓库把可执行脚本统一放 `scripts/`，产物仍落 `docs/reverse/` |
| 扫描产物路径 | `docs/reverse/` | `docs/reverse/scan-output/` | 让人工文档与机器产物分居两处，避免误把机器输出当结论 |
| 启动端口 | 18080（`--spring.profiles.active=dev`） | 18080（无 dev profile） | 工程只有默认 druid profile，没有 dev |
| 隔离目录 | `.reverse-work` | `.reverse-work`（bash）/ `.reverse-work2`（PowerShell） | 两套脚本并行时互不抢占 |

---

## 8. 未验证项（如实记账）

- 未做「另一个人只拿 zip 与 as-is.md 独立接通接口」的真人验收（单人作业无法完成）。代替做法：用 11 条运行时路径探测 + 一条完整签名往返作为客观证据（见第 4 节）。
- 未跑 `mvn test`（工程有 4 个集成测试类，依赖 5433 端口的 PostgreSQL 测试库与验证码绕过开关）。留给第 02 境的回归口径处理。
- `open-api/deploy/local-docker/docker-compose.yaml` 的 `--build` 在本机失败：其 Dockerfile 的 `apt-get update` 指向已下线的 Debian 源。本境的替代做法是直接用 `java -jar` 起两个实例 + 单独起 `postgres:11-alpine` 容器，效果等价。这条差异记入风险清单，第 18 境容器化时必须重写 Dockerfile。
