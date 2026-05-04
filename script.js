(function() {
    var pondData = { daily: [], history: [], moodLog: [], sugarLog: [], carbLog: [], waterCount: 0, streak: 0, lastStreakDate: null };
    var moodEmojis = { Happy: "😊", Calm: "😌", Focused: "🧐", Tired: "😴", Grumpy: "😠", Confused: "😕", Angry: "😡", Sad: "😢", Crying: "😭", Manic: "🤪" };
    var frogQuotes = [
        "🐸 💖 Ribbit! You're doing amazing! 💞 🐸", "✨ 🐸 Take a deep breath, little froggy! 💗 ✨", 
        "🌸 🐸 Every hop counts! I'm proud of you! 💖 🌸", "💕 🐸 Stay hydrated and stay happy! 🐸 💕", 
        "🐸 💗 You are the best frog in the pond! ✨ 🐸", "🐸 ✨ Leap into happiness! ✨ 🐸", 
        "🐸 ☀️ Don't worry, be hoppy! ☀️ 🐸", "🐸 💖 Feeling totally un-frog-gettable today! 💖 🐸", 
        "🌿 🐸 Just a little frog in a big, beautiful pond. 🐸 🌿", "☀️ 💧 Enjoying the simple things! 🐸 💧 ☀️", 
        "🐸 😎 Toads-ally awesome! 😎 🐸", "🐸 🌈 Keep calm and leap on! 🌈 🐸", "🌊 🐸 Every day is a good day to make a splash! 🐸 🌊"
    ];

    window.onload = function() {
        var saved = localStorage.getItem('ProgressPond_V17');
        if (saved) { try { var parsed = JSON.parse(saved); for (var key in parsed) { pondData[key] = parsed[key]; } } catch(e) {} }

        // Setup Buttons
        function setClick(id, fn) { var el = document.getElementById(id); if (el) el.onclick = fn; }
        setClick('addDailyBtn', addHop);
        setClick('addSugarBtn', addSugar);
        setClick('addCarbBtn', addCarb);
        setClick('exportBtn', exportData);
        setClick('bannerClose', function() { document.getElementById('motivationBar').style.display = 'none'; });
        setClick('historyToggle', function() { document.getElementById('historyFooter').classList.toggle('collapsed'); });
        setClick('resetPondBtn', function() { if (confirm("Reset today's activity?")) { pondData.daily = []; pondData.waterCount = 0; saveAndRefresh(); } });
        setClick('clearHistoryBtn', function() { if (confirm("Permanently delete ALL data?")) { localStorage.removeItem('ProgressPond_V17'); location.reload(); } });

        // Set Banner Quote
        document.getElementById('motivationText').textContent = frogQuotes[Math.floor(Math.random() * frogQuotes.length)];

        // Moods & Water setup
        var moodBtns = document.querySelectorAll('.mood-btn');
        for (var i = 0; i < moodBtns.length; i++) {
            moodBtns[i].onclick = function() {
                var m = this.getAttribute('data-mood');
                pondData.moodLog.push({ val: m, icon: moodEmojis[m], fullDate: currentFullDate() });
                saveAndRefresh();
            };
        }
        var dropBtns = document.querySelectorAll('.drop-btn');
        for (var j = 0; j < dropBtns.length; j++) {
            (function(idx) { dropBtns[idx].onclick = function() { pondData.waterCount = idx + 1; pondData.moodLog.push({ val: "Drank Water", icon: "💧", fullDate: currentFullDate() }); saveAndRefresh(); }; })(j);
        }
        renderAll();
    };

    function addHop() {
        var input = document.getElementById('dailyInput');
        if (!input.value.trim()) return;
        pondData.daily.push({ id: Date.now(), text: input.value, priority: document.getElementById('priorityInput').value });
        input.value = ""; saveAndRefresh();
    }

    function addSugar() {
        var input = document.getElementById('sugarInput');
        var val = parseInt(input.value); if (!val) return;
        var col = "#fff"; 
        if (val < 70 || val > 250) col = "#ff4d4d"; else if (val > 180) col = "#ffa500"; else if (val < 80) col = "#7dd3fc"; 
        pondData.sugarLog.push({ val: val, icon: "🩸", label: "Glucose", color: col, fullDate: currentFullDate() });
        input.value = ""; saveAndRefresh();
    }

    function addCarb() {
        var input = document.getElementById('carbInput');
        var val = parseInt(input.value); if (!val) return;
        pondData.carbLog.push({ val: val, icon: "🍞", label: "Carbs", fullDate: currentFullDate() });
        input.value = ""; saveAndRefresh();
    }

    window.toggleHop = function(id) {
        var idx = -1; for (var i = 0; i < pondData.daily.length; i++) { if (pondData.daily[i].id === id) { idx = i; break; } }
        if (idx > -1) { var item = pondData.daily.splice(idx, 1)[0]; pondData.history.push({ text: "[" + item.priority + "] " + item.text, fullDate: currentFullDate() }); saveAndRefresh(); }
    };

    window.deleteHop = function(id) {
        if (confirm("Delete this hop?")) { pondData.daily = pondData.daily.filter(function(g) { return g.id !== id; }); saveAndRefresh(); }
    };

    function currentFullDate() {
        var now = new Date();
        return now.toLocaleDateString([], { month: 'short', day: 'numeric' }) + " @ " + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function exportData() {
        var el = document.createElement('textarea'); el.value = JSON.stringify(pondData, null, 2); document.body.appendChild(el); el.select();
        document.execCommand('copy'); document.body.removeChild(el); alert("Pond Copied! 🐸📋");
    }

    function saveAndRefresh() { localStorage.setItem('ProgressPond_V17', JSON.stringify(pondData)); renderAll(); }

    function renderAll() {
        document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        
        var listHtml = "";
        for (var i = 0; i < pondData.daily.length; i++) {
            var g = pondData.daily[i];
            listHtml += '<li class="pond-card" style="display:flex; align-items:center; gap:10px; margin-bottom:10px; box-shadow:none;">' +
                '<input type="checkbox" onchange="toggleHop(' + g.id + ')">' +
                '<span style="flex:1" class="tag-' + g.priority.toLowerCase() + '">' + g.text + '</span>' +
                '<button onclick="deleteHop(' + g.id + ')" style="background:none; border:none; color:var(--pink); cursor:pointer;">×</button></li>';
        }
        document.getElementById('dailyList').innerHTML = listHtml || "No active hops...";

        var drops = document.querySelectorAll('.drop-btn');
        for (var d = 0; d < drops.length; d++) { drops[d].className = d < pondData.waterCount ? "drop-btn active" : "drop-btn"; }
        document.getElementById('waterCountText').textContent = pondData.waterCount + " / 8";

        var vitals = pondData.moodLog.concat(pondData.sugarLog).concat(pondData.carbLog).sort(function(a, b) { return new Date(b.fullDate) - new Date(a.fullDate); });
        document.getElementById('moodHistoryList').innerHTML = vitals.slice(0, 15).map(function(v) {
            var txt = v.label ? v.label + ": " + v.val + (v.label === "Carbs" ? "g" : " mg/dL") : v.val;
            return '<div><span style="color:' + (v.color || 'white') + '">' + v.icon + ' ' + txt + '</span> <small>' + v.fullDate + '</small></div>';
        }).join('');

        document.getElementById('dailyHistoryList').innerHTML = pondData.history.slice().reverse().slice(0, 10).map(function(h) {
            return '<div>🌿 ' + h.text + ' <small>' + h.fullDate + '</small></div>';
        }).join('');
    }
})();