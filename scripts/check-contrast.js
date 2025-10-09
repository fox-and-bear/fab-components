#!/usr/bin/env node
/**
 * check-contrast.js
 *
 * Analyzes the generated palette and calculates contrast ratios
 * to determine optimal text color switching points
 */

const fs = require('fs');
const path = require('path');
const chroma = require('chroma-js');

function analyzeContrast() {
  // Read the generated CSS file
  const cssPath = path.resolve(__dirname, '..', 'src', 'style', 'palettes.auto-generated.css');
  const cssContent = fs.readFileSync(cssPath, 'utf8');

  // Parse OKLCH values from CSS
  const oklchRegex = /--fab-colour-(\w+)-(\d+): oklch\(([\d.]+)% ([\d.]+) ([\d.]+)\);/g;
  const colors = [];
  let match;

  while ((match = oklchRegex.exec(cssContent)) !== null) {
    const [, colorName, weight, l, c, h] = match;
    colors.push({
      name: colorName,
      weight: parseInt(weight),
      l: parseFloat(l),
      c: parseFloat(c),
      h: parseFloat(h),
      oklch: `oklch(${l}% ${c} ${h})`,
    });
  }

  // Group by color name
  const colorGroups = colors.reduce((acc, color) => {
    if (!acc[color.name]) acc[color.name] = [];
    acc[color.name].push(color);
    return acc;
  }, {});

  console.log('🎨 SAME-COLOR CONTRAST ANALYSIS\n');
  console.log('WCAG AA requires 4.5:1 contrast for normal text');
  console.log('WCAG AAA requires 7:1 contrast for normal text\n');

  // Analyze same-color combinations
  for (const [colorName, colorSteps] of Object.entries(colorGroups)) {
    console.log(`\n📊 ${colorName.toUpperCase()} - Same Color Combinations`);
    console.log('Text Weight | Background Weight | Contrast | WCAG AA | WCAG AAA');
    console.log('------------|-------------------|----------|---------|----------');

    const sortedSteps = colorSteps.sort((a, b) => a.weight - b.weight);

    // Add black and white as virtual text colors
    const virtualTextColors = [
      { weight: 'black', chromaObj: chroma('#000') },
      { weight: 'white', chromaObj: chroma('#fff') },
    ];

    // Black/white text on each background
    for (const vText of virtualTextColors) {
      for (const bgColor of sortedSteps) {
        const bgObj = chroma.oklch(bgColor.l / 100, bgColor.c, bgColor.h);
        const contrast = chroma.contrast(vText.chromaObj, bgObj);
        const wcagAA = contrast >= 4.5 ? '✅' : '❌';
        const wcagAAA = contrast >= 7 ? '✅' : '❌';
        if (contrast >= 4.5) {
          console.log(
            `${vText.weight.toString().padStart(11)} | ${bgColor.weight.toString().padStart(17)} | ${contrast.toFixed(2).padStart(8)} | ${wcagAA.padStart(7)} | ${wcagAAA.padStart(
              8,
            )}`,
          );
        }
      }
    }

    // All same-color combinations (as before)
    for (const textColor of sortedSteps) {
      for (const bgColor of sortedSteps) {
        if (textColor.weight === bgColor.weight) continue; // Skip same weight

        const textObj = chroma.oklch(textColor.l / 100, textColor.c, textColor.h);
        const bgObj = chroma.oklch(bgColor.l / 100, bgColor.c, bgColor.h);
        const contrast = chroma.contrast(textObj, bgObj);

        const wcagAA = contrast >= 4.5 ? '✅' : '❌';
        const wcagAAA = contrast >= 7 ? '✅' : '❌';

        if (contrast >= 4.5) {
          // Only show combinations that meet WCAG AA
          console.log(
            `${textColor.weight.toString().padStart(11)} | ${bgColor.weight.toString().padStart(17)} | ${contrast.toFixed(2).padStart(8)} | ${wcagAA.padStart(
              7,
            )} | ${wcagAAA.padStart(8)}`,
          );
        }
      }
    }

    // Summary of good combinations
    console.log(`\n💡 RECOMMENDED ${colorName.toUpperCase()} COMBINATIONS:`);
    const goodCombos = [];

    for (const textColor of sortedSteps) {
      for (const bgColor of sortedSteps) {
        if (textColor.weight === bgColor.weight) continue;

        const textObj = chroma.oklch(textColor.l / 100, textColor.c, textColor.h);
        const bgObj = chroma.oklch(bgColor.l / 100, bgColor.c, bgColor.h);
        const contrast = chroma.contrast(textObj, bgObj);

        if (contrast >= 4.5) {
          goodCombos.push(`${colorName}-${textColor.weight} text on ${colorName}-${bgColor.weight} background`);
        }
      }
    }

    if (goodCombos.length > 0) {
      goodCombos.forEach(combo => console.log(`   • ${combo}`));
    } else {
      console.log('   • No same-color combinations meet WCAG AA standards');
    }
  }

  console.log('\n📋 GENERAL SUMMARY:');
  console.log('- Light weights (100-400) work well as backgrounds with dark weights (700-900) as text');
  console.log('- Dark weights (600-900) work well as backgrounds with light weights (100-300) as text');
  console.log("- Adjacent weights (like 300-400 or 600-700) typically don't have enough contrast");
}

analyzeContrast();
