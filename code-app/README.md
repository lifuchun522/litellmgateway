# Nexus LLM Gateway 可运行原型

该目录包含 LLM Gateway 的本体模型、Flask 控制面/模拟数据面与 React 运维控制台。实现以 `open-api.zip` 的应用、API 授权和调用日志结构为技术底座参考，并转换为 LLM 场景下的应用凭证、模型别名、提供商端点、路由快照和请求—尝试链。

## 架构

```text
React 运维控制台
       │ REST / SSE
Flask 控制面 ── 策略审批 ── 快照编译/激活 ── SQLite 审计
       │
模拟数据面 ── 身份绑定 ── 策略解析 ── 端点选择 ── 重试/回退 ── 用量计费
```

本体位于 `models/`：

| 模型 | 内容 |
|---|---|
| M1 | 19 个核心对象及关系 |
| M2 | 管理动作与自动执行行为 |
| M3 | 身份、继承、发布、重试、熔断、计费等 16 条规则 |
| M4 | 成本、调用链、对账与健康查询 |
| M5 | 角色、职责分离与数据权限 |
| M6 | 策略发布、调用执行、应急变更流程 |
| MU | 三栏工作台与 AI 助手 SSE 交互 |

## 快速启动

要求 Python 3.10+、Node.js 18+。

```bash
cd backend
python -m venv ../.venv
../.venv/bin/pip install -r requirements.txt

cd ../frontend
npm ci
npm run build

cd ../backend
../.venv/bin/python app.py
```

浏览器访问 <http://127.0.0.1:5000>。后端会托管 `frontend/dist`，无需额外运行前端开发服务。

可用环境变量：

- `APP_DB_PATH`：覆盖 SQLite 文件位置，测试使用临时数据库。
- `APP_SECRET_KEY`、`JWT_SECRET`：覆盖 Flask 会话密钥与 JWT 签名密钥；部署时必须设置为独立强随机值。
- `DEFAULT_ADMIN`、`DEFAULT_ADMIN_PASSWORD`：覆盖首次初始化管理员账号；部署前必须替换演示默认值。
- `AI_API_KEY`、`AI_BASE_URL`、`AI_MODEL`：覆盖外部 AI 提供商配置。
- 其余端口与基础配置见 `backend/config.yaml`。

## API 概览

| 方法 | 路径 | 用途 |
|---|---|---|
| GET | `/api/gateway/dashboard` | 运行指标、活动快照、端点概况 |
| GET | `/api/gateway/catalog` | 应用、别名、提供商、端点目录 |
| GET/POST | `/api/gateway/policies` | 查询/创建路由策略 |
| POST | `/api/gateway/policies/{id}/submit` | 提交安全审批 |
| POST | `/api/gateway/policies/{id}/approve` | 安全或 SRE 审批 |
| POST | `/api/gateway/policies/{id}/publish` | 编译并激活不可变快照 |
| POST | `/api/gateway/invoke` | 执行模拟网关调用 |
| GET | `/api/gateway/traces` | 查询请求—尝试链 |
| GET | `/api/gateway/reconciliations` | 查询对账差异 |
| GET | `/api/gateway/audits` | 查询结构化审计事件 |
| POST | `/api/gateway/assistant/stream` | 返回命名 SSE 推理与答案事件 |

调用示例：

```bash
curl -s http://127.0.0.1:5000/api/gateway/invoke \
  -H 'Content-Type: application/json' \
  -d '{"appCode":"research-copilot","model":"smart-chat","messages":[{"role":"user","content":"检查网关"}],"simulateFailure":true}'
```

`simulateFailure=true` 会令第一个候选端点在首字节前返回可重试错误，用于验证第二端点接管以及完整尝试链。

## 测试

```bash
cd backend
../.venv/bin/python -m unittest discover -s tests -v

cd ../frontend
npm run build
```

浏览器测试使用 Playwright CLI，测试步骤和截图见 `../docs/测试报告.md`。

## 原型边界

本次目标是快速验证架构与核心链路。策略生命周期、不可变快照、重试边界、用量成本、审计、追踪和 AI 助手均可运行；真实上游模型请求、外部密钥管理、分布式快照 ACK、持久化消息队列和完整 CRUD 管理页在本体中已定义，当前以确定性模拟或只读目录呈现，供生产化阶段替换。
