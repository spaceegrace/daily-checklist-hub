// Progress Pond - Full Persistence + Delete Version (V12)
(function() {
    var pondData = { 
        daily: [], 
        history: [], 
        moodLog: [], 
        waterCount: 0, 
        streak: 0, 
        lastStreakDate: null 
    };

    var moodEmojis = { Happy: "😊", Calm: "😌", Focused: "🧐", Tired: "😴", Grumpy: "😠" };
    var frogQuotes = [
        "🐸 💖 Ribbit! You're doing amazing! 💞 🐸",
        "✨ 🐸 Take a deep breath, little froggy! 💗 ✨",
        "🌸 🐸 Every hop counts! I'm proud of you! 💖 🌸",
        "💕 🐸 Stay hydrated and stay happy! 🐸 💕",
        "🐸 💗 You are the best frog in the pond! ✨ 🐸"
    ];

    window.onload = function() {
        // 1. Load data from storage
        var saved = localStorage.getItem('ProgressPond_V12');
        if (saved) {
            try {
                var parsed = JSON.parse(saved);
                if (parsed.daily) pondData.daily = parsed.daily;
                if (parsed.history) pondData.history = parsed.history;
                if (parsed.moodLog) pondData.moodLog = parsed.moodLog;
                if (parsed.waterCount !== undefined) pondData.waterCount = parsed.waterCount;
                if (parsed.streak !== undefined) pondData.streak = parsed.streak;
                if (parsed.lastStreakDate) pondData.lastStreakDate = parsed.lastStreakDate;
            } catch(e) { console.log("New start!"); }
        }

        // Display Date
        var dateEl = document.getElementById('currentDate');
        if (dateEl) {
            dateEl.textContent = new Date().toLocaleDateString('en-US', { 
                weekday: 'long', month: 'long', day: 'numeric' 
            });
        }

        var motivationEl = document.getElementById('motivationText');
        if (motivationEl) {
            motivationEl.textContent = frogQuotes[Math.floor(Math.random() * frogQuotes.length)];
        }

        // Event Listeners
        var addBtn = document.getElementById('addDailyBtn');
        if (addBtn) addBtn.onclick = addHop;

        var inputField = document.getElementById('dailyInput');
        if (inputField) {
            inputField.onkeypress = function(e) {
                if (e.key === 'Enter') { e.preventDefault(); addHop(); }
            };
        }

        var bannerBtn = document.getElementById('bannerClose');
        if (bannerBtn) {
            bannerBtn.onclick = function() { document.getElementById('motivationBar').style.display = 'none'; };
        }

        document.querySelectorAll('.mood-btn').forEach(function(btn) {
            btn.onclick = function() {
                var mood = btn.getAttribute('data-mood');
                pondData.moodLog.push({ val: mood, icon: moodEmojis[mood], time: currentTime() });
                saveAndRefresh();
            };
        });

        document.querySelectorAll('.drop-btn').forEach(function(btn, index) {
            btn.onclick = function() {
                var isAdding = (index + 1) > pondData.waterCount;
                pondData.waterCount = index + 1;
                if (isAdding) {
                    pondData.moodLog.push({ val: "Drank Water", icon: "💧", time: currentTime() });
                }
                saveAndRefresh();
            };
        });

        var toggle = document.getElementById('historyToggle');
        if (toggle) {
            toggle.onclick = function() { document.getElementById('historyFooter').classList.toggle('collapsed'); };
        }

        var reset = document.getElementById('resetPondBtn');
        if (reset) reset.onclick = function() {
            if (confirm("Reset today's hops and water?")) {
                pondData.daily = []; 
                pondData.waterCount = 0; 
                saveAndRefresh();
                location.reload(); 
            }
        };

        var clear = document.getElementById('clearHistoryBtn');
        if (clear) clear.onclick = function() {
            if (confirm("Permanently delete ALL pond data?")) {
                localStorage.removeItem('ProgressPond_V12');
                location.reload();
            }
        };

        renderAll();
    };

    function addHop() {
        var input = document.getElementById('dailyInput');
        if (!input) return;
        var text = input.value.trim();
        if (text !== "") {
            pondData.daily.push({ id: Date.now(), text: text });
            input.value = "";
            saveAndRefresh();
        }
    }

    // Toggle (Check off)
    window.toggleHop = function(id) {
        var idx = pondData.daily.findIndex(function(g) { return g.id === id; });
        if (idx > -1) {
            var item = pondData.daily.splice(idx, 1);
            pondData.history.push({ text: item[0].text, time: currentTime() });
            updateStreak();
            saveAndRefresh();
        }
    };

    // DELETE (Remove without finishing)
    window.deleteHop = function(id) {
        pondData.daily = pondData.daily.filter(function(g) { return g.id !== id; });
        saveAndRefresh();
    };

    function currentTime() { return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }

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

    function saveAndRefresh() {
        localStorage.setItem('ProgressPond_V12', JSON.stringify(pondData));
        renderAll();
    }

    function renderAll() {
        var list = document.getElementById('dailyList');
        if (list) {
            var html = "";
            for (var i = 0; i < pondData.daily.length; i++) {
                var g = pondData.daily[i];
                html += '<li style="display:flex; align-items:center; gap:12px; margin-bottom:12px; background:white; padding:10px; border-radius:12px; border:1px solid #eee; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">' +
                        '<input type="checkbox" style="width:22px; height:22px; cursor:pointer;" onchange="toggleHop(' + g.id + ')">' +
                        '<span style="font-size:1.05rem; color:#5d4a4a; flex:1;">' + g.text + '</span>' +
                        '<button onclick="deleteHop(' + g.id + ')" style="background:none; border:none; color:#ffc2d1; cursor:pointer; font-size:1.2rem; font-weight:bold; padding:0 5px;">×</button>' +
                        '</li>';
            }
            list.innerHTML = html || '<li style="color:#67a36a; text-align:center; padding:10px;">No hops yet... 🐸</li>';
        }

        document.querySelectorAll('.drop-btn').forEach(function(btn, i) {
            if (i < pondData.waterCount) btn.classList.add('active');
            else btn.classList.remove('active');
        });
        
        var wText = document.getElementById('waterCountText');
        if (wText) wText.textContent = pondData.waterCount + " / 8";

        var sCount = document.getElementById('streakCount');
        if (sCount) sCount.textContent = pondData.streak || 0;

        var hList = document.getElementById('dailyHistoryList');
        if (hList) {
            var hHtml = "";
            var revHistory = pondData.history.slice().reverse();
            for (var j = 0; j < Math.min(revHistory.length, 10); j++) {
                hHtml += '<div>🌿 ' + revHistory[j].text + '</div>';
            }
            hList.innerHTML = hHtml || "-";
        }

        var mList = document.getElementById('moodHistoryList');
        if (mList) {
            var mHtml = "";
            var revMoods = pondData.moodLog.slice().reverse();
            for (var k = 0; k < Math.min(revMoods.length, 10); k++) {
                var m = revMoods[k];
                mHtml += '<div>' + m.icon + ' ' + m.val + ' <small>(' + m.time + ')</small></div>';
            }
            mList.innerHTML = mHtml || "-";
        }

        var total = pondData.daily.length + pondData.history.length;
        var percent = total ? Math.round((pondData.history.length / total) * 100) : 0;
        var pFill = document.getElementById('dailyProgress');
        var pText = document.getElementById('dailyProgressText');
        if (pFill) pFill.style.width = percent + '%';
        if (pText) pText.textContent = percent + '%';
    }
})();
