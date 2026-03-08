import React, { useState, useEffect, useCallback, useRef } from 'react';
import { LEVELS, ZONES, PETS, SHAPE_EMOJI } from './gameData';
import Character from './Character';

// ===== CLOCK COMPONENT =====
function ClockFace({ hour, minute }) {
  const hourAngle = ((hour % 12) + minute / 60) * 30 - 90;
  const minuteAngle = minute * 6 - 90;
  return (
    <svg viewBox="0 0 120 120" className="clock-svg">
      <circle cx="60" cy="60" r="55" fill="white" stroke="#333" strokeWidth="3" />
      {[...Array(12)].map((_, i) => {
        const angle = (i * 30 - 60) * Math.PI / 180;
        const x = 60 + 45 * Math.cos(angle);
        const y = 60 + 45 * Math.sin(angle);
        return <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize="12" fontWeight="bold" fill="#333">{i + 1}</text>;
      })}
      {/* Hour hand */}
      <line x1="60" y1="60"
        x2={60 + 28 * Math.cos(hourAngle * Math.PI / 180)}
        y2={60 + 28 * Math.sin(hourAngle * Math.PI / 180)}
        stroke="#E74C3C" strokeWidth="4" strokeLinecap="round" />
      {/* Minute hand */}
      <line x1="60" y1="60"
        x2={60 + 40 * Math.cos(minuteAngle * Math.PI / 180)}
        y2={60 + 40 * Math.sin(minuteAngle * Math.PI / 180)}
        stroke="#3498DB" strokeWidth="3" strokeLinecap="round" />
      <circle cx="60" cy="60" r="4" fill="#333" />
    </svg>
  );
}

// ===== SHAPE RENDERER =====
function ShapeDisplay({ shape, size = 60 }) {
  const colors = { circle: '#E74C3C', triangle: '#F39C12', square: '#3498DB', rectangle: '#2ECC71' };
  const color = colors[shape] || '#9B59B6';
  return (
    <svg viewBox="0 0 80 80" width={size} height={size}>
      {shape === 'circle' && <circle cx="40" cy="40" r="35" fill={color} />}
      {shape === 'triangle' && <polygon points="40,5 75,75 5,75" fill={color} />}
      {shape === 'square' && <rect x="8" y="8" width="64" height="64" fill={color} />}
      {shape === 'rectangle' && <rect x="4" y="18" width="72" height="44" fill={color} />}
    </svg>
  );
}

// ===== PICTURE GRAPH =====
function PictureGraph({ data }) {
  const maxCount = Math.max(...data.map(d => d.count));
  return (
    <div className="picture-graph">
      {data.map((item, i) => (
        <div key={i} className="graph-row">
          <span className="graph-label">{item.emoji} {item.name}</span>
          <div className="graph-bar">
            {[...Array(item.count)].map((_, j) => (
              <span key={j} className="graph-unit">{item.emoji}</span>
            ))}
          </div>
          <span className="graph-count">{item.count}</span>
        </div>
      ))}
      <div className="graph-axis">
        {[...Array(maxCount + 1)].map((_, i) => (
          <span key={i} className="axis-num">{i}</span>
        ))}
      </div>
    </div>
  );
}

// ===== NUMBER BOND DISPLAY =====
function NumberBondDiagram({ total, left, right }) {
  return (
    <div className="number-bond">
      <div className="bond-top">
        <div className="bond-circle total">{total}</div>
      </div>
      <div className="bond-lines">
        <svg viewBox="0 0 200 60" className="bond-svg">
          <line x1="100" y1="0" x2="50" y2="60" stroke="#8E44AD" strokeWidth="3" />
          <line x1="100" y1="0" x2="150" y2="60" stroke="#8E44AD" strokeWidth="3" />
        </svg>
      </div>
      <div className="bond-bottom">
        <div className="bond-circle part">{left !== null ? left : '?'}</div>
        <div className="bond-circle part">{right !== null ? right : '?'}</div>
      </div>
    </div>
  );
}

