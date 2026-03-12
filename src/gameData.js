// ===== UTILITY FUNCTIONS =====
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

function makeOptions(answer, min, max, count = 4) {
  const opts = new Set([answer]);
  let attempts = 0;
  while (opts.size < count && attempts < 50) {
    opts.add(rand(min, max));
    attempts++;
  }
  return shuffle([...opts]);
}

// ===== EMOJI SETS =====
const FRUIT = [
  { emoji: '🍎', name: 'apples' }, { emoji: '🍌', name: 'bananas' },
  { emoji: '🍊', name: 'oranges' }, { emoji: '🍇', name: 'grapes' },
  { emoji: '🍓', name: 'strawberries' }, { emoji: '🍒', name: 'cherries' },
  { emoji: '🍑', name: 'peaches' }, { emoji: '🥝', name: 'kiwis' },
];
const ANIMALS = [
  { emoji: '🐱', name: 'cats' }, { emoji: '🐶', name: 'dogs' },
  { emoji: '🐰', name: 'bunnies' }, { emoji: '🐦', name: 'birds' },
  { emoji: '🦋', name: 'butterflies' }, { emoji: '🐸', name: 'frogs' },
  { emoji: '🐢', name: 'turtles' }, { emoji: '🐠', name: 'fish' },
];
const OBJECTS = [
  { emoji: '⭐', name: 'stars' }, { emoji: '🌸', name: 'flowers' },
  { emoji: '💎', name: 'gems' }, { emoji: '🎈', name: 'balloons' },
  { emoji: '🌈', name: 'rainbows' }, { emoji: '🎀', name: 'ribbons' },
  { emoji: '🧁', name: 'cupcakes' }, { emoji: '🍭', name: 'lollipops' },
];
const ALL_ITEMS = [...FRUIT, ...ANIMALS, ...OBJECTS];
const SHAPES_2D = ['circle', 'triangle', 'square', 'rectangle'];
const SHAPE_EMOJI = { circle: '⬤', triangle: '▲', square: '■', rectangle: '▬' };
const NUMBER_WORDS = ['zero','one','two','three','four','five','six','seven','eight','nine','ten',
  'eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'];
const ORDINAL_WORDS = ['first','second','third','fourth','fifth','sixth','seventh','eighth','ninth','tenth'];
const COINS_SG = [
  { value: 1, label: '1¢', emoji: '🪙' },
  { value: 5, label: '5¢', emoji: '🪙' },
  { value: 10, label: '10¢', emoji: '🪙' },
  { value: 20, label: '20¢', emoji: '🪙' },
  { value: 50, label: '50¢', emoji: '🪙' },
  { value: 100, label: '$1', emoji: '💰' },
];

// ===== QUESTION GENERATORS =====

function genCounting(min, max) {
  return () => {
    const questions = [];
    const used = new Set();
    for (let i = 0; i < 12; i++) {
      let count, item, key;
      let attempts = 0;
      do {
        count = rand(min, max);
        item = pick(ALL_ITEMS);
        key = `${item.emoji}-${count}`;
        attempts++;
      } while (used.has(key) && attempts < 30);
      used.add(key);
      questions.push({
        type: 'countObjects',
        prompt: `How many ${item.name} are there?`,
        emoji: item.emoji,
        count,
        answer: count,
        options: makeOptions(count, Math.max(1, min - 1), max + 1),
        hint: 'Count each one carefully! Touch them as you count.',
      });
    }
    return questions;
  };
}

function genNumberRecognition(min, max) {
  return () => {
    const questions = [];
    const used = new Set();
    for (let i = 0; i < 12; i++) {
      let num, key;
      let attempts = 0;
      do {
        num = rand(min, max);
        key = `${i % 2}-${num}`;
        attempts++;
      } while (used.has(key) && attempts < 30);
      used.add(key);
      if (i % 2 === 0) {
        questions.push({
          type: 'multipleChoice',
          prompt: `Which is the number word for ${num}?`,
          answer: NUMBER_WORDS[num],
          options: shuffle([NUMBER_WORDS[num], ...shuffle(NUMBER_WORDS.filter(w => w !== NUMBER_WORDS[num])).slice(0, 3)]),
          hint: `Sound it out: ${num}`,
        });
      } else {
        const word = NUMBER_WORDS[num];
        questions.push({
          type: 'multipleChoice',
          prompt: `What number is "${word}"?`,
          answer: num,
          options: makeOptions(num, min, max),
          hint: `Think about counting: one, two, three...`,
        });
      }
    }
    return questions;
  };
}

function genComparing(min, max) {
  return () => {
    const questions = [];
    const used = new Set();
    for (let i = 0; i < 12; i++) {
      let a, b, item, key;
      let attempts = 0;
      do {
        a = rand(min, max);
        b = rand(min, max);
        if (i < 4) b = a + rand(1, 3);
        else if (i < 8) b = Math.max(min, a - rand(1, 3));
        item = pick(ALL_ITEMS);
        key = `${a}-${Math.min(b, max)}`;
        attempts++;
      } while (used.has(key) && attempts < 30);
      used.add(key);
      questions.push({
        type: 'compare',
        prompt: `Does the left group have more, less, or the same number of ${item.name}?`,
        emoji: item.emoji,
        leftCount: a,
        rightCount: Math.min(b, max),
        answer: a > Math.min(b, max) ? 'more' : a < Math.min(b, max) ? 'less' : 'same',
        options: ['more', 'less', 'same'],
        hint: 'Count each group, then compare the numbers!',
      });
    }
    return questions;
  };
}

function genOrdering(min, max, count = 4) {
  return () => {
    const questions = [];
    const used = new Set();
    for (let i = 0; i < 12; i++) {
      let nums, key;
      let attempts = 0;
      do {
        nums = [];
        while (nums.length < count) {
          const n = rand(min, max);
          if (!nums.includes(n)) nums.push(n);
        }
        key = [...nums].sort((a, b) => a - b).join(',');
        attempts++;
      } while (used.has(key) && attempts < 30);
      used.add(key);
      const ascending = i % 2 === 0;
      questions.push({
        type: 'ordering',
        prompt: ascending ? 'Put these numbers in order from smallest to biggest!' : 'Put these numbers in order from biggest to smallest!',
        numbers: shuffle([...nums]),
        answer: ascending ? [...nums].sort((a, b) => a - b) : [...nums].sort((a, b) => b - a),
        hint: ascending ? 'Find the smallest number first!' : 'Find the biggest number first!',
      });
    }
    return questions;
  };
}

function genNumberPatterns(min, max) {
  return () => {
    const questions = [];
    const used = new Set();
    for (let i = 0; i < 12; i++) {
      let step, start, key;
      let attempts = 0;
      do {
        step = pick([1, 2, 3, 5]);
        start = rand(min, min + 5);
        key = `${start}-${step}`;
        attempts++;
      } while (used.has(key) && attempts < 30);
      used.add(key);
      const seq = [];
      for (let j = 0; j < 5; j++) seq.push(start + j * step);
      if (seq[seq.length - 1] > max) { seq.length = 0; for (let j = 0; j < 5; j++) seq.push(min + j); }
      const blankIdx = rand(2, 4);
      const answer = seq[blankIdx];
      questions.push({
        type: 'pattern',
        prompt: 'What number comes next in the pattern?',
        sequence: seq.map((n, idx) => idx === blankIdx ? '?' : n),
        answer,
        options: makeOptions(answer, Math.max(0, answer - 5), answer + 5),
        hint: `Look at how the numbers change. Are they going up by ${step}?`,
      });
    }
    return questions;
  };
}

function genOrdinals() {
  return () => {
    const questions = [];
    const items = shuffle([...ALL_ITEMS]).slice(0, 10);
    const usedPositions = new Set();
    for (let i = 0; i < 12; i++) {
      let pos = rand(0, 9);
      if (usedPositions.size < 10) {
        while (usedPositions.has(pos)) pos = rand(0, 9);
      }
      usedPositions.add(pos);
      const lineItems = shuffle([...items]).slice(0, Math.max(pos + 1, 5));
      const emojiList = lineItems.map(it => it.emoji);
      const answerEmoji = emojiList[pos];
      const distractors = shuffle(emojiList.filter((e, idx) => idx !== pos)).slice(0, 3);
      const options = shuffle([answerEmoji, ...distractors]);
      questions.push({
        type: 'ordinal',
        prompt: `Which item is in the ${ORDINAL_WORDS[pos]} position?`,
        items: emojiList,
        answer: answerEmoji,
        options,
        hint: `Start counting from the left: first, second, third...`,
      });
    }
    return questions;
  };
}

function genNumberBonds(total) {
  return () => {
    const questions = [];
    const used = new Set();
    for (let i = 0; i < 12; i++) {
      let t, part1, part2, missingPart, key;
      let attempts = 0;
      do {
        t = typeof total === 'number' ? total : rand(total[0], total[1]);
        part1 = rand(0, t);
        part2 = t - part1;
        missingPart = i % 2 === 0 ? 'right' : 'left';
        key = `${t}-${part1}-${missingPart}`;
        attempts++;
      } while (used.has(key) && attempts < 30);
      used.add(key);
      questions.push({
        type: 'numberBonds',
        prompt: `Complete the number bond!`,
        total: t,
        left: missingPart === 'left' ? null : part1,
        right: missingPart === 'right' ? null : part2,
        answer: missingPart === 'left' ? part1 : part2,
        options: makeOptions(missingPart === 'left' ? part1 : part2, 0, t),
        hint: `The two parts must add up to ${t}!`,
      });
    }
    return questions;
  };
}

