# Supabase 设置指南

## 1. 创建项目

1. 访问 https://supabase.com
2. 点击 "New Project"
3. 填写项目信息：
   - Name: `gomoku-game`
   - Database Password: （设置强密码并保存）
   - Region: 选择最近的区域

## 2. 获取 API 凭证

在项目设置中找到：
- Project URL
- anon public key

复制这两个值到 `app/src/App.tsx`：
```typescript
const SUPABASE_URL = 'your-project-url';
const SUPABASE_KEY = 'your-anon-key';
```

## 3. 创建数据表

在 SQL Editor 中运行以下脚本：

```sql
-- 用户档案表
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

-- 游戏记录表
CREATE TABLE game_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  opponent_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  result VARCHAR(10) CHECK (result IN ('win', 'lose', 'draw')),
  moves INTEGER NOT NULL,
  duration INTEGER NOT NULL,
  mode VARCHAR(10) CHECK (mode IN ('ai', 'local', 'online')),
  difficulty VARCHAR(10),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 匹配请求表
CREATE TABLE match_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  player_wallet VARCHAR(44) NOT NULL,
  mode VARCHAR(10) CHECK (mode IN ('ai', 'local', 'online')),
  difficulty VARCHAR(10),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'matched', 'cancelled')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 每日登录表
CREATE TABLE daily_logins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  login_date DATE NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_game_records_player ON game_records(player_id);
CREATE INDEX idx_game_records_created ON game_records(created_at DESC);
CREATE INDEX idx_match_requests_status ON match_requests(status);
CREATE INDEX idx_daily_logins_user ON daily_logins(user_id);
```

## 4. 启用 Realtime

1. 进入 Database > Replication
2. 启用以下表的 Realtime：
   - match_requests

## 5. Row Level Security (RLS)

为了安全，启用 RLS：

```sql
-- 启用 RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logins ENABLE ROW LEVEL SECURITY;

-- 用户档案：所有人可读，只有自己可写
CREATE POLICY "用户档案：所有人可读" ON user_profiles
  FOR SELECT USING (true);

CREATE POLICY "用户档案：自己可写" ON user_profiles
  FOR UPDATE USING (wallet_address = (SELECT wallet_address FROM user_profiles WHERE id = user_profiles.id));

-- 游戏记录：所有人可读
CREATE POLICY "游戏记录：所有人可读" ON game_records
  FOR SELECT USING (true);

-- 匹配请求：所有人可读写
CREATE POLICY "匹配请求：所有人可读写" ON match_requests
  FOR ALL USING (true);

-- 每日登录：所有人可读写
CREATE POLICY "每日登录：所有人可读写" ON daily_logins
  FOR ALL USING (true);
```

## 6. 测试连接

在 Supabase SQL Editor 中运行：
```sql
SELECT * FROM user_profiles LIMIT 1;
```

如果返回空结果或数据，说明设置成功。

## 故障排查

### 连接失败
- 检查 URL 和 Key 是否正确
- 确认 Supabase 项目处于 Active 状态

### 表不存在
- 检查 SQL 是否执行成功
- 确认表名拼写正确

### Realtime 不工作
- 检查是否启用了表的 Realtime
- 确认 WebSocket 连接正常
