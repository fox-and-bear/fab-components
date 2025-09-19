import { Component, Host, Prop, h, Element } from '@stencil/core';

@Component({
  tag: 'fab-sidebar-navigation-item',
  styleUrl: 'fab-sidebar-navigation-item.css',
  shadow: true,
})
export class FabSidebarNavigationItem {
  @Element() el: HTMLElement;
  /**
   * The URL that the navigation item links to.
   */
  @Prop() href: string = '#';
  /**
   * The icon for the navigation item. This can be a URL to an SVG.
   */
  @Prop() icon?: string;

  private hasIconSlot: boolean;

  componentWillLoad() {
    this.hasIconSlot = !!this.el.querySelector('[slot="icon"]');
  }

  render() {
    return (
      <Host>
        <li class="sb-menu-item">
          <a href={this.href}>
            <span class="sb-menu-icon">
              {this.hasIconSlot ? (
                <slot name="icon"></slot>
              ) : this.icon ? (
                <fab-icon src={this.icon}></fab-icon>
              ) : null}
            </span>
            <span class="sb-menu-label">
              <slot></slot>
            </span>
          </a>
        </li>
      </Host>
    );
  }
}