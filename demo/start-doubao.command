#!/bin/zsh
set -e
trap 'exitCode=$?; if [[ $exitCode -ne 0 ]]; then echo ""; read -k 1 "?启动失败，按任意键关闭此窗口…"; fi' EXIT

SCRIPT_DIR="$(cd -- "$(dirname -- "$0")" && pwd)"
PROJECT_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_DIR"

echo ""
echo "酒店素材工坊 · 豆包 Seedream 图片生成 Demo"
echo ""

KEYCHAIN_SERVICE="hotel-material-studio-doubao"
KEYCHAIN_ACCOUNT="${USER:-$(id -un)}"
MODELCHAIN_SERVICE="hotel-material-studio-doubao-model"
SAVED_ARK_API_KEY="${ARK_API_KEY:-}"
if [[ -z "$SAVED_ARK_API_KEY" ]] && command -v security >/dev/null 2>&1; then
  SAVED_ARK_API_KEY=$(security find-generic-password -a "$KEYCHAIN_ACCOUNT" -s "$KEYCHAIN_SERVICE" -w 2>/dev/null || true)
fi

if [[ -n "$SAVED_ARK_API_KEY" ]]; then
  export ARK_API_KEY="$SAVED_ARK_API_KEY"
  echo "已读取本机钥匙串中的豆包 API Key。"
else
  KEY_PROMPT="请输入火山方舟 API Key（输入时不会显示）。\n\n只粘贴 ark- 开头的 Key 本体，不要包含 Bearer 或引号："
  if command -v osascript >/dev/null 2>&1; then
    ENTERED_ARK_API_KEY=$(osascript -e "display dialog \"$KEY_PROMPT\" default answer \"\" with hidden answer buttons {\"取消\",\"确定\"} default button \"确定\"" -e 'text returned of result' 2>/dev/null) || exit 1
  else
    printf "> "
    read -r -s ENTERED_ARK_API_KEY
    echo ""
  fi
  if [[ -n "$ENTERED_ARK_API_KEY" ]]; then
    export ARK_API_KEY="$ENTERED_ARK_API_KEY"
    if command -v security >/dev/null 2>&1; then
      security add-generic-password -a "$KEYCHAIN_ACCOUNT" -s "$KEYCHAIN_SERVICE" -w "$ENTERED_ARK_API_KEY" -U >/dev/null 2>&1 || true
    fi
  fi
fi

if [[ -z "${ARK_API_KEY:-}" ]]; then
  echo "没有读取到 API Key，模型服务不会启动。"
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
export MODEL_PROVIDER="doubao"
SAVED_DOUBAO_MODEL=""
if command -v security >/dev/null 2>&1; then
  SAVED_DOUBAO_MODEL=$(security find-generic-password -a "$KEYCHAIN_ACCOUNT" -s "$MODELCHAIN_SERVICE" -w 2>/dev/null || true)
fi
export DOUBAO_MODEL="${DOUBAO_MODEL:-${SAVED_DOUBAO_MODEL:-doubao-seedream-5-0-260128}}"

echo "模型服务将启动在 http://127.0.0.1:${MODEL_PORT}/"
(sleep 1; open "http://127.0.0.1:${MODEL_PORT}/") &
exec node demo/server.mjs
