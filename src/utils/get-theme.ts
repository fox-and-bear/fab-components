//Get theme utility function
export function getTheme(): 'light' | 'dark' {
  const localStorageTheme = localStorage?.getItem('theme') ?? '';
  let theme: 'light' | 'dark';
  if (localStorageTheme === 'dark') {
    theme = 'dark';
  } else {
    theme = 'light';
  }
  return theme;
}
