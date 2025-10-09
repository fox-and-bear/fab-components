import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'fab-sidebar-content',
  styleUrl: 'fab-sidebar-content.css',
  shadow: true,
})
export class FabSidebarContent {
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
