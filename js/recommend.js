/* ===========================
   SchedulAI - AI 추천 페이지
   음성 / 텍스트 입력 + 추천 결과 렌더링
=========================== */
'use strict';

// ===== DOM References =====
const tabText       = document.getElementById('tabText');
const tabVoice      = document.getElementById('tabVoice');
const textPanel     = document.getElementById('textPanel');
const voicePanel    = document.getElementById('voicePanel');
const textInput     = document.getElementById('textInput');
const charCount     = document.getElementById('charCount');
const analyzeBtn    = document.getElementById('analyzeBtn');

const micBtn            = document.getElementById('micBtn');
const micPulse          = document.getElementById('micPulse');
const voiceStatus       = document.getElementById('voiceStatus');
const voiceTranscript   = document.getElementById('voiceTranscript');
const voiceActions      = document.getElementById('voiceActions');
const voiceConfirmBtn   = document.getElementById('voiceConfirmBtn');
const voiceRetryBtn     = document.getElementById('voiceRetryBtn');
const unsupportedNotice = document.getElementById('unsupportedNotice');

const settingsToggle = document.getElementById('settingsToggle');
const settingsGrid   = document.getElementById('settingsGrid');
const settingDate    = document.getElementById('settingDate');
const settingPeople  = document.getElementById('settingPeople');
const settingBudget  = document.getElementById('settingBudget');
const settingMood    = document.getElementById('settingMood');

const resultIdle    = document.getElementById('resultIdle');
const resultLoading = document.getElementById('resultLoading');
const resultSuccess = document.getElementById('resultSuccess');
const btnShare      = document.getElementById('btnShare');
const btnCalendar   = document.getElementById('btnCalendar');
const btnRedo       = document.getElementById('btnRedo');

// ===== State =====
let currentMode   = 'text'; // 'text' | 'voice'
let voiceText     = '';     // confirmed voice transcript
let recognition   = null;
let isRecording   = false;
let isAnalyzing   = false;

// ===== Mobile Nav =====
const navHamburger = document.getElementById('navHamburger');
const navMenu = document.getElementById('navMenu');
if (navHamburger && navMenu) {
  navHamburger.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    navHamburger.setAttribute('aria-expanded', isOpen);
  });
}

// ===== Tab Switching =====
function switchToText() {
  currentMode = 'text';
  tabText.classList.add('active');
  tabVoice.classList.remove('active');
  tabText.setAttribute('aria-selected', 'true');
  tabVoice.setAttribute('aria-selected', 'false');
  textPanel.style.display = 'block';
  voicePanel.style.display = 'none';
  stopRecording();
  updateAnalyzeBtn();
}

function switchToVoice() {
  currentMode = 'voice';
  tabVoice.classList.add('active');
  tabText.classList.remove('active');
  tabVoice.setAttribute('aria-selected', 'true');
  tabText.setAttribute('aria-selected', 'false');
  voicePanel.style.display = 'block';
  textPanel.style.display = 'none';
  updateAnalyzeBtn();
  checkSpeechSupport();
}

tabText.addEventListener('click', switchToText);
tabVoice.addEventListener('click', switchToVoice);

// ===== Text Input =====
textInput.addEventListener('input', () => {
  const len = textInput.value.length;
  charCount.textContent = len;
  updateAnalyzeBtn();
});

textInput.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    if (!analyzeBtn.disabled && !isAnalyzing) startAnalysis();
  }
});

// Quick chips
document.querySelectorAll('.quick-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    const text = chip.getAttribute('data-text');
    switchToText();
    textInput.value = text;
    charCount.textContent = text.length;
    textInput.focus();
    updateAnalyzeBtn();
  });
});

function updateAnalyzeBtn() {
  let hasInput = false;

  if (currentMode === 'text') {
    hasInput = textInput.value.trim().length > 0;
  } else {
    hasInput = voiceText.trim().length > 0;
  }

  analyzeBtn.disabled = !hasInput || isAnalyzing;
  analyzeBtn.setAttribute('aria-disabled', (!hasInput || isAnalyzing).toString());
}

