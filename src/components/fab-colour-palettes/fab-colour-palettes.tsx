import { Component, Host, h, State } from '@stencil/core';

@Component({
  tag: 'fab-colour-palettes',
  styleUrl: 'fab-colour-palettes.css',
  shadow: true,
})
export class FabColourPalettes {
  private steps = [100, 200, 300, 400, 500, 600, 700, 800, 900];

  @State() colours: string[] = [];

  async componentWillLoad() {
    try {
      // Try to load the palette config
      const configResponse = await fetch('/palettes.config.json');
      if (configResponse.ok) {
        const config = await configResponse.json();
        this.colours = Object.keys(config.colours || {});
      } else {
        // Fallback to hardcoded list if config not accessible
        this.colours = ['red', 'orange', 'yellow', 'green', 'petrol', 'blue', 'indigo', 'purple', 'pink', 'grey-warm', 'grey-neutral', 'grey-cool'];
      }
    } catch (error) {
      console.warn('Could not load palette config, using fallback colors:', error);
      // Fallback to hardcoded list
      this.colours = ['red', 'orange', 'yellow', 'green', 'petrol', 'blue', 'indigo', 'purple', 'pink', 'grey-warm', 'grey-neutral', 'grey-cool'];
    }
  }

  private formatColorName(colour: string): string {
    // Handle compound names like 'grey-warm' -> 'Grey Warm'
    return colour
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  render() {
    return (
      <Host>
        <div class="palette-container">
          {this.colours.map(colour => (
            <div class="palette">
              <div class="palette-header">
                <i style={{ backgroundColor: `var(--fab-colour-${colour}-500)`, color: `var(--fab-colour-${colour}-foreground)` }}></i>
                {this.formatColorName(colour)}
              </div>

              {this.steps.map(step => (
                <div
                  class="palette-step"
                  style={{
                    backgroundColor: `var(--fab-colour-${colour}-${step})`,
                    color: step > 500 ? `white` : `black`,
                  }}
                >
                  <span class="step-label">{step}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div class="palette-container" style={{ marginTop: '2rem', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          <div class="palette">
            <div class="palette-header">
              <i style={{ backgroundColor: `var(--primary-colour)`, color: `var(--primary-foreground)` }}></i>
              Semantics
            </div>
            <div
              class="palette-step"
              style={{
                backgroundColor: `var(--primary-colour)`,
              }}
            >
              <span class="step-label">Primary</span>
            </div>

            <div
              class="palette-step"
              style={{
                backgroundColor: `var(--secondary-colour)`,
              }}
            >
              <span class="step-label">Secondary</span>
            </div>
            <div
              class="palette-step"
              style={{
                backgroundColor: `var(--success-colour)`,
              }}
            >
              <span class="step-label">Success</span>
            </div>
            <div
              class="palette-step"
              style={{
                backgroundColor: `var(--info-colour)`,
              }}
            >
              <span class="step-label">Info</span>
            </div>
            <div
              class="palette-step"
              style={{
                backgroundColor: `var(--danger-colour)`,
              }}
            >
              <span class="step-label">Danger</span>
            </div>
            <div
              class="palette-step"
              style={{
                backgroundColor: `var(--warning-colour)`,
              }}
            >
              <span class="step-label">Warning</span>
            </div>
          </div>
        </div>
      </Host>
    );
  }
}
