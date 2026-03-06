import React, { useState, useEffect, useCallback } from 'react';
import CharacterCreator from './CharacterCreator';
import WorldMap from './WorldMap';
import LevelPlay from './LevelPlay';
import Character from './Character';
import { PETS, LEVELS } from './gameData';

const PROFILES_KEY = 'math-adventure-island-profiles';

const defaultState = {
  character: null,
  completedLevels: {},
  gems: 0,
  activePet: null,
  totalStars: 0,
  history: [], // { levelId, stars, score, total, date }
};

function loadProfiles() {
  try {
    const saved = localStorage.getItem(PROFILES_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) { /* ignore */ }
  return [];
}

function saveProfiles(profiles) {
  try {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  } catch (e) { /* ignore */ }
}

function loadProfileData(profileId) {
  try {
    const saved = localStorage.getItem(`math-adventure-${profileId}`);
    if (saved) return JSON.parse(saved);
  } catch (e) { /* ignore */ }
  return null;
}

function saveProfileData(profileId, state) {
  try {
    localStorage.setItem(`math-adventure-${profileId}`, JSON.stringify(state));
  } catch (e) { /* ignore */ }
}

function migrateOldSave() {
  try {
    const old = localStorage.getItem('math-adventure-island-save');
    if (!old) return null;
    const data = JSON.parse(old);
    if (data?.character) return data;
  } catch (e) { /* ignore */ }
  return null;
}

export default function App() {
  const [profiles, setProfiles] = useState(() => loadProfiles());
  const [activeProfileId, setActiveProfileId] = useState(null);
  const [gameState, setGameState] = useState({ ...defaultState });
  const [screen, setScreen] = useState('profiles');
  const [currentLevel, setCurrentLevel] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Migrate old single-user save on first load
  useEffect(() => {
    if (profiles.length === 0) {
      const oldSave = migrateOldSave();
      if (oldSave) {
        const id = Date.now().toString();
        const profile = { id, name: oldSave.character?.name || 'Player', createdAt: new Date().toISOString() };
        const data = { ...defaultState, ...oldSave, history: oldSave.history || [] };
        setProfiles([profile]);
        saveProfiles([profile]);
        saveProfileData(id, data);
        localStorage.removeItem('math-adventure-island-save');
      }
    }
  }, []);

  // Auto-save game state when it changes
  useEffect(() => {
    if (activeProfileId) {
      saveProfileData(activeProfileId, gameState);
    }
  }, [gameState, activeProfileId]);

  // Confetti effect
  useEffect(() => {
    if (showConfetti) {
      import('canvas-confetti').then(mod => {
        const confettiModule = mod.default;
        const end = Date.now() + 3000;
        const colors = ['#E91E63', '#9C27B0', '#3F51B5', '#009688', '#FF9800', '#FFD700'];
        const frame = () => {
          confettiModule({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors });
          confettiModule({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors });
          if (Date.now() < end) requestAnimationFrame(frame);
        };
        frame();
      }).catch(() => {});
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [showConfetti]);

  const selectProfile = useCallback((profileId) => {
    const data = loadProfileData(profileId) || { ...defaultState };
    if (!data.history) data.history = [];
    setActiveProfileId(profileId);
    setGameState(data);
    setScreen(data.character ? 'title' : 'title');
  }, []);

  const createProfile = useCallback((name) => {
    const id = Date.now().toString();
    const profile = { id, name, createdAt: new Date().toISOString() };
    const newProfiles = [...profiles, profile];
    setProfiles(newProfiles);
    saveProfiles(newProfiles);
    saveProfileData(id, { ...defaultState });
    selectProfile(id);
  }, [profiles, selectProfile]);

  const deleteProfile = useCallback((profileId) => {
    const newProfiles = profiles.filter(p => p.id !== profileId);
    setProfiles(newProfiles);
    saveProfiles(newProfiles);
    try { localStorage.removeItem(`math-adventure-${profileId}`); } catch (e) { /* ignore */ }
    setDeleteConfirm(null);
    if (activeProfileId === profileId) {
      setActiveProfileId(null);
      setGameState({ ...defaultState });
      setScreen('profiles');
    }
  }, [profiles, activeProfileId]);

  const handleCharacterCreate = useCallback((character) => {
    setGameState(prev => ({ ...prev, character }));
    // Update profile name to match character name
    if (activeProfileId) {
      const newProfiles = profiles.map(p =>
        p.id === activeProfileId ? { ...p, name: character.name } : p
      );
      setProfiles(newProfiles);
      saveProfiles(newProfiles);
    }
    setScreen('map');
  }, [activeProfileId, profiles]);

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

      const newPet = PETS.find(p => p.unlockLevel === currentLevel);
      const activePet = newPet ? newPet.id : prev.activePet;

      // Add to history
      const historyEntry = {
        levelId: currentLevel,
        stars: result.stars,
        score: result.score,
        total: result.total,
        gems: result.gems,
        date: new Date().toISOString(),
      };

      return {
        ...prev,
        completedLevels: newCompleted,
        gems: newGems,
        activePet,
        totalStars: Object.values(newCompleted).reduce((s, l) => s + l.stars, 0),
        history: [...(prev.history || []), historyEntry],
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
    if (activeProfileId) {
      saveProfileData(activeProfileId, { ...defaultState });
    }
  }, [activeProfileId]);

  const handleSwitchProfile = useCallback(() => {
    setActiveProfileId(null);
    setGameState({ ...defaultState });
    setScreen('profiles');
  }, []);

  // ===== PROFILE SELECT SCREEN =====
  if (screen === 'profiles') {
    return (
      <div className="screen profile-screen">
        <div className="title-bg-shapes">
          {[...Array(20)].map((_, i) => (
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
        <div className="profile-content">
          <div className="title-island">🏝️</div>
          <h1 className="game-title">
            <span className="title-math">Math</span>
            <span className="title-adventure">Adventure</span>
            <span className="title-island-text">Island</span>
          </h1>
          <p className="profile-heading">Who's playing today?</p>

          <div className="profile-list">
            {profiles.map(profile => {
              const data = loadProfileData(profile.id);
              return (
                <div key={profile.id} className="profile-card" onClick={() => selectProfile(profile.id)}>
                  <div className="profile-avatar">
                    {data?.character ? (
                      <Character config={data.character} size={60} />
                    ) : (
                      <div className="profile-avatar-placeholder">🧒</div>
                    )}
                  </div>
                  <div className="profile-info">
                    <div className="profile-name">{profile.name}</div>
                    <div className="profile-stats-mini">
                      <span>⭐ {data?.totalStars || 0}</span>
                      <span>💎 {data?.gems || 0}</span>
                      <span>📖 {Object.keys(data?.completedLevels || {}).length}/52</span>
                    </div>
                  </div>
                  <button
                    className="profile-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirm(profile.id);
                    }}
                  >
                    ✕
                  </button>
                  {deleteConfirm === profile.id && (
                    <div className="delete-confirm" onClick={e => e.stopPropagation()}>
                      <p>Delete {profile.name}'s data?</p>
                      <div className="delete-confirm-btns">
                        <button className="delete-yes" onClick={() => deleteProfile(profile.id)}>Yes, Delete</button>
                        <button className="delete-no" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <NewProfileCard onCreate={createProfile} />
          </div>
        </div>
      </div>
    );
  }

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
            <button className="btn-new-game" onClick={() => setScreen('history')}>
              Game History 📊
            </button>
          )}

          <div className="title-bottom-btns">
            {gameState.character && (
              <button className="btn-new-game" onClick={handleResetGame}>
                Start Fresh 🔄
              </button>
            )}
            <button className="btn-new-game" onClick={handleSwitchProfile}>
              Switch Player 👥
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== GAME HISTORY SCREEN =====
  if (screen === 'history') {
    const history = (gameState.history || []).slice().reverse();
    return (
      <div className="screen history-screen">
        <div className="history-header">
          <button className="btn-exit" onClick={() => setScreen('title')}>‹</button>
          <h2 className="history-title">Game History</h2>
          <div style={{ width: 36 }} />
        </div>
        <div className="history-content">
          {gameState.character && (
            <div className="history-player-card">
              <Character config={gameState.character} size={50} />
              <div className="history-player-info">
                <div className="history-player-name">{gameState.character.name}</div>
                <div className="history-player-stats">
                  ⭐ {gameState.totalStars} stars · 💎 {gameState.gems} gems · {Object.keys(gameState.completedLevels).length} levels completed
                </div>
              </div>
            </div>
          )}

          {history.length === 0 ? (
            <div className="history-empty">
              <p>No games played yet!</p>
              <p>Complete levels to see your history here.</p>
            </div>
          ) : (
            <div className="history-list">
              {history.map((entry, i) => {
                const level = LEVELS.find(l => l.id === entry.levelId);
                const date = new Date(entry.date);
                const dateStr = date.toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' });
                const timeStr = date.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' });
                return (
                  <div key={i} className="history-entry">
                    <div className="history-entry-icon">{level?.icon || '📘'}</div>
                    <div className="history-entry-info">
                      <div className="history-entry-name">{level?.name || `Level ${entry.levelId}`}</div>
                      <div className="history-entry-date">{dateStr} at {timeStr}</div>
                    </div>
                    <div className="history-entry-result">
                      <div className="history-entry-stars">
                        {'⭐'.repeat(entry.stars)}{'☆'.repeat(3 - entry.stars)}
                      </div>
                      <div className="history-entry-score">{entry.score}/{entry.total}</div>
                    </div>
                  </div>
                );
              })}
            </div>
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

// ===== NEW PROFILE CARD COMPONENT =====
function NewProfileCard({ onCreate }) {
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');

  if (!isCreating) {
    return (
      <div className="profile-card profile-card-new" onClick={() => setIsCreating(true)}>
        <div className="profile-add-icon">+</div>
        <div className="profile-add-text">Add Player</div>
      </div>
    );
  }

  return (
    <div className="profile-card profile-card-creating" onClick={e => e.stopPropagation()}>
      <input
        className="profile-name-input"
        type="text"
        placeholder="Enter name..."
        value={name}
        onChange={e => setName(e.target.value)}
        maxLength={20}
        autoFocus
        onKeyDown={e => {
          if (e.key === 'Enter' && name.trim()) onCreate(name.trim());
          if (e.key === 'Escape') { setIsCreating(false); setName(''); }
        }}
      />
      <div className="profile-create-btns">
        <button
          className="profile-create-btn"
          disabled={!name.trim()}
          onClick={() => { if (name.trim()) onCreate(name.trim()); }}
        >
          Create
        </button>
        <button className="profile-cancel-btn" onClick={() => { setIsCreating(false); setName(''); }}>
          Cancel
        </button>
      </div>
    </div>
  );
}
