// استيراد الأحجية من ملف JSON
const puzzleData = {
  "puzzles": [
    {
      "id": 1,
      "difficulty": "medium",
      "question": "Complete the sequence: 3, 6, 9, 12,",
      "options": ["2", "15", "80", "13", "7", "11"],
      "answer": "15",
      "hint": "Add the same number each time.",
      "reward": 500000
    }
  ]
};

let balance = 1000000; // الرصيد الابتدائي للمستخدم
let attempts = 0; // عدد المحاولات
const maxAttempts = 3; // الحد الأقصى للمحاولات
let currentPuzzle = null; // الأحجية الحالية
let timerInterval = null; // المتغير الخاص بالمؤقت
let timeRemaining = 60.00; // الوقت المتبقي بالثواني

// تحديد عناصر DOM
const puzzleContainer = document.getElementById('puzzleContainer');
const puzzleQuestion = document.getElementById('puzzleQuestion');
const puzzleOptions = document.getElementById('puzzleOptions');
const puzzleNotification = document.getElementById('puzzleNotification');
const puzzleHint = document.getElementById('puzzleHint');
const timerElement = document.getElementById('timer');
const closePuzzleBtn = document.getElementById('closePuzzleBtn');

// بدء الأحجية
function startPuzzle() {
  currentPuzzle = puzzleData.puzzles[0]; // تحميل أول أحجية
  puzzleContainer.classList.remove('hidden');
  puzzleQuestion.textContent = currentPuzzle.question;
  puzzleOptions.innerHTML = '';

  // عرض الخيارات
  currentPuzzle.options.forEach((option, index) => {
    const button = document.createElement('button');
    button.textContent = option;
    button.onclick = () => checkAnswer(option);
    puzzleOptions.appendChild(button);
  });

  // إعادة ضبط المحاولات والتلميح
  attempts = 0;
  puzzleHint.classList.add('hidden');
  puzzleNotification.textContent = '';

  // بدء المؤقت
  startTimer();
}

// بدء المؤقت
function startTimer() {
  timeRemaining = 60.00;
  timerElement.textContent = timeRemaining.toFixed(2);
  timerInterval = setInterval(() => {
    timeRemaining -= 0.01;
    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      losePuzzle(); // خسارة عند انتهاء الوقت
    }
    timerElement.textContent = timeRemaining.toFixed(2);
  }, 10);
}

// التحقق من الإجابة
function checkAnswer(selectedOption) {
  attempts++;
  if (selectedOption === currentPuzzle.answer) {
    winPuzzle();
  } else if (attempts < maxAttempts) {
    puzzleNotification.textContent = `خطأ! تبقى لك ${maxAttempts - attempts} محاولات.`;
    if (attempts === 2) {
      puzzleHint.classList.remove('hidden');
      puzzleHint.textContent = `التلميح: ${currentPuzzle.hint}`;
    }
  } else {
    losePuzzle();
  }
}

// عند الفوز
function winPuzzle() {
  clearInterval(timerInterval);
  puzzleNotification.textContent = `تهانينا! ربحت ${currentPuzzle.reward} عملة!`;
  balance += currentPuzzle.reward;
  closePuzzleBtn.classList.remove('hidden');
}

// عند الخسارة
function losePuzzle() {
  clearInterval(timerInterval);
  puzzleNotification.textContent = `للأسف، خسرت! تم خصم 500 عملة.`;
  balance -= 500;
  closePuzzleBtn.classList.remove('hidden');
}

// إخفاء الأحجية عند الإغلاق
closePuzzleBtn.addEventListener('click', () => {
  puzzleContainer.classList.add('hidden');
  puzzleNotification.textContent = '';
});

// بدء الأحجية عند النقر على الزر
document.getElementById('openPuzzleBtn').addEventListener('click', startPuzzle);
