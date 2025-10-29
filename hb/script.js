// Countdown class to manage individual timers
class Countdown {
    constructor(elementId, startValue, flashClass, voiceType) {
        this.element = document.getElementById(elementId);
        this.numberElement = this.element.querySelector('.number');
        this.startValue = startValue;
        this.currentValue = startValue;
        this.flashClass = flashClass;
        this.voiceType = voiceType; // 'male' or 'female'

        // Preload audio files for 1, 2, 3
        this.audioFiles = {};
        for (let i = 1; i <= 3; i++) {
            this.audioFiles[i] = new Audio(`sounds/${this.voiceType}/${i}.ogg`);
        }
    }

    update() {
        // Update display
        this.numberElement.textContent = this.currentValue;

        // Flash on 3, 2, 1, and 0
        if (this.currentValue <= 3 && this.currentValue >= 0) {
            this.flash();
        }

        // Decrement or reset
        if (this.currentValue > 0) {
            this.currentValue--;
        } else {
            this.currentValue = this.startValue;
        }
    }

    flash() {
        this.element.classList.add('flash');

        // Play sound if we have audio for this number
        if (this.currentValue >= 1 && this.currentValue <= 3) {
            this.playSound(this.currentValue);
        }

        // Remove class after animation completes
        setTimeout(() => {
            this.element.classList.remove('flash');
        }, 500);
    }

    playSound(number) {
        // Check the appropriate mute state based on voice type
        const isMuted = (this.voiceType === 'male') ? isLeftMuted : isRightMuted;

        if (this.audioFiles[number] && !isMuted) {
            // Reset audio to beginning in case it's already playing
            this.audioFiles[number].currentTime = 0;
            this.audioFiles[number].play().catch(e => console.log('Audio play failed:', e));
        }
    }
}

// Initialize countdowns with voice types
const leftCountdown = new Countdown('leftCountdown', 15, 'flash', 'male');
const rightCountdown = new Countdown('rightCountdown', 20, 'flash', 'female');

// Bottom countdown (no sound, just visual)
const bottomElement = document.getElementById('bottomCountdown');
const bottomNumber = bottomElement.querySelector('.number');
let bottomValue = 12;

// Preload pop sound (shared by both countdowns)
const popSound = new Audio('sounds/pop.mp3');

// Start button functionality
const startOverlay = document.getElementById('startOverlay');
const startButton = document.getElementById('startButton');
let timerStarted = false;

startButton.addEventListener('click', () => {
    // Initialize audio
    popSound.volume = 0;
    popSound.play().then(() => {
        popSound.pause();
        popSound.currentTime = 0;
        popSound.volume = 1;
    }).catch(e => {});

    Object.values(leftCountdown.audioFiles).forEach(audio => {
        audio.volume = 0;
        audio.play().then(() => {
            audio.pause();
            audio.currentTime = 0;
            audio.volume = 1;
        }).catch(e => {});
    });

    Object.values(rightCountdown.audioFiles).forEach(audio => {
        audio.volume = 0;
        audio.play().then(() => {
            audio.pause();
            audio.currentTime = 0;
            audio.volume = 1;
        }).catch(e => {});
    });

    // Hide overlay and start timer
    startOverlay.classList.add('hidden');
    timerStarted = true;
    console.log('Timers started!');
});

// Mute functionality - separate for left and right
let isLeftMuted = false;
let isRightMuted = false;

const leftMuteButton = document.getElementById('leftMuteButton');
const leftMuteIcon = leftMuteButton.querySelector('.mute-icon');

const rightMuteButton = document.getElementById('rightMuteButton');
const rightMuteIcon = rightMuteButton.querySelector('.mute-icon');

leftMuteButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    isLeftMuted = !isLeftMuted;
    leftMuteIcon.src = isLeftMuted ? 'icons/mute.png' : 'icons/volume.png';
    console.log('Left muted:', isLeftMuted);
});

rightMuteButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    isRightMuted = !isRightMuted;
    rightMuteIcon.src = isRightMuted ? 'icons/mute-white.png' : 'icons/volume-white.png';
    console.log('Right muted:', isRightMuted);
});

// Synchronized timer - both start at the same time
let elapsedSeconds = 0;

setInterval(() => {
    // Only run if timer has been started
    if (!timerStarted) return;

    elapsedSeconds++;

    // Left countdown: updates every second, resets every 15 seconds
    let leftValue = 15 - (elapsedSeconds % 15);
    if (leftValue === 0) {
        leftValue = 15;
    }
    leftCountdown.currentValue = leftValue;
    leftCountdown.numberElement.textContent = leftCountdown.currentValue;

    // Pulse on 3, 2, 1 and flash on reset (showing 15 = "0" moment)
    if (leftCountdown.currentValue >= 1 && leftCountdown.currentValue <= 3) {
        leftCountdown.element.classList.add(`pulse-${leftCountdown.currentValue}`);
        leftCountdown.playSound(leftCountdown.currentValue);
        setTimeout(() => {
            leftCountdown.element.classList.remove(`pulse-${leftCountdown.currentValue}`);
        }, 500);
    } else if (leftCountdown.currentValue === 15) {
        leftCountdown.flash();

        // Play pop sound when resetting to 15 (the "0" moment)
        if (!isLeftMuted) {
            popSound.currentTime = 0;
            popSound.play().catch(e => console.log('Pop sound failed:', e));
        }
    }

    // Right countdown: updates every second, resets every 20 seconds
    let rightValue = 20 - (elapsedSeconds % 20);
    if (rightValue === 0) {
        rightValue = 20;
    }
    rightCountdown.currentValue = rightValue;
    rightCountdown.numberElement.textContent = rightCountdown.currentValue;

    // Pulse on 3, 2, 1 and flash on reset (showing 20 = "0" moment)
    if (rightCountdown.currentValue >= 1 && rightCountdown.currentValue <= 3) {
        rightCountdown.element.classList.add(`pulse-${rightCountdown.currentValue}`);
        rightCountdown.playSound(rightCountdown.currentValue);
        setTimeout(() => {
            rightCountdown.element.classList.remove(`pulse-${rightCountdown.currentValue}`);
        }, 500);
    } else if (rightCountdown.currentValue === 20) {
        rightCountdown.flash();

        // Play pop sound when resetting to 20 (the "0" moment)
        if (!isRightMuted) {
            popSound.currentTime = 0;
            popSound.play().catch(e => console.log('Pop sound failed:', e));
        }
    }

    // Bottom countdown: updates every second, resets every 12 seconds
    let bottomVal = 12 - (elapsedSeconds % 12);
    if (bottomVal === 0) {
        bottomVal = 12;
    }
    bottomValue = bottomVal;
    bottomNumber.textContent = bottomValue;

    // Pulse on 3, 2, 1 and flash on reset (showing 12 = "0" moment)
    if (bottomValue >= 1 && bottomValue <= 3) {
        bottomElement.classList.add(`pulse-${bottomValue}`);
        setTimeout(() => {
            bottomElement.classList.remove(`pulse-${bottomValue}`);
        }, 500);
    } else if (bottomValue === 12) {
        bottomElement.classList.add('flash');
        setTimeout(() => {
            bottomElement.classList.remove('flash');
        }, 500);
    }

    // Reset master timer after 60 seconds (LCM of 15 and 20)
    if (elapsedSeconds >= 60) {
        elapsedSeconds = 0;
    }
}, 1000);
