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
      const itemA = pick(ALL_ITEMS);
      const itemB = pick(ALL_ITEMS);
      questions.push({
        type: 'addition',
        prompt: `${a} + ${b} = ?`,
        a, b, sum,
        emojiA: itemA.emoji,
        emojiB: itemB.emoji,
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
  const shapeProps = {
    circle: { sides: 0, corners: 0, round: true },
    triangle: { sides: 3, corners: 3, round: false },
    square: { sides: 4, corners: 4, round: false },
    rectangle: { sides: 4, corners: 4, round: false },
  };
  // True/false facts: [statement, isTrue, hint]
  function shapeFacts(shape) {
    const p = shapeProps[shape];
    const facts = [
      [`A ${shape} has ${p.sides} sides.`, true, `Count the straight edges!`],
      [`A ${shape} has ${p.corners} corners.`, true, `Corners are where sides meet!`],
    ];
    // Add false statements
    if (p.sides > 0) {
      const wrongSides = p.sides === 4 ? 3 : 4;
      facts.push([`A ${shape} has ${wrongSides} sides.`, false, `Count the straight edges carefully!`]);
    }
    if (p.corners > 0) {
      const wrongCorners = p.corners === 4 ? 5 : 4;
      facts.push([`A ${shape} has ${wrongCorners} corners.`, false, `Count the corners carefully!`]);
    }
    if (shape === 'circle') {
      facts.push([`A circle has corners.`, false, `A circle is round with no corners!`]);
      facts.push([`A circle is round.`, true, `A circle has no straight edges!`]);
    }
    if (shape === 'square') {
      facts.push([`A square has 4 equal sides.`, true, `All sides of a square are the same length!`]);
      facts.push([`A square is round.`, false, `A square has straight sides and corners!`]);
    }
    if (shape === 'rectangle') {
      facts.push([`A rectangle has 4 sides.`, true, `A rectangle has 2 long sides and 2 short sides!`]);
      facts.push([`A rectangle is round.`, false, `A rectangle has straight sides and corners!`]);
    }
    if (shape === 'triangle') {
      facts.push([`A triangle has 4 sides.`, false, `A triangle has exactly 3 sides!`]);
      facts.push([`A triangle has 3 corners.`, true, `Each point of a triangle is a corner!`]);
    }
    return facts;
  }
  return () => {
    const questions = [];
    const used = new Set();
    for (let i = 0; i < 12; i++) {
      let target, key;
      let attempts = 0;
      const qType = i % 4;
      do {
        target = pick(shapes);
        key = `${qType}-${target}-${attempts}`;
        attempts++;
      } while (used.has(key) && attempts < 30);
      used.add(key);
      const others = shuffle(SHAPES_2D.filter(s => s !== target)).slice(0, 3);
      if (qType === 0) {
        // Shape identification
        questions.push({
          type: 'shapeIdentify',
          prompt: `Which shape is a ${target}?`,
          targetShape: target,
          shapes: shuffle([target, ...others]),
          answer: target,
          hint: target === 'circle' ? 'A circle is round with no corners!'
            : target === 'triangle' ? 'A triangle has 3 sides and 3 corners!'
            : target === 'square' ? 'A square has 4 equal sides!'
            : 'A rectangle has 2 long sides and 2 short sides!',
        });
      } else if (qType === 1) {
        // How many sides
        const shape = pick(shapes);
        const sides = shapeProps[shape].sides;
        questions.push({
          type: 'multipleChoice',
          prompt: `How many sides does a ${shape} have?`,
          answer: sides,
          options: shuffle([0, 3, 4, 5].includes(sides) ? [0, 3, 4, 5] : makeOptions(sides, 0, 6)),
          hint: `Count the straight edges of the shape!`,
        });
      } else if (qType === 2) {
        // How many corners
        const shape = pick(shapes);
        const corners = shapeProps[shape].corners;
        questions.push({
          type: 'multipleChoice',
          prompt: `How many corners does a ${shape} have?`,
          answer: corners,
          options: shuffle([0, 3, 4, 5].includes(corners) ? [0, 3, 4, 5] : makeOptions(corners, 0, 6)),
          hint: `Corners are the pointy parts where sides meet!`,
        });
      } else {
        // True or false
        const shape = pick(shapes);
        const facts = shapeFacts(shape);
        const [statement, isTrue, hint] = pick(facts);
        questions.push({
          type: 'multipleChoice',
          prompt: `True or false: ${statement}`,
          answer: isTrue ? 'True' : 'False',
          options: ['True', 'False'],
          hint,
        });
      }
    }
    return questions;
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
      { name: 'cube', desc: '6 flat faces, all squares', emoji: '🧊' },
      { name: 'cuboid', desc: '6 flat faces, rectangles', emoji: '📦' },
      { name: 'sphere', desc: 'perfectly round like a ball', emoji: '⚽' },
      { name: 'cylinder', desc: '2 flat circles and 1 curved surface', emoji: '🥫' },
      { name: 'cone', desc: '1 flat circle and 1 pointy top', emoji: '🍦' },
    ];
    const questions = [];
    const used = new Set();
    for (let i = 0; i < 12; i++) {
      let shape, key;
      let attempts = 0;
      do {
        shape = pick(shapes3D);
        key = `${i % 2}-${shape.name}`;
        attempts++;
      } while (used.has(key) && attempts < 30);
      used.add(key);
      const others = shuffle(shapes3D.filter(s => s.name !== shape.name)).slice(0, 3);
      if (i % 2 === 0) {
        questions.push({
          type: 'multipleChoice',
          prompt: `Which 3D shape is ${shape.desc}?`,
          answer: shape.name,
          options: shuffle([shape, ...others].map(s => s.name)),
          hint: `Think about what ${shape.emoji} looks like!`,
        });
      } else {
        questions.push({
          type: 'multipleChoice',
          prompt: `What 3D shape does ${shape.emoji} look like?`,
          answer: shape.name,
          options: shuffle([shape, ...others].map(s => s.name)),
          hint: shape.desc,
        });
      }
    }
    return questions;
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
  { id: 'star_sprite', name: 'Star Sprite', emoji: '✨', unlockLevel: 47 },
  { id: 'phoenix', name: 'Royal Phoenix', emoji: '🔥', unlockLevel: 52 },
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
];

export { SHAPE_EMOJI, SHAPES_2D };
