/**
 * Script to add missing `id` properties to createPuzzle calls in levelConfigs.ts
 *
 * This fixes the bug where sharing links don't encode the level ID correctly.
 */

const fs = require('fs');
const path = require('path');

const levelConfigsPath = path.join(__dirname, '../src/components/levels/levelConfigs.ts');
const content = fs.readFileSync(levelConfigsPath, 'utf8');

// Pattern to match level definitions
const levelPattern = /{\s*id: '([^']+)',\s*title:[^}]+puzzle: createPuzzle\({\s*grid:/g;

let match;
const fixes = [];

while ((match = levelPattern.exec(content)) !== null) {
  const levelId = match[1];
  const matchStart = match.index;

  // Check if this createPuzzle already has an id
  const puzzleStart = content.indexOf('createPuzzle({', matchStart);
  const gridPos = content.indexOf('grid:', puzzleStart);
  const betweenText = content.substring(puzzleStart + 14, gridPos);

  if (!betweenText.includes(`id: '${levelId}'`)) {
    fixes.push(levelId);
  }
}

console.log(`Found ${fixes.length} levels missing id in createPuzzle:`);
fixes.forEach((id) => console.log(`  - ${id}`));

// Now apply the fixes
let fixedContent = content;
let fixCount = 0;

fixes.forEach((levelId) => {
  // For each level, find the pattern and add the id
  const searchPattern = new RegExp(
    `(id: '${levelId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}',\\s*title:[^}]+puzzle: createPuzzle\\({)\\s*(grid:)`,
    'g',
  );

  const replacement = `$1\n          id: '${levelId}',\n          $2`;
  const newContent = fixedContent.replace(searchPattern, replacement);

  if (newContent !== fixedContent) {
    fixCount++;
    fixedContent = newContent;
  }
});

if (fixCount > 0) {
  fs.writeFileSync(levelConfigsPath, fixedContent, 'utf8');
  console.log(`\n✅ Fixed ${fixCount} levels!`);
  console.log(`Updated file: ${levelConfigsPath}`);
} else {
  console.log('\n✅ All levels already have id properties!');
}
