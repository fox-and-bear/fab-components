import { Component, Host, Prop, h } from '@stencil/core';

@Component({
  tag: 'fab-sidebar-item',
  styleUrl: 'fab-sidebar-item.css',
  shadow: true,
})
export class FabSidebarItem {
  @Prop() label: string;
  @Prop() icon: string; // Assuming icon is a URL or a class name for an icon font
  @Prop() active: boolean = false;
  @Prop() disabled: boolean = false;
  @Prop() href: string; // If provided, the item will be a link
  render() {
    return (
      <Host>
        <li>
          {this.icon && <fab-icon icon={this.icon} />}
          {this.href ? (
            <a href={this.href} class={{ active: this.active, disabled: this.disabled }} aria-current={this.active ? 'page' : null}>
              {this.label}
            </a>
          ) : (
            <span class={{ active: this.active, disabled: this.disabled }}>{this.label}</span>
          )}
        </li>
      </Host>
    );
  }
}
