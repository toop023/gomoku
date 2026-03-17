# 部署指南

## 1. 部署代币合约到 Devnet

```bash
# 给钱包空投 SOL（如果需要）
solana airdrop 2

# 部署合约
chmod +x scripts/deploy-devnet.sh
./scripts/deploy-devnet.sh
```

## 2. 初始化 GOMOKU 代币

部署脚本会生成 `initialize-mint.ts`，运行它：

```bash
cd scripts
ts-node initialize-mint.ts
```

复制输出的 Mint 地址，更新 `app/src/App.tsx` 中的 `GOMOKU_MINT`。

## 3. 构建 Android APK

```bash
cd app

# 安装依赖（如果还没安装）
npm install

# 启动 Metro
npm start

# 在另一个终端构建 APK
npm run android
```

APK 位置：`app/android/app/build/outputs/apk/debug/app-debug.apk`

## 4. 部署到 Mainnet

### 更新配置
```bash
# 切换到 Mainnet
solana config set --url mainnet-beta
```

### 重新部署
```bash
# 更新 Anchor.toml 中的 cluster
# 然后运行
anchor deploy --provider.cluster mainnet
```

### 安全检查
- [ ] 确认程序 ID 正确
- [ ] 确认 Mint Authority 设置正确
- [ ] 确认代币供应量
- [ ] 确认初始分配

## 5. 提交 dApp Store

### 准备材料
- APK 文件
- 应用图标（512x512）
- 截图（至少 2 张）
- 应用描述
- 隐私政策 URL

### 提交流程
1. 访问 https://dapp.solana-mobile.com
2. 创建开发者账户
3. 填写应用信息
4. 上传 APK 和材料
5. 等待审核

## 注意事项

- Devnet 测试充分后再部署 Mainnet
- 确保 Solana 余额足够（部署需要 ~1.5 SOL）
- 备份程序 ID 和私钥
- 测试所有功能后再提交 dApp Store