// ===== Settings Toggle =====
settingsToggle.addEventListener('click', () => {
  const isCollapsed = settingsGrid.classList.toggle('hidden');
  settingsToggle.classList.toggle('collapsed', isCollapsed);
  settingsToggle.setAttribute('aria-expanded', (!isCollapsed).toString());
});

settingsToggle.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    settingsToggle.click();
  }
});

// ===== Speech Recognition =====
function checkSpeechSupport() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    unsupportedNotice.classList.add('show');
    micBtn.style.display = 'none';
    micPulse.style.display = 'none';
    voiceStatus.style.display = 'none';
    return false;
  }

  unsupportedNotice.classList.remove('show');
  micBtn.style.display = 'flex';
  return true;
}

function initRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return null;

  const rec = new SpeechRecognition();
  rec.lang = 'ko-KR';
  rec.continuous = false;
  rec.interimResults = true;
  rec.maxAlternatives = 1;

  rec.onstart = () => {
    isRecording = true;
    micBtn.classList.add('recording');
    micPulse.classList.add('recording');
    micBtn.innerHTML = '⏹️';
    micBtn.setAttribute('aria-label', '음성 입력 중지');
    voiceStatus.textContent = '🔴 듣고 있어요... 말씀해 주세요';
    voiceStatus.className = 'voice-status active';
    voiceTranscript.innerHTML = '';
    voiceTranscript.classList.add('show');
    voiceActions.classList.remove('show');
    voiceText = '';
    updateAnalyzeBtn();
  };

  rec.onresult = (e) => {
    let interim = '';
    let final = '';

    for (let i = e.resultIndex; i < e.results.length; i++) {
      const t = e.results[i][0].transcript;
      if (e.results[i].isFinal) {
        final += t;
      } else {
        interim += t;
      }
    }

    if (final) {
      voiceText += final;
      voiceTranscript.innerHTML = escapeHtml(voiceText) +
        (interim ? `<span class="interim"> ${escapeHtml(interim)}</span>` : '');
    } else {
      voiceTranscript.innerHTML = escapeHtml(voiceText) +
        (interim ? `<span class="interim"> ${escapeHtml(interim)}</span>` : '');
    }

    updateAnalyzeBtn();
  };

  rec.onerror = (e) => {
    stopRecording();
    const msgs = {
      'not-allowed': '🚫 마이크 권한이 거부되었습니다. 브라우저 설정에서 허용해 주세요.',
      'no-speech':   '🔇 음성이 감지되지 않았습니다. 다시 시도해 주세요.',
      'network':     '🌐 네트워크 오류가 발생했습니다. 연결을 확인해 주세요.',
      'aborted':     '중단되었습니다.',
    };
    voiceStatus.textContent = msgs[e.error] || `오류: ${e.error}`;
    voiceStatus.className = 'voice-status error';
  };

  rec.onend = () => {
    if (isRecording) stopRecording(); // auto-stop when silence detected
  };

  return rec;
}

function startRecording() {
  if (isRecording) { stopRecording(); return; }

  recognition = initRecognition();
  if (!recognition) return;

  try {
    recognition.start();
  } catch (err) {
    voiceStatus.textContent = '마이크를 시작할 수 없습니다. 다시 시도해 주세요.';
    voiceStatus.className = 'voice-status error';
  }
}

function stopRecording() {
  isRecording = false;

  if (recognition) {
    try { recognition.stop(); } catch (_) {}
    recognition = null;
  }

  micBtn.classList.remove('recording');
  micPulse.classList.remove('recording');
  micBtn.innerHTML = '🎙️';
  micBtn.setAttribute('aria-label', '음성 입력 시작');

  if (voiceText.trim()) {
    voiceStatus.textContent = '✅ 인식 완료 — 내용을 확인하고 분석을 시작하세요';
    voiceStatus.className = 'voice-status success';
    voiceTranscript.innerHTML = escapeHtml(voiceText);
    voiceActions.classList.add('show');
  } else {
    voiceStatus.textContent = '버튼을 눌러 말씀해 주세요';
    voiceStatus.className = 'voice-status';
    voiceTranscript.classList.remove('show');
  }

  updateAnalyzeBtn();
}

