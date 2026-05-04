(function() {
    var pondData = { daily: [], history: [], moodLog: [], sugarLog: [], waterCount: 0, streak: 0, lastStreakDate: null };
    var moodEmojis = { Happy: "😊", Calm: "😌", Focused: "🧐", Tired: "😴", Grumpy: "😠", Confused: "😕", Angry: "😡", Sad: "😢", Crying: "😭", Manic: "🤪" };

    window.onload = function() {
        var saved = localStorage.getItem('ProgressPond_V16');
        if (saved) { try { var parsed = JSON.parse(saved); for (var key in parsed) { pondData[key] = parsed[key]; } } catch(e) {} }

        // Setup Safe Click Listeners
        function setClick(id, fn) { var el = document.getElementById(id); if (el) el.onclick = fn; }

        setClick('addDailyBtn', addHop);
        setClick('addSugarBtn', addSugar);
        setClick('exportBtn', exportData);
        setClick('bannerClose', function() { document.getElementById('motivationBar').style.display = 'none'; });
        setClick('historyToggle', function() { document.getElementById('historyFooter').classList.toggle('collapsed'); });
        setClick('resetPondBtn', function() { if (confirm("Reset today?")) { pondData.daily = []; pondData.waterCount = 0; saveAndRefresh(); } });

        // Moods
        var moodBtns = document.querySelectorAll('.mood-btn');
        for (var i = 0; i < moodBtns.length; i++) {
            moodBtns[i].onclick = function() {
                var mood = this.getAttribute('data-mood');
                pondData.moodLog.push({ val: mood, icon: moodEmojis[mood], fullDate: currentFullDate() });
                saveAndRefresh();
            };
        }

        // Water Drops (Persistent logic)
        var dropBtns = document.querySelectorAll('.drop-btn');
        for (var j = 0; j < dropBtns.length; j++) {
            (function(index) {
                dropBtns[index].onclick = function() {
                    pondData.waterCount = index + 1;
                    pondData.moodLog.push({ val: "Drank Water", icon: "💧", fullDate: currentFullDate() });
                    saveAndRefresh();
                };
            })(j);
        }
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
        var val = parseInt(input.value);
        if (!val) return;
        var color = "#fff"; 
        if (val < 70 || val > 250) color = "#ff4d4d"; 
        else if (val > 180) color = "#ffa500"; 
        else if (val < 80) color = "#7dd3fc"; 
        pondData.sugarLog.push({ val: val, color: color, fullDate: currentFullDate() });
        input.value = "";
        saveAndRefresh();
    }

    window.toggleHop = function(id) {
        var idx = -1;
        for (var i = 0; i < pondData.daily.length; i++) { if (pondData.daily[i].id === id) { idx = i; break; } }
        if (idx > -1) {
            var item = pondData.daily.splice(idx, 1);
            pondData.history.push({ text: "[" + item[0].priority + "] " + item[0].text, fullDate: currentFullDate() });
            saveAndRefresh();
        }
    };

    function currentFullDate() {
        var now = new Date();
        return now.toLocaleDateString([], { month: 'short', day: 'numeric' }) + " @ " + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function exportData() {
        var str = JSON.stringify(pondData, null, 2);
        var el = document.createElement('textarea');
        el.value = str; document.body.appendChild(el); el.select();
        document.execCommand('copy'); document.body.removeChild(el);
        alert("Pond Copied! 🐸📋");
    }

    function saveAndRefresh() {
        localStorage.setItem('ProgressPond_V16', JSON.stringify(pondData));
        renderAll();
    }

    function renderAll() {
        document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        
        var listHtml = "";
        for (var i = 0; i < pondData.daily.length; i++) {
            var g = pondData.daily[i];
            listHtml += '<li style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">' +
                '<input type="checkbox" onchange="toggleHop(' + g.id + ')">' +
                '<span style="flex:1">' + g.text + '</span> <small>(' + g.priority + ')</small></li>';
        }
        document.getElementById('dailyList').innerHTML = listHtml || "No hops...";

        var drops = document.querySelectorAll('.drop-btn');
        for (var d = 0; d < drops.length; d++) {
            if (d < pondData.waterCount) drops[d].classList.add('active');
            else drops[d].classList.remove('active');
        }

        var combined = pondData.moodLog.concat(pondData.sugarLog.map(function(s) {
            return { val: "CGM: " + s.val, icon: "🩸", fullDate: s.fullDate, color: s.color };
        })).sort(function(a, b) { return new Date(b.fullDate) - new Date(a.fullDate); });

        document.getElementById('moodHistoryList').innerHTML = combined.slice(0, 15).map(function(m) {
            return '<div><span style="color:' + (m.color || 'white') + '">' + m.icon + ' ' + m.val + '</span> <small>' + m.fullDate + '</small></div>';
        }).join('');
        
        document.getElementById('dailyHistoryList').innerHTML = pondData.history.slice().reverse().slice(0, 10).map(function(h) {
            return '<div>🌿 ' + h.text + ' <small>' + h.fullDate + '</small></div>';
        }).join('');
    }
})();
