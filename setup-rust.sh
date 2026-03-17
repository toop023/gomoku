#!/bin/bash

# Rust 环境配置脚本

echo "配置 Rust 环境变量..."

# 检查 shell 类型
if [ -n "$ZSH_VERSION" ]; then
    SHELL_RC="$HOME/.zshrc"
elif [ -n "$BASH_VERSION" ]; then
    SHELL_RC="$HOME/.bashrc"
else
    SHELL_RC="$HOME/.profile"
fi

echo "Shell 配置文件: $SHELL_RC"

# 添加 Rust 到 PATH
if ! grep -q 'cargo/bin' "$SHELL_RC"; then
    echo "" >> "$SHELL_RC"
    echo "# Rust" >> "$SHELL_RC"
    echo 'export PATH="$HOME/.cargo/bin:$PATH"' >> "$SHELL_RC"
    echo "已添加到 $SHELL_RC"
else
    echo "Rust 环境变量已配置"
fi

# 立即生效
export PATH="$HOME/.cargo/bin:$PATH"

# 验证安装
echo ""
echo "验证安装："
echo "Rust 版本: $(rustc --version 2>/dev/null || echo '未找到')"
echo "Cargo 版本: $(cargo --version 2>/dev/null || echo '未找到')"
echo "Anchor 版本: $(anchor --version 2>/dev/null || echo '未找到')"

echo ""
echo "配置完成！"
echo "请运行: source $SHELL_RC"
