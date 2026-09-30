# litellmgateway

> 轻量级 LLM 网关。底座是仓库根那份 `open-api.zip`（一个能跑但没人说得清的 Java 后端 Demo），
> 按 **18 境**逐章把传统 API 网关改造成大模型网关——每境一份 OpenSpec 变更、一条章节分支、一次可复核的验收。

---

## 一、值不值得看

这不是一份从零开始的项目，而是一次**在别人的骨架上炼网关**的完整记录：

- 起点是一份**没有设计文档、没有接口契约**的压缩包。第 01 境先把它逆向成可回归的 0 号基线，而不是急着改包名。
- 每一境都回答一个**一线真问题**：怎么让客户端只改 `base_url` 就能接入（第 04 境）、Controller 为什么不能堆业务（第 05 境）、上游挂了谁接住（第 09 境）、坏节点怎么自动摘掉又自动回来（第 10 境）、账单为什么算不出来（第 14 境）。
- 每一境都留下**可复核的证据**：真实命令、真实响应、真实日志，以及一张带 `文件:行号` 的复用矩阵。写不出证据的结论一律标注「未验证」。

**四类读者可以这样挑着看：**

| 你是 | 建议路线 |
|---|---|
| 要接手一个老工程的后端 | 01 → 02 → 03（逆向、换骨、本体，三境决定后面会不会返工） |
| 要做网关核心能力 | 04 → 05 → 06 → 07 → 08（协议、流水线、适配器、路由、模型归一） |
| 要做稳定性与治理 | 09 → 10 → 12 → 13 → 16（重试、熔断、限流预算、配置持久、可观测） |
| 要落地到生产 | 11 → 14 → 15 → 17 → 18（密钥、计量、控制台、高级策略、K8s） |

**时间只够看三段的话**：第 01 境（逆向的纪律）、第 05 境（可插拔流水线）、第 18 境（生产化验收要覆盖失败路径）。

---

## 二、快速启动

前置：JDK 11、Maven 3.9+、PostgreSQL 11（或 Docker）。

```bash
# 1. 起数据库（空库会自动执行 deploy/local-docker/postgres/init/*.sql，共 34 张表）
cd open-api/deploy/local-docker && docker compose up -d postgres && cd -

# 2. 编译打包
cd open-api/qvsu-openapi && mvn -B -ntp package -DskipTests && cd -

# 3. 启动（默认端口 5656；下面用 18080 避免与本机其它服务冲突）
java -jar open-api/qvsu-openapi/target/qvsu-openapi.jar --server.port=18080
```

管理后台：`http://localhost:18080/login`，默认账号 `admin` / `admin123`。

### 走一次传统网关链路（签名 → 转发 → 统一响应）

`open_api` 表里预置了 8 条 selftest 路径，用测试应用 `ak_selftest_demo` 直接跑：

```powershell
# Windows
& .\scripts\reverse\smoke-open-gateway.ps1
```

```bash
# Linux：先按 baseline.md 第 4.1 节算出 X-Sign（HmacSHA256 小写 hex），再
curl -s -H "X-App-Key: ak_selftest_demo" -H "X-Timestamp: $TS" -H "X-Nonce: $NONCE" -H "X-Sign: $SIGN" \
  "http://127.0.0.1:18080/open/selftest/httpbin/get?demo=1&category=get"
```

期望：`{"code":0,"msg":"success","data":{"args":{"category":"get","demo":"1"}},"traceId":"..."}`

> 本机若设置了 `HTTP_PROXY`，探活必须绕过代理，否则本机请求会被送进代理并统一返回 503。这是第 01 境实测踩过的坑。

### 重跑逆向扫描（只读，不改任何源码）

```bash
./scripts/reverse/scan.sh                    # Linux / CI
```
```powershell
& .\scripts\reverse\scan.ps1                 # Windows（脚本带 UTF-8 BOM）
```

---

## 三、18 境：文章与视频

