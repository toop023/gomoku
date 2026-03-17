/**
 * LeaderboardScreen - 排行榜页面
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Button } from '../components/Button';
import { LeaderboardEntry } from '../services/SupabaseService';

interface LeaderboardScreenProps {
  onBack: () => void;
  fetchLeaderboard: () => Promise<LeaderboardEntry[]>;
}

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({
  onBack,
  fetchLeaderboard,
}) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await fetchLeaderboard();
      setLeaderboard(data);
    } catch (error) {
      console.error('加载排行榜失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return '#FFD700'; // 金
      case 2:
        return '#C0C0C0'; // 银
      case 3:
        return '#CD7F32'; // 铜
      default:
        return '#666';
    }
  };

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>排行榜</Text>
        <Button title="刷新" onPress={loadLeaderboard} variant="secondary" />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {leaderboard.map((entry) => (
            <View key={entry.rank} style={styles.entry}>
              <View style={[styles.rank, { backgroundColor: getRankColor(entry.rank) }]}>
                <Text style={styles.rankText}>{getRankEmoji(entry.rank)}</Text>
              </View>

              <View style={styles.info}>
                <Text style={styles.username}>{entry.username}</Text>
                <Text style={styles.wallet}>
                  {entry.wallet_address.slice(0, 8)}...{entry.wallet_address.slice(-4)}
                </Text>
              </View>

              <View style={styles.stats}>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>胜场</Text>
                  <Text style={styles.statValue}>{entry.wins}</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>胜率</Text>
                  <Text style={styles.statValue}>{entry.win_rate.toFixed(1)}%</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>GOMOKU</Text>
                  <Text style={styles.statValue}>{entry.gomoku_balance}</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <View style={styles.footer}>
        <Button title="返回" onPress={onBack} variant="primary" />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200EE',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  entry: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rank: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  rankText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  info: {
    flex: 1,
  },
  username: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  wallet: {
    fontSize: 12,
    color: '#999',
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: '#999',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6200EE',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
});
