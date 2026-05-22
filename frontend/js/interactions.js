import { bindWeightInputs } from './tracking.js';

export function bindDietCalendar(container) {
  const weekBtns = container.querySelectorAll('[data-diet-week]');
  const dayBtns = container.querySelectorAll('[data-diet-day]');
  const detail = container.querySelector('#diet-day-detail');

  if (!detail) return;

  let activeWeek = 1;
  let activeDay = 1;

  function showDay(week, day) {
    activeWeek = week;
    activeDay = day;
    weekBtns.forEach((b) => b.classList.toggle('active', Number(b.dataset.dietWeek) === week));
    dayBtns.forEach((b) => {
      const inWeek = Number(b.dataset.dietWeek) === week;
      b.classList.toggle('hidden-day', !inWeek);
      b.classList.toggle('active', inWeek && Number(b.dataset.dietDay) === day);
    });
    detail.querySelectorAll('.diet-day-panel').forEach((p) => p.classList.add('hidden'));
    const panel = container.querySelector(`#diet-panel-w${week}-d${day}`);
    if (panel) panel.classList.remove('hidden');
  }

  weekBtns.forEach((btn) => {
    btn.addEventListener('click', () => showDay(Number(btn.dataset.dietWeek), activeDay));
  });
  dayBtns.forEach((btn) => {
    btn.addEventListener('click', () =>
      showDay(Number(btn.dataset.dietWeek), Number(btn.dataset.dietDay)),
    );
  });

  showDay(1, 1);
}

export function bindExerciseWeeks(container) {
  container.querySelectorAll('.week-accordion').forEach((accordion) => {
    const header = accordion.querySelector('.week-accordion-header');
    const body = accordion.querySelector('.week-accordion-body');
    header?.addEventListener('click', () => {
      const open = accordion.classList.toggle('open');
      if (body) body.hidden = !open;
      header.setAttribute('aria-expanded', String(open));
    });
  });
  bindWeightInputs(container);

  const firstWeek = container.querySelector('.week-accordion');
  if (firstWeek) {
    firstWeek.classList.add('open');
    const body = firstWeek.querySelector('.week-accordion-body');
    if (body) body.hidden = false;
    firstWeek.querySelector('.week-accordion-header')?.setAttribute('aria-expanded', 'true');
  }
}

export function bindPlanInteractions() {
  const dietRoot = document.getElementById('tab-dieta');
  const exerciseRoot = document.getElementById('tab-ejercicio');
  if (dietRoot) bindDietCalendar(dietRoot);
  if (exerciseRoot) bindExerciseWeeks(exerciseRoot);
}
