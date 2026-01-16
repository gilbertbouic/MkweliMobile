/**
 * @format
 * Test utilities and helpers for the sanctions screening app
 */

import { isSanctioned, allSanctionedNames } from '../sanctions-data';

/**
 * Test utility functions for common test scenarios
 */

export class TestUtils {
  /**
   * Gets a random sanctioned name from the database for testing
   * @returns Random sanctioned name from database
   */
  static getRandomSanctionedName(): string | undefined {
    if (allSanctionedNames.size === 0) {
      return undefined;
    }
    const namesArray = Array.from(allSanctionedNames);
    return namesArray[Math.floor(Math.random() * namesArray.length)];
  }

  /**
   * Gets multiple random sanctioned names for batch testing
   * @param count Number of names to retrieve
   * @returns Array of random sanctioned names
   */
  static getRandomSanctionedNames(count: number): string[] {
    const namesArray = Array.from(allSanctionedNames);
    const results: string[] = [];

    for (let i = 0; i < count && i < namesArray.length; i++) {
      const randomIndex = Math.floor(Math.random() * namesArray.length);
      results.push(namesArray[randomIndex]);
    }

    return results;
  }

  /**
   * Gets the first N names from the database
   * @param count Number of names to retrieve
   * @returns Array of first N names
   */
  static getFirstSanctionedNames(count: number): string[] {
    return Array.from(allSanctionedNames).slice(0, count);
  }

  /**
   * Tests a set of names and returns results
   * @param names Array of names to test
   * @returns Object with results breakdown
   */
  static testNameBatch(names: string[]): {
    tested: number;
    sanctioned: number;
    notSanctioned: number;
    results: { name: string; isSanctioned: boolean }[];
  } {
    const results: { name: string; isSanctioned: boolean }[] = [];
    let sanctioned = 0;
    let notSanctioned = 0;

    names.forEach(name => {
      const result = isSanctioned(name);
      results.push({ name, isSanctioned: result });
      if (result) {
        sanctioned++;
      } else {
        notSanctioned++;
      }
    });

    return {
      tested: names.length,
      sanctioned,
      notSanctioned,
      results,
    };
  }

  /**
   * Measures performance of screening lookups
   * @param iterations Number of lookups to perform
   * @param testName Name to test (default: random)
   * @returns Performance metrics
   */
  static measurePerformance(
    iterations: number,
    testName?: string,
  ): {
    iterations: number;
    totalTime: number;
    avgTime: number;
    minTime: number;
    maxTime: number;
  } {
    const name = testName || this.getRandomSanctionedName() || 'test';
    const times: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      isSanctioned(name);
      const end = performance.now();
      times.push(end - start);
    }