// ===== MAIN LEVEL PLAY COMPONENT =====
export default function LevelPlay({ levelId, gameState, onComplete, onExit, onSwitchProfile }) {
  const level = LEVELS.find(l => l.id === levelId);
  const zone = ZONES.find(z => z.id === level.zone);
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [phase, setPhase] = useState('intro'); // intro, playing, complete
  const [orderSelection, setOrderSelection] = useState([]);
  const [gemsEarned, setGemsEarned] = useState(0);
  const [streakCount, setStreakCount] = useState(0);
  const [showStreakBonus, setShowStreakBonus] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const qs = level.generate();
    setQuestions(qs);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [levelId]);

  const question = questions[currentQ];
  const progress = questions.length > 0 ? ((currentQ) / questions.length) * 100 : 0;

  const checkAnswer = useCallback((answer) => {
    if (showResult) return;
    setSelected(answer);
    setShowResult(true);

    let correct = false;
    if (question.type === 'ordering') {
      correct = JSON.stringify(answer) === JSON.stringify(question.answer);
    } else {
      correct = answer === question.answer;
    }

    setIsCorrect(correct);

    if (correct) {
      const newStreak = streakCount + 1;
      setStreakCount(newStreak);
      setScore(s => s + 1);
      const gemReward = newStreak >= 5 ? 15 : newStreak >= 3 ? 10 : 5;
      setGemsEarned(g => g + gemReward);
      if (newStreak > 0 && newStreak % 3 === 0) {
        setShowStreakBonus(true);
        setTimeout(() => setShowStreakBonus(false), 1500);
      }
    } else {
      setStreakCount(0);
      setMistakes(m => m + 1);
    }

    timeoutRef.current = setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(q => q + 1);
        setSelected(null);
        setShowResult(false);
        setShowHint(false);
        setOrderSelection([]);
      } else {
        setPhase('complete');
      }
    }, correct ? 1500 : 2500);
  }, [question, currentQ, questions.length, showResult, streakCount]);

  const handleOrderClick = (num) => {
    if (showResult) return;
    if (orderSelection.includes(num)) return;
    const newOrder = [...orderSelection, num];
    setOrderSelection(newOrder);
    if (newOrder.length === question.numbers.length) {
      checkAnswer(newOrder);
    }
  };

  const getStars = () => {
    if (questions.length === 0) return 1;
    const accuracy = score / questions.length;
    if (accuracy >= 0.9) return 3;
    if (accuracy >= 0.7) return 2;
    return 1;
  };

  // ===== INTRO PHASE =====
  if (phase === 'intro') {
    const petReward = PETS.find(p => p.unlockLevel === levelId);
    return (
      <div className="screen level-intro" style={{ '--zone-color': zone.color }}>
        <div className="intro-content">
          <div className="intro-zone-badge">
            {zone.icon} {zone.name}
            {level.bonus && <span className="bonus-tag">IQ Challenge</span>}
          </div>
          <h1 className="intro-level-name">
            <span className="intro-icon">{level.icon}</span>
            {level.bonus ? level.name : `Level ${level.id}: ${level.name}`}
          </h1>
          <p className="intro-topic">{level.topic}</p>
          <p className="intro-desc">{level.desc}</p>
          <div className="intro-info">
            <div className="info-item">📝 {questions.length} Questions</div>
            <div className="info-item">💎 Earn Gems</div>
            <div className="info-item">⭐ Up to 3 Stars</div>
          </div>
          {petReward && (
            <div className="intro-pet-preview">
              <span className="pet-preview-emoji">{petReward.emoji}</span>
              <span>{petReward.bonusMinScore ? `Score ${petReward.bonusMinScore}/12 to unlock ${petReward.name}!` : `Complete to unlock ${petReward.name}!`}</span>
            </div>
          )}
          <div className="intro-character">
            <Character config={gameState.character} size={100} animated mood="happy" />
            <div className="speech-bubble">Let's learn about {level.topic}! 🎉</div>
          </div>
          <button className="btn-start-level" onClick={() => setPhase('playing')}>
            Let's Go! 🚀
          </button>
          <button className="btn-back" onClick={onExit}>← Back to Map</button>
          {onSwitchProfile && (
            <button className="btn-switch-player" onClick={onSwitchProfile}>👤 Switch Player</button>
          )}
        </div>
      </div>
    );
  }

  // ===== COMPLETE PHASE =====
  if (phase === 'complete') {
    const stars = getStars();
    const petReward = PETS.find(p => p.unlockLevel === levelId);
    return (
      <div className="screen level-complete" style={{ '--zone-color': zone.color }}>
        <div className="complete-content">
          <h1 className="complete-title">
            {stars === 3 ? '🌟 Perfect! 🌟' : stars === 2 ? '⭐ Great Job! ⭐' : '👏 Well Done! 👏'}
          </h1>
          <div className="complete-character">
            <Character config={gameState.character} size={120} animated mood="happy" />
          </div>
          <div className="complete-stars">
            {[1, 2, 3].map(s => (
              <span key={s} className={`big-star ${s <= stars ? 'earned' : ''}`}>
                {s <= stars ? '⭐' : '☆'}
              </span>
            ))}
          </div>
          <div className="complete-stats">
            <div className="stat-row">
              <span>Correct Answers</span>
              <span className="stat-val">{score} / {questions.length}</span>
            </div>
            <div className="stat-row">
              <span>Gems Earned</span>
              <span className="stat-val">💎 {gemsEarned}</span>
            </div>
          </div>
          {petReward && (() => {
            const earned = petReward.bonusMinScore ? score >= petReward.bonusMinScore : true;
            return earned ? (
              <div className="pet-unlock-celebration">
                <div className="pet-unlock-emoji">{petReward.emoji}</div>
                <h2>Mythical Pet Unlocked!</h2>
                <p>{petReward.name} has joined your adventure!</p>
              </div>
            ) : (
              <div className="pet-unlock-missed">
                <div className="pet-missed-emoji">{petReward.emoji}</div>
                <p>Score {petReward.bonusMinScore}/12 to unlock {petReward.name}! (You got {score}/12)</p>
              </div>
            );
          })()}
          <button className="btn-continue" onClick={() => onComplete({ stars, gems: gemsEarned, score, total: questions.length })}>
            Continue →
          </button>
        </div>
      </div>
    );
  }

  // ===== PLAYING PHASE =====
  if (!question) return null;

  return (
    <div className="screen level-play" style={{ '--zone-color': zone.color }}>
      {/* Header */}
      <div className="play-header">
        <button className="btn-exit" onClick={onExit}>✕</button>
        {onSwitchProfile && (
          <button className="btn-switch-inline" onClick={onSwitchProfile} title="Switch Player">👤</button>
        )}
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
          <span className="progress-text">{currentQ + 1} / {questions.length}</span>
        </div>
        <div className="play-gems">💎 {gemsEarned}</div>
      </div>

      {/* Streak Bonus */}
      {showStreakBonus && (
        <div className="streak-bonus">🔥 {streakCount} Streak! Bonus Gems!</div>
      )}

      {/* Question Area */}
      <div className="question-area">
        {/* Character companion */}
        <div className="play-companion">
          <Character config={gameState.character} size={50} mood={showResult ? (isCorrect ? 'happy' : 'sad') : 'happy'} />
          {gameState.activePet && (
            <span className="companion-pet">{PETS.find(p => p.id === gameState.activePet)?.emoji}</span>
          )}
        </div>

        {/* Prompt */}
        <div className="question-prompt">{question.prompt}</div>

        {/* Visual content based on question type */}
        <div className="question-visual">
          {/* COUNT OBJECTS */}
          {question.type === 'countObjects' && (
            <div className="emoji-grid">
              {[...Array(question.count)].map((_, i) => (
                <span key={i} className="emoji-item" style={{ animationDelay: `${i * 0.1}s` }}>
                  {question.emoji}
                </span>
              ))}
            </div>
          )}

          {/* COMPARE */}
          {question.type === 'compare' && (
            <div className="compare-visual">
              <div className="compare-group">
                <div className="compare-label">{question.leftLabel || 'Left'}</div>
                <div className="emoji-group">
                  {question.emoji && [...Array(question.leftCount)].map((_, i) => (
                    <span key={i} className="emoji-item small">{question.emoji}</span>
                  ))}
                  {!question.emoji && <span className="compare-number">{question.leftCount}</span>}
                </div>
              </div>
              <div className="compare-vs">VS</div>
              <div className="compare-group">
                <div className="compare-label">{question.rightLabel || 'Right'}</div>
                <div className="emoji-group">
                  {question.emoji && [...Array(question.rightCount)].map((_, i) => (
                    <span key={i} className="emoji-item small">{question.emoji}</span>
                  ))}
                  {!question.emoji && <span className="compare-number">{question.rightCount}</span>}
                </div>
              </div>
            </div>
          )}

          {/* NUMBER BONDS */}
          {question.type === 'numberBonds' && (
            <NumberBondDiagram total={question.total} left={question.left} right={question.right} />
          )}

          {/* ADDITION */}
          {question.type === 'addition' && (
            <div className="addition-visual">
              <div className="add-group">
                {[...Array(question.a)].map((_, i) => (
                  <span key={i} className="emoji-item small">{question.emojiA}</span>
                ))}
              </div>
              <span className="operator">+</span>
              <div className="add-group">
                {[...Array(question.b)].map((_, i) => (
                  <span key={i} className="emoji-item small">{question.emojiB}</span>
                ))}
              </div>
              <span className="operator">=</span>
              <span className="answer-blank">?</span>
            </div>
          )}

          {/* SUBTRACTION */}
          {question.type === 'subtraction' && (
            <div className="subtraction-visual">
              <div className="sub-group">
                {[...Array(question.a)].map((_, i) => (
                  <span key={`${i}`} className={`emoji-item small ${i >= question.diff ? 'fading' : ''}`}>
                    {question.emoji}
                  </span>
                ))}
              </div>
              <div className="sub-expression">{question.a} − {question.b} = ?</div>
            </div>
          )}

          {/* MULTIPLICATION */}
          {question.type === 'multiplication' && (
            <div className="multiplication-visual">
              {[...Array(question.groups)].map((_, g) => (
                <div key={g} className="mult-group">
                  {[...Array(question.perGroup)].map((_, i) => (
                    <span key={i} className="emoji-item small">{question.emoji}</span>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* DIVISION */}
          {question.type === 'division' && (
            <div className="division-visual">
              <div className="div-total">
                {[...Array(question.total)].map((_, i) => (
                  <span key={i} className="emoji-item small">{question.emoji}</span>
                ))}
              </div>
              <div className="div-arrow">↓ Share among {question.divisor}</div>
              <div className="div-groups">
                {[...Array(question.divisor)].map((_, g) => (
                  <div key={g} className="div-group-box">👤</div>
                ))}
              </div>
            </div>
          )}

          {/* CLOCK */}
          {question.type === 'clock' && (
            <div className="clock-visual">
              <ClockFace hour={question.hour} minute={question.minute} />
            </div>
          )}

          {/* SHAPE IDENTIFY */}
          {question.type === 'shapeIdentify' && (
            <div className="shapes-grid">
              {question.shapes.map((shape, i) => (
                <button
                  key={i}
                  className={`shape-option ${selected === shape ? (showResult ? (isCorrect ? 'correct' : 'wrong') : 'selected') : ''} ${showResult && shape === question.answer ? 'correct' : ''}`}
                  onClick={() => !showResult && checkAnswer(shape)}
                >
                  <ShapeDisplay shape={shape} size={80} />
                  <span className="shape-name">{shape}</span>
                </button>
              ))}
            </div>
          )}

          {/* SHAPE PATTERN */}
          {question.type === 'shapePattern' && (
            <div className="pattern-visual">
              <div className="pattern-row">
                {question.pattern.map((s, i) => (
                  <div key={i} className={`pattern-item ${s === '?' ? 'blank' : ''}`}>
                    {s === '?' ? '?' : <ShapeDisplay shape={s} size={50} />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ORDERING */}
          {question.type === 'ordering' && (
            <div className="ordering-visual">
              <div className="order-selected">
                {orderSelection.map((n, i) => (
                  <span key={i} className="order-placed">{n}</span>
                ))}
                {[...Array(question.numbers.length - orderSelection.length)].map((_, i) => (
                  <span key={`blank-${i}`} className="order-blank">_</span>
                ))}
              </div>
              <div className="order-choices">
                {question.numbers.map((n, i) => (
                  <button
                    key={i}
                    className={`order-btn ${orderSelection.includes(n) ? 'used' : ''}`}
                    onClick={() => handleOrderClick(n)}
                    disabled={orderSelection.includes(n) || showResult}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ORDINAL */}
          {question.type === 'ordinal' && (
            <div className="ordinal-visual">
              <div className="ordinal-line">
                {question.items.map((item, i) => (
                  <div key={i} className="ordinal-item">
                    <span className="ordinal-emoji">{item}</span>
                    <span className="ordinal-pos">{i + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PATTERN (number) */}
          {question.type === 'pattern' && (
            <div className="number-pattern-visual">
              <div className="pattern-numbers">
                {question.sequence.map((n, i) => (
                  <span key={i} className={`pattern-num ${n === '?' ? 'blank' : ''}`}>
                    {n}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* PICTURE GRAPH */}
          {question.type === 'pictureGraph' && (
            <PictureGraph data={question.graphData} />
          )}

          {/* WORD PROBLEM */}
          {question.type === 'wordProblem' && question.emoji && (
            <div className="word-problem-visual">
              <span className="wp-emoji">{question.emoji}</span>
            </div>
          )}
        </div>

        {/* Answer options (for most question types) */}
        {!['shapeIdentify', 'ordering'].includes(question.type) && (
          <div className="answer-options">
            {(question.options || []).map((opt, i) => {
              const isSelected = selected === opt;
              const isAnswer = opt === question.answer;
              let className = 'option-button';
              if (showResult) {
                if (isAnswer) className += ' correct';
                else if (isSelected) className += ' wrong';
              } else if (isSelected) {
                className += ' selected';
              }
              return (
                <button
                  key={i}
                  className={className}
                  onClick={() => !showResult && checkAnswer(opt)}
                  disabled={showResult}
                >
                  {typeof opt === 'string' && SHAPE_EMOJI[opt] ? (
                    <><ShapeDisplay shape={opt} size={30} /> {opt}</>
                  ) : (
                    opt
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Ordering result feedback */}
        {question.type === 'ordering' && showResult && (
          <div className={`order-result ${isCorrect ? 'correct' : 'wrong'}`}>
            {isCorrect ? '✅ Correct!' : `❌ The right order is: ${question.answer.join(', ')}`}
          </div>
        )}

        {/* Hint button */}
        {!showResult && !showHint && (
          <button className="hint-btn" onClick={() => setShowHint(true)}>
            💡 Need a hint?
          </button>
        )}
        {showHint && !showResult && (
          <div className="hint-bubble">💡 {question.hint}</div>
        )}

        {/* Result feedback */}
        {showResult && (
          <div className={`result-feedback ${isCorrect ? 'correct' : 'wrong'}`}>
            {isCorrect ? (
              <span className="result-text">
                {['Awesome! 🎉', 'Amazing! ✨', 'You got it! 🌟', 'Brilliant! 💫', 'Super! 🎊'][Math.floor(Math.random() * 5)]}
                <span className="gem-earn">+💎</span>
              </span>
            ) : (
              <span className="result-text">
                Not quite! The answer is <strong>{String(question.answer)}</strong>
                <br /><small>{question.hint}</small>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
