(() => {
    let pondData = { daily: [], history: [], moodLog: [], waterCount: 0, streak: 0, lastStreakDate: null };

    const moodEmojis = { Happy: "😊", Calm: "😌", Focused: "🧐", Tired: "😴", Grumpy: "😠" };
    const frogQuotes = [
        "🐸 💖 Ribbit! You're doing amazing! 💞 🐸",
        "✨ 🐸 Take a deep breath, little froggy! 💗 ✨",
        "🌸 🐸 Every hop counts! I'm proud of you! 💖 🌸",
        "💕 🐸 Stay hydrated and stay happy! 🐸 💕",
        "🐸 💗 You are the best frog in the pond! ✨ 🐸"
    ];

    document.addEventListener('DOMContentLoaded', () => {
        init();
        setupEvents();
    });

    function setupEvents() {
        // Goal Adding
        document.getElementById('addDailyBtn').onclick = addHop;
        document.getElementById('dailyInput').onkeydown = (e) => {
            if (e.key === 'Enter') addHop();
        };

        // Mood Tracker
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.onclick = () => {
                const mood = btn.dataset.mood;
                pondData.moodLog.push({ val: mood, icon: moodEmojis[mood], time: currentTime() });
                saveAndRefresh();
            };
        });

        // Water Tracker
        document.querySelectorAll('.drop-btn').forEach((btn, i) => {
            btn.onclick = () => {
                const isAdding = (i + 1) > pondData.waterCount;
                pondData.waterCount = i + 1;
                if (isAdding) pondData.moodLog.push({ val: "Drank Water", icon: "💧", time: currentTime() });
                saveAndRefresh();
            };
        });

        // Toggle History Bar
        document.getElementById('historyToggle').onclick = () => 
            document.getElementById('historyFooter').classList.toggle('collapsed');

        // Reset Pond Button
        document.getElementById('resetPondBtn').onclick = () => {
            if (confirm("Reset today? Logs stay safe!")) {
                pondData.daily = []; 
                pondData.waterCount = 0;
                refreshMotivation(); 
                saveAndRefresh();
            }
        };

        // Clear History Button
        document.getElementById('clearHistoryBtn').onclick = () => {
            if (confirm("Delete ALL logs?")) {
                pondData = { daily: [], history: [], moodLog: [], waterCount: 0, streak: 0, lastStreakDate: null };
                saveAndRefresh();
                location.reload();
            }
        };
    }

    function addHop() {
        const input = document.getElementById('dailyInput');
        const text = input.value.trim();
        if (!text) return;
        pondData.daily.push({ id: Date.now(), text: text });
        input.value = '';
        saveAndRefresh();
    }

    // FIXED: Attached to window so the HTML checkbox can find it
    window.toggleHop = (id) => {
        const idx = pondData.daily.findIndex(g => g.id === id);
        if (idx > -1) {
            const item = pondData.daily.splice(idx, 1)[0]; // Remove from active
            pondData.history.push({ text: item.text, time: currentTime() }); // Add to log
            updateStreak();
            saveAndRefresh();
        }
    };

    function updateStreak() {
        const today = new Date().toDateString();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();

        if (pondData.lastStreakDate === today) return;

        if (pondData.lastStreakDate === yesterdayStr) {
            pondData.streak++;
        } else {
            pondData.streak = 1;
        }
        pondData.lastStreakDate = today;
    }

    function renderAll() {
        // Render Active Hops
        const list = document.getElementById('dailyList');
        if (list) {
            list.innerHTML = pondData.daily.map(g => `
                <li style="display:flex; align-items:center; gap:12px; margin-bottom:12px; background:white; padding:8px; border-radius:10px; border:1px solid #eee;">
                    <input type="checkbox" style="width:22px; height:22px; cursor:pointer;" onchange="toggleHop(${g.id})">
                    <span style="font-size:1rem; color:#5d4a4a;">${g.text}</span>
                </li>
            `).join('') || '<li style="color:#67a36a; font-size:0.85rem; text-align:center; padding:10px;">No active hops yet... 🐸</li>';
        }

        // Render Water
        document.querySelectorAll('.drop-btn').forEach((btn, i) => {
            i < pondData.waterCount ? btn.classList.add('active') : btn.classList.remove('active');
        });
        document.getElementById('waterCountText').textContent = `${pondData.waterCount} / 8`;

        // Render Streak
        document.getElementById('streakCount').textContent = pondData.streak || 0;

        // Render Logs
        document.getElementById('dailyHistoryList').innerHTML = [...pondData.history].reverse().slice(0, 15).map(h => 
            `<div style="font-size:0.75rem; padding:4px 0; border-bottom:1px solid rgba(255,255,255,0.1);">🌿 ${h.text} <small style="opacity:0.7">(${h.time})</small></div>`).join('') || '<span>-</span>';

        document.getElementById('moodHistoryList').innerHTML = [...pondData.moodLog].reverse().slice(0, 15).map(m => 
            `<div style="font-size:0.75rem; padding:4px 0; border-bottom:1px solid rgba(255,255,255,0.1);">${m.icon} ${m.val} <small style="opacity:0.7">(${m.time})</small></div>`).join('') || '<span>-</span>';

        // Update Progress Bar
        const total = pondData.daily.length + pondData.history.length;
        const percent = total ? Math.round((pondData.history.length / total) * 100) : 0;
        document.getElementById('dailyProgress').style.width = percent + '%';
        document.getElementById('dailyProgressText').textContent = percent + '%';
    }

    function refreshMotivation() {
        document.getElementById('motivationText').textContent = frogQuotes[Math.floor(Math.random() * frogQuotes.length)];
    }

    const currentTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const saveAndRefresh = () => { 
        localStorage.setItem('PondData_Final_V5', JSON.stringify(pondData)); 
        renderAll(); 
    };
    
    function init() {
        const s = localStorage.getItem('PondData_Final_V5');
        if (s) pondData = JSON.parse(s);
        const dateEl = document.getElementById('currentDate');
        if (dateEl) dateEl.textContent = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        refreshMotivation();
        renderAll();
    }
})();
