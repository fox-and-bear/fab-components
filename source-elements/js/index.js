document.addEventListener("DOMContentLoaded", () => {
  const toggler = document.getElementById("btn-toggle");
  const menuItems = document.querySelectorAll(".sb-menu-item[id]");

  // When toggler is clicked, close all open submenus
  if (toggler) {
    toggler.addEventListener("click", () => {
      menuItems.forEach((item) => {
        const submenuId = item.id + "-submenu";
        const submenu = document.getElementById(submenuId);
        if (submenu) {
          submenu.classList.remove("open");
        }
      });
    });
  }

  menuItems.forEach((item) => {
    item.addEventListener("click", () => {
      const submenuId = item.id + "-submenu";
      const submenu = document.getElementById(submenuId);

      if (submenu) {
        const submenuHeight = submenu.scrollHeight;
        submenu.style.setProperty("--submenu-height", `${submenuHeight}px`);

        submenu.classList.toggle("open");
        menuItems.forEach((otherItem) => {
          if (otherItem !== item) {
            const otherSubmenu = document.getElementById(
              otherItem.id + "-submenu"
            );
            if (otherSubmenu) {
              otherSubmenu.classList.remove("open");
            }
          }
        });
      }
    });
  });
});
