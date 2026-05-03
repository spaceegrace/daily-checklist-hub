// Progress Pond - Final Unified Script (V7)
(function() {
    // 1. Initial State
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

    // 2. Page Initialization
    window.onload = function() {
        // Load from LocalStorage
        var saved = localStorage.getItem('ProgressPond_Final_V7');
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

        // Set Random Motivation
        var motivationEl = document.getElementById('motivationText');
        if (motivationEl) {
            motivationEl.textContent = frogQuotes[Math.floor(Math.random() * frogQuotes.length)];
        }

        // --- Event Listeners ---
        
        // Add Hop Button
        var addBtn = document.getElementById('addDailyBtn');
        if (addBtn) addBtn.onclick = addHop;

        // Enter Key for Input
        var inputField = document.getElementById('dailyInput');
        if (inputField) {
            inputField.onkeypress = function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    addHop();
                }
            };
        }

        // Banner Close
        var bannerBtn = document.getElementById('bannerClose');
        if (bannerBtn) {
            bannerBtn.onclick = function() {
                document.getElementById('motivationBar').style.display = 'none';
            };
        }

        // Mood Buttons
        document.querySelectorAll('.mood-btn').forEach(function(btn) {
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

        // Water Droplets
        document.querySelectorAll('.drop-btn').forEach(function(btn, index) {
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

        // Achievement Bar Toggle
        var toggle = document.getElementById('historyToggle');
        if (toggle) {
            toggle.onclick = function() { 
                document.getElementById('historyFooter').classList.toggle('collapsed'); 
            };
        }

        // Reset Pond Button
        var reset = document.getElementById('resetPondBtn');
        if (reset) reset.onclick = function() {
            if (confirm("Reset today's hops and water? Logs will stay safe!")) {
                pondData.daily = []; 
                pondData.waterCount = 0; 
                saveAndRefresh();
                location.reload(); // Refresh to pick new motivation quote
            }
        };

        // Clear History Button
        var clear = document.getElementById('clearHistoryBtn');
        if (clear) clear.onclick = function() {
            if (confirm("⚠️ Delete ALL history logs permanently?")) {
                localStorage.removeItem('ProgressPond_Final_V7');
                location.reload();
            }
        };

        renderAll();
    };

    // 3. Main Functions
    function addHop() {
        var input = document.getElementById('dailyInput');
        if (!input) return;
        var text = input.value.trim();
        
        if (text !== "") {
            pondData.daily.push({ id: Date.now(), text: text });
            input.value = "";
            saveAndRefresh();
            input.focus();
        }
    }

    // Global toggle function for checkboxes
    window.toggleHop = function(id) {
        var foundIndex = -1;
        for (var i = 0; i < pondData.daily.length; i++) {
            if (pondData.daily[i].id === id) {
                foundIndex = i;
                break;
            }
        }

        if (foundIndex > -1) {
            var item = pondData.daily.splice(foundIndex, 1);
            pondData.history.push({ 
                text: item[0].text, 
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
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

    function saveAndRefresh() {
        localStorage.setItem('ProgressPond_Final_V7', JSON.stringify(pondData));
        renderAll();
    }

    // 4. Rendering UI
    function renderAll() {
        // Hops List
        var list = document.getElementById('dailyList');
        if (list) {
            var html = "";
            for (var i = 0; i < pondData.daily.length; i++) {
                var g = pondData.daily[i];
                html += '<li style="display:flex; align-items:center; gap:12px; margin-bottom:12px; background:white; padding:12px; border-radius:12px; border:1px solid #eee; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">' +
                        '<input type="checkbox" style="width:24px; height:24px; cursor:pointer;" onchange="toggleHop(' + g.id + ')">' +
                        '<span style="font-size:1.05rem; color:#5d4a4a;">' + g.text + '</span>' +
                        '</li>';
            }
            list.innerHTML = html || '<li style="color:#67a36a; text-align:center; padding:10px;">No hops yet... 🐸</li>';
        }

        // Water Droplets
        document.querySelectorAll('.drop-btn').forEach(function(btn, i) {
            if (i < pondData.waterCount) btn.classList.add('active');
            else btn.classList.remove('active');
        });
        
        var wText = document.getElementById('waterCountText');
        if (wText) wText.textContent = pondData.waterCount + " / 8";

        // Logs and Streak
        var sCount = document.getElementById('streakCount');
        if (sCount) sCount.textContent = pondData.streak || 0;

        var hList = document.getElementById('dailyHistoryList');
        if (hList) {
            var hHtml = "";
            var revHistory = pondData.history.slice().reverse();
            for (var j = 0; j < Math.min(revHistory.length, 15); j++) {
                hHtml += '<div style="font-size:0.75rem; padding:4px 0; border-bottom:1px solid rgba(255,255,255,0.1);">🌿 ' + revHistory[j].text + ' <small style="opacity:0.7">(' + revHistory[j].time + ')</small></div>';
            }
            hList.innerHTML = hHtml || "-";
        }

        var mList = document.getElementById('moodHistoryList');
        if (mList) {
            var mHtml = "";
            var revMoods = pondData.moodLog.slice().reverse();
            for (var k = 0; k < Math.min(revMoods.length, 15); k++) {
                mHtml += '<div style="font-size:0.75rem; padding:4px 0; border-bottom:1px solid rgba(255,255,255,0.1);">' + revMoods[k].icon + ' ' + revMoods[k].val + ' <small style="opacity:0.7">(' + revMoods[k].time + ')</small></div>';
            }
            mList.innerHTML = mHtml || "-";
        }

        // Progress Calculation
        var total = pondData.daily.length + pondData.history.length;
        var percent = total ? Math.round((pondData.history.length / total) * 100) : 0;
        var pFill = document.getElementById('dailyProgress');
        var pText = document.getElementById('dailyProgressText');
        if (pFill) pFill.style.width = percent + '%';
        if (pText) pText.textContent = percent + '%';
    }
})();