function genAddition(min, max) {
  return () => {
    const questions = [];
    const used = new Set();
    for (let i = 0; i < 12; i++) {
      let a, b, sum, key;
      let attempts = 0;
      do {
        a = rand(min, Math.floor(max / 2));
        b = rand(min, max - a);
        sum = a + b;
        key = `${a}+${b}`;
        attempts++;
      } while (used.has(key) && attempts < 30);
      used.add(key);
      const item = pick(ALL_ITEMS);
      questions.push({
        type: 'addition',
        prompt: `${a} + ${b} = ?`,
        a, b, sum,
        emojiA: item.emoji,
        emojiB: item.emoji,
        answer: sum,
        options: makeOptions(sum, Math.max(0, sum - 3), sum + 3),
        hint: `Start with ${a}, then count up ${b} more!`,
      });
    }
    return questions;
  };
}

function genAdditionStories(max) {
  return () => {
    const questions = [];
    const used = new Set();
    const stories = [
      (a, b, item) => `You have ${a} ${item.name} and find ${b} more. How many ${item.name} do you have now?`,
      (a, b, item) => `There are ${a} ${item.name} on the table. ${b} more ${item.name} are added. How many ${item.name} are there?`,
      (a, b, item) => `${a} ${item.name} are in a basket. Your friend gives you ${b} more. How many ${item.name} in total?`,
      (a, b, item) => `You see ${a} ${item.name} in the garden. Then ${b} more appear! How many ${item.name} altogether?`,
    ];
    for (let i = 0; i < 12; i++) {
      let a, b, sum, item, key;
      let attempts = 0;
      do {
        a = rand(1, Math.floor(max / 2));
        b = rand(1, max - a);
        sum = a + b;
        item = pick(ALL_ITEMS);
        key = `${a}+${b}-${item.emoji}`;
        attempts++;
      } while (used.has(key) && attempts < 30);
      used.add(key);
      questions.push({
        type: 'wordProblem',
        prompt: pick(stories)(a, b, item),
        emoji: item.emoji,
        answer: sum,
        options: makeOptions(sum, Math.max(1, sum - 3), sum + 3),
        hint: `This is an addition story! Add the two numbers together.`,
      });
    }
    return questions;
  };
}

function genSubtraction(min, max) {
  return () => {
    const questions = [];
    const used = new Set();
    for (let i = 0; i < 12; i++) {
      let a, b, diff, key;
      let attempts = 0;
      do {
        a = rand(Math.ceil(max / 3), max);
        b = rand(min, a);
        diff = a - b;
        key = `${a}-${b}`;
        attempts++;
      } while (used.has(key) && attempts < 30);
      used.add(key);
      const item = pick(ALL_ITEMS);
      questions.push({
        type: 'subtraction',
        prompt: `${a} − ${b} = ?`,
        a, b, diff,
        emoji: item.emoji,
        answer: diff,
        options: makeOptions(diff, Math.max(0, diff - 3), diff + 3),
        hint: `Start with ${a}, then take away ${b}!`,
      });
    }
    return questions;
  };
}

function genSubtractionStories(max) {
  return () => {
    const questions = [];
    const used = new Set();
    const stories = [
      (a, b, item) => `You have ${a} ${item.name}. You give away ${b}. How many ${item.name} are left?`,
      (a, b, item) => `There are ${a} ${item.name} on the plate. You eat ${b}. How many are left?`,
      (a, b, item) => `${a} ${item.name} are playing. ${b} go home. How many ${item.name} are still playing?`,
      (a, b, item) => `You count ${a} ${item.name}. ${b} fly away! How many ${item.name} remain?`,
    ];
    for (let i = 0; i < 12; i++) {
      let a, b, diff, item, key;
      let attempts = 0;
      do {
        a = rand(Math.ceil(max / 3), max);
        b = rand(1, a);
        diff = a - b;
        item = pick(ALL_ITEMS);
        key = `${a}-${b}-${item.emoji}`;
        attempts++;
      } while (used.has(key) && attempts < 30);
      used.add(key);
      questions.push({
        type: 'wordProblem',
        prompt: pick(stories)(a, b, item),
        emoji: item.emoji,
        answer: diff,
        options: makeOptions(diff, Math.max(0, diff - 3), diff + 3),
        hint: `This is a subtraction story! Take the smaller number away from the bigger one.`,
      });
    }
    return questions;
  };
}

function genFactFamilies(max) {
  return () => {
    const questions = [];
    const used = new Set();
    for (let i = 0; i < 12; i++) {
      let a, b, total, key;
      let attempts = 0;
      do {
        a = rand(1, Math.floor(max / 2));
        b = rand(1, max - a);
        total = a + b;
        key = `${Math.min(a,b)}-${Math.max(a,b)}`;
        attempts++;
      } while (used.has(key) && attempts < 30);
      used.add(key);
      const facts = shuffle([
        { prompt: `${a} + ${b} = ?`, answer: total },
        { prompt: `${b} + ${a} = ?`, answer: total },
        { prompt: `${total} − ${a} = ?`, answer: b },
        { prompt: `${total} − ${b} = ?`, answer: a },
      ]);
      const fact = facts[0];
      questions.push({
        type: 'multipleChoice',
        prompt: fact.prompt,
        answer: fact.answer,
        options: makeOptions(fact.answer, 0, max),
        hint: `Think about the fact family: ${a}, ${b}, and ${total} are related!`,
      });
    }
    return questions;
  };
}

function genShapes2D(shapes) {
  const SIDES = { circle: 0, triangle: 3, square: 4, rectangle: 4 };
  const CORNERS = { circle: 0, triangle: 3, square: 4, rectangle: 4 };
  // Extended pool of shape names for varied wrong-answer options
  const ALL_SHAPE_NAMES = ['circle', 'triangle', 'square', 'rectangle', 'pentagon', 'hexagon', 'oval', 'diamond'];
  const REAL_WORLD = {
    circle: [
      { obj: 'pizza', emoji: '🍕' }, { obj: 'clock', emoji: '🕐' },
      { obj: 'coin', emoji: '🪙' }, { obj: 'wheel', emoji: '🎡' },
      { obj: 'ball', emoji: '⚽' }, { obj: 'plate', emoji: '🍽️' },
    ],
    triangle: [
      { obj: 'slice of pizza', emoji: '🍕' }, { obj: 'roof of a house', emoji: '🏠' },
      { obj: 'slice of watermelon', emoji: '🍉' }, { obj: 'yield sign', emoji: '⚠️' },
      { obj: 'party hat', emoji: '🎉' }, { obj: 'mountain peak', emoji: '⛰️' },
    ],
    square: [
      { obj: 'cracker', emoji: '🧇' },
      { obj: 'dice face', emoji: '🎲' }, { obj: 'sticky note', emoji: '📝' },
      { obj: 'floor tile', emoji: '🟦' }, { obj: 'chess board square', emoji: '♟️' },
    ],
    rectangle: [
      { obj: 'door', emoji: '🚪' }, { obj: 'book', emoji: '📕' },
      { obj: 'phone screen', emoji: '📱' }, { obj: 'envelope', emoji: '✉️' },
      { obj: 'flag', emoji: '🏳️' }, { obj: 'chocolate bar', emoji: '🍫' },
    ],
  };
  const SHAPE_FACTS = {
    circle: ['has no straight sides', 'is perfectly round', 'has no corners', 'can roll'],
    triangle: ['has exactly 3 sides', 'has exactly 3 corners', 'is the shape with the fewest sides', 'has pointy corners'],
    square: ['has 4 equal sides', 'has 4 corners', 'has 4 sides', 'has all sides the same length', 'has opposite sides that are equal'],
    rectangle: ['has 4 sides', 'has 4 corners', 'has 2 long sides and 2 short sides', 'has opposite sides that are equal'],
  };

  // Build varied options for shape-name questions: answer + other level shapes + random extras
  function shapeOptions(answer, count = 4) {
    const opts = new Set([answer]);
    for (const s of shuffle(shapes)) {
      if (opts.size >= count) break;
      opts.add(s);
    }
    const extras = shuffle(ALL_SHAPE_NAMES.filter(s => !opts.has(s)));
    for (const s of extras) {
      if (opts.size >= count) break;
      opts.add(s);
    }
    return shuffle([...opts]);
  }

  return () => {
    const questions = [];
    const used = new Set();
    const questionMakers = [];

    // Type 1: Shape identification (visual)
    for (const s of shapes) {
      questionMakers.push(() => {
        const others = shuffle(SHAPES_2D.filter(x => x !== s)).slice(0, 3);
        return {
          type: 'shapeIdentify',
          prompt: `Which shape is a ${s}?`,
          targetShape: s,
          shapes: shuffle([s, ...others]),
          answer: s,
          hint: s === 'circle' ? 'A circle is round with no corners!'
            : s === 'triangle' ? 'A triangle has 3 sides and 3 corners!'
            : s === 'square' ? 'A square has 4 equal sides!'
            : 'A rectangle has 2 long sides and 2 short sides!',
        };
      });
    }

    // Type 2: Count sides
    for (const s of shapes) {
      questionMakers.push(() => ({
        type: 'multipleChoice',
        prompt: `How many sides does a ${s} have?`,
        answer: SIDES[s],
        options: shuffle([0, 3, 4, 5]),
        hint: 'Count the straight edges of the shape!',
      }));
    }

    // Type 3: Count corners
    for (const s of shapes) {
      questionMakers.push(() => ({
        type: 'multipleChoice',
        prompt: `How many corners does a ${s} have?`,
        answer: CORNERS[s],
        options: shuffle([0, 3, 4, 5]),
        hint: 'Corners are the pointy parts where sides meet!',
      }));
    }

    // Type 4: Real-world identification (options vary so square/rectangle aren't permanently "always wrong")
    for (const s of shapes) {
      const items = REAL_WORLD[s] || [];
      for (const item of items) {
        questionMakers.push(() => ({
          type: 'multipleChoice',
          prompt: `${item.emoji} What shape does a ${item.obj} look like?`,
          answer: s,
          options: shapeOptions(s),
          hint: `Think about the outline of a ${item.obj}!`,
        }));
      }
    }

    // Type 5: True/false about shape properties
    for (const s of shapes) {
      const facts = SHAPE_FACTS[s] || [];
      for (const fact of facts) {
        questionMakers.push(() => ({
          type: 'multipleChoice',
          prompt: `True or false: A ${s} ${fact}.`,
          answer: 'True',
          options: shuffle(['True', 'False']),
          hint: `Think carefully about what a ${s} looks like!`,
        }));
      }
      // Generate false statements by picking facts from other shapes that do NOT also apply to s
      const ownFacts = new Set(SHAPE_FACTS[s] || []);
      const allOtherShapes = SHAPES_2D.filter(x => x !== s);
      for (const otherShape of allOtherShapes) {
        const otherFacts = (SHAPE_FACTS[otherShape] || []).filter(f => !ownFacts.has(f));
        for (const falseFact of otherFacts) {
          questionMakers.push(() => ({
            type: 'multipleChoice',
            prompt: `True or false: A ${s} ${falseFact}.`,
            answer: 'False',
            options: shuffle(['True', 'False']),
            hint: `That sounds more like a ${otherShape}!`,
          }));
        }
      }
    }

    // Type 6: Compare shapes
    if (shapes.length >= 2) {
      for (let a = 0; a < shapes.length; a++) {
        for (let b = a + 1; b < shapes.length; b++) {
          const s1 = shapes[a], s2 = shapes[b];
          questionMakers.push(() => {
            const more = SIDES[s1] > SIDES[s2] ? s1 : SIDES[s2] > SIDES[s1] ? s2 : 'same';
            if (more === 'same') {
              return {
                type: 'multipleChoice',
                prompt: `Which has more corners: a ${s1} or a ${s2}?`,
                answer: 'They are the same!',
                options: shuffle([s1, s2, 'They are the same!']),
                hint: `Count the corners on each shape!`,
              };
            }
            return {
              type: 'multipleChoice',
              prompt: `Which has more sides: a ${s1} or a ${s2}?`,
              answer: more,
              options: shuffle([s1, s2, 'They are the same!']),
              hint: `Count the sides on each shape!`,
            };
          });
          questionMakers.push(() => {
            const fewer = SIDES[s1] < SIDES[s2] ? s1 : SIDES[s2] < SIDES[s1] ? s2 : 'same';
            if (fewer === 'same') {
              return {
                type: 'multipleChoice',
                prompt: `Which has fewer corners: a ${s1} or a ${s2}?`,
                answer: 'They are the same!',
                options: shuffle([s1, s2, 'They are the same!']),
                hint: `Count the corners on each shape!`,
              };
            }
            return {
              type: 'multipleChoice',
              prompt: `Which has fewer sides: a ${s1} or a ${s2}?`,
              answer: fewer,
              options: shuffle([s1, s2, 'They are the same!']),
              hint: `Count the sides on each shape!`,
            };
          });
        }
      }
    }

    // Type 7: Describe shape
    for (const s of shapes) {
      questionMakers.push(() => {
        const desc = s === 'circle' ? 'round with no corners'
          : s === 'triangle' ? 'has 3 sides and 3 corners'
          : s === 'square' ? 'has 4 equal sides and 4 corners'
          : 'has 2 long sides and 2 short sides';
        return {
          type: 'multipleChoice',
          prompt: `Which shape is ${desc}?`,
          answer: s,
          options: shapeOptions(s),
          hint: `Think about the properties of each shape!`,
        };
      });
    }

    // Shuffle and pick 12 unique questions
    const shuffledMakers = shuffle(questionMakers);
    for (let i = 0; i < 12; i++) {
      const maker = shuffledMakers[i % shuffledMakers.length];
      let q;
      let attempts = 0;
      do {
        q = maker();
        attempts++;
      } while (used.has(q.prompt) && attempts < 30);
      used.add(q.prompt);
      questions.push(q);
    }
    return shuffle(questions);
  };
}

