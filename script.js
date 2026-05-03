(() => {
    // Initial data structure
    let pondData = { 
        daily: [], 
        history: [], 
        moodLog: [], 
        waterCount: 0 
    };

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
        document.getElementById('dailyInput').onkeydown = (e) => e.key === 'Enter' && addHop();

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
                if (isAdding) {
                    pondData.moodLog.push({ val: "Drank Water", icon: "💧", time: currentTime() });
                }
                saveAndRefresh();
            };
        });

        // Toggle Bar
        document.getElementById('historyToggle').onclick = () => 
            document.getElementById('historyFooter').classList.toggle('collapsed');

        // --- BUTTON WORK ---
        
        // RESET POND: Clears the day but keeps history
        document.getElementById('resetPondBtn').onclick = () => {
            if (confirm("🐸 Start a new day? Active hops and water will reset, but your history is safe!")) {
                pondData.daily = []; 
                pondData.waterCount = 0;
                refreshMotivation();
                saveAndRefresh();
            }
        };

        // CLEAR HISTORY: Permanent wipe of everything
        document.getElementById('clearHistoryBtn').onclick = () => {
            if (confirm("⚠️ WARNING: This will permanently delete ALL your achievement logs. Continue?")) {
                pondData = { daily: [], history: [], moodLog: [], waterCount: 0 };
                saveAndRefresh();
                location.reload(); // Hard refresh to clear UI completely
            }
        };
    }

    function addHop() {
        const input = document.getElementById('dailyInput');
        if (!input.value.trim()) return;
        pondData.daily.push({ id: Date.now(), text: input.value.trim() });
        input.value = '';
        saveAndRefresh();
    }

    window.toggleHop = (id) => {
        const idx = pondData.daily.findIndex(g => g.id === id);
        if (idx > -1) {
            const item = pondData.daily.splice(idx, 1)[0];
            pondData.history.push({ text: item.text, time: currentTime() });
            saveAndRefresh();
        }
    };

    function renderAll() {
        // Active Hops
        const list = document.getElementById('dailyList');
        list.innerHTML = pondData.daily.map(g => `
            <li style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
                <input type="checkbox" onchange="toggleHop(${g.id})">
                <span>${g.text}</span>
            </li>
        `).join('') || '<li style="color:#67a36a; font-size:0.8rem;">No active hops... 🐸</li>';

        // Water
        document.querySelectorAll('.drop-btn').forEach((btn, i) => {
            i < pondData.waterCount ? btn.classList.add('active') : btn.classList.remove('active');
        });
        document.getElementById('waterCountText').textContent = `${pondData.waterCount} / 8 glasses`;

        // History Columns
        document.getElementById('dailyHistoryList').innerHTML = [...pondData.history].reverse().map(h => 
            `<div>🌿 ${h.text} <small>(${h.time})</small></div>`
        ).join('') || '<span>-</span>';

        document.getElementById('moodHistoryList').innerHTML = [...pondData.moodLog].reverse().map(m => 
            `<div>${m.icon} ${m.val} <small>(${m.time})</small></div>`
        ).join('') || '<span>-</span>';

        // Progress
        const total = pondData.daily.length + pondData.history.length;
        const percent = total ? Math.round((pondData.history.length / total) * 100) : 0;
        document.getElementById('dailyProgress').style.width = percent + '%';
        document.getElementById('dailyProgressText').textContent = percent + '%';
    }

    function refreshMotivation() {
        document.getElementById('motivationText').textContent = frogQuotes[Math.floor(Math.random() * frogQuotes.length)];
    }

    const currentTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    function saveAndRefresh() {
        localStorage.setItem('PondData_Final_V3', JSON.stringify(pondData));
        renderAll();
    }
    
    function init() {
        const s = localStorage.getItem('PondData_Final_V3');
        if (s) pondData = JSON.parse(s);
        document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        refreshMotivation();
        renderAll();
    }
})();
