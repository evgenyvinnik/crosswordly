// Helper script to find valid word combinations for crossword puzzles
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

// Function to find words matching a pattern with intersections
function findValidCombination(config) {
  const { grid, words: wordSpecs } = config;
  
  console.log(`\n=== Finding valid combination for ${config.name} ===`);
  console.log(`Grid: ${grid.width}x${grid.height}`);
  console.log(`Words needed: ${wordSpecs.length}`);
  
  // Calculate required word lengths and intersections
  const requirements = wordSpecs.map(spec => {
    const length = spec.direction === 'across' 
      ? grid.width - spec.startCol
      : grid.height - spec.startRow;
    return { ...spec, length };
  });
  
  console.log('\nWord requirements:');
  requirements.forEach((req, i) => {
    console.log(`  ${i}: ${req.direction} at (${req.startRow},${req.startCol}), length ${req.length}`);
  });
  
  // Find intersections
  const intersections = [];
  for (let i = 0; i < requirements.length; i++) {
    for (let j = i + 1; j < requirements.length; j++) {
      const w1 = requirements[i];
      const w2 = requirements[j];
      
      if (w1.direction === w2.direction) continue;
      
      const [across, down] = w1.direction === 'across' ? [w1, w2] : [w2, w1];
      
      // Check if they intersect
      if (down.startCol >= across.startCol && 
          down.startCol < across.startCol + across.length &&
          across.startRow >= down.startRow &&
          across.startRow < down.startRow + down.length) {
        
        const acrossIndex = down.startCol - across.startCol;
        const downIndex = across.startRow - down.startRow;
        
        intersections.push({
          word1: w1.direction === 'across' ? i : j,
          word2: w1.direction === 'across' ? j : i,
          index1: acrossIndex,
          index2: downIndex,
          position: `(${across.startRow},${down.startCol})`
        });
      }
    }
  }
  
  console.log(`\nIntersections found: ${intersections.length}`);
  intersections.forEach(int => {
    console.log(`  Word ${int.word1}[${int.index1}] ↔ Word ${int.word2}[${int.index2}] at ${int.position}`);
  });
  
  // Get word pools by length
  const wordsByLength = {};
  requirements.forEach(req => {
    if (!wordsByLength[req.length]) {
      wordsByLength[req.length] = allWords.filter(w => w.length === req.length);
    }
  });
  
  console.log('\nAvailable words by length:');
  Object.keys(wordsByLength).forEach(len => {
    console.log(`  Length ${len}: ${wordsByLength[len].length} words`);
  });
  
  // Try to find valid combinations
  const maxAttempts = 10000;
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    attempts++;
    
    // Pick random words for each position
    const selectedWords = requirements.map(req => {
      const pool = wordsByLength[req.length];
      return pool[Math.floor(Math.random() * pool.length)];
    });
    
    // Check if all intersections match
    const allMatch = intersections.every(int => {
      const char1 = selectedWords[int.word1][int.index1];
      const char2 = selectedWords[int.word2][int.index2];
      return char1 === char2;
    });
    
    if (allMatch) {
      console.log(`\n✓ Found valid combination after ${attempts} attempts:`);
      selectedWords.forEach((word, i) => {
        const req = requirements[i];
        console.log(`  ${i}: ${word} (${req.direction} at ${req.startRow},${req.startCol})`);
      });
      
      // Verify all intersections
      console.log('\nVerification:');
      intersections.forEach(int => {
        const w1 = selectedWords[int.word1];
        const w2 = selectedWords[int.word2];
        console.log(`  ${w1}[${int.index1}]='${w1[int.index1]}' ↔ ${w2}[${int.index2}]='${w2[int.index2]}' ✓`);
      });
      
      return selectedWords;
    }
  }
  
  console.log(`\n✗ No valid combination found after ${maxAttempts} attempts`);
  return null;
}

// Test configurations for broken levels

// 1. lunar-diver: 2 words, 5x5 grid
const lunarDiver = {
  name: 'lunar-diver',
  grid: { width: 5, height: 5 },
  words: [
    { direction: 'across', startRow: 2, startCol: 0 },
    { direction: 'down', startRow: 0, startCol: 4 }
  ]
};

// 2. fairy-grove: 3 words, 5x5 grid
const fairyGrove = {
  name: 'fairy-grove',
  grid: { width: 5, height: 5 },
  words: [
    { direction: 'down', startRow: 0, startCol: 1 },
    { direction: 'down', startRow: 0, startCol: 3 },
    { direction: 'across', startRow: 3, startCol: 0 }
  ]
};

// 3. ocean-sound: 4 words, 5x5 grid
const oceanSound = {
  name: 'ocean-sound',
  grid: { width: 5, height: 5 },
  words: [
    { direction: 'across', startRow: 0, startCol: 0 },
    { direction: 'across', startRow: 4, startCol: 0 },
    { direction: 'down', startRow: 0, startCol: 1 },
    { direction: 'down', startRow: 0, startCol: 3 }
  ]
};

// 4. crown-jewel: 5 words, 7x5 grid
const crownJewel = {
  name: 'crown-jewel',
  grid: { width: 7, height: 5 },
  words: [
    { direction: 'across', startRow: 0, startCol: 0 },
    { direction: 'down', startRow: 0, startCol: 0 },
    { direction: 'down', startRow: 0, startCol: 3 },
    { direction: 'across', startRow: 4, startCol: 2 },
    { direction: 'down', startRow: 0, startCol: 6 }
  ]
};

// 5. brain-scope: 6 words, 5x11 grid
const brainScope = {
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
};

// 6. magic-block: 7 words, 5x7 grid
const magicBlock = {
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
};

// 7. event-stage: 8 words, 5x11 grid
const eventStage = {
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
};

// Run the finder for each level
[lunarDiver, fairyGrove, oceanSound, crownJewel, brainScope, magicBlock, eventStage].forEach(config => {
  findValidCombination(config);
});
