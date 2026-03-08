# Components Documentation

## BasicModeForm Component

### Overview
The BasicModeForm component provides a simple interface for users to input story prompts in basic mode.

### Files Created
- `BasicModeForm.tsx` - Main component implementation
- `BasicModeForm.test.tsx` - Unit tests
- `BasicModeForm.property.test.tsx` - Property-based tests
- `BasicModeForm.css` - Component styling

### Features Implemented

#### Component Features (Requirements 1.1, 1.2, 1.3, 1.4, 1.5)
- ✅ Text area for prompt input with no character limits
- ✅ Form submission handler with validation
- ✅ Error display for empty/whitespace inputs
- ✅ Error clearing when user corrects input
- ✅ Submit button with proper event handling
- ✅ Accessibility features (labels, ARIA attributes)
- ✅ Initial value support for data preservation
- ✅ onChange callback for real-time data preservation

#### Unit Tests (Task 5.2)
- ✅ Component renders with text area
- ✅ Component renders with submit button
- ✅ Form submission with valid input
- ✅ Validation error display for empty input
- ✅ Validation error display for whitespace-only input
- ✅ Error clearing when user corrects input
- ✅ Initial value usage

#### Property-Based Tests (Task 5.1)
- ✅ Property 1: Input acceptance without limits
  - Tests that any string input, regardless of length, is accepted and stored
  - Validates Requirements 1.3
  - Runs 100 iterations with randomly generated strings

### Usage

```tsx
import { BasicModeForm } from './components/BasicModeForm';
import { BasicInput } from './types';

function MyComponent() {
  const [savedData, setSavedData] = useState('');

  const handleSubmit = (input: BasicInput) => {
    console.log('User submitted:', input.prompt);
    // Process the input
  };

  return (
    <BasicModeForm 
      onSubmit={handleSubmit}
      initialValue={savedData}
      onChange={(value) => setSavedData(value)}
    />
  );
}
```

---

## ModeSelector Component

### Overview
The ModeSelector component provides tab-based navigation for switching between basic and advanced input modes.

### Files Created
- `ModeSelector.tsx` - Main component implementation
- `ModeSelector.test.tsx` - Unit tests
- `ModeSelector.css` - Component styling

### Features Implemented

#### Component Features (Requirements 2.1)
- ✅ Tab interface for mode switching
- ✅ Visual indication of current mode
- ✅ Click handlers for mode changes
- ✅ Accessibility features (ARIA roles, labels, selected states)
- ✅ Keyboard navigation support
- ✅ Visual feedback on hover and active states

#### Unit Tests
- ✅ Renders both mode tabs
- ✅ Highlights the current mode
- ✅ Calls onModeChange when basic mode tab is clicked
- ✅ Calls onModeChange when advanced mode tab is clicked
- ✅ Has proper ARIA attributes for accessibility

### Usage

```tsx
import { ModeSelector } from './components/ModeSelector';
import { FormMode } from './types';

function MyComponent() {
  const [currentMode, setCurrentMode] = useState<FormMode>('basic');

  return (
    <ModeSelector 
      currentMode={currentMode} 
      onModeChange={setCurrentMode} 
    />
  );
}
```

---

## Running Tests

Once Node.js is installed and dependencies are set up:

```bash
# Run all tests
npm test

# Run only specific component tests
npm test -- BasicModeForm
npm test -- ModeSelector

# Run in watch mode
npm test:watch
```

## Integration

All components have been integrated into the main App.tsx component with full mode switching and data preservation functionality.
