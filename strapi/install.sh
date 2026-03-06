#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
CMS_DIR="${ROOT_DIR}/cms"
TEMPLATE_DIR="${ROOT_DIR}/template/src"

if ! command -v node >/dev/null 2>&1; then
  echo "[ERROR] Node.js 未安装，请先安装 Node.js 18+。"
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "[ERROR] npm 未安装，请先安装 npm。"
  exit 1
fi

echo "[INFO] 使用 Node: $(node -v)"
echo "[INFO] 使用 npm:  $(npm -v)"

if [ ! -d "$CMS_DIR" ]; then
  echo "[INFO] 未发现 strapi/cms，开始创建 Strapi 项目..."
  (
    cd "$ROOT_DIR"
    CI=true npx create-strapi-app@latest cms --quickstart || {
      echo "[ERROR] 创建 Strapi 失败。若你在内网环境，请配置 npm registry 后重试。"
      exit 1
    }
  )
else
  echo "[INFO] 已存在 strapi/cms，跳过创建步骤。"
fi

if [ ! -d "$CMS_DIR/src" ]; then
  echo "[ERROR] 未找到 $CMS_DIR/src，项目结构异常。"
  exit 1
fi

echo "[INFO] 注入预置内容模型模板..."
cp -R "$TEMPLATE_DIR"/* "$CMS_DIR/src/"

echo "[INFO] 安装完成。"
echo ""
echo "下一步："
echo "1) 启动 Strapi:"
echo "   cd strapi/cms && npm run develop"
echo "2) 在 Strapi 后台配置 Roles 权限（见 strapi/README.md）"
echo "3) 启动前台静态站:"
echo "   python3 -m http.server 4173"