function genShapePatterns() {
  return () => {
    const questions = [];
    const used = new Set();
    for (let i = 0; i < 12; i++) {
      let patternShapes, key;
      let attempts = 0;
      do {
        patternShapes = shuffle(SHAPES_2D).slice(0, rand(2, 3));
        key = patternShapes.join(',');
        attempts++;
      } while (used.has(key) && attempts < 30);
      used.add(key);
      const pattern = [];
      for (let j = 0; j < 6; j++) pattern.push(patternShapes[j % patternShapes.length]);
      const answer = pattern[pattern.length - 1];
      const display = [...pattern.slice(0, -1), '?'];
      questions.push({
        type: 'shapePattern',
        prompt: 'What shape comes next in the pattern?',
        pattern: display,
        fullPattern: pattern,
        answer,
        options: shuffle(SHAPES_2D),
        hint: 'Look for the repeating pattern!',
      });
    }
    return questions;
  };
}

function genShapes3D() {
  return () => {
    const shapes3D = [
      { name: 'cube', desc: '6 flat faces, all squares', emoji: '📦' },
      { name: 'sphere', desc: 'perfectly round like a ball', emoji: '⚽' },
      { name: 'cylinder', desc: '2 flat circles and 1 curved surface', emoji: '🥫' },
      { name: 'cone', desc: '1 flat circle and 1 pointy top', emoji: '🍦' },
    ];
    const questions = [];
    for (const shape of shapes3D) {
      const others = shuffle(shapes3D.filter(s => s.name !== shape.name)).slice(0, 3);
      questions.push({
        type: 'multipleChoice',
        prompt: `Which 3D shape is ${shape.desc}?`,
        answer: shape.name,
        options: shuffle([shape, ...others].map(s => s.name)),
        hint: `Think about what ${shape.emoji} looks like!`,
      });
      questions.push({
        type: 'multipleChoice',
        prompt: `What 3D shape does ${shape.emoji} look like?`,
        answer: shape.name,
        options: shuffle([shape, ...others].map(s => s.name)),
        hint: shape.desc,
      });
    }
    return shuffle(questions);
  };
}

function genPlaceValue(max) {
  return () => {
    const questions = [];
    const used = new Set();
    for (let i = 0; i < 12; i++) {
      let num, key;
      let attempts = 0;
      do {
        num = rand(11, max);
        key = `${i % 3}-${num}`;
        attempts++;
      } while (used.has(key) && attempts < 30);
      used.add(key);
      const tens = Math.floor(num / 10);
      const ones = num % 10;
      if (i % 3 === 0) {
        questions.push({
          type: 'multipleChoice',
          prompt: `What is the tens digit of ${num}?`,
          answer: tens,
          options: makeOptions(tens, 0, 9),
          hint: `The tens digit tells us how many groups of 10!`,
        });
      } else if (i % 3 === 1) {
        questions.push({
          type: 'multipleChoice',
          prompt: `What is the ones digit of ${num}?`,
          answer: ones,
          options: makeOptions(ones, 0, 9),
          hint: `The ones digit is the last digit!`,
        });
      } else {
        questions.push({
          type: 'multipleChoice',
          prompt: `${tens} tens and ${ones} ones = ?`,
          answer: num,
          options: makeOptions(num, Math.max(10, num - 10), Math.min(max, num + 10)),
          hint: `${tens} tens = ${tens * 10}, plus ${ones} ones!`,
        });
      }
    }
    return questions;
  };
}

function genLength(compare) {
  return () => {
    const questions = [];
    const items = [
      { name: 'pencil', emoji: '✏️' }, { name: 'ruler', emoji: '📏' },
      { name: 'ribbon', emoji: '🎀' }, { name: 'snake', emoji: '🐍' },
      { name: 'worm', emoji: '🪱' }, { name: 'rope', emoji: '🪢' },
    ];
    const used = new Set();
    for (let i = 0; i < 12; i++) {
      if (compare) {
        let a, b, aLen, bLen, key;
        let attempts = 0;
        do {
          a = pick(items);
          b = pick(items);
          while (b.name === a.name) b = pick(items);
          aLen = rand(2, 10);
          bLen = rand(2, 10);
          key = `${a.name}-${b.name}-${aLen}-${bLen}`;
          attempts++;
        } while (used.has(key) && attempts < 30);
        used.add(key);
        questions.push({
          type: 'compare',
          prompt: `The ${a.name} ${a.emoji} is ${aLen} units long. The ${b.name} ${b.emoji} is ${bLen} units long. Which is longer?`,
          emoji: '',
          leftCount: aLen,
          rightCount: bLen,
          leftLabel: a.name,
          rightLabel: b.name,
          answer: aLen > bLen ? 'more' : aLen < bLen ? 'less' : 'same',
          options: ['more', 'less', 'same'],
          optionLabels: [a.name, b.name, 'Same length'],
          hint: 'Compare the numbers! The bigger number means longer.',
        });
      } else {
        let item, length, key;
        let attempts = 0;
        do {
          item = pick(items);
          length = rand(2, 12);
          key = `${item.name}-${length}`;
          attempts++;
        } while (used.has(key) && attempts < 30);
        used.add(key);
        questions.push({
          type: 'multipleChoice',
          prompt: `The ${item.name} ${item.emoji} is ${length} paper clips long. How many paper clips?`,
          answer: length,
          options: makeOptions(length, 1, 15),
          hint: 'Count the paper clips from one end to the other!',
        });
      }
    }
    return questions;
  };
}

function genMass(compare) {
  return () => {
    const questions = [];
    const used = new Set();
    const items = [
      { name: 'apple', emoji: '🍎' }, { name: 'watermelon', emoji: '🍉' },
      { name: 'feather', emoji: '🪶' }, { name: 'book', emoji: '📚' },
      { name: 'teddy bear', emoji: '🧸' }, { name: 'brick', emoji: '🧱' },
    ];
    for (let i = 0; i < 12; i++) {
      let a, b, key;
      let attempts = 0;
      do {
        a = pick(items);
        b = pick(items);
        while (b.name === a.name) b = pick(items);
        key = `${a.name}-${b.name}`;
        attempts++;
      } while (used.has(key) && attempts < 30);
      used.add(key);
      if (compare) {
        questions.push({
          type: 'multipleChoice',
          prompt: `Which is heavier: ${a.emoji} ${a.name} or ${b.emoji} ${b.name}?`,
          answer: a.name,
          options: shuffle([a.name, b.name, 'Same weight']),
          hint: 'Think about holding them. Which one would feel heavier?',
        });
      } else {
        const mass = rand(1, 10);
        questions.push({
          type: 'multipleChoice',
          prompt: `The ${a.name} ${a.emoji} weighs ${mass} blocks on the balance. How many blocks?`,
          answer: mass,
          options: makeOptions(mass, 1, 12),
          hint: 'Count the blocks on the other side of the balance!',
        });
      }
    }
    return questions;
  };
}

