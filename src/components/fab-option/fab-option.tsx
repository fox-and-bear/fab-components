import { Component, Host, h, Prop, Event, EventEmitter, Element } from '@stencil/core';

@Component({
  tag: 'fab-option',
  styleUrl: 'fab-option.css',
  shadow: true,
})
export class FabOption {
  @Element() el!: HTMLElement;

  /**
   * The option value
   */
  @Prop() value: string = '';

  /**
   * Whether the option is selected
   */
  @Prop({ mutable: true, reflect: true }) selected: boolean = false;

  /**
   * Optional image URL for the option
   */
  @Prop() imageUrl: string;

  /**
   * Optional icon class
   */
  @Prop() icon: string;

  /**
   * Emitted when option is selected
   */
  @Event() fabOptionSelect: EventEmitter<string>;

  /**
   * Description text for the option (for enhanced accessibility)
   */
  @Prop() description: string;

  /**
   * Whether the option is disabled
   */
  @Prop() disabled: boolean = false;

  private handleClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (this.disabled) return;

    // Toggle selection (actual state management happens in parent component)
    this.fabOptionSelect.emit(this.value);
  };

  render() {
    return (
      <Host
        class={{
          'fab-option': true,
          'fab-option--selected': this.selected,
          'fab-option--disabled': this.disabled,
          'fab-option--has-image': !!this.imageUrl,
          'fab-option--has-icon': !!this.icon,
        }}
        role="option"
        aria-selected={this.selected ? 'true' : 'false'}
        aria-disabled={this.disabled ? 'true' : 'false'}
        onClick={this.handleClick}
        tabindex="-1" // Not directly focusable, parent handles keyboard nav
      >
        {this.imageUrl && (
          <div class="fab-option--image">
            <img src={this.imageUrl} alt="" aria-hidden="true" />
          </div>
        )}

        {this.icon && (
          <div class="fab-option--icon">
            <i class={this.icon}></i>
          </div>
        )}

        <div class="fab-option--content">
          <div class="fab-option--label">
            <slot></slot>
          </div>

          {this.description && <div class="fab-option--description">{this.description}</div>}
        </div>

        {this.selected && (
          <div class="fab-option--selected-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M9 16.2l-3.5-3.5c-.39-.39-1.01-.39-1.4 0-.39.39-.39 1.01 0 1.4l4.19 4.19c.39.39 1.02.39 1.41 0L20.3 7.7c.39-.39.39-1.01 0-1.4-.39-.39-1.01-.39-1.4 0L9 16.2z"
                fill="currentColor"
              />
            </svg>
          </div>
        )}
      </Host>
    );
  }
}
