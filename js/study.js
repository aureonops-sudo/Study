/* ============================================
   STUDY MODE Logic
   ============================================ */

let timerInterval = null;
let timerSeconds = 25 * 60;
let timerRunning = false;
let timerMode = 'pomodoro';
let accentColor = '#4F8CFF';

document.addEventListener('DOMContentLoaded', () => {
  initStudyMode();
});

function refreshCurrentView() {
  updateFlipClock();
}

function initStudyMode() {
  updateFlipClock();
  loadColorOptions();
  loadTimerPresets();
}

function startTimer() {
  if (timerRunning) return;
  timerRunning = true;
  document.getElementById('btn-start').style.display = 'none';
  document.getElementById('btn-pause').style.display = 'inline-flex';

  timerInterval = setInterval(() => {
    timerSeconds--;
    if (timerSeconds <= 0) {
      clearInterval(timerInterval);
      timerRunning = false;
      timerSeconds = 0;
      updateFlipClock();
      showToast('Timer complete! Take a break 🎉', 'success');
      playAlarm();
      logStudySession();
      document.getElementById('btn-start').style.display = 'inline-flex';
      document.getElementById('btn-pause').style.display = 'none';
      return;
    }
    updateFlipClock();
  }, 1000);
}

function pauseTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
  document.getElementById('btn-start').style.display = 'inline-flex';
  document.getElementById('btn-pause').style.display = 'none';
}

function resetTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
  if (timerMode === 'pomodoro') {
    timerSeconds = 25 * 60;
  } else {
    const customMin = parseInt(document.getElementById('custom-minutes').value) || 25;
    timerSeconds = customMin * 60;
  }
  updateFlipClock();
  document.getElementById('btn-start').style.display = 'inline-flex';
  document.getElementById('btn-pause').style.display = 'none';
}

function updateFlipClock() {
  const hours = Math.floor(timerSeconds / 3600);
  const minutes = Math.floor((timerSeconds % 3600) / 60);
  const seconds = timerSeconds % 60;

  const hEl = document.getElementById('flip-hours');
  const mEl = document.getElementById('flip-minutes');
  const sEl = document.getElementById('flip-seconds');

  if (hEl) hEl.textContent = String(hours).padStart(2, '0');
  if (mEl) mEl.textContent = String(minutes).padStart(2, '0');
  if (sEl) sEl.textContent = String(seconds).padStart(2, '0');
}

function playAlarm() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.type = 'sine';
    oscillator.frequency.value = 800;
    gainNode.gain.value = 0.3;
    oscillator.start();
    setTimeout(() => { oscillator.stop(); audioCtx.close(); }, 1000);
  } catch (e) {}
}

function logStudySession() {
  const today = getTodayStr();
  const dailyLog = JSON.parse(localStorage.getItem("dailyStudyLog") || "{}");
  let sessionMinutes = timerMode === 'pomodoro' ? 25 : (parseInt(document.getElementById('custom-minutes').value) || 25);
  dailyLog[today] = (dailyLog[today] || 0) + sessionMinutes;
  localStorage.setItem("dailyStudyLog", JSON.stringify(dailyLog));
  const totalMinutes = Number(localStorage.getItem("totalStudyMinutes") || 0) + sessionMinutes;
  localStorage.setItem("totalStudyMinutes", String(totalMinutes));
}

function loadTimerPresets() {}

function setTimerPreset(minutes) {
  clearInterval(timerInterval);
  timerRunning = false;
  timerMode = minutes === 25 ? 'pomodoro' : 'custom';
  timerSeconds = minutes * 60;
  updateFlipClock();
  document.getElementById('btn-start').style.display = 'inline-flex';
  document.getElementById('btn-pause').style.display = 'none';
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.minutes) === minutes);
  });
}

function setCustomTimer() {
  const minutes = parseInt(document.getElementById('custom-minutes').value);
  if (!minutes || minutes < 1) { showToast('Enter valid minutes', 'warning'); return; }
  setTimerPreset(minutes);
  timerMode = 'custom';
}

function loadColorOptions() {
  const colors = ['#4F8CFF', '#00C2A8', '#FFB020', '#FF5A5F', '#7B61FF', '#FF69B4'];
  const container = document.getElementById('color-options');
  if (!container) return;
  colors.forEach(color => {
    const btn = document.createElement('div');
    btn.className = `color-picker-btn ${color === accentColor ? 'active' : ''}`;
    btn.style.background = color;
    btn.onclick = () => setStudyColor(color);
    container.appendChild(btn);
  });
}

function setStudyColor(color) {
  accentColor = color;
  document.querySelectorAll('.flip-card').forEach(el => {
    el.style.color = color;
    el.style.borderColor = color + '33';
    el.style.boxShadow = `0 4px 30px ${color}20`;
  });
  document.querySelectorAll('.flip-separator').forEach(el => { el.style.color = color; });
  document.querySelectorAll('.color-picker-btn').forEach(btn => {
    btn.classList.toggle('active', btn.style.background === color);
  });
}

function uploadMusic(input) {
  const file = input.files[0];
  if (!file) return;
  const audioEl = document.getElementById('study-audio');
  if (audioEl) { audioEl.src = URL.createObjectURL(file); audioEl.play(); }
  const nameEl = document.getElementById('music-name');
  if (nameEl) nameEl.textContent = file.name;
  showToast('Music loaded!', 'success');
}

function enterStudyMode() {
  document.getElementById('study-mode-overlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function exitStudyMode() {
  pauseTimer();
  document.getElementById('study-mode-overlay').classList.remove('active');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', (e) => {
  const overlay = document.getElementById('study-mode-overlay');
  if (!overlay || !overlay.classList.contains('active')) return;
  switch (e.key) {
    case ' ': e.preventDefault(); timerRunning ? pauseTimer() : startTimer(); break;
    case 'r': resetTimer(); break;
    case 'Escape': exitStudyMode(); break;
  }
});