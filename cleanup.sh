#!/bin/bash

# 磁盘清理脚本

set -e

echo "=========================================="
echo "磁盘清理脚本"
echo "=========================================="
echo ""

echo "1. 清理合约构建产物..."
rm -rf /root/clawd/gomoku/contract/gomoku-token/programs/gomoku-token/target 2>/dev/null && echo "   ✅ 已清理 target 目录" || echo "   ℹ️  target 目录不存在"

echo ""
echo "2. 清理 npm 缓存..."
npm cache clean --force 2>/dev/null && echo "   ✅ 已清理 npm 缓存" || echo "   ℹ️  npm 缓存已为空"

echo ""
echo "3. 清理系统缓存..."
rm -rf /root/.cache/* 2>/dev/null && echo "   ✅ 已清理 /root/.cache" || echo "   ℹ️  /root/.cache 已为空"
rm -rf /tmp/* 2>/dev/null && echo "   ✅ 已清理 /tmp" || echo "   ℹ️  /tmp 已为空"

echo ""
echo "4. 清理 cargo 缓存..."
rm -rf /root/.cargo/git/checkouts/* 2>/dev/null && echo "   ✅ 已清理 cargo git checkouts" || echo "   ℹ️  cargo git checkouts 已为空"
rm -rf /root/.cargo/registry/src/* 2>/dev/null && echo "   ✅ 已清理 cargo registry" || echo "   ℹ️  cargo registry 已为空"

echo ""
echo "=========================================="
echo "磁盘状态"
echo "=========================================="
df -h /root

echo ""
echo "=========================================="
echo "目录占用（前 10 个）"
echo "=========================================="
du -sh /root/clawd 2>/dev/null | sort -rh | head -10

echo ""
echo "=========================================="
echo "清理完成！"
echo "=========================================="
echo ""
echo "可用空间：$(df -h /root | tail -1 | awk '{print $4}')"
echo "使用率：$(df -h /root | tail -1 | awk '{print $5}')"