function genCapacity() {
  return () => {
    const questions = [];
    const containers = [
      { name: 'cup', emoji: '🥤', size: 'small' },
      { name: 'bottle', emoji: '🍼', size: 'medium' },
      { name: 'bucket', emoji: '🪣', size: 'large' },
      { name: 'glass', emoji: '🥛', size: 'small' },
      { name: 'jug', emoji: '🫗', size: 'medium' },
      { name: 'pool', emoji: '🏊', size: 'large' },
    ];
    const used = new Set();
    for (let i = 0; i < 12; i++) {
      let a, b, key;
      let attempts = 0;
      do {
        a = pick(containers);
        b = pick(containers);
        while (b.name === a.name) b = pick(containers);
        key = `${a.name}-${b.name}`;
        attempts++;
      } while (used.has(key) && attempts < 30);
      used.add(key);
      const sizeOrder = { small: 1, medium: 2, large: 3 };
      questions.push({
        type: 'multipleChoice',
        prompt: `Which holds more water: ${a.emoji} ${a.name} or ${b.emoji} ${b.name}?`,
        answer: sizeOrder[a.size] >= sizeOrder[b.size] ? a.name : b.name,
        options: shuffle([a.name, b.name]),
        hint: 'Think about the size of each container!',
      });
    }
    return questions;
  };
}

function genTime(type) {
  return () => {
    const questions = [];
    const used = new Set();
    if (type === 'days') {
      const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
      const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
      for (let i = 0; i < 12; i++) {
        let key;
        if (i % 3 === 0) {
          let dayIdx;
          let attempts = 0;
          do {
            dayIdx = rand(0, 5);
            key = `dayAfter-${dayIdx}`;
            attempts++;
          } while (used.has(key) && attempts < 30);
          used.add(key);
          questions.push({
            type: 'multipleChoice',
            prompt: `What day comes after ${days[dayIdx]}?`,
            answer: days[dayIdx + 1],
            options: shuffle(days.slice(0, 4).includes(days[dayIdx + 1]) ? days.slice(0, 4) : [days[dayIdx + 1], ...shuffle(days.filter(d => d !== days[dayIdx + 1])).slice(0, 3)]),
            hint: 'Think about the order of the days of the week!',
          });
        } else if (i % 3 === 1) {
          let dayIdx;
          let attempts = 0;
          do {
            dayIdx = rand(0, 6);
            key = `dayNum-${dayIdx}`;
            attempts++;
          } while (used.has(key) && attempts < 30);
          used.add(key);
          questions.push({
            type: 'multipleChoice',
            prompt: `Which day of the week is number ${dayIdx + 1}?`,
            answer: days[dayIdx],
            options: shuffle([days[dayIdx], ...shuffle(days.filter(d => d !== days[dayIdx])).slice(0, 3)]),
            hint: 'Monday is the first day of the school week!',
          });
        } else {
          let monthIdx;
          let attempts = 0;
          do {
            monthIdx = rand(0, 10);
            key = `monthAfter-${monthIdx}`;
            attempts++;
          } while (used.has(key) && attempts < 30);
          used.add(key);
          questions.push({
            type: 'multipleChoice',
            prompt: `What month comes after ${months[monthIdx]}?`,
            answer: months[monthIdx + 1],
            options: shuffle([months[monthIdx + 1], ...shuffle(months.filter(m => m !== months[monthIdx + 1])).slice(0, 3)]),
            hint: 'Think about the calendar!',
          });
        }
      }
    } else if (type === 'oclock') {
      for (let i = 0; i < 12; i++) {
        let hour;
        let attempts = 0;
        do {
          hour = rand(1, 12);
          attempts++;
        } while (used.has(hour) && attempts < 30);
        used.add(hour);
        questions.push({
          type: 'clock',
          prompt: `What time is shown on the clock?`,
          hour,
          minute: 0,
          answer: `${hour} o'clock`,
          options: shuffle([`${hour} o'clock`, `${(hour % 12) + 1} o'clock`, `${hour === 1 ? 12 : hour - 1} o'clock`, `half past ${hour}`]),
          hint: 'Look where the short hand (hour hand) is pointing! The long hand is at 12.',
        });
      }
    } else {
      for (let i = 0; i < 12; i++) {
        let hour;
        const isHalf = i % 2 === 0;
        let attempts = 0;
        do {
          hour = rand(1, 12);
          attempts++;
        } while (used.has(`${hour}-${isHalf}`) && attempts < 30);
        used.add(`${hour}-${isHalf}`);
        questions.push({
          type: 'clock',
          prompt: `What time is shown on the clock?`,
          hour,
          minute: isHalf ? 30 : 0,
          answer: isHalf ? `half past ${hour}` : `${hour} o'clock`,
          options: shuffle([
            `${hour} o'clock`,
            `half past ${hour}`,
            `${(hour % 12) + 1} o'clock`,
            `half past ${(hour % 12) + 1}`,
          ]),
          hint: isHalf ? 'When the long hand points to 6, it\'s "half past"!' : 'When the long hand points to 12, it\'s "o\'clock"!',
        });
      }
    }
    return questions;
  };
}

function genMoney(type) {
  return () => {
    const questions = [];
    const used = new Set();
    for (let i = 0; i < 12; i++) {
      if (type === 'recognize') {
        let coin, key;
        let attempts = 0;
        do {
          coin = pick(COINS_SG);
          key = `coin-${coin.label}`;
          attempts++;
        } while (used.has(key) && attempts < 30);
        used.add(key);
        questions.push({
          type: 'multipleChoice',
          prompt: `This coin shows "${coin.label}". How much is it worth?`,
          answer: coin.label,
          options: shuffle(COINS_SG.slice(0, 4).map(c => c.label).includes(coin.label)
            ? COINS_SG.slice(0, 4).map(c => c.label)
            : [coin.label, ...shuffle(COINS_SG.filter(c => c.label !== coin.label)).slice(0, 3).map(c => c.label)]),
          hint: 'Read the number on the coin!',
        });
      } else if (type === 'count') {
        let numCoins, selectedCoins, total, key;
        let attempts = 0;
        do {
          numCoins = rand(2, 4);
          selectedCoins = Array.from({ length: numCoins }, () => pick(COINS_SG.slice(0, 4)));
          total = selectedCoins.reduce((sum, c) => sum + c.value, 0);
          key = `count-${selectedCoins.map(c => c.label).sort().join(',')}`;
          attempts++;
        } while (used.has(key) && attempts < 30);
        used.add(key);
        questions.push({
          type: 'multipleChoice',
          prompt: `Count the coins: ${selectedCoins.map(c => c.label).join(' + ')} = ?`,
          answer: `${total}¢`,
          options: makeOptions(total, Math.max(1, total - 20), total + 20).map(v => `${v}¢`),
          hint: 'Add up the value of each coin!',
        });
      } else {
        let item, paid, change, key;
        let attempts = 0;
        do {
          item = pick([
            { name: 'candy', emoji: '🍬', price: rand(1, 5) * 10 },
            { name: 'cookie', emoji: '🍪', price: rand(1, 5) * 10 },
            { name: 'sticker', emoji: '⭐', price: rand(1, 3) * 10 },
            { name: 'pencil', emoji: '✏️', price: rand(2, 5) * 10 },
          ]);
          paid = item.price + rand(1, 3) * 10;
          change = paid - item.price;
          key = `change-${item.name}-${item.price}-${paid}`;
          attempts++;
        } while (used.has(key) && attempts < 30);
        used.add(key);
        questions.push({
          type: 'multipleChoice',
          prompt: `The ${item.emoji} ${item.name} costs ${item.price}¢. You pay ${paid}¢. How much change?`,
          answer: `${change}¢`,
          options: makeOptions(change, 0, 50).map(v => `${v}¢`),
          hint: `Change = what you pay − the price. ${paid} − ${item.price} = ?`,
        });
      }
    }
    return questions;
  };
}

function genMultiplication(type) {
  return () => {
    const questions = [];
    const used = new Set();
    for (let i = 0; i < 12; i++) {
      let groups, perGroup, total, key;
      let attempts = 0;
      do {
        groups = rand(2, 5);
        perGroup = rand(2, 5);
        total = groups * perGroup;
        key = `${groups}x${perGroup}`;
        attempts++;
      } while (used.has(key) && attempts < 30);
      used.add(key);
      const item = pick(ALL_ITEMS);
      if (type === 'groups') {
        questions.push({
          type: 'multiplication',
          prompt: `There are ${groups} groups with ${perGroup} ${item.name} in each group. How many ${item.name} altogether?`,
          emoji: item.emoji,
          groups,
          perGroup,
          answer: total,
          options: makeOptions(total, Math.max(2, total - 5), total + 5),
          hint: `Count ${perGroup} + ${perGroup}${groups > 2 ? ` + ${perGroup}` : ''}${groups > 3 ? ' + ...' : ''}`,
        });
      } else {
        questions.push({
          type: 'multipleChoice',
          prompt: `${perGroup} + ${Array(groups - 1).fill(perGroup).join(' + ')} = ? (${groups} times ${perGroup})`,
          answer: total,
          options: makeOptions(total, Math.max(2, total - 5), total + 5),
          hint: `Adding ${perGroup} a total of ${groups} times!`,
        });
      }
    }
    return questions;
  };
}

