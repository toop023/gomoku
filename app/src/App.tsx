/**
 * App - 主应用
 */

import React, { useState, useCallback } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { HomeScreen } from './screens/HomeScreen';
import { GameScreen } from './screens/GameScreen';
import { LeaderboardScreen } from './screens/LeaderboardScreen';
import { useWallet } from './hooks/useWallet';
import { useSupabase } from './hooks/useSupabase';
import { GameMode, Difficulty, GameResult } from './services/GameService';
import { LeaderboardEntry } from './services/SupabaseService';

// 配置
const RPC_URL = 'https://api.devnet.solana.com';
const GOMOKU_MINT = ''; // TODO: 部署后填写
const SUPABASE_URL = ''; // TODO: 填写你的 Supabase URL
const SUPABASE_KEY = ''; // TODO: 填写你的 Supabase Key

type Screen = 'home' | 'game' | 'leaderboard';

export const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [gameMode, setGameMode] = useState<GameMode>('ai');
  const [gameDifficulty, setGameDifficulty] = useState<Difficulty>('medium');

  const wallet = useWallet(RPC_URL, GOMOKU_MINT);
  const supabase = useSupabase(SUPABASE_URL, SUPABASE_KEY);

  const handleStartGame = useCallback((mode: GameMode, difficulty?: Difficulty) => {
    setGameMode(mode);
    if (difficulty) {
      setGameDifficulty(difficulty);
    }
    setCurrentScreen('game');
  }, []);

  const handleShowLeaderboard = useCallback(() => {
    setCurrentScreen('leaderboard');
  }, []);

  const handleBack = useCallback(() => {
    setCurrentScreen('home');
  }, []);

  const handleGameEnd = useCallback(async (result: GameResult) => {
    // 更新 Supabase 统计
    if (result.winner) {
      const playerWon = (gameMode === 'ai' && result.winner === 'black') ||
                       (gameMode === 'local' && result.winner === 'black');
      const gameResult = playerWon ? 'win' : 'lose';

      try {
        await supabase.updateGameStats(gameResult);

        // 更新余额
        if (playerWon) {
          const currentBalance = wallet.gomokuBalance;
          await supabase.updateBalance(currentBalance + 10);
        } else {
          const currentBalance = wallet.gomokuBalance;
          await supabase.updateBalance(currentBalance - 2);
        }
      } catch (error) {
        console.error('更新游戏统计失败:', error);
      }
    }

    setCurrentScreen('home');
  }, [gameMode, supabase, wallet.gomokuBalance]);

  const fetchLeaderboard = useCallback(async (): Promise<LeaderboardEntry[]> => {
    return await supabase.getLeaderboard();
  }, [supabase]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />

      <View style={styles.content}>
        {currentScreen === 'home' && (
          <HomeScreen
            onStartGame={handleStartGame}
            onShowLeaderboard={handleShowLeaderboard}
            gomokuBalance={wallet.gomokuBalance}
          />
        )}

        {currentScreen === 'game' && (
          <GameScreen
            mode={gameMode}
            difficulty={gameDifficulty}
            onBack={handleBack}
            onGameEnd={handleGameEnd}
          />
        )}

        {currentScreen === 'leaderboard' && (
          <LeaderboardScreen
            onBack={handleBack}
            fetchLeaderboard={fetchLeaderboard}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
});
