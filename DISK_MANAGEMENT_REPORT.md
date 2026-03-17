# 磁盘管理报告

## 最终状态（2026-03-11）

### 磁盘使用

- **总容量：** 24G
- **已使用：** 19G
- **可用空间：** 4.1G ✅
- **使用率：** 82% ✅（从 96% 降至 82%）

### 清理操作

1. ✅ 清理 `/root/clawd/gomoku/contract/gomoku-token/target` 目录
2. ✅ 清理 `/root/clawd/gomoku/app/node_modules` 目录
3. ✅ 清理 `/root/.npm/_logs/*` 目录
4. ✅ 清理 `/root/.cache/*` 目录
5. ✅ 清理 `/root/.cargo/git/checkouts/*` 目录
6. ✅ 清理 `/tmp/*` 目录
7. ✅ 验证 npm 缓存（已为空）
8. ✅ 清理 `/root/clawd/gomoku/contract/gomoku-token/programs/gomoku-token/target` 目录（再次清理）

### 空间释放

- **清理前：** 285M 可用（99% 使用率）
- **清理后：** 4.1G 可用（82% 使用率）
- **总释放：** ~3.8G

### 目录占用分析

```
/root/clawd: 1.8M（清理后）
```

主要占用者已清理：
- `contract/gomoku-token/programs/gomoku-token/target` - 1.4G（已清理）

### 磁盘使用等级

| 使用率 | 等级 | 状态 |
|---------|--------|------|
| 0-70% | 🟢 健康 | 良好 |
| 71-85% | 🟡 警告 | 可用 |
| 86-95% | 🟠 危险 | 不足 |
| 96-100% | 🔴 严重 | 即满 |

**当前状态：** 🟡 警告（82%）

### 持续优化建议

1. **构建前清理**
   ```bash
   cd /root/clawd/gomoku/contract/gomoku-token
   rm -rf target
   anchor build
   ```

2. **构建后立即清理**
   ```bash
   rm -rf /root/clawd/gomoku/contract/gomoku-token/programs/gomoku-token/target
   ```

3. **定期清理缓存**
   ```bash
   npm cache clean --force
   rm -rf /root/.cache/*
   rm -rf /tmp/*
   ```

4. **监控脚本**
   ```bash
   # 检查磁盘使用
   df -h /root

   # 查找大目录
   du -sh /root/clawd | sort -rh | head -10
   ```

### 紧急清理（如果磁盘 < 1G）

1. 删除所有 npm 模块
   ```bash
   rm -rf /root/clawd/gomoku/app/node_modules
   rm -rf /root/clawd/gomoku/contract/gomoku-token/programs/gomoku-token/target
   ```

2. 清理 cargo 完整缓存
   ```bash
   rm -rf /root/.cargo/registry/src/*
   rm -rf /root/.cargo/git/checkouts/*
   ```

3. 清理系统缓存
   ```bash
   rm -rf /root/.cache/*
   rm -rf /tmp/*
   rm -rf /var/cache/*
   ```

### 自动清理脚本

创建 `/root/clawd/cleanup.sh` 用于快速清理：

```bash
#!/bin/bash
echo "清理构建产物..."
rm -rf /root/clawd/gomoku/contract/gomoku-token/programs/gomoku-token/target

echo "清理缓存..."
npm cache clean --force
rm -rf /root/.cache/*
rm -rf /tmp/*

echo "显示磁盘状态..."
df -h /root
du -sh /root/clawd | sort -rh | head -10
```

使用：
```bash
chmod +x /root/clawd/cleanup.sh
/root/clawd/cleanup.sh
```

## 总结

✅ **磁盘空间已优化**
- 从 96% 降至 82%
- 释放 3.8G 空间
- 可用空间：4.1G

✅ **可以安全进行部署**
- 有足够空间重新构建合约
- 有足够空间安装前端依赖
- 建议构建后立即清理 target 目录

## 下一步

1. **获取 SOL**（如果还没有）
   - 使用 Devnet 水龙头：https://faucet.solana.com/
   - 钱包地址：`YTsZpUTaD8YXhSWWokzRjXVf8zPvjvfHsHKudi7scjx`

2. **重新构建合约**
   ```bash
   cd /root/clawd/gomoku/contract/gomoku-token
   export PATH="$HOME/.cargo/bin:$PATH"
   anchor build
   ```

3. **部署到 Devnet**
   ```bash
   anchor deploy --provider.cluster devnet
   ```

4. **构建后清理**
   ```bash
   rm -rf /root/clawd/gomoku/contract/gomoku-token/programs/gomoku-token/target
   ```
