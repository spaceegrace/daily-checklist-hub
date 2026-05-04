(function() {
    var pondData = { daily: [], history: [], moodLog: [], sugarLog: [], carbLog: [], waterCount: 0, streak: 0, lastStreakDate: null };
    var moodEmojis = { Happy: "😊", Calm: "😌", Focused: "🧐", Tired: "😴", Grumpy: "😠", Confused: "😕", Angry: "😡", Sad: "😢", Crying: "😭", Manic: "🤪" };
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
        "🐸 😎 Toads-ally awesome! 😎 🐸",
        "🐸 🌈 Keep calm and leap on! 🌈 🐸",
        "🌊 🐸 Every day is a good day to make a splash! 🐸 🌊"
    ];

    window.onload = function() {
        var saved = localStorage.getItem('ProgressPond_V18');
        if (saved) { try { var parsed = JSON.parse(saved); for (var key in parsed) { pondData[key] = parsed[key]; } } catch(e) {} }

        // Set Banner Quote
        document.getElementById('motivationText').textContent = frogQuotes[Math.floor(Math.random() * frogQuotes.length)];

        // Safe click helpers
        function setClick(id, fn) { var el = document.getElementById(id); if (el) el.onclick = fn; }

        setClick('addDailyBtn', addHop);
        setClick('addSugarBtn', addSugar);
        setClick('addCarbBtn', addCarb);
        setClick('exportBtn', exportData);
        setClick('bannerClose', function() { document.getElementById('motivationBar').style.display = 'none'; });
        setClick('historyToggle', function() { document.getElementById('historyFooter').classList.toggle('collapsed'); });
        setClick('resetPondBtn', function() { if (confirm("Reset today's hydration and active hops?")) { pondData.daily = []; pondData.waterCount = 0; saveAndRefresh(); } });
        setClick('clearHistoryBtn', function() { if (confirm("Permanently delete ALL history and logs?")) { localStorage.removeItem('ProgressPond_V18'); location.reload(); } });

        // Moods
        document.querySelectorAll('.mood-btn').forEach(function(btn) {
            btn.onclick = function() {
                var mood = this.getAttribute('data-mood');
                pondData.moodLog.push({ val: mood, icon: moodEmojis[mood], fullDate: currentFullDate(0) });
                saveAndRefresh();
            };
        });

        // Water
        document.querySelectorAll('.drop-btn').forEach(function(btn, index) {
            btn.onclick = function() {
                pondData.waterCount = index + 1;
                pondData.moodLog.push({ val: "Drank Water", icon: "💧", fullDate: currentFullDate(0) });
                saveAndRefresh();
            };
        });

        renderAll();
    };

    function addHop() {
        var input = document.getElementById('dailyInput');
        var prio = document.getElementById('priorityInput').value;
        if (!input.value.trim()) return;
        pondData.daily.push({ id: Date.now(), text: input.value, priority: prio });
        input.value = "";
        saveAndRefresh();
    }

    function addSugar() {
        var input = document.getElementById('sugarInput');
        var offset = parseInt(document.getElementById('timeOffset').value);
        var val = parseInt(input.value);
        if (!val) return;
        var color = "#67a36a"; 
        if (val < 70 || val > 250) color = "#ff4d4d"; 
        else if (val > 180) color = "#ffa500"; 
        else if (val < 80) color = "#7dd3fc"; 
        pondData.sugarLog.push({ val: val, color: color, fullDate: currentFullDate(offset) });
        input.value = "";
        saveAndRefresh();
    }

    function addCarb() {
        var input = document.getElementById('carbInput');
        var offset = parseInt(document.getElementById('timeOffset').value);
        var val = parseInt(input.value);
        if (!val) return;
        pondData.carbLog.push({ val: val, fullDate: currentFullDate(offset) });
        input.value = "";
        saveAndRefresh();
    }

    window.toggleHop = function(id) {
        var idx = pondData.daily.findIndex(function(g) { return g.id === id; });
        if (idx > -1) {
            var item = pondData.daily.splice(idx, 1)[0];
            pondData.history.push({ text: "[" + item.priority + "] " + item.text, fullDate: currentFullDate(0) });
            saveAndRefresh();
        }
    };

    window.deleteHop = function(id) {
        pondData.daily = pondData.daily.filter(function(g) { return g.id !== id; });
        saveAndRefresh();
    };

    function currentFullDate(offsetMinutes) {
        var now = new Date();
        now.setMinutes(now.getMinutes() - offsetMinutes);
        return now.toLocaleDateString([], { month: 'short', day: 'numeric' }) + " @ " + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function exportData() {
        var str = JSON.stringify(pondData, null, 2);
        navigator.clipboard.writeText(str).then(function() { alert("Pond Data Copied! 🐸📋"); });
    }

    function saveAndRefresh() {
        localStorage.setItem('ProgressPond_V18', JSON.stringify(pondData));
        renderAll();
    }

    function renderAll() {
        if (document.getElementById('currentDate')) {
            document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        }
        
        var listHtml = "";
        for (var i = 0; i < pondData.daily.length; i++) {
            var g = pondData.daily[i];
            listHtml += '<li style="display:flex; align-items:center; gap:10px; margin-bottom:10px; background:white; padding:8px; border-radius:10px;">' +
                '<input type="checkbox" onchange="toggleHop(' + g.id + ')">' +
                '<span style="flex:1">' + g.text + ' <small>(' + g.priority + ')</small></span>' +
                '<button onclick="deleteHop(' + g.id + ')" style="background:none; border:none; color:red; cursor:pointer;">×</button></li>';
        }
        document.getElementById('dailyList').innerHTML = listHtml || "No hops yet...";

        var drops = document.querySelectorAll('.drop-btn');
        for (var d = 0; d < drops.length; d++) {
            if (d < pondData.waterCount) drops[d].classList.add('active');
            else drops[d].classList.remove('active');
        }

        var combined = pondData.moodLog.concat(
            pondData.sugarLog.map(function(s) { return { val: "Glucose: " + s.val, icon: "🩸", fullDate: s.fullDate, color: s.color }; }),
            pondData.carbLog.map(function(c) { return { val: "Carbs: " + c.val + "g", icon: "🥣", fullDate: c.fullDate }; })
        ).sort(function(a, b) { return new Date(b.fullDate) - new Date(a.fullDate); });

        document.getElementById('moodHistoryList').innerHTML = combined.slice(0, 20).map(function(m) {
            return '<div><span style="color:' + (m.color || 'white') + '">' + m.icon + ' ' + m.val + '</span> <small>' + m.fullDate + '</small></div>';
        }).join('');
        
        document.getElementById('dailyHistoryList').innerHTML = pondData.history.slice().reverse().slice(0, 10).map(function(h) {
            return '<div>🌿 ' + h.text + ' <small>' + h.fullDate + '</small></div>';
        }).join('');

        var total = pondData.daily.length + pondData.history.length;
        var percent = total ? Math.round((pondData.history.length / total) * 100) : 0;
        document.getElementById('dailyProgress').style.width = percent + '%';
        document.getElementById('dailyProgressText').textContent = percent + '%';
    }
})();
