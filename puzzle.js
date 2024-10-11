// تعريف عناصر DOM
const puzzleContainer = document.getElementById('puzzleContainer');
const openPuzzleBtn = document.getElementById('openPuzzleBtn');
const puzzleQuestion = document.getElementById('puzzleQuestion');
const puzzleOptions = document.getElementById('puzzleOptions');
const puzzleNotification = document.getElementById('puzzleNotification');
const puzzleHint = document.getElementById('puzzleHint');
const timerDisplay = document.getElementById('timer');
const closePuzzleBtn = document.getElementById('closePuzzleBtn');
const remainingAttemptsDisplay = document.createElement('div');
remainingAttemptsDisplay.id = 'remainingAttempts';
document.querySelector('.puzzle-content').appendChild(remainingAttemptsDisplay);

// حالة اللعبة للأحجية
let currentPuzzle;
let attempts = 0;
let puzzleSolved = false;
let countdownInterval;
const maxAttempts = 3;
const puzzleReward = 500000;
const penaltyAmount = 500;

// تحميل الأحجية من ملف JSON
async function loadPuzzles() {
    try {
        const response = await fetch('puzzles.json');
        if (!response.ok) throw new Error('Failed to load puzzles');
        const data = await response.json();
        return data.puzzles;
    } catch (error) {
        console.error(error);
        showNotification(puzzleNotification, 'Error loading puzzle. Please try again later.');
    }
}

// الحصول على أحجية اليوم
function getTodaysPuzzle(puzzles) {
    return puzzles[0]; // افتراضًا نختار أول أحجية
}

// تحميل الأحجية وعرضها
async function displayTodaysPuzzle() {
    const puzzles = await loadPuzzles();
    currentPuzzle = getTodaysPuzzle(puzzles);

    // عرض السؤال والتلميح
    puzzleQuestion.innerText = currentPuzzle.question;
    puzzleHint.innerText = `Hint: ${currentPuzzle.hint}`;

    // عرض الخيارات كأزرار
    const optionsHtml = currentPuzzle.options.map(option => `<button class="option-btn">${option}</button>`).join('');
    puzzleOptions.innerHTML = optionsHtml;

    puzzleContainer.classList.remove('hidden'); // إظهار الأحجية
    closePuzzleBtn.classList.add('hidden'); // إخفاء زر الإغلاق حتى يتم الحل
    updateRemainingAttempts(); // تحديث عرض المحاولات المتبقية
    startCountdown(); // بدء العداد
}

// بدء المؤقت
function startCountdown() {
    let timeLeft = 60.00;
    timerDisplay.innerText = timeLeft.toFixed(2);

    countdownInterval = setInterval(() => {
        timeLeft -= 0.01;
        timerDisplay.innerText = timeLeft.toFixed(2);

        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            handlePuzzleTimeout();
        }
    }, 10);
}

// التعامل مع انتهاء الوقت
function handlePuzzleTimeout() {
    clearInterval(countdownInterval);
    showNotification(puzzleNotification, "Time's up! You failed to solve the puzzle.");
    updateBalance(-penaltyAmount); // خصم العملات عند انتهاء الوقت
    closePuzzle(); // إغلاق الأحجية
}

// التحقق من إجابة المستخدم
function checkPuzzleAnswer(selectedOption) {
    if (puzzleSolved || attempts >= maxAttempts) {
        showNotification(puzzleNotification, puzzleSolved ? 'You have already solved this puzzle.' : 'You have failed. Please try again later.');
        return;
    }

    const userAnswer = selectedOption.innerText.trim();

    if (userAnswer === currentPuzzle.answer && !puzzleSolved) {
        handlePuzzleSuccess(); // التعامل مع الإجابة الصحيحة
    } else {
        handlePuzzleWrongAnswer(); // التعامل مع الإجابة الخاطئة
    }
}

// التعامل مع الإجابة الصحيحة
function handlePuzzleSuccess() {
    clearInterval(countdownInterval);
    puzzleSolved = true;
    showNotification(puzzleNotification, `Correct! You've earned ${puzzleReward} coins.`);
    updateBalance(puzzleReward); // إضافة المكافأة
    closePuzzleBtn.classList.remove('hidden'); // إظهار زر الإغلاق
    document.querySelectorAll('.option-btn').forEach(btn => btn.disabled = true); // تعطيل الأزرار بعد الحل
}

// التعامل مع الإجابة الخاطئة
function handlePuzzleWrongAnswer() {
    attempts++;
    updateRemainingAttempts();

    if (attempts === maxAttempts) {
        clearInterval(countdownInterval);
        showNotification(puzzleNotification, 'You have used all attempts. 500 coins have been deducted.');
        updateBalance(-penaltyAmount); // خصم العملات
        closePuzzle(); // إغلاق الأحجية
    } else {
        showNotification(puzzleNotification, `Wrong answer. You have ${maxAttempts - attempts} attempts remaining.`);
    }
}

// تحديث عرض المحاولات المتبقية
function updateRemainingAttempts() {
    remainingAttemptsDisplay.innerText = `Attempts remaining: ${maxAttempts - attempts}`;
}

// تحديث الرصيد
function updateBalance(amount) {
    gameState.balance += amount; // تعديل الرصيد في حالة اللعبة
    updateBalanceInDB(amount) // تحديث الرصيد في قاعدة البيانات
        .then(() => {
            updateUI(); // تحديث واجهة المستخدم بعد التحديث
        })
        .catch(() => {
            showNotification(puzzleNotification, 'Error updating balance. Please try again later.');
        });
}

// تحديث الرصيد في قاعدة البيانات
async function updateBalanceInDB(amount) {
    try {
        const { error } = await supabase
            .from('users')
            .update({ balance: gameState.balance })
            .eq('telegram_id', gameState.userTelegramId);

        if (error) {
            throw new Error('Error updating balance');
        }
    } catch (error) {
        console.error('Database error:', error);
        throw error;
    }
}

// إغلاق الأحجية وإعادة تعيين الحالة
function closePuzzle() {
    clearInterval(countdownInterval);
    puzzleContainer.classList.add('hidden'); // إخفاء الحاوية
    puzzleOptions.innerHTML = '';  // إخفاء الخيارات
    puzzleNotification.innerText = ''; // إعادة تعيين الإشعار
    closePuzzleBtn.classList.remove('hidden'); // التأكد من إظهار زر الإغلاق
    attempts = 0; // إعادة تعيين المحاولات
    puzzleSolved = false; // إعادة تعيين حالة الحل
}

// دالة لإظهار الإشعارات
function showNotification(notificationElement, message) {
    notificationElement.innerText = message; // تعيين الرسالة
    notificationElement.classList.add('show'); // إظهار الإشعار
    setTimeout(() => {
        notificationElement.classList.remove('show'); // إخفاء الإشعار بعد فترة
    }, 4000);
}

// تحديث واجهة المستخدم
function updateUI() {
    document.getElementById('balanceDisplay').innerText = gameState.balance.toLocaleString(); // عرض الرصيد
}

// ربط الأحداث مع الأزرار
puzzleOptions.addEventListener('click', function (event) {
    if (event.target.classList.contains('option-btn')) {
        checkPuzzleAnswer(event.target); // التحقق من الإجابة عند الضغط على الزر
    }
});

openPuzzleBtn.addEventListener('click', displayTodaysPuzzle); // فتح الأحجية عند الضغط على الزر
closePuzzleBtn.addEventListener('click', closePuzzle); // إغلاق الأحجية عند الضغط على زر الإغلاق
