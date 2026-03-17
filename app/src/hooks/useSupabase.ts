/**
 * useSupabase - Supabase Hook
 */

import { useState, useEffect, useCallback } from 'react';
import { SupabaseService, UserProfile, GameRecord, LeaderboardEntry } from '../services/SupabaseService';

export interface UseSupabaseReturn {
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  getOrCreateProfile: (walletAddress: string, username?: string) => Promise<UserProfile>;
  updateBalance: (amount: number) => Promise<UserProfile>;
  updateGameStats: (result: 'win' | 'lose' | 'draw') => Promise<UserProfile>;
  saveGameRecord: (
    opponentId: string,
    result: 'win' | 'lose' | 'draw',
    moves: number,
    duration: number,
    mode: 'ai' | 'local' | 'online',
    difficulty?: 'easy' | 'medium' | 'hard'
  ) => Promise<GameRecord>;
  createMatchRequest: (
    walletAddress: string,
    mode: 'ai' | 'local' | 'online',
    difficulty?: 'easy' | 'medium' | 'hard'
  ) => Promise<any>;
  getLeaderboard: () => Promise<LeaderboardEntry[]>;
  getGameHistory: () => Promise<GameRecord[]>;
  recordDailyLogin: () => Promise<void>;
}

export const useSupabase = (
  supabaseUrl: string,
  supabaseKey: string
): UseSupabaseReturn => {
  const [supabaseService] = useState(() => new SupabaseService(supabaseUrl, supabaseKey));
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getOrCreateProfile = useCallback(async (
    walletAddress: string,
    username?: string
  ): Promise<UserProfile> => {
    try {
      setLoading(true);
      setError(null);
      const profile = await supabaseService.getOrCreateUserProfile(walletAddress, username);
      setUserProfile(profile);
      return profile;
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取用户档案失败');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [supabaseService]);

  const updateBalance = useCallback(async (amount: number): Promise<UserProfile> => {
    try {
      setLoading(true);
      setError(null);
      const profile = await supabaseService.updateUserBalance(amount);
      setUserProfile(profile);
      return profile;
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新余额失败');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [supabaseService]);

  const updateGameStats = useCallback(async (
    result: 'win' | 'lose' | 'draw'
  ): Promise<UserProfile> => {
    try {
      setLoading(true);
      setError(null);
      const profile = await supabaseService.updateGameStats(result);
      setUserProfile(profile);
      return profile;
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新游戏统计失败');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [supabaseService]);

  const saveGameRecord = useCallback(async (
    opponentId: string,
    result: 'win' | 'lose' | 'draw',
    moves: number,
    duration: number,
    mode: 'ai' | 'local' | 'online',
    difficulty?: 'easy' | 'medium' | 'hard'
  ): Promise<GameRecord> => {
    try {
      setLoading(true);
      setError(null);
      const record = await supabaseService.saveGameRecord(
        opponentId,
        result,
        moves,
        duration,
        mode,
        difficulty
      );
      return record;
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存游戏记录失败');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [supabaseService]);

  const createMatchRequest = useCallback(async (
    walletAddress: string,
    mode: 'ai' | 'local' | 'online',
    difficulty?: 'easy' | 'medium' | 'hard'
  ): Promise<any> => {
    try {
      setLoading(true);
      setError(null);
      const request = await supabaseService.createMatchRequest(walletAddress, mode, difficulty);
      return request;
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建匹配请求失败');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [supabaseService]);

  const getLeaderboard = useCallback(async (): Promise<LeaderboardEntry[]> => {
    try {
      setLoading(true);
      setError(null);
      const leaderboard = await supabaseService.getLeaderboard();
      return leaderboard;
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取排行榜失败');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [supabaseService]);

  const getGameHistory = useCallback(async (): Promise<GameRecord[]> => {
    try {
      setLoading(true);
      setError(null);
      const history = await supabaseService.getGameHistory();
      return history;
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取游戏历史失败');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [supabaseService]);

  const recordDailyLogin = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await supabaseService.recordDailyLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : '记录每日登录失败');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [supabaseService]);

  return {
    userProfile,
    loading,
    error,
    getOrCreateProfile,
    updateBalance,
    updateGameStats,
    saveGameRecord,
    createMatchRequest,
    getLeaderboard,
    getGameHistory,
    recordDailyLogin,
  };
};
