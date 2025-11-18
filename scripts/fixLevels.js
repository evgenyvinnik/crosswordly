// Script to find valid word replacements for broken levels
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the words file
const wordsContent = fs.readFileSync(
  path.join(__dirname, '../src/words/words.ts'),
  'utf8'
);

// Extract all words from GUESS_WORDS
const wordMatches = wordsContent.matchAll(/\s+([a-z]+):/g);
const allWords = [...wordMatches].map(match => match[1]);

console.log(`Loaded ${allWords.length} words from GUESS_WORDS\n`);

// Group words by length
const wordsByLength = {};
allWords.forEach(word => {
  if (!wordsByLength[word.length]) {
    wordsByLength[word.length] = [];
  }
  wordsByLength[word.length].push(word);
});

// Function to find valid word combinations for a level
function findWordsForLevel(levelConfig) {
  const { name, grid, words: wordSpecs } = levelConfig;
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Level: ${name}`);
  console.log(`Grid: ${grid.width}x${grid.height}`);
  console.log(`Words: ${wordSpecs.length}`);
  
  // Calculate word lengths
  const requirements = wordSpecs.map((spec, idx) => {
    const length = spec.direction === 'across' 
      ? grid.width - spec.startCol
      : grid.height - spec.startRow;
    return { ...spec, length, index: idx };
  });
  
  // Find intersections
  const intersections = [];
  for (let i = 0; i < requirements.length; i++) {
    for (let j = i + 1; j < requirements.length; j++) {
      const w1 = requirements[i];
      const w2 = requirements[j];
      
      if (w1.direction === w2.direction) continue;
      
      const [across, down] = w1.direction === 'across' ? [w1, w2] : [w2, w1];
      
      if (down.startCol >= across.startCol && 
          down.startCol < across.startCol + across.length &&
          across.startRow >= down.startRow &&
          across.startRow < down.startRow + down.length) {
        
        const acrossIndex = down.startCol - across.startCol;
        const downIndex = across.startRow - down.startRow;
        
        intersections.push({
          word1Idx: w1.direction === 'across' ? i : j,
          word2Idx: w1.direction === 'across' ? j : i,
          char1Idx: acrossIndex,
          char2Idx: downIndex,
        });
      }
    }
  }
  
  console.log(`Intersections: ${intersections.length}`);
  
  // Check available words for each length
  let hasMissingWords = false;
  requirements.forEach((req, i) => {
    const available = wordsByLength[req.length] || [];
    console.log(`  Word ${i}: ${req.direction} ${req.length} letters - ${available.length} available`);
    if (available.length === 0) {
      hasMissingWords = true;
    }
  });
  
  if (hasMissingWords) {
    console.log(`❌ Cannot solve - no words available for required lengths`);
    return null;
  }
  
  // Try to find valid combination
  const maxAttempts = 50000;
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    attempts++;
    
    const selectedWords = requirements.map(req => {
      const pool = wordsByLength[req.length];
      return pool[Math.floor(Math.random() * pool.length)];
    });
    
    const allMatch = intersections.every(int => {
      return selectedWords[int.word1Idx][int.char1Idx] === 
             selectedWords[int.word2Idx][int.char2Idx];
    });
    
    if (allMatch) {
      console.log(`✅ Found solution after ${attempts} attempts:`);
      selectedWords.forEach((word, i) => {
        const req = requirements[i];
        console.log(`  ${word} (${req.direction} at row ${req.startRow}, col ${req.startCol})`);
      });
      
      // Generate prefilled letters suggestion
      const prefilledSuggestions = [];
      intersections.forEach(int => {
        const w1 = selectedWords[int.word1Idx];
        const req1 = requirements[int.word1Idx];
        const row = req1.direction === 'across' ? req1.startRow : req1.startRow + int.char2Idx;
        const col = req1.direction === 'across' ? req1.startCol + int.char1Idx : req1.startCol;
        prefilledSuggestions.push(`'${row}-${col}': '${w1[int.char1Idx]}'`);
      });
      
      if (prefilledSuggestions.length > 0) {
        console.log(`\n  Suggested prefilledLetters (pick 2-3):`);
        prefilledSuggestions.slice(0, 3).forEach(s => console.log(`    ${s},`));
      }
      
      return {
        words: selectedWords,
        requirements,
        prefilledLetters: prefilledSuggestions.slice(0, 3)
      };
    }
  }
  
  console.log(`❌ No solution found after ${maxAttempts} attempts`);
  return null;
}

// Level configurations to fix (from the actual file)
const levelsToFix = [
  {
    name: 'ocean-sound',
    grid: { width: 5, height: 5 },
    words: [
      { direction: 'across', startRow: 0, startCol: 0 },
      { direction: 'across', startRow: 4, startCol: 0 },
      { direction: 'down', startRow: 0, startCol: 1 },
      { direction: 'down', startRow: 0, startCol: 3 }
    ]
  },
  {
    name: 'crown-jewel',
    grid: { width: 7, height: 5 },
    words: [
      { direction: 'across', startRow: 0, startCol: 0 },
      { direction: 'down', startRow: 0, startCol: 0 },
      { direction: 'down', startRow: 0, startCol: 3 },
      { direction: 'across', startRow: 4, startCol: 2 },
      { direction: 'down', startRow: 0, startCol: 6 }
    ]
  },
  {
    name: 'brain-scope',
    grid: { width: 5, height: 11 },
    words: [
      { direction: 'down', startRow: 0, startCol: 2 },
      { direction: 'across', startRow: 4, startCol: 0 },
      { direction: 'across', startRow: 6, startCol: 0 },
      { direction: 'down', startRow: 3, startCol: 0 },
      { direction: 'down', startRow: 3, startCol: 4 },
      { direction: 'down', startRow: 6, startCol: 2 }
    ]
  },
  {
    name: 'magic-block',
    grid: { width: 5, height: 7 },
    words: [
      { direction: 'across', startRow: 0, startCol: 0 },
      { direction: 'across', startRow: 2, startCol: 0 },
      { direction: 'across', startRow: 4, startCol: 0 },
      { direction: 'across', startRow: 6, startCol: 0 },
      { direction: 'down', startRow: 0, startCol: 1 },
      { direction: 'down', startRow: 0, startCol: 3 },
      { direction: 'down', startRow: 0, startCol: 4 }
    ]
  },
  {
    name: 'event-stage',
    grid: { width: 5, height: 11 },
    words: [
      { direction: 'across', startRow: 4, startCol: 0 },
      { direction: 'across', startRow: 6, startCol: 0 },
      { direction: 'across', startRow: 1, startCol: 0 },
      { direction: 'across', startRow: 9, startCol: 0 },
      { direction: 'down', startRow: 3, startCol: 0 },
      { direction: 'down', startRow: 3, startCol: 4 },
      { direction: 'down', startRow: 0, startCol: 2 },
      { direction: 'down', startRow: 6, startCol: 2 }
    ]
  }
];

// Run the solver
const solutions = {};
levelsToFix.forEach(level => {
  const solution = findWordsForLevel(level);
  if (solution) {
    solutions[level.name] = solution;
  }
});

// Generate code to apply fixes
if (Object.keys(solutions).length > 0) {
  console.log(`\n${'='.repeat(60)}`);
  console.log('SOLUTIONS FOUND\n');
  
  Object.entries(solutions).forEach(([levelName, solution]) => {
    console.log(`\n${levelName}:`);
    console.log('  words: [');
    solution.words.forEach((word, i) => {
      const req = solution.requirements[i];
      console.log(`    { word: '${word}', direction: '${req.direction}', startRow: ${req.startRow}, startCol: ${req.startCol} },`);
    });
    console.log('  ],');
    console.log('  prefilledLetters: {');
    solution.prefilledLetters.forEach(pf => console.log(`    ${pf}`));
    console.log('  }');
  });
}
