function renderMeals(comidas) {
  return comidas
    .map(
      (c) => `
    <article class="meal-card">
      <h4>${c.momento} · ${c.horarioSugerido}</h4>
      <p><strong>${c.plato}</strong></p>
      <p>${c.instrucciones}</p>
      <p class="hint">Objetivo aprox.: ${c.objetivoComida.calorias} kcal · ${c.objetivoComida.proteinasG} g proteína · ${c.objetivoComida.carbohidratosG} g carbos · ${c.objetivoComida.grasasG} g grasa</p>
      <p class="hint">💡 ${c.consejo}</p>
    </article>
  `,
    )
    .join('');
}

function renderDietCalendar(planMensual) {
  const { semanas } = planMensual;
  const weekTabs = semanas
    .map(
      (s) =>
        `<button type="button" class="cal-week-btn" data-diet-week="${s.numero}">${s.label}</button>`,
    )
    .join('');

  const dayButtons = semanas
    .flatMap((s) =>
      s.dias.map(
        (d) =>
          `<button type="button" class="cal-day-btn" data-diet-week="${s.numero}" data-diet-day="${d.numeroDia}" title="${d.diaSemana}">${d.diaSemana.slice(0, 2)}</button>`,
      ),
    )
    .join('');

  const panels = semanas
    .flatMap((s) =>
      s.dias.map(
        (d) => `
      <div id="diet-panel-w${s.numero}-d${d.numeroDia}" class="diet-day-panel hidden">
        <h4>${s.label} · ${d.diaSemana} <span class="hint">(día ${d.diaDelMes} del mes)</span></h4>
        ${renderMeals(d.comidas)}
      </div>
    `,
      ),
    )
    .join('');

  const miniGrid = semanas
    .map(
      (s) => `
    <div class="cal-mini-week">
      <span class="cal-mini-label">${s.label}</span>
      <div class="cal-mini-days">
        ${s.dias.map((d) => `<span class="cal-mini-cell" title="${d.diaSemana}">${d.diaSemana.charAt(0)}</span>`).join('')}
      </div>
    </div>
  `,
    )
    .join('');

  return `
    <div class="diet-calendar card-inner">
      <h3>Calendario del plan (4 semanas)</h3>
      <p class="hint">${planMensual.nota}</p>
      <div class="cal-mini-overview">${miniGrid}</div>
      <div class="cal-week-tabs">${weekTabs}</div>
      <div class="cal-day-row">${dayButtons}</div>
      <div id="diet-day-detail" class="diet-day-detail">${panels}</div>
    </div>
  `;
}

export function renderPersonalization(pers, modoLabel, aiEnhanced = false) {
  return `
    <h2>Plan generado: ${modoLabel}${aiEnhanced ? ' <span class="ai-badge">✦ Optimizado con IA profesional</span>' : ''}</h2>
    <p><strong>Enfoque detectado:</strong> ${pers.label}</p>
    <p class="hint">${pers.interpretacion}</p>
    ${pers.textoOriginal ? `<p class="hint">Basado en: «${pers.textoOriginal}»</p>` : ''}
  `;
}

export function renderProfile(perfil, aviso) {
  const el = document.getElementById('profile-stats');
  el.innerHTML = `
    <span class="stat-pill">Metabolismo basal: <strong>${perfil.bmr} kcal</strong></span>
    <span class="stat-pill">Gasto estimado (TDEE): <strong>${perfil.tdee} kcal</strong></span>
    <span class="stat-pill">Tu objetivo: <strong>${perfil.objetivoLabel}</strong></span>
    <span class="stat-pill">Calorías diarias: <strong>${perfil.calorias} kcal</strong></span>
    <span class="stat-pill">Proteínas: <strong>${perfil.proteinasG} g</strong></span>
    <span class="stat-pill">Carbohidratos: <strong>${perfil.carbohidratosG} g</strong></span>
    <span class="stat-pill">Grasas: <strong>${perfil.grasasG} g</strong></span>
  `;
  document.getElementById('legal-aviso').textContent = aviso;
}

export function renderDiet(plan) {
  const { resumen, reglasGenerales, planMensual, listaCompraSemanal } = plan;

  return `
    <div class="card">
      <h2>Plan de dieta — 1 mes</h2>
      <div class="stats-row">
        <span class="stat-pill">${resumen.duracionSemanas} semanas</span>
        <span class="stat-pill">${resumen.comidasAlDia} comidas/día</span>
        ${resumen.enfoquePersonalizado ? `<span class="stat-pill">Enfoque: <strong>${resumen.enfoquePersonalizado}</strong></span>` : ''}
        <span class="stat-pill">Hidratación: <strong>${resumen.hidratacion}</strong></span>
        <span class="stat-pill">${listaCompraSemanal.totalPlatosUnicos ?? '—'} platos distintos en el mes</span>
      </div>
      <h3>Reglas generales</h3>
      <ul class="rules-list">${reglasGenerales.map((r) => `<li>${r}</li>`).join('')}</ul>
      ${plan.consejosSemanalesProfesional ? `<h3>Consejos semanales (entrenador/dietista IA)</h3><ul class="rules-list">${plan.consejosSemanalesProfesional.map((c) => `<li>${c}</li>`).join('')}</ul>` : ''}
      ${resumen.notaMacrosProfesional ? `<p class="hint"><strong>Macros:</strong> ${resumen.notaMacrosProfesional}</p>` : ''}
      ${renderDietCalendar(planMensual)}
      <h3>Lista de la compra (orientativa)</h3>
      <ul class="rules-list">
        ${listaCompraSemanal.base.map((i) => `<li>${i}</li>`).join('')}
      </ul>
      <p class="hint">Platos del plan: ${listaCompraSemanal.platosPlan}</p>
    </div>
  `;
}