function genDivision(type) {
  return () => {
    const questions = [];
    const used = new Set();
    for (let i = 0; i < 12; i++) {
      let divisor, quotient, total, key;
      let attempts = 0;
      do {
        divisor = rand(2, 5);
        quotient = rand(1, 5);
        total = divisor * quotient;
        key = `${total}/${divisor}`;
        attempts++;
      } while (used.has(key) && attempts < 30);
      used.add(key);
      const item = pick(ALL_ITEMS);
      if (type === 'sharing') {
        questions.push({
          type: 'division',
          prompt: `Share ${total} ${item.name} ${item.emoji} equally among ${divisor} friends. How many does each friend get?`,
          emoji: item.emoji,
          total,
          divisor,
          answer: quotient,
          options: makeOptions(quotient, 1, quotient + 4),
          hint: `Give one to each friend, then another, until all ${total} are shared!`,
        });
      } else {
        questions.push({
          type: 'multipleChoice',
          prompt: `Put ${total} ${item.name} ${item.emoji} into groups of ${divisor}. How many groups?`,
          answer: quotient,
          options: makeOptions(quotient, 1, quotient + 4),
          hint: `Keep making groups of ${divisor} until you run out!`,
        });
      }
    }
    return questions;
  };
}

function genCountByTens() {
  return () => {
    const questions = [];
    const used = new Set();
    for (let i = 0; i < 12; i++) {
      if (i % 3 === 0) {
        let start, key;
        let attempts = 0;
        do {
          start = rand(1, 5) * 10;
          key = `tens-${start}`;
          attempts++;
        } while (used.has(key) && attempts < 30);
        used.add(key);
        const seq = [start, start + 10, start + 20, start + 30];
        const blankIdx = rand(1, 3);
        questions.push({
          type: 'pattern',
          prompt: 'What number is missing? Count by tens!',
          sequence: seq.map((n, idx) => idx === blankIdx ? '?' : n),
          answer: seq[blankIdx],
          options: makeOptions(seq[blankIdx], 10, 100),
          hint: 'Each number is 10 more than the last!',
        });
      } else {
        let num, key;
        let attempts = 0;
        do {
          num = rand(1, 10) * 10;
          key = `howmany-${num}`;
          attempts++;
        } while (used.has(key) && attempts < 30);
        used.add(key);
        questions.push({
          type: 'multipleChoice',
          prompt: `How many tens are in ${num}?`,
          answer: num / 10,
          options: makeOptions(num / 10, 1, 10),
          hint: `Count by tens: 10, 20, 30...`,
        });
      }
    }
    return questions;
  };
}

function genPictureGraph(type) {
  return () => {
    const questions = [];
    const categories = shuffle([
      { name: 'Apples', emoji: '🍎' }, { name: 'Bananas', emoji: '🍌' },
      { name: 'Oranges', emoji: '🍊' }, { name: 'Grapes', emoji: '🍇' },
      { name: 'Cats', emoji: '🐱' }, { name: 'Dogs', emoji: '🐶' },
    ]).slice(0, 4);
    const data = categories.map(c => ({ ...c, count: rand(1, 8) }));
    for (let i = 0; i < 12; i++) {
      const cat = data[i % data.length];
      if (i % 4 === 0) {
        questions.push({
          type: 'pictureGraph',
          prompt: `How many ${cat.name.toLowerCase()} are shown in the graph?`,
          graphData: data,
          answer: cat.count,
          options: makeOptions(cat.count, 0, 10),
          hint: 'Count the pictures in that row!',
        });
      } else if (i % 4 === 1) {
        const maxCat = data.reduce((a, b) => a.count > b.count ? a : b);
        questions.push({
          type: 'pictureGraph',
          prompt: 'Which has the most?',
          graphData: data,
          answer: maxCat.name,
          options: shuffle(data.map(d => d.name)),
          hint: 'Look for the longest row!',
        });
      } else if (i % 4 === 2) {
        const minCat = data.reduce((a, b) => a.count < b.count ? a : b);
        questions.push({
          type: 'pictureGraph',
          prompt: 'Which has the fewest?',
          graphData: data,
          answer: minCat.name,
          options: shuffle(data.map(d => d.name)),
          hint: 'Look for the shortest row!',
        });
      } else {
        const total = data.reduce((s, d) => s + d.count, 0);
        questions.push({
          type: 'pictureGraph',
          prompt: 'How many items are there in total?',
          graphData: data,
          answer: total,
          options: makeOptions(total, Math.max(4, total - 5), total + 5),
          hint: 'Add up all the rows!',
        });
      }
    }
    return questions;
  };
}

function genGrandReview() {
  return () => {
    const questions = [];
    const generators = [
      genCounting(1, 20), genAddition(0, 20), genSubtraction(0, 20),
      genComparing(1, 50), genNumberBonds([5, 10]),
      genMultiplication('groups'), genDivision('sharing'),
    ];
    for (let i = 0; i < 12; i++) {
      const gen = generators[i % generators.length];
      const qs = gen();
      questions.push(qs[0]);
    }
    return questions;
  };
}

// ===== IQ BONUS LEVEL GENERATORS (7-9 year old difficulty) =====

function genIQNumbers() {
  return () => {
    const questions = [];
    const used = new Set();
    const makers = [
      // Tricky sequences: differences increase
      () => {
        const start = rand(1, 5);
        const seq = [start];
        for (let i = 1; i <= 4; i++) seq.push(seq[i - 1] + i);
        const answer = seq[4];
        return {
          type: 'multipleChoice',
          prompt: `What comes next? ${seq.slice(0, 4).join(', ')}, ?`,
          answer,
          options: makeOptions(answer, answer - 4, answer + 4),
          hint: 'Look at the gaps between numbers — are they getting bigger?',
        };
      },
      // Doubling sequences
      () => {
        const start = rand(1, 4);
        const seq = [start, start * 2, start * 4, start * 8];
        const answer = start * 16;
        return {
          type: 'multipleChoice',
          prompt: `What comes next? ${seq.join(', ')}, ?`,
          answer,
          options: makeOptions(answer, answer - 10, answer + 10),
          hint: 'Each number is double the one before!',
        };
      },
      // "What number am I?" riddles
      () => {
        const num = rand(12, 30);
        const tens = Math.floor(num / 10);
        const ones = num % 10;
        const isEven = num % 2 === 0;
        return {
          type: 'multipleChoice',
          prompt: `I am a number. My tens digit is ${tens}. My ones digit is ${ones}. I am ${isEven ? 'even' : 'odd'}. What number am I?`,
          answer: num,
          options: makeOptions(num, num - 5, num + 5),
          hint: `Put the tens and ones together!`,
        };
      },
      // Missing number in equation
      () => {
        const a = rand(3, 15);
        const b = rand(3, 15);
        const sum = a + b;
        const c = rand(1, sum - 1);
        const answer = sum - c;
        return {
          type: 'multipleChoice',
          prompt: `? + ${c} = ${a} + ${b}`,
          answer,
          options: makeOptions(answer, Math.max(1, answer - 5), answer + 5),
          hint: `First work out what ${a} + ${b} equals, then find the missing number!`,
        };
      },
      // Odd one out
      () => {
        const type = pick(['even', 'odd', 'mult3']);
        let nums, oddOne;
        if (type === 'even') {
          const pool = shuffle([2, 4, 6, 8, 10, 12, 14, 16, 18, 20]);
          nums = pool.slice(0, 3);
          oddOne = rand(1, 10) * 2 + 1;
          while (nums.includes(oddOne)) oddOne = rand(1, 10) * 2 + 1;
        } else if (type === 'odd') {
          const pool = shuffle([1, 3, 5, 7, 9, 11, 13, 15, 17, 19]);
          nums = pool.slice(0, 3);
          oddOne = rand(1, 10) * 2;
          while (nums.includes(oddOne)) oddOne = rand(1, 10) * 2;
        } else {
          nums = [3, 6, 9, 12, 15, 18].sort(() => Math.random() - 0.5).slice(0, 3);
          oddOne = pick([4, 5, 7, 8, 10, 11, 13, 14]);
        }
        const allNums = shuffle([...nums, oddOne]);
        return {
          type: 'multipleChoice',
          prompt: `Which number does NOT belong? ${allNums.join(', ')}`,
          answer: oddOne,
          options: allNums,
          hint: type === 'mult3' ? 'Most of these numbers are in the 3-times pattern!' : `Most of these numbers are ${type}!`,
        };
      },
      // Subtraction missing number
      () => {
        const answer = rand(5, 20);
        const b = rand(3, 12);
        const total = answer + b;
        return {
          type: 'multipleChoice',
          prompt: `${total} − ? = ${b}`,
          answer,
          options: makeOptions(answer, Math.max(1, answer - 5), answer + 5),
          hint: `What do you take away from ${total} to get ${b}?`,
        };
      },
      // Sum of consecutive numbers
      () => {
        const start = rand(1, 8);
        const answer = start + (start + 1) + (start + 2);
        return {
          type: 'multipleChoice',
          prompt: `What is ${start} + ${start + 1} + ${start + 2}?`,
          answer,
          options: makeOptions(answer, answer - 4, answer + 4),
          hint: 'Add the numbers one step at a time!',
        };
      },
      // Backward counting pattern
      () => {
        const step = rand(2, 5);
        const start = step * rand(6, 12);
        const seq = [start, start - step, start - step * 2, start - step * 3];
        const answer = start - step * 4;
        return {
          type: 'multipleChoice',
          prompt: `What comes next? ${seq.join(', ')}, ?`,
          answer,
          options: makeOptions(answer, Math.max(0, answer - 6), answer + 6),
          hint: `Each number goes down by the same amount!`,
        };
      },
    ];

    const shuffled = shuffle(makers);
    for (let i = 0; i < 12; i++) {
      let q;
      let attempts = 0;
      do {
        q = shuffled[i % shuffled.length]();
        attempts++;
      } while (used.has(q.prompt) && attempts < 30);
      used.add(q.prompt);
      questions.push(q);
    }
    return shuffle(questions);
  };
}

