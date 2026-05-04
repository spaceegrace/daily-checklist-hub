// Progress Pond - V15 (Full Logic)
(function() {
    var pondData = { 
        daily: [], 
        history: [], 
        moodLog: [], 
        sugarLog: [], 
        waterCount: 0, 
        streak: 0, 
        lastStreakDate: null 
    };

    var moodEmojis = { 
        Happy: "😊", Calm: "😌", Focused: "🧐", Tired: "😴", Grumpy: "😠", 
        Confused: "😕", Angry: "😡", Sad: "😢", Crying: "😭", Manic: "🤪" 
    };

    window.onload = function() {
        var saved = localStorage.getItem('ProgressPond_V15');
        if (saved) { 
            try { 
                var parsed = JSON.parse(saved);
                pondData = Object.assign(pondData, parsed); 
            } catch(e) { console.log("New start!"); } 
        }

        // Display Date
        var dateEl = document.getElementById('currentDate');
        if (dateEl) {
            dateEl.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        }

        // Button Listeners
        document.getElementById('addDailyBtn').onclick = addHop;
        document.getElementById('addSugarBtn').onclick = addSugar;
        document.getElementById('exportBtn').onclick = exportToClipboard;
        document.getElementById('historyToggle').onclick = function() {
            document.getElementById('historyFooter').classList.toggle('collapsed');
        };
        document.getElementById('bannerClose').onclick = function() {
            document.getElementById('motivationBar').style.display = 'none';
        };
        document.getElementById('resetPondBtn').onclick = function() {
            if (confirm("Reset today's hops and water?")) {
                pondData.daily = [];
                pondData.waterCount = 0;
                saveAndRefresh();
            }
        };
        document.getElementById('clearHistoryBtn').onclick = function() {
            if (confirm("Permanently delete ALL pond data?")) {
                localStorage.removeItem('ProgressPond_V15');
                location.reload();
            }
        };

        // Mood Buttons
        document.querySelectorAll('.mood-btn').forEach(function(btn) {
            btn.onclick = function() {
                var mood = btn.getAttribute('data-mood');
                pondData.moodLog.push({ 
                    val: mood, 
                    icon: moodEmojis[mood], 
                    fullDate: currentFullDate() 
                });
                saveAndRefresh();
            };
        });

        // Water Buttons
        document.querySelectorAll('.drop-btn').forEach(function(btn, index) {
            btn.onclick = function() {
                pondData.waterCount = index + 1;
                pondData.moodLog.push({ 
                    val: "Drank Water", 
                    icon: "💧", 
                    fullDate: currentFullDate() 
                });
                saveAndRefresh();
            };
        });

        renderAll();
    };

    function addHop() {
        var input = document.getElementById('dailyInput');
        var prio = document.getElementById('priorityInput').value;
        if (input.value.trim() === "") return;
        pondData.daily.push({ 
            id: Date.now(), 
            text: input.value, 
            priority: prio 
        });
        input.value = "";
        saveAndRefresh();
    }

    function addSugar() {
        var input = document.getElementById('sugarInput');
        var val = parseInt(input.value);
        if (!val) return;
        
        var color = "#67a36a"; // Default Green
        if (val < 70 || val > 250) color = "#ff4d4d"; // Red
        else if (val > 180) color = "#ffa500";       // Orange
        else if (val < 80) color = "#7dd3fc";        // Blue
        
        pondData.sugarLog.push({ 
            val: val, 
            color: color, 
            fullDate: currentFullDate() 
        });
        input.value = "";
        saveAndRefresh();
    }

    window.toggleHop = function(id) {
        var idx = pondData.daily.findIndex(function(g) { return g.id === id; });
        if (idx > -1) {
            var item = pondData.daily.splice(idx, 1)[0];
            pondData.history.push({ 
                text: "[" + item.priority + "] " + item.text, 
                fullDate: currentFullDate() 
            });
            updateStreak();
            saveAndRefresh();
        }
    };

    function updateStreak() {
        var today = new Date().toDateString();
        if (pondData.lastStreakDate === today) return;
        var yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (pondData.lastStreakDate === yesterday.toDateString()) {
            pondData.streak++;
        } else {
            pondData.streak = 1;
        }
        pondData.lastStreakDate = today;
    }

    function currentFullDate() {
        var now = new Date();
        return now.toLocaleDateString([], { month: 'short', day: 'numeric' }) + " @ " + 
               now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function exportToClipboard() {
        var dataStr = JSON.stringify(pondData, null, 2);
        navigator.clipboard.writeText(dataStr).then(function() {
            alert("Pond data copied to clipboard! 🐸✨");
        });
    }

    function saveAndRefresh() {
        localStorage.setItem('ProgressPond_V15', JSON.stringify(pondData));
        renderAll();
    }

    function renderAll() {
        // Render Active Hops
        var list = document.getElementById('dailyList');
        list.innerHTML = pondData.daily.map(function(g) {
            return '<li class="pond-card" style="display:flex; align-items:center; gap:10px; margin-bottom:10px; padding:10px; box-shadow:none; border-width:2px;">' +
                '<input type="checkbox" onchange="toggleHop(' + g.id + ')" style="width:20px; height:20px;">' +
                '<span style="flex:1" class="tag-' + g.priority.toLowerCase() + '">' + g.text + '</span>' +
                '<small style="opacity:0.5;">' + g.priority + '</small>' +
            '</li>';
        }).join('') || '<div style="text-align:center; padding:20px; opacity:0.5;">No active hops... 🐸</div>';

        // Render Hops History
        document.getElementById('dailyHistoryList').innerHTML = pondData.history.slice(-10).reverse().map(function(h) {
            return '<div>' + h.text + '<small>' + h.fullDate + '</small></div>';
        }).join('');
        
        // Combine and Render Mood/Sugar/Water logs
        var combined = pondData.moodLog.slice().concat(
            pondData.sugarLog.map(function(s) {
                return { val: 'CGM: ' + s.val + ' mg/dL', icon: '🩸', fullDate: s.fullDate, color: s.color };
            })
        );
        
        document.getElementById('moodHistoryList').innerHTML = combined.slice(-15).reverse().map(function(m) {
            var style = m.color ? 'style="color:' + m.color + '; font-weight:bold;"' : '';
            return '<div><span ' + style + '>' + m.icon + ' ' + m.val + '</span><small>' + m.fullDate + '</small></div>';
        }).join('') || "-";
        
        // Update Water UI
        document.querySelectorAll('.drop-btn').forEach(function(btn, i) {
            if (i < pondData.waterCount) btn.classList.add('active');
            else btn.classList.remove('active');
        });
        document.getElementById('waterCountText').textContent = pondData.waterCount + " / 8";

        // Update Progress
        var total = pondData.daily.length + pondData.history.length;
        var percent = total ? Math.round((pondData.history.length / total) * 100) : 0;
        document.getElementById('dailyProgress').style.width = percent + '%';
        document.getElementById('dailyProgressText').textContent = percent + '%';
        document.getElementById('streakCount').textContent = pondData.streak || 0;
    }
})();
