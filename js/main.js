import { fetchOptions, generatePlan } from './api.js';
import { renderProfile, renderDiet, renderExercise } from './render.js';
import { bindPlanInteractions } from './interactions.js';
import { setPlanId } from './tracking.js';

const form = document.getElementById('plan-form');
const submitBtn = document.getElementById('submit-btn');
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

function fillSelect(id, items, placeholder) {
  const sel = document.getElementById(id);
  sel.innerHTML = `<option value="">${placeholder}</option>`;
  items.forEach(({ id: value, label }) => {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = label;
    sel.appendChild(opt);
  });
}

async function loadOptions() {
  try {
    const opts = await fetchOptions();
    fillSelect('nivelActividad', opts.actividad, '— Seleccionar actividad —');
    fillSelect('objetivo', opts.objetivos, '— Seleccionar objetivo —');
    fillSelect('experiencia', opts.experiencia, '— Seleccionar experiencia —');
  } catch {
    showError('No se pudo conectar con el servidor. ¿Está arrancado el backend?');
  }
}

function getFormPayload() {
  const fd = new FormData(form);
  return {
    sexo: fd.get('sexo'),
    edad: Number(fd.get('edad')),
    pesoKg: Number(fd.get('pesoKg')),
    alturaCm: Number(fd.get('alturaCm')),
    nivelActividad: fd.get('nivelActividad'),
    objetivo: fd.get('objetivo'),
    experiencia: fd.get('experiencia'),
    diasEntrenoSemana: Number(fd.get('diasEntrenoSemana')),
    comidasPorDia: Number(fd.get('comidasPorDia')),
    restriccionesAlimentarias: fd.get('restriccionesAlimentarias') || '',
    lesionesLimitaciones: fd.get('lesionesLimitaciones') || '',
  };
}

function setupTabs() {
  const buttons = document.querySelectorAll('.tab-btn');
  const tabDieta = document.getElementById('tab-dieta');
  const tabEjercicio = document.getElementById('tab-ejercicio');

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const isDieta = btn.dataset.tab === 'dieta';
      tabDieta.classList.toggle('hidden', !isDieta);
      tabEjercicio.classList.toggle('hidden', isDieta);
    });
  });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideError();
  submitBtn.disabled = true;
  submitBtn.textContent = 'Generando…';

  try {
    const payload = getFormPayload();
    const result = await generatePlan(payload);

    setPlanId(`plan-${Date.now()}`);

    renderProfile(result.perfil, result.avisoLegal);
    document.getElementById('tab-dieta').innerHTML = renderDiet(result.planDieta);
    document.getElementById('tab-ejercicio').innerHTML = renderExercise(result.planEjercicio);
    bindPlanInteractions();

    resultsSection.classList.remove('hidden');
    resultsSection.scrollIntoView({ behavior: 'smooth' });
  } catch (err) {
    showError(err.message, err.detalles || []);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Generar mi plan';
  }
});

setupTabs();
loadOptions();
