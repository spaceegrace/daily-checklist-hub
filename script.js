// Progress Pond - Ultra Stable Version
(function() {
    // 1. Initial Data
    var pondData = { 
        daily: [], 
        history: [], 
        moodLog: [], 
        waterCount: 0, 
        streak: 0, 
        lastStreakDate: null 
    };

    var moodEmojis = { Happy: "😊", Calm: "😌", Focused: "🧐", Tired: "😴", Grumpy: "😠" };

    // 2. Main Start Function
    window.onload = function() {
        // Load existing data
        var saved = localStorage.getItem('ProgressPond_V7');
        if (saved) {
            try {
                pondData = JSON.parse(saved);
            } catch(e) { console.log("New start!"); }
        }

        // Display Date
        var dateEl = document.getElementById('currentDate');
        if (dateEl) {
            dateEl.textContent = new Date().toLocaleDateString('en-US', { 
                weekday: 'short', month: 'short', day: 'numeric' 
            });
        }

        // Set up the Add Goal button
        var addBtn = document.getElementById('addDailyBtn');
        if (addBtn) {
            addBtn.onclick = function() {
                addHop();
            };
        }

        // Set up the Enter key for input
        var inputField = document.getElementById('dailyInput');
        if (inputField) {
            inputField.onkeypress = function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    addHop();
                }
            };
        }

        // Setup Mood Buttons
        var mBtns = document.querySelectorAll('.mood-btn');
        mBtns.forEach(function(btn) {
            btn.onclick = function() {
                var mood = btn.getAttribute('data-mood');
                pondData.moodLog.push({ 
                    val: mood, 
                    icon: moodEmojis[mood], 
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                });
                saveAndRefresh();
            };
        });

        // Setup Water Buttons
        var wBtns = document.querySelectorAll('.drop-btn');
        wBtns.forEach(function(btn, index) {
            btn.onclick = function() {
                var isAdding = (index + 1) > pondData.waterCount;
                pondData.waterCount = index + 1;
                if (isAdding) {
                    pondData.moodLog.push({ 
                        val: "Drank Water", 
                        icon: "💧", 
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                    });
                }
                saveAndRefresh();
            };
        });

        // Setup Toggle/Reset/Clear
        var toggle = document.getElementById('historyToggle');
        if (toggle) toggle.onclick = function() { document.getElementById('historyFooter').classList.toggle('collapsed'); };

        var reset = document.getElementById('resetPondBtn');
        if (reset) reset.onclick = function() {
            if (confirm("Reset today's hops?")) {
                pondData.daily = []; 
                pondData.waterCount = 0; 
                saveAndRefresh();
            }
        };

        var clear = document.getElementById('clearHistoryBtn');
        if (clear) clear.onclick = function() {
            if (confirm("Clear all logs?")) {
                localStorage.removeItem('ProgressPond_V7');
                location.reload();
            }
        };

        // Initial Render
        renderAll();
    };

    // 3. Goal Logic
    function addHop() {
        var input = document.getElementById('dailyInput');
        if (!input) return;
        var text = input.value.trim();
        
        if (text !== "") {
            pondData.daily.push({ 
                id: Date.now(), 
                text: text 
            });
            input.value = "";
            saveAndRefresh();
        }
    }

    // This makes the function global so the checkbox can see it
    window.toggleHop = function(id) {
        var foundIndex = -1;
        for (var i = 0; i < pondData.daily.length; i++) {
            if (pondData.daily[i].id === id) {
                foundIndex = i;
                break;
            }
        }

        if (foundIndex > -1) {
            var item = pondData.daily.splice(foundIndex, 1)[0];
            pondData.history.push({ 
                text: item.text, 
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
            });
            updateStreak();
            saveAndRefresh();
        }
    };

    // 4. Helper Functions
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
        localStorage.setItem('ProgressPond_V7', JSON.stringify(pondData));
        renderAll();
    }

    function renderAll() {
        // Render Active List
        var list = document.getElementById('dailyList');
        if (list) {
            var html = "";
            for (var i = 0; i < pondData.daily.length; i++) {
                var g = pondData.daily[i];
                html += '<li style="display:flex; align-items:center; gap:10px; margin-bottom:10px; background:white; padding:10px; border-radius:10px; border:1px solid #eee;">' +
                        '<input type="checkbox" onchange="toggleHop(' + g.id + ')">' +
                        '<span>' + g.text + '</span>' +
                        '</li>';
            }
            list.innerHTML = html || '<li style="color:#67a36a; text-align:center;">No hops yet... 🐸</li>';
        }

        // Render Water
        var wBtns = document.querySelectorAll('.drop-btn');
        wBtns.forEach(function(btn, i) {
            if (i < pondData.waterCount) btn.classList.add('active');
            else btn.classList.remove('active');
        });
        var wText = document.getElementById('waterCountText');
        if (wText) wText.textContent = pondData.waterCount + " / 8";

        // Render History
        var hList = document.getElementById('dailyHistoryList');
        if (hList) {
            var hHtml = "";
            var reversedHistory = pondData.history.slice().reverse();
            for (var j = 0; j < Math.min(reversedHistory.length, 10); j++) {
                hHtml += '<div>🌿 ' + reversedHistory[j].text + '</div>';
            }
            hList.innerHTML = hHtml || "-";
        }

        var mList = document.getElementById('moodHistoryList');
        if (mList) {
            var mHtml = "";
            var reversedMoods = pondData.moodLog.slice().reverse();
            for (var k = 0; k < Math.min(reversedMoods.length, 10); k++) {
                var m = reversedMoods[k];
                mHtml += '<div>' + m.icon + ' ' + m.val + ' <small>(' + m.time + ')</small></div>';
            }
            mList.innerHTML = mHtml || "-";
        }

        // Render Streak
        var sCount = document.getElementById('streakCount');
        if (sCount) sCount.textContent = pondData.streak;

        // Render Progress
        var total = pondData.daily.length + pondData.history.length;
        var percent = total ? Math.round((pondData.history.length / total) * 100) : 0;
        var pFill = document.getElementById('dailyProgress');
        var pText = document.getElementById('dailyProgressText');
        if (pFill) pFill.style.width = percent + '%';
        if (pText) pText.textContent = percent + '%';
    }
})();
