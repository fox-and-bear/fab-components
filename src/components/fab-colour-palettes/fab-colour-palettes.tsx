import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'fab-colour-palettes',
  styleUrl: 'fab-colour-palettes.css',
  shadow: true,
})
export class FabColourPalettes {
  private steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
  private colours = ['red', 'orange', 'yellow', 'green', 'petrol', 'blue', 'purple', 'pink', 'grey'];

  render() {
    return (
      <Host>
        <div class="palette-container">
          {this.colours.map(colour => (
            <div class="palette">
              <div class="palette-header">
                <i style={{ backgroundColor: `var(--fab-colour-${colour}-500)`, color: `var(--fab-colour-${colour}-foreground)` }}></i>
                {colour.charAt(0).toUpperCase() + colour.slice(1)}
              </div>

              {this.steps.map(step => (
                <div
                  class="palette-step"
                  style={{
                    backgroundColor: `var(--fab-colour-${colour}-${step})`,
                    color: step < 400 ? 'var(--fab-colour-grey-950)' : step > 600 ? 'white' : `var(--fab-colour-${colour}-${step}-foreground)`,
                  }}
                >
                  <span class="step-label">{step}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Host>
    );
  }
}
