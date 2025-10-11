import { createStore } from '@stencil/store';

const { state } = createStore({
  collapsed: false,
});

export default state;

export const toggleSidebar = () => {
  state.collapsed = !state.collapsed;
};
