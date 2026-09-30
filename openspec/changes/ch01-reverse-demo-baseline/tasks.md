# Tasks

> 每条任务都带「验证：」——没有验证行的任务不算完成。
> 本境不产生任何代码变更；`open-api.zip` 与 `open-api/**` 全程只读。

## 0. 环境与隔离

- [x] 0.1 建立隔离目录并进 `.gitignore`（`.reverse-work/`、`.reverse-work2/`）；
      验证：`git status --porcelain` 输出中不出现这两个目录下的任何路径
- [x] 0.2 记录基线锚点：`open-api.zip` 的 SHA256、解压后项目根相对路径；
      验证：`docs/reverse/scan-output/zip.sha256` 内容为 `A798558197D898011BBBF4AF2A0CA5F84CBFA5480099EE4D3A8E3FBE7F7BBE05`，
      `root.txt` 内容为 `open-api/qvsu-openapi`

## 1. 只读扫描脚本（能力 `reverse-baseline` 规格第 1、2 条）

- [x] 1.1 `scripts/reverse/scan.sh`：冻结哈希、定位项目根、包分布、接口候选、依赖树、资产清单、源码规模；
      验证：在 Ubuntu 风格 shell 下执行输出 7 个非空产物，末尾打印 `== scan done ==`
- [x] 1.2 `scripts/reverse/scan.ps1`：与 1.1 等价的 Windows 实现；
      验证：`& .\scripts\reverse\scan.ps1` 成功，7 个产物齐全
- [x] 1.3 两套脚本都做产物非空校验，缺失即非零退出；
      验证：临时把 `$Out` 指向只读路径或删除产物后重跑，脚本以非零码结束
- [x] 1.4 修正资产清单灌水：排除 `target/`、`node_modules/`、`.git/`、`scan-output/`，并把扫描范围扩到项目根的**父目录**（SQL 与容器化脚本在 `open-api/sql`、`open-api/deploy`）；
      验证：`assets.txt` 从 640 行降到 29 行，且包含 `sql/open_api.sql` 与 `deploy/local-docker/Dockerfile`
- [x] 1.5 `.ps1` 必须带 UTF-8 BOM（PowerShell 5.1 会按 ANSI 解码无 BOM 的 UTF-8）；
      验证：文件头三字节为 `239,187,191`，且脚本可执行

## 2. 运行前置条件与基线可运行性

- [x] 2.1 起 PostgreSQL 11（`postgres:11-alpine`），库 `jd_openapi`，端口 5432，加载 `deploy/local-docker/postgres/init/*.sql`；
      验证：`psql -c "\dt"` 返回 34 张表
- [x] 2.2 编译并打包；
      验证：`mvn -B -ntp package -DskipTests` → BUILD SUCCESS，产出 `target/qvsu-openapi.jar`
- [x] 2.3 启动两个实例（网关 18080、上游回显 5656）；
      验证：两份日志均出现 `Started QvsuApplication`
- [x] 2.4 记录「缺库时的失败形态」作为对照证据；
      验证：`baseline.md` 第 5 节包含真实的 `Connection to localhost:5432 refused` 与 `masterDataSource` 连锁失败日志

## 3. 接口事实采集（规格第 3、6 条）

- [x] 3.1 11 条路径的运行时状态码探测，**显式绕过 HTTP 代理**；
      验证：`baseline.md` 第 4 节的表格有 11 行，且包含 `/` → 302、`/login` → 200、`/open/` → 200 JSON
- [x] 3.2 一条完整的签名请求往返（签名算法从 `OpenApiSecurityService.java:121-145` 读出，不猜）；
      验证：响应为 `{"code":0,"msg":"success","data":{"args":{"category":"get","demo":"1"}},"traceId":"..."}`
- [x] 3.3 三条鉴权失败路径的错误码；
      验证：`40001 missing auth headers`、`40003 signature verify failed`、`40004 api path not found`，HTTP 均为 200
