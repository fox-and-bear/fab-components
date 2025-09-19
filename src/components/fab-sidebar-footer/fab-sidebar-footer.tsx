import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'fab-sidebar-footer',
  styleUrl: 'fab-sidebar-footer.css',
  shadow: true,
})
export class FabSidebarFooter {
  render() {
    return (
      <Host slot="footer">
        <slot></slot>
      </Host>
    );
  }
}