function renderExerciseItem(e, semanaNum, sesionIdx) {
  const weightField = e.registrarPeso
    ? `
    <div class="weight-track">
      <label for="w-${e.id}-s${semanaNum}-ses${sesionIdx}">Peso usado (kg)</label>
      <input
        type="number"
        class="weight-input"
        id="w-${e.id}-s${semanaNum}-ses${sesionIdx}"
        data-exercise-id="${e.id}"
        data-semana="${semanaNum}"
        data-sesion="${sesionIdx}"
        min="0"
        step="0.5"
        placeholder="Ej. 40"
      />
    </div>
  `
    : '';

  return `
    <li>
      <strong>${e.nombre}</strong>${e.ajustadoPorIA ? ' <span class="ai-badge-small">IA</span>' : ''}
      <span class="hint"> · ${e.enfoque}${e.varianteUsada ? ` · ${e.varianteUsada}` : ''}</span>
      <br>${e.series === '1' && String(e.repeticiones).includes('min') ? `${e.repeticiones}` : `${e.series} series × ${e.repeticiones} reps, descanso ${e.descanso}`}
      <br><span class="hint">${e.como}</span>
      ${e.notas ? `<br><span class="hint">${e.notas}</span>` : ''}
      ${weightField}
    </li>
  `;
}

function renderSessionExercises(s, semanaNum, sesionIdx) {
  if (s.bloques?.length) {
    return s.bloques
      .map(
        (bloque) => `
      <div class="exercise-block">
        <h5 class="exercise-block-title">${bloque.nombre}</h5>
        <ul class="exercise-list">
          ${bloque.ejercicios.map((e) => renderExerciseItem(e, semanaNum, sesionIdx)).join('')}
        </ul>
      </div>
    `,
      )
      .join('');
  }
  return `<ul class="exercise-list">${s.ejercicios.map((e) => renderExerciseItem(e, semanaNum, sesionIdx)).join('')}</ul>`;
}

function renderWeekAccordion(semana) {
  const sesionesHtml = semana.sesiones
    .map(
      (s, sesionIdx) => `
    <article class="session-card">
      <h4>${s.diaSemana ? s.diaSemana + ' — ' : ''}${s.dia}</h4>
      <p class="hint">${s.enfoque} · ${s.duracionEstimada}</p>
      ${s.notaEntrenador ? `<p class="trainer-note"><strong>Nota del entrenador:</strong> ${s.notaEntrenador}</p>` : ''}
      <p><strong>Calentamiento:</strong> ${s.calentamiento}</p>
      ${renderSessionExercises(s, semana.numero, sesionIdx)}
      <p><strong>Enfriamiento:</strong> ${s.enfriamiento}</p>
    </article>
  `,
    )
    .join('');

  return `
    <div class="week-accordion" data-week="${semana.numero}">
      <button type="button" class="week-accordion-header" aria-expanded="false">
        <span>${semana.label}</span>
        <span class="week-badge">${semana.bloque === 'A' ? 'Bloque A' : 'Bloque B'}</span>
        <span class="accordion-chevron">▼</span>
      </button>
      <div class="week-accordion-body" hidden>
        <p class="hint">${semana.bloqueDescripcion}</p>
        ${sesionesHtml}
      </div>
    </div>
  `;
}

export function renderAiNotice(result) {
  if (result.aiEnhanced) {
    const provider = result.plan?.personalizacion?.generadoPorClaude ? 'Claude (Anthropic)' : 'IA profesional';
    const split = result.plan?.planEjercicio?.resumen?.splitElegido;
    const splitText = split ? ` · Split: <strong>${split}</strong>` : '';
    return `<div class="ai-notice ai-notice-ok">Rutina generada por ${provider}${splitText}</div>`;
  }
  if (result.aiError) {
    return `<div class="ai-notice ai-notice-warn">${result.aiError}</div>`;
  }
  return '';
}

export function renderExercise(plan) {
  const { resumen, principios, semanas, descansoEntreSesiones } = plan;

  return `
    <div class="card">
      <h2>Plan de ejercicio — 4 semanas</h2>
      <div class="stats-row">
        <span class="stat-pill">${resumen.diasPorSemana} días/semana</span>
        <span class="stat-pill">Nivel: <strong>${resumen.nivelLabel}</strong></span>
        ${resumen.splitElegido ? `<span class="stat-pill">Split: <strong>${resumen.splitElegido}</strong></span>` : ''}
        ${resumen.enfoquePersonalizado ? `<span class="stat-pill">Enfoque: <strong>${resumen.enfoquePersonalizado}</strong></span>` : ''}
        ${resumen.esRutinaAvanzada ? '<span class="stat-pill">✦ Rutina <strong>avanzada</strong></span>' : ''}
      </div>
      ${resumen.filosofiaSemanas ? `<p class="hint"><em>${resumen.filosofiaSemanas}</em></p>` : ''}
      ${resumen.cardioExtra ? `<p class="hint">${resumen.cardioExtra}</p>` : ''}
      <p class="hint"><strong>Rotación:</strong> ${resumen.rotacion}</p>
      <h3>Principios</h3>
      <ul class="rules-list">${principios.map((p) => `<li>${p}</li>`).join('')}</ul>
      <p class="hint"><strong>Descanso:</strong> ${descansoEntreSesiones}</p>
      <h3>Sesiones de entrenamiento</h3>
      <p class="hint">Abre cada semana para ver los días. Anota el peso bajo cada ejercicio; se guarda en tu navegador.</p>
      <div class="week-accordions">
        ${semanas.map(renderWeekAccordion).join('')}
      </div>
    </div>
  `;
}
