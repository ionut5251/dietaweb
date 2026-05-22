/** Ruta base en GitHub Pages (repositorio: dietaweb → /dietaweb/) */
export function getBasePath() {
  const parts = location.pathname.split('/').filter(Boolean);
  if (parts[0] === 'dietaweb') return '/dietaweb/';
  return '/';
}

/** En GitHub Pages no hay servidor Node; la lógica corre en el navegador */
export function useLocalEngine() {
  return location.hostname.endsWith('github.io');
}
