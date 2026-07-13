const fs = require('fs');
const path = require('path');
const { XMLParser } = require('fast-xml-parser');

// List your XML files and desired output JSON names
const files = [
  { xml: 'data/original lists/20260410-FULL-1_1(xsd).xml', json: 'assets/sanctions/full-xsd.json' },
  { xml: 'data/original lists/UK-Sanctions-List.xml', json: 'assets/sanctions/uk-sanctions.json' },
  { xml: 'data/original lists/sdn.xml', json: 'assets/sanctions/sdn.json' }
];

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  allowBooleanAttributes: true,
  parseTagValue: true,
  parseAttributeValue: true,
  trimValues: true
});

files.forEach(({ xml, json }) => {
  const xmlPath = path.resolve(__dirname, xml);
  const jsonPath = path.resolve(__dirname, json);

  console.log(`Converting ${xmlPath} to ${jsonPath}...`);
  const xmlData = fs.readFileSync(xmlPath, 'utf8');
  const jsonObj = parser.parse(xmlData);

  fs.writeFileSync(jsonPath, JSON.stringify(jsonObj, null, 2), 'utf8');
  console.log(`Done: ${jsonPath}`);
});
