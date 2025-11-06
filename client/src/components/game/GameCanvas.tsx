import { useEffect, useRef, useCallback } from 'react';
import { GameEngine } from '../../game/engine/GameEngine';
import { Renderer } from '../../game/engine/Renderer';
import { GameState, type GameConfig, type Direction } from '../../types/game';
import { useGameStore } from '../../store/gameStore';
import { KEY_MAPPINGS } from '../../utils/constants';

interface GameCanvasProps {
  onGameOver?: (score: number) => void;
  onLevelUp?: (level: number) => void;
  onFoodEaten?: (score: number) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  onGameOver,
  onLevelUp,
  onFoodEaten,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const animationFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // Store callbacks in refs to avoid re-initialization on every render
  const callbacksRef = useRef({
    onGameOver,
    onLevelUp,
    onFoodEaten,
  });

  // Update callbacks ref on every render
  useEffect(() => {
    callbacksRef.current = {
      onGameOver,
      onLevelUp,
      onFoodEaten,
    };
  });

  const { settings, gameMode, updateCurrentStats, updateAllTimeStats } =
    useGameStore();

  // Store Zustand actions in refs
  const storeActionsRef = useRef({
    updateCurrentStats,
    updateAllTimeStats,
  });

  useEffect(() => {
    storeActionsRef.current = {
      updateCurrentStats,
      updateAllTimeStats,
    };
  });

  // Initialize game engine and renderer - ONLY when gameMode or settings change
  useEffect(() => {
    if (!canvasRef.current) return;

    const config: GameConfig = {
      gridSize: settings.gridSize,
      cellSize: 16,
      initialSpeed: 100,
      speedIncrement: 5,
      maxSpeed: 20,
      difficulty: settings.difficulty,
      theme: settings.theme,
      mode: gameMode,
      soundEnabled: settings.soundEnabled,
      musicEnabled: settings.musicEnabled,
    };

    // Create engine and renderer
    const engine = new GameEngine(config);
    const renderer = new Renderer(canvasRef.current, config.gridSize, config.theme);

    engineRef.current = engine;
    rendererRef.current = renderer;

    // Initialize game
    engine.init();
    engine.setState(GameState.PLAYING);

    // Subscribe to game events - use refs to get latest callbacks
    const unsubscribeFoodEaten = engine.on('FOOD_EATEN', (event) => {
      if (event.type === 'FOOD_EATEN') {
        const stats = engine.getStats();
        storeActionsRef.current.updateCurrentStats(stats);
        callbacksRef.current.onFoodEaten?.(event.data.points);
      }
    });

    const unsubscribeLevelUp = engine.on('LEVEL_UP', (event) => {
      if (event.type === 'LEVEL_UP') {
        const stats = engine.getStats();
        storeActionsRef.current.updateCurrentStats(stats);
        callbacksRef.current.onLevelUp?.(event.data.level);
      }
    });

    const unsubscribeGameOver = engine.on('GAME_OVER', (event) => {
      if (event.type === 'GAME_OVER') {
        storeActionsRef.current.updateAllTimeStats(event.data.stats);
        callbacksRef.current.onGameOver?.(event.data.stats.score);
      }
    });

    // Start game loop
    const gameLoop = (timestamp: number) => {
      if (!engineRef.current || !rendererRef.current) return;

      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      // Update game
      engineRef.current.update(deltaTime);

      // Render
      const snake = engineRef.current.getSnake();
      const food = engineRef.current.getFood();
      const powerUps = engineRef.current.getPowerUps();
      const obstacles = engineRef.current.getObstacles();
      const activePowerUp = engineRef.current.getActivePowerUp();

      rendererRef.current.render(snake, food, powerUps, obstacles, activePowerUp);

      // Check if paused
      if (engineRef.current.getState() === GameState.PAUSED) {
        rendererRef.current.drawPauseOverlay();
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    lastTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(gameLoop);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      unsubscribeFoodEaten();
      unsubscribeLevelUp();
      unsubscribeGameOver();
    };
  }, [gameMode, settings]);

  // Handle keyboard input
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!engineRef.current) return;

    const key = event.key as keyof typeof KEY_MAPPINGS;
    const direction = KEY_MAPPINGS[key];

    if (direction) {
      event.preventDefault();
      engineRef.current.changeDirection(direction as Direction);
    }

    // Handle pause
    if (event.key === ' ' || event.key === 'Escape') {
      event.preventDefault();
      const currentState = engineRef.current.getState();

      if (currentState === GameState.PLAYING) {
        engineRef.current.setState(GameState.PAUSED);
      } else if (currentState === GameState.PAUSED) {
        engineRef.current.setState(GameState.PLAYING);
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Handle touch controls for mobile
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    const touch = event.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchEnd = useCallback((event: React.TouchEvent) => {
    if (!engineRef.current || !touchStartRef.current) return;

    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;

    const threshold = 30; // Minimum swipe distance

    if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) {
      let direction: Direction;

      if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal swipe
        direction = dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
      } else {
        // Vertical swipe
        direction = dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
      }

      engineRef.current.changeDirection(direction);
    }

    touchStartRef.current = null;
  }, []);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="rounded-lg shadow-2xl border-2 border-purple-500/30"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      />
    </div>
  );
};
