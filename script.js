// Sounds
const startSound = new Audio('../sounds/start.mp3');
const goSound = new Audio('../sounds/go.mp3');
const restSound = new Audio('../sounds/rest.mp3');

// Play sound function
async function playSound(sound) {
    try {
        // Reset the sound and play it
        sound.currentTime = 0;
        await sound.play();
    } catch (error) {
        console.error('Sound playback error:', error);
    }
}

// DOM elements
const setupScreen = document.getElementById('setup-screen');
const timerScreen = document.getElementById('timer-screen');
const timerDisplay = document.getElementById('timer');
const countdownDisplay = document.getElementById('countdown');
const phaseDisplay = document.getElementById('phase');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const setupBtn = document.getElementById('setupBtn');
const workTimeInput = document.getElementById('workTime');
const restTimeInput = document.getElementById('restTime');
const roundsInput = document.getElementById('rounds');
const progressBar = document.getElementById('progress');

let interval;
let timeLeft;
let currentRound = 1;
let isWorking = false;
let isRunning = false;

function updateTimer() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // style container
    const timerContainer = document.querySelector('.container');
    if (isWorking) {
        timerContainer.classList.add('work-mode');
        timerContainer.classList.remove('rest-mode');
    } else {
        timerContainer.classList.add('rest-mode');
        timerContainer.classList.remove('work-mode');
    }
}

function startSetup() {
    setupScreen.classList.add('hidden');
    timerScreen.classList.remove('hidden');
    resetTimer();
    phaseDisplay.textContent = '1. Set - Get Ready!';
    document.querySelector('.container').classList.add('rest-mode');
}

function startTimer() {
    if (isRunning) {
        clearInterval(interval);
        startBtn.textContent = 'Start';
        isRunning = false;
        return;
    }

    isRunning = true;
    startBtn.textContent = 'Pause';
    
    if (!timeLeft) {
        timeLeft = 14; // 14 seconds preparation time
        isWorking = false;
    }

    interval = setInterval(() => {
        timeLeft--;
        updateTimer();

        // Update progress bar
        const totalTime = isWorking ? parseInt(workTimeInput.value) : (timeLeft <= 14 ? 14 : parseInt(restTimeInput.value));
        const progress = ((totalTime - timeLeft) / totalTime) * 100;
        progressBar.style.width = `${progress}%`;

        // Sounds during initial preparation (14 seconds)
        if (!isWorking && currentRound === 1) {
            if (timeLeft === 11) { 
                playSound(startSound);
            } else if (timeLeft === 2) {
                playSound(goSound);
            }
        }
        // Sounds during rest time (currentRound > 1 to differentiate from initial prep)
        else if (!isWorking && currentRound > 1) {
            if (timeLeft === 13) {
                // playSound(startSound);
                // Now it's not needed
            } else if (timeLeft === 3) {
                playSound(goSound);
            }
        }

        if (timeLeft === 0) {
            if (!isWorking) {
                isWorking = true;
                if (currentRound === 1) {
                    timeLeft = parseInt(workTimeInput.value);
                    phaseDisplay.textContent = '1. Set - Work!';
                } else {
                    timeLeft = parseInt(workTimeInput.value) + 1;
                    phaseDisplay.textContent = `${currentRound}. Set - Work!`;
                }
            } else {
                if (currentRound < parseInt(roundsInput.value)) {
                    isWorking = false;
                    timeLeft = parseInt(restTimeInput.value) + 1;
                    currentRound++;
                    phaseDisplay.textContent = 'Rest!';
                    playSound(restSound); // Rest sound when set ends
                } else {
                    clearInterval(interval);
                    phaseDisplay.textContent = 'Completed! STOP!';
                    phaseDisplay.classList.add('completed');
                    startBtn.textContent = 'Start';
                    isRunning = false;
                    playSound(restSound); // Rest sound when final set ends
                    return;
                }
            }
        }
    }, 1000);
}

function resetTimer() {
    clearInterval(interval);
    timeLeft = 14;
    currentRound = 1;
    isWorking = false;
    isRunning = false;
    startBtn.textContent = 'Start';
    phaseDisplay.textContent = '1. Set - Get Ready!';
    progressBar.style.width = '0%';
    updateTimer();
    
    // Reset container styles
    const timerContainer = document.querySelector('.container');
    timerContainer.classList.remove('work-mode', 'rest-mode');
    timerContainer.classList.add('rest-mode');
}

setupBtn.addEventListener('click', startSetup);
startBtn.addEventListener('click', startTimer);
resetBtn.addEventListener('click', resetTimer);

// Preload sounds
window.addEventListener('load', () => {
    startSound.load();
    goSound.load();
    restSound.load();
    
    // For user interaction, play the sound once
    document.addEventListener('click', function initAudio() {
        const playPromise = startSound.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                startSound.pause();
                startSound.currentTime = 0;
            }).catch(error => {
                console.error('Sound initialization error:', error);
            });
        }
        document.removeEventListener('click', initAudio);
    }, { once: true });
});

// Input validation
function validateInputs() {
    const inputs = [workTimeInput, restTimeInput, roundsInput];
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            let value = parseInt(this.value);
            if (value < 1) this.value = 1;
            if (value > 999) this.value = 999;
        });
    });
}

// Initialize input validation
validateInputs(); 