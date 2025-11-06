import {
  GameState,
  GameMode,
  PowerUpType,
  type Position,
  type Direction,
  type Snake,
  type Food,
  type PowerUp,
  type Obstacle,
  type ActivePowerUp,
  type GameStats,
  type GameConfig,
  type CollisionResult,
  type PerformanceMetrics,
  type GameEvent,
} from '../types';
import {
  positionsEqual,
  isInBounds,
  areOppositeDirections,
  generateId,
  calculateScore,
  calculateLevel,
  SpatialHashGrid,
  MovingAverage,
} from '../utils/helpers';
import {
  DIRECTIONS,
  INITIAL_SNAKE_LENGTH,
  BASE_FOOD_SCORE,
  COMBO_TIME_WINDOW,
  MAX_COMBO,
  SPEED_CONFIG,
  POWER_UP_DURATION,
  POWER_UP_SPAWN_CHANCE,
  INITIAL_LIVES,
  LEVEL_UP_THRESHOLD,
  OBSTACLE_CONFIG,
} from '../utils/constants';

export class GameEngine {
  // Core game state
  private state: GameState = GameState.MENU;
  private config: GameConfig;

  // Game entities
  private snake: Snake;
  private food: Food | null = null;
  private powerUps: PowerUp[] = [];
  private obstacles: Obstacle[] = [];
  private activePowerUp: ActivePowerUp | null = null;

  // Game stats
  private stats: GameStats;

  // Timing
  private lastFoodTime = 0;
  private moveAccumulator = 0;
  private currentSpeed = 100;

  // Performance tracking
  private frameCount = 0;
  private fpsAverage = new MovingAverage(60);
  private lastFrameTime = 0;

  // Collision detection optimization
  private spatialGrid: SpatialHashGrid;

  // Event callbacks
  private eventCallbacks: Map<string, Set<(event: GameEvent) => void>> = new Map();

  constructor(config: GameConfig) {
    this.config = config;
    this.spatialGrid = new SpatialHashGrid();

    // Initialize snake in center
    const center = Math.floor(config.gridSize / 2);
    this.snake = {
      segments: Array.from({ length: INITIAL_SNAKE_LENGTH }, (_, i) => ({
        x: center - i,
        y: center,
      })),
      direction: DIRECTIONS.RIGHT,
      nextDirection: DIRECTIONS.RIGHT,
      length: INITIAL_SNAKE_LENGTH,
    };

    // Initialize stats
    this.stats = {
      score: 0,
      level: 1,
      lives: INITIAL_LIVES[config.difficulty],
      combo: 1,
      foodEaten: 0,
      powerUpsCollected: 0,
      timeElapsed: 0,
      highScore: 0,
    };

    this.currentSpeed = SPEED_CONFIG[config.difficulty].initial;
  }

  /**
   * Initialize or reset the game
   */
  public init(): void {
    this.reset();
    this.spawnFood();
    this.generateObstacles();
    this.updateSpatialGrid();
  }

  /**
   * Reset game to initial state
   */
  private reset(): void {
    const center = Math.floor(this.config.gridSize / 2);

    this.snake = {
      segments: Array.from({ length: INITIAL_SNAKE_LENGTH }, (_, i) => ({
        x: center - i,
        y: center,
      })),
      direction: DIRECTIONS.RIGHT,
      nextDirection: DIRECTIONS.RIGHT,
      length: INITIAL_SNAKE_LENGTH,
    };

    this.stats = {
      ...this.stats,
      score: 0,
      level: 1,
      lives: INITIAL_LIVES[this.config.difficulty],
      combo: 1,
      foodEaten: 0,
      powerUpsCollected: 0,
      timeElapsed: 0,
    };

    this.food = null;
    this.powerUps = [];
    this.obstacles = [];
    this.activePowerUp = null;
    this.moveAccumulator = 0;
    this.lastFoodTime = Date.now();
    this.currentSpeed = SPEED_CONFIG[this.config.difficulty].initial;

    this.spatialGrid.clear();
  }

