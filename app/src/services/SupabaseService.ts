/**
 * SupabaseService - Supabase 后端服务
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Player, GameResult } from './GameService';

export interface UserProfile {
  id: string;
  username: string;
  wallet_address: string;
  gomoku_balance: number;
  wins: number;
  losses: number;
  win_rate: number;
  current_streak: number;
  created_at: string;
}

export interface GameRecord {
  id: string;
  player_id: string;
  opponent_id: string;
  result: 'win' | 'lose' | 'draw';
  moves: number;
  duration: number;
  mode: 'ai' | 'local' | 'online';
  difficulty?: 'easy' | 'medium' | 'hard';
  created_at: string;
}

export interface MatchRequest {
  id: string;
  player_id: string;
  player_wallet: string;
  mode: 'ai' | 'local' | 'online';
  difficulty?: 'easy' | 'medium' | 'hard';
  status: 'pending' | 'matched' | 'cancelled';
  created_at: string;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  wallet_address: string;
  wins: number;
  win_rate: number;
  gomoku_balance: number;
}

export class SupabaseService {
  private client: SupabaseClient;
  private userId: string | null = null;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.client = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * 设置用户 ID
   */
  setUserId(userId: string): void {
    this.userId = userId;
  }

  /**
   * 获取或创建用户档案
   */
  async getOrCreateUserProfile(walletAddress: string, username?: string): Promise<UserProfile> {
    try {
      // 先查询是否存在
      const { data: existingUser, error: queryError } = await this.client
        .from('user_profiles')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();

      if (queryError && queryError.code !== 'PGRST116') {
        throw queryError;
      }

      if (existingUser) {
        this.userId = existingUser.id;
        return existingUser;
      }

      // 创建新用户
      const { data: newUser, error: createError } = await this.client
        .from('user_profiles')
        .insert({
          wallet_address: walletAddress,
          username: username || `Player${walletAddress.slice(0, 6)}`,
          gomoku_balance: 100, // 初始余额
          wins: 0,
          losses: 0,
          win_rate: 0,
          current_streak: 0,
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      this.userId = newUser.id;
      return newUser;
    } catch (error) {
      console.error('获取或创建用户档案失败:', error);
      throw error;
    }
  }

  /**
   * 更新用户余额
   */
  async updateUserBalance(amount: number): Promise<UserProfile> {
    if (!this.userId) {
      throw new Error('用户未登录');
    }

    try {
      const { data, error } = await this.client
        .from('user_profiles')
        .update({ gomoku_balance: amount })
        .eq('id', this.userId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('更新余额失败:', error);
      throw error;
    }
  }

  /**
   * 更新游戏统计
   */
  async updateGameStats(result: 'win' | 'lose' | 'draw'): Promise<UserProfile> {
    if (!this.userId) {
      throw new Error('用户未登录');
    }

    try {
      // 获取当前统计数据
      const { data: current, error: queryError } = await this.client
        .from('user_profiles')
        .select('*')
        .eq('id', this.userId)
        .single();

      if (queryError) {
        throw queryError;
      }

      // 计算新统计数据
      let wins = current.wins;
      let losses = current.losses;
      let streak = current.current_streak;

      if (result === 'win') {
        wins++;
        streak = streak > 0 ? streak + 1 : 1;
      } else if (result === 'lose') {
        losses++;
        streak = streak < 0 ? streak - 1 : -1;
      }

      const total = wins + losses;
      const winRate = total > 0 ? (wins / total) * 100 : 0;

      // 更新
      const { data, error } = await this.client
        .from('user_profiles')
        .update({
          wins,
          losses,
          win_rate: winRate,
          current_streak: streak,
        })
        .eq('id', this.userId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('更新游戏统计失败:', error);
      throw error;
    }
  }

  /**
   * 保存游戏记录
   */
  async saveGameRecord(
    opponentId: string,
    result: 'win' | 'lose' | 'draw',
    moves: number,
    duration: number,
    mode: 'ai' | 'local' | 'online',
    difficulty?: 'easy' | 'medium' | 'hard'
  ): Promise<GameRecord> {
    if (!this.userId) {
      throw new Error('用户未登录');
    }

    try {
      const { data, error } = await this.client
        .from('game_records')
        .insert({
          player_id: this.userId,
          opponent_id: opponentId,
          result,
          moves,
          duration,
          mode,
          difficulty,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('保存游戏记录失败:', error);
      throw error;
    }
  }

  /**
   * 创建匹配请求
   */
  async createMatchRequest(
    walletAddress: string,
    mode: 'ai' | 'local' | 'online',
    difficulty?: 'easy' | 'medium' | 'hard'
  ): Promise<MatchRequest> {
    if (!this.userId) {
      throw new Error('用户未登录');
    }

    try {
      const { data, error } = await this.client
        .from('match_requests')
        .insert({
          player_id: this.userId,
          player_wallet: walletAddress,
          mode,
          difficulty,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('创建匹配请求失败:', error);
      throw error;
    }
  }

  /**
   * 等待匹配
   */
  async waitForMatch(requestId: string, timeout: number = 30000): Promise<MatchRequest | null> {
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        if (Date.now() - startTime > timeout) {
          clearInterval(interval);
          resolve(null);
          return;
        }

        try {
          const { data, error } = await this.client
            .from('match_requests')
            .select('*')
            .eq('id', requestId)
            .single();

          if (error) {
            throw error;
          }

          if (data.status === 'matched') {
            clearInterval(interval);
            resolve(data);
          }
        } catch (error) {
          clearInterval(interval);
          reject(error);
        }
      }, 1000);
    });
  }

  /**
   * 获取排行榜
   */
  async getLeaderboard(limit: number = 50): Promise<LeaderboardEntry[]> {
    try {
      const { data, error } = await this.client
        .from('user_profiles')
        .select('*')
        .order('wins', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data.map((user, index) => ({
        rank: index + 1,
        username: user.username,
        wallet_address: user.wallet_address,
        wins: user.wins,
        win_rate: user.win_rate,
        gomoku_balance: user.gomoku_balance,
      }));
    } catch (error) {
      console.error('获取排行榜失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户游戏历史
   */
  async getGameHistory(limit: number = 20): Promise<GameRecord[]> {
    if (!this.userId) {
      throw new Error('用户未登录');
    }

    try {
      const { data, error } = await this.client
        .from('game_records')
        .select('*')
        .eq('player_id', this.userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('获取游戏历史失败:', error);
      throw error;
    }
  }

  /**
   * 记录每日登录
   */
  async recordDailyLogin(): Promise<void> {
    if (!this.userId) {
      throw new Error('用户未登录');
    }

    try {
      const today = new Date().toISOString().split('T')[0];

      const { error } = await this.client
        .from('daily_logins')
        .upsert({
          user_id: this.userId,
          login_date: today,
        }, {
          onConflict: 'user_id,login_date',
        });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('记录每日登录失败:', error);
      throw error;
    }
  }

  /**
   * 获取客户端
   */
  getClient(): SupabaseClient {
    return this.client;
  }
}
