import React, { useRef, useEffect, useState } from 'react';
import { LEVELS, ZONES, PETS } from './gameData';
import Character from './Character';

// Zone terrain configs for isometric tiles
const ZONE_TERRAINS = {
  1: { ground: '#7ec850', groundDark: '#5da33a', accent: '#4a8c2e', trees: true, label: 'forest' },
  2: { ground: '#f2d98a', groundDark: '#d4b96e', accent: '#3498db', water: true, label: 'beach' },
  3: { ground: '#a8a0b8', groundDark: '#8a7fa0', accent: '#9b59b6', rocks: true, label: 'mountains' },
  4: { ground: '#e8c87a', groundDark: '#c9a85c', accent: '#e67e22', castle: true, label: 'kingdom' },
};

// Generate a winding path of positions for level nodes within a zone
function getIsometricPath(count) {
  const positions = [];
  const cols = 4;
  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const isEvenRow = row % 2 === 0;
    const actualCol = isEvenRow ? col : (cols - 1 - col);
    // Isometric offset: even rows shift right
    const x = 60 + actualCol * 140 + (row % 2 === 0 ? 0 : 20);
    const y = 30 + row * 75;
    positions.push({ x, y });
  }
  return positions;
}

export default function WorldMap({ gameState, onSelectLevel, onBack }) {
  const mapRef = useRef(null);
  const { completedLevels, character, gems, activePet } = gameState;
  const [hoveredLevel, setHoveredLevel] = useState(null);

  const highestCompleted = Math.max(0, ...Object.keys(completedLevels).map(Number));
  const currentLevel = Math.min(highestCompleted + 1, 52);

  const unlockedPets = PETS.filter(p => highestCompleted >= p.unlockLevel);
  const totalStars = Object.values(completedLevels).reduce((sum, l) => sum + (l.stars || 0), 0);

  useEffect(() => {
    if (mapRef.current) {
      const currentNode = mapRef.current.querySelector(`.iso-node[data-level="${currentLevel}"]`);
      if (currentNode) {
        currentNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentLevel]);

  // Draw path SVG between nodes
  const renderPath = (positions, zoneLevels) => {
    if (positions.length < 2) return null;
    const pathParts = [];
    for (let i = 0; i < positions.length - 1; i++) {
      const from = positions[i];
      const to = positions[i + 1];
      const midX = (from.x + to.x) / 2;
      const midY = (from.y + to.y) / 2 - 10;
      pathParts.push(
        <path
          key={i}
          d={`M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`}
          fill="none"
          stroke={completedLevels[zoneLevels[i]?.id] ? '#FFD700' : '#c8b88a'}
          strokeWidth="4"
          strokeDasharray={completedLevels[zoneLevels[i]?.id] ? 'none' : '8,6'}
          strokeLinecap="round"
          opacity="0.7"
        />
      );
    }
    return pathParts;
  };

  // Render decorative elements per zone
  const renderDecorations = (terrain, width, height) => {
    const decos = [];
    if (terrain.trees) {
      const treePositions = [[20, 50], [width - 40, 30], [30, height - 60], [width - 60, height - 40], [width / 2 + 80, 20]];
      treePositions.forEach(([tx, ty], i) => {
        decos.push(
          <g key={`tree-${i}`} transform={`translate(${tx}, ${ty})`} opacity="0.6">
            <polygon points="0,-20 12,5 -12,5" fill="#2d7a1e" />
            <polygon points="0,-12 10,8 -10,8" fill="#3a9428" />
            <rect x="-2" y="5" width="4" height="8" fill="#8B4513" rx="1" />
          </g>
        );
      });
    }
    if (terrain.water) {
      decos.push(
        <g key="waves" opacity="0.3">
          <path d={`M 0 ${height - 15} Q ${width / 4} ${height - 25} ${width / 2} ${height - 15} Q ${width * 3 / 4} ${height - 5} ${width} ${height - 15}`} fill="none" stroke="#3498db" strokeWidth="3" />
          <path d={`M 0 ${height - 8} Q ${width / 4} ${height - 18} ${width / 2} ${height - 8} Q ${width * 3 / 4} ${height + 2} ${width} ${height - 8}`} fill="none" stroke="#3498db" strokeWidth="2" />
        </g>
      );
    }
    if (terrain.rocks) {
      const rockPositions = [[15, 40], [width - 30, 60], [width / 2 - 60, height - 30]];
      rockPositions.forEach(([rx, ry], i) => {
        decos.push(
          <g key={`rock-${i}`} transform={`translate(${rx}, ${ry})`} opacity="0.4">
            <ellipse cx="0" cy="0" rx="12" ry="8" fill="#888" />
            <ellipse cx="5" cy="-3" rx="8" ry="6" fill="#999" />
          </g>
        );
      });
    }
    if (terrain.castle) {
      decos.push(
        <g key="flag" transform={`translate(${width - 50}, 25)`} opacity="0.5">
          <rect x="0" y="0" width="3" height="30" fill="#8B4513" />
          <polygon points="3,0 20,5 3,10" fill="#e74c3c" />
        </g>
      );
    }
    return decos;
  };

  return (
    <div className="screen world-map iso-map">
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
        </div>
      </div>

      <div className="iso-map-container" ref={mapRef}>
        {ZONES.map((zone) => {
          const zoneLevels = LEVELS.filter(l => l.zone === zone.id);
          const terrain = ZONE_TERRAINS[zone.id];
          const positions = getIsometricPath(zoneLevels.length);
          const svgWidth = 620;
          const rows = Math.ceil(zoneLevels.length / 4);
          const svgHeight = rows * 75 + 80;

          return (
            <div key={zone.id} className={`iso-zone iso-zone-${terrain.label}`}>
              {/* Zone title banner */}
              <div className="iso-zone-banner">
                <span className="iso-zone-icon">{zone.icon}</span>
                <div>
                  <h2 className="iso-zone-name">{zone.name}</h2>
                  <p className="iso-zone-desc">{zone.description}</p>
                </div>
              </div>

              {/* Isometric terrain tile */}
              <div className="iso-terrain-wrapper">
                <div className="iso-terrain">
                  <svg
                    className="iso-terrain-svg"
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    preserveAspectRatio="xMidYMid meet"
                  >
                    {/* Ground tile with isometric diamond shape */}
                    <defs>
                      <linearGradient id={`ground-${zone.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={terrain.ground} />
                        <stop offset="100%" stopColor={terrain.groundDark} />
                      </linearGradient>
                      <filter id={`shadow-${zone.id}`}>
                        <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.15" />
                      </filter>
                    </defs>

                    {/* Ground plane */}
                    <rect
                      x="10" y="10"
                      width={svgWidth - 20} height={svgHeight - 20}
                      rx="20" ry="20"
                      fill={`url(#ground-${zone.id})`}
                      filter={`url(#shadow-${zone.id})`}
                      opacity="0.9"
                    />

                    {/* Grid texture */}
                    {Array.from({ length: Math.floor((svgWidth - 20) / 40) }).map((_, i) => (
                      <line
                        key={`vl-${i}`}
                        x1={20 + i * 40} y1="15"
                        x2={20 + i * 40} y2={svgHeight - 15}
                        stroke={terrain.groundDark}
                        strokeWidth="0.5"
                        opacity="0.15"
                      />
                    ))}
                    {Array.from({ length: Math.floor((svgHeight - 20) / 40) }).map((_, i) => (
                      <line
                        key={`hl-${i}`}
                        x1="15" y1={20 + i * 40}
                        x2={svgWidth - 15} y2={20 + i * 40}
                        stroke={terrain.groundDark}
                        strokeWidth="0.5"
                        opacity="0.15"
                      />
                    ))}

                    {/* Decorations */}
                    {renderDecorations(terrain, svgWidth, svgHeight)}

                    {/* Path between nodes */}
                    {renderPath(positions, zoneLevels)}
                  </svg>

                  {/* Level nodes overlaid on the terrain */}
                  <div className="iso-nodes-overlay" style={{ height: svgHeight }}>
                    {zoneLevels.map((level, idx) => {
                      const pos = positions[idx];
                      const isCompleted = !!completedLevels[level.id];
                      const isUnlocked = level.id <= currentLevel;
                      const isCurrent = level.id === currentLevel;
                      const stars = completedLevels[level.id]?.stars || 0;
                      const petReward = PETS.find(p => p.unlockLevel === level.id);
                      const isHovered = hoveredLevel === level.id;

                      return (
                        <div
                          key={level.id}
                          className={`iso-node ${isCompleted ? 'completed' : ''} ${isUnlocked ? 'unlocked' : 'locked'} ${isCurrent ? 'current' : ''}`}
                          data-level={level.id}
                          style={{
                            left: pos.x,
                            top: pos.y,
                          }}
                          onClick={() => isUnlocked && onSelectLevel(level.id)}
                          onMouseEnter={() => setHoveredLevel(level.id)}
                          onMouseLeave={() => setHoveredLevel(null)}
                        >
                          {/* Elevation shadow */}
                          <div className="iso-node-shadow" />

                          {/* Node circle (elevated) */}
                          <div className="iso-node-body">
                            <div className="iso-node-circle">
                              {!isUnlocked ? (
                                <span className="lock-icon">🔒</span>
                              ) : (
                                <>
                                  <span className="level-icon">{level.icon}</span>
                                  <span className="level-num">{level.id}</span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Stars */}
                          {isCompleted && (
                            <div className="iso-node-stars">
                              {'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}
                            </div>
                          )}

                          {/* Character on current level */}
                          {isCurrent && !isCompleted && (
                            <div className="iso-current-char">
                              <Character config={character} size={32} animated />
                              {activePet && (
                                <div className="iso-pet-follower">
                                  {PETS.find(p => p.id === activePet)?.emoji}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Tooltip on hover */}
                          {isHovered && isUnlocked && (
                            <div className="iso-tooltip">
                              <div className="iso-tooltip-name">{level.name}</div>
                              <div className="iso-tooltip-topic">{level.topic}</div>
                            </div>
                          )}

                          {/* Pet reward badge */}
                          {petReward && (
                            <div className="iso-pet-badge" title={`Unlock ${petReward.name}!`}>
                              {petReward.emoji}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
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
