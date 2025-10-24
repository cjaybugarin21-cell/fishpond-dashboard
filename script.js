
const firebaseConfig = {
    apiKey: "AIzaSyBf_8BzqSO3GxotpQNYU-iaNDY1HwmF8s0",
    authDomain: "fishpond-monitoring-f6e67.firebaseapp.com",
    databaseURL: "https://fishpond-monitoring-f6e67-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "fishpond-monitoring-f6e67",
    storageBucket: "fishpond-monitoring-f6e67.firebasestorage.app",
    messagingSenderId: "778480544463",
    appId: "1:778480544463:web:f92342bae97c23ed39a5ba",
    measurementId: "G-7RCPDBHF7G"
};


firebase.initializeApp(firebaseConfig);
const db = firebase.database();


const tempValueEl = document.getElementById('temp-value');
const tempStatusEl = document.getElementById('temp-status');
const tempTimestampEl = document.getElementById('temp-timestamp');
const levelValueEl = document.getElementById('level-value');
const levelStatusEl = document.getElementById('level-status');
const levelBarFillEl = document.getElementById('level-bar-fill');
const activityLogEl = document.getElementById('activity-log'); 

const MAX_LEVEL_CM = 150;


function logActivity(message, type = 'info') {
    
    if (!activityLogEl) {
       
        console.warn(`[Dashboard Log] Element 'activity-log' not found in HTML. Message: ${message}`);
        return; 
    }

    const ts = new Date().toLocaleTimeString('en-US', { hour12: false });
    const p = document.createElement('p');
    let color = '#495057';
    
    if (type === 'warning') color = 'var(--color-yellow, orange)';
    else if (type === 'alert') color = 'var(--color-red, red)';
    else if (type === 'success') color = 'var(--secondary-green, green)';

    p.style.color = color;
    p.textContent = `[${ts}] ${message}`;
    
    
    activityLogEl.prepend(p);
    
    if (activityLogEl.children.length > 30) activityLogEl.removeChild(activityLogEl.lastChild);
}



const tempRef = db.ref('fishpond/temperature');
const levelRef = db.ref('fishpond/level');


tempRef.on('value', (snapshot) => {
    const temp = snapshot.val();
    if (temp == null) return;

    if (tempValueEl) tempValueEl.textContent = `${temp.toFixed(1)}°C`;
    if (tempTimestampEl) tempTimestampEl.textContent = new Date().toLocaleTimeString('en-US');

    let statusText = 'Normal', color = 'var(--secondary-green)', logType = 'success';

    // Updated thresholds based on your description
    if (temp <= 22) {
        statusText = 'Low';
        color = 'var(--primary-blue)';
        logType = 'warning';
    } else if (temp >= 35) {
        statusText = 'High';
        color = 'var(--color-red)';
        logType = 'alert';
    } else if (temp >= 25 && temp <= 33) {
        statusText = 'Normal';
        color = 'var(--secondary-green)';
        logType = 'success';
    } else {
        // Between 22–25 or 33–35 → Slightly out of range (optional)
        statusText = 'Caution';
        color = 'var(--color-yellow)';
        logType = 'warning';
    }

    if (tempStatusEl) {
        tempStatusEl.style.backgroundColor = color;
        tempStatusEl.textContent = statusText;
    }

    logActivity(`Temperature: ${temp.toFixed(1)}°C (${statusText})`, logType);
});



levelRef.on('value', (snapshot) => {
    const level = snapshot.val();
    if (level == null) return; 

    const roundedLevel = Math.round(level);
    
    
    if (levelValueEl) levelValueEl.textContent = roundedLevel;
    
    
    if (levelBarFillEl) {
        levelBarFillEl.style.height = `${Math.min(100, (roundedLevel / MAX_LEVEL_CM) * 100)}%`;
    }

    let statusText = 'Normal', color = 'var(--secondary-green)', logType = 'success';
    if (level < 100) { statusText = 'Low'; color = 'var(--color-yellow)'; logType = 'warning'; }
    else if (level > 140) { statusText = 'High'; color = 'var(--color-red)'; logType = 'alert'; }

    
    if (levelStatusEl) {
        levelStatusEl.style.backgroundColor = color;
        levelStatusEl.textContent = statusText;
    }

    logActivity(`Water Level: ${roundedLevel} cm (${statusText})`, logType);
});


logActivity('Dashboard initialized. Waiting for Firebase data...', 'info');
