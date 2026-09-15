# LLM Gateway 快速实现计划

> 执行依据：《LLM网关-需求规格说明书-V9》、七类本体模型，以及 `open-api.zip` 的应用鉴权、API 授权、代理调用和调用日志设计。

## 目标

交付可运行的 LLM Gateway 控制面演示：应用与凭证、供应商与端点、模型别名、策略审批发布、确定性路由、配额/预算、调用链路、成本观测、审计和只读 AI 助手，并形成自动化测试、测试截图、功能映射和产品手册。

## 技术路径

- 后端：Flask + SQLite；策略发布生成不可变快照，调用时绑定快照版本。
- 前端：React + TypeScript + Vite；三栏控制台，右侧为只读 AI 助手。
- 测试：Python `unittest` 覆盖领域规则与 API 集成；Vite 生产构建；Playwright 覆盖关键用户旅程并留存截图。
- 兼容：保留技术底座的系统管理模块文件，但应用入口与业务数据切换为 LLM Gateway。

## Task 1：以测试固定后端契约

**Files**
- Create: `code-app/backend/tests/test_gateway_api.py`
- Create: `code-app/backend/tests/test_gateway_rules.py`

**Steps**
1. 编写资源目录、仪表盘、策略提交/审批/发布、路由调用、失败回退、限流和 SSE 助手测试。
2. 运行 `python -m unittest discover -s tests -v`，确认因接口尚未实现而失败。

## Task 2：实现领域存储与策略引擎

**Files**
- Modify: `code-app/backend/schema.sql`
- Modify: `code-app/backend/seed.py`
- Create: `code-app/backend/services/gateway_service.py`
- Create: `code-app/backend/api/gateway.py`
- Modify: `code-app/backend/app.py`
- Modify: `code-app/backend/config.yaml`

**Steps**
1. 创建应用、凭证、供应商、端点、别名、策略、候选、快照、请求、尝试、用量、审计表。
2. 实现策略状态机及禁止自批、总尝试不超过 3、首字节后不回退、能力/数据等级过滤、成本双口径。
3. 实现 REST API 与 AI 助手 SSE 事件契约。
4. 反复运行后端测试至绿色。

## Task 3：构建三栏控制台

**Files**
- Modify: `code-app/frontend/src/App.tsx`
- Modify: `code-app/frontend/src/styles/index.css`
- Create: `code-app/frontend/src/api/gateway.ts`

**Steps**
1. 构建运行总览、接入管理、模型资源、策略发布、调用观测、成本对账页面。
2. 接入策略发布和网关调用演练。
3. 实现右侧 AI 助手流式事件显示及建议问题。
4. 运行 `npm run build` 并修复类型/构建问题。

## Task 4：E2E、截图和文档

**Files**
- Create: `code-app/e2e/llm-gateway.spec.ts`
- Create: `docs/LLM-Gateway-产品手册.md`
- Create: `docs/功能对应矩阵.md`
- Create: `docs/测试报告.md`
- Create: `output/playwright/*.png`

**Steps**
1. 启动 Flask 一体化服务。
2. 使用 Playwright 验证总览、策略发布、路由演练、链路追踪和 AI 助手。
3. 保存关键页面截图并在测试报告和产品手册中引用。
4. 对照需求、本体和 `open-api.zip` 整理逐项映射。

## Task 5：最终验证、提交和推送

1. 新鲜运行后端测试、前端构建、E2E。
2. 检查敏感信息、工作树差异及文档链接。
3. 提交到 `feat/ontology-llm-gateway` 并推送 GitHub origin。
