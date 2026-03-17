/**
 * Board - 棋盘组件
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Cell } from '../services/GameService';

interface BoardProps {
  board: Cell[][];
  onCellPress: (row: number, col: number) => void;
  size?: number;
}

export const Board: React.FC<BoardProps> = ({ board, onCellPress, size }) => {
  const boardSize = size || Math.min(Dimensions.get('window').width, Dimensions.get('window').height) * 0.9;
  const cellSize = boardSize / 15;

  return (
    <View style={[styles.container, { width: boardSize, height: boardSize }]}>
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <TouchableOpacity
            key={`${rowIndex}-${colIndex}`}
            style={[
              styles.cell,
              {
                left: colIndex * cellSize,
                top: rowIndex * cellSize,
                width: cellSize,
                height: cellSize,
              },
            ]}
            onPress={() => onCellPress(rowIndex, colIndex)}
            activeOpacity={0.7}
          >
            {/* 棋子 */}
            {cell !== 'empty' && (
              <View
                style={[
                  styles.piece,
                  {
                    width: cellSize * 0.8,
                    height: cellSize * 0.8,
                    backgroundColor: cell === 'black' ? '#1a1a1a' : '#f5f5f5',
                    shadowColor: cell === 'black' ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.3)',
                  },
                ]}
              />
            )}

            {/* 最后落子标记 */}
            {cell !== 'empty' && isLastMove(board, rowIndex, colIndex) && (
              <View style={styles.lastMoveMarker} />
            )}
          </TouchableOpacity>
        ))
      )}
    </View>
  );
};

const isLastMove = (board: Cell[][], row: number, col: number): boolean => {
  let blackCount = 0;
  let whiteCount = 0;

  for (let r = 0; r < 15; r++) {
    for (let c = 0; c < 15; c++) {
      if (board[r][c] === 'black') blackCount++;
      if (board[r][c] === 'white') whiteCount++;
    }
  }

  const total = blackCount + whiteCount;
  const lastColor = total % 2 === 0 ? 'white' : 'black';

  return board[row][col] === lastColor && isTheLast(board, row, col);
};

const isTheLast = (board: Cell[][], targetRow: number, targetCol: number): boolean => {
  const color = board[targetRow][targetCol];

  for (let r = 0; r < 15; r++) {
    for (let c = 0; c < 15; c++) {
      if (board[r][c] === color) {
        if (r > targetRow || (r === targetRow && c > targetCol)) {
          return false;
        }
      }
    }
  }

  return true;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#DEB887',
    borderRadius: 8,
    position: 'relative',
  },
  cell: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  piece: {
    borderRadius: 9999,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  lastMoveMarker: {
    position: 'absolute',
    width: 4,
    height: 4,
    backgroundColor: '#ff0000',
    borderRadius: 2,
  },
});
