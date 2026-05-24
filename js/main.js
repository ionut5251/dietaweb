import { fetchOptions, generatePlan } from './api.js';
import { renderProfile, renderDiet, renderExercise, renderPersonalization, renderAiNotice } from './render.js';
import { bindPlanInteractions } from './interactions.js';
import { setPlanId } from './tracking.js';

const MODE_TITLES = {
  dieta: 'Configura tu plan de dieta',
  ejercicio: 'Configura tu rutina de gimnasio',
  completo: 'Configura tu plan completo',
};

const SUBMIT_LABELS = {
  dieta: 'Generar plan de dieta',
  ejercicio: 'Generar rutina de gimnasio',
  completo: 'Generar plan completo',
};

let currentMode = 'completo';
let optionsLoaded = false;

const modeSelector = document.getElementById('mode-selector');
const formSection = document.getElementById('form-section');
const form = document.getElementById('plan-form');
const formTitle = document.getElementById('form-title');
const modoInput = document.getElementById('modo');
const submitBtn = document.getElementById('submit-btn');
const btnBack = document.getElementById('btn-back');
const errorContainer = document.getElementById('error-container');
const resultsSection = document.getElementById('results-section');

function showError(message, detalles = []) {
  errorContainer.classList.remove('hidden');
  const list = detalles.length ? `<ul>${detalles.map((d) => `<li>${d}</li>`).join('')}</ul>` : '';
  errorContainer.innerHTML = `<strong>${message}</strong>${list}`;
}

function hideError() {
  errorContainer.classList.add('hidden');
  errorContainer.innerHTML = '';
}

function fillSelect(id, items, placeholder, required = true) {
  const sel = document.getElementById(id);
  if (!sel) return;
  sel.innerHTML = `<option value="">${placeholder}</option>`;
  items.forEach(({ id: value, label }) => {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = label;
    sel.appendChild(opt);
  });
  if (!required) sel.removeAttribute('required');
  else sel.setAttribute('required', '');
}

async function loadOptions() {
  if (optionsLoaded) return;
  try {
    const opts = await fetchOptions();
    fillSelect('nivelActividad', opts.actividad, '— Seleccionar actividad —');
    fillSelect('objetivo', opts.objetivos, '— Seleccionar objetivo —');
    fillSelect('experiencia', opts.experiencia, '— Seleccionar experiencia —', false);
    optionsLoaded = true;
  } catch {
    showError('No se pudieron cargar las opciones. Comprueba la conexión o el servidor local.');
  }
}

function applyFormMode(mode) {
  currentMode = mode;
  modoInput.value = mode;
  formTitle.textContent = MODE_TITLES[mode];
  submitBtn.textContent = SUBMIT_LABELS[mode];

  document.querySelectorAll('[data-show]').forEach((el) => {
    const allowed = el.dataset.show.split(' ');
    el.classList.toggle('hidden', !allowed.includes(mode));
  });

  const comidas = document.getElementById('comidasPorDia');
  if (comidas) {
    if (mode === 'dieta' || mode === 'completo') comidas.setAttribute('required', '');
    else comidas.removeAttribute('required');
  }

  const exp = document.getElementById('experiencia');
  if (exp && mode === 'completo') {
    exp.setAttribute('required', '');
  } else if (exp) {
    exp.removeAttribute('required');
  }
}

function openForm(mode) {
  hideError();
  resultsSection.classList.add('hidden');
  applyFormMode(mode);
  modeSelector.classList.add('hidden');
  formSection.classList.remove('hidden');
  loadOptions();
  formSection.scrollIntoView({ behavior: 'smooth' });
}

