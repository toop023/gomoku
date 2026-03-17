# 环境安装指南

## 前置要求

### Node.js 和 npm
```bash
# 安装 Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证
node --version
npm --version
```

### Rust 和 Cargo
```bash
# 安装 Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# 验证
rustc --version
cargo --version
```

### Solana CLI
```bash
# 安装 Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# 配置环境
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"

# 验证
solana --version
```

### Anchor
```bash
# 安装 Anchor
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest

# 验证
anchor --version
```

### React Native
```bash
# 安装 React Native CLI
npm install -g react-native-cli

# Android 开发 (需要 JDK 11+)
sudo apt-get install -y openjdk-11-jdk
```

## 项目依赖安装

### 前端依赖
```bash
cd app
npm install
```

### 合约依赖
```bash
cd contract/gomoku-token
anchor build
```

## Supabase 配置

1. 访问 https://supabase.com
2. 创建新项目
3. 获取 URL 和 API Key
4. 创建以下表：

```sql
-- 用户档案
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) NOT NULL,
  wallet_address VARCHAR(44) UNIQUE NOT NULL,
  gomoku_balance DECIMAL(18, 0) DEFAULT 100,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  win_rate DECIMAL(5, 2) DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 游戏记录
CREATE TABLE game_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES user_profiles(id),
  opponent_id UUID REFERENCES user_profiles(id),
  result VARCHAR(10) CHECK (result IN ('win', 'lose', 'draw')),
  moves INTEGER,
  duration INTEGER,
  mode VARCHAR(10) CHECK (mode IN ('ai', 'local', 'online')),
  difficulty VARCHAR(10),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 匹配请求
CREATE TABLE match_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES user_profiles(id),
  player_wallet VARCHAR(44),
  mode VARCHAR(10),
  difficulty VARCHAR(10),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 每日登录
CREATE TABLE daily_logins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  login_date DATE UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

5. 启用 Realtime（用于匹配系统）
6. 在 `app/src/App.tsx` 中填写 `SUPABASE_URL` 和 `SUPABASE_KEY`

## 完成检查

- [ ] Node.js 18+ 安装
- [ ] Rust 和 Cargo 安装
- [ ] Solana CLI 安装并配置 Devnet
- [ ] Anchor 安装
- [ ] React Native CLI 安装
- [ ] 前端依赖安装完成
- [ ] 合约依赖安装完成
- [ ] Supabase 项目创建并配置
- [ ] 数据表创建完成
