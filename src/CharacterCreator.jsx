import React, { useState } from 'react';
import Character, { CHARACTER_OPTIONS, DEFAULT_CHARACTER } from './Character';

const OPTION_LABELS = {
  skinTones: { label: 'Skin', renderOption: (_, i) => <div className="color-swatch" style={{ background: CHARACTER_OPTIONS.skinTones[i] }} /> },
  hairColors: { label: 'Hair Color', renderOption: (_, i) => <div className="color-swatch" style={{ background: CHARACTER_OPTIONS.hairColors[i] }} /> },
  outfitColors: { label: 'Outfit', renderOption: (_, i) => <div className="color-swatch" style={{ background: CHARACTER_OPTIONS.outfitColors[i] }} /> },
  hairStyles: { label: 'Hair Style', renderOption: (val) => <span className="style-label">{val}</span> },
  accessories: { label: 'Accessory', renderOption: (val) => <span className="style-label">{val === 'none' ? 'None' : val === 'cat_ears' ? 'Cat Ears' : val.charAt(0).toUpperCase() + val.slice(1)}</span> },
};

const CONFIG_KEYS = {
  skinTones: 'skinTone',
  hairColors: 'hairColor',
  outfitColors: 'outfitColor',
  hairStyles: 'hairStyle',
  accessories: 'accessory',
};

export default function CharacterCreator({ onComplete }) {
  const [config, setConfig] = useState({ ...DEFAULT_CHARACTER });
  const [name, setName] = useState('');
  const [step, setStep] = useState(0);

  const sections = ['skinTones', 'hairColors', 'hairStyles', 'outfitColors', 'accessories'];
  const currentSection = sections[step];

  const handleSelect = (optionKey, index) => {
    setConfig(prev => ({ ...prev, [CONFIG_KEYS[optionKey]]: index }));
  };

  const handleDone = () => {
    if (!name.trim()) return;
    onComplete({ ...config, name: name.trim() });
  };

  return (
    <div className="screen character-creator">
      <div className="creator-sparkles">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="sparkle" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }}>✨</div>
        ))}
      </div>

      <h1 className="creator-title">Create Your Explorer! 🌟</h1>

      <div className="creator-layout">
        <div className="character-preview">
          <div className="preview-frame">
            <Character config={config} size={200} animated />
          </div>
          {name && <div className="character-name-display">{name}</div>}
        </div>

        <div className="creator-controls">
          {step < sections.length ? (
            <>
              <h2 className="section-title">
                {OPTION_LABELS[currentSection].label}
              </h2>
              <div className="option-grid">
                {CHARACTER_OPTIONS[currentSection].map((val, i) => (
                  <button
                    key={i}
                    className={`option-btn ${config[CONFIG_KEYS[currentSection]] === i ? 'selected' : ''}`}
                    onClick={() => handleSelect(currentSection, i)}
                  >
                    {OPTION_LABELS[currentSection].renderOption(val, i)}
                  </button>
                ))}
              </div>
              <div className="creator-nav">
                {step > 0 && (
                  <button className="nav-btn back-btn" onClick={() => setStep(s => s - 1)}>
                    ← Back
                  </button>
                )}
                <button className="nav-btn next-btn" onClick={() => setStep(s => s + 1)}>
                  Next →
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="section-title">What's your name, explorer?</h2>
              <input
                className="name-input"
                type="text"
                placeholder="Type your name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={20}
                autoFocus
              />
              <div className="creator-nav">
                <button className="nav-btn back-btn" onClick={() => setStep(s => s - 1)}>
                  ← Back
                </button>
                <button
                  className={`nav-btn start-btn ${!name.trim() ? 'disabled' : ''}`}
                  onClick={handleDone}
                  disabled={!name.trim()}
                >
                  Start Adventure! 🚀
                </button>
              </div>
            </>
          )}

          <div className="step-dots">
            {[...Array(sections.length + 1)].map((_, i) => (
              <div key={i} className={`dot ${i === step ? 'active' : i < step ? 'done' : ''}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
