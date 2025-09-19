import { Component, Host, h, Prop, State, Event, EventEmitter, Element, Listen, Method, Watch } from '@stencil/core';

@Component({
  tag: 'fab-select',
  styleUrl: 'fab-select.css',
  shadow: true,

  formAssociated: true,
})
export class FabSelect {
  @Element() el!: HTMLElement;
  /**
   * Whether multiple options can be selected
   */
  @Prop() multiple: boolean = false;

  /**
   * The name of the form control (used for form submission)
   */
  @Prop() name: string = '';

  /**
   * If multiple, how many options will be shown in the collapsed state before showing "+X more"
   */
  @Prop() collapsedCount: number = 2;

  /**
   * Whether the select is disabled
   */
  @Prop() disabled: boolean = false;

  /**
   * Placeholder text to display when no option is selected
   */
  @Prop() placeholder: string = 'Select an option';

  /**
   * Whether the select is required
   */
  @Prop() required: boolean = false;

  /**
   * Emitted when selection changes
   */
  @Event() fabChange: EventEmitter<string | string[]>;

  @State() isOpen: boolean = false;
  @State() selectedOptions: Set<string> = new Set();
  @State() options: HTMLFabOptionElement[] = [];
  @State() highlightedIndex: number = -1;

  private internals: ElementInternals;

  constructor() {
    //form association - attach internals if supported, otherwise we have a hidden input fallback
    if (typeof this.el.attachInternals === 'function') {
      this.internals = this.el.attachInternals();
    }
  }

  componentWillLoad() {
    console.log('collapsedCount:', this.collapsedCount, typeof this.collapsedCount);

    // Process the slot content to extract options
    this.processOptions();
  }

  componentDidLoad() {
    // Add mutation observer to handle dynamically added options
    const observer = new MutationObserver(() => this.processOptions());
    observer.observe(this.el, { childList: true, subtree: true });
  }

  @Watch('multiple')
  onMultipleChange() {
    // If switching from multiple to single, keep only the first selected option
    if (!this.multiple && this.selectedOptions.size > 1) {
      const firstSelected = Array.from(this.selectedOptions)[0];
      this.selectedOptions = new Set([firstSelected]);
      this.emitChangeEvent();
    }
  }

  @Method()
  async getValue(): Promise<string | string[]> {
    return this.multiple ? Array.from(this.selectedOptions) : Array.from(this.selectedOptions)[0] || '';
  }

  @Method()
  async setValue(value: string | string[]) {
    if (Array.isArray(value)) {
      this.selectedOptions = new Set(value);
    } else {
      this.selectedOptions = new Set([value]);
    }
    this.updateChildrenSelection();
    this.emitChangeEvent();

    //form association
    this.updateFormValue();
  }

  // Update form value and validity whenever selection changes
  private updateFormValue() {
    const value = this.multiple ? Array.from(this.selectedOptions) : Array.from(this.selectedOptions)[0] || '';

    // Set form value
    if (this.internals) {
      this.internals.setFormValue(this.multiple ? JSON.stringify(value) : String(value));

      // Set validity
      if (this.required && this.selectedOptions.size === 0) {
        this.internals.setValidity({ valueMissing: true }, 'Please select an option');
      } else {
        this.internals.setValidity({});
      }
    }
  }

  private processOptions() {
    // Query light DOM for option elements
    const slottedElements = this.el.querySelectorAll('option, fab-option');
    this.options = Array.from(slottedElements).map(option => {
      // Create fab-option elements for standard option elements
      if (option.tagName.toLowerCase() === 'option') {
        const fabOption = document.createElement('fab-option');
        fabOption.value = option.getAttribute('value') || '';
        fabOption.innerHTML = option.innerHTML;
        fabOption.selected = option.hasAttribute('selected');

        // Replace the option with fab-option
        option.parentNode.replaceChild(fabOption, option);
        return fabOption as HTMLFabOptionElement;
      }
      return option as HTMLFabOptionElement;
    });

    this.updateSelectedFromChildren();
  }

  private updateSelectedFromChildren() {
    // Update selectedOptions based on option elements
    const selected = new Set<string>();
    this.options.forEach(option => {
      if (option.selected) {
        selected.add(option.value);
      }
    });

    this.selectedOptions = selected;
  }

  private updateChildrenSelection() {
    // Update the selected state of option elements
    this.options.forEach(option => {
      option.selected = this.selectedOptions.has(option.value);
    });
  }

  // private emitChangeEvent() {
  //   const value = this.multiple ? Array.from(this.selectedOptions) : Array.from(this.selectedOptions)[0] || '';
  //   this.fabChange.emit(value);
  // }

  // Update emitChangeEvent to also update form value
  private emitChangeEvent() {
    const value = this.multiple ? Array.from(this.selectedOptions) : Array.from(this.selectedOptions)[0] || '';

    this.fabChange.emit(value);
    this.updateFormValue();
  }

  private toggleOpen = () => {
    if (this.disabled) return;
    this.isOpen = !this.isOpen;

    if (this.isOpen) {
      // Focus the first selected option or first option
      this.highlightedIndex = this.options.findIndex(opt => this.selectedOptions.has(opt.value));
      if (this.highlightedIndex === -1) this.highlightedIndex = 0;

      // Add document click listener when opened
      setTimeout(() => {
        document.addEventListener('click', this.handleOutsideClick);
      }, 0);
    } else {
      document.removeEventListener('click', this.handleOutsideClick);
    }
  };

