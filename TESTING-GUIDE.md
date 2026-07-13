# Testing Guide and Checklist for AML Sanctions Screening App

## Pre-Test Setup Checklist

- [ ] Ensure `node_modules` are installed: `npm install`
- [ ] Verify JSON data files are present in `assets/sanctions/`
  - [ ] `full-xsd-names.json`
  - [ ] `sdn-names.json`
  - [ ] `uk-sanctions-names.json`
- [ ] Confirm `sanctions-data.ts` is properly configured
- [ ] Check TypeScript configuration is correct
- [ ] Verify Jest is installed: `npm list jest`

## Running Tests

### Quick Test Run
```bash
npm test
```

### Comprehensive Test with Coverage
```bash
npm test -- --coverage
```

### Watch Mode (for development)
```bash
npm test -- --watch
```

### Specific Test File
```bash
npm test sanctions-data.test.ts
npm test App.test.tsx
npm test screening-scenarios.test.ts
```

### Detailed Verbose Output
```bash
npm test -- --verbose
```

### Generate Coverage Report
```bash
npm test -- --coverage --coverageReporters=html
```
Open `coverage/lcov-report/index.html` to view detailed coverage report.

## Test Categories and What They Verify

### Unit Tests (sanctions-data.test.ts)
**What it tests**: Core screening logic

✅ **Validates**:
- Database loads correctly
- Exact matching works (not partial)
- Case-insensitive matching
- Whitespace handling
- Performance (1000 lookups < 1 second)
- Edge cases (special characters, unicode, long strings)

**Run**: `npm test sanctions-data.test.ts`

### Integration Tests (App.test.tsx)
**What it tests**: React Native UI component

✅ **Validates**:
- App renders correctly
- Title displays
- Input field is present
- Button is interactive
- Component stability
- Theme support

**Run**: `npm test App.test.tsx`

### Real-World Scenarios (screening-scenarios.test.ts)
**What it tests**: Practical use cases

✅ **Validates**:
- Common name variations (first name, last name, full name)
- International names (diacritics, different scripts)
- User input errors (whitespace, case sensitivity)
- Compliance requirements
- Database integrity
- Performance under load
- Monthly data update compatibility

**Run**: `npm test screening-scenarios.test.ts`

## Expected Test Results

All tests should **PASS** with output similar to:

```
PASS  __tests__/sanctions-data.test.ts
  Sanctions Data Module
    ✓ allSanctionedNames should be a Set
    ✓ allSanctionedNames should not be empty
    ✓ isSanctioned returns boolean for all inputs
    ... (more tests)

PASS  __tests__/App.test.tsx
  App Component
    ✓ renders correctly
    ✓ renders the title "AML Sanctions Screening"
    ... (more tests)

PASS  __tests__/screening-scenarios.test.ts
  Real-World AML Screening Scenarios
    ✓ should handle first name only searches
    ✓ should handle international names
    ... (more tests)

Test Suites: 3 passed, 3 total
Tests:       150+ passed, 150+ total
Coverage:    70-90% of statements
```

## Coverage Targets

| Metric | Target | Status |
|--------|--------|--------|
| Statements | 70%+ | ✅ |
| Branches | 70%+ | ✅ |
| Functions | 70%+ | ✅ |
| Lines | 70%+ | ✅ |

## Continuous Integration Checklist

Before committing code:

- [ ] Run `npm test` - all tests pass
- [ ] Check `npm test -- --coverage` - coverage meets thresholds
- [ ] Run `npm run lint` - no linting errors
- [ ] Test in watch mode - no failures on file changes
- [ ] Verify performance tests pass - no timeout failures

## Debugging Failed Tests

### If tests fail to run:

1. **Check Node/npm versions**
   ```bash
   node --version  # Should be >=20
   npm --version
   ```

2. **Clear Jest cache**
   ```bash
   npm test -- --clearCache
   ```

3. **Verify dependencies**
   ```bash
   npm install
   ```

4. **Check file paths**
   - Confirm test files are in `__tests__/` directory
   - Confirm JSON files are in `assets/sanctions/` directory

### If specific test fails:

1. **Run single test file**
   ```bash
   npm test sanctions-data.test.ts -- --verbose
   ```

2. **Run specific test**
   ```bash
   npm test -- --testNamePattern="isSanctioned Function"
   ```

3. **Check test output** for specific assertion failures

4. **Debug in Node**
   ```bash
   node --inspect-brk node_modules/.bin/jest --runInBand
   ```

### If performance test fails:

1. Check system resource usage
2. Verify JSON file sizes haven't grown unexpectedly
3. Run test multiple times to rule out temporary slowness
4. Profile with Node inspector if needed

## Test Maintenance

### Monthly (After Data Updates)

- [ ] Run full test suite
- [ ] Verify coverage hasn't decreased
- [ ] Update performance baselines if needed
- [ ] Check for any new edge cases in data

### Quarterly

- [ ] Review test coverage gaps
- [ ] Update test documentation
- [ ] Add tests for any new features
- [ ] Remove tests for deprecated code

### Yearly

- [ ] Audit test quality and coverage
- [ ] Consider new testing tools
- [ ] Update performance baselines
- [ ] Plan test enhancements

## Performance Benchmarks

These should complete within specified times:

| Test | Target Time | Purpose |
|------|------------|---------|
| Single lookup | < 1ms | Real-time responsiveness |
| 100 lookups | < 100ms | Batch processing |
| 1000 lookups | < 1000ms | Load testing |
| App render | < 500ms | UI responsiveness |
| Full test suite | < 30s | CI/CD integration |

## Test Data Notes

- Test uses actual JSON files from `assets/sanctions/`
- Includes ~34,000+ names from three sources:
  - Full XSD Names (OFAC, UN, EU, etc.)
  - UK Sanctions List
  - SDN List (US Treasury)
- Monthly updates require re-running tests with new data

## Accessibility Testing

While automated tests cover core functionality, manual testing should verify:

- [ ] App is usable with screen readers
- [ ] Text is readable (sufficient contrast)
- [ ] Touch targets are large enough (44pt minimum)
- [ ] Input fields have proper labels
- [ ] Error messages are clear

## Security Testing Considerations

- [ ] No sensitive data logged in tests
- [ ] Database access is read-only
- [ ] No network requests in tests
- [ ] No hardcoded credentials
- [ ] Input validation prevents injection

## Success Criteria

✅ All tests pass  
✅ Coverage above 70% threshold  
✅ Performance benchmarks met  
✅ No warnings or deprecations  
✅ Clean console output  

---

## Quick Reference Commands

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch

# Specific file
npm test sanctions-data

# Verbose output
npm test -- --verbose

# Clear cache
npm test -- --clearCache

# Single test
npm test -- --testNamePattern="test name"

# Update snapshots (if using)
npm test -- -u

# Exit on first failure
npm test -- --bail

# Max workers
npm test -- --maxWorkers=4
```

## Additional Resources

- [Jest Documentation](https://jestjs.io/)
- [React Test Renderer](https://reactjs.org/docs/test-renderer.html)
- [Testing Best Practices](https://jestjs.io/docs/tutorial-react-native)
- Project: `TEST-DOCUMENTATION.md`

---

**Last Updated**: January 15, 2026
**Version**: 1.0.0

