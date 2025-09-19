import { Component, h, Prop, Event, EventEmitter } from '@stencil/core';

/**
 * @slot - The button content
 * Icons should be svgs where possible to ensure they scale correctly
 */

@Component({
  tag: 'fab-button',
  styleUrl: 'fab-button.css',
  shadow: true,
})
export class FabButton {
  /**
   * The button variants
   * @default 'default'
   * Options are 'default', 'destructive', 'outline', 'secondary', 'ghost', and 'link'
   */
  @Prop() variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' = 'default';
  /**
   * The button sizes
   * @default 'size-default'
   * Options are 'size-default', 'sm', 'lg', and 'icon' (for icon-only buttons)
   */
  @Prop() size: 'size-default' | 'sm' | 'lg' | 'icon' = 'size-default';
  /**
   * Disables the button if true
   * @default false
   */
  @Prop() disabled: boolean = false;
  /**
   * The button type
   * @default 'button'
   * Options are 'button', 'submit', and 'reset'
   */
  @Prop() type: 'button' | 'submit' | 'reset' = 'button';
  /** Additional classes to add to the button
   * @default ''
   */
  @Prop() class: string = ''

  /**
   * Emitted when the button is clicked
   * @event fabClick
   *
   */
  @Event() fabClick: EventEmitter<MouseEvent>;

  private handleClick = (event: MouseEvent) => {
    if (!this.disabled) {
      this.fabClick.emit(event);
    }
  };

  render() {
    return (
      <button type={this.type} disabled={this.disabled} class={`btn btn--${this.variant} btn--${this.size} ${this.class}`} onClick={this.handleClick}>
        <slot />
      </button>
    );
  }
}
