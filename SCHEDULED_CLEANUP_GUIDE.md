# 磁盘定时清理脚本使用说明

## 脚本位置

`/root/clawd/scheduled-cleanup.sh`

## 功能

✅ 自动清理磁盘空间
✅ 生成详细日志
✅ 显示磁盘状态
✅ 磁盘使用率警报（>85%）

## 清理内容

1. **合约构建产物**
   - 清理 `/root/clawd/gomoku/contract/gomoku-token/programs/gomoku-token/target`

2. **npm 缓存**
   - 清理 `/root/.npm` 全局缓存
   - 清理 `/root/clawd/gomoku/app/node_modules`

3. **系统缓存**
   - 清理 `/root/.cache`
   - 清理 `/tmp`

4. **Cargo 缓存**
   - 清理 `/root/.cargo/git/checkouts`
   - 清理 `/root/.cargo/registry/src`
   - 清理 `/root/.cargo/git/db`
   - 清理 `/root/.cargo/registry/index`

5. **旧日志**
   - 保留最近 7 天
   - 自动删除更早的日志

## 日志

- **日志文件：** `/root/clawd/logs/disk-cleanup.log`
- **日志保留：** 7 天
- **格式：** `[YYYY-MM-DD HH:MM:SS] [LEVEL] message`

## 手动执行

```bash
/root/clawd/scheduled-cleanup.sh
```

## Cron 定时任务配置

### 方法 1：每日清理（推荐）

```bash
crontab -e
```

然后添加：

```cron
0 2 * * * /root/clawd/scheduled-cleanup.sh >> /root/clawd/logs/scheduled-cleanup.log 2>&1
```

这将在每天凌晨 2 点执行清理。

### 方法 2：每 6 小时清理

```cron
0 */6 * * * /root/clawd/scheduled-cleanup.sh >> /root/clawd/logs/scheduled-cleanup.log 2>&1
```

### 方法 3：每周清理

```cron
0 3 * * 0 /root/clawd/scheduled-cleanup.sh >> /root/clawd/logs/scheduled-cleanup.log 2>&1
```

每周一凌晨 3 点执行。

## Cron 格式说明

```
.---------------- minute (0 - 59)
|  .------------- hour (0 - 23)
|  |  .---------- day of month (1 - 31)
|  |  |  .------- month (1 - 12)
|  |  |  | .---- day of week (0 - 6) (0 = Sunday)
```

## 配置步骤

### 1. 编辑 crontab

```bash
crontab -e
```

### 2. 添加定时任务

复制上面任一行的配置到编辑器中。

### 3. 保存并退出

编辑器会自动保存 crontab。

### 4. 验证定时任务

```bash
# 查看已安装的任务
crontab -l

# 查看 cron 日志
tail -f /var/log/syslog | grep CRON
```

## 管理命令

### 查看定时任务

```bash
crontab -l
```

### 删除定时任务

```bash
crontab -r
```

### 编辑定时任务

```bash
crontab -e
```

## 日志查看

### 查看清理日志

```bash
tail -f /root/clawd/logs/disk-cleanup.log
```

### 查看定时任务日志

```bash
tail -f /root/clawd/logs/scheduled-cleanup.log
```

## 磁盘警报

脚本会自动检测磁盘使用率：

| 使用率 | 等级 | 警报 |
|---------|------|------|
| 0-85% | 🟢 健康 | 无 |
| 86-90% | 🟡 警告 | 输出 ⚠️ |
| 91-95% | 🟠 危险 | 输出 ⚠️ |
| 96-100% | 🔴 严重 | 输出 ⚠️ |

当磁盘使用率超过 85% 时，脚本会输出警告。

## 推荐配置

### 方案 1：每日清理（推荐）

```cron
0 2 * * * /root/clawd/scheduled-cleanup.sh >> /root/clawd/logs/scheduled-cleanup.log 2>&1
```

- **频率：** 每天凌晨 2 点
- **优点：** 避免影响白天操作
- **适用：** 长时间运行的机器

### 方案 2：每 6 小时清理

```cron
0 */6 * * * /root/clawd/scheduled-cleanup.sh >> /root/clawd/logs/scheduled-cleanup.log 2>&1
```

- **频率：** 每 6 小时（00:00, 06:00, 12:00, 18:00）
- **优点：** 更频繁清理，保持磁盘清洁
- **适用：** 磁盘空间紧张的环境

### 方案 3：仅磁盘检查

如果不想自动清理，可以改为只检查磁盘使用：

修改脚本，注释掉所有清理函数，只保留 `show_disk_status` 和 `check_disk_alert`

## 注意事项

1. **权限**
   - 确保脚本有可执行权限：
     ```bash
     chmod +x /root/clawd/scheduled-cleanup.sh
     ```

2. **日志目录**
   - 脚本会自动创建 `/root/clawd/logs/` 目录
   - 确保该目录有写权限

3. **时间选择**
   - 选择磁盘使用率低的时间段
   - 避免在业务高峰期执行

4. **测试**
   - 配置后手动执行一次测试：
     ```bash
     /root/clawd/scheduled-cleanup.sh
     ```

5. **日志监控**
   - 定期查看日志：
     ```bash
     tail -f /root/clawd/logs/disk-cleanup.log
     ```

## 故障排查

### 脚本未执行

1. 检查 crontab 服务：
   ```bash
   systemctl status cron
   ```

2. 查看系统日志：
   ```bash
   tail -f /var/log/syslog | grep CRON
   ```

3. 手动执行测试：
   ```bash
   /root/clawd/scheduled-cleanup.sh
   ```

### 日志无输出

1. 检查脚本权限：
   ```bash
   ls -l /root/clawd/scheduled-cleanup.sh
   ```

2. 检查日志文件：
   ```bash
   ls -l /root/clawd/logs/disk-cleanup.log
   ```

3. 手动执行并查看输出：
   ```bash
   /root/clawd/scheduled-cleanup.sh
   tail /f /root/clawd/logs/disk-cleanup.log
   ```

## 文件清单

- ✅ 定时清理脚本：`/root/clawd/scheduled-cleanup.sh`
- ✅ Cron 配置示例：`/root/clawd/cron-examples.txt`
- ✅ 手动清理脚本：`/root/clawd/cleanup.sh`
- ✅ 磁盘管理报告：`/root/clawd/gomoku/FINAL_DISK_CLEANUP_REPORT.md`

## 快速开始

### 1. 测试脚本

```bash
/root/clawd/scheduled-cleanup.sh
```

### 2. 配置定时任务（选择一种）

```bash
# 方法 1：每日清理
crontab -e
# 然后添加：
# 0 2 * * * /root/clawd/scheduled-cleanup.sh >> /root/clawd/logs/scheduled-cleanup.log 2>&1

# 方法 2：每 6 小时
crontab -e
# 然后添加：
# 0 */6 * * * /root/clawd/scheduled-cleanup.sh >> /root/clawd/logs/scheduled-cleanup.log 2>&1
```

### 3. 验证配置

```bash
crontab -l
```

---

需要我帮你配置定时任务吗？
