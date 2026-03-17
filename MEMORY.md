# MEMORY.md - Long-term Memory

## 2026-03-10

### 项目 2: 五子云 (Five Cloud) - Solana Mobile 五子棋游戏

**项目定位：**
- 基于 SEEKER 手机开发的五子棋对战游戏
- 技术栈：React Native + TypeScript + Solana Web3
- 支持在线对战、AI 对手、本地双人

**核心功能：**
✅ 15x15 棋盘（标准五子连珠）
✅ 在线对战（匹配系统）
✅ 本地 AI（3 个难度：简单/中等/困难）
✅ 本地双人
✅ 排行榜
✅ 代币奖励（$GOMOKU）

**代币经济：**
- 胜利：+10 $GOMOKU
- 失败：-2 $GOMOKU
- 连胜奖励：额外 +5/10/15

**技术实现：**

前端：
- ✅ 游戏核心逻辑（GameService.ts）
- ✅ AI 算法（AiService.ts - Minimax + Alpha-Beta 剪枝）
- ✅ 钱包服务（WalletService.ts - Solana Mobile SDK）
- ✅ Supabase 服务（SupabaseService.ts）
- ✅ UI 组件（Board, Timer, ScoreBoard, Button）
- ✅ 页面（HomeScreen, GameScreen, LeaderboardScreen）
- ✅ Hooks（useWallet, useSupabase）

后端：
- ✅ Anchor 代币合约（GOMOKU Token - lib.rs）
- ✅ 游戏奖励 Mint 功能
- ✅ Supabase 数据库表（user_profiles, game_records, match_requests, daily_logins）

部署：
- ✅ Devnet 部署脚本（deploy-devnet.sh）
- ✅ 完整文档（5 个指南）
- ✅ 配置文件（app.json, tsconfig.json, babel.config.js, metro.config.js）

**总文件数：** 34 个

**项目位置：** `/root/clawd/gomoku/`

**下一步行动：**
1. 运行 `npm install` 安装依赖
2. 部署合约到 Devnet（`./scripts/deploy-devnet.sh`）
3. 配置 Supabase 并创建数据表
4. 更新 App.tsx 中的配置
5. 构建 APK
6. 提交 dApp Store

---

*按时间倒序排列，保留重要决策和上下文*
