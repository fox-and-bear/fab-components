import { Component, Host, h, Prop } from '@stencil/core';

@Component({
  tag: 'fab-palette',
  styleUrl: 'fab-palette.css',
})
export class FabPalette {
  /**
   * The base colour value (for dynamic generation).
   * Default is 'var(--primary-colour)'.
   */
  @Prop() colourValue: string = 'var(--primary-colour)';

  private colourSteps = [10, 20, 30, 40, 50, 60, 70, 80, 90];

  private colourTypes = [
    { type: 'tint', textColor: 'black' },
    { type: 'shade', textColor: 'white' },
    { type: 'transparency', textColor: 'inherit' },
  ];

  private generateDynamicStyles(baseColour: string) {
    const styles: { [key: string]: string } = {};

    const targetTintLightness = 0.98;
    const targetTintChroma = 0.02; // Very low chroma near white

    const targetShadeLightness = 0.15;
    const targetShadeChroma = 0.02; // Very low chroma near black

    const targetNeutralChroma = 0.02; // Very low chroma for near gray
    const neutralMinLightness = 0.1; // almost black
    const neutralMaxLightness = 0.95; // almost white

    // Generate tints
    this.colourSteps.forEach(step => {
      const lightnessExpr = `calc(l + (${targetTintLightness} - l) * ${step}/100)`;
      const chromaExpr = `calc(c - (c - ${targetTintChroma}) * ${step}/100)`;
      styles[`--tint-${step}`] = `oklch(from ${baseColour} ${lightnessExpr} ${chromaExpr} h)`;
    });

    // Generate shades
    this.colourSteps.forEach(step => {
      const lightnessExpr = `calc(l - (l - ${targetShadeLightness}) * ${step}/100)`;
      const chromaExpr = `calc(c - (c - ${targetShadeChroma}) * ${step}/100)`;
      styles[`--shade-${step}`] = `oklch(from ${baseColour} ${lightnessExpr} ${chromaExpr} h)`;
    });

    // Generate transparency
    this.colourSteps.forEach(step => {
      // styles[`--transparency-${step}`] = `color-mix(in oklch, ${baseColour}, transparent ${step}%)`;
      styles[`--transparency-${step}`] = `oklch(from ${baseColour} l c h / calc(1 - ${step}/100))`;
    });

    // Generate surface neutrals
    this.colourSteps.forEach(step => {
      // Normalize step: 10 → 0, 90 → 1
      const t = (step - 10) / 80;
      const lightnessExpr = `calc(${neutralMaxLightness} - (${neutralMaxLightness} - ${neutralMinLightness}) * ${t})`;
      const chromaExpr = `${targetNeutralChroma}`;
      styles[`--surface-${step}`] = `oklch(from ${baseColour} ${lightnessExpr} ${chromaExpr} h)`;
    });
    return styles;
  }

  render() {
    const dynamicStyles = this.generateDynamicStyles(this.colourValue);

    return (
      <Host>
        <div class="palette-group" style={{ '--base-colour': this.colourValue, ...dynamicStyles } as any}>
          {this.colourTypes.map(({ type, textColor }) => (
            <div class={`palette ${type}`}>
              {this.colourSteps.map(step => (
                <div
                  class="colour-swatch"
                  style={{
                    backgroundColor: `var(--${type}-${step})`,
                  }}
                >
                  <span style={{ color: textColor }}>{step}</span>
                </div>
              ))}
            </div>
          ))}

          <div class="palette surface">
            {this.colourSteps.map(step => (
              <div
                class="colour-swatch"
                style={{
                  backgroundColor: `var(--surface-${step})`,
                }}
              >
                <span style={{ color: step > 40 ? 'white' : 'black' }}>{step}</span>
              </div>
            ))}
          </div>

          <span
            class="main-colour"
            style={{
              backgroundColor: `var(--base-colour)`,
            }}
          ></span>
        </div>
      </Host>
    );
  }
}
