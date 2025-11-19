# Accessibility Improvements

This document outlines the comprehensive accessibility improvements made to Crosswordly to ensure the game is fully navigable via keyboard and compatible with screen readers.

## Summary

All interactive elements now support keyboard navigation, have proper ARIA attributes, and follow WCAG 2.1 AA standards for accessibility.

## Key Improvements

### 1. Keyboard Navigation

#### Game Screen (Drag & Drop Mode)

- **Word Cards**: Fully keyboard accessible
  - `Tab`: Navigate between word cards
  - `Enter/Space`: Select a word card
  - `Escape`: Deselect selected word
  - Selected word can be placed using `Enter` key (places on first available slot)

#### Crossword Puzzle Screen (Typing Mode)

- **Grid Cells**: All cells are keyboard navigable buttons
  - `Tab`: Navigate between cells
  - `Enter/Space`: Select a cell to start typing
  - `Arrow keys`: Type letters (handled by useKeyboardInput hook)
  - `Backspace`: Delete letters

### 2. ARIA Attributes & Semantic HTML

#### WordCard Component (`src/components/game/WordCard.tsx`)

- `aria-label`: Dynamic label indicating word state ("Select word..." or "Placed word...")
- `aria-pressed`: Indicates selection state
- `aria-disabled`: Indicates locked state
- `disabled`: Proper HTML disabled attribute
- `tabIndex`: -1 for locked words, 0 for available words

#### DirectionCard Component (`src/components/game/DirectionCard.tsx`)

- `role="region"`: Semantic region for across/down clues
- `aria-label`: Descriptive label for the clue section
- `role="list"` and `role="listitem"`: Proper list semantics

#### CrosswordCell Component (`src/components/shared/CrosswordCell.tsx`)

- Changed from `<div>` to `<button>` for proper keyboard interaction
- `role="gridcell"`: ARIA gridcell role
- `aria-label`: Comprehensive label with position, clue number, letter, and state
- `aria-selected`: Indicates if cell is part of selected word
- `tabIndex={0}`: Makes all playable cells keyboard focusable
- `onKeyDown`: Handles Enter/Space key activation

#### CrosswordBoard Component (`src/components/shared/CrosswordBoard.tsx`)

- `role="grid"`: ARIA grid role
- `aria-label`: Descriptive label for the crossword grid
- `aria-rowcount` and `aria-colcount`: Grid dimensions for screen readers

### 3. Skip Links

Created `SkipLinks` component (`src/components/shared/SkipLinks.tsx`) that provides:

- "Skip to main content" link
- "Skip to word bank" link
- Links are visually hidden but appear on focus
- Allows keyboard users to bypass navigation and jump to key sections

### 4. Semantic Landmarks

#### GameScreen (`src/components/game/GameScreen.tsx`)

- `<nav id="word-bank" aria-label="Available words">`: Word selection areas
- `<main id="main-content">`: Game board area
- `<aside aria-label="Word clues">`: Clue sections

### 5. Visual Feedback

Added keyboard help text that appears when a word is selected:

- Displays: "Keyboard: Tab to navigate, Enter to place selected word, Escape to deselect"
- Uses `role="status"` and `aria-live="polite"` for screen reader announcements
- Appears in both GameScreen and CrosswordPuzzleScreen

### 6. Focus Management

- All interactive elements have visible focus indicators (browser default styles)
- Tab order follows logical visual flow
- Focus is not trapped inappropriately
- Keyboard navigation works consistently across desktop and mobile

## Translation Support

Added accessibility-related translations in `src/i18n/locales/en.json`:

```json
"game": {
  "keyboardHelp": "Keyboard: Tab to navigate, Enter to place selected word, Escape to deselect"
},
"accessibility": {
  "skipToContent": "Skip to main content",
  "skipToWordBank": "Skip to word bank"
}
```

## Files Modified

1. `src/components/game/WordCard.tsx` - Added ARIA attributes and keyboard support
2. `src/components/game/DirectionCard.tsx` - Added ARIA landmarks and roles
3. `src/components/game/GameScreen.tsx` - Added keyboard navigation, skip links, semantic HTML
4. `src/components/shared/CrosswordCell.tsx` - Changed to button, added ARIA attributes
5. `src/components/shared/CrosswordBoard.tsx` - Added grid role and ARIA attributes
6. `src/components/shared/CrosswordPuzzleScreen.tsx` - Added keyboard help text
7. `src/components/shared/SkipLinks.tsx` - NEW: Skip navigation component
8. `src/i18n/locales/en.json` - Added accessibility translations

## Testing Recommendations

### Manual Keyboard Testing

1. Navigate through the game using only `Tab` and `Shift+Tab`
2. Verify all interactive elements are reachable
3. Test word placement using `Enter` key
4. Verify `Escape` key deselects words
5. Test skip links by pressing `Tab` on page load

### Screen Reader Testing

- Test with NVDA (Windows), JAWS (Windows), or VoiceOver (Mac)
- Verify all ARIA labels are announced correctly
- Verify grid navigation is understandable
- Verify word state changes are announced

### Browser Testing

- Chrome/Edge (Chromium)
- Firefox
- Safari
- Mobile Safari (iOS)
- Chrome Mobile (Android)

## WCAG 2.1 Compliance

These improvements help meet the following WCAG 2.1 Level AA success criteria:

- **2.1.1 Keyboard (Level A)**: All functionality available via keyboard
- **2.1.2 No Keyboard Trap (Level A)**: Users can navigate away from any component
- **2.4.1 Bypass Blocks (Level A)**: Skip links provided
- **2.4.3 Focus Order (Level A)**: Logical tab order
- **2.4.7 Focus Visible (Level AA)**: Visible focus indicators
- **3.2.4 Consistent Identification (Level AA)**: Consistent ARIA labels
- **4.1.2 Name, Role, Value (Level A)**: All UI components have accessible names
- **4.1.3 Status Messages (Level AA)**: Keyboard help uses aria-live

## Future Enhancements

Consider these additional accessibility improvements:

1. Add keyboard shortcuts (e.g., arrow keys to navigate grid)
2. High contrast mode support
3. Customizable focus indicator styles
4. Sound effects toggle for audio feedback
5. Reduced motion support for animations
6. Screen reader optimizations for drag-and-drop preview
