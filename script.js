(() => {
    // 1. State Management
    let goalsData = {
        daily: [],
        monthly: [],
        yearly: [],
        history: { daily: [], monthly: [], yearly: [] },
        streak: 0,
        lastDate: null,
        currentMood: 'happy',
        zenActive: false,
        waterCount: 0,
        recentHops: 0,
        lastBackup: null
    };

    const moodEmojis = {
        happy: "😊🐸",
        calm: "😌🐸",
        focused: "🧐🐸",
        tired: "😴🐸",
        null: "🐸"
    };

    const froggyQuotes = [
        "You're doing amazing, hop-py froggy!",
        "Every small hop counts towards a big jump!",
        "The pond is proud of your progress today! 🐸",
        "You're the most productive frog in the pond!",
        "Take it one lily pad at a time, you've got this!",
        "Ribbit! You're making waves today! 🌊",
        "Believe in your hops and you'll go far!",
        "Stay focused and stay froggie! 🌸"
    ];

    // 2. Initialization
    document.addEventListener('DOMContentLoaded', () => {
        displayCurrentDate();
        loadGoals();
        setupEventListeners();
        updateAffirmation();
    });

    function setupEventListeners() {
        // Goal Inputs
        ['daily', 'monthly', 'yearly'].forEach(type => {
            const input = document.getElementById(`${type}Input`);
            input?.addEventListener('keydown', (e) => { if (e.key === 'Enter') addGoal(type); });
            document.getElementById(`add${type.charAt(0).toUpperCase() + type.slice(1)}Btn`)?.addEventListener('click', () => addGoal(type));
        });

        // Morning Jumpstart
        document.getElementById('jumpstartBtn')?.addEventListener('click', () => {
            const incomplete = goalsData.daily.filter(g => !g.completed);
            if (incomplete.length === 0) return alert("No hops to jumpstart! 🐸");
            const randomGoal = incomplete[Math.floor(Math.random() * incomplete.length)];
            alert(`🌅 Focus on this hop first: "${randomGoal.text}"`);
            renderGoals('daily', randomGoal.id);
        });

        // Mood Buttons
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                goalsData.currentMood = btn.dataset.mood;
                saveGoals();
                renderGoals('daily'); // Re-sort based on energy if tired
            });
        });

        // Hydration Droplets
        document.querySelectorAll('.drop-btn').forEach((drop, index) => {
            drop.addEventListener('click', () => {
                goalsData.waterCount = (goalsData.waterCount === index + 1) ? index : index + 1;
                renderWater();
                saveGoals();
            });
        });

        // Zen Mode
        document.getElementById('zenToggle')?.addEventListener('click', () => {
            goalsData.zenActive = !goalsData.zenActive;
            applyZenMode();
            saveGoals();
        });

        // History Controls
        document.getElementById('historyToggle')?.addEventListener('click', (e) => {
            if (!['BUTTON', 'LABEL'].includes(e.target.tagName)) {
                document.getElementById('historyFooter').classList.toggle('collapsed');
                document.getElementById('historyChevron').textContent = document.getElementById('historyFooter').classList.contains('collapsed') ? '▼' : '▲';
            }
        });

        document.getElementById('bannerClose')?.addEventListener('click', () => document.getElementById('backupBanner').classList.add('hidden'));
        document.getElementById('exportBtn')?.addEventListener('click', () => exportData());
        document.getElementById('importFile')?.addEventListener('change', importData);
        document.getElementById('clearHistoryBtn')?.addEventListener('click', () => {
            if (confirm("🐸 Ribbit? Clear all achievements?")) {
                goalsData.history = { daily: [], monthly: [], yearly: [] };
                saveGoals();
                renderMasterHistory();
            }
        });
    }

    // 3. Core Logic
    function addGoal(type) {
        const input = document.getElementById(`${type}Input`);
        const energy = document.getElementById('energyLevel')?.value || 'high';
        if (!input?.value.trim()) return;

        goalsData[type].push({
            id: Date.now(),
            text: input.value.trim(),
            completed: false,
            isBigFrog: false,
            energy: energy
        });

        saveGoals();
        renderGoals(type);
        input.value = '';
        if (type === 'daily') updateAffirmation();
    }

    window.toggleGoal = (type, id) => {
        const goal = goalsData[type].find(g => g.id === id);
        if (goal) {
            goal.completed = !goal.completed;
            if (goal.completed) {
                goalsData.recentHops++;
                if (goalsData.recentHops >= 3) {
                    showRestReminder();
                    goalsData.recentHops = 0;
                }
                goalsData.history[type].push({
                    text: goal.text,
                    id: Date.now(),
                    mood: goalsData.currentMood,
                    date: new Date().toLocaleDateString(),
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                });
                if (type === 'daily') checkStreak();
            }
            saveGoals();
            renderGoals(type);
            renderMasterHistory();
        }
    };

    window.makeBigFrog = (id) => {
        goalsData.daily.forEach(g => {
            if (g.id === id) g.isBigFrog = !g.isBigFrog;
            else g.isBigFrog = false;
        });
        saveGoals();
        renderGoals('daily');
    };

    function checkStreak() {
        const today = new Date().setHours(0, 0, 0, 0);
        const last = goalsData.lastDate ? new Date(goalsData.lastDate).setHours(0, 0, 0, 0) : null;
        if (last !== today) {
            goalsData.streak++;
            goalsData.lastDate = new Date().toISOString();
            updateStreakUI();
        }
    }

    // 4. Rendering
    function renderGoals(type, highlightId = null) {
        const list = document.getElementById(`${type}List`);
        if (!list) return;

        let goals = [...goalsData[type]];
        if (type === 'daily') {
            goals.sort((a, b) => {
                if (a.isBigFrog) return -1;
                if (b.isBigFrog) return 1;
                if (goalsData.currentMood === 'tired') {
                    if (a.energy === 'low' && b.energy === 'high') return -1;
                    if (a.energy === 'high' && b.energy === 'low') return 1;
                }
                return 0;
            });
        }

        list.innerHTML = goals.map(goal => `
            <li class="goal-item ${goal.isBigFrog ? 'big-frog' : ''} ${goal.id === highlightId ? 'jumpstart-focus' : ''}">
                <input type="checkbox" onchange="toggleGoal('${type}', ${goal.id})" ${goal.completed ? 'checked' : ''}>
                <span style="${goal.completed ? 'text-decoration:line-through; color:var(--frog-green);' : ''}">${escapeHtml(goal.text)}</span>
                <div style="margin-left:auto; display:flex; gap:10px; align-items:center;">
                    ${type === 'daily' ? `<button class="btn-crown" onclick="makeBigFrog(${goal.id})" title="Toggle Big Frog">${goal.isBigFrog ? '👑' : '⚪'}</button>` : ''}
                    <button class="btn-delete" onclick="deleteGoal('${type}', ${goal.id})">×</button>
                </div>
            </li>
        `).join('') || `<li style="font-size:0.8rem; color:var(--frog-green); padding:10px 0;">No hops here yet... 🐸</li>`;
        updateProgress(type);
    }

    function renderMasterHistory() {
        const moodLog = document.getElementById('moodHistoryList');
        if (moodLog) {
            moodLog.innerHTML = [...goalsData.history.daily].reverse().map(h => `
                <div class="log-entry" style="${h.isHydration ? 'border-color: #7dd3fc; background: rgba(224, 242, 254, 0.3);' : ''}">
                    <div class="log-mood-icon">${moodEmojis[h.mood || 'null']}</div>
                    <div class="log-details">
                        <span>${escapeHtml(h.text)}</span>
                        <span class="log-time">${h.time}</span>
                    </div>
                    <button class="btn-delete" style="color:var(--pond-pink); font-size:1rem;" onclick="deleteHistoryItem('daily', ${h.id})">×</button>
                </div>
            `).join('') || '<span style="color:rgba(255,255,255,0.6); font-size:0.7rem;">No logs yet...</span>';
        }

        ['monthly', 'yearly'].forEach(type => {
            const container = document.getElementById(`${type}HistoryList`);
            if (container) {
                container.innerHTML = goalsData.history[type].map(h => `
                    <div style="font-size:0.8rem; padding:4px; display:flex; justify-content:space-between; color:white;">
                        <span>${escapeHtml(h.text)}</span>
                        <button onclick="deleteHistoryItem('${type}', ${h.id})" style="background:none; border:none; color:white; cursor:pointer;">×</button>
                    </div>
                `).join('') || '<span style="color:rgba(255,255,255,0.6); font-size:0.7rem;">None</span>';
            }
        });
    }

    function renderWater() {
        const drops = document.querySelectorAll('.drop-btn');
        drops.forEach((drop, index) => {
            index < goalsData.waterCount ? drop.classList.add('active') : drop.classList.remove('active');
        });
        if (goalsData.waterCount === 8) checkHydrationMilestone();
    }

    function checkHydrationMilestone() {
        const today = new Date().toLocaleDateString();
        if (!goalsData.history.daily.some(h => h.isHydration && h.date === today)) {
            goalsData.history.daily.push({
                text: "Fully Hydrated! 🌊",
                isHydration: true,
                date: today,
                mood: goalsData.currentMood,
                id: Date.now(),
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
            saveGoals();
            renderMasterHistory();
        }
    }

    // 5. Utility Helpers
    function updateProgress(type) {
        const goals = goalsData[type];
        const total = goals.length;
        const completed = goals.filter(g => g.completed).length;
        const percent = total ? Math.round((completed / total) * 100) : 0;

        const textEl = document.getElementById(`${type}ProgressText`);
        const barEl = document.getElementById(`${type}Progress`);
        const countEl = document.getElementById(`${type}CountText`);

        if (textEl) textEl.textContent = percent + '%';
        if (barEl) barEl.style.width = percent + '%';
        if (countEl) countEl.textContent = `(${completed} of ${total})`;
    }

    function applyZenMode() {
        const zenBtn = document.getElementById('zenToggle');
        if (goalsData.zenActive) {
            document.body.classList.add('zen-mode');
            zenBtn?.classList.add('active');
            if (zenBtn) zenBtn.textContent = "✨ Zen Active";
        } else {
            document.body.classList.remove('zen-mode');
            zenBtn?.classList.remove('active');
            if (zenBtn) zenBtn.textContent = "🧘‍♂️ Zen Mode";
        }
    }

    function showRestReminder() {
        const div = document.createElement('div');
        div.className = 'rest-popup';
        div.innerHTML = `<h3>☕ Time for a rest!</h3><p>You've finished 3 hops in a row. Take 5 minutes to breathe?</p><button class="btn btn-primary" onclick="this.parentElement.remove()">Okay! 🐸</button>`;
        document.body.appendChild(div);
    }

    function updateAffirmation() {
        const textEl = document.getElementById('affirmationText');
        if (textEl) textEl.textContent = froggyQuotes[Math.floor(Math.random() * froggyQuotes.length)];
    }

    function updateStreakUI() {
        const el = document.getElementById('streakCount');
        if (el) el.textContent = goalsData.streak;
    }

    function saveGoals() { localStorage.setItem('ProgressPond_Kawaii_Final', JSON.stringify(goalsData)); }

    function loadGoals() {
        const saved = localStorage.getItem('ProgressPond_Kawaii_Final');
        if (saved) {
            goalsData = JSON.parse(saved);
            if (!goalsData.history) goalsData.history = { daily: [], monthly: [], yearly: [] };
        }
        ['daily', 'monthly', 'yearly'].forEach(renderGoals);
        renderMasterHistory();
        renderWater();
        updateStreakUI();
        applyZenMode();
        if (goalsData.currentMood) {
            document.querySelector(`.mood-btn[data-mood="${goalsData.currentMood}"]`)?.classList.add('active');
        }
    }

    function exportData() {
        const blob = new Blob([JSON.stringify(goalsData, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `ProgressPond_Backup_${new Date().toISOString().slice(0,10)}.json`;
        a.click();
    }

    function importData(e) {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                goalsData = JSON.parse(event.target.result);
                saveGoals();
                location.reload();
            } catch (e) { alert("File error! Ribbit!"); }
        };
        reader.readAsText(e.target.files);
    }

    function displayCurrentDate() {
        const el = document.getElementById('currentDate');
        if (el) el.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    window.deleteGoal = (type, id) => { goalsData[type] = goalsData[type].filter(g => g.id !== id); saveGoals(); renderGoals(type); };
    window.deleteHistoryItem = (type, id) => { goalsData.history[type] = goalsData.history[type].filter(h => h.id !== id); saveGoals(); renderMasterHistory(); };
})();
