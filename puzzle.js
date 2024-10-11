// Load puzzles from JSON file
async function loadPuzzles() {
    try {
        const response = await fetch('puzzles.json'); // Fetch puzzles from JSON file
        if (!response.ok) throw new Error('Failed to load puzzles');
        const data = await response.json();
        return data.puzzles;
    } catch (error) {
        console.error(error);
        showNotification(puzzleNotification, 'Error loading puzzle. Please try again later.');
    }
}

// Get today's puzzle
function getTodaysPuzzle(puzzles) {
    return puzzles[0]; // Assume we pick the first puzzle
}

// Define DOM elements
const puzzleContainer = document.getElementById('puzzleContainer');
const openPuzzleBtn = document.getElementById('openPuzzleBtn');
const puzzleQuestion = document.getElementById('puzzleQuestion');
const puzzleOptions = document.getElementById('puzzleOptions');
const puzzleNotification = document.getElementById('puzzleNotification');
const puzzleHint = document.getElementById('puzzleHint');
const timerDisplay = document.getElementById('timer');
const closePuzzleBtn = document.getElementById('closePuzzleBtn');
const remainingAttemptsDisplay = document.createElement('div'); // Display for remaining attempts
remainingAttemptsDisplay.id = 'remainingAttempts';
document.querySelector('.puzzle-content').appendChild(remainingAttemptsDisplay); // Append remaining attempts display

// Game state
let currentPuzzle;
let attempts = 0; // Number of attempts
let puzzleSolved = false; // Whether the puzzle has been solved
let countdownInterval; // Timer
const maxAttempts = 3; // Maximum attempts
const puzzleReward = 500000; // Reward for correct answer
const penaltyAmount = 500; // Penalty for wrong answer

// Load and display today's puzzle
async function displayTodaysPuzzle() {
    const puzzles = await loadPuzzles(); // Fetch puzzles
    currentPuzzle = getTodaysPuzzle(puzzles); // Get today's puzzle

    // Display question and hint
    puzzleQuestion.innerText = currentPuzzle.question;
    puzzleHint.innerText = `Hint: ${currentPuzzle.hint}`;

    // Display options as buttons
    const optionsHtml = currentPuzzle.options.map(option => `<button class="option-btn">${option}</button>`).join('');
    puzzleOptions.innerHTML = optionsHtml;

    puzzleContainer.classList.remove('hidden'); // Show puzzle
    closePuzzleBtn.classList.add('hidden'); // Hide close button until solved
    updateRemainingAttempts(); // Update remaining attempts display
    startCountdown(); // Start countdown
}

// Timer function
function startCountdown() {
    let timeLeft = 60.00; // 60 seconds
    timerDisplay.innerText = timeLeft.toFixed(2); // Display remaining time

    countdownInterval = setInterval(() => {
        timeLeft -= 0.01;
        timerDisplay.innerText = timeLeft.toFixed(2);

        if (timeLeft <= 0) {
            clearInterval(countdownInterval); // Stop timer
            handlePuzzleTimeout(); // Handle timeout
        }
    }, 10); // Update every 10 milliseconds
}

// Handle timeout
function handlePuzzleTimeout() {
    clearInterval(countdownInterval); // Stop timer
    showNotification(puzzleNotification, "Time's up! You failed to solve the puzzle.");
    updateBalance(-penaltyAmount); // Deduct coins
    closePuzzle(); // Close puzzle after timeout
}

// Check user's answer
function checkPuzzleAnswer(selectedOption) {
    if (puzzleSolved || attempts >= maxAttempts) {
        // If the user has exhausted attempts or solved the puzzle
        showNotification(puzzleNotification, puzzleSolved ? 'You have already solved this puzzle.' : 'You have failed. Please try again later.');
        return; // Prevent further clicks
    }

    const userAnswer = selectedOption.innerText.trim(); // Get selected button text

    if (userAnswer === currentPuzzle.answer && !puzzleSolved) {
        handlePuzzleSuccess(); // Handle correct answer
    } else {
        handlePuzzleWrongAnswer(); // Handle wrong answer
    }
}

// Handle correct answer
function handlePuzzleSuccess() {
    clearInterval(countdownInterval); // Stop timer
    puzzleSolved = true; // Update puzzle state
    showNotification(puzzleNotification, `Correct! You've earned ${puzzleReward} coins.`); // Show success message
    updateBalance(puzzleReward); // Add reward to balance
    closePuzzleBtn.classList.remove('hidden'); // Show close button
    document.querySelectorAll('.option-btn').forEach(btn => btn.disabled = true); // Disable buttons after win
}

// Handle wrong answer
function handlePuzzleWrongAnswer() {
    attempts++; // Increment attempts
    updateRemainingAttempts(); // Update remaining attempts display

    if (attempts === maxAttempts) {
        clearInterval(countdownInterval); // Stop timer after loss
        showNotification(puzzleNotification, 'You have used all attempts. 500 coins have been deducted.');
        updateBalance(-penaltyAmount); // Deduct coins
        closePuzzle(); // Close puzzle after exhausting attempts
    } else {
        showNotification(puzzleNotification, `Wrong answer. You have ${maxAttempts - attempts} attempts remaining.`);
    }
}

// Update remaining attempts display
function updateRemainingAttempts() {
    remainingAttemptsDisplay.innerText = `Attempts remaining: ${maxAttempts - attempts}`;
}

// Update balance
async function updateBalance(amount) {
    gameState.balance += amount; // Update local balance

    try {
        await updateUserData(); // Update balance in the database
        updateUI(); // Update UI after successful balance update
    } catch (error) {
        showNotification(puzzleNotification, 'Error updating balance. Please try again later.');
    }
}

// Update user data in the database
async function updateUserData() {
    const { error } = await supabase
        .from('users')
        .update({ balance: gameState.balance }) // Update balance
        .eq('telegram_id', gameState.userTelegramId); // Match user by telegram_id

    if (error) {
        throw new Error('Error updating balance');
    }
}

// Show notifications
function showNotification(notificationElement, message) {
    notificationElement.innerText = message; // Set notification text
    notificationElement.classList.add('show'); // Show notification
    setTimeout(() => {
        notificationElement.classList.remove('show'); // Hide notification after 4 seconds
    }, 4000);
}

// Close puzzle and reset state
function closePuzzle() {
    clearInterval(countdownInterval); // Stop timer if active
    puzzleContainer.classList.add('hidden'); // Hide puzzle
    puzzleOptions.innerHTML = ''; // Clear buttons
    puzzleNotification.innerText = ''; // Clear notifications
    closePuzzleBtn.classList.remove('hidden'); // Show close button
    attempts = 0; // Reset attempts
    puzzleSolved = false; // Reset puzzle state
}

// Event listeners for buttons
puzzleOptions.addEventListener('click', function (event) {
    if (event.target.classList.contains('option-btn')) {
        checkPuzzleAnswer(event.target); // Check answer on button click
    }
});
openPuzzleBtn.addEventListener('click', displayTodaysPuzzle); // Open puzzle on button click
closePuzzleBtn.addEventListener('click', closePuzzle); // Close puzzle on close button click

// Update UI
function updateUI() {
    document.getElementById('balanceDisplay').innerText = gameState.balance.toLocaleString(); // Display current balance
}

// Initial game state
const gameState = {
    balance: 0, // User's balance
    userTelegramId: 'user-telegram-id', // Replace with actual user ID
};

// Start the game
displayTodaysPuzzle();
