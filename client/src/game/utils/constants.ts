import { Difficulty } from '../types';

// Grid configurations
export const GRID_SIZES = {
  SMALL: 20,
  MEDIUM: 25,
  LARGE: 30,
  XLARGE: 40,
} as const;

export const CELL_SIZE = 16; // pixels
export const TARGET_FPS = 60;
export const FRAME_TIME = 1000 / TARGET_FPS;

// Speed configurations (milliseconds per move)
export const SPEED_CONFIG = {
  [Difficulty.EASY]: {
    initial: 150,
    increment: 3,
    min: 80,
  },
  [Difficulty.NORMAL]: {
    initial: 100,
    increment: 4,
    min: 50,
  },
  [Difficulty.HARD]: {
    initial: 70,
    increment: 5,
    min: 30,
  },
  [Difficulty.INSANE]: {
    initial: 40,
    increment: 3,
    min: 15,
  },
} as const;

// Game mechanics
export const INITIAL_SNAKE_LENGTH = 3;
export const COMBO_TIME_WINDOW = 2000; // ms
export const MAX_COMBO = 20;
export const POWER_UP_DURATION = 5000; // ms
export const POWER_UP_SPAWN_CHANCE = 0.2; // 20%
export const POWER_UP_MAX_COUNT = 3;
export const POWER_UP_LIFETIME = 10000; // ms

// Scoring
export const BASE_FOOD_SCORE = 10;
export const BONUS_FOOD_SCORE = 50;
export const GOLDEN_FOOD_SCORE = 100;
export const LEVEL_UP_THRESHOLD = 100; // score multiplier

// Lives
export const INITIAL_LIVES = {
  [Difficulty.EASY]: 5,
  [Difficulty.NORMAL]: 3,
  [Difficulty.HARD]: 2,
  [Difficulty.INSANE]: 1,
} as const;

// Obstacles
export const OBSTACLE_CONFIG = {
  classic: { count: 0, movingChance: 0 },
  arcade: { count: 5, movingChance: 0.3 },
  survival: { count: 8, movingChance: 0.5 },
  challenge: { count: 10, movingChance: 0.4 },
  multiplayer: { count: 6, movingChance: 0.3 },
} as const;

// Directions
export const DIRECTIONS = {
  UP: { x: 0, y: -1 } as const,
  DOWN: { x: 0, y: 1 } as const,
  LEFT: { x: -1, y: 0 } as const,
  RIGHT: { x: 1, y: 0 } as const,
} as const;

// Key mappings
export const KEY_MAPPINGS = {
  ArrowUp: DIRECTIONS.UP,
  ArrowDown: DIRECTIONS.DOWN,
  ArrowLeft: DIRECTIONS.LEFT,
  ArrowRight: DIRECTIONS.RIGHT,
  w: DIRECTIONS.UP,
  W: DIRECTIONS.UP,
  s: DIRECTIONS.DOWN,
  S: DIRECTIONS.DOWN,
  a: DIRECTIONS.LEFT,
  A: DIRECTIONS.LEFT,
  d: DIRECTIONS.RIGHT,
  D: DIRECTIONS.RIGHT,
} as const;

// Theme colors
export const THEME_COLORS = {
  neon: {
    head: '#00ff00',
    body: '#00cc00',
    glow: 'rgba(0, 255, 0, 0.5)',
    food: '#ff0000',
  },
  classic: {
    head: '#4CAF50',
    body: '#388E3C',
    glow: null,
    food: '#f44336',
  },
  rainbow: {
    head: null, // Dynamic
    body: null, // Dynamic
    glow: 'rgba(255, 255, 255, 0.3)',
    food: '#ffd700',
  },
  fire: {
    head: '#ff6600',
    body: '#ff3300',
    glow: 'rgba(255, 100, 0, 0.5)',
    food: '#ffff00',
  },
  ice: {
    head: '#00ffff',
    body: '#0099ff',
    glow: 'rgba(0, 200, 255, 0.5)',
    food: '#ffffff',
  },
  matrix: {
    head: '#00ff00',
    body: '#008800',
    glow: 'rgba(0, 255, 0, 0.3)',
    food: '#00ff00',
  },
  cyberpunk: {
    head: '#ff00ff',
    body: '#cc00cc',
    glow: 'rgba(255, 0, 255, 0.5)',
    food: '#00ffff',
  },
} as const;

// Achievement definitions
export const ACHIEVEMENTS = [
  {
    id: 'first_food',
    name: 'First Bite',
    description: 'Eat your first food',
    icon: '🍎',
    target: 1,
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Reach maximum speed',
    icon: '⚡',
    target: 1,
  },
  {
    id: 'survivor',
    name: 'Survivor',
    description: 'Survive for 5 minutes',
    icon: '⏰',
    target: 300000, // ms
  },
  {
    id: 'combo_master',
    name: 'Combo Master',
    description: 'Achieve a 10x combo',
    icon: '🔥',
    target: 10,
  },
  {
    id: 'level_10',
    name: 'Level Master',
    description: 'Reach level 10',
    icon: '🏆',
    target: 10,
  },
  {
    id: 'score_1000',
    name: 'High Scorer',
    description: 'Score 1000 points',
    icon: '💯',
    target: 1000,
  },
  {
    id: 'perfect_level',
    name: 'Perfectionist',
    description: 'Complete a level without taking damage',
    icon: '✨',
    target: 1,
  },
  {
    id: 'power_collector',
    name: 'Power Collector',
    description: 'Collect 20 power-ups',
    icon: '💪',
    target: 20,
  },
  {
    id: 'snake_long',
    name: 'Python',
    description: 'Grow snake to 50 segments',
    icon: '🐍',
    target: 50,
  },
  {
    id: 'challenge_complete',
    name: 'Challenge Champion',
    description: 'Complete 5 challenges',
    icon: '🎯',
    target: 5,
  },
  {
    id: 'no_death',
    name: 'Immortal',
    description: 'Reach level 5 without dying',
    icon: '👑',
    target: 5,
  },
  {
    id: 'speedrun',
    name: 'Speedrunner',
    description: 'Reach level 10 in under 3 minutes',
    icon: '🏃',
    target: 180000, // ms
  },
] as const;

// Sound frequencies for Web Audio API
export const SOUND_FREQUENCIES = {
  eat: { start: 523, end: 784, duration: 0.1 },
  powerup: { start: 400, end: 800, duration: 0.3 },
  hit: { start: 200, end: 100, duration: 0.2 },
  levelup: { notes: [523, 659, 784], duration: 0.2 },
  gameover: { start: 300, end: 50, duration: 0.5 },
} as const;

// Performance thresholds
export const PERFORMANCE_THRESHOLDS = {
  MIN_FPS: 30,
  WARN_FPS: 45,
  TARGET_FPS: 60,
  MAX_FRAME_TIME: 33, // ms (30 FPS)
} as const;

// Storage keys
export const STORAGE_KEYS = {
  HIGH_SCORE: 'snake_high_score',
  STATS: 'snake_stats',
  ACHIEVEMENTS: 'snake_achievements',
  SETTINGS: 'snake_settings',
  USER_DATA: 'snake_user_data',
} as const;
