#!/usr/bin/env bash
# docs/reverse/scan.sh 的仓库位置：scripts/reverse/scan.sh
# 只读扫描 open-api.zip，不改任何源码；产物落在 docs/reverse/scan-output/（不落隔离工作目录，避免重复解压）
set -euo pipefail

ZIP=${1:-open-api.zip}
OUT=${2:-docs/reverse/scan-output}
WORK=${3:-.reverse-work}

mkdir -p "$OUT"
rm -rf "$WORK"
mkdir -p "$WORK"
unzip -q "$ZIP" -d "$WORK"

# 1. 冻结压缩包指纹：这是 0 号基线的锚点
if command -v sha256sum >/dev/null 2>&1; then
  sha256sum "$ZIP" | awk '{print $1}' > "$OUT/zip.sha256"
else
  shasum -a 256 "$ZIP" | awk '{print $1}' > "$OUT/zip.sha256"
fi

# 2. 定位真实项目根（zip 常常多套一层目录）
POM=$(find "$WORK" -name pom.xml -print -quit)
if [ -z "$POM" ]; then
  echo "未找到 pom.xml，无法定位项目根" >&2
  exit 1
fi
ROOT=$(dirname "$POM")
ROOTREL=$(cd "$ROOT" && pwd | sed "s|^$(cd "$WORK" && pwd)/||")
echo "$ROOTREL" > "$OUT/root.txt"

# 3. 根包名与包分布
grep -rhoE '^package[[:space:]]+[a-zA-Z0-9_.]+' "$ROOT/src" \
  | awk '{print $2}' | sort | uniq -c | sort -rn > "$OUT/packages.txt"

# 4. 接口清单（Controller 注解候选，人工再筛）
grep -rn --include='*.java' \
  -E '@(RestController|Controller|RequestMapping|GetMapping|PostMapping|PutMapping|DeleteMapping)' \
  "$ROOT/src" | sed "s|^$ROOT/||" > "$OUT/endpoints.raw.txt"

# 5. 外部依赖（Spring Boot 项目走 Maven 依赖树更准；离线失败不阻断扫描）
if ! (cd "$ROOT" && mvn -q -o dependency:tree -DoutputFile="$OUT/dependency-tree.txt" -DappendOutput=false >/dev/null 2>&1); then
  (cd "$ROOT" && mvn -q dependency:tree -DoutputFile="$OUT/dependency-tree.txt" -DappendOutput=false >/dev/null 2>&1) \
    || echo "（依赖树未取到：需要联网或本地仓库缓存）" > "$OUT/dependency-tree.txt"
fi

# 6. 配置文件、SQL、容器化资产清单（排除构建产物与扫描产物，否则清单会被副本灌水）
#    注意：SQL 与容器化脚本常在项目根之外一层（open-api/sql、open-api/deploy），因此用 PARENT 兜住。
PARENT=$(cd "$ROOT/.." && pwd)
find "$PARENT" \
  \( -name target -o -name node_modules -o -name .git -o -name scan-output \) -prune -o \
  \( -name 'application*.y*ml' -o -name 'application*.properties' \
     -o -name '*.sql' -o -name 'Dockerfile*' -o -name 'docker-compose*.y*ml' \) \
  -print | sed "s|^$PARENT/||" | sort > "$OUT/assets.txt"

# 7. 源码规模（判断复用与废弃的依据之一）
find "$ROOT/src/main/java" -name '*.java' | wc -l | tr -d ' ' > "$OUT/java-file-count.txt"
find "$ROOT/src/main/resources/templates" -name '*.html' 2>/dev/null | wc -l | tr -d ' ' \
  > "$OUT/template-count.txt"

# 产物完整性校验：缺失或为空即失败
for f in zip.sha256 root.txt packages.txt endpoints.raw.txt assets.txt java-file-count.txt template-count.txt; do
  if [ ! -s "$OUT/$f" ]; then
    echo "产物缺失或为空：$OUT/$f" >&2
    exit 1
  fi
done

echo "== scan done =="
echo "zip.sha256    : $(cat "$OUT/zip.sha256")"
echo "root          : $(cat "$OUT/root.txt")"
echo "java files    : $(cat "$OUT/java-file-count.txt")"
echo "templates     : $(cat "$OUT/template-count.txt")"
echo "endpoint cands: $(wc -l < "$OUT/endpoints.raw.txt")"
echo "assets        : $(wc -l < "$OUT/assets.txt")"
