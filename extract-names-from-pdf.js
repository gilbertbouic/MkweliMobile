const fs = require('fs');
const path = require('path');

// Read the text file
const textPath = path.resolve(__dirname, 'data/un-sanctions.txt');
const text = fs.readFileSync(textPath, 'utf8');

// Function to extract names
function extractNames(text) {
  const names = new Set();
  const lines = text.split('\n');

  for (const line of lines) {
    if (line.includes('Name: 1:')) {
      // Extract the name parts
      const nameMatch = line.match(/Name: 1: ([^2]+) 2: ([^3]+) 3: ([^4]+) 4: (.+)/);
      if (nameMatch) {
        const [, part1, part2, part3, part4] = nameMatch;
        const fullName = [part1, part2, part3, part4].filter(p => p.trim() !== 'na').join(' ').trim();
        if (fullName.length > 2) {
          names.add(fullName);
        }
      }
    }
  }

  return names;
}

// Extract names
const namesSet = extractNames(text);
const namesArr = Array.from(namesSet).sort();

// Save to JSON
const outPath = path.resolve(__dirname, 'assets/sanctions/un-sanctions-names.json');
fs.writeFileSync(outPath, JSON.stringify(namesArr, null, 2), 'utf8');
console.log(`Done: ${outPath} (${namesArr.length} unique names)`);