- [x] 3.4 协议入口缺失的**双重判据**（静态检索零命中 + 与不存在路径行为相同）；
      验证：`src/main/java` 检索 `/v1` 零命中；`/v1/models` 与 `/nosuchpath123` 的响应一致
- [x] 3.5 `docs/reverse/endpoints.md`：245 条候选逐条确认，三态 + 否决理由，含统计与抽检；
      验证：候选/确认/否决/待验证四个数字与 `endpoints.raw.txt` 行数自洽

## 4. 人工结论文档（规格第 3、4、5 条）

- [x] 4.1 `docs/reverse/as-is.md`：结构固定十一节，「运行前置条件」在第一；
      验证：一级标题依次为 运行前置条件 / 模块树 / 启动入口 / 接口清单 / 调用链 / 数据模型 / 页面路由 / 外部依赖 / 复用矩阵 / 缺口清单 / 风险清单
- [x] 4.2 As-Is 中每条结构结论都带仓库内相对路径；
      验证：随机抽 5 行，路径在仓库中真实存在
- [x] 4.3 `docs/reverse/reuse-matrix.md`：表头固定为「对象、所在路径、判定、理由、证据、生效章节」，判定限五档；
      验证：任取一行按证据列 30 秒内定位到源码
- [x] 4.4 `docs/reverse/gaps-and-risks.md`：缺口与风险分两节，缺口给建议章节，风险给触发条件；
      验证：缺口条目不含「可能」类措辞，风险条目不含「必须实现」类措辞
- [x] 4.5 数据模型核对：实际连库 `\d` 与 `docs/meta-model/database-inventory.md` 对齐；
      验证：34 张表、5 张 `open_*` 表、`open_app_api` 有唯一约束无外键三项一致

## 5. 基线冻结（规格第 7 条）

- [x] 5.1 `docs/reverse/baseline.md`：哈希、项目根、编译命令、启动命令、三段真实证据；
      验证：按文档命令能从零启动到可运行状态
- [x] 5.2 记录与素材文章的 7 处差异（JDK、Spring Boot、哈希、脚本路径、产物路径、profile、隔离目录）；
      验证：差异表存在且每行给出原因
- [x] 5.3 记录 3 项未验证项（真人复验、`mvn test`、docker compose 构建失败）；
      验证：`baseline.md` 第 8 节非空

## 6. 仓库策略与门禁

- [x] 6.1 `.github/workflows/ci.yml`：编译 + 测试 + 打包 + 上传产物；
      验证：workflow 在 PR 上触发且 `mvn -B -ntp test` 步骤存在
- [x] 6.2 CI 增加「18 境章节文本齐全」门禁；
      验证：删掉任一章节目录后门禁失败
- [x] 6.3 CI 增加 OpenSpec 规格校验 job；
      验证：`openspec validate ch01-reverse-demo-baseline --strict` 通过
- [x] 6.4 `openspec/config.yaml` 落地（zh-CN 上下文 + 四类 artifact 规则）；
      验证：`openspec list --json` 能列出本变更
- [x] 6.5 本变更四件套齐全且通过校验；
      验证：`openspec validate ch01-reverse-demo-baseline --strict` 无错误

## 7. 回归口径（交给第 02 境）

- [ ] 7.1 明确第 02 境的回归三件套：残留扫描为空、编译通过、基线响应 diff 无差异；
      验证：第 02 境的 `tasks.md` 引用本节的 `baseline.md` 证据作为对照
- [ ] 7.2 `mvn test` 的离线口径（4 个集成测试类依赖 5433 端口测试库）；
      验证：第 02 境给出可离线跑通的测试选择，或明确标注不可跑的理由

## 8. 提交与推送

- [ ] 8.1 分支 `chapter/01-reverse-demo-baseline`，提交信息 `docs(ch01): reverse engineer open-api demo baseline`；
      验证：`git log --oneline -1` 输出该提交信息
- [ ] 8.2 推送分支并开 PR 到 `main`；
      验证：`gh pr view` 能打开且 CI 绿
