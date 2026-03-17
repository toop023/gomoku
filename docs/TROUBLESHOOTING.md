# 故障排查指南

## 常见问题

### 1. 钱包连接失败

**问题：** 无法连接 Solana Mobile 钱包

**解决方案：**
- 确认手机已安装 Solana 钱包 App
- 检查 app.json 中的 Solana Mobile SDK 配置
- 确认钱包 App 已授权
- 查看控制台错误日志

### 2. 代币转账失败

**问题：** 转账 GOMOKU 代币时报错

**解决方案：**
- 确认 GOMOKU Mint 地址正确
- 检查代币账户是否已创建
- 确认钱包有足够的 SOL 支付手续费
- 检查 RPC 网络是否正常（Devnet/Mainnet）

### 3. AI 思考时间过长

**问题：** 困难难度 AI 计算时间过长

**解决方案：**
- 降低 Minimax 深度（在 AiService.ts 中）
- 优化评估函数
- 限制有效移动范围（只搜索已落子位置周围）

### 4. Supabase 连接失败

**问题：** 无法连接 Supabase

**解决方案：**
- 检查 SUPABASE_URL 和 SUPABASE_KEY 是否正确
- 确认 Supabase 项目处于 Active 状态
- 检查网络连接
- 查看浏览器控制台错误

### 5. 匹配系统不工作

**问题：** 在线匹配无法找到对手

**解决方案：**
- 确认 Supabase Realtime 已启用
- 检查 match_requests 表的权限设置
- 查看实时连接日志
- 确认 status 字段更新正确

### 6. APK 构建失败

**问题：** Android APK 构建失败

**解决方案：**
- 清理构建：`cd android && ./gradlew clean`
- 检查 JDK 版本（需要 JDK 11+）
- 更新 Gradle 版本
- 检查 Android SDK 安装

### 7. 合约部署失败

**问题：** Anchor 合约部署失败

**解决方案：**
- 确认 Anchor 版本兼容
- 检查 Solana CLI 版本
- 确认钱包有足够 SOL（~1.5 SOL）
- 查看详细错误信息

## 调试技巧

### 启用详细日志

```typescript
// 在 App.tsx 中启用
import { enableLogs } from '@solana/mobile';
enableLogs();
```

### 检查交易状态

```typescript
const signature = await wallet.transferToken(to, mint, amount);
const status = await connection.getSignatureStatus(signature);
console.log('交易状态:', status);
```

### Supabase 查询调试

```typescript
const { data, error } = await supabase
  .from('user_profiles')
  .select('*');

if (error) console.error('查询失败:', error.message);
console.log('返回数据:', data);
```

## 性能优化

### 减少重新渲染

使用 `useMemo` 和 `useCallback` 优化：

```typescript
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
const memoizedCallback = useCallback(() => doSomething(a, b), [a, b]);
```

### 优化 AI 计算

限制搜索范围：
```typescript
const validMoves = this.getValidMoves().filter(move =>
  this.isNearExistingPiece(state, move.row, move.col)
);
```

### 图片优化

使用 WebP 格式压缩图标和截图。

## 获取帮助

- Solana 文档: https://docs.solana.com
- Solana Mobile SDK: https://docs.solanamobile.com
- Supabase 文档: https://supabase.com/docs
- React Native 文档: https://reactnative.dev