| 境 | 境界 · 宝术 · 主题 | 分支 | 读文章 | 看视频 |
|---|---|---|---|---|
| 01 | 搬血境 · 狻猊宝术 · Demo逆向筑基 | `chapter/01-reverse-demo-baseline` | [文章](docs/tutorials/hunter-gateway/chapters/01-move-blood/01-Demo逆向筑基-文章.md) | [视频](docs/tutorials/hunter-gateway/chapters/01-move-blood/01-Demo逆向筑基-视频.md) |
| 02 | 洞天境 · 柳神法 · 工程脱胎换骨 | `chapter/02-cave-heaven` | [文章](docs/tutorials/hunter-gateway/chapters/02-cave-heaven/02-工程脱胎换骨-文章.md) | [视频](docs/tutorials/hunter-gateway/chapters/02-cave-heaven/02-工程脱胎换骨-视频.md) |
| 03 | 化灵境 · 原始真解 · 领域本体重塑 | `chapter/03-spirit-transform` | [文章](docs/tutorials/hunter-gateway/chapters/03-spirit-transform/03-领域本体重塑-文章.md) | [视频](docs/tutorials/hunter-gateway/chapters/03-spirit-transform/03-领域本体重塑-视频.md) |
| 04 | 铭纹境 · 上苍之手 · 统一协议刻契 | `chapter/04-inscription` | [文章](docs/tutorials/hunter-gateway/chapters/04-inscription/04-统一协议刻契-文章.md) | [视频](docs/tutorials/hunter-gateway/chapters/04-inscription/04-统一协议刻契-视频.md) |
| 05 | 列阵境 · 六道轮回天功 · 网关流水线列阵 | `chapter/05-array-formation` | [文章](docs/tutorials/hunter-gateway/chapters/05-array-formation/05-网关流水线列阵-文章.md) | [视频](docs/tutorials/hunter-gateway/chapters/05-array-formation/05-网关流水线列阵-视频.md) |
| 06 | 尊者境 · 鲲鹏宝术 · Provider统一接入 | `chapter/06-venerable` | [文章](docs/tutorials/hunter-gateway/chapters/06-venerable/06-Provider统一接入-文章.md) | [视频](docs/tutorials/hunter-gateway/chapters/06-venerable/06-Provider统一接入-视频.md) |
| 07 | 神火境 · 雷帝宝术 · 智能路由点火 | `chapter/07-divine-flame` | [文章](docs/tutorials/hunter-gateway/chapters/07-divine-flame/07-智能路由点火-文章.md) | [视频](docs/tutorials/hunter-gateway/chapters/07-divine-flame/07-智能路由点火-视频.md) |
| 08 | 真一境 · 真龙宝术 · 模型部署归一 | `chapter/08-true-one` | [文章](docs/tutorials/hunter-gateway/chapters/08-true-one/08-模型部署归一-文章.md) | [视频](docs/tutorials/hunter-gateway/chapters/08-true-one/08-模型部署归一-视频.md) |
| 09 | 圣祭境 · 轮回宝术 · 失败重试轮转 | `chapter/09-holy-sacrifice` | [文章](docs/tutorials/hunter-gateway/chapters/09-holy-sacrifice/09-失败重试轮转-文章.md) | [视频](docs/tutorials/hunter-gateway/chapters/09-holy-sacrifice/09-失败重试轮转-视频.md) |
| 10 | 天神境 · 真凰不死身 · 熔断涅槃恢复 | `chapter/10-deity` | [文章](docs/tutorials/hunter-gateway/chapters/10-deity/10-熔断涅槃恢复-文章.md) | [视频](docs/tutorials/hunter-gateway/chapters/10-deity/10-熔断涅槃恢复-视频.md) |
| 11 | 虚道境 · 蛄族宝术 · VirtualKey控域 | `chapter/11-void-dao` | [文章](docs/tutorials/hunter-gateway/chapters/11-void-dao/11-VirtualKey控域-文章.md) | [视频](docs/tutorials/hunter-gateway/chapters/11-void-dao/11-VirtualKey控域-视频.md) |
| 12 | 斩我境 · 天角蚁宝术 · 限流预算治理 | `chapter/12-self-slaying` | [文章](docs/tutorials/hunter-gateway/chapters/12-self-slaying/12-限流预算治理-文章.md) | [视频](docs/tutorials/hunter-gateway/chapters/12-self-slaying/12-限流预算治理-视频.md) |
| 13 | 遁一境 · 不灭经 · 配置持久不灭 | `chapter/13-escape-one` | [文章](docs/tutorials/hunter-gateway/chapters/13-escape-one/13-配置持久不灭-文章.md) | [视频](docs/tutorials/hunter-gateway/chapters/13-escape-one/13-配置持久不灭-视频.md) |
| 14 | 至尊境 · 金璇波纹功 · 计量成本归一 | `chapter/14-supreme` | [文章](docs/tutorials/hunter-gateway/chapters/14-supreme/14-计量成本归一-文章.md) | [视频](docs/tutorials/hunter-gateway/chapters/14-supreme/14-计量成本归一-视频.md) |
| 15 | 真仙境 · 八九天功 · 中文控制台统御 | `chapter/15-true-immortal` | [文章](docs/tutorials/hunter-gateway/chapters/15-true-immortal/15-中文控制台统御-文章.md) | [视频](docs/tutorials/hunter-gateway/chapters/15-true-immortal/15-中文控制台统御-视频.md) |
| 16 | 仙王境 · 草字剑诀 · 可观测斩链 | `chapter/16-immortal-king` | [文章](docs/tutorials/hunter-gateway/chapters/16-immortal-king/16-可观测斩链-文章.md) | [视频](docs/tutorials/hunter-gateway/chapters/16-immortal-king/16-可观测斩链-视频.md) |
| 17 | 准仙帝 · 第三至尊术 · 高级策略增幅 | `chapter/17-quasi-emperor` | [文章](docs/tutorials/hunter-gateway/chapters/17-quasi-emperor/17-高级策略增幅-文章.md) | [视频](docs/tutorials/hunter-gateway/chapters/17-quasi-emperor/17-高级策略增幅-视频.md) |
| 18 | 仙帝境 · 他化自在法 · 云上生产封帝 | `chapter/18-immortal-emperor` | [文章](docs/tutorials/hunter-gateway/chapters/18-immortal-emperor/18-云上生产封帝-文章.md) | [视频](docs/tutorials/hunter-gateway/chapters/18-immortal-emperor/18-云上生产封帝-视频.md) |