if (micBtn) {
  micBtn.addEventListener('click', () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  });
}

if (voiceConfirmBtn) {
  voiceConfirmBtn.addEventListener('click', () => {
    if (voiceText.trim()) {
      voiceActions.classList.remove('show');
      startAnalysis();
    }
  });
}

if (voiceRetryBtn) {
  voiceRetryBtn.addEventListener('click', () => {
    voiceText = '';
    voiceTranscript.innerHTML = '';
    voiceTranscript.classList.remove('show');
    voiceActions.classList.remove('show');
    voiceStatus.textContent = '버튼을 눌러 말씀해 주세요';
    voiceStatus.className = 'voice-status';
    updateAnalyzeBtn();
  });
}

// ===== Analyze Button =====
analyzeBtn.addEventListener('click', () => {
  if (!analyzeBtn.disabled && !isAnalyzing) startAnalysis();
});

document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    if (!analyzeBtn.disabled && !isAnalyzing) startAnalysis();
  }
});

// ===== Analysis Flow =====
function getInputText() {
  if (currentMode === 'voice') return voiceText.trim();
  return textInput.value.trim();
}

function getSettings() {
  return {
    date:   settingDate.value.trim() || '이번 주 토요일',
    people: settingPeople.value,
    budget: settingBudget.value,
    mood:   settingMood.value,
  };
}

async function startAnalysis() {
  const input = getInputText();
  if (!input) return;

  isAnalyzing = true;
  analyzeBtn.disabled = true;
  analyzeBtn.innerHTML = '⏳ 분석 중...';

  showState('loading');
  animateLoadingSteps();
  animateSources();

  // Simulate AI processing delay
  await delay(3800);

  const settings = getSettings();
  const result = generateResult(input, settings);

  showResult(result);
  isAnalyzing = false;
  analyzeBtn.innerHTML = '✨ AI 분석 시작';
  updateAnalyzeBtn();
}

function delay(ms) { return new Promise(res => setTimeout(res, ms)); }

function animateLoadingSteps() {
  const steps = document.querySelectorAll('.loading-step');
  const titles = [
    ['연락처 분석 중...', '취향 태그를 추출하고 있어요'],
    ['메모 스캔 중...', '위시리스트를 찾고 있어요'],
    ['캘린더 확인 중...', 'Golden Time을 계산하고 있어요'],
    ['날씨 & 교통 연동 중...', '최적 코스를 결정하고 있어요'],
    ['코스 생성 중...', '거의 다 됐어요!'],
  ];

  steps.forEach(s => { s.className = 'loading-step'; });

  let i = 0;
  const loadingTitle = document.getElementById('loadingTitle');
  const loadingSubtitle = document.getElementById('loadingSubtitle');

  function next() {
    if (i > 0) {
      steps[i - 1].classList.add('done');
      steps[i - 1].classList.remove('active');
    }
    if (i < steps.length) {
      steps[i].classList.add('active');
      loadingTitle.textContent = titles[i][0];
      loadingSubtitle.textContent = titles[i][1];
      i++;
      setTimeout(next, 680);
    }
  }
  next();
}

function animateSources() {
  const srcIds = ['src-contacts', 'src-memo', 'src-calendar', 'src-weather'];
  srcIds.forEach((id, i) => {
    const el = document.getElementById(id);
    if (!el) return;
    setTimeout(() => {
      el.classList.add('active');
      el.querySelector('.src-status').textContent = '분석 중';
      setTimeout(() => {
        el.classList.remove('active');
        el.classList.add('done');
        el.querySelector('.src-status').textContent = '완료 ✓';
      }, 800);
    }, i * 800);
  });
}

