import { getBasePath, useLocalEngine } from './config.js';

const API_BASE = `${getBasePath()}api/plans`;

async function loadShared(moduleFile) {
  const base = getBasePath();
  return import(`${base}shared/${moduleFile}`);
}

export async function fetchOptions() {
  if (useLocalEngine()) {
    const { getOptions } = await loadShared('getOptions.js');
    return getOptions();
  }
  const res = await fetch(`${API_BASE}/options`);
  if (!res.ok) throw new Error('No se pudieron cargar las opciones');
  return res.json();
}

export async function generatePlan(formData) {
  if (useLocalEngine()) {
    const { buildFullPlan } = await loadShared('generatePlan.js');
    const result = buildFullPlan(formData);
    if (!result.ok) {
      const err = new Error(result.error || 'Error al generar el plan');
      err.detalles = result.detalles || [];
      throw err;
    }
    const { ok, ...data } = result;
    return data;
  }

  const res = await fetch(`${API_BASE}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.error || 'Error al generar el plan');
    err.detalles = data.detalles || [];
    throw err;
  }
  return data;
}
