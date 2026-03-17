/**
 * GameScreen - 游戏页面
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  Dimensions,
} from 'react-native';
import { Board } from '../components/Board';
import { Timer } from '../components/Timer';
import { ScoreBoard } from '../components/ScoreBoard';
import { Button } from '../components/Button';
import { GameService, GameMode, Player, GameResult } from '../services/GameService';
import { AiService } from '../services/AiService';

interface GameScreenProps {
  mode: GameMode;
  difficulty?: 'easy' | 'medium' | 'hard';
  onBack: () => void;
  onGameEnd: (result: GameResult) => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  mode,
  difficulty = 'medium',
  onBack,
  onGameEnd,
}) => {
  const [gameService] = useState(() => new GameService('black', mode, difficulty));
  const [aiService] = useState(() => new AiService(difficulty, 'white'));
  const [gameState, setGameState] = useState(() => gameService.getState());
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [blackScore, setBlackScore] = useState(0);
  const [whiteScore, setWhiteScore] = useState(0);

  // 启动计时器
  useEffect(() => {
    const interval = setInterval(() => {
      setGameState(gameService.getState());
    }, 1000);

    return () => clearInterval(interval);
  }, [gameService]);

  // AI 回合
  useEffect(() => {
    if (
      mode === 'ai' &&
      gameState.currentPlayer === 'white' &&
      !gameState.gameOver &&
      !isAiThinking
    ) {
      setIsAiThinking(true);
      setTimeout(() => {
        const move = aiService.getBestMove(gameState);
        gameService.makeMove(move.row, move.col);
        setGameState(gameService.getState());
        setIsAiThinking(false);
      }, 500);
    }
  }, [gameState.currentPlayer, gameState.gameOver, mode, gameService, aiService, isAiThinking]);

  // 检查游戏结束
  useEffect(() => {
    if (gameState.gameOver) {
      gameService.dispose();
      const result = gameService.getResult();

      let title = '';
      let message = '';

      if (result.winner) {
        title = result.winner === 'black' ? '黑方胜利！' : '白方胜利！';
        message = `步数: ${result.moves} | 时长: ${result.duration}秒`;

        if (mode === 'ai' && result.winner === 'black') {
          setBlackScore(prev => prev + 1);
        } else if (mode === 'ai' && result.winner === 'white') {
          setWhiteScore(prev => prev + 1);
        } else if (mode === 'local') {
          if (result.winner === 'black') {
            setBlackScore(prev => prev + 1);
          } else {
            setWhiteScore(prev => prev + 1);
          }
        }
      } else {
        title = '平局！';
        message = `步数: ${result.moves} | 时长: ${result.duration}秒`;
      }

      Alert.alert(
        title,
        message,
        [
          {
            text: '再来一局',
            onPress: () => {
              gameService.reset();
              setGameState(gameService.getState());
            },
          },
          {
            text: '返回',
            onPress: () => onGameEnd(result),
            style: 'cancel',
          },
        ],
        { cancelable: false }
      );
    }
  }, [gameState.gameOver, gameService, mode, onGameEnd]);

  const handleCellPress = useCallback((row: number, col: number) => {
    if (gameState.gameOver || isAiThinking) return;

    if (mode === 'ai' && gameState.currentPlayer !== 'black') return;

    gameService.makeMove(row, col);
    setGameState(gameService.getState());
  }, [gameState, mode, isAiThinking, gameService]);

  const handleUndo = useCallback(() => {
    gameService.undoMove();
    setGameState(gameService.getState());
  }, [gameService]);

  const handleRestart = useCallback(() => {
    gameService.reset();
    setGameState(gameService.getState());
  }, [gameService]);

  const boardSize = Math.min(Dimensions.get('window').width, Dimensions.get('window').height) * 0.6;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ScoreBoard
          blackScore={blackScore}
          whiteScore={whiteScore}
          currentTurn={gameState.currentPlayer}
        />

        <Timer timeLeft={gameState.timeLeft} maxTime={30} />

        <Board
          board={gameState.board}
          onCellPress={handleCellPress}
          size={boardSize}
        />

        {isAiThinking && (
          <View style={styles.thinking}>
            <Text style={styles.thinkingText}>AI 思考中...</Text>
          </View>
        )}

        <View style={styles.controls}>
          <Button
            title="返回"
            onPress={onBack}
            variant="secondary"
          />
          <Button
            title="悔棋"
            onPress={handleUndo}
            variant="primary"
          />
          <Button
            title="重新开始"
            onPress={handleRestart}
            variant="danger"
          />
        </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  thinking: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#6200EE',
    borderRadius: 20,
  },
  thinkingText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
});