  /**
   * Main game update loop
   */
  public update(deltaTime: number): void {
    if (this.state !== GameState.PLAYING) return;

    this.stats.timeElapsed += deltaTime;
    this.moveAccumulator += deltaTime;

    // Update at fixed timestep based on current speed
    if (this.moveAccumulator >= this.currentSpeed) {
      this.moveAccumulator = 0;
      this.updateGameLogic();
    }

    // Update power-ups
    this.updatePowerUps(deltaTime);

    // Update moving obstacles
    if (this.frameCount % 10 === 0) {
      this.updateObstacles();
    }

    this.frameCount++;
  }

  /**
   * Core game logic update
   */
  private updateGameLogic(): void {
    // Update direction
    this.snake.direction = { ...this.snake.nextDirection };

    // Calculate new head position
    const currentHead = this.snake.segments[0];
    let newHead: Position = {
      x: currentHead.x + this.snake.direction.x,
      y: currentHead.y + this.snake.direction.y,
    };

    // Handle wall collision based on power-ups
    const collision = this.checkCollision(newHead);

    if (collision.type === 'wall') {
      if (this.activePowerUp?.type === PowerUpType.GHOST) {
        // Wrap around
        newHead = this.wrapPosition(newHead);
      } else {
        this.handleDeath();
        return;
      }
    }

    // Check self collision
    if (collision.type === 'self' && this.activePowerUp?.type !== PowerUpType.INVINCIBLE) {
      this.handleDeath();
      return;
    }

    // Check obstacle collision
    if (collision.type === 'obstacle' &&
        this.activePowerUp?.type !== PowerUpType.INVINCIBLE &&
        this.activePowerUp?.type !== PowerUpType.GHOST) {
      this.handleDeath();
      return;
    }

    // Move snake
    this.snake.segments.unshift(newHead);

    // Check food collision
    if (collision.type === 'food') {
      this.eatFood();
    } else {
      this.snake.segments.pop();
    }

    // Check power-up collision
    if (collision.type === 'powerup' && collision.data) {
      this.collectPowerUp(collision.data as PowerUp);
    }

    // Update spatial grid
    this.updateSpatialGrid();
  }

  /**
   * Check collision at a position
   */
  private checkCollision(pos: Position): CollisionResult {
    // Check walls
    if (!isInBounds(pos, this.config.gridSize)) {
      return { type: 'wall', position: pos };
    }

    // Check self collision
    for (const segment of this.snake.segments) {
      if (positionsEqual(pos, segment)) {
        return { type: 'self', position: pos };
      }
    }

    // Check food
    if (this.food && positionsEqual(pos, this.food.position)) {
      return { type: 'food', position: pos, data: this.food };
    }

    // Check power-ups
    for (const powerUp of this.powerUps) {
      if (positionsEqual(pos, powerUp.position)) {
        return { type: 'powerup', position: pos, data: powerUp };
      }
    }

    // Check obstacles
    for (const obstacle of this.obstacles) {
      if (positionsEqual(pos, obstacle.position)) {
        return { type: 'obstacle', position: pos, data: obstacle };
      }
    }

    return { type: 'none' };
  }

  /**
   * Wrap position around grid (for ghost mode)
   */
  private wrapPosition(pos: Position): Position {
    return {
      x: ((pos.x % this.config.gridSize) + this.config.gridSize) % this.config.gridSize,
      y: ((pos.y % this.config.gridSize) + this.config.gridSize) % this.config.gridSize,
    };
  }

