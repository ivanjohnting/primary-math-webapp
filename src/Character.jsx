import React from 'react';

const SKIN_TONES = ['#FFDBB4', '#F1C27D', '#E0AC69', '#C68642', '#8D5524'];
const HAIR_COLORS = ['#2C1B0E', '#4A2C0A', '#D4A853', '#C0392B', '#8E44AD', '#2980B9'];
const OUTFIT_COLORS = ['#E91E63', '#9C27B0', '#3F51B5', '#009688', '#FF9800', '#F44336'];
const HAIR_STYLES = ['long', 'short', 'ponytails', 'braids', 'curly', 'bob'];
const ACCESSORIES = ['none', 'bow', 'crown', 'glasses', 'cat_ears', 'flower'];

export const CHARACTER_OPTIONS = {
  skinTones: SKIN_TONES,
  hairColors: HAIR_COLORS,
  outfitColors: OUTFIT_COLORS,
  hairStyles: HAIR_STYLES,
  accessories: ACCESSORIES,
};

export const DEFAULT_CHARACTER = {
  skinTone: 0,
  hairColor: 0,
  outfitColor: 0,
  hairStyle: 0,
  accessory: 0,
  name: '',
};

export default function Character({ config, size = 120, animated = false, mood = 'happy' }) {
  const skin = SKIN_TONES[config.skinTone] || SKIN_TONES[0];
  const hair = HAIR_COLORS[config.hairColor] || HAIR_COLORS[0];
  const outfit = OUTFIT_COLORS[config.outfitColor] || OUTFIT_COLORS[0];
  const hairStyle = HAIR_STYLES[config.hairStyle] || 'long';
  const accessory = ACCESSORIES[config.accessory] || 'none';

  const eyeY = mood === 'happy' ? 42 : mood === 'sad' ? 40 : 42;
  const mouthPath = mood === 'happy' ? 'M 42 52 Q 50 60 58 52'
    : mood === 'sad' ? 'M 42 56 Q 50 50 58 56'
    : mood === 'thinking' ? 'M 44 54 L 56 54'
    : 'M 42 52 Q 50 60 58 52';

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={animated ? 'character-bounce' : ''}>
      {/* Body/Outfit */}
      <ellipse cx="50" cy="85" rx="22" ry="15" fill={outfit} />
      <rect x="28" y="70" width="44" height="15" rx="5" fill={outfit} />
      {/* Outfit detail - collar */}
      <path d="M 42 70 L 50 78 L 58 70" fill="none" stroke="white" strokeWidth="1.5" opacity="0.6" />

      {/* Neck */}
      <rect x="45" y="62" width="10" height="10" rx="3" fill={skin} />

      {/* Head */}
      <circle cx="50" cy="40" r="25" fill={skin} />

      {/* Hair - back layer */}
      {hairStyle === 'long' && (
        <>
          <ellipse cx="50" cy="32" rx="27" ry="20" fill={hair} />
          <rect x="23" y="32" width="12" height="38" rx="6" fill={hair} />
          <rect x="65" y="32" width="12" height="38" rx="6" fill={hair} />
        </>
      )}
      {hairStyle === 'short' && (
        <ellipse cx="50" cy="30" rx="27" ry="18" fill={hair} />
      )}
      {hairStyle === 'ponytails' && (
        <>
          <ellipse cx="50" cy="30" rx="27" ry="18" fill={hair} />
          <circle cx="24" cy="35" r="10" fill={hair} />
          <circle cx="76" cy="35" r="10" fill={hair} />
          <rect x="22" y="35" width="8" height="25" rx="4" fill={hair} />
          <rect x="70" y="35" width="8" height="25" rx="4" fill={hair} />
        </>
      )}
      {hairStyle === 'braids' && (
        <>
          <ellipse cx="50" cy="30" rx="27" ry="18" fill={hair} />
          <rect x="23" y="32" width="8" height="42" rx="4" fill={hair} />
          <rect x="69" y="32" width="8" height="42" rx="4" fill={hair} />
          {[0, 1, 2, 3].map(j => (
            <React.Fragment key={j}>
              <circle cx="27" cy={42 + j * 8} r="4.5" fill={hair} stroke={skin} strokeWidth="0.5" />
              <circle cx="73" cy={42 + j * 8} r="4.5" fill={hair} stroke={skin} strokeWidth="0.5" />
            </React.Fragment>
          ))}
        </>
      )}
      {hairStyle === 'curly' && (
        <>
          <ellipse cx="50" cy="30" rx="28" ry="20" fill={hair} />
          {[25, 33, 41, 59, 67, 75].map((x, i) => (
            <circle key={i} cx={x} cy={22 + (i % 2) * 5} r="7" fill={hair} />
          ))}
          <circle cx="22" cy="40" r="8" fill={hair} />
          <circle cx="78" cy="40" r="8" fill={hair} />
        </>
      )}
      {hairStyle === 'bob' && (
        <>
          <ellipse cx="50" cy="32" rx="28" ry="20" fill={hair} />
          <rect x="22" y="32" width="12" height="18" rx="6" fill={hair} />
          <rect x="66" y="32" width="12" height="18" rx="6" fill={hair} />
        </>
      )}

      {/* Bangs */}
      <ellipse cx="50" cy="22" rx="22" ry="8" fill={hair} />
      <ellipse cx="38" cy="26" rx="8" ry="5" fill={hair} />
      <ellipse cx="62" cy="26" rx="8" ry="5" fill={hair} />

      {/* Eyes */}
      <ellipse cx="40" cy={eyeY} rx="4" ry="4.5" fill="white" />
      <ellipse cx="60" cy={eyeY} rx="4" ry="4.5" fill="white" />
      <circle cx="41" cy={eyeY + 0.5} r="2.5" fill="#2C1B0E" />
      <circle cx="61" cy={eyeY + 0.5} r="2.5" fill="#2C1B0E" />
      {/* Eye sparkle */}
      <circle cx="42" cy={eyeY - 1} r="1" fill="white" />
      <circle cx="62" cy={eyeY - 1} r="1" fill="white" />

      {/* Blush */}
      {mood === 'happy' && (
        <>
          <ellipse cx="33" cy="48" rx="5" ry="3" fill="#FFB6C1" opacity="0.5" />
          <ellipse cx="67" cy="48" rx="5" ry="3" fill="#FFB6C1" opacity="0.5" />
        </>
      )}

      {/* Mouth */}
      <path d={mouthPath} fill="none" stroke="#C0392B" strokeWidth="2" strokeLinecap="round" />

      {/* Accessories */}
      {accessory === 'bow' && (
        <g transform="translate(65, 18)">
          <path d="M 0 0 Q -8 -6 -4 -12 Q 0 -8 0 0 Q 0 -8 4 -12 Q 8 -6 0 0" fill="#FF69B4" />
          <circle cx="0" cy="0" r="2" fill="#FF1493" />
        </g>
      )}
      {accessory === 'crown' && (
        <g transform="translate(50, 8)">
          <path d="M -14 8 L -12 -2 L -6 4 L 0 -4 L 6 4 L 12 -2 L 14 8 Z" fill="#FFD700" stroke="#DAA520" strokeWidth="0.5" />
          <circle cx="0" cy="-2" r="2" fill="#E74C3C" />
          <circle cx="-8" cy="2" r="1.5" fill="#3498DB" />
          <circle cx="8" cy="2" r="1.5" fill="#2ECC71" />
        </g>
      )}
      {accessory === 'glasses' && (
        <g>
          <circle cx="40" cy="42" r="7" fill="none" stroke="#8E44AD" strokeWidth="2" />
          <circle cx="60" cy="42" r="7" fill="none" stroke="#8E44AD" strokeWidth="2" />
          <line x1="47" y1="42" x2="53" y2="42" stroke="#8E44AD" strokeWidth="2" />
        </g>
      )}
      {accessory === 'cat_ears' && (
        <g>
          <path d="M 28 22 L 22 4 L 38 16 Z" fill={hair} stroke={skin} strokeWidth="1" />
          <path d="M 72 22 L 78 4 L 62 16 Z" fill={hair} stroke={skin} strokeWidth="1" />
          <path d="M 29 20 L 25 8 L 36 17 Z" fill="#FFB6C1" />
          <path d="M 71 20 L 75 8 L 64 17 Z" fill="#FFB6C1" />
        </g>
      )}
      {accessory === 'flower' && (
        <g transform="translate(72, 25)">
          {[0, 60, 120, 180, 240, 300].map((angle, i) => (
            <ellipse key={i} cx={Math.cos(angle * Math.PI / 180) * 5} cy={Math.sin(angle * Math.PI / 180) * 5} rx="4" ry="3" fill="#FF69B4"
              transform={`rotate(${angle})`} />
          ))}
          <circle cx="0" cy="0" r="3" fill="#FFD700" />
        </g>
      )}
    </svg>
  );
}
