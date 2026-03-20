/*
/* ============================================
   AI STUDY ASSISTANT — Puter.js (Free, No API Key)
   ============================================ */
,,,
// ── STATE ──
//let assistantOpen = false;
/*let isListening = false;
let isSpeaking = false;
let conversationHistory = [];
let flashcardSets = {};
let currentQuiz = null;
let uploadedPDFs = {};
let avatarState = 'idle';
let avatarPosition = { x: 40, y: window.innerHeight - 220 };
let avatarDirection = 1;
let wanderInterval = null;
let proactiveInterval = null;
let lastInteraction = Date.now();
let puterReady = false;
let speechRecognition = null;,,,

// ── PUTER.JS CONFIG ──
const AI_MODEL = 'gpt-4o-mini'; // Free via Puter
const TTS_MODEL = 'openai/tts-1'; // Free TTS via Puter

/* ============================================
   INITIALIZATION
   ============================================ */
/*document.addEventListener('DOMContentLoaded', () => {
  initPuter();
  initSpeechRecognition();
  initAssistantData();
  initAvatar();
  startProactiveEngine();
});

function initPuter() {
  // Check if puter.js script is loaded
  if (typeof puter !== 'undefined') {
    puterReady = true;
    console.log('✅ Puter.js ready — Free AI enabled');
  } else {
    // Dynamically load puter.js
    const script = document.createElement('script');
    script.src = 'https://js.puter.com/v2/';
    script.onload = () => {
      puterReady = true;
      console.log('✅ Puter.js loaded — Free AI enabled');
    };
    script.onerror = () => {
      console.warn('⚠️ Puter.js failed to load, using fallback');
      puterReady = false;
    };
    document.head.appendChild(script);
  }
}

function initSpeechRecognition() {
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    speechRecognition = new SR();
    speechRecognition.continuous = false;
    speechRecognition.interimResults = true;
    speechRecognition.lang = 'en-IN';

    speechRecognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript;
      if (result.isFinal) {
        addUserMessage(transcript);
        processCommand(transcript);
        stopListening();
      } else {
        const input = document.getElementById('assistant-input');
        if (input) input.value = transcript;
      }
    };

    speechRecognition.onerror = () => stopListening();
    speechRecognition.onend = () => stopListening();
  }
}

function initAssistantData() {
  flashcardSets = JSON.parse(localStorage.getItem('st_flashcards') || '{}');
  uploadedPDFs = JSON.parse(localStorage.getItem('st_pdf_texts') || '{}');
  buildSystemContext();
}

/* ============================================
   SYSTEM CONTEXT
   ============================================ */
/*function buildSystemContext() {
  const subjects = typeof LocalDB !== 'undefined' ? LocalDB.get('Subjects') : [];
  const chapters = typeof LocalDB !== 'undefined' ? LocalDB.get('Chapters') : [];
  const homework = typeof LocalDB !== 'undefined' ? LocalDB.get('Homework') : [];
  const tests = typeof LocalDB !== 'undefined' ? LocalDB.get('Tests') : [];

  const pdfContext = Object.keys(uploadedPDFs).length > 0
    ? `\n\nUploaded books: ${Object.keys(uploadedPDFs).join(', ')}. Use them for accurate answers.`
    : '';

  const systemMessage = `You are StudyBot, a friendly and brilliant AI study companion for an Indian student (CBSE/NCERT curriculum, Class 11-12 level).

PERSONALITY: Warm, encouraging, playful. Like a genius friend who loves teaching. Use occasional emojis.

CAPABILITIES:
1. Answer ANY academic question — Physics, Chemistry, Math, Biology, English, History, Economics, CS, etc.
2. Solve problems step-by-step with clear explanations
3. Generate flashcards: return ONLY JSON {"cards": [{"front": "Q", "back": "A"}]}
4. Generate quizzes: return ONLY JSON {"questions": [{"q": "Q", "options": ["A. ...", "B. ...", "C. ...", "D. ..."], "answer": "A", "explanation": "why"}]}
5. Explain NCERT concepts with textbook-aligned answers
6. Study tips, exam strategies, motivation
7. Analyze progress and suggest improvements

STUDENT DATA:
- Subjects: ${subjects.map(s => s.name).join(', ') || 'None yet'}
- Chapters: ${chapters.length}
- Pending homework: ${homework.filter(h => h.status === 'Pending').length}
- Tests taken: ${tests.length}
${tests.length > 0 ? '- Recent: ' + tests.slice(-3).map(t => `${t.test_name}: ${Math.round(t.marks / t.total * 100)}%`).join(', ') : ''}
${pdfContext}

RULES:
- Concise but thorough (under 250 words usually)
- For math/physics, show step-by-step working
- When asked for flashcards, return ONLY the JSON
- When asked for a quiz, return ONLY the JSON  
- Be encouraging — celebrate wins, gently guide after mistakes
- Use LaTeX for math when needed`;

  conversationHistory = [{ role: 'system', content: systemMessage }];
}

/* ============================================
   3D AVATAR SYSTEM
   ============================================ */