// ===== Result Generation =====
function generateResult(input, settings) {
  const lc = input.toLowerCase();

  // Keyword matching for 5 scenarios
  if (contains(lc, ['생일', 'birthday'])) return buildBirthday(input, settings);
  if (contains(lc, ['회식', '팀', 'team'])) return buildTeamDinner(input, settings);
  if (contains(lc, ['힐링', '쉬고', '혼자', '릴렉스', 'relax'])) return buildSolo(input, settings);
  if (contains(lc, ['기념일', '데이트', '연인', 'date', 'anniversary'])) return buildDate(input, settings);
  if (contains(lc, ['가족', '나들이', '부모', 'family'])) return buildFamily(input, settings);

  // Default
  return buildDefault(input, settings);
}

function contains(str, keywords) {
  return keywords.some(k => str.includes(k));
}

function moodLabel(mood) {
  return { casual:'캐주얼', romantic:'로맨틱', active:'액티브', relaxed:'힐링', formal:'격식' }[mood] || mood;
}

function budgetLabel(b) {
  return { low:'3만원 이하', mid:'3~10만원', high:'10~30만원', vip:'30만원 이상' }[b] || b;
}

function buildBirthday(input, s) {
  return {
    icon: '🎂',
    title: '완벽한 생일 파티 코스가 준비됐어요!',
    desc: `AI가 상대방의 취향과 ${s.date || '이번 주 토요일'}의 날씨·캘린더를 분석해 최적의 생일 코스를 완성했습니다.`,
    badges: ['Golden Time 발견', '취향 100% 매칭', '날씨 맑음'],
    courseTitle: '생일 파티 하루 코스',
    course: [
      { time: '12:00', name: '이탈리안 레스토랑 "라보카"', desc: '매운 음식 없는 코스 메뉴 · 강남역 5분 · ★4.9', emoji: '🍝', tags: ['취향 매칭', '예약 완료'] },
      { time: '14:00', name: '프리미엄 보드게임 카페', desc: '위시리스트에서 발견 — 6개월 전 "보드게임 하자" 메모 · 2인석', emoji: '🎲', tags: ['위시리스트', '2인 예약'] },
      { time: '17:00', name: '재즈 라이브 공연 감상', desc: '음악 좋아하는 취향 매칭 · 오후 날씨 맑음 · 강남구', emoji: '🎷', tags: ['음악 취향', '날씨 맑음'] },
      { time: '19:30', name: '루프탑 카페에서 마무리', desc: '야경 뷰 · 디저트 & 음료 · 교통 혼잡 전 귀가 권장', emoji: '🌆', tags: ['야경', '케이크 픽업'] },
    ],
    analysis: [
      { icon: '👤', label: '연락처 분석', val: '매운 음식 ✗ · 음악 ♥ · 보드게임 ♥' },
      { icon: '📝', label: '메모 & 위시리스트', val: '"보드게임 하자" (6개월 전)' },
      { icon: '📅', label: '캘린더 Golden Time', val: `${s.date || '토요일'} 오후 2시~6시 공통 여유` },
      { icon: '🌤️', label: '날씨 & 교통', val: '오전 흐림 → 오후 맑음, 교통 원활' },
    ],
  };
}

function buildTeamDinner(input, s) {
  return {
    icon: '🍻',
    title: '팀 회식 최적 코스 완성!',
    desc: `${s.people}인 기준, 예산 ${budgetLabel(s.budget)}, ${moodLabel(s.mood)} 분위기로 맞춤 코스를 생성했습니다.`,
    badges: ['전체 수용 가능', '주차 완비', '단체 예약 OK'],
    courseTitle: '팀 회식 추천 코스',
    course: [
      { time: '18:30', name: '한우 전문 다이닝 "마루"', desc: `${s.people}인 단체룸 예약 가능 · 주차 5대 · 도보 10분`, emoji: '🥩', tags: ['단체 예약', '주차 OK'] },
      { time: '21:00', name: '분위기 있는 바 & 라운지', desc: '2차 장소 · 도보 이동 2분 · 칵테일·안주 구비', emoji: '🍹', tags: ['2차', '이동 편리'] },
    ],
    analysis: [
      { icon: '👤', label: '인원 분석', val: `${s.people}명 · 알레르기 정보 없음` },
      { icon: '📅', label: '일정', val: '금요일 저녁 6시 이후 공통 여유' },
      { icon: '💰', label: '예산', val: budgetLabel(s.budget) },
      { icon: '🌤️', label: '날씨', val: '맑음 · 이동 쾌적' },
    ],
  };
}

