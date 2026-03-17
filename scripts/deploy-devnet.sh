#!/bin/bash

# 五子云 - GOMOKU 代币部署脚本 (Devnet)

set -e

echo "=================================="
echo "五子云 - GOMOKU 代币部署 (Devnet)"
echo "=================================="

# 检查 Solana CLI
if ! command -v solana &> /dev/null; then
    echo "错误: Solana CLI 未安装"
    echo "请访问 https://docs.solana.com/cli/install-solana-cli-tools 安装"
    exit 1
fi

# 切换到 Devnet
echo "切换到 Devnet..."
solana config set --url devnet

# 获取当前配置
CURRENT_RPC=$(solana config get | grep "RPC URL" | awk '{print $3}')
CURRENT_KEYPAIR=$(solana config get | grep "Keypair Path" | awk '{print $3}')

echo "当前 RPC: $CURRENT_RPC"
echo "当前密钥: $CURRENT_KEYPAIR"

# 检查余额
BALANCE=$(solana balance | awk '{print $1}')
echo "当前余额: $BALANCE SOL"

if (( $(echo "$BALANCE < 2" | bc -l) )); then
    echo "警告: 余额不足 2 SOL，请空投"
    echo "运行: solana airdrop 2"
    read -p "是否空投? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        solana airdrop 2
    fi
fi

# 进入合约目录
CONTRACT_DIR="contract/gomoku-token"
cd "$CONTRACT_DIR"

# 安装依赖
echo "安装 Anchor 依赖..."
anchor build

# 构建
echo "构建合约..."
anchor build

# 获取程序 ID
PROGRAM_ID=$(anchor keys list | grep gomoku_token | awk '{print $3}')
echo "程序 ID: $PROGRAM_ID"

# 更新 Anchor.toml
echo "更新 Anchor.toml..."
sed -i "s/gomoku_token = \"[^\"]*\"/gomoku_token = \"$PROGRAM_ID\"/" Anchor.toml

# 重新构建
echo "重新构建..."
anchor build

# 部署到 Devnet
echo "部署到 Devnet..."
anchor deploy --provider.cluster devnet

echo "=================================="
echo "部署完成！"
echo "程序 ID: $PROGRAM_ID"
echo "=================================="

# 创建初始化脚本
cat > "../initialize-mint.ts" << 'EOF'
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { GomokuToken } from "../target/types/gomoku_token";
import {
  TOKEN_PROGRAM_ID,
  createMint,
  createAccount,
  mintTo,
} from "@solana/spl-token";
import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

async function main() {
  const connection = new Connection("https://api.devnet.solana.com");
  const wallet = anchor.Wallet.local();

  const provider = new anchor.AnchorProvider(
    connection,
    wallet,
    { commitment: "confirmed" }
  );
  anchor.setProvider(provider);

  const program = anchor.workspace.GomokuToken as Program<GomokuToken>;

  // 创建 GOMOKU Mint
  const mint = await createMint(
    connection,
    wallet.payer,
    wallet.publicKey,
    wallet.publicKey,
    9
  );

  console.log("GOMOKU Mint:", mint.toBase58());

  // 初始化 10 亿代币供应
  const tokenAccount = await createAccount(
    connection,
    wallet.payer,
    mint,
    wallet.publicKey
  );

  await mintTo(
    connection,
    wallet.payer,
    mint,
    tokenAccount,
    wallet.publicKey,
    1_000_000_000 * 10 ** 9
  );

  console.log("已初始化 10 亿 GOMOKU 代币");
  console.log("代币账户:", tokenAccount.toBase58());
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
EOF

echo "=================================="
echo "下一步:"
echo "1. 运行 ts-node initialize-mint.ts 初始化代币"
echo "2. 复制 Mint 地址到 App.tsx 中的 GOMOKU_MINT"
echo "=================================="
