// Core game types
export interface Position {
  x: number;
  y: number;
}

export interface Direction {
  x: -1 | 0 | 1;
  y: -1 | 0 | 1;
}

export const GameState = {
  MENU: 'menu',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'gameover',
  LOADING: 'loading',
} as const;
export type GameState = typeof GameState[keyof typeof GameState];

export const GameMode = {
  CLASSIC: 'classic',
  ARCADE: 'arcade',
  SURVIVAL: 'survival',
  CHALLENGE: 'challenge',
  MULTIPLAYER: 'multiplayer',
} as const;
export type GameMode = typeof GameMode[keyof typeof GameMode];

export const Difficulty = {
  EASY: 'easy',
  NORMAL: 'normal',
  HARD: 'hard',
  INSANE: 'insane',
} as const;
export type Difficulty = typeof Difficulty[keyof typeof Difficulty];

export const Theme = {
  NEON: 'neon',
  CLASSIC: 'classic',
  RAINBOW: 'rainbow',
  FIRE: 'fire',
  ICE: 'ice',
  MATRIX: 'matrix',
  CYBERPUNK: 'cyberpunk',
} as const;
export type Theme = typeof Theme[keyof typeof Theme];

export const PowerUpType = {
  SPEED: 'speed',
  SLOW: 'slow',
  GHOST: 'ghost',
  INVINCIBLE: 'invincible',
  DOUBLE_POINTS: 'double',
  SHRINK: 'shrink',
  MAGNET: 'magnet',
  FREEZE: 'freeze',
} as const;
export type PowerUpType = typeof PowerUpType[keyof typeof PowerUpType];

export interface PowerUp {
  id: string;
  type: PowerUpType;
  position: Position;
  lifetime: number;
  createdAt: number;
}

export interface ActivePowerUp {
  type: PowerUpType;
  duration: number;
  startTime: number;
}

export interface Obstacle {
  id: string;
  position: Position;
  type: 'static' | 'moving';
  movingDirection?: Direction;
}

export interface Food {
  position: Position;
  value: number;
  type: 'normal' | 'bonus' | 'golden';
}

export interface Snake {
  segments: Position[];
  direction: Direction;
  nextDirection: Direction;
  length: number;
}

export interface GameStats {
  score: number;
  level: number;
  lives: number;
  combo: number;
  foodEaten: number;
  powerUpsCollected: number;
  timeElapsed: number;
  highScore: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  target?: number;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'time' | 'score' | 'collection';
  target: number;
  timeLimit?: number;
  reward: number;
}

export interface GameConfig {
  gridSize: number;
  cellSize: number;
  initialSpeed: number;
  speedIncrement: number;
  maxSpeed: number;
  difficulty: Difficulty;
  theme: Theme;
  mode: GameMode;
  soundEnabled: boolean;
  musicEnabled: boolean;
}

export interface CollisionResult {
  type: 'none' | 'wall' | 'self' | 'obstacle' | 'food' | 'powerup';
  position?: Position;
  data?: any;
}

// Performance monitoring
export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  renderTime: number;
  updateTime: number;
  memoryUsage?: number;
}

// Multiplayer types
export interface Player {
  id: string;
  name: string;
  color: string;
  snake: Snake;
  stats: GameStats;
  isAlive: boolean;
}

export interface GameRoom {
  id: string;
  name: string;
  players: Player[];
  maxPlayers: number;
  mode: GameMode;
  status: 'waiting' | 'playing' | 'finished';
}

// Event types
export type GameEvent =
  | { type: 'FOOD_EATEN'; data: { position: Position; points: number } }
  | { type: 'POWER_UP_COLLECTED'; data: { powerUp: PowerUp } }
  | { type: 'COLLISION'; data: { collisionType: string } }
  | { type: 'LEVEL_UP'; data: { level: number } }
  | { type: 'GAME_OVER'; data: { stats: GameStats } }
  | { type: 'ACHIEVEMENT_UNLOCKED'; data: { achievement: Achievement } };
