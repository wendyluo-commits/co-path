#!/bin/bash
# 在「本机终端」运行此脚本，可避免 EMFILE 导致页面打不开
# 用法: cd 到项目根目录后执行: bash scripts/dev.sh

cd "$(dirname "$0")/.."

# 必须提高「打开文件数」限制，否则 Next 开发服务器会 404
ulimit -n 10240 2>/dev/null || true

# 使用 nvm 的 node（若已安装 nvm）
if [ -s "$HOME/.nvm/nvm.sh" ]; then
  export NVM_DIR="$HOME/.nvm"
  . "$NVM_DIR/nvm.sh"
  nvm use default 2>/dev/null || true
fi

if ! command -v node >/dev/null 2>&1; then
  export PATH="$HOME/.nvm/versions/node/v22.19.0/bin:$PATH"
fi

echo "正在启动开发服务器..."
exec npm run dev
