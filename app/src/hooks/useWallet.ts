/**
 * useWallet - 钱包 Hook
 */

import { useState, useEffect, useCallback } from 'react';
import { WalletService } from '../services/WalletService';
import { PublicKey } from '@solana/web3.js';

export interface UseWalletReturn {
  connected: boolean;
  publicKey: PublicKey | null;
  balance: number;
  gomokuBalance: number;
  loading: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  transferGomoku: (to: string, amount: number) => Promise<void>;
}

export const useWallet = (
  rpcUrl: string = 'https://api.devnet.solana.com',
  gomokuMint: string = ''
): UseWalletReturn => {
  const [walletService] = useState(() => new WalletService(rpcUrl));
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [balance, setBalance] = useState(0);
  const [gomokuBalance, setGomokuBalance] = useState(100);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const walletInfo = await walletService.connect();
      setPublicKey(walletInfo.publicKey);
      setBalance(walletInfo.balance);
      setConnected(true);

      if (gomokuMint) {
        const tokenInfo = await walletService.getTokenBalance(gomokuMint);
        setGomokuBalance(tokenInfo.balance);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '连接钱包失败');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [walletService, gomokuMint]);

  const disconnect = useCallback(async () => {
    try {
      setLoading(true);
      await walletService.disconnect();
      setPublicKey(null);
      setBalance(0);
      setConnected(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '断开连接失败');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [walletService]);

  const transferGomoku = useCallback(async (to: string, amount: number) => {
    if (!gomokuMint) {
      throw new Error('GOMOKU 代币地址未配置');
    }

    try {
      setLoading(true);
      setError(null);
      await walletService.transferToken(to, gomokuMint, amount);

      // 刷新余额
      const tokenInfo = await walletService.getTokenBalance(gomokuMint);
      setGomokuBalance(tokenInfo.balance);
    } catch (err) {
      setError(err instanceof Error ? err.message : '转账失败');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [walletService, gomokuMint]);

  return {
    connected,
    publicKey,
    balance,
    gomokuBalance,
    loading,
    error,
    connect,
    disconnect,
    transferGomoku,
  };
};
