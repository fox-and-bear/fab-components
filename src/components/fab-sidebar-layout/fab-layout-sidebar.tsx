import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'fab-layout-sidebar',
  styleUrl: 'fab-layout-sidebar.css',
  shadow: true,
})
export class FabLayoutSidebar {
  render() {
    return (
      <Host>
        <slot name="sidebar"></slot>
          <slot></slot>
      </Host>
    );
  }
}
