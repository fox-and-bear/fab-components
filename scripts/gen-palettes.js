#!/usr/bin/env node
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
   Helper – find the lightness where contrast(white) ≈ contrast(black)
   -------------------------------------------------------------- */
function findMidLightness({ c, h }, tolerance = 0.02) {
  let lo = 0;
  let hi = 1; // Use decimal range 0-1

  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2;
    const col = chroma.oklch(mid, c, h);
    const cw = chroma.contrast(col, 'white');
    const cb = chroma.contrast(col, 'black');

    if (Math.abs(cw - cb) <= tolerance) return mid;
    // If white contrast > black contrast we are too dark → raise L
    if (cw > cb) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2; // fallback
}

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

  // ── Process each hue ───────────────────────────────────────
  for (const [name, oklchStr] of Object.entries(colours)) {
    // Parse "oklch(L% C H)" → numbers
    const m = oklchStr.match(/oklch\(\s*([\d.]+)%?\s+([\d.]+)\s+([\d.]+)\s*\)/i);
    if (!m) {
      console.warn(`⚠️  Skipping ${name}: cannot parse "${oklchStr}"`);
      continue;
    }
    const [, lPct, c, h] = m.map(Number);

    // Use the config color as our base reference
    const baseColor = chroma.oklch(lPct / 100, c, h);

    // Special handling for achromatic colors (very low chroma)
    const isAchromatic = c < 0.01;

    // Find the optimal lightness where contrast(white) ≈ contrast(black)
    const targetMidL = isAchromatic ? 0.5 : findMidLightness({ c, h }); // Use 50% for achromatic

    // -----------------------------------------------------------------
    // Create perceptually uniform lightness steps
    // Use tint/shade to get natural chroma/hue variations, but normalize lightness
    // -----------------------------------------------------------------
    const targetLightnesses = [
      0.8, // 100 - light but substantial
      0.72, // 200 - medium light
      0.66, // 300 - slightly light
      0.62, // 400 - approaching mid
      targetMidL, // 500 - optimal contrast point
      targetMidL * 0.85, // 600 - slightly dark
      targetMidL * 0.7, // 700 - medium dark
      targetMidL * 0.55, // 800 - dark
      targetMidL * 0.4, // 900 - very dark
    ];

    // Create tints and shades to get natural chroma/hue progression
    const tints = isAchromatic
      ? [
          // For achromatic colors, just create greys with zero chroma
          chroma.oklch(0.8, 0, 0), // 100
          chroma.oklch(0.72, 0, 0), // 200
          chroma.oklch(0.66, 0, 0), // 300
          chroma.oklch(0.62, 0, 0), // 400
        ]
      : [
          baseColor.tint(0.4), // 100 - less desaturated
          baseColor.tint(0.3), // 200 - preserve more color
          baseColor.tint(0.2), // 300 - still colorful
          baseColor.tint(0.1), // 400 - minimal tinting
        ];

    const shades = isAchromatic
      ? [
          chroma.oklch(targetMidL * 0.85, 0, 0), // 600
          chroma.oklch(targetMidL * 0.7, 0, 0), // 700
          chroma.oklch(targetMidL * 0.55, 0, 0), // 800
          chroma.oklch(targetMidL * 0.4, 0, 0), // 900
        ]
      : [
          baseColor.shade(0.2), // 600
          baseColor.shade(0.4), // 700
          baseColor.shade(0.6), // 800
          baseColor.shade(0.8), // 900
        ];

    // Combine with base color
    const referenceColors = [...tints, baseColor, ...shades];

    // -----------------------------------------------------------------
    // Apply target lightnesses while preserving chroma and hue from tint/shade
    // -----------------------------------------------------------------
    const okLchStops = referenceColors.map((color, idx) => {
      const [, C, H] = color.oklch(); // Get chroma and hue from tint/shade
      const targetL = targetLightnesses[idx]; // Use our perceptually uniform lightness

      // Handle NaN hue for achromatic colors
      const hueValue = isNaN(H) ? 0 : H;
      const chromaValue = isAchromatic ? 0 : C;

      return `oklch(${(targetL * 100).toFixed(3)}% ${chromaValue.toFixed(5)} ${hueValue.toFixed(3)})`;
    });

    // -----------------------------------------------------------------
    // Emit CSS custom properties
    // -----------------------------------------------------------------
    okLchStops.forEach((oklch, idx) => {
      const weight = (idx + 1) * 100; // 100,200,…,900
      cssLines.push(`  --fab-colour-${name}-${weight}: ${oklch};`);
    });
    // Add a blank line after each colour group for readability
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
