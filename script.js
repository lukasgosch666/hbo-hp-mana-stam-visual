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
let countdownPhase = false;
let countdownStartTime = null;

startButton.addEventListener('click', () => {
    // Request fullscreen mode on mobile only
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                     (window.innerWidth <= 768 && 'ontouchstart' in window);

    if (isMobile) {
        const container = document.querySelector('.container');
        if (container.requestFullscreen) {
            container.requestFullscreen().catch(e => console.log('Fullscreen request failed:', e));
        } else if (container.webkitRequestFullscreen) { // Safari
            container.webkitRequestFullscreen();
        } else if (container.mozRequestFullScreen) { // Firefox
            container.mozRequestFullScreen();
        } else if (container.msRequestFullscreen) { // IE/Edge
            container.msRequestFullscreen();
        }
    }

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

    // Start countdown phase (keep overlay visible)
    countdownPhase = true;
    countdownStartTime = Date.now();
    startButton.disabled = true;
    console.log('Countdown started!');
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

// Reset timer functionality
const resetTimerLink = document.getElementById('resetTimer');
resetTimerLink.addEventListener('click', (e) => {
    e.preventDefault();
    location.reload();
});

// Synchronized timer - both start at the same time
let startTime = null;
let prevLeftValue = null;
let prevRightValue = null;
let prevBottomValue = null;
let prevCountdownValue = null;

setInterval(() => {
    // Handle 4-second countdown phase
    if (countdownPhase) {
        const countdownElapsed = (Date.now() - countdownStartTime) / 1000;
        const countdownRemaining = Math.max(0, 4 - countdownElapsed);

        // Display countdown on the start button
        const displayValue = Math.ceil(countdownRemaining);

        // Only update display when value changes
        if (displayValue !== prevCountdownValue) {
            prevCountdownValue = displayValue;
            if (displayValue > 0) {
                startButton.textContent = `REST/LOGIN IN ${displayValue}`;

                // Play both voices for 3, 2, 1
                if (displayValue >= 1 && displayValue <= 3) {
                    // Play male voice
                    if (!isLeftMuted && leftCountdown.audioFiles[displayValue]) {
                        leftCountdown.audioFiles[displayValue].currentTime = 0;
                        leftCountdown.audioFiles[displayValue].play().catch(e => console.log('Left countdown audio failed:', e));
                    }
                    // Play female voice
                    if (!isRightMuted && rightCountdown.audioFiles[displayValue]) {
                        rightCountdown.audioFiles[displayValue].currentTime = 0;
                        rightCountdown.audioFiles[displayValue].play().catch(e => console.log('Right countdown audio failed:', e));
                    }
                }
            }
        }

        // When countdown finishes, start the actual timers
        if (countdownRemaining <= 0) {
            countdownPhase = false;
            timerStarted = true;
            startTime = Date.now();
            startOverlay.classList.add('hidden');

            // Play pop sound when starting
            popSound.currentTime = 0;
            popSound.play().catch(e => console.log('Pop sound failed:', e));

            console.log('Main timers started!');
        }

        return;
    }

    // Only run main timers if they've been started
    if (!timerStarted) return;

    // Calculate elapsed seconds based on actual time, not interval counts
    const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);

    // Left countdown: updates every second, resets every 15 seconds
    let leftValue = 15 - (elapsedSeconds % 15);
    if (leftValue === 0) {
        leftValue = 15;
    }
    leftCountdown.currentValue = leftValue;
    leftCountdown.numberElement.textContent = leftCountdown.currentValue;

    // Only trigger effects when value changes
    if (leftValue !== prevLeftValue) {
        prevLeftValue = leftValue;

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
    }

    // Right countdown: updates every second, resets every 20 seconds
    let rightValue = 20 - (elapsedSeconds % 20);
    if (rightValue === 0) {
        rightValue = 20;
    }
    rightCountdown.currentValue = rightValue;
    rightCountdown.numberElement.textContent = rightCountdown.currentValue;

    // Only trigger effects when value changes
    if (rightValue !== prevRightValue) {
        prevRightValue = rightValue;

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
    }

    // Bottom countdown: updates every second, resets every 12 seconds
    let bottomVal = 12 - (elapsedSeconds % 12);
    if (bottomVal === 0) {
        bottomVal = 12;
    }
    bottomValue = bottomVal;
    bottomNumber.textContent = bottomValue;

    // Only trigger effects when value changes
    if (bottomValue !== prevBottomValue) {
        prevBottomValue = bottomValue;

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
    }
}, 100);
