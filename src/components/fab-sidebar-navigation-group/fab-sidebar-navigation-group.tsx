import { Component, Host, Prop, h } from '@stencil/core';

@Component({
  tag: 'fab-sidebar-navigation-group',
  styleUrl: 'fab-sidebar-navigation-group.css',
  shadow: true,
})
export class FabSidebarNavigationGroup {
  @Prop() label?: string;
  render() {
    return (
      <Host>
        {this.label && <h3 class="sb-title">{this.label}</h3>}
        <div class="menu-group">
          <ul class="sb-top-menu">
            <slot></slot>
          </ul>
        </div>
      </Host>
    );
  }
}
