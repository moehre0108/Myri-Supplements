const STORAGE_KEY = 'myriam_plan_v3_' + new Date().toDateString();
const lastDate = localStorage.getItem('myriam_last_date_v3');
const today = new Date().toDateString();
let state = {};
let plan = [];

if (lastDate !== today) {
    localStorage.setItem('myriam_last_date_v3', today);
    localStorage.setItem(STORAGE_KEY, '{}');
} else {
    state = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
}

function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function getAllItems() { return plan.flatMap(b => b.items); }

function updateProgress() {
    const all = getAllItems();
    const done = all.filter(i => state[i.id]).length;
    const pct = all.length > 0 ? Math.round((done / all.length) * 100) : 0;
    document.getElementById('progressFill').style.width = pct + '%';
    document.getElementById('progressText').textContent = done + ' / ' + all.length + ' erledigt';
}

function toggleItem(id) {
    state[id] = !state[id];
    saveState();
    const el = document.querySelector('[data-id="' + id + '"]');
    if (el) el.classList.toggle('done', state[id]);
    updateProgress();
}

function renderBlock(block) {
    const itemsHtml = block.items.map(item => `
    <div class="item ${state[item.id] ? 'done' : ''}" data-id="${item.id}" onclick="toggleItem('${item.id}')">
      <div class="checkbox"><span class="checkbox-check">✓</span></div>
      <div class="item-body">
        <div class="item-name">${item.name}</div>
        <div class="item-detail">${item.detail}</div>
      </div>
      ${item.badge ? `<span class="badge badge-${item.badge}">${item.badgeText}</span>` : ''}
    </div>
  `).join('');

    const warningHtml = block.warning ? `<div class="warning-box warning-${block.warning.type}">${block.warning.text}</div>` : '';

    const mealHtml = block.meal ? `
    <div class="meal-wrap">
      <div class="meal-inner" style="background:${block.meal.color}15; border-left: 3px solid ${block.meal.color}">
        <div class="meal-label" style="color:${block.meal.color}">${block.meal.label}</div>
        ${block.meal.items.map(i => `<div class="meal-item"><div class="meal-dot" style="background:${block.meal.color}"></div><span>${i}</span></div>`).join('')}
        <div class="meal-tip">${block.meal.tip}</div>
      </div>
    </div>
  ` : '';

    return `
    <div class="block">
      <div class="block-header">
        <div class="block-icon" style="background:${block.bg}">${block.icon}</div>
        <div><div class="block-title">${block.title}</div><div class="block-time">${block.time}</div></div>
      </div>
      ${warningHtml}
      ${itemsHtml}
      ${mealHtml}
    </div>
  `;
}

function render() {
    document.getElementById('dateDisplay').textContent = new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
    document.getElementById('app').innerHTML = `
    <div class="hinweis"><strong>Tippe</strong> auf eine Aufgabe zum Abhaken · Setzt sich täglich automatisch zurück</div>
    ${plan.map(renderBlock).join('')}
    <div class="reset-wrap"><button class="reset-btn" onclick="resetDay()">🔄 Tag zurücksetzen</button></div>
  `;
    updateProgress();
}

function resetDay() { state = {}; saveState(); render(); }

fetch('./plan.json')
    .then(r => r.json())
    .then(data => {
        plan = data;
        render();
    });