/**
 * ScoreBoard - 分数板组件
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ScoreBoardProps {
  blackScore: number;
  whiteScore: number;
  currentTurn: 'black' | 'white';
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({ blackScore, whiteScore, currentTurn }) => {
  return (
    <View style={styles.container}>
      <View style={[styles.player, currentTurn === 'black' && styles.activePlayer]}>
        <View style={[styles.indicator, { backgroundColor: '#1a1a1a' }]} />
        <Text style={styles.playerText}>黑方</Text>
        <Text style={styles.score}>{blackScore}</Text>
      </View>

      <View style={styles.divider} />

      <View style={[styles.player, currentTurn === 'white' && styles.activePlayer]}>
        <View style={[styles.indicator, { backgroundColor: '#f5f5f5', borderWidth: 1, borderColor: '#ddd' }]} />
        <Text style={styles.playerText}>白方</Text>
        <Text style={styles.score}>{whiteScore}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
  },
  player: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePlayer: {
    opacity: 1,
  },
  indicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 8,
  },
  playerText: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  score: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  divider: {
    width: 1,
    height: '80%',
    backgroundColor: '#ddd',
  },
});
