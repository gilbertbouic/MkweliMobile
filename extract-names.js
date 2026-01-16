const fs = require('fs');
const path = require('path');

// List your JSON files and desired output names file
const files = [
  { json: 'assets/sanctions/full-xsd.json', out: 'assets/sanctions/full-xsd-names.json' },
  { json: 'assets/sanctions/uk-sanctions.json', out: 'assets/sanctions/uk-sanctions-names.json' },
  { json: 'assets/sanctions/sdn.json', out: 'assets/sanctions/sdn-names.json' }
];

// Helper: Recursively find all string values that look like names
function extractNames(obj, names = new Set()) {
  if (typeof obj === 'string') {
    // Basic filter: skip short strings, numbers, etc.
    if (obj.length > 2 && /^[A-Za-z0-9 .,'-]+$/.test(obj)) {
      names.add(obj.trim());
    }
  } else if (Array.isArray(obj)) {
    obj.forEach(item => extractNames(item, names));
  } else if (typeof obj === 'object' && obj !== null) {
    Object.values(obj).forEach(val => extractNames(val, names));
  }
  return names;
}

files.forEach(({ json, out }) => {
  const jsonPath = path.resolve(__dirname, json);
  const outPath = path.resolve(__dirname, out);

  console.log(`Extracting names from ${jsonPath}...`);
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  // Extract names
  const namesSet = extractNames(data);
  const namesArr = Array.from(namesSet).sort();

  // Save to output file
  fs.writeFileSync(outPath, JSON.stringify(namesArr, null, 2), 'utf8');
  console.log(`Done: ${outPath} (${namesArr.length} unique names)`);
});