  /**
   * Handle eating food
   */
  private eatFood(): void {
    if (!this.food) return;

    // Update combo
    const now = Date.now();
    if (now - this.lastFoodTime < COMBO_TIME_WINDOW) {
      this.stats.combo = Math.min(this.stats.combo + 1, MAX_COMBO);
    } else {
      this.stats.combo = 1;
    }
    this.lastFoodTime = now;

    // Calculate and add score
    const baseScore = this.food.value;
    const points = calculateScore(baseScore, this.stats.combo, this.stats.level);
    this.stats.score += points;
    this.stats.foodEaten++;

    // Emit event
    this.emitEvent({
      type: 'FOOD_EATEN',
      data: { position: this.food.position, points },
    });

    // Check level up
    const newLevel = calculateLevel(this.stats.score, LEVEL_UP_THRESHOLD);
    if (newLevel > this.stats.level) {
      this.levelUp(newLevel);
    }

    // Spawn new food
    this.spawnFood();

    // Maybe spawn power-up (arcade mode)
    if (this.config.mode === GameMode.ARCADE && Math.random() < POWER_UP_SPAWN_CHANCE) {
      this.spawnPowerUp();
    }
  }

  /**
   * Spawn food at random position
   */
  private spawnFood(): void {
    const availablePositions = this.getAvailablePositions();

    if (availablePositions.length === 0) {
      // Grid is full - unlikely but possible
      return;
    }

    const position = availablePositions[Math.floor(Math.random() * availablePositions.length)];

    // Determine food type
    const rand = Math.random();
    let type: 'normal' | 'bonus' | 'golden';
    let value: number;

    if (rand < 0.05) {
      type = 'golden';
      value = 100;
    } else if (rand < 0.2) {
      type = 'bonus';
      value = 50;
    } else {
      type = 'normal';
      value = BASE_FOOD_SCORE;
    }

    this.food = { position, type, value };
  }

  /**
   * Spawn a power-up
   */
  private spawnPowerUp(): void {
    if (this.powerUps.length >= 3) return;

    const availablePositions = this.getAvailablePositions();
    if (availablePositions.length === 0) return;

    const position = availablePositions[Math.floor(Math.random() * availablePositions.length)];

    const types = Object.values(PowerUpType);
    const type = types[Math.floor(Math.random() * types.length)];

    const powerUp: PowerUp = {
      id: generateId(),
      type,
      position,
      lifetime: 10000,
      createdAt: Date.now(),
    };

    this.powerUps.push(powerUp);
  }

  /**
   * Collect a power-up
   */
  private collectPowerUp(powerUp: PowerUp): void {
    this.stats.powerUpsCollected++;

    // Remove from array
    this.powerUps = this.powerUps.filter(p => p.id !== powerUp.id);

    // Activate power-up
    this.activePowerUp = {
      type: powerUp.type,
      duration: POWER_UP_DURATION,
      startTime: Date.now(),
    };

    // Apply immediate effects
    switch (powerUp.type) {
      case PowerUpType.DOUBLE_POINTS:
        this.stats.score *= 2;
        break;
      case PowerUpType.SHRINK:
        if (this.snake.segments.length > 3) {
          this.snake.segments = this.snake.segments.slice(0, Math.ceil(this.snake.segments.length / 2));
        }
        break;
      case PowerUpType.SPEED:
        this.currentSpeed = Math.max(this.currentSpeed * 0.5, 20);
        break;
      case PowerUpType.SLOW:
        this.currentSpeed = Math.min(this.currentSpeed * 2, 300);
        break;
    }

    this.emitEvent({
      type: 'POWER_UP_COLLECTED',
      data: { powerUp },
    });
  }

  /**
   * Update active power-ups
   */
  private updatePowerUps(_deltaTime: number): void {
    // Update power-up lifetimes
    this.powerUps = this.powerUps.filter(p => {
      const age = Date.now() - p.createdAt;
      return age < p.lifetime;
    });

    // Update active power-up
    if (this.activePowerUp) {
      const elapsed = Date.now() - this.activePowerUp.startTime;

      if (elapsed >= this.activePowerUp.duration) {
        // Deactivate
        const type = this.activePowerUp.type;

        // Reverse speed effects
        if (type === PowerUpType.SPEED) {
          this.currentSpeed = Math.min(this.currentSpeed * 2,
            SPEED_CONFIG[this.config.difficulty].initial);
        } else if (type === PowerUpType.SLOW) {
          this.currentSpeed = Math.max(this.currentSpeed * 0.5,
            SPEED_CONFIG[this.config.difficulty].initial);
        }

        this.activePowerUp = null;
      }
    }
  }