function buildSolo(input, s) {
  return {
    icon: '🌿',
    title: '완벽한 혼자만의 힐링 하루!',
    desc: `온전히 나를 위한 하루. AI가 당신의 취향과 날씨를 분석해 최고의 힐링 코스를 설계했습니다.`,
    badges: ['스트레스 제로', '나만의 공간', '자연 친화'],
    courseTitle: '혼자 힐링 코스',
    course: [
      { time: '10:00', name: '조용한 독립 서점 "책과 공간"', desc: '주말 오전 방문 추천 · 카페 겸영 · 고요한 분위기', emoji: '📚', tags: ['힐링', '카페'] },
      { time: '12:30', name: '숲 속 브런치 카페', desc: '인근 공원 뷰 · 1인석 다수 · 브런치 메뉴', emoji: '🥗', tags: ['브런치', '공원뷰'] },
      { time: '14:30', name: '한강 공원 산책 & 자전거', desc: '오후 날씨 맑음 · 자전거 대여 ₩3,000/시간', emoji: '🚴', tags: ['야외', '날씨 맑음'] },
      { time: '17:00', name: '아로마 힐링 스파', desc: '1인 프라이빗 룸 · 60분 코스 · 사전 예약 권장', emoji: '💆', tags: ['스파', '예약 권장'] },
    ],
    analysis: [
      { icon: '👤', label: '개인 취향', val: '독서 ♥ · 야외 활동 ♥ · 조용한 환경' },
      { icon: '📅', label: '가능 시간', val: '오전 10시 ~ 저녁 8시 자유' },
      { icon: '🌤️', label: '날씨', val: '맑음 · 최고 22°C · 나들이 최적' },
      { icon: '💰', label: '예상 비용', val: budgetLabel(s.budget) },
    ],
  };
}

function buildDate(input, s) {
  return {
    icon: '💕',
    title: '설레는 기념일 데이트 코스 완성!',
    desc: `AI가 두 사람의 공통 취향과 특별한 날을 위해 로맨틱한 하루 코스를 구성했습니다.`,
    badges: ['로맨틱 보장', '인스타 스팟', '기념일 특별 서비스'],
    courseTitle: '기념일 데이트 코스',
    course: [
      { time: '11:30', name: '오마카세 브런치 레스토랑', desc: '기념일 케이크 사전 요청 가능 · 창가 좌석 예약', emoji: '🥂', tags: ['로맨틱', '창가석'] },
      { time: '14:00', name: '한강 유람선 투어', desc: '1시간 코스 · 오후 햇살 뷰 · 음료 포함', emoji: '⛵', tags: ['특별한 경험', '한강뷰'] },
      { time: '16:30', name: '전시회 or 팝업 스토어', desc: '현재 진행 중 전시 2곳 · 취향 기반 선택', emoji: '🎨', tags: ['문화', '취향 매칭'] },
      { time: '19:00', name: '야경 루프탑 파인다이닝', desc: '서울 야경 뷰 · 기념일 서비스 제공 · 드레스코드', emoji: '🌃', tags: ['야경', '파인다이닝'] },
    ],
    analysis: [
      { icon: '👤', label: '공통 취향', val: '전시 · 맛집 투어 · 야경' },
      { icon: '📅', label: '기념일', val: s.date || '이번 주 토요일' },
      { icon: '🌤️', label: '날씨', val: '맑음 · 황금빛 오후 예상' },
      { icon: '💰', label: '예산', val: budgetLabel(s.budget) },
    ],
  };
}

