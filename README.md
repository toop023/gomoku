# 五子云 (Five Cloud)

**基于 Solana Mobile 的五子棋对战游戏**

## 项目概述

- **项目代号：** 五子云
- **部署平台：** SEEKER 手机（Solana Mobile）
- **技术栈：** React Native + TypeScript + Solana Web3
- **游戏类型：** 在线对战 + AI 对手 + 本地双人

## 核心功能

✅ 在线对战（匹配系统）
✅ 本地 AI（3 个难度）
✅ 本地双人
✅ 排行榜
✅ 代币奖励（$GOMOKU）

## 游戏规则

- 15x15 棋盘
- 标准五子连珠胜
- 30 秒/步限时
- 无禁手规则

## 代币经济

- 胜利：+10 $GOMOKU
- 失败：-2 $GOMOKU
- 连胜奖励：额外 +5/10/15

## 技术架构

### 前端（React Native）
- 游戏逻辑：`GameService.ts`
- AI 算法：`AiService.ts`
- 钱包集成：`WalletService.ts`
- Supabase：`SupabaseService.ts`

### 后端（Solana + Supabase）
- 代币合约：`contract/gomoku-token/`
- 数据库：Supabase（PostgreSQL）
- 实时匹配：Supabase Realtime

### 部署
- Devnet 测试：`scripts/deploy-devnet.sh`
- Mainnet 部署：`scripts/deploy-mainnet.sh`

## 快速开始

### 环境安装

参考：`docs/INSTALL_ENVIRONMENT.md`

### 部署合约

```bash
cd contract/gomoku-token
solana program deploy target/deploy/gomoku_token.so
```

### 运行应用

```bash
cd app
npm install
npm start
npm run android  # 或 ios
```

## 项目结构

```
gomoku/
├── app/                  # React Native 应用
│   ├── src/
│   │   ├── components/   # UI 组件
│   │   ├── screens/      # 页面
│   │   ├── services/     # 服务层
│   │   ├── hooks/        # 自定义 Hook
│   │   └── utils/        # 工具函数
│   ├── android/
│   └── ios/
├── contract/             # Anchor 合约
│   └── gomoku-token/
├── scripts/              # 部署脚本
├── docs/                 # 文档
└── README.md
```

## 待完成

- [ ] 运行 `npm install` 安装前端依赖
- [ ] 部署合约到 Devnet（`./scripts/deploy-devnet.sh`）
- [ ] 初始化代币 Mint（`ts-node initialize-mint.ts`）
- [ ] 配置 Supabase 并创建数据表
- [ ] 更新 App.tsx 中的配置（SUPABASE_URL, SUPABASE_KEY, GOMOKU_MINT）
- [ ] 构建 APK（`npm run android`）
- [ ] 提交 dApp Store

## 文档

- `docs/INSTALL_ENVIRONMENT.md` - 环境安装指南
- `docs/DEPLOYMENT_GUIDE.md` - 部署指南
- `docs/SUPABASE_SETUP.md` - Supabase 设置指南
- `docs/API_REFERENCE.md` - API 参考文档
- `docs/TROUBLESHOOTING.md` - 故障排查指南
- `TODO.md` - 待完成事项

## 开发进度

| 模块 | 状态 | 进度 |
|------|------|------|
| 游戏核心逻辑 | ✅ 完成 | 100% |
| AI 算法 | ✅ 完成 | 100% |
| UI 组件 | ✅ 完成 | 100% |
| Solana Mobile SDK | ✅ 完成 | 100% |
| 代币合约 | ✅ 完成 | 100% |
| Supabase 集成 | ✅ 完成 | 100% |
| 部署脚本 | ✅ 完成 | 100% |

**总文件数：** 34 个（7 组件 + 3 屏幕 + 4 服务 + 2 Hook + 2 合约 + 4 文档 + 5 配置 + 1 脚本）

## 许可证

MIT