  /**
   * Generate obstacles based on mode
   */
  private generateObstacles(): void {
    this.obstacles = [];

    const obstacleConfig = OBSTACLE_CONFIG[this.config.mode];
    const count = Math.min(obstacleConfig.count + this.stats.level - 1, 15);

    for (let i = 0; i < count; i++) {
      const availablePositions = this.getAvailablePositions();
      if (availablePositions.length === 0) break;

      const position = availablePositions[Math.floor(Math.random() * availablePositions.length)];

      const isMoving = Math.random() < obstacleConfig.movingChance;

      this.obstacles.push({
        id: generateId(),
        position,
        type: isMoving ? 'moving' : 'static',
        movingDirection: isMoving ? this.getRandomDirection() : undefined,
      });
    }
  }

  /**
   * Update moving obstacles
   */
  private updateObstacles(): void {
    for (const obstacle of this.obstacles) {
      if (obstacle.type === 'moving' && obstacle.movingDirection) {
        const newPos: Position = {
          x: obstacle.position.x + obstacle.movingDirection.x,
          y: obstacle.position.y + obstacle.movingDirection.y,
        };

        // Bounce off walls
        if (!isInBounds(newPos, this.config.gridSize)) {
          obstacle.movingDirection = {
            x: -obstacle.movingDirection.x as -1 | 0 | 1,
            y: -obstacle.movingDirection.y as -1 | 0 | 1,
          };
        } else {
          // Check if position is occupied by snake or food
          const occupied = this.snake.segments.some(s => positionsEqual(s, newPos)) ||
                         (this.food && positionsEqual(this.food.position, newPos));

          if (!occupied) {
            obstacle.position = newPos;
          } else {
            // Reverse direction
            obstacle.movingDirection = {
              x: -obstacle.movingDirection.x as -1 | 0 | 1,
              y: -obstacle.movingDirection.y as -1 | 0 | 1,
            };
          }
        }
      }
    }
  }

  /**
   * Get random direction
   */
  private getRandomDirection(): Direction {
    const directions = [DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.RIGHT];
    return directions[Math.floor(Math.random() * directions.length)];
  }

  /**
   * Get all available positions on the grid
   */
  private getAvailablePositions(): Position[] {
    const available: Position[] = [];

    for (let x = 0; x < this.config.gridSize; x++) {
      for (let y = 0; y < this.config.gridSize; y++) {
        const pos = { x, y };

        // Check if position is occupied
        const occupied =
          this.snake.segments.some(s => positionsEqual(s, pos)) ||
          (this.food && positionsEqual(this.food.position, pos)) ||
          this.powerUps.some(p => positionsEqual(p.position, pos)) ||
          this.obstacles.some(o => positionsEqual(o.position, pos));

        if (!occupied) {
          available.push(pos);
        }
      }
    }

    return available;
  }

  /**
   * Update spatial grid for optimized collision detection
   */
  private updateSpatialGrid(): void {
    this.spatialGrid.clear();

    // Add snake segments
    this.snake.segments.forEach((segment, index) => {
      this.spatialGrid.insert(`snake-${index}`, segment);
    });

    // Add food
    if (this.food) {
      this.spatialGrid.insert('food', this.food.position);
    }

    // Add power-ups
    this.powerUps.forEach(powerUp => {
      this.spatialGrid.insert(`powerup-${powerUp.id}`, powerUp.position);
    });

    // Add obstacles
    this.obstacles.forEach(obstacle => {
      this.spatialGrid.insert(`obstacle-${obstacle.id}`, obstacle.position);
    });
  }

