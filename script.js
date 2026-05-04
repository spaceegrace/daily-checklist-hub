// Progress Pond - Full Persistence + Enhanced History (V13)
(function() {
    var pondData = {
        daily: [],
        history: [],
        moodLog: [],
        waterCount: 0,
        streak: 0,
        lastStreakDate: null
    };

    var moodEmojis = {
        Happy: "😊",
        Calm: "😌",
        Focused: "🧐",
        Tired: "😴",
        Grumpy: "😠",
        Confused: "😕", // New
        Angry: "😡",   // New
        Sad: "😢",      // New
        Crying: "😭"    // New
    };

    var frogQuotes = [
      "🐸💖 Ribbit! You're doing amazing! 💞🐸",
      "✨🐸 Take a deep breath, little froggy! 💗✨",
      "🌸🐸 Every hop counts! I'm proud of you! 💖🌸",
      "💕🐸 Stay hydrated and stay happy! 🐸💕",
      "🐸💗 You are the best frog in the pond! ✨🐸",
      "🐸✨ Leap into happiness! ✨🐸",
      "🐸☀️ Don't worry, be hoppy! ☀️🐸",
      "🐸💖 Feeling totally un-frog-gettable today! 💖🐸",
      "🌿🐸 Just a little frog in a big, beautiful pond. 🐸🌿",
      "☀️💧 Enjoying the simple things! 🐸💧☀️",
      "🐸😎 Toads-ally awesome! 😎🐸",
      "🐸🌈 Keep calm and leap on! 🌈🐸",
      "🌊🐸 Every day is a good day to make a splash! 🐸🌊"
    ];


    window.onload = function() {
        var saved = localStorage.getItem('ProgressPond_V13');
        if (saved) {
            try {
                pondData = JSON.parse(saved);
            } catch(e) { console.log("New start!"); }
        }

        var dateEl = document.getElementById('currentDate');
        if (dateEl) {
            dateEl.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        }

        var motivationEl = document.getElementById('motivationText');
        if (motivationEl) {
            motivationEl.textContent = frogQuotes[Math.floor(Math.random() * frogQuotes.length)];
        }

        var addBtn = document.getElementById('addDailyBtn');
        if (addBtn) addBtn.onclick = addHop;

        var inputField = document.getElementById('dailyInput');
        if (inputField) {
            inputField.onkeypress = function(e) { if (e.key === 'Enter') { e.preventDefault(); addHop(); } };
        }

        var bannerBtn = document.getElementById('bannerClose');
        if (bannerBtn) {
            bannerBtn.onclick = function() { document.getElementById('motivationBar').style.display = 'none'; };
        }

        // Mood Buttons Logic
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

        // Water Drop Logic
        document.querySelectorAll('.drop-btn').forEach(function(btn, index) {
            btn.onclick = function() {
                var isAdding = (index + 1) > pondData.waterCount;
                pondData.waterCount = index + 1;
                if (isAdding) {
                    pondData.moodLog.push({ 
                        val: "Drank Water", 
                        icon: "💧", 
                        fullDate: currentFullDate() 
                    });
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
                localStorage.removeItem('ProgressPond_V13');
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

    window.toggleHop = function(id) {
        var idx = pondData.daily.findIndex(function(g) { return g.id === id; });
        if (idx > -1) {
            var item = pondData.daily.splice(idx, 1);
            pondData.history.push({ 
                text: item[0].text, 
                fullDate: currentFullDate() 
            });
            updateStreak();
            saveAndRefresh();
        }
    };

    window.deleteHop = function(id) {
        pondData.daily = pondData.daily.filter(function(g) { return g.id !== id; });
        saveAndRefresh();
    };

    // Helper for Date + Time
    function currentFullDate() {
        var now = new Date();
        var dateStr = now.toLocaleDateString([], { month: 'short', day: 'numeric' });
        var timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return dateStr + " @ " + timeStr;
    }

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
        localStorage.setItem('ProgressPond_V13', JSON.stringify(pondData));
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

        // History with Timestamps
        var hList = document.getElementById('dailyHistoryList');
        if (hList) {
            var hHtml = "";
            var revHistory = pondData.history.slice().reverse();
            for (var j = 0; j < Math.min(revHistory.length, 15); j++) {
                hHtml += '<div style="margin-bottom:4px; font-size:0.9rem;">🌿 ' + revHistory[j].text + ' <span style="color:#aaa; font-size:0.75rem;">(' + (revHistory[j].fullDate || 'Recently') + ')</span></div>';
            }
            hList.innerHTML = hHtml || "-";
        }

        // Mood History with Timestamps
        var mList = document.getElementById('moodHistoryList');
        if (mList) {
            var mHtml = "";
            var revMoods = pondData.moodLog.slice().reverse();
            for (var k = 0; k < Math.min(revMoods.length, 15); k++) {
                var m = revMoods[k];
                mHtml += '<div style="margin-bottom:4px; font-size:0.9rem;">' + m.icon + ' ' + m.val + ' <span style="color:#aaa; font-size:0.75rem;">(' + (m.fullDate || 'Recently') + ')</span></div>';
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
