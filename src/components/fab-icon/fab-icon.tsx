import { Component, h, Prop, State, Watch, getAssetPath } from '@stencil/core';

@Component({
  tag: 'fab-icon',
  styleUrl: 'fab-icon.css',
  shadow: true,
  assetsDirs: ['assets'],
})
export class FabIcon {
  @State() private svgContent?: string;

  /**
   * The path to the SVG icon within the assets directory.
   */
  @Prop() src?: string;

  /**
   * The fill color for the SVG. Defaults to 'currentColor'.
   */
  @Prop() fill: string = 'currentColor';

  /**
   * The stroke color for the SVG.
   */
  @Prop() stroke?: string;

  @Watch('src')
  async loadIcon() {
    if (this.src) {
      try {
        const iconPath = getAssetPath(`./assets/${this.src}`);
        const response = await fetch(iconPath);
        if (response.ok) {
          this.svgContent = await response.text();
        } else {
          this.svgContent = undefined;
        }
      } catch (e) {
        this.svgContent = undefined;
        console.error(e);
      }
    }
  }

  componentWillLoad() {
    this.loadIcon();
  }

  render() {
    const styles = {
      'color': this.fill,
      'stroke': this.stroke,
    };

    return (
      <div
        style={styles}
        class="icon-wrapper"
        innerHTML={this.svgContent}
      ></div>
    );
  }
}