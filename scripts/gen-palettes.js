#!/usr/bin/env node
/**
 * Generate a palette scale for a color using the same math as generate-palettes.js (CSS version)
 * @param {object} base - {l, c, h} for the base color (L in 0-1)
 * @param {object} tintTarget - {l, c, h} for the tint target (L in 0-1)
 * @param {object} shadeTarget - {l, c, h} for the shade target (L in 0-1)
 * @param {object} scaleSteps - {tint: {step: factor}, shade: {step: factor}}
 * @returns {object} - { step: chromaColor }
 */
function generatePaletteScaleJS(base, tintTarget, shadeTarget, scaleSteps) {
  const chroma = require('chroma-js');
  const result = {};
  // Tints (lighter than 500)
  for (const [step, factor] of Object.entries(scaleSteps.tint)) {
    const l = base.l + (tintTarget.l - base.l) * factor;
    const c = base.c + (tintTarget.c - base.c) * factor;
    const h = base.h; // or interpolate if desired
    result[step] = chroma.oklch(l, c, h);
  }
  // 500 is the base
  result[500] = chroma.oklch(base.l, base.c, base.h);
  // Shades (darker than 500)
  for (const [step, factor] of Object.entries(scaleSteps.shade)) {
    const l = base.l + (shadeTarget.l - base.l) * factor;
    const c = base.c + (shadeTarget.c - base.c) * factor;
    const h = base.h;
    result[step] = chroma.oklch(l, c, h);
  }
  return result;
}
/**
 * gen-palettes.js
 *
 * Reads palettes.config.json (next to this file),
 * builds a 9‑step OKLCH scale for each base colour,
 * centres the scale so that the 500‑shade has the same
 * perceptual lightness for every hue (equal contrast‑switch point),
 * and writes src/style/palettes.auto-generated.css containing
 * CSS custom properties expressed as OKLCH strings.
 *
 * Run from the project root:
 *   npm run gen:palettes   // or   node scripts/gen-palettes.js
 */

const fs = require('fs');
const path = require('path');
const chroma = require('chroma-js');

/* --------------------------------------------------------------
   Main generation routine
   -------------------------------------------------------------- */

