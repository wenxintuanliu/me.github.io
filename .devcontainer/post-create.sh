#!/usr/bin/env bash

# 确保脚本在错误时退出
set -e

# 安装 Node.js 和 npm
if [ -f package.json ]; then
  echo "Installing Node.js and npm..."
  bash -i -c "nvm install --lts && nvm install-latest-npm"
  npm i
  npm run build
fi

# 安装 shfmt
echo "Installing shfmt..."
curl -sS https://webi.sh/shfmt | sh &>/dev/null
if ! command -v shfmt > /dev/null; then
  echo "Error: shfmt installation failed."
  exit 1
fi

# 安装 Oh My Zsh 插件
echo "Installing Oh My Zsh plugins..."
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ~/.oh-my-zsh/custom/plugins/zsh-syntax-highlighting
git clone https://github.com/zsh-users/zsh-autosuggestions.git ~/.oh-my-zsh/custom/plugins/zsh-autosuggestions

# 添加插件到 .zshrc
if ! grep -q "zsh-syntax-highlighting" ~/.zshrc; then
  sed -i -E "s/^(plugins=\()(git)(\))/\1\2 zsh-syntax-highlighting zsh-autosuggestions\3/" ~/.zshrc
fi

# 配置 zsh 以避免使用 less 查看 git log 输出
echo -e "\nunset LESS" >>~/.zshrc

echo "Setup completed successfully."
