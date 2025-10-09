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
  @Prop() groupCollapsed?: boolean = false;

  private toggleCollapse = () => {
    if (this.groupCollapsible) {
      this.groupCollapsed = !this.groupCollapsed;
    }
  }


  render() {
    return (
      <Host>
        {this.heading && (
          <h3 onClick={this.toggleCollapse}>
            {this.heading} {this.groupCollapsible ? this.groupCollapsed ? <fab-icon icon="chevron-down" /> : <fab-icon icon="chevron-right" /> : ''}
          </h3>
        )}
        <slot></slot>
      </Host>
    );
  }
}
