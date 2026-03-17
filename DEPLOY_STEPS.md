# 五子云 - 合约部署步骤

## 前置条件

1. **获取 Devnet SOL**
   - 钱包地址：`YTsZpUTaD8YXhSWWokzRjXVf8zPvjvfHsHKudi7scjx`
   - 方法 1：CLI 空投（等待速率限制解除）
     ```bash
     solana airdrop 2
     ```

   - 方法 2：使用水龙头网站
     - 访问：https://faucet.solana.com/
     - 输入钱包地址获取 SOL

2. **确认余额**
   ```bash
   solana balance
   ```

## 部署步骤

### 1. 部署合约到 Devnet

```bash
cd /root/clawd/gomoku/contract/gomoku-token
export PATH="$HOME/.cargo/bin:$PATH"
anchor deploy --provider.cluster devnet
```

### 2. 验证部署

```bash
solana program show 7gGBuvUkhiGL441hK3zYioTHRTNUG9mkMiohX6EHdFFK
```

预期输出：
```
Program Id: 7gGBuvUkhiGL441hK3zYioTHRTNUG9mkMiohX6EHdFFK
Owner: YTsZpUTaD8YXhSWWokzRjXVf8zPvjvfHsHKudi7scjx
ProgramData Address: xxx
Authority: xxx
Last Deployed Slot: xxx
Data Length: xxx
```

### 3. 记录程序 ID

复制以下信息到 `app/src/App.tsx`：

```typescript
const GOMOKU_MINT = '你的_mint_地址';
const GOMOKU_PROGRAM_ID = '7gGBuvUkhiGL441hK3zYioTHRTNUG9mkMiohX6EHdFFK';
```

### 4. 配置 Supabase

参考 `docs/SUPABASE_SETUP.md`：

1. 创建 Supabase 项目
2. 创建数据表（运行 SQL）
3. 获取 URL 和 Key
4. 更新 `app/src/App.tsx` 中的配置

### 5. 测试应用

```bash
cd /root/clawd/gomoku/app
npm install
npm start
npm run android
```

## 文件位置

- **合约 .so 文件：** `/root/clawd/gomoku/contract/gomoku-token/target/deploy/gomoku_token.so`
- **密钥对文件：** `/root/clawd/gomoku/contract/gomoku-token/target/deploy/gomoku_token-keypair.json`
- **程序 ID：** `7gGBuvUkhiGL441hK3zYioTHRTNUG9mkMiohX6EHdFFK`

## 已完成

- ✅ Rust 安装
- ✅ Anchor 安装
- ✅ 合约编译
- ✅ .so 文件生成
- ⏳ 获取 Devnet SOL
- ⏳ 部署到 Devnet
- ⏳ 配置 Supabase
- ⏳ 测试应用
