# Dark Theme Audit - Contrast and Readability Issues

**Date:** December 29, 2025
**Severity:** High - Multiple readability issues in dark mode
**Status:** AUDIT COMPLETE - Issues Identified and Fixes Planned

---

## Issues Found

### 1. Weather Widget - CRITICAL ⚠️

**File:** `app/components/weather/booking-weather-card.tsx`

**Problem:** Weather detail boxes use light backgrounds with light gray text

- **Lines 118-155:** Weather details (Temperature, Wind, Waves, Rain)
  - Background: `bg-slate-50` (very light gray)
  - Label text: `text-muted-foreground` (medium gray)
  - Contrast in dark mode: **FAILS** - light gray on light background

- **Lines 47, 54, 61:** Safety status boxes
  - Background: `bg-red-50`, `bg-yellow-50`, `bg-green-50` (light tinted)
  - Text: `text-red-700`, `text-yellow-700`, `text-green-700`
  - Contrast in dark mode: **MARGINAL** - depends on theme implementation

- **Line 160:** Recommendation message
  - Background: `bg-gray-50` (very light)
  - Text: `text-muted-foreground` (gray)
  - Contrast in dark mode: **FAILS** - unreadable

**Root Cause:** Using light theme colors that don't adapt to dark mode. Should use `dark:` utilities or theme-aware colors.

---

### 2. Selected Boat Widget - HIGH 🔴

**File:** `app/(mobile)/quick-book/page.tsx` (Line 818)

**Problem:** Selected boat has poor contrast in dark mode

```typescript
className={`... ${
  selectedBoat === boat.boat_id
    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'  // ← PROBLEM
    : ...
}`}
```

- **Background:** `bg-blue-50` (very light blue)
- **Text:** Uses default text colors designed for light backgrounds
- **Contrast:** **FAILS** - light blue background with gray text is unreadable
- **Ring:** `ring-blue-200` (light blue) on light background = invisible

**Root Cause:** Light blue background without considering dark mode theme

---

## Detailed Analysis

### Weather Widget Analysis

**Current Structure:**
```
Weather Forecast (Card)
├── Safety Status Box
│   ├── bg-[color]-50 (light: red/yellow/green)
│   └── text-[color]-700 (dark color text)
├── Weather Details Grid
│   ├── Temperature: bg-slate-50 + text-muted-foreground
│   ├── Wind: bg-slate-50 + text-muted-foreground
│   ├── Waves: bg-slate-50 + text-muted-foreground
│   └── Rain: bg-slate-50 + text-muted-foreground
└── Recommendation Box
    ├── bg-gray-50
    ├── text-muted-foreground
    └── emoji + message
```

**Problems:**
1. All detail boxes use `bg-slate-50` which is visually light on both light AND dark themes
2. Labels use `text-muted-foreground` which is medium-gray - wrong contrast on light backgrounds
3. Safety boxes (bg-*-50) look fine on light mode but clash in dark mode
4. No dark mode utilities to adapt colors

---

### Boat Selection Analysis

**Current Structure:**
```
Boat Selection
├── Unselected: border-gray-200 + bg-gray-50
├── Selected: border-blue-500 + bg-blue-50 + ring-2 ring-blue-200
├── Too Small: border-orange-200 + bg-orange-50
└── Error: border-red-200
```

**Problems:**
1. `bg-blue-50` is extremely light - almost invisible on dark background
2. Ring color `ring-blue-200` is also light - not visible on dark theme
3. Selected state doesn't provide enough visual feedback
4. Text colors (semibold/muted-foreground) not adjusted for dark background

---

## Contrast Requirements (WCAG)

**Normal text:** Minimum 4.5:1 ratio
**Large text (18pt+):** Minimum 3:1 ratio

**Current Issues:**
- Light gray text on light background: ~1.5:1 ❌
- Light blue background in dark theme: Fails on all text

---

## Solution Strategy

### Approach 1: Use Tailwind Dark Mode Utilities (Recommended)

```typescript
// Weather Widget - Fix
<div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
  <p className="text-xs text-muted-foreground dark:text-slate-300 mb-1">
    Temperature
  </p>
  <p className="text-lg font-semibold text-foreground">
    {temperature}°C
  </p>
</div>
```

**Advantages:**
- Explicit dark mode control
- WCAG compliant contrast ratios
- Consistent with theme

### Approach 2: Use Theme-Aware Colors from UI System

```typescript
// Use bg-muted instead of bg-slate-50
<div className="bg-muted p-3 rounded-lg">
  <p className="text-xs text-muted-foreground mb-1">Temperature</p>
  <p className="text-lg font-semibold">
    {temperature}°C
  </p>
</div>
```

**Advantages:**
- Automatically adapts to current theme
- Less code changes
- Consistent with design system

### Approach 3: Use Conditional Styling Based on Theme

```typescript
import { useTheme } from 'next-themes'

const { theme } = useTheme()
const bgColor = theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'
```

**Disadvantages:**
- More complex
- Client-side only
- Not recommended

---

## Recommended Fixes

### Weather Widget Fixes

1. **Weather Detail Boxes:**
   - Change `bg-slate-50` to `bg-muted`
   - Change `text-muted-foreground` to `text-muted-foreground` (for labels - keep as is)
   - Add `dark:text-slate-300` for better contrast in dark mode

2. **Safety Status Boxes:**
   - Add dark mode variants: `dark:bg-red-950`, `dark:bg-yellow-950`, `dark:bg-green-950`
   - Adjust text colors: `dark:text-red-200`, `dark:text-yellow-200`, `dark:text-green-200`

3. **Recommendation Box:**
   - Change `bg-gray-50` to `bg-muted`
   - Change `text-muted-foreground` to `text-foreground`

### Boat Selection Fixes

1. **Selected State:**
   - Change `bg-blue-50` to `bg-blue-100 dark:bg-blue-950`
   - Change `ring-blue-200` to `ring-blue-300 dark:ring-blue-700`
   - Ensure text remains readable with adjusted colors

2. **Unselected States:**
   - Change `bg-gray-50` to `bg-muted`
   - Add dark mode variants if needed

---

## Files to Modify

| File | Issue | Severity | Fix |
|------|-------|----------|-----|
| `app/components/weather/booking-weather-card.tsx` | Light backgrounds + gray text | HIGH | Add dark mode utilities |
| `app/(mobile)/quick-book/page.tsx` | Selected boat blue background | CRITICAL | Use darker blues in dark mode |

---

## Testing Checklist

- [ ] Weather widget readable in light mode
- [ ] Weather widget readable in dark mode
- [ ] Weather detail numbers visible in dark mode
- [ ] Safety status colors work in both modes
- [ ] Boat selection state clear in light mode
- [ ] Boat selection state clear in dark mode
- [ ] Selected boat ring visible in dark mode
- [ ] All text passes WCAG AA contrast requirements

---

## Additional Audit Needed

Check these components for similar dark mode issues:
- [ ] Dashboard cards
- [ ] Form inputs with custom styling
- [ ] Modal dialogs
- [ ] Status badges
- [ ] Navigation components
- [ ] Table components
- [ ] Report cards
- [ ] Fleet management cards

---

## Impact Assessment

**Users Affected:** Anyone using dark theme for quick booking or weather checking
**Severity:** High - Critical readability issues
**Effort to Fix:** Low - CSS changes only
**Testing:** Visual inspection in both light and dark modes

---

## Next Steps

1. ✅ Audit complete
2. → Fix weather widget
3. → Fix boat selection
4. → Test in both themes
5. → Search for additional issues
6. → Document best practices

---

*Audit Generated: December 29, 2025*
*Status: Ready for Implementation*
