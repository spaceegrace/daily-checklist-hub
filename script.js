(function() {
    var pondData = {
        daily: [], history: [], moodLog: [], sugarLog: [], carbLog: [],
        waterCount: 0, streak: 0, lastStreakDate: null
    };

    var myChart = null;
    var moodEmojis = { Happy: "😊", Calm: "😌", Focused: "🧐", Tired: "😴", Grumpy: "😠", Confused: "😕", Angry: "😡", Sad: "😢", Crying: "😭", Manic: "🤪" };
    var moodValues = { Happy: 4, Calm: 3, Focused: 3, Tired: 2, Confused: 2, Grumpy: 1, Angry: 1, Sad: 1, Crying: 0, Manic: 4 };

    window.onload = function() {
        var saved = localStorage.getItem('ProgressPond_V23');
        if (saved) {
            try {
                var parsed = JSON.parse(saved);
                for (var key in parsed) { pondData[key] = parsed[key]; }
            } catch(e) { console.error("Error loading data:", e); }
        }
        
        function setClick(id, fn) {
            var el = document.getElementById(id);
            if (el) el.onclick = fn;
        }

        setClick('addDailyBtn', addHop);
        setClick('addSugarBtn', addSugar);
        setClick('addCarbBtn', addCarb);
        setClick('downloadChartBtn', downloadChartImage);
        setClick('clearWaterBtn', function() { pondData.waterCount = 0; saveAndRefresh(); });
        setClick('exportBtn', function() { navigator.clipboard.writeText(JSON.stringify(pondData, null, 2)).then(() => alert("JSON Copied! 📋")); });
        setClick('historyToggle', function() { document.getElementById('historyFooter').classList.toggle('collapsed'); });
        setClick('resetPondBtn', () => { if(confirm("Reset today?")) { pondData.daily = []; pondData.waterCount = 0; saveAndRefresh(); } });
        setClick('clearHistoryBtn', () => { if(confirm("Delete ALL data?")) { localStorage.removeItem('ProgressPond_V23'); location.reload(); } });

        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.onclick = function() {
                var mood = this.getAttribute('data-mood');
                pondData.moodLog.push({ id: Date.now(), type: 'mood', val: mood, icon: moodEmojis[mood], fullDate: currentFullDate() });
                saveAndRefresh();
            };
        });

        document.querySelectorAll('.drop-btn').forEach((btn, index) => {
            btn.onclick = function() { pondData.waterCount = index + 1; saveAndRefresh(); };
        });

        calculateStreak();
        renderAll();
    };

    function addHop() {
        var input = document.getElementById('dailyInput');
        if (!input.value.trim()) return;
        pondData.daily.push({ id: Date.now(), text: input.value, priority: document.getElementById('priorityInput').value });
        input.value = "";
        saveAndRefresh();
    }

    function addSugar() {
        var input = document.getElementById('sugarInput');
        var val = parseInt(input.value);
        if (!val) return;
        pondData.sugarLog.push({ id: Date.now(), type: 'sugar', val: val, fullDate: currentFullDate() });
        input.value = "";
        saveAndRefresh();
    }

    function addCarb() {
        var input = document.getElementById('carbInput');
        var val = parseInt(input.value);
        if (!val) return;
        pondData.carbLog.push({ id: Date.now(), type: 'carb', val: val, fullDate: currentFullDate() });
        input.value = "";
        saveAndRefresh();
    }

    window.toggleHop = function(id) {
        var idx = pondData.daily.findIndex(g => g.id === id);
        if (idx > -1) {
            var item = pondData.daily.splice(idx, 1)[0];
            pondData.history.push({ id: Date.now(), text: "[" + item.priority + "] " + item.text, fullDate: currentFullDate() });
            saveAndRefresh();
        }
    };

    window.deleteHop = function(id) {
        pondData.daily = pondData.daily.filter(g => g.id !== id);
        saveAndRefresh();
    };

    window.deleteLogItem = function(type, id) {
        if (confirm("Delete this log entry?")) {
            if (type === 'hop') pondData.history = pondData.history.filter(h => h.id !== id);
            if (type === 'mood') pondData.moodLog = pondData.moodLog.filter(m => m.id !== id);
            if (type === 'sugar') pondData.sugarLog = pondData.sugarLog.filter(s => s.id !== id);
            if (type === 'carb') pondData.carbLog = pondData.carbLog.filter(c => c.id !== id);
            saveAndRefresh();
        }
    };

    function calculateStreak() {
        const today = new Date().toLocaleDateString();
        if (!pondData.lastStreakDate) return;
        
        const lastDate = new Date(pondData.lastStreakDate);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (pondData.lastStreakDate !== today) {
            if (pondData.lastStreakDate === yesterday.toLocaleDateString()) {
                // Keep streak going but don't increment until a log happens
            } else {
                pondData.streak = 0; // Broke streak
            }
        }
    }

    function currentFullDate() {
        var now = new Date();
        pondData.lastStreakDate = now.toLocaleDateString(); // Set streak date on activity
        if (pondData.streak === 0) pondData.streak = 1;
        return now.toLocaleDateString([], { month: 'short', day: 'numeric' }) + " @ " + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function renderChart() {
        var canvas = document.getElementById('pondChart');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');

        var sugarData = pondData.sugarLog.slice(-10);
        var carbData = pondData.carbLog.slice(-10);
        var labels = sugarData.map(s => s.fullDate.split(' @ ')[1] || s.fullDate);

        if (myChart) { myChart.destroy(); }

        myChart = new Chart(ctx, {
            data: {
                labels: labels,
                datasets: [
                    { type: 'line', label: 'Glucose', data: sugarData.map(s => s.val), borderColor: '#67a36a', tension: 0.3, yAxisID: 'y' },
                    { type: 'bar', label: 'Carbs', data: carbData.map(c => c.val), backgroundColor: 'rgba(125, 211, 252, 0.4)', yAxisID: 'y1' }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: { position: 'left', title: { display: true, text: 'Glucose' } },
                    y1: { position: 'right', title: { display: true, text: 'Carbs' }, grid: { drawOnChartArea: false } }
                }
            }
        });
    }

    function downloadChartImage() {
        if (!myChart) return;
        const link = document.createElement('a');
        link.href = myChart.toBase64Image();
        link.download = `Pond_Trends.png`;
        link.click();
    }

    function saveAndRefresh() {
        localStorage.setItem('ProgressPond_V23', JSON.stringify(pondData));
        renderAll();
    }

    function renderAll() {
        // Update Streak & Progress
        document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        const streakEl = document.getElementById('streakDisplay');
        if (streakEl) streakEl.textContent = pondData.streak;

        // Water
        document.querySelectorAll('.drop-btn').forEach((btn, i) => i < pondData.waterCount ? btn.classList.add('active') : btn.classList.remove('active'));
        document.getElementById('waterCountText').textContent = pondData.waterCount + " / 8";

        // Active Hops
        var hopsHtml = pondData.daily.map(g => `
            <li style="display:flex; align-items:center; gap:10px; margin-bottom:10px; background:white; padding:8px; border-radius:10px; border: 1px solid var(--frog);">
                <input type="checkbox" onchange="toggleHop(${g.id})">
                <span style="flex:1">${g.text} <small>(${g.priority})</small></span>
                <button onclick="deleteHop(${g.id})" style="background:none; border:none; color:red; cursor:pointer;">×</button>
            </li>`).join('');
        document.getElementById('dailyList').innerHTML = hopsHtml || "No active hops...";

        // Achievements (Mood/Glucose/Carbs)
        var combined = pondData.moodLog.map(m => ({...m, logType: 'mood'}))
            .concat(pondData.sugarLog.map(s => ({ id: s.id, val: "Glucose: " + s.val, icon: "🩸", fullDate: s.fullDate, logType: 'sugar' })))
            .concat(pondData.carbLog.map(c => ({ id: c.id, val: "Carbs: " + c.val + "g", icon: "🥣", fullDate: c.fullDate, logType: 'carb' })))
            .sort((a, b) => b.id - a.id);

        document.getElementById('moodHistoryList').innerHTML = combined.slice(0, 20).map(m => `
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.1); padding:4px 0;">
                <div><span>${m.icon} ${m.val}</span> <small style="display:block; opacity:0.6;">${m.fullDate}</small></div>
                <button onclick="deleteLogItem('${m.logType}', ${m.id})" style="background:none; border:none; color:white; opacity:0.4; cursor:pointer;">×</button>
            </div>`).join('');

        // Hops History
        document.getElementById('dailyHistoryList').innerHTML = pondData.history.slice().reverse().slice(0, 15).map(h => `
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.1); padding:4px 0;">
                <div>🌿 ${h.text} <small style="display:block; opacity:0.6;">${h.fullDate}</small></div>
                <button onclick="deleteLogItem('hop', ${h.id})" style="background:none; border:none; color:white; opacity:0.4; cursor:pointer;">×</button>
            </div>`).join('');

        renderChart();
    }
})();
