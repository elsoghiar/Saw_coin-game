// تحميل الأحجية من ملف JSON
async function loadPuzzles() {
    try {
        const response = await fetch('puzzles.json'); // جلب الأحجيات من ملف JSON
        if (!response.ok) throw new Error('Failed to load puzzles');
        const data = await response.json();
        return data.puzzles;
    } catch (error) {
        console.error(error);
        showNotification(puzzleNotification, 'Error loading puzzle. Please try again later.');
    }
}

// الحصول على أحجية اليوم (للحصول على أحجية واحدة في الوقت الحالي)
function getTodaysPuzzle(puzzles) {
    return puzzles[0]; // افتراضًا نختار أول أحجية
}

// تعريف عناصر DOM
const puzzleContainer = document.getElementById('puzzleContainer');
const openPuzzleBtn = document.getElementById('openPuzzleBtn');
const puzzleQuestion = document.getElementById('puzzleQuestion');
const puzzleOptions = document.getElementById('puzzleOptions');
const puzzleNotification = document.getElementById('puzzleNotification');
const puzzleHint = document.getElementById('puzzleHint');
const closePuzzleBtn = document.getElementById('closePuzzleBtn');

// حالة اللعبة
let currentPuzzle;
let attempts = 0; // عدد المحاولات
let puzzleSolved = false; // إذا تم حل الأحجية أم لا
const maxAttempts = 3; // الحد الأقصى للمحاولات
const puzzleReward = 500000; // المكافأة عند الحل الصحيح
const penaltyAmount = 500; // العقوبة عند الإجابة الخاطئة

// دالة لعرض أحجية اليوم
async function displayTodaysPuzzle() {
    const puzzles = await loadPuzzles(); // جلب الأحجيات
    currentPuzzle = getTodaysPuzzle(puzzles); // الحصول على أحجية اليوم

    // عرض السؤال والتلميح
    puzzleQuestion.innerText = currentPuzzle.question;
    puzzleHint.innerText = `Hint: ${currentPuzzle.hint}`;

    // عرض الخيارات كأزرار
    const optionsHtml = currentPuzzle.options.map(option => `<button class="option-btn">${option}</button>`).join('');
    puzzleOptions.innerHTML = optionsHtml;

    puzzleContainer.classList.remove('hidden'); // إظهار الأحجية
}

// التحقق من إجابة المستخدم
function checkPuzzleAnswer(selectedOption) {
    const userAnswer = selectedOption.innerText.trim(); // الحصول على نص الزر المختار

    if (userAnswer === currentPuzzle.answer && !puzzleSolved) {
        handlePuzzleSuccess(); // التعامل مع الإجابة الصحيحة
    } else {
        handlePuzzleWrongAnswer(); // التعامل مع الإجابة الخاطئة
    }
}

// التعامل مع الإجابة الصحيحة
function handlePuzzleSuccess() {
    puzzleSolved = true; // تحديث حالة الأحجية
    showNotification(puzzleNotification, `Correct! You've earned ${puzzleReward} coins.`); // عرض إشعار الفوز

    // إضافة المكافأة إلى رصيد اللاعب
    gameState.balance += puzzleReward;
    updateUI();
    saveGameState();

    closePuzzleBtn.classList.remove('hidden'); // إظهار زر إغلاق الأحجية
    document.querySelectorAll('.option-btn').forEach(btn => btn.disabled = true); // تعطيل الأزرار بعد الفوز
}

// التعامل مع الإجابة الخاطئة
function handlePuzzleWrongAnswer() {
    attempts++; // زيادة عدد المحاولات

    if (attempts === 2) {
        // بعد المحاولة الثانية، إشعار بوجود محاولة واحدة متبقية
        showNotification(puzzleNotification, 'You have one more attempt, if you fail, 500 coins will be deducted.');
    } else if (attempts === maxAttempts) {
        // بعد المحاولة الثالثة، يتم خصم 500 عملة
        showNotification(puzzleNotification, 'You have used all attempts. 500 coins have been deducted.');
        gameState.balance -= penaltyAmount; // خصم 500 عملة من الرصيد
        updateUI();
        saveGameState();
        document.querySelectorAll('.option-btn').forEach(btn => btn.disabled = true); // تعطيل الأزرار بعد الفشل
        closePuzzleBtn.classList.remove('hidden'); // إظهار زر الإغلاق
    } else {
        // إظهار إشعار بعد المحاولة الخاطئة الأولى
        showNotification(puzzleNotification, 'Wrong answer. Try again.');
    }
}

// دالة لإظهار الإشعارات
function showNotification(notificationElement, message) {
    notificationElement.innerText = message; // تعيين نص الإشعار
    notificationElement.classList.add('show'); // إظهار الإشعار
    setTimeout(() => {
        notificationElement.classList.remove('show'); // إخفاء الإشعار بعد 3 ثوانٍ
    }, 3000);
}

// دالة لإغلاق الأحجية وإعادة تعيين الحالة
function closePuzzle() {
    puzzleContainer.classList.add('hidden'); // إخفاء الأحجية
    puzzleOptions.innerHTML = '';  // مسح الأزرار
    puzzleNotification.innerText = ''; // مسح الإشعارات
    closePuzzleBtn.classList.add('hidden'); // إخفاء زر الإغلاق
    attempts = 0; // إعادة تعيين عدد المحاولات
    puzzleSolved = false; // إعادة تعيين حالة الأحجية
}

// ربط الأحداث مع الأزرار
puzzleOptions.addEventListener('click', function (event) {
    if (event.target.classList.contains('option-btn')) {
        checkPuzzleAnswer(event.target); // التحقق من الإجابة عند الضغط على الزر
    }
});
openPuzzleBtn.addEventListener('click', displayTodaysPuzzle); // فتح الأحجية عند الضغط على الزر
closePuzzleBtn.addEventListener('click', closePuzzle); // إغلاق الأحجية عند الضغط على زر الإغلاق

// Placeholder functions for game logic
function updateUI() {
    console.log("Balance updated:", gameState.balance); // تحديث واجهة المستخدم
}

function saveGameState() {
    console.log("Game state saved"); // حفظ حالة اللعبة
}

// Sample gameState for testing
let gameState = {
    balance: 10000  // Starting balance for testing
};
