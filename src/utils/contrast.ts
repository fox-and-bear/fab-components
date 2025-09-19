interface RGB {
  r: number;
  g: number;
  b: number;
}

function parseColor(color: string): RGB {
  // Remove whitespace and convert to lowercase
  color = color.trim().toLowerCase();

  // Handle oklch() format
  if (color.startsWith('oklch(')) {
    const match = color.match(/oklch\(([^)]+)\)/);
    if (match) {
      const [l, c, h] = match[1].split(/\s+/).map(v => parseFloat(v.trim()));
      return oklchToRgb(l, c, h);
    }
  }

  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    if (hex.length === 3) {
      const expandedHex = hex
        .split('')
        .map(char => char + char)
        .join('');
      return {
        r: parseInt(expandedHex.slice(0, 2), 16),
        g: parseInt(expandedHex.slice(2, 4), 16),
        b: parseInt(expandedHex.slice(4, 6), 16),
      };
    } else if (hex.length === 6) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
      };
    }
  }

  // Handle rgb() format
  if (color.startsWith('rgb(')) {
    const values = color
      .match(/rgb\(([^)]+)\)/)?.[1]
      .split(',')
      .map(v => parseInt(v.trim()));
    if (values && values.length === 3) {
      return { r: values[0], g: values[1], b: values[2] };
    }
  }

  // Handle rgba() format
  if (color.startsWith('rgba(')) {
    const values = color
      .match(/rgba\(([^)]+)\)/)?.[1]
      .split(',')
      .map(v => parseFloat(v.trim()));
    if (values && values.length >= 3) {
      return { r: Math.round(values[0]), g: Math.round(values[1]), b: Math.round(values[2]) };
    }
  }

  // Handle hsl() format
  if (color.startsWith('hsl(')) {
    const match = color.match(/hsl\(([^)]+)\)/);
    if (match) {
      const [h, s, l] = match[1].split(',').map(v => parseFloat(v.trim().replace('%', '')));
      return hslToRgb(h, s / 100, l / 100);
    }
  }

  // Handle named colors (basic ones)
  const namedColors: { [key: string]: RGB } = {
    white: { r: 255, g: 255, b: 255 },
    black: { r: 0, g: 0, b: 0 },
    red: { r: 255, g: 0, b: 0 },
    green: { r: 0, g: 128, b: 0 },
    blue: { r: 0, g: 0, b: 255 },
    // Add more as needed
  };

  if (namedColors[color]) {
    return namedColors[color];
  }

  // For CSS custom properties or computed colors
  if (color.startsWith('var(')) {
    throw new Error('CSS custom properties need to be resolved first');
  }

  // Fallback - return black
  console.warn(`Unable to parse color: ${color}`);
  return { r: 0, g: 0, b: 0 };
}

export function getContrastingTextColor(bgColor: string): string {
  const rgb = parseColor(bgColor);

  const bgLuminance = getLuminance(rgb.r, rgb.g, rgb.b);

  const whiteLuminance = 1;
  const blackLuminance = 0;

  const whiteContrast = getContrastRatio(bgLuminance, whiteLuminance);
  const blackContrast = getContrastRatio(bgLuminance, blackLuminance);

  return whiteContrast > blackContrast ? 'white' : 'black';
}

// Helper function to convert HSL to RGB
function hslToRgb(h: number, s: number, l: number): RGB {
  h = h / 360;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  if (s === 0) {
    const rgb = Math.round(l * 255);
    return { r: rgb, g: rgb, b: rgb };
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  return {
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  };
}

function oklchToRgb(l: number, c: number, h: number): RGB {
  // Convert OKLCH to RGB
  // This is a simplified conversion - for production, you might want a more accurate one

  // Convert hue to radians
  const hRad = (h * Math.PI) / 180;

  // Convert to Lab
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  // Convert Lab to XYZ (simplified)
  const fy = (l + 0.16) / 1.16;
  const fx = a / 5.0 + fy;
  const fz = fy - b / 2.0;

  const x = fx * fx * fx > 0.008856 ? fx * fx * fx : (fx - 0.137931) / 7.787;
  const y = l > 0.008856 ? Math.pow((l + 0.16) / 1.16, 3) : l / 9.033;
  const z = fz * fz * fz > 0.008856 ? fz * fz * fz : (fz - 0.137931) / 7.787;

  // Convert XYZ to RGB
  let r = x * 3.2406 + y * -1.5372 + z * -0.4986;
  let g = x * -0.9689 + y * 1.8758 + z * 0.0415;
  let b_val = x * 0.0557 + y * -0.204 + z * 1.057;

  // Gamma correction
  r = r > 0.0031308 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : 12.92 * r;
  g = g > 0.0031308 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : 12.92 * g;
  b_val = b_val > 0.0031308 ? 1.055 * Math.pow(b_val, 1 / 2.4) - 0.055 : 12.92 * b_val;

  // Clamp to 0-255 range
  return {
    r: Math.max(0, Math.min(255, Math.round(r * 255))),
    g: Math.max(0, Math.min(255, Math.round(g * 255))),
    b: Math.max(0, Math.min(255, Math.round(b_val * 255))),
  };
}

function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(lum1: number, lum2: number): number {
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

export function getComputedColor(cssValue: string, element?: HTMLElement): string {
  const testElement = element || document.createElement('div');
  testElement.style.backgroundColor = cssValue; // Use backgroundColor instead of color
  document.body.appendChild(testElement);
  const computedColor = getComputedStyle(testElement).backgroundColor; // This should return rgb()
  document.body.removeChild(testElement);
  return computedColor;
}