import { Component, h, Prop, State, Watch, getAssetPath } from '@stencil/core';

@Component({
  tag: 'fab-icon',
  styleUrl: 'fab-icon.css',
  shadow: false,
  assetsDirs: ['assets'],
})
export class FabIcon {
  /**
   * The name of the icon to display. This should correspond to an SVG file in the assets directory (without the .svg extension).
   */
  @Prop() icon: string;

  /**
   * The size of the icon in pixels. Defaults to 16.
   */
  @Prop() size: number = 16;

  /**
   * The variant of the icon. Defaults to 'line'.
   */
  @Prop() variant: 'solid' | 'duotone' | 'line' = 'duotone';

  /**
   * The fill color for the SVG. For duotone icons, this will be the primary color.
   */
  @Prop() fill?: string;

  /**
   * The secondary fill color for duotone icons.
   */
  @Prop() fillSecondary?: string;

  /**
   * The stroke color for the SVG.
   */
  @Prop() stroke?: string = 'var(--primary-colour, currentColor)';

  /**
   * Custom CSS classes to apply to the icon wrapper.
   */
  @Prop() class?: string;

  @State() svgContent: string = '';

  @Watch('icon')
  @Watch('variant')
  @Watch('fill')
  @Watch('fillSecondary')
  @Watch('size')
  async loadIcon() {
    if (!this.icon) {
      this.svgContent = '';
      return;
    }

    try {
      const iconPath = getAssetPath(`./assets/${this.variant}/${this.icon}.svg`);
      const response = await fetch(iconPath);
      if (response.ok) {
        let svgText = await response.text();

        // Remove existing width/height and add our size
        svgText = svgText.replace(/width="[^"]*"/g, '');
        svgText = svgText.replace(/height="[^"]*"/g, '');
        svgText = svgText.replace('<svg', `<svg width="${this.size}" height="${this.size}"`);

        // Fix clipping paths that have empty rects
        svgText = this.fixClipPaths(svgText);

        switch (this.variant) {
          case 'duotone':
            if (this.fill || this.fillSecondary) {
              // For duotone icons, replace specific fill colors
              svgText = this.replaceDuotoneFills(svgText);
            }
            break;

          case 'solid':
            // For solid icons, remove stroke attributes but keep/replace fills
            svgText = svgText.replace(/stroke="[^"]*"/g, '');
            if (this.fill) {
              svgText = svgText.replace(/fill="[^"]*"/g, `fill="${this.fill}"`);
            }
            break;

          case 'line':
          default:
            // For line icons, remove fills and keep/replace strokes
            svgText = svgText.replace(/fill="[^"]*"/g, 'fill="none"');
            if (this.stroke) {
              svgText = svgText.replace(/stroke="[^"]*"/g, `stroke="${this.stroke}"`);
            } else {
              // Add stroke if none exists
              svgText = svgText.replace(/<path/g, `<path stroke="${this.stroke || 'currentColor'}"`);
              svgText = svgText.replace(/<circle/g, `<circle stroke="${this.stroke || 'currentColor'}"`);
              svgText = svgText.replace(/<rect/g, `<rect stroke="${this.stroke || 'currentColor'}"`);
              svgText = svgText.replace(/<line/g, `<line stroke="${this.stroke || 'currentColor'}"`);
              svgText = svgText.replace(/<polyline/g, `<polyline stroke="${this.stroke || 'currentColor'}"`);
              svgText = svgText.replace(/<polygon/g, `<polygon stroke="${this.stroke || 'currentColor'}"`);
            }
            break;
        }

        this.svgContent = svgText;
      } else {
        console.warn(`Icon "${this.icon}" not found`);
        this.svgContent = '';
      }
    } catch (error) {
      console.error(`Error loading icon "${this.icon}":`, error);
      this.svgContent = '';
    }
  }

  private replaceDuotoneFills(svgText: string): string {
    const colorsToUse = [this.fill || 'var(--primary-colour, currentColor)', this.fillSecondary || 'var(--secondary-colour, rgba(currentColor, 0.3))'];

    // Find all unique fill colors in the SVG (excluding 'none' and 'white')
    const fillMatches = svgText.match(/fill="([^"]+)"/g) || [];
    const uniqueFills = Array.from(
      new Set(fillMatches.map(match => match.match(/fill="([^"]+)"/)?.[1]).filter(fill => fill && fill !== 'none' && fill !== 'white' && fill !== 'transparent')),
    );

    // Replace each unique fill with corresponding color from our array
    let modifiedSvg = svgText;
    uniqueFills.forEach((originalFill, index) => {
      if (colorsToUse[index]) {
        const regex = new RegExp(`fill="${originalFill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'g');
        modifiedSvg = modifiedSvg.replace(regex, `fill="${colorsToUse[index]}"`);
      }
    });

    return modifiedSvg;
  }

  private fixClipPaths(svgText: string): string {
    // Extract viewBox dimensions to fix empty rects in clipPaths
    const viewBoxMatch = svgText.match(/viewBox="([^"]+)"/);
    if (viewBoxMatch) {
      const viewBoxValues = viewBoxMatch[1].split(' ');
      const width = viewBoxValues[2];
      const height = viewBoxValues[3];

      // Replace empty rects in clipPaths with proper dimensions
      svgText = svgText.replace(/<rect fill="white"><\/rect>/g, `<rect width="${width}" height="${height}" fill="white"></rect>`);
      svgText = svgText.replace(/<rect fill="white"\/>/g, `<rect width="${width}" height="${height}" fill="white"/>`);
    }

    return svgText;
  }

  componentWillLoad() {
    this.loadIcon();
  }

  render() {
    const classes = ['icon-wrapper'];
    if (this.class) {
      classes.push(this.class);
    }

    return (
      <div
        class={classes.join(' ')}
        style={{
          display: 'inline-block',
          width: `${this.size}px`,
          height: `${this.size}px`,
        }}
        innerHTML={this.svgContent}
      >
        
      </div>
    );
  }
}
