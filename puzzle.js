// تحميل الأحجية من ملف JSON
async function loadPuzzles() {
    try {
        const response = await fetch('puzzles.json'); // جلب الأحجيات من ملف JSON
        if (!response.ok) throw new Error('Failed to load puzzles');
        const data = await response.json();
        return data.puzzles;
    } catch (error) {
        console.error('Error loading puzzle:', error.message);
        showNotification(uiElements.purchaseNotification, 'Error loading puzzle. Please try again later.');
    }
}

// الحصول على أحجية اليوم
function getTodaysPuzzle(puzzles) {
    return puzzles[0]; // افتراضًا نختار أول أحجية
}

// تعريف عناصر DOM
const uiElements = {
    puzzleContainer: document.getElementById('puzzleContainer'),
    openPuzzleBtn: document.getElementById('openPuzzleBtn'),
    puzzleQuestion: document.getElementById('puzzleQuestion'),
    puzzleOptions: document.getElementById('puzzleOptions'),
    puzzleNotification: document.getElementById('puzzleNotification'),
    puzzleHint: document.getElementById('puzzleHint'),
    timerDisplay: document.getElementById('timer'),
    closePuzzleBtn: document.getElementById('closePuzzleBtn'),
    remainingAttemptsDisplay: document.createElement('div'), // مكان عرض المحاولات المتبقية
    balanceDisplay: document.getElementById('balanceDisplay'),
};

// إضافة عرض المحاولات المتبقية إلى الصفحة
uiElements.remainingAttemptsDisplay.id = 'remainingAttempts';
document.querySelector('.puzzle-content').appendChild(uiElements.remainingAttemptsDisplay);

// حالة اللعبة (استخدام gameState من الملف الرئيسي)
let currentPuzzle;
let attempts = 0; // عدد المحاولات
let puzzleSolved = false; // إذا تم حل الأحجية أم لا
let countdownInterval; // المؤقت
const maxAttempts = 3; // الحد الأقصى للمحاولات
const puzzleReward = 500000; // المكافأة عند الحل الصحيح
const penaltyAmount = 500; // العقوبة عند الإجابة الخاطئة

// عرض الأحجية
async function displayTodaysPuzzle() {
    const puzzles = await loadPuzzles(); // جلب الأحجيات
    currentPuzzle = getTodaysPuzzle(puzzles); // الحصول على أحجية اليوم

    // عرض السؤال والتلميح
    uiElements.puzzleQuestion.innerText = currentPuzzle.question;
    uiElements.puzzleHint.innerText = `Hint: ${currentPuzzle.hint}`;

    // عرض الخيارات كأزرار
    const optionsHtml = currentPuzzle.options.map(option => `<button class="option-btn">${option}</button>`).join('');
    uiElements.puzzleOptions.innerHTML = optionsHtml;

    uiElements.puzzleContainer.classList.remove('hidden'); // إظهار الأحجية
    uiElements.closePuzzleBtn.classList.add('hidden'); // إخفاء زر الإغلاق حتى يتم الحل
    updateRemainingAttempts(); // تحديث عرض المحاولات المتبقية
    startCountdown(); // بدء العداد
}

// دالة المؤقت
function startCountdown() {
    let timeLeft = 60.00; // 60 ثانية
    uiElements.timerDisplay.innerText = timeLeft.toFixed(2); // عرض الوقت المتبقي

    countdownInterval = setInterval(() => {
        timeLeft -= 0.01;
        uiElements.timerDisplay.innerText = timeLeft.toFixed(2);

        if (timeLeft <= 0) {
            clearInterval(countdownInterval); // إيقاف العداد
            timeLeft = 0; // تعيين الوقت إلى صفر
            handlePuzzleTimeout(); // انتهاء الوقت
        }
    }, 10); // تحديث كل 10 مللي ثانية
}

// التعامل مع انتهاء الوقت
function handlePuzzleTimeout() {
    clearInterval(countdownInterval); // إيقاف المؤقت
    showNotification(uiElements.purchaseNotification, "Time's up! You failed to solve the puzzle.");
    updateBalance(-penaltyAmount); // خصم العملات
    closePuzzle(); // إغلاق الأحجية بعد انتهاء الوقت
}

// التحقق من إجابة المستخدم
function checkPuzzleAnswer(selectedOption) {
    if (puzzleSolved || attempts >= maxAttempts) {
        // إذا كان المستخدم قد استنفذ المحاولات أو حل الأحجية
        showNotification(uiElements.purchaseNotification, puzzleSolved ? 'You have already solved this puzzle.' : 'You have failed. Please try again later.');
        return; // عدم السماح بالمزيد من النقرات
    }

    const userAnswer = selectedOption.innerText.trim(); // الحصول على نص الزر المختار

    if (userAnswer === currentPuzzle.answer && !puzzleSolved) {
        handlePuzzleSuccess(); // التعامل مع الإجابة الصحيحة
    } else {
        handlePuzzleWrongAnswer(); // التعامل مع الإجابة الخاطئة
    }
}