function genIQShapes() {
  return () => {
    const questions = [];
    const used = new Set();
    const makers = [
      // Counting sides of advanced shapes
      () => {
        const shapes = [
          { name: 'pentagon', sides: 5 }, { name: 'hexagon', sides: 6 },
          { name: 'octagon', sides: 8 }, { name: 'triangle', sides: 3 },
        ];
        const shape = pick(shapes);
        return {
          type: 'multipleChoice',
          prompt: `A ${shape.name} has how many sides?`,
          answer: shape.sides,
          options: shuffle([3, 5, 6, 8]),
          hint: `"Penta" = 5, "Hexa" = 6, "Octa" = 8!`,
        };
      },
      // Folding shapes
      () => {
        const folds = [
          { shape: 'square', fold: 'in half diagonally', result: 'triangle' },
          { shape: 'rectangle', fold: 'in half along its length', result: 'rectangle' },
          { shape: 'circle', fold: 'in half', result: 'semicircle' },
          { shape: 'square', fold: 'in half along the middle', result: 'rectangle' },
        ];
        const f = pick(folds);
        return {
          type: 'multipleChoice',
          prompt: `If you fold a ${f.shape} ${f.fold}, what shape do you get?`,
          answer: f.result,
          options: shuffle([f.result, ...shuffle(['triangle', 'rectangle', 'semicircle', 'square', 'circle'].filter(s => s !== f.result)).slice(0, 3)]),
          hint: `Imagine folding a piece of paper!`,
        };
      },
      // Shapes in a figure
      () => {
        const total = rand(3, 8);
        const type = pick(['triangles', 'squares', 'rectangles']);
        return {
          type: 'multipleChoice',
          prompt: `A picture is made of ${total} ${type} and ${rand(1, 4)} circles. How many ${type} are there?`,
          answer: total,
          options: makeOptions(total, 1, total + 4),
          hint: `Read the question carefully — it tells you!`,
        };
      },
      // Symmetry
      () => {
        const shapes = [
          { name: 'square', lines: 4 }, { name: 'rectangle', lines: 2 },
          { name: 'equilateral triangle', lines: 3 }, { name: 'circle', lines: 'infinite' },
        ];
        const shape = pick(shapes.filter(s => s.lines !== 'infinite'));
        return {
          type: 'multipleChoice',
          prompt: `How many lines of symmetry does a ${shape.name} have?`,
          answer: shape.lines,
          options: shuffle([1, 2, 3, 4]),
          hint: `A line of symmetry divides the shape into two matching halves!`,
        };
      },
      // Shape properties comparison
      () => {
        const shapes = [
          { name: 'hexagon', sides: 6 }, { name: 'pentagon', sides: 5 },
          { name: 'octagon', sides: 8 }, { name: 'triangle', sides: 3 },
        ];
        const [a, b] = shuffle(shapes).slice(0, 2);
        const answer = a.sides + b.sides;
        return {
          type: 'multipleChoice',
          prompt: `A ${a.name} and a ${b.name} together have how many sides in total?`,
          answer,
          options: makeOptions(answer, answer - 4, answer + 4),
          hint: `Add the sides of both shapes!`,
        };
      },
      // 3D shape faces
      () => {
        const shapes = [
          { name: 'cube', faces: 6 }, { name: 'triangular pyramid', faces: 4 },
          { name: 'rectangular prism', faces: 6 }, { name: 'cylinder', faces: 3 },
        ];
        const s = pick(shapes);
        return {
          type: 'multipleChoice',
          prompt: `How many faces does a ${s.name} have?`,
          answer: s.faces,
          options: shuffle([3, 4, 5, 6]),
          hint: `A face is a flat surface of a 3D shape!`,
        };
      },
      // Pattern with shapes: what comes next
      () => {
        const patterns = [
          { seq: '▲ ■ ▲ ■ ■ ▲ ■ ■ ■ ?', answer: '▲', opts: ['▲', '■', '⬤', '▬'] },
          { seq: '⬤ ▲ ⬤ ⬤ ▲ ⬤ ⬤ ⬤ ▲ ?', answer: '⬤', opts: ['▲', '■', '⬤', '▬'] },
          { seq: '■ ■ ▲ ■ ■ ▲ ■ ■ ?', answer: '▲', opts: ['▲', '■', '⬤', '▬'] },
        ];
        const p = pick(patterns);
        return {
          type: 'multipleChoice',
          prompt: `What comes next? ${p.seq}`,
          answer: p.answer,
          options: shuffle(p.opts),
          hint: `Look for the repeating group in the pattern!`,
        };
      },
      // Rotation
      () => {
        const items = [
          { q: 'If you turn a square 90 degrees, what shape do you see?', answer: 'square', hint: 'All sides of a square are equal!' },
          { q: 'If you turn a rectangle 90 degrees, what shape do you see?', answer: 'rectangle', hint: 'It might look taller or wider but it\'s still the same shape!' },
          { q: 'If you look at a cube from directly above, what shape do you see?', answer: 'square', hint: 'Imagine looking straight down at a box!' },
          { q: 'If you look at a cylinder from the side, what shape do you see?', answer: 'rectangle', hint: 'Think about what a tin can looks like from the side!' },
        ];
        const item = pick(items);
        return {
          type: 'multipleChoice',
          prompt: item.q,
          answer: item.answer,
          options: shuffle(['circle', 'square', 'rectangle', 'triangle']),
          hint: item.hint,
        };
      },
    ];

    const shuffled = shuffle(makers);
    for (let i = 0; i < 12; i++) {
      let q;
      let attempts = 0;
      do {
        q = shuffled[i % shuffled.length]();
        attempts++;
      } while (used.has(q.prompt) && attempts < 30);
      used.add(q.prompt);
      questions.push(q);
    }
    return shuffle(questions);
  };
}

function genIQLogic() {
  return () => {
    const questions = [];
    const used = new Set();
    const names = ['Amy', 'Ben', 'Cal', 'Dee', 'Eve', 'Finn', 'Gina', 'Hugo'];
    const makers = [
      // Transitive comparison
      () => {
        const [a, b, c] = shuffle(names).slice(0, 3);
        const prop = pick(['taller', 'older', 'faster']);
        return {
          type: 'multipleChoice',
          prompt: `${a} is ${prop} than ${b}. ${b} is ${prop} than ${c}. Who is the ${prop.replace('er', 'est')}?`,
          answer: a,
          options: shuffle([a, b, c]),
          hint: `If A > B and B > C, then A is the greatest!`,
        };
      },
      // Reverse transitive
      () => {
        const [a, b, c] = shuffle(names).slice(0, 3);
        const prop = pick(['shorter', 'younger', 'lighter']);
        return {
          type: 'multipleChoice',
          prompt: `${a} is ${prop} than ${b}. ${b} is ${prop} than ${c}. Who is the ${prop.replace('er', 'est')}?`,
          answer: a,
          options: shuffle([a, b, c]),
          hint: `Follow the chain: who is the most ${prop.replace('er', '')}?`,
        };
      },
      // Balance puzzles
      () => {
        const item1 = pick(['apple', 'banana', 'orange']);
        const item2 = pick(['marble', 'block', 'coin']);
        const ratio = rand(2, 4);
        const count = rand(2, 4);
        const answer = ratio * count;
        return {
          type: 'multipleChoice',
          prompt: `1 ${item1} weighs the same as ${ratio} ${item2}s. How many ${item2}s weigh the same as ${count} ${item1}s?`,
          answer,
          options: makeOptions(answer, Math.max(2, answer - 4), answer + 4),
          hint: `If 1 ${item1} = ${ratio} ${item2}s, then ${count} ${item1}s = ${count} × ${ratio} ${item2}s!`,
        };
      },
      // Time logic
      () => {
        const mins = pick([15, 20, 25, 30, 45]);
        const arriveHour = rand(7, 10);
        const leaveMin = 60 - mins;
        return {
          type: 'multipleChoice',
          prompt: `It takes ${mins} minutes to walk to school. I need to be there at ${arriveHour}:00. What time should I leave?`,
          answer: `${arriveHour - 1}:${leaveMin === 60 ? '00' : leaveMin}`,
          options: shuffle([
            `${arriveHour - 1}:${leaveMin === 60 ? '00' : leaveMin}`,
            `${arriveHour - 1}:${Math.max(0, leaveMin - 10)}`,
            `${arriveHour}:${mins}`,
            `${arriveHour - 1}:00`,
          ]),
          hint: `Count ${mins} minutes backward from ${arriveHour}:00!`,
        };
      },
      // Seating/ordering logic
      () => {
        const [a, b, c, d] = shuffle(names).slice(0, 4);
        return {
          type: 'multipleChoice',
          prompt: `${a} is sitting between ${b} and ${c}. ${d} is next to ${b} (not next to ${a}). Who is at the end, next to ${b}?`,
          answer: d,
          options: shuffle([a, b, c, d]),
          hint: `Draw it out: ${d} — ${b} — ${a} — ${c}`,
        };
      },
      // "How many?" counting logic
      () => {
        const people = rand(3, 6);
        const answer = (people * (people - 1)) / 2;
        return {
          type: 'multipleChoice',
          prompt: `There are ${people} friends. Each friend shakes hands with every other friend once. How many handshakes are there in total?`,
          answer,
          options: makeOptions(answer, Math.max(1, answer - 3), answer + 4),
          hint: `The first person shakes ${people - 1} hands, the next shakes ${people - 2} new hands, and so on!`,
        };
      },
      // Age puzzles
      () => {
        const [a, b] = shuffle(names).slice(0, 2);
        const ageA = rand(6, 10);
        const diff = rand(2, 5);
        const answer = ageA + diff;
        return {
          type: 'multipleChoice',
          prompt: `${a} is ${ageA} years old. ${b} is ${diff} years older than ${a}. How old is ${b}?`,
          answer,
          options: makeOptions(answer, answer - 3, answer + 3),
          hint: `Add ${diff} to ${a}'s age!`,
        };
      },
      // Coin puzzle
      () => {
        const coins = rand(3, 7);
        const total = coins * 10;
        return {
          type: 'multipleChoice',
          prompt: `I have ${coins} coins that are each worth 10 cents. How much money do I have in total?`,
          answer: `${total} cents`,
          options: shuffle([`${total} cents`, `${total - 10} cents`, `${total + 10} cents`, `${coins} cents`]),
          hint: `Multiply the number of coins by 10!`,
        };
      },
    ];

    const shuffled = shuffle(makers);
    for (let i = 0; i < 12; i++) {
      let q;
      let attempts = 0;
      do {
        q = shuffled[i % shuffled.length]();
        attempts++;
      } while (used.has(q.prompt) && attempts < 30);
      used.add(q.prompt);
      questions.push(q);
    }
    return shuffle(questions);
  };
}

