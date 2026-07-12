#!/usr/bin/env node
// Dependency-free WCAG 2.1 text-contrast gate for the app's design tokens.
//
// Why a standalone script: the axe test runs in jsdom, which cannot compute
// rendered colours, so axe's `color-contrast` rule is disabled there. This
// script evaluates the actual foreground/background pairs used in the CSS and
// fails (exit 1) if any text pair drops below its WCAG AA threshold.
//
// Run: npm run a11y:contrast

const hex = (h) => {
  h = h.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
};
const channel = (c) => {
  c /= 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const luminance = (rgb) => 0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2]);
const ratio = (fg, bg) => {
  const a = luminance(hex(fg));
  const b = luminance(hex(bg));
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
};

// [foreground, background, isLargeText, description]
// Large text = >= 18.66px bold OR >= 24px (AA threshold 3:1); else 4.5:1.
const PAIRS = [
  ['#4b5563', '#ffffff', false, 'muted body copy on panels'],
  ['#4b5563', '#edeff2', false, 'muted copy on app background'],
  ['#374151', '#e8eaed', false, 'inactive toolbar tab label'],
  ['#4b5563', '#e8eaed', false, 'toolbar date text'],
  ['#5b6470', '#edeff2', false, 'sidebar NAVIGATION heading'],
  ['#4b5563', '#e0e4ea', false, 'sidebar shortcut badge'],
  ['#14532d', '#d9efe1', false, 'Patient role badge'],
  ['#9a4b46', '#fde7ea', false, 'emergency phone number'],
  ['#6b7280', '#ffffff', false, 'input placeholder text'],
  ['#b45309', '#fdf4d8', false, 'Medication type badge'],
  ['#0f766e', '#d9f0ec', false, 'Activity type badge'],
  ['#146c2e', '#e3f3ea', false, 'Taken status badge (green ink on green bg)'],
  ['#146c2e', '#ffffff', false, 'green ink on white'],
  ['#6d28d9', '#efe7fb', false, 'Appointment type badge'],
  ['#be185d', '#fce7f0', false, 'Social type badge'],
  ['#12622a', '#c9e8d2', false, 'adherence ✓ glyph on taken cell'],
  ['#8a1c24', '#f6d1d6', false, 'adherence ✕ glyph on missed cell'],
  ['#5b6470', '#eceef1', false, 'adherence · glyph on pending cell'],
  ['#cdd8e8', '#143059', false, 'menu-bar links on brand bar'],
];

let failures = 0;
console.log('WCAG AA text-contrast check\n');
console.log('ratio  need  result  pair');
for (const [fg, bg, large, desc] of PAIRS) {
  const r = ratio(fg, bg);
  const need = large ? 3.0 : 4.5;
  const ok = r >= need;
  if (!ok) failures += 1;
  console.log(`${r.toFixed(2).padStart(5)}  ${need.toFixed(1)}   ${ok ? 'PASS' : 'FAIL'}    ${fg} on ${bg} — ${desc}`);
}

console.log('');
if (failures > 0) {
  console.error(`✗ ${failures} contrast failure(s). Fix the colours above.`);
  process.exit(1);
}
console.log('✓ All text pairs meet WCAG AA.');