  /**
   * Level up
   */
  private levelUp(newLevel: number): void {
    this.stats.level = newLevel;

    // Increase speed
    const speedConfig = SPEED_CONFIG[this.config.difficulty];
    this.currentSpeed = Math.max(
      speedConfig.initial - (newLevel - 1) * speedConfig.increment,
      speedConfig.min
    );

    // Regenerate obstacles
    this.generateObstacles();

    this.emitEvent({
      type: 'LEVEL_UP',
      data: { level: newLevel },
    });
  }

  /**
   * Handle snake death
   */
  private handleDeath(): void {
    this.stats.lives--;

    this.emitEvent({
      type: 'COLLISION',
      data: { collisionType: 'death' },
    });

    if (this.stats.lives <= 0) {
      this.gameOver();
    } else {
      // Reset snake position
      this.resetSnakePosition();
    }
  }

  /**
   * Reset snake to center
   */
  private resetSnakePosition(): void {
    const center = Math.floor(this.config.gridSize / 2);
    this.snake.segments = Array.from({ length: INITIAL_SNAKE_LENGTH }, (_, i) => ({
      x: center - i,
      y: center,
    }));
    this.snake.direction = DIRECTIONS.RIGHT;
    this.snake.nextDirection = DIRECTIONS.RIGHT;
  }

  /**
   * Game over
   */
  private gameOver(): void {
    this.state = GameState.GAME_OVER;

    this.emitEvent({
      type: 'GAME_OVER',
      data: { stats: { ...this.stats } },
    });
  }

  /**
   * Change snake direction
   */
  public changeDirection(direction: Direction): void {
    // Prevent 180-degree turns
    if (!areOppositeDirections(direction, this.snake.direction)) {
      this.snake.nextDirection = direction;
    }
  }

  /**
   * Get current game state
   */
  public getState(): GameState {
    return this.state;
  }

  /**
   * Set game state
   */
  public setState(state: GameState): void {
    this.state = state;
  }

  /**
   * Get snake data
   */
  public getSnake(): Snake {
    return { ...this.snake };
  }

  /**
   * Get food data
   */
  public getFood(): Food | null {
    return this.food ? { ...this.food } : null;
  }

  /**
   * Get power-ups
   */
  public getPowerUps(): PowerUp[] {
    return [...this.powerUps];
  }

  /**
   * Get obstacles
   */
  public getObstacles(): Obstacle[] {
    return [...this.obstacles];
  }

  /**
   * Get active power-up
   */
  public getActivePowerUp(): ActivePowerUp | null {
    return this.activePowerUp ? { ...this.activePowerUp } : null;
  }

  /**
   * Get game stats
   */
  public getStats(): GameStats {
    return { ...this.stats };
  }

  /**
   * Get game config
   */
  public getConfig(): GameConfig {
    return { ...this.config };
  }

  /**
   * Subscribe to game events
   */
  public on(eventType: string, callback: (event: GameEvent) => void): () => void {
    if (!this.eventCallbacks.has(eventType)) {
      this.eventCallbacks.set(eventType, new Set());
    }

    this.eventCallbacks.get(eventType)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.eventCallbacks.get(eventType)?.delete(callback);
    };
  }

  /**
   * Emit a game event
   */
  private emitEvent(event: GameEvent): void {
    const callbacks = this.eventCallbacks.get(event.type);
    if (callbacks) {
      callbacks.forEach(callback => callback(event));
    }
  }

  /**
   * Get performance metrics
   */
  public getPerformanceMetrics(): PerformanceMetrics {
    const now = performance.now();
    const frameTime = now - this.lastFrameTime;
    this.lastFrameTime = now;

    const fps = this.fpsAverage.add(1000 / frameTime);

    return {
      fps: Math.round(fps),
      frameTime,
      renderTime: 0, // Will be set by renderer
      updateTime: 0, // Will be set by renderer
    };
  }
}
