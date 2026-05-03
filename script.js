(() => {
    let pondData = {
        daily: [],
        history: [], // For Hops
        moodLog: [], // For Mood entries
        waterCount: 0
    };

    const moodEmojis = { Happy: "😊", Calm: "😌", Focused: "🧐", Tired: "😴", Grumpy: "😠" };

    document.addEventListener('DOMContentLoaded', () => {
        initDate();
        load();
        events();
    });

    function events() {
        // Daily Hops
        document.getElementById('addDailyBtn').onclick = () => addHop();
        document.getElementById('dailyInput').onkeydown = (e) => { if(e.key==='Enter') addHop(); };

        // Mood Tracker (Tracks various entries throughout the day)
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.onclick = () => {
                const mood = btn.dataset.mood;
                pondData.moodLog.push({
                    mood,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    id: Date.now()
                });
                save(); renderHistory();
                alert(`Mood logged: ${mood} ${moodEmojis[mood]}`);
            };
        });

        // Water Tracker
        document.querySelectorAll('.drop-btn').forEach((btn, i) => {
            btn.onclick = () => {
                pondData.waterCount = pondData.waterCount === i + 1 ? i : i + 1;
                renderWater(); save();
            };
        });

        // UI Controls
        document.getElementById('historyToggle').onclick = () => {
            document.getElementById('historyFooter').classList.toggle('collapsed');
        };
        document.getElementById('bannerClose').onclick = () => document.getElementById('backupBanner').classList.add('hidden');
        document.getElementById('exportBtn').onclick = exportData;
        document.getElementById('clearHistoryBtn').onclick = () => {
            if(confirm("Clear all your pond achievements?")) {
                pondData.history = []; pondData.moodLog = []; pondData.waterCount = 0;
                save(); location.reload();
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
            const item = pondData.daily.splice(idx, 1)[0];
            pondData.history.push({ 
                text: item.text, 
                time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}),
                id: Date.now() 
            });
            save(); renderActive(); renderHistory();
        }
    };

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
        // Daily Log
        document.getElementById('dailyHistoryList').innerHTML = [...pondData.history].reverse().map(h => `
            <div style="font-size:0.8rem; margin-bottom:5px; color:white;">🌿 ${h.text} <small style="opacity:0.6">(${h.time})</small></div>
        `).join('') || '<span>-</span>';

        // Mood & Water Log
        const moodHtml = [...pondData.moodLog].reverse().map(m => `
            <div style="font-size:0.8rem; margin-bottom:5px; color:white;">${moodEmojis[m.mood]} ${m.mood} <small style="opacity:0.6">(${m.time})</small></div>
        `).join('');
        document.getElementById('moodHistoryList').innerHTML = moodHtml || '<span>No entries yet</span>';
    }

    function renderWater() {
        const drops = document.querySelectorAll('.drop-btn');
        drops.forEach((btn, i) => {
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

    function save() { localStorage.setItem('Simplified_Pond', JSON.stringify(pondData)); }
    function load() {
        const s = localStorage.getItem('Simplified_Pond');
        if(s) pondData = JSON.parse(s);
        renderActive(); renderHistory(); renderWater();
    }

    function initDate() { document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', {weekday:'long', month:'long', day:'numeric'}); }

    function exportData() {
        const blob = new Blob([JSON.stringify(pondData)], { type: 'application/json' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = "ProgressPond_Backup.json"; a.click();
    }
})();