    const totalTime = times.reduce((a, b) => a + b, 0);
    const avgTime = totalTime / iterations;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);

    return {
      iterations,
      totalTime,
      avgTime,
      minTime,
      maxTime,
    };
  }

  /**
   * Generates test names with various formats
   * @returns Object containing arrays of test names
   */
  static generateTestNames() {
    if (allSanctionedNames.size === 0) {
      return {
        original: [],
        uppercase: [],
        lowercase: [],
        mixed: [],
        withSpaces: [],
        withTabs: [],
        withNewlines: [],
      };
    }

    const original = this.getFirstSanctionedNames(5);
    const uppercase = original.map(n => n.toUpperCase());
    const lowercase = original.map(n => n.toLowerCase());
    const mixed = original.map(
      n =>
        n.charAt(0).toUpperCase() +
        n.slice(1, Math.floor(n.length / 2)).toLowerCase() +
        n.slice(Math.floor(n.length / 2)).toUpperCase(),
    );
    const withSpaces = original.map(n => `  ${n}  `);
    const withTabs = original.map(n => `\t${n}\t`);
    const withNewlines = original.map(n => `\n${n}\n`);

    return {
      original,
      uppercase,
      lowercase,
      mixed,
      withSpaces,
      withTabs,
      withNewlines,
    };
  }

  /**
   * Validates the screening logic against test cases
   * @param testCases Array of {input, expected} pairs
   * @returns Validation results
   */
  static validateScreeningLogic(
    testCases: { input: string; expected: boolean }[],
  ): {
    total: number;
    passed: number;
    failed: number;
    failures: { input: string; expected: boolean; actual: boolean }[];
  } {
    const failures: { input: string; expected: boolean; actual: boolean }[] =
      [];
    let passed = 0;

    testCases.forEach(({ input, expected }) => {
      const actual = isSanctioned(input);
      if (actual === expected) {
        passed++;
      } else {
        failures.push({ input, expected, actual });
      }
    });

    return {
      total: testCases.length,
      passed,
      failed: testCases.length - passed,
      failures,
    };
  }

  /**
   * Stress test the screening function
   * @param duration Time in milliseconds to run stress test
   * @returns Stress test results
   */
  static stressTest(duration: number = 5000): {
    duration: number;
    lookups: number;
    lookupsPerSecond: number;
    successRate: number;
  } {
    const startTime = Date.now();
    let lookups = 0;
    let successes = 0;

    while (Date.now() - startTime < duration) {
      const randomName = this.getRandomSanctionedName() || 'test';
      const result = isSanctioned(randomName);
      lookups++;
      if (result) {
        successes++;
      }
    }

    const actualDuration = Date.now() - startTime;
    const lookupsPerSecond = (lookups / actualDuration) * 1000;
    const successRate = (successes / lookups) * 100;

    return {
      duration: actualDuration,
      lookups,
      lookupsPerSecond,
      successRate,
    };
  }

  /**
   * Gets database statistics
   * @returns Database stats
   */
  static getDatabaseStats(): {
    totalNames: number;
    sampleSize: number;
    samples: string[];
    avgNameLength: number;
  } {
    const namesArray = Array.from(allSanctionedNames);
    const sampleSize = Math.min(10, namesArray.length);
    const samples = namesArray.slice(0, sampleSize);

    const totalLength = samples.reduce((sum, name) => sum + name.length, 0);
    const avgNameLength = samples.length > 0 ? totalLength / samples.length : 0;

    return {
      totalNames: namesArray.length,
      sampleSize,
      samples,
      avgNameLength: Math.round(avgNameLength * 10) / 10,
    };
  }

  /**
   * Creates a detailed test report
   * @returns Comprehensive test report
   */
  static generateTestReport(): {
    timestamp: string;
    databaseStats: ReturnType<typeof this.getDatabaseStats>;
    performanceMetrics: ReturnType<typeof this.measurePerformance>;
    sampleResults: ReturnType<typeof this.testNameBatch>;
    stressTestResults: ReturnType<typeof this.stressTest>;
  } {
    return {
      timestamp: new Date().toISOString(),
      databaseStats: this.getDatabaseStats(),
      performanceMetrics: this.measurePerformance(1000),
      sampleResults: this.testNameBatch(
        this.getRandomSanctionedNames(20),
      ),
      stressTestResults: this.stressTest(2000),
    };
  }
}

/**
 * Helper function to create test data sets
 */
export function createTestDataSet(): {
  validNames: string[];
  invalidNames: string[];
  edgeCases: string[];
  internationalNames: string[];
} {
  const validNames = TestUtils.getFirstSanctionedNames(20);

  const invalidNames = [
    'NonExistentName123',
    'FakeTestPerson456',
    'DidNotExistBefore789',
    'ImprovisedNameXYZ',
    'RandomStringABC',
  ];

  const edgeCases = [
    '',
    '   ',
    'a',
    'A',
    'x'.repeat(1000),
    'Name with   multiple   spaces',
    'Name-with-dashes',
    "Name'with'apostrophes",
  ];

  const internationalNames = [
    'José García López',
    'François Müller',
    '李明',
    'Владимир Петров',
    'محمد علي خان',
    'Björn Andersén',
  ];

  return {
    validNames,
    invalidNames,
    edgeCases,
    internationalNames,
  };
}

/**
 * Helper to assert screening results
 */
export function assertScreeningResult(
  name: string,
  shouldBeSanctioned: boolean,
): boolean {
  const result = isSanctioned(name);
  if (result !== shouldBeSanctioned) {
    console.error(
      `Screening assertion failed for "${name}": expected ${shouldBeSanctioned}, got ${result}`,
    );
    return false;
  }
  return true;
}

/**
 * Helper to batch assert results
 */
export function assertBatchScreening(
  testCases: { name: string; shouldBeSanctioned: boolean }[],
): { total: number; passed: number; failed: number } {
  let passed = 0;

  testCases.forEach(({ name, shouldBeSanctioned }) => {
    if (assertScreeningResult(name, shouldBeSanctioned)) {
      passed++;
    }
  });

  return {
    total: testCases.length,
    passed,
    failed: testCases.length - passed,
  };
}

export default TestUtils;

