import { createStore } from '@stencil/store';

interface SidebarState {
  collapsed: boolean;
}

/* The store is a singleton – import it wherever you need it */
export const sidebarStore = createStore<SidebarState>({
  collapsed: false,
});
export const toggleSidebar = () => {
  sidebarStore.set('collapsed', !sidebarStore.get('collapsed'));
};

