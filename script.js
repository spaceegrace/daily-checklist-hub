(() => {
    let goalsData = { daily: [], monthly: [], yearly: [], history: { daily: [], monthly: [], yearly: [] }, streak: 0, lastDate: null, currentMood: 'happy', zenActive: false, waterCount: 0, recentHops: 0 };
    const moodEmojis = { happy: "😊🐸", calm: "😌🐸", focused: "🧐🐸", tired: "😴🐸", null: "🐸" };
    const quotes = ["You're doing amazing, hop-py froggy!", "Every small hop counts!", "Ribbit! You're making waves!", "Stay focused and stay froggie!"];

    document.addEventListener('DOMContentLoaded', () => {
        displayCurrentDate(); loadGoals(); setupEventListeners(); updateAffirmation();
    });

    function setupEventListeners() {
        ['daily', 'monthly', 'yearly'].forEach(type => {
            const input = document.getElementById(`${type}Input`);
            input?.addEventListener('keydown', (e) => { if (e.key === 'Enter') addGoal(type); });
            document.getElementById(`add${type.charAt(0).toUpperCase() + type.slice(1)}Btn`)?.addEventListener('click', () => addGoal(type));
        });

        document.getElementById('jumpstartBtn')?.addEventListener('click', () => {
            const inc = goalsData.daily.filter(g => !g.completed);
            if (!inc.length) return;
            const rand = inc[Math.floor(Math.random() * inc.length)];
            alert(`🌅 Focus on: "${rand.text}"`);
            renderGoals('daily', rand.id);
        });

        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                goalsData.currentMood = btn.dataset.mood;
                saveGoals(); renderGoals('daily');
            });
        });

        document.querySelectorAll('.drop-btn').forEach((btn, i) => {
            btn.addEventListener('click', () => {
                goalsData.waterCount = goalsData.waterCount === i + 1 ? i : i + 1;
                renderWater(); saveGoals();
            });
        });

        document.getElementById('zenToggle')?.addEventListener('click', () => {
            goalsData.zenActive = !goalsData.zenActive;
            applyZenMode(); saveGoals();
        });

        document.getElementById('historyToggle')?.addEventListener('click', (e) => {
            if (!['BUTTON', 'LABEL'].includes(e.target.tagName)) {
                document.getElementById('historyFooter').classList.toggle('collapsed');
                document.getElementById('historyChevron').textContent = document.getElementById('historyFooter').classList.contains('collapsed') ? '▼' : '▲';
            }
        });

        document.getElementById('bannerClose')?.addEventListener('click', () => document.getElementById('backupBanner').classList.add('hidden'));
        document.getElementById('exportBtn')?.addEventListener('click', exportData);
        document.getElementById('importFile')?.addEventListener('change', importData);
    }

    function addGoal(type) {
        const input = document.getElementById(`${type}Input`);
        const energy = document.getElementById('energyLevel')?.value || 'high';
        if (!input?.value.trim()) return;
        goalsData[type].push({ id: Date.now(), text: input.value.trim(), completed: false, isBigFrog: false, energy });
        saveGoals(); renderGoals(type); input.value = '';
    }

    window.toggleGoal = (type, id) => {
        const goal = goalsData[type].find(g => g.id === id);
        if (goal) {
            goal.completed = !goal.completed;
            if (goal.completed) {
                goalsData.recentHops++;
                if (goalsData.recentHops >= 3) { showRestReminder(); goalsData.recentHops = 0; }
                goalsData.history[type].push({ text: goal.text, id: Date.now(), mood: goalsData.currentMood, time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) });
                if (type === 'daily') checkStreak();
            }
            saveGoals(); renderGoals(type); renderMasterHistory();
        }
    };

    window.makeBigFrog = (id) => {
        goalsData.daily.forEach(g => g.isBigFrog = g.id === id ? !g.isBigFrog : false);
        saveGoals(); renderGoals('daily');
    };

    function checkStreak() {
        const today = new Date().setHours(0,0,0,0);
        const last = goalsData.lastDate ? new Date(goalsData.lastDate).setHours(0,0,0,0) : null;
        if (last !== today) { goalsData.streak++; goalsData.lastDate = new Date().toISOString(); updateStreakUI(); }
    }

    function renderGoals(type, highlightId = null) {
        const list = document.getElementById(`${type}List`);
        if (!list) return;
        let goals = [...goalsData[type]];
        if (type === 'daily') {
            goals.sort((a, b) => {
                if (a.isBigFrog) return -1;
                if (b.isBigFrog) return 1;
                if (goalsData.currentMood === 'tired') return a.energy === 'low' ? -1 : 1;
                return 0;
            });
        }
        list.innerHTML = goals.map(g => `
            <li class="goal-item ${g.isBigFrog ? 'big-frog' : ''} ${g.id === highlightId ? 'jumpstart-focus' : ''}">
                <input type="checkbox" onchange="toggleGoal('${type}', ${g.id})" ${g.completed ? 'checked' : ''}>
                <span style="${g.completed ? 'text-decoration:line-through' : ''}">${g.text}</span>
                <div style="margin-left:auto; display:flex; gap:10px;">
                    ${type === 'daily' ? `<button class="btn-crown" onclick="makeBigFrog(${g.id})">${g.isBigFrog ? '👑' : '⚪'}</button>` : ''}
                    <button class="btn-delete" onclick="deleteGoal('${type}', ${g.id})">×</button>
                </div>
            </li>
        `).join('') || '<li style="font-size:0.8rem; color:#9ed5a0;">No hops yet...</li>';
        updateProgress(type);
    }

    function renderMasterHistory() {
        document.getElementById('moodHistoryList').innerHTML = [...goalsData.history.daily].reverse().map(h => `
            <div style="display:flex; align-items:center; gap:10px; font-size:0.8rem; margin-bottom:5px;">
                <span>${moodEmojis[h.mood]}</span><span>${h.text}</span>
                <button onclick="deleteHistoryItem('daily', ${h.id})" style="margin-left:auto; border:none; background:none; color:white; cursor:pointer;">×</button>
            </div>
        `).join('') || '<span>None</span>';
        ['monthly', 'yearly'].forEach(type => {
            document.getElementById(`${type}HistoryList`).innerHTML = goalsData.history[type].map(h => `
                <div style="font-size:0.8rem; display:flex; justify-content:space-between; color:white;">
                    <span>${h.text}</span><button onclick="deleteHistoryItem('${type}', ${h.id})" style="background:none; border:none; color:white;">×</button>
                </div>
            `).join('') || '<span>None</span>';
        });
    }

    function renderWater() {
        document.querySelectorAll('.drop-btn').forEach((btn, i) => i < goalsData.waterCount ? btn.classList.add('active') : btn.classList.remove('active'));
    }

    function updateProgress(type) {
        const goals = goalsData[type];
        const total = goals.length, comp = goals.filter(g => g.completed).length;
        const per = total ? Math.round((comp / total) * 100) : 0;
        document.getElementById(`${type}ProgressText`).textContent = per + '%';
        document.getElementById(`${type}Progress`).style.width = per + '%';
        document.getElementById(`${type}CountText`).textContent = `(${comp} of ${total})`;
    }

    function applyZenMode() {
        document.body.classList.toggle('zen-mode', goalsData.zenActive);
        document.getElementById('zenToggle').classList.toggle('active', goalsData.zenActive);
    }

    function showRestReminder() {
        const div = document.createElement('div');
        div.className = 'rest-popup';
        div.innerHTML = `<h3>☕ Rest Time!</h3><p>You did 3 hops! Take 5 mins?</p><button class="btn btn-primary" onclick="this.parentElement.remove()">Okay!</button>`;
        document.body.appendChild(div);
    }

    function updateAffirmation() { document.getElementById('affirmationText').textContent = quotes[Math.floor(Math.random() * quotes.length)]; }
    function updateStreakUI() { document.getElementById('streakCount').textContent = goalsData.streak; }
    function saveGoals() { localStorage.setItem('ProgressPond_Final', JSON.stringify(goalsData)); }
    function loadGoals() {
        const saved = localStorage.getItem('ProgressPond_Final');
        if (saved) goalsData = JSON.parse(saved);
        ['daily', 'monthly', 'yearly'].forEach(renderGoals);
        renderMasterHistory(); renderWater(); updateStreakUI(); applyZenMode();
        if (goalsData.currentMood) document.querySelector(`.mood-btn[data-mood="${goalsData.currentMood}"]`)?.classList.add('active');
    }
    function exportData() {
        const blob = new Blob([JSON.stringify(goalsData)], { type: 'application/json' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = "PondBackup.json"; a.click();
    }
    function importData(e) {
        const reader = new FileReader();
        reader.onload = (ev) => { goalsData = JSON.parse(ev.target.result); saveGoals(); location.reload(); };
        reader.readAsText(e.target.files);
    }
    function displayCurrentDate() { document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }); }
    window.deleteGoal = (type, id) => { goalsData[type] = goalsData[type].filter(g => g.id !== id); saveGoals(); renderGoals(type); };
    window.deleteHistoryItem = (type, id) => { goalsData.history[type] = goalsData.history[type].filter(h => h.id !== id); saveGoals(); renderMasterHistory(); };
})();
