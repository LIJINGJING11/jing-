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
echo "酒店素材工坊 · 公司 GPT-Image 模型服务"
echo ""
KEYCHAIN_SERVICE="hotel-material-studio-company"
KEYCHAIN_ACCOUNT="${USER:-$(id -un)}"
SAVED_API_GATEWAY_KEY="${API_GATEWAY_KEY:-}"
if [[ -z "$SAVED_API_GATEWAY_KEY" ]] && command -v security >/dev/null 2>&1; then
  SAVED_API_GATEWAY_KEY=$(security find-generic-password -a "$KEYCHAIN_ACCOUNT" -s "$KEYCHAIN_SERVICE" -w 2>/dev/null || true)
fi

if [[ -n "$SAVED_API_GATEWAY_KEY" ]]; then
  export API_GATEWAY_KEY="$SAVED_API_GATEWAY_KEY"
  echo "已读取本机钥匙串中的公司网关密钥。"
else
  KEY_PROMPT="请输入公司 API Gateway Key（输入时不会显示）："
  if command -v osascript >/dev/null 2>&1; then
    ENTERED_API_KEY=$(osascript -e "display dialog \"$KEY_PROMPT\" default answer \"\" with hidden answer buttons {\"取消\",\"确定\"} default button \"确定\"" -e 'text returned of result' 2>/dev/null) || exit 1
  else
    printf "> "
    read -r -s ENTERED_API_KEY
    echo ""
  fi
  if [[ -n "$ENTERED_API_KEY" ]]; then
    export API_GATEWAY_KEY="$ENTERED_API_KEY"
    if command -v security >/dev/null 2>&1; then
      security add-generic-password -a "$KEYCHAIN_ACCOUNT" -s "$KEYCHAIN_SERVICE" -w "$ENTERED_API_KEY" -U >/dev/null 2>&1 || true
    fi
  fi
fi
if [[ -z "${API_GATEWAY_KEY:-}" ]]; then
  echo "没有读取到公司网关密钥，模型服务不会启动。"
  exit 1
fi

MODEL_PORT=""
for candidate in 4174 4175 4176 4177 4178 4180; do
  if ! lsof -nP -iTCP:"$candidate" -sTCP:LISTEN >/dev/null 2>&1; then
    MODEL_PORT="$candidate"
    break
  fi
done
if [[ -z "$MODEL_PORT" ]]; then
  echo "4174-4178、4180 端口都已被占用，请先关闭重复的酒店素材工坊服务后重试。"
  exit 1
fi
export PORT="$MODEL_PORT"
export MODEL_PROVIDER="company"

echo "模型服务将启动在 http://127.0.0.1:${MODEL_PORT}/"
(sleep 1; open "http://127.0.0.1:${MODEL_PORT}/") &
exec "$NODE_BIN" demo/server.mjs
