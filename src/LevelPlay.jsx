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
  const [answerHistory, setAnswerHistory] = useState([]); // { selected, isCorrect } per question
  const [reviewIndex, setReviewIndex] = useState(null); // null = live question, number = reviewing
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
    setAnswerHistory(prev => {
      const updated = [...prev];
      updated[currentQ] = { selected: answer, isCorrect: correct };
      return updated;
    });

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

  const isReviewing = reviewIndex !== null;
  const displayQ = isReviewing ? questions[reviewIndex] : question;
  const displayIndex = isReviewing ? reviewIndex : currentQ;
  const reviewData = isReviewing ? answerHistory[reviewIndex] : null;
  // In review mode, always show result state
  const displayShowResult = isReviewing ? true : showResult;
  const displaySelected = isReviewing ? reviewData?.selected : selected;
  const displayIsCorrect = isReviewing ? reviewData?.isCorrect : isCorrect;

  const canGoPrev = isReviewing ? reviewIndex > 0 : currentQ > 0;
  const canGoNext = isReviewing && reviewIndex < currentQ;

  const goToPrev = () => {
    if (isReviewing) {
      if (reviewIndex > 0) setReviewIndex(reviewIndex - 1);
    } else if (currentQ > 0) {
      setReviewIndex(currentQ - 1);
    }
  };
  const goToNext = () => {
    if (isReviewing && reviewIndex < currentQ - 1) {
      setReviewIndex(reviewIndex + 1);
    } else {
      setReviewIndex(null);
    }
  };
  const backToCurrent = () => setReviewIndex(null);

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
          <span className="progress-text">{displayIndex + 1} / {questions.length}</span>
        </div>
        <div className="play-gems">💎 {gemsEarned}</div>
      </div>

      {/* Review navigation */}
      {(canGoPrev || isReviewing) && (
        <div className="review-nav">
          <button className="btn-review-prev" onClick={goToPrev} disabled={!canGoPrev}>
            ◀ Previous
          </button>
          {isReviewing && (
            <>
              {canGoNext && (
                <button className="btn-review-next" onClick={goToNext}>
                  Next ▶
                </button>
              )}
              <button className="btn-review-back" onClick={backToCurrent}>
                Back to Question {currentQ + 1} →
              </button>
            </>
          )}
          {!isReviewing && (
            <span className="review-nav-hint">Review previous questions</span>
          )}
        </div>
      )}

      {/* Review mode banner */}
      {isReviewing && (
        <div className="review-banner">
          📖 Reviewing Question {reviewIndex + 1} — {reviewData?.isCorrect ? '✅ You got this right!' : '❌ You got this wrong'}
        </div>
      )}

      {/* Streak Bonus */}
      {!isReviewing && showStreakBonus && (
        <div className="streak-bonus">🔥 {streakCount} Streak! Bonus Gems!</div>
      )}

      {/* Question Area */}
      <div className={`question-area ${isReviewing ? 'reviewing' : ''}`}>
        {/* Character companion */}
        <div className="play-companion">
          <Character config={gameState.character} size={50} mood={displayShowResult ? (displayIsCorrect ? 'happy' : 'sad') : 'happy'} />
          {gameState.activePet && (
            <span className="companion-pet">{PETS.find(p => p.id === gameState.activePet)?.emoji}</span>
          )}
        </div>

        {/* Prompt */}
        <div className="question-prompt">{displayQ.prompt}</div>

        {/* Visual content based on question type */}
        <div className="question-visual">
          {/* COUNT OBJECTS */}
          {displayQ.type === 'countObjects' && (
            <div className="emoji-grid">
              {[...Array(displayQ.count)].map((_, i) => (
                <span key={i} className="emoji-item" style={{ animationDelay: `${i * 0.1}s` }}>
                  {displayQ.emoji}
                </span>
              ))}
            </div>
          )}

          {/* COMPARE */}
          {displayQ.type === 'compare' && (
            <div className="compare-visual">
              <div className="compare-group">
                <div className="compare-label">{displayQ.leftLabel || 'Left'}</div>
                <div className="emoji-group">
                  {displayQ.emoji && [...Array(displayQ.leftCount)].map((_, i) => (
                    <span key={i} className="emoji-item small">{displayQ.emoji}</span>
                  ))}
                  {!displayQ.emoji && <span className="compare-number">{displayQ.leftCount}</span>}
                </div>
              </div>
              <div className="compare-vs">VS</div>
              <div className="compare-group">
                <div className="compare-label">{displayQ.rightLabel || 'Right'}</div>
                <div className="emoji-group">
                  {displayQ.emoji && [...Array(displayQ.rightCount)].map((_, i) => (
                    <span key={i} className="emoji-item small">{displayQ.emoji}</span>
                  ))}
                  {!displayQ.emoji && <span className="compare-number">{displayQ.rightCount}</span>}
                </div>
              </div>
            </div>
          )}

          {/* NUMBER BONDS */}
          {displayQ.type === 'numberBonds' && (
            <NumberBondDiagram total={displayQ.total} left={displayQ.left} right={displayQ.right} />
          )}

          {/* ADDITION */}
          {displayQ.type === 'addition' && (
            <div className="addition-visual">
              <div className="add-group">
                {[...Array(displayQ.a)].map((_, i) => (
                  <span key={i} className="emoji-item small">{displayQ.emojiA}</span>
                ))}
              </div>
              <span className="operator">+</span>
              <div className="add-group">
                {[...Array(displayQ.b)].map((_, i) => (
                  <span key={i} className="emoji-item small">{displayQ.emojiB}</span>
                ))}
              </div>
              <span className="operator">=</span>
              <span className="answer-blank">?</span>
            </div>
          )}

          {/* SUBTRACTION */}
          {displayQ.type === 'subtraction' && (
            <div className="subtraction-visual">
              <div className="sub-group">
                {[...Array(displayQ.a)].map((_, i) => (
                  <span key={`${i}`} className={`emoji-item small ${i >= displayQ.diff ? 'fading' : ''}`}>
                    {displayQ.emoji}
                  </span>
                ))}
              </div>
              <div className="sub-expression">{displayQ.a} − {displayQ.b} = ?</div>
            </div>
          )}

          {/* MULTIPLICATION */}
          {displayQ.type === 'multiplication' && (
            <div className="multiplication-visual">
              {[...Array(displayQ.groups)].map((_, g) => (
                <div key={g} className="mult-group">
                  {[...Array(displayQ.perGroup)].map((_, i) => (
                    <span key={i} className="emoji-item small">{displayQ.emoji}</span>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* DIVISION */}
          {displayQ.type === 'division' && (
            <div className="division-visual">
              <div className="div-total">
                {[...Array(displayQ.total)].map((_, i) => (
                  <span key={i} className="emoji-item small">{displayQ.emoji}</span>
                ))}
              </div>
              <div className="div-arrow">↓ Share among {displayQ.divisor}</div>
              <div className="div-groups">
                {[...Array(displayQ.divisor)].map((_, g) => (
                  <div key={g} className="div-group-box">👤</div>
                ))}
              </div>
            </div>
          )}

          {/* CLOCK */}
          {displayQ.type === 'clock' && (
            <div className="clock-visual">
              <ClockFace hour={displayQ.hour} minute={displayQ.minute} />
            </div>
          )}

          {/* SHAPE IDENTIFY */}
          {displayQ.type === 'shapeIdentify' && (
            <div className="shapes-grid">
              {displayQ.shapes.map((shape, i) => (
                <button
                  key={i}
                  className={`shape-option ${displaySelected === shape ? (displayShowResult ? (displayIsCorrect ? 'correct' : 'wrong') : 'selected') : ''} ${displayShowResult && shape === displayQ.answer ? 'correct' : ''}`}
                  onClick={() => !displayShowResult && !isReviewing && checkAnswer(shape)}
                  disabled={isReviewing}
                >
                  <ShapeDisplay shape={shape} size={80} />
                  <span className="shape-name">{shape}</span>
                </button>
              ))}
            </div>
          )}

          {/* SHAPE PATTERN */}
          {displayQ.type === 'shapePattern' && (
            <div className="pattern-visual">
              <div className="pattern-row">
                {displayQ.pattern.map((s, i) => (
                  <div key={i} className={`pattern-item ${s === '?' ? 'blank' : ''}`}>
                    {s === '?' ? '?' : <ShapeDisplay shape={s} size={50} />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ORDERING */}
          {displayQ.type === 'ordering' && (
            <div className="ordering-visual">
              <div className="order-selected">
                {isReviewing ? (
                  (reviewData?.selected || []).map((n, i) => (
                    <span key={i} className="order-placed">{n}</span>
                  ))
                ) : (
                  <>
                    {orderSelection.map((n, i) => (
                      <span key={i} className="order-placed">{n}</span>
                    ))}
                    {[...Array(displayQ.numbers.length - orderSelection.length)].map((_, i) => (
                      <span key={`blank-${i}`} className="order-blank">_</span>
                    ))}
                  </>
                )}
              </div>
              {!isReviewing && (
                <div className="order-choices">
                  {displayQ.numbers.map((n, i) => (
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
              )}
            </div>
          )}

          {/* ORDINAL */}
          {displayQ.type === 'ordinal' && (
            <div className="ordinal-visual">
              <div className="ordinal-line">
                {displayQ.items.map((item, i) => (
                  <div key={i} className="ordinal-item">
                    <span className="ordinal-emoji">{item}</span>
                    <span className="ordinal-pos">{i + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PATTERN (number) */}
          {displayQ.type === 'pattern' && (
            <div className="number-pattern-visual">
              <div className="pattern-numbers">
                {displayQ.sequence.map((n, i) => (
                  <span key={i} className={`pattern-num ${n === '?' ? 'blank' : ''}`}>
                    {n}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* PICTURE GRAPH */}
          {displayQ.type === 'pictureGraph' && (
            <PictureGraph data={displayQ.graphData} />
          )}

          {/* WORD PROBLEM */}
          {displayQ.type === 'wordProblem' && displayQ.emoji && (
            <div className="word-problem-visual">
              <span className="wp-emoji">{displayQ.emoji}</span>
            </div>
          )}
        </div>

        {/* Answer options (for most question types) */}
        {!['shapeIdentify', 'ordering'].includes(displayQ.type) && (
          <div className="answer-options">
            {(displayQ.options || []).map((opt, i) => {
              const optIsSelected = displaySelected === opt;
              const isAnswer = opt === displayQ.answer;
              let className = 'option-button';
              if (displayShowResult) {
                if (isAnswer) className += ' correct';
                else if (optIsSelected) className += ' wrong';
              } else if (optIsSelected) {
                className += ' selected';
              }
              return (
                <button
                  key={i}
                  className={className}
                  onClick={() => !displayShowResult && !isReviewing && checkAnswer(opt)}
                  disabled={displayShowResult || isReviewing}
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
        {displayQ.type === 'ordering' && displayShowResult && (
          <div className={`order-result ${displayIsCorrect ? 'correct' : 'wrong'}`}>
            {displayIsCorrect ? '✅ Correct!' : `❌ The right order is: ${displayQ.answer.join(', ')}`}
          </div>
        )}

        {/* Hint button */}
        {!isReviewing && !showResult && !showHint && (
          <button className="hint-btn" onClick={() => setShowHint(true)}>
            💡 Need a hint?
          </button>
        )}
        {!isReviewing && showHint && !showResult && (
          <div className="hint-bubble">💡 {displayQ.hint}</div>
        )}

        {/* Result feedback */}
        {displayShowResult && (
          <div className={`result-feedback ${displayIsCorrect ? 'correct' : 'wrong'}`}>
            {displayIsCorrect ? (
              <span className="result-text">
                {isReviewing ? '✅ You answered correctly!' : ['Awesome! 🎉', 'Amazing! ✨', 'You got it! 🌟', 'Brilliant! 💫', 'Super! 🎊'][Math.floor(Math.random() * 5)]}
                {!isReviewing && <span className="gem-earn">+💎</span>}
              </span>
            ) : (
              <span className="result-text">
                {isReviewing ? 'Your answer: ' : 'Not quite! The answer is '}<strong>{String(displayQ.answer)}</strong>
                {isReviewing && displaySelected !== displayQ.answer && (
                  <><br /><small>You chose: {String(displaySelected)}</small></>
                )}
                {!isReviewing && <><br /><small>{displayQ.hint}</small></>}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
