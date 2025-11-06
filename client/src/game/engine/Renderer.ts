import {
  PowerUpType,
  type Snake,
  type Food,
  type PowerUp,
  type Obstacle,
  type Theme,
  type ActivePowerUp,
  type Position,
} from '../types';
import { CELL_SIZE, THEME_COLORS } from '../utils/constants';
import { getHSLColor } from '../utils/helpers';

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private gridSize: number;
  private cellSize: number;
  private theme: Theme;
  private frameCount = 0;

  // Off-screen canvas for double buffering
  private offscreenCanvas: HTMLCanvasElement;
  private offscreenCtx: CanvasRenderingContext2D;

  // Cached gradients and patterns
  private gradientCache: Map<string, CanvasGradient> = new Map();

  constructor(canvas: HTMLCanvasElement, gridSize: number, theme: Theme) {
    const ctx = canvas.getContext('2d', {
      alpha: false, // Opaque canvas is faster
      desynchronized: true, // Allow async rendering
    });

    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    this.canvas = canvas;
    this.ctx = ctx;
    this.gridSize = gridSize;
    this.cellSize = CELL_SIZE;
    this.theme = theme;

    // Set up canvas size
    this.canvas.width = gridSize * this.cellSize;
    this.canvas.height = gridSize * this.cellSize;

    // Create offscreen canvas for double buffering
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCanvas.width = this.canvas.width;
    this.offscreenCanvas.height = this.canvas.height;

    const offscreenCtx = this.offscreenCanvas.getContext('2d', { alpha: false });
    if (!offscreenCtx) {
      throw new Error('Failed to get offscreen canvas context');
    }
    this.offscreenCtx = offscreenCtx;

    // Optimize rendering
    this.ctx.imageSmoothingEnabled = false;
    this.offscreenCtx.imageSmoothingEnabled = false;
  }

  /**
   * Main render function
   */
  public render(
    snake: Snake,
    food: Food | null,
    powerUps: PowerUp[],
    obstacles: Obstacle[],
    activePowerUp: ActivePowerUp | null
  ): void {
    this.frameCount++;

    // Clear offscreen canvas
    this.offscreenCtx.fillStyle = '#0a0a0a';
    this.offscreenCtx.fillRect(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);

    // Draw grid
    this.drawGrid();

    // Draw obstacles
    this.drawObstacles(obstacles);

    // Draw food
    if (food) {
      this.drawFood(food);
    }

    // Draw power-ups
    this.drawPowerUps(powerUps);

    // Draw snake
    this.drawSnake(snake, activePowerUp);

    // Copy offscreen canvas to main canvas
    this.ctx.drawImage(this.offscreenCanvas, 0, 0);
  }

  /**
   * Draw grid lines
   */
  private drawGrid(): void {
    this.offscreenCtx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    this.offscreenCtx.lineWidth = 1;

    // Vertical lines
    for (let x = 0; x <= this.gridSize; x++) {
      const posX = x * this.cellSize;
      this.offscreenCtx.beginPath();
      this.offscreenCtx.moveTo(posX, 0);
      this.offscreenCtx.lineTo(posX, this.offscreenCanvas.height);
      this.offscreenCtx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= this.gridSize; y++) {
      const posY = y * this.cellSize;
      this.offscreenCtx.beginPath();
      this.offscreenCtx.moveTo(0, posY);
      this.offscreenCtx.lineTo(this.offscreenCanvas.width, posY);
      this.offscreenCtx.stroke();
    }
  }

  /**
   * Draw the snake
   */
  private drawSnake(snake: Snake, activePowerUp: ActivePowerUp | null): void {
    const themeColors = THEME_COLORS[this.theme];

    snake.segments.forEach((segment, index) => {
      const x = segment.x * this.cellSize;
      const y = segment.y * this.cellSize;

      // Determine color based on theme
      let color: string;

      if (this.theme === 'rainbow') {
        const hue = (this.frameCount * 2 + index * 10) % 360;
        color = getHSLColor(hue);
      } else {
        color = (index === 0 ? themeColors.head : themeColors.body) || '#00ff00';
      }

      // Apply glow effect if theme supports it
      if (themeColors.glow) {
        this.offscreenCtx.shadowBlur = 10;
        this.offscreenCtx.shadowColor = themeColors.glow;
      }

      // Apply ghost effect
      if (activePowerUp?.type === PowerUpType.GHOST) {
        this.offscreenCtx.globalAlpha = 0.5;
      }

      // Apply invincible effect
      if (activePowerUp?.type === PowerUpType.INVINCIBLE) {
        const pulse = Math.sin(this.frameCount * 0.1) * 0.3 + 0.7;
        this.offscreenCtx.globalAlpha = pulse;
      }

      // Draw segment
      this.offscreenCtx.fillStyle = color;
      this.offscreenCtx.fillRect(
        x + 1,
        y + 1,
        this.cellSize - 2,
        this.cellSize - 2
      );

      // Draw gradient for depth
      if (index > 0) {
        const gradient = this.offscreenCtx.createLinearGradient(x, y, x + this.cellSize, y + this.cellSize);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
        this.offscreenCtx.fillStyle = gradient;
        this.offscreenCtx.fillRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2);
      }

      // Reset effects
      this.offscreenCtx.globalAlpha = 1;
      this.offscreenCtx.shadowBlur = 0;

      // Draw eyes on head
      if (index === 0) {
        this.drawEyes(segment, snake.direction);
      }
    });
  }

  /**
   * Draw snake eyes based on direction
   */
  private drawEyes(head: Position, direction: { x: number; y: number }): void {
    const x = head.x * this.cellSize;
    const y = head.y * this.cellSize;

    this.offscreenCtx.fillStyle = '#fff';
    const eyeSize = 3;
    const eyeOffset = 4;

    if (direction.x === 1) {
      // Right
      this.offscreenCtx.fillRect(
        x + this.cellSize - eyeOffset,
        y + eyeOffset,
        eyeSize,
        eyeSize
      );
      this.offscreenCtx.fillRect(
        x + this.cellSize - eyeOffset,
        y + this.cellSize - eyeOffset - eyeSize,
        eyeSize,
        eyeSize
      );
    } else if (direction.x === -1) {
      // Left
      this.offscreenCtx.fillRect(
        x + eyeOffset - eyeSize,
        y + eyeOffset,
        eyeSize,
        eyeSize
      );
      this.offscreenCtx.fillRect(
        x + eyeOffset - eyeSize,
        y + this.cellSize - eyeOffset - eyeSize,
        eyeSize,
        eyeSize
      );
    } else if (direction.y === 1) {
      // Down
      this.offscreenCtx.fillRect(
        x + eyeOffset,
        y + this.cellSize - eyeOffset,
        eyeSize,
        eyeSize
      );
      this.offscreenCtx.fillRect(
        x + this.cellSize - eyeOffset - eyeSize,
        y + this.cellSize - eyeOffset,
        eyeSize,
        eyeSize
      );
    } else if (direction.y === -1) {
      // Up
      this.offscreenCtx.fillRect(
        x + eyeOffset,
        y + eyeOffset - eyeSize,
        eyeSize,
        eyeSize
      );
      this.offscreenCtx.fillRect(
        x + this.cellSize - eyeOffset - eyeSize,
        y + eyeOffset - eyeSize,
        eyeSize,
        eyeSize
      );
    }
  }

  /**
   * Draw food
   */
  private drawFood(food: Food): void {
    const x = food.position.x * this.cellSize;
    const y = food.position.y * this.cellSize;
    const centerX = x + this.cellSize / 2;
    const centerY = y + this.cellSize / 2;

    // Color based on food type
    let color: string;
    let glowColor: string;

    switch (food.type) {
      case 'golden':
        color = '#ffd700';
        glowColor = 'rgba(255, 215, 0, 0.8)';
        break;
      case 'bonus':
        color = '#ff6b6b';
        glowColor = 'rgba(255, 107, 107, 0.8)';
        break;
      default:
        color = '#ff0000';
        glowColor = 'rgba(255, 0, 0, 0.8)';
    }

    // Pulsing effect
    const pulse = Math.sin(this.frameCount * 0.1) * 2 + (this.cellSize / 2 - 2);

    // Draw glow
    this.offscreenCtx.shadowBlur = 15;
    this.offscreenCtx.shadowColor = glowColor;

    // Draw food as circle
    this.offscreenCtx.fillStyle = color;
    this.offscreenCtx.beginPath();
    this.offscreenCtx.arc(centerX, centerY, pulse, 0, Math.PI * 2);
    this.offscreenCtx.fill();

    // Draw shine
    const gradient = this.offscreenCtx.createRadialGradient(
      centerX - 2,
      centerY - 2,
      0,
      centerX,
      centerY,
      pulse
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    this.offscreenCtx.fillStyle = gradient;
    this.offscreenCtx.beginPath();
    this.offscreenCtx.arc(centerX, centerY, pulse, 0, Math.PI * 2);
    this.offscreenCtx.fill();

    this.offscreenCtx.shadowBlur = 0;
  }

  /**
   * Draw power-ups
   */
  private drawPowerUps(powerUps: PowerUp[]): void {
    powerUps.forEach(powerUp => {
      const x = powerUp.position.x * this.cellSize;
      const y = powerUp.position.y * this.cellSize;

      // Color based on power-up type
      const colors: Record<PowerUpType, string> = {
        [PowerUpType.SPEED]: '#00ff00',
        [PowerUpType.SLOW]: '#0000ff',
        [PowerUpType.GHOST]: '#ffffff',
        [PowerUpType.INVINCIBLE]: '#ffd700',
        [PowerUpType.DOUBLE_POINTS]: '#ff00ff',
        [PowerUpType.SHRINK]: '#00ffff',
        [PowerUpType.MAGNET]: '#ff8800',
        [PowerUpType.FREEZE]: '#88ccff',
      };

      const color = colors[powerUp.type];

      // Rotating effect
      const rotation = (this.frameCount * 0.05) % (Math.PI * 2);

      this.offscreenCtx.save();
      this.offscreenCtx.translate(x + this.cellSize / 2, y + this.cellSize / 2);
      this.offscreenCtx.rotate(rotation);

      // Draw as diamond/square
      this.offscreenCtx.fillStyle = color;
      this.offscreenCtx.shadowBlur = 10;
      this.offscreenCtx.shadowColor = color;

      const size = this.cellSize / 2 - 2;
      this.offscreenCtx.fillRect(-size / 2, -size / 2, size, size);

      this.offscreenCtx.shadowBlur = 0;
      this.offscreenCtx.restore();

      // Draw icon
      this.offscreenCtx.fillStyle = '#000';
      this.offscreenCtx.font = 'bold 10px Arial';
      this.offscreenCtx.textAlign = 'center';
      this.offscreenCtx.textBaseline = 'middle';

      const icons: Record<PowerUpType, string> = {
        [PowerUpType.SPEED]: '⚡',
        [PowerUpType.SLOW]: '🐌',
        [PowerUpType.GHOST]: '👻',
        [PowerUpType.INVINCIBLE]: '🛡',
        [PowerUpType.DOUBLE_POINTS]: '2x',
        [PowerUpType.SHRINK]: '📉',
        [PowerUpType.MAGNET]: '🧲',
        [PowerUpType.FREEZE]: '❄️',
      };

      this.offscreenCtx.fillText(
        icons[powerUp.type],
        x + this.cellSize / 2,
        y + this.cellSize / 2
      );
    });
  }

  /**
   * Draw obstacles
   */
  private drawObstacles(obstacles: Obstacle[]): void {
    obstacles.forEach(obstacle => {
      const x = obstacle.position.x * this.cellSize;
      const y = obstacle.position.y * this.cellSize;

      const color = obstacle.type === 'moving' ? '#ff6b6b' : '#ff9999';

      this.offscreenCtx.fillStyle = color;
      this.offscreenCtx.fillRect(
        x + 2,
        y + 2,
        this.cellSize - 4,
        this.cellSize - 4
      );

      // Draw pattern for moving obstacles
      if (obstacle.type === 'moving') {
        this.offscreenCtx.strokeStyle = '#ff0000';
        this.offscreenCtx.lineWidth = 2;
        this.offscreenCtx.strokeRect(
          x + 2,
          y + 2,
          this.cellSize - 4,
          this.cellSize - 4
        );

        // Draw direction indicator
        if (obstacle.movingDirection) {
          const centerX = x + this.cellSize / 2;
          const centerY = y + this.cellSize / 2;
          const arrowLength = this.cellSize / 3;

          this.offscreenCtx.strokeStyle = '#ffffff';
          this.offscreenCtx.lineWidth = 1;
          this.offscreenCtx.beginPath();
          this.offscreenCtx.moveTo(centerX, centerY);
          this.offscreenCtx.lineTo(
            centerX + obstacle.movingDirection.x * arrowLength,
            centerY + obstacle.movingDirection.y * arrowLength
          );
          this.offscreenCtx.stroke();
        }
      }
    });
  }

  /**
   * Draw pause overlay
   */
  public drawPauseOverlay(): void {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 32px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
  }

  /**
   * Update theme
   */
  public setTheme(theme: Theme): void {
    this.theme = theme;
    this.gradientCache.clear(); // Clear cached gradients
  }

  /**
   * Resize canvas
   */
  public resize(gridSize: number): void {
    this.gridSize = gridSize;
    this.canvas.width = gridSize * this.cellSize;
    this.canvas.height = gridSize * this.cellSize;
    this.offscreenCanvas.width = this.canvas.width;
    this.offscreenCanvas.height = this.canvas.height;
  }

  /**
   * Clear canvas
   */
  public clear(): void {
    this.ctx.fillStyle = '#0a0a0a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