// Replace inside assistant.js
/*function initAvatar() {
  const avatar = document.createElement('div');
  avatar.id = 'ai-avatar';
  avatar.className = 'ai-avatar';
  
  // Notice we now just use an <img> tag with your specific image
  avatar.innerHTML = `
    <div class="avatar-speech-bubble" id="avatar-speech-bubble">
      <p id="avatar-speech-text"></p>
      <div class="speech-bubble-tail"></div>
    </div>
    <div class="avatar-body" id="avatar-body">
      <img src="ai-avatar.png" class="chibi-img" alt="Study-chan" id="chibi-img" draggable="false" />
      <div class="avatar-shadow"></div>
    </div>
    <div class="avatar-status" id="avatar-status">Study-chan ♡</div>
  `;
  document.body.appendChild(avatar);

  updateAvatarPosition();
  setAvatarState('idle');
  startWandering();
  makeAvatarDraggable();

  const body = avatar.querySelector('.avatar-body');
  body.addEventListener('click', onAvatarClick);

  setTimeout(() => {
    setAvatarState('waving');
    avatarSpeak(getGreeting(), true);
    setTimeout(() => setAvatarState('idle'), 3500);
  }, 1000);
}

function updateAvatarPosition() {
  const avatar = document.getElementById('ai-avatar');
  if (!avatar) return;
  const maxX = window.innerWidth - 120;
  const maxY = window.innerHeight - 200;
  avatarPosition.x = Math.max(10, Math.min(avatarPosition.x, maxX));
  avatarPosition.y = Math.max(10, Math.min(avatarPosition.y, maxY));
  avatar.style.left = avatarPosition.x + 'px';
  avatar.style.top = avatarPosition.y + 'px';
}

function makeAvatarDraggable() {
  const avatar = document.getElementById('ai-avatar');
  if (!avatar) return;

  let isDragging = false;
  let dragStarted = false;
  let startX, startY, startTime;
  const body = avatar.querySelector('.avatar-body');

  function onStart(clientX, clientY) {
    isDragging = true;
    dragStarted = false;
    startX = clientX - avatarPosition.x;
    startY = clientY - avatarPosition.y;
    startTime = Date.now();
    stopWandering();
    avatar.style.transition = 'none';
  }

  function onMove(clientX, clientY) {
    if (!isDragging) return;
    dragStarted = true;
    avatarPosition.x = clientX - startX;
    avatarPosition.y = clientY - startY;
    updateAvatarPosition();
  }

  function onEnd() {
    if (isDragging) {
      isDragging = false;
      avatar.style.transition = '';
      startWandering();
    }
  }

  body.addEventListener('mousedown', (e) => { e.preventDefault(); onStart(e.clientX, e.clientY); });
  document.addEventListener('mousemove', (e) => onMove(e.clientX, e.clientY));
  document.addEventListener('mouseup', onEnd);

  body.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    onStart(t.clientX, t.clientY);
  }, { passive: true });
  document.addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    onMove(t.clientX, t.clientY);
  }, { passive: true });
  document.addEventListener('touchend', onEnd);
}

function trackEyes(e) {
  const avatar = document.getElementById('ai-avatar');
  if (!avatar) return;
  const pupils = avatar.querySelectorAll('.avatar-pupil');
  const rect = avatar.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + 30;
  const angle = Math.atan2(e.clientY - cy, e.clientX - cx);
  const dist = 3;
  const x = Math.cos(angle) * dist;
  const y = Math.sin(angle) * dist;
  pupils.forEach(p => { p.style.transform = `translate(${x}px, ${y}px)`; });
}

/* ── AVATAR STATES ── */
/*function setAvatarState(state) {
  avatarState = state;
  const body = document.getElementById('avatar-body');
  if (!body) return;
  body.className = 'avatar-body state-' + state;

  const mouth = document.getElementById('avatar-mouth');

  const mouthMap = {
    idle:        'smile',
    talking:     'talking',
    thinking:    'thinking',
    waving:      'smile-big',
    walking:     'smile',
    celebrating: 'smile-big',
    listening:   'open',
  };

  const m = mouthMap[state] || 'smile';
  if (mouth) mouth.className = 'avatar-mouth ' + m;
}

/* ── SPEECH BUBBLE ── */
/*function avatarSpeak(text, withVoice = false) {
  const bubble = document.getElementById('avatar-speech-bubble');
  const textEl = document.getElementById('avatar-speech-text');
  if (!bubble || !textEl) return;

  const displayText = text.length > 160 ? text.substring(0, 157) + '...' : text;
  textEl.textContent = displayText;
  bubble.classList.add('visible');
  setAvatarState('talking');

  if (withVoice) speakText(text);

  const readTime = Math.max(4000, displayText.length * 50);
  setTimeout(() => {
    bubble.classList.remove('visible');
    if (avatarState === 'talking') setAvatarState('idle');
  }, readTime);
}

function avatarReact(reaction) {
  const map = { happy: 'celebrating', think: 'thinking', wave: 'waving' };
  setAvatarState(map[reaction] || 'idle');
  setTimeout(() => setAvatarState('idle'), 2500);
}

/* ── WANDERING ── 
function startWandering() {
  stopWandering();
  wanderInterval = setInterval(() => {
    if (assistantOpen || avatarState === 'talking' || avatarState === 'thinking') return;
    if (Date.now() - lastInteraction < 10000) return;
    if (Math.random() > 0.6) wanderStep();
  }, 5000);
}

function stopWandering() {
  if (wanderInterval) clearInterval(wanderInterval);
}

function wanderStep() {
  setAvatarState('walking');

  const targetX = avatarPosition.x + (Math.random() - 0.5) * 200;
  const targetY = avatarPosition.y + (Math.random() - 0.5) * 80;

  avatarDirection = targetX > avatarPosition.x ? 1 : -1;
  const body = document.getElementById('avatar-body');
  if (body) body.style.transform = `scaleX(${avatarDirection})`;

  const avatar = document.getElementById('ai-avatar');
  if (avatar) avatar.style.transition = 'left 2s ease, top 2s ease';

  avatarPosition.x = Math.max(10, Math.min(targetX, window.innerWidth - 120));
  avatarPosition.y = Math.max(window.innerHeight - 350, Math.min(targetY, window.innerHeight - 150));
  updateAvatarPosition();

  setTimeout(() => {
    setAvatarState('idle');
    if (avatar) avatar.style.transition = '';
  }, 2100);
}

/* ── AVATAR CLICK ── *
function onAvatarClick() {
  lastInteraction = Date.now();
  if (!assistantOpen) {
    toggleAssistant();
    avatarReact('wave');
  } else {
    const tips = [
      'Need help? Just ask me anything! 😊',
      'Try "create flashcards for Physics chapter Gravitation"!',
      'Upload a photo of your doubt — I\'ll solve it! 📸',
      'Say "quiz me on Chemistry" to test yourself! 📝',
      'Ask me to explain any NCERT concept!',
    ];
    const tip = tips[Math.floor(Math.random() * tips.length)];
    avatarSpeak(tip, true);
  }
}

/* ============================================
   PROACTIVE ENGINE
   ============================================ *
function startProactiveEngine() {
  proactiveInterval = setInterval(() => {
    if (assistantOpen || avatarState !== 'idle') return;
    if (Date.now() - lastInteraction < 90000) return; // 90s cooldown

    const prompt = getProactivePrompt();
    if (prompt) {
      avatarSpeak(prompt, true);
      lastInteraction = Date.now();
    }
  }, 45000);

  // Page greeting
  setTimeout(() => {
    const greet = getPageGreeting();
    if (greet && Date.now() - lastInteraction > 5000) {
      avatarSpeak(greet, true);
    }
  }, 4000);
}

function getPageGreeting() {
  const page = document.body.getAttribute('data-page');
  const map = {
    subjects: 'Here are your subjects! Want me to quiz you on any chapter? 📚',
    homework: 'Let\'s tackle that homework! I can help if you\'re stuck. 📝',
    assignments: 'Working on assignments? I\'m here to help! 📑',
    tests: 'Let me analyze your test performance! 📊',
    study: 'Study mode activated! I\'ll be quiet but I\'m here if you need me. 🤫',
  };
  return map[page] || null;
}

function getProactivePrompt() {
  const hour = new Date().getHours();
  const pool = [];

  if (hour >= 22) pool.push('Getting late! Sleep is important for memory — rest well tonight. 😴');
  if (hour >= 14 && hour <= 15) pool.push('Post-lunch slump? A 5-minute walk can refresh your brain! 💪');

  if (typeof LocalDB !== 'undefined') {
    const pending = LocalDB.get('Homework').filter(h => h.status === 'Pending');
    if (pending.length > 3) pool.push(`You have ${pending.length} pending items. Want help prioritizing?`);
  }

  const motivation = [
    'Consistency beats intensity — even 25 minutes of focused study counts! 📖',
    'Try the Pomodoro technique: 25 min study, 5 min break! ⏱️',
    'Want a quick quiz to test what you know? Just ask! 📝',
    'Teaching a concept = best way to learn it! Try explaining it to me. 🧠',
  ];

  if (Math.random() > 0.6) pool.push(motivation[Math.floor(Math.random() * motivation.length)]);
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

/* ============================================
   TEXT-TO-SPEECH (Puter TTS + Browser Fallback)
   ============================================ *
async function speakText(text) {
  const cleaned = text.replace(/[*#`_{}[\]]/g, '').replace(/<[^>]*>/g, '').replace(/\{[\s\S]*\}/g, '').trim();
  if (cleaned.length < 5) return;

  setAvatarState('talking');
  isSpeaking = true;

  // Try Puter TTS first (much better quality)
  if (puterReady && typeof puter !== 'undefined') {
    try {
      // Truncate for TTS (keep it reasonable)
      const ttsText = cleaned.length > 500 ? cleaned.substring(0, 497) + '...' : cleaned;

      const response = await puter.ai.txt2speech(ttsText, {
        model: 'openai/tts-1',
        voice: 'shimmer' // Options: alloy, echo, fable, onyx, nova, shimmer
      });

      // response is a Blob
      const audioUrl = URL.createObjectURL(response);
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        isSpeaking = false;
        if (avatarState === 'talking') setAvatarState('idle');
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        // Fallback to browser TTS
        browserSpeak(cleaned);
      };

      await audio.play();
      return;
    } catch (err) {
      console.warn('Puter TTS failed, using browser fallback:', err);
    }
  }

  // Browser fallback
  browserSpeak(cleaned);
}

function browserSpeak(text) {
  if (!('speechSynthesis' in window)) {
    isSpeaking = false;
    if (avatarState === 'talking') setAvatarState('idle');
    return;
  }

  window.speechSynthesis.cancel();
  const chunks = text.match(/[^.!?]+[.!?]+/g) || [text];

  chunks.forEach((chunk, i) => {
    const utt = new SpeechSynthesisUtterance(chunk.trim());
    utt.lang = 'en-IN';
    utt.rate = 1.0;
    utt.pitch = 1.35;

    if (i === chunks.length - 1) {
      utt.onend = () => {
        isSpeaking = false;
        if (avatarState === 'talking') setAvatarState('idle');
      };
    }
    window.speechSynthesis.speak(utt);
  });
}

function stopSpeaking() {
  window.speechSynthesis.cancel();
  isSpeaking = false;
  setAvatarState('idle');

  // Stop any playing audio
  document.querySelectorAll('audio').forEach(a => { a.pause(); a.currentTime = 0; });
}

/* ============================================
   VOICE INPUT
   ============================================ *
function toggleVoice() {
  if (!speechRecognition) {
    if (typeof showToast === 'function') showToast('Voice not supported in this browser', 'warning');
    return;
  }

  if (isListening) {
    speechRecognition.stop();
    stopListening();
  } else {
    speechRecognition.start();
    startListening();
  }
}

function startListening() {
  isListening = true;
  const btn = document.getElementById('voice-btn');
  if (btn) btn.classList.add('listening');
  setAvatarState('listening');
}

function stopListening() {
  isListening = false;
  const btn = document.getElementById('voice-btn');
  if (btn) btn.classList.remove('listening');
  if (avatarState === 'listening') setAvatarState('idle');
}

/* ============================================
   MESSAGES UI
   ============================================ *
function addBotMessage(text, isHTML = false) {
  const body = document.getElementById('assistant-body');
  if (!body) return;

  const msg = document.createElement('div');
  msg.className = 'assistant-msg bot';
  msg.innerHTML = isHTML ? text : formatMessage(text);

  if (!isHTML) {
    const speakBtn = document.createElement('button');
    speakBtn.className = 'msg-speak-btn';
    speakBtn.innerHTML = '🔊';
    speakBtn.title = 'Read aloud';
    speakBtn.onclick = () => speakText(text);
    msg.appendChild(speakBtn);
  }

  body.appendChild(msg);
  body.scrollTop = body.scrollHeight;
}

function addUserMessage(text) {
  const body = document.getElementById('assistant-body');
  if (!body) return;

  const msg = document.createElement('div');
  msg.className = 'assistant-msg user';
  msg.textContent = text;
  body.appendChild(msg);
  body.scrollTop = body.scrollHeight;
}

function addTypingIndicator() {
  const body = document.getElementById('assistant-body');
  if (!body) return;
  const t = document.createElement('div');
  t.className = 'assistant-msg bot typing-indicator';
  t.id = 'typing-indicator';
  t.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
  body.appendChild(t);
  body.scrollTop = body.scrollHeight;
}

function removeTypingIndicator() {
  const el = document.getElementById('typing-indicator');
  if (el) 

/* ============================================
   SEND MESSAGE
   ============================================ *
function sendAssistantMessage() {
  const input = document.getElementById('assistant-input');
  const text = input.value.trim();
  if (!text) return;
  addUserMessage(text);
  input.value = '';
  lastInteraction = Date.now();
  processCommand(text);
}

/* ============================================
   TOGGLE PANEL
   ============================================ *
function toggleAssistant() {
  assistantOpen = !assistantOpen;
  const panel = document.getElementById('assistant-panel');
  if (panel) panel.classList.toggle('active', assistantOpen);
  lastInteraction = Date.now();

  if (assistantOpen) {
    setAvatarState('waving');
    setTimeout(() => setAvatarState('idle'), 1500);

    // Move avatar near panel
    const avatar = document.getElementById('ai-avatar');
    if (avatar) {
      avatar.style.transition = 'left 0.5s ease, top 0.5s ease';
      avatarPosition.x = Math.min(window.innerWidth - 480, window.innerWidth - 160);
      avatarPosition.y = window.innerHeight / 2 - 60;
      updateAvatarPosition();
      setTimeout(() => { avatar.style.transition = ''; }, 600);
    }

    // Welcome
    const body = document.getElementById('assistant-body');
    if (body && body.children.length === 0) {
      addBotMessage(getGreeting());
    }
  }
}

/* ============================================
   COMMAND PROCESSING
   ============================================ *
async function processCommand(input) {
  const cmd = input.toLowerCase().trim();

  // ── Quick commands ──
  if (cmd.includes('start timer') || cmd.includes('pomodoro') || cmd.includes('start study')) {
    addBotMessage('Starting your study timer! Focus mode ON ⏱️');
    avatarSpeak('Timer started! Let\'s focus!', true);
    if (typeof enterStudyMode === 'function') enterStudyMode();
    if (typeof startTimer === 'function') startTimer();
    return;
  }

  if ((cmd.includes('show') || cmd.includes('list')) && cmd.includes('pending')) {
    const hw = typeof LocalDB !== 'undefined' ? LocalDB.get('Homework').filter(h => h.status === 'Pending') : [];
    if (hw.length === 0) {
      addBotMessage('No pending homework! You\'re all caught up! 🎉');
      avatarReact('happy');
    } else {
      let r = `**${hw.length} pending homework:**\n`;
      hw.forEach((h, i) => r += `${i + 1}. **${h.title}** (${h.subject})\n`);
      addBotMessage(r);
    }
    return;
  }

  if (cmd === 'help' || cmd === 'what can you do') {
    showHelpMenu();
    return;
  }

  if (cmd.includes('flashcard') || cmd.includes('flash card')) {
    const subject = extractSubject(cmd);
    const chapter = extractChapter(cmd);
    if (subject || chapter) {
      await generateFlashcards(subject, chapter, cmd);
    } else {
      addBotMessage('Which topic? e.g. "Create flashcards for Physics Laws of Motion"');
    }
    return;
  }

  if (cmd.includes('quiz') || cmd.includes('test me') || cmd.includes('practice test')) {
    const subject = extractSubject(cmd);
    const chapter = extractChapter(cmd);
    if (subject || chapter) {
      await generateQuiz(subject, chapter, cmd);
    } else {
      addBotMessage('Which topic? e.g. "Quiz me on Chemistry Atomic Structure"');
    }
    return;
  }

  if (currentQuiz && (cmd.match(/^[abcd]$/) || cmd.match(/^option [abcd]$/))) {
    handleQuizAnswer(cmd.replace('option ', '').trim());
    return;
  }

  if (cmd.includes('progress') || cmd.includes('summary') || cmd.includes('status')) {
    showProgress();
    return;
  }

  if (cmd.includes('suggest') || cmd.includes('recommend') || cmd.includes('what should i study')) {
    await getAISuggestion();
    return;
  }

  // Navigation
  const navMap = {
    'open homework': 'homework.html', 'go to homework': 'homework.html',
    'open test': 'tests.html', 'go to test': 'tests.html',
    'open subject': 'subjects.html', 'go to subject': 'subjects.html',
    'open study': 'study.html', 'study mode': 'study.html',
    'open dashboard': 'index.html', 'go home': 'index.html',
    'open assignment': 'assignments.html', 'go to assignment': 'assignments.html'
  };
  for (const [trigger, url] of Object.entries(navMap)) {
    if (cmd.includes(trigger)) {
      addBotMessage('Taking you there! 🚀');
      avatarSpeak('On it!', true);
      setTimeout(() => window.location.href = url, 800);
      return;
    }
  }

  if (cmd.includes('upload pdf') || cmd.includes('upload book') || cmd.includes('upload ncert')) {
    triggerPDFUpload();
    return;
  }

  if (cmd.includes('upload image') || cmd.includes('upload photo') || cmd.includes('solve doubt') || cmd.includes('scan')) {
    triggerImageUpload();
    return;
  }

  if (cmd.includes('show flashcard') || cmd.includes('my flashcard') || cmd.includes('review flashcard')) {
    showSavedFlashcards();
    return;
  }

  if (cmd.includes('stop') && (cmd.includes('speaking') || cmd.includes('talking'))) {
    stopSpeaking();
    addBotMessage('Okay, I\'ll be quiet! 🤫');
    return;
  }

  if (cmd.includes('shut up') || cmd.includes('be quiet') || cmd.includes('silence')) {
    stopSpeaking();
    addBotMessage('😶');
    return;
  }

  // ── Everything else → Puter AI ──
  await askAI(input);
}

/* ============================================
   PUTER AI CALL (FREE — No API Key!)
   ============================================ *
async function askAI(userMessage) {
  addTypingIndicator();
  setAvatarState('thinking');

  conversationHistory.push({ role: 'user', content: userMessage });

  // Trim history to last 20 messages + system
  if (conversationHistory.length > 22) {
    conversationHistory = [conversationHistory[0], ...conversationHistory.slice(-20)];
  }

  // Add PDF context if relevant
  let contextualMessages = [...conversationHistory];
  const relevantPDF = findRelevantPDF(userMessage);
  if (relevantPDF) {
    const lastIdx = contextualMessages.length - 1;
    contextualMessages[lastIdx] = {
      role: 'user',
      content: userMessage + `\n\n[Reference from ${relevantPDF.name}]:\n${relevantPDF.text.substring(0, 4000)}`
    };
  }

  try {
    if (!puterReady || typeof puter === 'undefined') {
      throw new Error('Puter not loaded');
    }

    const response = await puter.ai.chat(contextualMessages, {
      model: AI_MODEL,
      stream: false
    });

    removeTypingIndicator();

    // Puter returns response.message.content or response directly
    let reply = '';
    if (response && response.message && response.message.content) {
      reply = response.message.content;
    } else if (typeof response === 'string') {
      reply = response;
    } else if (response && response.toString) {
      reply = response.toString();
    }

    if (!reply) {
      addBotMessage('Sorry, I got an empty response. Please try again!');
      setAvatarState('idle');
      return;
    }

    conversationHistory.push({ role: 'assistant', content: reply });

    // Check for flashcard JSON
    if (reply.includes('"cards"') && reply.includes('"front"')) {
      parseAndShowFlashcards(reply, userMessage);
      avatarSpeak('Here are your flashcards!', true);
      avatarReact('happy');
      return;
    }

    // Check for quiz JSON
    if (reply.includes('"questions"') && reply.includes('"options"')) {
      parseAndShowQuiz(reply);
      avatarSpeak('Quiz time! Let\'s test your knowledge!', true);
      return;
    }

    addBotMessage(reply);
    setAvatarState('talking');

    if (reply.length < 300) {
      avatarSpeak(reply, true);
    } else {
      avatarSpeak(reply.substring(0, 100) + '...', false);
      setTimeout(() => setAvatarState('idle'), 3000);
    }

  } catch (error) {
    removeTypingIndicator();
    console.error('AI Error:', error);

    // Provide helpful error message
    addBotMessage('⚠️ Couldn\'t reach the AI service. Make sure you\'re connected to the internet. Puter.js provides free AI — no API key needed!\n\nTry refreshing the page if this persists.');
    setAvatarState('idle');
  }
}

/* ============================================
   IMAGE UPLOAD (DOUBT SOLVING)
   ============================================ *
function triggerImageUpload() {
  avatarSpeak('Upload your doubt image!', true);

  const html = `
    <div class="image-upload-area">
      <p>📸 <strong>Upload an image of your doubt:</strong></p>
      <input type="file" id="doubt-image-input" accept="image/*" capture="environment"
             onchange="handleImageUpload(event)" style="display:none" />
      <button class="btn btn-primary btn-sm" onclick="document.getElementById('doubt-image-input').click()"
              style="margin:8px 0;">📷 Choose Image / Camera</button>
      <div id="image-preview-container"></div>
    </div>`;
  addBotMessage(html, true);
}

async function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const preview = document.getElementById('image-preview-container');
  if (preview) {
    preview.innerHTML = `<img src="${URL.createObjectURL(file)}" 
      style="max-width:100%;max-height:200px;border-radius:8px;margin:8px 0;" />
      <p style="font-size:12px;color:var(--text-secondary);">Analyzing with AI...</p>`;
  }

  setAvatarState('thinking');
  avatarSpeak('Let me analyze that...', true);

  addUserMessage('📸 [Doubt image uploaded]');

  try {
    // Try Puter AI vision (if the model supports it)
    if (puterReady && typeof puter !== 'undefined') {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = async function (e) {
        const base64 = e.target.result;

        try {
          // Try with vision-capable model
          const response = await puter.ai.chat([
            {
              role: 'user',
              content: [
                {
                  type: 'image_url',
                  image_url: { url: base64 }
                },
                {
                  type: 'text',
                  text: 'This is a student\'s doubt/question image. Please: 1) Read and identify the question/problem shown. 2) Solve it step-by-step. 3) Explain the concept clearly. If it\'s a math/physics problem, show full working. If you can\'t read it clearly, describe what you see and ask for clarification.'
                }
              ]
            }
          ], { model: 'gpt-4o-mini' });

          removeTypingIndicator();

          let reply = response?.message?.content || response?.toString() || '';
          if (reply) {
            conversationHistory.push({ role: 'assistant', content: reply });
            addBotMessage(reply);
            avatarSpeak('I\'ve analyzed your doubt! Check my solution above.', true);
          } else {
            askForManualInput();
          }
        } catch (visionErr) {
          console.warn('Vision failed:', visionErr);
          askForManualInput();
        }
      };
      reader.readAsDataURL(file);
    } else {
      askForManualInput();
    }
  } catch (err) {
    askForManualInput();
  }
}

function askForManualInput() {
  removeTypingIndicator();
  addBotMessage('I can see you uploaded an image! Could you **type out the question** or describe what\'s shown? I\'ll solve it step-by-step for you! ✏️\n\nIf it\'s a math equation, type it out and I\'ll work through it.');
  setAvatarState('idle');
}

/* ============================================
   PDF UPLOAD
   ============================================ *
function triggerPDFUpload() {
  const html = `
    <div class="pdf-upload-area">
      <p>📄 Upload your NCERT textbook (PDF or TXT) — I'll use it for accurate answers!</p>
      <input type="file" id="pdf-input" accept=".pdf,.txt" onchange="handlePDFUpload(event)" style="display:none" />
      <button class="btn btn-primary btn-sm" onclick="document.getElementById('pdf-input').click()"
              style="margin:8px 0;">📁 Choose File</button>
      ${Object.keys(uploadedPDFs).length > 0 ?
        '<p style="margin-top:6px;font-size:11px;"><strong>Uploaded:</strong> ' + Object.keys(uploadedPDFs).join(', ') + '</p>' : ''}
    </div>`;
  addBotMessage(html, true);
}

async function handlePDFUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  addBotMessage('📖 Reading file...');
  setAvatarState('thinking');

  try {
    let text = '';
    if (file.name.endsWith('.txt')) {
      text = await file.text();
    } else if (file.name.endsWith('.pdf')) {
      text = await extractPDFText(file);
    }

    if (text.length > 100) {
      const bookName = prompt('Name this book (e.g., "Physics Class 11 NCERT"):', file.name.replace(/\.[^.]+$/, ''));
      if (bookName) {
        uploadedPDFs[bookName] = {
          name: bookName,
          text: text.substring(0, 50000),
          uploadedAt: new Date().toISOString()
        };
        try { localStorage.setItem('st_pdf_texts', JSON.stringify(uploadedPDFs)); } catch (e) {
          const keys = Object.keys(uploadedPDFs);
          if (keys.length > 3) { delete uploadedPDFs[keys[0]]; localStorage.setItem('st_pdf_texts', JSON.stringify(uploadedPDFs)); }
        }
        buildSystemContext();
        addBotMessage(`✅ **${bookName}** uploaded! (${Math.round(text.length / 1000)}K chars)\n\nAsk me anything from this book!`);
        avatarSpeak(`${bookName} uploaded! I can now reference it.`, true);
        avatarReact('happy');
      }
    } else {
      addBotMessage('⚠️ Couldn\'t extract enough text. Try a .txt file.');
    }
  } catch (err) {
    addBotMessage('⚠️ Error reading file. Try a .txt version.');
  }
  setAvatarState('idle');
}

async function extractPDFText(file) {
  if (typeof pdfjsLib === 'undefined') {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }
  const ab = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
  let fullText = '';
  const max = Math.min(pdf.numPages, 200);
  for (let i = 1; i <= max; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    fullText += content.items.map(item => item.str).join(' ') + '\n';
  }
  return fullText;
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

function findRelevantPDF(query) {
  const q = query.toLowerCase();
  for (const [name, data] of Object.entries(uploadedPDFs)) {
    const n = name.toLowerCase();
    if (q.includes('physics') && n.includes('physics')) return data;
    if (q.includes('chemistry') && n.includes('chem')) return data;
    if (q.includes('math') && n.includes('math')) return data;
    if (q.includes('biology') && n.includes('bio')) return data;
    if (q.includes('english') && n.includes('english')) return data;
    if (q.includes('history') && n.includes('history')) return data;
    if (q.includes('ncert') || q.includes('textbook')) return data;
  }
  return null;
}

/* ============================================
   FLASHCARDS
   ============================================ *
async function generateFlashcards(subject, chapter, originalCmd) {
  setAvatarState('thinking');
  avatarSpeak('Creating flashcards...', true);

  const prompt = `Generate exactly 10 flashcards for ${subject || ''} ${chapter ? 'chapter: ' + chapter : ''}. 
Student asked: "${originalCmd}"
Return ONLY valid JSON: {"cards": [{"front": "question or term", "back": "concise answer or definition"}]}
Cover key concepts, definitions, formulas from NCERT.`;

  await askAI(prompt);
}

function parseAndShowFlashcards(text, context) {
  try {
    const jsonMatch = text.match(/\{[\s\S]*"cards"[\s\S]*\}/);
    if (!jsonMatch) { addBotMessage(text); return; }
    const data = JSON.parse(jsonMatch[0]);
    if (!data.cards || data.cards.length === 0) { addBotMessage(text); return; }

    const setId = 'fc_' + Date.now();
    flashcardSets[setId] = { name: context || 'Flashcard Set', cards: data.cards, created: new Date().toISOString() };
    localStorage.setItem('st_flashcards', JSON.stringify(flashcardSets));
    displayFlashcardSet(setId, data.cards);
  } catch (e) { addBotMessage(text); }
}

function displayFlashcardSet(setId, cards) {
  window['fc_index_' + setId] = 0;
  const html = `<div class="flashcard-set" data-set="${setId}">
    <p><strong>📇 ${cards.length} Flashcards Ready!</strong></p>
    <div class="flashcard-viewer">
      <div class="flashcard" onclick="this.classList.toggle('flipped')" id="flashcard-${setId}">
        <div class="flashcard-front"><p>${cards[0].front}</p><span class="flip-hint">Tap to flip</span></div>
        <div class="flashcard-back"><p>${cards[0].back}</p></div>
      </div>
      <div class="flashcard-nav">
        <button class="btn btn-secondary btn-sm" onclick="navigateFlashcard('${setId}', -1)">← Prev</button>
        <span id="fc-counter-${setId}">1 / ${cards.length}</span>
        <button class="btn btn-primary btn-sm" onclick="navigateFlashcard('${setId}', 1)">Next →</button>
      </div>
    </div>
  </div>`;
  addBotMessage(html, true);
}

function navigateFlashcard(setId, dir) {
  const set = flashcardSets[setId];
  if (!set) return;
  let idx = window['fc_index_' + setId] || 0;
  idx += dir;
  if (idx < 0) idx = set.cards.length - 1;
  if (idx >= set.cards.length) idx = 0;
  window['fc_index_' + setId] = idx;

  const card = document.getElementById(`flashcard-${setId}`);
  if (card) {
    card.classList.remove('flipped');
    card.querySelector('.flashcard-front p').textContent = set.cards[idx].front;
    card.querySelector('.flashcard-back p').textContent = set.cards[idx].back;
  }
  const counter = document.getElementById(`fc-counter-${setId}`);
  if (counter) counter.textContent = `${idx + 1} / ${set.cards.length}`;
}

function showSavedFlashcards() {
  const sets = Object.entries(flashcardSets);
  if (sets.length === 0) { addBotMessage('No flashcards yet. Say "create flashcards for [topic]"!'); return; }

  let html = '<p><strong>📇 Saved Flashcard Sets:</strong></p>';
  sets.forEach(([id, set]) => {
    html += `<div style="margin:6px 0;padding:8px;background:var(--bg-secondary);border-radius:8px;cursor:pointer;" 
      onclick="displayFlashcardSet('${id}', flashcardSets['${id}'].cards)">
      <strong>${set.name.substring(0, 50)}</strong><br>
      <small>${set.cards.length} cards • ${new Date(set.created).toLocaleDateString()}</small>
    </div>`;
  });
  addBotMessage(html, true);
}

/* ============================================
   QUIZZES
   ============================================ *
async function generateQuiz(subject, chapter, originalCmd) {
  setAvatarState('thinking');
  avatarSpeak('Preparing your quiz!', true);

  const prompt = `Generate 5 MCQ quiz for ${subject || ''} ${chapter ? 'chapter: ' + chapter : ''}.
Student asked: "${originalCmd}"
Return ONLY valid JSON: {"questions": [{"q": "question", "options": ["A. opt1", "B. opt2", "C. opt3", "D. opt4"], "answer": "A", "explanation": "brief"}]}
Mix conceptual and application-based. Progressive difficulty.`;

  await askAI(prompt);
}

function parseAndShowQuiz(text) {
  try {
    const jsonMatch = text.match(/\{[\s\S]*"questions"[\s\S]*\}/);
    if (!jsonMatch) { addBotMessage(text); return; }
    const data = JSON.parse(jsonMatch[0]);
    if (!data.questions || data.questions.length === 0) { addBotMessage(text); return; }
    currentQuiz = { questions: data.questions, currentIndex: 0, score: 0, total: data.questions.length };
    showQuizQuestion();
  } catch (e) { addBotMessage(text); }
}

function showQuizQuestion() {
  if (!currentQuiz) return;
  const q = currentQuiz.questions[currentQuiz.currentIndex];

  let html = `<div class="quiz-container">
    <p class="quiz-progress">📝 Q${currentQuiz.currentIndex + 1} of ${currentQuiz.total}</p>
    <p class="quiz-question"><strong>${q.q}</strong></p>
    <div class="quiz-options">`;
  q.options.forEach((opt, i) => {
    const letter = ['a', 'b', 'c', 'd'][i];
    html += `<button class="quiz-option-btn" onclick="handleQuizAnswer('${letter}')">${opt}</button>`;
  });
  html += '</div></div>';
  addBotMessage(html, true);
  avatarSpeak(q.q, true);
}

function handleQuizAnswer(answer) {
  if (!currentQuiz) return;
  const q = currentQuiz.questions[currentQuiz.currentIndex];
  const correct = q.answer.toLowerCase().charAt(0);
  const isCorrect = answer === correct;

  if (isCorrect) {
    currentQuiz.score++;
    addBotMessage(`✅ **Correct!** ${q.explanation || ''}`);
    avatarReact('happy');
    avatarSpeak('Correct!', true);
  } else {
    addBotMessage(`❌ **Wrong.** Answer: **${q.answer}**. ${q.explanation || ''}`);
    avatarSpeak('Not quite. The answer is ' + q.answer, true);
  }

  currentQuiz.currentIndex++;
  if (currentQuiz.currentIndex < currentQuiz.total) {
    setTimeout(showQuizQuestion, 1800);
  } else {
    const pct = Math.round((currentQuiz.score / currentQuiz.total) * 100);
    const emoji = pct >= 80 ? '🎉' : pct >= 60 ? '👍' : '💪';
    setTimeout(() => {
      addBotMessage(`${emoji} **Quiz Complete!** Score: **${currentQuiz.score}/${currentQuiz.total}** (${pct}%)\n\n${
        pct >= 80 ? 'Excellent work!' : pct >= 60 ? 'Good! Review what you missed.' : 'Keep practicing — you\'ll get better!'
      }`);
      pct >= 80 ? avatarReact('happy') : avatarSpeak(`${pct} percent. Let's keep practicing!`, true);
      currentQuiz = null;
    }, 1800);
  }
}

/* ============================================
   AI SUGGESTION & PROGRESS
   ============================================ *
async function getAISuggestion() {
  const subjects = typeof LocalDB !== 'undefined' ? LocalDB.get('Subjects') : [];
  const homework = typeof LocalDB !== 'undefined' ? LocalDB.get('Homework') : [];
  const tests = typeof LocalDB !== 'undefined' ? LocalDB.get('Tests') : [];

  await askAI(`Give 3-4 specific study suggestions. Subjects: ${subjects.map(s => s.name).join(', ') || 'None'}. Pending HW: ${homework.filter(h => h.status === 'Pending').length}. Recent tests: ${tests.slice(-5).map(t => `${t.test_name}: ${Math.round(t.marks / t.total * 100)}%`).join(', ') || 'None'}. Be specific and encouraging.`);
}

function showProgress() {
  const subjects = typeof LocalDB !== 'undefined' ? LocalDB.get('Subjects') : [];
  if (subjects.length === 0) { addBotMessage('No subjects added yet. Go to Subjects page!'); return; }

  let r = '📊 **Progress Summary:**\n\n';
  let total = 0;
  subjects.forEach(s => {
    const p = typeof calculateSubjectProgress === 'function' ? calculateSubjectProgress(s.id) : 0;
    total += p;
    r += `${s.icon || '📖'} **${s.name}**: ${'█'.repeat(Math.round(p / 10))}${'░'.repeat(10 - Math.round(p / 10))} ${p}%\n`;
  });
  const avg = Math.round(total / subjects.length);
  r += `\n**Overall: ${avg}%**`;
  addBotMessage(r);
  avatarSpeak(`Overall progress: ${avg} percent.`, true);
}

/* ============================================
   HELP MENU
   ============================================ *
function showHelpMenu() {
  const html = `<div class="help-menu">
    <p><strong>🤖 What I Can Do:</strong></p>
    <div class="help-category"><p>🧠 <strong>Ask Anything</strong></p><p style="font-size:12px;color:var(--text-secondary);">Math, science, history, coding — any academic question</p></div>
    <div class="help-category"><p>📸 <strong>Image Doubts</strong></p><p style="font-size:12px;color:var(--text-secondary);">"upload image" or click 📸 — I'll try to solve from photos</p></div>
    <div class="help-category"><p>📇 <strong>Flashcards</strong></p><p style="font-size:12px;color:var(--text-secondary);">"Create flashcards for Physics Laws of Motion"</p></div>
    <div class="help-category"><p>📝 <strong>Quizzes</strong></p><p style="font-size:12px;color:var(--text-secondary);">"Quiz me on Chemistry Atomic Structure"</p></div>
    <div class="help-category"><p>📄 <strong>NCERT PDFs</strong></p><p style="font-size:12px;color:var(--text-secondary);">"Upload PDF" for textbook-accurate answers</p></div>
    <div class="help-category"><p>🎤 <strong>Voice</strong></p><p style="font-size:12px;color:var(--text-secondary);">Click mic to speak. I read answers aloud with AI voice!</p></div>
    <div class="help-category"><p>⚡ <strong>Commands</strong></p><p style="font-size:12px;color:var(--text-secondary);">pending • progress • timer • suggest • open [page]</p></div>
  </div>`;
  addBotMessage(html, true);
}

/* ============================================
   HELPERS
   ============================================ *
function extractSubject(text) {
  const subjects = ['physics', 'chemistry', 'math', 'maths', 'mathematics', 'biology', 'english',
    'hindi', 'history', 'geography', 'economics', 'political science', 'computer science',
    'accountancy', 'business studies', 'sociology', 'psychology', 'science'];
  const t = text.toLowerCase();
  for (const s of subjects) {
    if (t.includes(s)) return s.charAt(0).toUpperCase() + s.slice(1);
  }
  return null;
}

function extractChapter(text) {
  const m = text.match(/chapter\s+(.+?)(?:\s*$|\s+(?:of|in|from))/i);
  if (m) return m[1].trim();
  const after = text.match(/(?:physics|chemistry|math|biology|english|history|science)\s+(.+)/i);
  if (after) {
    const r = after[1].replace(/^(chapter\s*)/i, '').trim();
    if (r.length > 3 && !r.match(/^(quiz|flashcard|test|practice)/i)) return r;
  }
  return null;
}

function getGreeting() {
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const pending = typeof LocalDB !== 'undefined' ? LocalDB.get('Homework').filter(h => h.status === 'Pending').length : 0;
  return `${greet}! 👋 I'm StudyBot — your free AI study companion! Powered by Puter.js 🚀\n\nI can answer questions, create flashcards, quizzes, solve image doubts, and read answers aloud with AI voice!\n\nYou have ${pending} pending homework. Ask me anything or say **"help"**!`;
}


});*/