章节文本总目录见 [`docs/tutorials/hunter-gateway/`](docs/tutorials/hunter-gateway/README.md)（含素材来源清单 `_source-manifest.md`）。

---

## 四、分支与 tag

一章一条分支、一次 PR、一个 tag。分支从 `main` 拉出，合回 `main` 时用 squash。

| 境 | 主题 | 分支 | tag |
|---|---|---|---|
| 01 | Demo逆向筑基 | `chapter/01-reverse-demo-baseline` | `ch01` |
| 02 | 工程脱胎换骨 | `chapter/02-cave-heaven` | — |
| 03 | 领域本体重塑 | `chapter/03-spirit-transform` | — |
| 04 | 统一协议刻契 | `chapter/04-inscription` | — |
| 05 | 网关流水线列阵 | `chapter/05-array-formation` | — |
| 06 | Provider统一接入 | `chapter/06-venerable` | — |
| 07 | 智能路由点火 | `chapter/07-divine-flame` | — |
| 08 | 模型部署归一 | `chapter/08-true-one` | — |
| 09 | 失败重试轮转 | `chapter/09-holy-sacrifice` | — |
| 10 | 熔断涅槃恢复 | `chapter/10-deity` | — |
| 11 | VirtualKey控域 | `chapter/11-void-dao` | — |
| 12 | 限流预算治理 | `chapter/12-self-slaying` | — |
| 13 | 配置持久不灭 | `chapter/13-escape-one` | — |
| 14 | 计量成本归一 | `chapter/14-supreme` | — |
| 15 | 中文控制台统御 | `chapter/15-true-immortal` | — |
| 16 | 可观测斩链 | `chapter/16-immortal-king` | — |
| 17 | 高级策略增幅 | `chapter/17-quasi-emperor` | — |
| 18 | 云上生产封帝 | `chapter/18-immortal-emperor` | — |

其它分支前缀：`docs/*`（文档同步）、`chore/*`（工程杂务）、`fix/*`（缺陷修复）、`ci/*`（流水线）。

---

## 目录与约定

```
litellmgateway/
├── open-api.zip                  # 0 号基线压缩包（只读，哈希见 docs/reverse/baseline.md）
├── open-api/
│   ├── qvsu-openapi/             # 后端/前端单模块工程（Spring Boot 2.7.18）
│   ├── deploy/local-docker/      # 本地编排 + 初始化 SQL（PostgreSQL / MySQL 双份）
│   └── sql/                      # 独立 SQL 脚本
├── docs/
│   ├── tutorials/hunter-gateway/ # 18 境章节文本（文章 + 视频），需求来源
│   ├── reverse/                  # 第 01 境逆向产物（as-is / 复用矩阵 / 缺口风险 / 冻结记录）
│   ├── design/                   # 每章设计与实现说明
│   ├── meta-model/               # 既有逆向元模型（25 份）
│   └── ontology/                 # 既有本体模型（七模型 YAML）
├── openspec/
│   ├── config.yaml
│   ├── changes/chNN-*/           # 每境一个变更：proposal / specs / design / tasks
│   └── specs/*/spec.md           # 归档后沉淀的系统能力规格
├── pages/architecture.html       # 架构演示稿
└── scripts/reverse/              # 只读扫描与探活脚本
```

**四条硬约定**

1. **一章一个 change**：`openspec/changes/chNN-*`，归档后能力规格并入 `openspec/specs/`。
2. **提交信息**：`type(chNN): 描述`，如 `docs(ch01): reverse engineer open-api demo baseline`、`feat(ch04): establish openai compatible gateway contract`。
3. **验收必须有证据**：命令 + 真实输出；没跑的部分写「未验证」，不写「应该能通」。
4. **`open-api.zip` 只读**：它是基线锚点，重新打包即失去参照。

---

## 许可

见 [LICENSE](LICENSE)。
