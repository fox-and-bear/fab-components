import { Component, Host, h, State } from '@stencil/core';

@Component({
  tag: 'fab-skeu-switch',
  styleUrl: 'fab-skeu-switch.css',
  shadow: true,
})
export class FabSkeuSwitch {
  private inputId = `skeu-switch-${Math.random().toString(36).slice(2, 8)}`;
  @State() checked = false;
  @State() pristine = true;

  private onChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    this.checked = target.checked;
    if (this.pristine) this.pristine = false;
  };

  render() {
    const classes = {
      lever: true,
      pristine: this.pristine,
    };
    return (
      <Host class={{ checked: this.checked }}>
        {/* <form part="form" onSubmit={e => e.preventDefault()}> */}
        <span class="switch-container">
          <input
            type="checkbox"
            id={this.inputId}
            role="switch"
            aria-checked={String(this.checked)}
            class={Object.keys(classes)
              .filter(k => (classes as any)[k])
              .join(' ')}
            checked={this.checked}
            onChange={this.onChange}
            value="on"
          />
          <label htmlFor={this.inputId} part="led-on">
            <span>On</span>
          </label>
          <label htmlFor={this.inputId} part="led-off">
            <span>Off</span>
          </label>
        </span>
        {/* </form> */}
      </Host>
    );
  }
}
