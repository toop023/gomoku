# API 参考文档

## 前端服务

### GameService
游戏核心逻辑服务。

```typescript
import { GameService } from './services/GameService';

const game = new GameService('black', 'ai', 'medium');

// 下棋
game.makeMove(row, col);

// 获取状态
const state = game.getState();

// 悔棋
game.undoMove();
```

### AiService
AI 对手服务。

```typescript
import { AiService } from './services/AiService';

const ai = new AiService('medium', 'white');

// 获取最佳移动
const move = ai.getBestMove(gameState);
```

### WalletService
Solana Mobile SDK 钱包服务。

```typescript
import { WalletService } from './services/WalletService';

const wallet = new WalletService('https://api.devnet.solana.com');

// 连接钱包
const walletInfo = await wallet.connect();

// 转账代币
await wallet.transferToken(toAddress, gomokuMint, amount);
```

### SupabaseService
Supabase 后端服务。

```typescript
import { SupabaseService } from './services/SupabaseService';

const supabase = new SupabaseService(supabaseUrl, supabaseKey);

// 获取用户档案
const profile = await supabase.getOrCreateProfile(walletAddress, username);

// 更新游戏统计
const updated = await supabase.updateGameStats('win');

// 获取排行榜
const leaderboard = await supabase.getLeaderboard();
```

## 后端 API

### Supabase REST API

#### 获取用户档案
```
GET /rest/v1/user_profiles?wallet_address=eq.{address}
```

#### 创建游戏记录
```
POST /rest/v1/game_records
Content-Type: application/json

{
  "player_id": "...",
  "opponent_id": "...",
  "result": "win",
  "moves": 45,
  "duration": 300,
  "mode": "ai",
  "difficulty": "medium"
}
```

#### 获取排行榜
```
GET /rest/v1/user_profiles?order=wins.desc&limit=50
```

## Solana 程序调用

### InitializeMint
初始化 GOMOKU 代币。

```typescript
const tx = await program.methods
  .initializeMint(9)
  .accounts({
    mint: mintKeypair.publicKey,
    tokenAccount: tokenAccount,
    authority: authorityPDA,
    payer: payer.publicKey,
    tokenProgram: TOKEN_PROGRAM_ID,
    systemProgram: SystemProgram.programId,
    rent: SYSVAR_RENT_PUBKEY,
  })
  .signers([mintKeypair])
  .rpc();
```

### TransferTokens
转账代币。

```typescript
const tx = await program.methods
  .transferTokens(new BN(amount * 10**9))
  .accounts({
    from: fromATA,
    to: toATA,
    authority: authority,
    tokenProgram: TOKEN_PROGRAM_ID,
  })
  .rpc();
```

### MintGameRewards
Mint 游戏奖励。

```typescript
const tx = await program.methods
  .mintGameRewards(new BN(rewardAmount * 10**9))
  .accounts({
    mint: mint,
    tokenAccount: tokenAccount,
    authority: authorityPDA,
    tokenProgram: TOKEN_PROGRAM_ID,
  })
  .rpc();
```
