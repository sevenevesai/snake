import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { GameState, GameMode, Difficulty, Theme } from '../../types/game';
import { GRID_SIZES } from '../../utils/constants';
import clsx from 'clsx';

export const MainMenu: React.FC = () => {
  const { settings, updateSettings, setGameState, setGameMode } = useGameStore();
  const [showSettings, setShowSettings] = useState(false);

  const gameModes = [
    {
      mode: GameMode.CLASSIC,
      name: 'Classic',
      description: 'Traditional snake gameplay',
      icon: '🎮',
      color: 'from-green-500 to-emerald-600',
    },
    {
      mode: GameMode.ARCADE,
      name: 'Arcade',
      description: 'Power-ups & special items',
      icon: '🚀',
      color: 'from-blue-500 to-cyan-600',
    },
    {
      mode: GameMode.SURVIVAL,
      name: 'Survival',
      description: 'How long can you last?',
      icon: '💀',
      color: 'from-red-500 to-rose-600',
    },
    {
      mode: GameMode.CHALLENGE,
      name: 'Challenge',
      description: 'Complete objectives',
      icon: '🏆',
      color: 'from-yellow-500 to-orange-600',
    },
  ];

  const handleStartGame = (mode: GameMode) => {
    setGameMode(mode);
    setGameState(GameState.PLAYING);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-morphism rounded-3xl p-8 max-w-4xl w-full shadow-2xl">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold mb-2 glow-green">
            🐍 SNAKE EVOLUTION
          </h1>
          <p className="text-xl text-gray-300">The Ultimate Snake Experience</p>
        </div>

        {!showSettings ? (
          <>
            {/* Game Modes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {gameModes.map((mode) => (
                <button
                  key={mode.mode}
                  onClick={() => handleStartGame(mode.mode)}
                  className={clsx(
                    'relative group overflow-hidden rounded-xl p-6 text-left',
                    'bg-gradient-to-br',
                    mode.color,
                    'hover:scale-105 transition-all duration-300',
                    'shadow-lg hover:shadow-2xl'
                  )}
                >
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  <div className="relative z-10">
                    <div className="text-4xl mb-2">{mode.icon}</div>
                    <div className="text-2xl font-bold mb-1">{mode.name}</div>
                    <div className="text-sm text-white/80">{mode.description}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Quick Settings Preview */}
            <div className="bg-black/30 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-gray-400 text-sm mb-1">Difficulty</div>
                  <div className="text-white font-semibold capitalize">
                    {settings.difficulty}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-1">Theme</div>
                  <div className="text-white font-semibold capitalize">
                    {settings.theme}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-1">Grid Size</div>
                  <div className="text-white font-semibold">
                    {settings.gridSize}x{settings.gridSize}
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowSettings(true)}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                ⚙️ Settings
              </button>
              <button
                onClick={() => {}}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                🏅 Achievements
              </button>
              <button
                onClick={() => {}}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                📊 Stats
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Settings Panel */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-center mb-6">⚙️ Settings</h2>

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium mb-2">Difficulty</label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.values(Difficulty).map((difficulty) => (
                    <button
                      key={difficulty}
                      onClick={() => updateSettings({ difficulty })}
                      className={clsx(
                        'px-4 py-2 rounded-lg font-semibold transition-all',
                        settings.difficulty === difficulty
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      )}
                    >
                      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme */}
              <div>
                <label className="block text-sm font-medium mb-2">Theme</label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.values(Theme).map((theme) => (
                    <button
                      key={theme}
                      onClick={() => updateSettings({ theme })}
                      className={clsx(
                        'px-4 py-2 rounded-lg font-semibold transition-all capitalize',
                        settings.theme === theme
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      )}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid Size */}
              <div>
                <label className="block text-sm font-medium mb-2">Grid Size</label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(GRID_SIZES).map(([label, size]) => (
                    <button
                      key={size}
                      onClick={() => updateSettings({ gridSize: size })}
                      className={clsx(
                        'px-4 py-2 rounded-lg font-semibold transition-all',
                        settings.gridSize === size
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sound & Music */}
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-3 bg-gray-700 p-4 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors">
                  <input
                    type="checkbox"
                    checked={settings.soundEnabled}
                    onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <span className="font-semibold">🔊 Sound Effects</span>
                </label>
                <label className="flex items-center gap-3 bg-gray-700 p-4 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors">
                  <input
                    type="checkbox"
                    checked={settings.musicEnabled}
                    onChange={(e) => updateSettings({ musicEnabled: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <span className="font-semibold">🎵 Music</span>
                </label>
              </div>

              {/* Back Button */}
              <button
                onClick={() => setShowSettings(false)}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                ← Back to Menu
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
