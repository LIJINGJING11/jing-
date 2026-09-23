#!/bin/zsh
set -e
trap 'exitCode=$?; if [[ $exitCode -ne 0 ]]; then echo ""; read -k 1 "?保存失败，按任意键关闭此窗口…"; fi' EXIT

SCRIPT_DIR="$(cd -- "$(dirname -- "$0")" && pwd)"
PROJECT_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
KEYCHAIN_SERVICE="hotel-material-studio-doubao"
KEYCHAIN_ACCOUNT="${USER:-$(id -un)}"
cd "$PROJECT_DIR"

KEY_PROMPT="请输入新的火山方舟 API Key（输入时不会显示）。\n\n只粘贴 ark- 开头的 Key 本体，不要包含 Bearer 或引号："
if command -v osascript >/dev/null 2>&1; then
  ENTERED_ARK_API_KEY=$(osascript -e "display dialog \"$KEY_PROMPT\" default answer \"\" with hidden answer buttons {\"取消\",\"保存并启动\"} default button \"保存并启动\"" -e 'text returned of result' 2>/dev/null) || exit 1
else
  printf "> "
  read -r -s ENTERED_ARK_API_KEY
  echo ""
fi

if [[ -z "$ENTERED_ARK_API_KEY" ]]; then
  echo "没有输入新的 API Key，未做修改。"
  exit 1
fi

if command -v security >/dev/null 2>&1; then
  security add-generic-password -a "$KEYCHAIN_ACCOUNT" -s "$KEYCHAIN_SERVICE" -w "$ENTERED_ARK_API_KEY" -U >/dev/null 2>&1 || true
fi
export ARK_API_KEY="$ENTERED_ARK_API_KEY"
echo "新的 API Key 已保存，正在启动模型服务…"
exec "$PROJECT_DIR/demo/start-doubao.command"
