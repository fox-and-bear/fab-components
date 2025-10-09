import { Component, Host, Prop, h, State } from '@stencil/core';

@Component({
  tag: 'fab-site-palette',
  styleUrl: 'fab-site-palette.css',
  shadow: true,
  scoped: false,
})
export class FabSitePalette {
  private steps = [100, 200, 300, 400, 500, 600, 700, 800, 900];
  /**
   * The base colour value (for dynamic generation).
   * Default is 'var(--primary-colour)'.
   */
  @Prop() colourValue: string = 'var(--primary-colour)';

  /**
   * The colour harmony to display.
   * Options are 'complementary', 'analogous', 'triadic', 'tetradic', 'split', and 'neutral'.
   * Default is 'complementary'.
   */
  @Prop() harmony: 'complementary' | 'analogous' | 'triadic' | 'tetradic' | 'split' | 'neutral' = 'complementary';

  @Prop() showHarmonies: boolean = true;

  private onCopyClick = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      // Optionally, provide user feedback here (e.g., a tooltip or temporary message)
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  render() {
    return (
      <Host>
        <div
          class="site-palette"
          ref={el => (this.paletteRef = el as HTMLElement)}
          style={{
            position: 'fixed',
            left: `${this.pos.x}px`,
            top: `${this.pos.y}px`,
            zIndex: '9999',
            cursor: this.dragging ? 'grabbing' : 'grab',
            userSelect: 'none',
          }}
          onMouseDown={this.onMouseDown}
        >
          <div class="site-palette-header">
            <span class="colour-swatch" style={{ backgroundColor: this.colourValue }}></span>
            <h1>Primary Colour</h1>
            <div class="copy-button" onClick={() => this.onCopyClick(this.colourValue)} title="Copy to clipboard">
              {this.colourValue}
            </div>
            {this.showHarmonies && (
              <div class="harmony-tabs">
                {/* Colour Harmonies  */}
                <span class="harmony-tab" title="Complementary">
                  <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 128 128"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      fillRule: 'evenodd',
                      clipRule: 'evenodd',
                      strokeLinejoin: 'round',
                      strokeMiterlimit: '2',
                    }}
                  >
                    <g id="complementary">
                      <circle cx="64" cy="12.502" r="12.502" />
                      <circle cx="64" cy="115.498" r="12.502" />
                    </g>
                  </svg>
                </span>
                <span class="harmony-tab" title="Analogous">
                  <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 128 128"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      fillRule: 'evenodd',
                      clipRule: 'evenodd',
                      strokeLinejoin: 'round',
                      strokeMiterlimit: '2',
                    }}
                  >
                    <g id="analogous">
                      <circle cx="64" cy="12.502" r="12.502" />
                      <path d="M32,8.574c5.976,-3.45 13.628,-1.399 17.078,4.576c3.45,5.976 1.4,13.629 -4.576,17.079c-5.976,3.45 -13.628,1.399 -17.078,-4.576c-3.45,-5.976 -1.4,-13.629 4.576,-17.079Z" />
                      <path d="M96,8.574c5.976,3.45 8.026,11.103 4.576,17.079c-3.45,5.975 -11.102,8.026 -17.078,4.576c-5.976,-3.45 -8.026,-11.103 -4.576,-17.079c3.45,-5.975 11.102,-8.026 17.078,-4.576Z" />
                    </g>
                  </svg>
                </span>
                <span class="harmony-tab" title="Triadic">
                  <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 128 128"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      fillRule: 'evenodd',
                      clipRule: 'evenodd',
                      strokeLinejoin: 'round',
                      strokeMiterlimit: '2',
                    }}
                  >
                    <g id="triadic">
                      <circle cx="64" cy="12.502" r="12.502" />
                      <path d="M119.426,96c-3.45,5.976 -11.103,8.026 -17.079,4.576c-5.975,-3.45 -8.026,-11.102 -4.576,-17.078c3.45,-5.976 11.103,-8.026 17.079,-4.576c5.975,3.45 8.026,11.102 4.576,17.078Z" />
                      <path d="M8.574,96c-3.45,-5.976 -1.399,-13.628 4.576,-17.078c5.976,-3.45 13.629,-1.4 17.079,4.576c3.45,5.976 1.399,13.628 -4.576,17.078c-5.976,3.45 -13.629,1.4 -17.079,-4.576Z" />
                    </g>
                  </svg>
                </span>
                <span class="harmony-tab" title="Tetradic">
                  <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 128 128"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      fillRule: 'evenodd',
                      clipRule: 'evenodd',
                      strokeLinejoin: 'round',
                      strokeMiterlimit: '2',
                    }}
                  >
                    <g id="tetradic">
                      <path d="M8.574,32c3.45,-5.976 11.103,-8.026 17.079,-4.576c5.975,3.45 8.026,11.102 4.576,17.078c-3.45,5.976 -11.103,8.026 -17.079,4.576c-5.975,-3.45 -8.026,-11.102 -4.576,-17.078Z" />
                      <path d="M119.426,96c-3.45,5.976 -11.103,8.026 -17.079,4.576c-5.975,-3.45 -8.026,-11.102 -4.576,-17.078c3.45,-5.976 11.103,-8.026 17.079,-4.576c5.975,3.45 8.026,11.102 4.576,17.078Z" />
                      <circle cx="64" cy="115.498" r="12.502" />
                      <circle cx="64" cy="12.502" r="12.502" />
                    </g>
                  </svg>
                </span>
                <span class="harmony-tab" title="Split Complementary">
                  <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 128 128"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      fillRule: 'evenodd',
                      clipRule: 'evenodd',
                      strokeLinejoin: 'round',
                      strokeMiterlimit: '2',
                    }}
                  >
                    <g id="split">
                      <circle cx="64" cy="12.502" r="12.502" />
                      <path d="M96,119.426c-5.976,3.45 -13.628,1.399 -17.078,-4.576c-3.45,-5.976 -1.4,-13.629 4.576,-17.079c5.976,-3.45 13.628,-1.399 17.078,4.576c3.45,5.976 1.4,13.629 -4.576,17.079Z" />
                      <path d="M32,119.426c-5.976,-3.45 -8.026,-11.103 -4.576,-17.079c3.45,-5.975 11.102,-8.026 17.078,-4.576c5.976,3.45 8.026,11.103 4.576,17.079c-3.45,5.975 -11.102,8.026 -17.078,4.576Z" />
                    </g>
                  </svg>
                </span>
                <span class="harmony-tab" title="Neutral"></span>
              </div>
            )}
          </div>
          <div class="site-palette-steps">
            {this.steps.map((step, index) => (
              <div
                data-step-index={index}
                class="site-palette-step"
                style={{
                  '--index': index.toString(),
                  'backgroundColor': `var(--colour-${step})`,
                  'color': step < 400 ? 'var(--fab-colour-grey-950)' : step > 600 ? 'white' : `var(--colour-${step}-foreground)`,
                }}
                onClick={() => this.onCopyClick(`var(--colour-${step})`)}
                title={`Copy var(--colour-${step}) to clipboard`}
              >
                <span class="palette-step-label">var(--colour-{step})</span>
              </div>
            ))}
          </div>
        </div>
      </Host>
    );
  }

  @State() pos = { x: 100, y: 100 };
  private storageKey = 'fab-site-palette-pos';

  componentWillLoad() {
    // Restore position from localStorage if available
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed === 'object' && typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          this.pos = parsed;
        }
      }
    } catch {}
  }
  @State() dragging = false;
  @State() dragOffset = { x: 0, y: 0 };

  paletteRef?: HTMLElement;

  private onMouseDown = (e: MouseEvent) => {
    if (e.button !== 0) return;
    const palette = this.paletteRef;
    if (!palette) return;
    const rect = palette.getBoundingClientRect();
    this.dragging = true;
    this.dragOffset = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);
  };

  private onMouseMove = (e: MouseEvent) => {
    if (!this.dragging) return;
    const width = this.paletteRef?.offsetWidth || 200;
    const height = this.paletteRef?.offsetHeight || 200;
    const maxX = window.innerWidth - width;
    const maxY = window.innerHeight - height;
    let x = e.clientX - this.dragOffset.x;
    let y = e.clientY - this.dragOffset.y;
    x = Math.max(0, Math.min(x, maxX));
    y = Math.max(0, Math.min(y, maxY));
    this.pos = { x, y };
  };

  private onMouseUp = () => {
    this.dragging = false;
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
    // Save position to localStorage
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.pos));
    } catch {}
  };
}
