const STORAGE_PREFIX = 'web-dieta-pesos';

export function getPlanId() {
  return sessionStorage.getItem('web-dieta-plan-id') || 'default';
}

export function setPlanId(id) {
  sessionStorage.setItem('web-dieta-plan-id', id);
}

function storageKey(exerciseId, semana, sesionIdx) {
  return `${STORAGE_PREFIX}:${getPlanId()}:s${semana}:ses${sesionIdx}:${exerciseId}`;
}

export function loadWeight(exerciseId, semana, sesionIdx) {
  return localStorage.getItem(storageKey(exerciseId, semana, sesionIdx)) || '';
}

export function saveWeight(exerciseId, semana, sesionIdx, value) {
  const key = storageKey(exerciseId, semana, sesionIdx);
  if (value === '' || value == null) {
    localStorage.removeItem(key);
  } else {
    localStorage.setItem(key, String(value));
  }
}

export function bindWeightInputs(container) {
  container.querySelectorAll('.weight-input').forEach((input) => {
    const { exerciseId, semana, sesion } = input.dataset;
    input.value = loadWeight(exerciseId, semana, sesion);

    input.addEventListener('change', () => saveWeight(exerciseId, semana, sesion, input.value));
    input.addEventListener('blur', () => saveWeight(exerciseId, semana, sesion, input.value));
  });
}
