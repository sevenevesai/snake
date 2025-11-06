import type { Position, Direction } from '../types';

/**
 * Check if two positions are equal
 */
export function positionsEqual(pos1: Position, pos2: Position): boolean {
  return pos1.x === pos2.x && pos1.y === pos2.y;
}

/**
 * Check if a position is within grid bounds
 */
export function isInBounds(pos: Position, gridSize: number): boolean {
  return pos.x >= 0 && pos.x < gridSize && pos.y >= 0 && pos.y < gridSize;
}

/**
 * Check if two directions are opposite
 */
export function areOppositeDirections(dir1: Direction, dir2: Direction): boolean {
  return dir1.x === -dir2.x && dir1.y === -dir2.y;
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Linear interpolation
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Calculate Manhattan distance between two positions
 */
export function manhattanDistance(pos1: Position, pos2: Position): number {
  return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
}

/**
 * Calculate Euclidean distance between two positions
 */
export function euclideanDistance(pos1: Position, pos2: Position): number {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Get a random position within grid bounds
 */
export function getRandomPosition(gridSize: number): Position {
  return {
    x: Math.floor(Math.random() * gridSize),
    y: Math.floor(Math.random() * gridSize),
  };
}

/**
 * Get a random item from an array
 */
export function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Shuffle an array (Fisher-Yates algorithm)
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Format time in mm:ss format
 */
export function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Format number with thousands separator
 */
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Create a 2D grid initialized with a value
 */
export function createGrid<T>(width: number, height: number, initialValue: T): T[][] {
  return Array.from({ length: height }, () =>
    Array.from({ length: width }, () => initialValue)
  );
}

/**
 * Hash a position to a string key for spatial hashing
 */
export function hashPosition(pos: Position): string {
  return `${pos.x},${pos.y}`;
}

/**
 * Unhash a position string key back to Position
 */
export function unhashPosition(key: string): Position {
  const [x, y] = key.split(',').map(Number);
  return { x, y };
}

/**
 * Calculate score based on combo multiplier
 */
export function calculateScore(baseScore: number, combo: number, level: number): number {
  return Math.floor(baseScore * combo * (1 + level * 0.1));
}

/**
 * Calculate level based on score
 */
export function calculateLevel(score: number, threshold: number): number {
  return Math.floor(score / threshold) + 1;
}

/**
 * Check if a value is within a range
 */
export function inRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Get HSL color for rainbow effect
 */
export function getHSLColor(hue: number, saturation = 100, lightness = 50): string {
  return `hsl(${hue % 360}, ${saturation}%, ${lightness}%)`;
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Calculate moving average for FPS smoothing
 */
export class MovingAverage {
  private values: number[] = [];
  private sum = 0;
  private windowSize: number;

  constructor(windowSize: number) {
    this.windowSize = windowSize;
  }

  add(value: number): number {
    this.values.push(value);
    this.sum += value;

    if (this.values.length > this.windowSize) {
      const removed = this.values.shift()!;
      this.sum -= removed;
    }

    return this.getAverage();
  }

  getAverage(): number {
    return this.values.length > 0 ? this.sum / this.values.length : 0;
  }

  reset(): void {
    this.values = [];
    this.sum = 0;
  }
}

/**
 * Spatial hash grid for optimized collision detection
 */
export class SpatialHashGrid {
  private grid: Map<string, Set<string>> = new Map();
  private objectPositions: Map<string, Position> = new Map();

  /**
   * Insert an object at a position
   */
  insert(id: string, position: Position): void {
    const key = hashPosition(position);

    if (!this.grid.has(key)) {
      this.grid.set(key, new Set());
    }

    this.grid.get(key)!.add(id);
    this.objectPositions.set(id, position);
  }

  /**
   * Remove an object
   */
  remove(id: string): void {
    const position = this.objectPositions.get(id);
    if (position) {
      const key = hashPosition(position);
      this.grid.get(key)?.delete(id);
      this.objectPositions.delete(id);
    }
  }

  /**
   * Update an object's position
   */
  update(id: string, newPosition: Position): void {
    this.remove(id);
    this.insert(id, newPosition);
  }

  /**
   * Query objects at a specific position
   */
  query(position: Position): Set<string> {
    const key = hashPosition(position);
    return this.grid.get(key) || new Set();
  }

  /**
   * Query objects in a radius
   */
  queryRadius(position: Position, radius: number): Set<string> {
    const results = new Set<string>();

    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        const checkPos = { x: position.x + dx, y: position.y + dy };
        const objects = this.query(checkPos);
        objects.forEach(obj => results.add(obj));
      }
    }

    return results;
  }

  /**
   * Clear the entire grid
   */
  clear(): void {
    this.grid.clear();
    this.objectPositions.clear();
  }

  /**
   * Get all objects in the grid
   */
  getAllObjects(): Map<string, Position> {
    return new Map(this.objectPositions);
  }
}

/**
 * Request animation frame with fallback
 */
export const requestAnimFrame = (() => {
  return (
    window.requestAnimationFrame ||
    ((callback: FrameRequestCallback) => window.setTimeout(callback, 1000 / 60))
  );
})();

/**
 * Cancel animation frame with fallback
 */
export const cancelAnimFrame = (() => {
  return window.cancelAnimationFrame || clearTimeout;
})();
