# 磁盘管理报告（2026-03-11）

## 最终状态

### 磁盘使用

| 项目 | 数值 | 状态 |
|------|------|------|
| 总容量 | 24G | - |
| 已使用 | 17G | - |
| **可用空间** | **5.9G** | 🟢 健康 |
| 使用率 | 74% | 🟢 健康 |

## 清理历史

### 清理前状态

- **总容量：** 24G
- **已使用：** 23G
- **可用空间：** 285M
- **使用率：** 99% 🔴

### 第一次清理（常规）

1. ✅ 清理 `/root/clawd/gomoku/contract/gomoku-token/target`
2. ✅ 清理 `/root/clawd/gomoku/app/node_modules`
3. ✅ 清理 `/root/.npm/_logs/*`
4. ✅ 清理 `/root/.cache/*`
5. ✅ 清理 `/root/.cargo/git/checkouts/*`
6. ✅ 清理 `/tmp/*`
7. ✅ 清理 `/root/.cargo/registry/src/*`
8. ✅ 重复清理 `/root/clawd/gomoku/contract/gomoku-token/programs/gomoku-token/target`

### 第一次清理后

- **使用率：** 82% 🟡
- **可用空间：** 4.1G
- **释放空间：** ~3.8G

### 第二次清理（深度）

发现大文件：
- `/root/.npm` 占用 **1.7G**（npm 全局缓存）

清理操作：
1. ✅ 清理 `/root/.npm`（1.7G）
2. ✅ 清理 `/root/.cargo/registry/index/*`
3. ✅ 清理 `/root/.cargo/git/db/*`

### 第二次清理后

- **使用率：** 74% 🟢（从 99% 降至 74%）
- **可用空间：** 5.9G
- **总释放：** ~6.1G

## 目录占用分析

### 当前占用（清理后）

```
/root: 2.8G
```

**主要占用者：**
- `/root/.cargo`: 243M
- `/root/my-telegram-bot`: 36M
- `/root/clawd`: 1.8M

**已清理的大文件：**
- `/root/.npm`: 1.7G ✅
- `/root/clawd/gomoku/contract/gomoku-token/target`: ~1.4G ✅

## 磁盘使用等级

| 使用率 | 等级 | 状态 |
|---------|--------|------|
| 0-70% | 🟢 健康 | 优秀 |
| 71-85% | 🟡 警告 | 可用 |
| 86-95% | 🟠 危险 | 不足 |
| 96-100% | 🔴 严重 | 即满 |

**当前状态：** 🟢 健康（74%）

## 持续优化建议

### 1. 构建前清理

```bash
cd /root/clawd/gomoku/contract/gomoku-token
rm -rf target
anchor build
```

### 2. 构建后立即清理

```bash
rm -rf /root/clawd/gomoku/contract/gomoku-token/programs/gomoku-token/target
```

### 3. 定期清理全局 npm 缓存

```bash
npm cache clean --force --prefix=/root
rm -rf /root/.npm
```

### 4. 监控磁盘使用

```bash
# 检查磁盘使用
df -h /root

# 查找大目录
du -sh /root | sort -rh | head -10
```

## 清理脚本（增强版）

### 更新后的清理脚本

```bash
#!/bin/bash

echo "=========================================="
echo "磁盘清理脚本（增强版）"
echo "=========================================="
echo ""

echo "1. 清理合约构建产物..."
rm -rf /root/clawd/gomoku/contract/gomoku-token/programs/gomoku-token/target 2>/dev/null && echo "   ✅ 已清理 target 目录" || echo "   ℹ️  target 目录不存在"

echo ""
echo "2. 清理 npm 全局缓存..."
rm -rf /root/.npm 2>/dev/null && echo "   ✅ 已清理 /root/.npm" || echo "   ℹ️  /root/.npm 已为空"

echo ""
echo "3. 清理 npm 项目缓存..."
npm cache clean --force 2>/dev/null && echo "   ✅ 已清理 npm 缓存" || echo "   ℹ️  npm 缓存已为空"

echo ""
echo "4. 清理系统缓存..."
rm -rf /root/.cache/* 2>/dev/null && echo "   ✅ 已清理 /root/.cache" || echo "   ℹ️  /root/.cache 已为空"
rm -rf /tmp/* 2>/dev/null && echo "   ✅ 已清理 /tmp" || echo "   ℹ️  /tmp 已为空"

echo ""
echo "5. 清理 cargo 缓存..."
rm -rf /root/.cargo/registry/src/* 2>/dev/null && echo "   ✅ 已清理 cargo registry" || echo "   ℹ️  cargo registry 已为空"
rm -rf /root/.cargo/git/db/* 2>/dev/null && echo "   ✅ 已清理 cargo git db" || echo "   ℹ️  cargo git db 已为空"

echo ""
echo "=========================================="
echo "磁盘状态"
echo "=========================================="
df -h /root

echo ""
echo "=========================================="
echo "目录占用（前 10 个）"
echo "=========================================="
du -sh /root 2>/dev/null | sort -rh | head -10

echo ""
echo "=========================================="
echo "清理完成！"
echo "=========================================="
echo ""
echo "可用空间：$(df -h /root | tail -1 | awk '{print $4}')"
echo "使用率：$(df -h /root | tail -1 | awk '{print $5}')"
```

### 使用

```bash
chmod +x /root/clawd/cleanup.sh
/root/clawd/cleanup.sh
```

## 总结

### 优化效果

- ✅ 使用率从 99% 降至 74%
- ✅ 释放 ~6.1G 空间
- ✅ 可用空间：5.9G
- ✅ 磁盘状态：健康 🟢

### 部署就绪

✅ **可以安全进行部署**
- 有足够空间重新构建合约（需要 ~2G）
- 有足够空间安装前端依赖（需要 ~500M）
- 建议构建后立即清理 target 目录

## 下一步

### 选项 1：完整部署流程（推荐）

1. 获取 SOL
   - 水龙头：https://faucet.solana.com/
   - 地址：`YTsZpUTaD8YXhSWWokzRjXVf8zPvjvfHsHKudi7scjx`

2. 构建合约
   ```bash
   cd /root/clawd/gomoku/contract/gomoku-token
   export PATH="$HOME/.cargo/bin:$PATH"
   anchor build
   ```

3. 部署到 Devnet
   ```bash
   anchor deploy --provider.cluster devnet
   ```

4. 清理构建产物
   ```bash
   rm -rf /root/clawd/gomoku/contract/gomoku-token/programs/gomoku-token/target
   ```

### 选项 2：仅构建

```bash
cd /root/clawd/gomoku/contract/gomoku-token
export PATH="$HOME/.cargo/bin:$PATH"
anchor build
```

### 选项 3：仅检查状态

```bash
df -h /root
du -sh /root/clawd | sort -rh | head -10
```

### 选项 4：快速清理

```bash
/root/clawd/cleanup.sh
```
