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
        document.getElementById('addDailyBtn').onclick = addHop;
        document.getElementById('dailyInput').onkeydown = (e) => e.key === 'Enter' && addHop();

        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.onclick = () => {
                const mood = btn.dataset.mood;
                pondData.moodLog.push({ val: mood, icon: moodEmojis[mood], time: currentTime() });
                saveAndRefresh();
            };
        });

        document.querySelectorAll('.drop-btn').forEach((btn, i) => {
            btn.onclick = () => {
                const isAdding = (i + 1) > pondData.waterCount;
                pondData.waterCount = i + 1;
                if (isAdding) pondData.moodLog.push({ val: "Drank Water", icon: "💧", time: currentTime() });
                saveAndRefresh();
            };
        });

        document.getElementById('historyToggle').onclick = () => 
            document.getElementById('historyFooter').classList.toggle('collapsed');

        document.getElementById('resetPondBtn').onclick = () => {
            if (confirm("Reset today? Logs stay safe!")) {
                pondData.daily = []; pondData.waterCount = 0;
                refreshMotivation(); saveAndRefresh();
            }
        };

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
        if (!input.value.trim()) return;
        pondData.daily.push({ id: Date.now(), text: input.value.trim() });
        input.value = '';
        saveAndRefresh();
    }

    window.toggleHop = (id) => {
        const idx = pondData.daily.findIndex(g => g.id === id);
        if (idx > -1) {
            const item = pondData.daily.splice(idx, 1);
            pondData.history.push({ text: item[0].text, time: currentTime() });
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
        const list = document.getElementById('dailyList');
        list.innerHTML = pondData.daily.map(g => `
            <li style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
                <input type="checkbox" style="width:20px; height:20px;" onchange="toggleHop(${g.id})">
                <span>${g.text}</span>
            </li>
        `).join('') || '<li style="color:#67a36a; font-size:0.8rem;">No active hops... 🐸</li>';

        document.querySelectorAll('.drop-btn').forEach((btn, i) => {
            i < pondData.waterCount ? btn.classList.add('active') : btn.classList.remove('active');
        });
        document.getElementById('waterCountText').textContent = `${pondData.waterCount} / 8`;
        document.getElementById('streakCount').textContent = pondData.streak || 0;

        document.getElementById('dailyHistoryList').innerHTML = [...pondData.history].reverse().slice(0, 10).map(h => 
            `<div>🌿 ${h.text} <small>(${h.time})</small></div>`).join('') || '<span>-</span>';

        document.getElementById('moodHistoryList').innerHTML = [...pondData.moodLog].reverse().slice(0, 10).map(m => 
            `<div>${m.icon} ${m.val} <small>(${m.time})</small></div>`).join('') || '<span>-</span>';

        const total = pondData.daily.length + pondData.history.length;
        const percent = total ? Math.round((pondData.history.length / total) * 100) : 0;
        document.getElementById('dailyProgress').style.width = percent + '%';
        document.getElementById('dailyProgressText').textContent = percent + '%';
    }

    function refreshMotivation() {
        document.getElementById('motivationText').textContent = frogQuotes[Math.floor(Math.random() * frogQuotes.length)];
    }

    const currentTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const saveAndRefresh = () => { localStorage.setItem('PondData_Final_V4', JSON.stringify(pondData)); renderAll(); };
    
    function init() {
        const s = localStorage.getItem('PondData_Final_V4');
        if (s) pondData = JSON.parse(s);
        document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        refreshMotivation();
        renderAll();
    }
})();
