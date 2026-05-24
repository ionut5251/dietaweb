import {
  getBasePath,
  useLocalEngine,
  loadDeployConfig,
  isAiEnabled,
  getAiProxyUrl,
} from './config.js';

const API_BASE = `${getBasePath()}api/plans`;

async function loadShared(moduleFile) {
  const base = getBasePath();
  return import(`${base}shared/${moduleFile}`);
}

export async function fetchOptions() {
  await loadDeployConfig();

  if (useLocalEngine()) {
    const { getOptions } = await loadShared('getOptions.js');
    const opts = getOptions();
    return { ...opts, aiAvailable: isAiEnabled() };
  }

  const res = await fetch(`${API_BASE}/options`);
  if (!res.ok) throw new Error('No se pudieron cargar las opciones');
  return res.json();
}

async function enhancePlanWithAi(input, basePlan) {
  const proxy = getAiProxyUrl();
  if (!proxy) return basePlan;

  const endpoint = useLocalEngine()
    ? `${proxy}/enhance-plan`
    : `${proxy}/enhance-plan`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input, basePlan }),
  });

  const data = await res.json();
  if (!res.ok) {
    console.warn('[AI]', data.error);
    return { ...basePlan, aiEnhanced: false, aiError: data.error };
  }

  const { mergeAiEnhancement } = await loadShared('ai/mergeEnhancement.js');
  const merged = mergeAiEnhancement(basePlan, data.aiJson, input);
  return {
    ...merged,
    aiEnhanced: true,
    aiInterpretacion: data.aiInterpretacion || merged.aiInterpretacion,
  };
}

export async function generatePlan(formData) {
  await loadDeployConfig();
  const payload = { ...formData, useAi: formData.useAi !== false };

  if (useLocalEngine()) {
    const { buildFullPlan } = await loadShared('generatePlan.js');
    const result = buildFullPlan(payload);
    if (!result.ok) {
      const err = new Error(result.error || 'Error al generar el plan');
      err.detalles = result.detalles || [];
      throw err;
    }
    const { ok, ...basePlan } = result;

    const shouldAi =
      isAiEnabled() &&
      (payload.queBuscaMejorar?.length > 3 ||
        payload.restriccionesAlimentarias ||
        payload.lesionesLimitaciones);

    if (shouldAi) {
      const enhanced = await enhancePlanWithAi(basePlan.datosUsuario, basePlan);
      return { ...enhanced, aiAvailable: true };
    }

    return { ...basePlan, aiEnhanced: false, aiAvailable: isAiEnabled() };
  }

  const res = await fetch(`${API_BASE}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.error || 'Error al generar el plan');
    err.detalles = data.detalles || [];
    throw err;
  }
  return data;
}

/** Análisis de foto de progreso (GPT-4o visión) — preparado para cuentas futuras */
export async function analyzeProgressPhoto(imageBase64, mimeType, context = {}) {
  await loadDeployConfig();
  const proxy = getAiProxyUrl();
  if (!proxy) throw new Error('IA no configurada');

  const path = useLocalEngine() ? `${proxy}/analyze-photo` : `${proxy}/analyze-photo`;
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, mimeType, context }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al analizar foto');
  return data.analysis;
}

export async function fetchAiStatus() {
  await loadDeployConfig();
  const proxy = getAiProxyUrl();
  if (!proxy) return { aiAvailable: false };
  try {
    const res = await fetch(`${proxy}/status`);
    return res.json();
  } catch {
    return { aiAvailable: false };
  }
}
