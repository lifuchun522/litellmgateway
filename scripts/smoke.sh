#!/usr/bin/env bash
# scripts/smoke.sh —— 换骨回归冒烟：把当前接口行为与 baseline/ 里的黄金响应逐项比对。
#
# 用法：
#   BASE_URL=http://localhost:5656 ./scripts/smoke.sh
#
# 退出码：0 = 全部一致；1 = 存在差异（差异明细打印到 stdout）。
#
# 说明：第 01 境确认工程**没有** OpenAI 兼容入口（/v1/* 不存在）。
# 因此 baseline/ 里存的是「归一化后的真实行为」（HTTP 状态码 + Location 头），
# 而不是响应正文——正文里含每次请求都变的 CSRF token，直接 diff 会产生假阳性。
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:5656}"
BASELINE_DIR="${BASELINE_DIR:-baseline}"
OUT_DIR="${OUT_DIR:-.smoke-out}"
mkdir -p "$OUT_DIR"

fail=0

# capture <name> <method> <path> [body-file]
capture() {
  local name="$1" method="$2" path="$3" body="${4:-}"
  local out="$OUT_DIR/$name.json"
  if [ -n "$body" ]; then
    curl -s -o /dev/null -w '%{http_code}\n' -X "$method" -H 'Content-Type: application/json' --data "@$body" "$BASE_URL$path" > "$OUT_DIR/$name.code" || true
  else
    curl -s -o /dev/null -w '%{http_code}\n' -X "$method" "$BASE_URL$path" > "$OUT_DIR/$name.code" || true
  fi
  # 归一化：只留状态码与跳转目标，去掉端口与时间等易变部分
  local code
  code="$(cat "$OUT_DIR/$name.code")"
  printf '{"name":"%s","method":"%s","path":"%s","httpStatus":%s}\n' \
    "$name" "$method" "$path" "$code" > "$out"
  echo "$out"
}

echo "== 采集当前行为（$BASE_URL）=="
for spec in "index GET /index" "login GET /login" "models GET /v1/models" "chat POST /v1/chat/completions" "open GET /open/" "nope GET /nosuchpath123"; do
  set -- $spec
  capture "$1" "$2" "$3" >/dev/null
  echo "  $1 -> $(cat "$OUT_DIR/$1.code")"
done

echo
echo "== 与基线比对 =="
# chat-req.json 是请求样例（输入），不是行为快照，必须排除，否则每轮都报假差异
for f in "$BASELINE_DIR"/*.json; do
  name="$(basename "$f" .json)"
  [ "$name" = "chat-req" ] && continue
  if [ ! -f "$OUT_DIR/$name.json" ]; then
    echo "  差异：基线有 $name，当前采集缺失"
    fail=1
    continue
  fi
  if diff -q "$f" "$OUT_DIR/$name.json" >/dev/null; then
    echo "  一致：$name"
  else
    echo "  差异：$name"
    diff -u "$f" "$OUT_DIR/$name.json" || true
    fail=1
  fi
done

if [ "$fail" -eq 0 ]; then
  echo
  echo "换骨回归通过：接口行为与基线一致"
  exit 0
fi

echo
echo "换骨回归失败：存在行为差异，按停止线要求回退，不许现场改代码" >&2
exit 1
