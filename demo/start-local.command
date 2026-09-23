#!/bin/zsh
set -e
trap 'exitCode=$?; if [[ $exitCode -ne 0 ]]; then echo ""; read -k 1 "?启动失败，按任意键关闭此窗口…"; fi' EXIT

SCRIPT_DIR="$(cd -- "$(dirname -- "$0")" && pwd)"
PROJECT_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_DIR"

NODE_BIN="${NODE_BIN:-$(command -v node || true)}"
if [[ -z "$NODE_BIN" ]]; then
  for candidate in /opt/homebrew/bin/node /usr/local/bin/node /usr/bin/node; do
    if [[ -x "$candidate" ]]; then NODE_BIN="$candidate"; break; fi
  done
fi
if [[ -z "$NODE_BIN" ]]; then
  echo "未找到 Node.js，无法启动本地服务。请先安装 Node.js 18 或更高版本。"
  if command -v osascript >/dev/null 2>&1; then osascript -e 'display alert "酒店素材工坊无法启动" message "未找到 Node.js。请安装 Node.js 18 或更高版本后重试。" as critical'; fi
  exit 1
fi

echo ""
echo "酒店素材工坊 · 本地编辑模式"
echo "默认不调用图片模型，不需要 API Key。"
echo "首次使用时在页面右上角「配置 API」输入公司网关 Key；保存一次后会由本机钥匙串自动恢复，付费图片工具会优先调用公司 GPT‑Image。"

LOCAL_PORT=""
for candidate in 4174 4175 4176 4177 4178 4180; do
  if ! lsof -nP -iTCP:"$candidate" -sTCP:LISTEN >/dev/null 2>&1; then
    LOCAL_PORT="$candidate"
    break
  fi
done
if [[ -z "$LOCAL_PORT" ]]; then
  echo "4174-4178、4180 端口都已被占用，请先关闭重复的酒店素材工坊服务后重试。"
  exit 1
fi

export PORT="$LOCAL_PORT"
export MODEL_PROVIDER="company"
echo "本地页面将打开在 http://127.0.0.1:${LOCAL_PORT}/"
(sleep 1; open "http://127.0.0.1:${LOCAL_PORT}/") &
exec "$NODE_BIN" demo/server.mjs
