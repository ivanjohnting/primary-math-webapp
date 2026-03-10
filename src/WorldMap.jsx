import React, { useRef, useEffect } from 'react';
import { LEVELS, ZONES, PETS } from './gameData';
import Character from './Character';

export default function WorldMap({ gameState, onSelectLevel, onBack, onSwitchProfile }) {
  const mapRef = useRef(null);
  const { completedLevels, character, gems, activePet } = gameState;

  // Only count regular levels (not bonus IDs 100+) for progression
  const highestCompleted = Math.max(0, ...Object.keys(completedLevels).map(Number).filter(id => id <= 52));
  const currentLevel = Math.min(highestCompleted + 1, 52);

  const unlockedPets = PETS.filter(p => {
    if (p.bonusMinScore) {
      // Bonus pets need score >= bonusMinScore
      const completed = completedLevels[p.unlockLevel];
      return completed && (completed.score || 0) >= p.bonusMinScore;
    }
    return highestCompleted >= p.unlockLevel;
  });
  const totalStars = Object.values(completedLevels).reduce((sum, l) => sum + (l.stars || 0), 0);

  useEffect(() => {
    if (mapRef.current) {
      const currentNode = mapRef.current.querySelector(`.level-node[data-level="${currentLevel}"]`);
      if (currentNode) {
        currentNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentLevel]);

  return (
    <div className="screen world-map">
      <div className="map-header">
        <div className="map-stats">
          <div className="stat">
            <span className="stat-icon">⭐</span>
            <span className="stat-value">{totalStars}</span>
          </div>
          <div className="stat">
            <span className="stat-icon">💎</span>
            <span className="stat-value">{gems}</span>
          </div>
          {activePet && (
            <div className="stat">
              <span className="stat-icon">{PETS.find(p => p.id === activePet)?.emoji}</span>
              <span className="stat-value">{PETS.find(p => p.id === activePet)?.name}</span>
            </div>
          )}
        </div>
        <div className="map-character-mini">
          <Character config={character} size={50} />
          <span className="char-name">{character.name}</span>
          {onSwitchProfile && (
            <button className="btn-switch-map" onClick={onSwitchProfile} title="Switch Player">👤</button>
          )}
        </div>
      </div>

      <div className="map-container" ref={mapRef}>
        {ZONES.map((zone) => {
          const zoneLevels = LEVELS.filter(l => l.zone === zone.id && !l.bonus);
          const bonusLevel = LEVELS.find(l => l.zone === zone.id && l.bonus);
          return (
            <div key={zone.id} className="zone-section" style={{ '--zone-color': zone.color, '--zone-bg': zone.bg }}>
              <div className="zone-banner">
                <span className="zone-icon">{zone.icon}</span>
                <div>
                  <h2 className="zone-name">{zone.name}</h2>
                  <p className="zone-desc">{zone.description}</p>
                </div>
              </div>

              <div className="zone-levels">
                {zoneLevels.map((level, idx) => {
                  const isCompleted = !!completedLevels[level.id];
                  const isUnlocked = level.id <= currentLevel;
                  const isCurrent = level.id === currentLevel;
                  const stars = completedLevels[level.id]?.stars || 0;
                  const petReward = PETS.find(p => p.unlockLevel === level.id);

                  return (
                    <div
                      key={level.id}
                      className={`level-node ${isCompleted ? 'completed' : ''} ${isUnlocked ? 'unlocked' : 'locked'} ${isCurrent ? 'current' : ''}`}
                      data-level={level.id}
                      onClick={() => isUnlocked && onSelectLevel(level.id)}
                    >
                      <div className="node-circle">
                        {!isUnlocked ? (
                          <span className="lock-icon">🔒</span>
                        ) : (
                          <>
                            <span className="level-icon">{level.icon}</span>
                            <span className="level-num">{level.id}</span>
                          </>
                        )}
                      </div>
                      {isCompleted && (
                        <div className="node-stars">
                          {'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}
                        </div>
                      )}
                      {isCurrent && !isCompleted && (
                        <div className="current-indicator">
                          <Character config={character} size={36} animated />
                          {activePet && (
                            <div className="pet-follower">
                              {PETS.find(p => p.id === activePet)?.emoji}
                            </div>
                          )}
                        </div>
                      )}
                      <div className="node-label">{level.name}</div>
                      {petReward && (
                        <div className="pet-badge" title={`Unlock ${petReward.name}!`}>
                          {petReward.emoji}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Bonus IQ Level - always open */}
                {bonusLevel && (() => {
                  const isCompleted = !!completedLevels[bonusLevel.id];
                  const stars = completedLevels[bonusLevel.id]?.stars || 0;
                  const bonusPet = PETS.find(p => p.unlockLevel === bonusLevel.id);
                  const petEarned = isCompleted && (completedLevels[bonusLevel.id]?.score || 0) >= 10;
                  return (
                    <div
                      key={bonusLevel.id}
                      className={`level-node bonus-level ${isCompleted ? 'completed' : ''} unlocked`}
                      data-level={bonusLevel.id}
                      onClick={() => onSelectLevel(bonusLevel.id)}
                    >
                      <div className="node-circle bonus-circle">
                        <span className="level-icon">{bonusLevel.icon}</span>
                        <span className="bonus-badge">IQ</span>
                      </div>
                      {isCompleted && (
                        <div className="node-stars">
                          {'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}
                        </div>
                      )}
                      <div className="node-label">{bonusLevel.name}</div>
                      {bonusPet && (
                        <div className={`pet-badge ${petEarned ? 'earned' : ''}`} title={petEarned ? `${bonusPet.name} unlocked!` : `Score 10/12 to unlock ${bonusPet.name}!`}>
                          {bonusPet.emoji}
                          {!petEarned && <span className="pet-lock-mini">🔒</span>}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          );
        })}
      </div>

      {unlockedPets.length > 0 && (
        <div className="pets-drawer">
          <h3>🐾 My Pets</h3>
          <div className="pets-list">
            {unlockedPets.map(pet => (
              <button
                key={pet.id}
                className={`pet-btn ${activePet === pet.id ? 'active' : ''}`}
                onClick={() => onBack('setPet', pet.id)}
                title={pet.name}
              >
                <span className="pet-emoji">{pet.emoji}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
