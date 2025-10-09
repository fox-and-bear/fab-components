import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'fab-sidebar-header',
  styleUrl: 'fab-sidebar-header.css',
  shadow: true,
})
export class FabSidebarHeader {
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
