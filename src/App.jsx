import React, { useState, useEffect, useCallback } from 'react';
import CharacterCreator from './CharacterCreator';
import WorldMap from './WorldMap';
import LevelPlay from './LevelPlay';
import Character from './Character';
import { PETS } from './gameData';

const SAVE_KEY = 'math-adventure-island-save';

const defaultState = {
  character: null,
  completedLevels: {},
  gems: 0,
  activePet: null,
  totalStars: 0,
};

function loadGame() {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) { /* ignore */ }
  return null;
}

function saveGame(state) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch (e) { /* ignore */ }
}

export default function App() {
  const [gameState, setGameState] = useState(() => loadGame() || { ...defaultState });
  const [screen, setScreen] = useState(() => {
    const saved = loadGame();
    return saved?.character ? 'map' : 'title';
  });
  const [currentLevel, setCurrentLevel] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    saveGame(gameState);
  }, [gameState]);

  // Confetti effect
  useEffect(() => {
    if (showConfetti) {
      let confettiModule;
      import('canvas-confetti').then(mod => {
        confettiModule = mod.default;
        const duration = 3000;
        const end = Date.now() + duration;
        const colors = ['#E91E63', '#9C27B0', '#3F51B5', '#009688', '#FF9800', '#FFD700'];
        const frame = () => {
          confettiModule({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors,
          });
          confettiModule({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors,
          });
          if (Date.now() < end) requestAnimationFrame(frame);
        };
        frame();
      }).catch(() => {});
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [showConfetti]);

  const handleCharacterCreate = useCallback((character) => {
    setGameState(prev => ({ ...prev, character }));
    setScreen('map');
  }, []);

  const handleSelectLevel = useCallback((levelId) => {
    setCurrentLevel(levelId);
    setScreen('level');
  }, []);

  const handleLevelComplete = useCallback((result) => {
    setGameState(prev => {
      const existing = prev.completedLevels[currentLevel];
      const bestStars = Math.max(existing?.stars || 0, result.stars);
      const newGems = prev.gems + result.gems;

      const newCompleted = {
        ...prev.completedLevels,
        [currentLevel]: { stars: bestStars, score: result.score, total: result.total },
      };

      // Check for pet unlock
      const newPet = PETS.find(p => p.unlockLevel === currentLevel);
      const activePet = newPet ? newPet.id : prev.activePet;

      return {
        ...prev,
        completedLevels: newCompleted,
        gems: newGems,
        activePet,
        totalStars: Object.values(newCompleted).reduce((s, l) => s + l.stars, 0),
      };
    });
    setShowConfetti(true);
    setScreen('map');
    setCurrentLevel(null);
  }, [currentLevel]);

  const handleMapAction = useCallback((action, payload) => {
    if (action === 'setPet') {
      setGameState(prev => ({ ...prev, activePet: prev.activePet === payload ? null : payload }));
    }
  }, []);

  const handleExitLevel = useCallback(() => {
    setScreen('map');
    setCurrentLevel(null);
  }, []);

  const handleResetGame = useCallback(() => {
    setGameState({ ...defaultState });
    setScreen('title');
    localStorage.removeItem(SAVE_KEY);
  }, []);

  // ===== TITLE SCREEN =====
  if (screen === 'title') {
    return (
      <div className="screen title-screen">
        <div className="title-bg-shapes">
          {[...Array(30)].map((_, i) => (
            <div key={i} className="floating-shape" style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
              fontSize: `${20 + Math.random() * 30}px`,
            }}>
              {['🌟', '✨', '🎈', '🌸', '💎', '🦋', '🌈', '⭐', '🎀', '🍭'][i % 10]}
            </div>
          ))}
        </div>
        <div className="title-content">
          <div className="title-island">🏝️</div>
          <h1 className="game-title">
            <span className="title-math">Math</span>
            <span className="title-adventure">Adventure</span>
            <span className="title-island-text">Island</span>
          </h1>
          <p className="title-subtitle">A Primary 1 Math Journey</p>
          <button className="btn-play" onClick={() => {
            if (gameState.character) {
              setScreen('map');
            } else {
              setScreen('create');
            }
          }}>
            {gameState.character ? 'Continue Adventure!' : 'Start New Adventure!'} 🚀
          </button>
          {gameState.character && (
            <div className="title-continue-info">
              <Character config={gameState.character} size={60} animated />
              <span>{gameState.character.name}'s Adventure</span>
              <span className="title-stars">⭐ {gameState.totalStars}</span>
            </div>
          )}
          {gameState.character && (
            <button className="btn-new-game" onClick={handleResetGame}>
              Start Fresh 🔄
            </button>
          )}
        </div>
      </div>
    );
  }

  // ===== CHARACTER CREATION =====
  if (screen === 'create') {
    return <CharacterCreator onComplete={handleCharacterCreate} />;
  }

  // ===== WORLD MAP =====
  if (screen === 'map') {
    return <WorldMap gameState={gameState} onSelectLevel={handleSelectLevel} onBack={handleMapAction} />;
  }

  // ===== LEVEL PLAY =====
  if (screen === 'level' && currentLevel) {
    return (
      <LevelPlay
        levelId={currentLevel}
        gameState={gameState}
        onComplete={handleLevelComplete}
        onExit={handleExitLevel}
      />
    );
  }

  return null;
}
