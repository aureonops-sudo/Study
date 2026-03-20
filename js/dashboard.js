/* ============================================
   DASHBOARD - index.html Logic
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Wait for Firebase data to be ready
  if (window._apiReady) {
    window._apiReady.then(() => initDashboard());
  } else {
    window.addEventListener('apiReady', () => initDashboard());
  }
});

async function initDashboard() {
  updateDateTime();
  setInterval(updateDateTime, 1000);
  await loadStatCards();
  await loadTodoList();
  await loadGoals();
  await loadPendingHomework();
  await loadCharts();
}

/* ---------- TAB FOCUS REFRESH ---------- */
async function refreshCurrentView() {
  destroyAllCharts();
  await initDashboard();
}

/* ---------- CHART CLEANUP ---------- */
const chartInstances = {};

function destroyAllCharts() {
  Object.keys(chartInstances).forEach(key => {
    if (chartInstances[key]) {
      chartInstances[key].destroy();
      chartInstances[key] = null;
    }
  });
}

/* ---------- DATE & TIME ---------- */
function updateDateTime() {
  const el = document.getElementById('datetime-widget');
  if (!el) return;
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
  const timeStr = now.toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
  });
  el.innerHTML = `<span class="date">${dateStr}</span><span class="time">${timeStr}</span>`;
}

/* ---------- STAT CARDS ---------- */
async function loadStatCards() {
  const subjects = await API.getData('Subjects');
  const chapters = await API.getData('Chapters');
  const homework = await API.getData('Homework');
  const tests = await API.getData('Tests');

  let totalProgress = 0;
  subjects.forEach(s => {
    totalProgress += calculateSubjectProgress(s.id);
  });
  const avgProgress = subjects.length > 0 ? Math.round(totalProgress / subjects.length) : 0;

  const pendingHW = homework.filter(h => h.status === 'Pending').length;
  const totalChapters = chapters.length;

  let avgScore = 0;
  if (tests.length > 0) {
    const totalAcc = tests.reduce((sum, t) => sum + (t.marks / t.total * 100), 0);
    avgScore = Math.round(totalAcc / tests.length);
  }

  document.getElementById('stat-progress').textContent = `${avgProgress}%`;
  document.getElementById('stat-homework').textContent = pendingHW;
  document.getElementById('stat-chapters').textContent = totalChapters;
  document.getElementById('stat-accuracy').textContent = `${avgScore}%`;

  const studyMinutes = Number(localStorage.getItem("totalStudyMinutes") || 0);
  const studyHours = (studyMinutes / 60).toFixed(1);
  const studyEl = document.getElementById('stat-study-hours');
  if (studyEl) studyEl.textContent = `${studyHours}h`;
}

/* ---------- TODO LIST ---------- */
async function loadTodoList() {
  const todos = await API.getData('Todos');
  const container = document.getElementById('todo-list');
  if (!container) return;

  container.innerHTML = '';

  todos.forEach(todo => {
    const isDone = todo.done === true || todo.done === "true" || todo.done === "TRUE";
    const item = document.createElement('div');
    item.className = 'todo-item';
    item.innerHTML = `
      <div class="todo-checkbox ${isDone ? 'checked' : ''}" 
           onclick="toggleTodo('${todo.id}')">
        ${isDone ? '✓' : ''}
      </div>
      <span class="todo-text ${isDone ? 'done' : ''}">${todo.text}</span>
      <div class="todo-delete" onclick="deleteTodo('${todo.id}')">✕</div>
    `;
    container.appendChild(item);
  });
}

async function addTodo() {
  const input = document.getElementById('todo-input');
  const text = input.value.trim();
  if (!text) return;

  const newTodo = { id: generateId(), text: text, done: false };
  await API.postData('Todos', newTodo);
  input.value = '';
  await loadTodoList();
  showToast('Task added!', 'success');
}

async function toggleTodo(id) {
  const todos = await API.getData('Todos');
  const todo = todos.find(t => String(t.id) === String(id));
  if (todo) {
    const currentDone = todo.done === true || todo.done === "true" || todo.done === "TRUE";
    await API.updateData('Todos', id, { done: !currentDone });
    await loadTodoList();
  }
}

async function deleteTodo(id) {
  await API.deleteData('Todos', id);
  await loadTodoList();
  showToast('Task removed', 'info');
}

