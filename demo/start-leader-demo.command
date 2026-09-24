#!/bin/zsh
# 酒店素材工坊 · 领导演示一键启动
# API Key 只从本机钥匙串读取；没有 Key 时由现有启动器弹窗输入，绝不写入项目目录。
set -e

SCRIPT_DIR="$(cd -- "$(dirname -- "$0")" && pwd)"
exec "$SCRIPT_DIR/start-gpt-image.command"