function genIQMath() {
  return () => {
    const questions = [];
    const used = new Set();
    const makers = [
      // Multi-step word problem
      () => {
        const start = rand(15, 30);
        const give = rand(3, 8);
        const eat = rand(1, 5);
        const answer = start - give - eat;
        return {
          type: 'multipleChoice',
          prompt: `I have ${start} cookies. I give ${give} to my friend, then eat ${eat}. How many cookies do I have left?`,
          answer,
          options: makeOptions(answer, Math.max(0, answer - 4), answer + 4),
          hint: `Subtract step by step: ${start} − ${give} = ?, then subtract ${eat} more!`,
        };
      },
      // Simple multiplication/algebra
      () => {
        const a = rand(2, 6);
        const answer = rand(2, 8);
        const product = a * answer;
        return {
          type: 'multipleChoice',
          prompt: `? × ${a} = ${product}`,
          answer,
          options: makeOptions(answer, Math.max(1, answer - 3), answer + 3),
          hint: `What number times ${a} gives ${product}?`,
        };
      },
      // Sharing with remainder
      () => {
        const divisor = rand(3, 6);
        const quotient = rand(2, 5);
        const remainder = rand(1, divisor - 1);
        const total = divisor * quotient + remainder;
        return {
          type: 'multipleChoice',
          prompt: `${total} stickers are shared equally among ${divisor} children. How many stickers are left over?`,
          answer: remainder,
          options: makeOptions(remainder, 0, divisor),
          hint: `Divide ${total} by ${divisor}. The leftover is the remainder!`,
        };
      },
      // Two-step with multiplication
      () => {
        const groups = rand(2, 5);
        const perGroup = rand(3, 6);
        const extra = rand(2, 8);
        const answer = groups * perGroup + extra;
        return {
          type: 'multipleChoice',
          prompt: `A shop has ${groups} boxes of ${perGroup} pencils each, plus ${extra} loose pencils. How many pencils in total?`,
          answer,
          options: makeOptions(answer, answer - 5, answer + 5),
          hint: `First find ${groups} × ${perGroup}, then add ${extra}!`,
        };
      },
      // Working backwards
      () => {
        const answer = rand(10, 25);
        const added = rand(5, 12);
        const result = answer + added;
        return {
          type: 'multipleChoice',
          prompt: `I think of a number, add ${added}, and get ${result}. What was my number?`,
          answer,
          options: makeOptions(answer, answer - 4, answer + 4),
          hint: `Work backwards: ${result} − ${added} = ?`,
        };
      },
      // Working backwards with multiply
      () => {
        const answer = rand(2, 10);
        const mult = rand(2, 5);
        const result = answer * mult;
        return {
          type: 'multipleChoice',
          prompt: `I think of a number, multiply it by ${mult}, and get ${result}. What was my number?`,
          answer,
          options: makeOptions(answer, Math.max(1, answer - 3), answer + 3),
          hint: `Work backwards: ${result} ÷ ${mult} = ?`,
        };
      },
      // Money change problem
      () => {
        const price = rand(3, 15) * 5; // multiples of 5
        const paid = Math.ceil(price / 50) * 50 + (price % 50 === 0 ? 50 : 0);
        const answer = paid - price;
        return {
          type: 'multipleChoice',
          prompt: `A toy costs ${price} cents. I pay with ${paid} cents. How much change do I get?`,
          answer: `${answer} cents`,
          options: shuffle([`${answer} cents`, `${answer + 5} cents`, `${answer - 5 > 0 ? answer - 5 : answer + 10} cents`, `${answer + 15} cents`]),
          hint: `Subtract: ${paid} − ${price} = ?`,
        };
      },
      // Pattern with operations
      () => {
        const patterns = [
          { seq: [2, 6, 18], answer: 54, rule: 'Each number is multiplied by 3!' },
          { seq: [1, 4, 9, 16], answer: 25, rule: 'These are 1×1, 2×2, 3×3, 4×4... what is 5×5?' },
          { seq: [1, 1, 2, 3, 5, 8], answer: 13, rule: 'Each number is the sum of the two before it!' },
          { seq: [100, 95, 85, 70], answer: 50, rule: 'The gaps are getting bigger: −5, −10, −15, −20!' },
        ];
        const p = pick(patterns);
        return {
          type: 'multipleChoice',
          prompt: `What comes next? ${p.seq.join(', ')}, ?`,
          answer: p.answer,
          options: makeOptions(p.answer, Math.max(0, p.answer - 8), p.answer + 8),
          hint: p.rule,
        };
      },
      // Fraction-like reasoning
      () => {
        const total = rand(2, 5) * 4; // divisible by 4
        const half = total / 2;
        const quarter = total / 4;
        const q = pick([
          { prompt: `Half of ${total} is...`, answer: half },
          { prompt: `If I eat half of ${total} sweets, how many are left?`, answer: half },
          { prompt: `A quarter of ${total} marbles is...`, answer: quarter },
        ]);
        return {
          type: 'multipleChoice',
          prompt: q.prompt,
          answer: q.answer,
          options: makeOptions(q.answer, Math.max(1, q.answer - 4), q.answer + 4),
          hint: `Half means dividing by 2. A quarter means dividing by 4!`,
        };
      },
    ];

    const shuffled = shuffle(makers);
    for (let i = 0; i < 12; i++) {
      let q;
      let attempts = 0;
      do {
        q = shuffled[i % shuffled.length]();
        attempts++;
      } while (used.has(q.prompt) && attempts < 30);
      used.add(q.prompt);
      questions.push(q);
    }
    return shuffle(questions);
  };
}

// ===== ZONE & LEVEL DEFINITIONS =====
export const ZONES = [
  { id: 1, name: 'Number Forest', color: '#2ecc71', bg: '#e8f8f0', icon: '🌳', description: 'Explore the magical forest of numbers!' },
  { id: 2, name: 'Shape Beach', color: '#3498db', bg: '#e8f0f8', icon: '🏖️', description: 'Discover shapes by the sparkling sea!' },
  { id: 3, name: 'Measure Mountains', color: '#9b59b6', bg: '#f0e8f8', icon: '⛰️', description: 'Climb mountains of measurement!' },
  { id: 4, name: 'Math Kingdom', color: '#e67e22', bg: '#f8f0e8', icon: '🏰', description: 'Enter the grand Math Kingdom!' },
];

export const PETS = [
  { id: 'kitty', name: 'Kitty', emoji: '🐱', unlockLevel: 3 },
  { id: 'puppy', name: 'Puppy', emoji: '🐶', unlockLevel: 7 },
  { id: 'bunny', name: 'Bunny', emoji: '🐰', unlockLevel: 12 },
  { id: 'fox', name: 'Fox', emoji: '🦊', unlockLevel: 17 },
  { id: 'panda', name: 'Panda', emoji: '🐼', unlockLevel: 22 },
  { id: 'unicorn', name: 'Unicorn', emoji: '🦄', unlockLevel: 27 },
  { id: 'dragon', name: 'Dragon', emoji: '🐲', unlockLevel: 32 },
  { id: 'butterfly', name: 'Butterfly', emoji: '🦋', unlockLevel: 37 },
  { id: 'parrot', name: 'Parrot', emoji: '🦜', unlockLevel: 42 },
  { id: 'snow_leopard', name: 'Snow Leopard', emoji: '🐆', unlockLevel: 47 },
  { id: 'owl', name: 'Mystic Owl', emoji: '🦉', unlockLevel: 52 },
  // Mythical creatures for bonus IQ levels (require 10/12 to unlock)
  { id: 'griffin', name: 'Golden Griffin', emoji: '🦅', unlockLevel: 101, bonusMinScore: 10 },
  { id: 'kraken', name: 'Crystal Kraken', emoji: '🦑', unlockLevel: 102, bonusMinScore: 10 },
  { id: 'frost_wolf', name: 'Frost Wolf', emoji: '🐺', unlockLevel: 103, bonusMinScore: 10 },
  { id: 'sphinx', name: 'Ancient Sphinx', emoji: '🦁', unlockLevel: 104, bonusMinScore: 10 },
];

