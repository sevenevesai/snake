import { useEffect, useState } from 'react';
import { useGameStore } from './store/gameStore';
import { GameState } from './types/game';
import { MainMenu } from './components/ui/MainMenu';
import { GameCanvas } from './components/game/GameCanvas';
import { StatsPanel } from './components/ui/StatsPanel';
import clsx from 'clsx';

function App() {
  const { gameState, setGameState, currentStats, resetGame } = useGameStore();
  const [showNotification, setShowNotification] = useState<{
    message: string;
    type: 'success' | 'info' | 'warning';
  } | null>(null);

  // Show notifications
  const notify = (message: string, type: 'success' | 'info' | 'warning' = 'info') => {
    setShowNotification({ message, type });
    setTimeout(() => setShowNotification(null), 3000);
  };

  const handleGameOver = (score: number) => {
    setGameState(GameState.GAME_OVER);

    setTimeout(() => {
      const playAgain = confirm(
        `Game Over!\n\nFinal Score: ${score}\nLevel: ${currentStats.level}\n\nPlay again?`
      );

      if (playAgain) {
        resetGame();
        setGameState(GameState.PLAYING);
      } else {
        setGameState(GameState.MENU);
      }
    }, 100);
  };

  const handleLevelUp = (level: number) => {
    notify(`Level ${level} Reached!`, 'success');
  };

  const handleFoodEaten = (points: number) => {
    if (points > 50) {
      notify(`+${points} points!`, 'success');
    }
  };

  const handlePause = () => {
    if (gameState === GameState.PLAYING) {
      setGameState(GameState.PAUSED);
    } else if (gameState === GameState.PAUSED) {
      setGameState(GameState.PLAYING);
    }
  };

  const handleBackToMenu = () => {
    if (confirm('Are you sure you want to quit? Progress will be lost.')) {
      resetGame();
      setGameState(GameState.MENU);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && gameState === GameState.PLAYING) {
        handlePause();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 relative">
      {/* Notification */}
      {showNotification && (
        <div
          className={clsx(
            'fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg',
            'animate-bounce-slow',
            {
              'bg-green-500': showNotification.type === 'success',
              'bg-blue-500': showNotification.type === 'info',
              'bg-yellow-500': showNotification.type === 'warning',
            }
          )}
        >
          <p className="font-bold text-white">{showNotification.message}</p>
        </div>
      )}

      {/* Main Content */}
      {gameState === GameState.MENU ? (
        <MainMenu />
      ) : (
        <div className="min-h-screen flex items-center justify-center p-4 gap-6">
          {/* Game Canvas */}
          <div className="flex flex-col items-center gap-4">
            <GameCanvas
              onGameOver={handleGameOver}
              onLevelUp={handleLevelUp}
              onFoodEaten={handleFoodEaten}
            />

            {/* Game Controls */}
            <div className="glass-morphism rounded-xl p-4 flex gap-3">
              <button
                onClick={handlePause}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
              >
                {gameState === GameState.PAUSED ? '▶️ Resume' : '⏸️ Pause'}
              </button>
              <button
                onClick={() => {
                  resetGame();
                  setGameState(GameState.PLAYING);
                }}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors"
              >
                🔄 Restart
              </button>
              <button
                onClick={handleBackToMenu}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
              >
                📋 Menu
              </button>
            </div>

            {/* Mobile Controls Hint */}
            <div className="md:hidden text-center text-sm text-gray-400">
              Swipe on canvas to control snake
            </div>

            {/* Keyboard Controls Hint */}
            <div className="hidden md:block text-center text-sm text-gray-400">
              Use Arrow Keys or WASD • Space/ESC to Pause
            </div>
          </div>

          {/* Stats Panel */}
          <div className="hidden lg:block w-80">
            <StatsPanel />
          </div>
        </div>
      )}

      {/* Mobile Stats (Bottom Sheet) */}
      {gameState !== GameState.MENU && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4">
          <StatsPanel />
        </div>
      )}

      {/* Footer */}
      <div className="fixed bottom-4 left-4 text-sm text-gray-400">
        <p>Snake Evolution v1.0 • Built with React + TypeScript + Vite</p>
      </div>
    </div>
  );
}

export default App;
