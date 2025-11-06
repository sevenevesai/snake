import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  GameState,
  GameMode,
  Difficulty,
  Theme,
  type GameStats,
  type Achievement,
} from '../types/game';
import { ACHIEVEMENTS, STORAGE_KEYS, GRID_SIZES } from '../utils/constants';

interface UserSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  difficulty: Difficulty;
  theme: Theme;
  gridSize: number;
}

interface GameStore {
  // Game state
  gameState: GameState;
  gameMode: GameMode;
  settings: UserSettings;

  // Stats
  currentStats: GameStats;
  allTimeStats: {
    gamesPlayed: number;
    totalScore: number;
    totalFoodEaten: number;
    totalPowerUps: number;
    totalTimePlayed: number;
  };

  // Achievements
  achievements: Record<string, Achievement>;
  unlockedAchievements: string[];

  // Leaderboard
  leaderboard: Array<{
    rank: number;
    name: string;
    score: number;
    level: number;
    date: string;
  }>;

  // Actions
  setGameState: (state: GameState) => void;
  setGameMode: (mode: GameMode) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  updateCurrentStats: (stats: Partial<GameStats>) => void;
  updateAllTimeStats: (stats: GameStats) => void;
  unlockAchievement: (achievementId: string) => void;
  resetProgress: () => void;
  resetGame: () => void;
}

const initialUserSettings: UserSettings = {
  soundEnabled: true,
  musicEnabled: true,
  difficulty: Difficulty.NORMAL,
  theme: Theme.NEON,
  gridSize: GRID_SIZES.MEDIUM,
};

const initialCurrentStats: GameStats = {
  score: 0,
  level: 1,
  lives: 3,
  combo: 1,
  foodEaten: 0,
  powerUpsCollected: 0,
  timeElapsed: 0,
  highScore: 0,
};

const initialAllTimeStats = {
  gamesPlayed: 0,
  totalScore: 0,
  totalFoodEaten: 0,
  totalPowerUps: 0,
  totalTimePlayed: 0,
};

// Initialize achievements
const initialAchievements: Record<string, Achievement> = {};
ACHIEVEMENTS.forEach(achievement => {
  initialAchievements[achievement.id] = {
    ...achievement,
    unlocked: false,
    progress: 0,
  };
});

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      // Initial state
      gameState: GameState.MENU,
      gameMode: GameMode.CLASSIC,
      settings: initialUserSettings,
      currentStats: initialCurrentStats,
      allTimeStats: initialAllTimeStats,
      achievements: initialAchievements,
      unlockedAchievements: [],
      leaderboard: [],

      // Actions
      setGameState: (gameState) => set({ gameState }),

      setGameMode: (gameMode) => set({ gameMode }),

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      updateCurrentStats: (newStats) =>
        set((state) => {
          const updatedStats = { ...state.currentStats, ...newStats };

          // Update high score
          if (updatedStats.score > updatedStats.highScore) {
            updatedStats.highScore = updatedStats.score;
          }

          return { currentStats: updatedStats };
        }),

      updateAllTimeStats: (gameStats) =>
        set((state) => ({
          allTimeStats: {
            gamesPlayed: state.allTimeStats.gamesPlayed + 1,
            totalScore: state.allTimeStats.totalScore + gameStats.score,
            totalFoodEaten: state.allTimeStats.totalFoodEaten + gameStats.foodEaten,
            totalPowerUps: state.allTimeStats.totalPowerUps + gameStats.powerUpsCollected,
            totalTimePlayed: state.allTimeStats.totalTimePlayed + gameStats.timeElapsed,
          },
        })),

      unlockAchievement: (achievementId) =>
        set((state) => {
          const achievement = state.achievements[achievementId];

          if (!achievement || achievement.unlocked) {
            return state;
          }

          return {
            achievements: {
              ...state.achievements,
              [achievementId]: {
                ...achievement,
                unlocked: true,
                progress: achievement.target,
              },
            },
            unlockedAchievements: [...state.unlockedAchievements, achievementId],
          };
        }),

      resetProgress: () =>
        set({
          allTimeStats: initialAllTimeStats,
          achievements: initialAchievements,
          unlockedAchievements: [],
          currentStats: initialCurrentStats,
        }),

      resetGame: () =>
        set({
          gameState: GameState.MENU,
          currentStats: initialCurrentStats,
        }),
    }),
    {
      name: STORAGE_KEYS.USER_DATA,
      partialize: (state) => ({
        settings: state.settings,
        allTimeStats: state.allTimeStats,
        achievements: state.achievements,
        unlockedAchievements: state.unlockedAchievements,
        currentStats: {
          ...initialCurrentStats,
          highScore: state.currentStats.highScore,
        },
      }),
    }
  )
);

// Selectors
export const selectSettings = (state: GameStore) => state.settings;
export const selectCurrentStats = (state: GameStore) => state.currentStats;
export const selectAllTimeStats = (state: GameStore) => state.allTimeStats;
export const selectAchievements = (state: GameStore) => state.achievements;
export const selectUnlockedAchievements = (state: GameStore) =>
  state.unlockedAchievements;
export const selectGameState = (state: GameStore) => state.gameState;
export const selectGameMode = (state: GameStore) => state.gameMode;