// التعامل مع الإجابة الصحيحة
function handlePuzzleSuccess() {
    clearInterval(countdownInterval); // إيقاف العداد
    puzzleSolved = true; // تحديث حالة الأحجية
    showNotification(uiElements.purchaseNotification, `Correct! You've earned ${puzzleReward} coins.`); // عرض إشعار الفوز
    updateBalance(puzzleReward); // إضافة المكافأة
    uiElements.closePuzzleBtn.classList.remove('hidden'); // إظهار زر إغلاق الأحجية
    document.querySelectorAll('.option-btn').forEach(btn => btn.disabled = true); // تعطيل الأزرار بعد الفوز
}

// التعامل مع الإجابة الخاطئة
function handlePuzzleWrongAnswer() {
    attempts++; // زيادة عدد المحاولات
    updateRemainingAttempts(); // تحديث المحاولات المتبقية

    if (attempts === maxAttempts) {
        clearInterval(countdownInterval); // إيقاف المؤقت بعد الخسارة
        showNotification(uiElements.purchaseNotification, 'You have used all attempts. 500 coins have been deducted.');
        updateBalance(-penaltyAmount); // خصم العملات
        closePuzzle(); // إغلاق الأحجية بعد استنفاذ المحاولات
    } else {
        showNotification(uiElements.purchaseNotification, `Wrong answer. You have ${maxAttempts - attempts} attempts remaining.`);
    }
}

// تحديث عرض المحاولات المتبقية
function updateRemainingAttempts() {
    uiElements.remainingAttemptsDisplay.innerText = `Attempts remaining: ${maxAttempts - attempts}`;
}

// تحديث الرصيد
function updateBalance(amount) {
    gameState.balance += amount; // تحديث الرصيد في حالة اللعبة
    updateBalanceInDB(gameState.balance) // تحديث الرصيد في قاعدة البيانات
        .then(() => {
            updateUI(); // تحديث واجهة المستخدم بعد التحديث
        })
        .catch(() => {
            showNotification(uiElements.purchaseNotification, 'Error updating balance. Please try again later.');
        });
}

// تحديث الرصيد في قاعدة البيانات
async function updateBalanceInDB(balance) {
    try {
        const { error } = await supabase
            .from('users')
            .update({ balance })
            .eq('telegram_id', gameState.userTelegramId);

        if (error) {
            throw new Error('Error updating balance');
        }
    } catch (error) {
        console.error('Database error:', error);
        throw error;
    }
}

// دالة لإظهار الإشعارات
function showNotification(notificationElement, message) {
    notificationElement.innerText = message; // تعيين نص الإشعار
    notificationElement.classList.add('show'); // إظهار الإشعار
    setTimeout(() => {
        notificationElement.classList.remove('show'); // إخفاء الإشعار بعد 4 ثوانٍ
    }, 4000);
}

// دالة لإغلاق الأحجية وإعادة تعيين الحالة
function closePuzzle() {
    clearInterval(countdownInterval); // إيقاف العداد إذا كان نشطًا
    uiElements.puzzleContainer.classList.add('hidden'); // إخفاء الأحجية
    uiElements.puzzleOptions.innerHTML = '';  // مسح الأزرار
    uiElements.purchaseNotification.innerText = ''; // مسح الإشعارات
    uiElements.closePuzzleBtn.classList.remove('hidden'); // إظهار زر الإغلاق
    attempts = 0; // إعادة تعيين عدد المحاولات
    puzzleSolved = false; // إعادة تعيين حالة الأحجية
}

// ربط الأحداث مع الأزرار
uiElements.puzzleOptions.addEventListener('click', function (event) {
    if (event.target.classList.contains('option-btn')) {
        checkPuzzleAnswer(event.target); // التحقق من الإجابة عند الضغط على الزر
    }
});
uiElements.openPuzzleBtn.addEventListener('click', displayTodaysPuzzle); // فتح الأحجية عند الضغط على الزر
uiElements.closePuzzleBtn.addEventListener('click', closePuzzle); // إغلاق الأحجية عند الضغط على زر الإغلاق

// تحديث واجهة المستخدم
function updateUI() {
    if (uiElements.balanceDisplay) {
        uiElements.balanceDisplay.innerText = gameState.balance.toLocaleString(); // عرض الرصيد الحالي
    }
}
