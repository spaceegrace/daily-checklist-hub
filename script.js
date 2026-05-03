(() => {
    let pondData = {
        daily: [],
        history: [],
        moodLog: [],
        waterCount: 0
    };

    const moodEmojis = { Happy: "😊", Calm: "😌", Focused: "🧐", Tired: "😴", Grumpy: "😠" };
    const frogQuotes = [
        "✨ Ribbit! Let's make some waves today! 🌸",
        "🌿 Every hop counts, no matter how small! 🐸",
        "🌼 You're doing amazing, hop-py froggy! ✨",
        "🍄 Take a breath and enjoy the pond! 😌",
        "🌊 Stay hydrated and keep jumping! 💧",
        "✨ The pond is proud of you today! 🐸"
    ];

    document.addEventListener('DOMContentLoaded', () => {
        initDate();
        load();
        events();
        rotateMotivation();
    });

    function events() {
        document.getElementById('addDailyBtn').onclick = () => addHop();
        document.getElementById('dailyInput').onkeydown = (e) => { if(e.key==='Enter') addHop(); };

        // Mood Logging
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.onclick = () => {
                const mood = btn.dataset.mood;
                pondData.moodLog.push({
                    type: 'mood',
                    val: mood,
                    icon: moodEmojis[mood],
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    id: Date.now()
                });
                save(); renderHistory();
            };
        });

        // Water Logging (Logs each glass with time)
        document.querySelectorAll('.drop-btn').forEach((btn, i) => {
            btn.onclick = () => {
                const isAdding = i >= pondData.waterCount;
                pondData.waterCount = i + 1;
                
                if (isAdding) {
                    pondData.moodLog.push({
                        type: 'water',
                        val: 'Glass of Water',
                        icon: '💧',
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        id: Date.now()
                    });
                }
                renderWater(); save(); renderHistory();
            };
        });

        document.getElementById('historyToggle').onclick = () => {
            document.getElementById('historyFooter').classList.toggle('collapsed');
        };

        // Reset Pond (Clears current active items and today's water)
        document.getElementById('resetPondBtn').onclick = () => {
            if(confirm("Reset today's hops and water? (History will remain)")) {
                pondData.daily = [];
                pondData.waterCount = 0;
                save(); renderActive(); renderWater();
            }
        };

        // Clear History (Permanent wipe)
        document.getElementById('clearHistoryBtn').onclick = () => {
            if(confirm("Permanently delete ALL history logs?")) {
                pondData.history = []; pondData.moodLog = [];
                save(); renderHistory();
            }
        };
    }

    function addHop() {
        const input = document.getElementById('dailyInput');
        if(!input.value.trim()) return;
        pondData.daily.push({ id: Date.now(), text: input.value.trim() });
        save(); renderActive(); input.value = '';
    }

    window.toggleHop = (id) => {
        const idx = pondData.daily.findIndex(g => g.id === id);
        if(idx > -1) {
            const item = pondData.daily.splice(idx, 1);
            pondData.history.push({ 
                text: item[0].text, 
                time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}),
                id: Date.now() 
            });
            save(); renderActive(); renderHistory();
        }
    };

    function rotateMotivation() {
        const text = document.getElementById('motivationText');
        text.textContent = frogQuotes[Math.floor(Math.random() * frogQuotes.length)];
    }

    function renderActive() {
        const list = document.getElementById('dailyList');
        list.innerHTML = pondData.daily.map(g => `
            <li style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
                <input type="checkbox" onchange="toggleHop(${g.id})">
                <span>${g.text}</span>
            </li>
        `).join('') || '<li style="color:#67a36a; font-size:0.8rem;">No active hops...</li>';
        updateProgress();
    }

    function renderHistory() {
        document.getElementById('dailyHistoryList').innerHTML = [...pondData.history].reverse().map(h => `
            <div style="font-size:0.8rem; margin-bottom:5px; color:white;">🌿 ${h.text} <small style="opacity:0.6">(${h.time})</small></div>
        `).join('') || '<span>-</span>';

        const moodHtml = [...pondData.moodLog].reverse().map(m => `
            <div style="font-size:0.8rem; margin-bottom:5px; color:white;">${m.icon} ${m.val} <small style="opacity:0.6">(${m.time})</small></div>
        `).join('');
        document.getElementById('moodHistoryList').innerHTML = moodHtml || '<span>No entries yet</span>';
    }

    function renderWater() {
        document.querySelectorAll('.drop-btn').forEach((btn, i) => {
            i < pondData.waterCount ? btn.classList.add('active') : btn.classList.remove('active');
        });
        document.getElementById('waterCountText').textContent = `${pondData.waterCount} / 8 glasses`;
    }

    function updateProgress() {
        const total = pondData.daily.length + pondData.history.length;
        const percent = total ? Math.round((pondData.history.length / total) * 100) : 0;
        document.getElementById('dailyProgressText').textContent = percent + '%';
        document.getElementById('dailyProgress').style.width = percent + '%';
    }

    function save() { localStorage.setItem('Simplified_Pond_V2', JSON.stringify(pondData)); }
    function load() {
        const s = localStorage.getItem('Simplified_Pond_V2');
        if(s) pondData = JSON.parse(s);
        renderActive(); renderHistory(); renderWater();
    }

    function initDate() { document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', {weekday:'long', month:'long', day:'numeric'}); }
})();
