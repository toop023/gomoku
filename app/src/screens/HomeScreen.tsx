/**
 * HomeScreen - 主页
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
import { GameMode, Difficulty } from '../services/GameService';

interface HomeScreenProps {
  onStartGame: (mode: GameMode, difficulty?: Difficulty) => void;
  onShowLeaderboard: () => void;
  gomokuBalance: number;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartGame,
  onShowLeaderboard,
  gomokuBalance,
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>五子云</Text>
          <Text style={styles.subtitle}>Five Cloud</Text>
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>GOMOKU 余额</Text>
          <Text style={styles.balance}>{gomokuBalance}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI 对战</Text>
          <View style={styles.buttonGroup}>
            <Button
              title="简单"
              onPress={() => onStartGame('ai', 'easy')}
              variant="secondary"
            />
            <Button
              title="中等"
              onPress={() => onStartGame('ai', 'medium')}
              variant="primary"
            />
            <Button
              title="困难"
              onPress={() => onStartGame('ai', 'hard')}
              variant="danger"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>本地对战</Text>
          <View style={styles.buttonGroup}>
            <Button
              title="双人同屏"
              onPress={() => onStartGame('local')}
              variant="primary"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>在线对战</Text>
          <View style={styles.buttonGroup}>
            <Button
              title="快速匹配"
              onPress={() => onStartGame('online')}
              variant="secondary"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Button
            title="排行榜"
            onPress={onShowLeaderboard}
            variant="primary"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#6200EE',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginTop: 4,
  },
  balanceCard: {
    backgroundColor: '#6200EE',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#6200EE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
  },
  balance: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  buttonGroup: {
    gap: 12,
  },
});