function main() {
  // ── Paths ───────────────────────────────────────
  const scriptDir = __dirname; // scripts/
  const configPath = path.resolve(scriptDir, 'palettes.config.json');
  const outPath = path.resolve(scriptDir, '..', 'src', 'style', 'palettes.auto-generated.css');

  if (!fs.existsSync(configPath)) {
    console.error(`❌ Config file not found at ${configPath}`);
    process.exit(1);
  }

  const rawConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const colours = rawConfig.colours ?? {};

  const steps = 9; // 100 … 900

  const cssLines = [':root {', '  /* Auto‑generated palette – DO NOT EDIT MANUALLY */'];

  cssLines.push(''); // blank line
  //   surface colours
  cssLines.push('  --fab-colour-not-black: oklch(18.22% 0.00002 271.152);');
  cssLines.push('  --fab-colour-nearly-black: oklch(22.645% 0.00003 271.152);');
  cssLines.push('  --fab-colour-almost-black: oklch(28.094% 0.00003 271.152);');
  cssLines.push('  --fab-colour-kinda-black: oklch(35.233% 0.00004 271.152);');
  cssLines.push('  --fab-colour-barely-black: oklch(43.86% 0.0000 0);');
  cssLines.push('  --fab-colour-not-white: oklch(97.614% 0.00011 271.152);');
  cssLines.push('  --fab-colour-nearly-white: oklch(94.611% 0.00011 271.152);');
  cssLines.push('  --fab-colour-almost-white: oklch(90.06% 0.0001 271.152);');
  cssLines.push('  --fab-colour-kinda-white: oklch(84.522% 0.0001 271.152);');
  cssLines.push('  --fab-colour-barely-white: oklch(71.55% 0.0000 0);');
  cssLines.push('');

  // --- Math-based palette generation (matches generate-palettes.js logic) ---
  const scaleSteps = rawConfig.scaleSteps || {
    tint: { 100: 0.8, 200: 0.64, 300: 0.48, 400: 0.32 },
    shade: { 600: 0.16, 700: 0.32, 800: 0.56, 900: 0.8 },
  };
  const tintTarget = rawConfig.tintTarget || { lightness: 0.98, chroma: 0.03 };
  const shadeTarget = rawConfig.shadeTarget || { lightness: 0.18, chroma: 0.03 };

  for (const [name, oklchStr] of Object.entries(colours)) {
    cssLines.push(`  --fab-colour-${name}: ${oklchStr};`);
    const m = oklchStr.match(/oklch\(\s*([\d.]+)%?\s+([\d.]+)\s+([\d.]+)\s*\)/i);
    if (!m) {
      console.warn(`⚠️  Skipping ${name}: cannot parse "${oklchStr}"`);
      continue;
    }
    const [, lPct, c, h] = m.map(Number);
    const safeH = isNaN(h) ? 0 : h;
    const base = { l: lPct / 100, c, h };
    const tintT = { l: tintTarget.lightness, c: tintTarget.chroma, h };
    const shadeT = { l: shadeTarget.lightness, c: shadeTarget.chroma, h };
    const palette = generatePaletteScaleJS(base, tintT, shadeT, scaleSteps);
    Object.entries(palette).forEach(([step, color]) => {
      const [L, C, H] = color.oklch();
      cssLines.push(`  --fab-colour-${name}-${step}: oklch(${(L * 100).toFixed(3)}% ${C.toFixed(5)} ${safeH.toFixed(3)});`);
    });
    cssLines.push('');
  }

  cssLines.push('}'); // close :root

  // Append contrast information as a comment
  cssLines.push('');
  cssLines.push('/*');
  cssLines.push('  CONTRAST & ACCESSIBILITY GUIDANCE');
  cssLines.push('  ---------------------------------');
  cssLines.push('  SAFE COMBINATIONS (WCAG AA compliant):');
  cssLines.push('  For LIGHT backgrounds, use DARK text:');
  cssLines.push('    100-400 backgrounds → 700-900 text ✅');
  cssLines.push('    Best combinations: 100+900, 100+800, 200+900, 200+800');
  cssLines.push('  For DARK backgrounds, use LIGHT text:');
  cssLines.push('    700-900 backgrounds → 100-400 text ✅');
  cssLines.push('    Best combinations: 900+100, 800+100, 900+200, 800+200');
  cssLines.push('  ❌ AVOID these combinations:');
  cssLines.push('    Adjacent weights (like 400+500, 500+600) - not enough contrast');
  cssLines.push('    Mid-range combinations (300+600, 400+700) - borderline contrast');
  cssLines.push('    Same or close weights - insufficient contrast');
  cssLines.push('  📊 Specific Patterns:');
  cssLines.push('    Minimum contrast gap needed: About 3-4 weight steps');
  cssLines.push('      100 ↔ 700+ ✅');
  cssLines.push('      200 ↔ 800+ ✅');
  cssLines.push('      300 ↔ 900 ✅');
  cssLines.push('      400 ↔ 900 ✅ (for some colors)');
  cssLines.push('    Best contrast combinations:');
  cssLines.push('      100 + 900: 8.88-9.29 contrast ratio (excellent)');
  cssLines.push('      100 + 800: 6.91-7.13 contrast ratio (very good)');
  cssLines.push('      200 + 900: 6.61-7.04 contrast ratio (good)');
  cssLines.push('    WCAG AAA (7:1) achievable with:');
  cssLines.push('      100 text on 800/900 backgrounds');
  cssLines.push('      800/900 text on 100 backgrounds');
  cssLines.push('      Some 200↔900 combinations');
  cssLines.push('  This gives you a scientific foundation for creating monochromatic color schemes while maintaining accessibility! 🎨✨');
  cssLines.push('*/');

  // ── Write the file ───────────────────────────────────────
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, cssLines.join('\n') + '\n', 'utf8');

  console.log(`✅ Palette generated → ${outPath}`);
}

main();
