import { Component, h, Host, State } from '@stencil/core';

// Define your color order (excluding neutrals) and variants here
const COLOR_ORDER = [
  'rose',
  'alata',
  'fuchsia',
  'plum',
  'lilac',
  'violet',
  'blueberry',
  'juniper',
  'acaiBerry',
  'teal',
  'sage',
  'viridiflora',
  'lxia',
  'basil',
  'snowPea',
  'moss',
  'pine',
  'pea',
  'apple',
  'lime',
  'kiwi',
  'oak',
  'larch',
  'walnut',
  'teak',
  'rosewood',
  'chestnut',
  'umber',
  'cedar',
  'canna',
];
const VARIANTS = ['', '-1', '-2'];
const NEUTRALS = ['owl', 'moon', 'steel', 'graphite', 'slate', 'offBlack', 'notBlack'];

@Component({
  tag: 'fab-wcag-palette',
  styleUrl: 'fab-wcag-palette.css',
  shadow: true,
})
export class FabWcagPalette {
  renderColorWheel() {
    const n = COLOR_ORDER.length;
    const ringWidth = 60; // was 20
    const radius = 120; // was 60
    const center = radius + ringWidth * VARIANTS.length + 16; // add padding
    const svgSize = center * 2;
    const angleStep = 360 / n;
    // Add a little padding to avoid cut-off
    return (
      <svg width={svgSize} height={svgSize} viewBox={`-8 -8 ${svgSize + 16} ${svgSize + 16}`}>
        {COLOR_ORDER.map((color, i) => {
          const angle = i * angleStep - 90;
          return VARIANTS.map((variant, vIdx) => {
            const r0 = radius + vIdx * ringWidth;
            const r1 = r0 + ringWidth;
            const theta0 = (angle * Math.PI) / 180;
            const theta1 = ((angle + angleStep) * Math.PI) / 180;
            const x0 = center + r0 * Math.cos(theta0);
            const y0 = center + r0 * Math.sin(theta0);
            const x1 = center + r1 * Math.cos(theta0);
            const y1 = center + r1 * Math.sin(theta0);
            const x2 = center + r1 * Math.cos(theta1);
            const y2 = center + r1 * Math.sin(theta1);
            const x3 = center + r0 * Math.cos(theta1);
            const y3 = center + r0 * Math.sin(theta1);
            const largeArc = angleStep > 180 ? 1 : 0;
            const cssVar = `--${color}${variant}`;
            return (
              <path
                key={`${color}${variant}`}
                d={`M ${x0} ${y0}
                  L ${x1} ${y1}
                  A ${r1} ${r1} 0 ${largeArc} 1 ${x2} ${y2}
                  L ${x3} ${y3}
                  A ${r0} ${r0} 0 ${largeArc} 0 ${x0} ${y0} Z`}
                fill={`var(${cssVar}, #ccc)`}
                stroke="#fff"
                stroke-width="1"
                style={{ cursor: 'pointer' }}
              >
                <title>{cssVar}</title>
              </path>
            );
          });
        })}
      </svg>
    );
  }

  renderNeutrals() {
    return (
      <div class="neutral-row" style={{ display: 'flex', gap: '8px', marginTop: '8px', justifyContent: 'center' }}>
        {NEUTRALS.map(name => (
          <div
            class="neutral-swatch"
            style={{
              background: `var(--neutrals-${name}, #ccc)`,
              color: `var(--neutrals-${name}-foreground-neutral, #222)`,
              width: '64px',
              height: '64px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.7em',
              border: '1px solid #eee',
              boxShadow: '0 1px 2px #0001',
            }}
            title={name}
          >
            {name}
          </div>
        ))}
      </div>
    );
  }

  @State() pos = { x: 100, y: 100 };
  private storageKey = 'fab-wcag-palette-pos';
  @State() dragging = false;
  @State() dragOffset = { x: 0, y: 0 };
  paletteRef?: HTMLElement;

  componentWillLoad() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed === 'object' && typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          this.pos = parsed;
        }
      }
    } catch {}
  }

  private onMouseDown = (e: MouseEvent) => {
    if (e.button !== 0) return;
    const palette = this.paletteRef;
    if (!palette) return;
    const rect = palette.getBoundingClientRect();
    this.dragging = true;
    this.dragOffset = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);
  };

  private onMouseMove = (e: MouseEvent) => {
    if (!this.dragging) return;
    const width = this.paletteRef?.offsetWidth || 300;
    const height = this.paletteRef?.offsetHeight || 300;
    const maxX = window.innerWidth - width;
    const maxY = window.innerHeight - height;
    let x = e.clientX - this.dragOffset.x;
    let y = e.clientY - this.dragOffset.y;
    x = Math.max(0, Math.min(x, maxX));
    y = Math.max(0, Math.min(y, maxY));
    this.pos = { x, y };
  };

  private onMouseUp = () => {
    this.dragging = false;
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.pos));
    } catch {}
  };

  render() {
    return (
      <Host>
        <div
          class="palette-wheel-container"
          ref={el => (this.paletteRef = el as HTMLElement)}
          style={{
            position: 'fixed',
            left: `${this.pos.x}px`,
            top: `${this.pos.y}px`,
            zIndex: '9999',
            cursor: this.dragging ? 'grabbing' : 'grab',
            userSelect: 'none',
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            boxShadow: '0 2px 12px #0002',
            padding: '16px 16px 8px 16px',
            border: '1px solid #eee',
            // minWidth: '320px',
            // maxWidth: '420px',
            transition: 'box-shadow 0.2s',
          }}
          onMouseDown={this.onMouseDown}
        >
          {this.renderColorWheel()}
          {this.renderNeutrals()}
        </div>
      </Host>
    );
  }
}
