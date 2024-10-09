// Fetch the puzzle from the JSON file
async function loadPuzzles() {
    try {
        const response = await fetch('puzzles.json'); // Load JSON file containing puzzles
        if (!response.ok) throw new Error('Failed to load puzzles');
        const data = await response.json();
        return data.puzzles;
    } catch (error) {
        console.error(error);
        puzzleNotification.innerText = 'Error loading puzzle. Please try again later.';
    }
}

// Get today's puzzle (assuming only one puzzle for now)
function getTodaysPuzzle(puzzles) {
    return puzzles[0]; // Get the first puzzle (you can add more puzzles and change this logic later)
}

// DOM elements
const puzzleContainer = document.getElementById('puzzleContainer');
const openPuzzleBtn = document.getElementById('openPuzzleBtn');
const puzzleQuestion = document.getElementById('puzzleQuestion');
const puzzleOptions = document.getElementById('puzzleOptions');  // عنصر عرض الخيارات
const puzzleNotification = document.getElementById('puzzleNotification');
const puzzleHint = document.getElementById('puzzleHint');
const timerDisplay = document.getElementById('timer');
const closePuzzleBtn = document.getElementById('closePuzzleBtn');

let currentPuzzle;
let attempts = 0;
let countdownInterval;
let puzzleSolved = false;
let currentPuzzleReward = 500000; // تعيين المكافأة الافتراضية

// Load and display today's puzzle
async function displayTodaysPuzzle() {
    const puzzles = await loadPuzzles();
    currentPuzzle = getTodaysPuzzle(puzzles);

    puzzleQuestion.innerText = currentPuzzle.question;
    puzzleHint.innerText = `Hint: ${currentPuzzle.hint}`;
    currentPuzzleReward = currentPuzzle.reward;

    // Display options as buttons
    const optionsHtml = currentPuzzle.options.map(option => `<button class="option-btn">${option}</button>`).join('');
    puzzleOptions.innerHTML = optionsHtml;

    puzzleContainer.classList.remove('hidden'); // Show the puzzle container
    startCountdown();
}

// Check the user's answer
function checkPuzzleAnswer(selectedOption) {
    const userAnswer = selectedOption.innerText.trim(); // Get the text of the clicked button

    if (userAnswer === currentPuzzle.answer && !puzzleSolved) {
        handlePuzzleSuccess();
    } else {
        handlePuzzleWrongAnswer();
    }
}

// Handle correct answer
function handlePuzzleSuccess() {
    clearInterval(countdownInterval);
    puzzleSolved = true;
    puzzleNotification.innerText = `Correct! You've earned ${currentPuzzleReward} coins.`;
    puzzleNotification.classList.remove('warning');
    puzzleNotification.classList.add('success');

    // Add the reward to the user's balance
    gameState.balance += currentPuzzleReward;
    updateUI();
    saveGameState();

    closePuzzleBtn.classList.remove('hidden');
    document.querySelectorAll('.option-btn').forEach(btn => btn.disabled = true); // Disable all buttons after solving the puzzle
}

// Handle wrong answer
function handlePuzzleWrongAnswer() {
    attempts++;
    puzzleNotification.classList.remove('success');
    puzzleNotification.classList.add('warning');

    if (attempts === 1) {
        puzzleNotification.innerText = "Wrong answer. Try again! Hint: Add the same number each time.";
    } else if (attempts === 2) {
        puzzleNotification.innerText = "Wrong again. 500 coins have been deducted.";
        gameState.balance -= 500;
        updateUI();
        saveGameState();
    } else if (attempts === 3) {
        puzzleNotification.innerText = "Third wrong answer. 5000 coins have been deducted.";
        if (gameState.balance >= 5000) {
            gameState.balance -= 5000;
            updateUI();
        }
        saveGameState();
    }
}

// Countdown timer logic
function startCountdown() {
    let timeLeft = 60.00;
    countdownInterval = setInterval(() => {
        timeLeft -= 0.01;  // نقص بمقدار 0.01 كل مرة
        timerDisplay.innerText = timeLeft.toFixed(2);  // عرض الرقم مع مكانين عشريين
        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            puzzleNotification.innerText = "Time's up! You failed to solve the puzzle.";
            closePuzzleBtn.classList.remove('hidden');
            document.querySelectorAll('.option-btn').forEach(btn => btn.disabled = true); // Disable all buttons
        }
    }, 10);  // تحديث كل 10 مللي ثانية لضمان عرض دقيق للوقت العشري
}

// Close the puzzle
function closePuzzle() {
    puzzleContainer.classList.add('hidden');
    puzzleOptions.innerHTML = '';  // Clear the options
    puzzleNotification.innerText = '';
    closePuzzleBtn.classList.add('hidden');
    attempts = 0;
    puzzleSolved = false;
}

// Event listeners
puzzleOptions.addEventListener('click', function (event) {
    if (event.target.classList.contains('option-btn')) {
        checkPuzzleAnswer(event.target); // Pass the clicked button
    }
});
openPuzzleBtn.addEventListener('click', displayTodaysPuzzle);
closePuzzleBtn.addEventListener('click', closePuzzle);

// Placeholder functions for game logic
function updateUI() {
    console.log("Balance updated:", gameState.balance);
}

function saveGameState() {
    console.log("Game state saved");
}

// Sample gameState for testing
let gameState = {
    balance: 10000  // Starting balance for testing
};
