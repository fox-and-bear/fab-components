/*
  Generate CSS custom properties for color scales from OKLCH base colors.
  - Reads palettes.config.json
  - Emits src/style/palettes.generated.css with variables:
    --fab-colour-<name>-50..950
    --fab-colour-<name>-<variant>-foreground for 400/500/600
*/

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(__dirname, '..');
const SRC_STYLE_DIR = path.resolve(REPO_ROOT, 'src', 'style');
const CONFIG_PATH = path.resolve(__dirname, 'palettes.config.json');
const OUT_PATH = path.resolve(SRC_STYLE_DIR, 'palettes.generated.css');

/**
 * Parse an oklch string: oklch(L C H)
 * Returns { l, c, h, raw }
 * L may be a percentage like `60.446%`, we convert to 0-1 range for interpolation,
 * but we will output using the original `oklch()` with percentage for L for base only.
 */
function parseOKLCH(str) {
  const m = str.trim().match(/^oklch\(([^)]+)\)$/i);
  if (!m) throw new Error(`Invalid oklch color: ${str}`);
  const parts = m[1]
    .split(/\s+/)
    .map(p => p.replace(/,/g, ''))
    .filter(Boolean);
  if (parts.length < 3) throw new Error(`Invalid oklch parts: ${str}`);
  const Ls = parts[0];
  const Cs = parts[1];
  const Hs = parts[2];
  const l = Ls.endsWith('%') ? parseFloat(Ls) / 100 : parseFloat(Ls);
  const c = parseFloat(Cs);
  const h = parseFloat(Hs);
  return { l, c, h, raw: str };
}

function formatOklchFromReference(refVar, lExpr, cExpr) {
  // Build oklch(from var(--ref) <l> <c> h)
  return `oklch(from var(${refVar}) ${lExpr} ${cExpr} h)`;
}

function generateScaleForColor(name, cfg) {
  const baseVar = `--fab-colour-${name}`;
  const base500 = `--fab-colour-${name}-500`;
  const tint = cfg.tintTarget;
  const shade = cfg.shadeTarget;

  const lines = [];
  // Base 500 is the raw base var, but we expect an external :root to define --fab-colour-<name>
  lines.push(`  ${base500}: var(${baseVar});`);

  // Tints (lighter than 500): 50,100,200,300,400
  for (const [step, factor] of Object.entries(cfg.scaleSteps.tint)) {
    const lExpr = `calc(l + (var(--fab-tint-target-lightness) - l) * ${factor})`;
    const cExpr = `calc(c - (c - var(--fab-tint-target-chroma)) * ${factor})`;
    lines.push(`  --fab-colour-${name}-${step}: ${formatOklchFromReference(`--fab-colour-${name}-500`, lExpr, cExpr)};`);
  }

  // Shades (darker than 500): 600,700,800,900,950
  for (const [step, factor] of Object.entries(cfg.scaleSteps.shade)) {
    const lExpr = `calc(l - (l - var(--fab-shade-target-lightness)) * ${factor})`;
    const cExpr = `calc(c - (c - var(--fab-shade-target-chroma)) * ${factor})`;
    lines.push(`  --fab-colour-${name}-${step}: ${formatOklchFromReference(`--fab-colour-${name}-500`, lExpr, cExpr)};`);
  }

  return lines;
}

function generateForegroundFor(name, stepVarName) {
  return [
    `  --fab-colour-${name}-${stepVarName}-foreground: oklch(`,
    `    from var(--fab-colour-${name}-${stepVarName})`,
    '      calc(',
    '        min(1, max(0, (l - var(--fab-contrast-threshold)) * 1000)) * var(--fab-text-lightness-dark) + (1 - min(1, max(0, (l - var(--fab-contrast-threshold)) * 1000))) *',
    '          var(--fab-text-lightness-light)',
    '      )',
    '      0.01 h',
    '  );',
  ];
}

function build() {
  const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
  const cfg = JSON.parse(raw);

  const header = `/* AUTO-GENERATED FILE. Do not edit directly.\n * Source: scripts/generate-palettes.js + scripts/palettes.config.json\n */\n\n:root {\n  /* Utility vars for generating scales */\n  --fab-tint-target-lightness: ${cfg.tintTarget.lightness};\n  --fab-tint-target-chroma: ${cfg.tintTarget.chroma};\n  --fab-shade-target-lightness: ${cfg.shadeTarget.lightness};\n  --fab-shade-target-chroma: ${cfg.shadeTarget.chroma};\n\n  --fab-text-lightness-dark: ${cfg.contrast.textLightness.dark};\n  --fab-text-lightness-light: ${cfg.contrast.textLightness.light};\n}\n\n:where(:root),\n:host {\n  /* contrast threshold for foreground calc */\n  --fab-contrast-threshold: ${cfg.contrast.threshold};\n`;

  const sections = [];

  for (const [name, base] of Object.entries(cfg.colors)) {
    // Define the base color custom property at :root level
    // We'll emit it outside sections to keep things simple
    sections.push(`  /* ${name} scale */`);
    // Ensure we also emit the 500 assignment first
    const scaleLines = generateScaleForColor(name, cfg);
    // But we also need to ensure that the base var --fab-colour-<name> is defined somewhere.
    // We will prepend a block that sets base vars based on config too.
    sections.push(...scaleLines);
  }

  // Foreground variants
  sections.push('');
  for (const [name] of Object.entries(cfg.colors)) {
    for (const variant of cfg.contrast.foregroundVariants) {
      sections.push(...generateForegroundFor(name, String(variant)));
      sections.push('');
    }
  }

  const footer = `}\n`;

  // Also build a :root block that declares base colors from config
  const baseRootLines = [':root {'];
  for (const [name, base] of Object.entries(cfg.colors)) {
    baseRootLines.push(`  --fab-colour-${name}: ${base};`);
  }
  baseRootLines.push('}\n');

  const css = [header, ...sections, footer, '\n', baseRootLines.join('\n')].join('\n');

  fs.mkdirSync(SRC_STYLE_DIR, { recursive: true });
  fs.writeFileSync(OUT_PATH, css, 'utf8');
  console.log(`Wrote ${path.relative(REPO_ROOT, OUT_PATH)}`);
}

if (require.main === module) {
  try {
    build();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
