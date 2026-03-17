/**
 * AiService - AI 对手逻辑
 */

import { Cell, Player, Difficulty, GameState } from './GameService';

export interface AiMove {
  row: number;
  col: number;
  score: number;
}

export class AiService {
  private difficulty: Difficulty;
  private aiColor: Player;

  constructor(difficulty: Difficulty = 'medium', aiColor: Player = 'white') {
    this.difficulty = difficulty;
    this.aiColor = aiColor;
  }

  /**
   * 计算最佳移动
   */
  getBestMove(state: GameState): AiMove {
    const startTime = Date.now();

    let move: AiMove;

    switch (this.difficulty) {
      case 'easy':
        move = this.getEasyMove(state);
        break;
      case 'medium':
        move = this.getMediumMove(state);
        break;
      case 'hard':
        move = this.getHardMove(state);
        break;
    }

    const duration = Date.now() - startTime;
    console.log(`AI (${this.difficulty}) 计算耗时: ${duration}ms, 分数: ${move.score}`);

    return move;
  }

  /**
   * 简单难度：随机 + 基础攻防
   */
  private getEasyMove(state: GameState): AiMove {
    const validMoves = this.getValidMoves(state);

    // 30% 概率随机移动
    if (Math.random() < 0.3) {
      const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
      return { ...randomMove, score: 0 };
    }

    // 70% 概率基础评分
    let bestMove = validMoves[0];
    let bestScore = -Infinity;

    for (const move of validMoves) {
      const score = this.evaluatePosition(state, move.row, move.col, this.aiColor);
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return { ...bestMove, score: bestScore };
  }

  /**
   * 中等难度：Minimax 深度 2
   */
  private getMediumMove(state: GameState): AiMove {
    const validMoves = this.getValidMoves(state);
    let bestMove = validMoves[0];
    let bestScore = -Infinity;

    for (const move of validMoves) {
      const newState = this.simulateMove(state, move.row, move.col, this.aiColor);
      const score = this.minimax(newState, 2, false, -Infinity, Infinity);
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return { ...bestMove, score: bestScore };
  }

  /**
   * 困难难度：Minimax 深度 4 + Alpha-Beta 剪枝
   */
  private getHardMove(state: GameState): AiMove {
    const validMoves = this.getValidMoves(state);
    let bestMove = validMoves[0];
    let bestScore = -Infinity;

    for (const move of validMoves) {
      const newState = this.simulateMove(state, move.row, move.col, this.aiColor);
      const score = this.minimax(newState, 4, false, -Infinity, Infinity);
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return { ...bestMove, score: bestScore };
  }

  /**
   * Minimax 算法
   */
  private minimax(
    state: GameState,
    depth: number,
    isMaximizing: boolean,
    alpha: number,
    beta: number
  ): number {
    // 检查终止条件
    const gameOver = this.checkGameOver(state);
    if (gameOver || depth === 0) {
      return this.evaluateState(state);
    }

    const validMoves = this.getValidMoves(state);

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of validMoves) {
        const newState = this.simulateMove(state, move.row, move.col, this.aiColor);
        const eval_ = this.minimax(newState, depth - 1, false, alpha, beta);
        maxEval = Math.max(maxEval, eval_);
        alpha = Math.max(alpha, eval_);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      const opponentColor = this.aiColor === 'black' ? 'white' : 'black';
      for (const move of validMoves) {
        const newState = this.simulateMove(state, move.row, move.col, opponentColor);
        const eval_ = this.minimax(newState, depth - 1, true, alpha, beta);
        minEval = Math.min(minEval, eval_);
        beta = Math.min(beta, eval_);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }

  /**
   * 评估位置
   */
  private evaluatePosition(
    state: GameState,
    row: number,
    col: number,
    player: Player
  ): number {
    let score = 0;
    const opponent = player === 'black' ? 'white' : 'black';

    // 评估进攻
    score += this.evaluateDirection(state, row, col, player, 1);

    // 评估防守
    score += this.evaluateDirection(state, row, col, opponent, 0.8);

    return score;
  }

  /**
   * 评估方向
   */
  private evaluateDirection(
    state: GameState,
    row: number,
    col: number,
    player: Player,
    weight: number
  ): number {
    let score = 0;
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];

    for (const [dr, dc] of directions) {
      const line = this.getLine(state, row, col, dr, dc, player);
      score += this.evaluateLine(line) * weight;
    }

    return score;
  }

  /**
   * 获取棋子连线
   */
  private getLine(
    state: GameState,
    row: number,
    col: number,
    dr: number,
    dc: number,
    player: Player
  ): number[] {
    const line: number[] = [];

    // 正方向
    for (let i = -4; i <= 4; i++) {
      const r = row + dr * i;
      const c = col + dc * i;
      if (r < 0 || r >= 15 || c < 0 || c >= 15) {
        line.push(-1);
        continue;
      }
      const cell = state.board[r][c];
      if (cell === player) {
        line.push(1);
      } else if (cell === 'empty') {
        line.push(0);
      } else {
        line.push(-1);
      }
    }

    return line;
  }

  /**
   * 评估连线
   */
  private evaluateLine(line: number[]): number {
    let score = 0;
    const consecutive = this.countConsecutive(line);
    const openEnds = this.countOpenEnds(line);

    if (consecutive >= 5) return 100000;
    if (consecutive === 4 && openEnds >= 1) return 10000;
    if (consecutive === 3 && openEnds >= 2) return 1000;
    if (consecutive === 3 && openEnds >= 1) return 100;
    if (consecutive === 2 && openEnds >= 2) return 10;
    if (consecutive === 2 && openEnds >= 1) return 1;

    return score;
  }

  /**
   * 计算连续棋子
   */
  private countConsecutive(line: number[]): number {
    let maxCount = 0;
    let currentCount = 0;

    for (const value of line) {
      if (value === 1) {
        currentCount++;
      } else {
        maxCount = Math.max(maxCount, currentCount);
        currentCount = 0;
      }
    }
    maxCount = Math.max(maxCount, currentCount);

    return maxCount;
  }

  /**
   * 计算开放端
   */
  private countOpenEnds(line: number[]): number {
    let count = 0;

    // 检查两端是否为空
    if (line[0] === 0) count++;
    if (line[line.length - 1] === 0) count++;

    // 检查中间的开放端
    for (let i = 1; i < line.length - 1; i++) {
      if (line[i] === 1 && line[i - 1] === 0 && line[i + 1] === 1) {
        count++;
      }
    }

    return count;
  }

  /**
   * 评估状态
   */
  private evaluateState(state: GameState): number {
    if (state.winner === this.aiColor) return 100000;
    if (state.winner && state.winner !== this.aiColor) return -100000;

    let score = 0;
    const opponent = this.aiColor === 'black' ? 'white' : 'black';

    for (let i = 0; i < 15; i++) {
      for (let j = 0; j < 15; j++) {
        if (state.board[i][j] === this.aiColor) {
          score += this.evaluatePosition(state, i, j, this.aiColor);
        } else if (state.board[i][j] === opponent) {
          score -= this.evaluatePosition(state, i, j, opponent);
        }
      }
    }

    return score;
  }

  /**
   * 获取有效移动
   */
  private getValidMoves(state: GameState): { row: number; col: number }[] {
    const validMoves: { row: number; col: number }[] = [];
    const hasNeighbor = (row: number, col: number): boolean => {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const r = row + dr;
          const c = col + dc;
          if (r >= 0 && r < 15 && c >= 0 && c < 15) {
            if (state.board[r][c] !== 'empty') return true;
          }
        }
      }
      return false;
    };

    for (let i = 0; i < 15; i++) {
      for (let j = 0; j < 15; j++) {
        if (state.board[i][j] === 'empty' && hasNeighbor(i, j)) {
          validMoves.push({ row: i, col: j });
        }
      }
    }

    // 如果没有邻居，返回中心点
    if (validMoves.length === 0) {
      validMoves.push({ row: 7, col: 7 });
    }

    return validMoves;
  }

  /**
   * 模拟移动
   */
  private simulateMove(
    state: GameState,
    row: number,
    col: number,
    player: Player
  ): GameState {
    const newBoard = state.board.map(r => [...r]);
    newBoard[row][col] = player;

    const newState: GameState = {
      ...state,
      board: newBoard,
    };

    // 检查胜负
    const winner = this.checkWin(newBoard, row, col);
    if (winner) {
      newState.gameOver = true;
      newState.winner = winner;
    }

    return newState;
  }

  /**
   * 检查游戏结束
   */
  private checkGameOver(state: GameState): boolean {
    return state.gameOver;
  }

  /**
   * 检查胜负
   */
  private checkWin(board: Cell[][], row: number, col: number): Player | null {
    const player = board[row][col];
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];

    for (const [dr, dc] of directions) {
      let count = 1;

      for (let i = 1; i < 5; i++) {
        const r = row + dr * i;
        const c = col + dc * i;
        if (r < 0 || r >= 15 || c < 0 || c >= 15) break;
        if (board[r][c] !== player) break;
        count++;
      }

      for (let i = 1; i < 5; i++) {
        const r = row - dr * i;
        const c = col - dc * i;
        if (r < 0 || r >= 15 || c < 0 || c >= 15) break;
        if (board[r][c] !== player) break;
        count++;
      }

      if (count >= 5) {
        return player;
      }
    }

    return null;
  }
}
