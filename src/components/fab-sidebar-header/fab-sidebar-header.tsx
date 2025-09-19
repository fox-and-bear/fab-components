import { Component, Host, h, Event, EventEmitter, Prop } from '@stencil/core';

@Component({
  tag: 'fab-sidebar-header',
  styleUrl: 'fab-sidebar-header.css',
  shadow: true,
  assetsDirs: ['assets'],
})
export class FabSidebarHeader {
  @Event() toggleSidebar: EventEmitter<void>;
  @Prop({ reflect: true }) collapsed: boolean = false;
  @Prop() logoIcon = 'moba-icon-logo.svg';
  @Prop() logoText = 'moba-text-logo.svg';

  private handleClick = () => {
    this.toggleSidebar.emit();
  };
  render() {
    return (
      <Host slot="header" collapsed={this.collapsed}>
        <label htmlFor="btn-toggle" class="sb-toggler" onClick={this.handleClick}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12" fill="currentColor" stroke="currentColor" stroke-width="2">
            <path fill-rule="evenodd" d="M7.72 12.53a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 1 1 1.06 1.06L9.31 12l6.97 6.97a.75.75 0 1 1-1.06 1.06l-7.5-7.5Z" clip-rule="evenodd" />
          </svg>
        </label>
        <input type="checkbox" id="btn-toggle" />

        <fab-icon src={this.logoIcon} class="logo-icon" fill="var(--primary-colour)" />
        <fab-icon src={this.logoText} class="logo-text" fill="var(--text-colour)" />
      </Host>
    );
  }
}