/* ---------- GOALS ---------- */
async function loadGoals() {
  const goals = await API.getData('Goals');
  const container = document.getElementById('goals-list');
  if (!container) return;

  container.innerHTML = '';

  goals.forEach(goal => {
    const item = document.createElement('div');
    item.style.marginBottom = '16px';
    item.innerHTML = `
      <div class="flex justify-between items-center mb-8">
        <span style="font-size:14px;">${goal.text}</span>
        <span class="text-blue" style="font-family:var(--font-mono);font-size:13px;">${goal.progress}%</span>
      </div>
      <div class="progress-bar-wrapper">
        <div class="progress-bar-fill blue" style="width:${goal.progress}%"></div>
      </div>
    `;
    container.appendChild(item);
  });
}

async function addGoal() {
  const input = document.getElementById('goal-input');
  const text = input.value.trim();
  if (!text) return;

  const newGoal = { id: generateId(), text: text, progress: 0 };
  await API.postData('Goals', newGoal);
  input.value = '';
  await loadGoals();
  showToast('Goal added!', 'success');
}

/* ---------- PENDING HOMEWORK ---------- */
async function loadPendingHomework() {
  const allHomework = await API.getData('Homework');
  const homework = allHomework.filter(h => h.status === 'Pending');
  const container = document.getElementById('pending-homework');
  if (!container) return;

  container.innerHTML = '';

  if (homework.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>No pending homework 🎉</p></div>';
    return;
  }

  homework.slice(0, 5).forEach(hw => {
    const item = document.createElement('div');
    item.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.03);';
    item.innerHTML = `
      <div>
        <div style="font-size:14px;font-weight:500;">${hw.title}</div>
        <div style="font-size:12px;color:var(--text-muted);margin-top:2px;">${hw.subject} · ${hw.chapter}</div>
      </div>
      <span class="badge badge-pending">Pending</span>
    `;
    container.appendChild(item);
  });
}



/* ---------- CHARTS ---------- */
async function loadCharts() {
  await loadSubjectProgressChart();
  loadStudyHoursChart();
  await loadCompletionPieChart();
}

async function loadSubjectProgressChart() {
  const ctx = document.getElementById('subject-progress-chart');
  if (!ctx) return;

  const subjects = await API.getData('Subjects');
  const labels = subjects.map(s => s.name);
  const data = subjects.map(s => calculateSubjectProgress(s.id));
  const colors = subjects.map(s => s.color);

  chartInstances['subjectProgress'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Progress %',
        data: data,
        backgroundColor: colors.map(c => c + '40'),
        borderColor: colors,
        borderWidth: 2,
        borderRadius: 8,
        barThickness: 40
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, max: 100, ticks: { color: '#8A94A6' }, grid: { color: 'rgba(255,255,255,0.04)' } },
        x: { ticks: { color: '#8A94A6' }, grid: { display: false } }
      }
    }
  });
}

function loadStudyHoursChart() {
  const ctx = document.getElementById('study-hours-chart');
  if (!ctx) return;

  const dailyLog = JSON.parse(localStorage.getItem("dailyStudyLog") || "{}");
  const labels = [];
  const data = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateKey = d.toISOString().split("T")[0];
    labels.push(d.toLocaleDateString('en-IN', { weekday: 'short' }));
    const minutes = dailyLog[dateKey] || 0;
    data.push(parseFloat((minutes / 60).toFixed(1)));
  }

  chartInstances['studyHours'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Hours', data: data,
        borderColor: '#4F8CFF', backgroundColor: 'rgba(79,140,255,0.1)',
        fill: true, tension: 0.4,
        pointBackgroundColor: '#4F8CFF', pointBorderColor: '#fff', pointBorderWidth: 2, pointRadius: 5
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { color: '#8A94A6', stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.04)' } },
        x: { ticks: { color: '#8A94A6' }, grid: { display: false } }
      }
    }
  });
}

async function loadCompletionPieChart() {
  const ctx = document.getElementById('completion-pie-chart');
  if (!ctx) return;

  const params = LocalDB.get('Parameters');
  const completed = params.filter(p => p.status === 'Completed').length;
  const pending = params.length - completed;

  chartInstances['completionPie'] = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Completed', 'Pending'],
      datasets: [{
        data: [completed, pending],
        backgroundColor: ['#00C2A8', 'rgba(255,255,255,0.06)'],
        borderWidth: 0, cutout: '75%'
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#8A94A6', padding: 16, usePointStyle: true, font: { family: 'Inter', size: 12 } }
        }
      }
    }
  });
}