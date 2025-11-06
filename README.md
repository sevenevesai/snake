# 🐍 Snake Evolution - Modern Web Game

A highly optimized, feature-rich Snake game built with modern web technologies. This project showcases best practices in game development, state management, and performance optimization.

## ✨ Features

### Game Modes
- **Classic** - Traditional snake gameplay
- **Arcade** - Enhanced with power-ups and special items
- **Survival** - How long can you last?
- **Challenge** - Complete specific objectives

### Themes
- 🌟 Neon
- 🎮 Classic
- 🌈 Rainbow
- 🔥 Fire
- ❄️ Ice
- 💚 Matrix
- 🌃 Cyberpunk

### Power-Ups
- ⚡ Speed Boost - Move faster temporarily
- 🐌 Slow Motion - Slow down time
- 👻 Ghost Mode - Pass through walls
- 🛡️ Invincibility - Become invulnerable
- 💰 Double Points - 2x score multiplier
- 📉 Shrink - Reduce snake length
- 🧲 Magnet - Attract food
- ❄️ Freeze - Stop obstacles

### Performance Features
- 60 FPS optimized rendering with double buffering
- Spatial hashing for collision detection
- Off-screen canvas rendering
- Efficient state management with Zustand
- TypeScript for type safety

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Lightning-fast build tool
- **Tailwind CSS 3** - Utility-first styling
- **Zustand** - Lightweight state management
- **Canvas API** - Hardware-accelerated rendering

### Architecture
- **Game Engine** - Custom-built, optimized for performance
- **Component-based** - Modular and maintainable
- **Event-driven** - Reactive game loop
- **Persistent storage** - LocalStorage for saves

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install client dependencies
cd client
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The game will be available at `http://localhost:5173`

## 📁 Project Structure

```
snake/
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── game/       # Game-specific components
│   │   │   └── ui/         # UI components
│   │   ├── game/           # Game engine
│   │   │   ├── engine/     # Core game logic
│   │   │   │   ├── GameEngine.ts  # Main game loop
│   │   │   │   └── Renderer.ts    # Canvas rendering
│   │   │   ├── types/      # TypeScript definitions
│   │   │   └── utils/      # Helper functions
│   │   ├── hooks/          # Custom React hooks
│   │   ├── store/          # Zustand state management
│   │   ├── styles/         # CSS/Tailwind
│   │   └── utils/          # Utility functions
│   └── package.json
├── server/                 # Backend API (future)
├── shared/                 # Shared types (future)
└── README.md
```

## 🎮 How to Play

### Controls

**Keyboard:**
- Arrow Keys or WASD - Move snake
- Space/ESC - Pause game

**Mobile:**
- Swipe on canvas to control direction

### Objective
- Eat food to grow and score points
- Avoid hitting walls and yourself
- Collect power-ups for special abilities
- Build combos for higher scores
- Unlock achievements

## 🎯 Roadmap

### Phase 1 - Core (✅ Completed)
- [x] Optimized game engine
- [x] Multiple game modes
- [x] Theme system
- [x] Power-ups
- [x] Achievements
- [x] Local storage
- [x] Mobile support

### Phase 2 - Online Features (🚧 Planned)
- [ ] User authentication
- [ ] Global leaderboards
- [ ] Cloud save sync
- [ ] Daily challenges
- [ ] Backend API (Node.js + Express)
- [ ] PostgreSQL database

### Phase 3 - Multiplayer (🎯 Future)
- [ ] Real-time multiplayer battles
- [ ] Spectator mode
- [ ] Replay system
- [ ] Tournament brackets
- [ ] Socket.io integration

### Phase 4 - Social (💡 Ideas)
- [ ] Friend system
- [ ] In-game chat
- [ ] Skin marketplace
- [ ] Achievement sharing
- [ ] Profile customization

## ⚡ Performance Optimizations

- **Spatial Hashing** - O(1) collision detection
- **Double Buffering** - Smooth rendering
- **RAF Loop** - Consistent 60 FPS
- **Moving Average** - FPS smoothing
- **Object Pooling** - Memory efficiency
- **Canvas Optimization** - Disabled alpha channel
- **Type Safety** - Catch errors at compile time

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📜 License

MIT License - feel free to use this project for learning or building your own games!

## 🙏 Acknowledgments

- Inspired by classic Snake games
- Built with modern web standards
- Optimized for performance and user experience

---

**Made with ❤️ and TypeScript**
