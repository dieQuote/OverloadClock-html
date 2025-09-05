const progressBar = document.getElementById('progressBar');
const overtimeContainer = document.getElementById('overtimeContainer');
const overtimeStopwatch = document.getElementById('overtimeStopwatch');
const alarmSound = document.getElementById('alarmSound');
const themeSwitch = document.getElementById('themeSwitch');
const startTimeInput = document.getElementById('startTime');
const workDurationInput = document.getElementById('workDuration');

function pad(n) { return n.toString().padStart(2, '0'); }

function getNowTimeISO() {
    const now = new Date();
    return pad(now.getHours()) + ':' + pad(now.getMinutes());
}
startTimeInput.value = getNowTimeISO();

function getStartTimeToday() {
    const [h, m] = startTimeInput.value.split(':').map(Number);
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);
    return start;
}

function parseDuration(str) {
    const match = /^(\d{1,2}):([0-5]\d)$/.exec(str.trim());
    if (!match) return 8 * 3600;
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    return hours * 3600 + minutes * 60;
}

let startTime = getStartTimeToday();
let workDuration = parseDuration(workDurationInput.value);
let timer = null;
let overtimeTimer = null;
let alarmPlayed = false;

function updateBar() {
    startTime = getStartTimeToday();
    workDuration = parseDuration(workDurationInput.value);
    const now = new Date();
    const elapsed = (now - startTime) / 1000; // seconds
    let percent = Math.min(elapsed / workDuration, 1);
    progressBar.style.width = (percent * 100) + '%';

    // Color transition: green (0%) → yellow (50%) → red (100%)
    if (percent < 1) {
        let color;
        if (percent < 0.5) {
            // Green to yellow
            let g = 255;
            let r = Math.round(510 * percent);
            color = `rgb(${r},${g},0)`;
        } else {
            // Yellow to red
            let r = 255;
            let g = Math.round(255 - 510 * (percent - 0.5));
            color = `rgb(${r},${Math.max(g,0)},0)`;
        }
        progressBar.style.background = color;
        overtimeContainer.style.display = 'none';
        alarmPlayed = false;
    } else {
        // Overtime: transition bar to deep purple
        let overtime = elapsed - workDuration;
        let t = Math.min(overtime / 600, 1); // 10 min to full purple
        // Deep purple: #4B006E
        let r = Math.round(255 * (1-t) + 75 * t);
        let g = Math.round(0 * (1-t) + 0 * t);
        let b = Math.round(0 * (1-t) + 110 * t);
        progressBar.style.background = `rgb(${r},${g},${b})`;
        overtimeContainer.style.display = 'block';
        if (!alarmPlayed) {
            alarmSound.play();
            alarmPlayed = true;
        }
        // Start overtime stopwatch
        if (!overtimeTimer) {
            overtimeTimer = setInterval(updateOvertime, 1000);
        }
    }
}

function updateOvertime() {
    const now = new Date();
    const overtime = Math.floor((now - startTime) / 1000 - workDuration);
    if (overtime >= 0) {
        const h = pad(Math.floor(overtime / 3600));
        const m = pad(Math.floor((overtime % 3600) / 60));
        const s = pad(overtime % 60);
        overtimeStopwatch.textContent = `${h}:${m}:${s}`;
    }
}

function startClock() {
    clearInterval(timer);
    clearInterval(overtimeTimer);
    overtimeTimer = null;
    alarmPlayed = false;
    overtimeStopwatch.textContent = '00:00:00';
    timer = setInterval(updateBar, 1000);
    updateBar();
}

// Default to dark mode
document.body.classList.add('dark');
themeSwitch.checked = false;

themeSwitch.addEventListener('change', () => {
    if (themeSwitch.checked) {
        document.body.classList.add('light');
        document.body.classList.remove('dark');
    } else {
        document.body.classList.add('dark');
        document.body.classList.remove('light');
    }
    localStorage.setItem('theme', themeSwitch.checked ? 'light' : 'dark');
});

// On load, restore theme
window.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
        themeSwitch.checked = true;
        document.body.classList.add('light');
        document.body.classList.remove('dark');
    } else {
        themeSwitch.checked = false;
        document.body.classList.add('dark');
        document.body.classList.remove('light');
    }
});

startTimeInput.addEventListener('input', updateBar);
workDurationInput.addEventListener('input', updateBar);

window.onload = () => {
    updateBar();
};
