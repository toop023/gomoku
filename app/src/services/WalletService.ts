/**
 * WalletService - Solana Mobile SDK 钱包服务
 */

import {
  transact,
  Web3MobileWallet,
} from '@solana-mobile/mobile-wallet-adapter-protocol';
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
  getOrCreateAssociatedTokenAccount,
  transfer,
  mintTo,
  burn,
} from '@solana/spl-token';

export interface WalletInfo {
  publicKey: PublicKey;
  balance: number;
}

export interface TokenInfo {
  mint: PublicKey;
  balance: number;
  decimals: number;
}

export class WalletService {
  private connection: Connection;
  private authorizationToken: string | null = null;

  constructor(rpcUrl: string = 'https://api.devnet.solana.com') {
    this.connection = new Connection(rpcUrl, 'confirmed');
  }

  /**
   * 连接钱包
   */
  async connect(): Promise<WalletInfo> {
    try {
      const result = await transact(async (wallet: Web3MobileWallet) => {
        const authResult = await wallet.authorize({
          cluster: 'devnet',
          identity: {
            name: '五子云',
            uri: 'https://gomoku.sol',
            icon: 'https://gomoku.sol/icon.png',
          },
        });

        this.authorizationToken = authResult.auth_token;

        const balance = await this.connection.getBalance(authResult.public_key);

        return {
          publicKey: authResult.public_key,
          balance: balance / LAMPORTS_PER_SOL,
        };
      });

      return result;
    } catch (error) {
      console.error('连接钱包失败:', error);
      throw error;
    }
  }

  /**
   * 断开连接
   */
  async disconnect(): Promise<void> {
    try {
      if (this.authorizationToken) {
        await transact(async (wallet: Web3MobileWallet) => {
          await wallet.deauthorize({ auth_token: this.authorizationToken! });
        });
        this.authorizationToken = null;
      }
    } catch (error) {
      console.error('断开连接失败:', error);
      throw error;
    }
  }

  /**
   * 获取代币余额
   */
  async getTokenBalance(tokenMint: string): Promise<TokenInfo> {
    try {
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        await this.getPublicKey(),
        { mint: new PublicKey(tokenMint) }
      );

      if (tokenAccounts.value.length === 0) {
        return {
          mint: new PublicKey(tokenMint),
          balance: 0,
          decimals: 9,
        };
      }

      const account = tokenAccounts.value[0];
      const balance = account.account.data.parsed.info.tokenAmount;
      const decimals = account.account.data.parsed.info.tokenAmount.decimals;

      return {
        mint: new PublicKey(tokenMint),
        balance: Number(balance.uiAmount),
        decimals,
      };
    } catch (error) {
      console.error('获取代币余额失败:', error);
      throw error;
    }
  }

  /**
   * 转账代币
   */
  async transferToken(
    to: string,
    tokenMint: string,
    amount: number
  ): Promise<string> {
    try {
      const result = await transact(async (wallet: Web3MobileWallet) => {
        const fromPubkey = await this.getPublicKey();
        const toPubkey = new PublicKey(to);
        const mintPubkey = new PublicKey(tokenMint);

        const fromATA = await getOrCreateAssociatedTokenAccount(
          this.connection,
          await wallet.signTransactions,
          fromPubkey,
          mintPubkey,
          fromPubkey
        );

        const toATA = await getOrCreateAssociatedTokenAccount(
          this.connection,
          await wallet.signTransactions,
          fromPubkey,
          mintPubkey,
          toPubkey
        );

        const transaction = new Transaction().add(
          transfer(
            this.connection,
            await wallet.signTransactions,
            fromATA.address,
            toATA.address,
            fromPubkey,
            amount * 10 ** 9 // 假设 9 位小数
          )
        );

        const signature = await wallet.signAndSendTransactions({
          transactions: [transaction],
        });

        return signature;
      });

      return result;
    } catch (error) {
      console.error('转账失败:', error);
      throw error;
    }
  }

  /**
   * Mint 代币（需要签名者权限）
   */
  async mintTokens(
    tokenMint: string,
    authority: string,
    amount: number
  ): Promise<string> {
    try {
      const result = await transact(async (wallet: Web3MobileWallet) => {
        const fromPubkey = await this.getPublicKey();
        const mintPubkey = new PublicKey(tokenMint);
        const authorityPubkey = new PublicKey(authority);

        const toATA = await getOrCreateAssociatedTokenAccount(
          this.connection,
          await wallet.signTransactions,
          fromPubkey,
          mintPubkey,
          fromPubkey
        );

        const transaction = new Transaction().add(
          mintTo(
            this.connection,
            await wallet.signTransactions,
            mintPubkey,
            toATA.address,
            authorityPubkey,
            amount * 10 ** 9
          )
        );

        const signature = await wallet.signAndSendTransactions({
          transactions: [transaction],
        });

        return signature;
      });

      return result;
    } catch (error) {
      console.error('Mint 失败:', error);
      throw error;
    }
  }

  /**
   * 销毁代币
   */
  async burnTokens(
    tokenMint: string,
    amount: number
  ): Promise<string> {
    try {
      const result = await transact(async (wallet: Web3MobileWallet) => {
        const fromPubkey = await this.getPublicKey();
        const mintPubkey = new PublicKey(tokenMint);

        const fromATA = await getOrCreateAssociatedTokenAccount(
          this.connection,
          await wallet.signTransactions,
          fromPubkey,
          mintPubkey,
          fromPubkey
        );

        const transaction = new Transaction().add(
          burn(
            this.connection,
            await wallet.signTransactions,
            fromATA.address,
            mintPubkey,
            fromPubkey,
            amount * 10 ** 9
          )
        );

        const signature = await wallet.signAndSendTransactions({
          transactions: [transaction],
        });

        return signature;
      });

      return result;
    } catch (error) {
      console.error('销毁失败:', error);
      throw error;
    }
  }

  /**
   * 获取公钥
   */
  private async getPublicKey(): Promise<PublicKey> {
    try {
      const result = await transact(async (wallet: Web3MobileWallet) => {
        const authResult = await wallet.reauthorize({
          auth_token: this.authorizationToken!,
        });
        return authResult.public_key;
      });

      return result;
    } catch (error) {
      console.error('获取公钥失败:', error);
      throw error;
    }
  }

  /**
   * 刷新余额
   */
  async refreshBalance(): Promise<number> {
    try {
      const publicKey = await this.getPublicKey();
      const balance = await this.connection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('刷新余额失败:', error);
      throw error;
    }
  }

  /**
   * 检查连接状态
   */
  isConnected(): boolean {
    return this.authorizationToken !== null;
  }

  /**
   * 获取连接对象
   */
  getConnection(): Connection {
    return this.connection;
  }
}
