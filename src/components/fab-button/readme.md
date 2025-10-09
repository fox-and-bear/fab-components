# fab-button



<!-- Auto Generated Below -->


## Properties

| Property   | Attribute  | Description                             | Type                                                                          | Default          |
| ---------- | ---------- | --------------------------------------- | ----------------------------------------------------------------------------- | ---------------- |
| `class`    | `class`    | Additional classes to add to the button | `string`                                                                      | `''`             |
| `disabled` | `disabled` | Disables the button if true             | `boolean`                                                                     | `false`          |
| `size`     | `size`     | The button sizes                        | `"icon" \| "lg" \| "size-default" \| "sm"`                                    | `'size-default'` |
| `type`     | `type`     | The button type                         | `"button" \| "reset" \| "submit"`                                             | `'button'`       |
| `variant`  | `variant`  | The button variants                     | `"default" \| "destructive" \| "ghost" \| "link" \| "outline" \| "secondary"` | `'default'`      |


## Events

| Event      | Description                        | Type                      |
| ---------- | ---------------------------------- | ------------------------- |
| `fabClick` | Emitted when the button is clicked | `CustomEvent<MouseEvent>` |


## Slots

| Slot | Description                                                                           |
| ---- | ------------------------------------------------------------------------------------- |
|      | The button content Icons should be svgs where possible to ensure they scale correctly |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
