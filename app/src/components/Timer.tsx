/**
 * Timer - 计时器组件
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface TimerProps {
  timeLeft: number;
  maxTime: number;
}

export const Timer: React.FC<TimerProps> = ({ timeLeft, maxTime }) => {
  const percentage = (timeLeft / maxTime) * 100;
  const color = percentage > 50 ? '#4CAF50' : percentage > 20 ? '#FF9800' : '#F44336';

  return (
    <View style={styles.container}>
      <View style={[styles.progressBar, { width: `${percentage}%`, backgroundColor: color }]} />
      <View style={styles.textContainer}>
        <Text style={[styles.text, { color }]}>
          {timeLeft}s
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 40,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBar: {
    height: '100%',
    borderRadius: 20,
  },
  textContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
