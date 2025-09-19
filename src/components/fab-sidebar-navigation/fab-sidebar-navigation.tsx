import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'fab-sidebar-navigation',
  styleUrl: 'fab-sidebar-navigation.css',
  shadow: true,
})
export class FabSidebarNavigation {
  render() {
    return (
      <Host slot="navigation">
        <nav>
          <slot></slot>
        </nav>
      </Host>
    );
  }
}
