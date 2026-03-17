/**
 * GameService - 游戏核心逻辑
 */

export type Cell = 'empty' | 'black' | 'white';
export type Player = 'black' | 'white';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type GameMode = 'ai' | 'local' | 'online';

export interface GameState {
  board: Cell[][];
  currentPlayer: Player;
  gameOver: boolean;
  winner: Player | null;
  moveHistory: { player: Player; row: number; col: number }[];
  timeLeft: number;
}

export interface GameResult {
  winner: Player | null;
  moves: number;
  duration: number;
}

export const BOARD_SIZE = 15;
export const TIME_LIMIT = 30; // 每步 30 秒

export class GameService {
  private board: Cell[][];
  private currentPlayer: Player;
  private gameOver: boolean;
  private winner: Player | null;
  private moveHistory: { player: Player; row: number; col: number }[];
  private timeLeft: number;
  private timer: NodeJS.Timeout | null;
  private startTime: number;
  private playerColor: Player;
  private gameMode: GameMode;
  private aiDifficulty: Difficulty;

  constructor(
    playerColor: Player = 'black',
    gameMode: GameMode = 'ai',
    aiDifficulty: Difficulty = 'medium'
  ) {
    this.playerColor = playerColor;
    this.gameMode = gameMode;
    this.aiDifficulty = aiDifficulty;
    this.reset();
  }

  /**
   * 重置游戏
   */
  reset(): void {
    this.board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill('empty'));
    this.currentPlayer = 'black';
    this.gameOver = false;
    this.winner = null;
    this.moveHistory = [];
    this.timeLeft = TIME_LIMIT;
    this.timer = null;
    this.startTime = Date.now();
  }

  /**
   * 获取当前游戏状态
   */
  getState(): GameState {
    return {
      board: this.board,
      currentPlayer: this.currentPlayer,
      gameOver: this.gameOver,
      winner: this.winner,
      moveHistory: [...this.moveHistory],
      timeLeft: this.timeLeft,
    };
  }

  /**
   * 下棋
   */
  makeMove(row: number, col: number): boolean {
    if (this.gameOver || this.board[row][col] !== 'empty') {
      return false;
    }

    this.board[row][col] = this.currentPlayer;
    this.moveHistory.push({ player: this.currentPlayer, row, col });

    // 检查胜负
    if (this.checkWin(row, col)) {
      this.gameOver = true;
      this.winner = this.currentPlayer;
      this.stopTimer();
      return true;
    }

    // 检查平局
    if (this.moveHistory.length === BOARD_SIZE * BOARD_SIZE) {
      this.gameOver = true;
      this.winner = null;
      this.stopTimer();
      return true;
    }

    // 切换玩家
    this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
    this.timeLeft = TIME_LIMIT;
    this.restartTimer();

    return true;
  }

  /**
   * 悔棋
   */
  undoMove(): boolean {
    if (this.moveHistory.length === 0 || this.gameOver) {
      return false;
    }

    const lastMove = this.moveHistory.pop()!;
    this.board[lastMove.row][lastMove.col] = 'empty';
    this.currentPlayer = lastMove.player;

    return true;
  }

  /**
   * 检查胜负
   */
  private checkWin(row: number, col: number): boolean {
    const player = this.board[row][col];
    const directions = [
      [0, 1],   // 横向
      [1, 0],   // 纵向
      [1, 1],   // 主对角线
      [1, -1],  // 副对角线
    ];

    for (const [dr, dc] of directions) {
      let count = 1;

      // 正方向
      for (let i = 1; i < 5; i++) {
        const r = row + dr * i;
        const c = col + dc * i;
        if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) break;
        if (this.board[r][c] !== player) break;
        count++;
      }

      // 反方向
      for (let i = 1; i < 5; i++) {
        const r = row - dr * i;
        const c = col - dc * i;
        if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) break;
        if (this.board[r][c] !== player) break;
        count++;
      }

      if (count >= 5) {
        return true;
      }
    }

    return false;
  }

  /**
   * 计时器
   */
  startTimer(): void {
    this.stopTimer();
    this.restartTimer();
  }

  private restartTimer(): void {
    this.stopTimer();
    this.timer = setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft <= 0) {
        this.handleTimeout();
      }
    }, 1000);
  }

  stopTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private handleTimeout(): void {
    this.stopTimer();
    this.gameOver = true;
    this.winner = this.currentPlayer === 'black' ? 'white' : 'black';
  }

  /**
   * 获取游戏结果
   */
  getResult(): GameResult {
    return {
      winner: this.winner,
      moves: this.moveHistory.length,
      duration: Math.floor((Date.now() - this.startTime) / 1000),
    };
  }

  /**
   * 获取有效移动
   */
  getValidMoves(): { row: number; col: number }[] {
    const validMoves: { row: number; col: number }[] = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (this.board[i][j] === 'empty') {
          validMoves.push({ row: i, col: j });
        }
      }
    }
    return validMoves;
  }

  /**
   * 判断是否是玩家回合
   */
  isPlayerTurn(): boolean {
    return this.currentPlayer === this.playerColor && this.gameMode === 'ai';
  }

  /**
   * 清理
   */
  dispose(): void {
    this.stopTimer();
  }
}
