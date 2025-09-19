import { Component, Host, h, Prop } from '@stencil/core';

@Component({
  tag: 'fab-toggle',
  styleUrl: 'fab-toggle.css',
  shadow: true,
})
export class FabToggle {
  /**
   * Whether we show the indicator light
   */
  @Prop({ reflect: true }) showIndicator: boolean;

  render() {
    return (
      <Host>
        <span class="toggle-container">
          <label class="switch">
            <input type="checkbox" />
            <span class="thumb"></span>
          </label>
          {this.showIndicator && <i class="indicator-light"></i>}
        </span>
      </Host>
    );
  }
}
