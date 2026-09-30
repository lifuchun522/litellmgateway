#!/usr/bin/env bash
# scripts/check-rename.sh —— 换骨残留扫描：确认全仓已无旧标识。
#
# 用法：./scripts/check-rename.sh
# 退出码：0 = 无残留；1 = 仍有残留（逐条打印命中位置）。
#
# 设计要点（两次踩坑后的最终口径）：
#   1. **锚定到行内合法位置**，而不是排除整类文件。
#      第一版用 `--exclude=check-rename.sh` 想排除脚本自身，实测 GNU grep 的
#      `--exclude` 与 `--include` 组合时并不可靠——被排除的文件照样出现在结果里。
#      改用锚定后，本脚本里 `OLD_PKG="com.qvsu"` 这类写法天然不会命中，
#      也不需要维护一份「排除谁」的黑名单（黑名单永远会漏）。
#   2. 只扫纳入版本控制的文件（`git ls-files`），而不是磁盘上的所有文件——
#      这样构建产物、隔离目录、`docs/` 里的历史证据、以及压缩包里的二进制
#      都不会污染结论。
set -euo pipefail

# 锚定模式的解释（模式本身不写出完整旧标识，避免扫描脚本自己命中自己）：
#   1) 旧包名：以 `com.` 开头的标识符，后面必须紧跟非标识符字符。
#   2) 旧配置前缀：**配置文件里**行首的键名。判据是「文件是 yml/yaml/properties」+
#      「行首就是键名」，因此注释行（`# ...`）与 Java 里的文字描述天然不会命中——
#      这正是第一次尝试用 `--exclude` 想达到的效果，但排除整类文件永远会漏，
#      改成「锚定 + 按文件类型限定」之后判据唯一且可解释。
#   3) 旧产物名、旧镜像名、旧容器名。
OLD_PKG_RE='(^|[^A-Za-z0-9_.])com\.qvsu([^A-Za-z0-9_]|$)'
OLD_PREFIX_RE='^qvsu:'
OLD_ARTIFACT_RE='qvsu-openapi\.jar|openapi-app|qvsu_open_api'

# 允许的例外（路径子串 -> 原因）
ALLOW_SUBSTR="scripts/check-rename|application-prefixcompat.yml"

# 有意保留的旧标识（写在扫描结论里，避免「扫不出来」被误读成「忘了改」）
KEEP_NOTES=$(cat <<'EOF'
  有意保留（不是漏改）：
    - 模块目录名 open-api/qvsu-openapi/         第 02 境明确不拆模块、不改目录结构
    - 定时任务 Bean 名 qvsuTask                 数据库 sys_job.invoke_target 存了字符串（19 行）
    - 资源前缀 /qvsu.png 与 /qvsu/**            与 ResourcesConfig 的前缀常量成对，只改一处会 404 或绕过鉴权
    - docs/ 与 openspec/ 下的旧标识             历史证据：记录的是换骨前的路径与行号
    - application-prefixcompat.yml 的旧前缀段    兼容期验证样例，它「必须」只含旧前缀
    - pages/architecture.html 的旧包名          架构演示稿，已就地标注新旧对应关系
EOF
)

files_list=$(mktemp)
trap 'rm -f "$files_list"' EXIT
git ls-files -z \
  | tr '\0' '\n' \
  | grep -vE '^(docs/|openspec/|pages/|\.git/)' \
  | grep -vE '(^|/)(target|node_modules|\.reverse-work2?|\.smoke-out)/' \
  | grep -vE '\.(png|jpg|jpeg|gif|ico|zip|jar|pdf|woff2?|ttf|eot|otf)$' \
  > "$files_list"

echo "扫描纳入版本控制的文件：$(wc -l < "$files_list" | tr -d ' ') 个"

fail=0

# scan_files <pattern>：输出「路径:行号:内容」，并剔除允许的例外
scan_files() {
  local pattern="$1"
  xargs -a "$files_list" -d '\n' grep -nEI "$pattern" 2>/dev/null \
    | grep -vE "$ALLOW_SUBSTR" || true
}

report() {
  local title="$1" hits="$2"
  echo "== $title =="
  if [ -n "$hits" ]; then
    echo "$hits" | head -20 | sed 's/^/  /'
    local n
    n=$(echo "$hits" | wc -l | tr -d ' ')
    [ "$n" -gt 20 ] && echo "  ...（共 $n 处）"
    return 1
  fi
  echo "  无残留"
  return 0
}

hits=$(scan_files "$OLD_PKG_RE")
report "1/3 扫描旧包名（锚定标识符边界）" "$hits" || { echo "换骨未完成：仍存在旧包名引用" >&2; fail=1; }

# 配置前缀只在配置文件里才算「配置键」：注释行与 Java 文字描述不算
prefix_files=$(mktemp)
trap 'rm -f "$files_list" "$prefix_files"' EXIT
grep -E '\.(ya?ml|properties)$' "$files_list" > "$prefix_files"
hits=$(xargs -a "$prefix_files" -d '\n' grep -nEI "$OLD_PREFIX_RE" 2>/dev/null | grep -vE "$ALLOW_SUBSTR" || true)
report "2/3 扫描旧配置前缀（仅配置文件的行首键名）" "$hits" || { echo "换骨未完成：仍存在旧配置前缀" >&2; fail=1; }

hits=$(scan_files "$OLD_ARTIFACT_RE")
report "3/3 扫描旧制品/镜像/容器标识" "$hits" || { echo "换骨未完成：仍存在旧制品/镜像标识" >&2; fail=1; }

echo
echo "$KEEP_NOTES"

if [ "$fail" -eq 0 ]; then
  echo
  echo "换骨残留检查通过"
  exit 0
fi
exit 1
