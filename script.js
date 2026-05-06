(function() {
    // 1. Data Structure
    var pondData = { 
        daily: [], history: [], moodLog: [], sugarLog: [], carbLog: [], 
        waterCount: 0, streak: 0, lastStreakDate: null 
    };
    var pondChart = null; 

    // 2. Constants & Mappings
    var moodScores = { 
        "Manic": 10, "Happy": 9, "Focused": 8, "Calm": 7, 
        "Tired": 6, "Confused": 5, "Grumpy": 4, "Angry": 3, 
        "Sad": 2, "Crying": 1 
    };

    var moodEmojis = { 
        Happy: "😊", Calm: "😌", Focused: "🧐", Tired: "😴", Grumpy: "😠", 
        Confused: "😕", Angry: "😡", Sad: "😢", Crying: "😭", Manic: "🤪" 
    };

    var frogQuotes = [
        "🐸 💖 Ribbit! You're doing amazing! 💞 🐸",
        "✨ 🐸 Take a deep breath, little froggy! 💗 ✨",
        "🌸 🐸 Every hop counts! I'm proud of you! 💖 🌸",
        "💕 🐸 Stay hydrated and stay happy! 🐸 💕",
        "🐸 💗 You are the best frog in the pond! ✨ 🐸",
        "🐸 ✨ Leap into happiness! ✨ 🐸",
        "🐸 ☀%EF%B8%8F Don't worry, be hoppy! ☀%EF%B8%8F 🐸",
        "🐸 💖 Feeling totally un-frog-gettable today! 💖 🐸",
        "🌿 🐸 Just a little frog in a big, beautiful pond. 🐸 🌿",
        "☀%EF%B8%8F 💧 Enjoying the simple things! 🐸 💧 ☀%EF%B8%8F",
        "🐸 😎 Toad-ally awesome! 😎 🐸",
        "🐸 🌈 Keep calm and leap on! 🌈 🐸",
        "🌊 🐸 Every day is a good day to make a splash! 🐸 🌊"
    ];

    // 3. Initialization
    window.onload = function() {
        var saved = localStorage.getItem('ProgressPond_V23');
        if (saved) { 
            try { 
                var parsed = JSON.parse(saved); 
                for (var key in parsed) { pondData[key] = parsed[key]; } 
            } catch (e) { console.error("Load error", e); } 
        }

        document.getElementById('motivationText').textContent = frogQuotes[Math.floor(Math.random() * frogQuotes.length)];
        resetTimePicker();

        // Event Listeners
        function setClick(id, fn) { var el = document.getElementById(id); if (el) el.onclick = fn; }
        
        setClick('addDailyBtn', addHop);
        setClick('addSugarBtn', addSugar);
        setClick('addCarbBtn', addCarb);
        setClick('clearWaterBtn', function() { pondData.waterCount = 0; saveAndRefresh(); });
        setClick('exportBtn', function() { navigator.clipboard.writeText(JSON.stringify(pondData, null, 2)).then(() => alert("Copied! 📋")); });
        setClick('bannerClose', function() { document.getElementById('motivationBar').style.display = 'none'; });
        setClick('historyToggle', function() { document.getElementById('historyFooter').classList.toggle('collapsed'); });
        
        setClick('resetPondBtn', function() { if (confirm("Reset today?")) { pondData.daily = []; pondData.waterCount = 0; resetTimePicker(); saveAndRefresh(); } });
        setClick('clearHistoryBtn', function() { if (confirm("Delete ALL data?")) { localStorage.removeItem('ProgressPond_V23'); location.reload(); } });

        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.onclick = function() {
                pondData.moodLog.push({ 
                    id: Date.now(), type: 'mood', val: this.getAttribute('data-mood'), 
                    icon: moodEmojis[this.getAttribute('data-mood')], 
                    fullDate: currentFullDate(document.getElementById('manualTimeInput').value) 
                });
                saveAndRefresh();
            };
        });

        document.querySelectorAll('.drop-btn').forEach((btn, index) => {
            btn.onclick = function() {
                pondData.waterCount = index + 1;
                pondData.moodLog.push({ 
                    id: Date.now(), type: 'water', val: "Drank Water", icon: "💧", 
                    fullDate: currentFullDate(null) 
                });
                saveAndRefresh();
            };
        });

        renderAll();
    };

    // 4. Logic Functions
    function resetTimePicker() {
        var now = new Date();
        document.getElementById('manualTimeInput').value = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');
    }

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
        var color = (val < 70 || val > 250) ? "#ff4d4d" : (val > 180 ? "#ffa500" : (val < 80 ? "#7dd3fc" : "#67a36a"));
        pondData.sugarLog.push({ id: Date.now(), type: 'sugar', val: val, color: color, fullDate: currentFullDate(document.getElementById('manualTimeInput').value) });
        input.value = "";
        saveAndRefresh();
    }

    function addCarb() {
        var input = document.getElementById('carbInput');
        var val = parseInt(input.value);
        if (!val) return;
        pondData.carbLog.push({ id: Date.now(), type: 'carb', val: val, fullDate: currentFullDate(document.getElementById('manualTimeInput').value) });
        input.value = "";
        saveAndRefresh();
    }

    window.toggleHop = function(id) {
        var idx = pondData.daily.findIndex(g => g.id === id);
        if (idx > -1) {
            var item = pondData.daily.splice(idx, 1)[0];
            pondData.history.push({ id: Date.now(), text: "[" + item.priority + "] " + item.text, fullDate: currentFullDate(null) });
            saveAndRefresh();
        }
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

    window.deleteHop = function(id) { pondData.daily = pondData.daily.filter(g => g.id !== id); saveAndRefresh(); };

    function currentFullDate(manualTime) {
        var now = new Date();
        var timeStr = manualTime || now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
        return now.toLocaleDateString([], { month: 'short', day: 'numeric' }) + " @ " + timeStr;
    }

    function saveAndRefresh() {
        localStorage.setItem('ProgressPond_V23', JSON.stringify(pondData));
        renderAll();
    }

    // 5. Main Render Function
    function renderAll() {
        // Update basic UI
        document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        document.querySelectorAll('.drop-btn').forEach((btn, i) => i < pondData.waterCount ? btn.classList.add('active') : btn.classList.remove('active'));
        document.getElementById('waterCountText').textContent = pondData.waterCount + " / 8";

        // Render Active Hops
        var listHtml = "";
        for (var i = 0; i < pondData.daily.length; i++) {
            var g = pondData.daily[i];
            listHtml += `<li style="display:flex; align-items:center; gap:10px; margin-bottom:10px; background:white; padding:8px; border-radius:10px;"> 
                <input type="checkbox" onchange="toggleHop(${g.id})"> 
                <span style="flex:1">${g.text} <small>(${g.priority})</small></span> 
                <button onclick="deleteHop(${g.id})" style="background:none; border:none; color:red; cursor:pointer;">×</button></li>`;
        }
        document.getElementById('dailyList').innerHTML = listHtml || "No active hops...";

        // Update Progress Bar
        var total = pondData.daily.length + pondData.history.length;
        var percent = total ? Math.round((pondData.history.length / total) * 100) : 0;
        document.getElementById('dailyProgress').style.width = percent + '%';
        document.getElementById('dailyProgressText').textContent = percent + '%';

        // Render History Lists
        var combined = pondData.moodLog.map(m => ({ ...m, logType: 'mood' }))
            .concat(pondData.sugarLog.map(s => ({ id: s.id, val: "Glucose: " + s.val, icon: "🩸", fullDate: s.fullDate, color: s.color, logType: 'sugar' })))
            .concat(pondData.carbLog.map(c => ({ id: c.id, val: "Carbs: " + c.val + "g", icon: "🥣", fullDate: c.fullDate, logType: 'carb' })))
            .sort((a, b) => b.id - a.id);

        document.getElementById('moodHistoryList').innerHTML = combined.slice(0, 20).map(m => `
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.1); padding:4px 0;">
                <div><span style="color:${m.color || 'white'}">${m.icon} ${m.val}</span> <small style="display:block; opacity:0.6;">${m.fullDate}</small></div>
                <button onclick="deleteLogItem('${m.logType}', ${m.id})">×</button>
            </div>`).join('');

        document.getElementById('dailyHistoryList').innerHTML = pondData.history.slice().reverse().slice(0, 15).map(h => `
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.1); padding:4px 0;">
                <div>🌿 ${h.text} <small style="display:block; opacity:0.6;">${h.fullDate}</small></div>
                <button onclick="deleteLogItem('hop', ${h.id})">×</button>
            </div>`).join('');

        // --- CHART LOGIC ---
        var canvas = document.getElementById('healthChart');
        if (canvas && typeof Chart !== 'undefined') {
            var ctx = canvas.getContext('2d');
            var getTime = function(fd) { return fd ? fd.split('@')[1].trim() : "00:00"; };
            
            var allEntries = [...pondData.sugarLog, ...pondData.moodLog, ...pondData.carbLog].sort((a,b) => a.id - b.id);
            var labels = [...new Set(allEntries.map(e => getTime(e.fullDate)))];
            var datasets = [];

            // Glucose Line
            if (pondData.sugarLog.length > 0) {
                datasets.push({ label: 'Glucose', data: pondData.sugarLog.map(s => ({ x: getTime(s.fullDate), y: s.val })), borderColor: '#ef4444', tension: 0.3, yAxisID: 'y' });
            }
            // Mood Line
            var moodsOnly = pondData.moodLog.filter(m => m.type === 'mood');
            if (moodsOnly.length > 0) {
                datasets.push({ label: 'Mood', data: moodsOnly.map(m => ({ x: getTime(m.fullDate), y: moodScores[m.val] || 5 })), borderColor: '#f59e0b', tension: 0.4, yAxisID: 'yMood' });
            }
            // Water Dots
            var waterOnly = pondData.moodLog.filter(m => m.type === 'water');
            if (waterOnly.length > 0) {
                let wCount = 0;
                datasets.push({ label: 'Water', data: waterOnly.map(w => { wCount++; return { x: getTime(w.fullDate), y: wCount }; }), backgroundColor: '#00d4ff', showLine: false, pointStyle: 'triangle', pointRadius: 8, yAxisID: 'y' });
            }
            // Carb Dots
            if (pondData.carbLog.length > 0) {
                datasets.push({ label: 'Carbs', data: pondData.carbLog.map(c => ({ x: getTime(c.fullDate), y: c.val })), backgroundColor: '#10b981', showLine: false, pointStyle: 'rect', pointRadius: 8, yAxisID: 'y' });
            }

            if (pondChart) pondChart.destroy();
            pondChart = new Chart(ctx, {
                type: 'line',
                data: { datasets: datasets },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    scales: {
                        x: { type: 'category', labels: labels },
                        y: { position: 'left', title: { display: true, text: 'Levels' } },
                        yMood: { position: 'right', min: 1, max: 10, title: { display: true, text: 'Mood' }, grid: { drawOnChartArea: false } }
                    },
                    plugins: { legend: { display: true, labels: { boxWidth: 10, font: { size: 10 } } } }
                }
            });
        }
    }
})();
