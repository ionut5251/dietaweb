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

/** Config pública de despliegue (sin secretos) */
let deployConfig = {
  aiEnabled: false,
  aiProxyUrl: '',
};

export async function loadDeployConfig() {
  try {
    const base = getBasePath();
    const res = await fetch(`${base}deploy-config.json?t=${Date.now()}`);
    if (res.ok) {
      deployConfig = { ...deployConfig, ...(await res.json()) };
    }
  } catch {
    /* fallback reglas locales */
  }
  return deployConfig;
}

export function getDeployConfig() {
  return deployConfig;
}

export function isAiEnabled() {
  if (!useLocalEngine()) return true;
  return Boolean(deployConfig.aiEnabled && deployConfig.aiProxyUrl);
}

export function getAiProxyUrl() {
  if (!useLocalEngine()) return `${getBasePath()}api/ai`;
  return deployConfig.aiProxyUrl?.replace(/\/$/, '') || '';
}
