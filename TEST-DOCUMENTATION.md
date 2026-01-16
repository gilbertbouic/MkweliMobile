# AML Sanctions Screening App - Test Suite Documentation

## Overview

This document describes the comprehensive test suite for the MkweliMobile AML sanctions screening application. The tests verify the correctness, performance, and reliability of the sanctions screening logic.

## Test Files

### 1. `__tests__/sanctions-data.test.ts`
**Purpose**: Unit tests for the core sanctions data module and `isSanctioned()` function.

**Test Categories**:

#### Data Loading Tests
- Verifies that `allSanctionedNames` is a Set
- Confirms the database is not empty
- Validates data is properly imported from all three JSON sources

#### Exact Matching Logic Tests
- Tests empty string handling
- Tests null/undefined input handling
- Tests whitespace trimming
- Tests case-insensitive matching
- Verifies exact matching (not partial)

#### Dataset Verification Tests
- Validates sample names from the dataset are correctly identified
- Tests various case variations
- Tests handling of names with extra whitespace

#### Non-Sanctioned Names Tests
- Verifies non-existent names return false
- Tests that partial name matches don't work
- Tests that extra characters prevent matching

#### Performance Tests
- 1000 lookups should complete in < 1 second
- 10 batch lookups should complete in < 100ms

#### Integration Tests
- Tests realistic user input scenarios
- Verifies consistent results across multiple calls

#### Edge Cases
- Very long names (10,000 characters)
- Special characters and symbols
- Unicode characters (Chinese, Russian, Arabic, etc.)
- Empty and whitespace-only strings

### 2. `__tests__/App.test.tsx`
**Purpose**: Integration tests for the React Native UI component.

**Test Categories**:

#### Rendering Tests
- Verifies the app renders without errors
- Checks for presence of title text
- Validates initial instructions are displayed

#### User Input Handling Tests
- Verifies TextInput component is rendered
- Confirms Screen button is present

#### UI Responsiveness Tests
- Validates StatusBar and SafeAreaView components
- Tests component structure consistency

#### Theme Support Tests
- Verifies dark and light mode support

#### Performance and Stability Tests
- Tests rapid mounting/unmounting cycles
- Validates stability during multiple rerenders

### 3. `__tests__/screening-scenarios.test.ts`
**Purpose**: Real-world AML screening scenarios and edge cases.

**Test Categories**:

#### Common Name Variations
- First name only searches
- Last name only searches
- Full name searches
- Names with middle initials
- Names with suffixes (Jr., Sr., PhD, etc.)

#### International Names
- Names with diacritical marks (é, ü, ø, etc.)
- Names from different writing systems (Chinese, Arabic, Cyrillic)
- Hyphenated names
- Names with apostrophes

#### Malformed/Unusual Input
- Extra whitespace handling
- Names with numbers
- Special characters
- Very short queries
- Very long queries

#### Compliance Requirements
- Always returns boolean result
- Provides consistent results across multiple calls
- Handles null/undefined safely

#### Database Integrity
- Consistent database size
- No duplicate entries
- Database not modified during lookups
- Mixed case name support

#### Performance Under Load
- Rapid sequential lookups
- Diverse query handling

#### User Experience
- Accidental whitespace handling
- Case-insensitive input handling
- Similar name behavior

#### Data Update Compatibility
- Supports monthly data updates
- Maintains lookup performance with large datasets

## Running the Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test File
```bash
npm test sanctions-data.test.ts
npm test App.test.tsx
npm test screening-scenarios.test.ts
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

### Run Tests with Verbose Output
```bash
npm test -- --verbose
```

## Test Coverage Goals

- **Sanctions Data Module**: 100% coverage
  - All code paths in `isSanctioned()` function
  - Data loading verification
  - Edge cases and error handling

- **UI Component**: >80% coverage
  - Component rendering
  - User interaction handlers
  - State management

- **Real-world Scenarios**: Comprehensive coverage
  - Common user inputs
  - International names
  - Edge cases and malformed inputs

## Key Testing Principles

### 1. Exact Matching Verification
Tests confirm that the screening logic uses **exact matching**, not partial:
- "John Smith" matches only "John Smith"
- "John" does not match "John Smith"
- Extra characters prevent matching

### 2. Case-Insensitive Matching
All tests verify case-insensitive matching:
- "JOHN SMITH" matches "john smith"
- "John Smith" matches "JOHN SMITH"

### 3. Whitespace Handling
Tests verify proper whitespace trimming:
- "  John Smith  " matches "John Smith"
- "John    Smith" (with extra spaces) is handled properly

### 4. Performance Standards
- 1000 lookups should complete in < 1 second
- Single lookups should be nearly instantaneous

### 5. Consistency Requirements
- Same input always produces same output
- Database is not modified during lookups
- No race conditions or state issues

### 6. Compliance Safety
- Always returns a boolean (true/false)
- Never crashes on malformed input
- Handles null/undefined gracefully

## Monthly Data Update Testing

When updating sanctions data monthly:

1. **Data Validation**: Run full test suite before deploying
   ```bash
   npm test -- --coverage
   ```

2. **Performance Baseline**: Verify lookup speed
   ```bash
   npm test screening-scenarios.test.ts -- --verbose
   ```

3. **Integrity Check**: Confirm no data corruption
   ```bash
   npm test sanctions-data.test.ts
   ```

4. **Integration Test**: Full app functionality
   ```bash
   npm test
   ```

## Continuous Integration

The test suite is designed for CI/CD pipelines:

- **Exit Code**: Returns 0 on success, non-zero on failure
- **Coverage Reports**: Can be generated and tracked
- **Performance Metrics**: Baseline performance tracking
- **Automated Checks**: Pre-commit hook compatible

## Troubleshooting Tests

### Test Timeouts
If tests timeout, increase Jest timeout:
```javascript
jest.setTimeout(10000); // 10 seconds
```

### Module Not Found
Ensure JSON files are properly converted and located in `assets/sanctions/`

### Performance Test Failures
If performance tests fail:
1. Check system load
2. Verify JSON file sizes
3. Check for memory leaks

## Future Enhancements

1. **Snapshot Testing**: Add UI snapshot tests
2. **E2E Testing**: Add end-to-end tests with Detox
3. **Memory Profiling**: Monitor memory usage during extended sessions
4. **Network Testing**: Add tests for future API integration
5. **Accessibility Testing**: Add a11y verification tests

## Test Maintenance

- Review tests after each data update
- Update performance baselines as dataset grows
- Add tests for new features
- Remove tests for deprecated functionality
- Keep test documentation updated

## Dependencies

- `jest`: Testing framework
- `react-test-renderer`: React component testing
- `@types/jest`: TypeScript support for Jest
- `@types/react-test-renderer`: Type definitions

These are already included in `package.json` and installed via `npm install`.

## Success Criteria

All tests should pass with:
- ✅ Zero test failures
- ✅ >80% code coverage
- ✅ All performance benchmarks met
- ✅ Consistent results across runs

---

**Last Updated**: January 15, 2026
**Test Suite Version**: 1.0.0

