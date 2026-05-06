(function() {
    var pondData = { daily: [], history: [], moodLog: [], sugarLog: [], carbLog: [], waterCount: 0, streak: 0, lastStreakDate: null };
    var myChart = null;
    var moodEmojis = { Happy: "😊", Calm: "😌", Focused: "🧐", Tired: "😴", Grumpy: "😠", Confused: "😕", Angry: "😡", Sad: "😢", Crying: "😭", Manic: "🤪" };

    window.onload = function() {
        var saved = localStorage.getItem('ProgressPond_V23');
        if (saved) { try { Object.assign(pondData, JSON.parse(saved)); } catch(e) {} }
        
        const setClick = (id, fn) => { const el = document.getElementById(id); if (el) el.onclick = fn; };
        setClick('addDailyBtn', addHop);
        setClick('addSugarBtn', addSugar);
        setClick('addCarbBtn', addCarb);
        setClick('downloadChartBtn', downloadChartImage);
        setClick('clearWaterBtn', () => { pondData.waterCount = 0; save(); });
        setClick('exportBtn', () => { navigator.clipboard.writeText(JSON.stringify(pondData, null, 2)).then(() => alert("Copied! 📋")); });
        setClick('historyToggle', () => document.getElementById('historyFooter').classList.toggle('collapsed'));
        setClick('chartViewSelect', renderChart);
        setClick('resetPondBtn', () => { if(confirm("Reset today?")) { pondData.daily = []; pondData.waterCount = 0; save(); } });
        setClick('clearHistoryBtn', () => { if(confirm("Delete ALL?")) { localStorage.clear(); location.reload(); } });

        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.onclick = () => {
                pondData.moodLog.push({ id: Date.now(), val: btn.getAttribute('data-mood'), icon: moodEmojis[btn.getAttribute('data-mood')], fullDate: currentFullDate() });
                save();
            };
        });

        document.querySelectorAll('.drop-btn').forEach((btn, i) => {
            btn.onclick = () => { pondData.waterCount = i + 1; save(); };
        });

        calculateStreak();
        renderAll();
    };

    function addHop() {
        const input = document.getElementById('dailyInput');
        if (!input.value.trim()) return;
        pondData.daily.push({ id: Date.now(), text: input.value, priority: document.getElementById('priorityInput').value });
        input.value = "";
        save();
    }

    function addSugar() {
        const val = parseInt(document.getElementById('sugarInput').value);
        if (!val) return;
        pondData.sugarLog.push({ id: Date.now(), val, fullDate: currentFullDate() });
        document.getElementById('sugarInput').value = "";
        save();
    }

    function addCarb() {
        const val = parseInt(document.getElementById('carbInput').value);
        if (!val) return;
        pondData.carbLog.push({ id: Date.now(), val, fullDate: currentFullDate() });
        document.getElementById('carbInput').value = "";
        save();
    }

    window.toggleHop = (id) => {
        const idx = pondData.daily.findIndex(g => g.id === id);
        if (idx > -1) {
            const item = pondData.daily.splice(idx, 1)[0];
            pondData.history.push({ id: Date.now(), text: item.text, fullDate: currentFullDate() });
            save();
        }
    };

    function calculateStreak() {
        const today = new Date().toLocaleDateString();
        if (pondData.lastStreakDate && pondData.lastStreakDate !== today) {
            const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
            if (pondData.lastStreakDate !== yesterday.toLocaleDateString()) pondData.streak = 0;
        }
    }

    function currentFullDate() {
        const now = new Date();
        pondData.lastStreakDate = now.toLocaleDateString();
        if (pondData.streak === 0) pondData.streak = 1;
        return now.toLocaleDateString([], { month: 'short', day: 'numeric' }) + " @ " + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    }

    function renderChart() {
        const canvas = document.getElementById('pondChart');
        if (!canvas || typeof Chart === 'undefined') return;
        const view = document.getElementById('chartViewSelect').value;
        const todayStr = new Date().toLocaleDateString([], { month: 'short', day: 'numeric' });
        
        const sugar = view === 'today' ? pondData.sugarLog.filter(s => s.fullDate.startsWith(todayStr)) : pondData.sugarLog.slice(-20);
        const carbs = view === 'today' ? pondData.carbLog.filter(c => c.fullDate.startsWith(todayStr)) : pondData.carbLog.slice(-20);

        if (myChart) myChart.destroy();
        myChart = new Chart(canvas.getContext('2d'), {
            data: {
                labels: sugar.map(s => view === 'today' ? s.fullDate.split(' @ ')[1] : s.fullDate),
                datasets: [
                    { type: 'line', label: 'Glucose', data: sugar.map(s => s.val), borderColor: '#67a36a', tension: 0.3, yAxisID: 'y' },
                    { type: 'bar', label: 'Carbs', data: carbs.map(c => c.val), backgroundColor: 'rgba(125, 211, 252, 0.4)', yAxisID: 'y1' }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false, scales: { y1: { position: 'right', grid: { drawOnChartArea: false } } } }
        });
    }

    function downloadChartImage() {
        if (myChart) { const a = document.createElement('a'); a.href = myChart.toBase64Image(); a.download = 'pond-trends.png'; a.click(); }
    }

    function save() { localStorage.setItem('ProgressPond_V23', JSON.stringify(pondData)); renderAll(); }

    function renderAll() {
        document.getElementById('streakDisplay').textContent = pondData.streak;
        document.getElementById('waterCountText').textContent = pondData.waterCount + " / 8";
        document.querySelectorAll('.drop-btn').forEach((btn, i) => btn.classList.toggle('active', i < pondData.waterCount));
        
        document.getElementById('dailyList').innerHTML = pondData.daily.map(g => `<li><input type="checkbox" onchange="toggleHop(${g.id})"> ${g.text}</li>`).join('') || "No hops...";
        document.getElementById('dailyHistoryList').innerHTML = pondData.history.slice(-10).reverse().map(h => `<div>🌿 ${h.text} <small>${h.fullDate}</small></div>`).join('');
        
        const health = pondData.moodLog.map(m => ({...m, logType: 'mood'}))
            .concat(pondData.sugarLog.map(s => ({ val: "Glucose: " + s.val, icon: "🩸", fullDate: s.fullDate })))
            .sort((a, b) => b.id - a.id).slice(0, 15);
        document.getElementById('moodHistoryList').innerHTML = health.map(m => `<div>${m.icon || ''} ${m.val} <small>${m.fullDate}</small></div>`).join('');

        renderChart();
    }
})();
