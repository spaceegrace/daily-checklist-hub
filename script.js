(function() {
    var pondData = {
        daily: [],
        history: [],
        moodLog: [],
        sugarLog: [],
        carbLog: [],
        waterCount: 0,
        streak: 0,
        lastStreakDate: null
    };

    var myChart = null;

    var moodEmojis = {
        Happy: "😊", Calm: "😌", Focused: "🧐", Tired: "😴",
        Grumpy: "😠", Confused: "😕", Angry: "😡", Sad: "😢",
        Crying: "😭", Manic: "🤪"
    };

    // Numerical values for the Trend Graph
    var moodValues = {
        Happy: 4, Calm: 3, Focused: 3, Tired: 2,
        Confused: 2, Grumpy: 1, Angry: 1, Sad: 1,
        Crying: 0, Manic: 4
    };

    var frogQuotes = [
        "🐸 💖 Ribbit! You're doing amazing! 💞 🐸",
        "✨ 🐸 Take a deep breath, little froggy! 💗 ✨",
        "🌸 🐸 Every hop counts! I'm proud of you! 💖 🌸",
        "💕 🐸 Stay hydrated and stay happy! 🐸 💕",
        "🐸 💗 You are the best frog in the pond! ✨ 🐸",
        "🐸 ✨ Leap into happiness! ✨ 🐸",
        "🐸 ☀️ Don't worry, be hoppy! ☀️ 🐸",
        "🐸 💖 Feeling totally un-frog-gettable today! 💖 🐸",
        "🌿 🐸 Just a little frog in a big, beautiful pond. 🐸 🌿",
        "☀️ 💧 Enjoying the simple things! 🐸 💧 ☀️",
        "🐸 😎 Toad-ally awesome! 😎 🐸",
        "🐸 🌈 Keep calm and leap on! 🌈 🐸",
        "🌊 🐸 Every day is a good day to make a splash! 🐸 🌊"
    ];

    window.onload = function() {
        var saved = localStorage.getItem('ProgressPond_V23');
        if (saved) {
            try {
                var parsed = JSON.parse(saved);
                for (var key in parsed) { pondData[key] = parsed[key]; }
            } catch(e) {}
        }
        
        document.getElementById('motivationText').textContent = frogQuotes[Math.floor(Math.random() * frogQuotes.length)];
        resetTimePicker();

        function setClick(id, fn) {
            var el = document.getElementById(id);
            if (el) el.onclick = fn;
        }

        setClick('addDailyBtn', addHop);
        setClick('addSugarBtn', addSugar);
        setClick('addCarbBtn', addCarb);
        setClick('clearWaterBtn', function() { pondData.waterCount = 0; saveAndRefresh(); });
        setClick('exportBtn', function() { navigator.clipboard.writeText(JSON.stringify(pondData, null, 2)).then(() => alert("Copied! 📋")); });
        setClick('bannerClose', function() { document.getElementById('motivationBar').style.display = 'none'; });
        setClick('historyToggle', function() { document.getElementById('historyFooter').classList.toggle('collapsed'); });
        
        setClick('resetPondBtn', function() {
            if (confirm("Reset today?")) {
                pondData.daily = [];
                pondData.waterCount = 0;
                resetTimePicker();
                saveAndRefresh();
            }
        });

        setClick('clearHistoryBtn', function() {
            if (confirm("Delete ALL data?")) {
                localStorage.removeItem('ProgressPond_V23');
                location.reload();
            }
        });

        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.onclick = function() {
                var mood = this.getAttribute('data-mood');
                pondData.moodLog.push({
                    id: Date.now(),
                    type: 'mood',
                    val: mood,
                    icon: moodEmojis[mood],
                    fullDate: currentFullDate(document.getElementById('manualTimeInput').value)
                });
                saveAndRefresh();
            };
        });

        document.querySelectorAll('.drop-btn').forEach((btn, index) => {
            btn.onclick = function() {
                pondData.waterCount = index + 1;
                // Log water as a health event for the chart
                pondData.moodLog.push({
                    id: Date.now(),
                    type: 'water',
                    val: "Hydrated",
                    icon: "💧",
                    fullDate: currentFullDate(null)
                });
                saveAndRefresh();
            };
        });

        renderAll();
    };

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

    window.deleteHop = function(id) {
        pondData.daily = pondData.daily.filter(g => g.id !== id);
        saveAndRefresh();
    };

    function currentFullDate(manualTime) {
        var now = new Date();
        var timeStr = manualTime || now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
        return now.toLocaleDateString([], { month: 'short', day: 'numeric' }) + " @ " + timeStr;
    }

    function saveAndRefresh() {
        localStorage.setItem('ProgressPond_V23', JSON.stringify(pondData));
        renderAll();
    }

    function renderChart() {
        var canvas = document.getElementById('pondChart');
        if (!canvas || typeof Chart === 'undefined') return;
        var ctx = canvas.getContext('2d');

        // Labels come from Sugar Log as the primary timeline
        var labels = pondData.sugarLog.map(s => s.fullDate.split(' @ '));

        if (myChart) { myChart.destroy(); }

        myChart = new Chart(ctx, {
            data: {
                labels: labels.length ? labels : ["Waiting for data..."],
                datasets: [
                    {
                        type: 'line',
                        label: 'Glucose',
                        data: pondData.sugarLog.map(s => s.val),
                        borderColor: '#67a36a',
                        backgroundColor: 'rgba(103, 163, 106, 0.1)',
                        tension: 0.3,
                        fill: true,
                        yAxisID: 'y'
                    },
                    {
                        type: 'line',
                        label: 'Mood',
                        data: pondData.moodLog.filter(m => m.type === 'mood').map(m => moodValues[m.val] || 0),
                        borderColor: '#ffc2d1',
                        backgroundColor: 'transparent',
                        borderDash: [5, 5],
                        tension: 0.4,
                        yAxisID: 'y_mood'
                    },
                    {
                        type: 'bar',
                        label: 'Carbs',
                        data: pondData.carbLog.map(c => c.val),
                        backgroundColor: 'rgba(125, 211, 252, 0.4)',
                        yAxisID: 'y_stats'
                    },
                    {
                        type: 'bar',
                        label: 'Water',
                        data: pondData.moodLog.filter(m => m.type === 'water').map(() => 5), // Constant height for water drops
                        backgroundColor: 'rgba(3, 105, 161, 0.5)',
                        yAxisID: 'y_stats'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { position: 'left', title: { display: true, text: 'Glucose' } },
                    y_stats: { position: 'right', title: { display: true, text: 'Carbs/Water' }, grid: { drawOnChartArea: false } },
                    y_mood: { display: false, min: 0, max: 5 }
                },
                plugins: {
                    legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } }
                }
            }
        });
    }

    function renderAll() {
        document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        document.querySelectorAll('.drop-btn').forEach((btn, i) => i < pondData.waterCount ? btn.classList.add('active') : btn.classList.remove('active'));
        
        var listHtml = "";
        for (var i = 0; i < pondData.daily.length; i++) {
            var g = pondData.daily[i];
            listHtml += `<li style="display:flex; align-items:center; gap:10px; margin-bottom:10px; background:white; padding:8px; border-radius:10px; border:1px solid var(--frog);"> <input type="checkbox" onchange="toggleHop(${g.id})"> <span style="flex:1">${g.text} <small>(${g.priority})</small></span> <button onclick="deleteHop(${g.id})" style="background:none; border:none; color:red; cursor:pointer;">×</button></li>`;
        }
        document.getElementById('dailyList').innerHTML = listHtml || "No active hops...";

        var combined = pondData.moodLog.map(m => ({...m, logType: 'mood'}))
            .concat(pondData.sugarLog.map(s => ({ id: s.id, val: "Glucose: " + s.val, icon: "🩸", fullDate: s.fullDate, color: s.color, logType: 'sugar' })))
            .concat(pondData.carbLog.map(c => ({ id: c.id, val: "Carbs: " + c.val + "g", icon: "🥣", fullDate: c.fullDate, logType: 'carb' })))
            .sort((a, b) => b.id - a.id);

        document.getElementById('moodHistoryList').innerHTML = combined.slice(0, 20).map(m => ` <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.1); padding:4px 0;"> <div><span style="color:${m.color || 'white'}">${m.icon} ${m.val}</span> <small style="display:block; opacity:0.6;">${m.fullDate}</small></div> <button onclick="deleteLogItem('${m.logType}', ${m.id})" style="background:none; border:none; color:white; opacity:0.4; cursor:pointer;">×</button> </div>`).join('');
        
        document.getElementById('dailyHistoryList').innerHTML = pondData.history.slice().reverse().slice(0, 15).map(h => ` <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.1); padding:4px 0;"> <div>🌿 ${h.text} <small style="display:block; opacity:0.6;">${h.fullDate}</small></div> <button onclick="deleteLogItem('hop', ${h.id})" style="background:none; border:none; color:white; opacity:0.4; cursor:pointer;">×</button> </div>`).join('');
        
        var total = pondData.daily.length + pondData.history.length;
        document.getElementById('dailyProgress').style.width = (total ? Math.round((pondData.history.length / total) * 100) : 0) + '%';
        document.getElementById('dailyProgressText').textContent = (total ? Math.round((pondData.history.length / total) * 100) : 0) + '%';
        document.getElementById('waterCountText').textContent = pondData.waterCount + " / 8";

        renderChart();
    }
})();
