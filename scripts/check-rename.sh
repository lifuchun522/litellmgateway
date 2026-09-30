#!/usr/bin/env bash
# scripts/check-rename.sh —— 换骨残留扫描：确认全仓已无旧标识符。
#
# 用法：./scripts/check-rename.sh
# 退出码：0 = 无残留；1 = 仍有残留（逐条打印命中位置）。
#
# 检查三类字符串（第 02 境点名最容易翻车的三处）：
#   1) 旧包名 com.qvsu
#   2) 旧配置前缀 qvsu:（yml 顶层）与 @ConfigurationProperties(prefix = "qvsu")
#   3) 旧品牌与旧产物名 qvsu-openapi.jar / qvsu-openapi（Maven 坐标与模块目录除外）
set -euo pipefail

OLD_PKG="com.qvsu"
OLD_PREFIX="qvsu"
fail=0

# 排除项：
#   .git / target / .reverse-work*  —— 构建与隔离目录
#   open-api.zip                    —— 0 号基线压缩包，必须原样保留（哈希是锚点）
#   docs/                           —— 第 01 境的逆向产物记录的是换骨前的路径，属于历史证据
#   openspec/changes/               —— 历史变更记录
#   scripts/                        —— 本脚本自己就要写旧包名
EXCLUDES=(--exclude-dir=.git --exclude-dir=target --exclude-dir=.reverse-work --exclude-dir=.reverse-work2
          --exclude-dir=docs --exclude-dir=openspec --exclude-dir=.smoke-out
          --exclude=open-api.zip --exclude=check-rename.sh)

echo "== 1/3 扫描旧包名 $OLD_PKG =="
if grep -rn "$OLD_PKG" . "${EXCLUDES[@]}" \
     --include="*.java" --include="*.xml" --include="*.yml" --include="*.yaml" \
     --include="*.properties" --include="*.html" --include="*.js" --include="*.sh" --include="*.ps1"; then
  echo "换骨未完成：仍存在旧包名引用" >&2
  fail=1
else
  echo "  无残留"
fi

echo "== 2/3 扫描旧配置前缀 ${OLD_PREFIX}: =="
if grep -rn "^${OLD_PREFIX}:" . "${EXCLUDES[@]}" --include="*.yml" --include="*.yaml"; then
  echo "换骨未完成：仍存在旧配置前缀" >&2
  fail=1
else
  echo "  无残留"
fi

echo "== 3/3 扫描旧标识串（制品名/镜像名/容器名）=="
if grep -rn "qvsu-openapi\.jar\|openapi-app\|qvsu_open_api" . "${EXCLUDES[@]}" \
     --include="*.yml" --include="*.yaml" --include="Dockerfile*" --include="*.md"; then
  echo "换骨未完成：仍存在旧制品/镜像标识" >&2
  fail=1
else
  echo "  无残留"
fi

# 模块目录名与 Maven 坐标里的旧串是**有意保留**的：
#   open-api/qvsu-openapi/           第 02 境明确不拆模块、不改目录结构
#   open-api/sql/qvsu.sql 等         —— 历史 SQL 文件名，改文件名会破坏已有环境的初始化记录
echo
echo "说明：模块目录名 open-api/qvsu-openapi 与历史 SQL 文件名属有意保留（不拆模块）。"

if [ "$fail" -eq 0 ]; then
  echo "换骨残留检查通过"
  exit 0
fi
exit 1
