import { Component, Host, Listen, State, h } from '@stencil/core';

@Component({
  tag: 'fab-sidebar',
  styleUrl: 'fab-sidebar.css',
  shadow: true,
})
export class FabSidebar {
  @State() collapsed: boolean = false;

  private toggleCollapse() {
    this.collapsed = !this.collapsed;
  }

  @Listen('toggleSidebar', { target: 'body' })
  handleToggleSidebar() {
    this.toggleCollapse();
  }

  render() {
    return (
      <Host slot="sidebar" collapsed={this.collapsed}>
        <fab-sidebar-header></fab-sidebar-header>
        <slot name="navigation"></slot>
        <slot name="footer"></slot>
      </Host>
    );
  }
}