function buildFamily(input, s) {
  return {
    icon: '👨‍👩‍👧',
    title: '가족 모두 즐거운 나들이 코스!',
    desc: `아이부터 어른까지 모두 즐길 수 있는 안전하고 편안한 가족 나들이 코스를 설계했습니다.`,
    badges: ['어린이 환영', '접근성 완비', '무장애 경로'],
    courseTitle: '가족 나들이 코스',
    course: [
      { time: '10:00', name: '어린이 체험 과학관', desc: '유아~초등 체험 전시 · 주차 편리 · 도시락 반입 가능', emoji: '🔬', tags: ['어린이', '체험'] },
      { time: '12:30', name: '공원 피크닉 & 도시락', desc: '넓은 잔디밭 · 유모차 진입 가능 · 화장실 완비', emoji: '🧺', tags: ['피크닉', '가족 친화'] },
      { time: '14:30', name: '어린이 체험 농장', desc: '딸기 따기 체험 · 동물 먹이주기 · 차 30분', emoji: '🍓', tags: ['체험', '자연'] },
      { time: '17:00', name: '편안한 한식 가족 레스토랑', desc: '어린이 메뉴 완비 · 유아 의자 · 넓은 좌석', emoji: '🍚', tags: ['한식', '어린이 메뉴'] },
    ],
    analysis: [
      { icon: '👤', label: '가족 구성', val: `어른 ${s.people}명 · 어린이 포함` },
      { icon: '📅', label: '나들이 날', val: s.date || '주말' },
      { icon: '🌤️', label: '날씨', val: '맑음 · 바람 약함 · 나들이 최적' },
      { icon: '💰', label: '예산', val: budgetLabel(s.budget) },
    ],
  };
}

function buildDefault(input, s) {
  return {
    icon: '🗓️',
    title: 'AI 맞춤 일정 코스가 준비됐어요!',
    desc: `입력하신 내용을 분석해 ${moodLabel(s.mood)} 분위기로 최적의 하루 코스를 설계했습니다.`,
    badges: ['AI 최적화', '취향 반영', '날씨 대응'],
    courseTitle: '오늘의 추천 코스',
    course: [
      { time: '11:00', name: '브런치 카페', desc: '여유로운 시작 · 취향 반영 메뉴 구성', emoji: '☕', tags: ['브런치'] },
      { time: '13:30', name: '메인 활동 장소', desc: `${moodLabel(s.mood)} 분위기에 맞는 장소 추천`, emoji: '🎯', tags: [moodLabel(s.mood)] },
      { time: '16:00', name: '산책 & 카페', desc: '이동 중 쉬어가기 · 날씨 맑음', emoji: '🚶', tags: ['여유'] },
      { time: '19:00', name: '저녁 식사', desc: `예산 ${budgetLabel(s.budget)} 범위 맛집`, emoji: '🍽️', tags: ['저녁'] },
    ],
    analysis: [
      { icon: '👤', label: '취향 분석', val: '연락처 데이터 기반' },
      { icon: '📅', label: '일정', val: s.date || '이번 주 토요일' },
      { icon: '🌤️', label: '날씨', val: '맑음 · 야외 활동 적합' },
      { icon: '💰', label: '예산', val: budgetLabel(s.budget) },
    ],
  };
}

// ===== Show States =====
function showState(state) {
  resultIdle.style.display    = 'none';
  resultLoading.style.display = 'none';
  resultSuccess.style.display = 'none';

  if (state === 'idle') {
    resultIdle.style.display = 'flex';
  } else if (state === 'loading') {
    resultLoading.style.display = 'flex';
  } else if (state === 'success') {
    resultSuccess.style.display = 'flex';
  }
}

