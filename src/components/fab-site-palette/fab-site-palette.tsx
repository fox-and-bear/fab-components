import { Component, Host, Prop, h, State } from '@stencil/core';

@Component({
  tag: 'fab-site-palette',
  styleUrl: 'fab-site-palette.css',
  shadow: true,
  scoped: false,
})
export class FabSitePalette {
  private steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
  /**
   * The base colour value (for dynamic generation).
   * Default is 'var(--primary-colour)'.
   */
  @Prop() colourValue: string = 'var(--primary-colour)';

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
            <span style={{ backgroundColor: this.colourValue }}></span>
            <h1>Primary Colour</h1>
            <div class="copy-button" onClick={() => this.onCopyClick(this.colourValue)} title="Copy to clipboard">
              {this.colourValue}
            </div>
          </div>
          <div class="site-palette-steps">
            {this.steps.map((step, index) => (
              <div
                data-step-index={index}
                class="site-palette-step"
                style={{
                  '--index': index.toString(),
                  backgroundColor: `var(--colour-${step})`,
                  color: step < 400 ? 'var(--fab-colour-grey-950)' : step > 600 ? 'white' : `var(--colour-${step}-foreground)`,
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
