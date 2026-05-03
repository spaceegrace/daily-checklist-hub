(() => {
    let pondData = { daily: [], history: [], moodLog: [], waterCount: 0 };
    const moodEmojis = { Happy: "😊", Calm: "😌", Focused: "🧐", Tired: "😴", Grumpy: "😠" };
    const frogQuotes = [
        "✨ Ribbit! Let's make some waves today! 🌸",
        "🌿 Every hop counts, no matter how small! 🐸",
        "🌼 You're doing amazing, hop-py froggy! ✨",
        "🍄 Take a breath and enjoy the pond! 😌",
        "🌊 Stay hydrated and keep jumping! 💧"
    ];

    document.addEventListener('DOMContentLoaded', () => {
        init();
        setupEvents();
    });

    function setupEvents() {
        document.getElementById('addDailyBtn').onclick = addHop;
        document.getElementById('dailyInput').onkeydown = (e) => e.key === 'Enter' && addHop();

        // Fix: Mood Logging
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.onclick = () => {
                const mood = btn.dataset.mood;
                pondData.moodLog.push({ val: mood, icon: moodEmojis[mood], time: currentTime() });
                save(); renderHistory();
            };
        });

        // Fix: Water Tracking Logic
        document.querySelectorAll('.drop-btn').forEach((btn, i) => {
            btn.onclick = () => {
                const isIncreasing = i >= pondData.waterCount;
                pondData.waterCount = i + 1;
                if (isIncreasing) {
                    pondData.moodLog.push({ val: "Glass of Water", icon: "💧", time: currentTime() });
                }
                save(); renderWater(); renderHistory();
            };
        });

        // Fix: Clear History Button
        document.getElementById('clearHistoryBtn').onclick = () => {
            if (confirm("Delete ALL history logs?")) {
                pondData.history = [];
                pondData.moodLog = [];
                save(); renderHistory();
            }
        };

        document.getElementById('resetPondBtn').onclick = () => {
            if (confirm("Reset today's hops and water?")) {
                pondData.daily = []; pondData.waterCount = 0;
                save(); renderActive(); renderWater();
            }
        };

        document.getElementById('historyToggle').onclick = () => 
            document.getElementById('historyFooter').classList.toggle('collapsed');
    }

    function addHop() {
        const input = document.getElementById('dailyInput');
        if (!input.value.trim()) return;
        pondData.daily.push({ id: Date.now(), text: input.value.trim() });
        input.value = '';
        save(); renderActive();
    }

    window.toggleHop = (id) => {
        const idx = pondData.daily.findIndex(g => g.id === id);
        if (idx > -1) {
            const item = pondData.daily.splice(idx, 1)[0];
            pondData.history.push({ text: item.text, time: currentTime() });
            save(); renderActive(); renderHistory();
        }
    };

    function renderActive() {
        const list = document.getElementById('dailyList');
        list.innerHTML = pondData.daily.map(g => `
            <li style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
                <input type="checkbox" onchange="toggleHop(${g.id})">
                <span>${g.text}</span>
            </li>
        `).join('') || '<li style="color:#67a36a; font-size:0.8rem;">No active hops...</li>';
        updateProgress();
    }

    function renderWater() {
        document.querySelectorAll('.drop-btn').forEach((btn, i) => {
            i < pondData.waterCount ? btn.classList.add('active') : btn.classList.remove('active');
        });
        document.getElementById('waterCountText').textContent = `${pondData.waterCount} / 8 glasses`;
    }

    function renderHistory() {
        document.getElementById('dailyHistoryList').innerHTML = [...pondData.history].reverse().map(h => 
            `<div style="font-size:0.75rem; margin-bottom:4px; color:white;">🌿 ${h.text} <small>(${h.time})</small></div>`
        ).join('') || '<span>-</span>';

        document.getElementById('moodHistoryList').innerHTML = [...pondData.moodLog].reverse().map(m => 
            `<div style="font-size:0.75rem; margin-bottom:4px; color:white;">${m.icon} ${m.val} <small>(${m.time})</small></div>`
        ).join('') || '<span>-</span>';
    }

    function updateProgress() {
        const total = pondData.daily.length + pondData.history.length;
        const percent = total ? Math.round((pondData.history.length / total) * 100) : 0;
        document.getElementById('dailyProgress').style.width = percent + '%';
        document.getElementById('dailyProgressText').textContent = percent + '%';
    }

    const currentTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const save = () => localStorage.setItem('PondData_Final', JSON.stringify(pondData));
    function init() {
        const s = localStorage.getItem('PondData_Final');
        if (s) pondData = JSON.parse(s);
        document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        document.getElementById('motivationText').textContent = frogQuotes[Math.floor(Math.random() * frogQuotes.length)];
        renderActive(); renderWater(); renderHistory();
    }
})();