  private handleOutsideClick = (e: MouseEvent) => {
    if (!this.el.contains(e.target as Node)) {
      this.isOpen = false;
      document.removeEventListener('click', this.handleOutsideClick);
    }
  };

  @Listen('fabOptionSelect', { target: 'body' })
  handleOptionSelect(event: CustomEvent<string>) {
    // Find the option based on the value emitted
    const value = event.detail;
    const option = this.options.find(opt => opt.value === value);

    // If it's one of our options and the dropdown is open, select it
    if (option && this.isOpen) {
      this.selectOption(option);
      event.stopPropagation();
    }
  }

  @Listen('keydown')
  handleKeyDown(e: KeyboardEvent) {
    if (this.disabled) return;

    const { key } = e;

    // Toggle dropdown with Space or Enter
    if (key === ' ' || key === 'Enter') {
      if (!this.isOpen) {
        this.toggleOpen();
        e.preventDefault();
        return;
      }

      // Select highlighted option when dropdown is open
      if (this.isOpen && this.highlightedIndex >= 0) {
        this.selectOption(this.options[this.highlightedIndex]);
        if (!this.multiple) {
          this.isOpen = false;
          document.removeEventListener('click', this.handleOutsideClick);
        }
        e.preventDefault();
      }
    }

    // Close dropdown with Escape
    if (key === 'Escape') {
      this.isOpen = false;
      document.removeEventListener('click', this.handleOutsideClick);
      e.preventDefault();
    }

    // Navigate options with arrow keys
    if (this.isOpen) {
      if (key === 'ArrowDown') {
        this.highlightedIndex = Math.min(this.highlightedIndex + 1, this.options.length - 1);
        e.preventDefault();
      } else if (key === 'ArrowUp') {
        this.highlightedIndex = Math.max(this.highlightedIndex - 1, 0);
        e.preventDefault();
      }
    }
  }

  // Handle form reset events
  @Listen('reset', { target: 'window' })
  handleFormReset(event: Event) {
    // Check if event came from a parent form
    if (event.target && this.el.closest('form') === event.target) {
      this.selectedOptions = new Set();
      this.updateChildrenSelection();
      this.updateFormValue();
    }
  }

  private selectOption = (option: HTMLFabOptionElement) => {
    const value = option.value;

    if (this.multiple) {
      // For multiple select, toggle the selection
      if (this.selectedOptions.has(value)) {
        this.selectedOptions.delete(value);
      } else {
        this.selectedOptions.add(value);
      }
    } else {
      // For single select, replace the selection
      this.selectedOptions = new Set([value]);
      this.isOpen = false;
    }

    // Create a new Set to trigger re-render
    this.selectedOptions = new Set(this.selectedOptions);
    this.updateChildrenSelection();
    this.emitChangeEvent();
  };

  render() {
    const selectedDisplayText = this.getSelectedDisplayText();
    const isInvalid = this.required && this.selectedOptions.size === 0;

    const value = this.multiple ? JSON.stringify(Array.from(this.selectedOptions)) : Array.from(this.selectedOptions)[0] || '';

    return (
      <Host
        class={{
          'fab-select': true,
          'fab-select--open': this.isOpen,
          'fab-select--disabled': this.disabled,
        }}
        tabindex={this.disabled ? -1 : 0}
        aria-disabled={this.disabled ? 'true' : 'false'}
        aria-expanded={this.isOpen ? 'true' : 'false'}
        aria-required={this.required ? 'true' : 'false'}
        aria-invalid={isInvalid ? 'true' : 'false'}
        role="combobox"
      >
        {/* This hidden input is for form submission fallback if ElementInternals is not supported in older browsers - will likely never be required these days  */}
        {this.name && !this.internals && <input type="hidden" name={this.name} value={value} />}
        <div class="fab-select--control" onClick={this.toggleOpen} aria-haspopup="listbox">
          <div class="fab-select--value">{selectedDisplayText || <span class="fab-select--placeholder">{this.placeholder}</span>}</div>

          <div class="fab-select--indicators">
            {this.multiple && this.selectedOptions.size > 0 && <span class="fab-select--count">{this.selectedOptions.size}</span>}
            <svg
              class={{
                'fab-select--dropdown-icon': true,
                'fab-select--dropdown-icon--open': this.isOpen,
              }}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M7 10l5 5 5-5z" fill="currentColor" />
            </svg>
          </div>
        </div>

        <div
          class={{
            'fab-select--dropdown': true,
            'fab-select--dropdown--open': this.isOpen,
          }}
          role="listbox"
          aria-multiselectable={this.multiple ? 'true' : 'false'}
        >
          <div class="fab-select--options">
            {/* This slot will contain the fab-option elements */}
            <slot onSlotchange={() => this.processOptions()}></slot>
          </div>
        </div>
      </Host>
    );
  }

  private getSelectedDisplayText() {
    if (this.selectedOptions.size === 0) return '';

    // For multiple select, show count or limited items
    if (this.multiple) {
      if (this.selectedOptions.size > this.collapsedCount) {
        return `${this.selectedOptions.size} items selected`;
      }

      return Array.from(this.selectedOptions)
        .map(val => {
          const option = this.options.find(o => o.value === val);
          return option ? option.textContent : val;
        })
        .join(', ');
    }

    // For single select, show the selected option text
    const selectedValue = Array.from(this.selectedOptions)[0];
    const selectedOption = this.options.find(o => o.value === selectedValue);
    return selectedOption ? selectedOption.textContent : selectedValue;
  }
}
