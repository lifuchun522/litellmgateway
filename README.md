# Nexus LLM Gateway

基于业务需求、架构 PDF 与 `open-api.zip` 参考工程完成的本体驱动 LLM 网关原型。项目采用“控制面编译策略、数据面执行不可变快照”的设计，提供应用身份、模型别名、提供商端点、策略审批发布、调用重试、用量成本、审计追踪与 AI 运维助手等能力。

## 交付入口

- [需求规格说明书](./LLM网关-需求规格说明书-V9.md)
- [本体模型](./code-app/models/manifest.json)
- [功能对应矩阵](./docs/功能对应矩阵.md)
- [产品手册](./docs/产品手册.md)
- [测试报告](./docs/测试报告.md)
- [实施计划](./docs/superpowers/plans/2026-09-15-llm-gateway.md)

## 快速启动

```bash
cd code-app/backend
python -m venv ../.venv
../.venv/bin/pip install -r requirements.txt

cd ../frontend
npm ci
npm run build

cd ../backend
../.venv/bin/python app.py
```

访问 <http://127.0.0.1:5000>。首次启动会自动创建 SQLite 数据库并写入演示应用、模型别名、双端点、活动快照与审计数据。

生产部署前请通过 `APP_SECRET_KEY`、`JWT_SECRET` 与 `DEFAULT_ADMIN_PASSWORD` 覆盖演示配置，具体变量见 `code-app/README.md`。

## 验证

```bash
cd code-app/backend
../.venv/bin/python -m unittest discover -s tests -v

cd ../frontend
npm run build
```

详细操作和测试证据见交付文档。
