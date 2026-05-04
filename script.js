(function() {
    var pondData = { 
        daily: [], history: [], moodLog: [], sugarLog: [], carbLog: [], 
        waterCount: 0, streak: 0, lastStreakDate: null 
    };
    
    var moodEmojis = { Happy: "😊", Calm: "😌", Focused: "🧐", Tired: "😴", Grumpy: "😠", Confused: "😕", Angry: "😡", Sad: "😢", Crying: "😭", Manic: "🤪" };
    var frogQuotes = [
        "🐸 💖 Ribbit! You're doing amazing! 💞 🐸", "✨ 🐸 Take a deep breath, little froggy! 💗 ✨",
        "🌸 🐸 Every hop counts! I'm proud of you! 💖 🌸", "💕 🐸 Stay hydrated and stay happy! 🐸 💕",
        "🐸 💗 You are the best frog in the pond! ✨ 🐸", "🐸 ✨ Leap into happiness! ✨ 🐸",
        "🐸 ☀️ Don't worry, be hoppy! ☀️ 🐸", "🐸 💖 Feeling totally un-frog-gettable today! 💖 🐸",
        "🌿 🐸 Just a little frog in a big, beautiful pond. 🐸 🌿", "☀️ 💧 Enjoying the simple things! 🐸 💧 ☀️",
        "🐸 😎 Toads-ally awesome! 😎 🐸", "🐸 🌈 Keep calm and leap on! 🌈 🐸",
        "🌊 🐸 Every day is a good day to make a splash! 🐸 🌊"
    ];

    window.onload = function() {
        var saved = localStorage.getItem('ProgressPond_V21');
        if (saved) { try { var parsed = JSON.parse(saved); for (var key in parsed) { pondData[key] = parsed[key]; } } catch(e) {} }

        document.getElementById('motivationText').textContent = frogQuotes[Math.floor(Math.random() * frogQuotes.length)];
        
        var now = new Date();
        document.getElementById('manualTimeInput').value = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');

        function setClick(id, fn) { var el = document.getElementById(id); if (el) el.onclick = fn; }
        setClick('addDailyBtn', addHop);
        setClick('addSugarBtn', addSugar);
        setClick('addCarbBtn', addCarb);
        setClick('exportBtn', exportData);
        setClick('bannerClose', function() { document.getElementById('motivationBar').style.display = 'none'; });
        setClick('historyToggle', function() { document.getElementById('historyFooter').classList.toggle('collapsed'); });
        setClick('resetPondBtn', function() { if (confirm("Reset today's hydration and active hops?")) { pondData.daily = []; pondData.waterCount = 0; saveAndRefresh(); } });
        setClick('clearHistoryBtn', function() { if (confirm("Delete ALL data?")) { localStorage.removeItem('ProgressPond_V21'); location.reload(); } });

        document.querySelectorAll('.mood-btn').forEach(function(btn) {
            btn.onclick = function() {
                var mood = this.getAttribute('data-mood');
                pondData.moodLog.push({ val: mood, icon: moodEmojis[mood], fullDate: currentFullDate(document.getElementById('manualTimeInput').value) });
                saveAndRefresh();
            };
        });

        document.querySelectorAll('.drop-btn').forEach(function(btn, index) {
            btn.onclick = function() {
                pondData.waterCount = index + 1;
                pondData.moodLog.push({ val: "Drank Water", icon: "💧", fullDate: currentFullDate(document.getElementById('manualTimeInput').value) });
                saveAndRefresh();
            };
        });

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
        var color = (val < 70 || val > 250) ? "#ff4d4d" : (val > 180 ? "#ffa500" : (val < 80 ? "#7dd3fc" : "#67a36a"));
        pondData.sugarLog.push({ val: val, color: color, fullDate: currentFullDate(document.getElementById('manualTimeInput').value) });
        input.value = "";
        saveAndRefresh();
    }

    function addCarb() {
        var input = document.getElementById('carbInput');
        if (!parseInt(input.value)) return;
        pondData.carbLog.push({ val: input.value, fullDate: currentFullDate(document.getElementById('manualTimeInput').value) });
        input.value = "";
        saveAndRefresh();
    }

    window.toggleHop = function(id) {
        var idx = pondData.daily.findIndex(function(g) { return g.id === id; });
        if (idx > -1) {
            var item = pondData.daily.splice(idx, 1);
            pondData.history.push({ text: "[" + item.priority + "] " + item.text, fullDate: currentFullDate(null) });
            saveAndRefresh();
        }
    };

    window.deleteHop = function(id) {
        pondData.daily = pondData.daily.filter(function(g) { return g.id !== id; });
        saveAndRefresh();
    };

    function currentFullDate(manualTime) {
        var now = new Date();
        var timeStr = manualTime || now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
        return now.toLocaleDateString([], { month: 'short', day: 'numeric' }) + " @ " + timeStr;
    }

    function exportData() {
        navigator.clipboard.writeText(JSON.stringify(pondData, null, 2)).then(function() { alert("Copied! 📋"); });
    }

    function saveAndRefresh() {
        localStorage.setItem('ProgressPond_V21', JSON.stringify(pondData));
        renderAll();
    }

    function renderAll() {
        document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        
        // Water Stays Highlighted
        document.querySelectorAll('.drop-btn').forEach((btn, i) => {
            if (i < pondData.waterCount) btn.classList.add('active');
            else btn.classList.remove('active');
        });
        document.getElementById('waterCountText').textContent = pondData.waterCount + " / 8";

        // Hops
        var listHtml = "";
        for (var i = 0; i < pondData.daily.length; i++) {
            var g = pondData.daily[i];
            listHtml += '<li style="display:flex; align-items:center; gap:10px; margin-bottom:10px; background:white; padding:8px; border-radius:10px;">' +
                '<input type="checkbox" onchange="toggleHop(' + g.id + ')">' +
                '<span style="flex:1">' + g.text + ' <small>(' + g.priority + ')</small></span>' +
                '<button onclick="deleteHop(' + g.id + ')" style="background:none; border:none; color:red; cursor:pointer;">×</button></li>';
        }
        document.getElementById('dailyList').innerHTML = listHtml || "No active hops...";

        // History
        var combined = pondData.moodLog.concat(
            pondData.sugarLog.map(s => ({ val: "Glucose: " + s.val, icon: "🩸", fullDate: s.fullDate, color: s.color })),
            pondData.carbLog.map(c => ({ val: "Carbs: " + c.val + "g", icon: "🥣", fullDate: c.fullDate }))
        ).sort((a, b) => new Date(b.fullDate.split(' @ ')[0] + ' ' + b.fullDate.split(' @ ')[1]) - new Date(a.fullDate.split(' @ ')[0] + ' ' + a.fullDate.split(' @ ')[1]));

        document.getElementById('moodHistoryList').innerHTML = combined.slice(0, 15).reverse().map(m => 
            '<div><span style="color:' + (m.color || 'white') + '">' + m.icon + ' ' + m.val + '</span> <small>' + m.fullDate + '</small></div>').join('');
        
        document.getElementById('dailyHistoryList').innerHTML = pondData.history.slice().reverse().slice(0, 10).map(h => 
            '<div>🌿 ' + h.text + ' <small>' + h.fullDate + '</small></div>').join('');

        var total = pondData.daily.length + pondData.history.length;
        var percent = total ? Math.round((pondData.history.length / total) * 100) : 0;
        document.getElementById('dailyProgress').style.width = percent + '%';
        document.getElementById('dailyProgressText').textContent = percent + '%';
    }
})();
