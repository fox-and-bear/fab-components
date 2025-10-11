import { Component, Host, Prop, h } from '@stencil/core';

@Component({
  tag: 'fab-sidebar-group',
  styleUrl: 'fab-sidebar-group.css',
  shadow: true,
})
export class FabSidebarGroup {
  /**
   * Optional heading for the group.
   */
  @Prop() heading?: string;

  /**
   * Whether the group is collapsible.
   */
  @Prop() groupCollapsible?: boolean = false;

  /**
   * Whether the group is currently collapsed.
   */
  @Prop({ mutable: true, reflect: true }) groupCollapsed?: boolean = true;

  private toggleCollapse = () => {
    if (this.groupCollapsible) {
      this.groupCollapsed = !this.groupCollapsed;
    }
  };

  render() {
    return (
      <Host>
        {this.heading && (
          <h3 onClick={this.toggleCollapse}>
            {this.heading}{' '}
            {this.groupCollapsible &&
              (this.groupCollapsed ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none">
                  <path d="M9.00005 6L15 12L9 18" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="16" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none">
                  <path
                    d="M5.99977 9.00005L11.9998 15L17.9998 9"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-miterlimit="16"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></path>
                </svg>
              ))}
          </h3>
        )}
        {this.groupCollapsible ? (
          <ul class={this.groupCollapsible ? (this.groupCollapsed ? 'expander' : ' expander expanded') : ''}>
            <div class="expander-content">
              <slot></slot>
            </div>
          </ul>
        ) : (
          <slot></slot>
        )}
      </Host>
    );
  }
}