function showResult(result) {
  // Summary
  document.getElementById('summaryIcon').textContent = result.icon;
  document.getElementById('summaryTitle').textContent = result.title;
  document.getElementById('summaryDesc').textContent = result.desc;

  const badgesEl = document.getElementById('summaryBadges');
  badgesEl.innerHTML = result.badges.map(b =>
    `<span class="badge badge-primary">${b}</span>`
  ).join('');

  // Course
  document.getElementById('courseTitle').textContent = result.courseTitle;
  document.getElementById('courseCount').textContent = `${result.course.length}곳`;

  const courseItems = document.getElementById('courseItems');
  courseItems.innerHTML = result.course.map(item => `
    <div class="course-item">
      <span class="ci-time">${item.time}</span>
      <div class="ci-dot" aria-hidden="true"></div>
      <div class="ci-body">
        <div class="ci-name">${escapeHtml(item.name)}</div>
        <div class="ci-desc">${escapeHtml(item.desc)}</div>
        ${item.tags ? `<div class="ci-tags">${item.tags.map(t => `<span class="ci-tag">${escapeHtml(t)}</span>`).join('')}</div>` : ''}
      </div>
      <span class="ci-emoji" aria-hidden="true">${item.emoji}</span>
    </div>
  `).join('');

  // Analysis
  const analysisGrid = document.getElementById('analysisGrid');
  analysisGrid.innerHTML = result.analysis.map(a => `
    <div class="analysis-source">
      <span class="as-icon" aria-hidden="true">${a.icon}</span>
      <div>
        <div class="as-label">${escapeHtml(a.label)}</div>
        <div class="as-val">${escapeHtml(a.val)}</div>
      </div>
    </div>
  `).join('');

  showState('success');

  // Smooth scroll to result on mobile
  if (window.innerWidth <= 860) {
    setTimeout(() => {
      const resultPanel = document.getElementById('resultPanel');
      resultPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
  }
}

// ===== Action Buttons =====
btnShare.addEventListener('click', () => openModal('shareModal'));
btnCalendar.addEventListener('click', () => openModal('calendarModal'));
btnRedo.addEventListener('click', () => {
  showState('idle');
  textInput.value = '';
  charCount.textContent = '0';
  voiceText = '';
  voiceTranscript.innerHTML = '';
  voiceTranscript.classList.remove('show');
  voiceActions.classList.remove('show');
  voiceStatus.textContent = '버튼을 눌러 말씀해 주세요';
  voiceStatus.className = 'voice-status';

  // Reset sources
  document.querySelectorAll('.source-item').forEach(el => {
    el.className = 'source-item';
    el.querySelector('.src-status').textContent = '대기 중';
  });

  updateAnalyzeBtn();
  textInput.focus();
});

// ===== Modals =====
function openModal(id) {
  document.getElementById(id).classList.add('open');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

// Close modal on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.remove('open');
  });
});

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
  }
});

function handleShare(type) {
  const msgs = {
    kakao: '카카오톡 공유 기능은 앱 연동 후 사용 가능합니다.',
    sms:   '문자 공유 기능은 앱 연동 후 사용 가능합니다.',
    copy:  '🔗 링크가 클립보드에 복사되었습니다!',
  };
  closeModal('shareModal');
  showToast(msgs[type] || '공유되었습니다.');
}

function handleCalendar(type) {
  const msgs = {
    google: '📅 Google 캘린더 연동은 앱 연동 후 사용 가능합니다.',
    apple:  '🍎 Apple 캘린더 연동은 앱 연동 후 사용 가능합니다.',
  };
  closeModal('calendarModal');
  showToast(msgs[type] || '캘린더에 추가되었습니다.');
}

// ===== Toast =====
function showToast(msg) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.style.cssText = `
    position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%) translateY(16px);
    background: var(--text-primary); color: #fff; padding: 12px 22px;
    border-radius: 50px; font-size: 0.88rem; font-weight: 600;
    box-shadow: 0 4px 20px rgba(15,28,63,0.25); z-index: 9999;
    opacity: 0; transition: all 0.3s ease; white-space: nowrap;
  `;
  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(8px)';
    setTimeout(() => toast.remove(), 350);
  }, 3000);
}

// ===== Utility =====
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Make functions global for inline handlers
window.switchToText = switchToText;
window.closeModal = closeModal;
window.handleShare = handleShare;
window.handleCalendar = handleCalendar;

// ===== Initialize =====
showState('idle');
checkSpeechSupport();