export const LEVELS = [
  // ZONE 1: Number Forest (Weeks 1-13)
  { id: 1, zone: 1, name: 'Counting Cove', icon: '🐚', topic: 'Counting to 10', desc: 'Count objects from 1 to 10!', generate: genCounting(1, 10) },
  { id: 2, zone: 1, name: 'Number Names Nook', icon: '📖', topic: 'Number Words 1-10', desc: 'Learn number words!', generate: genNumberRecognition(1, 10) },
  { id: 3, zone: 1, name: 'Compare Clearing', icon: '⚖️', topic: 'Comparing Numbers', desc: 'Which group has more?', generate: genComparing(1, 10) },
  { id: 4, zone: 1, name: 'Order Orchard', icon: '🍎', topic: 'Ordering Numbers', desc: 'Put numbers in order!', generate: genOrdering(1, 10) },
  { id: 5, zone: 1, name: 'Pattern Path', icon: '🔢', topic: 'Number Patterns', desc: 'Find the pattern!', generate: genNumberPatterns(1, 10) },
  { id: 6, zone: 1, name: 'Ordinal Oasis', icon: '🏆', topic: 'Ordinal Numbers', desc: 'First, second, third...', generate: genOrdinals() },
  { id: 7, zone: 1, name: 'Bond Bridge (5)', icon: '🌉', topic: 'Number Bonds to 5', desc: 'Parts that make 5!', generate: genNumberBonds(5) },
  { id: 8, zone: 1, name: 'Bond Bridge (10)', icon: '🌁', topic: 'Number Bonds to 10', desc: 'Parts that make 10!', generate: genNumberBonds(10) },
  { id: 9, zone: 1, name: 'Addition Alley', icon: '➕', topic: 'Addition within 10', desc: 'Add numbers together!', generate: genAddition(0, 10) },
  { id: 10, zone: 1, name: 'Story Stream +', icon: '📚', topic: 'Addition Stories', desc: 'Solve addition word problems!', generate: genAdditionStories(10) },
  { id: 11, zone: 1, name: 'Subtract Springs', icon: '➖', topic: 'Subtraction within 10', desc: 'Take away and find what\'s left!', generate: genSubtraction(0, 10) },
  { id: 12, zone: 1, name: 'Story Stream −', icon: '📕', topic: 'Subtraction Stories', desc: 'Solve subtraction word problems!', generate: genSubtractionStories(10) },
  { id: 13, zone: 1, name: 'Fact Family Falls', icon: '🌊', topic: 'Fact Families', desc: 'Addition and subtraction are related!', generate: genFactFamilies(10) },

  // ZONE 2: Shape Beach (Weeks 14-26)
  { id: 14, zone: 2, name: 'Circle Cove', icon: '⭕', topic: 'Circles & Triangles', desc: 'Meet circles and triangles!', generate: genShapes2D(['circle', 'triangle']) },
  { id: 15, zone: 2, name: 'Rectangle Reef', icon: '🟦', topic: 'Rectangles & Squares', desc: 'Discover rectangles and squares!', generate: genShapes2D(['rectangle', 'square']) },
  { id: 16, zone: 2, name: 'Pattern Pier', icon: '🎨', topic: 'Shape Patterns', desc: 'Complete the shape pattern!', generate: genShapePatterns() },
  { id: 17, zone: 2, name: '3D Shores', icon: '📦', topic: '3D Shapes', desc: 'Explore cubes, spheres and more!', generate: genShapes3D() },
  { id: 18, zone: 2, name: 'Counting Coral (20)', icon: '🐠', topic: 'Numbers to 20', desc: 'Count up to 20!', generate: genCounting(10, 20) },
  { id: 19, zone: 2, name: 'Place Value Palms', icon: '🌴', topic: 'Tens and Ones (to 20)', desc: 'Learn about tens and ones!', generate: genPlaceValue(20) },
  { id: 20, zone: 2, name: 'Compare Coastline', icon: '🏄', topic: 'Comparing to 20', desc: 'Compare numbers up to 20!', generate: genComparing(1, 20) },
  { id: 21, zone: 2, name: 'Tide Pool +', icon: '🐙', topic: 'Addition to 20 (easy)', desc: 'Add within 20!', generate: genAddition(0, 20) },
  { id: 22, zone: 2, name: 'Wave Rider +', icon: '🌊', topic: 'Addition to 20 (harder)', desc: 'Bigger additions to 20!', generate: genAddition(5, 20) },
  { id: 23, zone: 2, name: 'Tide Pool −', icon: '🦀', topic: 'Subtraction from 20 (easy)', desc: 'Subtract within 20!', generate: genSubtraction(0, 20) },
  { id: 24, zone: 2, name: 'Wave Rider −', icon: '🐳', topic: 'Subtraction from 20 (harder)', desc: 'Bigger subtractions from 20!', generate: genSubtraction(5, 20) },
  { id: 25, zone: 2, name: 'Story Sandcastle', icon: '🏰', topic: 'Word Problems to 20', desc: 'Solve stories with numbers to 20!', generate: genAdditionStories(20) },
  { id: 26, zone: 2, name: 'Beach Bonanza', icon: '🎉', topic: 'Mid-Year Review', desc: 'Show what you\'ve learned!', generate: genFactFamilies(20) },

  // ZONE 3: Measure Mountains (Weeks 27-39)
  { id: 27, zone: 3, name: 'Length Lodge', icon: '📏', topic: 'Comparing Length', desc: 'Which is longer?', generate: genLength(true) },
  { id: 28, zone: 3, name: 'Ruler Ridge', icon: '📐', topic: 'Measuring Length', desc: 'Measure with units!', generate: genLength(false) },
  { id: 29, zone: 3, name: 'Mass Meadow', icon: '⚖️', topic: 'Comparing Mass', desc: 'Which is heavier?', generate: genMass(true) },
  { id: 30, zone: 3, name: 'Balance Basin', icon: '🏋️', topic: 'Measuring Mass', desc: 'Weigh things with blocks!', generate: genMass(false) },
  { id: 31, zone: 3, name: 'Volume Valley', icon: '🪣', topic: 'Comparing Capacity', desc: 'Which holds more?', generate: genCapacity() },
  { id: 32, zone: 3, name: 'Counting Cliffs (40)', icon: '🧗', topic: 'Numbers to 40', desc: 'Count higher to 40!', generate: genCounting(20, 40) },
  { id: 33, zone: 3, name: 'Place Value Peak', icon: '🏔️', topic: 'Place Value to 40', desc: 'Tens and ones to 40!', generate: genPlaceValue(40) },
  { id: 34, zone: 3, name: 'Compare Canyon', icon: '🦅', topic: 'Comparing to 40', desc: 'Compare numbers to 40!', generate: genComparing(1, 40) },
  { id: 35, zone: 3, name: 'Summit +', icon: '🏔️', topic: 'Addition within 40', desc: 'Add numbers up to 40!', generate: genAddition(0, 40) },
  { id: 36, zone: 3, name: 'Summit −', icon: '⛷️', topic: 'Subtraction within 40', desc: 'Subtract within 40!', generate: genSubtraction(0, 40) },
  { id: 37, zone: 3, name: 'Calendar Cave', icon: '📅', topic: 'Days & Months', desc: 'Learn days and months!', generate: genTime('days') },
  { id: 38, zone: 3, name: 'Clock Tower', icon: '🕐', topic: 'Telling Time (O\'Clock)', desc: 'Read o\'clock times!', generate: genTime('oclock') },
  { id: 39, zone: 3, name: 'Half Past Hill', icon: '🕧', topic: 'Telling Time (Half Past)', desc: 'Read half past times!', generate: genTime('halfpast') },

  // ZONE 4: Math Kingdom (Weeks 40-52)
  { id: 40, zone: 4, name: 'Coin Castle', icon: '🪙', topic: 'Recognizing Coins', desc: 'Learn about Singapore coins!', generate: genMoney('recognize') },
  { id: 41, zone: 4, name: 'Counting Coins', icon: '💰', topic: 'Counting Money', desc: 'Add up coins!', generate: genMoney('count') },
  { id: 42, zone: 4, name: 'Market Maze', icon: '🛒', topic: 'Shopping & Change', desc: 'Buy things and get change!', generate: genMoney('shopping') },
  { id: 43, zone: 4, name: 'Group Garden', icon: '🌻', topic: 'Equal Groups', desc: 'Make equal groups!', generate: genMultiplication('groups') },
  { id: 44, zone: 4, name: 'Multiply Mansion', icon: '✖️', topic: 'Repeated Addition', desc: 'Add the same number again!', generate: genMultiplication('repeated') },
  { id: 45, zone: 4, name: 'Share Square', icon: '🤝', topic: 'Sharing Equally', desc: 'Share fairly among friends!', generate: genDivision('sharing') },
  { id: 46, zone: 4, name: 'Grouping Grounds', icon: '👥', topic: 'Making Groups', desc: 'Put items into groups!', generate: genDivision('grouping') },
  { id: 47, zone: 4, name: 'Tens Tower', icon: '🏗️', topic: 'Counting by Tens to 100', desc: 'Count by 10s!', generate: genCountByTens() },
  { id: 48, zone: 4, name: 'Hundred Hall', icon: '💯', topic: 'Place Value to 100', desc: 'Tens and ones to 100!', generate: genPlaceValue(100) },
  { id: 49, zone: 4, name: 'Order Outpost', icon: '🏰', topic: 'Comparing to 100', desc: 'Compare big numbers!', generate: genComparing(1, 100) },
  { id: 50, zone: 4, name: 'Graph Gallery', icon: '📊', topic: 'Reading Graphs', desc: 'Read picture graphs!', generate: genPictureGraph('read') },
  { id: 51, zone: 4, name: 'Chart Chamber', icon: '📈', topic: 'Making Graphs', desc: 'Create your own graphs!', generate: genPictureGraph('create') },
  { id: 52, zone: 4, name: 'Grand Finale! 🎆', icon: '👑', topic: 'Grand Math Review', desc: 'The ultimate math adventure!', generate: genGrandReview() },

  // BONUS IQ LEVELS (always open, no unlocking needed, 10/12 for mythical pet)
  { id: 101, zone: 1, name: 'Enigma Grove', icon: '🧩', topic: 'Number Puzzles', desc: 'Tricky number challenges for sharp minds!', generate: genIQNumbers(), bonus: true },
  { id: 102, zone: 2, name: 'Riddle Reef', icon: '🔮', topic: 'Shape Puzzles', desc: 'Mind-bending shape and spatial puzzles!', generate: genIQShapes(), bonus: true },
  { id: 103, zone: 3, name: 'Logic Lookout', icon: '🧠', topic: 'Logic Puzzles', desc: 'Can you solve these brain teasers?', generate: genIQLogic(), bonus: true },
  { id: 104, zone: 4, name: 'Genius Gate', icon: '🏆', topic: 'Math Challenges', desc: 'The ultimate test for math geniuses!', generate: genIQMath(), bonus: true },
];

export { SHAPE_EMOJI, SHAPES_2D };
