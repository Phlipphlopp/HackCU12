# Test Utilities

This directory contains utilities and generators for property-based testing using fast-check.

## Property-Based Testing with fast-check

Property-based testing verifies that universal properties hold across all possible inputs by generating random test cases.

### Basic Usage

```typescript
import * as fc from 'fast-check';

// Example property test
describe('Property Tests', () => {
  it('should satisfy property X', () => {
    fc.assert(
      fc.property(
        fc.string(), // Generator for random strings
        (input) => {
          // Test that property holds for this input
          const result = myFunction(input);
          expect(result).toBeDefined();
        }
      ),
      { numRuns: 100 } // Run 100 iterations minimum
    );
  });
});
```

### Common Generators

- `fc.string()` - Random strings
- `fc.integer()` - Random integers
- `fc.array(generator)` - Random arrays
- `fc.record({ key: generator })` - Random objects
- `fc.boolean()` - Random booleans
- `fc.oneof(gen1, gen2)` - Pick from multiple generators

### Custom Generators

Create custom generators for domain-specific types:

```typescript
// Example: Generate valid plot lines
export const plotLineArbitrary = () =>
  fc.string({ minLength: 1, maxLength: 500 });

// Example: Generate advanced input
export const advancedInputArbitrary = () =>
  fc.record({
    plotLines: fc.array(plotLineArbitrary(), { minLength: 1, maxLength: 10 }),
    characters: fc.string({ minLength: 1 }),
    genre: fc.string({ minLength: 1 }),
    contentType: fc.string({ minLength: 1 }),
  });
```

## Test Tagging

Each property-based test MUST be tagged with a comment referencing the correctness property:

```typescript
/**
 * Feature: ai-script-generator, Property 1: Input acceptance without limits
 * Validates: Requirements 1.3
 */
it('accepts input of any length', () => {
  // test implementation
});
```

## Guidelines

- Run minimum 100 iterations per property test
- Use smart generators that constrain to valid input space
- Avoid mocking when possible - test real functionality
- Tag each test with the property it validates
