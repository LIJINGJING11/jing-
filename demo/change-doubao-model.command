#!/bin/zsh
set -e

SCRIPT_DIR="$(cd -- "$(dirname -- "$0")" && pwd)"
PROJECT_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
KEYCHAIN_SERVICE="hotel-material-studio-doubao"
KEYCHAIN_ACCOUNT="${USER:-$(id -un)}"
MODELCHAIN_SERVICE="hotel-material-studio-doubao-model"
cd "$PROJECT_DIR"

MODEL_CHOICE=""
if command -v osascript >/dev/null 2>&1; then
  MODEL_CHOICE=$(osascript <<'APPLESCRIPT'
set modelItems to {"Seedream 5.0 标准版", "Seedream 4.5", "Seedream 4.0", "Seedream 5.0 Pro"}
set picked to choose from list modelItems with prompt "选择酒店素材工坊使用的图片模型：" default items {item 1 of modelItems} OK button name "切换并启动" cancel button name "取消"
if picked is false then error number -128
return item 1 of picked
APPLESCRIPT
  )
else
  echo "1) Seedream 5.0 标准版"
  echo "2) Seedream 4.5"
  echo "3) Seedream 4.0"
  echo "4) Seedream 5.0 Pro"
  printf "请选择模型（1-4）： "
  read -r model_number
  case "$model_number" in
    1) MODEL_CHOICE="Seedream 5.0 标准版";;
    2) MODEL_CHOICE="Seedream 4.5";;
    3) MODEL_CHOICE="Seedream 4.0";;
    4) MODEL_CHOICE="Seedream 5.0 Pro";;
    *) echo "没有选择有效模型。"; exit 1;;
  esac
fi

case "$MODEL_CHOICE" in
  *"5.0 标准"*) DOUBAO_MODEL="doubao-seedream-5-0-260128";;
  *"4.5"*) DOUBAO_MODEL="doubao-seedream-4-5-251128";;
  *"4.0"*) DOUBAO_MODEL="doubao-seedream-4-0-250828";;
  *"5.0 Pro"*) DOUBAO_MODEL="doubao-seedream-5-0-pro-260628";;
  *) echo "没有识别到模型选择。"; exit 1;;
esac

security add-generic-password -a "$KEYCHAIN_ACCOUNT" -s "$MODELCHAIN_SERVICE" -w "$DOUBAO_MODEL" -U >/dev/null 2>&1 || true

ARK_API_KEY="${ARK_API_KEY:-}"
if [[ -z "$ARK_API_KEY" ]] && command -v security >/dev/null 2>&1; then
  ARK_API_KEY=$(security find-generic-password -a "$KEYCHAIN_ACCOUNT" -s "$KEYCHAIN_SERVICE" -w 2>/dev/null || true)
fi
if [[ -z "$ARK_API_KEY" ]]; then
  if command -v osascript >/dev/null 2>&1; then
    ARK_API_KEY=$(osascript -e 'display dialog "请输入火山方舟 API Key（输入时不会显示）：" default answer "" with hidden answer buttons {"取消","保存并启动"} default button "保存并启动"' -e 'text returned of result' 2>/dev/null) || exit 1
  else
    printf "请输入火山方舟 API Key： "
    read -r -s ARK_API_KEY
    echo ""
  fi
  if [[ -z "$ARK_API_KEY" ]]; then echo "没有输入 API Key。"; exit 1; fi
  security add-generic-password -a "$KEYCHAIN_ACCOUNT" -s "$KEYCHAIN_SERVICE" -w "$ARK_API_KEY" -U >/dev/null 2>&1 || true
fi

MODEL_PORT=""
for candidate in 4174 4175 4176 4177 4178 4179 4180; do
  if ! lsof -nP -iTCP:"$candidate" -sTCP:LISTEN >/dev/null 2>&1; then
    MODEL_PORT="$candidate"
    break
  fi
done
if [[ -z "$MODEL_PORT" ]]; then
  echo "4174-4180 端口都已被占用，请先关闭重复的模型服务。"
  exit 1
fi

echo "正在启动：$DOUBAO_MODEL"
PORT="$MODEL_PORT" MODEL_PROVIDER=doubao DOUBAO_MODEL="$DOUBAO_MODEL" ARK_API_KEY="$ARK_API_KEY" nohup node demo/server.mjs >"/tmp/hotel-material-studio-doubao-$MODEL_PORT.log" 2>&1 &
(sleep 1; open "http://127.0.0.1:${MODEL_PORT}/") >/dev/null 2>&1 &
echo "模型服务已启动：http://127.0.0.1:${MODEL_PORT}/"
