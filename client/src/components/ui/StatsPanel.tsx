import { useGameStore } from '../../store/gameStore';
import { formatTime, formatNumber } from '../../game/utils/helpers';
import clsx from 'clsx';

export const StatsPanel: React.FC = () => {
  const { currentStats } = useGameStore();

  const statItems = [
    {
      label: 'Score',
      value: formatNumber(currentStats.score),
      icon: '💰',
      color: 'text-yellow-400',
    },
    {
      label: 'Level',
      value: currentStats.level,
      icon: '⭐',
      color: 'text-blue-400',
    },
    {
      label: 'Lives',
      value: currentStats.lives,
      icon: '❤️',
      color: 'text-red-400',
    },
    {
      label: 'Combo',
      value: `x${currentStats.combo}`,
      icon: '🔥',
      color: 'text-orange-400',
    },
  ];

  return (
    <div className="glass-morphism rounded-xl p-4 space-y-3">
      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-3">
        {statItems.map((stat) => (
          <div
            key={stat.label}
            className="bg-black/30 rounded-lg p-3 hover:bg-black/40 transition-colors"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{stat.icon}</span>
              <span className="text-xs text-gray-400">{stat.label}</span>
            </div>
            <div className={clsx('text-2xl font-bold', stat.color)}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Additional Stats */}
      <div className="bg-black/30 rounded-lg p-3 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Food Eaten</span>
          <span className="text-white font-semibold">{currentStats.foodEaten}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Power-ups</span>
          <span className="text-white font-semibold">{currentStats.powerUpsCollected}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Time</span>
          <span className="text-white font-semibold">
            {formatTime(currentStats.timeElapsed)}
          </span>
        </div>
        <div className="flex justify-between text-sm border-t border-gray-700 pt-2">
          <span className="text-gray-400">High Score</span>
          <span className="text-yellow-400 font-bold">
            {formatNumber(currentStats.highScore)}
          </span>
        </div>
      </div>
    </div>
  );
};
