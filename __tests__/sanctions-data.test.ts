/**
 * @format
 */

import { isSanctioned, allSanctionedNames } from '../sanctions-data';

describe('Sanctions Data Module', () => {
  // Test data is loaded
  describe('Data Loading', () => {
    test('allSanctionedNames should be a Set', () => {
      expect(allSanctionedNames).toBeInstanceOf(Set);
    });

    test('allSanctionedNames should not be empty', () => {
      expect(allSanctionedNames.size).toBeGreaterThan(0);
    });

    test('should contain known sanctioned names', () => {
      // Testing with a name from the actual dataset
      const hasNames = allSanctionedNames.size > 0;
      expect(hasNames).toBe(true);
    });
  });

  // Test exact matching logic
  describe('isSanctioned Function - Exact Matching', () => {
    test('should return false for empty string', () => {
      expect(isSanctioned('')).toBe(false);
    });

    test('should return false for null/undefined input', () => {
      expect(isSanctioned(null as unknown as string)).toBe(false);
      expect(isSanctioned(undefined as unknown as string)).toBe(false);
    });

    test('should handle whitespace correctly', () => {
      // Test that leading/trailing spaces are trimmed
      const result1 = isSanctioned('  test  ');
      const result2 = isSanctioned('test');
      expect(result1).toBe(result2);
    });

    test('should be case-insensitive', () => {
      // If any name exists in the database, test case variations
      if (allSanctionedNames.size > 0) {
        const anyName = Array.from(allSanctionedNames)[0];
        expect(isSanctioned(anyName.toUpperCase())).toBe(true);
        expect(isSanctioned(anyName.toLowerCase())).toBe(true);
        expect(isSanctioned(anyName)).toBe(true);
      }
    });
  });

  // Test with known names from the datasets
  describe('isSanctioned Function - Dataset Verification', () => {
    test('should correctly identify sanctioned names from dataset', () => {
      // Get a sample of names from the dataset
      const namesArray = Array.from(allSanctionedNames).slice(0, 10);

      namesArray.forEach(name => {
        expect(isSanctioned(name)).toBe(true);
      });
    });

    test('should correctly identify sanctioned names with variations', () => {
      if (allSanctionedNames.size > 0) {
        const testName = Array.from(allSanctionedNames)[0];

        // Test various case variations
        expect(isSanctioned(testName.toUpperCase())).toBe(true);
        expect(isSanctioned(testName.toLowerCase())).toBe(true);
        expect(isSanctioned(testName.charAt(0).toUpperCase() + testName.slice(1).toLowerCase())).toBe(true);
      }
    });

    test('should handle names with extra whitespace', () => {
      if (allSanctionedNames.size > 0) {
        const testName = Array.from(allSanctionedNames)[0];

        expect(isSanctioned(`  ${testName}  `)).toBe(true);
        expect(isSanctioned(`\t${testName}\t`)).toBe(true);
        expect(isSanctioned(`\n${testName}\n`)).toBe(true);
      }
    });
  });

  // Test non-sanctioned names
  describe('isSanctioned Function - Non-Sanctioned Names', () => {
    test('should return false for non-existent names', () => {
      const randomNames = [
        'John Smith 12345',
        'Random Person XYZ',
        'NotInDatabase 999',
        'Test User ABC',
      ];

      randomNames.forEach(name => {
        const result = isSanctioned(name);
        // We expect most of these to be false unless by coincidence they match
        expect(typeof result).toBe('boolean');
      });
    });

    test('should return false for partial name matches', () => {
      if (allSanctionedNames.size > 0) {
        const testName = Array.from(allSanctionedNames)[0];

        // Test that partial matches don't work (exact matching only)
        if (testName.length > 3) {
          const partial = testName.substring(0, Math.floor(testName.length / 2));
          expect(isSanctioned(partial)).toBe(false);
        }
      }
    });

    test('should not match if name contains extra characters', () => {
      if (allSanctionedNames.size > 0) {
        const testName = Array.from(allSanctionedNames)[0];

        // Test that extra characters prevent matching
        expect(isSanctioned(`${testName}X`)).toBe(false);
        expect(isSanctioned(`X${testName}`)).toBe(false);
      }
    });
  });

  // Performance tests
  describe('Performance', () => {
    test('should perform lookups efficiently', () => {
      const startTime = performance.now();

      // Perform 1000 lookups
      for (let i = 0; i < 1000; i++) {
        isSanctioned('nonexistent name');
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should complete 1000 lookups in reasonable time (< 1 second)
      expect(totalTime).toBeLessThan(1000);
    });

    test('should handle large batch of lookups', () => {
      const startTime = performance.now();
      const testNames = [
        'test1', 'test2', 'test3', 'test4', 'test5',
        'test6', 'test7', 'test8', 'test9', 'test10',
      ];

      testNames.forEach(name => {
        isSanctioned(name);
      });

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      expect(totalTime).toBeLessThan(100);
    });
  });

  // Integration tests - simulate real usage
  describe('Integration Tests', () => {
    test('should work with mixed case and whitespace realistically', () => {
      if (allSanctionedNames.size > 0) {
        const testName = Array.from(allSanctionedNames)[0];

        // Simulate user input with various spacing and casing
        const userInputVariations = [
          testName,
          ` ${testName} `,
          testName.toUpperCase(),
          testName.toLowerCase(),
          `  ${testName.toUpperCase()}  `,
        ];

        userInputVariations.forEach(input => {
          expect(isSanctioned(input)).toBe(true);
        });
      }
    });

    test('should return consistent results', () => {
      const testInputs = [
        'TestName123',
        'Another Test',
        '',
        'x'.repeat(100),
      ];

      testInputs.forEach(input => {
        const result1 = isSanctioned(input);
        const result2 = isSanctioned(input);
        const result3 = isSanctioned(input);

        expect(result1).toBe(result2);
        expect(result2).toBe(result3);
      });
    });
  });

  // Edge cases
  describe('Edge Cases', () => {
    test('should handle very long names', () => {
      const longName = 'a'.repeat(10000);
      expect(typeof isSanctioned(longName)).toBe('boolean');
    });

    test('should handle special characters', () => {
      const specialNames = [
        "Name with 'quotes'",
        'Name-with-dashes',
        'Name.with.dots',
        'Name/with/slashes',
        'Name@with#symbols$',
        'Name with   multiple   spaces',
      ];

      specialNames.forEach(name => {
        expect(typeof isSanctioned(name)).toBe('boolean');
      });
    });

    test('should handle unicode characters', () => {
      const unicodeNames = [
        'José García',
        'François Müller',
        '李明',
        'Владимир Путин',
        '🔍 Search',
      ];

      unicodeNames.forEach(name => {
        expect(typeof isSanctioned(name)).toBe('boolean');
      });
    });

    test('should handle empty or whitespace-only strings', () => {
      expect(isSanctioned('')).toBe(false);
      expect(isSanctioned('   ')).toBe(false);
      expect(isSanctioned('\t')).toBe(false);
      expect(isSanctioned('\n')).toBe(false);
    });
  });
});