function backToModes() {
  formSection.classList.add('hidden');
  modeSelector.classList.remove('hidden');
  hideError();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function getFormPayload() {
  const fd = new FormData(form);
  const payload = {
    modo: fd.get('modo'),
    sexo: fd.get('sexo'),
    edad: Number(fd.get('edad')),
    pesoKg: Number(fd.get('pesoKg')),
    alturaCm: Number(fd.get('alturaCm')),
    nivelActividad: fd.get('nivelActividad'),
    objetivo: fd.get('objetivo'),
    diasEntrenoSemana: Number(fd.get('diasEntrenoSemana')),
    queBuscaMejorar: fd.get('queBuscaMejorar') || '',
  };

  if (currentMode === 'dieta' || currentMode === 'completo') {
    payload.comidasPorDia = Number(fd.get('comidasPorDia'));
    payload.restriccionesAlimentarias = fd.get('restriccionesAlimentarias') || '';
  }
  if (currentMode === 'ejercicio' || currentMode === 'completo') {
    payload.experiencia = fd.get('experiencia') || 'intermedio';
    payload.lesionesLimitaciones = fd.get('lesionesLimitaciones') || '';
  }

  return payload;
}

function setupTabs(hasDieta, hasEjercicio) {
  const tabsEl = document.getElementById('results-tabs');
  const tabDieta = document.getElementById('tab-dieta');
  const tabEjercicio = document.getElementById('tab-ejercicio');
  const buttons = tabsEl.querySelectorAll('.tab-btn');

  if (!hasDieta || !hasEjercicio) {
    tabsEl.classList.add('hidden');
    tabDieta.classList.toggle('hidden', !hasDieta);
    tabEjercicio.classList.toggle('hidden', !hasEjercicio);
    return;
  }

  tabsEl.classList.remove('hidden');
  tabDieta.classList.remove('hidden');
  tabEjercicio.classList.add('hidden');
  buttons.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.tab === 'dieta');
    btn.onclick = () => {
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const isDieta = btn.dataset.tab === 'dieta';
      tabDieta.classList.toggle('hidden', !isDieta);
      tabEjercicio.classList.toggle('hidden', isDieta);
    };
  });
}

function renderResults(result) {
  const hasDieta = Boolean(result.planDieta);
  const hasEjercicio = Boolean(result.planEjercicio);

  const banner = document.getElementById('personalization-banner');
  const aiNotice = document.getElementById('ai-notice-container');
  aiNotice.innerHTML = renderAiNotice(result);

  if (result.personalizacion?.detectado || result.personalizacion?.textoOriginal || result.modoLabel) {
    banner.innerHTML = renderPersonalization(
      result.personalizacion,
      result.modoLabel,
      result.aiEnhanced,
    );
    banner.classList.remove('hidden');
  } else {
    banner.classList.add('hidden');
  }

  const profileCard = document.getElementById('profile-card');
  if (result.perfil) {
    renderProfile(result.perfil, result.avisoLegal);
    profileCard.classList.remove('hidden');
  } else {
    profileCard.classList.add('hidden');
  }
  document.getElementById('legal-aviso').textContent = result.avisoLegal;

  document.getElementById('tab-dieta').innerHTML = hasDieta ? renderDiet(result.planDieta) : '';
  document.getElementById('tab-ejercicio').innerHTML = hasEjercicio
    ? renderExercise(result.planEjercicio)
    : '';

  setupTabs(hasDieta, hasEjercicio);
  bindPlanInteractions();
}

document.querySelectorAll('.mode-card').forEach((card) => {
  card.addEventListener('click', () => openForm(card.dataset.mode));
});

btnBack.addEventListener('click', backToModes);
document.getElementById('btn-new-plan').addEventListener('click', () => {
  resultsSection.classList.add('hidden');
  modeSelector.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideError();
  submitBtn.disabled = true;
  const prevLabel = submitBtn.textContent;
  submitBtn.textContent = 'Generando…';

  try {
    const payload = getFormPayload();
    const hasAiHint =
      payload.queBuscaMejorar?.length > 5 ||
      payload.restriccionesAlimentarias ||
      payload.lesionesLimitaciones;
    if (hasAiHint) submitBtn.textContent = 'Generando plan (reglas + IA profesional)…';

    const result = await generatePlan(payload);

    setPlanId(`plan-${Date.now()}-${result.modo}`);
    renderResults(result);

    formSection.classList.add('hidden');
    resultsSection.classList.remove('hidden');
    resultsSection.scrollIntoView({ behavior: 'smooth' });
  } catch (err) {
    showError(err.message, err.detalles || []);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = prevLabel;
  }
});

loadOptions();
